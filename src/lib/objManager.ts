import type { SimEngine } from './SimEngine';
import type { AnimRenderer } from './AnimRenderer';
import { makeObj, OBJECT_ICONS } from './objects';
import { toast, closeModal } from './uiHelpers';
import { t as getTranslations, interpolate } from './i18n';
import { toEmbedVideoUrl } from './videoEmbed';

let _pendingObjType: string | null = null;
export let selectedObj: any = null;

// --- Object list -------
export function renderObjList(anim: AnimRenderer): void {
  const el = document.getElementById('obj-list');
  if (!el) return;
  const tr = getTranslations();
  if (!anim.objects.length) {
    el.innerHTML = `<div class="no-obj">${tr.panels.noObjects}<br>${tr.panels.noObjectsDesc}</div>`;
    return;
  }
  el.innerHTML = anim.objects.map((o: any) => `
    <div class="obj-row${o._selected ? ' selected' : ''}" onclick="window.__selectObj(${o.id})">
      <span class="obj-icon">${OBJECT_ICONS[o.type] || '●'}</span>
      <span class="obj-name">${o.name}</span>
      <span class="obj-layer-btns" onclick="event.stopPropagation()" style="display:flex;gap:1px;margin-left:auto;flex-shrink:0">
        <span class="obj-vis" onclick="window.__moveObjLayer(${o.id},-1)" title="${tr.commonProps.moveUp}" style="font-size:10px;padding:2px 3px">▲</span>
        <span class="obj-vis" onclick="window.__moveObjLayer(${o.id},1)" title="${tr.commonProps.moveDown}" style="font-size:10px;padding:2px 3px">▼</span>
      </span>
      <span class="obj-vis" onclick="event.stopPropagation();window.__toggleObjVis(${o.id})" title="${o.visible ? tr.commonProps.hide : tr.commonProps.show}">${o.visible ? '👁' : '🚫'}</span>
      <span class="obj-del" onclick="event.stopPropagation();window.__deleteObj(${o.id})" title="${tr.commonProps.remove}">✕</span>
    </div>`).join('');
}

export function selectObj(id: number, anim: AnimRenderer, sim: SimEngine): void {
  if (selectedObj) selectedObj._selected = false;
  selectedObj = anim.objects.find((o: any) => o.id === id) || null;
  if (selectedObj) selectedObj._selected = true;
  renderObjList(anim);
  renderObjProps(selectedObj, sim, anim);
}

export function toggleObjVis(id: number, anim: AnimRenderer): void {
  const o = anim.objects.find((o: any) => o.id === id);
  if (!o) return;
  o.visible = !o.visible;
  renderObjList(anim);
}

export function deleteObj(id: number, anim: AnimRenderer, sim: SimEngine): void {
  const i = anim.objects.findIndex((o: any) => o.id === id);
  if (i < 0) return;
  if (selectedObj && selectedObj.id === id) { selectedObj = null; renderObjProps(null, sim, anim); }
  anim.objects.splice(i, 1);
  renderObjList(anim);
}

export function deleteSelectedObj(anim: AnimRenderer, sim: SimEngine): void {
  if (selectedObj) deleteObj(selectedObj.id, anim, sim);
}

export function clearAllObjects(anim: AnimRenderer, sim: SimEngine): void {
  anim.objects = [];
  selectedObj = null;
  renderObjList(anim);
  renderObjProps(null, sim, anim);
}

export function moveObjLayer(id: number, dir: number, anim: AnimRenderer): void {
  const i = anim.objects.findIndex((o: any) => o.id === id);
  if (i < 0) return;
  const ni = i + dir;
  if (ni < 0 || ni >= anim.objects.length) return;
  const tmp = anim.objects[i]; anim.objects[i] = anim.objects[ni]; anim.objects[ni] = tmp;
  renderObjList(anim);
}

export function loadObjImage(id: number, anim: AnimRenderer, sim: SimEngine): void {
  const o = anim.objects.find((o: any) => o.id === id);
  if (!o) return;
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/png,image/jpeg,image/gif,image/webp';
  inp.onchange = () => {
    const f = inp.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => {
      o.imageData = (ev.target as FileReader).result as string;
      const img = new Image(); img.src = o.imageData; o._imgEl = img;
      o.useImage = true;
      renderObjProps(o, sim, anim);
      toast(getTranslations().messages.imageLoaded);
    };
    reader.readAsDataURL(f);
  };
  inp.click();
}

export function resetObjOffset(id: number, anim: AnimRenderer): void {
  const o = anim.objects.find((o: any) => o.id === id);
  if (!o) return;
  o._vox = 0; o._voy = 0;
  toast(getTranslations().messages.visualOffsetReset);
}

