'use client';

import { useEffect } from 'react';
import Menubar from '@/components/panels/Menubar';
import Toolbar from '@/components/panels/Toolbar';
import AnimationPanel from '@/components/panels/AnimationPanel';
import BottomBar from '@/components/panels/BottomBar';
import AddObjectModal from '@/components/modals/AddObjectModal';
import HelpModal from '@/components/modals/HelpModal';
import AboutModal from '@/components/modals/AboutModal';
import PrecisionModal from '@/components/modals/PrecisionModal';
import CustomDialog from '@/components/ui/CustomDialog';
import Toast from '@/components/ui/Toast';
import { Analytics } from '@vercel/analytics/next';

import { SimEngine } from '@/lib/SimEngine';
import { AnimRenderer } from '@/lib/AnimRenderer';
import { GraphRenderer } from '@/lib/GraphRenderer';
import { makeObj, OBJECT_ICONS, OBJECT_COLORS, resetObjId, getObjId } from '@/lib/objects';
import { formatVal } from '@/lib/formatVal';
import { EXAMPLES } from '@/lib/examples';

import { initTheme, toggleTheme } from '@/lib/theme';
import { toast, setErr, clearErr, toggleMenu, closeMenus, closeModal, blabConfirm, blabAlert, setupRH, showHelp, showAbout } from '@/lib/uiHelpers';
import { simPlay, simPause, simReset, simStep, simBack, updateStatusUI } from '@/lib/simControls';
import { buildEditorUI, setEditorText, getEditorText, scheduleReparse, applyModel, rebuildVarList, updateVarValues, editorWrapClick } from '@/lib/modelEditor';
import { rebuildICPanel, getICValues, applyIC, toggleIC } from '@/lib/icPanel';
import { addObject, confirmAddObject, renderObjList, renderObjProps, selectObj as _selectObj, toggleObjVis, deleteObj, deleteSelectedObj, clearAllObjects, moveObjLayer, loadObjImage, resetObjOffset, updateObjProp, togglePivotField } from '@/lib/objManager';
import { selTab, rebuildGraphSelects, updateGraphCfg, clearGraph, exportGraphCSV, exportGraphPNG } from '@/lib/graphManager';
import { saveFile, openFile, onFileLoad, exportCSV, exportPNG } from '@/lib/fileIO';
import { mdiInit, mdiFocus, mdiMinimize, mdiRestore, mdiUpdateTaskbar, mdiGetLayout, mdiApplyLayout } from '@/lib/mdiSystem';
import { showPrecisionModal, updatePrecPreview, applyPrecision } from '@/lib/precisionModal';
import { undoInit, undoPush, undoSchedule, undoUndo, undoRedo } from '@/lib/undoRedo';

