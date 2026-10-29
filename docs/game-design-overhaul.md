# Game Design & Technical Overhaul Document
**Project:** Coin Flipper Incremental
**Role:** ARCHITECT

## 1. Visual Art Direction & UI/UX System ("Casino Noir / Luxury Financial Sovereign")

The previous slate-box aesthetic is being replaced by a highly polished, luxury-driven experience. The visual language aims to evoke a high-stakes, exclusive underground financial empire.

### Color Palette & Design Tokens
*   **Background:** Deep obsidian (`#0a0a0f`) for a void-like, intense foundation.
*   **Accents:** Brushed gold (`#d4af37`, `#f59e0b`) to symbolize wealth and tier upgrades.
*   **Success/Win Glows:** Emerald green (`#10b981`) for positive feedback, specifically on successful gambles or milestone hits.
*   **Risk/Loss Elements:** Crimson (`#ef4444`) to signal danger or loss during high-stakes actions.
*   **Surfaces:** Glassmorphism—translucent panels with subtle, frosted borders to maintain depth without cluttering the screen.

### Typography & Layout Hierarchy
*   **Headers:** Distinctive luxury fonts (e.g., *Playfair Display* or *Cinzel*) for section titles and prestige mechanics.
*   **Numerics:** Monospace fonts (e.g., *Space Mono* or *Roboto Mono*) for financial figures, utilizing strict comma separators for readability as numbers scale exponentially.
*   **Layout:** A compact 3-column architecture:
    *   **Left Column (Input/Upgrades):** Coin Alchemy & Table Apparatus (click upgrades, basic automation).
    *   **Center Column (Action/Feedback):** 3D Canvas Coin display & Frenzy Gauge.
    *   **Right Column (Macro/Meta):** Automation Empire & Geopolitical Conquest (tier 1 & 2 prestige mechanics).

### Canvas 2.5D Coin Rendering & Physics
*   **Rendering:** Move from flat CSS to a 2.5D Canvas representation. Implement 3D perspective shading with rim thickness and dynamic specular light glints that follow mouse position or rotation angle.
*   **Physics:** A micro-wobble effect upon landing, using an exponential decay dampening formula.
*   **Design:** Embossed glyphs for Heads/Tails that react to the lighting model.

### Visual Juice & Particle Systems
*   **Wins:** Dynamic coin showers and cascading particle effects.
*   **Interactions:** Click burst sparks at the cursor location.
*   **Feedback:** Floating payout numbers that rise with an ease-out physics curve and fade out.
*   **Frenzy Mode:** Screen shake and subtle vignette flashing when the Frenzy gauge maxes out.

---

## 2. Acoustic Physical Synthesis Model (Procedural Web Audio API)

Discarding primitive beeps, the game will use procedural synthesis via the Web Audio API to simulate actual physical properties of different coin materials and interactions.

### Physical Synthesis Equations
*   Model realistic metallic disc vibrations using harmonic ratios: $f_0$, $1.593 \times f_0$, $2.135 \times f_0$, and $2.653 \times f_0$. Apply high-frequency damping to simulate material density.

### Material Acoustic Signatures
*   **Copper:** Warm, dull, low-frequency clack (~1200Hz) with rapid decay.
*   **Silver:** High ringing clink (~3200Hz) with clear metallic sustain.
*   **Gold:** Rich, resonant ring (~2600Hz) featuring a warm multi-mode sustain.
*   **Platinum:** Crystalline shimmer (~4400Hz) with a long, bell-like decay.
*   **Quantum:** Modulated chorus chime featuring a detuned stereo spread for a sci-fi/otherworldly feel.

### Interaction Audio
*   **Table Landing:** A flutter algorithm generating successive micro-bounces with decreasing intervals and decaying volume as the coin settles on the table surface (felt, wood, or magnetic).
*   **Progression Audio:** Harmonic chord progressions for upgrades and achievements utilizing rich, warm jazz/lounge chords (e.g., Major 9ths) with soft attack envelopes to prevent ear fatigue over long play sessions.

---

## 3. Progression Math & Addictive Gameplay Loops

### Pacing & Economy
*   **Early Game Dopamine:** Focus on tactile gratification. High-frequency click combo streaks and rapid early milestone unlocks to hook the player immediately.
*   **Rebalanced Exponential Economy:** Calibrate cost curves strictly using $Cost = Base \times r^n$. Tier scaling factors must be rigorously tested to prevent stalling or runaway inflation before intended meta-game transitions.

### The "Frenzy" Gauge
*   Consecutive rapid flips build a Frenzy meter.
*   Reaching 100% triggers an 8-second **"GOLD RUSH"**.
*   **Gold Rush Effects:** 5x income multiplier, golden coin particle rain, and a tempo-boosted audio track.

### Non-Stat Unlocks
*   **High-Stakes Gamble Table:** Double-or-Nothing mechanics allowing players to hedge risk.
*   **Unique Coin Artifacts:** Items that alter mechanics rather than just boosting stats (e.g., Heavy Tungsten Coin increases base payout but slows frenzy building; Magnetic Coin automatically collects stray clicks; Bismuth Coin offers unpredictable, highly volatile payouts).

---

## 4. Multi-Layer Meta Architecture

The prestige system is deeply integrated into a narrative of rising financial dominance.

### Tier 1: City Relocation (Prestige)
Reset base progress for permanent multiplier traits tied to specific global cities:
*   **Wall Street:** High-frequency market event bonuses (random burst income).
*   **Monte Carlo:** Casino bonuses (buffs to the High-Stakes Gamble Table).
*   **Tokyo:** Cyber dividends (synergies with Automation tier upgrades).
*   **Geneva:** Compound interest (idle gains scale exponentially over time offline).

### Tier 2: World Domination
A long-term interactive geopolitical acquisition tree:
*   **Progression:** Landmarks $\rightarrow$ Central Banks $\rightarrow$ Continents $\rightarrow$ Global Monetary Hegemony.
*   Requires massive sacrifices of Tier 1 progress to achieve structural, game-altering paradigms.

---

## 5. Technical Architecture & Implementation Plan

### Codebase Restructuring (`web/`)
*   **State Management:** Decouple game state from UI. Create a robust store (e.g., `state.js`) to handle math, economy, and saving/loading safely.
*   **Audio Synthesis Module:** Encapsulate Web Audio API logic (`audio.js`) capable of handling procedural generation and multi-channel playback for Frenzy mode.
*   **Canvas Particle Engine:** A dedicated module (`renderer.js`) for the 2.5D coin, particles, and floating text physics.
*   **UI Binder:** Clean event listeners (`ui.js`) mapping DOM interactions to the state and triggering visual/audio juice.

### Implementation Milestones for BUILDER Sessions
1.  **Foundation:** Refactor `game.js` into modular files (`state.js`, `ui.js`, `audio.js`, `renderer.js`).
2.  **Aesthetics:** Implement the CSS design tokens and layout (obsidian, gold, glassmorphism, 3-column layout).
3.  **Canvas Engine:** Build the 2.5D coin rendering and physical bounce/wobble logic.
4.  **Audio Engine:** Implement the Web Audio API synthesis for the 5 coin materials and bounce flutters.
5.  **Juice & Frenzy:** Add particle systems, floating numbers, and the Frenzy Gauge logic/effects.
6.  **Economy & Meta:** Wire up the rebalanced math, Tier 1 (Cities), and Tier 2 (World Domination) prestige layers.
