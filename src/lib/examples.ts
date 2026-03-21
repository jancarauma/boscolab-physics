export const EXAMPLES: Record<string, any> = {
  queda: {
    model: `// Queda Livre\ng = 9.8\n\ny(t+dt) = y(t) + vy*dt\nvy(t+dt) = vy(t) - g*dt`,
    ic: { y: 22, vy: 0 }, dt: 0.01, tmax: 2.070,
    objects: [{ type: 'particle', x: '0', y: 'y', color: '#4f9eff', showTrail: true, showVec: true, vx: '0', vy: 'vy', vecScale: 0.2, label: 'queda' }],
    g0: { xvar: 't', yvar: 'y' }, g1: { xvar: 't', yvar: 'vy' }, scale: 8, ox: .5, oy: .1
  },
  projetil: {
    model: `// Lançamento de Projétil\ng = 9.8\n\nx1(t+dt) = x1(t) + vx1*dt\ny1(t+dt) = y1(t) + vy1*dt\nvx1(t+dt) = vx1(t)\nvy1(t+dt) = vy1(t) - g*dt\n\nx2(t+dt) = x2(t) + vx2*dt\ny2(t+dt) = y2(t) + vy2*dt\nvx2(t+dt) = vx2(t)\nvy2(t+dt) = vy2(t) - g*dt\n\nx3(t+dt) = x3(t) + vx3*dt\ny3(t+dt) = y3(t) + vy3*dt\nvx3(t+dt) = vx3(t)\nvy3(t+dt) = vy3(t) - g*dt\n\nv1 = sqrt(vx1^2 + vy1^2)\nv2 = sqrt(vx2^2 + vy2^2)\nv3 = sqrt(vx3^2 + vy3^2)\nx_apice = 10*15/g\ny_apice = 15^2/(2*g)\nt_subida = 15/g\nt_total = 2*15/g\ndTotal=sqrt(x1^2+y1^2)\nangulo = 2*t`,
    ic: {
      x1: 0, y1: 0, vx1: 10, vy1: 15,
      x2: 0, y2: 0, vx2: 14, vy2: 10,
      x3: 0, y3: 0, vx3: 7, vy3: 18,
    }, dt: 0.01, tmax: 3.7,
    objects: [
      { type: 'label', x: -20.2, y: 13, text: 'Bem-Vindo(a) ao BoscoLab', fontSize: 24, color: '#05a500' },
      { type: 'label', x: -20.2, y: 11.0, text: 'Lançamentos oblíquos', fontSize: 18, color: '#16f8ed' },
      { type: 'label', x: -20.2, y: 10, text: 'Projétil A: x = {x1:2} m,  y = {y1:2} m, |v| = {v1:2} m/s', fontSize: 14, color: '#fc05e7' },
      { type: 'label', x: -20.2, y: 9, text: 'Projétil B:  x = {x2:2} m,  y = {y2:2} m, |v| = {v2:2} m/s', fontSize: 14, color: '#15ff00' },
      { type: 'label', x: -20.2, y: 8, text: 'Projétil C:  x = {x3:2} m,  y = {y3:2} m, |v| = {v3:2} m/s', fontSize: 14, color: '#fbbf24' },
      { type: 'label', x: -20.2, y: 7, text: 'Altura máx. de A: ({x_apice:2}, {y_apice:2}) m', fontSize: 14, color: '#fc05e7' },
      { type: 'label', x: -20.2, y: 5, text: 'tempo de subida={t_subida:2} s,   tempo total={t_total:2} s', fontSize: 14, color: '#93c5fd' },
      { type: 'label', x: -20.2, y: 4, text: 'tempo atual={t:2} s', fontSize: 14, color: '#93c5fd' },

      { type: 'video', url: 'https://vimeo.com/97682476', embedUrl: 'https://player.vimeo.com/video/97682476', x: -10.5, y: -7.5, w: 17, h: 12, allowFullscreen: true },
      
      { type: 'particle', x: 'x2', y: 'y2', color: '#38bdf8', trailColor: '#67e8f9', 
        showTrail: true, trailMode: 'persist', trailLen: 180, 
        showVec: true, showVecProj: false, vx: 'vx2', vy: 'vy2', vecScale: 0.24, 
        vecColor: '#0ea5e9', radius: 7, label: 'B' },
      
      { type: 'particle', x: 'x3', y: 'y3', color: '#fbbf24', trailColor: '#fde68a', 
        showTrail: true, trailMode: 'persist', trailLen: 220, 
        showVec: true, showVecProj: false, vx: 'vx3', vy: 'vy3', vecScale: 0.24, 
        vecColor: '#f59e0b', radius: 7, label: 'C' },
      
      { type: 'vector', x: '0', y: '0', vx: 'x1', vy: 'y1', color: '#22c55e', 
        scale: 1, showProj: true, projColor: '#86efac', vecLabel: 'Velocidade', 
        magLabel: 'Distância até a Origem = {dTotal:1} m', projXLabel: 'xA = {x1:1}', projYLabel: 'yA = {y1:1}' },        
      
      { type: 'circle', x: 'x_apice', y: 'y_apice', r: '0.18', color: '#fbbf24', fillColor: 'rgba(251,191,36,.18)' },
      { type: 'label', x: 'x_apice + 0.25', y: 'y_apice + 0.4', text: 'Altura máx. de A ({x_apice:2}, {y_apice:2}) m', fontSize: 11, color: '#fbbf24' },

      { type: 'particle', x: 'x1', y: 'y1', color: '#fc0808', trailColor: '#b60000', 
        showTrail: true, trailMode: 'dots', trailLen: 800, 
        showVec: true, showVecProj: true, 
        rotation: 'angulo',
        vx: 'vx1', vy: 'vy1', vecScale: 1, 
        vecColor: '#34d399', projColor: '#7dd3fc', vecLabel: 'vA', 
        projXLabel: 'vx1 = {vx1:1} m/s', projYLabel: 'vy1 = {vy1:1} m/s', 
        magLabel: 'Velocidade de A = {v1:1} m/s', radius: 18, useImage: true, 
        imageData: 'data:image/png;base64,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', label: 'A' },

    ],
    g0: { xvar: 't', yvar: 'y1', yvar2: 'y2' }, g1: { xvar: 't', yvar: 'y3', yvar2: 'v1' }, scale: 18, ox: .08, oy: .7
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
    ic: { vc: 0 }, dt: 0.001, tmax: 8.0,
    objects: [
      { type: 'particle', x: 't', y: 'vc', color: '#4f9eff', showTrail: true, trailLen: 2500, radius: 9, showVec: true, vy: 'i', vx: '0', vecScale: 0.3, vecColor: '#34d399', label: 'Carregamento' },
      { type: 'label', x: 1.1, y: 5.0, text: '═══════════════════════════════════', fontSize: 12, color: '#475569' },
      { type: 'label', x: 1.1, y: 3.1, text: 'CARREGAMENTO DE CAPACITOR RC', fontSize: 14, color: '#f0f9ff' },
      { type: 'label', x: 1.1, y: 2.8, text: 'TENSÃO DO CAPACITOR', fontSize: 11, color: '#94a3b8' },
      { type: 'label', x: 1.1, y: 2.5, text: 'Vc = {vc:5} V  |  {percent_charge:0}% carregado', fontSize: 12, color: '#4f9eff' },
      { type: 'label', x: 1.1, y: 2.2, text: 'CORRENTE (decaimento exponencial)', fontSize: 11, color: '#94a3b8' },
      { type: 'label', x: 1.1, y: 1.9, text: 'i = {i:8} A', fontSize: 12, color: '#34d399' },
      { type: 'label', x: 1.1, y: 1.6, text: 'DIFERENÇAS DE POTENCIAIS (DDPs)', fontSize: 11, color: '#94a3b8' },
      { type: 'label', x: 1.1, y: 1.3, text: 'Vs = {Vs:3} V  |  Vr = {vr:5} V  (Vc + Vr = Vs)', fontSize: 11, color: '#fbbf24' },
      { type: 'label', x: 1.1, y: 1.0, text: 'PARÂMETROS & ENERGIA', fontSize: 11, color: '#94a3b8' },
      { type: 'label', x: 1.1, y: 0.7, text: 'τ = {tau:4} s  |  E = {e_cap:8} J', fontSize: 11, color: '#a78bfa' },
      { type: 'label', x: 1.1, y: 0.4, text: '📌 Em ~5τ: 99% carregado. Após 5 segundos.', fontSize: 10, color: '#22d3ee' },
    ],
    g0: { xvar: 't', yvar: 'vc', yvar2: 'vr' }, 
    g1: { xvar: 't', yvar: 'i' }, 
    scale: 60, ox: .08, oy: .15
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
    model: `// Sistema Planetario Otimizado\nGM = 39.478\n\nrm = sqrt(xm^2 + ym^2)\naxm = -GM*xm/rm^3\naym = -GM*ym/rm^3\nxm(t+dt) = xm(t) + vxm*dt\nym(t+dt) = ym(t) + vym*dt\nvxm(t+dt) = vxm(t) + axm*dt\nvym(t+dt) = vym(t) + aym*dt\n\nrv = sqrt(xv^2 + yv^2)\naxv = -GM*xv/rv^3\nayv = -GM*yv/rv^3\nxv(t+dt) = xv(t) + vxv*dt\nyv(t+dt) = yv(t) + vyv*dt\nvxv(t+dt) = vxv(t) + axv*dt\nvyv(t+dt) = vyv(t) + ayv*dt\n\nrt = sqrt(xt^2 + yt^2)\naxt = -GM*xt/rt^3\nayt = -GM*yt/rt^3\nxt(t+dt) = xt(t) + vxt*dt\nyt(t+dt) = yt(t) + vyt*dt\nvxt(t+dt) = vxt(t) + axt*dt\nvyt(t+dt) = vyt(t) + ayt*dt\n\nrma = sqrt(xma^2 + yma^2)\naxma = -GM*xma/rma^3\nayma = -GM*yma/rma^3\nxma(t+dt) = xma(t) + vxma*dt\nyma(t+dt) = yma(t) + vyma*dt\nvxma(t+dt) = vxma(t) + axma*dt\nvyma(t+dt) = vyma(t) + ayma*dt\n\nrj = sqrt(xj^2 + yj^2)\naxj = -GM*xj/rj^3\nayj = -GM*yj/rj^3\nxj(t+dt) = xj(t) + vxj*dt\nyj(t+dt) = yj(t) + vyj*dt\nvxj(t+dt) = vxj(t) + axj*dt\nvyj(t+dt) = vyj(t) + ayj*dt\n\nrs = sqrt(xs^2 + ys^2)\naxs = -GM*xs/rs^3\nays = -GM*ys/rs^3\nxs(t+dt) = xs(t) + vxs*dt\nys(t+dt) = ys(t) + vys*dt\nvxs(t+dt) = vxs(t) + axs*dt\nvys(t+dt) = vys(t) + ays*dt\n\nru = sqrt(xu^2 + yu^2)\naxu = -GM*xu/ru^3\nayu = -GM*yu/ru^3\nxu(t+dt) = xu(t) + vxu*dt\nyu(t+dt) = yu(t) + vyu*dt\nvxu(t+dt) = vxu(t) + axu*dt\nvyu(t+dt) = vyu(t) + ayu*dt\n\nrn = sqrt(xn^2 + yn^2)\naxn = -GM*xn/rn^3\nayn = -GM*yn/rn^3\nxn(t+dt) = xn(t) + vxn*dt\nyn(t+dt) = yn(t) + vyn*dt\nvxn(t+dt) = vxn(t) + axn*dt\nvyn(t+dt) = vyn(t) + ayn*dt`,
    ic: { xm: 0.39, ym: 0.03, vxm: -2.0, vym: 9.8, xv: 0.72, yv: 0.05, vxv: -1.5, vyv: 7.2, xt: 1.0, yt: 0.08, vxt: -0.5, vyt: 6.3, xma: 1.52, yma: 0.12, vxma: -1.2, vyma: 5.0, xj: 5.2, yj: 0.2, vxj: -0.8, vyj: 2.8, xs: 9.54, ys: 0.3, vxs: -0.5, vys: 2.0, xu: 19.2, yu: 0.5, vxu: -0.3, vyu: 1.4, xn: 30.1, yn: 0.8, vxn: -0.2, vyn: 1.1 },
    dt: 0.002, tmax: 37,
    objects: [
      { type: 'circle', x: '0', y: '0', r: '0.12', color: '#ffd700', fillColor: 'rgba(255,215,0,.35)' },
      { type: 'particle', x: 'xm', y: 'ym', color: '#b0c0d0', showTrail: true, trailLen: 550, radius: 3, label: 'Mercúrio' },
      { type: 'particle', x: 'xv', y: 'yv', color: '#e8cda0', showTrail: true, trailLen: 550, radius: 4, label: 'Vênus' },
      { type: 'particle', x: 'xt', y: 'yt', color: '#4f9eff', showTrail: true, trailLen: 550, radius: 4, label: 'Terra' },
      { type: 'particle', x: 'xma', y: 'yma', color: '#f97316', showTrail: true, trailLen: 500, radius: 4, label: 'Marte' },
      { type: 'particle', x: 'xj', y: 'yj', color: '#daa520', showTrail: true, trailLen: 420, radius: 6, label: 'Júpiter' },
      { type: 'particle', x: 'xs', y: 'ys', color: '#f4e4c1', showTrail: true, trailLen: 360, radius: 5, label: 'Saturno' },
      { type: 'particle', x: 'xu', y: 'yu', color: '#4fd0e7', showTrail: true, trailLen: 280, radius: 4, label: 'Urano' },
      { type: 'particle', x: 'xn', y: 'yn', color: '#4169e1', showTrail: true, trailLen: 220, radius: 4, label: 'Netuno' },
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
      { type: 'vectorfield', fxExpr: 'sin(y)*cos(x*0.5)', fyExpr: 'cos(x)*sin(y*0.5)', gridN: 18, gridRange: 6, arrowScale: 0.45, color: '#a78bfa' },
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
      { type: 'label', x: -4, y: 2.2, text: 'Ek = {Ek:3} J', fontSize: 13, color: '#fbbf24' },
      { type: 'label', x: -4, y: 1.2, text: 'Ep = {Ep:3} J', fontSize: 13, color: '#fbbf24' },
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
        vfMode: 'fieldlines', fieldSeeds: 14, fieldSteps: 400, fieldDs: 0.04, lineWidth: 1.2,
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
