// ============================================================
// SCRIPT.JS - ZI Store النسخة النهائية الكاملة
// مع جميع التصحيحات والتصديرات اللازمة للـ HTML
// تم إصلاح: تعديل الترخيص (editLicence) لجلب البيانات مباشرة من Supabase
// ============================================================

// ============================================================
// 1. إعدادات Firebase (Auth & Firestore)
// ============================================================

import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, updatePassword, sendPasswordResetEmail, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, increment, collection, query, where, getDocs, onSnapshot, addDoc, deleteDoc, orderBy } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// ============================================================
// 2. إعدادات Supabase (للاستدعاءات عبر Edge Functions فقط)
// ============================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://kvsyzgavfxnwqmtsginv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_1uSIqgNONAV53GjOoBoZUw_niAGJXO6';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// 3. تهيئة Firebase
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyBwDTCxzd6aoue-NTLI2u4ouK-M37alwUw",
    authDomain: "zi-script-store.firebaseapp.com",
    projectId: "zi-script-store",
    storageBucket: "zi-script-store.firebasestorage.app",
    messagingSenderId: "925432917209",
    appId: "1:925432917209:web:ee9b329911d95d831622c8",
    measurementId: "G-J8YFD51CMR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// ============================================================
// 4. شاشة التحميل
// ============================================================

const loadingMessages = [
    'Initializing store...',
    'Loading products...',
    'Connecting to database...',
    'Welcome to ZI Store! 🚀'
];

let loadingMessageIndex = 0;
let loadingInterval = null;

function updateLoadingMessage() {
    const statusEl = document.getElementById('loadingStatus');
    if (statusEl) {
        loadingMessageIndex = (loadingMessageIndex + 1) % loadingMessages.length;
        statusEl.textContent = loadingMessages[loadingMessageIndex];
    }
}

function startLoadingMessages() {
    if (loadingInterval) clearInterval(loadingInterval);
    loadingInterval = setInterval(updateLoadingMessage, 2000);
}

function hideLoadingScreen() {
    const screen = document.getElementById('loadingScreen');
    if (screen) {
        screen.style.display = 'none';
        if (loadingInterval) {
            clearInterval(loadingInterval);
            loadingInterval = null;
        }
    }
}

function showLoadingScreen() {
    const screen = document.getElementById('loadingScreen');
    if (screen) {
        screen.style.display = 'flex';
        startLoadingMessages();
    }
}

function updateLoadingBar(percent) {
    const bar = document.getElementById('loadingBar');
    if (bar) {
        bar.style.width = Math.min(percent, 100) + '%';
    }
}

// ============================================================
// 5. الثوابت والمتغيرات العامة
// ============================================================

const ADMIN_EMAIL = 'zribiidriss3@gmail.com';
const TELEGRAM_BOT_TOKEN = '8687744794:AAGeeNrEU-iQLRmg3dLvYkWHddtYo_sJ1tc';
const TELEGRAM_CHAT_ID = '7434396478';
const BOT_USERNAME = 'Zistore_Notif_bot';
const RP_TO_DOLLAR = 0.1;

let currentUser = null;
let userId = null;
let cart = [];
let wishlist = [];
let products = [];
let currentFilter = 'all';
let activeDiscount = 0;
let activeDiscountCode = '';
let allOrders = [];
let pendingCount = 0;
let downloads = [];
let notifications = [];
let unreadNotifications = 0;
let unsubscribeAdmin = null;
let unsubscribeDownloads = null;
let unsubscribeNotifications = null;
let unsubscribeUser = null;
let unsubscribeProducts = null;
let selectedOrders = new Set();
let isUpdatingNotifications = false;
let shareProduct = null;
let allUsers = [];
let selectedPayment = null;
let ordersFilter = 'all';
let _selectedVipPlan = '1m';
let allLicences = [];
let isProcessingOrder = false;

let featuredProducts = [];
let featuredRotationInterval = null;
let featuredCurrentIndex = 0;
let featuredSettings = {
    enabled: true,
    rotationInterval: 5000,
    maxProducts: 4,
    selectedProductIds: []
};

let sliderSlides = [];
let sliderIntervalTime = 3;
let currentSlideIndex = 0;
let sliderTimer = null;
let isSliderPaused = false;

let userProfile = {
    name: '',
    email: '',
    telegram: '',
    telegramChatId: '',
    location: 'Tunisia',
    lang: 'English',
    joined: '',
    history: [],
    requests: [],
    usedCodes: [],
    referralCode: '',
    referrals: [],
    referralRewards: 0,
    rp: 0,
    useRpForCart: false,
    isBanned: false,
    lastDailyReward: 0,
    licences: []
};

const fallbackProducts = [
    { id: "fallback_1", name: "Mergedom", price: 11, badge: "VIP", status: "available", image: "https://picsum.photos/seed/mergedom/400/300", downloadLink: "", description: "Mergedom game with premium features.", features: ["Level Auto Bypass", "Unlimited Boost", "Game Speed"], video: "https://www.youtube.com/embed/dQw4w9WgXcQ", createdAt: new Date() },
    { id: "fallback_2", name: "Numbers Game 2048", price: 0, badge: "VIP", status: "available", image: "https://picsum.photos/seed/2048/400/300", downloadLink: "", description: "Classic 2048 game with exclusive mod features.", features: ["Unlimited Device", "Block Spawn Modify", "Game Speed"], video: "https://www.youtube.com/embed/dQw4w9WgXcQ", createdAt: new Date() },
    { id: "fallback_3", name: "Screwdom 3D", price: 0, badge: "VIP", status: "available", image: "https://picsum.photos/seed/screwdom/400/300", downloadLink: "", description: "Exciting 3D puzzle game with unlimited boosts.", features: ["Unlimited Boost", "Level Auto Complete", "Game Speed"], video: "https://www.youtube.com/embed/dQw4w9WgXcQ", createdAt: new Date() },
    { id: "fallback_4", name: "Smart Telegram Bot", price: 0, badge: "FREE", status: "available", image: "https://picsum.photos/seed/bot/400/300", downloadLink: "https://www.mediafire.com/file/example/bot.zip", description: "Advanced Telegram bot with auto-reply and group management.", features: ["Auto Replies", "Group Management", "Notifications"], video: "https://www.youtube.com/embed/dQw4w9WgXcQ", createdAt: new Date() }
];

const discountCodes = { 'SAVE10': { discount: 10 }, 'SAVE15': { discount: 15 }, 'WELCOME': { discount: 10 }, 'VIP2024': { discount: 15 }, 'SUMMER': { discount: 10 } };
const paymentWallets = {
    litecoin: { name: 'Litecoin', icon: 'fab fa-bitcoin', network: 'LTC', address: 'ltc1qy6ksn0g4hm6hlh93fwekgz8x74vr6hvdmh6zz8', currency: 'LTC', color: '#f2a900' },
    usdt: { name: 'USDT (ERC20)', icon: 'fas fa-coins', network: 'ERC20', address: '0x1234567890abcdef1234567890abcdef12345678', currency: 'USDT', color: '#26a17b' }
};
let cryptoPrices = { ltc: 0, usdt: 1, lastUpdate: null, isUpdating: false };

// ============================================================
// 6. دوال مساعدة
// ============================================================

async function checkUserBanned(uid) {
    try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const data = userSnap.data();
            return data.isBanned === true;
        }
        return false;
    } catch (error) {
        console.error('Error checking ban status:', error);
        return false;
    }
}

// ============================================================
// 7. Toast
// ============================================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const messageEl = document.getElementById('toastMessage');
    const iconEl = toast?.querySelector('.toast-icon');
    if (!toast || !messageEl) return;
    toast.className = 'toast';
    toast.classList.add(type);
    const icons = { success: '<i class="fas fa-check-circle"></i>', error: '<i class="fas fa-exclamation-circle"></i>', warning: '<i class="fas fa-exclamation-triangle"></i>', info: '<i class="fas fa-info-circle"></i>' };
    if (iconEl) iconEl.innerHTML = icons[type] || icons.success;
    messageEl.textContent = message;
    toast.classList.add('show');
    clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => { toast.classList.remove('show'); }, 3500);
}
window.hideToast = function() { document.getElementById('toast')?.classList.remove('show'); };

// ============================================================
// 8. دوال المستخدم (Firestore)
// ============================================================

async function getUserId() {
    if (userId) return userId;
    let savedId = localStorage.getItem('zi_userId');
    if (savedId) { userId = savedId; return userId; }
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    localStorage.setItem('zi_userId', userId);
    try { await setDoc(doc(db, 'users', userId), { userId, wishlist: [], cart: [], history: [], requests: [], usedCodes: [], referrals: [], referralRewards: 0, rp: 0, isBanned: false, lastDailyReward: 0, licences: [], createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true }); } catch (e) { console.error(e); }
    return userId;
}

let isLoadingUser = false;
let lastUserLoadTime = 0;

