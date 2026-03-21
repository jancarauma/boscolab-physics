export const OBJECT_ICONS: Record<string, string> = {
  particle: '●', pendulum: '🔴', spring: '🌀', vector: '➡',
  circle: '◯', rect: '▭', label: 'T', vectorfield: '⊞', video: '▶',
};

export const OBJECT_COLORS = ['#4f9eff', '#f97316', '#34d399', '#a78bfa', '#fb7185', '#fbbf24', '#06b6d4', '#ec4899'];

let _objId = 1;
export const resetObjId = () => { _objId = 1; };
export const getObjId = () => _objId;

export function makeObj(type: string, props: Record<string, any> = {}) {
  const id = _objId++;
  const base = {
    id, type, visible: true,
    name: type + id,
    color: OBJECT_COLORS[(id - 1) % OBJECT_COLORS.length],
    _trail: [], _rx: 0, _ry: 0, _selected: false,
    useImage: false, imageData: '', _imgEl: null,
  };
  const defaults: Record<string, any> = {
    particle: { x: 'x', y: 'y', radius: 0.267, showTrail: true, trailMode: 'persist', showVec: false, showVecProj: true, vx: 'vx', vy: 'vy', vecScale: 0.3, vecColor: '#34d399', projColor: '#93c5fd', vecLabel: '', projXLabel: '', projYLabel: '', magLabel: '', trailLen: 300, label: '' },
    pendulum: { theta: 'theta', L: 1.5, pivotX: 0, pivotY: 0, radius: 0.333, rodColor: '#94a3b8', showTrail: true, trailMode: 'persist', trailLen: 400 },
    spring: { x: 'x', y: 'y', x1: 0, y1: 5, pivotX: 0, pivotY: 5, coils: 10, vertical: true },
    vector: { x: 'x', y: 'y', vx: 'vx', vy: 'vy', scale: 0.3, lineWidth: 2, showProj: false, projColor: '#94a3b8', vecLabel: '', projXLabel: '', projYLabel: '', magLabel: '', label: '' },
    circle: { x: 'x', y: 'y', r: 'r', fillColor: 'rgba(79,158,255,.15)', lineWidth: 1.5 },
    rect: { x: 'x', y: 'y', w: 1, h: 1, fillColor: 'rgba(79,158,255,.12)', lineWidth: 1.5 },
    label: { x: 0, y: 3, text: 't = {t:2}', fontSize: 0.433 },
    vectorfield: { fxExpr: '-y', fyExpr: 'x', fxVar: '', fyVar: '', fzVar: '', gridN: 14, gridRange: 5, arrowScale: 0.6, color: '#4f9eff' },
    video: { url: 'https://www.youtube.com/watch?v=sRzezc45xvk', embedUrl: 'https://www.youtube.com/watch?v=sRzezc45xvk', x: 0, y: 0, w: 7, h: 4, allowFullscreen: true },
  };
  const obj = { ...base, ...(defaults[type] || {}), ...props };
  if (type === 'vector' && props.vecLabel === undefined && props.label !== undefined) obj.vecLabel = props.label;
  if (obj.imageData) {
    const img = new Image();
    img.src = obj.imageData;
    obj._imgEl = img;
  }
  return obj;
}
