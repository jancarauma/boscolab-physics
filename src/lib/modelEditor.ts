import type { SimEngine } from './SimEngine';
import { formatVal } from './formatVal';
import { t, interpolate } from './i18n';
import { normalizeIdentifier } from './ModelParser';

let _editorLines: string[] = [''];
let _activeLine = 0;
let _parseTimer: ReturnType<typeof setTimeout> | null = null;
let _indVar = 't';
let _modelDirty = false;

function emitModelDirty(): void {
  window.dispatchEvent(new CustomEvent<boolean>('boscolab:model-dirty-change', { detail: _modelDirty }));
}

export function setModelDirty(isDirty: boolean): void {
  if (_modelDirty === isDirty) return;
  _modelDirty = isDirty;
  emitModelDirty();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function indVarPattern(): string {
  return _indVar === 't' ? 't' : `(?:${escapeRegExp(_indVar)}|t)`;
}

export function setEditorIndVar(name: string): void {
  _indVar = normalizeIdentifier(name);
}

export function getEditorText(): string { return _editorLines.join('\n'); }

export function setEditorText(text: string): void {
  _editorLines = text.split('\n');
  if (_editorLines.length === 0) _editorLines = [''];
  _activeLine = 0;
  setModelDirty(false);
  if (document.getElementById('editor-wrap')) buildEditorUI(undefined, _indVar);
}

export function scheduleReparse(onReparse: () => void): void {
  if (_parseTimer) clearTimeout(_parseTimer);
  _parseTimer = setTimeout(onReparse, 700);
}

export function isEqLine(s: string): boolean {
  const t = s.replace(/\/\/.*$/, '').replace(/#.*$/, '').trim();
  if (!t) return false;
  if (s.trim().startsWith('//') || s.trim().startsWith('#')) return false;
  return !!(
    t.match(new RegExp(`\\w+\\(\\s*${indVarPattern()}\\s*\\+\\s*dt\\s*\\)\\s*=`))
    || t.match(new RegExp(`d\\w+\\s*\\/\\s*d${indVarPattern()}\\s*=`))
    || t.match(/^\w+\s*=\s*.+/)
  );
}

export function lineToLatex(line: string): string {
  let s = line.trim();
  s = s.replace(new RegExp(`(\\w+)\\((${indVarPattern()})\\+dt\\)`, 'g'), (_, v, ref) => `${v}_{${ref}+\\Delta t}`);
  s = s.replace(new RegExp(`(\\w+)\\((${indVarPattern()})\\)`, 'g'), (_, v, ref) => `${v}_{${ref}}`);
  s = s.replace(new RegExp(`d(\\w+)\\/d(${indVarPattern()})`, 'g'), (_, v, ref) => `\\frac{d${v}}{d${ref}}`);
  s = s.replace(/\btheta\b/g, '\\theta').replace(/\bomega\b/g, '\\omega')
       .replace(/\balpha\b/g, '\\alpha').replace(/\bbeta\b/g, '\\beta')
       .replace(/\bgamma\b/g, '\\gamma').replace(/\bsigma\b/g, '\\sigma')
       .replace(/\brho\b/g, '\\rho').replace(/\bphi\b/g, '\\phi')
       .replace(/\blambda\b/g, '\\lambda').replace(/\bmu\b/g, '\\mu')
       .replace(/\bpi\b/g, '\\pi');
  s = s.replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}');
  s = s.replace(/\bsin\b/g, '\\sin').replace(/\bcos\b/g, '\\cos')
       .replace(/\btan\b/g, '\\tan').replace(/\bexp\b/g, '\\exp')
       .replace(/\bln\b/g, '\\ln');
  s = s.replace(/\(([^()]+)\)\/\(([^()]+)\)/g, '\\frac{$1}{$2}');
  s = s.replace(/\^([A-Za-z0-9_.]+)/g, '^{$1}');
  s = s.replace(/\*\*/g, '^');
  s = s.replace(/\*/g, ' \\cdot ');
  s = s.replace(/\bdt\b/g, '\\Delta t');
  return s;
}

export function latexToPlain(latex: string): string {
  const pattern = indVarPattern();
  let s = latex;
  s = s.replace(new RegExp(`([a-zA-Z]\\w*)\\s*_\\{(${pattern})\\+\\\\Delta t\\}`, 'g'), '$1($2+dt)');
  s = s.replace(new RegExp(`([a-zA-Z]\\w*)\\s*_\\{(${pattern})\\}`, 'g'), '$1($2)');
  s = s.replace(new RegExp(`([a-zA-Z]\\w*)\\s*_(${pattern})\\b`, 'g'), '$1($2)');
  s = s.replace(new RegExp(`\\\\frac\\{d\\s*([a-zA-Z]\\w*)\\}\\{d\\s*(${pattern})\\}`, 'g'), 'd$1/d$2');
  s = s.replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)');
  s = s.replace(/\\theta/g, 'theta').replace(/\\omega/g, 'omega')
       .replace(/\\alpha/g, 'alpha').replace(/\\beta/g, 'beta')
       .replace(/\\gamma/g, 'gamma').replace(/\\sigma/g, 'sigma')
       .replace(/\\rho/g, 'rho').replace(/\\phi/g, 'phi')
       .replace(/\\lambda/g, 'lambda').replace(/\\mu/g, 'mu')
       .replace(/\\pi/g, 'pi');
  s = s.replace(/\\sin/g, 'sin').replace(/\\cos/g, 'cos')
       .replace(/\\tan/g, 'tan').replace(/\\exp/g, 'exp').replace(/\\ln/g, 'ln');
  s = s.replace(/\\cdot\s*/g, '*');
  s = s.replace(/\\Delta\s*t/g, 'dt');
  s = s.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
  s = s.replace(/\^\{([a-zA-Z0-9_.]+)\}/g, '^$1');
  s = s.replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1');
  s = s.replace(/\\[a-zA-Z]+/g, '');
  s = s.replace(/[{}]/g, '');
  return s.trim();
}

