'use strict';

// ── THEME ──────────────────────────────────────────────
(function(){
  // Load saved preference; default = dark
  const saved = localStorage.getItem('boscolab-theme') || 'dark';
  if (saved === 'light') document.documentElement.classList.add('light');
  // Set correct icon on load
  // theme button set in init()
})();

function toggleTheme() {
  const root = document.documentElement;
  const isLight = root.classList.toggle('light');
  const btn = document.getElementById('theme-btn');
  btn.textContent = isLight ? '🌣' : '☾';
  localStorage.setItem('boscolab-theme', isLight ? 'light' : 'dark');
  // Update canvas background immediately
  const wrap = document.getElementById('anim-wrap');
  if (wrap) {
    const bg = getComputedStyle(root).getPropertyValue('--canvas-bg').trim();
    // canvas repaint happens in renderLoop automatically
  }
}
// ── END THEME ──────────────────────────────────────────
// ══════════════════════════════════════════════════════
// 1. MODEL PARSER
// ══════════════════════════════════════════════════════
class ModelParser {
  parse(src) {
    const lines = src.split('\n');
    const equations = [], errors = [];
    const stateVars = new Set(), constVars = {}, derivedVars = new Set(), allVars = new Set();

    lines.forEach((raw, idx) => {
      const line = raw.replace(/\/\/.*$/, '').replace(/#.*$/, '').trim();
      if (!line) return;
      let m;
      // iterative: x(t+dt) = ...
      if ((m = line.match(/^(\w+)\s*\(\s*t\s*\+\s*dt\s*\)\s*=\s*(.+)$/i))) {
        const v = m[1].toLowerCase(); stateVars.add(v); allVars.add(v);
        equations.push({type:'iterative', var:v, expr:m[2].trim(), line:idx+1}); return;
      }
      // differential: dx/dt = ...
      if ((m = line.match(/^d(\w+)\s*\/\s*dt\s*=\s*(.+)$/i))) {
        const v = m[1].toLowerCase(); stateVars.add(v); allVars.add(v);
        equations.push({type:'differential', var:v, expr:m[2].trim(), line:idx+1}); return;
      }
      // assignment: var = ...
      if ((m = line.match(/^(\w+)\s*=\s*(.+)$/i))) {
        const v = m[1].toLowerCase(); allVars.add(v);
        const rhs = m[2].trim();
        if (!isNaN(rhs)) {
          constVars[v] = parseFloat(rhs);
          equations.push({type:'const', var:v, value:parseFloat(rhs), line:idx+1});
        } else {
          derivedVars.add(v);
          equations.push({type:'derived', var:v, expr:rhs, line:idx+1});
        }
        return;
      }
      errors.push({line:idx+1, msg:`Linha ${idx+1}: não reconhecido: "${raw.trim()}"`});
    });

    const variables = {};
    allVars.forEach(v => {
      if (stateVars.has(v)) variables[v] = {type:'state'};
      else if (constVars[v]!==undefined) variables[v] = {type:'const', value:constVars[v]};
      else if (derivedVars.has(v)) variables[v] = {type:'derived'};
    });
    return {equations, errors, variables, stateVars, constVars};
  }

  compileExpr(expr) {
    // Step 1: replace x(t+dt) refs → _p_x
    let js = expr.replace(/\b([a-zA-Z_]\w*)\s*\(\s*t\s*\+\s*dt\s*\)/gi,
      (_, v) => `_p_${v.toLowerCase()}`);
    // Step 1b: replace x(t) refs → _cur_x  (current-time state references)
    js = js.replace(/\b([a-zA-Z_]\w*)\s*\(\s*t\s*\)/gi,
      (_, v) => `_cur_${v.toLowerCase()}`);
    // Step 2: ^ → **
    js = js.replace(/\^/g, '**');
    // Step 3: context-aware token replacement
    js = js.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g, (match, name, offset, str) => {
      const lo = name.toLowerCase();
      const after = str.slice(offset + match.length).trimStart();
      const isCall = after.startsWith('(');
      if (lo.startsWith('_p_')) return match;   // already handled → keep as-is (will be replaced later)
      if (lo.startsWith('_cur_')) return `s.${lo.slice(5)}`; // x(t) → s.x
      if (isCall) {
        const FNS = {sin:'Math.sin',cos:'Math.cos',tan:'Math.tan',
          asin:'Math.asin',acos:'Math.acos',atan:'Math.atan',atan2:'Math.atan2',
          sqrt:'Math.sqrt',abs:'Math.abs',exp:'Math.exp',ln:'Math.log',
          log:'Math.log10',log10:'Math.log10',floor:'Math.floor',ceil:'Math.ceil',
          round:'Math.round',sign:'Math.sign',min:'Math.min',max:'Math.max',if:'_if'};
        return FNS[lo] || match;
      }
      if (lo==='pi') return 'Math.PI';
      if (lo==='e') return 'Math.E';
      if (lo==='t'||lo==='dt'||lo==='n') return lo;
      return `s.${lo}`;
    });
    return js;
  }
}

// ══════════════════════════════════════════════════════
// 2. SIMULATION ENGINE
// ══════════════════════════════════════════════════════
class SimEngine {
  constructor() {
    this.parser = new ModelParser();
    this.parsed = null;
    this.state = {};
    this.initState = {};
    this.t = 0; this.dt = 0.01; this.tMax = 10; this.n = 0;
    this.method = 'rk4';
    this.history = []; this.maxHist = 150000;
    this.running = false; this.status = 'stopped';
    this.stepsPerFrame = 1;
    this._frameAcc = 0; // for sub-1x speed (e.g. 0.5x)
    this._raf = null;
    this._evalFn = null; this._derivFn = null; this._applyFn = null;
    this.fps = 0; this._fc = 0; this._ft = 0; this._lt = 0;
    this.onStep = null; this.onStatus = null;
  }

  setModel(src) {
    this.parsed = this.parser.parse(src);
    if (this.parsed.errors.length) {
      this._setStatus('error');
      return {ok:false, errors:this.parsed.errors};
    }
    this._buildFns();
    return {ok:true, errors:[]};
  }

  _buildFns() {
    const {equations} = this.parsed;
    const p = this.parser;
    const constL = equations.filter(e=>e.type==='const').map(e=>`s.${e.var}=${e.value};`);
    const derivL = equations.filter(e=>e.type==='derived').map(e=>{
      return `s.${e.var}=${p.compileExpr(e.expr)};`;
    });

    // _applyFn: inject constants + compute derived vars into state s
    try {
      this._applyFn = new Function('s','dt','t','n','_if',
        constL.join('\n') + '\n' + derivL.join('\n'));
    } catch(e) { console.error('_applyFn:', e); }

    // _evalFn: Euler step — writes new values into ns
    const eulerL = equations.map(e => {
      if (e.type==='iterative') {
        const js = p.compileExpr(e.expr).replace(/_p_(\w+)/g, (_,v)=>`prev.${v}`);
        return `ns.${e.var}=${js};`;
      }
      if (e.type==='differential') {
        return `ns.${e.var}=s.${e.var}+(${p.compileExpr(e.expr)})*dt;`;
      }
      return '';
    }).filter(Boolean);
    try {
      this._evalFn = new Function('s','prev','ns','dt','t','n','_if',
        constL.join('\n') + '\n' + derivL.join('\n') + '\n' + eulerL.join('\n'));
    } catch(e) { console.error('_evalFn:', e); }

    // _derivFn: compute derivatives d for RK4
    // For iterative x(t+dt) = x(t) + vx*dt, the rhs after replacing x(t+dt)->_p_x and x(t)->s.x is:
    // s.x + s.vx*dt  → derivative = (rhs - s.x)/dt = s.vx  ✓
    const derivStateL = equations.map(e => {
      if (e.type==='iterative') {
        // compile rhs: _p_VAR references become s.VAR (the "next" value is irrelevant here)
        // replace x(t) patterns → s.x, x(t+dt) patterns → _p_x (already handled by compileExpr)
        const js = p.compileExpr(e.expr).replace(/_p_(\w+)/g, (_,v)=>`s.${v}`);
        // derivative = (rhs - current) / dt
        return `d.${e.var}=((${js})-s.${e.var})/dt;`;
      }
      if (e.type==='differential') {
        return `d.${e.var}=${p.compileExpr(e.expr)};`;
      }
      return '';
    }).filter(Boolean);
    try {
      this._derivFn = new Function('s','d','dt','t','n','_if',
        constL.join('\n') + '\n' + derivL.join('\n') + '\n' + derivStateL.join('\n'));
    } catch(e) { console.error('_derivFn:', e); }
  }

  _applyDerived(s) {
    if (!this._applyFn) return;
    try { this._applyFn(s, this.dt, this.t, this.n, (c,a,b)=>c?a:b); } catch(e){}
  }

  _stateVars() {
    if (!this.parsed) return [];
    return [...this.parsed.stateVars];
  }

  _stepEuler() {
    const s = {...this.state}; const ns = {...s};
    if (this.parsed) Object.entries(this.parsed.constVars).forEach(([k,v])=>{s[k]=v;ns[k]=v;});
    const _if = (c,a,b)=>c?a:b;
    try { this._evalFn(s,s,ns,this.dt,this.t,this.n,_if); this.state=ns; this._applyDerived(this.state); }
    catch(e) { this._setStatus('error'); setErr('Erro numérico: '+e.message); }
  }

  _stepRK4() {
    if (!this._derivFn) { this._stepEuler(); return; }
    const sv = this._stateVars(); const dt=this.dt; const t=this.t; const n=this.n;
    const _if=(c,a,b)=>c?a:b;
    const s0={...this.state};
    if (this.parsed) Object.entries(this.parsed.constVars).forEach(([k,v])=>{s0[k]=v;});
    this._applyDerived(s0);

    const k1={}; try{this._derivFn(s0,k1,dt,t,n,_if);}catch(e){this._stepEuler();return;}
    const s1={...s0}; sv.forEach(v=>{s1[v]=s0[v]+0.5*dt*(k1[v]||0);}); s1.t=t+0.5*dt; this._applyDerived(s1);
    const k2={}; try{this._derivFn(s1,k2,dt,t+0.5*dt,n,_if);}catch(e){this._stepEuler();return;}
    const s2={...s0}; sv.forEach(v=>{s2[v]=s0[v]+0.5*dt*(k2[v]||0);}); s2.t=t+0.5*dt; this._applyDerived(s2);
    const k3={}; try{this._derivFn(s2,k3,dt,t+0.5*dt,n,_if);}catch(e){this._stepEuler();return;}
    const s3={...s0}; sv.forEach(v=>{s3[v]=s0[v]+dt*(k3[v]||0);}); s3.t=t+dt; this._applyDerived(s3);
    const k4={}; try{this._derivFn(s3,k4,dt,t+dt,n,_if);}catch(e){this._stepEuler();return;}

    const ns={...s0};
    sv.forEach(v=>{ns[v]=s0[v]+(dt/6)*((k1[v]||0)+2*(k2[v]||0)+2*(k3[v]||0)+(k4[v]||0));});
    this.state=ns; this._applyDerived(this.state);
  }

  step() {
    if (!this.parsed||this.parsed.errors.length||(!this._evalFn&&!this._derivFn)) return;
    for (const v in this.state) {
      if (!isFinite(this.state[v])) {
        this._setStatus('error');
        setErr(`Divergência: ${v} = ${this.state[v]}. Reduza dt.`);
        return;
      }
    }
    if (this.method==='rk4') this._stepRK4(); else this._stepEuler();
    this.t+=this.dt; this.n++; this.state.t=this.t;
    if (this.history.length < this.maxHist) this.history.push({...this.state, t:this.t, n:this.n});
    if (this.t>=this.tMax) { this._setStatus('done'); this.stop(); }
    if (this.onStep) this.onStep(this.state, this.t, this.n);
  }

  stepBack() {
    if (this.history.length<2) return;
    this.history.pop();
    const s=this.history[this.history.length-1];
    this.state={...s}; this.t=s.t||0; this.n=s.n||0;
    if (this.onStep) this.onStep(this.state, this.t, this.n);
  }

  setIC(ic) {
    // Normalize keys to lowercase to match parser convention
    const normalized = {};
    Object.entries(ic).forEach(([k,v]) => { normalized[k.toLowerCase()] = v; });
    this.initState={...normalized};
    this.state={...normalized};
    if (this.parsed) Object.entries(this.parsed.constVars).forEach(([k,v])=>{this.state[k]=v;this.initState[k]=v;});
    this._applyDerived(this.state);
    this.t=0; this.n=0;
    this.history=[{...this.state, t:0, n:0}];
  }

  reset() {
    this.stop();
    this.state={...this.initState};
    if (this.parsed) Object.entries(this.parsed.constVars).forEach(([k,v])=>{this.state[k]=v;});
    this._applyDerived(this.state);
    this.t=0; this.n=0;
    this.history=[{...this.state, t:0, n:0}];
    this._setStatus('stopped');
    if (this.onStep) this.onStep(this.state, 0, 0);
  }

  start() {
    if (this.status==='error') return;
    if (this.status==='done') this.reset();
    this.running=true; this._setStatus('running');
    this._lt=performance.now(); this._loop();
  }

  pause() { this.running=false; if(this._raf) cancelAnimationFrame(this._raf); this._setStatus('paused'); }
  stop()  { this.running=false; if(this._raf) cancelAnimationFrame(this._raf); }

  _loop() {
    if (!this.running) return;
    const now=performance.now(); const el=now-this._lt; this._lt=now;
    this._fc++; this._ft+=el;
    if (this._ft>600) { this.fps=Math.round(this._fc/(this._ft/1000)); this._fc=0; this._ft=0; }
    // Support fractional speeds (e.g. 0.5x skips every other frame)
    this._frameAcc = (this._frameAcc || 0) + this.stepsPerFrame;
    const steps = Math.floor(this._frameAcc);
    this._frameAcc -= steps;
    for (let i=0;i<steps&&this.running;i++) this.step();
    this._raf=requestAnimationFrame(()=>this._loop());
  }

  _setStatus(s) {
    this.status=s;
    if (this.onStatus) this.onStatus(s);
  }

  getVars() {
    if (!this.parsed) return [];
    return Object.entries(this.parsed.variables).map(([n,i])=>({name:n,...i}));
  }
  getAllVarNames() {
    if (!this.parsed) return [];
    return ['t', ...Object.keys(this.parsed.variables)];
  }
}

// ══════════════════════════════════════════════════════
// 3. ANIMATION RENDERER
// ══════════════════════════════════════════════════════
class AnimRenderer {
  constructor(canvas) {
    this.cv=canvas; this.ctx=canvas.getContext('2d');
    this.ox=0; this.oy=0; this.scale=30;
    this.showGrid=true; this.showAxes=true;
    this.objects=[]; // array of AnimObject
    this._drag=false; this._lm=[0,0];
    this._w=0; this._h=0;
    this._initOrigin=false;
    this._setupEvents();
    this.onSelect=null; // callback(obj|null)
  }

  resize() {
    const dpr=window.devicePixelRatio||1;
    const wrap=this.cv.parentElement;
    const w=wrap.clientWidth; const h=wrap.clientHeight;
    this.cv.width=w*dpr; this.cv.height=h*dpr;
    this.cv.style.width=w+'px'; this.cv.style.height=h+'px';
    this.ctx.scale(dpr,dpr);
    this._w=w; this._h=h;
    if (!this._initOrigin) { this.ox=w/2; this.oy=h/2; this._initOrigin=true; }
  }

  _setupEvents() {
    this.cv.addEventListener('wheel', e=>{
      e.preventDefault();
      const f=e.deltaY<0?1.12:0.88;
      const rect=this.cv.getBoundingClientRect();
      const mx=e.clientX-rect.left, my=e.clientY-rect.top;
      this.ox=mx+(this.ox-mx)*f; this.oy=my+(this.oy-my)*f;
      this.scale=Math.max(2,Math.min(5000,this.scale*f));
    },{passive:false});
    this._dragObj=null;
    this.cv.addEventListener('mousedown', e=>{
      if (e.button!==0) return;
      this._drag=true; this._lm=[e.clientX,e.clientY];
      const rect=this.cv.getBoundingClientRect();
      const px=e.clientX-rect.left, py=e.clientY-rect.top;
      const hit=this._hitTest(px,py);
      if (this.onSelect) this.onSelect(hit);
      this._dragObj = hit || null;
      if (hit && this.onDragStart) {
        const [wx,wy]=this.toMx(px,py);
        this.onDragStart(hit, wx, wy);
      }
    });
    window.addEventListener('mousemove', e=>{
      if (this._drag) {
        if (this._dragObj && this.onDragObj) {
          const rect=this.cv.getBoundingClientRect();
          const px=e.clientX-rect.left, py=e.clientY-rect.top;
          const [wx,wy]=this.toMx(px,py);
          this.onDragObj(this._dragObj, wx, wy, e.shiftKey);
        } else {
          this.ox+=e.clientX-this._lm[0]; this.oy+=e.clientY-this._lm[1];
        }
        this._lm=[e.clientX,e.clientY];
      }
      const rect=this.cv.getBoundingClientRect();
      const mx=e.clientX-rect.left, my=e.clientY-rect.top;
      const wx=(mx-this.ox)/this.scale, wy=(this.oy-my)/this.scale;
      const cd=document.getElementById('coord-disp');
      if(cd) cd.textContent=`x: ${wx.toFixed(2)}  y: ${wy.toFixed(2)}  ${this._drag&&this._dragObj?'[arrastar obj]':this._drag?'[mover câmera]':'| drag=mover | ⇧drag=IC'}`;
    });
    window.addEventListener('mouseup', ()=>{ this._drag=false; this._dragObj=null; });
  }

  toPx(mx,my) { return [this.ox+mx*this.scale, this.oy-my*this.scale]; }
  toMx(px,py) { return [(px-this.ox)/this.scale, (this.oy-py)/this.scale]; }

  _hitTest(px,py) {
    for (let i=this.objects.length-1;i>=0;i--) {
      const o=this.objects[i];
      if (!o.visible) continue;
      const rx=o._rx||0, ry=o._ry||0;
      if (o.type==='particle'||o.type==='pendulum') {
        const [opx,opy]=this.toPx(rx, ry);
        const r=(o.radius||8)+4;
        if (Math.hypot(px-opx,py-opy)<r) return o;
      } else if (o.type==='circle') {
        const [opx,opy]=this.toPx(rx, ry);
        const r=(o._rr||1)*this.scale+6;
        if (Math.hypot(px-opx,py-opy)<r) return o;
      } else if (o.type==='spring') {
        const [opx,opy]=this.toPx(rx, ry);
        if (Math.hypot(px-opx,py-opy)<18) return o;
      } else if (o.type==='rect') {
        const [opx,opy]=this.toPx(rx, ry);
        if (Math.hypot(px-opx,py-opy)<20) return o;
      } else if (o.type==='vector'||o.type==='label') {
        const [opx,opy]=this.toPx(rx, ry);
        if (Math.hypot(px-opx,py-opy)<14) return o;
      }
    }
    return null;
  }

  _evalProp(prop, state) {
    if (prop===undefined||prop===null||prop==='') return 0;
    const s=String(prop).trim();
    if (!isNaN(s)) return parseFloat(s);
    const lo=s.toLowerCase();
    if (state[lo]!==undefined && isFinite(state[lo])) return state[lo];
    // try expression
    try {
      const vars=Object.keys(state).map(k=>`const ${k}=${state[k]};`).join('');
      return Function(vars+' return '+lo+';')();
    } catch(e) { return 0; }
  }

  clearTrails() { this.objects.forEach(o=>{ o._trail=[]; }); }

  render(state) {
    const ctx=this.ctx; const w=this._w; const h=this._h;
    if (w<=0||h<=0) return;
    ctx.clearRect(0,0,w,h);
    const canvasBg = getComputedStyle(document.documentElement).getPropertyValue('--canvas-bg').trim() || '#080c13';
    ctx.fillStyle=canvasBg; ctx.fillRect(0,0,w,h);
    if (this.showGrid) this._drawGrid(ctx,w,h);
    if (this.showAxes) this._drawAxes(ctx,w,h);
    this.objects.forEach(o=>{ if(o.visible!==false) this._drawObj(ctx,o,state); });
  }

