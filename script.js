// ============================================================
// SCRIPT.JS - ZI Store - COMPLETE WORKING VERSION v5.0
// ============================================================
// ALL FEATURES + ALL FIXES - NO SHORTCUTS
// ============================================================

// ============================================================
// FIX: Define process for browser environment (Firebase Analytics)
// ============================================================
window.process = window.process || { env: { NODE_ENV: 'production' } };

// ============================================================
// LOADING SCREEN WITH PROGRESS
// ============================================================
(function() {
    let loadingProgress = 0;
    let loadingInterval = null;

    function updateLoadingProgress(progress, text = null) {
        loadingProgress = Math.min(progress, 100);
        const bar = document.getElementById('progressBar');
        const textEl = document.getElementById('progressText');
        const statusEl = document.getElementById('loadingStatus');
        if (bar) bar.style.width = loadingProgress + '%';
        if (textEl) textEl.textContent = loadingProgress + '%';
        if (text && statusEl) statusEl.textContent = text;
        if (loadingProgress >= 100) {
            if (loadingInterval) {
                clearInterval(loadingInterval);
                loadingInterval = null;
            }
            setTimeout(function() {
                const screen = document.getElementById('loadingScreen');
                if (screen) {
                    screen.classList.add('hidden');
                    setTimeout(function() {
                        screen.classList.add('hidden-force');
                    }, 600);
                }
            }, 500);
        }
    }

    function startLoadingSimulation() {
        loadingProgress = 0;
        updateLoadingProgress(0, 'Starting...');
        if (loadingInterval) clearInterval(loadingInterval);
        loadingInterval = setInterval(function() {
            var increment = Math.random() * 5 + 2;
            var newProgress = loadingProgress + increment;
            if (newProgress >= 90) {
                newProgress = 90 + (Math.random() * 8);
            }
            if (newProgress > 100) newProgress = 100;
            updateLoadingProgress(newProgress);
        }, 200);
    }

    window.updateLoadingProgress = updateLoadingProgress;
    window.startLoadingSimulation = startLoadingSimulation;

    function hideLoadingScreenImmediate() {
        var screen = document.getElementById('loadingScreen');
        if (screen) {
            screen.classList.add('hidden');
            setTimeout(function() {
                screen.style.display = 'none';
            }, 600);
            console.log('✅ Loading screen hidden immediately');
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            startLoadingSimulation();
        });
    } else {
        startLoadingSimulation();
    }
    setTimeout(hideLoadingScreenImmediate, 300);
})();

// ============================================================
// FIREBASE & SUPABASE IMPORTS
// ============================================================
import { initializeApp } from "firebase/app";
import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
    updatePassword,
    sendPasswordResetEmail,
    reauthenticateWithCredential,
    EmailAuthProvider,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    serverTimestamp,
    collection,
    query,
    where,
    getDocs,
    onSnapshot,
    addDoc,
    deleteDoc,
    orderBy,
    limit
} from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ============================================================
// CONFIGURATION
// ============================================================
const SUPABASE_URL = 'https://kvsyzgavfxnwqmtsginv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_1uSIqgNONAV53GjOoBoZUw_niAGJXO6';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const firebaseConfig = {
    apiKey: "AIzaSyBwDTCxzd6aoue-NTLI2u4ouK-M37alwUw",
    authDomain: "auth.zi-store.online",
    projectId: "zi-script-store",
    storageBucket: "zi-script-store.firebasestorage.app",
    messagingSenderId: "925432917209",
    appId: "1:925432917209:web:ee9b329911d95d831622c8",
    measurementId: "G-J8YFD51CMR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let analytics = null;
isSupported().then(supported => {
    if (supported) {
        try {
            analytics = getAnalytics(app);
            console.log('✅ Firebase Analytics initialized');
        } catch (e) {
            console.log('ℹ️ Analytics not available, continuing...');
        }
    } else {
        console.log('ℹ️ Analytics not supported in this environment');
    }
}).catch(() => {
    console.log('ℹ️ Analytics skipped');
});

// ============================================================
// GLOBAL VARIABLES & CONSTANTS
// ============================================================
const BOT_USERNAME = 'Zistore_Notif_bot';
const RP_TO_DOLLAR = 0.1;
const CLOUDINARY_CLOUD_NAME = 'y14bgb5s';
const CLOUDINARY_UPLOAD_PRESET = 'zi_store_uploads';
const DISABLE_PROXY = true;
const ADMIN_EMAIL = 'idriss.zribi13@gmail.com';

const proxyPackages = [
    { id: 'proxy_2', name: '5 Proxies - 30 Days', price: 20, duration: 30, quantity: 5, plan: 'residential' }
];

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
let isAdminCached = false;
let adminCheckPromise = null;
let popupShown = false;
let exitIntentEnabled = true;
let userHistory = [];
let userPreferences = {};
let coupons = [];
let activeCoupons = [];

// TOPUP SYSTEM
let userBalance = 0;
let selectedTopupAmount = 0;
let selectedTopupCurrency = 'USDT';
let topupSubscription = null;

// SLIDER
let sliderSlides = [];
let sliderIntervalTime = 3;
let currentSlideIndex = 0;
let sliderTimer = null;
let isSliderPaused = false;

// MARQUEE
let marqueeSettings = {
    enabled: true,
    text: '🚀 Welcome to ZI Store | ⚡ Instant Delivery | 🔒 Secure Payment | 💬 24/7 Support'
};

let featuredProducts = [];
let featuredRotationInterval = null;
let featuredCurrentIndex = 0;
let featuredSettings = {
    enabled: true,
    rotationInterval: 5000,
    maxProducts: 4,
    selectedProductIds: []
};

let userProfile = {
    name: '',
    email: '',
    photoURL: '',
    telegram: '',
    telegramChatId: '',
    location: 'Tunisia',
    country: 'Tunisia',
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
    licences: [],
    balance: 0,
    lastIP: '',
    lastCountry: '',
    lastLoginDate: null,
    welcomeEmailSent: false,
    loginCount: 0,
    settings: {
        ipDetection: true,
        emailNotifications: true,
        twoFactorAuth: false
    }
};

// ============================================================
// FALLBACK PRODUCTS (if Firestore empty)
// ============================================================
const fallbackProducts = [
    {
        id: "fallback_1",
        name: "Survive Idle Run",
        price: 16,
        badge: "VIP",
        status: "available",
        image: "https://picsum.photos/seed/survive/400/300",
        downloadLink: "",
        description: "Survive Idle Run with premium features. Unlock all levels and get unlimited boosts.",
        features: ["Gems Hack", "Ticket Hack", "AutoKill"],
        video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        currency: "USD",
        productType: "standard",
        badges: ["hot", "exclusive"],
        createdAt: new Date()
    },
    {
        id: "fallback_2",
        name: "Animal and Coin",
        price: 0,
        badge: "FREE",
        status: "available",
        image: "https://picsum.photos/seed/animal/400/300",
        downloadLink: "https://example.com/download/animal.apk",
        description: "Animal and Coin game with exclusive mod features.",
        features: ["Level Bypass", "SpeedHack"],
        video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        currency: "USD",
        productType: "standard",
        badges: ["new", "best"],
        createdAt: new Date()
    },
    {
        id: "fallback_3",
        name: "Screwdom 3D Pro",
        price: 0,
        badge: "FREE",
        status: "available",
        image: "https://picsum.photos/seed/screwdom/400/300",
        downloadLink: "https://example.com/download/screwdom.apk",
        description: "Exciting 3D puzzle game with unlimited boosts.",
        features: ["Unlimited Boost", "Level Auto Complete", "Game Speed"],
        video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        currency: "USD",
        productType: "standard",
        badges: ["hot"],
        createdAt: new Date()
    },
    {
        id: "fallback_4",
        name: "Mergedom VIP",
        price: 11,
        badge: "VIP",
        status: "available",
        image: "https://picsum.photos/seed/mergedom/400/300",
        downloadLink: "",
        description: "Mergedom game with premium features.",
        features: ["Level Auto Bypass", "Unlimited Boost", "Game Speed"],
        video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        currency: "USD",
        productType: "standard",
        badges: ["hot"],
        createdAt: new Date()
    },
    {
        id: "fallback_5",
        name: "Premium Script Pack",
        price: 25,
        badge: "VIP",
        status: "available",
        image: "https://picsum.photos/seed/premium/400/300",
        downloadLink: "",
        description: "Complete premium script pack with 10+ tools.",
        features: ["10+ Scripts", "Lifetime Updates", "Support Included"],
        video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        currency: "USD",
        productType: "standard",
        badges: ["best", "limited"],
        createdAt: new Date()
    },
    {
        id: "fallback_6",
        name: "AI Chat Assistant",
        price: 15,
        badge: "VIP",
        status: "available",
        image: "https://picsum.photos/seed/ai/400/300",
        downloadLink: "",
        description: "AI-powered chat assistant for Discord and Telegram.",
        features: ["NLP Engine", "Multi-Platform", "Custom Commands"],
        video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        currency: "USD",
        productType: "standard",
        badges: ["new", "exclusive"],
        createdAt: new Date()
    }
];

const discountCodes = {
    'SAVE10': { discount: 10 },
    'SAVE15': { discount: 15 },
    'WELCOME': { discount: 10 },
    'VIP2024': { discount: 15 },
    'SUMMER': { discount: 10 }
};

const paymentWallets = {
    litecoin: {
        name: 'Litecoin',
        icon: 'fab fa-bitcoin',
        network: 'LTC',
        address: 'ltc1qy6ksn0g4hm6hlh93fwekgz8x74vr6hvdmh6zz8',
        currency: 'LTC',
        color: '#f2a900'
    },
    usdt: {
        name: 'USDT (ERC20)',
        icon: 'fas fa-coins',
        network: 'ERC20',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        currency: 'USDT',
        color: '#26a17b'
    }
};

let cryptoPrices = { ltc: 0, usdt: 1, lastUpdate: null, isUpdating: false };

// ============================================================
// ENHANCED TOAST SYSTEM
// ============================================================
function showToast(message, type = 'success', duration = 4000, large = false) {
    const toast = document.getElementById('toast');
    const messageEl = document.getElementById('toastMessage');
    const iconEl = toast?.querySelector('.toast-icon');
    if (!toast || !messageEl) return;
    toast.className = 'toast';
    toast.classList.add(type);
    if (large) toast.classList.add('large');
    const icons = {
        success: '<i class="fas fa-check-circle" style="color: #00d4aa;"></i>',
        error: '<i class="fas fa-exclamation-circle" style="color: #ff6b6b;"></i>',
        warning: '<i class="fas fa-exclamation-triangle" style="color: #fbbf24;"></i>',
        info: '<i class="fas fa-info-circle" style="color: #6c5ce7;"></i>'
    };
    if (iconEl) iconEl.innerHTML = icons[type] || icons.success;
    if (large && typeof message === 'object') {
        const { title, details, total, orderId, date, method } = message;
        let detailsHtml = '';
        if (details && details.length > 0) {
            detailsHtml = details.map(item => 
                `<div style="display:flex; justify-content:space-between; padding:3px 0; font-size:13px; border-bottom:1px solid rgba(255,255,255,0.05);">
                    <span>${item.name} ×${item.quantity || 1}</span>
                    <span style="font-weight:600;">$${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                </div>`
            ).join('');
        }
        messageEl.innerHTML = `
            <div style="text-align:center; width:100%;">
                <div style="font-size:48px; margin-bottom:6px;">✅</div>
                <div style="font-size:22px; font-weight:800; color:var(--success);">${title || 'Payment Successful!'}</div>
                ${orderId ? `<div style="font-size:13px; opacity:0.6; margin-top:2px;">📋 Order #${orderId}</div>` : ''}
                ${method ? `<div style="font-size:12px; opacity:0.4;">💳 ${method}</div>` : ''}
                <div style="background:rgba(255,255,255,0.05); border-radius:8px; padding:10px; margin:8px 0; text-align:left; max-height:120px; overflow-y:auto;">
                    ${detailsHtml}
                </div>
                <div style="display:flex; justify-content:space-between; font-size:14px; font-weight:700; border-top:1px solid rgba(255,255,255,0.1); padding-top:6px;">
                    <span>Total</span>
                    <span style="color:var(--success); font-size:18px;">$${total.toFixed(2)}</span>
                </div>
                <div style="font-size:11px; opacity:0.4; margin-top:4px;">
                    📅 ${date || new Date().toLocaleString()}
                </div>
            </div>
        `;
        toast.style.display = 'flex';
        toast.style.flexDirection = 'column';
        toast.style.alignItems = 'center';
        toast.style.maxWidth = '420px';
        toast.style.padding = '20px 24px';
    } else {
        messageEl.innerHTML = message;
        toast.style.display = 'flex';
        toast.style.flexDirection = 'row';
        toast.style.alignItems = 'center';
        toast.style.maxWidth = '90%';
        toast.style.padding = '12px 24px';
    }
    void toast.offsetWidth;
    toast.classList.add('show');
    clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => { toast.style.display = 'none'; }, 500);
    }, duration);
}

window.hideToast = function() {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.classList.remove('show');
        setTimeout(() => { toast.style.display = 'none'; }, 500);
    }
};

// ============================================================
// BUTTON LOADING STATE
// ============================================================
function showButtonLoading(button, loadingText = 'Processing...') {
    if (!button) return;
    button.disabled = true;
    button._originalText = button.innerHTML;
    button.innerHTML = `<span class="spinner-btn"></span> ${loadingText}`;
    button.classList.add('btn-loading');
}

function hideButtonLoading(button, successText = null) {
    if (!button) return;
    button.disabled = false;
    button.classList.remove('btn-loading');
    if (successText) {
        button.innerHTML = `<i class="fas fa-check"></i> ${successText}`;
        button.style.background = 'var(--success)';
        setTimeout(() => {
            button.innerHTML = button._originalText || 'Continue';
            button.style.background = '';
        }, 2000);
    } else if (button._originalText) {
        button.innerHTML = button._originalText;
        button.style.background = '';
    }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function hideLoadingScreen() {
    const screen = document.getElementById('loadingScreen');
    if (screen) {
        screen.classList.add('hidden');
        setTimeout(() => {
            screen.classList.add('hidden-force');
        }, 600);
        console.log('✅ Loading screen hidden');
    }
}

function showLoadingScreen() {
    const screen = document.getElementById('loadingScreen');
    if (screen) {
        screen.classList.remove('hidden', 'hidden-force');
        screen.style.display = 'flex';
    }
}

window.showMainApp = function() {
    const mainApp = document.getElementById('mainApp');
    if (mainApp) {
        mainApp.style.display = 'block';
        mainApp.style.visibility = 'visible';
        mainApp.style.opacity = '1';
        console.log('✅ Main app shown');
        return true;
    }
    console.warn('⚠️ Main app element not found');
    return false;
};

// ============================================================
// REMOVE DUPLICATE DATE
// ============================================================
function removeDuplicateDate() {
    const dates = document.querySelectorAll('#serverTime, .server-time, .header-date, .date-display, [data-date]');
    if (dates.length > 1) {
        for (let i = 1; i < dates.length; i++) {
            dates[i].style.display = 'none';
            console.log('🔇 Hidden duplicate date element:', dates[i]);
        }
    }
}

function styleHeaderTopup() {
    const headerActions = document.getElementById('headerActions');
    if (headerActions) {
        headerActions.style.display = 'flex';
        headerActions.style.alignItems = 'center';
        headerActions.style.gap = '5px';
        headerActions.style.flexWrap = 'nowrap';
    }
    const balanceEl = document.getElementById('balanceDisplay');
    if (balanceEl) balanceEl.style.fontSize = '12px';
    const topupBtn = document.getElementById('topupButton');
    if (topupBtn) {
        topupBtn.style.fontSize = '11px';
        topupBtn.style.padding = '3px 8px';
        topupBtn.style.marginLeft = '2px';
    }
}

// ============================================================
// TOP INFO BAR - Server Time, IP, Country
// ============================================================
let serverTimeInterval = null;

function updateServerTime() {
    const now = new Date();
    const options = {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        weekday: 'short'
    };
    const dateTimeStr = now.toLocaleString('en-US', options);
    const el = document.getElementById('serverTime');
    if (el) {
        el.innerHTML = `<i class="far fa-calendar-alt" style="margin-right:3px;color:var(--vip-color);"></i> ${dateTimeStr}`;
    }
}

async function fetchUserInfo() {
    try {
        console.log('📍 Fetching IP info via Supabase proxy...');
        const response = await fetch(`${SUPABASE_URL}/functions/v1/get-ip-info`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Accept': 'application/json',
            },
            mode: 'cors',
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        const data = await response.json();
        console.log('📍 IP Info from proxy:', data);
        if (data.error) throw new Error(data.error);
        const ipEl = document.getElementById('userIP');
        if (ipEl) ipEl.textContent = data.ip || 'Unknown';
        const countryEl = document.getElementById('userCountry');
        if (countryEl) {
            const flag = getCountryFlag(data.country_code);
            countryEl.innerHTML = `${flag} ${data.country_name || 'Unknown'}`;
        }
        return data;
    } catch (error) {
        console.error('❌ Failed to fetch IP info:', error);
        const ipEl = document.getElementById('userIP');
        if (ipEl) ipEl.textContent = '⚠️ Unavailable';
        const countryEl = document.getElementById('userCountry');
        if (countryEl) countryEl.textContent = '🌍 Unknown';
        return null;
    }
}

function getCountryFlag(countryCode) {
    if (!countryCode) return '🌍';
    const flags = {
        'US': '🇺🇸', 'GB': '🇬🇧', 'CA': '🇨🇦', 'AU': '🇦🇺',
        'DE': '🇩🇪', 'FR': '🇫🇷', 'IT': '🇮🇹', 'ES': '🇪🇸',
        'PT': '🇵🇹', 'NL': '🇳🇱', 'BE': '🇧🇪', 'CH': '🇨🇭',
        'AT': '🇦🇹', 'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰',
        'FI': '🇫🇮', 'IE': '🇮🇪', 'NZ': '🇳🇿', 'ZA': '🇿🇦',
        'BR': '🇧🇷', 'AR': '🇦🇷', 'MX': '🇲🇽', 'CO': '🇨🇴',
        'CL': '🇨🇱', 'AE': '🇦🇪', 'SA': '🇸🇦', 'QA': '🇶🇦',
        'OM': '🇴🇲', 'KW': '🇰🇼', 'BH': '🇧🇭', 'JO': '🇯🇴',
        'IL': '🇮🇱', 'LB': '🇱🇧', 'EG': '🇪🇬', 'DZ': '🇩🇿',
        'MA': '🇲🇦', 'TN': '🇹🇳', 'LY': '🇱🇾', 'SD': '🇸🇩',
        'ET': '🇪🇹', 'KE': '🇰🇪', 'UG': '🇺🇬', 'TZ': '🇹🇿',
        'RW': '🇷🇼', 'ZM': '🇿🇲', 'ZW': '🇿🇼', 'MW': '🇲🇼',
        'MZ': '🇲🇿', 'NG': '🇳🇬', 'GH': '🇬🇭', 'CI': '🇨🇮',
        'SN': '🇸🇳', 'ML': '🇲🇱', 'IN': '🇮🇳', 'PK': '🇵🇰',
        'BD': '🇧🇩', 'MM': '🇲🇲', 'TH': '🇹🇭', 'VN': '🇻🇳',
        'MY': '🇲🇾', 'SG': '🇸🇬', 'PH': '🇵🇭', 'ID': '🇮🇩',
        'CN': '🇨🇳', 'JP': '🇯🇵', 'KR': '🇰🇷', 'TR': '🇹🇷',
        'RU': '🇷🇺', 'UA': '🇺🇦', 'PL': '🇵🇱', 'RO': '🇷🇴',
        'HU': '🇭🇺', 'GR': '🇬🇷'
    };
    return flags[countryCode] || '🌍';
}

async function initTopInfoBar() {
    if (serverTimeInterval) clearInterval(serverTimeInterval);
    updateServerTime();
    serverTimeInterval = setInterval(updateServerTime, 1000);
    await fetchUserInfo();
    setInterval(fetchUserInfo, 300000);
    setTimeout(removeDuplicateDate, 100);
}

// ============================================================
// ADMIN CHECK FUNCTIONS
// ============================================================
async function checkIsAdmin() {
    if (!currentUser) return false;
    if (adminCheckPromise) return adminCheckPromise;
    adminCheckPromise = (async () => {
        try {
            const uid = currentUser.uid;
            console.log('🔍 Checking admin for UID:', uid);
            const adminRef = doc(db, 'admins', uid);
            const adminSnap = await getDoc(adminRef);
            const isAdmin = adminSnap.exists() && adminSnap.data().isAdmin === true;
            console.log('✅ Admin status:', isAdmin);
            isAdminCached = isAdmin;
            return isAdmin;
        } catch (error) {
            console.error('Error checking admin status:', error);
            isAdminCached = false;
            return false;
        } finally {
            setTimeout(() => { adminCheckPromise = null; }, 1000);
        }
    })();
    return adminCheckPromise;
}

async function refreshAdminStatus() {
    adminCheckPromise = null;
    isAdminCached = await checkIsAdmin();
    return isAdminCached;
}

window.ensureAdminPanel = function() {
    if (!currentUser) {
        console.warn('⚠️ No user logged in');
        return false;
    }
    const adminMenuItem = document.getElementById('adminMenuItem');
    if (isAdminCached) {
        if (adminMenuItem) {
            adminMenuItem.style.display = 'flex';
            console.log('✅ Admin panel already active');
        }
        return true;
    }
    checkIsAdmin().then((isAdmin) => {
        if (isAdmin) {
            isAdminCached = true;
            if (adminMenuItem) {
                adminMenuItem.style.display = 'flex';
                console.log('✅ Admin panel activated successfully');
            }
            updateFullUserMenu();
            updateUI();
            showToast('👑 Admin panel activated', 'success');
            loadAdminOrders();
            startAdminRealtimeListener();
            renderAdminProducts(products);
            loadLicences();
            loadAdminTopups();
            renderFallbackProductsAdmin();
        } else {
            console.warn('⚠️ User is not an admin');
            if (adminMenuItem) {
                adminMenuItem.style.display = 'none';
            }
        }
    }).catch((error) => {
        console.error('❌ Error ensuring admin panel:', error);
    });
};

// ============================================================
// ADMIN SETTINGS FUNCTIONS (from Firestore)
// ============================================================
async function getAdminSettings() {
    try {
        const settingsRef = doc(db, 'admin_settings', 'notifications');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
            return settingsSnap.data();
        } else {
            const defaultSettings = {
                adminEmail: 'idriss.zribi13@gmail.com',
                adminTelegramChatId: '',
                enableEmailNotifications: true,
                enableTelegramNotifications: true,
                updatedAt: serverTimestamp(),
                updatedBy: currentUser?.uid || ''
            };
            await setDoc(settingsRef, defaultSettings);
            return defaultSettings;
        }
    } catch (error) {
        console.error('Error loading admin settings:', error);
        return {
            adminEmail: 'idriss.zribi13@gmail.com',
            adminTelegramChatId: '',
            enableEmailNotifications: true,
            enableTelegramNotifications: true
        };
    }
}

async function updateAdminSettings(settings) {
    if (!currentUser || !isAdminCached) {
        showToast('⛔ Unauthorized', 'error');
        return false;
    }
    try {
        const settingsRef = doc(db, 'admin_settings', 'notifications');
        await setDoc(settingsRef, {
            ...settings,
            updatedAt: serverTimestamp(),
            updatedBy: currentUser.uid
        }, { merge: true });
        showToast('✅ Admin settings updated!', 'success');
        return true;
    } catch (error) {
        console.error('Error updating admin settings:', error);
        showToast('❌ Error: ' + error.message, 'error');
        return false;
    }
}

// ============================================================
// USER FUNCTIONS (Firestore + LocalStorage)
// ============================================================
function loadFromLocalStorage() {
    try {
        const wishlistData = localStorage.getItem('zi_wishlist_backup');
        const cartData = localStorage.getItem('zi_cart_backup');
        const historyData = localStorage.getItem('zi_history_backup');
        const requestsData = localStorage.getItem('zi_requests_backup');
        const usedCodesData = localStorage.getItem('zi_usedcodes_backup');
        const referralsData = localStorage.getItem('zi_referrals_backup');
        const referralRewardsData = localStorage.getItem('zi_referralRewards_backup');
        const rpData = localStorage.getItem('zi_rp_backup');
        const isBannedData = localStorage.getItem('zi_isBanned_backup');
        const lastDailyRewardData = localStorage.getItem('zi_lastDailyReward_backup');
        const licencesData = localStorage.getItem('zi_licences_backup');
        const photoURLData = localStorage.getItem('zi_photoURL_backup');
        const balanceData = localStorage.getItem('zi_balance_backup');
        const lastIPData = localStorage.getItem('zi_lastIP_backup');
        const lastCountryData = localStorage.getItem('zi_lastCountry_backup');
        const welcomeEmailSentData = localStorage.getItem('zi_welcomeEmailSent_backup');
        const loginCountData = localStorage.getItem('zi_loginCount_backup');
        const settingsData = localStorage.getItem('zi_settings_backup');

        wishlist = wishlistData ? JSON.parse(wishlistData) : [];
        cart = cartData ? JSON.parse(cartData) : [];
        userProfile.history = historyData ? JSON.parse(historyData) : [];
        userProfile.requests = requestsData ? JSON.parse(requestsData) : [];
        userProfile.usedCodes = usedCodesData ? JSON.parse(usedCodesData) : [];
        userProfile.referrals = referralsData ? JSON.parse(referralsData) : [];
        userProfile.referralRewards = referralRewardsData ? parseFloat(referralRewardsData) : 0;
        userProfile.rp = rpData ? parseFloat(rpData) : 0;
        userProfile.isBanned = isBannedData ? JSON.parse(isBannedData) : false;
        userProfile.lastDailyReward = lastDailyRewardData ? parseInt(lastDailyRewardData) : 0;
        userProfile.licences = licencesData ? JSON.parse(licencesData) : [];
        userProfile.photoURL = photoURLData || '';
        userProfile.balance = balanceData ? parseFloat(balanceData) : 0;
        userProfile.lastIP = lastIPData || '';
        userProfile.lastCountry = lastCountryData || '';
        userProfile.welcomeEmailSent = welcomeEmailSentData === 'true';
        userProfile.loginCount = loginCountData ? parseInt(loginCountData) : 0;
        userProfile.settings = settingsData ? JSON.parse(settingsData) : { ipDetection: true, emailNotifications: true, twoFactorAuth: false };
        userBalance = userProfile.balance;

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
        updateBalanceDisplay();
    } catch (e) {
        console.error('Error loading from localStorage:', e);
    }
}

async function getUserId() {
    if (userId) return userId;
    let savedId = localStorage.getItem('zi_userId');
    if (savedId) { userId = savedId; return userId; }
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    localStorage.setItem('zi_userId', userId);
    return userId;
}

let isLoadingUser = false;
let lastUserLoadTime = 0;

function startUserRealtimeListener() {
    if (unsubscribeUser) { unsubscribeUser(); unsubscribeUser = null; }
    if (!currentUser) {
        console.log('ℹ️ No authenticated user, skipping realtime listener');
        return;
    }
    const uid = currentUser.uid;
    if (!uid) return;
    const userRef = doc(db, 'users', uid);
    unsubscribeUser = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
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
            userProfile.photoURL = data.photoURL || '';
            userProfile.telegram = data.telegram || '';
            userProfile.telegramChatId = data.telegramChatId || '';
            userProfile.location = data.location || data.country || 'Tunisia';
            userProfile.country = data.country || data.location || 'Tunisia';
            userProfile.lang = data.lang || 'English';
            userProfile.isBanned = data.isBanned || false;
            userProfile.joined = data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '--';
            userProfile.useRpForCart = data.useRpForCart || false;
            userProfile.lastDailyReward = data.lastDailyReward || 0;
            userProfile.licences = data.licences || [];
            userProfile.balance = data.balance || 0;
            userProfile.lastIP = data.lastIP || '';
            userProfile.lastCountry = data.lastCountry || '';
            userProfile.welcomeEmailSent = data.welcomeEmailSent || false;
            userProfile.loginCount = data.loginCount || 0;
            userProfile.settings = data.settings || { ipDetection: true, emailNotifications: true, twoFactorAuth: false };
            userBalance = userProfile.balance;

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
            updateBalanceDisplay();

            checkIsAdmin().then(isAdmin => {
                if (isAdmin) {
                    loadAdminOrders();
                    loadLicences();
                    loadAdminTopups();
                    renderFallbackProductsAdmin();
                }
            });
        }
    }, (error) => {
        console.error('Error in user realtime listener:', error);
        if (error.code === 'permission-denied') loadFromLocalStorage();
    });
}

async function loadUserData() {
    if (!currentUser) {
        console.log('ℹ️ No authenticated user, loading from localStorage');
        loadFromLocalStorage();
        return;
    }
    const uid = currentUser.uid;
    if (isLoadingUser || (Date.now() - lastUserLoadTime < 500)) return;
    isLoadingUser = true;
    lastUserLoadTime = Date.now();
    startUserRealtimeListener();
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
            userProfile.photoURL = data.photoURL || '';
            userProfile.telegram = data.telegram || '';
            userProfile.telegramChatId = data.telegramChatId || '';
            userProfile.location = data.location || data.country || 'Tunisia';
            userProfile.country = data.country || data.location || 'Tunisia';
            userProfile.lang = data.lang || 'English';
            userProfile.isBanned = data.isBanned || false;
            userProfile.joined = data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '--';
            userProfile.useRpForCart = data.useRpForCart || false;
            userProfile.lastDailyReward = data.lastDailyReward || 0;
            userProfile.licences = data.licences || [];
            userProfile.balance = data.balance || 0;
            userProfile.lastIP = data.lastIP || '';
            userProfile.lastCountry = data.lastCountry || '';
            userProfile.welcomeEmailSent = data.welcomeEmailSent || false;
            userProfile.loginCount = data.loginCount || 0;
            userProfile.settings = data.settings || { ipDetection: true, emailNotifications: true, twoFactorAuth: false };
            userBalance = userProfile.balance;

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
            updateBalanceDisplay();

            const isAdmin = await checkIsAdmin();
            if (isAdmin) {
                loadAdminOrders();
                loadLicences();
                loadAdminTopups();
                renderFallbackProductsAdmin();
            }
        } else {
            await setDoc(userRef, {
                userId: uid,
                wishlist: [],
                cart: [],
                history: [],
                requests: [],
                usedCodes: [],
                referrals: [],
                referralRewards: 0,
                rp: 0,
                isBanned: false,
                useRpForCart: false,
                lastDailyReward: 0,
                licences: [],
                photoURL: '',
                balance: 0,
                country: 'Tunisia',
                location: 'Tunisia',
                lastIP: '',
                lastCountry: 'Tunisia',
                welcomeEmailSent: false,
                loginCount: 0,
                settings: { ipDetection: true, emailNotifications: true, twoFactorAuth: false },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        if (error.code === 'permission-denied') loadFromLocalStorage();
    }
    isLoadingUser = false;
}

async function saveUserData(silent = false) {
    if (!currentUser) {
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
        localStorage.setItem('zi_photoURL_backup', userProfile.photoURL || '');
        localStorage.setItem('zi_balance_backup', JSON.stringify(userProfile.balance || 0));
        localStorage.setItem('zi_lastIP_backup', userProfile.lastIP || '');
        localStorage.setItem('zi_lastCountry_backup', userProfile.lastCountry || '');
        localStorage.setItem('zi_welcomeEmailSent_backup', userProfile.welcomeEmailSent ? 'true' : 'false');
        localStorage.setItem('zi_loginCount_backup', JSON.stringify(userProfile.loginCount || 0));
        localStorage.setItem('zi_settings_backup', JSON.stringify(userProfile.settings));
        return true;
    }
    const uid = currentUser.uid;
    if (!uid) return false;
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
            photoURL: userProfile.photoURL || '',
            telegram: userProfile.telegram,
            telegramChatId: userProfile.telegramChatId,
            location: userProfile.location,
            country: userProfile.country || userProfile.location || 'Tunisia',
            lang: userProfile.lang,
            useRpForCart: userProfile.useRpForCart,
            isBanned: userProfile.isBanned,
            lastDailyReward: userProfile.lastDailyReward || 0,
            licences: userProfile.licences || [],
            balance: userProfile.balance || 0,
            lastIP: userProfile.lastIP || '',
            lastCountry: userProfile.lastCountry || '',
            welcomeEmailSent: userProfile.welcomeEmailSent || false,
            loginCount: userProfile.loginCount || 0,
            settings: userProfile.settings,
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
        localStorage.setItem('zi_photoURL_backup', userProfile.photoURL || '');
        localStorage.setItem('zi_balance_backup', JSON.stringify(userProfile.balance || 0));
        localStorage.setItem('zi_lastIP_backup', userProfile.lastIP || '');
        localStorage.setItem('zi_lastCountry_backup', userProfile.lastCountry || '');
        localStorage.setItem('zi_welcomeEmailSent_backup', userProfile.welcomeEmailSent ? 'true' : 'false');
        localStorage.setItem('zi_loginCount_backup', JSON.stringify(userProfile.loginCount || 0));
        localStorage.setItem('zi_settings_backup', JSON.stringify(userProfile.settings));
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
// UI UPDATES
// ============================================================
function updateDropdownStats() {
    const userAvatar = document.getElementById('userAvatarText');
    if (currentUser) {
        const name = currentUser.displayName || currentUser.email || 'User';
        const photoURL = userProfile.photoURL || currentUser.photoURL || '';
        if (userAvatar) {
            if (photoURL) {
                userAvatar.innerHTML = `<img src="${photoURL}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`;
            } else {
                userAvatar.textContent = name.charAt(0).toUpperCase();
            }
        }
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
            if (pendingCount > 0 && isAdminCached) { dot.className = 'user-dot notification-dot'; } else { dot.className = 'user-dot'; }
        } else { dot.className = 'user-dot guest'; }
    }
    updateDropdownStats();
    updateNotificationBadge();
    updateRpDisplay();
    updateFullUserMenu();
    updateBalanceDisplay();
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
    const adminMenuItem = document.getElementById('adminMenuItem');

    if (currentUser) {
        const displayName = currentUser.displayName || currentUser.email || 'User';
        const photoURL = userProfile.photoURL || currentUser.photoURL || '';
        if (photoURL) {
            avatar.innerHTML = `<img src="${photoURL}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`;
        } else {
            avatar.textContent = displayName.charAt(0).toUpperCase();
        }
        name.textContent = displayName;
        email.textContent = currentUser.email || 'No email';
        rp.textContent = userProfile.rp || 0;
        wishlistBadge.textContent = wishlist.length;
        wishlistBadge.style.display = wishlist.length > 0 ? 'inline-block' : 'none';
        const pendingOrders = userProfile.history.filter(o => (o.status || 'pending') === 'pending').length;
        const totalBadge = pendingOrders + unreadNotifications;
        if (totalBadge > 0) { orderBadge.style.display = 'inline-block'; orderBadge.textContent = totalBadge; } else { orderBadge.style.display = 'none'; }
        if (unreadNotifications > 0) { notifBadge.style.display = 'inline-block'; notifBadge.textContent = unreadNotifications; } else { notifBadge.style.display = 'none'; }
        if (isAdminCached) {
            adminMenuItem.style.display = 'flex';
            if (pendingCount > 0) { adminBadge.style.display = 'inline-block'; adminBadge.textContent = pendingCount; } else { adminBadge.style.display = 'none'; }
            console.log('✅ Admin menu displayed');
        } else {
            adminMenuItem.style.display = 'none';
        }
        if (licencesBadge) {
            const activeLicences = (userProfile.licences || []).filter(l => {
                if (l.status === 'revoked' || l.status === 'expired') return false;
                return new Date(l.expiryDate) > new Date();
            }).length;
            if (activeLicences > 0) { licencesBadge.style.display = 'inline-block'; licencesBadge.textContent = activeLicences; } else { licencesBadge.style.display = 'none'; }
        }
    } else {
        avatar.textContent = 'U';
        name.textContent = 'Guest';
        email.textContent = 'Not logged in';
        rp.textContent = '0';
        wishlistBadge.style.display = 'none';
        orderBadge.style.display = 'none';
        notifBadge.style.display = 'none';
        adminMenuItem.style.display = 'none';
        if (licencesBadge) licencesBadge.style.display = 'none';
    }
}

// ============================================================
// AUTH FUNCTIONS
// ============================================================
window.showLogin = function() { document.getElementById('loginContainer').style.display = 'block';
    document.getElementById('registerContainer').style.display = 'none'; };
window.showRegister = function() { document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('registerContainer').style.display = 'block'; };
window.toggleReferral = function() { document.getElementById('referralField').classList.toggle('show'); };

// ============================================================
// CHECK IP CHANGE & SEND SECURITY ALERT
// ============================================================
async function checkIPChange(user, currentIP, currentCountry) {
    if (!user) return;
    
    // ===== التحقق من إعداد المستخدم =====
    const settings = userProfile.settings || { ipDetection: true };
    if (!settings.ipDetection) {
        console.log('ℹ️ IP Detection is disabled by user');
        return;
    }
    
    try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return;
        const data = userSnap.data();
        const lastIP = data.lastIP || null;
        const lastCountry = data.lastCountry || null;
        const welcomeEmailSent = data.welcomeEmailSent || false;
        const loginCount = data.loginCount || 0;

        if (!welcomeEmailSent && loginCount === 0) {
            await sendWelcomeEmail(user.email, user.displayName || user.email);
            await updateDoc(userRef, {
                welcomeEmailSent: true,
                loginCount: loginCount + 1,
                lastIP: currentIP,
                lastCountry: currentCountry,
                lastLoginDate: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            console.log('✅ Welcome email sent (first login)');
            return;
        }

        const ipChanged = lastIP && currentIP && lastIP !== currentIP;
        const countryChanged = lastCountry && currentCountry && lastCountry !== currentCountry;

        if (ipChanged || countryChanged) {
            console.log(`⚠️ IP/Country changed for user ${user.email}`);
            console.log(`Old: ${lastIP} (${lastCountry}) → New: ${currentIP} (${currentCountry})`);
            await sendSecurityAlertEmail(
                user.email,
                user.displayName || user.email,
                currentIP,
                currentCountry,
                lastIP,
                lastCountry,
                new Date().toLocaleString()
            );
            await sendAdminNotification(
                '🔐 Security Alert: IP Changed',
                `User: ${user.email}\nOld IP: ${lastIP}\nNew IP: ${currentIP}\nOld Country: ${lastCountry}\nNew Country: ${currentCountry}\nTime: ${new Date().toLocaleString()}`
            );
            await updateDoc(userRef, {
                lastIP: currentIP,
                lastCountry: currentCountry,
                lastLoginDate: serverTimestamp(),
                loginCount: loginCount + 1,
                updatedAt: serverTimestamp()
            });
            showToast('🔐 Security alert sent to your email.', 'warning');
        } else {
            await updateDoc(userRef, {
                lastLoginDate: serverTimestamp(),
                loginCount: loginCount + 1,
                updatedAt: serverTimestamp()
            });
        }
        userProfile.lastIP = currentIP;
        userProfile.lastCountry = currentCountry;
        userProfile.loginCount = (loginCount || 0) + 1;
        await saveUserData(true);
    } catch (error) {
        console.error('Error in checkIPChange:', error);
    }
}

// ============================================================
// SECURITY ALERT EMAIL
// ============================================================
async function sendSecurityAlertEmail(userEmail, userName, newIP, newCountry, oldIP, oldCountry, loginTime) {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>🔐 Security Alert</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background:#f0f2f8;padding:20px;margin:0}.container{max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.08)}.header{background:linear-gradient(135deg,#ff6b6b,#ee5a24);padding:30px 30px 20px;text-align:center}.logo{font-size:28px;font-weight:900;color:#fff}.logo span{color:#f2a900}.status-icon{font-size:48px;text-align:center;margin:8px 0}.status-title{font-size:24px;font-weight:800;color:#fff}.content{padding:35px 30px}.greeting{font-size:16px;color:#1a1a2e}.greeting strong{color:#6c5ce7}.alert-box{background:#fff3cd;border-radius:12px;padding:16px 20px;margin:12px 0;border-left:4px solid #fbbf24}.alert-box p{font-size:14px;color:#856404;line-height:1.6}.details-table{width:100%;border-collapse:collapse;margin:12px 0}.details-table td{padding:8px 12px;border-bottom:1px solid #f0f2f8;font-size:13px}.details-table .label{color:#888;font-weight:500}.details-table .value{font-weight:600;color:#1a1a2e}.btn-primary{display:inline-block;background:#6c5ce7;color:#fff;padding:12px 32px;border-radius:30px;text-decoration:none;font-weight:700;font-size:14px;transition:all .3s}.btn-primary:hover{background:#5a4bd1;transform:translateY(-2px);box-shadow:0 8px 25px rgba(108,92,231,0.3)}.btn-danger{display:inline-block;background:#ff6b6b;color:#fff;padding:12px 32px;border-radius:30px;text-decoration:none;font-weight:700;font-size:14px;transition:all .3s}.btn-danger:hover{background:#e55a5a;transform:translateY(-2px)}.text-center{text-align:center}.divider{border:none;border-top:2px solid #f0f2f8;margin:16px 0}.footer{padding:16px 30px;text-align:center;background:#f8f8ff}.footer-text{font-size:11px;color:#888}.footer-links a{color:#6c5ce7;text-decoration:none;margin:0 4px;font-size:11px}.warning-badge{display:inline-block;padding:4px 16px;border-radius:30px;background:#ff6b6b;color:#fff;font-weight:700;font-size:12px;margin-top:4px}@media(max-width:480px){.header{padding:20px}.content{padding:20px 15px}.btn-primary,.btn-danger{padding:10px 24px;font-size:13px;display:block;margin:6px 0}}</style></head><body><div class="container"><div class="header"><div class="logo">ZI <span>Store</span></div><div class="status-icon">🔐</div><div class="status-title">Security Alert</div><div><span class="warning-badge">⚠️ New Login Detected</span></div></div><div class="content"><div class="greeting">Hello <strong>${userName || 'Customer'}</strong>,</div><p style="color:#4a4a6a;font-size:14px;margin:6px 0 12px;">We noticed a login to your account from a new device or location. If this was you, you can ignore this message. If not, please take immediate action.</p><div class="alert-box"><p><strong>⚠️ If you didn't perform this action, your account may be compromised.</strong><br>We recommend changing your password immediately and contacting support.</p></div><h3 style="color:#1a1a2e;margin:12px 0 8px;font-size:16px;">📍 Login Details</h3><table class="details-table"><tr><td class="label">📅 Date & Time</td><td class="value">${loginTime}</td></tr><tr><td class="label">🌍 New Country</td><td class="value">${newCountry || 'Unknown'}</td></tr><tr><td class="label">📶 New IP Address</td><td class="value" style="font-family:monospace;">${newIP || 'Unknown'}</td></tr>${oldIP ? `<tr><td class="label">🔄 Previous IP</td><td class="value" style="font-family:monospace;">${oldIP}</td></tr>` : ''}${oldCountry ? `<tr><td class="label">🌍 Previous Country</td><td class="value">${oldCountry}</td></tr>` : ''}</table><hr class="divider"><div class="text-center"><a href="https://zi-store.online/profile" class="btn-danger" style="margin-right:6px;">🔑 Change Password</a><a href="mailto:support@zi-store.online" class="btn-primary">📧 Contact Support</a></div><p style="text-align:center;font-size:12px;color:#888;margin-top:10px;">If you have any concerns, please contact our support team immediately.</p></div><div class="footer"><div class="footer-links"><a href="https://zi-store.online">Store</a><a href="mailto:support@zi-store.online">Support</a></div><div class="footer-text">&copy; 2026 ZI Store — All rights reserved.</div></div></div></body></html>`;
    return await sendEmail(userEmail, '🔐 Security Alert: New Login Detected', html);
}

// ============================================================
// LOGIN USER
// ============================================================
window.loginUser = async function() {
    const btn = document.getElementById('loginBtn');
    showButtonLoading(btn, 'Logging in...');
    const errorEl = document.getElementById('loginError');
    const successEl = document.getElementById('loginSuccess');
    errorEl.textContent = '';
    successEl.textContent = '';
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) { errorEl.textContent = 'Please fill in all fields';
        hideButtonLoading(btn); return; }
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        currentUser = userCredential.user;
        successEl.textContent = '✅ Login successful!';
        showToast('👋 Welcome back!', 'success');
        hideButtonLoading(btn, 'Welcome!');
        await refreshAdminStatus();
        const visitorInfo = await fetchUserInfo();
        await checkIPChange(currentUser, visitorInfo.ip, visitorInfo.country);
        setTimeout(() => {
            document.getElementById('authSection').style.display = 'none';
            document.getElementById('mainApp').style.display = 'block';
            loadUserData();
            updateDropdownStats();
            loadUserBalance();
            startTopupRealtimeListener();
            initTopInfoBar();
            loadCoupons();
            if (isAdminCached) {
                console.log('✅ Admin detected, loading admin features');
                loadAdminOrders();
                startAdminRealtimeListener();
                loadLicences();
                loadAdminTopups();
                renderFallbackProductsAdmin();
                setTimeout(() => {
                    const adminMenuItem = document.getElementById('adminMenuItem');
                    if (adminMenuItem) {
                        adminMenuItem.style.display = 'flex';
                        console.log('✅ Admin menu button displayed');
                    }
                    updateFullUserMenu();
                }, 200);
            }
            loadDownloads();
            loadNotifications();
            fetchCryptoPrices();
            updateFullUserMenu();
            showTelegramBanner();
            loadSliderSettings();
            loadMarqueeSettings();
            window.ensureAdminPanel();
            window.updateLoadingProgress(100, '✅ Ready!');
            window.showMainApp();
            initPopups();
            hideLoadingScreen();
        }, 500);
    } catch (error) { errorEl.textContent = '❌ ' + error.message;
        showToast('❌ Login failed', 'error');
        hideButtonLoading(btn); }
};

// ============================================================
// REGISTER USER
// ============================================================
window.registerUser = async function() {
    const btn = document.getElementById('registerBtn');
    showButtonLoading(btn, 'Creating account...');
    const errorEl = document.getElementById('registerError');
    const successEl = document.getElementById('registerSuccess');
    errorEl.textContent = '';
    successEl.textContent = '';
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const lang = document.getElementById('registerLang').value;
    const referralCode = document.getElementById('registerReferral').value.trim().toUpperCase();
    const termsChecked = document.getElementById('termsCheck').checked;
    if (!name || !email || !password || !confirmPassword) {
        errorEl.textContent = 'Please fill in all fields';
        hideButtonLoading(btn);
        return;
    }
    if (password.length < 6) {
        errorEl.textContent = 'Password must be at least 6 characters';
        hideButtonLoading(btn);
        return;
    }
    if (password !== confirmPassword) {
        errorEl.textContent = 'Passwords do not match';
        hideButtonLoading(btn);
        return;
    }
    if (!termsChecked) {
        errorEl.textContent = 'Please agree to the terms';
        hideButtonLoading(btn);
        return;
    }
    try {
        const visitorInfo = await fetchUserInfo();
        const detectedCountry = visitorInfo?.country_name || 'Tunisia';
        const detectedIP = visitorInfo?.ip || 'Unknown';
        console.log('📍 Detected country from IP:', detectedCountry);
        console.log('📍 Detected IP:', detectedIP);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        currentUser = userCredential.user;
        const newReferralCode = generateReferralCode(name, email);
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, {
            userId: currentUser.uid,
            name,
            email,
            country: detectedCountry,
            location: detectedCountry,
            lang,
            telegram: '',
            telegramChatId: '',
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
            isBanned: false,
            lastDailyReward: 0,
            licences: [],
            photoURL: '',
            balance: 0,
            lastIP: detectedIP,
            lastCountry: detectedCountry,
            lastLoginDate: serverTimestamp(),
            welcomeEmailSent: false,
            loginCount: 0,
            settings: { ipDetection: true, emailNotifications: true, twoFactorAuth: false },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        successEl.textContent = '✅ Registration successful!';
        showToast(`🎉 Welcome, ${name}!`, 'success');
        hideButtonLoading(btn, 'Welcome!');
        await refreshAdminStatus();
        setTimeout(() => {
            document.getElementById('authSection').style.display = 'none';
            document.getElementById('mainApp').style.display = 'block';
            loadUserData();
            updateDropdownStats();
            loadDownloads();
            loadNotifications();
            fetchCryptoPrices();
            updateFullUserMenu();
            showTelegramBanner();
            loadSliderSettings();
            loadMarqueeSettings();
            loadCoupons();
            window.ensureAdminPanel();
            window.updateLoadingProgress(100, '✅ Ready!');
            window.showMainApp();
            hideLoadingScreen();
            loadUserBalance();
            startTopupRealtimeListener();
            initTopInfoBar();
            initPopups();
        }, 500);
    } catch (error) {
        errorEl.textContent = '❌ ' + error.message;
        showToast('❌ Registration failed', 'error');
        hideButtonLoading(btn);
    }
};

// ============================================================
// LOGIN WITH GOOGLE
// ============================================================
window.loginWithGoogle = function() {
    const btn = document.getElementById('googleLoginBtn');
    if (btn) showButtonLoading(btn, 'Connecting...');
    const errorEl = document.getElementById('loginError');
    if (errorEl) errorEl.textContent = '';
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    signInWithPopup(auth, provider)
        .then(async (result) => {
            const user = result.user;
            if (btn) hideButtonLoading(btn, 'Connected!');
            const photoURL = user.photoURL || '';
            userProfile.photoURL = photoURL;
            let detectedCountry = 'Unknown';
            let detectedIP = 'Unknown';
            try {
                const ipInfo = await fetchUserInfo();
                if (ipInfo && ipInfo.country_name) {
                    detectedCountry = ipInfo.country_name;
                    detectedIP = ipInfo.ip || 'Unknown';
                    console.log('📍 Detected country from IP for Google login:', detectedCountry);
                }
            } catch (e) {
                console.warn('⚠️ Could not detect country from IP for Google login');
            }
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                photoURL: photoURL,
                email: user.email,
                name: user.displayName || user.email,
                country: detectedCountry,
                location: detectedCountry,
                balance: 0,
                lastIP: detectedIP,
                lastCountry: detectedCountry,
                lastLoginDate: serverTimestamp(),
                welcomeEmailSent: false,
                loginCount: 0,
                settings: { ipDetection: true, emailNotifications: true, twoFactorAuth: false },
                updatedAt: serverTimestamp()
            }, { merge: true });
            currentUser = user;
            showToast('👋 Welcome via Google!', 'success');
            await refreshAdminStatus();
            await mergeGuestData(user.uid);
            await checkIPChange(currentUser, detectedIP, detectedCountry);
            setTimeout(() => {
                document.getElementById('authSection').style.display = 'none';
                document.getElementById('mainApp').style.display = 'block';
                loadUserData();
                updateDropdownStats();
                loadUserBalance();
                startTopupRealtimeListener();
                initTopInfoBar();
                loadCoupons();
                if (isAdminCached) {
                    console.log('✅ Admin detected, loading admin features');
                    loadAdminOrders();
                    startAdminRealtimeListener();
                    loadLicences();
                    loadAdminTopups();
                    renderFallbackProductsAdmin();
                    setTimeout(() => {
                        const adminMenuItem = document.getElementById('adminMenuItem');
                        if (adminMenuItem) {
                            adminMenuItem.style.display = 'flex';
                            console.log('✅ Admin menu button displayed');
                        }
                        updateFullUserMenu();
                    }, 200);
                }
                loadDownloads();
                loadNotifications();
                fetchCryptoPrices();
                updateFullUserMenu();
                showTelegramBanner();
                loadSliderSettings();
                loadMarqueeSettings();
                window.ensureAdminPanel();
                window.updateLoadingProgress(100, '✅ Ready!');
                window.showMainApp();
                hideLoadingScreen();
                initPopups();
            }, 500);
        })
        .catch((error) => {
            console.error('Google login error:', error);
            if (btn) hideButtonLoading(btn);
            if (error.code === 'auth/account-exists-with-different-credential') {
                const email = error.email;
                if (errorEl) {
                    errorEl.textContent = `⚠️ This email (${email}) is already registered with another method. Please login with password first, then you can link your Google account from profile.`;
                }
                showToast('⚠️ This email is already in use. Please login with password.', 'warning');
                const loginEmail = document.getElementById('loginEmail');
                if (loginEmail) loginEmail.value = email;
                document.getElementById('loginContainer').style.display = 'block';
                document.getElementById('registerContainer').style.display = 'none';
            } else if (error.code === 'auth/popup-closed-by-user') {
                showToast('Login cancelled', 'info');
            } else {
                if (errorEl) errorEl.textContent = '❌ ' + error.message;
                showToast('❌ Google login failed: ' + error.message, 'error');
            }
        });
};

async function mergeGuestData(newUid) {
    const guestWishlist = localStorage.getItem('zi_wishlist_backup');
    const guestCart = localStorage.getItem('zi_cart_backup');
    const guestHistory = localStorage.getItem('zi_history_backup');
    const guestRp = localStorage.getItem('zi_rp_backup');
    const guestBalance = localStorage.getItem('zi_balance_backup');
    if (!guestWishlist && !guestCart && !guestBalance) return;
    try {
        const userRef = doc(db, 'users', newUid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return;
        const userData = userSnap.data();
        let updated = false;
        const wishlistGuest = guestWishlist ? JSON.parse(guestWishlist) : [];
        if (wishlistGuest.length > 0) {
            const merged = [...new Set([...userData.wishlist || [], ...wishlistGuest])];
            if (merged.length !== (userData.wishlist || []).length) {
                await updateDoc(userRef, { wishlist: merged });
                updated = true;
            }
        }
        const cartGuest = guestCart ? JSON.parse(guestCart) : [];
        if (cartGuest.length > 0) {
            const existingCart = userData.cart || [];
            const mergedCart = [...existingCart];
            cartGuest.forEach(item => {
                if (!existingCart.some(ex => ex.id === item.id && ex.isVip === item.isVip && ex.vipPlan === item.vipPlan)) {
                    mergedCart.push(item);
                }
            });
            if (mergedCart.length !== existingCart.length) {
                await updateDoc(userRef, { cart: mergedCart });
                updated = true;
            }
        }
        const historyGuest = guestHistory ? JSON.parse(guestHistory) : [];
        if (historyGuest.length > 0) {
            const existingHistory = userData.history || [];
            const mergedHistory = [...existingHistory, ...historyGuest];
            if (mergedHistory.length !== existingHistory.length) {
                await updateDoc(userRef, { history: mergedHistory });
                updated = true;
            }
        }
        const rpGuest = guestRp ? parseFloat(guestRp) : 0;
        if (rpGuest > 0) {
            const currentRp = userData.rp || 0;
            if (rpGuest > 0) {
                await updateDoc(userRef, { rp: currentRp + rpGuest });
                updated = true;
            }
        }
        const balanceGuest = guestBalance ? parseFloat(guestBalance) : 0;
        if (balanceGuest > 0) {
            const currentBalance = userData.balance || 0;
            await updateDoc(userRef, { balance: currentBalance + balanceGuest });
            updated = true;
        }
        if (updated) {
            showToast('🔄 Your previous data has been merged successfully!', 'success');
            localStorage.removeItem('zi_wishlist_backup');
            localStorage.removeItem('zi_cart_backup');
            localStorage.removeItem('zi_history_backup');
            localStorage.removeItem('zi_rp_backup');
            localStorage.removeItem('zi_balance_backup');
        }
    } catch (error) {
        console.error('Error merging guest data:', error);
    }
}

window.logoutUser = async function() {
    try {
        await signOut(auth);
        currentUser = null;
        isAdminCached = false;
        activeDiscount = 0;
        activeDiscountCode = '';
        document.getElementById('adminPanel').classList.remove('open');
        closeUserMenuFull();
        if (unsubscribeAdmin) { unsubscribeAdmin();
            unsubscribeAdmin = null; }
        if (unsubscribeUser) { unsubscribeUser();
            unsubscribeUser = null; }
        if (topupSubscription) { topupSubscription.unsubscribe();
            topupSubscription = null; }
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

// ============================================================
// GENERAL MODALS
// ============================================================
window.openUserMenuFull = function() { 
    if (!currentUser) { openAuthModal(); return; } 
    document.getElementById('userMenuFull').classList.add('open');
    updateFullUserMenu();
    document.body.style.overflow = 'hidden';
    // تحميل الإعدادات
    renderSettingsUI();
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
window.openProfileFull = function() { if (!currentUser) { showToast('⚠️ Please login first', 'warning');
        openAuthModal(); return; } document.getElementById('profileFull').classList.add('open');
    renderProfileFull();
    document.body.style.overflow = 'hidden'; };
window.closeProfileFull = function() { document.getElementById('profileFull').classList.remove('open');
    document.body.style.overflow = ''; };
window.openHistoryFull = function() { if (!currentUser) { showToast('⚠️ Please login first', 'warning');
        openAuthModal(); return; } document.getElementById('historyFull').classList.add('open');
    renderHistoryFull();
    document.body.style.overflow = 'hidden'; };
window.closeHistoryFull = function() { document.getElementById('historyFull').classList.remove('open');
    document.body.style.overflow = ''; };
window.openDownloads = function() { document.getElementById('downloadsModal').classList.add('open'); };
window.closeDownloads = function() { document.getElementById('downloadsModal').classList.remove('open'); };
window.openNotifications = function() { document.getElementById('notificationsModal').classList.add('open'); };
window.closeNotifications = function() { document.getElementById('notificationsModal').classList.remove('open'); };
window.openAuthModal = function() { document.getElementById('authSection').scrollIntoView({ behavior: 'smooth' }); };

// ============================================================
// TRANSACTIONS MODAL
// ============================================================
window.openTransactionsModal = function() {
    if (!currentUser) {
        showToast('⚠️ Please login first', 'warning');
        return;
    }
    document.getElementById('transactionsModal').classList.add('open');
    document.body.style.overflow = 'hidden';
    loadTransactionHistory();
};

window.closeTransactionsModal = function() {
    document.getElementById('transactionsModal').classList.remove('open');
    document.body.style.overflow = '';
};

async function loadTransactionHistory() {
    if (!currentUser) return;
    const container = document.getElementById('transactionHistoryList');
    if (!container) return;
    container.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-secondary);"><i class="fas fa-spinner fa-spin"></i> Loading...</div>`;
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', currentUser.uid)
            .order('created_at', { ascending: false })
            .limit(50);
        if (error) throw error;
        if (!data || data.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:40px 20px;color:var(--text-secondary);"><i class="fas fa-receipt" style="font-size:48px;opacity:0.15;display:block;margin-bottom:12px;"></i><div style="font-size:18px;font-weight:600;">No transactions yet</div><div style="font-size:13px;opacity:0.4;margin-top:4px;">Your transactions will appear here</div></div>`;
            return;
        }
        renderTransactions(data);
    } catch (error) {
        console.error('Error loading transactions:', error);
        container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--danger);">Failed to load transactions: ${error.message}<br><button onclick="loadTransactionHistory()" style="margin-top:8px;padding:6px 16px;background:var(--primary);border:none;border-radius:var(--radius-sm);color:#fff;cursor:pointer;">Retry</button></div>`;
    }
}

function renderTransactions(transactions) {
    const container = document.getElementById('transactionHistoryList');
    if (!container) return;
    if (!transactions || transactions.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-secondary);opacity:0.5;"><i class="fas fa-receipt" style="font-size:36px;display:block;margin-bottom:8px;opacity:0.2;"></i>No transactions yet</div>`;
        return;
    }
    container.innerHTML = transactions.map(t => {
        const date = new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const isPositive = t.amount > 0;
        const sign = isPositive ? '+' : '';
        const color = isPositive ? 'var(--success)' : 'var(--danger)';
        const typeLabels = { 'topup': '💰 Topup', 'purchase': '🛒 Purchase', 'refund': '↩️ Refund', 'admin_adjustment': '⚙️ Admin Adjustment', 'referral_bonus': '🎁 Referral Bonus' };
        const typeLabel = typeLabels[t.type] || t.type || 'Transaction';
        const statusBadge = t.status === 'completed' ? '✅' : t.status === 'pending' ? '⏳' : '❌';
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--glass-bg);border-radius:8px;border:1px solid var(--glass-border);margin-bottom:6px;"><div><div style="font-weight:600;font-size:14px;">${typeLabel} ${statusBadge}</div><div style="font-size:11px;color:var(--text-secondary);opacity:0.5;">${t.description || ''}</div><div style="font-size:10px;color:var(--text-secondary);opacity:0.3;">${date}</div></div><div style="font-weight:700;font-size:16px;color:${color};">${sign}$${Math.abs(t.amount || 0).toFixed(2)}</div></div>`;
    }).join('');
}

// ============================================================
// RENDER PROFILE FULL
// ============================================================
function renderProfileFull() {
    const container = document.getElementById('profileFullContent');
    if (!container) {
        console.warn('⚠️ profileFullContent not found');
        return;
    }
    if (!currentUser) {
        container.innerHTML = `<div style="text-align:center;padding:40px 20px;color:var(--text-secondary);">
            <i class="fas fa-user-circle" style="font-size:48px;opacity:0.15;display:block;margin-bottom:12px;"></i>
            <div style="font-size:18px;font-weight:600;">Please login</div>
            <div style="font-size:13px;opacity:0.4;margin-top:4px;">Login to view your profile</div>
        </div>`;
        return;
    }
    const displayName = currentUser.displayName || currentUser.email || 'User';
    const photoURL = userProfile.photoURL || currentUser.photoURL || '';
    const maskedChatId = userProfile.telegramChatId ? userProfile.telegramChatId.slice(0, 4) + '***' + userProfile.telegramChatId.slice(-4) : 'Not linked';
    const activeLicences = (userProfile.licences || []).filter(l => {
        if (l.status === 'revoked' || l.status === 'expired') return false;
        return new Date(l.expiryDate) > new Date();
    }).length;
    const balance = userProfile.balance || 0;
    const userCountry = userProfile.location || userProfile.country || 'Not set';
    const joinedDate = userProfile.joined || '--';
    const lastIP = userProfile.lastIP || 'Not recorded';
    const lastCountry = userProfile.lastCountry || 'Not recorded';
    const loginCount = userProfile.loginCount || 0;
    container.innerHTML = `
    <div class="profile-container">
        <div class="profile-hero">
            <div class="hero-content">
                <div class="hero-avatar">${photoURL ? `<img src="${photoURL}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />` : displayName.charAt(0).toUpperCase()}</div>
                <div class="hero-info">
                    <div class="hero-name">${displayName}</div>
                    <div class="hero-email">${currentUser.email || 'No email'}</div>
                    <div class="hero-badges">
                        <span class="hero-badge rp">🎯 RP: ${userProfile.rp || 0}</span>
                        <span class="hero-badge licence">🔑 Licences: ${activeLicences}</span>
                        <span class="hero-badge balance">💰 Balance: $${balance.toFixed(2)}</span>
                        ${userProfile.isBanned ? '<span class="hero-badge banned">🚫 BANNED</span>' : ''}
                    </div>
                    <div class="hero-joined"><i class="fas fa-calendar-alt"></i> Joined: ${joinedDate}</div>
                    <div style="font-size:12px;color:var(--text-secondary);opacity:0.5;margin-top:2px;"><i class="fas fa-map-marker-alt" style="color:var(--vip-color);"></i> Country: ${userCountry} <span style="font-size:10px;opacity:0.4;">(auto-detected)</span></div>
                    <div style="font-size:11px;color:var(--text-secondary);opacity:0.3;margin-top:2px;"><i class="fas fa-shield-alt" style="color:var(--success);"></i> Last IP: ${lastIP} · Last Login: ${lastCountry} · Logins: ${loginCount}</div>
                </div>
            </div>
            <div class="profile-stats-grid">
                <div class="profile-stat-item"><div class="stat-number">${userProfile.history.length}</div><div class="stat-label">Orders</div></div>
                <div class="profile-stat-item"><div class="stat-number">${userProfile.rp || 0}</div><div class="stat-label">RP Points</div></div>
                <div class="profile-stat-item"><div class="stat-number">${wishlist.length}</div><div class="stat-label">Favorites</div></div>
                <div class="profile-stat-item"><div class="stat-number">${userProfile.referrals?.length || 0}</div><div class="stat-label">Referrals</div></div>
            </div>
        </div>
        <div class="profile-section-card">
            <div class="section-title"><i class="fas fa-edit"></i> Edit Profile</div>
            <form onsubmit="saveProfileChangesInline(event)">
                <div class="profile-form-group"><label>Name</label><input id="editNameInline" value="${userProfile.name || currentUser.displayName || ''}" placeholder="Enter your name" type="text" /></div>
                <div class="profile-form-group"><label>Telegram Username</label><input id="editTelegramInline" value="${userProfile.telegram || ''}" placeholder="@username" type="text" /></div>
                <div class="profile-form-group" style="opacity:0.6;"><label>Country (auto-detected)</label><input type="text" value="${userCountry}" disabled style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--card-bg);color:var(--text);" /></div>
                <div class="profile-form-group"><label>Language</label><select id="editLangInline"><option value="English" ${userProfile.lang==='English'?'selected':''}>🇬🇧 English</option><option value="Arabic" ${userProfile.lang==='Arabic'?'selected':''}>🇸🇦 العربية</option><option value="French" ${userProfile.lang==='French'?'selected':''}>🇫🇷 Français</option></select></div>
                <div class="profile-actions"><button type="button" class="btn-secondary" onclick="renderProfileFull()">Cancel</button><button type="submit" class="btn-primary"><i class="fas fa-save"></i> Save</button></div>
            </form>
        </div>
        <div class="profile-section-card">
            <div class="section-title"><i class="fas fa-lock"></i> Password & Security</div>
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;margin-bottom:8px;background:var(--glass-bg);padding:8px 12px;border-radius:var(--radius-sm);border:1px solid var(--glass-border);">
                <span style="font-size:13px;font-weight:500;color:var(--text-secondary);">${currentUser.email || 'No email'}</span>
                <button onclick="sendResetLinkInline()" class="btn-primary" style="padding:4px 14px;font-size:12px;"><i class="fas fa-paper-plane"></i> Send Reset Link</button>
            </div>
            <div style="border-top:1px solid var(--glass-border);padding-top:12px;margin-top:4px;">
                <div style="font-size:12px;color:var(--text-secondary);opacity:0.4;margin-bottom:6px;">Use your current password to set a new one instantly.</div>
                <div class="profile-form-group"><label>Current Password</label><div class="password-wrapper"><input id="currentPasswordInline" placeholder="Enter current password" type="password" /><button type="button" class="password-toggle" onclick="togglePasswordVisibility('currentPasswordInline')"><i class="fas fa-eye"></i></button></div></div>
                <div class="profile-form-group"><label>New Password</label><div class="password-wrapper"><input id="newPasswordInline" placeholder="Enter new password (min 6 chars)" type="password" /><button type="button" class="password-toggle" onclick="togglePasswordVisibility('newPasswordInline')"><i class="fas fa-eye"></i></button></div></div>
                <div class="profile-form-group"><label>Confirm New Password</label><div class="password-wrapper"><input id="confirmNewPasswordInline" placeholder="Confirm new password" type="password" /><button type="button" class="password-toggle" onclick="togglePasswordVisibility('confirmNewPasswordInline')"><i class="fas fa-eye"></i></button></div></div>
                <button class="btn-primary" onclick="changePasswordInline()" style="width:100%;"><i class="fas fa-key"></i> Change Password</button>
                <div class="auth-error" id="passwordErrorInline"></div><div class="auth-success" id="passwordSuccessInline"></div>
            </div>
        </div>
        <div class="profile-section-card">
            <div class="section-title"><i class="fab fa-telegram-plane" style="color:#0088cc;"></i> Telegram Notifications</div>
            <div class="telegram-status-row"><span class="label">Status</span><span class="value ${userProfile.telegramChatId?'linked':'unlinked'}">${userProfile.telegramChatId?'✅ Linked':'❌ Unlinked'}</span></div>
            ${userProfile.telegramChatId ? `<div class="telegram-status-row"><span class="label">Bound Chat ID</span><span class="value" style="font-family:monospace;letter-spacing:1px;">${maskedChatId}</span></div><div class="telegram-status-row"><span class="label">Bot</span><span class="value" style="color:#0088cc;">@${BOT_USERNAME}</span></div>` : ''}
            <div class="tb-info"><i class="fas fa-info-circle" style="color:var(--primary);"></i> ${userProfile.telegramChatId ? 'You will receive order notifications here.' : 'Click "Link Bot" to connect your Telegram account.'}</div>
            <div class="telegram-actions">
                <button class="btn-bind" onclick="bindTelegram()"><i class="fab fa-telegram-plane"></i> ${userProfile.telegramChatId?'Re-link':'Link Bot'}</button>
                ${userProfile.telegramChatId ? `<button class="btn-test" onclick="testTelegramNotification()"><i class="fas fa-paper-plane"></i> Test</button>` : ''}
                <button class="btn-check" onclick="checkTelegramStatus()"><i class="fas fa-sync-alt"></i> Check</button>
                ${userProfile.telegramChatId ? `<button class="btn-unlink" onclick="unlinkTelegram()"><i class="fas fa-unlink"></i> Unlink</button>` : ''}
            </div>
            <div style="font-size:11px;color:var(--text-secondary);opacity:0.4;margin-top:6px;display:flex;align-items:center;gap:4px;"><i class="fab fa-telegram-plane" style="color:#0088cc;"></i> ${userProfile.telegramChatId ? `Connected to @${BOT_USERNAME}` : `Start @${BOT_USERNAME} and click "Link Bot" to connect`}</div>
        </div>
    </div>`;
    setTimeout(showTelegramBanner, 300);
}

// ============================================================
// PASSWORD TOGGLE
// ============================================================
window.togglePasswordVisibility = function(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const toggle = input.parentElement.querySelector('.password-toggle');
    if (input.type === 'password') {
        input.type = 'text';
        toggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        input.type = 'password';
        toggle.innerHTML = '<i class="fas fa-eye"></i>';
    }
};

window.saveProfileChangesInline = async function(e) {
    e.preventDefault();
    if (!currentUser) { showToast('⚠️ Please login first', 'warning'); return; }
    const name = document.getElementById('editNameInline').value.trim();
    const telegram = document.getElementById('editTelegramInline').value.trim();
    const lang = document.getElementById('editLangInline').value;
    if (!name) { showToast('⚠️ Name is required', 'warning'); return; }
    try {
        await updateProfile(currentUser, { displayName: name });
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, { name, telegram, lang, updatedAt: serverTimestamp() });
        userProfile.name = name;
        userProfile.telegram = telegram;
        userProfile.lang = lang;
        showToast('✅ Profile updated!', 'success');
        updateUI();
        renderProfileFull();
        updateFullUserMenu();
    } catch (error) { showToast('❌ Error: ' + error.message, 'error'); }
};

window.sendResetLinkInline = async function() { if (!currentUser) return; try { await sendPasswordResetEmail(auth, currentUser.email);
        showToast(`📧 Reset link sent to ${currentUser.email}`, 'success'); } catch (error) { showToast('❌ ' + error.message, 'error'); } };
window.changePasswordInline = async function() { if (!currentUser) return; const currentPwd = document.getElementById('currentPasswordInline').value; const newPwd = document.getElementById('newPasswordInline').value; const confirmPwd = document.getElementById('confirmNewPasswordInline').value; const errorEl = document.getElementById('passwordErrorInline'); const successEl = document.getElementById('passwordSuccessInline');
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

// ============================================================
// PRODUCT FUNCTIONS
// ============================================================
async function loadProductsFromFirestore() {
    try {
        console.log('🔄 Loading products from Firestore...');
        const productsRef = collection(db, 'products');
        const querySnapshot = await getDocs(query(productsRef, orderBy('createdAt', 'desc')));
        const productsList = [];
        querySnapshot.forEach((doc) => {
            productsList.push({ id: doc.id, ...doc.data() });
        });
        console.log(`✅ Loaded ${productsList.length} products from Firestore`);
        if (productsList.length === 0) {
            console.warn('⚠️ No products in Firestore, using fallback');
            products = fallbackProducts;
            renderProducts(products, false);
            renderAdminProducts(products);
            updateStatsFromProducts(products);
            generateRecommendations(products);
            return fallbackProducts;
        }
        products = productsList;
        renderProducts(products, false);
        renderAdminProducts(products);
        updateStatsFromProducts(products);
        generateRecommendations(products);
        return productsList;
    } catch (error) {
        console.error('Error loading products:', error);
        console.warn('⚠️ Using fallback products due to error');
        products = fallbackProducts;
        renderProducts(products, false);
        renderAdminProducts(products);
        updateStatsFromProducts(products);
        generateRecommendations(products);
        return fallbackProducts;
    }
}

function startProductsRealtimeListener() {
    if (unsubscribeProducts) {
        unsubscribeProducts();
    }
    renderProducts([], true);
    const productsRef = collection(db, 'products');
    try {
        unsubscribeProducts = onSnapshot(query(productsRef, orderBy('createdAt', 'desc')), (snapshot) => {
            const productsList = [];
            snapshot.forEach((doc) => {
                productsList.push({ id: doc.id, ...doc.data() });
            });
            console.log(`🔄 Products updated: ${productsList.length} products`);
            if (productsList.length === 0) {
                console.warn('⚠️ No products in Firestore, using fallback');
                products = fallbackProducts;
            } else {
                products = productsList;
            }
            renderProducts(products, false);
            renderAdminProducts(products);
            updateStatsFromProducts(products);
            generateRecommendations(products);
            updateBottomCartBar();
            updateRpDisplay();
            renderFeaturedProducts();
            updateSlideProductSelect();
            renderProxyPackages();
            renderLimitedProducts();
        }, (error) => {
            console.error('Products listener error:', error);
            products = fallbackProducts;
            console.log(`⚠️ Using fallback products (${products.length})`);
            renderProducts(products, false);
            renderAdminProducts(products);
            updateStatsFromProducts(products);
            renderFeaturedProducts();
            renderProxyPackages();
            renderLimitedProducts();
        });
    } catch (error) {
        console.error('Failed to set up products listener:', error);
        products = fallbackProducts;
        renderProducts(products, false);
        renderAdminProducts(products);
        updateStatsFromProducts(products);
        renderFeaturedProducts();
        renderProxyPackages();
        renderLimitedProducts();
    }
}

function getCurrencySymbol(currency) {
    const symbols = { 'USD': '$', 'TND': 'د.ت', 'OTHER': '💱' };
    return symbols[currency] || '$';
}

function renderBadges(badges) {
    if (!badges || badges.length === 0) return '';
    const badgeMap = { 'new': 'mb-new', 'hot': 'mb-hot', 'exclusive': 'mb-exclusive', 'important': 'mb-important', 'limited': 'mb-limited', 'best': 'mb-best' };
    return `<div class="product-badges">${badges.map(b => `<span class="mini-badge ${badgeMap[b] || ''}">${b}</span>`).join('')}</div>`;
}

function renderProducts(productsList, isLoading = false) {
    const container = document.getElementById('productList');
    if (!container) {
        console.warn('⚠️ productList element not found!');
        return;
    }
    console.log(`🔄 Rendering products, count: ${productsList.length}, loading: ${isLoading}`);
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
    if (list.length === 0) {
        container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:20px 0;color:var(--text-secondary);font-size:14px;"><i class="fas fa-box-open" style="font-size:36px;opacity:0.2;display:block;margin-bottom:8px;"></i><p>No products available</p></div>`;
        return;
    }
    let filtered = [...list];
    if (currentFilter === 'free') filtered = filtered.filter(p => p.price === 0);
    else if (currentFilter === 'paid') filtered = filtered.filter(p => p.price > 0);
    if (filtered.length === 0) {
        container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:20px 0;color:var(--text-secondary);font-size:14px;"><i class="fas fa-search" style="font-size:28px;opacity:0.2;display:block;margin-bottom:4px;"></i><p>No products match this filter</p></div>`;
        return;
    }
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
            originalPrice = `<span class="original-price">${getCurrencySymbol(p.currency || 'USD')}${p.price.toFixed(2)}</span>`;
            discountBadge = `<span class="discount-badge">-${activeDiscount}%</span>`;
        }
        const currencySymbol = getCurrencySymbol(p.currency || 'USD');
        const priceDisplay = isUnavailable ? '⛔ Unavailable' : (isFree ? 'FREE' : `${currencySymbol}${displayPrice.toFixed(2)}`);
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
                ${p.badges && p.badges.length > 0 ? renderBadges(p.badges) : ''}
                <div class="features-list">
                    ${displayFeatures.map(f=>`<span class="feature-item"><i class="fas fa-circle"></i> ${f}</span>`).join('')}
                    ${displayFeatures.length>0 && p.features && p.features.length>3?`<span class="feature-item" style="opacity:0.2;">+${p.features.length-3}</span>`:''}
                </div>
                <div class="price">
                    ${priceDisplay}
                    ${originalPrice} ${discountBadge}
                </div>
                <div class="card-actions">
                    <button class="btn-details" onclick="event.stopPropagation(); window.openDetails('${p.id}')"><i class="fas fa-info-circle"></i></button>
                    ${isUnavailable?`<button class="btn-download" style="background:var(--text-secondary);color:#fff;cursor:not-allowed;opacity:0.4;" onclick="event.preventDefault();showToast('⛔ Unavailable','warning')"><i class="fas fa-times-circle"></i></button>`:(isFree?`<a href="${p.downloadLink||'#'}" class="btn-download" ${p.downloadLink?'target="_blank"':'onclick="event.preventDefault();showToast(\'⏳ Coming soon\',\'info\')"'}><i class="fas fa-download"></i></a>`:`<button class="btn-add-cart ${inCart?'added':''}" onclick="event.stopPropagation(); window.addToCart('${p.id}')"><i class="fas ${inCart?'fa-check':'fa-cart-plus'}"></i> ${inCart?qty:''}</button>`)}
                </div>
                <div class="product-footer-icons">
                    <span class="icon-item"><i class="fas fa-bolt"></i> Instant</span>
                    <span class="icon-item"><i class="fas fa-lock"></i> Secure</span>
                    <span class="icon-item"><i class="fas fa-headset"></i> 24/7</span>
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
    let recs = [];
    if (currentUser) {
        recs = getRecommendations(4);
        if (recs.length === 0) {
            recs = productsList.filter(p => p.price > 0).slice(0, 4);
        }
    } else {
        recs = productsList.filter(p => p.price > 0).slice(0, 4);
    }
    if (recs.length === 0) {
        grid.innerHTML = `<div class="rec-empty" style="grid-column:1/-1;text-align:center;padding:12px;color:var(--text-secondary);font-size:13px;">
            <i class="fas fa-lightbulb" style="display:block;font-size:24px;opacity:0.2;margin-bottom:4px;"></i>
            <p>Start exploring scripts!</p>
        </div>`;
        return;
    }
    grid.innerHTML = recs.map(p => `
        <div class="rec-item" onclick="window.openDetails('${p.id}')">
            <img src="${p.image||'https://picsum.photos/seed/default/200/120'}" alt="${p.name}" loading="lazy" />
            <div class="r-name">${p.name}</div>
            <div class="r-price">${p.price===0?'FREE':getCurrencySymbol(p.currency || 'USD') + p.price.toFixed(2)}</div>
        </div>
    `).join('');
}

// ============================================================
// CURRENCY, PRODUCT TYPE, QUANTITY, BADGE FUNCTIONS
// ============================================================
window.selectCurrency = function(currency) {
    document.querySelectorAll('.currency-option').forEach(el => {
        el.classList.toggle('active', el.dataset.currency === currency);
    });
    document.getElementById('productCurrency').value = currency;
};

window.selectProductType = function(type) {
    document.querySelectorAll('.type-option').forEach(el => {
        el.classList.toggle('active', el.dataset.type === type);
    });
    document.getElementById('productType').value = type;
    const container = document.getElementById('quantityOptionsContainer');
    if (type === 'quantity') {
        container.style.display = 'block';
        container.style.animation = 'slideIn 0.3s ease';
        if (document.querySelectorAll('.quantity-option-item').length === 0) {
            addQuantityOption();
        }
    } else {
        container.style.display = 'none';
    }
};

window.addQuantityOption = function() {
    const list = document.getElementById('quantityOptionsList');
    const index = document.querySelectorAll('.quantity-option-item').length;
    const div = document.createElement('div');
    div.className = 'quantity-option-item';
    div.innerHTML = `
        <span class="qty-label">Option ${index + 1}</span>
        <input type="number" class="qty-input" placeholder="Quantity" min="1" value="${index === 0 ? 500 : index === 1 ? 1000 : 5000}" />
        <div class="qty-price-group">
            <input type="number" class="qty-price" placeholder="Price" step="0.01" min="0" value="${index === 0 ? 5 : index === 1 ? 9 : 35}" />
            <input type="number" class="qty-original-price" placeholder="Original" step="0.01" min="0" value="${index === 0 ? 7 : index === 1 ? 12 : 50}" />
        </div>
        <button class="qty-remove" onclick="removeQuantityOption(this)"><i class="fas fa-times"></i></button>
    `;
    list.appendChild(div);
    updateQuantityOptionsUI();
};

window.removeQuantityOption = function(btn) {
    const item = btn.closest('.quantity-option-item');
    if (document.querySelectorAll('.quantity-option-item').length > 1) {
        item.remove();
        updateQuantityOptionsUI();
    } else {
        showToast('⚠️ You need at least one quantity option', 'warning');
    }
};

function updateQuantityOptionsUI() {
    document.querySelectorAll('.quantity-option-item').forEach((el, i) => {
        const label = el.querySelector('.qty-label');
        if (label) label.textContent = `Option ${i + 1}`;
    });
}

function getQuantityOptions() {
    const options = [];
    document.querySelectorAll('.quantity-option-item').forEach(el => {
        const quantity = parseInt(el.querySelector('.qty-input').value) || 0;
        const price = parseFloat(el.querySelector('.qty-price').value) || 0;
        const originalPrice = parseFloat(el.querySelector('.qty-original-price').value) || 0;
        if (quantity > 0 && price > 0) {
            options.push({ quantity, price, originalPrice });
        }
    });
    return options;
}

function setQuantityOptions(options) {
    const list = document.getElementById('quantityOptionsList');
    list.innerHTML = '';
    if (!options || options.length === 0) {
        addQuantityOption();
        return;
    }
    options.forEach((opt, index) => {
        const div = document.createElement('div');
        div.className = 'quantity-option-item';
        div.innerHTML = `
            <span class="qty-label">Option ${index + 1}</span>
            <input type="number" class="qty-input" placeholder="Quantity" min="1" value="${opt.quantity}" />
            <div class="qty-price-group">
                <input type="number" class="qty-price" placeholder="Price" step="0.01" min="0" value="${opt.price}" />
                <input type="number" class="qty-original-price" placeholder="Original" step="0.01" min="0" value="${opt.originalPrice || ''}" />
            </div>
            <button class="qty-remove" onclick="removeQuantityOption(this)"><i class="fas fa-times"></i></button>
        `;
        list.appendChild(div);
    });
    updateQuantityOptionsUI();
}

window.toggleBadge = function(badge) {
    const option = document.querySelector(`.badge-option[data-badge="${badge}"]`);
    if (!option) return;
    option.classList.toggle('selected');
    updateBadgesInput();
};

function updateBadgesInput() {
    const selected = [];
    document.querySelectorAll('.badge-option.selected').forEach(el => {
        selected.push(el.dataset.badge);
    });
    document.getElementById('productBadges').value = selected.join(',');
}

function setBadges(badges) {
    document.querySelectorAll('.badge-option').forEach(el => {
        const badge = el.dataset.badge;
        if (badges && badges.includes(badge)) {
            el.classList.add('selected');
        } else {
            el.classList.remove('selected');
        }
    });
    updateBadgesInput();
}

// ============================================================
// ADMIN FALLBACK PRODUCTS
// ============================================================
function renderFallbackProductsAdmin() {
    const container = document.getElementById('adminFallbackProducts');
    if (!container) return;
    container.innerHTML = `
        <div style="background:var(--glass-bg); backdrop-filter:blur(8px); border-radius:var(--radius-sm); padding:16px; border:1px solid var(--glass-border); margin-bottom:12px;">
            <h4 style="font-weight:700; margin-bottom:8px; color:var(--vip-color);">📦 Fallback Products</h4>
            <div style="font-size:12px; color:var(--text-secondary); opacity:0.6; margin-bottom:12px;">
                These products appear when no products exist in the database. You can edit or add new ones.
            </div>
        </div>
    `;
    fallbackProducts.forEach((p, index) => {
        const div = document.createElement('div');
        div.className = 'admin-item';
        div.innerHTML = `
            <div class="item-info">
                <div class="item-title">
                    <img src="${p.image || 'https://picsum.photos/seed/default/60/60'}" style="width:30px;height:30px;border-radius:6px;object-fit:cover;margin-right:8px;" />
                    ${p.name}
                    <span style="font-size:11px;font-weight:400;opacity:0.5;margin-left:6px;">${p.price === 0 ? 'FREE' : '$' + p.price}</span>
                    <span style="font-size:10px;padding:2px 8px;border-radius:12px;background:${p.badge === 'VIP' ? 'var(--vip-color)' : 'var(--free-color)'};color:#0a0a1a;margin-left:4px;">${p.badge || 'FREE'}</span>
                </div>
                <div class="item-meta">${p.description ? p.description.slice(0, 60) + '...' : ''}</div>
            </div>
            <div class="item-actions">
                <button class="btn-edit" onclick="editFallbackProduct(${index})"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" onclick="deleteFallbackProduct(${index})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        container.appendChild(div);
    });
    const addBtn = document.createElement('button');
    addBtn.className = 'add-btn';
    addBtn.style.marginTop = '8px';
    addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Fallback Product';
    addBtn.onclick = () => openAddFallbackProductModal();
    container.appendChild(addBtn);
}

window.editFallbackProduct = function(index) {
    const product = fallbackProducts[index];
    if (!product) { showToast('❌ Product not found', 'error'); return; }
    document.getElementById('fallbackProductId').value = index;
    document.getElementById('fallbackProductName').value = product.name || '';
    document.getElementById('fallbackProductPrice').value = product.price || 0;
    document.getElementById('fallbackProductBadge').value = product.badge || 'FREE';
    document.getElementById('fallbackProductStatus').value = product.status || 'available';
    document.getElementById('fallbackProductImage').value = product.image || '';
    document.getElementById('fallbackProductDescription').value = product.description || '';
    document.getElementById('fallbackProductFeatures').value = (product.features || []).join(', ');
    document.getElementById('fallbackProductVideo').value = product.video || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    document.getElementById('fallbackProductDownloadLink').value = product.downloadLink || '';
    document.getElementById('fallbackProductModalTitle').textContent = '✏️ Edit Fallback Product';
    document.getElementById('fallbackProductModal').classList.add('open');
};

window.openAddFallbackProductModal = function() {
    document.getElementById('fallbackProductId').value = '';
    document.getElementById('fallbackProductName').value = '';
    document.getElementById('fallbackProductPrice').value = 0;
    document.getElementById('fallbackProductBadge').value = 'FREE';
    document.getElementById('fallbackProductStatus').value = 'available';
    document.getElementById('fallbackProductImage').value = 'https://picsum.photos/seed/' + Math.random().toString(36).substring(2, 8) + '/400/300';
    document.getElementById('fallbackProductDescription').value = '';
    document.getElementById('fallbackProductFeatures').value = '';
    document.getElementById('fallbackProductVideo').value = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    document.getElementById('fallbackProductDownloadLink').value = '';
    document.getElementById('fallbackProductModalTitle').textContent = '➕ Add Fallback Product';
    document.getElementById('fallbackProductModal').classList.add('open');
};

window.closeFallbackProductModal = function() {
    document.getElementById('fallbackProductModal').classList.remove('open');
};

window.saveFallbackProduct = function() {
    const index = document.getElementById('fallbackProductId').value;
    const name = document.getElementById('fallbackProductName').value.trim();
    const price = parseFloat(document.getElementById('fallbackProductPrice').value) || 0;
    const badge = document.getElementById('fallbackProductBadge').value;
    const status = document.getElementById('fallbackProductStatus').value;
    const image = document.getElementById('fallbackProductImage').value.trim();
    const description = document.getElementById('fallbackProductDescription').value.trim();
    const featuresText = document.getElementById('fallbackProductFeatures').value.trim();
    const video = document.getElementById('fallbackProductVideo').value.trim();
    const downloadLink = document.getElementById('fallbackProductDownloadLink').value.trim();
    if (!name) { showToast('⚠️ Product name is required', 'warning'); return; }
    const features = featuresText ? featuresText.split(',').map(f => f.trim()).filter(f => f) : [];
    const productData = {
        id: 'fallback_' + Date.now(),
        name,
        price,
        badge,
        status,
        image,
        description,
        features,
        video,
        downloadLink,
        currency: 'USD',
        productType: 'standard',
        badges: ['new'],
        createdAt: new Date()
    };
    if (index !== '' && index >= 0 && index < fallbackProducts.length) {
        fallbackProducts[parseInt(index)] = { ...fallbackProducts[parseInt(index)], ...productData };
        showToast('✅ Fallback product updated!', 'success');
    } else {
        fallbackProducts.push(productData);
        showToast('✅ Fallback product added!', 'success');
    }
    if (products.length === 0 || products === fallbackProducts) {
        products = fallbackProducts;
        renderProducts(products, false);
    }
    closeFallbackProductModal();
    renderFallbackProductsAdmin();
};

window.deleteFallbackProduct = function(index) {
    if (!confirm('Delete this fallback product?')) return;
    fallbackProducts.splice(index, 1);
    if (products.length === 0 || products === fallbackProducts) {
        products = fallbackProducts;
        renderProducts(products, false);
    }
    renderFallbackProductsAdmin();
    showToast('🗑️ Fallback product deleted', 'success');
};

// ============================================================
// FEATURED PRODUCTS, CART, WISHLIST
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
    if (slice.length === 0) { featuredCurrentIndex = 0;
        displayFeaturedSlice(); return; }
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
            <div class="featured-item-price">${p.price === 0 ? 'FREE' : getCurrencySymbol(p.currency || 'USD') + p.price.toFixed(2)}</div>
        </div>
    `}).join('');
}

function startFeaturedRotation() { if (featuredRotationInterval) { clearInterval(featuredRotationInterval);
        featuredRotationInterval = null; } if (!featuredSettings.enabled || featuredProducts.length <= 4) return;
    featuredRotationInterval = setInterval(() => { featuredCurrentIndex = (featuredCurrentIndex + 4) % featuredProducts.length;
        displayFeaturedSlice(); }, featuredSettings.rotationInterval); }
function stopFeaturedRotation() { if (featuredRotationInterval) { clearInterval(featuredRotationInterval);
        featuredRotationInterval = null; } }

async function loadFeaturedSettings() {
    try {
        const settingsRef = doc(db, 'settings', 'featured');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) { const data = settingsSnap.data();
            featuredSettings = { ...featuredSettings, ...data }; }
        renderFeaturedProducts();
        if (featuredSettings.enabled) { startFeaturedRotation(); } else { stopFeaturedRotation(); }
    } catch (error) {
        console.error('Error loading featured settings:', error);
        if (error.code === 'permission-denied') { renderFeaturedProducts(); }
    }
}

// ============================================================
// CART MANAGEMENT
// ============================================================
function updateProductCardButton(productId) {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        const productCard = card.closest('.product-card');
        if (productCard) {
            const addBtn = productCard.querySelector('.btn-add-cart');
            if (addBtn) {
                const onclickAttr = addBtn.getAttribute('onclick');
                if (onclickAttr && onclickAttr.includes(`'${productId}'`)) {
                    addBtn.innerHTML = '<i class="fas fa-check"></i> View Cart';
                    addBtn.className = 'btn-add-cart added';
                    addBtn.onclick = function(e) {
                        e.stopPropagation();
                        openCartFull();
                    };
                }
            }
        }
    });
}

window.addToCart = async function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) { showToast('⚠️ Product not found', 'warning'); return; }
    if (product.productType === 'quantity') {
        const selectedQty = window._selectedQuantity || product.quantityOptions?.[0]?.quantity;
        const selectedPrice = window._selectedQuantityPrice || product.quantityOptions?.[0]?.price;
        if (!selectedQty || !selectedPrice) {
            showToast('⚠️ Please select a quantity option', 'warning');
            return;
        }
        const existing = cart.find(item => item.id === productId && item.selectedQuantity === selectedQty);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + 1;
        } else {
            cart.push({
                ...product,
                price: selectedPrice,
                quantity: 1,
                selectedQuantity: selectedQty,
                isQuantityProduct: true
            });
        }
        await saveUserData(true);
        updateCartUI();
        renderProducts(products);
        updateBottomCartBar();
        showToast(`✅ Added ${product.name} (${selectedQty}) to cart`, 'success');
        updateProductCardButton(productId);
        await logActivity('add_to_cart', { productId, productName: product.name, price: product.price, quantity: selectedQty });
        return;
    }
    if (product.price === 0) { showToast('⚠️ This script is free', 'warning'); return; }
    const existing = cart.find(item => item.id === productId && !item.isVip);
    if (existing) { existing.quantity = (existing.quantity || 1) + 1; } else { cart.push({ ...product, quantity: 1 }); }
    await saveUserData(true);
    updateCartUI();
    renderProducts(products);
    updateBottomCartBar();
    showToast(`✅ Added ${product.name} to cart`, 'success');
    updateProductCardButton(productId);
    await logActivity('add_to_cart', { productId, productName: product.name, price: product.price });
};

window.clearCart = async function() { if (cart.length === 0) return;
    cart = [];
    await saveUserData();
    updateCartUI();
    renderProducts(products);
    updateBottomCartBar();
    showToast('🗑️ Cart cleared', 'info'); };
window.removeFromCart = async function(productId) { cart = cart.filter(item => item.id !== productId);
    await saveUserData(true);
    updateCartUI();
    renderProducts(products);
    updateBottomCartBar();
    showToast('🗑️ Removed from cart', 'info'); };
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
    const count = document.getElementById('cartBadge');
    const totalItems = cart.reduce((s, i) => s + (i.quantity || 1), 0);
    if (count) count.textContent = totalItems;
    updateBottomCartBar();
    renderCartFull();
    updateFullUserMenu();
    renderProxyPackages();
}

// ============================================================
// RENDER CART FULL - WITH RP TOGGLE
// ============================================================
function renderCartFull() {
    const container = document.getElementById('cartFullContent');
    if (!container) return;
    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px 20px;color:var(--text-secondary);">
                <i class="fas fa-shopping-basket" style="font-size:48px;opacity:0.15;display:block;margin-bottom:12px;"></i>
                <div style="font-size:18px;font-weight:600;">Cart is empty</div>
                <div style="font-size:13px;opacity:0.4;margin-top:4px;">Start shopping to add items</div>
                <button onclick="closeCartFull();document.getElementById('productList').scrollIntoView({behavior:'smooth'})" 
                        style="margin-top:12px;padding:8px 24px;border:none;border-radius:var(--radius-sm);background:var(--primary);color:#fff;font-weight:700;cursor:pointer;">
                    <i class="fas fa-store"></i> Go to Store
                </button>
            </div>
        `;
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
        const qtyLabel = item.isQuantityProduct ? `📦 ${item.selectedQuantity || ''}` : '';
        const proxyLabel = item.isProxy ? ' 🌐' : '';
        html += `<div class="cart-item">
            <div class="ci-left">
                <img src="${image}" alt="${item.name}" />
                <div class="ci-info">
                    <div class="ci-name">${item.name} ${proxyLabel} ${vipLabel} ${qtyLabel}</div>
                    <div class="ci-price">${getCurrencySymbol(item.currency || 'USD')}${itemTotal.toFixed(2)}</div>
                </div>
            </div>
            <div class="ci-actions">
                <button onclick="updateCartQuantity('${item.id}',-1)">-</button>
                <span class="ci-qty">${qty}</span>
                <button onclick="updateCartQuantity('${item.id}',1)">+</button>
                <button class="ci-remove" onclick="removeFromCart('${item.id}')"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>`;
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
    <!-- RP SECTION WITH TOGGLE -->
    <div style="background:var(--bg);border-radius:10px;padding:12px;border:1px solid var(--border);margin:8px 0;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;font-size:13px;">
            <div style="display:flex;align-items:center;gap:8px;">
                <i class="fas fa-star" style="color:var(--vip-color);font-size:16px;"></i>
                <span style="color:var(--text-secondary);opacity:0.5;font-weight:500;">Loyalty Points (RP)</span>
            </div>
            <span style="color:var(--text);font-weight:700;font-size:14px;">
                ${userProfile.rp || 0} RP <span style="font-size:11px;opacity:0.4;font-weight:400;">(≈ $${((userProfile.rp || 0) * RP_TO_DOLLAR).toFixed(2)})</span>
            </span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;padding:4px 0;">
            <span style="font-size:12px;font-weight:500;color:var(--text-secondary);opacity:0.6;">
                <i class="fas fa-${userProfile.useRpForCart ? 'check-circle' : 'circle'}" style="color:${userProfile.useRpForCart ? 'var(--success)' : 'var(--text-secondary)'};"></i>
                ${userProfile.useRpForCart ? 'RP Discount Active' : 'Apply RP to cart'}
            </span>
            <div class="toggle-switch-rp ${userProfile.useRpForCart ? 'active' : ''}" onclick="toggleRpSwitch()">
                <div class="toggle-track-rp">
                    <div class="toggle-thumb-rp"></div>
                </div>
            </div>
        </div>
        ${userProfile.useRpForCart ? `
            <div style="font-size:11px;color:var(--success);margin-top:4px;background:var(--success-glow);padding:4px 10px;border-radius:6px;border:1px solid var(--success);">
                <i class="fas fa-check-circle"></i> $${rpDiscountAmount.toFixed(2)} RP discount applied
            </div>
        ` : `
            <div style="font-size:11px;color:var(--text-secondary);opacity:0.3;margin-top:4px;">
                <i class="fas fa-info-circle"></i> Use your loyalty points for a discount
            </div>
        `}
    </div>
    
    <!-- PROMO CODE -->
    <div style="background:var(--bg);border-radius:10px;padding:12px;border:1px solid var(--border);margin:8px 0;">
        <div style="display:flex;gap:6px;align-items:center;">
            <input id="cartPromoInput" placeholder="Enter promo code..." style="flex:1;padding:6px 10px;border:1px solid var(--border);border-radius:6px;background:var(--card-bg);color:var(--text);font-size:13px;outline:none;font-weight:500;" type="text" />
            <button onclick="applyCartPromo()" style="padding:6px 14px;border:none;border-radius:6px;background:var(--primary);color:#fff;font-weight:600;cursor:pointer;font-size:12px;transition:0.3s;white-space:nowrap;"><i class="fas fa-ticket-alt"></i> Apply</button>
        </div>
        <div class="promo-status" id="cartPromoStatus" style="font-size:11px;color:var(--text-secondary);opacity:0.4;margin-top:4px;font-weight:500;">
            ${activeDiscount > 0 ? `✅ ${activeDiscount}% discount active` : 'Enter a promo code for a discount'}
        </div>
    </div>
    
    <!-- TOTAL -->
    <div style="margin-top:12px;padding-top:12px;border-top:2px solid var(--border);">
        <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:14px;font-weight:500;">
            <span style="color:var(--text-secondary);opacity:0.5;">Subtotal</span>
            <span style="color:var(--text);font-weight:600;">$${total.toFixed(2)}</span>
        </div>
        ${rpDiscountAmount > 0 ? `
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:14px;color:var(--success);">
                <span style="color:var(--text-secondary);opacity:0.5;">🎯 RP discount (${Math.floor(rpDiscountAmount / RP_TO_DOLLAR)} RP)</span>
                <span style="font-weight:600;">-$${rpDiscountAmount.toFixed(2)}</span>
            </div>
        ` : ''}
        ${activeDiscount > 0 ? `
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:14px;color:var(--success);">
                <span style="color:var(--text-secondary);opacity:0.5;">🎫 Promo (${activeDiscount}%)</span>
                <span style="font-weight:600;">-$${promoDiscountAmount.toFixed(2)}</span>
            </div>
        ` : ''}
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-top:1px solid var(--border);margin-top:4px;padding-top:6px;font-size:18px;font-weight:700;">
            <span style="color:var(--text-secondary);opacity:0.5;">Total</span>
            <span style="color:var(--primary);">$${finalTotal.toFixed(2)}</span>
        </div>
        
        <!-- BUTTONS -->
        <div style="display:flex;align-items:center;gap:12px;margin-top:16px;">
            <button onclick="closeCartFull();checkoutWithBalance();" style="flex:1;padding:12px 16px;border:none;border-radius:var(--radius-sm);background:var(--vip-color);color:#0a0a1a;font-weight:700;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;gap:6px;transition:0.3s;">
                <i class="fas fa-wallet"></i> Pay with Balance
            </button>
            <button onclick="closeCartFull();checkout();" style="flex:1;padding:12px 16px;border:none;border-radius:var(--radius-sm);background:var(--primary);color:#fff;font-weight:700;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;gap:6px;transition:0.3s;">
                <i class="fas fa-credit-card"></i> Checkout
            </button>
        </div>
    </div>
    
    <div style="margin-top:16px;display:flex;justify-content:center;">
        <button onclick="closeCartFull();document.getElementById('productList').scrollIntoView({behavior:'smooth'})" 
                style="padding:8px 24px;border:none;border-radius:var(--radius-sm);background:var(--glass-bg);color:var(--text);font-weight:700;cursor:pointer;border:1px solid var(--glass-border);">
            <i class="fas fa-store"></i> Continue Shopping
        </button>
    </div>
    `;
    container.innerHTML = html;
}

// RP Toggle Switch Function
window.toggleRpSwitch = async function() {
    userProfile.useRpForCart = !userProfile.useRpForCart;
    await saveUserData();
    renderCartFull();
    updateBottomCartBar();
    const toggle = document.querySelector('.toggle-switch-rp');
    if (toggle) {
        if (userProfile.useRpForCart) {
            toggle.classList.add('active');
        } else {
            toggle.classList.remove('active');
        }
    }
    if (userProfile.useRpForCart) {
        showToast('✅ RP discount enabled!', 'success');
    } else {
        showToast('ℹ️ RP discount disabled', 'info');
    }
};

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

// ============================================================
// WISHLIST
// ============================================================
window.toggleWishlist = async function(productId) {
    const index = wishlist.indexOf(productId);
    const product = products.find(p => p.id === productId);
    if (index === -1) {
        wishlist.push(productId);
        createFloatingHearts();
        showToast(`❤️ Added ${product ? product.name : ''} to favorites`, 'success');
    } else {
        wishlist = wishlist.filter(id => id !== productId);
        showToast(`💔 Removed ${product ? product.name : ''} from favorites`, 'info');
    }
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
    if (wlCount === 0) { if (section) section.style.display = 'none'; if (grid) grid.innerHTML =
            `<div class="wishlist-empty"><i class="fas fa-heart"></i><p>No favorites yet</p></div>`; return; }
    if (section) section.style.display = 'block';
    const wlProducts = products.filter(p => wishlist.includes(p.id));
    if (grid) { grid.innerHTML = wlProducts.map(p =>
            `<div class="wishlist-item" style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:var(--bg);border-radius:8px;border:1px solid var(--border);transition:0.3s;"><img src="${p.image || 'https://picsum.photos/seed/default/60/60'}" style="width:30px;height:30px;border-radius:6px;object-fit:cover;" /><div class="info" style="flex:1;min-width:0;"><h4 style="font-size:11px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</h4><div class="price" style="font-size:10px;color:var(--primary);font-weight:700;">${p.price===0?'FREE':getCurrencySymbol(p.currency || 'USD') + p.price.toFixed(2)}</div></div><button class="remove-btn" onclick="window.removeFromWishlist('${p.id}')" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:11px;opacity:0.3;transition:0.3s;"><i class="fas fa-times"></i></button></div>`
        ).join(''); }
    updateFullUserMenu();
}

function createFloatingHearts() {
    let container = document.getElementById('floatingHearts');
    if (!container) {
        container = document.createElement('div');
        container.id = 'floatingHearts';
        container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
        document.body.appendChild(container);
    }
    const heartCount = 6;
    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = ['❤️', '💖', '💗', '💕', '♥️', '💝'][Math.floor(Math.random() * 6)];
        heart.style.left = (10 + Math.random() * 80) + '%';
        heart.style.top = (60 + Math.random() * 30) + '%';
        heart.style.fontSize = (16 + Math.random() * 20) + 'px';
        heart.style.animationDuration = (1.2 + Math.random() * 0.8) + 's';
        heart.style.position = 'absolute';
        heart.style.opacity = '1';
        heart.style.transition = 'all 2s ease-out';
        container.appendChild(heart);
        setTimeout(() => {
            heart.style.opacity = '0';
            heart.style.transform = 'translateY(-100px) scale(0.5)';
            setTimeout(() => heart.remove(), 2000);
        }, 2000);
    }
}

function renderWishlistFull() {
    const container = document.getElementById('wishlistFullContent');
    if (!container) return;
    if (wishlist.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px 20px;color:var(--text-secondary);">
                <i class="fas fa-heart" style="font-size:48px;opacity:0.15;display:block;margin-bottom:12px;"></i>
                <div style="font-size:18px;font-weight:600;">No favorites yet</div>
                <div style="font-size:13px;opacity:0.4;margin-top:4px;">Start adding products to your wishlist</div>
                <button onclick="closeWishlistFull();document.getElementById('productList').scrollIntoView({behavior:'smooth'})" 
                        style="margin-top:12px;padding:8px 24px;border:none;border-radius:var(--radius-sm);background:var(--primary);color:#fff;font-weight:700;cursor:pointer;">
                    <i class="fas fa-store"></i> Go to Store
                </button>
            </div>
        `;
        return;
    }
    const wlProducts = products.filter(p => wishlist.includes(p.id));
    container.innerHTML = `
        <div style="display:grid;gap:8px;">
            ${wlProducts.map(p => `
                <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg);border-radius:10px;border:1px solid var(--border);cursor:pointer;" 
                     onclick="window.openDetails('${p.id}');closeWishlistFull();">
                    <img src="${p.image || 'https://picsum.photos/seed/default/60/60'}" style="width:44px;height:44px;border-radius:8px;object-fit:cover;" />
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:14px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
                        <div style="font-size:12px;color:var(--primary);font-weight:700;">${p.price === 0 ? 'FREE' : getCurrencySymbol(p.currency || 'USD') + p.price.toFixed(2)}</div>
                    </div>
                    <button onclick="event.stopPropagation();removeFromWishlist('${p.id}')" 
                            style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:14px;opacity:0.3;padding:8px;transition:0.3s;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('')}
        </div>
        <div style="margin-top:16px;display:flex;justify-content:center;">
            <button onclick="closeWishlistFull();document.getElementById('productList').scrollIntoView({behavior:'smooth'})" 
                    style="padding:8px 24px;border:none;border-radius:var(--radius-sm);background:var(--primary);color:#fff;font-weight:700;cursor:pointer;">
                <i class="fas fa-store"></i> Go to Store
            </button>
        </div>
    `;
}

// ============================================================
// PRODUCT PREVIEW
// ============================================================
window.openDetails = function(id) {
    const p = products.find(x => x.id === id);
    if (!p) {
        showToast('⚠️ Product not found', 'warning');
        return;
    }
    window._currentProduct = p;
    const titleEl = document.getElementById('productDetailsTitle');
    if (titleEl) titleEl.textContent = p.name;
    const container = document.getElementById('productDetailsContent');
    if (!container) {
        console.error('❌ productDetailsContent not found');
        return;
    }
    logActivity('view_product', { productId: id, productName: p.name, price: p.price });
    const isFree = p.price === 0;
    const isUnavailable = p.status === 'unavailable';
    const badgeClass = isUnavailable ? 'unavailable' : (isFree ? 'free' : 'vip');
    const badgeText = isUnavailable ? '⛔ Unavailable' : (isFree ? 'FREE' : (p.badge || 'PREMIUM'));
    const currencySymbol = getCurrencySymbol(p.currency || 'USD');
    let videoHtml = '';
    if (p.video && p.video.includes('youtube.com/embed/')) {
        videoHtml = `
            <div style="margin:12px 0;border-radius:var(--radius-md);overflow:hidden;background:var(--bg-secondary);">
                <iframe src="${p.video}" width="100%" height="240" frameborder="0" allowfullscreen style="border-radius:var(--radius-md);"></iframe>
            </div>
        `;
    }
    let featuresHtml = '';
    if (p.features && p.features.length > 0) {
        featuresHtml = `
            <div style="margin:12px 0;background:var(--bg-secondary);border-radius:var(--radius-md);padding:14px 16px;border:1px solid var(--border);">
                <div style="font-weight:700;font-size:14px;margin-bottom:8px;color:var(--primary);">
                    <i class="fas fa-check-circle"></i> Features
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;">
                    ${p.features.map(f => `<div style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text-secondary);padding:3px 0;"><i class="fas fa-check-circle" style="color:var(--success);font-size:11px;"></i> ${f}</div>`).join('')}
                </div>
            </div>
        `;
    }
    let vipHtml = '';
    if (p.vipEnabled && p.vipPrices) {
        const plans = [
            { key: '1m', label: '1 Month', price: p.vipPrices['1m'], original: p.vipPrices['1m_original'] },
            { key: '3m', label: '3 Months', price: p.vipPrices['3m'], original: p.vipPrices['3m_original'] },
            { key: '1y', label: '1 Year', price: p.vipPrices['1y'], original: p.vipPrices['1y_original'] },
            { key: 'lifetime', label: 'LIFETIME', price: p.vipPrices['lifetime'], original: p.vipPrices['lifetime_original'] }
        ];
        let planHtml = '';
        let hasValid = false;
        plans.forEach((plan, idx) => {
            const priceNum = parseFloat(plan.price);
            if (priceNum > 0) {
                hasValid = true;
                const originalNum = parseFloat(plan.original);
                const discount = (originalNum > priceNum) ? Math.round((1 - priceNum / originalNum) * 100) : 0;
                planHtml += `
                    <div class="vip-plan ${idx === 0 ? 'selected' : ''}" data-plan="${plan.key}" data-price="${priceNum}" onclick="window.selectVipPlan(this, '${plan.key}')" style="background:var(--bg);border:2px solid var(--border);border-radius:var(--radius-sm);padding:10px 8px;text-align:center;cursor:pointer;transition:0.3s;position:relative;">
                        <div class="vip-plan-check" style="position:absolute;top:4px;right:6px;color:var(--vip-color);opacity:${idx===0?1:0};"><i class="fas fa-check-circle"></i></div>
                        <div style="font-weight:600;font-size:13px;">${plan.label}</div>
                        <div style="font-weight:700;color:var(--vip-color);font-size:15px;">${currencySymbol}${priceNum.toFixed(2)}</div>
                        ${discount > 0 ? `<div style="font-size:10px;text-decoration:line-through;opacity:0.3;">${currencySymbol}${originalNum.toFixed(2)}</div><div style="font-size:9px;background:var(--danger);color:#fff;border-radius:10px;padding:0 6px;display:inline-block;">SAVE ${discount}%</div>` : ''}
                    </div>
                `;
            }
        });
        if (hasValid) {
            window._selectedVipPlan = '1m';
            vipHtml = `
                <div style="margin:12px 0;background:var(--bg-secondary);border-radius:var(--radius-md);padding:14px 16px;border:1px solid var(--border);">
                    <div style="font-weight:700;font-size:14px;margin-bottom:8px;color:var(--vip-color);">
                        <i class="fas fa-crown"></i> VIP Plans
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:6px;">
                        ${planHtml}
                    </div>
                    <button class="vip-add-to-cart" onclick="addVipPlanToCart(window._currentProduct)" style="width:100%;margin-top:8px;padding:8px;border:none;border-radius:var(--radius-sm);background:var(--vip-color);color:#0a0a1a;font-weight:700;cursor:pointer;">
                        <i class="fas fa-crown"></i> Add VIP Plan
                    </button>
                </div>
            `;
        }
    }
    let quantityHtml = '';
    if (p.productType === 'quantity' && p.quantityOptions && p.quantityOptions.length > 0) {
        quantityHtml = `
            <div style="margin:12px 0;background:var(--bg-secondary);border-radius:var(--radius-md);padding:14px 16px;border:1px solid var(--border);">
                <div style="font-weight:700;font-size:14px;margin-bottom:8px;color:var(--text);">
                    <i class="fas fa-cubes"></i> Select Quantity
                </div>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:6px;" id="productQuantityOptions">
                    ${p.quantityOptions.map((opt, idx) => `
                        <div class="preview-quantity-option ${idx === 0 ? 'selected' : ''}" data-index="${idx}" data-quantity="${opt.quantity}" data-price="${opt.price}" onclick="selectQuantityOption(this, '${p.id}')" style="background:var(--bg);border:2px solid var(--border);border-radius:var(--radius-sm);padding:8px 4px;text-align:center;cursor:pointer;transition:0.3s;position:relative;">
                            <div style="font-size:16px;font-weight:700;color:var(--text);">${opt.quantity}</div>
                            <div style="font-weight:600;color:var(--primary);font-size:13px;">${currencySymbol}${opt.price.toFixed(2)}</div>
                            ${opt.originalPrice ? `<div style="font-size:10px;text-decoration:line-through;opacity:0.3;">${currencySymbol}${opt.originalPrice.toFixed(2)}</div>` : ''}
                            <div class="qty-check" style="position:absolute;top:2px;right:4px;color:var(--primary);opacity:${idx===0?1:0};"><i class="fas fa-check-circle"></i></div>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top:6px;font-size:12px;color:var(--text-secondary);opacity:0.4;">Click on a quantity to select it</div>
            </div>
        `;
        const firstOpt = p.quantityOptions[0];
        if (firstOpt) {
            window._selectedQuantity = firstOpt.quantity;
            window._selectedQuantityPrice = firstOpt.price;
        }
    }
    let priceDisplay = isFree ? 'FREE' : `${currencySymbol}${p.price.toFixed(2)}`;
    let originalPriceHtml = '';
    let discountBadgeHtml = '';
    if (activeDiscount > 0 && p.price > 0) {
        const discounted = p.price - (p.price * activeDiscount / 100);
        priceDisplay = `${currencySymbol}${discounted.toFixed(2)}`;
        originalPriceHtml = `<span style="font-size:14px;text-decoration:line-through;opacity:0.3;margin-left:8px;">${currencySymbol}${p.price.toFixed(2)}</span>`;
        discountBadgeHtml = `<span style="font-size:11px;background:var(--danger);color:#fff;padding:0 8px;border-radius:10px;margin-left:6px;">-${activeDiscount}%</span>`;
    }
    const isInCart = cart.some(item => item.id === id && !item.isVip);
    container.innerHTML = `
        <div style="max-width:600px;margin:0 auto;width:100%;">
            <div style="width:100%;border-radius:var(--radius-md);overflow:hidden;background:var(--bg-secondary);border:1px solid var(--border);margin-bottom:12px;">
                <img src="${p.image || 'https://picsum.photos/seed/default/600/400'}" alt="${p.name}" style="width:100%;max-height:320px;object-fit:cover;display:block;" />
                <div style="padding:8px 12px;display:flex;justify-content:space-between;align-items:center;background:var(--bg-secondary);border-top:1px solid var(--border);">
                    <span class="image-badge ${badgeClass}" style="padding:2px 14px;border-radius:20px;font-size:11px;font-weight:700;background:${badgeClass==='vip'?'var(--vip-color)':badgeClass==='free'?'var(--free-color)':'var(--danger)'};color:${badgeClass==='vip'||badgeClass==='free'?'#0a0a1a':'#fff'};">${badgeText}</span>
                    <span style="font-size:13px;color:var(--success);font-weight:600;">✅ ${p.status === 'available' ? '100% VERIFIED WORKING' : 'UNAVAILABLE'}</span>
                </div>
            </div>
            <h1 style="font-size:22px;font-weight:800;color:var(--text);margin:0 0 4px 0;">${p.name}</h1>
            ${p.duration ? `<div style="font-size:13px;color:var(--text-secondary);opacity:0.5;margin-bottom:6px;"><i class="fas fa-clock"></i> ${p.duration}</div>` : ''}
            <p style="font-size:14px;color:var(--text-secondary);line-height:1.6;margin:6px 0 12px 0;">${p.description || 'No description available for this product.'}</p>
            ${videoHtml}
            ${featuresHtml}
            ${quantityHtml}
            ${vipHtml}
            <div style="background:var(--bg-secondary);border-radius:var(--radius-md);padding:14px 16px;border:1px solid var(--border);margin:12px 0;">
                <div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:6px;">
                    <span style="font-size:24px;font-weight:800;color:var(--primary);">${priceDisplay}</span>
                    ${originalPriceHtml}
                    ${discountBadgeHtml}
                    ${isFree ? `<span style="font-size:12px;background:var(--free-color);padding:0 10px;border-radius:12px;color:#0a0a1a;font-weight:700;">FREE</span>` : ''}
                </div>
                <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                    ${isInCart ? `
                        <button onclick="closeProductDetails();openCartFull();" style="flex:1;padding:12px;border:none;border-radius:var(--radius-sm);background:var(--success);color:#0a0a1a;font-weight:700;cursor:pointer;font-size:16px;"><i class="fas fa-check"></i> View Cart</button>
                    ` : (isUnavailable ? `
                        <button style="flex:1;padding:12px;border:none;border-radius:var(--radius-sm);background:var(--text-secondary);color:#fff;font-weight:700;cursor:not-allowed;font-size:16px;opacity:0.4;"><i class="fas fa-times-circle"></i> Unavailable</button>
                    ` : (isFree ? `
                        <a href="${p.downloadLink || '#'}" target="${p.downloadLink ? '_blank' : '_self'}" style="flex:1;padding:12px;border:none;border-radius:var(--radius-sm);background:var(--free-color);color:#0a0a1a;font-weight:700;cursor:pointer;font-size:16px;text-decoration:none;text-align:center;display:block;" onclick="${!p.downloadLink ? 'event.preventDefault();showToast(\'⏳ Coming soon\',\'info\');' : ''}"><i class="fas fa-download"></i> Download</a>
                    ` : `
                        <button onclick="addToCartFromDetails()" style="flex:1;padding:12px;border:none;border-radius:var(--radius-sm);background:var(--primary);color:#fff;font-weight:700;cursor:pointer;font-size:16px;transition:0.3s;"><i class="fas fa-cart-plus"></i> Add to Cart</button>
                    `))}
                    <button onclick="openShareModal('${p.id}')" style="padding:12px 16px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--card-bg);color:var(--text);cursor:pointer;font-size:16px;transition:0.3s;"><i class="fas fa-share-alt"></i></button>
                </div>
            </div>
            <div style="margin-top:16px;padding:16px 20px;background:linear-gradient(135deg, rgba(108,92,231,0.1), rgba(249,202,36,0.08));border-radius:var(--radius-md);border:1px solid var(--glass-border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
                <div style="display:flex;align-items:center;gap:14px;">
                    <div style="width:56px;height:56px;border-radius:var(--radius-sm);overflow:hidden;background:var(--bg-secondary);flex-shrink:0;">
                        ${p.image ? `<img src="${p.image}" style="width:100%;height:100%;object-fit:cover;" />` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);opacity:0.3;"><i class="fas fa-box"></i></div>`}
                    </div>
                    <div>
                        <div style="font-weight:700;font-size:16px;color:var(--text);">${p.name}</div>
                        <div style="font-size:13px;color:var(--primary);font-weight:700;">${isFree ? 'FREE' : currencySymbol + p.price.toFixed(2)}</div>
                        <div style="font-size:11px;color:var(--text-secondary);opacity:0.5;">${p.status === 'available' ? '✅ In Stock' : '⛔ Unavailable'}</div>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:8px;">
                    ${isUnavailable ? `
                        <button style="padding:8px 20px;border:none;border-radius:var(--radius-sm);background:var(--text-secondary);color:#fff;font-weight:700;cursor:not-allowed;opacity:0.5;font-size:14px;" disabled>Unavailable</button>
                    ` : (isFree ? `
                        <a href="${p.downloadLink || '#'}" target="${p.downloadLink ? '_blank' : '_self'}" style="padding:8px 20px;border:none;border-radius:var(--radius-sm);background:var(--free-color);color:#0a0a1a;font-weight:700;text-decoration:none;font-size:14px;display:inline-flex;align-items:center;gap:6px;" onclick="${!p.downloadLink ? 'event.preventDefault();showToast(\'⏳ Coming soon\',\'info\');' : ''}">
                            <i class="fas fa-download"></i> Download
                        </a>
                    ` : (isInCart ? `
                        <button onclick="closeProductDetails();openCartFull();" style="padding:8px 20px;border:none;border-radius:var(--radius-sm);background:var(--success);color:#0a0a1a;font-weight:700;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:6px;">
                            <i class="fas fa-check"></i> View Cart
                        </button>
                    ` : `
                        <button onclick="addToCartFromDetails()" style="padding:8px 20px;border:none;border-radius:var(--radius-sm);background:var(--primary);color:#fff;font-weight:700;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:6px;transition:0.3s;">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                    `))}
                </div>
            </div>
            <div id="ratingSection" style="margin-top:8px;"></div>
            <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:12px;color:var(--text-secondary);opacity:0.3;margin-top:12px;padding-top:12px;border-top:1px solid var(--border);">
                <span><i class="fas fa-bolt"></i> Instant Delivery</span>
                <span><i class="fas fa-lock"></i> Secure Payment</span>
                <span><i class="fas fa-headset"></i> 24/7 Support</span>
                ${p.downloadLink ? `<span><i class="fas fa-file"></i> Download Available</span>` : ''}
            </div>
        </div>
    `;
    const modal = document.getElementById('productDetailsFull');
    if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    } else {
        console.error('❌ productDetailsFull modal not found');
    }
    setTimeout(() => {
        currentProductIdForRating = id;
        currentRating = 0;
        renderRatingSection(id);
    }, 150);
};

window.addToCartFromDetails = function() {
    if (window._currentProduct) {
        const p = window._currentProduct;
        if (p.productType === 'quantity') {
            const selectedQty = window._selectedQuantity || p.quantityOptions?.[0]?.quantity;
            const selectedPrice = window._selectedQuantityPrice || p.quantityOptions?.[0]?.price;
            if (!selectedQty || !selectedPrice) {
                showToast('⚠️ Please select a quantity option', 'warning');
                return;
            }
            const existing = cart.find(item => item.id === p.id && item.selectedQuantity === selectedQty);
            if (existing) {
                existing.quantity = (existing.quantity || 1) + 1;
            } else {
                cart.push({
                    ...p,
                    price: selectedPrice,
                    quantity: 1,
                    selectedQuantity: selectedQty,
                    isQuantityProduct: true
                });
            }
            saveUserData(true);
            updateCartUI();
            renderProducts(products);
            updateBottomCartBar();
            showToast(`✅ Added ${p.name} (${selectedQty}) to cart`, 'success');
            closeProductDetails();
            openCartFull();
            return;
        }
        if (p.price === 0) {
            showToast('⚠️ This script is free', 'warning');
            return;
        }
        const existing = cart.find(item => item.id === p.id && !item.isVip);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + 1;
        } else {
            cart.push({ ...p, quantity: 1 });
        }
        saveUserData(true);
        updateCartUI();
        renderProducts(products);
        updateBottomCartBar();
        showToast(`✅ Added ${p.name} to cart`, 'success');
        closeProductDetails();
        openCartFull();
    } else {
        showToast('⚠️ Product not found', 'warning');
    }
};

window.closeProductDetails = function() {
    const modal = document.getElementById('productDetailsFull');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
    window._currentProduct = null;
    window._selectedQuantity = null;
    window._selectedQuantityPrice = null;
};
window.closePreviewModal = window.closeProductDetails;

window.selectQuantityOption = function(element, productId) {
    const parent = element.closest('.preview-quantity-options') || element.closest('#productQuantityOptions');
    if (parent) {
        parent.querySelectorAll('.preview-quantity-option').forEach(el => el.classList.remove('selected'));
    } else {
        document.querySelectorAll('.preview-quantity-option').forEach(el => el.classList.remove('selected'));
    }
    element.classList.add('selected');
    const price = parseFloat(element.dataset.price);
    const quantity = parseInt(element.dataset.quantity);
    window._selectedQuantity = quantity;
    window._selectedQuantityPrice = price;
    const product = products.find(p => p.id === productId);
    if (product) {
        const currency = product.currency || 'USD';
    }
};

window.selectVipPlan = function(element, planKey) {
    const parent = element.closest('.vip-plan')?.parentElement;
    if (parent) {
        parent.querySelectorAll('.vip-plan').forEach(el => el.classList.remove('selected'));
    } else {
        document.querySelectorAll('.vip-plan').forEach(el => el.classList.remove('selected'));
    }
    element.classList.add('selected');
    window._selectedVipPlan = planKey;
};

window.addVipPlanToCart = function(product) {
    if (!product) {
        product = window._currentProduct;
        if (!product) {
            showToast('⚠️ Product not found', 'warning');
            return;
        }
    }
    const selectedPlan = window._selectedVipPlan || '1m';
    const vipPrices = product.vipPrices;
    if (!vipPrices || !vipPrices[selectedPlan]) {
        showToast('⚠️ Invalid VIP plan', 'warning');
        return;
    }
    const price = parseFloat(vipPrices[selectedPlan]);
    if (isNaN(price) || price <= 0) {
        showToast('⚠️ Invalid price', 'warning');
        return;
    }
    const planLabels = { '1m': '1 Month', '3m': '3 Months', '1y': '1 Year', 'lifetime': 'LIFETIME' };
    const existing = cart.find(item => item.id === product.id && item.isVip && item.vipPlan === selectedPlan);
    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
    } else {
        cart.push({
            ...product,
            price: price,
            quantity: 1,
            isVip: true,
            vipPlan: selectedPlan,
            vipPlanLabel: planLabels[selectedPlan] || selectedPlan,
            originalPrice: product.price
        });
    }
    saveUserData(true);
    updateCartUI();
    renderProducts(products);
    updateBottomCartBar();
    showToast(`✅ Added ${planLabels[selectedPlan]} VIP plan for ${product.name}`, 'success');
    closeProductDetails();
    openCartFull();
};

// ============================================================
// SHARE MODAL
// ============================================================
window.openShareModal = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    shareProduct = product;
    document.getElementById('shareProductInfo').innerHTML = `<div style="display:flex;align-items:center;gap:10px;justify-content:center;"><img src="${product.image||'https://picsum.photos/seed/default/80/80'}" style="width:44px;height:44px;border-radius:8px;object-fit:cover;" /><div><div style="font-size:15px;font-weight:600;color:var(--text);">${product.name}</div><div style="font-size:13px;color:var(--primary);font-weight:700;">${product.price===0?'FREE':getCurrencySymbol(product.currency || 'USD') + product.price.toFixed(2)}</div></div></div>`;
    document.getElementById('shareModal').classList.add('open');
};
window.closeShareModal = function() { document.getElementById('shareModal').classList.remove('open');
    shareProduct = null; };
window.shareToWhatsApp = function() { if (!shareProduct) return; const text =
        `🛒 *${shareProduct.name}*\n💰 Price: ${shareProduct.price===0?'FREE':shareProduct.price+' $'}\n📝 ${shareProduct.description||''}\n🔗 Visit the store to get it!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    closeShareModal(); };
window.shareToTelegram = function() { if (!shareProduct) return; const text =
        `🛒 *${shareProduct.name}*\n💰 Price: ${shareProduct.price===0?'FREE':shareProduct.price+' $'}\n📝 ${shareProduct.description||''}\n🔗 Visit the store to get it!`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`,
        '_blank');
    closeShareModal(); };
window.shareToFacebook = function() { if (!shareProduct) return;
    window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareProduct.name)}`,
        '_blank');
    closeShareModal(); };
window.copyShareLink = function() { const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => { showToast('✅ Link copied!', 'success');
        closeShareModal(); }).catch(() => { const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('✅ Link copied!', 'success');
        closeShareModal(); }); };

// ============================================================
// FILTER & SEARCH
// ============================================================
window.filterProducts = function(filter) {
    if (!filter) filter = 'all';
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => { btn.classList.toggle('active', btn.dataset.filter === filter); });
    renderProducts(products, false);
};

const searchInput = document.getElementById('liveSearchInput');
const searchResults = document.getElementById('searchResults');
const searchClear = document.getElementById('searchClear');
searchInput.addEventListener('input', function() {
    if (this.value.length > 0) { searchClear.classList.add('visible'); } else { searchClear.classList.remove('visible');
        searchResults.classList.remove('active'); }
    performLiveSearch(this.value);
});

function performLiveSearch(query) {
    const searchTerm = query.trim().toLowerCase();
    if (!searchTerm) { searchResults.classList.remove('active'); return; }
    const results = products.filter(p => p.name.toLowerCase().includes(searchTerm) || (p.description && p.description
        .toLowerCase().includes(searchTerm)));
    results.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aStartsWith = aName.startsWith(searchTerm);
        const bStartsWith = bName.startsWith(searchTerm);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return aName.indexOf(searchTerm) - bName.indexOf(searchTerm);
    });
    if (results.length === 0) { searchResults.innerHTML =
            `<div style="text-align:center;padding:16px;color:var(--text-secondary);"><i class="fas fa-search" style="font-size:24px;opacity:0.2;display:block;margin-bottom:4px;"></i><div style="font-size:14px;font-weight:600;">No results</div><div style="font-size:12px;opacity:0.4;">No products match "${searchTerm}"</div></div>`;
        searchResults.classList.add('active'); return; }
    searchResults.innerHTML = results.slice(0, 10).map(p => {
        const isFree = p.price === 0;
        const isUnavailable = p.status === 'unavailable';
        const priceDisplay = isUnavailable ? '⛔ Unavailable' : (isFree ? 'FREE' : getCurrencySymbol(p.currency || 'USD') + p.price.toFixed(2));
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
window.clearSearch = function() { searchInput.value = '';
    searchClear.classList.remove('visible');
    searchResults.classList.remove('active');
    searchInput.focus(); };

function closeSearchResults() { searchResults.classList.remove('active');
    searchInput.value = '';
    searchClear.classList.remove('visible'); }
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') { closeSearchResults();
        closeUserMenuFull();
        closeCartFull();
        closeWishlistFull();
        closeProfileFull();
        closeHistoryFull(); } });

// ============================================================
// PAYMENT FUNCTIONS
// ============================================================
window.renderPaymentProducts = function() {
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
        const qtyLabel = item.isQuantityProduct ? `📦 ${item.selectedQuantity || ''}` : '';
        const proxyLabel = item.isProxy ? ' 🌐' : '';
        return `
            <div style="display:flex;align-items:center;gap:10px;background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:var(--radius-sm);padding:10px 12px;margin-bottom:8px;">
                <img src="${image}" alt="${item.name}" style="width:44px;height:44px;border-radius:var(--radius-sm);object-fit:cover;" />
                <div style="flex:1;">
                    <div style="font-weight:700;font-size:14px;color:var(--text);">${name} ${proxyLabel} ${qtyLabel}</div>
                    <div style="font-size:12px;color:var(--primary);font-weight:700;">${getCurrencySymbol(item.currency || 'USD')}${total.toFixed(2)}</div>
                </div>
                <div style="font-size:12px;color:var(--text-secondary);opacity:0.4;font-weight:500;">×${qty}</div>
            </div>
        `;
    }).join('');
};

async function fetchCryptoPrices() {
    if (cryptoPrices.isUpdating) return;
    cryptoPrices.isUpdating = true;
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=litecoin&vs_currencies=usd');
        if (response.ok) {
            const data = await response.json();
            if (data.litecoin && data.litecoin.usd) {
                cryptoPrices.ltc = data.litecoin.usd;
                cryptoPrices.usdt = 1;
                cryptoPrices.lastUpdate = new Date();
                updatePriceUI();
                cryptoPrices.isUpdating = false;
                return;
            }
        }
    } catch (e) { console.warn('⚠️ CoinGecko failed, trying Binance...', e); }
    try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=LTCUSDT');
        if (response.ok) {
            const data = await response.json();
            if (data && data.price) {
                cryptoPrices.ltc = parseFloat(data.price);
                cryptoPrices.usdt = 1;
                cryptoPrices.lastUpdate = new Date();
                updatePriceUI();
                cryptoPrices.isUpdating = false;
                return;
            }
        }
    } catch (e) { console.warn('⚠️ Binance failed:', e); }
    if (!cryptoPrices.ltc) { cryptoPrices.ltc = 42;
        cryptoPrices.usdt = 1; }
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
    let total = 0;
    cart.forEach(item => { const qty = item.quantity || 1;
        total += item.price * qty; });
    let finalTotal = total;
    if (userProfile.useRpForCart) { const rpDiscount = Math.min((userProfile.rp || 0) * RP_TO_DOLLAR, total);
        finalTotal = total - rpDiscount; }
    if (activeDiscount > 0 && total > 0) { const discountAmount = (finalTotal * activeDiscount) / 100;
        finalTotal = finalTotal - discountAmount; }
    if (finalTotal < 0) finalTotal = 0;
    const el = document.getElementById('payableTotal');
    if (el) el.textContent = '$' + finalTotal.toFixed(2);
}

window.selectPayment = function(method) {
    selectedPayment = method;
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
    const optionMap = {
        'litecoin': 'optionLitecoin',
        'usdt': 'optionUsdt',
        'telegram': 'optionTelegram',
        'binanceId': 'optionBinanceId',
        'balance': 'optionBalance'
    };
    const optionEl = document.getElementById(optionMap[method]);
    if (optionEl) optionEl.classList.add('selected');
    if (method === 'balance') {
        loadUserBalance();
        const sub = document.getElementById('balancePaymentSub');
        if (sub) sub.textContent = `$${userBalance.toFixed(2)} available`;
    }
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
    if (!selectedPayment) {
        showToast('⚠️ Please select a payment method', 'warning');
        return;
    }
    document.getElementById('paymentStep1').style.display = 'none';
    document.getElementById('paymentStep2').style.display = 'block';
    window.renderPaymentProducts();
    let total = 0;
    cart.forEach(item => {
        const qty = item.quantity || 1;
        total += item.price * qty;
    });
    let finalTotal = total;
    document.getElementById('step2Subtotal').textContent = `$${total.toFixed(2)}`;
    document.getElementById('step2Total').textContent = `$${finalTotal.toFixed(2)}`;
    const instructionsContainer = document.getElementById('paymentInstructionsContainer');
    if (instructionsContainer) instructionsContainer.style.display = 'block';
    const walletInfo = document.getElementById('paymentWalletInfo');
    const txInput = document.getElementById('paymentTxInput');
    const telegramContact = document.getElementById('paymentTelegramContact');
    const binanceSection = document.getElementById('paymentBinanceIdSection');
    const mainBtn = document.getElementById('mainConfirmBtn');
    if (walletInfo) walletInfo.style.display = 'none';
    if (txInput) txInput.style.display = 'none';
    if (telegramContact) telegramContact.style.display = 'none';
    if (binanceSection) binanceSection.style.display = 'none';
    if (mainBtn) mainBtn.style.display = 'none';
    if (selectedPayment === 'litecoin' || selectedPayment === 'usdt') {
        if (walletInfo) walletInfo.style.display = 'block';
        if (txInput) txInput.style.display = 'block';
        if (mainBtn) {
            mainBtn.style.display = 'block';
            const ltcPrice = cryptoPrices.ltc || 42;
            let amountDisplay = '',
                currencyDisplay = '';
            if (selectedPayment === 'litecoin') {
                const ltcAmount = finalTotal / ltcPrice;
                amountDisplay = ltcAmount.toFixed(4);
                currencyDisplay = 'LTC';
                mainBtn.innerHTML = `<i class="fas fa-check"></i> Place Order - ${amountDisplay} ${currencyDisplay}`;
            } else if (selectedPayment === 'usdt') {
                amountDisplay = finalTotal.toFixed(2);
                currencyDisplay = 'USDT';
                mainBtn.innerHTML = `<i class="fas fa-check"></i> Place Order - ${amountDisplay} ${currencyDisplay}`;
            }
            mainBtn.onclick = function() {
                const btn = this;
                showButtonLoading(btn, 'Placing order...');
                placeOrder();
            };
        }
        fetchCryptoPrices();
        setTimeout(updatePriceUI, 500);
    } else if (selectedPayment === 'telegram') {
        if (telegramContact) telegramContact.style.display = 'block';
        if (mainBtn) {
            mainBtn.style.display = 'block';
            mainBtn.innerHTML = `<i class="fab fa-telegram-plane"></i> Contact via Telegram - $${finalTotal.toFixed(2)}`;
            mainBtn.onclick = function() {
                const btn = this;
                showButtonLoading(btn, 'Sending...');
                const message = `🛒 New Order\n\nTotal: $${finalTotal.toFixed(2)}\nProducts: ${cart.map(i => i.name).join(', ')}`;
                window.open(`https://t.me/Mitalica69?text=${encodeURIComponent(message)}`, '_blank');
                placeOrderTelegram();
                hideButtonLoading(btn);
            };
        }
    } else if (selectedPayment === 'binanceId') {
        if (binanceSection) {
            binanceSection.style.display = 'block';
            document.getElementById('binanceIdDisplay').textContent = '748838383';
            document.getElementById('binanceIdInline').textContent = '748838383';
            const totalDisplay = `$${finalTotal.toFixed(2)}`;
            document.getElementById('binanceAmountDisplay').textContent = totalDisplay;
            document.getElementById('binanceAmountInline').textContent = totalDisplay;
            const orderId = '#' + String(Date.now()).slice(-6);
            document.getElementById('binanceOrderDisplay').textContent = orderId;
        }
    } else if (selectedPayment === 'balance') {
        if (userBalance < finalTotal) {
            showToast(`⚠️ Insufficient balance! Need $${finalTotal.toFixed(2)}, have $${userBalance.toFixed(2)}`, 'warning');
            setTimeout(() => openTopupModal(), 500);
            return;
        }
        processBalancePayment(finalTotal);
        return;
    }
};

// ============================================================
// PROCESS BALANCE PAYMENT
// ============================================================
async function processBalancePayment(totalAmount) {
    if (!currentUser) {
        showToast('⚠️ Please login first', 'warning');
        return;
    }
    if (isProcessingOrder) {
        showToast('⏳ Order is already being processed...', 'warning');
        return;
    }
    const btn = document.getElementById('mainConfirmBtn');
    showButtonLoading(btn, 'Processing payment...');
    isProcessingOrder = true;
    try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
            balance: userBalance - totalAmount,
            updatedAt: serverTimestamp()
        });
        userBalance = userBalance - totalAmount;
        userProfile.balance = userBalance;
        updateBalanceDisplay();
        const orderId = 'order_' + Date.now();
        const orderItem = {
            id: orderId,
            items: cart.map(item => ({ ...item })),
            total: totalAmount,
            method: 'balance',
            date: new Date().toISOString(),
            status: 'confirmed',
        };
        userProfile.history.push(orderItem);
        await updateDoc(userRef, { history: arrayUnion(orderItem) });
        try {
            await supabase.from('transactions').insert({
                user_id: currentUser.uid,
                user_email: currentUser.email,
                amount: parseFloat(totalAmount),
                type: 'purchase',
                description: `Order #${orderId.slice(-6)} - Balance Payment`,
                status: 'completed',
                order_id: orderId,
                created_at: new Date().toISOString()
            });
            console.log('✅ Transaction record created for balance payment');
        } catch (txError) {
            console.error('Failed to create transaction record:', txError);
        }
        const visitorInfo = await getVisitorInfo();
        const deviceInfo = getDeviceInfo();
        await sendOrderConfirmationEmail(currentUser.email, {
            orderId: orderId,
            userName: currentUser.displayName || currentUser.email,
            items: orderItem.items,
            total: totalAmount,
            method: 'balance',
            status: 'confirmed',
            txHash: null
        });
        const adminMessage = `
👤 *User:* ${currentUser.displayName || currentUser.email || 'User'}
📧 *Email:* ${currentUser.email || 'N/A'}
💰 *Total:* $${totalAmount.toFixed(2)}
💳 *Payment Method:* balance
📦 *Items:* ${orderItem.items.map(i => i.name).join(', ')}
📅 *Date:* ${new Date().toLocaleString()}
🌐 *Location:* ${visitorInfo.country}, ${visitorInfo.city}
🔔 *Status:* Confirmed (Balance Payment)
        `;
        await sendAdminNotification('✅ Order Paid with Balance', adminMessage);
        if (userProfile.telegramChatId) {
            const userTelegramMessage = `
<b>🛒 ORDER PAID WITH BALANCE!</b>

📋 <b>Order ID:</b> #${orderId.slice(-6)}
💰 <b>Total:</b> $${totalAmount.toFixed(2)}
💳 <b>Payment Method:</b> Balance
📦 <b>Items:</b> ${orderItem.items.map(item => `${item.name} x${item.quantity}`).join(', ')}

📅 <b>Date:</b> ${new Date().toLocaleString()}

✅ Your order has been confirmed and completed.
🔑 Your licences are now available in your profile.
            `;
            await sendTelegramNotification(userProfile.telegramChatId, userTelegramMessage);
        }
        for (const item of orderItem.items) {
            await generateLicenceForUser(currentUser.uid, currentUser.email, item, orderId);
        }
        await logActivity('purchase', { orderId, total: totalAmount, items: orderItem.items.length });
        showToast({
            title: '✅ Payment Successful!',
            orderId: orderId.slice(-6),
            details: orderItem.items.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1
            })),
            total: totalAmount,
            method: 'Balance',
            date: new Date().toLocaleString()
        }, 'success', 8000, true);
        cart = [];
        await saveUserData();
        updateCartUI();
        updateBottomCartBar();
        renderProducts(products);
        showToast(`✅ Payment successful! $${totalAmount.toFixed(2)} deducted from balance.`, 'success');
        await addDoc(collection(db, 'notifications'), {
            title: '✅ Order Paid with Balance',
            message: `Order #${orderId.slice(-6)} - $${totalAmount.toFixed(2)}`,
            userId: currentUser.uid,
            readBy: [],
            createdAt: serverTimestamp()
        });
        document.getElementById('paymentModal').classList.remove('open');
        hideButtonLoading(btn, 'Done!');
        loadUserData();
        updateFullUserMenu();
    } catch (error) {
        console.error('Balance payment error:', error);
        hideButtonLoading(btn);
        showToast('❌ Error: ' + error.message, 'error');
    } finally {
        isProcessingOrder = false;
    }
}

// ============================================================
// SEND ADMIN NOTIFICATION
// ============================================================
async function sendAdminNotification(title, message) {
    try {
        const settings = await getAdminSettings();
        let sentCount = 0;
        if (settings.enableEmailNotifications && settings.adminEmail) {
            try {
                await sendAdminNotificationEmail(title, message);
                sentCount++;
                console.log('✅ Email sent to admin:', settings.adminEmail);
            } catch (error) {
                console.error('❌ Failed to send email:', error);
            }
        }
        if (settings.enableTelegramNotifications && settings.adminTelegramChatId) {
            try {
                await sendTelegramNotification(settings.adminTelegramChatId, `📢 *${title}*\n\n${message}`);
                sentCount++;
                console.log('✅ Telegram sent to admin');
            } catch (error) {
                console.error('❌ Failed to send Telegram:', error);
            }
        }
        try {
            await addDoc(collection(db, 'notifications'), {
                title: title,
                message: message,
                adminOnly: true,
                readBy: [],
                createdAt: serverTimestamp()
            });
            sentCount++;
            console.log('✅ Firebase notification added for admin');
        } catch (error) {
            console.error('❌ Failed to add Firebase notification:', error);
        }
        return sentCount > 0;
    } catch (error) {
        console.error('❌ Error sending admin notification:', error);
        return false;
    }
}
window.sendAdminNotification = sendAdminNotification;

// ============================================================
// PLACE ORDER
// ============================================================
window.placeOrder = function() {
    const btn = document.getElementById('mainConfirmBtn');
    if (btn) showButtonLoading(btn, 'Placing order...');
    if (!currentUser || currentUser.isAnonymous) {
        showToast('⚠️ Please sign in to confirm payment.', 'warning');
        openAuthModal();
        if (btn) hideButtonLoading(btn);
        return;
    }
    let txHash = '';
    if (selectedPayment === 'binanceId') {
        txHash = document.getElementById('txHashInput').value.trim();
        if (!txHash) {
            showToast('⚠️ Please paste the transaction ID', 'warning');
            document.getElementById('txHashInput').style.borderColor = 'var(--danger)';
            setTimeout(() => { document.getElementById('txHashInput').style.borderColor = ''; }, 2000);
            if (btn) hideButtonLoading(btn);
            return;
        }
    } else if (selectedPayment === 'litecoin' || selectedPayment === 'usdt') {
        txHash = document.getElementById('transactionHashInput').value.trim();
        if (!txHash) {
            showToast('⚠️ Please paste the transaction hash', 'warning');
            document.getElementById('transactionHashInput').style.borderColor = 'var(--danger)';
            setTimeout(() => { document.getElementById('transactionHashInput').style.borderColor = ''; }, 2000);
            if (btn) hideButtonLoading(btn);
            return;
        }
    } else if (selectedPayment === 'telegram') {
        placeOrderTelegram();
        if (btn) hideButtonLoading(btn);
        return;
    }
    sendOrderToTelegram(selectedPayment, txHash, btn);
};

async function sendOrderToTelegram(method, txHash = null, btn = null) {
    if (isProcessingOrder) {
        showToast('⏳ Order is already being processed...', 'warning');
        if (btn) hideButtonLoading(btn);
        return;
    }
    isProcessingOrder = true;
    try {
        if (!currentUser) { showToast('⚠️ Please login first', 'warning'); return; }
        if (currentUser.isAnonymous) {
            showToast('⚠️ Please sign in to place an order.', 'warning');
            openAuthModal();
            if (btn) hideButtonLoading(btn);
            return;
        }
        console.log('📦 Starting order process...');
        const visitorInfo = await getVisitorInfo();
        const deviceInfo = getDeviceInfo();
        let screenshotBase64 = null;
        const screenshotInput = document.getElementById('screenshotInput');
        if (screenshotInput && screenshotInput.files && screenshotInput.files[0]) {
            const file = screenshotInput.files[0];
            try {
                screenshotBase64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const base64 = e.target.result.split(',')[1];
                        resolve(base64);
                    };
                    reader.onerror = () => resolve(null);
                    reader.readAsDataURL(file);
                });
                if (screenshotBase64) {
                    console.log('📸 Screenshot loaded, size:', screenshotBase64.length);
                } else {
                    console.warn('⚠️ Failed to read screenshot');
                }
            } catch (e) {
                console.error('Error reading screenshot:', e);
            }
        }
        const cartData = cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1,
            currency: item.currency || 'USD',
            isVip: item.isVip || false,
            vipPlan: item.vipPlan || null,
            vipPlanLabel: item.vipPlanLabel || null,
            selectedQuantity: item.selectedQuantity || null,
            isQuantityProduct: item.isQuantityProduct || false,
            isProxy: item.isProxy || false,
            proxyPlan: item.plan || null,
            proxyDuration: item.duration || null,
            proxyQuantity: item.quantity || 1
        }));
        let total = 0;
        cart.forEach(item => { total += item.price * (item.quantity || 1); });
        let finalTotal = total;
        console.log('💰 Total:', finalTotal);
        const fraudCheck = await detectFraud({
            userId: currentUser.uid,
            email: currentUser.email,
            total: finalTotal,
            items: cartData,
            ip: visitorInfo.ip
        });
        if (fraudCheck.isSuspicious && fraudCheck.severity === 'high') {
            showToast('⚠️ Order flagged for review. Please contact support.', 'warning');
            isProcessingOrder = false;
            if (btn) hideButtonLoading(btn);
            return;
        }
        const response = await fetch('https://kvsyzgavfxnwqmtsginv.supabase.co/functions/v1/place-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Accept': 'application/json',
            },
            mode: 'cors',
            body: JSON.stringify({
                cart: cartData,
                user: {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    name: currentUser.displayName || currentUser.email || 'User',
                    telegramChatId: userProfile.telegramChatId || null
                },
                method: method,
                txHash: txHash,
                screenshotBase64: screenshotBase64,
                total: finalTotal,
                visitorInfo: visitorInfo,
                deviceInfo: deviceInfo,
                rpUsed: 0,
                discountCode: null
            })
        });
        if (!response.ok) {
            let errorText = await response.text();
            console.error('Order API error:', response.status, errorText);
            try {
                const errorJson = JSON.parse(errorText);
                errorText = errorJson.error || errorText;
            } catch (e) {}
            showToast('❌ ' + errorText, 'error');
            throw new Error(`Request failed: ${response.status} - ${errorText}`);
        }
        const result = await response.json();
        if (!result.success) throw new Error(result.error || 'Request failed');
        const orderId = result.orderId || 'order_' + Date.now();
        console.log('✅ Order placed successfully, ID:', orderId);
        const orderItem = {
            id: orderId,
            items: cartData,
            total: finalTotal,
            method: method,
            date: new Date().toISOString(),
            status: 'pending',
            txHash: txHash || null,
            screenshotUrl: result.screenshotUrl || null,
            rpUsed: 0,
            rpEarned: 0
        };
        userProfile.history.push(orderItem);
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, { history: arrayUnion(orderItem) });
        try {
            const txData = {
                user_id: currentUser.uid,
                user_email: currentUser.email,
                amount: parseFloat(finalTotal),
                type: 'purchase',
                description: `Order #${orderId.slice(-6)} - Pending Confirmation`,
                status: 'pending',
                order_id: orderId,
                created_at: new Date().toISOString()
            };
            const { error: txError } = await supabase.from('transactions').insert(txData);
            if (txError) {
                console.error('Failed to create transaction record:', txError);
            } else {
                console.log('✅ Transaction record created for order (pending)');
            }
        } catch (txError) {
            console.error('Exception creating transaction record:', txError);
        }
        await sendOrderConfirmationEmail(currentUser.email, {
            orderId: orderId,
            userName: currentUser.displayName || currentUser.email,
            items: cartData,
            total: finalTotal,
            method: method,
            status: 'pending',
            txHash: txHash
        });
        try {
            await addDoc(collection(db, 'notifications'), {
                title: '🆕 New Order Placed',
                message: `Order #${orderId.slice(-6)} - Total: $${finalTotal.toFixed(2)}`,
                userId: currentUser.uid,
                readBy: [],
                createdAt: serverTimestamp()
            });
            console.log('✅ Firebase notification sent to user');
        } catch (error) {
            console.error('Failed to send Firebase user notification:', error);
        }
        try {
            await addDoc(collection(db, 'notifications'), {
                title: '📦 New Order Received',
                message: `Order #${orderId.slice(-6)} from ${currentUser.email} - $${finalTotal.toFixed(2)}`,
                adminOnly: true,
                readBy: [],
                createdAt: serverTimestamp()
            });
            console.log('✅ Firebase global notification sent');
        } catch (error) {
            console.error('Failed to send Firebase global notification:', error);
        }
        console.log('📤 Preparing Telegram notification...');
        const userTelegramMessage = `
<b>🛒 ORDER PLACED SUCCESSFULLY!</b>

📋 <b>Order ID:</b> #${orderId.slice(-6)}
💰 <b>Total:</b> $${finalTotal.toFixed(2)}
💳 <b>Payment Method:</b> ${method}
📦 <b>Items:</b> ${cartData.map(item => `${item.name} x${item.quantity}`).join(', ')}

${txHash ? `🔗 <b>TX Hash:</b> <code>${txHash}</code>` : ''}
📅 <b>Date:</b> ${new Date().toLocaleString()}

⏳ Your order is pending admin confirmation.
🔑 You will receive your licence once the order is confirmed.
        `;
        const adminTelegramMessage = `
<b>🛒 NEW ORDER RECEIVED!</b>

📋 <b>Order ID:</b> #${orderId.slice(-6)}
👤 <b>User:</b> ${currentUser.displayName || currentUser.email || 'User'}
📧 <b>Email:</b> ${currentUser.email || 'N/A'}
💰 <b>Total:</b> $${finalTotal.toFixed(2)}
💳 <b>Payment Method:</b> ${method}
📦 <b>Items:</b> ${cartData.map(item => `${item.name} x${item.quantity}`).join(', ')}

${txHash ? `🔗 <b>TX Hash:</b> <code>${txHash}</code>` : ''}
📅 <b>Date:</b> ${new Date().toLocaleString()}

🌐 <b>Location:</b> ${visitorInfo.country}, ${visitorInfo.city}
📱 <b>Device:</b> ${deviceInfo.device} (${deviceInfo.os} / ${deviceInfo.browser})

🔔 <b>Status:</b> Pending - Awaiting confirmation
        `;
        if (userProfile.telegramChatId) {
            try {
                console.log('📤 Sending Telegram to user...');
                const sent = await sendTelegramNotification(userProfile.telegramChatId, userTelegramMessage);
                if (sent) {
                    console.log('✅ Telegram sent to user');
                } else {
                    console.warn('⚠️ Telegram to user failed (but order saved)');
                }
            } catch (error) {
                console.error('❌ Error sending Telegram to user:', error);
            }
        } else {
            console.log('ℹ️ User has no Telegram linked');
        }
        const adminMessage = `
👤 *User:* ${currentUser.displayName || currentUser.email || 'User'}
📧 *Email:* ${currentUser.email || 'N/A'}
💰 *Total:* $${finalTotal.toFixed(2)}
💳 *Payment Method:* ${method}
📦 *Items:* ${cartData.map(item => `${item.name} x${item.quantity}`).join(', ')}
${txHash ? `🔗 *TX Hash:* ${txHash}` : ''}
📅 *Date:* ${new Date().toLocaleString()}
🌐 *Location:* ${visitorInfo.country}, ${visitorInfo.city}
🔔 *Status:* Pending - Awaiting confirmation
        `;
        await sendAdminNotification('📦 New Order Received', adminMessage);
        await logActivity('purchase', { orderId, total: finalTotal, items: cartData.length, method, status: 'pending' });
        const proxyItems = cart.filter(item => item.isProxy);
        if (proxyItems.length > 0 && DISABLE_PROXY) {
            console.log('ℹ️ Proxy creation is disabled.');
            showToast('📦 Proxy details will be sent within 24 hours.', 'info');
            await addDoc(collection(db, 'notifications'), {
                title: 'ℹ️ Proxy request pending',
                message: `User: ${currentUser.email} - ${proxyItems.length} proxies`,
                userId: currentUser.uid,
                readBy: [],
                createdAt: serverTimestamp()
            });
        }
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
        showToast(`✅ Order placed successfully! Waiting for admin confirmation.`, 'success');
        if (btn) hideButtonLoading(btn, 'Order placed!');
        setTimeout(() => {
            if (currentUser && isAdminCached) { loadAdminOrders(); }
            loadUserData();
            updateDropdownStats();
            updateFullUserMenu();
        }, 1000);
    } catch (error) {
        console.error('❌ Order error:', error);
        showToast('❌ Error placing order: ' + error.message, 'error');
        if (btn) hideButtonLoading(btn);
    } finally {
        isProcessingOrder = false;
    }
}

window.placeOrderTelegram = function() {
    if (!currentUser) { showToast('⚠️ Please login first', 'warning'); return; }
    const message =
        `🛒 New Order\n\nTotal: $${document.getElementById('step2Total')?.textContent || '0.00'}\nProducts: ${cart.map(i => i.name).join(', ')}`;
    window.open(`https://t.me/Mitalica69?text=${encodeURIComponent(message)}`, '_blank');
    showToast('📨 Please send the message to complete your order.', 'info');
    setTimeout(() => {
        document.getElementById('paymentModal').classList.remove('open');
        cart = [];
        updateCartUI();
        updateBottomCartBar();
        renderProducts(products);
        showToast('✅ Order submitted via Telegram!', 'success');
    }, 1500);
};

// ============================================================
// TELEGRAM FUNCTIONS
// ============================================================
async function sendTelegramNotification(chatId, message) {
    if (!chatId) {
        console.log('⚠️ No chatId provided');
        return false;
    }
    try {
        console.log('📤 Sending Telegram to:', chatId);
        if (message.length > 4096) {
            message = message.substring(0, 4000) + '... (truncated)';
        }
        const response = await fetch('https://kvsyzgavfxnwqmtsginv.supabase.co/functions/v1/send-telegram', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Accept': 'application/json',
            },
            mode: 'cors',
            body: JSON.stringify({
                chatId: chatId,
                message: message,
                parse_mode: 'HTML'
            })
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Telegram API error:', response.status, errorText);
            return false;
        }
        const result = await response.json();
        console.log('✅ Telegram response:', result);
        return result.success || false;
    } catch (error) {
        console.error('Send error:', error);
        return false;
    }
}

window.bindTelegram = async function() {
    if (!currentUser) { showToast('⚠️ Please login first', 'warning'); return; }
    try {
        const bindCode = currentUser.uid.slice(-8) + Math.random().toString(36).substring(2, 6);
        const bindRef = doc(db, 'telegram_binds', bindCode);
        await setDoc(bindRef, { userId: currentUser.uid, userEmail: currentUser.email,
            userName: currentUser.displayName || 'User', createdAt: serverTimestamp(), status: 'pending' });
        window.open(`https://t.me/${BOT_USERNAME}?start=bind`, '_blank');
        showToast('📨 Open bot and press "Start" then "Link Account".', 'success');
        startBindingListener(bindCode);
    } catch (error) { console.error('Telegram bind error:', error);
        showToast('❌ Connection error', 'error'); }
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
                unsubscribe();
            }
        }
    });
}

window.testTelegramNotification = async function() {
    if (!currentUser) { showToast('⚠️ Please login first', 'warning'); return; }
    if (!userProfile.telegramChatId) { showToast('⚠️ No Telegram linked', 'warning'); return; }
    showToast('📤 Test notification sent via backend.', 'info');
    try {
        const response = await fetch('https://kvsyzgavfxnwqmtsginv.supabase.co/functions/v1/send-test-notification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Accept': 'application/json',
            },
            mode: 'cors',
            body: JSON.stringify({
                userId: currentUser.uid,
                chatId: userProfile.telegramChatId
            })
        });
        const result = await response.json();
        if (result.success) {
            showToast('✅ Test notification sent!', 'success');
        } else {
            showToast('❌ Failed to send test: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('❌ Error: ' + error.message, 'error');
    }
};

window.unlinkTelegram = async function() {
    if (!currentUser || !userProfile.telegramChatId) return;
    if (!confirm('Are you sure you want to unlink your Telegram account?')) return;
    try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, { telegramChatId: '', telegram: '', updatedAt: serverTimestamp() });
        userProfile.telegramChatId = '';
        userProfile.telegram = '';
        await saveUserData();
        renderProfileFull();
        updateFullUserMenu();
        updateUI();
        showToast('✅ Telegram unlinked!', 'success');
    } catch (error) { showToast('❌ Error unlinking: ' + error.message, 'error'); }
};

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
            showToast(`✅ Telegram is linked!\n📱 Chat ID: ${maskedId}\n👤 Username: ${username || 'Not set'}`,
            'success');
            renderProfileFull();
            updateFullUserMenu();
        } else {
            showToast('❌ Telegram is NOT linked.\n\nPlease click "Link Bot" to connect your account.',
            'warning');
        }
        await saveUserData();
    } catch (error) { console.error('❌ Error checking Telegram status:', error);
        showToast('❌ Failed to check Telegram status: ' + error.message, 'error'); }
};

// ============================================================
// PROXY FUNCTIONS
// ============================================================
function renderProxyPackages() {
    const container = document.getElementById('proxyPackages');
    if (!container) return;
    container.innerHTML = proxyPackages.map(pkg => {
        const isInCart = cart.some(item => item.id === pkg.id && item.isProxy);
        return `
            <div class="proxy-card">
                <div class="proxy-icon">🌐</div>
                <div class="proxy-name">${pkg.name}</div>
                <div class="proxy-meta">${pkg.quantity} proxies · ${pkg.duration} days</div>
                <div class="proxy-price">$${pkg.price.toFixed(2)}</div>
                <button class="proxy-btn ${isInCart ? 'added' : ''}" onclick="addProxyToCart('${pkg.id}')">
                    ${isInCart ? '✅ Added' : 'Add to Cart'}
                </button>
            </div>
        `;
    }).join('');
}

window.addProxyToCart = function(packageId) {
    const pkg = proxyPackages.find(p => p.id === packageId);
    if (!pkg) { showToast('⚠️ Package not found', 'warning'); return; }
    const existing = cart.find(item => item.id === packageId && item.isProxy);
    if (existing) {
        showToast('⚠️ Already in cart', 'warning');
        return;
    }
    cart.push({
        ...pkg,
        isProxy: true,
        quantity: 1,
        currency: 'USD',
    });
    saveUserData(true);
    updateCartUI();
    renderProxyPackages();
    showToast(`✅ Added ${pkg.name} to cart`, 'success');
    updateProductCardButton(packageId);
};

// ============================================================
// DOWNLOADS & NOTIFICATIONS
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
    if (downloads.length === 0) { container.innerHTML =
            `<div style="text-align:center;padding:40px 20px;color:var(--text-secondary);"><i class="fas fa-file" style="font-size:48px;opacity:0.15;display:block;margin-bottom:12px;"></i><div style="font-size:18px;font-weight:600;">No downloads</div><div style="font-size:13px;opacity:0.4;margin-top:4px;">Stay tuned for new content</div></div>`;
        return; }
    container.innerHTML = downloads.map(d => {
        const date = d.date || (d.createdAt ? new Date(d.createdAt.toDate()).toLocaleDateString('en-US',
            { month: 'short', day: 'numeric', year: 'numeric' }) : '');
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:var(--bg);border-radius:10px;border:1px solid var(--border);margin-bottom:8px;"><div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:600;color:var(--text);">${d.title}</div><div style="font-size:11px;color:var(--text-secondary);opacity:0.4;">${d.type||'File'} • ${date}</div></div><a href="${d.downloadUrl||'#'}" target="_blank" style="padding:6px 16px;border:none;border-radius:8px;background:var(--free-color);color:#0a0a1a;font-weight:600;cursor:pointer;font-size:12px;text-decoration:none;transition:0.3s;"><i class="fas fa-download"></i></a></div>`;
    }).join('');
}

function renderAdminDownloads() {
    const container = document.getElementById('adminDownloadsList');
    if (!container) return;
    if (downloads.length === 0) { container.innerHTML =
            `<div style="text-align:center;padding:30px;color:var(--text-secondary);">📭 No downloads</div>`;
        return; }
    container.innerHTML = downloads.map(d =>
        `<div class="admin-item"><div class="item-info"><div class="item-title">${d.title}</div><div class="item-meta">${d.type||'File'} • ${d.downloadUrl||'No link'}</div></div><div class="item-actions"><button class="btn-edit" onclick="editDownload('${d.id}')"><i class="fas fa-edit"></i></button><button class="btn-delete" onclick="deleteDownload('${d.id}')"><i class="fas fa-trash"></i></button></div></div>`
        ).join('');
}

window.createDownload = async function(e) {
    e.preventDefault();
    if (!currentUser || !isAdminCached) { showToast('⛔ Unauthorized', 'error'); return; }
    const title = document.getElementById('dlTitle').value.trim();
    const type = document.getElementById('dlType').value.trim();
    const description = document.getElementById('dlDescription').value.trim();
    const downloadUrl = document.getElementById('dlUrl').value.trim();
    const date = document.getElementById('dlDate').value;
    if (!title || !type || !description || !downloadUrl) { showToast('⚠️ Please fill all fields',
        'warning'); return; }
    try {
        await addDoc(collection(db, 'downloads'), { title, type, description, downloadUrl,
            date: date || new Date().toISOString().split('T')[0], createdAt: serverTimestamp(),
            updatedAt: serverTimestamp() });
        showToast('✅ Download added', 'success');
        closeCreateDownloadModal();
        document.getElementById('createDownloadForm').reset();
    } catch (error) { showToast('❌ Error: ' + error.message, 'error'); }
};
window.deleteDownload = async function(id) {
    if (!currentUser || !isAdminCached) { showToast('⛔ Unauthorized', 'error'); return; }
    if (!confirm('Delete this download?')) return;
    try { await deleteDoc(doc(db, 'downloads', id));
        showToast('🗑️ Download deleted', 'success'); } catch (error) { showToast('❌ Error: ' + error.message,
            'error'); }
};
window.editDownload = function(id) { showToast('✏️ Edit feature coming soon', 'info'); };
window.openCreateDownloadModal = function() { if (!currentUser || !isAdminCached) { showToast('⛔ Unauthorized',
        'error'); return; } document.getElementById('createDownloadModal').classList.add('open');
    document.getElementById('createDownloadForm').reset(); };
window.closeCreateDownloadModal = function() { document.getElementById('createDownloadModal').classList.remove(
    'open'); };

// ============================================================
// LOAD NOTIFICATIONS
// ============================================================
function loadNotifications() {
    if (unsubscribeNotifications) { unsubscribeNotifications(); }
    const notifRef = collection(db, 'notifications');
    try {
        getDocs(query(notifRef, orderBy('createdAt', 'desc'))).then((snapshot) => {
            notifications = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                const isAdmin = isAdminCached;
                const isUserNotification = data.userId === currentUser?.uid;
                const isAdminNotification = data.adminOnly === true && isAdmin;
                if (isUserNotification || isAdminNotification) {
                    notifications.push({ id: doc.id, ...data, readBy: data.readBy || [] });
                }
            });
            if (currentUser) {
                const userId = currentUser.uid;
                unreadNotifications = notifications.filter(n => !(n.readBy || []).includes(userId))
                    .length;
            } else { unreadNotifications = 0; }
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
                const isAdmin = isAdminCached;
                const isUserNotification = data.userId === currentUser?.uid;
                const isAdminNotification = data.adminOnly === true && isAdmin;
                if (isUserNotification || isAdminNotification) {
                    notifications.push({ id: doc.id, ...data, readBy: data.readBy || [] });
                }
            });
            if (currentUser) {
                const userId = currentUser.uid;
                unreadNotifications = notifications.filter(n => !(n.readBy || []).includes(userId))
                    .length;
            } else { unreadNotifications = 0; }
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
        `<div style="text-align:center;padding:40px 20px;color:var(--text-secondary);"><i class="fas fa-bell" style="font-size:48px;opacity:0.15;display:block;margin-bottom:12px;"></i><div style="font-size:18px;font-weight:600;">No notifications</div><div style="font-size:13px;opacity:0.4;margin-top:4px;">Notifications will appear here</div></div>`;
}

function renderUserNotifications() {
    const container = document.getElementById('notificationsList');
    if (!container) return;
    const userNotifs = notifications.filter(n => n.userId === currentUser?.uid);
    if (!userNotifs || userNotifs.length === 0) {
        container.innerHTML =
            `<div style="text-align:center;padding:40px 20px;color:var(--text-secondary);"><i class="fas fa-bell" style="font-size:48px;opacity:0.15;display:block;margin-bottom:12px;"></i><div style="font-size:18px;font-weight:600;">No notifications</div><div style="font-size:13px;opacity:0.4;margin-top:4px;">Notifications will appear here</div></div>`;
        return;
    }
    let html = '';
    userNotifs.forEach(n => {
        const isRead = currentUser && (n.readBy || []).includes(currentUser.uid);
        let dateStr = '';
        try { if (n.createdAt) { const date = n.createdAt.toDate ? n.createdAt.toDate() : new Date(n
                    .createdAt);
                dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric',
                    year: 'numeric' }); } } catch (e) { dateStr = new Date().toLocaleDateString(
                'en-US'); }
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
        if (allNotifs.length === 0) { container.innerHTML =
                `<div style="text-align:center;padding:30px;color:var(--text-secondary);">📭 No notifications</div>`;
            return; }
        container.innerHTML = allNotifs.map(n =>
            `<div class="admin-item"><div class="item-info"><div class="item-title">${n.title||'Notification'}</div><div class="item-meta">${n.message||''} ${n.userId ? '• User: ' + n.userId.slice(-6) : ''} ${n.adminOnly ? '🔒 Admin' : ''} • ${n.createdAt?new Date(n.createdAt.toDate()).toLocaleDateString('en-US'):''}</div></div><div class="item-actions"><button class="btn-delete" onclick="deleteNotification('${n.id}')"><i class="fas fa-trash"></i></button></div></div>`
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
window.clearAllNotifications = async function() {
    if (!currentUser) { showToast('⚠️ Please login first', 'warning'); return; }
    try {
        const notifRef = collection(db, 'notifications');
        const snapshot = await getDocs(query(notifRef, where('userId', '==', currentUser.uid)));
        const batch = [];
        snapshot.forEach((doc) => { batch.push(deleteDoc(doc.ref)); });
        await Promise.all(batch);
        notifications = notifications.filter(n => n.userId !== currentUser.uid);
        unreadNotifications = 0;
        updateNotificationBadge();
        renderUserNotifications();
        renderAdminNotifications();
        showToast('🗑️ All notifications cleared', 'success');
    } catch (error) { console.error('Error clearing notifications:', error);
        showToast('❌ Error clearing notifications', 'error'); }
};
window.createNotification = async function(e) {
    e.preventDefault();
    if (!currentUser || !isAdminCached) { showToast('⛔ Unauthorized', 'error'); return; }
    const title = document.getElementById('notifTitle').value.trim();
    const message = document.getElementById('notifMessage').value.trim();
    if (!title || !message) { showToast('⚠️ Please fill all fields', 'warning'); return; }
    try {
        await addDoc(collection(db, 'notifications'), { title, message, readBy: [],
            createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        showToast('✅ Notification sent', 'success');
        closeCreateNotificationModal();
        document.getElementById('createNotificationForm').reset();
    } catch (error) { showToast('❌ Error: ' + error.message, 'error'); }
};
window.deleteNotification = async function(id) {
    if (!currentUser || !isAdminCached) { showToast('⛔ Unauthorized', 'error'); return; }
    if (!confirm('Delete this notification?')) return;
    try { await deleteDoc(doc(db, 'notifications', id));
        showToast('🗑️ Notification deleted', 'success'); } catch (error) { showToast('❌ Error: ' + error.message,
            'error'); }
};
window.openCreateNotificationModal = function() { if (!currentUser || !isAdminCached) { showToast('⛔ Unauthorized',
        'error'); return; } document.getElementById('createNotificationModal').classList.add('open');
    document.getElementById('createNotificationForm').reset(); };
window.closeCreateNotificationModal = function() { document.getElementById('createNotificationModal').classList
    .remove('open'); };

// ============================================================
// REQUESTS & REFERRALS
// ============================================================
window.openRequestsModal = function() {
    if (!currentUser) {
        showToast('⚠️ Please login first', 'warning');
        openAuthModal();
        return;
    }
    const list = document.getElementById('requestsList');
    const requests = userProfile.requests || [];

    let html = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
            <span style="font-size:14px;font-weight:600;color:var(--text-secondary);">${requests.length} requests</span>
            <button onclick="openNewRequestModal()" style="padding:8px 20px;border:none;border-radius:var(--radius-sm);background:var(--primary);color:#fff;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;">
                <i class="fas fa-plus-circle"></i> Request New
            </button>
        </div>
    `;

    if (requests.length === 0) {
        html += `
            <div style="text-align:center;padding:40px 20px;color:var(--text-secondary);">
                <i class="fas fa-inbox" style="font-size:48px;opacity:0.15;display:block;margin-bottom:12px;"></i>
                <div style="font-size:18px;font-weight:600;">No requests</div>
                <div style="font-size:13px;opacity:0.4;margin-top:4px;">Submit your first request now</div>
            </div>
        `;
    } else {
        html += requests.slice().reverse().map(req => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:var(--bg);border-radius:10px;border:1px solid var(--border);margin-bottom:8px;">
                <div>
                    <div style="font-weight:600;color:var(--text);">${req.gameName || 'Untitled'}</div>
                    <div style="font-size:12px;color:var(--text-secondary);opacity:0.4;">${new Date(req.date).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})}</div>
                </div>
                <span style="font-size:11px;font-weight:600;padding:2px 12px;border-radius:12px;background:var(--pending-color);color:#0a0a1a;">${(req.status || 'pending').charAt(0).toUpperCase() + (req.status || 'pending').slice(1)}</span>
            </div>
        `).join('');
    }

    list.innerHTML = html;
    document.getElementById('requestsModal').classList.add('open');
};

window.closeRequestsModal = function() { document.getElementById('requestsModal').classList.remove('open'); };
window.openNewRequestModal = function() { if (!currentUser) { showToast('⚠️ Please login first', 'warning');
        openAuthModal(); return; } document.getElementById('newRequestModal').classList.add('open');
    document.getElementById('requestForm').reset(); };
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

window.openReferralModal = function() {
    if (!currentUser) {
        showToast('⚠️ Please login first', 'warning');
        openAuthModal();
        return;
    }
    updateReferralUI();
    document.getElementById('referralModal').classList.add('open');
};

window.closeReferralModal = function() {
    document.getElementById('referralModal').classList.remove('open');
};

function updateReferralUI() {
    const container = document.getElementById('referralContent');
    if (!container) {
        console.warn('⚠️ referralContent not found');
        return;
    }

    if (!currentUser) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px 20px;color:var(--text-secondary);">
                <i class="fas fa-users" style="font-size:48px;opacity:0.15;display:block;margin-bottom:12px;"></i>
                <div style="font-size:18px;font-weight:600;">Please login</div>
                <div style="font-size:13px;opacity:0.4;margin-top:4px;">Login to view your referral info</div>
            </div>
        `;
        return;
    }

    let code = userProfile.referralCode;
    if (!code) {
        code = generateReferralCode(currentUser.displayName || currentUser.email, currentUser.email);
        userProfile.referralCode = code;
        const userRef = doc(db, 'users', currentUser.uid);
        updateDoc(userRef, { referralCode: code }).catch(console.error);
    }

    const referrals = userProfile.referrals || [];
    const rewards = userProfile.referralRewards || 0;

    let activityHtml = '';
    if (referrals.length === 0) {
        activityHtml = `
            <div style="text-align:center;padding:20px;color:var(--text-secondary);opacity:0.5;">
                <i class="fas fa-users" style="font-size:30px;display:block;margin-bottom:6px;opacity:0.2;"></i>
                No referrals yet. Share your code!
            </div>
        `;
    } else {
        activityHtml = referrals.slice().reverse().map(ref => {
            const date = ref.date ? new Date(ref.date).toLocaleDateString('en-US', { month: 'short',
                    day: 'numeric' }) : '--';
            return `
                <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--glass-border);">
                    <div style="width:32px;height:32px;border-radius:50%;background:var(--primary-glow);display:flex;align-items:center;justify-content:center;color:var(--primary);">
                        <i class="fas fa-user-plus"></i>
                    </div>
                    <div style="flex:1;">
                        <div style="font-weight:600;font-size:13px;">${ref.name || 'User'}</div>
                        <div style="font-size:11px;color:var(--text-secondary);opacity:0.4;">${date}</div>
                    </div>
                    <span style="font-size:11px;background:var(--success);color:#0a0a1a;padding:2px 12px;border-radius:30px;font-weight:700;">✅ Joined</span>
                </div>
            `;
        }).join('');
    }

    container.innerHTML = `
        <div style="background:var(--glass-bg);backdrop-filter:blur(12px);border-radius:var(--radius-md);padding:20px;border:1px solid var(--glass-border);margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                <div>
                    <div style="font-size:14px;color:var(--text-secondary);font-weight:500;">Your Referral Code</div>
                    <div style="font-size:28px;font-weight:900;color:var(--primary);letter-spacing:2px;font-family:monospace;" id="referralCodeDisplay2">${code}</div>
                </div>
                <button onclick="copyReferralCode2()" style="padding:8px 20px;border:none;border-radius:var(--radius-sm);background:var(--primary);color:#fff;font-weight:700;cursor:pointer;">
                    <i class="fas fa-copy"></i> Copy
                </button>
            </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
            <div style="background:var(--glass-bg);backdrop-filter:blur(8px);border-radius:var(--radius-sm);padding:14px;text-align:center;border:1px solid var(--glass-border);">
                <div style="font-size:32px;font-weight:900;color:var(--primary);" id="referralCount2">${referrals.length}</div>
                <div style="font-size:12px;color:var(--text-secondary);font-weight:500;">Total Referrals</div>
            </div>
            <div style="background:var(--glass-bg);backdrop-filter:blur(8px);border-radius:var(--radius-sm);padding:14px;text-align:center;border:1px solid var(--glass-border);">
                <div style="font-size:32px;font-weight:900;color:var(--vip-color);" id="referralRewards2">$${rewards.toFixed(2)}</div>
                <div style="font-size:12px;color:var(--text-secondary);font-weight:500;">Rewards Earned</div>
            </div>
        </div>

        <div style="background:var(--glass-bg);backdrop-filter:blur(8px);border-radius:var(--radius-md);padding:16px;border:1px solid var(--glass-border);margin-bottom:16px;">
            <div style="font-weight:700;font-size:16px;margin-bottom:8px;">📋 Referral Activity</div>
            <div id="referralActivity">${activityHtml}</div>
        </div>

        <div style="background:var(--glass-bg);backdrop-filter:blur(8px);border-radius:var(--radius-md);padding:16px;border:1px solid var(--glass-border);">
            <div style="font-weight:700;font-size:16px;margin-bottom:8px;">📌 How It Works</div>
            <div id="referralSteps" style="display:flex;flex-direction:column;gap:6px;">
                <div style="display:flex;align-items:center;gap:10px;background:var(--bg);padding:8px 12px;border-radius:8px;border:1px solid var(--glass-border);">
                    <span style="width:24px;height:24px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;">1</span>
                    <span style="font-weight:500;font-size:13px;">Share your referral code</span>
                </div>
                <div style="display:flex;align-items:center;gap:10px;background:var(--bg);padding:8px 12px;border-radius:8px;border:1px solid var(--glass-border);">
                    <span style="width:24px;height:24px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;">2</span>
                    <span style="font-weight:500;font-size:13px;">They create an account using your code</span>
                </div>
                <div style="display:flex;align-items:center;gap:10px;background:var(--bg);padding:8px 12px;border-radius:8px;border:1px solid var(--glass-border);">
                    <span style="width:24px;height:24px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;">3</span>
                    <span style="font-weight:500;font-size:13px;">Earn 10% of their first order as rewards</span>
                </div>
            </div>
        </div>
    `;
}

window.copyReferralCode2 = function() {
    const codeDisplay = document.getElementById('referralCodeDisplay2');
    if (!codeDisplay) { showToast('⚠️ Referral code not found', 'warning'); return; }
    const code = codeDisplay.textContent;
    if (code && code !== 'Loading...' && code !== 'Login to get your code') {
        navigator.clipboard.writeText(code).then(() => { showToast('✅ Referral code copied!', 'success'); })
            .catch(() => { const textArea = document.createElement('textarea');
                textArea.value = code;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showToast('✅ Referral code copied!', 'success'); });
    } else { showToast('⚠️ Please login first', 'warning'); }
};

// ============================================================
// ADMIN PANEL
// ============================================================
window.openAdminPanel = function() {
    if (!currentUser || !isAdminCached) {
        showToast('⛔ Unauthorized. Admin only.', 'error');
        return;
    }
    const panel = document.getElementById('adminPanel');
    if (!panel) {
        showToast('❌ Admin panel not found in DOM', 'error');
        console.error('❌ adminPanel element not found');
        return;
    }
    if (panel.classList.contains('open')) {
        panel.classList.remove('open');
        document.body.style.overflow = '';
        return;
    }
    panel.classList.add('open');
    document.body.style.overflow = 'hidden';
    switchAdminTab('dashboard');
    loadAdminOrders();
    startAdminRealtimeListener();
    loadDownloads();
    loadNotifications();
    renderAdminProducts(products);
    loadAdminUsers();
    loadLicences();
    loadDashboardStats();
    loadAdminTopups();
    renderFallbackProductsAdmin();
    loadCoupons();
    setTimeout(addBannerAdminControls, 300);
    loadSliderSettings();
    renderSliderSettingsUI();
    document.getElementById('sliderIntervalInput').value = sliderIntervalTime;
    loadMarqueeSettings();
    renderMarqueeSettingsUI();
};

window.closeAdminPanel = function() {
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.classList.remove('open');
        document.body.style.overflow = '';
    }
    if (unsubscribeAdmin) {
        unsubscribeAdmin();
        unsubscribeAdmin = null;
    }
};

// ============================================================
// switchAdminTab - COMPLETE VERSION
// ============================================================
window.switchAdminTab = function(tab) {
    document.querySelectorAll('#adminPanel .admin-tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('#adminPanel .admin-nav-btn').forEach(el => el.classList.remove('active'));

    const tabMap = {
        'dashboard': 'tabDashboard',
        'orders': 'tabOrders',
        'products': 'tabProducts',
        'users': 'tabUsers',
        'downloads': 'tabDownloads',
        'notifications': 'tabNotifications',
        'stats': 'tabStats',
        'logs': 'tabLogs',
        'activity': 'tabActivity',
        'fraud': 'tabFraud',
        'slider': 'tabSlider',
        'licences': 'tabLicences',
        'marquee': 'tabMarquee',
        'payments': 'tabPayments',
        'topups': 'tabTopups',
        'fallback': 'tabFallback',
        'settings': 'tabSettings',
        'coupons': 'tabCoupons',
        'emails': 'tabEmails',
        'branding': 'tabBranding'
    };
    const tabId = tabMap[tab] || 'tabDashboard';
    const content = document.getElementById(tabId);
    if (content) content.classList.add('active');

    const btn = document.querySelector(`#adminPanel .admin-nav-btn[data-tab="${tab}"]`);
    if (btn) btn.classList.add('active');

    const titles = {
        'dashboard': '📊 Dashboard',
        'orders': '📦 Orders',
        'products': '🛍️ Products',
        'users': '👥 Users',
        'downloads': '📁 Downloads',
        'notifications': '🔔 Notifications',
        'stats': '📈 Stats',
        'logs': '📜 Logs',
        'activity': '📊 Activity',
        'fraud': '🛡️ Fraud',
        'slider': '🎨 Slider',
        'licences': '🔑 Licences',
        'marquee': '🎬 Marquee',
        'payments': '💳 Payments',
        'topups': '💰 Topups',
        'fallback': '📦 Fallback',
        'settings': '⚙️ Settings',
        'coupons': '🎫 Coupons',
        'emails': '📧 Emails',
        'branding': '🎨 Branding'
    };
    const titleEl = document.getElementById('adminPageTitle');
    if (titleEl) titleEl.textContent = titles[tab] || tab;

    if (tab === 'products') renderAdminProducts(products);
    if (tab === 'users') loadAdminUsers();
    if (tab === 'dashboard') loadDashboardStats();
    if (tab === 'stats') loadAdvancedStats();
    if (tab === 'logs') loadAuditLogs();
    if (tab === 'activity') loadActivityLogs();
    if (tab === 'fraud') loadFraudLogs();
    if (tab === 'slider') {
        renderSliderSettingsUI();
        document.getElementById('sliderIntervalInput').value = sliderIntervalTime;
    }
    if (tab === 'licences') loadLicences();
    if (tab === 'marquee') renderMarqueeSettingsUI();
    if (tab === 'orders') loadAdminOrders();
    if (tab === 'payments') refreshAdminPayments();
    if (tab === 'topups') loadAdminTopups();
    if (tab === 'fallback') renderFallbackProductsAdmin();
    if (tab === 'settings') loadAdminSettingsUI();
    if (tab === 'coupons') renderAdminCoupons();
    if (tab === 'emails') loadEmailLogs();
    if (tab === 'branding') loadBrandingSettings();
};

// ============================================================
// ADMIN PRODUCTS
// ============================================================
function renderAdminProducts(productsList) {
    const container = document.getElementById('adminProductsList');
    if (!container) return;
    if (!productsList || productsList.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-secondary);opacity:0.5;">📭 No products</div>`;
        return;
    }
    container.innerHTML = productsList.map(p => {
        const isUnavailable = p.status === 'unavailable';
        return `
            <div class="admin-product-card" style="${isUnavailable ? 'opacity:0.5;' : ''}">
                <div class="product-img">
                    ${p.image ? `<img src="${p.image}" alt="${p.name}" />` : `<i class="fas fa-box"></i>`}
                </div>
                <div class="product-info">
                    <div class="name">${p.name}</div>
                    <div class="meta">${p.price === 0 ? '🎁 FREE' : '$' + p.price} • ${p.badge || 'FREE'}</div>
                </div>
                <div class="product-actions">
                    <button class="edit-btn" onclick="openEditProductModal('${p.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" onclick="deleteProduct('${p.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================
// ADMIN ORDERS
// ============================================================
function startAdminRealtimeListener() {
    if (unsubscribeAdmin) { unsubscribeAdmin(); }
    if (!currentUser || !isAdminCached) {
        console.log('ℹ️ Admin listener skipped (not admin)');
        return;
    }
    const usersRef = collection(db, 'users');
    console.log('🔄 Admin listener starting...');
    unsubscribeAdmin = onSnapshot(usersRef, (snapshot) => {
        console.log('🔄 Admin listener triggered, snapshot size:', snapshot.size);
        let orders = [];
        let pending = 0,
            confirmed = 0,
            rejected = 0;
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
                orders.push({ ...order, userId: userDoc.id, userEmail: email,
                    userName: name, orderId: orderId, _checked: selectedOrders.has(
                        orderId) });
            });
        });
        orders.sort((a, b) => new Date(b.date) - new Date(a.date));
        allOrders = orders;
        pendingCount = pending;
        renderAdminOrders(orders);
        updateAdminStats(orders);
        updateUI();
        const badge = document.getElementById('adminNavBadge');
        if (badge) { if (pendingCount > 0) { badge.style.display = 'inline-block';
                badge.textContent = pendingCount; } else { badge.style.display = 'none'; } }
        updateFullUserMenu();
    }, (error) => {
        console.error('❌ Admin listener error:', error);
        if (error.code === 'permission-denied') {
            console.warn('⚠️ Missing permissions to read orders. Check Firestore rules.');
        }
    });
}

function loadAdminOrders() {
    if (!currentUser || !isAdminCached) {
        console.log('ℹ️ loadAdminOrders skipped (not admin)');
        return;
    }
    const tbody = document.getElementById('adminOrdersBody');
    if (!tbody) return;
    tbody.innerHTML =
        '<tr><td colspan="7"><div style="text-align:center;padding:30px;color:var(--text-secondary);"><i class="fas fa-spinner fa-spin"></i> Loading...</div></td></tr>';
    const usersRef = collection(db, 'users');
    getDocs(usersRef).then((snapshot) => {
        let orders = [];
        let pending = 0,
            confirmed = 0,
            rejected = 0;
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
                orders.push({ ...order, userId: userDoc.id, userEmail: email,
                    userName: name, orderId: orderId, _checked: selectedOrders.has(
                        orderId) });
            });
        });
        orders.sort((a, b) => new Date(b.date) - new Date(a.date));
        allOrders = orders;
        pendingCount = pending;
        renderAdminOrders(orders);
        updateAdminStats(orders);
        updateUI();
        const badge = document.getElementById('adminNavBadge');
        if (badge) { if (pendingCount > 0) { badge.style.display = 'inline-block';
                badge.textContent = pendingCount; } else { badge.style.display = 'none'; } }
        updateFullUserMenu();
    }).catch(error => {
        console.error('Error loading admin orders:', error);
        tbody.innerHTML =
            `<tr><td colspan="7"><div style="text-align:center;padding:30px;color:var(--danger);">${error.message}</div></td></tr>`;
        if (error.code === 'permission-denied') {
            console.warn('⚠️ Missing permissions to read orders. Check Firestore rules.');
        }
    });
}

function renderAdminOrders(orders) {
    const tbody = document.getElementById('adminOrdersBody');
    if (!tbody) return;
    if (!orders || orders.length === 0) { tbody.innerHTML =
            `<tr><td colspan="7"><div style="text-align:center;padding:30px;color:var(--text-secondary);"><i class="fas fa-inbox"></i> No orders</div></td></tr>`;
        return; }
    const uniqueOrders = [];
    const seen = new Set();
    orders.forEach(order => {
        const orderId = order.orderId || order.id;
        if (orderId && !seen.has(orderId)) { seen.add(orderId);
            uniqueOrders.push(order); }
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
        const dateStr = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short',
            year: 'numeric' });
        const itemsList = order.items ? order.items.map(item =>
            `<span style="display:inline-block;background:var(--bg);padding:2px 8px;border-radius:10px;font-size:11px;border:1px solid var(--border);margin:1px;">${item.name} ${item.selectedQuantity ? '📦'+item.selectedQuantity : ''} ×${item.quantity||1}</span>`
            ).join('') : '—';
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

    const totalEl = document.getElementById('adminTotalOrders');
    const pendingEl = document.getElementById('adminPendingOrders');
    const confirmedEl = document.getElementById('adminConfirmedOrders');
    const rejectedEl = document.getElementById('adminRejectedOrders');

    if (totalEl) totalEl.textContent = total;
    if (pendingEl) pendingEl.textContent = pending;
    if (confirmedEl) confirmedEl.textContent = confirmed;
    if (rejectedEl) rejectedEl.textContent = rejected;
}

// ============================================================
// UPDATE ORDER STATUS
// ============================================================
window.updateOrderStatus = async function(orderId, userId, newStatus) {
    if (!currentUser || !isAdminCached) { showToast('⛔ Unauthorized', 'error'); return; }
    if (!orderId || !userId) { showToast('❌ Invalid data', 'error'); return; }
    const validStatuses = ['pending', 'confirmed', 'rejected'];
    if (!validStatuses.includes(newStatus)) { showToast('⚠️ Invalid status', 'warning'); return; }
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) { showToast('❌ User not found', 'error'); return; }
        const data = userSnap.data();
        const history = data.history || [];
        let orderFound = null;
        const updatedHistory = history.map(order => {
            if (order.id === orderId) {
                orderFound = { ...order, status: newStatus };
                return { ...order, status: newStatus, updatedAt: new Date().toISOString() };
            }
            return order;
        });
        await updateDoc(userRef, { history: updatedHistory });
        try {
            if (orderFound) {
                await supabase
                    .from('transactions')
                    .update({ 
                        status: newStatus === 'confirmed' ? 'completed' : newStatus,
                        description: `Order #${orderId.slice(-6)} - ${newStatus === 'confirmed' ? 'Confirmed' : 'Rejected'}`
                    })
                    .eq('order_id', orderId);
                console.log('✅ Transaction status updated');
            }
        } catch (txError) {
            console.error('Failed to update transaction status:', txError);
        }
        await sendUserNotification(
            userId,
            newStatus === 'confirmed' ? '✅ Order Confirmed!' : '❌ Order Rejected',
            newStatus === 'confirmed' ?
            `Your order #${orderId.slice(-6)} has been confirmed. Your licences are now available in your profile!` :
            `Your order #${orderId.slice(-6)} has been rejected. Please contact support for more information.`
        );
        await sendOrderStatusEmail(data.email || userId, orderId, newStatus);
        if (data.telegramChatId) {
            const statusEmoji = newStatus === 'confirmed' ? '✅' : '❌';
            const statusText = newStatus === 'confirmed' ? 'CONFIRMED' : 'REJECTED';
            const telegramMessage = `
${statusEmoji} *ORDER ${statusText}!*

📋 Order #${orderId.slice(-6)}
📦 ${orderFound?.items?.map(i => i.name).join(', ') || 'Order'}
💰 Total: $${(orderFound?.total || 0).toFixed(2)}

${newStatus === 'confirmed' ? '🔑 Your licences have been generated and are available in your profile.' : 'Please contact support for more information.'}

📅 ${new Date().toLocaleString()}
            `;
            await sendTelegramNotification(data.telegramChatId, telegramMessage);
            console.log('✅ Telegram notification sent to user for status update');
        }
        if (newStatus === 'confirmed') {
            const userEmail = orderFound?.userEmail || data.email || userId;
            if (orderFound && orderFound.items) {
                for (const item of orderFound.items) {
                    await generateLicenceForUser(userId, userEmail, item, orderId);
                }
                showToast(`✅ Licences generated for user`, 'success');
            }
            showToast({
                title: '✅ Order Confirmed!',
                orderId: orderId.slice(-6),
                details: orderFound.items.map(item => ({
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity || 1
                })),
                total: orderFound.total || 0,
                method: orderFound.method || 'N/A',
                date: new Date().toLocaleString()
            }, 'success', 8000, true);
        }
        showToast(`📦 Order updated to ${newStatus}`, 'success');
        loadAdminOrders();
        if (currentUser && currentUser.uid === userId) { userProfile.history = updatedHistory; }
        updateFullUserMenu();
    } catch (error) {
        console.error('Error updating order:', error);
        showToast('❌ Error: ' + error.message, 'error');
    }
};

window.deleteOrderImmediately = async function(orderId, userId) {
    if (!currentUser || !isAdminCached) { showToast('⛔ Unauthorized', 'error'); return; }
    if (!orderId || !userId) { showToast('❌ Invalid data', 'error'); return; }
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) { showToast('❌ User not found', 'error'); return; }
        const data = userSnap.data();
        const history = data.history || [];
        const updatedHistory = history.filter(order => order.id !== orderId);
        await updateDoc(userRef, { history: updatedHistory });
        try {
            await supabase.from('transactions').delete().eq('order_id', orderId);
        } catch (txError) {
            console.error('Failed to delete transaction:', txError);
        }
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

// ============================================================
// ADMIN USERS
// ============================================================
async function loadAdminUsers() {
    if (!currentUser || !isAdminCached) {
        console.log('ℹ️ loadAdminUsers skipped (not admin)');
        return;
    }
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
                rp: data.rp || 0, referralCode: data.referralCode || '', location: data.location ||
                    data.country || 'N/A', photoURL: data.photoURL || '', balance: data
                    .balance || 0 });
        });
        allUsers = usersList;
        renderAdminUsers(usersList);
    } catch (error) {
        console.error('Error loading users:', error);
        container.innerHTML =
            `<div style="text-align:center;padding:30px;color:var(--danger);">Error loading users: ${error.message}</div>`;
        if (error.code === 'permission-denied') {
            console.warn('⚠️ Missing permissions to read users. Check Firestore rules.');
        }
    }
}

function renderAdminUsers(usersList) {
    const container = document.getElementById('adminUsersContainer');
    if (!container) return;
    if (!usersList || usersList.length === 0) { container.innerHTML =
            `<div style="text-align:center;padding:30px;color:var(--text-secondary);">👥 No users</div>`;
        return; }
    const searchQuery = document.getElementById('adminUserSearchInput')?.value.trim().toLowerCase() || '';
    let filtered = usersList;
    if (searchQuery) { filtered = filtered.filter(u => u.email?.toLowerCase().includes(searchQuery) || u.name
            ?.toLowerCase().includes(searchQuery)); }
    if (filtered.length === 0) { container.innerHTML =
            `<div style="text-align:center;padding:30px;color:var(--text-secondary);">🔍 No results</div>`;
        return; }
    container.innerHTML =
        `<div style="display:flex;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:4px;"><span style="font-size:12px;color:var(--text-secondary);opacity:0.4;">${filtered.length} users</span></div><div class="admin-users-grid">${filtered.map(user=>{
        const isAdmin = user.email === 'zribiidriss3@gmail.com';
        const isBanned = user.isBanned || false;
        const orderCount = user.history?.length || 0;
        const rp = user.rp || 0;
        const balance = user.balance || 0;
        const photo = user.photoURL || '';
        const initials = (user.name || 'U').charAt(0).toUpperCase();
        const dateStr = user.createdAt ? user.createdAt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '--';
        const location = user.location || user.country || 'N/A';
        return `<div class="admin-user-card ${isBanned?'banned':''}"><div class="user-avatar">${photo ? `<img src="${photo}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />` : initials}</div><div class="user-name">${user.name||'Unknown'}</div><div class="user-email">${user.email||'No email'}</div><div class="user-meta">📍 ${location}</div><div class="user-meta">📅 ${dateStr} • 🎯 ${rp} RP • 💰 $${balance.toFixed(2)}</div><div class="user-meta">📦 ${orderCount} orders</div>${isBanned?`<span class="user-badge banned">🚫 Banned</span>`:''}${isAdmin?`<span class="user-badge admin">👑 Admin</span>`:''}<div class="user-actions"><button class="btn-view" onclick="viewUserDetails('${user.uid}')"><i class="fas fa-eye"></i> View</button>${!isAdmin ? (isBanned ? `<button class="btn-unban" onclick="toggleUserBan('${user.uid}',false)"><i class="fas fa-user-check"></i> Unban</button>` : `<button class="btn-ban" onclick="toggleUserBan('${user.uid}',true)"><i class="fas fa-ban"></i> Ban</button>`) : ''}${!isAdmin ? `<button class="btn-delete" onclick="deleteUserAccount('${user.uid}')"><i class="fas fa-trash"></i></button>` : ''}</div></div>`;
    }).join('')}</div>`;
}
window.searchAdminUsers = function() { renderAdminUsers(allUsers); };
window.clearAdminUserSearch = function() { document.getElementById('adminUserSearchInput').value = '';
    renderAdminUsers(allUsers); };
window.refreshAdminUsers = function() { loadAdminUsers();
    showToast('🔄 Users refreshed', 'info'); };
window.toggleUserBan = async function(uid, ban) {
    if (!currentUser || !isAdminCached) { showToast('⛔ Unauthorized', 'error'); return; }
    if (uid === currentUser.uid) { showToast('⚠️ You cannot ban yourself', 'warning'); return; }
    try {
        await updateDoc(doc(db, 'users', uid), { isBanned: ban });
        showToast(`✅ User ${ban?'banned':'unbanned'}`, 'success');
        loadAdminUsers();
    } catch (error) { console.error('Error toggling user ban:', error);
        showToast('❌ Error: ' + error.message, 'error'); }
};
window.deleteUserAccount = async function(uid) {
    if (!currentUser || !isAdminCached) { showToast('⛔ Unauthorized', 'error'); return; }
    if (uid === currentUser.uid) { showToast('⚠️ You cannot delete your own account', 'warning'); return; }
    if (!confirm('⚠️ Delete this user account permanently?')) return;
    try {
        await deleteDoc(doc(db, 'users', uid));
        showToast('🗑️ User account deleted', 'success');
        loadAdminUsers();
        loadAdminOrders();
    } catch (error) { console.error('Error deleting user:', error);
        showToast('❌ Error: ' + error.message, 'error'); }
};
window.viewUserDetails = async function(uid) {
    if (!currentUser || !isAdminCached) { showToast('⛔ Unauthorized', 'error'); return; }
    try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) { showToast('❌ User not found', 'error'); return; }
        const data = userSnap.data();
        const orders = data.history || [];
        const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        const location = data.location || data.country || 'Not specified';
        const photo = data.photoURL || '';
        const balance = data.balance || 0;
        const joinedDate = data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString('en-US', { year: 'numeric',
                month: 'long', day: 'numeric' }) : '--';
        const content = document.getElementById('userDetailsContent');
        if (!content) {
            showToast('❌ User details content not found', 'error');
            return;
        }
        content.innerHTML = `
          <div style="padding:4px 0;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
              <div style="width:44px;height:44px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#fff;overflow:hidden;">
                ${photo ? `<img src="${photo}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />` : (data.name||'U').charAt(0).toUpperCase()}
              </div>
              <div><div style="font-size:15px;font-weight:700;color:var(--text);">${data.name||'Unknown'}</div><div style="font-size:12px;color:var(--text-secondary);">${data.email||'No email'}</div><div style="font-size:12px;color:var(--text-secondary);">📍 Country: ${location}</div><div style="font-size:11px;color:var(--text-secondary);opacity:0.4;">📅 Joined: ${joinedDate}</div><div style="font-size:12px;color:var(--vip-color);font-weight:600;">🎯 RP: ${data.rp||0} • 💰 Balance: $${balance.toFixed(2)}</div><div style="font-size:12px;color:var(--text-secondary);">📦 ${orders.length} orders</div></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;margin-bottom:10px;">
              <div style="background:var(--bg);border-radius:6px;padding:6px;text-align:center;border:1px solid var(--border);"><div style="font-size:14px;font-weight:700;color:var(--text);">${orders.length}</div><div style="font-size:9px;color:var(--text-secondary);">Orders</div></div>
              <div style="background:var(--bg);border-radius:6px;padding:6px;text-align:center;border:1px solid var(--border);"><div style="font-size:14px;font-weight:700;color:var(--primary);">${totalSpent.toFixed(2)} $</div><div style="font-size:9px;color:var(--text-secondary);">Spent</div></div>
              <div style="background:var(--bg);border-radius:6px;padding:6px;text-align:center;border:1px solid var(--border);"><div style="font-size:14px;font-weight:700;color:var(--vip-color);">${data.rp||0}</div><div style="font-size:9px;color:var(--text-secondary);">RP</div></div>
              <div style="background:var(--bg);border-radius:6px;padding:6px;text-align:center;border:1px solid var(--border);"><div style="font-size:14px;font-weight:700;color:var(--success);">$${balance.toFixed(2)}</div><div style="font-size:9px;color:var(--text-secondary);">Balance</div></div>
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
    } catch (error) { console.error('Error viewing user details:', error);
        showToast('❌ Error loading user details', 'error'); }
};
window.closeUserDetailsModal = function() { document.getElementById('userDetailsModal').classList.remove('open'); };

// ============================================================
// LICENCE MANAGEMENT
// ============================================================
async function loadLicences() {
    try {
        const container = document.getElementById('adminLicencesList');
        if (!container) return;
        container.innerHTML =
            `<div style="text-align:center;padding:30px;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>`;
        if (typeof supabase === 'undefined') { throw new Error('supabase is not defined'); }
        const { data, error } = await supabase.from('licenses').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        allLicences = data || [];
        renderLicences(allLicences);
    } catch (error) {
        console.error('Error loading licences:', error);
        const container = document.getElementById('adminLicencesList');
        if (container) container.innerHTML =
            `<div style="text-align:center;padding:30px;color:var(--danger);">⚠️ Failed to load licences: ${error.message}</div>`;
    }
}

function renderLicences(licences) {
    const container = document.getElementById('adminLicencesList');
    if (!container) return;
    if (!licences || licences.length === 0) { container.innerHTML =
            `<div style="text-align:center;padding:30px;color:var(--text-secondary);">🔑 No licences found</div>`;
        return; }
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
    if (modal) modal.classList.add('open');
}

function closeCreateLicenceModal() {
    const modal = document.getElementById('createLicenceModal');
    if (modal) modal.classList.remove('open');
}

async function createLicenceManually() {
    const productName = document.getElementById('newLicenceProduct')?.value.trim();
    const userId = document.getElementById('newLicenceUser')?.value.trim();
    const expiryDate = document.getElementById('newLicenceExpiry')?.value;
    if (!productName) { showToast('⚠️ Product name required', 'warning'); return; }
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/create-licence`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productName, userId, userEmail: userId, expiryDate, manual: true })
        });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error);
        showToast(`✅ Licence created: ${data.licence.code}`, 'success');
        closeCreateLicenceModal();
        loadLicences();
        if (userId) {
            const usersRef = collection(db, 'users');
            let q = userId.includes('@') ? query(usersRef, where('email', '==', userId)) : query(usersRef, where(
                'userId', '==', userId));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const userData = userDoc.data();
                const userLicences = userData.licences || [];
                if (!userLicences.find(l => l.code === data.licence.code)) {
                    userLicences.push({ code: data.licence.code, scriptId: productName,
                        scriptName: productName, expiryDate: data.licence.expiryDate,
                        activatedAt: new Date().toISOString() });
                    await updateDoc(userDoc.ref, { licences: userLicences, updatedAt: serverTimestamp() });
                    if (currentUser && userDoc.id === currentUser.uid) {
                        userProfile.licences = userLicences;
                        renderUserLicences();
                        updateFullUserMenu();
                    }
                }
            }
        }
    } catch (error) { showToast('❌ Error: ' + error.message, 'error'); }
}

async function updateLicenceInSupabase(licenceId, data) {
    const { error } = await supabase.from('licenses').update({ ...data, updated_at: new Date().toISOString() }).eq(
        'id', licenceId);
    if (error) throw error;
    return true;
}

async function approveLicence(licenceId, code, scriptName) {
    if (!currentUser || !isAdminCached) { showToast('⛔ Unauthorized', 'error'); return; }
    if (!confirm(`Approve licence ${code} and send to user?`)) return;
    try {
        const { data: licenceData, error: fetchError } = await supabase.from('licenses').select('*').eq('id',
            licenceId).single();
        if (fetchError || !licenceData) throw fetchError || new Error('Licence not found');
        await updateLicenceInSupabase(licenceId, { status: 'active', user_id: currentUser.uid, user_email: currentUser
                .email });
        await sendUserNotification(
            currentUser.uid,
            '🔑 Licence Activated!',
            `Your licence for ${scriptName} has been activated. Code: ${code}`
        );
        showToast(`✅ Licence ${code} approved!`, 'success');
        loadLicences();
    } catch (error) { showToast('❌ Error: ' + error.message, 'error'); }
}

async function revokeLicence(licenceId) {
    if (!currentUser || !isAdminCached) { showToast('⛔ Unauthorized', 'error'); return; }
    if (!confirm('Revoke this licence?')) return;
    try {
        await updateLicenceInSupabase(licenceId, { status: 'revoked' });
        const licence = allLicences.find(l => l.id === licenceId);
        if (licence && licence.user_id) {
            await sendUserNotification(
                licence.user_id,
                '🚫 Licence Revoked',
                `Your licence for ${licence.script_name || 'product'} has been revoked.`
            );
            const userRef = doc(db, 'users', licence.user_id);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                const userLicences = userData.licences || [];
                const updatedLicences = userLicences.map(l => {
                    if (l.code === licence.code) { return { ...l, status: 'revoked' }; }
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
    } catch (error) { showToast('❌ Error: ' + error.message, 'error'); }
}

async function deleteLicence(licenceId) {
    if (!currentUser || !isAdminCached) { showToast('⛔ Unauthorized', 'error'); return; }
    if (!confirm('Delete this licence permanently?')) return;
    try {
        const licence = allLicences.find(l => l.id === licenceId);
        const { error } = await supabase.from('licenses').delete().eq('id', licenceId);
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
    } catch (error) { showToast('❌ Error: ' + error.message, 'error'); }
}

async function editLicence(licenceId) {
    if (!currentUser || !isAdminCached) { showToast('⛔ Unauthorized', 'error'); return; }
    try {
        const { data: licence, error } = await supabase.from('licenses').select('*').eq('id', licenceId).single();
        if (error || !licence) { showToast('❌ Licence not found', 'error'); return; }
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
        } else { document.getElementById('editLicenceExpiry').value = ''; }
        document.getElementById('editLicenceStatus').value = licence.status || 'active';
        document.getElementById('editLicenceModal').classList.add('open');
    } catch (error) { showToast('❌ Failed to load licence details', 'error'); }
}

async function saveLicenceEdit() {
    if (!currentUser || !isAdminCached) { showToast('⛔ Unauthorized', 'error'); return; }
    const licenceId = document.getElementById('editLicenceId').value;
    const expiryDate = document.getElementById('editLicenceExpiry').value;
    const status = document.getElementById('editLicenceStatus').value;
    try {
        await updateLicenceInSupabase(licenceId, { expiry_date: expiryDate ? new Date(expiryDate).toISOString() :
                null, status });
        const licenceIndex = allLicences.findIndex(l => l.id === licenceId);
        if (licenceIndex !== -1) {
            allLicences[licenceIndex].expiry_date = expiryDate ? new Date(expiryDate).toISOString() : null;
            allLicences[licenceIndex].status = status;
        }
        const licence = allLicences.find(l => l.id === licenceId);
        if (licence && currentUser) {
            if (licence.user_id === currentUser.uid || currentUser.email === 'zribiidriss3@gmail.com') {
                await loadUserData();
                renderUserLicences();
                updateFullUserMenu();
            }
        }
        loadLicences();
        showToast('✅ Licence updated!', 'success');
        document.getElementById('editLicenceModal').classList.remove('open');
    } catch (error) { showToast('❌ Error: ' + error.message, 'error'); }
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

function clearLicenceSearch() { document.getElementById('adminLicenceSearch').value = '';
    renderLicences(allLicences); }

function refreshLicences() { loadLicences();
    showToast('🔄 Refreshed', 'info'); }

function renderUserLicences() {
    const container = document.getElementById('userLicencesList');
    if (!container) return;
    if (!currentUser) { container.innerHTML = ''; return; }
    const userLicences = userProfile.licences || [];
    if (userLicences.length === 0) { container.innerHTML =
            `<div style="text-align:center;padding:8px;color:var(--text-secondary);font-size:12px;">No active licences</div>`;
        return; }
    container.innerHTML = userLicences.map(l => {
        const isExpired = new Date(l.expiryDate) < new Date();
        const isRevoked = l.status === 'revoked';
        const isActive = !isExpired && !isRevoked && l.status !== 'expired';
        return `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:var(--bg);border-radius:6px;border:1px solid var(--border);margin-bottom:4px;${!isActive ? 'opacity:0.5;' : ''}">
                <div>
                    <div style="font-size:12px;font-weight:600;color:var(--text);">${l.scriptName}</div>
                    <div style="font-size:10px;color:var(--text-secondary);opacity:0.5;">
                        ${isRevoked ? '🚫 Revoked' : isExpired ? '⛔ Expired' : '✅ Active until ' + new Date(l.expiryDate).toLocaleDateString()}
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                    <span style="font-size:10px;font-family:monospace;opacity:0.3;">${l.code.slice(-6)}</span>
                    <button onclick="copyLicenceCode('${l.code}')" style="background:none;border:none;color:var(--primary);cursor:pointer;font-size:14px;padding:2px 6px;" title="Copy full code"><i class="fas fa-copy"></i></button>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================
// LICENCE MODAL FUNCTIONS - FIXED
// ============================================================

// تبديل ظهور قائمة التراخيص
function toggleLicencesList() {
    const list = document.getElementById('userLicencesList');
    if (list) {
        list.style.display = list.style.display === 'none' ? 'block' : 'none';
    }
}

// فتح مودال التراخيص
window.openLicenceModal = function() {
    if (!currentUser) {
        showToast('⚠️ Please login first', 'warning');
        openAuthModal();
        return;
    }
    const modal = document.getElementById('licenceModal');
    if (!modal) {
        console.error('❌ licenceModal not found in DOM');
        showToast('❌ Licence modal not found', 'error');
        return;
    }
    renderUserLicences();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
};

// إغلاق مودال التراخيص
window.closeLicenceModal = function() {
    const modal = document.getElementById('licenceModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
};

// دالة مرادفة للتوافق مع HTML (closeLicenseModal)
window.closeLicenseModal = function() {
    if (typeof window.closeLicenceModal === 'function') {
        window.closeLicenceModal();
    } else {
        const modal = document.getElementById('licenceModal');
        if (modal) {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }
    }
};

// دالة مرادفة للتوافق مع HTML (activatedLicence)
window.activatedLicence = function() {
    if (typeof window.activateLicence === 'function') {
        window.activateLicence();
    } else {
        showToast('⚠️ Licence activation function not ready', 'warning');
    }
};

async function activateLicence() {
    const input = document.getElementById('licenceInput');
    const resultEl = document.getElementById('licenceResult');
    const code = input?.value?.trim().toUpperCase();
    if (!code) { resultEl.innerHTML = '<span style="color:var(--danger);">⚠️ Please enter a licence code.</span>'; return; }
    if (!currentUser) { resultEl.innerHTML =
            '<span style="color:var(--danger);">⚠️ You must be logged in.</span>'; return; }
    try {
        resultEl.innerHTML = '<span style="color:var(--text-secondary);">⏳ Verifying...</span>';
        const response = await fetch(
            `${SUPABASE_URL}/functions/v1/public-verify?code=${encodeURIComponent(code)}&token=${currentUser.uid}`, {
                headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
            });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error);
        const licence = data.data;
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const userData = userSnap.data();
            const userLicences = userData.licences || [];
            if (!userLicences.find(l => l.code === code)) {
                userLicences.push({ code, scriptId: licence.scriptId, scriptName: licence.scriptName,
                    expiryDate: licence.expiryDate, activatedAt: new Date().toISOString() });
                await updateDoc(userRef, { licences: userLicences, updatedAt: serverTimestamp() });
                userProfile.licences = userLicences;
                renderUserLicences();
                updateFullUserMenu();
                await sendUserNotification(
                    currentUser.uid,
                    '🔑 Licence Activated',
                    `Your licence for ${licence.scriptName} has been activated successfully!`
                );
            }
        }
        const expiryDate = new Date(licence.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long',
            day: 'numeric' });
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
    } catch (error) { resultEl.innerHTML = `<span style="color:var(--danger);">❌ Error: ${error.message}</span>`; }
}
window.activateLicence = activateLicence;

// ============================================================
// RATINGS
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
            total += data.rating || 0;
            count++;
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
    return history.some(order => {
        if (!order.items) return false;
        return order.items.some(item => item.id === productId);
    });
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
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:8px;">
                <span class="stars-small" id="ratingAvgStars" style="font-size:18px;">☆☆☆☆☆</span>
                <span class="count" id="ratingCountDisplay" style="font-size:13px;color:var(--text-secondary);opacity:0.5;">(0 reviews)</span>
                <span style="font-weight:700;color:var(--vip-color);font-size:16px;" id="ratingAvgDisplay">0.0</span>
            </div>
            <div id="ratingReviewsList" style="max-height:150px;overflow-y:auto;margin-bottom:8px;font-size:13px;">
                <div style="text-align:center;padding:8px;color:var(--text-secondary);opacity:0.4;">Loading reviews...</div>
            </div>
            ${canRate ? `
                <div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px;">
                    <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px;">⭐ Rate this product</div>
                    <div class="rating-stars" id="ratingStarsContainer">${renderStarHTML(0)}</div>
                    <textarea class="rating-comment-input" id="ratingCommentInput" placeholder="Share your experience... (optional)" rows="2" style="width:100%;padding:8px 12px;border:2px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);color:var(--text);font-family:var(--font);resize:vertical;margin-top:4px;"></textarea>
                    <button class="rating-submit-btn" onclick="submitRating('${productId}')" style="padding:6px 16px;border:none;border-radius:var(--radius-sm);background:var(--primary);color:#fff;font-weight:600;cursor:pointer;margin-top:4px;"><i class="fas fa-paper-plane"></i> Submit Review</button>
                </div>
            ` : (isLoggedIn ? `
                <div style="font-size:12px;color:var(--text-secondary);opacity:0.4;text-align:center;padding:4px;">📌 Purchase this product to leave a review</div>
            ` : `
                <div style="font-size:12px;color:var(--text-secondary);opacity:0.4;text-align:center;padding:4px;">🔒 Login to rate this product</div>
            `)}
        </div>
    `;
    loadRatings(productId);
}

async function updateProductRatingDisplay(productId) {
    const ratingsRef = collection(db, 'ratings');
    const q = query(ratingsRef, where('productId', '==', productId));
    const snapshot = await getDocs(q);
    let total = 0, count = 0;
    snapshot.forEach(doc => { total += doc.data().rating || 0; count++; });
    const avg = count > 0 ? total / count : 0;
}

// ============================================================
// SLIDER FUNCTIONS
// ============================================================
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
window.pauseSlider = function() { isSliderPaused = true; };
window.resumeSlider = function() { isSliderPaused = false; };

window.saveSliderData = async function() {
    try {
        const settingsRef = doc(db, 'settings', 'slider');
        await setDoc(settingsRef, {
            interval: sliderIntervalTime,
            slides: sliderSlides,
            updatedAt: serverTimestamp()
        }, { merge: true });
        showToast('✅ Slider saved successfully!', 'success');
        return true;
    } catch (error) {
        console.error('Error saving slider data:', error);
        showToast('❌ Failed to save slider: ' + error.message, 'error');
        return false;
    }
};

window.saveSliderInterval = async function() {
    const input = document.getElementById('sliderIntervalInput');
    if (!input) {
        showToast('❌ Interval field not found', 'error');
        return;
    }
    const interval = parseFloat(input.value);
    if (isNaN(interval) || interval < 1) {
        showToast('⚠️ Please enter a valid number (minimum 1 second)', 'warning');
        return;
    }
    sliderIntervalTime = interval;
    await window.saveSliderData();
    resetSliderTimer();
    renderSlider();
    showToast('✅ Interval saved: ' + interval + ' seconds', 'success');
};

window.saveSlideEdit = async function() {
    const editIndex = document.getElementById('addSlideForm')?.dataset.editIndex;
    const isEdit = editIndex !== undefined && editIndex !== '';

    if (isEdit) {
        const idx = parseInt(editIndex);
        if (isNaN(idx) || idx < 0 || idx >= sliderSlides.length) {
            showToast('❌ Slide not found for editing', 'error');
            return;
        }
    }

    const title = document.getElementById('slideTitle')?.value.trim() || '';
    const subtitle = document.getElementById('slideSubtitle')?.value.trim() || '';
    const buttonText = document.getElementById('slideButtonText')?.value.trim() || 'Buy Now';
    const linkType = document.getElementById('slideLinkType')?.value || 'product';
    let productId = '', downloadUrl = '', customUrl = '';

    if (linkType === 'product') {
        productId = document.getElementById('slideProductSelect')?.value || '';
        if (!productId) {
            showToast('⚠️ Please select a product', 'warning');
            return;
        }
    } else if (linkType === 'download') {
        downloadUrl = document.getElementById('slideDownloadUrl')?.value.trim() || '';
        if (!downloadUrl) {
            showToast('⚠️ Please enter download URL', 'warning');
            return;
        }
    } else if (linkType === 'url') {
        customUrl = document.getElementById('slideCustomUrl')?.value.trim() || '';
        if (!customUrl) {
            showToast('⚠️ Please enter custom URL', 'warning');
            return;
        }
    }

    const fileInput = document.getElementById('slideImageFile');
    let imageUrl = '';

    if (isEdit) {
        imageUrl = sliderSlides[parseInt(editIndex)]?.imageUrl || '';
    }

    if (fileInput && fileInput.files && fileInput.files[0]) {
        showToast('⏳ Uploading image...', 'info');
        const uploadedUrl = await uploadToCloudinary(fileInput.files[0]);
        if (uploadedUrl) {
            imageUrl = uploadedUrl;
        } else {
            showToast('❌ Failed to upload image', 'error');
            return;
        }
    } else if (!imageUrl) {
        showToast('⚠️ Please select an image for the slide', 'warning');
        return;
    }

    const updatedSlide = {
        imageUrl,
        title,
        subtitle,
        buttonText,
        linkType,
        productId,
        downloadUrl,
        customUrl,
        updatedAt: new Date().toISOString()
    };

    if (isEdit) {
        sliderSlides[parseInt(editIndex)] = updatedSlide;
        showToast('✅ Slide updated successfully!', 'success');
    } else {
        sliderSlides.push(updatedSlide);
        showToast('✅ Slide added successfully!', 'success');
    }

    delete document.getElementById('addSlideForm').dataset.editIndex;

    await window.saveSliderData();
    renderSlider();
    renderSliderSettingsUI();
    resetSliderTimer();
    window.closeAddSlideModal();
};

window.deleteSlide = function(index) {
    if (!confirm('Are you sure you want to delete this slide?')) return;
    sliderSlides.splice(index, 1);
    window.saveSliderData();
    renderSlider();
    renderSliderSettingsUI();
    resetSliderTimer();
    showToast('🗑️ Slide deleted', 'success');
};

window.editSlide = function(index) {
    const slide = sliderSlides[index];
    if (!slide) { showToast('❌ Slide not found', 'error'); return; }
    const modal = document.getElementById('addSlideModal');
    if (!modal) { showToast('❌ Modal not found', 'error'); return; }

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
    const submitBtn = document.querySelector('#addSlideForm button[type="button"]');
    if (submitBtn) submitBtn.textContent = '💾 Save Changes';

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
};

window.openAddSlideModal = function() {
    updateSlideProductSelect();
    const modal = document.getElementById('addSlideModal');
    if (!modal) { showToast('❌ Modal not found', 'error'); return; }

    const form = document.getElementById('addSlideForm');
    if (form) form.reset();
    const preview = document.getElementById('slideImagePreview');
    if (preview) preview.style.display = 'none';

    delete document.getElementById('addSlideForm').dataset.editIndex;
    document.querySelector('#addSlideModal .modal-title').textContent = '➕ Add New Slide';
    const submitBtn = document.querySelector('#addSlideForm button[type="button"]');
    if (submitBtn) submitBtn.textContent = '➕ Add Slide';

    toggleSlideLinkFields();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
};

window.closeAddSlideModal = function() {
    const modal = document.getElementById('addSlideModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
        delete document.getElementById('addSlideForm')?.dataset.editIndex;
    }
};

function updateSlideProductSelect() {
    const select = document.getElementById('slideProductSelect');
    if (!select) return;
    select.innerHTML = products.map(p =>
        `<option value="${p.id}">${p.name} (${getCurrencySymbol(p.currency || 'USD')}${p.price})</option>`).join('');
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

async function loadSliderSettings() {
    try {
        const settingsRef = doc(db, 'settings', 'slider');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
            const data = settingsSnap.data();
            sliderSlides = data.slides || [];
            sliderIntervalTime = data.interval || 3;
            const intervalInput = document.getElementById('sliderIntervalInput');
            if (intervalInput) { intervalInput.value = sliderIntervalTime; }
        } else {
            sliderSlides = [];
            sliderIntervalTime = 3;
        }
        renderSlider();
        startSliderRotation();
        renderSliderSettingsUI();
    } catch (error) {
        console.error('Error loading slider settings:', error);
        if (error.code === 'permission-denied') {
            sliderSlides = [];
            sliderIntervalTime = 3;
            renderSlider();
            renderSliderSettingsUI();
        }
    }
}

function renderSlider() {
    const wrapper = document.getElementById('sliderWrapper');
    const dots = document.getElementById('sliderDots');
    if (!wrapper) return;
    if (sliderSlides.length === 0) {
        wrapper.innerHTML =
            `<div class="slide-item" style="background:var(--bg-secondary);display:flex;align-items:center;justify-content:center;min-height:150px;border-radius:var(--radius-sm);"><div style="text-align:center;color:var(--text-secondary);opacity:0.4;"><i class="fas fa-images" style="font-size:36px;display:block;margin-bottom:6px;"></i><p style="font-size:12px;">No slides. Add slides from admin panel.</p></div></div>`;
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
            <div class="slide-item ${isActive}" style="background-image: url('${imageUrl}');">
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
}

function startSliderRotation() {
    if (sliderTimer) clearInterval(sliderTimer);
    if (sliderSlides.length <= 1) return;
    sliderTimer = setInterval(() => {
        if (!isSliderPaused) { window.nextSlide(); }
    }, sliderIntervalTime * 1000);
}

function resetSliderTimer() {
    if (sliderTimer) { clearInterval(sliderTimer);
        startSliderRotation(); }
}

function renderSliderSettingsUI() {
    const container = document.getElementById('sliderSlidesList');
    if (!container) return;
    if (sliderSlides.length === 0) {
        container.innerHTML =
            `<div style="text-align:center;padding:20px;color:var(--text-secondary);opacity:0.5;">No slides. Click "Add Slide" to get started.</div>`;
        return;
    }
    container.innerHTML = sliderSlides.map((slide, index) => {
        const product = products.find(p => p.id === slide.productId);
        const productName = product ? product.name : 'Unknown';
        return `<div class="admin-item"><div class="item-info"><div class="item-title"><img src="${slide.imageUrl || 'https://picsum.photos/seed/default/60/60'}" style="width:40px;height:40px;border-radius:var(--radius-sm);object-fit:cover;margin-right:8px;" />${slide.title || 'Slide ' + (index+1)}<span style="font-size:11px;opacity:0.4;font-weight:400;">${slide.linkType === 'product' ? '📦 Product: ' + productName : slide.linkType === 'download' ? '📥 Download' : '🔗 Custom Link'}</span></div><div class="item-meta">${slide.subtitle || ''}</div></div><div class="item-actions"><button class="btn-edit" onclick="editSlide(${index})"><i class="fas fa-edit"></i></button><button class="btn-delete" onclick="deleteSlide(${index})"><i class="fas fa-trash"></i></button></div></div>`;
    }).join('');
}

// ============================================================
// MARQUEE FUNCTIONS
// ============================================================
window.saveMarqueeSettings = async function() {
    const enabledCheckbox = document.getElementById('marqueeEnabled');
    const textArea = document.getElementById('marqueeText');
    const enabled = enabledCheckbox ? enabledCheckbox.checked : true;
    const text = textArea ? textArea.value.trim() :
        '🚀 Welcome to ZI Store | ⚡ Instant Delivery | 🔒 Secure Payment | 💬 24/7 Support';
    if (!text) { showToast('⚠️ Please enter marquee text', 'warning'); return; }
    try {
        const settingsRef = doc(db, 'settings', 'marquee');
        await setDoc(settingsRef, { enabled, text, updatedAt: serverTimestamp() }, { merge: true });
        marqueeSettings.enabled = enabled;
        marqueeSettings.text = text;
        applyMarqueeSettings();
        showToast('✅ Marquee settings saved!', 'success');
    } catch (error) { showToast('❌ Failed to save settings: ' + error.message, 'error'); }
};

window.applyMarqueeSettings = function() {
    const marqueeBar = document.getElementById('marqueeBar');
    const marqueeContent = document.getElementById('marqueeContent');
    if (!marqueeBar || !marqueeContent) return;
    if (marqueeSettings.enabled && marqueeSettings.text) {
        const items = marqueeSettings.text.split('|').map(item => item.trim()).filter(item => item);
        if (items.length > 0) {
            const contentHtml = items.map(item => `<span>${item}</span>`).join('');
            marqueeContent.innerHTML = contentHtml + contentHtml;
            marqueeBar.style.display = 'block';
        } else { marqueeBar.style.display = 'none'; }
    } else { marqueeBar.style.display = 'none'; }
};

function renderMarqueeSettingsUI() {
    const container = document.getElementById('marqueeSettingsContainer');
    if (!container) return;
    const enabledCheckbox = document.getElementById('marqueeEnabled');
    const textArea = document.getElementById('marqueeText');
    if (enabledCheckbox) enabledCheckbox.checked = marqueeSettings.enabled !== false;
    if (textArea) textArea.value = marqueeSettings.text ||
        '🚀 Welcome to ZI Store | ⚡ Instant Delivery | 🔒 Secure Payment | 💬 24/7 Support';
}

async function loadMarqueeSettings() {
    try {
        const settingsRef = doc(db, 'settings', 'marquee');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
            const data = settingsSnap.data();
            marqueeSettings.enabled = data.enabled !== undefined ? data.enabled : true;
            marqueeSettings.text = data.text ||
                '🚀 Welcome to ZI Store | ⚡ Instant Delivery | 🔒 Secure Payment | 💬 24/7 Support';
        } else {
            marqueeSettings.enabled = true;
            marqueeSettings.text =
                '🚀 Welcome to ZI Store | ⚡ Instant Delivery | 🔒 Secure Payment | 💬 24/7 Support';
        }
        applyMarqueeSettings();
    } catch (error) {
        console.error('Error loading marquee settings:', error);
        if (error.code === 'permission-denied') {
            marqueeSettings.enabled = true;
            marqueeSettings.text =
                '🚀 Welcome to ZI Store | ⚡ Instant Delivery | 🔒 Secure Payment | 💬 24/7 Support';
            applyMarqueeSettings();
        }
    }
}

// ============================================================
// DASHBOARD STATS, ADVANCED STATS, AUDIT LOGS
// ============================================================
async function loadDashboardStats() {
    if (!currentUser || !isAdminCached) { console.log('ℹ️ loadDashboardStats skipped (not admin)'); return; }
    try {
        const statsRef = doc(db, 'global_stats', 'stats');
        const statsSnap = await getDoc(statsRef);
        let totalOrders = 0, totalRevenue = 0;
        if (statsSnap.exists()) { totalOrders = statsSnap.data().totalOrders || 0;
            totalRevenue = statsSnap.data().totalRevenue || 0; }
        document.getElementById('dashboardTotalOrders').textContent = totalOrders;
        document.getElementById('dashboardTotalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
        document.getElementById('dashboardNetRevenue').textContent = `$${(totalRevenue * 0.1).toFixed(2)}`;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        if (error.code === 'permission-denied') { console.warn('⚠️ Missing permissions to read stats.'); }
    }
}
window.refreshDashboardStats = function() { loadDashboardStats();
    showToast('🔄 Stats refreshed', 'success'); };
async function loadAdvancedStats() {
    if (!currentUser || !isAdminCached) { console.log('ℹ️ loadAdvancedStats skipped (not admin)'); return; }
    const container = document.getElementById('advancedStatsContainer');
    if (!container) return;
    container.innerHTML =
        `<div style="text-align:center;padding:20px;color:var(--text-secondary);"><i class="fas fa-spinner fa-spin"></i> Loading statistics...</div>`;
    try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        let allOrders = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            const history = data.history || [];
            history.forEach(order => {
                allOrders.push({ ...order, userEmail: data.email || doc.id, userName: data
                        .name || 'Unknown', userId: doc.id, orderId: order.id ||
                        'order_' + Date.now() });
            });
        });
        const totalOrders = allOrders.length;
        const totalRevenue = allOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const pendingOrders = allOrders.filter(o => o.status === 'pending').length;
        const confirmedOrders = allOrders.filter(o => o.status === 'confirmed').length;
        const rejectedOrders = allOrders.filter(o => o.status === 'rejected').length;
        const totalUsers = snapshot.size;
        container.innerHTML =
            `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:16px;">
            <div class="stat-card" style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:12px;text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--primary);">${totalOrders}</div>
                <div style="font-size:12px;color:var(--text-secondary);">Total Orders</div>
            </div>
            <div class="stat-card" style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:12px;text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--vip-color);">$${totalRevenue.toFixed(2)}</div>
                <div style="font-size:12px;color:var(--text-secondary);">Revenue</div>
            </div>
            <div class="stat-card" style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:12px;text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--pending-color);">${pendingOrders}</div>
                <div style="font-size:12px;color:var(--text-secondary);">Pending</div>
            </div>
            <div class="stat-card" style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:12px;text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--success);">${confirmedOrders}</div>
                <div style="font-size:12px;color:var(--text-secondary);">Confirmed</div>
            </div>
            <div class="stat-card" style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:12px;text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--danger);">${rejectedOrders}</div>
                <div style="font-size:12px;color:var(--text-secondary);">Rejected</div>
            </div>
            <div class="stat-card" style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:12px;text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--text);">${totalUsers}</div>
                <div style="font-size:12px;color:var(--text-secondary);">Users</div>
            </div>
        </div>`;
    } catch (error) {
        console.error('Error loading advanced stats:', error);
        container.innerHTML =
            `<div style="text-align:center;padding:20px;color:var(--danger);">Failed to load statistics: ${error.message}</div>`;
    }
}
window.refreshAdvancedStats = function() { loadAdvancedStats();
    showToast('🔄 Advanced stats refreshed', 'success'); };
async function loadAuditLogs() {
    if (!currentUser || !isAdminCached) { console.log('ℹ️ loadAuditLogs skipped (not admin)'); return; }
    const container = document.getElementById('auditLogsContainer');
    if (!container) return;
    container.innerHTML =
        `<div style="text-align:center;padding:20px;color:var(--text-secondary);"><i class="fas fa-spinner fa-spin"></i> Loading logs...</div>`;
    try {
        const logsRef = collection(db, 'auditLogs');
        const q = query(logsRef, orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            container.innerHTML =
                `<div style="text-align:center;padding:30px;color:var(--text-secondary);opacity:0.5;">📭 No audit logs</div>`;
            return;
        }
        let html = `<div style="display:flex;flex-direction:column;gap:6px;max-height:400px;overflow-y:auto;">`;
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleString('en-US', { month: 'short',
                    day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '--';
            const admin = data.adminName || data.adminEmail || 'Admin';
            const action = data.action || 'Action';
            const details = data.details || '';
            html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--bg);border-radius:8px;border:1px solid var(--border);font-size:13px;">
                <div><span style="font-weight:600;color:var(--text);">${admin}</span><span style="color:var(--text-secondary);opacity:0.5;margin:0 4px;">→</span><span style="color:var(--primary);font-weight:500;">${action}</span>${details ? `<span style="color:var(--text-secondary);opacity:0.4;margin-left:4px;">${details}</span>` : ''}</div>
                <span style="font-size:11px;color:var(--text-secondary);opacity:0.3;">${date}</span>
            </div>`;
        });
        html += `</div>`;
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading audit logs:', error);
        container.innerHTML =
            `<div style="text-align:center;padding:20px;color:var(--danger);">Failed to load logs: ${error.message}</div>`;
    }
}
window.loadAuditLogs = loadAuditLogs;

// ============================================================
// ACTIVITY LOGS
// ============================================================
window.loadActivityLogs = async function() {
    if (!currentUser || !isAdminCached) {
        console.log('ℹ️ loadActivityLogs skipped (not admin)');
        return;
    }
    
    const container = document.getElementById('adminActivityContainer');
    if (!container) return;

    container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-secondary);"><i class="fas fa-spinner fa-spin"></i> Loading activity logs...</div>`;

    try {
        const activityRef = collection(db, 'user_activity');
        const q = query(activityRef, orderBy('createdAt', 'desc'), limit(100));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            container.innerHTML = `
                <div style="text-align:center;padding:30px;color:var(--text-secondary);opacity:0.5;">
                    <i class="fas fa-activity" style="font-size:36px;display:block;margin-bottom:8px;opacity:0.2;"></i>
                    No activities logged yet
                    <div style="font-size:12px;margin-top:8px;opacity:0.3;">Try performing some actions like viewing products or adding to cart</div>
                </div>
            `;
            return;
        }

        const activities = [];
        snapshot.forEach(doc => {
            activities.push({ id: doc.id, ...doc.data() });
        });

        const types = {};
        activities.forEach(a => {
            types[a.type] = (types[a.type] || 0) + 1;
        });

        let html = `
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(120px,1fr)); gap:6px; margin-bottom:12px;">
                ${Object.entries(types).map(([type, count]) => `
                    <div style="background:var(--glass-bg); padding:6px; border-radius:var(--radius-sm); text-align:center; border:1px solid var(--glass-border);">
                        <div style="font-size:16px; font-weight:800; color:var(--primary);">${count}</div>
                        <div style="font-size:9px; color:var(--text-secondary); opacity:0.5; text-transform:uppercase;">${type}</div>
                    </div>
                `).join('')}
            </div>
        `;

        html += activities.map(a => {
            const date = a.createdAt ? new Date(a.createdAt.toDate()).toLocaleString() : a.timestamp || '--';
            const iconMap = {
                'login': '🔐',
                'logout': '🚪',
                'page_view': '👀',
                'view_product': '📦',
                'add_to_cart': '🛒',
                'purchase': '💳',
                'search': '🔍',
                'click': '🖱️'
            };
            const icon = iconMap[a.type] || '📌';
            const user = a.userEmail || a.userName || 'Unknown';
            const detail = a.data ? Object.entries(a.data).map(([k,v]) => `${k}:${v}`).join(' | ') : '';
            
            return `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 10px; background:var(--glass-bg); border-radius:var(--radius-sm); border:1px solid var(--glass-border); margin-bottom:4px; font-size:12px;">
                    <div style="display:flex; align-items:center; gap:6px; flex:1; min-width:0;">
                        <span style="font-size:16px;">${icon}</span>
                        <span style="font-weight:600; font-size:11px;">${user}</span>
                        <span style="color:var(--text-secondary); opacity:0.5;">${a.type}</span>
                        ${detail ? `<span style="color:var(--text-secondary); opacity:0.3; font-size:10px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${detail}</span>` : ''}
                    </div>
                    <div style="font-size:10px; color:var(--text-secondary); opacity:0.3; white-space:nowrap;">${date}</div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;

    } catch (error) {
        console.error('Error loading activity logs:', error);
        container.innerHTML = `
            <div style="text-align:center;padding:20px;color:var(--danger);">
                Failed to load activity logs: ${error.message}
                ${error.code === 'permission-denied' ? '<br><span style="font-size:12px;">⚠️ Check Firestore rules for user_activity collection</span>' : ''}
                <br>
                <button onclick="loadActivityLogs()" style="margin-top:8px;padding:6px 16px;background:var(--primary);border:none;border-radius:var(--radius-sm);color:#fff;cursor:pointer;">Retry</button>
            </div>
        `;
    }
};

window.exportActivityLogs = async function() {
    if (!currentUser || !isAdminCached) {
        showToast('⛔ Unauthorized', 'error');
        return;
    }
    try {
        const activityRef = collection(db, 'user_activity');
        const q = query(activityRef, orderBy('createdAt', 'desc'), limit(500));
        const snapshot = await getDocs(q);
        
        const activities = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            activities.push({
                timestamp: data.createdAt?.toDate?.() || data.timestamp || new Date(),
                user: data.userEmail || data.userName || 'Unknown',
                type: data.type || 'unknown',
                ip: data.ip || 'N/A',
                data: JSON.stringify(data.data || {})
            });
        });

        let csv = 'Timestamp,User,Type,IP,Data\n';
        activities.forEach(a => {
            csv += `${a.timestamp.toISOString()},${a.user},${a.type},${a.ip},"${a.data}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity_logs_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        showToast(`📥 Exported ${activities.length} activities`, 'success');
    } catch (error) {
        console.error('Export error:', error);
        showToast('❌ Failed to export activities', 'error');
    }
};

// ============================================================
// FRAUD LOGS
// ============================================================
window.loadFraudLogs = async function() {
    if (!currentUser || !isAdminCached) return;
    const container = document.getElementById('adminFraudContainer');
    if (!container) return;

    container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-secondary);"><i class="fas fa-spinner fa-spin"></i> Loading fraud logs...</div>`;

    try {
        const fraudRef = collection(db, 'fraudLogs');
        const q = query(fraudRef, orderBy('createdAt', 'desc'), limit(100));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            container.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-secondary);opacity:0.5;">✅ No fraud activities detected</div>`;
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.createdAt ? new Date(data.createdAt.toDate()).toLocaleString() : '--';
            const warnings = data.warnings ? data.warnings.join(' | ') : 'No warnings';
            const severity = data.severity || 'low';
            const user = data.email || data.userId || 'Unknown';
            const ip = data.ip || 'N/A';

            const severityColor = severity === 'high' ? 'var(--danger)' : severity === 'medium' ? 'var(--warning)' : 'var(--success)';

            html += `
                <div class="admin-item" style="border-left:4px solid ${severityColor};">
                    <div class="item-info">
                        <div class="item-title">
                            <span style="color:${severityColor};font-weight:800;">${severity.toUpperCase()}</span>
                            ${user}
                            <span style="font-size:11px;font-weight:400;opacity:0.5;margin-left:6px;">IP: ${ip}</span>
                        </div>
                        <div class="item-meta">
                            ⚠️ ${warnings}
                            <br>
                            <span style="font-size:10px;opacity:0.4;">📅 ${date}</span>
                        </div>
                    </div>
                    <div class="item-actions">
                        <span style="font-size:10px;background:${severityColor}20;padding:2px 8px;border-radius:30px;color:${severityColor};font-weight:700;">${severity}</span>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

    } catch (error) {
        console.error('Error loading fraud logs:', error);
        container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--danger);">Failed to load fraud logs: ${error.message}</div>`;
    }
};

// ============================================================
// ORDER HISTORY (User-specific)
// ============================================================
window.clearOrderHistory = async function() {
    if (!currentUser) {
        showToast('⚠️ Please login first', 'warning');
        return;
    }
    if (!confirm('⚠️ Are you sure you want to clear all order history? This cannot be undone!')) {
        return;
    }
    try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, { history: [] });
        userProfile.history = [];
        renderHistoryFull();
        updateFullUserMenu();
        showToast('🗑️ Order history cleared successfully!', 'success');
    } catch (error) {
        console.error('Error clearing order history:', error);
        showToast('❌ Failed to clear order history', 'error');
    }
};

window.renderHistoryFull = function() {
    const container = document.getElementById('historyFullContent');
    if (!container) return;

    const history = userProfile.history || [];
    if (history.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:40px 20px; color:var(--text-secondary);">
            <i class="fas fa-shopping-bag" style="font-size:48px; opacity:0.15; display:block; margin-bottom:12px;"></i>
            <div style="font-size:18px; font-weight:600;">No orders yet</div>
            <div style="font-size:13px; opacity:0.4; margin-top:4px;">Your orders will appear here</div>
        </div>`;
        return;
    }

    let html = '';
    history.forEach(order => {
        const date = order.date ? new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--';
        const total = order.total || 0;
        const status = order.status || 'pending';
        const itemsList = order.items ? order.items.map(item => `${item.name} (x${item.quantity || 1})`).join(', ') : 'No items';
        const orderId = order.id || '------';
        const orderIdDisplay = orderId.slice(-6);

        const statusMap = {
            'pending': { label: '⏳ Pending', class: 'pending' },
            'confirmed': { label: '✅ Confirmed', class: 'confirmed' },
            'rejected': { label: '❌ Rejected', class: 'rejected' }
        };
        const info = statusMap[status] || statusMap['pending'];

        html += `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--glass-bg);border-radius:var(--radius-sm);border:1px solid var(--glass-border);margin-bottom:6px;">
                <div>
                    <div style="font-weight:700;font-size:14px;">#${orderIdDisplay}</div>
                    <div style="font-size:12px;color:var(--text-secondary);opacity:0.5;">${itemsList}</div>
                    <div style="font-size:11px;color:var(--text-secondary);opacity:0.3;">${date}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:800;font-size:16px;color:var(--primary);">$${total.toFixed(2)}</div>
                    <span class="status-badge ${info.class}" style="font-size:10px;padding:2px 10px;">${info.label}</span>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
};

// ============================================================
// TOPUP SYSTEM - BALANCE FUNCTIONS
// ============================================================
async function loadUserBalance() {
    if (!currentUser) {
        userBalance = 0;
        updateBalanceDisplay();
        return;
    }
    try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const data = userSnap.data();
            userBalance = data.balance || 0;
            userProfile.balance = userBalance;
            updateBalanceDisplay();
        }
    } catch (error) {
        console.error('Error loading balance:', error);
    }
}

function updateBalanceDisplay() {
    const display = document.getElementById('balanceDisplay');
    if (display) {
        display.textContent = `$${userBalance.toFixed(2)}`;
    }
    const topupDisplay = document.getElementById('topupBalanceDisplay');
    if (topupDisplay) {
        topupDisplay.textContent = `$${userBalance.toFixed(2)}`;
    }
    const balancePaymentSub = document.getElementById('balancePaymentSub');
    if (balancePaymentSub) {
        balancePaymentSub.textContent = `$${userBalance.toFixed(2)} available`;
    }
}

// ============================================================
// TOPUP SYSTEM - REALTIME LISTENER
// ============================================================
function startTopupRealtimeListener() {
    if (!currentUser) return;

    if (topupSubscription) {
        topupSubscription.unsubscribe();
        topupSubscription = null;
    }

    console.log('🔄 Starting topup realtime listener for user:', currentUser.uid);

    topupSubscription = supabase
        .channel('topups-changes')
        .on(
            'postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'topups',
                filter: `user_id=eq.${currentUser.uid}`
            },
            (payload) => {
                console.log('📦 Topup update received:', payload);
                const topup = payload.new;

                if (topup.status === 'completed' && topup.amount_usd) {
                    console.log('💰 Topup approved! Updating balance...');

                    userBalance = (userBalance || 0) + topup.amount_usd;
                    userProfile.balance = userBalance;
                    updateBalanceDisplay();
                    updateUI();
                    updateFullUserMenu();

                    showToast(`💰 $${topup.amount_usd.toFixed(2)} has been added to your balance!`,
                        'success');

                    if (document.getElementById('topupStatusList')) {
                        loadUserTopups();
                    }

                    playNotificationSound();
                }
            }
        )
        .subscribe();
}

function playNotificationSound() {
    try {
        const audioContext = new(window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 880;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;

        oscillator.start();
        setTimeout(() => {
            oscillator.frequency.value = 1100;
        }, 100);
        setTimeout(() => {
            oscillator.stop();
        }, 300);
    } catch (e) {
        console.log('⚠️ Sound notification not available');
    }
}

// ============================================================
// TOPUP SYSTEM - CHECK STATUS
// ============================================================
window.openTopupStatus = async function() {
    if (!currentUser) {
        showToast('⚠️ Please login first', 'warning');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'fullscreen-modal open';
    modal.id = 'topupStatusModal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-header">
            <h2><i class="fas fa-clock" style="color:var(--vip-color);"></i> Topup Status</h2>
            <button class="close-btn" onclick="closeTopupStatus()">&times;</button>
        </div>
        <div style="flex:1; overflow-y:auto; padding:0 4px 20px;">
            <div id="topupStatusList">
                <div style="text-align:center;padding:30px;color:var(--text-secondary);">
                    <i class="fas fa-spinner fa-spin"></i> Loading...
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    await loadUserTopups();
};

window.closeTopupStatus = function() {
    const modal = document.getElementById('topupStatusModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
};

async function loadUserTopups() {
    if (!currentUser) return;

    const container = document.getElementById('topupStatusList');
    if (!container) return;

    try {
        const { data: topups, error } = await supabase
            .from('topups')
            .select('*')
            .eq('user_id', currentUser.uid)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!topups || topups.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:40px 20px;color:var(--text-secondary);">
                    <i class="fas fa-wallet" style="font-size:48px;opacity:0.15;display:block;margin-bottom:12px;"></i>
                    <div style="font-size:18px;font-weight:600;">No topup requests</div>
                    <div style="font-size:13px;opacity:0.4;margin-top:4px;">You haven't made any topup requests yet.</div>
                    <button onclick="closeTopupStatus();openTopupModal();" style="margin-top:12px;padding:8px 24px;background:var(--primary);border:none;border-radius:var(--radius-sm);color:#fff;font-weight:700;cursor:pointer;">
                        <i class="fas fa-plus"></i> Topup Now
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = topups.map(t => {
            const statusColors = {
                'pending': 'var(--pending-color)',
                'completed': 'var(--success)',
                'rejected': 'var(--danger)'
            };
            const statusLabels = {
                'pending': '⏳ Pending Review',
                'completed': '✅ Approved & Added',
                'rejected': '❌ Rejected'
            };
            const statusIcons = {
                'pending': '🕐',
                'completed': '✅',
                'rejected': '❌'
            };
            const date = new Date(t.created_at).toLocaleString();

            return `
                <div style="background:var(--glass-bg);border-radius:var(--radius-md);padding:16px;border:1px solid var(--glass-border);margin-bottom:12px;border-left:4px solid ${statusColors[t.status] || 'var(--border)'};">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                        <div>
                            <div style="font-size:18px;font-weight:800;color:var(--primary);">
                                $${t.amount_usd.toFixed(2)} USDT
                            </div>
                            <div style="font-size:13px;color:var(--text-secondary);font-weight:500;">
                                ${date}
                            </div>
                            ${t.tx_hash ? `
                                <div style="font-size:12px;color:var(--text-secondary);opacity:0.5;font-family:monospace;margin-top:2px;">
                                    TXID: ${t.tx_hash.slice(0, 16)}...${t.tx_hash.slice(-8)}
                                    <a href="https://etherscan.io/tx/${t.tx_hash}" target="_blank" style="color:var(--primary);text-decoration:underline;margin-left:6px;">
                                        <i class="fas fa-external-link-alt"></i>
                                    </a>
                                </div>
                            ` : ''}
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:20px;">${statusIcons[t.status]}</div>
                            <span style="font-size:13px;font-weight:700;color:${statusColors[t.status] || 'var(--text-secondary)'};">
                                ${statusLabels[t.status] || t.status}
                            </span>
                            ${t.status === 'completed' ? `
                                <div style="font-size:12px;color:var(--success);font-weight:600;margin-top:2px;">
                                    💰 Balance updated
                                </div>
                            ` : ''}
                            ${t.status === 'rejected' ? `
                                <div style="font-size:12px;color:var(--danger);font-weight:600;margin-top:2px;">
                                    Contact support
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    ${t.status === 'pending' ? `
                        <div style="margin-top:10px;padding:8px 12px;background:var(--pending-color)20;border-radius:6px;font-size:12px;color:var(--text-secondary);">
                            <i class="fas fa-clock"></i> Your request is being reviewed. This usually takes 5-30 minutes.
                        </div>
                    ` : ''}
                    ${t.status === 'completed' ? `
                        <div style="margin-top:10px;padding:8px 12px;background:var(--success)20;border-radius:6px;font-size:12px;color:var(--success);">
                            <i class="fas fa-check-circle"></i> Your balance has been updated!
                        </div>
                    ` : ''}
                    ${t.status === 'rejected' ? `
                        <div style="margin-top:10px;padding:8px 12px;background:var(--danger)20;border-radius:6px;font-size:12px;color:var(--danger);">
                            <i class="fas fa-exclamation-circle"></i> Your request was rejected. Please contact support.
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        container.innerHTML += `
            <button onclick="loadUserTopups()" style="width:100%;padding:10px;background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--radius-sm);color:var(--text);cursor:pointer;font-weight:600;margin-top:8px;">
                <i class="fas fa-sync-alt"></i> Refresh
            </button>
        `;

    } catch (error) {
        console.error('Error loading topups:', error);
        container.innerHTML = `
            <div style="text-align:center;padding:20px;color:var(--danger);">
                ❌ Failed to load topup status
                <button onclick="loadUserTopups()" style="display:block;margin:8px auto;padding:6px 16px;background:var(--primary);border:none;border-radius:var(--radius-sm);color:#fff;cursor:pointer;">Retry</button>
            </div>
        `;
    }
}

// ============================================================
// TOPUP SYSTEM - MODAL FUNCTIONS
// ============================================================
window.openTopupModal = function() {
    if (!currentUser) {
        showToast('⚠️ Please login first to topup', 'warning');
        openAuthModal();
        return;
    }
    document.getElementById('topupModal').classList.add('open');
    document.body.style.overflow = 'hidden';
    updateBalanceDisplay();
    document.querySelectorAll('.topup-amount').forEach(el => el.style.borderColor = 'var(--glass-border)');
    document.getElementById('topupSelectedAmount').textContent = '$0.00';
    document.getElementById('topupLtcAmount').textContent = '0.0000 LTC';
    document.getElementById('customAmountContainer').style.display = 'none';
    document.getElementById('topupStatus').innerHTML = '';
    selectedTopupAmount = 0;
    selectTopupCurrency('USDT');
};

window.closeTopupModal = function() {
    document.getElementById('topupModal').classList.remove('open');
    document.body.style.overflow = '';
};

// ============================================================
// TOPUP SYSTEM - SELECT CURRENCY
// ============================================================
window.selectTopupCurrency = function(currency) {
    selectedTopupCurrency = currency;
    document.getElementById('topupCurrency').value = currency;

    const usdtBtn = document.getElementById('topupCurrencyUSDT');
    const ltcBtn = document.getElementById('topupCurrencyLTC');

    if (currency === 'USDT') {
        if (usdtBtn) {
            usdtBtn.style.borderColor = 'var(--primary)';
            usdtBtn.style.background = 'var(--primary-glow)';
            usdtBtn.style.color = 'var(--text)';
            usdtBtn.style.fontWeight = '700';
        }
        if (ltcBtn) {
            ltcBtn.style.borderColor = 'var(--glass-border)';
            ltcBtn.style.background = 'var(--glass-bg)';
            ltcBtn.style.color = 'var(--text-secondary)';
            ltcBtn.style.fontWeight = '600';
        }
    } else {
        if (ltcBtn) {
            ltcBtn.style.borderColor = 'var(--primary)';
            ltcBtn.style.background = 'var(--primary-glow)';
            ltcBtn.style.color = 'var(--text)';
            ltcBtn.style.fontWeight = '700';
        }
        if (usdtBtn) {
            usdtBtn.style.borderColor = 'var(--glass-border)';
            usdtBtn.style.background = 'var(--glass-bg)';
            usdtBtn.style.color = 'var(--text-secondary)';
            usdtBtn.style.fontWeight = '600';
        }
    }

    updateTopupAmounts(currency);
};

function updateTopupAmounts(currency) {
    const container = document.getElementById('topupAmountsContainer');
    if (!container) return;

    const ltcPrice = cryptoPrices.ltc || 42;
    const amounts = [5, 10, 25, 50, 100];

    container.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:16px;">
            ${amounts.map(amount => {
                let displayText, subText;
                if (currency === 'USDT') {
                    displayText = `$${amount}`;
                    subText = `≈ ${(amount / ltcPrice).toFixed(4)} LTC`;
                } else {
                    const ltcAmount = amount / ltcPrice;
                    displayText = `${ltcAmount.toFixed(4)} LTC`;
                    subText = `≈ $${amount}`;
                }
                return `
                    <div class="topup-amount" data-amount="${amount}" onclick="selectTopupAmount(${amount})">
                        <div class="amount-value">${displayText}</div>
                        <div class="amount-sub">${subText}</div>
                    </div>
                `;
            }).join('')}
            <div class="topup-amount" data-amount="custom" onclick="selectTopupAmount('custom')">
                <div class="amount-value">Custom</div>
                <div class="amount-sub">Enter amount</div>
            </div>
        </div>
        <div id="customAmountContainer" style="display:none; margin-top:12px;">
            <label style="font-size:13px; font-weight:600; display:block; margin-bottom:4px;">
                Enter Amount (${currency === 'USDT' ? '$' : 'LTC'})
            </label>
            <input type="number" id="customTopupAmount" placeholder="Enter amount" 
                   style="width:100%; padding:10px 14px; border:2px solid var(--border); border-radius:var(--radius-sm);
                          background:var(--card-bg); color:var(--text); font-size:16px; outline:none;" 
                   min="0.01" step="0.01" />
            <div style="font-size:11px; color:var(--text-secondary); opacity:0.4; margin-top:4px;">
                Minimum amount: $1.00
            </div>
        </div>
    `;
}

// ============================================================
// selectTopupAmount
// ============================================================
window.selectTopupAmount = function(amount) {
    document.querySelectorAll('.topup-amount').forEach(el => {
        el.style.borderColor = 'var(--glass-border)';
        el.style.background = 'var(--glass-bg)';
    });

    if (amount === 'custom') {
        document.getElementById('customAmountContainer').style.display = 'block';
        selectedTopupAmount = 0;
        document.getElementById('topupSelectedAmount').textContent = 'Enter amount';
        document.getElementById('topupLtcAmount').textContent = '0.0000 LTC';

        const customInput = document.getElementById('customTopupAmount');
        if (customInput) {
            customInput.value = '';
            customInput.oninput = function() {
                const val = parseFloat(this.value);
                if (val && val > 0) {
                    const currency = selectedTopupCurrency || 'USDT';
                    const ltcPrice = cryptoPrices.ltc || 42;
                    let displayText, ltcDisplay;
                    if (currency === 'USDT') {
                        displayText = `$${val.toFixed(2)}`;
                        ltcDisplay = `${(val / ltcPrice).toFixed(4)} LTC`;
                    } else {
                        const ltcAmount = val / ltcPrice;
                        displayText = `${ltcAmount.toFixed(4)} LTC`;
                        ltcDisplay = `${ltcAmount.toFixed(4)} LTC`;
                    }
                    document.getElementById('topupSelectedAmount').textContent = displayText;
                    document.getElementById('topupLtcAmount').textContent = ltcDisplay;
                    selectedTopupAmount = val;
                }
            };
        }

        const customEl = document.querySelector('.topup-amount[data-amount="custom"]');
        if (customEl) {
            customEl.style.borderColor = 'var(--primary)';
            customEl.style.background = 'var(--primary-glow)';
        }
        return;
    }

    document.getElementById('customAmountContainer').style.display = 'none';
    const el = document.querySelector(`.topup-amount[data-amount="${amount}"]`);
    if (el) {
        el.style.borderColor = 'var(--primary)';
        el.style.background = 'var(--primary-glow)';
    }
    selectedTopupAmount = amount;
    const ltcPrice = cryptoPrices.ltc || 42;
    const currency = selectedTopupCurrency || 'USDT';

    let displayText, ltcDisplay;
    if (currency === 'USDT') {
        displayText = `$${amount.toFixed(2)}`;
        ltcDisplay = `${(amount / ltcPrice).toFixed(4)} LTC`;
    } else {
        const ltcAmount = amount / ltcPrice;
        displayText = `${ltcAmount.toFixed(4)} LTC`;
        ltcDisplay = `${ltcAmount.toFixed(4)} LTC`;
    }
    document.getElementById('topupSelectedAmount').textContent = displayText;
    document.getElementById('topupLtcAmount').textContent = ltcDisplay;
};

// ============================================================
// TOPUP SYSTEM - PROCESS TOPUP
// ============================================================
window.processTopup = async function() {
    if (!currentUser) {
        showToast('⚠️ Please login first', 'warning');
        return;
    }
    const btn = document.getElementById('topupProcessBtn');
    let amount = selectedTopupAmount;
    const customInput = document.getElementById('customTopupAmount');
    if (document.getElementById('customAmountContainer').style.display !== 'none' && customInput) {
        const customVal = parseFloat(customInput.value);
        if (!customVal || customVal <= 0) {
            showToast('⚠️ Please enter a valid amount', 'warning');
            if (btn) hideButtonLoading(btn);
            return;
        }
        amount = customVal;
    }
    if (!amount || amount <= 0) {
        showToast('⚠️ Please select or enter an amount', 'warning');
        if (btn) hideButtonLoading(btn);
        return;
    }
    const currency = selectedTopupCurrency || 'USDT';
    const statusEl = document.getElementById('topupStatus');
    statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating request...';
    statusEl.style.color = 'var(--text-secondary)';
    try {
        const requestBody = {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            amount: amount,
            amount_usd: amount,
            currency: currency,
            txHash: null
        };
        console.log('📤 Sending topup request with amount_usd:', requestBody);
        const response = await fetch('https://kvsyzgavfxnwqmtsginv.supabase.co/functions/v1/create-topup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Accept': 'application/json',
            },
            mode: 'cors',
            body: JSON.stringify(requestBody)
        });
        const responseText = await response.text();
        console.log('📥 Raw response:', responseText);
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('❌ Failed to parse JSON:', e);
            throw new Error(`Invalid server response: ${responseText.substring(0, 100)}`);
        }
        if (!response.ok || !result.success) {
            console.error('❌ Topup error:', result);
            throw new Error(result.error || result.message || 'Failed to create topup');
        }
        let warningHtml = '';
        if (result.currency === 'USDT') {
            warningHtml = `
                <div style="background:var(--danger)20; border-left:4px solid var(--danger); padding:10px 12px; border-radius:6px; margin-bottom:10px;">
                    <div style="font-weight:700; color:var(--danger);">
                        <i class="fas fa-exclamation-triangle"></i> IMPORTANT WARNING
                    </div>
                    <div style="font-size:12px; color:var(--text-secondary);">
                        Send <strong>ONLY USDT</strong> on the <strong>ERC20</strong> network.
                        Sending other tokens or using other networks may result in <strong>permanent loss</strong>.
                    </div>
                </div>
            `;
        }
        statusEl.innerHTML = `
            <div style="background:var(--primary-glow); border-radius:8px; padding:16px; border:1px solid var(--primary);">
                <div style="font-weight:700; color:var(--primary); font-size:16px; margin-bottom:12px;">
                    💳 Complete Your Payment
                </div>
                ${warningHtml}
                <div style="background:var(--card-bg); border-radius:6px; padding:12px; margin-bottom:12px; border:1px solid var(--border);">
                    <div style="display:flex; justify-content:space-between; padding:4px 0; font-size:14px;">
                        <span style="color:var(--text-secondary);">Amount:</span>
                        <span style="font-weight:700; color:var(--primary);">${result.displayAmount}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding:4px 0; font-size:14px;">
                        <span style="color:var(--text-secondary);">Network:</span>
                        <span style="font-weight:700; color:var(--vip-color);">${result.network}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding:4px 0; font-size:14px; align-items:center;">
                        <span style="color:var(--text-secondary);">Wallet Address:</span>
                        <div style="display:flex; align-items:center; gap:6px;">
                            <span style="font-weight:700; font-family:monospace; font-size:12px; word-break:break-all; max-width:180px;" id="walletAddressDisplay2">${result.walletAddress}</span>
                            <button onclick="copyToClipboard('${result.walletAddress}')" style="background:var(--primary); border:none; color:#fff; padding:2px 8px; border-radius:4px; cursor:pointer; font-size:11px;">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding:4px 0; font-size:14px;">
                        <span style="color:var(--text-secondary);">Memo:</span>
                        <span style="font-weight:700; font-family:monospace; font-size:12px;">${result.instructions?.memo || ''}</span>
                    </div>
                </div>
                <div style="margin-bottom:12px;">
                    <label style="font-size:13px; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:4px;">
                        📋 Transaction Hash (TXID)
                    </label>
                    <input type="text" id="topupTxHash" placeholder="Paste your transaction hash here..."
                           style="width:100%; padding:10px 14px; border:2px solid var(--border); border-radius:var(--radius-sm);
                                  background:var(--card-bg); color:var(--text); font-size:14px; outline:none; font-family:monospace;" />
                    <div style="font-size:11px; color:var(--text-secondary); opacity:0.4; margin-top:4px;">
                        <i class="fas fa-info-circle"></i> Copy the TXID from your wallet after sending
                    </div>
                </div>
                <button onclick="submitTopupWithTxHash('${result.topupId}', ${amount})"
                        style="width:100%; padding:12px; border:none; border-radius:var(--radius-sm);
                               background:var(--success); color:#0a0a1a; font-weight:800; font-size:16px; cursor:pointer;">
                    <i class="fas fa-check-circle"></i> Submit for Verification
                </button>
                <div style="font-size:11px; color:var(--text-secondary); opacity:0.5; margin-top:8px; text-align:center;">
                    ⏳ Your request will be reviewed within 5-30 minutes
                    <br>
                    <span style="font-size:10px;">Order ID: ${result.paymentId}</span>
                </div>
            </div>
        `;
        window._currentTopupId = result.topupId;
        window._currentTopupAmount = amount;
        showToast(`📤 Payment instructions generated for ${result.displayCurrency}`, 'info');
        if (btn) hideButtonLoading(btn, 'Submitted!');
    } catch (error) {
        console.error('❌ Topup error:', error);
        let errorMsg = error.message;
        if (error.message.includes('Failed to fetch')) {
            errorMsg = 'Cannot connect to server. Please check your internet connection and try again.';
        }
        statusEl.innerHTML = `<span style="color:var(--danger);">❌ ${errorMsg}</span>`;
        showToast('❌ Error: ' + errorMsg, 'error');
        if (btn) hideButtonLoading(btn);
    }
};

// ============================================================
// TOPUP SYSTEM - SUBMIT WITH TX HASH
// ============================================================
window.submitTopupWithTxHash = async function(topupId, amount) {
    const txHashInput = document.getElementById('topupTxHash');
    const txHash = txHashInput?.value?.trim();

    if (!txHash) {
        showToast('⚠️ Please paste your transaction hash', 'warning');
        txHashInput.style.borderColor = 'var(--danger)';
        setTimeout(() => { txHashInput.style.borderColor = ''; }, 3000);
        return;
    }

    if (txHash.length < 10) {
        showToast('⚠️ Please enter a valid transaction hash', 'warning');
        return;
    }

    const statusEl = document.getElementById('topupStatus');
    statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting for verification...';

    try {
        const { error } = await supabase
            .from('topups')
            .update({
                tx_hash: txHash,
                updated_at: new Date().toISOString()
            })
            .eq('id', topupId);

        if (error) throw error;

        const adminMessage = `
👤 *User Email:* ${currentUser.email || 'N/A'}
🆔 *User ID:* ${currentUser.uid}
💵 *Amount:* $${amount.toFixed(2)}
🔗 *TXID:* \`${txHash}\`
📅 *Date:* ${new Date().toLocaleString()}
🔔 *Status:* Pending - Awaiting verification

⚠️ *Please verify this transaction before approving.*
        `;

        await sendAdminNotification('💰 New Topup Request - Pending Verification', adminMessage);

        if (userProfile.telegramChatId) {
            const userMessage = `
📤 *TOPUP REQUEST SUBMITTED*

✅ Your topup request has been submitted successfully!

💵 *Amount:* $${amount.toFixed(2)}
🔗 *TXID:* \`${txHash}\`
📅 *Date:* ${new Date().toLocaleString()}

⏳ Your request is being reviewed by our team.
You will receive a notification once approved.

🔗 *Visit Store:* https://zi-store.online
            `;
            await sendTelegramNotification(userProfile.telegramChatId, userMessage);
        }

        statusEl.innerHTML = `
            <div style="background:var(--success-glow); border-radius:8px; padding:12px; border:1px solid var(--success);">
                <div style="font-weight:700; color:var(--success); font-size:16px;">✅ Request Submitted!</div>
                <div style="font-size:13px; color:var(--text-secondary); margin-top:4px;">
                    Amount: $${amount.toFixed(2)}
                    <br>
                    TXID: <span style="font-family:monospace; font-size:11px; word-break:break-all;">${txHash}</span>
                </div>
                <div style="font-size:12px; color:var(--text-secondary); opacity:0.6; margin-top:6px;">
                    ⏳ Your request is being reviewed by our team.
                    <br>
                    You will receive a notification once approved.
                </div>
                <button onclick="closeTopupModal()" style="margin-top:8px; padding:6px 20px; background:var(--primary); border:none; border-radius:var(--radius-sm); color:#fff; font-weight:700; cursor:pointer;">
                    <i class="fas fa-check"></i> Done
                </button>
            </div>
        `;

        showToast('✅ Request submitted! Waiting for verification.', 'success');

        setTimeout(() => {
            closeTopupModal();
        }, 5000);

    } catch (error) {
        console.error('Submit error:', error);
        statusEl.innerHTML = `<span style="color:var(--danger);">❌ ${error.message}</span>`;
        showToast('❌ Error: ' + error.message, 'error');
    }
};

// ============================================================
// TOPUP SYSTEM - ADMIN FUNCTIONS
// ============================================================
window.approveTopup = async function(topupId) {
    if (!currentUser || !isAdminCached) {
        showToast('⛔ Unauthorized', 'error');
        return;
    }

    if (!confirm('Approve this topup and add balance to user?')) return;

    try {
        const { data: topupData, error: fetchError } = await supabase
            .from('topups')
            .select('*')
            .eq('id', topupId)
            .single();

        if (fetchError) throw fetchError;

        const response = await fetch('https://kvsyzgavfxnwqmtsginv.supabase.co/functions/v1/approve-topup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
                topupId: topupId,
                approve: true,
                adminEmail: currentUser.email
            })
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Failed to approve topup');
        }

        showToast(`✅ Topup approved successfully!`, 'success');
        loadAdminTopups();
        loadUserBalance();
        
        if (topupData) {
            const adminMessage = `
👤 *User:* ${topupData?.user_email || 'Unknown'}
💵 *Amount:* $${topupData?.amount_usd || 0}
🔗 *TXID:* \`${topupData?.tx_hash || 'N/A'}\`
📅 *Date:* ${new Date().toLocaleString()}
✅ *Status:* APPROVED
            `;
            await sendAdminNotification('✅ Topup Approved', adminMessage);
            
            await sendTelegramTopupNotification(
                topupData.user_id,
                topupData.amount_usd,
                topupData.tx_hash
            );
        }

    } catch (error) {
        console.error('Approve error:', error);
        showToast('❌ Error: ' + error.message, 'error');
    }
};

window.rejectTopup = async function(topupId) {
    if (!currentUser || !isAdminCached) {
        showToast('⛔ Unauthorized', 'error');
        return;
    }

    if (!confirm('Reject this topup?')) return;

    try {
        const { data: topupData, error: fetchError } = await supabase
            .from('topups')
            .select('*')
            .eq('id', topupId)
            .single();

        if (fetchError) throw fetchError;

        const response = await fetch('https://kvsyzgavfxnwqmtsginv.supabase.co/functions/v1/approve-topup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
                topupId: topupId,
                approve: false,
                adminEmail: currentUser.email
            })
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Failed to reject topup');
        }

        showToast('✅ Topup rejected', 'success');
        loadAdminTopups();

    } catch (error) {
        console.error('Reject error:', error);
        showToast('❌ Error: ' + error.message, 'error');
    }
};

async function loadAdminTopups() {
    if (!currentUser || !isAdminCached) return;

    const container = document.getElementById('adminTopupsContainer');
    if (!container) return;

    try {
        const { data: topups, error } = await supabase
            .from('topups')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const countEl = document.getElementById('adminTopupsCount');
        if (countEl) countEl.textContent = topups?.length || 0;

        if (!topups || topups.length === 0) {
            container.innerHTML =
                `<div style="text-align:center;padding:30px;color:var(--text-secondary);opacity:0.5;">No topup requests</div>`;
            return;
        }

        container.innerHTML = topups.map(t => {
            const statusColors = {
                'pending': 'var(--pending-color)',
                'completed': 'var(--success)',
                'rejected': 'var(--danger)'
            };
            const statusLabels = {
                'pending': '⏳ Pending',
                'completed': '✅ Completed',
                'rejected': '❌ Rejected'
            };
            const date = new Date(t.created_at).toLocaleString();

            return `
                <div class="admin-item" style="border-left:4px solid ${statusColors[t.status] || 'var(--border)'};">
                    <div class="item-info">
                        <div class="item-title">
                            💰 $${t.amount_usd.toFixed(2)} - ${t.user_email || t.user_id}
                            <span style="font-size:11px;font-weight:400;opacity:0.5;">${t.payment_id || t.id}</span>
                        </div>
                        <div class="item-meta">
                            📅 ${date}
                            ${t.tx_hash ? `• 🔗 TXID: <span style="font-family:monospace;font-size:11px;word-break:break-all;">${t.tx_hash}</span>` : ''}
                            • Status: ${statusLabels[t.status] || t.status}
                        </div>
                    </div>
                    <div class="item-actions">
                        ${t.status === 'pending' ? `
                            <button onclick="window.approveTopup('${t.id}')" style="background:var(--success);color:#0a0a1a;border:none;padding:4px 12px;border-radius:6px;cursor:pointer;font-weight:700;">
                                ✅ Approve
                            </button>
                            <button onclick="window.rejectTopup('${t.id}')" style="background:var(--danger);color:#fff;border:none;padding:4px 12px;border-radius:6px;cursor:pointer;font-weight:700;">
                                ❌ Reject
                            </button>
                        ` : `
                            <span style="font-size:12px;color:var(--text-secondary);opacity:0.4;">
                                ${t.status === 'completed' ? '✅ Verified' : '❌ Rejected'}
                            </span>
                        `}
                        ${t.tx_hash ? `<a href="https://etherscan.io/tx/${t.tx_hash}" target="_blank" style="color:var(--primary);font-size:12px;text-decoration:underline;">🔍 View</a>` : ''}
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading topups:', error);
        container.innerHTML =
            `<div style="text-align:center;padding:30px;color:var(--danger);">Failed to load topups</div>`;
    }
}

// ============================================================
// TOPUP SYSTEM - TELEGRAM NOTIFICATION
// ============================================================
async function sendTelegramTopupNotification(userId, amount, txHash = null) {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            console.log('⚠️ User not found for Telegram notification');
            return;
        }

        const userData = userSnap.data();
        const chatId = userData.telegramChatId;

        if (!chatId) {
            console.log('ℹ️ User has no Telegram linked');
            return;
        }

        const message = `
💰 *TOPUP APPROVED!*

✅ Your topup request has been approved!

📊 *Amount:* $${amount.toFixed(2)} USDT
💳 *Method:* USDT (ERC20)
${txHash ? `🔗 *TXID:* \`${txHash}\`` : ''}
📅 *Date:* ${new Date().toLocaleString()}

🎉 Your balance has been updated successfully!
💡 You can now use your balance to purchase products instantly.

🔗 *Visit Store:* https://zi-store.online
        `;

        await sendTelegramNotification(chatId, message);
        console.log('✅ Telegram notification sent for topup approval');

    } catch (error) {
        console.error('❌ Error sending Telegram notification:', error);
    }
}

// ============================================================
// COPY HELPER
// ============================================================
window.copyToClipboard = function(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => showToast('✅ Copied!', 'success'))
            .catch(() => fallbackCopy(text));
    } else {
        fallbackCopy(text);
    }
};

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showToast('✅ Copied!', 'success');
    } catch (e) {
        showToast('❌ Failed to copy', 'error');
    }
    document.body.removeChild(textarea);
}

// ============================================================
// CHECKOUT WITH BALANCE
// ============================================================
window.checkoutWithBalance = function() {
    if (cart.length === 0) {
        showToast('⚠️ Cart is empty', 'warning');
        return;
    }
    let total = 0;
    cart.forEach(item => {
        total += item.price * (item.quantity || 1);
    });
    let finalTotal = total;
    if (userBalance >= finalTotal) {
        processBalancePayment(finalTotal);
    } else {
        showToast(`⚠️ Insufficient balance! Need $${finalTotal.toFixed(2)}, have $${userBalance.toFixed(2)}`,
            'warning');
        setTimeout(() => openTopupModal(), 500);
    }
};

// ============================================================
// SUPPORT FUNCTIONS
// ============================================================
window.toggleSupportMenu = function() {
    const float = document.getElementById('supportFloat');
    if (float) {
        float.classList.toggle('open');
    }
};

window.openSupportModal = function() {
    const modal = document.getElementById('supportModal');
    if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    const float = document.getElementById('supportFloat');
    if (float) {
        float.classList.remove('open');
    }
};

window.closeSupportModal = function() {
    const modal = document.getElementById('supportModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
};

window.openWhatsAppSupport = function() {
    const phone = '1234567890';
    const message = 'Hi, I need help';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
};

window.openTelegramSupport = function() {
    const username = 'Mitalica69';
    const message = 'Hi, I need help';
    window.open(`https://t.me/${username}?start=support`, '_blank');
};

window.openEmailSupport = function() {
    const email = 'idriss.zribi13@gmail.com';
    const subject = 'Support Request';
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
};

window.openPhoneSupport = function() {
    const phone = '1234567890';
    window.location.href = `tel:${phone}`;
};

// ============================================================
// COOKIE CONSENT FUNCTIONS
// ============================================================
let cookieConsentStatus = localStorage.getItem('cookieConsent');

window.acceptCookies = function() {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('analyticsConsent', 'true');
    document.getElementById('cookieConsent').classList.remove('show');
    enableAnalytics();
    showToast('✅ Cookies accepted', 'success');
};

window.rejectCookies = function() {
    localStorage.setItem('cookieConsent', 'rejected');
    localStorage.setItem('analyticsConsent', 'false');
    document.getElementById('cookieConsent').classList.remove('show');
    disableAnalytics();
    showToast('❌ Cookies rejected', 'info');
};

window.openCookieSettings = function() {
    const modal = document.getElementById('cookieSettingsModal');
    if (modal) {
        const analyticsToggle = document.getElementById('analyticsToggle');
        if (analyticsToggle) {
            const consent = localStorage.getItem('analyticsConsent');
            analyticsToggle.checked = consent !== 'false';
        }
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
};

window.closeCookieSettings = function() {
    const modal = document.getElementById('cookieSettingsModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
};

window.saveCookieSettings = function() {
    const analyticsToggle = document.getElementById('analyticsToggle');
    const analyticsEnabled = analyticsToggle ? analyticsToggle.checked : true;

    localStorage.setItem('cookieConsent', 'custom');
    localStorage.setItem('analyticsConsent', analyticsEnabled ? 'true' : 'false');

    if (analyticsEnabled) {
        enableAnalytics();
    } else {
        disableAnalytics();
    }

    document.getElementById('cookieConsent').classList.remove('show');
    closeCookieSettings();
    showToast('✅ Settings saved', 'success');
};

function enableAnalytics() {
    try {
        if (typeof analytics !== 'undefined' && analytics.setAnalyticsCollectionEnabled) {
            analytics.setAnalyticsCollectionEnabled(true);
            console.log('✅ Firebase Analytics enabled');
        }
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
            console.log('✅ Google Analytics enabled');
        }
    } catch (e) {
        console.log('⚠️ Analytics enable error:', e);
    }
}

function disableAnalytics() {
    try {
        if (typeof analytics !== 'undefined' && analytics.setAnalyticsCollectionEnabled) {
            analytics.setAnalyticsCollectionEnabled(false);
            console.log('❌ Firebase Analytics disabled');
        }
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });
            console.log('❌ Google Analytics disabled');
        }
    } catch (e) {
        console.log('⚠️ Analytics disable error:', e);
    }
}

function checkCookieConsent() {
    const consent = localStorage.getItem('cookieConsent');
    const analyticsConsent = localStorage.getItem('analyticsConsent');

    if (!consent) {
        setTimeout(() => {
            const banner = document.getElementById('cookieConsent');
            if (banner) {
                banner.classList.add('show');
            }
        }, 2000);
    } else if (consent === 'accepted' || analyticsConsent === 'true') {
        enableAnalytics();
    } else if (consent === 'rejected' || analyticsConsent === 'false') {
        disableAnalytics();
    } else if (consent === 'custom') {
        if (analyticsConsent === 'true') {
            enableAnalytics();
        } else {
            disableAnalytics();
        }
    }
}

window.closeCookieBanner = function() {
    const banner = document.getElementById('cookieConsent');
    if (banner) {
        banner.classList.remove('show');
    }
};

// ============================================================
// TELEGRAM BANNER
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
    banner.querySelector('.banner-title').innerHTML =
    '🔔 Stay Connected! <span class="badge-new">New</span>';
    banner.querySelector('.banner-subtitle').textContent = 'Link your Telegram account to receive instant order notifications';
    banner.querySelector('.banner-action').innerHTML = '<i class="fab fa-telegram-plane"></i> Link Now';
    banner.querySelector('.banner-action').onclick = () => bindTelegram();
    banner.querySelector('.banner-icon i').className = 'fab fa-telegram-plane';
    banner.style.display = 'block';
    banner.style.animation = 'none';
    setTimeout(() => { banner.style.animation =
            'bannerSlideDown 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'; }, 10);
}

function closeTelegramBanner() {
    const banner = document.getElementById('telegramBanner');
    if (banner) { banner.classList.add('hidden');
        localStorage.setItem('telegram_banner_hidden', 'true');
        setTimeout(() => { localStorage.removeItem('telegram_banner_hidden'); if (!userProfile
                .telegramChatId) { showTelegramBanner(); } }, 600000); }
}

function showTelegramBannerAgain() { localStorage.removeItem('telegram_banner_hidden');
    showTelegramBanner(); }

function addBannerAdminControls() { /* Will be implemented in admin */ }

function adminToggleBanner(show) {
    if (show) { localStorage.setItem('telegram_banner_admin_disabled', 'false'); } else { localStorage.setItem(
            'telegram_banner_admin_disabled', 'true'); const banner = document.getElementById(
            'telegramBanner'); if (banner) banner.classList.add('hidden'); }
    addBannerAdminControls();
    if (show) { localStorage.removeItem('telegram_banner_hidden');
        setTimeout(showTelegramBanner, 300); }
}

function resetBannerForAll() { localStorage.removeItem('telegram_banner_admin_disabled');
    localStorage.removeItem('telegram_banner_hidden');
    showToast('🔄 Banner reset', 'info');
    addBannerAdminControls();
    setTimeout(showTelegramBanner, 300); }

// ============================================================
// CLOUDINARY UPLOAD
// ============================================================
async function uploadToCloudinary(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST',
                body: formData });
        const data = await response.json();
        return data.secure_url || null;
    } catch (error) { console.error('Cloudinary upload error:', error); return null; }
}

// ============================================================
// DIRECTION FIX (CLOSE BUTTONS ON RIGHT)
// ============================================================
function fixDirection() {
    document.querySelectorAll('.header, .logo, .header-actions, .modal-content, .fullscreen-modal, .admin-panel')
        .forEach(el => {
            el.style.direction = 'ltr';
            el.style.textAlign = 'left';
        });

    document.querySelectorAll('.modal-close, .close-modal-btn').forEach(el => {
        el.style.position = 'absolute';
        el.style.top = '10px';
        el.style.right = '10px';
        el.style.left = 'auto';
        el.style.zIndex = '100';
        el.style.margin = '0';
    });

    document.querySelectorAll('.fullscreen-modal .close-btn, #adminPanel .admin-close-btn').forEach(el => {
        el.style.position = 'static';
        el.style.right = 'auto';
        el.style.left = 'auto';
        el.style.top = 'auto';
    });

    console.log('✅ Direction fixed: Close buttons on right');
}
window.fixHeaderAndModals = fixDirection;

// ============================================================
// COPY LICENCE & EXPORT
// ============================================================

// دالة مساعدة للنسخ (تُستخدم في جميع دوال النسخ)
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showToast('✅ Copied!', 'success');
    } catch (e) {
        showToast('❌ Failed to copy', 'error');
    }
    document.body.removeChild(textarea);
}

// نسخ رمز الترخيص
window.copyLicenceCode = function(code) {
    if (!code) {
        showToast('⚠️ No code to copy', 'warning');
        return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code)
            .then(() => showToast('✅ Licence code copied!', 'success'))
            .catch(() => fallbackCopy(code));
    } else {
        fallbackCopy(code);
    }
};

// نسخ النص إلى الحافظة (عام)
window.copyToClipboard = function(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => showToast('✅ Copied!', 'success'))
            .catch(() => fallbackCopy(text));
    } else {
        fallbackCopy(text);
    }
};

// إنشاء فاتورة PDF
window.generateInvoice = function(orderData) {
    if (!orderData) {
        showToast('❌ No order data for invoice', 'error');
        return;
    }
    try {
        let order = typeof orderData === 'string' ? JSON.parse(orderData) : orderData;
        if (!order.id) {
            order.id = 'INV-' + Date.now().toString().slice(-6);
        }
        const invoiceHtml =
            `<html><head><title>Invoice #${order.id}</title><style>body{font-family:Arial;padding:40px;background:#fff;color:#000;}h1{color:#333;}table{width:100%;border-collapse:collapse;margin:20px 0;}th,td{padding:10px;border:1px solid #ddd;text-align:left;}th{background:#f5f5f5;}.total{font-size:18px;font-weight:bold;}</style></head><body><h1>🧾 Invoice</h1><p><strong>Order ID:</strong> ${order.id}</p><p><strong>Date:</strong> ${order.date ? new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '--'}</p><p><strong>Status:</strong> ${order.status || 'Pending'}</p><table><thead><tr><th>Product</th><th>Quantity</th><th>Price</th><th>Total</th></tr></thead><tbody>${(order.items || []).map(item => `<tr><td>${item.name}${item.selectedQuantity ? ' (x'+item.selectedQuantity+')' : ''}</td><td>${item.quantity || 1}</td><td>$${(item.price || 0).toFixed(2)}</td><td>$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td></tr>`).join('')}</tbody></table><div class="total">Total: $${(order.total || 0).toFixed(2)}</div><div class="status">Payment Method: ${order.method || 'N/A'}</div><hr><p style="color:gray;">Thank you for your purchase at ZI Store!</p></body></html>`;
        const win = window.open('', '_blank');
        if (!win) {
            showToast('⚠️ Please allow popups to generate invoice', 'warning');
            return;
        }
        win.document.write(invoiceHtml);
        win.document.close();
        win.print();
        showToast('📄 Invoice generated!', 'success');
    } catch (error) {
        console.error('Invoice generation error:', error);
        showToast('❌ Failed to generate invoice', 'error');
    }
};

// تصدير الطلبات إلى CSV
window.exportOrders = function() {
    if (!currentUser || !isAdminCached) {
        showToast('⛔ Unauthorized', 'error');
        return;
    }
    if (!allOrders || allOrders.length === 0) {
        showToast('📭 No orders to export', 'info');
        return;
    }
    try {
        let csv = 'Order ID,User,Email,Total,Status,Date,Items\n';
        allOrders.forEach(order => {
            const items = order.items ? order.items.map(i => i.name + (i.selectedQuantity ? ' (' + i
                    .selectedQuantity + ')' : '')).join('; ') : '';
            csv += `${order.orderId || ''},${order.userName || ''},${order.userEmail || ''},${order.total || 0},${order.status || 'pending'},${new Date(order.date).toLocaleDateString()},${items}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('📥 Orders exported!', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showToast('❌ Export failed', 'error');
    }
};
// ============================================================
// ADMIN PAYMENTS
// ============================================================
function refreshAdminPayments() {
    if (!currentUser || !isAdminCached) return;
    const tbody = document.getElementById('adminPaymentsBody');
    if (!tbody) return;
    tbody.innerHTML =
        '<tr><td colspan="7" style="text-align:center;padding:20px;"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';

    const usersRef = collection(db, 'users');
    getDocs(usersRef).then((snapshot) => {
        let allPayments = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            const history = data.history || [];
            history.forEach(order => {
                const currency = order.items?.[0]?.currency || 'LTC';
                const amount = order.total || 0;
                allPayments.push({
                    id: order.id || '#' + String(Date.now()).slice(-6),
                    userId: doc.id,
                    userEmail: data.email || 'Unknown',
                    userName: data.name || 'Unknown',
                    amount: amount,
                    currency: currency,
                    date: order.date || new Date().toISOString(),
                    status: order.status || 'pending',
                    method: order.method || 'Unknown',
                    txHash: order.txHash || 'N/A',
                    screenshotUrl: order.screenshotUrl || null
                });
            });
        });
        allPayments.sort((a, b) => new Date(b.date) - new Date(a.date));

        const total = allPayments.length;
        const pending = allPayments.filter(p => p.status === 'pending').length;
        const completed = allPayments.filter(p => p.status === 'confirmed' || p.status === 'completed')
            .length;
        const rejected = allPayments.filter(p => p.status === 'rejected').length;
        document.getElementById('adminPaymentTotal').textContent = total;
        document.getElementById('adminPaymentPending').textContent = pending;
        document.getElementById('adminPaymentCompleted').textContent = completed;
        document.getElementById('adminPaymentRejected').textContent = rejected;

        if (allPayments.length === 0) {
            tbody.innerHTML =
                '<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--text-secondary);">No payments found.</td></tr>';
            return;
        }

        let rows = '';
        allPayments.forEach(p => {
            const statusBadge =
                `<span class="status-badge ${p.status === 'confirmed' ? 'confirmed' : p.status}">${p.status.charAt(0).toUpperCase()+p.status.slice(1)}</span>`;
            const dateStr = new Date(p.date).toLocaleDateString('en-US', { month: 'short',
                day: 'numeric', year: 'numeric' });
            rows += `
                <tr style="border-bottom:1px solid var(--border);">
                    <td style="padding:6px 4px; font-family:monospace; font-size:12px;">${p.id}</td>
                    <td style="padding:6px 4px;">${p.userEmail}</td>
                    <td style="padding:6px 4px; font-weight:700; color:var(--primary);">$${p.amount.toFixed(2)}</td>
                    <td style="padding:6px 4px;">${p.currency}</td>
                    <td style="padding:6px 4px; font-size:12px; color:var(--text-secondary);">${dateStr}</td>
                    <td style="padding:6px 4px;">${statusBadge}</td>
                    <td style="padding:6px 4px;">
                        ${p.status === 'pending' ?
                            `<button onclick="adminApprovePayment('${p.id}','${p.userId}')" style="background:var(--success); border:none; color:#0a0a1a; padding:2px 10px; border-radius:12px; cursor:pointer; font-size:11px; font-weight:600;"><i class="fas fa-check"></i></button>
                             <button onclick="adminRejectPayment('${p.id}','${p.userId}')" style="background:var(--danger); border:none; color:#fff; padding:2px 10px; border-radius:12px; cursor:pointer; font-size:11px; font-weight:600;"><i class="fas fa-times"></i></button>` :
                            `<button onclick="adminDeletePayment('${p.id}','${p.userId}')" style="background:var(--danger); border:none; color:#fff; padding:2px 10px; border-radius:12px; cursor:pointer; font-size:11px; font-weight:600;"><i class="fas fa-trash"></i></button>`
                        }
                        ${p.screenshotUrl ? `<a href="${p.screenshotUrl}" target="_blank" style="color:var(--primary);text-decoration:underline;font-size:11px;margin-left:4px;">📸</a>` : ''}
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = rows;
    }).catch(error => {
        console.error('Error loading admin payments:', error);
        tbody.innerHTML =
            `<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--danger);">${error.message}</td></tr>`;
    });
}

window.adminApprovePayment = function(orderId, userId) {
    if (!currentUser || !isAdminCached) { showToast('⛔ Unauthorized', 'error'); return; }
    updateOrderStatus(orderId, userId, 'confirmed');
    setTimeout(refreshAdminPayments, 500);
};

window.adminRejectPayment = function(orderId, userId) {
    if (!currentUser || !isAdminCached) { showToast('⛔ Unauthorized', 'error'); return; }
    updateOrderStatus(orderId, userId, 'rejected');
    setTimeout(refreshAdminPayments, 500);
};

window.adminDeletePayment = function(orderId, userId) {
    if (!currentUser || !isAdminCached) { showToast('⛔ Unauthorized', 'error'); return; }
    if (!confirm(`Delete payment ${orderId}?`)) return;
    deleteOrderImmediately(orderId, userId);
    setTimeout(refreshAdminPayments, 500);
};

// ============================================================
// AI-BASED RECOMMENDATIONS
// ============================================================
function trackUserBehavior(productId, action) {
    if (!currentUser) return;
    userHistory.push({
        productId,
        action,
        timestamp: new Date().toISOString(),
        userId: currentUser.uid
    });
    if (userHistory.length > 50) userHistory = userHistory.slice(-50);
    updateUserPreferences();
}

function updateUserPreferences() {
    userPreferences = {
        favoriteCategories: {},
        viewedProducts: [],
        purchasedProducts: [],
        cartProducts: []
    };

    userHistory.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return;
        if (item.action === 'view') {
            userPreferences.viewedProducts.push(item.productId);
        }
        if (item.action === 'purchase') {
            userPreferences.purchasedProducts.push(item.productId);
        }
        if (item.action === 'add_to_cart') {
            userPreferences.cartProducts.push(item.productId);
        }
        if (product.category) {
            userPreferences.favoriteCategories[product.category] =
                (userPreferences.favoriteCategories[product.category] || 0) + 1;
        }
    });
}

function getRecommendations(limit = 6) {
    if (!currentUser || userHistory.length === 0) {
        return getDefaultRecommendations(limit);
    }

    const viewedIds = userPreferences.viewedProducts;
    const viewedProducts = products.filter(p => viewedIds.includes(p.id));
    const similarProducts = products.filter(p => {
        if (viewedIds.includes(p.id)) return false;
        return p.features?.some(f => viewedProducts.some(vp => vp.features?.includes(f)));
    });

    const cartIds = userPreferences.cartProducts;
    const cartProducts = products.filter(p => cartIds.includes(p.id));
    const cartSimilar = products.filter(p => {
        if (cartIds.includes(p.id)) return false;
        return p.features?.some(f => cartProducts.some(cp => cp.features?.includes(f)));
    });

    const purchasedIds = userPreferences.purchasedProducts;
    const purchasedProducts = products.filter(p => purchasedIds.includes(p.id));
    const purchasedSimilar = products.filter(p => {
        if (purchasedIds.includes(p.id)) return false;
        return p.features?.some(f => purchasedProducts.some(pp => pp.features?.includes(f)));
    });

    const popularProducts = products.filter(p => p.price > 0).sort((a, b) => b.price - a.price);

    let recommendations = [];
    recommendations.push(...similarProducts);
    recommendations.push(...cartSimilar);
    recommendations.push(...purchasedSimilar);
    recommendations.push(...popularProducts);

    const unique = [];
    const seen = new Set();
    for (const item of recommendations) {
        if (!seen.has(item.id)) {
            seen.add(item.id);
            unique.push(item);
        }
    }

    return unique.slice(0, limit);
}

function getDefaultRecommendations(limit) {
    return products.filter(p => p.price > 0)
        .sort((a, b) => b.price - a.price)
        .slice(0, limit);
}

// ============================================================
// FRAUD DETECTION SYSTEM
// ============================================================
const fraudRules = {
    maxOrdersPerDay: 10,
    maxAmountPerOrder: 1000,
    suspiciousCountries: ['XX', 'YY'],
    maxFailedAttempts: 5,
    timeWindowMinutes: 15,
    maxOrdersPerIP: 5,
    sameIPDifferentAccounts: 3
};

let fraudLogs = [];
let userActivity = {};

async function detectFraud(orderData) {
    const warnings = [];
    const userId = orderData.userId || currentUser?.uid;
    const ip = orderData.ip || (await getVisitorInfo()).ip;
    const email = orderData.email || currentUser?.email;

    if (orderData.total > fraudRules.maxAmountPerOrder) {
        warnings.push('⚠️ High order amount detected');
    }

    const visitorInfo = await getVisitorInfo();
    if (fraudRules.suspiciousCountries.includes(visitorInfo.country_code)) {
        warnings.push('⚠️ Suspicious country detected');
    }

    const userOrders = allOrders.filter(o => o.userId === userId);
    const todayOrders = userOrders.filter(o => {
        return new Date(o.date).toDateString() === new Date().toDateString();
    });
    if (todayOrders.length > fraudRules.maxOrdersPerDay) {
        warnings.push('⚠️ Too many orders today');
    }

    if (!userActivity[userId]) userActivity[userId] = { failedAttempts: 0, lastAttempt: 0 };
    if (userActivity[userId].failedAttempts > fraudRules.maxFailedAttempts) {
        warnings.push('⚠️ Too many failed attempts');
    }

    const usersWithSameIP = allUsers.filter(u => u.ip === ip);
    if (usersWithSameIP.length > fraudRules.sameIPDifferentAccounts) {
        warnings.push('⚠️ Multiple accounts from same IP');
    }

    if (email && (email.includes('tempmail') || email.includes('10minutemail'))) {
        warnings.push('⚠️ Temporary email detected');
    }

    if (warnings.length > 0) {
        await logFraudDetection({
            userId,
            email,
            ip,
            warnings,
            orderData,
            timestamp: new Date().toISOString()
        });
    }

    return {
        isSuspicious: warnings.length > 0,
        warnings,
        severity: warnings.length > 3 ? 'high' : (warnings.length > 1 ? 'medium' : 'low')
    };
}

async function logFraudDetection(data) {
    try {
        await addDoc(collection(db, 'fraudLogs'), {
            ...data,
            createdAt: serverTimestamp()
        });
        console.log('🚨 Fraud detected:', data.warnings);

        if (data.warnings.length > 3) {
            await sendAdminNotification(
                '🚨 High Risk Fraud Detected!',
                `User: ${data.email || data.userId}\nIP: ${data.ip}\nWarnings: ${data.warnings.join(', ')}\nAmount: $${data.orderData?.total || 0}`
            );
        }
    } catch (error) {
        console.error('Error logging fraud:', error);
    }
}

// ============================================================
// LIMITED QUANTITY PRODUCTS
// ============================================================
function renderLimitedProducts() {
    const container = document.getElementById('limitedProductsGrid');
    if (!container) return;

    const limited = products.filter(p => p.limitedQuantity && p.limitedQuantity > 0);
    if (limited.length === 0) {
        container.innerHTML =
            `<div style="grid-column:1/-1;text-align:center;padding:12px;color:var(--text-secondary);opacity:0.5;">No limited products available</div>`;
        return;
    }

    container.innerHTML = limited.map(p => {
        const percentLeft = (p.limitedQuantity / p.limitedTotal) * 100;
        const isLowStock = percentLeft < 20;
        const isUrgent = percentLeft < 10;

        return `
            <div class="product-card" onclick="window.openDetails('${p.id}')" style="border:2px solid ${isUrgent ? 'var(--danger)' : isLowStock ? 'var(--warning)' : 'var(--vip-color)'};">
                <div class="image-wrapper">
                    <img src="${p.image || 'https://picsum.photos/seed/limited/400/300'}" alt="${p.name}" loading="lazy" />
                    <div class="image-badge vip" style="${isUrgent ? 'background:var(--danger);color:#fff;' : ''}">
                        ${isUrgent ? '🔥 LAST CHANCE' : '⭐ LIMITED'}
                    </div>
                    <div style="position:absolute;bottom:4px;left:4px;right:4px;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);border-radius:4px;padding:4px 8px;text-align:center;font-size:11px;font-weight:700;">
                        <span style="color:${isUrgent ? 'var(--danger)' : 'var(--vip-color)'}">${p.limitedQuantity}</span>
                        <span style="color:var(--text-secondary);opacity:0.5;">/${p.limitedTotal} left</span>
                        <div style="height:3px;background:var(--glass-border);border-radius:3px;margin-top:2px;overflow:hidden;">
                            <div style="height:100%;width:${percentLeft}%;background:${isUrgent ? 'var(--danger)' : isLowStock ? 'var(--warning)' : 'var(--vip-color)'};border-radius:3px;transition:width 0.5s;"></div>
                        </div>
                    </div>
                </div>
                <div class="product-name">${p.name}</div>
                <div class="price">${getCurrencySymbol(p.currency || 'USD')}${p.price.toFixed(2)}</div>
                <div style="padding:0 12px 8px;display:flex;gap:6px;align-items:center;">
                    <span style="font-size:10px;color:var(--text-secondary);opacity:0.4;">${isUrgent ? '⚡ Selling fast!' : isLowStock ? '⚠️ Only a few left!' : '🎯 Limited edition'}</span>
                </div>
                <div class="card-actions">
                    <button class="btn-add-cart" onclick="event.stopPropagation(); window.addToCart('${p.id}')" style="flex:1;padding:6px;border:none;border-radius:var(--radius-sm);background:var(--primary);color:#fff;font-weight:700;cursor:pointer;font-size:11px;">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================
// SMART POPUPS
// ============================================================
function initPopups() {
    if (exitIntentEnabled) {
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY < 0 && !popupShown) {
                showExitPopup();
            }
        });
    }

    setTimeout(() => {
        if (!popupShown && !document.hidden) {
            showOfferPopup();
        }
    }, 30000);
}

function showExitPopup() {
    if (popupShown) return;
    popupShown = true;
    const popup = document.getElementById('exitPopup');
    if (popup) {
        popup.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function showOfferPopup() {
    if (popupShown) return;
    popupShown = true;
    const popup = document.getElementById('offerPopup');
    if (popup) {
        popup.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

window.closePopup = function(popupId) {
    const popup = document.getElementById(popupId);
    if (popup) {
        popup.classList.remove('show');
        document.body.style.overflow = '';
    }
};

window.applyPopupCoupon = function(couponCode) {
    const input = document.getElementById('cartPromoInput');
    if (input) {
        input.value = couponCode;
        applyCartPromo();
    }
    closePopup('offerPopup');
    showToast(`🎉 Coupon ${couponCode} applied!`, 'success');
};

window.subscribeAndApply = function(couponCode) {
    const email = document.getElementById('exitPopupEmail');
    if (email && email.value.trim()) {
        showToast(`📧 Thanks! Coupon ${couponCode} sent to your email.`, 'success');
        closePopup('exitPopup');
    } else {
        showToast('⚠️ Please enter your email.', 'warning');
    }
};

// ============================================================
// ADVANCED COUPON SYSTEM
// ============================================================
async function loadCoupons() {
    try {
        const couponsRef = collection(db, 'coupons');
        const snapshot = await getDocs(couponsRef);
        coupons = [];
        snapshot.forEach(doc => {
            coupons.push({ id: doc.id, ...doc.data() });
        });
        updateActiveCoupons();
        renderAdminCoupons();
        return coupons;
    } catch (error) {
        console.error('Error loading coupons:', error);
        return [];
    }
}

function updateActiveCoupons() {
    const now = new Date();
    activeCoupons = coupons.filter(c => {
        if (!c.active) return false;
        if (c.expiresAt && new Date(c.expiresAt) < now) return false;
        if (c.usageLimit && c.usedCount >= c.usageLimit) return false;
        return true;
    });
}

window.openCreateCouponModal = function() {
    if (!currentUser || !isAdminCached) {
        showToast('⛔ Unauthorized', 'error');
        return;
    }
    document.getElementById('createCouponModal').classList.add('open');
    document.getElementById('couponForm').reset();
    document.getElementById('couponIdField').value = '';
};

window.closeCreateCouponModal = function() {
    document.getElementById('createCouponModal').classList.remove('open');
};

window.saveCoupon = async function() {
    if (!currentUser || !isAdminCached) {
        showToast('⛔ Unauthorized', 'error');
        return;
    }

    const id = document.getElementById('couponIdField').value;
    const code = document.getElementById('couponCode').value.trim().toUpperCase();
    const type = document.getElementById('couponType').value;
    const value = parseFloat(document.getElementById('couponValue').value);
    const minOrder = parseFloat(document.getElementById('couponMinOrder').value) || 0;
    const maxDiscount = parseFloat(document.getElementById('couponMaxDiscount').value) || null;
    const expiresAt = document.getElementById('couponExpiresAt').value;
    const usageLimit = parseInt(document.getElementById('couponUsageLimit').value) || null;
    const firstOrderOnly = document.getElementById('couponFirstOrder').checked;
    const active = document.getElementById('couponActive').checked;

    if (!code || !value) {
        showToast('⚠️ Code and value are required', 'warning');
        return;
    }

    const couponData = {
        code,
        type,
        value,
        minOrder,
        maxDiscount,
        firstOrderOnly,
        active,
        usageLimit,
        usedCount: 0,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        updatedAt: serverTimestamp()
    };

    try {
        if (id) {
            await updateDoc(doc(db, 'coupons', id), couponData);
            showToast('✅ Coupon updated successfully!', 'success');
        } else {
            couponData.createdAt = serverTimestamp();
            await addDoc(collection(db, 'coupons'), couponData);
            showToast('✅ Coupon created successfully!', 'success');
        }
        closeCreateCouponModal();
        loadCoupons();
    } catch (error) {
        console.error('Error saving coupon:', error);
        showToast('❌ Error: ' + error.message, 'error');
    }
};

window.deleteCoupon = async function(couponId) {
    if (!currentUser || !isAdminCached) {
        showToast('⛔ Unauthorized', 'error');
        return;
    }
    if (!confirm('Delete this coupon?')) return;
    try {
        await deleteDoc(doc(db, 'coupons', couponId));
        showToast('🗑️ Coupon deleted', 'success');
        loadCoupons();
    } catch (error) {
        showToast('❌ Error: ' + error.message, 'error');
    }
};

window.editCoupon = function(couponId) {
    const coupon = coupons.find(c => c.id === couponId);
    if (!coupon) { showToast('❌ Coupon not found', 'error'); return; }

    document.getElementById('couponIdField').value = coupon.id;
    document.getElementById('couponCode').value = coupon.code;
    document.getElementById('couponType').value = coupon.type;
    document.getElementById('couponValue').value = coupon.value;
    document.getElementById('couponMinOrder').value = coupon.minOrder || '';
    document.getElementById('couponMaxDiscount').value = coupon.maxDiscount || '';
    document.getElementById('couponExpiresAt').value = coupon.expiresAt ? new Date(coupon.expiresAt).toISOString()
        .slice(0, 16) : '';
    document.getElementById('couponUsageLimit').value = coupon.usageLimit || '';
    document.getElementById('couponFirstOrder').checked = coupon.firstOrderOnly || false;
    document.getElementById('couponActive').checked = coupon.active !== false;

    document.getElementById('createCouponModal').classList.add('open');
};

function renderAdminCoupons() {
    const container = document.getElementById('adminCouponsList');
    if (!container) return;
    if (!coupons || coupons.length === 0) {
        container.innerHTML =
            `<div style="text-align:center;padding:20px;color:var(--text-secondary);opacity:0.5;">No coupons created yet</div>`;
        return;
    }
    container.innerHTML = coupons.map(c => {
        const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date();
        const isActive = c.active && !isExpired && (!c.usageLimit || c.usedCount < c.usageLimit);
        return `
            <div class="admin-item" style="${isExpired ? 'opacity:0.5;' : ''}">
                <div class="item-info">
                    <div class="item-title">
                        <span style="font-family:monospace;font-size:16px;font-weight:800;color:var(--primary);">${c.code}</span>
                        <span style="font-size:11px;font-weight:400;opacity:0.5;margin-left:6px;">
                            ${c.type === 'percentage' ? `${c.value}% OFF` : `$${c.value} OFF`}
                            ${c.minOrder > 0 ? ` • Min: $${c.minOrder}` : ''}
                        </span>
                        <span class="status-badge ${isActive ? 'confirmed' : 'rejected'}" style="font-size:9px;padding:1px 10px;">
                            ${isActive ? '✅ Active' : (isExpired ? '⛔ Expired' : '🔒 Disabled')}
                        </span>
                        <span style="font-size:10px;opacity:0.3;">${c.usedCount || 0}/${c.usageLimit || '∞'}</span>
                    </div>
                    <div class="item-meta">
                        ${c.firstOrderOnly ? '🎯 First order only • ' : ''}
                        ${c.expiresAt ? `📅 ${new Date(c.expiresAt).toLocaleDateString()}` : '♾️ No expiry'}
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn-edit" onclick="editCoupon('${c.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn-delete" onclick="deleteCoupon('${c.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================
// EMAIL SYSTEM - Complete Integration
// ============================================================
async function sendEmail(to, subject, htmlContent, textContent = '') {
    try {
        console.log('📧 Sending email to:', to);
        console.log('📧 Subject:', subject);

        const response = await fetch('https://kvsyzgavfxnwqmtsginv.supabase.co/functions/v1/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
                to: to,
                subject: subject,
                html: htmlContent,
                text: textContent || htmlContent.replace(/<[^>]*>/g, '')
            })
        });

        const result = await response.json();
        console.log('📧 Email result:', result);

        if (!response.ok) {
            throw new Error(result.error || 'Failed to send email');
        }

        return { success: true, data: result };
    } catch (error) {
        console.error('❌ Email error:', error);
        return { success: false, error: error.message };
    }
}

async function sendWelcomeEmail(userEmail, userName) {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Welcome to ZI Store</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background:#f0f2f8;padding:20px;margin:0}.container{max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.08)}.header{background:linear-gradient(135deg,#6c5ce7 0%,#a29bfe 100%);padding:40px 30px 30px;text-align:center}.logo{font-size:32px;font-weight:900;color:#fff;letter-spacing:-0.5px}.logo span{color:#f2a900}.logo-sub{font-size:14px;color:rgba(255,255,255,0.7);margin-top:4px;font-weight:400}.content{padding:40px 35px}.welcome-title{font-size:26px;font-weight:800;color:#1a1a2e;text-align:center}.welcome-title .emoji{font-size:32px;display:block;margin-bottom:4px}.welcome-text{font-size:15px;color:#4a4a6a;line-height:1.8;text-align:center;margin:12px 0 20px}.features-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0}.feature-box{background:#f8f8ff;padding:16px 18px;border-radius:12px;border-left:4px solid #6c5ce7}.feature-box .icon{font-size:20px;display:block;margin-bottom:4px}.feature-box .title{font-weight:700;color:#1a1a2e;font-size:14px}.feature-box .desc{font-size:12px;color:#4a4a6a;opacity:0.7}.coupon-box{background:linear-gradient(135deg,#f2a900,#fbbf24);border-radius:12px;padding:16px 20px;text-align:center;margin:16px 0}.coupon-box .code{font-size:20px;font-weight:900;color:#1a1a2e;font-family:monospace;letter-spacing:2px}.coupon-box .label{font-size:13px;color:rgba(26,26,46,0.7)}.btn-primary{display:inline-block;background:#6c5ce7;color:#fff;padding:14px 40px;border-radius:30px;text-decoration:none;font-weight:700;font-size:16px;transition:all .3s}.btn-primary:hover{background:#5a4bd1;transform:translateY(-2px);box-shadow:0 8px 25px rgba(108,92,231,0.3)}.text-center{text-align:center}.divider{border:none;border-top:2px solid #f0f2f8;margin:20px 0}.footer{padding:20px 35px;text-align:center;background:#f8f8ff}.footer-text{font-size:12px;color:#888}.footer-links a{color:#6c5ce7;text-decoration:none;margin:0 6px;font-size:12px}.footer-links a:hover{text-decoration:underline}@media(max-width:480px){.header{padding:30px 20px}.content{padding:25px 18px}.features-grid{grid-template-columns:1fr}.logo{font-size:26px}.welcome-title{font-size:22px}.btn-primary{padding:12px 28px;font-size:14px}}</style></head><body><div class="container"><div class="header"><div class="logo">ZI <span>Store</span></div><div class="logo-sub">Premium Scripts & Digital Products</div></div><div class="content"><div class="welcome-title"><span class="emoji">🎉</span>Welcome to ZI Store!</div><p class="welcome-text">Hello <strong>${userName || 'there'}</strong>! We're thrilled to have you on board. 🚀<br>Here's everything you need to get started:</p><div class="features-grid"><div class="feature-box"><span class="icon">🛍️</span><div class="title">Premium Products</div><div class="desc">Access exclusive scripts and tools</div></div><div class="feature-box"><span class="icon">💳</span><div class="title">Secure Payments</div><div class="desc">Multiple payment methods</div></div><div class="feature-box"><span class="icon">⚡</span><div class="title">Instant Delivery</div><div class="desc">Get your products immediately</div></div><div class="feature-box"><span class="icon">🎁</span><div class="title">Exclusive Discounts</div><div class="desc">Special offers for members</div></div></div><div class="coupon-box"><div class="label">🎫 Use this coupon for 15% off your first order</div><div class="code">WELCOME15</div></div><div class="text-center"><a href="https://zi-store.online" class="btn-primary">🛒 Start Shopping Now</a></div><hr class="divider"><div style="text-align:center;font-size:13px;color:#888;line-height:1.6;"><p>Need help? <a href="mailto:support@zi-store.online" style="color:#6c5ce7;">Contact Support</a></p></div></div><div class="footer"><div class="footer-links"><a href="https://zi-store.online">Store</a><a href="mailto:support@zi-store.online">Support</a><a href="https://zi-store.online/privacy.html">Privacy</a><a href="https://zi-store.online/refund.html">Refund Policy</a></div><div class="footer-text">&copy; 2026 ZI Store — All rights reserved.</div></div></div></body></html>`;
    return await sendEmail(userEmail, '🎉 Welcome to ZI Store!', html);
}

async function sendOrderConfirmationEmail(userEmail, orderData) {
    const orderId = orderData.orderId || orderData.id || '------';
    const orderIdDisplay = orderId.slice(-8);
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Order Confirmation #${orderIdDisplay}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background:#f0f2f8;padding:20px;margin:0}.container{max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.08)}.header{background:linear-gradient(135deg,#6c5ce7 0%,#a29bfe 100%);padding:30px 30px 20px;text-align:center}.logo{font-size:28px;font-weight:900;color:#fff}.logo span{color:#f2a900}.order-status{display:inline-block;padding:4px 16px;border-radius:30px;background:#fbbf24;color:#1a1a2e;font-weight:700;font-size:13px;margin-top:6px}.content{padding:35px 30px}.greeting{font-size:18px;font-weight:700;color:#1a1a2e}.greeting span{color:#6c5ce7}.order-summary{background:#f8f8ff;border-radius:12px;padding:16px 18px;margin:16px 0}.summary-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee}.summary-row:last-child{border-bottom:none}.summary-label{color:#888;font-weight:500;font-size:13px}.summary-value{font-weight:600;color:#1a1a2e;font-size:13px}.items-table{width:100%;border-collapse:collapse;margin:16px 0}.items-table th{text-align:left;padding:10px 0;border-bottom:2px solid #eee;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.5px}.items-table td{padding:10px 0;border-bottom:1px solid #f0f2f8}.items-table .item-name{font-weight:600;color:#1a1a2e}.items-table .item-meta{font-size:12px;color:#888}.items-table .item-price{text-align:right;font-weight:600}.total-box{background:linear-gradient(135deg,#f8f8ff,#f0f2f8);border-radius:12px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;margin-top:16px}.total-label{font-size:16px;font-weight:700;color:#1a1a2e}.total-amount{font-size:24px;font-weight:900;color:#6c5ce7}.btn-primary{display:inline-block;background:#6c5ce7;color:#fff;padding:12px 32px;border-radius:30px;text-decoration:none;font-weight:700;font-size:14px;transition:all .3s}.btn-primary:hover{background:#5a4bd1;transform:translateY(-2px);box-shadow:0 8px 25px rgba(108,92,231,0.3)}.text-center{text-align:center}.divider{border:none;border-top:2px solid #f0f2f8;margin:16px 0}.footer{padding:16px 30px;text-align:center;background:#f8f8ff}.footer-text{font-size:11px;color:#888}.footer-links a{color:#6c5ce7;text-decoration:none;margin:0 4px;font-size:11px}@media(max-width:480px){.header{padding:20px}.content{padding:20px 15px}.total-amount{font-size:20px}.items-table td,.items-table th{font-size:12px}}</style></head><body><div class="container"><div class="header"><div class="logo">ZI <span>Store</span></div><div><span class="order-status">${orderData.status || 'PENDING'}</span></div></div><div class="content"><div class="greeting">Hello <span>${orderData.userName || 'Customer'}</span> 👋</div><p style="color:#4a4a6a;font-size:14px;margin:6px 0 12px;">Thank you for your order! Here are the details:</p><div class="order-summary"><div class="summary-row"><span class="summary-label">📋 Order ID</span><span class="summary-value">#${orderIdDisplay}</span></div><div class="summary-row"><span class="summary-label">📅 Date</span><span class="summary-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div><div class="summary-row"><span class="summary-label">💳 Payment Method</span><span class="summary-value">${orderData.method || 'N/A'}</span></div>${orderData.txHash ? `<div class="summary-row"><span class="summary-label">🔗 Transaction ID</span><span class="summary-value" style="font-family:monospace;font-size:11px;word-break:break-all;">${orderData.txHash}</span></div>` : ''}</div><h3 style="color:#1a1a2e;margin:12px 0 8px;font-size:16px;">🛍️ Items</h3><table class="items-table"><thead><tr><th>Product</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Price</th><th style="text-align:right;">Total</th></tr></thead><tbody>${(orderData.items || []).map(item => `<tr><td><div class="item-name">${item.name}</div>${item.selectedQuantity ? `<div class="item-meta">📦 ${item.selectedQuantity}</div>` : ''}${item.isVip ? `<div class="item-meta">👑 ${item.vipPlanLabel || 'VIP'}</div>` : ''}</td><td style="text-align:center;">${item.quantity || 1}</td><td style="text-align:right;">$${(item.price || 0).toFixed(2)}</td><td style="text-align:right;font-weight:600;">$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td></tr>`).join('')}</tbody></table><div class="total-box"><span class="total-label">Total Amount</span><span class="total-amount">$${(orderData.total || 0).toFixed(2)}</span></div><hr class="divider"><div class="text-center"><a href="https://zi-store.online" class="btn-primary">📦 View My Orders</a></div><p style="text-align:center;font-size:12px;color:#888;margin-top:10px;">You will receive another email once your order is confirmed.</p></div><div class="footer"><div class="footer-links"><a href="https://zi-store.online">Store</a><a href="mailto:support@zi-store.online">Support</a><a href="https://zi-store.online/refund.html">Refund Policy</a></div><div class="footer-text">&copy; 2026 ZI Store — All rights reserved.</div></div></div></body></html>`;
    return await sendEmail(userEmail, `📦 Order Confirmation #${orderIdDisplay}`, html);
}

async function sendOrderStatusEmail(userEmail, orderId, newStatus) {
    const statusConfig = {
        'confirmed': { emoji: '✅', title: 'Order Confirmed!', message: 'Your order has been confirmed and your licences are now available!', color: '#00d4aa', textColor: '#0a0a1a', button: '📦 View My Licences' },
        'rejected': { emoji: '❌', title: 'Order Rejected', message: 'Your order has been rejected. Please contact support for more information.', color: '#ff6b6b', textColor: '#ffffff', button: '📞 Contact Support' }
    };
    const config = statusConfig[newStatus] || { emoji: '📋', title: 'Order Status Updated', message: 'Your order status has been updated.', color: '#6c5ce7', textColor: '#ffffff', button: '📦 View Order' };
    const orderIdDisplay = orderId?.slice(-8) || '------';
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Order Status Update #${orderIdDisplay}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background:#f0f2f8;padding:20px;margin:0}.container{max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.08)}.header{background:linear-gradient(135deg,${config.color},${config.color}dd);padding:30px 30px 20px;text-align:center}.logo{font-size:28px;font-weight:900;color:#fff}.logo span{color:#f2a900}.status-icon{font-size:48px;text-align:center;margin:8px 0}.status-title{font-size:24px;font-weight:800;color:#fff}.status-badge{display:inline-block;padding:4px 20px;border-radius:30px;background:rgba(255,255,255,0.2);color:#fff;font-weight:700;font-size:14px;margin-top:4px}.content{padding:35px 30px}.greeting{font-size:16px;color:#1a1a2e}.greeting strong{color:#6c5ce7}.message-box{background:#f8f8ff;border-radius:12px;padding:16px 20px;margin:12px 0 16px;border-left:4px solid ${config.color}}.message-box p{font-size:15px;color:#4a4a6a;line-height:1.6}.order-info{background:#f8f8ff;border-radius:12px;padding:12px 16px;margin:12px 0}.info-row{display:flex;justify-content:space-between;padding:4px 0;font-size:13px}.info-label{color:#888;font-weight:500}.info-value{font-weight:600;color:#1a1a2e}.btn-primary{display:inline-block;background:${config.color};color:${config.textColor};padding:12px 32px;border-radius:30px;text-decoration:none;font-weight:700;font-size:14px;transition:all .3s}.btn-primary:hover{opacity:0.85;transform:translateY(-2px)}.text-center{text-align:center}.divider{border:none;border-top:2px solid #f0f2f8;margin:16px 0}.footer{padding:16px 30px;text-align:center;background:#f8f8ff}.footer-text{font-size:11px;color:#888}.footer-links a{color:#6c5ce7;text-decoration:none;margin:0 4px;font-size:11px}@media(max-width:480px){.header{padding:20px}.content{padding:20px 15px}.status-icon{font-size:36px}.status-title{font-size:20px}.btn-primary{padding:10px 24px;font-size:13px}}</style></head><body><div class="container"><div class="header"><div class="logo">ZI <span>Store</span></div><div class="status-icon">${config.emoji}</div><div class="status-title">${config.title}</div><div><span class="status-badge">${newStatus.toUpperCase()}</span></div></div><div class="content"><div class="greeting">Hello <strong>Customer</strong>,</div><div class="message-box"><p>${config.message}</p></div><div class="order-info"><div class="info-row"><span class="info-label">📋 Order ID</span><span class="info-value">#${orderIdDisplay}</span></div><div class="info-row"><span class="info-label">📅 Date</span><span class="info-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div><div class="info-row"><span class="info-label">📦 Status</span><span class="info-value" style="color:${config.color};">${newStatus.toUpperCase()}</span></div></div><hr class="divider"><div class="text-center"><a href="https://zi-store.online" class="btn-primary">${config.button}</a></div></div><div class="footer"><div class="footer-links"><a href="https://zi-store.online">Store</a><a href="mailto:support@zi-store.online">Support</a></div><div class="footer-text">&copy; 2026 ZI Store — All rights reserved.</div></div></div></body></html>`;
    return await sendEmail(userEmail, `${config.emoji} Order Status Update #${orderIdDisplay}`, html);
}

async function sendTopupConfirmationEmail(userEmail, amount, txHash = null) {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Topup Confirmation</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background:#f0f2f8;padding:20px;margin:0}.container{max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.08)}.header{background:linear-gradient(135deg,#f2a900,#fbbf24);padding:30px 30px 20px;text-align:center}.logo{font-size:28px;font-weight:900;color:#1a1a2e}.logo span{color:#6c5ce7}.amount-display{background:rgba(255,255,255,0.2);border-radius:16px;padding:16px 20px;margin-top:10px;display:inline-block}.amount-display .amount{font-size:36px;font-weight:900;color:#1a1a2e}.amount-display .label{font-size:14px;color:rgba(26,26,46,0.7)}.content{padding:35px 30px}.greeting{font-size:16px;color:#1a1a2e}.greeting strong{color:#6c5ce7}.details-box{background:#f8f8ff;border-radius:12px;padding:14px 18px;margin:12px 0}.detail-row{display:flex;justify-content:space-between;padding:4px 0;font-size:13px;border-bottom:1px solid #eee}.detail-row:last-child{border-bottom:none}.detail-label{color:#888;font-weight:500}.detail-value{font-weight:600;color:#1a1a2e}.btn-primary{display:inline-block;background:#6c5ce7;color:#fff;padding:12px 32px;border-radius:30px;text-decoration:none;font-weight:700;font-size:14px;transition:all .3s}.btn-primary:hover{background:#5a4bd1;transform:translateY(-2px);box-shadow:0 8px 25px rgba(108,92,231,0.3)}.text-center{text-align:center}.divider{border:none;border-top:2px solid #f0f2f8;margin:16px 0}.footer{padding:16px 30px;text-align:center;background:#f8f8ff}.footer-text{font-size:11px;color:#888}.footer-links a{color:#6c5ce7;text-decoration:none;margin:0 4px;font-size:11px}@media(max-width:480px){.header{padding:20px}.content{padding:20px 15px}.amount-display .amount{font-size:28px}.btn-primary{padding:10px 24px;font-size:13px}}</style></head><body><div class="container"><div class="header"><div class="logo">ZI <span>Store</span></div><div class="amount-display"><div class="label">💰 Amount Added</div><div class="amount">+$${amount.toFixed(2)}</div></div></div><div class="content"><div class="greeting">Hello <strong>Customer</strong>,</div><p style="color:#4a4a6a;font-size:14px;margin:4px 0 12px;">Your balance has been updated successfully!</p><div class="details-box"><div class="detail-row"><span class="detail-label">📅 Date</span><span class="detail-value">${new Date().toLocaleString()}</span></div>${txHash ? `<div class="detail-row"><span class="detail-label">🔗 Transaction ID</span><span class="detail-value" style="font-family:monospace;font-size:11px;word-break:break-all;">${txHash}</span></div>` : ''}</div><hr class="divider"><div class="text-center"><a href="https://zi-store.online" class="btn-primary">🛒 Start Shopping</a></div></div><div class="footer"><div class="footer-links"><a href="https://zi-store.online">Store</a><a href="mailto:support@zi-store.online">Support</a></div><div class="footer-text">&copy; 2026 ZI Store — All rights reserved.</div></div></div></body></html>`;
    return await sendEmail(userEmail, `💰 Balance Added - $${amount.toFixed(2)}`, html);
}

async function sendAdminNotificationEmail(subject, message) {
    const adminEmail = 'idriss.zribi13@gmail.com';
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Admin Notification</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background:#f0f2f8;padding:20px;margin:0}.container{max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.08)}.header{background:linear-gradient(135deg,#ff6b6b,#ee5a24);padding:30px 30px 20px;text-align:center}.logo{font-size:28px;font-weight:900;color:#fff}.logo span{color:#f2a900}.content{padding:35px 30px}.message-box{background:#f8f8ff;border-radius:12px;padding:16px 20px;margin:12px 0;border-left:4px solid #ff6b6b}.message-box p{font-size:14px;color:#4a4a6a;line-height:1.8;white-space:pre-wrap}.footer{padding:16px 30px;text-align:center;background:#f8f8ff}.footer-text{font-size:11px;color:#888}@media(max-width:480px){.header{padding:20px}.content{padding:20px 15px}}</style></head><body><div class="container"><div class="header"><div class="logo">ZI <span>Store</span></div><div style="color:rgba(255,255,255,0.8);font-size:14px;">Admin Notification</div></div><div class="content"><h2 style="color:#1a1a2e;font-size:20px;">${subject}</h2><div class="message-box"><p>${message}</p></div><p style="text-align:center;font-size:12px;color:#888;margin-top:12px;">📅 ${new Date().toLocaleString()}</p></div><div class="footer"><div class="footer-text">&copy; 2026 ZI Store — All rights reserved.</div></div></div></body></html>`;
    return await sendEmail(adminEmail, `🔔 Admin: ${subject}`, html);
}

// ============================================================
// EMAIL MANAGEMENT - Admin Functions
// ============================================================
let emailLogs = [];

async function loadEmailLogs() {
    const container = document.getElementById('emailLogsContainer');
    if (!container) return;

    try {
        container.innerHTML =
            `<div style="text-align:center;padding:20px;color:var(--text-secondary);"><i class="fas fa-spinner fa-spin"></i> Loading...</div>`;

        const { data, error } = await supabase
            .from('email_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        emailLogs = data || [];
        renderEmailLogs(emailLogs);
    } catch (error) {
        console.error('Error loading email logs:', error);
        container.innerHTML = `
            <div style="text-align:center;padding:20px;color:var(--danger);">
                Failed to load email logs: ${error.message}
                <br>
                <button onclick="loadEmailLogs()" style="margin-top:8px;padding:6px 16px;background:var(--primary);border:none;border-radius:var(--radius-sm);color:#fff;cursor:pointer;">Retry</button>
            </div>
        `;
    }
}

function renderEmailLogs(logs) {
    const container = document.getElementById('emailLogsContainer');
    if (!container) return;

    if (!logs || logs.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:30px;color:var(--text-secondary);opacity:0.5;">
                <i class="fas fa-envelope" style="font-size:36px;display:block;margin-bottom:8px;opacity:0.2;"></i>
                No emails sent yet
            </div>
        `;
        return;
    }

    container.innerHTML = logs.map(log => {
        const statusColor = log.status === 'sent' ? 'var(--success)' : log.status === 'failed' ? 'var(--danger)' :
            'var(--warning)';
        const statusIcon = log.status === 'sent' ? '✅' : log.status === 'failed' ? '❌' : '⏳';
        const date = new Date(log.created_at).toLocaleString();

        return `
            <div class="admin-item" style="border-left:4px solid ${statusColor};">
                <div class="item-info">
                    <div class="item-title">
                        ${statusIcon} ${log.subject || 'No Subject'}
                        <span style="font-size:11px;font-weight:400;opacity:0.5;margin-left:6px;">
                            to: ${log.recipient}
                        </span>
                        <span class="status-badge ${log.status}" style="font-size:9px;padding:1px 10px;">
                            ${log.status || 'unknown'}
                        </span>
                    </div>
                    <div class="item-meta">
                        📅 ${date}
                        ${log.error ? `• ❌ ${log.error}` : ''}
                    </div>
                </div>
                <div class="item-actions">
                    ${log.html ? `<button onclick="previewEmail('${log.id}')" class="btn-edit" style="background:var(--primary);color:#fff;border:none;padding:4px 10px;border-radius:var(--radius-sm);cursor:pointer;font-weight:600;font-size:11px;">
                        <i class="fas fa-eye"></i> Preview
                    </button>` : ''}
                    <button onclick="resendEmail('${log.id}')" class="btn-edit" style="background:var(--vip-color);color:#0a0a1a;border:none;padding:4px 10px;border-radius:var(--radius-sm);cursor:pointer;font-weight:600;font-size:11px;">
                        <i class="fas fa-redo"></i> Resend
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

window.loadEmailLogs = loadEmailLogs;
window.sendTestEmail = async function() {
    try {
        const testEmail = prompt('Enter email address to send test email:', 'test@example.com');
        if (!testEmail) return;

        showToast('📧 Sending test email...', 'info');
        const result = await sendWelcomeEmail(testEmail, 'Test User');

        if (result.success) {
            showToast('✅ Test email sent successfully!', 'success');
            loadEmailLogs();
        } else {
            showToast('❌ Failed to send test email: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('❌ Error: ' + error.message, 'error');
    }
};

window.previewEmail = function(logId) {
    const log = emailLogs.find(l => l.id === logId);
    if (!log || !log.html) {
        showToast('❌ Email content not found', 'error');
        return;
    }

    const win = window.open('', '_blank', 'width=800,height=600');
    if (win) {
        win.document.write(log.html);
        win.document.close();
    } else {
        showToast('⚠️ Please allow popups', 'warning');
    }
};

window.resendEmail = async function(logId) {
    const log = emailLogs.find(l => l.id === logId);
    if (!log) {
        showToast('❌ Email log not found', 'error');
        return;
    }

    if (!confirm(`Resend email to ${log.recipient}?`)) return;

    try {
        showToast('📧 Resending...', 'info');
        const result = await sendEmail(log.recipient, log.subject, log.html, log.text);

        if (result.success) {
            showToast('✅ Email resent successfully!', 'success');
            loadEmailLogs();
        } else {
            showToast('❌ Failed to resend: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('❌ Error: ' + error.message, 'error');
    }
};

// ============================================================
// ADMIN SETTINGS UI
// ============================================================
async function loadAdminSettingsUI() {
    if (!currentUser || !isAdminCached) return;

    const container = document.getElementById('adminSettingsContainer');
    if (!container) {
        const tabContent = document.getElementById('tabSettings');
        if (tabContent) {
            const div = document.createElement('div');
            div.id = 'adminSettingsContainer';
            tabContent.appendChild(div);
            container = div;
        } else {
            console.error('❌ tabSettings not found');
            return;
        }
    }

    try {
        const settings = await getAdminSettings();

        container.innerHTML = `
            <div style="background:var(--glass-bg); padding:20px; border-radius:var(--radius-md); border:1px solid var(--glass-border);">
                <h3 style="margin-bottom:16px; color:var(--vip-color);">🔔 Notification Settings</h3>
                
                <div class="admin-form-group">
                    <label>Admin Email</label>
                    <input id="adminEmailInput" type="email" value="${settings.adminEmail || ''}" 
                           style="width:100%; padding:8px 12px; border:1px solid var(--border); border-radius:var(--radius-sm); 
                                  background:var(--card-bg); color:var(--text);" />
                    <div style="font-size:11px; color:var(--text-secondary); opacity:0.4; margin-top:4px;">
                        All notifications will be sent to this email
                    </div>
                </div>
                
                <div class="admin-form-group" style="margin-top:12px;">
                    <label>Admin Telegram Chat ID</label>
                    <input id="adminTelegramInput" type="text" value="${settings.adminTelegramChatId || ''}" 
                           style="width:100%; padding:8px 12px; border:1px solid var(--border); border-radius:var(--radius-sm); 
                                  background:var(--card-bg); color:var(--text); font-family:monospace;" />
                    <div style="font-size:11px; color:var(--text-secondary); opacity:0.4; margin-top:4px;">
                        Send /start to @${BOT_USERNAME} then /chatid to get your Chat ID
                        <button onclick="getMyTelegramChatId()" style="margin-left:8px; padding:2px 12px; border:none; border-radius:4px; background:var(--primary); color:#fff; cursor:pointer; font-size:11px;">
                            <i class="fas fa-sync"></i> Get My Chat ID
                        </button>
                    </div>
                </div>
                
                <div style="display:flex; gap:16px; margin-top:12px; flex-wrap:wrap;">
                    <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                        <input type="checkbox" id="enableEmailNotif" ${settings.enableEmailNotifications !== false ? 'checked' : ''} />
                        <span>📧 Email Notifications</span>
                    </label>
                    <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                        <input type="checkbox" id="enableTelegramNotif" ${settings.enableTelegramNotifications !== false ? 'checked' : ''} />
                        <span>📱 Telegram Notifications</span>
                    </label>
                </div>
                
                <button onclick="saveAdminSettings()" style="margin-top:16px; padding:8px 24px; border:none; border-radius:var(--radius-sm); 
                        background:var(--primary); color:#fff; font-weight:700; cursor:pointer;">
                    <i class="fas fa-save"></i> Save Settings
                </button>
                
                <div id="adminSettingsStatus" style="margin-top:8px; font-size:13px;"></div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading admin settings:', error);
        container.innerHTML =
            `<div style="color:var(--danger);">Failed to load settings: ${error.message}</div>`;
    }
}

window.saveAdminSettings = async function() {
    if (!currentUser || !isAdminCached) {
        showToast('⛔ Unauthorized', 'error');
        return;
    }

    const email = document.getElementById('adminEmailInput')?.value.trim();
    const telegramId = document.getElementById('adminTelegramInput')?.value.trim();
    const enableEmail = document.getElementById('enableEmailNotif')?.checked || false;
    const enableTelegram = document.getElementById('enableTelegramNotif')?.checked || false;

    if (!email) {
        showToast('⚠️ Admin email is required', 'warning');
        return;
    }

    const statusEl = document.getElementById('adminSettingsStatus');
    statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    statusEl.style.color = 'var(--text-secondary)';

    try {
        const settings = {
            adminEmail: email,
            adminTelegramChatId: telegramId || '',
            enableEmailNotifications: enableEmail,
            enableTelegramNotifications: enableTelegram
        };

        await updateAdminSettings(settings);
        statusEl.innerHTML = '✅ Settings saved successfully!';
        statusEl.style.color = 'var(--success)';
        showToast('✅ Admin settings saved!', 'success');
        setTimeout(() => { statusEl.innerHTML = ''; }, 3000);
    } catch (error) {
        statusEl.innerHTML = '❌ Error: ' + error.message;
        statusEl.style.color = 'var(--danger)';
    }
};

window.getMyTelegramChatId = function() {
    if (!currentUser) {
        showToast('⚠️ Please login first', 'warning');
        return;
    }

    if (!userProfile.telegramChatId) {
        showToast('⚠️ Please link your Telegram account first', 'warning');
        bindTelegram();
        return;
    }

    const input = document.getElementById('adminTelegramInput');
    if (input) {
        input.value = userProfile.telegramChatId;
        showToast(`✅ Chat ID set: ${userProfile.telegramChatId}`, 'success');
    }
};

// ============================================================
// BRANDING SYSTEM
// ============================================================
const BRANDING = {
    colors: {
        primary: '#6c5ce7',
        secondary: '#f2a900',
        accent: '#00d4aa',
        danger: '#ff6b6b',
        warning: '#fbbf24',
        dark: '#0a0a1a',
        light: '#f0f2f8'
    },
    logo: {
        text: 'ZI Store',
        icon: 'fa-crown',
        tagline: 'Premium Scripts & Digital Products'
    },
    social: {
        youtube: 'https://youtube.com/@zistore',
        telegram: 'https://t.me/zistore',
        discord: 'https://discord.gg/zistore',
        twitter: 'https://twitter.com/zistore',
        instagram: 'https://instagram.com/zistore'
    },
    contact: {
        email: 'support@zi-store.online',
        phone: '+216 12345678',
        address: 'Tunis, Tunisia'
    },
    site: {
        name: 'ZI Store',
        domain: 'zi-store.online',
        year: new Date().getFullYear(),
        version: '4.0.0'
    }
};

function loadBranding() {
    try {
        const saved = localStorage.getItem('zi_branding');
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(BRANDING, parsed);
        }
    } catch (e) {
        console.warn('Failed to load branding:', e);
    }
    applyBranding();
}

function saveBranding(branding) {
    try {
        localStorage.setItem('zi_branding', JSON.stringify(branding));
        Object.assign(BRANDING, branding);
        applyBranding();
    } catch (e) {
        console.warn('Failed to save branding:', e);
    }
}

function applyBranding() {
    const root = document.documentElement;
    root.style.setProperty('--primary', BRANDING.colors.primary);
    root.style.setProperty('--vip-color', BRANDING.colors.secondary);
    root.style.setProperty('--success', BRANDING.colors.accent);
    root.style.setProperty('--danger', BRANDING.colors.danger);
    root.style.setProperty('--warning', BRANDING.colors.warning);
    
    const logoEl = document.querySelector('.logo');
    if (logoEl) {
        logoEl.innerHTML = `<i class="fas ${BRANDING.logo.icon}"></i> ${BRANDING.logo.text}`;
    }
    
    document.title = `${BRANDING.site.name} - ${BRANDING.logo.tagline}`;
    
    const footer = document.querySelector('.site-footer .footer-copyright');
    if (footer) {
        footer.innerHTML = `&copy; ${BRANDING.site.year} <strong>${BRANDING.site.name}</strong> — All rights reserved.`;
    }
}

window.loadBrandingSettings = function() {
    document.getElementById('brandPrimary').value = BRANDING.colors.primary;
    document.getElementById('brandSecondary').value = BRANDING.colors.secondary;
    document.getElementById('brandAccent').value = BRANDING.colors.accent;
    document.getElementById('brandLogoText').value = BRANDING.logo.text;
    document.getElementById('brandLogoIcon').value = BRANDING.logo.icon;
    document.getElementById('brandTagline').value = BRANDING.logo.tagline;
    document.getElementById('brandYoutube').value = BRANDING.social.youtube;
    document.getElementById('brandTelegram').value = BRANDING.social.telegram;
    document.getElementById('brandDiscord').value = BRANDING.social.discord;
    document.getElementById('brandTwitter').value = BRANDING.social.twitter;
    document.getElementById('brandEmail').value = BRANDING.contact.email;
    document.getElementById('brandPhone').value = BRANDING.contact.phone;
};

window.saveBrandingSettings = function() {
    const newBranding = {
        colors: {
            primary: document.getElementById('brandPrimary').value,
            secondary: document.getElementById('brandSecondary').value,
            accent: document.getElementById('brandAccent').value,
            danger: '#ff6b6b',
            warning: '#fbbf24',
            dark: '#0a0a1a',
            light: '#f0f2f8'
        },
        logo: {
            text: document.getElementById('brandLogoText').value || 'ZI Store',
            icon: document.getElementById('brandLogoIcon').value || 'fa-crown',
            tagline: document.getElementById('brandTagline').value || 'Premium Scripts & Digital Products'
        },
        social: {
            youtube: document.getElementById('brandYoutube').value,
            telegram: document.getElementById('brandTelegram').value,
            discord: document.getElementById('brandDiscord').value,
            twitter: document.getElementById('brandTwitter').value,
            instagram: BRANDING.social.instagram
        },
        contact: {
            email: document.getElementById('brandEmail').value,
            phone: document.getElementById('brandPhone').value,
            address: BRANDING.contact.address
        },
        site: {
            name: BRANDING.site.name,
            domain: BRANDING.site.domain,
            year: new Date().getFullYear(),
            version: BRANDING.site.version
        }
    };
    
    saveBranding(newBranding);
    showToast('✅ Branding saved successfully!', 'success');
    loadBrandingSettings();
};

window.resetBranding = function() {
    if (!confirm('Reset branding to default?')) return;
    localStorage.removeItem('zi_branding');
    loadBranding();
    loadBrandingSettings();
    showToast('🔄 Branding reset to defaults', 'info');
};

// ============================================================
// GENERATE PDF INVOICE
// ============================================================
window.generatePDFInvoice = function(orderData) {
    if (!orderData) { 
        showToast('❌ No order data for invoice', 'error'); 
        return; 
    }
    
    try {
        let order = typeof orderData === 'string' ? JSON.parse(orderData) : orderData;
        
        if (!order.id) { 
            order.id = 'INV-' + Date.now().toString().slice(-6); 
        }
        
        const invoiceHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Invoice #${order.id}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; padding: 40px; background: #fff; color: #1a1a2e; }
        .invoice { max-width: 800px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #6c5ce7; padding-bottom: 20px; margin-bottom: 20px; }
        .logo { font-size: 28px; font-weight: 900; color: #6c5ce7; }
        .logo span { color: #f2a900; }
        .invoice-title { font-size: 24px; color: #6c5ce7; font-weight: 700; }
        .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; padding: 15px; background: #f8f8ff; border-radius: 8px; }
        .details .label { color: #888; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .details .value { font-weight: 700; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #6c5ce7; color: #fff; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; }
        td { padding: 12px; border-bottom: 1px solid #e0e0e0; }
        .total-section { margin-top: 20px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: right; }
        .total-section .total { font-size: 24px; font-weight: 900; color: #6c5ce7; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #888; }
        @media print {
            body { padding: 0; }
            .invoice { border: none; padding: 20px; }
        }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 30px; font-size: 12px; font-weight: 700; background: ${order.status === 'confirmed' ? '#00d4aa' : order.status === 'rejected' ? '#ff6b6b' : '#fbbf24'}; color: #0a0a1a; }
    </style>
</head>
<body>
    <div class="invoice">
        <div class="header">
            <div class="logo">ZI <span>Store</span></div>
            <div class="invoice-title">INVOICE</div>
        </div>
        <div class="details">
            <div>
                <div class="label">Order ID</div>
                <div class="value">#${order.id}</div>
                <div class="label" style="margin-top:6px;">Date</div>
                <div class="value">${new Date(order.date || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            <div style="text-align:right;">
                <div class="label">Status</div>
                <div class="value"><span class="status-badge">${order.status || 'Pending'}</span></div>
                <div class="label" style="margin-top:6px;">Payment Method</div>
                <div class="value">${order.method || 'N/A'}</div>
            </div>
        </div>
        <table>
            <thead><tr><th>Product</th><th>Quantity</th><th>Price</th><th>Total</th></tr></thead>
            <tbody>
                ${(order.items || []).map(item => `
                    <tr>
                        <td>${item.name}${item.selectedQuantity ? ' (x'+item.selectedQuantity+')' : ''}</td>
                        <td>${item.quantity || 1}</td>
                        <td>$${(item.price || 0).toFixed(2)}</td>
                        <td>$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div class="total-section">
            <div style="font-size:16px; color:#888; margin-bottom:4px;">Total Amount</div>
            <div class="total">$${(order.total || 0).toFixed(2)}</div>
        </div>
        <div class="footer">
            <p>Thank you for your purchase at ZI Store!</p>
            <p style="margin-top:4px;">© 2026 ZI Store — All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;
        
        const win = window.open('', '_blank', 'width=800,height=600');
        if (!win) { 
            showToast('⚠️ Please allow popups to generate invoice', 'warning'); 
            return; 
        }
        
        win.document.write(invoiceHtml);
        win.document.close();
        
        setTimeout(() => {
            win.print();
        }, 500);
        
        showToast('📄 Invoice generated!', 'success');
        
    } catch (error) {
        console.error('Invoice generation error:', error);
        showToast('❌ Failed to generate invoice: ' + error.message, 'error');
    }
};

// ============================================================
// GET VISITOR INFO & DEVICE INFO
// ============================================================
async function getVisitorInfo() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        const ip = data.ip || 'Unknown';
        try {
            const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`);
            const geoData = await geoResponse.json();
            return {
                ip: ip,
                country: geoData.country_name || 'Unknown',
                country_code: geoData.country_code || 'XX',
                city: geoData.city || 'Unknown',
                region: geoData.region || 'Unknown',
                timezone: geoData.timezone || 'UTC',
                isp: geoData.org || 'Unknown'
            };
        } catch (geoError) {
            console.warn('Geo lookup failed:', geoError);
            return { ip: ip, country: 'Unknown', country_code: 'XX', city: 'Unknown', region: 'Unknown', timezone: 'UTC', isp: 'Unknown' };
        }
    } catch (error) {
        console.error('Error getting visitor info:', error);
        return { ip: 'Unknown', country: 'Unknown', country_code: 'XX', city: 'Unknown', region: 'Unknown', timezone: 'UTC', isp: 'Unknown' };
    }
}

function getDeviceInfo() {
    const ua = navigator.userAgent;
    let device = 'Desktop';
    let os = 'Unknown';
    let browser = 'Unknown';

    if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) device = 'Mobile';
    if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Mac/i.test(ua)) os = 'MacOS';
    else if (/Linux/i.test(ua)) os = 'Linux';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/iOS|iPhone|iPad/i.test(ua)) os = 'iOS';

    if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome';
    else if (/Firefox/i.test(ua)) browser = 'Firefox';
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
    else if (/Edg/i.test(ua)) browser = 'Edge';
    else if (/Opera|OPR/i.test(ua)) browser = 'Opera';

    return { device, os, browser };
}

// ============================================================
// LOG ACTIVITY
// ============================================================
async function logActivity(type, data = {}) {
    if (!currentUser) return;
    
    try {
        const activity = {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            userName: currentUser.displayName || 'User',
            type: type,
            data: data,
            ip: (await getVisitorInfo()).ip || 'Unknown',
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            createdAt: serverTimestamp()
        };
        
        await addDoc(collection(db, 'user_activity'), activity);
        console.log(`📊 Activity logged: ${type}`);
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}

// ============================================================
// SEND USER NOTIFICATION
// ============================================================
async function sendUserNotification(userId, title, message) {
    try {
        await addDoc(collection(db, 'notifications'), {
            title: title,
            message: message,
            userId: userId,
            readBy: [],
            createdAt: serverTimestamp()
        });
        console.log(`📬 Notification sent to user ${userId}`);
        return true;
    } catch (error) {
        console.error('Error sending notification:', error);
        return false;
    }
}

// ============================================================
// GENERATE LICENCE FOR USER
// ============================================================
async function generateLicenceForUser(userId, userEmail, item, orderId) {
    try {
        if (!userId || !item || !item.name) {
            console.warn('⚠️ Cannot generate licence: missing data');
            return;
        }
        const response = await fetch(`${SUPABASE_URL}/functions/v1/create-licence`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
                userId: userId,
                userEmail: userEmail,
                productName: item.name,
                scriptId: item.id,
                orderId: orderId,
                manual: false
            })
        });
        const result = await response.json();
        if (result.success && result.licence) {
            console.log(`✅ Licence generated for ${item.name}: ${result.licence.code}`);
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                const userLicences = userData.licences || [];
                userLicences.push({
                    code: result.licence.code,
                    scriptId: item.id,
                    scriptName: item.name,
                    expiryDate: result.licence.expiryDate,
                    activatedAt: new Date().toISOString(),
                    status: 'active'
                });
                await updateDoc(userRef, { licences: userLicences, updatedAt: serverTimestamp() });
                if (currentUser && currentUser.uid === userId) {
                    userProfile.licences = userLicences;
                    renderUserLicences();
                    updateFullUserMenu();
                }
            }
            if (userEmail) {
                await sendLicenceEmail(userEmail, {
                    code: result.licence.code,
                    scriptName: item.name,
                    expiryDate: result.licence.expiryDate
                });
            }
            return result.licence;
        } else {
            console.warn('⚠️ Failed to generate licence:', result.error);
            return null;
        }
    } catch (error) {
        console.error('❌ Error generating licence:', error);
        return null;
    }
}

async function sendLicenceEmail(userEmail, licenceData) {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Your Licence Code</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background:#f0f2f8;padding:20px;margin:0}.container{max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.08)}.header{background:linear-gradient(135deg,#6c5ce7,#a29bfe);padding:30px 30px 20px;text-align:center}.logo{font-size:28px;font-weight:900;color:#fff}.logo span{color:#f2a900}.content{padding:35px 30px}.code-box{background:#f8f8ff;border-radius:12px;padding:20px;text-align:center;border:2px dashed #6c5ce7;margin:16px 0}.code-box .code{font-size:28px;font-weight:900;color:#6c5ce7;font-family:monospace;letter-spacing:4px}.code-box .label{font-size:12px;color:#888}.btn-primary{display:inline-block;background:#6c5ce7;color:#fff;padding:12px 32px;border-radius:30px;text-decoration:none;font-weight:700;font-size:14px;transition:all .3s}.btn-primary:hover{background:#5a4bd1;transform:translateY(-2px);box-shadow:0 8px 25px rgba(108,92,231,0.3)}.text-center{text-align:center}.footer{padding:16px 30px;text-align:center;background:#f8f8ff}.footer-text{font-size:11px;color:#888}@media(max-width:480px){.header{padding:20px}.content{padding:20px 15px}.code-box .code{font-size:22px}}</style></head><body><div class="container"><div class="header"><div class="logo">ZI <span>Store</span></div></div><div class="content"><h2 style="color:#1a1a2e;font-size:20px;">🔑 Your Licence Code</h2><p style="color:#4a4a6a;font-size:14px;margin:6px 0 12px;">Thank you for your purchase! Here is your licence code for <strong>${licenceData.scriptName}</strong>:</p><div class="code-box"><div class="label">LICENCE CODE</div><div class="code">${licenceData.code}</div></div><div style="background:#f8f8ff;border-radius:8px;padding:12px 16px;margin:12px 0;font-size:13px;color:#4a4a6a;"><strong>Expires:</strong> ${new Date(licenceData.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div><p style="text-align:center;font-size:12px;color:#888;margin-top:8px;">You can also find this licence in your account dashboard.</p><hr style="border:none;border-top:1px solid #f0f2f8;margin:16px 0;"><div class="text-center"><a href="https://zi-store.online" class="btn-primary">📦 Visit Store</a></div></div><div class="footer"><div class="footer-text">&copy; 2026 ZI Store — All rights reserved.</div></div></div></body></html>`;
    return await sendEmail(userEmail, `🔑 Your Licence for ${licenceData.scriptName}`, html);
}

// ============================================================
// NETWORK STATUS DETECTION - CONNECTION MONITOR
// ============================================================
let isOnline = navigator.onLine;
let wasOffline = false;

function showOfflineToast() {
    const toast = document.getElementById('toast');
    const messageEl = document.getElementById('toastMessage');
    const iconEl = toast?.querySelector('.toast-icon');
    if (!toast || !messageEl) return;
    toast.classList.remove('show');
    clearTimeout(window.toastTimeout);
    toast.className = 'toast';
    toast.classList.add('error', 'large');
    if (iconEl) {
        iconEl.innerHTML = '<i class="fas fa-wifi" style="color: #ff6b6b; font-size: 24px;"></i>';
    }
    messageEl.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 18px; font-weight: 800; color: var(--danger);">
                ⚠️ No Internet Connection
            </div>
            <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
                Please check your connection and try again.
            </div>
            <div style="font-size: 11px; color: var(--text-secondary); opacity: 0.4; margin-top: 6px;">
                <i class="fas fa-spinner fa-spin"></i> Waiting for connection...
            </div>
        </div>
    `;
    toast.style.display = 'flex';
    toast.style.flexDirection = 'column';
    toast.style.alignItems = 'center';
    toast.style.maxWidth = '420px';
    toast.style.padding = '20px 24px';
    toast.style.borderColor = 'var(--danger)';
    toast.style.background = 'rgba(255, 107, 107, 0.08)';
    void toast.offsetWidth;
    toast.classList.add('show');
    wasOffline = true;
}

function showOnlineToast() {
    const toast = document.getElementById('toast');
    const messageEl = document.getElementById('toastMessage');
    const iconEl = toast?.querySelector('.toast-icon');
    if (!toast || !messageEl) return;
    toast.classList.remove('show');
    clearTimeout(window.toastTimeout);
    toast.className = 'toast';
    toast.classList.add('success', 'large');
    if (iconEl) {
        iconEl.innerHTML = '<i class="fas fa-wifi" style="color: #00d4aa; font-size: 24px;"></i>';
    }
    messageEl.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 18px; font-weight: 800; color: var(--success);">
                ✅ Internet Connected!
            </div>
            <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
                Your connection has been restored.
            </div>
        </div>
    `;
    toast.style.display = 'flex';
    toast.style.flexDirection = 'column';
    toast.style.alignItems = 'center';
    toast.style.maxWidth = '420px';
    toast.style.padding = '20px 24px';
    toast.style.borderColor = 'var(--success)';
    toast.style.background = 'rgba(0, 212, 170, 0.08)';
    void toast.offsetWidth;
    toast.classList.add('show');
    wasOffline = false;
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => { toast.style.display = 'none'; }, 500);
    }, 3000);
}

function initNetworkMonitor() {
    console.log('📡 Network monitor initialized');
    if (!navigator.onLine) {
        showOfflineToast();
        wasOffline = true;
        document.body.classList.add('offline-mode');
    }
    window.addEventListener('offline', function() {
        console.warn('⚠️ Internet connection lost');
        showOfflineToast();
        isOnline = false;
        document.body.classList.add('offline-mode');
        pauseOnlineOperations();
    });
    window.addEventListener('online', function() {
        console.log('✅ Internet connection restored');
        isOnline = true;
        document.body.classList.remove('offline-mode');
        if (wasOffline) {
            showOnlineToast();
        }
        resumeOnlineOperations();
    });
    setInterval(function() {
        if (navigator.onLine && !isOnline) {
            isOnline = true;
            document.body.classList.remove('offline-mode');
            if (wasOffline) {
                showOnlineToast();
            }
            resumeOnlineOperations();
        } else if (!navigator.onLine && isOnline) {
            isOnline = false;
            document.body.classList.add('offline-mode');
            showOfflineToast();
            pauseOnlineOperations();
        }
    }, 10000);
}
window.initNetworkMonitor = initNetworkMonitor;

function pauseOnlineOperations() {
    if (window._productsInterval) {
        clearInterval(window._productsInterval);
        window._productsInterval = null;
    }
    if (sliderTimer) {
        clearInterval(sliderTimer);
        sliderTimer = null;
    }
    if (window._cryptoInterval) {
        clearInterval(window._cryptoInterval);
        window._cryptoInterval = null;
    }
    console.log('⏸️ Online operations paused');
}

function resumeOnlineOperations() {
    if (!window._productsInterval) {
        window._productsInterval = setInterval(function() {
            if (navigator.onLine) {
                loadProductsFromFirestore();
            }
        }, 30000);
    }
    if (!sliderTimer && sliderSlides && sliderSlides.length > 0) {
        startSliderRotation();
    }
    if (!window._cryptoInterval) {
        window._cryptoInterval = setInterval(fetchCryptoPrices, 60000);
    }
    console.log('▶️ Online operations resumed');
}

function addOfflineStyles() {
    if (document.getElementById('offlineStyles')) return;
    const style = document.createElement('style');
    style.id = 'offlineStyles';
    style.textContent = `
        body.offline-mode {
            position: relative;
        }
        body.offline-mode::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #ff6b6b, #ee5a24, #ff6b6b);
            background-size: 200% 100%;
            animation: offlinePulse 1.5s ease-in-out infinite;
            z-index: 9999;
        }
        @keyframes offlinePulse {
            0%, 100% { background-position: 0% 0%; }
            50% { background-position: 100% 0%; }
        }
        .offline-indicator {
            position: fixed;
            bottom: 16px;
            left: 16px;
            z-index: 9999;
            background: var(--danger);
            color: #fff;
            padding: 4px 12px;
            border-radius: 30px;
            font-size: 11px;
            font-weight: 700;
            display: none;
            align-items: center;
            gap: 6px;
            box-shadow: 0 4px 20px rgba(255, 107, 107, 0.3);
            animation: pulse-badge 2s infinite;
        }
        .offline-indicator i {
            font-size: 14px;
        }
        @keyframes pulse-badge {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        body.offline-mode .offline-indicator {
            display: flex !important;
        }
    `;
    document.head.appendChild(style);
    if (!document.getElementById('offlineIndicator')) {
        const indicator = document.createElement('div');
        indicator.className = 'offline-indicator';
        indicator.id = 'offlineIndicator';
        indicator.innerHTML = '<i class="fas fa-wifi"></i> Offline';
        document.body.appendChild(indicator);
    }
}
window.addOfflineStyles = addOfflineStyles;

// ============================================================
// USER SETTINGS - TOGGLE SWITCHES
// ============================================================
async function loadUserSettings() {
    const defaultSettings = {
        ipDetection: true,
        emailNotifications: true,
        twoFactorAuth: false
    };
    try {
        const saved = localStorage.getItem('zi_user_settings');
        if (saved) {
            const settings = JSON.parse(saved);
            return { ...defaultSettings, ...settings };
        }
    } catch (e) {
        console.warn('Failed to load settings from localStorage:', e);
    }
    if (currentUser) {
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const data = userSnap.data();
                if (data.settings) {
                    const settings = { ...defaultSettings, ...data.settings };
                    localStorage.setItem('zi_user_settings', JSON.stringify(settings));
                    return settings;
                }
            }
        } catch (error) {
            console.error('Error loading settings from Firestore:', error);
        }
    }
    return defaultSettings;
}

async function saveUserSettings(settings) {
    try {
        localStorage.setItem('zi_user_settings', JSON.stringify(settings));
    } catch (e) {
        console.warn('Failed to save settings to localStorage:', e);
    }
    if (currentUser) {
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                settings: settings,
                updatedAt: serverTimestamp()
            });
            console.log('✅ Settings saved to Firestore');
        } catch (error) {
            console.error('Failed to save settings to Firestore:', error);
        }
    }
}

async function toggleSetting(element, settingName) {
    if (element._isToggling) return;
    element._isToggling = true;
    element.style.transition = 'transform 0.1s';
    element.style.transform = 'scale(0.95)';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 100);
    const isActive = element.classList.contains('active');
    const newState = !isActive;
    if (newState) {
        element.classList.add('active');
        element.classList.remove('inactive');
    } else {
        element.classList.remove('active');
        element.classList.add('inactive');
    }
    const settings = await loadUserSettings();
    settings[settingName] = newState;
    await saveUserSettings(settings);
    handleSettingChange(settingName, newState);
    const settingLabels = {
        ipDetection: 'Auto Detection',
        emailNotifications: 'Email Notifications',
        twoFactorAuth: 'Two-Factor Auth'
    };
    const label = settingLabels[settingName] || settingName;
    const status = newState ? 'enabled' : 'disabled';
    showToast(`🔔 ${label} ${status}`, newState ? 'success' : 'info');
    await logActivity('settings_change', {
        setting: settingName,
        newState: newState,
        timestamp: new Date().toISOString()
    });
    element._isToggling = false;
}
window.toggleSetting = toggleSetting;

function handleSettingChange(settingName, newState) {
    switch (settingName) {
        case 'ipDetection':
            if (newState) {
                console.log('✅ IP Detection enabled');
                if (currentUser) {
                    fetchUserInfo().then(info => {
                        if (info) {
                            checkIPChange(currentUser, info.ip, info.country_name);
                        }
                    });
                }
            } else {
                console.log('❌ IP Detection disabled');
            }
            break;
        case 'emailNotifications':
            if (newState) {
                console.log('✅ Email Notifications enabled');
                if (currentUser) {
                    sendTestNotification(currentUser.email);
                }
            } else {
                console.log('❌ Email Notifications disabled');
            }
            break;
        case 'twoFactorAuth':
            if (newState) {
                console.log('✅ Two-Factor Auth enabled');
                showToast('🔐 Two-Factor Authentication enabled', 'success', 3000);
            } else {
                console.log('❌ Two-Factor Auth disabled');
            }
            break;
    }
}
window.handleSettingChange = handleSettingChange;

async function renderSettingsUI() {
    const settings = await loadUserSettings();
    document.querySelectorAll('.toggle-switch[data-setting]').forEach(el => {
        const settingName = el.dataset.setting;
        const isActive = settings[settingName] === true;
        if (isActive) {
            el.classList.add('active');
            el.classList.remove('inactive');
        } else {
            el.classList.remove('active');
            el.classList.add('inactive');
        }
    });
}
window.renderSettingsUI = renderSettingsUI;

// ============================================================
// CHECKOUT - FINAL FIX
// ============================================================
window.checkout = function() {
    if (cart.length === 0) {
        showToast('⚠️ Your cart is empty', 'warning');
        return;
    }
    if (!currentUser) {
        showToast('⚠️ Please login to checkout', 'warning');
        openAuthModal();
        return;
    }
    openPaymentModal();
};

// ============================================================
// HANDLE TOPUP - FINAL FIX
// ============================================================
window.handleTopup = async function() {
    const btn = document.getElementById('topupProcessBtn');
    if (!btn) {
        showToast('❌ Topup button not found', 'error');
        return;
    }
    showButtonLoading(btn, 'Creating request...');
    try {
        await window.processTopup();
    } catch (error) {
        hideButtonLoading(btn);
        showToast('❌ Error: ' + error.message, 'error');
    }
};

// ============================================================
// CLOSE PAYMENT MODAL - FINAL FIX
// ============================================================
window.closePaymentModal = function() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
        selectedPayment = null;
        document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
        document.getElementById('paymentStep1').style.display = 'block';
        document.getElementById('paymentStep2').style.display = 'none';
    }
};

// ============================================================
// GO TO STEP 1 - FINAL FIX
// ============================================================
window.goToStep1 = function() {
    document.getElementById('paymentStep1').style.display = 'block';
    document.getElementById('paymentStep2').style.display = 'none';
    selectedPayment = null;
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
    const txInput = document.getElementById('transactionHashInput');
    if (txInput) txInput.value = '';
    const verificationResult = document.getElementById('verificationResult');
    if (verificationResult) {
        verificationResult.style.display = 'none';
        verificationResult.textContent = '';
    }
};

// ============================================================
// COPY WALLET ADDRESS - FINAL FIX
// ============================================================
// ✅ صحيح - دالة نسخ عنوان المحفظة
window.copyWalletAddress = function() {
    const addressElement = document.getElementById('walletAddressDisplay');
    if (!addressElement) {
        showToast('⚠️ Wallet address not found', 'warning');
        return;
    }
    const address = addressElement.textContent.trim();
    if (!address || address === '') {
        showToast('⚠️ No wallet address to copy', 'warning');
        return;
    }
    // ✅ يستخدم fallbackCopy بشكل صحيح
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(address)
            .then(() => showToast('✅ Wallet address copied!', 'success'))
            .catch(() => fallbackCopy(address));
    } else {
        fallbackCopy(address);
    }
};

// ✅ صحيح - دالة النسخ الاحتياطي (تستخدم مرة واحدة فقط)
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showToast('✅ Copied!', 'success');
    } catch (e) {
        showToast('❌ Failed to copy', 'error');
    }
    document.body.removeChild(textarea);
}
// ============================================================
// COPY BINANCE ID - FINAL FIX
// ============================================================
window.copyBinanceId = function() {
    const id = document.getElementById('binanceIdDisplay')?.textContent;
    if (!id) {
        showToast('⚠️ Binance ID not found', 'warning');
        return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(id)
            .then(() => showToast('✅ Binance ID copied!', 'success'))
            .catch(() => fallbackCopy(id));
    } else {
        fallbackCopy(id);
    }
};

// ============================================================
// VERIFY TRANSACTION - FINAL FIX
// ============================================================
window.verifyTransaction = function() {
    const input = document.getElementById('txHashInput');
    const result = document.getElementById('verificationResult');
    if (!input || !result) {
        showToast('⚠️ Verification elements not found', 'warning');
        return;
    }
    const tx = input.value.trim();
    if (!tx) {
        result.style.display = 'block';
        result.className = 'bv-result error';
        result.textContent = '⚠️ Please enter a transaction ID.';
        return;
    }
    if (tx.length < 6) {
        result.style.display = 'block';
        result.className = 'bv-result error';
        result.textContent = '❌ Transaction ID seems too short. Please check and try again.';
    } else {
        result.style.display = 'block';
        result.className = 'bv-result success';
        result.textContent = '✅ Transaction ID format looks valid. You can now confirm payment.';
    }
};

// ============================================================
// HANDLE TX PASTE - FINAL FIX
// ============================================================
window.handleTxPaste = function(event) {
    const input = event.target;
    setTimeout(() => {
        input.value = input.value.trim();
    }, 10);
};

// ============================================================
// SUBMIT MANUAL PAYMENT - FINAL FIX
// ============================================================
window.submitManualPayment = function() {
    const txHash = document.getElementById('txHashInput')?.value.trim();
    if (!txHash) {
        showToast('⚠️ Please paste the transaction ID', 'warning');
        const input = document.getElementById('txHashInput');
        if (input) {
            input.style.borderColor = 'var(--danger)';
            setTimeout(() => { input.style.borderColor = ''; }, 2000);
        }
        return;
    }
    const txInput = document.getElementById('transactionHashInput');
    if (txInput) txInput.value = txHash;
    placeOrder();
};

// ============================================================
// CHECK CONNECTION - FINAL FIX
// ============================================================
window.checkConnection = function() {
    if (!navigator.onLine) {
        showOfflineToast();
        return false;
    }
    return true;
};

// ============================================================
// REQUIRE CONNECTION - FINAL FIX
// ============================================================
window.requireConnection = function(message = 'This action requires internet connection.') {
    if (!navigator.onLine) {
        showToast('⚠️ ' + message, 'warning', 4000);
        return false;
    }
    return true;
};

// ============================================================
// INIT - COMPLETE
// ============================================================
async function initApp() {
    console.log('🚀 Initializing ZI Store...');
    try {
        // Branding
        loadBranding();
        
        // Products
        window.updateLoadingProgress(15, 'Loading products...');
        await loadProductsFromFirestore();
        startProductsRealtimeListener();
        
        // User data
        window.updateLoadingProgress(40, 'Loading user data...');
        await loadUserData();
        
        // Render
        renderProducts(products, false);
        renderFeaturedProducts();
        generateRecommendations(products);
        
        // UI Updates
        updateUI();
        updateDropdownStats();
        updateFullUserMenu();
        updateCartUI();
        updateBottomCartBar();
        updateBalanceDisplay();
        renderUserLicences();
        renderProxyPackages();
        renderLimitedProducts();
        
        // Data loading
        loadDownloads();
        loadNotifications();
        loadFeaturedSettings();
        loadSliderSettings();
        renderSliderSettingsUI();
        loadMarqueeSettings();
        applyMarqueeSettings();
        loadCoupons();
        fetchCryptoPrices();
        
        // Settings
        checkCookieConsent();
        initTopInfoBar();
        showTelegramBanner();
        
        // Network Status Detection
        addOfflineStyles();
        initNetworkMonitor();
        
        // Intervals
        window._productsInterval = setInterval(function() {
            if (navigator.onLine) {
                loadProductsFromFirestore();
            }
        }, 30000);
        window._cryptoInterval = setInterval(fetchCryptoPrices, 60000);
        
        if (currentUser) {
            loadUserBalance();
            startTopupRealtimeListener();
        }
        
        // Popups
        initPopups();
        
        // Finish
        window.updateLoadingProgress(100, '✅ Ready!');
        setTimeout(window.showMainApp, 300);
        setTimeout(hideLoadingScreen, 800);
        
        console.log('✅ ZI Store initialized successfully!');
    } catch (error) {
        console.error('❌ Init error:', error);
        window.updateLoadingProgress(100, '⚠️ Loaded with errors');
        setTimeout(window.showMainApp, 500);
        setTimeout(hideLoadingScreen, 1000);
        showToast('⚠️ Error loading store. Please refresh.', 'error');
    }
}

// ============================================================
// AUTH STATE LISTENER
// ============================================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        console.log('🔐 User authenticated:', user.email);
        
        try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists() && userSnap.data().isBanned === true) {
                await signOut(auth);
                currentUser = null;
                isAdminCached = false;
                document.getElementById('authSection').style.display = 'block';
                document.getElementById('mainApp').style.display = 'none';
                showToast('🚫 Your account has been banned.', 'error');
                hideLoadingScreen();
                return;
            }
            if (userSnap.exists()) {
                const data = userSnap.data();
                userProfile.photoURL = data.photoURL || user.photoURL || '';
                userProfile.balance = data.balance || 0;
                userBalance = userProfile.balance;
                userProfile.country = data.country || data.location || 'Unknown';
                userProfile.location = data.location || data.country || 'Unknown';
                userProfile.joined = data.createdAt ? new Date(data.createdAt.toDate())
                    .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) :
                    '--';
                userProfile.lastIP = data.lastIP || '';
                userProfile.lastCountry = data.lastCountry || '';
                userProfile.welcomeEmailSent = data.welcomeEmailSent || false;
                userProfile.loginCount = data.loginCount || 0;
                userProfile.settings = data.settings || { ipDetection: true, emailNotifications: true, twoFactorAuth: false };
            }
        } catch (error) { console.error('Error checking user data:', error); }

        await refreshAdminStatus();
        console.log('🔍 Admin status after login:', isAdminCached);

        document.getElementById('authSection').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';

        await loadUserData();
        updateDropdownStats();
        loadUserBalance();
        startTopupRealtimeListener();
        initTopInfoBar();
        initPopups();

        if (isAdminCached) {
            console.log('✅ Admin detected, loading admin features');
            loadAdminOrders();
            startAdminRealtimeListener();
            renderAdminProducts(products);
            loadLicences();
            loadAdminTopups();
            renderFallbackProductsAdmin();
            loadCoupons();
            setTimeout(addBannerAdminControls, 500);
            setTimeout(() => {
                const adminMenuItem = document.getElementById('adminMenuItem');
                if (adminMenuItem) adminMenuItem.style.display = 'flex';
                updateFullUserMenu();
                updateUI();
            }, 300);
        }

        loadDownloads();
        loadNotifications();
        fetchCryptoPrices();
        loadFeaturedSettings();
        loadSliderSettings();
        loadMarqueeSettings();
        setTimeout(showTelegramBanner, 1000);
        setTimeout(window.ensureAdminPanel, 2000);
        setTimeout(checkCookieConsent, 1000);
        window.updateLoadingProgress(100, '✅ Ready!');

        window.showMainApp();
        hideLoadingScreen();

        showToast(`👋 Welcome ${user.displayName || user.email || 'User'}!`, 'success', 3000);

    } else {
        currentUser = null;
        isAdminCached = false;
        console.log('🔓 No user authenticated');

        document.getElementById('authSection').style.display = 'block';
        document.getElementById('mainApp').style.display = 'none';

        await loadUserData();
        updateDropdownStats();
        loadDownloads();
        loadNotifications();
        fetchCryptoPrices();
        loadFeaturedSettings();
        loadSliderSettings();
        loadMarqueeSettings();
        setTimeout(checkCookieConsent, 1000);
        window.updateLoadingProgress(100, '👋 Please login');

        setTimeout(() => {
            hideLoadingScreen();
        }, 500);
    }
    updateUI();
    updateFullUserMenu();
    updateBalanceDisplay();
});

// ============================================================
// START APP
// ============================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// ============================================================
// EXPORT ALL FUNCTIONS TO WINDOW - COMPLETE
// ============================================================
// All functions are already defined with window. prefix where needed
// ============================================================
// EXPORT ALL FUNCTIONS TO WINDOW (COMPLETE)
// ============================================================
(function exportAllToWindow() {
    // قائمة بأسماء جميع الدوال التي يجب تصديرها إلى window
    const functionNames = [
        // دوال عامة
        'showToast', 'hideToast', 'showButtonLoading', 'hideButtonLoading',
        'hideLoadingScreen', 'showLoadingScreen', 'showMainApp',
        'updateLoadingProgress', 'startLoadingSimulation',
        'removeDuplicateDate', 'styleHeaderTopup', 'updateServerTime',
        'fetchUserInfo', 'getCountryFlag', 'initTopInfoBar',
        'checkIsAdmin', 'refreshAdminStatus', 'ensureAdminPanel',
        'getAdminSettings', 'updateAdminSettings',
        'loadFromLocalStorage', 'getUserId', 'startUserRealtimeListener',
        'loadUserData', 'saveUserData', 'generateReferralCode',
        'updateDropdownStats', 'updateRpDisplay', 'updateUI', 'updateFullUserMenu',
        'showLogin', 'showRegister', 'toggleReferral',
        'loginUser', 'registerUser', 'loginWithGoogle', 'mergeGuestData',
        'logoutUser', 'openForgotPassword', 'closeForgotPasswordModal',
        'sendForgotPassword',
        'openUserMenuFull', 'closeUserMenuFull',
        'openCartFull', 'closeCartFull',
        'openWishlistFull', 'closeWishlistFull',
        'openProfileFull', 'closeProfileFull',
        'openHistoryFull', 'closeHistoryFull',
        'openDownloads', 'closeDownloads',
        'openNotifications', 'closeNotifications',
        'openAuthModal',
        'openTransactionsModal', 'closeTransactionsModal',
        'loadTransactionHistory', 'renderTransactions',
        'renderProfileFull',
        'togglePasswordVisibility', 'saveProfileChangesInline',
        'sendResetLinkInline', 'changePasswordInline',
        'loadProductsFromFirestore', 'startProductsRealtimeListener',
        'getCurrencySymbol', 'renderBadges', 'renderProducts',
        'updateStatsFromProducts', 'generateRecommendations',
        'selectCurrency', 'selectProductType',
        'addQuantityOption', 'removeQuantityOption',
        'setQuantityOptions', 'toggleBadge', 'updateBadgesInput', 'setBadges',
        'renderFallbackProductsAdmin', 'editFallbackProduct',
        'openAddFallbackProductModal', 'closeFallbackProductModal',
        'saveFallbackProduct', 'deleteFallbackProduct',
        'renderFeaturedProducts', 'displayFeaturedSlice',
        'startFeaturedRotation', 'stopFeaturedRotation',
        'loadFeaturedSettings',
        'updateProductCardButton', 'addToCart', 'clearCart',
        'removeFromCart', 'updateCartQuantity',
        'updateBottomCartBar', 'updateCartUI', 'renderCartFull',
        'toggleRpSwitch', 'toggleRpInCart', 'applyCartPromo',
        'toggleWishlist', 'removeFromWishlist', 'updateWishlistUI',
        'createFloatingHearts', 'renderWishlistFull',
        'openDetails', 'addToCartFromDetails', 'closeProductDetails',
        'closePreviewModal', 'selectQuantityOption', 'selectVipPlan',
        'addVipPlanToCart',
        'openShareModal', 'closeShareModal',
        'shareToWhatsApp', 'shareToTelegram', 'shareToFacebook', 'copyShareLink',
        'filterProducts', 'performLiveSearch', 'highlightText',
        'clearSearch', 'closeSearchResults',
        'renderPaymentProducts', 'fetchCryptoPrices',
        'getLTCPrice', 'getUSDTPrice', 'updatePriceUI', 'updatePayableTotal',
        'selectPayment', 'continuePayment',
        'processBalancePayment', 'sendAdminNotification',
        'placeOrder', 'placeOrderTelegram',
        'sendTelegramNotification', 'bindTelegram',
        'startBindingListener', 'testTelegramNotification',
        'unlinkTelegram', 'checkTelegramStatus',
        'renderProxyPackages', 'addProxyToCart',
        'loadDownloads', 'renderDownloads', 'renderAdminDownloads',
        'createDownload', 'deleteDownload', 'editDownload',
        'openCreateDownloadModal', 'closeCreateDownloadModal',
        'loadNotifications', 'renderUserNotificationsFallback',
        'renderUserNotifications', 'renderAdminNotifications',
        'updateNotificationBadge', 'markAllNotificationsRead',
        'clearAllNotifications', 'createNotification',
        'deleteNotification', 'openCreateNotificationModal',
        'closeCreateNotificationModal',
        'openRequestsModal', 'closeRequestsModal',
        'openNewRequestModal', 'closeNewRequestModal', 'submitRequest',
        'openReferralModal', 'closeReferralModal', 'updateReferralUI',
        'copyReferralCode2',
        'openAdminPanel', 'closeAdminPanel', 'switchAdminTab',
        'renderAdminProducts', 'startAdminRealtimeListener',
        'loadAdminOrders', 'renderAdminOrders', 'updateAdminStats',
        'updateOrderStatus', 'deleteOrderImmediately',
        'searchAdminOrders', 'clearAdminSearch', 'refreshAdminOrders',
        'loadAdminUsers', 'renderAdminUsers',
        'searchAdminUsers', 'clearAdminUserSearch', 'refreshAdminUsers',
        'toggleUserBan', 'deleteUserAccount', 'viewUserDetails',
        'closeUserDetailsModal',
        'loadLicences', 'renderLicences',
        'openCreateLicenceModal', 'closeCreateLicenceModal',
        'createLicenceManually', 'updateLicenceInSupabase',
        'approveLicence', 'revokeLicence', 'deleteLicence',
        'editLicence', 'saveLicenceEdit',
        'searchLicences', 'clearLicenceSearch', 'refreshLicences',
        'renderUserLicences', 'toggleLicencesList',
        'openLicenceModal', 'closeLicenceModal', 'closeLicenseModal',
        'activatedLicence', 'activateLicence',
        'loadRatings', 'hasUserPurchasedProduct', 'submitRating',
        'renderStarHTML', 'setRating', 'renderRatingSection',
        'updateProductRatingDisplay',
        'goToSlide', 'nextSlide', 'prevSlide',
        'pauseSlider', 'resumeSlider',
        'saveSliderData', 'saveSliderInterval', 'saveSlideEdit',
        'deleteSlide', 'editSlide',
        'openAddSlideModal', 'closeAddSlideModal',
        'updateSlideProductSelect', 'toggleSlideLinkFields',
        'loadSliderSettings', 'renderSlider', 'startSliderRotation',
        'resetSliderTimer', 'renderSliderSettingsUI',
        'saveMarqueeSettings', 'applyMarqueeSettings',
        'renderMarqueeSettingsUI', 'loadMarqueeSettings',
        'loadDashboardStats', 'refreshDashboardStats',
        'loadAdvancedStats', 'refreshAdvancedStats',
        'loadAuditLogs', 'loadActivityLogs', 'exportActivityLogs',
        'loadFraudLogs',
        'clearOrderHistory', 'renderHistoryFull',
        'loadUserBalance', 'updateBalanceDisplay',
        'startTopupRealtimeListener', 'playNotificationSound',
        'openTopupStatus', 'closeTopupStatus', 'loadUserTopups',
        'openTopupModal', 'closeTopupModal',
        'selectTopupCurrency', 'updateTopupAmounts', 'selectTopupAmount',
        'processTopup', 'submitTopupWithTxHash',
        'approveTopup', 'rejectTopup', 'loadAdminTopups',
        'sendTelegramTopupNotification',
        'copyToClipboard', 'fallbackCopy',
        'checkoutWithBalance',
        'toggleSupportMenu', 'openSupportModal', 'closeSupportModal',
        'openWhatsAppSupport', 'openTelegramSupport',
        'openEmailSupport', 'openPhoneSupport',
        'acceptCookies', 'rejectCookies',
        'openCookieSettings', 'closeCookieSettings', 'saveCookieSettings',
        'enableAnalytics', 'disableAnalytics', 'checkCookieConsent',
        'closeCookieBanner',
        'showTelegramBanner', 'closeTelegramBanner', 'showTelegramBannerAgain',
        'addBannerAdminControls', 'adminToggleBanner', 'resetBannerForAll',
        'uploadToCloudinary', 'fixDirection',
        'copyLicenceCode', 'fallbackCopyText',
        'generateInvoice', 'exportOrders',
        'refreshAdminPayments', 'adminApprovePayment', 'adminRejectPayment',
        'adminDeletePayment',
        'trackUserBehavior', 'updateUserPreferences',
        'getRecommendations', 'getDefaultRecommendations',
        'detectFraud', 'logFraudDetection',
        'renderLimitedProducts',
        'initPopups', 'showExitPopup', 'showOfferPopup',
        'closePopup', 'applyPopupCoupon', 'subscribeAndApply',
        'loadCoupons', 'updateActiveCoupons',
        'openCreateCouponModal', 'closeCreateCouponModal',
        'saveCoupon', 'deleteCoupon', 'editCoupon', 'renderAdminCoupons',
        'sendEmail', 'sendWelcomeEmail', 'sendOrderConfirmationEmail',
        'sendOrderStatusEmail', 'sendTopupConfirmationEmail',
        'sendAdminNotificationEmail',
        'loadEmailLogs', 'renderEmailLogs', 'sendTestEmail',
        'previewEmail', 'resendEmail',
        'loadAdminSettingsUI', 'saveAdminSettings', 'getMyTelegramChatId',
        'loadBranding', 'saveBranding', 'applyBranding',
        'loadBrandingSettings', 'saveBrandingSettings', 'resetBranding',
        'generatePDFInvoice',
        'getVisitorInfo', 'getDeviceInfo', 'logActivity',
        'sendUserNotification', 'generateLicenceForUser', 'sendLicenceEmail',
        'showOfflineToast', 'showOnlineToast',
        'initNetworkMonitor', 'pauseOnlineOperations', 'resumeOnlineOperations',
        'addOfflineStyles',
        'loadUserSettings', 'saveUserSettings',
        'toggleSetting', 'handleSettingChange', 'renderSettingsUI',
        'checkout', 'handleTopup',
        'closePaymentModal', 'goToStep1',
        'copyWalletAddress', 'fallbackCopy',
        'copyBinanceId',
        'verifyTransaction', 'handleTxPaste', 'submitManualPayment',
        'checkConnection', 'requireConnection',
        'initApp'
    ];

    // تصدير كل دالة موجودة في النطاق الحالي
    functionNames.forEach(name => {
        try {
            // الوصول إلى الدالة من نطاق الوحدة باستخدام eval
            const func = eval(name);
            if (typeof func === 'function') {
                window[name] = func;
                console.log(`✅ Exported: ${name}`);
            } else {
                console.warn(`⚠️ ${name} is not a function or not defined`);
            }
        } catch (e) {
            console.warn(`⚠️ Could not export ${name}: ${e.message}`);
        }
    });
})();
console.log('✅ All functions exported to window - COMPLETE');
console.log('✅ ZI Store script loaded successfully - COMPLETE');
