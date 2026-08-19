// ==================== UTILITIES ====================
export function getToday() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

export function formatTime(s) {
    if (!isFinite(s) || s < 0) return '--:--';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + sec.toString().padStart(2, '0');
}

export function getScore(scores) {
    if (!scores || scores.length === 0) return '0 - 0';
    return `${scores[0] || 0} - ${scores[1] || 0}`;
}

export function getStatus(statusId) {
    if (statusId === 2) return 'LIVE';
    if (statusId === 1) return 'Upcoming';
    return 'FT';
}

export function getStatusClass(statusId) {
    if (statusId === 2) return 'live';
    if (statusId === 3 || statusId === 4 || statusId === 8) return 'finished';
    return '';
}

export function getWorkerUrl(endpoint) {
    return CONFIG.WORKER_URL + '?url=' + encodeURIComponent(endpoint);
}

export function $(selector, context = document) {
    return context.querySelector(selector);
}

export function $$(selector, context = document) {
    return context.querySelectorAll(selector);
}
