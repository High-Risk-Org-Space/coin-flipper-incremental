# Gambler's Table: Architecture & Specification

## 1. Game Design & Core Loop Architecture
Inspired by "Gambler's Table," the core loop transitions from a single static coin flip to a dynamic, multi-coin tabletop experience. Players toss coins onto a felt table, where they bounce, collide, and settle. Heads earn cash, Tails earn nothing. The progression loop involves:
- **Active Play:** Tossing coins manually onto the table.
- **Passive Income:** "Little Helpers" automatically tossing coins.
- **Progression:** Earning cash to upgrade coins, purchase hats for helpers (buffs), and play the Slot Machine minigame.
- **Prestige:** "The Sacrifice" system, resetting progress for permanent Talent Tree upgrades.

## 2. Multi-Coin Physics Engine Specification
The existing 2.5D renderer will be expanded into a multi-coin 2D physics engine with 3D projection.
- **Tabletop Bounds:** A 2D rectangular area representing the felt table. Coins have $(x, y)$ positions and $(vx, vy)$ velocity vectors.
- **Cushions & Restitution:** Table edges act as bouncy cushions. Each coin type has a restitution coefficient affecting bounce height and speed loss on collisions.
- **Coin-on-Coin Collisions:** 2D circular collision detection. Upon intersection, coins exchange momentum based on mass and restitution.
- **3D Flip Animation:** Maintains the current $z$ (height) and rotation mechanics for 3D projection during flips, overlaid on the 2D tabletop movement.
- **Settle Detection:** When $z=0$, $vz \approx 0$, and rotational wobble ceases, the coin settles. The result (Heads/Tails) is evaluated, payouts awarded, and the coin fades/despawns to keep the table clear.

## 3. Little Helpers & Hat System Data Model
Replacing the abstract "auto flippers" with visual dealer assistants around the table.
- **Data Model:**
  - `Helper`: `{ id, position: {x, y}, baseInterval, currentTimer, animationState, equippedHat }`
- **Hat Inventory & Perks:**
  - `Dealer Visor`: +10% toss speed.
  - `High-Roller Top Hat`: +5% Heads probability.
  - `Cowboy Hat`: 10% chance for a "Critical Toss" (2x payout).
  - `Lucky Jester Cap`: Coin bounces 1 extra time (increases suspense/time on table, but maybe higher edge chance).
  - `Golden Crown`: +25% base payout on Heads.
- **Mechanic:** Helpers count down their `currentTimer` (modified by hat). On zero, they spawn a coin at their `position` with a random initial velocity towards the table center.

## 4. Advanced Coin Hierarchy & Mechanics
Coins have distinct physical and economic properties.
- **Standard Coin (Penny/Quarter):** Base mass (1.0), normal restitution (0.6), base payout.
- **Heavy Gold Bar/Coin:** High mass (3.0), low restitution (0.2). Plows through other coins, quick settle, 5x payout.
- **Casino Poker Chip:** Low mass (0.5), high restitution (0.9). Bounces wildly, slightly higher edge-land chance.
- **Bouncy Rubber Coin:** Mass (0.8), insane restitution (1.2 - gains height on first bounce). Takes long to settle, 2x payout.
- **Magnetic Coin:** Attracts nearby coins during flight (altering their trajectories).
- **Radioactive/Quantum Chip:** Unpredictable. Random mass and restitution per bounce. Payout formula based on total distance traveled before settling.

## 5. Side Table Slot Machine Specification
A playable minigame alongside the main table action.
- **Mechanics:** 3-reel slot. Costs cash to spin.
- **Symbols:** Cherries, BAR, 7, Coin, Crown.
- **Payout Table:** Traditional match-3 payouts, with a progressive Jackpot for 7-7-7.
- **RNG:** Weighted random selection for each reel stop.
- **Bonus Round:** "Free Spins" feature triggered by 3 Crowns, where every spin auto-tosses 10 Heavy Coins onto the main table.

## 6. The Sacrifice & Talent Tree Architecture
A prestige system replacing the current "Relocate City" mechanic.
- **The Sacrifice:** Reset all cash, helpers, and standard upgrades. Earn "Sacrifice Tokens" based on lifetime earnings (Formula: `Tokens = floor(sqrt(LifetimeCash / 1,000,000))`).
- **Talent Tree Graph:**
  - `Root:` Start
  - `Branch 1 (Helpers):` Base Speed -> Hat Effectiveness -> Extra Helper Slot
  - `Branch 2 (Physics):` Felt Friction Reduction -> Magnetism Range -> Quantum Stability
  - `Branch 3 (Economy):` Base Coin Multiplier -> Slot Luck -> Jackpot Multiplier
- **Cost Formula:** Progressively increasing cost per node depth.

## 7. Audio Engine Specs
Enhancing the Web Audio API modal synthesis.
- **Polyphony & Voice Pooling:** Since multiple coins will bounce simultaneously, implement a voice pool (e.g., 16-32 voices) to prevent audio context exhaustion.
- **Felt Landing Thuds:** Synthesize a low-pass filtered noise burst or low-frequency sine thump for coins landing on the felt table, distinct from metallic clinks.
- **Slot Sounds:** Synthesized mechanical reel clicks, electronic musical chimes for wins, and a polyphonic arpeggio for jackpots.
- **Spatial Audio (Optional):** Use `StereoPannerNode` based on the coin's `x` position on the table.

## 8. Technical Implementation Plan (For BUILDER)
1. **Refactor Renderer & Physics (web/renderer.js):**
   - Convert `coinState` from a single object to an array of active coins.
   - Implement 2D movement ($x, y, vx, vy$) and table boundaries.
   - Add $O(n^2)$ or spatial hash collision detection for coin-on-coin physics.
   - Update `renderLoop` to iterate and draw all coins.
2. **Implement Coin Data Models (web/game.js):**
   - Define the new coin types, their physical constants, and custom payout logic in `processFlipResult`.
3. **Build Little Helpers System (web/game.js & UI):**
   - Create the `Helper` class/objects and the timer tick logic (replacing `automationTick`).
   - Add UI/Renderer representation for helpers around the table edges.
   - Implement the Hat inventory and equip mechanics.
4. **Develop Slot Machine (web/game.js & HTML/CSS):**
   - Add a UI overlay or side panel for the slot machine.
   - Implement spinning logic, RNG evaluation, and payout distribution.
5. **Integrate Audio Enhancements (web/audio.js):**
   - Refactor `playClink` to use a voice pool.
   - Add new synthesized sounds (Felt Thud, Slot Spin, Slot Win).
6. **Implement The Sacrifice (web/game.js & UI):**
   - Create the prestige reset function.
   - Build the Talent Tree UI (HTML/CSS graph) and point allocation logic.