  _drawGrid(ctx,w,h) {
    const u=this.scale;
    const isLight=document.documentElement.classList.contains('light');
    const ox=((this.ox%u)+u)%u, oy=((this.oy%u)+u)%u;
    ctx.strokeStyle=isLight?'rgba(160,185,220,.18)':'rgba(30,45,66,.5)'; ctx.lineWidth=.5;
    for(let x=ox;x<w;x+=u){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
    for(let y=oy;y<h;y+=u){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
    const M=u*5; const ox2=((this.ox%M)+M)%M, oy2=((this.oy%M)+M)%M;
    ctx.strokeStyle=isLight?'rgba(120,155,200,.28)':'rgba(30,55,80,.8)'; ctx.lineWidth=.8;
    for(let x=ox2;x<w;x+=M){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
    for(let y=oy2;y<h;y+=M){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  }

  _drawAxes(ctx,w,h) {
    ctx.strokeStyle='rgba(79,158,255,.4)'; ctx.lineWidth=1.5;
    if(this.ox>0&&this.ox<w){ctx.beginPath();ctx.moveTo(this.ox,0);ctx.lineTo(this.ox,h);ctx.stroke();}
    if(this.oy>0&&this.oy<h){ctx.beginPath();ctx.moveTo(0,this.oy);ctx.lineTo(w,this.oy);ctx.stroke();}
    // labels
    ctx.fillStyle='rgba(71,85,105,.9)'; ctx.font='9px JetBrains Mono,monospace'; ctx.textAlign='center';
    const s=this.scale; const every=Math.max(1,Math.round(50/s));
    for(let i=Math.floor((-this.ox)/s);i<(w-this.ox)/s;i++){
      if(i===0||i%every!==0) continue;
      const px=this.ox+i*s; if(px<10||px>w-10) continue;
      ctx.fillText(i,px,Math.min(Math.max(this.oy+11,11),h-3));
    }
    ctx.textAlign='right';
    for(let i=Math.floor((this.oy-h)/s);i<this.oy/s;i++){
      if(i===0||i%every!==0) continue;
      const py=this.oy-i*s; if(py<10||py>h-10) continue;
      ctx.fillText(i,Math.min(Math.max(this.ox-4,28),w-3),py+3);
    }
  }

  _drawObj(ctx,o,state) {
    const g=(k)=>this._evalProp(o[k],state);
    const color=o.color||'#4f9eff';
    const sel=o._selected;
    // Visual offset from direct drag (doesn't change IC)
    const vox=o._vox||0, voy=o._voy||0;
    // Rotation in degrees
    const rotDeg=parseFloat(o.rotation)||0;
    const rot=rotDeg*Math.PI/180;

    if (o.type==='particle') {
      const mx=g('x')+vox, my=g('y')+voy;
      o._rx=mx; o._ry=my;
      const [px,py]=this.toPx(mx,my);
      const r=o.radius||8;
      // trail
      if (!o._trail) o._trail=[];
      const tmode = o.trailMode || 'persist';
      if (tmode !== 'none') {
        if (tmode === 'dots') {
          // Ghost mode: only add snapshot when moved enough (spacing = ~1 radius in px)
          const last = o._trail[o._trail.length-1];
          const ghostSpacingPx = Math.max(r * 0.9, 5);
          if (!last || Math.hypot(mx - last[0], my - last[1]) * this.scale >= ghostSpacingPx) {
            o._trail.push([mx, my, rotDeg]);
          }
          const maxLen = o.trailLen||300;
          if (o._trail.length > maxLen) o._trail.shift();
        } else {
          o._trail.push([mx,my]);
          const maxLen = o.trailLen||300;
          if (tmode === 'fade') {
            if (o._trail.length>maxLen) o._trail.shift();
          }
        }
        if (o.showTrail!==false && o._trail.length>0) {
          if (tmode === 'dots') {
            // Ghost/stamp: draw the object silhouette at each past position
            const ghostCount = o._trail.length;
            for (let i = 0; i < ghostCount - 1; i++) {
              const [gx, gy, grot] = o._trail[i];
              const [gpx, gpy] = this.toPx(gx, gy);
              const frac = i / ghostCount;
              const alpha = 0.07 + frac * 0.25;
              ctx.save();
              ctx.globalAlpha = alpha;
              ctx.translate(gpx, gpy);
              ctx.rotate((grot || 0) * Math.PI / 180);
              if (o.useImage && o._imgEl && o._imgEl.complete && o._imgEl.naturalWidth > 0) {
                const d = r * 2;
                ctx.drawImage(o._imgEl, -d/2, -d/2, d, d);
              } else {
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI*2);
                ctx.fillStyle = o.color || color;
                ctx.fill();
              }
              ctx.restore();
            }
            ctx.globalAlpha = 1;
          } else if (o._trail.length > 1) {
            ctx.beginPath();
            const [x0,y0]=this.toPx(o._trail[0][0],o._trail[0][1]);
            ctx.moveTo(x0,y0);
            for(let i=1;i<o._trail.length;i++){
              const [xi,yi]=this.toPx(o._trail[i][0],o._trail[i][1]);
              ctx.lineTo(xi,yi);
            }
            ctx.strokeStyle=o.trailColor||color;
            ctx.globalAlpha = tmode==='fade' ? .25 : .38;
            ctx.lineWidth=1.5; ctx.stroke(); ctx.globalAlpha=1;
            // fade: draw fresh segment brighter
            if (tmode==='fade' && o._trail.length>10) {
              const fresh = o._trail.slice(-Math.min(40,o._trail.length));
              ctx.beginPath();
              const[fx0,fy0]=this.toPx(fresh[0][0],fresh[0][1]);
              ctx.moveTo(fx0,fy0);
              fresh.forEach(([xi,yi])=>{const[fpx,fpy]=this.toPx(xi,yi);ctx.lineTo(fpx,fpy);});
              ctx.strokeStyle=o.trailColor||color; ctx.globalAlpha=.7; ctx.lineWidth=1.5; ctx.stroke(); ctx.globalAlpha=1;
            }
          }
        }
      }
      // velocity vector with projections
      if (o.showVec && (o.vx||o.vy)) {
        const vx=g('vx'),vy=g('vy'),vs=o.vecScale||0.3;
        const vecCol=o.vecColor||'#34d399';
        const [ex,ey]=this.toPx(mx+vx*vs,my+vy*vs);
        // projections (if enabled or default true)
        if (o.showVecProj !== false) {
          const projColor='rgba(180,200,255,0.32)';
          ctx.save();
          ctx.setLineDash([3,4]);
          ctx.strokeStyle=projColor; ctx.lineWidth=0.85;
          ctx.beginPath(); ctx.moveTo(ex,py); ctx.lineTo(ex,ey); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(px,ey); ctx.lineTo(ex,ey); ctx.stroke();
          ctx.setLineDash([]);
          const xCompColor='rgba(100,200,255,0.6)';
          const yCompColor='rgba(100,255,180,0.6)';
          if(Math.abs(ex-px)>4){
            ctx.strokeStyle=xCompColor; ctx.lineWidth=1.2;
            ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(ex,py); ctx.stroke();
            const axd=ex>px?1:-1;
            ctx.fillStyle=xCompColor;
            ctx.beginPath(); ctx.moveTo(ex,py); ctx.lineTo(ex-axd*6,py-3); ctx.lineTo(ex-axd*6,py+3); ctx.closePath(); ctx.fill();
            ctx.font='9px JetBrains Mono,monospace'; ctx.textAlign='center';
            ctx.fillText(`Vx=${(vx*vs).toFixed(2)}`,(px+ex)/2,py+11);
          }
          if(Math.abs(ey-py)>4){
            ctx.strokeStyle=yCompColor; ctx.lineWidth=1.2;
            ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px,ey); ctx.stroke();
            const ayd=ey>py?1:-1;
            ctx.fillStyle=yCompColor;
            ctx.beginPath(); ctx.moveTo(px,ey); ctx.lineTo(px-3,ey-ayd*6); ctx.lineTo(px+3,ey-ayd*6); ctx.closePath(); ctx.fill();
            ctx.fillStyle=yCompColor; ctx.font='9px JetBrains Mono,monospace'; ctx.textAlign='right';
            ctx.fillText(`Vy=${(vy*vs).toFixed(2)}`,px-5,(py+ey)/2+3);
          }
          ctx.restore();
        }
        // main vector arrow
        this._arrow(ctx,px,py,ex,ey,vecCol,2);
        // |V| label
        const modV=Math.hypot(vx*vs,vy*vs)*this.scale;
        if(modV>12){
          ctx.fillStyle=vecCol; ctx.font='bold 10px JetBrains Mono,monospace'; ctx.textAlign='left';
          ctx.fillText(`|V|=${Math.hypot(vx,vy).toFixed(2)}`,(px+ex)/2+5,(py+ey)/2-5);
        }
      }
      // body with rotation
      ctx.save(); ctx.translate(px,py); ctx.rotate(rot);
      if (o.useImage && o._imgEl && o._imgEl.complete && o._imgEl.naturalWidth>0) {
        ctx.drawImage(o._imgEl, -r, -r, r*2, r*2);
      } else {
        ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2);
        ctx.fillStyle=color; ctx.fill();
      }
      if (sel) { ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.stroke(); }
      ctx.restore();
      // label
      if (o.label) {
        ctx.fillStyle='rgba(226,232,240,.85)'; ctx.font='11px DM Sans,sans-serif';
        ctx.textAlign='left'; ctx.fillText(o.label,px+r+4,py-4);
      }

    } else if (o.type==='pendulum') {
      const theta=g('theta');
      // L can be a variable name or a number
      const Lval = (typeof o.L==='string' && isNaN(o.L)) ? (this._evalProp(o.L, state)||1.5) : (o.L||1.5);
      // pivotX/pivotY can be a variable name or a number
      const pivX=(this._evalProp(o.pivotX, state)||0)+vox, pivY=(this._evalProp(o.pivotY, state)||0)+voy;
      const [ppx,ppy]=this.toPx(pivX,pivY);
      const bobX=pivX+Math.sin(theta)*Lval, bobY=pivY-Math.cos(theta)*Lval;
      const [bpx,bpy]=this.toPx(bobX,bobY);
      o._rx=bobX; o._ry=bobY;
      // trail
      if (!o._trail) o._trail=[];
      const ptmode = o.trailMode || 'persist';
      if (ptmode !== 'none') {
        o._trail.push([bobX,bobY]);
        const pmaxLen = o.trailLen||400;
        if (ptmode === 'fade' || ptmode === 'dots') {
          if (o._trail.length>pmaxLen) o._trail.shift();
        }
        if (o.showTrail!==false && o._trail.length>1) {
          if (ptmode === 'dots') {
            for(let i=0;i<o._trail.length;i+=3){
              const [xi,yi]=this.toPx(o._trail[i][0],o._trail[i][1]);
              ctx.beginPath(); ctx.arc(xi,yi,1.5,0,Math.PI*2);
              ctx.fillStyle=color||'#f97316'; ctx.globalAlpha=.5; ctx.fill();
            }
            ctx.globalAlpha=1;
          } else {
            ctx.beginPath();
            const [x0,y0]=this.toPx(o._trail[0][0],o._trail[0][1]);
            ctx.moveTo(x0,y0);
            for(let i=1;i<o._trail.length;i++){const[xi,yi]=this.toPx(o._trail[i][0],o._trail[i][1]);ctx.lineTo(xi,yi);}
            ctx.strokeStyle=color||'#f97316';
            ctx.globalAlpha = ptmode==='fade' ? .25 : .3;
            ctx.lineWidth=1.5; ctx.stroke(); ctx.globalAlpha=1;
          }
        }
      }
      // rod
      ctx.beginPath(); ctx.moveTo(ppx,ppy); ctx.lineTo(bpx,bpy);
      ctx.strokeStyle=o.rodColor||'#94a3b8'; ctx.lineWidth=2; ctx.stroke();
      // pivot
      ctx.beginPath(); ctx.arc(ppx,ppy,4,0,Math.PI*2); ctx.fillStyle='#475569'; ctx.fill();
      // bob with rotation
      const r=o.radius||10;
      ctx.save(); ctx.translate(bpx,bpy); ctx.rotate(rot);
      ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2);
      ctx.fillStyle=color; ctx.fill();
      if(sel){ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();}
      ctx.restore();

    } else if (o.type==='spring') {
      // Resolve pivot coords — can be variables (string) or numbers
      const resolveCoord=(v,fallback)=>{
        if(typeof v==='string'&&v!==''&&isNaN(v)) return (state[v.toLowerCase()]!==undefined?Number(state[v.toLowerCase()]):0)+fallback;
        return (parseFloat(v)||0)+fallback;
      };
      const vertical = o.vertical===true || o.vertical==='true';
      const x2=g('x')+vox, y2=g('y')+voy;
      let x1,y1;
      if(vertical){
        // vertical: pivot above, mass below. x1/pivotX = horizontal position, y1/pivotY = top anchor
        x1=resolveCoord(o.pivotX!==undefined?o.pivotX:o.x1, vox);
        y1=resolveCoord(o.pivotY!==undefined?o.pivotY:o.y1, voy);
      } else {
        x1=resolveCoord(o.x1, vox);
        y1=resolveCoord(o.y1, voy);
      }
      const [p1x,p1y]=this.toPx(x1,y1), [p2x,p2y]=this.toPx(x2,y2);
      ctx.save();
      this._spring(ctx,p1x,p1y,p2x,p2y,color||'#a78bfa',o.coils||10);
      // draw wall/ceiling depending on orientation
      ctx.fillStyle='#475569';
      if(vertical){
        // ceiling at top anchor
        ctx.fillRect(p1x-20,p1y,40,6);
        ctx.strokeStyle='#2a3a56'; ctx.lineWidth=1;
        for(let i=-4;i<=4;i++){ctx.beginPath();ctx.moveTo(p1x+i*4,p1y);ctx.lineTo(p1x+i*4+6,p1y-8);ctx.stroke();}
        // mass block
        const bw=22,bh=22;
        ctx.fillStyle=color||'#a78bfa';
        ctx.fillRect(p2x-bw/2,p2y-bh/2,bw,bh);
        ctx.strokeStyle=sel?'#fff':'rgba(255,255,255,.2)'; ctx.lineWidth=sel?2:1; ctx.strokeRect(p2x-bw/2,p2y-bh/2,bw,bh);
      } else {
        // wall at left anchor
        ctx.fillRect(p1x-6,p1y-20,6,40);
        ctx.strokeStyle='#2a3a56'; ctx.lineWidth=1;
        for(let i=-4;i<=4;i++){ctx.beginPath();ctx.moveTo(p1x-6,p1y+i*4);ctx.lineTo(p1x-14,p1y+i*4+6);ctx.stroke();}
        // mass block
        const bw=22,bh=22;
        ctx.fillStyle=color||'#a78bfa';
        ctx.fillRect(p2x-bw/2,p2y-bh/2,bw,bh);
        ctx.strokeStyle=sel?'#fff':'rgba(255,255,255,.2)'; ctx.lineWidth=sel?2:1; ctx.strokeRect(p2x-bw/2,p2y-bh/2,bw,bh);
      }
      ctx.restore();
      o._rx=x2; o._ry=y2;

    } else if (o.type==='vector') {
      const ox2=(g('x')||0)+vox, oy2=(g('y')||0)+voy;
      const vx=g('vx'), vy=g('vy'), vs=o.scale||1;
      const [p1x,p1y]=this.toPx(ox2,oy2);
      const angle=Math.atan2(-vy*vs, vx*vs)+rot;
      const len=Math.hypot(vx*vs,vy*vs)*this.scale;
      const [p2x,p2y]=[p1x+len*Math.cos(angle), p1y-len*Math.sin(angle)];
      // --- Projection lines (dashed, delicate) ---
      const projColor='rgba(180,200,255,0.38)';
      const projLw=0.85;
      // Tip coords
      const tipX=p2x, tipY=p2y;
      // X-projection: horizontal dashed line from tip to (tipX, p1y)
      ctx.save();
      ctx.setLineDash([3,4]);
      ctx.strokeStyle=projColor; ctx.lineWidth=projLw;
      ctx.beginPath(); ctx.moveTo(tipX,p1y); ctx.lineTo(tipX,tipY); ctx.stroke(); // vertical drop
      ctx.beginPath(); ctx.moveTo(p1x,tipY); ctx.lineTo(tipX,tipY); ctx.stroke(); // horizontal drop
      // X component arrow (along x-axis)
      ctx.setLineDash([]);
      const xCompColor='rgba(100,200,255,0.55)';
      const yCompColor='rgba(100,255,180,0.55)';
      // Vx arrow on the baseline
      if(Math.abs(tipX-p1x)>4){
        ctx.strokeStyle=xCompColor; ctx.lineWidth=1.2;
        ctx.beginPath(); ctx.moveTo(p1x,p1y); ctx.lineTo(tipX,p1y); ctx.stroke();
        // tiny arrowhead
        const axd=tipX>p1x?1:-1;
        ctx.fillStyle=xCompColor;
        ctx.beginPath(); ctx.moveTo(tipX,p1y); ctx.lineTo(tipX-axd*6,p1y-3); ctx.lineTo(tipX-axd*6,p1y+3); ctx.closePath(); ctx.fill();
        // label Vx
        ctx.fillStyle=xCompColor; ctx.font='9px JetBrains Mono,monospace'; ctx.textAlign='center';
        const vxVal=(vx*vs);
        ctx.fillText(`Vx=${vxVal.toFixed(2)}`,(p1x+tipX)/2,p1y+11);
      }
      // Vy arrow on vertical at p1x
      if(Math.abs(tipY-p1y)>4){
        ctx.strokeStyle=yCompColor; ctx.lineWidth=1.2;
        ctx.beginPath(); ctx.moveTo(p1x,p1y); ctx.lineTo(p1x,tipY); ctx.stroke();
        const ayd=tipY>p1y?1:-1;
        ctx.fillStyle=yCompColor;
        ctx.beginPath(); ctx.moveTo(p1x,tipY); ctx.lineTo(p1x-3,tipY-ayd*6); ctx.lineTo(p1x+3,tipY-ayd*6); ctx.closePath(); ctx.fill();
        const vyVal=(vy*vs);
        ctx.fillStyle=yCompColor; ctx.font='9px JetBrains Mono,monospace'; ctx.textAlign='right';
        ctx.fillText(`Vy=${vyVal.toFixed(2)}`,p1x-5,(p1y+tipY)/2+3);
      }
      ctx.restore();
      // Main resultant vector
      this._arrow(ctx,p1x,p1y,p2x,p2y,color,o.lineWidth||2);
      // |V| and angle label near midpoint
      if(len>12){
        const modV=Math.hypot(vx*vs,vy*vs);
        const angDeg=((Math.atan2(vy*vs,vx*vs)*180/Math.PI)+360)%360;
        ctx.fillStyle=color; ctx.font='bold 10px JetBrains Mono,monospace'; ctx.textAlign='left';
        const mx=(p1x+p2x)/2+6, my=(p1y+p2y)/2-6;
        ctx.fillText(`|V|=${modV.toFixed(2)}`,mx,my);
        ctx.fillStyle='rgba(200,200,255,0.7)'; ctx.font='9px JetBrains Mono,monospace';
        ctx.fillText(`θ=${angDeg.toFixed(1)}°`,mx,my+11);
      }
      if(o.label){
        ctx.fillStyle=color; ctx.font='11px DM Sans,sans-serif'; ctx.textAlign='center';
        ctx.fillText(o.label,(p1x+p2x)/2,(p1y+p2y)/2-16);
      }
      o._rx=ox2; o._ry=oy2;

    } else if (o.type==='circle') {
      const cx=(g('x')||0)+vox, cy=(g('y')||0)+voy, r=g('r')||g('radius')||1;
      o._rx=cx; o._ry=cy; o._rr=r;
      const [px,py]=this.toPx(cx,cy);
      ctx.save(); ctx.translate(px,py); ctx.rotate(rot);
      if (o.useImage && o._imgEl && o._imgEl.complete && o._imgEl.naturalWidth>0) {
        const pr=r*this.scale;
        ctx.drawImage(o._imgEl, -pr, -pr, pr*2, pr*2);
      } else {
        ctx.beginPath(); ctx.arc(0,0,r*this.scale,0,Math.PI*2);
        ctx.fillStyle=o.fillColor||'rgba(79,158,255,.15)'; ctx.fill();
        ctx.strokeStyle=color; ctx.lineWidth=o.lineWidth||1.5; ctx.stroke();
      }
      if(sel){ctx.beginPath();ctx.arc(0,0,r*this.scale,0,Math.PI*2);ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();}
      ctx.restore();

    } else if (o.type==='rect') {
      const rx=(g('x')||0)+vox, ry=(g('y')||0)+voy, rw=g('w')||g('width')||1, rh2=g('h')||g('height')||1;
      const [px,py]=this.toPx(rx,ry);
      const pw=rw*this.scale, ph=rh2*this.scale;
      ctx.save(); ctx.translate(px,py); ctx.rotate(rot);
      if (o.useImage && o._imgEl && o._imgEl.complete && o._imgEl.naturalWidth>0) {
        ctx.drawImage(o._imgEl, -pw/2, -ph/2, pw, ph);
      } else {
        ctx.fillStyle=o.fillColor||'rgba(79,158,255,.15)'; ctx.fillRect(-pw/2,-ph/2,pw,ph);
        ctx.strokeStyle=color; ctx.lineWidth=o.lineWidth||1.5; ctx.strokeRect(-pw/2,-ph/2,pw,ph);
      }
      if(sel){ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.strokeRect(-pw/2,-ph/2,pw,ph);}
      ctx.restore();
      o._rx=rx; o._ry=ry;

    } else if (o.type==='label') {
      const lx=(g('x')||0)+vox, ly=(g('y')||0)+voy;
      const [px,py]=this.toPx(lx,ly);
      const text=o.text||o.label||'Texto';
      const rendered=text.replace(/\{(\w+)(?::(\d+))?\}/g, (_,v,d)=>{
        const val=state[v.toLowerCase()];
        return val!==undefined ? Number(val).toFixed(d!==undefined?parseInt(d):2) : v;
      });
      ctx.save(); ctx.translate(px,py); ctx.rotate(rot);
      ctx.fillStyle=color; ctx.font=`${o.fontSize||13}px DM Sans,sans-serif`;
      ctx.textAlign='left'; ctx.fillText(rendered,0,0);
      ctx.restore();
      o._rx=lx; o._ry=ly;
    } else if (o.type==='vectorfield') {
      // Draw a vector field: evaluate fxExpr(x,y) and fyExpr(x,y) on a grid
      const N = o.gridN||14;
      const R = o.gridRange||5;
      const arrowScale = o.arrowScale||0.4;
      const fxStr = o.fxExpr||'-y';
      const fyStr = o.fyExpr||'x';
      // parse base color from o.color (hex → r,g,b)
      const baseColor = o.color || '#4f9eff';
      let cr=79,cg=158,cb=255;
      const hm = baseColor.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
      if(hm){cr=parseInt(hm[1],16);cg=parseInt(hm[2],16);cb=parseInt(hm[3],16);}
      // compile expressions
      let fxFn, fyFn;
      try { fxFn = new Function('x','y','t','Math',`return ${fxStr.replace(/\^/g,'**')};`); } catch(e) { fxFn=()=>0; }
      try { fyFn = new Function('x','y','t','Math',`return ${fyStr.replace(/\^/g,'**')};`); } catch(e) { fyFn=()=>0; }
      const step = R*2/(N-1);
      const maxMag = (() => {
        let m=0;
        for(let i=0;i<N;i++) for(let j=0;j<N;j++){
          const xi=-R+i*step, yj=-R+j*step;
          try { m=Math.max(m, Math.hypot(fxFn(xi,yj,state.t||0,Math), fyFn(xi,yj,state.t||0,Math))); } catch(e){}
        }
        return m||1;
      })();
      for(let i=0;i<N;i++) {
        for(let j=0;j<N;j++) {
          const xi=-R+i*step, yj=-R+j*step;
          let fx=0,fy=0;
          try { fx=fxFn(xi,yj,state.t||0,Math); fy=fyFn(xi,yj,state.t||0,Math); } catch(e){}
          if(!isFinite(fx)||!isFinite(fy)) continue;
          const mag=Math.hypot(fx,fy);
          const norm=mag/maxMag;
          // tint: blend base color toward white slightly for high-magnitude arrows
          const br=Math.round(cr+(255-cr)*norm*0.35);
          const bg2=Math.round(cg+(255-cg)*norm*0.35);
          const bb=Math.round(cb+(255-cb)*norm*0.35);
          const alpha=0.22+norm*0.68;
          const len=norm*step*arrowScale*this.scale;
          if(len<1) continue;
          const [px,py]=this.toPx(xi,yj);
          const angle=Math.atan2(-fy,fx);
          const ex=px+len*Math.cos(angle), ey=py+len*Math.sin(angle);
          const col=`rgba(${br},${bg2},${bb},${alpha.toFixed(2)})`;
          this._arrow(ctx,px,py,ex,ey,col,0.9+norm*0.6);
        }
      }
      o._rx=0; o._ry=0;
    }

    // selection ring
    if (sel && (o.type==='vector'||o.type==='label')) {
      const[px,py]=this.toPx((g('x')||0)+vox,(g('y')||0)+voy);
      ctx.beginPath();ctx.arc(px,py,6,0,Math.PI*2);
      ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();
    }
  }

