import { loadChampionships, loadLiveMatches, loadTodayMatches, loadStreamEvents, getStandings, getScorers, getAssists, getNews, getBracket, getMatchDetails, getStandingsForMatch, getTeamInfo, getPlayerInfo, getCoachInfo, getRefereeInfo, getNewsDetail, fetchHighlightsForMatch, performSearch } from './api.js';
import { setFontScale, setCurrentLang, setCurrentChampionship, toggleFavorite, isFavorite, setChampionships, setLiveMatches, setTodayMatches, setSelectedDate, setCalViewDate, setSelectedCalDate, currentLang, fontScale, favorites, currentChampionship, liveMatches, todayMatches, streamEvents } from './state.js';
import { fetchFromProxy, getLocalDateStr, formatMatchLocalDateTime, formatMatchLocalTime, formatMatchLocalDate, findStreamEvent, startCountdown, showLoading, hideLoading } from './utils.js';
import { renderLiveMatchCard, renderUpcomingFinishedCard, renderLiveAndToday, renderAllMatches, renderStandingsTable, renderPlayersList, renderMatchDetailsFull, renderSingleEventWithIcon, renderHighlights } from './components.js';
import { translations, LANG_API_BASE, LANG_NEWS_BASE, ICONS, IMG_BASE_TEAM, IMG_BASE_CHAMP } from './config.js';

// ============================================================
//  FONT SIZE CONTROLS
// ============================================================
document.getElementById('fontIncrease').addEventListener('click', () => setFontScale(fontScale + 0.05));
document.getElementById('fontDecrease').addEventListener('click', () => setFontScale(fontScale - 0.05));
const savedFont = parseFloat(localStorage.getItem('fontScale'));
if (savedFont && !isNaN(savedFont)) setFontScale(savedFont);

// ============================================================
//  THEME
// ============================================================
function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeUI(next);
}

function updateThemeUI(theme) {
    const isDark = theme === 'dark';
    const sw = document.getElementById('themeSwitch');
    if (sw) {
        sw.classList.toggle('active', isDark);
        const dot = sw.querySelector('.toggle-dot');
        if (dot) dot.style.transform = isDark ? 'translateX(18px)' : 'translateX(0)';
    }
    const header = document.getElementById('themeToggleHeader');
    if (header) header.textContent = isDark ? '☀️' : '🌙';
}

function loadTheme() {
    const saved = localStorage.getItem('theme');
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefers ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeUI(theme);
}

document.getElementById('themeToggleHeader').addEventListener('click', toggleTheme);
document.getElementById('themeToggleItem').addEventListener('click', toggleTheme);

// ============================================================
//  LANGUAGE
// ============================================================
function applyLanguage(lang) {
    setCurrentLang(lang);
    const t = translations[lang] || translations.en;
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    document.getElementById('champSearch')?.setAttribute('placeholder', t.search_placeholder || 'Search...');
    const selector = document.getElementById('headerLangSelector');
    if (selector) {
        const flagMap = { ar: 'sa', en: 'gb', fr: 'fr', es: 'es', it: 'it', pt: 'pt', br: 'br' };
        const flag = flagMap[lang] || 'gb';
        selector.innerHTML = `<img src="https://flagcdn.com/${flag}.svg" /> ${lang.toUpperCase()}`;
    }
    if (LANG_API_BASE[lang]) API_BASE = LANG_API_BASE[lang];
    if (LANG_NEWS_BASE[lang]) NEWS_BASE = LANG_NEWS_BASE[lang];
    if (currentChampionship) loadMoreContent();
    loadTodayMatches();
}

function initLanguage() {
    const saved = localStorage.getItem('preferred_language');
    const browser = navigator.language.split('-')[0];
    const defaultLang = (saved && translations[saved]) ? saved : (translations[browser] ? browser : 'en');
    applyLanguage(defaultLang);
}

document.querySelectorAll('.lang-option').forEach(btn => {
    btn.addEventListener('click', () => { 
        applyLanguage(btn.dataset.lang);
        document.getElementById('langMenu').style.display = 'none'; 
    });
});
document.getElementById('headerLangSelector').addEventListener('click', (e) => {
    e.stopPropagation();
    const menu = document.getElementById('langMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
});
document.addEventListener('click', () => { document.getElementById('langMenu').style.display = 'none'; });

// ============================================================
//  FAVORITES & FILTERS
// ============================================================
function updateFavoriteUI(matchId) {
    document.querySelectorAll(`.favorite-star[data-match-id="${matchId}"]`).forEach(el => {
        const isFav = isFavorite(matchId);
        el.classList.toggle('active', isFav);
        el.textContent = isFav ? '★' : '☆';
    });
}

function updateFavoriteCounter() {
    const btn = document.getElementById('favoriteToggleHeader');
    if (btn) {
        const count = favorites.length;
        btn.textContent = count > 0 ? `⭐ ${count}` : '⭐';
    }
}

document.querySelectorAll('.filter-bar .filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-bar .filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        renderLiveAndToday(liveMatches, todayMatches);
    });
});

