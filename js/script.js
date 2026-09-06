// ============================================================
//  CONFIGURATION
// ============================================================
const ICON_BASE = 'https://zi-store.online/icon/';
const EVENT_ICON_BASE = 'https://zi-store.online/events/';

const ICONS = {
    clock: ICON_BASE + 'clock.png',
    calendar: ICON_BASE + 'calendar.png',
    filter: ICON_BASE + 'filter.png',
    live: ICON_BASE + 'live.png',
    soccerField: ICON_BASE + 'soccer-field.png',
    clapperboard: ICON_BASE + 'clapperboard.png',
    settings: ICON_BASE + 'settings.png',
    research: ICON_BASE + 'research.png',
    soccerChampionship: ICON_BASE + 'soccer-championship.png',
    hourglass: ICON_BASE + 'hourglass.png',
    noWifi: ICON_BASE + 'no-wifi.png',
    wifi: ICON_BASE + 'wifi.png',
    textSize: ICON_BASE + 'text-size.png',
    change: ICON_BASE + 'change.png',
    transfer: ICON_BASE + 'transfer.png',
    play: ICON_BASE + 'play.png',
    goal: EVENT_ICON_BASE + 'ic_goal.svg',
    flag: ICON_BASE + 'flag.png',
    shirt: ICON_BASE + 'shirt.png',
    whistle: EVENT_ICON_BASE + 'ic_whistle.svg',
    yellowCard: EVENT_ICON_BASE + 'ic_yellow_card.svg',
    redCard: EVENT_ICON_BASE + 'ic_red_card.svg',
    penaltyKick: EVENT_ICON_BASE + 'ic_penalty.svg',
    substitutePlayer: EVENT_ICON_BASE + 'ic_substitution.svg',
    firstAid: EVENT_ICON_BASE + 'ic_injury.svg',
    cup: ICON_BASE + 'cup.png',
    video: EVENT_ICON_BASE + 'ic_video.svg',
    football: ICON_BASE + 'football.png',
    ranking: ICON_BASE + 'ranking.png',
    assist: ICON_BASE + 'assist.png',
    news: ICON_BASE + 'news.png',
    bracket: ICON_BASE + 'bracket.png',
    arena: ICON_BASE + 'arena.png',
    schedule: ICON_BASE + 'schedule.png',
    paused: EVENT_ICON_BASE + 'ic_paused.svg',
    crossbar: EVENT_ICON_BASE + 'ic_shoot_crossbar.svg',
    missChance: EVENT_ICON_BASE + 'ic_miss_chance.svg',
    ownGoal: EVENT_ICON_BASE + 'ic_own_goal.svg',
    disallowedGoal: EVENT_ICON_BASE + 'ic_disallowed_goal.svg',
    penaltyMissed: EVENT_ICON_BASE + 'ic_missed_penalty.svg',
    penaltyScored: EVENT_ICON_BASE + 'ic_success_penalty.svg',
};

let API_BASE = 'https://api-en.ysscores.com/api';
let NEWS_BASE = 'https://news-en.ysscores.com/api';
const LANG_API_BASE = { ar: 'https://api-ar.ysscores.com/api', en: 'https://api-en.ysscores.com/api', fr: 'https://api-fr.ysscores.com/api', es: 'https://api-es.ysscores.com/api', it: 'https://api-it.ysscores.com/api', pt: 'https://api-pt.ysscores.com/api', br: 'https://api-br.ysscores.com/api' };
const LANG_NEWS_BASE = { ar: 'https://news-ar.ysscores.com/api', en: 'https://news-en.ysscores.com/api', fr: 'https://news-fr.ysscores.com/api', es: 'https://news-es.ysscores.com/api', it: 'https://news-it.ysscores.com/api', pt: 'https://news-pt.ysscores.com/api', br: 'https://news-br.ysscores.com/api' };
const SUPABASE_PROXY_URL = 'https://kvsyzgavfxnwqmtsginv.supabase.co/functions/v1/proxy';
const IMG_BASE_TEAM = 'https://imgs.ysscores.com/teams/64/';
const IMG_BASE_PLAYER = 'https://imgs.ysscores.com/player/64/';
const IMG_BASE_CHAMP = 'https://imgs.ysscores.com/championship/64/';
const IMG_BASE_COACH = 'https://imgs.ysscores.com/coach/64/';
const IMG_BASE_REFEREE = 'https://imgs.ysscores.com/referee/64/';

// ===== EVENT TYPE MAPPING =====
const EVENT_TYPE_MAP = {
    1: { label: 'Goal', icon: ICONS.goal },
    2: { label: 'Yellow Card', icon: ICONS.yellowCard },
    3: { label: 'Second Yellow Card', icon: ICONS.yellowCard },
    4: { label: 'Red Card', icon: ICONS.redCard },
    5: { label: 'Penalty Scored', icon: ICONS.penaltyScored },
    6: { label: 'Red Card', icon: ICONS.redCard },
    7: { label: 'Offside', icon: ICONS.flag },
    8: { label: 'Substitution', icon: ICONS.substitutePlayer },
    9: { label: 'Foul', icon: ICONS.flag },
    10: { label: 'Own Goal', icon: ICONS.ownGoal },
    11: { label: 'Penalty Missed', icon: ICONS.penaltyMissed },
    12: { label: 'Penalty Saved', icon: ICONS.penaltyKick },
    13: { label: 'Goal', icon: ICONS.goal },
    14: { label: 'Shot Off Target', icon: ICONS.flag },
    15: { label: 'Shot On Target', icon: ICONS.flag },
    21: { label: 'Missed Chance', icon: ICONS.missChance },
    22: { label: 'Crossbar', icon: ICONS.crossbar },
    100: { label: 'Special', icon: ICONS.whistle }
};

const SPECIAL_STATUS_MAP = {
    1: 'Kick-Off',
    2: 'Half Time',
    3: 'Full-Time',
    4: 'Full-Time',
    5: 'ET Half',
    6: 'ET Full-Time',
    7: 'ET Full-Time',
    8: '1st ET',
    9: '2nd ET',
    10: 'Penalties',
    11: 'Penalties FT'
};

const STATUS_MAP = {
    0: 'Upcoming',
    1: '1st Half',
    2: 'HT',
    3: '2nd Half',
    4: 'FT',
    5: 'ET HT',
    6: 'ET',
    7: 'ET FT',
    8: '1st ET',
    9: '2nd ET',
    10: 'PEN',
    14: 'Postponed'
};

function getMatchPeriod(status) {
    return STATUS_MAP[status] || 'Live';
}

function getEventTypeLabel(type, status) {
    if (type === 100) {
        return SPECIAL_STATUS_MAP[status] || 'Special';
    }
    const map = EVENT_TYPE_MAP[type];
    if (map) return map.label;
    return 'Event';
}

function getEventIcon(type, status) {
    if (type === 100) {
        return ICONS.whistle;
    }
    const map = EVENT_TYPE_MAP[type];
    if (map) return map.icon;
    return ICONS.flag;
}

// ===== STREAM EVENTS =====
const STREAM_API_URL = 'https://admin.golive-pro.online/api/public/events?tz=1';
const WORKER_PROXY_URL = 'https://dry-truth-a84e.idriss-zribi13.workers.dev/';
let streamEvents = [];

const teamAliases = {
    'manchester united': ['man utd', 'man u', 'man united', 'manchester u'],
    'man city': ['manchester city', 'manchester c'],
    'tottenham': ['tottenham hotspur', 'spurs'],
    'arsenal': ['arsenal fc'],
    'chelsea': ['chelsea fc'],
    'liverpool': ['liverpool fc'],
    'newcastle': ['newcastle united', 'newcastle utd'],
    'aston villa': ['aston villa fc'],
    'brighton': ['brighton and hove albion', 'brighton & hove albion'],
    'leeds': ['leeds united', 'leeds utd'],
    'manchester': ['man utd', 'man united'],
    'paris sg': ['paris-sg', 'paris saint-germain', 'paris saint germain', 'psg'],
    'rennais': ['stade rennais', 'rennes', 'stade rennais fc'],
    'real madrid': ['real madrid cf', 'real'],
    'barcelona': ['fc barcelona', 'barca'],
    'bayern munich': ['fc bayern munich', 'bayern'],
    'juventus': ['juve', 'juventus fc'],
    'inter': ['inter milan', 'fc internazionale'],
    'ac milan': ['milan', 'ac milan'],
    'roma': ['as roma', 'rome'],
    'napoli': ['ssc napoli'],
    'lazio': ['ss lazio'],
    'atletico madrid': ['atletico madrid cf', 'atleti'],
    'sevilla': ['sevilla fc'],
    'valencia': ['valencia cf'],
    'villarreal': ['villarreal cf'],
    'benfica': ['sl benfica'],
    'porto': ['fc porto'],
    'ajax': ['afc ajax'],
    'psv': ['psv eindhoven'],
    'feyenoord': ['feyenoord rotterdam'],
    'galatasaray': ['galatasaray sk'],
    'fenerbahce': ['fenerbahçe sk'],
    'besiktas': ['beşiktaş jk'],
    'wolfsburg': ['vfl wolfsburg'],
    'hamburger sv': ['hamburg'],
    'fc köln': ['fc koln', 'koln', '1. fc köln'],
    'wuerzburger kickers': ['würzburger kickers', 'wurzburger kickers', 'kickers wurzburg'],
    'altglienicke': ['vs altglienicke'],
    'sc verl': ['sc verls', 'verl'],
    'al nasr': ['Al-Nassr']
};

function normalizeTeamName(name) {
    if (!name) return '';
    let n = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').replace(
        /\s+/g, ' ').trim();
    n = n.replace(/\b(fc|cf|afc|sk|jk|ss|ac|as|sl|vfl|vs|1\.)\b/g, '').replace(/\s+/g, ' ').trim();
    for (const key in teamAliases) { const aliases = teamAliases[key]; if (n === key || aliases.includes(n))
            return key; }
    return n;
}

function findStreamEvent(match) {
    if (!streamEvents.length || !match.home_team || !match.away_team) return null;

    const home = normalizeTeamName(match.home_team.title || match.home_team.full_title);
    const away = normalizeTeamName(match.away_team.title || match.away_team.full_title);

    function namesMatch(a, b) {
        if (!a || !b) return false;
        return a === b || a.includes(b) || b.includes(a);
    }

    let exactMatch = streamEvents.find(event => {
        const eventHome = normalizeTeamName(event.homeName);
        const eventAway = normalizeTeamName(event.awayName);
        return eventHome === home && eventAway === away;
    });
    if (exactMatch && exactMatch.sources && exactMatch.sources.length > 0 && exactMatch.sources[0].streamUrl) {
        return exactMatch;
    }

    let partialMatch = streamEvents.find(event => {
        const eventHome = normalizeTeamName(event.homeName);
        const eventAway = normalizeTeamName(event.awayName);
        return (namesMatch(home, eventHome) && namesMatch(away, eventAway));
    });
    if (partialMatch && partialMatch.sources && partialMatch.sources.length > 0 && partialMatch.sources[0]
        .streamUrl) {
        return partialMatch;
    }

    let oneExactMatch = streamEvents.find(event => {
        const eventHome = normalizeTeamName(event.homeName);
        const eventAway = normalizeTeamName(event.awayName);
        return (eventHome === home && namesMatch(away, eventAway)) ||
            (eventAway === away && namesMatch(home, eventHome));
    });
    if (oneExactMatch && oneExactMatch.sources && oneExactMatch.sources.length > 0 && oneExactMatch.sources[0]
        .streamUrl) {
        return oneExactMatch;
    }

    let fallbackMatch = streamEvents.find(event => {
        const eventHome = normalizeTeamName(event.homeName);
        const eventAway = normalizeTeamName(event.awayName);
        return namesMatch(home, eventHome) || namesMatch(away, eventAway) ||
            namesMatch(home, eventAway) || namesMatch(away, eventHome);
    });
    if (fallbackMatch && fallbackMatch.sources && fallbackMatch.sources.length > 0 && fallbackMatch.sources[0]
        .streamUrl) {
        return fallbackMatch;
    }

    return null;
}

async function loadStreamEvents() {
    try {
        const fullUrl = WORKER_PROXY_URL + '?url=' + encodeURIComponent(STREAM_API_URL);
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        streamEvents = Array.isArray(data) ? data : [];
        console.log('Loaded stream events:', streamEvents.length);
    } catch (err) {
        console.error('Failed to load stream events:', err);
        streamEvents = [];
    }
}

function openStreamPlayer(streamUrl, matchData) {
    const modalElement = document.getElementById('streamPlayerModal');
    const videoElement = document.getElementById('streamVideo');
    const streamCompLogo = document.getElementById('streamCompLogo');
    const streamCompName = document.getElementById('streamCompName');
    const streamMatchInfo = document.getElementById('streamMatchInfo');
    const streamHomeLogo = document.getElementById('streamHomeLogo');
    const streamAwayLogo = document.getElementById('streamAwayLogo');

    if (matchData && matchData.compLogoUrl) { streamCompLogo.src = matchData.compLogoUrl;
        streamCompLogo.style.display = 'inline-block'; } else { streamCompLogo.style.display = 'none'; }
    if (streamCompName) streamCompName.textContent = matchData ? (matchData.compName || '') : '';
    if (streamMatchInfo) streamMatchInfo.textContent = matchData ? `${matchData.homeName} ${matchData.homeScore || 0} - ${matchData.awayScore || 0} ${matchData.awayName}` : '';
    if (matchData && matchData.homeLogoUrl) { streamHomeLogo.src = matchData.homeLogoUrl;
        streamHomeLogo.style.display = 'inline-block'; } else { streamHomeLogo.style.display = 'none'; }
    if (matchData && matchData.awayLogoUrl) { streamAwayLogo.src = matchData.awayLogoUrl;
        streamAwayLogo.style.display = 'inline-block'; } else { streamAwayLogo.style.display = 'none'; }

    let finalStreamUrl = streamUrl;
    if (finalStreamUrl.startsWith('http://')) finalStreamUrl = finalStreamUrl.replace('http://', 'https://');

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(finalStreamUrl);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) { console.error('HLS fatal error:', data);
                alert('Unable to play stream. Please try again later.');
                videoElement.pause(); }
        });
        videoElement.addEventListener('ended', () => hls.destroy());
        window.currentHls = hls;
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoElement.src = finalStreamUrl;
    } else { alert('Your browser does not support HLS'); return; }

    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    modalElement.addEventListener('hidden.bs.modal', () => {
        videoElement.pause();
        videoElement.removeAttribute('src');
        videoElement.load();
        if (window.currentHls) { window.currentHls.destroy();
            window.currentHls = null; }
    }, { once: true });
}

// ============================================================
//  REST OF THE CODE
// ============================================================

let championshipsList = [];
let currentChampionship = null;
let loadingCount = 0;
let scorersPage = 1,
    scorersNextUrl = null,
    scorersLoading = false;
let assistsPage = 1,
    assistsNextUrl = null,
    assistsLoading = false;
let newsPage = 1,
    newsNextUrl = null,
    newsLoading = false;
let scorersObserver = null,
    assistsObserver = null,
    newsObserver = null;
let liveMatches = [];
let todayMatches = [];
let liveUpdateInterval = null;
let todayUpdateInterval = null;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentFilter = 'all';
let selectedDate = new Date();
let calViewDate = new Date();
let selectedCalDate = null;
let currentLang = 'en';
let currentPage = 'live';
let fontScale = 1.15;

// ============================================================
//  FONT SIZE CONTROLS
// ============================================================
function setFontScale(scale) {
    fontScale = Math.min(1.4, Math.max(0.85, scale));
    document.documentElement.style.setProperty('--font-scale', fontScale);
    document.getElementById('fontSizeLabel').textContent = Math.round(fontScale * 100) + '%';
    localStorage.setItem('fontScale', fontScale);
}
document.getElementById('fontIncrease').addEventListener('click', () => setFontScale(fontScale + 0.05));
document.getElementById('fontDecrease').addEventListener('click', () => setFontScale(fontScale - 0.05));
const savedFont = parseFloat(localStorage.getItem('fontScale'));
if (savedFont && !isNaN(savedFont)) setFontScale(savedFont);

