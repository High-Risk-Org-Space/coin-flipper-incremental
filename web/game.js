// --- Core Gameplay Mechanics ---

function addGold(amount) {
  if (isNaN(amount) || !isFinite(amount)) return;

  const influenceMultiplier = 1 + (gameState.influenceTokens * 0.1);
  let dominationMultiplier = 1;
  if (gameState.landmarksOwned) dominationMultiplier += (gameState.landmarksOwned * 0.5);
  if (gameState.banksOwned) dominationMultiplier += (gameState.banksOwned * 2.0);
  if (gameState.continentsOwned) dominationMultiplier += (gameState.continentsOwned * 10.0);
  
  // Gold Rush multiplier
  if (gameState.isGoldRush) {
      amount *= 5;
  }
  
  const totalAmount = amount * influenceMultiplier * dominationMultiplier;
  
  gameState.gold += totalAmount;
  gameState.lifetimeGold += totalAmount;
  updateStatsUI();
  updateShopUI();
}

function flipCoin(isManual = true, startX = 0, startY = 0) {
  AudioSystem.init();
  if (isManual) AudioSystem.playWhoosh();
  
  const coin = {
    x: startX,
    y: startY,
    z: 10,
    vx: (Math.random() - 0.5) * 10,
    vy: (Math.random() - 0.5) * 10,
    vz: 20 * (1 / gameState.flipDurationModifier),
    rotation: 0,
    vRot: 0.5 * (1 / gameState.flipDurationModifier),
    bounces: 0,
    wobbleTime: 0,
    isFlipping: true,
    result: null,
    isManual: isManual
  };
  
  activeCoins.push(coin);

  if (isManual) {
    // Build frenzy
    let frenzyGain = 5;
    if (gameState.upgrades.heavyTungsten) frenzyGain /= 2; // Tungsten slows frenzy
    
    gameState.frenzy = Math.min(100, gameState.frenzy + frenzyGain);
    if (gameState.frenzy >= 100 && !gameState.isGoldRush) {
        triggerGoldRush();
    }
    updateStatsUI();
  }
}

function triggerGoldRush() {
    gameState.isGoldRush = true;
    document.body.classList.add('gold-rush');
    AudioSystem.playFrenzyTheme();
    
    // Duration 8 seconds
    setTimeout(() => {
        gameState.isGoldRush = false;
        gameState.frenzy = 0;
        document.body.classList.remove('gold-rush');
        updateStatsUI();
    }, 8000);
}

function processFlipResult(result, isManual = true) {
  gameState.totalFlips++;
  
  let payout = 0;
  let text = '';
  
  let edgeChance = gameState.luckyEdgeChance;
  if (CITIES[gameState.currentCityIndex].name === 'Monte Carlo') {
     edgeChance *= 1.25;
  }
  
  const isGoldenEdge = Math.random() < edgeChance;

  let baseVal = gameState.baseCoinValue;
  if (gameState.talents.includes('goldenMultiplier')) baseVal *= 2;
  if (gameState.upgrades.heavyTungsten) {
      baseVal *= 2; // Heavy tungsten increases base value
  }

  if (isGoldenEdge) {
    payout = baseVal * 10 * gameState.multiplier;
    text = 'GOLDEN EDGE! +$' + payout;
    spawnFloatingText(text, '#ffd700');
    if (isManual) AudioSystem.playFrenzyTheme();
  } else if (result === 'heads') {
    if (gameState.upgrades.magneticTable && Math.random() < 0.2) {
       // Magnetic Buff!
    }
    
    payout = baseVal * gameState.multiplier;
    text = '+$' + payout;
    
    gameState.currentStreak++;
    if (gameState.currentStreak > gameState.streakRecord) {
      gameState.streakRecord = gameState.currentStreak;
    }
    
    if (gameState.currentStreak >= 10) {
      gameState.multiplier = 3;
      if (gameState.currentStreak === 10 && isManual) AudioSystem.playFrenzyTheme();
    } else if (gameState.currentStreak >= 5) {
      gameState.multiplier = 2;
    }
    
    spawnFloatingText(text);
  } else {
    if (gameState.upgrades.magneticTable && Math.random() < 0.2) {
       result = 'heads';
       payout = baseVal * gameState.multiplier;
       text = '+$' + payout + ' (Magnet!)';
       gameState.currentStreak++;
       spawnFloatingText(text, '#00ffff');
    } else {
       gameState.currentStreak = 0;
       gameState.multiplier = 1;
       spawnFloatingText('TAILS', '#94a3b8');
    }
  }
  
  if (isManual && gameState.isGoldRush) {
      // Golden particle shower on manual win during gold rush
      for(let i=0; i<5; i++) {
          createParticle(window.innerWidth/2, window.innerHeight/2, '#ffd700');
      }
  }

  addGold(payout);
  checkGambleResult(result, isManual);
}

