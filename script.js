// ========================================
// START OF SCRIPT.JS - كل الكود البرمجي هنا
// ========================================

import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, updatePassword, sendPasswordResetEmail, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, increment, collection, query, where, getDocs, onSnapshot, addDoc, deleteDoc, orderBy } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

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

// ========================================
// شاشة تحميل بسيطة
// ========================================

// رسائل التحميل
const loadingMessages = [
    'جاري تهيئة المتجر...',
    'جاري تحميل المنتجات...',
    'جاري الاتصال بقاعدة البيانات...',
    'مرحباً بك في ZI Store! 🚀'
];

let loadingMessageIndex = 0;
let loadingInterval = null;

// تحديث رسالة التحميل
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

// ✅ إخفاء شاشة التحميل - طريقة مباشرة
function hideLoadingScreen() {
    console.log('✅ Hiding loading screen...');
    const screen = document.getElementById('loadingScreen');
    if (screen) {
        screen.style.display = 'none';
        if (loadingInterval) {
            clearInterval(loadingInterval);
            loadingInterval = null;
        }
    } else {
        console.error('❌ loadingScreen element not found!');
    }
}

// ✅ إظهار شاشة التحميل
function showLoadingScreen() {
    console.log('✅ Showing loading screen...');
    const screen = document.getElementById('loadingScreen');
    if (screen) {
        screen.style.display = 'flex';
        startLoadingMessages();
    } else {
        console.error('❌ loadingScreen element not found!');
    }
}

// تحديث شريط التحميل
function updateLoadingBar(percent) {
    const bar = document.getElementById('loadingBar');
    if (bar) {
        bar.style.width = Math.min(percent, 100) + '%';
    }
}

// ========================================
// نهاية شاشة التحميل
// ========================================

const ADMIN_EMAIL = 'zribiidriss3@gmail.com';
// ✅ بوت Zistore_Notif_bot (التوكن الصحيح)
const TELEGRAM_BOT_TOKEN = '8687744794:AAGeeNrEU-iQLRmg3dLvYkWhddtYo_sJ1tc';
const TELEGRAM_CHAT_ID = '7434396478'; // معرف المدير

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
const RP_TO_DOLLAR = 0.1;

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
    isBanned: false
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

// ✅ دالة التحقق من حالة Ban
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

// ✅ وظيفة موحدة لإرسال الإشعارات إلى تيليجرام (باستخدام بوت واحد)
async function sendTelegramNotification(chatId, message) {
    if (!chatId) {
        console.error('❌ No chatId provided');
        return false;
    }
    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown'
            })
        });
        const data = await response.json();
        if (!data.ok) {
            console.error('❌ Telegram API error:', data.description);
            if (data.description && data.description.includes('bot was blocked')) {
                console.warn('⚠️ Bot was blocked by user. Ask user to start the bot first.');
            }
            return false;
        }
        console.log('✅ Telegram notification sent to:', chatId);
        return true;
    } catch (error) {
        console.error('❌ Send notification error:', error);
        return false;
    }
}

// عرض الإشعارات في الواجهة
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

// دوال المستخدم
async function getUserId() {
    if (userId) return userId;
    let savedId = localStorage.getItem('zi_userId');
    if (savedId) { userId = savedId; return userId; }
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    localStorage.setItem('zi_userId', userId);
    try { await setDoc(doc(db, 'users', userId), { userId, wishlist: [], cart: [], history: [], requests: [], usedCodes: [], referrals: [], referralRewards: 0, rp: 0, isBanned: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true }); } catch (e) { console.error(e); }
    return userId;
}

let isLoadingUser = false;
let lastUserLoadTime = 0;

