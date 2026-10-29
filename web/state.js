const CITIES = [
  { name: 'Rusty Alley', desc: 'Starting from the bottom.', modifier: 1 },
  { name: 'Wall Street', desc: 'High-frequency market events (Burst Income).', modifier: 1.5 },
  { name: 'Monte Carlo', desc: 'Casino bonuses (Increases Gamble Cap & Lucky Edge).', modifier: 2.0 },
  { name: 'Tokyo Cyber-District', desc: 'Cyber dividends (Passive crypto income).', modifier: 3.0 },
  { name: 'Geneva Vault', desc: 'Compound interest (Offline/idle gains).', modifier: 5.0 }
];

const ALCHEMY_TIERS = [
  { id: 'silver', name: 'Silver Alchemy', cost: 100, multiplier: 5, mat: 'Silver' },
  { id: 'gold', name: 'Gold Alchemy', cost: 5000, multiplier: 50, mat: 'Gold' },
  { id: 'platinum', name: 'Platinum Alchemy', cost: 100000, multiplier: 500, mat: 'Platinum' },
  { id: 'crypto', name: 'Crypto Node', cost: 2500000, multiplier: 2500, mat: 'Crypto' },
  { id: 'quantum', name: 'Quantum Forging', cost: 1e8, multiplier: 10000, mat: 'Quantum' }
];

const APPARATUS = [
  { id: 'velvetMat', name: 'Velvet Mat', desc: 'Reduces bounce, speeding up flips.', baseCost: 50 },
  { id: 'magneticTable', name: 'Magnetic Table', desc: '20% chance to flip tails into heads.', baseCost: 1000 },
  { id: 'heavyTungsten', name: 'Heavy Tungsten Coin', desc: 'Increases base payout but slows frenzy.', baseCost: 5000 }
];

const AUTOMATION = [
  { id: 'streetPerformer', name: 'Street Performer', desc: 'Flips coin for you (1/sec).', baseCost: 200, r: 1.15, rate: 1 },
  { id: 'clockwork', name: 'Clockwork Flipper', desc: 'Mechanical flipper (5/sec).', baseCost: 2000, r: 1.15, rate: 5 },
  { id: 'hftDesk', name: 'HFT Trading Desk', desc: 'High-frequency flips (50/sec).', baseCost: 50000, r: 1.15, rate: 50 },
  { id: 'quantumMulti', name: 'Quantum Multiverse', desc: 'Flips in parallel universes (500/sec).', baseCost: 1e6, r: 1.15, rate: 500 }
];

const DOMINATION = [
  { id: 'landmarks', name: 'Landmarks', items: ['Statue of Liberty', 'Eiffel Tower', 'Tokyo Tower'], cost: 1e9, tokenCost: 5 },
  { id: 'banks', name: 'Central Banks', items: ['Federal Reserve', 'Bank of England'], cost: 1e12, tokenCost: 10 },
  { id: 'continents', name: 'Continents', items: ['Oceania', 'Europe', 'Americas', 'Asia'], cost: 1e15, tokenCost: 20 }
];

let gameState = {
  gold: 0,
  totalFlips: 0,
  lifetimeGold: 0,
  currentStreak: 0,
  streakRecord: 0,
  citiesVisited: 0,
  influenceTokens: 0,
  currentCityIndex: 0,
  baseCoinValue: 1,
  multiplier: 1,
  luckyEdgeChance: 0.01,
  flipDurationModifier: 1, // Influenced by table mat
  gambleCap: 100,
  autoFlippers: 0,
  frenzy: 0,
  frenzyMultiplier: 1,
  isGoldRush: false,
  
  // Upgrade levels
  upgrades: {
    alchemy: 0, // 0 = Copper, 1 = Silver, etc.
    velvetMat: false,
    magneticTable: false,
    heavyTungsten: false,
    
    // Automation counts
    streetPerformer: 0,
    clockwork: 0,
    hftDesk: 0,
    quantumMulti: 0
  },
  
  // Prestige 2
  landmarksOwned: 0,
  banksOwned: 0,
  continentsOwned: 0
};

const SAVE_KEY = 'coinFlipperDominationSave';

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
}

function loadGame() {
  const save = localStorage.getItem(SAVE_KEY);
  if (save) {
    try {
      const parsed = JSON.parse(save);
      // Merge with default state to prevent missing keys
      gameState = { ...gameState, ...parsed };
      gameState.upgrades = { ...gameState.upgrades, ...(parsed.upgrades || {}) };
      updateCoinMaterialFromState();
    } catch(e) {
      console.error("Failed to load save", e);
    }
  }
}

function exportGame() {
  const b64 = btoa(JSON.stringify(gameState));
  prompt("Copy your save code:", b64);
}

function importGame() {
  const b64 = prompt("Paste your save code:");
  if (b64) {
    try {
      const parsed = JSON.parse(atob(b64));
      gameState = { ...gameState, ...parsed };
      gameState.upgrades = { ...gameState.upgrades, ...(parsed.upgrades || {}) };
      updateCoinMaterialFromState();
      saveGame();
      location.reload();
    } catch (e) {
      alert("Invalid save code.");
    }
  }
}

function updateCoinMaterialFromState() {
  if (gameState.upgrades.alchemy === 0) updateCoinMaterial('Copper');
  else updateCoinMaterial(ALCHEMY_TIERS[gameState.upgrades.alchemy - 1].mat);
}
