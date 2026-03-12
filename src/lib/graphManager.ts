import type { SimEngine } from './SimEngine';
import type { GraphRenderer } from './GraphRenderer';
import { closeMenus, toast } from './uiHelpers';
import { formatVal } from './formatVal';
import { t, interpolate } from './i18n';

export function selTab(i: number, graphs: GraphRenderer[]): void {
  (window as any).__activeTab = i;
  document.querySelectorAll('.gtab').forEach((t, j) => t.classList.toggle('active', i === j));
  document.querySelectorAll('.gcwrap').forEach((w, j) => w.classList.toggle('active', i === j));
  rebuildGraphSelects(i, graphs, (window as any).__sim);
}

export function rebuildGraphSelects(activeTab: number, graphs: GraphRenderer[], sim: SimEngine): void {
  if (!sim) return;
  const vars = ['t', ...(sim.parsed ? Object.keys(sim.parsed.variables) : [])];
  const g = graphs[activeTab];
  if (!g) return;
  (['cfg-xvar', 'cfg-yvar', 'cfg-yvar2'] as const).forEach((id, si) => {
    const sel = document.getElementById(id) as HTMLSelectElement | null;
    if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = (si > 0 ? '<option value="">—</option>' : '') + vars.map(v => `<option value="${v}">${v}</option>`).join('');
    if (vars.includes(cur)) sel.value = cur;
  });
  const xEl = document.getElementById('cfg-xvar') as HTMLSelectElement | null;
  const yEl = document.getElementById('cfg-yvar') as HTMLSelectElement | null;
  const y2El = document.getElementById('cfg-yvar2') as HTMLSelectElement | null;
  if (xEl) xEl.value = g.xvar || 't';
  if (yEl) yEl.value = g.yvar || '';
  if (y2El) y2El.value = g.yvar2 || '';
}

export function updateGraphCfg(activeTab: number, graphs: GraphRenderer[]): void {
  const g = graphs[activeTab];
  if (!g) return;
  const nx = (document.getElementById('cfg-xvar') as HTMLSelectElement)?.value ?? '';
  const ny = (document.getElementById('cfg-yvar') as HTMLSelectElement)?.value ?? '';
  const ny2 = (document.getElementById('cfg-yvar2') as HTMLSelectElement)?.value ?? '';
  if (g.xvar !== nx || g.yvar !== ny || g.yvar2 !== ny2) {
    g.xvar = nx; g.yvar = ny; g.yvar2 = ny2 || '';
    g.clear();
  }
}

export function clearGraph(i: number, graphs: GraphRenderer[]): void {
  graphs[i]?.clear();
}