async function loadUserData() {
    const now = Date.now();
    if (isLoadingUser || (now - lastUserLoadTime < 500)) return;
    isLoadingUser = true;
    lastUserLoadTime = now;
    const uid = await getUserId();
    if (!uid) { isLoadingUser = false; return; }
    if (unsubscribeUser) { unsubscribeUser();
        unsubscribeUser = null; }
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
            userProfile.location = data.location || 'Tunisia';
            userProfile.lang = data.lang || 'English';
            userProfile.isBanned = data.isBanned || false;
            userProfile.joined = data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '--';
            userProfile.useRpForCart = data.useRpForCart || false;
            updateWishlistUI();
            updateCartUI();
            renderProducts(products);
            updateStatsFromProducts(products);
            generateRecommendations(products);
            updateBottomCartBar();
            updateDropdownStats();
            updateNotificationBadge();
            if (currentUser && currentUser.email === ADMIN_EMAIL) { loadAdminOrders();
                loadAdminUsers(); }
        } else {
            await setDoc(userRef, { userId: uid, wishlist: [], cart: [], history: [], requests: [], usedCodes: [], referrals: [], referralRewards: 0, rp: 0, isBanned: false, useRpForCart: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        try {
            wishlist = JSON.parse(localStorage.getItem('zi_wishlist_backup') || '[]');
            cart = JSON.parse(localStorage.getItem('zi_cart_backup') || '[]');
            userProfile.history = JSON.parse(localStorage.getItem('zi_history_backup') || '[]');
            userProfile.requests = JSON.parse(localStorage.getItem('zi_requests_backup') || '[]');
            userProfile.usedCodes = JSON.parse(localStorage.getItem('zi_usedcodes_backup') || '[]');
            userProfile.referrals = JSON.parse(localStorage.getItem('zi_referrals_backup') || '[]');
            userProfile.referralRewards = JSON.parse(localStorage.getItem('zi_referralRewards_backup') || '0');
            userProfile.rp = JSON.parse(localStorage.getItem('zi_rp_backup') || '0');
            userProfile.isBanned = JSON.parse(localStorage.getItem('zi_isBanned_backup') || 'false');
        } catch (e) { wishlist = []; cart = []; userProfile.history = []; userProfile.requests = []; userProfile.usedCodes = []; userProfile.referrals = []; userProfile.referralRewards = 0; userProfile.rp = 0; userProfile.isBanned = false; }
        updateWishlistUI();
        updateCartUI();
        renderProducts(products);
        updateStatsFromProducts(products);
        generateRecommendations(products);
        updateBottomCartBar();
        updateDropdownStats();
        updateNotificationBadge();
    }
    isLoadingUser = false;
}

async function saveUserData(silent = false) {
    const uid = await getUserId();
    if (!uid) return;
    try {
        await setDoc(doc(db, 'users', uid), { wishlist, cart, history: userProfile.history, requests: userProfile.requests, usedCodes: userProfile.usedCodes, referrals: userProfile.referrals, referralRewards: userProfile.referralRewards, rp: userProfile.rp, referralCode: userProfile.referralCode, telegram: userProfile.telegram, telegramChatId: userProfile.telegramChatId, location: userProfile.location, lang: userProfile.lang, useRpForCart: userProfile.useRpForCart, isBanned: userProfile.isBanned, updatedAt: serverTimestamp() }, { merge: true });
        localStorage.setItem('zi_wishlist_backup', JSON.stringify(wishlist));
        localStorage.setItem('zi_cart_backup', JSON.stringify(cart));
        localStorage.setItem('zi_history_backup', JSON.stringify(userProfile.history));
        localStorage.setItem('zi_requests_backup', JSON.stringify(userProfile.requests));
        localStorage.setItem('zi_usedcodes_backup', JSON.stringify(userProfile.usedCodes));
        localStorage.setItem('zi_referrals_backup', JSON.stringify(userProfile.referrals));
        localStorage.setItem('zi_referralRewards_backup', JSON.stringify(userProfile.referralRewards));
        localStorage.setItem('zi_rp_backup', JSON.stringify(userProfile.rp));
        localStorage.setItem('zi_isBanned_backup', JSON.stringify(userProfile.isBanned));
        return true;
    } catch (e) {
        console.error('Save failed:', e);
        localStorage.setItem('zi_wishlist_backup', JSON.stringify(wishlist));
        localStorage.setItem('zi_cart_backup', JSON.stringify(cart));
        localStorage.setItem('zi_history_backup', JSON.stringify(userProfile.history));
        localStorage.setItem('zi_requests_backup', JSON.stringify(userProfile.requests));
        localStorage.setItem('zi_usedcodes_backup', JSON.stringify(userProfile.usedCodes));
        localStorage.setItem('zi_referrals_backup', JSON.stringify(userProfile.referrals));
        localStorage.setItem('zi_referralRewards_backup', JSON.stringify(userProfile.referralRewards));
        localStorage.setItem('zi_rp_backup', JSON.stringify(userProfile.rp));
        localStorage.setItem('zi_isBanned_backup', JSON.stringify(userProfile.isBanned));
        return false;
    }
}

function generateReferralCode(name, email) {
    const prefix = name ? name.substring(0, 3).toUpperCase() : 'USR';
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${random}`;
}

// تحديثات الواجهة
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
    if (currentUser) {
        const displayName = currentUser.displayName || currentUser.email || 'User';
        avatar.textContent = displayName.charAt(0).toUpperCase();
        name.textContent = displayName;
        email.textContent = currentUser.email || 'No email';
        rp.textContent = userProfile.rp || 0;
        wishlistBadge.textContent = wishlist.length;
        wishlistBadge.style.display = wishlist.length > 0 ? 'inline-block' : 'none';
        const pendingOrders = userProfile.history.filter(o => (o.status || 'pending') === 'pending' || o.status === 'preparing' || o.status === 'shipped').length;
        const totalBadge = pendingOrders + unreadNotifications;
        if (totalBadge > 0) { orderBadge.style.display = 'inline-block';
            orderBadge.textContent = totalBadge; } else { orderBadge.style.display = 'none'; }
        if (unreadNotifications > 0) { notifBadge.style.display = 'inline-block';
            notifBadge.textContent = unreadNotifications; } else { notifBadge.style.display = 'none'; }
        const adminMenuItem = document.getElementById('adminMenuItem');
        if (currentUser.email === ADMIN_EMAIL) {
            adminMenuItem.style.display = 'flex';
            if (pendingCount > 0) { adminBadge.style.display = 'inline-block';
                adminBadge.textContent = pendingCount; } else { adminBadge.style.display = 'none'; }
        } else { adminMenuItem.style.display = 'none'; }
    } else {
        avatar.textContent = 'U';
        name.textContent = 'Guest';
        email.textContent = 'Not logged in';
        rp.textContent = '0';
        wishlistBadge.style.display = 'none';
        orderBadge.style.display = 'none';
        notifBadge.style.display = 'none';
        document.getElementById('adminMenuItem').style.display = 'none';
    }
}

// دوال التوثيق
window.showLogin = function() { document.getElementById('loginContainer').style.display = 'block';
    document.getElementById('registerContainer').style.display = 'none'; };
window.showRegister = function() { document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('registerContainer').style.display = 'block'; };
window.toggleReferral = function() { document.getElementById('referralField').classList.toggle('show'); };

// ✅ دالة تسجيل الدخول مع التحقق من Ban
window.loginUser = async function() {
    const btn = document.getElementById('loginBtn');
    btn.classList.add('loading');
    const errorEl = document.getElementById('loginError');
    const successEl = document.getElementById('loginSuccess');
    errorEl.textContent = '';
    successEl.textContent = '';
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) { errorEl.textContent = 'Please fill in all fields';
        btn.classList.remove('loading'); return; }
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // ⭐ التحقق من حالة Ban
        const userRef = doc(db, 'users', userCredential.user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.isBanned === true) {
                await signOut(auth);
                errorEl.textContent = '🚫 Your account has been banned. Please contact support.';
                showToast('🚫 Account banned!', 'error');
                btn.classList.remove('loading');
                return;
            }
        }
        
        currentUser = userCredential.user;
        successEl.textContent = '✅ Login successful!';
        showToast('👋 Welcome back!', 'success');
        btn.classList.remove('loading');
        setTimeout(() => {
            document.getElementById('authSection').style.display = 'none';
            document.getElementById('mainApp').style.display = 'block';
            loadUserData();
            updateDropdownStats();
            if (currentUser.email === ADMIN_EMAIL) { loadAdminOrders();
                startAdminRealtimeListener();
                loadAdminUsers(); }
            loadDownloads();
            loadNotifications();
            fetchCryptoPrices();
            updateFullUserMenu();
        }, 500);
    } catch (error) { errorEl.textContent = '❌ ' + error.message;
        showToast('❌ Login failed', 'error');
        btn.classList.remove('loading'); }
};

// ✅ دالة التسجيل مع إضافة isBanned: false
window.registerUser = async function() {
    const btn = document.getElementById('registerBtn');
    btn.classList.add('loading');
    const errorEl = document.getElementById('registerError');
    const successEl = document.getElementById('registerSuccess');
    errorEl.textContent = '';
    successEl.textContent = '';
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const country = document.getElementById('registerCountry').value;
    const lang = document.getElementById('registerLang').value;
    const referralCode = document.getElementById('registerReferral').value.trim().toUpperCase();
    const termsChecked = document.getElementById('termsCheck').checked;
    if (!name || !email || !password || !confirmPassword) { errorEl.textContent = 'Please fill in all fields';
        btn.classList.remove('loading'); return; }
    if (password.length < 6) { errorEl.textContent = 'Password must be at least 6 characters';
        btn.classList.remove('loading'); return; }
    if (password !== confirmPassword) { errorEl.textContent = 'Passwords do not match';
        btn.classList.remove('loading'); return; }
    if (!termsChecked) { errorEl.textContent = 'Please agree to the terms';
        btn.classList.remove('loading'); return; }
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        currentUser = userCredential.user;
        const newReferralCode = generateReferralCode(name, email);
        let referrerId = null;
        if (referralCode) {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('referralCode', '==', referralCode));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) { querySnapshot.forEach((doc) => { referrerId = doc.id; }); }
        }
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, { 
            userId: currentUser.uid, 
            name, 
            email, 
            country, 
            lang, 
            telegram: '', 
            telegramChatId: '', 
            location: country, 
            wishlist: [], 
            cart: [], 
            history: [], 
            requests: [], 
            usedCodes: [], 
            referrals: [], 
            referralRewards: 0, 
            rp: 0, 
            useRpForCart: false, 
            referralCode: newReferralCode, 
            referredBy: referrerId || '', 
            isBanned: false,
            createdAt: serverTimestamp(), 
            updatedAt: serverTimestamp() 
        });
        if (referrerId) {
            const referrerRef = doc(db, 'users', referrerId);
            await updateDoc(referrerRef, { referrals: arrayUnion({ userId: currentUser.uid, name, email, date: new Date().toISOString() }), referralRewards: increment(5), rp: increment(5) });
            showToast('🎉 Referral code applied! +5 RP', 'success');
        }
        successEl.textContent = '✅ Registration successful!';
        showToast('🎉 Welcome, ' + name + '!', 'success');
        btn.classList.remove('loading');
        setTimeout(() => {
            document.getElementById('authSection').style.display = 'none';
            document.getElementById('mainApp').style.display = 'block';
            loadUserData();
            updateDropdownStats();
            loadDownloads();
            loadNotifications();
            fetchCryptoPrices();
            updateFullUserMenu();
        }, 500);
    } catch (error) { errorEl.textContent = '❌ ' + error.message;
        showToast('❌ Registration failed', 'error');
        btn.classList.remove('loading'); }
};

window.logoutUser = async function() {
    try {
        await signOut(auth);
        currentUser = null;
        activeDiscount = 0;
        activeDiscountCode = '';
        document.getElementById('adminPanel').classList.remove('open');
        closeUserMenuFull();
        if (unsubscribeAdmin) { unsubscribeAdmin();
            unsubscribeAdmin = null; }
        if (unsubscribeUser) { unsubscribeUser();
            unsubscribeUser = null; }
        pendingCount = 0;
        unreadNotifications = 0;
        document.getElementById('authSection').style.display = 'block';
        document.getElementById('mainApp').style.display = 'none';
        showToast('👋 Logged out', 'info');
        updateUI();
        updateNotificationBadge();
        loadUserData();
        updateFullUserMenu();
    } catch (error) { showToast('❌ Logout error', 'error'); }
};

window.openForgotPassword = function() { document.getElementById('forgotPasswordModal').classList.add('open');
    document.getElementById('forgotError').textContent = '';
    document.getElementById('forgotSuccess').textContent = ''; };
window.closeForgotPasswordModal = function() { document.getElementById('forgotPasswordModal').classList.remove('open');
    document.getElementById('authSection').style.display = 'block'; };
window.sendForgotPassword = async function() {
    const email = document.getElementById('forgotEmail').value.trim();
    const errorEl = document.getElementById('forgotError');
    const successEl = document.getElementById('forgotSuccess');
    errorEl.textContent = '';
    successEl.textContent = '';
    if (!email) { errorEl.textContent = 'Please enter your email'; return; }
    try {
        await sendPasswordResetEmail(auth, email);
        successEl.textContent = '✅ Reset link sent to ' + email;
        showToast('📧 Password reset link sent!', 'success');
        setTimeout(() => { closeForgotPasswordModal(); }, 2000);
    } catch (error) { errorEl.textContent = '❌ ' + error.message;
        showToast('❌ ' + error.message, 'error'); }
};

// دوال المودالات
window.openUserMenuFull = function() {
    if (!currentUser) { openAuthModal(); return; }
    document.getElementById('userMenuFull').classList.add('open');
    updateFullUserMenu();
    document.body.style.overflow = 'hidden';
};
window.closeUserMenuFull = function() { document.getElementById('userMenuFull').classList.remove('open');
    document.body.style.overflow = ''; };
window.openCartFull = function() { document.getElementById('cartFull').classList.add('open');
    renderCartFull();
    document.body.style.overflow = 'hidden'; };
window.closeCartFull = function() { document.getElementById('cartFull').classList.remove('open');
    document.body.style.overflow = ''; };
window.openWishlistFull = function() { document.getElementById('wishlistFull').classList.add('open');
    renderWishlistFull();
    document.body.style.overflow = 'hidden'; };
window.closeWishlistFull = function() { document.getElementById('wishlistFull').classList.remove('open');
    document.body.style.overflow = ''; };
window.openProfileFull = function() {
    if (!currentUser) { showToast('⚠️ Please login first', 'warning');
        openAuthModal(); return; }
    document.getElementById('profileFull').classList.add('open');
    renderProfileFull();
    document.body.style.overflow = 'hidden';
};
window.closeProfileFull = function() { document.getElementById('profileFull').classList.remove('open');
    document.body.style.overflow = ''; };
window.openHistoryFull = function() {
    if (!currentUser) { showToast('⚠️ Please login first', 'warning');
        openAuthModal(); return; }
    document.getElementById('historyFull').classList.add('open');
    renderHistoryFull();
    document.body.style.overflow = 'hidden';
};
window.closeHistoryFull = function() { document.getElementById('historyFull').classList.remove('open');
    document.body.style.overflow = ''; };

function openAuthModal() {
    document.getElementById('authSection').scrollIntoView({ behavior: 'smooth' });
}

// عرض الملف الشخصي مع زر الربط المباشر
function renderProfileFull() {
    const container = document.getElementById('profileFullContent');
    if (!currentUser) {
        container.innerHTML =
            `<div style="text-align:center;padding:40px 20px;color:var(--text-secondary);"><i class="fas fa-user-circle" style="font-size:48px;opacity:0.15;display:block;margin-bottom:12px;"></i><div style="font-size:18px;font-weight:600;font-family:var(--font);">Please login</div><div style="font-size:13px;opacity:0.4;margin-top:4px;">Login to view your profile</div></div>`;
        return;
    }
    const displayName = currentUser.displayName || currentUser.email || 'User';
    container.innerHTML = `
    <div style="background:var(--card-bg);border-radius:14px;border:1px solid var(--border);padding:16px;margin-bottom:12px;">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--border);">
        <div style="width:56px;height:56px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:#fff;font-family:var(--font);flex-shrink:0;">${displayName.charAt(0).toUpperCase()}</div>
        <div>
          <div style="font-size:16px;font-weight:700;color:var(--text);font-family:var(--font);">${displayName}</div>
          <div style="font-size:13px;color:var(--text-secondary);font-family:var(--font);">${currentUser.email || 'No email'}</div>
          <div style="font-size:13px;color:var(--vip-color);font-weight:700;font-family:var(--font);">🎯 RP: ${userProfile.rp || 0}</div>
          ${userProfile.isBanned ? '<div style="font-size:13px;color:var(--danger);font-weight:700;font-family:var(--font);">🚫 BANNED</div>' : ''}
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">
        <div style="background:var(--bg);border-radius:8px;padding:10px;text-align:center;border:1px solid var(--border);"><div style="font-size:18px;font-weight:700;color:var(--text);font-family:var(--font);">${userProfile.history.length}</div><div style="font-size:10px;color:var(--text-secondary);font-family:var(--font);">Orders</div></div>
        <div style="background:var(--bg);border-radius:8px;padding:10px;text-align:center;border:1px solid var(--border);"><div style="font-size:18px;font-weight:700;color:var(--vip-color);font-family:var(--font);">${userProfile.rp || 0}</div><div style="font-size:10px;color:var(--text-secondary);font-family:var(--font);">RP Points</div></div>
        <div style="background:var(--bg);border-radius:8px;padding:10px;text-align:center;border:1px solid var(--border);"><div style="font-size:18px;font-weight:700;color:var(--heart-color);font-family:var(--font);">${wishlist.length}</div><div style="font-size:10px;color:var(--text-secondary);font-family:var(--font);">Favorites</div></div>
      </div>
    </div>

    <div class="edit-profile-inline">
      <div style="font-size:14px;font-weight:700;color:var(--text);font-family:var(--font);margin-bottom:8px;"><i class="fas fa-edit"></i> Edit Profile</div>
      <form onsubmit="saveProfileChangesInline(event)">
        <label>Name</label>
        <input id="editNameInline" value="${userProfile.name || currentUser.displayName || ''}" placeholder="Enter your name" type="text" />
        <label>Telegram Username</label>
        <input id="editTelegramInline" value="${userProfile.telegram || ''}" placeholder="@username" type="text" />
        <label>Country</label>
        <select id="editLocationInline">
          <option value="Tunisia" ${userProfile.location==='Tunisia'?'selected':''}>🇹🇳 Tunisia</option>
          <option value="Algeria" ${userProfile.location==='Algeria'?'selected':''}>🇩🇿 Algeria</option>
          <option value="Morocco" ${userProfile.location==='Morocco'?'selected':''}>🇲🇦 Morocco</option>
          <option value="Egypt" ${userProfile.location==='Egypt'?'selected':''}>🇪🇬 Egypt</option>
          <option value="Saudi Arabia" ${userProfile.location==='Saudi Arabia'?'selected':''}>🇸🇦 Saudi Arabia</option>
          <option value="UAE" ${userProfile.location==='UAE'?'selected':''}>🇦🇪 UAE</option>
          <option value="Other" ${userProfile.location==='Other'?'selected':''}>🌍 Other</option>
        </select>
        <label>Language</label>
        <select id="editLangInline">
          <option value="English" ${userProfile.lang==='English'?'selected':''}>🇬🇧 English</option>
          <option value="Arabic" ${userProfile.lang==='Arabic'?'selected':''}>🇸🇦 العربية</option>
          <option value="French" ${userProfile.lang==='French'?'selected':''}>🇫🇷 Français</option>
        </select>
        <div class="form-actions">
          <button type="button" class="btn-cancel" onclick="renderProfileFull()">Cancel</button>
          <button type="submit" class="btn-save"><i class="fas fa-save"></i> Save</button>
        </div>
      </form>
    </div>

    <div class="password-inline">
      <div style="font-size:14px;font-weight:700;color:var(--text);font-family:var(--font);margin-bottom:8px;"><i class="fas fa-lock"></i> Password & Security</div>
      <div class="ps-email">
        <span>${currentUser.email || 'No email'}</span>
        <button onclick="sendResetLinkInline()"><i class="fas fa-paper-plane"></i> Send Reset Link</button>
      </div>
      <div style="border-top:1px solid var(--border);padding-top:12px;margin-top:8px;">
        <div style="font-size:12px;color:var(--text-secondary);font-family:var(--font);opacity:0.4;margin-bottom:6px;">Use your current password to set a new one instantly.</div>
        <div class="auth-field"><label>Current Password</label><input id="currentPasswordInline" placeholder="Enter current password" type="password" /></div>
        <div class="auth-field"><label>New Password</label><input id="newPasswordInline" placeholder="Enter new password (min 6 chars)" type="password" /></div>
        <div class="auth-field"><label>Confirm New Password</label><input id="confirmNewPasswordInline" placeholder="Confirm new password" type="password" /></div>
        <button class="auth-btn" onclick="changePasswordInline()"><i class="fas fa-key"></i> Change Password</button>
        <div class="auth-error" id="passwordErrorInline"></div>
        <div class="auth-success" id="passwordSuccessInline"></div>
      </div>
    </div>

    <!-- ✅ قسم ربط تيليجرام -->
    <div class="telegram-bind-section" style="margin-top:12px;">
      <div style="font-size:14px;font-weight:700;color:var(--text);font-family:var(--font);margin-bottom:6px;"><i class="fab fa-telegram-plane" style="color:#0088cc;"></i> Telegram Notifications</div>
      <div class="tb-row"><span class="tb-label">Status</span><span class="tb-value"><span class="tb-status ${userProfile.telegramChatId?'linked':'unlinked'}">${userProfile.telegramChatId?'✅ Linked':'❌ Unlinked'}</span></span></div>
      ${userProfile.telegramChatId?`<div class="tb-row"><span class="tb-label">Chat ID</span><span class="tb-value">${userProfile.telegramChatId}</span></div>`:''}
      <div style="background:var(--card-bg);padding:10px;border-radius:8px;margin:8px 0;border:1px solid var(--border);">
        <div style="font-size:13px;color:var(--text-secondary);font-family:var(--font);">
          <i class="fas fa-info-circle" style="color:var(--primary);"></i> 
          ${userProfile.telegramChatId ? 'You will receive order notifications here.' : 'Click the button below to link your Telegram account.'}
        </div>
      </div>
      <div class="tb-actions">
        <button class="btn-bind" onclick="bindTelegram()" style="flex:1;">
          <i class="fas ${userProfile.telegramChatId?'fa-sync':'fa-link'}"></i> 
          ${userProfile.telegramChatId?'Re-link':'Link Telegram'}
        </button>
        ${userProfile.telegramChatId ? `<button class="btn-test" onclick="testTelegramNotification()"><i class="fas fa-paper-plane"></i> Test</button>` : ''}
        <button class="btn-check" onclick="checkTelegramStatus()"><i class="fas fa-sync-alt"></i> Check</button>
      </div>
      <div style="font-size:11px;color:var(--text-secondary);opacity:0.4;margin-top:6px;font-family:var(--font);">
        <i class="fab fa-telegram-plane" style="color:#0088cc;"></i> 
        ${userProfile.telegramChatId ? 'You are connected to @Zistore_Notif_bot' : 'Start @Zistore_Notif_bot and click "Link" to connect'}
      </div>
    </div>
  `;
}

// ✅ ربط تيليجرام المبسط (باستخدام بوت واحد)
window.bindTelegram = async function() {
    if (!currentUser) { showToast('⚠️ Please login first', 'warning'); return; }

    try {
        const bindCode = currentUser.uid.slice(-8) + Math.random().toString(36).substring(2, 6);

        const bindRef = doc(db, 'telegram_binds', bindCode);
        await setDoc(bindRef, {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            userName: currentUser.displayName || 'User',
            createdAt: serverTimestamp(),
            status: 'pending'
        });

        const botUsername = 'Zistore_Notif_bot';
        const message = `🔗 *ربط حساب تيليجرام*\n\n👤 المستخدم: ${currentUser.displayName || currentUser.email}\n📧 البريد: ${currentUser.email}\n🆔 كود الربط: \`${bindCode}\`\n\n📌 أرسل هذا الكود إلى البوت: [@${botUsername}](https://t.me/${botUsername})`;

        await sendTelegramNotification(TELEGRAM_CHAT_ID, message);
        window.open(`https://t.me/${botUsername}`, '_blank');
        showToast('📨 تم إرسال طلب الربط إلى تيليجرام!', 'success');
        startBindingListener(bindCode);

    } catch (error) {
        console.error('Telegram bind error:', error);
        showToast('❌ خطأ في الاتصال مع تيليجرام', 'error');
    }
};

// الاستماع لتأكيد الربط
function startBindingListener(bindCode) {
    const bindRef = doc(db, 'telegram_binds', bindCode);
    const unsubscribe = onSnapshot(bindRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            if (data.status === 'completed' && data.telegramChatId) {
                userProfile.telegramChatId = data.telegramChatId;
                saveUserData();
                renderProfileFull();
                showToast('✅ تم ربط تيليجرام بنجاح!', 'success');
                sendTelegramNotification(
                    userProfile.telegramChatId,
                    `🔔 *مرحباً بك في ZI Store!*\n\nتم ربط حسابك بنجاح.\nستستلم إشعارات الطلبات هنا.\n\nشكراً لاستخدامك ZI Store! 🚀`
                );
                updateFullUserMenu();
                unsubscribe();
            }
        }
    });
    setTimeout(() => { unsubscribe(); }, 300000);
}

// ✅ اختبار الإشعارات
window.testTelegramNotification = async function() {
    if (!currentUser) { showToast('⚠️ Please login first', 'warning'); return; }
    if (!userProfile.telegramChatId) { showToast('⚠️ No Telegram linked', 'warning'); return; }

    const result = await sendTelegramNotification(
        userProfile.telegramChatId,
        `🔔 *اختبار الإشعارات*\n\nهذه رسالة اختبار من ZI Store.\n📅 ${new Date().toLocaleString()}\n\nإذا رأيت هذه الرسالة، فالإشعارات تعمل بشكل صحيح! ✅`
    );

    if (result) {
        showToast('✅ تم إرسال رسالة اختبار! تحقق من تيليجرام.', 'success');
    } else {
        showToast('❌ فشل إرسال رسالة الاختبار. تأكد من Chat ID.', 'error');
    }
};

window.checkTelegramStatus = async function() {
    if (!currentUser) { showToast('⚠️ Please login first', 'warning'); return; }
    try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.telegramChatId) {
                // محاولة إرسال رسالة اختبار للتحقق
                const testResult = await sendTelegramNotification(
                    data.telegramChatId,
                    `🔍 *فحص الاتصال*\n\n✅ تم التحقق من اتصالك مع البوت بنجاح!\n📅 ${new Date().toLocaleString()}`
                );
                if (testResult) {
                    showToast(`✅ مرتبط مع تيليجرام (Chat ID: ${data.telegramChatId})`, 'success');
                    userProfile.telegramChatId = data.telegramChatId;
                    renderProfileFull();
                } else {
                    showToast('⚠️ البوت لا يستطيع إرسال رسالة. تأكد من أنك بدأت المحادثة مع @Zistore_Notif_bot', 'warning');
                }
            } else { showToast('❌ غير مرتبط مع تيليجرام', 'warning'); }
        }
    } catch (error) { console.error('Check telegram status error:', error);
        showToast('❌ خطأ في التحقق', 'error'); }
};

