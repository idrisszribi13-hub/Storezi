// ============================================================
// languages.js - نظام الترجمة المتعدد اللغات
// ============================================================

// اللغة الحالية
let currentLanguage = localStorage.getItem('zi_language') || 'en';

// الترجمة
const translations = {
    ar: {
        'welcome_back': '👋 مرحباً بعودتك',
        'login': 'تسجيل الدخول',
        'logout': 'تسجيل الخروج',
        'search_products': '🔍 ابحث عن المنتجات...',
        'cart': 'السلة',
        'profile': 'الملف الشخصي',
        'notifications': 'الإشعارات',
        'all_scripts': 'جميع السكربتات',
        'all': 'الكل',
        'free': 'مجاني',
        'vip': 'VIP',
        'total': 'الإجمالي',
        'favorites': 'المفضلة',
        'add_to_cart': 'أضف إلى السلة',
        'checkout': 'إتمام الشراء',
        'cart_empty': 'السلة فارغة',
        'no_products': 'لا توجد منتجات',
        'support': 'الدعم 24/7',
        'instant': 'فوري',
        'secure': 'آمن',
        'browse': 'تصفح',
        'recommended': 'موصى لك',
        'subtotal': 'المجموع الفرعي',
        'view_cart': 'عرض السلة',
        'clear_cart': 'تفريغ السلة',
        'details': 'تفاصيل',
        'share': 'مشاركة',
        'features': 'المميزات',
        'verified': '✅ منتج موثوق 100%',
        'price': 'السعر',
        'original_price': 'السعر الأصلي',
        'download': 'تحميل',
        'unavailable': 'غير متوفر',
        'coming_soon': 'قريباً',
        'payment': 'الدفع',
        'continue': 'متابعة',
        'back': 'رجوع',
        'confirm_payment': 'تأكيد الدفع',
        'payment_method': 'طريقة الدفع',
        'litecoin': 'لايتكوين',
        'usdt': 'USDT',
        'telegram': 'تيليجرام',
        'binance': 'Binance',
        'exchange_rate': 'سعر الصرف',
        'amount': 'المبلغ',
        'copy_address': 'نسخ العنوان',
        'no_account': 'ليس لديك حساب؟',
        'sign_up': 'إنشاء حساب',
        'create_account': '✨ إنشاء حساب',
        'register_subtitle': 'انضم إلى ZI Store اليوم',
        'full_name': 'الاسم الكامل',
        'confirm_password': 'تأكيد كلمة المرور',
        'country': 'الدولة',
        'language': 'اللغة',
        'referral_code': 'رمز الإحالة',
        'agree_terms': 'أوافق على الشروط والأحكام',
        'already_have_account': 'لديك حساب بالفعل؟',
        'forgot_password': 'نسيت كلمة المرور؟',
        'email': 'البريد الإلكتروني',
        'password': 'كلمة المرور',
        'login_subtitle': 'سجل الدخول للوصول إلى منتجاتك',
        'login_with_google': 'تسجيل الدخول عبر Google',
        'or': 'أو',
        'send_link': 'إرسال الرابط',
        'reset_password': 'إعادة تعيين كلمة المرور'
    },
    en: {
        'welcome_back': '👋 Welcome Back',
        'login': 'Login',
        'logout': 'Logout',
        'search_products': '🔍 Search products...',
        'cart': 'Cart',
        'profile': 'Profile',
        'notifications': 'Notifications',
        'all_scripts': 'All Scripts',
        'all': 'All',
        'free': 'Free',
        'vip': 'VIP',
        'total': 'Total',
        'favorites': 'Favorites',
        'add_to_cart': 'Add to Cart',
        'checkout': 'Checkout',
        'cart_empty': 'Cart is empty',
        'no_products': 'No products',
        'support': '24/7 Support',
        'instant': 'Instant',
        'secure': 'Secure',
        'browse': 'Browse',
        'recommended': 'Recommended for You',
        'subtotal': 'Subtotal',
        'view_cart': 'View Cart',
        'clear_cart': 'Clear Cart',
        'details': 'Details',
        'share': 'Share',
        'features': 'Features',
        'verified': '✅ 100% VERIFIED WORKING PRODUCT',
        'price': 'Price',
        'original_price': 'Original Price',
        'download': 'Download',
        'unavailable': 'Unavailable',
        'coming_soon': 'Coming soon',
        'payment': 'Payment',
        'continue': 'Continue',
        'back': 'Back',
        'confirm_payment': 'Confirm Payment',
        'payment_method': 'Payment Method',
        'litecoin': 'Litecoin',
        'usdt': 'USDT',
        'telegram': 'Telegram',
        'binance': 'Binance',
        'exchange_rate': 'Exchange Rate',
        'amount': 'Amount',
        'copy_address': 'Copy Address',
        'no_account': "Don't have an account?",
        'sign_up': 'Sign up',
        'create_account': '✨ Create Account',
        'register_subtitle': 'Join ZI Store today',
        'full_name': 'Full Name',
        'confirm_password': 'Confirm Password',
        'country': 'Country',
        'language': 'Language',
        'referral_code': 'Referral Code',
        'agree_terms': 'I agree to the Terms & Conditions',
        'already_have_account': 'Already have an account?',
        'forgot_password': 'Forgot password?',
        'email': 'Email',
        'password': 'Password',
        'login_subtitle': 'Login to access your scripts',
        'login_with_google': 'Login with Google',
        'or': 'or',
        'send_link': 'Send Link',
        'reset_password': 'Reset Password'
    },
    fr: {
        'welcome_back': '👋 Bon retour',
        'login': 'Connexion',
        'logout': 'Déconnexion',
        'search_products': '🔍 Rechercher des produits...',
        'cart': 'Panier',
        'profile': 'Profil',
        'notifications': 'Notifications',
        'all_scripts': 'Tous les scripts',
        'all': 'Tous',
        'free': 'Gratuit',
        'vip': 'VIP',
        'total': 'Total',
        'favorites': 'Favoris',
        'add_to_cart': 'Ajouter au panier',
        'checkout': 'Paiement',
        'cart_empty': 'Le panier est vide',
        'no_products': 'Aucun produit',
        'support': 'Support 24/7',
        'instant': 'Instantané',
        'secure': 'Sécurisé',
        'browse': 'Parcourir',
        'recommended': 'Recommandé pour vous',
        'subtotal': 'Sous-total',
        'view_cart': 'Voir le panier',
        'clear_cart': 'Vider le panier',
        'details': 'Détails',
        'share': 'Partager',
        'features': 'Fonctionnalités',
        'verified': '✅ PRODUIT 100% VÉRIFIÉ',
        'price': 'Prix',
        'original_price': 'Prix original',
        'download': 'Télécharger',
        'unavailable': 'Indisponible',
        'coming_soon': 'Bientôt disponible',
        'payment': 'Paiement',
        'continue': 'Continuer',
        'back': 'Retour',
        'confirm_payment': 'Confirmer le paiement',
        'payment_method': 'Méthode de paiement',
        'litecoin': 'Litecoin',
        'usdt': 'USDT',
        'telegram': 'Telegram',
        'binance': 'Binance',
        'exchange_rate': 'Taux de change',
        'amount': 'Montant',
        'copy_address': "Copier l'adresse",
        'no_account': "Vous n'avez pas de compte ?",
        'sign_up': "S'inscrire",
        'create_account': '✨ Créer un compte',
        'register_subtitle': "Rejoignez ZI Store aujourd'hui",
        'full_name': 'Nom complet',
        'confirm_password': 'Confirmer le mot de passe',
        'country': 'Pays',
        'language': 'Langue',
        'referral_code': 'Code de parrainage',
        'agree_terms': "J'accepte les conditions générales",
        'already_have_account': 'Vous avez déjà un compte ?',
        'forgot_password': 'Mot de passe oublié ?',
        'email': 'Email',
        'password': 'Mot de passe',
        'login_subtitle': "Connectez-vous pour accéder à vos scripts",
        'login_with_google': 'Se connecter avec Google',
        'or': 'ou',
        'send_link': "Envoyer le lien",
        'reset_password': 'Réinitialiser le mot de passe'
    },
    it: {
        'welcome_back': '👋 Bentornato',
        'login': 'Accedi',
        'logout': 'Esci',
        'search_products': '🔍 Cerca prodotti...',
        'cart': 'Carrello',
        'profile': 'Profilo',
        'notifications': 'Notifiche',
        'all_scripts': 'Tutti gli script',
        'all': 'Tutti',
        'free': 'Gratuito',
        'vip': 'VIP',
        'total': 'Totale',
        'favorites': 'Preferiti',
        'add_to_cart': 'Aggiungi al carrello',
        'checkout': 'Checkout',
        'cart_empty': 'Il carrello è vuoto',
        'no_products': 'Nessun prodotto',
        'support': 'Supporto 24/7',
        'instant': 'Istantaneo',
        'secure': 'Sicuro',
        'browse': 'Sfoglia',
        'recommended': 'Consigliato per te',
        'subtotal': 'Subtotale',
        'view_cart': 'Vedi carrello',
        'clear_cart': 'Svuota carrello',
        'details': 'Dettagli',
        'share': 'Condividi',
        'features': 'Caratteristiche',
        'verified': '✅ PRODOTTO 100% VERIFICATO',
        'price': 'Prezzo',
        'original_price': 'Prezzo originale',
        'download': 'Scarica',
        'unavailable': 'Non disponibile',
        'coming_soon': 'Prossimamente',
        'payment': 'Pagamento',
        'continue': 'Continua',
        'back': 'Indietro',
        'confirm_payment': 'Conferma pagamento',
        'payment_method': 'Metodo di pagamento',
        'litecoin': 'Litecoin',
        'usdt': 'USDT',
        'telegram': 'Telegram',
        'binance': 'Binance',
        'exchange_rate': 'Tasso di cambio',
        'amount': 'Importo',
        'copy_address': 'Copia indirizzo',
        'no_account': 'Non hai un account?',
        'sign_up': 'Registrati',
        'create_account': '✨ Crea account',
        'register_subtitle': 'Unisciti a ZI Store oggi',
        'full_name': 'Nome completo',
        'confirm_password': 'Conferma password',
        'country': 'Paese',
        'language': 'Lingua',
        'referral_code': 'Codice referral',
        'agree_terms': 'Accetto i Termini e Condizioni',
        'already_have_account': 'Hai già un account?',
        'forgot_password': 'Password dimenticata?',
        'email': 'Email',
        'password': 'Password',
        'login_subtitle': 'Accedi per accedere ai tuoi script',
        'login_with_google': 'Accedi con Google',
        'or': 'o',
        'send_link': 'Invia link',
        'reset_password': 'Reimposta password'
    },
    de: {
        'welcome_back': '👋 Willkommen zurück',
        'login': 'Anmelden',
        'logout': 'Abmelden',
        'search_products': '🔍 Produkte suchen...',
        'cart': 'Warenkorb',
        'profile': 'Profil',
        'notifications': 'Benachrichtigungen',
        'all_scripts': 'Alle Skripte',
        'all': 'Alle',
        'free': 'Kostenlos',
        'vip': 'VIP',
        'total': 'Gesamt',
        'favorites': 'Favoriten',
        'add_to_cart': 'In den Warenkorb',
        'checkout': 'Zur Kasse',
        'cart_empty': 'Warenkorb ist leer',
        'no_products': 'Keine Produkte',
        'support': '24/7 Support',
        'instant': 'Sofort',
        'secure': 'Sicher',
        'browse': 'Durchsuchen',
        'recommended': 'Empfohlen für Sie',
        'subtotal': 'Zwischensumme',
        'view_cart': 'Warenkorb anzeigen',
        'clear_cart': 'Warenkorb leeren',
        'details': 'Details',
        'share': 'Teilen',
        'features': 'Funktionen',
        'verified': '✅ 100% VERIFIZIERTES PRODUKT',
        'price': 'Preis',
        'original_price': 'Ursprünglicher Preis',
        'download': 'Herunterladen',
        'unavailable': 'Nicht verfügbar',
        'coming_soon': 'Demnächst verfügbar',
        'payment': 'Zahlung',
        'continue': 'Fortfahren',
        'back': 'Zurück',
        'confirm_payment': 'Zahlung bestätigen',
        'payment_method': 'Zahlungsmethode',
        'litecoin': 'Litecoin',
        'usdt': 'USDT',
        'telegram': 'Telegram',
        'binance': 'Binance',
        'exchange_rate': 'Wechselkurs',
        'amount': 'Betrag',
        'copy_address': 'Adresse kopieren',
        'no_account': 'Kein Konto?',
        'sign_up': 'Registrieren',
        'create_account': '✨ Konto erstellen',
        'register_subtitle': 'Treten Sie ZI Store heute bei',
        'full_name': 'Vollständiger Name',
        'confirm_password': 'Passwort bestätigen',
        'country': 'Land',
        'language': 'Sprache',
        'referral_code': 'Empfehlungscode',
        'agree_terms': 'Ich stimme den AGB zu',
        'already_have_account': 'Bereits ein Konto?',
        'forgot_password': 'Passwort vergessen?',
        'email': 'E-Mail',
        'password': 'Passwort',
        'login_subtitle': 'Melden Sie sich an, um auf Ihre Skripte zuzugreifen',
        'login_with_google': 'Mit Google anmelden',
        'or': 'oder',
        'send_link': 'Link senden',
        'reset_password': 'Passwort zurücksetzen'
    },
    es: {
        'welcome_back': '👋 Bienvenido de nuevo',
        'login': 'Iniciar sesión',
        'logout': 'Cerrar sesión',
        'search_products': '🔍 Buscar productos...',
        'cart': 'Carrito',
        'profile': 'Perfil',
        'notifications': 'Notificaciones',
        'all_scripts': 'Todos los scripts',
        'all': 'Todos',
        'free': 'Gratis',
        'vip': 'VIP',
        'total': 'Total',
        'favorites': 'Favoritos',
        'add_to_cart': 'Añadir al carrito',
        'checkout': 'Pagar',
        'cart_empty': 'El carrito está vacío',
        'no_products': 'No hay productos',
        'support': 'Soporte 24/7',
        'instant': 'Instantáneo',
        'secure': 'Seguro',
        'browse': 'Explorar',
        'recommended': 'Recomendado para ti',
        'subtotal': 'Subtotal',
        'view_cart': 'Ver carrito',
        'clear_cart': 'Vaciar carrito',
        'details': 'Detalles',
        'share': 'Compartir',
        'features': 'Características',
        'verified': '✅ PRODUCTO 100% VERIFICADO',
        'price': 'Precio',
        'original_price': 'Precio original',
        'download': 'Descargar',
        'unavailable': 'No disponible',
        'coming_soon': 'Próximamente',
        'payment': 'Pago',
        'continue': 'Continuar',
        'back': 'Volver',
        'confirm_payment': 'Confirmar pago',
        'payment_method': 'Método de pago',
        'litecoin': 'Litecoin',
        'usdt': 'USDT',
        'telegram': 'Telegram',
        'binance': 'Binance',
        'exchange_rate': 'Tasa de cambio',
        'amount': 'Cantidad',
        'copy_address': 'Copiar dirección',
        'no_account': '¿No tienes una cuenta?',
        'sign_up': 'Registrarse',
        'create_account': '✨ Crear cuenta',
        'register_subtitle': 'Únete a ZI Store hoy',
        'full_name': 'Nombre completo',
        'confirm_password': 'Confirmar contraseña',
        'country': 'País',
        'language': 'Idioma',
        'referral_code': 'Código de referencia',
        'agree_terms': 'Acepto los Términos y Condiciones',
        'already_have_account': '¿Ya tienes una cuenta?',
        'forgot_password': '¿Olvidaste tu contraseña?',
        'email': 'Correo electrónico',
        'password': 'Contraseña',
        'login_subtitle': 'Inicia sesión para acceder a tus scripts',
        'login_with_google': 'Iniciar sesión con Google',
        'or': 'o',
        'send_link': 'Enviar enlace',
        'reset_password': 'Restablecer contraseña'
    },
    pt: {
        'welcome_back': '👋 Bem-vindo de volta',
        'login': 'Entrar',
        'logout': 'Sair',
        'search_products': '🔍 Pesquisar produtos...',
        'cart': 'Carrinho',
        'profile': 'Perfil',
        'notifications': 'Notificações',
        'all_scripts': 'Todos os scripts',
        'all': 'Todos',
        'free': 'Grátis',
        'vip': 'VIP',
        'total': 'Total',
        'favorites': 'Favoritos',
        'add_to_cart': 'Adicionar ao carrinho',
        'checkout': 'Finalizar compra',
        'cart_empty': 'O carrinho está vazio',
        'no_products': 'Nenhum produto',
        'support': 'Suporte 24/7',
        'instant': 'Instantâneo',
        'secure': 'Seguro',
        'browse': 'Navegar',
        'recommended': 'Recomendado para você',
        'subtotal': 'Subtotal',
        'view_cart': 'Ver carrinho',
        'clear_cart': 'Esvaziar carrinho',
        'details': 'Detalhes',
        'share': 'Compartilhar',
        'features': 'Recursos',
        'verified': '✅ PRODUTO 100% VERIFICADO',
        'price': 'Preço',
        'original_price': 'Preço original',
        'download': 'Baixar',
        'unavailable': 'Indisponível',
        'coming_soon': 'Em breve',
        'payment': 'Pagamento',
        'continue': 'Continuar',
        'back': 'Voltar',
        'confirm_payment': 'Confirmar pagamento',
        'payment_method': 'Método de pagamento',
        'litecoin': 'Litecoin',
        'usdt': 'USDT',
        'telegram': 'Telegram',
        'binance': 'Binance',
        'exchange_rate': 'Taxa de câmbio',
        'amount': 'Valor',
        'copy_address': 'Copiar endereço',
        'no_account': 'Não tem uma conta?',
        'sign_up': 'Cadastrar-se',
        'create_account': '✨ Criar conta',
        'register_subtitle': 'Junte-se à ZI Store hoje',
        'full_name': 'Nome completo',
        'confirm_password': 'Confirmar senha',
        'country': 'País',
        'language': 'Idioma',
        'referral_code': 'Código de indicação',
        'agree_terms': 'Concordo com os Termos e Condições',
        'already_have_account': 'Já tem uma conta?',
        'forgot_password': 'Esqueceu a senha?',
        'email': 'E-mail',
        'password': 'Senha',
        'login_subtitle': 'Faça login para acessar seus scripts',
        'login_with_google': 'Entrar com Google',
        'or': 'ou',
        'send_link': 'Enviar link',
        'reset_password': 'Redefinir senha'
    }
};

