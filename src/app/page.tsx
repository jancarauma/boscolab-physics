'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { initTheme } from '@/lib/theme';
import { BabyIcon, BookHeartIcon, TelescopeIcon } from 'lucide-react';
import { t, loadLocale, setLocale, onLocaleChange, type Locale } from '@/lib/i18n';
import { Howl } from 'howler';

type Slide = { src: string; alt: string; caption: string };

const LANGS: { locale: Locale; label: string }[] = [
  { locale: 'pt', label: 'Português' },
  { locale: 'en', label: 'English' },
  { locale: 'es', label: 'Español' },
  { locale: 'zh', label: '中文' },
];

const s = { display: 'block', borderRadius: '2px', flexShrink: 0 } as const;

function FlagIcon({ locale }: { locale: Locale }) {
  if (locale === 'pt') return (
    <svg viewBox="0 0 60 40" width="22" height="15" aria-hidden="true" style={s}>
      <rect width="60" height="40" fill="#009c3b"/>
      <polygon points="30,5 57,20 30,35 3,20" fill="#ffdf00"/>
      <circle cx="30" cy="20" r="10.5" fill="#002776"/>
      <path d="M20,22 A10.5,10.5 0 0,1 40,18" stroke="white" strokeWidth="1.6" fill="none"/>
    </svg>
  );
  if (locale === 'en') return (
    <svg viewBox="0 0 60 30" width="22" height="15" aria-hidden="true" style={s}>
      <rect width="60" height="30" fill="#012169"/>
      <path d="M0,0 L60,30 M0,30 L60,0" stroke="white" strokeWidth="8"/>
      <path d="M0,0 L60,30 M0,30 L60,0" stroke="#C8102E" strokeWidth="4.5"/>
      <rect x="0" y="11" width="60" height="8" fill="white"/>
      <rect x="26" y="0" width="8" height="30" fill="white"/>
      <rect x="0" y="12.5" width="60" height="5" fill="#C8102E"/>
      <rect x="27.5" y="0" width="5" height="30" fill="#C8102E"/>
    </svg>
  );
  if (locale === 'es') return (
    <svg viewBox="0 0 60 40" width="22" height="15" aria-hidden="true" style={s}>
      <rect width="60" height="40" fill="#c60b1e"/>
      <rect y="10" width="60" height="20" fill="#ffc400"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 60 40" width="22" height="15" aria-hidden="true" style={s}>
      <rect width="60" height="40" fill="#de2910"/>
      <polygon points="12,4 13.8,10 20,10 15,13.8 16.8,20 12,16.2 7.2,20 9,13.8 4,10 10.2,10" fill="#ffde00"/>
      <polygon points="22,2 22.8,4.5 25.4,4.5 23.3,5.9 24.1,8.4 22,6.9 19.9,8.4 20.7,5.9 18.6,4.5 21.2,4.5" fill="#ffde00"/>
      <polygon points="26,7 26.8,9.5 29.4,9.5 27.3,10.9 28.1,13.4 26,11.9 23.9,13.4 24.7,10.9 22.6,9.5 25.2,9.5" fill="#ffde00"/>
      <polygon points="26,14 26.8,16.5 29.4,16.5 27.3,17.9 28.1,20.4 26,18.9 23.9,20.4 24.7,17.9 22.6,16.5 25.2,16.5" fill="#ffde00"/>
      <polygon points="22,19 22.8,21.5 25.4,21.5 23.3,22.9 24.1,25.4 22,23.9 19.9,25.4 20.7,22.9 18.6,21.5 21.2,21.5" fill="#ffde00"/>
    </svg>
  );
}

function LangSelector({ locale, onChange }: { locale: Locale; onChange: (l: Locale) => void }) {
  return (
    <div className="lp-lang" role="group" aria-label="Select language">
      {LANGS.map(({ locale: l, label }) => (
        <button
          key={l}
          type="button"
          className={`lp-lang-btn${locale === l ? ' active' : ''}`}
          onClick={() => onChange(l)}
          title={label}
          aria-pressed={locale === l}
        >
          <FlagIcon locale={l} />
        </button>
      ))}
    </div>
  );
}

