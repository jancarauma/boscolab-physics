// --- GRAPH RENDERER -------
export class GraphRenderer {
  cv: HTMLCanvasElement;
  idx: number;
  xvar: string; yvar: string; yvar2: string;
  data: number[][]; data2: number[][];
  xmin: number; xmax: number; ymin: number; ymax: number;
  colors: string[];
  autoScale: boolean;

  constructor(canvas: HTMLCanvasElement, idx: number) {
    this.cv = canvas; this.idx = idx;
    this.xvar = 't'; this.yvar = 'y'; this.yvar2 = '';
    this.data = []; this.data2 = [];
    this.xmin = Infinity; this.xmax = -Infinity;
    this.ymin = Infinity; this.ymax = -Infinity;
    this.colors = ['#4f9eff', '#34d399'];
    this.autoScale = true;
  }

  append(state: Record<string, number>) {
    const getV = (v: string, s: Record<string, number>) => { const lo = v.toLowerCase(); return (s[lo] !== undefined && isFinite(s[lo])) ? s[lo] : null; };
    const xv = getV(this.xvar, state) ?? state.t;
    if (!isFinite(xv)) return;
    const yv = this.yvar ? getV(this.yvar, state) : null;
    const yv2 = this.yvar2 ? getV(this.yvar2, state) : null;
    if (yv !== null) {
      this.data.push([xv, yv]);
      this.xmin = Math.min(this.xmin, xv); this.xmax = Math.max(this.xmax, xv);
      this.ymin = Math.min(this.ymin, yv); this.ymax = Math.max(this.ymax, yv);
    }
    if (yv2 !== null) {
      this.data2.push([xv, yv2]);
      this.ymin = Math.min(this.ymin, yv2); this.ymax = Math.max(this.ymax, yv2);
    }
  }

  clear() {
    this.data = []; this.data2 = [];
    this.xmin = Infinity; this.xmax = -Infinity;
    this.ymin = Infinity; this.ymax = -Infinity;
  }

  render() {
    const cv = this.cv; const ctx = cv.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const wrap = cv.parentElement!; const W = wrap.clientWidth, H = wrap.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.scale(dpr, dpr);
    const theme = getComputedStyle(document.documentElement);
    const shellBg = theme.getPropertyValue('--graph-shell-bg').trim() || '#0b0f17';
    const plotBg = theme.getPropertyValue('--graph-plot-bg').trim() || '#080c13';
    const gridColor = theme.getPropertyValue('--graph-grid').trim() || 'rgba(30,45,66,.6)';
    const mutedSoft = theme.getPropertyValue('--graph-muted-soft').trim() || 'rgba(71,85,105,.5)';
    const pad = { t: 22, r: 16, b: 38, l: 52 };
    const pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;
    ctx.fillStyle = shellBg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = plotBg; ctx.fillRect(pad.l, pad.t, pw, ph);
    const nodata = this.data.length < 2;
    if (nodata) {
      ctx.fillStyle = mutedSoft; ctx.font = '11px DM Sans,sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(`${this.yvar || '?'} vs ${this.xvar} — simulação parada`, pad.l + pw / 2, pad.t + ph / 2);
      this._labels(ctx, pad, pw, ph, W, H, 0, 1, 0, 1); return;
    }
    let xmin = this.xmin, xmax = this.xmax, ymin = this.ymin, ymax = this.ymax;
    if (xmin === xmax) { xmin -= 1; xmax += 1; } if (ymin === ymax) { ymin -= 1; ymax += 1; }
    const xr = xmax - xmin, yr = ymax - ymin;
    const xp = xr * .02, yp = yr * .08;
    const tX = (x: number) => pad.l + ((x - (xmin - xp)) / ((xr + 2 * xp))) * pw;
    const tY = (y: number) => pad.t + ph - ((y - (ymin - yp)) / ((yr + 2 * yp))) * ph;
    ctx.strokeStyle = gridColor; ctx.lineWidth = .5;
    for (let i = 0; i <= 5; i++) {
      const gx = pad.l + (i / 5) * pw; ctx.beginPath(); ctx.moveTo(gx, pad.t); ctx.lineTo(gx, pad.t + ph); ctx.stroke();
      const gy = pad.t + (i / 5) * ph; ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(pad.l + pw, gy); ctx.stroke();
    }
    this._drawCurve(ctx, this.data, tX, tY, this.colors[0], 1.8);
    if (this.data2.length > 1) this._drawCurve(ctx, this.data2, tX, tY, this.colors[1], 1.5);
    if (this.data.length) {
      const [lx, ly] = this.data[this.data.length - 1];
      ctx.beginPath(); ctx.arc(tX(lx), tY(ly), 3.5, 0, Math.PI * 2); ctx.fillStyle = this.colors[0]; ctx.fill();
    }
    if (this.data2.length) {
      const [lx, ly] = this.data2[this.data2.length - 1];
      ctx.beginPath(); ctx.arc(tX(lx), tY(ly), 3, 0, Math.PI * 2); ctx.fillStyle = this.colors[1]; ctx.fill();
    }
    this._labels(ctx, pad, pw, ph, W, H, xmin, xmax, ymin, ymax);
  }

