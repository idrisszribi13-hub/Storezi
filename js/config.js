// ==================== CONFIG ====================
export const CONFIG = {
    API_SPORTS_KEY: 'e227ff90ed4eacc3eacb07eca05ce78b',
    WORKER_URL: 'https://dry-truth-a84e.idriss-zribi13.workers.dev/',
    GOLIVE_API: 'https://admin.golive-pro.online/api/public/events?tz=1',
    MOVIE_CATEGORIES_URL: 'https://admin.golive-pro.online/api/content/movie-categories',
    MOVIES_BASE_URL: 'https://admin.golive-pro.online/api/content/movies?limit=20&categoryId=',
    SERIES_CATEGORIES_URL: 'https://admin.golive-pro.online/api/content/series-categories',
    SERIES_BASE_URL: 'https://admin.golive-pro.online/api/content/series?limit=50&categoryId=',
    SERIES_EPISODES_URL: 'https://admin.golive-pro.online/api/content/series/',
    FALLBACK_SERIES_CATEGORIES: [
        { id: "dd185bc6-1dfd-45c2-9189-13c47f672e5a", name: "مسلسلات عربية", icon: "🇸🇦", count: 186 },
        { id: "1bf63825-0b85-4ed8-8964-4cf2efb854d6", name: "مسلسلات أجنبية", icon: "🌍", count: 113 },
        { id: "32d17563-00ee-4433-8b59-ddf969a51230", name: "مسلسلات تركية", icon: "🇹🇷", count: 40 },
        { id: "0669005a-e8dd-4a00-8986-a905826eaca3", name: "مسلسلات آسيوية", icon: "🎎", count: 56 },
        { id: "2660c480-65f2-4a30-a0c9-eda017ea660b", name: "مسلسلات مدبلجة", icon: "🗣️", count: 29 }
    ]
};