async function loadUserData() {
    const uid = currentUser ? currentUser.uid : await getUserId();
    if (!uid) return;
    if (isLoadingUser || (Date.now() - lastUserLoadTime < 500)) return;
    isLoadingUser = true;
    lastUserLoadTime = Date.now();
    if (unsubscribeUser) { unsubscribeUser(); unsubscribeUser = null; }
    try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const data = userSnap.data();
            wishlist = data.wishlist || [];
            cart = data.cart || [];
            userProfile.history = data.history || [];
            userProfile.requests = data.requests || [];
            userProfile.usedCodes = data.usedCodes || [];
            userProfile.referrals = data.referrals || [];
            userProfile.referralRewards = data.referralRewards || 0;
            userProfile.rp = data.rp || 0;
            userProfile.referralCode = data.referralCode || '';
            userProfile.name = data.name || '';
            userProfile.email = data.email || '';
            userProfile.telegram = data.telegram || '';
            userProfile.telegramChatId = data.telegramChatId || '';
            userProfile.location = data.location || data.country || 'Tunisia';
            userProfile.lang = data.lang || 'English';
            userProfile.isBanned = data.isBanned || false;
            userProfile.joined = data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '--';
            userProfile.useRpForCart = data.useRpForCart || false;
            userProfile.lastDailyReward = data.lastDailyReward || 0;
            userProfile.licences = data.licences || [];
            updateWishlistUI();
            updateCartUI();
            renderProducts(products);
            updateStatsFromProducts(products);
            generateRecommendations(products);
            updateBottomCartBar();
            updateDropdownStats();
            updateNotificationBadge();
            updateFullUserMenu();
            renderUserLicences();
            if (currentUser && currentUser.email === ADMIN_EMAIL) { loadAdminOrders(); loadAdminUsers(); loadLicences(); }
        } else {
            await setDoc(userRef, { userId: uid, wishlist: [], cart: [], history: [], requests: [], usedCodes: [], referrals: [], referralRewards: 0, rp: 0, isBanned: false, useRpForCart: false, lastDailyReward: 0, licences: [], createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
    isLoadingUser = false;
}

async function saveUserData(silent = false) {
    const uid = currentUser ? currentUser.uid : await getUserId();
    if (!uid) return;
    try {
        await setDoc(doc(db, 'users', uid), {
            wishlist,
            cart,
            history: userProfile.history,
            requests: userProfile.requests,
            usedCodes: userProfile.usedCodes,
            referrals: userProfile.referrals,
            referralRewards: userProfile.referralRewards,
            rp: userProfile.rp,
            referralCode: userProfile.referralCode,
            telegram: userProfile.telegram,
            telegramChatId: userProfile.telegramChatId,
            location: userProfile.location,
            lang: userProfile.lang,
            useRpForCart: userProfile.useRpForCart,
            isBanned: userProfile.isBanned,
            lastDailyReward: userProfile.lastDailyReward || 0,
            licences: userProfile.licences || [],
            updatedAt: serverTimestamp()
        }, { merge: true });
        localStorage.setItem('zi_wishlist_backup', JSON.stringify(wishlist));
        localStorage.setItem('zi_cart_backup', JSON.stringify(cart));
        localStorage.setItem('zi_history_backup', JSON.stringify(userProfile.history));
        localStorage.setItem('zi_requests_backup', JSON.stringify(userProfile.requests));
        localStorage.setItem('zi_usedcodes_backup', JSON.stringify(userProfile.usedCodes));
        localStorage.setItem('zi_referrals_backup', JSON.stringify(userProfile.referrals));
        localStorage.setItem('zi_referralRewards_backup', JSON.stringify(userProfile.referralRewards));
        localStorage.setItem('zi_rp_backup', JSON.stringify(userProfile.rp));
        localStorage.setItem('zi_isBanned_backup', JSON.stringify(userProfile.isBanned));
        localStorage.setItem('zi_lastDailyReward_backup', JSON.stringify(userProfile.lastDailyReward || 0));
        localStorage.setItem('zi_licences_backup', JSON.stringify(userProfile.licences || []));
        return true;
    } catch (e) {
        console.error('Save failed:', e);
        return false;
    }
}

function generateReferralCode(name, email) {
    const prefix = name ? name.substring(0, 3).toUpperCase() : 'USR';
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${random}`;
}

// ============================================================
// 9. دالة نسخ كود الترخيص
// ============================================================

function copyLicenceCode(code) {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
        showToast('✅ Licence code copied!', 'success');
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('✅ Licence code copied!', 'success');
    });
}

// ============================================================
// 10. تحديثات الواجهة
// ============================================================

function updateDropdownStats() {
    const userAvatar = document.getElementById('userAvatarText');
    if (currentUser) {
        const name = currentUser.displayName || currentUser.email || 'User';
        if (userAvatar) userAvatar.textContent = name.charAt(0).toUpperCase();
    } else { if (userAvatar) userAvatar.textContent = 'U'; }
    updateRpDisplay();
}

function updateRpDisplay() {
    const el = document.getElementById('rpDisplay');
    if (el) { el.innerHTML = `${userProfile.rp || 0} <span>RP</span>`; }
}

function updateUI() {
    const dot = document.getElementById('userDot');
    if (dot) {
        if (currentUser) {
            if (pendingCount > 0 && currentUser.email === ADMIN_EMAIL) { dot.className = 'user-dot notification-dot'; } else { dot.className = 'user-dot'; }
        } else { dot.className = 'user-dot guest'; }
    }
    updateDropdownStats();
    updateNotificationBadge();
    updateRpDisplay();
    updateFullUserMenu();
}

function updateFullUserMenu() {
    const avatar = document.getElementById('fullAvatar');
    const name = document.getElementById('fullName');
    const email = document.getElementById('fullEmail');
    const rp = document.getElementById('fullRp');
    const wishlistBadge = document.getElementById('fullWishlistBadge');
    const orderBadge = document.getElementById('fullOrderBadge');
    const notifBadge = document.getElementById('fullNotifBadge');
    const adminBadge = document.getElementById('adminMenuBadge');
    const licencesBadge = document.getElementById('licencesBadge');
    if (currentUser) {
        const displayName = currentUser.displayName || currentUser.email || 'User';
        avatar.textContent = displayName.charAt(0).toUpperCase();
        name.textContent = displayName;
        email.textContent = currentUser.email || 'No email';
        rp.textContent = userProfile.rp || 0;
        wishlistBadge.textContent = wishlist.length;
        wishlistBadge.style.display = wishlist.length > 0 ? 'inline-block' : 'none';
        const pendingOrders = userProfile.history.filter(o => (o.status || 'pending') === 'pending').length;
        const totalBadge = pendingOrders + unreadNotifications;
        if (totalBadge > 0) { orderBadge.style.display = 'inline-block'; orderBadge.textContent = totalBadge; } else { orderBadge.style.display = 'none'; }
        if (unreadNotifications > 0) { notifBadge.style.display = 'inline-block'; notifBadge.textContent = unreadNotifications; } else { notifBadge.style.display = 'none'; }
        const adminMenuItem = document.getElementById('adminMenuItem');
        if (currentUser.email === ADMIN_EMAIL) { adminMenuItem.style.display = 'flex'; if (pendingCount > 0) { adminBadge.style.display = 'inline-block'; adminBadge.textContent = pendingCount; } else { adminBadge.style.display = 'none'; } } else { adminMenuItem.style.display = 'none'; }
        if (licencesBadge) {
            const activeLicences = (userProfile.licences || []).filter(l => new Date(l.expiryDate) > new Date()).length;
            if (activeLicences > 0) { licencesBadge.style.display = 'inline-block'; licencesBadge.textContent = activeLicences; } else { licencesBadge.style.display = 'none'; }
        }
    } else {
        avatar.textContent = 'U'; name.textContent = 'Guest'; email.textContent = 'Not logged in'; rp.textContent = '0';
        wishlistBadge.style.display = 'none'; orderBadge.style.display = 'none'; notifBadge.style.display = 'none';
        document.getElementById('adminMenuItem').style.display = 'none';
        if (licencesBadge) licencesBadge.style.display = 'none';
    }
}

// ============================================================
// 11. دوال المصادقة
// ============================================================

window.showLogin = function() { document.getElementById('loginContainer').style.display = 'block'; document.getElementById('registerContainer').style.display = 'none'; };
window.showRegister = function() { document.getElementById('loginContainer').style.display = 'none'; document.getElementById('registerContainer').style.display = 'block'; };
window.toggleReferral = function() { document.getElementById('referralField').classList.toggle('show'); };

window.loginUser = async function() {
    const btn = document.getElementById('loginBtn');
    btn.classList.add('loading');
    const errorEl = document.getElementById('loginError');
    const successEl = document.getElementById('loginSuccess');
    errorEl.textContent = ''; successEl.textContent = '';
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) { errorEl.textContent = 'Please fill in all fields'; btn.classList.remove('loading'); return; }
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        currentUser = userCredential.user;
        successEl.textContent = '✅ Login successful!';
        showToast('👋 Welcome back!', 'success');
        btn.classList.remove('loading');
        setTimeout(() => {
            document.getElementById('authSection').style.display = 'none';
            document.getElementById('mainApp').style.display = 'block';
            loadUserData();
            updateDropdownStats();
            if (currentUser.email === ADMIN_EMAIL) { loadAdminOrders(); startAdminRealtimeListener(); loadAdminUsers(); loadLicences(); }
            loadDownloads(); loadNotifications(); fetchCryptoPrices(); updateFullUserMenu(); showTelegramBanner();
            loadSliderSettings();
        }, 500);
    } catch (error) { errorEl.textContent = '❌ ' + error.message; showToast('❌ Login failed', 'error'); btn.classList.remove('loading'); }
};

window.registerUser = async function() {
    const btn = document.getElementById('registerBtn');
    btn.classList.add('loading');
    const errorEl = document.getElementById('registerError');
    const successEl = document.getElementById('registerSuccess');
    errorEl.textContent = ''; successEl.textContent = '';
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const country = document.getElementById('registerCountry').value;
    const lang = document.getElementById('registerLang').value;
    const referralCode = document.getElementById('registerReferral').value.trim().toUpperCase();
    const termsChecked = document.getElementById('termsCheck').checked;
    if (!name || !email || !password || !confirmPassword) { errorEl.textContent = 'Please fill in all fields'; btn.classList.remove('loading'); return; }
    if (password.length < 6) { errorEl.textContent = 'Password must be at least 6 characters'; btn.classList.remove('loading'); return; }
    if (password !== confirmPassword) { errorEl.textContent = 'Passwords do not match'; btn.classList.remove('loading'); return; }
    if (!termsChecked) { errorEl.textContent = 'Please agree to the terms'; btn.classList.remove('loading'); return; }
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        currentUser = userCredential.user;
        const newReferralCode = generateReferralCode(name, email);
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, {
            userId: currentUser.uid, name, email, country, lang, telegram: '', telegramChatId: '', location: country,
            wishlist: [], cart: [], history: [], requests: [], usedCodes: [], referrals: [], referralRewards: 0, rp: 0, useRpForCart: false,
            referralCode: newReferralCode, isBanned: false, lastDailyReward: 0, licences: [],
            createdAt: serverTimestamp(), updatedAt: serverTimestamp()
        });
        successEl.textContent = '✅ Registration successful!';
        showToast(`🎉 Welcome, ${name}!`, 'success');
        btn.classList.remove('loading');
        setTimeout(() => {
            document.getElementById('authSection').style.display = 'none';
            document.getElementById('mainApp').style.display = 'block';
            loadUserData(); updateDropdownStats(); loadDownloads(); loadNotifications(); fetchCryptoPrices(); updateFullUserMenu(); showTelegramBanner();
            loadSliderSettings();
        }, 500);
    } catch (error) { errorEl.textContent = '❌ ' + error.message; showToast('❌ Registration failed', 'error'); btn.classList.remove('loading'); }
};

window.logoutUser = async function() {
    try {
        await signOut(auth);
        currentUser = null;
        activeDiscount = 0; activeDiscountCode = '';
        document.getElementById('adminPanel').classList.remove('open');
        closeUserMenuFull();
        if (unsubscribeAdmin) { unsubscribeAdmin(); unsubscribeAdmin = null; }
        if (unsubscribeUser) { unsubscribeUser(); unsubscribeUser = null; }
        pendingCount = 0; unreadNotifications = 0;
        document.getElementById('authSection').style.display = 'block';
        document.getElementById('mainApp').style.display = 'none';
        showToast('👋 Logged out', 'info');
        updateUI(); updateNotificationBadge(); loadUserData(); updateFullUserMenu();
    } catch (error) { showToast('❌ Logout error', 'error'); }
};

window.openForgotPassword = function() { document.getElementById('forgotPasswordModal').classList.add('open'); document.getElementById('forgotError').textContent = ''; document.getElementById('forgotSuccess').textContent = ''; };
window.closeForgotPasswordModal = function() { document.getElementById('forgotPasswordModal').classList.remove('open'); document.getElementById('authSection').style.display = 'block'; };
window.sendForgotPassword = async function() {
    const email = document.getElementById('forgotEmail').value.trim();
    const errorEl = document.getElementById('forgotError');
    const successEl = document.getElementById('forgotSuccess');
    errorEl.textContent = ''; successEl.textContent = '';
    if (!email) { errorEl.textContent = 'Please enter your email'; return; }
    try { await sendPasswordResetEmail(auth, email); successEl.textContent = '✅ Reset link sent to ' + email; showToast('📧 Password reset link sent!', 'success'); setTimeout(() => { closeForgotPasswordModal(); }, 2000); } catch (error) { errorEl.textContent = '❌ ' + error.message; showToast('❌ ' + error.message, 'error'); }
};

// ============================================================
// 12. المودالات العامة
// ============================================================

window.openUserMenuFull = function() { if (!currentUser) { openAuthModal(); return; } document.getElementById('userMenuFull').classList.add('open'); updateFullUserMenu(); document.body.style.overflow = 'hidden'; };
window.closeUserMenuFull = function() { document.getElementById('userMenuFull').classList.remove('open'); document.body.style.overflow = ''; };
window.openCartFull = function() { document.getElementById('cartFull').classList.add('open'); renderCartFull(); document.body.style.overflow = 'hidden'; };
window.closeCartFull = function() { document.getElementById('cartFull').classList.remove('open'); document.body.style.overflow = ''; };
window.openWishlistFull = function() { document.getElementById('wishlistFull').classList.add('open'); renderWishlistFull(); document.body.style.overflow = 'hidden'; };
window.closeWishlistFull = function() { document.getElementById('wishlistFull').classList.remove('open'); document.body.style.overflow = ''; };
window.openProfileFull = function() { if (!currentUser) { showToast('⚠️ Please login first', 'warning'); openAuthModal(); return; } document.getElementById('profileFull').classList.add('open'); renderProfileFull(); document.body.style.overflow = 'hidden'; };
window.closeProfileFull = function() { document.getElementById('profileFull').classList.remove('open'); document.body.style.overflow = ''; };
window.openHistoryFull = function() { if (!currentUser) { showToast('⚠️ Please login first', 'warning'); openAuthModal(); return; } document.getElementById('historyFull').classList.add('open'); renderHistoryFull(); document.body.style.overflow = 'hidden'; };
window.closeHistoryFull = function() { document.getElementById('historyFull').classList.remove('open'); document.body.style.overflow = ''; };
window.openDownloads = function() { document.getElementById('downloadsModal').classList.add('open'); };
window.closeDownloads = function() { document.getElementById('downloadsModal').classList.remove('open'); };
window.openNotifications = function() { document.getElementById('notificationsModal').classList.add('open'); };
window.closeNotifications = function() { document.getElementById('notificationsModal').classList.remove('open'); };
function openAuthModal() { document.getElementById('authSection').scrollIntoView({ behavior: 'smooth' }); }

// ============================================================
// 13. عرض الملف الشخصي
// ============================================================

function renderProfileFull() {
    const container = document.getElementById('profileFullContent');
    if (!currentUser) {
        container.innerHTML = `<div style="text-align:center;padding:40px 20px;color:var(--text-secondary);"><i class="fas fa-user-circle" style="font-size:48px;opacity:0.15;display:block;margin-bottom:12px;"></i><div style="font-size:18px;font-weight:600;">Please login</div><div style="font-size:13px;opacity:0.4;margin-top:4px;">Login to view your profile</div></div>`;
        return;
    }
    const displayName = currentUser.displayName || currentUser.email || 'User';
    const maskedChatId = userProfile.telegramChatId ? userProfile.telegramChatId.slice(0, 4) + '***' + userProfile.telegramChatId.slice(-4) : 'Not linked';
    const activeLicences = (userProfile.licences || []).filter(l => new Date(l.expiryDate) > new Date()).length;
    container.innerHTML = `
    <div style="background:var(--card-bg);border-radius:14px;border:1px solid var(--border);padding:16px;margin-bottom:12px;">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--border);">
        <div style="width:56px;height:56px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:#fff;flex-shrink:0;">${displayName.charAt(0).toUpperCase()}</div>
        <div>
          <div style="font-size:16px;font-weight:700;color:var(--text);">${displayName}</div>
          <div style="font-size:13px;color:var(--text-secondary);">${currentUser.email || 'No email'}</div>
          <div style="font-size:13px;color:var(--text-secondary);">📍 Country: ${userProfile.location || 'Not specified'}</div>
          <div style="font-size:13px;color:var(--vip-color);font-weight:700;">🎯 RP: ${userProfile.rp || 0}</div>
          <div style="font-size:13px;color:var(--success);font-weight:600;">🔑 Licences: ${activeLicences}</div>
          ${userProfile.isBanned ? '<div style="font-size:13px;color:var(--danger);font-weight:700;">🚫 BANNED</div>' : ''}
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">
        <div style="background:var(--bg);border-radius:8px;padding:10px;text-align:center;border:1px solid var(--border);"><div style="font-size:18px;font-weight:700;color:var(--text);">${userProfile.history.length}</div><div style="font-size:10px;color:var(--text-secondary);">Orders</div></div>
        <div style="background:var(--bg);border-radius:8px;padding:10px;text-align:center;border:1px solid var(--border);"><div style="font-size:18px;font-weight:700;color:var(--vip-color);">${userProfile.rp || 0}</div><div style="font-size:10px;color:var(--text-secondary);">RP Points</div></div>
        <div style="background:var(--bg);border-radius:8px;padding:10px;text-align:center;border:1px solid var(--border);"><div style="font-size:18px;font-weight:700;color:var(--heart-color);">${wishlist.length}</div><div style="font-size:10px;color:var(--text-secondary);">Favorites</div></div>
      </div>
    </div>
    <div class="edit-profile-inline">
      <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:8px;"><i class="fas fa-edit"></i> Edit Profile</div>
      <form onsubmit="saveProfileChangesInline(event)">
        <label>Name</label><input id="editNameInline" value="${userProfile.name || currentUser.displayName || ''}" placeholder="Enter your name" type="text" />
        <label>Telegram Username</label><input id="editTelegramInline" value="${userProfile.telegram || ''}" placeholder="@username" type="text" />
        <label>Country</label><select id="editLocationInline">
          <option value="Tunisia" ${userProfile.location==='Tunisia'?'selected':''}>🇹🇳 Tunisia</option>
          <option value="Algeria" ${userProfile.location==='Algeria'?'selected':''}>🇩🇿 Algeria</option>
          <option value="Morocco" ${userProfile.location==='Morocco'?'selected':''}>🇲🇦 Morocco</option>
          <option value="Egypt" ${userProfile.location==='Egypt'?'selected':''}>🇪🇬 Egypt</option>
          <option value="Saudi Arabia" ${userProfile.location==='Saudi Arabia'?'selected':''}>🇸🇦 Saudi Arabia</option>
          <option value="UAE" ${userProfile.location==='UAE'?'selected':''}>🇦🇪 UAE</option>
          <option value="Other" ${userProfile.location==='Other'?'selected':''}>🌍 Other</option>
        </select>
        <label>Language</label><select id="editLangInline">
          <option value="English" ${userProfile.lang==='English'?'selected':''}>🇬🇧 English</option>
          <option value="Arabic" ${userProfile.lang==='Arabic'?'selected':''}>🇸🇦 العربية</option>
          <option value="French" ${userProfile.lang==='French'?'selected':''}>🇫🇷 Français</option>
        </select>
        <div class="form-actions"><button type="button" class="btn-cancel" onclick="renderProfileFull()">Cancel</button><button type="submit" class="btn-save"><i class="fas fa-save"></i> Save</button></div>
      </form>
    </div>
    <div class="password-inline">
      <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:8px;"><i class="fas fa-lock"></i> Password & Security</div>
      <div class="ps-email"><span>${currentUser.email || 'No email'}</span><button onclick="sendResetLinkInline()"><i class="fas fa-paper-plane"></i> Send Reset Link</button></div>
      <div style="border-top:1px solid var(--border);padding-top:12px;margin-top:8px;">
        <div style="font-size:12px;color:var(--text-secondary);opacity:0.4;margin-bottom:6px;">Use your current password to set a new one instantly.</div>
        <div class="auth-field"><label>Current Password</label><input id="currentPasswordInline" placeholder="Enter current password" type="password" /></div>
        <div class="auth-field"><label>New Password</label><input id="newPasswordInline" placeholder="Enter new password (min 6 chars)" type="password" /></div>
        <div class="auth-field"><label>Confirm New Password</label><input id="confirmNewPasswordInline" placeholder="Confirm new password" type="password" /></div>
        <button class="auth-btn" onclick="changePasswordInline()"><i class="fas fa-key"></i> Change Password</button>
        <div class="auth-error" id="passwordErrorInline"></div><div class="auth-success" id="passwordSuccessInline"></div>
      </div>
    </div>
    <div class="telegram-bind-section" style="margin-top:12px;">
      <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:6px;"><i class="fab fa-telegram-plane" style="color:#0088cc;"></i> Telegram Notifications</div>
      <div class="tb-row"><span class="tb-label">Status</span><span class="tb-value"><span class="tb-status ${userProfile.telegramChatId?'linked':'unlinked'}">${userProfile.telegramChatId?'✅ Linked':'❌ Unlinked'}</span></span></div>
      ${userProfile.telegramChatId?`<div class="tb-row"><span class="tb-label">Bound Chat ID</span><span class="tb-value" style="font-family:monospace;letter-spacing:1px;">${maskedChatId}</span></div><div class="tb-row"><span class="tb-label">Bot</span><span class="tb-value" style="color:#0088cc;">@${BOT_USERNAME}</span></div>`:''}
      <div style="background:var(--card-bg);padding:10px;border-radius:8px;margin:8px 0;border:1px solid var(--border);">
        <div style="font-size:13px;color:var(--text-secondary);"><i class="fas fa-info-circle" style="color:var(--primary);"></i> ${userProfile.telegramChatId ? 'You will receive order notifications here.' : 'Click "Link Bot" to connect your Telegram account.'}</div>
      </div>
      <div class="tb-actions">
        <button class="btn-bind" onclick="bindTelegram()" style="flex:1;background:var(--primary);color:#fff;border:none;border-radius:8px;padding:8px 16px;font-weight:600;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;gap:8px;"><i class="fab fa-telegram-plane"></i> ${userProfile.telegramChatId?'Re-link':'Link Bot'}</button>
        ${userProfile.telegramChatId ? `<button class="btn-test" onclick="testTelegramNotification()" style="background:var(--success);color:#0a0a1a;border:none;border-radius:8px;padding:8px 16px;font-weight:600;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:6px;"><i class="fas fa-paper-plane"></i> Test</button>` : ''}
        <button class="btn-check" onclick="checkTelegramStatus()" style="background:var(--card-bg);border:1px solid var(--border);color:var(--text);border-radius:8px;padding:8px 16px;font-weight:600;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:6px;"><i class="fas fa-sync-alt"></i> Check</button>
        ${userProfile.telegramChatId ? `<button class="btn-unlink" onclick="unlinkTelegram()" style="background:var(--danger);color:#fff;border:none;border-radius:8px;padding:8px 16px;font-weight:600;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:6px;"><i class="fas fa-unlink"></i> Unlink</button>` : ''}
      </div>
      <div style="font-size:11px;color:var(--text-secondary);opacity:0.4;margin-top:6px;display:flex;align-items:center;gap:4px;"><i class="fab fa-telegram-plane" style="color:#0088cc;"></i> ${userProfile.telegramChatId ? `Connected to @${BOT_USERNAME}` : `Start @${BOT_USERNAME} and click "Link Bot" to connect`}</div>
    </div>`;
    setTimeout(showTelegramBanner, 300);
}

window.saveProfileChangesInline = async function(e) {
    e.preventDefault();
    if (!currentUser) { showToast('⚠️ Please login first', 'warning'); return; }
    const name = document.getElementById('editNameInline').value.trim();
    const telegram = document.getElementById('editTelegramInline').value.trim();
    const location = document.getElementById('editLocationInline').value;
    const lang = document.getElementById('editLangInline').value;
    if (!name) { showToast('⚠️ Name is required', 'warning'); return; }
    try {
        await updateProfile(currentUser, { displayName: name });
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, { name, telegram, location, lang, updatedAt: serverTimestamp() });
        userProfile.name = name; userProfile.telegram = telegram; userProfile.location = location; userProfile.lang = lang;
        showToast('✅ Profile updated!', 'success');
        updateUI(); renderProfileFull(); updateFullUserMenu();
    } catch (error) { showToast('❌ Error: ' + error.message, 'error'); }
};

window.sendResetLinkInline = async function() { if (!currentUser) return; try { await sendPasswordResetEmail(auth, currentUser.email); showToast(`📧 Reset link sent to ${currentUser.email}`, 'success'); } catch (error) { showToast('❌ ' + error.message, 'error'); } };
window.changePasswordInline = async function() { if (!currentUser) return; const currentPwd = document.getElementById('currentPasswordInline').value; const newPwd = document.getElementById('newPasswordInline').value; const confirmPwd = document.getElementById('confirmNewPasswordInline').value; const errorEl = document.getElementById('passwordErrorInline'); const successEl = document.getElementById('passwordSuccessInline'); errorEl.textContent = ''; successEl.textContent = ''; if (!currentPwd || !newPwd || !confirmPwd) { errorEl.textContent = 'Please fill all fields'; return; } if (newPwd.length < 6) { errorEl.textContent = 'New password must be at least 6 characters'; return; } if (newPwd !== confirmPwd) { errorEl.textContent = 'Passwords do not match'; return; } try { const credential = EmailAuthProvider.credential(currentUser.email, currentPwd); await reauthenticateWithCredential(currentUser, credential); await updatePassword(currentUser, newPwd); successEl.textContent = '✅ Password changed successfully!'; showToast('✅ Password updated!', 'success'); document.getElementById('currentPasswordInline').value = ''; document.getElementById('newPasswordInline').value = ''; document.getElementById('confirmNewPasswordInline').value = ''; setTimeout(() => { successEl.textContent = ''; }, 3000); } catch (error) { errorEl.textContent = '❌ ' + error.message; showToast('❌ ' + error.message, 'error'); } };

// ============================================================
// 14. المنتجات
// ============================================================

async function loadProductsFromFirestore() {
    try {
        const productsRef = collection(db, 'products');
        const querySnapshot = await getDocs(query(productsRef, orderBy('createdAt', 'desc')));
        const productsList = [];
        querySnapshot.forEach((doc) => { productsList.push({ id: doc.id, ...doc.data() }); });
        return productsList;
    } catch (error) { console.error('Error loading products:', error); return []; }
}

function startProductsRealtimeListener() {
    if (unsubscribeProducts) { unsubscribeProducts(); }
    renderProducts([], true);
    const productsRef = collection(db, 'products');
    unsubscribeProducts = onSnapshot(query(productsRef, orderBy('createdAt', 'desc')), (snapshot) => {
        const productsList = [];
        snapshot.forEach((doc) => { productsList.push({ id: doc.id, ...doc.data() }); });
        products = productsList.length > 0 ? productsList : fallbackProducts;
        renderProducts(products, false);
        renderAdminProducts(products);
        updateStatsFromProducts(products);
        generateRecommendations(products);
        updateBottomCartBar();
        updateRpDisplay();
        renderFeaturedProducts();
        updateSlideProductSelect();
    }, (error) => { console.error('Products listener error:', error); products = fallbackProducts; renderProducts(products, false); renderAdminProducts(products); updateStatsFromProducts(products); renderFeaturedProducts(); });
}

function renderProducts(productsList, isLoading = false) {
    const container = document.getElementById('productList');
    if (!container) return;
    if (isLoading) {
        container.innerHTML = Array(4).fill(`
            <div class="product-card skeleton">
                <div class="image-wrapper skeleton-img"></div>
                <div class="skeleton-text long"></div>
                <div class="skeleton-text short"></div>
                <div class="skeleton-btn"></div>
            </div>
        `).join('');
        return;
    }
    const list = productsList || [];
    if (list.length === 0) { container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:20px 0;color:var(--text-secondary);font-size:14px;"><i class="fas fa-search" style="font-size:28px;opacity:0.2;display:block;margin-bottom:4px;"></i><p>No products</p></div>`; return; }
    let filtered = [...list];
    if (currentFilter === 'free') filtered = filtered.filter(p => p.price === 0);
    else if (currentFilter === 'paid') filtered = filtered.filter(p => p.price > 0);
    if (filtered.length === 0) { container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:20px 0;color:var(--text-secondary);font-size:14px;"><i class="fas fa-search" style="font-size:28px;opacity:0.2;display:block;margin-bottom:4px;"></i><p>No results</p></div>`; return; }
    container.innerHTML = filtered.map(p => {
        const isFree = p.price === 0;
        const isUnavailable = p.status === 'unavailable';
        const inCart = cart.some(item => item.id === p.id && !item.isVip);
        const inWish = wishlist.includes(p.id);
        const qty = cart.find(item => item.id === p.id)?.quantity || 0;
        const badgeLabel = isFree ? 'FREE' : (isUnavailable ? 'Unavailable' : (p.badge || 'VIP'));
        const badgeClass = isUnavailable ? 'unavailable' : (isFree ? 'free' : 'vip');
        const displayFeatures = p.features ? p.features.slice(0, 3) : [];
        let displayPrice = p.price;
        let originalPrice = '';
        let discountBadge = '';
        if (activeDiscount > 0 && p.price > 0) {
            const discounted = displayPrice - (displayPrice * activeDiscount / 100);
            displayPrice = discounted;
            originalPrice = `<span class="original-price">${p.price} $</span>`;
            discountBadge = `<span class="discount-badge">-${activeDiscount}%</span>`;
        }
        return `
      <div class="product-card" onclick="window.openDetails('${p.id}')">
        <div class="product-actions-top">
          <button class="share-btn" onclick="event.stopPropagation(); openShareModal('${p.id}')" title="Share"><i class="fas fa-share-alt"></i></button>
          <button class="wishlist-btn" onclick="event.stopPropagation(); window.toggleWishlist('${p.id}')"><i class="fas fa-heart heart-icon ${inWish?'liked':''}"></i></button>
        </div>
        <div class="image-wrapper">
          ${p.image?`<img src="${p.image}" alt="${p.name}" loading="lazy" />`:`<div class="placeholder"><i class="fas fa-code"></i></div>`}
          <div class="image-badge ${badgeClass}">${badgeLabel}</div>
        </div>
        <div class="product-name">${p.name}</div>
        <div class="features-list">
          ${displayFeatures.map(f=>`<span class="feature-item"><i class="fas fa-circle"></i> ${f}</span>`).join('')}
          ${displayFeatures.length>0 && p.features && p.features.length>3?`<span class="feature-item" style="opacity:0.2;">+${p.features.length-3}</span>`:''}
        </div>
        <div class="price">
          ${isUnavailable?'⛔ Unavailable':(isFree?'FREE':(displayPrice.toFixed(2)+' $'))}
          ${originalPrice} ${discountBadge}
        </div>
        <div class="card-actions">
          <button class="btn-details" onclick="event.stopPropagation(); window.openDetails('${p.id}')"><i class="fas fa-info-circle"></i></button>
          ${isUnavailable?`<button class="btn-download" style="background:var(--text-secondary);color:#fff;cursor:not-allowed;opacity:0.4;" onclick="event.preventDefault();showToast('⛔ Unavailable','warning')"><i class="fas fa-times-circle"></i></button>`:(isFree?`<a href="${p.downloadLink||'#'}" class="btn-download" ${p.downloadLink?'target="_blank"':'onclick="event.preventDefault();showToast(\'⏳ Coming soon\',\'info\')"'}><i class="fas fa-download"></i></a>`:`<button class="btn-add-cart ${inCart?'added':''}" onclick="event.stopPropagation(); window.addToCart('${p.id}')"><i class="fas ${inCart?'fa-check':'fa-cart-plus'}"></i> ${inCart?qty:''}</button>`)}
        </div>
      </div>
    `;
    }).join('');
}

function updateStatsFromProducts(productsList) {
    const total = productsList.length;
    const free = productsList.filter(p => p.price === 0).length;
    const vip = productsList.filter(p => p.price > 0).length;
    const totalEl = document.getElementById('totalScripts');
    const freeEl = document.getElementById('freeScripts');
    const vipEl = document.getElementById('vipScripts');
    const wishlistEl = document.getElementById('wishlistStats');
    if (totalEl) totalEl.textContent = total;
    if (freeEl) freeEl.textContent = free;
    if (vipEl) vipEl.textContent = vip;
    if (wishlistEl) wishlistEl.textContent = wishlist.length;
}

function generateRecommendations(productsList) {
    const grid = document.getElementById('recommendationsGrid');
    if (!grid) return;
    const list = productsList || [];
    const shuffled = [...list].sort(() => 0.5 - Math.random());
    const top = shuffled.slice(0, 4);
    if (top.length === 0) { grid.innerHTML = `<div class="rec-empty" style="grid-column:1/-1;text-align:center;padding:12px;color:var(--text-secondary);font-size:13px;"><i class="fas fa-lightbulb" style="display:block;font-size:24px;opacity:0.2;margin-bottom:4px;"></i><p>Start exploring scripts!</p></div>`; return; }
    grid.innerHTML = top.map(p => `<div class="rec-item" onclick="window.openDetails('${p.id}')"><img src="${p.image||'https://picsum.photos/seed/default/200/120'}" alt="${p.name}" /><div class="r-name">${p.name}</div><div class="r-price">${p.price===0?'FREE':p.price+' $'}</div></div>`).join('');
}

// ============================================================
// 15. المنتجات المميزة و السلة والمفضلة
// ============================================================

function renderFeaturedProducts() {
    const grid = document.getElementById('featuredGrid');
    if (!grid) return;
    let productsToShow = [];
    if (featuredSettings.selectedProductIds.length > 0) {
        productsToShow = products.filter(p => featuredSettings.selectedProductIds.includes(p.id));
    }
    if (productsToShow.length === 0) {
        productsToShow = products.slice(0, 4);
    }
    if (productsToShow.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:12px;color:var(--text-secondary);font-size:13px;">No products available</div>`;
        return;
    }
    featuredProducts = productsToShow;
    featuredCurrentIndex = 0;
    displayFeaturedSlice();
}

function displayFeaturedSlice() {
    const grid = document.getElementById('featuredGrid');
    if (!grid || featuredProducts.length === 0) return;
    const start = featuredCurrentIndex;
    const end = Math.min(start + 4, featuredProducts.length);
    const slice = featuredProducts.slice(start, end);
    if (slice.length === 0) { featuredCurrentIndex = 0; displayFeaturedSlice(); return; }
    grid.innerHTML = slice.map(p => {
        const badgeClass = p.price === 0 ? 'free' : (p.status === 'unavailable' ? 'unavailable' : 'vip');
        const badgeText = p.price === 0 ? 'FREE' : (p.badge || 'VIP');
        return `
        <div class="featured-item" onclick="window.openDetails('${p.id}')">
            <div class="featured-item-image">
                <img src="${p.image || 'https://picsum.photos/seed/default/200/150'}" alt="${p.name}" loading="lazy" />
                <span class="featured-item-badge ${badgeClass}">${badgeText}</span>
            </div>
            <div class="featured-item-name">${p.name}</div>
            <div class="featured-item-price">${p.price === 0 ? 'FREE' : '$' + p.price.toFixed(2)}</div>
        </div>
    `}).join('');
}

function startFeaturedRotation() { if (featuredRotationInterval) { clearInterval(featuredRotationInterval); featuredRotationInterval = null; } if (!featuredSettings.enabled || featuredProducts.length <= 4) return; featuredRotationInterval = setInterval(() => { featuredCurrentIndex = (featuredCurrentIndex + 4) % featuredProducts.length; displayFeaturedSlice(); }, featuredSettings.rotationInterval); }
function stopFeaturedRotation() { if (featuredRotationInterval) { clearInterval(featuredRotationInterval); featuredRotationInterval = null; } }

async function loadFeaturedSettings() {
    try {
        const settingsRef = doc(db, 'settings', 'featured');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) { const data = settingsSnap.data(); featuredSettings = { ...featuredSettings, ...data }; }
        renderFeaturedProducts();
        if (featuredSettings.enabled) { startFeaturedRotation(); } else { stopFeaturedRotation(); }
    } catch (error) { console.error('Error loading featured settings:', error); }
}

window.addToCart = async function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || product.price === 0) { showToast('⚠️ This script is free', 'warning'); return; }
    const existing = cart.find(item => item.id === productId && !item.isVip);
    if (existing) { existing.quantity = (existing.quantity || 1) + 1; } else { cart.push({ ...product, quantity: 1 }); }
    await saveUserData(true);
    updateCartUI();
    renderProducts(products);
    updateBottomCartBar();
    showToast(`✅ Added ${product.name} to cart`, 'success');
};

window.clearCart = async function() { if (cart.length === 0) return; cart = []; await saveUserData(); updateCartUI(); renderProducts(products); updateBottomCartBar(); showToast('🗑️ Cart cleared', 'info'); };
window.removeFromCart = async function(productId) { cart = cart.filter(item => item.id !== productId); await saveUserData(true); updateCartUI(); renderProducts(products); updateBottomCartBar(); showToast('🗑️ Removed from cart', 'info'); };
window.updateCartQuantity = async function(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    const newQty = (item.quantity || 1) + change;
    if (newQty <= 0) { await window.removeFromCart(productId); return; }
    item.quantity = newQty;
    await saveUserData();
    updateCartUI();
    updateBottomCartBar();
    renderCartFull();
};

function updateBottomCartBar() {
    const bar = document.getElementById('bottomCartBar');
    const countEl = document.getElementById('bottomCartCount');
    const totalEl = document.getElementById('bottomCartTotal');
    const totalItems = cart.reduce((s, i) => s + (i.quantity || 1), 0);
    let totalSum = 0;
    cart.forEach(item => { const qty = item.quantity || 1; totalSum += item.price * qty; });
    let rpDiscountAmount = 0;
    if (userProfile.useRpForCart) { rpDiscountAmount = Math.min((userProfile.rp || 0) * RP_TO_DOLLAR, totalSum); }
    let finalTotal = totalSum - rpDiscountAmount;
    let promoDiscountAmount = 0;
    if (activeDiscount > 0 && totalSum > 0) { promoDiscountAmount = (finalTotal * activeDiscount) / 100; finalTotal = finalTotal - promoDiscountAmount; }
    if (finalTotal < 0) finalTotal = 0;
    if (cart.length === 0) { bar.classList.remove('open'); return; }
    bar.classList.add('open');
    if (countEl) countEl.textContent = totalItems;
    if (totalEl) totalEl.textContent = '$' + finalTotal.toFixed(2);
}

function updateCartUI() {
    const count = document.getElementById('cartBadge');
    const totalItems = cart.reduce((s, i) => s + (i.quantity || 1), 0);
    if (count) count.textContent = totalItems;
    updateBottomCartBar();
    renderCartFull();
    updateFullUserMenu();
}