  _arrow(ctx,x1,y1,x2,y2,color,lw) {
    const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy);
    if(len<1) return;
    const hl=Math.min(14,len*.4), a=Math.atan2(dy,dx);
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
    ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2,y2);
    ctx.lineTo(x2-hl*Math.cos(a-.42),y2-hl*Math.sin(a-.42));
    ctx.lineTo(x2-hl*Math.cos(a+.42),y2-hl*Math.sin(a+.42));
    ctx.closePath();ctx.fillStyle=color;ctx.fill();
  }

  _spring(ctx,x1,y1,x2,y2,color,coils) {
    const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy);
    if(len<2) return;
    const ux=dx/len,uy=dy/len,nx=-uy,ny=ux,amp=8,segs=coils*2;
    ctx.beginPath();ctx.moveTo(x1,y1);
    for(let i=0;i<=segs;i++){
      const t=i/segs, side=(i%2===0)?amp:-amp;
      ctx.lineTo(x1+t*dx+side*nx,y1+t*dy+side*ny);
    }
    ctx.lineTo(x2,y2);
    ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();
  }
}

// ══════════════════════════════════════════════════════
// 4. GRAPH RENDERER
// ══════════════════════════════════════════════════════
class GraphRenderer {
  constructor(canvas, idx) {
    this.cv=canvas; this.idx=idx;
    this.xvar='t'; this.yvar='y'; this.yvar2='';
    this.data=[]; this.data2=[];
    this.xmin=Infinity;this.xmax=-Infinity;
    this.ymin=Infinity;this.ymax=-Infinity;
    this.colors=['#4f9eff','#34d399'];
    this.autoScale=true;
  }

  append(state) {
    const getV=(v,s)=>{ const lo=v.toLowerCase(); return (s[lo]!==undefined&&isFinite(s[lo]))?s[lo]:null; };
    const xv=getV(this.xvar,state)??state.t;
    if (!isFinite(xv)) return;
    const yv=this.yvar?getV(this.yvar,state):null;
    const yv2=this.yvar2?getV(this.yvar2,state):null;
    if (yv!==null) {
      this.data.push([xv,yv]);
      this.xmin=Math.min(this.xmin,xv);this.xmax=Math.max(this.xmax,xv);
      this.ymin=Math.min(this.ymin,yv);this.ymax=Math.max(this.ymax,yv);
    }
    if (yv2!==null) {
      this.data2.push([xv,yv2]);
      this.ymin=Math.min(this.ymin,yv2);this.ymax=Math.max(this.ymax,yv2);
    }
  }

  clear() {
    this.data=[];this.data2=[];
    this.xmin=Infinity;this.xmax=-Infinity;
    this.ymin=Infinity;this.ymax=-Infinity;
  }

  render() {
    const cv=this.cv; const ctx=cv.getContext('2d');
    const dpr=window.devicePixelRatio||1;
    const wrap=cv.parentElement; const W=wrap.clientWidth, H=wrap.clientHeight;
    cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';
    ctx.scale(dpr,dpr);

    const pad={t:22,r:16,b:38,l:52};
    const pw=W-pad.l-pad.r, ph=H-pad.t-pad.b;

    ctx.fillStyle='#0b0f17'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#080c13'; ctx.fillRect(pad.l,pad.t,pw,ph);

    const nodata=this.data.length<2;
    if (nodata) {
      ctx.fillStyle='rgba(71,85,105,.5)'; ctx.font='11px DM Sans,sans-serif';
      ctx.textAlign='center';
      ctx.fillText(`${this.yvar||'?'} vs ${this.xvar} — simulação parada`,pad.l+pw/2,pad.t+ph/2);
      this._labels(ctx,pad,pw,ph,W,H,0,1,0,1); return;
    }

    let xmin=this.xmin,xmax=this.xmax,ymin=this.ymin,ymax=this.ymax;
    if(xmin===xmax){xmin-=1;xmax+=1;}
    if(ymin===ymax){ymin-=1;ymax+=1;}
    const xr=xmax-xmin, yr=ymax-ymin;
    const xp=xr*.02, yp=yr*.08;

    const tX=x=>pad.l+((x-(xmin-xp))/((xr+2*xp)))*pw;
    const tY=y=>pad.t+ph-((y-(ymin-yp))/((yr+2*yp)))*ph;

    // grid
    ctx.strokeStyle='rgba(30,45,66,.6)';ctx.lineWidth=.5;
    for(let i=0;i<=5;i++){
      const gx=pad.l+(i/5)*pw; ctx.beginPath();ctx.moveTo(gx,pad.t);ctx.lineTo(gx,pad.t+ph);ctx.stroke();
      const gy=pad.t+(i/5)*ph; ctx.beginPath();ctx.moveTo(pad.l,gy);ctx.lineTo(pad.l+pw,gy);ctx.stroke();
    }

    // curves
    this._drawCurve(ctx,this.data,tX,tY,this.colors[0],1.8);
    if(this.data2.length>1) this._drawCurve(ctx,this.data2,tX,tY,this.colors[1],1.5);

    // current point
    if(this.data.length){
      const[lx,ly]=this.data[this.data.length-1];
      ctx.beginPath();ctx.arc(tX(lx),tY(ly),3.5,0,Math.PI*2);
      ctx.fillStyle=this.colors[0];ctx.fill();
    }
    if(this.data2.length){
      const[lx,ly]=this.data2[this.data2.length-1];
      ctx.beginPath();ctx.arc(tX(lx),tY(ly),3,0,Math.PI*2);
      ctx.fillStyle=this.colors[1];ctx.fill();
    }

    this._labels(ctx,pad,pw,ph,W,H,xmin,xmax,ymin,ymax);
  }

  _drawCurve(ctx,data,tX,tY,color,lw){
    const pts=data.length>2500?this._lttb(data,1800):data;
    ctx.beginPath();ctx.moveTo(tX(pts[0][0]),tY(pts[0][1]));
    for(let i=1;i<pts.length;i++) ctx.lineTo(tX(pts[i][0]),tY(pts[i][1]));
    ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.lineJoin='round';ctx.stroke();
  }

  _lttb(data,n){
    if(data.length<=n) return data;
    const out=[data[0]]; const bs=(data.length-2)/(n-2);
    let li=0;
    for(let i=0;i<n-2;i++){
      const s=Math.floor((i+1)*bs)+1, e=Math.min(Math.floor((i+2)*bs)+1,data.length);
      let ax=0,ay=0; for(let j=s;j<e;j++){ax+=data[j][0];ay+=data[j][1];} ax/=(e-s);ay/=(e-s);
      const cs=Math.floor(i*bs)+1,ce=Math.min(Math.floor((i+1)*bs)+1,data.length);
      let mA=-1,mI=cs; const[px,py]=data[li];
      for(let j=cs;j<ce;j++){
        const A=Math.abs((px-ax)*(data[j][1]-py)-(px-data[j][0])*(ay-py))*.5;
        if(A>mA){mA=A;mI=j;}
      }
      out.push(data[mI]);li=mI;
    }
    out.push(data[data.length-1]); return out;
  }

  _labels(ctx,pad,pw,ph,W,H,xmin,xmax,ymin,ymax){
    ctx.fillStyle='rgba(71,85,105,.9)';ctx.font='10px JetBrains Mono,monospace';
    const xr=xmax-xmin||1,yr=ymax-ymin||1;
    const xp=xr*.02,yp=yr*.08;
    const fmt = typeof formatVal === 'function' ? formatVal : v => v.toFixed(2);
    ctx.textAlign='center';
    for(let i=0;i<=5;i++){
      const v=(xmin-xp)+((xr+2*xp)*i/5);
      ctx.fillText(fmt(v),pad.l+(i/5)*pw,pad.t+ph+14);
    }
    ctx.textAlign='right';
    for(let i=0;i<=5;i++){
      const v=(ymin-yp)+((yr+2*yp)*i/5);
      ctx.fillText(fmt(v),pad.l-4,pad.t+ph-(i/5)*ph+3);
    }
    // X axis label
    ctx.fillStyle='rgba(148,163,184,.85)';ctx.font='11px DM Sans,sans-serif';
    ctx.textAlign='center';ctx.fillText(this.xvar,pad.l+pw/2,H-4);
    // Y axis labels — colored per series
    ctx.save();ctx.translate(12,pad.t+ph/2);ctx.rotate(-Math.PI/2);
    if (this.yvar2) {
      // two labels side by side
      ctx.fillStyle=this.colors[0];ctx.textAlign='right';ctx.fillText(this.yvar,-4,0);
      ctx.fillStyle='rgba(148,163,184,.5)';ctx.fillText(' ·',0,0);
      ctx.fillStyle=this.colors[1];ctx.textAlign='left';ctx.fillText(' '+this.yvar2,4,0);
    } else {
      ctx.fillStyle=this.colors[0];ctx.textAlign='center';ctx.fillText(this.yvar||'',0,0);
    }
    ctx.restore();
    // Legend in top-right corner (only when 2 series)
    if (this.yvar2 && this.data.length > 0) {
      const lx=pad.l+pw-4, ly=pad.t+8;
      ctx.textAlign='right';ctx.font='10px DM Sans,sans-serif';
      ctx.fillStyle=this.colors[0];
      ctx.fillRect(lx-62,ly-7,18,3);ctx.fillText(this.yvar,lx,ly);
      ctx.fillStyle=this.colors[1];
      ctx.fillRect(lx-62,ly+5,18,3);ctx.fillText(this.yvar2,lx,ly+12);
    }
  }
}

// ══════════════════════════════════════════════════════
// 5. OBJECTS MANAGEMENT
// ══════════════════════════════════════════════════════
let _objId=1;
const OBJECT_ICONS = {particle:'●',pendulum:'🔴',spring:'🌀',vector:'➡',circle:'◯',rect:'▭',label:'T',vectorfield:'⊞'};
const OBJECT_COLORS = ['#4f9eff','#f97316','#34d399','#a78bfa','#fb7185','#fbbf24','#06b6d4','#ec4899'];

function makeObj(type, props={}) {
  const id=_objId++;
  const base={
    id, type, visible:true,
    name: type+id,
    color: OBJECT_COLORS[(id-1)%OBJECT_COLORS.length],
    _trail:[], _rx:0, _ry:0, _selected:false,
    useImage:false, imageData:'', _imgEl:null,
  };
  const defaults={
    particle: {x:'x',y:'y',radius:8,showTrail:true,trailMode:'persist',showVec:false,showVecProj:true,vx:'vx',vy:'vy',vecScale:0.3,vecColor:'#34d399',trailLen:300,label:''},
    pendulum: {theta:'theta',L:1.5,pivotX:0,pivotY:0,radius:10,rodColor:'#94a3b8',showTrail:true,trailMode:'persist',trailLen:400},
    spring:   {x:'x',y:'y',x1:0,y1:5,pivotX:0,pivotY:5,coils:10,vertical:true},
    vector:   {x:'x',y:'y',vx:'vx',vy:'vy',scale:0.3,lineWidth:2,label:''},
    circle:   {x:'x',y:'y',r:'r',fillColor:'rgba(79,158,255,.15)',lineWidth:1.5},
    rect:     {x:'x',y:'y',w:1,h:1,fillColor:'rgba(79,158,255,.12)',lineWidth:1.5},
    label:    {x:0,y:3,text:'t = {t:2}',fontSize:13},
    vectorfield: {fxExpr:'-y',fyExpr:'x',gridN:14,gridRange:5,arrowScale:0.4,color:'#4f9eff'},
  };
  const obj = {...base, ...(defaults[type]||{}), ...props};
  // Restore cached image element from imageData if present
  if (obj.imageData) {
    const img = new Image();
    img.src = obj.imageData;
    obj._imgEl = img;
  }
  return obj;
}

// ══════════════════════════════════════════════════════
// 6. APP STATE & INIT
// ══════════════════════════════════════════════════════
const sim = new SimEngine();
let anim = null;
let graphs = [];
let activeTab=0;
let selectedObj=null;
let _renderRAF=null;

function init() {
  const animCv = document.getElementById('anim-canvas');
  anim = new AnimRenderer(animCv);
  graphs = [
    new GraphRenderer(document.getElementById('gc-0'),0),
    new GraphRenderer(document.getElementById('gc-1'),1),
    new GraphRenderer(document.getElementById('gc-2'),2),
    new GraphRenderer(document.getElementById('gc-3'),3),
  ];
  anim.resize();
  window.addEventListener('resize', ()=>{ anim.resize(); graphs[activeTab].render(); });

  // Render loop — completely independent of simulation
  function renderLoop() {
    anim.render(sim.state);
    // Update var list values live
    updateVarValues();
    document.getElementById('disp-t').textContent=(typeof formatVal==='function'?formatVal(sim.t):sim.t.toFixed(3));
    document.getElementById('disp-n').textContent=sim.n;
    document.getElementById('disp-fps').textContent=sim.fps||'—';
    document.getElementById('disp-pts').textContent=sim.history.length;
    document.getElementById('disp-objs').textContent=anim.objects.length;
    // Render active graph
    graphs[activeTab].render();
    _renderRAF=requestAnimationFrame(renderLoop);
  }
  _renderRAF=requestAnimationFrame(renderLoop);

  // Sim callbacks
  sim.onStep=(state,t,n)=>{
    graphs.forEach(g => g.append(state));
  };
  sim.onStatus=updateStatusUI;

  // Object selection
  anim.onSelect=(obj)=>{
    if(selectedObj) selectedObj._selected=false;
    selectedObj=obj;
    if(obj) obj._selected=true;
    renderObjList();
    renderObjProps(obj);
  };

  // Object dragging: two modes
  // - Shift+drag: update IC (physics start position)
  // - Normal drag: visual offset only (_vox, _voy) for quick positioning
  anim.onDragObj=(obj, wx, wy, shiftKey)=>{
    if (shiftKey && sim.parsed) {
      // Shift+drag: update initial conditions
      const xvar = typeof obj.x === 'string' ? obj.x.toLowerCase() : null;
      const yvar = typeof obj.y === 'string' ? obj.y.toLowerCase() : null;
      const tvar = typeof obj.theta === 'string' ? obj.theta.toLowerCase() : null;
      let changed = false;
      if (xvar && sim.initState[xvar] !== undefined) { sim.initState[xvar] = wx-(obj._vox||0); changed = true; }
      if (yvar && sim.initState[yvar] !== undefined) { sim.initState[yvar] = wy-(obj._voy||0); changed = true; }
      if (tvar && sim.initState[tvar] !== undefined) {
        const pivX = typeof obj.pivotX === 'number' ? obj.pivotX : 0;
        const pivY = typeof obj.pivotY === 'number' ? obj.pivotY : 0;
        sim.initState[tvar] = Math.atan2(wx - pivX, -(wy - pivY));
        changed = true;
      }
      if (changed) {
        sim.state = {...sim.initState};
        if (sim.parsed) Object.entries(sim.parsed.constVars).forEach(([k,v])=>{sim.state[k]=v;});
        sim._applyDerived(sim.state);
        sim.t = 0; sim.n = 0;
        sim.history = [{...sim.state, t:0, n:0}];
        anim.clearTrails(); graphs.forEach(g=>g.clear());
        if (xvar) { const el=document.getElementById('ic-'+xvar); if(el) el.value=(wx-(obj._vox||0)).toFixed(3); }
        if (yvar) { const el=document.getElementById('ic-'+yvar); if(el) el.value=(wy-(obj._voy||0)).toFixed(3); }
      }
    } else {
      // Normal drag: just move the visual offset
      obj._vox = (obj._vox||0) + (wx - (obj._dragLastX||wx));
      obj._voy = (obj._voy||0) + (wy - (obj._dragLastY||wy));
    }
    obj._dragLastX = wx;
    obj._dragLastY = wy;
  };
  anim.onDragStart=(obj, wx, wy)=>{
    obj._dragLastX = wx;
    obj._dragLastY = wy;
  };
  anim.onDragEnd=()=>{};

  // Varlist resize handle
  (function(){
    const handle=document.getElementById('varlist-resize');
    const varlist=document.getElementById('varlist');
    const editorWrap=document.getElementById('editor-wrap');
    if(!handle||!varlist||!editorWrap) return;
    let drag=false, startY=0, startVH=0;
    handle.addEventListener('mousedown',e=>{
      drag=true; startY=e.clientY;
      startVH=varlist.offsetHeight;
      handle.classList.add('drag');
      e.preventDefault();
    });
    window.addEventListener('mousemove',e=>{
      if(!drag) return;
      const delta=startY-e.clientY; // drag up = grow varlist
      const newH=Math.max(40, Math.min(320, startVH+delta));
      varlist.style.maxHeight=newH+'px';
      varlist.style.height=newH+'px';
    });
    window.addEventListener('mouseup',()=>{
      if(drag){drag=false;handle.classList.remove('drag');}
    });
  })();

  // Keyboard shortcuts
  document.addEventListener('keydown', e=>{
    const tag = e.target.tagName;
    if(tag==='INPUT'||tag==='TEXTAREA'||tag==='MATH-FIELD') {
      if(e.key==='Escape') e.target.blur();
      if(e.ctrlKey&&e.key==='s'){e.preventDefault();saveFile();}
      return;
    }
    if(e.ctrlKey&&e.key==='s'){e.preventDefault();saveFile();}
    else if(e.ctrlKey&&e.key==='n'){e.preventDefault();newProject();}
    else if(e.key===' '){e.preventDefault();sim.running?simPause():simPlay();}
    else if(e.key==='r'||e.key==='R') simReset();
    else if(e.key==='.') simStep();
    else if(e.key===',') simBack();
    else if(e.key==='Delete'&&selectedObj) deleteSelectedObj();
  });

  document.addEventListener('click', e=>{
    if(!e.target.closest('.mitem')) closeMenus();
  });

  // ESC closes all modals
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape'){
      ['blab-dlg-overlay','help-modal-overlay','about-modal-overlay','precision-modal-overlay'].forEach(id=>{
        const el=document.getElementById(id); if(el) el.classList.remove('show');
      });
    }
  }, true);

  loadEx('solar');
  // Build editor after MathLive is loaded
  setTimeout(() => { buildEditorUI(); applyModel(true); }, 400);

  // Wire toolbar controls directly (bypass React onChange timing)
  const selSpeed = document.getElementById('sel-speed');
  if (selSpeed) selSpeed.addEventListener('change', function() {
    sim.stepsPerFrame = parseFloat(this.value);
    sim._frameAcc = 0;
  });
  const inpDt = document.getElementById('inp-dt');
  if (inpDt) inpDt.addEventListener('change', function() {
    sim.dt = parseFloat(this.value) || 0.01;
  });
  const inpTmax = document.getElementById('inp-tmax');
  if (inpTmax) inpTmax.addEventListener('change', function() {
    sim.tMax = parseFloat(this.value) || 10;
  });
  const selMethod = document.getElementById('sel-method');
  if (selMethod) selMethod.addEventListener('change', function() {
    sim.method = this.value;
  });

  // Set initial UI state
  window.activeTab = 0;
  updateStatusUI('idle');
  const speedEl = document.getElementById('sel-speed');
  if (speedEl) speedEl.value = '1';
  sim.stepsPerFrame = 1;
  sim._frameAcc = 0;

  // Sub-menu & modal event handlers (moved from DOMContentLoaded)


  document.querySelectorAll('.di.has-sub').forEach(item=>{
    const sub = item.querySelector('.sub-drop');
    if (!sub) return;
    item.addEventListener('mouseenter', ()=>{
      const rect = item.getBoundingClientRect();
      sub.style.top  = rect.top + 'px';
      sub.style.left = (rect.right + 2) + 'px';
      // Flip left if would overflow right edge
      if (rect.right + 2 + 220 > window.innerWidth) {
        sub.style.left = (rect.left - 220) + 'px';
      }
      sub.style.display = 'block';
    });
    item.addEventListener('mouseleave', ()=>{
      sub.style.display = 'none';
    });
  });


  document.getElementById('blab-dlg-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('blab-dlg-overlay'))
      document.getElementById('blab-dlg-overlay').classList.remove('show');
  });
  ['help-modal-overlay','about-modal-overlay','precision-modal-overlay'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', e => { if (e.target === el) el.classList.remove('show'); });
  });
}

