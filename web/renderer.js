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
let activeCoins = [];

// Materials dictionary
const MATERIALS = {
  Copper: { name: 'Copper', baseColor: '#b87333', edgeColor: '#8c5222', text: 'COPPER', textColor: '#5e3412', pitch: 1, baseFreq: 1200 },
  Silver: { name: 'Silver', baseColor: '#c0c0c0', edgeColor: '#808080', text: 'SILVER', textColor: '#555555', pitch: 1, baseFreq: 3200 },
  Gold:   { name: 'Gold', baseColor: '#ffd700', edgeColor: '#b8860b', text: 'GOLD',   textColor: '#8b6508', pitch: 1, baseFreq: 2600 },
  Platinum: { name: 'Platinum', baseColor: '#e5e4e2', edgeColor: '#a0a0a0', text: 'PLAT', textColor: '#404040', pitch: 1, baseFreq: 4400 },
  Crypto: { name: 'Crypto', baseColor: '#f7931a', edgeColor: '#c4710b', text: 'BTC',  textColor: '#ffffff', pitch: 1, baseFreq: 1500 },
  Quantum:{ name: 'Quantum', baseColor: '#4b0082', edgeColor: '#8a2be2', text: 'QUANTUM',textColor: '#00ffff', pitch: 1, baseFreq: 1000 }
};

function updateCoinMaterial(materialName) {
  if (MATERIALS[materialName]) {
    Object.assign(coinProps, MATERIALS[materialName]);
  }
}

