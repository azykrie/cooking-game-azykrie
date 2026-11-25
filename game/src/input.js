// Input: keyboard and mouse, read by the caller each frame. The game has no sound or network,
// and everything it does is played with the keyboard and mouse, as the bounty requires.
// takeActions() returns the single action pressed since the last call (the latest one).
import { KITCHEN, ORDERS } from './config.js';

export const ACTION_PICK_ORDER = 1;   // pick an order from the order board
export const ACTION_PICK_INGREDIENT = 2; // pick an ingredient tile on the counter
export const ACTION_UNPLATE = 3;      // remove the end of the plate
export const ACTION_SERVE = 4;        // serve the plate when it is full and ready
export const ACTION_PAUSE = 8;        // pause / resume
export const ACTION_CLICK = 16;       // a mouse click at a clickable element

/**
 * Create the input source for a canvas element. Keys are sent as events; clicks as pointerdown.
 */
export function createInput(canvas) {
  let action = 0;
  let paused = false;

  function press(value) { action = value; }

  canvas.addEventListener('pointerdown', () => press(ACTION_CLICK));

  window.addEventListener('keydown', (event) => {
    const key = event.key;
    if (key === ' ' || key === 'Enter' || key === 'e' || key === 'E') press(ACTION_SERVE);
    else if (key === 'p' || key === 'P') press(ACTION_PAUSE);
    else if (key === '1' || key === '2' || key === '3') press(ACTION_PICK_ORDER);
    else if (key === 'n' || key === 'N') press(ACTION_UNPLATE);
  });

  function takeActions() {
    if (paused) return ACTION_PAUSE;
    return action;
  }

  return { takeActions };
}
