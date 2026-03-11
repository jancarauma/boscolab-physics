'use client';
import { useEffect, useState } from 'react';
import { t, onLocaleChange } from '@/lib/i18n';

export default function AnimationPanel() {
  const [text, setText] = useState(() => {
    const tr = t();
    return {
      showObjects: tr.panels.showObjects,
      showGraphs: tr.panels.showGraphs,
      noObjects: tr.panels.noObjects,
      noObjectsDesc: tr.panels.noObjectsDesc,
      noProps: tr.panels.noProps,
      noPropsDesc: tr.panels.noPropsDesc,
      applyRestart: tr.panels.applyAndRestart,
      clearAll: tr.panels.clearAll,
      particle: tr.objectTypes.particle,
      pendulum: tr.objectTypes.pendulum,
      spring: tr.objectTypes.spring,
      vector: tr.objectTypes.vector,
      circle: tr.objectTypes.circle,
      rectangle: tr.objectTypes.rectangle,
      text: tr.objectTypes.text,
      field: tr.objectTypes.field,
      animation: tr.ui.animation,
      windows: tr.ui.windows,
      model: tr.ui.model,
      objects: tr.panels.objects,
      graphs: tr.panels.graphs,
      initialConditions: tr.ui.initialConditions,
      verify: tr.ui.verify,
      minimize: tr.ui.minimize,
      dragObject: tr.ui.dragObject,
      shiftDrag: tr.ui.shiftDrag,
      ready: tr.ui.ready,
      clear: tr.ui.clear,
      auto: tr.ui.auto,
      image: tr.ui.image,
      data: tr.ui.data,
      x: tr.ui.x,
      y1: tr.ui.y1,
      y2: tr.ui.y2,
      graph1: tr.graphs.graph1,
      graph2: tr.graphs.graph2,
      graph3: tr.graphs.graph3,
      graph4: tr.graphs.graph4,
    };
  });

  useEffect(() => {
    const updateText = () => {
      const tr = t();
      const newText = {
        showObjects: tr.panels.showObjects,
        showGraphs: tr.panels.showGraphs,
        noObjects: tr.panels.noObjects,
        noObjectsDesc: tr.panels.noObjectsDesc,
        noProps: tr.panels.noProps,
        noPropsDesc: tr.panels.noPropsDesc,
        applyRestart: tr.panels.applyAndRestart,
        clearAll: tr.panels.clearAll,
        particle: tr.objectTypes.particle,
        pendulum: tr.objectTypes.pendulum,
        spring: tr.objectTypes.spring,
        vector: tr.objectTypes.vector,
        circle: tr.objectTypes.circle,
        rectangle: tr.objectTypes.rectangle,
        text: tr.objectTypes.text,
        field: tr.objectTypes.field,
        animation: tr.ui.animation,
        windows: tr.ui.windows,
        model: tr.ui.model,
        objects: tr.panels.objects,
        graphs: tr.panels.graphs,
        initialConditions: tr.ui.initialConditions,
        verify: tr.ui.verify,
        minimize: tr.ui.minimize,
        dragObject: tr.ui.dragObject,
        shiftDrag: tr.ui.shiftDrag,
        ready: tr.ui.ready,
        clear: tr.ui.clear,
        auto: tr.ui.auto,
        image: tr.ui.image,
        data: tr.ui.data,
        x: tr.ui.x,
        y1: tr.ui.y1,
        y2: tr.ui.y2,
        graph1: tr.graphs.graph1,
        graph2: tr.graphs.graph2,
        graph3: tr.graphs.graph3,
        graph4: tr.graphs.graph4,
      };
      setText(newText);
    };
    const unsub = onLocaleChange(updateText);
    return unsub;
  }, []);

  return (
    <div className="panel" id="panel-anim" style={{ flex: 1, flexDirection: 'column', borderRight: 'none', position: 'relative' }}>
      <div className="phdr" id="anim-phdr">
        <span className="phdr-dot" style={{ background: 'var(--acc2)' }} />
        <span className="phdr-title">{text.animation}</span>
        <div className="phdr-right" style={{ gap: 6 }}>
          <span style={{ fontSize: 10, color: 'var(--txt3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>{text.windows}</span>
          <button className="pico mdi-toggle-btn" id="btn-show-model" onClick={() => (window as any).mdiRestore?.('mdi-model')} title={text.model}>{text.model}</button>
          <button className="pico mdi-toggle-btn" id="btn-show-objects" onClick={() => (window as any).mdiRestore?.('mdi-objects')} title={text.showObjects}>{text.objects}</button>
          <button className="pico mdi-toggle-btn" id="btn-show-graphs" onClick={() => (window as any).mdiRestore?.('mdi-graphs')} title={text.showGraphs}>{text.graphs}</button>
        </div>
      </div>

      <div id="anim-wrap" style={{ flex: 1, position: 'relative' }}>
        <canvas id="anim-canvas" />
        <div id="anim-overlay">
          <button className="ov-btn" onClick={() => (window as any).resetView?.()}>⊙</button>
          <button className="ov-btn" onClick={() => { if ((window as any).anim) (window as any).anim.scale *= 1.4; }}>＋</button>
          <button className="ov-btn" onClick={() => { if ((window as any).anim) (window as any).anim.scale /= 1.4; }}>－</button>
        </div>
        <div id="coord-disp">x: 0.00  y: 0.00 | {text.dragObject} | {text.shiftDrag}</div>

        {/* IC Panel */}
        <div id="ic-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--txt2)', textTransform: 'uppercase', letterSpacing: 1 }}>{text.initialConditions}</span>
            <button className="btn" onClick={() => (window as any).applyIC?.()} style={{ padding: '3px 10px', fontSize: 11 }}>{text.applyRestart}</button>
          </div>
          <div className="icgrid" id="ic-grid" />
        </div>

        {/* MDI: Modelo */}
        <div className="mdi-child" id="mdi-model" style={{ left: 12, top: 12, width: 310, height: 420 }}>
          <div className="mdi-titlebar" id="mdi-model-tb">
            <span className="mdi-dot" style={{ background: 'var(--acc)' }} />
            <span className="mdi-title">{text.model}</span>
            <div className="mdi-controls">
              <button className="mdi-btn" onClick={() => (window as any).verifyModel?.()} title={text.verify}>{text.verify}</button>
              <button className="mdi-btn mdi-min" onClick={() => (window as any).mdiMinimize?.('mdi-model')} title={text.minimize}>{text.minimize}</button>
            </div>
          </div>
          <div className="mdi-body" id="mdi-model-body">
            <div id="editor-wrap" onClick={(e) => (window as any).editorWrapClick?.(e)} />
            <div id="model-footer">
              <span id="parse-status">{text.ready}</span>
            </div>
            <div id="varlist-resize" title="Drag to resize" />
            <div id="varlist" />
          </div>
          <div className="mdi-resize" id="mdi-model-resize" />
        </div>

        {/* MDI: Objetos */}
        <div className="mdi-child" id="mdi-objects" style={{ right: 12, top: 12, width: 240, height: 380 }}>
          <div className="mdi-titlebar" id="mdi-objects-tb">
            <span className="mdi-dot" style={{ background: 'var(--acc3)' }} />
            <span className="mdi-title">{text.objects}</span>
            <div className="mdi-controls">
              <button className="mdi-btn" onClick={() => (window as any).clearAllObjects?.()} title={text.clearAll}>✕</button>
              <button className="mdi-btn mdi-min" onClick={() => (window as any).mdiMinimize?.('mdi-objects')} title={text.minimize}>{text.minimize}</button>
            </div>
          </div>
          <div className="mdi-body" id="mdi-objects-body">
            <div id="obj-sidebar" style={{ width: '100%', border: 'none', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div id="obj-list"><div className="no-obj">{text.noObjects}<br />{text.noObjectsDesc}</div></div>
              <div id="obj-add-bar">
                <button className="add-btn" onClick={() => (window as any).addObject?.('particle')} title={text.particle}>{text.particle}</button>
                <button className="add-btn" onClick={() => (window as any).addObject?.('pendulum')} title={text.pendulum}>{text.pendulum}</button>
                <button className="add-btn" onClick={() => (window as any).addObject?.('spring')} title={text.spring}>{text.spring}</button>
                <button className="add-btn" onClick={() => (window as any).addObject?.('vector')} title={text.vector}>{text.vector}</button>
                <button className="add-btn" onClick={() => (window as any).addObject?.('circle')} title={text.circle}>{text.circle}</button>
                <button className="add-btn" onClick={() => (window as any).addObject?.('rect')} title={text.rectangle}>{text.rectangle}</button>
                <button className="add-btn" onClick={() => (window as any).addObject?.('label')} title={text.text}>{text.text}</button>
                <button className="add-btn" onClick={() => (window as any).addObject?.('vectorfield')} title={text.field}>{text.field}</button>
              </div>
              <div id="obj-props"><div className="no-obj">{text.noProps}<br />{text.noPropsDesc}</div></div>
            </div>
          </div>
          <div className="mdi-resize" id="mdi-objects-resize" />
        </div>

        {/* MDI: Gráficos */}
        <div className="mdi-child" id="mdi-graphs" style={{ right: 12, bottom: 12, width: 340, height: 300 }}>
          <div className="mdi-titlebar" id="mdi-graphs-tb">
            <span className="mdi-dot" style={{ background: 'var(--acc4)' }} />
            <span className="mdi-title">{text.graphs}</span>
            <div className="mdi-controls">
              <button className="mdi-btn mdi-min" onClick={() => (window as any).mdiMinimize?.('mdi-graphs')} title={text.minimize}>{text.minimize}</button>
            </div>
          </div>
          <div className="mdi-body" id="mdi-graphs-body">
            <div id="panel-graph" style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', border: 'none' }}>
              <div id="gtabs">
                <div className="gtab active" id="gtab-0" onClick={() => (window as any).selTab?.(0)}>{text.graph1}</div>
                <div className="gtab" id="gtab-1" onClick={() => (window as any).selTab?.(1)}>{text.graph2}</div>
                <div className="gtab" id="gtab-2" onClick={() => (window as any).selTab?.(2)}>{text.graph3}</div>
                <div className="gtab" id="gtab-3" onClick={() => (window as any).selTab?.(3)}>{text.graph4}</div>
              </div>
              <div id="gcanvases">
                <div className="gcwrap active" id="gw-0"><canvas className="gcanvas" id="gc-0" /></div>
                <div className="gcwrap" id="gw-1"><canvas className="gcanvas" id="gc-1" /></div>
                <div className="gcwrap" id="gw-2"><canvas className="gcanvas" id="gc-2" /></div>
                <div className="gcwrap" id="gw-3"><canvas className="gcanvas" id="gc-3" /></div>
              </div>
              <div id="gcfg">
                <div className="gcfg-row">
                  <span className="gcfg-label">{text.x}</span>
                  <select className="gcfg-sel" id="cfg-xvar" onChange={() => (window as any).updateGraphCfg?.()}><option value="t">t</option></select>
                  <span className="gcfg-label">{text.y1}</span>
                  <select className="gcfg-sel" id="cfg-yvar" onChange={() => (window as any).updateGraphCfg?.()}><option value="">—</option></select>
                  <span className="gcfg-label">{text.y2}</span>
                  <select className="gcfg-sel" id="cfg-yvar2" onChange={() => (window as any).updateGraphCfg?.()}><option value="">—</option></select>
                </div>
                <div className="gcfg-row">
                  <button className="pico" onClick={() => (window as any).clearGraph?.((window as any).activeTab)} style={{ fontSize: 10 }}>{text.clear}</button>
                  <button className="pico" onClick={() => { if ((window as any).graphs) (window as any).graphs[(window as any).activeTab].autoScale = true; }} style={{ fontSize: 10 }}>{text.auto}</button>
                  <button className="pico" onClick={() => (window as any).exportGraphPNG?.((window as any).activeTab)} style={{ fontSize: 10, marginLeft: 'auto' }}>{text.image}</button>
                  <button className="pico" onClick={() => (window as any).exportGraphCSV?.((window as any).activeTab)} style={{ fontSize: 10 }}>{text.data}</button>
                </div>
              </div>
            </div>
          </div>
          <div className="mdi-resize" id="mdi-graphs-resize" />
        </div>

        {/* MDI Taskbar */}
        <div id="mdi-taskbar" />
      </div>
    </div>
  );
}