// --- Add Object Modal -------
export function addObject(type: string, sim: SimEngine, getObjId: () => number): void {
  _pendingObjType = type;
  const tr = getTranslations();
  const icons: Record<string, string> = { particle: '●', pendulum: '🔴', spring: '🌀', vector: '➡', circle: '◯', rect: '▭', label: 'T', vectorfield: '⊞', video: '▶' };
  const labels: Record<string, string> = { particle: tr.objectTypes.particle, pendulum: tr.objectTypes.pendulum, spring: tr.objectTypes.spring, vector: tr.objectTypes.vector, circle: tr.objectTypes.circle, rect: tr.objectTypes.rectangle, label: tr.objectTypes.text, vectorfield: tr.objectTypes.field, video: tr.objectTypes.video };

  const iconEl = document.getElementById('modal-icon');
  const labelEl = document.getElementById('modal-type-label');
  if (iconEl) iconEl.textContent = icons[type] || '●';
  if (labelEl) labelEl.textContent = `${tr.modals.newObject} — ${labels[type] || type}`;

  const vars = sim.getAllVarNames();
  const varOpts = vars.map((v: string) => `<option value="${v}">${v}</option>`).join('');
  const varOptsBlank = '<option value="">—</option>' + varOpts;
  const _id = getObjId();

  function mrowCV(label: string, baseId: string, defaultVal: number, vopts: string): string {
    return `<div class="modal-row"><span class="modal-label">${label}</span>
      <select class="modal-sel" id="${baseId}-mode" style="width:80px" onchange="window.__togglePivotField('${baseId}',this.value)">
        <option value="const">${tr.spring.constant}</option><option value="var">${tr.spring.variable}</option>
      </select>
      <input class="modal-inp" id="${baseId}" type="number" step="any" value="${defaultVal}" style="flex:1">
      <select class="modal-sel" id="${baseId}-var" style="display:none;flex:1">${vopts}</select>
    </div>`;
  }

  const FORMS: Record<string, string> = {
    particle: `
      <div class="modal-row"><span class="modal-label">${tr.commonProps.name}</span><input class="modal-inp" id="mo-name" value="${interpolate(tr.particle.defaultName || 'Particle{id}', { id: _id })}"></div>
      ${mrowCV(tr.particle.positionX, 'mo-x', 0, varOptsBlank)}
      ${mrowCV(tr.particle.positionY, 'mo-y', 0, varOptsBlank)}
      ${mrowCV(tr.vector.componentVx, 'mo-vx', 0, varOptsBlank)}
      ${mrowCV(tr.vector.componentVy, 'mo-vy', 0, varOptsBlank)}
      ${mrowCV(tr.particle.radius, 'mo-radius', 8, varOptsBlank)}
      ${mrowCV(tr.pendulum.rotation, 'mo-rotation', 0, varOptsBlank)}
      <div class="modal-row"><span class="modal-label">${tr.commonProps.color}</span><input class="modal-inp" type="color" id="mo-color" style="width:60px;padding:2px" value="#4f9eff"></div>
      <div class="modal-row"><span class="modal-label">${tr.particle.showVelocity}</span><input type="checkbox" class="prop-check" id="mo-showvec"></div>
      <div class="modal-row"><span class="modal-label">${tr.particle.projections}</span><input type="checkbox" class="prop-check" id="mo-showvecproj" checked></div>
      <div class="modal-row"><span class="modal-label">${tr.particle.vectorColor}</span><input class="modal-inp" type="color" id="mo-veccolor" value="#34d399"></div>
      <div class="modal-row"><span class="modal-label">${tr.particle.projectionColor}</span><input class="modal-inp" type="color" id="mo-projcolor" value="#93c5fd"></div>
      <div class="modal-row"><span class="modal-label">${tr.particle.trail}</span><input type="checkbox" class="prop-check" id="mo-trail" checked></div>
      <div class="modal-row"><span class="modal-label">${tr.particle.label}</span><input class="modal-inp" id="mo-label" value="" placeholder="${tr.particle.namePlaceholder}"></div>`,
    pendulum: `
      <div class="modal-row"><span class="modal-label">${tr.commonProps.name}</span><input class="modal-inp" id="mo-name" value="${interpolate(tr.pendulum.defaultName, { id: _id })}"></div>
      <div class="modal-row"><span class="modal-label">${tr.pendulum.angle}</span><select class="modal-sel" id="mo-theta">${varOptsBlank}</select></div>
      <div class="modal-row"><span class="modal-label">${tr.pendulum.length}</span>
        <select class="modal-sel" id="mo-L-mode" style="width:80px" onchange="window.__togglePivotField('mo-L',this.value)"><option value="const">${tr.spring.constant}</option><option value="var">${tr.spring.variable}</option></select>
        <input class="modal-inp" id="mo-L" type="number" step="0.1" value="1.5" style="flex:1">
        <select class="modal-sel" id="mo-L-var" style="display:none;flex:1">${varOptsBlank}</select>
      </div>
      <div class="modal-row"><span class="modal-label">${tr.pendulum.pivotX}</span>
        <select class="modal-sel" id="mo-pivotX-mode" style="width:80px" onchange="window.__togglePivotField('mo-pivotX',this.value)"><option value="const">${tr.spring.constant}</option><option value="var">${tr.spring.variable}</option></select>
        <input class="modal-inp" id="mo-pivotX" type="number" value="0" style="flex:1">
        <select class="modal-sel" id="mo-pivotX-var" style="display:none;flex:1">${varOptsBlank}</select>
      </div>
      <div class="modal-row"><span class="modal-label">${tr.pendulum.pivotY}</span>
        <select class="modal-sel" id="mo-pivotY-mode" style="width:80px" onchange="window.__togglePivotField('mo-pivotY',this.value)"><option value="const">${tr.spring.constant}</option><option value="var">${tr.spring.variable}</option></select>
        <input class="modal-inp" id="mo-pivotY" type="number" value="0" style="flex:1">
        <select class="modal-sel" id="mo-pivotY-var" style="display:none;flex:1">${varOptsBlank}</select>
      </div>
      ${mrowCV(tr.pendulum.bobRadius, 'mo-radius', 10, varOptsBlank)}
      ${mrowCV(tr.pendulum.rotation, 'mo-rotation', 0, varOptsBlank)}
      <div class="modal-row"><span class="modal-label">${tr.commonProps.color}</span><input class="modal-inp" type="color" id="mo-color" value="#f97316"></div>
      <div class="modal-row"><span class="modal-label">${tr.particle.trail}</span><input type="checkbox" class="prop-check" id="mo-trail" checked></div>`,
    spring: `
      <div class="modal-row"><span class="modal-label">${tr.commonProps.name}</span><input class="modal-inp" id="mo-name" value="${interpolate(tr.spring.defaultName, { id: _id })}"></div>
      <div class="modal-row"><span class="modal-label">${tr.spring.orientation}</span><select class="modal-sel" id="mo-vertical"><option value="true">${tr.spring.vertical}</option><option value="false">${tr.spring.horizontal}</option></select></div>
      <div class="modal-row"><span class="modal-label">${tr.spring.blockPos}</span><select class="modal-sel" id="mo-x">${varOptsBlank}</select></div>
      <div class="modal-row"><span class="modal-label">${tr.spring.pivotX}</span>
        <select class="modal-sel" id="mo-pivotX-mode" style="width:80px" onchange="window.__togglePivotField('mo-pivotX',this.value)"><option value="const">${tr.spring.constant}</option><option value="var">${tr.spring.variable}</option></select>
        <input class="modal-inp" id="mo-pivotX" type="number" value="0" style="flex:1">
        <select class="modal-sel" id="mo-pivotX-var" style="display:none;flex:1">${varOptsBlank}</select>
      </div>
      <div class="modal-row"><span class="modal-label">${tr.spring.pivotY}</span>
        <select class="modal-sel" id="mo-pivotY-mode" style="width:80px" onchange="window.__togglePivotField('mo-pivotY',this.value)"><option value="const">${tr.spring.constant}</option><option value="var">${tr.spring.variable}</option></select>
        <input class="modal-inp" id="mo-pivotY" type="number" value="5" style="flex:1">
        <select class="modal-sel" id="mo-pivotY-var" style="display:none;flex:1">${varOptsBlank}</select>
      </div>
      <div class="modal-row"><span class="modal-label">${tr.spring.coils}</span><input class="modal-inp" id="mo-coils" type="number" value="10"></div>
      <div class="modal-row"><span class="modal-label">${tr.commonProps.color}</span><input class="modal-inp" type="color" id="mo-color" value="#a78bfa"></div>`,
    vector: `
      <div class="modal-row"><span class="modal-label">${tr.commonProps.name}</span><input class="modal-inp" id="mo-name" value="${interpolate(tr.vector.defaultName, { id: _id })}"></div>
      ${mrowCV(tr.vector.originX, 'mo-x', 0, varOptsBlank)}
      ${mrowCV(tr.vector.originY, 'mo-y', 0, varOptsBlank)}
      ${mrowCV(tr.vector.componentVx, 'mo-vx', 0, varOptsBlank)}
      ${mrowCV(tr.vector.componentVy, 'mo-vy', 0, varOptsBlank)}
      <div class="modal-row"><span class="modal-label">${tr.vector.scale}</span><input class="modal-inp" id="mo-scale" type="number" step="0.1" value="0.3"></div>
      ${mrowCV(tr.pendulum.rotation, 'mo-rotation', 0, varOptsBlank)}
      <div class="modal-row"><span class="modal-label">${tr.commonProps.color}</span><input class="modal-inp" type="color" id="mo-color" value="#34d399"></div>
      <div class="modal-row"><span class="modal-label">${tr.vector.projections}</span><input type="checkbox" class="prop-check" id="mo-showproj"></div>
      <div class="modal-row"><span class="modal-label">${tr.vector.projectionColor}</span><input class="modal-inp" type="color" id="mo-projcolor" value="#94a3b8"></div>
      <div class="modal-row"><span class="modal-label">${tr.vector.label}</span><input class="modal-inp" id="mo-label" value=""></div>`,
    circle: `
      <div class="modal-row"><span class="modal-label">${tr.commonProps.name}</span><input class="modal-inp" id="mo-name" value="${interpolate(tr.circle.defaultName, { id: _id })}"></div>
      ${mrowCV(tr.circle.centerX, 'mo-x', 0, varOptsBlank)}
      ${mrowCV(tr.circle.centerY, 'mo-y', 0, varOptsBlank)}
      ${mrowCV(tr.circle.radiusUnit, 'mo-r', 1, varOptsBlank)}
      ${mrowCV(tr.pendulum.rotation, 'mo-rotation', 0, varOptsBlank)}
      <div class="modal-row"><span class="modal-label">${tr.circle.borderColor}</span><input class="modal-inp" type="color" id="mo-color" value="#4f9eff"></div>`,
    rect: `
      <div class="modal-row"><span class="modal-label">${tr.commonProps.name}</span><input class="modal-inp" id="mo-name" value="${interpolate(tr.rectangle.defaultName, { id: _id })}"></div>
      ${mrowCV(tr.circle.centerX, 'mo-x', 0, varOptsBlank)}
      ${mrowCV(tr.circle.centerY, 'mo-y', 0, varOptsBlank)}
      ${mrowCV(tr.rectangle.width, 'mo-w', 1, varOptsBlank)}
      ${mrowCV(tr.rectangle.height, 'mo-h', 1, varOptsBlank)}
      ${mrowCV(tr.pendulum.rotation, 'mo-rotation', 0, varOptsBlank)}
      <div class="modal-row"><span class="modal-label">${tr.commonProps.color}</span><input class="modal-inp" type="color" id="mo-color" value="#4f9eff"></div>`,
    label: `
      <div class="modal-row"><span class="modal-label">${tr.commonProps.name}</span><input class="modal-inp" id="mo-name" value="${interpolate(tr.textLabel.defaultName, { id: _id })}"></div>
      ${mrowCV(tr.textLabel.posX, 'mo-x', 0, varOptsBlank)}
      ${mrowCV(tr.textLabel.posY, 'mo-y', 3, varOptsBlank)}
      ${mrowCV(tr.pendulum.rotation, 'mo-rotation', 0, varOptsBlank)}
      <div class="modal-row"><span class="modal-label">${tr.textLabel.text}</span><input class="modal-inp" id="mo-text" value="${tr.textLabel.textPlaceholder}" style="width:100%"></div>
      <div class="modal-row"><span class="modal-label">${tr.textLabel.size}</span><input class="modal-inp" id="mo-fontSize" type="number" value="13"></div>
      <div class="modal-row"><span class="modal-label">${tr.commonProps.color}</span><input class="modal-inp" type="color" id="mo-color" value="#e2e8f0"></div>`,
    vectorfield: `
      <div class="modal-row"><span class="modal-label">${tr.commonProps.name}</span><input class="modal-inp" id="mo-name" value="${interpolate(tr.field.defaultName, { id: _id })}"></div>
      <div class="modal-row"><span class="modal-label">Fx(x,y,t)</span><input class="modal-inp" id="mo-fxExpr" value="-y" placeholder="ex: -y"></div>
      <div class="modal-row"><span class="modal-label">Fy(x,y,t)</span><input class="modal-inp" id="mo-fyExpr" value="x" placeholder="ex: x"></div>
      <div class="modal-row"><span class="modal-label">${tr.field.gridN}</span><input class="modal-inp" id="mo-gridN" type="number" value="14"></div>
      <div class="modal-row"><span class="modal-label">${tr.field.range}</span><input class="modal-inp" id="mo-gridRange" type="number" value="5"></div>
      <div class="modal-row"><span class="modal-label">${tr.field.arrowScale}</span><input class="modal-inp" id="mo-arrowScale" type="number" step="0.05" value="0.6"></div>
      <div class="modal-row"><span class="modal-label">${tr.commonProps.color}</span><input class="modal-inp" type="color" id="mo-color" value="#4f9eff"></div>`,
    video: `
      <div class="modal-row"><span class="modal-label">${tr.commonProps.name}</span><input class="modal-inp" id="mo-name" value="${interpolate(tr.video.defaultName, { id: _id })}"></div>
      <div class="modal-row"><span class="modal-label">${tr.video.url}</span><input class="modal-inp" id="mo-url" value="https://www.youtube.com/watch?v=sRzezc45xvk" style="width:100%"></div>
      ${mrowCV(tr.video.originX, 'mo-x', 0, varOptsBlank)}
      ${mrowCV(tr.video.originY, 'mo-y', 0, varOptsBlank)}
      ${mrowCV(tr.video.width, 'mo-w', 7, varOptsBlank)}
      ${mrowCV(tr.video.height, 'mo-h', 4, varOptsBlank)}
      <div class="modal-row"><span class="modal-label">${tr.video.embedHint}</span><span style="font-size:10px;color:var(--txt3)">YouTube, Vimeo, etc.</span></div>`,
  };

  const body = document.getElementById('modal-body');
  if (body) body.innerHTML = FORMS[type] || '';

  setTimeout(() => {
    const varList = sim.getAllVarNames();
    const trySet = (id: string, preferred: string[]) => {
      const varSel = document.getElementById(id + '-var') as HTMLSelectElement | null;
      const modeEl = document.getElementById(id + '-mode') as HTMLSelectElement | null;
      if (varSel && modeEl) {
        const found = preferred.find(p => varList.includes(p));
        if (found) { varSel.value = found; modeEl.value = 'var'; togglePivotField(id, 'var'); }
        return;
      }
      const el = document.getElementById(id) as HTMLSelectElement | null;
      if (!el || el.tagName !== 'SELECT') return;
      preferred.some(p => { if (varList.includes(p)) { el.value = p; return true; } return false; });
    };
    if (type === 'particle' || type === 'vector') {
      trySet('mo-x', ['x', 'px', 'rx']); trySet('mo-y', ['y', 'py', 'ry']);
      trySet('mo-vx', ['vx', 'vx0']); trySet('mo-vy', ['vy', 'vy0']);
    }
    if (type === 'pendulum') trySet('mo-theta', ['theta', 'angle', 'th']);
    if (type === 'spring') trySet('mo-x', ['x', 'pos', 'q']);
    if (type === 'circle') { trySet('mo-x', ['x']); trySet('mo-y', ['y']); trySet('mo-r', ['r']); }
    if (type === 'rect') { trySet('mo-x', ['x']); trySet('mo-y', ['y']); trySet('mo-w', ['w']); trySet('mo-h', ['h']); }
    ['mo-pivotX-var', 'mo-pivotY-var', 'mo-L-var'].forEach(sid => {
      const sel = document.getElementById(sid) as HTMLSelectElement | null;
      if (!sel) return;
      sel.innerHTML = '<option value="">—</option>' + varList.map((v: string) => `<option value="${v}">${v}</option>`).join('');
    });
  }, 50);

  document.getElementById('modal-add')?.classList.add('show');
}

