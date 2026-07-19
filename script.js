// ============================================================
// ZI STORE - Main Application Script (FULL VERSION)
// ============================================================

import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut, 
    signInWithPopup, 
    GoogleAuthProvider,
    sendEmailVerification,
    sendPasswordResetEmail,
    updateProfile,
    updateEmail,
    updatePassword,
    reauthenticateWithPopup,
    EmailAuthProvider,
    reauthenticateWithCredential
} from "firebase/auth";
import { 
    getFirestore, 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    addDoc, 
    query, 
    where, 
    orderBy, 
    limit,
    onSnapshot,
    serverTimestamp,
    arrayUnion,
    arrayRemove,
    increment,
    Timestamp,
    writeBatch,
    runTransaction
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, uploadBytesResumable } from "firebase/storage";
import { getAnalytics, logEvent, setUserProperties } from "firebase/analytics";

// ============================================================
// FIREBASE CONFIGURATION
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

// ============================================================
// GLOBAL STATE
// ============================================================
let currentUser = null;
let allProducts = [];
let filteredProducts = [];
let currentFilter = 'all';
let cart = [];
let wishlist = [];
let notifications = [];
let currentLanguage = localStorage.getItem('language') || 'en';
let currentCurrency = localStorage.getItem('currency') || 'USD';
let exchangeRates = { USD: 1, TND: 3.1, EUR: 0.92 };
let selectedVipPlan = null;
let currentProduct = null;
let orders = [];
let downloads = [];
let slides = [];
let licences = [];
let paymentRequests = [];
let auditLogs = [];
let couponCodes = [];
let referralData = { code: '', count: 0, rewards: 0 };
let userRequests = [];
let featuredProducts = [];
let sliderInterval = null;
let currentSlideIndex = 0;
let isAdmin = false;
let adminStats = { totalOrders: 0, totalRevenue: 0, netRevenue: 0, totalUsers: 0, totalProducts: 0 };
let selectedPaymentMethod = null;
let currentPage = 1;
let itemsPerPage = 12;
let searchQuery = '';
let sortBy = 'newest';

// ============================================================
// DOM REFERENCES
// ============================================================
const $ = (id) => document.getElementById(id);
const productList = $('productList');
const searchInput = $('liveSearchInput');
const searchResults = $('searchResults');
const cartBadge = $('cartBadge');
const wishlistBadge = $('wishlistBadge');
const notifBadge = $('notifBadge');
const userAvatarText = $('userAvatarText');
const userDot = $('userDot');
const bottomCartCount = $('bottomCartCount');
const bottomCartTotal = $('bottomCartTotal');
const sliderWrapper = $('sliderWrapper');
const sliderDots = $('sliderDots');
const recommendationsGrid = $('recommendationsGrid');
const totalScripts = $('totalScripts');
const freeScripts = $('freeScripts');
const vipScripts = $('vipScripts');
const wishlistStats = $('wishlistStats');