// دالة الترجمة
function t(key) {
    const lang = translations[currentLanguage] || translations['en'];
    return lang[key] || key;
}

// دالة تغيير اللغة
function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('zi_language', lang);
        updateUILanguage();
        closeLanguageMenu();
        showToast(`✅ ${t('language')}: ${lang.toUpperCase()}`, 'success');
        return true;
    }
    return false;
}

// دالة تحديث واجهة المستخدم
function updateUILanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = t(key);
        if (translation) {
            if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                el.setAttribute('placeholder', translation);
            } else {
                el.textContent = translation;
            }
        }
    });
    
    const searchInput = document.getElementById('liveSearchInput');
    if (searchInput) {
        searchInput.setAttribute('placeholder', t('search_products'));
    }
    
    const flagMap = {
        'ar': '🇸🇦',
        'en': '🇬🇧',
        'fr': '🇫🇷',
        'it': '🇮🇹',
        'de': '🇩🇪',
        'es': '🇪🇸',
        'pt': '🇵🇹'
    };
    
    const flagEl = document.getElementById('currentLangFlag');
    const codeEl = document.getElementById('currentLangCode');
    if (flagEl) flagEl.textContent = flagMap[currentLanguage] || '🌍';
    if (codeEl) codeEl.textContent = currentLanguage.toUpperCase();
    
    document.querySelectorAll('.lang-option').forEach(el => {
        el.classList.toggle('active', el.dataset.lang === currentLanguage);
    });
    
    console.log(`✅ Language updated to: ${currentLanguage}`);
}

