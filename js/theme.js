// ==================== THEME ====================
export function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('zs-theme', theme);
    document.querySelectorAll('.zs-theme-btn').forEach(btn => {
        btn.classList.toggle('zs-active', btn.dataset.theme === theme);
    });
}

export function initTheme() {
    const savedTheme = localStorage.getItem('zs-theme') || 'legendary';
    setTheme(savedTheme);
    document.getElementById('themeSwitch')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.zs-theme-btn');
        if (btn) setTheme(btn.dataset.theme);
    });
}
