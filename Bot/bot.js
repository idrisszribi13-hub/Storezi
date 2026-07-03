const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = '8687744794:AAGeeNrEU-iQLRmg3dLvYkWhddtYo_sJ1tc';
const ADMIN_CHAT_ID = '7434624478';

const bot = new TelegramBot(TOKEN, { polling: true });
const app = express();
const PORT = process.env.PORT || 3000;

// ===== أمر /start =====
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 
        `👋 *مرحباً بك في بوت ZI Store!*\n\n` +
        `📌 للربط مع الموقع:\n` +
        `1️⃣ افتح الموقع واضغط "ربط تليجرام"\n` +
        `2️⃣ سيظهر لك كود ربط\n` +
        `3️⃣ أرسل الكود هنا\n\n` +
        `🔗 الموقع: https://idrisszribi13-hub.github.io/Storezi/`,
        { parse_mode: 'Markdown' }
    );
});

// ===== استقبال الرسائل =====
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    if (!text || text === '/start') return;
    
    bot.sendMessage(chatId, 
        `✅ *تم استلام كودك!*\n\n` +
        `📌 سيتم ربط حسابك قريباً.\n` +
        `إذا كنت تريد مساعدة، أرسل /start`,
        { parse_mode: 'Markdown' }
    );
    
    // إشعار للإدارة
    bot.sendMessage(ADMIN_CHAT_ID,
        `📩 *رسالة جديدة*\n\n` +
        `👤 المستخدم: ${msg.from.first_name || 'Unknown'}\n` +
        `🆔 Chat ID: ${chatId}\n` +
        `📝 الرسالة: ${text}`,
        { parse_mode: 'Markdown' }
    );
});

// ===== صفحة الويب =====
app.get('/', (req, res) => {
    res.send('🤖 ZI Store Bot is running!');
});

app.listen(PORT, () => {
    console.log(`🤖 Bot is running on port ${PORT}`);
});
