// ── Tipos ──────────────────────────────────────────────────────────────────
export type Locale = 'pt' | 'en' | 'es';

export interface Translations {
  // Menu principal
  menu: {
    file: string;
    examples: string;
    view: string;
    options: string;
    help: string;
  };
  // Menu Arquivo
  file: {
    new: string;
    open: string;
    save: string;
    exportData: string;
    exportImage: string;
    precision: string;
  };
  // Menu Exemplos — categorias
  exCategories: {
    mechanics: string;
    kinematics: string;
    gravitation: string;
    waves: string;
    oscillations: string;
    other: string;
    electromagnetism: string;
    complex: string;
  };
  // Menu Exemplos — itens
  exItems: {
    projetil: string;
    projetil_drag: string;
    queda: string;
    queda_lua: string;
    orbita: string;
    orbita3: string;
    solar: string;
    batimento: string;
    pendulo: string;
    pendulo_duplo: string;
    mola: string;
    amortecido: string;
    onda: string;
    mola2d: string;
    vanderpol: string;
    rc: string;
    cargas: string;
    campo_eletrico: string;
    lotka: string;
    lorenz: string;
  };
  // Menu Visualização
  view: {
    grid: string;
    axes: string;
    clearTrails: string;
    centerView: string;
  };
  // Menu Ajuda
  help: {
    syntax: string;
    about: string;
  };
  // Menu Opções
  options: {
    precision: string;
    language: string;
  };
}

// ── Dicionários ────────────────────────────────────────────────────────────
const translations: Record<Locale, Translations> = {
  pt: {
    menu: { file: 'Arquivo', examples: 'Exemplos', view: 'Exibir', options: 'Opções', help: 'Ajuda' },
    file: { new: 'Novo', open: 'Abrir .modx', save: 'Salvar', exportData: 'Exportar Dados', exportImage: 'Exportar Imagem', precision: 'Precisão' },
    exCategories: { mechanics: 'Mecânica', kinematics: 'Cinemática', gravitation: 'Gravitação', waves: 'Ondas', oscillations: 'Oscilações', other: 'Outros', electromagnetism: 'Eletromagnetismo', complex: 'Sistemas Complexos' },
    exItems: { projetil: 'Lançamento de Projétil', projetil_drag: 'Projétil com Arrasto', queda: 'Queda Livre', queda_lua: 'Queda: Terra vs Lua', orbita: 'Lei de Kepler', orbita3: 'Problema dos 3 Corpos', solar: 'Sistema Planetário', batimento: 'Batimento', pendulo: 'Pêndulo Simples', pendulo_duplo: 'Pêndulo Duplo', mola: 'Oscilador Harmônico Simples', amortecido: 'Oscilador Amortecido', onda: 'Oscilador Forçado', mola2d: 'Mola 2D', vanderpol: 'Van der Pol', rc: 'Circuito RC', cargas: 'Cargas Elétricas', campo_eletrico: 'Campo Vetorial', lotka: 'Lotka-Volterra', lorenz: 'Atrator de Lorenz' },
    view: { grid: '⊞ Grade', axes: '↔ Eixos', clearTrails: '✕ Limpar Rastros', centerView: '⊙ Centralizar Vista' },
    help: { syntax: 'Sintaxe das Equações', about: 'Sobre' },
    options: { precision: 'Precisão', language: 'Idioma' },
  },
  en: {
    menu: { file: 'File', examples: 'Examples', view: 'View', options: 'Options', help: 'Help' },
    file: { new: 'New', open: 'Open .modx', save: 'Save', exportData: 'Export Data', exportImage: 'Export Image', precision: 'Precision' },
    exCategories: { mechanics: 'Mechanics', kinematics: 'Kinematics', gravitation: 'Gravitation', waves: 'Waves', oscillations: 'Oscillations', other: 'Other', electromagnetism: 'Electromagnetism', complex: 'Complex Systems' },
    exItems: { projetil: 'Projectile Launch', projetil_drag: 'Projectile with Drag', queda: 'Free Fall', queda_lua: 'Free Fall: Earth vs Moon', orbita: 'Kepler\'s Law', orbita3: 'Three-Body Problem', solar: 'Planetary System', batimento: 'Wave Beating', pendulo: 'Simple Pendulum', pendulo_duplo: 'Double Pendulum', mola: 'Simple Harmonic Oscillator', amortecido: 'Damped Oscillator', onda: 'Forced Oscillator', mola2d: '2D Spring', vanderpol: 'Van der Pol', rc: 'RC Circuit', cargas: 'Electric Charges', campo_eletrico: 'Vector Field', lotka: 'Lotka-Volterra', lorenz: 'Lorenz Attractor' },
    view: { grid: '⊞ Grid', axes: '↔ Axes', clearTrails: '✕ Clear Trails', centerView: '⊙ Center View' },
    help: { syntax: 'Equation Syntax', about: 'About' },
    options: { precision: 'Precision', language: 'Language' },
  },
  es: {
    menu: { file: 'Archivo', examples: 'Ejemplos', view: 'Vista', options: 'Opciones', help: 'Ayuda' },
    file: { new: 'Nuevo', open: 'Abrir .modx', save: 'Guardar', exportData: 'Exportar Datos', exportImage: 'Exportar Imagen', precision: 'Precisión' },
    exCategories: { mechanics: 'Mecánica', kinematics: 'Cinemática', gravitation: 'Gravitación', waves: 'Ondas', oscillations: 'Oscilaciones', other: 'Otros', electromagnetism: 'Electromagnetismo', complex: 'Sistemas Complejos' },
    exItems: { projetil: 'Lanzamiento de Proyectil', projetil_drag: 'Proyectil con Arrastre', queda: 'Caída Libre', queda_lua: 'Caída: Tierra vs Luna', orbita: 'Ley de Kepler', orbita3: 'Problema de los 3 Cuerpos', solar: 'Sistema Planetario', batimento: 'Batido de Ondas', pendulo: 'Péndulo Simple', pendulo_duplo: 'Péndulo Doble', mola: 'Oscilador Armónico Simple', amortecido: 'Oscilador Amortiguado', onda: 'Oscilador Forzado', mola2d: 'Resorte 2D', vanderpol: 'Van der Pol', rc: 'Circuito RC', cargas: 'Cargas Eléctricas', campo_eletrico: 'Campo Vectorial', lotka: 'Lotka-Volterra', lorenz: 'Atractor de Lorenz' },
    view: { grid: '⊞ Cuadrícula', axes: '↔ Ejes', clearTrails: '✕ Limpiar Rastros', centerView: '⊙ Centrar Vista' },
    help: { syntax: 'Sintaxis de Ecuaciones', about: 'Acerca de' },
    options: { precision: 'Precisión', language: 'Idioma' },
  },
};

// ── Estado global do idioma ────────────────────────────────────────────────
const STORAGE_KEY = 'boscolab-locale';
let _currentLocale: Locale = 'pt';
const _listeners: Array<(locale: Locale) => void> = [];

export function getLocale(): Locale { return _currentLocale; }

export function setLocale(locale: Locale): void {
  _currentLocale = locale;
  localStorage.setItem(STORAGE_KEY, locale);
  _listeners.forEach(fn => fn(locale));
}

export function loadLocale(): Locale {
  const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (saved && saved in translations) _currentLocale = saved;
  return _currentLocale;
}

export function t(): Translations { return translations[_currentLocale]; }

export function onLocaleChange(fn: (locale: Locale) => void): () => void {
  _listeners.push(fn);
  return () => { const i = _listeners.indexOf(fn); if (i >= 0) _listeners.splice(i, 1); };
}

export { translations };
