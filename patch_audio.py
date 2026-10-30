import re

with open('web/audio.js', 'r') as f:
    content = f.read()

slot_audio = """
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
"""

content = content.replace("  playUpgrade() {", slot_audio + "\n  playUpgrade() {")

with open('web/audio.js', 'w') as f:
    f.write(content)
