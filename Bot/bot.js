// ============================================================
// BOT.JS - النسخة النهائية مع زر الربط التلقائي والدعم الكامل
// ============================================================

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const admin = require('firebase-admin');
const fs = require('fs');

// ============= الإعدادات الأساسية =============
const token = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!token) {
    console.error('❌ BOT_TOKEN غير موجود!');
    process.exit(1);
}
if (!ADMIN_CHAT_ID) {
    console.error('❌ TELEGRAM_CHAT_ID غير موجود!');
    process.exit(1);
}

console.log('🤖 جاري تشغيل البوت...');
console.log('📌 معرف المدير:', ADMIN_CHAT_ID);

// ============= تهيئة Firebase Admin =============
let db;
try {
    // محاولة تحميل ملف الخدمة من المسار السري (Render)
    const serviceAccountPath = '/etc/secrets/firebase-credentials.json';
    let serviceAccount;

    if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        console.log('✅ تم تحميل بيانات الخدمة من الملف السري');
    } else if (process.env.FIREBASE_CREDENTIALS_JSON) {
        // بديل: قراءة من متغير بيئة
        serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS_JSON);
        console.log('✅ تم تحميل بيانات الخدمة من متغير البيئة');
    } else {
        console.warn('⚠️ لم يتم العثور على بيانات الخدمة، سيتم استخدام وضع الاختبار');
        serviceAccount = { projectId: "zi-script-store" };
    }

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: "zi-script-store"
        });
        console.log('✅ تم تهيئة Firebase Admin بنجاح!');
    }
    db = admin.firestore();
} catch (error) {
    console.error('❌ خطأ في Firebase:', error.message);
    // محاولة تهيئة بدون مصادقة (قد لا تعمل عمليات الكتابة)
    try {
        if (!admin.apps.length) {
            admin.initializeApp({ projectId: "zi-script-store" });
        }
        db = admin.firestore();
        console.log('⚠️ تم تهيئة Firebase بدون مصادقة (قد تكون بعض العمليات مقيدة)');
    } catch (e) {
        console.error('❌ فشل تهيئة Firebase:', e.message);
        db = null;
    }
}

// ============= إنشاء البوت =============
const bot = new TelegramBot(token, {
    polling: {
        autoStart: true,
        interval: 300,
        params: { timeout: 10 }
    }
});

bot.on('polling_error', (error) => {
    console.error('❌ خطأ في الاستقصاء:', error.message);
    if (error.message && error.message.includes('409')) {
        console.log('🔄 409 Conflict - يوجد نسخة أخرى من البوت تعمل');
    }
});

// ============= خادم Express =============
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🤖 Zi Store Bot يعمل مع زر الربط التلقائي!');
});

app.listen(PORT, () => {
    console.log(`✅ الخادم يعمل على المنفذ ${PORT}`);
});

// ============= دوال مساعدة =============

// إرسال رسالة مع أزرار
async function sendMessageWithButtons(chatId, text, buttons) {
    try {
        const replyMarkup = { inline_keyboard: buttons };
        await bot.sendMessage(chatId, text, {
            parse_mode: 'Markdown',
            reply_markup: replyMarkup
        });
        console.log(`✅ تم إرسال رسالة مع أزرار إلى ${chatId}`);
        return true;
    } catch (error) {
        console.error(`❌ فشل إرسال الرسالة:`, error.message);
        return false;
    }
}

// التحقق من وجود طلب ربط معلق (أحدث طلب)
async function getPendingBind() {
    if (!db) return null;
    try {
        const bindsRef = db.collection('telegram_binds');
        const snapshot = await bindsRef
            .where('status', '==', 'pending')
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        let doc = null;
        let data = null;
        snapshot.forEach(d => { doc = d; data = d.data(); });
        return { doc, data };
    } catch (error) {
        console.error('خطأ في البحث عن طلب ربط:', error.message);
        return null;
    }
}

// التحقق مما إذا كان المستخدم قد ربط حسابه بالفعل
async function isUserLinked(chatId) {
    if (!db) return false;
    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef
            .where('telegramChatId', '==', String(chatId))
            .limit(1)
            .get();
        return !snapshot.empty;
    } catch (error) {
        console.error('خطأ في التحقق من الربط:', error.message);
        return false;
    }
}

