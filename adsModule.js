// ============================================================
// adsModule.js - نظام الإعلانات (النسخة الأولية)
// ============================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://kvsyzgavfxnwqmtsginv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_1uSIqgNONAV53GjOoBoZUw_niAGJXO6';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// سعر الصرف: 100 نقطة = 1 دولار
const POINTS_TO_DOLLAR = 0.01;

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
// 3. بدء مشاهدة إعلان (سوف نكملها لاحقاً)
// ============================================================
export function startAdView(adId) {
  console.log('▶️ بدء مشاهدة الإعلان:', adId);
  
  // العثور على الإعلان في القائمة
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

  // محاكاة إكمال المشاهدة بعد المدة المحددة
  setTimeout(() => {
    // هنا سنكمل بعد تطبيق Captcha لاحقاً
    completeAdView(adId, false);
  }, ad.view_duration_seconds * 1000);
}

// ============================================================
// 4. إكمال المشاهدة وحفظ النقاط (نسخة أولية)
// ============================================================
export async function completeAdView(adId, captchaSolved = false) {
  console.log('✅ إكمال مشاهدة الإعلان:', adId, 'Captcha:', captchaSolved);

  const user = window._currentUser;
  if (!user) {
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
    // تسجيل المشاهدة
    const { error } = await supabase
      .from('ad_views')
      .insert({
        user_id: user.uid,
        ad_id: adId,
        earned_points: ad.reward_points,
        ip: 'Unknown',
        user_agent: navigator.userAgent,
        is_valid: true,
        captcha_solved: captchaSolved
      });

    if (error) throw error;

    // تحديث النقاط في Firestore (نفترض وجود حقل points)
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      points: increment(ad.reward_points),
      balance: increment(ad.reward_points * POINTS_TO_DOLLAR),
      updatedAt: serverTimestamp()
    });

    // تحديث الرصيد محلياً
    userProfile.points = (userProfile.points || 0) + ad.reward_points;
    userProfile.balance = (userProfile.balance || 0) + ad.reward_points * POINTS_TO_DOLLAR;
    
    if (window.updateBalanceDisplay) window.updateBalanceDisplay();
    if (window.updateUI) window.updateUI();

    showToast(`✅ تم ربح ${ad.reward_points} نقطة ($${(ad.reward_points * POINTS_TO_DOLLAR).toFixed(2)})`, 'success');

  } catch (error) {
    console.error('❌ Error completing ad view:', error);
    showToast('❌ حدث خطأ أثناء حفظ المشاهدة', 'error');
  }
}

// ============================================================
// 5. تصدير الدوال إلى window
// ============================================================
window.fetchAvailableAds = fetchAvailableAds;
window.renderAds = renderAds;
window.startAdView = startAdView;
window.completeAdView = completeAdView;

console.log('✅ Ads Module loaded successfully!');
