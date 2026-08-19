import { CONFIG } from './config.js';
import { getWorkerUrl, $, $$ } from './utils.js';

let series = [];
let seriesCategories = [];
let seriesGenres = [];
let currentSeriesGenre = 'all';
let currentView = 'series-categories';
let seriesEpisodesCache = {};

export async function loadSeriesCategories() {
    try {
        const url = getWorkerUrl(CONFIG.SERIES_CATEGORIES_URL);
        const resp = await fetch(url);
        const data = await resp.json();
        if (Array.isArray(data) && data.length > 0) {
            seriesCategories = data.map(c => ({ id: c.id, name: c.nameAr || c.name, icon: c.icon || '📺', count: c.seriesCount || 0 }));
        } else throw new Error('Invalid data');
    } catch (e) {
        console.warn('Series categories API failed, using fallback data.');
        seriesCategories = CONFIG.FALLBACK_SERIES_CATEGORIES;
    } finally {
        if (currentView === 'series-categories' || currentView === 'home') renderSeriesCategories();
    }
}

function renderSeriesCategories() {
    const container = document.getElementById('seriesCategoriesContainer');
    if (!container) return;
    if (seriesCategories.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-secondary)">لا توجد تصنيفات</div>';
        return;
    }
    container.innerHTML = seriesCategories.map(c =>
        `<div class="zs-category-pill" data-id="${c.id}">
            <div class="zs-category-pill-icon">${c.icon}</div>
            <div class="zs-category-pill-title">${c.name}</div>
            <div class="zs-category-pill-count">${c.count} مسلسلات</div>
        </div>`
    ).join('');
    container.querySelectorAll('.zs-category-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            const categoryId = pill.dataset.id;
            const categoryName = seriesCategories.find(c => c.id === categoryId)?.name || 'مسلسلات';
            goToSeriesList(categoryId, categoryName);
        });
    });
}

async function goToSeriesList(categoryId, categoryName) {
    currentView = 'series-detail';
    document.getElementById('seriesListTitle').textContent = '📺 ' + categoryName;
    document.getElementById('seriesCategoriesView').style.display = 'none';
    document.getElementById('seriesDetailView').style.display = 'flex';
    document.getElementById('seriesDetailViewPage').classList.remove('visible');
    await loadSeriesFromAPI(categoryId);
    renderSeriesGenreFilters();
    renderSeries();
}

