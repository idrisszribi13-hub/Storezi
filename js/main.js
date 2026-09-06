// ============================================================
// main.js - نقطة البداية للتطبيق
// ============================================================

// استيراد الدوال من الموديولات
import { 
    loadChampionships, loadLiveMatches, loadTodayMatches, loadStreamEvents, 
    getStandings, getScorers, getAssists, getNews, getBracket, 
    getMatchDetails, getStandingsForMatch, getTeamInfo, getPlayerInfo, 
    getCoachInfo, getRefereeInfo, getNewsDetail, fetchHighlightsForMatch, 
    performSearch 
} from './api.js';

import { 
    setFontScale, setCurrentLang, setCurrentChampionship, toggleFavorite, 
    isFavorite, setChampionships, setLiveMatches, setTodayMatches, 
    setSelectedDate, setCalViewDate, setSelectedCalDate, 
    currentLang, fontScale, favorites, currentChampionship, liveMatches, 
    todayMatches, streamEvents, championshipsList, currentFilter 
} from './state.js';

import { 
    fetchFromProxy, getLocalDateStr, formatMatchLocalDateTime, 
    formatMatchLocalTime, formatMatchLocalDate, findStreamEvent, 
    startCountdown, showLoading, hideLoading 
} from './utils.js';

import { 
    renderLiveMatchCard, renderUpcomingFinishedCard, renderLiveAndToday, 
    renderAllMatches, renderStandingsTable, renderPlayersList, 
    renderMatchDetailsFull, renderSingleEventWithIcon, renderHighlights, 
    renderSearchResults, renderNewsList, openTeamModal, openPlayerModal, 
    openCoachModal, openRefereeModal, openNewsModal, openMatchDetails, 
    openHighlightPlayer, renderCalendar 
} from './components.js';

import { translations, LANG_API_BASE, LANG_NEWS_BASE, ICONS, IMG_BASE_TEAM, IMG_BASE_CHAMP } from './config.js';

// ============================================================
//  إعدادات الخط
// ============================================================
document.getElementById('fontIncrease').addEventListener('click', () => setFontScale(fontScale + 0.05));
document.getElementById('fontDecrease').addEventListener('click', () => setFontScale(fontScale - 0.05));
const savedFont = parseFloat(localStorage.getItem('fontScale'));
if (savedFont && !isNaN(savedFont)) setFontScale(savedFont);

// ============================================================
//  الثيم (الوضع الليلي/النهاري)
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
//  اللغة
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
    // تحديث روابط API حسب اللغة
    if (LANG_API_BASE[lang]) {
        // يمكن تحديث متغير API_BASE هنا إذا كان قابلاً للتغيير
        // لكن في حالتنا API_BASE ثابت في config.js، لذا سنستخدمه كما هو.
    }
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
//  المفضلة والفلاتر
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

// عند النقر على زر المفضلة في الهيدر
document.getElementById('favoriteToggleHeader').addEventListener('click', function() {
    this.classList.toggle('active');
    const btns = document.querySelectorAll('.filter-bar .filter-btn');
    if (this.classList.contains('active')) {
        btns.forEach(b => b.classList.remove('active'));
        document.querySelector('.filter-bar .filter-btn[data-filter="favorites"]')?.classList.add('active');
        currentFilter = 'favorites'; // لا يمكن تغيير const، لكن currentFilter مُصدَّر من state كمتغير let، لذا نستخدم دالة setter إذا وجدت. سنضيف setter في state.
    } else {
        btns.forEach(b => b.classList.remove('active'));
        document.querySelector('.filter-bar .filter-btn[data-filter="all"]')?.classList.add('active');
        currentFilter = 'all';
    }
    renderLiveAndToday(liveMatches, todayMatches);
});

// فلاتر أسفل
document.querySelectorAll('.filter-bar .filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-bar .filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        renderLiveAndToday(liveMatches, todayMatches);
    });
});

