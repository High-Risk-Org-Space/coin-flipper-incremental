import re

with open('web/game.js', 'r') as f:
    content = f.read()

# Replace Gamble Mini-Game logic with Slot Machine logic
slot_logic = """
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
"""

content = re.sub(r"// Gamble Mini-Game.*?activeWager = null;\n  \}\n\}", slot_logic, content, flags=re.DOTALL)

with open('web/game.js', 'w') as f:
    f.write(content)
