'use client';

export default function Toolbar() {
  return (
    <div id="toolbar">
      <div className="statusdot" id="statusdot" />
      <button className="btn primary" id="btn-play" onClick={() => (window as any).simPlay?.()}>▶ Iniciar</button>
      <button className="btn" id="btn-pause" onClick={() => (window as any).simPause?.()}>⏸ Pausar</button>
      <button className="btn" id="btn-reset" onClick={() => (window as any).simReset?.()}>↺ Reset</button>
      <button className="btn" id="btn-back" onClick={() => (window as any).simBack?.()}>◀| Passo</button>
      <button className="btn" id="btn-step" onClick={() => (window as any).simStep?.()}>Passo |▶</button>
      <div className="tbsep" />
      <span className="tblabel">Método</span>
      <select className="tbsel" id="sel-method" >
        <option value="euler">Euler</option>
        <option value="rk4" defaultValue="rk4">RK4</option>
      </select>
      <div className="tbsep" />
      <span className="tblabel">dt</span>
      <input className="tbinp" id="inp-dt" defaultValue="0.01"  />
      <span className="tblabel">t max</span>
      <input className="tbinp" id="inp-tmax" defaultValue="10"  />
      <span className="tblabel">vel</span>
      <select className="tbsel" id="sel-speed" defaultValue="1">
        <option value="0.5">0.5×</option>
        <option value="1">1×</option>
        <option value="2">2×</option>
        <option value="5">5×</option>
        <option value="10">10×</option>
        <option value="30">30×</option>
        <option value="100">100×</option>
      </select>
      <div className="tbsep" />
      <span className="tblabel">t =</span>
      <div className="tbval" id="disp-t">0.000</div>
      <span className="tblabel">n =</span>
      <div className="tbval" id="disp-n" style={{ minWidth: 52 }}>0</div>
      <div className="tbsep" />
      <button className="btn" onClick={() => (window as any).toggleIC?.()}>⚙ Cond. Iniciais</button>
      <div className="tbsep" />
      <span className="tblabel">Rastro</span>
      <select className="tbsel" id="sel-trail-mode" onChange={(e) => (window as any).setGlobalTrailMode?.(e.target.value)} title="Modo de rastro global">
        <option value="fade">Temporário</option>
        <option value="persist" defaultValue="persist">Persistente</option>
        <option value="dots">Fantasmas</option>
        <option value="none">Sem rastro</option>
      </select>
    </div>
  );
}
