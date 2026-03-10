'use client';
export default function CustomDialog() {
  return (
    <div id="blab-dlg-overlay">
      <div id="blab-dlg">
        <div id="blab-dlg-header">
          <span id="blab-dlg-icon">ℹ️</span>
          <span id="blab-dlg-title">Aviso</span>
        </div>
        <div id="blab-dlg-body" />
        <div id="blab-dlg-footer" />
      </div>
    </div>
  );
}
