import { useEffect, useRef, useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTimeTheme } from '../../contexts/TimeThemeContext';

/* ─── Seeded random so SSR / re-render is stable ─── */
function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

/* ─── Confetti ─── */
const CONFETTI_COLORS = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff922b','#cc5de8','#f06595','#74c0fc'];

function Confetti({ burst = false }) {
  const pieces = useMemo(() => {
    const rand = seededRandom(burst ? 999 : 42);
    return Array.from({ length: burst ? 60 : 40 }, (_, i) => ({
      left: `${rand() * 100}%`,
      delay: `${rand() * (burst ? 0.3 : 1.2)}s`,
      size: rand() > 0.5 ? 9 : 6,
      shape: i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '0',
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      ratio: rand() > 0.5 ? 1.6 : 1,
    }));
  }, [burst]);

  return (
    <div className={`welcome-confetti${burst ? ' welcome-confetti--burst' : ''}`} aria-hidden="true">
      {pieces.map((p, i) => (
        <span key={i} style={{
          position: 'absolute', left: p.left, top: '-12px',
          width: p.size, height: p.size * p.ratio,
          background: p.color, borderRadius: p.shape,
          animation: `confetti-fall ${burst ? '0.9s' : '1.6s'} ease-in ${p.delay} both`,
        }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DAY SCENE — Meadow: sun, clouds, kite, kids, butterflies, flowers
   All SVG + CSS animation, no external deps
   ═══════════════════════════════════════════════════════ */
function DayScene() {
  return (
    <svg
      className="ws-scene ws-scene--day"
      viewBox="0 0 400 130"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Sky */}
      <defs>
        <linearGradient id="dg-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5ec8f0" />
          <stop offset="100%" stopColor="#a8e6f8" />
        </linearGradient>
        <linearGradient id="dg-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6dd46e" />
          <stop offset="100%" stopColor="#4ab84a" />
        </linearGradient>
        <radialGradient id="dg-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff176" />
          <stop offset="60%" stopColor="#ffd740" />
          <stop offset="100%" stopColor="#ffab00" />
        </radialGradient>
        <filter id="dg-glow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Background sky */}
      <rect width="400" height="130" fill="url(#dg-sky)" />

      {/* Sun with rays */}
      <g className="ws-sun">
        <circle cx="355" cy="24" r="14" fill="url(#dg-sun)" filter="url(#dg-glow)" />
        {[0,45,90,135,180,225,270,315].map((deg,i) => (
          <line key={i}
            x1={355 + Math.cos(deg*Math.PI/180)*17}
            y1={24  + Math.sin(deg*Math.PI/180)*17}
            x2={355 + Math.cos(deg*Math.PI/180)*22}
            y2={24  + Math.sin(deg*Math.PI/180)*22}
            stroke="#ffd740" strokeWidth="2" strokeLinecap="round"
          />
        ))}
      </g>

      {/* Cloud 1 */}
      <g className="ws-cloud ws-cloud--1">
        <ellipse cx="60" cy="28" rx="28" ry="13" fill="white" opacity="0.92"/>
        <ellipse cx="45" cy="32" rx="18" ry="10" fill="white" opacity="0.92"/>
        <ellipse cx="78" cy="33" rx="16" ry="9" fill="white" opacity="0.85"/>
      </g>

      {/* Cloud 2 */}
      <g className="ws-cloud ws-cloud--2">
        <ellipse cx="200" cy="20" rx="22" ry="10" fill="white" opacity="0.8"/>
        <ellipse cx="188" cy="24" rx="14" ry="8" fill="white" opacity="0.8"/>
        <ellipse cx="215" cy="24" rx="12" ry="7" fill="white" opacity="0.75"/>
      </g>

      {/* Kite + string */}
      <g className="ws-kite">
        {/* Diamond kite body */}
        <polygon points="130,10 142,22 130,34 118,22" fill="#e040fb" stroke="#ce25fa" strokeWidth="1"/>
        <polygon points="130,10 142,22 130,22 118,22" fill="#f06ffc" opacity="0.6"/>
        <line x1="130" y1="10" x2="130" y2="34" stroke="#b000e0" strokeWidth="0.8"/>
        <line x1="118" y1="22" x2="142" y2="22" stroke="#b000e0" strokeWidth="0.8"/>
        {/* Tail */}
        <path className="ws-kite-tail" d="M130,34 Q134,42 128,50 Q132,58 126,65" fill="none" stroke="#ff7043" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Bow ribbons on tail */}
        <ellipse cx="128" cy="50" rx="4" ry="2" fill="#ffd740" opacity="0.9"/>
        <ellipse cx="126" cy="65" rx="4" ry="2" fill="#6bcb77" opacity="0.9"/>
        {/* Kite string to boy */}
        <path className="ws-kite-string" d="M130,34 Q160,60 170,82" fill="none" stroke="#795548" strokeWidth="0.9" strokeDasharray="2,2"/>
      </g>

      {/* Grass base */}
      <rect x="0" y="100" width="400" height="30" fill="url(#dg-grass)" />

      {/* Grass blades (swaying) */}
      {[10,25,40,60,80,100,120,145,165,185,215,240,260,285,305,330,355,375,390].map((x, i) => (
        <g key={i} className={`ws-grass ws-grass--${(i % 3) + 1}`}>
          <line x1={x} y1="100" x2={x - 3} y2="90" stroke="#388e3c" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1={x+4} y1="100" x2={x+6} y2="89" stroke="#4caf50" strokeWidth="1.5" strokeLinecap="round"/>
        </g>
      ))}

      {/* Flowers */}
      {[[50,100],[150,100],[250,100],[320,100],[380,100]].map(([x,y],i) => (
        <g key={i} className={`ws-flower ws-flower--${(i%2)+1}`}>
          <circle cx={x} cy={y-6} r="4" fill={['#ff7043','#ffd740','#f06595','#ff7043','#6bcb77'][i]} opacity="0.9"/>
          <circle cx={x} cy={y-6} r="2" fill="#fff9c4"/>
          <line x1={x} y1={y-2} x2={x} y2={y+2} stroke="#388e3c" strokeWidth="1.5"/>
        </g>
      ))}

      {/* Butterflies */}
      <g className="ws-butterfly ws-butterfly--1">
        <ellipse cx="80" cy="58" rx="7" ry="4" fill="#ff7043" opacity="0.85" transform="rotate(-20,80,58)"/>
        <ellipse cx="94" cy="60" rx="7" ry="4" fill="#ff8a65" opacity="0.85" transform="rotate(20,94,60)"/>
        <line x1="87" y1="57" x2="87" y2="63" stroke="#5d4037" strokeWidth="0.9"/>
      </g>
      <g className="ws-butterfly ws-butterfly--2">
        <ellipse cx="295" cy="50" rx="6" ry="3.5" fill="#4d96ff" opacity="0.85" transform="rotate(-25,295,50)"/>
        <ellipse cx="307" cy="52" rx="6" ry="3.5" fill="#74c0fc" opacity="0.85" transform="rotate(25,307,52)"/>
        <line x1="301" y1="49" x2="301" y2="55" stroke="#1565c0" strokeWidth="0.9"/>
      </g>
      <g className="ws-butterfly ws-butterfly--3">
        <ellipse cx="220" cy="45" rx="5" ry="3" fill="#cc5de8" opacity="0.8" transform="rotate(-15,220,45)"/>
        <ellipse cx="230" cy="47" rx="5" ry="3" fill="#e599f7" opacity="0.8" transform="rotate(15,230,47)"/>
        <line x1="225" y1="44" x2="225" y2="50" stroke="#6a1b9a" strokeWidth="0.8"/>
      </g>

      {/* Boy (running, holding kite string) */}
      <g className="ws-boy">
        {/* Body */}
        <circle cx="172" cy="83" r="5.5" fill="#ffcc80"/>
        <rect x="168" y="88" width="8" height="10" rx="2" fill="#1565c0"/>
        {/* Legs running */}
        <g className="ws-boy-legs">
          <line x1="170" y1="98" x2="166" y2="108" stroke="#1565c0" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="176" y1="98" x2="180" y2="108" stroke="#1565c0" strokeWidth="2.5" strokeLinecap="round"/>
        </g>
        {/* Arm holding string */}
        <line x1="172" y1="90" x2="164" y2="83" stroke="#ffcc80" strokeWidth="2" strokeLinecap="round"/>
        {/* Hair */}
        <path d="M167,80 Q172,76 177,80" fill="#5d4037" stroke="none"/>
      </g>

      {/* Girl (running, arms out) */}
      <g className="ws-girl">
        {/* Body */}
        <circle cx="196" cy="83" r="5.5" fill="#ffccbc"/>
        {/* Dress */}
        <path d="M191,88 L193,100 L199,100 L201,88 Z" fill="#e91e63"/>
        <path d="M191,88 L186,100 L199,100 Z" fill="#f06292" opacity="0.7"/>
        {/* Legs */}
        <g className="ws-girl-legs">
          <line x1="193" y1="100" x2="190" y2="110" stroke="#ffccbc" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="199" y1="100" x2="202" y2="110" stroke="#ffccbc" strokeWidth="2.5" strokeLinecap="round"/>
        </g>
        {/* Arms out */}
        <line x1="196" y1="91" x2="188" y2="87" stroke="#ffccbc" strokeWidth="2" strokeLinecap="round"/>
        <line x1="196" y1="91" x2="204" y2="87" stroke="#ffccbc" strokeWidth="2" strokeLinecap="round"/>
        {/* Hair pigtails */}
        <path d="M191,80 Q196,76 201,80" fill="#4e342e" stroke="none"/>
        <circle cx="191" cy="80" r="2" fill="#f06595"/>
        <circle cx="201" cy="80" r="2" fill="#f06595"/>
      </g>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   NIGHT SCENE — Evening: moon, stars, kids, fireflies, grass
   ═══════════════════════════════════════════════════════ */
function NightScene() {
  /* stable firefly positions */
  const fireflies = useMemo(() => {
    const rand = seededRandom(77);
    return Array.from({ length: 10 }, (_, i) => ({
      cx: 30 + rand() * 340,
      cy: 30 + rand() * 70,
      delay: `${rand() * 3}s`,
      dur: `${1.6 + rand() * 1.8}s`,
      dx: (rand() - 0.5) * 30,
      dy: (rand() - 0.5) * 20,
    }));
  }, []);

  const stars = useMemo(() => {
    const rand = seededRandom(13);
    return Array.from({ length: 28 }, (_, i) => ({
      cx: rand() * 400,
      cy: rand() * 70,
      r: 0.8 + rand() * 1.4,
      delay: `${rand() * 4}s`,
      dur: `${1.5 + rand() * 2}s`,
    }));
  }, []);

  return (
    <svg
      className="ws-scene ws-scene--night"
      viewBox="0 0 400 130"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="ng-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#060d1f" />
          <stop offset="100%" stopColor="#0d1e3a" />
        </linearGradient>
        <linearGradient id="ng-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b4332" />
          <stop offset="100%" stopColor="#0f2d1e" />
        </linearGradient>
        <radialGradient id="ng-moon" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#fffde7" />
          <stop offset="50%" stopColor="#fff9c4" />
          <stop offset="100%" stopColor="#f0e68c" />
        </radialGradient>
        <radialGradient id="ng-firefly" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f9ff72" stopOpacity="1"/>
          <stop offset="100%" stopColor="#aaff44" stopOpacity="0"/>
        </radialGradient>
        <filter id="ng-moonGlow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="ng-ffGlow">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Night sky */}
      <rect width="400" height="130" fill="url(#ng-sky)" />

      {/* Stars */}
      {stars.map((s, i) => (
        <circle key={i} className="ws-star" cx={s.cx} cy={s.cy} r={s.r}
          fill="white" opacity="0.85"
          style={{ animationDelay: s.delay, animationDuration: s.dur }}
        />
      ))}

      {/* Moon */}
      <g className="ws-moon" filter="url(#ng-moonGlow)">
        <circle cx="340" cy="26" r="18" fill="url(#ng-moon)" />
        {/* Crescent shadow for realism */}
        <circle cx="347" cy="22" r="15" fill="#0d1e3a" opacity="0.45"/>
        {/* Subtle crater marks */}
        <circle cx="333" cy="24" r="2.5" fill="#e8d96e" opacity="0.3"/>
        <circle cx="340" cy="31" r="1.5" fill="#e8d96e" opacity="0.25"/>
      </g>

      {/* Grass */}
      <rect x="0" y="100" width="400" height="30" fill="url(#ng-grass)" />

      {/* Grass blades night */}
      {[10,28,48,70,95,120,148,170,195,225,252,275,300,325,352,375,390].map((x, i) => (
        <g key={i} className={`ws-grass ws-grass--${(i % 3) + 1}`}>
          <line x1={x} y1="100" x2={x-3} y2="90" stroke="#2d6a4f" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1={x+4} y1="100" x2={x+7} y2="89" stroke="#1b4332" strokeWidth="1.5" strokeLinecap="round"/>
        </g>
      ))}

      {/* Fireflies */}
      {fireflies.map((f, i) => (
        <g key={i} className="ws-firefly"
          style={{ animationDelay: f.delay, animationDuration: f.dur,
            '--ff-dx': `${f.dx}px`, '--ff-dy': `${f.dy}px` }}
        >
          <circle cx={f.cx} cy={f.cy} r="5" fill="url(#ng-firefly)" filter="url(#ng-ffGlow)" opacity="0.9"/>
          <circle cx={f.cx} cy={f.cy} r="2" fill="#f9ff72"/>
        </g>
      ))}

      {/* Boy silhouette — arms up reaching for firefly */}
      <g className="ws-night-boy">
        <circle cx="155" cy="84" r="6" fill="#2d3748"/>
        <rect x="151" y="90" width="8" height="10" rx="2" fill="#1a202c"/>
        {/* Arm up left */}
        <line x1="155" y1="92" x2="148" y2="83" stroke="#2d3748" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Arm normal right */}
        <line x1="155" y1="92" x2="162" y2="96" stroke="#2d3748" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Legs */}
        <line x1="153" y1="100" x2="151" y2="110" stroke="#1a202c" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="157" y1="100" x2="159" y2="110" stroke="#1a202c" strokeWidth="2.5" strokeLinecap="round"/>
      </g>

      {/* Girl silhouette — holding jar */}
      <g className="ws-night-girl">
        <circle cx="200" cy="84" r="6" fill="#2d3748"/>
        {/* Dress */}
        <path d="M195,90 L197,102 L203,102 L205,90 Z" fill="#1a202c"/>
        {/* Jar in hand */}
        <rect x="203" y="90" width="7" height="9" rx="2" fill="#4a5568" opacity="0.8"/>
        <rect x="204" y="89" width="5" height="2" rx="1" fill="#718096"/>
        {/* Glowing firefly in jar */}
        <circle cx="207" cy="95" r="2.5" fill="#f9ff72" opacity="0.8" style={{ animation: 'ws-ff-pulse 1.4s ease-in-out infinite' }}/>
        {/* Arms */}
        <line x1="200" y1="92" x2="205" y2="90" stroke="#2d3748" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="200" y1="92" x2="193" y2="96" stroke="#2d3748" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Legs */}
        <line x1="197" y1="102" x2="195" y2="112" stroke="#1a202c" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="203" y1="102" x2="205" y2="112" stroke="#1a202c" strokeWidth="2.5" strokeLinecap="round"/>
      </g>

      {/* Soft ground glow from fireflies */}
      <ellipse cx="200" cy="102" rx="80" ry="6" fill="#aaff44" opacity="0.04"/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function WelcomePopup() {
  const { user, showWelcome, dismissWelcome } = useAuth();
  const { theme } = useTimeTheme();
  const dialogRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [copyBurst, setCopyBurst] = useState(false);

  useEffect(() => {
    if (showWelcome && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [showWelcome]);

  if (!showWelcome) return null;

  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const isNight = theme === 'night';

  const handleCopy = () => {
    navigator.clipboard.writeText('WELCOME10').catch(() => {});
    setCopied(true);
    setCopyBurst(true);
    setTimeout(() => setCopyBurst(false), 900);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="welcome-backdrop" onClick={dismissWelcome}>
      <div
        className="welcome-popup"
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to Bunkins"
        ref={dialogRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
      >
        {/* Entry confetti */}
        <Confetti />
        {/* Copy-code confetti burst */}
        {copyBurst && <Confetti burst />}

        <button className="welcome-close" onClick={dismissWelcome} aria-label="Close">
          <X size={16} />
        </button>

        {/* ── Animated scene banner ── */}
        <div className="ws-banner" aria-hidden="true">
          {isNight ? <NightScene /> : <DayScene />}
        </div>

        {/* ── Text ── */}
        <div className="ws-body">
          <p className="ws-eyebrow">🎉 You're in!</p>
          <h2 className="ws-title">Welcome to the Bunkins Family!</h2>
          <p className="ws-subtitle">Hi {firstName}, here's a little gift to get you started ✨</p>

          {/* ── Coupon card ── */}
          <div className="ws-coupon">
            <span className="ws-coupon-label">Your exclusive first-order discount</span>
            <div className="ws-coupon-row">
              <span className="ws-coupon-code">WELCOME10</span>
              <button
                className={`ws-copy-btn${copied ? ' ws-copy-btn--copied' : ''}`}
                onClick={handleCopy}
                aria-label="Copy coupon code"
              >
                {copied ? '✓ Copied!' : 'Copy Code'}
              </button>
            </div>
            <p className="ws-coupon-desc">10% off your entire first order</p>
          </div>

          {/* ── CTA ── */}
          <button className="ws-cta" onClick={dismissWelcome}>
            Start Shopping 🛍️
          </button>
        </div>
      </div>
    </div>
  );
}