// دالة عرض قائمة اللغات
function showLanguageMenu() {
    const menu = document.getElementById('languageMenu');
    const selector = document.querySelector('.language-selector');
    if (menu) {
        const isOpen = menu.classList.contains('open');
        menu.classList.toggle('open');
        if (selector) {
            selector.classList.toggle('open');
        }
        if (!isOpen) {
            // إغلاق أي قائمة مفتوحة أخرى
            document.querySelectorAll('.language-menu.open').forEach(el => {
                if (el.id !== 'languageMenu') {
                    el.classList.remove('open');
                }
            });
        }
    }
}

// دالة إغلاق قائمة اللغات
function closeLanguageMenu() {
    const menu = document.getElementById('languageMenu');
    const selector = document.querySelector('.language-selector');
    if (menu) {
        menu.classList.remove('open');
        if (selector) {
            selector.classList.remove('open');
        }
    }
}

// دالة Toast بسيطة
function showToast(message, type) {
    const toast = document.getElementById('toast');
    const messageEl = document.getElementById('toastMessage');
    if (toast && messageEl) {
        toast.className = 'toast';
        toast.classList.add(type || 'info');
        messageEl.textContent = message;
        toast.classList.add('show');
        clearTimeout(window.toastTimeout);
        window.toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// تهيئة النظام
document.addEventListener('DOMContentLoaded', function() {
    updateUILanguage();
    
    document.addEventListener('click', function(e) {
        const menu = document.getElementById('languageMenu');
        const selector = document.querySelector('.language-selector');
        if (menu && selector && !menu.contains(e.target) && !selector.contains(e.target)) {
            closeLanguageMenu();
        }
    });
});

// تصدير الدوال للاستخدام العام
window.t = t;
window.setLanguage = setLanguage;
window.updateUILanguage = updateUILanguage;
window.showLanguageMenu = showLanguageMenu;
window.closeLanguageMenu = closeLanguageMenu;
window.currentLanguage = currentLanguage;
