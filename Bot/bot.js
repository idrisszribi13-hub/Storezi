const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// تأكد من وجود التوكن
const token = process.env.BOT_TOKEN;
if (!token) {
    console.error('❌ BOT_TOKEN is not set!');
    process.exit(1);
}

// إنشاء البوت
const bot = new TelegramBot(token, { polling: true });

// ============= معالج الأوامر =============

// أمر /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '👋 مرحباً بك في **Zi Store Bot**!\n\nأنا هنا لمساعدتك في التسوق. استخدم الأوامر التالية:\n/help - للحصول على المساعدة');
});

// أمر /help
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '📋 **الأوامر المتاحة:**\n\n/start - بدء البوت\n/help - عرض المساعدة\n/products - عرض المنتجات');
});

// أمر /products
bot.onText(/\/products/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '🛍️ **المنتجات المتاحة:**\n\n1️⃣ منتج 1 - 10 دينار\n2️⃣ منتج 2 - 20 دينار\n3️⃣ منتج 3 - 30 دينار');
});
// ============= Chat ID ============
bot.onText(/\/chatid/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `🆔 **Chat ID الخاص بك هو:** \`${chatId}\``, { parse_mode: 'Markdown' });
});
// ============= معالج الرسائل العامة =============

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // تجاهل الأوامر (لأنها تعالج أعلاه)
    if (text && text.startsWith('/')) {
        return;
    }

    // الرد على الرسائل النصية العادية
    if (text) {
        bot.sendMessage(chatId, `📩 لقد أرسلت: "${text}"\n\nللمساعدة اكتب /help`);
    }
});

// ============= تشغيل السيرفر (لـ Render) =============

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🤖 Zi Store Bot is running!');
});

app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log('✅ Bot is polling for messages...');
});

console.log('🚀 Zi Store Bot started successfully!');
