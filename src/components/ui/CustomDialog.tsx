'use client';
import { t } from '@/lib/i18n';

export default function CustomDialog() {
  const tr = t();
  return (
    <div id="blab-dlg-overlay">
      <div id="blab-dlg">
        <div id="blab-dlg-header">
          <span id="blab-dlg-icon">ℹ️</span>
          <span id="blab-dlg-title">{tr.dialogs.warning}</span>
        </div>
        <div id="blab-dlg-body" />
        <div id="blab-dlg-footer" />
      </div>
    </div>
  );
}