// ============================================================
//  FAVORITES
// ============================================================
function toggleFavorite(matchId) {
    const idx = favorites.indexOf(matchId);
    if (idx > -1) favorites.splice(idx, 1);
    else favorites.push(matchId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteUI(matchId);
    renderLiveAndToday();
    updateFavoriteCounter();
}

function isFavorite(matchId) { return favorites.indexOf(matchId) > -1; }

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

// ============================================================
//  CONNECTION
// ============================================================
let connStatus = { online: navigator.onLine };

function updateConnectionStatus(online) {
    const status = document.getElementById('connectionStatus');
    const icon = document.getElementById('statusIcon');
    const text = document.getElementById('statusText');
    if (online) {
        status.className = 'connection-status online show';
        icon.textContent = '✅';
        text.textContent = 'Back online';
        setTimeout(() => status.classList.remove('show'), 3000);
    } else {
        status.className = 'connection-status offline show';
        icon.textContent = '📡';
        text.textContent = 'No Internet Connection';
    }
    connStatus.online = online;
}
window.addEventListener('online', () => updateConnectionStatus(true));
window.addEventListener('offline', () => updateConnectionStatus(false));
document.getElementById('retryBtn').addEventListener('click', () => {
    if (navigator.onLine) updateConnectionStatus(true);
});
setTimeout(() => { if (!navigator.onLine) updateConnectionStatus(false); }, 500);
setInterval(() => { if (navigator.onLine !== connStatus.online) updateConnectionStatus(navigator.onLine); }, 3000);

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
document.getElementById('themeSwitch').addEventListener('click', (e) => { e.stopPropagation();
    toggleTheme(); });

// ============================================================
//  LANGUAGE
// ============================================================
const translations = {
    ar: { dir: 'rtl', select_champ: 'اختر البطولة', search_placeholder: 'ابحث...' },
    en: { dir: 'ltr', select_champ: 'Select Championship', search_placeholder: 'Search...' },
    fr: { dir: 'ltr', select_champ: 'Choisir un championnat', search_placeholder: 'Rechercher...' },
    es: { dir: 'ltr', select_champ: 'Seleccionar campeonato', search_placeholder: 'Buscar...' },
    it: { dir: 'ltr', select_champ: 'Seleziona campionato', search_placeholder: 'Cerca...' },
    pt: { dir: 'ltr', select_champ: 'Selecionar campeonato', search_placeholder: 'Pesquisar...' },
    br: { dir: 'ltr', select_champ: 'Selecionar campeonato', search_placeholder: 'Pesquisar...' }
};

function applyLanguage(lang) {
    currentLang = lang;
    const t = translations[lang] || translations.en;
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });
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

function setLanguage(lang) {
    localStorage.setItem('preferred_language', lang);
    applyLanguage(lang);
}

function initLanguage() {
    const saved = localStorage.getItem('preferred_language');
    const browser = navigator.language.split('-')[0];
    const defaultLang = (saved && translations[saved]) ? saved : (translations[browser] ? browser : 'en');
    applyLanguage(defaultLang);
}
document.querySelectorAll('.lang-option').forEach(btn => {
    btn.addEventListener('click', () => { setLanguage(btn.dataset.lang);
        document.getElementById('langMenu').style.display = 'none'; });
});
document.getElementById('headerLangSelector').addEventListener('click', (e) => {
    e.stopPropagation();
    const menu = document.getElementById('langMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
});
document.addEventListener('click', () => { document.getElementById('langMenu').style.display = 'none'; });

// ============================================================
//  UTILITY
// ============================================================
function getLocalDateStr(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function updateDateUI() {
    const todayStr = getLocalDateStr(new Date());
    const label = document.getElementById('dateLabel');
    if (getLocalDateStr(selectedDate) === todayStr) label.textContent = 'Today';
    else label.textContent = selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short',
        day: 'numeric' });
}

function changeDate(offset) {
    selectedDate.setDate(selectedDate.getDate() + offset);
    updateDateUI();
    loadTodayMatches();
    loadHighlights();
}
document.getElementById('prevDateBtn').addEventListener('click', () => changeDate(-1));
document.getElementById('nextDateBtn').addEventListener('click', () => changeDate(1));
document.getElementById('openCalendarBtn').addEventListener('click', () => {
    calViewDate = new Date(selectedDate);
    selectedCalDate = new Date(selectedDate);
    renderCalendar();
    new bootstrap.Modal(document.getElementById('calendarModal')).show();
});

function renderCalendar() {
    document.getElementById('calMonthTitle').textContent = calViewDate.toLocaleDateString('en-US', { month: 'long',
        year: 'numeric' });
    const grid = document.getElementById('calGrid');
    grid.innerHTML = '';
    const year = calViewDate.getFullYear(),
        month = calViewDate.getMonth();
    const firstDay = new Date(year, month, 1),
        lastDay = new Date(year, month + 1, 0);
    for (let i = 0; i < firstDay.getDay(); i++) grid.innerHTML += `<div class="cal-day empty"></div>`;
    for (let d = 1; d <= lastDay.getDate(); d++) {
        const dateObj = new Date(year, month, d),
            dateStr = getLocalDateStr(dateObj);
        const isSelected = selectedCalDate && getLocalDateStr(selectedCalDate) === dateStr;
        grid.innerHTML +=
            `<div class="cal-day ${isSelected ? 'selected' : ''}" onclick="selectCalDate('${dateStr}')">${d}</div>`;
    }
}
window.changeCalMonth = function(offset) { calViewDate.setMonth(calViewDate.getMonth() + offset);
    renderCalendar(); };
window.selectCalDate = function(dateStr) {
    const parts = dateStr.split('-');
    selectedCalDate = new Date(parts[0], parts[1] - 1, parts[2]);
    renderCalendar();
};
window.applyCalendarFilter = function() {
    if (selectedCalDate) {
        selectedDate = new Date(selectedCalDate);
        bootstrap.Modal.getInstance(document.getElementById('calendarModal')).hide();
        updateDateUI();
        loadTodayMatches();
        loadHighlights();
    }
};

function showLoading() { loadingCount++;
    document.getElementById('loadingIndicator').classList.remove('hidden');
    document.getElementById('errorIndicator').classList.add('hidden'); }

function hideLoading() {
    loadingCount = Math.max(0, loadingCount - 1);
    if (loadingCount === 0) document.getElementById('loadingIndicator').classList.add('hidden');
}

function showError(msg) {
    document.getElementById('errorIndicator').textContent = msg;
    document.getElementById('errorIndicator').classList.remove('hidden');
}

async function fetchFromProxy(url) {
    try {
        const proxied = `${SUPABASE_PROXY_URL}?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxied);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (err) {
        const fallbackUrl = url.replace(/\/api-(ar|fr|es|it|pt|br)\//, '/api-en/');
        if (fallbackUrl !== url) {
            const proxied = `${SUPABASE_PROXY_URL}?url=${encodeURIComponent(fallbackUrl)}`;
            const response = await fetch(proxied);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        }
        throw err;
    }
}

// ============================================================
//  MATCH FUNCTIONS
// ============================================================
function getLiveSeconds(match) {
    const status = match.status !== undefined ? match.status : 1;
    if (status === 1 || status === 3 || status === 8 || status === 9) {
        if (match.minutes !== undefined && match.minutes !== null && match.minutes > 0 && match.minutes < 14400) {
            return match.minutes;
        }
        if (match.match_timestamp && match.match_timestamp > 1000000000) {
            const elapsed = Math.floor(Date.now() / 1000 - match.match_timestamp);
            if (elapsed >= 0 && elapsed < 14400) return elapsed;
        }
        return 0;
    }
    if (status === 4) {
        return match.minutes || 0;
    }
    if (status === 0) return 0;
    if (status === 2) return match.minutes || 0;
    if (status === 10) return match.minutes || 0;
    if (status === 14) return 0;
    return 0;
}

function getMatchPeriod(status) {
    return STATUS_MAP[status] || 'Live';
}

function formatLiveTimeRealtime(seconds, status, exTime) {
    const total = Math.max(0, seconds);
    const mins = Math.floor(total / 60);
    const secs = Math.floor(total % 60);
    const padded = String(secs).padStart(2, '0');
    if (status === 0) return { display: 'VS', stoppage: null, seconds: total };
    if (status === 4) return { display: 'FT', stoppage: null, seconds: total };
    if (status === 2) return { display: 'HT', stoppage: null, seconds: total };
    if (status === 10) return { display: 'PEN', stoppage: null, seconds: total };
    if (status === 14) return { display: 'Postponed', stoppage: null, seconds: total };
    let display = `${mins}:${padded}`;
    let stoppage = null;
    if (exTime && exTime > 0) {
        const extraMins = Math.floor(exTime);
        const extraSecs = Math.round((exTime - extraMins) * 60);
        stoppage = `+${extraMins}:${String(extraSecs).padStart(2, '0')}`;
    }
    return { display, stoppage, seconds: total };
}

function getMatchProgress(seconds, status) {
    if (status === 0) return 0;
    if (status === 4) return 100;
    if (status === 2) return 50;
    if (status === 10) return 100;
    if (status === 14) return 0;
    if (status === 8 || status === 9) {
        const et = seconds / 60;
        return Math.min(100, Math.max(0, ((et - 90) / 30) * 100));
    }
    const mins = seconds / 60;
    return Math.min(100, Math.max(0, (mins / 90) * 100));
}

function getGoalMarkers(match) {
    let markers = '';
    if (match.score_time) {
        try {
            const times = JSON.parse(match.score_time);
            times.forEach(score => {
                for (const key in score) {
                    if (key === '1' || key === '5') {
                        const min = parseInt(score[key]);
                        let pct = Math.min(100, (min / 90) * 100);
                        if (min > 90) pct = 50 + ((min - 90) / 30) * 50;
                        markers += `<div class="goal-marker" style="left:${pct}%"></div>`;
                    }
                }
            });
        } catch (e) {}
    }
    return markers;
}

function getGoalMarkersModal(match) {
    let markers = '';
    if (match.score_time) {
        try {
            const times = JSON.parse(match.score_time);
            times.forEach(score => {
                for (const key in score) {
                    if (key === '1' || key === '5') {
                        const min = parseInt(score[key]);
                        let pct = Math.min(100, (min / 90) * 100);
                        if (min > 90) pct = 50 + ((min - 90) / 30) * 50;
                        markers += `<div class="goal-marker-modal" style="left:${pct}%"></div>`;
                    }
                }
            });
        } catch (e) {}
    }
    return markers;
}

function startCountdown(el, timestamp) {
    if (!el) return;

    function update() {
        const diff = Math.max(0, Math.floor((timestamp - Date.now()) / 1000));
        if (diff <= 0) { el.textContent = '0s'; return; }
        const h = Math.floor(diff / 3600),
            m = Math.floor((diff % 3600) / 60),
            s = diff % 60;
        if (h > 0) el.textContent = `${h}h ${m}m ${s}s`;
        else if (m > 0) el.textContent = `${m}m ${s}s`;
        else el.textContent = `${s}s`;
    }
    update();
    return setInterval(update, 1000);
}

// ============================================================
//  HEADER SEARCH
// ============================================================
const searchInput = document.getElementById('headerSearchInput');
const searchDropdown = document.getElementById('searchResultsDropdown');
searchInput.addEventListener('input', function() {
    const q = this.value.trim();
    if (q.length < 2) { searchDropdown.classList.remove('active'); return; }
    performSearch(q);
});
searchInput.addEventListener('focus', function() {
    if (this.value.trim().length >= 2) searchDropdown.classList.add('active');
});
document.addEventListener('click', function(e) {
    if (!e.target.closest('.header-search')) searchDropdown.classList.remove('active');
});

async function performSearch(query) {
    try {
        const url = `${API_BASE}/search/${encodeURIComponent(query)}/L/60`;
        const data = await fetchFromProxy(url);
        const results = data.data || {};
        renderSearchResults(results, query);
    } catch (err) {
        console.error('Search error:', err);
        searchDropdown.innerHTML = '<div class="no-results">Search failed</div>';
        searchDropdown.classList.add('active');
    }
}

function renderSearchResults(results, query) {
    let html = '';
    let has = false;
    if (results.teams && results.teams.length) {
        has = true;
        results.teams.slice(0, 5).forEach(t => {
            const img = t.name?.image ? IMG_BASE_TEAM + t.name.image :
                'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'30\' height=\'30\' viewBox=\'0 0 30 30\'%3E%3Crect width=\'30\' height=\'30\' fill=\'%23ddd\'/%3E%3Ctext x=\'5\' y=\'20\' font-family=\'sans-serif\' font-size=\'14\' fill=\'%23999\'%3E?%3C/text%3E%3C/svg%3E';
            const title = t.name?.title || 'Unknown';
            const id = t.name?.row_id || t.id;
            html += `<div class="result-item" onclick="openTeamModal(${id})">
                <img src="${img}" /> <span>${title}</span>
                <span class="result-type">Team</span>
            </div>`;
        });
    }
    if (results.championship && results.championship.length) {
        has = true;
        results.championship.slice(0, 5).forEach(c => {
            const img = c.name?.image ? IMG_BASE_CHAMP + c.name.image :
                'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'30\' height=\'30\' viewBox=\'0 0 30 30\'%3E%3Crect width=\'30\' height=\'30\' fill=\'%23ddd\'/%3E%3Ctext x=\'5\' y=\'20\' font-family=\'sans-serif\' font-size=\'14\' fill=\'%23999\'%3E?%3C/text%3E%3C/svg%3E';
            const title = c.name?.title || 'Unknown';
            const urlId = c.name?.url_id || c.id;
            const type = c.name?.type || 1;
            html += `<div class="result-item" onclick="quickSelectChampionship('${urlId}','${title.replace(/'/g,"\\'")}',${type})">
                <img src="${img}" /> <span>${title}</span>
                <span class="result-type">Championship</span>
            </div>`;
        });
    }
    if (results.player && results.player.length) {
        has = true;
        results.player.slice(0, 5).forEach(p => {
            const img = p.name?.image ? IMG_BASE_PLAYER + p.name.image :
                'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'30\' height=\'30\' viewBox=\'0 0 30 30\'%3E%3Crect width=\'30\' height=\'30\' fill=\'%23ddd\'/%3E%3Ctext x=\'5\' y=\'20\' font-family=\'sans-serif\' font-size=\'14\' fill=\'%23999\'%3E?%3C/text%3E%3C/svg%3E';
            const title = p.name?.title || 'Unknown';
            const id = p.name?.row_id || p.id;
            html += `<div class="result-item" onclick="openPlayerModal(${id})">
                <img src="${img}" /> <span>${title}</span>
                <span class="result-type">Player</span>
            </div>`;
        });
    }
    if (!has) html = `<div class="no-results">No results for "${query}"</div>`;
    searchDropdown.innerHTML = html;
    searchDropdown.classList.add('active');
}

// ============================================================
//  CHAMPIONSHIPS
// ============================================================
async function loadChampionships() {
    try {
        showLoading();
        const url = `${API_BASE}/info/championship_ranking/L/60`;
        const data = await fetchFromProxy(url);
        if (data.status && data.data) {
            championshipsList = data.data;
            populateChampDropdown(championshipsList);
        } else showError('Failed to load championships');
    } catch (err) { console.error(err);
        showError('Failed to connect to server'); } finally { hideLoading(); }
}

function populateChampDropdown(list) {
    const container = document.getElementById('champList');
    container.innerHTML = '';
    list.forEach(champ => {
        const item = document.createElement('a');
        item.href = '#';
        item.className = 'dropdown-item';
        item.dataset.champId = champ.url_id;
        item.dataset.champTitle = champ.title;
        item.dataset.champType = champ.type || 1;
        item.dataset.standings = champ.standings ? '1' : '0';
        item.dataset.cups = champ.cups ? '1' : '0';
        const img = champ.image ? IMG_BASE_CHAMP + champ.image :
            'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Crect width=\'24\' height=\'24\' fill=\'%23ddd\'/%3E%3Ctext x=\'4\' y=\'16\' font-family=\'sans-serif\' font-size=\'12\' fill=\'%23999\'%3E?%3C/text%3E%3C/svg%3E';
        item.innerHTML =
            `<img src="${img}" style="width:22px;height:22px;margin-right:10px;object-fit:contain;" /> <span>${champ.title}</span>`;
        item.addEventListener('click', function(e) { e.preventDefault();
            selectChampionship(this); });
        container.appendChild(item);
    });
    document.getElementById('champSearch').addEventListener('input', function() {
        const q = this.value.toLowerCase();
        container.querySelectorAll('.dropdown-item').forEach(item => {
            item.style.display = item.dataset.champTitle.toLowerCase().includes(q) ? '' : 'none';
        });
    });
}

function selectChampionship(el) {
    const id = el.dataset.champId,
        title = el.dataset.champTitle,
        type = parseInt(el.dataset.champType);
    const standings = el.dataset.standings === '1',
        cups = el.dataset.cups === '1';
    const img = el.querySelector('img')?.src || '';
    document.getElementById('selectedChampId').value = id;
    document.getElementById('selectedChampText').innerHTML =
        `${img ? `<img src="${img}" style="width:22px;height:22px;margin-right:8px;object-fit:contain;" />` : ''}${title}`;
    bootstrap.Dropdown.getInstance(document.getElementById('championshipDropdown'))?.hide();
    currentChampionship = { url_id: id, type, title, standings, cups };
    document.getElementById('more-bracket-item').style.display = (type === 4 || (type === 2 && cups)) ? '' : 'none';
    loadMoreContent();
}

function quickSelectChampionship(url_id, title, type) {
    currentChampionship = { url_id, type, title, standings: 1, cups: (type === 4 ? 1 : null) };
    document.getElementById('selectedChampId').value = url_id;
    document.getElementById('selectedChampText').innerHTML =
        `<span class="d-flex align-items-center">${title}</span>`;
    document.getElementById('more-bracket-item').style.display = (type === 4) ? '' : 'none';
    loadMoreContent();
}

// ============================================================
//  LOAD LIVE & TODAY MATCHES
// ============================================================
async function loadLiveMatches() {
    try {
        const url = `${API_BASE}/matches/matches_in_proccess/L/60`;
        const data = await fetchFromProxy(url);
        const newLive = data.data || [];
        handleScoreChanges(liveMatches, newLive);
        liveMatches = newLive;
        await loadStreamEvents();
        renderLiveAndToday();
    } catch (err) { console.error('Live matches error:', err); }
}

async function loadTodayMatches() {
    try {
        const dateStr = getLocalDateStr(selectedDate);
        const url = `${API_BASE}/matches/matches_date_get/${dateStr}/%5B%5D/%5B%5D/%5B%5D/L/60`;
        const data = await fetchFromProxy(url).catch(() => ({ data: [] }));
        const liveIds = new Set(liveMatches.map(m => m.match_id));
        todayMatches = (data.data || []).filter(m => !liveIds.has(m.match_id));
        renderLiveAndToday();
        renderAllMatches();
    } catch (err) { console.error('Today matches error:', err); }
}

async function loadLiveAndTodayMatches() { await loadLiveMatches();
    await loadTodayMatches(); }

function handleScoreChanges(old, newArr) {
    newArr.forEach(n => {
        const o = old.find(m => m.match_id == n.match_id);
        if (!o) return;
        if ((n.home_scores || 0) > (o.home_scores || 0)) showGoalAlert(n.match_id, 'home', '⚽ GOAL');
        else if ((n.away_scores || 0) > (o.away_scores || 0)) showGoalAlert(n.match_id, 'away', '⚽ GOAL');
    });
}

function showGoalAlert(matchId, side, type) {
    const card = document.querySelector(`.match-card[data-match-id="${matchId}"]`);
    if (!card) return;
    const old = card.querySelector('.goal-alert');
    if (old) old.remove();
    const el = document.createElement('div');
    el.className = 'goal-alert';
    el.textContent = type;
    card.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.remove(); }, 5000);
}

// ============================================================
//  RENDER MATCH CARDS
// ============================================================
function renderLiveMatchCard(match) {
    const home = match.home_team,
        away = match.away_team;
    const comp = match.championship ? match.championship.title : '';
    const compImg = match.championship?.image ?
        `<img src="${IMG_BASE_CHAMP + match.championship.image}" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;" />` :
        '';
    const seconds = getLiveSeconds(match);
    const status = match.status !== undefined ? match.status : 1;
    const timer = formatLiveTimeRealtime(seconds, status, match.ex_time);
    const period = getMatchPeriod(status);
    const progress = getMatchProgress(seconds, status);
    const markers = getGoalMarkers(match);
    const homeLogo = IMG_BASE_TEAM + home.image;
    const awayLogo = IMG_BASE_TEAM + away.image;
    const isFav = isFavorite(match.match_id);

    const isPostponed = status === 14;
    const isUpcoming = status === 0;
    const isFinished = status === 4;
    const isHT = status === 2;
    const isPen = status === 10;

    let badgeHtml = '';
    let timerHtml = '';
    let progressFill = 0;

    if (isPostponed) {
        badgeHtml = `<div class="badge badge-postponed">Postponed</div>`;
        timerHtml = `<div class="time-text" style="background:#ff6b35;color:#fff;">Postponed</div>`;
        progressFill = 0;
    } else if (isUpcoming) {
        timerHtml = `<div class="time-text">VS</div>`;
        progressFill = 0;
    } else if (isFinished) {
        badgeHtml = `<div class="live-badge">FT</div>`;
        timerHtml = '';
        progressFill = 100;
    } else if (isHT) {
        badgeHtml = `<div class="live-badge">HT</div>`;
        const totalMins = Math.floor(seconds / 60);
        const totalSecs = Math.floor(seconds % 60);
        timerHtml = `<div class="time-text">${totalMins}:${String(totalSecs).padStart(2,'0')}</div>`;
        progressFill = 50;
    } else if (isPen) {
        badgeHtml = `<div class="live-badge">PEN</div>`;
        timerHtml = `<div class="time-text">PEN</div>`;
        progressFill = 100;
    } else {
        badgeHtml = `<div class="live-badge">${period}</div>`;
        timerHtml =
            `<div class="time-text">${timer.display}${timer.stoppage ? `<span class="stoppage-badge">${timer.stoppage}</span>` : ''}</div>`;
        progressFill = progress;
    }

    const showScore = !isUpcoming && !isPostponed;
    const scoreDisplay = showScore ? `${match.home_scores || 0} - ${match.away_scores || 0}` : '';

    const stream = findStreamEvent(match);
    const compLogoUrl = match.championship?.image ? IMG_BASE_CHAMP + match.championship.image : '';
    let playBtn = '';
    if (stream && !isPostponed && !isUpcoming) {
        playBtn =
            `<button class="play-stream-btn" onclick='event.stopPropagation();openStreamPlayer("${stream.sources[0].streamUrl}", ${JSON.stringify({ title: comp, compName: comp, compLogoUrl, homeName: home.title, awayName: away.title, homeScore: match.home_scores || 0, awayScore: match.away_scores || 0, homeLogoUrl: homeLogo, awayLogoUrl: awayLogo })})'><img src="${ICONS.play}" /> Play</button>`;
    }

    let penaltyHtml = '';
    if (match.match_penalties) {
        const homePens = match.match_penalties[home.row_id] ? match.match_penalties[home.row_id].filter(p => p
            .score === 1).length : 0;
        const awayPens = match.match_penalties[away.row_id] ? match.match_penalties[away.row_id].filter(p => p
            .score === 1).length : 0;
        penaltyHtml = `<div class="penalty-score">PK: ${homePens} - ${awayPens}</div>`;
    }

    return `
    <div class="col-12 mb-2">
        <div class="match-card" data-match-id="${match.match_id}">
            <div class="match-row">
                <div class="team-col">
                    <img src="${homeLogo}" onclick="event.stopPropagation();openTeamModal(${home.row_id})" />
                    <div class="team-title" onclick="event.stopPropagation();openTeamModal(${home.row_id})">${home.title}</div>
                </div>
                <div class="center-col">
                    <div class="score-big">${scoreDisplay || 'VS'}</div>
                    ${penaltyHtml}
                    ${badgeHtml}
                    ${timerHtml}
                    <div class="timeline-container">
                        <div class="timeline-fill" style="width:${progressFill}%"></div>
                        ${status === 2 ? '<div class="ht-marker"></div>' : ''}
                        ${markers}
                    </div>
                    ${playBtn}
                    <button class="favorite-star ${isFav ? 'active' : ''}" data-match-id="${match.match_id}" onclick="event.stopPropagation();toggleFavorite(${match.match_id});">${isFav ? '★' : '☆'}</button>
                </div>
                <div class="team-col">
                    <img src="${awayLogo}" onclick="event.stopPropagation();openTeamModal(${away.row_id})" />
                    <div class="team-title" onclick="event.stopPropagation();openTeamModal(${away.row_id})">${away.title}</div>
                </div>
            </div>
            <div class="match-footer">
                ${compImg} <span class="champ-title" onclick="event.stopPropagation();quickSelectChampionship('${match.championship?.url_id || ''}','${comp.replace(/'/g,"\\'")}',${match.championship?.type || 1})">${comp}</span>
                <span>|</span> ${formatMatchLocalDateTime(match.match_timestamp) || match.match_date || ''}
            </div>
            ${showScore ? `<div class="match-events" id="events-${match.match_id}"></div>` : ''}
        </div>
    </div>`;
}