// بقية الدوال
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
        userProfile.name = name;
        userProfile.telegram = telegram;
        userProfile.location = location;
        userProfile.lang = lang;
        showToast('✅ Profile updated!', 'success');
        updateUI();
        renderProfileFull();
        updateFullUserMenu();
    } catch (error) { showToast('❌ Error: ' + error.message, 'error'); }
};

window.sendResetLinkInline = async function() {
    if (!currentUser) { showToast('⚠️ Please login first', 'warning'); return; }
    try {
        await sendPasswordResetEmail(auth, currentUser.email);
        showToast(`📧 Reset link sent to ${currentUser.email}`, 'success');
    } catch (error) { showToast('❌ ' + error.message, 'error'); }
};

window.changePasswordInline = async function() {
    if (!currentUser) { showToast('⚠️ Please login first', 'warning'); return; }
    const currentPwd = document.getElementById('currentPasswordInline').value;
    const newPwd = document.getElementById('newPasswordInline').value;
    const confirmPwd = document.getElementById('confirmNewPasswordInline').value;
    const errorEl = document.getElementById('passwordErrorInline');
    const successEl = document.getElementById('passwordSuccessInline');
    errorEl.textContent = '';
    successEl.textContent = '';
    if (!currentPwd || !newPwd || !confirmPwd) { errorEl.textContent = 'Please fill all fields'; return; }
    if (newPwd.length < 6) { errorEl.textContent = 'New password must be at least 6 characters'; return; }
    if (newPwd !== confirmPwd) { errorEl.textContent = 'Passwords do not match'; return; }
    try {
        const credential = EmailAuthProvider.credential(currentUser.email, currentPwd);
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, newPwd);
        successEl.textContent = '✅ Password changed successfully!';
        showToast('✅ Password updated!', 'success');
        document.getElementById('currentPasswordInline').value = '';
        document.getElementById('newPasswordInline').value = '';
        document.getElementById('confirmNewPasswordInline').value = '';
        setTimeout(() => { successEl.textContent = ''; }, 3000);
    } catch (error) { errorEl.textContent = '❌ ' + error.message;
        showToast('❌ ' + error.message, 'error'); }
};

// دوال المنتجات
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
    const productsRef = collection(db, 'products');
    unsubscribeProducts = onSnapshot(query(productsRef, orderBy('createdAt', 'desc')), (snapshot) => {
        const productsList = [];
        snapshot.forEach((doc) => { productsList.push({ id: doc.id, ...doc.data() }); });
        products = productsList.length > 0 ? productsList : fallbackProducts;
        renderProducts(products);
        renderAdminProducts(products);
        updateStatsFromProducts(products);
        generateRecommendations(products);
        updateBottomCartBar();
        updateRpDisplay();
    }, (error) => { console.error('Products listener error:', error);
        products = fallbackProducts;
        renderProducts(products);
        renderAdminProducts(products);
        updateStatsFromProducts(products); });
}

function renderProducts(productsList) {
    const container = document.getElementById('productList');
    if (!container) return;
    const list = productsList || [];
    if (list.length === 0) { container.innerHTML =
            `<div style="grid-column:1/-1;text-align:center;padding:20px 0;color:var(--text-secondary);font-size:14px;font-family:var(--font);"><i class="fas fa-search" style="font-size:28px;opacity:0.2;display:block;margin-bottom:4px;"></i><p>No products</p></div>`; return; }
    let filtered = [...list];
    if (currentFilter === 'free') filtered = filtered.filter(p => p.price === 0);
    else if (currentFilter === 'paid') filtered = filtered.filter(p => p.price > 0);
    if (filtered.length === 0) { container.innerHTML =
            `<div style="grid-column:1/-1;text-align:center;padding:20px 0;color:var(--text-secondary);font-size:14px;font-family:var(--font);"><i class="fas fa-search" style="font-size:28px;opacity:0.2;display:block;margin-bottom:4px;"></i><p>No results</p></div>`; return; }
    container.innerHTML = filtered.map(p => {
        const isFree = p.price === 0;
        const isUnavailable = p.status === 'unavailable';
        const inCart = cart.some(item => item.id === p.id);
        const inWish = wishlist.includes(p.id);
        const qty = cart.find(item => item.id === p.id)?.quantity || 0;
        const badgeLabel = isFree ? 'FREE' : (isUnavailable ? 'Unavailable' : 'VIP');
        const badgeClass = isUnavailable ? 'unavailable' : (isFree ? 'free' : 'vip');
        const displayFeatures = p.features ? p.features.slice(0, 3) : [];
        let displayPrice = p.price;
        let originalPrice = '';
        let discountBadge = '';
        let rpDiscountText = '';
        if (!isUnavailable) {
            const rpDiscount = Math.min((userProfile.rp || 0) * RP_TO_DOLLAR, p.price);
            if (rpDiscount > 0 && p.price > 0) {
                const discountedPrice = p.price - rpDiscount;
                displayPrice = discountedPrice;
                rpDiscountText =
                    `<span class="rp-discount">🎯 -${Math.floor(rpDiscount / RP_TO_DOLLAR)} RP (${rpDiscount.toFixed(2)} $)</span>`;
            }
            if (activeDiscount > 0 && p.price > 0) {
                const discounted = displayPrice - (displayPrice * activeDiscount / 100);
                displayPrice = discounted;
                originalPrice = `<span class="original-price">${p.price} $</span>`;
                discountBadge = `<span class="discount-badge">-${activeDiscount}%</span>`;
            }
        }
        const imageFilter = isUnavailable ? 'grayscale(100%)' : 'none';
        const unavailableOverlay = isUnavailable ?
            `<div style="position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;border-radius:10px;z-index:3;"><span style="background:var(--danger);color:#fff;padding:4px 12px;border-radius:14px;font-size:11px;font-weight:700;font-family:var(--font);">⛔</span></div>` :
            '';
        return `
      <div class="product-card" onclick="window.openDetails('${p.id}')" style="${isUnavailable?'opacity:0.7;':''}">
        <div class="product-actions-top">
          <button class="share-btn" onclick="event.stopPropagation(); openShareModal('${p.id}')" title="Share"><i class="fas fa-share-alt"></i></button>
          <button class="wishlist-btn" onclick="event.stopPropagation(); window.toggleWishlist('${p.id}')"><i class="fas fa-heart heart-icon ${inWish?'liked':''}"></i></button>
        </div>
        <div class="image-wrapper">
          ${p.image?`<img src="${p.image}" alt="${p.name}" loading="lazy" style="filter:${imageFilter};" />`:`<div class="placeholder"><i class="fas fa-code"></i></div>`}
          ${unavailableOverlay}
          <div class="image-badge ${badgeClass}">${badgeLabel}</div>
        </div>
        <div class="product-name">${p.name}</div>
        <div class="features-list">
          ${displayFeatures.map(f=>`<span class="feature-item"><i class="fas fa-circle"></i> ${f}</span>`).join('')}
          ${displayFeatures.length>0 && p.features && p.features.length>3?`<span class="feature-item" style="opacity:0.2;">+${p.features.length-3}</span>`:''}
        </div>
        <div class="price">
          ${isUnavailable?'⛔ Unavailable':(isFree?'FREE':(displayPrice.toFixed(2)+' $'))}
          ${originalPrice}
          ${discountBadge}
          ${rpDiscountText}
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
    document.getElementById('totalScripts').textContent = total;
    document.getElementById('freeScripts').textContent = free;
    document.getElementById('vipScripts').textContent = vip;
    document.getElementById('wishlistStats').textContent = wishlist.length;
}

function generateRecommendations(productsList) {
    const grid = document.getElementById('recommendationsGrid');
    if (!grid) return;
    const list = productsList || [];
    if (!currentUser || (userProfile.history.length === 0 && wishlist.length === 0)) {
        const shuffled = [...list].sort(() => 0.5 - Math.random());
        const top = shuffled.slice(0, 4);
        if (top.length === 0) { grid.innerHTML =
                `<div class="rec-empty" style="grid-column:1/-1;text-align:center;padding:12px;color:var(--text-secondary);font-size:13px;"><i class="fas fa-lightbulb" style="display:block;font-size:24px;opacity:0.2;margin-bottom:4px;"></i><p>Start exploring scripts!</p></div>`; return; }
        grid.innerHTML = top.map(p =>
            `<div class="rec-item" onclick="window.openDetails('${p.id}')"><img src="${p.image||'https://picsum.photos/seed/default/200/120'}" alt="${p.name}" /><div class="r-name">${p.name}</div><div class="r-price">${p.price===0?'FREE':p.price+' $'}</div></div>`
        ).join('');
        return;
    }
    const userInterests = new Set();
    userProfile.history.forEach(item => { if (item.id) userInterests.add(item.id); });
    wishlist.forEach(id => { userInterests.add(id); });
    if (userInterests.size > 0) {
        const recommendations = list.filter(p => !userInterests.has(p.id));
        const shuffled = recommendations.sort(() => 0.5 - Math.random());
        const top = shuffled.slice(0, 4);
        if (top.length === 0) {
            const random = [...list].sort(() => 0.5 - Math.random()).slice(0, 4);
            grid.innerHTML = random.map(p =>
                `<div class="rec-item" onclick="window.openDetails('${p.id}')"><img src="${p.image||'https://picsum.photos/seed/default/200/120'}" alt="${p.name}" /><div class="r-name">${p.name}</div><div class="r-price">${p.price===0?'FREE':p.price+' $'}</div></div>`
            ).join('');
            return;
        }
        grid.innerHTML = top.map(p =>
            `<div class="rec-item" onclick="window.openDetails('${p.id}')"><img src="${p.image||'https://picsum.photos/seed/default/200/120'}" alt="${p.name}" /><div class="r-name">${p.name}</div><div class="r-price">${p.price===0?'FREE':p.price+' $'}</div></div>`
        ).join('');
    } else {
        const shuffled = [...list].sort(() => 0.5 - Math.random()).slice(0, 4);
        grid.innerHTML = shuffled.map(p =>
            `<div class="rec-item" onclick="window.openDetails('${p.id}')"><img src="${p.image||'https://picsum.photos/seed/default/200/120'}" alt="${p.name}" /><div class="r-name">${p.name}</div><div class="r-price">${p.price===0?'FREE':p.price+' $'}</div></div>`
        ).join('');
    }
}

// دوال السلة
window.addToCart = async function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || product.price === 0) { showToast('⚠️ This script is free', 'warning'); return; }
    const existing = cart.find(item => item.id === productId);
    if (existing) { existing.quantity = (existing.quantity || 1) + 1; } else { cart.push({ ...product, quantity: 1 }); }
    await saveUserData(true);
    updateCartUI();
    renderProducts(products);
    updateBottomCartBar();
    showToast(`✅ Added ${product.name} to cart`, 'success');
};

window.clearCart = async function() {
    if (cart.length === 0) return;
    cart = [];
    await saveUserData();
    updateCartUI();
    renderProducts(products);
    updateBottomCartBar();
    showToast('🗑️ Cart cleared', 'info');
};

window.removeFromCart = async function(productId) {
    cart = cart.filter(item => item.id !== productId);
    await saveUserData(true);
    updateCartUI();
    renderProducts(products);
    updateBottomCartBar();
    showToast('🗑️ Removed from cart', 'info');
};

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
    cart.forEach(item => { const qty = item.quantity || 1;
        totalSum += item.price * qty; });
    let rpDiscountAmount = 0;
    if (userProfile.useRpForCart) { rpDiscountAmount = Math.min((userProfile.rp || 0) * RP_TO_DOLLAR, totalSum); }
    let finalTotal = totalSum - rpDiscountAmount;
    let promoDiscountAmount = 0;
    if (activeDiscount > 0 && totalSum > 0) { promoDiscountAmount = (finalTotal * activeDiscount) / 100;
        finalTotal = finalTotal - promoDiscountAmount; }
    if (finalTotal < 0) finalTotal = 0;
    if (cart.length === 0) { bar.classList.remove('open'); return; }
    bar.classList.add('open');
    if (countEl) countEl.textContent = totalItems;
    if (totalEl) totalEl.textContent = '$' + finalTotal.toFixed(2);
}

function updateCartUI() {
    const count = document.getElementById('cartCount');
    const totalItems = cart.reduce((s, i) => s + (i.quantity || 1), 0);
    if (count) count.textContent = totalItems;
    updateBottomCartBar();
    renderCartFull();
    updateFullUserMenu();
}

function renderCartFull() {
    const container = document.getElementById('cartFullContent');
    if (cart.length === 0) {
        container.innerHTML =
            `<div style="text-align:center;padding:40px 20px;color:var(--text-secondary);"><i class="fas fa-shopping-basket" style="font-size:48px;opacity:0.15;display:block;margin-bottom:12px;"></i><div style="font-size:18px;font-weight:600;font-family:var(--font);">Cart is empty</div><div style="font-size:13px;opacity:0.4;margin-top:4px;">Start shopping to add items</div></div>`;
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
        html +=
            `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:var(--bg);border-radius:10px;border:1px solid var(--border);margin-bottom:8px;"><div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;"><img src="${image}" style="width:44px;height:44px;border-radius:8px;object-fit:cover;" /><div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:600;color:var(--text);font-family:var(--font);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</div><div style="font-size:12px;color:var(--primary);font-weight:700;font-family:var(--font);">$${itemTotal.toFixed(2)}</div></div></div><div style="display:flex;align-items:center;gap:6px;"><button onclick="updateCartQuantity('${item.id}',-1)" style="width:28px;height:28px;border-radius:50%;border:1px solid var(--border);background:var(--card-bg);color:var(--text);cursor:pointer;font-size:12px;">-</button><span style="min-width:20px;text-align:center;font-size:14px;font-weight:700;font-family:var(--font);">${qty}</span><button onclick="updateCartQuantity('${item.id}',1)" style="width:28px;height:28px;border-radius:50%;border:1px solid var(--border);background:var(--card-bg);color:var(--text);cursor:pointer;font-size:12px;">+</button><button onclick="removeFromCart('${item.id}')" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:14px;opacity:0.3;padding:4px;"><i class="fas fa-trash-alt"></i></button></div></div>`;
    });
    let rpDiscountAmount = 0;
    let promoDiscountAmount = 0;
    let finalTotal = total;
    if (userProfile.useRpForCart) { rpDiscountAmount = Math.min((userProfile.rp || 0) * RP_TO_DOLLAR, total);
        finalTotal = total - rpDiscountAmount; }
    if (activeDiscount > 0 && total > 0) { promoDiscountAmount = (finalTotal * activeDiscount) / 100;
        finalTotal = finalTotal - promoDiscountAmount; }
    if (finalTotal < 0) finalTotal = 0;
    html += `
    <div style="background:var(--bg);border-radius:10px;padding:12px;border:1px solid var(--border);margin:8px 0;">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;font-size:13px;font-family:var(--font);">
        <span style="color:var(--text-secondary);opacity:0.5;display:flex;align-items:center;gap:6px;"><i class="fas fa-star" style="color:var(--vip-color);"></i> Loyalty Points (RP)</span>
        <span style="color:var(--text);font-weight:600;">${userProfile.rp || 0} RP (≈ $${((userProfile.rp || 0) * RP_TO_DOLLAR).toFixed(2)})</span>
      </div>
      <button class="rp-btn ${userProfile.useRpForCart?'active':''}" onclick="toggleRpInCart()" style="width:100%;padding:6px;border:1px solid var(--border);border-radius:6px;background:var(--card-bg);color:var(--text);cursor:pointer;font-size:12px;font-family:var(--font);transition:0.3s;margin-top:4px;">
        <i class="fas ${userProfile.useRpForCart?'fa-check-circle':'fa-circle'}"></i>
        ${userProfile.useRpForCart?'Use RP ✓':'Use RP'}
      </button>
    </div>
    <div style="background:var(--bg);border-radius:10px;padding:12px;border:1px solid var(--border);margin:8px 0;">
      <div style="display:flex;gap:6px;align-items:center;">
        <input id="cartPromoInput" placeholder="Enter promo code..." style="flex:1;padding:6px 10px;border:1px solid var(--border);border-radius:6px;background:var(--card-bg);color:var(--text);font-size:13px;outline:none;font-family:var(--font);" type="text" />
        <button onclick="applyCartPromo()" style="padding:6px 14px;border:none;border-radius:6px;background:var(--primary);color:#fff;font-weight:600;cursor:pointer;font-size:12px;font-family:var(--font);transition:0.3s;white-space:nowrap;"><i class="fas fa-ticket-alt"></i> Apply</button>
      </div>
      <div class="promo-status" id="cartPromoStatus" style="font-size:11px;color:var(--text-secondary);opacity:0.4;font-family:var(--font);margin-top:4px;">${activeDiscount>0?`✅ ${activeDiscount}% discount active`:'Enter a promo code for a discount'}</div>
    </div>
    <div style="margin-top:12px;padding-top:12px;border-top:2px solid var(--border);">
      <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:14px;font-family:var(--font);"><span style="color:var(--text-secondary);opacity:0.5;">Subtotal</span><span style="color:var(--text);font-weight:600;">$${total.toFixed(2)}</span></div>
      ${rpDiscountAmount>0?`<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:14px;font-family:var(--font);color:var(--success);"><span style="color:var(--text-secondary);opacity:0.5;">🎯 RP discount (${Math.floor(rpDiscountAmount/RP_TO_DOLLAR)} RP)</span><span style="font-weight:600;">-$${rpDiscountAmount.toFixed(2)}</span></div>`:''}
      ${activeDiscount>0?`<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:14px;font-family:var(--font);color:var(--success);"><span style="color:var(--text-secondary);opacity:0.5;">🎫 Promo (${activeDiscount}%)</span><span style="font-weight:600;">-$${promoDiscountAmount.toFixed(2)}</span></div>`:''}
      <div style="display:flex;justify-content:space-between;padding:6px 0;border-top:1px solid var(--border);margin-top:4px;padding-top:6px;font-size:18px;font-weight:700;"><span style="color:var(--text-secondary);opacity:0.5;">Total</span><span style="color:var(--primary);">$${finalTotal.toFixed(2)}</span></div>
      <button onclick="closeCartFull();checkout();" style="width:100%;padding:10px;border:none;border-radius:8px;background:var(--primary);color:#fff;font-weight:700;cursor:pointer;font-size:14px;font-family:var(--font);margin-top:10px;transition:0.3s;"><i class="fas fa-credit-card"></i> Checkout</button>
    </div>
  `;
    container.innerHTML = html;
}

window.toggleRpInCart = function() { userProfile.useRpForCart = !userProfile.useRpForCart;
    saveUserData();
    renderCartFull(); };
window.applyCartPromo = function() {
    const input = document.getElementById('cartPromoInput');
    const code = input.value.trim().toUpperCase();
    const statusEl = document.getElementById('cartPromoStatus');
    if (!code) { statusEl.textContent = '⚠️ Please enter a code';
        statusEl.className = 'promo-status error'; return; }
    const codeData = discountCodes[code];
    if (!codeData) { statusEl.textContent = '❌ Invalid code';
        statusEl.className = 'promo-status error'; return; }
    activeDiscount = codeData.discount;
    activeDiscountCode = code;
    statusEl.textContent = `✅ ${codeData.discount}% discount applied!`;
    statusEl.className = 'promo-status success';
    input.value = '';
    renderCartFull();
    showToast(`🎉 ${codeData.discount}% discount applied!`, 'success');
};

// دوال الدفع
window.openDetails = function(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    const isFree = p.price === 0;
    const isUnavailable = p.status === 'unavailable';
    document.getElementById('modalGameImage').src = p.image || 'https://picsum.photos/seed/default/400/300';
    document.getElementById('modalGameImage').style.filter = isUnavailable ? 'grayscale(100%)' : 'none';
    document.getElementById('modalName').textContent = p.name + (isUnavailable ? ' ⛔' : '');
    const badge = document.getElementById('modalBadge');
    badge.textContent = isUnavailable ? '⛔ Unavailable' : (isFree ? '🎁 FREE' : '👑 VIP');
    badge.className = 'modal-badge ' + (isUnavailable ? 'unavailable' : (isFree ? 'free' : 'vip'));
    let priceDisplay = isUnavailable ? '⛔ Unavailable' : (isFree ? '💰 FREE' : `💰 ${p.price} $`);
    if (!isUnavailable && !isFree && p.price > 0) {
        const rpDiscount = Math.min((userProfile.rp || 0) * RP_TO_DOLLAR, p.price);
        if (rpDiscount > 0) {
            const discounted = p.price - rpDiscount;
            if (activeDiscount > 0) {
                const finalPrice = discounted - (discounted * activeDiscount / 100);
                priceDisplay =
                    `💰 ${finalPrice.toFixed(2)} $ <span style="font-size:12px;opacity:0.3;text-decoration:line-through;">${p.price} $</span> 🎯-${Math.floor(rpDiscount/RP_TO_DOLLAR)} RP`;
            } else {
                priceDisplay =
                    `💰 ${discounted.toFixed(2)} $ <span style="font-size:12px;opacity:0.3;text-decoration:line-through;">${p.price} $</span> 🎯-${Math.floor(rpDiscount/RP_TO_DOLLAR)} RP`;
            }
        } else if (activeDiscount > 0) {
            const discounted = p.price - (p.price * activeDiscount / 100);
            priceDisplay =
                `💰 ${discounted.toFixed(2)} $ <span style="font-size:12px;opacity:0.3;text-decoration:line-through;">${p.price} $</span>`;
        }
    }
    document.getElementById('modalPrice').innerHTML = priceDisplay;
    document.getElementById('modalFeatures').innerHTML = (p.features || []).map(f =>
        `<li><i class="fas fa-check-circle"></i> ${f}</li>`).join('') ||
        '<li style="opacity:0.3;">No features listed</li>';
    document.getElementById('modalDescription').textContent = p.description || '';
    document.getElementById('modalVideo').src = p.video || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    const inCart = cart.some(item => item.id === id);
    const actions = document.getElementById('modalActions');
    if (isUnavailable) {
        actions.innerHTML =
            `<button style="flex:1;padding:8px;border:none;border-radius:8px;background:var(--text-secondary);color:#fff;cursor:not-allowed;opacity:0.5;font-size:13px;font-family:var(--font);" onclick="showToast('⛔ Unavailable','warning')"><i class="fas fa-times-circle"></i> Unavailable</button><button class="btn-close-modal" onclick="closeDetailsModal()">Close</button>`;
    } else if (isFree && p.downloadLink) {
        actions.innerHTML =
            `<button class="btn-download-modal" onclick="window.openShareModal('${id}')" style="background:var(--referral-color);color:#fff;"><i class="fas fa-share-alt"></i></button><a href="${p.downloadLink}" target="_blank" class="btn-download-modal"><i class="fas fa-download"></i> Download</a><button class="btn-close-modal" onclick="closeDetailsModal()">Close</button>`;
    } else if (isFree) {
        actions.innerHTML =
            `<button class="btn-download-modal" onclick="window.openShareModal('${id}')" style="background:var(--referral-color);color:#fff;"><i class="fas fa-share-alt"></i></button><button class="btn-download-modal" onclick="showToast('⏳ Coming soon','info')"><i class="fas fa-download"></i></button><button class="btn-close-modal" onclick="closeDetailsModal()">Close</button>`;
    } else {
        actions.innerHTML =
            `<button class="btn-download-modal" onclick="window.openShareModal('${id}')" style="background:var(--referral-color);color:#fff;"><i class="fas fa-share-alt"></i></button><button class="btn-add-cart-modal ${inCart?'added':''}" onclick="window.addToCart('${id}');closeDetailsModal();"><i class="fas ${inCart?'fa-check':'fa-cart-plus'}"></i> ${inCart?'Added':'Add to Cart'}</button><button class="btn-close-modal" onclick="closeDetailsModal()">Close</button>`;
    }
    document.getElementById('detailsModal').classList.add('open');
    updateBottomCartBar();
};
window.closeDetailsModal = function() { document.getElementById('detailsModal').classList.remove('open'); };

// دوال المشاركة
window.openShareModal = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    shareProduct = product;
    document.getElementById('shareProductInfo').innerHTML =
        `<div style="display:flex;align-items:center;gap:10px;justify-content:center;"><img src="${product.image||'https://picsum.photos/seed/default/80/80'}" style="width:44px;height:44px;border-radius:8px;object-fit:cover;" /><div><div style="font-size:15px;font-weight:600;color:var(--text);font-family:var(--font);">${product.name}</div><div style="font-size:13px;color:var(--primary);font-weight:700;font-family:var(--font);">${product.price===0?'FREE':product.price+' $'}</div></div></div>`;
    document.getElementById('shareModal').classList.add('open');
};
window.closeShareModal = function() { document.getElementById('shareModal').classList.remove('open');
    shareProduct = null; };
window.shareToWhatsApp = function() { if (!shareProduct) return;
    const text =
        `🛒 *${shareProduct.name}*\n💰 Price: ${shareProduct.price===0?'FREE':shareProduct.price+' $'}\n📝 ${shareProduct.description||''}\n🔗 Visit the store to get it!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    closeShareModal(); };
