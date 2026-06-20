# Data backups

Point-in-time snapshots of the user's localStorage game data, committed so they
survive any refactor (git history + the 3 canonical mirrors).

## savedCatchGames-2026-06-19.json
Exact copy of the `savedCatchGames` localStorage value on **June 19, 2026** —
4 self-contained Catch games (each embeds its own `cards`): **0-4 A**,
**Multiply by 4**, **x2 test**, **Test Dot** (62,273 bytes). Taken before any
"Catch the double" rework (the planned bubble-count / fall-timer settings).

### Restore (in the app's browser, DevTools console)
```js
// 1. Open the JSON file, copy its entire contents (it's one line).
// 2. Paste between the back-ticks below and run:
localStorage.setItem('savedCatchGames', `<paste file contents here>`);
location.reload();
```
The value is already in the exact format localStorage expects — no transform
needed. (A same-browser copy was also left in the `savedCatchGames_backupA`
localStorage key on the machine where the backup was taken.)

> Note: Catch games embed their cards, so this file alone fully restores them.
> The separate `customDrawnCards_*` card sets and `savedCustomGames` (Find games)
> are NOT in this backup — say so if you want those snapshotted too.
