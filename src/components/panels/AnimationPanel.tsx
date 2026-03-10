'use client';

export default function AnimationPanel() {
  return (
    <div className="panel" id="panel-anim" style={{ flex: 1, flexDirection: 'column', borderRight: 'none', position: 'relative' }}>
      <div className="phdr" id="anim-phdr">
        <span className="phdr-dot" style={{ background: 'var(--acc2)' }} />
        <span className="phdr-title">Animação</span>
        <div className="phdr-right" style={{ gap: 6 }}>
          <span style={{ fontSize: 10, color: 'var(--txt3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>Janelas:</span>
          <button className="pico mdi-toggle-btn" id="btn-show-model" onClick={() => (window as any).mdiRestore?.('mdi-model')} title="Mostrar Modelo">Modelo</button>
          <button className="pico mdi-toggle-btn" id="btn-show-objects" onClick={() => (window as any).mdiRestore?.('mdi-objects')} title="Mostrar Objetos">Objetos</button>
          <button className="pico mdi-toggle-btn" id="btn-show-graphs" onClick={() => (window as any).mdiRestore?.('mdi-graphs')} title="Mostrar Gráficos">Gráficos</button>
        </div>
      </div>

      <div id="anim-wrap" style={{ flex: 1, position: 'relative' }}>
        <canvas id="anim-canvas" />
        <div id="anim-overlay">
          <button className="ov-btn" onClick={() => (window as any).resetView?.()}>⊙</button>
          <button className="ov-btn" onClick={() => { if ((window as any).anim) (window as any).anim.scale *= 1.4; }}>＋</button>
          <button className="ov-btn" onClick={() => { if ((window as any).anim) (window as any).anim.scale /= 1.4; }}>－</button>
        </div>
        <div id="coord-disp">x: 0.00  y: 0.00 | arraste obj. | shift+arraste=IC</div>

        {/* IC Panel */}
        <div id="ic-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--txt2)', textTransform: 'uppercase', letterSpacing: 1 }}>Condições Iniciais</span>
            <button className="btn" onClick={() => (window as any).applyIC?.()} style={{ padding: '3px 10px', fontSize: 11 }}>✓ Aplicar e Reiniciar</button>
          </div>
          <div className="icgrid" id="ic-grid" />
        </div>

        {/* MDI: Modelo */}
        <div className="mdi-child" id="mdi-model" style={{ left: 12, top: 12, width: 310, height: 420 }}>
          <div className="mdi-titlebar" id="mdi-model-tb">
            <span className="mdi-dot" style={{ background: 'var(--acc)' }} />
            <span className="mdi-title">Modelo</span>
            <div className="mdi-controls">
              <button className="mdi-btn" onClick={() => (window as any).verifyModel?.()} title="Verificar">✓ Verificar</button>
              <button className="mdi-btn mdi-min" onClick={() => (window as any).mdiMinimize?.('mdi-model')} title="Minimizar">─</button>
            </div>
          </div>
          <div className="mdi-body" id="mdi-model-body">
            <div id="editor-wrap" onClick={(e) => (window as any).editorWrapClick?.(e)} />
            <div id="model-footer">
              <span id="parse-status">Pronto</span>
            </div>
            <div id="varlist-resize" title="Arrastar para redimensionar" />
            <div id="varlist" />
          </div>
          <div className="mdi-resize" id="mdi-model-resize" />
        </div>

        {/* MDI: Objetos */}
        <div className="mdi-child" id="mdi-objects" style={{ right: 12, top: 12, width: 240, height: 380 }}>
          <div className="mdi-titlebar" id="mdi-objects-tb">
            <span className="mdi-dot" style={{ background: 'var(--acc3)' }} />
            <span className="mdi-title">Objetos</span>
            <div className="mdi-controls">
              <button className="mdi-btn" onClick={() => (window as any).clearAllObjects?.()} title="Limpar tudo">✕</button>
              <button className="mdi-btn mdi-min" onClick={() => (window as any).mdiMinimize?.('mdi-objects')} title="Minimizar">─</button>
            </div>
          </div>
          <div className="mdi-body" id="mdi-objects-body">
            <div id="obj-sidebar" style={{ width: '100%', border: 'none', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div id="obj-list"><div className="no-obj">Sem objetos.<br />Adicione abaixo ↓</div></div>
              <div id="obj-add-bar">
                <button className="add-btn" onClick={() => (window as any).addObject?.('particle')} title="Partícula">● Partícula</button>
                <button className="add-btn" onClick={() => (window as any).addObject?.('pendulum')} title="Pêndulo">℘ Pêndulo</button>
                <button className="add-btn" onClick={() => (window as any).addObject?.('spring')} title="Mola+Bloco">⇝ Mola</button>
                <button className="add-btn" onClick={() => (window as any).addObject?.('vector')} title="Vetor">➡ Vetor</button>
                <button className="add-btn" onClick={() => (window as any).addObject?.('circle')} title="Círculo">◯ Círculo</button>
                <button className="add-btn" onClick={() => (window as any).addObject?.('rect')} title="Retângulo">▭ Retângulo</button>
                <button className="add-btn" onClick={() => (window as any).addObject?.('label')} title="Texto">T Texto</button>
                <button className="add-btn" onClick={() => (window as any).addObject?.('vectorfield')} title="Campo Vetorial">⊞ Campo</button>
              </div>
              <div id="obj-props"><div className="no-obj">Clique num objeto<br />para ver propriedades</div></div>
            </div>
          </div>
          <div className="mdi-resize" id="mdi-objects-resize" />
        </div>

        {/* MDI: Gráficos */}
        <div className="mdi-child" id="mdi-graphs" style={{ right: 12, bottom: 12, width: 340, height: 300 }}>
          <div className="mdi-titlebar" id="mdi-graphs-tb">
            <span className="mdi-dot" style={{ background: 'var(--acc4)' }} />
            <span className="mdi-title">Gráficos</span>
            <div className="mdi-controls">
              <button className="mdi-btn mdi-min" onClick={() => (window as any).mdiMinimize?.('mdi-graphs')} title="Minimizar">─</button>
            </div>
          </div>
          <div className="mdi-body" id="mdi-graphs-body">
            <div id="panel-graph" style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', border: 'none' }}>
              <div id="gtabs">
                <div className="gtab active" id="gtab-0" onClick={() => (window as any).selTab?.(0)}>Gráfico 1</div>
                <div className="gtab" id="gtab-1" onClick={() => (window as any).selTab?.(1)}>Gráfico 2</div>
                <div className="gtab" id="gtab-2" onClick={() => (window as any).selTab?.(2)}>Gráfico 3</div>
                <div className="gtab" id="gtab-3" onClick={() => (window as any).selTab?.(3)}>Gráfico 4</div>
              </div>
              <div id="gcanvases">
                <div className="gcwrap active" id="gw-0"><canvas className="gcanvas" id="gc-0" /></div>
                <div className="gcwrap" id="gw-1"><canvas className="gcanvas" id="gc-1" /></div>
                <div className="gcwrap" id="gw-2"><canvas className="gcanvas" id="gc-2" /></div>
                <div className="gcwrap" id="gw-3"><canvas className="gcanvas" id="gc-3" /></div>
              </div>
              <div id="gcfg">
                <div className="gcfg-row">
                  <span className="gcfg-label">X</span>
                  <select className="gcfg-sel" id="cfg-xvar" onChange={() => (window as any).updateGraphCfg?.()}><option value="t">t</option></select>
                  <span className="gcfg-label">Y1</span>
                  <select className="gcfg-sel" id="cfg-yvar" onChange={() => (window as any).updateGraphCfg?.()}><option value="">—</option></select>
                  <span className="gcfg-label">Y2</span>
                  <select className="gcfg-sel" id="cfg-yvar2" onChange={() => (window as any).updateGraphCfg?.()}><option value="">—</option></select>
                </div>
                <div className="gcfg-row">
                  <button className="pico" onClick={() => (window as any).clearGraph?.((window as any).activeTab)} style={{ fontSize: 10 }}>✕ Limpar</button>
                  <button className="pico" onClick={() => { if ((window as any).graphs) (window as any).graphs[(window as any).activeTab].autoScale = true; }} style={{ fontSize: 10 }}>⊙ Auto</button>
                  <button className="pico" onClick={() => (window as any).exportGraphPNG?.((window as any).activeTab)} style={{ fontSize: 10, marginLeft: 'auto' }}>Imagem</button>
                  <button className="pico" onClick={() => (window as any).exportGraphCSV?.((window as any).activeTab)} style={{ fontSize: 10 }}>Dados</button>
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
