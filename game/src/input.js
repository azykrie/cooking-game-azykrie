// Events only: keyboard and pointer input become game actions, passed to the handlers supplied
// by main.js. This file does not own game state or know where anything is drawn.
import { INGREDIENTS, ORDERS } from './config.js';
import { COOK, FINAL, SERVED } from './world.js';

const keyToIngredient = new Map(INGREDIENTS.map((item) => [item.key.toLowerCase(), item.id]));

export function createInput(canvas, renderer, handlers, state) {
  function advance() {
    if (state.screen === COOK) handlers.serve();
    else if (state.screen === SERVED) handlers.next();
    else handlers.start();
  }

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key === ' ' || key === 'enter') {
      event.preventDefault();
      advance();
    } else if (state.screen === COOK && (key === 'backspace' || key === 'n')) {
      event.preventDefault();
      handlers.undo();
    } else if (key === '1' || key === '2' || key === '3') {
      handlers.selectOrder(ORDERS[Number(key) - 1].id);
    } else if (state.screen === COOK && keyToIngredient.has(key)) {
      handlers.addIngredient(keyToIngredient.get(key));
    }
  });

  canvas.addEventListener('pointerdown', (event) => {
    const hit = renderer.hitTest(event.clientX, event.clientY);
    if (!hit) {
      advance();
      return;
    }
    if (hit.type === 'start' || hit.type === 'next') advance();
    else if (hit.type === 'serve') handlers.serve();
    else if (hit.type === 'undo') handlers.undo();
    else if (hit.type === 'ingredient') handlers.addIngredient(hit.value);
    else if (hit.type === 'order') handlers.selectOrder(hit.value);
  });
}
