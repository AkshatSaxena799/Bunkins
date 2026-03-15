import React from 'react';
import StorybookHeroBackground from './StorybookHeroBackground';
import StorybookTownBackground from './StorybookTownBackground';

/**
 * Background layers for HomePage: hero and collections sections.
 * Day/night handled inside each component via TimeThemeContext.
 */
export function HeroBackgroundLayer() {
  return <StorybookHeroBackground />;
}

export function ProductsBackgroundLayer() {
  return <StorybookTownBackground />;
}