// ══════════════════════════════════════════════════════
// 7. SIMULATION CONTROLS
// ══════════════════════════════════════════════════════
function simPlay() {
  if(!sim.parsed||sim.parsed.errors.length){setErr('Modelo com erros.');return;}
  sim.start();
}
function simPause() { sim.pause(); }
function simReset() {
  sim.reset();
  anim.clearTrails();
  graphs.forEach(g=>g.clear());
  clearErr();
}
function simStep() {
  if(!sim.parsed||sim.parsed.errors.length) return;
  if(sim.running) sim.pause();
  if(sim.status==='done') return;
  sim.step();
}
function simBack() { if(sim.running)sim.pause(); sim.stepBack(); }

function updateStatusUI(s) {
  const dot=document.getElementById('statusdot');
  dot.className='statusdot '+(s==='running'?'running':s==='paused'?'paused':s==='error'?'error':'');
  document.getElementById('btn-play').disabled=s==='running';
  document.getElementById('btn-pause').disabled=s!=='running';
  document.getElementById('btn-back').disabled=sim.history.length<2;
  document.getElementById('disp-method').textContent=sim.method.toUpperCase();
}

// ══════════════════════════════════════════════════════
// 8. MODEL EDITOR (MathLive inline per-line editor)
// ══════════════════════════════════════════════════════
// Internal model: array of line strings
let _editorLines = [''];
let _activeLine = 0;
let _parseTimer = null;
let _mathPreviewVisible = true; // kept for compat

function isEqLine(s) {
  const t = s.replace(/\/\/.*$/,'').replace(/#.*$/,'').trim();
  if (!t) return false;
  // comment lines stay as plain text
  if (s.trim().startsWith('//') || s.trim().startsWith('#')) return false;
  return t.match(/\w+\s*\(t\+dt\)\s*=/) ||
         t.match(/d\w+\s*\/\s*dt\s*=/) ||
         t.match(/^\w+\s*=\s*.+/);
}

function lineToLatex(line) {
  let s = line.trim();
  s = s.replace(/(\w+)\(t\+dt\)/g, (_,v) => `${v}_{t+\\Delta t}`);
  s = s.replace(/(\w+)\(t\)/g, (_,v) => `${v}_t`);
  s = s.replace(/d(\w+)\/dt/g, (_,v) => `\\frac{d${v}}{dt}`);
  s = s.replace(/\btheta\b/g,'\\theta').replace(/\bomega\b/g,'\\omega')
       .replace(/\balpha\b/g,'\\alpha').replace(/\bbeta\b/g,'\\beta')
       .replace(/\bgamma\b/g,'\\gamma').replace(/\bsigma\b/g,'\\sigma')
       .replace(/\brho\b/g,'\\rho').replace(/\bphi\b/g,'\\phi')
       .replace(/\blambda\b/g,'\\lambda').replace(/\bmu\b/g,'\\mu')
       .replace(/\bpi\b/g,'\\pi');
  s = s.replace(/sqrt\(([^)]+)\)/g,'\\sqrt{$1}');
  s = s.replace(/\bsin\b/g,'\\sin').replace(/\bcos\b/g,'\\cos')
       .replace(/\btan\b/g,'\\tan').replace(/\bexp\b/g,'\\exp')
       .replace(/\bln\b/g,'\\ln');
  s = s.replace(/\(([^()]+)\)\/\(([^()]+)\)/g,'\\frac{$1}{$2}');
  s = s.replace(/\^([A-Za-z0-9_.]+)/g,'^{$1}');
  s = s.replace(/\*\*/g,'^');
  s = s.replace(/\*/g,' \\cdot ');
  s = s.replace(/\bdt\b/g,'\\Delta t');
  return s;
}

function latexToPlain(latex) {
  // Convert MathLive LaTeX back to model syntax
  let s = latex;
  // Subscripts: x_{t+\Delta t} → x(t+dt), x_t → x(t)
  s = s.replace(/([a-zA-Z]\w*)\s*_\{t\+\\Delta t\}/g, '$1(t+dt)');
  s = s.replace(/([a-zA-Z]\w*)\s*_\{t\}/g, '$1(t)');
  s = s.replace(/([a-zA-Z]\w*)\s*_t\b/g, '$1(t)');
  // frac: \frac{d VAR}{dt} → dVAR/dt
  s = s.replace(/\\frac\{d\s*([a-zA-Z]\w*)\}\{dt\}/g, 'd$1/dt');
  // sqrt
  s = s.replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)');
  // Greek
  s = s.replace(/\\theta/g,'theta').replace(/\\omega/g,'omega')
       .replace(/\\alpha/g,'alpha').replace(/\\beta/g,'beta')
       .replace(/\\gamma/g,'gamma').replace(/\\sigma/g,'sigma')
       .replace(/\\rho/g,'rho').replace(/\\phi/g,'phi')
       .replace(/\\lambda/g,'lambda').replace(/\\mu/g,'mu')
       .replace(/\\pi/g,'pi');
  // trig
  s = s.replace(/\\sin/g,'sin').replace(/\\cos/g,'cos')
       .replace(/\\tan/g,'tan').replace(/\\exp/g,'exp').replace(/\\ln/g,'ln');
  // cdot → *
  s = s.replace(/\\cdot\s*/g,'*');
  // Delta t → dt
  s = s.replace(/\\Delta\s*t/g,'dt');
  // fractions \frac{a}{b} → (a)/(b)
  s = s.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g,'($1)/($2)');
  // power ^ keep as is; remove braces from simple exponents
  s = s.replace(/\^\{([a-zA-Z0-9_.]+)\}/g,'^$1');
  // remove leftover latex commands
  s = s.replace(/\\[a-zA-Z]+\{([^}]*)\}/g,'$1');
  s = s.replace(/\\[a-zA-Z]+/g,'');
  s = s.replace(/[{}]/g,'');
  return s.trim();
}

function buildEditorUI() {
  const wrap = document.getElementById('editor-wrap');
  wrap.innerHTML = '';
  _editorLines.forEach((line, idx) => {
    wrap.appendChild(createLineEl(line, idx));
  });
  focusLine(_activeLine);
}

function createLineEl(lineText, idx) {
  const row = document.createElement('div');
  row.className = 'eq-line' + (idx === _activeLine ? ' eq-active' : '');
  row.dataset.idx = idx;

  const no = document.createElement('div');
  no.className = 'eq-lineno';
  no.textContent = idx + 1;

  const wrap = document.createElement('div');
  wrap.className = 'eq-input-wrap';

  const isEq = isEqLine(lineText);

  if (isEq && typeof MathfieldElement !== 'undefined') {
    const mf = document.createElement('math-field');
    mf.className = 'eq-mathfield';
    // Touch devices: show virtual keyboard on focus; desktop: manual (hidden by default, shown via CSS hover)
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    mf.setAttribute('virtual-keyboard-mode', isTouch ? 'onfocus' : 'manual');
    mf.setAttribute('smart-mode', 'true');
    mf.setAttribute('smart-superscript', 'false');
    const latex = lineToLatex(lineText);
    mf.value = latex;

    mf.addEventListener('input', () => {
      const plain = latexToPlain(mf.value);
      _editorLines[idx] = plain;
      scheduleReparse();
    });
    mf.addEventListener('focus', () => setActiveLine(idx));
    mf.addEventListener('keydown', e => handleLineKeydown(e, idx, mf));
    wrap.appendChild(mf);
  } else {
    const inp = document.createElement('input');
    inp.className = 'eq-plain' + (lineText.trim().startsWith('//') || lineText.trim().startsWith('#') ? ' eq-comment' : '');
    inp.type = 'text';
    inp.value = lineText;
    inp.spellcheck = false;
    inp.placeholder = idx === 0 ? '// equação ou comentário' : '';
    inp.addEventListener('input', () => {
      _editorLines[idx] = inp.value;
      // Re-render this line if it became an equation
      if (isEqLine(inp.value)) {
        _editorLines[idx] = inp.value;
        buildEditorUI();
        focusLine(idx);
      }
      scheduleReparse();
    });
    inp.addEventListener('focus', () => setActiveLine(idx));
    inp.addEventListener('keydown', e => handleLineKeydown(e, idx, inp));
    wrap.appendChild(inp);
  }

  row.appendChild(no);
  row.appendChild(wrap);
  return row;
}

function handleLineKeydown(e, idx, el) {
  if (e.key === 'Enter') {
    e.preventDefault();
    _editorLines.splice(idx + 1, 0, '');
    _activeLine = idx + 1;
    buildEditorUI();
    focusLine(idx + 1);
  } else if (e.key === 'Backspace') {
    const val = el.tagName === 'MATH-FIELD' ? latexToPlain(el.value) : el.value;
    if (val === '' && _editorLines.length > 1) {
      e.preventDefault();
      _editorLines.splice(idx, 1);
      _activeLine = Math.max(0, idx - 1);
      buildEditorUI();
      focusLine(_activeLine);
    }
  } else if (e.key === 'ArrowUp') {
    if (idx > 0) { e.preventDefault(); focusLine(idx - 1); }
  } else if (e.key === 'ArrowDown') {
    if (idx < _editorLines.length - 1) { e.preventDefault(); focusLine(idx + 1); }
  } else if (e.key === 'Tab') {
    e.preventDefault();
    _editorLines.splice(idx + 1, 0, '');
    _activeLine = idx + 1;
    buildEditorUI();
    focusLine(idx + 1);
  }
}

function focusLine(idx) {
  const wrap = document.getElementById('editor-wrap');
  const rows = wrap.querySelectorAll('.eq-line');
  rows.forEach((r,i) => r.classList.toggle('eq-active', i===idx));
  const row = rows[idx];
  if (!row) return;
  const el = row.querySelector('math-field, input');
  if (el) {
    el.focus();
    if (el.tagName !== 'MATH-FIELD') {
      try { el.setSelectionRange(el.value.length, el.value.length); } catch(e){}
    }
  }
  _activeLine = idx;
}

function setActiveLine(idx) {
  _activeLine = idx;
  const wrap = document.getElementById('editor-wrap');
  wrap.querySelectorAll('.eq-line').forEach((r,i) => r.classList.toggle('eq-active', i===idx));
}

function editorWrapClick(e) {
  // Clicking empty area below all lines: add new line
  const row = e.target.closest('.eq-line');
  if (!row) {
    _editorLines.push('');
    _activeLine = _editorLines.length - 1;
    buildEditorUI();
    focusLine(_activeLine);
  }
}

function getEditorText() {
  return _editorLines.join('\n');
}

function setEditorText(text) {
  _editorLines = text.split('\n');
  if (_editorLines.length === 0) _editorLines = [''];
  _activeLine = 0;
  // Guard: only build if editor-wrap exists and MathLive is ready
  if (document.getElementById('editor-wrap')) buildEditorUI();
}

function scheduleReparse() {
  clearTimeout(_parseTimer);
  _parseTimer = setTimeout(applyModel, 700);
}

function onEditorInput() {
  // legacy compat - not used with new editor
  scheduleReparse();
}

function updateLineNos() {
  // Not needed with new editor, kept for compat
}

function syncScroll() {}

function toggleMathPreview() {}
function updateMathPreview() {}

function applyModel(silent) {
  const src=getEditorText();
  const r=sim.setModel(src);
  const st=document.getElementById('parse-status');
  if(r.ok){
    st.textContent='✓ Modelo OK'; st.style.color='#34d399'; clearErr();
    rebuildVarList(); rebuildICPanel(); rebuildGraphSelects();
  } else {
    st.textContent='✗ '+r.errors[0].msg; st.style.color='#fb7185';
    if(!silent) setErr(r.errors[0].msg);
  }
}

function verifyModel() {
  applyModel();
  if(sim.parsed&&!sim.parsed.errors.length)
    toast(`✓ Modelo OK — ${Object.keys(sim.parsed.variables).length} variáveis`);
}

function rebuildVarList() {
  const BADGE_LABELS={state:'Estado (variável de estado)',const:'Constante',derived:'Derivada (calculada)',param:'Parâmetro'};
  const vars=sim.getVars();
  const el=document.getElementById('varlist');
  if(!vars.length){el.innerHTML='';return;}
  el.innerHTML=vars.map(v=>`
    <div class="varrow">
      <span class="vbadge ${v.type}" title="${BADGE_LABELS[v.type]||v.type}">${v.type.slice(0,3).toUpperCase()}</span>
      <span class="vname">${v.name}</span>
      <span class="vval" id="vv-${v.name}">—</span>
    </div>`).join('');
}

function updateVarValues() {
  if(!sim.parsed) return;
  Object.keys(sim.parsed.variables).forEach(v=>{
    const el=document.getElementById('vv-'+v);
    if(el&&sim.state[v]!==undefined) el.textContent=formatVal(Number(sim.state[v]));
  });
}

// ══════════════════════════════════════════════════════
// 9. INITIAL CONDITIONS
// ══════════════════════════════════════════════════════
function rebuildICPanel() {
  const vars=sim.getVars().filter(v=>v.type==='state');
  const grid=document.getElementById('ic-grid');
  grid.innerHTML=vars.map(v=>`
    <div class="icfield">
      <label>${v.name}₀</label>
      <input id="ic-${v.name}" type="number" step="any" value="${sim.initState[v.name]??0}">
    </div>`).join('');
}

function getICValues() {
  const ic={};
  document.querySelectorAll('#ic-grid input').forEach(inp=>{
    ic[inp.id.replace('ic-','')]=parseFloat(inp.value)||0;
  });
  if(sim.parsed) Object.entries(sim.parsed.constVars).forEach(([k,v])=>{ic[k]=v;});
  return ic;
}

function applyIC() {
  simReset();
  sim.setIC(getICValues());
  document.getElementById('ic-panel').classList.remove('show');
  rebuildICPanel();
  toast('✓ Condições iniciais aplicadas');
}

function toggleIC() { document.getElementById('ic-panel').classList.toggle('show'); }

// ══════════════════════════════════════════════════════
// 10. OBJECT MANAGEMENT UI
// ══════════════════════════════════════════════════════
let _pendingObjType=null;