onCoinLanded = (result, isManual = true) => {
  processFlipResult(result, isManual);
};

canvas.addEventListener('click', (e) => {
  AudioSystem.resume();
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left - canvas.width / 2;
  const y = e.clientY - rect.top - canvas.height / 2;
  createParticle(e.clientX, e.clientY, '#ffffff'); // Click burst spark
  flipCoin(true, x, y);
});

// Purchases
function purchaseAlchemy() {
  if (gameState.upgrades.alchemy < ALCHEMY_TIERS.length) {
    const tier = ALCHEMY_TIERS[gameState.upgrades.alchemy];
    if (gameState.gold >= tier.cost) {
      gameState.gold -= tier.cost;
      gameState.baseCoinValue = tier.multiplier;
      gameState.upgrades.alchemy++;
      updateCoinMaterialFromState();
      AudioSystem.playFrenzyTheme();
      updateStatsUI();
      updateShopUI();
      saveGame();
    }
  }
}

function purchaseApparatus(id) {
  const item = APPARATUS.find(a => a.id === id);
  if (gameState.gold >= item.baseCost && !gameState.upgrades[id]) {
    gameState.gold -= item.baseCost;
    gameState.upgrades[id] = true;
    
    if (id === 'velvetMat') {
      gameState.flipDurationModifier = 1.5;
    }
    
    AudioSystem.playFrenzyTheme();
    updateStatsUI();
    updateShopUI();
    saveGame();
  }
}

window.purchaseAlchemy = purchaseAlchemy;
window.purchaseApparatus = purchaseApparatus;

function purchaseAutomation(id) {
  const item = AUTOMATION.find(a => a.id === id);
  const count = gameState.upgrades[id] || 0;
  const cost = Math.floor(item.baseCost * Math.pow(item.r, count));
  
  if (gameState.gold >= cost) {
    gameState.gold -= cost;
    gameState.upgrades[id] = count + 1;
    recalcAutoRate();
    AudioSystem.playFrenzyTheme();
    updateStatsUI();
    updateShopUI();
    saveGame();
  }
}
window.purchaseAutomation = purchaseAutomation;

function recalcAutoRate() {
  let rate = 0;
  AUTOMATION.forEach(a => {
    rate += (gameState.upgrades[a.id] || 0) * a.rate;
  });
  
  if (CITIES[gameState.currentCityIndex].name === 'Tokyo Cyber-District') {
     rate *= 1.5; // Tokyo automation synergy buff
  }
  
  gameState.autoFlippers = rate;
}

window.recalcAutoRate = recalcAutoRate;

let automationAccumulator = 0;
let lastTime = performance.now();

function automationTick(now) {
  let dt = (now - lastTime) / 1000;
  lastTime = now;
  if (dt > 1) dt = 1;
  
  if (gameState.autoFlippers > 0) {
    automationAccumulator += gameState.autoFlippers * dt;
    while (automationAccumulator >= 1) {
      // Spawn from random edge location
      const spawnX = (Math.random() - 0.5) * canvas.width;
      const spawnY = (Math.random() - 0.5) * canvas.height;
      flipCoin(false, spawnX, spawnY);
      automationAccumulator -= 1;
    }
  }

  // Frenzy decay
  if (!gameState.isGoldRush && gameState.frenzy > 0) {
      gameState.frenzy = Math.max(0, gameState.frenzy - (dt * 2));
      updateStatsUI();
  }

  if (CITIES[gameState.currentCityIndex].name === 'Tokyo Cyber-District' && gameState.upgrades.alchemy >= 4) {
     addGold(10 * dt); 
  }

  requestAnimationFrame(automationTick);
}
requestAnimationFrame(automationTick);