// ============================================================
//  التنقل بين التواريخ
// ============================================================
function updateDateUI() {
    const todayStr = getLocalDateStr(new Date());
    const label = document.getElementById('dateLabel');
    if (getLocalDateStr(selectedDate) === todayStr) label.textContent = 'Today';
    else label.textContent = selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function changeDate(offset) {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + offset);
    setSelectedDate(newDate);
    updateDateUI();
    loadTodayMatches();
    loadHighlights();
}

document.getElementById('prevDateBtn').addEventListener('click', () => changeDate(-1));
document.getElementById('nextDateBtn').addEventListener('click', () => changeDate(1));
document.getElementById('openCalendarBtn').addEventListener('click', () => {
    const now = new Date();
    setCalViewDate(now);
    setSelectedCalDate(now);
    renderCalendar(calViewDate, selectedCalDate);
    new bootstrap.Modal(document.getElementById('calendarModal')).show();
});

// ============================================================
//  البحث
// ============================================================
const searchInput = document.getElementById('headerSearchInput');
const searchDropdown = document.getElementById('searchResultsDropdown');

searchInput.addEventListener('input', function() {
    const q = this.value.trim();
    if (q.length < 2) { searchDropdown.classList.remove('active'); return; }
    performSearchAndRender(q);
});

searchInput.addEventListener('focus', function() {
    if (this.value.trim().length >= 2) searchDropdown.classList.add('active');
});

document.addEventListener('click', function(e) {
    if (!e.target.closest('.header-search')) searchDropdown.classList.remove('active');
});

async function performSearchAndRender(query) {
    try {
        const results = await performSearch(query);
        searchDropdown.innerHTML = renderSearchResults(results, query);
        searchDropdown.classList.add('active');
    } catch (err) {
        console.error('Search error:', err);
        searchDropdown.innerHTML = '<div class="no-results">Search failed</div>';
        searchDropdown.classList.add('active');
    }
}

// ============================================================
//  البطولات (Championships)
// ============================================================
async function populateChampDropdown() {
    const container = document.getElementById('champList');
    container.innerHTML = '';
    const list = championshipsList;
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
        item.innerHTML = `<img src="${img}" style="width:22px;height:22px;margin-right:10px;object-fit:contain;" /> <span>${champ.title}</span>`;
        item.addEventListener('click', function(e) { e.preventDefault(); selectChampionship(this); });
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
    setCurrentChampionship({ url_id: id, type, title, standings, cups });
    document.getElementById('more-bracket-item').style.display = (type === 4 || (type === 2 && cups)) ? '' : 'none';
    loadMoreContent();
}

function quickSelectChampionship(url_id, title, type) {
    setCurrentChampionship({ url_id, type, title, standings: 1, cups: (type === 4 ? 1 : null) });
    document.getElementById('selectedChampId').value = url_id;
    document.getElementById('selectedChampText').innerHTML =
        `<span class="d-flex align-items-center">${title}</span>`;
    document.getElementById('more-bracket-item').style.display = (type === 4) ? '' : 'none';
    loadMoreContent();
}

// ============================================================
//  محتوى صفحة "المزيد"
// ============================================================
async function loadMoreContent() {
    if (!currentChampionship) return;
    await loadStandings();
    await loadScorers(1);
    await loadAssists(1);
    await loadNews(1);
    await loadBracket();
}

