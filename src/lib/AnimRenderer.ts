// ── ANIMATION RENDERER ───────────────────────────────
export class AnimRenderer {
  cv: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  ox: number; oy: number; scale: number;
  showGrid: boolean; showAxes: boolean;
  objects: any[];
  _drag: boolean; _lm: number[];
  _w: number; _h: number;
  _initOrigin: boolean;
  onSelect: ((obj: any) => void) | null;
  onDragObj: ((obj: any, wx: number, wy: number, shift: boolean) => void) | null;
  onDragStart: ((obj: any, wx: number, wy: number) => void) | null;
  onDragEnd: (() => void) | null;
  _dragObj: any;
  _hoveredObj: any | null;

  constructor(canvas: HTMLCanvasElement) {
    this.cv = canvas; this.ctx = canvas.getContext('2d')!;
    this.ox = 0; this.oy = 0; this.scale = 30;
    this.showGrid = true; this.showAxes = true;
    this.objects = [];
    this._drag = false; this._lm = [0, 0];
    this._w = 0; this._h = 0;
    this._initOrigin = false;
    this.onSelect = null; this.onDragObj = null; this.onDragStart = null; this.onDragEnd = null;
    this._hoveredObj = null;
    this._dragObj = null;
    this._setupEvents();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const wrap = this.cv.parentElement!;
    const w = wrap.clientWidth; const h = wrap.clientHeight;
    this.cv.width = w * dpr; this.cv.height = h * dpr;
    this.cv.style.width = w + 'px'; this.cv.style.height = h + 'px';
    this.ctx.scale(dpr, dpr);
    this._w = w; this._h = h;
    if (!this._initOrigin) { this.ox = w / 2; this.oy = h / 2; this._initOrigin = true; }
  }

