// --- Audio System ---
const AudioSystem = {
  ctx: null,
  muted: false,

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
  },

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  playWhoosh() {
    if (this.muted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    
    // Create white noise
    const bufferSize = this.ctx.sampleRate * 0.5; // 0.5s
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    // Filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.exponentialRampToValueAtTime(1200, t + 0.2);
    filter.Q.value = 1.5;
    
    // Envelope
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    noise.start(t);
    noise.stop(t + 0.5);
  },

  playClink(pitchMultiplier = 1) {
    if (this.muted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1500 * pitchMultiplier, t);
    osc.frequency.exponentialRampToValueAtTime(2500 * pitchMultiplier, t + 0.1);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.8, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.3);
  },

  playUpgrade() {
    if (this.muted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    
    const freqs = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, t + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.3, t + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.1 + 0.4);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.5);
    });
  },

  playFanfare() {
    if (this.muted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = freq;
      
      const gain = this.ctx.createGain();
      const startTime = t + (i < 3 ? i * 0.15 : 0.6);
      const duration = i < 3 ? 0.1 : 0.6;
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      // Simple lowpass for square wave
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2000;
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration + 0.1);
    });
  }
};

// Expose globally for testing/interaction if needed
window.AudioSystem = AudioSystem;

// --- Canvas & Rendering System ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const particlesContainer = document.getElementById('particles-container');

// Coin Properties
const coinProps = {
  radius: 80,
  thickness: 20,
  baseColor: '#b87333', // Copper
  edgeColor: '#8c5222',
  text: 'COPPER',
  textColor: '#5e3412',
  pitch: 1
};

// Physics state
let coinState = {
  y: 0,
  z: 0, // Height for scaling
  rotation: 0,
  vy: 0,
  vz: 0,
  vRot: 0,
  isFlipping: false,
  result: null, // 'heads' or 'tails'
  bounces: 0
};

// Materials dictionary
const MATERIALS = {
  Copper: { baseColor: '#b87333', edgeColor: '#8c5222', text: 'COPPER', textColor: '#5e3412', pitch: 1 },
  Silver: { baseColor: '#c0c0c0', edgeColor: '#808080', text: 'SILVER', textColor: '#555555', pitch: 1.2 },
  Gold:   { baseColor: '#ffd700', edgeColor: '#b8860b', text: 'GOLD',   textColor: '#8b6508', pitch: 1.5 },
  Platinum: { baseColor: '#e5e4e2', edgeColor: '#a0a0a0', text: 'PLAT', textColor: '#404040', pitch: 1.8 },
  Crypto: { baseColor: '#f7931a', edgeColor: '#c4710b', text: 'BTC',  textColor: '#ffffff', pitch: 2.2 },
  Quantum:{ baseColor: '#4b0082', edgeColor: '#8a2be2', text: 'QUANTUM',textColor: '#00ffff', pitch: 3.0 }
};

function updateCoinMaterial(materialName) {
  if (MATERIALS[materialName]) {
    Object.assign(coinProps, MATERIALS[materialName]);
  }
}

