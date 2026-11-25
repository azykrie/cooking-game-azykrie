// Hand-in for Culinary Solstice. The game itself is plain static files under game/, so a
// desktop browser loads it offline with no build step and no network request. This Node 22
// program copies game/ and screenshots/ into /output and writes /output/dossier.json with the
// kit's vendored makefun-game library. Serve the game with `node serve.ts` and open
// http://localhost:8080 to play it. Outside the grader's container, MAKEFUN_OUTPUT_DIR stands
// in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const output = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const game = join(here, 'game');
const shots = join(here, 'screenshots');

if (!existsSync(game)) throw new Error(`missing game directory: ${game}`);
if (!existsSync(shots)) throw new Error(`missing screenshots directory: ${shots}`);

mkdirSync(output, { recursive: true });
cpSync(game, join(output, 'game'), { recursive: true });
cpSync(shots, join(output, 'screenshots'), { recursive: true });

const dossier = buildDossier(output, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(output, 'dossier.json'), dossier);
console.log(`Culinary Solstice ready: ${output}/game, ${output}/screenshots, ${output}/dossier.json`);
