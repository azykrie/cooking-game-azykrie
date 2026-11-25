// Boot, the fixed-step loop and the deterministic ?shot= staging used for the screenshots.
// No game rules live here: world.js owns the state, render.js paints it, input.js routes events.
import { BEST_KEY, ORDERS, STEP } from './config.js';
import { createGame, COOK } from './world.js';
import { createRenderer } from './render.js';
import { createInput } from './input.js';

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createGame();
const renderer = createRenderer(canvas);
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Private windows can refuse storage; the score still lasts this visit.
  }
}

world.state.best = readBest();

function announce() {
  const s = world.state;
  if (s.screen === COOK) {
    status.textContent = `Cooking ${world.order().label}. ${s.plated.length} of ${world.order().needs.length} ingredients plated.`;
  } else if (s.screen === 'served') {
    status.textContent = `Order served. ${s.score} points.`;
  } else if (s.screen === 'title') {
    status.textContent = 'Culinary Solstice. Press space to start.';
  }
}

const handlers = {
  start() { world.start(); announce(); },
  next() {
    if (world.state.score > world.state.best) {
      world.state.best = world.state.score;
      saveBest(world.state.best);
    }
    world.next();
    announce();
  },
  selectOrder(id) { world.selectOrder(id); announce(); },
  addIngredient(id) { world.addIngredient(id); announce(); },
  undo() { world.undo(); announce(); },
  serve() { world.serve(); announce(); },
};

createInput(canvas, renderer, handlers, world.state);

/** Put the real game state into a still frame for a screenshot, then mark it ready. */
function stageShot() {
  const name = params.get('shot') ?? 'title';
  const dish = ORDERS.find((order) => order.id === params.get('dish')) ?? ORDERS[0];
  const count = Math.min(Number.parseInt(params.get('plate') ?? '0', 10) || 0, dish.needs.length);
  if (name === 'title') {
    world.reset();
    world.state.best = Math.max(world.state.best, 1240);
  } else if (name === 'served') {
    world.start();
    world.selectOrder(dish.id);
    dish.needs.forEach((id) => world.addIngredient(id));
    world.serve();
  } else {
    world.start();
    world.selectOrder(dish.id);
    dish.needs.slice(0, count).forEach((id) => world.addIngredient(id));
    const seconds = Number.parseFloat(params.get('t') ?? '');
    if (Number.isFinite(seconds)) world.state.timer = seconds;
    world.state.feedback = null;
  }
  renderer.draw(world.state);
  window.__shotReady = true;
  document.title = 'ready';
}

if (shot) {
  stageShot();
} else {
  let last = performance.now();
  let carry = 0;
  function frame(now) {
    carry += Math.min((now - last) / 1000, 0.25);
    last = now;
    while (carry >= STEP) {
      world.tick(STEP);
      carry -= STEP;
    }
    renderer.draw(world.state);
    requestAnimationFrame(frame);
  }
  announce();
  requestAnimationFrame(frame);
}
