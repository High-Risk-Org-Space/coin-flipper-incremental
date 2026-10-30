import re

with open('web/game.js', 'r') as f:
    content = f.read()

# Replace the Prestige Layer 1 relocation code with The Sacrifice logic
sacrifice_logic = """
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
"""

content = re.sub(r"// Prestige Layer 1: City Relocation.*?\}", sacrifice_logic, content, flags=re.DOTALL)

# Add Golden Multipliers check to processFlipResult
content = content.replace("let baseVal = gameState.baseCoinValue;", "let baseVal = gameState.baseCoinValue;\n  if (gameState.talents.includes('goldenMultiplier')) baseVal *= 2;")

with open('web/game.js', 'w') as f:
    f.write(content)
