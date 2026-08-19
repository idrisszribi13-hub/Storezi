import { CONFIG } from './config.js';
import { getWorkerUrl, $, $$ } from './utils.js';

let movies = [];
let movieCategories = [];
let currentView = 'movie-categories';

export async function loadMovieCategories() {
    try {
        const resp = await fetch(getWorkerUrl(CONFIG.MOVIE_CATEGORIES_URL));
        const data = await resp.json();
        if (Array.isArray(data) && data.length > 0) {
            movieCategories = data.map(c => ({ id: c.id, name: c.nameAr || c.name, icon: c.icon || '🎬', count: c.moviesCount || 0 }));
            if (currentView === 'movie-categories' || currentView === 'home') renderMovieCategories();
        }
    } catch (e) {
        console.warn('Movie categories API failed, using fallback');
        movieCategories = [
            { id: "action", name: "أفلام أكشن", icon: "🎬", count: 10 },
            { id: "comedy", name: "كوميديا", icon: "😂", count: 8 },
            { id: "drama", name: "دراما", icon: "🎭", count: 12 },
            { id: "sci-fi", name: "خيال علمي", icon: "🚀", count: 6 }
        ];
        if (currentView === 'movie-categories' || currentView === 'home') renderMovieCategories();
    }
}

function renderMovieCategories() {
    const container = document.getElementById('movieCategoriesContainer');
    if (!container) return;
    if (movieCategories.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-secondary)">لا توجد تصنيفات</div>';
        return;
    }
    container.innerHTML = movieCategories.map(c =>
        `<div class="zs-category-pill" data-id="${c.id}">
            <div class="zs-category-pill-icon">${c.icon}</div>
            <div class="zs-category-pill-title">${c.name}</div>
            <div class="zs-category-pill-count">${c.count} أفلام</div>
        </div>`
    ).join('');
    container.querySelectorAll('.zs-category-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            const categoryId = pill.dataset.id;
            const categoryName = movieCategories.find(c => c.id === categoryId)?.name || 'أفلام';
            goToMovieList(categoryId, categoryName);
        });
    });
}

async function goToMovieList(categoryId, categoryName) {
    currentView = 'movie-detail';
    document.getElementById('movieListTitle').textContent = '🎬 ' + categoryName;
    document.getElementById('movieCategoriesView').style.display = 'none';
    document.getElementById('movieDetailView').style.display = 'flex';
    await loadMoviesFromAPI(categoryId);
    renderMovies();
}

async function loadMoviesFromAPI(categoryId) {
    let isLoadingMovies = false;
    if (isLoadingMovies) return;
    isLoadingMovies = true;
    try {
        const firstUrl = getWorkerUrl(CONFIG.MOVIES_BASE_URL + categoryId + '&page=1');
        const firstResp = await fetch(firstUrl);
        if (!firstResp.ok) throw new Error('Worker error');
        const firstData = await firstResp.json();
        if (firstData.data && Array.isArray(firstData.data)) {
            let allMovies = firstData.data.map(m => ({
                id: m.id,
                title: m.title,
                posterUrl: (m.posterUrl || '').replace('http:', 'https:'),
                year: m.year,
                rating: m.rating,
                genre: m.genre,
                genreAr: m.genreAr || m.genre,
                url: m.sources && m.sources.length > 0 ? m.sources[0].streamUrl : null
            }));
            movies = allMovies;
            const totalPages = firstData.meta.totalPages || 0;
            if (totalPages > 1) {
                for (let i = 2; i <= totalPages; i++) {
                    try {
                        const url = getWorkerUrl(CONFIG.MOVIES_BASE_URL + categoryId + '&page=' + i);
                        const res = await fetch(url);
                        const data = await res.json();
                        if (data.data && Array.isArray(data.data)) {
                            const newMovies = data.data.map(m => ({
                                id: m.id,
                                title: m.title,
                                posterUrl: (m.posterUrl || '').replace('http:', 'https:'),
                                year: m.year,
                                rating: m.rating,
                                genre: m.genre,
                                genreAr: m.genreAr || m.genre,
                                url: m.sources && m.sources.length > 0 ? m.sources[0].streamUrl : null
                            }));
                            allMovies = allMovies.concat(newMovies);
                            movies = allMovies;
                        }
                    } catch (e) { console.warn('Failed to load page ' + i); }
                    await new Promise(r => setTimeout(r, 1000));
                }
            }
        }
    } catch (e) {
        console.error('Failed to load movies', e);
        movies = [
            { id: "m1", title: "فيلم تجريبي 1", posterUrl: "https://via.placeholder.com/300x450/1a1a2e/fff?text=فيلم+1", rating: "8.5", genre: "أكشن", url: "" },
            { id: "m2", title: "فيلم تجريبي 2", posterUrl: "https://via.placeholder.com/300x450/1a1a2e/fff?text=فيلم+2", rating: "7.8", genre: "كوميديا", url: "" }
        ];
    } finally { isLoadingMovies = false; }
}

function renderMovies() {
    const container = document.getElementById('moviesListContainer');
    if (!container) return;
    if (movies.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-secondary)">لا توجد أفلام</div>';
        return;
    }
    container.innerHTML = `<div class="zs-movies-grid">${movies.map(m =>
        `<div class="zs-movie-card" data-id="${m.id}">
            <div class="zs-movie-poster-wrap">
                <img class="zs-movie-poster" src="${m.posterUrl}" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
                <div class="zs-movie-rating">★ ${m.rating || 'N/A'}</div>
            </div>
            <div class="zs-movie-info">
                <div class="zs-movie-title">${m.title}</div>
                <div style="font-size:10px;color:var(--text-secondary);">${m.genreAr || m.genre || ''}</div>
            </div>
        </div>`
    ).join('')}</div>`;
    container.querySelectorAll('.zs-movie-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            const movie = movies.find(m => m.id === id);
            if (movie && movie.url) {
                window.loadStream(movie.url, movie.title);
                document.getElementById('camelOverlay').style.display = 'none';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert('لا يوجد رابط بث لهذا الفيلم');
            }
        });
    });
}

// تصدير دوال البحث
export function searchMovies(query) {
    return movies.filter(m => m.title.toLowerCase().includes(query.toLowerCase()));
                  }