function renderCartFull() {
    const container = document.getElementById('cartFullContent');
    if (cart.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:40px 20px;color:var(--text-secondary);"><i class="fas fa-shopping-basket" style="font-size:48px;opacity:0.15;display:block;margin-bottom:12px;"></i><div style="font-size:18px;font-weight:600;">Cart is empty</div><div style="font-size:13px;opacity:0.4;margin-top:4px;">Start shopping to add items</div></div>`;
        return;
    }
    let html = '';
    let total = 0;
    cart.forEach(item => {
        const qty = item.quantity || 1;
        const itemTotal = item.price * qty;
        total += itemTotal;
        const product = products.find(p => p.id === item.id);
        const image = product?.image || item.image || 'https://picsum.photos/seed/default/100/100';
        const vipLabel = item.isVip ? `👑 ${item.vipPlanLabel || 'VIP'}` : '';
        html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:var(--bg);border-radius:10px;border:1px solid var(--border);margin-bottom:8px;"><div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;"><img src="${image}" style="width:44px;height:44px;border-radius:8px;object-fit:cover;" /><div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name} ${vipLabel}</div><div style="font-size:12px;color:var(--primary);font-weight:700;">$${itemTotal.toFixed(2)}</div></div></div><div style="display:flex;align-items:center;gap:6px;"><button onclick="updateCartQuantity('${item.id}',-1)" style="width:28px;height:28px;border-radius:50%;border:1px solid var(--border);background:var(--card-bg);color:var(--text);cursor:pointer;font-size:12px;">-</button><span style="min-width:20px;text-align:center;font-size:14px;font-weight:700;">${qty}</span><button onclick="updateCartQuantity('${item.id}',1)" style="width:28px;height:28px;border-radius:50%;border:1px solid var(--border);background:var(--card-bg);color:var(--text);cursor:pointer;font-size:12px;">+</button><button onclick="removeFromCart('${item.id}')" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:14px;opacity:0.3;padding:4px;"><i class="fas fa-trash-alt"></i></button></div></div>`;
    });
    let rpDiscountAmount = 0;
    let promoDiscountAmount = 0;
    let finalTotal = total;
    if (userProfile.useRpForCart) { rpDiscountAmount = Math.min((userProfile.rp || 0) * RP_TO_DOLLAR, total); finalTotal = total - rpDiscountAmount; }
    if (activeDiscount > 0 && total > 0) { promoDiscountAmount = (finalTotal * activeDiscount) / 100; finalTotal = finalTotal - promoDiscountAmount; }
    if (finalTotal < 0) finalTotal = 0;
    html += `
    <div style="background:var(--bg);border-radius:10px;padding:12px;border:1px solid var(--border);margin:8px 0;">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;font-size:13px;">
        <span style="color:var(--text-secondary);opacity:0.5;display:flex;align-items:center;gap:6px;"><i class="fas fa-star" style="color:var(--vip-color);"></i> Loyalty Points (RP)</span>
        <span style="color:var(--text);font-weight:600;">${userProfile.rp || 0} RP (≈ $${((userProfile.rp || 0) * RP_TO_DOLLAR).toFixed(2)})</span>
      </div>
      <button class="rp-btn ${userProfile.useRpForCart?'active':''}" onclick="toggleRpInCart()" style="width:100%;padding:6px;border:1px solid var(--border);border-radius:6px;background:var(--card-bg);color:var(--text);cursor:pointer;font-size:12px;transition:0.3s;margin-top:4px;">
        <i class="fas ${userProfile.useRpForCart?'fa-check-circle':'fa-circle'}"></i>
        ${userProfile.useRpForCart?'Use RP ✓':'Use RP'}
      </button>
    </div>
    <div style="background:var(--bg);border-radius:10px;padding:12px;border:1px solid var(--border);margin:8px 0;">
      <div style="display:flex;gap:6px;align-items:center;">
        <input id="cartPromoInput" placeholder="Enter promo code..." style="flex:1;padding:6px 10px;border:1px solid var(--border);border-radius:6px;background:var(--card-bg);color:var(--text);font-size:13px;outline:none;" type="text" />
        <button onclick="applyCartPromo()" style="padding:6px 14px;border:none;border-radius:6px;background:var(--primary);color:#fff;font-weight:600;cursor:pointer;font-size:12px;transition:0.3s;white-space:nowrap;"><i class="fas fa-ticket-alt"></i> Apply</button>
      </div>
      <div class="promo-status" id="cartPromoStatus" style="font-size:11px;color:var(--text-secondary);opacity:0.4;margin-top:4px;">${activeDiscount>0?`✅ ${activeDiscount}% discount active`:'Enter a promo code for a discount'}</div>
    </div>
    <div style="margin-top:12px;padding-top:12px;border-top:2px solid var(--border);">
      <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:14px;"><span style="color:var(--text-secondary);opacity:0.5;">Subtotal</span><span style="color:var(--text);font-weight:600;">$${total.toFixed(2)}</span></div>
      ${rpDiscountAmount>0?`<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:14px;color:var(--success);"><span style="color:var(--text-secondary);opacity:0.5;">🎯 RP discount (${Math.floor(rpDiscountAmount/RP_TO_DOLLAR)} RP)</span><span style="font-weight:600;">-$${rpDiscountAmount.toFixed(2)}</span></div>`:''}
      ${activeDiscount>0?`<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:14px;color:var(--success);"><span style="color:var(--text-secondary);opacity:0.5;">🎫 Promo (${activeDiscount}%)</span><span style="font-weight:600;">-$${promoDiscountAmount.toFixed(2)}</span></div>`:''}
      <div style="display:flex;justify-content:space-between;padding:6px 0;border-top:1px solid var(--border);margin-top:4px;padding-top:6px;font-size:18px;font-weight:700;"><span style="color:var(--text-secondary);opacity:0.5;">Total</span><span style="color:var(--primary);">$${finalTotal.toFixed(2)}</span></div>
      <div style="display:flex;align-items:center;gap:12px;margin-top:16px;">
        <button onclick="closeCartFull();checkout();" style="flex:1;padding:14px 20px;border:none;border-radius:12px;background:var(--primary);color:#fff;font-weight:700;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;gap:8px;transition:0.3s;">
          <i class="fas fa-shopping-cart"></i> Checkout
        </button>
        <span style="font-size:22px;font-weight:800;color:var(--primary);min-width:80px;text-align:right;">$${finalTotal.toFixed(2)}</span>
      </div>
    </div>
  `;
    container.innerHTML = html;
}

window.toggleRpInCart = function() {
    userProfile.useRpForCart = !userProfile.useRpForCart;
    saveUserData();
    renderCartFull();
    updateBottomCartBar();
};
window.applyCartPromo = function() {
    const input = document.getElementById('cartPromoInput');
    const code = input.value.trim().toUpperCase();
    const statusEl = document.getElementById('cartPromoStatus');
    if (!code) { statusEl.textContent = '⚠️ Please enter a code'; statusEl.className = 'promo-status error'; return; }
    const codeData = discountCodes[code];
    if (!codeData) { statusEl.textContent = '❌ Invalid code'; statusEl.className = 'promo-status error'; return; }
    activeDiscount = codeData.discount; activeDiscountCode = code;
    statusEl.textContent = `✅ ${codeData.discount}% discount applied!`; statusEl.className = 'promo-status success';
    input.value = ''; renderCartFull(); showToast(`🎉 ${codeData.discount}% discount applied!`, 'success');
};

window.toggleWishlist = async function(productId) {
    const index = wishlist.indexOf(productId);
    const product = products.find(p => p.id === productId);
    if (index === -1) { wishlist.push(productId); createFloatingHearts(); showToast(`❤️ Added ${product ? product.name : ''} to favorites`, 'success'); } else { wishlist = wishlist.filter(id => id !== productId); showToast(`💔 Removed ${product ? product.name : ''} from favorites`, 'info'); }
    await saveUserData(true);
    updateWishlistUI();
    updateStatsFromProducts(products);
    renderProducts(products);
    updateFullUserMenu();
};
window.removeFromWishlist = function(id) { window.toggleWishlist(id); };

function updateWishlistUI() {
    const section = document.getElementById('wishlistSection');
    const grid = document.getElementById('wishlistGrid');
    const count = document.getElementById('wishlistBadge');
    const stats = document.getElementById('wishlistStats');
    const sub = document.getElementById('wishlistSub');
    const wlCount = wishlist.length;
    if (count) count.textContent = wlCount;
    if (stats) stats.textContent = wlCount;
    if (sub) sub.textContent = wlCount + ' items';
    if (wlCount === 0) { if (section) section.style.display = 'none'; if (grid) grid.innerHTML = `<div class="wishlist-empty"><i class="fas fa-heart"></i><p>No favorites yet</p></div>`; return; }
    if (section) section.style.display = 'block';
    const wlProducts = products.filter(p => wishlist.includes(p.id));
    if (grid) { grid.innerHTML = wlProducts.map(p => `<div class="wishlist-item" style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:var(--bg);border-radius:8px;border:1px solid var(--border);transition:0.3s;"><img src="${p.image || 'https://picsum.photos/seed/default/60/60'}" style="width:30px;height:30px;border-radius:6px;object-fit:cover;" /><div class="info" style="flex:1;min-width:0;"><h4 style="font-size:11px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</h4><div class="price" style="font-size:10px;color:var(--primary);font-weight:700;">${p.price===0?'FREE':p.price+' $'}</div></div><button class="remove-btn" onclick="window.removeFromWishlist('${p.id}')" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:11px;opacity:0.3;transition:0.3s;"><i class="fas fa-times"></i></button></div>`).join(''); }
    updateFullUserMenu();
}

function renderWishlistFull() {
    const container = document.getElementById('wishlistFullContent');
    if (wishlist.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:40px 20px;color:var(--text-secondary);"><i class="fas fa-heart" style="font-size:48px;opacity:0.15;display:block;margin-bottom:12px;"></i><div style="font-size:18px;font-weight:600;">No favorites yet</div><div style="font-size:13px;opacity:0.4;margin-top:4px;">Start adding products to your wishlist</div></div>`;
        return;
    }
    const wlProducts = products.filter(p => wishlist.includes(p.id));
    container.innerHTML = `<div style="display:grid;gap:8px;">${wlProducts.map(p=>`<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg);border-radius:10px;border:1px solid var(--border);cursor:pointer;" onclick="window.openDetails('${p.id}');closeWishlistFull();"><img src="${p.image||'https://picsum.photos/seed/default/60/60'}" style="width:44px;height:44px;border-radius:8px;object-fit:cover;" /><div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div><div style="font-size:12px;color:var(--primary);font-weight:700;">${p.price===0?'FREE':'$'+p.price}</div></div><button onclick="event.stopPropagation();removeFromWishlist('${p.id}')" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:14px;opacity:0.3;padding:8px;transition:0.3s;"><i class="fas fa-times"></i></button></div>`).join('')}</div>`;
}

function createFloatingHearts() {
    const container = document.getElementById('floatingHearts');
    const heartCount = 6;
    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = ['❤️', '💖', '💗', '💕', '♥️', '💝'][Math.floor(Math.random() * 6)];
        heart.style.left = (10 + Math.random() * 80) + '%';
        heart.style.top = (60 + Math.random() * 30) + '%';
        heart.style.fontSize = (16 + Math.random() * 20) + 'px';
        heart.style.animationDuration = (1.2 + Math.random() * 0.8) + 's';
        container.appendChild(heart);
        setTimeout(() => heart.remove(), 2000);
    }
}

// ============================================================
// 16. عرض المنتج (Preview)
// ============================================================

window.openDetails = function(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    window._currentProduct = p;
    document.getElementById('previewImage').src = p.image || 'https://picsum.photos/seed/default/400/300';
    document.getElementById('previewName').textContent = p.name;
    document.getElementById('previewDescription').textContent = p.description || 'No description available.';
    document.getElementById('previewBadge').textContent = p.badge || 'PREMIUM';
    document.getElementById('previewVerified').textContent = p.status === 'available' ? '✅ 100% VERIFIED WORKING PRODUCT' : '⛔ UNAVAILABLE';
    const videoContainer = document.getElementById('previewVideoContainer');
    const videoIframe = document.getElementById('previewVideo');
    if (p.video && p.video.includes('youtube.com/embed/')) {
        videoIframe.src = p.video;
        videoContainer.style.display = 'block';
    } else {
        videoContainer.style.display = 'none';
        videoIframe.src = '';
    }
    const featuresContainer = document.getElementById('previewFeatures');
    if (p.features && p.features.length > 0) {
        const featuresHtml = p.features.map(f => `<li><i class="fas fa-check-circle"></i> ${f}</li>`).join('');
        featuresContainer.innerHTML = `<div class="features-header"><i class="fas fa-check-circle"></i> Features</div><ul class="features-list">${featuresHtml}</ul>`;
        featuresContainer.style.display = 'block';
    } else { featuresContainer.style.display = 'none'; }
    let priceDisplay = p.price === 0 ? 'FREE' : `$${p.price.toFixed(2)}`;
    document.getElementById('previewPrice').textContent = priceDisplay;
    const addBtn = document.getElementById('previewAddBtn');
    const inCart = cart.some(item => item.id === id && !item.isVip);
    if (inCart) {
        addBtn.innerHTML = '<i class="fas fa-check"></i> Added to Cart';
        addBtn.style.background = 'var(--success)';
        addBtn.style.color = '#0a0a1a';
        addBtn.onclick = () => { closePreviewModal(); openCartFull(); };
    } else if (p.price === 0) {
        addBtn.innerHTML = '<i class="fas fa-download"></i> Download';
        addBtn.style.background = 'var(--free-color)';
        addBtn.style.color = '#0a0a1a';
        addBtn.onclick = () => { if (p.downloadLink) { window.open(p.downloadLink, '_blank'); } else { showToast('⏳ Coming soon', 'info'); } };
    } else if (p.status === 'unavailable') {
        addBtn.innerHTML = '<i class="fas fa-times-circle"></i> Unavailable';
        addBtn.style.background = 'var(--text-secondary)';
        addBtn.style.cursor = 'not-allowed';
        addBtn.onclick = () => showToast('⛔ Unavailable', 'warning');
    } else {
        addBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
        addBtn.style.background = 'var(--primary)';
        addBtn.style.color = '#fff';
        addBtn.onclick = () => {
            window.addToCart(id);
            const updatedBtn = document.getElementById('previewAddBtn');
            updatedBtn.innerHTML = '<i class="fas fa-check"></i> Added';
            updatedBtn.style.background = 'var(--success)';
            updatedBtn.style.color = '#0a0a1a';
            updatedBtn.onclick = () => { closePreviewModal(); openCartFull(); };
        };
    }
    const vipSection = document.getElementById('previewVipPricing');
    if (p.vipEnabled && p.vipPrices) {
        const vipPrices = p.vipPrices;
        const plans = [
            { key: '1m', label: '1 Month', price: vipPrices['1m'], original: vipPrices['1m_original'] },
            { key: '3m', label: '3 Months', price: vipPrices['3m'], original: vipPrices['3m_original'] },
            { key: '1y', label: '1 Year', price: vipPrices['1y'], original: vipPrices['1y_original'] },
            { key: 'lifetime', label: 'LIFETIME', price: vipPrices['lifetime'], original: vipPrices['lifetime_original'] }
        ];
        let gridHtml = ''; let hasValidPlans = false; let firstPlanKey = null;
        plans.forEach((plan, index) => {
            const priceNum = parseFloat(plan.price);
            const originalNum = parseFloat(plan.original);
            if (priceNum > 0) {
                hasValidPlans = true;
                if (!firstPlanKey) firstPlanKey = plan.key;
                const discount = (originalNum > priceNum) ? Math.round((1 - priceNum / originalNum) * 100) : 0;
                const hasDiscount = discount > 0;
                gridHtml += `
                    <div class="vip-plan ${index === 0 ? 'selected' : ''}" 
                         data-plan="${plan.key}" data-price="${priceNum}"
                         onclick="window.selectVipPlan(this, '${plan.key}')">
                        <div class="vip-plan-check"><i class="fas fa-check-circle"></i></div>
                        <div class="vip-plan-label">${plan.label}</div>
                        <div class="vip-plan-price">$${priceNum.toFixed(2)}</div>
                        ${hasDiscount ? `<div class="vip-plan-original">$${originalNum.toFixed(2)}</div><div class="vip-plan-discount">SAVE ${discount}%</div>` : ''}
                    </div>
                `;
            }
        });
        if (hasValidPlans) {
            document.getElementById('vipPricingGrid').innerHTML = gridHtml;
            vipSection.style.display = 'block';
            window._selectedVipPlan = firstPlanKey;
            const vipAddBtn = document.querySelector('.vip-add-to-cart');
            if (vipAddBtn) {
                vipAddBtn.onclick = () => { addVipPlanToCart(p); };
                vipAddBtn.dataset.productId = p.id;
            }
        } else { vipSection.style.display = 'none'; }
    } else { vipSection.style.display = 'none'; }
    document.getElementById('previewModal').classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        renderRatingSection(id);
        currentProductIdForRating = id;
        currentRating = 0;
    }, 150);
};

window.selectVipPlan = function(element, planKey) {
    document.querySelectorAll('.vip-plan').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    window._selectedVipPlan = planKey;
};

function addVipPlanToCart(product) {
    if (!product) { product = window._currentProduct; if (!product) { showToast('⚠️ Product not found', 'warning'); return; } }
    const selectedPlan = window._selectedVipPlan || '1m';
    const vipPrices = product.vipPrices;
    if (!vipPrices || !vipPrices[selectedPlan]) { showToast('⚠️ Invalid VIP plan', 'warning'); return; }
    const price = parseFloat(vipPrices[selectedPlan]);
    if (isNaN(price) || price <= 0) { showToast('⚠️ Invalid price', 'warning'); return; }
    const planLabels = { '1m': '1 Month', '3m': '3 Months', '1y': '1 Year', 'lifetime': 'LIFETIME' };
    const existing = cart.find(item => item.id === product.id && item.isVip && item.vipPlan === selectedPlan);
    if (existing) { existing.quantity = (existing.quantity || 1) + 1; } else { cart.push({ ...product, price: price, quantity: 1, isVip: true, vipPlan: selectedPlan, vipPlanLabel: planLabels[selectedPlan] || selectedPlan, originalPrice: product.price }); }
    saveUserData(true); updateCartUI(); renderProducts(products); updateBottomCartBar();
    showToast(`✅ Added ${planLabels[selectedPlan]} VIP plan for ${product.name}`, 'success');
    closePreviewModal();
}

window.closePreviewModal = function() { document.getElementById('previewModal').classList.remove('open'); document.body.style.overflow = ''; };
window.addToCartFromPreview = function() { if (window._currentProduct) { window.addToCart(window._currentProduct.id); closePreviewModal(); } };
window.shareFromPreview = function() { if (window._currentProduct) { window.openShareModal(window._currentProduct.id); } };

// ============================================================
// 17. مودال المشاركة
// ============================================================

window.openShareModal = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    shareProduct = product;
    document.getElementById('shareProductInfo').innerHTML = `<div style="display:flex;align-items:center;gap:10px;justify-content:center;"><img src="${product.image||'https://picsum.photos/seed/default/80/80'}" style="width:44px;height:44px;border-radius:8px;object-fit:cover;" /><div><div style="font-size:15px;font-weight:600;color:var(--text);">${product.name}</div><div style="font-size:13px;color:var(--primary);font-weight:700;">${product.price===0?'FREE':product.price+' $'}</div></div></div>`;
    document.getElementById('shareModal').classList.add('open');
};
window.closeShareModal = function() { document.getElementById('shareModal').classList.remove('open'); shareProduct = null; };
window.shareToWhatsApp = function() { if (!shareProduct) return; const text = `🛒 *${shareProduct.name}*\n💰 Price: ${shareProduct.price===0?'FREE':shareProduct.price+' $'}\n📝 ${shareProduct.description||''}\n🔗 Visit the store to get it!`; window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'); closeShareModal(); };
window.shareToTelegram = function() { if (!shareProduct) return; const text = `🛒 *${shareProduct.name}*\n💰 Price: ${shareProduct.price===0?'FREE':shareProduct.price+' $'}\n📝 ${shareProduct.description||''}\n🔗 Visit the store to get it!`; window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`, '_blank'); closeShareModal(); };
window.shareToFacebook = function() { if (!shareProduct) return; window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareProduct.name)}`, '_blank'); closeShareModal(); };
window.copyShareLink = function() { const url = window.location.href; navigator.clipboard.writeText(url).then(() => { showToast('✅ Link copied!', 'success'); closeShareModal(); }).catch(() => { const textArea = document.createElement('textarea'); textArea.value = url; document.body.appendChild(textArea); textArea.select(); document.execCommand('copy'); document.body.removeChild(textArea); showToast('✅ Link copied!', 'success'); closeShareModal(); }); };

// ============================================================
// 18. التصفية والبحث
// ============================================================

window.filterProducts = function(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => { btn.classList.toggle('active', btn.dataset.filter === filter); });
    renderProducts(products, false);
};

const searchInput = document.getElementById('liveSearchInput');
const searchResults = document.getElementById('searchResults');
const searchClear = document.getElementById('searchClear');
searchInput.addEventListener('input', function() {
    if (this.value.length > 0) { searchClear.classList.add('visible'); } else { searchClear.classList.remove('visible'); searchResults.classList.remove('active'); }
    performLiveSearch(this.value);
});
function performLiveSearch(query) {
    const searchTerm = query.trim().toLowerCase();
    if (!searchTerm) { searchResults.classList.remove('active'); return; }
    const results = products.filter(p => p.name.toLowerCase().includes(searchTerm) || (p.description && p.description.toLowerCase().includes(searchTerm)));
    results.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aStartsWith = aName.startsWith(searchTerm);
        const bStartsWith = bName.startsWith(searchTerm);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return aName.indexOf(searchTerm) - bName.indexOf(searchTerm);
    });
    if (results.length === 0) { searchResults.innerHTML = `<div style="text-align:center;padding:16px;color:var(--text-secondary);"><i class="fas fa-search" style="font-size:24px;opacity:0.2;display:block;margin-bottom:4px;"></i><div style="font-size:14px;font-weight:600;">No results</div><div style="font-size:12px;opacity:0.4;">No products match "${searchTerm}"</div></div>`; searchResults.classList.add('active'); return; }
    searchResults.innerHTML = results.slice(0, 10).map(p => {
        const isFree = p.price === 0;
        const isUnavailable = p.status === 'unavailable';
        const priceDisplay = isUnavailable ? '⛔ Unavailable' : (isFree ? 'FREE' : '$' + p.price);
        const badgeClass = isUnavailable ? 'unavailable' : (isFree ? 'free' : 'vip');
        const badgeText = isUnavailable ? '⛔' : (isFree ? 'FREE' : 'VIP');
        return `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;cursor:pointer;transition:0.2s;border-bottom:1px solid var(--border);" onclick="window.openDetails('${p.id}'); closeSearchResults();">
        <img src="${p.image||'https://picsum.photos/seed/default/100/100'}" style="width:36px;height:36px;border-radius:6px;object-fit:cover;" />
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${highlightText(p.name,searchTerm)}</div>
          <div style="font-size:12px;color:var(--primary);font-weight:700;">${priceDisplay}</div>
        </div>
        <span style="padding:2px 10px;border-radius:12px;font-size:9px;font-weight:700;background:${badgeClass==='vip'?'var(--vip-color)':badgeClass==='free'?'var(--free-color)':'var(--danger)'};color:${badgeClass==='vip'||badgeClass==='free'?'#0a0a1a':'#fff'};">${badgeText}</span>
      </div>
    `;
    }).join('');
    searchResults.classList.add('active');
}

function highlightText(text, query) { if (!query) return text; const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi'); return text.replace(regex, '<span style="color: var(--primary); font-weight: 700;">$1</span>'); }
document.addEventListener('click', function(e) { const wrapper = document.querySelector('.search-wrapper'); if (wrapper && !wrapper.contains(e.target)) { searchResults.classList.remove('active'); } });
window.clearSearch = function() { searchInput.value = ''; searchClear.classList.remove('visible'); searchResults.classList.remove('active'); searchInput.focus(); };
function closeSearchResults() { searchResults.classList.remove('active'); searchInput.value = ''; searchClear.classList.remove('visible'); }
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') { closeSearchResults(); closeUserMenuFull(); closeCartFull(); closeWishlistFull(); closeProfileFull(); closeHistoryFull(); } });

// ============================================================
// 19. الدفع
// ============================================================

async function fetchCryptoPrices() {
    if (cryptoPrices.isUpdating) return;
    cryptoPrices.isUpdating = true;
    try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=LTCUSDT');
        const data = await response.json();
        if (data && data.price) { cryptoPrices.ltc = parseFloat(data.price); cryptoPrices.usdt = 1; cryptoPrices.lastUpdate = new Date(); updatePriceUI(); }
    } catch (error) {
        console.error('Error fetching crypto prices:', error);
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=litecoin,tether&vs_currencies=usd');
            const data = await response.json();
            if (data.litecoin && data.litecoin.usd) { cryptoPrices.ltc = data.litecoin.usd; cryptoPrices.usdt = data.tether?.usd || 1; cryptoPrices.lastUpdate = new Date(); updatePriceUI(); }
        } catch (e) { console.error('Fallback fetch failed:', e); }
    }
    cryptoPrices.isUpdating = false;
}
function getLTCPrice() { return cryptoPrices.ltc || 42; }
function getUSDTPrice() { return cryptoPrices.usdt || 1; }
function updatePriceUI() {
    const exchangeRate = document.getElementById('exchangeRate');
    if (exchangeRate) {
        if (selectedPayment === 'litecoin' && cryptoPrices.ltc > 0) {
            exchangeRate.textContent = `1 LTC ≈ $${cryptoPrices.ltc.toFixed(2)} USD`;
        } else if (selectedPayment === 'usdt' && cryptoPrices.usdt > 0) {
            exchangeRate.textContent = `1 USDT ≈ $${cryptoPrices.usdt.toFixed(2)} USD`;
        } else {
            exchangeRate.textContent = '⏳ Loading prices...';
        }
    }
    const cryptoAmount = document.getElementById('cryptoAmount');
    if (cryptoAmount && selectedPayment) {
        const total = parseFloat(document.getElementById('step2Total')?.textContent?.replace('$', '') || '0');
        if (selectedPayment === 'litecoin' && cryptoPrices.ltc > 0) {
            cryptoAmount.textContent = (total / cryptoPrices.ltc).toFixed(4) + ' LTC';
        } else if (selectedPayment === 'usdt' && cryptoPrices.usdt > 0) {
            cryptoAmount.textContent = (total / cryptoPrices.usdt).toFixed(2) + ' USDT';
        }
    }
}
function updatePayableTotal() {
    let total = 0; cart.forEach(item => { const qty = item.quantity || 1; total += item.price * qty; });
    let finalTotal = total;
    if (userProfile.useRpForCart) { const rpDiscount = Math.min((userProfile.rp || 0) * RP_TO_DOLLAR, total); finalTotal = total - rpDiscount; }
    if (activeDiscount > 0 && total > 0) { const discountAmount = (finalTotal * activeDiscount) / 100; finalTotal = finalTotal - discountAmount; }
    if (finalTotal < 0) finalTotal = 0;
    document.getElementById('payableTotal').textContent = '$' + finalTotal.toFixed(2);
}

window.selectPayment = function(method) {
    selectedPayment = method;
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
    const optionMap = { 'litecoin': 'optionLitecoin', 'usdt': 'optionUsdt', 'telegram': 'optionTelegram' };
    const optionEl = document.getElementById(optionMap[method]);
    if (optionEl) optionEl.classList.add('selected');
    if (method === 'litecoin' || method === 'usdt') {
        const wallet = method === 'litecoin' ? paymentWallets.litecoin : paymentWallets.usdt;
        document.getElementById('paymentMethodName').textContent = wallet.name;
        document.getElementById('cryptoNetwork').textContent = wallet.network;
        document.getElementById('walletAddressDisplay').textContent = wallet.address;
        updatePriceUI();
    }
    updatePayableTotal();
};

