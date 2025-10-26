// Global game statistics tracker
export class GameStats {
  constructor() {
    this.reset()
  }
  
  reset() {
    this.enemiesKilled = 0
    this.damageDealt = 0
    this.damageTaken = 0
    this.deaths = 0
    this.startTime = Date.now()
    this.endTime = null
    this.totalPlayTime = 0 // in seconds
  }
  
  addEnemyKill() {
    this.enemiesKilled++
  }
  
  addDamageDealt(amount) {
    this.damageDealt += amount
  }
  
  addDamageTaken(amount) {
    this.damageTaken += amount
  }
  
  addDeath() {
    this.deaths++
  }
  
  finishGame() {
    this.endTime = Date.now()
    this.totalPlayTime = Math.floor((this.endTime - this.startTime) / 1000)
  }
  
  getPlayTimeFormatted() {
    const minutes = Math.floor(this.totalPlayTime / 60)
    const seconds = this.totalPlayTime % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  
  // Calculate final score - BEST scores cap around 100
  calculateScore() {
    // Base score components (positive points)
    const killPoints = this.enemiesKilled * 2 // 2 points per enemy
    const damagePoints = Math.floor(this.damageDealt / 20) // 1 point per 20 damage dealt
    
    // Penalties (negative points)
    const deathPenalty = this.deaths * 15 // -15 points per death
    const damagePenalty = Math.floor(this.damageTaken / 15) // -1 point per 15 damage taken
    
    // Time penalty - optimal time is ~15 minutes (900 seconds)
    // Penalty increases exponentially for longer times
    const optimalTime = 900
    let timePenalty = 0
    if (this.totalPlayTime > optimalTime) {
      const extraTime = this.totalPlayTime - optimalTime
      timePenalty = Math.floor(extraTime / 60) * 3 // -3 points per minute over optimal
    }
    
    // Calculate raw score
    let rawScore = killPoints + damagePoints - deathPenalty - damagePenalty - timePenalty
    
    // Ensure minimum of 1
    rawScore = Math.max(1, rawScore)
    
    // Cap maximum at 120 (so best realistically is ~100)
    rawScore = Math.min(120, rawScore)
    
    // Apply performance multipliers for perfect runs
    let multiplier = 1.0
    if (this.deaths === 0) {
      multiplier += 0.5 // +50% for no deaths
    }
    if (this.damageTaken < 50) {
      multiplier += 0.3 // +30% for taking minimal damage
    }
    
    // Final score with multiplier
    let finalScore = Math.floor(rawScore * multiplier)
    
    // Hard cap at 120
    finalScore = Math.min(120, finalScore)
    
    return {
      finalScore,
      breakdown: {
        killPoints,
        damagePoints,
        deathPenalty,
        damagePenalty,
        timePenalty,
        multiplier
      }
    }
  }
  
  // Get letter grade based on score
  getGrade(score) {
    if (score >= 100) return 'S'
    if (score >= 85) return 'A'
    if (score >= 70) return 'B'
    if (score >= 55) return 'C'
    if (score >= 40) return 'D'
    return 'F'
  }
  
  // Get coins earned (same as score)
  getCoinsEarned() {
    return this.calculateScore().finalScore
  }
}

// Create singleton instance
export const gameStats = new GameStats()

