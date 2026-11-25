// The game's rules and state, with no drawing and no browser in it: the kitchen counter, the
// order board, the active dish and the ingredients on the plate, the serve timer, and the screen
// the game is on. step() advances one fixed step and returns what happened as bit flags, so the
// caller can react without knowing about screens or sound. Everything is static files under game/.
import {
  INGREDIENTS, KITCHEN, ORDERS,
  PLATE_STAGE, SERVE_TIME,
} from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_COOK = 'cook';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_SERVED = 'served';

export const EVENT_SERVE = 1; // the serve timer reached zero on the active dish

/** The ingredient ids each dish needs, in the order they are recommended. */
const DISH_INGREDIENTS = {
  omega: ['protein', 'sauce', 'herbs'],
  empress: ['rice', 'herbs', 'veg'],
  hermit: ['veg', 'rice', 'herbs'],
};

/** A real, original idea of the dish: what each ingredient is used for. */
const DISH_META = {
  omega: { label: 'Teriyaki Fish', chef: 'Chef Nori', note: 'Searing fish in soy-brown sauce with fresh herbs.' },
  empress: { label: 'Saffron Rice', chef: 'Chef Iku', note: 'Steamed rice toasted with saffron and a touch of greens.' },
  hermit: { label: 'Herb Green', chef: 'Chef Mara', note: 'A leafy green plated with herbs and a light herb sauce.' },
};

function ingredientId(id) {
  return INGREDIENTS.find((item) => item.id === id) ?? null;
}

export function createGame(random) {
  const activeOrder = ORDERS[0]; // Omega starts as the active dish
  const state = {
    screen: SCREEN_TITLE,
    best: 0,
    selectedId: null, // which ingredient tile is selected
    dishId: activeOrder.id,
    dishLabel: activeOrder.label,
    plated: [], // ingredient ids placed on the plate, in order
    timer: SERVE_TIME, // seconds left on the serve timer
    served: false,
    order: activeOrder,
    meta: DISH_META[activeOrder.id],
  };

  function reset() {
    state.screen = SCREEN_TITLE;
    state.best = 0;
    state.selectedId = null;
    state.dishId = activeOrder.id;
    state.dishLabel = activeOrder.label;
    state.plated = [];
    state.timer = SERVE_TIME;
    state.served = false;
    state.order = activeOrder;
    state.meta = DISH_META[activeOrder.id];
  }

  /**
   * One fixed step. `direction` is -1, 0 or 1 (left/right on the counter or board).
   * With `harmless` set (the title screen's backdrop) things animate but nothing is eaten.
   */
  function step(dt, direction, harmless) {
    if (state.screen === SCREEN_COOK) {
      if (harmless) return 0;
      state.timer -= dt;
      if (state.timer <= 0) {
        state.timer = 0;
        state.served = true;
        if (state.screen !== SCREEN_SERVED) state.screen = SCREEN_SERVED;
        return EVENT_SERVE;
      }
      return 0;
    }
    return 0;
  }

  function resetCook() {
    state.screen = SCREEN_COOK;
    state.selectedId = null;
    state.plated = [];
    state.timer = SERVE_TIME;
    state.served = false;
  }

  /** Pick an order for the active dish. */
  function chooseOrder(id) {
    const order = ORDERS.find((item) => item.id === id);
    if (!order) return false;
    state.dishId = order.id;
    state.dishLabel = order.label;
    state.order = order;
    state.meta = DISH_META[order.id];
    return true;
  }

  /** Mark an ingredient as placed on the plate (only if it is not already there). */
  function placeIngredient(id) {
    if (state.screen !== SCREEN_COOK) return false;
    const exist = state.plated.includes(id);
    if (exist) return false;
    const item = ingredientId(id);
    if (!item) return false;
    state.plated.push(id);
    if (state.selectedId !== id) state.selectedId = id;
    return true;
  }

  /** Un-plate an ingredient at the end of the plate. */
  function unplaceIngredient() {
    if (state.screen !== SCREEN_COOK) return false;
    if (state.plated.length === 0) return false;
    state.plated.pop();
    return true;
  }

  reset();
  return { state, reset, step, resetCook, chooseOrder, placeIngredient, unplaceIngredient };
}
