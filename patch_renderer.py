import re

with open('web/renderer.js', 'r') as f:
    content = f.read()

# Add drawHelpers logic
helper_rendering = """
function drawHelpers(ctx) {
  const numHelpers = gameState.helpers.length;
  gameState.helpers.forEach((helper, i) => {
      const angle = (i / 7) * Math.PI * 2; // match spawn logic
      const radius = Math.min(canvas.width, canvas.height) / 2 - 25; 
      const hx = canvas.width / 2 + Math.cos(angle) * radius;
      const hy = canvas.height / 2 + Math.sin(angle) * radius;
      
      ctx.save();
      ctx.translate(hx, hy);
      
      // Draw body (circle)
      ctx.fillStyle = '#1e293b'; // Slate 800
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw Arms based on animState
      ctx.fillStyle = '#e2e8f0'; // slate 200 gloves
      if (helper.animState === 1) { // Toss
          // Arm extended towards center
          const throwAngle = angle + Math.PI; // point inwards
          ctx.beginPath();
          ctx.arc(Math.cos(throwAngle)*20, Math.sin(throwAngle)*20, 5, 0, Math.PI * 2);
          ctx.fill();
      } else { // Idle
          ctx.beginPath();
          ctx.arc(-10, 10, 5, 0, Math.PI * 2);
          ctx.arc(10, 10, 5, 0, Math.PI * 2);
          ctx.fill();
      }

      // Draw Hat
      if (helper.equippedHat) {
          ctx.fillStyle = '#000'; // Default black hat base
          if (helper.equippedHat === 'visor') ctx.fillStyle = 'rgba(0,128,0,0.5)';
          if (helper.equippedHat === 'topHat') ctx.fillStyle = '#222';
          if (helper.equippedHat === 'cowboy') ctx.fillStyle = '#8b4513';
          if (helper.equippedHat === 'jester') ctx.fillStyle = '#800080';
          if (helper.equippedHat === 'crown') ctx.fillStyle = '#ffd700';

          ctx.beginPath();
          // Simple hat representation
          ctx.fillRect(-10, -15, 20, 10);
          if (helper.equippedHat === 'topHat' || helper.equippedHat === 'crown') {
             ctx.fillRect(-6, -25, 12, 10);
          }
      }

      ctx.restore();
  });
}
"""

content = content.replace("function renderLoop() {", helper_rendering + "\nfunction renderLoop() {")
content = content.replace("activeCoins.forEach(coin => drawCoin(coin));", "activeCoins.forEach(coin => drawCoin(coin));\n  drawHelpers(ctx);")

with open('web/renderer.js', 'w') as f:
    f.write(content)
