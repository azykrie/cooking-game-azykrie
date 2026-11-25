// Tuning data for Culinary Solstice. No drawing and no browser code lives here: the world
// reads recipes and timings, the renderer reads colours and labels from the same tables.
// The logical playfield is 1280x720; the renderer scales it to any window.

export const FIELD = { width: 1280, height: 720 };
export const STEP = 1 / 60;

export const PALETTE = {
  backdrop: '#100d16',
  wall: '#241b2c',
  wallLight: '#302338',
  tile: '#392a42',
  counter: '#3b2934',
  counterTop: '#6b4a4f',
  board: '#1b1726',
  ink: '#fff4e6',
  muted: '#bda9bd',
  gold: '#f4b860',
  coral: '#ef7d70',
  mint: '#8fd0a8',
  violet: '#b59ae8',
  plate: '#f6e7cf',
  plateRim: '#a98f7b',
  shadow: 'rgba(12, 8, 18, 0.45)',
  good: '#9ce3b0',
  bad: '#ff9b93',
};

// Ingredients are tiles on the counter. `chili` is a deliberate decoy: it belongs to no
// recipe, so the player has to read the tickets instead of adding everything in sight.
export const INGREDIENTS = [
  { id: 'rice', label: 'Steamed Rice', short: 'RICE', key: 'A', color: '#f2e3c4', kind: 'staple' },
  { id: 'herbs', label: 'Garden Herbs', short: 'HERBS', key: 'S', color: '#8fd0a8', kind: 'greens' },
  { id: 'sauce', label: 'Soy Glaze', short: 'GLAZE', key: 'D', color: '#d68b5a', kind: 'sauce' },
  { id: 'protein', label: 'Silken Fish', short: 'FISH', key: 'F', color: '#f0a89a', kind: 'protein' },
  { id: 'veg', label: 'Blanched Greens', short: 'GREENS', key: 'G', color: '#7fbf8c', kind: 'vegetable' },
  { id: 'chili', label: 'Chili Flakes', short: 'CHILI', key: 'H', color: '#e46a5d', kind: 'spice' },
];

// Each ticket names its chef, the exact ingredients the dish needs and a short plate note.
// Orders rotate through this list; a five-order shift makes one run feel complete.
export const ORDERS = [
  {
    id: 'omega', label: 'Solstice Fish', chef: 'Chef Nori',
    needs: ['protein', 'sauce', 'herbs'], time: 20,
    note: 'Sear the fish, glaze it, finish with herbs.', color: '#f0a89a',
  },
  {
    id: 'empress', label: 'Saffron Rice', chef: 'Chef Iku',
    needs: ['rice', 'herbs', 'veg'], time: 22,
    note: 'Warm rice folded with greens and herbs.', color: '#f4d68a',
  },
  {
    id: 'hermit', label: 'Garden Stack', chef: 'Chef Mara',
    needs: ['veg', 'rice', 'sauce'], time: 24,
    note: 'Greens over rice with a thin glaze.', color: '#8fd0a8',
  },
];

export const SHIFT_LENGTH = 5;
export const START_HEARTS = 3;
export const BASE_POINTS = 100;
export const TIME_BONUS = 8;
export const WRONG_PENALTY_SECONDS = 3;
export const BEST_KEY = 'culinary-solstice.best.v2';
