# Plan — Publishing mini-games (independent, cloud-hosted, tester-gated)

> **STATUS (June 21 2026): INFRA STARTED, FEATURE BUILD BEGUN.** Design agreed
> (this doc). Scope of the first deliverable: **simple publish for NAMED
> mini-games only**, served from **mathgrain.com** behind **per-tester
> email/password logins**. No telemetry yet (bundle is stamped so telemetry can
> attach later).
>
> **Infra progress (Firebase project `vica-domino`, Spark/free):**
> - ✅ **Auth** — Email/Password enabled; 3 tester accounts created
>   (victor49@gmail.com, drkofman@gmail.com, lianacalc@gmail.com).
> - ✅ **DNS** — mathgrain.com (GoDaddy) pointed at Firebase Hosting:
>   `A @ → 199.36.158.100`, `TXT @ → hosting-site=vica-domino`; old parking A
>   records removed; no forwarding.
> - 🟡 **Domain verify** — TXT detected ✓, A record propagating (up to 24h). SSL
>   auto-issues on verify → status flips to **Connected**. Re-click **Verify** in
>   the Firebase Hosting → Custom Domains list until green.
> - ⬜ **Deploy site files** — later, via **browser Cloud Shell** (no local CLI;
>   the Mac is unusable for this — wrong Google account). Not needed until the
>   gallery page exists.
> - ⬜ **Firestore rules** for `published/*` (authed-read / superuser-write).
> - ⬜ **Feature code** — bundler + Pub button + gallery + player (IN PROGRESS).

Read alongside `docs/CATCH_MINIGAMES_PLAN.md` (the prior contract-style plan) and
`docs/STATUS_NOTES.md`.

---

## Goal (Victor, June 21 2026)
Let me **publish** a named mini-game so it can "live" independently in the cloud
**without any connection to Studio or the Game Previewer**. A published game must
not change when the rest of the program changes ("simply published" = frozen).
A small set of **testers** I invite (each with their own email/password login)
open **mathgrain.com**, see a page listing every published mini, click one, and
play the board — full board functionality, **no roles shown, no authoring UI**.

Later (separate phase): **advanced publishing** = the game sends play-data back
(who played, how many games, time, which problems/roles were hard) so I can tune
the game — by hand first, automatically later. NOT in this deliverable; we only
stamp the bundle so it can be added without rework.

---

## Two tiers (build the first; design for the second)
- **Simple publish (THIS deliverable):** one-way, immutable snapshot of one named
  mini-game → written to the publishing location → playable by logged-in testers.
  No data comes back.
- **Advanced publish (LATER):** adds a telemetry back-channel + aggregation +
  tuning. The seam between tiers: *simple = write the game out; advanced = read
  play-data back.* Per-tester logins (below) are the identity layer advanced
  telemetry needs, so building real auth now means no rework later.

---

## Decisions locked in this discussion
| Topic | Decision |
|---|---|
| What can be published | **NAMED (saved) mini-games only** — NOT the "Default (this game's configuration)" row. |
| Trigger UI | A new **"Pub"** button on each named mini-game row in the mini-games panel (joins ⚙ ✎ ✗). |
| Independence model | **A — snapshot + pinned engine** (not a standalone single-file player). See "Independence" below. |
| What's frozen into the bundle | All card **art inlined**; full **config** (shape / IC / colors / Catch settings / probabilities / level / value groups); **role data kept but NOT displayed**. |
| Roles | Author-only. The reviewer's board shows **cards + full board functionality**, **no role labels, no authoring chrome**. Role data still travels in the bundle (unrendered) for future telemetry. |
| Hosting | **Firebase Hosting** (Spark / free plan) on **mathgrain.com**. Domain stays at **GoDaddy** (registrar); only DNS records point at Firebase. |
| Auth | **Firebase Auth email/password**, **per-tester accounts** (each tester own login). |
| Tester scope | Tester role can **only read/play `published/*`** — nothing else (no game library, no editing). |
| Cloud location | A new **public-to-authed-testers** collection, e.g. `published/<id>`. |
| Telemetry | **None now.** Bundle stamps `publishId`, `version`, `publishedAt`, source ref — enough for later analytics to attach. |
| Cost | **$0** at this scale (Spark free tier covers hosting + custom domain + SSL + auth + Firestore reads). Blaze only if usage grows large. |

