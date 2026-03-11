import type { GraphRenderer } from './GraphRenderer';

interface MdiWindowCfg {
  title: string;
  dot: string;
  btnId: string;
}

export const MDI_WINDOWS: Record<string, MdiWindowCfg> = {
  'mdi-model':   { title: 'Modelo',   dot: 'var(--acc)',  btnId: 'btn-show-model' },
  'mdi-objects': { title: 'Objetos',  dot: 'var(--acc3)', btnId: 'btn-show-objects' },
  'mdi-graphs':  { title: 'Gráficos', dot: 'var(--acc4)', btnId: 'btn-show-graphs' },
};

let mdiZCounter = 10;

export function mdiInit(graphs: GraphRenderer[]): void {
  Object.keys(MDI_WINDOWS).forEach(id => {
    const win = document.getElementById(id);
    if (!win) return;
    const tb  = win.querySelector<HTMLElement>('.mdi-titlebar');
    const rsz = win.querySelector<HTMLElement>('.mdi-resize');
    if (tb) mdiMakeDraggable(win, tb);
    if (rsz) mdiMakeResizable(win, rsz, graphs);
    win.addEventListener('mousedown', () => mdiFocus(id), true);
  });
}

export function mdiFocus(id: string): void {
  mdiZCounter++;
  const win = document.getElementById(id);
  if (win) {
    win.style.zIndex = String(mdiZCounter);
    document.querySelectorAll('.mdi-child').forEach(w => w.classList.remove('mdi-focused'));
    win.classList.add('mdi-focused');
  }
}

export function mdiMinimize(id: string): void {
  const win = document.getElementById(id);
  const cfg = MDI_WINDOWS[id];
  if (!win || !cfg) return;
  win.classList.add('mdi-minimized');
  const btn = document.getElementById(cfg.btnId);
  if (btn) btn.classList.add('mdi-hidden');
  mdiUpdateTaskbar();
}

export function mdiRestore(id: string, graphs: GraphRenderer[]): void {
  const win = document.getElementById(id);
  const cfg = MDI_WINDOWS[id];
  if (!win || !cfg) return;
  win.classList.remove('mdi-minimized');
  const btn = document.getElementById(cfg.btnId);
  if (btn) btn.classList.remove('mdi-hidden');
  mdiFocus(id);
  mdiUpdateTaskbar();
  if (id === 'mdi-graphs') {
    setTimeout(() => graphs.forEach(g => g.resize && g.resize()), 60);
  }
}

export function mdiUpdateTaskbar(): void {
  const tb = document.getElementById('mdi-taskbar');
  if (!tb) return;
  tb.innerHTML = '';
  Object.entries(MDI_WINDOWS).forEach(([id, cfg]) => {
    const win = document.getElementById(id);
    if (win?.classList.contains('mdi-minimized')) {
      const btn = document.createElement('button');
      btn.className = 'mdi-taskbtn';
      btn.innerHTML = `<span class="mdi-taskdot" style="background:${cfg.dot}"></span>${cfg.title}`;
      btn.onclick = () => mdiRestore(id, (window as any).__graphs ?? []);
      tb.appendChild(btn);
    }
  });
}

export function mdiGetLayout(): Record<string, any> {
  const layout: Record<string, any> = {};
  Object.keys(MDI_WINDOWS).forEach(id => {
    const win = document.getElementById(id);
    if (!win) return;
    layout[id] = {
      left: win.style.left || '', top: win.style.top || '',
      right: win.style.right || '', bottom: win.style.bottom || '',
      width: win.offsetWidth + 'px', height: win.offsetHeight + 'px',
      minimized: win.classList.contains('mdi-minimized'),
    };
  });
  return layout;
}

export function mdiApplyLayout(layout: Record<string, any>): void {
  Object.entries(layout).forEach(([id, st]) => {
    const win = document.getElementById(id);
    if (!win) return;
    win.style.left = win.style.top = win.style.right = win.style.bottom = '';
    if (st.left)   win.style.left   = st.left;
    if (st.top)    win.style.top    = st.top;
    if (st.right)  win.style.right  = st.right;
    if (st.bottom) win.style.bottom = st.bottom;
    if (st.width)  win.style.width  = st.width;
    if (st.height) win.style.height = st.height;
    if (st.minimized) {
      mdiMinimize(id);
    } else {
      win.classList.remove('mdi-minimized');
      const btn = document.getElementById(MDI_WINDOWS[id]?.btnId);
      if (btn) btn.classList.remove('mdi-hidden');
    }
  });
  mdiUpdateTaskbar();
}

function mdiMakeDraggable(win: HTMLElement, handle: HTMLElement): void {
  let drag = false, ox = 0, oy = 0, wx = 0, wy = 0;
  handle.addEventListener('mousedown', e => {
    if ((e.target as HTMLElement).closest('.mdi-btn')) return;
    drag = true;
    const rect = win.getBoundingClientRect();
    win.style.left = rect.left + 'px';
    win.style.top  = rect.top  + 'px';
    win.style.right = ''; win.style.bottom = '';
    ox = e.clientX; oy = e.clientY;
    wx = rect.left; wy = rect.top;
    mdiFocus(win.id);
    e.preventDefault();
  });
  window.addEventListener('mousemove', e => {
    if (!drag) return;
    const host = document.getElementById('anim-wrap');
    const hRect = host?.getBoundingClientRect() ?? { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
    let nx = wx + (e.clientX - ox);
    let ny = wy + (e.clientY - oy);
    nx = Math.max(-win.offsetWidth + 60, Math.min(hRect.width - 60, nx - hRect.left));
    ny = Math.max(0, Math.min(hRect.height - 28, ny - hRect.top));
    win.style.left = nx + 'px';
    win.style.top  = ny + 'px';
  });
  window.addEventListener('mouseup', () => { drag = false; });
}

function mdiMakeResizable(win: HTMLElement, handle: HTMLElement, graphs: GraphRenderer[]): void {
  let drag = false, sx = 0, sy = 0, sw = 0, sh = 0;
  handle.addEventListener('mousedown', e => {
    drag = true; sx = e.clientX; sy = e.clientY;
    sw = win.offsetWidth; sh = win.offsetHeight;
    e.preventDefault(); e.stopPropagation();
  });
  window.addEventListener('mousemove', e => {
    if (!drag) return;
    win.style.width  = Math.max(180, sw + (e.clientX - sx)) + 'px';
    win.style.height = Math.max(80, sh + (e.clientY - sy)) + 'px';
    if (win.id === 'mdi-graphs') graphs.forEach(g => g.resize && g.resize());
  });
  window.addEventListener('mouseup', () => { drag = false; });
}