// ============================================================
// LANGUAGE SUPPORT
// ============================================================
const translations = {
    en: {
        welcome: 'Welcome to ZI Store',
        search: 'Search products...',
        addToCart: 'Add to Cart',
        buyNow: 'Buy Now',
        free: 'FREE',
        vip: 'VIP',
        total: 'Total',
        loading: 'Loading...',
        noProducts: 'No products found',
        signIn: 'Sign In',
        signOut: 'Sign Out',
        profile: 'Profile',
        orders: 'Orders',
        favorites: 'Favorites',
        cart: 'Cart',
        notifications: 'Notifications',
        adminPanel: 'Admin Panel',
        support: 'Support',
        language: 'Language',
        theme: 'Theme',
        confirm: 'Confirm',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        save: 'Save',
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Info',
        featured: 'Featured',
        recommended: 'Recommended for You',
        allProducts: 'All Products',
        freeProducts: 'Free Products',
        vipProducts: 'VIP Products',
        price: 'Price',
        originalPrice: 'Original Price',
        description: 'Description',
        features: 'Features',
        duration: 'Duration',
        status: 'Status',
        available: 'Available',
        unavailable: 'Unavailable',
        badge: 'Badge',
        currency: 'Currency',
        productType: 'Product Type',
        standard: 'Standard',
        quantityBased: 'Quantity-based',
        quantityOptions: 'Quantity Options',
        addOption: 'Add Option',
        remove: 'Remove',
        order: 'Order',
        totalOrders: 'Total Orders',
        totalRevenue: 'Total Revenue',
        netRevenue: 'Net Revenue',
        pending: 'Pending',
        confirmed: 'Confirmed',
        rejected: 'Rejected',
        completed: 'Completed',
        viewDetails: 'View Details',
        orderStatus: 'Order Status',
        orderDate: 'Order Date',
        orderTotal: 'Order Total',
        orderItems: 'Order Items',
        shippingAddress: 'Shipping Address',
        paymentMethod: 'Payment Method',
        paymentStatus: 'Payment Status',
        transactionId: 'Transaction ID',
        walletAddress: 'Wallet Address',
        copyAddress: 'Copy Address',
        amountToPay: 'Amount to Pay',
        payNow: 'Pay Now',
        cancelOrder: 'Cancel Order',
        requestRefund: 'Request Refund',
        refundPolicy: 'Refund Policy',
        privacyPolicy: 'Privacy Policy',
        termsOfService: 'Terms of Service',
        aboutUs: 'About Us',
        contactUs: 'Contact Us',
        supportHours: 'Support Hours: 24/7',
        replyWithin: 'We reply within 24 hours',
        instagram: 'Instagram',
        tiktok: 'TikTok',
        facebook: 'Facebook',
        twitter: 'Twitter',
        youtube: 'YouTube',
        telegram: 'Telegram',
        whatsapp: 'WhatsApp',
        email: 'Email',
        phone: 'Phone',
        copyLink: 'Copy Link',
        share: 'Share',
        shareOn: 'Share on',
        copied: 'Copied!',
        verifyEmail: 'Verify Email',
        emailVerified: 'Email Verified',
        emailNotVerified: 'Email Not Verified',
        resendVerification: 'Resend Verification Email',
        resetPassword: 'Reset Password',
        forgotPassword: 'Forgot Password?',
        newPassword: 'New Password',
        confirmPassword: 'Confirm Password',
        passwordsDoNotMatch: 'Passwords do not match',
        passwordTooShort: 'Password must be at least 6 characters',
        login: 'Login',
        register: 'Register',
        fullName: 'Full Name',
        country: 'Country',
        referralCode: 'Referral Code',
        haveReferral: 'Have a referral code?',
        agreeToTerms: 'I agree to the Terms & Conditions',
        alreadyHaveAccount: 'Already have an account?',
        dontHaveAccount: 'Don\'t have an account?',
        createAccount: 'Create Account',
        welcomeBack: 'Welcome Back!',
        signInWithGoogle: 'Sign in with Google',
        or: 'Or',
        logout: 'Logout',
        myAccount: 'My Account',
        myOrders: 'My Orders',
        myWishlist: 'My Wishlist',
        myCart: 'My Cart',
        myNotifications: 'My Notifications',
        myRequests: 'My Requests',
        myLicences: 'My Licences',
        activateLicence: 'Activate Licence',
        enterLicenceCode: 'Enter your licence code',
        activate: 'Activate',
        licenceActivated: 'Licence activated successfully!',
        licenceInvalid: 'Invalid licence code',
        licenceExpired: 'Licence expired',
        licenceAlreadyUsed: 'Licence already used',
        licenceRevoked: 'Licence revoked',
        licencePending: 'Licence pending',
        licenceActive: 'Licence active',
        licenceUsed: 'Licence used',
        licenceExpired: 'Licence expired',
        licenceRevoked: 'Licence revoked',
        createLicence: 'Create Licence',
        editLicence: 'Edit Licence',
        deleteLicence: 'Delete Licence',
        productName: 'Product Name',
        userId: 'User ID',
        expiryDate: 'Expiry Date',
        status: 'Status',
        code: 'Code',
        script: 'Script',
        noLicences: 'No licences found',
        noOrders: 'No orders found',
        noNotifications: 'No notifications',
        noFavorites: 'No favorites',
        noDownloads: 'No downloads',
        noProductsFound: 'No products found',
        noResults: 'No results found',
        searchResults: 'Search Results',
        showing: 'Showing',
        of: 'of',
        results: 'results',
        loadMore: 'Load More',
        loadingMore: 'Loading more...',
        all: 'All',
        free: 'Free',
        paid: 'Paid',
        featured: 'Featured',
        newest: 'Newest',
        oldest: 'Oldest',
        priceLowToHigh: 'Price: Low to High',
        priceHighToLow: 'Price: High to Low',
        sortBy: 'Sort By',
        filter: 'Filter',
        clear: 'Clear',
        apply: 'Apply',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        continue: 'Continue',
        submit: 'Submit',
        send: 'Send',
        receive: 'Receive',
        request: 'Request',
        response: 'Response',
        approved: 'Approved',
        rejected: 'Rejected',
        pending: 'Pending',
        inProgress: 'In Progress',
        completed: 'Completed',
        newRequest: 'New Request',
        requestTitle: 'Request Title',
        requestDescription: 'Request Description',
        requestBudget: 'Budget',
        requestCategory: 'Category',
        requestPriority: 'Priority',
        requestStatus: 'Status',
        requestDate: 'Date',
        requestResponse: 'Response',
        gameName: 'Game Name',
        playStoreLink: 'Play Store Link',
        featuresNeeded: 'Features Needed',
        submitRequest: 'Submit Request',
        myRequests: 'My Requests',
        noRequests: 'No requests found',
        requestSubmitted: 'Request submitted successfully!',
        requestUpdated: 'Request updated successfully!',
        requestDeleted: 'Request deleted successfully!',
        referralProgram: 'Refer & Earn',
        referralCode: 'Your Referral Code',
        referralCount: 'Referrals',
        referralRewards: 'Earned',
        referralActivity: 'Referral Activity',
        referralSteps: 'How it works:',
        referStep1: '1. Share your referral code with friends',
        referStep2: '2. They sign up using your code',
        referStep3: '3. You earn rewards for each successful referral',
        referStep4: '4. Rewards are credited to your account',
        copyReferralCode: 'Copy Referral Code',
        referralCopied: 'Referral code copied!',
        noReferrals: 'No referrals yet',
        totalReferrals: 'Total Referrals',
        totalRewards: 'Total Rewards',
        reward: 'Reward',
        rewards: 'Rewards',
        earn: 'Earn',
        earnPerReferral: 'Earn per referral',
        referralLink: 'Referral Link',
        referralLinkCopied: 'Referral link copied!',
        shareReferral: 'Share Referral',
        inviteFriends: 'Invite Friends',
        inviteNow: 'Invite Now',
        referAndEarn: 'Refer & Earn',
        startEarning: 'Start Earning',
        referralBonus: 'Referral Bonus',
        referralBonusAmount: 'Bonus Amount',
        referralTerms: 'Terms & Conditions apply',
        cookieConsent: 'We use cookies to improve your experience',
        cookieAccept: 'Accept All',
        cookieReject: 'Reject All',
        cookieSettings: 'Cookie Settings',
        essentialCookies: 'Essential Cookies',
        analyticsCookies: 'Analytics Cookies',
        marketingCookies: 'Marketing Cookies',
        cookiePreferences: 'Cookie Preferences',
        savePreferences: 'Save Preferences',
        manageCookies: 'Manage Cookies',
        privacy: 'Privacy',
        terms: 'Terms',
        refund: 'Refund',
        faq: 'FAQ',
        help: 'Help',
        supportCenter: 'Support Center',
        contactSupport: 'Contact Support',
        submitTicket: 'Submit Ticket',
        ticketSubject: 'Subject',
        ticketMessage: 'Message',
        ticketPriority: 'Priority',
        ticketStatus: 'Status',
        ticketDate: 'Date',
        ticketResponse: 'Response',
        noTickets: 'No tickets found',
        ticketSubmitted: 'Ticket submitted successfully!',
        ticketUpdated: 'Ticket updated successfully!',
        ticketClosed: 'Ticket closed',
        ticketReopened: 'Ticket reopened',
        highPriority: 'High Priority',
        mediumPriority: 'Medium Priority',
        lowPriority: 'Low Priority',
        urgent: 'Urgent',
        important: 'Important',
        normal: 'Normal',
        low: 'Low',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Info',
        loading: 'Loading...',
        processing: 'Processing...',
        pleaseWait: 'Please wait...',
        somethingWentWrong: 'Something went wrong',
        pleaseTryAgain: 'Please try again',
        connectionError: 'Connection error',
        networkError: 'Network error',
        serverError: 'Server error',
        unauthorized: 'Unauthorized',
        forbidden: 'Forbidden',
        notFound: 'Not found',
        badRequest: 'Bad request',
        validationError: 'Validation error',
        duplicateEntry: 'Duplicate entry',
        alreadyExists: 'Already exists',
        doesNotExist: 'Does not exist',
        insufficientPermissions: 'Insufficient permissions',
        sessionExpired: 'Session expired',
        pleaseLogin: 'Please login',
        loginRequired: 'Login required',
        adminRequired: 'Admin access required',
        vipRequired: 'VIP access required',
        subscriptionRequired: 'Subscription required',
        paymentRequired: 'Payment required',
        paymentFailed: 'Payment failed',
        paymentSuccessful: 'Payment successful',
        paymentPending: 'Payment pending',
        paymentProcessing: 'Payment processing',
        paymentCancelled: 'Payment cancelled',
        paymentRefunded: 'Payment refunded',
        paymentError: 'Payment error',
        invalidPaymentMethod: 'Invalid payment method',
        invalidCurrency: 'Invalid currency',
        invalidAmount: 'Invalid amount',
        insufficientFunds: 'Insufficient funds',
        transactionFailed: 'Transaction failed',
        transactionCompleted: 'Transaction completed',
        transactionPending: 'Transaction pending',
        transactionReversed: 'Transaction reversed',
        transactionNotFound: 'Transaction not found',
        walletBalance: 'Wallet Balance',
        walletDeposit: 'Deposit',
        walletWithdraw: 'Withdraw',
        walletHistory: 'Wallet History',
        walletTransaction: 'Transaction',
        walletAmount: 'Amount',
        walletDate: 'Date',
        walletStatus: 'Status',
        walletType: 'Type',
        walletDescription: 'Description',
        noTransactions: 'No transactions found',
        deposit: 'Deposit',
        withdraw: 'Withdraw',
        transfer: 'Transfer',
        balance: 'Balance',
        credit: 'Credit',
        debit: 'Debit',
        availableBalance: 'Available Balance',
        pendingBalance: 'Pending Balance',
        totalBalance: 'Total Balance',
        wallet: 'Wallet',
        walletAddress: 'Wallet Address',
        walletNetwork: 'Network',
        walletMethod: 'Method',
        walletAmount: 'Amount',
        walletCurrency: 'Currency',
        walletFee: 'Fee',
        walletTotal: 'Total',
        walletConfirm: 'Confirm',
        walletCancel: 'Cancel',
        walletSuccess: 'Wallet transaction successful',
        walletError: 'Wallet transaction failed',
        walletPending: 'Wallet transaction pending',
        walletProcessing: 'Wallet transaction processing',
        walletCompleted: 'Wallet transaction completed',
        walletFailed: 'Wallet transaction failed',
        walletReversed: 'Wallet transaction reversed',
        walletNotFound: 'Wallet transaction not found',
        browseProducts: 'Browse Products',
        checkout: 'Checkout',
        selectPaymentMethod: 'Select payment method',
        paymentConfirmed: 'Payment confirmed',
        paymentRejected: 'Payment rejected',
        orderPlaced: 'Order placed successfully!',
        productAdded: 'Product added successfully!',
        productUpdated: 'Product updated successfully!',
        productDeleted: 'Product deleted successfully!',
        productNotFound: 'Product not found',
        confirmDelete: 'Are you sure you want to delete this?',
        confirmDeleteUser: 'Are you sure you want to delete this user?',
        userDeleted: 'User deleted successfully!',
        userNotFound: 'User not found',
        noUsers: 'No users found',
        noSlides: 'No slides found',
        slideAdded: 'Slide added successfully!',
        errorUploadingImage: 'Error uploading image',
        licenceCreated: 'Licence created successfully!',
        licenceUpdated: 'Licence updated successfully!',
        licenceNotFound: 'Licence not found',
        enterProductName: 'Please enter product name',
        noLogs: 'No logs found',
        marqueeSaved: 'Marquee settings saved!',
        noPaymentRequests: 'No payment requests found',
        lastUpdated: 'Last updated',
        totalProducts: 'Total Products',
        totalUsers: 'Total Users',
        freeProducts: 'Free Products',
        vipProducts: 'VIP Products',
        memberSince: 'Member since',
        lastLogin: 'Last login',
        noItems: 'No items',
        complete: 'Complete',
        reject: 'Reject',
        searchUsers: 'Search users...',
        searching: 'Searching...',
        downloadAdded: 'Download added successfully!',
        notificationSent: 'Notification sent!',
        addProduct: 'Add Product',
        editProduct: 'Edit Product',
        slideDeleted: 'Slide deleted successfully!',
        licenceDeleted: 'Licence deleted successfully!',
        paymentConfirmed: 'Payment confirmed',
        paymentRejected: 'Payment rejected',
        orderNotFound: 'Order not found',
        orderDetails: 'Order Details',
        orderCompleted: 'Order completed',
        orderRejected: 'Order rejected',
        addDownload: 'Add Download',
        sendNotification: 'Send Notification',
        createLicence: 'Create Licence',
        editLicence: 'Edit Licence',
        deleteLicence: 'Delete Licence',
        refresh: 'Refresh',
        export: 'Export',
        import: 'Import',
        upload: 'Upload',
        download: 'Download',
        preview: 'Preview',
        publish: 'Publish',
        unpublish: 'Unpublish',
        draft: 'Draft',
        live: 'Live',
        scheduled: 'Scheduled',
        expired: 'Expired',
        active: 'Active',
        inactive: 'Inactive',
        enabled: 'Enabled',
        disabled: 'Disabled',
        yes: 'Yes',
        no: 'No',
        ok: 'OK',
        cancel: 'Cancel',
        apply: 'Apply',
        reset: 'Reset',
        settings: 'Settings',
        preferences: 'Preferences',
        account: 'Account',
        security: 'Security',
        privacy: 'Privacy',
        notifications: 'Notifications',
        language: 'Language',
        theme: 'Theme',
        appearance: 'Appearance',
        advanced: 'Advanced',
        general: 'General',
        system: 'System',
        update: 'Update',
        install: 'Install',
        uninstall: 'Uninstall',
        upgrade: 'Upgrade',
        downgrade: 'Downgrade',
        version: 'Version',
        build: 'Build',
        release: 'Release',
        stable: 'Stable',
        beta: 'Beta',
        alpha: 'Alpha',
        dev: 'Development',
        prod: 'Production',
        env: 'Environment',
        debug: 'Debug',
        trace: 'Trace',
        verbose: 'Verbose',
        quiet: 'Quiet',
        silent: 'Silent',
        force: 'Force',
        overwrite: 'Overwrite',
        skip: 'Skip',
        retry: 'Retry',
        abort: 'Abort',
        ignore: 'Ignore',
        report: 'Report',
        feedback: 'Feedback',
        rating: 'Rating',
        review: 'Review',
        comment: 'Comment',
        reply: 'Reply',
        like: 'Like',
        dislike: 'Dislike',
        vote: 'Vote',
        share: 'Share',
        follow: 'Follow',
        unfollow: 'Unfollow',
        block: 'Block',
        unblock: 'Unblock',
        mute: 'Mute',
        unmute: 'Unmute',
        pin: 'Pin',
        unpin: 'Unpin',
        archive: 'Archive',
        unarchive: 'Unarchive',
        restore: 'Restore',
        purge: 'Purge',
        clear: 'Clear',
        select: 'Select',
        deselect: 'Deselect',
        selectAll: 'Select All',
        deselectAll: 'Deselect All',
        expand: 'Expand',
        collapse: 'Collapse',
        show: 'Show',
        hide: 'Hide',
        toggle: 'Toggle',
        enable: 'Enable',
        disable: 'Disable',
        start: 'Start',
        stop: 'Stop',
        pause: 'Pause',
        resume: 'Resume',
        play: 'Play',
        pause: 'Pause',
        stop: 'Stop',
        next: 'Next',
        previous: 'Previous',
        first: 'First',
        last: 'Last',
        page: 'Page',
        of: 'of',
        rows: 'rows',
        columns: 'columns',
        grid: 'Grid',
        list: 'List',
        table: 'Table',
        cards: 'Cards',
        details: 'Details',
        summary: 'Summary',
        total: 'Total',
        subtotal: 'Subtotal',
        tax: 'Tax',
        shipping: 'Shipping',
        discount: 'Discount',
        coupon: 'Coupon',
        gift: 'Gift',
        promo: 'Promo',
        promoCode: 'Promo Code',
        applyCoupon: 'Apply Coupon',
        removeCoupon: 'Remove Coupon',
        invalidCoupon: 'Invalid coupon code',
        expiredCoupon: 'Coupon expired',
        usedCoupon: 'Coupon already used',
        couponApplied: 'Coupon applied successfully!',
        orderSummary: 'Order Summary',
        continueShopping: 'Continue Shopping',
        proceedToCheckout: 'Proceed to Checkout',
        paymentMethod: 'Payment Method',
        paymentDetails: 'Payment Details',
        billingAddress: 'Billing Address',
        shippingAddress: 'Shipping Address',
        sameAsBilling: 'Same as billing address',
        orderNote: 'Order Note',
        orderNotePlaceholder: 'Special instructions for seller...',
        placeOrder: 'Place Order',
        thankYou: 'Thank You!',
        orderReceived: 'Your order has been received',
        orderNumber: 'Order Number',
        orderEmail: 'Order Email',
        orderTotal: 'Order Total',
        orderStatus: 'Order Status',
        orderDate: 'Order Date',
        orderItems: 'Order Items',
        orderSummary: 'Order Summary',
        shippingMethod: 'Shipping Method',
        trackingNumber: 'Tracking Number',
        estimatedDelivery: 'Estimated Delivery',
        delivery: 'Delivery',
        pickup: 'Pickup',
        inStore: 'In Store',
        online: 'Online',
        physical: 'Physical',
        digital: 'Digital',
        service: 'Service',
        subscription: 'Subscription',
        license: 'License',
        key: 'Key',
        code: 'Code',
        downloadNow: 'Download Now',
        viewLicense: 'View License',
        activateLicense: 'Activate License',
        deactivateLicense: 'Deactivate License',
        transferLicense: 'Transfer License',
        renewLicense: 'Renew License',
        extendLicense: 'Extend License',
        upgradeLicense: 'Upgrade License',
        downgradeLicense: 'Downgrade License',
        licenseDetails: 'License Details',
        licenseType: 'License Type',
        licenseKey: 'License Key',
        licenseStatus: 'License Status',
        licenseExpiry: 'License Expiry',
        licenseCreated: 'License Created',
        licenseUpdated: 'License Updated',
        licenseActivated: 'License Activated',
        licenseDeactivated: 'License Deactivated',
        licenseTransferred: 'License Transferred',
        licenseRenewed: 'License Renewed',
        licenseExtended: 'License Extended',
        licenseUpgraded: 'License Upgraded',
        licenseDowngraded: 'License Downgraded',
        noLicenseFound: 'No license found',
        invalidLicense: 'Invalid license',
        expiredLicense: 'Expired license',
        revokedLicense: 'Revoked license',
        suspendedLicense: 'Suspended license',
        pendingLicense: 'Pending license',
        activeLicense: 'Active license',
        usedLicense: 'Used license',
        availableLicense: 'Available license',
        licenseLimit: 'License Limit',
        licenseCount: 'License Count',
        licenseUsage: 'License Usage',
        licenseRemaining: 'License Remaining',
        licenseRenewal: 'License Renewal',
        licenseActivation: 'License Activation',
        licenseDeactivation: 'License Deactivation',
        licenseTransfer: 'License Transfer',
        licenseUpgrade: 'License Upgrade',
        licenseDowngrade: 'License Downgrade',
        licenseExtend: 'License Extend',
        licenseRenew: 'License Renew',
        licenseEdit: 'License Edit',
        licenseDelete: 'License Delete',
        licenseCreate: 'License Create',
        licenseAdd: 'License Add',
        licenseRemove: 'License Remove',
        licenseAssign: 'License Assign',
        licenseUnassign: 'License Unassign',
        licenseBulk: 'License Bulk',
        licenseImport: 'License Import',
        licenseExport: 'License Export',
        licenseGenerate: 'License Generate',
        licenseValidate: 'License Validate',
        licenseCheck: 'License Check',
        licenseVerify: 'License Verify',
        licenseConfirm: 'License Confirm',
        licenseCancel: 'License Cancel'
    },
    ar: {
        welcome: 'مرحباً بك في ZI Store',
        search: 'البحث عن المنتجات...',
        addToCart: 'أضف إلى السلة',
        buyNow: 'اشتري الآن',
        free: 'مجاني',
        vip: 'VIP',
        total: 'المجموع',
        loading: 'جاري التحميل...',
        noProducts: 'لا توجد منتجات',
        signIn: 'تسجيل الدخول',
        signOut: 'تسجيل الخروج',
        profile: 'الملف الشخصي',
        orders: 'الطلبات',
        favorites: 'المفضلة',
        cart: 'السلة',
        notifications: 'الإشعارات',
        adminPanel: 'لوحة التحكم',
        support: 'الدعم',
        language: 'اللغة',
        theme: 'المظهر',
        confirm: 'تأكيد',
        cancel: 'إلغاء',
        delete: 'حذف',
        edit: 'تعديل',
        save: 'حفظ',
        success: 'نجاح',
        error: 'خطأ',
        warning: 'تحذير',
        info: 'معلومات',
        featured: 'مميز',
        recommended: 'موصى به لك',
        allProducts: 'جميع المنتجات',
        freeProducts: 'المنتجات المجانية',
        vipProducts: 'منتجات VIP',
        price: 'السعر',
        originalPrice: 'السعر الأصلي',
        description: 'الوصف',
        features: 'المميزات',
        duration: 'المدة',
        status: 'الحالة',
        available: 'متاح',
        unavailable: 'غير متاح',
        badge: 'الشارة',
        currency: 'العملة',
        productType: 'نوع المنتج',
        standard: 'قياسي',
        quantityBased: 'حسب الكمية',
        quantityOptions: 'خيارات الكمية',
        addOption: 'إضافة خيار',
        remove: 'إزالة',
        order: 'طلب',
        totalOrders: 'إجمالي الطلبات',
        totalRevenue: 'إجمالي الإيرادات',
        netRevenue: 'صافي الإيرادات',
        pending: 'قيد الانتظار',
        confirmed: 'مؤكد',
        rejected: 'مرفوض',
        completed: 'مكتمل',
        viewDetails: 'عرض التفاصيل',
        orderStatus: 'حالة الطلب',
        orderDate: 'تاريخ الطلب',
        orderTotal: 'إجمالي الطلب',
        orderItems: 'عناصر الطلب',
        shippingAddress: 'عنوان الشحن',
        paymentMethod: 'طريقة الدفع',
        paymentStatus: 'حالة الدفع',
        transactionId: 'رقم المعاملة',
        walletAddress: 'عنوان المحفظة',
        copyAddress: 'نسخ العنوان',
        amountToPay: 'المبلغ المطلوب',
        payNow: 'ادفع الآن',
        cancelOrder: 'إلغاء الطلب',
        requestRefund: 'طلب استرداد',
        refundPolicy: 'سياسة الاسترداد',
        privacyPolicy: 'سياسة الخصوصية',
        termsOfService: 'شروط الخدمة',
        aboutUs: 'من نحن',
        contactUs: 'اتصل بنا',
        supportHours: 'ساعات الدعم: 24/7',
        replyWithin: 'نرد خلال 24 ساعة',
        instagram: 'إنستغرام',
        tiktok: 'تيك توك',
        facebook: 'فيسبوك',
        twitter: 'تويتر',
        youtube: 'يوتيوب',
        telegram: 'تيليجرام',
        whatsapp: 'واتساب',
        email: 'البريد الإلكتروني',
        phone: 'الهاتف',
        copyLink: 'نسخ الرابط',
        share: 'مشاركة',
        shareOn: 'مشاركة على',
        copied: 'تم النسخ!',
        verifyEmail: 'تحقق من البريد الإلكتروني',
        emailVerified: 'البريد الإلكتروني مؤكد',
        emailNotVerified: 'البريد الإلكتروني غير مؤكد',
        resendVerification: 'إعادة إرسال التحقق',
        resetPassword: 'إعادة تعيين كلمة المرور',
        forgotPassword: 'نسيت كلمة المرور؟',
        newPassword: 'كلمة المرور الجديدة',
        confirmPassword: 'تأكيد كلمة المرور',
        passwordsDoNotMatch: 'كلمات المرور غير متطابقة',
        passwordTooShort: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
        login: 'تسجيل الدخول',
        register: 'إنشاء حساب',
        fullName: 'الاسم الكامل',
        country: 'الدولة',
        referralCode: 'رمز الإحالة',
        haveReferral: 'هل لديك رمز إحالة؟',
        agreeToTerms: 'أوافق على الشروط والأحكام',
        alreadyHaveAccount: 'لديك حساب بالفعل؟',
        dontHaveAccount: 'ليس لديك حساب؟',
        createAccount: 'إنشاء حساب',
        welcomeBack: 'مرحباً بعودتك!',
        signInWithGoogle: 'تسجيل الدخول بواسطة جوجل',
        or: 'أو',
        logout: 'تسجيل الخروج',
        myAccount: 'حسابي',
        myOrders: 'طلباتي',
        myWishlist: 'مفضلتي',
        myCart: 'سلتي',
        myNotifications: 'إشعاراتي',
        myRequests: 'طلباتي',
        myLicences: 'تراخيصي',
        activateLicence: 'تفعيل الترخيص',
        enterLicenceCode: 'أدخل رمز الترخيص',
        activate: 'تفعيل',
        licenceActivated: 'تم تفعيل الترخيص بنجاح!',
        licenceInvalid: 'رمز الترخيص غير صالح',
        licenceExpired: 'انتهت صلاحية الترخيص',
        licenceAlreadyUsed: 'الترخيص مستخدم بالفعل',
        licenceRevoked: 'تم إلغاء الترخيص',
        licencePending: 'ترخيص قيد الانتظار',
        licenceActive: 'ترخيص نشط',
        licenceUsed: 'ترخيص مستخدم',
        licenceExpired: 'ترخيص منتهي الصلاحية',
        licenceRevoked: 'ترخيص ملغي',
        createLicence: 'إنشاء ترخيص',
        editLicence: 'تعديل الترخيص',
        deleteLicence: 'حذف الترخيص',
        productName: 'اسم المنتج',
        userId: 'معرف المستخدم',
        expiryDate: 'تاريخ الانتهاء',
        status: 'الحالة',
        code: 'الرمز',
        script: 'السكربت',
        noLicences: 'لا توجد تراخيص',
        noOrders: 'لا توجد طلبات',
        noNotifications: 'لا توجد إشعارات',
        noFavorites: 'لا توجد مفضلات',
        noDownloads: 'لا توجد تحميلات',
        noProductsFound: 'لا توجد منتجات',
        noResults: 'لا توجد نتائج',
        searchResults: 'نتائج البحث',
        showing: 'عرض',
        of: 'من',
        results: 'نتائج',
        loadMore: 'تحميل المزيد',
        loadingMore: 'جاري التحميل...',
        all: 'الكل',
        free: 'مجاني',
        paid: 'مدفوع',
        featured: 'مميز',
        newest: 'الأحدث',
        oldest: 'الأقدم',
        priceLowToHigh: 'السعر: من الأقل إلى الأعلى',
        priceHighToLow: 'السعر: من الأعلى إلى الأقل',
        sortBy: 'ترتيب حسب',
        filter: 'فلتر',
        clear: 'مسح',
        apply: 'تطبيق',
        close: 'إغلاق',
        back: 'رجوع',
        next: 'التالي',
        previous: 'السابق',
        continue: 'استمرار',
        submit: 'إرسال',
        send: 'إرسال',
        receive: 'استلام',
        request: 'طلب',
        response: 'رد',
        approved: 'مقبول',
        rejected: 'مرفوض',
        pending: 'قيد الانتظار',
        inProgress: 'قيد التنفيذ',
        completed: 'مكتمل',
        newRequest: 'طلب جديد',
        requestTitle: 'عنوان الطلب',
        requestDescription: 'وصف الطلب',
        requestBudget: 'الميزانية',
        requestCategory: 'التصنيف',
        requestPriority: 'الأولوية',
        requestStatus: 'الحالة',
        requestDate: 'التاريخ',
        requestResponse: 'الرد',
        gameName: 'اسم اللعبة',
        playStoreLink: 'رابط متجر بلاي',
        featuresNeeded: 'المميزات المطلوبة',
        submitRequest: 'إرسال الطلب',
        myRequests: 'طلباتي',
        noRequests: 'لا توجد طلبات',
        requestSubmitted: 'تم إرسال الطلب بنجاح!',
        requestUpdated: 'تم تحديث الطلب بنجاح!',
        requestDeleted: 'تم حذف الطلب بنجاح!',
        referralProgram: 'الإحالة وكسب',
        referralCode: 'رمز الإحالة الخاص بك',
        referralCount: 'الإحالات',
        referralRewards: 'المكافآت',
        referralActivity: 'نشاط الإحالة',
        referralSteps: 'كيف يعمل:',
        referStep1: '1. شارك رمز الإحالة مع أصدقائك',
        referStep2: '2. يقومون بالتسجيل باستخدام رمزك',
        referStep3: '3. تربح مكافآت مقابل كل إحالة ناجحة',
        referStep4: '4. تضاف المكافآت إلى حسابك',
        copyReferralCode: 'نسخ رمز الإحالة',
        referralCopied: 'تم نسخ رمز الإحالة!',
        noReferrals: 'لا توجد إحالات بعد',
        totalReferrals: 'إجمالي الإحالات',
        totalRewards: 'إجمالي المكافآت',
        reward: 'مكافأة',
        rewards: 'مكافآت',
        earn: 'ربح',
        earnPerReferral: 'ربح لكل إحالة',
        referralLink: 'رابط الإحالة',
        referralLinkCopied: 'تم نسخ رابط الإحالة!',
        shareReferral: 'مشاركة الإحالة',
        inviteFriends: 'دعوة الأصدقاء',
        inviteNow: 'دعوة الآن',
        referAndEarn: 'أحل واربح',
        startEarning: 'ابدأ الربح',
        referralBonus: 'مكافأة الإحالة',
        referralBonusAmount: 'قيمة المكافأة',
        referralTerms: 'تطبق الشروط والأحكام',
        cookieConsent: 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك',
        cookieAccept: 'قبول الكل',
        cookieReject: 'رفض الكل',
        cookieSettings: 'إعدادات ملفات تعريف الارتباط',
        essentialCookies: 'ملفات تعريف الارتباط الأساسية',
        analyticsCookies: 'ملفات تعريف الارتباط التحليلية',
        marketingCookies: 'ملفات تعريف الارتباط التسويقية',
        cookiePreferences: 'تفضيلات ملفات تعريف الارتباط',
        savePreferences: 'حفظ التفضيلات',
        manageCookies: 'إدارة ملفات تعريف الارتباط'
    },
    fr: {
        welcome: 'Bienvenue sur ZI Store',
        search: 'Rechercher des produits...',
        addToCart: 'Ajouter au panier',
        buyNow: 'Acheter maintenant',
        free: 'GRATUIT',
        vip: 'VIP',
        total: 'Total',
        loading: 'Chargement...',
        noProducts: 'Aucun produit trouvé',
        signIn: 'Se connecter',
        signOut: 'Se déconnecter',
        profile: 'Profil',
        orders: 'Commandes',
        favorites: 'Favoris',
        cart: 'Panier',
        notifications: 'Notifications',
        adminPanel: 'Panneau d\'administration',
        support: 'Support',
        language: 'Langue',
        theme: 'Thème',
        confirm: 'Confirmer',
        cancel: 'Annuler',
        delete: 'Supprimer',
        edit: 'Modifier',
        save: 'Enregistrer',
        success: 'Succès',
        error: 'Erreur',
        warning: 'Avertissement',
        info: 'Information',
        featured: 'À la une',
        recommended: 'Recommandé pour vous',
        allProducts: 'Tous les produits',
        freeProducts: 'Produits gratuits',
        vipProducts: 'Produits VIP',
        price: 'Prix',
        originalPrice: 'Prix original',
        description: 'Description',
        features: 'Caractéristiques',
        duration: 'Durée',
        status: 'Statut',
        available: 'Disponible',
        unavailable: 'Indisponible',
        badge: 'Badge',
        currency: 'Devise',
        productType: 'Type de produit',
        standard: 'Standard',
        quantityBased: 'Basé sur la quantité',
        quantityOptions: 'Options de quantité',
        addOption: 'Ajouter une option',
        remove: 'Supprimer',
        order: 'Commande',
        totalOrders: 'Total des commandes',
        totalRevenue: 'Revenu total',
        netRevenue: 'Revenu net',
        pending: 'En attente',
        confirmed: 'Confirmé',
        rejected: 'Rejeté',
        completed: 'Terminé',
        viewDetails: 'Voir les détails',
        orderStatus: 'Statut de la commande',
        orderDate: 'Date de la commande',
        orderTotal: 'Total de la commande',
        orderItems: 'Articles de la commande',
        shippingAddress: 'Adresse de livraison',
        paymentMethod: 'Moyen de paiement',
        paymentStatus: 'Statut du paiement',
        transactionId: 'ID de transaction',
        walletAddress: 'Adresse du portefeuille',
        copyAddress: 'Copier l\'adresse',
        amountToPay: 'Montant à payer',
        payNow: 'Payer maintenant',
        cancelOrder: 'Annuler la commande',
        requestRefund: 'Demander un remboursement',
        refundPolicy: 'Politique de remboursement',
        privacyPolicy: 'Politique de confidentialité',
        termsOfService: 'Conditions d\'utilisation',
        aboutUs: 'À propos de nous',
        contactUs: 'Contactez-nous',
        supportHours: 'Heures de support: 24/7',
        replyWithin: 'Nous répondons dans les 24 heures',
        instagram: 'Instagram',
        tiktok: 'TikTok',
        facebook: 'Facebook',
        twitter: 'Twitter',
        youtube: 'YouTube',
        telegram: 'Telegram',
        whatsapp: 'WhatsApp',
        email: 'Email',
        phone: 'Téléphone',
        copyLink: 'Copier le lien',
        share: 'Partager',
        shareOn: 'Partager sur',
        copied: 'Copié!',
        verifyEmail: 'Vérifier l\'email',
        emailVerified: 'Email vérifié',
        emailNotVerified: 'Email non vérifié',
        resendVerification: 'Renvoyer l\'email de vérification',
        resetPassword: 'Réinitialiser le mot de passe',
        forgotPassword: 'Mot de passe oublié?',
        newPassword: 'Nouveau mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        passwordsDoNotMatch: 'Les mots de passe ne correspondent pas',
        passwordTooShort: 'Le mot de passe doit contenir au moins 6 caractères',
        login: 'Se connecter',
        register: 'S\'inscrire',
        fullName: 'Nom complet',
        country: 'Pays',
        referralCode: 'Code de parrainage',
        haveReferral: 'Avez-vous un code de parrainage?',
        agreeToTerms: 'J\'accepte les conditions générales',
        alreadyHaveAccount: 'Vous avez déjà un compte?',
        dontHaveAccount: 'Vous n\'avez pas de compte?',
        createAccount: 'Créer un compte',
        welcomeBack: 'Bon retour!',
        signInWithGoogle: 'Se connecter avec Google',
        or: 'Ou',
        logout: 'Se déconnecter',
        myAccount: 'Mon compte',
        myOrders: 'Mes commandes',
        myWishlist: 'Mes favoris',
        myCart: 'Mon panier',
        myNotifications: 'Mes notifications',
        myRequests: 'Mes demandes',
        myLicences: 'Mes licences',
        activateLicence: 'Activer la licence',
        enterLicenceCode: 'Entrez votre code de licence',
        activate: 'Activer',
        licenceActivated: 'Licence activée avec succès!',
        licenceInvalid: 'Code de licence invalide',
        licenceExpired: 'Licence expirée',
        licenceAlreadyUsed: 'Licence déjà utilisée',
        licenceRevoked: 'Licence révoquée',
        licencePending: 'Licence en attente',
        licenceActive: 'Licence active',
        licenceUsed: 'Licence utilisée',
        licenceExpired: 'Licence expirée',
        licenceRevoked: 'Licence révoquée',
        createLicence: 'Créer une licence',
        editLicence: 'Modifier la licence',
        deleteLicence: 'Supprimer la licence',
        productName: 'Nom du produit',
        userId: 'ID utilisateur',
        expiryDate: 'Date d\'expiration',
        status: 'Statut',
        code: 'Code',
        script: 'Script',
        noLicences: 'Aucune licence trouvée',
        noOrders: 'Aucune commande trouvée',
        noNotifications: 'Aucune notification',
        noFavorites: 'Aucun favori',
        noDownloads: 'Aucun téléchargement',
        noProductsFound: 'Aucun produit trouvé',
        noResults: 'Aucun résultat trouvé',
        searchResults: 'Résultats de recherche',
        showing: 'Affichage',
        of: 'de',
        results: 'résultats',
        loadMore: 'Charger plus',
        loadingMore: 'Chargement...',
        all: 'Tout',
        free: 'Gratuit',
        paid: 'Payant',
        featured: 'À la une',
        newest: 'Le plus récent',
        oldest: 'Le plus ancien',
        priceLowToHigh: 'Prix: Croissant',
        priceHighToLow: 'Prix: Décroissant',
        sortBy: 'Trier par',
        filter: 'Filtrer',
        clear: 'Effacer',
        apply: 'Appliquer',
        close: 'Fermer',
        back: 'Retour',
        next: 'Suivant',
        previous: 'Précédent',
        continue: 'Continuer',
        submit: 'Soumettre',
        send: 'Envoyer',
        receive: 'Recevoir',
        request: 'Demande',
        response: 'Réponse',
        approved: 'Approuvé',
        rejected: 'Rejeté',
        pending: 'En attente',
        inProgress: 'En cours',
        completed: 'Terminé',
        newRequest: 'Nouvelle demande',
        requestTitle: 'Titre de la demande',
        requestDescription: 'Description de la demande',
        requestBudget: 'Budget',
        requestCategory: 'Catégorie',
        requestPriority: 'Priorité',
        requestStatus: 'Statut',
        requestDate: 'Date',
        requestResponse: 'Réponse',
        gameName: 'Nom du jeu',
        playStoreLink: 'Lien Play Store',
        featuresNeeded: 'Fonctionnalités nécessaires',
        submitRequest: 'Soumettre la demande',
        myRequests: 'Mes demandes',
        noRequests: 'Aucune demande trouvée',
        requestSubmitted: 'Demande soumise avec succès!',
        requestUpdated: 'Demande mise à jour avec succès!',
        requestDeleted: 'Demande supprimée avec succès!',
        referralProgram: 'Parrainage et gains',
        referralCode: 'Votre code de parrainage',
        referralCount: 'Parrainages',
        referralRewards: 'Récompenses',
        referralActivity: 'Activité de parrainage',
        referralSteps: 'Comment ça fonctionne:',
        referStep1: '1. Partagez votre code de parrainage avec vos amis',
        referStep2: '2. Ils s\'inscrivent en utilisant votre code',
        referStep3: '3. Vous gagnez des récompenses pour chaque parrainage réussi',
        referStep4: '4. Les récompenses sont créditées sur votre compte',
        copyReferralCode: 'Copier le code de parrainage',
        referralCopied: 'Code de parrainage copié!',
        noReferrals: 'Aucun parrainage pour le moment',
        totalReferrals: 'Total des parrainages',
        totalRewards: 'Total des récompenses',
        reward: 'Récompense',
        rewards: 'Récompenses',
        earn: 'Gagner',
        earnPerReferral: 'Gagner par parrainage',
        referralLink: 'Lien de parrainage',
        referralLinkCopied: 'Lien de parrainage copié!',
        shareReferral: 'Partager le parrainage',
        inviteFriends: 'Inviter des amis',
        inviteNow: 'Inviter maintenant',
        referAndEarn: 'Parrainer et gagner',
        startEarning: 'Commencer à gagner',
        referralBonus: 'Bonus de parrainage',
        referralBonusAmount: 'Montant du bonus',
        referralTerms: 'Conditions générales applicables',
        cookieConsent: 'Nous utilisons des cookies pour améliorer votre expérience',
        cookieAccept: 'Accepter tout',
        cookieReject: 'Rejeter tout',
        cookieSettings: 'Paramètres des cookies',
        essentialCookies: 'Cookies essentiels',
        analyticsCookies: 'Cookies analytiques',
        marketingCookies: 'Cookies marketing',
        cookiePreferences: 'Préférences des cookies',
        savePreferences: 'Enregistrer les préférences',
        manageCookies: 'Gérer les cookies'
    }
};

