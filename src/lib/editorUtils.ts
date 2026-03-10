export function isEqLine(s: string): boolean {
  const t = s.replace(/\/\/.*$/, '').replace(/#.*$/, '').trim();
  if (!t) return false;
  if (s.trim().startsWith('//') || s.trim().startsWith('#')) return false;
  return !!(t.match(/\w+\s*\(t\+dt\)\s*=/) || t.match(/d\w+\s*\/\s*dt\s*=/) || t.match(/^\w+\s*=\s*.+/));
}

export function lineToLatex(line: string): string {
  let s = line.trim();
  s = s.replace(/(\w+)\(t\+dt\)/g, (_, v) => `${v}_{t+\\Delta t}`);
  s = s.replace(/(\w+)\(t\)/g, (_, v) => `${v}_t`);
  s = s.replace(/d(\w+)\/dt/g, (_, v) => `\\frac{d${v}}{dt}`);
  s = s.replace(/\btheta\b/g, '\\theta').replace(/\bomega\b/g, '\\omega')
    .replace(/\balpha\b/g, '\\alpha').replace(/\bbeta\b/g, '\\beta')
    .replace(/\bgamma\b/g, '\\gamma').replace(/\bsigma\b/g, '\\sigma')
    .replace(/\brho\b/g, '\\rho').replace(/\bphi\b/g, '\\phi')
    .replace(/\blambda\b/g, '\\lambda').replace(/\bmu\b/g, '\\mu')
    .replace(/\bpi\b/g, '\\pi');
  s = s.replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}');
  s = s.replace(/\bsin\b/g, '\\sin').replace(/\bcos\b/g, '\\cos')
    .replace(/\btan\b/g, '\\tan').replace(/\bexp\b/g, '\\exp').replace(/\bln\b/g, '\\ln');
  s = s.replace(/\(([^()]+)\)\/\(([^()]+)\)/g, '\\frac{$1}{$2}');
  s = s.replace(/\^([A-Za-z0-9_.]+)/g, '^{$1}');
  s = s.replace(/\*\*/g, '^');
  s = s.replace(/\*/g, ' \\cdot ');
  s = s.replace(/\bdt\b/g, '\\Delta t');
  return s;
}

export function latexToPlain(latex: string): string {
  let s = latex;
  s = s.replace(/([a-zA-Z]\w*)\s*_\{t\+\\Delta t\}/g, '$1(t+dt)');
  s = s.replace(/([a-zA-Z]\w*)\s*_\{t\}/g, '$1(t)');
  s = s.replace(/([a-zA-Z]\w*)\s*_t\b/g, '$1(t)');
  s = s.replace(/\\frac\{d\s*([a-zA-Z]\w*)\}\{dt\}/g, 'd$1/dt');
  s = s.replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)');
  s = s.replace(/\\theta/g, 'theta').replace(/\\omega/g, 'omega')
    .replace(/\\alpha/g, 'alpha').replace(/\\beta/g, 'beta')
    .replace(/\\gamma/g, 'gamma').replace(/\\sigma/g, 'sigma')
    .replace(/\\rho/g, 'rho').replace(/\\phi/g, 'phi')
    .replace(/\\lambda/g, 'lambda').replace(/\\mu/g, 'mu')
    .replace(/\\pi/g, 'pi');
  s = s.replace(/\\sin/g, 'sin').replace(/\\cos/g, 'cos')
    .replace(/\\tan/g, 'tan').replace(/\\exp/g, 'exp').replace(/\\ln/g, 'ln');
  s = s.replace(/\\cdot\s*/g, '*');
  s = s.replace(/\\Delta\s*t/g, 'dt');
  s = s.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
  s = s.replace(/\^\{([a-zA-Z0-9_.]+)\}/g, '^$1');
  s = s.replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1');
  s = s.replace(/\\[a-zA-Z]+/g, '');
  s = s.replace(/[{}]/g, '');
  return s.trim();
}