  _drawCurve(ctx: CanvasRenderingContext2D, data: number[][], tX: Function, tY: Function, color: string, lw: number) {
    const pts = data.length > 2500 ? this._lttb(data, 1800) : data;
    ctx.beginPath(); ctx.moveTo(tX(pts[0][0]), tY(pts[0][1]));
    for (let i = 1; i < pts.length; i++) ctx.lineTo(tX(pts[i][0]), tY(pts[i][1]));
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke();
  }

  _lttb(data: number[][], n: number) {
    if (data.length <= n) return data;
    const out = [data[0]]; const bs = (data.length - 2) / (n - 2);
    let li = 0;
    for (let i = 0; i < n - 2; i++) {
      const s = Math.floor((i + 1) * bs) + 1, e = Math.min(Math.floor((i + 2) * bs) + 1, data.length);
      let ax = 0, ay = 0; for (let j = s; j < e; j++) { ax += data[j][0]; ay += data[j][1]; } ax /= (e - s); ay /= (e - s);
      const cs = Math.floor(i * bs) + 1, ce = Math.min(Math.floor((i + 1) * bs) + 1, data.length);
      let mA = -1, mI = cs; const [px, py] = data[li];
      for (let j = cs; j < ce; j++) {
        const A = Math.abs((px - ax) * (data[j][1] - py) - (px - data[j][0]) * (ay - py)) * .5;
        if (A > mA) { mA = A; mI = j; }
      }
      out.push(data[mI]); li = mI;
    }
    out.push(data[data.length - 1]); return out;
  }

  _labels(ctx: CanvasRenderingContext2D, pad: any, pw: number, ph: number, W: number, H: number, xmin: number, xmax: number, ymin: number, ymax: number) {
    const theme = getComputedStyle(document.documentElement);
    const muted = theme.getPropertyValue('--graph-muted').trim() || 'rgba(71,85,105,.9)';
    const accent = theme.getPropertyValue('--graph-accent').trim() || 'rgba(79,158,255,.7)';
    ctx.fillStyle = muted; ctx.font = '10px JetBrains Mono,monospace';
    const xr = xmax - xmin || 1, yr = ymax - ymin || 1;
    const xp = xr * .02, yp = yr * .08;
    const fmt = typeof (window as any).formatVal === 'function' ? (window as any).formatVal : (v: number) => v.toFixed(2);
    ctx.textAlign = 'center';
    for (let i = 0; i <= 5; i++) {
      const v = (xmin - xp) + ((xr + 2 * xp) * i / 5);
      ctx.fillText(fmt(v), pad.l + (i / 5) * pw, pad.t + ph + 14);
    }
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const v = (ymin - yp) + ((yr + 2 * yp) * i / 5);
      ctx.fillText(fmt(v), pad.l - 4, pad.t + ph - (i / 5) * ph + 3);
    }
    ctx.fillStyle = accent; ctx.font = '11px DM Sans,sans-serif';
    ctx.textAlign = 'center'; ctx.fillText(this.xvar, pad.l + pw / 2, H - 4);
    ctx.save(); ctx.translate(12, pad.t + ph / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillText(this.yvar + (this.yvar2 ? ', ' + this.yvar2 : ''), 0, 0); ctx.restore();
  }

  resize() { this.render(); }
}