function renderUpcomingFinishedCard(match, isUpcoming) {
    const home = match.home_team,
        away = match.away_team;
    const comp = match.championship ? match.championship.title : '';
    const compImg = match.championship?.image ?
        `<img src="${IMG_BASE_CHAMP + match.championship.image}" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;" />` :
        '';
    const homeLogo = IMG_BASE_TEAM + home.image;
    const awayLogo = IMG_BASE_TEAM + away.image;
    const isFav = isFavorite(match.match_id);
    const matchTime = match.match_timestamp ? formatMatchLocalTime(match.match_timestamp) : match.match_time;
    const matchDate = match.match_timestamp ? formatMatchLocalDate(match.match_timestamp) : match.match_date;
    const status = match.status !== undefined ? match.status : 1;
    const isPostponed = status === 14;
    const isFinished = status === 4;
    const isLive = (status === 1 || status === 2 || status === 3 || status === 8 || status === 9 || status === 10);

    const showTimelineAndEvents = isLive || isFinished;

    let middle = '';
    if (isUpcoming && !isPostponed) {
        const ts = match.match_timestamp * 1000;
        const diff = Math.max(0, Math.floor((ts - Date.now()) / 1000));
        const h = Math.floor(diff / 3600),
            m = Math.floor((diff % 3600) / 60),
            s = diff % 60;
        const countdown = h > 0 ? `${h}h ${m}m ${s}s` : (m > 0 ? `${m}m ${s}s` : `${s}s`);
        middle = `
        <div class="upcoming-center">
            <div class="countdown-timer" data-timestamp="${ts}">${countdown}</div>
            <button class="favorite-star ${isFav ? 'active' : ''}" data-match-id="${match.match_id}" onclick="event.stopPropagation();toggleFavorite(${match.match_id});" style="font-size:calc(16px*var(--font-scale));margin-top:3px;">${isFav ? '★' : '☆'}</button>
        </div>`;
        setTimeout(() => {
            const el = document.querySelector(`.match-card[data-match-id="${match.match_id}"] .countdown-timer`);
            if (el) { const ts2 = parseInt(el.dataset.timestamp);
                startCountdown(el, ts2); }
        }, 100);
    } else if (isPostponed) {
        middle = `
        <div class="upcoming-center">
            <div class="badge badge-postponed" style="font-size:11px;padding:3px 12px;">Postponed</div>
            <button class="favorite-star ${isFav ? 'active' : ''}" data-match-id="${match.match_id}" onclick="event.stopPropagation();toggleFavorite(${match.match_id});" style="font-size:calc(16px*var(--font-scale));margin-top:3px;">${isFav ? '★' : '☆'}</button>
        </div>`;
    } else if (isFinished) {
        let penaltyHtml = '';
        if (match.match_penalties) {
            const homePens = match.match_penalties[home.row_id] ? match.match_penalties[home.row_id].filter(p => p
                .score === 1).length : 0;
            const awayPens = match.match_penalties[away.row_id] ? match.match_penalties[away.row_id].filter(p => p
                .score === 1).length : 0;
            penaltyHtml = `<div class="penalty-score">PK: ${homePens} - ${awayPens}</div>`;
        }
        middle = `
        <div class="upcoming-center">
            <div style="font-size:calc(19px*var(--font-scale));font-weight:800;color:var(--text-color);">${match.home_scores || 0} - ${match.away_scores || 0}</div>
            ${penaltyHtml}
            <div class="badge bg-secondary" style="font-size:9px;">FT</div>
            <button class="favorite-star ${isFav ? 'active' : ''}" data-match-id="${match.match_id}" onclick="event.stopPropagation();toggleFavorite(${match.match_id});" style="font-size:calc(16px*var(--font-scale));margin-top:3px;">${isFav ? '★' : '☆'}</button>
        </div>`;
    } else {
        const seconds = getLiveSeconds(match);
        const timer = formatLiveTimeRealtime(seconds, status, match.ex_time);
        const progress = getMatchProgress(seconds, status);
        const period = getMatchPeriod(status);
        const markers = getGoalMarkers(match);
        middle = `
        <div class="upcoming-center">
            <div style="font-size:calc(19px*var(--font-scale));font-weight:800;color:var(--text-color);">${match.home_scores || 0} - ${match.away_scores || 0}</div>
            <div class="live-badge">${period}</div>
            <div class="time-text">${timer.display}${timer.stoppage ? `<span class="stoppage-badge">${timer.stoppage}</span>` : ''}</div>
            <div class="timeline-container">
                <div class="timeline-fill" style="width:${progress}%"></div>
                ${status === 2 ? '<div class="ht-marker"></div>' : ''}
                ${markers}
            </div>
            <button class="favorite-star ${isFav ? 'active' : ''}" data-match-id="${match.match_id}" onclick="event.stopPropagation();toggleFavorite(${match.match_id});" style="font-size:calc(16px*var(--font-scale));margin-top:3px;">${isFav ? '★' : '☆'}</button>
        </div>`;
    }

    return `
    <div class="col-12 mb-2">
        <div class="match-card" data-match-id="${match.match_id}">
            <div class="match-row">
                <div class="team-col">
                    <img src="${homeLogo}" onclick="event.stopPropagation();openTeamModal(${home.row_id})" />
                    <div class="team-title" onclick="event.stopPropagation();openTeamModal(${home.row_id})">${home.title}</div>
                </div>
                ${middle}
                <div class="team-col">
                    <img src="${awayLogo}" onclick="event.stopPropagation();openTeamModal(${away.row_id})" />
                    <div class="team-title" onclick="event.stopPropagation();openTeamModal(${away.row_id})">${away.title}</div>
                </div>
            </div>
            <div class="match-footer">
                ${compImg} <span class="champ-title" onclick="event.stopPropagation();quickSelectChampionship('${match.championship?.url_id || ''}','${comp.replace(/'/g,"\\'")}',${match.championship?.type || 1})">${comp}</span>
                <span>|</span> ${matchDate} ${matchTime}
            </div>
            ${showTimelineAndEvents ? `<div class="match-events" id="events-${match.match_id}"></div>` : ''}
        </div>
    </div>`;
}

function renderLiveAndToday() {
    const liveC = document.getElementById('liveMatchesContainer');
    liveC.innerHTML = '';
    let filteredLive = liveMatches;
    if (currentFilter === 'favorites') { filteredLive = liveMatches.filter(m => isFavorite(m.match_id)); }
    if (filteredLive.length === 0) {
        liveC.innerHTML = '<div class="col-12"><p class="text-muted" style="font-size:calc(14px*var(--font-scale));">No live matches.</p></div>';
    } else {
        filteredLive.forEach(m => liveC.innerHTML += renderLiveMatchCard(m));
    }
    renderAllMatches();
    document.querySelectorAll('.match-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.play-stream-btn') || e.target.closest('.favorite-star') ||
                e.target.closest('.team-title') || e.target.closest('.team-col img') ||
                e.target.closest('.champ-title')) return;
            openMatchDetails(this.dataset.matchId);
        });
    });
}

function renderAllMatches() {
    const container = document.getElementById('allMatchesContainer');
    container.innerHTML = '';
    const all = [...liveMatches, ...todayMatches];
    if (all.length === 0) { container.innerHTML =
            '<p class="text-muted" style="font-size:calc(14px*var(--font-scale));">No matches available.</p>';
        return; }
    all.forEach(m => {
        const isLive = liveMatches.some(lm => lm.match_id == m.match_id);
        if (isLive) container.innerHTML += renderLiveMatchCard(m);
        else container.innerHTML += renderUpcomingFinishedCard(m, m.status === 0 || m.status === undefined);
    });
    container.querySelectorAll('.match-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.play-stream-btn') || e.target.closest('.favorite-star') ||
                e.target.closest('.team-title') || e.target.closest('.team-col img') ||
                e.target.closest('.champ-title')) return;
            openMatchDetails(this.dataset.matchId);
        });
    });
}