export function buildEditorUI(onReparse?: () => void, indVar?: string): void {
  if (indVar) setEditorIndVar(indVar);
  const wrap = document.getElementById('editor-wrap');
  if (!wrap) return;
  wrap.innerHTML = '';
  _editorLines.forEach((line, idx) => {
    wrap.appendChild(createLineEl(line, idx, onReparse));
  });
  focusLine(_activeLine);
}

function createLineEl(lineText: string, idx: number, onReparse?: () => void): HTMLElement {
  const row = document.createElement('div');
  row.className = 'eq-line' + (idx === _activeLine ? ' eq-active' : '');
  row.dataset.idx = String(idx);

  const no = document.createElement('div');
  no.className = 'eq-lineno';
  no.textContent = String(idx + 1);

  const wrap = document.createElement('div');
  wrap.className = 'eq-input-wrap';

  const isEq = isEqLine(lineText);
  const MFE = (window as any).MathfieldElement;

  if (isEq && typeof MFE !== 'undefined') {
    const mf = document.createElement('math-field') as any;
    mf.className = 'eq-mathfield';
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    mf.setAttribute('virtual-keyboard-mode', isTouch ? 'onfocus' : 'manual');
    mf.setAttribute('smart-mode', 'true');
    mf.setAttribute('smart-superscript', 'false');
    mf.value = lineToLatex(lineText);
    mf.addEventListener('input', () => {
      _editorLines[idx] = latexToPlain(mf.value);
      setModelDirty(true);
      if (onReparse) scheduleReparse(onReparse);
    });
    mf.addEventListener('focus', () => setActiveLine(idx));
    mf.addEventListener('keydown', (e: KeyboardEvent) => handleLineKeydown(e, idx, mf, onReparse));
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
      setModelDirty(true);
      if (isEqLine(inp.value)) { buildEditorUI(onReparse); focusLine(idx); }
      if (onReparse) scheduleReparse(onReparse);
    });
    inp.addEventListener('focus', () => setActiveLine(idx));
    inp.addEventListener('keydown', (e: KeyboardEvent) => handleLineKeydown(e, idx, inp, onReparse));
    wrap.appendChild(inp);
  }

  row.appendChild(no);
  row.appendChild(wrap);
  return row;
}

