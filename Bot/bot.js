// ============================================================
// BOT.JS - Complete and Clean Version with English Comments
// ============================================================

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const admin = require('firebase-admin');
const fs = require('fs');

// ============= Environment Variables =============
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

// ============= Firebase Admin Initialization =============
let db;
try {
    const serviceAccountPath = '/etc/secrets/firebase-credentials.json';
    let serviceAccount;

    if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        console.log('✅ Loaded service account from secret file');
    } else if (process.env.FIREBASE_CREDENTIALS_JSON) {
        serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS_JSON);
        console.log('✅ Loaded service account from environment variable');
    } else {
        console.warn('⚠️ No service account found, using fallback mode');
        serviceAccount = { projectId: "zi-script-store" };
    }

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: "zi-script-store"
        });
        console.log('✅ Firebase Admin initialized successfully!');
    }
    db = admin.firestore();
} catch (error) {
    console.error('❌ Firebase error:', error.message);
    try {
        if (!admin.apps.length) {
            admin.initializeApp({ projectId: "zi-script-store" });
        }
        db = admin.firestore();
        console.log('⚠️ Firebase initialized without auth (some operations may be restricted)');
    } catch (e) {
        console.error('❌ Firebase initialization failed:', e.message);
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
    res.send('🤖 Zi Store Bot is running');
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

// ============= Helper Functions =============

/**
 * Send a message with inline buttons
 * @param {string} chatId - Telegram chat ID
 * @param {string} text - Message text (supports Markdown)
 * @param {Array} buttons - Array of button rows
 */
async function sendMessageWithButtons(chatId, text, buttons) {
    try {
        const replyMarkup = { inline_keyboard: buttons };
        await bot.sendMessage(chatId, text, {
            parse_mode: 'Markdown',
            reply_markup: replyMarkup
        });
        console.log(`✅ Sent message with buttons to ${chatId}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to send message:`, error.message);
        return false;
    }
}

/**
 * Get the most recent pending bind request
 */
async function getPendingBind() {
    if (!db) return null;
    try {
        const bindsRef = db.collection('telegram_binds');
        const snapshot = await bindsRef
            .where('status', '==', 'pending')
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        let doc = null;
        let data = null;
        snapshot.forEach(d => { doc = d; data = d.data(); });
        return { doc, data };
    } catch (error) {
        console.error('Error fetching pending bind:', error.message);
        return null;
    }
}

/**
 * Check if a user is already linked using their chat ID
 */
async function isUserLinked(chatId) {
    if (!db) return false;
    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef
            .where('telegramChatId', '==', String(chatId))
            .limit(1)
            .get();
        return !snapshot.empty;
    } catch (error) {
        console.error('Error checking if user is linked:', error.message);
        return false;
    }
}

/**
 * Update user document with chat ID using multiple search methods
 * @param {Object} bindData - Data from the bind request
 * @param {string} chatId - Telegram chat ID to assign
 */
async function updateUserWithChatId(bindData, chatId) {
    if (!db) return false;
    try {
        const userId = bindData.userId || bindData.userID;
        if (!userId) {
            console.error('❌ No userId in bindData');
            return false;
        }
        const userRef = db.collection('users').doc(userId);
        const docSnap = await userRef.get();
        if (!docSnap.exists) {
            console.error(`❌ User document ${userId} not found`);
            return false;
        }
        await userRef.update({
            telegramChatId: String(chatId),
            telegram: bindData.userName || bindData.userEmail || '',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Updated user ${userId} with chatId`);
        return true;
    } catch (error) {
        console.error('❌ Failed to update user:', error.message);
        return false;
    }
}

        // Method 2: Email
        if (bindData.userEmail) {
            const email = bindData.userEmail.trim().toLowerCase();
            const usersRef = db.collection('users');
            const snapshot = await usersRef
                .where('email', '==', email)
                .limit(1)
                .get();
            if (!snapshot.empty) {
                snapshot.forEach(doc => {
                    userRef = doc.ref;
                    userId = doc.id;
                });
                await userRef.update({
                    telegramChatId: String(chatId),
                    telegram: bindData.userName || bindData.userEmail || '',
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`✅ Updated user ${userId} with chatId (by email: ${email})`);
                return true;
            } else {
                console.warn(`⚠️ No user found with email: ${email}`);
            }
        }

        // Method 3: Username
        if (bindData.userName) {
            const name = bindData.userName.trim();
            const usersRef = db.collection('users');
            const snapshot = await usersRef
                .where('name', '==', name)
                .limit(1)
                .get();
            if (!snapshot.empty) {
                snapshot.forEach(doc => {
                    userRef = doc.ref;
                    userId = doc.id;
                });
                await userRef.update({
                    telegramChatId: String(chatId),
                    telegram: bindData.userName || '',
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`✅ Updated user ${userId} with chatId (by name: ${name})`);
                return true;
            } else {
                console.warn(`⚠️ No user found with name: ${name}`);
            }
        }

        console.error('❌ Could not find any matching user to link');
        return false;
    } catch (error) {
        console.error('❌ Failed to update user:', error.message);
        return false;
    }
}

// ============= Command: /start (with parameter support) =============
bot.onText(/\/start(?: (.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const payload = match[1] || '';
    console.log(`📩 /start from ${chatId}, payload: "${payload}"`);

    // Check if already linked
    const linked = await isUserLinked(chatId);
    if (linked) {
        await bot.sendMessage(chatId,
            `✅ *You are already linked to your store account!*\n\nYou will receive order notifications here.\n\nThank you for using Zi Store! 🚀`,
            { parse_mode: 'Markdown' }
        );
        return;
    }

    // Check for pending bind
    const pending = await getPendingBind();

    let text, buttons;
    if (pending) {
        text = `👋 *Welcome to Zi Store Bot!*\n\n🔗 You have a pending link request. Click the button below to link your account immediately.`;
    } else {
        text = `👋 *Welcome to Zi Store Bot!*\n\n🔗 To link your account, please open the store website, click "Link Telegram" in your profile, then come back here and click the button below.`;
    }
    buttons = [
        [{ text: '🔗 Link Account', callback_data: 'link_account' }],
        [{ text: '🆔 Get Chat ID', callback_data: 'get_chatid' }]
    ];

    await sendMessageWithButtons(chatId, text, buttons);
});

// ============= Command: /help =============
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId,
        `📋 *Available commands:*\n\n/start - Start the bot and show link button\n/chatid - Get your chat ID`,
        { parse_mode: 'Markdown' }
    );
});

// ============= Command: /chatid =============
bot.onText(/\/chatid/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `🆔 Your chat ID: \`${chatId}\``, { parse_mode: 'Markdown' });
});

// ============= Button Callback Handler =============
bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    const messageId = callbackQuery.message.message_id;

    console.log(`🔘 Button clicked: ${data} from ${chatId}`);
    await bot.answerCallbackQuery(callbackQuery.id);

    if (data === 'link_account') {
        // Check if already linked
        const linked = await isUserLinked(chatId);
        if (linked) {
            await bot.sendMessage(chatId,
                `✅ *You are already linked to your account!*\n\nYou will receive order notifications here. 🚀`,
                { parse_mode: 'Markdown' }
            );
            try { await bot.deleteMessage(chatId, messageId); } catch (e) {}
            return;
        }

        if (!db) {
            await bot.sendMessage(chatId, '❌ Database error. Please try again later.');
            return;
        }

        try {
            const pending = await getPendingBind();

            if (!pending) {
                await bot.sendMessage(chatId,
                    `❌ No pending link request found.\n\n🔹 Please open your profile in the store and click "Link Telegram" first.`
                );
                return;
            }

            const { doc, data: bindData } = pending;

            // Step 1: Update bind document to completed
            await doc.ref.update({
                status: 'completed',
                telegramChatId: String(chatId),
                completedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ Updated bind document to completed');

            // Step 2: Update user document with chat ID
            const userUpdated = await updateUserWithChatId(bindData, chatId);

            // Step 3: Success message with instructions
            const successText = `✅ *Account linked successfully!* 🎉

👤 User: ${bindData.userName || bindData.userEmail || 'Unknown'}
📧 Email: ${bindData.userEmail || 'N/A'}

${userUpdated ? '📱 Your store account has been updated.' : '⚠️ There was an error updating your store account. Please contact the admin.'}

🔹 *Important:* If the store still shows "Unlinked", please click the "Check" button in your profile or refresh the page (F5).

You will receive order notifications here.

Thank you for using Zi Store! 🚀`;

            const buttons = [
                [{ text: '🛒 Open Store', url: 'https://zribi13-hub.github.io/Storezi/' }],
                [{ text: '🔄 Refresh Instructions', callback_data: 'refresh_instruction' }]
            ];

            await sendMessageWithButtons(chatId, successText, buttons);
            console.log(`✅ User ${chatId} linked successfully`);

            // Notify admin
            await bot.sendMessage(ADMIN_CHAT_ID,
                `🔗 *New Link*\n\n👤 User: ${bindData.userName || bindData.userEmail || 'Unknown'}\n📧 Email: ${bindData.userEmail || 'N/A'}\n🆔 Chat ID: ${chatId}\n${userUpdated ? '✅ User updated' : '⚠️ User update failed'}\n🔑 Code: ${doc.id}`
            );

            // Delete the old message with the link button
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
        await bot.sendMessage(chatId, `🆔 Your chat ID: \`${chatId}\``, { parse_mode: 'Markdown' });
    } else if (data === 'refresh_instruction') {
        await bot.sendMessage(chatId,
            `🔄 *To refresh link status in the store:*\n\n1. Open your profile in the store.\n2. Click the **"Check"** button next to Telegram.\n3. The status will change to \`✅ Linked\` immediately.\n\nOr simply press F5 to refresh the page.`,
            { parse_mode: 'Markdown' }
        );
    }
});

// ============= No message handler for regular text =============
// This keeps the bot clean and only responds to commands and buttons.

console.log('🚀 Bot started successfully!');

// ============= Graceful Shutdown =============
const shutdown = (signal) => {
    console.log(`⚠️ Received ${signal}. Shutting down...`);
    bot.stopPolling().then(() => process.exit(0));
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
