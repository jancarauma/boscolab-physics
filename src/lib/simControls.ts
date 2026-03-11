import type { SimEngine } from './SimEngine';
import type { AnimRenderer } from './AnimRenderer';
import type { GraphRenderer } from './GraphRenderer';
import { clearErr, setErr } from './uiHelpers';

interface SimRefs {
  sim: SimEngine;
  anim: AnimRenderer;
  graphs: GraphRenderer[];
}

export function simPlay({ sim }: SimRefs): void {
  if (!sim.parsed || sim.parsed.errors.length) { setErr('Modelo com erros.'); return; }
  sim.start();
}

export function simPause({ sim }: SimRefs): void {
  sim.pause();
}

export function simReset({ sim, anim, graphs }: SimRefs): void {
  sim.reset();
  anim.clearTrails();
  graphs.forEach(g => g.clear());
  clearErr();
}

export function simStep({ sim }: SimRefs): void {
  if (!sim.parsed || sim.parsed.errors.length) return;
  if (sim.running) sim.pause();
  if (sim.status === 'done') return;
  sim.step();
}

export function simBack({ sim }: SimRefs): void {
  if (sim.running) sim.pause();
  sim.stepBack();
}

export function updateStatusUI(s: string, sim: SimEngine): void {
  const dot = document.getElementById('statusdot');
  if (dot) dot.className = 'statusdot ' + (s === 'running' ? 'running' : s === 'paused' ? 'paused' : s === 'error' ? 'error' : '');
  const btnPlay  = document.getElementById('btn-play')  as HTMLButtonElement | null;
  const btnPause = document.getElementById('btn-pause') as HTMLButtonElement | null;
  const btnBack  = document.getElementById('btn-back')  as HTMLButtonElement | null;
  if (btnPlay)  btnPlay.disabled  = s === 'running';
  if (btnPause) btnPause.disabled = s !== 'running';
  if (btnBack)  btnBack.disabled  = (sim.history?.length ?? 0) < 2;
  const dispMethod = document.getElementById('disp-method');
  if (dispMethod) dispMethod.textContent = sim.method.toUpperCase();
}
