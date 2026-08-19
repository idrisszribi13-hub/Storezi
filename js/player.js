import { $, $$, formatTime } from './utils.js';

let hls = null;
let currentStreamUrl = '';

export function initPlayer() {
    const video = $('#zsVideo');
    const playerSection = $('#zsPlayerSection');
    const startOverlay = $('#zsStartOverlay');
    const loadingEl = $('#zsLoading');
    const errorOverlay = $('#zsErrorOverlay');
    const liveBadge = $('#zsLiveBadge');
    const btnPlay = $('#zsBtnPlay');
    const btnMute = $('#zsBtnMute');
    const volumeSlider = $('#zsVolumeSlider');
    const timeDisplay = $('#zsTimeDisplay');
    const progressWrap = $('#zsProgressWrap');
    const progressFilled = $('#zsProgressFilled');
    const btnFullscreen = $('#zsBtnFullscreen');
    const btnRotate = $('#zsBtnRotate');
    const wrapper = $('#zsPlayerWrapper');
    const videoContainer = $('#zsVideoContainer');
    const retryBtn = $('#zsErrorRetry');

    function showLoading() { loadingEl.classList.add('zs-visible'); }
    function hideLoading() { loadingEl.classList.remove('zs-visible'); }
    function showError() { errorOverlay.classList.add('zs-visible'); }
    function hideError() { errorOverlay.classList.remove('zs-visible'); }
    function setLiveMode(live) { liveBadge.classList.toggle('zs-visible', live); }

    function updateTimeDisplay() {
        if (video.duration) timeDisplay.textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration);
    }

    function updateProgress() {
        if (video.duration) progressFilled.style.width = (video.currentTime / video.duration * 100) + '%';
    }

    function destroyPlayer() {
        if (hls) { hls.destroy(); hls = null; }
        video.pause();
        video.removeAttribute('src');
        video.load();
        hideError();
        hideLoading();
        setLiveMode(false);
        btnPlay.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
        playerSection.classList.remove('visible');
        // إخفاء Camel Overlay
        document.getElementById('camelOverlay').style.display = 'none';
    }

    export function loadStream(url, title) {
        if (window.location.protocol === 'https:' && url && url.startsWith('http://')) {
            url = url.replace('http://', 'https://');
        }
        destroyPlayer();
        showLoading();
        startOverlay.classList.add('zs-hidden');
        playerSection.classList.add('visible');
        if (title) {
            document.getElementById('matchDetailTitleAiScore').textContent = title;
        }
        currentStreamUrl = url;

        if (url.includes('.m3u8')) {
            if (Hls.isSupported()) {
                hls = new Hls();
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    hideLoading();
                    hideError();
                    setLiveMode(true);
                    video.play().catch(() => {});
                    updateTimeDisplay();
                });
                hls.on(Hls.Events.ERROR, (e, data) => {
                    if (data.fatal) { showError(); hideLoading(); }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                video.play();
            }
            return;
        }
        if (url.includes('.mkv') || url.includes('.mp4')) {
            video.src = url;
            video.play().then(() => { hideLoading(); hideError(); }).catch(() => { hideLoading(); showError(); });
        } else {
            hideLoading();
            showError();
        }
    }

    // إضافة حدث الأزرار
    btnPlay.addEventListener('click', () => { if (video.paused) video.play(); else video.pause(); });
    video.addEventListener('play', () => { btnPlay.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'; });
    video.addEventListener('pause', () => { btnPlay.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>'; });
    volumeSlider.addEventListener('input', () => { video.volume = volumeSlider.value / 100; });
    btnMute.addEventListener('click', () => { video.volume = video.volume === 0 ? 1 : 0; volumeSlider.value = video.volume * 100; });
    video.addEventListener('timeupdate', () => { updateTimeDisplay(); updateProgress(); });
    progressWrap.addEventListener('click', (e) => {
        if (!video.duration) return;
        const rect = progressWrap.getBoundingClientRect();
        video.currentTime = ((e.clientX - rect.left) / rect.width) * video.duration;
    });
    btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) { wrapper.requestFullscreen(); } else { document.exitFullscreen(); }
    });
    btnRotate.addEventListener('click', () => { videoContainer.classList.toggle('rotated'); });
    retryBtn.addEventListener('click', () => { if (currentStreamUrl) loadStream(currentStreamUrl); });

    // تصدير الدوال للاستخدام الخارجي
    window.loadStream = loadStream;
    window.destroyPlayer = destroyPlayer;
}

// Camel Overlay تحديث
export function updateCamelOverlay(fixture, stats) {
    const overlay = document.getElementById('camelOverlay');
    if (!fixture) { overlay.style.display = 'none'; return; }
    const homeName = fixture.teams?.home?.name || 'Home';
    const awayName = fixture.teams?.away?.name || 'Away';
    const homeLogo = fixture.teams?.home?.logo || '';
    const awayLogo = fixture.teams?.away?.logo || '';
    const homeScore = fixture.goals?.home ?? '-';
    const awayScore = fixture.goals?.away ?? '-';
    const elapsed = fixture.fixture?.status?.elapsed || 0;
    const statusShort = fixture.fixture?.status?.short || 'LIVE';

    document.getElementById('camelHomeName').textContent = homeName;
    document.getElementById('camelAwayName').textContent = awayName;
    document.getElementById('camelHomeLogo').src = homeLogo;
    document.getElementById('camelAwayLogo').src = awayLogo;
    document.getElementById('camelScore').textContent = homeScore + ' - ' + awayScore;

    let timeText = '';
    if (statusShort === '1H') timeText = '1st Half ' + elapsed + "'";
    else if (statusShort === '2H') timeText = '2nd Half ' + elapsed + "'";
    else if (statusShort === 'HT') timeText = 'Half Time';
    else if (statusShort === 'FT') timeText = 'Full Time';
    else timeText = statusShort || 'LIVE';
    document.getElementById('camelTime').textContent = timeText;
    document.getElementById('camelStatus').textContent = statusShort;

    let homePoss = 50, awayPoss = 50;
    if (stats && stats.length > 0) {
        const homeStats = stats.find(s => s.team?.name === homeName) || stats[0];
        const awayStats = stats.find(s => s.team?.name === awayName) || stats[1] || stats[0];
        if (homeStats && homeStats.statistics) {
            const possHome = homeStats.statistics.find(s => s.type === 'Ball Possession');
            if (possHome) homePoss = parseFloat(possHome.value) || 50;
        }
        if (awayStats && awayStats.statistics) {
            const possAway = awayStats.statistics.find(s => s.type === 'Ball Possession');
            if (possAway) awayPoss = parseFloat(possAway.value) || 50;
        }
        const total = homePoss + awayPoss;
        if (total > 0) {
            homePoss = Math.round((homePoss / total) * 100);
            awayPoss = 100 - homePoss;
        }
    }
    document.getElementById('camelPossessionHome').style.width = homePoss + '%';
    document.getElementById('camelPossessionAway').style.width = awayPoss + '%';
    document.getElementById('camelPossessionText').textContent = homePoss + '% - ' + awayPoss + '%';
    overlay.style.display = 'flex';
      }
