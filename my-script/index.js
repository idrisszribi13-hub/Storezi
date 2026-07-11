
// index.js - Appwrite Function (Deno)
import { initializeApp, cert, getApps } from "npm:firebase-admin@11";
import { getAuth } from "npm:firebase-admin@11/auth";

// تهيئة Firebase Admin
if (getApps().length === 0) {
    const privateKey = Deno.env.get("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, '\n');
    const projectId = Deno.env.get("FIREBASE_PROJECT_ID");
    const clientEmail = Deno.env.get("FIREBASE_CLIENT_EMAIL");

    if (projectId && clientEmail && privateKey) {
        initializeApp({
            credential: cert({ projectId, clientEmail, privateKey }),
        });
        console.log("✅ Firebase Admin initialized");
    }
}

async function yourMainScript(userId, email) {
    return {
        message: `✅ تم التشغيل بنجاح للمستخدم: ${email}`,
        userId,
        timestamp: new Date().toISOString()
    };
}

export default async (req, res) => {
    try {
        // 1. قراءة البيانات المرسلة
        const { firebaseToken } = JSON.parse(req.payload || '{}');
        console.log("📥 استلام التوكن:", firebaseToken ? "تم الاستلام" : "فارغ");

        if (!firebaseToken) {
            const errorResponse = { success: false, error: "⚠️ التوكن مطلوب" };
            console.log("📤 الرد:", JSON.stringify(errorResponse)); // ✅ ستظهر في الـ Logs
            return res.json(errorResponse);
        }

        // 2. التحقق من التوكن
        const decoded = await getAuth().verifyIdToken(firebaseToken);
        console.log(`✅ مستخدم موثوق: ${decoded.email}`);

        // 3. تنفيذ السكربت
        const result = await yourMainScript(decoded.uid, decoded.email);
        const successResponse = { success: true, data: result };
        
        console.log("📤 الرد:", JSON.stringify(successResponse)); // ✅ ستظهر في الـ Logs
        res.json(successResponse);

    } catch (error) {
        console.error("❌ خطأ:", error.message); // ✅ ستظهر في الـ Logs
        res.json({ success: false, error: error.message });
    }
};
