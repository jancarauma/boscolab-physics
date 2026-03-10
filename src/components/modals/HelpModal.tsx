'use client';
const close = () => document.getElementById('help-modal-overlay')?.classList.remove('show');

export default function HelpModal() {
  return (
    <div id="help-modal-overlay">
      <div id="help-modal">
        <div id="help-modal-hdr">
          <span className="hm-title">Ajuda — Sintaxe</span>
        </div>
        <div id="help-modal-body">
          <div className="help-section">
            <h3>Atalhos de Teclado</h3>
            <div className="help-key-row"><span className="help-key">Ctrl+N</span><span className="help-key-desc">Novo projeto</span></div>
            <div className="help-key-row"><span className="help-key">Ctrl+S</span><span className="help-key-desc">Salvar arquivo .modx</span></div>
            <div className="help-key-row"><span className="help-key">Espaço</span><span className="help-key-desc">Iniciar / Parar simulação</span></div>
            <div className="help-key-row"><span className="help-key">R</span><span className="help-key-desc">Reiniciar simulação a partir do início</span></div>
            <div className="help-key-row"><span className="help-key">.</span><span className="help-key-desc">Executar passo para frente</span></div>
            <div className="help-key-row"><span className="help-key">,</span><span className="help-key-desc">Executar passo para trás</span></div>
            <div className="help-key-row"><span className="help-key">Del</span><span className="help-key-desc">Remover objeto selecionado</span></div>
          </div>
          <div className="help-section">
            <h3>Declarações</h3>
            <div className="help-grid">
              <div className="help-card"><code>x(t+dt) = x(t) + vx*dt</code><small>Iterativa — exemplo de definição com tempo (t)</small></div>
              <div className="help-card"><code>dx/dt = vx</code><small>Diferencial — integrada através do método de Euler ou de RK4</small></div>
              <div className="help-card"><code>g = 9.8</code><small>Constante — valor numérico fixo</small></div>
              <div className="help-card"><code>r = sqrt(x^2 + y^2)</code><small>Expressão — recalculada a cada passo</small></div>
            </div>
          </div>
          <div className="help-section">
            <h3>Funções Disponíveis</h3>
            <div className="help-fn-list">
              {['sin(x)', 'cos(x)', 'tan(x)', 'asin(x)', 'acos(x)', 'atan(x)', 'atan2(y,x)', 'sqrt(x)', 'abs(x)', 'exp(x)', 'ln(x)', 'log10(x)', 'floor(x)', 'ceil(x)', 'round(x)', 'sign(x)', 'min(a,b)', 'max(a,b)'].map(fn => (
                <span key={fn} className="help-fn">{fn}</span>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: 'var(--txt3)' }}>Constantes: <span className="help-fn">pi</span> <span className="help-fn">e</span> &nbsp;·&nbsp; Potência: <span className="help-fn">x^2</span></div>
          </div>
          <div className="help-section">
            <h3>Condicional</h3>
            <div className="help-card" style={{ maxWidth: '100%' }}>
              <code>if(cond, valorSeVerdadeiro, valorSeFalso)</code>
              <small>Exemplo: <code style={{ color: 'var(--acc3)' }}>vy(t+dt) = vy(t) + if(y &gt; 0, -g, 0)*dt</code></small>
            </div>
          </div>
          <div className="help-section">
            <h3>Dicas de Uso</h3>
            <div style={{ fontSize: 12, color: 'var(--txt2)', lineHeight: 1.8 }}>
              • Arraste objetos na área de animação para reposicioná-los visualmente.<br />
              • <strong>Shift+arraste</strong> modifica as condições iniciais em tempo real.<br />
              • Use scroll do mouse para zoom na animação.<br />
              • Salve sua simulação: <strong>.modx</strong> (arquivo do tipo XML).<br />
              • O método <strong>RK4</strong> é mais preciso para sistemas físicos contínuos.
            </div>
          </div>
        </div>
        <div id="help-modal-footer">
          <button className="dlg-btn ok" onClick={close}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
