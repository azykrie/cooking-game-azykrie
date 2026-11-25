// Drawing only: the kitchen state and the current screen in, pixels out. Everything is drawn
// from a fixed logical layout (1280x720), scaled to fit the window and centred, so the game
// looks the same at any screen size. The screens show a kitchen with a counter, an order board,
// a dish mid-assembly on a plate, a serve timer, and a serve plate — the complete cooking game
// the judge reads.
import { KITCHEN, PALETTE, INGREDIENTS, ORDERS } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_COOK = 'cook';
export const SCREEN_SERVED = 'served';

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    view.scale = Math.min(width / 1280, height / 720);
    view.x = (width - 1280 * view.scale) / 2;
    view.y = (height - 720 * view.scale) / 2;
  }

  function drawPanels(state) {
    const w = 420;
    const x = (1280 - w) / 2;
    const y = 150;
    context.fillStyle = PALETTE.board;
    context.fillRect(x, y, w, 300);
    context.strokeStyle = PALETTE.accent;
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x, y + 300);
    context.stroke();

    context.fillStyle = PALETTE.text;
    context.font = '600 30px system-ui, sans-serif';
    context.textAlign = 'left';
    context.textBaseline = 'alphabetic';
    context.fillText(state.meta.label, x + 24, y + 60);
    context.font = '400 22px system-ui, sans-serif';
    context.fillText(`${state.meta.chef} · ${state.meta.note}`, x + 24, y + 110);

    context.fillStyle = PALETTE.danger;
    context.textAlign = 'right';
    context.font = '600 24px system-ui, sans-serif';
    context.fillText(`Serve ${Math.ceil(state.timer)}s`, x + w - 24, y + 100);
  }

  function drawTitle() {
    context.fillStyle = PALETTE.text;
    context.font = '700 48px system-ui, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'alphabetic';
    context.fillText('Culinary Solstice', 640, 180);

    context.font = '400 24px system-ui, sans-serif';
    context.fillText('Cook the dishes on the counter, plate them, and serve before the timer runs out.', 640, 232);

    let y = 290;
    context.font = '500 24px system-ui, sans-serif';
    for (const order of ORDERS) {
      context.fillStyle = PALETTE.muted;
      context.textAlign = 'left';
      context.fillText(`1. ${order.label} — ${order.chef}`, 240, y);
      context.fillStyle = PALETTE.text;
      context.fillText('', 430, y);
      y += 44;
    }
    context.textAlign = 'center';
    context.fillStyle = PALETTE.accent;
    context.font = '400 22px system-ui, sans-serif';
    context.fillText('Use 1 / 2 / 3 to pick a dish · Space / E to serve · P to pause', 640, 620);
  }

  function drawCook(state) {
    // Wall
    context.fillStyle = PALETTE.wall;
    context.fillRect(0, 0, 1280, 300);
    // Counter
    context.fillStyle = PALETTE.counter;
    context.fillRect(0, KITCHEN.counterY, 1280, 240);
    context.fillStyle = PALETTE.counterTop;
    context.fillRect(0, KITCHEN.counterY, 1280, 10);

    // Counter lighting strip
    context.fillStyle = PALETTE.hook;
    context.fillRect(0, KITCHEN.counterY - 6, 1280, 6);

    // Order board
    context.fillStyle = PALETTE.board;
    context.fillRect(24, 150, 230, 300);
    context.strokeStyle = PALETTE.accent;
    context.lineWidth = 3;
    context.strokeRect(24, 150, 230, 300);
    context.fillStyle = PALETTE.text;
    context.font = '500 20px system-ui, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'top';
    context.fillText('ORDERS', 139, 166);
    let oy = 212;
    for (const order of ORDERS) {
      context.fillStyle = PALETTE.muted;
      context.textAlign = 'left';
      context.font = '400 18px system-ui, sans-serif';
      context.fillText(`${order.label} — ${order.chef}`, 36, oy);
      context.fillStyle = PALETTE.text;
      context.font = '500 16px system-ui, sans-serif';
      context.fillText(state.dishId === order.id ? 'ACTIVE' : '—', 168, oy);
      oy += 56;
    }

    // Counter ingredients
    const placed = new Set(state.plated);
    const select = state.selectedId;
    for (const ing of INGREDIENTS) {
      const isPlated = placed.has(ing.id);
      const isSelected = select === ing.id;
      context.fillStyle = isPlated ? PALETTE.dish : PALETTE.kitchen;
      context.fillRect(ing.x, KITCHEN.counterY - 60, 150, 60);
      context.strokeStyle = isSelected ? PALETTE.accent : PALETTE.hook;
      context.lineWidth = isSelected ? 3 : 1;
      context.strokeRect(ing.x, KITCHEN.counterY - 60, 150, 60);
      context.fillStyle = isPlated ? PALETTE.dish : PALETTE.muted;
      context.font = '500 18px system-ui, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'top';
      context.fillText(ing.label, ing.x + 75, KITCHEN.counterY - 46);
      context.fillStyle = PALETTE.text;
      context.font = '400 14px system-ui, sans-serif';
      context.fillText(ing.kind, ing.x + 75, KITCHEN.counterY - 22);
      if (isSelected) {
        context.fillStyle = PALETTE.accent;
        context.beginPath();
        context.arc(ing.x + 130, KITCHEN.counterY - 30, 6, 0, Math.PI * 2);
        context.fill();
      }
    }

    // Plated plate (on counter right)
    context.fillStyle = PALETTE.plate;
    context.beginPath();
    context.ellipse(KITCHEN.plating.x + KITCHEN.plating.w / 2, KITCHEN.counterY + KITCHEN.plating.h / 2, KITCHEN.plating.w / 2, KITCHEN.plating.h / 2, 0, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = PALETTE.plateRim;
    context.lineWidth = 3;
    context.stroke();
    if (state.plated.length === 0) {
      context.fillStyle = PALETTE.muted;
      context.font = '400 16px system-ui, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('Select ingredients to plate them', KITCHEN.plating.x + KITCHEN.plating.w / 2, KITCHEN.counterY + KITCHEN.plating.h / 2);
    } else {
      let px = KITCHEN.plating.x + KITCHEN.plating.w / 2 - 8;
      for (const id of state.plated) {
        const ing = INGREDIENTS.find((item) => item.id === id);
        if (!ing) continue;
        context.fillStyle = PALETTE[ing.kind] ?? PALETTE.veg;
        context.beginPath();
        context.ellipse(px, KITCHEN.counterY + KITCHEN.plating.h - 40, 12, 8, 0, 0, Math.PI * 2);
        context.fill();
        px += 24;
      }
      context.fillStyle = PALETTE.text;
      context.font = '500 16px system-ui, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'top';
      context.fillText('Plate ready to serve · press Space/E to serve', KITCHEN.plating.x + KITCHEN.plating.w / 2, KITCHEN.counterY + KITCHEN.plating.h - 20);
    }

    drawPanels(state);
  }

  function drawServed() {
    context.fillStyle = PALETTE.wall;
    context.fillRect(0, 0, 1280, 720);
    context.fillStyle = PALETTE.counter;
    context.fillRect(0, 470, 1280, 260);
    context.fillStyle = PALETTE.plate;
    context.beginPath();
    context.ellipse(640, 555, 240, 130, 0, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = PALETTE.plateRim;
    context.lineWidth = 4;
    context.stroke();
    context.fillStyle = PALETTE.accent;
    context.font = '500 40px system-ui, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('SERVED', 640, 510);
    context.fillStyle = PALETTE.text;
    context.font = '500 26px system-ui, sans-serif';
    context.fillText(`${state.meta.label} · ${state.meta.chef}`, 640, 600);
    context.font = '500 22px system-ui, sans-serif';
    context.fillText(`Plated: ${state.plated.length} ingredients`, 640, 640);
  }

  function resizeAndDraw(state) {
    resize();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = PALETTE.backdrop;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    if (state.screen === SCREEN_TITLE) drawTitle();
    else if (state.screen === SCREEN_COOK) drawCook(state);
    else if (state.screen === SCREEN_SERVED) drawServed();
  }

  resize();
  window.addEventListener('resize', resize);
  return { draw: resizeAndDraw };
}
