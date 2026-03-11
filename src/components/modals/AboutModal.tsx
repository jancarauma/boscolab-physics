'use client';
const close = () => document.getElementById('about-modal-overlay')?.classList.remove('show');

export default function AboutModal() {
  return (
    <div id="about-modal-overlay">
      <div id="about-modal">
        <div className="about-hero">
          <div className="about-logo"><img src="/favicon.ico" alt="BOSCO LAB" /></div>
          <div className="about-logo">BOSCO<a style={{ color: 'orange' }}>LAB</a></div>
          <div className="about-sub">Simulador de Fisica Computacional Interativo</div>
        </div>
        <div className="about-body">
          <div className="about-row"><span className="label">Versão</span><span className="val">1.0.0-AR — 2026</span></div>
          <div className="about-row"><span className="label">Autor</span><span className="val">J. Caraumã</span><a href="https://github.com/jancarauma" target="_blank" rel="noopener">github.com/jancarauma ↗</a></div>
          <div className="about-row"><span className="label">Website</span><span className="val">Saiba mais em</span><a href="https://carauma.com" target="_blank" rel="noopener">carauma.com ↗</a></div>
          <div className="about-row"><span className="label">Copyright</span><span className="val">© Todos os direitos reservados</span></div>
          <div className="about-row"><span className="label">Math Parser</span><span className="val">Recursive substitution</span></div>
          <div className="about-row"><span className="label">Integradores</span><span className="val">Euler · RK4 (Runge-Kutta 4th order)</span></div>
          <div className="about-row"><span className="label">Gráficos</span><span className="val">LTTB decimation (Largest-Triangle-Three-Buckets)</span></div>
          <div className="about-row"><span className="label">Equações</span><span className="val"><a href="https://cortexjs.io/mathlive/" target="_blank" rel="noopener">MathLive 0.99 ↗</a></span></div>
        </div>
        <div className="about-footer">
          <button className="dlg-btn ok" onClick={close}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
