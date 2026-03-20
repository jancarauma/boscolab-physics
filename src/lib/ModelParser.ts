// --- MODEL PARSER -------
export function normalizeIdentifier(name?: string | null): string {
  return (name ?? '').trim().toLowerCase() || 't';
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class ModelParser {
  indVar: string;

  constructor(indVar = 't') {
    this.indVar = normalizeIdentifier(indVar);
  }

  parse(src: string, indVar = this.indVar) {
    this.indVar = normalizeIdentifier(indVar);
    const indVarPattern = this.indVar === 't' ? 't' : `(?:${escapeRegExp(this.indVar)}|t)`;
    const lines = src.split('\n');
    const equations: any[] = [], errors: any[] = [];
    const stateVars = new Set<string>(), constVars: Record<string, number> = {}, derivedVars = new Set<string>(), allVars = new Set<string>();

    lines.forEach((raw, idx) => {
      const line = raw.replace(/\/\/.*$/, '').replace(/#.*$/, '').trim();
      if (!line) return;
      let m: RegExpMatchArray | null;
      if ((m = line.match(new RegExp(`^(\\w+)\\s*\\(\\s*${indVarPattern}\\s*\\+\\s*dt\\s*\\)\\s*=\\s*(.+)$`, 'i')))) {
        const v = m[1].toLowerCase(); stateVars.add(v); allVars.add(v);
        if (v === this.indVar) { errors.push({ line: idx + 1, msg: `Linha ${idx + 1}: "${this.indVar}" é reservada como variável independente.` }); return; }
        equations.push({ type: 'iterative', var: v, expr: m[2].trim(), line: idx + 1 }); return;
      }
      if ((m = line.match(new RegExp(`^d(\\w+)\\s*\\/\\s*d${indVarPattern}\\s*=\\s*(.+)$`, 'i')))) {
        const v = m[1].toLowerCase(); stateVars.add(v); allVars.add(v);
        if (v === this.indVar) { errors.push({ line: idx + 1, msg: `Linha ${idx + 1}: "${this.indVar}" é reservada como variável independente.` }); return; }
        equations.push({ type: 'differential', var: v, expr: m[2].trim(), line: idx + 1 }); return;
      }
      if ((m = line.match(/^(\w+)\s*=\s*(.+)$/i))) {
        const v = m[1].toLowerCase(); allVars.add(v);
        if (v === this.indVar) { errors.push({ line: idx + 1, msg: `Linha ${idx + 1}: "${this.indVar}" é reservada como variável independente.` }); return; }
        const rhs = m[2].trim();
        if (!isNaN(rhs as any)) {
          constVars[v] = parseFloat(rhs);
          equations.push({ type: 'const', var: v, value: parseFloat(rhs), line: idx + 1 });
        } else {
          derivedVars.add(v);
          equations.push({ type: 'derived', var: v, expr: rhs, line: idx + 1 });
        }
        return;
      }
      errors.push({ line: idx + 1, msg: `Linha ${idx + 1}: não reconhecido: "${raw.trim()}"` });
    });

    const variables: Record<string, any> = {};
    allVars.forEach(v => {
      if (stateVars.has(v)) variables[v] = { type: 'state' };
      else if (constVars[v] !== undefined) variables[v] = { type: 'const', value: constVars[v] };
      else if (derivedVars.has(v)) variables[v] = { type: 'derived' };
    });
    return { equations, errors, variables, stateVars, constVars };
  }

  compileExpr(expr: string, indVar = this.indVar) {
    const normalizedIndVar = normalizeIdentifier(indVar);
    const indVarPattern = normalizedIndVar === 't' ? 't' : `(?:${escapeRegExp(normalizedIndVar)}|t)`;
    let js = expr.replace(new RegExp(`\\b([a-zA-Z_]\\w*)\\s*\\(\\s*${indVarPattern}\\s*\\+\\s*dt\\s*\\)`, 'gi'), (_, v) => `_p_${v.toLowerCase()}`);
    js = js.replace(new RegExp(`\\b([a-zA-Z_]\\w*)\\s*\\(\\s*${indVarPattern}\\s*\\)`, 'gi'), (_, v) => `_cur_${v.toLowerCase()}`);
    js = js.replace(/\^/g, '**');
    js = js.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g, (match, name, offset, str) => {
      const lo = name.toLowerCase();
      const after = str.slice(offset + match.length).trimStart();
      const isCall = after.startsWith('(');
      if (lo.startsWith('_p_')) return match;
      if (lo.startsWith('_cur_')) return `s.${lo.slice(5)}`;
      if (isCall) {
        const FNS: Record<string, string> = {
          sin: 'Math.sin', cos: 'Math.cos', tan: 'Math.tan',
          asin: 'Math.asin', acos: 'Math.acos', atan: 'Math.atan', atan2: 'Math.atan2',
          sqrt: 'Math.sqrt', abs: 'Math.abs', exp: 'Math.exp', ln: 'Math.log',
          log: 'Math.log10', log10: 'Math.log10', floor: 'Math.floor', ceil: 'Math.ceil',
          round: 'Math.round', sign: 'Math.sign', min: 'Math.min', max: 'Math.max', if: '_if',
        };
        return FNS[lo] || match;
      }
      if (lo === 'pi') return 'Math.PI';
      if (lo === 'e') return 'Math.E';
      if (lo === normalizedIndVar || lo === 't') return 't';
      if (lo === 'dt' || lo === 'n') return lo;
      return `s.${lo}`;
    });
    return js;
  }
}
