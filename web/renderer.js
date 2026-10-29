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
  bounces: 0,
  wobbleTime: 0
};

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

  // Dynamic specular light based on rotation
  const lightAngle = (coinState.rotation % (Math.PI * 2)) / (Math.PI * 2);

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
  drawCoin();
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
        const volMod = 1 - (coinState.bounces * 0.2); // Decay volume
        AudioSystem.playClink(coinProps.pitch, coinProps.baseFreq, coinProps.name, volMod);
      } else {
        // Table flutter
        if (coinState.bounces < 5) { // Micro bounces
             coinState.vz = Math.abs(coinState.vz) * 0.25;
             coinState.vRot *= 0.3;
             coinState.bounces++;
             const volMod = Math.max(0.01, 0.5 - (coinState.bounces * 0.1));
             AudioSystem.playClink(coinProps.pitch, coinProps.baseFreq, coinProps.name, volMod);
        } else {
            // Initiate wobble phase
            if (coinState.wobbleTime === 0) {
                 coinState.wobbleTime = 1;
                 const rotMod = (coinState.rotation % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
                 const landedHeads = rotMod < Math.PI / 2 || rotMod > Math.PI * 1.5;
                 coinState.rotation = landedHeads ? 0 : Math.PI;
                 coinState.result = landedHeads ? 'heads' : 'tails';
            }
            
            // Micro-wobble dampening
            if (coinState.wobbleTime > 0) {
                 const dampening = Math.exp(-coinState.wobbleTime * 0.15); // Exponential decay
                 const wobbleOffset = Math.sin(coinState.wobbleTime * 0.5) * 0.1 * dampening;
                 coinState.rotation += wobbleOffset;
                 coinState.wobbleTime++;
                 
                 if (dampening < 0.01) { // Wobble finished
                      coinState.isFlipping = false;
                      coinState.wobbleTime = 0;
                      // Ensure it's perfectly snapped at end of wobble
                      coinState.rotation = coinState.result === 'heads' ? 0 : Math.PI;
                      onCoinLanded(coinState.result);
                 }
            }
        }
      }
    }
  }
}

setInterval(physicsLoop, 1000 / 60);
requestAnimationFrame(renderLoop);

// Hook required by physicsLoop

let onCoinLanded = (result) => { console.log("Landed:", result); };