export function togglePivotField(base: string, mode: string): void {
  const inp = document.getElementById(base) as HTMLInputElement | null;
  const sel = document.getElementById(base + '-var') as HTMLSelectElement | null;
  if (!inp || !sel) return;
  if (mode === 'var') { inp.style.display = 'none'; sel.style.display = ''; }
  else { inp.style.display = ''; sel.style.display = 'none'; }
}

function readPivotVal(base: string): string | number {
  const modeEl = document.getElementById(base + '-mode') as HTMLSelectElement | null;
  if (!modeEl) {
    const el = document.getElementById(base) as HTMLInputElement | null;
    return el ? (parseFloat(el.value) || 0) : 0;
  }
  if (modeEl.value === 'var') {
    const sel = document.getElementById(base + '-var') as HTMLSelectElement | null;
    return sel ? (sel.value || 0) : 0;
  }
  const inp = document.getElementById(base) as HTMLInputElement | null;
  return inp ? (parseFloat(inp.value) || 0) : 0;
}

export function confirmAddObject(anim: AnimRenderer, sim: SimEngine): void {
  const t = _pendingObjType; if (!t) return;
  const tr = getTranslations();
  const v = (id: string) => { const el = document.getElementById(id) as HTMLInputElement | null; return el ? el.value : undefined; };
  const n = (id: string) => { const el = document.getElementById(id) as HTMLInputElement | null; return el ? parseFloat(el.value) || 0 : 0; };
  const b = (id: string) => { const el = document.getElementById(id) as HTMLInputElement | null; return el ? el.checked : false; };

  const common = { name: v('mo-name') || undefined, color: v('mo-color') || undefined };

  const props: Record<string, any> = {
    particle: { ...common, x: readPivotVal('mo-x') || 0, y: readPivotVal('mo-y') || 0, vx: readPivotVal('mo-vx') || 0, vy: readPivotVal('mo-vy') || 0, radius: readPivotVal('mo-radius') || 8, rotation: readPivotVal('mo-rotation') || 0, showVec: b('mo-showvec'), showVecProj: b('mo-showvecproj'), vecColor: v('mo-veccolor') || undefined, projColor: v('mo-projcolor') || undefined, showTrail: b('mo-trail'), label: v('mo-label') || '' },
    pendulum: { ...common, theta: v('mo-theta') || 'theta', L: readPivotVal('mo-L') || 1.5, pivotX: readPivotVal('mo-pivotX'), pivotY: readPivotVal('mo-pivotY'), radius: readPivotVal('mo-radius') || 10, rotation: readPivotVal('mo-rotation') || 0, showTrail: b('mo-trail') },
    spring: { ...common, x: readPivotVal('mo-x') || 0, y: 0, x1: readPivotVal('mo-pivotX'), y1: readPivotVal('mo-pivotY'), pivotX: readPivotVal('mo-pivotX'), pivotY: readPivotVal('mo-pivotY'), coils: n('mo-coils') || 10, vertical: v('mo-vertical') || 'true' },
    vector: { ...common, x: readPivotVal('mo-x') || 0, y: readPivotVal('mo-y') || 0, vx: readPivotVal('mo-vx') || 0, vy: readPivotVal('mo-vy') || 0, scale: n('mo-scale') || 0.3, rotation: readPivotVal('mo-rotation') || 0, showProj: b('mo-showproj'), projColor: v('mo-projcolor') || undefined, label: v('mo-label') || '' },
    circle: { ...common, x: readPivotVal('mo-x') || 0, y: readPivotVal('mo-y') || 0, r: String(readPivotVal('mo-r') || 1), rotation: readPivotVal('mo-rotation') || 0 },
    rect: { ...common, x: readPivotVal('mo-x') || 0, y: readPivotVal('mo-y') || 0, w: String(readPivotVal('mo-w') || 1), h: String(readPivotVal('mo-h') || 1), rotation: readPivotVal('mo-rotation') || 0 },
    label: { ...common, x: readPivotVal('mo-x') || 0, y: readPivotVal('mo-y') || 3, rotation: readPivotVal('mo-rotation') || 0, text: v('mo-text') || 't = {t:2}', fontSize: n('mo-fontSize') || 13 },
    vectorfield: { ...common, fxExpr: v('mo-fxExpr') || '-y', fyExpr: v('mo-fyExpr') || 'x', gridN: n('mo-gridN') || 14, gridRange: n('mo-gridRange') || 5, arrowScale: n('mo-arrowScale') || 0.6 },
    video: { ...common, url: v('mo-url') || '', x: readPivotVal('mo-x') || 0, y: readPivotVal('mo-y') || 0, w: readPivotVal('mo-w') || 4, h: readPivotVal('mo-h') || 2.25, allowFullscreen: true },
  };

  if (t === 'video') {
    const embedUrl = toEmbedVideoUrl(String(props.video.url || ''));
    if (!embedUrl) {
      toast(tr.messages.invalidVideoUrl);
      return;
    }
    props.video.embedUrl = embedUrl;
    props.video.url = String(props.video.url).trim();
  }

  const obj = makeObj(t, props[t] || common);
  anim.objects.push(obj);
  renderObjList(anim);
  closeModal('modal-add');
  if (selectedObj) selectedObj._selected = false;
  selectedObj = obj; obj._selected = true;
  renderObjList(anim);
  renderObjProps(obj, sim, anim);
  toast(interpolate(tr.messages.objectAdded, { name: obj.name }));
}

