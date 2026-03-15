import React from 'react';
import { useTimeTheme } from '../../contexts/TimeThemeContext';
import './StorybookBackgrounds.css';

export default function StorybookTownBackground() {
  const { theme } = useTimeTheme();
  const isNight = theme === 'night';

  return (
    <div className={`storybook-scene ${isNight ? 'scene-town-night' : 'scene-town'}`}>
      {isNight ? (
        <>
          {/* Night: small natural moon */}
          <div style={{
            position: 'absolute', top: '10%', right: '14%', width: 44, height: 44,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #f0eee4 0%, #e0dcd0 40%, #c8c4b8 100%)',
            boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.06), inset 2px 2px 8px rgba(255,255,255,0.35), 0 0 24px rgba(240,238,220,0.2)',
            zIndex: 1,
          }} />
          <div className="scene-layer" style={{ top: '30%', zIndex: 1, opacity: 0.85 }}>
            <div style={{ position: 'absolute', left: '15%', top: '20px' }}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L2 12H5V21H19V12H22L12 3Z" fill="#14203a" stroke="#1e2d4a" strokeWidth="0.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ position: 'absolute', right: '20%', top: '0px' }}>
              <svg width="100" height="100" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L2 12H5V21H19V12H22L12 3Z" fill="#1a2744" stroke="#243552" strokeWidth="0.5" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="scene-ground" style={{ zIndex: 2 }}>
            <svg viewBox="0 0 1440 250" preserveAspectRatio="none">
              <path fill="#1e2d4a" d="M0,128L80,117.3C160,107,320,85,480,90.7C640,96,800,128,960,128C1120,128,1280,96,1360,80L1440,64L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
            </svg>
          </div>
          <div className="scene-kite" style={{ bottom: '40%', right: '35%', zIndex: 3 }}>
            <svg width="40" height="80" viewBox="0 0 24 48" fill="none">
              <path d="M12 2L2 12L12 22L22 12L12 2Z" fill="#7c4dff" strokeLinejoin="round"/>
              <path d="M12 22Q14 30 12 38Q10 46 12 48" stroke="rgba(124,77,255,0.5)" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="scene-ground" style={{ zIndex: 4, transform: 'translateY(2px)' }}>
            <svg viewBox="0 0 1440 180" preserveAspectRatio="none">
              <path fill="#152540" d="M0,64L120,85.3C240,107,480,149,720,154.7C960,160,1200,128,1320,112L1440,96L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"></path>
            </svg>
          </div>
        </>
      ) : (
        <>
          {/* Day: Town Houses */}
          <div className="scene-layer" style={{ top: '30%', zIndex: 1, opacity: 0.6 }}>
            <div style={{ position: 'absolute', left: '15%', top: '20px' }}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L2 12H5V21H19V12H22L12 3Z" fill="#ffbe00" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ position: 'absolute', right: '20%', top: '0px' }}>
              <svg width="100" height="100" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L2 12H5V21H19V12H22L12 3Z" fill="#55bde4" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="scene-ground" style={{ zIndex: 2 }}>
            <svg viewBox="0 0 1440 250" preserveAspectRatio="none">
              <path fill="#fdfdfd" d="M0,128L80,117.3C160,107,320,85,480,90.7C640,96,800,128,960,128C1120,128,1280,96,1360,80L1440,64L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
            </svg>
          </div>
          <div className="scene-kite" style={{ bottom: '40%', right: '35%', zIndex: 3 }}>
            <svg width="40" height="80" viewBox="0 0 24 48" fill="none">
              <path d="M12 2L2 12L12 22L22 12L12 2Z" fill="#e42b84" strokeLinejoin="round"/>
              <path d="M12 22Q14 30 12 38Q10 46 12 48" stroke="#55bde4" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="scene-ground" style={{ zIndex: 4, transform: 'translateY(2px)' }}>
            <svg viewBox="0 0 1440 180" preserveAspectRatio="none">
              <path fill="#cee7f5" d="M0,64L120,85.3C240,107,480,149,720,154.7C960,160,1200,128,1320,112L1440,96L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"></path>
            </svg>
          </div>
        </>
      )}
    </div>
  );
}
