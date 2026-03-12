'use client';
import { useEffect, useState } from 'react';
import { t, onLocaleChange } from '@/lib/i18n';

const close = () => document.getElementById('about-modal-overlay')?.classList.remove('show');

export default function AboutModal() {
  const [text, setText] = useState(() => {
    const tr = t();
    return { close: tr.modals.close, subtitle: tr.about.subtitle, versionLabel: tr.about.versionLabel, authorLabel: tr.about.authorLabel, websiteLabel: tr.about.websiteLabel, websiteValue: tr.about.websiteValue, copyrightLabel: tr.about.copyrightLabel, copyrightValue: tr.about.copyrightValue, mathParserLabel: tr.about.mathParserLabel, mathParserValue: tr.about.mathParserValue, integratorsLabel: tr.about.integratorsLabel, integratorsValue: tr.about.integratorsValue, graphs: tr.about.graphs, equations: tr.about.equations };
  });

  useEffect(() => {
    const updateText = () => {
      const tr = t();
      setText({ close: tr.modals.close, subtitle: tr.about.subtitle, versionLabel: tr.about.versionLabel, authorLabel: tr.about.authorLabel, websiteLabel: tr.about.websiteLabel, websiteValue: tr.about.websiteValue, copyrightLabel: tr.about.copyrightLabel, copyrightValue: tr.about.copyrightValue, mathParserLabel: tr.about.mathParserLabel, mathParserValue: tr.about.mathParserValue, integratorsLabel: tr.about.integratorsLabel, integratorsValue: tr.about.integratorsValue, graphs: tr.about.graphs, equations: tr.about.equations });
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
          <div className="about-sub">{text.subtitle}</div>
        </div>
        <div className="about-body">
          <div className="about-row"><span className="label">{text.versionLabel}</span><span className="val">1.0.0-AR — 2026</span></div>
          <div className="about-row"><span className="label">{text.authorLabel}</span><span className="val">J. Caraumã</span><a href="https://github.com/jancarauma" target="_blank" rel="noopener">github.com/jancarauma ↗</a></div>
          <div className="about-row"><span className="label">{text.websiteLabel}</span><span className="val">{text.websiteValue}</span><a href="https://carauma.com" target="_blank" rel="noopener">carauma.com ↗</a></div>
          <div className="about-row"><span className="label">{text.copyrightLabel}</span><span className="val">{text.copyrightValue}</span></div>
          <div className="about-row"><span className="label">{text.mathParserLabel}</span><span className="val">{text.mathParserValue}</span></div>
          <div className="about-row"><span className="label">{text.integratorsLabel}</span><span className="val">{text.integratorsValue}</span></div>
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
