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


  const helperList = document.getElementById('helper-list');
  if (helperList) {
      helperList.innerHTML = '';
      const helperCost = 500 * Math.pow(2, gameState.helpers.length);
      if (gameState.helpers.length < 6) {
          const li = document.createElement('li');
          li.className = 'shop-item';
          li.innerHTML = `
            <div class="shop-item-controls">
              <div>
                <div class="shop-item-title">Hire Little Helper (${gameState.helpers.length}/6)</div>
                <div class="shop-item-desc">Automatically tosses coins onto the table.</div>
              </div>
              <button onclick="hireHelper()" ${gameState.gold < helperCost ? 'disabled' : ''}>Cost: ${helperCost.toLocaleString()}</button>
            </div>
          `;
          helperList.appendChild(li);
      } else {
          helperList.innerHTML = '<li>Max Helpers Reached!</li>';
      }
  }

  const hatList = document.getElementById('hat-list');
  if (hatList && typeof HATS !== 'undefined') {
      hatList.innerHTML = '';
      HATS.forEach(hat => {
          const li = document.createElement('li');
          li.className = 'shop-item';
          const isOwned = gameState.hatsOwned.includes(hat.id);
          const isEquipped = gameState.activeHat === hat.id;
          
          let btnHTML = '';
          if (isEquipped) {
              btnHTML = '<button disabled>Equipped</button>';
          } else if (isOwned) {
              btnHTML = `<button onclick="equipHat('${hat.id}')">Equip</button>`;
          } else {
              btnHTML = `<button onclick="buyHat('${hat.id}')" ${gameState.gold < hat.cost ? 'disabled' : ''}>Cost: ${hat.cost.toLocaleString()}</button>`;
          }

          li.innerHTML = `
            <div class="shop-item-controls">
              <div>
                <div class="shop-item-title">${hat.name}</div>
                <div class="shop-item-desc">${hat.desc}</div>
              </div>
              ${btnHTML}
            </div>
          `;
          hatList.appendChild(li);
      });
  }

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


const tableclothSelector = document.getElementById('tablecloth-selector');
const canvasContainer = document.getElementById('canvas-container');

if (tableclothSelector && canvasContainer) {
    // Set initial class
    canvasContainer.classList.add(tableclothSelector.value);
    
    tableclothSelector.addEventListener('change', (e) => {
        canvasContainer.classList.remove('cloth-green', 'cloth-obsidian', 'cloth-crimson', 'cloth-purple');
        canvasContainer.classList.add(e.target.value);
    });
}
function openTalentModal() {
    const modal = document.getElementById('talent-tree-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeTalentModal() {
    const modal = document.getElementById('talent-tree-modal');
    if (modal) modal.classList.add('hidden');
}


function updateTalentTreeUI() {
    const tokensEl = document.getElementById('sacrifice-tokens');
    if (tokensEl) tokensEl.textContent = gameState.sacrificeTokens;
    const modalTokensEl = document.getElementById('modal-sacrifice-tokens');
    if (modalTokensEl) modalTokensEl.textContent = gameState.sacrificeTokens;
    
    const treeContainer = document.getElementById('talent-tree-container');
    if (treeContainer && typeof TALENT_NODES !== 'undefined') {
        treeContainer.innerHTML = '';
        for (const [id, node] of Object.entries(TALENT_NODES)) {
            const isOwned = gameState.talents.includes(id);
            const canAfford = gameState.sacrificeTokens >= node.cost;
            const reqsMet = node.req.every(req => gameState.talents.includes(req));
            
            const btn = document.createElement('button');
            btn.style.margin = '5px';
            btn.innerHTML = `${node.name}<br><small>${node.desc}</small><br>Cost: ${node.cost}`;
            
            if (isOwned) {
                btn.style.backgroundColor = '#10b981'; // Green
                btn.disabled = true;
            } else if (!reqsMet || !canAfford) {
                btn.disabled = true;
                btn.style.opacity = '0.5';
            } else {
                btn.onclick = () => purchaseTalent(id);
            }
            
            treeContainer.appendChild(btn);
        }
    }
}