// ============================================================
//  DATE NAVIGATION
// ============================================================
function updateDateUI() {
    const todayStr = getLocalDateStr(new Date());
    const label = document.getElementById('dateLabel');
    if (getLocalDateStr(selectedDate) === todayStr) label.textContent = 'Today';
    else label.textContent = selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function changeDate(offset) {
    setSelectedDate(new Date(selectedDate.getDate() + offset));
    updateDateUI();
    loadTodayMatches();
    loadHighlights();
}

document.getElementById('prevDateBtn').addEventListener('click', () => changeDate(-1));
document.getElementById('nextDateBtn').addEventListener('click', () => changeDate(1));
document.getElementById('openCalendarBtn').addEventListener('click', () => {
    setCalViewDate(new Date(selectedDate));
    setSelectedCalDate(new Date(selectedDate));
    renderCalendar();
    new bootstrap.Modal(document.getElementById('calendarModal')).show();
});

function renderCalendar() {
    document.getElementById('calMonthTitle').textContent = calViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const grid = document.getElementById('calGrid');
    grid.innerHTML = '';
    const year = calViewDate.getFullYear(), month = calViewDate.getMonth();
    const firstDay = new Date(year, month, 1), lastDay = new Date(year, month + 1, 0);
    for (let i = 0; i < firstDay.getDay(); i++) grid.innerHTML += `<div class="cal-day empty"></div>`;
    for (let d = 1; d <= lastDay.getDate(); d++) {
        const dateObj = new Date(year, month, d), dateStr = getLocalDateStr(dateObj);
        const isSelected = selectedCalDate && getLocalDateStr(selectedCalDate) === dateStr;
        grid.innerHTML += `<div class="cal-day ${isSelected ? 'selected' : ''}" onclick="selectCalDate('${dateStr}')">${d}</div>`;
    }
}

window.changeCalMonth = function(offset) { calViewDate.setMonth(calViewDate.getMonth() + offset); renderCalendar(); };
window.selectCalDate = function(dateStr) {
    const parts = dateStr.split('-');
    setSelectedCalDate(new Date(parts[0], parts[1] - 1, parts[2]));
    renderCalendar();
};
window.applyCalendarFilter = function() {
    if (selectedCalDate) {
        setSelectedDate(new Date(selectedCalDate));
        bootstrap.Modal.getInstance(document.getElementById('calendarModal')).hide();
        updateDateUI();
        loadTodayMatches();
        loadHighlights();
    }
};

// ============================================================
//  BOTTOM NAVIGATION
// ============================================================
const pages = {
    live: document.getElementById('pageLive'),
    matches: document.getElementById('pageMatches'),
    videos: document.getElementById('pageVideos'),
    transfers: document.getElementById('pageTransfers'),
    more: document.getElementById('pageMore')
};

document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
    item.addEventListener('click', function() {
        const page = this.dataset.page;
        document.querySelectorAll('.bottom-nav .nav-item').forEach(n => n.classList.remove('active'));
        this.classList.add('active');
        Object.values(pages).forEach(el => el.style.display = 'none');
        if (pages[page]) {
            pages[page].style.display = 'block';
            if (page === 'videos') loadHighlights();
            else if (page === 'transfers') loadTransfersPage();
            else if (page === 'more') loadMoreContent();
            else if (page === 'matches') renderAllMatches(liveMatches, todayMatches);
            else if (page === 'live') renderLiveAndToday(liveMatches, todayMatches);
        }
        currentPage = page;
    });
});

// ============================================================
//  INIT
// ============================================================
async function init() {
    loadTheme();
    initLanguage();
    updateDateUI();
    
    const champs = await loadChampionships();
    setChampionships(champs);
    // populate dropdown here...
    
    await loadLiveMatches();
    await loadTodayMatches();
    await loadHighlights();
    loadTransfersPage();
    
    // Set intervals for live updates
    setInterval(() => loadLiveMatches(), 3000);
    setInterval(() => { loadTodayMatches(); loadHighlights(); }, 60000);
    
    initScrollProgress();
    
    // Expose functions to window (needed for inline onclick in HTML)
    window.toggleFavorite = toggleFavorite;
    window.openTeamModal = openTeamModal;
    window.openPlayerModal = openPlayerModal;
    window.openMatchDetails = openMatchDetails;
    window.quickSelectChampionship = quickSelectChampionship;
    window.openStreamPlayer = openStreamPlayer;
    window.openHighlightPlayer = openHighlightPlayer;
    window.toggleTheme = toggleTheme;
    window.changeCalMonth = changeCalMonth;
    window.selectCalDate = selectCalDate;
    window.applyCalendarFilter = applyCalendarFilter;
}

// بدء التشغيل
init();
