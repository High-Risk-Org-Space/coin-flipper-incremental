# Coin Flipper: World Domination

A rich, web-deployed incremental clicker game written in Go with an interactive HTML5 Canvas / Web Audio frontend.

## Game Concept
- **Core Loop:** Click to flip a coin, earn gold, and build momentum with streaks and lucky flips.
- **Unique Unlocks:** Coin Alchemy (Felt mat, Magnetic tables, Quantum coins), automated flippers, high-frequency desks, and mini-game contracts.
- **Meta-Progression Layers:**
  - **Tier 1 (City Relocation):** Move from *Back-Alley* to *Wall Street*, *Monte Carlo*, *Tokyo Cyber-District*, and *Geneva Vault* to unlock city-specific passive perks.
  - **Tier 2 (Geopolitical Domination):** Buy continents, central banks, and global media to manipulate coin values.
  - **Tier 3 (Cosmic Mint):** Expand beyond Earth with asteroid mining and gravity-flip mechanics.

## Tech Stack
- **Backend:** Go (`net/http`) single-binary web server with embedded static assets (`embed.FS`).
- **Frontend:** HTML5, CSS3, 2.5D Canvas coin physics renderer, and procedural Web Audio API sound effects (no external audio assets required).
