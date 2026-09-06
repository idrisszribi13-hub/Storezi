// ===== CONFIGURATION =====
export const ICON_BASE = 'https://zi-store.online/icon/';
export const EVENT_ICON_BASE = 'https://zi-store.online/events/';

export const ICONS = {
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

export const LANG_API_BASE = { 
    ar: 'https://api-ar.ysscores.com/api', 
    en: 'https://api-en.ysscores.com/api', 
    fr: 'https://api-fr.ysscores.com/api', 
    es: 'https://api-es.ysscores.com/api', 
    it: 'https://api-it.ysscores.com/api', 
    pt: 'https://api-pt.ysscores.com/api', 
    br: 'https://api-br.ysscores.com/api' 
};
export const LANG_NEWS_BASE = { 
    ar: 'https://news-ar.ysscores.com/api', 
    en: 'https://news-en.ysscores.com/api', 
    fr: 'https://news-fr.ysscores.com/api', 
    es: 'https://news-es.ysscores.com/api', 
    it: 'https://news-it.ysscores.com/api', 
    pt: 'https://news-pt.ysscores.com/api', 
    br: 'https://news-br.ysscores.com/api' 
};

export const SUPABASE_PROXY_URL = 'https://kvsyzgavfxnwqmtsginv.supabase.co/functions/v1/proxy';
export const IMG_BASE_TEAM = 'https://imgs.ysscores.com/teams/64/';
export const IMG_BASE_PLAYER = 'https://imgs.ysscores.com/player/64/';
export const IMG_BASE_CHAMP = 'https://imgs.ysscores.com/championship/64/';
export const IMG_BASE_COACH = 'https://imgs.ysscores.com/coach/64/';
export const IMG_BASE_REFEREE = 'https://imgs.ysscores.com/referee/64/';

export const EVENT_TYPE_MAP = {
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

export const SPECIAL_STATUS_MAP = {
    1: 'Kick-Off', 2: 'Half Time', 3: 'Full-Time', 4: 'Full-Time',
    5: 'ET Half', 6: 'ET Full-Time', 7: 'ET Full-Time', 
    8: '1st ET', 9: '2nd ET', 10: 'Penalties', 11: 'Penalties FT'
};

export const STATUS_MAP = {
    0: 'Upcoming', 1: '1st Half', 2: 'HT', 3: '2nd Half', 4: 'FT',
    5: 'ET HT', 6: 'ET', 7: 'ET FT', 8: '1st ET', 9: '2nd ET', 
    10: 'PEN', 14: 'Postponed'
};

export const translations = {
    ar: { dir: 'rtl', select_champ: 'اختر البطولة', search_placeholder: 'ابحث...' },
    en: { dir: 'ltr', select_champ: 'Select Championship', search_placeholder: 'Search...' },
    fr: { dir: 'ltr', select_champ: 'Choisir un championnat', search_placeholder: 'Rechercher...' },
    es: { dir: 'ltr', select_champ: 'Seleccionar campeonato', search_placeholder: 'Buscar...' },
    it: { dir: 'ltr', select_champ: 'Seleziona campionato', search_placeholder: 'Cerca...' },
    pt: { dir: 'ltr', select_champ: 'Selecionar campeonato', search_placeholder: 'Pesquisar...' },
    br: { dir: 'ltr', select_champ: 'Selecionar campeonato', search_placeholder: 'Pesquisar...' }
};

export const STREAM_API_URL = 'https://admin.golive-pro.online/api/public/events?tz=1';
export const WORKER_PROXY_URL = 'https://dry-truth-a84e.idriss-zribi13.workers.dev/';