// High-Frequency Market Burst (Wall Street)
setInterval(() => {
    if (CITIES[gameState.currentCityIndex].name === 'Wall Street') {
        if (Math.random() < 0.3) { // 30% chance every 10 seconds
            const burst = gameState.baseCoinValue * 100;
            addGold(burst);
            spawnFloatingText('MARKET BURST! +$' + burst, '#10b981');
        }
    }
}, 10000);

// Interest Loop (Geneva)
setInterval(() => {
  if (CITIES[gameState.currentCityIndex].name === 'Geneva Vault' && gameState.gold > 0) {
    const interest = gameState.gold * 0.05; // buffed to 5% per min
    addGold(interest);
    spawnFloatingText('Interest! +$' + Math.floor(interest), '#4ade80');
  }
}, 60000);


// Slot Machine Logic
const SLOT_SYMBOLS = ['🍒', 'BAR', '🔔', '7️⃣', '🎰'];
const SLOT_COST = 100;
let isSpinning = false;

function spinSlotMachine() {
    if (isSpinning || gameState.gold < SLOT_COST) return;
    gameState.gold -= SLOT_COST;
    updateStatsUI();
    isSpinning = true;
    
    document.getElementById('slot-result').textContent = "Spinning...";
    document.getElementById('slot-result').style.color = "#f8fafc";
    
    AudioSystem.playSlotSpin();

    let spins = 0;
    const maxSpins = 20;
    
    const spinInterval = setInterval(() => {
        for (let i = 1; i <= 3; i++) {
            const randomSym = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
            document.getElementById(`reel-${i}`).textContent = randomSym;
        }
        spins++;
        if (spins >= maxSpins) {
            clearInterval(spinInterval);
            processSlotPayout();
        }
    }, 100);
}

function processSlotPayout() {
    isSpinning = false;
    
    // Apply slot luck talent
    let reel1 = document.getElementById('reel-1').textContent;
    let reel2 = document.getElementById('reel-2').textContent;
    let reel3 = document.getElementById('reel-3').textContent;
    
    if (gameState.talents.includes('slotLuck') && Math.random() < 0.2) {
         // 20% chance to force a win if slot luck is owned
         reel2 = reel1;
         reel3 = reel1;
         document.getElementById('reel-2').textContent = reel2;
         document.getElementById('reel-3').textContent = reel3;
    }

    if (reel1 === reel2 && reel2 === reel3) {
        let multiplier = 5;
        if (reel1 === 'BAR') multiplier = 10;
        if (reel1 === '🔔') multiplier = 20;
        if (reel1 === '7️⃣') multiplier = 50;
        if (reel1 === '🎰') multiplier = 100;
        
        const payout = SLOT_COST * multiplier;
        gameState.gold += payout;
        gameState.lifetimeGold += payout;
        
        document.getElementById('slot-result').textContent = `WIN! +$${payout}`;
        document.getElementById('slot-result').style.color = "#4ade80";
        AudioSystem.playSlotWin();
        spawnFloatingText(`JACKPOT! +$${payout}`, '#4ade80');
        updateStatsUI();
        saveGame();
    } else {
        document.getElementById('slot-result').textContent = "Try Again";
        document.getElementById('slot-result').style.color = "#94a3b8";
    }
}

const btnSpinSlot = document.getElementById('btn-spin-slot');
if (btnSpinSlot) {
    btnSpinSlot.addEventListener('click', spinSlotMachine);
}