// ============================================================
//  HIGHLIGHTS
// ============================================================
async function loadHighlights() {
    const allMatches = [...liveMatches, ...todayMatches];
    const container = document.getElementById('highlightsContainer');
    container.innerHTML = '<div class="text-center">Loading highlights...</div>';

    let videos = [];
    for (const match of allMatches) {
        if (match.video_links && match.video_links.length) {
            match.video_links.forEach(v => {
                if (v.video_link) {
                    videos.push({
                        title: `${match.home_team?.title || 'Home'} vs ${match.away_team?.title || 'Away'}`,
                        url: v.video_link,
                        thumbnail: v.thumbnail || '',
                        competition: match.championship ? match.championship.title : '',
                    });
                }
            });
        } else {
            try {
                const detailUrl = `${API_BASE}/matches/match_info/${match.match_id}/L/60`;
                const detailData = await fetchFromProxy(detailUrl);
                if (detailData && detailData.data && detailData.data.video_links) {
                    detailData.data.video_links.forEach(v => {
                        if (v.video_link) {
                            videos.push({
                                title: `${detailData.data.home_team?.title || 'Home'} vs ${detailData.data.away_team?.title || 'Away'}`,
                                url: v.video_link,
                                thumbnail: v.thumbnail || '',
                                competition: detailData.data.championship ? detailData.data
                                    .championship.title : '',
                            });
                        }
                    });
                }
            } catch (e) { /* silent */ }
        }
    }

    if (videos.length === 0) {
        container.innerHTML = '<p class="text-muted" style="font-size:calc(14px*var(--font-scale));">No highlights available for this date.</p>';
        return;
    }

    let html = '';
    videos.forEach(v => {
        let thumb = v.thumbnail;
        if (!thumb && v.url.includes('youtube.com')) {
            const matchId = v.url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
            if (matchId) thumb = `https://img.youtube.com/vi/${matchId[1]}/hqdefault.jpg`;
        }
        if (!thumb) thumb =
            'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'480\' height=\'270\' viewBox=\'0 0 480 270\'%3E%3Crect width=\'480\' height=\'270\' fill=\'%23222\'/%3E%3Ctext x=\'180\' y=\'140\' font-family=\'sans-serif\' font-size=\'24\' fill=\'%23fff\'%3EVideo%3C/text%3E%3C/svg%3E';
        html += `
        <div class="highlight-card" onclick="openHighlightPlayer('${v.url}','${v.title.replace(/'/g,"\\'")}')">
            <div class="highlight-thumb">
                <img src="${thumb}" alt="${v.title}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'480\' height=\'270\' viewBox=\'0 0 480 270\'%3E%3Crect width=\'480\' height=\'270\' fill=\'%23222\'/%3E%3Ctext x=\'180\' y=\'140\' font-family=\'sans-serif\' font-size=\'24\' fill=\'%23fff\'%3EVideo%3C/text%3E%3C/svg%3E'" />
                <div class="play-overlay"></div>
            </div>
            <div class="highlight-body">
                <div class="highlight-title">${v.title}</div>
                <div class="highlight-meta">
                    <span>${v.competition}</span>
                </div>
            </div>
        </div>`;
    });
    container.innerHTML = html;
}

function openHighlightPlayer(url, title) {
    const modal = new bootstrap.Modal(document.getElementById('highlightPlayerModal'));
    document.getElementById('highlightPlayerTitle').textContent = title || 'Highlights';
    const iframe = document.getElementById('highlightIframe');
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let embedUrl = url;
        if (url.includes('watch?v=')) {
            const vid = url.split('v=')[1]?.split('&')[0];
            if (vid) embedUrl = `https://www.youtube.com/embed/${vid}?autoplay=1`;
        } else if (url.includes('youtu.be/')) {
            const vid = url.split('youtu.be/')[1]?.split('?')[0];
            if (vid) embedUrl = `https://www.youtube.com/embed/${vid}?autoplay=1`;
        }
        iframe.src = embedUrl;
    } else {
        iframe.src = url;
    }
    modal.show();
    modal._element.addEventListener('hidden.bs.modal', () => { iframe.src = ''; });
}

// ============================================================
//  MATCH DETAILS (FULLY FIXED)
// ============================================================
let currentMatchInfo = null;
let matchLiveInterval = null;
let matchDataInterval = null;

async function openMatchDetails(matchId) {
    showLoading();
    try {
        const [infoRes, eventsRes, lineupRes, statsRes, h2hRes] = await Promise.all([
            fetchFromProxy(`${API_BASE}/matches/match_info/${matchId}/L/60`),
            fetchFromProxy(`${API_BASE}/matches/matches_event/${matchId}`).catch(() => ({ data: { events: [] } })),
            fetchFromProxy(`${API_BASE}/matches/matches_lineup/${matchId}`).catch(() => ({ data: {} })),
            fetchFromProxy(`${API_BASE}/matches/statics_match/${matchId}`).catch(() => ({ data: { statics: {} } })),
            fetchFromProxy(`${API_BASE}/matches/h2h/${matchId}/L/60`).catch(() => ({ data: {} }))
        ]);
        const info = infoRes.data;
        if (!info) { showError('Match info not available');
            hideLoading(); return; }
        const events = eventsRes.data?.events || [];
        const lineups = lineupRes.data || {};
        const stats = statsRes.data?.statics || {};
        const h2h = h2hRes.data || {};

        let standingsData = null;
        if (info.championship && info.championship.url_id) {
            try {
                const sData = await fetchFromProxy(
                    `${API_BASE}/matches/league_standing_stage/${info.championship.url_id}`);
                if (sData.data && sData.data.league && sData.data.league.stage0) standingsData = sData.data;
            } catch (e) {}
        }

        currentMatchInfo = info;
        renderMatchDetailsFull(info, events, lineups, stats, h2h, standingsData);
        document.getElementById('matchModalTitle').textContent = `${info.home_team.title} vs ${info.away_team.title}`;
        const modal = new bootstrap.Modal(document.getElementById('matchModal'));
        modal.show();

        if (info.status !== 14 && info.status !== 0) {
            startLiveMatchUpdates(matchId);
        }
        hideLoading();
    } catch (err) {
        console.error('Match details error:', err);
        showError('Failed to load match details');
        hideLoading();
    }
}

function startLiveMatchUpdates(matchId) {
    if (matchLiveInterval) clearInterval(matchLiveInterval);
    if (matchDataInterval) clearInterval(matchDataInterval);

    matchLiveInterval = setInterval(() => {
        if (!currentMatchInfo) return;
        const info = currentMatchInfo;
        const seconds = getLiveSeconds(info);
        const status = info.status !== undefined ? info.status : 1;
        const timer = formatLiveTimeRealtime(seconds, status, info.ex_time);
        const progress = getMatchProgress(seconds, status);

        const timerMain = document.querySelector('#matchModalBody .timer-main');
        if (timerMain) {
            if (status === 4) timerMain.textContent = 'FT';
            else if (status === 2) timerMain.textContent = timer.display;
            else timerMain.textContent = timer.display;
        }
        const stoppageEl = document.querySelector('#matchModalBody .timer-stoppage');
        if (stoppageEl) {
            if (timer.stoppage && status !== 4 && status !== 2) { stoppageEl.textContent = timer.stoppage;
                stoppageEl.style.display = 'inline-block'; } else { stoppageEl.style.display = 'none'; }
        }
        const periodEl = document.querySelector('#matchModalBody .match-period');
        if (periodEl) periodEl.textContent = getMatchPeriod(status);
        const fillEl = document.querySelector('#matchModalBody .timeline-fill-modal');
        if (fillEl) {
            if (status === 0 || status === 14) fillEl.style.width = '0%';
            else if (status === 4) fillEl.style.width = '100%';
            else fillEl.style.width = `${progress}%`;
        }
        const scoreEl = document.querySelector('#matchModalBody .match-score');
        if (scoreEl && info.home_scores !== undefined && info.away_scores !== undefined) {
            if (status !== 0 && status !== 14) {
                scoreEl.textContent = `${info.home_scores} - ${info.away_scores}`;
            }
        }
        const halfEl = document.querySelector('#matchModalBody .half-score');
        if (halfEl && info.fh_scores && info.fh_scores.length) {
            const h = info.fh_scores[0]?.home_scores || 0;
            const a = info.fh_scores[0]?.away_scores || 0;
            halfEl.textContent = `HT: ${h} - ${a}`;
        }
    }, 1000);

    matchDataInterval = setInterval(async () => {
        try {
            const url = `${API_BASE}/matches/match_info/${matchId}/L/60`;
            const data = await fetchFromProxy(url);
            if (data && data.data) {
                currentMatchInfo = data.data;
                const info = currentMatchInfo;
                const seconds = getLiveSeconds(info);
                const status = info.status !== undefined ? info.status : 1;
                const timer = formatLiveTimeRealtime(seconds, status, info.ex_time);
                const progress = getMatchProgress(seconds, status);

                const timerMain = document.querySelector('#matchModalBody .timer-main');
                if (timerMain) {
                    if (status === 4) timerMain.textContent = 'FT';
                    else if (status === 2) timerMain.textContent = timer.display;
                    else timerMain.textContent = timer.display;
                }
                const stoppageEl = document.querySelector('#matchModalBody .timer-stoppage');
                if (stoppageEl) {
                    if (timer.stoppage && status !== 4 && status !== 2) { stoppageEl.textContent = timer
                            .stoppage;
                        stoppageEl.style.display = 'inline-block'; } else { stoppageEl.style.display =
                        'none'; }
                }
                const periodEl = document.querySelector('#matchModalBody .match-period');
                if (periodEl) periodEl.textContent = getMatchPeriod(status);
                const fillEl = document.querySelector('#matchModalBody .timeline-fill-modal');
                if (fillEl) {
                    if (status === 0 || status === 14) fillEl.style.width = '0%';
                    else if (status === 4) fillEl.style.width = '100%';
                    else fillEl.style.width = `${progress}%`;
                }
                const scoreEl = document.querySelector('#matchModalBody .match-score');
                if (scoreEl) {
                    if (status !== 0 && status !== 14) {
                        scoreEl.textContent = `${info.home_scores || 0} - ${info.away_scores || 0}`;
                    }
                }
                const halfEl = document.querySelector('#matchModalBody .half-score');
                if (halfEl && info.fh_scores && info.fh_scores.length) {
                    const h = info.fh_scores[0]?.home_scores || 0;
                    const a = info.fh_scores[0]?.away_scores || 0;
                    halfEl.textContent = `HT: ${h} - ${a}`;
                }
            }
        } catch (e) { /* silent */ }
    }, 5000);

    document.getElementById('matchModal').addEventListener('hidden.bs.modal', function() {
        if (matchLiveInterval) { clearInterval(matchLiveInterval);
            matchLiveInterval = null; }
        if (matchDataInterval) { clearInterval(matchDataInterval);
            matchDataInterval = null; }
        currentMatchInfo = null;
    }, { once: true });
}

// ============================================================
//  HELPER: Get score at specific minute using period scores
// ============================================================
function getScoreAtMinute(info, minute) {
    let homeScore = 0,
        awayScore = 0;
    // First half (FH) - for minute <= 45
    if (info.fh_scores && info.fh_scores.length) {
        homeScore = parseInt(info.fh_scores[0].home_scores) || 0;
        awayScore = parseInt(info.fh_scores[0].away_scores) || 0;
    }
    // Second half (SH) - for minute > 45 and <= 90
    if (minute > 45 && info.sh_scores && info.sh_scores.length) {
        homeScore = parseInt(info.sh_scores[0].home_scores) || 0;
        awayScore = parseInt(info.sh_scores[0].away_scores) || 0;
    }
    // First extra time (FE) - for minute > 90 and <= 105
    if (minute > 90 && info.fe_scores && info.fe_scores.length) {
        homeScore = parseInt(info.fe_scores[0].home_scores) || 0;
        awayScore = parseInt(info.fe_scores[0].away_scores) || 0;
    }
    // Second extra time (SE) - for minute > 105 and <= 120
    if (minute > 105 && info.se_scores && info.se_scores.length) {
        homeScore = parseInt(info.se_scores[0].home_scores) || 0;
        awayScore = parseInt(info.se_scores[0].away_scores) || 0;
    }
    return { home: homeScore, away: awayScore };
}

