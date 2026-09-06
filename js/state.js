import { translations, LANG_API_BASE, LANG_NEWS_BASE } from './config.js';

// ===== STATE VARIABLES =====
export let currentLang = 'en';
export let fontScale = 1.15;
export let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
export let streamEvents = [];
export let championshipsList = [];
export let currentChampionship = null;
export let liveMatches = [];
export let todayMatches = [];
export let currentFilter = 'all';
export let selectedDate = new Date();
export let calViewDate = new Date();
export let selectedCalDate = null;
export let currentPage = 'live';

// ===== STATE ACTIONS =====
export function setCurrentLang(lang) {
    currentLang = lang;
    localStorage.setItem('preferred_language', lang);
}

export function setFontScale(scale) {
    fontScale = Math.min(1.4, Math.max(0.85, scale));
    document.documentElement.style.setProperty('--font-scale', fontScale);
    document.getElementById('fontSizeLabel').textContent = Math.round(fontScale * 100) + '%';
    localStorage.setItem('fontScale', fontScale);
}

export function toggleFavorite(matchId) {
    const idx = favorites.indexOf(matchId);
    if (idx > -1) favorites.splice(idx, 1);
    else favorites.push(matchId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    return favorites;
}

export function isFavorite(matchId) { 
    return favorites.indexOf(matchId) > -1; 
}

export function setStreamEvents(events) {
    streamEvents = events;
}

export function setChampionships(data) {
    championshipsList = data;
}

export function setCurrentChampionship(champ) {
    currentChampionship = champ;
}

export function setLiveMatches(data) {
    liveMatches = data;
}

export function setTodayMatches(data) {
    todayMatches = data;
}

export function setSelectedDate(date) {
    selectedDate = date;
}

export function setCalViewDate(date) {
    calViewDate = date;
}

export function setSelectedCalDate(date) {
    selectedCalDate = date;
}