window.continuePayment = function() {
    if (!selectedPayment) { showToast('⚠️ Please select a payment method', 'warning'); return; }
    document.getElementById('paymentStep1').style.display = 'none';
    document.getElementById('paymentStep2').classList.add('active');
    renderPaymentProducts();
    let total = 0; cart.forEach(item => { const qty = item.quantity || 1; total += item.price * qty; });
    let rpDiscountAmount = 0;
    if (userProfile.useRpForCart) { rpDiscountAmount = Math.min((userProfile.rp || 0) * RP_TO_DOLLAR, total); }
    let finalTotal = total - rpDiscountAmount;
    let promoDiscountAmount = 0;
    if (activeDiscount > 0 && total > 0) { promoDiscountAmount = (finalTotal * activeDiscount) / 100; finalTotal = finalTotal - promoDiscountAmount; }
    if (finalTotal < 0) finalTotal = 0;
    document.getElementById('step2Subtotal').textContent = `$${total.toFixed(2)}`;
    document.getElementById('step2Total').textContent = `$${finalTotal.toFixed(2)}`;
    
    fetchCryptoPrices();
    setTimeout(updatePriceUI, 500);
    
    const walletInfo = document.querySelector('.wallet-info');
    const txInput = document.getElementById('transactionHashInput');
    const confirmBtn = document.querySelector('.payment-btn[onclick="placeOrder()"]');
    const cryptoAmount = document.getElementById('cryptoAmount');
    if (selectedPayment === 'telegram') {
        if (walletInfo) walletInfo.style.display = 'none';
        if (txInput) txInput.style.display = 'none';
        if (confirmBtn) {
            confirmBtn.innerHTML = '<i class="fab fa-telegram-plane"></i> Contact via Telegram';
            confirmBtn.onclick = function() {
                const message = `🛒 New Order\n\nTotal: $${finalTotal.toFixed(2)}\nProducts: ${cart.map(i => i.name).join(', ')}`;
                window.open(`https://t.me/Mitalica69?text=${encodeURIComponent(message)}`, '_blank');
                placeOrderTelegram();
            };
        }
        if (cryptoAmount) cryptoAmount.textContent = '💬 Chat with us';
    } else {
        if (walletInfo) walletInfo.style.display = 'block';
        if (txInput) txInput.style.display = 'block';
        if (confirmBtn) {
            confirmBtn.innerHTML = '<i class="fas fa-check"></i> Confirm Payment';
            confirmBtn.onclick = placeOrder;
        }
        fetchCryptoPrices();
    }
};

window.goToStep1 = function() { document.getElementById('paymentStep1').style.display = 'block'; document.getElementById('paymentStep2').classList.remove('active'); };
window.copyWalletAddress = function() {
    const address = document.getElementById('walletAddressDisplay').textContent;
    if (address) {
        navigator.clipboard.writeText(address).then(() => { showToast('✅ Address copied!', 'success'); })
        .catch(() => { const textArea = document.createElement('textarea'); textArea.value = address; document.body.appendChild(textArea); textArea.select(); document.execCommand('copy'); document.body.removeChild(textArea); showToast('✅ Address copied!', 'success'); });
    }
};

function renderPaymentProducts() {
    const container = document.getElementById('paymentProductsList');
    if (!container) return;
    if (!cart || cart.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:8px;color:var(--text-secondary);opacity:0.4;">No products</div>';
        return;
    }
    container.innerHTML = cart.map(item => {
        const qty = item.quantity || 1;
        const total = item.price * qty;
        const product = products.find(p => p.id === item.id);
        const image = product?.image || item.image || 'https://picsum.photos/seed/default/80/80';
        const name = item.isVip ? `${item.name} 👑 ${item.vipPlanLabel || 'VIP'}` : item.name;
        return `
            <div class="payment-product-item">
                <img src="${image}" alt="${item.name}" />
                <div class="pp-info">
                    <div class="pp-name">${name}</div>
                    <div class="pp-price">${total.toFixed(2)} $</div>
                </div>
                <div class="pp-qty">×${qty}</div>
            </div>
        `;
    }).join('');
}

// ============================================================
// 20. إرسال الطلب (مع منع التكرار)
// ============================================================

async function sendOrderToTelegram(method, txHash = null) {
    if (isProcessingOrder) {
        showToast('⏳ Order is already being processed...', 'warning');
        return;
    }
    isProcessingOrder = true;
    
    try {
        if (!currentUser) { showToast('⚠️ Please login first', 'warning'); return; }
        if (currentUser.isAnonymous) { 
            showToast('⚠️ Please sign in to place an order.', 'warning'); 
            openAuthModal();
            return;
        }

        let total = 0;
        let itemsList = '';
        const productNames = [];
        const orderId = 'order_' + Date.now();

        cart.forEach((item, i) => {
            const qty = item.quantity || 1;
            const sub = item.price * qty;
            total += sub;
            itemsList += `${i+1}. ${item.name} × ${qty} = ${sub.toFixed(2)} $\n`;
            productNames.push(item.name);
        });

        let finalTotal = total;
        let discountText = '';
        let rpDiscountAmount = 0;
        if (userProfile.useRpForCart) {
            rpDiscountAmount = Math.min((userProfile.rp || 0) * RP_TO_DOLLAR, total);
            finalTotal = total - rpDiscountAmount;
            discountText += `\n🎯 RP discount (${Math.floor(rpDiscountAmount/RP_TO_DOLLAR)} RP): -${rpDiscountAmount.toFixed(2)}$`;
        }
        if (activeDiscount > 0 && total > 0) {
            const discountAmount = (finalTotal * activeDiscount) / 100;
            finalTotal = finalTotal - discountAmount;
            discountText += `\n🎫 Promo (${activeDiscount}%): -${discountAmount.toFixed(2)}$`;
        }

        let adminMsg = '🛒 **New Order**\n\n';
        adminMsg += `📎 **Order ID:** #${orderId.slice(-6)}\n`;
        adminMsg += `👤 **Customer:** ${currentUser.displayName || currentUser.email || 'Unknown'}\n`;
        adminMsg += `📧 **Email:** ${currentUser.email || 'N/A'}\n`;
        adminMsg += `📅 **Date:** ${new Date().toLocaleString()}\n\n`;
        adminMsg += `📦 **Products:**\n${itemsList}\n`;
        adminMsg += `💰 **Total:** ${finalTotal.toFixed(2)}$\n`;
        adminMsg += `💬 **Payment Method:** ${method}\n`;
        if (txHash) adminMsg += `🔍 **Tx Hash:** ${txHash}\n`;

        try {
            await sendTelegramNotification(TELEGRAM_CHAT_ID, adminMsg);
            console.log('✅ Admin notification sent');
        } catch (e) {
            console.error('❌ Failed to send admin notification:', e);
        }

        if (userProfile.telegramChatId) {
            const userMsg = `📦 **Order Placed!**\n\n📎 **Order #${orderId.slice(-6)}**\n📅 ${new Date().toLocaleString()}\n💰 Total: $${finalTotal.toFixed(2)}\n\nThank you for your purchase! You will receive a confirmation soon.`;
            try {
                await sendTelegramNotification(userProfile.telegramChatId, userMsg);
                console.log('✅ User notification sent');
            } catch (e) {
                console.error('❌ Failed to send user notification:', e);
            }
        }

        window.open(`https://t.me/Mitalica69?text=${encodeURIComponent(adminMsg)}`, '_blank');

        const orderItem = {
            id: orderId,
            items: cart.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity || 1 })),
            total: finalTotal,
            method: method,
            date: new Date().toISOString(),
            status: 'pending',
            txHash: txHash || null,
            rpUsed: Math.floor(rpDiscountAmount / RP_TO_DOLLAR) || 0,
            rpEarned: 0
        };

        console.log('📦 Order ID:', orderId);
        console.log('👤 Current user UID:', currentUser.uid);
        console.log('📝 Order item:', orderItem);

        const userRef = doc(db, 'users', currentUser.uid);
        try {
            await updateDoc(userRef, { history: arrayUnion(orderItem) });
            console.log('✅ Order saved successfully to Firestore');
        } catch (e) {
            console.error('❌ Error saving order history:', e);
            showToast('❌ Failed to save order. Please try again.', 'error');
            throw e;
        }
        userProfile.history.push(orderItem);

        cart = [];
        activeDiscount = 0;
        activeDiscountCode = '';
        await saveUserData();
        updateCartUI();
        updateBottomCartBar();
        renderProducts(products);
        generateRecommendations(products);
        updateRpDisplay();
        document.getElementById('paymentModal').classList.remove('open');

        showToast('📤 Order placed!', 'success');

        setTimeout(() => {
            if (currentUser && currentUser.email === ADMIN_EMAIL) { loadAdminOrders(); }
            loadUserData();
            updateDropdownStats();
            updateFullUserMenu();
        }, 1000);
    } catch (error) {
        console.error('Order error:', error);
        showToast('❌ Error placing order', 'error');
    } finally {
        isProcessingOrder = false;
    }
}

function placeOrderTelegram() {
    sendOrderToTelegram('telegram', null);
}

window.placeOrder = function() {
    if (!currentUser || currentUser.isAnonymous) {
        showToast('⚠️ Please sign in to confirm payment.', 'warning');
        openAuthModal();
        return;
    }
    const txHash = document.getElementById('transactionHashInput').value.trim();
    if (selectedPayment === 'litecoin' || selectedPayment === 'usdt') {
        if (!txHash) {
            showToast('⚠️ Please paste the transaction hash', 'warning');
            document.getElementById('transactionHashInput').style.borderColor = 'var(--danger)';
            setTimeout(() => { document.getElementById('transactionHashInput').style.borderColor = ''; }, 2000);
            return;
        }
        sendOrderToTelegram(selectedPayment, txHash);
    } else if (selectedPayment === 'telegram') {
        placeOrderTelegram();
    } else {
        showToast('⚠️ Please select a payment method', 'warning');
    }
};

window.openPaymentModal = function() {
    if (!currentUser) { showToast('⚠️ Please login first', 'warning'); openAuthModal(); return; }
    if (currentUser.isAnonymous) { showToast('⚠️ Please sign in to place an order.', 'warning'); openAuthModal(); return; }
    if (cart.length === 0) { showToast('⚠️ Cart is empty', 'warning'); return; }
    document.getElementById('paymentModal').classList.add('open');
    document.getElementById('paymentStep1').style.display = 'block';
    document.getElementById('paymentStep2').classList.remove('active');
    selectedPayment = null;
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
    updatePayableTotal(); fetchCryptoPrices();
};
window.closePaymentModal = function() { document.getElementById('paymentModal').classList.remove('open'); document.getElementById('paymentStep1').style.display = 'block'; document.getElementById('paymentStep2').classList.remove('active'); selectedPayment = null; document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected')); };
window.checkout = function() { openPaymentModal(); };

// ============================================================
// 21. دوال تيليجرام
// ============================================================

async function sendTelegramNotification(chatId, message) {
    if (!chatId) return false;
    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' })
        });
        const data = await response.json();
        if (!data.ok) { console.error('Telegram error:', data.description); return false; }
        return true;
    } catch (error) { console.error('Send error:', error); return false; }
}

window.bindTelegram = async function() {
    if (!currentUser) { showToast('⚠️ Please login first', 'warning'); return; }
    try {
        const bindCode = currentUser.uid.slice(-8) + Math.random().toString(36).substring(2, 6);
        const bindRef = doc(db, 'telegram_binds', bindCode);
        await setDoc(bindRef, { userId: currentUser.uid, userEmail: currentUser.email, userName: currentUser.displayName || 'User', createdAt: serverTimestamp(), status: 'pending' });
        const adminMessage = `🔗 *New Link Request*\n\n👤 User: ${currentUser.displayName || currentUser.email}\n📧 Email: ${currentUser.email}\n🆔 Bind Code: \`${bindCode}\``;
        await sendTelegramNotification(TELEGRAM_CHAT_ID, adminMessage);
        window.open(`https://t.me/${BOT_USERNAME}?start=bind`, '_blank');
        showToast('📨 Open bot and press "Start" then "Link Account".', 'success');
        startBindingListener(bindCode);
    } catch (error) { console.error('Telegram bind error:', error); showToast('❌ Connection error', 'error'); }
};

function startBindingListener(bindCode) {
    const bindRef = doc(db, 'telegram_binds', bindCode);
    const unsubscribe = onSnapshot(bindRef, async (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            if (data.status === 'completed' && data.telegramChatId) {
                await loadUserData();
                renderProfileFull();
                updateFullUserMenu();
                updateUI();
                showToast('✅ Telegram linked successfully!', 'success');
                const banner = document.getElementById('telegramBanner');
                if (banner) banner.classList.add('hidden');
                localStorage.removeItem('telegram_banner_hidden');
                sendTelegramNotification(userProfile.telegramChatId, `🔔 *Welcome to ZI Store!*\n\nYour account has been linked successfully.\nYou will receive order notifications here.\n\nThank you for using ZI Store! 🚀`);
                unsubscribe();
            }
        }
    });
}

window.testTelegramNotification = async function() {
    if (!currentUser) { showToast('⚠️ Please login first', 'warning'); return; }
    if (!userProfile.telegramChatId) { showToast('⚠️ No Telegram linked', 'warning'); return; }
    const result = await sendTelegramNotification(userProfile.telegramChatId, `🔔 *Test Notification*\n\nThis is a test message from ZI Store.\n📅 ${new Date().toLocaleString()}\n\nIf you see this, notifications are working! ✅`);
    if (result) showToast('✅ Test sent!', 'success'); else showToast('❌ Failed to send test.', 'error');
};

window.unlinkTelegram = async function() {
    if (!currentUser || !userProfile.telegramChatId) return;
    if (!confirm('Are you sure you want to unlink your Telegram account?')) return;
    try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, { telegramChatId: '', telegram: '', updatedAt: serverTimestamp() });
        userProfile.telegramChatId = ''; userProfile.telegram = '';
        await saveUserData();
        renderProfileFull(); updateFullUserMenu(); updateUI();
        showToast('✅ Telegram unlinked!', 'success');
    } catch (error) { showToast('❌ Error unlinking: ' + error.message, 'error'); }
};

function maskChatId(chatId) {
    if (!chatId) return 'Not linked';
    if (chatId.length <= 8) return chatId;
    return chatId.slice(0, 4) + '***' + chatId.slice(-4);
}

window.checkTelegramStatus = async function() {
    if (!currentUser) { showToast('⚠️ Please login first', 'warning'); return; }
    try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) { showToast('❌ User data not found', 'error'); return; }
        const data = userSnap.data();
        const chatId = data.telegramChatId || '';
        const username = data.telegram || '';
        userProfile.telegramChatId = chatId;
        userProfile.telegram = username;
        if (chatId) {
            const maskedId = chatId.slice(0, 4) + '***' + chatId.slice(-4);
            showToast(`✅ Telegram is linked!\n📱 Chat ID: ${maskedId}\n👤 Username: ${username || 'Not set'}`, 'success');
            const testResult = await sendTelegramNotification(chatId, `🔔 *Telegram Check Successful!*\n\n✅ Your ZI Store account is properly linked.\n📱 Chat ID: \`${chatId}\`\n👤 Username: ${username || 'Not set'}\n📅 Check time: ${new Date().toLocaleString()}\n\nIf you receive this message, notifications are working perfectly! 🚀`);
            if (testResult) { showToast('✅ Test message sent to your Telegram!', 'success'); } else { showToast('⚠️ Account linked but failed to send test message. Please try "Test" button.', 'warning'); }
            renderProfileFull();
            updateFullUserMenu();
        } else {
            showToast('❌ Telegram is NOT linked.\n\nPlease click "Link Bot" to connect your account.', 'warning');
        }
        await saveUserData();
    } catch (error) { console.error('❌ Error checking Telegram status:', error); showToast('❌ Failed to check Telegram status: ' + error.message, 'error'); }
};

// ============================================================
// 22. التحميلات والإشعارات
// ============================================================

function loadDownloads() {
    if (unsubscribeDownloads) { unsubscribeDownloads(); }
    const dlRef = collection(db, 'downloads');
    unsubscribeDownloads = onSnapshot(query(dlRef, orderBy('createdAt', 'desc')), (snapshot) => {
        downloads = [];
        snapshot.forEach((doc) => { downloads.push({ id: doc.id, ...doc.data() }); });
        renderDownloads();
        renderAdminDownloads();
    }, (error) => { console.error('Downloads listener error:', error); });
}

function renderDownloads() {
    const container = document.getElementById('downloadsList');
    if (!container) return;
    if (downloads.length === 0) { container.innerHTML = `<div style="text-align:center;padding:40px 20px;color:var(--text-secondary);"><i class="fas fa-file" style="font-size:48px;opacity:0.15;display:block;margin-bottom:12px;"></i><div style="font-size:18px;font-weight:600;">No downloads</div><div style="font-size:13px;opacity:0.4;margin-top:4px;">Stay tuned for new content</div></div>`; return; }
    container.innerHTML = downloads.map(d => {
        const date = d.date || (d.createdAt ? new Date(d.createdAt.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '');
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:var(--bg);border-radius:10px;border:1px solid var(--border);margin-bottom:8px;"><div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:600;color:var(--text);">${d.title}</div><div style="font-size:11px;color:var(--text-secondary);opacity:0.4;">${d.type||'File'} • ${date}</div></div><a href="${d.downloadUrl||'#'}" target="_blank" style="padding:6px 16px;border:none;border-radius:8px;background:var(--free-color);color:#0a0a1a;font-weight:600;cursor:pointer;font-size:12px;text-decoration:none;transition:0.3s;"><i class="fas fa-download"></i></a></div>`;
    }).join('');
}

function renderAdminDownloads() {
    const container = document.getElementById('adminDownloadsList');
    if (!container) return;
    if (downloads.length === 0) { container.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-secondary);">📭 No downloads</div>`; return; }
    container.innerHTML = downloads.map(d => `<div class="admin-item"><div class="item-info"><div class="item-title">${d.title}</div><div class="item-meta">${d.type||'File'} • ${d.downloadUrl||'No link'}</div></div><div class="item-actions"><button class="btn-edit" onclick="editDownload('${d.id}')"><i class="fas fa-edit"></i></button><button class="btn-delete" onclick="deleteDownload('${d.id}')"><i class="fas fa-trash"></i></button></div></div>`).join('');
}

window.createDownload = async function(e) {
    e.preventDefault();
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) { showToast('⛔ Unauthorized', 'error'); return; }
    const title = document.getElementById('dlTitle').value.trim();
    const type = document.getElementById('dlType').value.trim();
    const description = document.getElementById('dlDescription').value.trim();
    const downloadUrl = document.getElementById('dlUrl').value.trim();
    const date = document.getElementById('dlDate').value;
    if (!title || !type || !description || !downloadUrl) { showToast('⚠️ Please fill all fields', 'warning'); return; }
    try {
        await addDoc(collection(db, 'downloads'), { title, type, description, downloadUrl, date: date || new Date().toISOString().split('T')[0], createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        showToast('✅ Download added', 'success');
        closeCreateDownloadModal();
        document.getElementById('createDownloadForm').reset();
    } catch (error) { showToast('❌ Error: ' + error.message, 'error'); }
};
window.deleteDownload = async function(id) {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) { showToast('⛔ Unauthorized', 'error'); return; }
    if (!confirm('Delete this download?')) return;
    try { await deleteDoc(doc(db, 'downloads', id)); showToast('🗑️ Download deleted', 'success'); } catch (error) { showToast('❌ Error: ' + error.message, 'error'); }
};
window.editDownload = function(id) { showToast('✏️ Edit feature coming soon', 'info'); };
window.openCreateDownloadModal = function() { if (!currentUser || currentUser.email !== ADMIN_EMAIL) { showToast('⛔ Unauthorized', 'error'); return; } document.getElementById('createDownloadModal').classList.add('open'); document.getElementById('createDownloadForm').reset(); };
window.closeCreateDownloadModal = function() { document.getElementById('createDownloadModal').classList.remove('open'); };

function loadNotifications() {
    if (unsubscribeNotifications) { unsubscribeNotifications(); }
    const notifRef = collection(db, 'notifications');
    try {
        getDocs(query(notifRef, orderBy('createdAt', 'desc'))).then((snapshot) => {
            notifications = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                if (!data.userId || data.userId === currentUser?.uid) {
                    notifications.push({ id: doc.id, ...data, readBy: data.readBy || [] });
                }
            });
            if (currentUser) {
                const userId = currentUser.uid;
                unreadNotifications = notifications.filter(n => !(n.readBy || []).includes(userId)).length;
            } else { unreadNotifications = 0; }
            updateNotificationBadge();
            renderAdminNotifications();
            renderUserNotifications();
        }).catch((error) => { console.error('Error loading notifications:', error); renderUserNotificationsFallback(); });
        unsubscribeNotifications = onSnapshot(query(notifRef, orderBy('createdAt', 'desc')), (snapshot) => {
            if (isUpdatingNotifications) return;
            notifications = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                if (!data.userId || data.userId === currentUser?.uid) {
                    notifications.push({ id: doc.id, ...data, readBy: data.readBy || [] });
                }
            });
            if (currentUser) {
                const userId = currentUser.uid;
                unreadNotifications = notifications.filter(n => !(n.readBy || []).includes(userId)).length;
            } else { unreadNotifications = 0; }
            updateNotificationBadge();
            renderAdminNotifications();
            renderUserNotifications();
        }, (error) => { console.error('Notifications listener error:', error); });
    } catch (error) { console.error('Error setting up notifications:', error); renderUserNotificationsFallback(); }
}

function renderUserNotificationsFallback() {
    const container = document.getElementById('notificationsList');
    if (!container) return;
    container.innerHTML = `<div style="text-align:center;padding:40px 20px;color:var(--text-secondary);"><i class="fas fa-bell" style="font-size:48px;opacity:0.15;display:block;margin-bottom:12px;"></i><div style="font-size:18px;font-weight:600;">No notifications</div><div style="font-size:13px;opacity:0.4;margin-top:4px;">Notifications will appear here</div></div>`;
}

function renderUserNotifications() {
    const container = document.getElementById('notificationsList');
    if (!container) return;
    if (!notifications || notifications.length === 0) { container.innerHTML = `<div style="text-align:center;padding:40px 20px;color:var(--text-secondary);"><i class="fas fa-bell" style="font-size:48px;opacity:0.15;display:block;margin-bottom:12px;"></i><div style="font-size:18px;font-weight:600;">No notifications</div><div style="font-size:13px;opacity:0.4;margin-top:4px;">Notifications will appear here</div></div>`; return; }
    let html = '';
    notifications.forEach(n => {
        const isRead = currentUser && (n.readBy || []).includes(currentUser.uid);
        let dateStr = '';
        try { if (n.createdAt) { const date = n.createdAt.toDate ? n.createdAt.toDate() : new Date(n.createdAt); dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } } catch (e) { dateStr = new Date().toLocaleDateString('en-US'); }
        html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:${!isRead?'var(--primary-glow)':'var(--bg)'};border-radius:10px;border:1px solid var(--border);margin-bottom:8px;${!isRead?'border-left:3px solid var(--primary);':''}"><div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:600;color:var(--text);">${n.title||'Notification'}</div><div style="font-size:12px;color:var(--text-secondary);">${n.message||''}</div><div style="font-size:11px;color:var(--text-secondary);opacity:0.3;">${dateStr}</div></div>${!isRead?'<span style="background:var(--notification-red);color:#fff;font-size:9px;font-weight:700;padding:2px 10px;border-radius:12px;">New</span>':''}</div>`;
    });
    container.innerHTML = html;
}

function renderAdminNotifications() {
    const container = document.getElementById('adminNotificationsList');
    if (!container) return;
    const notifRef = collection(db, 'notifications');
    getDocs(query(notifRef, orderBy('createdAt', 'desc'))).then((snapshot) => {
        let allNotifs = [];
        snapshot.forEach((doc) => { allNotifs.push({ id: doc.id, ...doc.data() }); });
        if (allNotifs.length === 0) { container.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-secondary);">📭 No notifications</div>`; return; }
        container.innerHTML = allNotifs.map(n => `<div class="admin-item"><div class="item-info"><div class="item-title">${n.title||'Notification'}</div><div class="item-meta">${n.message||''} • ${n.userId ? 'User: ' + n.userId.slice(-6) : 'Global'} • ${n.createdAt?new Date(n.createdAt.toDate()).toLocaleDateString('en-US'):''}</div></div><div class="item-actions"><button class="btn-delete" onclick="deleteNotification('${n.id}')"><i class="fas fa-trash"></i></button></div></div>`).join('');
    }).catch((error) => { console.error('Error loading admin notifications:', error); });
}

function updateNotificationBadge() {
    const badge = document.getElementById('notifBadge');
    if (badge) {
        if (unreadNotifications > 0) { badge.style.display = 'inline-flex'; badge.textContent = unreadNotifications; } else { badge.style.display = 'none'; }
    }
    updateFullUserMenu();
}

