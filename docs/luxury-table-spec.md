# Luxury Tabletop: Architecture & Specification

## 1. Game Design & Core Visual Architecture
The core experience shifts to a premium "Luxury Casino" aesthetic. The entire main viewport will become an expansive, high-quality felt table.
- **Main Viewport:** A rich, uncluttered luxury felt tabletop providing maximum area for coins. 
- **Secondary Modals/Drawers:** To maintain the premium, clean look of the main table, all upgrades, menus, and stats are moved into clean, slide-out secondary drawers or modals. This prevents UI clutter and keeps focus on the physical coin action.

## 2. Realistic Coin Physics & Table Dynamics
Coins are no longer just abstract flip results; they have a physical presence on the luxury table.
- **Persistent Table Presence:** When flipped, coins land and stay on the table.
- **Realistic Settle & Wobble:** Instead of immediately disappearing or stopping rigidly, coins experience realistic wobble and slow settling animations as they lose momentum.
- **Slight Displacement:** Coins displace slightly upon landing, bumping into other coins gently rather than violent scattered bouncing. This creates an accumulating pile of wealth on the table over time.

## 3. Core Upgrades & Progression Mechanics
The upgrade systems will be accessed via the slide-out drawers.
- **Auto Flipper:** Automates the flipping process, tossing coins onto the table at a set interval.
- **Better Coins:** Upgrades the material tier of the coins (e.g., Bronze -> Silver -> Gold -> Platinum). This introduces a value multiplier to each flip based on the material tier.
- **Global Multipliers:** Broad upgrades that affect all income, such as doubling the value of every flip across the board.
