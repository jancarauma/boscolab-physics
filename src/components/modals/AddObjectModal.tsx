'use client';
import { useEffect, useState } from 'react';
import { t, onLocaleChange, type Locale } from '@/lib/i18n';

const close = () => document.getElementById('modal-add')?.classList.remove('show');

export default function AddObjectModal() {
  const [labels, setLabels] = useState(() => {
    const tr = t();
    return { title: tr.modals.newObject, cancel: tr.modals.cancel, add: tr.modals.add };
  });

  useEffect(() => {
    const updateLabels = () => {
      const tr = t();
      setLabels({ title: tr.modals.newObject, cancel: tr.modals.cancel, add: tr.modals.add });
      document.getElementById('modal-type-label')!.textContent = tr.modals.newObject;
      const btnOk = document.getElementById('modal-ok') as HTMLButtonElement;
      if (btnOk) btnOk.textContent = tr.modals.add;
      const btnCancel = document.querySelector('.modal #modal-add .mfbtn.cancel') as HTMLButtonElement;
      if (btnCancel) btnCancel.textContent = tr.modals.cancel;
    };
    updateLabels();
    const unsub = onLocaleChange(updateLabels);
    return unsub;
  }, []);

  return (
    <div className="modal-overlay" id="modal-add">
      <div className="modal">
        <div className="modal-title">
          <span className="emoji" id="modal-icon">●</span>
          <span id="modal-type-label">{labels.title}</span>
        </div>
        <div id="modal-body" />
        <div className="modal-footer">
          <button className="mfbtn cancel" onClick={close}>{labels.cancel}</button>
          <button className="mfbtn ok" id="modal-ok" onClick={() => (window as any).confirmAddObject?.()}>{labels.add}</button>
        </div>
      </div>
    </div>
  );
}
