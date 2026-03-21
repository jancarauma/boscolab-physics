export function initTheme(): void {
  const saved = localStorage.getItem('boscolab-theme');
  if (saved) {
    if (saved === 'light') document.documentElement.classList.add('light');
    return;
  }
  // No saved preference: auto-detect, default to light if browser has no preference
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  if (!prefersDark) document.documentElement.classList.add('light');
}

export function toggleTheme(): void {
  const root = document.documentElement;
  const isLight = root.classList.toggle('light');
  const btn = document.getElementById('theme-btn');
  if (btn) btn.textContent = isLight ? '🌣' : '☾';
  localStorage.setItem('boscolab-theme', isLight ? 'light' : 'dark');
}

export function applyTheme(t: string): void {
  const root = document.documentElement;
  const btn = document.getElementById('theme-btn');
  if (t === 'light') {
    root.classList.add('light');
    if (btn) btn.textContent = '🌣';
  } else {
    root.classList.remove('light');
    if (btn) btn.textContent = '☾';
  }
  localStorage.setItem('boscolab-theme', t);
}

export function getCurrentTheme(): string {
  return document.documentElement.classList.contains('light') ? 'light' : 'dark';
}
