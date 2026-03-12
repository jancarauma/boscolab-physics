import type { AnimRenderer } from './AnimRenderer';
import { toast } from './uiHelpers';
import { t } from './i18n';

const MAX_HISTORY = 60;

// Snapshot completo dos objetos (deep clone sem _trail/_imgEl)
function snapshot(anim: AnimRenderer): string {
  return JSON.stringify(anim.objects.map(o => {
    const clone: any = {};
    for (const k in o) {
      if (k.startsWith('_')) continue; // skip internal caches
      clone[k] = o[k];
    }
    return clone;
  }));
}

function restore(anim: AnimRenderer, snap: string): void {
  const parsed = JSON.parse(snap);
  // Preserva _trail, _imgEl e outros caches internos dos objetos existentes
  const cache: Record<number, any> = {};
  anim.objects.forEach(o => { cache[o.id] = o; });
  anim.objects = parsed.map((data: any) => {
    const prev = cache[data.id];
    const obj = { ...data };
    if (prev) {
      // Reusa caches internos (imagens, rastros)
      if (prev._imgEl) obj._imgEl = prev._imgEl;
      if (prev._trail) obj._trail = [];  // limpa rastro ao desfazer
    }
    return obj;
  });
}

let _undoStack: string[] = [];
let _redoStack: string[] = [];
let _lastSnap: string = '[]';
let _pendingCommit = false;

export function undoInit(anim: AnimRenderer): void {
  _undoStack = [];
  _redoStack = [];
  _lastSnap = snapshot(anim);
  _updateButtons();
}

// Chame após qualquer operação que mude objetos
export function undoPush(anim: AnimRenderer): void {
  const snap = snapshot(anim);
  if (snap === _lastSnap) return; // nada mudou
  _undoStack.push(_lastSnap);
  if (_undoStack.length > MAX_HISTORY) _undoStack.shift();
  _redoStack = [];
  _lastSnap = snap;
  _updateButtons();
}

// Para operações contínuas (drag) — acumula e só commita no mouseup
export function undoSchedule(anim: AnimRenderer): void {
  if (_pendingCommit) return;
  _pendingCommit = true;
  requestAnimationFrame(() => {
    _pendingCommit = false;
    undoPush(anim);
  });
}

export function undoUndo(anim: AnimRenderer, onRender: () => void): void {
  if (!_undoStack.length) { toast(t().messages.noUndoAction); return; }
  _redoStack.push(_lastSnap);
  const prev = _undoStack.pop()!;
  _lastSnap = prev;
  restore(anim, prev);
  _updateButtons();
  toast(t().messages.undoDone);
  onRender();
}

export function undoRedo(anim: AnimRenderer, onRender: () => void): void {
  if (!_redoStack.length) { toast(t().messages.noRedoAction); return; }
  _undoStack.push(_lastSnap);
  const next = _redoStack.pop()!;
  _lastSnap = next;
  restore(anim, next);
  _updateButtons();
  toast(t().messages.redoDone);
  onRender();
}

export function undoCanUndo(): boolean { return _undoStack.length > 0; }
export function undoCanRedo(): boolean { return _redoStack.length > 0; }

function _updateButtons(): void {
  const btnUndo = document.getElementById('btn-undo') as HTMLButtonElement | null;
  const btnRedo = document.getElementById('btn-redo') as HTMLButtonElement | null;
  
  if (btnUndo) {
    btnUndo.disabled = _undoStack.length === 0;
  }
  
  if (btnRedo) {
    btnRedo.disabled = _redoStack.length === 0;
  }
}
