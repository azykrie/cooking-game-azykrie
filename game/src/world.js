// The rules of the kitchen, kept free of drawing and DOM code. One order is active at a time;
// the player picks ingredients onto a plate, then serves. A plate is correct when its set of
// ingredients is exactly what the active ticket asks for. Speed and streaks pay a bonus,
// mistakes cost a heart and three seconds, and five served tickets finish the shift.
import {
  BASE_POINTS, INGREDIENTS, ORDERS, SHIFT_LENGTH,
  START_HEARTS, TIME_BONUS, WRONG_PENALTY_SECONDS,
} from './config.js';

export const TITLE = 'title';
export const COOK = 'cook';
export const SERVED = 'served';
export const FINAL = 'final';

const byId = (list, id) => list.find((item) => item.id === id) ?? null;

function sameSet(a, b) {
  return a.length === b.length && a.every((value) => b.includes(value));
}

export function createGame() {
  const state = {
    screen: TITLE,
    orderId: ORDERS[0].id,
    orderNumber: 1,
    servedCount: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    hearts: START_HEARTS,
    plated: [],
    timer: ORDERS[0].time,
    maxTimer: ORDERS[0].time,
    feedback: null,
    result: null,
    best: 0,
  };

  function order() {
    return byId(ORDERS, state.orderId) ?? ORDERS[0];
  }

  function say(text, kind) {
    state.feedback = { text, kind, ttl: 2.4 };
  }

  function loadOrder(index) {
    const next = ORDERS[index % ORDERS.length];
    state.orderId = next.id;
    state.maxTimer = next.time;
    state.timer = next.time;
    state.plated = [];
    state.feedback = null;
    state.result = null;
  }

  function start() {
    state.screen = COOK;
    state.servedCount = 0;
    state.score = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.hearts = START_HEARTS;
    state.orderNumber = 1;
    loadOrder(0);
  }

  function reset() {
    state.screen = TITLE;
    state.feedback = null;
    state.result = null;
    state.plated = [];
  }

  function selectOrder(id) {
    if (state.screen !== COOK) return false;
    const picked = byId(ORDERS, id);
    if (!picked) return false;
    if (picked.id === state.orderId) return false;
    state.orderId = picked.id;
    state.maxTimer = picked.time;
    state.timer = picked.time;
    state.plated = [];
    say(`${picked.label} selected — read the ticket.`, 'info');
    return true;
  }

  function addIngredient(id) {
    if (state.screen !== COOK) return false;
    if (!byId(INGREDIENTS, id)) return false;
    if (state.plated.includes(id)) {
      say('That ingredient is already on the plate.', 'info');
      return false;
    }
    if (state.plated.length >= 5) {
      say('The plate is full — undo or serve it.', 'bad');
      return false;
    }
    state.plated.push(id);
    const ing = byId(INGREDIENTS, id);
    say(`${ing.label} added to the plate.`, 'info');
    return true;
  }

  function undo() {
    if (state.screen !== COOK || state.plated.length === 0) return false;
    const id = state.plated.pop();
    say(`${byId(INGREDIENTS, id).label} taken off.`, 'info');
    return true;
  }

  function fail(message) {
    state.hearts -= 1;
    state.combo = 0;
    state.plated = [];
    state.timer = Math.max(1, state.timer - WRONG_PENALTY_SECONDS);
    say(message, 'bad');
    if (state.hearts <= 0) state.screen = FINAL;
  }

  function serve() {
    if (state.screen !== COOK) return null;
    const ticket = order();
    if (state.plated.length === 0) {
      say('An empty plate does not serve a dish.', 'bad');
      return null;
    }
    if (!sameSet(state.plated, ticket.needs)) {
      fail('Wrong plate — compare it with the ticket.');
      return { perfect: false, gained: 0, ticket };
    }

    const multiplier = 1 + Math.min(state.combo, 4) * 0.25;
    const speed = Math.ceil(state.timer) * TIME_BONUS;
    const gained = Math.round((BASE_POINTS + speed) * multiplier);
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.score += gained;
    state.servedCount += 1;
    state.result = { perfect: true, gained, speed, multiplier, ticket };
    state.screen = SERVED;
    state.feedback = null;
    return state.result;
  }

  function next() {
    if (state.screen !== SERVED) return;
    if (state.servedCount >= SHIFT_LENGTH) {
      state.screen = FINAL;
      return;
    }
    state.orderNumber += 1;
    loadOrder(state.orderNumber - 1);
    state.screen = COOK;
  }

  function tick(dt) {
    if (state.screen === COOK) {
      state.timer -= dt;
      if (state.timer <= 0) {
        state.timer = state.maxTimer;
        fail(`${order().label} timed out — the ticket was lost.`);
      }
    }
    if (state.feedback) {
      state.feedback.ttl -= dt;
      if (state.feedback.ttl <= 0) state.feedback = null;
    }
  }

  function snapshotRecipe() {
    return { ticket: order(), plated: [...state.plated] };
  }

  return { state, order, start, reset, selectOrder, addIngredient, undo, serve, next, tick, snapshotRecipe };
}
