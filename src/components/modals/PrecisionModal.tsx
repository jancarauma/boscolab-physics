'use client';
const close = () => document.getElementById('precision-modal-overlay')?.classList.remove('show');

export default function PrecisionModal() {
  return (
    <div id="precision-modal-overlay">
      <div id="precision-modal">
        <div id="precision-modal-hdr">
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--txt)', flex: 1, marginLeft: 8 }}>Precisão</span>
        </div>
        <div id="precision-modal-body">
          <div className="prec-row">
            <span className="prec-label">Formato</span>
            <select className="prec-sel" id="prec-format" onChange={() => (window as any).updatePrecPreview?.()}>
              <option value="fixed">Decimal fixo</option>
              <option value="sci">Notação científica</option>
              <option value="auto">Automática</option>
              <option value="eng">Engenharia (x10e3)</option>
            </select>
          </div>
          <div className="prec-row" id="prec-dec-row">
            <span className="prec-label">Casas decimais</span>
            <select className="prec-sel" id="prec-decimals" onChange={() => (window as any).updatePrecPreview?.()}>
              <option value="0">0</option><option value="1">1</option>
              <option value="2">2</option><option value="3">3</option>
              <option value="4">4</option><option value="5">5</option>
              <option value="6">6</option><option value="8">8</option>
              <option value="10">10</option><option value="12">12</option>
            </select>
          </div>
          <div className="prec-preview-label">Prévia</div>
          <div className="prec-preview" id="prec-preview-box">3.14159265<br />-0.00123456<br />1234567.89<br />0.000012345</div>
        </div>
        <div id="precision-modal-footer">
          <button className="dlg-btn cancel" onClick={close}>Cancelar</button>
          <button className="dlg-btn ok" onClick={() => (window as any).applyPrecision?.()}>Aplicar</button>
        </div>
      </div>
    </div>
  );
}
