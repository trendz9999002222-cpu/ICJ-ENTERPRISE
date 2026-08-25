/**
 * ICJ ENTERPRISE SYNTHESIZED WEB AUDIO EMERGENCY SIREN ENGINE
 * Generates an instant, high-pitch 800Hz-1200Hz police/emergency siren directly
 * through the device's hardware speakers via Web Audio API. 0 external assets required.
 */

let audioCtx = null;
let oscillator = null;
let gainNode = null;
let isSirenActive = false;
let sirenInterval = null;

export const WebAudioSirenService = {
  /**
   * Initializes or resumes the Web Audio Context
   */
  initContext() {
    if (typeof window === "undefined") return null;
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  },

  /**
   * Starts the loud emergency siren loop
   */
  startEmergencySiren() {
    if (isSirenActive) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      oscillator = ctx.createOscillator();
      gainNode = ctx.createGain();

      oscillator.type = "sawtooth";
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      let high = false;
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.start();
      isSirenActive = true;

      // Modulate frequency between 800Hz and 1200Hz for urgent police alarm effect
      sirenInterval = setInterval(() => {
        if (!isSirenActive || !oscillator || !audioCtx) return;
        const targetFreq = high ? 800 : 1250;
        oscillator.frequency.exponentialRampToValueAtTime(targetFreq, audioCtx.currentTime + 0.35);
        high = !high;
      }, 400);

      console.log("🔊 [ICJ EMERGENCY SIREN ARMED & PLAYING]");
    } catch (e) {
      console.warn("Web Audio Siren error:", e.message);
    }
  },

  /**
   * Stops and mutes the emergency siren
   */
  stopEmergencySiren() {
    if (sirenInterval) {
      clearInterval(sirenInterval);
      sirenInterval = null;
    }
    if (oscillator) {
      try {
        oscillator.stop();
        oscillator.disconnect();
      } catch {}
      oscillator = null;
    }
    if (gainNode) {
      try {
        gainNode.disconnect();
      } catch {}
      gainNode = null;
    }
    isSirenActive = false;
    console.log("🔇 [ICJ EMERGENCY SIREN STOPPED & MUTED]");
  },

  isSirenPlaying() {
    return isSirenActive;
  },
};

export default WebAudioSirenService;