async function loadStandings() {
    const container = document.getElementById('moreStandingsContent');
    container.innerHTML = '<div class="spinner-border spinner-border-sm"></div> Loading...';
    try {
        const data = await getStandings(currentChampionship);
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
    const container = document.getElementById('moreScorersContent');
    try {
        const data = await getScorers(currentChampionship, page);
        const items = data.data.data || [];
        if (page === 1) container.innerHTML = renderPlayersList(items, 'goals');
        else {
            const existing = container.querySelector('ul');
            if (existing) existing.insertAdjacentHTML('beforeend', renderPlayersList(items, 'goals').replace('<ul class="list-group">', '').replace('</ul>', ''));
            else container.innerHTML = renderPlayersList(items, 'goals');
        }
        // مراقبة التمرير لتحميل المزيد
        setupInfiniteScroll('moreScorersSentinel', () => {
            if (data.data.next_page_url) {
                const next = new URL(data.data.next_page_url).searchParams.get('page');
                loadScorers(parseInt(next));
            }
        });
    } catch (err) { if (page === 1) container.innerHTML = '<div class="alert alert-danger">Failed to load top scorers</div>'; }
}

async function loadAssists(page) {
    const container = document.getElementById('moreAssistsContent');
    try {
        const data = await getAssists(currentChampionship, page);
        const items = data.data.data || [];
        if (page === 1) container.innerHTML = renderPlayersList(items, 'assist');
        else {
            const existing = container.querySelector('ul');
            if (existing) existing.insertAdjacentHTML('beforeend', renderPlayersList(items, 'assist').replace('<ul class="list-group">', '').replace('</ul>', ''));
            else container.innerHTML = renderPlayersList(items, 'assist');
        }
        setupInfiniteScroll('moreAssistsSentinel', () => {
            if (data.data.next_page_url) {
                const next = new URL(data.data.next_page_url).searchParams.get('page');
                loadAssists(parseInt(next));
            }
        });
    } catch (err) { if (page === 1) container.innerHTML = '<div class="alert alert-danger">Failed to load assists</div>'; }
}

async function loadNews(page) {
    const container = document.getElementById('moreNewsContent');
    try {
        const data = await getNews(currentChampionship, page);
        const items = data.data.data || [];
        if (page === 1) container.innerHTML = renderNewsList(items);
        else container.insertAdjacentHTML('beforeend', renderNewsList(items));
        setupInfiniteScroll('moreNewsSentinel', () => {
            if (data.data.next_page_url) {
                const next = new URL(data.data.next_page_url).searchParams.get('page');
                loadNews(parseInt(next));
            }
        });
    } catch (err) { if (page === 1) container.innerHTML = '<div class="alert alert-danger">Failed to load news</div>'; }
}

async function loadBracket() {
    const container = document.getElementById('moreBracketContent');
    if (!currentChampionship) { container.innerHTML = '<p>No championship selected</p>'; return; }
    try {
        const data = await getBracket(currentChampionship);
        if (data.data && (data.data.map || data.data.lot)) {
            let html = '';
            if (data.data.lot && data.data.lot.length) {
                html += '<h5 class="mt-2">Playoffs</h5>';
                data.data.lot.forEach(m => {
                    const winner = m.winTeam ? (m.teamA.row_id == m.winTeam ? m.teamA.title : m.teamB.title) : 'Unknown';
                    html += `<div style="padding:4px 0;border-bottom:1px solid var(--border-color);"><span onclick="window.openTeamModal(${m.teamA.row_id})" style="cursor:pointer;">${m.teamA.title}</span> vs <span onclick="window.openTeamModal(${m.teamB.row_id})" style="cursor:pointer;">${m.teamB.title}</span> (Winner: ${winner})</div>`;
                });
            }
            if (data.data.map && data.data.map.length) {
                html += '<h5 class="mt-3">Knockout Bracket</h5>';
                data.data.map.forEach(m => {
                    html += `<div style="padding:4px 0;border-bottom:1px solid var(--border-color);"><span onclick="window.openTeamModal(${m.teamA.row_id})" style="cursor:pointer;">${m.teamA.title}</span> (${m.teamA_score}) - (${m.teamB_score}) <span onclick="window.openTeamModal(${m.teamB.row_id})" style="cursor:pointer;">${m.teamB.title}</span><br /><small style="color:var(--secondary);">${m.round_name}</small></div>`;
                });
            }
            container.innerHTML = html || '<p>No bracket data</p>';
        } else container.innerHTML = '<p>No bracket data</p>';
    } catch (err) { container.innerHTML = '<div class="alert alert-danger">Failed to load bracket</div>'; }
}

function setupInfiniteScroll(sentinelId, loadMore) {
    const sentinel = document.getElementById(sentinelId);
    if (!sentinel) return;
    if (window.IntersectionObserver) {
        const obs = new IntersectionObserver(entries => { if (entries[0].isIntersecting) loadMore(); }, { rootMargin: '200px' });
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
//  الفيديوهات
// ============================================================
async function loadHighlights() {
    const container = document.getElementById('highlightsContainer');
    container.innerHTML = '<div class="text-center">Loading highlights...</div>';
    const allMatches = [...liveMatches, ...todayMatches];
    let videos = [];
    for (const match of allMatches) {
        if (match.video_links && match.video_links.length) {
            match.video_links.forEach(v => {
                if (v.video_link) videos.push({
                    title: `${match.home_team?.title || 'Home'} vs ${match.away_team?.title || 'Away'}`,
                    url: v.video_link,
                    thumbnail: v.thumbnail || '',
                    competition: match.championship ? match.championship.title : '',
                });
            });
        } else {
            const links = await fetchHighlightsForMatch(match.match_id);
            links.forEach(v => {
                if (v.video_link) videos.push({
                    title: `${match.home_team?.title || 'Home'} vs ${match.away_team?.title || 'Away'}`,
                    url: v.video_link,
                    thumbnail: v.thumbnail || '',
                    competition: match.championship ? match.championship.title : '',
                });
            });
        }
    }

    if (videos.length === 0) {
        container.innerHTML = '<p class="text-muted">No highlights available for this date.</p>';
        return;
    }

    let html = '';
    videos.forEach(v => {
        let thumb = v.thumbnail;
        if (!thumb && v.url.includes('youtube.com')) {
            const matchId = v.url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
            if (matchId) thumb = `https://img.youtube.com/vi/${matchId[1]}/hqdefault.jpg`;
        }
        if (!thumb) thumb = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'480\' height=\'270\' viewBox=\'0 0 480 270\'%3E%3Crect width=\'480\' height=\'270\' fill=\'%23222\'/%3E%3Ctext x=\'180\' y=\'140\' font-family=\'sans-serif\' font-size=\'24\' fill=\'%23fff\'%3EVideo%3C/text%3E%3C/svg%3E';
        html += `
        <div class="highlight-card" onclick="window.openHighlightPlayer('${v.url}','${v.title.replace(/'/g,"\\'")}')">
            <div class="highlight-thumb">
                <img src="${thumb}" alt="${v.title}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'480\' height=\'270\' viewBox=\'0 0 480 270\'%3E%3Crect width=\'480\' height=\'270\' fill=\'%23222\'/%3E%3Ctext x=\'180\' y=\'140\' font-family=\'sans-serif\' font-size=\'24\' fill=\'%23fff\'%3EVideo%3C/text%3E%3C/svg%3E'" />
                <div class="play-overlay"></div>
            </div>
            <div class="highlight-body">
                <div class="highlight-title">${v.title}</div>
                <div class="highlight-meta"><span>${v.competition}</span></div>
            </div>
        </div>`;
    });
    container.innerHTML = html;
}

// ============================================================
//  صفحة الانتقالات
// ============================================================
async function loadTransfersPage() {
    const container = document.getElementById('transfersContainer');
    container.innerHTML = `<iframe src="https://zi-store.online/i.html" style="width:100%;height:70vh;border:none;border-radius:12px;"></iframe>`;
}

// ============================================================
//  التنقل السفلي
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
    });
});

