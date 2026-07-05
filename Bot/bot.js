const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const admin = require('firebase-admin');
const fs = require('fs');

// ============= التوكن من متغيرات البيئة =============
const token = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_CHAT_ID; // ✅ استخدم TELEGRAM_CHAT_ID

if (!token) {
    console.error('❌ BOT_TOKEN is not set!');
    process.exit(1);
}

if (!ADMIN_CHAT_ID) {
    console.error('❌ TELEGRAM_CHAT_ID is not set!');
    process.exit(1);
}

console.log('🤖 Starting bot...');
console.log('📌 Admin Chat ID:', ADMIN_CHAT_ID);

// ============= البوت =============
const bot = new TelegramBot(token, { polling: true });

// ============= Firebase Admin =============
let db;
try {
    const serviceAccountPath = '/etc/secrets/firebase-credentials.json';
    let serviceAccount;
    
    if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        console.log('✅ Service Account loaded');
    } else {
        serviceAccount = { projectId: "zi-script-store" };
    }

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: "zi-script-store"
        });
        console.log('✅ Firebase Admin initialized!');
    }
    db = admin.firestore();
} catch (error) {
    console.error('❌ Firebase error:', error.message);
    db = null;
}

// ============= السيرفر =============
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🤖 Zi Store Bot is running!');
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

// ============= أوامر البوت =============

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `👋 Welcome to Zi Store Bot!

🔗 To link your account:
1. Open your profile in Zi Store
2. Click "Link Telegram"
3. Copy the code
4. Send it here

📋 Commands:
/help - Show help
/chatid - Your Chat ID`);
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `📋 Commands:

/start - Start the bot
/help - Show help
/chatid - Your Chat ID

🔗 To link your account:
Send the code you get from your profile.`);
});

bot.onText(/\/chatid/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `🆔 Your Chat ID: ${chatId}`);
});

// ============= معالج الرسائل =============

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || text.startsWith('/')) {
        return;
    }

    console.log(`📩 Received: "${text}" from ${chatId}`);

    if (!db) {
        await bot.sendMessage(chatId, '❌ Database error. Try again later.');
        return;
    }

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

                await bot.sendMessage(chatId, `✅ **Account linked successfully!** 🎉

You will receive order notifications here.
Thank you for using Zi Store! 🚀`);
                
                console.log(`✅ User ${chatId} linked with code: ${text}`);
                
                await bot.sendMessage(ADMIN_CHAT_ID, 
                    `🔗 New Link\n\nUser: ${data.userName || data.userEmail || 'Unknown'}\nEmail: ${data.userEmail || 'N/A'}\nChat ID: ${chatId}`
                );
            } else {
                await bot.sendMessage(chatId, '❌ This code is already used or expired.');
            }
        } else {
            await bot.sendMessage(chatId, `❌ Invalid code.

🔍 Make sure you copied the code correctly.

📌 To get a new code:
1. Open your profile in Zi Store
2. Click "Link Telegram"
3. Copy the new code

📋 For help type /help`);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        await bot.sendMessage(chatId, '❌ Error occurred. Try again.');
    }
});

console.log('🚀 Zi Store Bot started successfully!');

// ============= إغلاق نظيف =============
const shutdown = (signal) => {
    console.log(`⚠️ Received ${signal}. Stopping...`);
    bot.stopPolling().then(() => process.exit(0));
};

process.on('SIGTERM', () => shutdown('SIGTERM')); 
process.on('SIGINT', () => shutdown('SIGINT'));