window.shareToTelegram = function() { if (!shareProduct) return;
    const text =
        `🛒 *${shareProduct.name}*\n💰 Price: ${shareProduct.price===0?'FREE':shareProduct.price+' $'}\n📝 ${shareProduct.description||''}\n🔗 Visit the store to get it!`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`,
        '_blank');
    closeShareModal(); };
window.shareToFacebook = function() { if (!shareProduct) return;
    window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareProduct.name)}`,
        '_blank');
    closeShareModal(); };
window.copyShareLink = function() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => { showToast('✅ Link copied!', 'success');
        closeShareModal(); }).catch(() => { const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('✅ Link copied!', 'success');
        closeShareModal(); });
};

// دوال التصفية والبحث
window.filterProducts = function(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => { btn.classList.toggle('active', btn.dataset.filter ===
            filter); });
    renderProducts(products);
};

const searchInput = document.getElementById('liveSearchInput');
const searchResults = document.getElementById('searchResults');
const searchClear = document.getElementById('searchClear');
searchInput.addEventListener('input', function() {
    if (this.value.length > 0) { searchClear.classList.add('visible'); } else { searchClear.classList.remove(
            'visible');
        searchResults.classList.remove('active'); }
    performLiveSearch(this.value);
});

function performLiveSearch(query) {
    const searchTerm = query.trim().toLowerCase();
    if (!searchTerm) { searchResults.classList.remove('active'); return; }
    const results = products.filter(p => { return p.name.toLowerCase().includes(searchTerm) || (p.description && p
            .description.toLowerCase().includes(searchTerm)); });
    results.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aStartsWith = aName.startsWith(searchTerm);
        const bStartsWith = bName.startsWith(searchTerm);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return aName.indexOf(searchTerm) - bName.indexOf(searchTerm);
    });
    if (results.length === 0) {
        searchResults.innerHTML =
            `<div style="text-align:center;padding:16px;color:var(--text-secondary);"><i class="fas fa-search" style="font-size:24px;opacity:0.2;display:block;margin-bottom:4px;"></i><div style="font-size:14px;font-weight:600;font-family:var(--font);">No results</div><div style="font-size:12px;opacity:0.4;">No products match "${searchTerm}"</div></div>`;
        searchResults.classList.add('active');
        return;
    }
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
          <div style="font-size:13px;font-weight:600;color:var(--text);font-family:var(--font);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${highlightText(p.name,searchTerm)}</div>
          <div style="font-size:12px;color:var(--primary);font-weight:700;font-family:var(--font);">${priceDisplay}</div>
        </div>
        <span style="padding:2px 10px;border-radius:12px;font-size:9px;font-weight:700;font-family:var(--font);background:${badgeClass==='vip'?'var(--vip-color)':badgeClass==='free'?'var(--free-color)':'var(--danger)'};color:${badgeClass==='vip'||badgeClass==='free'?'#0a0a1a':'#fff'};">${badgeText}</span>
      </div>
    `;
    }).join('');
    searchResults.classList.add('active');
}

function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
    return text.replace(regex, '<span style="color: var(--primary); font-weight: 700;">$1</span>');
}
document.addEventListener('click', function(e) {
    const wrapper = document.querySelector('.search-wrapper');
    if (wrapper && !wrapper.contains(e.target)) { searchResults.classList.remove('active'); }
});
window.clearSearch = function() { searchInput.value = '';
    searchClear.classList.remove('visible');
    searchResults.classList.remove('active');
    searchInput.focus(); };

function closeSearchResults() { searchResults.classList.remove('active');
    searchInput.value = '';
    searchClear.classList.remove('visible'); }
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') { closeSearchResults();
        closeUserMenuFull();
        closeCartFull();
        closeWishlistFull();
        closeProfileFull();
        closeHistoryFull(); }
});

// دوال الدفع
async function fetchCryptoPrices() {
    if (cryptoPrices.isUpdating) return;
    cryptoPrices.isUpdating = true;
    try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=LTCUSDT');
        const data = await response.json();
        if (data && data.price) { cryptoPrices.ltc = parseFloat(data.price);
            cryptoPrices.usdt = 1;
            cryptoPrices.lastUpdate = new Date();
            updatePriceUI(); }
    } catch (error) {
        console.error('Error fetching crypto prices:', error);
        try {
            const response = await fetch(
                'https://api.coingecko.com/api/v3/simple/price?ids=litecoin,tether&vs_currencies=usd');
            const data = await response.json();
            if (data.litecoin && data.litecoin.usd) { cryptoPrices.ltc = data.litecoin.usd;
                cryptoPrices.usdt = data.tether?.usd || 1;
                cryptoPrices.lastUpdate = new Date();
                updatePriceUI(); }
        } catch (e) { console.error('Fallback fetch failed:', e); }
    }
    cryptoPrices.isUpdating = false;
}

function getLTCPrice() { return cryptoPrices.ltc || 42; }

function getUSDTPrice() { return cryptoPrices.usdt || 1; }

function updatePriceUI() {
    const exchangeRate = document.getElementById('exchangeRate');
    if (exchangeRate) {
        if (selectedPayment === 'litecoin' && cryptoPrices.ltc > 0) { exchangeRate.textContent =
                `1 LTC ≈ $${cryptoPrices.ltc.toFixed(2)} USD`; } else if (selectedPayment === 'usdt') { exchangeRate
                .textContent = `1 USDT ≈ $${cryptoPrices.usdt.toFixed(2)} USD`; }
    }
}

function updatePayableTotal() {
    let total = 0;
    cart.forEach(item => { const qty = item.quantity || 1;
        total += item.price * qty; });
    let finalTotal = total;
    if (userProfile.useRpForCart) { const rpDiscount = Math.min((userProfile.rp || 0) * RP_TO_DOLLAR, total);
        finalTotal = total - rpDiscount; }
    if (activeDiscount > 0 && total > 0) { const discountAmount = (finalTotal * activeDiscount) / 100;
        finalTotal = finalTotal - discountAmount; }
    if (finalTotal < 0) finalTotal = 0;
    document.getElementById('payableTotal').textContent = '$' + finalTotal.toFixed(2);
}

function updateCryptoAmount() {
    const totalEl = document.getElementById('step2Total');
    if (!totalEl) return;
    const total = parseFloat(totalEl.textContent.replace('$', '')) || 0;
    if (selectedPayment === 'litecoin') {
        const ltcPrice = getLTCPrice();
        if (ltcPrice > 0) { const amount = total / ltcPrice;
            document.getElementById('cryptoAmount').textContent = `${amount.toFixed(4)} LTC`; }
    } else if (selectedPayment === 'usdt') {
        const usdtPrice = getUSDTPrice();
        if (usdtPrice > 0) { const amount = total / usdtPrice;
            document.getElementById('cryptoAmount').textContent = `${amount.toFixed(2)} USDT`; }
    }
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
        updateCryptoAmount();
        updatePriceUI();
    }
    updatePayableTotal();
};

window.continuePayment = function() {
    if (!selectedPayment) { showToast('⚠️ Please select a payment method', 'warning'); return; }
    document.getElementById('paymentStep1').style.display = 'none';
    document.getElementById('paymentStep2').classList.add('active');
    renderPaymentProducts();
    let total = 0;
    cart.forEach(item => { const qty = item.quantity || 1;
        total += item.price * qty; });
    let rpDiscountAmount = 0;
    if (userProfile.useRpForCart) { rpDiscountAmount = Math.min((userProfile.rp || 0) * RP_TO_DOLLAR, total); }
    let finalTotal = total - rpDiscountAmount;
    let promoDiscountAmount = 0;
    if (activeDiscount > 0 && total > 0) { promoDiscountAmount = (finalTotal * activeDiscount) / 100;
        finalTotal = finalTotal - promoDiscountAmount; }
    if (finalTotal < 0) finalTotal = 0;
    document.getElementById('step2Subtotal').textContent = `$${total.toFixed(2)}`;
    document.getElementById('step2Total').textContent = `$${finalTotal.toFixed(2)}`;
    updateCryptoAmount();
    updatePriceUI();
    fetchCryptoPrices();
};

window.goToStep1 = function() { document.getElementById('paymentStep1').style.display = 'block';
    document.getElementById('paymentStep2').classList.remove('active'); };
window.copyWalletAddress = function() {
    const address = document.getElementById('walletAddressDisplay').textContent;
    if (address) {
        navigator.clipboard.writeText(address).then(() => { showToast('✅ Address copied!', 'success'); }).catch(
        () => { const textArea = document.createElement('textarea');
            textArea.value = address;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast('✅ Address copied!', 'success'); });
    }
};

// ✅ وظيفة إرسال الطلب مع إشعارات للمدير والمستخدم فقط
function sendOrderToTelegram(method, txHash = null) {
    if (!currentUser) { showToast('⚠️ Please login first', 'warning'); return; }

    let total = 0;
    let itemsList = '';
    cart.forEach((item, i) => {
        const qty = item.quantity || 1;
        const sub = item.price * qty;
        total += sub;
        itemsList += `${i+1}. ${item.name} × ${qty} = ${sub.toFixed(2)} $\n`;
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

    const orderId = 'order_' + Date.now();

    // ⭐ نظام مكافآت RP
    const RP_EARN_RATE = 0.1;
    const rpEarned = Math.floor((finalTotal / RP_TO_DOLLAR) * RP_EARN_RATE);
    
    if (rpEarned > 0) {
        userProfile.rp = (userProfile.rp || 0) + rpEarned;
        discountText += `\n🎯 RP مكتسب: +${rpEarned} RP (قيمة ${finalTotal.toFixed(2)}$)`;
        showToast(`🎉 ربحت ${rpEarned} نقاط RP!`, 'success');
    }

    // ✅ رسالة للمدير فقط
    let adminMsg = '🛒 **طلب جديد**\n\n';
    adminMsg += `👤 **العميل:** ${currentUser.displayName || currentUser.email || 'Unknown'}\n`;
    adminMsg += `📧 **البريد:** ${currentUser.email || 'N/A'}\n`;
    adminMsg += `📅 **التاريخ:** ${new Date().toLocaleString()}\n\n`;
    adminMsg += `📦 **المنتجات:**\n${itemsList}\n`;
    adminMsg += `💰 **المجموع:** ${total.toFixed(2)}$`;
    if (discountText) adminMsg += discountText;
    adminMsg += `\n💵 **الإجمالي:** ${finalTotal.toFixed(2)}$`;
    adminMsg += `\n💬 **طريقة الدفع:** ${method}`;
    adminMsg += `\n🎯 **رصيد RP الحالي:** ${userProfile.rp || 0}`;
    if (method === 'litecoin') {
        adminMsg += `\n📍 **عنوان LTC:** ${paymentWallets.litecoin.address}`;
        if (txHash) adminMsg += `\n🔍 **Tx Hash:** ${txHash}`;
    } else if (method === 'usdt') {
        adminMsg += `\n📍 **عنوان USDT:** ${paymentWallets.usdt.address}`;
        if (txHash) adminMsg += `\n🔍 **Tx Hash:** ${txHash}`;
    }
    adminMsg += `\n\n📎 **رقم الطلب:** #${orderId.slice(-6)}`;

    // ✅ إرسال إشعار للمدير فقط
    sendTelegramNotification(TELEGRAM_CHAT_ID, adminMsg);

    // ✅ إرسال إشعار للمستخدم فقط (إذا كان مربطاً)
    if (userProfile.telegramChatId) {
        const userMsg = `🛒 *طلب جديد*\n\n📦 #${orderId.slice(-6)}\n💰 ${finalTotal.toFixed(2)}$\n📅 ${new Date().toLocaleString()}\n${rpEarned > 0 ? `🎯 +${rpEarned} RP مكافأة!\n` : ''}\nشكراً لتسوقك معنا! سيتم معالجة طلبك قريباً.`;
        sendTelegramNotification(userProfile.telegramChatId, userMsg);
    }

    // فتح محادثة المدير (اختياري)
    window.open(`https://t.me/Mitalica69?text=${encodeURIComponent(adminMsg)}`, '_blank');

    // حفظ الطلب
    const orderItem = {
        id: orderId,
        items: cart.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity || 1 })),
        total: finalTotal,
        method: method,
        date: new Date().toISOString(),
        status: 'pending',
        txHash: txHash || null,
        rpUsed: Math.floor(rpDiscountAmount / RP_TO_DOLLAR) || 0,
        rpEarned: rpEarned || 0
    };

    const rpToDeduct = Math.floor(rpDiscountAmount / RP_TO_DOLLAR);
    if (rpToDeduct > 0) {
        userProfile.rp = (userProfile.rp || 0) - rpToDeduct;
        userProfile.useRpForCart = false;
    }

    const userRef = doc(db, 'users', currentUser.uid);
    updateDoc(userRef, {
        history: arrayUnion(orderItem),
        rp: userProfile.rp || 0,
        useRpForCart: false
    }).catch(console.error);
    userProfile.history.push(orderItem);

    // ✅ إضافة إشعار في قاعدة البيانات للمستخدم فقط
    try {
        addDoc(collection(db, 'notifications'), {
            title: `🛒 New Order #${orderId.slice(-6)}`,
            message: `Your order has been placed successfully! Total: ${finalTotal.toFixed(2)}$`,
            userId: currentUser.uid,
            readBy: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        }).catch(e => console.error('Error saving notification:', e));
    } catch (e) { console.error('Error saving notification:', e); }

    // تنظيف السلة
    cart = [];
    activeDiscount = 0;
    activeDiscountCode = '';
    saveUserData();
    updateCartUI();
    updateBottomCartBar();
    renderProducts(products);
    generateRecommendations(products);
    updateRpDisplay();

    showToast('📤 تم إرسال الطلب بنجاح!', 'success');
    document.getElementById('paymentModal').classList.remove('open');
    document.getElementById('paymentStep1').style.display = 'block';
    document.getElementById('paymentStep2').classList.remove('active');
    selectedPayment = null;
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));

    setTimeout(() => {
        if (currentUser && currentUser.email === ADMIN_EMAIL) { loadAdminOrders(); }
        loadUserData();
        updateDropdownStats();
        updateFullUserMenu();
    }, 1000);
}