// ============= الأمر /start =============
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    console.log(`📩 /start من ${chatId}`);

    // التحقق مما إذا كان المستخدم مرتبطاً بالفعل
    const linked = await isUserLinked(chatId);
    if (linked) {
        await bot.sendMessage(chatId,
            `✅ *أنت بالفعل مرتبط بحسابك في المتجر!*\n\nستصلك إشعارات الطلبات هنا.\n\nشكراً لاستخدامك Zi Store! 🚀`,
            { parse_mode: 'Markdown' }
        );
        return;
    }

    // البحث عن طلب ربط معلق
    const pending = await getPendingBind();

    let text, buttons;
    if (pending) {
        text = `👋 *مرحباً بك في بوت Zi Store!*\n\n🔗 يوجد طلب ربط معلق لحسابك. اضغط على الزر أدناه لربط حسابك فوراً.`;
        buttons = [
            [{ text: '🔗 ربط الحساب', callback_data: 'link_account' }],
            [{ text: '🆔 معرف الدردشة', callback_data: 'get_chatid' }]
        ];
    } else {
        text = `👋 *مرحباً بك في بوت Zi Store!*\n\n🔗 لربط حسابك، يرجى فتح الملف الشخصي في المتجر والضغط على "ربط تيليجرام"، ثم عد إلى هنا واضغط على الزر أدناه.`;
        buttons = [
            [{ text: '🔗 ربط الحساب', callback_data: 'link_account' }],
            [{ text: '🆔 معرف الدردشة', callback_data: 'get_chatid' }]
        ];
    }

    await sendMessageWithButtons(chatId, text, buttons);
});

// ============= الأمر /help =============
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId,
        `📋 *الأوامر المتاحة:*\n\n/start - بدء البوت\n/help - عرض المساعدة\n/chatid - عرض معرف الدردشة\n\n🔗 لربط حسابك، اضغط على زر "ربط الحساب"`,
        { parse_mode: 'Markdown' }
    );
});

// ============= الأمر /chatid =============
bot.onText(/\/chatid/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `🆔 معرف الدردشة الخاص بك: \`${chatId}\``, { parse_mode: 'Markdown' });
});

// ============= معالج الأزرار =============
bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    const messageId = callbackQuery.message.message_id;

    console.log(`🔘 تم الضغط على زر: ${data} من ${chatId}`);
    await bot.answerCallbackQuery(callbackQuery.id);

    if (data === 'link_account') {
        // التحقق أولاً من أن المستخدم لم يربط حسابه بالفعل
        const linked = await isUserLinked(chatId);
        if (linked) {
            await bot.sendMessage(chatId,
                `✅ *أنت بالفعل مرتبط بحسابك!*\n\nيمكنك الاستمتاع بإشعارات الطلبات. 🚀`,
                { parse_mode: 'Markdown' }
            );
            try { await bot.deleteMessage(chatId, messageId); } catch (e) {}
            return;
        }

        if (!db) {
            await bot.sendMessage(chatId, '❌ عطل في قاعدة البيانات. حاول مرة أخرى لاحقاً.');
            return;
        }

        try {
            // البحث عن طلب ربط معلق (أحدث طلب)
            const pending = await getPendingBind();

            if (!pending) {
                await bot.sendMessage(chatId,
                    `❌ لا يوجد طلب ربط معلق.

🔹 يرجى فتح الملف الشخصي في المتجر والضغط على "ربط تيليجرام" أولاً.

📌 ثم عد إلى هنا واضغط على زر "ربط الحساب" مرة أخرى.`
                );
                return;
            }

            const { doc, data: bindData } = pending;

            // ✅ تحديث حالة الربط إلى مكتمل
            await doc.ref.update({
                status: 'completed',
                telegramChatId: String(chatId),
                completedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // ✅ رسالة نجاح مع زر فتح المتجر
            const successText = `✅ *تم ربط الحساب بنجاح!* 🎉

👤 المستخدم: ${bindData.userName || bindData.userEmail || 'غير معروف'}
📧 البريد: ${bindData.userEmail || 'غير موجود'}

ستصلك إشعارات الطلبات هنا.

شكراً لاستخدامك Zi Store! 🚀`;

            const buttons = [
                [{ text: '🛒 فتح المتجر', url: 'https://zribi13-hub.github.io/Storezi/' }]
            ];

            await sendMessageWithButtons(chatId, successText, buttons);
            console.log(`✅ تم ربط المستخدم ${chatId} بنجاح`);

            // ✅ إشعار للمدير بالكود للتوثيق
            await bot.sendMessage(ADMIN_CHAT_ID,
                `🔗 *ربط جديد*\n\n👤 المستخدم: ${bindData.userName || bindData.userEmail || 'غير معروف'}\n📧 البريد: ${bindData.userEmail || 'غير موجود'}\n🆔 معرف الدردشة: ${chatId}\n🔑 الكود: ${doc.id}`
            );

            // ✅ حذف الرسالة القديمة التي تحتوي على زر الربط
            try {
                await bot.deleteMessage(chatId, messageId);
            } catch (e) {
                console.log('لم نتمكن من حذف الرسالة:', e.message);
            }

        } catch (error) {
            console.error('❌ خطأ في ربط الحساب:', error.message);
            await bot.sendMessage(chatId, '❌ حدث خطأ. حاول مرة أخرى.');
        }

    } else if (data === 'get_chatid') {
        await bot.sendMessage(chatId, `🆔 معرف الدردشة الخاص بك: \`${chatId}\``, { parse_mode: 'Markdown' });
    }
});

