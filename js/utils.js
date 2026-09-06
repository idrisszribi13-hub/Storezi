import { SUPABASE_PROXY_URL, STATUS_MAP, ICONS } from './config.js';

// ===== HELPER FUNCTIONS =====
export function getLocalDateStr(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function formatMatchLocalDateTime(ts) {
    if (!ts) return 'N/A';
    const date = new Date(ts * 1000);
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${hours}:${mins} ${ampm}`;
}

export function formatMatchLocalTime(ts) {
    if (!ts) return 'N/A';
    const date = new Date(ts * 1000);
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${mins} ${ampm}`;
}

export function formatMatchLocalDate(ts) {
    if (!ts) return 'N/A';
    const date = new Date(ts * 1000);
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

export function getMatchPeriod(status) {
    return STATUS_MAP[status] || 'Live';
}

export function getLiveSeconds(match) {
    const status = match.status !== undefined ? match.status : 1;
    if (status === 1 || status === 3 || status === 8 || status === 9) {
        if (match.minutes !== undefined && match.minutes !== null && match.minutes > 0 && match.minutes < 14400) return match.minutes;
        if (match.match_timestamp && match.match_timestamp > 1000000000) {
            const elapsed = Math.floor(Date.now() / 1000 - match.match_timestamp);
            if (elapsed >= 0 && elapsed < 14400) return elapsed;
        }
        return 0;
    }
    if (status === 4) return match.minutes || 0;
    if (status === 0) return 0;
    if (status === 2) return match.minutes || 0;
    if (status === 10) return match.minutes || 0;
    if (status === 14) return 0;
    return 0;
}

export function formatLiveTimeRealtime(seconds, status, exTime) {
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

export function getMatchProgress(seconds, status) {
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

export function getGoalMarkers(match) {
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

export function startCountdown(el, timestamp) {
    if (!el) return;
    function update() {
        const diff = Math.max(0, Math.floor((timestamp - Date.now()) / 1000));
        if (diff <= 0) { el.textContent = '0s'; return; }
        const h = Math.floor(diff / 3600), m = Math.floor((diff % 3600) / 60), s = diff % 60;
        if (h > 0) el.textContent = `${h}h ${m}m ${s}s`;
        else if (m > 0) el.textContent = `${m}m ${s}s`;
        else el.textContent = `${s}s`;
    }
    update();
    return setInterval(update, 1000);
}

export function showLoading() { 
    document.getElementById('loadingIndicator').classList.remove('hidden'); 
}

export function hideLoading() { 
    document.getElementById('loadingIndicator').classList.add('hidden'); 
}

export async function fetchFromProxy(url) {
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

// ===== TEAM ALIASES FOR STREAM =====
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

export function normalizeTeamName(name) {
    if (!name) return '';
    let n = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
    n = n.replace(/\b(fc|cf|afc|sk|jk|ss|ac|as|sl|vfl|vs|1\.)\b/g, '').replace(/\s+/g, ' ').trim();
    for (const key in teamAliases) { const aliases = teamAliases[key]; if (n === key || aliases.includes(n)) return key; }
    return n;
}

export function findStreamEvent(match, streamEvents) {
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
    if (exactMatch && exactMatch.sources && exactMatch.sources.length > 0 && exactMatch.sources[0].streamUrl) return exactMatch;
    let partialMatch = streamEvents.find(event => {
        const eventHome = normalizeTeamName(event.homeName);
        const eventAway = normalizeTeamName(event.awayName);
        return (namesMatch(home, eventHome) && namesMatch(away, eventAway));
    });
    if (partialMatch && partialMatch.sources && partialMatch.sources.length > 0 && partialMatch.sources[0].streamUrl) return partialMatch;
    let oneExactMatch = streamEvents.find(event => {
        const eventHome = normalizeTeamName(event.homeName);
        const eventAway = normalizeTeamName(event.awayName);
        return (eventHome === home && namesMatch(away, eventAway)) || (eventAway === away && namesMatch(home, eventHome));
    });
    if (oneExactMatch && oneExactMatch.sources && oneExactMatch.sources.length > 0 && oneExactMatch.sources[0].streamUrl) return oneExactMatch;
    let fallbackMatch = streamEvents.find(event => {
        const eventHome = normalizeTeamName(event.homeName);
        const eventAway = normalizeTeamName(event.awayName);
        return namesMatch(home, eventHome) || namesMatch(away, eventAway) || namesMatch(home, eventAway) || namesMatch(away, eventHome);
    });
    if (fallbackMatch && fallbackMatch.sources && fallbackMatch.sources.length > 0 && fallbackMatch.sources[0].streamUrl) return fallbackMatch;
    return null;
            }
