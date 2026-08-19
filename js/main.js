import { CONFIG } from './config.js';
import { initTheme } from './theme.js';
import { initPlayer } from './player.js';
import { initUI, switchTab } from './ui.js';
import { initMatchDetail } from './match-detail.js';
import { fetchStreams } from './streams.js';
import { loadMovieCategories } from './movies.js';
import { loadSeriesCategories } from './series.js';

// جعل بعض الدوال عالمية لتستخدم في HTML (مثل onclick)
window.switchTab = switchTab;
window.fetchStreams = fetchStreams;
window.loadMovieCategories = loadMovieCategories;
window.loadSeriesCategories = loadSeriesCategories;

// تهيئة كل شيء
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initPlayer();
    initUI();
    initMatchDetail();

    // تحميل البيانات الأولية
    switchTab('home');
    loadMovieCategories();
    loadSeriesCategories();
    fetchStreams();

    // تحديث البث كل 60 ثانية
    setInterval(fetchStreams, 60000);
});