function getTranslation(key) {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
}

function updateUILanguage() {
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.dataset.lang;
        const translation = getTranslation(key);
        if (translation) {
            if (el.tagName === 'INPUT' && el.placeholder !== undefined) {
                el.placeholder = translation;
            } else if (el.tagName === 'BUTTON' || el.tagName === 'A') {
                el.textContent = translation;
            } else {
                el.textContent = translation;
            }
        }
    });
    
    if (searchInput) searchInput.placeholder = getTranslation('search');
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const key = btn.dataset.filter;
        if (key === 'all') btn.textContent = getTranslation('all');
        else if (key === 'free') btn.textContent = '🎁 ' + getTranslation('free');
        else if (key === 'paid') btn.textContent = '👑 ' + getTranslation('vip');
    });
    
    console.log('✅ Language updated to:', currentLanguage);
}

// ============================================================
// THE TRICK: Intercept Firebase verification link
// ============================================================
(function interceptVerificationLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const oobCode = urlParams.get('oobCode');
    const apiKey = urlParams.get('apiKey');

    if (mode === 'verifyEmail' && oobCode) {
        localStorage.setItem('verifyMode', mode);
        localStorage.setItem('verifyOobCode', oobCode);
        if (apiKey) localStorage.setItem('verifyApiKey', apiKey);
        window.location.href = '/verify-email.html';
        return true;
    }
    
    if (mode === 'resetPassword' && oobCode) {
        localStorage.setItem('verifyMode', mode);
        localStorage.setItem('verifyOobCode', oobCode);
        if (apiKey) localStorage.setItem('verifyApiKey', apiKey);
        window.location.href = '/verify-email.html';
        return true;
    }

    if (mode === 'recoverEmail' && oobCode) {
        localStorage.setItem('verifyMode', mode);
        localStorage.setItem('verifyOobCode', oobCode);
        if (apiKey) localStorage.setItem('verifyApiKey', apiKey);
        window.location.href = '/verify-email.html';
        return true;
    }

    if (!mode) {
        localStorage.removeItem('verifyMode');
        localStorage.removeItem('verifyOobCode');
        localStorage.removeItem('verifyApiKey');
    }

    return false;
})();

// ============================================================
// OPEN PRODUCT DETAILS PAGE
// ============================================================
window.openProductPage = function(productId) {
    if (!productId) {
        showToast('❌ Product ID is required', 'error');
        return;
    }
    
    const productRef = doc(db, 'products', productId);
    getDoc(productRef)
        .then((docSnap) => {
            if (docSnap.exists()) {
                window.location.href = `product.html?id=${productId}`;
            } else {
                showToast('❌ Product not found', 'error');
            }
        })
        .catch((error) => {
            console.error('Error checking product:', error);
            window.location.href = `product.html?id=${productId}`;
        });
};

// ============================================================
// PRODUCT FUNCTIONS
// ============================================================
async function loadProducts() {
    try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        allProducts = [];
        querySnapshot.forEach((doc) => {
            allProducts.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        filteredProducts = [...allProducts];
        displayProducts(filteredProducts);
        updateStats();
        updateRecommendations();
        updateSlider();
        
        console.log(`✅ Loaded ${allProducts.length} products`);
        return allProducts;
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('❌ Error loading products', 'error');
        return [];
    }
}

function listenToProducts() {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'));
    
    onSnapshot(q, (querySnapshot) => {
        allProducts = [];
        querySnapshot.forEach((doc) => {
            allProducts.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        applyFilters();
        updateStats();
        updateRecommendations();
        updateSlider();
        console.log(`✅ Real-time update: ${allProducts.length} products`);
    }, (error) => {
        console.error('Error listening to products:', error);
    });
}

function displayProducts(products) {
    if (!productList) return;
    
    if (!products || products.length === 0) {
        productList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <p>${getTranslation('noProducts')}</p>
            </div>
        `;
        return;
    }
    
    productList.innerHTML = products.map(product => {
        const isFree = product.price === 0 || !product.price || product.price === '0';
        const isVip = product.badge === 'VIP' || product.badge === 'PRO';
        const priceDisplay = isFree ? getTranslation('free') : `${product.currency || '$'}${Number(product.price).toFixed(2)}`;
        const originalPriceDisplay = product.originalPrice ? `${product.currency || '$'}${Number(product.originalPrice).toFixed(2)}` : '';
        const badgeClass = isVip ? 'vip' : (isFree ? 'free' : '');
        const badgeText = product.badge || (isFree ? getTranslation('free') : '');
        
        return `
            <div class="product-card" onclick="openProductPage('${product.id}')">
                <div class="product-image-wrapper">
                    <img src="${product.image || 'https://via.placeholder.com/300x200/1a1a3e/6c5ce7?text=No+Image'}" 
                         alt="${product.name}" 
                         class="product-image"
                         loading="lazy"
                         onerror="this.src='https://via.placeholder.com/300x200/1a1a3e/6c5ce7?text=No+Image'" />
                    ${product.badges && product.badges.length > 0 ? `
                        <div class="product-badges">
                            ${product.badges.map(b => `<span class="mini-badge mb-${b}">${b}</span>`).join('')}
                        </div>
                    ` : ''}
                    ${badgeText ? `<span class="product-badge ${badgeClass}">${badgeText}</span>` : ''}
                    ${product.isFeatured ? `<span class="featured-badge"><i class="fas fa-star"></i></span>` : ''}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-description">${product.description ? product.description.substring(0, 60) + (product.description.length > 60 ? '...' : '') : ''}</p>
                    <div class="product-price-row">
                        <span class="product-price">${priceDisplay}</span>
                        ${originalPriceDisplay ? `<span class="product-original-price">${originalPriceDisplay}</span>` : ''}
                    </div>
                    <div class="product-actions-row">
                        <button class="view-details-btn" onclick="event.stopPropagation(); openProductPage('${product.id}')">
                            <i class="fas fa-eye"></i> ${getTranslation('viewDetails')}
                        </button>
                        <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${product.id}')">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                        <button class="wishlist-btn" onclick="event.stopPropagation(); toggleWishlist('${product.id}')">
                            <i class="fas fa-heart ${wishlist.includes(product.id) ? 'liked' : ''}"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function applyFilters() {
    let filtered = [...allProducts];
    
    if (currentFilter === 'free') {
        filtered = filtered.filter(p => p.price === 0 || !p.price || p.price === '0');
    } else if (currentFilter === 'paid') {
        filtered = filtered.filter(p => p.price > 0 && p.price !== '0');
    } else if (currentFilter === 'vip') {
        filtered = filtered.filter(p => p.badge === 'VIP' || p.badge === 'PRO');
    } else if (currentFilter === 'featured') {
        filtered = filtered.filter(p => p.isFeatured === true);
    }
    
    if (searchQuery && searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query)) ||
            (p.features && p.features.some(f => f.toLowerCase().includes(query)))
        );
    }
    
    if (sortBy === 'newest') {
        filtered.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    } else if (sortBy === 'oldest') {
        filtered.sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0));
    } else if (sortBy === 'priceLow') {
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'priceHigh') {
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    
    filteredProducts = filtered;
    displayProducts(filteredProducts);
}

function filterProducts(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    applyFilters();
}

function searchProducts(query) {
    searchQuery = query || '';
    applyFilters();
}

function clearSearch() {
    if (searchInput) {
        searchInput.value = '';
        searchQuery = '';
        applyFilters();
        const clearBtn = document.getElementById('searchClear');
        if (clearBtn) clearBtn.classList.remove('visible');
    }
}

function updateStats() {
    if (totalScripts) totalScripts.textContent = allProducts.length;
    if (freeScripts) freeScripts.textContent = allProducts.filter(p => p.price === 0 || !p.price || p.price === '0').length;
    if (vipScripts) vipScripts.textContent = allProducts.filter(p => p.badge === 'VIP' || p.badge === 'PRO').length;
    if (wishlistStats) wishlistStats.textContent = wishlist.length;
}

function updateRecommendations() {
    if (!recommendationsGrid) return;
    
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    const recommendations = shuffled.slice(0, 6);
    
    if (recommendations.length === 0) {
        recommendationsGrid.innerHTML = `<p style="color:rgba(255,255,255,0.3);text-align:center;grid-column:1/-1;">${getTranslation('noProducts')}</p>`;
        return;
    }
    
    recommendationsGrid.innerHTML = recommendations.map(product => {
        const isFree = product.price === 0 || !product.price || product.price === '0';
        const priceDisplay = isFree ? getTranslation('free') : `${product.currency || '$'}${Number(product.price).toFixed(2)}`;
        
        return `
            <div class="rec-product" onclick="openProductPage('${product.id}')">
                <img src="${product.image || 'https://via.placeholder.com/150x150/1a1a3e/6c5ce7?text=No+Image'}" 
                     alt="${product.name}"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/150x150/1a1a3e/6c5ce7?text=No+Image'" />
                <h4>${product.name}</h4>
                <span class="rec-price">${priceDisplay}</span>
            </div>
        `;
    }).join('');
}

// ============================================================
// SLIDER FUNCTIONS
// ============================================================
async function loadSlides() {
    try {
        const slidesRef = collection(db, 'slides');
        const q = query(slidesRef, orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);
        
        slides = [];
        querySnapshot.forEach((doc) => {
            slides.push({ id: doc.id, ...doc.data() });
        });
        
        updateSlider();
        return slides;
    } catch (error) {
        console.error('Error loading slides:', error);
        return [];
    }
}

function updateSlider() {
    if (!sliderWrapper || !sliderDots) return;
    
    const enabled = localStorage.getItem('sliderEnabled') !== 'false';
    if (!enabled || slides.length === 0) {
        sliderWrapper.style.display = 'none';
        sliderDots.style.display = 'none';
        return;
    }
    
    sliderWrapper.style.display = 'block';
    sliderDots.style.display = 'flex';
    
    sliderWrapper.innerHTML = slides.map((slide, index) => `
        <div class="slide-item ${index === 0 ? 'active' : ''}" style="background-image: url('${slide.image || 'https://via.placeholder.com/1200x400/1a1a3e/6c5ce7?text=Slide'}');">
            <div class="slide-overlay">
                ${slide.title ? `<div class="slide-title">${slide.title}</div>` : ''}
                ${slide.subtitle ? `<div class="slide-subtitle">${slide.subtitle}</div>` : ''}
                ${slide.buttonText && slide.buttonUrl ? `<a href="${slide.buttonUrl}" class="slide-btn">${slide.buttonText}</a>` : ''}
            </div>
        </div>
    `).join('');
    
    sliderDots.innerHTML = slides.map((_, index) => `
        <span class="dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></span>
    `).join('');
    
    startSliderAuto();
}

function startSliderAuto() {
    clearInterval(sliderInterval);
    const interval = parseInt(localStorage.getItem('sliderInterval')) || 3;
    sliderInterval = setInterval(() => {
        nextSlide();
    }, interval * 1000);
}

function nextSlide() {
    const total = slides.length;
    if (total === 0) return;
    currentSlideIndex = (currentSlideIndex + 1) % total;
    goToSlide(currentSlideIndex);
}

function prevSlide() {
    const total = slides.length;
    if (total === 0) return;
    currentSlideIndex = (currentSlideIndex - 1 + total) % total;
    goToSlide(currentSlideIndex);
}

function goToSlide(index) {
    const items = sliderWrapper.querySelectorAll('.slide-item');
    const dots = sliderDots.querySelectorAll('.dot');
    
    items.forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
    
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
    
    currentSlideIndex = index;
}

function toggleSliderEnabled() {
    const checked = document.getElementById('sliderEnabled')?.checked;
    localStorage.setItem('sliderEnabled', checked ? 'true' : 'false');
    updateSlider();
    const label = document.getElementById('sliderStatusLabel');
    if (label) {
        label.textContent = checked ? 'Enabled' : 'Disabled';
        label.className = 'toggle-status ' + (checked ? 'enabled' : 'disabled');
    }
}

function saveSliderInterval() {
    const input = document.getElementById('sliderIntervalInput');
    if (input) {
        const value = parseInt(input.value);
        if (value >= 1 && value <= 60) {
            localStorage.setItem('sliderInterval', value);
            startSliderAuto();
            showToast('✅ Slider interval saved!', 'success');
        } else {
            showToast('⚠️ Please enter a value between 1 and 60', 'warning');
        }
    }
}

// ============================================================
// CART FUNCTIONS
// ============================================================
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        showToast('❌ Product not found', 'error');
        return;
    }
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price || 0,
            currency: product.currency || '$',
            image: product.image,
            quantity: 1,
            badge: product.badge,
            productType: product.productType || 'standard'
        });
    }
    
    updateCartUI();
    showToast(`✅ Added "${product.name}" to cart`, 'success');
    saveCartToFirestore();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
    saveCartToFirestore();
    showToast('🗑️ Removed from cart', 'warning');
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (cartBadge) cartBadge.textContent = totalItems;
    if (bottomCartCount) bottomCartCount.textContent = totalItems;
    if (bottomCartTotal) bottomCartTotal.textContent = `${cart[0]?.currency || '$'}${totalPrice.toFixed(2)}`;
    
    const bottomCart = document.getElementById('bottomCartBar');
    if (bottomCart) {
        bottomCart.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    if (document.getElementById('cartFullContent')) {
        renderCartFull();
    }
}

