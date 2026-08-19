import { CONFIG } from './config.js';
import { updateCamelOverlay } from './player.js';

export function initMatchDetail() {
    document.addEventListener('api-sports:open', function(e) {
        const detail = e.detail;
        if (detail && detail.type === 'game') {
            showMatchDetailAiScore(detail.id);
        }
    });

    document.getElementById('closeMatchDetailAiScore').addEventListener('click', () => {
        document.getElementById('matchDetailAiScore').classList.remove('visible');
        document.getElementById('camelOverlay').style.display = 'none';
        window.switchTab('home');
    });
}

async function showMatchDetailAiScore(fixtureId) {
    const detailContainer = document.getElementById('matchDetailAiScore');
    const content = document.getElementById('matchDetailContentAiScore');
    detailContainer.classList.add('visible');
    content.innerHTML = '<div class="loading"><div class="spinner"></div><div>جاري تحميل التفاصيل...</div></div>';
    document.getElementById('matchDetailTitleAiScore').textContent = 'Match Details';

    try {
        const fixtureResp = await fetch(`https://v3.football.api-sports.io/fixtures?id=${fixtureId}`, {
            headers: { 'x-apisports-key': CONFIG.API_SPORTS_KEY, 'Content-Type': 'application/json' }
        });
        const fixtureData = await fixtureResp.json();
        const fixture = fixtureData.response?.[0];
        if (!fixture) throw new Error('المباراة غير موجودة');

        let stats = [], events = [], odds = [], h2h = [], lineups = [];
        try {
            const statsResp = await fetch(`https://v3.football.api-sports.io/fixtures/statistics?fixture=${fixtureId}`, {
                headers: { 'x-apisports-key': CONFIG.API_SPORTS_KEY, 'Content-Type': 'application/json' }
            });
            stats = (await statsResp.json()).response || [];
        } catch (e) {}
        try {
            const eventsResp = await fetch(`https://v3.football.api-sports.io/fixtures/events?fixture=${fixtureId}`, {
                headers: { 'x-apisports-key': CONFIG.API_SPORTS_KEY, 'Content-Type': 'application/json' }
            });
            events = (await eventsResp.json()).response || [];
        } catch (e) {}
        try {
            const oddsResp = await fetch(`https://v3.football.api-sports.io/odds?fixture=${fixtureId}`, {
                headers: { 'x-apisports-key': CONFIG.API_SPORTS_KEY, 'Content-Type': 'application/json' }
            });
            odds = (await oddsResp.json()).response || [];
        } catch (e) {}
        try {
            const h2hResp = await fetch(`https://v3.football.api-sports.io/fixtures/headtohead?h2h=${fixture.teams.home.id}-${fixture.teams.away.id}`, {
                headers: { 'x-apisports-key': CONFIG.API_SPORTS_KEY, 'Content-Type': 'application/json' }
            });
            h2h = (await h2hResp.json()).response || [];
        } catch (e) {}
        try {
            const lineupsResp = await fetch(`https://v3.football.api-sports.io/fixtures/lineups?fixture=${fixtureId}`, {
                headers: { 'x-apisports-key': CONFIG.API_SPORTS_KEY, 'Content-Type': 'application/json' }
            });
            lineups = (await lineupsResp.json()).response || [];
        } catch (e) {}

        updateCamelOverlay(fixture, stats);
        await renderMatchDetailAiScore(fixture, stats, events, odds, h2h, lineups);

    } catch (error) {
        content.innerHTML = '<div class="error-msg">⚠️ فشل تحميل التفاصيل: ' + error.message + '</div>';
        document.getElementById('camelOverlay').style.display = 'none';
    }
}