export default function Home() {
  useEffect(() => {
    initTheme();
    const btn = document.getElementById('theme-btn');
    const theme = localStorage.getItem('boscolab-theme') || 'dark';
    if (btn) btn.textContent = theme === 'light' ? '🌣' : '☾';
  }, []);

  useEffect(() => {
    const w = window as any;

    const sim    = new SimEngine();
    const anim   = new AnimRenderer(document.getElementById('anim-canvas') as HTMLCanvasElement);
    const graphs = [0, 1, 2, 3].map(i =>
      new GraphRenderer(document.getElementById(`gc-${i}`) as HTMLCanvasElement, i)
    );

    let selectedObj: any = null;
    let activeTab = 0;
    let _renderRAF: number | null = null;

    // Core refs on window
    w.sim = sim; w.anim = anim; w.graphs = graphs;
    w.__sim = sim; w.__graphs = graphs; w.__activeTab = 0;
    w.makeObj = makeObj; w.OBJECT_ICONS = OBJECT_ICONS; w.OBJECT_COLORS = OBJECT_COLORS;
    w.resetObjId = resetObjId;
    Object.defineProperty(w, '_objId', { get: () => getObjId(), configurable: true });

    // Inline HTML callbacks
    w.__updateObjProp    = (id: number, prop: string, value: any) => { updateObjProp(id, prop, value, anim); undoPush(anim); };
    w.__selectObj        = (id: number) => doSelectObj(id);
    w.__toggleObjVis     = (id: number) => { undoPush(anim); toggleObjVis(id, anim); renderObjList(anim); };
    w.__deleteObj        = (id: number) => { undoPush(anim); deleteObj(id, anim, sim); undoPush(anim); };
    w.__moveObjLayer     = (id: number, dir: number) => { undoPush(anim); moveObjLayer(id, dir, anim); undoPush(anim); };
    w.__loadObjImage     = (id: number) => loadObjImage(id, anim, sim);
    w.__resetObjOffset   = (id: number) => { undoPush(anim); resetObjOffset(id, anim); undoPush(anim); };
    w.__togglePivotField = (base: string, mode: string) => togglePivotField(base, mode);

    // Public API on window
    w.toggleTheme = toggleTheme;
    w.toggleMenu  = toggleMenu;
    w.closeMenus  = closeMenus;
    w.closeModal  = closeModal;
    w.blabConfirm = blabConfirm;
    w.blabAlert   = blabAlert;
    w.toast = toast; w.setErr = setErr; w.clearErr = clearErr;
    w.showHelp = showHelp; w.showAbout = showAbout;

    w.simPlay  = () => simPlay({ sim, anim, graphs });
    w.simPause = () => simPause({ sim, anim, graphs });
    w.simReset = () => doSimReset();
    w.simStep  = () => simStep({ sim, anim, graphs });
    w.simBack  = () => simBack({ sim, anim, graphs });

    w.addObject        = (type: string) => addObject(type, sim, getObjId);
    w.confirmAddObject = () => { confirmAddObject(anim, sim); undoPush(anim); };
    w.deleteSelectedObj = () => { deleteSelectedObj(anim, sim); undoPush(anim); };
    w.clearAllObjects  = () => { clearAllObjects(anim, sim); undoPush(anim); };
    w.renderObjList    = () => renderObjList(anim);
    w.renderObjProps   = (obj: any) => renderObjProps(obj, sim, anim);
    w.selectObj        = (id: number) => doSelectObj(id);
    w.moveObjLayer     = (id: number, dir: number) => moveObjLayer(id, dir, anim);
    w.resetObjOffset   = (id: number) => resetObjOffset(id, anim);
    w.loadObjImage     = (id: number) => loadObjImage(id, anim, sim);

    w.applyModel     = () => doApplyModel();
    w.verifyModel    = () => { doApplyModel(); if (sim.parsed && !sim.parsed.errors.length) toast(`✓ Modelo OK — ${Object.keys(sim.parsed.variables).length} variáveis`); };
    w.applyIC        = () => applyIC(sim, anim, graphs);
    w.toggleIC       = () => toggleIC();
    w.getICValues    = () => getICValues(sim);
    w.rebuildICPanel = () => rebuildICPanel(sim);

    w.selTab             = (i: number) => doSelTab(i);
    w.updateGraphCfg     = () => updateGraphCfg(activeTab, graphs);
    w.clearGraph         = (i: number) => clearGraph(i, graphs);
    w.exportGraphCSV     = (i: number) => exportGraphCSV(i, graphs);
    w.exportGraphPNG     = (i: number) => exportGraphPNG(i, graphs);
    w.rebuildGraphSelects = () => rebuildGraphSelects(activeTab, graphs, sim);

    w.saveFile  = () => saveFile(sim, anim, graphs);
    w.openFile  = () => openFile();
    w.exportCSV = () => exportCSV(sim);
    w.exportPNG = () => exportPNG();

    w.mdiInit         = () => mdiInit(graphs);
    w.mdiFocus        = mdiFocus;
    w.mdiMinimize     = mdiMinimize;
    w.mdiRestore      = (id: string) => mdiRestore(id, graphs);
    w.mdiUpdateTaskbar = mdiUpdateTaskbar;
    w.mdiGetLayout    = mdiGetLayout;
    w.mdiApplyLayout  = mdiApplyLayout;

    w.showPrecisionModal = showPrecisionModal;
    w.updatePrecPreview  = updatePrecPreview;
    w.applyPrecision     = applyPrecision;

    w.undoUndo = () => undoUndo(anim, doRenderAfterUndo);
    w.undoRedo = () => undoRedo(anim, doRenderAfterUndo);
    w.loadEx   = (name: string) => doLoadEx(name);
    w.newProject = () => doNewProject();
    w.setGlobalTrailMode = (mode: string) => {
      anim.objects.forEach((o: any) => { if (o.type === 'particle' || o.type === 'pendulum') { o.trailMode = mode; o._trail = []; } });
    };
    w.toggleGrid  = () => { anim.showGrid  = !anim.showGrid; };
    w.toggleAxes  = () => { anim.showAxes  = !anim.showAxes; };
    w.clearTrails = () => { anim.clearTrails(); };
    w.resetView   = () => { anim.ox = anim._w / 2; anim.oy = anim._h / 2; anim.scale = 30; };
    w.editorWrapClick = (e: MouseEvent) => editorWrapClick(e, doApplyModel);
    w.setupRH = (id: string, panelId: string, side: 'left' | 'right') =>
      setupRH(id, panelId, side, () => anim.resize());

    setInterval(() => { const m = getEditorText(); if (m.trim()) localStorage.setItem('mw_v2', m); }, 30000);

    // ── Internal helpers ────────────────────────────────────────────────────
    function doSimReset() { simReset({ sim, anim, graphs }); }

    function doRenderAfterUndo() {
      renderObjList(anim);
      renderObjProps(selectedObj && anim.objects.find((o: any) => o.id === selectedObj?.id) ? selectedObj : null, sim, anim);
      selectedObj = anim.objects.find((o: any) => o._selected) || null;
    }

    function doSelectObj(id: number) {
      if (selectedObj) selectedObj._selected = false;
      selectedObj = anim.objects.find((o: any) => o.id === id) || null;
      if (selectedObj) selectedObj._selected = true;
      renderObjList(anim);
      renderObjProps(selectedObj, sim, anim);
    }

    function doApplyModel(silent?: boolean) {
      applyModel(sim, () => {
        rebuildVarList(sim);
        rebuildICPanel(sim);
        rebuildGraphSelects(activeTab, graphs, sim);
      }, silent);
    }

    function doSelTab(i: number) {
      activeTab = i; w.__activeTab = i;
      selTab(i, graphs);
    }

    function doLoadEx(name: string) {
      closeMenus();
      const ex = EXAMPLES[name]; if (!ex) return;
      doSimReset();
      setEditorText(ex.model.trim());
      const dtEl  = document.getElementById('inp-dt')    as HTMLInputElement | null;
      const tmEl  = document.getElementById('inp-tmax')  as HTMLInputElement | null;
      const metEl = document.getElementById('sel-method') as HTMLSelectElement | null;
      if (dtEl)  dtEl.value  = String(ex.dt);
      if (tmEl)  tmEl.value  = String(ex.tmax);
      if (metEl) metEl.value = 'rk4';
      sim.dt = ex.dt; sim.tMax = ex.tmax; sim.method = 'rk4';
      doApplyModel(true);
      const ic = { ...ex.ic, ...(sim.parsed ? sim.parsed.constVars : {}) };
      sim.setIC(ic); rebuildICPanel(sim);
      anim.objects = ex.objects.map((o: any) => makeObj(o.type, o));
      anim.clearTrails();
      anim.scale = ex.scale || 30;
      anim.ox = (anim._w || 500) * (ex.ox || 0.5);
      anim.oy = (anim._h || 400) * (ex.oy || 0.5);
      if (ex.g0) { graphs[0].xvar = ex.g0.xvar || 't'; graphs[0].yvar = ex.g0.yvar || ''; graphs[0].yvar2 = ex.g0.yvar2 || ''; }
      if (ex.g1) { graphs[1].xvar = ex.g1.xvar || 't'; graphs[1].yvar = ex.g1.yvar || ''; graphs[1].yvar2 = ex.g1.yvar2 || ''; }
      graphs.forEach(g => g.clear());
      doSelTab(0);
      rebuildGraphSelects(0, graphs, sim);
      rebuildVarList(sim);
      renderObjList(anim);
      clearErr();
      toast('✓ ' + ex.model.split('\n')[0].replace('//', '').trim());
    }

    function doNewProject() {
      closeMenus();
      blabConfirm({
        icon: '', title: 'Novo Projeto',
        message: '<p>Deseja criar um novo projeto?</p><p style="color:var(--acc5);font-size:12px">⚠️ Dados não salvos serão perdidos.</p>',
        okLabel: 'Criar Novo', okClass: 'danger',
        onOk: () => {
          doSimReset(); setEditorText('');
          anim.objects = []; selectedObj = null;
          renderObjList(anim); renderObjProps(null, sim, anim);
          graphs.forEach(g => g.clear());
          const vl = document.getElementById('varlist'); if (vl) vl.innerHTML = '';
          sim.parsed = null;
          const ps = document.getElementById('parse-status'); if (ps) ps.textContent = 'Pronto';
          toast('✓ Novo projeto');
        },
      });
    }

    // ── Render loop ─────────────────────────────────────────────────────────
    anim.resize();
    window.addEventListener('resize', () => { anim.resize(); graphs[activeTab].render(); });

    function renderLoop() {
      anim.render(sim.state);
      updateVarValues(sim);
      const el = (id: string) => document.getElementById(id);
      const dispT = el('disp-t'); if (dispT) dispT.textContent = formatVal(sim.t);
      const dispN = el('disp-n'); if (dispN) dispN.textContent = String(sim.n);
      const dispFps = el('disp-fps'); if (dispFps) dispFps.textContent = String(sim.fps || '—');
      const dispPts = el('disp-pts'); if (dispPts) dispPts.textContent = String(sim.history.length);
      const dispObj = el('disp-objs'); if (dispObj) dispObj.textContent = String(anim.objects.length);
      graphs[activeTab].render();
      _renderRAF = requestAnimationFrame(renderLoop);
    }
    _renderRAF = requestAnimationFrame(renderLoop);

    sim.onStep = (_state: any) => { graphs.forEach((g: any) => g.append(_state)); };
    sim.onStatus = (s: string) => updateStatusUI(s, sim);

    // ── Anim callbacks ───────────────────────────────────────────────────────
    anim.onSelect = (obj: any) => {
      if (selectedObj) selectedObj._selected = false;
      selectedObj = obj; if (obj) obj._selected = true;
      renderObjList(anim); renderObjProps(obj, sim, anim);
    };
    anim.onDragObj = (obj: any, wx: number, wy: number, shiftKey: boolean) => {
      if (obj.type === 'vectorfield' || (shiftKey && sim.parsed)) {
        // Para vectorfield ou quando shift está pressionado
        const xvar = typeof obj.x === 'string' ? obj.x.toLowerCase() : null;
        const yvar = typeof obj.y === 'string' ? obj.y.toLowerCase() : null;
        const tvar = typeof obj.theta === 'string' ? obj.theta.toLowerCase() : null;
        let changed = false;
        
        if (obj.type === 'vectorfield') {
          // Vectorfield com shift: atualiza variáveis se forem strings
          if (xvar && sim.initState[xvar] !== undefined) { sim.initState[xvar] = wx; changed = true; }
          if (yvar && sim.initState[yvar] !== undefined) { sim.initState[yvar] = wy; changed = true; }
        } else {
          // Outros objetos
          if (xvar && sim.initState[xvar] !== undefined) { sim.initState[xvar] = wx - (obj._vox || 0); changed = true; }
          if (yvar && sim.initState[yvar] !== undefined) { sim.initState[yvar] = wy - (obj._voy || 0); changed = true; }
          if (tvar && sim.initState[tvar] !== undefined) {
            sim.initState[tvar] = Math.atan2(wx - (obj.pivotX || 0), -(wy - (obj.pivotY || 0)));
            changed = true;
          }
        }
        
        if (changed) {
          sim.state = { ...sim.initState };
          if (sim.parsed) Object.entries(sim.parsed.constVars).forEach(([k, v]) => { sim.state[k] = v as number; });
          sim._applyDerived(sim.state); sim.t = 0; sim.n = 0;
          sim.history = [{ ...sim.state, t: 0, n: 0 }];
          anim.clearTrails(); graphs.forEach((g: any) => g.clear());
          if (xvar) { const el = document.getElementById('ic-' + xvar) as HTMLInputElement | null; if (el) el.value = (obj.type === 'vectorfield' ? wx : wx - (obj._vox || 0)).toFixed(3); }
          if (yvar) { const el = document.getElementById('ic-' + yvar) as HTMLInputElement | null; if (el) el.value = (obj.type === 'vectorfield' ? wy : wy - (obj._voy || 0)).toFixed(3); }
        }
      } else {
        // Sem shift: arrasta com offset
        obj._vox = (obj._vox || 0) + (wx - (obj._dragLastX || wx));
        obj._voy = (obj._voy || 0) + (wy - (obj._dragLastY || wy));
      }
      obj._dragLastX = wx; obj._dragLastY = wy;
    };
    anim.onDragStart = (obj: any, wx: number, wy: number) => { obj._dragLastX = wx; obj._dragLastY = wy; };
    anim.onDragEnd = () => { undoPush(anim); };

    // ── Varlist resize ───────────────────────────────────────────────────────
    const vlHandle = document.getElementById('varlist-resize');
    const vlEl     = document.getElementById('varlist');
    if (vlHandle && vlEl) {
      let drag = false, startY = 0, startVH = 0;
      vlHandle.addEventListener('mousedown', e => { drag = true; startY = e.clientY; startVH = vlEl.offsetHeight; vlHandle.classList.add('drag'); e.preventDefault(); });
      window.addEventListener('mousemove', e => { if (!drag) return; const delta = startY - e.clientY; const newH = Math.max(40, Math.min(320, startVH + delta)); vlEl.style.maxHeight = newH + 'px'; vlEl.style.height = newH + 'px'; });
      window.addEventListener('mouseup', () => { if (drag) { drag = false; vlHandle.classList.remove('drag'); } });
    }

    // ── Keyboard shortcuts ───────────────────────────────────────────────────
    document.addEventListener('keydown', e => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'MATH-FIELD') {
        if (e.key === 'Escape') (e.target as HTMLElement).blur();
        if (e.ctrlKey && e.key === 's') { e.preventDefault(); saveFile(sim, anim, graphs); }
        return;
      }
      if (e.ctrlKey && e.key === 's') { e.preventDefault(); saveFile(sim, anim, graphs); }
      else if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undoUndo(anim, doRenderAfterUndo); }
      else if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); undoRedo(anim, doRenderAfterUndo); }
      else if (e.ctrlKey && e.key === 'n') { e.preventDefault(); doNewProject(); }
      else if (e.key === ' ') { e.preventDefault(); sim.running ? simPause({ sim, anim, graphs }) : simPlay({ sim, anim, graphs }); }
      else if (e.key === 'r' || e.key === 'R') doSimReset();
      else if (e.key === '.') simStep({ sim, anim, graphs });
      else if (e.key === ',') simBack({ sim, anim, graphs });
      else if (e.key === 'Delete' && selectedObj) deleteSelectedObj(anim, sim);
    });

    document.addEventListener('click', e => { if (!(e.target as HTMLElement).closest('.mitem')) closeMenus(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape')
        ['blab-dlg-overlay', 'help-modal-overlay', 'about-modal-overlay', 'precision-modal-overlay'].forEach(id => document.getElementById(id)?.classList.remove('show'));
    }, true);

    // ── Toolbar wiring ───────────────────────────────────────────────────────
    (document.getElementById('sel-speed') as HTMLSelectElement | null)?.addEventListener('change', function () { sim.stepsPerFrame = parseFloat(this.value); sim._frameAcc = 0; });
    (document.getElementById('inp-dt')   as HTMLInputElement | null)?.addEventListener('change', function () { sim.dt   = parseFloat(this.value) || 0.01; });
    (document.getElementById('inp-tmax') as HTMLInputElement | null)?.addEventListener('change', function () { sim.tMax = parseFloat(this.value) || 10; });
    (document.getElementById('sel-method') as HTMLSelectElement | null)?.addEventListener('change', function () { sim.method = this.value; });

    // ── Sub-menu positioning ─────────────────────────────────────────────────
    document.querySelectorAll<HTMLElement>('.di.has-sub').forEach(item => {
      const sub = item.querySelector<HTMLElement>('.sub-drop');
      if (!sub) return;
      item.addEventListener('mouseenter', () => {
        const rect = item.getBoundingClientRect();
        sub.style.top  = rect.top + 'px';
        sub.style.left = (rect.right + 2 + 220 > window.innerWidth ? rect.left - 220 : rect.right + 2) + 'px';
        sub.style.display = 'block';
      });
      item.addEventListener('mouseleave', () => { sub.style.display = 'none'; });
    });

    // ── Dialog overlay close ─────────────────────────────────────────────────
    document.getElementById('blab-dlg-overlay')?.addEventListener('click', e => {
      if (e.target === document.getElementById('blab-dlg-overlay')) document.getElementById('blab-dlg-overlay')!.classList.remove('show');
    });
    ['help-modal-overlay', 'about-modal-overlay', 'precision-modal-overlay'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', e => { if (e.target === el) el.classList.remove('show'); });
    });

    // ── Init ─────────────────────────────────────────────────────────────────
    updateStatusUI('idle', sim);
    const ss = document.getElementById('sel-speed') as HTMLSelectElement | null;
    if (ss) ss.value = '1';
    sim.stepsPerFrame = 1; sim._frameAcc = 0;
    mdiInit(graphs);
    undoInit(anim);
    doLoadEx('solar');
    setTimeout(() => { buildEditorUI(doApplyModel); doApplyModel(true); }, 400);

    return () => { if (_renderRAF !== null) cancelAnimationFrame(_renderRAF); };
  }, []);

  return (
    <div id="app">
      <Menubar />
      <Toolbar />
      <div id="main"><AnimationPanel /></div>
      <BottomBar />
      <Analytics />
      <AddObjectModal />
      <HelpModal />
      <AboutModal />
      <PrecisionModal />
      <CustomDialog />
      <Toast />
      <input
        type="file" id="file-input" accept=".modx"
        style={{ display: 'none' }}
        onChange={e => {
          const w = window as any;
          onFileLoad(e as any, w.sim, w.anim, w.graphs, () => {
            rebuildVarList(w.sim);
            rebuildICPanel(w.sim);
            rebuildGraphSelects(w.__activeTab ?? 0, w.graphs, w.sim);
            renderObjList(w.anim);
          });
        }}
      />
      <div id="canvas-tooltip" />
    </div>
  );
}