function clearCart() {
    cart = [];
    updateCartUI();
    saveCartToFirestore();
    showToast('🗑️ Cart cleared', 'warning');
}

function renderCartFull() {
    const container = document.getElementById('cartFullContent');
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart" style="text-align:center;padding:40px 20px;">
                <i class="fas fa-shopping-cart" style="font-size:48px;color:rgba(255,255,255,0.1);margin-bottom:16px;"></i>
                <p style="color:rgba(255,255,255,0.3);">${getTranslation('noProducts')}</p>
                <a href="index.html" class="btn btn-primary" style="margin-top:12px;display:inline-block;padding:10px 24px;border-radius:8px;background:linear-gradient(135deg,#6c5ce7,#a29bfe);color:#fff;text-decoration:none;">${getTranslation('browseProducts') || 'Browse Products'}</a>
            </div>
        `;
        return;
    }
    
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const currency = cart[0]?.currency || '$';
    
    container.innerHTML = `
        <div class="cart-items">
            ${cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image || 'https://via.placeholder.com/60x60/1a1a3e/6c5ce7?text=No+Image'}" alt="${item.name}" />
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <div class="cart-item-price">${currency}${(item.price * item.quantity).toFixed(2)}</div>
                        <div class="cart-item-actions">
                            <button onclick="updateCartQuantity('${item.id}', -1)"><i class="fas fa-minus"></i></button>
                            <span>${item.quantity}</span>
                            <button onclick="updateCartQuantity('${item.id}', 1)"><i class="fas fa-plus"></i></button>
                            <button onclick="removeFromCart('${item.id}')" class="remove-btn"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="cart-summary">
            <div class="cart-total">
                <span>${getTranslation('total')}:</span>
                <span>${currency}${totalPrice.toFixed(2)}</span>
            </div>
            <button class="checkout-btn" onclick="checkout()">
                <i class="fas fa-credit-card"></i> ${getTranslation('checkout') || 'Checkout'}
            </button>
            <button class="clear-cart-btn" onclick="clearCart()">
                <i class="fas fa-trash"></i> ${getTranslation('clear') || 'Clear'}
            </button>
        </div>
    `;
}

function updateCartQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    
    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        updateCartUI();
        saveCartToFirestore();
    }
}

// ============================================================
// WISHLIST FUNCTIONS
// ============================================================
function toggleWishlist(productId) {
    const index = wishlist.indexOf(productId);
    if (index > -1) {
        wishlist.splice(index, 1);
        showToast('💔 Removed from favorites', 'warning');
    } else {
        wishlist.push(productId);
        showToast('❤️ Added to favorites', 'success');
    }
    updateWishlistUI();
    saveWishlistToFirestore();
}

function updateWishlistUI() {
    if (wishlistBadge) wishlistBadge.textContent = wishlist.length;
    if (document.getElementById('fullWishlistBadge')) {
        document.getElementById('fullWishlistBadge').textContent = wishlist.length;
    }
    if (wishlistStats) wishlistStats.textContent = wishlist.length;
}

function renderWishlistFull() {
    const container = document.getElementById('wishlistFullContent');
    if (!container) return;
    
    if (wishlist.length === 0) {
        container.innerHTML = `
            <div class="empty-wishlist" style="text-align:center;padding:40px 20px;">
                <i class="fas fa-heart" style="font-size:48px;color:rgba(255,255,255,0.1);margin-bottom:16px;"></i>
                <p style="color:rgba(255,255,255,0.3);">${getTranslation('noFavorites')}</p>
            </div>
        `;
        return;
    }
    
    const wishlistProducts = allProducts.filter(p => wishlist.includes(p.id));
    
    container.innerHTML = `
        <div class="wishlist-grid">
            ${wishlistProducts.map(product => `
                <div class="wishlist-item" onclick="openProductPage('${product.id}')" style="cursor:pointer;">
                    <img src="${product.image || 'https://via.placeholder.com/100x100/1a1a3e/6c5ce7?text=No+Image'}" alt="${product.name}" />
                    <div class="wishlist-item-info">
                        <h4>${product.name}</h4>
                        <span class="wishlist-price">${product.price === 0 ? getTranslation('free') : `${product.currency || '$'}${product.price.toFixed(2)}`}</span>
                        <button onclick="event.stopPropagation(); addToCart('${product.id}')" class="add-to-cart-btn">
                            <i class="fas fa-cart-plus"></i> ${getTranslation('addToCart')}
                        </button>
                        <button onclick="event.stopPropagation(); toggleWishlist('${product.id}')" class="remove-wishlist-btn">
                            <i class="fas fa-times"></i> ${getTranslation('remove')}
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ============================================================
// CART & WISHLIST FIRESTORE SYNC
// ============================================================
async function saveCartToFirestore() {
    if (!currentUser) return;
    try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
            cart: cart,
            cartUpdatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error saving cart:', error);
    }
}

async function saveWishlistToFirestore() {
    if (!currentUser) return;
    try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
            wishlist: wishlist,
            wishlistUpdatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error saving wishlist:', error);
    }
}

async function loadUserData() {
    if (!currentUser) return;
    try {
        const userRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.cart) cart = data.cart;
            if (data.wishlist) wishlist = data.wishlist;
            if (data.notifications) notifications = data.notifications;
            if (data.referralCode) referralData.code = data.referralCode;
            if (data.referralCount) referralData.count = data.referralCount;
            if (data.referralRewards) referralData.rewards = data.referralRewards;
            
            updateCartUI();
            updateWishlistUI();
            updateNotificationsUI();
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// ============================================================
// NOTIFICATIONS
// ============================================================
function updateNotificationsUI() {
    const unreadCount = notifications.filter(n => !n.read).length;
    if (notifBadge) notifBadge.textContent = unreadCount;
    if (document.getElementById('fullNotifBadge')) {
        document.getElementById('fullNotifBadge').textContent = unreadCount;
    }
}

function renderNotifications() {
    const container = document.getElementById('notificationsList');
    if (!container) return;
    
    if (notifications.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:30px 20px;color:rgba(255,255,255,0.3);">
                <i class="fas fa-bell" style="font-size:32px;margin-bottom:12px;display:block;"></i>
                ${getTranslation('noNotifications')}
            </div>
        `;
        return;
    }
    
    container.innerHTML = notifications.map(notif => `
        <div class="notification-item ${notif.read ? 'read' : 'unread'}" onclick="markNotificationRead('${notif.id}')">
            <div class="notification-icon">${notif.icon || '📢'}</div>
            <div class="notification-content">
                <div class="notification-title">${notif.title}</div>
                <div class="notification-message">${notif.message}</div>
                <div class="notification-time">${new Date(notif.timestamp).toLocaleDateString()}</div>
            </div>
            ${!notif.read ? '<span class="notification-dot"></span>' : ''}
        </div>
    `).join('');
}

function markNotificationRead(notifId) {
    const notif = notifications.find(n => n.id === notifId);
    if (notif) {
        notif.read = true;
        updateNotificationsUI();
        renderNotifications();
        saveNotificationsToFirestore();
    }
}

function markAllNotificationsRead() {
    notifications.forEach(n => n.read = true);
    updateNotificationsUI();
    renderNotifications();
    saveNotificationsToFirestore();
}

function clearAllNotifications() {
    notifications = [];
    updateNotificationsUI();
    renderNotifications();
    saveNotificationsToFirestore();
}

async function saveNotificationsToFirestore() {
    if (!currentUser) return;
    try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
            notifications: notifications
        });
    } catch (error) {
        console.error('Error saving notifications:', error);
    }
}

// ============================================================
// CHECKOUT
// ============================================================
function checkout() {
    if (!currentUser) {
        showToast('🔑 ' + getTranslation('loginRequired'), 'error');
        return;
    }
    
    if (cart.length === 0) {
        showToast('🛒 ' + getTranslation('noProducts'), 'warning');
        return;
    }
    
    openPaymentModal();
}

function openPaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (!modal) return;
    
    document.getElementById('paymentStep1').style.display = 'block';
    document.getElementById('paymentStep2').style.display = 'none';
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('payableTotal').textContent = `${cart[0]?.currency || '$'}${total.toFixed(2)}`;
    
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function selectPayment(method) {
    document.querySelectorAll('.payment-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    const option = document.getElementById('option' + method.charAt(0).toUpperCase() + method.slice(1));
    if (option) option.classList.add('selected');
    selectedPaymentMethod = method;
}

function continuePayment() {
    if (!selectedPaymentMethod) {
        showToast('⚠️ ' + getTranslation('selectPaymentMethod') || 'Please select a payment method', 'warning');
        return;
    }
    
    document.getElementById('paymentStep1').style.display = 'none';
    document.getElementById('paymentStep2').style.display = 'block';
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('step2Subtotal').textContent = `${cart[0]?.currency || '$'}${total.toFixed(2)}`;
    document.getElementById('step2Total').textContent = `${cart[0]?.currency || '$'}${total.toFixed(2)}`;
    
    const methodNames = {
        litecoin: 'Litecoin',
        usdt: 'USDT (ERC20)',
        telegram: 'Telegram',
        binance: 'Binance (USDT)'
    };
    document.getElementById('paymentMethodName').textContent = methodNames[selectedPaymentMethod] || 'Unknown';
    
    const productsList = document.getElementById('paymentProductsList');
    productsList.innerHTML = cart.map(item => `
        <div class="payment-product">
            <span>${item.name} x${item.quantity}</span>
            <span>${item.currency || '$'}${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');
}

function goToStep1() {
    document.getElementById('paymentStep1').style.display = 'block';
    document.getElementById('paymentStep2').style.display = 'none';
}

function placeOrder() {
    showToast('✅ ' + getTranslation('orderPlaced') || 'Order placed successfully!', 'success');
    cart = [];
    updateCartUI();
    saveCartToFirestore();
    closePaymentModal();
}

function copyWalletAddress() {
    const address = document.getElementById('walletAddressDisplay');
    if (address) {
        navigator.clipboard.writeText(address.textContent).then(() => {
            showToast('📋 ' + getTranslation('copied'), 'success');
        });
    }
}

// ============================================================
// USER AUTHENTICATION
// ============================================================
function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    
    signInWithPopup(auth, provider)
        .then((result) => {
            currentUser = result.user;
            updateUserUI();
            loadUserData();
            showToast('✅ ' + getTranslation('signInWithGoogle') + ' ' + getTranslation('success'), 'success');
            logEvent(analytics, 'login', { method: 'google' });
        })
        .catch((error) => {
            console.error('Google login error:', error);
            showToast('❌ ' + error.message, 'error');
        });
}

function logoutUser() {
    signOut(auth)
        .then(() => {
            currentUser = null;
            updateUserUI();
            showToast('👋 ' + getTranslation('logout'), 'warning');
            logEvent(analytics, 'logout');
        })
        .catch((error) => {
            console.error('Logout error:', error);
            showToast('❌ ' + error.message, 'error');
        });
}

function updateUserUI() {
    if (userAvatarText) {
        if (currentUser) {
            const name = currentUser.displayName || currentUser.email || 'User';
            userAvatarText.textContent = name.charAt(0).toUpperCase();
            userAvatarText.style.background = 'linear-gradient(135deg, #34d399, #6c5ce7)';
            if (userDot) userDot.className = 'user-dot';
        } else {
            userAvatarText.textContent = 'U';
            userAvatarText.style.background = 'linear-gradient(135deg, #6c5ce7, #a29bfe)';
            if (userDot) userDot.className = 'user-dot guest';
        }
    }
    
    const fullName = document.getElementById('fullName');
    const fullEmail = document.getElementById('fullEmail');
    const fullAvatar = document.getElementById('fullAvatar');
    const fullRp = document.getElementById('fullRp');
    
    if (fullName) {
        fullName.textContent = currentUser ? (currentUser.displayName || currentUser.email || 'User') : 'Guest';
    }
    if (fullEmail) {
        fullEmail.textContent = currentUser ? currentUser.email : 'Not logged in';
    }
    if (fullAvatar) {
        fullAvatar.textContent = currentUser ? (currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase() : 'U';
    }
    if (fullRp) {
        fullRp.textContent = '0';
    }
    
    const adminMenuItem = document.getElementById('adminMenuItem');
    if (adminMenuItem) {
        const isAdminUser = currentUser && (currentUser.email === 'lasmirlmail@gmail.com' || currentUser.email === 'lasmirmita@gmail.com' || currentUser.email === 'zribiidriss3@gmail.com');
        adminMenuItem.style.display = isAdminUser ? 'flex' : 'none';
        if (isAdminUser) {
            isAdmin = true;
        }
    }
}

// ============================================================
// AUTH STATE MONITOR
// ============================================================
onAuthStateChanged(auth, (user) => {
    const authSection = document.getElementById('authSection');
    const mainApp = document.getElementById('mainApp');
    
    if (user) {
        currentUser = user;
        if (mainApp) mainApp.style.display = 'block';
        if (authSection) authSection.style.display = 'none';
        updateUserUI();
        loadUserData();
        checkEmailVerification();
        logEvent(analytics, 'user_engagement', { user_id: user.uid });
        setUserProperties(analytics, {
            email: user.email,
            signup_time: user.metadata.creationTime
        });
    } else {
        currentUser = null;
        if (mainApp) mainApp.style.display = 'block';
        if (authSection) authSection.style.display = 'none';
        updateUserUI();
        cart = [];
        wishlist = [];
        updateCartUI();
        updateWishlistUI();
    }
});

function checkEmailVerification() {
    if (!currentUser) return;
    
    const banner = document.getElementById('emailVerificationBanner');
    if (!banner) return;
    
    if (!currentUser.emailVerified) {
        banner.style.display = 'block';
        banner.innerHTML = `
            <div class="banner-content">
                <span class="banner-icon"><i class="fas fa-envelope"></i></span>
                <div class="banner-text">
                    <strong>${getTranslation('verifyEmail')}</strong>
                    <span class="email">(${currentUser.email})</span>
                    <span>to access all features</span>
                </div>
                <button class="banner-action" onclick="resendVerificationEmail()">${getTranslation('resendVerification')}</button>
                <button class="banner-close" onclick="this.closest('.email-verification-banner').style.display='none'">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    } else {
        banner.style.display = 'none';
    }
}

function resendVerificationEmail() {
    if (!currentUser) return;
    sendEmailVerification(currentUser)
        .then(() => {
            showToast('📧 ' + getTranslation('resendVerification') + ' ' + getTranslation('success'), 'success');
        })
        .catch((error) => {
            console.error('Error sending verification:', error);
            showToast('❌ ' + error.message, 'error');
        });
}

function openForgotPassword() {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) modal.classList.add('open');
}

