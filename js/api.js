// ============================================================
// api.js - كل استدعاءات الواجهة الخلفية (Fetch)
// ============================================================

import { API_BASE, NEWS_BASE, STREAM_API_URL, WORKER_PROXY_URL } from './config.js';
import { fetchFromProxy, getLocalDateStr } from './utils.js';
import { setStreamEvents } from './state.js';

// ===== STREAM EVENTS =====
export async function loadStreamEvents() {
    try {
        const fullUrl = WORKER_PROXY_URL + '?url=' + encodeURIComponent(STREAM_API_URL);
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        setStreamEvents(Array.isArray(data) ? data : []);
    } catch (err) {
        console.error('Failed to load stream events:', err);
        setStreamEvents([]);
    }
}

// ===== MATCHES =====
export async function loadLiveMatches() {
    try {
        const url = `${API_BASE}/matches/matches_in_proccess/L/60`;
        const data = await fetchFromProxy(url);
        // يتم التحديث في state.js عبر دالة setLiveMatches
        const { setLiveMatches } = await import('./state.js');
        setLiveMatches(data.data || []);
        await loadStreamEvents();
    } catch (err) { console.error('Live matches error:', err); }
}

export async function loadTodayMatches() {
    try {
        const dateStr = getLocalDateStr(new Date()); // نستخدم تاريخ اليوم، يمكن تعديله إذا لزم
        const url = `${API_BASE}/matches/matches_date_get/${dateStr}/%5B%5D/%5B%5D/%5B%5D/L/60`;
        const data = await fetchFromProxy(url).catch(() => ({ data: [] }));
        const { setTodayMatches } = await import('./state.js');
        setTodayMatches(data.data || []);
    } catch (err) { console.error('Today matches error:', err); }
}

// ===== CHAMPIONSHIPS =====
export async function loadChampionships() {
    try {
        const url = `${API_BASE}/info/championship_ranking/L/60`;
        const data = await fetchFromProxy(url);
        if (data.status && data.data) {
            return data.data;
        }
        return [];
    } catch (err) { console.error(err); return []; }
}

// ===== STANDINGS =====
export async function getStandings(champ) {
    let url;
    if (champ.type === 1) url = `${API_BASE}/matches/league_standing_stage/${champ.url_id}`;
    else url = `${API_BASE}/matches/cups_teams_standings/${champ.url_id}/L/60`;
    return await fetchFromProxy(url);
}

// ===== SCORERS =====
export async function getScorers(champ, page) {
    const url = `${API_BASE}/matches/league_scorers_map/${champ.url_id}?page=${page}`;
    return await fetchFromProxy(url);
}

// ===== ASSISTS =====
export async function getAssists(champ, page) {
    const url = `${API_BASE}/matches/league_assists_map/${champ.url_id}?page=${page}`;
    return await fetchFromProxy(url);
}

// ===== NEWS =====
export async function getNews(champ, page) {
    const url = `${NEWS_BASE}/News/news_league/${champ.url_id}?page=${page}`;
    return await fetchFromProxy(url);
}

// ===== BRACKET =====
export async function getBracket(champ) {
    const url = `${API_BASE}/matches/cups_teams_standings/${champ.url_id}/L/60`;
    return await fetchFromProxy(url);
}

// ===== MATCH DETAILS =====
export async function getMatchDetails(matchId) {
    const [infoRes, eventsRes, lineupRes, statsRes, h2hRes] = await Promise.all([
        fetchFromProxy(`${API_BASE}/matches/match_info/${matchId}/L/60`),
        fetchFromProxy(`${API_BASE}/matches/matches_event/${matchId}`).catch(() => ({ data: { events: [] } })),
        fetchFromProxy(`${API_BASE}/matches/matches_lineup/${matchId}`).catch(() => ({ data: {} })),
        fetchFromProxy(`${API_BASE}/matches/statics_match/${matchId}`).catch(() => ({ data: { statics: {} } })),
        fetchFromProxy(`${API_BASE}/matches/h2h/${matchId}/L/60`).catch(() => ({ data: {} }))
    ]);
    return {
        info: infoRes.data,
        events: eventsRes.data?.events || [],
        lineups: lineupRes.data || {},
        stats: statsRes.data?.statics || {},
        h2h: h2hRes.data || {}
    };
}

export async function getStandingsForMatch(champUrlId) {
    try {
        const sData = await fetchFromProxy(`${API_BASE}/matches/league_standing_stage/${champUrlId}`);
        return (sData.data && sData.data.league && sData.data.league.stage0) ? sData.data : null;
    } catch (e) { return null; }
}

// ===== TEAM, PLAYER, COACH, REFEREE, NEWS DETAILS =====
export async function getTeamInfo(id) {
    return await fetchFromProxy(`${API_BASE}/info/team_info/${id}/L/60`);
}

export async function getPlayerInfo(id) {
    return await fetchFromProxy(`${API_BASE}/info/player_info/${id}/L/60`);
}

export async function getCoachInfo(id) {
    return await fetchFromProxy(`${API_BASE}/info/coach_info/${id}`);
}

export async function getRefereeInfo(id) {
    return await fetchFromProxy(`${API_BASE}/info/referee_info/${id}/L/60`);
}

export async function getNewsDetail(id) {
    return await fetchFromProxy(`${NEWS_BASE}/News/news_detail/${id}`);
}

// ===== HIGHLIGHTS =====
export async function fetchHighlightsForMatch(matchId) {
    try {
        const detailUrl = `${API_BASE}/matches/match_info/${matchId}/L/60`;
        const detailData = await fetchFromProxy(detailUrl);
        if (detailData && detailData.data && detailData.data.video_links) {
            return detailData.data.video_links;
        }
    } catch (e) {}
    return [];
}

// ===== SEARCH =====
export async function performSearch(query) {
    const url = `${API_BASE}/search/${encodeURIComponent(query)}/L/60`;
    const data = await fetchFromProxy(url);
    return data.data || {};
    }
