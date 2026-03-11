import { ModelParser } from './ModelParser';

// ── SIMULATION ENGINE ─────────────────────────────────
export class SimEngine {
  parser: ModelParser;
  parsed: any;
  state: Record<string, number>;
  initState: Record<string, number>;
  t: number; dt: number; tMax: number; n: number;
  method: string;
  history: any[]; maxHist: number;
  running: boolean; status: string;
  stepsPerFrame: number;
  _frameAcc: number;
  _raf: number | null;
  _evalFn: Function | null; _derivFn: Function | null; _applyFn: Function | null;
  fps: number; _fc: number; _ft: number; _lt: number;
  onStep: ((state: any, t: number, n: number) => void) | null;
  onStatus: ((s: string) => void) | null;

  constructor() {
    this.parser = new ModelParser();
    this.parsed = null;
    this.state = {}; this.initState = {};
    this.t = 0; this.dt = 0.01; this.tMax = 10; this.n = 0;
    this.method = 'rk4';
    this.history = []; this.maxHist = 150000;
    this.running = false; this.status = 'stopped';
    this.stepsPerFrame = 1;
    this._frameAcc = 0;
    this._raf = null;
    this._evalFn = null; this._derivFn = null; this._applyFn = null;
    this.fps = 0; this._fc = 0; this._ft = 0; this._lt = 0;
    this.onStep = null; this.onStatus = null;
  }

  setModel(src: string) {
    this.parsed = this.parser.parse(src);
    if (this.parsed.errors.length) { this._setStatus('error'); return { ok: false, errors: this.parsed.errors }; }
    this._buildFns();
    return { ok: true, errors: [] };
  }

  _buildFns() {
    const { equations } = this.parsed;
    const p = this.parser;
    const constL = equations.filter((e: any) => e.type === 'const').map((e: any) => `s.${e.var}=${e.value};`);
    const derivL = equations.filter((e: any) => e.type === 'derived').map((e: any) => `s.${e.var}=${p.compileExpr(e.expr)};`);
    try { this._applyFn = new Function('s', 'dt', 't', 'n', '_if', constL.join('\n') + '\n' + derivL.join('\n')); } catch (e) { console.error('_applyFn:', e); }
    const eulerL = equations.map((e: any) => {
      if (e.type === 'iterative') return `ns.${e.var}=${p.compileExpr(e.expr).replace(/_p_(\w+)/g, (_: string, v: string) => `prev.${v}`)};`;
      if (e.type === 'differential') return `ns.${e.var}=s.${e.var}+(${p.compileExpr(e.expr)})*dt;`;
      return '';
    }).filter(Boolean);
    try { this._evalFn = new Function('s', 'prev', 'ns', 'dt', 't', 'n', '_if', constL.join('\n') + '\n' + derivL.join('\n') + '\n' + eulerL.join('\n')); } catch (e) { console.error('_evalFn:', e); }
    const derivStateL = equations.map((e: any) => {
      if (e.type === 'iterative') {
        const js = p.compileExpr(e.expr).replace(/_p_(\w+)/g, (_: string, v: string) => `s.${v}`);
        return `d.${e.var}=((${js})-s.${e.var})/dt;`;
      }
      if (e.type === 'differential') return `d.${e.var}=${p.compileExpr(e.expr)};`;
      return '';
    }).filter(Boolean);
    try { this._derivFn = new Function('s', 'd', 'dt', 't', 'n', '_if', constL.join('\n') + '\n' + derivL.join('\n') + '\n' + derivStateL.join('\n')); } catch (e) { console.error('_derivFn:', e); }
  }

  _applyDerived(s: Record<string, number>) {
    if (!this._applyFn) return;
    try { this._applyFn(s, this.dt, this.t, this.n, (c: any, a: any, b: any) => c ? a : b); } catch (e) { }
  }

  _stateVars() { return this.parsed ? [...this.parsed.stateVars] : []; }

  _stepEuler() {
    const s = { ...this.state }; const ns = { ...s };
    if (this.parsed) Object.entries(this.parsed.constVars).forEach(([k, v]: [string, any]) => { s[k] = v; ns[k] = v; });
    const _if = (c: any, a: any, b: any) => c ? a : b;
    try { this._evalFn!(s, s, ns, this.dt, this.t, this.n, _if); this.state = ns; this._applyDerived(this.state); }
    catch (e: any) { this._setStatus('error'); if (typeof window !== 'undefined') (window as any).setErr?.('Erro numérico: ' + e.message); }
  }

