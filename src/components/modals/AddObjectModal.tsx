'use client';
const close = () => document.getElementById('modal-add')?.classList.remove('show');

export default function AddObjectModal() {
  return (
    <div className="modal-overlay" id="modal-add">
      <div className="modal">
        <div className="modal-title">
          <span className="emoji" id="modal-icon">●</span>
          <span id="modal-type-label">Novo Objeto</span>
        </div>
        <div id="modal-body" />
        <div className="modal-footer">
          <button className="mfbtn cancel" onClick={close}>Cancelar</button>
          <button className="mfbtn ok" id="modal-ok" onClick={() => (window as any).confirmAddObject?.()}>Adicionar</button>
        </div>
      </div>
    </div>
  );
}