// Draw the 2.5D coin
function drawCoin() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const cx = canvas.width / 2;
  const cy = canvas.height / 2 + coinState.y;
  
  // Scale based on Z (height)
  const scale = 1 + (coinState.z / 300);
  
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  
  // Simulate 3D rotation with scaling on Y axis
  const rotYScale = Math.cos(coinState.rotation);
  const isHeads = rotYScale > 0;
  
  const currentHeight = coinProps.radius * Math.abs(rotYScale);
  const offset = coinProps.thickness * (rotYScale > 0 ? 1 : -1) * (1 - Math.abs(rotYScale));

  // Draw edge
  if (Math.abs(rotYScale) < 0.95) {
    ctx.fillStyle = coinProps.edgeColor;
    ctx.beginPath();
    ctx.ellipse(0, offset, coinProps.radius, currentHeight, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Connect edge sides
    ctx.beginPath();
    ctx.moveTo(-coinProps.radius, 0);
    ctx.lineTo(-coinProps.radius, offset);
    ctx.lineTo(coinProps.radius, offset);
    ctx.lineTo(coinProps.radius, 0);
    ctx.fill();
  }

  // Draw face
  ctx.fillStyle = coinProps.baseColor;
  ctx.beginPath();
  ctx.ellipse(0, 0, coinProps.radius, currentHeight, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw face text/design
  ctx.fillStyle = coinProps.textColor;
  ctx.font = `bold ${24 * Math.abs(rotYScale)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Metallic shading gradient
  const grad = ctx.createLinearGradient(-coinProps.radius, -currentHeight, coinProps.radius, currentHeight);
  grad.addColorStop(0, 'rgba(255,255,255,0.4)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.3)');
  
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, coinProps.radius, currentHeight, 0, 0, Math.PI * 2);
  ctx.fill();

  if (Math.abs(rotYScale) > 0.1) {
    ctx.fillStyle = coinProps.textColor;
    ctx.fillText(isHeads ? coinProps.text : 'TAILS', 0, 0);
  }

  ctx.restore();
}

function renderLoop() {
  drawCoin();
  requestAnimationFrame(renderLoop);
}

// Particle system
function spawnFloatingText(text, color = '#fbbf24') {
  const el = document.createElement('div');
  el.className = 'particle';
  el.textContent = text;
  el.style.color = color;
  
  // Randomize position near center
  const x = (canvas.offsetWidth / 2) + (Math.random() * 60 - 30) - 20;
  const y = (canvas.offsetHeight / 2) + (Math.random() * 40 - 20);
  
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  
  particlesContainer.appendChild(el);
  
  setTimeout(() => {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, 1000);
}

// Physics Loop
function physicsLoop() {
  if (coinState.isFlipping) {
    // Gravity and movement
    coinState.vz -= 0.8; // Gravity on Z
    coinState.z += coinState.vz;
    
    // Rotation
    coinState.rotation += coinState.vRot;
    
    // Bounce logic
    if (coinState.z <= 0) {
      coinState.z = 0;
      if (coinState.bounces < 2) {
        coinState.vz = Math.abs(coinState.vz) * 0.4;
        coinState.vRot *= 0.5;
        coinState.bounces++;
        AudioSystem.playClink(coinProps.pitch);
      } else {
        // Landing finished
        coinState.isFlipping = false;
        
        // Snap to heads or tails based on current rotation
        const rotMod = (coinState.rotation % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const landedHeads = rotMod < Math.PI / 2 || rotMod > Math.PI * 1.5;
        
        coinState.rotation = landedHeads ? 0 : Math.PI;
        coinState.result = landedHeads ? 'heads' : 'tails';
        
        AudioSystem.playClink(coinProps.pitch * 0.8);
        onCoinLanded(coinState.result);
      }
    }
  }
}

setInterval(physicsLoop, 1000 / 60);
requestAnimationFrame(renderLoop);

// Hook required by physicsLoop
let onCoinLanded = (result) => { console.log("Landed:", result); };

// --- Core Gameplay Mechanics ---

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
  
  // Upgrade levels
  upgrades: {
    alchemy: 0, // 0 = Copper, 1 = Silver, etc.
    velvetMat: false,
    magneticTable: false,
    
    // Automation counts
    streetPerformer: 0,
    clockwork: 0,
    hftDesk: 0,
    quantumMulti: 0
  },
  
  // Presige 2
  landmarksOwned: 0,
  banksOwned: 0,
  continentsOwned: 0
};

// UI Elements
const elGold = document.getElementById('gold-count');
const elTotalFlips = document.getElementById('total-flips');
const elLifetimeGold = document.getElementById('lifetime-gold');
const elCurrentStreak = document.getElementById('current-streak');
const elStreakRecord = document.getElementById('streak-record');
const elStreakMultiplier = document.getElementById('streak-multiplier');

function updateStatsUI() {
  elGold.textContent = Math.floor(gameState.gold);
  elTotalFlips.textContent = gameState.totalFlips;
  elLifetimeGold.textContent = Math.floor(gameState.lifetimeGold);
  elCurrentStreak.textContent = gameState.currentStreak;
  elStreakRecord.textContent = gameState.streakRecord;
  elStreakMultiplier.textContent = gameState.multiplier + 'x';
}

function addGold(amount) {
  // Apply City Influence (+10% per token)
  const influenceMultiplier = 1 + (gameState.influenceTokens * 0.1);
  const totalAmount = amount * influenceMultiplier;
  
  gameState.gold += totalAmount;
  gameState.lifetimeGold += totalAmount;
  updateStatsUI();
  updateShopUI(); // Defined later
}

function flipCoin(isManual = true) {
  if (isManual) {
    if (coinState.isFlipping) return;
    AudioSystem.init();
    AudioSystem.playWhoosh();
    
    coinState.isFlipping = true;
    coinState.z = 10;
    coinState.vz = 20 * (1 / gameState.flipDurationModifier);
    coinState.vRot = 0.5 * (1 / gameState.flipDurationModifier);
    coinState.bounces = 0;
  } else {
    // Instant flip for automation
    const isHeads = Math.random() > 0.5;
    processFlipResult(isHeads ? 'heads' : 'tails', false);
  }
}

function processFlipResult(result, isManual = true) {
  gameState.totalFlips++;
  
  let payout = 0;
  let text = '';
  
  // Golden Edge chance
  let edgeChance = gameState.luckyEdgeChance;
  // Monte Carlo city buff (+25% lucky edge chance)
  if (CITIES[gameState.currentCityIndex].name === 'Monte Carlo') {
     edgeChance *= 1.25;
  }
  
  const isGoldenEdge = Math.random() < edgeChance;

  if (isGoldenEdge) {
    payout = gameState.baseCoinValue * 10 * gameState.multiplier;
    text = 'GOLDEN EDGE! +$' + payout;
    spawnFloatingText(text, '#ffd700');
    if (isManual) AudioSystem.playFanfare();
  } else if (result === 'heads') {
    // Magnetic Table buff (near misses -> heads)
    let magneticBuff = false;
    if (gameState.upgrades.magneticTable && Math.random() < 0.2) {
       magneticBuff = true;
    }
    
    payout = gameState.baseCoinValue * gameState.multiplier;
    text = '+$' + payout;
    
    gameState.currentStreak++;
    if (gameState.currentStreak > gameState.streakRecord) {
      gameState.streakRecord = gameState.currentStreak;
    }
    
    // Hot Streak logic
    if (gameState.currentStreak >= 10) {
      gameState.multiplier = 3;
      if (gameState.currentStreak === 10 && isManual) AudioSystem.playFanfare();
    } else if (gameState.currentStreak >= 5) {
      gameState.multiplier = 2;
    }
    
    spawnFloatingText(text);
  } else {
    // Tails, break streak
    // Check magnetic table near-miss save
    if (gameState.upgrades.magneticTable && Math.random() < 0.2) {
       // Saved by magnet! Turns to heads.
       result = 'heads';
       payout = gameState.baseCoinValue * gameState.multiplier;
       text = '+$' + payout + ' (Magnet!)';
       gameState.currentStreak++;
       spawnFloatingText(text, '#00ffff');
    } else {
       gameState.currentStreak = 0;
       gameState.multiplier = 1;
       spawnFloatingText('TAILS', '#94a3b8');
    }
  }
  
  addGold(payout);
  
  // Check Gamble
  checkGambleResult(result, isManual);
}

// Override the hook
onCoinLanded = (result) => {
  processFlipResult(result, true);
};

canvas.addEventListener('click', () => flipCoin(true));

// Cities array for reference
const CITIES = [
  { name: 'Rusty Alley', desc: 'Starting city.' },
  { name: 'Wall Street', desc: '+50% automation efficiency.' },
  { name: 'Monte Carlo', desc: 'Double-or-Nothing cap increased, +25% lucky edge chance.' },
  { name: 'Tokyo Cyber-District', desc: 'Quantum coins generate passive dividends.' },
  { name: 'Geneva Vault', desc: '2% interest per minute on unspent gold.' }
];

// Placeholder for gamble check
function checkGambleResult(result, isManual) {}
// Placeholder for updateShopUI
function updateShopUI() {}


// --- Save/Load System ---
const SAVE_KEY = 'coinflipper_save_v1';

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
  spawnFloatingText('Game Saved', '#4ade80');
}

function loadGame() {
  const save = localStorage.getItem(SAVE_KEY);
  if (save) {
    try {
      const parsed = JSON.parse(save);
      // Merge with default state to handle upgrades/new fields
      gameState = { ...gameState, ...parsed };
      
      // Update nested objects correctly
      if (parsed.upgrades) {
        gameState.upgrades = { ...gameState.upgrades, ...parsed.upgrades };
      }

      applyLoadedState();
      spawnFloatingText('Game Loaded', '#4ade80');
    } catch (e) {
      console.error("Save file corrupted", e);
    }
  }
}

function applyLoadedState() {
  // Apply material
  const alchemyNames = Object.keys(MATERIALS);
  updateCoinMaterial(alchemyNames[gameState.upgrades.alchemy] || 'Copper');
  
  // Re-calculate derived stats
  updateShopUI();
  updateStatsUI();
  updateCityUI(); // defined later
}

function hardReset() {
  if (confirm("Are you sure? This will wipe all progress including prestige!")) {
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  }
}

function exportSave() {
  const saveStr = btoa(JSON.stringify(gameState));
  navigator.clipboard.writeText(saveStr).then(() => {
    alert("Save code copied to clipboard!");
  }).catch(() => {
    const p = prompt("Copy this save code:", saveStr);
  });
}

function importSave() {
  const saveStr = prompt("Paste your save code:");
  if (saveStr) {
    try {
      const decoded = atob(saveStr);
      const parsed = JSON.parse(decoded);
      gameState = { ...gameState, ...parsed };
      if (parsed.upgrades) gameState.upgrades = { ...gameState.upgrades, ...parsed.upgrades };
      saveGame();
      applyLoadedState();
      alert("Save imported successfully!");
    } catch (e) {
      alert("Invalid save code.");
    }
  }
}

// Auto-save every 5 seconds
setInterval(saveGame, 5000);

// Bind UI buttons
document.getElementById('btn-save').addEventListener('click', saveGame);
document.getElementById('btn-load').addEventListener('click', loadGame);
document.getElementById('btn-export').addEventListener('click', exportSave);
document.getElementById('btn-import').addEventListener('click', importSave);
document.getElementById('btn-reset').addEventListener('click', hardReset);
document.getElementById('btn-audio-toggle').addEventListener('click', (e) => {
  AudioSystem.muted = !AudioSystem.muted;
  e.target.textContent = AudioSystem.muted ? '🔇 Unmute' : '🔊 Mute';
});


// --- Shop & Upgrades System ---
const ALCHEMY_TIERS = [
  { name: 'Copper', cost: 0, val: 1 },
  { name: 'Silver', cost: 100, val: 5 },
  { name: 'Gold', cost: 1000, val: 25 },
  { name: 'Platinum', cost: 10000, val: 150 },
  { name: 'Crypto', cost: 100000, val: 1000 },
  { name: 'Quantum', cost: 1000000, val: 10000 }
];

const APPARATUS = [
  { id: 'velvetMat', name: 'Velvet Felt Mat', desc: 'Faster manual flips.', baseCost: 500 },
  { id: 'magneticTable', name: 'Magnetic Table', desc: 'Attracts near-misses (Tails -> Heads 20%).', baseCost: 2000 }
];

const AUTOMATION = [
  { id: 'streetPerformer', name: 'Street Performer', desc: '1 flip/sec.', baseCost: 50, rate: 1 },
  { id: 'clockwork', name: 'Clockwork Flipper', desc: '5 flips/sec.', baseCost: 500, rate: 5 },
  { id: 'hftDesk', name: 'High-Freq Trading Desk', desc: '25 flips/sec.', baseCost: 5000, rate: 25 },
  { id: 'quantumMulti', name: 'Quantum Multi-Flipper', desc: '100 flips/sec.', baseCost: 50000, rate: 100 }
];

function purchaseAlchemy() {
  const nextTierIndex = gameState.upgrades.alchemy + 1;
  if (nextTierIndex >= ALCHEMY_TIERS.length) return;
  
  const tier = ALCHEMY_TIERS[nextTierIndex];
  if (gameState.gold >= tier.cost) {
    gameState.gold -= tier.cost;
    gameState.upgrades.alchemy = nextTierIndex;
    gameState.baseCoinValue = tier.val;
    updateCoinMaterial(tier.name);
    AudioSystem.playUpgrade();
    updateShopUI();
    updateStatsUI();
  }
}

function purchaseApparatus(id) {
  const item = APPARATUS.find(a => a.id === id);
  if (!gameState.upgrades[id] && gameState.gold >= item.baseCost) {
    gameState.gold -= item.baseCost;
    gameState.upgrades[id] = true;
    
    if (id === 'velvetMat') gameState.flipDurationModifier = 2; // Twice as fast
    
    AudioSystem.playUpgrade();
    updateShopUI();
    updateStatsUI();
  }
}

function purchaseAutomation(id) {
  const item = AUTOMATION.find(a => a.id === id);
  const currentCount = gameState.upgrades[id] || 0;
  const cost = item.baseCost * Math.pow(1.15, currentCount); // 15% price increase per level
  
  if (gameState.gold >= cost) {
    gameState.gold -= cost;
    gameState.upgrades[id] = currentCount + 1;
    AudioSystem.playUpgrade();
    recalcAutoRate();
    updateShopUI();
    updateStatsUI();
  }
}

function recalcAutoRate() {
  let rate = 0; // Flips per second
  AUTOMATION.forEach(a => {
    rate += (gameState.upgrades[a.id] || 0) * a.rate;
  });
  
  // Wall Street City Buff (+50%)
  if (CITIES[gameState.currentCityIndex].name === 'Wall Street') {
    rate *= 1.5;
  }
  
  gameState.autoFlippers = rate;
}

// Override updateShopUI
updateShopUI = () => {
  const alchemyList = document.getElementById('alchemy-list');
  alchemyList.innerHTML = '';
  const nextTierIndex = gameState.upgrades.alchemy + 1;
  if (nextTierIndex < ALCHEMY_TIERS.length) {
    const tier = ALCHEMY_TIERS[nextTierIndex];
    const li = document.createElement('li');
    li.className = 'shop-item';
    li.innerHTML = `
      <div class="shop-item-controls">
        <div>
          <div class="shop-item-title">${tier.name} Coin</div>
          <div class="shop-item-desc">Base Value: $${tier.val}</div>
        </div>
        <button onclick="purchaseAlchemy()" ${gameState.gold < tier.cost ? 'disabled' : ''}>Cost: $${tier.cost}</button>
      </div>
    `;
    alchemyList.appendChild(li);
  } else {
    alchemyList.innerHTML = '<li>Max Alchemy Achieved!</li>';
  }

  const apparatusList = document.getElementById('apparatus-list');
  apparatusList.innerHTML = '';
  APPARATUS.forEach(a => {
    if (!gameState.upgrades[a.id]) {
      const li = document.createElement('li');
      li.className = 'shop-item';
      li.innerHTML = `
        <div class="shop-item-controls">
          <div>
            <div class="shop-item-title">${a.name}</div>
            <div class="shop-item-desc">${a.desc}</div>
          </div>
          <button onclick="purchaseApparatus('${a.id}')" ${gameState.gold < a.baseCost ? 'disabled' : ''}>Cost: $${a.baseCost}</button>
        </div>
      `;
      apparatusList.appendChild(li);
    }
  });

  const autoList = document.getElementById('automation-list');
  autoList.innerHTML = '';
  AUTOMATION.forEach(a => {
    const count = gameState.upgrades[a.id] || 0;
    const cost = Math.floor(a.baseCost * Math.pow(1.15, count));
    const li = document.createElement('li');
    li.className = 'shop-item';
    li.innerHTML = `
      <div class="shop-item-controls">
        <div>
          <div class="shop-item-title">${a.name} (Lvl ${count})</div>
          <div class="shop-item-desc">${a.desc}</div>
        </div>
        <button onclick="purchaseAutomation('${a.id}')" ${gameState.gold < cost ? 'disabled' : ''}>Cost: $${cost}</button>
      </div>
    `;
    autoList.appendChild(li);
  });
};

// Automation Loop
let automationAccumulator = 0;
let lastTime = performance.now();

function automationTick(now) {
  const dt = (now - lastTime) / 1000;
  lastTime = now;
  
  if (gameState.autoFlippers > 0) {
    automationAccumulator += gameState.autoFlippers * dt;
    while (automationAccumulator >= 1) {
      flipCoin(false);
      automationAccumulator -= 1;
    }
  }

  // Passive Dividend in Tokyo
  if (CITIES[gameState.currentCityIndex].name === 'Tokyo Cyber-District' && gameState.upgrades.alchemy >= 4) { // Crypto or higher
     addGold(10 * dt); // Small passive income
  }

  requestAnimationFrame(automationTick);
}
requestAnimationFrame(automationTick);

// Interest Loop (Geneva)
setInterval(() => {
  if (CITIES[gameState.currentCityIndex].name === 'Geneva Vault' && gameState.gold > 0) {
    const interest = gameState.gold * 0.02; // 2% per min (tick is 1 min)
    addGold(interest);
    spawnFloatingText('Interest! +$' + Math.floor(interest), '#4ade80');
  }
}, 60000); // 1 minute

// --- Gamble Mini-Game ---

// Unlocked after first automation purchase or enough lifetime gold
let gambleUnlocked = false;

function checkUnlockGamble() {
  if (!gambleUnlocked && gameState.lifetimeGold > 1000) {
    gambleUnlocked = true;
    document.getElementById('gamble-mini-game').classList.remove('hidden');
  }
}

// Check every few seconds
setInterval(checkUnlockGamble, 2000);

let activeWager = null; // { amount, prediction }

document.getElementById('btn-gamble').addEventListener('click', () => {
  const amount = parseInt(document.getElementById('wager-amount').value, 10);
  const prediction = document.getElementById('wager-prediction').value;
  
  if (isNaN(amount) || amount <= 0) return;
  if (amount > gameState.gambleCap) {
    alert("Wager exceeds cap!");
    return;
  }
  if (amount > gameState.gold) {
    alert("Not enough gold!");
    return;
  }
  
  gameState.gold -= amount;
  activeWager = { amount, prediction };
  
  document.getElementById('gamble-result').textContent = "Wager set. Click the coin to flip!";
  document.getElementById('gamble-result').style.color = "#f8fafc";
  
  updateStatsUI();
});

// Override checkGambleResult
checkGambleResult = (result, isManual) => {
  if (activeWager && isManual) {
    if (result === activeWager.prediction) {
      // Won double or nothing
      const payout = activeWager.amount * 2;
      addGold(payout);
      document.getElementById('gamble-result').textContent = `WON! +$${payout}`;
      document.getElementById('gamble-result').style.color = "#4ade80";
      AudioSystem.playFanfare();
      spawnFloatingText(`GAMBLE WON!`, '#4ade80');
    } else {
      // Lost
      document.getElementById('gamble-result').textContent = `Lost $${activeWager.amount}`;
      document.getElementById('gamble-result').style.color = "#f87171";
    }
    activeWager = null;
  }
};

// --- Prestige Layer 1: City Relocation ---

function updateCityUI() {
  document.getElementById('current-city').textContent = CITIES[gameState.currentCityIndex].name;
  document.getElementById('cities-visited').textContent = gameState.citiesVisited;
  document.getElementById('influence-tokens').textContent = gameState.influenceTokens;
  
  const list = document.getElementById('cities-list');
  list.innerHTML = '';
  
  CITIES.forEach((city, index) => {
    if (index === gameState.currentCityIndex) return; // Skip current
    
    // Relocation cost scales with cities visited
    const cost = 10000 * Math.pow(10, gameState.citiesVisited);
    
    const li = document.createElement('div');
    li.style.marginBottom = '10px';
    li.innerHTML = `
      <strong>${city.name}</strong><br>
      <span style="font-size: 0.8em; color: #94a3b8;">${city.desc}</span><br>
      <button onclick="relocateCity(${index})" ${gameState.gold < cost ? 'disabled' : ''}>Relocate (Cost: $${cost})</button>
    `;
    list.appendChild(li);
  });
  
  // Show Prestige 2 if tokens >= 5
  if (gameState.influenceTokens >= 5) {
    document.getElementById('prestige-layer-2').classList.remove('hidden');
    updateDominationUI();
  }
}

function relocateCity(index) {
  const cost = 10000 * Math.pow(10, gameState.citiesVisited);
  if (gameState.gold >= cost) {
    if (confirm(`Relocate to ${CITIES[index].name}? You will lose local gold and apparatus upgrades, but gain 1 City Influence Token (+10% global gold).`)) {
      // Prestige Reset
      gameState.gold = 0;
      gameState.upgrades.velvetMat = false;
      gameState.upgrades.magneticTable = false;
      gameState.flipDurationModifier = 1;
      
      // Keep Alchemy and Automation, but lose some progress? Issue says "resets local gold and standard apparatus".
      // We will keep automation as it's not "standard apparatus".
      
      gameState.currentCityIndex = index;
      gameState.citiesVisited++;
      gameState.influenceTokens++;
      
      // Apply city buffs
      applyCityBuffs();
      
      AudioSystem.playFanfare();
      updateCityUI();
      updateShopUI();
      updateStatsUI();
      saveGame();
    }
  }
}

function applyCityBuffs() {
  const city = CITIES[gameState.currentCityIndex].name;
  
  // Reset buffs
  gameState.gambleCap = 100;
  
  if (city === 'Monte Carlo') {
    gameState.gambleCap = 10000;
  }
  
  document.getElementById('gamble-cap').textContent = gameState.gambleCap;
  recalcAutoRate(); // For Wall Street
}

// Initial Call
applyCityBuffs();
updateCityUI();


// --- Prestige Layer 2: Buy the World ---

const DOMINATION = [
  { id: 'landmarks', name: 'Landmarks', items: ['Statue of Liberty', 'Eiffel Tower', 'Tokyo Tower'], cost: 1e9, tokenCost: 5 },
  { id: 'banks', name: 'Central Banks', items: ['Federal Reserve', 'Bank of England'], cost: 1e12, tokenCost: 10 },
  { id: 'continents', name: 'Continents', items: ['Oceania', 'Europe', 'Americas', 'Asia'], cost: 1e15, tokenCost: 20 }
];

function updateDominationUI() {
  const list = document.getElementById('domination-list');
  list.innerHTML = '';
  
  DOMINATION.forEach(d => {
    let owned = 0;
    if (d.id === 'landmarks') owned = gameState.landmarksOwned;
    if (d.id === 'banks') owned = gameState.banksOwned;
    if (d.id === 'continents') owned = gameState.continentsOwned;
    
    if (owned < d.items.length) {
      const nextItem = d.items[owned];
      const li = document.createElement('div');
      li.style.marginBottom = '10px';
      li.innerHTML = `
        <strong>Buy ${nextItem} (${d.name})</strong><br>
        <button onclick="purchaseDomination('${d.id}')" ${gameState.gold < d.cost || gameState.influenceTokens < d.tokenCost ? 'disabled' : ''}>
          Buy (Cost: $${d.cost.toExponential(2)} & ${d.tokenCost} Tokens)
        </button>
      `;
      list.appendChild(li);
    } else {
      const li = document.createElement('div');
      li.style.marginBottom = '10px';
      li.innerHTML = `<strong>All ${d.name} Owned!</strong>`;
      list.appendChild(li);
    }
  });
}

function purchaseDomination(id) {
  const category = DOMINATION.find(d => d.id === id);
  if (gameState.gold >= category.cost && gameState.influenceTokens >= category.tokenCost) {
    gameState.gold -= category.cost;
    // We don't spend tokens, just require them. If we spend them: gameState.influenceTokens -= category.tokenCost;
    // Issue says "Once players accumulate substantial City Influence..." implying a threshold, not a currency spend.
    
    if (id === 'landmarks') gameState.landmarksOwned++;
    if (id === 'banks') gameState.banksOwned++;
    if (id === 'continents') {
      gameState.continentsOwned++;
      if (gameState.continentsOwned >= 4) {
        triggerVictory();
      }
    }
    
    AudioSystem.playFanfare();
    updateStatsUI();
    updateDominationUI();
    saveGame();
  }
}

function triggerVictory() {
  document.getElementById('victory-screen').classList.remove('hidden');
}

document.getElementById('btn-endless-mode').addEventListener('click', () => {
  document.getElementById('victory-screen').classList.add('hidden');
  spawnFloatingText('COSMIC MINT MODE ENGAGED', '#00ffff');
});

// Initialize UI
updateStatsUI();
updateShopUI();