window.placeOrder = function() {
    const txHash = document.getElementById('transactionHashInput').value.trim();
    if (selectedPayment === 'litecoin' || selectedPayment === 'usdt') {
        if (!txHash) { showToast('⚠️ Please paste the transaction hash', 'warning');
            document.getElementById('transactionHashInput').style.borderColor = 'var(--danger)';
            setTimeout(() => { document.getElementById('transactionHashInput').style.borderColor = ''; }, 2000); return; }
    }
    sendOrderToTelegram(selectedPayment, txHash);
};

function renderPaymentProducts() {
    const container = document.getElementById('paymentProductsList');
    if (!container) return;
    if (!cart || cart.length === 0) { container.innerHTML =
            '<div style="text-align:center;padding:8px;color:var(--text-secondary);opacity:0.4;">No products</div>'; return; }
    container.innerHTML = cart.map(item => {
        const qty = item.quantity || 1;
        const total = item.price * qty;
        const product = products.find(p => p.id === item.id);
        const image = product?.image || item.image || 'https://picsum.photos/seed/default/60/60';
        return `
      <div class="payment-product-item">
        <img src="${image}" alt="${item.name}" />
        <div class="pp-info"><div class="pp-name">${item.name}</div><div class="pp-price">${total.toFixed(2)} $</div></div>
        <div class="pp-qty">×${qty}</div>
      </div>
    `;
    }).join('');
}

window.openPaymentModal = function() {
    if (!currentUser) { showToast('⚠️ Please login first', 'warning');
        openAuthModal(); return; }
    if (cart.length === 0) { showToast('⚠️ Cart is empty', 'warning'); return; }
    document.getElementById('paymentModal').classList.add('open');
    document.getElementById('paymentStep1').style.display = 'block';
    document.getElementById('paymentStep2').classList.remove('active');
    selectedPayment = null;
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
    updatePayableTotal();
    fetchCryptoPrices();
};
window.closePaymentModal = function() { document.getElementById('paymentModal').classList.remove('open');
    document.getElementById('paymentStep1').style.display = 'block';
    document.getElementById('paymentStep2').classList.remove('active');
    selectedPayment = null;
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected')); };
window.checkout = function() { openPaymentModal(); };

// دوال الـ wishlist
window.toggleWishlist = async function(productId) {
    const index = wishlist.indexOf(productId);
    const product = products.find(p => p.id === productId);
    if (index === -1) { wishlist.push(productId);
        createFloatingHearts();
        showToast(`❤️ Added ${product ? product.name : ''} to favorites`, 'success'); } else { wishlist = wishlist.filter(id => id !== productId);
        showToast(`💔 Removed ${product ? product.name : ''} from favorites`, 'info'); }
    await saveUserData(true);
    updateWishlistUI();
    renderProducts(products);
    updateStatsFromProducts(products);
};

window.removeFromWishlist = function(id) { window.toggleWishlist(id); };

function updateWishlistUI() {
    const section = document.getElementById('wishlistSection');
    const grid = document.getElementById('wishlistGrid');
    const count = document.getElementById('wishlistCount');
    const stats = document.getElementById('wishlistStats');
    const sub = document.getElementById('wishlistSub');
    const wlCount = wishlist.length;
    if (count) count.textContent = wlCount;
    if (stats) stats.textContent = wlCount;
    if (sub) sub.textContent = wlCount + ' items';
    if (wlCount === 0) { if (section) section.style.display = 'none'; if (grid) grid.innerHTML =
            `<div class="wishlist-empty"><i class="fas fa-heart"></i><p>No favorites yet</p></div>`; return; }
    if (section) section.style.display = 'block';
    const wlProducts = products.filter(p => wishlist.includes(p.id));
    if (grid) {
        grid.innerHTML = wlProducts.map(p =>
            `<div class="wishlist-item" style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:var(--bg);border-radius:8px;border:1px solid var(--border);transition:0.3s;"><img src="${p.image || 'https://picsum.photos/seed/default/60/60'}" style="width:30px;height:30px;border-radius:6px;object-fit:cover;" /><div class="info" style="flex:1;min-width:0;"><h4 style="font-size:11px;font-weight:600;color:var(--text);font-family:var(--font);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</h4><div class="price" style="font-size:10px;color:var(--primary);font-weight:700;font-family:var(--font);">${p.price===0?'FREE':p.price+' $'}</div></div><button class="remove-btn" onclick="window.removeFromWishlist('${p.id}')" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:11px;opacity:0.3;transition:0.3s;"><i class="fas fa-times"></i></button></div>`
        ).join('');
    }
    updateFullUserMenu();
}

function renderWishlistFull() {
    const container = document.getElementById('wishlistFullContent');
    if (wishlist.length === 0) {
        container.innerHTML =
            `<div style="text-align:center;padding:40px 20px;color:var(--text-secondary);"><i class="fas fa-heart" style="font-size:48px;opacity:0.15;display:block;margin-bottom:12px;"></i><div style="font-size:18px;font-weight:600;font-family:var(--font);">No favorites yet</div><div style="font-size:13px;opacity:0.4;margin-top:4px;">Start adding products to your wishlist</div></div>`;
        return;
    }
    const wlProducts = products.filter(p => wishlist.includes(p.id));
    container.innerHTML =
        `<div style="display:grid;gap:8px;">${wlProducts.map(p=>`<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg);border-radius:10px;border:1px solid var(--border);cursor:pointer;" onclick="window.openDetails('${p.id}');closeWishlistFull();"><img src="${p.image||'https://picsum.photos/seed/default/60/60'}" style="width:44px;height:44px;border-radius:8px;object-fit:cover;" /><div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:600;color:var(--text);font-family:var(--font);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div><div style="font-size:12px;color:var(--primary);font-weight:700;font-family:var(--font);">${p.price===0?'FREE':'$'+p.price}</div></div><button onclick="event.stopPropagation();removeFromWishlist('${p.id}')" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:14px;opacity:0.3;padding:8px;transition:0.3s;"><i class="fas fa-times"></i></button></div>`).join('')}</div>`;
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

// دوال التنزيلات والإشعارات
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
    if (downloads.length === 0) { container.innerHTML =
            `<div style="text-align:center;padding:40px 20px;color:var(--text-secondary);"><i class="fas fa-file" style="font-size:48px;opacity:0.15;display:block;margin-bottom:12px;"></i><div style="font-size:18px;font-weight:600;font-family:var(--font);">No downloads</div><div style="font-size:13px;opacity:0.4;margin-top:4px;">Stay tuned for new content</div></div>`; return; }
    container.innerHTML = downloads.map(d => {
        const date = d.date || (d.createdAt ? new Date(d.createdAt.toDate()).toLocaleDateString('en-US', { month: 'short',
                day: 'numeric', year: 'numeric' }) : '');
        return `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:var(--bg);border-radius:10px;border:1px solid var(--border);margin-bottom:8px;">
        <div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:600;color:var(--text);font-family:var(--font);">${d.title}</div><div style="font-size:11px;color:var(--text-secondary);opacity:0.4;font-family:var(--font);">${d.type||'File'} • ${date}</div></div>
        <a href="${d.downloadUrl||'#'}" target="_blank" style="padding:6px 16px;border:none;border-radius:8px;background:var(--free-color);color:#0a0a1a;font-weight:600;cursor:pointer;font-size:12px;font-family:var(--font);text-decoration:none;transition:0.3s;"><i class="fas fa-download"></i></a>
      </div>
    `;
    }).join('');
}

