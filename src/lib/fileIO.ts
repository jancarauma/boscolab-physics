import type { SimEngine } from './SimEngine';
import type { AnimRenderer } from './AnimRenderer';
import type { GraphRenderer } from './GraphRenderer';
import { makeObj } from './objects';
import { toast, closeMenus } from './uiHelpers';
import { getEditorText, setEditorText, applyModel } from './modelEditor';
import { getICValues, rebuildICPanel } from './icPanel';
import { rebuildVarList } from './modelEditor';

import { applyTheme } from './theme';
import { getPrec, setPrec } from './formatVal';
import { getLocale, setLocale, type Locale, t, interpolate } from './i18n';

type RebuildCb = () => void;

// ── Save ────────────────────────────────────────────────────────────────────
export function saveFile(
  sim: SimEngine,
  anim: AnimRenderer,
  graphs: GraphRenderer[],
): void {
  closeMenus();
  const ic = getICValues(sim);
  const icX = Object.entries(ic).map(([k, v]) => `    <variable name="${k}" value="${v}"/>`).join('\n');
  const objX = anim.objects.map((o: any) => {
    const imgData = o.imageData || '';
    const props = Object.entries(o)
      .filter(([k]) => !k.startsWith('_') && k !== 'id' && k !== 'imageData')
      .map(([k, v]) => `      <prop k="${k}" v="${String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"/>`)
      .join('\n');
    const imgEl = imgData ? `\n      <imageData><![CDATA[${imgData}]]></imageData>` : '';
    return `    <object type="${o.type}" id="${o.id}">\n${props}${imgEl}\n    </object>`;
  }).join('\n');
  const gX = graphs.map((g, i) => `    <graph id="${i}" xvar="${g.xvar}" yvar="${g.yvar}" yvar2="${g.yvar2 || ''}"/>`).join('\n');

  const w = window as any;
  const layoutStr = JSON.stringify(w.mdiGetLayout ? w.mdiGetLayout() : {}).replace(/]]>/g, ']]&gt;');
  const themeStr = document.documentElement.classList.contains('light') ? 'light' : 'dark';
  const { format: pf, decimals: pd } = getPrec();
  const precStr = `<precision format="${pf}" decimals="${pd}"/>`;
  const localeStr = getLocale();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<modellus-web version="2.1">\n  <model>\n    <equations><![CDATA[\n${getEditorText()}\n    ]]></equations>\n    <method>${sim.method}</method>\n    <dt>${sim.dt}</dt>\n    <tmax>${sim.tMax}</tmax>\n    <indVar>${sim.indVar}</indVar>\n    <speedFactor>${sim.speedFactor}</speedFactor>\n  </model>\n  <initial-conditions>\n${icX}\n  </initial-conditions>\n  <objects>\n${objX}\n  </objects>\n  <graphs>\n${gX}\n  </graphs>\n  <ui><layout><![CDATA[${layoutStr}]]></layout><theme>${themeStr}</theme>${precStr}<locale>${localeStr}</locale></ui>\n</modellus-web>`;

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
      const eqs = doc.querySelector('equations');
      if (!eqs) { toast(t().messages.invalidFile); return; }

      setEditorText(eqs.textContent?.trim() ?? '');

      const methodEl = doc.querySelector('method');
      if (methodEl) {
        sim.method = methodEl.textContent ?? 'rk4';
        const sel = document.getElementById('sel-method') as HTMLSelectElement | null;
        if (sel) sel.value = sim.method;
      }
      const dtEl = doc.querySelector('dt');
      if (dtEl) {
        sim.dt = parseFloat(dtEl.textContent ?? '0.01') || 0.01;
        const inp = document.getElementById('inp-dt') as HTMLInputElement | null;
        if (inp) inp.value = String(sim.dt);
      }
      const tmEl = doc.querySelector('tmax');
      if (tmEl) {
        sim.tMax = parseFloat(tmEl.textContent ?? '10') || 10;
        const inp = document.getElementById('inp-tmax') as HTMLInputElement | null;
        if (inp) inp.value = String(sim.tMax);
      }

      const indVarEl = doc.querySelector('indVar');
      if (indVarEl) {
        sim.indVar = indVarEl.textContent?.trim() ?? 't';
        const inp = document.getElementById('inp-ind-var') as HTMLInputElement | null;
        if (inp) inp.value = sim.indVar;
      }

      const speedFactorEl = doc.querySelector('speedFactor');
      if (speedFactorEl) {
        sim.speedFactor = parseFloat(speedFactorEl.textContent ?? '1') || 1;
        const sel = document.getElementById('sel-speed') as HTMLSelectElement | null;
        if (sel) sel.value = String(sim.speedFactor);
      }

      const ic: Record<string, number> = {};
      doc.querySelectorAll('initial-conditions variable').forEach(el => {
        ic[el.getAttribute('name')!] = parseFloat(el.getAttribute('value') ?? '0') || 0;
      });
      if (sim.parsed) Object.entries(sim.parsed.constVars).forEach(([k, v]) => { ic[k] = v as number; });
      sim.setIC(ic);
      rebuildICPanel(sim);

      anim.objects = [];
      doc.querySelectorAll('objects object').forEach(oel => {
        const props: Record<string, any> = {};
        oel.querySelectorAll('prop').forEach(p => {
          const k = p.getAttribute('k')!;
          const v = p.getAttribute('v')!;
          const n = parseFloat(v);
          props[k] = isNaN(n) ? v : n;
        });
        (['showVec', 'showVecProj', 'showTrail', 'useImage', 'visible'] as const).forEach(bp => {
          if (props[bp] !== undefined) props[bp] = (props[bp] === 'true' || props[bp] === true);
        });
        const imgEl = oel.querySelector('imageData');
        if (imgEl) props.imageData = imgEl.textContent?.trim() ?? '';
        anim.objects.push(makeObj(oel.getAttribute('type')!, props));
      });

      doc.querySelectorAll('graph').forEach(gel => {
        const i = parseInt(gel.getAttribute('id') ?? '0');
        if (graphs[i]) {
          graphs[i].xvar = gel.getAttribute('xvar') || 't';
          graphs[i].yvar = gel.getAttribute('yvar') || '';
          graphs[i].yvar2 = gel.getAttribute('yvar2') || '';
        }
      });

      onRebuild();

      const w = window as any;
      const layoutEl = doc.querySelector('ui layout');
      if (layoutEl && w.mdiApplyLayout) {
        try { w.mdiApplyLayout(JSON.parse(layoutEl.textContent?.trim() ?? '{}')); } catch (_) {}
      }

      const themeEl = doc.querySelector('ui theme');
      if (themeEl) applyTheme(themeEl.textContent?.trim() ?? 'dark');

      const precEl = doc.querySelector('ui precision');
      if (precEl) {
        const fmt = precEl.getAttribute('format') ?? 'fixed';
        const dec = parseInt(precEl.getAttribute('decimals') ?? '3');
        if (!isNaN(dec)) setPrec(fmt, dec);
      }
      const localeEl = doc.querySelector('ui locale');
      if (localeEl) {
        const loc = localeEl.textContent?.trim() as Locale;
        if (loc) setLocale(loc);
      }

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
  const vars = ['t', ...Object.keys(sim.parsed?.variables || {})];
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