// ============================================================
//  مؤشر التمرير
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
        const atTop = top < 50, atBottom = top > height - 50;
        if (atTop) { arrow.textContent = '↓'; arrow.className = 'arrow-icon down'; }
        else if (atBottom) { arrow.textContent = '↑'; arrow.className = 'arrow-icon up'; }
        else { arrow.textContent = '↓'; arrow.className = 'arrow-icon'; }
    }
    el.addEventListener('click', () => {
        const top = window.pageYOffset || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        if (top < 50) window.scrollTo({ top: height, behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) { window.requestAnimationFrame(() => { update(); ticking = false; }); ticking = true; }
    });
    update();
}

// ============================================================
//  دالة تشغيل البث (Stream)
// ============================================================
function openStreamPlayer(streamUrl, matchData) {
    const modalElement = document.getElementById('streamPlayerModal');
    const videoElement = document.getElementById('streamVideo');
    const streamCompLogo = document.getElementById('streamCompLogo');
    const streamCompName = document.getElementById('streamCompName');
    const streamMatchInfo = document.getElementById('streamMatchInfo');
    const streamHomeLogo = document.getElementById('streamHomeLogo');
    const streamAwayLogo = document.getElementById('streamAwayLogo');

    if (matchData && matchData.compLogoUrl) { streamCompLogo.src = matchData.compLogoUrl; streamCompLogo.style.display = 'inline-block'; }
    else { streamCompLogo.style.display = 'none'; }
    if (streamCompName) streamCompName.textContent = matchData ? (matchData.compName || '') : '';
    if (streamMatchInfo) streamMatchInfo.textContent = matchData ? `${matchData.homeName} ${matchData.homeScore || 0} - ${matchData.awayScore || 0} ${matchData.awayName}` : '';
    if (matchData && matchData.homeLogoUrl) { streamHomeLogo.src = matchData.homeLogoUrl; streamHomeLogo.style.display = 'inline-block'; }
    else { streamHomeLogo.style.display = 'none'; }
    if (matchData && matchData.awayLogoUrl) { streamAwayLogo.src = matchData.awayLogoUrl; streamAwayLogo.style.display = 'inline-block'; }
    else { streamAwayLogo.style.display = 'none'; }

    let finalStreamUrl = streamUrl;
    if (finalStreamUrl.startsWith('http://')) finalStreamUrl = finalStreamUrl.replace('http://', 'https://');

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(finalStreamUrl);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) { console.error('HLS fatal error:', data); alert('Unable to play stream. Please try again later.'); videoElement.pause(); }
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
        if (window.currentHls) { window.currentHls.destroy(); window.currentHls = null; }
    }, { once: true });
}

