const AudioSystem = {
  ctx: null,
  muted: false,
  masterVolume: 0.5,
  masterGain: null,
  activeSounds: 0,
  maxActiveSounds: 32,

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.updateVolume();
    }
  },

  updateVolume() {
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : this.masterVolume;
    }
  },

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  playWhoosh() {
    this.init();
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
    gain.connect(this.masterGain);
    
    noise.start(t);
    noise.stop(t + 0.5);
  },

  playFeltThud(volMod = 1) {
    this.init();
    if (this.muted || !this.ctx || this.activeSounds >= this.maxActiveSounds) return;
    this.resume();
    
    this.activeSounds++;
    const t = this.ctx.currentTime;
    
    // Low frequency sine thump
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.1);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.5 * volMod, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(t);
    osc.stop(t + 0.2);
    
    setTimeout(() => { this.activeSounds--; }, 200);
  },

  playClink(pitchMultiplier = 1, baseFreq = 1200, material = 'Copper', volMod = 1) {
    this.init();
    if (this.muted || !this.ctx || this.activeSounds >= this.maxActiveSounds) return;
    this.resume();
    
    this.activeSounds++;
    const t = this.ctx.currentTime;
    
    setTimeout(() => { this.activeSounds--; }, 300);
    
    // Quantum material: Modulated chorus chime
    if (material === 'Quantum') {
        const freqs = [baseFreq, baseFreq * 1.01, baseFreq * 0.99];
        freqs.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            osc.type = 'triangle';
            
            // LFO for modulation
            const lfo = this.ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = 5 + i;
            
            const lfoGain = this.ctx.createGain();
            lfoGain.gain.value = 20;
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            
            osc.frequency.value = freq * pitchMultiplier;
            
            const panner = this.ctx.createStereoPanner();
            panner.pan.value = (i === 1) ? 1 : (i === 2 ? -1 : 0);
            
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.3 * volMod, t + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 1.5);
            
            osc.connect(gain);
            gain.connect(panner);
            panner.connect(this.masterGain);
            
            lfo.start(t);
            osc.start(t);
            lfo.stop(t + 1.5);
            osc.stop(t + 1.5);
        });
        return;
    }
    
    // Modal synthesis with harmonic ratios for metallic disc
    const f0 = baseFreq * pitchMultiplier;
    const modes = [f0, f0 * 1.593, f0 * 2.135, f0 * 2.653];
    
    // Damping based on material
    let damping = 0.3; // Default
    if (material === 'Copper') damping = 0.1;
    if (material === 'Silver') damping = 0.8;
    if (material === 'Gold') damping = 0.5;
    if (material === 'Platinum') damping = 1.2;

    modes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        
        // Higher modes decay faster and have lower initial volume
        const initialVol = (0.5 / (i + 1)) * volMod;
        gain.gain.linearRampToValueAtTime(initialVol, t + 0.01);
        
        const decayTime = (damping / (i * 0.5 + 1));
        gain.gain.exponentialRampToValueAtTime(0.001, t + Math.max(0.05, decayTime));
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(t);
        osc.stop(t + Math.max(0.1, decayTime + 0.1));
    });
  },


  playSlotSpin() {
    this.init();
    if (this.muted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    
    // Mechanical click
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.05);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(t);
    osc.stop(t + 0.15);
  },

  playSlotWin() {
    this.init();
    if (this.muted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    
    const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // Arpeggio
    freqs.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        
        const gain = this.ctx.createGain();
        const startTime = t + (i * 0.1);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(startTime);
        osc.stop(startTime + 0.5);
    });
  },

  playUpgrade() {
    this.init();
    if (this.muted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    
    // Rich, warm jazz/lounge chords (Major 9th - Cmaj9: C, E, G, B, D)
    const base = 261.63; // C4
    const freqs = [base, base * 1.25, base * 1.5, base * 1.875, base * 2.25]; 
    
    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine'; // Soft attack envelope best with sine/triangle
      osc.frequency.value = freq;
      
      // Soft attack envelope to prevent ear fatigue
      const gain = this.ctx.createGain();
      const startTime = t + (i * 0.05);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.2); // Slow attack
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.5); // Long decay
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(startTime);
      osc.stop(startTime + 2.0);
    });
  },

  playFanfare() {
    this.init();
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
      gain.connect(this.masterGain);
      
      osc.start(startTime);
      osc.stop(startTime + duration + 0.1);
    });
  }
};

// Expose globally for testing/interaction if needed
window.AudioSystem = AudioSystem;

AudioSystem.playFrenzyTheme = function() {
    this.init();
    if (this.muted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    
    // A fast ascending arpeggio to simulate a frenzy "theme"
    const freqs = [440, 554, 659, 880, 1108, 1318, 1760]; // A major arpeggio
    freqs.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        
        const gain = this.ctx.createGain();
        const startTime = t + (i * 0.1);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(startTime);
        osc.stop(startTime + 0.4);
    });
};
