import React from 'react';
import { motion } from 'framer-motion';
import { useTimeTheme } from '../../contexts/TimeThemeContext';

/* =========================================================
   TIME-BASED LANDSCAPE WITH PARALLAX TREADMILL
   Day:   Kite Runners — ground scrolls, kids run in place
   Night: Firefly Catchers — calm moonlit parallax
   "Main Thehra Raha" — viewer stationary, world moves
   ========================================================= */

const STARS = Array.from({ length: 50 }, (_, i) => ({
  x: `${((i * 17 + 5) % 93) + 1}%`,
  y: `${((i * 13 + 3) % 48) + 1}%`,
  size: 1 + (i % 3),
  delay: (i * 0.13) % 5,
  dur: 2 + (i % 4),
}));

// ═══════════════════════════════════════════
// SCROLLING PARALLAX LAYER
// Duplicates children for seamless horizontal loop
// ═══════════════════════════════════════════
function ScrollingLayer({ duration, zIndex, height, children }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0,
      width: '100%', height, overflow: 'hidden', zIndex,
    }}>
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
        style={{ display: 'flex', width: '200%', height: '100%' }}
      >
        <div style={{ width: '50%', height: '100%', flexShrink: 0, position: 'relative' }}>
          {children}
        </div>
        <div style={{ width: '50%', height: '100%', flexShrink: 0, position: 'relative' }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════
// TREES
// ═══════════════════════════════════════════
function RoundTree({ left, bottom, height, color1, color2, trunkColor }) {
  const w = height * 0.7;
  return (
    <div style={{
      position: 'absolute', bottom, left,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <svg width={w} height={height * 0.7} viewBox="0 0 70 55">
        <ellipse cx="35" cy="22" rx="30" ry="20" fill={color1} />
        <ellipse cx="18" cy="30" rx="18" ry="14" fill={color2} opacity="0.7" />
        <ellipse cx="52" cy="30" rx="18" ry="14" fill={color2} opacity="0.7" />
        <ellipse cx="35" cy="15" rx="20" ry="14" fill={color1} opacity="0.85" />
        <ellipse cx="28" cy="24" rx="10" ry="7" fill="rgba(255,255,255,0.08)" />
      </svg>
      <div style={{
        width: height * 0.08, height: height * 0.28,
        background: `linear-gradient(180deg, ${trunkColor}, #4a3220)`,
        borderRadius: 3, marginTop: -4,
      }} />
    </div>
  );
}

function TreeSilhouette({ left, bottom, height, color }) {
  return (
    <div style={{ position: 'absolute', bottom, left }}>
      <svg width={height * 0.5} height={height} viewBox="0 0 40 80">
        <ellipse cx="20" cy="20" rx="18" ry="18" fill={color} />
        <ellipse cx="12" cy="30" rx="12" ry="10" fill={color} opacity="0.9" />
        <ellipse cx="28" cy="30" rx="12" ry="10" fill={color} opacity="0.9" />
        <rect x="18" y="38" width="4" height="42" fill={color} />
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════
// CLOUD
// ═══════════════════════════════════════════
function Cloud({ top, delay, duration, size, opacity, direction = 'ltr', fill = '#fff' }) {
  const fromX = direction === 'rtl' ? '115vw' : '-15vw';
  const toX = direction === 'rtl' ? '-15vw' : '115vw';
  return (
    <motion.svg
      initial={{ x: fromX }}
      animate={{ x: toX }}
      transition={{ duration, repeat: Infinity, ease: 'linear', delay }}
      style={{ position: 'absolute', top, width: size, zIndex: 2, opacity }}
      viewBox="0 0 220 80" fill={fill}
    >
      <ellipse cx="65" cy="50" rx="50" ry="24" opacity="0.9" />
      <ellipse cx="110" cy="35" rx="48" ry="30" />
      <ellipse cx="155" cy="50" rx="50" ry="24" opacity="0.9" />
      <ellipse cx="110" cy="25" rx="32" ry="20" opacity="0.95" />
    </motion.svg>
  );
}

// ═══════════════════════════════════════════
// BIRD
// ═══════════════════════════════════════════
function Bird({ top, delay, duration, size, reverse, stroke = '#4a5568' }) {
  return (
    <motion.svg
      initial={{ x: reverse ? '110vw' : '-5vw' }}
      animate={{ x: reverse ? '-5vw' : '110vw' }}
      transition={{ duration, repeat: Infinity, ease: 'linear', delay }}
      style={{ position: 'absolute', top, width: size, zIndex: 3, transform: reverse ? 'scaleX(-1)' : 'none' }}
      viewBox="0 0 40 20" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round"
    >
      <motion.path
        d="M2,14 Q10,2 20,10 Q30,2 38,14"
        animate={{ d: ['M2,14 Q10,2 20,10 Q30,2 38,14', 'M2,10 Q10,8 20,12 Q30,8 38,10', 'M2,14 Q10,2 20,10 Q30,2 38,14'] }}
        transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.svg>
  );
}

// ═══════════════════════════════════════════
// KITE RUNNER KID (Day Scene)
// Grounded: feet always touch ground plane
// Physics: leaning into wind, arms grip string
// ═══════════════════════════════════════════
function KiteRunner({ x, bottom, skinTone, hairColor, shirtColor, pantsColor, hairStyle, holdingString, zIndex, delay = 0 }) {
  return (
    <motion.div
      animate={{ y: [0, -4, 0, -4, 0] }}
      transition={{ duration: 0.4, repeat: Infinity, ease: 'easeInOut', delay }}
      style={{ position: 'absolute', left: x, bottom, zIndex, width: 55, height: 92 }}
    >
      <svg viewBox="0 0 55 92" width="55" height="92">
        <g transform="rotate(-10 27.5 46)">
          <circle cx="27.5" cy="14" r="11" fill={skinTone} />

          {hairStyle === 'ponytail' && (
            <>
              <ellipse cx="27.5" cy="9" rx="11.5" ry="6.5" fill={hairColor} />
              <path d="M16,10 Q12,15 8,22 Q10,14 16,10" fill={hairColor} />
            </>
          )}
          {hairStyle === 'short' && (
            <ellipse cx="27.5" cy="9" rx="11.5" ry="7" fill={hairColor} />
          )}

          <ellipse cx="23" cy="14" rx="2.2" ry="2.8" fill="#fff" />
          <ellipse cx="32" cy="14" rx="2.2" ry="2.8" fill="#fff" />
          <circle cx="23.5" cy="14.5" r="1.6" fill="#2a1a0a" />
          <circle cx="32.5" cy="14.5" r="1.6" fill="#2a1a0a" />
          <circle cx="24" cy="13.5" r="0.5" fill="#fff" />
          <circle cx="33" cy="13.5" r="0.5" fill="#fff" />

          <path d="M22,18 Q27.5,22 33,18" fill="none" stroke="#c96a4a" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="18.5" cy="16.5" r="2.2" fill="#ffb4a2" opacity="0.45" />
          <circle cx="36.5" cy="16.5" r="2.2" fill="#ffb4a2" opacity="0.45" />

          <rect x="19" y="25" width="17" height="22" rx="5" fill={shirtColor} />

          {holdingString ? (
            <>
              <motion.line x1="36" y1="30" x2="46" y2="18" stroke={skinTone} strokeWidth="4" strokeLinecap="round"
                animate={{ y2: [18, 16, 18] }} transition={{ duration: 1, repeat: Infinity }} />
              <motion.circle cx="46" cy="18" r="2.5" fill={skinTone}
                animate={{ cy: [18, 16, 18] }} transition={{ duration: 1, repeat: Infinity }} />
              <motion.line x1="19" y1="32" x2="8" y2="40" stroke={skinTone} strokeWidth="4" strokeLinecap="round"
                animate={{ x2: [8, 5, 8], y2: [40, 35, 40] }} transition={{ duration: 0.4, repeat: Infinity }} />
            </>
          ) : (
            <>
              <motion.line x1="19" y1="32" x2="8" y2="40" stroke={skinTone} strokeWidth="4" strokeLinecap="round"
                animate={{ x2: [8, 5, 8], y2: [40, 35, 40] }} transition={{ duration: 0.4, repeat: Infinity }} />
              <motion.line x1="36" y1="32" x2="47" y2="40" stroke={skinTone} strokeWidth="4" strokeLinecap="round"
                animate={{ x2: [47, 50, 47], y2: [40, 35, 40] }} transition={{ duration: 0.4, repeat: Infinity, delay: 0.2 }} />
            </>
          )}

          <rect x="19" y="45" width="17" height="13" rx="4" fill={pantsColor} />

          <motion.line x1="23" y1="58" x2="14" y2="78" stroke={skinTone} strokeWidth="4.5" strokeLinecap="round"
            animate={{ x2: [14, 34, 14] }} transition={{ duration: 0.35, repeat: Infinity }} />
          <motion.line x1="32" y1="58" x2="42" y2="78" stroke={skinTone} strokeWidth="4.5" strokeLinecap="round"
            animate={{ x2: [42, 22, 42] }} transition={{ duration: 0.35, repeat: Infinity }} />

          <motion.ellipse rx="5" ry="3" fill="#5a3e28"
            animate={{ cx: [14, 34, 14], cy: [80, 80, 80] }} transition={{ duration: 0.35, repeat: Infinity }} />
          <motion.ellipse rx="5" ry="3" fill="#5a3e28"
            animate={{ cx: [42, 22, 42], cy: [80, 80, 80] }} transition={{ duration: 0.35, repeat: Infinity }} />
        </g>

        <motion.circle fill="rgba(200,180,150,0.3)"
          animate={{ r: [0, 5, 0], cx: [12, 5, 12], cy: [84, 82, 84], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 0.35, repeat: Infinity }} />
        <motion.circle fill="rgba(200,180,150,0.2)"
          animate={{ r: [0, 4, 0], cx: [8, 2, 8], cy: [86, 84, 86], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 0.35, repeat: Infinity, delay: 0.15 }} />
      </svg>
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// KITE WITH TAUT STRING
// String visibly connects from kid's hand to kite
// ═══════════════════════════════════════════
function KiteWithString() {
  return (
    <div style={{ position: 'absolute', top: '3%', left: '38%', zIndex: 12, width: 130, height: 200 }}>
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <motion.path
          d="M60,180 Q45,130 50,70 Q52,40 62,15"
          fill="none" stroke="#8a6a3e" strokeWidth="1.5"
          animate={{
            d: [
              'M60,180 Q45,130 50,70 Q52,40 62,15',
              'M60,180 Q50,125 55,70 Q58,35 58,10',
              'M60,180 Q45,130 50,70 Q52,40 62,15',
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>

      <motion.svg
        style={{ position: 'absolute', top: 0, left: 35, width: 55, height: 60 }}
        viewBox="0 0 55 60"
        animate={{ y: [-4, 6, -4], rotate: [-8, 8, -8], x: [-4, 4, -4] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <polygon points="27.5,0 55,22 27.5,48 0,22" fill="#ff6b81" stroke="#d9506a" strokeWidth="0.8" />
        <line x1="27.5" y1="0" x2="27.5" y2="48" stroke="#d9506a" strokeWidth="0.6" opacity="0.5" />
        <line x1="0" y1="22" x2="55" y2="22" stroke="#d9506a" strokeWidth="0.6" opacity="0.5" />
        <polygon points="27.5,0 40,22 27.5,48" fill="#ff8fa3" opacity="0.4" />
        <motion.path d="M27.5,48 Q34,55 22,60" fill="none" stroke="#ffbe00" strokeWidth="2.5" strokeLinecap="round"
          animate={{ d: ['M27.5,48 Q34,55 22,60', 'M27.5,48 Q20,55 32,60', 'M27.5,48 Q34,55 22,60'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.path d="M27.5,48 Q20,53 32,58" fill="none" stroke="#55bde4" strokeWidth="2" strokeLinecap="round"
          animate={{ d: ['M27.5,48 Q20,53 32,58', 'M27.5,48 Q35,53 20,58', 'M27.5,48 Q20,53 32,58'] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }} />
      </motion.svg>
    </div>
  );
}

// ═══════════════════════════════════════════
// FIREFLY CATCHER KID (Night Scene)
// Grounded: standing or walking gently
// Interaction: holding jar, reaching for fireflies
// ═══════════════════════════════════════════
function FireflyCatcher({ x, bottom, skinTone, hairColor, shirtColor, pantsColor, hairStyle, reaching, zIndex }) {
  return (
    <motion.div
      animate={reaching ? { y: [0, -2, 0] } : { y: [0, -3, 0, -3, 0] }}
      transition={{ duration: reaching ? 2.5 : 0.55, repeat: Infinity, ease: 'easeInOut' }}
      style={{ position: 'absolute', left: x, bottom, zIndex, width: 55, height: 92 }}
    >
      <svg viewBox="0 0 55 92" width="55" height="92">
        <circle cx="27.5" cy="14" r="18" fill="rgba(255,240,100,0.06)" />

        <circle cx="27.5" cy="14" r="11" fill={skinTone} />

        {hairStyle === 'curly' && (
          <>
            <ellipse cx="27.5" cy="9" rx="12" ry="7" fill={hairColor} />
            <circle cx="17" cy="8" r="3.5" fill={hairColor} />
            <circle cx="38" cy="8" r="3.5" fill={hairColor} />
            <circle cx="27.5" cy="5" r="3" fill={hairColor} />
          </>
        )}
        {hairStyle === 'braids' && (
          <>
            <ellipse cx="27.5" cy="9" rx="11.5" ry="6" fill={hairColor} />
            <rect x="14" y="10" width="4" height="15" rx="2" fill={hairColor} />
            <rect x="37" y="10" width="4" height="15" rx="2" fill={hairColor} />
          </>
        )}

        <ellipse cx="22" cy="13" rx="2.2" ry="2.8" fill="#fff" />
        <ellipse cx="33" cy="13" rx="2.2" ry="2.8" fill="#fff" />
        <circle cx="22.3" cy="12" r="1.5" fill="#2a1a0a" />
        <circle cx="33.3" cy="12" r="1.5" fill="#2a1a0a" />
        <circle cx="22.6" cy="11.5" r="0.5" fill="#fff" />
        <circle cx="33.6" cy="11.5" r="0.5" fill="#fff" />

        <ellipse cx="27.5" cy="19" rx="2.2" ry="1.8" fill="#c96a4a" opacity="0.6" />
        <circle cx="18" cy="17" r="2.2" fill="#ffb4a2" opacity="0.4" />
        <circle cx="37" cy="17" r="2.2" fill="#ffb4a2" opacity="0.4" />

        <rect x="19" y="25" width="17" height="22" rx="5" fill={shirtColor} />

        {reaching ? (
          <>
            <motion.line x1="36" y1="28" x2="46" y2="8" stroke={skinTone} strokeWidth="4" strokeLinecap="round"
              animate={{ y2: [8, 5, 8] }} transition={{ duration: 1.8, repeat: Infinity }} />
            <motion.g animate={{ y: [0, -3, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
              <rect x="42" y="0" width="10" height="12" rx="2" fill="rgba(180,220,255,0.25)" stroke="rgba(180,220,255,0.45)" strokeWidth="0.8" />
              <rect x="43" y="-2" width="8" height="2" rx="1" fill="rgba(180,220,255,0.35)" />
            </motion.g>
            <line x1="19" y1="32" x2="10" y2="42" stroke={skinTone} strokeWidth="4" strokeLinecap="round" />
          </>
        ) : (
          <>
            <line x1="19" y1="30" x2="8" y2="32" stroke={skinTone} strokeWidth="4" strokeLinecap="round" />
            <g>
              <rect x="2" y="26" width="10" height="12" rx="2" fill="rgba(180,220,255,0.25)" stroke="rgba(180,220,255,0.45)" strokeWidth="0.8" />
              <rect x="3" y="24" width="8" height="2" rx="1" fill="rgba(180,220,255,0.35)" />
              <motion.circle cx="7" cy="32" r="2" fill="#ffe54f"
                animate={{ r: [1.5, 2.5, 1.5], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.2, repeat: Infinity }} />
              <circle cx="7" cy="32" r="5" fill="rgba(255,229,79,0.12)" />
            </g>
            <motion.line x1="36" y1="32" x2="48" y2="26" stroke={skinTone} strokeWidth="4" strokeLinecap="round"
              animate={{ x2: [48, 50, 48], y2: [26, 22, 26] }} transition={{ duration: 1.2, repeat: Infinity }} />
          </>
        )}

        <rect x="19" y="45" width="17" height="13" rx="4" fill={pantsColor} />

        {reaching ? (
          <>
            <line x1="24" y1="58" x2="22" y2="78" stroke={skinTone} strokeWidth="4.5" strokeLinecap="round" />
            <line x1="31" y1="58" x2="33" y2="78" stroke={skinTone} strokeWidth="4.5" strokeLinecap="round" />
            <ellipse cx="22" cy="80" rx="5" ry="3" fill="#3a2818" />
            <ellipse cx="33" cy="80" rx="5" ry="3" fill="#3a2818" />
          </>
        ) : (
          <>
            <motion.line x1="24" y1="58" x2="18" y2="78" stroke={skinTone} strokeWidth="4.5" strokeLinecap="round"
              animate={{ x2: [18, 32, 18] }} transition={{ duration: 0.55, repeat: Infinity }} />
            <motion.line x1="31" y1="58" x2="38" y2="78" stroke={skinTone} strokeWidth="4.5" strokeLinecap="round"
              animate={{ x2: [38, 24, 38] }} transition={{ duration: 0.55, repeat: Infinity }} />
            <motion.ellipse rx="5" ry="3" fill="#3a2818"
              animate={{ cx: [18, 32, 18], cy: [80, 80, 80] }} transition={{ duration: 0.55, repeat: Infinity }} />
            <motion.ellipse rx="5" ry="3" fill="#3a2818"
              animate={{ cx: [38, 24, 38], cy: [80, 80, 80] }} transition={{ duration: 0.55, repeat: Infinity }} />
          </>
        )}
      </svg>
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// FIREFLY — pulsing bioluminescence
// ═══════════════════════════════════════════
function Firefly({ x, y, size, delay }) {
  return (
    <motion.div
      animate={{
        x: [0, 12, -8, 10, 0],
        y: [0, -15, -5, -18, 0],
        opacity: [0.25, 1, 0.35, 0.9, 0.25],
      }}
      transition={{ duration: 3.5 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
      style={{ position: 'absolute', left: x, top: y, zIndex: 15, width: size, height: size }}
    >
      <div style={{
        width: '100%', height: '100%', borderRadius: '50%',
        background: 'radial-gradient(circle, #ffe54f 0%, rgba(255,229,79,0.5) 40%, transparent 70%)',
        boxShadow: `0 0 ${size * 2}px rgba(255,229,79,0.5), 0 0 ${size * 4}px rgba(255,229,79,0.2)`,
      }} />
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// STREET LAMP — warm cone of light
// ═══════════════════════════════════════════
function StreetLamp() {
  return (
    <div style={{ position: 'absolute', right: '15%', bottom: '8%', zIndex: 10, width: 35, height: 180 }}>
      <svg viewBox="0 0 35 180" width="35" height="180">
        <rect x="15" y="40" width="5" height="140" rx="2.5" fill="#3a3a4a" />
        <rect x="7" y="30" width="21" height="14" rx="5" fill="#4a4a5a" />
        <circle cx="17.5" cy="37" r="4.5" fill="#ffe54f" opacity="0.9" />
        <circle cx="17.5" cy="37" r="7" fill="rgba(255,229,79,0.3)" />
      </svg>
      <motion.div
        animate={{ opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: 45, left: -45, width: 125, height: 220,
          background: 'linear-gradient(180deg, rgba(255,229,79,0.2) 0%, rgba(255,229,79,0.04) 60%, transparent 100%)',
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
          zIndex: 9,
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════
// GROUND FLOWERS (scrolling with terrain)
// ═══════════════════════════════════════════
const FLOWER_COLORS = ['#ff9fa8', '#ffcc44', '#d986d2', '#ff6b81', '#55bde4', '#ffbe00'];
const FLOWER_COLORS_ALT = ['#ffcc44', '#ff9fa8', '#55bde4', '#ffbe00', '#d986d2', '#ff6b81'];

function ScrollingFlowers() {
  return (
    <>
      {[10, 25, 42, 58, 75, 90].map((pct, i) => (
        <svg key={i} style={{ position: 'absolute', bottom: `${12 + (i % 3) * 4}%`, left: `${pct}%` }} width="30" height="18" viewBox="0 0 30 18">
          <circle cx="8" cy="10" r="4" fill={FLOWER_COLORS[i]} opacity="0.7" />
          <circle cx="20" cy="13" r="3.5" fill={FLOWER_COLORS_ALT[i]} opacity="0.6" />
        </svg>
      ))}
    </>
  );
}

// ═══════════════════════════════════════════
// GRASS BLADES (scrolling ground layer)
// ═══════════════════════════════════════════
function GrassBlades({ color1 = '#a6ea7c', color2 = '#7eba5a' }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {Array.from({ length: 20 }, (_, i) => (
        <motion.div
          key={i}
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ duration: 1.5 + (i % 3) * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 }}
          style={{
            position: 'absolute', bottom: 0, left: `${(i / 20) * 100}%`,
            width: 3, height: 14 + (i % 4) * 5,
            background: `linear-gradient(180deg, ${color1}, ${color2})`,
            borderRadius: '2px 2px 0 0', transformOrigin: 'bottom center',
          }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
// NIGHT MUSHROOMS (scrolling ground detail)
// ═══════════════════════════════════════════
const MUSH_COLORS = ['#c4534a', '#d4a040', '#8a6ac0', '#c4534a'];

function NightMushrooms() {
  return (
    <>
      {[15, 40, 65, 85].map((pct, i) => (
        <svg key={i} style={{ position: 'absolute', bottom: `${14 + (i % 2) * 6}%`, left: `${pct}%` }} width="18" height="20" viewBox="0 0 18 20">
          <rect x="8" y="10" width="2" height="10" fill="#8a7a60" />
          <ellipse cx="9" cy="10" rx="7" ry="5" fill={MUSH_COLORS[i]} opacity="0.6" />
        </svg>
      ))}
    </>
  );
}


// ═══════════════════════════════════════════
// BADMINTON PLAYER (Night Scene — Glow Badminton)
// Standing with racket, animated swing
// ═══════════════════════════════════════════
function BadmintonPlayer({ x, bottom, skinTone, hairColor, shirtColor, pantsColor, hairStyle, serving, zIndex }) {
  return (
    <motion.div
      animate={serving ? { y: [0, -5, 0] } : { y: [0, -3, 0] }}
      transition={{ duration: serving ? 1 : 0.7, repeat: Infinity, ease: 'easeInOut' }}
      style={{ position: 'absolute', left: x, bottom, zIndex, width: 55, height: 92 }}
    >
      <svg viewBox="0 0 55 92" width="55" height="92">
        <circle cx="27.5" cy="14" r="11" fill={skinTone} />
        {hairStyle === 'ponytail' ? (
          <>
            <ellipse cx="27.5" cy="9" rx="11.5" ry="6.5" fill={hairColor} />
            <path d="M16,10 Q12,15 8,22 Q10,14 16,10" fill={hairColor} />
          </>
        ) : (
          <ellipse cx="27.5" cy="9" rx="11.5" ry="7" fill={hairColor} />
        )}
        <ellipse cx="23" cy="14" rx="2" ry="2.5" fill="#fff" />
        <ellipse cx="32" cy="14" rx="2" ry="2.5" fill="#fff" />
        <circle cx="23.5" cy="14.5" r="1.4" fill="#2a1a0a" />
        <circle cx="32.5" cy="14.5" r="1.4" fill="#2a1a0a" />
        <path d="M24,18 Q27.5,21 31,18" fill="none" stroke="#c96a4a" strokeWidth="1.2" strokeLinecap="round" />
        <rect x="19" y="25" width="17" height="22" rx="5" fill={shirtColor} />
        {serving ? (
          <>
            <motion.line x1="36" y1="28" x2="50" y2="10" stroke={skinTone} strokeWidth="4" strokeLinecap="round"
              animate={{ y2: [10, 4, 10] }} transition={{ duration: 1, repeat: Infinity }} />
            <motion.g animate={{ rotate: [-15, 15, -15] }} transition={{ duration: 1, repeat: Infinity }}>
              <line x1="50" y1="6" x2="50" y2="-6" stroke="#555" strokeWidth="1.5" />
              <ellipse cx="50" cy="-10" rx="5" ry="7" fill="none" stroke="#4fc3f7" strokeWidth="1" />
            </motion.g>
            <line x1="19" y1="32" x2="10" y2="40" stroke={skinTone} strokeWidth="4" strokeLinecap="round" />
          </>
        ) : (
          <>
            <motion.line x1="36" y1="30" x2="48" y2="20" stroke={skinTone} strokeWidth="4" strokeLinecap="round"
              animate={{ y2: [20, 16, 20] }} transition={{ duration: 0.8, repeat: Infinity }} />
            <g>
              <line x1="48" y1="16" x2="52" y2="6" stroke="#555" strokeWidth="1.5" />
              <ellipse cx="52" cy="2" rx="5" ry="7" fill="none" stroke="#ff7043" strokeWidth="1" />
            </g>
            <line x1="19" y1="32" x2="8" y2="38" stroke={skinTone} strokeWidth="4" strokeLinecap="round" />
          </>
        )}
        <rect x="19" y="45" width="17" height="13" rx="4" fill={pantsColor} />
        <motion.line x1="24" y1="58" x2="18" y2="78" stroke={skinTone} strokeWidth="4.5" strokeLinecap="round"
          animate={{ x2: [18, 30, 18] }} transition={{ duration: 0.55, repeat: Infinity }} />
        <motion.line x1="31" y1="58" x2="38" y2="78" stroke={skinTone} strokeWidth="4.5" strokeLinecap="round"
          animate={{ x2: [38, 26, 38] }} transition={{ duration: 0.55, repeat: Infinity }} />
        <motion.ellipse rx="5" ry="3" fill="#3a2818"
          animate={{ cx: [18, 30, 18], cy: [80, 80, 80] }} transition={{ duration: 0.55, repeat: Infinity }} />
        <motion.ellipse rx="5" ry="3" fill="#3a2818"
          animate={{ cx: [38, 26, 38], cy: [80, 80, 80] }} transition={{ duration: 0.55, repeat: Infinity }} />
      </svg>
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// GLOW SHUTTLECOCK — arcing between players
// ═══════════════════════════════════════════
function GlowShuttlecock() {
  return (
    <motion.div
      animate={{ left: ['76%', '86%', '76%'], top: ['30%', '15%', '30%'] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      style={{ position: 'absolute', zIndex: 14, width: 10, height: 10 }}
    >
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: 'radial-gradient(circle, #fff 0%, #ffe54f 40%, rgba(255,229,79,0.4) 70%, transparent 100%)',
        boxShadow: '0 0 14px rgba(255,229,79,0.7), 0 0 30px rgba(255,229,79,0.3)',
      }} />
      <motion.div
        animate={{ opacity: [0.5, 0, 0.5], scaleY: [1, 0.3, 1] }}
        transition={{ duration: 2.2, repeat: Infinity }}
        style={{
          position: 'absolute', top: 5, left: 2, width: 4, height: 12,
          background: 'linear-gradient(180deg, rgba(255,229,79,0.4), transparent)',
          borderRadius: '0 0 3px 3px',
        }}
      />
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════
// DAY SCENE — Kite Runners + Relay Race
// Bright, energetic, warm. Ground scrolls beneath kids.
// ══════════════════════════════════════════════════════════
function DayScene() {
  return (
    <>
      {/* Bright sky */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: 'linear-gradient(180deg, #4ab8e0 0%, #7dcfee 25%, #a8e0f4 45%, #ffe8b8 75%, #ffd488 100%)',
        zIndex: 0,
      }} />

      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: 'radial-gradient(ellipse at 80% 25%, rgba(255,210,100,0.2) 0%, transparent 55%)',
        zIndex: 1,
      }} />

      {/* Sun with pulsing glow */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '8%', right: '12%', width: 100, height: 100, zIndex: 1 }}
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: -50, left: -50, width: 200, height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,220,100,0.4) 0%, transparent 70%)',
          }}
        />
        <div style={{
          width: '100%', height: '100%', borderRadius: '50%',
          background: 'radial-gradient(circle, #fff9e0 0%, #ffe566 40%, #ffcc00 70%, rgba(255,180,0,0.2) 100%)',
          boxShadow: '0 0 60px rgba(255,200,50,0.5), 0 0 120px rgba(255,180,0,0.2)',
        }} />
      </motion.div>

      <Cloud top="5%" delay={0} duration={70} size="220px" opacity={0.9} />
      <Cloud top="16%" delay={15} duration={90} size="180px" opacity={0.55} direction="rtl" />
      <Cloud top="3%" delay={35} duration={100} size="160px" opacity={0.4} />

      <Bird top="8%" delay={0} duration={24} size="30px" />
      <Bird top="14%" delay={5} duration={30} size="22px" reverse />
      <Bird top="20%" delay={12} duration={35} size="18px" />

      {/* ── PARALLAX LAYERS ── */}

      {/* Far hills — slowest */}
      <ScrollingLayer duration={55} zIndex={3} height="55%">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
          <defs>
            <linearGradient id="df" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5a9a38" />
              <stop offset="100%" stopColor="#3d7520" />
            </linearGradient>
          </defs>
          <path fill="url(#df)" d="M0,100 C180,60 360,140 540,100 C720,60 900,140 1080,100 C1260,60 1440,100 1440,100 L1440,320 L0,320 Z" />
        </svg>
        <RoundTree left="8%" bottom="48%" height={75} color1="#5fa33a" color2="#3a7820" trunkColor="#6b4a2e" />
        <RoundTree left="30%" bottom="52%" height={60} color1="#66aa42" color2="#447a2a" trunkColor="#5a3e28" />
        <RoundTree left="65%" bottom="46%" height={70} color1="#5da836" color2="#3e7222" trunkColor="#6b4a2e" />
        <RoundTree left="88%" bottom="50%" height={55} color1="#6cb444" color2="#4a8228" trunkColor="#5a3e28" />
      </ScrollingLayer>

      {/* Mid hills — medium speed */}
      <ScrollingLayer duration={32} zIndex={5} height="40%">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
          <defs>
            <linearGradient id="dm" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7ec050" />
              <stop offset="100%" stopColor="#5a9a38" />
            </linearGradient>
          </defs>
          <path fill="url(#dm)" d="M0,120 C240,80 480,160 720,120 C960,80 1200,160 1440,120 L1440,320 L0,320 Z" />
        </svg>
        <RoundTree left="12%" bottom="42%" height={85} color1="#72b848" color2="#4d8a2e" trunkColor="#704a2e" />
        <RoundTree left="45%" bottom="38%" height={65} color1="#68b040" color2="#488226" trunkColor="#6b4a2e" />
        <RoundTree left="75%" bottom="44%" height={78} color1="#7ec050" color2="#5a9a38" trunkColor="#704a2e" />
      </ScrollingLayer>

      {/* Front ground — fast (treadmill effect) */}
      <ScrollingLayer duration={16} zIndex={7} height="26%">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
          <defs>
            <linearGradient id="dg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b4f08a" />
              <stop offset="50%" stopColor="#9ae06c" />
              <stop offset="100%" stopColor="#7eba5a" />
            </linearGradient>
          </defs>
          <path fill="url(#dg)" d="M0,140 C240,100 480,180 720,140 C960,100 1200,180 1440,140 L1440,320 L0,320 Z" />
        </svg>
        <ScrollingFlowers />
      </ScrollingLayer>

      {/* Grass — fastest */}
      <ScrollingLayer duration={13} zIndex={8} height="8%">
        <GrassBlades />
      </ScrollingLayer>

      {/* ── KIDS (stationary — ground scrolls beneath) ── */}

      <KiteRunner
        x="38%" bottom="10%" skinTone="#e8b88a" hairColor="#3a2010"
        shirtColor="#ffd54f" pantsColor="#e06090"
        hairStyle="ponytail" holdingString zIndex={10}
      />
      <KiteRunner
        x="25%" bottom="10%" skinTone="#c68b5e" hairColor="#1a0e05"
        shirtColor="#42a5f5" pantsColor="#455a64"
        hairStyle="short" holdingString={false} zIndex={10} delay={0.1}
      />

      <KiteWithString />

      {/* ── RELAY RACE KIDS (3 more runners with baton) ── */}
      <KiteRunner
        x="58%" bottom="10%" skinTone="#fdd8b5" hairColor="#8a5a30"
        shirtColor="#ef5350" pantsColor="#5d4037"
        hairStyle="short" holdingString={false} zIndex={10} delay={0.15}
      />
      <KiteRunner
        x="70%" bottom="10%" skinTone="#8d5e3c" hairColor="#1a0e05"
        shirtColor="#66bb6a" pantsColor="#37474f"
        hairStyle="short" holdingString={false} zIndex={10} delay={0.05}
      />
      <KiteRunner
        x="82%" bottom="10%" skinTone="#e0c8a0" hairColor="#c44500"
        shirtColor="#ff9800" pantsColor="#455a64"
        hairStyle="ponytail" holdingString={false} zIndex={10} delay={0.2}
      />

      {/* Baton being passed between relay runners */}
      <motion.div
        animate={{ x: [0, 3, 0], y: [0, -3, 0], rotate: [0, 20, 0] }}
        transition={{ duration: 0.7, repeat: Infinity }}
        style={{ position: 'absolute', left: '65%', bottom: '22%', zIndex: 11 }}
      >
        <svg width="22" height="6" viewBox="0 0 22 6">
          <rect x="0" y="0" width="22" height="6" rx="3" fill="#ff6b81" />
          <rect x="0" y="0" width="8" height="6" rx="3" fill="#ffd54f" />
        </svg>
      </motion.div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '1.5%', background: '#7eba5a', zIndex: 9 }} />
    </>
  );
}


// ══════════════════════════════════════════════════════════
// NIGHT SCENE — Firefly Catchers
// Calm, magical, cozy. Slower parallax, warm lamp glow.
// ══════════════════════════════════════════════════════════
function NightScene() {
  return (
    <>
      {/* Twilight sky */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: 'linear-gradient(180deg, #0a1628 0%, #14244a 25%, #1a1040 50%, #1e2d4a 75%, #2a3a5c 100%)',
        zIndex: 0,
      }} />

      {/* Natural full moon with soft glow */}
      <motion.div
        animate={{ opacity: [0.92, 1, 0.92] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '10%', left: '15%', width: 70, height: 70, zIndex: 1 }}
      >
        <div style={{
          position: 'absolute', top: -22, left: -22, width: 114, height: 114,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(240,238,220,0.2) 0%, transparent 65%)',
        }} />
        <svg viewBox="0 0 70 70" width="70" height="70">
          <defs>
            <radialGradient id="moonGrad" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#f5f2e8" />
              <stop offset="35%" stopColor="#e4e0d4" />
              <stop offset="70%" stopColor="#d0ccc0" />
              <stop offset="100%" stopColor="#b8b4a8" />
            </radialGradient>
            <filter id="moonGlow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle cx="35" cy="35" r="26" fill="url(#moonGrad)" filter="url(#moonGlow)" />
        </svg>
      </motion.div>

      {/* Stars */}
      {STARS.map((s, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.15, 1, 0.15], scale: [0.8, 1.3, 0.8] }}
          transition={{ duration: s.dur, repeat: Infinity, ease: 'easeInOut', delay: s.delay }}
          style={{
            position: 'absolute', left: s.x, top: s.y, width: s.size, height: s.size,
            borderRadius: '50%', background: '#fff',
            boxShadow: '0 0 3px rgba(255,255,255,0.5)', zIndex: 1,
          }}
        />
      ))}

      {/* Faint wisps */}
      <Cloud top="8%" delay={0} duration={100} size="200px" opacity={0.1} fill="rgba(200,210,240,0.3)" />
      <Cloud top="22%" delay={40} duration={120} size="160px" opacity={0.06} direction="rtl" fill="rgba(200,210,240,0.25)" />

      {/* ── PARALLAX LAYERS ── */}

      {/* Far dark hills — very slow */}
      <ScrollingLayer duration={70} zIndex={3} height="55%">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
          <defs>
            <linearGradient id="nf" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1a2744" />
              <stop offset="100%" stopColor="#0f1a30" />
            </linearGradient>
          </defs>
          <path fill="url(#nf)" d="M0,100 C180,60 360,140 540,100 C720,60 900,140 1080,100 C1260,60 1440,100 1440,100 L1440,320 L0,320 Z" />
        </svg>
        <TreeSilhouette left="10%" bottom="45%" height={80} color="#14203a" />
        <TreeSilhouette left="35%" bottom="50%" height={65} color="#14203a" />
        <TreeSilhouette left="70%" bottom="43%" height={75} color="#14203a" />
        <TreeSilhouette left="90%" bottom="48%" height={60} color="#14203a" />
      </ScrollingLayer>

      {/* Mid dark hills */}
      <ScrollingLayer duration={42} zIndex={5} height="40%">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
          <defs>
            <linearGradient id="nm" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e3050" />
              <stop offset="100%" stopColor="#152540" />
            </linearGradient>
          </defs>
          <path fill="url(#nm)" d="M0,120 C240,80 480,160 720,120 C960,80 1200,160 1440,120 L1440,320 L0,320 Z" />
        </svg>
        <TreeSilhouette left="15%" bottom="40%" height={70} color="#1a2d4a" />
        <TreeSilhouette left="55%" bottom="36%" height={60} color="#1a2d4a" />
        <TreeSilhouette left="82%" bottom="42%" height={68} color="#1a2d4a" />
      </ScrollingLayer>

      {/* Front ground — moderate speed (calmer feel) */}
      <ScrollingLayer duration={22} zIndex={7} height="26%">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
          <defs>
            <linearGradient id="ng" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#243a20" />
              <stop offset="50%" stopColor="#1e3018" />
              <stop offset="100%" stopColor="#182810" />
            </linearGradient>
          </defs>
          <path fill="url(#ng)" d="M0,140 C240,100 480,180 720,140 C960,100 1200,180 1440,140 L1440,320 L0,320 Z" />
        </svg>
        <NightMushrooms />
      </ScrollingLayer>

      {/* Night grass — calm sway */}
      <ScrollingLayer duration={18} zIndex={8} height="8%">
        <GrassBlades color1="#3a5a28" color2="#2a4418" />
      </ScrollingLayer>

      {/* ── STATIONARY ELEMENTS ── */}

      <StreetLamp />

      <FireflyCatcher
        x="30%" bottom="10%" skinTone="#fdd8b5" hairColor="#3a2010"
        shirtColor="#7c4dff" pantsColor="#4a3070"
        hairStyle="braids" reaching zIndex={10}
      />
      <FireflyCatcher
        x="50%" bottom="10%" skinTone="#8d5e3c" hairColor="#1a0e05"
        shirtColor="#26a69a" pantsColor="#37474f"
        hairStyle="curly" reaching={false} zIndex={10}
      />

      {/* ── MORE FIREFLY CATCHERS ── */}
      <FireflyCatcher
        x="12%" bottom="10%" skinTone="#e0c8a0" hairColor="#5a3322"
        shirtColor="#ff7043" pantsColor="#5d4037"
        hairStyle="braids" reaching zIndex={10}
      />
      <FireflyCatcher
        x="42%" bottom="10%" skinTone="#fdd8b5" hairColor="#c44500"
        shirtColor="#42a5f5" pantsColor="#37474f"
        hairStyle="curly" reaching={false} zIndex={10}
      />

      {/* ── GLOW BADMINTON KIDS (under lamp) ── */}
      <BadmintonPlayer
        x="74%" bottom="10%" skinTone="#c68b5e" hairColor="#1a0e05"
        shirtColor="#ab47bc" pantsColor="#4a3070"
        hairStyle="short" serving zIndex={10}
      />
      <BadmintonPlayer
        x="88%" bottom="10%" skinTone="#fdd8b5" hairColor="#3a2010"
        shirtColor="#26c6da" pantsColor="#37474f"
        hairStyle="ponytail" serving={false} zIndex={10}
      />
      <GlowShuttlecock />

      <Firefly x="34%" y="20%" size={6} delay={0} />
      <Firefly x="48%" y="35%" size={5} delay={1.2} />
      <Firefly x="55%" y="18%" size={7} delay={0.5} />
      <Firefly x="28%" y="40%" size={4} delay={2} />
      <Firefly x="62%" y="28%" size={6} delay={0.8} />
      <Firefly x="40%" y="12%" size={5} delay={1.5} />
      <Firefly x="70%" y="22%" size={4} delay={3} />
      <Firefly x="20%" y="30%" size={5} delay={2.5} />
      <Firefly x="58%" y="45%" size={6} delay={1} />
      <Firefly x="75%" y="15%" size={4} delay={0.3} />

      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '1.5%', background: '#182810', zIndex: 9 }} />
    </>
  );
}


// ══════════════════════════════════════════════════════════
// MAIN LANDSCAPE — switches based on time-of-day theme
// ══════════════════════════════════════════════════════════
export default function VectorLandscape() {
  const { theme } = useTimeTheme();

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      overflow: 'hidden', pointerEvents: 'none', zIndex: 0,
    }}>
      {theme === 'night' ? <NightScene /> : <DayScene />}
    </div>
  );
}