async function renderMatchDetailAiScore(fixture, stats, events, odds, h2h, lineups) {
    const home = fixture.teams?.home?.name || 'Home';
    const away = fixture.teams?.away?.name || 'Away';
    const homeLogo = fixture.teams?.home?.logo || '';
    const awayLogo = fixture.teams?.away?.logo || '';
    const homeScore = fixture.goals?.home ?? '-';
    const awayScore = fixture.goals?.away ?? '-';
    const league = fixture.league?.name || '';
    const status = fixture.fixture?.status?.short || '';
    const elapsed = fixture.fixture?.status?.elapsed || 0;
    const venue = fixture.fixture?.venue?.name || 'N/A';
    const referee = fixture.fixture?.referee || 'N/A';
    const date = fixture.fixture?.date ? new Date(fixture.fixture.date).toLocaleDateString('ar-EG') : 'N/A';
    const time = fixture.fixture?.date ? new Date(fixture.fixture.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    const totalTime = 90;
    const percent = Math.min((elapsed / totalTime) * 100, 100);

    let statusText = status;
    if (status === '1H' || status === '2H' || status === 'ET') statusText = elapsed + "'";
    else if (status === 'HT') statusText = 'Half Time';
    else if (status === 'FT') statusText = 'Full Time';
    else if (status === 'PST') statusText = 'Postponed';
    else if (status === 'NS') statusText = 'Not Started';

    // Header
    let headerHtml = `
        <div class="match-header-aiscore">
            <div class="league-name">${league}</div>
            <div class="match-teams-score">
                <div class="team-block">${homeLogo ? `<img src="${homeLogo}" onerror="this.style.display='none'">` : ''}<span class="name">${home}</span></div>
                <div class="score-block">
                    <div class="score">${homeScore} - ${awayScore}</div>
                    <div class="status">${statusText}</div>
                    <div class="ht-score">HT ${fixture.score?.halftime?.home ?? '-'} - ${fixture.score?.halftime?.away ?? '-'}</div>
                </div>
                <div class="team-block">${awayLogo ? `<img src="${awayLogo}" onerror="this.style.display='none'">` : ''}<span class="name">${away}</span></div>
            </div>
            <div class="match-meta-info">
                <span><span class="label">📅</span> <span class="value">${date}</span></span>
                <span><span class="label">🕐</span> <span class="value">${time}</span></span>
                <span><span class="label">🏟️</span> <span class="value">${venue}</span></span>
                <span><span class="label">👨‍⚖️</span> <span class="value">${referee}</span></span>
                ${elapsed > 0 ? `<span><span class="label">⏱️</span> <span class="value">${elapsed}'</span></span>` : ''}
            </div>
            <div class="progress-bar">
                <div class="fill" style="width:${percent}%;"></div>
                <div class="time-label">${elapsed > 0 ? elapsed + "'" : ''}</div>
            </div>
        </div>
    `;

    // Overview
    let overviewHtml = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:10px 0;">
            <div><strong>🏟️ Venue:</strong> ${venue}</div>
            <div><strong>👨‍⚖️ Referee:</strong> ${referee}</div>
            <div><strong>📅 Date:</strong> ${date}</div>
            <div><strong>🕐 Time:</strong> ${time}</div>
            <div><strong>📊 Status:</strong> ${statusText}</div>
            <div><strong>⏱️ Elapsed:</strong> ${elapsed > 0 ? elapsed + "'" : 'N/A'}</div>
            <div><strong>🏆 League:</strong> ${league}</div>
            <div><strong>⚽ Score:</strong> ${homeScore} - ${awayScore}</div>
        </div>
    `;

    // Stats
    let statsHtml = '';
    if (stats && stats.length > 0) {
        const homeStats = stats.find(s => s.team?.name === home) || stats[0];
        const awayStats = stats.find(s => s.team?.name === away) || stats[1] || stats[0];
        const statKeys = {};
        if (homeStats && homeStats.statistics) {
            homeStats.statistics.forEach(stat => { if (!statKeys[stat.type]) statKeys[stat.type] = {}; statKeys[stat.type].home = stat.value; });
        }
        if (awayStats && awayStats.statistics) {
            awayStats.statistics.forEach(stat => { if (!statKeys[stat.type]) statKeys[stat.type] = {}; statKeys[stat.type].away = stat.value; });
        }
        const statOrder = ['Ball Possession', 'Total Shots', 'Shots on Goal', 'Shots off Goal', 'Fouls', 'Corner Kicks', 'Offsides', 'Goalkeeper Saves'];
        let statsItems = '';
        statOrder.forEach(key => {
            const homeVal = statKeys[key]?.home ?? '-';
            const awayVal = statKeys[key]?.away ?? '-';
            if (homeVal === '-' && awayVal === '-') return;
            const total = (parseFloat(homeVal) + parseFloat(awayVal)) || 1;
            const homePct = Math.round((parseFloat(homeVal) / total) * 100) || 50;
            const awayPct = 100 - homePct;
            statsItems += `<div class="stat-item">
                <div class="stat-value-home">${homeVal}</div>
                <div style="display:flex;flex-direction:column;align-items:center;width:60px;">
                    <div class="stat-bar"><div class="fill-home" style="width:${homePct}%;"></div><div class="fill-away" style="width:${awayPct}%;"></div></div>
                </div>
                <div class="stat-value-away">${awayVal}</div>
                <div class="stat-label">${key}</div>
            </div>`;
        });
        statsHtml = statsItems ? `<div class="stats-grid-aiscore">${statsItems}</div>` : '<div class="empty-state">لا توجد إحصائيات متاحة</div>';
    } else {
        statsHtml = '<div class="empty-state">لا توجد إحصائيات متاحة</div>';
    }

    // Lineups
    let lineupsHtml = '';
    if (lineups && lineups.length > 0) {
        const homeLineup = lineups.find(l => l.team?.name === home) || lineups[0];
        const awayLineup = lineups.find(l => l.team?.name === away) || lineups[1] || lineups[0];
        const homePlayers = homeLineup?.players || [];
        const awayPlayers = awayLineup?.players || [];
        lineupsHtml = `<div class="lineup-aiscore">
            <div class="team-lineup"><div class="title">${homeLogo ? `<img src="${homeLogo}" onerror="this.style.display='none'">` : ''} ${home}</div>
            ${homePlayers.length > 0 ? homePlayers.slice(0, 11).map(p => `<div class="player"><span class="number">${p.number || ''}</span><span class="name">${p.name || ''}</span><span class="pos">${p.pos || ''}</span></div>`).join('') : '<div class="empty-state">لا توجد تشكيلة</div>'}
            </div>
            <div class="team-lineup"><div class="title">${awayLogo ? `<img src="${awayLogo}" onerror="this.style.display='none'">` : ''} ${away}</div>
            ${awayPlayers.length > 0 ? awayPlayers.slice(0, 11).map(p => `<div class="player"><span class="number">${p.number || ''}</span><span class="name">${p.name || ''}</span><span class="pos">${p.pos || ''}</span></div>`).join('') : '<div class="empty-state">لا توجد تشكيلة</div>'}
            </div>
        </div>`;
    } else {
        lineupsHtml = '<div class="empty-state">لا توجد تشكيلات متاحة</div>';
    }

    // Events
    let eventsHtml = '';
    if (events && events.length > 0) {
        const sortedEvents = events.sort((a, b) => (a.time?.elapsed || 0) - (b.time?.elapsed || 0));
        let evItems = '';
        sortedEvents.forEach(e => {
            const time = e.time?.elapsed ? e.time.elapsed + "'" : '';
            const player = e.player?.name || '';
            const assist = e.assist?.name ? ' (' + e.assist.name + ')' : '';
            const team = e.team?.name || '';
            let icon = '⚽';
            if (e.type === 'Card') icon = e.detail?.includes('Yellow') ? '🟨' : '🟥';
            else if (e.type === 'subst') icon = '🔄';
            else if (e.type === 'Var') icon = '📺';
            evItems += `<div class="event-row"><span class="time">${time}</span><span class="icon">${icon}</span><span class="desc">${player} ${assist}</span><span class="team">${team}</span></div>`;
        });
        eventsHtml = evItems ? `<div class="events-aiscore">${evItems}</div>` : '<div class="empty-state">لا توجد أحداث مسجلة</div>';
    } else {
        eventsHtml = '<div class="empty-state">لا توجد أحداث مسجلة</div>';
    }

    // H2H
    let h2hHtml = '';
    if (h2h && h2h.length > 0) {
        let hItems = '';
        h2h.slice(0, 10).forEach(m => {
            const homeName = m.teams?.home?.name || '?';
            const awayName = m.teams?.away?.name || '?';
            const homeScoreH = m.goals?.home ?? '-';
            const awayScoreH = m.goals?.away ?? '-';
            const date = m.fixture?.date ? new Date(m.fixture.date).toLocaleDateString() : '';
            hItems += `<div class="h2h-row"><span class="teams">${homeName} vs ${awayName}</span><span class="result">${homeScoreH} - ${awayScoreH}</span><span class="date">${date}</span></div>`;
        });
        h2hHtml = hItems ? `<div class="h2h-aiscore">${hItems}</div>` : '<div class="empty-state">لا توجد مواجهات سابقة</div>';
    } else {
        h2hHtml = '<div class="empty-state">لا توجد مواجهات سابقة</div>';
    }

    // Odds
    let oddsHtml = '';
    if (odds && odds.length > 0) {
        const bookmaker = odds[0]?.bookmakers?.[0];
        if (bookmaker && bookmaker.bets) {
            const importantBets = bookmaker.bets.filter(b => [59, 36, 69, 33].includes(b.id));
            let oItems = '';
            importantBets.forEach(bet => {
                const values = bet.values || [];
                let homeVal = '-', drawVal = '-', awayVal = '-';
                values.forEach(v => {
                    if (v.value === 'Home' || v.value === 'Over') homeVal = v.odd;
                    if (v.value === 'Draw') drawVal = v.odd;
                    if (v.value === 'Away' || v.value === 'Under') awayVal = v.odd;
                });
                oItems += `<tr><td class="bookmaker">${bet.name}</td><td class="odd-value">${homeVal}</td><td class="odd-value">${drawVal}</td><td class="odd-value">${awayVal}</td></tr>`;
            });
            oddsHtml = oItems ? `<table class="odds-table-aiscore"><thead><tr><th>Bet</th><th>1</th><th>X</th><th>2</th></tr></thead><tbody>${oItems}</tbody></table>` : '<div class="empty-state">لا توجد أسعار متاحة</div>';
        } else {
            oddsHtml = '<div class="empty-state">لا توجد أسعار متاحة</div>';
        }
    } else {
        oddsHtml = '<div class="empty-state">لا توجد أسعار متاحة</div>';
    }

    // Standings
    let standingsHtml = '<div class="empty-state">جاري تحميل الترتيب...</div>';
    if (fixture.league?.id) {
        try {
            const sResp = await fetch(`https://v3.football.api-sports.io/standings?league=${fixture.league.id}&season=${fixture.league.season || 2026}`, {
                headers: { 'x-apisports-key': CONFIG.API_SPORTS_KEY, 'Content-Type': 'application/json' }
            });
            const sData = await sResp.json();
            if (sData.response && sData.response.length > 0) {
                const sLeague = sData.response[0];
                const sStandings = sLeague.league?.standings?.[0] || [];
                if (sStandings.length > 0) {
                    let sHtml = `<div class="standings-grid-detail"><div class="league-block"><div class="league-title">${sLeague.league?.logo ? `<img src="${sLeague.league.logo}" onerror="this.style.display='none'">` : ''} ${fixture.league.name}</div><table><thead><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr></thead><tbody>`;
                    sStandings.slice(0, 12).forEach((team, idx) => {
                        sHtml += `<tr><td>${idx + 1}</td><td><div class="team-cell"><img src="${team.team?.logo || ''}" onerror="this.style.display='none'"> ${team.team?.name || ''}</div></td><td>${team.all?.played || 0}</td><td>${team.all?.win || 0}</td><td>${team.all?.draw || 0}</td><td>${team.all?.lose || 0}</td><td>${team.goalsDiff || 0}</td><td class="points">${team.points || 0}</td></tr>`;
                    });
                    sHtml += '</tbody></table></div></div>';
                    standingsHtml = sHtml;
                } else {
                    standingsHtml = '<div class="empty-state">لا توجد بيانات ترتيب</div>';
                }
            } else {
                standingsHtml = '<div class="empty-state">لا توجد بيانات ترتيب</div>';
            }
        } catch (e) {
            standingsHtml = '<div class="empty-state">لا يمكن تحميل الترتيب</div>';
        }
    } else {
        standingsHtml = '<div class="empty-state">لا توجد بيانات ترتيب</div>';
    }

    // Build final HTML
    document.getElementById('matchDetailContentAiScore').innerHTML = headerHtml +
        `<div class="match-tabs-aiscore" id="matchTabsAiScore">
            <button class="active" data-tab="overview">📋 Overview</button>
            <button data-tab="stats">📊 Stats</button>
            <button data-tab="lineups">👥 Lineup</button>
            <button data-tab="h2h">⚔️ H2H</button>
            <button data-tab="standings">🏆 Standings</button>
            <button data-tab="odds">💰 Odds</button>
            <button data-tab="knockout">⚡ Knockout</button>
        </div>
        <div id="tab-overview" class="match-tab-content-aiscore active">${overviewHtml}</div>
        <div id="tab-stats" class="match-tab-content-aiscore">${statsHtml}</div>
        <div id="tab-lineups" class="match-tab-content-aiscore">${lineupsHtml}</div>
        <div id="tab-h2h" class="match-tab-content-aiscore">${h2hHtml}</div>
        <div id="tab-standings" class="match-tab-content-aiscore">${standingsHtml}</div>
        <div id="tab-odds" class="match-tab-content-aiscore">${oddsHtml}</div>
        <div id="tab-knockout" class="match-tab-content-aiscore">${eventsHtml}</div>`;

    // Tab switching
    document.querySelectorAll('#matchTabsAiScore button').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#matchTabsAiScore button').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const tab = this.dataset.tab;
            document.querySelectorAll('.match-tab-content-aiscore').forEach(el => el.classList.remove('active'));
            const target = document.getElementById('tab-' + tab);
            if (target) target.classList.add('active');
        });
    });

    // Camel buttons
    document.querySelectorAll('.camel-btn').forEach(btn => {
        btn.removeEventListener('click', camelBtnHandler);
        btn.addEventListener('click', camelBtnHandler);
    });
}

function camelBtnHandler(e) {
    e.stopPropagation();
    const tab = this.dataset.tab;
    const detailTabs = document.querySelectorAll('#matchTabsAiScore button');
    let found = false;
    detailTabs.forEach(b => {
        if (b.dataset.tab === tab) {
            b.click();
            found = true;
        }
    });
    if (found) {
        document.getElementById('matchDetailAiScore').scrollIntoView({ behavior: 'smooth' });
    }
          }