// Draw the 2.5D coin
function drawCoin(coin) {
  
  
  const cx = canvas.width / 2 + coin.x;
  const cy = canvas.height / 2 + coin.y;
  
  // Scale based on Z (height)
  const scale = 1 + (coin.z / 300);
  
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  
  // Simulate 3D rotation with scaling on Y axis
  const rotYScale = Math.cos(coin.rotation);
  const isHeads = rotYScale > 0;
  
  const currentHeight = coinProps.radius * Math.abs(rotYScale);
  const offset = coinProps.thickness * (rotYScale > 0 ? 1 : -1) * (1 - Math.abs(rotYScale));

  // Dynamic specular light based on rotation
  const lightAngle = (coin.rotation % (Math.PI * 2)) / (Math.PI * 2);

  // Draw edge (increased rim thickness shading)
  if (Math.abs(rotYScale) < 0.98) {
    // Edge body
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
    
    // Edge shading
    const edgeGrad = ctx.createLinearGradient(-coinProps.radius, 0, coinProps.radius, 0);
    edgeGrad.addColorStop(0, 'rgba(0,0,0,0.6)');
    edgeGrad.addColorStop(0.5, `rgba(255,255,255,${0.2 + 0.3 * Math.sin(lightAngle * Math.PI * 4)})`);
    edgeGrad.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = edgeGrad;
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

  // Face specular shading
  const grad = ctx.createLinearGradient(-coinProps.radius, -currentHeight, coinProps.radius, currentHeight);
  grad.addColorStop(0, `rgba(255,255,255,${0.3 + 0.4 * Math.cos(lightAngle * Math.PI * 2)})`);
  grad.addColorStop(0.5, 'rgba(255,255,255,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.5)');
  
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, coinProps.radius, currentHeight, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw embossed face text/design
  if (Math.abs(rotYScale) > 0.1) {
    ctx.font = `bold ${28 * Math.abs(rotYScale)}px 'Cinzel', 'Playfair Display', serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const text = isHeads ? coinProps.text : 'TAILS';
    
    // Emboss shadow
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillText(text, 0, 2 * Math.abs(rotYScale));
    
    // Emboss highlight
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText(text, 0, -1 * Math.abs(rotYScale));

    // Text color
    ctx.fillStyle = coinProps.textColor;
    ctx.fillText(text, 0, 0);
  }

  ctx.restore();
}

function renderLoop() {
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  activeCoins.forEach(coin => drawCoin(coin));
  requestAnimationFrame(renderLoop);
}

// Particle system
function spawnFloatingText(text, color = '#d4af37') {
  const el = document.createElement('div');
  el.className = 'particle';
  el.textContent = text;
  el.style.color = color;
  
  // Randomize position near center
  const x = (canvas.offsetWidth / 2) + (Math.random() * 60 - 30) - 30; // Better horizontal spread
  const y = (canvas.offsetHeight / 2) + (Math.random() * 40 - 20) - 20; // Slightly higher start
  
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  
  particlesContainer.appendChild(el);
  
  setTimeout(() => {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, 1000);
}

function createParticle(x, y, color = '#ffd700') {
    const p = document.createElement('div');
    p.style.position = 'absolute';
    p.style.width = '5px';
    p.style.height = '5px';
    p.style.backgroundColor = color;
    p.style.borderRadius = '50%';
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 5 + 2;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity - 2; 

    particlesContainer.appendChild(p);

    let life = 1.0;
    let px = x;
    let py = y;
    let cvy = vy;

    function anim() {
        if (life <= 0) {
            if (p.parentNode) p.parentNode.removeChild(p);
            return;
        }
        life -= 0.02;
        cvy += 0.2; 
        px += vx;
        py += cvy;
        p.style.left = px + 'px';
        p.style.top = py + 'px';
        p.style.opacity = life;
        requestAnimationFrame(anim);
    }
    requestAnimationFrame(anim);
}

function spawnSparks(x, y) {
    const numSparks = 10;
    for (let i = 0; i < numSparks; i++) {
        const spark = document.createElement('div');
        spark.className = 'spark';
        
        // Random velocities
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        spark.style.left = `${x}px`;
        spark.style.top = `${y}px`;
        particlesContainer.appendChild(spark);
        
        let cx = x;
        let cy = y;
        let cvy = vy;
        let life = 1.0;
        
        const animateSpark = () => {
            if (life <= 0) {
                if (spark.parentNode) spark.parentNode.removeChild(spark);
                return;
            }
            
            cvy += 0.1; // gravity
            cx += vx;
            cy += cvy;
            life -= 0.05;
            
            spark.style.left = `${cx}px`;
            spark.style.top = `${cy}px`;
            spark.style.opacity = life;
            
            requestAnimationFrame(animateSpark);
        };
        requestAnimationFrame(animateSpark);
    }
}

// Physics Loop
function physicsLoop() {
  for (let i = activeCoins.length - 1; i >= 0; i--) {
    let coin = activeCoins[i];
    
    if (coin.isFlipping) {
      // 2D Movement
      coin.x += coin.vx;
      coin.y += coin.vy;
      
      // Boundaries
      if (coin.x - coinProps.radius < -canvas.width/2) {
        coin.x = -canvas.width/2 + coinProps.radius;
        coin.vx *= -0.8;
      } else if (coin.x + coinProps.radius > canvas.width/2) {
        coin.x = canvas.width/2 - coinProps.radius;
        coin.vx *= -0.8;
      }
      
      if (coin.y - coinProps.radius < -canvas.height/2) {
        coin.y = -canvas.height/2 + coinProps.radius;
        coin.vy *= -0.8;
      } else if (coin.y + coinProps.radius > canvas.height/2) {
        coin.y = canvas.height/2 - coinProps.radius;
        coin.vy *= -0.8;
      }

      // Gravity and movement
      coin.vz -= 0.8; // Gravity on Z
      coin.z += coin.vz;
      
      // Rotation
      coin.rotation += coin.vRot;
      
      // Bounce logic
      if (coin.z <= 0) {
        coin.z = 0;
        
        // Play thud on felt
        if (AudioSystem.playFeltThud) {
            AudioSystem.playFeltThud(Math.min(1, Math.abs(coin.vz) * 0.1));
        }

        if (coin.bounces < 2) {
          coin.vz = Math.abs(coin.vz) * 0.4;
          coin.vRot *= 0.5;
          coin.vx *= 0.8;
          coin.vy *= 0.8;
          coin.bounces++;
          const volMod = 1 - (coin.bounces * 0.2); // Decay volume
          AudioSystem.playClink(coinProps.pitch, coinProps.baseFreq, coinProps.name, volMod);
        } else {
          // Table flutter
          if (coin.bounces < 5) { // Micro bounces
               coin.vz = Math.abs(coin.vz) * 0.25;
               coin.vRot *= 0.3;
               coin.vx *= 0.6;
               coin.vy *= 0.6;
               coin.bounces++;
               const volMod = Math.max(0.01, 0.5 - (coin.bounces * 0.1));
               AudioSystem.playClink(coinProps.pitch, coinProps.baseFreq, coinProps.name, volMod);
          } else {
              // Initiate wobble phase
              if (coin.wobbleTime === 0) {
                   coin.wobbleTime = 1;
                   const rotMod = (coin.rotation % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
                   const landedHeads = rotMod < Math.PI / 2 || rotMod > Math.PI * 1.5;
                   coin.rotation = landedHeads ? 0 : Math.PI;
                   coin.result = landedHeads ? 'heads' : 'tails';
              }
              
              // Micro-wobble dampening
              if (coin.wobbleTime > 0) {
                   const dampening = Math.exp(-coin.wobbleTime * 0.15); // Exponential decay
                   const wobbleOffset = Math.sin(coin.wobbleTime * 0.5) * 0.1 * dampening;
                   coin.rotation += wobbleOffset;
                   coin.wobbleTime++;
                   
                   coin.vx *= 0.8;
                   coin.vy *= 0.8;

                   if (dampening < 0.01) { // Wobble finished
                        coin.isFlipping = false;
                        coin.wobbleTime = 0;
                        // Ensure it's perfectly snapped at end of wobble
                        coin.rotation = coin.result === 'heads' ? 0 : Math.PI;
                        onCoinLanded(coin.result, coin.isManual);
                        activeCoins.splice(i, 1);
                        continue;
                   }
              }
          }
        }
      }
    }
  }

  // Coin-on-coin collisions
  for (let i = 0; i < activeCoins.length; i++) {
    for (let j = i + 1; j < activeCoins.length; j++) {
      let c1 = activeCoins[i];
      let c2 = activeCoins[j];
      let dx = c2.x - c1.x;
      let dy = c2.y - c1.y;
      let dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 2 * coinProps.radius && dist > 0) {
        // Exchange velocity (simple elastic collision)
        let nx = dx / dist;
        let ny = dy / dist;
        let p = 2 * (c1.vx * nx + c1.vy * ny - c2.vx * nx - c2.vy * ny) / 2; // Assuming mass 1
        
        c1.vx -= p * nx;
        c1.vy -= p * ny;
        c2.vx += p * nx;
        c2.vy += p * ny;
        
        // Push apart
        let overlap = 2 * coinProps.radius - dist;
        c1.x -= overlap/2 * nx;
        c1.y -= overlap/2 * ny;
        c2.x += overlap/2 * nx;
        c2.y += overlap/2 * ny;

        // Small clink
        if (Math.abs(p) > 1) {
             AudioSystem.playClink(coinProps.pitch, coinProps.baseFreq, coinProps.name, 0.2);
        }
      }
    }
  }
}

setInterval(physicsLoop, 1000 / 60);
requestAnimationFrame(renderLoop);

// Hook required by physicsLoop

let onCoinLanded = (result) => { console.log("Landed:", result); };
