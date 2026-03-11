export const EXAMPLES: Record<string, any> = {
  queda: {
    model: `// Queda Livre\ng = 9.8\n\ny(t+dt) = y(t) + vy*dt\nvy(t+dt) = vy(t) - g*dt`,
    ic: { y: 50, vy: 0 }, dt: 0.01, tmax: 4,
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
    objects: [{ type: 'particle', x: 'x', y: 'y', color: '#fb7185', showTrail: true, showVec: false, radius: 8 }],
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
    model: `// Órbita Kepleriana (elíptica)\nG = 1.0\nM = 1.0\n\nr = sqrt(x^2 + y^2)\nax = -G*M*x/r^3\nay = -G*M*y/r^3\n\nx(t+dt) = x(t) + vx*dt\ny(t+dt) = y(t) + vy*dt\nvx(t+dt) = vx(t) + ax*dt\nvy(t+dt) = vy(t) + ay*dt`,
    ic: { x: 1, y: 0, vx: 0, vy: 0.7 }, dt: 0.005, tmax: 30,
    objects: [
      { type: 'circle', x: '0', y: '0', r: '0.08', color: '#fbbf24', fillColor: 'rgba(251,191,36,.25)' },
      { type: 'particle', x: 'x', y: 'y', color: '#4f9eff', showTrail: true, trailLen: 600, showVec: false, radius: 6 },
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
    model: `// Circuito RC\nR = 1000\nC = 0.001\nVs = 5.0\ntau = R*C\n\nvc(t+dt) = vc(t) + ((Vs - vc)/(R*C))*dt\n\ni = (Vs - vc)/R\nvr = Vs - vc\ne_cap = 0.5*C*vc^2`,
    ic: { vc: 0 }, dt: 0.00005, tmax: 0.008,
    objects: [
      { type: 'label', x: -5, y: 5.5, text: 'Circuito RC', fontSize: 16, color: '#94a3b8' },
      { type: 'label', x: -5, y: 4.2, text: 'Vc = {vc:3} V', fontSize: 14, color: '#4f9eff' },
      { type: 'label', x: -5, y: 3.0, text: 'Vr = {vr:3} V', fontSize: 14, color: '#a78bfa' },
      { type: 'label', x: -5, y: 1.8, text: 'i  = {i:6} A', fontSize: 14, color: '#34d399' },
      { type: 'label', x: -5, y: 0.6, text: 'E  = {e_cap:6} J', fontSize: 14, color: '#fbbf24' },
      { type: 'label', x: -5, y: -1.0, text: 'τ = R·C = {tau:4} s', fontSize: 13, color: '#fb7185' },
    ],
    g0: { xvar: 't', yvar: 'vc' }, g1: { xvar: 't', yvar: 'i' }, scale: 30, ox: .08, oy: .25
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
    model: `// Sistema Solar (simplificado)\nGM = 39.478\n\nrm = sqrt(xm^2 + ym^2)\naxm = -GM*xm/rm^3\naym = -GM*ym/rm^3\nxm(t+dt) = xm(t) + vxm*dt\nym(t+dt) = ym(t) + vym*dt\nvxm(t+dt) = vxm(t) + axm*dt\nvym(t+dt) = vym(t) + aym*dt\n\nrv = sqrt(xv^2 + yv^2)\naxv = -GM*xv/rv^3\nayv = -GM*yv/rv^3\nxv(t+dt) = xv(t) + vxv*dt\nyv(t+dt) = yv(t) + vyv*dt\nvxv(t+dt) = vxv(t) + axv*dt\nvyv(t+dt) = vyv(t) + ayv*dt\n\nrt = sqrt(xt^2 + yt^2)\naxt = -GM*xt/rt^3\nayt = -GM*yt/rt^3\nxt(t+dt) = xt(t) + vxt*dt\nyt(t+dt) = yt(t) + vyt*dt\nvxt(t+dt) = vxt(t) + axt*dt\nvyt(t+dt) = vyt(t) + ayt*dt\n\nrma = sqrt(xma^2 + yma^2)\naxma = -GM*xma/rma^3\nayma = -GM*yma/rma^3\nxma(t+dt) = xma(t) + vxma*dt\nyma(t+dt) = yma(t) + vyma*dt\nvxma(t+dt) = vxma(t) + axma*dt\nvyma(t+dt) = vyma(t) + ayma*dt`,
    ic: { xm: 0.387, ym: 0, vxm: 0, vym: 10.06, xv: 0.723, yv: 0, vxv: 0, vyv: 7.38, xt: 1, yt: 0, vxt: 0, vyt: 6.283, xma: 1.524, yma: 0, vxma: 0, vyma: 5.09 },
    dt: 0.0005, tmax: 3,
    objects: [
      { type: 'circle', x: '0', y: '0', r: '0.12', color: '#ffd700', fillColor: 'rgba(255,215,0,.35)' },
      { type: 'particle', x: 'xm', y: 'ym', color: '#b0c0d0', showTrail: true, trailLen: 800, radius: 4, label: 'Mercúrio' },
      { type: 'particle', x: 'xv', y: 'yv', color: '#e8cda0', showTrail: true, trailLen: 800, radius: 5, label: 'Vênus' },
      { type: 'particle', x: 'xt', y: 'yt', color: '#4f9eff', showTrail: true, trailLen: 600, radius: 5, label: 'Terra' },
      { type: 'particle', x: 'xma', y: 'yma', color: '#f97316', showTrail: true, trailLen: 600, radius: 5, label: 'Marte' },
    ],
    g0: { xvar: 'xt', yvar: 'yt' }, g1: { xvar: 't', yvar: 'rt' }, scale: 100, ox: .5, oy: .5
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
    ic: { yt: 20, vyt: 0, yl: 20, vyl: 0 }, dt: 0.01, tmax: 5,
    objects: [
      { type: 'particle', x: '-1', y: 'yt', color: '#4f9eff', showTrail: true, trailLen: 300, radius: 9, showVec: false, label: 'Terra' },
      { type: 'particle', x: '1', y: 'yl', color: '#fbbf24', showTrail: true, trailLen: 300, radius: 9, showVec: false, label: 'Lua' },
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