async function loadSeriesFromAPI(categoryId) {
    let isLoadingSeries = false;
    if (isLoadingSeries) return;
    isLoadingSeries = true;
    series = [];
    seriesGenres = [];
    try {
        const firstUrl = getWorkerUrl(CONFIG.SERIES_BASE_URL + categoryId + '&page=1');
        const firstResp = await fetch(firstUrl);
        if (!firstResp.ok) throw new Error('Worker error');
        const firstData = await firstResp.json();
        if (firstData.data && Array.isArray(firstData.data)) {
            let allSeries = firstData.data.map(s => {
                const genreName = s.genreObj?.nameEn || s.genreEn || s.genre || 'Unknown';
                return {
                    id: s.id,
                    title: s.title,
                    titleAr: s.titleAr,
                    titleEn: s.titleEn,
                    posterUrl: (s.posterUrl || '').replace('http:', 'https:'),
                    year: s.year,
                    rating: s.rating,
                    genre: genreName,
                    genreAr: s.genreAr || s.genreObj?.nameAr || genreName,
                    genreIcon: s.genreObj?.icon || '🎬',
                    url: s.sources && s.sources.length > 0 ? s.sources[0].streamUrl : null,
                    description: s.description,
                    totalEpisodes: s.totalEpisodes,
                    isReels: s.isReels || false
                };
            });
            const genresSet = new Set();
            allSeries.forEach(s => { if (s.genre && s.genre !== 'Unknown') genresSet.add(s.genre); });
            seriesGenres = ['all', ...Array.from(genresSet)];
            series = allSeries;
            const totalPages = firstData.meta?.totalPages || 0;
            if (totalPages > 1) {
                for (let i = 2; i <= totalPages; i++) {
                    try {
                        const url = getWorkerUrl(CONFIG.SERIES_BASE_URL + categoryId + '&page=' + i);
                        const res = await fetch(url);
                        const data = await res.json();
                        if (data.data && Array.isArray(data.data)) {
                            const newSeries = data.data.map(s => {
                                const genreName = s.genreObj?.nameEn || s.genreEn || s.genre || 'Unknown';
                                return {
                                    id: s.id,
                                    title: s.title,
                                    titleAr: s.titleAr,
                                    titleEn: s.titleEn,
                                    posterUrl: (s.posterUrl || '').replace('http:', 'https:'),
                                    year: s.year,
                                    rating: s.rating,
                                    genre: genreName,
                                    genreAr: s.genreAr || s.genreObj?.nameAr || genreName,
                                    genreIcon: s.genreObj?.icon || '🎬',
                                    url: s.sources && s.sources.length > 0 ? s.sources[0].streamUrl : null,
                                    description: s.description,
                                    totalEpisodes: s.totalEpisodes,
                                    isReels: s.isReels || false
                                };
                            });
                            newSeries.forEach(s => { if (s.genre && s.genre !== 'Unknown') genresSet.add(s.genre); });
                            allSeries = allSeries.concat(newSeries);
                            series = allSeries;
                            seriesGenres = ['all', ...Array.from(genresSet)];
                        }
                    } catch (e) { console.warn('Failed to load series page ' + i); }
                    await new Promise(r => setTimeout(r, 1000));
                }
            }
        }
    } catch (e) {
        console.error('Failed to load series', e);
        series = [
            { id: "s1", title: "مسلسل تجريبي 1", posterUrl: "https://via.placeholder.com/300x450/1a1a2e/fff?text=مسلسل+1", rating: "9.0", genre: "دراما", description: "وصف تجريبي", url: "" },
            { id: "s2", title: "مسلسل تجريبي 2", posterUrl: "https://via.placeholder.com/300x450/1a1a2e/fff?text=مسلسل+2", rating: "8.2", genre: "كوميديا", description: "وصف تجريبي", url: "" }
        ];
        seriesGenres = ['all', 'دراما', 'كوميديا'];
    } finally { isLoadingSeries = false; }
}

function renderSeriesGenreFilters() {
    const container = document.getElementById('seriesGenreFilters');
    if (!container) return;
    let html = '';
    seriesGenres.forEach(genre => {
        const label = genre === 'all' ? 'الكل' : genre;
        const active = genre === currentSeriesGenre ? 'active' : '';
        html += `<button class="zs-genre-pill ${active}" data-genre="${genre}">${label}</button>`;
    });
    container.innerHTML = html;
    container.querySelectorAll('.zs-genre-pill').forEach(btn => {
        btn.addEventListener('click', function() {
            currentSeriesGenre = this.dataset.genre;
            renderSeriesGenreFilters();
            renderSeries();
        });
    });
}

function renderSeries() {
    const container = document.getElementById('seriesListContainer');
    if (!container) return;
    const filtered = series.filter(s => {
        if (currentSeriesGenre === 'all') return true;
        return s.genre === currentSeriesGenre;
    });
    if (filtered.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-secondary)">لا توجد مسلسلات</div>';
        return;
    }
    container.innerHTML = `<div class="zs-movies-grid">${filtered.map(s =>
        `<div class="zs-movie-card" data-id="${s.id}">
            <div class="zs-movie-poster-wrap">
                <img class="zs-movie-poster" src="${s.posterUrl}" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
                <div class="zs-movie-rating">★ ${s.rating || 'N/A'}</div>
                ${s.genre ? `<div style="position:absolute;bottom:8px;left:8px;background:rgba(0,0,0,0.7);padding:2px 8px;border-radius:4px;font-size:10px;color:var(--text-secondary);">${s.genre}</div>` : ''}
            </div>
            <div class="zs-movie-info">
                <div class="zs-movie-title">${s.title}</div>
                <div style="font-size:10px;color:var(--text-secondary);">${s.genreAr || s.genre || ''}</div>
            </div>
        </div>`
    ).join('')}</div>`;
    container.querySelectorAll('.zs-movie-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            const seriesItem = series.find(s => s.id === id);
            if (seriesItem) showSeriesDetail(id);
        });
    });
}