function handleLineKeydown(e: KeyboardEvent, idx: number, el: any, onReparse?: () => void): void {
  if (e.key === 'Enter') {
    e.preventDefault();
    _editorLines.splice(idx + 1, 0, '');
    setModelDirty(true);
    _activeLine = idx + 1;
    buildEditorUI(onReparse); focusLine(idx + 1);
  } else if (e.key === 'Backspace') {
    const val = el.tagName === 'MATH-FIELD' ? latexToPlain(el.value) : el.value;
    if (val === '' && _editorLines.length > 1) {
      e.preventDefault();
      _editorLines.splice(idx, 1);
      setModelDirty(true);
      _activeLine = Math.max(0, idx - 1);
      buildEditorUI(onReparse); focusLine(_activeLine);
    }
  } else if (e.key === 'ArrowUp') {
    if (idx > 0) { e.preventDefault(); focusLine(idx - 1); }
  } else if (e.key === 'ArrowDown') {
    if (idx < _editorLines.length - 1) { e.preventDefault(); focusLine(idx + 1); }
  } else if (e.key === 'Tab') {
    e.preventDefault();
    _editorLines.splice(idx + 1, 0, '');
    setModelDirty(true);
    _activeLine = idx + 1;
    buildEditorUI(onReparse); focusLine(idx + 1);
  }
}

export function focusLine(idx: number): void {
  const wrap = document.getElementById('editor-wrap');
  if (!wrap) return;
  const rows = wrap.querySelectorAll<HTMLElement>('.eq-line');
  rows.forEach((r, i) => r.classList.toggle('eq-active', i === idx));
  const row = rows[idx];
  if (!row) return;
  const el = row.querySelector<any>('math-field, input');
  if (el) {
    el.focus();
    if (el.tagName !== 'MATH-FIELD') {
      try { el.setSelectionRange(el.value.length, el.value.length); } catch (_) {}
    }
  }
  _activeLine = idx;
}

export function setActiveLine(idx: number): void {
  _activeLine = idx;
  const wrap = document.getElementById('editor-wrap');
  if (!wrap) return;
  wrap.querySelectorAll('.eq-line').forEach((r, i) => r.classList.toggle('eq-active', i === idx));
}

export function editorWrapClick(e: MouseEvent, onReparse?: () => void): void {
  const row = (e.target as HTMLElement).closest('.eq-line');
  if (!row) {
    _editorLines.push('');
    setModelDirty(true);
    _activeLine = _editorLines.length - 1;
    buildEditorUI(onReparse, _indVar); focusLine(_activeLine);
  }
}

export function rebuildVarList(sim: SimEngine): void {
  const BADGE_LABELS: Record<string, string> = {
    state: 'Estado', const: 'Constante',
    derived: 'Derivada', param: 'Parâmetro',
  };
  const vars = sim.getVars();
  const el = document.getElementById('varlist');
  if (!el) return;
  if (!vars.length) { el.innerHTML = ''; return; }
  el.innerHTML = vars.map((v: any) => `
    <div class="varrow">
      <span class="vbadge ${v.type}" title="${BADGE_LABELS[v.type] || v.type}">${v.type.slice(0, 3).toUpperCase()}</span>
      <span class="vname">${v.name}</span>
      <span class="vval" id="vv-${v.name}">—</span>
    </div>`).join('');
}

export function updateVarValues(sim: SimEngine): void {
  if (!sim.parsed) return;
  Object.keys(sim.parsed.variables).forEach((v: string) => {
    const el = document.getElementById('vv-' + v);
    if (el && sim.state[v] !== undefined) el.textContent = formatVal(Number(sim.state[v]));
  });
}

export function applyModel(
  sim: SimEngine,
  onRebuild: () => void,
  silent?: boolean,
): void {
  const src = getEditorText();
  const r = sim.setModel(src);
  const st = document.getElementById('parse-status');
  if (r.ok) {
    if (st) { st.textContent = interpolate(t().messages.modelOk, { count: Object.keys(sim.parsed?.variables || {}).length }); st.style.color = '#34d399'; }
    clearErrImport();
    onRebuild();
  } else {
    if (st) { st.textContent = '✗ ' + r.errors[0].msg; st.style.color = '#fb7185'; }
    if (!silent) setErrImport(r.errors[0].msg);
  }
}

// lazy import to avoid circular deps
function clearErrImport() { document.getElementById('errmsg') && (document.getElementById('errmsg')!.textContent = ''); }
function setErrImport(m: string) { document.getElementById('errmsg') && (document.getElementById('errmsg')!.textContent = m); }