  _setupEvents() {
    this.cv.addEventListener('wheel', e => {
      e.preventDefault();
      const f = e.deltaY < 0 ? 1.12 : 0.88;
      const rect = this.cv.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      this.ox = mx + (this.ox - mx) * f; this.oy = my + (this.oy - my) * f;
      this.scale = Math.max(2, Math.min(5000, this.scale * f));
    }, { passive: false });

    this.cv.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      this._drag = true; this._lm = [e.clientX, e.clientY];
      const rect = this.cv.getBoundingClientRect();
      const px = e.clientX - rect.left, py = e.clientY - rect.top;
      const hit = this._hitTest(px, py);
      if (this.onSelect) this.onSelect(hit);
      this._dragObj = hit || null;
      if (hit && this.onDragStart) {
        const [wx, wy] = this.toMx(px, py);
        this.onDragStart(hit, wx, wy);
      }
    });
    this.cv.addEventListener('mousemove', e => {
      const rect = this.cv.getBoundingClientRect();
      const px = e.clientX - rect.left, py = e.clientY - rect.top;
      const hovered = this._hitTest(px, py);
      this._hoveredObj = hovered;
      this.cv.style.cursor = hovered ? 'grab' : 'default';
    });
    window.addEventListener('mousemove', e => {
      if (this._drag) {
        if (this._dragObj && this.onDragObj) {
          const rect = this.cv.getBoundingClientRect();
          const px = e.clientX - rect.left, py = e.clientY - rect.top;
          const [wx, wy] = this.toMx(px, py);
          this.cv.style.cursor = 'grabbing';
          this.onDragObj(this._dragObj, wx, wy, e.shiftKey);
        } else {
          this.ox += e.clientX - this._lm[0]; this.oy += e.clientY - this._lm[1];
          this.cv.style.cursor = 'move';
        }
        this._lm = [e.clientX, e.clientY];
      }
      const rect = this.cv.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const wx = (mx - this.ox) / this.scale, wy = (this.oy - my) / this.scale;
      const cd = document.getElementById('coord-disp');
      if (cd) cd.textContent = `x: ${wx.toFixed(2)}  y: ${wy.toFixed(2)}  ${this._drag && this._dragObj ? '[arrastar obj]' : this._drag ? '[mover câmera]' : '| drag=mover | ⇧drag=IC'}`;
    });
    window.addEventListener('mouseup', () => { this._drag = false; this._dragObj = null; this.cv.style.cursor = this._hoveredObj ? 'grab' : 'default'; });
  }

  toPx(mx: number, my: number): [number, number] { return [this.ox + mx * this.scale, this.oy - my * this.scale]; }
  toMx(px: number, py: number): [number, number] { return [(px - this.ox) / this.scale, (this.oy - py) / this.scale]; }

  _hitTest(px: number, py: number) {
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const o = this.objects[i];
      if (!o.visible) continue;
      const rx = o._rx || 0, ry = o._ry || 0;
      if (o.type === 'particle' || o.type === 'pendulum') {
        const [opx, opy] = this.toPx(rx, ry); const r = (o.radius || 8) + 4;
        if (Math.hypot(px - opx, py - opy) < r) return o;
      } else if (o.type === 'circle') {
        const [opx, opy] = this.toPx(rx, ry); const r = (o._rr || 1) * this.scale + 6;
        if (Math.hypot(px - opx, py - opy) < r) return o;
      } else if (o.type === 'spring' || o.type === 'rect') {
        const [opx, opy] = this.toPx(rx, ry);
        if (Math.hypot(px - opx, py - opy) < 20) return o;
      } else if (o.type === 'vector' || o.type === 'label') {
        const [opx, opy] = this.toPx(rx, ry);
        if (Math.hypot(px - opx, py - opy) < 14) return o;
      } else if (o.type === 'vectorfield') {
        const [opx, opy] = this.toPx(rx, ry);
        const pw = (o._rw || 10) * this.scale / 2, ph = (o._rh || 10) * this.scale / 2;
        if (px >= opx - pw && px <= opx + pw && py >= opy - ph && py <= opy + ph) return o;
      }
    }
    return null;
  }

  _evalProp(prop: any, state: Record<string, number>) {
    if (prop === undefined || prop === null || prop === '') return 0;
    const s = String(prop).trim();
    if (!isNaN(s as any)) return parseFloat(s);
    const lo = s.toLowerCase();
    if (state[lo] !== undefined && isFinite(state[lo])) return state[lo];
    try {
      const vars = Object.keys(state).map(k => `const ${k}=${state[k]};`).join('');
      return Function(vars + ' return ' + lo + ';')();
    } catch (e) { return 0; }
  }

  clearTrails() { this.objects.forEach(o => { o._trail = []; }); }

  render(state: Record<string, number>) {
    const ctx = this.ctx; const w = this._w; const h = this._h;
    if (w <= 0 || h <= 0) return;
    ctx.clearRect(0, 0, w, h);
    const canvasBg = getComputedStyle(document.documentElement).getPropertyValue('--canvas-bg').trim() || '#080c13';
    ctx.fillStyle = canvasBg; ctx.fillRect(0, 0, w, h);
    if (this.showGrid) this._drawGrid(ctx, w, h);
    if (this.showAxes) this._drawAxes(ctx, w, h);
    this.objects.forEach(o => { if (o.visible !== false) this._drawObj(ctx, o, state); });
  }

  _drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const u = this.scale;
    const isLight = document.documentElement.classList.contains('light');
    const ox = ((this.ox % u) + u) % u, oy = ((this.oy % u) + u) % u;
    ctx.strokeStyle = isLight ? 'rgba(160,185,220,.18)' : 'rgba(30,45,66,.5)'; ctx.lineWidth = .5;
    for (let x = ox; x < w; x += u) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = oy; y < h; y += u) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    const M = u * 5; const ox2 = ((this.ox % M) + M) % M, oy2 = ((this.oy % M) + M) % M;
    ctx.strokeStyle = isLight ? 'rgba(120,155,200,.28)' : 'rgba(30,55,80,.8)'; ctx.lineWidth = .8;
    for (let x = ox2; x < w; x += M) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = oy2; y < h; y += M) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  }

  _drawAxes(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const isLight = document.documentElement.classList.contains('light');
    ctx.strokeStyle = 'rgba(79,158,255,.4)'; ctx.lineWidth = 1.5;
    if (this.ox > 0 && this.ox < w) { ctx.beginPath(); ctx.moveTo(this.ox, 0); ctx.lineTo(this.ox, h); ctx.stroke(); }
    if (this.oy > 0 && this.oy < h) { ctx.beginPath(); ctx.moveTo(0, this.oy); ctx.lineTo(w, this.oy); ctx.stroke(); }
    ctx.fillStyle = isLight ? 'rgba(51,65,85,.88)' : 'rgba(71,85,105,.9)'; ctx.font = '9px JetBrains Mono,monospace'; ctx.textAlign = 'center';
    const s = this.scale; const every = Math.max(1, Math.round(50 / s));
    for (let i = Math.floor((-this.ox) / s); i < (w - this.ox) / s; i++) {
      if (i === 0 || i % every !== 0) continue;
      const px = this.ox + i * s; if (px < 10 || px > w - 10) continue;
      ctx.fillText(String(i), px, Math.min(Math.max(this.oy + 11, 11), h - 3));
    }
    ctx.textAlign = 'right';
    for (let i = Math.floor((this.oy - h) / s); i < this.oy / s; i++) {
      if (i === 0 || i % every !== 0) continue;
      const py = this.oy - i * s; if (py < 10 || py > h - 10) continue;
      ctx.fillText(String(i), Math.min(Math.max(this.ox - 4, 28), w - 3), py + 3);
    }
  }

  // ── Draw selection/hover ring + drag handle ────────────────────────────
  _drawSelectionRing(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, sel: boolean, hov: boolean) {
    if (!sel && !hov) return;
    ctx.save();
    // Outer glow
    ctx.beginPath();
    ctx.arc(cx, cy, r + (sel ? 6 : 4), 0, Math.PI * 2);
    ctx.strokeStyle = sel ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)';
    ctx.lineWidth = sel ? 4 : 3;
    ctx.stroke();
    // Main ring
    ctx.beginPath();
    ctx.arc(cx, cy, r + (sel ? 3 : 2), 0, Math.PI * 2);
    ctx.strokeStyle = sel ? '#fff' : 'rgba(255,255,255,0.5)';
    ctx.lineWidth = sel ? 2 : 1.5;
    ctx.setLineDash(sel ? [] : [4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    // Drag handle icon (only when selected)
    if (sel) {
      const hs = 5;
      const dist = r + 8;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      [[-hs,-hs],[-hs,hs],[hs,-hs],[hs,hs]].forEach(([dx,dy]) => {
        const mag = Math.sqrt(dx*dx + dy*dy);
        const px = cx + dx / mag * dist;
        const py = cy + dy / mag * dist;
        ctx.beginPath(); ctx.arc(px, py, 1.8, 0, Math.PI*2); ctx.fill();
      });
    }
    ctx.restore();
  }

  _drawSelectionBox(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, sel: boolean, hov: boolean) {
    if (!sel && !hov) return;
    ctx.save();
    const pad = sel ? 5 : 3;
    // Glow
    ctx.strokeStyle = sel ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)';
    ctx.lineWidth = sel ? 4 : 3;
    ctx.strokeRect(cx - w/2 - pad - 2, cy - h/2 - pad - 2, w + (pad+2)*2, h + (pad+2)*2);
    // Main border
    ctx.strokeStyle = sel ? '#fff' : 'rgba(255,255,255,0.5)';
    ctx.lineWidth = sel ? 2 : 1.5;
    ctx.setLineDash(sel ? [] : [4, 3]);
    ctx.strokeRect(cx - w/2 - pad, cy - h/2 - pad, w + pad*2, h + pad*2);
    ctx.setLineDash([]);
    // Corner handles
    if (sel) {
      const hs = 4;
      ctx.fillStyle = '#fff';
      [[cx-w/2-pad, cy-h/2-pad],[cx+w/2+pad, cy-h/2-pad],
       [cx-w/2-pad, cy+h/2+pad],[cx+w/2+pad, cy+h/2+pad]].forEach(([hx,hy]) => {
        ctx.fillRect(hx - hs/2, hy - hs/2, hs, hs);
      });
    }
    ctx.restore();
  }

  _drawVectorProjections(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string) {
    ctx.save();
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 0.85;
    ctx.beginPath(); ctx.moveTo(x2, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y2); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.restore();

    if (Math.abs(x2 - x1) > 4) {
      ctx.save();
      ctx.globalAlpha = 0.65;
      this._arrow(ctx, x1, y1, x2, y1, color, 1.2);
      ctx.restore();
    }
    if (Math.abs(y2 - y1) > 4) {
      ctx.save();
      ctx.globalAlpha = 0.65;
      this._arrow(ctx, x1, y1, x1, y2, color, 1.2);
      ctx.restore();
    }
  }

  _getVectorLabelAnchors(x1: number, y1: number, x2: number, y2: number) {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const yOffset = y2 >= y1 ? 14 : -8;
    const xOffset = x2 >= x1 ? 6 : -6;
    return {
      vector: { x: midX + 5, y: midY - 6, align: 'left' as CanvasTextAlign },
      magnitude: { x: midX + 5, y: midY - 18, align: 'left' as CanvasTextAlign },
      projX: { x: midX, y: y1 + yOffset, align: 'center' as CanvasTextAlign },
      projY: { x: x1 + xOffset, y: midY + 3, align: x2 >= x1 ? 'left' as CanvasTextAlign : 'right' as CanvasTextAlign },
    };
  }

  _renderTemplate(text: string, state: Record<string, number>, extra: Record<string, number | string> = {}) {
    return String(text).replace(/\{(\w+)(?::(\d+))?\}/g, (_: string, key: string, digits: string) => {
      const lookup = key.toLowerCase();
      const val = extra[lookup] ?? extra[key] ?? state[lookup];
      if (val === undefined) return key;
      if (typeof val === 'number') return Number(val).toFixed(digits !== undefined ? parseInt(digits) : 2);
      return String(val);
    });
  }

  _drawVectorText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, align: CanvasTextAlign, state: Record<string, number>, extra: Record<string, number | string>) {
    if (!text) return;
    const rendered = this._renderTemplate(text, state, extra);
    ctx.fillStyle = color;
    ctx.font = '10px DM Sans,sans-serif';
    ctx.textAlign = align;
    ctx.fillText(rendered, x, y);
  }

  _drawObj(ctx: CanvasRenderingContext2D, o: any, state: Record<string, number>) {
    const g = (k: string) => this._evalProp(o[k], state);
    const color = o.color || '#4f9eff';
    const sel = o._selected;
    const hov = this._hoveredObj === o && !sel;
    const vox = o._vox || 0, voy = o._voy || 0;
    const rotDeg = parseFloat(o.rotation) || 0;
    const rot = rotDeg * Math.PI / 180;

    if (o.type === 'particle') {
      const mx = g('x') + vox, my = g('y') + voy;
      o._rx = mx; o._ry = my;
      const [px, py] = this.toPx(mx, my);
      const r = o.radius || 8;
      if (!o._trail) o._trail = [];
      const tmode = o.trailMode || 'persist';
      if (tmode !== 'none') {
        if (tmode === 'dots') {
          const last = o._trail[o._trail.length - 1];
          const ghostSpacingPx = Math.max(r * 0.9, 5);
          if (!last || Math.hypot(mx - last[0], my - last[1]) * this.scale >= ghostSpacingPx) o._trail.push([mx, my, rotDeg]);
          const maxLen = o.trailLen || 300;
          if (o._trail.length > maxLen) o._trail.shift();
        } else {
          o._trail.push([mx, my]);
          const maxLen = o.trailLen || 300;
          if (tmode === 'fade' && o._trail.length > maxLen) o._trail.shift();
        }
        if (o.showTrail !== false && o._trail.length > 0) {
          if (tmode === 'dots') {
            const ghostCount = o._trail.length;
            for (let i = 0; i < ghostCount - 1; i++) {
              const [gx, gy, grot] = o._trail[i];
              const [gpx, gpy] = this.toPx(gx, gy);
              const frac = i / ghostCount, alpha = 0.07 + frac * 0.25;
              ctx.save(); ctx.globalAlpha = alpha; ctx.translate(gpx, gpy); ctx.rotate((grot || 0) * Math.PI / 180);
              if (o.useImage && o._imgEl && o._imgEl.complete && o._imgEl.naturalWidth > 0) {
                const d = r * 2; ctx.drawImage(o._imgEl, -d / 2, -d / 2, d, d);
              } else { ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = o.color || color; ctx.fill(); }
              ctx.restore();
            }
            ctx.globalAlpha = 1;
          } else if (o._trail.length > 1) {
            ctx.beginPath();
            const [x0, y0] = this.toPx(o._trail[0][0], o._trail[0][1]); ctx.moveTo(x0, y0);
            for (let i = 1; i < o._trail.length; i++) { const [xi, yi] = this.toPx(o._trail[i][0], o._trail[i][1]); ctx.lineTo(xi, yi); }
            ctx.strokeStyle = o.trailColor || color; ctx.globalAlpha = tmode === 'fade' ? .25 : .38; ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha = 1;
            if (tmode === 'fade' && o._trail.length > 10) {
              const fresh = o._trail.slice(-Math.min(40, o._trail.length));
              ctx.beginPath();
              const [fx0, fy0] = this.toPx(fresh[0][0], fresh[0][1]); ctx.moveTo(fx0, fy0);
              fresh.forEach(([xi, yi]: number[]) => { const [fpx, fpy] = this.toPx(xi, yi); ctx.lineTo(fpx, fpy); });
              ctx.strokeStyle = o.trailColor || color; ctx.globalAlpha = .7; ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha = 1;
            }
          }
        }
      }
      if (o.showVec && (o.vx || o.vy)) {
        const vx = g('vx'), vy = g('vy'), vs = o.vecScale || 0.3;
        const vecCol = o.vecColor || '#34d399';
        const projColor = o.projColor || vecCol;
        const [ex, ey] = this.toPx(mx + vx * vs, my + vy * vs);
        const vectorTextVars = { vx, vy, mag: Math.hypot(vx, vy), mod: Math.hypot(vx, vy) };
        const anchors = this._getVectorLabelAnchors(px, py, ex, ey);
        if (o.showVecProj !== false) {
          this._drawVectorProjections(ctx, px, py, ex, ey, projColor);
          this._drawVectorText(ctx, o.projXLabel || '', anchors.projX.x, anchors.projX.y, projColor, anchors.projX.align, state, vectorTextVars);
          this._drawVectorText(ctx, o.projYLabel || '', anchors.projY.x, anchors.projY.y, projColor, anchors.projY.align, state, vectorTextVars);
        }
        this._arrow(ctx, px, py, ex, ey, vecCol, 2);
        this._drawVectorText(ctx, o.vecLabel || '', anchors.vector.x, anchors.vector.y, vecCol, anchors.vector.align, state, vectorTextVars);
        this._drawVectorText(ctx, o.magLabel || '', anchors.magnitude.x, anchors.magnitude.y, vecCol, anchors.magnitude.align, state, vectorTextVars);
      }
      ctx.save(); ctx.translate(px, py); ctx.rotate(rot);
      if (o.useImage && o._imgEl && o._imgEl.complete && o._imgEl.naturalWidth > 0) {
        ctx.drawImage(o._imgEl, -r, -r, r * 2, r * 2);
      } else { ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); }
      ctx.restore();
      this._drawSelectionRing(ctx, px, py, r, sel, hov);
      if (o.label) {
        const isLight = document.documentElement.classList.contains('light');
        ctx.fillStyle = isLight ? 'rgba(26,34,54,.9)' : 'rgba(226,232,240,.85)';
        ctx.font = '11px DM Sans,sans-serif'; ctx.textAlign = 'left'; ctx.fillText(this._renderTemplate(o.label, state), px + r + 4, py - 4);
      }

    } else if (o.type === 'pendulum') {
      const theta = g('theta');
      const Lval = (typeof o.L === 'string' && isNaN(o.L)) ? (this._evalProp(o.L, state) || 1.5) : (o.L || 1.5);
      const pivX = (this._evalProp(o.pivotX, state) || 0) + vox, pivY = (this._evalProp(o.pivotY, state) || 0) + voy;
      const [ppx, ppy] = this.toPx(pivX, pivY);
      const bobX = pivX + Math.sin(theta) * Lval, bobY = pivY - Math.cos(theta) * Lval;
      const [bpx, bpy] = this.toPx(bobX, bobY);
      o._rx = bobX; o._ry = bobY;
      if (!o._trail) o._trail = [];
      const ptmode = o.trailMode || 'persist';
      if (ptmode !== 'none') {
        o._trail.push([bobX, bobY]);
        const maxLen = o.trailLen || 400;
        if (ptmode === 'fade' && o._trail.length > maxLen) o._trail.shift();
        if (o.showTrail !== false && o._trail.length > 1) {
          ctx.beginPath();
          const [tx0, ty0] = this.toPx(o._trail[0][0], o._trail[0][1]); ctx.moveTo(tx0, ty0);
          for (let i = 1; i < o._trail.length; i++) { const [txi, tyi] = this.toPx(o._trail[i][0], o._trail[i][1]); ctx.lineTo(txi, tyi); }
          ctx.strokeStyle = color; ctx.globalAlpha = ptmode === 'fade' ? .3 : .4; ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha = 1;
        }
      }
      ctx.strokeStyle = o.rodColor || '#94a3b8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ppx, ppy); ctx.lineTo(bpx, bpy); ctx.stroke();
      ctx.beginPath(); ctx.arc(ppx, ppy, 4, 0, Math.PI * 2); ctx.fillStyle = '#475569'; ctx.fill();
      ctx.save(); ctx.translate(bpx, bpy); ctx.rotate(rot);
      ctx.beginPath(); ctx.arc(0, 0, o.radius || 10, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
      ctx.restore();
      this._drawSelectionRing(ctx, bpx, bpy, o.radius || 10, sel, hov);

    } else if (o.type === 'spring') {
      const isVert = o.vertical === true || o.vertical === 'true';
      const pivX = (this._evalProp(o.pivotX !== undefined ? o.pivotX : o.x1, state) || 0) + vox;
      const pivY = (this._evalProp(o.pivotY !== undefined ? o.pivotY : o.y1, state) || 0) + voy;
      const blockPos = this._evalProp(isVert ? o.y : o.x, state);
      let bx: number, by: number;
      if (isVert) { bx = pivX; by = blockPos; } else { bx = blockPos; by = pivY; }
      o._rx = bx; o._ry = by;
      const [ppx2, ppy2] = this.toPx(pivX, pivY);
      const [bpx2, bpy2] = this.toPx(bx, by);
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ppx2, ppy2 - 12); ctx.lineTo(ppx2, ppy2); ctx.stroke();
      this._spring(ctx, ppx2, ppy2, bpx2, bpy2, color, o.coils || 10);
      const bsize = 20;
      ctx.fillStyle = 'rgba(79,158,255,.25)'; ctx.strokeStyle = color; ctx.lineWidth = 1.5;
      ctx.fillRect(bpx2 - bsize / 2, bpy2 - bsize / 2, bsize, bsize);
      ctx.strokeRect(bpx2 - bsize / 2, bpy2 - bsize / 2, bsize, bsize);
      this._drawSelectionBox(ctx, bpx2, bpy2, bsize, bsize, sel, hov);

    } else if (o.type === 'vector') {
      const vx2 = g('vx'), vy2 = g('vy'), vs2 = o.scale || 0.3;
      const sx = (g('x') || 0) + vox, sy = (g('y') || 0) + voy;
      o._rx = sx; o._ry = sy;
      const [spx, spy] = this.toPx(sx, sy);
      const [epx, epy] = this.toPx(sx + vx2 * vs2, sy + vy2 * vs2);
      const vectorTextVars = { vx: vx2, vy: vy2, mag: Math.hypot(vx2, vy2), mod: Math.hypot(vx2, vy2) };
      const anchors = this._getVectorLabelAnchors(spx, spy, epx, epy);
      if (o.showProj) {
        this._drawVectorProjections(ctx, spx, spy, epx, epy, o.projColor || color);
        this._drawVectorText(ctx, o.projXLabel || '', anchors.projX.x, anchors.projX.y, o.projColor || color, anchors.projX.align, state, vectorTextVars);
        this._drawVectorText(ctx, o.projYLabel || '', anchors.projY.x, anchors.projY.y, o.projColor || color, anchors.projY.align, state, vectorTextVars);
      }
      ctx.save(); ctx.translate(spx, spy); ctx.rotate(rot); ctx.translate(-spx, -spy);
      this._arrow(ctx, spx, spy, epx, epy, color, o.lineWidth || 2);
      ctx.restore();
      this._drawVectorText(ctx, o.vecLabel || '', anchors.vector.x, anchors.vector.y, color, anchors.vector.align, state, vectorTextVars);
      this._drawVectorText(ctx, o.magLabel || '', anchors.magnitude.x, anchors.magnitude.y, color, anchors.magnitude.align, state, vectorTextVars);
      this._drawSelectionRing(ctx, spx, spy, 6, sel, hov);

    } else if (o.type === 'circle') {
      const cx = (g('x') || 0) + vox, cy = (g('y') || 0) + voy;
      const rr = this._evalProp(o.r, state) || 1;
      o._rx = cx; o._ry = cy; o._rr = rr;
      const [cpx, cpy] = this.toPx(cx, cy);
      const rpx = rr * this.scale;
      ctx.save(); ctx.translate(cpx, cpy); ctx.rotate(rot);
      if (o.useImage && o._imgEl && o._imgEl.complete && o._imgEl.naturalWidth > 0) {
        ctx.drawImage(o._imgEl, -rpx, -rpx, rpx * 2, rpx * 2);
      } else {
        ctx.beginPath(); ctx.arc(0, 0, rpx, 0, Math.PI * 2);
        ctx.fillStyle = o.fillColor || 'rgba(79,158,255,.15)'; ctx.fill();
        ctx.strokeStyle = color; ctx.lineWidth = o.lineWidth || 1.5; ctx.stroke();
      }
      ctx.restore();
      this._drawSelectionRing(ctx, cpx, cpy, rpx, sel, hov);

    } else if (o.type === 'rect') {
      const rx = (g('x') || 0) + vox, ry = (g('y') || 0) + voy;
      const rw = g('w') || g('width') || 1, rh2 = g('h') || g('height') || 1;
      const [px2, py2] = this.toPx(rx, ry);
      const pw2 = rw * this.scale, ph2 = rh2 * this.scale;
      ctx.save(); ctx.translate(px2, py2); ctx.rotate(rot);
      if (o.useImage && o._imgEl && o._imgEl.complete && o._imgEl.naturalWidth > 0) {
        ctx.drawImage(o._imgEl, -pw2 / 2, -ph2 / 2, pw2, ph2);
      } else {
        ctx.fillStyle = o.fillColor || 'rgba(79,158,255,.12)'; ctx.fillRect(-pw2 / 2, -ph2 / 2, pw2, ph2);
        ctx.strokeStyle = color; ctx.lineWidth = o.lineWidth || 1.5; ctx.strokeRect(-pw2 / 2, -ph2 / 2, pw2, ph2);
      }
      ctx.restore();
      this._drawSelectionBox(ctx, px2, py2, pw2, ph2, sel, hov);
      o._rx = rx; o._ry = ry;

    } else if (o.type === 'label') {
      const lx = (g('x') || 0) + vox, ly = (g('y') || 0) + voy;
      const [lpx, lpy] = this.toPx(lx, ly);
      const text = o.text || o.label || 'Texto';
      const rendered = this._renderTemplate(text, state);
      ctx.save(); ctx.translate(lpx, lpy); ctx.rotate(rot);
      ctx.fillStyle = color; ctx.font = `${o.fontSize || 13}px DM Sans,sans-serif`;
      ctx.textAlign = 'left'; ctx.fillText(rendered, 0, 0);
      ctx.restore();
      o._rx = lx; o._ry = ly;

    } else if (o.type === 'vectorfield') {
      const vfx = (g('x') || 0) + vox, vfy = (g('y') || 0) + voy;
      const R = o.gridRange || 5;
      const vfw = R * 2, vfh = R * 2;
      const fxStr = o.fxExpr || '-y', fyStr = o.fyExpr || 'x';
      const fzStr: string | undefined = o.fzExpr && o.fzExpr.trim() !== '' ? o.fzExpr : undefined;
      const baseColor2 = o.color || '#4f9eff';
      let cr = 79, cg = 158, cb = 255;
      const hm = baseColor2.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
      if (hm) { cr = parseInt(hm[1], 16); cg = parseInt(hm[2], 16); cb = parseInt(hm[3], 16); }
      let fxFn: Function, fyFn: Function, fzFn: Function | null = null;
      try { fxFn = new Function('x', 'y', 't', 'Math', `return ${fxStr.replace(/\^/g, '**')};`); } catch (e) { fxFn = () => 0; }
      try { fyFn = new Function('x', 'y', 't', 'Math', `return ${fyStr.replace(/\^/g, '**')};`); } catch (e) { fyFn = () => 0; }
      if (fzStr) { try { fzFn = new Function('x', 'y', 't', 'Math', `return ${fzStr.replace(/\^/g, '**')};`); } catch (e) { fzFn = null; } }
      const T = state.t || 0;
      const vfMode = o.vfMode || 'arrows'; // 'arrows' | 'fieldlines'

      // ── Mapa de cor Fz: azul(neg) → branco(zero) → vermelho(pos) ────────
      // Coleta min/max de Fz numa grade grosseira para normalizar
      let fzMin = 0, fzMax = 0;
      if (fzFn) {
        const SN = 10, SR = R * 2 / (SN - 1);
        for (let i = 0; i < SN; i++) for (let j = 0; j < SN; j++) {
          try {
            const v = fzFn(-R + i * SR, -R + j * SR, T, Math);
            if (isFinite(v)) { fzMin = Math.min(fzMin, v); fzMax = Math.max(fzMax, v); }
          } catch (_) {}
        }
        // Simetria: usa o maior absoluto para escala centrada no zero
        const fzAbs = Math.max(Math.abs(fzMin), Math.abs(fzMax)) || 1;
        fzMin = -fzAbs; fzMax = fzAbs;
      }

      // Retorna rgba baseado em Fz ou na cor base+magnitude
      const getColor = (x: number, y: number, norm: number, alpha: number): string => {
        if (fzFn) {
          let fz = 0;
          try { fz = fzFn(x, y, T, Math); } catch (_) {}
          // t ∈ [-1, 1]
          const t2 = Math.max(-1, Math.min(1, fz / (fzMax || 1)));
          let r2: number, g2: number, b2: number;
          if (t2 >= 0) {
            // zero→branco→vermelho
            r2 = 255;
            g2 = Math.round(255 * (1 - t2));
            b2 = Math.round(255 * (1 - t2));
          } else {
            // zero→branco→azul
            r2 = Math.round(255 * (1 + t2));
            g2 = Math.round(255 * (1 + t2));
            b2 = 255;
          }
          return `rgba(${r2},${g2},${b2},${(alpha * 0.9).toFixed(2)})`;
        }
        const br = Math.round(cr + (255 - cr) * norm * 0.35);
        const bg2 = Math.round(cg + (255 - cg) * norm * 0.35);
        const bb = Math.round(cb + (255 - cb) * norm * 0.35);
        return `rgba(${br},${bg2},${bb},${alpha.toFixed(2)})`;
      };

      if (vfMode === 'fieldlines') {
        // ── Linhas de campo: grade uniforme + integração RK4 bidirecional ──
        const numSeeds  = o.fieldSeeds || 16;
        const steps     = o.fieldSteps || 300;
        const ds        = o.fieldDs    || 0.04;
        const lineAlpha = 0.85;
        const lw        = o.lineWidth  || 1.5;

        // Campo normalizado (só direção, integração estável)
        const field = (x: number, y: number): [number, number] => {
          let fx = 0, fy = 0;
          try { fx = fxFn(x, y, T, Math); fy = fyFn(x, y, T, Math); } catch (_) {}
          const mag = Math.hypot(fx, fy) || 1e-10;
          return [fx / mag, fy / mag];
        };

        const rk4Step = (x: number, y: number, h: number): [number, number] => {
          const [k1x, k1y] = field(x, y);
          const [k2x, k2y] = field(x + h * k1x / 2, y + h * k1y / 2);
          const [k3x, k3y] = field(x + h * k2x / 2, y + h * k2y / 2);
          const [k4x, k4y] = field(x + h * k3x, y + h * k3y);
          return [
            x + h * (k1x + 2 * k2x + 2 * k3x + k4x) / 6,
            y + h * (k1y + 2 * k2y + 2 * k3y + k4y) / 6,
          ];
        };

        // Integração em uma direção; limites iguais ao domínio do modo setas
        const traceDir = (sx: number, sy: number, dir: number): [number, number][] => {
          const pts: [number, number][] = [[sx, sy]];
          let cx2 = sx, cy2 = sy;
          for (let i = 0; i < steps; i++) {
            const [nx, ny] = rk4Step(cx2, cy2, ds * dir);
            if (Math.abs(nx) > R * 1.02 || Math.abs(ny) > R * 1.02) break;
            if (Math.hypot(nx - cx2, ny - cy2) < 1e-9) break; // ponto fixo
            pts.push([nx, ny]);
            cx2 = nx; cy2 = ny;
          }
          return pts;
        };

        // ── Grade uniforme de sementes sobre [-R, R]² ────────────────────
        // Mesma abordagem do modo setas: cobre todo o domínio linearmente.
        // numSeeds é interpretado como n×n (ex: 16 → 4×4, 25 → 5×5).
        const n = Math.max(2, Math.round(Math.sqrt(numSeeds)));
        const margin = R * 0.06;
        const seedPoints: [number, number][] = [];
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            const sx = -R + margin + (2 * (R - margin) * i) / (n - 1);
            const sy = -R + margin + (2 * (R - margin) * j) / (n - 1);
            seedPoints.push([sx, sy]);
          }
        }

        for (const [sx, sy] of seedPoints) {
          const fwdPts = traceDir(sx, sy, +1);
          const bwdPts = traceDir(sx, sy, -1);
          // Linha completa: segmento traseiro invertido + segmento frontal
          const allPts = [...bwdPts.slice().reverse(), ...fwdPts.slice(1)];
          if (allPts.length < 2) continue;

          // Cor calculada no ponto da semente (estável, não muda por passo)
          const seedNorm  = Math.min(Math.hypot(sx, sy) / R, 1);
          const lineColor = getColor(sx, sy, seedNorm, lineAlpha);

          ctx.beginPath();
          for (let i = 0; i < allPts.length; i++) {
            const [wx, wy] = allPts[i];
            const [px2, py2] = this.toPx(wx, wy);
            if (i === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);
          }
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = lw;
          ctx.stroke();

          // Seta de direção num único ponto a ~40% do segmento frontal
          if (fwdPts.length > 8) {
            const ai  = Math.floor(fwdPts.length * 0.4);
            const ai2 = Math.min(ai + 4, fwdPts.length - 1);
            const [wx1, wy1] = fwdPts[ai];
            const [wx2, wy2] = fwdPts[ai2];
            const [apx2, apy2] = this.toPx(wx1, wy1);
            const [aex3, aey3] = this.toPx(wx2, wy2);
            if (Math.hypot(aex3 - apx2, aey3 - apy2) > 4) {
              this._arrow(ctx, apx2, apy2, aex3, aey3, lineColor, lw * 1.1);
            }
          }
        }

      } else {
        // ── Vetores (modo padrão) ─────────────────────────────────────────
        const N = o.gridN || 14;
        const arrowScale = o.arrowScale || 0.4;
        const step = R * 2 / (N - 1);
        const maxMag = (() => {
          let m = 0;
          for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
            const xi = -R + i * step, yj = -R + j * step;
            try { m = Math.max(m, Math.hypot(fxFn(xi, yj, T, Math), fyFn(xi, yj, T, Math))); } catch (_) {}
          }
          return m || 1;
        })();
        for (let i = 0; i < N; i++) {
          for (let j = 0; j < N; j++) {
            const xi = -R + i * step, yj = -R + j * step;
            let fx = 0, fy = 0;
            try { fx = fxFn(xi, yj, T, Math); fy = fyFn(xi, yj, T, Math); } catch (_) {}
            if (!isFinite(fx) || !isFinite(fy)) continue;
            const mag = Math.hypot(fx, fy), norm = mag / maxMag;
            const alpha2 = 0.22 + norm * 0.68;
            const len = norm * step * arrowScale * this.scale;
            if (len < 1) continue;
            const [apx, apy] = this.toPx(xi, yj);
            const angle = Math.atan2(-fy, fx);
            const aex = apx + len * Math.cos(angle), aey = apy + len * Math.sin(angle);
            this._arrow(ctx, apx, apy, aex, aey, getColor(xi, yj, norm, alpha2), 0.9 + norm * 0.6);
          }
        }
      }
      o._rx = vfx;
      o._ry = vfy;
      o._rw = vfw;
      o._rh = vfh;
      const [vfpx, vfpy] = this.toPx(vfx, vfy);
      const vfpw = vfw * this.scale, vfph = vfh * this.scale;
      this._drawSelectionBox(ctx, vfpx, vfpy, vfpw, vfph, sel, hov);
    }
    if (sel && (o.type === 'vector' || o.type === 'label')) {
      const [spx2, spy2] = this.toPx((g('x') || 0) + vox, (g('y') || 0) + voy);
      ctx.beginPath(); ctx.arc(spx2, spy2, 6, 0, Math.PI * 2); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    }
  }

  _arrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, lw: number) {
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    if (len < 1) return;
    const hl = Math.min(14, len * .4), a = Math.atan2(dy, dx);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - hl * Math.cos(a - .42), y2 - hl * Math.sin(a - .42));
    ctx.lineTo(x2 - hl * Math.cos(a + .42), y2 - hl * Math.sin(a + .42));
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  }

  _spring(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, coils: number) {
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    if (len < 2) return;
    const ux = dx / len, uy = dy / len, nx = -uy, ny = ux, amp = 8, segs = coils * 2;
    ctx.beginPath(); ctx.moveTo(x1, y1);
    for (let i = 0; i <= segs; i++) {
      const t = i / segs, side = (i % 2 === 0) ? amp : -amp;
      ctx.lineTo(x1 + t * dx + side * nx, y1 + t * dy + side * ny);
    }
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
  }
}