// --- Object Properties Panel -------
export function renderObjProps(obj: any, sim: SimEngine, anim: AnimRenderer): void {
  const el = document.getElementById('obj-props');
  if (!el) return;
  const tr = getTranslations();
  if (!obj) {
    el.innerHTML = `<div class="no-obj">${tr.panels.noProps}<br>${tr.panels.noPropsDesc}</div>`;
    return;
  }

  const vars: string[] = sim.getAllVarNames();
  const vOptsBl = '<option value="">—</option>' + vars.map(v => `<option value="${v}">${v}</option>`).join('');
  const rotUnit = (window as any).__angleUnit === 'deg' ? '°' : 'rad';
  const rotLabel = `${tr.pendulum.rotation.replace(/ [°rad]+$/, '')} (${rotUnit})`;

  function row(label: string, propKey: string, value: any, type = 'text'): string {
    const isVarSel = type === 'varsel';
    const isTrailMode = type === 'trailmode';
    const inp = isVarSel
      ? `<select class="prop-val" data-prop="${propKey}" onchange="window.__updateObjProp(${obj.id},this.getAttribute('data-prop'),this.value)">${vOptsBl.replace(`value="${value}"`, `value="${value}" selected`)}</select>`
      : isTrailMode
      ? `<select class="prop-val" data-prop="${propKey}" onchange="window.__updateObjProp(${obj.id},this.getAttribute('data-prop'),this.value)">
          <option value="persist"${value === 'persist' ? ' selected' : ''}>${tr.trailMode.persistent}</option>
          <option value="fade"${value === 'fade' ? ' selected' : ''}>${tr.trailMode.temporary}</option>
          <option value="dots"${value === 'dots' ? ' selected' : ''}>${tr.trailMode.ghosts}</option>
          <option value="none"${value === 'none' ? ' selected' : ''}>${tr.trailMode.none}</option>
        </select>`
      : type === 'color'
      ? `<input type="color" class="prop-color" value="${value || '#4f9eff'}" data-prop="${propKey}" onchange="window.__updateObjProp(${obj.id},this.getAttribute('data-prop'),this.value)">`
      : type === 'checkbox'
      ? `<input type="checkbox" class="prop-check" ${value ? 'checked' : ''} data-prop="${propKey}" onchange="window.__updateObjProp(${obj.id},this.getAttribute('data-prop'),this.checked)">`
      : `<input class="prop-val" type="${type === 'number' ? 'number' : 'text'}" value="${value ?? ''}" step="any" data-prop="${propKey}" onchange="window.__updateObjProp(${obj.id},this.getAttribute('data-prop'),this.value)" onkeydown="if(event.key==='Enter')this.blur()">`;
    return `<div class="prop-row"><span class="prop-label">${label}</span>${inp}</div>`;
  }

  function rowVarOrConst(label: string, propKey: string, value: any, varList: string[], objId: number): string {
    const isVar = typeof value === 'string' && value !== '' && isNaN(Number(value));
    const numVal = isVar ? '' : (value ?? 0);
    const varOpts = varList.map(v => `<option value="${v}"${v === value ? ' selected' : ''}>${v}</option>`).join('');
    return `<div class="prop-row">
      <span class="prop-label">${label}</span>
      <select style="background:var(--bg);border:1px solid var(--border);border-radius:3px;color:var(--txt2);font-size:10px;padding:2px 4px;width:68px;flex-shrink:0"
        onchange="(function(sel){var wrap=sel.closest('.prop-row');wrap.querySelector('.pvc-num').style.display=sel.value==='var'?'none':'';wrap.querySelector('.pvc-var').style.display=sel.value==='var'?'':'none';})(this)">
        <option value="const"${!isVar ? ' selected' : ''}>${tr.spring.constant}</option>
        <option value="var"${isVar ? ' selected' : ''}>${tr.spring.variable}</option>
      </select>
      <input class="prop-val pvc-num" type="number" step="any" value="${numVal}" style="${isVar ? 'display:none;' : ''}flex:1"
        data-prop="${propKey}" onchange="window.__updateObjProp(${objId},this.getAttribute('data-prop'),parseFloat(this.value)||0)" onkeydown="if(event.key==='Enter')this.blur()">
      <select class="prop-val pvc-var" data-prop="${propKey}" style="${isVar ? '' : 'display:none;'}flex:1"
        onchange="window.__updateObjProp(${objId},this.getAttribute('data-prop'),this.value)">
        <option value="">—</option>${varOpts}
      </select>
    </div>`;
  }

  const PROPS: Record<string, string> = {
    particle: `
      <div class="prop-section"><div class="prop-title">${tr.commonProps.identity}</div>
        ${row(tr.commonProps.name, 'name', obj.name)}
        ${row(tr.commonProps.color, 'color', obj.color, 'color')}
        ${rowVarOrConst(tr.particle.radius, 'radius', obj.radius ?? 8, vars, obj.id)}
        ${rowVarOrConst(rotLabel, 'rotation', obj.rotation ?? 0, vars, obj.id)}
      </div>
      <div class="prop-section"><div class="prop-title">${tr.particle.position}</div>
        ${rowVarOrConst('X ←→', 'x', obj.x, vars, obj.id)}
        ${rowVarOrConst('Y ↕', 'y', obj.y, vars, obj.id)}
        <div class="prop-row"><span class="prop-label" style="font-size:10px;color:var(--txt3)">${tr.particle.visualOffset}</span><button class="pico" onclick="window.__resetObjOffset(${obj.id})" style="font-size:10px">↺ ${tr.commonProps.reset}</button></div>
      </div>
      <div class="prop-section"><div class="prop-title">${tr.particle.velocityVector}</div>
        ${row(tr.particle.showVelocity, 'showVec', obj.showVec, 'checkbox')}
        ${row(tr.particle.projections, 'showVecProj', obj.showVecProj !== false, 'checkbox')}
        ${rowVarOrConst(tr.vector.componentVx, 'vx', obj.vx, vars, obj.id)}
        ${rowVarOrConst(tr.vector.componentVy, 'vy', obj.vy, vars, obj.id)}
        ${row(tr.particle.scale, 'vecScale', obj.vecScale, 'number')}
        ${row(tr.particle.vectorColor, 'vecColor', obj.vecColor, 'color')}
        ${row(tr.particle.projectionColor, 'projColor', obj.projColor, 'color')}
        ${row(tr.particle.vectorLabel, 'vecLabel', obj.vecLabel)}
        ${row(tr.particle.projectionXLabel, 'projXLabel', obj.projXLabel)}
        ${row(tr.particle.projectionYLabel, 'projYLabel', obj.projYLabel)}
        ${row(tr.particle.magnitudeLabel, 'magLabel', obj.magLabel)}
        <div class="prop-section" style="font-size:10px;color:var(--txt3)">${tr.particle.interpolationHint}</div>
      </div>
      <div class="prop-section"><div class="prop-title">${tr.particle.trail}</div>
        ${row(tr.commonProps.show, 'showTrail', obj.showTrail, 'checkbox')}
        ${row(tr.commonProps.mode, 'trailMode', obj.trailMode || 'persist', 'trailmode')}
        ${row(tr.particle.vectorLength, 'trailLen', obj.trailLen, 'number')}
        ${row(tr.particle.label, 'label', obj.label)}
      </div>
      <div class="prop-section"><div class="prop-title">${tr.particle.image}</div>
        ${row(tr.particle.useImage, 'useImage', obj.useImage, 'checkbox')}
        <div class="prop-row"><span class="prop-label" style="font-size:10px;color:var(--txt3)">${tr.particle.imageFormat}</span><button class="pico" onclick="window.__loadObjImage(${obj.id})" style="font-size:10px">📁 ${tr.particle.loadImage}</button>${obj.imageData ? '<span style="color:#34d399;font-size:10px;margin-left:4px">✓</span>' : ''}</div>
      </div>`,
    pendulum: `
      <div class="prop-section"><div class="prop-title">${tr.commonProps.identity}</div>
        ${row(tr.commonProps.name, 'name', obj.name)}
        ${row(tr.pendulum.bobColor, 'color', obj.color, 'color')}
        ${row(tr.pendulum.rodColor, 'rodColor', obj.rodColor, 'color')}
        ${rowVarOrConst(tr.pendulum.bobRadius, 'radius', obj.radius ?? 10, vars, obj.id)}
        ${rowVarOrConst(rotLabel, 'rotation', obj.rotation ?? 0, vars, obj.id)}
      </div>
      <div class="prop-section"><div class="prop-title">${tr.commonProps.physics}</div>
        ${row(tr.pendulum.angle, 'theta', obj.theta, 'varsel')}
        ${rowVarOrConst(tr.pendulum.length, 'L', obj.L, vars, obj.id)}
        ${rowVarOrConst(tr.pendulum.pivotX, 'pivotX', obj.pivotX, vars, obj.id)}
        ${rowVarOrConst(tr.pendulum.pivotY, 'pivotY', obj.pivotY, vars, obj.id)}
        <div class="prop-row"><span class="prop-label" style="font-size:10px;color:var(--txt3)">${tr.particle.visualOffset}</span><button class="pico" onclick="window.__resetObjOffset(${obj.id})" style="font-size:10px">↺ ${tr.commonProps.reset}</button></div>
      </div>
      <div class="prop-section"><div class="prop-title">${tr.particle.trail}</div>
        ${row(tr.commonProps.show, 'showTrail', obj.showTrail, 'checkbox')}
        ${row(tr.commonProps.mode, 'trailMode', obj.trailMode || 'persist', 'trailmode')}
        ${row(tr.particle.vectorLength, 'trailLen', obj.trailLen, 'number')}
      </div>`,
    spring: `
      <div class="prop-section"><div class="prop-title">${tr.commonProps.identity}</div>
        ${row(tr.commonProps.name, 'name', obj.name)}
        ${row(tr.commonProps.color, 'color', obj.color, 'color')}
        <div class="prop-row"><span class="prop-label" style="font-size:10px;color:var(--txt3)">${tr.particle.visualOffset}</span><button class="pico" onclick="window.__resetObjOffset(${obj.id})" style="font-size:10px">↺ ${tr.commonProps.reset}</button></div>
      </div>
      <div class="prop-section"><div class="prop-title">${tr.commonProps.configuration}</div>
        <div class="prop-row"><span class="prop-label">${tr.spring.orientation}</span><select class="prop-val" data-prop="vertical" onchange="window.__updateObjProp(${obj.id},this.getAttribute('data-prop'),this.value)"><option value="true"${(obj.vertical === true || obj.vertical === 'true') ? ' selected' : ''}>${tr.spring.vertical}</option><option value="false"${(obj.vertical === false || obj.vertical === 'false') ? ' selected' : ''}>${tr.spring.horizontal}</option></select></div>
        ${row(tr.spring.blockPos, 'x', obj.x, 'varsel')}
        ${rowVarOrConst(tr.spring.pivotX, 'pivotX', obj.pivotX !== undefined ? obj.pivotX : obj.x1, vars, obj.id)}
        ${rowVarOrConst(tr.spring.pivotY, 'pivotY', obj.pivotY !== undefined ? obj.pivotY : obj.y1, vars, obj.id)}
        ${row(tr.spring.coils, 'coils', obj.coils, 'number')}
      </div>`,
    vector: `
      <div class="prop-section"><div class="prop-title">${tr.commonProps.identity}</div>
        ${row(tr.commonProps.name, 'name', obj.name)}
        ${row(tr.commonProps.color, 'color', obj.color, 'color')}
        ${row(tr.vector.thickness, 'lineWidth', obj.lineWidth, 'number')}
        ${rowVarOrConst(rotLabel, 'rotation', obj.rotation ?? 0, vars, obj.id)}
        ${row(tr.vector.projections, 'showProj', obj.showProj, 'checkbox')}
        ${row(tr.vector.projectionColor, 'projColor', obj.projColor, 'color')}
        <div class="prop-row"><span class="prop-label" style="font-size:10px;color:var(--txt3)">${tr.particle.visualOffset}</span><button class="pico" onclick="window.__resetObjOffset(${obj.id})" style="font-size:10px">↺ ${tr.commonProps.reset}</button></div>
      </div>
      <div class="prop-section"><div class="prop-title">${tr.particle.position}</div>
        ${rowVarOrConst(tr.vector.originX, 'x', obj.x, vars, obj.id)}
        ${rowVarOrConst(tr.vector.originY, 'y', obj.y, vars, obj.id)}
      </div>
      <div class="prop-section"><div class="prop-title">${tr.vector.components}</div>
        ${rowVarOrConst(tr.vector.componentVx, 'vx', obj.vx, vars, obj.id)}
        ${rowVarOrConst(tr.vector.componentVy, 'vy', obj.vy, vars, obj.id)}
        ${row(tr.vector.scale, 'scale', obj.scale, 'number')}
        ${row(tr.vector.vectorLabel, 'vecLabel', obj.vecLabel)}
        ${row(tr.vector.projectionXLabel, 'projXLabel', obj.projXLabel)}
        ${row(tr.vector.projectionYLabel, 'projYLabel', obj.projYLabel)}
        ${row(tr.vector.magnitudeLabel, 'magLabel', obj.magLabel)}
        <div class="prop-section" style="font-size:10px;color:var(--txt3)">${tr.vector.interpolationHint}</div>
      </div>`,
    circle: `
      <div class="prop-section"><div class="prop-title">${tr.commonProps.identity}</div>
        ${row(tr.commonProps.name, 'name', obj.name)}
        ${row(tr.circle.borderColor, 'color', obj.color, 'color')}
        ${row(tr.circle.fillColor, 'fillColor', obj.fillColor, 'color')}
        ${rowVarOrConst(rotLabel, 'rotation', obj.rotation ?? 0, vars, obj.id)}
        <div class="prop-row"><span class="prop-label" style="font-size:10px;color:var(--txt3)">${tr.particle.visualOffset}</span><button class="pico" onclick="window.__resetObjOffset(${obj.id})" style="font-size:10px">↺ ${tr.commonProps.reset}</button></div>
      </div>
      <div class="prop-section"><div class="prop-title">${tr.commonProps.geometry}</div>
        ${rowVarOrConst(tr.circle.centerX, 'x', obj.x, vars, obj.id)}
        ${rowVarOrConst(tr.circle.centerY, 'y', obj.y, vars, obj.id)}
        ${rowVarOrConst(tr.circle.radiusPixel, 'r', obj.r, vars, obj.id)}
      </div>
      <div class="prop-section"><div class="prop-title">${tr.particle.image}</div>
        ${row(tr.particle.useImage, 'useImage', obj.useImage, 'checkbox')}
        <div class="prop-row"><span class="prop-label" style="font-size:10px;color:var(--txt3)">${tr.particle.imageFormat}</span><button class="pico" onclick="window.__loadObjImage(${obj.id})" style="font-size:10px">📁 ${tr.particle.loadImage}</button>${obj.imageData ? '<span style="color:#34d399;font-size:10px;margin-left:4px">✓</span>' : ''}</div>
      </div>`,
    rect: `
      <div class="prop-section"><div class="prop-title">${tr.commonProps.identity}</div>
        ${row(tr.commonProps.name, 'name', obj.name)}
        ${row(tr.circle.borderColor, 'color', obj.color, 'color')}
        ${row(tr.circle.fillColor, 'fillColor', obj.fillColor, 'color')}
        ${rowVarOrConst(rotLabel, 'rotation', obj.rotation ?? 0, vars, obj.id)}
        <div class="prop-row"><span class="prop-label" style="font-size:10px;color:var(--txt3)">${tr.particle.visualOffset}</span><button class="pico" onclick="window.__resetObjOffset(${obj.id})" style="font-size:10px">↺ ${tr.commonProps.reset}</button></div>
      </div>
      <div class="prop-section"><div class="prop-title">${tr.commonProps.geometry}</div>
        ${rowVarOrConst(tr.circle.centerX, 'x', obj.x, vars, obj.id)}
        ${rowVarOrConst(tr.circle.centerY, 'y', obj.y, vars, obj.id)}
        ${rowVarOrConst(tr.rectangle.width, 'w', obj.w, vars, obj.id)}
        ${rowVarOrConst(tr.rectangle.height, 'h', obj.h, vars, obj.id)}
      </div>
      <div class="prop-section"><div class="prop-title">${tr.particle.image}</div>
        ${row(tr.particle.useImage, 'useImage', obj.useImage, 'checkbox')}
        <div class="prop-row"><span class="prop-label" style="font-size:10px;color:var(--txt3)">${tr.particle.imageFormat}</span><button class="pico" onclick="window.__loadObjImage(${obj.id})" style="font-size:10px">📁 ${tr.particle.loadImage}</button>${obj.imageData ? '<span style="color:#34d399;font-size:10px;margin-left:4px">✓</span>' : ''}</div>
      </div>`,
    label: `
      <div class="prop-section"><div class="prop-title">${tr.commonProps.identity}</div>
        ${row(tr.commonProps.name, 'name', obj.name)}
        ${row(tr.commonProps.color, 'color', obj.color, 'color')}
        ${row(tr.textLabel.size, 'fontSize', obj.fontSize, 'number')}
        ${rowVarOrConst(rotLabel, 'rotation', obj.rotation ?? 0, vars, obj.id)}
        <div class="prop-row"><span class="prop-label" style="font-size:10px;color:var(--txt3)">${tr.particle.visualOffset}</span><button class="pico" onclick="window.__resetObjOffset(${obj.id})" style="font-size:10px">↺ ${tr.commonProps.reset}</button></div>
      </div>
      <div class="prop-section"><div class="prop-title">${tr.commonProps.content}</div>
        ${row(tr.textLabel.text, 'text', obj.text)}
        ${rowVarOrConst(tr.textLabel.posX, 'x', obj.x ?? 0, vars, obj.id)}
        ${rowVarOrConst(tr.textLabel.posY, 'y', obj.y ?? 3, vars, obj.id)}
      </div>
      <div class="prop-section" style="font-size:10px;color:var(--txt3)">${tr.textLabel.interpolationHint}</div>`,
    vectorfield: `
      <div class="prop-section"><div class="prop-title">${tr.field.fieldType}</div>
        ${row(tr.commonProps.name, 'name', obj.name)}
        ${row('Fx(x,y,t)', 'fxExpr', obj.fxExpr || '-y')}
        ${row('Fy(x,y,t)', 'fyExpr', obj.fyExpr || 'x')}
        ${row(tr.field.range, 'gridRange', obj.gridRange || 5, 'number')}
      </div>
      <div class="prop-section"><div class="prop-title">${tr.field.zAxisColor}</div>
        ${row('Fz(x,y,t)', 'fzExpr', obj.fzExpr || '')}
        <div class="prop-row" style="font-size:10px;color:var(--txt3);flex-direction:column;align-items:flex-start;gap:3px">
          <span>${tr.field.zExprHint}</span>
          <div style="display:flex;align-items:center;gap:4px;margin-top:2px">
            <div style="width:60px;height:8px;border-radius:3px;background:linear-gradient(to right,#4488ff,#ffffff,#ff4444)"></div>
            <span>${tr.field.zScaleHint}</span>
          </div>
          <span style="margin-top:2px">${tr.field.zExample}</span>
        </div>
        ${obj.fzExpr ? '' : row(tr.field.baseColor, 'color', obj.color || '#4f9eff', 'color')}
      </div>
      <div class="prop-section"><div class="prop-title">${tr.field.viewMode}</div>
        <div class="prop-row"><span class="prop-label">${tr.commonProps.mode}</span>
          <select class="prop-val" data-prop="vfMode"
            onchange="window.__updateObjProp(${obj.id},this.getAttribute('data-prop'),this.value)">
            <option value="arrows"${(obj.vfMode||'arrows')==='arrows' ? ' selected' : ''}>⊞ ${tr.field.vectorsMode}</option>
            <option value="fieldlines"${obj.vfMode==='fieldlines' ? ' selected' : ''}>〰 ${tr.field.fieldLinesMode}</option>
          </select>
        </div>
        ${(obj.vfMode||'arrows')==='arrows' ? `
        ${row(tr.field.gridN, 'gridN', obj.gridN || 14, 'number')}
        ${row(tr.field.arrowScale, 'arrowScale', obj.arrowScale || 0.6, 'number')}
        ` : `
        ${row(tr.field.seeds, 'fieldSeeds', obj.fieldSeeds || 16, 'number')}
        ${row(tr.field.steps, 'fieldSteps', obj.fieldSteps || 120, 'number')}
        ${row(tr.field.stepSize, 'fieldDs', obj.fieldDs || 0.08, 'number')}
        ${row(tr.field.lineThickness, 'lineWidth', obj.lineWidth || 1.2, 'number')}
        `}
      </div>`,
    video: `
      <div class="prop-section"><div class="prop-title">${tr.commonProps.identity}</div>
        ${row(tr.commonProps.name, 'name', obj.name)}
        ${row(tr.video.url, 'url', obj.url || obj.embedUrl || '')}
        ${row(tr.video.allowFullscreen, 'allowFullscreen', obj.allowFullscreen !== false, 'checkbox')}
      </div>
      <div class="prop-section"><div class="prop-title">${tr.commonProps.geometry}</div>
        ${rowVarOrConst(tr.video.originX, 'x', obj.x, vars, obj.id)}
        ${rowVarOrConst(tr.video.originY, 'y', obj.y, vars, obj.id)}
        ${rowVarOrConst(tr.video.width, 'w', obj.w, vars, obj.id)}
        ${rowVarOrConst(tr.video.height, 'h', obj.h, vars, obj.id)}
      </div>
      <div class="prop-section" style="font-size:10px;color:var(--txt3)">${tr.video.embedHint}</div>`,
  };

  el.innerHTML = PROPS[obj.type] || `<div class="no-obj">${tr.commonProps.type}: ${obj.type}</div>`;
}