  _stepRK4() {
    if (!this._derivFn) { this._stepEuler(); return; }
    const sv = this._stateVars(); const dt = this.dt; const t = this.t; const n = this.n;
    const _if = (c: any, a: any, b: any) => c ? a : b;
    const s0 = { ...this.state };
    if (this.parsed) Object.entries(this.parsed.constVars).forEach(([k, v]: [string, any]) => { s0[k] = v; });
    this._applyDerived(s0);
    const k1: any = {}; try { this._derivFn(s0, k1, dt, t, n, _if); } catch (e) { this._stepEuler(); return; }
    const s1: any = { ...s0 }; sv.forEach((v: string) => { s1[v] = s0[v] + 0.5 * dt * (k1[v] || 0); }); s1.t = t + 0.5 * dt; this._applyDerived(s1);
    const k2: any = {}; try { this._derivFn(s1, k2, dt, t + 0.5 * dt, n, _if); } catch (e) { this._stepEuler(); return; }
    const s2: any = { ...s0 }; sv.forEach((v: string) => { s2[v] = s0[v] + 0.5 * dt * (k2[v] || 0); }); s2.t = t + 0.5 * dt; this._applyDerived(s2);
    const k3: any = {}; try { this._derivFn(s2, k3, dt, t + 0.5 * dt, n, _if); } catch (e) { this._stepEuler(); return; }
    const s3: any = { ...s0 }; sv.forEach((v: string) => { s3[v] = s0[v] + dt * (k3[v] || 0); }); s3.t = t + dt; this._applyDerived(s3);
    const k4: any = {}; try { this._derivFn(s3, k4, dt, t + dt, n, _if); } catch (e) { this._stepEuler(); return; }
    const ns: any = { ...s0 };
    sv.forEach((v: string) => { ns[v] = s0[v] + (dt / 6) * ((k1[v] || 0) + 2 * (k2[v] || 0) + 2 * (k3[v] || 0) + (k4[v] || 0)); });
    this.state = ns; this._applyDerived(this.state);
  }

  step() {
    if (!this.parsed || this.parsed.errors.length || (!this._evalFn && !this._derivFn)) return;
    for (const v in this.state) {
      if (!isFinite(this.state[v])) {
        this._setStatus('error');
        if (typeof window !== 'undefined') (window as any).setErr?.(`Divergência: ${v} = ${this.state[v]}. Reduza dt.`);
        return;
      }
    }
    if (this.method === 'rk4') this._stepRK4(); else this._stepEuler();
    this.t += this.dt; this.n++; this.state.t = this.t;
    if (this.history.length < this.maxHist) this.history.push({ ...this.state, t: this.t, n: this.n });
    if (this.t >= this.tMax) { this._setStatus('done'); this.stop(); }
    if (this.onStep) this.onStep(this.state, this.t, this.n);
  }

  stepBack() {
    if (this.history.length < 2) return;
    this.history.pop();
    const s = this.history[this.history.length - 1];
    this.state = { ...s }; this.t = s.t || 0; this.n = s.n || 0;
    if (this.onStep) this.onStep(this.state, this.t, this.n);
  }

  setIC(ic: Record<string, number>) {
    const normalized: Record<string, number> = {};
    Object.entries(ic).forEach(([k, v]) => { normalized[k.toLowerCase()] = v; });
    this.initState = { ...normalized }; this.state = { ...normalized };
    if (this.parsed) Object.entries(this.parsed.constVars).forEach(([k, v]: [string, any]) => { this.state[k] = v; this.initState[k] = v; });
    this._applyDerived(this.state);
    this.t = 0; this.n = 0;
    this.history = [{ ...this.state, t: 0, n: 0 }];
  }

  reset() {
    this.stop();
    this.state = { ...this.initState };
    if (this.parsed) Object.entries(this.parsed.constVars).forEach(([k, v]: [string, any]) => { this.state[k] = v; });
    this._applyDerived(this.state);
    this.t = 0; this.n = 0;
    this.history = [{ ...this.state, t: 0, n: 0 }];
    this._setStatus('stopped');
    if (this.onStep) this.onStep(this.state, 0, 0);
  }

  start() {
    if (this.status === 'error') return;
    if (this.status === 'done') this.reset();
    this.running = true; this._setStatus('running');
    this._lt = performance.now(); this._loop();
  }

  pause() { this.running = false; if (this._raf) cancelAnimationFrame(this._raf); this._setStatus('paused'); }
  stop() { this.running = false; if (this._raf) cancelAnimationFrame(this._raf); }

  _loop() {
    if (!this.running) return;
    const now = performance.now(); const el = now - this._lt; this._lt = now;
    this._fc++; this._ft += el;
    if (this._ft > 600) { this.fps = Math.round(this._fc / (this._ft / 1000)); this._fc = 0; this._ft = 0; }
    const steps = Math.max(1, this.stepsPerFrame);
    for (let i = 0; i < steps && this.running; i++) this.step();
    this._raf = requestAnimationFrame(() => this._loop());
  }

  _setStatus(s: string) { this.status = s; if (this.onStatus) this.onStatus(s); }

  getVars() { if (!this.parsed) return []; return Object.entries(this.parsed.variables).map(([n, i]: [string, any]) => ({ name: n, ...i })); }
  getAllVarNames() { if (!this.parsed) return []; return ['t', ...Object.keys(this.parsed.variables)]; }
}