window.markAllNotificationsRead = async function() {
    if (!currentUser) return;
    if (isUpdatingNotifications) return;
    const userId = currentUser.uid;
    const unreadNotifs = notifications.filter(n => !(n.readBy || []).includes(userId));
    if (unreadNotifs.length === 0) { showToast('📭 No unread notifications', 'info'); return; }
    isUpdatingNotifications = true;
    let updatedCount = 0;
    for (const n of unreadNotifs) {
        try { await updateDoc(doc(db, 'notifications', n.id), { readBy: arrayUnion(userId) }); updatedCount++; } catch (e) { console.error('Error marking notification read:', e); }
    }
    if (updatedCount > 0) { unreadNotifications = 0; updateNotificationBadge(); renderUserNotifications(); showToast(`✅ ${updatedCount} notifications marked read`, 'success'); }
    isUpdatingNotifications = false;
};
window.clearAllNotifications = async function() {
    if (!currentUser) { showToast('⚠️ Please login first', 'warning'); return; }
    try {
        const notifRef = collection(db, 'notifications');
        const snapshot = await getDocs(query(notifRef, where('userId', '==', currentUser.uid)));
        const batch = [];
        snapshot.forEach((doc) => { batch.push(deleteDoc(doc.ref)); });
        await Promise.all(batch);
        notifications = []; unreadNotifications = 0;
        updateNotificationBadge(); renderUserNotifications(); renderAdminNotifications();
        showToast('🗑️ All notifications cleared', 'success');
    } catch (error) { console.error('Error clearing notifications:', error); showToast('❌ Error clearing notifications', 'error'); }
};
window.createNotification = async function(e) {
    e.preventDefault();
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) { showToast('⛔ Unauthorized', 'error'); return; }
    const title = document.getElementById('notifTitle').value.trim();
    const message = document.getElementById('notifMessage').value.trim();
    if (!title || !message) { showToast('⚠️ Please fill all fields', 'warning'); return; }
    try {
        await addDoc(collection(db, 'notifications'), { title, message, readBy: [], createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        showToast('✅ Notification sent', 'success');
        closeCreateNotificationModal();
        document.getElementById('createNotificationForm').reset();
    } catch (error) { showToast('❌ Error: ' + error.message, 'error'); }
};
window.deleteNotification = async function(id) {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) { showToast('⛔ Unauthorized', 'error'); return; }
    if (!confirm('Delete this notification?')) return;
    try { await deleteDoc(doc(db, 'notifications', id)); showToast('🗑️ Notification deleted', 'success'); } catch (error) { showToast('❌ Error: ' + error.message, 'error'); }
};
window.openCreateNotificationModal = function() { if (!currentUser || currentUser.email !== ADMIN_EMAIL) { showToast('⛔ Unauthorized', 'error'); return; } document.getElementById('createNotificationModal').classList.add('open'); document.getElementById('createNotificationForm').reset(); };
window.closeCreateNotificationModal = function() { document.getElementById('createNotificationModal').classList.remove('open'); };

// ============================================================
// 23. الطلبات والإحالات
// ============================================================

window.openRequestsModal = function() {
    if (!currentUser) { showToast('⚠️ Please login first', 'warning'); openAuthModal(); return; }
    const list = document.getElementById('requestsList');
    const requests = userProfile.requests || [];
    if (requests.length === 0) { list.innerHTML = `<div style="text-align:center;padding:40px 20px;color:var(--text-secondary);"><i class="fas fa-inbox" style="font-size:48px;opacity:0.15;display:block;margin-bottom:12px;"></i><div style="font-size:18px;font-weight:600;">No requests</div><div style="font-size:13px;opacity:0.4;margin-top:4px;">Submit your first request now</div></div>`; } else {
        list.innerHTML = requests.slice().reverse().map(req => `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:var(--bg);border-radius:10px;border:1px solid var(--border);margin-bottom:8px;"><div><div style="font-weight:600;color:var(--text);">${req.gameName||'Untitled'}</div><div style="font-size:12px;color:var(--text-secondary);opacity:0.4;">${new Date(req.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div></div><span style="font-size:11px;font-weight:600;padding:2px 12px;border-radius:12px;background:var(--pending-color);color:#0a0a1a;">${(req.status||'pending').charAt(0).toUpperCase()+(req.status||'pending').slice(1)}</span></div>`).join('');
    }
    document.getElementById('requestsModal').classList.add('open');
};
window.closeRequestsModal = function() { document.getElementById('requestsModal').classList.remove('open'); };
window.openNewRequestModal = function() { if (!currentUser) { showToast('⚠️ Please login first', 'warning'); openAuthModal(); return; } document.getElementById('newRequestModal').classList.add('open'); document.getElementById('requestForm').reset(); };
window.closeNewRequestModal = function() { document.getElementById('newRequestModal').classList.remove('open'); };
window.submitRequest = function(e) {
    e.preventDefault();
    if (!currentUser) { showToast('⚠️ Please login first', 'warning'); return; }
    const gameName = document.getElementById('reqGameName').value.trim();
    const playStore = document.getElementById('reqPlayStore').value.trim();
    const features = document.getElementById('reqFeatures').value.trim();
    const budget = document.getElementById('reqBudget').value.trim();
    if (!gameName || !playStore || !features || !budget) { showToast('⚠️ Please fill all fields', 'warning'); return; }
    const newRequest = { gameName, playStore, features, budget, status: 'pending', date: new Date().toISOString(), userId: currentUser.uid };
    const userRef = doc(db, 'users', currentUser.uid);
    updateDoc(userRef, { requests: arrayUnion(newRequest) }).then(() => {
        userProfile.requests.push(newRequest);
        document.getElementById('newRequestModal').classList.remove('open');
        showToast('✅ Request sent', 'success');
        const msg = `📝 New Script Request!\n\n👤 User: ${currentUser.displayName||currentUser.email}\n🎮 Game: ${gameName}\n🔗 Store Link: ${playStore}\n⚡ Features: ${features}\n💰 Budget: ${budget}`;
        window.open(`https://t.me/Mitalica69?text=${encodeURIComponent(msg)}`, '_blank');
    }).catch(error => { showToast('❌ Error: ' + error.message, 'error'); });
};

window.openReferralModal = function() { if (!currentUser) { showToast('⚠️ Please login first', 'warning'); openAuthModal(); return; } updateReferralUI(); document.getElementById('referralModal').classList.add('open'); };
window.closeReferralModal = function() { document.getElementById('referralModal').classList.remove('open'); };

function updateReferralUI() {
    const codeDisplay2 = document.getElementById('referralCodeDisplay2');
    if (currentUser && userProfile.referralCode) { codeDisplay2.textContent = userProfile.referralCode; } else if (currentUser) {
        const code = generateReferralCode(currentUser.displayName || currentUser.email, currentUser.email);
        userProfile.referralCode = code;
        const userRef = doc(db, 'users', currentUser.uid);
        updateDoc(userRef, { referralCode: code }).catch(console.error);
        codeDisplay2.textContent = code;
    } else { codeDisplay2.textContent = 'Login to get your code'; }
    const referrals = userProfile.referrals || [];
    document.getElementById('referralCount2').textContent = referrals.length;
    document.getElementById('referralRewards2').textContent = (userProfile.referralRewards || 0).toFixed(2) + ' $';
    const activityContainer = document.getElementById('referralActivity');
    if (referrals.length === 0) {
        activityContainer.innerHTML = `<div class="referral-empty"><i class="fas fa-users"></i><p>No referrals yet</p><span>Share your link to start earning.</span></div>`;
    } else {
        let html = '';
        referrals.slice().reverse().forEach(ref => {
            const date = ref.date ? new Date(ref.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '--';
            html += `<div class="referral-activity-item"><div class="referral-activity-icon"><i class="fas fa-user-plus"></i></div><div class="referral-activity-info"><div class="referral-activity-name">${ref.name || 'User'}</div><div class="referral-activity-date">${date}</div></div><div class="referral-activity-status">✅ Joined</div></div>`;
        });
        activityContainer.innerHTML = html;
    }
    const stepsContainer = document.getElementById('referralSteps');
    if (stepsContainer) {
        stepsContainer.innerHTML = `<div class="referral-steps"><div class="referral-step"><span class="step-number">1</span><span class="step-text">Share your referral code</span></div><div class="referral-step"><span class="step-number">2</span><span class="step-text">They create an account using your code</span></div><div class="referral-step"><span class="step-number">3</span><span class="step-text">Earn Rewards<br><small>You get 10% of their first order value</small></span></div></div>`;
    }
}
window.copyReferralCode2 = function() {
    const code = document.getElementById('referralCodeDisplay2').textContent;
    if (code && code !== 'Loading...' && code !== 'Login to get your code') {
        navigator.clipboard.writeText(code).then(() => { showToast('✅ Referral code copied!', 'success'); })
        .catch(() => { const textArea = document.createElement('textarea'); textArea.value = code; document.body.appendChild(textArea); textArea.select(); document.execCommand('copy'); document.body.removeChild(textArea); showToast('✅ Referral code copied!', 'success'); });
    } else { showToast('⚠️ Please login first', 'warning'); }
};

// ============================================================
// 24. لوحة المدير (مع أزرار تحديث)
// ============================================================

window.openAdminPanel = function() {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) { showToast('⛔ Unauthorized. Admin only.', 'error'); return; }
    const panel = document.getElementById('adminPanel');
    if (panel.classList.contains('open')) { panel.classList.remove('open'); } else {
        panel.classList.add('open');
        panel.scrollIntoView({ behavior: 'smooth' });
        loadAdminOrders();
        startAdminRealtimeListener();
        loadDownloads();
        loadNotifications();
        renderAdminProducts(products);
        loadAdminUsers();
        loadLicences();
        loadDashboardStats();
        setTimeout(addBannerAdminControls, 300);
        ensureSliderTab();
        loadSliderSettings();
        renderSliderSettingsUI();
        document.getElementById('sliderIntervalInput').value = sliderIntervalTime;
        const statsTab = document.getElementById('tabStats');
        if (statsTab && statsTab.classList.contains('active')) { loadAdvancedStats(); }
        const logsTab = document.getElementById('tabLogs');
        if (logsTab && logsTab.classList.contains('active')) { loadAuditLogs(); }
    }
};

function ensureSliderTab() {
    const tabsContainer = document.querySelector('.admin-panel .tabs');
    if (!tabsContainer) return;
    if (!document.querySelector('.admin-panel .tabs button[onclick="switchAdminTab(\'slider\')"]')) {
        const sliderTab = document.createElement('button');
        sliderTab.setAttribute('onclick', "switchAdminTab('slider')");
        sliderTab.textContent = '🎨 Slider';
        tabsContainer.appendChild(sliderTab);
    }
    if (!document.querySelector('.admin-panel .tabs button[onclick="switchAdminTab(\'licences\')"]')) {
        const licencesTab = document.createElement('button');
        licencesTab.setAttribute('onclick', "switchAdminTab('licences')");
        licencesTab.textContent = '🔑 Licences';
        tabsContainer.appendChild(licencesTab);
    }
    const panelContent = document.querySelector('.admin-panel .modal-content');
    if (panelContent && !document.getElementById('tabSlider')) {
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-content';
        tabContent.id = 'tabSlider';
        tabContent.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
                <h3 style="font-size:16px;font-weight:700;margin:0;"><i class="fas fa-images"></i> Slider Settings</h3>
                <button class="add-btn" onclick="openAddSlideModal()"><i class="fas fa-plus"></i> Add Slide</button>
            </div>
            <div style="margin-bottom:12px;">
                <label style="font-size:13px;font-weight:600;color:var(--text-secondary);opacity:0.6;display:block;margin-bottom:4px;">Rotation Interval (seconds)</label>
                <div style="display:flex;gap:8px;align-items:center;">
                    <input type="number" id="sliderIntervalInput" value="3" min="1" max="60" style="width:100px;padding:8px 12px;border:2px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);color:var(--text);font-size:14px;" />
                    <button class="admin-submit-btn" onclick="saveSliderInterval()" style="padding:8px 16px;font-size:13px;"><i class="fas fa-save"></i> Save</button>
                </div>
            </div>
            <div id="sliderSlidesList">
                <div style="text-align:center;padding:20px;color:var(--text-secondary);opacity:0.5;">No slides yet. Click "Add Slide" to get started.</div>
            </div>
        `;
        const lastTab = panelContent.querySelector('.tab-content:last-of-type');
        if (lastTab) {
            lastTab.parentNode.insertBefore(tabContent, lastTab.nextSibling);
        } else {
            panelContent.appendChild(tabContent);
        }
    }
    if (panelContent && !document.getElementById('tabLicences')) {
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-content';
        tabContent.id = 'tabLicences';
        tabContent.innerHTML = `
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
                <button class="add-btn" onclick="openCreateLicenceModal()"><i class="fas fa-plus"></i> Create Licence</button>
                <button class="add-btn" onclick="refreshLicences()" style="background:var(--card-bg);"><i class="fas fa-sync"></i> Refresh</button>
            </div>
            <div class="admin-search-bar">
                <input type="text" id="adminLicenceSearch" placeholder="🔍 Search by code, user, product..." onkeyup="searchLicences()" />
                <button class="btn-search" onclick="searchLicences()"><i class="fas fa-search"></i></button>
                <button class="btn-clear" onclick="clearLicenceSearch()"><i class="fas fa-times"></i></button>
            </div>
            <div id="adminLicencesList">
                <div style="text-align:center;padding:30px;color:var(--text-secondary);">
                    <i class="fas fa-info-circle"></i> Loading licences...
                </div>
            </div>
        `;
        const lastTab = panelContent.querySelector('.tab-content:last-of-type');
        if (lastTab) {
            lastTab.parentNode.insertBefore(tabContent, lastTab.nextSibling);
        } else {
            panelContent.appendChild(tabContent);
        }
    }
}

window.closeAdminPanel = function() { document.getElementById('adminPanel').classList.remove('open'); if (unsubscribeAdmin) { unsubscribeAdmin(); unsubscribeAdmin = null; } };

window.switchAdminTab = function(tab) {
    document.querySelectorAll('.admin-panel .tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.admin-panel .tabs button').forEach(el => el.classList.remove('active'));
    const tabMap = {
        'dashboard': 'tabDashboard',
        'orders': 'tabOrders',
        'products': 'tabProducts',
        'users': 'tabUsers',
        'downloads': 'tabDownloads',
        'notifications': 'tabNotifications',
        'stats': 'tabStats',
        'logs': 'tabLogs',
        'slider': 'tabSlider',
        'licences': 'tabLicences'
    };
    const tabId = tabMap[tab] || tabMap['dashboard'];
    document.getElementById(tabId).classList.add('active');
    const btn = document.querySelector(`.admin-panel .tabs button[onclick="switchAdminTab('${tab}')"]`);
    if (btn) btn.classList.add('active');
    if (tab === 'products') renderAdminProducts(products);
    if (tab === 'users') loadAdminUsers();
    if (tab === 'dashboard') loadDashboardStats();
    if (tab === 'stats') loadAdvancedStats();
    if (tab === 'logs') loadAuditLogs();
    if (tab === 'slider') {
        renderSliderSettingsUI();
        document.getElementById('sliderIntervalInput').value = sliderIntervalTime;
    }
    if (tab === 'licences') { loadLicences(); }
    
    if (tab === 'orders') {
        loadAdminOrders();
        const refreshBtn = document.getElementById('adminRefreshOrdersBtn');
        if (!refreshBtn) {
            const btn = document.createElement('button');
            btn.id = 'adminRefreshOrdersBtn';
            btn.textContent = '🔄 تحديث الطلبات';
            btn.className = 'admin-refresh-btn';
            btn.style.cssText = 'padding:8px 16px;background:var(--primary);color:#fff;border:none;border-radius:8px;cursor:pointer;margin-bottom:12px;font-weight:600;';
            btn.onclick = function() {
                showToast('⏳ جاري التحديث...', 'info');
                loadAdminOrders();
            };
            const container = document.getElementById('tabOrders');
            if (container) {
                container.insertBefore(btn, container.firstChild);
            }
        }
    }
};

// ============================================================
// 25. إدارة المنتجات (Admin Products)
// ============================================================

function renderAdminProducts(productsList) {
    const container = document.getElementById('adminProductsList');
    if (!container) return;
    if (!productsList || productsList.length === 0) { container.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-secondary);">📭 No products</div>`; return; }
    container.innerHTML = productsList.map(p => {
        const isUnavailable = p.status === 'unavailable';
        const vipBadge = p.vipEnabled ? '👑 VIP' : '';
        return `<div class="admin-item" style="${isUnavailable?'opacity:0.5;':''}"><div class="item-info"><div class="item-title">${p.name} ${isUnavailable?'⛔':''} ${vipBadge}</div><div class="item-meta">${p.price===0?'🎁 FREE':`💰 $${p.price}`} • ${p.badge||'FREE'} ${isUnavailable?'• Unavailable':''}</div></div><div class="item-actions"><button class="btn-edit" onclick="openEditProductModal('${p.id}')"><i class="fas fa-edit"></i></button><button class="btn-delete" onclick="deleteProduct('${p.id}')"><i class="fas fa-trash"></i></button></div></div>`;
    }).join('');
}

window.openEditProductModal = function(productId) {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) { showToast('⛔ Unauthorized', 'error'); return; }
    const product = products.find(p => p.id === productId);
    if (!product) { showToast('❌ Product not found', 'error'); return; }
    document.getElementById('productFormTitle').textContent = '✏️ Edit Product: ' + product.name;
    document.getElementById('productIdField').value = productId;
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productPrice').value = product.price !== undefined ? product.price : '';
    document.getElementById('productBadge').value = product.badge || 'FREE';
    document.getElementById('productStatus').value = product.status || 'available';
    document.getElementById('productImage').value = product.image || '';
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productFeatures').value = (product.features || []).join(', ');
    document.getElementById('productVideo').value = product.video || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    document.getElementById('productDuration').value = product.duration || '';
    document.getElementById('productOriginalPrice').value = product.originalPrice || '';
    const vipEnabled = product.vipEnabled || false;
    document.getElementById('vipEnabled').checked = vipEnabled;
    document.getElementById('vipPricingFields').style.display = vipEnabled ? 'block' : 'none';
    if (product.vipPrices) {
        document.getElementById('vipPrice1m').value = product.vipPrices['1m'] || '';
        document.getElementById('vipOriginalPrice1m').value = product.vipPrices['1m_original'] || '';
        document.getElementById('vipPrice3m').value = product.vipPrices['3m'] || '';
        document.getElementById('vipOriginalPrice3m').value = product.vipPrices['3m_original'] || '';
        document.getElementById('vipPrice1y').value = product.vipPrices['1y'] || '';
        document.getElementById('vipOriginalPrice1y').value = product.vipPrices['1y_original'] || '';
        document.getElementById('vipPriceLifetime').value = product.vipPrices['lifetime'] || '';
        document.getElementById('vipOriginalPriceLifetime').value = product.vipPrices['lifetime_original'] || '';
    }
    document.getElementById('productModal').classList.add('open');
};

document.addEventListener('DOMContentLoaded', function() {
    const vipToggle = document.getElementById('vipEnabled');
    if (vipToggle) {
        vipToggle.addEventListener('change', function() {
            document.getElementById('vipPricingFields').style.display = this.checked ? 'block' : 'none';
        });
    }
});

window.openAddProductModal = function() {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) { showToast('⛔ Unauthorized', 'error'); return; }
    document.getElementById('productFormTitle').textContent = '➕ Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productIdField').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productBadge').value = 'FREE';
    document.getElementById('productStatus').value = 'available';
    document.getElementById('productFeatures').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productVideo').value = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    document.getElementById('productDuration').value = '';
    document.getElementById('productOriginalPrice').value = '';
    document.getElementById('vipEnabled').checked = false;
    document.getElementById('vipPricingFields').style.display = 'none';
    document.getElementById('productModal').classList.add('open');
};
window.closeProductModal = function() { document.getElementById('productModal').classList.remove('open'); };

window.saveProduct = async function(event) {
    event.preventDefault();
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) { showToast('⛔ Unauthorized', 'error'); return; }
    const productId = document.getElementById('productIdField').value;
    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value) || 0;
    const badge = document.getElementById('productBadge').value;
    const status = document.getElementById('productStatus').value;
    const description = document.getElementById('productDescription').value.trim();
    const featuresText = document.getElementById('productFeatures').value.trim();
    const video = document.getElementById('productVideo').value.trim();
    const duration = document.getElementById('productDuration').value.trim();
    const originalPrice = parseFloat(document.getElementById('productOriginalPrice').value) || 0;
    const vipEnabled = document.getElementById('vipEnabled').checked;
    const vipPrices = {
        '1m': parseFloat(document.getElementById('vipPrice1m').value) || 0,
        '1m_original': parseFloat(document.getElementById('vipOriginalPrice1m').value) || 0,
        '3m': parseFloat(document.getElementById('vipPrice3m').value) || 0,
        '3m_original': parseFloat(document.getElementById('vipOriginalPrice3m').value) || 0,
        '1y': parseFloat(document.getElementById('vipPrice1y').value) || 0,
        '1y_original': parseFloat(document.getElementById('vipOriginalPrice1y').value) || 0,
        'lifetime': parseFloat(document.getElementById('vipPriceLifetime').value) || 0,
        'lifetime_original': parseFloat(document.getElementById('vipOriginalPriceLifetime').value) || 0
    };
    let imageUrl = document.getElementById('productImage').value.trim();
    const fileInput = document.getElementById('productImageFile');
    if (fileInput && fileInput.files && fileInput.files[0]) {
        const uploadedUrl = await uploadToCloudinary(fileInput.files[0]);
        if (uploadedUrl) { imageUrl = uploadedUrl; }
    }
    if (!name) { showToast('⚠️ Product name is required', 'warning'); return; }
    const features = featuresText ? featuresText.split(',').map(f => f.trim()).filter(f => f) : [];
    const productData = { name, price, badge, status, image: imageUrl, description, features, video, vipEnabled, vipPrices };
    if (duration) productData.duration = duration;
    if (originalPrice > 0) productData.originalPrice = originalPrice;
    try {
        if (productId) {
            await updateProductInFirestore(productId, productData);
            showToast('✅ Product updated', 'success');
        } else {
            await addProductToFirestore(productData);
            showToast('✅ Product added', 'success');
        }
        closeProductModal();
    } catch (error) { console.error('Save product error:', error); showToast('❌ Error: ' + error.message, 'error'); }
};

window.deleteProduct = async function(productId) {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) { showToast('⛔ Unauthorized', 'error'); return; }
    if (!confirm('Delete this product?')) return;
    try { await deleteProductFromFirestore(productId); showToast('🗑️ Product deleted', 'success'); } catch (error) { console.error('Delete product error:', error); showToast('❌ Error: ' + error.message, 'error'); }
};
async function addProductToFirestore(productData) {
    try { const productsRef = collection(db, 'products'); const docRef = await addDoc(productsRef, { ...productData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }); return docRef.id; } catch (error) { console.error('Error adding product:', error); throw error; }
}
async function updateProductInFirestore(productId, productData) {
    try { const productRef = doc(db, 'products', productId); await updateDoc(productRef, { ...productData, updatedAt: serverTimestamp() }); return true; } catch (error) { console.error('Error updating product:', error); throw error; }
}
async function deleteProductFromFirestore(productId) {
    try { await deleteDoc(doc(db, 'products', productId)); return true; } catch (error) { console.error('Error deleting product:', error); throw error; }
}

// ============================================================
// 26. الطلبات (Admin Orders)
// ============================================================

function startAdminRealtimeListener() {
    if (unsubscribeAdmin) { unsubscribeAdmin(); }
    const usersRef = collection(db, 'users');
    console.log('🔄 Admin listener starting...');
    unsubscribeAdmin = onSnapshot(usersRef, (snapshot) => {
        console.log('🔄 Admin listener triggered, snapshot size:', snapshot.size);
        let orders = [];
        let pending = 0, confirmed = 0, rejected = 0;
        snapshot.forEach((userDoc) => {
            const data = userDoc.data();
            const email = data.email || userDoc.id;
            const name = data.name || 'Unknown';
            const history = data.history || [];
            history.forEach(order => {
                const status = order.status || 'pending';
                if (status === 'pending') pending++;
                else if (status === 'confirmed') confirmed++;
                else if (status === 'rejected') rejected++;
                const orderId = order.id || 'order_' + Date.now();
                orders.push({ ...order, userId: userDoc.id, userEmail: email, userName: name, orderId: orderId, _checked: selectedOrders.has(orderId) });
            });
        });
        orders.sort((a, b) => new Date(b.date) - new Date(a.date));
        allOrders = orders;
        pendingCount = pending;
        renderAdminOrders(orders);
        updateAdminStats(orders);
        updateUI();
        const badge = document.getElementById('adminPanelBadge');
        if (badge) { if (pendingCount > 0) { badge.style.display = 'inline-block'; badge.textContent = pendingCount; } else { badge.style.display = 'none'; } }
        updateFullUserMenu();
    }, (error) => { console.error('❌ Admin listener error:', error); });
}

function loadAdminOrders() {
    const tbody = document.getElementById('adminOrdersBody');
    tbody.innerHTML = '<tr><td colspan="7"><div style="text-align:center;padding:30px;color:var(--text-secondary);"><i class="fas fa-spinner fa-spin"></i> Loading...</div></td></tr>';
    const usersRef = collection(db, 'users');
    getDocs(usersRef).then((snapshot) => {
        let orders = [];
        let pending = 0, confirmed = 0, rejected = 0;
        snapshot.forEach((userDoc) => {
            const data = userDoc.data();
            const email = data.email || userDoc.id;
            const name = data.name || 'Unknown';
            const history = data.history || [];
            history.forEach(order => {
                const status = order.status || 'pending';
                if (status === 'pending') pending++;
                else if (status === 'confirmed') confirmed++;
                else if (status === 'rejected') rejected++;
                const orderId = order.id || 'order_' + Date.now();
                orders.push({ ...order, userId: userDoc.id, userEmail: email, userName: name, orderId: orderId, _checked: selectedOrders.has(orderId) });
            });
        });
        orders.sort((a, b) => new Date(b.date) - new Date(a.date));
        allOrders = orders;
        pendingCount = pending;
        renderAdminOrders(orders);
        updateAdminStats(orders);
        updateUI();
        const badge = document.getElementById('adminPanelBadge');
        if (badge) { if (pendingCount > 0) { badge.style.display = 'inline-block'; badge.textContent = pendingCount; } else { badge.style.display = 'none'; } }
        updateFullUserMenu();
    }).catch(error => { tbody.innerHTML = `<tr><td colspan="7"><div style="text-align:center;padding:30px;color:var(--danger);">${error.message}</div></td></tr>`; });
}

