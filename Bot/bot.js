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

const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);

// ============= معالج الأوامر =============

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '👋 مرحباً بك في **Zi Store Bot**!\n\nأنا هنا لمساعدتك في التسوق. استخدم الأوامر التالية:\n/help - للحصول على المساعدة');
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '📋 **الأوامر المتاحة:**\n\n/start - بدء البوت\n/help - عرض المساعدة\n/products - عرض المنتجات\n/chatid - معرف الدردشة الخاص بك');
});

bot.onText(/\/products/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '🛍️ **المنتجات المتاحة:**\n\n1️⃣ منتج 1 - 10 دينار\n2️⃣ منتج 2 - 20 دينار\n3️⃣ منتج 3 - 30 دينار');
});

bot.onText(/\/chatid/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `🆔 **Chat ID الخاص بك هو:** \`${chatId}\``, { parse_mode: 'Markdown' });
});

// ============= Webhook للربط =============
const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || !message.text) {
            return res.sendStatus(200);
        }

        const chatId = message.chat.id;
        const text = message.text.trim();

        if (text.startsWith('/')) {
            return res.sendStatus(200);
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
                await bot.sendMessage(chatId, '✅ **تم ربط حسابك بنجاح!**\n\nستستلم إشعارات الطلبات هنا.');
            } else {
                await bot.sendMessage(chatId, '❌ هذا الكود منتهي الصلاحية أو مستخدم بالفعل.');
            }
        } else {
            await bot.sendMessage(chatId, '❌ **كود غير صحيح!**\n\nتأكد من الكود الذي ظهر في الموقع.');
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(200);
    }
});

// ============= معالج الرسائل العامة =============

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text && text.startsWith('/')) {
        return;
    }

    if (text) {
        bot.sendMessage(chatId, `📩 لقد أرسلت: "${text}"\n\nللمساعدة اكتب /help`);
    }
});

// ============= تشغيل السيرفر =============

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🤖 Zi Store Bot is running!');
});

app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log('✅ Bot is polling for messages...');
    console.log('✅ Webhook endpoint: /webhook');
});

console.log('🚀 Zi Store Bot started successfully!');
