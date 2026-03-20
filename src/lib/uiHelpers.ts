// --- Toast -------
let _toastTimer: ReturnType<typeof setTimeout> | null = null;

export function toast(m: string): void {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = m;
  el.classList.add('show');
  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

// --- Error bar -------
export function setErr(m: string): void {
  const el = document.getElementById('errmsg');
  if (el) el.textContent = m;
}

export function clearErr(): void {
  const el = document.getElementById('errmsg');
  if (el) el.textContent = '';
}

// --- Menus -------
export function toggleMenu(el: HTMLElement): void {
  const wasOpen = el.classList.contains('open');
  closeMenus();
  if (!wasOpen) el.classList.add('open');
}

export function closeMenus(): void {
  document.querySelectorAll('.mitem').forEach(m => m.classList.remove('open'));
}

// --- Modals -------
export function closeModal(id: string): void {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}

// --- Custom Dialog -------
interface BlabConfirmOptions {
  icon?: string;
  title?: string;
  message?: string;
  okLabel?: string;
  cancelLabel?: string;
  okClass?: string;
  onOk?: (() => void) | null;
  onCancel?: (() => void) | null;
}

export function blabConfirm({
  icon = '⚠️', title = 'Confirmar', message = '',
  okLabel = 'OK', cancelLabel = 'Cancelar', okClass = 'ok',
  onOk = null, onCancel = null,
}: BlabConfirmOptions = {}): void {
  const iconEl = document.getElementById('blab-dlg-icon');
  const titleEl = document.getElementById('blab-dlg-title');
  const bodyEl = document.getElementById('blab-dlg-body');
  const footer = document.getElementById('blab-dlg-footer');
  const overlay = document.getElementById('blab-dlg-overlay');
  if (!iconEl || !titleEl || !bodyEl || !footer || !overlay) return;

  iconEl.textContent = icon;
  titleEl.textContent = title;
  bodyEl.innerHTML = message;
  footer.innerHTML = '';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'dlg-btn cancel';
  cancelBtn.textContent = cancelLabel;
  cancelBtn.onclick = () => { overlay.classList.remove('show'); if (onCancel) onCancel(); };

  const okBtn = document.createElement('button');
  okBtn.className = `dlg-btn ${okClass}`;
  okBtn.textContent = okLabel;
  okBtn.onclick = () => { overlay.classList.remove('show'); if (onOk) onOk(); };

  footer.appendChild(cancelBtn);
  footer.appendChild(okBtn);
  overlay.classList.add('show');
  setTimeout(() => okBtn.focus(), 80);
}

export function blabAlert({
  icon = 'ℹ️', title = 'Aviso', message = '', okLabel = 'OK',
}: { icon?: string; title?: string; message?: string; okLabel?: string } = {}): void {
  const iconEl = document.getElementById('blab-dlg-icon');
  const titleEl = document.getElementById('blab-dlg-title');
  const bodyEl = document.getElementById('blab-dlg-body');
  const footer = document.getElementById('blab-dlg-footer');
  const overlay = document.getElementById('blab-dlg-overlay');
  if (!iconEl || !titleEl || !bodyEl || !footer || !overlay) return;

  iconEl.textContent = icon;
  titleEl.textContent = title;
  bodyEl.innerHTML = message;
  footer.innerHTML = '';

  const okBtn = document.createElement('button');
  okBtn.className = 'dlg-btn ok';
  okBtn.textContent = okLabel;
  okBtn.onclick = () => overlay.classList.remove('show');
  footer.appendChild(okBtn);
  overlay.classList.add('show');
  setTimeout(() => okBtn.focus(), 80);
}

// --- Resize handles -------
export function setupRH(id: string, panelId: string, side: 'left' | 'right', onResize?: () => void): void {
  const h = document.getElementById(id);
  const p = document.getElementById(panelId);
  if (!h || !p) return;
  let drag = false, sx = 0, sw = 0;
  h.addEventListener('mousedown', e => {
    drag = true; sx = e.clientX; sw = p.offsetWidth;
    h.classList.add('drag'); e.preventDefault();
  });
  window.addEventListener('mousemove', e => {
    if (!drag) return;
    const dx = e.clientX - sx;
    const nw = side === 'right' ? sw + dx : sw - dx;
    p.style.width = Math.max(160, Math.min(800, nw)) + 'px';
    p.style.minWidth = p.style.width;
    if (onResize) onResize();
  });
  window.addEventListener('mouseup', () => { if (drag) { drag = false; h.classList.remove('drag'); } });
}

// --- Help / About -------
export function showHelp(): void {
  closeMenus();
  document.getElementById('help-modal-overlay')?.classList.add('show');
}

export function showAbout(): void {
  closeMenus();
  document.getElementById('about-modal-overlay')?.classList.add('show');
}