function renderAdminOrders(orders) {
    const tbody = document.getElementById('adminOrdersBody');
    if (!orders || orders.length === 0) { tbody.innerHTML = `<tr><td colspan="7"><div style="text-align:center;padding:30px;color:var(--text-secondary);"><i class="fas fa-inbox"></i> No orders</div></td></tr>`; return; }
    const uniqueOrders = []; const seen = new Set();
    orders.forEach(order => {
        const orderId = order.orderId || order.id;
        if (orderId && !seen.has(orderId)) { seen.add(orderId); uniqueOrders.push(order); }
    });
    let html = '';
    uniqueOrders.forEach(order => {
        const status = order.status || 'pending';
        const statusMap = {
            'pending': { label: '⏳ Pending', class: 'pending' },
            'confirmed': { label: '✅ Confirmed', class: 'confirmed' },
            'rejected': { label: '❌ Rejected', class: 'rejected' }
        };
        const info = statusMap[status] || statusMap['pending'];
        const date = order.date ? new Date(order.date) : new Date();
        const dateStr = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
        const itemsList = order.items ? order.items.map(item => `<span style="display:inline-block;background:var(--bg);padding:2px 8px;border-radius:10px;font-size:11px;border:1px solid var(--border);margin:1px;">${item.name} ×${item.quantity||1}</span>`).join('') : '—';
        const total = order.total || 0;
        const orderIdStr = String(order.orderId || order.id || '');
        const orderIdDisplay = orderIdStr.slice(-6) || '------';
        html += `<tr><td><span class="order-id">#${orderIdDisplay}</span></td><td><div style="font-weight:600;font-size:12px;">${order.userName||'Unknown'}</div><div class="user-email">${order.userEmail||'N/A'}</div></td><td><div style="display:flex;flex-wrap:wrap;gap:2px;">${itemsList}</div></td><td><span class="order-total">${total.toFixed(2)} $</span></td><td><span class="order-date">${dateStr}</span></td><td><span class="status-badge ${info.class}">${info.label}</span></td><td><div class="actions-cell"><select onchange="updateOrderStatus('${order.orderId||order.id}','${order.userId}',this.value)" style="padding:2px 6px;border:1px solid var(--border);border-radius:4px;background:var(--bg);color:var(--text);font-size:10px;"><option value="pending" ${status==='pending'?'selected':''}>⏳ Pending</option><option value="confirmed" ${status==='confirmed'?'selected':''}>✅ Confirmed</option><option value="rejected" ${status==='rejected'?'selected':''}>❌ Rejected</option></select><button onclick="deleteOrderImmediately('${order.orderId||order.id}','${order.userId}')" class="btn-delete-order"><i class="fas fa-trash"></i> Delete</button></div></td></tr>`;
    });
    tbody.innerHTML = html;
}

function updateAdminStats(orders) {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const confirmed = orders.filter(o => o.status === 'confirmed').length;
    const rejected = orders.filter(o => o.status === 'rejected').length;
    document.getElementById('adminTotalOrders').textContent = total;
    document.getElementById('adminPendingOrders').textContent = pending;
    document.getElementById('adminConfirmedOrders').textContent = confirmed;
    document.getElementById('adminRejectedOrders').textContent = rejected;
}

// ============================================================
// 27. تحديث حالة الطلب وإنشاء الترخيص
// ============================================================

window.updateOrderStatus = async function(orderId, userId, newStatus) {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) { showToast('⛔ Unauthorized', 'error'); return; }
    if (!orderId || !userId) { showToast('❌ Invalid data', 'error'); return; }

    const validStatuses = ['pending', 'confirmed', 'rejected'];
    if (!validStatuses.includes(newStatus)) {
        showToast('⚠️ حالة غير صالحة', 'warning');
        return;
    }

    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) { showToast('❌ User not found', 'error'); return; }
        const data = userSnap.data();
        const history = data.history || [];
        const updatedHistory = history.map(order => {
            if (order.id === orderId) { return { ...order, status: newStatus, updatedAt: new Date().toISOString() }; }
            return order;
        });
        await updateDoc(userRef, { history: updatedHistory });

        if (newStatus === 'confirmed') {
            await sendLicenceForOrder(orderId, userId);
            await sendTelegramNotification(TELEGRAM_CHAT_ID, `✅ Order #${orderId.slice(-6)} confirmed. Licence sent to ${data.email || userId}.`);
        } else if (newStatus === 'rejected') {
            if (data.telegramChatId) {
                await sendTelegramNotification(data.telegramChatId, `❌ Your order #${orderId.slice(-6)} has been rejected.`);
            }
            await sendTelegramNotification(TELEGRAM_CHAT_ID, `❌ Order #${orderId.slice(-6)} rejected.`);
        }

        const statusLabels = {
            'pending': '⏳ Pending',
            'confirmed': '✅ Confirmed',
            'rejected': '❌ Rejected'
        };
        showToast(`📦 Order updated to ${statusLabels[newStatus]}`, 'success');
        loadAdminOrders();
        if (currentUser && currentUser.uid === userId) { userProfile.history = updatedHistory; }
        updateFullUserMenu();
    } catch (error) {
        console.error('Error updating order:', error);
        showToast('❌ Error: ' + error.message, 'error');
    }
};

// ============================================================
// 28. دالة إرسال الترخيص عبر Edge Function (بدون Authorization)
// ============================================================

async function sendLicenceForOrder(orderId, userId) {
    try {
        console.log('🔍 sendLicenceForOrder called:', { orderId, userId });
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            console.error('❌ User not found');
            throw new Error('User not found');
        }
        const userData = userSnap.data();
        const order = userData.history?.find(o => o.id === orderId);
        if (!order) {
            console.error('❌ Order not found');
            throw new Error('Order not found');
        }

        const productName = order.items?.[0]?.name || 'Product';

        const response = await fetch(`${SUPABASE_URL}/functions/v1/create-licence`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId: orderId,
                userId: userId,
                userEmail: userData.email || userId,
                productName: productName,
                telegramChatId: userData.telegramChatId || null
            })
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to create licence');
        }

        console.log('✅ Licence created via Edge Function:', data.licence);

        const userLicences = userData.licences || [];
        const newLicence = {
            code: data.licence.code,
            scriptId: productName,
            scriptName: productName,
            expiryDate: data.licence.expiryDate,
            activatedAt: new Date().toISOString()
        };
        userLicences.push(newLicence);
        await updateDoc(userRef, { licences: userLicences });

        if (currentUser && currentUser.uid === userId) {
            userProfile.licences = userLicences;
            renderUserLicences();
            updateFullUserMenu();
        }

        showToast(`✅ Licence sent to user`, 'success');

    } catch (error) {
        console.error('❌ Error in sendLicenceForOrder:', error);
        await sendTelegramNotification(TELEGRAM_CHAT_ID, `❌ Failed to create licence for order #${orderId.slice(-6)}: ${error.message}`);
        throw error;
    }
}

window.deleteOrderImmediately = async function(orderId, userId) {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) { showToast('⛔ Unauthorized', 'error'); return; }
    if (!orderId || !userId) { showToast('❌ Invalid data', 'error'); return; }
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) { showToast('❌ User not found', 'error'); return; }
        const data = userSnap.data();
        const history = data.history || [];
        const updatedHistory = history.filter(order => order.id !== orderId);
        await updateDoc(userRef, { history: updatedHistory });
        showToast(`🗑️ Order #${String(orderId).slice(-6)} deleted permanently`, 'success');
        loadAdminOrders();
        if (currentUser && currentUser.uid === userId) { userProfile.history = updatedHistory; }
    } catch (error) { console.error('Error deleting order:', error); showToast('❌ Error: ' + error.message, 'error'); }
};

window.searchAdminOrders = function() {
    const query = document.getElementById('adminSearchInput').value.trim().toLowerCase();
    if (!query) { renderAdminOrders(allOrders); showToast('📋 Showing all orders', 'info'); return; }
    const filtered = allOrders.filter(order => {
        const email = (order.userEmail || '').toLowerCase();
        const orderId = String(order.orderId || order.id || '').toLowerCase();
        const userName = (order.userName || '').toLowerCase();
        return email.includes(query) || orderId.includes(query) || userName.includes(query);
    });
    renderAdminOrders(filtered);
    if (filtered.length === 0) { showToast(`🔍 No matching orders`, 'warning'); } else { showToast(`🔍 Found ${filtered.length} orders`, 'success'); }
};
window.clearAdminSearch = function() { document.getElementById('adminSearchInput').value = ''; renderAdminOrders(allOrders); showToast('📋 Search cleared', 'info'); };
window.refreshAdminOrders = function() { loadAdminOrders(); showToast('🔄 Refreshed', 'info'); };

// ============================================================
// 29. المستخدمين (Admin Users)
// ============================================================

async function loadAdminUsers() {
    const container = document.getElementById('adminUsersContainer');
    if (!container) return;
    container.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-secondary);"><i class="fas fa-spinner fa-spin"></i> Loading...</div>`;
    try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        const usersList = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            usersList.push({ uid: doc.id, ...data, email: data.email || doc.id, name: data.name || 'Unknown', createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(), isBanned: data.isBanned || false, history: data.history || [], rp: data.rp || 0, referralCode: data.referralCode || '', location: data.location || data.country || 'N/A' });
        });
        allUsers = usersList;
        renderAdminUsers(usersList);
    } catch (error) { console.error('Error loading users:', error); container.innerHTML = `<div style="text-align:center;padding:30px;color:var(--danger);">Error loading users</div>`; }
}

function renderAdminUsers(usersList) {
    const container = document.getElementById('adminUsersContainer');
    if (!container) return;
    if (!usersList || usersList.length === 0) { container.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-secondary);">👥 No users</div>`; return; }
    const searchQuery = document.getElementById('adminUserSearchInput')?.value.trim().toLowerCase() || '';
    let filtered = usersList;
    if (searchQuery) { filtered = filtered.filter(u => u.email?.toLowerCase().includes(searchQuery) || u.name?.toLowerCase().includes(searchQuery)); }
    if (filtered.length === 0) { container.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-secondary);">🔍 No results</div>`; return; }
    container.innerHTML = `<div style="display:flex;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:4px;"><span style="font-size:12px;color:var(--text-secondary);opacity:0.4;">${filtered.length} users</span></div><div class="admin-users-grid">${filtered.map(user=>{
        const isAdmin = user.email === ADMIN_EMAIL;
        const isBanned = user.isBanned || false;
        const orderCount = user.history?.length || 0;
        const rp = user.rp || 0;
        const initials = (user.name || 'U').charAt(0).toUpperCase();
        const dateStr = user.createdAt ? user.createdAt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '--';
        const location = user.location || 'N/A';
        return `<div class="admin-user-card ${isBanned?'banned':''}"><div class="user-avatar">${initials}</div><div class="user-name">${user.name||'Unknown'}</div><div class="user-email">${user.email||'No email'}</div><div class="user-meta">📍 ${location}</div><div class="user-meta">📅 ${dateStr} • 🎯 ${rp} RP</div><div class="user-meta">📦 ${orderCount} orders</div>${isBanned?`<span class="user-badge banned">🚫 Banned</span>`:''}${isAdmin?`<span class="user-badge admin">👑 Admin</span>`:''}<div class="user-actions"><button class="btn-view" onclick="viewUserDetails('${user.uid}')"><i class="fas fa-eye"></i> View</button>${!isAdmin ? (isBanned ? `<button class="btn-unban" onclick="toggleUserBan('${user.uid}',false)"><i class="fas fa-user-check"></i> Unban</button>` : `<button class="btn-ban" onclick="toggleUserBan('${user.uid}',true)"><i class="fas fa-ban"></i> Ban</button>`) : ''}${!isAdmin ? `<button class="btn-delete" onclick="deleteUserAccount('${user.uid}')"><i class="fas fa-trash"></i></button>` : ''}</div></div>`;
    }).join('')}</div>`;
}
window.searchAdminUsers = function() { renderAdminUsers(allUsers); };
window.clearAdminUserSearch = function() { document.getElementById('adminUserSearchInput').value = ''; renderAdminUsers(allUsers); };
window.refreshAdminUsers = function() { loadAdminUsers(); showToast('🔄 Users refreshed', 'info'); };
window.toggleUserBan = async function(uid, ban) {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) { showToast('⛔ Unauthorized', 'error'); return; }
    if (uid === currentUser.uid) { showToast('⚠️ You cannot ban yourself', 'warning'); return; }
    try {
        await updateDoc(doc(db, 'users', uid), { isBanned: ban });
        showToast(`✅ User ${ban?'banned':'unbanned'}`, 'success');
        loadAdminUsers();
    } catch (error) { console.error('Error toggling user ban:', error); showToast('❌ Error: ' + error.message, 'error'); }
};
window.deleteUserAccount = async function(uid) {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) { showToast('⛔ Unauthorized', 'error'); return; }
    if (uid === currentUser.uid) { showToast('⚠️ You cannot delete your own account', 'warning'); return; }
    if (!confirm('⚠️ Delete this user account permanently?')) return;
    try {
        await deleteDoc(doc(db, 'users', uid));
        showToast('🗑️ User account deleted', 'success');
        loadAdminUsers(); loadAdminOrders();
    } catch (error) { console.error('Error deleting user:', error); showToast('❌ Error: ' + error.message, 'error'); }
};
window.viewUserDetails = async function(uid) {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) { showToast('⛔ Unauthorized', 'error'); return; }
    try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) { showToast('❌ User not found', 'error'); return; }
        const data = userSnap.data();
        const orders = data.history || [];
        const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        const location = data.location || data.country || 'Not specified';
        const content = document.getElementById('userDetailsContent');
        content.innerHTML = `
          <div style="padding:4px 0;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
              <div style="width:44px;height:44px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#fff;">${(data.name||'U').charAt(0).toUpperCase()}</div>
              <div><div style="font-size:15px;font-weight:700;color:var(--text);">${data.name||'Unknown'}</div><div style="font-size:12px;color:var(--text-secondary);">${data.email||'No email'}</div><div style="font-size:12px;color:var(--text-secondary);">📍 Country: ${location}</div><div style="font-size:12px;color:var(--vip-color);font-weight:600;">🎯 RP: ${data.rp||0} • 📦 ${orders.length} orders</div></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:10px;">
              <div style="background:var(--bg);border-radius:6px;padding:6px;text-align:center;border:1px solid var(--border);"><div style="font-size:14px;font-weight:700;color:var(--text);">${orders.length}</div><div style="font-size:9px;color:var(--text-secondary);">Orders</div></div>
              <div style="background:var(--bg);border-radius:6px;padding:6px;text-align:center;border:1px solid var(--border);"><div style="font-size:14px;font-weight:700;color:var(--primary);">${totalSpent.toFixed(2)} $</div><div style="font-size:9px;color:var(--text-secondary);">Spent</div></div>
              <div style="background:var(--bg);border-radius:6px;padding:6px;text-align:center;border:1px solid var(--border);"><div style="font-size:14px;font-weight:700;color:var(--vip-color);">${data.rp||0}</div><div style="font-size:9px;color:var(--text-secondary);">RP</div></div>
            </div>
            <div style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">Recent Orders</div>
            ${orders.length > 0 ? orders.slice(-5).reverse().map(o => `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border);font-size:12px;"><span>${o.items?o.items.map(i=>i.name).join(', '):'Order'}</span><span style="color:var(--primary);">${(o.total||0).toFixed(2)} $</span><span class="status-badge ${o.status||'pending'}" style="font-size:9px;padding:1px 8px;">${o.status||'pending'}</span></div>`).join('') : '<div style="text-align:center;color:var(--text-secondary);opacity:0.4;padding:10px;">No orders</div>'}
            <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;">
              <button onclick="closeUserDetailsModal();" style="padding:4px 14px;border:1px solid var(--border);border-radius:6px;background:var(--card-bg);color:var(--text);cursor:pointer;font-size:12px;">Close</button>
              ${data.isBanned?`<button onclick="closeUserDetailsModal();toggleUserBan('${uid}',false);" style="padding:4px 14px;border:none;border-radius:6px;background:var(--success);color:#0a0a1a;cursor:pointer;font-weight:600;font-size:12px;"><i class="fas fa-user-check"></i> Unban</button>`:`<button onclick="closeUserDetailsModal();toggleUserBan('${uid}',true);" style="padding:4px 14px;border:none;border-radius:6px;background:var(--danger);color:#fff;cursor:pointer;font-weight:600;font-size:12px;"><i class="fas fa-ban"></i> Ban</button>`}
              ${uid!==currentUser.uid?`<button onclick="closeUserDetailsModal();deleteUserAccount('${uid}');" style="padding:4px 14px;border:none;border-radius:6px;background:var(--danger);color:#fff;cursor:pointer;font-weight:600;font-size:12px;"><i class="fas fa-trash"></i> Delete</button>`:''}
            </div>
          </div>`;
        document.getElementById('userDetailsModal').classList.add('open');
    } catch (error) { console.error('Error viewing user details:', error); showToast('❌ Error loading user details', 'error'); }
};
window.closeUserDetailsModal = function() { document.getElementById('userDetailsModal').classList.remove('open'); };

// ============================================================
// 30. تاريخ الطلبات (مع زر تحديث)
// ============================================================

window.clearOrderHistory = async function() {
    if (!currentUser) { showToast('⚠️ Please login first', 'warning'); return; }
    try {
        userProfile.history = [];
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, { history: [] });
        renderHistoryFull();
        updateFullUserMenu();
        showToast('🗑️ Order history cleared successfully!', 'success');
    } catch (error) { console.error('Error clearing order history:', error); showToast('❌ Failed to clear order history', 'error'); }
};

function renderHistoryFull() {
    const container = document.getElementById('historyFullContent');
    if (!container) return;
    const history = userProfile.history || [];
    const total = history.length;
    const confirmed = history.filter(o => o.status === 'confirmed').length;
    const pending = history.filter(o => o.status === 'pending').length;
    const rejected = history.filter(o => o.status === 'rejected').length;
    let html = `
        <div class="orders-stats">
            <div class="orders-stat-card"><div class="orders-stat-number">${total}</div><div class="orders-stat-label">All</div></div>
            <div class="orders-stat-card approved"><div class="orders-stat-number" style="color:var(--success);">${confirmed}</div><div class="orders-stat-label">Confirmed</div></div>
            <div class="orders-stat-card pending"><div class="orders-stat-number" style="color:var(--pending-color);">${pending}</div><div class="orders-stat-label">Pending</div></div>
            <div class="orders-stat-card rejected"><div class="orders-stat-number" style="color:var(--danger);">${rejected}</div><div class="orders-stat-label">Rejected</div></div>
        </div>
        <div class="orders-filter-bar">
            <button class="orders-filter-btn ${ordersFilter === 'all' ? 'active' : ''}" data-filter="all" onclick="filterOrders('all')">📋 All Orders</button>
            <button class="orders-filter-btn ${ordersFilter === 'newest' ? 'active' : ''}" data-filter="newest" onclick="filterOrders('newest')">🔄 Newest</button>
            <button class="orders-filter-btn ${ordersFilter === 'pending' ? 'active' : ''}" data-filter="pending" onclick="filterOrders('pending')">⏳ Pending</button>
            <button class="orders-filter-btn ${ordersFilter === 'confirmed' ? 'active' : ''}" data-filter="confirmed" onclick="filterOrders('confirmed')">✅ Confirmed</button>
        </div>
        <div style="margin-bottom:10px;">
            <button id="refreshHistoryBtn" onclick="loadUserData(); renderHistoryFull(); showToast('🔄 تم التحديث', 'info');" style="padding:6px 14px;background:var(--primary);color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600;">
                🔄 تحديث الطلبات
            </button>
        </div>
        <div class="orders-list" id="ordersList">`;
    let filteredHistory = [...history];
    if (ordersFilter === 'pending') { filteredHistory = filteredHistory.filter(o => o.status === 'pending'); }
    else if (ordersFilter === 'confirmed') { filteredHistory = filteredHistory.filter(o => o.status === 'confirmed'); }
    else if (ordersFilter === 'newest') { filteredHistory = filteredHistory.sort((a, b) => new Date(b.date) - new Date(a.date)); } else { filteredHistory = filteredHistory.slice().reverse(); }
    if (filteredHistory.length === 0) { html += `<div class="orders-empty"><i class="fas fa-shopping-bag"></i><p>No orders found.</p></div>`; } else {
        filteredHistory.forEach(item => {
            const status = item.status || 'pending';
            const statusMap = {
                'pending': { label: '⏳ Pending', class: 'pending' },
                'confirmed': { label: '✅ Confirmed', class: 'confirmed' },
                'rejected': { label: '❌ Rejected', class: 'rejected' }
            };
            const info = statusMap[status] || statusMap['pending'];
            const date = item.date ? new Date(item.date) : new Date();
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const itemsNames = item.items ? item.items.map(i => i.name).join(', ') : 'Order';
            const totalPrice = item.total || 0;
            const orderData = JSON.stringify(item);
            html += `
                <div class="orders-item" data-order='${orderData}'>
                    <div class="orders-item-info">
                        <div class="orders-item-name">${itemsNames}</div>
                        <div class="orders-item-date">${dateStr}</div>
                        <span class="status-badge ${info.class}">${info.label}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div class="orders-item-price">${totalPrice > 0 ? '$' + totalPrice.toFixed(2) : 'FREE'}</div>
                        <button onclick="generateInvoice(this.closest('.orders-item').dataset.order)" class="btn-download-invoice" style="padding:4px 10px;border:none;border-radius:6px;background:var(--vip-color);color:#0a0a1a;font-weight:600;cursor:pointer;font-size:11px;display:flex;align-items:center;gap:4px;">
                            <i class="fas fa-file-pdf"></i> PDF
                        </button>
                    </div>
                </div>
            `;
        });
    }
    html += `</div>`;
    container.innerHTML = html;
}

window.filterOrders = function(filter) {
    ordersFilter = filter;
    document.querySelectorAll('.orders-filter-btn').forEach(btn => { btn.classList.toggle('active', btn.dataset.filter === filter); });
    renderHistoryFull();
};

// ============================================================
// 31. نظام إدارة التراخيص (مع Supabase)
// ============================================================

async function loadLicences() {
    try {
        const container = document.getElementById('adminLicencesList');
        if (!container) return;
        container.innerHTML = `<div style="text-align:center;padding:30px;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>`;
        if (typeof supabase === 'undefined') {
            throw new Error('supabase is not defined');
        }
        const { data, error } = await supabase
            .from('licenses')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        allLicences = data || [];
        renderLicences(allLicences);
    } catch (error) {
        console.error('Error loading licences:', error);
        const container = document.getElementById('adminLicencesList');
        if (container) {
            container.innerHTML = `<div style="text-align:center;padding:30px;color:var(--danger);">⚠️ Failed to load licences: ${error.message}</div>`;
        }
    }
}

