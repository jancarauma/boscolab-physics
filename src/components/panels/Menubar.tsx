'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { t, getLocale, setLocale, loadLocale, onLocaleChange, type Locale, translations } from '@/lib/i18n';

const LOCALE_FLAGS: Record<Locale, string> = { pt: '🇧🇷', en: '🇺🇸', es: '🇪🇸', zh: '🇨🇳' };

const LOGO_PARTS = [
  { text: 'BOSCO', orange: false },
  { text: 'LAB',   orange: true  },
] as const;

function WaveLogo() {
  const [active, setActive] = useState(false);
  let charIdx = 0;
  return (
    <Link href="/" style={{ textDecoration: 'none' }}>
      <span
        className={`logo wave-text wave-text--logo${active ? ' wave-active' : ''}`}
        style={{ cursor: 'pointer' }}
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        onTouchStart={() => setActive(true)}
        onTouchEnd={() => setActive(false)}
        onTouchCancel={() => setActive(false)}
      >
        {LOGO_PARTS.map(({ text, orange }) =>
          text.split('').map(ch => {
            const delay = charIdx++ * 60;
            return (
              <span
                key={`${text}-${delay}`}
                className="wave-char"
                style={{ animationDelay: `${delay}ms`, color: orange ? 'orange' : undefined }}
              >
                {ch}
              </span>
            );
          })
        )}
      </span>
    </Link>
  );
}
const LOCALE_LABELS: Record<Locale, string> = { pt: 'Português', en: 'English', es: 'Español', zh: '中文' };
type SimMethod = 'euler' | 'rk4';
type TrailMode = 'fade' | 'persist' | 'dots' | 'none';
type AngleUnit = 'rad' | 'deg';

