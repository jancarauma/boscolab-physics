// ── Tipos ──────────────────────────────────────────────────────────────────
export type Locale = 'pt' | 'en' | 'es' | 'zh';

export interface Translations {
  // ── META ──────────────────────────────────────────────────────────────
  meta: {
    appTitle: string;
    appDescription: string;
  };
  
  // ── MENU PRINCIPAL ────────────────────────────────────────────────────
  menu: {
    file: string;
    edit: string;
    examples: string;
    view: string;
    options: string;
    help: string;
  };
  
  // ── MENU ARQUIVO ──────────────────────────────────────────────────────
  file: {
    new: string;
    open: string;
    save: string;
    exportData: string;
    exportImage: string;
    precision: string;
  };
  
  // ── MENU EXEMPLOS — CATEGORIAS ────────────────────────────────────────
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
  
  // ── MENU EXEMPLOS — ITENS ─────────────────────────────────────────────
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
    campo_magnetico_terrestre: string;
    lotka: string;
    lorenz: string;
  };
  
  // ── MENU VISUALIZAÇÃO ─────────────────────────────────────────────────
  view: {
    grid: string;
    axes: string;
    clearTrails: string;
    centerView: string;
  };
  
  // ── MENU AJUDA ────────────────────────────────────────────────────────
  help: {
    syntax: string;
    about: string;
  };
  
  // ── MENU OPÇÕES ───────────────────────────────────────────────────────
  options: {
    precision: string;
    language: string;
  };
  
  // ── TOOLBAR ───────────────────────────────────────────────────────────
  toolbar: {
    play: string;
    pause: string;
    restart: string;
    stepBack: string;
    stepForward: string;
    undo: string;
    redo: string;
    undoTooltip: string;
    redoTooltip: string;
  };
  
  // ── PAINÉIS ───────────────────────────────────────────────────────────
  panels: {
    showObjects: string;
    showGraphs: string;
    objects: string;
    graphs: string;
    noObjects: string;
    noObjectsDesc: string;
    noProps: string;
    noPropsDesc: string;
    applyAndRestart: string;
    clearAll: string;
    minimize: string;
  };
  
  // ── OBJETOS (TIPOS) ───────────────────────────────────────────────────
  objectTypes: {
    particle: string;
    pendulum: string;
    spring: string;
    vector: string;
    circle: string;
    rectangle: string;
    text: string;
    field: string;
  };
  
  // ── OBJETOS (PROPRIEDADES COMPARTILHADAS) ─────────────────────────────
  commonProps: {
    name: string;
    color: string;
    show: string;
    hide: string;
    mode: string;
    moveUp: string;
    moveDown: string;
    type: string;
    reset: string;
    remove: string;
    identity: string;
    physics: string;
    geometry: string;
    visualization: string;
    content: string;
    configuration: string;
  };
  
  // ── PARTÍCULA ─────────────────────────────────────────────────────────
  particle: {
    defaultName: string;
    positionX: string;
    positionY: string;
    velX: string;
    velY: string;
    radius: string;
    showVelocity: string;
    trail: string;
    label: string;
    namePlaceholder: string;
    position: string;
    visualOffset: string;
    velocityVector: string;
    projections: string;
    scale: string;
    vectorColor: string;
    projectionColor: string;
    vectorLabel: string;
    projectionXLabel: string;
    projectionYLabel: string;
    magnitudeLabel: string;
    interpolationHint: string;
    vectorLength: string;
    image: string;
    useImage: string;
    imageFormat: string;
    loadImage: string;
    imageLoaded: string;
  };
  
  // ── PÊNDULO ───────────────────────────────────────────────────────────
  pendulum: {
    defaultName: string;
    angle: string;
    length: string;
    pivotX: string;
    pivotY: string;
    bobRadius: string;
    bobColor: string;
    rodColor: string;
    rotation: string;
  };
  
  // ── MOLA ──────────────────────────────────────────────────────────────
  spring: {
    defaultName: string;
    orientation: string;
    vertical: string;
    horizontal: string;
    blockPos: string;
    pivotX: string;
    pivotY: string;
    constant: string;
    variable: string;
    coils: string;
  };
  
  // ── VETOR ─────────────────────────────────────────────────────────────
  vector: {
    defaultName: string;
    originX: string;
    originY: string;
    componentVx: string;
    componentVy: string;
    scale: string;
    components: string;
    thickness: string;
    projections: string;
    projectionColor: string;
    label: string;
    vectorLabel: string;
    projectionXLabel: string;
    projectionYLabel: string;
    magnitudeLabel: string;
    interpolationHint: string;
  };
  
  // ── CÍRCULO ───────────────────────────────────────────────────────────
  circle: {
    defaultName: string;
    centerX: string;
    centerY: string;
    radiusUnit: string;
    radiusPixel: string;
    borderColor: string;
    fillColor: string;
  };
  
  // ── RETÂNGULO ─────────────────────────────────────────────────────────
  rectangle: {
    defaultName: string;
    width: string;
    height: string;
  };
  
  // ── TEXTO/LABEL ───────────────────────────────────────────────────────
  textLabel: {
    defaultName: string;
    posX: string;
    posY: string;
    text: string;
    textPlaceholder: string;
    size: string;
    interpolationHint: string;
  };
  
  // ── CAMPO VETORIAL ────────────────────────────────────────────────────
  field: {
    defaultName: string;
    fieldType: string;
    range: string;
    zAxisColor: string;
    zExprHint: string;
    zScaleHint: string;
    zExample: string;
    baseColor: string;
    viewMode: string;
    vectorsMode: string;
    fieldLinesMode: string;
    gridN: string;
    arrowScale: string;
    seeds: string;
    steps: string;
    stepSize: string;
    lineThickness: string;
  };
  
  // ── MODAIS ────────────────────────────────────────────────────────────
  modals: {
    newProject: string;
    newObject: string;
    cancel: string;
    add: string;
    apply: string;
    close: string;
    confirm: string;
    ok: string;
  };
  
  // ── DIÁLOGOS ──────────────────────────────────────────────────────────
  dialogs: {
    confirmation: string;
    warning: string;
    info: string;
    error: string;
    newProjectMsg: string;
    unsavedData: string;
    createNew: string;
  };
  
  // ── MENSAGENS ─────────────────────────────────────────────────────────
  messages: {
    modelOk: string;
    modelError: string;
    emptyModel: string;
    noUndoAction: string;
    noRedoAction: string;
    undoDone: string;
    redoDone: string;
    graphNotFound: string;
    selectYVar: string;
    runSimulationFirst: string;
    csvExported: string;
    csvDataExported: string;
    fileSaved: string;
    fileLoaded: string;
    invalidFile: string;
    fileError: string;
    numericError: string;
    imageLoaded: string;
    objectAdded: string;
    icApplied: string;
    precisionApplied: string;
    pngExported: string;
    hdPngExported: string;
    noData: string;
    visualOffsetReset: string;
    newProjectCreated: string;
    runSimulationOrChange: string;
  };
  
  // ── HELP MODAL ────────────────────────────────────────────────────────
  helpContent: {
    shortcutsTitle: string;
    statementsTitle: string;
    newProjectKey: string;
    saveKey: string;
    playKey: string;
    restartKey: string;
    stepForwardKey: string;
    stepBackKey: string;
    deleteKey: string;
    constantDesc: string;
    expressionDesc: string;
    availableFunctions: string;
    conditional: string;
    iterativeExample: string;
    differentialExample: string;
    conditionalExample: string;
    usageTips: string;
    dragTip: string;
    shiftDragTip: string;
    scrollTip: string;
    saveTip: string;
    rk4Tip: string;
    constants: string;
    power: string;
  };
  
  // ── ABOUT MODAL ───────────────────────────────────────────────────────
  about: {
    subtitle: string;
    versionLabel: string;
    authorLabel: string;
    websiteLabel: string;
    websiteValue: string;
    copyrightLabel: string;
    copyrightValue: string;
    mathParserLabel: string;
    mathParserValue: string;
    integratorsLabel: string;
    integratorsValue: string;
    graphs: string;
    equations: string;
  };

  precision: {
    format: string;
    decimals: string;
    preview: string;
    fixed: string;
    scientific: string;
    automatic: string;
    engineering: string;
  };
  
  // ── GRÁFICOS ──────────────────────────────────────────────────────────
  graphs: {
    graph1: string;
    graph2: string;
    graph3: string;
    graph4: string;
    simulationStopped: string;
  };
  
  // ── SETTINGS/CONFIGURAÇÃO ─────────────────────────────────────────────
  settings: {
    method: string;
    euler: string;
    rk4: string;
    timeStep: string;
    maxTime: string;
    speed: string;
    indVar: string;
    time: string;
    steps: string;
  };
  
  // ── INTERFACE GERAL ───────────────────────────────────────────────────
  ui: {
    animation: string;
    model: string;
    windows: string;
    showModel: string;
    verify: string;
    minimize: string;
    initialConditions: string;
    dragObject: string;
    shiftDrag: string;
    ready: string;
    clear: string;
    auto: string;
    image: string;
    data: string;
    fps: string;
    points: string;
    objectsCount: string;
    x: string;
    y1: string;
    y2: string;
    error: string;
    resizeDrag: string;
    toggleTheme: string;
    globalTrailMode: string;
    timeline: string;
  };
  
  // ── MODO DE RASTRO ────────────────────────────────────────────────────
  trailMode: {
    temporary: string;
    persistent: string;
    ghosts: string;
    none: string;
  };
}



