const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const admin = require('firebase-admin');
const fs = require('fs');
const cors = require('cors');

// ============= التوكن =============
const token = process.env.BOT_TOKEN || '8687744794:AAGeeNrEU-iQLRmg3dLvYkWhddtYo_sJ1tc';
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '7434396478';

if (!token) {
    console.error('❌ BOT_TOKEN is not set!');
    process.exit(1);
}

console.log('🤖 Starting bot with token:', token.substring(0, 10) + '...');

// ============= البوت =============
const bot = new TelegramBot(token, { 
    polling: true,
    onlyFirstMatch: true,
    pollingOptions: {
        timeout: 30,
        limit: 100
    }
});

// ============= معالجة أخطاء الـ Polling =============
bot.on('polling_error', (error) => {
    console.error('❌ Polling error:', error.message);
    
    if (error.message && (error.message.includes('409') || error.message.includes('terminated'))) {
        console.log('🔄 409 Conflict detected. Exiting for restart...');
        process.exit(1);
    }
});

// ============= Firebase Admin =============
let db;
try {
    const serviceAccountPath = '/etc/secrets/firebase-credentials.json';
    let serviceAccount;
    
    if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        console.log('✅ Service Account loaded from secrets');
    } else {
        console.warn('⚠️ Service Account not found, trying without...');
        serviceAccount = {
            projectId: "zi-script-store"
        };
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
    console.error('❌ Firebase Admin error:', error.message);
    try {
        if (!admin.apps.length) {
            admin.initializeApp({
                projectId: "zi-script-store"
            });
        }
        db = admin.firestore();
        console.log('⚠️ Firebase initialized without auth (read-only)');
    } catch (e) {
        console.error('❌ Firebase failed:', e.message);
        db = null;
    }
}

// ============= دالة إرسال آمنة =============
async function safeSendMessage(chatId, text, options = {}) {
    try {
        const result = await bot.sendMessage(chatId, text, { 
            parse_mode: 'Markdown',
            ...options 
        });
        console.log(`✅ Message sent to ${chatId}`);
        return result;
    } catch (error) {
        console.error(`❌ Failed to send to ${chatId}:`, error.message);
        
        try {
            const plainText = text.replace(/\*([^*]+)\*/g, '$1').replace(/\_([^_]+)\_/g, '$1');
            const result = await bot.sendMessage(chatId, plainText);
            console.log(`✅ Plain message sent to ${chatId}`);
            return result;
        } catch (e2) {
            console.error(`❌ Both attempts failed for ${chatId}`);
            return null;
        }
    }
}

// ============= أوامر البوت =============

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    await safeSendMessage(chatId, `
👋 *مرحباً بك في Zi Store Bot!*

🔗 *لربط حسابك مع المتجر:*
1️⃣ اضغط على زر "ربط تيليجرام" في الملف الشخصي
2️⃣ ستحصل على كود ربط
3️⃣ أرسل الكود هنا في هذه المحادثة

📋 *الأوامر:*
/help - عرض المساعدة
/chatid - معرف الدردشة
`);
});

