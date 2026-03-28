(function() {
  const PALETTES = ['palette-1', 'palette-2', 'palette-3', 'palette-4', 'palette-5'];
  const STORAGE_KEY = 'selectedPalette';

  function getRandomPalette() {
    return PALETTES[Math.floor(Math.random() * PALETTES.length)];
  }

  function applyPalette(palette) {
    PALETTES.forEach(p => document.documentElement.classList.remove(p));
    document.documentElement.classList.add(palette);
  }

  function initPalette() {
    const selectedPalette = getRandomPalette();
    applyPalette(selectedPalette);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPalette);
  } else {
    initPalette();
  }
})();
