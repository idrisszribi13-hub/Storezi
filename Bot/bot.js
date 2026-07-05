const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const admin = require('firebase-admin');
const fs = require('fs');

// ============= التوكن =============
const token = process.env.BOT_TOKEN || '8687744794:AAGeeNrEU-iQLRmg3dLvYkWhddtYo_sJ1tc';
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '7434396478';

if (!token) {
    console.error('❌ BOT_TOKEN is not set!');
    process.exit(1);
}

console.log('🤖 Starting bot with token:', token.substring(0, 10) + '...');

// ============= البوت =============
const bot = new TelegramBot(token, { polling: true });

// ============= معالجة أخطاء الـ Polling وإعادة التشغيل التلقائي =============
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

// ============= أوامر البوت =============

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const text = `
👋 مرحباً بك في Zi Store Bot!

🔗 لربط حسابك مع المتجر:
1️⃣ اضغط على زر "ربط تيليجرام" في الملف الشخصي
2️⃣ ستحصل على كود ربط
3️⃣ أرسل الكود هنا في هذه المحادثة

📋 الأوامر:
/help - عرض المساعدة
/chatid - معرف الدردشة
`;
    bot.sendMessage(chatId, text);
});

// ✅ معالجة /start مع كود الربط (للتوافق مع الروابط)
bot.onText(/\/start (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const bindCode = match[1];
    
    console.log(`🔗 Binding with code: ${bindCode} from ${chatId}`);
    
    if (!db) {
        await bot.sendMessage(chatId, '❌ Database error. Please try again later.');
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
                
                await bot.sendMessage(chatId, '✅ **تم ربط حسابك بنجاح!**\n\nستستلم إشعارات الطلبات هنا.\n\nشكراً لاستخدامك Zi Store! 🚀');
                console.log(`✅ User ${chatId} bound with code: ${bindCode}`);
                
                // إشعار للمدير
                bot.sendMessage(ADMIN_CHAT_ID, 
                    `🔗 *ربط جديد*\n\n👤 المستخدم: ${data.userName || data.userEmail || 'Unknown'}\n📧 البريد: ${data.userEmail || 'N/A'}\n🆔 معرف الدردشة: ${chatId}`
                );
            } else {
                await bot.sendMessage(chatId, '❌ هذا الكود منتهي الصلاحية أو مستخدم بالفعل.');
            }
        } else {
            await bot.sendMessage(chatId, '❌ كود الربط غير صحيح.\n\nتأكد من نسخ الكود بشكل صحيح أو اطلب كود جديد.');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        await bot.sendMessage(chatId, '❌ حدث خطأ. الرجاء المحاولة مرة أخرى.');
    }
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `
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

bot.onText(/\/chatid/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `🆔 معرف الدردشة الخاص بك: \`${chatId}\``, { parse_mode: 'Markdown' });
});

// ============= معالج الرسائل (الربط اليدوي) =============

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // تجاهل الأوامر
    if (!text || text.startsWith('/')) {
        return;
    }

    console.log(`📩 استلام: "${text}" من ${chatId}`);

    if (!db) {
        await bot.sendMessage(chatId, '❌ خطأ في قاعدة البيانات. الرجاء المحاولة لاحقاً.');
        return;
    }

    try {
        // 🔍 البحث عن كود الربط في Firebase
        const docRef = db.collection('telegram_binds').doc(text);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const data = docSnap.data();

            if (data.status === 'pending') {
                // ✅ تأكيد الربط
                await docRef.update({
                    status: 'completed',
                    telegramChatId: String(chatId),
                    completedAt: admin.firestore.FieldValue.serverTimestamp()
                });

                await bot.sendMessage(chatId, `✅ **تم ربط حسابك بنجاح!** 🎉

ستستلم إشعارات الطلبات هنا.
شكراً لاستخدامك Zi Store! 🚀`);
                
                console.log(`✅ المستخدم ${chatId} مرتبط بالكود: ${text}`);
                
                // 📨 إشعار للمدير
                await bot.sendMessage(ADMIN_CHAT_ID, 
                    `🔗 *ربط جديد*\n\n👤 المستخدم: ${data.userName || data.userEmail || 'Unknown'}\n📧 البريد: ${data.userEmail || 'N/A'}\n🆔 معرف الدردشة: ${chatId}`
                );
                
                // 📨 إشعار للمستخدم أنه سيتم إعلام المدير
                await bot.sendMessage(chatId, `📨 تم إعلام المدير بربط حسابك.`);
                
            } else {
                await bot.sendMessage(chatId, '❌ هذا الكود منتهي الصلاحية أو مستخدم بالفعل.\n\nاطلب كود جديد من الملف الشخصي.');
            }
        } else {
            // ❌ كود غير صحيح
            await bot.sendMessage(chatId, `❌ كود الربط غير صحيح.

🔍 تأكد من نسخ الكود بشكل صحيح.

📌 للحصول على كود جديد:
1. افتح الملف الشخصي في Zi Store
2. اضغط "ربط تيليجرام"
3. انسخ الكود الجديد

📋 للمساعدة اكتب /help`);
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

app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        bot: 'running',
        db: db ? 'connected' : 'disconnected'
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log('✅ Bot is polling for messages...');
});

console.log('🚀 Zi Store Bot started successfully!');
console.log(`📌 Admin Chat ID: ${ADMIN_CHAT_ID}`);

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