---

## Independence: model A (chosen) vs B (deferred)
- **A — snapshot + pinned engine (CHOSEN).** Publish writes the game **data**
  (art inlined, config frozen) plus an `engineVersion` stamp (the existing
  cache-buster, e.g. `biggame-flow-9`). The published game still runs on the
  shared engine hosted at mathgrain.com, but the **pinned** version. Small
  artifact, reuses 100% of the existing player/HUD/device/Catch runtime.
  "Independent" = *the pinned engine version is retained and hosted.*
- **B — frozen standalone single-file player (DEFERRED).** One self-contained
  HTML file (engine + CSS + data + art inlined) that runs anywhere with zero
  reference to the project. Truer immutability/portability, but heavy to build
  (must extract a clean minimal player out of `game.js` + `index.html`) and each
  file carries its own engine copy.
- **Shared foundation:** both start from the SAME published bundle (inlined art +
  frozen config + version stamp). A *serves* the bundle through the existing
  player; B later *wraps* bundle+engine into one file. So choosing A now does not
  block B later.

---

## The bundle (the publish artifact)
A published mini-game = a self-describing JSON document. Sketch (names TBD on day 1):
```
published/<publishId> = {
  publishId,                 // unguessable id (also the doc id)
  version,                   // bundle/schema version
  engineVersion,            // pinned engine cache-buster, e.g. "biggame-flow-9"
  publishedAt,              // timestamp
  source: { gameType, gameIndex, miniGameId, name },  // where it came from (author-side)
  display: {                // everything the board renders
    name,                   // shown to tester
    gameType,               // 'find' | 'catch' | 'combined'
    legend,                 // the mini-game's chosen configuration (level/prob/timer/typeId/...)
    setup,                  // value groups, probOptions, shape/corner/scale, IC dominos, catch* fields
    cards: [ { ...card, artInline } ],  // EVERY card with its art resolved + inlined (dataURL/SVG)
    roles: { ... },         // role data — CARRIED but NOT rendered
    colors, roleVocabulary  // only what this game uses
  }
}
```
**The hard/risky part = `cards[].artInline`.** Today a game references art by
`stableId`/`uid`; the real pictures live in the card SETS (`savedCardSets`,
`customDrawnCards_*`, `abcCardSnapshot`, builtin sets). Publishing must **walk
every card, resolve its art across all sets, and inline it.** This is the exact
machinery that surfaced the "dangling ref" bug (card art that lives in no set) —
so the bundler must **fail loudly / mark empty** on an unresolved card rather than
ship a blank.

---

## UI flow (author side — the mini-games panel)
The panel lives in `index.html` (`addItem`, ~line 1671–1704), opened from GP 0.
Named mini-game rows already render ⚙ ✎ ✗ when `savedIdx != null` — add **Pub**
there.
- **Pub (not yet published):** build the bundle → write `published/<id>` → store
  the returned `publishId` on the mini-game record (`game.miniGames[i].publishId`)
  → show a confirmation with the link.
- **Pub (already published) becomes stateful:** offers **Copy link · Re-publish
  (update) · Unpublish**.
  - **Re-publish:** rebuild the bundle, overwrite the **same** `publishId` so the
    tester's link always shows the latest. (Multi-version history = later.)
  - **Unpublish:** delete `published/<id>` from the cloud. The link goes dead.
- **Two deletes, two meanings:** **✗** deletes the editable source mini-game;
  **Pub → Unpublish** deletes the frozen public copy. They are independent — by
  design, deleting the source does NOT remove a published copy.
- This is a **Big-Game-session** feature (touches `index.html` + `js/sync.js`),
  even though Studio authors the mini-games.

---

## Front-end (tester side — the "mini" gallery on mathgrain.com)
Interim, before a full website:
1. Tester visits **mathgrain.com** → **login** (Firebase Auth email/password).
2. After login, a **gallery page** lists **every published mini** (reads
   `published/*`). Each entry = name + a Play action.
3. Click → the **published player** boots straight into the board: full board
   functionality, **no roles, no authoring chrome**, no GP 0 navigation. Runs on
   the pinned engine with the inlined bundle.
- Entry point sketch: `mathgrain.com/?playPublished=<id>` (or a dedicated player
  page). Gallery can grow into a real site later.

---

