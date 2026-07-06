// ========================================
// BOT.JS - النسخة النهائية مع زر الربط المباشر
// ========================================

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const admin = require('firebase-admin');
const fs = require('fs');

// ============= Tokens =============
const token = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

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

// ============= Firebase Admin =============
let db;
try {
    const serviceAccountPath = '/etc/secrets/firebase-credentials.json';
    let serviceAccount;
    
    if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        console.log('✅ Service Account loaded from secrets');
    } else {
        console.warn('⚠️ Service Account not found, using fallback');
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
    try {
        if (!admin.apps.length) {
            admin.initializeApp({ projectId: "zi-script-store" });
        }
        db = admin.firestore();
        console.log('⚠️ Firebase initialized without auth');
    } catch (e) {
        console.error('❌ Firebase failed:', e.message);
        db = null;
    }
}

// ============= Bot Instance =============
const bot = new TelegramBot(token, { 
    polling: {
        autoStart: true,
        interval: 300,
        params: { timeout: 10 }
    }
});

bot.on('polling_error', (error) => {
    console.error('❌ Polling error:', error.message);
    if (error.message && error.message.includes('409')) {
        console.log('🔄 409 Conflict - Another instance is running');
    }
});

// ============= Express Server =============
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🤖 Zi Store Bot is running with direct link button!');
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

// ============= Function to Send Message with Buttons =============
async function sendMessageWithButtons(chatId, text, buttons) {
    try {
        const replyMarkup = { inline_keyboard: buttons };
        await bot.sendMessage(chatId, text, {
            parse_mode: 'Markdown',
            reply_markup: replyMarkup
        });
        console.log(`✅ Message with buttons sent to ${chatId}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to send message:`, error.message);
        return false;
    }
}

// ============= الأمر /start =============
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    
    // تحقق إذا كان هناك طلب ربط معلق لهذا المستخدم
    let hasPending = false;
    if (db) {
        try {
            const bindsRef = db.collection('telegram_binds');
            const snapshot = await bindsRef
                .where('status', '==', 'pending')
                .limit(1)
                .get();
            hasPending = !snapshot.empty;
        } catch (e) {}
    }

    const welcomeText = hasPending 
        ? `👋 *Welcome to ZI Store Bot!*\n\n🔗 Click the button below to link your account immediately.`
        : `👋 *Welcome to ZI Store Bot!*\n\n🔗 To link your account, please open the store website, click "Link Telegram", then come back here and click the button below.`;

    const buttons = [
        [{ text: '🔗 Link Account', callback_data: 'link_account' }],
        [{ text: '🆔 Get Chat ID', callback_data: 'get_chatid' }]
    ];

    await sendMessageWithButtons(chatId, welcomeText, buttons);
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `📋 *Available Commands:*\n\n/start - Start the bot\n/help - Show help\n/chatid - Get your Chat ID\n\n🔗 To link your account, click the "Link Account" button`, { parse_mode: 'Markdown' });
});

bot.onText(/\/chatid/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `🆔 Your Chat ID: \`${chatId}\``, { parse_mode: 'Markdown' });
});