function sendForgotPassword() {
    const email = document.getElementById('forgotEmail')?.value;
    if (!email) {
        showToast('⚠️ ' + getTranslation('pleaseEnterEmail') || 'Please enter your email', 'warning');
        return;
    }
    
    sendPasswordResetEmail(auth, email)
        .then(() => {
            showToast('📧 ' + getTranslation('resetPassword') + ' ' + getTranslation('success'), 'success');
            document.getElementById('forgotPasswordModal')?.classList.remove('open');
        })
        .catch((error) => {
            console.error('Error sending reset:', error);
            showToast('❌ ' + error.message, 'error');
        });
}

// ============================================================
// ADMIN FUNCTIONS
// ============================================================
function openAdminPanel() {
    if (!isAdmin) {
        showToast('❌ ' + getTranslation('adminRequired'), 'error');
        return;
    }
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.classList.add('open');
        document.body.style.overflow = 'hidden';
        loadAdminData();
    }
}

function closeAdminPanel() {
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function switchAdminTab(tab) {
    document.querySelectorAll('.admin-panel .tab-content').forEach(el => {
        el.classList.remove('active');
    });
    document.querySelectorAll('.admin-panel .tabs button').forEach(el => {
        el.classList.remove('active');
    });
    
    const tabContent = document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1));
    if (tabContent) tabContent.classList.add('active');
    
    document.querySelectorAll('.admin-panel .tabs button').forEach(btn => {
        if (btn.textContent.includes(tab) || btn.textContent.toLowerCase().includes(tab)) {
            btn.classList.add('active');
        }
    });
    
    switch(tab) {
        case 'orders': loadAdminOrders(); break;
        case 'products': loadAdminProducts(); break;
        case 'users': loadAdminUsers(); break;
        case 'downloads': loadAdminDownloads(); break;
        case 'notifications': loadAdminNotifications(); break;
        case 'slider': loadAdminSlides(); break;
        case 'licences': loadAdminLicences(); break;
        case 'payments': loadPaymentRequests(); break;
        case 'stats': refreshAdvancedStats(); break;
        case 'logs': loadAuditLogs(); break;
        case 'marquee': loadMarqueeSettings(); break;
        case 'dashboard': refreshDashboardStats(); break;
    }
}

async function loadAdminData() {
    await Promise.all([
        loadAdminOrders(),
        loadAdminProducts(),
        loadAdminUsers(),
        loadAdminDownloads(),
        loadAdminNotifications(),
        loadAdminSlides(),
        loadAdminLicences(),
        loadPaymentRequests(),
        refreshDashboardStats(),
        loadAuditLogs()
    ]);
}

// ============================================================
// ADMIN ORDERS
// ============================================================
async function loadAdminOrders() {
    const body = document.getElementById('adminOrdersBody');
    if (!body) return;
    
    try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        orders = [];
        querySnapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        
        const total = orders.length;
        const pending = orders.filter(o => o.status === 'pending').length;
        const confirmed = orders.filter(o => o.status === 'confirmed' || o.status === 'completed').length;
        const rejected = orders.filter(o => o.status === 'rejected').length;
        
        document.getElementById('adminTotalOrders').textContent = total;
        document.getElementById('adminPendingOrders').textContent = pending;
        document.getElementById('adminConfirmedOrders').textContent = confirmed;
        document.getElementById('adminRejectedOrders').textContent = rejected;
        
        if (orders.length === 0) {
            body.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);">${getTranslation('noOrders')}</td></tr>`;
            return;
        }
        
        body.innerHTML = orders.map(order => `
            <tr>
                <td>#${order.id.substring(0, 8)}</td>
                <td>${order.userEmail || 'N/A'}</td>
                <td>${order.items?.length || 0} items</td>
                <td>${order.currency || '$'}${order.total?.toFixed(2) || '0.00'}</td>
                <td>${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td><span class="status-badge ${order.status || 'pending'}">${order.status || 'pending'}</span></td>
                <td>
                    <button class="admin-btn-small confirm-btn" onclick="updateOrderStatus('${order.id}', 'confirmed')"><i class="fas fa-check"></i></button>
                    <button class="admin-btn-small reject-btn" onclick="updateOrderStatus('${order.id}', 'rejected')"><i class="fas fa-times"></i></button>
                    <button class="admin-btn-small view-btn" onclick="viewOrderDetails('${order.id}')"><i class="fas fa-eye"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
        body.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);">${getTranslation('error')}</td></tr>`;
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
            status: status,
            updatedAt: serverTimestamp()
        });
        showToast(`✅ ${getTranslation('order')} ${status}`, 'success');
        loadAdminOrders();
        logEvent(analytics, 'order_status_updated', { orderId, status });
    } catch (error) {
        console.error('Error updating order:', error);
        showToast('❌ ' + error.message, 'error');
    }
}

function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        showToast('❌ ' + getTranslation('orderNotFound') || 'Order not found', 'error');
        return;
    }
    
    const modal = document.getElementById('orderDetailsModal');
    if (!modal) return;
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="this.closest('.modal-overlay').classList.remove('open')"><i class="fas fa-times"></i></button>
            <div class="modal-title"><i class="fas fa-file-invoice"></i> ${getTranslation('orderDetails') || 'Order Details'}</div>
            <div style="margin-bottom:12px;">
                <div><strong>${getTranslation('order')}:</strong> #${order.id.substring(0, 8)}</div>
                <div><strong>${getTranslation('orderDate')}:</strong> ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</div>
                <div><strong>${getTranslation('orderStatus')}:</strong> <span class="status-badge ${order.status}">${order.status}</span></div>
                <div><strong>${getTranslation('orderTotal')}:</strong> ${order.currency || '$'}${order.total?.toFixed(2) || '0.00'}</div>
                <div><strong>${getTranslation('paymentMethod')}:</strong> ${order.paymentMethod || 'N/A'}</div>
                <div><strong>${getTranslation('paymentStatus')}:</strong> ${order.paymentStatus || 'N/A'}</div>
            </div>
            <div style="border-top:1px solid var(--border);padding-top:12px;">
                <h4>${getTranslation('orderItems')}</h4>
                ${order.items?.map(item => `
                    <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                        <span>${item.name} x${item.quantity}</span>
                        <span>${item.currency || '$'}${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('') || '<p>' + getTranslation('noItems') || 'No items' + '</p>'}
            </div>
            <div style="margin-top:12px;display:flex;gap:8px;">
                <button class="admin-btn-small confirm-btn" onclick="updateOrderStatus('${order.id}','completed')"><i class="fas fa-check"></i> ${getTranslation('complete') || 'Complete'}</button>
                <button class="admin-btn-small reject-btn" onclick="updateOrderStatus('${order.id}','rejected')"><i class="fas fa-times"></i> ${getTranslation('reject') || 'Reject'}</button>
            </div>
        </div>
    `;
    modal.classList.add('open');
}

function refreshAdminOrders() {
    loadAdminOrders();
}

function searchAdminOrders() {
    const query = document.getElementById('adminSearchInput')?.value?.toLowerCase() || '';
    const filtered = orders.filter(o => 
        o.id.toLowerCase().includes(query) ||
        (o.userEmail && o.userEmail.toLowerCase().includes(query)) ||
        (o.status && o.status.toLowerCase().includes(query))
    );
    const body = document.getElementById('adminOrdersBody');
    if (!body) return;
    
    if (filtered.length === 0) {
        body.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);">${getTranslation('noResults')}</td></tr>`;
        return;
    }
    
    body.innerHTML = filtered.map(order => `
        <tr>
            <td>#${order.id.substring(0, 8)}</td>
            <td>${order.userEmail || 'N/A'}</td>
            <td>${order.items?.length || 0} items</td>
            <td>${order.currency || '$'}${order.total?.toFixed(2) || '0.00'}</td>
            <td>${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
            <td><span class="status-badge ${order.status || 'pending'}">${order.status || 'pending'}</span></td>
            <td>
                <button class="admin-btn-small confirm-btn" onclick="updateOrderStatus('${order.id}', 'confirmed')"><i class="fas fa-check"></i></button>
                <button class="admin-btn-small reject-btn" onclick="updateOrderStatus('${order.id}', 'rejected')"><i class="fas fa-times"></i></button>
                <button class="admin-btn-small view-btn" onclick="viewOrderDetails('${order.id}')"><i class="fas fa-eye"></i></button>
            </td>
        </tr>
    `).join('');
}

function clearAdminSearch() {
    document.getElementById('adminSearchInput').value = '';
    loadAdminOrders();
}

function exportOrders() {
    if (orders.length === 0) {
        showToast('⚠️ ' + getTranslation('noOrders'), 'warning');
        return;
    }
    
    let csv = 'Order ID,User Email,Items,Total,Date,Status\n';
    orders.forEach(order => {
        csv += `${order.id.substring(0, 8)},${order.userEmail || 'N/A'},${order.items?.length || 0},${order.total || 0},${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'},${order.status || 'pending'}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📊 ' + getTranslation('exported') || 'Exported successfully!', 'success');
}

// ============================================================
// ADMIN PRODUCTS
// ============================================================
async function loadAdminProducts() {
    const container = document.getElementById('adminProductsList');
    if (!container) return;
    
    try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        let products = [];
        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });
        
        if (products.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);">${getTranslation('noProducts')}</div>`;
            return;
        }
        
        container.innerHTML = products.map(product => `
            <div class="admin-product-item">
                <img src="${product.image || 'https://via.placeholder.com/50x50/1a1a3e/6c5ce7?text=No+Image'}" 
                     alt="${product.name}" 
                     style="width:50px;height:50px;border-radius:6px;object-fit:cover;" />
                <div style="flex:1;">
                    <div style="font-weight:600;">${product.name}</div>
                    <div style="font-size:12px;color:rgba(255,255,255,0.5);">
                        ${product.price === 0 ? getTranslation('free') : `${product.currency || '$'}${product.price?.toFixed(2)}`} 
                        ${product.badge ? `· ${product.badge}` : ''}
                        ${product.status ? `· ${product.status}` : ''}
                    </div>
                </div>
                <div style="display:flex;gap:6px;">
                    <button class="admin-btn-small edit-btn" onclick="editProduct('${product.id}')"><i class="fas fa-edit"></i></button>
                    <button class="admin-btn-small delete-btn" onclick="deleteProduct('${product.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading admin products:', error);
        container.innerHTML = `<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);">${getTranslation('error')}</div>`;
    }
}

function openAddProductModal() {
    const modal = document.getElementById('productModal');
    if (!modal) return;
    
    document.getElementById('productFormTitle').textContent = getTranslation('addProduct') || 'Add Product';
    document.getElementById('productIdField').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productOriginalPrice').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productFeatures').value = '';
    document.getElementById('productImage').value = '';
    document.getElementById('productVideo').value = '';
    document.getElementById('productDuration').value = '';
    document.getElementById('productBadge').value = 'FREE';
    document.getElementById('productStatus').value = 'available';
    document.getElementById('productCurrency').value = 'USD';
    document.getElementById('productType').value = 'standard';
    document.getElementById('productBadges').value = '';
    document.getElementById('vipEnabled').checked = false;
    document.getElementById('vipPricingFields').style.display = 'none';
    document.getElementById('quantityOptionsContainer').style.display = 'none';
    document.getElementById('quantityOptionsList').innerHTML = '';
    
    document.querySelectorAll('.currency-option').forEach(el => el.classList.remove('active'));
    document.querySelector('.currency-option[data-currency="USD"]')?.classList.add('active');
    
    document.querySelectorAll('.badge-option').forEach(el => el.classList.remove('selected'));
    
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

async function saveProduct(event) {
    event.preventDefault();
    
    const id = document.getElementById('productIdField').value;
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value) || 0;
    const originalPrice = parseFloat(document.getElementById('productOriginalPrice').value) || null;
    const description = document.getElementById('productDescription').value;
    const features = document.getElementById('productFeatures').value.split(',').map(f => f.trim()).filter(f => f);
    const image = document.getElementById('productImage').value;
    const video = document.getElementById('productVideo').value;
    const duration = document.getElementById('productDuration').value;
    const badge = document.getElementById('productBadge').value;
    const status = document.getElementById('productStatus').value;
    const currency = document.getElementById('productCurrency').value;
    const productType = document.getElementById('productType').value;
    const badges = document.getElementById('productBadges').value.split(',').filter(b => b);
    const vipEnabled = document.getElementById('vipEnabled').checked;
    
    let imageUrl = image;
    const imageFile = document.getElementById('productImageFile').files[0];
    if (imageFile) {
        try {
            const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
        } catch (error) {
            console.error('Error uploading image:', error);
            showToast('❌ ' + getTranslation('errorUploadingImage') || 'Error uploading image', 'error');
            return;
        }
    }
    
    const productData = {
        name,
        price,
        originalPrice,
        description,
        features,
        image: imageUrl || 'https://via.placeholder.com/300x200/1a1a3e/6c5ce7?text=No+Image',
        video,
        duration,
        badge,
        status,
        currency,
        productType,
        badges,
        vipEnabled,
        updatedAt: serverTimestamp()
    };
    
    if (vipEnabled) {
        productData.vipPricing = {
            '1m': parseFloat(document.getElementById('vipPrice1m').value) || null,
            '3m': parseFloat(document.getElementById('vipPrice3m').value) || null,
            '1y': parseFloat(document.getElementById('vipPrice1y').value) || null,
            'lifetime': parseFloat(document.getElementById('vipPriceLifetime').value) || null
        };
    }
    
    try {
        if (id) {
            const productRef = doc(db, 'products', id);
            await updateDoc(productRef, productData);
            showToast('✅ ' + getTranslation('productUpdated') || 'Product updated successfully!', 'success');
            logEvent(analytics, 'product_updated', { productId: id });
        } else {
            productData.createdAt = serverTimestamp();
            await addDoc(collection(db, 'products'), productData);
            showToast('✅ ' + getTranslation('productAdded') || 'Product added successfully!', 'success');
            logEvent(analytics, 'product_added', { productName: name });
        }
        
        closeProductModal();
        loadAdminProducts();
        loadProducts();
    } catch (error) {
        console.error('Error saving product:', error);
        showToast('❌ ' + error.message, 'error');
    }
}

async function editProduct(productId) {
    try {
        const productRef = doc(db, 'products', productId);
        const docSnap = await getDoc(productRef);
        
        if (!docSnap.exists()) {
            showToast('❌ ' + getTranslation('productNotFound') || 'Product not found', 'error');
            return;
        }
        
        const product = docSnap.data();
        
        document.getElementById('productFormTitle').textContent = getTranslation('editProduct') || 'Edit Product';
        document.getElementById('productIdField').value = productId;
        document.getElementById('productName').value = product.name || '';
        document.getElementById('productPrice').value = product.price || '';
        document.getElementById('productOriginalPrice').value = product.originalPrice || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productFeatures').value = product.features ? product.features.join(', ') : '';
        document.getElementById('productImage').value = product.image || '';
        document.getElementById('productVideo').value = product.video || '';
        document.getElementById('productDuration').value = product.duration || '';
        document.getElementById('productBadge').value = product.badge || 'FREE';
        document.getElementById('productStatus').value = product.status || 'available';
        document.getElementById('productCurrency').value = product.currency || 'USD';
        document.getElementById('productType').value = product.productType || 'standard';
        document.getElementById('productBadges').value = product.badges ? product.badges.join(',') : '';
        document.getElementById('vipEnabled').checked = product.vipEnabled || false;
        
        if (product.vipEnabled && product.vipPricing) {
            document.getElementById('vipPricingFields').style.display = 'block';
            document.getElementById('vipPrice1m').value = product.vipPricing['1m'] || '';
            document.getElementById('vipPrice3m').value = product.vipPricing['3m'] || '';
            document.getElementById('vipPrice1y').value = product.vipPricing['1y'] || '';
            document.getElementById('vipPriceLifetime').value = product.vipPricing['lifetime'] || '';
        }
        
        if (product.productType === 'quantity') {
            document.getElementById('quantityOptionsContainer').style.display = 'block';
        }
        
        document.querySelectorAll('.currency-option').forEach(el => {
            el.classList.toggle('active', el.dataset.currency === product.currency);
        });
        
        if (product.badges) {
            document.querySelectorAll('.badge-option').forEach(el => {
                el.classList.toggle('selected', product.badges.includes(el.dataset.badge));
            });
        }
        
        openAddProductModal();
    } catch (error) {
        console.error('Error loading product:', error);
        showToast('❌ ' + error.message, 'error');
    }
}

