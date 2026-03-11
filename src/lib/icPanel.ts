import type { SimEngine } from './SimEngine';
import type { AnimRenderer } from './AnimRenderer';
import type { GraphRenderer } from './GraphRenderer';
import { toast } from './uiHelpers';

export function rebuildICPanel(sim: SimEngine): void {
  const vars = sim.getVars().filter((v: any) => v.type === 'state');
  const grid = document.getElementById('ic-grid');
  if (!grid) return;
  grid.innerHTML = vars.map((v: any) => `
    <div class="icfield">
      <label>${v.name}₀</label>
      <input id="ic-${v.name}" type="number" step="any" value="${sim.initState[v.name] ?? 0}">
    </div>`).join('');
}

export function getICValues(sim: SimEngine): Record<string, number> {
  const ic: Record<string, number> = {};
  document.querySelectorAll<HTMLInputElement>('#ic-grid input').forEach(inp => {
    ic[inp.id.replace('ic-', '')] = parseFloat(inp.value) || 0;
  });
  if (sim.parsed) Object.entries(sim.parsed.constVars).forEach(([k, v]) => { ic[k] = v as number; });
  return ic;
}

export function applyIC(
  sim: SimEngine,
  anim: AnimRenderer,
  graphs: GraphRenderer[],
): void {
  // reset first
  sim.reset();
  anim.clearTrails();
  graphs.forEach(g => g.clear());

  sim.setIC(getICValues(sim));
  document.getElementById('ic-panel')?.classList.remove('show');
  rebuildICPanel(sim);
  toast('✓ Condições iniciais aplicadas');
}

export function toggleIC(): void {
  document.getElementById('ic-panel')?.classList.toggle('show');
}