// ============================================================
//  FULL MATCH DETAILS RENDER
// ============================================================
function renderMatchDetailsFull(info, events, lineups, stats, h2h, standingsData) {
    const body = document.getElementById('matchModalBody');
    const seconds = getLiveSeconds(info);
    const status = info.status !== undefined ? info.status : 1;
    const timer = formatLiveTimeRealtime(seconds, status, info.ex_time);
    const period = getMatchPeriod(status);
    const progress = getMatchProgress(seconds, status);
    const isPostponed = status === 14;
    const isUpcoming = status === 0;
    const isFinished = status === 4;
    const isHT = status === 2;

    let homeRedCard = false,
        awayRedCard = false;
    if (events && events.length) {
        events.forEach(ev => {
            if ((ev.type === 6 || ev.type === 4) && ev.team_id === info.home_team.row_id) homeRedCard =
            true;
            if ((ev.type === 6 || ev.type === 4) && ev.team_id === info.away_team.row_id) awayRedCard =
            true;
        });
    }

    let halfScoreHtml = '';
    if (info.fh_scores && info.fh_scores.length && !isUpcoming && !isPostponed) {
        const h = info.fh_scores[0]?.home_scores || 0;
        const a = info.fh_scores[0]?.away_scores || 0;
        halfScoreHtml = `<div class="half-score">HT: ${h} - ${a}</div>`;
    }

    let penaltyHtml = '',
        penaltySummary = '';
    if (info.match_penalties) {
        const hId = info.home_team.row_id,
            aId = info.away_team.row_id;
        const hP = info.match_penalties[hId] ? info.match_penalties[hId].filter(p => p.score === 1).length : 0;
        const aP = info.match_penalties[aId] ? info.match_penalties[aId].filter(p => p.score === 1).length : 0;
        penaltyHtml = `<div class="penalty-score">PK: ${hP} - ${aP}</div>`;
        penaltySummary = `
        <div class="penalty-shootout-summary">
            <div class="team-pk"><img src="${IMG_BASE_TEAM + info.home_team.image}" /><span>${info.home_team.title}</span></div>
            <span class="pk-score">${hP} - ${aP}</span>
            <div class="team-pk"><span>${info.away_team.title}</span><img src="${IMG_BASE_TEAM + info.away_team.image}" /></div>
        </div>`;
    }

    let videoHtml = '';
    if (info.video_links && info.video_links.length) {
        videoHtml = '<div class="video-highlights">';
        info.video_links.forEach(v => {
            if (v.video_link) {
                videoHtml +=
                    `<button class="video-link-btn" onclick="openHighlightPlayer('${v.video_link}','${info.home_team.title} vs ${info.away_team.title}')"><img src="${ICONS.video}" /> Highlights</button>`;
            }
        });
        videoHtml += '</div>';
    }

    const champ = info.championship || {};
    const dateTime = info.match_timestamp ? formatMatchLocalDateTime(info.match_timestamp) : (info.match_date +
        ' ' + info.match_time);

    let countdownHtml = '';
    if (isUpcoming && info.match_timestamp) {
        const ts = info.match_timestamp * 1000;
        const diff = Math.max(0, Math.floor((ts - Date.now()) / 1000));
        const h = Math.floor(diff / 3600),
            m = Math.floor((diff % 3600) / 60),
            s = diff % 60;
        const cd = h > 0 ? `${h}h ${m}m ${s}s` : (m > 0 ? `${m}m ${s}s` : `${s}s`);
        countdownHtml = `<span class="timer-main" id="modalCountdown" data-timestamp="${ts}">${cd}</span>`;
        setTimeout(() => {
            const el = document.getElementById('modalCountdown');
            if (el) { const ts2 = parseInt(el.dataset.timestamp);
                startCountdown(el, ts2); }
        }, 100);
    }

    const showScore = !isUpcoming && !isPostponed;
    const scoreDisplay = showScore ? `${info.home_scores || 0} - ${info.away_scores || 0}` : 'VS';

    let goalAlertHtml = '';
    if (info.score_time && !isUpcoming && !isPostponed) {
        try {
            const times = JSON.parse(info.score_time);
            const lastGoal = times[times.length - 1];
            if (lastGoal) {
                const goalMin = lastGoal['1'] || lastGoal['5'];
                if (goalMin) {
                    const now = Math.floor(Date.now() / 1000);
                    const goalTime = info.match_timestamp + goalMin * 60;
                    if (now - goalTime < 10) {
                        const scorer = lastGoal.player_name || 'Goal!';
                        goalAlertHtml = `<div class="goal-alert-modal">⚽ ${scorer}</div>`;
                    }
                }
            }
        } catch (e) {}
    }

    let periodDisplay = period;
    if (isPostponed) periodDisplay = 'Postponed';
    if (isUpcoming) periodDisplay = 'Upcoming';

    let timerMainText = '';
    if (isPostponed) {
        timerMainText = 'Postponed';
    } else if (isUpcoming) {
        timerMainText = countdownHtml;
    } else if (isFinished) {
        timerMainText = 'FT';
    } else if (isHT) {
        const totalMins = Math.floor(seconds / 60);
        const totalSecs = Math.floor(seconds % 60);
        timerMainText = `${totalMins}:${String(totalSecs).padStart(2,'0')}`;
    } else {
        const totalMins = Math.floor(seconds / 60);
        const totalSecs = Math.floor(seconds % 60);
        const timeStr = `${totalMins}:${String(totalSecs).padStart(2,'0')}`;
        timerMainText = `${timeStr}${timer.stoppage ? ` +${timer.stoppage}` : ''}`;
    }

    let headerHtml = `
    <div class="match-header">
        <div class="champ-badge">
            <img src="${champ.image ? IMG_BASE_CHAMP + champ.image : ICONS.cup}" onclick="quickSelectChampionship('${champ.url_id}','${(champ.title||'').replace(/'/g,"\\'")}',${champ.type||1})" />
            <span class="champ-title" onclick="quickSelectChampionship('${champ.url_id}','${(champ.title||'').replace(/'/g,"\\'")}',${champ.type||1})">${champ.title || 'N/A'}</span>
            <span class="match-meta"><span>|</span> ${info.round || ''} <span>|</span> ${dateTime}</span>
        </div>
        <div class="match-teams">
            <div class="match-team-side">
                ${homeRedCard ? '<div class="red-card-badge">RED</div>' : ''}
                <img src="${IMG_BASE_TEAM + info.home_team.image}" onclick="openTeamModal(${info.home_team.row_id})" />
                <span onclick="openTeamModal(${info.home_team.row_id})">${info.home_team.title}</span>
            </div>
            <div class="match-center-side">
                ${goalAlertHtml}
                <div class="match-score">${scoreDisplay}</div>
                ${halfScoreHtml}
                ${penaltyHtml}
                ${penaltySummary}
                <div class="match-timer-container">
                    <span class="timer-main">${timerMainText}</span>
                    ${timer.stoppage && !isPostponed && !isUpcoming && !isFinished && !isHT ? `<span class="timer-stoppage">${timer.stoppage}</span>` : ''}
                </div>
                <div class="match-period">${periodDisplay}</div>
                <div class="timeline-container">
                    <div class="timeline-fill timeline-fill-modal" style="width:${isPostponed || isUpcoming ? 0 : isFinished ? 100 : progress}%"></div>
                    ${status === 2 ? '<div class="ht-marker-modal"></div>' : ''}
                    ${getGoalMarkersModal(info)}
                </div>
                ${videoHtml}
            </div>
            <div class="match-team-side">
                ${awayRedCard ? '<div class="red-card-badge">RED</div>' : ''}
                <img src="${IMG_BASE_TEAM + info.away_team.image}" onclick="openTeamModal(${info.away_team.row_id})" />
                <span onclick="openTeamModal(${info.away_team.row_id})">${info.away_team.title}</span>
            </div>
        </div>
    </div>`;

    let standingsPreview = '';
    if (standingsData && standingsData.league && standingsData.league.stage0) {
        const teams = standingsData.league.stage0;
        const homeT = teams.find(t => t.team_id == info.home_team.row_id);
        const awayT = teams.find(t => t.team_id == info.away_team.row_id);
        if (homeT || awayT) {
            standingsPreview =
                `<div class="row g-2 mt-2 mb-2" style="font-size:calc(12px*var(--font-scale));">`;
            if (homeT) {
                const rank = teams.indexOf(homeT) + 1;
                standingsPreview += `
                <div class="col-6" style="background:var(--highlight-bg);border-radius:8px;padding:10px 12px;border-left:3px solid var(--highlight-border);">
                    <strong>${info.home_team.title}</strong>
                    <div style="color:var(--primary);font-weight:700;">#${rank} | ${homeT.points} pts</div>
                    <div class="text-muted" style="font-size:calc(10px*var(--font-scale));">${homeT.play} matches</div>
                </div>`;
            } else { standingsPreview += `<div class="col-6"></div>`; }
            if (awayT) {
                const rank = teams.indexOf(awayT) + 1;
                standingsPreview += `
                <div class="col-6" style="background:var(--highlight-bg);border-radius:8px;padding:10px 12px;border-left:3px solid var(--highlight-border);">
                    <strong>${info.away_team.title}</strong>
                    <div style="color:var(--primary);font-weight:700;">#${rank} | ${awayT.points} pts</div>
                    <div class="text-muted" style="font-size:calc(10px*var(--font-scale));">${awayT.play} matches</div>
                </div>`;
            }
            standingsPreview += '</div>';
        }
    }

    // ===== EVENTS =====
    let eventsHtml = '<div class="event-box">';
    if (events && events.length && !isUpcoming && !isPostponed) {
        const special = events.filter(ev => ev.type === 100);
        const normal = events.filter(ev => ev.type !== 100);
        normal.sort((a, b) => (a.time_minute || 0) - (b.time_minute || 0) || ((a.time_plus || 0) - (b.time_plus ||
        0)));

        const firstHalf = normal.filter(e => (e.time_minute || 0) <= 45);
        const secondHalf = normal.filter(e => (e.time_minute || 0) > 45 && (e.time_minute || 0) <= 90);
        const extraTime1 = normal.filter(e => (e.time_minute || 0) > 90 && (e.time_minute || 0) <= 105);
        const extraTime2 = normal.filter(e => (e.time_minute || 0) > 105 && (e.time_minute || 0) <= 120);
        const penaltyEvents = normal.filter(e => (e.time_minute || 0) > 120);

        const kickOff = special.find(ev => ev.status === 1);
        const halfTime = special.find(ev => ev.status === 2);
        const fullTime = special.find(ev => ev.status === 3);
        const etHalf = special.find(ev => ev.status === 5);
        const etFull = special.find(ev => ev.status === 7);
        const etStart1 = special.find(ev => ev.status === 8);
        const etStart2 = special.find(ev => ev.status === 9);
        const penStart = special.find(ev => ev.status === 10);

        function renderEventGroup(list) {
            let g = '';
            list.forEach(ev => { g += renderSingleEventWithIcon(ev, info); });
            return g;
        }

        function renderPenaltyShootoutDetail(info) {
            if (!info.match_penalties) return '';
            let html = '<div class="penalty-shootout-detail"><div class="penalty-title">⚽ Penalty Shootout</div>';
            const hId = info.home_team.row_id,
                aId = info.away_team.row_id;
            const hPens = info.match_penalties[hId] || [];
            const aPens = info.match_penalties[aId] || [];
            const maxLen = Math.max(hPens.length, aPens.length);

            for (let i = 0; i < maxLen; i++) {
                const h = hPens[i] || null;
                const a = aPens[i] || null;
                const hResult = h ? (h.score === 1 ? '✅' : '❌') : '—';
                const aResult = a ? (a.score === 1 ? '✅' : '❌') : '—';
                const hName = h ? h.player_name?.title || 'Unknown' : '';
                const aName = a ? a.player_name?.title || 'Unknown' : '';
                const hIdP = h ? h.player_id : null;
                const aIdP = a ? a.player_id : null;
                html += `
                <div class="penalty-event-row">
                    <span style="font-weight:700;color:var(--secondary);">${i+1}.</span>
                    <span class="penalty-team-logo"><img src="${IMG_BASE_TEAM + info.home_team.image}" style="width:20px;height:20px;object-fit:contain;" /></span>
                    <span class="penalty-player" onclick="${hIdP ? `openPlayerModal(${hIdP})` : ''}">${hName}</span>
                    <span class="penalty-result ${h && h.score === 1 ? 'scored' : 'missed'}">${hResult}</span>
                    <span style="color:var(--secondary);">vs</span>
                    <span class="penalty-result ${a && a.score === 1 ? 'scored' : 'missed'}">${aResult}</span>
                    <span class="penalty-player" onclick="${aIdP ? `openPlayerModal(${aIdP})` : ''}">${aName}</span>
                    <span class="penalty-team-logo"><img src="${IMG_BASE_TEAM + info.away_team.image}" style="width:20px;height:20px;object-fit:contain;" /></span>
                </div>`;
            }
            html += '</div>';
            return html;
        }

        let orderedHtml = '';

        if (kickOff) orderedHtml +=
            `<div class="fulltime-divider"><img src="${ICONS.whistle}" style="width:18px;height:18px;" /> Kick-Off</div>`;

        if (firstHalf.length) {
            orderedHtml += renderEventGroup(firstHalf);
        }

        if (halfTime) {
            const score = getScoreAtMinute(info, 45);
            orderedHtml += `
                <div class="halftime-divider">
                    <img src="${ICONS.clock}" style="width:18px;height:18px;" />
                    <span class="ht-score">${score.home} - ${score.away}</span><br />Half Time
                </div>`;
        }

        if (secondHalf.length) {
            orderedHtml += renderEventGroup(secondHalf);
        }

        if (fullTime) {
            const score = getScoreAtMinute(info, 90);
            orderedHtml += `
                <div class="fulltime-divider">
                    <img src="${ICONS.whistle}" style="width:18px;height:18px;" />
                    Full-Time (${score.home} - ${score.away})
                </div>`;
        }

        if (etStart1 || etHalf) {
            const score = getScoreAtMinute(info, 90);
            orderedHtml += `
                <div class="halftime-divider" style="background:#fff8e1;border-color:#ffc107;">
                    <img src="${ICONS.clock}" style="width:18px;height:18px;" />
                    <span class="ht-score">${score.home} - ${score.away}</span><br />First Half ET
                </div>`;
            if (extraTime1.length) {
                orderedHtml += renderEventGroup(extraTime1);
            }
        }

        if (etStart2 || etFull) {
            const score = getScoreAtMinute(info, 105);
            orderedHtml += `
                <div class="halftime-divider" style="background:#fff8e1;border-color:#ffc107;">
                    <img src="${ICONS.clock}" style="width:18px;height:18px;" />
                    <span class="ht-score">${score.home} - ${score.away}</span><br />Second Half ET
                </div>`;
            if (extraTime2.length) {
                orderedHtml += renderEventGroup(extraTime2);
            }
        }

        if (penStart) {
            let hP = 0,
                aP = 0;
            if (info.match_penalties) {
                hP = info.match_penalties[info.home_team.row_id] ? info.match_penalties[info.home_team.row_id]
                    .filter(p => p.score === 1).length : 0;
                aP = info.match_penalties[info.away_team.row_id] ? info.match_penalties[info.away_team.row_id]
                    .filter(p => p.score === 1).length : 0;
            }
            orderedHtml += `
                <div class="fulltime-divider penalty">
                    <img src="${ICONS.penaltyKick}" style="width:18px;height:18px;" />
                    Penalty Shootout (${hP} - ${aP})
                </div>`;
            orderedHtml += renderPenaltyShootoutDetail(info);
            if (penaltyEvents.length) {
                orderedHtml += renderEventGroup(penaltyEvents);
            }
        }

        eventsHtml += orderedHtml;
    } else if (isUpcoming) {
        eventsHtml = '<p class="text-center text-muted" style="font-size:calc(14px*var(--font-scale));">Match not started yet</p>';
    } else if (isPostponed) {
        eventsHtml = '<p class="text-center text-muted" style="font-size:calc(14px*var(--font-scale));">Match postponed</p>';
    } else {
        eventsHtml = '<p class="text-center text-muted" style="font-size:calc(14px*var(--font-scale));">No events recorded</p>';
    }
    eventsHtml += '</div>';

    // ===== LINEUPS (Pitch View with background) =====
    let lineupHtml = '<p class="text-center text-muted" style="font-size:calc(14px*var(--font-scale));">Lineups not available</p>';
    if (lineups.lineup && !isUpcoming && !isPostponed) {
        const homeLineup = lineups.lineup[info.home_team.row_id];
        const awayLineup = lineups.lineup[info.away_team.row_id];
        const homeCoach = lineups['0']?.home_coach || info.home_coach;
        const awayCoach = lineups['0']?.away_coach || info.away_coach;
        const homeInjured = lineups.lineup_injureds ? lineups.lineup_injureds[info.home_team.row_id] : [];
        const awayInjured = lineups.lineup_injureds ? lineups.lineup_injureds[info.away_team.row_id] : [];
        const homeSubs = homeLineup ? homeLineup.substitutions || [] : [];
        const awaySubs = awayLineup ? awayLineup.substitutions || [] : [];
        const homeFormation = lineups['0']?.home_formation || '4-3-3';
        const awayFormation = lineups['0']?.away_formation || '4-3-3';

        if (homeLineup && awayLineup) {
            function buildPitchView(players, team, formation, subs, injured, coach) {
                const gk = players.filter(p => p.position === 'G' || p.position === 'GK');
                const def = players.filter(p => p.position === 'D' || p.position === 'LB' || p.position === 'RB' ||
                    p.position === 'CB');
                const mid = players.filter(p => p.position === 'M' || p.position === 'CDM' || p.position === 'CM' ||
                    p.position === 'CAM' || p.position === 'LM' || p.position === 'RM');
                const fwd = players.filter(p => p.position === 'F' || p.position === 'LW' || p.position === 'RW' ||
                    p.position === 'CF' || p.position === 'SS');

                const sortByPos = (a, b) => (a.formation_position || 0) - (b.formation_position || 0);
                gk.sort(sortByPos);
                def.sort(sortByPos);
                mid.sort(sortByPos);
                fwd.sort(sortByPos);

                function playerCard(p) {
                    const img = p.player.image ? IMG_BASE_PLAYER + p.player.image :
                        'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'30\' height=\'30\' viewBox=\'0 0 30 30\'%3E%3Crect width=\'30\' height=\'30\' fill=\'%23ddd\'/%3E%3Ctext x=\'5\' y=\'20\' font-family=\'sans-serif\' font-size=\'14\' fill=\'%23999\'%3E?%3C/text%3E%3C/svg%3E';
                    const number = p.player.player_number || '';
                    const rating = p.rating || '';
                    const name = p.player.title || 'Unknown';
                    const playerId = p.player.row_id;
                    let iconsHtml = '';
                    if (p.yellow) iconsHtml +=
                        `<img src="${ICONS.yellowCard}" style="width:10px;height:10px;" title="Yellow Card" />`;
                    if (p.red) iconsHtml +=
                        `<img src="${ICONS.redCard}" style="width:10px;height:10px;" title="Red Card" />`;
                    if (p.goal) iconsHtml +=
                        `<img src="${ICONS.goal}" style="width:10px;height:10px;" title="Goal" />`;
                    if (p.assist) iconsHtml +=
                        `<img src="${ICONS.assist}" style="width:10px;height:10px;" title="Assist" />`;
                    if (p.own_goal) iconsHtml +=
                        `<img src="${ICONS.ownGoal}" style="width:10px;height:10px;" title="Own Goal" />`;
                    if (p.captain) iconsHtml +=
                        `<span class="captain-badge" style="width:9px;height:9px;background:gold;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:5px;font-weight:900;color:#000;border:1px solid #fff;">C</span>`;
                    return `
                    <div class="pitch-player" onclick="openPlayerModal(${playerId})">
                        <div class="player-avatar">
                            <img src="${img}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'30\' height=\'30\' viewBox=\'0 0 30 30\'%3E%3Crect width=\'30\' height=\'30\' fill=\'%23ddd\'/%3E%3Ctext x=\'5\' y=\'20\' font-family=\'sans-serif\' font-size=\'14\' fill=\'%23999\'%3E?%3C/text%3E%3C/svg%3E'" />
                            ${number ? `<div class="player-number">${number}</div>` : ''}
                            ${iconsHtml ? `<div class="player-icons">${iconsHtml}</div>` : ''}
                        </div>
                        <div class="player-name">${name}</div>
                        ${rating ? `<div class="player-rating">${rating}</div>` : ''}
                    </div>`;
                }

                function renderRow(players, rowClass) {
                    if (!players || players.length === 0) return '';
                    let html = `<div class="${rowClass}">`;
                    if (rowClass === 'row-gk') {
                        html += `<div style="display:flex;justify-content:center;width:100%;">`;
                        players.forEach(p => { html += playerCard(p); });
                        html += `</div>`;
                    } else {
                        players.forEach(p => {
                            html += `<div style="flex:1;display:flex;justify-content:center;">${playerCard(p)}</div>`;
                        });
                    }
                    html += `</div>`;
                    return html;
                }

                let pitchHtml = `
                <div class="pitch-container">
                    <div class="pitch-team-name">
                        <img src="${IMG_BASE_TEAM + team.image}" onclick="openTeamModal(${team.row_id})" />
                        ${team.title} <span class="formation">(${formation})</span>
                    </div>
                    <div class="pitch-grid">
                        ${renderRow(gk, 'row-gk')}
                        ${renderRow(def, 'row-def')}
                        ${renderRow(mid, 'row-mid')}
                        ${renderRow(fwd, 'row-fwd')}
                    </div>
                `;

                let extrasHtml = '<div class="pitch-extras">';

                if (coach) {
                    const img = coach.image ? IMG_BASE_COACH + coach.image :
                        'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'%3E%3Crect width=\'32\' height=\'32\' fill=\'%23ddd\'/%3E%3Ctext x=\'5\' y=\'20\' font-family=\'sans-serif\' font-size=\'12\' fill=\'%23999\'%3E?%3C/text%3E%3C/svg%3E';
                    extrasHtml += `
                    <div class="coach-section" onclick="openCoachModal(${coach.id})">
                        <img src="${img}" class="coach-avatar" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'%3E%3Crect width=\'32\' height=\'32\' fill=\'%23ddd\'/%3E%3Ctext x=\'5\' y=\'20\' font-family=\'sans-serif\' font-size=\'12\' fill=\'%23999\'%3E?%3C/text%3E%3C/svg%3E'" />
                        <span class="coach-name">${coach.title}</span>
                    </div>`;
                }

                if (subs && subs.length) {
                    extrasHtml += `<div class="subs-section"><div class="subs-title">Substitutions</div>`;
                    subs.forEach(sub => {
                        const player = sub.player;
                        const replaced = sub.player_lineup ? sub.player_lineup.title : '';
                        const time = sub.substitute_time ? `${sub.substitute_time}'` : '';
                        const img = player.image ? IMG_BASE_PLAYER + player.image :
                            'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'18\' height=\'18\' viewBox=\'0 0 18 18\'%3E%3Crect width=\'18\' height=\'18\' fill=\'%23ddd\'/%3E%3Ctext x=\'3\' y=\'12\' font-family=\'sans-serif\' font-size=\'10\' fill=\'%23999\'%3E?%3C/text%3E%3C/svg%3E';
                        const playerId = player.row_id;
                        extrasHtml += `
                        <div class="sub-item">
                            <span>${time}</span>
                            <img src="${img}" onclick="event.stopPropagation();openPlayerModal(${playerId})" />
                            <span onclick="event.stopPropagation();openPlayerModal(${playerId})">${player.title}</span>
                            ${replaced ? `<span class="sub-arrow">→ ${replaced}</span>` : ''}
                        </div>`;
                    });
                    extrasHtml += `</div>`;
                }

                if (injured && injured.length) {
                    extrasHtml += `<div class="injuries-section"><div class="injuries-title">⚠️ Missing Players</div>`;
                    injured.forEach(inj => {
                        const player = inj.player;
                        const type = inj.type_name || 'Injury';
                        const img = player.image ? IMG_BASE_PLAYER + player.image :
                            'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'18\' height=\'18\' viewBox=\'0 0 18 18\'%3E%3Crect width=\'18\' height=\'18\' fill=\'%23ddd\'/%3E%3Ctext x=\'3\' y=\'12\' font-family=\'sans-serif\' font-size=\'10\' fill=\'%23999\'%3E?%3C/text%3E%3C/svg%3E';
                        const playerId = player.row_id;
                        extrasHtml += `
                        <div class="injury-item">
                            <img src="${img}" onclick="event.stopPropagation();openPlayerModal(${playerId})" />
                            <span onclick="event.stopPropagation();openPlayerModal(${playerId})">${player.title}</span>
                            <span class="injury-type">- ${type}</span>
                        </div>`;
                    });
                    extrasHtml += `</div>`;
                }

                extrasHtml += '</div>';
                pitchHtml += extrasHtml;
                pitchHtml += `</div>`;
                return pitchHtml;
            }

            const homePlayers = homeLineup.lineup || [];
            const awayPlayers = awayLineup.lineup || [];

            lineupHtml = `
            <div>
                <div class="pitch-lineup-tabs">
                    <button class="pitch-tab active" onclick="switchPitchTab(this,'pitch-home','pitch-away')">
                        <img src="${IMG_BASE_TEAM + info.home_team.image}" style="width:20px;height:20px;object-fit:contain;" />
                        ${info.home_team.title}
                    </button>
                    <button class="pitch-tab" onclick="switchPitchTab(this,'pitch-away','pitch-home')">
                        <img src="${IMG_BASE_TEAM + info.away_team.image}" style="width:20px;height:20px;object-fit:contain;" />
                        ${info.away_team.title}
                    </button>
                </div>
                <div id="pitch-home">
                    ${buildPitchView(homePlayers, info.home_team, homeFormation, homeSubs, homeInjured, homeCoach)}
                </div>
                <div id="pitch-away" style="display:none;">
                    ${buildPitchView(awayPlayers, info.away_team, awayFormation, awaySubs, awayInjured, awayCoach)}
                </div>
            </div>
            <script>
                function switchPitchTab(btn, showId, hideId) {
                    document.querySelectorAll('.pitch-tab').forEach(t => t.classList.remove('active'));
                    btn.classList.add('active');
                    document.getElementById(showId).style.display = 'block';
                    document.getElementById(hideId).style.display = 'none';
                }
            <\/script>
            `;
        }
    } else if (isUpcoming) {
        lineupHtml = '<p class="text-center text-muted" style="font-size:calc(14px*var(--font-scale));">Lineups not available before match</p>';
    } else if (isPostponed) {
        lineupHtml = '<p class="text-center text-muted" style="font-size:calc(14px*var(--font-scale));">Match postponed</p>';
    }

    // ===== STATISTICS =====
    let statsHtml = '<p class="text-center text-muted" style="font-size:calc(14px*var(--font-scale));">No statistics available</p>';
    if (stats && Object.keys(stats).length && !isUpcoming && !isPostponed) {
        const homeStats = stats[info.home_team.row_id] || {};
        const awayStats = stats[info.away_team.row_id] || {};
        const homePoss = parseInt(homeStats.ball_possession) || 50;
        const awayPoss = parseInt(awayStats.ball_possession) || 50;
        const totalPoss = homePoss + awayPoss;
        const homePct = totalPoss > 0 ? Math.round((homePoss / totalPoss) * 100) : 50;
        const awayPct = totalPoss > 0 ? Math.round((awayPoss / totalPoss) * 100) : 50;

        let sHtml = `<div class="stats-container">
            <div class="possession-section">
                <div class="possession-labels">
                    <span class="home-pos">${info.home_team.title} ${homePct}%</span>
                    <span class="away-pos">${info.away_team.title} ${awayPct}%</span>
                </div>
                <div class="possession-bar-wrap">
                    <div class="home-bar" style="width:${homePct}%;"></div>
                    <div class="away-bar" style="width:${awayPct}%;"></div>
                </div>
            </div>
            <div class="stats-grid">`;

        const statFields = [
            { key: 'total_shots', label: 'Total Shots' },
            { key: 'shots_on_goal', label: 'Shots On Goal' },
            { key: 'fouls', label: 'Fouls' },
            { key: 'corner_kicks', label: 'Corner Kicks' },
            { key: 'yellow_cards', label: 'Yellow Cards' },
            { key: 'red_cards', label: 'Red Cards' },
            { key: 'shots_off_goal', label: 'Shots Off Goal' },
            { key: 'blocked_shots', label: 'Blocked Shots' },
            { key: 'shots_insidebox', label: 'Shots Inside Box' },
            { key: 'shots_outsidebox', label: 'Shots Outside Box' },
            { key: 'goalkeeper_saves', label: 'Goalkeeper Saves' },
            { key: 'total_passes', label: 'Total Passes' },
            { key: 'passes_percentage', label: 'Passes %' },
            { key: 'throwin', label: 'Throw-in' },
            { key: 'cross_ball', label: 'Cross Ball' },
            { key: 'goalkick', label: 'Goal Kick' },
            { key: 'freekick', label: 'Free Kick' },
            { key: 'offsides', label: 'Offsides' }
        ];

        statFields.forEach(field => {
            const hVal = homeStats[field.key] !== undefined ? homeStats[field.key] : '-';
            const aVal = awayStats[field.key] !== undefined ? awayStats[field.key] : '-';
            if (hVal === '-' && aVal === '-') return;
            sHtml += `
                <div class="stat-item">
                    <span class="stat-label">${field.label}</span>
                    <span class="stat-values">
                        <span class="home-val">${hVal}</span>
                        <span style="color:var(--secondary);">-</span>
                        <span class="away-val">${aVal}</span>
                    </span>
                </div>`;
        });

        sHtml += `</div></div>`;
        statsHtml = sHtml;
    } else if (isPostponed) {
        statsHtml =
        '<p class="text-center text-muted" style="font-size:calc(14px*var(--font-scale));">Match postponed - no statistics available</p>';
    } else if (isUpcoming) {
        statsHtml = '<p class="text-center text-muted" style="font-size:calc(14px*var(--font-scale));">Match not started yet</p>';
    }

    // ===== H2H =====
    let h2hHtml = '<p class="text-center text-muted" style="font-size:calc(14px*var(--font-scale));">No H2H data</p>';
    if (h2h && Object.keys(h2h).length) {
        let hW = 0,
            d = 0,
            aW = 0;
        for (const id in h2h) {
            const m = h2h[id];
            if (m && m.win === 'win1') hW++;
            else if (m && m.win === 'win2') aW++;
            else if (m) d++;
        }
        h2hHtml = `<div class="h2h-flex">
            <div class="h2h-team"><img src="${IMG_BASE_TEAM + info.home_team.image}" onclick="openTeamModal(${info.home_team.row_id})" /><span>${info.home_team.title}</span></div>
            <div class="h2h-center"><div class="h2h-stat"><span class="num">${hW}</span><span class="lbl">Wins</span></div>
            <div class="h2h-stat"><span class="num">${d}</span><span class="lbl">Draws</span></div>
            <div class="h2h-stat"><span class="num">${aW}</span><span class="lbl">Wins</span></div></div>
            <div class="h2h-team"><img src="${IMG_BASE_TEAM + info.away_team.image}" onclick="openTeamModal(${info.away_team.row_id})" /><span>${info.away_team.title}</span></div>
        </div>`;
        const recent = Object.values(h2h).filter(m => m && m.home_team && m.away_team).slice(0, 5);
        if (recent.length) {
            h2hHtml += '<div class="mt-2"><strong>Recent Meetings</strong><div class="small">';
            recent.forEach(m => {
                h2hHtml +=
                    `<div class="d-flex justify-content-between border-bottom py-1"><span>${m.home_team.title} ${m.home_scores} - ${m.away_scores} ${m.away_team.title}</span><span class="text-muted">${m.match_date || ''}</span></div>`;
            });
            h2hHtml += '</div></div>';
        }
    }

    // ===== STANDINGS FULL =====
    let fullStandingsHtml = '<p class="text-center text-muted" style="font-size:calc(14px*var(--font-scale));">No standings data</p>';
    if (standingsData && standingsData.league && standingsData.league.stage0) {
        const teams = standingsData.league.stage0;
        const colors = standingsData.color ? standingsData.color.stage0 : [];
        const rules = standingsData.rules_list ? standingsData.rules_list.stage0 : [];
        const highlightIds = [info.home_team.row_id, info.away_team.row_id];
        fullStandingsHtml = renderStandingsTable(teams, highlightIds, colors, rules);
    }

    // ===== TABS =====
    let tabsHtml = `
    <div class="match-detail-tabs-wrapper">
        <ul class="nav nav-tabs match-modal-tabs" id="matchModalTabs" role="tablist">
            <li class="nav-item"><button class="nav-link active" id="events-tab" data-bs-toggle="tab" data-bs-target="#md-events" type="button" role="tab">Events</button></li>
            <li class="nav-item"><button class="nav-link" id="details-tab" data-bs-toggle="tab" data-bs-target="#md-details" type="button" role="tab">Details</button></li>
            <li class="nav-item"><button class="nav-link" id="lineup-tab-modal" data-bs-toggle="tab" data-bs-target="#md-lineup" type="button" role="tab">Lineups</button></li>
            <li class="nav-item"><button class="nav-link" id="stats-tab-modal" data-bs-toggle="tab" data-bs-target="#md-stats" type="button" role="tab">Stats</button></li>
            <li class="nav-item"><button class="nav-link" id="h2h-tab" data-bs-toggle="tab" data-bs-target="#md-h2h" type="button" role="tab">H2H</button></li>
            <li class="nav-item"><button class="nav-link" id="standings-tab-modal" data-bs-toggle="tab" data-bs-target="#md-standings" type="button" role="tab">Standings</button></li>
        </ul>
        <div class="tab-content match-modal-tab-content" id="matchModalTabContent">
            <div class="tab-pane fade show active" id="md-events" role="tabpanel">${eventsHtml}</div>
            <div class="tab-pane fade" id="md-details" role="tabpanel">${renderDetailsTab(info, standingsData)}</div>
            <div class="tab-pane fade" id="md-lineup" role="tabpanel">${lineupHtml}</div>
            <div class="tab-pane fade" id="md-stats" role="tabpanel">${statsHtml}</div>
            <div class="tab-pane fade" id="md-h2h" role="tabpanel">${h2hHtml}</div>
            <div class="tab-pane fade" id="md-standings" role="tabpanel">${fullStandingsHtml}</div>
        </div>
    </div>`;

    body.innerHTML = headerHtml + standingsPreview + tabsHtml;

    document.querySelectorAll('#matchModalTabs button[data-bs-toggle="tab"]').forEach(btn => {
        btn.addEventListener('click', function(e) { e.preventDefault();
            new bootstrap.Tab(this).show(); });
    });
}

