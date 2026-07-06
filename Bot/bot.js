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

// ============= Bot Instance =============
const bot = new TelegramBot(token, { polling: true });

// ============= Polling Error Handling =============
bot.on('polling_error', (error) => {
    console.error('❌ Polling error:', error.message);
    
    if (error.message && error.message.includes('409')) {
        console.log('🔄 409 Conflict - Another instance is running');
        console.log('💡 Wait a moment, the old instance will stop automatically');
    }
});

// ============= Express Server =============
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🤖 Zi Store Bot is running!');
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

// ============= Function to Send Message with Buttons =============
async function sendMessageWithButtons(chatId, text, buttons) {
    try {
        const replyMarkup = {
            inline_keyboard: buttons
        };
        
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

// ============= Bot Commands =============

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    
    const welcomeText = `👋 *Welcome to ZI Store Bot!*

🔗 To link your account, click the button below.`;

    const buttons = [
        [{ text: '🔗 Link Account', callback_data: 'link_account' }],
        [{ text: '🆔 Get Chat ID', callback_data: 'get_chatid' }]
    ];

    await sendMessageWithButtons(chatId, welcomeText, buttons);
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `📋 *Available Commands:*

/start - Start the bot
/help - Show help
/chatid - Get your Chat ID

🔗 To link your account, click the "Link Account" button`, { parse_mode: 'Markdown' });
});

bot.onText(/\/chatid/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `🆔 Your Chat ID: \`${chatId}\``, { parse_mode: 'Markdown' });
});

// ============= Callback Query Handler =============

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
            // ✅ البحث عن طلب ربط معلق
            const bindsRef = db.collection('telegram_binds');
            const snapshot = await bindsRef
                .where('status', '==', 'pending')
                .limit(1)
                .get();

            if (snapshot.empty) {
                await bot.sendMessage(chatId, `❌ No pending link request found.

🔹 Open your profile in the store and click "Link Telegram" first.

📌 Then come back here and click the button again.`);
                return;
            }

            let bindDoc = null;
            let bindData = null;

            snapshot.forEach(doc => {
                bindDoc = doc;
                bindData = doc.data();
            });

            // ✅ تحديث حالة الربط
            await bindDoc.ref.update({
                status: 'completed',
                telegramChatId: String(chatId),
                completedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // ✅ رسالة نجاح
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

            // ✅ إشعار للمدير
            await bot.sendMessage(ADMIN_CHAT_ID, 
                `🔗 *New Link*\n\n👤 User: ${bindData.userName || bindData.userEmail || 'Unknown'}\n📧 Email: ${bindData.userEmail || 'N/A'}\n🆔 Chat ID: ${chatId}`
            );

            // ✅ حذف الرسالة السابقة
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

// ============= Text Message Handler (للكود القديم) =============

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || text.startsWith('/') || text.includes('callback')) {
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
                    `🔗 *New Link*\n\n👤 User: ${data.userName || data.userEmail || 'Unknown'}\n📧 Email: ${data.userEmail || 'N/A'}\n🆔 Chat ID: ${chatId}`
                );
            } else {
                await bot.sendMessage(chatId, '❌ This code is already used or expired.');
            }
        } else {
            await bot.sendMessage(chatId, `❌ Invalid code.

🔹 Please click the "Link Account" button in the bot to link your account automatically.`);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        await bot.sendMessage(chatId, '❌ An error occurred. Try again.');
    }
});

console.log('🚀 Zi Store Bot started successfully!');

const shutdown = (signal) => {
    console.log(`⚠️ Received ${signal}. Stopping...`);
    bot.stopPolling().then(() => process.exit(0));
};

process.on('SIGTERM', () => shutdown('SIGTERM')); 
process.on('SIGINT', () => shutdown('SIGINT'));