export default function Menubar() {
  const [locale, setLocaleState] = useState<Locale>('pt');
  const [method, setMethod] = useState<SimMethod>('rk4');
  const [trailMode, setTrailMode] = useState<TrailMode>('persist');
  const [angleUnit, setAngleUnit] = useState<AngleUnit>('rad');

  useEffect(() => {
    setLocaleState(loadLocale());
    const unsub = onLocaleChange(l => setLocaleState(l));
    return unsub;
  }, []);

  useEffect(() => {
    const syncFromWindow = () => {
      const nextMethod = (window as any).getSimMethod?.();
      const nextTrailMode = (window as any).getGlobalTrailMode?.();
      const nextAngleUnit = (window as any).getAngleUnit?.();
      if (nextMethod === 'euler' || nextMethod === 'rk4') setMethod(nextMethod);
      if (nextTrailMode === 'fade' || nextTrailMode === 'persist' || nextTrailMode === 'dots' || nextTrailMode === 'none') setTrailMode(nextTrailMode);
      if (nextAngleUnit === 'rad' || nextAngleUnit === 'deg') setAngleUnit(nextAngleUnit);
    };

    const onMethodChange = (event: Event) => {
      const nextMethod = (event as CustomEvent<SimMethod>).detail;
      if (nextMethod === 'euler' || nextMethod === 'rk4') setMethod(nextMethod);
    };

    const onTrailModeChange = (event: Event) => {
      const nextTrailMode = (event as CustomEvent<TrailMode>).detail;
      if (nextTrailMode === 'fade' || nextTrailMode === 'persist' || nextTrailMode === 'dots' || nextTrailMode === 'none') setTrailMode(nextTrailMode);
    };

    const onAngleUnitChange = (event: Event) => {
      const nextUnit = (event as CustomEvent<AngleUnit>).detail;
      if (nextUnit === 'rad' || nextUnit === 'deg') setAngleUnit(nextUnit);
    };

    syncFromWindow();
    window.addEventListener('boscolab:method-change', onMethodChange as EventListener);
    window.addEventListener('boscolab:trail-mode-change', onTrailModeChange as EventListener);
    window.addEventListener('boscolab:angle-unit-change', onAngleUnitChange as EventListener);

    return () => {
      window.removeEventListener('boscolab:method-change', onMethodChange as EventListener);
      window.removeEventListener('boscolab:trail-mode-change', onTrailModeChange as EventListener);
      window.removeEventListener('boscolab:angle-unit-change', onAngleUnitChange as EventListener);
    };
  }, []);

  const tr = t();

  function changeLocale(l: Locale) {
    setLocale(l);
    (window as any).__locale = l;
  }

  function changeMethod(nextMethod: SimMethod) {
    setMethod(nextMethod);
    (window as any).setSimMethod?.(nextMethod);
  }

  function changeTrailMode(nextTrailMode: TrailMode) {
    setTrailMode(nextTrailMode);
    (window as any).setGlobalTrailMode?.(nextTrailMode);
  }

  function changeAngleUnit(unit: AngleUnit) {
    setAngleUnit(unit);
    (window as any).setAngleUnit?.(unit);
  }

  return (
    <div id="menubar">
      <WaveLogo />

      {/* --- Arquivo ---------- */}
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

      {/* --- Editar ---------- */}
      <div className="mitem" onClick={(e) => (window as any).toggleMenu?.(e.currentTarget)}>
        {tr.menu.edit}
        <div className="drop">
          <div className="di" onClick={() => (window as any).undoUndo?.()}>{tr.toolbar.undoTooltip} <span className="sc">Ctrl+Z</span></div>
          <div className="di" onClick={() => (window as any).undoRedo?.()}>{tr.toolbar.redoTooltip} <span className="sc">Ctrl+Y</span></div>
        </div>
      </div>

      {/* --- Exibir ---------- */}
      <div className="mitem" onClick={(e) => (window as any).toggleMenu?.(e.currentTarget)}>
        {tr.menu.view}
        <div className="drop">
          <div className="di" onClick={() => (window as any).toggleGrid?.()}>{tr.view.grid}</div>
          <div className="di" onClick={() => (window as any).toggleAxes?.()}>{tr.view.axes}</div>          
          <div className="di" onClick={() => (window as any).clearTrails?.()}>{tr.view.clearTrails}</div>
          <div className="dsep" />
          <div className="di" onClick={() => (window as any).resetView?.()}>{tr.view.centerView}</div>
          <div className="dsep" />
          <div className="di has-sub">
            {tr.particle.trail}
            <div className="sub-drop" style={{ minWidth: 180 }}>
              <div className="di" onClick={() => changeTrailMode('fade')} style={trailMode === 'fade' ? { color: 'var(--acc)', fontWeight: 600 } : {}}>
                {tr.trailMode.temporary}
                {trailMode === 'fade' && <span style={{ marginLeft: 'auto', fontSize: 10 }}>✓</span>}
              </div>
              <div className="di" onClick={() => changeTrailMode('persist')} style={trailMode === 'persist' ? { color: 'var(--acc)', fontWeight: 600 } : {}}>
                {tr.trailMode.persistent}
                {trailMode === 'persist' && <span style={{ marginLeft: 'auto', fontSize: 10 }}>✓</span>}
              </div>
              <div className="di" onClick={() => changeTrailMode('dots')} style={trailMode === 'dots' ? { color: 'var(--acc)', fontWeight: 600 } : {}}>
                {tr.trailMode.ghosts}
                {trailMode === 'dots' && <span style={{ marginLeft: 'auto', fontSize: 10 }}>✓</span>}
              </div>
              <div className="di" onClick={() => changeTrailMode('none')} style={trailMode === 'none' ? { color: 'var(--acc)', fontWeight: 600 } : {}}>
                {tr.trailMode.none}
                {trailMode === 'none' && <span style={{ marginLeft: 'auto', fontSize: 10 }}>✓</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Exemplos ---------- */}
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
              <div className="di" onClick={() => (window as any).loadEx?.('campo_magnetico_terrestre')}>{tr.exItems.campo_magnetico_terrestre}</div>
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

      {/* --- Opções ---------- */}
      <div className="mitem" onClick={(e) => (window as any).toggleMenu?.(e.currentTarget)}>
        {tr.menu.options}
        <div className="drop" style={{ minWidth: 180 }}>

          {/* Precisão */}
          <div className="di" onClick={() => (window as any).showPrecisionModal?.()}>
            {tr.options.precision}
          </div>

          {/* Método de cálculo da simulação */}
          <div className="di has-sub">
            {tr.settings.method}
            <div className="sub-drop" style={{ minWidth: 150 }}>
              <div className="di" onClick={() => changeMethod('euler')} style={method === 'euler' ? { color: 'var(--acc)', fontWeight: 600 } : {}}>
                {tr.settings.euler}
                {method === 'euler' && <span style={{ marginLeft: 'auto', fontSize: 10 }}>✓</span>}
              </div>
              <div className="di" onClick={() => changeMethod('rk4')} style={method === 'rk4' ? { color: 'var(--acc)', fontWeight: 600 } : {}}>
                {tr.settings.rk4}
                {method === 'rk4' && <span style={{ marginLeft: 'auto', fontSize: 10 }}>✓</span>}
              </div>
            </div>
          </div>

          {/* Unidade de ângulo */}
          <div className="di has-sub">
            {tr.options.angleUnit}
            <div className="sub-drop" style={{ minWidth: 160 }}>
              <div className="di" onClick={() => changeAngleUnit('rad')} style={angleUnit === 'rad' ? { color: 'var(--acc)', fontWeight: 600 } : {}}>
                {tr.options.radians}
                {angleUnit === 'rad' && <span style={{ marginLeft: 'auto', fontSize: 10 }}>✓</span>}
              </div>
              <div className="di" onClick={() => changeAngleUnit('deg')} style={angleUnit === 'deg' ? { color: 'var(--acc)', fontWeight: 600 } : {}}>
                {tr.options.degrees}
                {angleUnit === 'deg' && <span style={{ marginLeft: 'auto', fontSize: 10 }}>✓</span>}
              </div>
            </div>
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

      {/* --- Ajuda ---------- */}
      <div className="mitem" onClick={(e) => (window as any).toggleMenu?.(e.currentTarget)}>
        {tr.menu.help}
        <div className="drop">
          <div className="di" onClick={() => (window as any).showHelp?.()}>{tr.help.syntax}</div>
          <div className="di" onClick={() => (window as any).showAbout?.()}>{tr.help.about}</div>
        </div>
      </div>

      <button id="theme-btn" onClick={() => (window as any).toggleTheme?.()} title={tr.ui.toggleTheme}>☾</button>
    </div>
  );
}