function addObject(type) {
  _pendingObjType=type;
  const icons={particle:'●',pendulum:'🔴',spring:'🌀',vector:'➡',circle:'◯',rect:'▭',label:'T'};
  const labels={particle:'Partícula',pendulum:'Pêndulo',spring:'Mola + Bloco',vector:'Vetor',circle:'Círculo',rect:'Retângulo',label:'Texto'};
  document.getElementById('modal-icon').textContent=icons[type]||'●';
  document.getElementById('modal-type-label').textContent='Novo — '+labels[type];

  const vars=sim.getAllVarNames();
  const varOpts=vars.map(v=>`<option value="${v}">${v}</option>`).join('');
  const varOptsBlank='<option value="">—</option>'+varOpts;

  // Local helper: modal row with Const/Var toggle
  function mrowCV(label, baseId, defaultVal, vopts) {
    return `<div class="modal-row"><span class="modal-label">${label}</span>
      <select class="modal-sel" id="${baseId}-mode" style="width:80px" onchange="togglePivotField('${baseId}',this.value)">
        <option value="const">Constante</option><option value="var">Variável</option>
      </select>
      <input class="modal-inp" id="${baseId}" type="number" step="any" value="${defaultVal}" style="flex:1">
      <select class="modal-sel" id="${baseId}-var" style="display:none;flex:1">${vopts}</select>
    </div>`;
  }

  const FORMS={
    particle:`
      <div class="modal-row"><span class="modal-label">Nome</span><input class="modal-inp" id="mo-name" value="Partícula${_objId}"></div>
      ${mrowCV('Posição X','mo-x',0,varOptsBlank)}
      ${mrowCV('Posição Y','mo-y',0,varOptsBlank)}
      ${mrowCV('Vel. X','mo-vx',0,varOptsBlank)}
      ${mrowCV('Vel. Y','mo-vy',0,varOptsBlank)}
      <div class="modal-row"><span class="modal-label">Raio (px)</span><input class="modal-inp" id="mo-radius" type="number" value="8"></div>
      <div class="modal-row"><span class="modal-label">Cor</span><input class="modal-inp" type="color" id="mo-color" style="width:60px;padding:2px" value="#4f9eff"></div>
      <div class="modal-row"><span class="modal-label">Mostrar vel.</span><input type="checkbox" class="prop-check" id="mo-showvec"></div>
      <div class="modal-row"><span class="modal-label">Rastro</span><input type="checkbox" class="prop-check" id="mo-trail" checked></div>
      <div class="modal-row"><span class="modal-label">Rótulo</span><input class="modal-inp" id="mo-label" value="" placeholder="ex: bola"></div>`,
    pendulum:`
      <div class="modal-row"><span class="modal-label">Nome</span><input class="modal-inp" id="mo-name" value="Pêndulo${_objId}"></div>
      <div class="modal-row"><span class="modal-label">Ângulo θ</span><select class="modal-sel" id="mo-theta">${varOptsBlank}</select></div>
      <div class="modal-row"><span class="modal-label">Comprimento L</span>
        <select class="modal-sel" id="mo-L-mode" style="width:80px" onchange="togglePivotField('mo-L',this.value)"><option value="const">Constante</option><option value="var">Variável</option></select>
        <input class="modal-inp" id="mo-L" type="number" step="0.1" value="1.5" style="flex:1">
        <select class="modal-sel" id="mo-L-var" style="display:none;flex:1">${varOptsBlank}</select>
      </div>
      <div class="modal-row"><span class="modal-label">Pivot X</span>
        <select class="modal-sel" id="mo-pivotX-mode" style="width:80px" onchange="togglePivotField('mo-pivotX',this.value)"><option value="const">Constante</option><option value="var">Variável</option></select>
        <input class="modal-inp" id="mo-pivotX" type="number" value="0" style="flex:1">
        <select class="modal-sel" id="mo-pivotX-var" style="display:none;flex:1">${varOptsBlank}</select>
      </div>
      <div class="modal-row"><span class="modal-label">Pivot Y</span>
        <select class="modal-sel" id="mo-pivotY-mode" style="width:80px" onchange="togglePivotField('mo-pivotY',this.value)"><option value="const">Constante</option><option value="var">Variável</option></select>
        <input class="modal-inp" id="mo-pivotY" type="number" value="0" style="flex:1">
        <select class="modal-sel" id="mo-pivotY-var" style="display:none;flex:1">${varOptsBlank}</select>
      </div>
      <div class="modal-row"><span class="modal-label">Raio bob</span><input class="modal-inp" id="mo-radius" type="number" value="10"></div>
      <div class="modal-row"><span class="modal-label">Cor</span><input class="modal-inp" type="color" id="mo-color" value="#f97316"></div>
      <div class="modal-row"><span class="modal-label">Rastro</span><input type="checkbox" class="prop-check" id="mo-trail" checked></div>`,
    spring:`
      <div class="modal-row"><span class="modal-label">Nome</span><input class="modal-inp" id="mo-name" value="Mola${_objId}"></div>
      <div class="modal-row"><span class="modal-label">Orientação</span><select class="modal-sel" id="mo-vertical"><option value="true">Vertical (mola suspensa)</option><option value="false">Horizontal</option></select></div>
      <div class="modal-row"><span class="modal-label">Pos. bloco</span><select class="modal-sel" id="mo-x">${varOptsBlank}</select></div>
      <div class="modal-row"><span class="modal-label">Pivot X</span>
        <select class="modal-sel" id="mo-pivotX-mode" style="width:80px" onchange="togglePivotField('mo-pivotX',this.value)"><option value="const">Constante</option><option value="var">Variável</option></select>
        <input class="modal-inp" id="mo-pivotX" type="number" value="0" style="flex:1">
        <select class="modal-sel" id="mo-pivotX-var" style="display:none;flex:1">${varOptsBlank}</select>
      </div>
      <div class="modal-row"><span class="modal-label">Pivot Y</span>
        <select class="modal-sel" id="mo-pivotY-mode" style="width:80px" onchange="togglePivotField('mo-pivotY',this.value)"><option value="const">Constante</option><option value="var">Variável</option></select>
        <input class="modal-inp" id="mo-pivotY" type="number" value="5" style="flex:1">
        <select class="modal-sel" id="mo-pivotY-var" style="display:none;flex:1">${varOptsBlank}</select>
      </div>
      <div class="modal-row"><span class="modal-label">Espiras</span><input class="modal-inp" id="mo-coils" type="number" value="10"></div>
      <div class="modal-row"><span class="modal-label">Cor</span><input class="modal-inp" type="color" id="mo-color" value="#a78bfa"></div>`,
    vector:`
      <div class="modal-row"><span class="modal-label">Nome</span><input class="modal-inp" id="mo-name" value="Vetor${_objId}"></div>
      ${mrowCV('Origem X','mo-x',0,varOptsBlank)}
      ${mrowCV('Origem Y','mo-y',0,varOptsBlank)}
      ${mrowCV('Comp. Vx','mo-vx',0,varOptsBlank)}
      ${mrowCV('Comp. Vy','mo-vy',0,varOptsBlank)}
      <div class="modal-row"><span class="modal-label">Escala</span><input class="modal-inp" id="mo-scale" type="number" step="0.1" value="0.3"></div>
      <div class="modal-row"><span class="modal-label">Cor</span><input class="modal-inp" type="color" id="mo-color" value="#34d399"></div>
      <div class="modal-row"><span class="modal-label">Rótulo</span><input class="modal-inp" id="mo-label" value=""></div>`,
    circle:`
      <div class="modal-row"><span class="modal-label">Nome</span><input class="modal-inp" id="mo-name" value="Círculo${_objId}"></div>
      ${mrowCV('Centro X','mo-x',0,varOptsBlank)}
      ${mrowCV('Centro Y','mo-y',0,varOptsBlank)}
      ${mrowCV('Raio (unid.)','mo-r',1,varOptsBlank)}
      <div class="modal-row"><span class="modal-label">Cor borda</span><input class="modal-inp" type="color" id="mo-color" value="#4f9eff"></div>`,
    rect:`
      <div class="modal-row"><span class="modal-label">Nome</span><input class="modal-inp" id="mo-name" value="Rect${_objId}"></div>
      ${mrowCV('Centro X','mo-x',0,varOptsBlank)}
      ${mrowCV('Centro Y','mo-y',0,varOptsBlank)}
      ${mrowCV('Largura','mo-w',1,varOptsBlank)}
      ${mrowCV('Altura','mo-h',1,varOptsBlank)}
      <div class="modal-row"><span class="modal-label">Cor</span><input class="modal-inp" type="color" id="mo-color" value="#4f9eff"></div>`,
    label:`
      <div class="modal-row"><span class="modal-label">Nome</span><input class="modal-inp" id="mo-name" value="Texto${_objId}"></div>
      <div class="modal-row"><span class="modal-label">Pos X</span><input class="modal-inp" id="mo-x" type="number" value="0"></div>
      <div class="modal-row"><span class="modal-label">Pos Y</span><input class="modal-inp" id="mo-y" type="number" value="3"></div>
      <div class="modal-row"><span class="modal-label">Texto</span><input class="modal-inp" id="mo-text" value="t = {t:2}s" style="width:100%"></div>
      <div class="modal-row"><span class="modal-label">Tamanho</span><input class="modal-inp" id="mo-fontSize" type="number" value="13"></div>
      <div class="modal-row"><span class="modal-label">Cor</span><input class="modal-inp" type="color" id="mo-color" value="#e2e8f0"></div>`,
    vectorfield:`
      <div class="modal-row"><span class="modal-label">Nome</span><input class="modal-inp" id="mo-name" value="Campo${_objId}"></div>
      <div class="modal-row"><span class="modal-label">Fx(x,y,t)</span><input class="modal-inp" id="mo-fxExpr" value="-y" placeholder="ex: -y"></div>
      <div class="modal-row"><span class="modal-label">Fy(x,y,t)</span><input class="modal-inp" id="mo-fyExpr" value="x" placeholder="ex: x"></div>
      <div class="modal-row"><span class="modal-label">Grade N</span><input class="modal-inp" id="mo-gridN" type="number" value="14"></div>
      <div class="modal-row"><span class="modal-label">Alcance</span><input class="modal-inp" id="mo-gridRange" type="number" value="5"></div>
      <div class="modal-row"><span class="modal-label">Escala seta</span><input class="modal-inp" id="mo-arrowScale" type="number" step="0.05" value="0.4"></div>
      <div class="modal-row"><span class="modal-label">Cor</span><input class="modal-inp" type="color" id="mo-color" value="#4f9eff"></div>`,
  };

  document.getElementById('modal-body').innerHTML=FORMS[type]||'';

  // Auto-select variables based on common patterns
  setTimeout(()=>{
    const vars=sim.getAllVarNames();
    // Auto-select variable and switch to var mode
    const trySet=(id,preferred)=>{
      const varSel=document.getElementById(id+'-var');
      const modeEl=document.getElementById(id+'-mode');
      if(varSel&&modeEl) {
        // new const/var toggle style
        const found=preferred.find(p=>vars.includes(p));
        if(found){ varSel.value=found; modeEl.value='var'; togglePivotField(id,'var'); }
        return;
      }
      // legacy plain select
      const el=document.getElementById(id); if(!el||el.tagName!=='SELECT') return;
      preferred.some(p=>{ if(vars.includes(p)){el.value=p;return true;} return false; });
    };
    if(type==='particle'||type==='vector'){
      trySet('mo-x',['x','px','rx']); trySet('mo-y',['y','py','ry']);
      trySet('mo-vx',['vx','vx0']); trySet('mo-vy',['vy','vy0']);
    }
    if(type==='pendulum') trySet('mo-theta',['theta','angle','th']);
    if(type==='spring') { trySet('mo-x',['x','pos','q']); }
    if(type==='circle') { trySet('mo-x',['x']); trySet('mo-y',['y']); trySet('mo-r',['r']); }
    if(type==='rect') { trySet('mo-x',['x']); trySet('mo-y',['y']); trySet('mo-w',['w']); trySet('mo-h',['h']); }
    // Populate var dropdowns for pivot/L
    ['mo-pivotX-var','mo-pivotY-var','mo-L-var'].forEach(sid=>{
      const sel=document.getElementById(sid); if(!sel) return;
      sel.innerHTML='<option value="">—</option>'+vars.map(v=>`<option value="${v}">${v}</option>`).join('');
    });
  },50);

  document.getElementById('modal-add').classList.add('show');
}

function togglePivotField(base, mode) {
  const inp = document.getElementById(base);
  const sel = document.getElementById(base+'-var');
  if (!inp || !sel) return;
  if (mode === 'var') { inp.style.display='none'; sel.style.display=''; }
  else { inp.style.display=''; sel.style.display='none'; }
}

// Helper: read pivot/L field — returns string (var name) or number
function readPivotVal(base) {
  const modeEl = document.getElementById(base+'-mode');
  if (!modeEl) {
    // fallback: plain input
    const el = document.getElementById(base);
    return el ? (parseFloat(el.value)||0) : 0;
  }
  if (modeEl.value === 'var') {
    const sel = document.getElementById(base+'-var');
    return sel ? (sel.value || 0) : 0;
  } else {
    const inp = document.getElementById(base);
    return inp ? (parseFloat(inp.value)||0) : 0;
  }
}

function confirmAddObject() {
  const t=_pendingObjType; if(!t) return;
  const v=id=>{ const el=document.getElementById(id); return el?el.value:undefined; };
  const n=id=>{ const el=document.getElementById(id); return el?parseFloat(el.value)||0:0; };
  const b=id=>{ const el=document.getElementById(id); return el?el.checked:false; };

  const common={name:v('mo-name')||undefined, color:v('mo-color')||undefined};

  const props={
    particle:{...common, x:readPivotVal('mo-x')||0, y:readPivotVal('mo-y')||0,
      vx:readPivotVal('mo-vx')||0, vy:readPivotVal('mo-vy')||0,
      radius:n('mo-radius')||8, showVec:b('mo-showvec'), showTrail:b('mo-trail'), label:v('mo-label')||''},
    pendulum:{...common, theta:v('mo-theta')||'theta', L:readPivotVal('mo-L')||1.5,
      pivotX:readPivotVal('mo-pivotX'), pivotY:readPivotVal('mo-pivotY'), radius:n('mo-radius')||10, showTrail:b('mo-trail')},
    spring:{...common, x:readPivotVal('mo-x')||0, y:0, x1:readPivotVal('mo-pivotX'), y1:readPivotVal('mo-pivotY'),
      pivotX:readPivotVal('mo-pivotX'), pivotY:readPivotVal('mo-pivotY'),
      coils:n('mo-coils')||10, vertical:v('mo-vertical')||'true'},
    vector:{...common, x:readPivotVal('mo-x')||0, y:readPivotVal('mo-y')||0,
      vx:readPivotVal('mo-vx')||0, vy:readPivotVal('mo-vy')||0,
      scale:n('mo-scale')||0.3, label:v('mo-label')||''},
    circle:{...common, x:readPivotVal('mo-x')||0, y:readPivotVal('mo-y')||0, r:String(readPivotVal('mo-r')||1)},
    rect:{...common, x:readPivotVal('mo-x')||0, y:readPivotVal('mo-y')||0,
      w:String(readPivotVal('mo-w')||1), h:String(readPivotVal('mo-h')||1)},
    label:{...common, x:n('mo-x'), y:n('mo-y'), text:v('mo-text')||'t = {t:2}', fontSize:n('mo-fontSize')||13},
    vectorfield:{...common, fxExpr:v('mo-fxExpr')||'-y', fyExpr:v('mo-fyExpr')||'x', gridN:n('mo-gridN')||14, gridRange:n('mo-gridRange')||5, arrowScale:n('mo-arrowScale')||0.4},
  };

  const obj=makeObj(t, props[t]||common);
  anim.objects.push(obj);
  renderObjList();
  closeModal('modal-add');
  // Select the new object
  if(selectedObj) selectedObj._selected=false;
  selectedObj=obj; obj._selected=true;
  renderObjList();
  renderObjProps(obj);
  toast(`✓ ${obj.name} adicionado`);
}

function renderObjList() {
  const el=document.getElementById('obj-list');
  if(!anim.objects.length){
    el.innerHTML='<div class="no-obj">Sem objetos.<br>Adicione abaixo ↓</div>'; return;
  }
  el.innerHTML=anim.objects.map((o,idx)=>`
    <div class="obj-row${o._selected?' selected':''}" onclick="selectObj(${o.id})">
      <span class="obj-icon">${OBJECT_ICONS[o.type]||'●'}</span>
      <span class="obj-name">${o.name}</span>
      <span class="obj-layer-btns" onclick="event.stopPropagation()" style="display:flex;gap:1px;margin-left:auto;flex-shrink:0">
        <span class="obj-vis" onclick="moveObjLayer(${o.id},-1)" title="Mover para cima (frente)" style="font-size:10px;padding:2px 3px">▲</span>
        <span class="obj-vis" onclick="moveObjLayer(${o.id},1)" title="Mover para baixo (atrás)" style="font-size:10px;padding:2px 3px">▼</span>
      </span>
      <span class="obj-vis" onclick="event.stopPropagation();toggleObjVis(${o.id})" title="${o.visible?'Ocultar':'Mostrar'}">${o.visible?'👁':'🚫'}</span>
      <span class="obj-del" onclick="event.stopPropagation();deleteObj(${o.id})" title="Remover">✕</span>
    </div>`).join('');
}

function selectObj(id) {
  if(selectedObj) selectedObj._selected=false;
  selectedObj=anim.objects.find(o=>o.id===id)||null;
  if(selectedObj) selectedObj._selected=true;
  renderObjList();
  renderObjProps(selectedObj);
}

function toggleObjVis(id) {
  const o=anim.objects.find(o=>o.id===id); if(!o) return;
  o.visible=!o.visible; renderObjList();
}

function deleteObj(id) {
  const i=anim.objects.findIndex(o=>o.id===id); if(i<0) return;
  if(selectedObj&&selectedObj.id===id){ selectedObj=null; renderObjProps(null); }
  anim.objects.splice(i,1); renderObjList();
}

function deleteSelectedObj() { if(selectedObj) deleteObj(selectedObj.id); }
function clearAllObjects() { anim.objects=[]; selectedObj=null; renderObjList(); renderObjProps(null); }

function moveObjLayer(id, dir) {
  const i=anim.objects.findIndex(o=>o.id===id); if(i<0) return;
  const ni=i+dir;
  if(ni<0||ni>=anim.objects.length) return;
  const tmp=anim.objects[i]; anim.objects[i]=anim.objects[ni]; anim.objects[ni]=tmp;
  renderObjList();
}

function loadObjImage(id) {
  const o=anim.objects.find(o=>o.id===id); if(!o) return;
  const inp=document.createElement('input');
  inp.type='file'; inp.accept='image/png,image/jpeg,image/gif,image/webp';
  inp.onchange=()=>{
    const f=inp.files[0]; if(!f) return;
    const reader=new FileReader();
    reader.onload=ev=>{
      o.imageData=ev.target.result;
      const img=new Image(); img.src=o.imageData; o._imgEl=img;
      o.useImage=true;
      renderObjProps(o);
      toast('✓ Imagem carregada — salva no projeto .modx');
    };
    reader.readAsDataURL(f);
  };
  inp.click();
}
function resetObjOffset(id) {
  const o=anim.objects.find(o=>o.id===id); if(!o) return;
  o._vox=0; o._voy=0; toast('↺ Offset visual resetado');
}