function renderAdminDownloads() {
    const container = document.getElementById('adminDownloadsList');
    if (!container) return;
    if (downloads.length === 0) { container.innerHTML =
            `<div style="text-align:center;padding:30px;color:var(--text-secondary);">📭 No downloads</div>`; return; }
    container.innerHTML = downloads.map(d =>
        `<div class="admin-item"><div class="item-info"><div class="item-title">${d.title}</div><div class="item-meta">${d.type||'File'} • ${d.downloadUrl||'No link'}</div></div><div class="item-actions"><button class="btn-edit" onclick="editDownload('${d.id}')"><i class="fas fa-edit"></i></button><button class="btn-delete" onclick="deleteDownload('${d.id}')"><i class="fas fa-trash"></i></button></div></div>`
    ).join('');
}

window.openDownloads = function() { document.getElementById('downloadsModal').classList.add('open'); };
window.closeDownloads = function() { document.getElementById('downloadsModal').classList.remove('open'); };
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
        await addDoc(collection(db, 'downloads'), { title, type, description, downloadUrl, date: date || new Date()
                .toISOString().split('T')[0], createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        showToast('✅ Download added', 'success');
        closeCreateDownloadModal();
        document.getElementById('createDownloadForm').reset();
    } catch (error) { showToast('❌ Error: ' + error.message, 'error'); }
};
window.deleteDownload = async function(id) {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) { showToast('⛔ Unauthorized', 'error'); return; }
    if (!confirm('Delete this download?')) return;
    try { await deleteDoc(doc(db, 'downloads', id));
        showToast('🗑️ Download deleted', 'success'); } catch (error) { showToast('❌ Error: ' + error.message,
            'error'); }
};
window.editDownload = function(id) { showToast('✏️ Edit feature coming soon', 'info'); };
window.openCreateDownloadModal = function() {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) { showToast('⛔ Unauthorized', 'error'); return; }
    document.getElementById('createDownloadModal').classList.add('open');
    document.getElementById('createDownloadForm').reset();
};
window.closeCreateDownloadModal = function() { document.getElementById('createDownloadModal').classList.remove(
        'open'); };

// دوال الإشعارات - تعرض فقط للمستخدم الذي يملك الإشعار
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
            } else { 
                unreadNotifications = 0; 
            }
            updateNotificationBadge();
            renderAdminNotifications();
            renderUserNotifications();
        }).catch((error) => { console.error('Error loading notifications:', error);
            renderUserNotificationsFallback(); });
        
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
            } else { 
                unreadNotifications = 0; 
            }
            updateNotificationBadge();
            renderAdminNotifications();
            renderUserNotifications();
        }, (error) => { console.error('Notifications listener error:', error); });
    } catch (error) { console.error('Error setting up notifications:', error);
        renderUserNotificationsFallback(); }
}

function renderUserNotificationsFallback() {
    const container = document.getElementById('notificationsList');
    if (!container) return;
    container.innerHTML =
        `<div style="text-align:center;padding:40px 20px;color:var(--text-secondary);"><i class="fas fa-bell" style="font-size:48px;opacity:0.15;display:block;margin-bottom:12px;"></i><div style="font-size:18px;font-weight:600;font-family:var(--font);">No notifications</div><div style="font-size:13px;opacity:0.4;margin-top:4px;">Notifications will appear here</div></div>`;
}

function renderUserNotifications() {
    const container = document.getElementById('notificationsList');
    if (!container) return;
    if (!notifications || notifications.length === 0) { container.innerHTML =
            `<div style="text-align:center;padding:40px 20px;color:var(--text-secondary);"><i class="fas fa-bell" style="font-size:48px;opacity:0.15;display:block;margin-bottom:12px;"></i><div style="font-size:18px;font-weight:600;font-family:var(--font);">No notifications</div><div style="font-size:13px;opacity:0.4;margin-top:4px;">Notifications will appear here</div></div>`; return; }
    let html = '';
    notifications.forEach(n => {
        const isRead = currentUser && (n.readBy || []).includes(currentUser.uid);
        let dateStr = '';
        try { if (n.createdAt) { const date = n.createdAt.toDate ? n.createdAt.toDate() : new Date(n.createdAt);
                dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric',
                    year: 'numeric' }); } } catch (e) { dateStr = new Date().toLocaleDateString(
                'en-US'); }
        html +=
            `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:${!isRead?'var(--primary-glow)':'var(--bg)'};border-radius:10px;border:1px solid var(--border);margin-bottom:8px;${!isRead?'border-left:3px solid var(--primary);':''}"><div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:600;color:var(--text);font-family:var(--font);">${n.title||'Notification'}</div><div style="font-size:12px;color:var(--text-secondary);font-family:var(--font);">${n.message||''}</div><div style="font-size:11px;color:var(--text-secondary);opacity:0.3;font-family:var(--font);">${dateStr}</div></div>${!isRead?'<span style="background:var(--notification-red);color:#fff;font-size:9px;font-weight:700;padding:2px 10px;border-radius:12px;font-family:var(--font);">New</span>':''}</div>`;
    });
    container.innerHTML = html;
}

// عرض الإشعارات في لوحة المدير (جميع الإشعارات)
function renderAdminNotifications() {
    const container = document.getElementById('adminNotificationsList');
    if (!container) return;
    
    const notifRef = collection(db, 'notifications');
    getDocs(query(notifRef, orderBy('createdAt', 'desc'))).then((snapshot) => {
        let allNotifs = [];
        snapshot.forEach((doc) => { 
            allNotifs.push({ id: doc.id, ...doc.data() }); 
        });
        
        if (allNotifs.length === 0) { 
            container.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-secondary);">📭 No notifications</div>`; 
            return; 
        }
        
        container.innerHTML = allNotifs.map(n =>
            `<div class="admin-item">
                <div class="item-info">
                    <div class="item-title">${n.title||'Notification'}</div>
                    <div class="item-meta">${n.message||''} • ${n.userId ? 'User: ' + n.userId.slice(-6) : 'Global'} • ${n.createdAt?new Date(n.createdAt.toDate()).toLocaleDateString('en-US'):''}</div>
                </div>
                <div class="item-actions">
                    <button class="btn-delete" onclick="deleteNotification('${n.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`
        ).join('');
    }).catch((error) => { console.error('Error loading admin notifications:', error); });
}

function updateNotificationBadge() {
    const badge = document.getElementById('notifBadge');
    if (badge) {
        if (unreadNotifications > 0) { badge.style.display = 'inline-flex';
            badge.textContent = unreadNotifications; } else { badge.style.display = 'none'; }
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
        try { await updateDoc(doc(db, 'notifications', n.id), { readBy: arrayUnion(userId) });
            updatedCount++; } catch (e) { console.error('Error marking notification read:', e); }
    }
    if (updatedCount > 0) { unreadNotifications = 0;
        updateNotificationBadge();
        renderUserNotifications();
        showToast(`✅ ${updatedCount} notifications marked read`, 'success'); }
    isUpdatingNotifications = false;
};

// ✅ Clear Notifications - يحذف مباشرة بدون تأكيد
window.clearAllNotifications = async function() {
    if (!currentUser) { showToast('⚠️ Please login first', 'warning'); return; }
    try {
        const notifRef = collection(db, 'notifications');
        const snapshot = await getDocs(query(notifRef, where('userId', '==', currentUser.uid)));
        const batch = [];
        snapshot.forEach((doc) => {
            batch.push(deleteDoc(doc.ref));
        });
        await Promise.all(batch);
        notifications = [];
        unreadNotifications = 0;
        updateNotificationBadge();
        renderUserNotifications();
        renderAdminNotifications();
        showToast('🗑️ All notifications cleared', 'success');
    } catch (error) { console.error('Error clearing notifications:', error);
        showToast('❌ Error clearing notifications', 'error'); }
};

window.openNotifications = function() { document.getElementById('notificationsModal').classList.add('open'); };
window.closeNotifications = function() { document.getElementById('notificationsModal').classList.remove('open'); };
window.createNotification = async function(e) {
    e.preventDefault();
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) { showToast('⛔ Unauthorized', 'error'); return; }
    const title = document.getElementById('notifTitle').value.trim();
    const message = document.getElementById('notifMessage').value.trim();
    if (!title || !message) { showToast('⚠️ Please fill all fields', 'warning'); return; }
    try {
        await addDoc(collection(db, 'notifications'), { title, message, readBy: [], createdAt: serverTimestamp(),
            updatedAt: serverTimestamp() });
        showToast('✅ Notification sent', 'success');
        closeCreateNotificationModal();
        document.getElementById('createNotificationForm').reset();
    } catch (error) { showToast('❌ Error: ' + error.message, 'error'); }
};
window.deleteNotification = async function(id) {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) { showToast('⛔ Unauthorized', 'error'); return; }
    if (!confirm('Delete this notification?')) return;
    try { await deleteDoc(doc(db, 'notifications', id));
        showToast('🗑️ Notification deleted', 'success'); } catch (error) { showToast('❌ Error: ' + error.message,
            'error'); }
};
window.openCreateNotificationModal = function() {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) { showToast('⛔ Unauthorized', 'error'); return; }
    document.getElementById('createNotificationModal').classList.add('open');
    document.getElementById('createNotificationForm').reset();
};
window.closeCreateNotificationModal = function() { document.getElementById('createNotificationModal').classList.remove(
        'open'); };

// دوال الطلبات
window.openRequestsModal = function() {
    if (!currentUser) { showToast('⚠️ Please login first', 'warning');
        openAuthModal(); return; }
    const list = document.getElementById('requestsList');
    const requests = userProfile.requests || [];
    if (requests.length === 0) {
        list.innerHTML =
            `<div style="text-align:center;padding:40px 20px;color:var(--text-secondary);"><i class="fas fa-inbox" style="font-size:48px;opacity:0.15;display:block;margin-bottom:12px;"></i><div style="font-size:18px;font-weight:600;font-family:var(--font);">No requests</div><div style="font-size:13px;opacity:0.4;margin-top:4px;">Submit your first request now</div></div>`;
    } else {
        list.innerHTML = requests.slice().reverse().map(req =>
            `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:var(--bg);border-radius:10px;border:1px solid var(--border);margin-bottom:8px;"><div><div style="font-weight:600;color:var(--text);font-family:var(--font);">${req.gameName||'Untitled'}</div><div style="font-size:12px;color:var(--text-secondary);opacity:0.4;font-family:var(--font);">${new Date(req.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div></div><span style="font-size:11px;font-weight:600;padding:2px 12px;border-radius:12px;background:var(--pending-color);color:#0a0a1a;font-family:var(--font);">${(req.status||'pending').charAt(0).toUpperCase()+(req.status||'pending').slice(1)}</span></div>`
        ).join('');
    }
    document.getElementById('requestsModal').classList.add('open');
};
window.closeRequestsModal = function() { document.getElementById('requestsModal').classList.remove('open'); };
window.openNewRequestModal = function() {
    if (!currentUser) { showToast('⚠️ Please login first', 'warning');
        openAuthModal(); return; }
    document.getElementById('newRequestModal').classList.add('open');
    document.getElementById('requestForm').reset();
};
window.closeNewRequestModal = function() { document.getElementById('newRequestModal').classList.remove('open'); };
window.submitRequest = function(e) {
    e.preventDefault();
    if (!currentUser) { showToast('⚠️ Please login first', 'warning'); return; }
    const gameName = document.getElementById('reqGameName').value.trim();
    const playStore = document.getElementById('reqPlayStore').value.trim();
    const features = document.getElementById('reqFeatures').value.trim();
    const budget = document.getElementById('reqBudget').value.trim();
    if (!gameName || !playStore || !features || !budget) { showToast('⚠️ Please fill all fields', 'warning'); return; }
    const newRequest = { gameName, playStore, features, budget, status: 'pending', date: new Date().toISOString(),
        userId: currentUser.uid };
    const userRef = doc(db, 'users', currentUser.uid);
    updateDoc(userRef, { requests: arrayUnion(newRequest) }).then(() => {
        userProfile.requests.push(newRequest);
        document.getElementById('newRequestModal').classList.remove('open');
        showToast('✅ Request sent', 'success');
        const msg =
            `📝 New Script Request!\n\n👤 User: ${currentUser.displayName||currentUser.email}\n🎮 Game: ${gameName}\n🔗 Store Link: ${playStore}\n⚡ Features: ${features}\n💰 Budget: ${budget}`;
        window.open(`https://t.me/Mitalica69?text=${encodeURIComponent(msg)}`, '_blank');
    }).catch(error => { showToast('❌ Error: ' + error.message, 'error'); });
};

// دوال الإحالات
window.openReferralModal = function() {
    if (!currentUser) { showToast('⚠️ Please login first', 'warning');
        openAuthModal(); return; }
    updateReferralUI();
    document.getElementById('referralModal').classList.add('open');
};
window.closeReferralModal = function() { document.getElementById('referralModal').classList.remove('open'); };

function updateReferralUI() {
    const codeDisplay2 = document.getElementById('referralCodeDisplay2');
    if (currentUser && userProfile.referralCode) { codeDisplay2.textContent = userProfile.referralCode; } else if (
        currentUser) {
        const code = generateReferralCode(currentUser.displayName || currentUser.email, currentUser.email);
        userProfile.referralCode = code;
        const userRef = doc(db, 'users', currentUser.uid);
        updateDoc(userRef, { referralCode: code }).catch(console.error);
        codeDisplay2.textContent = code;
    } else { codeDisplay2.textContent = 'Login to get your code'; }
    const referrals = userProfile.referrals || [];
    document.getElementById('referralCount2').textContent = referrals.length;
    document.getElementById('referralRewards2').textContent = (userProfile.referralRewards || 0).toFixed(2) + ' $';
}

window.copyReferralCode2 = function() {
    const code = document.getElementById('referralCodeDisplay2').textContent;
    if (code && code !== 'Loading...' && code !== 'Login to get your code') {
        navigator.clipboard.writeText(code).then(() => { showToast('✅ Referral code copied!', 'success'); }).catch(
        () => { const textArea = document.createElement('textarea');
            textArea.value = code;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast('✅ Referral code copied!', 'success'); });
    } else { showToast('⚠️ Please login first', 'warning'); }
};

// دوال لوحة المدير
window.openAdminPanel = function() {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) { showToast('⛔ Unauthorized. Admin only.', 'error'); return; }
    const panel = document.getElementById('adminPanel');
    if (panel.classList.contains('open')) { panel.classList.remove('open'); } else { panel.classList.add('open');
        panel.scrollIntoView({ behavior: 'smooth' });
        loadAdminOrders();
        startAdminRealtimeListener();
        loadDownloads();
        loadNotifications();
        renderAdminProducts(products);
        loadAdminUsers(); }
};
window.closeAdminPanel = function() { document.getElementById('adminPanel').classList.remove('open'); if (
        unsubscribeAdmin) { unsubscribeAdmin();
        unsubscribeAdmin = null; } };
