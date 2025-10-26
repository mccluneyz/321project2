// Simple audio generation using Web Audio API
export class AudioHelper {
    constructor() {
        this.audioContext = null;
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioContext;
    }

    // Collect item sound - pleasant chime
    playCollectSound(volume = 0.3) {
        const ctx = this.init();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
    }

    // Level complete sound - victory fanfare
    playLevelCompleteSound(volume = 0.15) {
        const ctx = this.init();
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        
        notes.forEach((freq, index) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.15);
            
            gainNode.gain.setValueAtTime(volume, ctx.currentTime + index * 0.15);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.15 + 0.3);
            
            oscillator.start(ctx.currentTime + index * 0.15);
            oscillator.stop(ctx.currentTime + index * 0.15 + 0.3);
        });
    }

    // Throw item sound - whoosh
    playThrowSound(volume = 0.3) {
        const ctx = this.init();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        
        oscillator.type = 'sawtooth';
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
    }

    // Boss/enemy hit sound - impact
    playHitSound(volume = 0.3) {
        const ctx = this.init();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(150, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        oscillator.type = 'square';
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
    }

    // Simple background music loop - city theme
    playCityTheme(volume = 0.2) {
        const ctx = this.init();
        const melody = [261.63, 329.63, 392.00, 329.63]; // C4, E4, G4, E4
        let noteIndex = 0;
        
        const playNote = () => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.frequency.setValueAtTime(melody[noteIndex % melody.length], ctx.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(volume, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.4);
            
            noteIndex++;
        };
        
        // Play first note immediately
        playNote();
        
        // Return interval ID so it can be stopped
        return setInterval(playNote, 500);
    }
}

// Global instance
window.gameAudio = new AudioHelper();