// The Sacrifice & Talents
function performSacrifice() {
    const tokens = Math.floor(Math.sqrt(gameState.lifetimeGold / 1000000));
    if (tokens <= 0) {
        alert("You have not earned enough lifetime gold to perform a sacrifice (requires at least 1M).");
        return;
    }
    
    if (confirm(`Perform The Sacrifice? You will lose all gold, standard upgrades, hats, and helpers, but gain ${tokens} Sacrifice Tokens.`)) {
        gameState.sacrificeTokens += tokens;
        
        // Reset state
        gameState.gold = 0;
        gameState.upgrades.alchemy = 0;
        gameState.upgrades.velvetMat = false;
        gameState.upgrades.magneticTable = false;
        gameState.upgrades.heavyTungsten = false;
        gameState.flipDurationModifier = 1;
        gameState.helpers = [];
        gameState.hatsOwned = [];
        gameState.activeHat = null;
        gameState.currentStreak = 0;
        gameState.multiplier = 1;
        
        updateCoinMaterialFromState();
        AudioSystem.playFrenzyTheme();
        updateStatsUI();
        updateShopUI();
        updateTalentTreeUI();
        saveGame();
    }
}

const btnSacrifice = document.getElementById('btn-sacrifice');
if (btnSacrifice) {
    btnSacrifice.addEventListener('click', performSacrifice);
}

function purchaseTalent(nodeId) {
    const node = TALENT_NODES[nodeId];
    if (node && gameState.sacrificeTokens >= node.cost && !gameState.talents.includes(nodeId)) {
        gameState.sacrificeTokens -= node.cost;
        gameState.talents.push(nodeId);
        
        AudioSystem.playUpgrade();
        updateTalentTreeUI();
        updateShopUI();
        saveGame();
    }
}
window.purchaseTalent = purchaseTalent;
? You will lose local gold and apparatus upgrades, but gain 1 City Influence Token (+10% global gold).`)) {
      gameState.gold = 0;
      gameState.upgrades.velvetMat = false;
      gameState.upgrades.magneticTable = false;
      gameState.upgrades.heavyTungsten = false;
      gameState.flipDurationModifier = 1;
      
      gameState.currentCityIndex = index;
      gameState.citiesVisited++;
      gameState.influenceTokens++;
      gameState.currentStreak = 0;
      gameState.multiplier = 1;
      
      applyCityBuffs();
      AudioSystem.playFrenzyTheme();
      updateCityUI();
      updateShopUI();
      updateStatsUI();
      saveGame();
    }
  }
}

function applyCityBuffs() {
  const city = CITIES[gameState.currentCityIndex].name;
  gameState.gambleCap = 100;
  if (city === 'Monte Carlo') {
    gameState.gambleCap = 10000;
  }
  const capEl = document.getElementById('gamble-cap');
  if (capEl) capEl.textContent = gameState.gambleCap.toLocaleString();
  recalcAutoRate(); 
}

// Prestige Layer 2: Buy the World
window.purchaseDomination = function(id) {
  const category = DOMINATION.find(d => d.id === id);
  if (gameState.gold >= category.cost && gameState.influenceTokens >= category.tokenCost) {
    gameState.gold -= category.cost;
    
    if (id === 'landmarks') gameState.landmarksOwned++;
    if (id === 'banks') gameState.banksOwned++;
    if (id === 'continents') {
      gameState.continentsOwned++;
      if (gameState.continentsOwned >= 4) {
        triggerVictory();
      }
    }
    
    AudioSystem.playFrenzyTheme();
    updateStatsUI();
    updateDominationUI();
    saveGame();
  }
}

function triggerVictory() {
  document.getElementById('victory-screen').classList.remove('hidden');
}

const btnEndless = document.getElementById('btn-endless-mode');
if (btnEndless) {
    btnEndless.addEventListener('click', () => {
      document.getElementById('victory-screen').classList.add('hidden');
      spawnFloatingText('COSMIC MINT MODE ENGAGED', '#00ffff');
    });
}

// Initialization
loadGame();
updateCoinMaterialFromState();
applyCityBuffs();
updateCityUI();
updateStatsUI();
updateShopUI();
recalcAutoRate();
setInterval(saveGame, 5000);
