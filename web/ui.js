// UI Elements
const elGold = document.getElementById('gold-count');
const elTotalFlips = document.getElementById('total-flips');
const elLifetimeGold = document.getElementById('lifetime-gold');
const elCurrentStreak = document.getElementById('current-streak');
const elStreakRecord = document.getElementById('streak-record');
const elStreakMultiplier = document.getElementById('streak-multiplier');
// particlesContainer is declared in renderer.js

function updateStatsUI() {
  elGold.textContent = Math.floor(gameState.gold).toLocaleString();
  elTotalFlips.textContent = gameState.totalFlips.toLocaleString();
  elLifetimeGold.textContent = Math.floor(gameState.lifetimeGold).toLocaleString();
  elCurrentStreak.textContent = gameState.currentStreak.toLocaleString();
  elStreakRecord.textContent = gameState.streakRecord.toLocaleString();
  let multiText = gameState.multiplier + 'x';
  if (gameState.isGoldRush) {
      multiText += ' (GOLD RUSH)';
  }
  elStreakMultiplier.textContent = multiText;

  // Update Frenzy Bar
  const frenzyBar = document.getElementById('frenzy-bar');
  if (frenzyBar) {
      frenzyBar.style.width = Math.min(100, Math.max(0, gameState.frenzy)) + '%';
  }
}

function updateShopUI() {
  const alchemyList = document.getElementById('alchemy-list');
  alchemyList.innerHTML = '';
  if (gameState.upgrades.alchemy < ALCHEMY_TIERS.length) {
    const nextTier = ALCHEMY_TIERS[gameState.upgrades.alchemy];
    const li = document.createElement('li');
    li.className = 'shop-item';
    li.innerHTML = `
      <div class="shop-item-controls">
        <div>
          <div class="shop-item-title">${nextTier.name}</div>
          <div class="shop-item-desc">Multiplies base value to ${nextTier.multiplier}x</div>
        </div>
        <button onclick="purchaseAlchemy()" ${gameState.gold < nextTier.cost ? 'disabled' : ''}>Cost: $${nextTier.cost.toLocaleString()}</button>
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
          <button onclick="purchaseApparatus('${a.id}')" ${gameState.gold < a.baseCost ? 'disabled' : ''}>Cost: $${a.baseCost.toLocaleString()}</button>
        </div>
      `;
      apparatusList.appendChild(li);
    }
  });

  const autoList = document.getElementById('automation-list');
  autoList.innerHTML = '';
  AUTOMATION.forEach(a => {
    const count = gameState.upgrades[a.id] || 0;
    const cost = Math.floor(a.baseCost * Math.pow(a.r, count));
    const li = document.createElement('li');
    li.className = 'shop-item';
    li.innerHTML = `
      <div class="shop-item-controls">
        <div>
          <div class="shop-item-title">${a.name} (Lvl ${count})</div>
          <div class="shop-item-desc">${a.desc}</div>
        </div>
        <button onclick="purchaseAutomation('${a.id}')" ${gameState.gold < cost ? 'disabled' : ''}>Cost: $${cost.toLocaleString()}</button>
      </div>
    `;
    autoList.appendChild(li);
  });
}

function updateCityUI() {
  document.getElementById('current-city').textContent = CITIES[gameState.currentCityIndex].name;
  document.getElementById('cities-visited').textContent = gameState.citiesVisited;
  document.getElementById('influence-tokens').textContent = gameState.influenceTokens;
  
  const list = document.getElementById('cities-list');
  list.innerHTML = '';
  
  CITIES.forEach((city, index) => {
    if (index === gameState.currentCityIndex) return; // Skip current
    
    const cost = 10000 * Math.pow(10, gameState.citiesVisited);
    const li = document.createElement('div');
    li.style.marginBottom = '10px';
    li.innerHTML = `
      <strong>${city.name}</strong><br>
      <span style="font-size: 0.8em; color: #94a3b8;">${city.desc}</span><br>
      <button onclick="relocateCity(${index})" ${gameState.gold < cost ? 'disabled' : ''}>Relocate (Cost: $${cost.toLocaleString()})</button>
    `;
    list.appendChild(li);
  });
  
  if (gameState.influenceTokens >= 5) {
    document.getElementById('prestige-layer-2').classList.remove('hidden');
    updateDominationUI();
  }
}

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

document.getElementById('btn-save').addEventListener('click', () => { saveGame(); spawnFloatingText("Saved!", "#4ade80"); });
document.getElementById('btn-load').addEventListener('click', () => { loadGame(); updateStatsUI(); updateShopUI(); updateCityUI(); spawnFloatingText("Loaded!", "#4ade80"); });
document.getElementById('btn-export').addEventListener('click', exportGame);
document.getElementById('btn-import').addEventListener('click', importGame);
document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm("HARD RESET: Are you sure you want to delete all progress?")) {
        localStorage.removeItem(SAVE_KEY);
        location.reload();
    }
});

const volumeSlider = document.getElementById('volume-slider');
if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
        AudioSystem.masterVolume = parseFloat(e.target.value);
        AudioSystem.updateVolume();
    });
}
const btnAudioToggle = document.getElementById('btn-audio-toggle');
if (btnAudioToggle) {
    btnAudioToggle.addEventListener('click', () => {
        AudioSystem.muted = !AudioSystem.muted;
        AudioSystem.updateVolume();
        btnAudioToggle.textContent = AudioSystem.muted ? '🔇 Unmute' : '🔊 Mute';
    });
}

function openStatsModal() {
    const modal = document.getElementById('stats-modal');
    if (!modal) return;
    document.getElementById('stats-modal-total-flips').textContent = gameState.totalFlips.toLocaleString();
    document.getElementById('stats-modal-lifetime-gold').textContent = Math.floor(gameState.lifetimeGold).toLocaleString();
    document.getElementById('stats-modal-streak-record').textContent = gameState.streakRecord.toLocaleString();
    document.getElementById('stats-modal-cities-visited').textContent = gameState.citiesVisited.toLocaleString();
    modal.classList.remove('hidden');
}

function closeStatsModal() {
    const modal = document.getElementById('stats-modal');
    if (modal) modal.classList.add('hidden');
}
