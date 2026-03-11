'use client';

import { useState, useEffect } from 'react';
import { t, getLocale, setLocale, loadLocale, onLocaleChange, type Locale, translations } from '@/lib/i18n';

const LOCALE_FLAGS: Record<Locale, string> = { pt: '🇧🇷', en: '🇺🇸', es: '🇪🇸', zh: '🇨🇳' };
const LOCALE_LABELS: Record<Locale, string> = { pt: 'Português', en: 'English', es: 'Español', zh: '中文' };

export default function Menubar() {
  const [locale, setLocaleState] = useState<Locale>('pt');

  useEffect(() => {
    setLocaleState(loadLocale());
    const unsub = onLocaleChange(l => setLocaleState(l));
    return unsub;
  }, []);

  const tr = t();

  function changeLocale(l: Locale) {
    setLocale(l);
    (window as any).__locale = l;
  }

  return (
    <div id="menubar">
      <span className="logo">BOSCO<a style={{ color: 'orange' }}>LAB</a></span>

      {/* ── Arquivo ─────────────────────────────────────────────────────── */}
      <div className="mitem" onClick={(e) => (window as any).toggleMenu?.(e.currentTarget)}>
        {tr.menu.file}
        <div className="drop">
          <div className="di" onClick={() => (window as any).newProject?.()}>{tr.file.new} <span className="sc">Ctrl+N</span></div>
          <div className="di" onClick={() => (window as any).openFile?.()}>{tr.file.open} <span className="sc">Ctrl+O</span></div>
          <div className="dsep" />
          <div className="di" onClick={() => (window as any).saveFile?.()}>{tr.file.save} <span className="sc">Ctrl+S</span></div>
          <div className="dsep" />
          <div className="di" onClick={() => (window as any).exportCSV?.()}>{tr.file.exportData}</div>
          <div className="di" onClick={() => (window as any).exportPNG?.()}>{tr.file.exportImage}</div>
        </div>
      </div>

      {/* ── Exibir ──────────────────────────────────────────────────────── */}
      <div className="mitem" onClick={(e) => (window as any).toggleMenu?.(e.currentTarget)}>
        {tr.menu.view}
        <div className="drop">
          <div className="di" onClick={() => (window as any).toggleGrid?.()}>{tr.view.grid}</div>
          <div className="di" onClick={() => (window as any).toggleAxes?.()}>{tr.view.axes}</div>
          <div className="di" onClick={() => (window as any).clearTrails?.()}>{tr.view.clearTrails}</div>
          <div className="dsep" />
          <div className="di" onClick={() => (window as any).resetView?.()}>{tr.view.centerView}</div>
        </div>
      </div>

      {/* ── Exemplos ────────────────────────────────────────────────────── */}
      <div className="mitem" onClick={(e) => (window as any).toggleMenu?.(e.currentTarget)}>
        {tr.menu.examples}
        <div className="drop" style={{ minWidth: 210 }}>
          <div className="di has-sub">
            {tr.exCategories.mechanics}
            <div className="sub-drop">
              <div className="dcat">{tr.exCategories.kinematics}</div>
              <div className="di" onClick={() => (window as any).loadEx?.('projetil')}>{tr.exItems.projetil}</div>
              <div className="di" onClick={() => (window as any).loadEx?.('projetil_drag')}>{tr.exItems.projetil_drag}</div>
              <div className="dsep" />
              <div className="dcat">{tr.exCategories.gravitation}</div>
              <div className="di" onClick={() => (window as any).loadEx?.('queda')}>{tr.exItems.queda}</div>
              <div className="di" onClick={() => (window as any).loadEx?.('queda_lua')}>{tr.exItems.queda_lua}</div>
              <div className="di" onClick={() => (window as any).loadEx?.('orbita')}>{tr.exItems.orbita}</div>
              <div className="di" onClick={() => (window as any).loadEx?.('orbita3')}>{tr.exItems.orbita3}</div>
              <div className="di" onClick={() => (window as any).loadEx?.('solar')}>{tr.exItems.solar}</div>
            </div>
          </div>
          <div className="di has-sub">
            {tr.exCategories.waves}
            <div className="sub-drop">
              <div className="dcat">{tr.exCategories.waves}</div>
              <div className="di" onClick={() => (window as any).loadEx?.('batimento')}>{tr.exItems.batimento}</div>
              <div className="dsep" />
              <div className="dcat">{tr.exCategories.oscillations}</div>
              <div className="di" onClick={() => (window as any).loadEx?.('pendulo')}>{tr.exItems.pendulo}</div>
              <div className="di" onClick={() => (window as any).loadEx?.('pendulo_duplo')}>{tr.exItems.pendulo_duplo}</div>
              <div className="di" onClick={() => (window as any).loadEx?.('mola')}>{tr.exItems.mola}</div>
              <div className="di" onClick={() => (window as any).loadEx?.('amortecido')}>{tr.exItems.amortecido}</div>
              <div className="di" onClick={() => (window as any).loadEx?.('onda')}>{tr.exItems.onda}</div>
              <div className="dsep" />
              <div className="dcat">{tr.exCategories.other}</div>
              <div className="di" onClick={() => (window as any).loadEx?.('mola2d')}>{tr.exItems.mola2d}</div>
              <div className="di" onClick={() => (window as any).loadEx?.('vanderpol')}>{tr.exItems.vanderpol}</div>
            </div>
          </div>
          <div className="di has-sub">
            {tr.exCategories.electromagnetism}
            <div className="sub-drop">
              <div className="di" onClick={() => (window as any).loadEx?.('rc')}>{tr.exItems.rc}</div>
              <div className="di" onClick={() => (window as any).loadEx?.('cargas')}>{tr.exItems.cargas}</div>
              <div className="di" onClick={() => (window as any).loadEx?.('campo_eletrico')}>{tr.exItems.campo_eletrico}</div>
            </div>
          </div>
          <div className="di has-sub">
            {tr.exCategories.complex}
            <div className="sub-drop">
              <div className="di" onClick={() => (window as any).loadEx?.('lotka')}>{tr.exItems.lotka}</div>
              <div className="di" onClick={() => (window as any).loadEx?.('lorenz')}>{tr.exItems.lorenz}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Opções ──────────────────────────────────────────────────────── */}
      <div className="mitem" onClick={(e) => (window as any).toggleMenu?.(e.currentTarget)}>
        {tr.menu.options}
        <div className="drop" style={{ minWidth: 180 }}>

          {/* Precisão */}
          <div className="di" onClick={() => (window as any).showPrecisionModal?.()}>
            {tr.options.precision}
          </div>

          <div className="dsep" />

          {/* Idioma com submenu */}
          <div className="di has-sub">
            {tr.options.language} <span style={{ opacity: 0.6, fontSize: 11 }}>{LOCALE_FLAGS[locale]}</span>
            <div className="sub-drop" style={{ minWidth: 150 }}>
              {(Object.keys(translations) as Locale[]).map(l => (
                <div key={l} className="di" onClick={() => changeLocale(l)}
                  style={l === locale ? { color: 'var(--acc)', fontWeight: 600 } : {}}>
                  {LOCALE_FLAGS[l]} {LOCALE_LABELS[l]}
                  {l === locale && <span style={{ marginLeft: 6, fontSize: 10 }}>✓</span>}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Ajuda ───────────────────────────────────────────────────────── */}
      <div className="mitem" onClick={(e) => (window as any).toggleMenu?.(e.currentTarget)}>
        {tr.menu.help}
        <div className="drop">
          <div className="di" onClick={() => (window as any).showHelp?.()}>{tr.help.syntax}</div>
          <div className="di" onClick={() => (window as any).showAbout?.()}>{tr.help.about}</div>
        </div>
      </div>

      <button id="theme-btn" onClick={() => (window as any).toggleTheme?.()} title="Alternar tema">☾</button>
    </div>
  );
}