// ── OBJECT PROPERTIES PANEL ──
function renderObjProps(obj) {
  const el=document.getElementById('obj-props');
  if(!obj){ el.innerHTML='<div class="no-obj">Clique num objeto<br>para ver propriedades</div>'; return; }
  const vars=sim.getAllVarNames();
  const vOpts=vars.map(v=>`<option value="${v}">${v}</option>`).join('');
  const vOptsBl='<option value="">—</option>'+vOpts;
  const selV=(val,bl)=>bl?`<select class="prop-val" onchange="updateObjProp(${obj.id},this.getAttribute('data-prop'),this.value)" data-prop="PROP">${bl?'<option value="">—</option>':''}${vars.map(v=>`<option value="${v}"${v===val?'selected':''}>${v}</option>`).join('')}</select>`:'';

  function row(label, propKey, value, type='text') {
    const isVarSel=(type==='varsel');
    const isVarOrNum=(type==='varnum');
    const isTrailMode=(type==='trailmode');
    const inp=isVarSel||isVarOrNum
      ? `<select class="prop-val" data-prop="${propKey}" onchange="updateObjProp(${obj.id},this.getAttribute('data-prop'),this.value)">${vOptsBl.replace('selected','').replace(`value="${value}"`,`value="${value}" selected`)}</select>`
      : isTrailMode
      ? `<select class="prop-val" data-prop="${propKey}" onchange="updateObjProp(${obj.id},this.getAttribute('data-prop'),this.value)">
          <option value="persist"${value==='persist'?' selected':''}>Persistente</option>
          <option value="fade"${value==='fade'?' selected':''}>Temporário</option>
          <option value="dots"${value==='dots'?' selected':''}>Fantasmas</option>
          <option value="none"${value==='none'?' selected':''}>Sem rastro</option>
        </select>`
      : type==='color'
      ? `<input type="color" class="prop-color" value="${value||'#4f9eff'}" data-prop="${propKey}" onchange="updateObjProp(${obj.id},this.getAttribute('data-prop'),this.value)">`
      : type==='checkbox'
      ? `<input type="checkbox" class="prop-check" ${value?'checked':''} data-prop="${propKey}" onchange="updateObjProp(${obj.id},this.getAttribute('data-prop'),this.checked)">`
      : `<input class="prop-val" type="${type==='number'?'number':'text'}" value="${value??''}" step="any" data-prop="${propKey}" onchange="updateObjProp(${obj.id},this.getAttribute('data-prop'),this.value)" onkeydown="if(event.key==='Enter')this.blur()">`;
    return `<div class="prop-row"><span class="prop-label">${label}</span>${inp}</div>`;
  }

  // Row that allows choosing Constant (number) or Variable (select) for pivot/length fields
  function rowVarOrConst(label, propKey, value, varList, objId) {
    const isVar = typeof value === 'string' && value !== '' && isNaN(value);
    const numVal = isVar ? '' : (value ?? 0);
    const varOpts = varList.map(v=>`<option value="${v}"${v===value?' selected':''}>${v}</option>`).join('');
    return `<div class="prop-row">
      <span class="prop-label">${label}</span>
      <select style="background:var(--bg);border:1px solid var(--border);border-radius:3px;color:var(--txt2);font-size:10px;padding:2px 4px;width:68px;flex-shrink:0"
        onchange="(function(sel){
          var wrap=sel.closest('.prop-row');
          wrap.querySelector('.pvc-num').style.display=sel.value==='var'?'none':'';
          wrap.querySelector('.pvc-var').style.display=sel.value==='var'?'':'none';
        })(this)">
        <option value="const"${!isVar?' selected':''}>Constante</option>
        <option value="var"${isVar?' selected':''}>Variável</option>
      </select>
      <input class="prop-val pvc-num" type="number" step="any" value="${numVal}" style="${isVar?'display:none;':''}flex:1"
        data-prop="${propKey}" onchange="updateObjProp(${objId},this.getAttribute('data-prop'),parseFloat(this.value)||0)" onkeydown="if(event.key==='Enter')this.blur()">
      <select class="prop-val pvc-var" data-prop="${propKey}" style="${isVar?'':'display:none;'}flex:1"
        onchange="updateObjProp(${objId},this.getAttribute('data-prop'),this.value)">
        <option value="">—</option>${varOpts}
      </select>
    </div>`;
  }

  const PROPS={
    particle:`
      <div class="prop-section"><div class="prop-title">Identidade</div>
        ${row('Nome','name',obj.name)}
        ${row('Cor','color',obj.color,'color')}
        ${row('Raio px','radius',obj.radius,'number')}
        ${row('Rotação °','rotation',obj.rotation||0,'number')}
      </div>
      <div class="prop-section"><div class="prop-title">Posição</div>
        ${rowVarOrConst('X ←→','x',obj.x,vars,obj.id)}
        ${rowVarOrConst('Y ↕','y',obj.y,vars,obj.id)}
        <div class="prop-row"><span class="prop-label" style="font-size:10px;color:var(--txt3)">Offset visual</span><button class="pico" onclick="resetObjOffset(${obj.id})" style="font-size:10px">↺ Resetar</button></div>
      </div>
      <div class="prop-section"><div class="prop-title">Vetor Velocidade</div>
        ${row('Mostrar','showVec',obj.showVec,'checkbox')}
        ${row('Projeções','showVecProj',obj.showVecProj!==false,'checkbox')}
        ${rowVarOrConst('Vx','vx',obj.vx,vars,obj.id)}
        ${rowVarOrConst('Vy','vy',obj.vy,vars,obj.id)}
        ${row('Escala','vecScale',obj.vecScale,'number')}
        ${row('Cor vetor','vecColor',obj.vecColor,'color')}
      </div>
      <div class="prop-section"><div class="prop-title">Rastro</div>
        ${row('Mostrar','showTrail',obj.showTrail,'checkbox')}
        ${row('Modo','trailMode',obj.trailMode||'persist','trailmode')}
        ${row('Comprimento','trailLen',obj.trailLen,'number')}
        ${row('Rótulo','label',obj.label)}
      </div>
      <div class="prop-section"><div class="prop-title">Imagem</div>
        ${row('Usar imagem','useImage',obj.useImage,'checkbox')}
        <div class="prop-row"><span class="prop-label" style="font-size:10px;color:var(--txt3)">PNG/JPG</span><button class="pico" onclick="loadObjImage(${obj.id})" style="font-size:10px">📁 Carregar</button>${obj.imageData?'<span style="color:#34d399;font-size:10px;margin-left:4px">✓</span>':''}</div>
      </div>`,
    pendulum:`
      <div class="prop-section"><div class="prop-title">Identidade</div>
        ${row('Nome','name',obj.name)}
        ${row('Cor bob','color',obj.color,'color')}
        ${row('Cor haste','rodColor',obj.rodColor,'color')}
        ${row('Raio bob','radius',obj.radius,'number')}
        ${row('Rotação °','rotation',obj.rotation||0,'number')}
      </div>
      <div class="prop-section"><div class="prop-title">Física</div>
        ${row('Ângulo θ','theta',obj.theta,'varsel')}
        ${rowVarOrConst('Comprimento L','L',obj.L,vars,obj.id)}
        ${rowVarOrConst('Pivot X','pivotX',obj.pivotX,vars,obj.id)}
        ${rowVarOrConst('Pivot Y','pivotY',obj.pivotY,vars,obj.id)}
        <div class="prop-row"><span class="prop-label" style="font-size:10px;color:var(--txt3)">Offset visual</span><button class="pico" onclick="resetObjOffset(${obj.id})" style="font-size:10px">↺ Resetar</button></div>
      </div>
      <div class="prop-section"><div class="prop-title">Rastro</div>
        ${row('Mostrar','showTrail',obj.showTrail,'checkbox')}
        ${row('Modo','trailMode',obj.trailMode||'persist','trailmode')}
        ${row('Comprimento','trailLen',obj.trailLen,'number')}
      </div>`,
    spring:`
      <div class="prop-section"><div class="prop-title">Identidade</div>
        ${row('Nome','name',obj.name)}
        ${row('Cor','color',obj.color,'color')}
        <div class="prop-row"><span class="prop-label" style="font-size:10px;color:var(--txt3)">Offset visual</span><button class="pico" onclick="resetObjOffset(${obj.id})" style="font-size:10px">↺ Resetar</button></div>
      </div>
      <div class="prop-section"><div class="prop-title">Configuração</div>
        <div class="prop-row"><span class="prop-label">Orientação</span><select class="prop-val" data-prop="vertical" onchange="updateObjProp(${obj.id},this.getAttribute('data-prop'),this.value)"><option value="true"${(obj.vertical===true||obj.vertical==='true')?' selected':''}>Vertical</option><option value="false"${(obj.vertical===false||obj.vertical==='false')?' selected':''}>Horizontal</option></select></div>
        ${row('Bloco (var)','x',obj.x,'varsel')}
        ${rowVarOrConst('Pivot X','pivotX',obj.pivotX!==undefined?obj.pivotX:obj.x1,vars,obj.id)}
        ${rowVarOrConst('Pivot Y','pivotY',obj.pivotY!==undefined?obj.pivotY:obj.y1,vars,obj.id)}
        ${row('Espiras','coils',obj.coils,'number')}
      </div>`,
    vector:`
      <div class="prop-section"><div class="prop-title">Identidade</div>
        ${row('Nome','name',obj.name)}
        ${row('Cor','color',obj.color,'color')}
        ${row('Espessura','lineWidth',obj.lineWidth,'number')}
        ${row('Rotação °','rotation',obj.rotation||0,'number')}
        ${row('Rótulo','label',obj.label)}
        <div class="prop-row"><span class="prop-label" style="font-size:10px;color:var(--txt3)">Offset visual</span><button class="pico" onclick="resetObjOffset(${obj.id})" style="font-size:10px">↺ Resetar</button></div>
      </div>
      <div class="prop-section"><div class="prop-title">Origem</div>
        ${rowVarOrConst('X','x',obj.x,vars,obj.id)}
        ${rowVarOrConst('Y','y',obj.y,vars,obj.id)}
      </div>
      <div class="prop-section"><div class="prop-title">Componentes</div>
        ${rowVarOrConst('Vx','vx',obj.vx,vars,obj.id)}
        ${rowVarOrConst('Vy','vy',obj.vy,vars,obj.id)}
        ${row('Escala','scale',obj.scale,'number')}
      </div>`,
    circle:`
      <div class="prop-section"><div class="prop-title">Identidade</div>
        ${row('Nome','name',obj.name)}
        ${row('Cor borda','color',obj.color,'color')}
        ${row('Cor fill','fillColor',obj.fillColor,'color')}
        ${row('Rotação °','rotation',obj.rotation||0,'number')}
        <div class="prop-row"><span class="prop-label" style="font-size:10px;color:var(--txt3)">Offset visual</span><button class="pico" onclick="resetObjOffset(${obj.id})" style="font-size:10px">↺ Resetar</button></div>
      </div>
      <div class="prop-section"><div class="prop-title">Geometria</div>
        ${rowVarOrConst('Centro X','x',obj.x,vars,obj.id)}
        ${rowVarOrConst('Centro Y','y',obj.y,vars,obj.id)}
        ${rowVarOrConst('Raio','r',obj.r,vars,obj.id)}
      </div>
      <div class="prop-section"><div class="prop-title">Imagem</div>
        ${row('Usar imagem','useImage',obj.useImage,'checkbox')}
        <div class="prop-row"><span class="prop-label" style="font-size:10px;color:var(--txt3)">PNG/JPG</span><button class="pico" onclick="loadObjImage(${obj.id})" style="font-size:10px">📁 Carregar</button>${obj.imageData?'<span style="color:#34d399;font-size:10px;margin-left:4px">✓</span>':''}</div>
      </div>`,
    rect:`
      <div class="prop-section"><div class="prop-title">Identidade</div>
        ${row('Nome','name',obj.name)}
        ${row('Cor borda','color',obj.color,'color')}
        ${row('Cor fill','fillColor',obj.fillColor,'color')}
        ${row('Rotação °','rotation',obj.rotation||0,'number')}
        <div class="prop-row"><span class="prop-label" style="font-size:10px;color:var(--txt3)">Offset visual</span><button class="pico" onclick="resetObjOffset(${obj.id})" style="font-size:10px">↺ Resetar</button></div>
      </div>
      <div class="prop-section"><div class="prop-title">Geometria</div>
        ${rowVarOrConst('Centro X','x',obj.x,vars,obj.id)}
        ${rowVarOrConst('Centro Y','y',obj.y,vars,obj.id)}
        ${rowVarOrConst('Largura','w',obj.w,vars,obj.id)}
        ${rowVarOrConst('Altura','h',obj.h,vars,obj.id)}
      </div>
      <div class="prop-section"><div class="prop-title">Imagem</div>
        ${row('Usar imagem','useImage',obj.useImage,'checkbox')}
        <div class="prop-row"><span class="prop-label" style="font-size:10px;color:var(--txt3)">PNG/JPG</span><button class="pico" onclick="loadObjImage(${obj.id})" style="font-size:10px">📁 Carregar</button>${obj.imageData?'<span style="color:#34d399;font-size:10px;margin-left:4px">✓</span>':''}</div>
      </div>`,
    label:`
      <div class="prop-section"><div class="prop-title">Identidade</div>
        ${row('Nome','name',obj.name)}
        ${row('Cor','color',obj.color,'color')}
        ${row('Tamanho','fontSize',obj.fontSize,'number')}
        ${row('Rotação °','rotation',obj.rotation||0,'number')}
        <div class="prop-row"><span class="prop-label" style="font-size:10px;color:var(--txt3)">Offset visual</span><button class="pico" onclick="resetObjOffset(${obj.id})" style="font-size:10px">↺ Resetar</button></div>
      </div>
      <div class="prop-section"><div class="prop-title">Conteúdo</div>
        ${row('Texto','text',obj.text)}
        ${row('Pos X','x',obj.x,'number')}
        ${row('Pos Y','y',obj.y,'number')}
      </div>
      <div class="prop-section" style="font-size:10px;color:var(--txt3)">Use {varname} ou {varname:2} para interpolar valores</div>`,
    vectorfield:`
      <div class="prop-section"><div class="prop-title">Campo Vetorial</div>
        ${row('Nome','name',obj.name)}
        ${row('Cor','color',obj.color||'#4f9eff','color')}
        ${row('Fx(x,y,t)','fxExpr',obj.fxExpr||'-y')}
        ${row('Fy(x,y,t)','fyExpr',obj.fyExpr||'x')}
        ${row('Grade N','gridN',obj.gridN||14,'number')}
        ${row('Alcance','gridRange',obj.gridRange||5,'number')}
        ${row('Escala seta','arrowScale',obj.arrowScale||0.4,'number')}
      </div>`,
  };

  el.innerHTML=PROPS[obj.type]||`<div class="no-obj">Tipo: ${obj.type}</div>`;
}

function updateObjProp(id, prop, value) {
  const o=anim.objects.find(o=>o.id===id); if(!o) return;
  // Convert to appropriate types
  const numProps=new Set(['radius','trailLen','vecScale','scale','lineWidth','fontSize','coils']);
  const pivotProps=new Set(['pivotX','pivotY','L','x1','y1']); // can be number OR variable string
  const boolProps=new Set(['showVec','showVecProj','showTrail','useImage','visible']);
  const strProps=new Set(['trailMode','color','trailColor','vecColor','rodColor','fillColor']);
  if(numProps.has(prop)) o[prop]=parseFloat(value)||0;
  else if(pivotProps.has(prop)) {
    // if value is a non-numeric string treat as variable name, else parse as number
    if(typeof value==='string' && value!=='' && isNaN(value)) o[prop]=value;
    else o[prop]=parseFloat(value)||0;
  }
  else if(boolProps.has(prop)) o[prop]=Boolean(value);
  else if(strProps.has(prop)) o[prop]=value;
  else if(prop==='name') { o.name=value; renderObjList(); }
  else o[prop]=value;
  // reset trail if binding changed
  if(prop==='x'||prop==='y'||prop==='theta') o._trail=[];
}

// ══════════════════════════════════════════════════════
// 11. GRAPH MANAGEMENT
// ══════════════════════════════════════════════════════
function selTab(i) {
  activeTab=i;
  window.activeTab=i;
  document.querySelectorAll('.gtab').forEach((t,j)=>t.classList.toggle('active',i===j));
  document.querySelectorAll('.gcwrap').forEach((w,j)=>w.classList.toggle('active',i===j));
  rebuildGraphSelects();
}

function rebuildGraphSelects() {
  const vars=['t',...(sim.parsed?Object.keys(sim.parsed.variables):[])];
  const g=graphs[activeTab];
  ['cfg-xvar','cfg-yvar','cfg-yvar2'].forEach((id,si)=>{
    const sel=document.getElementById(id); if(!sel) return;
    const cur=sel.value;
    sel.innerHTML=(si>0?'<option value="">—</option>':'')+vars.map(v=>`<option value="${v}">${v}</option>`).join('');
    if(vars.includes(cur)) sel.value=cur;
  });
  document.getElementById('cfg-xvar').value=g.xvar||'t';
  document.getElementById('cfg-yvar').value=g.yvar||'';
  document.getElementById('cfg-yvar2').value=g.yvar2||'';
}

function updateGraphCfg() {
  const g=graphs[activeTab];
  const nx=document.getElementById('cfg-xvar').value;
  const ny=document.getElementById('cfg-yvar').value;
  const ny2=document.getElementById('cfg-yvar2').value;
  if(g.xvar!==nx||g.yvar!==ny||g.yvar2!==ny2){
    g.xvar=nx; g.yvar=ny; g.yvar2=ny2||'';
    g.clear();
  }
}

function exportGraphPNG(idx) {
  const cv = document.getElementById('gc-'+idx);
  if (!cv) return;
  const a = document.createElement('a');
  a.download = 'grafico'+(idx+1)+'.png';
  a.href = cv.toDataURL('image/png');
  a.click();
  toast('✓ Gráfico '+(idx+1)+' exportado como PNG');
}

function clearGraph(i) { graphs[i].clear(); }

