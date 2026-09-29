// Web Audio API synthesizer for realistic emergency dispatch sound effects

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  // Two-tone emergency alert siren pulse (European/modern Hi-Lo siren)
  public playEmergencyAlert() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.05);

      // Hi-Lo siren pattern
      osc.frequency.setValueAtTime(960, now);
      osc.frequency.setValueAtTime(960, now + 0.25);
      osc.frequency.setValueAtTime(770, now + 0.26);
      osc.frequency.setValueAtTime(770, now + 0.50);
      osc.frequency.setValueAtTime(960, now + 0.51);
      osc.frequency.setValueAtTime(960, now + 0.75);
      osc.frequency.setValueAtTime(770, now + 0.76);
      osc.frequency.setValueAtTime(770, now + 1.0);

      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.15);
    } catch {
      // Audio playback silently guarded
    }
  }

  // Radio walkie-talkie chirp / PTT click
  public playRadioClick(start = true) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(start ? 1200 : 800, now);
      osc.frequency.exponentialRampToValueAtTime(start ? 1800 : 500, now + 0.08);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // guard
    }
  }

  // Soft UI notification beep
  public playNotification() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.setValueAtTime(1320, now + 0.08); // E6

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {
      // guard
    }
  }
}

export const soundManager = new SoundManager();