export function exportGraphCSV(idx: number, graphs: GraphRenderer[]): void {
  closeMenus();
  const g = graphs[idx];
  if (!g) { toast(t().messages.graphNotFound); return; }
  if (!g.yvar) { toast(t().messages.selectYVar); return; }
  if (g.data.length < 2) { toast(t().messages.runSimulationOrChange); return; }
  const hasY2 = g.data2 && g.data2.length > 1;
  const header = hasY2 ? `${g.xvar},${g.yvar},${g.yvar2}` : `${g.xvar},${g.yvar}`;
  const rows = [header];
  for (let i = 0; i < g.data.length; i++) {
    const [x, y] = g.data[i];
    rows.push(hasY2 && g.data2[i] ? `${x},${y},${g.data2[i][1]}` : `${x},${y}`);
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' }));
  a.download = `grafico_${idx + 1}_${g.yvar}_vs_${g.xvar}.csv`;
  a.click();
  toast(interpolate(t().messages.csvExported, { idx: idx + 1, count: g.data.length }));
}

export function exportGraphPNG(idx: number, graphs: GraphRenderer[]): void {
  closeMenus();
  const g = graphs[idx];
  if (!g) { toast(t().messages.graphNotFound); return; }
  if (!g.yvar) { toast(t().messages.selectYVar); return; }
  if (g.data.length < 2) { toast(t().messages.runSimulationOrChange); return; }

  const SCALE = 3;
  const W = 900, H = 540;
  const offCanvas = document.createElement('canvas');
  offCanvas.width = W * SCALE; offCanvas.height = H * SCALE;
  const ctx = offCanvas.getContext('2d')!;
  ctx.scale(SCALE, SCALE);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);

  const pad = { t: 40, r: 24, b: 54, l: 72 };
  const pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;
  ctx.fillStyle = '#f8faff'; ctx.fillRect(pad.l, pad.t, pw, ph);
  ctx.strokeStyle = '#c8d3e6'; ctx.lineWidth = 1;
  ctx.strokeRect(pad.l, pad.t, pw, ph);

  let { xmin, xmax, ymin, ymax } = g;
  if (!isFinite(xmin)) { toast(t().messages.noData); return; }
  if (xmin === xmax) { xmin -= 1; xmax += 1; }
  if (ymin === ymax) { ymin -= 1; ymax += 1; }
  const xr = xmax - xmin, yr = ymax - ymin;
  const xp = xr * .02, yp = yr * .08;
  const tX = (x: number) => pad.l + ((x - (xmin - xp)) / (xr + 2 * xp)) * pw;
  const tY = (y: number) => pad.t + ph - ((y - (ymin - yp)) / (yr + 2 * yp)) * ph;

  ctx.strokeStyle = '#dde4ef'; ctx.lineWidth = 0.7;
  for (let i = 0; i <= 5; i++) {
    const gx = pad.l + (i / 5) * pw; ctx.beginPath(); ctx.moveTo(gx, pad.t); ctx.lineTo(gx, pad.t + ph); ctx.stroke();
    const gy = pad.t + (i / 5) * ph; ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(pad.l + pw, gy); ctx.stroke();
  }

  const drawC = (data: number[][], color: string, lw: number) => {
    if (data.length < 2) return;
    ctx.beginPath(); ctx.moveTo(tX(data[0][0]), tY(data[0][1]));
    for (let i = 1; i < data.length; i++) ctx.lineTo(tX(data[i][0]), tY(data[i][1]));
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke();
  };
  drawC(g.data, g.colors[0], 2.5);
  if (g.data2.length > 1) drawC(g.data2, g.colors[1], 2);

  if (g.data.length) {
    const [lx, ly] = g.data[g.data.length - 1];
    ctx.beginPath(); ctx.arc(tX(lx), tY(ly), 5, 0, Math.PI * 2);
    ctx.fillStyle = g.colors[0]; ctx.fill();
  }

  ctx.fillStyle = '#475569'; ctx.font = 'bold 12px JetBrains Mono,monospace';
  ctx.textAlign = 'center';
  for (let i = 0; i <= 5; i++) {
    const v = (xmin - xp) + ((xr + 2 * xp) * i / 5);
    ctx.fillText(formatVal(v), pad.l + (i / 5) * pw, pad.t + ph + 18);
  }
  ctx.textAlign = 'right';
  for (let i = 0; i <= 5; i++) {
    const v = (ymin - yp) + ((yr + 2 * yp) * i / 5);
    ctx.fillText(formatVal(v), pad.l - 6, pad.t + ph - (i / 5) * ph + 4);
  }

  ctx.fillStyle = '#334155'; ctx.font = 'bold 13px DM Sans,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(g.xvar, pad.l + pw / 2, H - 8);
  ctx.save(); ctx.translate(14, pad.t + ph / 2); ctx.rotate(-Math.PI / 2);
  if (g.yvar2) {
    ctx.fillStyle = g.colors[0]; ctx.textAlign = 'right'; ctx.fillText(g.yvar, -4, 0);
    ctx.fillStyle = '#94a3b8'; ctx.fillText(' ·', 0, 0);
    ctx.fillStyle = g.colors[1]; ctx.textAlign = 'left'; ctx.fillText(' ' + g.yvar2, 4, 0);
  } else {
    ctx.fillStyle = g.colors[0]; ctx.textAlign = 'center'; ctx.fillText(g.yvar, 0, 0);
  }
  ctx.restore();
  ctx.fillStyle = '#1a2236'; ctx.font = 'bold 14px DM Sans,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${g.yvar} vs ${g.xvar}${g.yvar2 ? ' · ' + g.yvar2 : ''}`, pad.l + pw / 2, 22);

  if (g.yvar2) {
    const lx2 = pad.l + pw - 120, ly2 = pad.t + 16;
    ctx.fillStyle = g.colors[0]; ctx.fillRect(lx2, ly2 - 9, 22, 3);
    ctx.fillStyle = '#1a2236'; ctx.font = '11px DM Sans,sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(g.yvar, lx2 + 26, ly2);
    ctx.fillStyle = g.colors[1]; ctx.fillRect(lx2, ly2 + 7, 22, 3);
    ctx.fillStyle = '#1a2236'; ctx.fillText(g.yvar2, lx2 + 26, ly2 + 16);
  }

  const a = document.createElement('a');
  a.download = `grafico_${idx + 1}_${g.yvar}_vs_${g.xvar}.png`;
  a.href = offCanvas.toDataURL('image/png');
  a.click();
  toast(interpolate(t().messages.hdPngExported, { width: W * SCALE, height: H * SCALE }));
}
