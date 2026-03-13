'use client';
import { useEffect, useState } from 'react';
import { t, onLocaleChange } from '@/lib/i18n';

export default function Toolbar() {
  const [text, setText] = useState(() => {
    const tr = t();
    return {
      undo: tr.toolbar.undoTooltip,
      redo: tr.toolbar.redoTooltip,
      method: tr.settings.method,
      euler: tr.settings.euler,
      rk4: tr.settings.rk4,
      initialConditions: tr.ui.initialConditions,
      trail: tr.particle.trail,
      trailTemporary: tr.trailMode.temporary,
      trailPersistent: tr.trailMode.persistent,
      trailGhosts: tr.trailMode.ghosts,
      trailNone: tr.trailMode.none,
      globalTrailMode: tr.ui.globalTrailMode,
    };
  });

  useEffect(() => {
    const updateText = () => {
      const tr = t();
      setText({
        undo: tr.toolbar.undoTooltip,
        redo: tr.toolbar.redoTooltip,
        method: tr.settings.method,
        euler: tr.settings.euler,
        rk4: tr.settings.rk4,
        initialConditions: tr.ui.initialConditions,
        trail: tr.particle.trail,
        trailTemporary: tr.trailMode.temporary,
        trailPersistent: tr.trailMode.persistent,
        trailGhosts: tr.trailMode.ghosts,
        trailNone: tr.trailMode.none,
        globalTrailMode: tr.ui.globalTrailMode,
      });
    };
    const unsub = onLocaleChange(updateText);
    return unsub;
  }, []);

  return (
    <div id="toolbar">
      <button className="btn" id="btn-undo" onClick={() => (window as any).undoUndo?.()} title={text.undo}>{text.undo.split(' ')[0]}</button>
      <button className="btn" id="btn-redo" onClick={() => (window as any).undoRedo?.()} title={text.redo}>{text.redo.split(' ')[0]}</button>
      <div className="tbsep" />
      <span className="tblabel">{text.method}</span>
      <select className="tbsel" id="sel-method" >
        <option value="euler">{text.euler}</option>
        <option value="rk4" defaultValue="rk4">{text.rk4}</option>
      </select>
      <div className="tbsep" />
      <button className="btn" onClick={() => (window as any).toggleIC?.()}>⚙ {text.initialConditions}</button>
      <div className="tbsep" />
      <span className="tblabel">{text.trail}</span>
      <select className="tbsel" id="sel-trail-mode" onChange={(e) => (window as any).setGlobalTrailMode?.(e.target.value)} title={text.globalTrailMode}>
        <option value="fade">{text.trailTemporary}</option>
        <option value="persist" defaultValue="persist">{text.trailPersistent}</option>
        <option value="dots">{text.trailGhosts}</option>
        <option value="none">{text.trailNone}</option>
      </select>
    </div>
  );
}
