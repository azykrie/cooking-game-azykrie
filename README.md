# cooking-game-azykrie

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/azykrie/cooking-game-azykrie/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/azykrie/cooking-game-azykrie/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Culinary Solstice is an original browser cooking game built from plain static files — the game lives entirely under `game/`, loads offline with no network request, and runs in a desktop browser with `node serve.ts`. Pick one of three tickets, plate exactly the ingredients it asks for, and serve before the timer runs dry. A wrong plate costs a heart and three seconds; a decoy chili tile punishes careless plating. Speed and unbroken streaks pay a bonus, and five tickets make one shift. The scene shows the order board, the ingredient counter, a dish cooking on the prep station, the serve timer and a ready-to-serve plate at a glance.

Controls: `1 2 3` pick a ticket, `A S D F G H` add an ingredient, `Backspace` undo, `Space` serve. Keyboard and mouse both work.

## Files

`game/src/config.js` holds recipes and tuning, `world.js` the rules, `render.js` the drawing and click targets, `input.js` the events, and `main.js` the loop. `main.ts` assembles the hand-in with the kit's vendored dossier library.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

To assemble the entry locally: `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`.

The 4 screenshots in `screenshots/` (first by name = cover, 1280×800) are real browser captures of the game's own `?shot=` scenes: `1-cover.jpg` the plated fish ready to serve, `2-play.jpg` a rice order mid-assembly, `3-served.jpg` the served result, and `4-title.jpg` the title screen. `main.ts` copies `game/` and `screenshots/` into `/output` and writes `/output/dossier.json` with the vendored make.fun library.

---

<sub>Entered on [make.fun](https://make.fun/?ref=azykrie&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