function renderLicences(licences) {
    const container = document.getElementById('adminLicencesList');
    if (!container) return;
    if (!licences || licences.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-secondary);">🔑 No licences found</div>`;
        return;
    }
    container.innerHTML = licences.map(l => {
        const statusMap = {
            'pending': '<span class="status-badge pending">⏳ Pending</span>',
            'active': '<span class="status-badge active">✅ Active</span>',
            'used': '<span class="status-badge used">🔒 Used</span>',
            'expired': '<span class="status-badge expired">⛔ Expired</span>',
            'revoked': '<span class="status-badge revoked">🚫 Revoked</span>'
        };
        const statusBadge = statusMap[l.status] || '<span class="status-badge">❓ Unknown</span>';
        const userDisplay = l.user_email || l.user_id || 'Not assigned';
        const expiryDate = l.expiry_date ? new Date(l.expiry_date).toLocaleDateString() : '--';
        const isExpired = l.expiry_date && new Date(l.expiry_date) < new Date();

        return `
            <div class="admin-item" style="${isExpired && l.status !== 'expired' ? 'border-left:3px solid var(--danger);' : ''}">
                <div class="item-info">
                    <div class="item-title" style="font-family:monospace;font-size:14px;">
                        ${l.code}
                        <button onclick="copyLicenceCode('${l.code}')" style="background:none;border:none;color:var(--primary);cursor:pointer;font-size:13px;padding:2px 6px;margin-left:4px;" title="Copy code"><i class="fas fa-copy"></i></button>
                        <span style="font-size:11px;font-weight:400;opacity:0.5;margin-left:6px;">${l.script_name || 'Unknown'}</span>
                        ${l.script_id ? `<span style="font-size:10px;opacity:0.3;margin-left:4px;">📎 ${l.script_id}</span>` : ''}
                    </div>
                    <div class="item-meta">
                        👤 ${userDisplay} • 📅 ${expiryDate} • ${statusBadge}
                        ${l.order_id ? `• 📎 #${l.order_id.slice(-6)}` : ''}
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn-edit" onclick="editLicence('${l.id}')"><i class="fas fa-edit"></i></button>
                    ${l.status === 'pending' ? `<button class="btn-approve" onclick="approveLicence('${l.id}','${l.code}','${l.script_name}')" style="background:var(--success);color:#0a0a1a;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;"><i class="fas fa-check"></i> Approve</button>` : ''}
                    ${l.status === 'active' ? `<button class="btn-revoke" onclick="revokeLicence('${l.id}')" style="background:var(--danger);color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;"><i class="fas fa-ban"></i> Revoke</button>` : ''}
                    <button class="btn-delete" onclick="deleteLicence('${l.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    }).join('');
}

function openCreateLicenceModal() {
    const modal = document.getElementById('createLicenceModal');
    if (modal) {
        modal.classList.add('open');
        document.getElementById('createLicenceForm').reset();
    } else {
        showToast('❌ Modal not found', 'error');
    }
}

function closeCreateLicenceModal() {
    const modal = document.getElementById('createLicenceModal');
    if (modal) {
        modal.classList.remove('open');
    }
}

async function createLicenceManually() {
    const productName = document.getElementById('newLicenceProduct')?.value.trim();
    const userId = document.getElementById('newLicenceUser')?.value.trim();
    const expiryDate = document.getElementById('newLicenceExpiry')?.value;

    if (!productName) {
        showToast('⚠️ Product name required', 'warning');
        return;
    }

    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/create-licence`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productName: productName,
                userId: userId || null,
                userEmail: userId || null,
                expiryDate: expiryDate || null,
                manual: true
            })
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to create licence');
        }

        showToast(`✅ Licence created: ${data.licence.code}`, 'success');
        closeCreateLicenceModal();
        loadLicences();

        if (userId) {
            const usersRef = collection(db, 'users');
            let q;
            if (userId.includes('@')) {
                q = query(usersRef, where('email', '==', userId));
            } else {
                q = query(usersRef, where('userId', '==', userId));
            }
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const userData = userDoc.data();
                const userLicences = userData.licences || [];
                if (!userLicences.find(l => l.code === data.licence.code)) {
                    userLicences.push({
                        code: data.licence.code,
                        scriptId: productName,
                        scriptName: productName,
                        expiryDate: data.licence.expiryDate,
                        activatedAt: new Date().toISOString()
                    });
                    await updateDoc(userDoc.ref, { licences: userLicences, updatedAt: serverTimestamp() });
                    if (currentUser && userDoc.id === currentUser.uid) {
                        userProfile.licences = userLicences;
                        renderUserLicences();
                        updateFullUserMenu();
                    }
                }
            } else {
                console.warn('⚠️ User not found for id/email:', userId);
                showToast('⚠️ User not found, but licence was created.', 'warning');
            }
        }

    } catch (error) {
        console.error('Error creating licence:', error);
        showToast('❌ Error: ' + error.message, 'error');
    }
}

async function updateLicenceInSupabase(licenceId, data) {
    try {
        const { error } = await supabase
            .from('licenses')
            .update({ ...data, updated_at: new Date().toISOString() })
            .eq('id', licenceId);
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating licence:', error);
        throw error;
    }
}

async function approveLicence(licenceId, code, scriptName) {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
        showToast('⛔ Unauthorized', 'error');
        return;
    }
    if (!confirm(`Approve licence ${code} and send to user?`)) return;

    try {
        const { data: licenceData, error: fetchError } = await supabase
            .from('licenses')
            .select('*')
            .eq('id', licenceId)
            .single();

        if (fetchError || !licenceData) throw fetchError || new Error('Licence not found');

        await updateLicenceInSupabase(licenceId, {
            status: 'active',
            user_id: currentUser.uid,
            user_email: currentUser.email
        });

        let chatId = null;
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', currentUser.email));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                snapshot.forEach(doc => {
                    const userData = doc.data();
                    chatId = userData.telegramChatId || null;
                });
            }
        } catch (e) {
            console.warn('Could not find user for notification:', e);
        }

        if (chatId) {
            const userMsg = `🎉 **Licence Activated!**\n\n📦 **Product:** ${scriptName}\n🔑 **Your Code:** \`${code}\`\n📅 **Expires:** ${licenceData.expiry_date ? new Date(licenceData.expiry_date).toLocaleDateString() : 'N/A'}\n\nUse this code in the ZI Store script loader to access your product.`;
            await sendTelegramNotification(chatId, userMsg);
        }

        await sendTelegramNotification(TELEGRAM_CHAT_ID, `✅ Licence \`${code}\` approved and sent to ${currentUser.email}`);
        showToast(`✅ Licence ${code} approved!`, 'success');
        loadLicences();
    } catch (error) {
        console.error('Error approving licence:', error);
        showToast('❌ Error: ' + error.message, 'error');
    }
}

async function revokeLicence(licenceId) {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
        showToast('⛔ Unauthorized', 'error');
        return;
    }
    if (!confirm('Revoke this licence?')) return;
    try {
        await updateLicenceInSupabase(licenceId, { status: 'revoked' });

        const licence = allLicences.find(l => l.id === licenceId);
        if (licence && licence.user_id) {
            const userRef = doc(db, 'users', licence.user_id);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                const userLicences = userData.licences || [];
                const updatedLicences = userLicences.map(l => {
                    if (l.code === licence.code) {
                        return { ...l, status: 'revoked' };
                    }
                    return l;
                });
                await updateDoc(userRef, { licences: updatedLicences, updatedAt: serverTimestamp() });
                if (currentUser && currentUser.uid === licence.user_id) {
                    userProfile.licences = updatedLicences;
                    renderUserLicences();
                    updateFullUserMenu();
                }
            }
        }

        showToast('🚫 Licence revoked', 'success');
        loadLicences();
    } catch (error) {
        console.error('Error revoking licence:', error);
        showToast('❌ Error: ' + error.message, 'error');
    }
}

async function deleteLicence(licenceId) {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
        showToast('⛔ Unauthorized', 'error');
        return;
    }
    if (!confirm('Delete this licence permanently?')) return;
    try {
        const licence = allLicences.find(l => l.id === licenceId);
        const { error } = await supabase
            .from('licenses')
            .delete()
            .eq('id', licenceId);
        if (error) throw error;

        if (licence && licence.user_id) {
            const userRef = doc(db, 'users', licence.user_id);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                const userLicences = userData.licences || [];
                const updatedLicences = userLicences.filter(l => l.code !== licence.code);
                await updateDoc(userRef, { licences: updatedLicences, updatedAt: serverTimestamp() });
                if (currentUser && currentUser.uid === licence.user_id) {
                    userProfile.licences = updatedLicences;
                    renderUserLicences();
                    updateFullUserMenu();
                }
            }
        }

        showToast('🗑️ Licence deleted', 'success');
        loadLicences();
    } catch (error) {
        console.error('Error deleting licence:', error);
        showToast('❌ Error: ' + error.message, 'error');
    }
}

// ============================================================
// ✅ دالة تعديل الترخيص (تعديل مباشر لجلب البيانات من Supabase)
// ============================================================

async function editLicence(licenceId) {
    try {
        // جلب الترخيص مباشرة من Supabase
        const { data: licence, error } = await supabase
            .from('licenses')
            .select('*')
            .eq('id', licenceId)
            .single();

        if (error || !licence) {
            showToast('❌ Licence not found', 'error');
            return;
        }

        document.getElementById('editLicenceId').value = licenceId;
        document.getElementById('editLicenceCode').value = licence.code || '';
        document.getElementById('editLicenceScript').value = licence.script_name || '';
        if (licence.expiry_date) {
            const date = new Date(licence.expiry_date);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            document.getElementById('editLicenceExpiry').value = `${year}-${month}-${day}T${hours}:${minutes}`;
        } else {
            document.getElementById('editLicenceExpiry').value = '';
        }
        document.getElementById('editLicenceStatus').value = licence.status || 'active';
        document.getElementById('editLicenceModal').classList.add('open');
    } catch (error) {
        console.error('Error fetching licence:', error);
        showToast('❌ Failed to load licence details', 'error');
    }
}

async function saveLicenceEdit() {
    const licenceId = document.getElementById('editLicenceId').value;
    const expiryDate = document.getElementById('editLicenceExpiry').value;
    const status = document.getElementById('editLicenceStatus').value;

    try {
        await updateLicenceInSupabase(licenceId, {
            expiry_date: expiryDate ? new Date(expiryDate).toISOString() : null,
            status: status
        });

        const licence = allLicences.find(l => l.id === licenceId);
        if (licence && licence.user_id) {
            const userRef = doc(db, 'users', licence.user_id);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                const userLicences = userData.licences || [];
                const updatedLicences = userLicences.map(l => {
                    if (l.code === licence.code) {
                        return {
                            ...l,
                            expiryDate: expiryDate || l.expiryDate,
                            status: status || l.status
                        };
                    }
                    return l;
                });
                await updateDoc(userRef, { licences: updatedLicences, updatedAt: serverTimestamp() });
                if (currentUser && currentUser.uid === licence.user_id) {
                    userProfile.licences = updatedLicences;
                    renderUserLicences();
                    updateFullUserMenu();
                }
            }
        }

        showToast('✅ Licence updated!', 'success');
        document.getElementById('editLicenceModal').classList.remove('open');
        loadLicences();
    } catch (error) {
        console.error('Error updating licence:', error);
        showToast('❌ Error: ' + error.message, 'error');
    }
}

function searchLicences() {
    const query = document.getElementById('adminLicenceSearch').value.trim().toLowerCase();
    if (!query) { renderLicences(allLicences); return; }
    const filtered = allLicences.filter(l => {
        const code = (l.code || '').toLowerCase();
        const user = (l.user_email || l.user_id || '').toLowerCase();
        const product = (l.script_name || l.product_name || '').toLowerCase();
        return code.includes(query) || user.includes(query) || product.includes(query);
    });
    renderLicences(filtered);
}

function clearLicenceSearch() {
    document.getElementById('adminLicenceSearch').value = '';
    renderLicences(allLicences);
}

function refreshLicences() { loadLicences(); showToast('🔄 Refreshed', 'info'); }

function renderUserLicences() {
    const container = document.getElementById('userLicencesList');
    if (!container) return;
    if (!currentUser) {
        container.innerHTML = '';
        return;
    }
    const userLicences = userProfile.licences || [];
    if (userLicences.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:8px;color:var(--text-secondary);font-size:12px;">No active licences</div>`;
        return;
    }
    container.innerHTML = userLicences.map(l => {
        const isExpired = new Date(l.expiryDate) < new Date();
        return `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:var(--bg);border-radius:6px;border:1px solid var(--border);margin-bottom:4px;">
                <div>
                    <div style="font-size:12px;font-weight:600;color:var(--text);">${l.scriptName}</div>
                    <div style="font-size:10px;color:var(--text-secondary);opacity:0.5;">${isExpired ? '⛔ Expired' : '✅ Active until ' + new Date(l.expiryDate).toLocaleDateString()}</div>
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                    <span style="font-size:10px;font-family:monospace;opacity:0.3;">${l.code.slice(-6)}</span>
                    <button onclick="copyLicenceCode('${l.code}')" style="background:none;border:none;color:var(--primary);cursor:pointer;font-size:14px;padding:2px 6px;" title="Copy full code"><i class="fas fa-copy"></i></button>
                </div>
            </div>
        `;
    }).join('');
}

function toggleLicencesList() {
    const list = document.getElementById('userLicencesList');
    if (list) {
        list.style.display = list.style.display === 'none' ? 'block' : 'none';
        renderUserLicences();
    }
}

function openLicenceModal() {
    if (!currentUser) {
        showToast('⚠️ Please login first', 'warning');
        openAuthModal();
        return;
    }
    const modal = document.getElementById('licenceModal');
    if (modal) {
        modal.classList.add('open');
        document.getElementById('licenceInput').value = '';
        document.getElementById('licenceResult').innerHTML = '';
        document.body.style.overflow = 'hidden';
    } else {
        showToast('❌ Modal not found', 'error');
    }
}

function closeLicenceModal() {
    const modal = document.getElementById('licenceModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

async function activateLicence() {
    const input = document.getElementById('licenceInput');
    const resultEl = document.getElementById('licenceResult');
    const code = input?.value?.trim().toUpperCase();

    if (!code) {
        resultEl.innerHTML = '<span style="color:var(--danger);">⚠️ Please enter a licence code.</span>';
        return;
    }

    if (!currentUser) {
        resultEl.innerHTML = '<span style="color:var(--danger);">⚠️ You must be logged in.</span>';
        return;
    }

    try {
        resultEl.innerHTML = '<span style="color:var(--text-secondary);">⏳ Verifying...</span>';

        const response = await fetch(
            `${SUPABASE_URL}/functions/v1/public-verify?code=${encodeURIComponent(code)}&token=${currentUser.uid}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            }
        );

        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Invalid licence');
        }

        const licence = data.data;

        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const userData = userSnap.data();
            const userLicences = userData.licences || [];
            if (!userLicences.find(l => l.code === code)) {
                userLicences.push({
                    code: code,
                    scriptId: licence.scriptId,
                    scriptName: licence.scriptName,
                    expiryDate: licence.expiryDate,
                    activatedAt: new Date().toISOString()
                });
                await updateDoc(userRef, { licences: userLicences, updatedAt: serverTimestamp() });
                userProfile.licences = userLicences;
                renderUserLicences();
                updateFullUserMenu();
            }
        }

        const expiryDate = new Date(licence.expiryDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        resultEl.innerHTML = `
            <div style="background:var(--success-glow);border-radius:8px;padding:10px;border:1px solid var(--success);">
                <div style="font-weight:700;color:var(--success);">✅ Activated Successfully!</div>
                <div style="font-size:13px;color:var(--text);margin-top:4px;">
                    <strong>Script:</strong> ${licence.scriptName || 'Unknown'}<br>
                    <strong>Expires:</strong> ${expiryDate}
                </div>
                <div style="font-size:12px;color:var(--text-secondary);margin-top:4px;opacity:0.5;">
                    🔒 This script is now linked to your account.
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Activation error:', error);
        resultEl.innerHTML = `<span style="color:var(--danger);">❌ Error: ${error.message}</span>`;
    }
}

// ============================================================
// 32. Banner تيليجرام و Social Proof
// ============================================================

function showTelegramBanner() {
    const banner = document.getElementById('telegramBanner');
    if (!banner) return;
    const bannerHidden = localStorage.getItem('telegram_banner_hidden') === 'true';
    const adminDisabled = localStorage.getItem('telegram_banner_admin_disabled') === 'true';
    if (userProfile.telegramChatId) {
        banner.classList.add('linked');
        banner.querySelector('.banner-title').textContent = '✅ Connected!';
        banner.querySelector('.banner-subtitle').textContent = 'You will receive order notifications here.';
        banner.querySelector('.banner-action').innerHTML = '<i class="fas fa-check"></i> Linked';
        banner.querySelector('.banner-action').onclick = () => openProfileFull();
        banner.querySelector('.banner-icon i').className = 'fas fa-check-circle';
        banner.style.display = 'block';
        setTimeout(() => { banner.classList.add('hidden'); }, 3000);
        return;
    }
    if (bannerHidden || adminDisabled) { banner.classList.add('hidden'); return; }
    banner.classList.remove('linked', 'hidden');
    banner.querySelector('.banner-title').innerHTML = '🔔 Stay Connected! <span class="badge-new">New</span>';
    banner.querySelector('.banner-subtitle').textContent = 'Link your Telegram account to receive instant order notifications';
    banner.querySelector('.banner-action').innerHTML = '<i class="fab fa-telegram-plane"></i> Link Now';
    banner.querySelector('.banner-action').onclick = () => bindTelegram();
    banner.querySelector('.banner-icon i').className = 'fab fa-telegram-plane';
    banner.style.display = 'block';
    banner.style.animation = 'none';
    setTimeout(() => { banner.style.animation = 'bannerSlideDown 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'; }, 10);
}

function closeTelegramBanner() {
    const banner = document.getElementById('telegramBanner');
    if (banner) { banner.classList.add('hidden'); localStorage.setItem('telegram_banner_hidden', 'true'); setTimeout(() => { localStorage.removeItem('telegram_banner_hidden'); if (!userProfile.telegramChatId) { showTelegramBanner(); } }, 600000); }
}

function showTelegramBannerAgain() { localStorage.removeItem('telegram_banner_hidden'); showTelegramBanner(); }

function addBannerAdminControls() {
    const tabNotifications = document.getElementById('tabNotifications');
    if (!tabNotifications) return;
    const existingControls = tabNotifications.querySelector('.banner-admin-controls');
    if (existingControls) existingControls.remove();
    const controls = document.createElement('div');
    controls.className = 'banner-admin-controls';
    controls.style.cssText = `background: var(--bg); border-radius: 10px; padding: 14px; border: 1px solid var(--border); margin-bottom: 12px;`;
    const isHidden = localStorage.getItem('telegram_banner_admin_disabled') === 'true';
    controls.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
            <div><div style="font-weight:600;color:var(--text);font-size:14px;"><i class="fab fa-telegram-plane" style="color:#0088cc;"></i> Telegram Banner</div><div style="font-size:12px;color:var(--text-secondary);opacity:0.4;">Show/hide the Telegram notification banner for all users</div></div>
            <div style="display:flex;gap:6px;">
                <button onclick="adminToggleBanner(true)" class="banner-admin-btn" style="padding:6px 16px;border:none;border-radius:6px;background:var(--success);color:#0a0a1a;font-weight:600;cursor:pointer;font-size:12px;"><i class="fas fa-eye"></i> Show</button>
                <button onclick="adminToggleBanner(false)" class="banner-admin-btn" style="padding:6px 16px;border:none;border-radius:6px;background:var(--danger);color:#fff;font-weight:600;cursor:pointer;font-size:12px;"><i class="fas fa-eye-slash"></i> Hide</button>
                <button onclick="resetBannerForAll()" class="banner-admin-btn" style="padding:6px 16px;border:1px solid var(--border);border-radius:6px;background:var(--card-bg);color:var(--text);font-weight:600;cursor:pointer;font-size:12px;"><i class="fas fa-sync"></i> Reset</button>
            </div>
        </div>
        <div style="margin-top:8px;font-size:11px;color:var(--text-secondary);opacity:0.3;">${isHidden ? '🚫 Banner is currently <strong style="color:var(--danger);">HIDDEN</strong> for all users' : '✅ Banner is currently <strong style="color:var(--success);">VISIBLE</strong> for all users'}</div>
    `;
    const notifList = document.getElementById('adminNotificationsList');
    if (notifList) { tabNotifications.insertBefore(controls, notifList); } else { tabNotifications.appendChild(controls); }
}

function adminToggleBanner(show) {
    if (show) { localStorage.setItem('telegram_banner_admin_disabled', 'false'); showToast('✅ Banner is now visible for all users', 'success'); } else { localStorage.setItem('telegram_banner_admin_disabled', 'true'); const banner = document.getElementById('telegramBanner'); if (banner) banner.classList.add('hidden'); showToast('🚫 Banner is now hidden for all users', 'warning'); }
    addBannerAdminControls();
    if (show) { localStorage.removeItem('telegram_banner_hidden'); setTimeout(showTelegramBanner, 300); }
}

function resetBannerForAll() { localStorage.removeItem('telegram_banner_admin_disabled'); localStorage.removeItem('telegram_banner_hidden'); showToast('🔄 Banner reset for all users', 'info'); addBannerAdminControls(); setTimeout(showTelegramBanner, 300); }

function startSocialProof() {}
function triggerSocialProofOnOrder(userName, productNames) {}

// ============================================================
// 33. دوال السلايدر (Slider) - مع editSlide
// ============================================================

async function loadSliderSettings() {
    try {
        const settingsRef = doc(db, 'settings', 'slider');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
            const data = settingsSnap.data();
            sliderSlides = data.slides || [];
            sliderIntervalTime = data.interval || 3;
            const intervalInput = document.getElementById('sliderIntervalInput');
            if (intervalInput) {
                intervalInput.value = sliderIntervalTime;
            }
        } else {
            sliderSlides = [];
            sliderIntervalTime = 3;
        }
        renderSlider();
        startSliderRotation();
        renderSliderSettingsUI();
    } catch (error) {
        console.error('Error loading slider settings:', error);
        sliderSlides = [];
        renderSlider();
    }
}

function renderSlider() {
    const wrapper = document.getElementById('sliderWrapper');
    const dots = document.getElementById('sliderDots');
    if (!wrapper) return;
    if (sliderSlides.length === 0) {
        wrapper.innerHTML = `
            <div class="slide-item" style="background:var(--bg-secondary);display:flex;align-items:center;justify-content:center;min-height:200px;border-radius:var(--radius-md);">
                <div style="text-align:center;color:var(--text-secondary);opacity:0.4;">
                    <i class="fas fa-images" style="font-size:48px;display:block;margin-bottom:8px;"></i>
                    <p>No slides available. Add slides from admin panel.</p>
                </div>
            </div>
        `;
        dots.innerHTML = '';
        return;
    }
    wrapper.innerHTML = sliderSlides.map((slide, index) => {
        const isActive = index === currentSlideIndex ? 'active' : '';
        const imageUrl = slide.imageUrl || '';
        const title = slide.title || '';
        const subtitle = slide.subtitle || '';
        const buttonText = slide.buttonText || 'Learn More';
        let buttonLink = '#';
        let buttonTarget = '_self';
        if (slide.linkType === 'product' && slide.productId) {
            buttonLink = `javascript:window.openDetails('${slide.productId}')`;
        } else if (slide.linkType === 'download' && slide.downloadUrl) {
            buttonLink = slide.downloadUrl;
            buttonTarget = '_blank';
        } else if (slide.linkType === 'url' && slide.customUrl) {
            buttonLink = slide.customUrl;
            buttonTarget = '_blank';
        }
        return `
            <div class="slide-item ${isActive}" style="background-image:url('${imageUrl}');">
                <div class="slide-overlay">
                    ${title ? `<h2 class="slide-title">${title}</h2>` : ''}
                    ${subtitle ? `<p class="slide-subtitle">${subtitle}</p>` : ''}
                    ${buttonText ? `<a href="${buttonLink}" target="${buttonTarget}" class="slide-btn">${buttonText}</a>` : ''}
                </div>
            </div>
        `;
    }).join('');
    dots.innerHTML = sliderSlides.map((_, index) => {
        const isActive = index === currentSlideIndex ? 'active' : '';
        return `<span class="dot ${isActive}" onclick="goToSlide(${index})"></span>`;
    }).join('');
    updateSliderHeight();
}

function updateSliderHeight() {
    const wrapper = document.getElementById('sliderWrapper');
    if (!wrapper) return;
    wrapper.style.minHeight = '300px';
}

window.goToSlide = function(index) {
    if (index < 0 || index >= sliderSlides.length) return;
    currentSlideIndex = index;
    renderSlider();
    resetSliderTimer();
};

window.nextSlide = function() {
    if (sliderSlides.length === 0) return;
    currentSlideIndex = (currentSlideIndex + 1) % sliderSlides.length;
    renderSlider();
    resetSliderTimer();
};

window.prevSlide = function() {
    if (sliderSlides.length === 0) return;
    currentSlideIndex = (currentSlideIndex - 1 + sliderSlides.length) % sliderSlides.length;
    renderSlider();
    resetSliderTimer();
};

function startSliderRotation() {
    if (sliderTimer) clearInterval(sliderTimer);
    if (sliderSlides.length <= 1) return;
    sliderTimer = setInterval(() => {
        if (!isSliderPaused) {
            window.nextSlide();
        }
    }, sliderIntervalTime * 1000);
}

function resetSliderTimer() {
    if (sliderTimer) {
        clearInterval(sliderTimer);
        startSliderRotation();
    }
}

window.pauseSlider = function() { isSliderPaused = true; };
window.resumeSlider = function() { isSliderPaused = false; };

function updateSlideProductSelect() {
    const select = document.getElementById('slideProductSelect');
    if (!select) return;
    select.innerHTML = products.map(p => 
        `<option value="${p.id}">${p.name} ($${p.price})</option>`
    ).join('');
}

function toggleSlideLinkFields() {
    const type = document.getElementById('slideLinkType')?.value || 'product';
    const productGroup = document.getElementById('slideProductGroup');
    const downloadGroup = document.getElementById('slideDownloadGroup');
    const customGroup = document.getElementById('slideCustomUrlGroup');
    if (productGroup) productGroup.style.display = type === 'product' ? 'block' : 'none';
    if (downloadGroup) downloadGroup.style.display = type === 'download' ? 'block' : 'none';
    if (customGroup) customGroup.style.display = type === 'url' ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    const linkType = document.getElementById('slideLinkType');
    if (linkType) {
        linkType.addEventListener('change', toggleSlideLinkFields);
    }
    const fileInput = document.getElementById('slideImageFile');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const preview = document.getElementById('slideImagePreview');
                    if (preview) {
                        const img = preview.querySelector('img');
                        if (img) img.src = event.target.result;
                        preview.style.display = 'block';
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

window.openAddSlideModal = function() {
    updateSlideProductSelect();
    const modal = document.getElementById('addSlideModal');
    if (!modal) { showToast('❌ Modal not found', 'error'); return; }
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    const form = document.getElementById('addSlideForm');
    if (form) form.reset();
    const preview = document.getElementById('slideImagePreview');
    if (preview) preview.style.display = 'none';
    toggleSlideLinkFields();
    document.querySelector('#addSlideModal .modal-title').textContent = '➕ Add Slide';
    document.querySelector('#addSlideForm button[type="submit"]').textContent = '➕ Add Slide';
    delete document.getElementById('addSlideForm').dataset.editIndex;
};

window.closeAddSlideModal = function() {
    const modal = document.getElementById('addSlideModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
};

document.getElementById('addSlideForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const fileInput = document.getElementById('slideImageFile');
    const file = fileInput.files[0];
    if (!file) { showToast('⚠️ Please select an image', 'warning'); return; }
    showToast('⏳ Uploading image...', 'info');
    const imageUrl = await uploadToCloudinary(file);
    if (!imageUrl) { showToast('❌ Failed to upload image', 'error'); return; }
    const title = document.getElementById('slideTitle').value.trim();
    const subtitle = document.getElementById('slideSubtitle').value.trim();
    const buttonText = document.getElementById('slideButtonText').value.trim() || 'Buy Now';
    const linkType = document.getElementById('slideLinkType').value;
    let productId = '';
    let downloadUrl = '';
    let customUrl = '';
    if (linkType === 'product') {
        productId = document.getElementById('slideProductSelect').value;
        if (!productId) { showToast('⚠️ Please select a product', 'warning'); return; }
    } else if (linkType === 'download') {
        downloadUrl = document.getElementById('slideDownloadUrl').value.trim();
        if (!downloadUrl) { showToast('⚠️ Please enter a download URL', 'warning'); return; }
    } else if (linkType === 'url') {
        customUrl = document.getElementById('slideCustomUrl').value.trim();
        if (!customUrl) { showToast('⚠️ Please enter a custom URL', 'warning'); return; }
    }
    const newSlide = {
        imageUrl,
        title,
        subtitle,
        buttonText,
        linkType,
        productId,
        downloadUrl,
        customUrl,
        createdAt: new Date().toISOString()
    };
    
    const editIndex = document.getElementById('addSlideForm').dataset.editIndex;
    if (editIndex !== undefined && editIndex !== '') {
        sliderSlides[parseInt(editIndex)] = newSlide;
        delete document.getElementById('addSlideForm').dataset.editIndex;
        showToast('✅ Slide updated successfully!', 'success');
    } else {
        sliderSlides.push(newSlide);
        showToast('✅ Slide added successfully!', 'success');
    }
    
    await saveSliderData();
    renderSlider();
    renderSliderSettingsUI();
    resetSliderTimer();
    window.closeAddSlideModal();
});

function editSlide(index) {
    const slide = sliderSlides[index];
    if (!slide) {
        showToast('❌ Slide not found', 'error');
        return;
    }
    const modal = document.getElementById('addSlideModal');
    if (!modal) {
        showToast('❌ Modal not found', 'error');
        return;
    }
    document.getElementById('slideTitle').value = slide.title || '';
    document.getElementById('slideSubtitle').value = slide.subtitle || '';
    document.getElementById('slideButtonText').value = slide.buttonText || 'Buy Now';
    document.getElementById('slideLinkType').value = slide.linkType || 'product';
    toggleSlideLinkFields();
    if (slide.linkType === 'product') {
        document.getElementById('slideProductSelect').value = slide.productId || '';
    } else if (slide.linkType === 'download') {
        document.getElementById('slideDownloadUrl').value = slide.downloadUrl || '';
    } else if (slide.linkType === 'url') {
        document.getElementById('slideCustomUrl').value = slide.customUrl || '';
    }
    document.getElementById('addSlideForm').dataset.editIndex = index;
    document.querySelector('#addSlideModal .modal-title').textContent = '✏️ Edit Slide';
    document.querySelector('#addSlideForm button[type="submit"]').textContent = '💾 Update Slide';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

async function deleteSlide(index) {
    if (!confirm('Delete this slide?')) return;
    sliderSlides.splice(index, 1);
    await saveSliderData();
    renderSlider();
    renderSliderSettingsUI();
    resetSliderTimer();
    showToast('🗑️ Slide deleted', 'success');
}

async function saveSliderData() {
    try {
        const settingsRef = doc(db, 'settings', 'slider');
        await setDoc(settingsRef, {
            interval: sliderIntervalTime,
            slides: sliderSlides,
            updatedAt: serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error('Error saving slider data:', error);
        showToast('❌ Failed to save slider data', 'error');
    }
}

async function saveSliderInterval() {
    const input = document.getElementById('sliderIntervalInput');
    const interval = parseFloat(input.value);
    if (isNaN(interval) || interval < 1) {
        showToast('⚠️ Please enter a valid number (min 1 second)', 'warning');
        return;
    }
    sliderIntervalTime = interval;
    try {
        await saveSliderData();
        showToast('✅ Interval saved!', 'success');
        resetSliderTimer();
        renderSlider();
    } catch (error) {
        console.error('Error saving interval:', error);
        showToast('❌ Failed to save interval', 'error');
    }
}

function renderSliderSettingsUI() {
    const container = document.getElementById('sliderSlidesList');
    if (!container) return;
    if (sliderSlides.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-secondary);opacity:0.5;">No slides yet. Click "Add Slide" to get started.</div>`;
        return;
    }
    container.innerHTML = sliderSlides.map((slide, index) => {
        const product = products.find(p => p.id === slide.productId);
        const productName = product ? product.name : 'Unknown';
        return `
            <div class="admin-item">
                <div class="item-info">
                    <div class="item-title">
                        <img src="${slide.imageUrl || 'https://picsum.photos/seed/default/60/60'}" style="width:40px;height:40px;border-radius:var(--radius-sm);object-fit:cover;margin-right:8px;" />
                        ${slide.title || 'Slide ' + (index+1)}
                        <span style="font-size:11px;opacity:0.4;font-weight:400;">
                            ${slide.linkType === 'product' ? '📦 Product: ' + productName : slide.linkType === 'download' ? '📥 Download' : '🔗 Custom URL'}
                        </span>
                    </div>
                    <div class="item-meta">${slide.subtitle || ''}</div>
                </div>
                <div class="item-actions">
                    <button class="btn-edit" onclick="editSlide(${index})"><i class="fas fa-edit"></i></button>
                    <button class="btn-delete" onclick="deleteSlide(${index})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    }).join('');
}

window.saveSliderInterval = saveSliderInterval;
window.deleteSlide = deleteSlide;
window.editSlide = editSlide;

// ============================================================
// 34. PDF Generator
// ============================================================

async function generateInvoice(orderData) {
    let order = orderData;
    if (typeof order === 'string') {
        try { order = JSON.parse(order); } catch (e) { console.error('❌ Failed to parse order data:', e); showToast('❌ Invalid order data', 'error'); return; }
    }
    if (!order) { showToast('❌ Order not found', 'error'); return; }
    if (typeof window.jspdf === 'undefined') {
        showToast('⏳ Loading PDF library...', 'info');
        await new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }
    if (typeof window.jspdf === 'undefined') { showToast('❌ Failed to load PDF library', 'error'); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('ZI Store - Invoice', margin, y);
    y += 12;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order #${String(order.id || order.orderId || '').slice(-6)}`, margin, y);
    y += 7;
    doc.text(`Date: ${new Date(order.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`, margin, y);
    y += 7;
    doc.text(`Customer: ${order.userName || 'User'} (${order.userEmail || 'N/A'})`, margin, y);
    y += 12;
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Product', margin, y);
    doc.text('Qty', pageWidth - 60, y);
    doc.text('Price', pageWidth - 20, y);
    y += 7;
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    if (order.items && order.items.length > 0) {
        order.items.forEach((item) => {
            const itemName = item.name || 'Product';
            const qty = item.quantity || 1;
            const price = (item.price || 0) * qty;
            doc.text(itemName, margin, y);
            doc.text(`${qty}`, pageWidth - 60, y);
            doc.text(`$${price.toFixed(2)}`, pageWidth - 20, y);
            y += 7;
            if (y > 270) { doc.addPage(); y = 20; }
        });
    }
    y += 4;
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`Total: $${(order.total || 0).toFixed(2)}`, pageWidth - 50, y);
    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for shopping at ZI Store!', margin, 280);
    doc.text('For support: t.me/Mitalica69', margin, 288);
    doc.save(`Invoice_${String(order.id || order.orderId || 'order').slice(-6)}.pdf`);
}

// ============================================================
// 35. إحصائيات المدير
// ============================================================

async function loadDashboardStats() {
    try {
        const statsRef = doc(db, 'global_stats', 'stats');
        const statsSnap = await getDoc(statsRef);
        let totalOrders = 0; let totalRevenue = 0;
        if (statsSnap.exists()) { const data = statsSnap.data(); totalOrders = data.totalOrders || 0; totalRevenue = data.totalRevenue || 0; }
        document.getElementById('dashboardTotalOrders').textContent = totalOrders;
        document.getElementById('dashboardTotalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
        const netRevenue = totalRevenue * 0.1;
        document.getElementById('dashboardNetRevenue').textContent = `$${netRevenue.toFixed(2)}`;
    } catch (error) { console.error('Error loading dashboard stats:', error); }
}
window.refreshDashboardStats = function() { loadDashboardStats(); showToast('🔄 Stats refreshed', 'info'); };

async function loadAdvancedStats() {
    const container = document.getElementById('advancedStatsContainer');
    if (!container) return;
    container.innerHTML = `<div style="text-align:center;padding:20px;"><i class="fas fa-spinner fa-spin"></i> Loading statistics...</div>`;
    try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        let allOrders = [];
        snapshot.forEach(doc => { const data = doc.data(); const history = data.history || []; history.forEach(order => { allOrders.push({ ...order, userEmail: data.email || doc.id, userName: data.name || 'Unknown', userId: doc.id, orderId: order.id || 'order_' + Date.now() }); }); });
        const totalOrders = allOrders.length;
        const totalRevenue = allOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const pendingOrders = allOrders.filter(o => o.status === 'pending').length;
        const confirmedOrders = allOrders.filter(o => o.status === 'confirmed').length;
        const rejectedOrders = allOrders.filter(o => o.status === 'rejected').length;
        const totalUsers = snapshot.size;
        container.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:16px;">
                <div class="stat-card" style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:28px;font-weight:700;color:var(--primary);">${totalOrders}</div><div style="font-size:12px;color:var(--text-secondary);">Total Orders</div></div>
                <div class="stat-card" style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:28px;font-weight:700;color:var(--vip-color);">$${totalRevenue.toFixed(2)}</div><div style="font-size:12px;color:var(--text-secondary);">Revenue</div></div>
                <div class="stat-card" style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:28px;font-weight:700;color:var(--pending-color);">${pendingOrders}</div><div style="font-size:12px;color:var(--text-secondary);">Pending</div></div>
                <div class="stat-card" style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:28px;font-weight:700;color:var(--success);">${confirmedOrders}</div><div style="font-size:12px;color:var(--text-secondary);">Confirmed</div></div>
                <div class="stat-card" style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:28px;font-weight:700;color:var(--danger);">${rejectedOrders}</div><div style="font-size:12px;color:var(--text-secondary);">Rejected</div></div>
                <div class="stat-card" style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:28px;font-weight:700;color:var(--text);">${totalUsers}</div><div style="font-size:12px;color:var(--text-secondary);">Total Users</div></div>
            </div>`;
    } catch (error) { console.error('Error loading advanced stats:', error); container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--danger);">Failed to load statistics</div>`; }
}
window.refreshAdvancedStats = function() { loadAdvancedStats(); showToast('🔄 Stats refreshed', 'info'); };

async function loadAuditLogs() {
    const container = document.getElementById('auditLogsContainer');
    if (!container) return;
    container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-secondary);"><i class="fas fa-spinner fa-spin"></i> Loading logs...</div>`;
    try {
        const logsRef = collection(db, 'auditLogs');
        const q = query(logsRef, orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        if (snapshot.empty) { container.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-secondary);opacity:0.5;">📭 No audit logs yet</div>`; return; }
        let html = `<div style="display:flex;flex-direction:column;gap:6px;max-height:400px;overflow-y:auto;">`;
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '--';
            const admin = data.adminName || data.adminEmail || 'Admin';
            const action = data.action || 'Action';
            const details = data.details || '';
            html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--bg);border-radius:8px;border:1px solid var(--border);font-size:13px;"><div><span style="font-weight:600;color:var(--text);">${admin}</span><span style="color:var(--text-secondary);opacity:0.5;margin:0 4px;">→</span><span style="color:var(--primary);font-weight:500;">${action}</span>${details ? `<span style="color:var(--text-secondary);opacity:0.4;margin-left:4px;">${details}</span>` : ''}</div><span style="font-size:11px;color:var(--text-secondary);opacity:0.3;">${date}</span></div>`;
        });
        html += `</div>`; container.innerHTML = html;
    } catch (error) { console.error('Error loading audit logs:', error); container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--danger);">Failed to load logs</div>`; }
}
window.loadAuditLogs = loadAuditLogs;

