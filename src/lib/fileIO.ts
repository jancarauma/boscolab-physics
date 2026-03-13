import type { SimEngine } from './SimEngine';
import type { AnimRenderer } from './AnimRenderer';
import type { GraphRenderer } from './GraphRenderer';
import { makeObj } from './objects';
import { toast, closeMenus } from './uiHelpers';
import { getEditorText, setEditorText, applyModel, setEditorIndVar } from './modelEditor';
import { getICValues, rebuildICPanel } from './icPanel';

import { applyTheme } from './theme';
import { getPrec, setPrec } from './formatVal';
import { getLocale, setLocale, type Locale, t, interpolate } from './i18n';

type RebuildCb = () => void;

type SavedGraph = {
  id: number;
  xvar: string;
  yvar: string;
  yvar2: string;
  autoScale?: boolean;
  data?: number[][];
  data2?: number[][];
  xmin?: number;
  xmax?: number;
  ymin?: number;
  ymax?: number;
};

type SavedUiState = {
  layout?: Record<string, any>;
  theme?: string;
  precision?: { format?: string; decimals?: number };
  locale?: Locale;
  activeTab?: number;
  showGrid?: boolean;
  showAxes?: boolean;
  camera?: { ox?: number; oy?: number; scale?: number };
  trailMode?: string;
  varListHeight?: number;
};

type SavedSimState = {
  t?: number;
  n?: number;
  status?: string;
  state?: Record<string, number>;
  initState?: Record<string, number>;
  history?: Array<Record<string, number>>;
};

type SavedProject = {
  version: string;
  model: {
    equations: string;
    method: string;
    dt: number;
    tmax: number;
    indVar: string;
    speedFactor: number;
  };
  initialConditions: Record<string, number>;
  objects: any[];
  graphs: SavedGraph[];
  ui: SavedUiState;
  sim?: SavedSimState;
};

const USER_INTERNAL_OBJECT_KEYS = new Set(['_vox', '_voy']);

function toFiniteNumber(value: any, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toFiniteOrUndefined(value: any): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function toBoolOrUndefined(value: any): boolean | undefined {
  if (value === true || value === false) return value;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (v === 'true') return true;
    if (v === 'false') return false;
  }
  return undefined;
}

function encodeCData(text: string): string {
  return text.replace(/]]>/g, ']]&gt;');
}

function readLegacyObjectProps(oel: Element): Record<string, any> {
  const props: Record<string, any> = {};
  oel.querySelectorAll('prop').forEach(p => {
    const k = p.getAttribute('k');
    if (!k) return;
    if (p.hasAttribute('json')) {
      try {
        props[k] = JSON.parse(p.getAttribute('json') ?? 'null');
        return;
      } catch (_) {
        // Fall through to legacy attr parsing.
      }
    }
    const raw = p.getAttribute('v') ?? '';
    const boolV = toBoolOrUndefined(raw);
    if (boolV !== undefined) {
      props[k] = boolV;
      return;
    }
    const n = Number(raw);
    props[k] = Number.isFinite(n) ? n : raw;
  });
  const imgEl = oel.querySelector('imageData');
  if (imgEl) props.imageData = imgEl.textContent?.trim() ?? '';
  return props;
}

