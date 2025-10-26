// Phaser loaded globally
import { screenSize } from './gameConfig.js'
import { gameStats } from './GameStats.js'

export class GameCompleteStatsScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameCompleteStatsScene" })
  }

  create() {
    // Finish tracking game time
    gameStats.finishGame()
    
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value
    
    // Dark background
    this.cameras.main.setBackgroundColor('#000000')
    
    // Add golden gradient overlay
    const gradient = this.add.graphics()
    gradient.fillGradientStyle(0x000000, 0x000000, 0x1a1a00, 0x1a1a00, 1)
    gradient.fillRect(0, 0, screenWidth, screenHeight)
    
    // Title
    const title = this.add.text(screenWidth / 2, 60, 'MISSION COMPLETE!', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '48px',
      fill: '#ffff00',
      stroke: '#000000',
      strokeThickness: 8,
      align: 'center'
    }).setOrigin(0.5)
    
    // Subtitle
    const subtitle = this.add.text(screenWidth / 2, 110, 'You Saved the Planet!', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '24px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5)
    
    // Calculate score
    const scoreData = gameStats.calculateScore()
    const grade = gameStats.getGrade(scoreData.finalScore)
    
    // Stats display
    let yPos = 160
    const leftX = screenWidth / 2 - 200
    const rightX = screenWidth / 2 + 200
    
    this.add.text(screenWidth / 2, yPos, '═══ PERFORMANCE STATS ═══', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '20px',
      fill: '#ffaa00',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5)
    
    yPos += 40
    
    // Stats with animations
    const stats = [
      { label: 'Enemies Defeated', value: gameStats.enemiesKilled, color: '#00ff00' },
      { label: 'Damage Dealt', value: gameStats.damageDealt, color: '#ff6600' },
      { label: 'Damage Taken', value: gameStats.damageTaken, color: '#ff0000' },
      { label: 'Deaths', value: gameStats.deaths, color: '#ff0000' },
      { label: 'Play Time', value: gameStats.getPlayTimeFormatted(), color: '#00aaff' }
    ]
    
    stats.forEach((stat, index) => {
      this.time.delayedCall(index * 300, () => {
        const statText = this.add.text(leftX, yPos, stat.label + ':', {
          fontFamily: 'RetroPixel, monospace',
          fontSize: '18px',
          fill: '#ffffff',
          stroke: '#000000',
          strokeThickness: 3
        }).setOrigin(0, 0.5).setAlpha(0)
        
        const valueText = this.add.text(rightX, yPos, stat.value.toString(), {
          fontFamily: 'RetroPixel, monospace',
          fontSize: '20px',
          fill: stat.color,
          stroke: '#000000',
          strokeThickness: 4,
          fontStyle: 'bold'
        }).setOrigin(1, 0.5).setAlpha(0)
        
        // Fade in animation
        this.tweens.add({
          targets: [statText, valueText],
          alpha: 1,
          duration: 300,
          ease: 'Power2'
        })
        
        // Play count-up sound
        this.sound.play('collect_item_sound', { volume: 0.1 })
        
        yPos += 35
      })
    })
    
    // Score breakdown section
    this.time.delayedCall(stats.length * 300 + 500, () => {
      yPos += 20
      
      this.add.text(screenWidth / 2, yPos, '═══ SCORE BREAKDOWN ═══', {
        fontFamily: 'RetroPixel, monospace',
        fontSize: '20px',
        fill: '#ffaa00',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center'
      }).setOrigin(0.5)
      
      yPos += 40
      
      const breakdown = scoreData.breakdown
      
      const scoreBreakdown = [
        { label: 'Kill Bonus', value: `+${breakdown.killPoints}`, color: '#00ff00' },
        { label: 'Damage Bonus', value: `+${breakdown.damagePoints}`, color: '#00ff00' },
        { label: 'Death Penalty', value: `-${breakdown.deathPenalty}`, color: '#ff0000' },
        { label: 'Damage Penalty', value: `-${breakdown.damagePenalty}`, color: '#ff0000' },
        { label: 'Time Penalty', value: `-${breakdown.timePenalty}`, color: '#ff0000' },
        { label: 'Multiplier', value: `×${breakdown.multiplier.toFixed(1)}`, color: '#ffaa00' }
      ]
      
      scoreBreakdown.forEach((item, index) => {
        this.time.delayedCall(index * 200, () => {
          const label = this.add.text(leftX, yPos, item.label + ':', {
            fontFamily: 'RetroPixel, monospace',
            fontSize: '16px',
            fill: '#cccccc',
            stroke: '#000000',
            strokeThickness: 3
          }).setOrigin(0, 0.5).setAlpha(0)
          
          const value = this.add.text(rightX, yPos, item.value, {
            fontFamily: 'RetroPixel, monospace',
            fontSize: '18px',
            fill: item.color,
            stroke: '#000000',
            strokeThickness: 3
          }).setOrigin(1, 0.5).setAlpha(0)
          
          this.tweens.add({
            targets: [label, value],
            alpha: 1,
            duration: 200
          })
          
          this.sound.play('collect_item_sound', { volume: 0.05 })
          
          yPos += 30
        })
      })
      
      // Final score display
      this.time.delayedCall(scoreBreakdown.length * 200 + 800, () => {
        yPos += 20
        
        // Grade display
        const gradeText = this.add.text(screenWidth / 2, yPos, `GRADE: ${grade}`, {
          fontFamily: 'RetroPixel, monospace',
          fontSize: '36px',
          fill: grade === 'S' ? '#ffff00' : grade === 'A' ? '#00ff00' : '#ffffff',
          stroke: '#000000',
          strokeThickness: 6,
          align: 'center'
        }).setOrigin(0.5).setAlpha(0).setScale(0.5)
        
        this.tweens.add({
          targets: gradeText,
          alpha: 1,
          scale: 1,
          duration: 500,
          ease: 'Back.easeOut'
        })
        
        yPos += 60
        
        // Final score
        const finalScoreText = this.add.text(screenWidth / 2, yPos, `FINAL SCORE: ${scoreData.finalScore}`, {
          fontFamily: 'RetroPixel, monospace',
          fontSize: '42px',
          fill: '#ffff00',
          stroke: '#000000',
          strokeThickness: 8,
          align: 'center'
        }).setOrigin(0.5).setAlpha(0).setScale(0.5)
        
        this.tweens.add({
          targets: finalScoreText,
          alpha: 1,
          scale: 1,
          duration: 600,
          ease: 'Back.easeOut'
        })
        
        // Play victory sound
        this.sound.play('level_complete_sound', { volume: 0.2 })
        
        yPos += 60
        
        // Coins earned
        const coinsText = this.add.text(screenWidth / 2, yPos, `COINS EARNED: ${scoreData.finalScore} 🪙`, {
          fontFamily: 'RetroPixel, monospace',
          fontSize: '32px',
          fill: '#ffaa00',
          stroke: '#000000',
          strokeThickness: 6,
          align: 'center'
        }).setOrigin(0.5).setAlpha(0)
        
        this.tweens.add({
          targets: coinsText,
          alpha: 1,
          duration: 400,
          delay: 300
        })
        
        // Save score to backend
        this.saveScoreToBackend(scoreData.finalScore, grade)
        
        // Continue button
        this.time.delayedCall(1500, () => {
          const continueText = this.add.text(screenWidth / 2, screenHeight - 60, 'Press SPACE to Continue', {
            fontFamily: 'RetroPixel, monospace',
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
          }).setOrigin(0.5)
          
          // Blinking animation
          this.tweens.add({
            targets: continueText,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
          })
          
          // Space key to continue
          this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
          this.input.keyboard.on('keydown-SPACE', () => {
            this.sound.stopAll()
            this.scene.start('TitleScreen')
          })
        })
      })
    })
  }
  
  async saveScoreToBackend(score, grade) {
    try {
      const response = await fetch('/Game/SaveGameScore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          score: score,
          grade: grade,
          enemiesKilled: gameStats.enemiesKilled,
          damageDealt: gameStats.damageDealt,
          damageTaken: gameStats.damageTaken,
          deaths: gameStats.deaths,
          playTime: gameStats.totalPlayTime
        })
      })
      
      if (response.ok) {
        console.log('✅ Score saved successfully!')
      } else {
        console.error('❌ Failed to save score:', response.statusText)
      }
    } catch (error) {
      console.error('❌ Error saving score:', error)
    }
  }
}

