/**
 * Web Audio API synthesized sound effects for IOI Ocean Academy BD
 * Generates natural maritime chimes, gentle ocean wave ambient audio, and UI cues
 * without requiring external sound files.
 */

class OceanAudioEngine {
  constructor() {
    this.ctx = null;
    this.ambientGain = null;
    this.sfxGain = null;
    this.isMuted = localStorage.getItem('ioi_audio_muted') === 'true';
    this.isAmbientPlaying = false;
    this.ambientNodes = [];
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = this.isMuted ? 0 : 0.3;
        this.sfxGain.connect(this.ctx.destination);

        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.value = this.isMuted ? 0 : 0.08;
        this.ambientGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    localStorage.setItem('ioi_audio_muted', muted ? 'true' : 'false');
    if (this.sfxGain) {
      this.sfxGain.gain.value = muted ? 0 : 0.3;
    }
    if (this.ambientGain) {
      this.ambientGain.gain.value = muted ? 0 : 0.08;
    }
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // Soft nautical bubble / click when selecting an option
  playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.06);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  // Harmonic maritime bell chime for correct answers
  playSuccess() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.001, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.5);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.6);
      });
    } catch (e) {
      console.warn('Success chime error', e);
    }
  }

  // Gentle low oceanic chime for incorrect answers (encouraging, not harsh)
  playIncorrect() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [311.13, 261.63]; // Eb4 -> C4
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.001, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.4);
      });
    } catch (e) {
      console.warn('Incorrect chime error', e);
    }
  }

  // Grand graduation fanfare when passing with >= 80%
  playCelebration() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const melody = [
        { f: 523.25, d: 0.12 }, // C5
        { f: 659.25, d: 0.12 }, // E5
        { f: 783.99, d: 0.14 }, // G5
        { f: 1046.5, d: 0.35 }, // C6
        { f: 880.0,  d: 0.12 }, // A5
        { f: 1046.5, d: 0.50 }  // C6 sustained
      ];
      let offset = 0;
      const now = this.ctx.currentTime;

      melody.forEach(item => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.f, now + offset);

        gain.gain.setValueAtTime(0.001, now + offset);
        gain.gain.linearRampToValueAtTime(0.25, now + offset + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + item.d);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + offset);
        osc.stop(now + offset + item.d + 0.05);
        offset += item.d * 0.85;
      });
    } catch (e) {
      console.warn('Celebration sound error', e);
    }
  }

  // Synthesized gentle ocean wave white-noise swell
  toggleAmbientWaves() {
    this.init();
    if (!this.ctx) return false;

    if (this.isAmbientPlaying) {
      this.stopAmbientWaves();
      return false;
    } else {
      this.startAmbientWaves();
      return true;
    }
  }

  startAmbientWaves() {
    if (this.isAmbientPlaying || !this.ctx) return;
    try {
      // Create pink/brown noise buffer for ocean wash
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Low pass filter for gentle deep water sound
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 420;

      // LFO to modulate filter frequency like ocean swells
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.15; // wave cycle ~6.5 seconds
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 260; // sweep between 160Hz and 680Hz
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      whiteNoise.connect(filter);
      filter.connect(this.ambientGain);

      whiteNoise.start(0);
      lfo.start(0);

      this.ambientNodes = [whiteNoise, lfo, filter, lfoGain];
      this.isAmbientPlaying = true;
    } catch (e) {
      console.warn('Ambient ocean wave error', e);
    }
  }

  stopAmbientWaves() {
    try {
      this.ambientNodes.forEach(node => {
        try { if (node.stop) node.stop(); } catch (err) {}
        try { if (node.disconnect) node.disconnect(); } catch (err) {}
      });
      this.ambientNodes = [];
      this.isAmbientPlaying = false;
    } catch (e) {
      console.warn('Error stopping ambient waves', e);
    }
  }
}

export const oceanAudio = new OceanAudioEngine();