// ===== SINGLE EVENT RENDER =====
function renderSingleEventWithIcon(ev, info) {
    const isHome = ev.team_id == info.home_team.row_id;
    const isAway = ev.team_id == info.away_team.row_id;
    let left = '',
        right = '';
    if (isHome) left =
        `<div class="event-side event-side-left"><img src="${IMG_BASE_TEAM + info.home_team.image}" onclick="openTeamModal(${info.home_team.row_id})" /></div>`;
    else if (isAway) right =
        `<div class="event-side event-side-right"><img src="${IMG_BASE_TEAM + info.away_team.image}" onclick="openTeamModal(${info.away_team.row_id})" /></div>`;

    const evType = ev.type || 0;
    const evStatus = ev.status || 0;
    const iconUrl = getEventIcon(evType, evStatus);
    const typeText = getEventTypeLabel(evType, evStatus);

    let videoBtn = '';
    if (ev.event_video) videoBtn =
        `<a href="${ev.event_video}" target="_blank" class="ms-1"><img src="${ICONS.video}" class="event-icon-img" style="cursor:pointer;" /></a>`;

    let playerHtml = '',
        subHtml = '';
    if (evType === 8) {
        const out = ev.assist_player_name ? ev.assist_player_name.title : '';
        const inn = ev.player_name ? ev.player_name.title : '';
        const playerId = ev.player && ev.player.row_id ? ev.player.row_id : null;
        const assistId = ev.assist_player && ev.assist_player.row_id ? ev.assist_player.row_id : null;
        playerHtml =
            `<span class="in-arrow">&#8594;</span> <span class="player-name-click" onclick="${playerId ? `openPlayerModal(${playerId})` : ''}">${inn}</span>`;
        subHtml =
            `<span class="out-arrow">&#8592;</span> <span class="player-name-click" onclick="${assistId ? `openPlayerModal(${assistId})` : ''}">${out}</span>`;
    } else {
        const name = ev.player_name ? ev.player_name.title : '';
        const playerId = ev.player && ev.player.row_id ? ev.player.row_id : null;
        playerHtml =
            `<span class="player-name-click" onclick="${playerId ? `openPlayerModal(${playerId})` : ''}">${name || typeText}</span>`;
        subHtml = ev.assist_player_name ? `<span>Assist: ${ev.assist_player_name.title}</span>` : '';
    }

    const min = ev.time_minute || 0;
    let periodLabel = '';
    if (min > 90 && min <= 105) periodLabel = 'ET1';
    else if (min > 105 && min <= 120) periodLabel = 'ET2';
    else if (min > 120) periodLabel = 'PEN';
    const plus = ev.time_plus && ev.time_plus > 0 ? `+${ev.time_plus}` : '';

    let bg = '#e8f5e9',
        color = '#2e7d32';
    if (evType === 2 || evType === 3) { bg = '#fff3e0';
        color = '#e65100'; }
    if (evType === 6 || evType === 4) { bg = '#fce4ec';
        color = '#c62828'; }
    if (evType === 1 || evType === 5 || evType === 13) { bg = '#e3f2fd';
        color = '#0d47a1'; }
    if (evType === 8) { bg = '#f3e5f5';
        color = '#4a148c'; }
    if (periodLabel === 'ET1' || periodLabel === 'ET2') { bg = '#fff8e1';
        color = '#f57f17'; }
    if (periodLabel === 'PEN') { bg = '#fce4ec';
        color = '#c62828'; }
    if (evType === 11) { bg = '#fce4ec';
        color = '#c62828'; }
    if (evType === 12) { bg = '#e3f2fd';
        color = '#0d47a1'; }
    if (evType === 22) { bg = '#fff8e1';
        color = '#f57f17'; }

    return `
    <div class="event-row">
        ${left}
        <div class="event-time-cell">
            <div class="event-time-circle" style="background:${bg};color:${color};">
                ${plus ? `<span class="time-extra">${plus}</span>` : ''}
                <span class="time-main">${min}'</span>
                ${periodLabel ? `<span class="time-period">${periodLabel}</span>` : ''}
            </div>
        </div>
        <div class="event-info-center">
            <div class="event-player">
                <img src="${iconUrl}" class="event-icon-img" />
                ${playerHtml}
                ${videoBtn}
            </div>
            ${subHtml ? `<div class="event-sub">${subHtml}</div>` : ''}
        </div>
        ${right}
    </div>`;
}