## Auth model — what exists vs what's needed
- **Today: name-only, NO passwords.** `window.syncLogin(userId)` (js/sync.js:328)
  takes a name; `SUPERUSERS = ['Vica']` (js/firebase-config.js) → superuser can
  edit; everyone else is auto `player-guest` reading the shared library. Honor
  system; data keyed by `users/{name}`.
- **Needed: real Firebase Auth email/password.** New **tester** role:
  authenticates, can **only read `published/*`**. Does NOT touch the superuser
  `users/{name}` game library. Enforced by **Firestore security rules**
  (tester = authed → read `published/*`; superuser → write `published/*`).
- This per-tester identity is also the foundation for advanced-publish telemetry.

---

## Hosting + domain setup (Firebase Hosting + GoDaddy)
Plan = Spark (free). Steps (✋ = needs Victor's accounts; 🤖 = Claude can prepare):
1. 🤖 Add `firebase.json` + `.firebaserc` (Hosting config; serve the app statics).
2. ✋ Firebase CLI: `firebase login` (Victor's Google account) → `firebase deploy`.
3. ✋ Firebase console → Hosting → **Add custom domain** → `mathgrain.com` →
   Firebase returns a **TXT** (ownership) + **two A records** (IPs).
4. ✋ GoDaddy → **DNS Management** for mathgrain.com → paste the TXT + A records.
5. Firebase auto-provisions **SSL**; site live at `https://mathgrain.com`
   (propagation up to a few hours).
6. ✋ Firebase console → Authentication → enable **Email/Password**; create the
   per-tester accounts (or 🤖 build a small "create tester" admin screen).
7. 🤖 Write **Firestore security rules** for `published/*` (authed-read,
   superuser-write) and deploy them.
- Domain is **not transferred** — it stays at GoDaddy; only DNS points at Firebase.

---

## Cost (confirmed in discussion)
- **Spark (free) plan covers it:** Hosting + custom domain + free SSL + Auth
  email/password + Firestore reads, all within generous free quotas (Firestore
  ~50k reads/day; Hosting ~10GB storage / ~360MB/day transfer; Auth effectively
  free for thousands of users). **A few testers → $0.**
- **Blaze (pay-as-you-go)** only if usage exceeds free quotas, or if advanced
  telemetry later needs **Cloud Functions** (Functions require Blaze even within
  free quotas). Simple publish needs no Functions → Spark is enough. Verify
  current pricing in the console at setup time.

---

## Recommended build order
1. **Agree bundle field names** (the `published/<id>` schema above) — day 1.
2. **Bundler** (author side): resolve + inline all card art, freeze config, stamp
   `publishId`/`version`/`engineVersion`/`publishedAt`. Fail loudly on unresolved
   art. Verify against a known mini-game (e.g. a "fast"/"voice" mini under Match
   0-4) that every card's picture is inlined.
3. **Cloud write + rules:** `published/*` collection + Firestore security rules
   (authed-read / superuser-write).
4. **Pub button + state** in the mini-games panel (Pub / Copy link / Re-publish /
   Unpublish; store `publishId` on the mini-game record).
5. **Auth:** Firebase Email/Password + tester role + login UI.
6. **Gallery + published player** at mathgrain.com (list `published/*`, launch the
   board with no roles / no authoring chrome, pinned engine).
7. **Hosting/domain:** firebase.json → deploy → custom domain → GoDaddy DNS → SSL.
8. **Test end-to-end:** Victor publishes a mini → a tester logs in at
   mathgrain.com → sees it in the gallery → plays the board (no roles) →
   Unpublish makes it disappear.

---

## Open / deferred
- **Advanced publishing** (telemetry back-channel + aggregation + tuning) — its own
  plan; only the bundle stamp is prepared now.
- **Model B** (standalone single-file player) — deferred; bundle is structured so
  it can wrap later.
- **Big Games** publishing — later; harder (must FREEZE each stage + its
  transitions inline, since stages today resolve their legend LIVE from the source
  mini-game).
- **Transitions library** — separate feature (Studio authors the library;
  Big-Game session assigns + plays). Store transitions as condition→transition
  **rules** (round-count is just the first condition). Does not block publishing.
- **Multi-version history** of a published game (vs the current overwrite-same-id).
- **DNS specifics** for GoDaddy — exact records produced by the Firebase console at
  setup time.
