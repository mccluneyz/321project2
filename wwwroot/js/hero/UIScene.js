// Phaser loaded globally
import { screenSize } from './gameConfig.js'

export class UIScene extends Phaser.Scene {
  constructor() {
    super({
      key: "UIScene",
    })
  }

  init(data) {
    this.currentLevelKey = data.currentLevelKey
    this.playerHealth = data.playerHealth
    this.maxHealth = data.maxHealth
    this.recyclablesCollected = data.recyclablesCollected
    this.maxRecyclables = data.maxRecyclables
  }

  create() {
    // Create health bar
    this.createHealthBar()
    
    // Create inventory display
    this.createInventoryDisplay()
    
    // Create recyclables counter
    this.createRecyclablesCounter()
    
    // Create boss health bar (hidden initially)
    this.createBossHealthBar()
    
    // Get reference to game scene
    this.gameScene = this.scene.get(this.currentLevelKey)
  }

  createHealthBar() {
    const screenWidth = screenSize.width.value
    
    // Health bar background
    this.healthBarBg = this.add.graphics()
    this.healthBarBg.fillStyle(0x000000, 0.5)
    this.healthBarBg.fillRect(20, 20, 200, 20)
    
    // Health bar
    this.healthBar = this.add.graphics()
    
    // Health text
    this.healthText = this.add.text(25, 22, 'HEALTH', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '16px',
      fill: '#ffffff'
    })
  }
  
  createInventoryDisplay() {
    // Inventory background box below health (expanded for more items)
    this.inventoryBg = this.add.graphics()
    this.inventoryBg.fillStyle(0x000000, 0.7)
    this.inventoryBg.fillRect(20, 50, 200, 110)
    
    // Inventory label
    this.inventoryLabel = this.add.text(25, 52, 'INVENTORY:', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '14px',
      fill: '#ffaa00'
    })
    
    // Shield icon/text (hidden initially)
    this.shieldIcon = this.add.text(30, 70, '🛡️ Shield (Q)', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '14px',
      fill: '#00ffff'
    })
    this.shieldIcon.setVisible(false)
    
    // Sword icon/text (hidden initially)
    this.swordIcon = this.add.text(30, 90, '⚔️ Sword (R)', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '14px',
      fill: '#ff6600'
    })
    this.swordIcon.setVisible(false)
    
    // Glider icon/text (hidden initially)
    this.gliderIcon = this.add.text(30, 110, '🪂 Glider (Space)', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '14px',
      fill: '#00ff00'
    })
    this.gliderIcon.setVisible(false)
    
    // Double Jump icon/text (hidden initially)
    this.doubleJumpIcon = this.add.text(30, 130, '☁️ Double Jump', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '14px',
      fill: '#88ddff'
    })
    this.doubleJumpIcon.setVisible(false)
    
    // Update visibility based on registry
    this.updateInventoryDisplay()
  }
  
  updateInventoryDisplay() {
    // Check if player has items
    const hasShield = this.game.registry.get('playerHasShield') || false
    const hasSword = this.game.registry.get('playerHasSword') || false
    const hasGlider = this.game.registry.get('playerHasGlider') || false
    const hasDoubleJump = this.game.registry.get('playerHasDoubleJump') || false
    
    this.shieldIcon.setVisible(hasShield)
    
    // Update sword icon if it exists
    if (this.swordIcon) {
      this.swordIcon.setVisible(hasSword)
    }
    
    // Update glider icon if it exists
    if (this.gliderIcon) {
      this.gliderIcon.setVisible(hasGlider)
    }
    
    // Update double jump icon if it exists
    if (this.doubleJumpIcon) {
      this.doubleJumpIcon.setVisible(hasDoubleJump)
    }
  }

  createRecyclablesCounter() {
    const screenWidth = screenSize.width.value
    
    // Show level number at top center
    const levelDisplay = this.getLevelDisplay(this.currentLevelKey)
    this.levelText = this.add.text(screenWidth / 2, 20, 
      levelDisplay, {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '24px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5, 0)
    
    // Show ammo counter in top right
    this.recyclablesText = this.add.text(screenWidth - 20, 20, 
      `Ammo: Unlimited`, {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '18px',
      fill: '#00ff00',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(1, 0)
  }
  
  getLevelDisplay(levelKey) {
    // Extract world and level numbers from key like "Level_1_2" or "Level_1_5_Boss"
    const match = levelKey.match(/Level_(\d+)_(\d+)/)
    if (match) {
      const world = match[1]
      const level = match[2]
      
      // Map world numbers to names
      const worldNames = {
        '1': 'City',
        '2': 'Desert', 
        '3': 'Factory',
        '4': 'Ocean',
        '5': 'Wasteland'
      }
      
      const worldName = worldNames[world] || 'Unknown'
      return `${worldName} ${world}-${level}`
    }
    return 'Level'
  }

  updateHealthBar(healthPercentage) {
    // Clear and redraw health bar
    this.healthBar.clear()
    
    // Choose color based on health percentage
    let color = 0x00ff00 // Green
    if (healthPercentage < 30) {
      color = 0xff0000 // Red
    } else if (healthPercentage < 60) {
      color = 0xffff00 // Yellow
    }
    
    this.healthBar.fillStyle(color)
    this.healthBar.fillRect(22, 22, (196 * healthPercentage / 100), 16)
  }

  updateHealth(health) {
    this.playerHealth = health
    const healthPercentage = (this.playerHealth / this.maxHealth) * 100
    this.updateHealthBar(healthPercentage)
  }

  updateRecyclables(count) {
    // Always unlimited
    this.recyclablesText.setText(`Ammo: Unlimited`)
  }

  createBossHealthBar() {
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value
    
    // Boss health bar container (centered at top)
    const bossBarWidth = 400
    const bossBarX = (screenWidth - bossBarWidth) / 2
    
    // Boss name text
    this.bossNameText = this.add.text(screenWidth / 2, 20, 'BOSS', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '20px',
      fill: '#ff0000',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5, 0).setVisible(false)
    
    // Boss health bar background
    this.bossHealthBarBg = this.add.graphics().setVisible(false)
    this.bossHealthBarBg.fillStyle(0x000000, 0.7)
    this.bossHealthBarBg.fillRect(bossBarX, 50, bossBarWidth, 25)
    
    // Boss health bar
    this.bossHealthBar = this.add.graphics().setVisible(false)
    
    this.bossBarX = bossBarX
    this.bossBarWidth = bossBarWidth
  }

  showBossHealthBar(name = 'BOSS') {
    this.bossNameText.setText(name).setVisible(true)
    this.bossHealthBarBg.setVisible(true)
    this.bossHealthBar.setVisible(true)
  }

  hideBossHealthBar() {
    this.bossNameText.setVisible(false)
    this.bossHealthBarBg.setVisible(false)
    this.bossHealthBar.setVisible(false)
  }

  updateBossHealth(health, maxHealth, isInvincible = false) {
    const healthPercentage = (health / maxHealth) * 100
    
    // Clear and redraw boss health bar
    this.bossHealthBar.clear()
    
    // Boss health is always red (or gold if invincible)
    const barColor = isInvincible ? 0xFFD700 : 0xff0000
    this.bossHealthBar.fillStyle(barColor)
    this.bossHealthBar.fillRect(this.bossBarX + 2, 52, ((this.bossBarWidth - 4) * healthPercentage / 100), 21)
    
    // Update boss text to show INVINCIBLE
    if (this.bossNameText) {
      if (isInvincible) {
        this.bossNameText.setText('POLLUTION BOSS - INVINCIBLE')
        this.bossNameText.setColor('#FFD700')
      } else {
        this.bossNameText.setText('POLLUTION BOSS')
        this.bossNameText.setColor('#ff0000')
      }
    }
    
    // Show boss health bar if not visible
    if (!this.bossHealthBar.visible) {
      this.showBossHealthBar()
    }
  }

  update() {
    // Update health display
    if (this.gameScene && this.gameScene.playerHealth !== undefined) {
      const healthPercentage = (this.gameScene.playerHealth / this.maxHealth) * 100
      this.updateHealthBar(healthPercentage)
    }
    
    // Update inventory display every frame
    this.updateInventoryDisplay()
  }
}