bot.onText(/\/start (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const bindCode = match[1];
    
    console.log(`🔗 Binding with code: ${bindCode} from ${chatId}`);
    
    if (!db) {
        await safeSendMessage(chatId, '❌ Database error. Please try again later.');
        return;
    }
    
    try {
        const docRef = db.collection('telegram_binds').doc(bindCode);
        const docSnap = await docRef.get();
        
        if (docSnap.exists) {
            const data = docSnap.data();
            
            if (data.status === 'pending') {
                await docRef.update({
                    status: 'completed',
                    telegramChatId: String(chatId),
                    completedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                
                await safeSendMessage(chatId, `✅ *تم ربط حسابك بنجاح!* 🎉

ستستلم إشعارات الطلبات هنا.

شكراً لاستخدامك Zi Store! 🚀`);
                console.log(`✅ User ${chatId} bound with code: ${bindCode}`);
                
                await safeSendMessage(ADMIN_CHAT_ID, 
                    `🔗 *ربط جديد*\n\n👤 المستخدم: ${data.userName || data.userEmail || 'Unknown'}\n📧 البريد: ${data.userEmail || 'N/A'}\n🆔 معرف الدردشة: ${chatId}`
                );
            } else {
                await safeSendMessage(chatId, '❌ هذا الكود منتهي الصلاحية أو مستخدم بالفعل.');
            }
        } else {
            await safeSendMessage(chatId, '❌ كود الربط غير صحيح.\n\nتأكد من نسخ الكود بشكل صحيح أو اطلب كود جديد.');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        await safeSendMessage(chatId, '❌ حدث خطأ. الرجاء المحاولة مرة أخرى.');
    }
});

bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    await safeSendMessage(chatId, `
📋 *الأوامر المتاحة:*

/start - بدء البوت وعرض التعليمات
/help - عرض المساعدة
/chatid - معرف الدردشة الخاص بك

🔗 *لربط حسابك:*
1. افتح الملف الشخصي في Zi Store
2. اضغط "ربط تيليجرام"
3. انسخ كود الربط
4. أرسله هنا في هذه المحادثة
`);
});

bot.onText(/\/chatid/, async (msg) => {
    const chatId = msg.chat.id;
    await safeSendMessage(chatId, `🆔 معرف الدردشة الخاص بك: \`${chatId}\``);
});

// ============= معالج الرسائل (الربط اليدوي) =============

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || text.startsWith('/')) {
        return;
    }

    console.log(`📩 استلام: "${text}" من ${chatId}`);

    if (!db) {
        await safeSendMessage(chatId, '❌ خطأ في قاعدة البيانات. الرجاء المحاولة لاحقاً.');
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

                await safeSendMessage(chatId, `✅ *تم ربط حسابك بنجاح!* 🎉

ستستلم إشعارات الطلبات هنا.
شكراً لاستخدامك Zi Store! 🚀`);
                
                console.log(`✅ المستخدم ${chatId} مرتبط بالكود: ${text}`);
                
                await safeSendMessage(ADMIN_CHAT_ID, 
                    `🔗 *ربط جديد*\n\n👤 المستخدم: ${data.userName || data.userEmail || 'Unknown'}\n📧 البريد: ${data.userEmail || 'N/A'}\n🆔 معرف الدردشة: ${chatId}`
                );
                
            } else {
                await safeSendMessage(chatId, '❌ هذا الكود منتهي الصلاحية أو مستخدم بالفعل.\n\nاطلب كود جديد من الملف الشخصي.');
            }
        } else {
            await safeSendMessage(chatId, `❌ كود الربط غير صحيح.

🔍 تأكد من نسخ الكود بشكل صحيح.

📌 للحصول على كود جديد:
1. افتح الملف الشخصي في Zi Store
2. اضغط "ربط تيليجرام"
3. انسخ الكود الجديد

📋 للمساعدة اكتب /help`);
        }
    } catch (error) {
        console.error('❌ خطأ:', error.message);
        await safeSendMessage(chatId, '❌ حدث خطأ. الرجاء المحاولة مرة أخرى.');
    }
});

// ============= السيرفر مع CORS ونقاط النهاية الجديدة =============

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ إضافة CORS و JSON
app.use(cors());
app.use(express.json());

// ✅ نقطة نهاية لإرسال الرسائل (للموقع)
app.post('/send-message', async (req, res) => {
    const { chatId, message } = req.body;
    
    if (!chatId || !message) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing chatId or message' 
        });
    }
    
    console.log(`📤 Sending to ${chatId}: ${message.substring(0, 50)}...`);
    
    try {
        const result = await bot.sendMessage(chatId, message, { 
            parse_mode: 'Markdown' 
        });
        console.log(`✅ Message sent to ${chatId}`);
        res.json({ success: true, result });
    } catch (error) {
        console.error(`❌ Failed to send to ${chatId}:`, error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ✅ نقطة نهاية لإرسال إشعارات الاختبار
app.post('/test-notification', async (req, res) => {
    const { chatId } = req.body;
    
    if (!chatId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing chatId' 
        });
    }
    
    try {
        const message = `🔔 *اختبار الإشعارات*\n\nهذه رسالة اختبار من ZI Store.\n📅 ${new Date().toLocaleString()}\n\nإذا رأيت هذه الرسالة، فالإشعارات تعمل بشكل صحيح! ✅`;
        
        const result = await bot.sendMessage(chatId, message, { 
            parse_mode: 'Markdown' 
        });
        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ✅ نقطة نهاية للتحقق من حالة البوت
app.get('/status', (req, res) => {
    res.json({
        status: 'online',
        bot: 'running',
        adminChatId: ADMIN_CHAT_ID,
        db: db ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// ✅ نقطة نهاية رئيسية
app.get('/', (req, res) => {
    res.send('🤖 Zi Store Bot is running!');
});

// ✅ نقطة نهاية للصحة
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        bot: 'running',
        db: db ? 'connected' : 'disconnected',
        adminChatId: ADMIN_CHAT_ID
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📌 Admin Chat ID: ${ADMIN_CHAT_ID}`);
    console.log('✅ Bot is polling for messages...');
});

console.log('🚀 Zi Store Bot started successfully!');

// ============= إغلاق نظيف =============

const shutdown = (signal) => {
    console.log(`⚠️ Received ${signal}. Stopping polling...`);
    bot.stopPolling()
        .then(() => {
            console.log('✅ Polling stopped. Exiting.');
            process.exit(0);
        })
        .catch((err) => {
            console.error('❌ Error stopping polling:', err.message);
            process.exit(1);
        });
};

process.on('SIGTERM', () => shutdown('SIGTERM')); 
process.on('SIGINT', () => shutdown('SIGINT'));