// ── Dicionários ────────────────────────────────────────────────────────────
const translations: Record<Locale, Translations> = {
  pt: {
    meta: { appTitle: 'Boscolab', appDescription: 'Simulador de equações diferenciais' },
    menu: { file: 'Arquivo', edit: 'Editar', examples: 'Exemplos', view: 'Exibir', options: 'Opções', help: 'Ajuda' },
    file: { new: 'Novo', open: 'Abrir .modx', save: 'Salvar', exportData: 'Exportar Dados', exportImage: 'Exportar Imagem', precision: 'Precisão' },
    exCategories: { mechanics: 'Mecânica', kinematics: 'Cinemática', gravitation: 'Gravitação', waves: 'Ondas', oscillations: 'Oscilações', other: 'Outros', electromagnetism: 'Eletromagnetismo', complex: 'Sistemas Complexos' },
    exItems: { projetil: 'Lançamento de Projétil', projetil_drag: 'Projétil com Arrasto', queda: 'Queda Livre', queda_lua: 'Queda: Terra vs Lua', orbita: 'Lei de Kepler', orbita3: 'Problema dos 3 Corpos', solar: 'Sistema Planetário', batimento: 'Batimento', pendulo: 'Pêndulo Simples', pendulo_duplo: 'Pêndulo Duplo', mola: 'Oscilador Harmônico Simples', amortecido: 'Oscilador Amortecido', onda: 'Oscilador Forçado', mola2d: 'Mola 2D', vanderpol: 'Van der Pol', rc: 'Circuito RC', cargas: 'Cargas Elétricas', campo_eletrico: 'Campo Vetorial', campo_magnetico_terrestre: 'Campo Magnético Terrestre', lotka: 'Lotka-Volterra', lorenz: 'Atrator de Lorenz' },
    view: { grid: '⊞ Grade', axes: '↔ Eixos', clearTrails: '✕ Limpar Rastros', centerView: '⊙ Centralizar Vista' },
    help: { syntax: 'Sintaxe das Equações', about: 'Sobre' },
    options: { precision: 'Precisão', language: 'Idioma' },
    toolbar: { play: '▶ Iniciar', pause: '⏸  Parar', restart: '↺ Reiniciar', stepBack: '◀|', stepForward: '|▶', undo: '↩', redo: '↪', undoTooltip: 'Desfazer (Ctrl+Z)', redoTooltip: 'Refazer (Ctrl+Y)' },
    panels: { showObjects: 'Mostrar Objetos', showGraphs: 'Mostrar Gráficos', objects: 'Objetos', graphs: 'Gráficos', noObjects: 'Sem objetos.', noObjectsDesc: 'Adicione abaixo ↓', noProps: 'Clique num objeto', noPropsDesc: 'para ver propriedades', applyAndRestart: '✓ Aplicar e Reiniciar', clearAll: 'Limpar tudo', minimize: 'Minimizar' },
    objectTypes: { particle: '● Partícula', pendulum: '℘ Pêndulo', spring: '⇝ Mola', vector: '➡ Vetor', circle: '◯ Círculo', rectangle: '▭ Retângulo', text: 'T Texto', field: '⊞ Campo' },
    commonProps: { name: 'Nome', color: 'Cor', show: 'Mostrar', hide: 'Ocultar', mode: 'Modo', moveUp: 'Mover para cima (frente)', moveDown: 'Mover para baixo (atrás)', type: 'Tipo', reset: 'Resetar', remove: 'Remover', identity: 'Identidade', physics: 'Física', geometry: 'Geometria', visualization: 'Visualização', content: 'Conteúdo', configuration: 'Configuração' },
    particle: { defaultName: 'Particula{id}', positionX: 'Posição X', positionY: 'Posição Y', velX: 'Vel. X', velY: 'Vel. Y', radius: 'Raio (px)', showVelocity: 'Mostrar vetor', trail: 'Rastro', label: 'Rótulo', namePlaceholder: 'ex: bola', position: 'Posição', visualOffset: 'Offset visual', velocityVector: 'Vetor', projections: 'Projeções', scale: 'Escala', vectorColor: 'Cor do vetor', projectionColor: 'Cor da projeção', vectorLabel: 'Rótulo do vetor', projectionXLabel: 'Rótulo proj. X', projectionYLabel: 'Rótulo proj. Y', magnitudeLabel: 'Rótulo do módulo', interpolationHint: 'Use {varname}, {varname:2}, {vx}, {vy}, {mag} ou {mod}', vectorLength: 'Comprimento', image: 'Imagem', useImage: 'Usar imagem', imageFormat: 'PNG/JPG', loadImage: 'Carregar', imageLoaded: '✓ Imagem carregada — salva no projeto .modx' },
    pendulum: { defaultName: 'Pêndulo{id}', angle: 'Ângulo θ', length: 'Comprimento L', pivotX: 'Pivot X', pivotY: 'Pivot Y', bobRadius: 'Raio bob', bobColor: 'Cor bob', rodColor: 'Cor haste', rotation: 'Rotação °' },
    spring: { defaultName: 'Mola{id}', orientation: 'Orientação', vertical: 'Vertical (mola suspensa)', horizontal: 'Horizontal', blockPos: 'Pos. bloco', pivotX: 'Pivot X', pivotY: 'Pivot Y', constant: 'Constante', variable: 'Variável', coils: 'Espiras' },
    vector: { defaultName: 'Vetor{id}', originX: 'Origem X', originY: 'Origem Y', componentVx: 'Comp. X', componentVy: 'Comp. Y', scale: 'Escala', components: 'Componentes', thickness: 'Espessura', projections: 'Exibir projeções', projectionColor: 'Cor da projeção', label: 'Rótulo', vectorLabel: 'Rótulo do vetor', projectionXLabel: 'Rótulo proj. X', projectionYLabel: 'Rótulo proj. Y', magnitudeLabel: 'Rótulo do módulo', interpolationHint: 'Use {varname}, {varname:2}, {vx}, {vy}, {mag} ou {mod}' },
    circle: { defaultName: 'Círculo{id}', centerX: 'Centro X', centerY: 'Centro Y', radiusUnit: 'Raio (unid.)', radiusPixel: 'Raio', borderColor: 'Cor borda', fillColor: 'Cor fill' },
    rectangle: { defaultName: 'Rect{id}', width: 'Largura', height: 'Altura' },
    textLabel: { defaultName: 'Texto{id}', posX: 'Pos X', posY: 'Pos Y', text: 'Texto', textPlaceholder: 't = {t:2}s', size: 'Tamanho', interpolationHint: 'Use {varname} ou {varname:2} para interpolar valores' },
    field: { defaultName: 'Campo{id}', fieldType: 'Campo Vetorial', range: 'Alcance', zAxisColor: 'Eixo Z -> Cor', zExprHint: 'Se definido, a cor de cada ponto mapeia Fz:', zScaleHint: 'negativo -> zero -> positivo', zExample: 'Ex: z, x*y, sin(x)', baseColor: 'Cor base', viewMode: 'Modo de Visualização', vectorsMode: 'Vetores', fieldLinesMode: 'Linhas de Campo', gridN: 'Grade N', arrowScale: 'Escala seta', seeds: 'No sementes', steps: 'Passos', stepSize: 'Tamanho passo', lineThickness: 'Espessura linha' },
    modals: { newProject: 'Novo Projeto', newObject: 'Novo Objeto', cancel: 'Cancelar', add: 'Adicionar', apply: 'Aplicar', close: 'Fechar', confirm: 'Confirmar', ok: 'OK' },
    dialogs: { confirmation: '⚠️', warning: 'Aviso', info: 'ℹ️', error: 'Erro', newProjectMsg: 'Deseja criar um novo projeto?', unsavedData: '⚠️ Dados não salvos serão perdidos.', createNew: 'Criar Novo' },
    messages: { modelOk: '✓ Modelo Correto — {count} variáveis', modelError: 'Modelo com erros.', emptyModel: 'Escreva um modelo antes de simular.', noUndoAction: 'Nada para desfazer', noRedoAction: 'Nada para refazer', undoDone: '↩ Desfeito', redoDone: '↪ Refeito', graphNotFound: 'Gráfico não encontrado', selectYVar: 'Selecione uma variável Y no gráfico primeiro', runSimulationFirst: 'Execute a simulação primeiro', csvExported: '✓ CSV Gráfico {idx}: {count} pontos', csvDataExported: '✓ CSV: {count} pontos', fileSaved: '✓ Arquivo salvo', fileLoaded: '✓ Arquivo carregado', invalidFile: '❌ Arquivo inválido', fileError: '❌ Erro: {message}', numericError: 'Erro numérico: {message}', imageLoaded: '✓ Imagem carregada — salva no projeto .modx', objectAdded: '✓ {name} adicionado', icApplied: '✓ Condições iniciais aplicadas', precisionApplied: '✓ Precisão aplicada', pngExported: '✓ PNG exportado', hdPngExported: '✓ PNG HD exportado ({width}x{height}px)', noData: 'Sem dados', visualOffsetReset: '↺ Offset visual resetado', newProjectCreated: '✓ Novo projeto', runSimulationOrChange: 'Execute a simulação primeiro (ou mude a variável Y)' },
    helpContent: { shortcutsTitle: 'Atalhos de Teclado', statementsTitle: 'Instruções', newProjectKey: 'Novo projeto', saveKey: 'Salvar arquivo .modx', playKey: 'Iniciar / Parar simulação', restartKey: 'Reiniciar simulação a partir do início', stepForwardKey: 'Executar passo para frente', stepBackKey: 'Executar passo para trás', deleteKey: 'Remover objeto selecionado', constantDesc: 'Constante — valor numérico fixo', expressionDesc: 'Expressão — recalculada a cada passo', availableFunctions: 'Funções Disponíveis', conditional: 'Condicional', iterativeExample: 'Iterativo — exemplo de definição com tempo (t)', differentialExample: 'Diferencial — integrado pelos métodos Euler ou RK4', conditionalExample: 'Exemplo:', usageTips: 'Dicas de Uso', dragTip: 'Arraste objetos na área de animação para reposicioná-los visualmente.', shiftDragTip: 'Shift+arraste modifica as condições iniciais em tempo real.', scrollTip: 'Use scroll do mouse para zoom na animação.', saveTip: 'Salve sua simulação: .modx (arquivo do tipo XML).', rk4Tip: 'O método RK4 é mais preciso para sistemas físicos contínuos.', constants: 'Constantes:', power: 'Potência:' },
    about: { subtitle: 'Simulador Interativo de Física Computacional', versionLabel: 'Versão', authorLabel: 'Autor', websiteLabel: 'Site', websiteValue: 'Saiba mais em', copyrightLabel: 'Copyright', copyrightValue: '© Todos os direitos reservados', mathParserLabel: 'Parser Matemático', mathParserValue: 'Substituição recursiva', integratorsLabel: 'Integradores', integratorsValue: 'Euler · RK4 (Runge-Kutta de 4ª ordem)', graphs: 'Gráficos', equations: 'Equações' },
    precision: { format: 'Formato', decimals: 'Casas decimais', preview: 'Prévia', fixed: 'Decimal fixo', scientific: 'Notação científica', automatic: 'Automática', engineering: 'Engenharia (x10e3)' },
    graphs: { graph1: 'Gráfico 1', graph2: 'Gráfico 2', graph3: 'Gráfico 3', graph4: 'Gráfico 4', simulationStopped: 'simulação parada' },
    settings: { method: 'Método', euler: 'Euler', rk4: 'RK4', timeStep: 'dt', maxTime: 't máx', speed: 'vel', indVar: 'var ind', time: 't =', steps: 'n =' },
    ui: { animation: 'Animação', model: 'Modelo', windows: 'Janelas:', showModel: 'Mostrar Modelo', verify: '✓ Verificar', minimize: '─', initialConditions: 'Condições Iniciais', dragObject: 'arraste obj.', shiftDrag: 'shift+arraste=CI', ready: 'Pronto', clear: '✕ Limpar', auto: '⊙ Auto', image: 'Imagem', data: 'Dados', fps: 'FPS', points: 'pts', objectsCount: 'obj', x: 'X', y1: 'Y1', y2: 'Y2', error: 'Erro', resizeDrag: 'Arraste para redimensionar', toggleTheme: 'Alternar tema', globalTrailMode: 'Modo global de rastro', timeline: 'linha do tempo' },
    trailMode: { temporary: 'Temporário', persistent: 'Persistente', ghosts: 'Fantasmas', none: 'Sem rastro' },
  },

  en: {
    meta: { appTitle: 'Boscolab', appDescription: 'Differential equations simulator' },
    menu: { file: 'File', edit: 'Edit', examples: 'Examples', view: 'View', options: 'Options', help: 'Help' },
    file: { new: 'New', open: 'Open .modx', save: 'Save', exportData: 'Export Data', exportImage: 'Export Image', precision: 'Precision' },
    exCategories: { mechanics: 'Mechanics', kinematics: 'Kinematics', gravitation: 'Gravitation', waves: 'Waves', oscillations: 'Oscillations', other: 'Other', electromagnetism: 'Electromagnetism', complex: 'Complex Systems' },
    exItems: { projetil: 'Projectile Launch', projetil_drag: 'Projectile with Drag', queda: 'Free Fall', queda_lua: 'Free Fall: Earth vs Moon', orbita: 'Kepler\'s Law', orbita3: 'Three-Body Problem', solar: 'Planetary System', batimento: 'Wave Beating', pendulo: 'Simple Pendulum', pendulo_duplo: 'Double Pendulum', mola: 'Simple Harmonic Oscillator', amortecido: 'Damped Oscillator', onda: 'Forced Oscillator', mola2d: '2D Spring', vanderpol: 'Van der Pol', rc: 'RC Circuit', cargas: 'Electric Charges', campo_eletrico: 'Vector Field', campo_magnetico_terrestre: 'Earth Magnetic Field', lotka: 'Lotka-Volterra', lorenz: 'Lorenz Attractor' },
    view: { grid: '⊞ Grid', axes: '↔ Axes', clearTrails: '✕ Clear Trails', centerView: '⊙ Center View' },
    help: { syntax: 'Equation Syntax', about: 'About' },
    options: { precision: 'Precision', language: 'Language' },
    toolbar: { play: '▶ Play', pause: '⏸  Pause', restart: '↺ Restart', stepBack: '◀|', stepForward: '|▶', undo: '↩', redo: '↪', undoTooltip: 'Undo (Ctrl+Z)', redoTooltip: 'Redo (Ctrl+Y)' },
    panels: { showObjects: 'Show Objects', showGraphs: 'Show Graphs', objects: 'Objects', graphs: 'Graphs', noObjects: 'No objects.', noObjectsDesc: 'Add below ↓', noProps: 'Click on an object', noPropsDesc: 'to see properties', applyAndRestart: '✓ Apply and Restart', clearAll: 'Clear all', minimize: 'Minimize' },
    objectTypes: { particle: '● Particle', pendulum: '℘ Pendulum', spring: '⇝ Spring', vector: '➡ Vector', circle: '◯ Circle', rectangle: '▭ Rectangle', text: 'T Text', field: '⊞ Field' },
    commonProps: { name: 'Name', color: 'Color', show: 'Show', hide: 'Hide', mode: 'Mode', moveUp: 'Move up (front)', moveDown: 'Move down (back)', type: 'Type', reset: 'Reset', remove: 'Remove', identity: 'Identity', physics: 'Physics', geometry: 'Geometry', visualization: 'Visualization', content: 'Content', configuration: 'Configuration' },
    particle: { defaultName: 'Particle{id}', positionX: 'Position X', positionY: 'Position Y', velX: 'Vel. X', velY: 'Vel. Y', radius: 'Radius (px)', showVelocity: 'Show vector', trail: 'Trail', label: 'Label', namePlaceholder: 'e.g. ball', position: 'Position', visualOffset: 'Visual offset', velocityVector: 'Vector', projections: 'Projections', scale: 'Scale', vectorColor: 'Vector color', projectionColor: 'Projection color', vectorLabel: 'Vector label', projectionXLabel: 'X projection label', projectionYLabel: 'Y projection label', magnitudeLabel: 'Magnitude label', interpolationHint: 'Use {varname}, {varname:2}, {vx}, {vy}, {mag}, or {mod}', vectorLength: 'Length', image: 'Image', useImage: 'Use image', imageFormat: 'PNG/JPG', loadImage: 'Load', imageLoaded: '✓ Image loaded — saved in .modx project' },
    pendulum: { defaultName: 'Pendulum{id}', angle: 'Angle θ', length: 'Length L', pivotX: 'Pivot X', pivotY: 'Pivot Y', bobRadius: 'Bob radius', bobColor: 'Bob color', rodColor: 'Rod color', rotation: 'Rotation °' },
    spring: { defaultName: 'Spring{id}', orientation: 'Orientation', vertical: 'Vertical (hanging spring)', horizontal: 'Horizontal', blockPos: 'Block pos', pivotX: 'Pivot X', pivotY: 'Pivot Y', constant: 'Constant', variable: 'Variable', coils: 'Coils' },
    vector: { defaultName: 'Vector{id}', originX: 'Origin X', originY: 'Origin Y', componentVx: 'Component X', componentVy: 'Component Y', scale: 'Scale', components: 'Components', thickness: 'Thickness', projections: 'Show projections', projectionColor: 'Projection color', label: 'Label', vectorLabel: 'Vector label', projectionXLabel: 'X projection label', projectionYLabel: 'Y projection label', magnitudeLabel: 'Magnitude label', interpolationHint: 'Use {varname}, {varname:2}, {vx}, {vy}, {mag}, or {mod}' },
    circle: { defaultName: 'Circle{id}', centerX: 'Center X', centerY: 'Center Y', radiusUnit: 'Radius (unit)', radiusPixel: 'Radius', borderColor: 'Border color', fillColor: 'Fill color' },
    rectangle: { defaultName: 'Rect{id}', width: 'Width', height: 'Height' },
    textLabel: { defaultName: 'Text{id}', posX: 'Pos X', posY: 'Pos Y', text: 'Text', textPlaceholder: 't = {t:2}s', size: 'Size', interpolationHint: 'Use {varname} or {varname:2} to interpolate values' },
    field: { defaultName: 'Field{id}', fieldType: 'Vector Field', range: 'Range', zAxisColor: 'Z Axis -> Color', zExprHint: 'If defined, each point color maps Fz:', zScaleHint: 'negative -> zero -> positive', zExample: 'Ex: z, x*y, sin(x)', baseColor: 'Base color', viewMode: 'View Mode', vectorsMode: 'Vectors', fieldLinesMode: 'Field Lines', gridN: 'Grid N', arrowScale: 'Arrow scale', seeds: 'Seed count', steps: 'Steps', stepSize: 'Step size', lineThickness: 'Line thickness' },
    modals: { newProject: 'New Project', newObject: 'New Object', cancel: 'Cancel', add: 'Add', apply: 'Apply', close: 'Close', confirm: 'Confirm', ok: 'OK' },
    dialogs: { confirmation: '⚠️', warning: 'Warning', info: 'ℹ️', error: 'Error', newProjectMsg: 'Do you want to create a new project?', unsavedData: '⚠️ Unsaved data will be lost.', createNew: 'Create New' },
    messages: { modelOk: '✓ Model OK — {count} variables', modelError: 'Model with errors.', emptyModel: 'Write a model before running the simulation.', noUndoAction: 'Nothing to undo', noRedoAction: 'Nothing to redo', undoDone: '↩ Undone', redoDone: '↪ Redone', graphNotFound: 'Graph not found', selectYVar: 'Select a Y variable in the graph first', runSimulationFirst: 'Run the simulation first', csvExported: '✓ CSV Graph {idx}: {count} points', csvDataExported: '✓ CSV: {count} points', fileSaved: '✓ File saved', fileLoaded: '✓ File loaded', invalidFile: '❌ Invalid file', fileError: '❌ Error: {message}', numericError: 'Numeric error: {message}', imageLoaded: '✓ Image loaded — saved in .modx project', objectAdded: '✓ {name} added', icApplied: '✓ Initial conditions applied', precisionApplied: '✓ Precision applied', pngExported: '✓ PNG exported', hdPngExported: '✓ HD PNG exported ({width}x{height}px)', noData: 'No data', visualOffsetReset: '↺ Visual offset reset', newProjectCreated: '✓ New project', runSimulationOrChange: 'Run the simulation first (or change the Y variable)' },
    helpContent: { shortcutsTitle: 'Keyboard Shortcuts', statementsTitle: 'Statements', newProjectKey: 'New project', saveKey: 'Save .modx file', playKey: 'Play / Pause simulation', restartKey: 'Restart simulation from the beginning', stepForwardKey: 'Step forward', stepBackKey: 'Step backward', deleteKey: 'Remove selected object', constantDesc: 'Constant — fixed numeric value', expressionDesc: 'Expression — recalculated each step', availableFunctions: 'Available Functions', conditional: 'Conditional', iterativeExample: 'Iterative — example of definition with time (t)', differentialExample: 'Differential — integrated through Euler or RK4 method', conditionalExample: 'Example:', usageTips: 'Usage Tips', dragTip: 'Drag objects in the animation area to reposition them visually.', shiftDragTip: 'Shift+drag modifies initial conditions in real time.', scrollTip: 'Use mouse scroll to zoom in the animation.', saveTip: 'Save your simulation: .modx (XML file format).', rk4Tip: 'The RK4 method is more accurate for continuous physical systems.', constants: 'Constants:', power: 'Power:' },
    about: { subtitle: 'Interactive Computational Physics Simulator', versionLabel: 'Version', authorLabel: 'Author', websiteLabel: 'Website', websiteValue: 'Learn more at', copyrightLabel: 'Copyright', copyrightValue: '© All rights reserved', mathParserLabel: 'Math Parser', mathParserValue: 'Recursive substitution', integratorsLabel: 'Integrators', integratorsValue: 'Euler · RK4 (Runge-Kutta 4th order)', graphs: 'Graphs', equations: 'Equations' },
    precision: { format: 'Format', decimals: 'Decimal places', preview: 'Preview', fixed: 'Fixed decimal', scientific: 'Scientific notation', automatic: 'Automatic', engineering: 'Engineering (x10e3)' },
    graphs: { graph1: 'Graph 1', graph2: 'Graph 2', graph3: 'Graph 3', graph4: 'Graph 4', simulationStopped: 'simulation stopped' },
    settings: { method: 'Method', euler: 'Euler', rk4: 'RK4', timeStep: 'dt', maxTime: 't max', speed: 'speed', indVar: 'ind var', time: 't =', steps: 'n =' },
    ui: { animation: 'Animation', model: 'Model', windows: 'Windows:', showModel: 'Show Model', verify: '✓ Verify', minimize: '─', initialConditions: 'Initial Conditions', dragObject: 'drag obj.', shiftDrag: 'shift+drag=IC', ready: 'Ready', clear: '✕ Clear', auto: '⊙ Auto', image: 'Image', data: 'Data', fps: 'FPS', points: 'pts', objectsCount: 'obj', x: 'X', y1: 'Y1', y2: 'Y2', error: 'Error', resizeDrag: 'Drag to resize', toggleTheme: 'Toggle theme', globalTrailMode: 'Global trail mode', timeline: 'timeline' },
    trailMode: { temporary: 'Temporary', persistent: 'Persistent', ghosts: 'Ghosts', none: 'No Trail' },
  },

  es: {
    meta: { appTitle: 'Boscolab', appDescription: 'Simulador de ecuaciones diferenciales' },
    menu: { file: 'Archivo', edit: 'Editar', examples: 'Ejemplos', view: 'Vista', options: 'Opciones', help: 'Ayuda' },
    file: { new: 'Nuevo', open: 'Abrir .modx', save: 'Guardar', exportData: 'Exportar Datos', exportImage: 'Exportar Imagen', precision: 'Precisión' },
    exCategories: { mechanics: 'Mecánica', kinematics: 'Cinemática', gravitation: 'Gravitación', waves: 'Ondas', oscillations: 'Oscilaciones', other: 'Otros', electromagnetism: 'Electromagnetismo', complex: 'Sistemas Complejos' },
    exItems: { projetil: 'Lanzamiento de Proyectil', projetil_drag: 'Proyectil con Arrastre', queda: 'Caída Libre', queda_lua: 'Caída: Tierra vs Luna', orbita: 'Ley de Kepler', orbita3: 'Problema de los 3 Cuerpos', solar: 'Sistema Planetario', batimento: 'Batido de Ondas', pendulo: 'Péndulo Simple', pendulo_duplo: 'Péndulo Doble', mola: 'Oscilador Armónico Simple', amortecido: 'Oscilador Amortiguado', onda: 'Oscilador Forzado', mola2d: 'Resorte 2D', vanderpol: 'Van der Pol', rc: 'Circuito RC', cargas: 'Cargas Eléctricas', campo_eletrico: 'Campo Vectorial', campo_magnetico_terrestre: 'Campo Magnético Terrestre', lotka: 'Lotka-Volterra', lorenz: 'Atractor de Lorenz' },
    view: { grid: '⊞ Cuadrícula', axes: '↔ Ejes', clearTrails: '✕ Limpiar Rastros', centerView: '⊙ Centrar Vista' },
    help: { syntax: 'Sintaxis de Ecuaciones', about: 'Acerca de' },
    options: { precision: 'Precisión', language: 'Idioma' },
    toolbar: { play: '▶ Iniciar', pause: '⏸  Pausar', restart: '↺ Reiniciar', stepBack: '◀|', stepForward: '|▶', undo: '↩', redo: '↪', undoTooltip: 'Deshacer (Ctrl+Z)', redoTooltip: 'Rehacer (Ctrl+Y)' },
    panels: { showObjects: 'Mostrar Objetos', showGraphs: 'Mostrar Gráficos', objects: 'Objetos', graphs: 'Gráficos', noObjects: 'Sin objetos.', noObjectsDesc: 'Agregue abajo ↓', noProps: 'Haga clic en un objeto', noPropsDesc: 'para ver propiedades', applyAndRestart: '✓ Aplicar e Reiniciar', clearAll: 'Limpiar todo', minimize: 'Minimizar' },
    objectTypes: { particle: '● Partícula', pendulum: '℘ Péndulo', spring: '⇝ Resorte', vector: '➡ Vector', circle: '◯ Círculo', rectangle: '▭ Rectángulo', text: 'T Texto', field: '⊞ Campo' },
    commonProps: { name: 'Nombre', color: 'Color', show: 'Mostrar', hide: 'Ocultar', mode: 'Modo', moveUp: 'Mover arriba (frente)', moveDown: 'Mover abajo (fondo)', type: 'Tipo', reset: 'Restablecer', remove: 'Eliminar', identity: 'Identidad', physics: 'Física', geometry: 'Geometría', visualization: 'Visualización', content: 'Contenido', configuration: 'Configuración' },
    particle: { defaultName: 'Particula{id}', positionX: 'Posición X', positionY: 'Posición Y', velX: 'Vel. X', velY: 'Vel. Y', radius: 'Radio (px)', showVelocity: 'Mostrar vector', trail: 'Rastro', label: 'Etiqueta', namePlaceholder: 'p.ej: bola', position: 'Posición', visualOffset: 'Desplazamiento visual', velocityVector: 'Vector', projections: 'Proyecciones', scale: 'Escala', vectorColor: 'Color del vector', projectionColor: 'Color de la proyección', vectorLabel: 'Etiqueta del vector', projectionXLabel: 'Etiqueta proy. X', projectionYLabel: 'Etiqueta proy. Y', magnitudeLabel: 'Etiqueta del módulo', interpolationHint: 'Use {varname}, {varname:2}, {vx}, {vy}, {mag} o {mod}', vectorLength: 'Longitud', image: 'Imagen', useImage: 'Usar imagen', imageFormat: 'PNG/JPG', loadImage: 'Cargar', imageLoaded: '✓ Imagen cargada — guardada en proyecto .modx' },
    pendulum: { defaultName: 'Péndulo{id}', angle: 'Ángulo θ', length: 'Longitud L', pivotX: 'Pivot X', pivotY: 'Pivot Y', bobRadius: 'Radio bob', bobColor: 'Color bob', rodColor: 'Color varilla', rotation: 'Rotación °' },
    spring: { defaultName: 'Resorte{id}', orientation: 'Orientación', vertical: 'Vertical (resorte colgante)', horizontal: 'Horizontal', blockPos: 'Pos. bloque', pivotX: 'Pivot X', pivotY: 'Pivot Y', constant: 'Constante', variable: 'Variable', coils: 'Espiras' },
    vector: { defaultName: 'Vector{id}', originX: 'Origen X', originY: 'Origen Y', componentVx: 'Componente X', componentVy: 'Componente Y', scale: 'Escala', components: 'Componentes', thickness: 'Grosor', projections: 'Mostrar proyecciones', projectionColor: 'Color de la proyección', label: 'Etiqueta', vectorLabel: 'Etiqueta del vector', projectionXLabel: 'Etiqueta proy. X', projectionYLabel: 'Etiqueta proy. Y', magnitudeLabel: 'Etiqueta del módulo', interpolationHint: 'Use {varname}, {varname:2}, {vx}, {vy}, {mag} o {mod}' },
    circle: { defaultName: 'Círculo{id}', centerX: 'Centro X', centerY: 'Centro Y', radiusUnit: 'Radio (unid.)', radiusPixel: 'Radio', borderColor: 'Color borde', fillColor: 'Color relleno' },
    rectangle: { defaultName: 'Rect{id}', width: 'Ancho', height: 'Altura' },
    textLabel: { defaultName: 'Texto{id}', posX: 'Pos X', posY: 'Pos Y', text: 'Texto', textPlaceholder: 't = {t:2}s', size: 'Tamaño', interpolationHint: 'Use {varname} o {varname:2} para interpolar valores' },
    field: { defaultName: 'Campo{id}', fieldType: 'Campo Vectorial', range: 'Alcance', zAxisColor: 'Eje Z -> Color', zExprHint: 'Si se define, el color de cada punto mapea Fz:', zScaleHint: 'negativo -> cero -> positivo', zExample: 'Ej: z, x*y, sin(x)', baseColor: 'Color base', viewMode: 'Modo de Visualización', vectorsMode: 'Vectores', fieldLinesMode: 'Líneas de Campo', gridN: 'Malla N', arrowScale: 'Escala flecha', seeds: 'Nº semillas', steps: 'Pasos', stepSize: 'Tamaño de paso', lineThickness: 'Grosor de línea' },
    modals: { newProject: 'Nuevo Proyecto', newObject: 'Nuevo Objeto', cancel: 'Cancelar', add: 'Agregar', apply: 'Aplicar', close: 'Cerrar', confirm: 'Confirmar', ok: 'OK' },
    dialogs: { confirmation: '⚠️', warning: 'Advertencia', info: 'ℹ️', error: 'Error', newProjectMsg: '¿Desea crear un nuevo proyecto?', unsavedData: '⚠️ Los datos no guardados se perderán.', createNew: 'Crear Nuevo' },
    messages: { modelOk: '✓ Modelo OK — {count} variables', modelError: 'Modelo con errores.', emptyModel: 'Escriba un modelo antes de ejecutar la simulación.', noUndoAction: 'Nada para deshacer', noRedoAction: 'Nada para rehacer', undoDone: '↩ Deshecho', redoDone: '↪ Rehecho', graphNotFound: 'Gráfico no encontrado', selectYVar: 'Seleccione primero una variable Y en el gráfico', runSimulationFirst: 'Ejecute la simulación primero', csvExported: '✓ CSV Gráfico {idx}: {count} puntos', csvDataExported: '✓ CSV: {count} puntos', fileSaved: '✓ Archivo guardado', fileLoaded: '✓ Archivo cargado', invalidFile: '❌ Archivo inválido', fileError: '❌ Error: {message}', numericError: 'Error numérico: {message}', imageLoaded: '✓ Imagen cargada — guardada en proyecto .modx', objectAdded: '✓ {name} agregado', icApplied: '✓ Condiciones iniciales aplicadas', precisionApplied: '✓ Precisión aplicada', pngExported: '✓ PNG exportado', hdPngExported: '✓ PNG HD exportado ({width}x{height}px)', noData: 'Sin datos', visualOffsetReset: '↺ Desplazamiento visual restablecido', newProjectCreated: '✓ Nuevo proyecto', runSimulationOrChange: 'Ejecute la simulación primero (o cambie la variable Y)' },
    helpContent: { shortcutsTitle: 'Atajos de Teclado', statementsTitle: 'Instrucciones', newProjectKey: 'Nuevo proyecto', saveKey: 'Guardar archivo .modx', playKey: 'Reproducir / Pausar simulación', restartKey: 'Reiniciar simulación desde el principio', stepForwardKey: 'Paso adelante', stepBackKey: 'Paso atrás', deleteKey: 'Eliminar objeto seleccionado', constantDesc: 'Constante — valor numérico fijo', expressionDesc: 'Expresión — recalculada en cada paso', availableFunctions: 'Funciones Disponibles', conditional: 'Condicional', iterativeExample: 'Iterativo — ejemplo de definición con tiempo (t)', differentialExample: 'Diferencial — integrado por los métodos Euler o RK4', conditionalExample: 'Ejemplo:', usageTips: 'Consejos de Uso', dragTip: 'Arrastre objetos en el área de animación para reposicionarlos visualmente.', shiftDragTip: 'Shift+arrastrar modifica las condiciones iniciales en tiempo real.', scrollTip: 'Use la rueda del mouse para hacer zoom en la animación.', saveTip: 'Guarde su simulación: .modx (formato de archivo XML).', rk4Tip: 'El método RK4 es más preciso para sistemas físicos continuos.', constants: 'Constantes:', power: 'Potencia:' },
    about: { subtitle: 'Simulador Interactivo de Física Computacional', versionLabel: 'Versión', authorLabel: 'Autor', websiteLabel: 'Sitio web', websiteValue: 'Más información en', copyrightLabel: 'Copyright', copyrightValue: '© Todos los derechos reservados', mathParserLabel: 'Parser Matemático', mathParserValue: 'Sustitución recursiva', integratorsLabel: 'Integradores', integratorsValue: 'Euler · RK4 (Runge-Kutta de 4º orden)', graphs: 'Gráficos', equations: 'Ecuaciones' },
    precision: { format: 'Formato', decimals: 'Decimales', preview: 'Vista previa', fixed: 'Decimal fijo', scientific: 'Notación científica', automatic: 'Automática', engineering: 'Ingeniería (x10e3)' },
    graphs: { graph1: 'Gráfico 1', graph2: 'Gráfico 2', graph3: 'Gráfico 3', graph4: 'Gráfico 4', simulationStopped: 'simulación detenida' },
    settings: { method: 'Método', euler: 'Euler', rk4: 'RK4', timeStep: 'dt', maxTime: 't máx', speed: 'vel', indVar: 'var ind', time: 't =', steps: 'n =' },
    ui: { animation: 'Animación', model: 'Modelo', windows: 'Ventanas:', showModel: 'Mostrar Modelo', verify: '✓ Verificar', minimize: '─', initialConditions: 'Condiciones Iniciales', dragObject: 'arrastra obj.', shiftDrag: 'shift+arrastra=CI', ready: 'Listo', clear: '✕ Limpiar', auto: '⊙ Auto', image: 'Imagen', data: 'Datos', fps: 'FPS', points: 'pts', objectsCount: 'obj', x: 'X', y1: 'Y1', y2: 'Y2', error: 'Error', resizeDrag: 'Arrastre para redimensionar', toggleTheme: 'Alternar tema', globalTrailMode: 'Modo global de rastro', timeline: 'linea de tiempo' },
    trailMode: { temporary: 'Temporal', persistent: 'Persistente', ghosts: 'Fantasmas', none: 'Sin Rastro' },
  },

  zh: {
    meta: { appTitle: 'Boscolab', appDescription: '微分方程模拟器' },
    menu: { file: '文件', edit: '编辑', examples: '示例', view: '视图', options: '选项', help: '帮助' },
    file: { new: '新建', open: '打开 .modx', save: '保存', exportData: '导出数据', exportImage: '导出图像', precision: '精度' },
    exCategories: { mechanics: '力学', kinematics: '运动学', gravitation: '万有引力', waves: '波动', oscillations: '振动', other: '其他', electromagnetism: '电磁学', complex: '复杂系统' },
    exItems: { projetil: '抛体运动', projetil_drag: '带阻力的抛体', queda: '自由落体', queda_lua: '自由落体：地球 vs 月球', orbita: '开普勒定律', orbita3: '三体问题', solar: '行星系统', batimento: '波的干涉', pendulo: '简单摆', pendulo_duplo: '双摆', mola: '简谐振子', amortecido: '阻尼振子', onda: '强迫振子', mola2d: '二维弹簧', vanderpol: '范德波尔', rc: 'RC 电路', cargas: '电荷', campo_eletrico: '矢量场', campo_magnetico_terrestre: '地球磁场', lotka: '洛卡-沃尔泰拉', lorenz: '洛伦茨吸引子' },
    view: { grid: '⊞ 网格', axes: '↔ 坐标轴', clearTrails: '✕ 清除轨迹', centerView: '⊙ 中心视图' },
    help: { syntax: '方程语法', about: '关于' },
    options: { precision: '精度', language: '语言' },
    toolbar: { play: '▶ 播放', pause: '⏸  暂停', restart: '↺ 重新开始', stepBack: '◀|', stepForward: '|▶', undo: '↩', redo: '↪', undoTooltip: '撤销 (Ctrl+Z)', redoTooltip: '重做 (Ctrl+Y)' },
    panels: { showObjects: '显示对象', showGraphs: '显示图表', objects: '对象', graphs: '图表', noObjects: '没有对象。', noObjectsDesc: '在下方添加 ↓', noProps: '单击一个对象', noPropsDesc: '查看属性', applyAndRestart: '✓ 应用并重新开始', clearAll: '全部清除', minimize: '最小化' },
    objectTypes: { particle: '● 粒子', pendulum: '℘ 摆', spring: '⇝ 弹簧', vector: '➡ 矢量', circle: '◯ 圆', rectangle: '▭ 矩形', text: 'T 文本', field: '⊞ 场' },
    commonProps: { name: '名称', color: '颜色', show: '显示', hide: '隐藏', mode: '模式', moveUp: '上移（前景）', moveDown: '下移（后景）', type: '类型', reset: '重置', remove: '删除', identity: '身份', physics: '物理', geometry: '几何', visualization: '可视化', content: '内容', configuration: '配置' },
    particle: { defaultName: '粒子{id}', positionX: '位置 X', positionY: '位置 Y', velX: '速度 X', velY: '速度 Y', radius: '半径 (px)', showVelocity: '显示矢量', trail: '轨迹', label: '标签', namePlaceholder: '例如：球', position: '位置', visualOffset: '视觉偏移', velocityVector: '矢量', projections: '投影', scale: '缩放', vectorColor: '矢量颜色', projectionColor: '投影颜色', vectorLabel: '矢量标签', projectionXLabel: 'X 投影标签', projectionYLabel: 'Y 投影标签', magnitudeLabel: '模长标签', interpolationHint: '可使用 {varname}、{varname:2}、{vx}、{vy}、{mag} 或 {mod}', vectorLength: '长度', image: '图像', useImage: '使用图像', imageFormat: 'PNG/JPG', loadImage: '加载', imageLoaded: '✓ 图像已加载 — 已保存到 .modx 项目' },
    pendulum: { defaultName: '摆{id}', angle: '角度 θ', length: '长度 L', pivotX: '轴心 X', pivotY: '轴心 Y', bobRadius: '球半径', bobColor: '球颜色', rodColor: '杆颜色', rotation: '旋转 °' },
    spring: { defaultName: '弹簧{id}', orientation: '方向', vertical: '竖直（悬挂弹簧）', horizontal: '水平', blockPos: '块位置', pivotX: '轴心 X', pivotY: '轴心 Y', constant: '常数', variable: '变量', coils: '线圈' },
    vector: { defaultName: '矢量{id}', originX: '原点 X', originY: '原点 Y', componentVx: 'X 分量', componentVy: 'Y 分量', scale: '缩放', components: '分量', thickness: '粗细', projections: '显示投影', projectionColor: '投影颜色', label: '标签', vectorLabel: '矢量标签', projectionXLabel: 'X 投影标签', projectionYLabel: 'Y 投影标签', magnitudeLabel: '模长标签', interpolationHint: '可使用 {varname}、{varname:2}、{vx}、{vy}、{mag} 或 {mod}' },
    circle: { defaultName: '圆{id}', centerX: '中心 X', centerY: '中心 Y', radiusUnit: '半径（单位）', radiusPixel: '半径', borderColor: '边框颜色', fillColor: '填充颜色' },
    rectangle: { defaultName: '矩形{id}', width: '宽度', height: '高度' },
    textLabel: { defaultName: '文本{id}', posX: '位置 X', posY: '位置 Y', text: '文本', textPlaceholder: 't = {t:2}s', size: '大小', interpolationHint: '使用 {varname} 或 {varname:2} 来插值' },
    field: { defaultName: '场{id}', fieldType: '矢量场', range: '范围', zAxisColor: 'Z 轴 -> 颜色', zExprHint: '定义后，每个点的颜色将映射 Fz：', zScaleHint: '负值 -> 零 -> 正值', zExample: '例如: z, x*y, sin(x)', baseColor: '基础颜色', viewMode: '显示模式', vectorsMode: '矢量', fieldLinesMode: '场线', gridN: '网格 N', arrowScale: '箭头缩放', seeds: '种子数', steps: '步数', stepSize: '步长', lineThickness: '线宽' },
    modals: { newProject: '新项目', newObject: '新对象', cancel: '取消', add: '添加', apply: '应用', close: '关闭', confirm: '确认', ok: '确定' },
    dialogs: { confirmation: '⚠️', warning: '警告', info: 'ℹ️', error: '错误', newProjectMsg: '是否要创建新项目？', unsavedData: '⚠️ 未保存的数据将丢失。', createNew: '创建新项目' },
    messages: { modelOk: '✓ 模型正常 — {count} 个变量', modelError: '模型有错误。', emptyModel: '请先编写模型再运行模拟。', noUndoAction: '没有可撤销的操作', noRedoAction: '没有可重做的操作', undoDone: '↩ 已撤销', redoDone: '↪ 已重做', graphNotFound: '未找到图表', selectYVar: '请先在图表中选择 Y 变量', runSimulationFirst: '请先运行模拟', csvExported: '✓ CSV 图表 {idx}：{count} 个点', csvDataExported: '✓ CSV：{count} 个点', fileSaved: '✓ 文件已保存', fileLoaded: '✓ 文件已加载', invalidFile: '❌ 无效文件', fileError: '❌ 错误：{message}', numericError: '数值错误：{message}', imageLoaded: '✓ 图像已加载 — 已保存到 .modx 项目', objectAdded: '✓ 已添加 {name}', icApplied: '✓ 初始条件已应用', precisionApplied: '✓ 精度已应用', pngExported: '✓ PNG 已导出', hdPngExported: '✓ 高清 PNG 已导出（{width}x{height}px）', noData: '无数据', visualOffsetReset: '↺ 视觉偏移已重置', newProjectCreated: '✓ 新项目', runSimulationOrChange: '请先运行模拟（或更改 Y 变量）' },
    helpContent: { shortcutsTitle: '键盘快捷键', statementsTitle: '语句', newProjectKey: '新项目', saveKey: '保存 .modx 文件', playKey: '播放 / 暂停模拟', restartKey: '从头开始重新启动模拟', stepForwardKey: '向前步进', stepBackKey: '向后步进', deleteKey: '删除选定的对象', constantDesc: '常数 — 固定数值', expressionDesc: '表达式 — 每步重新计算', availableFunctions: '可用函数', conditional: '条件语句', iterativeExample: '迭代式 — 带时间 (t) 的定义示例', differentialExample: '微分式 — 通过 Euler 或 RK4 方法积分', conditionalExample: '示例：', usageTips: '使用技巧', dragTip: '在动画区域中拖动对象以直观地重新定位它们。', shiftDragTip: 'Shift + 拖动可实时修改初始条件。', scrollTip: '使用鼠标滚轮在动画中进行缩放。', saveTip: '保存您的模拟：.modx（XML 文件格式）。', rk4Tip: 'RK4 方法对连续物理系统更加精确。', constants: '常数：', power: '幂：' },
    about: { subtitle: '交互式计算物理模拟器', versionLabel: '版本', authorLabel: '作者', websiteLabel: '网站', websiteValue: '了解更多', copyrightLabel: '版权', copyrightValue: '© 版权所有', mathParserLabel: '数学解析器', mathParserValue: '递归替换', integratorsLabel: '积分器', integratorsValue: 'Euler · RK4（四阶 Runge-Kutta）', graphs: '图表', equations: '方程' },
    precision: { format: '格式', decimals: '小数位', preview: '预览', fixed: '定点小数', scientific: '科学计数法', automatic: '自动', engineering: '工程记数法 (x10e3)' },
    graphs: { graph1: '图表 1', graph2: '图表 2', graph3: '图表 3', graph4: '图表 4', simulationStopped: '模拟已停止' },
    settings: { method: '方法', euler: 'Euler', rk4: 'RK4', timeStep: 'dt', maxTime: 't 最大值', speed: '速度', indVar: '独立变量', time: 't =', steps: 'n =' },
    ui: { animation: '动画', model: '模型', windows: '窗口：', showModel: '显示模型', verify: '✓ 验证', minimize: '─', initialConditions: '初始条件', dragObject: '拖动对象', shiftDrag: 'shift+拖动=IC', ready: '准备好', clear: '✕ 清除', auto: '⊙ 自动', image: '图像', data: '数据', fps: 'FPS', points: '点', objectsCount: '对象', x: 'X', y1: 'Y1', y2: 'Y2', error: '错误', resizeDrag: '拖动以调整大小', toggleTheme: '切换主题', globalTrailMode: '全局轨迹模式', timeline: '时间轴' },
    trailMode: { temporary: '临时', persistent: '持久', ghosts: '幻影', none: '无轨迹' },
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

// ── Função para interpolar valores em strings ──────────────────────────────
export function interpolate(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)(?::(\d+))?\}/g, (match, key, precision) => {
    const value = values[key];
    if (value === undefined) return match;
    if (precision) return Number(value).toFixed(parseInt(precision));
    return String(value);
  });
}

export { translations };