async function showSeriesDetail(seriesId) {
    const seriesItem = series.find(s => s.id === seriesId);
    if (!seriesItem) return;
    document.getElementById('seriesDetailView').style.display = 'none';
    document.getElementById('seriesDetailViewPage').classList.add('visible');
    document.getElementById('seriesDetailTitle').textContent = seriesItem.title;

    try {
        const url = getWorkerUrl(CONFIG.SERIES_EPISODES_URL + seriesId + '/episodes');
        const resp = await fetch(url);
        const data = await resp.json();
        if (Array.isArray(data) && data.length > 0) {
            seriesEpisodesCache[seriesId] = data;
            renderSeriesDetail(seriesItem, data);
        } else {
            document.getElementById('seriesDetailContainer').innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-secondary);">لا توجد حلقات لهذا المسلسل</div>';
        }
    } catch (e) {
        console.warn('Failed to load episodes:', e);
        const episodes = [
            { episodeNumber: 1, title: 'الحلقة 1', duration: '45 min' },
            { episodeNumber: 2, title: 'الحلقة 2', duration: '48 min' },
            { episodeNumber: 3, title: 'الحلقة 3', duration: '42 min' }
        ];
        renderSeriesDetail(seriesItem, episodes);
    }
}

function renderSeriesDetail(series, episodes) {
    const seasons = {};
    episodes.forEach(ep => {
        const season = ep.seasonNumber || 1;
        if (!seasons[season]) seasons[season] = [];
        seasons[season].push(ep);
    });
    const seasonKeys = Object.keys(seasons).sort((a, b) => a - b);
    const defaultSeason = seasonKeys[0] || 1;

    let html = `<div class="zs-series-header">
        <img class="zs-series-poster" src="${series.posterUrl}" onerror="this.style.display='none'">
        <div class="zs-series-info">
            <div class="zs-series-title">${series.title}</div>
            <div class="zs-series-meta">${series.year || ''} ${series.rating ? '⭐ ' + series.rating : ''} ${series.genre ? '• ' + series.genre : ''}</div>
            <div class="zs-series-desc">${series.description || ''}</div>
        </div>
    </div>
    <div class="zs-season-tabs" id="seasonTabs">
        ${seasonKeys.map(s => `<button class="zs-season-tab ${s == defaultSeason ? 'active' : ''}" data-season="${s}">الموسم ${s}</button>`).join('')}
    </div>
    <div id="episodesContainer">
        ${renderEpisodes(seasons[defaultSeason] || [])}
    </div>`;
    document.getElementById('seriesDetailContainer').innerHTML = html;

    document.getElementById('seasonTabs').addEventListener('click', function(e) {
        const tab = e.target.closest('.zs-season-tab');
        if (!tab) return;
        this.querySelectorAll('.zs-season-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const season = parseInt(tab.dataset.season);
        const eps = seasons[season] || [];
        document.getElementById('episodesContainer').innerHTML = renderEpisodes(eps);
    });
}

function renderEpisodes(episodes) {
    if (!episodes || episodes.length === 0) {
        return '<div style="text-align:center;padding:20px;color:var(--text-secondary);">لا توجد حلقات في هذا الموسم</div>';
    }
    const sorted = episodes.sort((a, b) => (a.episodeNumber || 0) - (b.episodeNumber || 0));
    let html = '<div class="zs-episodes-grid">';
    sorted.forEach(ep => {
        const title = ep.title || `الحلقة ${ep.episodeNumber}`;
        const duration = ep.duration ? `${ep.duration} دقيقة` : '';
        let streamUrl = null;
        if (ep.sources && ep.sources.length > 0) {
            streamUrl = ep.sources[0].streamUrl;
        }
        html += `<div class="zs-episode-card" data-url="${streamUrl || ''}" data-id="${ep.id}">
            <div class="zs-episode-number">${ep.episodeNumber || ''}</div>
            <div class="zs-episode-title">${title}</div>
            ${duration ? `<div class="zs-episode-duration">${duration}</div>` : ''}
        </div>`;
    });
    html += '</div>';
    setTimeout(() => {
        document.querySelectorAll('.zs-episode-card').forEach(card => {
            card.addEventListener('click', function() {
                const url = this.dataset.url;
                if (url) {
                    window.loadStream(url, 'الحلقة');
                    document.getElementById('camelOverlay').style.display = 'none';
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    alert('لا يوجد رابط بث لهذه الحلقة');
                }
            });
        });
    }, 0);
    return html;
}

export function searchSeries(query) {
    return series.filter(s => s.title.toLowerCase().includes(query.toLowerCase()));
}