window.switchAdminTab = function(tab) {
    document.querySelectorAll('.admin-panel .tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.admin-panel .tabs button').forEach(el => el.classList.remove('active'));
    document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
    document.querySelector(`.admin-panel .tabs button[onclick="switchAdminTab('${tab}')"]`)?.classList.add('active');
    if (tab === 'products') { renderAdminProducts(products); }
    if (tab === 'users') { loadAdminUsers(); }
};

function renderAdminProducts(productsList) {
    const container = document.getElementById('adminProductsList');
    if (!container) return;
    if (!productsList || productsList.length === 0) { container.innerHTML =
            `<div style="text-align:center;padding:30px;color:var(--text-secondary);">📭 No products</div>`; return; }
    container.innerHTML = productsList.map(p => {
        const isVip = p.badge === 'VIP' || p.price > 0;
        const isUnavailable = p.status === 'unavailable';
        return `
      <div class="admin-item" style="${isUnavailable?'opacity:0.5;':''}">
        <div class="item-info"><div class="item-title">${p.name} ${isUnavailable?'⛔':''}</div><div class="item-meta">${p.price===0?'🎁 FREE':`💰 $${p.price}`} • ${p.badge||'FREE'} ${isUnavailable?'• Unavailable':''}</div></div>
        <div class="item-actions"><button class="btn-edit" onclick="openEditProductModal('${p.id}')"><i class="fas fa-edit"></i></button><button class="btn-delete" onclick="deleteProduct('${p.id}')"><i class="fas fa-trash"></i></button></div>
      </div>
    `;
    }).join('');
}

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
    document.getElementById('productModal').classList.add('open');
};
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
    const image = document.getElementById('productImage').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    const featuresText = document.getElementById('productFeatures').value.trim();
    const video = document.getElementById('productVideo').value.trim();
    if (!name) { showToast('⚠️ Product name is required', 'warning'); return; }
    const features = featuresText ? featuresText.split(',').map(f => f.trim()).filter(f => f) : [];
    const productData = { name, price, badge, status, image, description, features, video };
    try {
        if (productId) { await updateProductInFirestore(productId, productData);
            showToast('✅ Product updated', 'success'); } else { await addProductToFirestore(productData);
            showToast('✅ Product added', 'success'); }
        closeProductModal();
    } catch (error) { console.error('Save product error:', error);
        showToast('❌ Error: ' + error.message, 'error'); }
};
window.deleteProduct = async function(productId) {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) { showToast('⛔ Unauthorized', 'error'); return; }
    if (!confirm('Delete this product?')) return;
    try { await deleteProductFromFirestore(productId);
        showToast('🗑️ Product deleted', 'success'); } catch (error) { console.error('Delete product error:', error);
        showToast('❌ Error: ' + error.message, 'error'); }
};

async function addProductToFirestore(productData) {
    try { const productsRef = collection(db, 'products'); const docRef = await addDoc(productsRef, { ...productData,
            createdAt: serverTimestamp(), updatedAt: serverTimestamp() }); return docRef.id; } catch (error) { console
            .error('Error adding product:', error); throw error; }
}
async function updateProductInFirestore(productId, productData) {
    try { const productRef = doc(db, 'products', productId); await updateDoc(productRef, { ...productData,
            updatedAt: serverTimestamp() }); return true; } catch (error) { console.error('Error updating product:',
            error); throw error; }
}
async function deleteProductFromFirestore(productId) {
    try { await deleteDoc(doc(db, 'products', productId)); return true; } catch (error) { console.error(
            'Error deleting product:', error); throw error; }
}

// دوال إدارة الطلبات
function startAdminRealtimeListener() {
    if (unsubscribeAdmin) { unsubscribeAdmin(); }
    const usersRef = collection(db, 'users');
    unsubscribeAdmin = onSnapshot(usersRef, (snapshot) => {
        let orders = [];
        let pending = 0,
            preparing = 0,
            shipped = 0,
            delivered = 0,
            rejected = 0;
        snapshot.forEach((userDoc) => {
            const data = userDoc.data();
            const email = data.email || userDoc.id;
            const name = data.name || 'Unknown';
            const history = data.history || [];
            history.forEach(order => {
                const status = order.status || 'pending';
                if (status === 'pending') pending++;
                else if (status === 'preparing') preparing++;
                else if (status === 'shipped') shipped++;
                else if (status === 'delivered' || status === 'completed') delivered++;
                else if (status === 'rejected') rejected++;
                const orderId = order.id || 'order_' + Date.now();
                orders.push({ ...order, userId: userDoc.id, userEmail: email, userName: name,
                    orderId: orderId, _checked: selectedOrders.has(orderId) });
            });
        });
        orders.sort((a, b) => new Date(b.date) - new Date(a.date));
        allOrders = orders;
        pendingCount = pending + preparing + shipped;
        renderAdminOrders(orders);
        updateAdminStats(orders);
        updateUI();
        const badge = document.getElementById('adminPanelBadge');
        if (badge) { if (pendingCount > 0) { badge.style.display = 'inline-block';
                badge.textContent = pendingCount; } else { badge.style.display = 'none'; } }
        updateFullUserMenu();
    }, (error) => { console.error('Admin listener error:', error); });
}

function loadAdminOrders() {
    const tbody = document.getElementById('adminOrdersBody');
    tbody.innerHTML =
        '<tr><td colspan="7"><div style="text-align:center;padding:30px;color:var(--text-secondary);"><i class="fas fa-spinner fa-spin"></i> Loading...</div></td></tr>';
    const usersRef = collection(db, 'users');
    getDocs(usersRef).then((snapshot) => {
        let orders = [];
        let pending = 0,
            preparing = 0,
            shipped = 0,
            delivered = 0,
            rejected = 0;
        snapshot.forEach((userDoc) => {
            const data = userDoc.data();
            const email = data.email || userDoc.id;
            const name = data.name || 'Unknown';
            const history = data.history || [];
            history.forEach(order => {
                const status = order.status || 'pending';
                if (status === 'pending') pending++;
                else if (status === 'preparing') preparing++;
                else if (status === 'shipped') shipped++;
                else if (status === 'delivered' || status === 'completed') delivered++;
                else if (status === 'rejected') rejected++;
                const orderId = order.id || 'order_' + Date.now();
                orders.push({ ...order, userId: userDoc.id, userEmail: email, userName: name,
                    orderId: orderId, _checked: selectedOrders.has(orderId) });
            });
        });
        orders.sort((a, b) => new Date(b.date) - new Date(a.date));
        allOrders = orders;
        pendingCount = pending + preparing + shipped;
        renderAdminOrders(orders);
        updateAdminStats(orders);
        updateUI();
        const badge = document.getElementById('adminPanelBadge');
        if (badge) { if (pendingCount > 0) { badge.style.display = 'inline-block';
                badge.textContent = pendingCount; } else { badge.style.display = 'none'; } }
        updateFullUserMenu();
    }).catch(error => { tbody.innerHTML =
            `<tr><td colspan="7"><div style="text-align:center;padding:30px;color:var(--danger);">${error.message}</div></td></tr>`; });
}

function renderAdminOrders(orders) {
    const tbody = document.getElementById('adminOrdersBody');
    if (!orders || orders.length === 0) { tbody.innerHTML =
            `<tr><td colspan="7"><div style="text-align:center;padding:30px;color:var(--text-secondary);"><i class="fas fa-inbox"></i> No orders</div></td></tr>`; return; }
    let html = '';
    orders.forEach(order => {
        const status = order.status || 'pending';
        const statusMap = { 'pending': { label: '⏳ Pending', class: 'pending' }, 'preparing': { label: '📦 Preparing',
                class: 'preparing' }, 'shipped': { label: '🚚 Shipped', class: 'shipped' },
            'delivered': { label: '✅ Delivered', class: 'delivered' }, 'completed': { label: '✅ Completed',
                class: 'completed' }, 'rejected': { label: '❌ Rejected', class: 'rejected' } };
        const info = statusMap[status] || statusMap['pending'];
        const date = order.date ? new Date(order.date) : new Date();
        const dateStr = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
        const itemsList = order.items ? order.items.map(item =>
            `<span style="display:inline-block;background:var(--bg);padding:2px 8px;border-radius:10px;font-size:11px;border:1px solid var(--border);margin:1px;">${item.name} ×${item.quantity||1}</span>`
        ).join('') : '—';
        const total = order.total || 0;
        const orderIdStr = String(order.orderId || order.id || '');
        const orderId = orderIdStr.slice(-6) || '------';
        html += `
      <tr>
        <td><span class="order-id">#${orderId}</span></td>
        <td><div style="font-weight:600;font-size:12px;">${order.userName||'Unknown'}</div><div class="user-email">${order.userEmail||'N/A'}</div></td>
        <td><div style="display:flex;flex-wrap:wrap;gap:2px;">${itemsList}</div></td>
        <td><span class="order-total">${total.toFixed(2)} $</span></td>
        <td><span class="order-date">${dateStr}</span></td>
        <td><span class="status-badge ${info.class}">${info.label}</span></td>
        <td>
          <div style="display:flex;gap:4px;flex-wrap:wrap;">
            <select onchange="updateOrderStatus('${order.orderId||order.id}','${order.userId}',this.value)" style="padding:2px 6px;border:1px solid var(--border);border-radius:4px;background:var(--bg);color:var(--text);font-size:10px;font-family:var(--font);">
              <option value="pending" ${status==='pending'?'selected':''}>⏳ Pending</option>
              <option value="preparing" ${status==='preparing'?'selected':''}>📦 Preparing</option>
              <option value="shipped" ${status==='shipped'?'selected':''}>🚚 Shipped</option>
              <option value="delivered" ${status==='delivered'?'selected':''}>✅ Delivered</option>
              <option value="completed" ${status==='completed'?'selected':''}>✅ Completed</option>
              <option value="rejected" ${status==='rejected'?'selected':''}>❌ Rejected</option>
            </select>
            <button onclick="deleteOrderImmediately('${order.orderId||order.id}','${order.userId}')" class="btn-delete-order"><i class="fas fa-trash"></i> Delete</button>
          </div>
        </td>
      </tr>
    `;
    });
    tbody.innerHTML = html;
}

function updateAdminStats(orders) {
    const total = orders.length;
    const pending = orders.filter(o => (o.status || 'pending') === 'pending').length;
    const preparing = orders.filter(o => o.status === 'preparing').length;
    const shipped = orders.filter(o => o.status === 'shipped').length;
    const delivered = orders.filter(o => o.status === 'delivered' || o.status === 'completed').length;
    const rejected = orders.filter(o => o.status === 'rejected').length;
    document.getElementById('adminTotalOrders').textContent = total;
    document.getElementById('adminPendingOrders').textContent = pending;
    document.getElementById('adminPreparingOrders').textContent = preparing;
    document.getElementById('adminShippedOrders').textContent = shipped;
    document.getElementById('adminDeliveredOrders').textContent = delivered;
    document.getElementById('adminRejectedOrders').textContent = rejected;
}

// ✅ تحديث حالة الطلب مع إرسال إشعار للمستخدم فقط
window.updateOrderStatus = async function(orderId, userId, newStatus) {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) { showToast('⛔ Unauthorized', 'error'); return; }
    if (!orderId || !userId) { showToast('❌ Invalid data', 'error'); return; }
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) { showToast('❌ User not found', 'error'); return; }
        const data = userSnap.data();
        const history = data.history || [];
        let updatedOrder = null;
        const updatedHistory = history.map(order => {
            if (order.id === orderId) { updatedOrder = { ...order, status: newStatus, updatedAt: new Date()
                        .toISOString() }; return updatedOrder; }
            return order;
        });
        await updateDoc(userRef, { history: updatedHistory });

        const statusLabels = { 'pending': '⏳ Pending', 'preparing': '📦 Preparing', 'shipped': '🚚 Shipped',
            'delivered': '✅ Delivered', 'completed': '✅ Completed', 'rejected': '❌ Rejected' };
        const statusLabel = statusLabels[newStatus] || newStatus;
        showToast(`📦 Order updated to ${statusLabel}`, 'success');

        if (updatedOrder) {
            const itemsNames = updatedOrder.items ? updatedOrder.items.map(i => i.name).join(', ') : 'Your order';
            const userMsg =
                `📦 *Order Update #${String(orderId).slice(-6)}*\n\n📋 Products: ${itemsNames}\n🔄 Status: ${statusLabel}\n📅 Date: ${new Date().toLocaleString()}`;

            if (data.telegramChatId) {
                await sendTelegramNotification(data.telegramChatId, userMsg);
            }

            const adminMsg =
                `🔄 Order #${String(orderId).slice(-6)} updated\nUser: ${data.email || 'Unknown'}\nNew Status: ${statusLabel}`;
            await sendTelegramNotification(TELEGRAM_CHAT_ID, adminMsg);

            try {
                await addDoc(collection(db, 'notifications'), {
                    title: `📦 Order #${String(orderId).slice(-6)}`,
                    message: `Status updated to: ${statusLabel}`,
                    userId: userId,
                    readBy: [],
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            } catch (e) { console.error('Error saving notification:', e); }
        }

        loadAdminOrders();
        if (currentUser && currentUser.uid === userId) { userProfile.history = updatedHistory; }
        updateFullUserMenu();
    } catch (error) { console.error('Error updating order:', error);
        showToast('❌ Error: ' + error.message, 'error'); }
};

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
    } catch (error) { console.error('Error deleting order:', error);
        showToast('❌ Error: ' + error.message, 'error'); }
};

window.searchAdminOrders = function() {
    const query = document.getElementById('adminSearchInput').value.trim().toLowerCase();
    if (!query) { renderAdminOrders(allOrders);
        showToast('📋 Showing all orders', 'info'); return; }
    const filtered = allOrders.filter(order => {
        const email = (order.userEmail || '').toLowerCase();
        const orderId = String(order.orderId || order.id || '').toLowerCase();
        const userName = (order.userName || '').toLowerCase();
        return email.includes(query) || orderId.includes(query) || userName.includes(query);
    });
    renderAdminOrders(filtered);
    if (filtered.length === 0) { showToast(`🔍 No matching orders`, 'warning'); } else { showToast(
            `🔍 Found ${filtered.length} orders`, 'success'); }
};
window.clearAdminSearch = function() { document.getElementById('adminSearchInput').value = '';
    renderAdminOrders(allOrders);
    showToast('📋 Search cleared', 'info'); };
window.refreshAdminOrders = function() { loadAdminOrders();
    showToast('🔄 Refreshed', 'info'); };

// دوال إدارة المستخدمين
async function loadAdminUsers() {
    const container = document.getElementById('adminUsersContainer');
    if (!container) return;
    container.innerHTML =
        `<div style="text-align:center;padding:30px;color:var(--text-secondary);"><i class="fas fa-spinner fa-spin"></i> Loading...</div>`;
    try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        const usersList = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            usersList.push({ uid: doc.id, ...data, email: data.email || doc.id, name: data.name ||
                    'Unknown', createdAt: data.createdAt ? new Date(data.createdAt.toDate()) :
                    new Date(), isBanned: data.isBanned || false, history: data.history || [],
                rp: data.rp || 0, referralCode: data.referralCode || '' });
        });
        allUsers = usersList;
        renderAdminUsers(usersList);
    } catch (error) { console.error('Error loading users:', error);
        container.innerHTML =
            `<div style="text-align:center;padding:30px;color:var(--danger);">Error loading users</div>`; }
}

