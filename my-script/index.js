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
    }
}

// السكربت الأساسي
async function yourMainScript(userId, email) {
    return {
        message: `✅ تم التشغيل بنجاح للمستخدم: ${email}`,
        userId,
        timestamp: new Date().toISOString()
    };
}

// نقطة الدخول
export default async (req, res) => {
    try {
        const { firebaseToken } = JSON.parse(req.payload || '{}');
        if (!firebaseToken) {
            return res.json({ success: false, error: "التوكن مطلوب" });
        }

        const decoded = await getAuth().verifyIdToken(firebaseToken);
        const result = await yourMainScript(decoded.uid, decoded.email);

        res.json({ success: true, data: result });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
};