async function deleteProduct(productId) {
    if (!confirm(getTranslation('confirmDelete') || 'Are you sure you want to delete this product?')) return;
    
    try {
        await deleteDoc(doc(db, 'products', productId));
        showToast('🗑️ ' + getTranslation('productDeleted') || 'Product deleted', 'warning');
        loadAdminProducts();
        loadProducts();
        logEvent(analytics, 'product_deleted', { productId });
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('❌ ' + error.message, 'error');
    }
}

// ============================================================
// ADMIN USERS
// ============================================================
async function loadAdminUsers() {
    const container = document.getElementById('adminUsersContainer');
    if (!container) return;
    
    try {
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        
        let users = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });
        
        if (users.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);">${getTranslation('noUsers') || 'No users found'}</div>`;
            return;
        }
        
        container.innerHTML = users.map(user => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px;background:var(--bg);border-radius:8px;margin-bottom:8px;border:1px solid var(--border);">
                <div>
                    <div style="font-weight:600;">${user.displayName || user.email || 'Unknown'}</div>
                    <div style="font-size:12px;color:rgba(255,255,255,0.5);">${user.email || 'No email'}</div>
                    <div style="font-size:11px;color:rgba(255,255,255,0.3);">UID: ${user.id.substring(0, 12)}...</div>
                </div>
                <div style="font-size:12px;color:rgba(255,255,255,0.3);">
                    ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    ${user.role ? `· ${user.role}` : ''}
                </div>
                <div>
                    <button class="admin-btn-small view-btn" onclick="viewUserDetails('${user.id}')"><i class="fas fa-eye"></i></button>
                    <button class="admin-btn-small delete-btn" onclick="deleteUser('${user.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
        container.innerHTML = `<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);">${getTranslation('error')}</div>`;
    }
}

async function viewUserDetails(userId) {
    try {
        const userRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userRef);
        
        if (!docSnap.exists()) {
            showToast('❌ ' + getTranslation('userNotFound') || 'User not found', 'error');
            return;
        }
        
        const userData = docSnap.data();
        const modal = document.getElementById('userDetailsModal');
        if (!modal) return;
        
        const content = document.getElementById('userDetailsContent');
        if (content) {
            content.innerHTML = `
                <div style="padding:8px 0;">
                    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);">
                        <span style="color:rgba(255,255,255,0.5);">${getTranslation('fullName')}:</span>
                        <span>${userData.displayName || 'N/A'}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);">
                        <span style="color:rgba(255,255,255,0.5);">${getTranslation('email')}:</span>
                        <span>${userData.email || 'N/A'}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);">
                        <span style="color:rgba(255,255,255,0.5);">${getTranslation('country')}:</span>
                        <span>${userData.country || 'N/A'}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);">
                        <span style="color:rgba(255,255,255,0.5);">${getTranslation('role') || 'Role'}:</span>
                        <span>${userData.role || 'user'}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);">
                        <span style="color:rgba(255,255,255,0.5);">${getTranslation('joined') || 'Joined'}:</span>
                        <span>${userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:6px 0;">
                        <span style="color:rgba(255,255,255,0.5);">${getTranslation('lastActive') || 'Last Active'}:</span>
                        <span>${userData.lastActive ? new Date(userData.lastActive).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    ${userData.referralCode ? `
                        <div style="margin-top:12px;padding:10px;background:var(--bg-secondary);border-radius:6px;">
                            <div style="font-size:12px;color:rgba(255,255,255,0.5);">${getTranslation('referralCode')}:</div>
                            <div style="font-family:monospace;font-weight:600;color:var(--primary);">${userData.referralCode}</div>
                            <div style="font-size:12px;color:rgba(255,255,255,0.3);">${getTranslation('referralCount')}: ${userData.referralCount || 0}</div>
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error viewing user:', error);
        showToast('❌ ' + error.message, 'error');
    }
}