// --- Update property -------
export function updateObjProp(id: number, prop: string, value: any, anim: AnimRenderer): void {
  const o = anim.objects.find((o: any) => o.id === id);
  if (!o) return;
  const tr = getTranslations();

  if (o.type === 'video' && prop === 'url') {
    const normalized = toEmbedVideoUrl(String(value || ''));
    if (!normalized) {
      toast(tr.messages.invalidVideoUrl);
      const sim2 = (window as any).__sim;
      const anim2 = (window as any).anim;
      if (sim2 && anim2) renderObjProps(o, sim2, anim2);
      return;
    }
    o.url = String(value).trim();
    o.embedUrl = normalized;
    const sim2 = (window as any).__sim;
    const anim2 = (window as any).anim;
    if (sim2 && anim2) renderObjProps(o, sim2, anim2);
    return;
  }

  const numProps = new Set(['trailLen', 'vecScale', 'scale', 'lineWidth', 'fontSize', 'coils', 'fieldSeeds', 'fieldSteps', 'fieldDs']);
  const varOrNumProps = new Set(['pivotX', 'pivotY', 'L', 'x1', 'y1', 'x', 'y', 'vx', 'vy', 'r', 'w', 'h', 'radius', 'rotation']);
  const boolProps = new Set(['showVec', 'showVecProj', 'showProj', 'showTrail', 'useImage', 'visible', 'allowFullscreen']);
  const strProps = new Set(['trailMode', 'color', 'trailColor', 'vecColor', 'projColor', 'rodColor', 'fillColor', 'fxExpr', 'fyExpr', 'fzExpr', 'text', 'label', 'vecLabel', 'projXLabel', 'projYLabel', 'magLabel', 'theta', 'vfMode', 'url', 'embedUrl']);

  if (numProps.has(prop)) {
    o[prop] = parseFloat(value) || 0;
  } else if (varOrNumProps.has(prop)) {
    if (typeof value === 'string' && value.trim() !== '' && isNaN(Number(value.trim()))) {
      o[prop] = value.trim();
    } else {
      const num = parseFloat(value);
      o[prop] = isNaN(num) ? 0 : num;
    }
  } else if (boolProps.has(prop)) {
    o[prop] = (value === true || value === 'true' || value === 1);
  } else if (strProps.has(prop)) {
    o[prop] = value;
    if (prop === 'vecLabel' && o.type === 'vector') o.label = value;
  } else if (prop === 'name') {
    o.name = value;
  } else {
    o[prop] = value;
  }

  if (prop === 'x' || prop === 'y' || prop === 'theta') o._trail = [];
  // Ao trocar modo do campo vetorial, re-renderiza painel para mostrar props corretas
  if (prop === 'vfMode' || prop === 'fzExpr') {
    const sim = (window as any).__sim;
    const anim2 = (window as any).anim;
    if (sim && anim2) renderObjProps(o, sim, anim2);
  }
}
