// ============================================================
// adsModule.js - نظام الإعلانات المتكامل مع Firebase
// ============================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { 
    getFirestore, 
    doc, 
    updateDoc, 
    increment, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ============================================================
// التكوين
// ============================================================
const SUPABASE_URL = 'https://kvsyzgavfxnwqmtsginv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_1uSIqgNONAV53GjOoBoZUw_niAGJXO6';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const POINTS_TO_DOLLAR = 0.01; // 100 نقطة = 1 دولار
const db = getFirestore(); // استخدم نفس قاعدة Firebase الموجودة

// ============================================================
// 1. جلب الإعلانات المتاحة
// ============================================================
export async function fetchAvailableAds() {
    try {
        const { data, error } = await supabase
            .from('ads')
            .select('*')
            .eq('is_active', true)
            .order('reward_points', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('❌ Error fetching ads:', error);
        return [];
    }
}

// ============================================================
// 2. عرض الإعلانات في الواجهة
// ============================================================
export async function renderAds() {
    const container = document.getElementById('adsList');
    if (!container) {
        console.warn('⚠️ عنصر adsList غير موجود');
        return;
    }

    const ads = await fetchAvailableAds();

    if (!ads || ads.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:20px; color:var(--text-secondary);">
                <i class="fas fa-ad" style="font-size:32px; opacity:0.2; display:block; margin-bottom:8px;"></i>
                لا توجد إعلانات متاحة حالياً
            </div>
        `;
        return;
    }

    container.innerHTML = ads.map(ad => `
        <div style="background: var(--glass-bg); border-radius: var(--radius-md); padding: 16px; 
                    border: 1px solid var(--glass-border); display: flex; justify-content: space-between; 
                    align-items: center; margin-bottom: 10px;">
            <div>
                <div style="font-weight: 700; font-size: 16px;">${ad.title}</div>
                <div style="font-size: 13px; color: var(--text-secondary);">
                    🪙 ${ad.reward_points} نقطة (≈ $${(ad.reward_points * POINTS_TO_DOLLAR).toFixed(2)}) • 
                    ⏱️ ${ad.view_duration_seconds} ثانية
                    ${ad.requires_captcha ? ' 🔒 Captcha' : ''}
                </div>
            </div>
            <button onclick="window.startAdView('${ad.id}')" 
                    style="padding: 8px 20px; border: none; border-radius: var(--radius-sm); 
                           background: var(--primary); color: #fff; font-weight: 700; cursor: pointer;">
                <i class="fas fa-play"></i> مشاهدة
            </button>
        </div>
    `).join('');
}

// ============================================================
// 3. بدء مشاهدة إعلان
// ============================================================
export function startAdView(adId) {
    console.log('▶️ بدء مشاهدة الإعلان:', adId);
    
    const ads = window._adsList || [];
    const ad = ads.find(a => a.id === adId);
    if (!ad) {
        showToast('⚠️ الإعلان غير موجود', 'warning');
        return;
    }

    // فتح الرابط في نافذة جديدة
    const win = window.open(ad.url, '_blank');
    if (!win) {
        showToast('⚠️ يرجى السماح للنوافذ المنبثقة', 'warning');
        return;
    }

    // تنبيه المستخدم بالمدة
    showToast(`⏳ شاهد الإعلان لمدة ${ad.view_duration_seconds} ثانية`, 'info', 3000);

    // بعد انتهاء المدة، نطلب Captcha إذا كان مطلوباً، وإلا نكمل مباشرة
    setTimeout(() => {
        if (ad.requires_captcha) {
            // عرض نافذة Captcha (سيتم تنفيذها لاحقاً)
            showCaptchaModal(adId);
        } else {
            completeAdView(adId, false);
        }
    }, ad.view_duration_seconds * 1000);
}

// ============================================================
// 4. إكمال المشاهدة وحفظ النقاط (مع تحديث Firestore والواجهة)
// ============================================================
export async function completeAdView(adId, captchaSolved = false) {
    console.log('✅ إكمال مشاهدة الإعلان:', adId, 'Captcha:', captchaSolved);

    const user = window.currentUser;
    if (!user || user.isAnonymous) {
        showToast('⚠️ يرجى تسجيل الدخول أولاً', 'warning');
        return;
    }

    const ads = window._adsList || [];
    const ad = ads.find(a => a.id === adId);
    if (!ad) {
        showToast('⚠️ الإعلان غير موجود', 'warning');
        return;
    }

    try {
        // ====== 1. تسجيل المشاهدة في Supabase ======
        const { error: insertError } = await supabase
            .from('ad_views')
            .insert({
                user_id: user.uid,
                ad_id: adId,
                earned_points: ad.reward_points,
                ip: 'Unknown', // يمكن تحسينه باستخدام fetchUserInfo
                user_agent: navigator.userAgent,
                is_valid: true,
                captcha_solved: captchaSolved,
                viewed_at: new Date().toISOString()
            });

        if (insertError) throw insertError;

        // ====== 2. تحديث Firestore (إضافة نقاط ورصيد) ======
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            points: increment(ad.reward_points),
            balance: increment(ad.reward_points * POINTS_TO_DOLLAR),
            updatedAt: serverTimestamp()
        });

        // ====== 3. تحديث userProfile محلياً ======
        if (window.userProfile) {
            window.userProfile.points = (window.userProfile.points || 0) + ad.reward_points;
            window.userProfile.balance = (window.userProfile.balance || 0) + ad.reward_points * POINTS_TO_DOLLAR;
        } else {
            // إذا لم يكن معرفاً، ننشئه
            window.userProfile = {
                points: ad.reward_points,
                balance: ad.reward_points * POINTS_TO_DOLLAR
            };
        }

        // ====== 4. تحديث الواجهة ======
        if (window.updateBalanceDisplay) {
            window.updateBalanceDisplay();
        } else {
            // تحديث يدوي لعناصر الرصيد
            const balanceEl = document.getElementById('balanceDisplay');
            if (balanceEl) {
                balanceEl.textContent = `$${window.userProfile.balance.toFixed(2)}`;
            }
            const pointsEl = document.getElementById('pointsDisplay');
            if (pointsEl) {
                pointsEl.textContent = window.userProfile.points;
            }
        }

        if (window.updateUI) {
            window.updateUI();
        }

        // ====== 5. عرض رسالة نجاح ======
        showToast(`✅ تم ربح ${ad.reward_points} نقطة ($${(ad.reward_points * POINTS_TO_DOLLAR).toFixed(2)})`, 'success');

        // ====== 6. تحديث قائمة الإعلانات (لتحديث الرصيد في كل بطاقة) ======
        // يمكن إعادة عرض الإعلانات لكن الأفضل تحديث الرصيد العام فقط

        // إغلاق النافذة المنبثقة إذا كانت مفتوحة
        // (يمكن تتبعها لكن سنكتفي بإغلاقها يدوياً)

        console.log(`✅ تم إضافة ${ad.reward_points} نقطة للمستخدم ${user.uid}`);

    } catch (error) {
        console.error('❌ Error completing ad view:', error);
        showToast('❌ حدث خطأ أثناء حفظ المشاهدة: ' + error.message, 'error');
    }
}

// ============================================================
// 5. نافذة Captcha (نسخة مبسطة)
// ============================================================
function showCaptchaModal(adId) {
    const modal = document.createElement('div');
    modal.id = 'captchaModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
        display: flex; align-items: center; justify-content: center;
        z-index: 10000;
    `;
    modal.innerHTML = `
        <div style="background: var(--card-bg); border-radius: var(--radius-lg); padding: 30px; max-width: 500px; width: 90%; text-align: center;">
            <h3 style="margin-bottom: 16px;">🔒 تحقق من أنك إنسان</h3>
            <p>اختر الصورة التي تحتوي على <strong>سيارة</strong> لإكمال المشاهدة</p>
            <div style="display: flex; gap: 12px; justify-content: center; margin: 20px 0; flex-wrap: wrap;">
                <img src="https://picsum.photos/seed/car1/150/150" data-correct="false" onclick="window.selectCaptchaImage(this)" style="width:120px;height:120px;object-fit:cover;border-radius:12px;cursor:pointer;border:3px solid transparent;">
                <img src="https://picsum.photos/seed/car2/150/150" data-correct="true" onclick="window.selectCaptchaImage(this)" style="width:120px;height:120px;object-fit:cover;border-radius:12px;cursor:pointer;border:3px solid transparent;">
                <img src="https://picsum.photos/seed/car3/150/150" data-correct="false" onclick="window.selectCaptchaImage(this)" style="width:120px;height:120px;object-fit:cover;border-radius:12px;cursor:pointer;border:3px solid transparent;">
                <img src="https://picsum.photos/seed/car4/150/150" data-correct="false" onclick="window.selectCaptchaImage(this)" style="width:120px;height:120px;object-fit:cover;border-radius:12px;cursor:pointer;border:3px solid transparent;">
            </div>
            <div id="captchaStatus" style="margin-top: 10px; color: var(--text-secondary);"></div>
            <button onclick="window.closeCaptchaModal()" style="margin-top: 12px; padding: 6px 20px; background: var(--danger); color: #fff; border: none; border-radius: var(--radius-sm); cursor: pointer;">إلغاء</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    window._captchaAdId = adId;
}

// ============================================================
// 6. اختيار صورة Captcha
// ============================================================
window.selectCaptchaImage = function(imgElement) {
    const isCorrect = imgElement.dataset.correct === 'true';
    const status = document.getElementById('captchaStatus');
    const modal = document.getElementById('captchaModal');

    if (isCorrect) {
        status.innerHTML = '✅ صحيح! جارٍ إكمال المشاهدة...';
        status.style.color = 'var(--success)';
        const adId = window._captchaAdId;
        if (adId) {
            completeAdView(adId, true);
        }
        setTimeout(() => {
            if (modal) modal.remove();
            document.body.style.overflow = '';
        }, 1500);
    } else {
        status.innerHTML = '❌ غير صحيح، حاول مجدداً';
        status.style.color = 'var(--danger)';
        imgElement.style.borderColor = 'var(--danger)';
        setTimeout(() => {
            imgElement.style.borderColor = 'transparent';
        }, 1000);
    }
};

// ============================================================
// 7. إغلاق Captcha يدوياً
// ============================================================
window.closeCaptchaModal = function() {
    const modal = document.getElementById('captchaModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
        showToast('❌ تم إلغاء المشاهدة', 'info');
    }
};

// ============================================================
// 8. تصدير الدوال إلى window
// ============================================================
window.fetchAvailableAds = fetchAvailableAds;
window.renderAds = renderAds;
window.startAdView = startAdView;
window.completeAdView = completeAdView;
window.selectCaptchaImage = selectCaptchaImage;
window.closeCaptchaModal = closeCaptchaModal;

console.log('✅ Ads Module loaded successfully!');
