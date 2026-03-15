import React from 'react';
import { useTimeTheme } from '../../contexts/TimeThemeContext';
import './StorybookBackgrounds.css';

// SVG Cloud Component
const Cloud = ({ width = 120, fill = '#ffffff' }) => (
  <svg viewBox="0 0 24 24" fill={fill} style={{ width, height: 'auto' }}>
    <path d="M17.5 19c2.485 0 4.5-2.015 4.5-4.5S19.985 10 17.5 10c-.394 0-.77.05-1.127.143A6.994 6.994 0 0 0 10 4a6.994 6.994 0 0 0-6.373 6.143A4.5 4.5 0 0 0 3.5 19H17.5z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function StorybookHeroBackground() {
  const { theme } = useTimeTheme();
  const isNight = theme === 'night';

  return (
    <div className={`storybook-scene ${isNight ? 'scene-hero-night' : 'scene-sunrise'}`}>
      {isNight ? (
        <>
          {/* Natural full moon — soft gradient, subtle glow */}
          <div style={{
            position: 'absolute',
            top: '12%',
            right: '18%',
            width: 88,
            height: 88,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #f5f2e8 0%, #e8e4d8 25%, #d8d4c8 50%, #c8c4b8 75%, rgba(180,176,165,0.9) 100%)',
            boxShadow: 'inset -3px -3px 12px rgba(0,0,0,0.08), inset 4px 4px 14px rgba(255,255,255,0.4), 0 0 40px rgba(240,238,220,0.25), 0 0 80px rgba(220,218,200,0.12)',
          }} />
          {/* Small stars */}
          {[8, 15, 22, 28, 35, 42].map((top, i) => (
            <div
              key={i}
              className="scene-star"
              style={{
                left: `${12 + i * 14}%`,
                top: `${top}%`,
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.9)',
                boxShadow: '0 0 6px rgba(255,255,255,0.5)',
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
          {/* Faint clouds at night */}
          <div className="scene-layer" style={{ top: '25%', zIndex: 1 }}>
            <div className="scene-cloud" style={{ animationDuration: '160s', top: 0 }}>
              <Cloud width={140} fill="rgba(180,190,220,0.12)" />
            </div>
            <div className="scene-cloud" style={{ animationDuration: '200s', animationDelay: '-60s', top: '12vh' }}>
              <Cloud width={100} fill="rgba(160,170,200,0.08)" />
            </div>
          </div>
          {/* Balloon — visible on dark sky */}
          <div className="scene-balloon" style={{ top: '35%', left: '10%', zIndex: 2 }}>
            <svg width="60" height="80" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8 2 5 5 5 9C5 13 12 20 12 20C12 20 19 13 19 9C19 5 16 2 12 2Z" fill="#e42b84" />
              <path d="M11 20H13V22H11V20Z" fill="#94a3b8" />
            </svg>
          </div>
          {/* Night hills */}
          <div className="scene-ground" style={{ zIndex: 3 }}>
            <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="#1a2744" d="M0,192L48,181.3C96,171,192,149,288,149.3C384,149,480,171,576,202.7C672,235,768,277,864,282.7C960,288,1056,256,1152,213.3C1248,171,1344,117,1392,90.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
          <div className="scene-ground" style={{ zIndex: 4, transform: 'translateY(2px)' }}>
            <svg viewBox="0 0 1440 250" preserveAspectRatio="none">
              <path fill="#152540" d="M0,64L60,74.7C120,85,240,107,360,106.7C480,107,600,85,720,80C840,75,960,85,1080,112C1200,139,1320,181,1380,202.7L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
            </svg>
          </div>
        </>
      ) : (
        <>
          {/* Sun */}
          <div style={{
            position: 'absolute',
            top: '15%',
            right: '15%',
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: '#ffbe00',
            filter: 'blur(8px)',
            opacity: 0.9,
          }} />

          {/* Clouds Layer */}
          <div className="scene-layer" style={{ top: '20%', zIndex: 1 }}>
            <div className="scene-cloud" style={{ animationDuration: '140s', top: 0 }}>
              <Cloud width={180} fill="rgba(255, 255, 255, 0.9)" />
            </div>
            <div className="scene-cloud" style={{ animationDuration: '95s', animationDelay: '-40s', top: '15vh' }}>
              <Cloud width={100} fill="rgba(255, 255, 255, 0.7)" />
            </div>
            <div className="scene-cloud" style={{ animationDuration: '180s', animationDelay: '-110s', top: '5vh' }}>
              <Cloud width={240} fill="rgba(255, 255, 255, 0.5)" />
            </div>
          </div>

          {/* Floating Balloon */}
          <div className="scene-balloon" style={{ top: '35%', left: '10%', zIndex: 2 }}>
            <svg width="60" height="80" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8 2 5 5 5 9C5 13 12 20 12 20C12 20 19 13 19 9C19 5 16 2 12 2Z" fill="#e42b84" />
              <path d="M11 20H13V22H11V20Z" fill="#073763" />
            </svg>
          </div>

          {/* Foreground Hills (Day) */}
          <div className="scene-ground" style={{ zIndex: 3 }}>
            <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="#e2f1f8" d="M0,192L48,181.3C96,171,192,149,288,149.3C384,149,480,171,576,202.7C672,235,768,277,864,282.7C960,288,1056,256,1152,213.3C1248,171,1344,117,1392,90.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
          <div className="scene-ground" style={{ zIndex: 4, transform: 'translateY(2px)' }}>
            <svg viewBox="0 0 1440 250" preserveAspectRatio="none">
              <path fill="#ffffff" d="M0,64L60,74.7C120,85,240,107,360,106.7C480,107,600,85,720,80C840,75,960,85,1080,112C1200,139,1320,181,1380,202.7L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
            </svg>
          </div>
        </>
      )}
    </div>
  );
}
