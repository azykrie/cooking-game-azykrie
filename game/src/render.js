// Drawing only. It paints the same 1280x720 logical scene at any window size and records the
// clickable rectangles for the current frame, so input.js never has to know the layout.
import { INGREDIENTS, ORDERS, PALETTE, SHIFT_LENGTH } from './config.js';
import { COOK, FINAL, SERVED, TITLE } from './world.js';

const W = 1280;
const H = 720;
const byId = (id) => INGREDIENTS.find((item) => item.id === id) ?? null;
const orderById = (id) => ORDERS.find((item) => item.id === id) ?? ORDERS[0];

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };
  let regions = [];

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    view.scale = Math.min(width / W, height / H);
    view.x = (width - W * view.scale) / 2;
    view.y = (height - H * view.scale) / 2;
  }

  function roundRect(x, y, w, h, r, fill, stroke, lineWidth = 1) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke(); }
  }

  function label(text, x, y, size, color, weight = '500', align = 'left', baseline = 'alphabetic') {
    ctx.fillStyle = color;
    ctx.font = `${weight} ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillText(text, x, y);
  }

  function region(x, y, w, h, type, value) {
    regions.push({ x, y, w, h, type, value });
  }

  function wall() {
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(0, 0, W, H);
    for (let row = 0; row < 5; row += 1) {
      for (let col = 0; col < 11; col += 1) {
        const x = col * 124 + (row % 2 ? 62 : 0);
        const y = 74 + row * 82;
        ctx.fillStyle = (row + col) % 3 === 0 ? PALETTE.tile : PALETTE.wallLight;
        ctx.globalAlpha = 0.5;
        ctx.fillRect(x + 2, y + 2, 118, 76);
        ctx.globalAlpha = 1;
      }
    }
    const glow = ctx.createRadialGradient(640, 120, 40, 640, 120, 620);
    glow.addColorStop(0, 'rgba(244,184,96,0.16)');
    glow.addColorStop(1, 'rgba(244,184,96,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
  }

  function counter() {
    ctx.fillStyle = PALETTE.counter;
    ctx.fillRect(0, 470, W, 250);
    ctx.fillStyle = PALETTE.counterTop;
    ctx.fillRect(0, 470, W, 12);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    for (let x = 0; x < W; x += 160) ctx.fillRect(x + 18, 482, 124, 2);
  }

  function topBar(state) {
    ctx.fillStyle = 'rgba(12,9,18,0.82)';
    ctx.fillRect(0, 0, W, 72);
    label('CULINARY SOLSTICE', 30, 45, 26, PALETTE.gold, '700');
    label(`TICKET ${Math.min(state.orderNumber, SHIFT_LENGTH)} / ${SHIFT_LENGTH}   ·   ${state.servedCount} SERVED`,
      640, 45, 18, PALETTE.muted, '500', 'center');
    label(`${state.score}`, 1250, 44, 30, PALETTE.ink, '700', 'right');
    label('SCORE', 1250, 62, 12, PALETTE.muted, '500', 'right');
    for (let i = 0; i < 3; i += 1) {
      ctx.fillStyle = i < state.hearts ? PALETTE.coral : 'rgba(255,255,255,0.14)';
      ctx.beginPath();
      ctx.arc(1000 + i * 30, 36, 9, 0, Math.PI * 2);
      ctx.fill();
    }
    label('HEARTS', 1030, 62, 12, PALETTE.muted, '500', 'center');
    if (state.combo > 1) label(`COMBO x${state.combo}`, 880, 46, 18, PALETTE.mint, '700', 'right');
  }

  function bottomBar(state) {
    ctx.fillStyle = 'rgba(12,9,18,0.86)';
    ctx.fillRect(0, 648, W, 72);
    const feedback = state.feedback;
    if (feedback) {
      const color = feedback.kind === 'bad' ? PALETTE.bad : feedback.kind === 'good' ? PALETTE.good : PALETTE.ink;
      roundRect(400, 666, 480, 38, 19, 'rgba(255,255,255,0.07)');
      label(feedback.text, 640, 691, 17, color, '600', 'center');
    } else {
      label('1 2 3 pick ticket    A S D F G H add ingredient    BACKSPACE undo    SPACE serve',
        640, 691, 17, PALETTE.muted, '500', 'center');
    }
  }

  function ingredientIcon(id, cx, cy, size) {
    const ing = byId(id);
    const color = ing ? ing.color : PALETTE.muted;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(size / 100, size / 100);
    if (id === 'rice') {
      ctx.fillStyle = '#d8c7ae';
      ctx.beginPath(); ctx.ellipse(0, 8, 38, 18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.ellipse(0, -4, 34, 16, 0, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = PALETTE.plateRim; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-38, 8); ctx.lineTo(38, 8); ctx.stroke();
      for (let i = -2; i <= 2; i += 1) {
        ctx.fillStyle = '#fff8e8';
        ctx.beginPath(); ctx.ellipse(i * 12, -10 - (i % 2) * 4, 4, 2.5, -0.4, 0, Math.PI * 2); ctx.fill();
      }
    } else if (id === 'herbs') {
      ctx.strokeStyle = '#5e9b6f'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(0, 36); ctx.lineTo(0, -30); ctx.stroke();
      for (let i = 0; i < 4; i += 1) {
        const y = -20 + i * 15;
        ctx.fillStyle = i % 2 ? color : '#6fb884';
        ctx.beginPath(); ctx.ellipse(-15, y, 17, 8, -0.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(15, y + 5, 17, 8, 0.5, 0, Math.PI * 2); ctx.fill();
      }
    } else if (id === 'sauce') {
      ctx.fillStyle = '#7d4630';
      roundRect(-18, -24, 36, 56, 9, '#7d4630');
      ctx.fillStyle = color;
      roundRect(-14, -8, 28, 36, 7, color);
      ctx.fillStyle = '#e9c9a4';
      roundRect(-10, -36, 20, 14, 4, '#e9c9a4');
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(0, 36, 5, 0, Math.PI * 2); ctx.fill();
    } else if (id === 'protein') {
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.ellipse(-4, 0, 32, 18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(44, -16); ctx.lineTo(44, 16); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#2a2028';
      ctx.beginPath(); ctx.arc(-18, -4, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-22, 8); ctx.quadraticCurveTo(0, 20, 22, 6); ctx.stroke();
    } else if (id === 'veg') {
      for (let i = -1; i <= 1; i += 1) {
        ctx.fillStyle = i === 0 ? color : '#63a776';
        ctx.beginPath(); ctx.ellipse(i * 16, 6 + Math.abs(i) * 4, 17, 24, i * 0.3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = '#4d855f'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(0, 28); ctx.lineTo(0, 42); ctx.stroke();
    } else if (id === 'chili') {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(20, -26);
      ctx.quadraticCurveTo(36, 10, 4, 32);
      ctx.quadraticCurveTo(-18, 42, -20, 20);
      ctx.quadraticCurveTo(-22, 2, 20, -26);
      ctx.fill();
      ctx.strokeStyle = '#5e9b6f'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(20, -26); ctx.lineTo(30, -40); ctx.stroke();
      ctx.fillStyle = '#ffd6a0';
      for (const [x, y] of [[-6, 10], [4, 22], [-12, 24]]) {
        ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  }

  function chip(id, x, y, w, done, compact = false) {
    const ing = byId(id);
    const h = compact ? 26 : 32;
    roundRect(x, y, w, h, 8,
      done ? 'rgba(156,227,176,0.22)' : 'rgba(255,255,255,0.07)',
      done ? PALETTE.good : 'rgba(255,255,255,0.16)', 1.5);
    ctx.fillStyle = ing.color;
    ctx.beginPath(); ctx.arc(x + 13, y + h / 2, 5, 0, Math.PI * 2); ctx.fill();
    label(done ? `${ing.short} ✓` : ing.short, x + 23, y + h / 2 + 1, compact ? 11 : 12,
      done ? PALETTE.good : PALETTE.ink, '600', 'left', 'middle');
  }

  function ticket(order, x, y, w, state, active) {
    const needs = order.needs;
    const done = needs.filter((id) => state.plated.includes(id)).length;
    roundRect(x, y, w, 132, 12,
      active ? 'rgba(244,184,96,0.13)' : 'rgba(255,255,255,0.04)',
      active ? PALETTE.gold : 'rgba(255,255,255,0.10)', active ? 2.5 : 1);
    if (active) {
      roundRect(x + w - 76, y + 10, 64, 24, 12, PALETTE.gold);
      label('ACTIVE', x + w - 44, y + 27, 11, '#241b2c', '700', 'center');
    }
    label(order.label, x + 16, y + 30, 20, order.color, '700');
    label(order.chef, x + 16, y + 52, 12, PALETTE.muted, '500');
    needs.forEach((id, i) => chip(id, x + 14 + i * 92, y + 66, 86, state.plated.includes(id), true));
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.fillRect(x + 16, y + 110, w - 32, 6);
    ctx.fillStyle = active ? PALETTE.gold : PALETTE.mint;
    ctx.fillRect(x + 16, y + 110, (w - 32) * (done / needs.length), 6);
    region(x, y, w, 132, 'order', order.id);
  }

  function board(state) {
    const x = 28;
    roundRect(x, 92, 302, 532, 16, PALETTE.board, 'rgba(244,184,96,0.35)', 2);
    label('ORDER BOARD', x + 20, 124, 17, PALETTE.gold, '700');
    label('tap a ticket to switch', x + 282, 124, 11, PALETTE.muted, '500', 'right');
    ORDERS.forEach((order, i) => ticket(order, x + 12, 142 + i * 148, 278, state, order.id === state.orderId));
  }

  function tile(ing, x, y, state) {
    const plated = state.plated.includes(ing.id);
    roundRect(x, y, 168, 106, 14,
      plated ? 'rgba(143,208,168,0.18)' : 'rgba(255,255,255,0.07)',
      plated ? PALETTE.mint : 'rgba(255,255,255,0.16)', plated ? 2.5 : 1.5);
    ingredientIcon(ing.id, x + 84, y + 42, 66);
    label(ing.label, x + 84, y + 89, 14, PALETTE.ink, '600', 'center');
    roundRect(x + 8, y + 8, 26, 22, 7, 'rgba(244,184,96,0.22)');
    label(ing.key, x + 21, y + 24, 12, PALETTE.gold, '700', 'center');
    if (plated) {
      ctx.fillStyle = PALETTE.mint;
      ctx.beginPath(); ctx.arc(x + 152, y + 18, 9, 0, Math.PI * 2); ctx.fill();
      label('✓', x + 152, y + 22, 12, '#1b1726', '700', 'center');
    }
    region(x, y, 168, 106, 'ingredient', ing.id);
  }

  function prep(state) {
    const ticketOrder = orderById(state.orderId);
    const x = 350;
    roundRect(x, 402, 556, 222, 16, 'rgba(27,23,38,0.72)', 'rgba(244,184,96,0.22)', 2);
    label('PREP STATION', x + 20, 430, 16, PALETTE.gold, '700');
    // Pan and flame: the dish being cooked before it reaches the plate.
    ctx.fillStyle = '#17131d';
    ctx.beginPath(); ctx.ellipse(470, 508, 86, 30, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#8c7a83'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.ellipse(470, 496, 86, 30, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = PALETTE.coral;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(470 + i * 26, 548);
      ctx.quadraticCurveTo(462 + i * 26, 522, 470 + i * 26, 508);
      ctx.quadraticCurveTo(478 + i * 26, 522, 470 + i * 26, 548);
      ctx.fill();
    }
    const cooking = ticketOrder.needs.find((id) => !state.plated.includes(id)) ?? ticketOrder.needs[0];
    ingredientIcon(cooking, 470, 486, 74);
    label(`Cooking ${byId(cooking).label}`, 470, 566, 15, PALETTE.ink, '600', 'center');

    const done = ticketOrder.needs.filter((id) => state.plated.includes(id)).length;
    label(`${done} / ${ticketOrder.needs.length} plated`, 590, 452, 16, PALETTE.mint, '700');
    label(ticketOrder.note, 590, 480, 14, PALETTE.muted, '500');
    ticketOrder.needs.forEach((id, i) => chip(id, 590 + (i % 2) * 144, 494 + Math.floor(i / 2) * 40, 136, state.plated.includes(id)));
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.fillRect(590, 588, 288, 10);
    ctx.fillStyle = done === ticketOrder.needs.length ? PALETTE.good : PALETTE.gold;
    ctx.fillRect(590, 588, 288 * (done / ticketOrder.needs.length), 10);
    label(done === ticketOrder.needs.length ? 'PLATE COMPLETE — SERVE IT' : 'Add the ticket ingredients to the plate',
      734, 574, 13, done === ticketOrder.needs.length ? PALETTE.good : PALETTE.muted, '600', 'center');
  }

  function timerRing(state) {
    const cx = 1088;
    const cy = 216;
    const r = 54;
    const ratio = Math.max(0, Math.min(1, state.timer / state.maxTimer));
    ctx.lineWidth = 10;
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = ratio < 0.3 ? PALETTE.bad : PALETTE.gold;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio); ctx.stroke();
    ctx.lineCap = 'butt';
    label(`${Math.ceil(state.timer)}s`, cx, cy + 10, 34, PALETTE.ink, '700', 'center');
    label('SERVE TIMER', cx, cy + 34, 11, PALETTE.muted, '600', 'center');
  }

  function plateOfIngredients(ids, cx, cy, rx, ry) {
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath(); ctx.ellipse(cx, cy + 10, rx + 8, ry + 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PALETTE.plate;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = PALETTE.plateRim; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx - 12, ry - 12, 0, 0, Math.PI * 2); ctx.stroke();
    ids.forEach((id, i) => {
      const angle = -Math.PI / 2 + (i * Math.PI * 2) / Math.max(3, ids.length);
      const px = cx + Math.cos(angle) * rx * 0.42;
      const py = cy + Math.sin(angle) * ry * 0.42;
      ingredientIcon(id, px, py, 62);
    });
  }

  function plating(state) {
    const x = 924;
    roundRect(x, 92, 328, 532, 16, PALETTE.board, 'rgba(244,184,96,0.35)', 2);
    label('PLATING STATION', x + 18, 124, 17, PALETTE.gold, '700');
    timerRing(state);
    plateOfIngredients(state.plated, 1088, 386, 128, 86);
    const ticketOrder = orderById(state.orderId);
    const complete = ticketOrder.needs.every((id) => state.plated.includes(id)) && state.plated.length === ticketOrder.needs.length;
    roundRect(972, 460, 232, 38, 19,
      complete ? 'rgba(156,227,176,0.20)' : 'rgba(255,255,255,0.06)',
      complete ? PALETTE.good : 'rgba(255,255,255,0.16)', 1.5);
    label(complete ? 'READY TO SERVE' : `${state.plated.length} / ${ticketOrder.needs.length} ON THE PLATE`,
      1088, 484, 15, complete ? PALETTE.good : PALETTE.muted, '700', 'center');
    roundRect(976, 512, 224, 56, 12, complete ? PALETTE.gold : 'rgba(244,184,96,0.25)',
      PALETTE.gold, 2);
    label('SERVE  ·  SPACE', 1088, 545, 18, complete ? '#241b2c' : PALETTE.gold, '700', 'center');
    region(976, 512, 224, 56, 'serve');
    roundRect(976, 580, 224, 34, 10, 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.16)');
    label('UNDO  ·  BACKSPACE', 1088, 602, 13, PALETTE.muted, '600', 'center');
    region(976, 580, 224, 34, 'undo');
  }

  function cookScene(state) {
    wall();
    counter();
    topBar(state);
    board(state);
    const x = 350;
    roundRect(x, 92, 556, 300, 16, 'rgba(27,23,38,0.62)', 'rgba(244,184,96,0.22)', 2);
    label('COUNTER', x + 20, 124, 17, PALETTE.gold, '700');
    label('tap a tile or press its key', x + 536, 124, 11, PALETTE.muted, '500', 'right');
    INGREDIENTS.forEach((ing, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      tile(ing, 354 + col * 184, 146 + row * 122, state);
    });
    prep(state);
    plating(state);
    bottomBar(state);
  }

  function titleScene(state) {
    wall();
    counter();
    ctx.fillStyle = 'rgba(16,13,22,0.45)';
    ctx.fillRect(0, 0, W, H);
    label('CULINARY SOLSTICE', 640, 148, 62, PALETTE.gold, '800', 'center');
    label('Five tickets. Three hearts. Plate it right before the timer runs dry.',
      640, 198, 21, PALETTE.ink, '500', 'center');
    ORDERS.forEach((order, i) => {
      const x = 158 + i * 336;
      roundRect(x, 250, 300, 270, 18, PALETTE.board, order.color, 2.5);
      label(order.chef.toUpperCase(), x + 150, 284, 13, order.color, '700', 'center');
      label(order.label, x + 150, 322, 24, PALETTE.ink, '700', 'center');
      ingredientIcon(order.needs[0], x + 150, 384, 92);
      order.needs.forEach((id, j) => chip(id, x + 24 + j * 92, 444, 86, false));
      label(`${order.time}s to serve`, x + 150, 502, 14, PALETTE.muted, '500', 'center');
    });
    roundRect(410, 568, 460, 58, 16, PALETTE.gold);
    label('PRESS SPACE OR CLICK TO START', 640, 604, 21, '#241b2c', '800', 'center');
    region(410, 568, 460, 58, 'start');
    label(`BEST SHIFT  ${state.best}`, 640, 664, 16, PALETTE.muted, '600', 'center');
    label('A B C of cooking: read the ticket, plate the ingredients, serve on time.',
      640, 698, 13, PALETTE.muted, '500', 'center');
  }

  function servedScene(state) {
    const result = state.result;
    wall();
    counter();
    ctx.fillStyle = 'rgba(16,13,22,0.55)';
    ctx.fillRect(0, 0, W, H);
    label('ORDER SERVED', 640, 116, 54, PALETTE.good, '800', 'center');
    label(`${result.ticket.label}  ·  ${result.ticket.chef}`, 640, 158, 20, PALETTE.ink, '600', 'center');
    plateOfIngredients(result.ticket.needs, 640, 330, 210, 124);
    roundRect(440, 472, 400, 56, 14, 'rgba(244,184,96,0.16)', PALETTE.gold, 2);
    label(`+${result.gained} POINTS`, 640, 508, 30, PALETTE.gold, '800', 'center');
    label(`Speed bonus +${result.speed}    ·    Streak x${result.multiplier.toFixed(2)}`,
      640, 558, 17, PALETTE.muted, '500', 'center');
    label(`SHIFT SCORE  ${state.score}    ·    ${state.servedCount} / ${SHIFT_LENGTH} TICKETS`,
      640, 600, 18, PALETTE.ink, '700', 'center');
    roundRect(430, 626, 420, 52, 14, PALETTE.gold);
    label(state.servedCount >= SHIFT_LENGTH ? 'SEE THE SHIFT RESULT' : 'NEXT TICKET  ·  SPACE',
      640, 658, 20, '#241b2c', '800', 'center');
    region(430, 626, 420, 52, 'next');
  }

  function finalScene(state) {
    wall();
    ctx.fillStyle = 'rgba(16,13,22,0.68)';
    ctx.fillRect(0, 0, W, H);
    const won = state.servedCount >= SHIFT_LENGTH;
    label(won ? 'SHIFT COMPLETE' : 'KITCHEN CLOSED', 640, 150, 58,
      won ? PALETTE.gold : PALETTE.coral, '800', 'center');
    label(won ? 'Every ticket served. The kitchen is yours.' : 'Three mistakes and the kitchen closes.',
      640, 202, 20, PALETTE.ink, '500', 'center');
    plateOfIngredients(ORDERS[0].needs, 640, 372, 180, 104);
    label(`${state.score} POINTS`, 640, 522, 40, PALETTE.gold, '800', 'center');
    label(`Tickets ${state.servedCount} / ${SHIFT_LENGTH}    ·    Best streak x${state.bestCombo}    ·    Best shift ${Math.max(state.best, state.score)}`,
      640, 570, 18, PALETTE.muted, '500', 'center');
    roundRect(430, 604, 420, 54, 14, PALETTE.gold);
    label('COOK ANOTHER SHIFT  ·  SPACE', 640, 637, 20, '#241b2c', '800', 'center');
    region(430, 604, 420, 54, 'start');
  }

  function draw(state) {
    regions = [];
    resize();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    if (state.screen === COOK) cookScene(state);
    else if (state.screen === SERVED) servedScene(state);
    else if (state.screen === FINAL) finalScene(state);
    else titleScene(state);
  }

  function hitTest(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) - view.x) / view.scale;
    const y = ((clientY - rect.top) - view.y) / view.scale;
    const hit = regions.find((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
    return hit ? { type: hit.type, value: hit.value } : null;
  }

  resize();
  window.addEventListener('resize', () => resize());
  return { draw, hitTest };
}