// ============================================================
//  تهيئة التطبيق
// ============================================================
async function init() {
    loadTheme();
    initLanguage();
    updateDateUI();

    // تحميل البطولات
    const champs = await loadChampionships();
    setChampionships(champs);
    await populateChampDropdown();

    // تحميل المباريات
    await loadLiveMatches();
    await loadTodayMatches();
    await loadHighlights();
    await loadTransfersPage();

    // بدء التحديثات الدورية
    setInterval(() => { loadLiveMatches(); }, 3000);
    setInterval(() => { loadTodayMatches(); loadHighlights(); }, 60000);

    // تهيئة مؤشر التمرير
    initScrollProgress();

    // تعريض الدوال العامة للنوافذ المنبثقة و الأحداث
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
    window.changeCalMonth = function(offset) {
        const newDate = new Date(calViewDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCalViewDate(newDate);
        renderCalendar(calViewDate, selectedCalDate);
    };
    window.selectCalDate = function(dateStr) {
        const parts = dateStr.split('-');
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        setSelectedCalDate(d);
        renderCalendar(calViewDate, selectedCalDate);
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
    window.switchPitchTab = function(btn, showId, hideId) {
        document.querySelectorAll('.pitch-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        const show = document.getElementById(showId);
        const hide = document.getElementById(hideId);
        if (show) show.style.display = 'block';
        if (hide) hide.style.display = 'none';
    };
}

// تشغيل التطبيق
init();
