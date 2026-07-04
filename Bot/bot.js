const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const token = process.env.BOT_TOKEN;
if (!token) {
    console.error('❌ BOT_TOKEN is not set!');
    process.exit(1);
}

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

let db;
try {
    const fbApp = initializeApp(firebaseConfig);
    db = getFirestore(fbApp);
    console.log('✅ Firebase connected');
} catch (e) {
    console.error('❌ Firebase error:', e.message);
}

// ============= الأوامر =============
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, '👋 مرحباً!');
});

bot.onText(/\/chatid/, (msg) => {
    bot.sendMessage(msg.chat.id, `🆔 ${msg.chat.id}`);
});

// ============= معالج الرسائل (للربط) =============
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || text.startsWith('/')) return;

    console.log(`📩 "${text}" from ${chatId}`);

    try {
        if (!db) {
            await bot.sendMessage(chatId, '❌ خطأ في قاعدة البيانات');
            return;
        }

        const bindRef = doc(db, 'telegram_binds', text);
        const bindSnap = await getDoc(bindRef);

        if (bindSnap.exists()) {
            const data = bindSnap.data();
            if (data.status === 'pending') {
                await updateDoc(bindRef, {
                    status: 'completed',
                    telegramChatId: String(chatId),
                    completedAt: serverTimestamp()
                });
                await bot.sendMessage(chatId, '✅ تم ربط حسابك بنجاح!');
                console.log(`✅ ربط ناجح: ${chatId}`);
            } else {
                await bot.sendMessage(chatId, '❌ هذا الكود منتهي الصلاحية.');
            }
        } else {
            await bot.sendMessage(chatId, `📩 "${text}"\nاكتب /help للمساعدة`);
        }
    } catch (e) {
        console.error('❌ Error:', e.message);
        await bot.sendMessage(chatId, '❌ حدث خطأ، حاول مرة أخرى.');
    }
});

// ============= السيرفر =============
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('🤖 Bot is running!'));

app.listen(PORT, () => {
    console.log(`✅ Server on port ${PORT}`);
    console.log('✅ Bot is polling...');
});

console.log('🚀 Bot started!');
