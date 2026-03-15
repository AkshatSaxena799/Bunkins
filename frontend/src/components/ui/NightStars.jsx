import React from 'react';
import { useTimeTheme } from '../../contexts/TimeThemeContext';
import './NightStars.css';

/**
 * Full-page twinkling stars layer when night theme is active.
 * Renders on all pages, fixed behind content, pointer-events: none.
 */
export default function NightStars() {
  const { theme } = useTimeTheme();
  if (theme !== 'night') return null;

  const stars = Array.from({ length: 80 }, (_, i) => ({
    left: `${(i * 13 + 7) % 100}%`,
    top: `${(i * 17 + 3) % 100}%`,
    size: 1 + (i % 3),
    delay: (i * 0.12) % 4,
    duration: 2 + (i % 3),
  }));

  return (
    <div className="night-stars" aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          className="night-star"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
