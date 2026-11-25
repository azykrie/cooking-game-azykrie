# cooking-game-azykrie

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/azykrie/cooking-game-azykrie/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/azykrie/cooking-game-azykrie/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Culinary Solstice is an original browser cooking game built from plain static files — the game lives entirely under `game/`, loads offline with no network request, and runs in a desktop browser with `node serve.ts`. It is a complete game: an order board, ingredients and utensils on the counter, a dish assembled mid-cook, a timer, a ready-to-serve plate, plus a title screen, a cook screen, a served screen, and a best-score record.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

To assemble the entry locally: `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`.

The 3 screenshots in `screenshots/` (first by name = cover, in 1280×800) are real browser captures of the game's own `?shot=` scenes: `1-cover.jpg` the title screen, `2-play.jpg` the cooking/plating scene, and `3-served.jpg` the served screen. `main.ts` copies `game/` and `screenshots/` into `/output` and writes `/output/dossier.json` with the vendored make.fun library.

---

<sub>Entered on [make.fun](https://make.fun/?ref=azykrie&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
