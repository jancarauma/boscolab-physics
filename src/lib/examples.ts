export const EXAMPLES: Record<string, any> = {
  queda: {
    model: `// Queda Livre\ng = 9.8\n\ny(t+dt) = y(t) + vy*dt\nvy(t+dt) = vy(t) - g*dt`,
    ic: { y: 22, vy: 0 }, dt: 0.01, tmax: 2.070,
    objects: [{ type: 'particle', x: '0', y: 'y', color: '#4f9eff', showTrail: true, showVec: true, vx: '0', vy: 'vy', vecScale: 0.2, label: 'queda' }],
    g0: { xvar: 't', yvar: 'y' }, g1: { xvar: 't', yvar: 'vy' }, scale: 8, ox: .5, oy: .1
  },
  projetil: {
    model: `// Projétil Simples\ng = 9.8\n\nx(t+dt) = x(t) + vx*dt\ny(t+dt) = y(t) + vy*dt\nvx(t+dt) = vx(t)\nvy(t+dt) = vy(t) - g*dt`,
    ic: { x: 0, y: 0, vx: 10, vy: 15 }, dt: 0.01, tmax: 5,
    objects: [{ type: 'particle', x: 'x', y: 'y', color: '#f97316', showTrail: true, showVec: true, vx: 'vx', vy: 'vy', vecScale: 0.28, vecColor: '#34d399', radius: 8, label: '' }],
    g0: { xvar: 'x', yvar: 'y' }, g1: { xvar: 't', yvar: 'vy', yvar2: 'vx' }, scale: 18, ox: .05, oy: .55
  },
  projetil_drag: {
    model: `// Projétil com Arrasto\ng = 9.8\nk = 0.08\nm = 1.0\n\nx(t+dt) = x(t) + vx*dt\ny(t+dt) = y(t) + vy*dt\nvx(t+dt) = vx(t) + ax*dt\nvy(t+dt) = vy(t) + ay*dt\n\nv = sqrt(vx^2 + vy^2)\nax = -k/m * vx * v\nay = -g - k/m * vy * v`,
    ic: { x: 0, y: 0, vx: 20, vy: 25 }, dt: 0.005, tmax: 6,
    objects: [
      { type: 'vectorfield', fxExpr: '-0.8', fyExpr: '-0.3', gridN: 14, gridRange: 30, arrowScale: 0.3, color: '#94a3b8' },
      { type: 'particle', x: 'x', y: 'y', color: '#fb7185', showTrail: true, showVec: false, radius: 8 }
    ],
    g0: { xvar: 'x', yvar: 'y' }, g1: { xvar: 't', yvar: 'vy' }, scale: 16, ox: .03, oy: .55
  },
  pendulo: {
    model: `// Pêndulo Simples\ng = 9.8\nL = 1.5\n\ntheta(t+dt) = theta(t) + omega*dt\nomega(t+dt) = omega(t) - (g/L)*sin(theta)*dt`,
    ic: { theta: 1.2, omega: 0 }, dt: 0.005, tmax: 12,
    objects: [{ type: 'pendulum', theta: 'theta', L: 1.5, color: '#f97316', showTrail: true, radius: 10 }],
    g0: { xvar: 't', yvar: 'theta' }, g1: { xvar: 'theta', yvar: 'omega' }, scale: 80, ox: .5, oy: .25
  },
  mola: {
    model: `// Mola Suspensa (Vertical) — Oscilador Amortecido\nk = 5.0\nm = 1.0\nb = 0.3\ng = 9.8\n\nx_eq = m*g/k\n\nx(t+dt) = x(t) + v*dt\nv(t+dt) = v(t) + (g - k/m*(x - x_eq) - b/m*v)*dt`,
    ic: { x: 2.5, v: 0 }, dt: 0.01, tmax: 20,
    objects: [{ type: 'spring', x: '0', y: 'x', x1: 0, y1: 5, pivotX: 0, pivotY: 5, coils: 10, vertical: true, color: '#a78bfa' }],
    g0: { xvar: 't', yvar: 'x', yvar2: 'v' }, g1: { xvar: 'x', yvar: 'v' }, scale: 50, ox: .5, oy: .15
  },
  orbita: {
    model: `// Lei de Kepler \nG = 1.0\nM = 1.0\n\nr = sqrt(x^2 + y^2)\nax = -G*M*x/r^3\nay = -G*M*y/r^3\n\nx(t+dt) = x(t) + vx*dt\ny(t+dt) = y(t) + vy*dt\nvx(t+dt) = vx(t) + ax*dt\nvy(t+dt) = vy(t) + ay*dt`,
    ic: { x: 1, y: 0, vx: 0, vy: 0.7 }, dt: 0.005, tmax: 30,
    objects: [      
      { type: 'particle', x: '0', y: '0', color: '#fbbf24', showVec: false, radius: 12, label: "Sol" },
      { type: 'particle', x: 'x', y: 'y', color: '#4f9eff', showTrail: true, trailLen: 600, showVec: false, radius: 6, label: "Terra" },
    ],
    g0: { xvar: 'x', yvar: 'y' }, g1: { xvar: 't', yvar: 'x', yvar2: 'y' }, scale: 140, ox: .5, oy: .5
  },
  lotka: {
    model: `// Lotka-Volterra (Predador-Presa)\na = 1.0\nb = 0.1\nc = 0.075\nd = 1.5\n\nx(t+dt) = x(t) + (a*x - b*x*y)*dt\ny(t+dt) = y(t) + (c*x*y - d*y)*dt`,
    ic: { x: 10, y: 5 }, dt: 0.005, tmax: 40,
    objects: [{ type: 'particle', x: 'x', y: 'y', color: '#34d399', showTrail: true, trailLen: 800, radius: 6, label: '' }],
    g0: { xvar: 't', yvar: 'x', yvar2: 'y' }, g1: { xvar: 'x', yvar: 'y' }, scale: 12, ox: .1, oy: .9
  },
  lorenz: {
    model: `// Atrator de Lorenz (projeção XZ)\nsigma = 10\nrho = 28\nbeta = 2.667\n\nx(t+dt) = x(t) + sigma*(y - x)*dt\ny(t+dt) = y(t) + (x*(rho - z) - y)*dt\nz(t+dt) = z(t) + (x*y - beta*z)*dt`,
    ic: { x: 0.1, y: 0, z: 0 }, dt: 0.002, tmax: 50,
    objects: [{ type: 'particle', x: 'x', y: 'z', color: '#a78bfa', showTrail: true, trailLen: 2000, radius: 3, showVec: false }],
    g0: { xvar: 'x', yvar: 'z' }, g1: { xvar: 't', yvar: 'x' }, scale: 8, ox: .5, oy: .5
  },
  pendulo_duplo: {
    model: `// Pêndulo Duplo (caótico)\ng = 9.8\nL1 = 1.2\nL2 = 1.2\nm1 = 1.0\nm2 = 1.0\n\nx1 = sin(theta1)*L1\ny1 = -cos(theta1)*L1\nx2 = x1 + sin(theta2)*L2\ny2 = y1 - cos(theta2)*L2\n\ntheta1(t+dt) = theta1(t) + omega1*dt\ntheta2(t+dt) = theta2(t) + omega2*dt\n\ndel = theta2 - theta1\nD1 = L1*(2*m1+m2-m2*cos(2*del))\nD2 = L2*(2*m1+m2-m2*cos(2*del))\n\nalpha1 = (-g*(2*m1+m2)*sin(theta1) - m2*g*sin(theta1-2*theta2) - 2*sin(del)*m2*(omega2^2*L2+omega1^2*L1*cos(del))) / D1\nalpha2 = (2*sin(del)*(omega1^2*L1*(m1+m2)+g*(m1+m2)*cos(theta1)+omega2^2*L2*m2*cos(del))) / D2\n\nomega1(t+dt) = omega1(t) + alpha1*dt\nomega2(t+dt) = omega2(t) + alpha2*dt`,
    ic: { theta1: 2.5, theta2: 1.5, omega1: 0, omega2: 0 }, dt: 0.004, tmax: 40,
    objects: [
      { type: 'pendulum', theta: 'theta1', L: 1.2, pivotX: 0, pivotY: 0, color: '#f97316', showTrail: false, radius: 9 },
      { type: 'pendulum', theta: 'theta2', L: 1.2, pivotX: 'x1', pivotY: 'y1', color: '#fb7185', showTrail: true, trailLen: 1500, radius: 9 },
    ],
    g0: { xvar: 't', yvar: 'theta1', yvar2: 'theta2' }, g1: { xvar: 'theta1', yvar: 'omega1' }, scale: 90, ox: .5, oy: .28
  },
  mola2d: {
    model: `// Mola 2D — Movimento elíptico\nkx = 4.0\nky = 9.0\nm = 1.0\n\nx(t+dt) = x(t) + vx*dt\ny(t+dt) = y(t) + vy*dt\nvx(t+dt) = vx(t) + (-kx/m * x)*dt\nvy(t+dt) = vy(t) + (-ky/m * y)*dt`,
    ic: { x: 2, y: 0, vx: 0, vy: 3 }, dt: 0.01, tmax: 15,
    objects: [{ type: 'particle', x: 'x', y: 'y', color: '#06b6d4', showTrail: true, trailLen: 1000, radius: 7, showVec: true, vx: 'vx', vy: 'vy', vecScale: 0.2, vecColor: '#fbbf24' }],
    g0: { xvar: 'x', yvar: 'y' }, g1: { xvar: 't', yvar: 'x', yvar2: 'y' }, scale: 50, ox: .5, oy: .5
  },
  orbita3: {
    model: `// Problema de 3 Corpos (restrito)\nG = 1.0\nm1 = 1.0\nm2 = 1.0\n\nomega = 1.0\nx1 = cos(omega*t)\ny1 = sin(omega*t)\nx2 = -cos(omega*t)\ny2 = -sin(omega*t)\n\nr1 = sqrt((x-x1)^2 + (y-y1)^2 + 0.01)\nr2 = sqrt((x-x2)^2 + (y-y2)^2 + 0.01)\n\nax = -G*m1*(x-x1)/r1^3 - G*m2*(x-x2)/r2^3\nay = -G*m1*(y-y1)/r1^3 - G*m2*(y-y2)/r2^3\n\nx(t+dt) = x(t) + vx*dt\ny(t+dt) = y(t) + vy*dt\nvx(t+dt) = vx(t) + ax*dt\nvy(t+dt) = vy(t) + ay*dt`,
    ic: { x: 0.5, y: 0.0, vx: 0.0, vy: 1.2 }, dt: 0.001, tmax: 30,
    objects: [
      { type: 'particle', x: 'x', y: 'y', color: '#06b6d4', showTrail: true, trailLen: 3000, radius: 4, showVec: false },
      { type: 'circle', x: 'x1', y: 'y1', r: '0.08', color: '#fbbf24', fillColor: 'rgba(251,191,36,.4)' },
      { type: 'circle', x: 'x2', y: 'y2', r: '0.08', color: '#fb7185', fillColor: 'rgba(251,113,133,.4)' },
    ],
    g0: { xvar: 'x', yvar: 'y' }, g1: { xvar: 't', yvar: 'x', yvar2: 'y' }, scale: 100, ox: .5, oy: .5
  },
  rc: {
    model: `// Circuito RC — Carregamento Didático
// Parâmetros do circuito
R = 1000           // Resistência (Ω)
C = 0.001          // Capacitância (F)
Vs = 5.0           // Tensão da fonte (V)
tau = R*C          // Constante de tempo (s)

// Dinâmica: dvc/dt = (Vs - vc)/(R*C)
vc(t+dt) = vc(t) + ((Vs - vc)/(R*C))*dt

// Corrente no circuito (decai exponencialmente)
i = (Vs - vc)/R

// Tensão no resistor (complementar à do capacitor)
vr = Vs - vc

// Energia armazenada no capacitor
e_cap = 0.5*C*vc^2

// % de carregamento do capacitor
percent_charge = 100*(vc/Vs)`,
    ic: { vc: 0 }, dt: 0.001, tmax: 5.0,
    objects: [
      // PARTÍCULA DIDÁTICA: Sobe conforme o capacitor carrega
      { type: 'particle', x: '0', y: 'vc', color: '#4f9eff', showTrail: true, trailLen: 2500, radius: 9, showVec: true, vy: 'i', vx: '0', vecScale: 0.3, vecColor: '#34d399', label: 'Carregamento' },
      
      // Separador
      { type: 'label', x: -5.8, y: 5.8, text: '═══════════════════════════════════', fontSize: 12, color: '#475569' },
      
      // Título
      { type: 'label', x: 1.1, y: 3.1, text: 'CARREGAMENTO DE CAPACITOR RC', fontSize: 14, color: '#f0f9ff' },
      
      // Seção 1: Tensão do capacitor
      { type: 'label', x: 1.1, y: 2.8, text: 'TENSÃO DO CAPACITOR', fontSize: 11, color: '#94a3b8' },
      { type: 'label', x: 1.1, y: 2.5, text: 'Vc = {vc:5} V  |  {percent_charge:0}% carregado', fontSize: 12, color: '#4f9eff' },
      
      // Seção 2: Corrente
      { type: 'label', x: 1.1, y: 2.2, text: 'CORRENTE (decaimento exponencial)', fontSize: 11, color: '#94a3b8' },
      { type: 'label', x: 1.1, y: 1.9, text: 'i = {i:8} A', fontSize: 12, color: '#34d399' },
      
      // Seção 3: Voltagens
      { type: 'label', x: 1.1, y: 1.6, text: 'DIFERENÇAS DE POTENCIAL (DDP)', fontSize: 11, color: '#94a3b8' },
      { type: 'label', x: 1.1, y: 1.3, text: 'Vs = {Vs:3} V  |  Vr = {vr:5} V  (Vc + Vr = Vs)', fontSize: 11, color: '#fbbf24' },
      
      // Seção 4: Parâmetros
      { type: 'label', x: 1.1, y: 1.0, text: 'PARÂMETROS & ENERGIA', fontSize: 11, color: '#94a3b8' },
      { type: 'label', x: 1.1, y: 0.7, text: 'τ = {tau:4} s  |  E = {e_cap:8} J', fontSize: 11, color: '#a78bfa' },
      
      // Nota didática
      { type: 'label', x: 1.1, y: 0.4, text: '📌 Em ~5τ: 99% carregado. Após 5 segundos.', fontSize: 10, color: '#22d3ee' },
    ],
    g0: { xvar: 't', yvar: 'vc', yvar2: 'vr' }, 
    g1: { xvar: 't', yvar: 'i' }, 
    scale: 100, ox: .08, oy: .15
  },
  onda: {
    model: `// Oscilador Forçado com Ressonância\nm = 1.0\nb = 0.2\nk = 4.0\nF0 = 2.0\nomega_f = 2.0\n\nomega0 = sqrt(k/m)\n\nx(t+dt) = x(t) + v*dt\nv(t+dt) = v(t) + (-b/m*v - k/m*x + F0/m*cos(omega_f*t))*dt`,
    ic: { x: 0, v: 0 }, dt: 0.01, tmax: 60,
    objects: [{ type: 'spring', x: '0', y: 'x', x1: 0, y1: 5, pivotX: 0, pivotY: 5, coils: 12, vertical: true, color: '#4f9eff' }],
    g0: { xvar: 't', yvar: 'x' }, g1: { xvar: 'x', yvar: 'v' }, scale: 50, ox: .5, oy: .15
  },
  vanderpol: {
    model: `// Oscilador de Van der Pol\nmu = 2.0\n\nx(t+dt) = x(t) + v*dt\nv(t+dt) = v(t) + (mu*(1-x^2)*v - x)*dt`,
    ic: { x: 0.5, v: 0 }, dt: 0.005, tmax: 40,
    objects: [{ type: 'particle', x: 'x', y: 'v', color: '#06b6d4', showTrail: true, trailLen: 2000, radius: 6, showVec: false }],
    g0: { xvar: 't', yvar: 'x' }, g1: { xvar: 'x', yvar: 'v' }, scale: 50, ox: .5, oy: .5
  },
  solar: {
    model: `// Sistema Solar Completo\nGM = 39.478\n\nrm = sqrt(xm^2 + ym^2)\naxm = -GM*xm/rm^3\naym = -GM*ym/rm^3\nxm(t+dt) = xm(t) + vxm*dt\nym(t+dt) = ym(t) + vym*dt\nvxm(t+dt) = vxm(t) + axm*dt\nvym(t+dt) = vym(t) + aym*dt\n\nrv = sqrt(xv^2 + yv^2)\naxv = -GM*xv/rv^3\nayv = -GM*yv/rv^3\nxv(t+dt) = xv(t) + vxv*dt\nyv(t+dt) = yv(t) + vyv*dt\nvxv(t+dt) = vxv(t) + axv*dt\nvyv(t+dt) = vyv(t) + ayv*dt\n\nrt = sqrt(xt^2 + yt^2)\naxt = -GM*xt/rt^3\nayt = -GM*yt/rt^3\nxt(t+dt) = xt(t) + vxt*dt\nyt(t+dt) = yt(t) + vyt*dt\nvxt(t+dt) = vxt(t) + axt*dt\nvyt(t+dt) = vyt(t) + ayt*dt\n\nrma = sqrt(xma^2 + yma^2)\naxma = -GM*xma/rma^3\nayma = -GM*yma/rma^3\nxma(t+dt) = xma(t) + vxma*dt\nyma(t+dt) = yma(t) + vyma*dt\nvxma(t+dt) = vxma(t) + axma*dt\nvyma(t+dt) = vyma(t) + ayma*dt\n\nrj = sqrt(xj^2 + yj^2)\naxj = -GM*xj/rj^3\nayj = -GM*yj/rj^3\nxj(t+dt) = xj(t) + vxj*dt\nyj(t+dt) = yj(t) + vyj*dt\nvxj(t+dt) = vxj(t) + axj*dt\nvyj(t+dt) = vyj(t) + ayj*dt\n\nrs = sqrt(xs^2 + ys^2)\naxs = -GM*xs/rs^3\nays = -GM*ys/rs^3\nxs(t+dt) = xs(t) + vxs*dt\nys(t+dt) = ys(t) + vys*dt\nvxs(t+dt) = vxs(t) + axs*dt\nvys(t+dt) = vys(t) + ays*dt\n\nru = sqrt(xu^2 + yu^2)\naxu = -GM*xu/ru^3\nayu = -GM*yu/ru^3\nxu(t+dt) = xu(t) + vxu*dt\nyu(t+dt) = yu(t) + vyu*dt\nvxu(t+dt) = vxu(t) + axu*dt\nvyu(t+dt) = vyu(t) + ayu*dt\n\nrn = sqrt(xn^2 + yn^2)\naxn = -GM*xn/rn^3\nayn = -GM*yn/rn^3\nxn(t+dt) = xn(t) + vxn*dt\nyn(t+dt) = yn(t) + vyn*dt\nvxn(t+dt) = vxn(t) + axn*dt\nvyn(t+dt) = vyn(t) + ayn*dt\n\nrp = sqrt(xp^2 + yp^2)\naxp = -GM*xp/rp^3\nayp = -GM*yp/rp^3\nxp(t+dt) = xp(t) + vxp*dt\nyp(t+dt) = yp(t) + vyp*dt\nvxp(t+dt) = vxp(t) + axp*dt\nvyp(t+dt) = vyp(t) + ayp*dt\n\nrl = sqrt(xl^2 + yl^2)\naxl = -GM*xl/rl^3\nayl = -GM*yl/rl^3\nxl(t+dt) = xl(t) + vxl*dt\nyl(t+dt) = yl(t) + vyl*dt\nvxl(t+dt) = vxl(t) + axl*dt\nvyl(t+dt) = vyl(t) + ayl*dt`,
    ic: { xm: 0.39, ym: 0.03, vxm: -2.0, vym: 9.8, xv: 0.72, yv: 0.05, vxv: -1.5, vyv: 7.2, xt: 1.0, yt: 0.08, vxt: -0.5, vyt: 6.3, xma: 1.52, yma: 0.12, vxma: -1.2, vyma: 5.0, xj: 5.2, yj: 0.2, vxj: -0.8, vyj: 2.8, xs: 9.54, ys: 0.3, vxs: -0.5, vys: 2.0, xu: 19.2, yu: 0.5, vxu: -0.3, vyu: 1.4, xn: 30.1, yn: 0.8, vxn: -0.2, vyn: 1.1, xp: 39.5, yp: 1.0, vxp: -0.15, vyp: 0.9, xl: 1.005, yl: 0.08, vxl: -0.8, vyl: 6.5 },
    dt: 0.000005, tmax: 8,
    objects: [
      { type: 'circle', x: '0', y: '0', r: '0.12', color: '#ffd700', fillColor: 'rgba(255,215,0,.35)' },
      { type: 'particle', x: 'xm', y: 'ym', color: '#b0c0d0', showTrail: true, trailLen: 1200, radius: 3, label: 'Mercúrio' },
      { type: 'particle', x: 'xv', y: 'yv', color: '#e8cda0', showTrail: true, trailLen: 1200, radius: 4, label: 'Vênus' },
      { type: 'particle', x: 'xt', y: 'yt', color: '#4f9eff', showTrail: true, trailLen: 1200, radius: 4, label: 'Terra' },
      { type: 'particle', x: 'xma', y: 'yma', color: '#f97316', showTrail: true, trailLen: 1000, radius: 4, label: 'Marte' },
      { type: 'particle', x: 'xj', y: 'yj', color: '#daa520', showTrail: true, trailLen: 800, radius: 6, label: 'Júpiter' },
      { type: 'particle', x: 'xs', y: 'ys', color: '#f4e4c1', showTrail: true, trailLen: 600, radius: 5, label: 'Saturno' },
      { type: 'particle', x: 'xu', y: 'yu', color: '#4fd0e7', showTrail: true, trailLen: 400, radius: 4, label: 'Urano' },
      { type: 'particle', x: 'xn', y: 'yn', color: '#4169e1', showTrail: true, trailLen: 300, radius: 4, label: 'Netuno' },
      { type: 'particle', x: 'xp', y: 'yp', color: '#8b7355', showTrail: true, trailLen: 200, radius: 2, label: 'Plutão' },
    ],
    g0: { xvar: 'xt', yvar: 'yt' }, g1: { xvar: 't', yvar: 'rt' }, scale: 40, ox: .5, oy: .5
  },
  cargas: {
    model: `// Cargas Elétricas\nk = 1.0\nx1c = -2\ny1c = 0\nx2c = 2\ny2c = 0\n\nr1 = sqrt((x-x1c)^2 + (y-y1c)^2 + 0.02)\nr2 = sqrt((x-x2c)^2 + (y-y2c)^2 + 0.02)\n\nfx = k*(x-x1c)/r1^3 - k*(x-x2c)/r2^3\nfy = k*(y-y1c)/r1^3 - k*(y-y2c)/r2^3\n\nm = 0.5\nx(t+dt) = x(t) + vx*dt\ny(t+dt) = y(t) + vy*dt\nvx(t+dt) = vx(t) + (fx/m)*dt\nvy(t+dt) = vy(t) + (fy/m)*dt`,
    ic: { x: 0, y: 2.5, vx: 0.8, vy: 0 }, dt: 0.002, tmax: 15,
    objects: [
      { type: 'vectorfield', fxExpr: '(x+2)/((x+2)^2+y^2+0.02)^1.5 - (x-2)/((x-2)^2+y^2+0.02)^1.5', fyExpr: 'y/((x+2)^2+y^2+0.02)^1.5 - y/((x-2)^2+y^2+0.02)^1.5', gridN: 16, gridRange: 5, arrowScale: 0.35, color: '#4f9eff' },
      { type: 'circle', x: '-2', y: '0', r: '0.18', color: '#fb7185', fillColor: 'rgba(251,113,133,.4)' },
      { type: 'circle', x: '2', y: '0', r: '0.18', color: '#4f9eff', fillColor: 'rgba(79,158,255,.4)' },
      { type: 'particle', x: 'x', y: 'y', color: '#34d399', showTrail: true, trailLen: 1200, radius: 6, showVec: true, vx: 'vx', vy: 'vy', vecScale: 0.15, vecColor: '#fbbf24' },
    ],
    g0: { xvar: 'x', yvar: 'y' }, g1: { xvar: 't', yvar: 'r1' }, scale: 60, ox: .5, oy: .5
  },
  campo_eletrico: {
    model: `// Campo Vetorial Puro\nomega = 1.0\nphi = omega*t`,
    ic: { omega: 1 }, dt: 0.1, tmax: 100,
    objects: [
      { type: 'vectorfield', fxExpr: 'Math.sin(y)*Math.cos(x*0.5)', fyExpr: 'Math.cos(x)*Math.sin(y*0.5)', gridN: 18, gridRange: 6, arrowScale: 0.45, color: '#a78bfa' },
      { type: 'label', x: -5.5, y: 5.5, text: 'Campo: F = (sin y·cos x/2, cos x·sin y/2)', fontSize: 11, color: '#94a3b8' },
    ],
    g0: { xvar: 't', yvar: 't' }, g1: { xvar: 't', yvar: 't' }, scale: 50, ox: .5, oy: .5
  },
  queda_lua: {
    model: `// Queda Livre: Terra vs Lua\ng_terra = 9.8\ng_lua = 1.62\n\nyt(t+dt) = yt(t) + vyt*dt\nvyt(t+dt) = vyt(t) - g_terra*dt\n\nyl(t+dt) = yl(t) + vyl*dt\nvyl(t+dt) = vyl(t) - g_lua*dt`,
    ic: { yt: 20, vyt: 0, yl: 20, vyl: 0 }, dt: 0.01, tmax: 4.880,
    objects: [
      { type: 'particle', x: '-3', y: 'yt', color: '#4f9eff', showTrail: true, trailLen: 300, radius: 9, showVec: false, label: 'Terra' },
      { type: 'particle', x: '3', y: 'yl', color: '#fbbf24', showTrail: true, trailLen: 300, radius: 9, showVec: false, label: 'Lua' },
    ],
    g0: { xvar: 't', yvar: 'yt', yvar2: 'yl' }, g1: { xvar: 't', yvar: 'vyt', yvar2: 'vyl' }, scale: 12, ox: .5, oy: .1
  },
  amortecido: {
    model: `// Oscilador Harmônico Amortecido\nm = 1.0\nk = 4.0\nb = 0.5\nomega0 = sqrt(k/m)\nzeta = b/(2*sqrt(m*k))\n\nx(t+dt) = x(t) + v*dt\nv(t+dt) = v(t) + (-b/m*v - k/m*x)*dt\n\nEk = 0.5*m*v^2\nEp = 0.5*k*x^2\nE = Ek + Ep`,
    ic: { x: 3, v: 0 }, dt: 0.01, tmax: 20,
    objects: [
      { type: 'spring', x: '0', y: 'x', x1: 0, y1: 5, pivotX: 0, pivotY: 5, coils: 10, vertical: true, color: '#a78bfa' },
      { type: 'label', x: -4, y: 4.5, text: 'ζ={zeta:3}  ω₀={omega0:2} rad/s', fontSize: 13, color: '#94a3b8' },
      { type: 'label', x: -4, y: 3.2, text: 'E = {E:3} J', fontSize: 13, color: '#fbbf24' },
    ],
    g0: { xvar: 't', yvar: 'x', yvar2: 'v' }, g1: { xvar: 'x', yvar: 'v' }, scale: 50, ox: .5, oy: .15
  },
  campo_magnetico_terrestre: {
    model: `// Campo Magnético Terrestre\n// Magnetosfera interagindo com o vento solar`,
    ic: {}, dt: 0.1, tmax: 100,
    objects: [
      // Vento solar + interação com a magnetosfera (âmbar)
      {
        type: 'vectorfield',
        fxExpr: '1',
        fyExpr: '0.3*(-8 * y / Math.pow(x * x + y * y + 0.5, 1.5) * Math.exp(- (x * x + y * y) / (2 * 2 * 2)))',
        gridRange: 7, color: '#f97316',
        vfMode: 'fieldlines', fieldSeeds: 44, fieldSteps: 400, fieldDs: 0.04, lineWidth: 1.2,
      },
      // Campo dipolar da Terra (azul)
      {
        type: 'vectorfield',
        fxExpr: '0.1*(3 * (1 + 3 * Math.exp(- ( (x + 1.5) * (x + 1.5) ) / (2 * 2) )) * x * y / Math.pow(x * x + y * y + 0.06, 2.5) * (1 + 1.5 * (1 + Math.tanh(x / 6)) / 3))',
        fyExpr: '0.1*((2 * y * y - x * x) / Math.pow(x * x + y * y + 0.06, 2.5) * (1 - 0.7 * Math.exp(-((x + 1.2) * (x + 1.2)) / (2 * 1.5 * 1.5))) * (1 + 2 * 0.5 * (1 + Math.tanh((x - 0.6) / 6))))',
        gridRange: 2.5, color: '#38bdf8',
        vfMode: 'fieldlines', fieldSeeds: 25, fieldSteps: 300, fieldDs: 0.03, lineWidth: 1.8,
      },
      // Terra
      { type: 'circle', x: '0', y: '0', r: '0.4', color: '#60a5fa', fillColor: 'rgba(56,189,248,.6)' },
      // Rótulos
      { type: 'label', x: -6.5, y: 6.6, text: '☀ Vento Solar', fontSize: 12, color: '#fb923c' },
      { type: 'label', x: -6.5, y: -6.2, text: 'Campo Magnético Terrestre', fontSize: 12, color: '#94a3b8' },
    ],
    g0: { xvar: 't', yvar: 't' }, g1: { xvar: 't', yvar: 't' }, scale: 50, ox: .5, oy: .5
  },
  batimento: {
    model: `// Batimento de Ondas\nomega1 = 6.28\nomega2 = 6.91\nA1 = 1.0\nA2 = 1.0\n\nphi1(t+dt) = phi1(t) + omega1*dt\nphi2(t+dt) = phi2(t) + omega2*dt\n\ny1 = A1*sin(phi1)\ny2 = A2*sin(phi2)\ny = y1 + y2\n\nf_bat = (omega2 - omega1)/(2*3.14159)\nomega_bat = omega2 - omega1`,
    ic: { phi1: 0, phi2: 0 }, dt: 0.005, tmax: 20,
    objects: [
      { type: 'label', x: -6, y: 6, text: 'Batimento de Ondas', fontSize: 15, color: '#e2e8f0' },
      { type: 'label', x: -6, y: 4.8, text: 'ω₁ = {omega1:2} rad/s', fontSize: 12, color: '#4f9eff' },
      { type: 'label', x: -6, y: 3.7, text: 'ω₂ = {omega2:2} rad/s', fontSize: 12, color: '#a78bfa' },
      { type: 'label', x: -6, y: 2.5, text: 'Δω (bat.) = {omega_bat:3} rad/s', fontSize: 12, color: '#fbbf24' },
      { type: 'label', x: -6, y: 1.4, text: 'y₁ = {y1:3}', fontSize: 12, color: '#4f9eff' },
      { type: 'label', x: -6, y: 0.3, text: 'y₂ = {y2:3}', fontSize: 12, color: '#a78bfa' },
      { type: 'label', x: -6, y: -0.8, text: 'y = y₁+y₂ = {y:3}', fontSize: 13, color: '#34d399' },
      { type: 'particle', x: 't', y: 'y', color: '#34d399', showTrail: true, trailMode: 'persist', trailLen: 5000, radius: 3, showVec: false, label: '' },
      { type: 'particle', x: 't', y: 'y1', color: '#4f9eff', showTrail: true, trailMode: 'fade', trailLen: 300, radius: 2, showVec: false, label: '' },
    ],
    g0: { xvar: 't', yvar: 'y', yvar2: 'y1' }, g1: { xvar: 't', yvar: 'y2' }, scale: 40, ox: .03, oy: .5
  },
};
