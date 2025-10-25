// Global game state to persist across scenes
export const GameState = {
  lives: 3,
  maxLives: 3,
  
  reset() {
    this.lives = this.maxLives
  },
  
  loseLife() {
    this.lives = Math.max(0, this.lives - 1)
    return this.lives
  },
  
  hasLivesRemaining() {
    return this.lives > 0
  }
}

// Helper function for death handling across all levels
export function handlePlayerDeath(scene) {
  const remainingLives = GameState.loseLife()
  
  scene.sound.stopAll()
  scene.scene.stop("UIScene")
  
  if (remainingLives > 0) {
    // Still have lives - restart current level
    scene.scene.restart()
  } else {
    // Out of lives - game over
    scene.scene.start("GameOverUIScene", { 
      currentLevelKey: scene.scene.key,
      finalLives: 0
    })
  }
}

