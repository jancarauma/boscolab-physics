let _precFormat = 'fixed';
let _precDecimals = 3;

export function getPrec() { return { format: _precFormat, decimals: _precDecimals }; }
export function setPrec(format: string, decimals: number) { _precFormat = format; _precDecimals = decimals; }

export function formatVal(v: number): string {
  if (!isFinite(v)) return String(v);
  const d = _precDecimals;
  if (_precFormat === 'sci') return v.toExponential(d);
  if (_precFormat === 'fixed') return v.toFixed(d);
  if (_precFormat === 'eng') {
    if (v === 0) return '0.' + '0'.repeat(d);
    const exp = Math.floor(Math.log10(Math.abs(v)) / 3) * 3;
    const mantissa = v / Math.pow(10, exp);
    return mantissa.toFixed(d) + (exp !== 0 ? `×10^${exp}` : '');
  }
  const abs = Math.abs(v);
  if (abs === 0) return '0';
  if (abs >= 0.001 && abs < 1e6) return v.toFixed(d);
  return v.toExponential(d);
}