// ============= معالج الأزرار =============
bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    const messageId = callbackQuery.message.message_id;

    console.log(`🔘 Button clicked: ${data} from ${chatId}`);

    await bot.answerCallbackQuery(callbackQuery.id);

    if (data === 'link_account') {
        if (!db) {
            await bot.sendMessage(chatId, '❌ Database error. Please try again later.');
            return;
        }

        try {
            // البحث عن طلب ربط معلق لهذا المستخدم
            const bindsRef = db.collection('telegram_binds');
            const snapshot = await bindsRef
                .where('status', '==', 'pending')
                .limit(1)
                .get();

            if (snapshot.empty) {
                await bot.sendMessage(chatId, `❌ No pending link request found.

🔹 Please open your profile in the store and click "Link Telegram" first.

📌 Then come back here and click the "Link Account" button.`);
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

            // ✅ رسالة نجاح مع زر فتح المتجر (بدون عرض الكود)
            const successText = `✅ *Account linked successfully!* 🎉

👤 User: ${bindData.userName || bindData.userEmail || 'Unknown'}
📧 Email: ${bindData.userEmail || 'N/A'}

You will receive order notifications here.

Thank you for using ZI Store! 🚀`;

            const buttons = [
                [{ text: '🛒 Open Store', url: 'https://zribi13-hub.github.io/Storezi/' }]
            ];

            await sendMessageWithButtons(chatId, successText, buttons);
            
            console.log(`✅ User ${chatId} linked successfully`);

            // ✅ إشعار للمدير (مع الكود للتوثيق فقط)
            await bot.sendMessage(ADMIN_CHAT_ID, 
                `🔗 *New Link*\n\n👤 User: ${bindData.userName || bindData.userEmail || 'Unknown'}\n📧 Email: ${bindData.userEmail || 'N/A'}\n🆔 Chat ID: ${chatId}\n🔑 Code: ${bindDoc.id}`
            );

            // ✅ حذف الرسالة السابقة (التي تحتوي على زر الربط)
            try {
                await bot.deleteMessage(chatId, messageId);
            } catch (e) {
                console.log('Could not delete message:', e.message);
            }

        } catch (error) {
            console.error('❌ Error linking account:', error.message);
            await bot.sendMessage(chatId, '❌ An error occurred. Please try again.');
        }

    } else if (data === 'get_chatid') {
        await bot.sendMessage(chatId, `🆔 Your Chat ID: \`${chatId}\``, { parse_mode: 'Markdown' });
    }
});

// ============= معالج الرسائل النصية =============
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // تجاهل الأوامر والرسائل التي تبدأ بـ /
    if (!text || text.startsWith('/')) {
        return;
    }

    console.log(`📩 Received: "${text}" from ${chatId}`);

    // إذا كان النص عبارة عن كود ربط، نربط مباشرة (للتوافق مع القديم)
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

                    const successText = `✅ *Account linked successfully!* 🎉

👤 User: ${data.userName || data.userEmail || 'Unknown'}
📧 Email: ${data.userEmail || 'N/A'}

You will receive order notifications here.

Thank you for using ZI Store! 🚀`;

                    const buttons = [
                        [{ text: '🛒 Open Store', url: 'https://zribi13-hub.github.io/Storezi/' }]
                    ];

                    await sendMessageWithButtons(chatId, successText, buttons);
                    
                    console.log(`✅ User ${chatId} linked with code: ${text}`);
                    
                    await bot.sendMessage(ADMIN_CHAT_ID, 
                        `🔗 *New Link (via code)*\n\n👤 User: ${data.userName || data.userEmail || 'Unknown'}\n📧 Email: ${data.userEmail || 'N/A'}\n🆔 Chat ID: ${chatId}`
                    );
                    return;
                }
            }
        } catch (e) {
            console.error('Error processing code:', e.message);
        }
    }

    // إذا لم يكن كود ربط صحيحاً، أرسل رسالة مع زر الربط
    const welcomeText = `👋 *Welcome to ZI Store Bot!*

🔗 To link your account, please click the button below.`;

    const buttons = [
        [{ text: '🔗 Link Account', callback_data: 'link_account' }],
        [{ text: '🆔 Get Chat ID', callback_data: 'get_chatid' }]
    ];

    await sendMessageWithButtons(chatId, welcomeText, buttons);
});

console.log('🚀 Zi Store Bot started successfully with direct link button!');

// ============= Graceful Shutdown =============
const shutdown = (signal) => {
    console.log(`⚠️ Received ${signal}. Stopping...`);
    bot.stopPolling().then(() => process.exit(0));
};

process.on('SIGTERM', () => shutdown('SIGTERM')); 
process.on('SIGINT', () => shutdown('SIGINT'));
