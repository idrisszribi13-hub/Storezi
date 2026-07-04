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

// ============= Firebase =============
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, updateDoc, serverTimestamp } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyBwDTCxzd6aoue-NTLI2u4ouK-M37alwUw",
    authDomain: "zi-script-store.firebaseapp.com",
    projectId: "zi-script-store",
    storageBucket: "zi-script-store.firebasestorage.app",
    messagingSenderId: "925432917209",
    appId: "1:925432917209:web:ee9b329911d95d831622c8"
};

// تهيئة Firebase
let db;
try {
    const fbApp = initializeApp(firebaseConfig);
    db = getFirestore(fbApp);
    console.log('✅ Firebase connected successfully!');
} catch (error) {
    console.error('❌ Firebase connection failed:', error.message);
    db = null;
}

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

    // تجاهل الأوامر
    if (!text || text.startsWith('/')) {
        return;
    }

    console.log(`📩 استلمت: "${text}" من ${chatId}`);

    // التأكد من أن Firebase يعمل
    if (!db) {
        console.error('❌ Firebase not initialized!');
        await bot.sendMessage(chatId, '❌ خطأ في قاعدة البيانات. الرجاء المحاولة لاحقاً.');
        return;
    }

    try {
        // البحث عن كود الربط في Firebase
        const bindRef = doc(db, 'telegram_binds', text);
        const bindSnap = await getDoc(bindRef);

        if (bindSnap.exists()) {
            const data = bindSnap.data();
            console.log('📄 البيانات:', data);

            if (data.status === 'pending') {
                // تحديث حالة الربط
                await updateDoc(bindRef, {
                    status: 'completed',
                    telegramChatId: String(chatId),
                    completedAt: serverTimestamp()
                });

                await bot.sendMessage(chatId, '✅ **تم ربط حسابك بنجاح!**\n\nستستلم إشعارات الطلبات هنا.');
                console.log(`✅ تم ربط المستخدم ${chatId} بالكود: ${text}`);
            } else {
                await bot.sendMessage(chatId, '❌ هذا الكود منتهي الصلاحية أو مستخدم بالفعل.');
            }
        } else {
            // ليس كود ربط، رسالة عادية
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
