// ========================================
// BOT.JS - نسخة محسّنة مع زر الربط التلقائي
// ========================================

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const admin = require('firebase-admin');
const fs = require('fs');

// ============= Tokens & Config =============
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

// ============= Firebase Admin =============
let db;
try {
    // محاولة تحميل ملف الخدمة من المسار الآمن
    const serviceAccountPath = '/etc/secrets/firebase-credentials.json';
    let serviceAccount;
    
    if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        console.log('✅ تم تحميل بيانات الخدمة من secrets');
    } else {
        console.warn('⚠️ لم يتم العثور على ملف الخدمة، سيتم استخدام وضع التجربة');
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
    // محاولة تهيئة بدون مصادقة (للاختبار)
    try {
        if (!admin.apps.length) {
            admin.initializeApp({ projectId: "zi-script-store" });
        }
        db = admin.firestore();
        console.log('⚠️ تم تهيئة Firebase بدون مصادقة (قد لا تعمل عمليات القراءة)');
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

// ============= دالة إرسال رسالة مع أزرار =============
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

// ============= الأمر /start =============
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    
    // التحقق من وجود طلب ربط معلق لهذا المستخدم (نبحث بدون فلترة chatId لأننا لا نعرفه بعد)
    let hasPending = false;
    if (db) {
        try {
            const bindsRef = db.collection('telegram_binds');
            const snapshot = await bindsRef
                .where('status', '==', 'pending')
                .limit(1)
                .get();
            hasPending = !snapshot.empty;
        } catch (e) {
            console.error('خطأ في قراءة قاعدة البيانات:', e.message);
        }
    }

    // رسالة ترحيبية مع زر الربط (موجود دائماً)
    const welcomeText = hasPending 
        ? `👋 *مرحباً بك في بوت Zi Store!*\n\n🔗 اضغط على الزر أدناه لربط حسابك فوراً.`
        : `👋 *مرحباً بك في بوت Zi Store!*\n\n🔗 لربط حسابك، يرجى فتح الموقع والضغط على "ربط تيليجرام"، ثم عد إلى هنا واضغط على الزر أدناه.`;

    const buttons = [
        [{ text: '🔗 ربط الحساب', callback_data: 'link_account' }],
        [{ text: '🆔 معرف الدردشة', callback_data: 'get_chatid' }]
    ];

    await sendMessageWithButtons(chatId, welcomeText, buttons);
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 
        `📋 *الأوامر المتاحة:*\n\n/start - بدء البوت\n/help - عرض المساعدة\n/chatid - عرض معرف الدردشة\n\n🔗 لربط حسابك، اضغط على زر "ربط الحساب"`, 
        { parse_mode: 'Markdown' }
    );
});

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
        if (!db) {
            await bot.sendMessage(chatId, '❌ عطل في قاعدة البيانات. حاول مرة أخرى لاحقاً.');
            return;
        }

        try {
            // البحث عن طلب ربط معلق (أحدث طلب)
            const bindsRef = db.collection('telegram_binds');
            const snapshot = await bindsRef
                .where('status', '==', 'pending')
                .orderBy('createdAt', 'desc')
                .limit(1)
                .get();

            if (snapshot.empty) {
                await bot.sendMessage(chatId, 
                    `❌ لا يوجد طلب ربط معلق.

🔹 يرجى فتح الملف الشخصي في المتجر والضغط على "ربط تيليجرام" أولاً.

📌 ثم عد إلى هنا واضغط على زر "ربط الحساب".`
                );
                return;
            }

            let bindDoc = null;
            let bindData = null;
            snapshot.forEach(doc => {
                bindDoc = doc;
                bindData = doc.data();
            });

            // ✅ تحديث حالة الربط مباشرة
            await bindDoc.ref.update({
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

            // ✅ إشعار للمدير
            await bot.sendMessage(ADMIN_CHAT_ID, 
                `🔗 *ربط جديد*\n\n👤 المستخدم: ${bindData.userName || bindData.userEmail || 'غير معروف'}\n📧 البريد: ${bindData.userEmail || 'غير موجود'}\n🆔 معرف الدردشة: ${chatId}`
            );

            // ✅ حذف الرسالة السابقة التي تحتوي على زر الربط
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

// ============= معالج الرسائل النصية (كود احتياطي) =============
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || text.startsWith('/')) {
        return;
    }

    console.log(`📩 استلمنا: "${text}" من ${chatId}`);

    // محاولة تفسير النص ككود ربط (للتوافق مع الإصدارات القديمة)
    if (db) {
        try {
            const docRef = db.collection('telegram_binds').doc(text);
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
                }
            }
        } catch (e) {
            console.error('خطأ في معالجة الكود:', e.message);
        }
    }

    // إذا لم يكن كوداً صالحاً، نرسل رسالة الترحيب مع الزر
    const welcomeText = `👋 *مرحباً بك في بوت Zi Store!*

🔗 لربط حسابك، يرجى الضغط على الزر أدناه.`;

    const buttons = [
        [{ text: '🔗 ربط الحساب', callback_data: 'link_account' }],
        [{ text: '🆔 معرف الدردشة', callback_data: 'get_chatid' }]
    ];

    await sendMessageWithButtons(chatId, welcomeText, buttons);
});

console.log('🚀 تم تشغيل بوت Zi Store بنجاح مع زر الربط التلقائي!');

// ============= إغلاق آمن =============
const shutdown = (signal) => {
    console.log(`⚠️ تم استلام إشارة ${signal}. جاري الإيقاف...`);
    bot.stopPolling().then(() => process.exit(0));
};

process.on('SIGTERM', () => shutdown('SIGTERM')); 
process.on('SIGINT', () => shutdown('SIGINT'));
