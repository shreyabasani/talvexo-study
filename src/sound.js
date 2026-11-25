// Lightweight browser audio synthesizer (zero external audio files needed)
class SoundEngine {
  constructor() {
    this.muted = false;
    this.ctx = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playTone(freq, duration = 0.15, type = 'sine', gainVal = 0.08) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Ignore audio block if browser restricts autoplay
    }
  }

  playClick() {
    this.playTone(520, 0.12, 'sine', 0.07);
  }

  playSuccess() {
    this.playTone(587.33, 0.12, 'triangle', 0.08);
    setTimeout(() => this.playTone(880, 0.22, 'triangle', 0.08), 90);
  }

  playNeutral() {
    this.playTone(392, 0.18, 'sine', 0.06);
  }

  playWarning() {
    this.playTone(440, 0.14, 'square', 0.04);
  }

  playBadge() {
    this.playTone(523.25, 0.14, 'triangle', 0.08);
    setTimeout(() => this.playTone(659.25, 0.14, 'triangle', 0.08), 100);
    setTimeout(() => this.playTone(783.99, 0.28, 'triangle', 0.09), 200);
  }
}

export const soundEngine = new SoundEngine();