// ============= معالج الرسائل النصية (الدعم الكامل) =============
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // تجاهل الأوامر (لأنها تعالج في مكان آخر)
    if (!text || text.startsWith('/')) {
        return;
    }

    console.log(`📩 استلمنا نصاً: "${text}" من ${chatId}`);

    // أولاً: التحقق مما إذا كان المستخدم قد ربط حسابه بالفعل
    const linked = await isUserLinked(chatId);
    if (linked) {
        // إذا كان مرتبطاً، لا نرسل رسائل مزعجة، فقط نستجيب إذا طلب شيئاً.
        await bot.sendMessage(chatId,
            `✅ أنت مرتبط بالفعل. ستصل إليك إشعارات الطلبات هنا. 🚀`,
            { parse_mode: 'Markdown' }
        );
        return;
    }

    // ثانياً: محاولة تفسير النص ككود ربط (دعم الإدخال اليدوي)
    if (db) {
        try {
            const docRef = db.collection('telegram_binds').doc(text.trim());
            const docSnap = await docRef.get();

            if (docSnap.exists) {
                const data = docSnap.data();
                if (data.status === 'pending') {
                    await docRef.update({
                        status: 'completed',
                        telegramChatId: String(chatId),
                        completedAt: admin.firestore.FieldValue.serverTimestamp()
                    });

                    const successText = `✅ *تم ربط الحساب بنجاح!* 🎉

👤 المستخدم: ${data.userName || data.userEmail || 'غير معروف'}
📧 البريد: ${data.userEmail || 'غير موجود'}

ستصلك إشعارات الطلبات هنا.

شكراً لاستخدامك Zi Store! 🚀`;

                    const buttons = [
                        [{ text: '🛒 فتح المتجر', url: 'https://zribi13-hub.github.io/Storezi/' }]
                    ];

                    await sendMessageWithButtons(chatId, successText, buttons);
                    console.log(`✅ تم ربط المستخدم ${chatId} بالكود: ${text}`);

                    await bot.sendMessage(ADMIN_CHAT_ID,
                        `🔗 *ربط جديد (عبر كود)*\n\n👤 المستخدم: ${data.userName || data.userEmail || 'غير معروف'}\n📧 البريد: ${data.userEmail || 'غير موجود'}\n🆔 معرف الدردشة: ${chatId}`
                    );
                    return;
                } else {
                    await bot.sendMessage(chatId,
                        `⚠️ هذا الكود مستخدم بالفعل (الحالة: ${data.status}). يرجى طلب كود جديد من المتجر.`
                    );
                    return;
                }
            }
        } catch (e) {
            console.error('خطأ في معالجة الكود:', e.message);
        }
    }

    // إذا لم يكن النص كوداً صالحاً، نرسل رسالة تحتوي على زر الربط
    const pending = await getPendingBind();
    let textMsg, buttons;

    if (pending) {
        textMsg = `👋 *مرحباً بك في بوت Zi Store!*\n\n🔗 يوجد طلب ربط معلق. اضغط على الزر أدناه لربط حسابك فوراً.`;
        buttons = [
            [{ text: '🔗 ربط الحساب', callback_data: 'link_account' }],
            [{ text: '🆔 معرف الدردشة', callback_data: 'get_chatid' }]
        ];
    } else {
        textMsg = `👋 *مرحباً بك في بوت Zi Store!*\n\n🔗 لربط حسابك، يرجى فتح الملف الشخصي في المتجر والضغط على "ربط تيليجرام"، ثم عد إلى هنا واضغط على الزر أدناه.`;
        buttons = [
            [{ text: '🔗 ربط الحساب', callback_data: 'link_account' }],
            [{ text: '🆔 معرف الدردشة', callback_data: 'get_chatid' }]
        ];
    }

    await sendMessageWithButtons(chatId, textMsg, buttons);
});

// ============= إشعار بدء التشغيل =============
console.log('🚀 تم تشغيل بوت Zi Store بنجاح مع زر الربط التلقائي!');

// ============= إغلاق آمن =============
const shutdown = (signal) => {
    console.log(`⚠️ تم استلام إشارة ${signal}. جاري الإيقاف...`);
    bot.stopPolling().then(() => process.exit(0));
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