// ============================================================
// 36. التقييمات (Ratings)
// ============================================================

let currentRating = 0;
let currentProductIdForRating = null;

async function loadRatings(productId) {
    const container = document.getElementById('ratingReviewsList');
    const avgEl = document.getElementById('ratingAvgDisplay');
    const countEl = document.getElementById('ratingCountDisplay');
    if (!container) return;
    try {
        const ratingsRef = collection(db, 'ratings');
        const q = query(ratingsRef, where('productId', '==', productId));
        const snapshot = await getDocs(q);
        let total = 0, count = 0, reviewsHtml = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            total += data.rating || 0; count++;
            const date = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--';
            const stars = '⭐'.repeat(Math.round(data.rating || 0));
            reviewsHtml += `<div class="rating-review-item"><div class="rr-header"><span class="rr-name">${data.userName || 'User'}</span><span class="rr-stars">${stars}</span>${data.verified ? '<span class="rr-badge">✅ Verified</span>' : ''}<span class="rr-date">${date}</span></div>${data.comment ? `<div class="rr-comment">${data.comment}</div>` : ''}</div>`;
        });
        const avg = count > 0 ? (total / count) : 0;
        const fullStars = '⭐'.repeat(Math.round(avg));
        const emptyStars = '☆'.repeat(5 - Math.round(avg));
        if (avgEl) avgEl.textContent = avg.toFixed(1);
        if (countEl) countEl.textContent = `(${count} reviews)`;
        container.innerHTML = reviewsHtml || `<div style="text-align:center;padding:10px;color:var(--text-secondary);opacity:0.4;">No reviews yet. Be the first!</div>`;
        const avgStarsEl = document.getElementById('ratingAvgStars');
        if (avgStarsEl) { avgStarsEl.textContent = fullStars + emptyStars; }
        return { avg, count };
    } catch (error) { console.error('Error loading ratings:', error); container.innerHTML = `<div style="text-align:center;padding:10px;color:var(--danger);">Failed to load reviews</div>`; return { avg: 0, count: 0 }; }
}

function hasUserPurchasedProduct(productId) {
    if (!currentUser) return false;
    const history = userProfile.history || [];
    return history.some(order => { if (!order.items) return false; return order.items.some(item => item.id === productId); });
}

async function submitRating(productId) {
    if (!currentUser) { showToast('⚠️ Please login to rate', 'warning'); return; }
    const comment = document.getElementById('ratingCommentInput')?.value.trim() || '';
    const rating = currentRating;
    if (rating === 0) { showToast('⭐ Please select a star rating', 'warning'); return; }
    if (!hasUserPurchasedProduct(productId)) { showToast('⚠️ You can only rate products you have purchased', 'warning'); return; }
    try {
        const ratingsRef = collection(db, 'ratings');
        const q = query(ratingsRef, where('productId', '==', productId), where('userId', '==', currentUser.uid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) { showToast('⚠️ You already rated this product', 'warning'); return; }
        await addDoc(collection(db, 'ratings'), { productId, userId: currentUser.uid, userName: currentUser.displayName || currentUser.email || 'User', rating, comment, verified: true, timestamp: serverTimestamp() });
        showToast('✅ Rating submitted! Thank you!', 'success');
        currentRating = 0;
        document.getElementById('ratingStarsContainer').innerHTML = renderStarHTML(0);
        document.getElementById('ratingCommentInput').value = '';
        loadRatings(productId);
        updateProductRatingDisplay(productId);
    } catch (error) { console.error('Error submitting rating:', error); showToast('❌ Error: ' + error.message, 'error'); }
}

function renderStarHTML(rating) { let html = ''; for (let i = 1; i <= 5; i++) { html += `<span class="star ${i <= rating ? 'active' : ''}" data-value="${i}" onclick="setRating(${i})">★</span>`; } return html; }
window.setRating = function(value) { currentRating = value; const container = document.getElementById('ratingStarsContainer'); if (container) { container.innerHTML = renderStarHTML(value); } };

function renderRatingSection(productId) {
    const section = document.getElementById('ratingSection');
    if (!section) return;
    const canRate = currentUser && !currentUser.isAnonymous && hasUserPurchasedProduct(productId);
    const isLoggedIn = currentUser && !currentUser.isAnonymous;
    section.innerHTML = `
        <div class="rating-section">
            <div class="rating-avg"><span class="stars-small" id="ratingAvgStars">☆☆☆☆☆</span><span class="count" id="ratingCountDisplay">(0 reviews)</span><span style="font-weight:700;color:var(--vip-color);margin-left:4px;" id="ratingAvgDisplay">0.0</span></div>
            <div id="ratingReviewsList" style="max-height:150px;overflow-y:auto;margin-bottom:8px;"><div style="text-align:center;padding:10px;color:var(--text-secondary);opacity:0.4;">Loading reviews...</div></div>
            ${canRate ? `<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px;"><div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px;">⭐ Rate this product</div><div class="rating-stars" id="ratingStarsContainer">${renderStarHTML(0)}</div><textarea class="rating-comment-input" id="ratingCommentInput" placeholder="Share your experience... (optional)" rows="2"></textarea><button class="rating-submit-btn" onclick="submitRating('${productId}')"><i class="fas fa-paper-plane"></i> Submit Review</button></div>` : (isLoggedIn ? `<div style="font-size:12px;color:var(--text-secondary);opacity:0.4;text-align:center;padding:4px;">📌 Purchase this product to leave a review</div>` : `<div style="font-size:12px;color:var(--text-secondary);opacity:0.4;text-align:center;padding:4px;">🔒 Login to rate this product</div>`)}
        </div>`;
    loadRatings(productId);
}

async function updateProductRatingDisplay(productId) { const ratingsRef = collection(db, 'ratings'); const q = query(ratingsRef, where('productId', '==', productId)); const snapshot = await getDocs(q); let total = 0; let count = 0; snapshot.forEach(doc => { total += doc.data().rating || 0; count++; }); const avg = count > 0 ? total / count : 0; }

// ============================================================
// 37. توجيه الاتجاه
// ============================================================

function fixDirection() {
    document.querySelectorAll('.header, .logo, .header-actions, .modal-content, .fullscreen-modal, .admin-panel').forEach(el => {
        el.style.direction = 'ltr'; el.style.textAlign = 'left';
    });
    document.querySelectorAll('.modal-close').forEach(el => { el.style.right = 'auto'; el.style.left = '10px'; });
}
document.addEventListener('DOMContentLoaded', function() { setTimeout(fixDirection, 100); setTimeout(showTelegramBanner, 500); });

// ============================================================
// 38. رفع الصور إلى Cloudinary
// ============================================================

const CLOUDINARY_CLOUD_NAME = 'y14bgb5s';
const CLOUDINARY_UPLOAD_PRESET = 'zi_store_uploads';

async function uploadToCloudinary(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.secure_url) {
            return data.secure_url;
        } else {
            console.error('Cloudinary upload error:', data);
            return null;
        }
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        return null;
    }
}

// ============================================================
// 39. حالة المصادقة
// ============================================================

onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
        try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const data = userSnap.data();
                if (data.isBanned === true) {
                    await signOut(auth);
                    currentUser = null;
                    document.getElementById('authSection').style.display = 'block';
                    document.getElementById('mainApp').style.display = 'none';
                    showToast('🚫 Your account has been banned.', 'error');
                    return;
                }
            }
        } catch (error) { console.error('Error checking ban status:', error); }
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        await loadUserData();
        updateDropdownStats();
        if (user.email === ADMIN_EMAIL) { loadAdminOrders(); startAdminRealtimeListener(); renderAdminProducts(products); loadAdminUsers(); loadLicences(); setTimeout(addBannerAdminControls, 500); }
        loadDownloads(); loadNotifications(); fetchCryptoPrices(); loadFeaturedSettings(); loadSliderSettings();
        setTimeout(showTelegramBanner, 1000);
        startSocialProof();
    } else {
        document.getElementById('authSection').style.display = 'block';
        document.getElementById('mainApp').style.display = 'none';
        await loadUserData();
        updateDropdownStats();
        loadDownloads(); loadNotifications(); fetchCryptoPrices(); loadFeaturedSettings(); loadSliderSettings();
        startSocialProof();
    }
    updateUI(); updateFullUserMenu();
});

// ============================================================
// 40. التهيئة (Init) - Anonymous معطل تماماً
// ============================================================

async function init() {
    showLoadingScreen();
    updateLoadingBar(10);
    // ✅ تم تعطيل Anonymous sign-in نهائياً
    // try { await signInAnonymously(auth); updateLoadingBar(30); } catch (e) { console.log('ℹ️ Anonymous sign-in'); }
    updateLoadingBar(30);
    const productsFromFirestore = await loadProductsFromFirestore();
    products = productsFromFirestore.length > 0 ? productsFromFirestore : fallbackProducts;
    updateLoadingBar(50);
    startProductsRealtimeListener();
    updateLoadingBar(70);
    await loadUserData();
    updateLoadingBar(85);
    renderProducts(products, false);
    renderFeaturedProducts();
    generateRecommendations(products);
    updateBottomCartBar();
    updateDropdownStats();
    loadDownloads();
    loadNotifications();
    fetchCryptoPrices();
    loadFeaturedSettings();
    loadSliderSettings();
    setInterval(fetchCryptoPrices, 60000);
    updateLoadingBar(100);
    console.log('✅ ZI Store ready with all features!');
    setTimeout(() => { hideLoadingScreen(); setTimeout(showTelegramBanner, 500); startSocialProof(); }, 500);
}
init();
setTimeout(() => { hideLoadingScreen(); console.log('⚠️ Force hiding loading screen (timeout)'); }, 5000);

// ============================================================
// 41. تصدير الدوال إلى النطاق العام (window) للاستخدام في HTML
// ============================================================

window.toggleLicencesList = toggleLicencesList;
window.openLicenceModal = openLicenceModal;
window.closeLicenceModal = closeLicenceModal;
window.activateLicence = activateLicence;
window.copyLicenceCode = copyLicenceCode;
window.editLicence = editLicence;
window.saveLicenceEdit = saveLicenceEdit;
window.approveLicence = approveLicence;
window.revokeLicence = revokeLicence;
window.deleteLicence = deleteLicence;
window.openCreateLicenceModal = openCreateLicenceModal;
window.closeCreateLicenceModal = closeCreateLicenceModal;
window.createLicenceManually = createLicenceManually;
window.searchLicences = searchLicences;
window.clearLicenceSearch = clearLicenceSearch;
window.refreshLicences = refreshLicences;
window.loadLicences = loadLicences;
window.renderLicences = renderLicences;
window.editSlide = editSlide;
window.deleteSlide = deleteSlide;
window.saveSliderInterval = saveSliderInterval;
window.openAddSlideModal = openAddSlideModal;
window.closeAddSlideModal = closeAddSlideModal;
window.exportOrders = exportOrders;
window.switchAdminTab = switchAdminTab;
window.loadAdminOrders = loadAdminOrders;
window.updateOrderStatus = updateOrderStatus;
window.filterProducts = filterProducts;
window.openDetails = openDetails;
window.addToCart = addToCart;
window.toggleWishlist = toggleWishlist;
window.openCartFull = openCartFull;
window.closeCartFull = closeCartFull;
window.openWishlistFull = openWishlistFull;
window.closeWishlistFull = closeWishlistFull;
window.openUserMenuFull = openUserMenuFull;
window.closeUserMenuFull = closeUserMenuFull;
window.openProfileFull = openProfileFull;
window.closeProfileFull = closeProfileFull;
window.openHistoryFull = openHistoryFull;
window.closeHistoryFull = closeHistoryFull;
window.openShareModal = openShareModal;
window.closeShareModal = closeShareModal;
window.shareToWhatsApp = shareToWhatsApp;
window.shareToTelegram = shareToTelegram;
window.shareToFacebook = shareToFacebook;
window.copyShareLink = copyShareLink;
window.clearSearch = clearSearch;
window.closeSearchResults = closeSearchResults;
window.performLiveSearch = performLiveSearch;
window.openDownloads = openDownloads;
window.closeDownloads = closeDownloads;
window.openNotifications = openNotifications;
window.closeNotifications = closeNotifications;
window.clearOrderHistory = clearOrderHistory;
window.filterOrders = filterOrders;
window.openReferralModal = openReferralModal;
window.closeReferralModal = closeReferralModal;
window.copyReferralCode2 = copyReferralCode2;
window.openRequestsModal = openRequestsModal;
window.closeRequestsModal = closeRequestsModal;
window.openNewRequestModal = openNewRequestModal;
window.closeNewRequestModal = closeNewRequestModal;
window.submitRequest = submitRequest;
window.selectPayment = selectPayment;
window.continuePayment = continuePayment;
window.goToStep1 = goToStep1;
window.copyWalletAddress = copyWalletAddress;
window.placeOrder = placeOrder;
window.openPaymentModal = openPaymentModal;
window.closePaymentModal = closePaymentModal;
window.checkout = checkout;
window.bindTelegram = bindTelegram;
window.checkTelegramStatus = checkTelegramStatus;
window.testTelegramNotification = testTelegramNotification;
window.unlinkTelegram = unlinkTelegram;
window.saveProfileChangesInline = saveProfileChangesInline;
window.sendResetLinkInline = sendResetLinkInline;
window.changePasswordInline = changePasswordInline;
window.toggleRpInCart = toggleRpInCart;
window.applyCartPromo = applyCartPromo;
window.showTelegramBannerAgain = showTelegramBannerAgain;
window.adminToggleBanner = adminToggleBanner;
window.resetBannerForAll = resetBannerForAll;
window.closePreviewModal = closePreviewModal;
window.addToCartFromPreview = addToCartFromPreview;
window.shareFromPreview = shareFromPreview;
window.refreshDashboardStats = refreshDashboardStats;
window.loadDashboardStats = loadDashboardStats;
window.selectVipPlan = selectVipPlan;
window.addVipPlanToCart = addVipPlanToCart;
window.refreshAdvancedStats = refreshAdvancedStats;
window.setRating = setRating;
window.submitRating = submitRating;
window.loadAuditLogs = loadAuditLogs;
window.generateInvoice = generateInvoice;
window.pauseSlider = pauseSlider;
window.resumeSlider = resumeSlider;
window.goToSlide = goToSlide;
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.loadSliderSettings = loadSliderSettings;
window.updateSlideProductSelect = updateSlideProductSelect;
window.addBannerAdminControls = addBannerAdminControls;
window.showTelegramBanner = showTelegramBanner;
window.showTelegramBannerAgain = showTelegramBannerAgain;

// ============================================================
// END OF SCRIPT.JS
// ============================================================