// ===== DETAILS TAB =====
function renderDetailsTab(info, standingsData) {
    let html = '<div class="mt-2">';
    html +=
        `<div class="detail-card"><div class="detail-row"><strong>🏆 Competition</strong><span class="clickable-text" onclick="quickSelectChampionship('${info.championship?.url_id}','${(info.championship?.title||'').replace(/'/g,"\\'")}',${info.championship?.type||1})">${info.championship ? info.championship.title : 'N/A'}</span></div></div>`;
    html +=
        `<div class="detail-card"><div class="detail-row"><strong>📅 Round</strong><span>${info.round || 'N/A'}</span></div></div>`;
    html +=
        `<div class="detail-card"><div class="detail-row"><strong>🏟️ Stadium</strong><span>${info.Stadium || 'N/A'}</span></div></div>`;
    if (info.channel_commm && info.channel_commm.length) {
        info.channel_commm.forEach(c => {
            html +=
                `<div class="detail-card"><div class="detail-row"><strong>📺 Channel</strong><span>${c.channel_name}</span></div></div>`;
        });
    }
    if (info.referees) {
        const ref = info.referees;
        html +=
            `<div class="detail-card"><div class="detail-row"><strong>👨‍⚖️ Referee</strong><span class="clickable-text" onclick="openRefereeModal(${ref.id})">${ref.title}</span></div></div>`;
    }
    const dt = info.match_timestamp ? formatMatchLocalDateTime(info.match_timestamp) : (info.match_date + ' ' +
        info.match_time);
    html +=
        `<div class="detail-card"><div class="detail-row"><strong>⏰ Date & Time</strong><span>${dt}</span></div></div>`;
    if (info.return) html +=
        `<div class="detail-card"><div class="detail-row"><strong>Aggregate</strong><span>${info.return}</span></div></div>`;
    if (info.status === 14) {
        html +=
            `<div class="detail-card"><div class="detail-row"><strong>Status</strong><span style="color:#ff6b35;font-weight:700;">Postponed</span></div></div>`;
        if (info.comment) {
            html +=
                `<div class="detail-card"><div class="detail-row"><strong>Reason</strong><span>${info.comment}</span></div></div>`;
        }
    }
    if (standingsData && standingsData.league && standingsData.league.stage0) {
        const teams = standingsData.league.stage0;
        const homeT = teams.find(t => t.team_id == info.home_team.row_id);
        const awayT = teams.find(t => t.team_id == info.away_team.row_id);
        if (homeT || awayT) {
            html += '<div class="detail-card"><div class="detail-row"><strong>📊 League Position</strong></div>';
            if (homeT) {
                const rank = teams.indexOf(homeT) + 1;
                html +=
                    `<div class="detail-row"><span>${info.home_team.title}</span><span>#${rank} | ${homeT.points} pts</span></div>`;
            }
            if (awayT) {
                const rank = teams.indexOf(awayT) + 1;
                html +=
                    `<div class="detail-row"><span>${info.away_team.title}</span><span>#${rank} | ${awayT.points} pts</span></div>`;
            }
            html += '</div>';
        }
    }
    html += '</div>';
    return html;
}

// ===== STANDINGS TABLE RENDER =====
function renderStandingsTable(teams, highlightIds, colors, rules) {
    if (!Array.isArray(highlightIds)) highlightIds = highlightIds ? [highlightIds] : [];
    let html =
        '<div class="standings-wrap"><table class="standings-table"><thead><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr></thead><tbody>';
    teams.forEach((team, idx) => {
        const info = team.team_name;
        const isH = highlightIds.includes(info.row_id);
        const cls = isH ? 'highlight-row' : '';
        const color = team.color || '';
        const bar = color ? `<span class="color-bar" style="background:${color};"></span>` : '';
        html += `<tr class="${cls}">
            <td class="pos">${idx+1}</td>
            <td style="text-align:left;">
                <div class="team-cell">
                    ${bar}
                    <img src="${IMG_BASE_TEAM + info.image}" onclick="openTeamModal(${info.row_id})" />
                    <span class="team-name" onclick="openTeamModal(${info.row_id})">${info.title}</span>
                </div>
            </td>
            <td>${team.play}</td><td>${team.wins}</td><td>${team.draw}</td><td>${team.lose}</td>
            <td>${team.for}</td><td>${team.against}</td><td>${team.diff}</td><td class="pts">${team.points}</td>
        </tr>`;
    });
    html += '</tbody></table></div>';
    if (colors && colors.length) {
        html += '<div class="standings-key">';
        colors.forEach(c => {
            if (c.color) {
                const label = c.league_to || c.group_name || 'Qualification';
                html +=
                    `<div class="key-item"><span class="color-box" style="background:${c.color};"></span> ${label}</div>`;
            }
        });
        html += '</div>';
    }
    if (rules && rules.length) {
        html += '<div class="standings-rules"><strong>Rules</strong><ol>';
        rules.forEach(r => html += `<li>${r}</li>`);
        html += '</ol></div>';
    }
    return html;
}

function getPositionFullName(pos) {
    const map = {
        'G': 'Goalkeeper',
        'D': 'Defender',
        'M': 'Midfielder',
        'F': 'Forward',
        'GK': 'Goalkeeper',
        'CB': 'Centre Back',
        'LB': 'Left Back',
        'RB': 'Right Back',
        'CDM': 'Defensive Midfielder',
        'CM': 'Central Midfielder',
        'CAM': 'Attacking Midfielder',
        'LM': 'Left Midfielder',
        'RM': 'Right Midfielder',
        'LW': 'Left Winger',
        'RW': 'Right Winger',
        'CF': 'Centre Forward',
        'SS': 'Second Striker',
        'AM': 'Attacking Midfielder',
        'DM': 'Defensive Midfielder'
    };
    return map[pos] || pos || 'Unknown';
}

// ============================================================
//  MORE CONTENT
// ============================================================
function loadMoreContent() {
    if (!currentChampionship) return;
    loadStandings();
    loadScorers(1);
    loadAssists(1);
    loadNews(1);
    loadBracket();
}

async function loadStandings() {
    const container = document.getElementById('moreStandingsContent');
    container.innerHTML = '<div class="spinner-border spinner-border-sm"></div> Loading...';
    try {
        let url;
        if (currentChampionship.type === 1) url =
            `${API_BASE}/matches/league_standing_stage/${currentChampionship.url_id}`;
        else url = `${API_BASE}/matches/cups_teams_standings/${currentChampionship.url_id}/L/60`;
        const data = await fetchFromProxy(url);
        if (data.data && data.data.league && data.data.league.stage0) {
            const colors = data.data.color ? data.data.color.stage0 : [];
            const rules = data.data.rules_list ? data.data.rules_list.stage0 : [];
            container.innerHTML = renderStandingsTable(data.data.league.stage0, null, colors, rules);
        } else if (data.data && data.data.standings && data.data.standings.groups) {
            let html = '';
            for (const name in data.data.standings.groups) {
                html += `<h5 class="mt-2">Group ${name}</h5>`;
                html += renderStandingsTable(data.data.standings.groups[name]);
            }
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p>No standings data</p>';
        }
    } catch (err) { container.innerHTML = '<div class="alert alert-danger">Failed to load standings</div>'; }
}

async function loadScorers(page) {
    if (!currentChampionship || scorersLoading) return;
    scorersLoading = true;
    const container = document.getElementById('moreScorersContent');
    try {
        const url = `${API_BASE}/matches/league_scorers_map/${currentChampionship.url_id}?page=${page}`;
        const data = await fetchFromProxy(url);
        const items = data.data.data || [];
        if (page === 1) container.innerHTML = renderPlayersList(items, 'goals');
        else {
            const existing = container.querySelector('ul');
            if (existing) existing.insertAdjacentHTML('beforeend', renderPlayersList(items, 'goals').replace(
                '<ul class="list-group">', '').replace('</ul>', ''));
            else container.innerHTML = renderPlayersList(items, 'goals');
        }
        scorersNextUrl = data.data.next_page_url || null;
        if (!scorersObserver) {
            scorersObserver = setupInfiniteScroll('moreScorersSentinel', () => {
                if (scorersNextUrl && !scorersLoading) {
                    const next = new URL(scorersNextUrl).searchParams.get('page');
                    loadScorers(parseInt(next));
                }
            });
        }
    } catch (err) { console.error(err); if (page === 1) container.innerHTML =
            '<div class="alert alert-danger">Failed to load top scorers</div>'; } finally { scorersLoading =
            false; }
}

async function loadAssists(page) {
    if (!currentChampionship || assistsLoading) return;
    assistsLoading = true;
    const container = document.getElementById('moreAssistsContent');
    try {
        const url = `${API_BASE}/matches/league_assists_map/${currentChampionship.url_id}?page=${page}`;
        const data = await fetchFromProxy(url);
        const items = data.data.data || [];
        if (page === 1) container.innerHTML = renderPlayersList(items, 'assist');
        else {
            const existing = container.querySelector('ul');
            if (existing) existing.insertAdjacentHTML('beforeend', renderPlayersList(items, 'assist').replace(
                '<ul class="list-group">', '').replace('</ul>', ''));
            else container.innerHTML = renderPlayersList(items, 'assist');
        }
        assistsNextUrl = data.data.next_page_url || null;
        if (!assistsObserver) {
            assistsObserver = setupInfiniteScroll('moreAssistsSentinel', () => {
                if (assistsNextUrl && !assistsLoading) {
                    const next = new URL(assistsNextUrl).searchParams.get('page');
                    loadAssists(parseInt(next));
                }
            });
        }
    } catch (err) { console.error(err); if (page === 1) container.innerHTML =
            '<div class="alert alert-danger">Failed to load assists</div>'; } finally { assistsLoading = false; }
}

function renderPlayersList(players, type) {
    let html = '<ul class="list-group">';
    players.forEach(p => {
        const info = p.player_info;
        const val = type === 'goals' ? p.goals : p.assist;
        html += `<li class="list-group-item d-flex justify-content-between align-items-center" style="font-size:calc(13px*var(--font-scale));">
            <div class="d-flex align-items-center">
                <img src="${IMG_BASE_PLAYER + info.image}" style="width:26px;height:26px;object-fit:cover;border-radius:50%;margin-right:10px;" onclick="openPlayerModal(${info.id})" onerror="this.style.display='none'" />
                <span onclick="openPlayerModal(${info.id})" style="cursor:pointer;">${info.title}</span>
                <small class="text-muted ms-2">(${info.team_name})</small>
            </div>
            <span class="badge bg-primary rounded-pill">${val}</span>
        </li>`;
    });
    html += '</ul>';
    return html;
}

async function loadNews(page) {
    if (!currentChampionship || newsLoading) return;
    newsLoading = true;
    const container = document.getElementById('moreNewsContent');
    try {
        const url = `${NEWS_BASE}/News/news_league/${currentChampionship.url_id}?page=${page}`;
        const data = await fetchFromProxy(url);
        const items = data.data.data || [];
        if (page === 1) container.innerHTML = renderNewsList(items);
        else container.insertAdjacentHTML('beforeend', renderNewsList(items));
        newsNextUrl = data.data.next_page_url || null;
        if (!newsObserver) {
            newsObserver = setupInfiniteScroll('moreNewsSentinel', () => {
                if (newsNextUrl && !newsLoading) {
                    const next = new URL(newsNextUrl).searchParams.get('page');
                    loadNews(parseInt(next));
                }
            });
        }
    } catch (err) { console.error(err); if (page === 1) container.innerHTML =
            '<div class="alert alert-danger">Failed to load news</div>'; } finally { newsLoading = false; }
}

function renderNewsList(items) {
    let html = '<div class="row g-3">';
    items.forEach(item => {
        html += `<div class="col-12 col-md-6 col-lg-4">
            <div class="card news-card h-100" data-news-id="${item.id}" onclick="openNewsModal(${item.id})" style="cursor:pointer;border-radius:var(--border-radius);">
                <img src="https://imgs.ysscores.com/news/350/${item.image}" class="card-img-top" alt="${item.title}" onerror="this.style.display='none'" />
                <div class="card-body" style="padding:12px;">
                    <h6 style="font-size:calc(14px*var(--font-scale));font-weight:700;">${item.title}</h6>
                    <p class="card-text small text-muted">${item.news_desc || ''}</p>
                    <span class="text-muted small">${item.created_at?.date || ''}</span>
                </div>
            </div>
        </div>`;
    });
    html += '</div>';
    return html;
}

async function loadBracket() {
    const container = document.getElementById('moreBracketContent');
    if (!currentChampionship) { container.innerHTML = '<p>No championship selected</p>'; return; }
    try {
        const url = `${API_BASE}/matches/cups_teams_standings/${currentChampionship.url_id}/L/60`;
        const data = await fetchFromProxy(url);
        if (data.data && (data.data.map || data.data.lot)) {
            let html = '';
            if (data.data.lot && data.data.lot.length) {
                html += '<h5 class="mt-2">Playoffs</h5>';
                data.data.lot.forEach(m => {
                    const winner = m.winTeam ? (m.teamA.row_id == m.winTeam ? m.teamA.title : m.teamB
                        .title) : 'Unknown';
                    html +=
                        `<div style="padding:4px 0;border-bottom:1px solid var(--border-color);"><span onclick="openTeamModal(${m.teamA.row_id})" style="cursor:pointer;">${m.teamA.title}</span> vs <span onclick="openTeamModal(${m.teamB.row_id})" style="cursor:pointer;">${m.teamB.title}</span> (Winner: ${winner})</div>`;
                });
            }
            if (data.data.map && data.data.map.length) {
                html += '<h5 class="mt-3">Knockout Bracket</h5>';
                data.data.map.forEach(m => {
                    html +=
                        `<div style="padding:4px 0;border-bottom:1px solid var(--border-color);"><span onclick="openTeamModal(${m.teamA.row_id})" style="cursor:pointer;">${m.teamA.title}</span> (${m.teamA_score}) - (${m.teamB_score}) <span onclick="openTeamModal(${m.teamB.row_id})" style="cursor:pointer;">${m.teamB.title}</span><br /><small style="color:var(--secondary);">${m.round_name}</small></div>`;
                });
            }
            container.innerHTML = html || '<p>No bracket data</p>';
        } else container.innerHTML = '<p>No bracket data</p>';
    } catch (err) { container.innerHTML = '<div class="alert alert-danger">Failed to load bracket</div>'; }
}

