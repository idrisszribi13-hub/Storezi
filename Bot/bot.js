const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// ============= التوكن =============
const token = process.env.BOT_TOKEN;
if (!token) {
    console.error('❌ BOT_TOKEN is not set!');
    process.exit(1);
}

// ============= البوت =============
const bot = new TelegramBot(token, { polling: true });

// ============= Firebase Admin =============
const admin = require('firebase-admin');

// تهيئة Firebase Admin (بدون مصادقة)
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: "zi-script-store"
        });
        console.log('✅ Firebase Admin initialized!');
    } catch (error) {
        console.error('❌ Firebase Admin error:', error.message);
        // محاولة تهيئة بدون credentials (للقراءة فقط)
        try {
            admin.initializeApp({
                projectId: "zi-script-store"
            });
            console.log('✅ Firebase Admin initialized (without credentials)');
        } catch (e) {
            console.error('❌ Firebase Admin failed:', e.message);
        }
    }
}

const db = admin.firestore();

// ============= أوامر البوت =============

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '👋 مرحباً بك في Zi Store Bot!\n\nللمساعدة اكتب /help');
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '📋 الأوامر:\n\n/start - بدء البوت\n/help - عرض المساعدة\n/chatid - معرف الدردشة');
});

bot.onText(/\/chatid/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `🆔 معرف الدردشة: ${chatId}`);
});

// ============= معالج الرسائل (لكود الربط) =============

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || text.startsWith('/')) {
        return;
    }

    console.log(`📩 استلمت: "${text}" من ${chatId}`);

    try {
        // البحث عن كود الربط في Firestore
        const docRef = db.collection('telegram_binds').doc(text);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const data = docSnap.data();
            console.log('📄 البيانات:', data);

            if (data.status === 'pending') {
                // تحديث حالة الربط
                await docRef.update({
                    status: 'completed',
                    telegramChatId: String(chatId),
                    completedAt: admin.firestore.FieldValue.serverTimestamp()
                });

                await bot.sendMessage(chatId, '✅ **تم ربط حسابك بنجاح!**\n\nستستلم إشعارات الطلبات هنا.');
                console.log(`✅ تم ربط المستخدم ${chatId} بالكود: ${text}`);
            } else {
                await bot.sendMessage(chatId, '❌ هذا الكود منتهي الصلاحية أو مستخدم بالفعل.');
            }
        } else {
            // ليس كود ربط
            await bot.sendMessage(chatId, `📩 لقد أرسلت: "${text}"\n\nللمساعدة اكتب /help`);
        }
    } catch (error) {
        console.error('❌ خطأ:', error.message);
        await bot.sendMessage(chatId, '❌ حدث خطأ. الرجاء المحاولة مرة أخرى.');
    }
});

// ============= السيرفر =============

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🤖 Zi Store Bot is running!');
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log('✅ Bot is polling for messages...');
});

console.log('🚀 Zi Store Bot started successfully!');