function Carousel({ title, slides, interval = 5000 }: { title: string; slides: Slide[]; interval?: number }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => setIdx(p => (p + 1) % slides.length), interval);
    return () => window.clearInterval(id);
  }, [interval, slides.length]);

  const go = useCallback((delta: number) => {
    setIdx(p => ((p + delta) % slides.length + slides.length) % slides.length);
  }, [slides.length]);

  if (!slides.length) return null;

  return (
    <div className="lp-carousel">
      <div className="lp-carousel-stage">
        {slides.map((s, i) => (
          <figure key={i} className={`lp-slide${i === idx ? ' active' : ''}`} aria-hidden={i !== idx}>
            <img src={s.src} alt={s.alt} loading={i === 0 ? 'eager' : 'lazy'} />
            <figcaption>{s.caption}</figcaption>
          </figure>
        ))}
        <button className="lp-carr-btn lp-carr-prev" onClick={() => go(-1)} aria-label="Anterior">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button className="lp-carr-btn lp-carr-next" onClick={() => go(1)} aria-label="Próximo">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <p className="lp-carousel-label">{title}</p>
      <div className="lp-dots">
        {slides.map((_, i) => (
          <button key={i} type="button" onClick={() => setIdx(i)} className={i === idx ? 'active' : ''} aria-label={`Slide ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}

function WaveText({ text }: { text: string }) {
  const [active, setActive] = useState(false);
  const on  = () => setActive(true);
  const off = () => setActive(false);
  return (
    <span
      className={`wave-text${active ? ' wave-active' : ''}`}
      onMouseEnter={on}
      onMouseLeave={off}
      onTouchStart={on}
      onTouchEnd={off}
      onTouchCancel={off}
    >
      {text.split('').map((ch, i) => (
        <span
          key={i}
          className="wave-char"
          style={{ animationDelay: `${i * 65}ms` }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </span>
  );
}

export default function Home() {
  const [locale, setLocaleState] = useState<Locale>('pt');
  const [playbackRate, setPlaybackRate] = useState(0.75);
  const [clickCount, setClickCount] = useState(0);
  const [isExploded, setIsExploded] = useState(false);
  const [explodedRate, setExplodedRate] = useState<number | null>(null);
  const solarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initTheme();
    setLocaleState(loadLocale());
    const unsub = onLocaleChange(l => setLocaleState(l));
    return unsub;
  }, []);

  const handleLang = (l: Locale) => {
    setLocale(l);
    handleClickLang();
  }

  const tr = t().lp;

  const labSlides = useMemo<Slide[]>(() => [
    { src: '/photos/image01.webp', alt: tr.lab1, caption: tr.lab1 },
    { src: '/photos/image02.webp', alt: tr.lab2, caption: tr.lab2 },
    { src: '/photos/image03.webp', alt: tr.lab3, caption: tr.lab3 },
    { src: '/photos/image04.webp', alt: tr.lab4, caption: tr.lab4 },
  ], [locale]); // eslint-disable-line react-hooks/exhaustive-deps

  const simSlides = useMemo<Slide[]>(() => [
    { src: '/photos/sim01.webp', alt: tr.sim1, caption: tr.sim1 },
    { src: '/photos/sim02.webp', alt: tr.sim2, caption: tr.sim2 },
    { src: '/photos/sim03.webp', alt: tr.sim3, caption: tr.sim3 },
    { src: '/photos/sim04.webp', alt: tr.sim4, caption: tr.sim4 },
  ], [locale]); // eslint-disable-line react-hooks/exhaustive-deps

  const heartClickSound = useMemo(() => new Howl({
    src: ["/songs/glug-a.mp3"],
    volume: 0.5,
  }), []);

  const squishClickSound = useMemo(() => new Howl({
    src: ["/songs/squish.mp3"],
    volume: 0.5,
  }), []);

  const langClickSound = new Howl({
    src: ["/songs/pop-down.mp3"],
    rate: 0.75,
    volume: 0.5,
  });

  useEffect(() => {
    return () => {
      heartClickSound.unload();
      squishClickSound.unload();
    };
  }, [heartClickSound, squishClickSound]);

  const handleClick = () => {
    const nextCount = clickCount + 1;
    const willExplode = nextCount >= 10;

    setClickCount(nextCount);

    if (willExplode) {
      const lockedRate = explodedRate ?? playbackRate;
      if (!isExploded) {
        setIsExploded(true);
        setExplodedRate(lockedRate);
      }
      squishClickSound.rate(lockedRate);
      squishClickSound.play();
      return;
    }

    const nextRate = playbackRate + 0.1;
    setPlaybackRate(nextRate);
    heartClickSound.rate(nextRate);
    heartClickSound.play();

    if (solarRef.current) {
      solarRef.current.classList.remove('shaking');
      void solarRef.current.offsetWidth;
      solarRef.current.classList.add('shaking');
      setTimeout(() => {
        solarRef.current?.classList.remove('shaking');
      }, 500);
    }
  }

  const handleClickLang = () => {
    langClickSound.play();
  }

  return (
    <main className="lp-root">

      {/* --- HERO ------- */}
      <section className="lp-hero">
        <div className="lp-hero-text">
          <div className="lp-badge-row">
            <p className="lp-badge">{tr.badge}</p>
            <LangSelector locale={locale} onChange={handleLang} />
          </div>
          <h1 className="lp-main-title" style={{ color: 'orange'}}>
            <em>Bosco</em>Lab®
          </h1>
          <h3 className="lp-subtitle">
            <WaveText text={tr.subtitle} />
          </h3>
          <p className="lp-tagline">{tr.tagline}</p>
          <div className="lp-hero-actions">
            <Link href="/sim" className="lp-btn-primary" style={{ color: 'white' }}>
              <div className="statusdot running" style={{ background: 'orange' }} />&nbsp;&nbsp;{tr.btnOpen}
            </Link>
            <a href="https://github.com/jancarauma/boscolab-physics" target="_blank" rel="noreferrer" className="lp-btn-ghost">
              {tr.btnGitHub}
            </a>
          </div>
        </div>

        <div className="lp-hero-anim" aria-hidden="true">
          <div className={`lp-solar${isExploded ? ' exploded' : ''}`} onClick={ handleClick } ref={solarRef}>
            <div className="lp-sun-glow" />
            <div className="lp-sun" />
            <div className="lp-ring lp-ring-1"><div className="lp-dot lp-dot-1" /></div>
            <div className="lp-ring lp-ring-2"><div className="lp-dot lp-dot-2" /></div>
            <div className="lp-ring lp-ring-3"><div className="lp-dot lp-dot-3" /></div>
          </div>
        </div>
      </section>

      {/* --- FEATURES ------- */}
      <section className="lp-features">
        <div className="lp-feature-card">
          <span className="lp-ficon lp-ficon--orange">
            <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <circle cx="24" cy="8" r="4" stroke="currentColor" strokeWidth="2.5" />
              <line x1="24" y1="12" x2="18" y2="40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="18" cy="40" r="5" fill="currentColor" opacity=".7" />
            </svg>
          </span>
          <strong>{tr.feat1Title}</strong>
          <p>{tr.feat1Desc}</p>
        </div>
        <div className="lp-feature-card">
          <span className="lp-ficon lp-ficon--teal">
            <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <rect x="8" y="15" width="32" height="4" rx="2" fill="currentColor" opacity=".3" />
              <circle cx="22" cy="17" r="6" stroke="currentColor" strokeWidth="2.5" />
              <rect x="8" y="30" width="32" height="4" rx="2" fill="currentColor" opacity=".3" />
              <circle cx="30" cy="32" r="6" stroke="currentColor" strokeWidth="2.5" />
            </svg>
          </span>
          <strong>{tr.feat2Title}</strong>
          <p>{tr.feat2Desc}</p>
        </div>
        <div className="lp-feature-card">
          <span className="lp-ficon lp-ficon--purple">
            <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <polyline points="8,38 18,24 26,30 36,14 40,18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="8" y="38" width="32" height="1.5" rx=".75" fill="currentColor" opacity=".5" />
              <rect x="8" y="10" width="1.5" height="28" rx=".75" fill="currentColor" opacity=".5" />
            </svg>
          </span>
          <strong>{tr.feat3Title}</strong>
          <p>{tr.feat3Desc}</p>
        </div>
      </section>

      {/* --- GALLERY ------- */}
      <section className="lp-gallery">
        <Carousel title={tr.gallerySim} slides={simSlides} interval={4200} />
        <Carousel title={tr.galleryLab} slides={labSlides} />
      </section>

      {/* --- WHO IS IT FOR ------- */}
      <section className="lp-for">
        <h2>{tr.forTitle}</h2>
        <div className="lp-for-grid">
          <div className="lp-for-card lp-for-card--a">
            <div className="lp-for-emoji"><BabyIcon /></div>
            <strong>{tr.for1Title}</strong>
            <p>{tr.for1Desc}</p>
          </div>
          <div className="lp-for-card lp-for-card--b">
            <div className="lp-for-emoji"><BookHeartIcon /></div>
            <strong>{tr.for2Title}</strong>
            <p>{tr.for2Desc}</p>
          </div>
          <div className="lp-for-card lp-for-card--c">
            <div className="lp-for-emoji"><TelescopeIcon /></div>
            <strong>{tr.for3Title}</strong>
            <p>{tr.for3Desc}</p>
          </div>
        </div>
      </section>

      <footer className="lp-footer" style={{ textAlign: 'center' }}>
        <p>BoscoLab Physics Simulations · {tr.footerProject}</p>
        <p>2026 © J. Caraumã. Todos os direitos reservados | <a href="https://carauma.com" target="_blank" rel="noreferrer">carauma.com</a></p>
        <p>Made in Roraima ❤</p>
      </footer>

    </main>
  );
}