function applyProject(
  project: SavedProject,
  sim: SimEngine,
  anim: AnimRenderer,
  graphs: GraphRenderer[],
  onRebuild: RebuildCb,
): void {
  const model = project.model ?? ({} as SavedProject['model']);
  setEditorText(model.equations ?? '');

  sim.method = model.method || 'rk4';
  const methodSel = document.getElementById('sel-method') as HTMLSelectElement | null;
  if (methodSel) methodSel.value = sim.method;

  sim.dt = toFiniteNumber(model.dt, 0.01);
  const dtInput = document.getElementById('inp-dt') as HTMLInputElement | null;
  if (dtInput) dtInput.value = String(sim.dt);

  sim.tMax = toFiniteNumber(model.tmax, 10);
  const tmaxInput = document.getElementById('inp-tmax') as HTMLInputElement | null;
  if (tmaxInput) tmaxInput.value = String(sim.tMax);

  sim.speedFactor = toFiniteNumber(model.speedFactor, 1);
  const speedSel = document.getElementById('sel-speed') as HTMLSelectElement | null;
  if (speedSel) speedSel.value = String(sim.speedFactor);

  sim.setIndependentVariable((model.indVar || 't').trim() || 't');
  setEditorIndVar(sim.indVar);
  const indVarInput = document.getElementById('inp-ind-var') as HTMLInputElement | null;
  if (indVarInput) indVarInput.value = sim.indVar;

  applyModel(sim, () => {}, true);

  const icSource = project.initialConditions ?? project.sim?.initState ?? {};
  const ic: Record<string, number> = {};
  Object.entries(icSource).forEach(([k, v]) => {
    const n = Number(v);
    if (Number.isFinite(n)) ic[k] = n;
  });
  if (sim.parsed) Object.entries(sim.parsed.constVars).forEach(([k, v]) => { ic[k] = v as number; });
  sim.setIC(ic);
  rebuildICPanel(sim);

  anim.objects = [];
  (project.objects ?? []).forEach(obj => {
    if (!obj || typeof obj !== 'object') return;
    const type = String((obj as any).type ?? '').trim();
    if (!type) return;
    const props = { ...(obj as any) };
    delete (props as any).type;
    anim.objects.push(makeObj(type, props));
  });

  (project.graphs ?? []).forEach(g => {
    const i = toFiniteNumber(g.id, -1);
    if (i < 0 || !graphs[i]) return;
    graphs[i].xvar = g.xvar || 't';
    graphs[i].yvar = g.yvar || '';
    graphs[i].yvar2 = g.yvar2 || '';
    if (typeof g.autoScale === 'boolean') graphs[i].autoScale = g.autoScale;
    if (Array.isArray(g.data)) graphs[i].data = g.data;
    if (Array.isArray(g.data2)) graphs[i].data2 = g.data2;
    const xmin = toFiniteOrUndefined(g.xmin);
    const xmax = toFiniteOrUndefined(g.xmax);
    const ymin = toFiniteOrUndefined(g.ymin);
    const ymax = toFiniteOrUndefined(g.ymax);
    if (xmin !== undefined) graphs[i].xmin = xmin;
    if (xmax !== undefined) graphs[i].xmax = xmax;
    if (ymin !== undefined) graphs[i].ymin = ymin;
    if (ymax !== undefined) graphs[i].ymax = ymax;
  });

  const ui = project.ui ?? {};
  if (typeof ui.showGrid === 'boolean') anim.showGrid = ui.showGrid;
  if (typeof ui.showAxes === 'boolean') anim.showAxes = ui.showAxes;
  if (ui.camera) {
    const ox = toFiniteOrUndefined(ui.camera.ox);
    const oy = toFiniteOrUndefined(ui.camera.oy);
    const scale = toFiniteOrUndefined(ui.camera.scale);
    if (ox !== undefined) anim.ox = ox;
    if (oy !== undefined) anim.oy = oy;
    if (scale !== undefined) anim.scale = scale;
  }

  if (ui.layout && typeof (window as any).mdiApplyLayout === 'function') {
    try { (window as any).mdiApplyLayout(ui.layout); } catch (_) {}
  }
  if (ui.theme) applyTheme(ui.theme);
  if (ui.precision) {
    const fmt = ui.precision.format ?? 'fixed';
    const dec = toFiniteNumber(ui.precision.decimals, 3);
    setPrec(fmt, dec);
  }
  if (ui.locale) setLocale(ui.locale);
  if (typeof ui.activeTab === 'number') {
    (window as any).__activeTab = ui.activeTab;
    (window as any).activeTab = ui.activeTab;
    if (typeof (window as any).selTab === 'function') (window as any).selTab(ui.activeTab);
  }
  if (ui.trailMode) {
    const trailSel = document.getElementById('sel-trail-mode') as HTMLSelectElement | null;
    if (trailSel) trailSel.value = ui.trailMode;
  }
  if (typeof ui.varListHeight === 'number' && Number.isFinite(ui.varListHeight)) {
    const vl = document.getElementById('varlist') as HTMLElement | null;
    if (vl) {
      vl.style.maxHeight = `${ui.varListHeight}px`;
      vl.style.height = `${ui.varListHeight}px`;
    }
  }

  const savedSim = project.sim;
  if (savedSim) {
    const sanitizedInit: Record<string, number> = {};
    Object.entries(savedSim.initState ?? {}).forEach(([k, v]) => {
      const n = Number(v);
      if (Number.isFinite(n)) sanitizedInit[k] = n;
    });
    if (Object.keys(sanitizedInit).length) sim.initState = { ...sanitizedInit };

    const sanitizedState: Record<string, number> = {};
    Object.entries(savedSim.state ?? {}).forEach(([k, v]) => {
      const n = Number(v);
      if (Number.isFinite(n)) sanitizedState[k] = n;
    });
    if (Object.keys(sanitizedState).length) sim.state = { ...sanitizedState };

    if (Array.isArray(savedSim.history) && savedSim.history.length) {
      sim.history = savedSim.history
        .map(entry => {
          const clean: Record<string, number> = {};
          Object.entries(entry).forEach(([k, v]) => {
            const n = Number(v);
            if (Number.isFinite(n)) clean[k] = n;
          });
          return clean;
        })
        .filter(entry => Object.keys(entry).length > 0);
    }

    sim.t = toFiniteNumber(savedSim.t, sim.t);
    sim.n = Math.max(0, Math.floor(toFiniteNumber(savedSim.n, sim.n)));
    if (!Object.keys(sim.state).length && sim.history.length) sim.state = { ...sim.history[sim.history.length - 1] };
    if (Object.keys(sim.state).length) sim._syncStateTime(sim.state, sim.t);

    sim.running = false;
    sim.status = (savedSim.status === 'running') ? 'paused' : (savedSim.status || sim.status);
    sim.onStatus?.(sim.status);

    // If graph data was not persisted, reconstruct from history.
    const hasGraphData = graphs.some(g => g.data.length || g.data2.length);
    if (!hasGraphData && sim.history.length) {
      graphs.forEach(g => g.clear());
      sim.history.forEach(h => graphs.forEach(g => g.append(h as Record<string, number>)));
    }

    anim.clearTrails();
    sim.history.forEach(h => anim.sampleTrails(h as Record<string, number>));
  }

  onRebuild();
}

