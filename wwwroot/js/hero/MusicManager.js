// Global music manager to handle continuous music across levels
export const MusicManager = {
  currentMusic: null,
  currentMusicKey: null,
  
  playLevelMusic(scene, musicKey, volume = 0.4) {
    // If this music is already playing, don't restart it
    if (this.currentMusicKey === musicKey && this.currentMusic && this.currentMusic.isPlaying) {
      console.log(`🎵 Music "${musicKey}" already playing, continuing...`)
      return
    }
    
    // Stop previous music if different
    if (this.currentMusic && this.currentMusicKey !== musicKey) {
      console.log(`🎵 Stopping "${this.currentMusicKey}", starting "${musicKey}"`)
      this.currentMusic.stop()
      this.currentMusic = null
      this.currentMusicKey = null
    }
    
    // Start new music
    if (scene.sound && scene.sound.get(musicKey)) {
      // Music already exists as a sound object
      this.currentMusic = scene.sound.get(musicKey)
      if (!this.currentMusic.isPlaying) {
        this.currentMusic.play()
      }
    } else {
      // Create new music
      this.currentMusic = scene.sound.add(musicKey, { volume, loop: true })
      this.currentMusic.play()
    }
    
    this.currentMusicKey = musicKey
    console.log(`🎵 Now playing: "${musicKey}"`)
  },
  
  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.stop()
      this.currentMusic = null
      this.currentMusicKey = null
    }
  },
  
  pauseMusic() {
    if (this.currentMusic && this.currentMusic.isPlaying) {
      this.currentMusic.pause()
    }
  },
  
  resumeMusic() {
    if (this.currentMusic && this.currentMusic.isPaused) {
      this.currentMusic.resume()
    }
  }
}

