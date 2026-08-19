import { CONFIG } from './config.js';
import { getWorkerUrl, $, $$ } from './utils.js';

export async function fetchStreams() {
    const container = document.getElementById('streamContainer');
    const count = document.getElementById('streamCount');
    if (!container) return;
    container.innerHTML = '<div class="loading"><div class="spinner"></div><div>جاري تحميل روابط البث...</div></div>';

    try {
        const fullUrl = getWorkerUrl(CONFIG.GOLIVE_API);
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('البيانات غير صالحة');
        const matchesWithStream = data.filter(match => match.sources && match.sources.length > 0);
        renderStreams(matchesWithStream, container, count);
    } catch (error) {
        console.error('❌ فشل تحميل روابط البث:', error);
        container.innerHTML = `<div class="error-msg">⚠️ فشل تحميل روابط البث: ${error.message}<br><button onclick="fetchStreams()" style="background:var(--accent);border:none;color:#fff;padding:8px 20px;border-radius:6px;cursor:pointer;margin-top:10px;">إعادة المحاولة</button></div>`;
        if (count) count.textContent = '(0)';
    }
}

function renderStreams(matches, container, count) {
    let html = '', total = 0;
    if (!matches || matches.length === 0) {
        html = '<div style="text-align:center;padding:30px;color:var(--text-secondary);">لا توجد مباريات مع روابط بث</div>';
    } else {
        html = `<div class="sub-title">🔴 البث المباشر <span class="badge">${matches.length}</span></div>`;
        matches.forEach(m => {
            const homeName = m.homeName || 'Home', awayName = m.awayName || 'Away';
            const homeLogo = m.homeLogoUrl || '', awayLogo = m.awayLogoUrl || '';
            const leagueName = m.leagueName || 'Unknown League';
            const streamUrl = m.sources && m.sources.length > 0 ? m.sources[0].streamUrl : '';
            const homeScore = m.homeScore || m.home_scores?.[0] ?? '-';
            const awayScore = m.awayScore || m.away_scores?.[0] ?? '-';
            const scoreDisplay = (homeScore !== '-' || awayScore !== '-') ? homeScore + ' - ' + awayScore : '';
            html += `<div class="stream-match-card" data-home="${homeName}" data-away="${awayName}" data-url="${streamUrl}">
                <div class="stream-info">
                    <div class="teams">
                        ${homeLogo ? `<img src="${homeLogo}" onerror="this.style.display='none'">` : ''}
                        <span>${homeName}</span><span class="vs">vs</span>
                        ${awayLogo ? `<img src="${awayLogo}" onerror="this.style.display='none'">` : ''}
                        <span>${awayName}</span>
                    </div>
                    <div class="league">${leagueName}</div>
                </div>
                <div class="stream-meta">
                    ${scoreDisplay ? `<span class="score">${scoreDisplay}</span>` : ''}
                    <span class="stream-icon">▶</span>
                </div>
            </div>`;
            total++;
        });
    }
    container.innerHTML = html;
    if (count) count.textContent = '(' + total + ')';

    // ربط النقر لتشغيل البث
    document.querySelectorAll('.stream-match-card[data-url]').forEach(card => {
        card.addEventListener('click', function() {
            const url = this.dataset.url;
            if (url) {
                const title = this.dataset.home + ' vs ' + this.dataset.away;
                window.loadStream(url, title);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert('لا يوجد رابط بث لهذه المباراة');
            }
        });
    });
          }
