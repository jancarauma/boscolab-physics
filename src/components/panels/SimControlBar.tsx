'use client';

import { useEffect, useState } from 'react';
import { onLocaleChange, t } from '@/lib/i18n';

export default function SimControlBar() {
  const [text, setText] = useState(() => {
    const tr = t();
    return {
      play: tr.toolbar.play,
      pause: tr.toolbar.pause,
      restart: tr.toolbar.restart,
      stepBack: tr.toolbar.stepBack,
      stepForward: tr.toolbar.stepForward,
      timeStep: tr.settings.timeStep,
      maxTime: tr.settings.maxTime,
      speed: tr.settings.speed,
      indVar: tr.settings.indVar,
      time: tr.settings.time,
      steps: tr.settings.steps,
      timeline: tr.ui.timeline,
    };
  });

  useEffect(() => {
    const updateText = () => {
      const tr = t();
      setText({
        play: tr.toolbar.play,
        pause: tr.toolbar.pause,
        restart: tr.toolbar.restart,
        stepBack: tr.toolbar.stepBack,
        stepForward: tr.toolbar.stepForward,
        timeStep: tr.settings.timeStep,
        maxTime: tr.settings.maxTime,
        speed: tr.settings.speed,
        indVar: tr.settings.indVar,
        time: tr.settings.time,
        steps: tr.settings.steps,
        timeline: tr.ui.timeline,
      });
    };
    const unsub = onLocaleChange(updateText);
    return unsub;
  }, []);

  return (
    <div id="simbar">
      <div className="simbar-group simbar-group-run">
        <div className="statusdot" id="statusdot" />
        <button className="btn primary" id="btn-play" onClick={() => (window as any).simPlay?.()}>{text.play}</button>
        <button className="btn" id="btn-pause" onClick={() => (window as any).simPause?.()}>{text.pause}</button>
        <button className="btn" id="btn-back" onClick={() => (window as any).simBack?.()} title={text.stepBack}>◀|</button>
        <button className="btn" id="btn-step" onClick={() => (window as any).simStep?.()} title={text.stepForward}>|▶</button>
        <button className="btn" id="btn-reset" onClick={() => (window as any).simReset?.()}>{text.restart}</button>
      </div>

      <div className="seekbar-wrap" title={text.timeline}>
        <span className="tblabel">{text.timeline}</span>
        <input type="range" id="timeline-slider" min="0" max="0" defaultValue="0" step="1" />
        <div className="simbar-step-readout">
          <span className="tbval tbval-inline" id="disp-n">0</span>
          <span className="tblabel">/</span>
          <span className="tbval tbval-inline" id="disp-n-max">0</span>
        </div>
      </div>

      <div className="simbar-group simbar-group-state">
        <span className="tblabel">{text.time}</span>
        <div className="tbval" id="disp-t">0.000</div>
        <span className="tblabel">{text.steps}</span>
        <div className="tbval" style={{ minWidth: 52 }} id="disp-n-mirror">0</div>
      </div>

      <div className="tbsep" />

      <div className="simbar-group simbar-group-params">
        <span className="tblabel">{text.timeStep}</span>
        <input className="tbinp" id="inp-dt" defaultValue="0.01" />
        <span className="tblabel">{text.maxTime}</span>
        <input className="tbinp" id="inp-tmax" defaultValue="10" />
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
        <span className="tblabel">{text.indVar}</span>
        <input className="tbinp" id="inp-ind-var" defaultValue="t" />
      </div>
    </div>
  );
}