// ══════════════════════════════════════════════════════
// 12. EXAMPLES
// ══════════════════════════════════════════════════════
const EXAMPLES={
  queda:{
    model:`// Queda Livre\ng = 9.8\n\ny(t+dt) = y(t) + vy*dt\nvy(t+dt) = vy(t) - g*dt`,
    ic:{y:50,vy:0}, dt:0.01, tmax:4,
    objects:[{type:'particle',x:'0',y:'y',color:'#4f9eff',showTrail:true,showVec:true,vx:'0',vy:'vy',vecScale:0.2,label:'queda'}],
    g0:{xvar:'t',yvar:'y'}, g1:{xvar:'t',yvar:'vy'}, scale:8, ox:.5, oy:.1
  },
  projetil:{
    model:`// Projétil Simples\ng = 9.8\n\nx(t+dt) = x(t) + vx*dt\ny(t+dt) = y(t) + vy*dt\nvy(t+dt) = vy(t) - g*dt`,
    ic:{x:0,y:0,vx:15,vy:20}, dt:0.01, tmax:5,
    objects:[
      {type:'particle',x:'x',y:'y',color:'#f97316',showTrail:true,showVec:true,vx:'vx',vy:'vy',vecScale:0.28,vecColor:'#34d399',radius:8,label:''},
    ],
    g0:{xvar:'x',yvar:'y'}, g1:{xvar:'t',yvar:'vy',yvar2:'vx'}, scale:18, ox:.05, oy:.55
  },
  projetil_drag:{
    model:`// Projétil com Arrasto\ng = 9.8\nk = 0.08\nm = 1.0\n\nx(t+dt) = x(t) + vx*dt\ny(t+dt) = y(t) + vy*dt\nvx(t+dt) = vx(t) + ax*dt\nvy(t+dt) = vy(t) + ay*dt\n\nv = sqrt(vx^2 + vy^2)\nax = -k/m * vx * v\nay = -g - k/m * vy * v`,
    ic:{x:0,y:0,vx:20,vy:25}, dt:0.005, tmax:6,
    objects:[{type:'particle',x:'x',y:'y',color:'#fb7185',showTrail:true,showVec:false,radius:8}],
    g0:{xvar:'x',yvar:'y'}, g1:{xvar:'t',yvar:'vy'}, scale:16, ox:.03, oy:.55
  },
  pendulo:{
    model:`// Pêndulo Simples\ng = 9.8\nL = 1.5\n\ntheta(t+dt) = theta(t) + omega*dt\nomega(t+dt) = omega(t) - (g/L)*sin(theta)*dt`,
    ic:{theta:1.2,omega:0}, dt:0.005, tmax:12,
    objects:[{type:'pendulum',theta:'theta',L:1.5,color:'#f97316',showTrail:true,radius:10}],
    g0:{xvar:'t',yvar:'theta'}, g1:{xvar:'theta',yvar:'omega'}, scale:80, ox:.5, oy:.25
  },
  mola:{
    model:`// Mola Suspensa (Vertical) — Oscilador Amortecido\nk = 5.0\nm = 1.0\nb = 0.3\ng = 9.8\n\n// Equilíbrio natural: x_eq = m*g/k\nx_eq = m*g/k\n\n// x = posição vertical do bloco (positivo = abaixo do teto)\nx(t+dt) = x(t) + v*dt\nv(t+dt) = v(t) + (g - k/m*(x - x_eq) - b/m*v)*dt`,
    ic:{x:2.5,v:0}, dt:0.01, tmax:20,
    objects:[{type:'spring',x:'0',y:'x',x1:0,y1:5,pivotX:0,pivotY:5,coils:10,vertical:true,color:'#a78bfa'}],
    g0:{xvar:'t',yvar:'x',yvar2:'v'}, g1:{xvar:'x',yvar:'v'}, scale:50, ox:.5, oy:.15
  },
  orbita:{
    model:`// Órbita Kepleriana (elíptica)\nG = 1.0\nM = 1.0\n\nr = sqrt(x^2 + y^2)\nax = -G*M*x/r^3\nay = -G*M*y/r^3\n\nx(t+dt) = x(t) + vx*dt\ny(t+dt) = y(t) + vy*dt\nvx(t+dt) = vx(t) + ax*dt\nvy(t+dt) = vy(t) + ay*dt`,
    ic:{x:1,y:0,vx:0,vy:0.7}, dt:0.005, tmax:30,
    objects:[
      {type:'circle',x:'0',y:'0',r:'0.08',color:'#fbbf24',fillColor:'rgba(251,191,36,.25)'},
      {type:'particle',x:'x',y:'y',color:'#4f9eff',showTrail:true,trailLen:600,showVec:false,radius:6},
    ],
    g0:{xvar:'x',yvar:'y'}, g1:{xvar:'t',yvar:'x',yvar2:'y'}, scale:140, ox:.5, oy:.5
  },
  lotka:{
    model:`// Lotka-Volterra (Predador-Presa)\na = 1.0\nb = 0.1\nc = 0.075\nd = 1.5\n\nx(t+dt) = x(t) + (a*x - b*x*y)*dt\ny(t+dt) = y(t) + (c*x*y - d*y)*dt`,
    ic:{x:10,y:5}, dt:0.005, tmax:40,
    objects:[
      {type:'particle',x:'x',y:'y',color:'#34d399',showTrail:true,trailLen:800,radius:6,label:''},
    ],
    g0:{xvar:'t',yvar:'x',yvar2:'y'}, g1:{xvar:'x',yvar:'y'}, scale:12, ox:.1, oy:.9
  },
  lorenz:{
    model:`// Atrator de Lorenz (projeção XZ)\nsigma = 10\nrho = 28\nbeta = 2.667\n\nx(t+dt) = x(t) + sigma*(y - x)*dt\ny(t+dt) = y(t) + (x*(rho - z) - y)*dt\nz(t+dt) = z(t) + (x*y - beta*z)*dt`,
    ic:{x:0.1,y:0,z:0}, dt:0.002, tmax:50,
    objects:[
      {type:'particle',x:'x',y:'z',color:'#a78bfa',showTrail:true,trailLen:2000,radius:3,showVec:false},
    ],
    g0:{xvar:'x',yvar:'z'}, g1:{xvar:'t',yvar:'x'}, scale:8, ox:.5, oy:.5
  },
  pendulo_duplo:{
    model:`// Pêndulo Duplo (caótico)\ng = 9.8\nL1 = 1.2\nL2 = 1.2\nm1 = 1.0\nm2 = 1.0\n\n// Posição do primeiro bob (pivô do segundo)\nx1 = sin(theta1)*L1\ny1 = -cos(theta1)*L1\n\n// Posição do segundo bob\nx2 = x1 + sin(theta2)*L2\ny2 = y1 - cos(theta2)*L2\n\n// Ângulos e velocidades angulares\ntheta1(t+dt) = theta1(t) + omega1*dt\ntheta2(t+dt) = theta2(t) + omega2*dt\n\n// Equações de Lagrange (corretas)\ndel = theta2 - theta1\nD1 = L1*(2*m1+m2-m2*cos(2*del))\nD2 = L2*(2*m1+m2-m2*cos(2*del))\n\nalpha1 = (-g*(2*m1+m2)*sin(theta1) - m2*g*sin(theta1-2*theta2) - 2*sin(del)*m2*(omega2^2*L2+omega1^2*L1*cos(del))) / D1\nalpha2 = (2*sin(del)*(omega1^2*L1*(m1+m2)+g*(m1+m2)*cos(theta1)+omega2^2*L2*m2*cos(del))) / D2\n\nomega1(t+dt) = omega1(t) + alpha1*dt\nomega2(t+dt) = omega2(t) + alpha2*dt`,
    ic:{theta1:2.5,theta2:1.5,omega1:0,omega2:0}, dt:0.004, tmax:40,
    objects:[
      {type:'pendulum',theta:'theta1',L:1.2,pivotX:0,pivotY:0,color:'#f97316',showTrail:false,radius:9},
      {type:'pendulum',theta:'theta2',L:1.2,pivotX:'x1',pivotY:'y1',color:'#fb7185',showTrail:true,trailLen:1500,radius:9},
    ],
    g0:{xvar:'t',yvar:'theta1',yvar2:'theta2'}, g1:{xvar:'theta1',yvar:'omega1'}, scale:90, ox:.5, oy:.28
  },
  mola2d:{
    model:`// Mola 2D — Movimento elíptico\nkx = 4.0\nky = 9.0\nm = 1.0\n\nx(t+dt) = x(t) + vx*dt\ny(t+dt) = y(t) + vy*dt\nvx(t+dt) = vx(t) + (-kx/m * x)*dt\nvy(t+dt) = vy(t) + (-ky/m * y)*dt`,
    ic:{x:2,y:0,vx:0,vy:3}, dt:0.01, tmax:15,
    objects:[
      {type:'particle',x:'x',y:'y',color:'#06b6d4',showTrail:true,trailLen:1000,radius:7,showVec:true,vx:'vx',vy:'vy',vecScale:0.2,vecColor:'#fbbf24'},
    ],
    g0:{xvar:'x',yvar:'y'}, g1:{xvar:'t',yvar:'x',yvar2:'y'}, scale:50, ox:.5, oy:.5
  },
  orbita3:{
    model:`// Problema de 3 Corpos (restrito)\nG = 1.0\nm1 = 1.0\nm2 = 1.0\n\n// Corpos primários em órbita circular\nomega = 1.0\nx1 = cos(omega*t)\ny1 = sin(omega*t)\nx2 = -cos(omega*t)\ny2 = -sin(omega*t)\n\n// distâncias com proteção\nr1 = sqrt((x-x1)^2 + (y-y1)^2 + 0.01)\nr2 = sqrt((x-x2)^2 + (y-y2)^2 + 0.01)\n\nax = -G*m1*(x-x1)/r1^3 - G*m2*(x-x2)/r2^3\nay = -G*m1*(y-y1)/r1^3 - G*m2*(y-y2)/r2^3\n\nx(t+dt) = x(t) + vx*dt\ny(t+dt) = y(t) + vy*dt\nvx(t+dt) = vx(t) + ax*dt\nvy(t+dt) = vy(t) + ay*dt`,
    ic:{x:0.5,y:0.0,vx:0.0,vy:1.2}, dt:0.001, tmax:30,
    objects:[
      {type:'particle',x:'x',y:'y',color:'#06b6d4',showTrail:true,trailLen:3000,radius:4,showVec:false},
      {type:'circle',x:'x1',y:'y1',r:'0.08',color:'#fbbf24',fillColor:'rgba(251,191,36,.4)'},
      {type:'circle',x:'x2',y:'y2',r:'0.08',color:'#fb7185',fillColor:'rgba(251,113,133,.4)'},
    ],
    g0:{xvar:'x',yvar:'y'}, g1:{xvar:'t',yvar:'x',yvar2:'y'}, scale:100, ox:.5, oy:.5
  },
  rc:{
    model:`// Circuito RC — Carga e Descarga\n// R = resistência (Ω), C = capacitância (F)\n// Vs = tensão da fonte (V)\nR = 1000\nC = 0.001\nVs = 5.0\ntau = R*C\n\n// Tensão no capacitor\nvc(t+dt) = vc(t) + ((Vs - vc)/(R*C))*dt\n\n// Corrente no circuito\ni = (Vs - vc)/R\n\n// Tensão no resistor\nvr = Vs - vc\n\n// Energia armazenada (J)\ne_cap = 0.5*C*vc^2`,
    ic:{vc:0}, dt:0.00005, tmax:0.008,
    objects:[
      {type:'label',x:-5,y:5.5,text:'Circuito RC',fontSize:16,color:'#94a3b8'},
      {type:'label',x:-5,y:4.2,text:'Vc = {vc:3} V  (capacitor)',fontSize:14,color:'#4f9eff'},
      {type:'label',x:-5,y:3.0,text:'Vr = {vr:3} V  (resistor)',fontSize:14,color:'#a78bfa'},
      {type:'label',x:-5,y:1.8,text:'i  = {i:6} A',fontSize:14,color:'#34d399'},
      {type:'label',x:-5,y:0.6,text:'E  = {e_cap:6} J',fontSize:14,color:'#fbbf24'},
      {type:'label',x:-5,y:-1.0,text:'τ = R·C = {tau:4} s',fontSize:13,color:'#fb7185'},
    ],
    g0:{xvar:'t',yvar:'vc'}, g1:{xvar:'t',yvar:'i'}, scale:30, ox:.08, oy:.25
  },
  onda:{
    model:`// Oscilador Forçado com Ressonância\nm = 1.0\nb = 0.2\nk = 4.0\nF0 = 2.0\nomega_f = 2.0\n\n// Força natural\nomega0 = sqrt(k/m)\n\nx(t+dt) = x(t) + v*dt\nv(t+dt) = v(t) + (-b/m*v - k/m*x + F0/m*cos(omega_f*t))*dt`,
    ic:{x:0,v:0}, dt:0.01, tmax:60,
    objects:[
      {type:'spring',x:'0',y:'x',x1:0,y1:5,pivotX:0,pivotY:5,coils:12,vertical:true,color:'#4f9eff'},
    ],
    g0:{xvar:'t',yvar:'x'}, g1:{xvar:'x',yvar:'v'}, scale:50, ox:.5, oy:.15
  },
  vanderpol:{
    model:`// Oscilador de Van der Pol\n// mu controla não-linearidade e amortecimento\nmu = 2.0\n\nx(t+dt) = x(t) + v*dt\nv(t+dt) = v(t) + (mu*(1-x^2)*v - x)*dt`,
    ic:{x:0.5,v:0}, dt:0.005, tmax:40,
    objects:[
      {type:'particle',x:'x',y:'v',color:'#06b6d4',showTrail:true,trailLen:2000,radius:6,showVec:false},
    ],
    g0:{xvar:'t',yvar:'x'}, g1:{xvar:'x',yvar:'v'}, scale:50, ox:.5, oy:.5
  },
  solar:{
    model:`// Sistema Solar (simplificado — elipses Keplerianas)\n// Unidades: UA, anos, G·M_sol = 4π²\nGM = 39.478\n\n// Mercúrio\nrm = sqrt(xm^2 + ym^2)\naxm = -GM*xm/rm^3\naym = -GM*ym/rm^3\nxm(t+dt) = xm(t) + vxm*dt\nym(t+dt) = ym(t) + vym*dt\nvxm(t+dt) = vxm(t) + axm*dt\nvym(t+dt) = vym(t) + aym*dt\n\n// Vênus\nrv = sqrt(xv^2 + yv^2)\naxv = -GM*xv/rv^3\nayv = -GM*yv/rv^3\nxv(t+dt) = xv(t) + vxv*dt\nyv(t+dt) = yv(t) + vyv*dt\nvxv(t+dt) = vxv(t) + axv*dt\nvyv(t+dt) = vyv(t) + ayv*dt\n\n// Terra\nrt = sqrt(xt^2 + yt^2)\naxt = -GM*xt/rt^3\nayt = -GM*yt/rt^3\nxt(t+dt) = xt(t) + vxt*dt\nyt(t+dt) = yt(t) + vyt*dt\nvxt(t+dt) = vxt(t) + axt*dt\nvyt(t+dt) = vyt(t) + ayt*dt\n\n// Marte\nrma = sqrt(xma^2 + yma^2)\naxma = -GM*xma/rma^3\nayma = -GM*yma/rma^3\nxma(t+dt) = xma(t) + vxma*dt\nyma(t+dt) = yma(t) + vyma*dt\nvxma(t+dt) = vxma(t) + axma*dt\nvyma(t+dt) = vyma(t) + ayma*dt`,
    ic:{xm:0.387,ym:0,vxm:0,vym:10.06, xv:0.723,yv:0,vxv:0,vyv:7.38, xt:1,yt:0,vxt:0,vyt:6.283, xma:1.524,yma:0,vxma:0,vyma:5.09},
    dt:0.0005, tmax:3,
    objects:[
      {type:'circle',x:'0',y:'0',r:'0.12',color:'#ffd700',fillColor:'rgba(255,215,0,.35)'},
      {type:'particle',x:'xm',y:'ym',color:'#b0c0d0',showTrail:true,trailLen:800,radius:4,label:'Mercúrio'},
      {type:'particle',x:'xv',y:'yv',color:'#e8cda0',showTrail:true,trailLen:800,radius:5,label:'Vênus'},
      {type:'particle',x:'xt',y:'yt',color:'#4f9eff',showTrail:true,trailLen:600,radius:5,label:'Terra'},
      {type:'particle',x:'xma',y:'yma',color:'#f97316',showTrail:true,trailLen:600,radius:5,label:'Marte'},
    ],
    g0:{xvar:'xt',yvar:'yt'}, g1:{xvar:'t',yvar:'rt'}, scale:100, ox:.5, oy:.5
  },
  cargas:{
    model:`// Cargas Elétricas — 2 cargas fixas, 1 de prova\n// Constante k (u.a.)\nk = 1.0\n\n// Cargas fixas: q1=+1 em (-2,0), q2=-1 em (2,0)\nx1c = -2\ny1c = 0\nx2c = 2\ny2c = 0\n\n// Distâncias com proteção\nr1 = sqrt((x-x1c)^2 + (y-y1c)^2 + 0.02)\nr2 = sqrt((x-x2c)^2 + (y-y2c)^2 + 0.02)\n\n// Forças (q_prova = +1)\nfx = k*(x-x1c)/r1^3 - k*(x-x2c)/r2^3\nfy = k*(y-y1c)/r1^3 - k*(y-y2c)/r2^3\n\n// Dinâmica da carga de prova\nm = 0.5\nx(t+dt) = x(t) + vx*dt\ny(t+dt) = y(t) + vy*dt\nvx(t+dt) = vx(t) + (fx/m)*dt\nvy(t+dt) = vy(t) + (fy/m)*dt`,
    ic:{x:0,y:2.5,vx:0.8,vy:0}, dt:0.002, tmax:15,
    objects:[
      {type:'vectorfield',fxExpr:'(x+2)/((x+2)^2+y^2+0.02)^1.5 - (x-2)/((x-2)^2+y^2+0.02)^1.5',fyExpr:'y/((x+2)^2+y^2+0.02)^1.5 - y/((x-2)^2+y^2+0.02)^1.5',gridN:16,gridRange:5,arrowScale:0.35,color:'#4f9eff'},
      {type:'circle',x:'-2',y:'0',r:'0.18',color:'#fb7185',fillColor:'rgba(251,113,133,.4)'},
      {type:'circle',x:'2',y:'0',r:'0.18',color:'#4f9eff',fillColor:'rgba(79,158,255,.4)'},
      {type:'particle',x:'x',y:'y',color:'#34d399',showTrail:true,trailLen:1200,radius:6,showVec:true,vx:'vx',vy:'vy',vecScale:0.15,vecColor:'#fbbf24'},
      {type:'label',x:-4.5,y:4.8,text:'⊕ carga +  ⊖ carga −',fontSize:12,color:'#94a3b8'},
    ],
    g0:{xvar:'x',yvar:'y'}, g1:{xvar:'t',yvar:'r1'}, scale:60, ox:.5, oy:.5
  },
  campo_eletrico:{
    model:`// Campo Vetorial Puro\n// O campo vetorial é exibido pelo objeto Campo\n// abaixo: sem equações de estado (apenas visualização)\nomega = 1.0\nphi = omega*t`,
    ic:{omega:1}, dt:0.1, tmax:100,
    objects:[
      {type:'vectorfield',fxExpr:'Math.sin(y)*Math.cos(x*0.5)',fyExpr:'Math.cos(x)*Math.sin(y*0.5)',gridN:18,gridRange:6,arrowScale:0.45,color:'#a78bfa'},
      {type:'label',x:-5.5,y:5.5,text:'Campo: F = (sin y·cos x/2, cos x·sin y/2)',fontSize:11,color:'#94a3b8'},
    ],
    g0:{xvar:'t',yvar:'t'}, g1:{xvar:'t',yvar:'t'}, scale:50, ox:.5, oy:.5
  },
  queda_lua:{
    model:`// Queda Livre: Terra vs Lua\ng_terra = 9.8\ng_lua = 1.62\n\n// Terra\nyt(t+dt) = yt(t) + vyt*dt\nvyt(t+dt) = vyt(t) - g_terra*dt\n\n// Lua\nyl(t+dt) = yl(t) + vyl*dt\nvyl(t+dt) = vyl(t) - g_lua*dt`,
    ic:{yt:20,vyt:0,yl:20,vyl:0}, dt:0.01, tmax:5,
    objects:[
      {type:'particle',x:'-1',y:'yt',color:'#4f9eff',showTrail:true,trailLen:300,radius:9,showVec:false,label:'Terra'},
      {type:'particle',x:'1',y:'yl',color:'#fbbf24',showTrail:true,trailLen:300,radius:9,showVec:false,label:'Lua'},
    ],
    g0:{xvar:'t',yvar:'yt',yvar2:'yl'}, g1:{xvar:'t',yvar:'vyt',yvar2:'vyl'}, scale:12, ox:.5, oy:.1
  },
  amortecido:{
    model:`// Oscilador Harmônico Amortecido\n// Varie b: b<2 sub, b=2 crítico, b>2 super\nm = 1.0\nk = 4.0\nb = 0.5\nomega0 = sqrt(k/m)\nzeta = b/(2*sqrt(m*k))\n\nx(t+dt) = x(t) + v*dt\nv(t+dt) = v(t) + (-b/m*v - k/m*x)*dt\n\nEk = 0.5*m*v^2\nEp = 0.5*k*x^2\nE = Ek + Ep`,
    ic:{x:3,v:0}, dt:0.01, tmax:20,
    objects:[
      {type:'spring',x:'0',y:'x',x1:0,y1:5,pivotX:0,pivotY:5,coils:10,vertical:true,color:'#a78bfa'},
      {type:'label',x:-4,y:4.5,text:'ζ={zeta:3}  ω₀={omega0:2} rad/s',fontSize:13,color:'#94a3b8'},
      {type:'label',x:-4,y:3.2,text:'E = {E:3} J',fontSize:13,color:'#fbbf24'},
    ],
    g0:{xvar:'t',yvar:'x',yvar2:'v'}, g1:{xvar:'x',yvar:'v'}, scale:50, ox:.5, oy:.15
  },

  // ── ONDAS ───────────────────────────────────────────
  batimento:{
    model:`// Batimento de Ondas\n// Duas ondas de freq. próximas → envelope pulsante\nomega1 = 6.28\nomega2 = 6.91\nA1 = 1.0\nA2 = 1.0\n\n// Fase de cada oscilador\nphi1(t+dt) = phi1(t) + omega1*dt\nphi2(t+dt) = phi2(t) + omega2*dt\n\n// Amplitudes\ny1 = A1*sin(phi1)\ny2 = A2*sin(phi2)\n\n// Superposição\ny = y1 + y2\n\n// Frequência de batimento\nf_bat = (omega2 - omega1)/(2*3.14159)\nomega_bat = omega2 - omega1`,
    ic:{phi1:0, phi2:0}, dt:0.005, tmax:20,
    objects:[
      {type:'label',x:-6,y:6,text:'Batimento de Ondas',fontSize:15,color:'#e2e8f0'},
      {type:'label',x:-6,y:4.8,text:'ω₁ = {omega1:2} rad/s',fontSize:12,color:'#4f9eff'},
      {type:'label',x:-6,y:3.7,text:'ω₂ = {omega2:2} rad/s',fontSize:12,color:'#a78bfa'},
      {type:'label',x:-6,y:2.5,text:'Δω (bat.) = {omega_bat:3} rad/s',fontSize:12,color:'#fbbf24'},
      {type:'label',x:-6,y:1.4,text:'y₁ = {y1:3}',fontSize:12,color:'#4f9eff'},
      {type:'label',x:-6,y:0.3,text:'y₂ = {y2:3}',fontSize:12,color:'#a78bfa'},
      {type:'label',x:-6,y:-0.8,text:'y = y₁+y₂ = {y:3}',fontSize:13,color:'#34d399'},
      {type:'particle',x:'t',y:'y',color:'#34d399',showTrail:true,trailMode:'persist',trailLen:5000,radius:3,showVec:false,label:''},
      {type:'particle',x:'t',y:'y1',color:'#4f9eff',showTrail:true,trailMode:'fade',trailLen:300,radius:2,showVec:false,label:''},
    ],
    g0:{xvar:'t',yvar:'y',yvar2:'y1'}, g1:{xvar:'t',yvar:'y2'}, scale:40, ox:.03, oy:.5
  },
};

function loadEx(name) {
  closeMenus();
  const ex=EXAMPLES[name]; if(!ex) return;
  simReset();
  setEditorText(ex.model.trim());
  document.getElementById('inp-dt').value=ex.dt;
  document.getElementById('inp-tmax').value=ex.tmax;
  sim.dt=ex.dt; sim.tMax=ex.tmax; sim.method='rk4';
  document.getElementById('sel-method').value='rk4';
  applyModel(true);
  const ic={...ex.ic,...(sim.parsed?sim.parsed.constVars:{})};
  sim.setIC(ic);
  rebuildICPanel();
  // Configure objects
  anim.objects=ex.objects.map((o,i)=>makeObj(o.type,o));
  anim.clearTrails();
  // View
  anim.scale=ex.scale||30;
  anim.ox=(anim._w||500)*(ex.ox||.5);
  anim.oy=(anim._h||400)*(ex.oy||.5);
  // Graphs
  graphs[0].xvar=ex.g0.xvar||'t'; graphs[0].yvar=ex.g0.yvar||''; graphs[0].yvar2=ex.g0.yvar2||'';
  graphs[1].xvar=ex.g1.xvar||'t'; graphs[1].yvar=ex.g1.yvar||''; graphs[1].yvar2=ex.g1.yvar2||'';
  graphs.forEach(g=>g.clear());
  selTab(0);
  rebuildGraphSelects(); rebuildVarList(); renderObjList();
  clearErr();
  toast('✓ '+ex.model.split('\n')[0].replace('//','').trim());
}

