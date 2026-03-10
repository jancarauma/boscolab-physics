'use client';

export default function Menubar() {
  return (
    <div id="menubar">
      <span className="logo">BOSCO<a style={{ color: 'orange' }}>LAB</a></span>

      <div className="mitem" onClick={(e) => (window as any).toggleMenu?.(e.currentTarget)}>
        Arquivo
        <div className="drop">
          <div className="di" onClick={() => (window as any).newProject?.()}>Novo <span className="sc">Ctrl+N</span></div>
          <div className="di" onClick={() => (window as any).openFile?.()}>Abrir .modx <span className="sc">Ctrl+O</span></div>
          <div className="dsep" />
          <div className="di" onClick={() => (window as any).saveFile?.()}>Salvar <span className="sc">Ctrl+S</span></div>
          <div className="dsep" />
          <div className="di" onClick={() => (window as any).exportCSV?.()}>Exportar Dados</div>
          <div className="di" onClick={() => (window as any).exportPNG?.()}>Exportar Imagem</div>
          <div className="dsep" />
          <div className="di" onClick={() => (window as any).showPrecisionModal?.()}>Precisão</div>
        </div>
      </div>

      <div className="mitem" onClick={(e) => (window as any).toggleMenu?.(e.currentTarget)}>
        Exemplos
        <div className="drop" style={{ minWidth: 210 }}>
          <div className="di has-sub">
            Mecânica
            <div className="sub-drop">
              <div className="dcat">Cinemática</div>
              <div className="di" onClick={() => (window as any).loadEx?.('projetil')}>Lançamento de Projétil</div>
              <div className="di" onClick={() => (window as any).loadEx?.('projetil_drag')}>Projétil com Arrasto</div>
              <div className="dsep" />
              <div className="dcat">Gravitação</div>
              <div className="di" onClick={() => (window as any).loadEx?.('queda')}>Queda Livre</div>
              <div className="di" onClick={() => (window as any).loadEx?.('queda_lua')}>Queda: Terra vs Lua</div>
              <div className="di" onClick={() => (window as any).loadEx?.('orbita')}>Lei de Kepler</div>
              <div className="di" onClick={() => (window as any).loadEx?.('orbita3')}>Problema dos 3 Corpos</div>
              <div className="di" onClick={() => (window as any).loadEx?.('solar')}>Sistema Planetário</div>
            </div>
          </div>
          <div className="di has-sub">
            Ondas
            <div className="sub-drop">
              <div className="dcat">Ondas</div>
              <div className="di" onClick={() => (window as any).loadEx?.('batimento')}>Batimento</div>
              <div className="dsep" />
              <div className="dcat">Oscilações</div>
              <div className="di" onClick={() => (window as any).loadEx?.('pendulo')}>Pêndulo Simples</div>
              <div className="di" onClick={() => (window as any).loadEx?.('pendulo_duplo')}>Pêndulo Duplo</div>
              <div className="di" onClick={() => (window as any).loadEx?.('mola')}>Oscilador Harmônico Simples</div>
              <div className="di" onClick={() => (window as any).loadEx?.('amortecido')}>Oscilador Amortecido</div>
              <div className="di" onClick={() => (window as any).loadEx?.('onda')}>Oscilador Forçado</div>
              <div className="dsep" />
              <div className="dcat">Outros</div>
              <div className="di" onClick={() => (window as any).loadEx?.('mola2d')}>Mola 2D</div>
              <div className="di" onClick={() => (window as any).loadEx?.('vanderpol')}>Van der Pol</div>
            </div>
          </div>
          <div className="di has-sub">
            Eletromagnetismo
            <div className="sub-drop">
              <div className="di" onClick={() => (window as any).loadEx?.('rc')}>Circuito RC</div>
              <div className="di" onClick={() => (window as any).loadEx?.('cargas')}>Cargas Elétricas</div>
              <div className="di" onClick={() => (window as any).loadEx?.('campo_eletrico')}>Campo Vetorial</div>
            </div>
          </div>
          <div className="di has-sub">
            Sistemas Complexos
            <div className="sub-drop">
              <div className="di" onClick={() => (window as any).loadEx?.('lotka')}>Lotka-Volterra</div>
              <div className="di" onClick={() => (window as any).loadEx?.('lorenz')}>Atrator de Lorenz</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mitem" onClick={(e) => (window as any).toggleMenu?.(e.currentTarget)}>
        Visualização
        <div className="drop">
          <div className="di" onClick={() => (window as any).toggleGrid?.()}>⊞ Grade</div>
          <div className="di" onClick={() => (window as any).toggleAxes?.()}>↔ Eixos</div>
          <div className="di" onClick={() => (window as any).clearTrails?.()}>✕ Limpar Rastros</div>
          <div className="dsep" />
          <div className="di" onClick={() => (window as any).resetView?.()}>⊙ Centralizar Vista</div>
        </div>
      </div>

      <div className="mitem" onClick={(e) => (window as any).toggleMenu?.(e.currentTarget)}>
        Ajuda
        <div className="drop">
          <div className="di" onClick={() => (window as any).showHelp?.()}>Sintaxe das Equações</div>
          <div className="di" onClick={() => (window as any).showAbout?.()}>Sobre</div>
        </div>
      </div>

      <button id="theme-btn" onClick={() => (window as any).toggleTheme?.()} title="Alternar tema claro/escuro">☾</button>
    </div>
  );
}
