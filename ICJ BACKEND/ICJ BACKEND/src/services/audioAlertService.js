/**
 * AudioAlertService — ICJ Enterprise Platform
 * Uses HTML5 Web Audio API Synth (AudioContext) to play pleasant, executive 2-tone bell chimes
 * through computer or mobile speakers when high-priority alerts occur.
 * Zero external audio file dependencies.
 */

class AudioAlertService {
  constructor() {
    this.audioCtx = null;
    this.loopInterval = null;
    this.isLooping = false;
  }

  initAudioContext() {
    if (!this.audioCtx && typeof window !== "undefined") {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  /**
   * Check if Continuous Emergency Siren Loop is Currently Running
   */
  isLoopingActive() {
    return Boolean(this.isLooping);
  }

  /**
   * Start Continuous Emergency Siren Audio Loop (Rings until stopContinuousLoop is called)
   */
  startContinuousLoop() {
    if (this.isLooping) return;
    this.isLooping = true;
    this.playSLAWarningChime();

    this.loopInterval = setInterval(() => {
      if (this.isLooping) {
        this.playSLAWarningChime();
      } else {
        this.stopContinuousLoop();
      }
    }, 1800);
  }

  /**
   * Stop Continuous Emergency Siren Audio Loop
   */
  stopContinuousLoop() {
    this.isLooping = false;
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
  }

  /**
   * Play Double Beep Chime (High Priority Alert)
   */
  playBeepSound() {
    this.playSLAWarningChime();
  }

  /**
   * Play Gentle Single Chime (Routine Info)
   */
  playGentleChime() {
    this.playNewMemberChime();
  }

  /**
   * Play Pleasant Executive 2-Tone Bell Chime (E5 -> B5 Bell Chime)
   */
  playNewMemberChime() {
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;

      // Note 1: E5 (659.25 Hz)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Note 2: B5 (987.77 Hz) - played 150ms later
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(987.77, now + 0.15);
      gain2.gain.setValueAtTime(0.4, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.9);
    } catch (e) {
      console.warn("Audio chime playback error:", e);
    }
  }

  /**
   * Play Urgent SLA Warning Chime (High Bell Alert)
   */
  playSLAWarningChime() {
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.3); // E6
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.7);
    } catch (e) {
      console.warn("Audio SLA warning chime error:", e);
    }
  }
}

export const audioAlertService = new AudioAlertService();
export default audioAlertService;
