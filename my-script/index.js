// index.js - كود اختبار بسيط جداً
export default async (req, res) => {
    console.log("🚀 تم تشغيل الدالة الجديدة بنجاح!");
    console.log("📥 البيانات المستلمة:", req.payload || "لا توجد بيانات");
    
    return res.json({
        success: true,
        message: "اختبار ناجح!",
        received: req.payload || "فارغ"
    });
};
