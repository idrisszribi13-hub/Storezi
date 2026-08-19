import { loadMovieCategories, searchMovies } from './movies.js';
import { loadSeriesCategories, searchSeries } from './series.js';
import { fetchStreams } from './streams.js';

let currentTab = 'home';

export function initUI() {
    // Navigation buttons
    document.querySelectorAll('.zs-nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    // Category cards
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            const target = this.dataset.target;
            if (target === 'movies') switchTab('movies');
            else if (target === 'series') switchTab('series');
            else if (target === 'home') switchTab('home');
            else if (target === 'reels') switchTab('reels');
        });
    });

    // Banner buttons
    document.querySelectorAll('.zs-banner-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.dataset.action;
            if (action === 'home') switchTab('home');
            else if (action === 'movies') switchTab('movies');
            else if (action === 'series') switchTab('series');
        });
    });

    // Global search
    document.getElementById('globalSearchBtn').addEventListener('click', performGlobalSearch);
    document.getElementById('globalSearchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performGlobalSearch();
    });

    // Back buttons
    document.getElementById('backMovieCatBtn').addEventListener('click', () => switchTab('home'));
    document.getElementById('backMoviesBtn').addEventListener('click', () => {
        document.getElementById('movieDetailView').style.display = 'none';
        document.getElementById('movieCategoriesView').style.display = 'flex';
    });
    document.getElementById('backSeriesCatBtn').addEventListener('click', () => switchTab('home'));
    document.getElementById('backSeriesListBtn').addEventListener('click', () => {
        document.getElementById('seriesDetailView').style.display = 'none';
        document.getElementById('seriesCategoriesView').style.display = 'flex';
    });
    document.getElementById('backSeriesDetailBtn').addEventListener('click', () => {
        document.getElementById('seriesDetailViewPage').classList.remove('visible');
        document.getElementById('seriesDetailView').style.display = 'flex';
    });
    document.getElementById('backReelsBtn').addEventListener('click', () => switchTab('home'));
}

export function switchTab(tabId) {
    currentTab = tabId;
    // Hide all tabs
    document.querySelectorAll('.zs-tab-content').forEach(el => el.classList.remove('active'));
    const target = document.getElementById('tab-' + tabId);
    if (target) target.classList.add('active');

    // Update nav buttons
    document.querySelectorAll('.zs-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Show/hide specific sections
    const bannerContainer = document.getElementById('bannerContainer');
    const homeView = document.getElementById('homeView');
    const movieCategoriesView = document.getElementById('movieCategoriesView');
    const movieDetailView = document.getElementById('movieDetailView');
    const seriesCategoriesView = document.getElementById('seriesCategoriesView');
    const seriesDetailView = document.getElementById('seriesDetailView');
    const reelsView = document.getElementById('reelsView');

    bannerContainer.style.display = 'none';
    homeView.style.display = 'none';
    movieCategoriesView.style.display = 'none';
    movieDetailView.style.display = 'none';
    seriesCategoriesView.style.display = 'none';
    seriesDetailView.style.display = 'none';
    reelsView.style.display = 'none';

    if (tabId === 'home') {
        bannerContainer.style.display = 'flex';
        homeView.style.display = 'grid';
        movieCategoriesView.style.display = 'flex';
        seriesCategoriesView.style.display = 'flex';
        reelsView.style.display = 'flex';
        if (window.movieCategoriesLoaded !== true) loadMovieCategories();
        if (window.seriesCategoriesLoaded !== true) loadSeriesCategories();
        fetchStreams();
    } else if (tabId === 'movies') {
        movieCategoriesView.style.display = 'flex';
        if (window.movieCategoriesLoaded !== true) loadMovieCategories();
    } else if (tabId === 'series') {
        seriesCategoriesView.style.display = 'flex';
        if (window.seriesCategoriesLoaded !== true) loadSeriesCategories();
    } else if (tabId === 'reels') {
        reelsView.style.display = 'flex';
    }

    // Hide search overlays
    document.getElementById('movieSearchView').classList.remove('visible');
    document.getElementById('seriesSearchView').classList.remove('visible');
}

function performGlobalSearch() {
    const query = document.getElementById('globalSearchInput').value.trim().toLowerCase();
    if (!query) return;
    const movieResults = searchMovies(query);
    const seriesResults = searchSeries(query);
    if (movieResults.length === 0 && seriesResults.length === 0) {
        alert('لا توجد نتائج لـ "' + query + '"');
        return;
    }
    if (movieResults.length > 0) {
        switchTab('movies');
        document.getElementById('movieSearchView').classList.add('visible');
        document.getElementById('movieSearchInput').value = query;
        document.getElementById('movieSearchInput').dispatchEvent(new Event('input'));
    } else if (seriesResults.length > 0) {
        switchTab('series');
        document.getElementById('seriesSearchView').classList.add('visible');
        document.getElementById('seriesSearchInput').value = query;
        document.getElementById('seriesSearchInput').dispatchEvent(new Event('input'));
    }
}
