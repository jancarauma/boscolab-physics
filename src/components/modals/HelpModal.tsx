'use client';
import { useEffect, useState } from 'react';
import { t, onLocaleChange } from '@/lib/i18n';

const close = () => document.getElementById('help-modal-overlay')?.classList.remove('show');

export default function HelpModal() {
  const [text, setText] = useState(() => {
    const tr = t();
    return {
      title: tr.help.syntax,
      shortcuts: 'Keyboard Shortcuts',
      newProjectKey: tr.helpContent.newProjectKey,
      saveKey: tr.helpContent.saveKey,
      playKey: tr.helpContent.playKey,
      restartKey: tr.helpContent.restartKey,
      stepForwardKey: tr.helpContent.stepForwardKey,
      stepBackKey: tr.helpContent.stepBackKey,
      deleteKey: tr.helpContent.deleteKey,
      statements: 'Statements',
      constantDesc: tr.helpContent.constantDesc,
      expressionDesc: tr.helpContent.expressionDesc,
      availableFunctions: tr.helpContent.availableFunctions,
      conditional: tr.helpContent.conditional,
      usageTips: tr.helpContent.usageTips,
      dragTip: tr.helpContent.dragTip,
      shiftDragTip: tr.helpContent.shiftDragTip,
      scrollTip: tr.helpContent.scrollTip,
      saveTip: tr.helpContent.saveTip,
      rk4Tip: tr.helpContent.rk4Tip,
      constants: tr.helpContent.constants,
      power: tr.helpContent.power,
      close: tr.modals.close,
    };
  });

  useEffect(() => {
    const updateText = () => {
      const tr = t();
      setText({
        title: tr.help.syntax,
        shortcuts: 'Keyboard Shortcuts',
        newProjectKey: tr.helpContent.newProjectKey,
        saveKey: tr.helpContent.saveKey,
        playKey: tr.helpContent.playKey,
        restartKey: tr.helpContent.restartKey,
        stepForwardKey: tr.helpContent.stepForwardKey,
        stepBackKey: tr.helpContent.stepBackKey,
        deleteKey: tr.helpContent.deleteKey,
        statements: 'Statements',
        constantDesc: tr.helpContent.constantDesc,
        expressionDesc: tr.helpContent.expressionDesc,
        availableFunctions: tr.helpContent.availableFunctions,
        conditional: tr.helpContent.conditional,
        usageTips: tr.helpContent.usageTips,
        dragTip: tr.helpContent.dragTip,
        shiftDragTip: tr.helpContent.shiftDragTip,
        scrollTip: tr.helpContent.scrollTip,
        saveTip: tr.helpContent.saveTip,
        rk4Tip: tr.helpContent.rk4Tip,
        constants: tr.helpContent.constants,
        power: tr.helpContent.power,
        close: tr.modals.close,
      });
    };
    const unsub = onLocaleChange(updateText);
    return unsub;
  }, []);

  return (
    <div id="help-modal-overlay">
      <div id="help-modal">
        <div id="help-modal-hdr">
          <span className="hm-title">{text.title}</span>
        </div>
        <div id="help-modal-body">
          <div className="help-section">
            <h3>{text.shortcuts}</h3>
            <div className="help-key-row"><span className="help-key">Ctrl+N</span><span className="help-key-desc">{text.newProjectKey}</span></div>
            <div className="help-key-row"><span className="help-key">Ctrl+S</span><span className="help-key-desc">{text.saveKey}</span></div>
            <div className="help-key-row"><span className="help-key">Space</span><span className="help-key-desc">{text.playKey}</span></div>
            <div className="help-key-row"><span className="help-key">R</span><span className="help-key-desc">{text.restartKey}</span></div>
            <div className="help-key-row"><span className="help-key">.</span><span className="help-key-desc">{text.stepForwardKey}</span></div>
            <div className="help-key-row"><span className="help-key">,</span><span className="help-key-desc">{text.stepBackKey}</span></div>
            <div className="help-key-row"><span className="help-key">Del</span><span className="help-key-desc">{text.deleteKey}</span></div>
          </div>
          <div className="help-section">
            <h3>{text.statements}</h3>
            <div className="help-grid">
              <div className="help-card"><code>x(t+dt) = x(t) + vx*dt</code><small>Iterative — example of definition with time (t)</small></div>
              <div className="help-card"><code>dx/dt = vx</code><small>Differential — integrated through Euler or RK4 method</small></div>
              <div className="help-card"><code>g = 9.8</code><small>{text.constantDesc}</small></div>
              <div className="help-card"><code>r = sqrt(x^2 + y^2)</code><small>{text.expressionDesc}</small></div>
            </div>
          </div>
          <div className="help-section">
            <h3>{text.availableFunctions}</h3>
            <div className="help-fn-list">
              {['sin(x)', 'cos(x)', 'tan(x)', 'asin(x)', 'acos(x)', 'atan(x)', 'atan2(y,x)', 'sqrt(x)', 'abs(x)', 'exp(x)', 'ln(x)', 'log10(x)', 'floor(x)', 'ceil(x)', 'round(x)', 'sign(x)', 'min(a,b)', 'max(a,b)'].map(fn => (
                <span key={fn} className="help-fn">{fn}</span>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: 'var(--txt3)' }}>{text.constants} <span className="help-fn">pi</span> <span className="help-fn">e</span> &nbsp;·&nbsp; {text.power} <span className="help-fn">x^2</span></div>
          </div>
          <div className="help-section">
            <h3>{text.conditional}</h3>
            <div className="help-card" style={{ maxWidth: '100%' }}>
              <code>if(cond, valueIfTrue, valueIfFalse)</code>
              <small>Example: <code style={{ color: 'var(--acc3)' }}>vy(t+dt) = vy(t) + if(y &gt; 0, -g, 0)*dt</code></small>
            </div>
          </div>
          <div className="help-section">
            <h3>{text.usageTips}</h3>
            <div style={{ fontSize: 12, color: 'var(--txt2)', lineHeight: 1.8 }}>
              • {text.dragTip}<br />
              • <strong>Shift+drag</strong> {text.shiftDragTip.replace('Shift+arraste ', '').toLowerCase()}<br />
              • {text.scrollTip}<br />
              • {text.saveTip}<br />
              • {text.rk4Tip}
            </div>
          </div>
        </div>
        <div id="help-modal-footer">
          <button className="dlg-btn ok" onClick={close}>{text.close}</button>
        </div>
      </div>
    </div>
  );
}