function parseLegacyProject(doc: Document): SavedProject | null {
  const eqs = doc.querySelector('equations');
  if (!eqs) return null;

  const model = {
    equations: eqs.textContent?.trim() ?? '',
    method: doc.querySelector('method')?.textContent ?? 'rk4',
    dt: parseFloat(doc.querySelector('dt')?.textContent ?? '0.01') || 0.01,
    tmax: parseFloat(doc.querySelector('tmax')?.textContent ?? '10') || 10,
    indVar: doc.querySelector('indVar')?.textContent?.trim() || 't',
    speedFactor: parseFloat(doc.querySelector('speedFactor')?.textContent ?? '1') || 1,
  };

  const initialConditions: Record<string, number> = {};
  doc.querySelectorAll('initial-conditions variable').forEach(el => {
    const key = el.getAttribute('name') || '';
    if (!key) return;
    const n = parseFloat(el.getAttribute('value') ?? '0');
    initialConditions[key] = Number.isFinite(n) ? n : 0;
  });

  const objects: any[] = [];
  doc.querySelectorAll('objects object').forEach(oel => {
    const type = oel.getAttribute('type') || '';
    if (!type) return;
    const id = parseInt(oel.getAttribute('id') ?? '0', 10);
    const props = readLegacyObjectProps(oel);
    objects.push({ id, type, ...props });
  });

  const graphs: SavedGraph[] = [];
  doc.querySelectorAll('graph').forEach(gel => {
    graphs.push({
      id: parseInt(gel.getAttribute('id') ?? '0', 10),
      xvar: gel.getAttribute('xvar') || 't',
      yvar: gel.getAttribute('yvar') || '',
      yvar2: gel.getAttribute('yvar2') || '',
    });
  });

  const ui: SavedUiState = {};
  const layoutText = doc.querySelector('ui layout')?.textContent?.trim();
  if (layoutText) {
    try { ui.layout = JSON.parse(layoutText); } catch (_) {}
  }
  ui.theme = doc.querySelector('ui theme')?.textContent?.trim() ?? 'dark';
  const precEl = doc.querySelector('ui precision');
  if (precEl) {
    ui.precision = {
      format: precEl.getAttribute('format') ?? 'fixed',
      decimals: parseInt(precEl.getAttribute('decimals') ?? '3', 10),
    };
  }
  const localeText = doc.querySelector('ui locale')?.textContent?.trim() as Locale | undefined;
  if (localeText) ui.locale = localeText;

  return {
    version: doc.querySelector('modellus-web')?.getAttribute('version') || 'legacy',
    model,
    initialConditions,
    objects,
    graphs,
    ui,
  };
}

