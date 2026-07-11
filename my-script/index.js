// index.js - Appwrite Cloud Function (Node.js 18 أو 20)
const admin = require('firebase-admin');

// 1. تهيئة Firebase Admin باستخدام متغيرات البيئة (التي ستضيفها في Settings)
if (!admin.apps.length) {
    try {
        // يجب إضافة هذه المتغيرات في إعدادات الدالة (Settings > Variables)
        const privateKey = process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            : undefined;

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
        });
        console.log('✅ Firebase Admin initialized successfully.');
    } catch (error) {
        console.error('❌ Firebase init error:', error);
    }
}

// 2. دالة السكربت الأساسية التي تريد تشغيلها (عدّلها حسب حاجتك)
async function yourMainScript(userId, userEmail, customData) {
    // هنا ضع منطق سكربتك الخاص
    // مثال: جلب بيانات، تحديث قاعدة بيانات، إرسال إشعار، إلخ.
    
    // للتجربة، سنعيد بيانات المستخدم مع وقت التنفيذ
    return {
        message: `✅ تم تنفيذ السكربت بنجاح للمستخدم: ${userEmail}`,
        userId: userId,
        email: userEmail,
        executedAt: new Date().toISOString(),
        customData: customData || 'لا توجد بيانات إضافية'
    };
}

// 3. نقطة الدخول الرئيسية للدالة (Appwrite تستدعي هذا الكود)
module.exports = async (req, res) => {
    try {
        // أ. استقبال التوكن من الطلب (يرسله الخادم الوسيط أو المستخدم مباشرة)
        const payload = req.payload || '{}';
        const { firebaseToken, additionalData } = JSON.parse(payload);
        
        if (!firebaseToken) {
            return res.json({ 
                success: false, 
                error: '⚠️ التوكن مطلوب. يرجى تسجيل الدخول أولاً.' 
            });
        }

        // ب. التحقق من صحة التوكن مع Firebase
        console.log('🔍 جاري التحقق من التوكن...');
        const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
        
        const userId = decodedToken.uid;
        const userEmail = decodedToken.email || 'بريد غير متوفر';
        console.log(`✅ مستخدم موثوق: ${userEmail} (UID: ${userId})`);

        // ج. تنفيذ السكربت الخاص بك (بعد التأكد من الهوية)
        const scriptResult = await yourMainScript(userId, userEmail, additionalData);

        // د. إرجاع النتيجة بنجاح
        return res.json({
            success: true,
            data: scriptResult
        });

    } catch (error) {
        // هـ. معالجة الأخطاء (مثل توكن منتهي الصلاحية أو غير صحيح)
        console.error('❌ خطأ في الدالة:', error);
        
        let errorMessage = 'حدث خطأ داخلي في السيرفر.';
        if (error.code === 'auth/id-token-expired') {
            errorMessage = '⚠️ انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.';
        } else if (error.code === 'auth/argument-error') {
            errorMessage = '⚠️ التوكن غير صالح أو تالف.';
        }

        return res.json({
            success: false,
            error: errorMessage,
            details: error.message // يمكنك إزالة هذا السطر في الإنتاج لحماية التفاصيل
        });
    }
};