function closeUserDetailsModal() {
    const modal = document.getElementById('userDetailsModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

async function deleteUser(userId) {
    if (!confirm(getTranslation('confirmDeleteUser') || 'Are you sure you want to delete this user?')) return;
    
    try {
        await deleteDoc(doc(db, 'users', userId));
        showToast('🗑️ ' + getTranslation('userDeleted') || 'User deleted', 'warning');
        loadAdminUsers();
        logEvent(analytics, 'user_deleted', { userId });
    } catch (error) {
        console.error('Error deleting user:', error);
        showToast('❌ ' + error.message, 'error');
    }
}

function searchAdminUsers() {
    const query = document.getElementById('adminUserSearchInput')?.value?.toLowerCase() || '';
    showToast('🔍 ' + getTranslation('searching') || 'Searching...', 'info');
}

function clearAdminUserSearch() {
    document.getElementById('adminUserSearchInput').value = '';
    loadAdminUsers();
}

function refreshAdminUsers() {
    loadAdminUsers();
}

// ============================================================
// ADMIN DOWNLOADS
// ============================================================
async function loadAdminDownloads() {
    const container = document.getElementById('adminDownloadsList');
    if (!container) return;
    
    try {
        const downloadsRef = collection(db, 'downloads');
        const q = query(downloadsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        downloads = [];
        querySnapshot.forEach((doc) => {
            downloads.push({ id: doc.id, ...doc.data() });
        });
        
        if (downloads.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);">${getTranslation('noDownloads') || 'No downloads found'}</div>`;
            return;
        }
        
        container.innerHTML = downloads.map(dl => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px;background:var(--bg);border-radius:8px;margin-bottom:8px;border:1px solid var(--border);">
                <div>
                    <div style="font-weight:600;">${dl.title || 'Untitled'}</div>
                    <div style="font-size:12px;color:rgba(255,255,255,0.5);">${dl.type || 'Unknown'} · ${dl.date || 'N/A'}</div>
                </div>
                <div>
                    <button class="admin-btn-small edit-btn" onclick="editDownload('${dl.id}')"><i class="fas fa-edit"></i></button>
                    <button class="admin-btn-small delete-btn" onclick="deleteDownload('${dl.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading downloads:', error);
        container.innerHTML = `<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);">${getTranslation('error')}</div>`;
    }
}

function openCreateDownloadModal() {
    const modal = document.getElementById('createDownloadModal');
    if (modal) {
        modal.classList.add('open');
        document.getElementById('dlTitle').value = '';
        document.getElementById('dlType').value = '';
        document.getElementById('dlDescription').value = '';
        document.getElementById('dlUrl').value = '';
        document.getElementById('dlDate').value = '';
    }
}

function closeCreateDownloadModal() {
    const modal = document.getElementById('createDownloadModal');
    if (modal) {
        modal.classList.remove('open');
    }
}

async function createDownload(event) {
    event.preventDefault();
    
    const title = document.getElementById('dlTitle').value;
    const type = document.getElementById('dlType').value;
    const description = document.getElementById('dlDescription').value;
    const url = document.getElementById('dlUrl').value;
    const date = document.getElementById('dlDate').value;
    
    try {
        await addDoc(collection(db, 'downloads'), {
            title,
            type,
            description,
            url,
            date,
            createdAt: serverTimestamp()
        });
        showToast('✅ ' + getTranslation('downloadAdded') || 'Download added successfully!', 'success');
        closeCreateDownloadModal();
        loadAdminDownloads();
        logEvent(analytics, 'download_added', { title });
    } catch (error) {
        console.error('Error creating download:', error);
        showToast('❌ ' + error.message, 'error');
    }
}

async function deleteDownload(downloadId) {
    if (!confirm(getTranslation('confirmDelete') || 'Are you sure?')) return;
    
    try {
        await deleteDoc(doc(db, 'downloads', downloadId));
        showToast('🗑️ ' + getTranslation('deleted') || 'Deleted', 'warning');
        loadAdminDownloads();
    } catch (error) {
        console.error('Error deleting download:', error);
        showToast('❌ ' + error.message, 'error');
    }
}

// ============================================================
// ADMIN NOTIFICATIONS
// ============================================================
async function loadAdminNotifications() {
    const container = document.getElementById('adminNotificationsList');
    if (!container) return;
    
    try {
        const notifRef = collection(db, 'notifications');
        const q = query(notifRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        let notifs = [];
        querySnapshot.forEach((doc) => {
            notifs.push({ id: doc.id, ...doc.data() });
        });
        
        if (notifs.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);">${getTranslation('noNotifications')}</div>`;
            return;
        }
        
        container.innerHTML = notifs.map(notif => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px;background:var(--bg);border-radius:8px;margin-bottom:8px;border:1px solid var(--border);">
                <div>
                    <div style="font-weight:600;">${notif.title || 'Untitled'}</div>
                    <div style="font-size:12px;color:rgba(255,255,255,0.5);">${notif.message || ''}</div>
                </div>
                <div>
                    <button class="admin-btn-small delete-btn" onclick="deleteNotification('${notif.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading notifications:', error);
        container.innerHTML = `<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);">${getTranslation('error')}</div>`;
    }
}

function openCreateNotificationModal() {
    const modal = document.getElementById('createNotificationModal');
    if (modal) {
        modal.classList.add('open');
        document.getElementById('notifTitle').value = '';
        document.getElementById('notifMessage').value = '';
    }
}

function closeCreateNotificationModal() {
    const modal = document.getElementById('createNotificationModal');
    if (modal) {
        modal.classList.remove('open');
    }
}

async function createNotification(event) {
    event.preventDefault();
    
    const title = document.getElementById('notifTitle').value;
    const message = document.getElementById('notifMessage').value;
    
    try {
        await addDoc(collection(db, 'notifications'), {
            title,
            message,
            createdAt: serverTimestamp(),
            read: false
        });
        showToast('✅ ' + getTranslation('notificationSent') || 'Notification sent!', 'success');
        closeCreateNotificationModal();
        loadAdminNotifications();
        logEvent(analytics, 'notification_sent', { title });
    } catch (error) {
        console.error('Error creating notification:', error);
        showToast('❌ ' + error.message, 'error');
    }
}

async function deleteNotification(notifId) {
    if (!confirm(getTranslation('confirmDelete') || 'Are you sure?')) return;
    
    try {
        await deleteDoc(doc(db, 'notifications', notifId));
        showToast('🗑️ ' + getTranslation('deleted') || 'Deleted', 'warning');
        loadAdminNotifications();
    } catch (error) {
        console.error('Error deleting notification:', error);
        showToast('❌ ' + error.message, 'error');
    }
}

// ============================================================
// ADMIN SLIDER
// ============================================================
async function loadAdminSlides() {
    const container = document.getElementById('sliderSlidesList');
    if (!container) return;
    
    try {
        const slidesRef = collection(db, 'slides');
        const q = query(slidesRef, orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);
        
        slides = [];
        querySnapshot.forEach((doc) => {
            slides.push({ id: doc.id, ...doc.data() });
        });
        
        if (slides.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);">${getTranslation('noSlides') || 'No slides found. Click "Add Slide" to get started.'}</div>`;
            return;
        }
        
        container.innerHTML = slides.map((slide, index) => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--bg);border-radius:8px;margin-bottom:8px;border:1px solid var(--border);">
                <img src="${slide.image || 'https://via.placeholder.com/60x40/1a1a3e/6c5ce7?text=Slide'}" 
                     alt="Slide" 
                     style="width:60px;height:40px;border-radius:4px;object-fit:cover;" />
                <div style="flex:1;">
                    <div style="font-weight:600;">${slide.title || 'Slide ' + (index + 1)}</div>
                    <div style="font-size:12px;color:rgba(255,255,255,0.5);">${slide.subtitle || ''}</div>
                </div>
                <div style="display:flex;gap:6px;">
                    <button class="admin-btn-small edit-btn" onclick="editSlide('${slide.id}')"><i class="fas fa-edit"></i></button>
                    <button class="admin-btn-small delete-btn" onclick="deleteSlide('${slide.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading slides:', error);
        container.innerHTML = `<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);">${getTranslation('error')}</div>`;
    }
}

function openAddSlideModal() {
    const modal = document.getElementById('addSlideModal');
    if (modal) {
        modal.classList.add('open');
        document.getElementById('slideTitle').value = '';
        document.getElementById('slideSubtitle').value = '';
        document.getElementById('slideButtonText').value = 'Buy Now';
        document.getElementById('slideLinkType').value = 'none';
        document.getElementById('slideProductGroup').style.display = 'none';
        document.getElementById('slideDownloadGroup').style.display = 'none';
        document.getElementById('slideCustomUrlGroup').style.display = 'none';
        document.getElementById('slideImageFile').value = '';
        document.getElementById('slideImagePreview').style.display = 'none';
    }
}

function closeAddSlideModal() {
    const modal = document.getElementById('addSlideModal');
    if (modal) {
        modal.classList.remove('open');
    }
}

async function saveSlideEdit() {
    const title = document.getElementById('slideTitle').value;
    const subtitle = document.getElementById('slideSubtitle').value;
    const buttonText = document.getElementById('slideButtonText').value;
    const linkType = document.getElementById('slideLinkType').value;
    
    let imageUrl = '';
    const imageFile = document.getElementById('slideImageFile').files[0];
    if (imageFile) {
        try {
            const storageRef = ref(storage, `slides/${Date.now()}_${imageFile.name}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
        } catch (error) {
            console.error('Error uploading slide image:', error);
            showToast('❌ ' + getTranslation('errorUploadingImage') || 'Error uploading image', 'error');
            return;
        }
    }
    
    try {
        await addDoc(collection(db, 'slides'), {
            title,
            subtitle,
            buttonText,
            linkType,
            image: imageUrl || 'https://via.placeholder.com/1200x400/1a1a3e/6c5ce7?text=Slide',
            order: slides.length + 1,
            createdAt: serverTimestamp()
        });
        showToast('✅ ' + getTranslation('slideAdded') || 'Slide added successfully!', 'success');
        closeAddSlideModal();
        loadAdminSlides();
        loadSlides();
        logEvent(analytics, 'slide_added', { title });
    } catch (error) {
        console.error('Error saving slide:', error);
        showToast('❌ ' + error.message, 'error');
    }
}

async function deleteSlide(slideId) {
    if (!confirm(getTranslation('confirmDelete') || 'Are you sure?')) return;
    
    try {
        await deleteDoc(doc(db, 'slides', slideId));
        showToast('🗑️ ' + getTranslation('deleted') || 'Deleted', 'warning');
        loadAdminSlides();
        loadSlides();
    } catch (error) {
        console.error('Error deleting slide:', error);
        showToast('❌ ' + error.message, 'error');
    }
}

// ============================================================
// ADMIN LICENCES
// ============================================================
async function loadAdminLicences() {
    const container = document.getElementById('adminLicencesList');
    if (!container) return;
    
    try {
        const licencesRef = collection(db, 'licences');
        const q = query(licencesRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        licences = [];
        querySnapshot.forEach((doc) => {
            licences.push({ id: doc.id, ...doc.data() });
        });
        
        if (licences.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);">${getTranslation('noLicences')}</div>`;
            return;
        }
        
        container.innerHTML = licences.map(lic => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px;background:var(--bg);border-radius:8px;margin-bottom:8px;border:1px solid var(--border);">
                <div>
                    <div style="font-weight:600;font-family:monospace;">${lic.code || lic.id}</div>
                    <div style="font-size:12px;color:rgba(255,255,255,0.5);">${lic.product || 'Unknown'} · ${lic.userId || 'No user'}</div>
                </div>
                <div>
                    <span class="status-badge ${lic.status || 'pending'}">${lic.status || 'pending'}</span>
                    <button class="admin-btn-small edit-btn" onclick="editLicence('${lic.id}')"><i class="fas fa-edit"></i></button>
                    <button class="admin-btn-small delete-btn" onclick="deleteLicence('${lic.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading licences:', error);
        container.innerHTML = `<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);">${getTranslation('error')}</div>`;
    }
}

function openCreateLicenceModal() {
    const modal = document.getElementById('createLicenceModal');
    if (modal) {
        modal.classList.add('open');
        document.getElementById('newLicenceProduct').value = '';
        document.getElementById('newLicenceUser').value = '';
        document.getElementById('newLicenceExpiry').value = '';
    }
}

function closeCreateLicenceModal() {
    const modal = document.getElementById('createLicenceModal');
    if (modal) {
        modal.classList.remove('open');
    }
}

async function createLicenceManually() {
    const product = document.getElementById('newLicenceProduct').value;
    const userId = document.getElementById('newLicenceUser').value;
    const expiry = document.getElementById('newLicenceExpiry').value;
    
    if (!product) {
        showToast('⚠️ ' + getTranslation('enterProductName') || 'Please enter product name', 'warning');
        return;
    }
    
    try {
        const code = 'LIC-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        
        await addDoc(collection(db, 'licences'), {
            code,
            product,
            userId: userId || null,
            expiry: expiry || null,
            status: 'pending',
            createdAt: serverTimestamp()
        });
        showToast('✅ ' + getTranslation('licenceCreated') || 'Licence created successfully!', 'success');
        closeCreateLicenceModal();
        loadAdminLicences();
        logEvent(analytics, 'licence_created', { product });
    } catch (error) {
        console.error('Error creating licence:', error);
        showToast('❌ ' + error.message, 'error');
    }
}

async function editLicence(licenceId) {
    try {
        const licenceRef = doc(db, 'licences', licenceId);
        const docSnap = await getDoc(licenceRef);
        
        if (!docSnap.exists()) {
            showToast('❌ ' + getTranslation('licenceNotFound') || 'Licence not found', 'error');
            return;
        }
        
        const licence = docSnap.data();
        document.getElementById('editLicenceId').value = licenceId;
        document.getElementById('editLicenceCode').value = licence.code || '';
        document.getElementById('editLicenceScript').value = licence.product || '';
        document.getElementById('editLicenceExpiry').value = licence.expiry || '';
        document.getElementById('editLicenceStatus').value = licence.status || 'pending';
        
        document.getElementById('editLicenceModal').classList.add('open');
    } catch (error) {
        console.error('Error loading licence:', error);
        showToast('❌ ' + error.message, 'error');
    }
}

async function saveLicenceEdit() {
    const id = document.getElementById('editLicenceId').value;
    const expiry = document.getElementById('editLicenceExpiry').value;
    const status = document.getElementById('editLicenceStatus').value;
    
    try {
        await updateDoc(doc(db, 'licences', id), {
            expiry: expiry || null,
            status: status,
            updatedAt: serverTimestamp()
        });
        showToast('✅ ' + getTranslation('licenceUpdated') || 'Licence updated!', 'success');
        document.getElementById('editLicenceModal').classList.remove('open');
        loadAdminLicences();
    } catch (error) {
        console.error('Error saving licence:', error);
        showToast('❌ ' + error.message, 'error');
    }
}

async function deleteLicence(licenceId) {
    if (!confirm(getTranslation('confirmDelete') || 'Are you sure?')) return;
    
    try {
        await deleteDoc(doc(db, 'licences', licenceId));
        showToast('🗑️ ' + getTranslation('deleted') || 'Deleted', 'warning');
        loadAdminLicences();
    } catch (error) {
        console.error('Error deleting licence:', error);
        showToast('❌ ' + error.message, 'error');
    }
}

function refreshLicences() {
    loadAdminLicences();
}

function searchLicences() {
    const query = document.getElementById('adminLicenceSearch')?.value?.toLowerCase() || '';
    const filtered = licences.filter(l => 
        (l.code && l.code.toLowerCase().includes(query)) ||
        (l.product && l.product.toLowerCase().includes(query)) ||
        (l.userId && l.userId.toLowerCase().includes(query))
    );
    const container = document.getElementById('adminLicencesList');
    if (!container) return;
    
    if (filtered.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);">${getTranslation('noResults')}</div>`;
        return;
    }
    
    container.innerHTML = filtered.map(lic => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px;background:var(--bg);border-radius:8px;margin-bottom:8px;border:1px solid var(--border);">
            <div>
                <div style="font-weight:600;font-family:monospace;">${lic.code || lic.id}</div>
                <div style="font-size:12px;color:rgba(255,255,255,0.5);">${lic.product || 'Unknown'} · ${lic.userId || 'No user'}</div>
            </div>
            <div>
                <span class="status-badge ${lic.status || 'pending'}">${lic.status || 'pending'}</span>
                <button class="admin-btn-small edit-btn" onclick="editLicence('${lic.id}')"><i class="fas fa-edit"></i></button>
                <button class="admin-btn-small delete-btn" onclick="deleteLicence('${lic.id}')"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function clearLicenceSearch() {
    document.getElementById('adminLicenceSearch').value = '';
    loadAdminLicences();
}

// ============================================================
// ADMIN STATISTICS
// ============================================================
async function refreshDashboardStats() {
    try {
        const ordersRef = collection(db, 'orders');
        const ordersSnap = await getDocs(ordersRef);
        const totalOrders = ordersSnap.size;
        
        let totalRevenue = 0;
        ordersSnap.forEach(doc => {
            const data = doc.data();
            if (data.total) totalRevenue += data.total;
        });
        
        const netRevenue = totalRevenue * 0.10;
        
        document.getElementById('dashboardTotalOrders').textContent = totalOrders;
        document.getElementById('dashboardTotalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
        document.getElementById('dashboardNetRevenue').textContent = `$${netRevenue.toFixed(2)}`;
        
        adminStats.totalOrders = totalOrders;
        adminStats.totalRevenue = totalRevenue;
        adminStats.netRevenue = netRevenue;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

async function refreshAdvancedStats() {
    const container = document.getElementById('advancedStatsContainer');
    if (!container) return;
    
    try {
        const productsRef = collection(db, 'products');
        const productsSnap = await getDocs(productsRef);
        const totalProducts = productsSnap.size;
        
        const ordersRef = collection(db, 'orders');
        const ordersSnap = await getDocs(ordersRef);
        const totalOrders = ordersSnap.size;
        
        const usersRef = collection(db, 'users');
        const usersSnap = await getDocs(usersRef);
        const totalUsers = usersSnap.size;
        
        let totalRevenue = 0;
        ordersSnap.forEach(doc => {
            const data = doc.data();
            if (data.total) totalRevenue += data.total;
        });
        
        let freeProducts = 0;
        let vipProducts = 0;
        let paidProducts = 0;
        productsSnap.forEach(doc => {
            const data = doc.data();
            if (data.price === 0 || !data.price) freeProducts++;
            else if (data.badge === 'VIP' || data.badge === 'PRO') vipProducts++;
            else paidProducts++;
        });
        
        container.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;">
                <div class="admin-stat-card">
                    <div class="stat-number" style="color:var(--primary);">${totalProducts}</div>
                    <div class="stat-label">${getTranslation('totalProducts') || 'Total Products'}</div>
                </div>
                <div class="admin-stat-card">
                    <div class="stat-number" style="color:var(--success);">${totalOrders}</div>
                    <div class="stat-label">${getTranslation('totalOrders')}</div>
                </div>
                <div class="admin-stat-card">
                    <div class="stat-number" style="color:var(--vip-color);">${totalUsers}</div>
                    <div class="stat-label">${getTranslation('totalUsers') || 'Total Users'}</div>
                </div>
                <div class="admin-stat-card">
                    <div class="stat-number" style="color:#fbbf24;">$${totalRevenue.toFixed(2)}</div>
                    <div class="stat-label">${getTranslation('totalRevenue')}</div>
                </div>
                <div class="admin-stat-card">
                    <div class="stat-number" style="color:#34d399;">${freeProducts}</div>
                    <div class="stat-label">${getTranslation('freeProducts') || 'Free'}</div>
                </div>
                <div class="admin-stat-card">
                    <div class="stat-number" style="color:#a29bfe;">${vipProducts}</div>
                    <div class="stat-label">${getTranslation('vipProducts') || 'VIP'}</div>
                </div>
            </div>
            <div style="margin-top:12px;padding:12px;background:var(--bg);border-radius:8px;border:1px solid var(--border);">
                <div style="font-size:12px;color:rgba(255,255,255,0.3);">${getTranslation('lastUpdated') || 'Last updated'}: ${new Date().toLocaleString()}</div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading advanced stats:', error);
        container.innerHTML = `<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);">${getTranslation('error')}</div>`;
    }
}

// ============================================================
// ADMIN LOGS
// ============================================================
async function loadAuditLogs() {
    const container = document.getElementById('auditLogsContainer');
    if (!container) return;
    
    try {
        const logsRef = collection(db, 'logs');
        const q = query(logsRef, orderBy('timestamp', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);
        
        auditLogs = [];
        querySnapshot.forEach((doc) => {
            auditLogs.push({ id: doc.id, ...doc.data() });
        });
        
        if (auditLogs.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);">${getTranslation('noLogs') || 'No logs found'}</div>`;
            return;
        }
        
        container.innerHTML = auditLogs.map(log => `
            <div style="display:flex;align-items:center;gap:12px;padding:8px 12px;background:var(--bg);border-radius:6px;margin-bottom:4px;border-bottom:1px solid var(--border);font-size:13px;">
                <span style="color:rgba(255,255,255,0.3);font-size:11px;">${log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}</span>
                <span style="color:${log.type === 'error' ? '#f87171' : (log.type === 'warning' ? '#fbbf24' : '#34d399')};">${log.type || 'info'}</span>
                <span style="flex:1;color:rgba(255,255,255,0.6);">${log.message || ''}</span>
                <span style="font-size:11px;color:rgba(255,255,255,0.2);">${log.userId || 'system'}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading logs:', error);
        container.innerHTML = `<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);">${getTranslation('error')}</div>`;
    }
}

// ============================================================
// ADMIN MARQUEE
// ============================================================
function loadMarqueeSettings() {
    const enabled = localStorage.getItem('marqueeEnabled') !== 'false';
    const text = localStorage.getItem('marqueeText') || '🚀 Welcome to ZI Store | ⚡ Instant Delivery | 🔒 Secure Payment | 💬 24/7 Support';
    
    const checkbox = document.getElementById('marqueeEnabled');
    const textarea = document.getElementById('marqueeText');
    
    if (checkbox) checkbox.checked = enabled;
    if (textarea) textarea.value = text;
}

function saveMarqueeSettings() {
    const enabled = document.getElementById('marqueeEnabled').checked;
    const text = document.getElementById('marqueeText').value;
    
    localStorage.setItem('marqueeEnabled', enabled);
    localStorage.setItem('marqueeText', text);
    
    const marqueeBar = document.getElementById('marqueeBar');
    if (marqueeBar) {
        marqueeBar.style.display = enabled ? 'block' : 'none';
        const content = document.getElementById('marqueeContent');
        if (content) {
            const items = text.split('|').map(s => s.trim()).filter(s => s);
            content.innerHTML = items.map(item => `<span>${item}</span>`).join('');
        }
    }
    
    showToast('✅ ' + getTranslation('marqueeSaved') || 'Marquee settings saved!', 'success');
}

// ============================================================
// ADMIN PAYMENTS
// ============================================================
async function loadPaymentRequests() {
    const container = document.getElementById('adminPaymentRequestsList');
    if (!container) return;
    
    try {
        const paymentsRef = collection(db, 'payments');
        const q = query(paymentsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        paymentRequests = [];
        querySnapshot.forEach((doc) => {
            paymentRequests.push({ id: doc.id, ...doc.data() });
        });
        
        if (paymentRequests.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);">${getTranslation('noPaymentRequests') || 'No payment requests found'}</div>`;
            return;
        }
        
        container.innerHTML = paymentRequests.map(payment => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px;background:var(--bg);border-radius:8px;margin-bottom:8px;border:1px solid var(--border);">
                <div>
                    <div style="font-weight:600;">${payment.currency || '$'}${payment.amount?.toFixed(2) || '0.00'}</div>
                    <div style="font-size:12px;color:rgba(255,255,255,0.5);">${payment.method || 'Unknown'} · ${payment.userEmail || 'N/A'}</div>
                    <div style="font-size:11px;color:rgba(255,255,255,0.3);">${payment.transactionId || 'No TX ID'}</div>
                </div>
                <div>
                    <span class="status-badge ${payment.status || 'pending'}">${payment.status || 'pending'}</span>
                    <button class="admin-btn-small confirm-btn" onclick="confirmPayment('${payment.id}')"><i class="fas fa-check"></i></button>
                    <button class="admin-btn-small reject-btn" onclick="rejectPayment('${payment.id}')"><i class="fas fa-times"></i></button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading payments:', error);
        container.innerHTML = `<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);">${getTranslation('error')}</div>`;
    }
}

async function confirmPayment(paymentId) {
    try {
        await updateDoc(doc(db, 'payments', paymentId), {
            status: 'confirmed',
            confirmedAt: serverTimestamp()
        });
        showToast('✅ ' + getTranslation('paymentConfirmed') || 'Payment confirmed', 'success');
        loadPaymentRequests();
        logEvent(analytics, 'payment_confirmed', { paymentId });
    } catch (error) {
        console.error('Error confirming payment:', error);
        showToast('❌ ' + error.message, 'error');
    }
}

async function rejectPayment(paymentId) {
    try {
        await updateDoc(doc(db, 'payments', paymentId), {
            status: 'rejected',
            rejectedAt: serverTimestamp()
        });
        showToast('❌ ' + getTranslation('paymentRejected') || 'Payment rejected', 'warning');
        loadPaymentRequests();
        logEvent(analytics, 'payment_rejected', { paymentId });
    } catch (error) {
        console.error('Error rejecting payment:', error);
        showToast('❌ ' + error.message, 'error');
    }
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const messageEl = document.getElementById('toastMessage');
    const icon = toast?.querySelector('.toast-icon i');
    
    if (!toast || !messageEl) return;
    
    toast.className = 'toast';
    toast.classList.add(type);
    messageEl.textContent = message;
    
    if (icon) {
        if (type === 'success') icon.className = 'fas fa-check-circle';
        else if (type === 'error') icon.className = 'fas fa-exclamation-circle';
        else if (type === 'warning') icon.className = 'fas fa-exclamation-triangle';
        else icon.className = 'fas fa-info-circle';
    }
    
    toast.classList.add('show');
    clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

function hideToast() {
    const toast = document.getElementById('toast');
    if (toast) toast.classList.remove('show');
}

// ============================================================
// FULLSCREEN MODALS
// ============================================================
function openUserMenuFull() {
    const modal = document.getElementById('userMenuFull');
    if (modal) {
        modal.classList.add('open');
        updateUserUI();
        document.getElementById('fullOrderBadge').textContent = orders.filter(o => o.status === 'pending').length;
        document.getElementById('fullWishlistBadge').textContent = wishlist.length;
        document.getElementById('fullNotifBadge').textContent = notifications.filter(n => !n.read).length;
    }
}

function closeUserMenuFull() {
    const modal = document.getElementById('userMenuFull');
    if (modal) modal.classList.remove('open');
}

function openProfileFull() {
    const modal = document.getElementById('profileFull');
    if (modal) {
        modal.classList.add('open');
        const content = document.getElementById('profileFullContent');
        if (content && currentUser) {
            content.innerHTML = `
                <div class="profile-section">
                    <div class="profile-avatar">
                        <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#6c5ce7,#a29bfe);display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:700;margin:0 auto;">
                            ${(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div style="text-align:center;margin-top:12px;">
                        <h3>${currentUser.displayName || 'User'}</h3>
                        <p style="color:rgba(255,255,255,0.5);font-size:14px;">${currentUser.email}</p>
                        <p style="color:rgba(255,255,255,0.3);font-size:12px;">${currentUser.emailVerified ? '✅ ' + getTranslation('emailVerified') : '⚠️ ' + getTranslation('emailNotVerified')}</p>
                    </div>
                    <div style="margin-top:16px;padding:12px;background:var(--bg);border-radius:8px;border:1px solid var(--border);">
                        <div style="display:flex;justify-content:space-between;padding:6px 0;">
                            <span style="color:rgba(255,255,255,0.5);">${getTranslation('memberSince') || 'Member since'}</span>
                            <span>${currentUser.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:6px 0;border-top:1px solid var(--border);">
                            <span style="color:rgba(255,255,255,0.5);">${getTranslation('lastLogin') || 'Last login'}</span>
                            <span>${currentUser.metadata?.lastSignInTime ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:6px 0;border-top:1px solid var(--border);">
                            <span style="color:rgba(255,255,255,0.5);">${getTranslation('totalOrders')}</span>
                            <span>${orders.filter(o => o.userId === currentUser.uid).length}</span>
                        </div>
                    </div>
                    <div style="margin-top:12px;display:flex;gap:8px;">
                        <button onclick="closeProfileFull();openHistoryFull();" class="btn btn-outline" style="flex:1;padding:8px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--text);cursor:pointer;">
                            <i class="fas fa-history"></i> ${getTranslation('orders')}
                        </button>
                        <button onclick="closeProfileFull();openReferralModal();" class="btn btn-outline" style="flex:1;padding:8px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--text);cursor:pointer;">
                            <i class="fas fa-gift"></i> ${getTranslation('referralProgram') || 'Referrals'}
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

function closeProfileFull() {
    const modal = document.getElementById('profileFull');
    if (modal) modal.classList.remove('open');
}

function openHistoryFull() {
    const modal = document.getElementById('historyFull');
    if (modal) {
        modal.classList.add('open');
        const content = document.getElementById('historyFullContent');
        if (content) {
            const userOrders = orders.filter(o => o.userId === currentUser?.uid || o.userEmail === currentUser?.email);
            
            if (userOrders.length === 0) {
                content.innerHTML = `
                    <div style="text-align:center;padding:40px 20px;color:rgba(255,255,255,0.3);">
                        <i class="fas fa-history" style="font-size:48px;margin-bottom:16px;display:block;"></i>
                        ${getTranslation('noOrders')}
                    </div>
                `;
                return;
            }
            
            content.innerHTML = userOrders.map(order => `
                <div style="padding:12px;background:var(--bg);border-radius:8px;margin-bottom:8px;border:1px solid var(--border);">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <div style="font-weight:600;">#${order.id.substring(0, 8)}</div>
                            <div style="font-size:12px;color:rgba(255,255,255,0.5);">${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</div>
                        </div>
                        <div>
                            <span class="status-badge ${order.status || 'pending'}">${order.status || 'pending'}</span>
                            <span style="font-weight:700;margin-left:8px;">${order.currency || '$'}${order.total?.toFixed(2) || '0.00'}</span>
                        </div>
                    </div>
                    <div style="margin-top:8px;font-size:13px;color:rgba(255,255,255,0.5);">
                        ${order.items?.map(item => `${item.name} x${item.quantity}`).join(', ') || 'No items'}
                    </div>
                </div>
            `).join('');
        }
    }
}

function closeHistoryFull() {
    const modal = document.getElementById('historyFull');
    if (modal) modal.classList.remove('open');
}

function openCartFull() {
    const modal = document.getElementById('cartFull');
    if (modal) {
        modal.classList.add('open');
        renderCartFull();
    }
}

function closeCartFull() {
    const modal = document.getElementById('cartFull');
    if (modal) modal.classList.remove('open');
}

function openWishlistFull() {
    const modal = document.getElementById('wishlistFull');
    if (modal) {
        modal.classList.add('open');
        renderWishlistFull();
    }
}

function closeWishlistFull() {
    const modal = document.getElementById('wishlistFull');
    if (modal) modal.classList.remove('open');
}

function openNotifications() {
    const modal = document.getElementById('notificationsModal');
    if (modal) {
        modal.classList.add('open');
        renderNotifications();
    }
}

function closeNotifications() {
    const modal = document.getElementById('notificationsModal');
    if (modal) modal.classList.remove('open');
}

// ============================================================
// REFERRAL FUNCTIONS
// ============================================================
function openReferralModal() {
    const modal = document.getElementById('referralModal');
    if (modal) {
        modal.classList.add('open');
        loadReferralData();
    }
}

function closeReferralModal() {
    const modal = document.getElementById('referralModal');
    if (modal) modal.classList.remove('open');
}

async function loadReferralData() {
    if (!currentUser) return;
    
    try {
        const userRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            referralData.code = data.referralCode || '';
            referralData.count = data.referralCount || 0;
            referralData.rewards = data.referralRewards || 0;
        }
        
        document.getElementById('referralCodeDisplay2').textContent = referralData.code || 'No code';
        document.getElementById('referralCount2').textContent = referralData.count;
        document.getElementById('referralRewards2').textContent = `$${referralData.rewards.toFixed(2)}`;
        
        const steps = document.getElementById('referralSteps');
        if (steps) {
            steps.innerHTML = `
                <div style="background:var(--bg);border-radius:8px;padding:12px;border:1px solid var(--border);">
                    <div style="font-weight:600;margin-bottom:6px;">${getTranslation('referralSteps')}</div>
                    <div style="font-size:13px;color:rgba(255,255,255,0.5);">${getTranslation('referStep1')}</div>
                    <div style="font-size:13px;color:rgba(255,255,255,0.5);">${getTranslation('referStep2')}</div>
                    <div style="font-size:13px;color:rgba(255,255,255,0.5);">${getTranslation('referStep3')}</div>
                    <div style="font-size:13px;color:rgba(255,255,255,0.5);">${getTranslation('referStep4')}</div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading referral data:', error);
    }
}

function copyReferralCode2() {
    const code = document.getElementById('referralCodeDisplay2')?.textContent;
    if (code) {
        navigator.clipboard.writeText(code).then(() => {
            showToast('📋 ' + getTranslation('referralCopied'), 'success');
        });
    }
}

// ============================================================
// REQUESTS FUNCTIONS
// ============================================================
function openRequestsModal() {
    const modal = document.getElementById('requestsModal');
    if (modal) {
        modal.classList.add('open');
        loadUserRequests();
    }
}

function closeRequestsModal() {
    const modal = document.getElementById('requestsModal');
    if (modal) modal.classList.remove('open');
}

async function loadUserRequests() {
    if (!currentUser) return;
    
    try {
        const requestsRef = collection(db, 'requests');
        const q = query(requestsRef, where('userId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        userRequests = [];
        querySnapshot.forEach((doc) => {
            userRequests.push({ id: doc.id, ...doc.data() });
        });
        
        const container = document.getElementById('requestsList');
        if (!container) return;
        
        if (userRequests.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:20px;color:rgba(255,255,255,0.3);">${getTranslation('noRequests')}</div>`;
            return;
        }
        
        container.innerHTML = userRequests.map(req => `
            <div style="padding:10px;background:var(--bg);border-radius:8px;margin-bottom:8px;border:1px solid var(--border);">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <div style="font-weight:600;">${req.gameName || 'Untitled'}</div>
                        <div style="font-size:12px;color:rgba(255,255,255,0.5);">${req.features || ''}</div>
                    </div>
                    <div>
                        <span class="status-badge ${req.status || 'pending'}">${req.status || 'pending'}</span>
                        <span style="font-size:12px;color:rgba(255,255,255,0.3);margin-left:8px;">${req.budget || ''}</span>
                    </div>
                </div>
                <div style="margin-top:6px;font-size:11px;color:rgba(255,255,255,0.3);">
                    ${req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading requests:', error);
    }
}

function openNewRequestModal() {
    const modal = document.getElementById('newRequestModal');
    if (modal) {
        modal.classList.add('open');
        document.getElementById('reqGameName').value = '';
        document.getElementById('reqPlayStore').value = '';
        document.getElementById('reqFeatures').value = '';
        document.getElementById('reqBudget').value = '';
    }
}

function closeNewRequestModal() {
    const modal = document.getElementById('newRequestModal');
    if (modal) modal.classList.remove('open');
}

async function submitRequest(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showToast('🔑 ' + getTranslation('loginRequired'), 'error');
        return;
    }
    
    const gameName = document.getElementById('reqGameName').value;
    const playStore = document.getElementById('reqPlayStore').value;
    const features = document.getElementById('reqFeatures').value;
    const budget = document.getElementById('reqBudget').value;
    
    try {
        await addDoc(collection(db, 'requests'), {
            gameName,
            playStore,
            features,
            budget,
            userId: currentUser.uid,
            userEmail: currentUser.email,
            status: 'pending',
            createdAt: serverTimestamp()
        });
        showToast('✅ ' + getTranslation('requestSubmitted'), 'success');
        closeNewRequestModal();
        loadUserRequests();
        logEvent(analytics, 'request_submitted', { gameName });
    } catch (error) {
        console.error('Error submitting request:', error);
        showToast('❌ ' + error.message, 'error');
    }
}

// ============================================================
// LICENCE FUNCTIONS
// ============================================================
function openLicenceModal() {
    const modal = document.getElementById('licenceModal');
    if (modal) {
        modal.classList.add('open');
        document.getElementById('licenceInput').value = '';
        document.getElementById('licenceResult').innerHTML = '';
    }
}

function closeLicenceModal() {
    const modal = document.getElementById('licenceModal');
    if (modal) modal.classList.remove('open');
}

async function activateLicence() {
    const code = document.getElementById('licenceInput').value.trim().toUpperCase();
    const result = document.getElementById('licenceResult');
    
    if (!code) {
        result.innerHTML = '<span style="color:#f87171;">⚠️ ' + getTranslation('enterLicenceCode') + '</span>';
        return;
    }
    
    try {
        const licencesRef = collection(db, 'licences');
        const q = query(licencesRef, where('code', '==', code));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            result.innerHTML = '<span style="color:#f87171;">❌ ' + getTranslation('licenceInvalid') + '</span>';
            return;
        }
        
        let licence = null;
        let licenceId = null;
        querySnapshot.forEach((doc) => {
            licence = doc.data();
            licenceId = doc.id;
        });
        
        if (!licence || !licenceId) {
            result.innerHTML = '<span style="color:#f87171;">❌ ' + getTranslation('licenceInvalid') + '</span>';
            return;
        }
        
        if (licence.status === 'used' || licence.status === 'revoked') {
            result.innerHTML = '<span style="color:#f87171;">❌ ' + getTranslation('licenceAlreadyUsed') + '</span>';
            return;
        }
        
        if (licence.status === 'expired') {
            result.innerHTML = '<span style="color:#f87171;">❌ ' + getTranslation('licenceExpired') + '</span>';
            return;
        }
        
        if (licence.expiry && new Date(licence.expiry) < new Date()) {
            await updateDoc(doc(db, 'licences', licenceId), {
                status: 'expired'
            });
            result.innerHTML = '<span style="color:#f87171;">❌ ' + getTranslation('licenceExpired') + '</span>';
            return;
        }
        
        await updateDoc(doc(db, 'licences', licenceId), {
            status: 'used',
            activatedBy: currentUser?.uid || null,
            activatedAt: serverTimestamp()
        });
        
        result.innerHTML = '<span style="color:#34d399;">✅ ' + getTranslation('licenceActivated') + '</span>';
        showToast('✅ ' + getTranslation('licenceActivated'), 'success');
        logEvent(analytics, 'licence_activated', { code });
        
        setTimeout(() => {
            closeLicenceModal();
        }, 2000);
        
    } catch (error) {
        console.error('Error activating licence:', error);
        result.innerHTML = `<span style="color:#f87171;">❌ ${error.message}</span>`;
    }
}

// ============================================================
// MISC FUNCTIONS
// ============================================================
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const icon = document.querySelector('.theme-toggle i');
    if (icon) {
        icon.className = document.body.classList.contains('dark-theme') ? 'fas fa-sun' : 'fas fa-moon';
    }
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

function showLanguageMenu() {
    const menu = document.getElementById('languageMenu');
    if (menu) {
        menu.classList.toggle('open');
    }
}

function setLanguage(lang) {
    currentLanguage = lang;
    document.querySelectorAll('.lang-option').forEach(el => {
        el.classList.toggle('active', el.dataset.lang === lang);
    });
    
    const flag = document.getElementById('currentLangFlag');
    const code = document.getElementById('currentLangCode');
    const langMap = {
        ar: { flag: '🇸🇦', code: 'AR' },
        en: { flag: '🇬🇧', code: 'EN' },
        fr: { flag: '🇫🇷', code: 'FR' },
        it: { flag: '🇮🇹', code: 'IT' },
        de: { flag: '🇩🇪', code: 'DE' },
        es: { flag: '🇪🇸', code: 'ES' },
        pt: { flag: '🇵🇹', code: 'PT' }
    };
    if (flag && langMap[lang]) flag.textContent = langMap[lang].flag;
    if (code && langMap[lang]) code.textContent = langMap[lang].code;
    
    localStorage.setItem('language', lang);
    document.querySelector('.language-menu')?.classList.remove('open');
    updateUILanguage();
    displayProducts(filteredProducts);
    updateStats();
    updateRecommendations();
}

// ============================================================
// COOKIE CONSENT
// ============================================================
function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    document.getElementById('cookieConsent')?.classList.remove('show');
    gtag('consent', 'update', {
        'analytics_storage': 'granted'
    });
}

function rejectCookies() {
    localStorage.setItem('cookieConsent', 'rejected');
    document.getElementById('cookieConsent')?.classList.remove('show');
    gtag('consent', 'update', {
        'analytics_storage': 'denied'
    });
}

function openCookieSettings() {
    document.getElementById('cookieSettingsModal')?.classList.add('open');
}

function closeCookieSettings() {
    document.getElementById('cookieSettingsModal')?.classList.remove('open');
}

function saveCookieSettings() {
    const analyticsChecked = document.getElementById('analyticsToggle')?.checked;
    if (analyticsChecked) {
        acceptCookies();
    } else {
        rejectCookies();
    }
    closeCookieSettings();
}

// ============================================================
// INITIALIZATION
// ============================================================
function init() {
    console.log('🚀 ZI Store initialized');
    
    // Load language preference
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);
    
    // Load theme preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('dark-theme');
        const icon = document.querySelector('.theme-toggle i');
        if (icon) icon.className = 'fas fa-sun';
    }
    
    // Load marquee settings
    loadMarqueeSettings();
    
    // Load products
    loadProducts();
    listenToProducts();
    
    // Load slides
    loadSlides();
    
    // Load orders
    loadAdminOrders();
    
    // Load user data if logged in
    if (currentUser) {
        loadUserData();
    }
    
    // Update cart and wishlist UI
    updateCartUI();
    updateWishlistUI();
    updateNotificationsUI();
    
    // Set up search
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            if (query.length > 2) {
                searchProducts(query);
                const clearBtn = document.getElementById('searchClear');
                if (clearBtn) clearBtn.classList.add('visible');
            } else if (query.length === 0) {
                searchQuery = '';
                applyFilters();
                const clearBtn = document.getElementById('searchClear');
                if (clearBtn) clearBtn.classList.remove('visible');
            }
        });
    }
    
    // Set up theme toggle
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    
    // Set up filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            filterProducts(this.dataset.filter);
        });
    });
    
    // Check for search query in URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQueryParam = urlParams.get('search');
    if (searchQueryParam && searchInput) {
        searchInput.value = searchQueryParam;
        searchProducts(searchQueryParam);
        const clearBtn = document.getElementById('searchClear');
        if (clearBtn) clearBtn.classList.add('visible');
    }
    
    // Check for product ID in URL (for direct product page)
    const productId = urlParams.get('id');
    if (productId && window.location.pathname.includes('product.html')) {
        console.log('📦 Product page for:', productId);
    }
    
    // Show cookie consent if not set
    if (!localStorage.getItem('cookieConsent')) {
        setTimeout(() => {
            document.getElementById('cookieConsent')?.classList.add('show');
        }, 2000);
    }
    
    console.log('✅ Initialization complete');
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ============================================================
// EXPOSE FUNCTIONS TO GLOBAL SCOPE
// ============================================================
window.openProductPage = openProductPage;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.updateCartQuantity = updateCartQuantity;
window.toggleWishlist = toggleWishlist;
window.checkout = checkout;
window.openPaymentModal = openPaymentModal;
window.closePaymentModal = closePaymentModal;
window.selectPayment = selectPayment;
window.continuePayment = continuePayment;
window.goToStep1 = goToStep1;
window.placeOrder = placeOrder;
window.copyWalletAddress = copyWalletAddress;
window.loginWithGoogle = loginWithGoogle;
window.logoutUser = logoutUser;
window.openForgotPassword = openForgotPassword;
window.sendForgotPassword = sendForgotPassword;
window.resendVerificationEmail = resendVerificationEmail;
window.openAdminPanel = openAdminPanel;
window.closeAdminPanel = closeAdminPanel;
window.switchAdminTab = switchAdminTab;
window.loadAdminOrders = loadAdminOrders;
window.updateOrderStatus = updateOrderStatus;
window.viewOrderDetails = viewOrderDetails;
window.refreshAdminOrders = refreshAdminOrders;
window.searchAdminOrders = searchAdminOrders;
window.clearAdminSearch = clearAdminSearch;
window.exportOrders = exportOrders;
window.loadAdminProducts = loadAdminProducts;
window.openAddProductModal = openAddProductModal;
window.closeProductModal = closeProductModal;
window.saveProduct = saveProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.loadAdminUsers = loadAdminUsers;
window.viewUserDetails = viewUserDetails;
window.closeUserDetailsModal = closeUserDetailsModal;
window.deleteUser = deleteUser;
window.searchAdminUsers = searchAdminUsers;
window.clearAdminUserSearch = clearAdminUserSearch;
window.refreshAdminUsers = refreshAdminUsers;
window.loadAdminDownloads = loadAdminDownloads;
window.openCreateDownloadModal = openCreateDownloadModal;
window.closeCreateDownloadModal = closeCreateDownloadModal;
window.createDownload = createDownload;
window.deleteDownload = deleteDownload;
window.loadAdminNotifications = loadAdminNotifications;
window.openCreateNotificationModal = openCreateNotificationModal;
window.closeCreateNotificationModal = closeCreateNotificationModal;
window.createNotification = createNotification;
window.deleteNotification = deleteNotification;
window.loadAdminSlides = loadAdminSlides;
window.openAddSlideModal = openAddSlideModal;
window.closeAddSlideModal = closeAddSlideModal;
window.saveSlideEdit = saveSlideEdit;
window.deleteSlide = deleteSlide;
window.loadAdminLicences = loadAdminLicences;
window.openCreateLicenceModal = openCreateLicenceModal;
window.closeCreateLicenceModal = closeCreateLicenceModal;
window.createLicenceManually = createLicenceManually;
window.editLicence = editLicence;
window.saveLicenceEdit = saveLicenceEdit;
window.deleteLicence = deleteLicence;
window.refreshLicences = refreshLicences;
window.searchLicences = searchLicences;
window.clearLicenceSearch = clearLicenceSearch;
window.loadPaymentRequests = loadPaymentRequests;
window.confirmPayment = confirmPayment;
window.rejectPayment = rejectPayment;
window.refreshDashboardStats = refreshDashboardStats;
window.refreshAdvancedStats = refreshAdvancedStats;
window.loadAuditLogs = loadAuditLogs;
window.loadMarqueeSettings = loadMarqueeSettings;
window.saveMarqueeSettings = saveMarqueeSettings;
window.showToast = showToast;
window.hideToast = hideToast;
window.openUserMenuFull = openUserMenuFull;
window.closeUserMenuFull = closeUserMenuFull;
window.openProfileFull = openProfileFull;
window.closeProfileFull = closeProfileFull;
window.openHistoryFull = openHistoryFull;
window.closeHistoryFull = closeHistoryFull;
window.openCartFull = openCartFull;
window.closeCartFull = closeCartFull;
window.openWishlistFull = openWishlistFull;
window.closeWishlistFull = closeWishlistFull;
window.openNotifications = openNotifications;
window.closeNotifications = closeNotifications;
window.openReferralModal = openReferralModal;
window.closeReferralModal = closeReferralModal;
window.copyReferralCode2 = copyReferralCode2;
window.openRequestsModal = openRequestsModal;
window.closeRequestsModal = closeRequestsModal;
window.openNewRequestModal = openNewRequestModal;
window.closeNewRequestModal = closeNewRequestModal;
window.submitRequest = submitRequest;
window.openLicenceModal = openLicenceModal;
window.closeLicenceModal = closeLicenceModal;
window.activateLicence = activateLicence;
window.toggleTheme = toggleTheme;
window.showLanguageMenu = showLanguageMenu;
window.setLanguage = setLanguage;
window.filterProducts = filterProducts;
window.clearSearch = clearSearch;
window.acceptCookies = acceptCookies;
window.rejectCookies = rejectCookies;
window.openCookieSettings = openCookieSettings;
window.closeCookieSettings = closeCookieSettings;
window.saveCookieSettings = saveCookieSettings;
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.goToSlide = goToSlide;
window.toggleSliderEnabled = toggleSliderEnabled;
window.saveSliderInterval = saveSliderInterval;

console.log('✅ All functions exported to global scope');
console.log('🚀 ZI Store is ready!');