// ── Save ────────────────────────────────────────────────────────────────────
export function saveFile(
  sim: SimEngine,
  anim: AnimRenderer,
  graphs: GraphRenderer[],
): void {
  closeMenus();
  const ic = getICValues(sim);
  const icX = Object.entries(ic).map(([k, v]) => `    <variable name="${k}" value="${v}"/>`).join('\n');
  const serializedObjects = anim.objects.map((o: any) => {
    const clean: Record<string, any> = { type: o.type, id: o.id };
    Object.entries(o).forEach(([k, v]) => {
      if (k === 'type' || k === 'id') return;
      if (k.startsWith('_') && !USER_INTERNAL_OBJECT_KEYS.has(k)) return;
      if (k === '_imgEl' || k === '_trail') return;
      if (typeof v === 'function' || typeof v === 'undefined') return;
      clean[k] = v;
    });
    return clean;
  });

  const objX = serializedObjects.map((o: any) => {
    const imgData = typeof o.imageData === 'string' ? o.imageData : '';
    const props = Object.entries(o)
      .filter(([k]) => k !== 'type' && k !== 'id' && k !== 'imageData')
      .map(([k, v]) => `      <prop k="${k}" json="${String(JSON.stringify(v)).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"/>`)
      .join('\n');
    const imgEl = imgData ? `\n      <imageData><![CDATA[${encodeCData(imgData)}]]></imageData>` : '';
    return `    <object type="${o.type}" id="${o.id}">\n${props}${imgEl}\n    </object>`;
  }).join('\n');
  const gX = graphs.map((g, i) => `    <graph id="${i}" xvar="${g.xvar}" yvar="${g.yvar}" yvar2="${g.yvar2 || ''}"/>`).join('\n');

  const w = window as any;
  const layoutStr = encodeCData(JSON.stringify(w.mdiGetLayout ? w.mdiGetLayout() : {}));
  const themeStr = document.documentElement.classList.contains('light') ? 'light' : 'dark';
  const { format: pf, decimals: pd } = getPrec();
  const precStr = `<precision format="${pf}" decimals="${pd}"/>`;
  const localeStr = getLocale();

  const trailModeSel = document.getElementById('sel-trail-mode') as HTMLSelectElement | null;
  const varListEl = document.getElementById('varlist');
  const savedGraphs: SavedGraph[] = graphs.map((g, i) => ({
    id: i,
    xvar: g.xvar,
    yvar: g.yvar,
    yvar2: g.yvar2 || '',
    autoScale: g.autoScale,
    data: g.data,
    data2: g.data2,
    xmin: g.xmin,
    xmax: g.xmax,
    ymin: g.ymin,
    ymax: g.ymax,
  }));

  const snapshot: SavedProject = {
    version: '3.0',
    model: {
      equations: getEditorText(),
      method: sim.method,
      dt: sim.dt,
      tmax: sim.tMax,
      indVar: sim.indVar,
      speedFactor: sim.speedFactor,
    },
    initialConditions: ic,
    objects: serializedObjects,
    graphs: savedGraphs,
    ui: {
      layout: w.mdiGetLayout ? w.mdiGetLayout() : {},
      theme: themeStr,
      precision: { format: pf, decimals: pd },
      locale: localeStr,
      activeTab: Number.isFinite(w.__activeTab) ? w.__activeTab : 0,
      showGrid: anim.showGrid,
      showAxes: anim.showAxes,
      camera: { ox: anim.ox, oy: anim.oy, scale: anim.scale },
      trailMode: trailModeSel?.value,
      varListHeight: varListEl ? varListEl.offsetHeight : undefined,
    },
    sim: {
      t: sim.t,
      n: sim.n,
      status: sim.status,
      state: sim.state,
      initState: sim.initState,
      history: sim.history,
    },
  };
  const snapshotStr = encodeCData(JSON.stringify(snapshot));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<modellus-web version="3.0">\n  <model>\n    <equations><![CDATA[\n${getEditorText()}\n    ]]></equations>\n    <method>${sim.method}</method>\n    <dt>${sim.dt}</dt>\n    <tmax>${sim.tMax}</tmax>\n    <indVar>${sim.indVar}</indVar>\n    <speedFactor>${sim.speedFactor}</speedFactor>\n  </model>\n  <initial-conditions>\n${icX}\n  </initial-conditions>\n  <objects>\n${objX}\n  </objects>\n  <graphs>\n${gX}\n  </graphs>\n  <ui><layout><![CDATA[${layoutStr}]]></layout><theme>${themeStr}</theme>${precStr}<locale>${localeStr}</locale></ui>\n  <snapshot format="json"><![CDATA[${snapshotStr}]]></snapshot>\n</modellus-web>`;

  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([xml], { type: 'text/xml' }));
  a.download = 'simulacao.modx';
  a.click();
  toast(t().messages.fileSaved);
}

// ── Open ────────────────────────────────────────────────────────────────────
export function openFile(): void {
  closeMenus();
  document.getElementById('file-input')?.click();
}

export function onFileLoad(
  e: Event,
  sim: SimEngine,
  anim: AnimRenderer,
  graphs: GraphRenderer[],
  onRebuild: RebuildCb,
): void {
  const input = e.target as HTMLInputElement;
  const f = input.files?.[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = ev => {
    try {
      const doc = new DOMParser().parseFromString((ev.target as FileReader).result as string, 'text/xml');
      const snapshotEl = doc.querySelector('snapshot[format="json"]');
      let project: SavedProject | null = null;
      if (snapshotEl?.textContent?.trim()) {
        try {
          project = JSON.parse(snapshotEl.textContent.trim()) as SavedProject;
        } catch (_) {
          project = null;
        }
      }
      if (!project) project = parseLegacyProject(doc);
      if (!project) { toast(t().messages.invalidFile); return; }

      applyProject(project, sim, anim, graphs, onRebuild);

      toast(t().messages.fileLoaded);
    } catch (err: any) {
      toast(interpolate(t().messages.fileError, { message: err.message }));
    }
  };
  r.readAsText(f);
  input.value = '';
}

// ── Export CSV ───────────────────────────────────────────────────────────────
export function exportCSV(sim: SimEngine): void {
  closeMenus();
  if (sim.history.length < 2) { toast(t().messages.runSimulationFirst); return; }
  const vars = sim.getAllVarNames();
  const csv = [vars.join(','), ...sim.history.map((s: any) => vars.map(v => s[v] ?? '').join(','))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = 'dados.csv';
  a.click();
  toast(interpolate(t().messages.csvDataExported, { count: sim.history.length }));
}

// ── Export PNG ───────────────────────────────────────────────────────────────
export function exportPNG(): void {
  closeMenus();
  const canvas = document.getElementById('anim-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;
  const a = document.createElement('a');
  a.download = 'animacao.png';
  a.href = canvas.toDataURL();
  a.click();
  toast(t().messages.pngExported);
}
