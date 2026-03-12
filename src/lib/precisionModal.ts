import { getPrec, setPrec, formatVal } from './formatVal';
import { closeMenus, toast } from './uiHelpers';
import { t } from './i18n';

export function showPrecisionModal(): void {
  closeMenus();
  const { format, decimals } = getPrec();
  const fmtEl = document.getElementById('prec-format') as HTMLSelectElement | null;
  const decEl = document.getElementById('prec-decimals') as HTMLInputElement | null;
  if (fmtEl) fmtEl.value = format;
  if (decEl) decEl.value = String(decimals);
  updatePrecPreview();
  document.getElementById('precision-modal-overlay')?.classList.add('show');
}

export function updatePrecPreview(): void {
  const fmtEl = document.getElementById('prec-format') as HTMLSelectElement | null;
  const decEl = document.getElementById('prec-decimals') as HTMLInputElement | null;
  const box = document.getElementById('prec-preview-box');
  if (!fmtEl || !decEl || !box) return;

  const fmt = fmtEl.value;
  const dec = parseInt(decEl.value);
  const samples = [3.14159265358979, -0.00123456789, 1234567.89, 0.000012345678];
  const { format: oldF, decimals: oldD } = getPrec();
  setPrec(fmt, dec);
  box.innerHTML = samples.map(v => formatVal(v)).join('<br>');
  setPrec(oldF, oldD);
}

export function applyPrecision(): void {
  const fmtEl = document.getElementById('prec-format') as HTMLSelectElement | null;
  const decEl = document.getElementById('prec-decimals') as HTMLInputElement | null;
  if (!fmtEl || !decEl) return;
  setPrec(fmtEl.value, parseInt(decEl.value));
  document.getElementById('precision-modal-overlay')?.classList.remove('show');
  toast(t().messages.precisionApplied);
}
