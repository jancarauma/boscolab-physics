'use client';
import { useEffect, useState } from 'react';
import { t, onLocaleChange } from '@/lib/i18n';

export default function Toolbar() {
  const [text, setText] = useState(() => {
    const tr = t();
    return {
      play: tr.toolbar.play,
      pause: tr.toolbar.pause,
      restart: tr.toolbar.restart,
      undo: tr.toolbar.undoTooltip,
      redo: tr.toolbar.redoTooltip,
      method: tr.settings.method,
      euler: tr.settings.euler,
      rk4: tr.settings.rk4,
      timeStep: tr.settings.timeStep,
      maxTime: tr.settings.maxTime,
      speed: tr.settings.speed,
      time: tr.settings.time,
      steps: tr.settings.steps,
      initialConditions: tr.ui.initialConditions,
      trail: tr.particle.trail,
      trailTemporary: tr.trailMode.temporary,
      trailPersistent: tr.trailMode.persistent,
      trailGhosts: tr.trailMode.ghosts,
      trailNone: tr.trailMode.none,
    };
  });

  useEffect(() => {
    const updateText = () => {
      const tr = t();
      setText({
        play: tr.toolbar.play,
        pause: tr.toolbar.pause,
        restart: tr.toolbar.restart,
        undo: tr.toolbar.undoTooltip,
        redo: tr.toolbar.redoTooltip,
        method: tr.settings.method,
        euler: tr.settings.euler,
        rk4: tr.settings.rk4,
        timeStep: tr.settings.timeStep,
        maxTime: tr.settings.maxTime,
        speed: tr.settings.speed,
        time: tr.settings.time,
        steps: tr.settings.steps,
        initialConditions: tr.ui.initialConditions,
        trail: tr.particle.trail,
        trailTemporary: tr.trailMode.temporary,
        trailPersistent: tr.trailMode.persistent,
        trailGhosts: tr.trailMode.ghosts,
        trailNone: tr.trailMode.none,
      });
      // Update button text
      const btnPlay = document.getElementById('btn-play') as HTMLButtonElement;
      const btnPause = document.getElementById('btn-pause') as HTMLButtonElement;
      const btnReset = document.getElementById('btn-reset') as HTMLButtonElement;
      const btnUndo = document.getElementById('btn-undo') as HTMLButtonElement;
      const btnRedo = document.getElementById('btn-redo') as HTMLButtonElement;
      if (btnPlay) btnPlay.textContent = tr.toolbar.play;
      if (btnPause) btnPause.textContent = tr.toolbar.pause;
      if (btnReset) btnReset.textContent = tr.toolbar.restart;
      if (btnUndo) { btnUndo.title = tr.toolbar.undoTooltip; btnUndo.textContent = tr.toolbar.undo; }
      if (btnRedo) { btnRedo.title = tr.toolbar.redoTooltip; btnRedo.textContent = tr.toolbar.redo; }
      
      // Update settings labels
      const lblMethod = document.querySelector('span.tblabel:nth-of-type(1)') as HTMLElement;
      const lblDt = document.querySelector('span.tblabel:nth-of-type(2)') as HTMLElement;
      const lblTmax = document.querySelector('span.tblabel:nth-of-type(3)') as HTMLElement;
      const lblSpeed = document.querySelector('span.tblabel:nth-of-type(4)') as HTMLElement;
      const lblT = document.querySelector('span.tblabel:nth-of-type(5)') as HTMLElement;
      const lblN = document.querySelector('span.tblabel:nth-of-type(6)') as HTMLElement;
      const selMethod = document.getElementById('sel-method') as HTMLSelectElement;
      const btnIC = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('⚙'));
      const lblTrail = document.querySelector('span.tblabel:nth-of-type(7)') as HTMLElement;
      const selTrailMode = document.getElementById('sel-trail-mode') as HTMLSelectElement;
      
      if (lblMethod) lblMethod.textContent = tr.settings.method;
      if (lblDt) lblDt.textContent = tr.settings.timeStep;
      if (lblTmax) lblTmax.textContent = tr.settings.maxTime;
      if (lblSpeed) lblSpeed.textContent = tr.settings.speed;
      if (lblT) lblT.textContent = tr.settings.time;
      if (lblN) lblN.textContent = tr.settings.steps;
      if (selMethod && selMethod.options) {
        selMethod.options[0].textContent = tr.settings.euler;
        selMethod.options[1].textContent = tr.settings.rk4;
      }
      if (btnIC) btnIC.textContent = '⚙ ' + tr.ui.initialConditions;
      if (lblTrail) lblTrail.textContent = tr.particle.trail;
      if (selTrailMode && selTrailMode.options) {
        selTrailMode.options[0].textContent = tr.trailMode.temporary;
        selTrailMode.options[1].textContent = tr.trailMode.persistent;
        selTrailMode.options[2].textContent = tr.trailMode.ghosts;
        selTrailMode.options[3].textContent = tr.trailMode.none;
      }
    };
    const unsub = onLocaleChange(updateText);
    return unsub;
  }, []);

  return (
    <div id="toolbar">
      <div className="statusdot" id="statusdot" />
      <button className="btn primary" id="btn-play" onClick={() => (window as any).simPlay?.()}>{text.play}</button>
      <button className="btn" id="btn-pause" onClick={() => (window as any).simPause?.()}>{text.pause}</button>
      <button className="btn" id="btn-reset" onClick={() => (window as any).simReset?.()}>{text.restart}</button>
      <button className="btn" id="btn-back" onClick={() => (window as any).simBack?.()}>◀|</button>
      <button className="btn" id="btn-step" onClick={() => (window as any).simStep?.()}>|▶</button>
      <div className="tbsep" />
      <button className="btn" id="btn-undo" onClick={() => (window as any).undoUndo?.()} title={text.undo}>{text.undo.split(' ')[0]}</button>
      <button className="btn" id="btn-redo" onClick={() => (window as any).undoRedo?.()} title={text.redo}>{text.redo.split(' ')[0]}</button>
      <div className="tbsep" />
      <span className="tblabel">{text.method}</span>
      <select className="tbsel" id="sel-method" >
        <option value="euler">{text.euler}</option>
        <option value="rk4" defaultValue="rk4">{text.rk4}</option>
      </select>
      <div className="tbsep" />
      <span className="tblabel">{text.timeStep}</span>
      <input className="tbinp" id="inp-dt" defaultValue="0.01"  />
      <span className="tblabel">{text.maxTime}</span>
      <input className="tbinp" id="inp-tmax" defaultValue="10"  />
      <span className="tblabel">{text.speed}</span>
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
      <span className="tblabel">{text.time}</span>
      <div className="tbval" id="disp-t">0.000</div>
      <span className="tblabel">{text.steps}</span>
      <div className="tbval" id="disp-n" style={{ minWidth: 52 }}>0</div>
      <div className="tbsep" />
      <button className="btn" onClick={() => (window as any).toggleIC?.()}>⚙ {text.initialConditions}</button>
      <div className="tbsep" />
      <span className="tblabel">{text.trail}</span>
      <select className="tbsel" id="sel-trail-mode" onChange={(e) => (window as any).setGlobalTrailMode?.(e.target.value)} title="Global trail mode">
        <option value="fade">{text.trailTemporary}</option>
        <option value="persist" defaultValue="persist">{text.trailPersistent}</option>
        <option value="dots">{text.trailGhosts}</option>
        <option value="none">{text.trailNone}</option>
      </select>
    </div>
  );
}
