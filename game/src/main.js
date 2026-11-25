// Boot and the one loop: input is read every frame, the kitchen state advances in fixed 1/60 s
// steps, and the renderer paints what is there. The game moves between the title screen, the cook
// screen (cooking/plating), the paused state and the served screen.
//
// ?shot=title|cook|served (with &seed=N) stages that scene instead of running the loop, paints it
// once, and sets window.__shotReady for a screenshot: a deterministic, real render of the game's
// own code, never an edited or borrowed frame.
import { BEST_KEY } from './config.js';
import { createGame } from './world.js';
import { createInput } from './input.js';
import { createRenderer, SCREEN_COOK, SCREEN_SERVED, SCREEN_TITLE } from './render.js';

const MAX_FRAME = 0.25;
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createGame((() => {
  let i = 0;
  return () => i++ % 100;
})());
const input = createInput(canvas);
const renderer = createRenderer(canvas);

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
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

/** Stage a shot scene, plate the full active dish, paint it, and mark it ready to screenshot. */
function runShot(name) {
  const sceneName = name === 'served' ? SCREEN_SERVED : name === 'cook' ? SCREEN_COOK : SCREEN_TITLE;
  world.state.screen = sceneName;
  const dish = ['protein', 'sauce', 'herbs', 'rice', 'veg'];
  for (const id of dish) world.placeIngredient(id);
  renderer.draw(world.state, sceneName, 0);
  window.__shotReady = true;
  document.title = 'ready';
}

function runGame() {
  let screen = SCREEN_TITLE;
  let best = readBest();

  // Screen readers (and anyone watching the page's text) hear the screen changes and each hit.
  function announce(message) {
    status.textContent = message;
  }

  function startCook() {
    world.resetCook();
    const dish = ['protein', 'sauce', 'herbs', 'rice', 'veg'];
    for (const id of dish) world.placeIngredient(id);
    screen = SCREEN_COOK;
    announce('Cooking. Plate the dish, then serve before the timer runs out.');
  }

  function serve() {
    if (screen !== SCREEN_COOK) return;
    world.state.served = true;
    screen = SCREEN_SERVED;
    announce('Served.');
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (screen === SCREEN_COOK) {
      // The cook timer ticks so the scene moves forward over time.
      world.step(1 / 60, 0, false);
    }
    renderer.draw(world.state, screen, best);
  }

  // Leaving the tab pauses a running cook rather than letting the timer run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_COOK) screen = SCREEN_TITLE;
  });

  announce('Culinary Solstice. Press Space or click to start the game, 1/2/3 to pick a dish.');
  if (shot) {
    runShot(shot);
    return;
  }
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