function renderAdminUsers(usersList) {
    const container = document.getElementById('adminUsersContainer');
    if (!container) return;
    if (!usersList || usersList.length === 0) { container.innerHTML =
            `<div style="text-align:center;padding:30px;color:var(--text-secondary);">👥 No users</div>`; return; }
    const searchQuery = document.getElementById('adminUserSearchInput')?.value.trim().toLowerCase() || '';
    let filtered = usersList;
    if (searchQuery) { filtered = filtered.filter(u => u.email?.toLowerCase().includes(searchQuery) || u.name
            ?.toLowerCase().includes(searchQuery)); }
    if (filtered.length === 0) { container.innerHTML =
            `<div style="text-align:center;padding:30px;color:var(--text-secondary);">🔍 No results</div>`; return; }
    container.innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:4px;">
      <span style="font-size:12px;color:var(--text-secondary);font-family:var(--font);opacity:0.4;">${filtered.length} users</span>
    </div>
    <div class="admin-users-grid">
      ${filtered.map(user=>{
        const isAdmin = user.email === ADMIN_EMAIL;
        const isBanned = user.isBanned || false;
        const orderCount = user.history?.length || 0;
        const rp = user.rp || 0;
        const initials = (user.name || 'U').charAt(0).toUpperCase();
        const dateStr = user.createdAt ? user.createdAt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '--';
        return `
          <div class="admin-user-card ${isBanned?'banned':''}">
            <div class="user-avatar">${initials}</div>
            <div class="user-name">${user.name||'Unknown'}</div>
            <div class="user-email">${user.email||'No email'}</div>
            <div class="user-meta">📅 ${dateStr} • 🎯 ${rp} RP</div>
            <div class="user-meta">📦 ${orderCount} orders</div>
            ${isBanned?`<span class="user-badge banned">🚫 Banned</span>`:''}
            ${isAdmin?`<span class="user-badge admin">👑 Admin</span>`:''}
            <div class="user-actions">
              <button class="btn-view" onclick="viewUserDetails('${user.uid}')"><i class="fas fa-eye"></i> View</button>
              ${!isAdmin ? (isBanned ? `<button class="btn-unban" onclick="toggleUserBan('${user.uid}',false)"><i class="fas fa-user-check"></i> Unban</button>` : `<button class="btn-ban" onclick="toggleUserBan('${user.uid}',true)"><i class="fas fa-ban"></i> Ban</button>`) : ''}
              ${!isAdmin ? `<button class="btn-delete" onclick="deleteUserAccount('${user.uid}')"><i class="fas fa-trash"></i></button>` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

window.searchAdminUsers = function() { renderAdminUsers(allUsers); };
window.clearAdminUserSearch = function() { document.getElementById('adminUserSearchInput').value = '';
    renderAdminUsers(allUsers); };
window.refreshAdminUsers = function() { loadAdminUsers();
    showToast('🔄 Users refreshed', 'info'); };
window.toggleUserBan = async function(uid, ban) {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) { showToast('⛔ Unauthorized', 'error'); return; }
    if (uid === currentUser.uid) { showToast('⚠️ You cannot ban yourself', 'warning'); return; }
    try { await updateDoc(doc(db, 'users', uid), { isBanned: ban });
        showToast(`✅ User ${ban?'banned':'unbanned'}`, 'success');
        loadAdminUsers(); } catch (error) { console.error('Error toggling user ban:', error);
        showToast('❌ Error: ' + error.message, 'error'); }
};
window.deleteUserAccount = async function(uid) {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) { showToast('⛔ Unauthorized', 'error'); return; }
    if (uid === currentUser.uid) { showToast('⚠️ You cannot delete your own account', 'warning'); return; }
    if (!confirm('⚠️ Delete this user account permanently?')) return;
    try { await deleteDoc(doc(db, 'users', uid));
        showToast('🗑️ User account deleted', 'success');
        loadAdminUsers();
        loadAdminOrders(); } catch (error) { console.error('Error deleting user:', error);
        showToast('❌ Error: ' + error.message, 'error'); }
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
        const ordersHtml = orders.length > 0 ? orders.slice(-5).reverse().map(o =>
            `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border);font-size:12px;font-family:var(--font);"><span>${o.items?o.items.map(i=>i.name).join(', '):'Order'}</span><span style="color:var(--primary);">${(o.total||0).toFixed(2)} $</span><span class="status-badge ${o.status||'pending'}" style="font-size:9px;padding:1px 8px;">${o.status||'pending'}</span></div>`
        ).join('') :
            '<div style="text-align:center;color:var(--text-secondary);opacity:0.4;padding:10px;">No orders</div>';
        const content = document.getElementById('userDetailsContent');
        content.innerHTML = `
      <div style="padding:4px 0;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
          <div style="width:44px;height:44px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#fff;">${(data.name||'U').charAt(0).toUpperCase()}</div>
          <div><div style="font-size:15px;font-weight:700;color:var(--text);font-family:var(--font);">${data.name||'Unknown'}</div><div style="font-size:12px;color:var(--text-secondary);font-family:var(--font);">${data.email||'No email'}</div><div style="font-size:12px;color:var(--vip-color);font-weight:600;font-family:var(--font);">🎯 RP: ${data.rp||0} • 📦 ${orders.length} orders</div></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:10px;">
          <div style="background:var(--bg);border-radius:6px;padding:6px;text-align:center;border:1px solid var(--border);"><div style="font-size:14px;font-weight:700;color:var(--text);font-family:var(--font);">${orders.length}</div><div style="font-size:9px;color:var(--text-secondary);font-family:var(--font);">Orders</div></div>
          <div style="background:var(--bg);border-radius:6px;padding:6px;text-align:center;border:1px solid var(--border);"><div style="font-size:14px;font-weight:700;color:var(--primary);font-family:var(--font);">${totalSpent.toFixed(2)} $</div><div style="font-size:9px;color:var(--text-secondary);font-family:var(--font);">Spent</div></div>
          <div style="background:var(--bg);border-radius:6px;padding:6px;text-align:center;border:1px solid var(--border);"><div style="font-size:14px;font-weight:700;color:var(--vip-color);font-family:var(--font);">${data.rp||0}</div><div style="font-size:9px;color:var(--text-secondary);font-family:var(--font);">RP</div></div>
        </div>
        <div style="font-size:12px;font-weight:600;color:var(--text-secondary);font-family:var(--font);margin-bottom:4px;">Recent Orders</div>
        ${ordersHtml}
        <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;">
          <button onclick="closeUserDetailsModal();" style="padding:4px 14px;border:1px solid var(--border);border-radius:6px;background:var(--card-bg);color:var(--text);cursor:pointer;font-family:var(--font);font-size:12px;">Close</button>
          ${data.isBanned?`<button onclick="closeUserDetailsModal();toggleUserBan('${uid}',false);" style="padding:4px 14px;border:none;border-radius:6px;background:var(--success);color:#0a0a1a;cursor:pointer;font-family:var(--font);font-weight:600;font-size:12px;"><i class="fas fa-user-check"></i> Unban</button>`:`<button onclick="closeUserDetailsModal();toggleUserBan('${uid}',true);" style="padding:4px 14px;border:none;border-radius:6px;background:var(--danger);color:#fff;cursor:pointer;font-family:var(--font);font-weight:600;font-size:12px;"><i class="fas fa-ban"></i> Ban</button>`}
          ${uid!==currentUser.uid?`<button onclick="closeUserDetailsModal();deleteUserAccount('${uid}');" style="padding:4px 14px;border:none;border-radius:6px;background:var(--danger);color:#fff;cursor:pointer;font-family:var(--font);font-weight:600;font-size:12px;"><i class="fas fa-trash"></i> Delete</button>`:''}
        </div>
      </div>
    `;
        document.getElementById('userDetailsModal').classList.add('open');
    } catch (error) { console.error('Error viewing user details:', error);
        showToast('❌ Error loading user details', 'error'); }
};
window.closeUserDetailsModal = function() { document.getElementById('userDetailsModal').classList.remove('open'); };

// دوال السجل
function renderHistoryFull() {
    const container = document.getElementById('historyFullContent');
    const history = userProfile.history || [];
    if (history.length === 0) {
        container.innerHTML =
            `<div style="text-align:center;padding:40px 20px;color:var(--text-secondary);"><i class="fas fa-shopping-bag" style="font-size:48px;opacity:0.15;display:block;margin-bottom:12px;"></i><div style="font-size:18px;font-weight:600;font-family:var(--font);">No orders yet</div><div style="font-size:13px;opacity:0.4;margin-top:4px;">Start shopping to see your orders here</div></div>`;
        return;
    }
    let html = `<div style="display:grid;gap:8px;">`;
    history.slice().reverse().forEach(item => {
        const status = item.status || 'pending';
        const statusMap = { 'pending': { label: '⏳ Pending', class: 'pending' }, 'preparing': { label: '📦 Preparing',
                class: 'preparing' }, 'shipped': { label: '🚚 Shipped', class: 'shipped' },
            'delivered': { label: '✅ Delivered', class: 'delivered' }, 'completed': { label: '✅ Completed',
                class: 'completed' }, 'rejected': { label: '❌ Rejected', class: 'rejected' } };
        const info = statusMap[status] || statusMap['pending'];
        const date = item.date ? new Date(item.date) : new Date();
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const itemsNames = item.items ? item.items.map(i => i.name).join(', ') : 'Order';
        const total = item.total || 0;
        html +=
            `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:var(--bg);border-radius:10px;border:1px solid var(--border);"><div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:600;color:var(--text);font-family:var(--font);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${itemsNames}</div><div style="font-size:11px;color:var(--text-secondary);opacity:0.4;font-family:var(--font);">${dateStr}</div><span class="status-badge ${info.class}" style="font-size:10px;padding:2px 10px;">${info.label}</span></div><span style="font-size:16px;font-weight:700;color:var(--primary);font-family:var(--font);">${total>0?'$'+total.toFixed(2):'FREE'}</span></div>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}

// ========================================
// دوال الوضع والتهيئة
// ========================================
let isDark = true;
document.getElementById('themeToggle')?.addEventListener('click', function() {
    isDark = !isDark;
    if (isDark) { document.body.classList.remove('light');
        this.innerHTML = '<i class="fas fa-moon"></i>'; } else { document.body.classList.add('light');
        this.innerHTML = '<i class="fas fa-sun"></i>'; }
});

// ✅ onAuthStateChanged - مع التحقق من Ban
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
        // ⭐ التحقق من حالة Ban
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
        } catch (error) {
            console.error('Error checking ban status:', error);
        }
        
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        await loadUserData();
        updateDropdownStats();
        if (user.email === ADMIN_EMAIL) { loadAdminOrders();
            startAdminRealtimeListener();
            renderAdminProducts(products);
            loadAdminUsers(); }
        loadDownloads();
        loadNotifications();
        fetchCryptoPrices();
    } else {
        document.getElementById('authSection').style.display = 'block';
        document.getElementById('mainApp').style.display = 'none';
        await loadUserData();
        updateDropdownStats();
        loadDownloads();
        loadNotifications();
        fetchCryptoPrices();
    }
    updateUI();
    updateFullUserMenu();
});

// ========================================
// init() - هنا فقط تدار شاشة التحميل
// ========================================
async function init() {
    showLoadingScreen();
    updateLoadingBar(10);
    
    try { 
        await signInAnonymously(auth); 
        updateLoadingBar(30);
    } catch (e) { 
        console.log('ℹ️ Anonymous sign-in'); 
    }
    
    const productsFromFirestore = await loadProductsFromFirestore();
    products = productsFromFirestore.length > 0 ? productsFromFirestore : fallbackProducts;
    updateLoadingBar(50);
    
    startProductsRealtimeListener();
    updateLoadingBar(70);
    
    await loadUserData();
    updateLoadingBar(85);
    
    renderProducts(products);
    generateRecommendations(products);
    updateBottomCartBar();
    updateDropdownStats();
    loadDownloads();
    loadNotifications();
    fetchCryptoPrices();
    setInterval(fetchCryptoPrices, 60000);
    updateLoadingBar(100);
    
    console.log('✅ ZI Store ready with single Telegram bot!');
    
    setTimeout(() => {
        hideLoadingScreen();
    }, 500);
}
init();

setTimeout(() => {
    hideLoadingScreen();
    console.log('⚠️ Force hiding loading screen (timeout)');
}, 5000);

// تصدير الدوال للاستخدام العام
window.showToast = showToast;
window.openAdminPanel = openAdminPanel;
window.closeAdminPanel = closeAdminPanel;
window.searchAdminOrders = searchAdminOrders;
window.clearAdminSearch = clearAdminSearch;
window.refreshAdminOrders = refreshAdminOrders;
window.updateOrderStatus = updateOrderStatus;
window.deleteOrderImmediately = deleteOrderImmediately;
window.openDownloads = openDownloads;
window.closeDownloads = closeDownloads;
window.openNotifications = openNotifications;
window.closeNotifications = closeNotifications;
window.createDownload = createDownload;
window.deleteDownload = deleteDownload;
window.editDownload = editDownload;
window.createNotification = createNotification;
window.deleteNotification = deleteNotification;
window.openCreateDownloadModal = openCreateDownloadModal;
window.closeCreateDownloadModal = closeCreateDownloadModal;
window.openCreateNotificationModal = openCreateNotificationModal;
window.closeCreateNotificationModal = closeCreateNotificationModal;
window.switchAdminTab = switchAdminTab;
window.openAddProductModal = openAddProductModal;
window.openEditProductModal = openEditProductModal;
window.closeProductModal = closeProductModal;
window.saveProduct = saveProduct;
window.deleteProduct = deleteProduct;
window.clearSearch = clearSearch;
window.closeSearchResults = closeSearchResults;
window.performLiveSearch = performLiveSearch;
window.openUserMenuFull = openUserMenuFull;
window.closeUserMenuFull = closeUserMenuFull;
window.openCartFull = openCartFull;
window.closeCartFull = closeCartFull;
window.openWishlistFull = openWishlistFull;
window.closeWishlistFull = closeWishlistFull;
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
window.markAllNotificationsRead = markAllNotificationsRead;
window.clearAllNotifications = clearAllNotifications;
window.loadAdminUsers = loadAdminUsers;
window.searchAdminUsers = searchAdminUsers;
window.clearAdminUserSearch = clearAdminUserSearch;
window.refreshAdminUsers = refreshAdminUsers;
window.toggleUserBan = toggleUserBan;
window.deleteUserAccount = deleteUserAccount;
window.viewUserDetails = viewUserDetails;
window.closeUserDetailsModal = closeUserDetailsModal;
window.filterProducts = filterProducts;
window.openReferralModal = openReferralModal;
window.closeReferralModal = closeReferralModal;
window.copyReferralCode2 = copyReferralCode2;
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
window.saveProfileChangesInline = saveProfileChangesInline;
window.sendResetLinkInline = sendResetLinkInline;
window.changePasswordInline = changePasswordInline;
window.toggleRpInCart = toggleRpInCart;
window.applyCartPromo = applyCartPromo;

// ========================================
// END OF SCRIPT.JS
// ========================================
