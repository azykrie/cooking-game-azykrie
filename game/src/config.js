// All tuning numbers, colours and timing for the game in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to the window,
// so no rule below depends on the screen size.

export const FIELD = { width: 1280, height: 720, groundY: 640 };

/** The simulation's fixed step, in seconds: 60 updates a second. */
export const STEP = 1 / 60;

/** Kitchen layout geometry: the counter the ingredients sit on, the plating station. */
export const KITCHEN = {
  counterY: 470,
  counterTop: 300,
  counterW: 1280,
  plating: { x: 1080, y: 470, w: 180, h: 90 },
};

/** Ingredients on the counter: id, label, x offset on the counter, y on the counter. */
export const INGREDIENTS = [
  { id: 'rice', label: 'Steamed Rice', kind: 'staple', x: 230, y: 360 },
  { id: 'herbs', label: 'Fresh Herbs', kind: 'season', x: 390, y: 360 },
  { id: 'sauce', label: 'Teriyaki Sauce', kind: 'condiment', x: 550, y: 360 },
  { id: 'protein', label: 'Silken Fish', kind: 'protein', x: 710, y: 360 },
  { id: 'veg', label: 'Blanched Veg', kind: 'vegetable', x: 870, y: 360 },
  { id: 'plate', label: 'Serve Plate', kind: 'utensil', x: 1030, y: 360 },
];

/** The order board's dish cards. */
export const ORDERS = [
  { id: 'omega', label: 'Teriyaki Fish', chef: 'Chef Nori', x: 230, y: 210 },
  { id: 'empress', label: 'Saffron Rice', chef: 'Chef Iku', x: 430, y: 210 },
  { id: 'hermit', label: 'Herb Green', chef: 'Chef Mara', x: 630, y: 210 },
];

export const PALETTE = {
  backdrop: '#0f1117',
  kitchen: '#24303f',
  counter: '#33414f',
  counterTop: '#4a5a6b',
  wall: '#1d2530',
  hook: '#6b7682',
  rice: '#e7dcc4',
  herbs: '#7fa84a',
  sauce: '#b5622a',
  protein: '#c98a6a',
  veg: '#7fa552',
  plate: '#d9cdb4',
  plateRim: '#3a434d',
  dish: '#f0c98a',
  board: '#2a333f',
  text: '#eef1f5',
  muted: '#8b93a3',
  accent: '#e8a33d',
  danger: '#e5534b',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Seconds a single plating stage takes; the serve timer counts these. */
export const PLATE_STAGE = 4.0;
export const SERVE_TIME = 7.0;

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'culinary-solstice.best';