function setupInfiniteScroll(sentinelId, loadMore) {
    const sentinel = document.getElementById(sentinelId);
    if (!sentinel) return null;
    if (window.IntersectionObserver) {
        const obs = new IntersectionObserver(entries => { if (entries[0].isIntersecting) loadMore(); }, {
            rootMargin: '200px' });
        obs.observe(sentinel);
        return obs;
    } else {
        window.addEventListener('scroll', () => {
            const rect = sentinel.getBoundingClientRect();
            if (rect.top < window.innerHeight) loadMore();
        });
        return null;
    }
}

// ============================================================
//  MODALS
// ============================================================
async function openTeamModal(id) {
    try {
        const url = `${API_BASE}/info/team_info/${id}/L/60`;
        const data = await fetchFromProxy(url);
        if (data && data.data) {
            const info = data.data;
            const body = document.getElementById('teamModalBody');
            let matchesHtml = '';
            try {
                const matchesUrl = `${API_BASE}/matches/team_matches/${id}/L/60`;
                const matchesData = await fetchFromProxy(matchesUrl);
                if (matchesData && matchesData.data && matchesData.data.coming) {
                    const coming = matchesData.data.coming.data || [];
                    const end = matchesData.data.end.data || [];
                    if (coming.length || end.length) {
                        matchesHtml =
                            '<h6 class="mt-3">Matches</h6><div style="max-height:200px;overflow-y:auto;">';
                        if (coming.length) {
                            matchesHtml += '<strong>Upcoming</strong>';
                            coming.slice(0, 5).forEach(m => {
                                const home = m.home_team.title;
                                const away = m.away_team.title;
                                const date = m.match_date || '';
                                const time = m.match_time || '';
                                matchesHtml +=
                                    `<div style="font-size:calc(12px*var(--font-scale));padding:3px 0;border-bottom:1px solid var(--border-color);">${home} vs ${away} - ${date} ${time}</div>`;
                            });
                        }
                        if (end.length) {
                            matchesHtml += '<strong class="mt-2">Recent</strong>';
                            end.slice(0, 5).forEach(m => {
                                const home = m.home_team.title;
                                const away = m.away_team.title;
                                const score = `${m.home_scores} - ${m.away_scores}`;
                                const date = m.match_date || '';
                                matchesHtml +=
                                    `<div style="font-size:calc(12px*var(--font-scale));padding:3px 0;border-bottom:1px solid var(--border-color);">${home} ${score} ${away} - ${date}</div>`;
                            });
                        }
                        matchesHtml += '</div>';
                    }
                }
            } catch (e) {}
            body.innerHTML = `
                <div class="d-flex align-items-center mb-3">
                    <img src="${IMG_BASE_TEAM + info.image}" style="width:64px;height:64px;object-fit:contain;margin-right:16px;" />
                    <div>
                        <h4>${info.title}</h4>
                        <p class="text-muted">${info.full_title || ''}</p>
                    </div>
                </div>
                <p><strong>Country:</strong> ${info.country ? info.country.title : 'N/A'}</p>
                <p><strong>Stadium:</strong> ${info.stadium_name || 'N/A'}</p>
                <p><strong>World Ranking:</strong> ${info.world_ranking || 'N/A'}</p>
                ${info.about ? `<p>${info.about}</p>` : ''}
                ${matchesHtml}
            `;
            document.getElementById('teamModalTitle').textContent = info.title;
            const modal = new bootstrap.Modal(document.getElementById('teamModal'));
            modal.show();
        } else {
            alert('Team info not available');
        }
    } catch (e) { alert('Failed to load team info'); }
}

async function openPlayerModal(id) {
    try {
        const url = `${API_BASE}/info/player_info/${id}/L/60`;
        const data = await fetchFromProxy(url);
        if (data && data.data) {
            const info = data.data;
            const body = document.getElementById('playerModalBody');
            let statsHtml = '';
            if (info.player_statistics && info.player_statistics.length > 0) {
                const s = info.player_statistics[0];
                statsHtml = `
                    <div class="row mt-3 text-center">
                        <div class="col-4"><strong style="font-size:calc(18px*var(--font-scale));">${s.appearances || 0}</strong><br /><span class="text-muted">Apps</span></div>
                        <div class="col-4"><strong style="font-size:calc(18px*var(--font-scale));">${s.goals || 0}</strong><br /><span class="text-muted">Goals</span></div>
                        <div class="col-4"><strong style="font-size:calc(18px*var(--font-scale));">${s.assist || 0}</strong><br /><span class="text-muted">Assists</span></div>
                    </div>
                    <div class="row mt-2 text-center">
                        <div class="col-4"><strong>${s.yellow_cards || 0}</strong><br /><span class="text-muted">YC</span></div>
                        <div class="col-4"><strong>${s.red_cards || 0}</strong><br /><span class="text-muted">RC</span></div>
                        <div class="col-4"><strong>${s.mvp || 0}</strong><br /><span class="text-muted">MVP</span></div>
                    </div>
                `;
            }
            let transferHtml = '';
            if (info.transfers && info.transfers.length > 0) {
                transferHtml = '<h6 class="mt-3">Transfers</h6><div style="font-size:calc(12px*var(--font-scale));">';
                info.transfers.slice(0, 10).forEach(t => {
                    const to = t.team_in?.title || 'Unknown';
                    const from = t.team_out?.title || '';
                    const value = t.value || 'Undisclosed';
                    const date = t.date_from || '';
                    const type = t.trans || 'Transfer';
                    transferHtml +=
                        `<div style="padding:3px 0;border-bottom:1px solid var(--border-color);">${type} ${from ? from + ' → ' : ''}${to} ${value} (${date})</div>`;
                });
                transferHtml += '</div>';
            }
            body.innerHTML = `
                <div class="d-flex align-items-center mb-3">
                    <img src="${IMG_BASE_PLAYER + info.image}" style="width:64px;height:64px;object-fit:cover;border-radius:50%;margin-right:16px;" />
                    <div>
                        <h4>${info.title}</h4>
                        <p class="text-muted">${info.team_name ? info.team_name.title : 'Free Agent'}</p>
                        <p class="text-muted">${getPositionFullName(info.position)} | Age: ${info.age || 'N/A'} | Height: ${info.height || 'N/A'}cm | Foot: ${info.foot || 'N/A'}</p>
                    </div>
                </div>
                ${statsHtml}
                ${transferHtml}
                ${info.about ? `<p class="mt-3">${info.about}</p>` : ''}
            `;
            document.getElementById('playerModalTitle').textContent = info.title;
            const modal = new bootstrap.Modal(document.getElementById('playerModal'));
            modal.show();
        } else {
            alert('Player info not available');
        }
    } catch (e) { alert('Failed to load player info'); }
}

async function openCoachModal(id) {
    try {
        const url = `${API_BASE}/info/coach_info/${id}`;
        const data = await fetchFromProxy(url);
        if (data && data.data) {
            const info = data.data;
            const body = document.getElementById('coachModalBody');
            let teamsHtml = '';
            if (info.teams_c && info.teams_c.length > 0) {
                teamsHtml = '<h6 class="mt-3">Coaching Career</h6><div style="font-size:calc(12px*var(--font-scale));">';
                info.teams_c.forEach(t => {
                    const team = t.team?.title || 'Unknown';
                    const from = t.from || '';
                    const to = t.to || '';
                    const type = t.type || '';
                    teamsHtml +=
                        `<div style="padding:3px 0;border-bottom:1px solid var(--border-color);">${team} (${from} - ${to}) ${type}</div>`;
                });
                teamsHtml += '</div>';
            }
            body.innerHTML = `
                <div class="d-flex align-items-center mb-3">
                    <img src="${IMG_BASE_COACH + info.image}" style="width:64px;height:64px;object-fit:cover;border-radius:50%;margin-right:16px;" />
                    <div>
                        <h4>${info.title}</h4>
                        <p class="text-muted">${info.country ? info.country.title : ''}</p>
                    </div>
                </div>
                <p><strong>Birth Date:</strong> ${info.birth_date || 'N/A'} (${info.birth_day || ''})</p>
                ${teamsHtml}
            `;
            document.getElementById('coachModalTitle').textContent = info.title;
            const modal = new bootstrap.Modal(document.getElementById('coachModal'));
            modal.show();
        } else {
            alert('Coach info not available');
        }
    } catch (e) { alert('Failed to load coach info'); }
}

async function openRefereeModal(id) {
    try {
        const url = `${API_BASE}/info/referee_info/${id}/L/60`;
        const data = await fetchFromProxy(url);
        if (data && data.data) {
            const info = data.data;
            const body = document.getElementById('refereeModalBody');
            body.innerHTML = `
                <div class="d-flex align-items-center mb-3">
                    <img src="${IMG_BASE_REFEREE + info.image}" style="width:64px;height:64px;object-fit:cover;border-radius:50%;margin-right:16px;" />
                    <div>
                        <h4>${info.title}</h4>
                        <p class="text-muted">${info.country ? info.country.title : ''}</p>
                    </div>
                </div>
                <p><strong>Gender:</strong> ${info.gender || 'N/A'}</p>
                <p><strong>Type:</strong> ${info.referee_type || 'N/A'}</p>
                ${info.birth_date ? `<p><strong>Birth Date:</strong> ${info.birth_date}</p>` : ''}
            `;
            document.getElementById('refereeModalTitle').textContent = info.title;
            const modal = new bootstrap.Modal(document.getElementById('refereeModal'));
            modal.show();
        } else {
            alert('Referee info not available');
        }
    } catch (e) { alert('Failed to load referee info'); }
}

async function openNewsModal(id) {
    try {
        const url = `${NEWS_BASE}/News/news_detail/${id}`;
        const data = await fetchFromProxy(url);
        if (data && data.data) {
            const info = data.data;
            const body = document.getElementById('newsModalBody');
            body.innerHTML = `
                <h4>${info.title}</h4>
                <p class="text-muted">${info.created_at?.date || ''} | ❤️ ${info.likes_count || 0}</p>
                <img src="https://imgs.ysscores.com/news/820/${info.image}" class="img-fluid mb-3" onerror="this.style.display='none'" />
                <div style="font-size:calc(14px*var(--font-scale));">${info.full_news || info.news_desc || ''}</div>
            `;
            document.getElementById('newsModalTitle').textContent = info.title;
            const modal = new bootstrap.Modal(document.getElementById('newsModal'));
            modal.show();
        } else {
            alert('News not available');
        }
    } catch (e) { alert('Failed to load news'); }
}

// ============================================================
//  TRANSFERS PAGE
// ============================================================
async function loadTransfersPage() {
    const container = document.getElementById('transfersContainer');
    container.innerHTML =
        `<iframe src="https://zi-store.online/i.html" style="width:100%;height:70vh;border:none;border-radius:12px;"></iframe>`;
}

// ============================================================
//  SCROLL PROGRESS
// ============================================================
function initScrollProgress() {
    const el = document.getElementById('scrollProgress');
    const circle = document.getElementById('progressCircle');
    const arrow = document.getElementById('scrollArrow');
    const circ = 2 * Math.PI * 20;

    function update() {
        const top = window.pageYOffset || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        const progress = height > 0 ? Math.min(1, top / height) : 0;
        circle.style.strokeDashoffset = circ * (1 - progress);
        const atTop = top < 50,
            atBottom = top > height - 50;
        if (atTop) { arrow.textContent = '↓';
            arrow.className = 'arrow-icon down'; } else if (atBottom) { arrow.textContent = '↑';
            arrow.className = 'arrow-icon up'; } else { arrow.textContent = '↓';
            arrow.className = 'arrow-icon'; }
    }
    el.addEventListener('click', () => {
        const top = window.pageYOffset || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        if (top < 50) window.scrollTo({ top: height, behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) { window.requestAnimationFrame(() => { update();
                ticking = false; });
            ticking = true; }
    });
    update();
}

document.addEventListener('hidden.bs.modal', function(e) {
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
});

// ============================================================
//  FILTER BAR & FAVORITES
// ============================================================
document.querySelectorAll('.filter-bar .filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-bar .filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        renderLiveAndToday();
    });
});
document.getElementById('favoriteToggleHeader').addEventListener('click', function() {
    this.classList.toggle('active');
    const btns = document.querySelectorAll('.filter-bar .filter-btn');
    if (this.classList.contains('active')) {
        btns.forEach(b => b.classList.remove('active'));
        document.querySelector('.filter-bar .filter-btn[data-filter="favorites"]')?.classList.add('active');
        currentFilter = 'favorites';
    } else {
        btns.forEach(b => b.classList.remove('active'));
        document.querySelector('.filter-bar .filter-btn[data-filter="all"]')?.classList.add('active');
        currentFilter = 'all';
    }
    renderLiveAndToday();
});

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
            else if (page === 'more') { /* already loaded */ } else if (page === 'matches')
                renderAllMatches();
            else if (page === 'live') renderLiveAndToday();
        }
        currentPage = page;
    });
});

// ============================================================
//  LIVE UPDATE INTERVALS
// ============================================================
function startLiveUpdates() {
    if (liveUpdateInterval) clearInterval(liveUpdateInterval);
    if (todayUpdateInterval) clearInterval(todayUpdateInterval);
    liveUpdateInterval = setInterval(() => loadLiveMatches(), 3000);
    todayUpdateInterval = setInterval(() => { loadTodayMatches();
        loadHighlights(); }, 60000);
}

// ============================================================
//  INIT
// ============================================================
(async function init() {
    loadTheme();
    initLanguage();
    updateDateUI();
    await loadChampionships();
    await loadLiveAndTodayMatches();
    await loadHighlights();
    await loadTransfersPage();
    startLiveUpdates();
    initScrollProgress();
    document.querySelector('.bottom-nav .nav-item[data-page="live"]')?.click();

    window.toggleFavorite = toggleFavorite;
    window.openTeamModal = openTeamModal;
    window.openPlayerModal = openPlayerModal;
    window.openCoachModal = openCoachModal;
    window.openRefereeModal = openRefereeModal;
    window.openNewsModal = openNewsModal;
    window.openMatchDetails = openMatchDetails;
    window.quickSelectChampionship = quickSelectChampionship;
    window.openStreamPlayer = openStreamPlayer;
    window.openHighlightPlayer = openHighlightPlayer;
    window.toggleTheme = toggleTheme;
    window.changeCalMonth = changeCalMonth;
    window.selectCalDate = selectCalDate;
    window.applyCalendarFilter = applyCalendarFilter;

    window.switchPitchTab = function(btn, showId, hideId) {
        document.querySelectorAll('.pitch-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        const show = document.getElementById(showId);
        const hide = document.getElementById(hideId);
        if (show) show.style.display = 'block';
        if (hide) hide.style.display = 'none';
    };
})();

function formatMatchLocalDateTime(ts) {
    if (!ts) return 'N/A';
    const date = new Date(ts * 1000);
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${hours}:${mins} ${ampm}`;
}

function formatMatchLocalTime(ts) {
    if (!ts) return 'N/A';
    const date = new Date(ts * 1000);
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${mins} ${ampm}`;
}

function formatMatchLocalDate(ts) {
    if (!ts) return 'N/A';
    const date = new Date(ts * 1000);
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

console.log('Football Center fully restored with all fixes:');
console.log('- Score at Half-Time, Full-Time, ET now displays correctly using fh_scores, sh_scores, fe_scores, se_scores');
console.log('- Larger font size throughout the site');
console.log('- Statistics: clean grid layout with possession bar, all stats fields');
console.log('- Lineups: players on pitch with background, coach/subs/injuries outside pitch');
console.log('- Status bar: upcoming shows countdown, live shows time, FT shows only FT badge no time');
console.log('- Fixed duplicate HT/FT display');
console.log('- Penalty shootout with scored/missed indicators');
console.log('- Stream matching improved with partial name matching');
console.log('- All data from API displayed correctly like the app.');
