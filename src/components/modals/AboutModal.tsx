'use client';
import { useEffect, useState } from 'react';
import { t, onLocaleChange } from '@/lib/i18n';

const close = () => document.getElementById('about-modal-overlay')?.classList.remove('show');

export default function AboutModal() {
  const [text, setText] = useState(() => {
    const tr = t();
    return { close: tr.modals.close, graphs: tr.about.graphs, equations: tr.about.equations };
  });

  useEffect(() => {
    const updateText = () => {
      const tr = t();
      setText({ close: tr.modals.close, graphs: tr.about.graphs, equations: tr.about.equations });
    };
    const unsub = onLocaleChange(updateText);
    return unsub;
  }, []);

  return (
    <div id="about-modal-overlay">
      <div id="about-modal">
        <div className="about-hero">
          <div className="about-logo"><img src="/favicon.ico" alt="BOSCO LAB" /></div>
          <div className="about-logo">BOSCO<a style={{ color: 'orange' }}>LAB</a></div>
          <div className="about-sub">Interactive Computational Physics Simulator</div>
        </div>
        <div className="about-body">
          <div className="about-row"><span className="label">Version</span><span className="val">1.0.0-AR — 2026</span></div>
          <div className="about-row"><span className="label">Author</span><span className="val">J. Caraumã</span><a href="https://github.com/jancarauma" target="_blank" rel="noopener">github.com/jancarauma ↗</a></div>
          <div className="about-row"><span className="label">Website</span><span className="val">Learn more at</span><a href="https://carauma.com" target="_blank" rel="noopener">carauma.com ↗</a></div>
          <div className="about-row"><span className="label">Copyright</span><span className="val">© All rights reserved</span></div>
          <div className="about-row"><span className="label">Math Parser</span><span className="val">Recursive substitution</span></div>
          <div className="about-row"><span className="label">Integrators</span><span className="val">Euler · RK4 (Runge-Kutta 4th order)</span></div>
          <div className="about-row"><span className="label">{text.graphs}</span><span className="val">LTTB decimation (Largest-Triangle-Three-Buckets)</span></div>
          <div className="about-row"><span className="label">{text.equations}</span><span className="val"><a href="https://cortexjs.io/mathlive/" target="_blank" rel="noopener">MathLive 0.99 ↗</a></span></div>
        </div>
        <div className="about-footer">
          <button className="dlg-btn ok" onClick={close}>{text.close}</button>
        </div>
      </div>
    </div>
  );
}