// ══════════════════════════════════════════════════════
// 13. FILE I/O
// ══════════════════════════════════════════════════════
function saveFile() {
  closeMenus();
  const ic=getICValues();
  const icX=Object.entries(ic).map(([k,v])=>`    <variable name="${k}" value="${v}"/>`).join('\n');
  const objX=anim.objects.map(o=>{
    const imgData=o.imageData||'';
    const props=Object.entries(o).filter(([k])=>!k.startsWith('_')&&k!=='id'&&k!=='imageData').map(([k,v])=>`      <prop k="${k}" v="${String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;')}"/>`).join('\n');
    const imgEl=imgData?`\n      <imageData><![CDATA[${imgData}]]></imageData>`:'';
    return `    <object type="${o.type}" id="${o.id}">\n${props}${imgEl}\n    </object>`;
  }).join('\n');
  const gX=graphs.map((g,i)=>`    <graph id="${i}" xvar="${g.xvar}" yvar="${g.yvar}" yvar2="${g.yvar2||''}"/>`).join('\n');
  const layoutStr=JSON.stringify(mdiGetLayout()).replace(/]]>/g,']]&gt;');
  const themeStr=document.documentElement.classList.contains('light')?'light':'dark';
  const precStr=`<precision format="${_precFormat}" decimals="${_precDecimals}"/>`;
  const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<modellus-web version="2.1">\n  <model>\n    <equations><![CDATA[\n${getEditorText()}\n    ]]></equations>\n    <method>${sim.method}</method>\n    <dt>${sim.dt}</dt>\n    <tmax>${sim.tMax}</tmax>\n  </model>\n  <initial-conditions>\n${icX}\n  </initial-conditions>\n  <objects>\n${objX}\n  </objects>\n  <graphs>\n${gX}\n  </graphs>\n  <ui><layout><![CDATA[${layoutStr}]]></layout><theme>${themeStr}</theme>${precStr}</ui>\n</modellus-web>`;
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([xml],{type:'text/xml'}));
  a.download='simulacao.modx'; a.click(); toast('✓ Arquivo salvo');
}

function openFile() { closeMenus(); document.getElementById('file-input').click(); }

function onFileLoad(e) {
  const f=e.target.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=ev=>{
    try {
      const doc=new DOMParser().parseFromString(ev.target.result,'text/xml');
      const eqs=doc.querySelector('equations');
      if(!eqs) { toast('❌ Arquivo inválido'); return; }
      setEditorText(eqs.textContent.trim());
      const methodEl=doc.querySelector('method'); if(methodEl){sim.method=methodEl.textContent;document.getElementById('sel-method').value=sim.method;}
      const dtEl=doc.querySelector('dt'); if(dtEl){sim.dt=parseFloat(dtEl.textContent)||0.01;document.getElementById('inp-dt').value=sim.dt;}
      const tmEl=doc.querySelector('tmax'); if(tmEl){sim.tMax=parseFloat(tmEl.textContent)||10;document.getElementById('inp-tmax').value=sim.tMax;}
      applyModel(true);
      const ic={};
      doc.querySelectorAll('initial-conditions variable').forEach(el=>{ic[el.getAttribute('name')]=parseFloat(el.getAttribute('value'))||0;});
      if(sim.parsed) Object.entries(sim.parsed.constVars).forEach(([k,v])=>{ic[k]=v;});
      sim.setIC(ic); rebuildICPanel();
      // Load objects
      anim.objects=[];
      doc.querySelectorAll('objects object').forEach(oel=>{
        const props={};
        oel.querySelectorAll('prop').forEach(p=>{
          const k=p.getAttribute('k'),v=p.getAttribute('v');
          const n=parseFloat(v); props[k]=isNaN(n)?v:n;
        });
        // Restore boolean props that get converted to string via attribute
        ['showVec','showVecProj','showTrail','useImage','visible'].forEach(bp=>{
          if(props[bp]!==undefined) props[bp]=(props[bp]==='true'||props[bp]===true);
        });
        // Restore imageData from CDATA child
        const imgEl=oel.querySelector('imageData');
        if(imgEl) props.imageData=imgEl.textContent.trim();
        const o=makeObj(oel.getAttribute('type'),props);
        anim.objects.push(o);
      });
      // Load graphs
      doc.querySelectorAll('graph').forEach(gel=>{
        const i=parseInt(gel.getAttribute('id'));
        if(graphs[i]){graphs[i].xvar=gel.getAttribute('xvar')||'t';graphs[i].yvar=gel.getAttribute('yvar')||'';graphs[i].yvar2=gel.getAttribute('yvar2')||'';}
      });
      rebuildVarList(); rebuildGraphSelects(); renderObjList();
      // Restore MDI layout
      const layoutEl=doc.querySelector('ui layout');
      if(layoutEl){try{mdiApplyLayout(JSON.parse(layoutEl.textContent.trim()));}catch(e){}}
      // Restore theme
      const themeEl=doc.querySelector('ui theme');
      if(themeEl){
        const t=themeEl.textContent.trim();
        const root=document.documentElement;
        const btn=document.getElementById('theme-btn');
        if(t==='light'){root.classList.add('light');if(btn)btn.textContent='🌣';}
        else{root.classList.remove('light');if(btn)btn.textContent='☾';}
        localStorage.setItem('boscolab-theme',t);
      }
      // Restore precision
      const precEl=doc.querySelector('ui precision');
      if(precEl){
        const f=precEl.getAttribute('format'); const d=parseInt(precEl.getAttribute('decimals'));
        if(f) _precFormat=f; if(!isNaN(d)) _precDecimals=d;
      }
      toast('✓ Arquivo carregado');
    } catch(err) { toast('❌ Erro: '+err.message); }
  };
  r.readAsText(f); e.target.value='';
}

function exportCSV() {
  closeMenus();
  if(sim.history.length<2){toast('Execute a simulação primeiro');return;}
  const vars=['t',...Object.keys(sim.parsed?.variables||{})];
  const csv=[vars.join(','),...sim.history.map(s=>vars.map(v=>s[v]??'').join(','))].join('\n');
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
  a.download='dados.csv'; a.click(); toast(`✓ CSV: ${sim.history.length} pontos`);
}

function exportPNG() {
  closeMenus();
  const a=document.createElement('a'); a.download='animacao.png';
  a.href=document.getElementById('anim-canvas').toDataURL(); a.click();
  toast('✓ PNG exportado');
}

// ══════════════════════════════════════════════════════
// 14. UI HELPERS
// ══════════════════════════════════════════════════════
function toggleMenu(el) {
  const wasOpen=el.classList.contains('open');
  closeMenus();
  if(!wasOpen) el.classList.add('open');
}
function closeMenus() { document.querySelectorAll('.mitem').forEach(m=>m.classList.remove('open')); }

// Sub-menu positioning via JS (fixed positioning needs explicit coords)
;
function closeModal(id) { document.getElementById(id).classList.remove('show'); }

function toggleGrid() { anim.showGrid=!anim.showGrid; }
function toggleAxes() { anim.showAxes=!anim.showAxes; }
function clearTrails() { anim.clearTrails(); }
function resetView() { anim.ox=anim._w/2; anim.oy=anim._h/2; anim.scale=30; }
function newProject() {
  closeMenus();
  blabConfirm({
    icon: '',
    title: 'Novo Projeto',
    message: '<p>Deseja criar um novo projeto?</p><p style="color:var(--acc5);font-size:12px">⚠️ Dados não salvos serão perdidos.</p>',
    okLabel: 'Criar Novo',
    okClass: 'danger',
    onOk: () => {
      simReset(); setEditorText('');
      anim.objects=[]; selectedObj=null; renderObjList(); renderObjProps(null);
      graphs.forEach(g=>g.clear());
      document.getElementById('varlist').innerHTML='';
      sim.parsed=null; document.getElementById('parse-status').textContent='Pronto';
      toast('✓ Novo projeto');
    }
  });
}

function setGlobalTrailMode(mode) {
  anim.objects.forEach(o => {
    if (o.type==='particle'||o.type==='pendulum') {
      o.trailMode = mode;
      o._trail = [];
    }
  });
}

function setupRH(id, panelId, side) {
  const h=document.getElementById(id), p=document.getElementById(panelId);
  let drag=false, sx=0, sw=0;
  h.addEventListener('mousedown',e=>{drag=true;sx=e.clientX;sw=p.offsetWidth;h.classList.add('drag');e.preventDefault();});
  window.addEventListener('mousemove',e=>{
    if(!drag) return;
    const dx=e.clientX-sx, nw=side==='right'?sw+dx:sw-dx;
    p.style.width=Math.max(160,Math.min(800,nw))+'px';
    p.style.minWidth=p.style.width; anim.resize();
  });
  window.addEventListener('mouseup',()=>{if(drag){drag=false;h.classList.remove('drag');}});
}

function setErr(m) { document.getElementById('errmsg').textContent=m; }
function clearErr() { document.getElementById('errmsg').textContent=''; }
function toast(m) {
  const el=document.getElementById('toast');
  el.textContent=m; el.classList.add('show');
  clearTimeout(toast._t); toast._t=setTimeout(()=>el.classList.remove('show'),2800);
}

function showHelp() {
  closeMenus();
  document.getElementById('help-modal-overlay').classList.add('show');
}
function showAbout() {
  closeMenus();
  document.getElementById('about-modal-overlay').classList.add('show');
}

// ══════════════════════════════════════════════════════
// CUSTOM DIALOG SYSTEM
// ══════════════════════════════════════════════════════
let _blabCallback = null;
function blabConfirm({icon='⚠️', title='Confirmar', message='', okLabel='OK', cancelLabel='Cancelar', okClass='ok', onOk=null, onCancel=null}={}) {
  document.getElementById('blab-dlg-icon').textContent = icon;
  document.getElementById('blab-dlg-title').textContent = title;
  document.getElementById('blab-dlg-body').innerHTML = message;
  const footer = document.getElementById('blab-dlg-footer');
  footer.innerHTML = '';
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'dlg-btn cancel';
  cancelBtn.textContent = cancelLabel;
  cancelBtn.onclick = () => {
    document.getElementById('blab-dlg-overlay').classList.remove('show');
    if (onCancel) onCancel();
  };
  const okBtn = document.createElement('button');
  okBtn.className = `dlg-btn ${okClass}`;
  okBtn.textContent = okLabel;
  okBtn.onclick = () => {
    document.getElementById('blab-dlg-overlay').classList.remove('show');
    if (onOk) onOk();
  };
  footer.appendChild(cancelBtn);
  footer.appendChild(okBtn);
  document.getElementById('blab-dlg-overlay').classList.add('show');
  setTimeout(() => okBtn.focus(), 80);
}
function blabAlert({icon='ℹ️', title='Aviso', message='', okLabel='OK'}={}) {
  document.getElementById('blab-dlg-icon').textContent = icon;
  document.getElementById('blab-dlg-title').textContent = title;
  document.getElementById('blab-dlg-body').innerHTML = message;
  const footer = document.getElementById('blab-dlg-footer');
  footer.innerHTML = '';
  const okBtn = document.createElement('button');
  okBtn.className = 'dlg-btn ok';
  okBtn.textContent = okLabel;
  okBtn.onclick = () => document.getElementById('blab-dlg-overlay').classList.remove('show');
  footer.appendChild(okBtn);
  document.getElementById('blab-dlg-overlay').classList.add('show');
  setTimeout(() => okBtn.focus(), 80);
}
// Close dialog on overlay click
;

// ══════════════════════════════════════════════════════
// PRECISION / DISPLAY FORMAT SYSTEM
// ══════════════════════════════════════════════════════
let _precFormat = 'fixed';
let _precDecimals = 3;

function formatVal(v) {
  if (!isFinite(v)) return String(v);
  const d = _precDecimals;
  if (_precFormat === 'sci') return v.toExponential(d);
  if (_precFormat === 'fixed') return v.toFixed(d);
  if (_precFormat === 'eng') {
    if (v === 0) return '0.' + '0'.repeat(d);
    const exp = Math.floor(Math.log10(Math.abs(v)) / 3) * 3;
    const mantissa = v / Math.pow(10, exp);
    return mantissa.toFixed(d) + (exp !== 0 ? `×10^${exp}` : '');
  }
  // auto
  const abs = Math.abs(v);
  if (abs === 0) return '0';
  if (abs >= 0.001 && abs < 1e6) return v.toFixed(d);
  return v.toExponential(d);
}

function showPrecisionModal() {
  closeMenus();
  document.getElementById('prec-format').value = _precFormat;
  document.getElementById('prec-decimals').value = String(_precDecimals);
  updatePrecPreview();
  document.getElementById('precision-modal-overlay').classList.add('show');
}

function updatePrecPreview() {
  const fmt = document.getElementById('prec-format').value;
  const dec = parseInt(document.getElementById('prec-decimals').value);
  const samples = [3.14159265358979, -0.00123456789, 1234567.89, 0.000012345678];
  const box = document.getElementById('prec-preview-box');
  const old_f = _precFormat, old_d = _precDecimals;
  _precFormat = fmt; _precDecimals = dec;
  box.innerHTML = samples.map(v => formatVal(v)).join('<br>');
  _precFormat = old_f; _precDecimals = old_d;
}

function applyPrecision() {
  _precFormat = document.getElementById('prec-format').value;
  _precDecimals = parseInt(document.getElementById('prec-decimals').value);
  document.getElementById('precision-modal-overlay').classList.remove('show');
  toast('✓ Precisão aplicada');
}

// ══════════════════════════════════════════════════════
// GRAPH PNG HD EXPORT (fundo branco sempre)
// ══════════════════════════════════════════════════════
function exportGraphPNG(idx) {
  closeMenus();
  const g = graphs[idx];
  if (!g) { toast('Gráfico não encontrado'); return; }
  if (!g.yvar) { toast('Selecione uma variável Y no gráfico primeiro'); return; }
  if (g.data.length < 2) { toast('Execute a simulação primeiro (ou mude a variável Y)'); return; }
  const SCALE = 3; // 3x resolution = HD
  const W = 900, H = 540;
  const offCanvas = document.createElement('canvas');
  offCanvas.width = W * SCALE; offCanvas.height = H * SCALE;
  const ctx = offCanvas.getContext('2d');
  ctx.scale(SCALE, SCALE);

  // White background always
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  const pad = {t:40, r:24, b:54, l:72};
  const pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;

  // Plot area bg
  ctx.fillStyle = '#f8faff';
  ctx.fillRect(pad.l, pad.t, pw, ph);

  // Border
  ctx.strokeStyle = '#c8d3e6'; ctx.lineWidth = 1;
  ctx.strokeRect(pad.l, pad.t, pw, ph);

  let {xmin, xmax, ymin, ymax} = g;
  if (!isFinite(xmin)) { toast('Sem dados'); return; }
  if (xmin===xmax){xmin-=1;xmax+=1;} if(ymin===ymax){ymin-=1;ymax+=1;}
  const xr=xmax-xmin, yr=ymax-ymin;
  const xp=xr*.02, yp=yr*.08;
  const tX=x=>pad.l+((x-(xmin-xp))/((xr+2*xp)))*pw;
  const tY=y=>pad.t+ph-((y-(ymin-yp))/((yr+2*yp)))*ph;

  // Grid
  ctx.strokeStyle = '#dde4ef'; ctx.lineWidth = 0.7;
  for (let i=0;i<=5;i++) {
    const gx=pad.l+(i/5)*pw; ctx.beginPath();ctx.moveTo(gx,pad.t);ctx.lineTo(gx,pad.t+ph);ctx.stroke();
    const gy=pad.t+(i/5)*ph; ctx.beginPath();ctx.moveTo(pad.l,gy);ctx.lineTo(pad.l+pw,gy);ctx.stroke();
  }

  // Curves
  const drawC = (data, color, lw) => {
    if (data.length < 2) return;
    ctx.beginPath(); ctx.moveTo(tX(data[0][0]),tY(data[0][1]));
    for (let i=1;i<data.length;i++) ctx.lineTo(tX(data[i][0]),tY(data[i][1]));
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineJoin='round'; ctx.stroke();
  };
  drawC(g.data, g.colors[0], 2.5);
  if (g.data2.length > 1) drawC(g.data2, g.colors[1], 2);

  // Current point dot
  if (g.data.length) {
    const [lx,ly] = g.data[g.data.length-1];
    ctx.beginPath(); ctx.arc(tX(lx),tY(ly),5,0,Math.PI*2);
    ctx.fillStyle=g.colors[0]; ctx.fill();
  }

  // Axis labels (dark for white bg)
  ctx.fillStyle='#475569'; ctx.font='bold 12px JetBrains Mono,monospace';
  ctx.textAlign='center';
  for (let i=0;i<=5;i++) {
    const v=(xmin-xp)+((xr+2*xp)*i/5);
    ctx.fillText(formatVal(v),pad.l+(i/5)*pw,pad.t+ph+18);
  }
  ctx.textAlign='right';
  for (let i=0;i<=5;i++) {
    const v=(ymin-yp)+((yr+2*yp)*i/5);
    ctx.fillText(formatVal(v),pad.l-6,pad.t+ph-(i/5)*ph+4);
  }

  // Axis name labels
  ctx.fillStyle='#334155'; ctx.font='bold 13px DM Sans,sans-serif';
  ctx.textAlign='center';
  ctx.fillText(g.xvar, pad.l+pw/2, H-8);
  ctx.save(); ctx.translate(14, pad.t+ph/2); ctx.rotate(-Math.PI/2);
  if (g.yvar2) {
    ctx.fillStyle=g.colors[0]; ctx.textAlign='right'; ctx.fillText(g.yvar, -4, 0);
    ctx.fillStyle='#94a3b8'; ctx.fillText(' ·', 0, 0);
    ctx.fillStyle=g.colors[1]; ctx.textAlign='left'; ctx.fillText(' '+g.yvar2, 4, 0);
  } else {
    ctx.fillStyle=g.colors[0]; ctx.textAlign='center'; ctx.fillText(g.yvar, 0, 0);
  }
  ctx.restore();

  // Title
  ctx.fillStyle='#1a2236'; ctx.font='bold 14px DM Sans,sans-serif';
  ctx.textAlign='center';
  ctx.fillText(`${g.yvar} vs ${g.xvar}${g.yvar2?' · '+g.yvar2:''}`, pad.l+pw/2, 22);

  // Legend
  if (g.yvar2) {
    let lx2 = pad.l+pw-120, ly2 = pad.t+16;
    ctx.fillStyle=g.colors[0]; ctx.fillRect(lx2,ly2-9,22,3);
    ctx.fillStyle='#1a2236'; ctx.font='11px DM Sans,sans-serif'; ctx.textAlign='left';
    ctx.fillText(g.yvar, lx2+26, ly2);
    ctx.fillStyle=g.colors[1]; ctx.fillRect(lx2,ly2+7,22,3);
    ctx.fillStyle='#1a2236';
    ctx.fillText(g.yvar2, lx2+26, ly2+16);
  }

  const a = document.createElement('a');
  a.download = `grafico_${idx+1}_${g.yvar}_vs_${g.xvar}.png`;
  a.href = offCanvas.toDataURL('image/png');
  a.click();
  toast(`✓ PNG HD exportado (${W*SCALE}x${H*SCALE}px)`);
}

// ══════════════════════════════════════════════════════
// GRAPH CSV EXPORT (apenas daquele grafico)
// ══════════════════════════════════════════════════════
function exportGraphCSV(idx) {
  closeMenus();
  const g = graphs[idx];
  if (!g) { toast('Gráfico não encontrado'); return; }
  if (!g.yvar) { toast('Selecione uma variável Y no gráfico primeiro'); return; }
  if (g.data.length < 2) { toast('Execute a simulação primeiro (ou mude a variável Y)'); return; }
  const hasY2 = g.data2 && g.data2.length > 1;
  const header = hasY2 ? `${g.xvar},${g.yvar},${g.yvar2}` : `${g.xvar},${g.yvar}`;
  let rows = [header];
  const n = g.data.length;
  for (let i=0;i<n;i++) {
    const [x,y] = g.data[i];
    if (hasY2 && g.data2[i]) {
      rows.push(`${x},${y},${g.data2[i][1]}`);
    } else {
      rows.push(`${x},${y}`);
    }
  }
  const csv = rows.join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
  a.download = `grafico_${idx+1}_${g.yvar}_vs_${g.xvar}.csv`;
  a.click();
  toast(`✓ CSV Gráfico ${idx+1}: ${n} pontos`);
}

// Autosave
setInterval(()=>{
  const m=getEditorText();
  if(m.trim()) localStorage.setItem('mw_v2',m);
},30000);


// ══════════════════════════════════════════════════════
// 15. MDI WINDOW SYSTEM
// ══════════════════════════════════════════════════════

const MDI_WINDOWS = {
  'mdi-model':   {title:'Modelo',   dot:'var(--acc)',  btnId:'btn-show-model'},
  'mdi-objects': {title:'Objetos',  dot:'var(--acc3)', btnId:'btn-show-objects'},
  'mdi-graphs':  {title:'Gráficos', dot:'var(--acc4)', btnId:'btn-show-graphs'},
};

let mdiZCounter = 10;

function mdiInit() {
  Object.keys(MDI_WINDOWS).forEach(id => {
    const win = document.getElementById(id);
    if (!win) return;
    const tb  = win.querySelector('.mdi-titlebar');
    const rsz = win.querySelector('.mdi-resize');
    mdiMakeDraggable(win, tb);
    if (rsz) mdiMakeResizable(win, rsz);
    win.addEventListener('mousedown', () => mdiFocus(id), true);
  });
}

function mdiFocus(id) {
  mdiZCounter++;
  const win = document.getElementById(id);
  if (win) {
    win.style.zIndex = mdiZCounter;
    document.querySelectorAll('.mdi-child').forEach(w => w.classList.remove('mdi-focused'));
    win.classList.add('mdi-focused');
  }
}

function mdiMinimize(id) {
  const win = document.getElementById(id);
  const cfg = MDI_WINDOWS[id];
  if (!win || !cfg) return;
  win.classList.add('mdi-minimized');
  const btn = document.getElementById(cfg.btnId);
  if (btn) btn.classList.add('mdi-hidden');
  mdiUpdateTaskbar();
}

function mdiRestore(id) {
  const win = document.getElementById(id);
  const cfg = MDI_WINDOWS[id];
  if (!win || !cfg) return;
  win.classList.remove('mdi-minimized');
  const btn = document.getElementById(cfg.btnId);
  if (btn) btn.classList.remove('mdi-hidden');
  mdiFocus(id);
  mdiUpdateTaskbar();
  // trigger graph resize if needed
  if (id === 'mdi-graphs') {
    setTimeout(() => { graphs && graphs.forEach(g => g.resize && g.resize()); }, 60);
  }
}

function mdiUpdateTaskbar() {
  const tb = document.getElementById('mdi-taskbar');
  if (!tb) return;
  tb.innerHTML = '';
  Object.entries(MDI_WINDOWS).forEach(([id, cfg]) => {
    const win = document.getElementById(id);
    if (win && win.classList.contains('mdi-minimized')) {
      const btn = document.createElement('button');
      btn.className = 'mdi-taskbtn';
      btn.innerHTML = `<span class="mdi-taskdot" style="background:${cfg.dot}"></span>${cfg.title}`;
      btn.onclick = () => mdiRestore(id);
      tb.appendChild(btn);
    }
  });
}

function mdiGetLayout() {
  const layout = {};
  Object.keys(MDI_WINDOWS).forEach(id => {
    const win = document.getElementById(id);
    if (!win) return;
    layout[id] = {
      left:    win.style.left   || '',
      top:     win.style.top    || '',
      right:   win.style.right  || '',
      bottom:  win.style.bottom || '',
      width:   win.offsetWidth  + 'px',
      height:  win.offsetHeight + 'px',
      minimized: win.classList.contains('mdi-minimized'),
    };
  });
  return layout;
}

function mdiApplyLayout(layout) {
  Object.entries(layout).forEach(([id, st]) => {
    const win = document.getElementById(id);
    if (!win) return;
    // Clear all positional props first
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

function mdiMakeDraggable(win, handle) {
  let drag = false, ox = 0, oy = 0, wx = 0, wy = 0;
  handle.addEventListener('mousedown', e => {
    if (e.target.closest('.mdi-btn')) return;
    drag = true;
    // Convert to absolute position if using right/bottom
    const rect = win.getBoundingClientRect();
    win.style.left   = rect.left + 'px';
    win.style.top    = rect.top  + 'px';
    win.style.right  = '';
    win.style.bottom = '';
    ox = e.clientX; oy = e.clientY;
    wx = rect.left; wy = rect.top;
    mdiFocus(win.id);
    e.preventDefault();
  });
  window.addEventListener('mousemove', e => {
    if (!drag) return;
    const host = document.getElementById('anim-wrap');
    const hRect = host.getBoundingClientRect();
    let nx = wx + (e.clientX - ox);
    let ny = wy + (e.clientY - oy);
    // Clamp within host
    nx = Math.max(-win.offsetWidth + 60, Math.min(hRect.width - 60, nx - hRect.left));
    ny = Math.max(0, Math.min(hRect.height - 28, ny - hRect.top));
    win.style.left = nx + 'px';
    win.style.top  = ny + 'px';
  });
  window.addEventListener('mouseup', () => { drag = false; });
}

function mdiMakeResizable(win, handle) {
  let drag = false, sx = 0, sy = 0, sw = 0, sh = 0;
  handle.addEventListener('mousedown', e => {
    drag = true; sx = e.clientX; sy = e.clientY;
    sw = win.offsetWidth; sh = win.offsetHeight;
    e.preventDefault(); e.stopPropagation();
  });
  window.addEventListener('mousemove', e => {
    if (!drag) return;
    const nw = Math.max(180, sw + (e.clientX - sx));
    const nh = Math.max(80,  sh + (e.clientY - sy));
    win.style.width  = nw + 'px';
    win.style.height = nh + 'px';
    // trigger graph resize
    if (win.id === 'mdi-graphs') {
      graphs && graphs.forEach(g => g.resize && g.resize());
    }
    if (win.id === 'mdi-model') {
      // MathLive may need relayout
    }
  });
  window.addEventListener('mouseup', () => { drag = false; });
}

// Init - handles both: script loaded before 'load' fires, and after (Next.js afterInteractive)
if (document.readyState === 'complete') {
  // 'load' already fired (Next.js afterInteractive case)
  init();
  mdiInit();
} else {
  window.addEventListener('load', () => { init(); mdiInit(); });
}
