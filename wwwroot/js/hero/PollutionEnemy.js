// Phaser loaded globally

// Enemy type configurations by region
const ENEMY_TYPES = {
  city: {
    name: 'smog_blob',
    walkFrames: ['smog_blob_walk_frame1', 'smog_blob_walk_frame2'],
    dieFrames: ['smog_blob_die_frame1', 'smog_blob_die_frame2'],
    scale: 0.17,
    health: 30,
    speed: 80
  },
  desert: {
    name: 'trash_tumbleweed',
    walkFrames: ['trash_tumbleweed_walk_frame1', 'trash_tumbleweed_walk_frame2'],
    dieFrames: ['trash_tumbleweed_die_frame1', 'trash_tumbleweed_die_frame2'],
    scale: 0.17,
    health: 30,
    speed: 90
  },
  factory: {
    name: 'oil_slick',
    walkFrames: ['oil_slick_walk_frame1', 'oil_slick_walk_frame2'],
    dieFrames: ['oil_slick_die_frame1', 'oil_slick_die_frame2'],
    scale: 0.17,
    health: 35,
    speed: 70
  },
  ocean: {
    name: 'plastic_jellyfish',
    walkFrames: ['plastic_jellyfish_walk_frame1', 'plastic_jellyfish_walk_frame2'],
    dieFrames: ['plastic_jellyfish_die_frame1', 'plastic_jellyfish_die_frame2'],
    scale: 0.17,
    health: 25,
    speed: 60
  },
  wasteland: {
    name: 'toxic_barrel',
    walkFrames: ['toxic_barrel_walk_frame1', 'toxic_barrel_walk_frame2'],
    dieFrames: ['toxic_barrel_die_frame1', 'toxic_barrel_die_frame2'],
    scale: 0.17,
    health: 40,
    speed: 85
  }
}

export class PollutionEnemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, patrolDistance = 150, enemyType = 'city') {
    // Get enemy config or fallback to boss sprite
    const config = ENEMY_TYPES[enemyType] || ENEMY_TYPES.city
    
    // Check if the sprite textures exist, otherwise use boss sprites
    const firstFrame = scene.textures.exists(config.walkFrames[0]) 
      ? config.walkFrames[0] 
      : 'pollution_boss_walk_frame1'
    
    super(scene, x, y, firstFrame)
    
    // Add to scene
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    // Store enemy type and config
    this.enemyType = enemyType
    this.config = config
    
    // Enemy properties
    this.health = config.health
    this.maxHealth = config.health
    this.damage = 15
    this.walkSpeed = config.speed
    this.patrolDistance = patrolDistance
    this.startX = x
    this.facingRight = true
    this.isDying = false
    
    // Metal Skin mechanic
    this.hasMetalSkin = false
    this.metalSkinDuration = 0
    this.metalSkinCooldown = 0
    this.metalSkinChance = 0.40  // 40% chance every 3 seconds
    this.metalSkinCheckInterval = 3000  // Check every 3 seconds
    this.lastMetalSkinCheck = 0
    
    // Set up physics - enable gravity for side-scrolling game
    this.body.setGravityY(1200)
    
    // Calculate scale: enemies should be SAME SIZE or BIGGER than player
    // Player is 2 tiles (128px), enemies should be 2-2.5 tiles (128-160px)
    let targetHeight
    let actualHeight
    
    // Get actual height from texture
    const texture = this.scene.textures.get(firstFrame)
    if (texture) {
      actualHeight = texture.getSourceImage().height
      // Make enemies 2.5 tiles tall (bigger than player's 2 tiles)
      targetHeight = 2.5 * 64 // 160px
    } else {
      // Fallback sizes
      actualHeight = 560
      targetHeight = 160
    }
    
    const calculatedScale = targetHeight / actualHeight
    this.setScale(calculatedScale)
    
    // Get actual width from texture
    const actualWidth = texture ? texture.getSourceImage().width : 560
    
    // Set collision body (unscaled dimensions)
    this.unscaledBodyWidth = actualWidth * 0.7
    this.unscaledBodyHeight = actualHeight * 0.9
    this.body.setSize(this.unscaledBodyWidth, this.unscaledBodyHeight)
    
    // Set origin to bottom center for proper ground alignment
    this.setOrigin(0.5, 1.0)
    
    // Calculate offset to align body bottom center with sprite bottom center
    const unscaledOffsetX = (actualWidth - this.unscaledBodyWidth) / 2
    const unscaledOffsetY = actualHeight - this.unscaledBodyHeight
    this.body.setOffset(unscaledOffsetX, unscaledOffsetY)
    
    // Create health bar above enemy
    this.healthBarWidth = 60
    this.healthBarHeight = 6
    this.healthBarBg = scene.add.graphics().setDepth(999)
    this.healthBarFg = scene.add.graphics().setDepth(1000)
    this.updateHealthBar()
    
    // Create metal skin status text
    this.metalSkinText = scene.add.text(this.x, this.y - targetHeight - 20, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      fill: '#cccccc',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5).setDepth(1001).setVisible(false)
    
    // Store target height for positioning
    this.targetHeight = targetHeight
    
    // Create animations
    this.createAnimations()
    
    // Start walking
    this.play(this.walkAnimKey)
    this.body.setVelocityX(this.walkSpeed)
  }
  
  createAnimations() {
    const anims = this.scene.anims
    
    // Check if custom enemy sprites exist
    const spritesExist = this.scene.textures.exists(this.config.walkFrames[0])
    
    let walkKey, dieKey
    
    if (spritesExist) {
      // Use custom enemy sprites
      walkKey = `${this.config.name}_walk`
      dieKey = `${this.config.name}_die`
      
      // Walk animation (slower for better visual)
      if (!anims.exists(walkKey)) {
        anims.create({
          key: walkKey,
          frames: this.config.walkFrames.map(key => ({ key })),
          frameRate: 2, // Slower animation for front/back views
          repeat: -1
        })
      }
      
      // Death animation
      if (!anims.exists(dieKey)) {
        anims.create({
          key: dieKey,
          frames: this.config.dieFrames.map(key => ({ key })),
          frameRate: 6,
          repeat: 0
        })
      }
    } else {
      // Fallback to boss sprites
      walkKey = 'enemy_walk_fallback'
      dieKey = 'enemy_die_fallback'
      
      // Walk animation with boss sprites
      if (!anims.exists(walkKey)) {
        anims.create({
          key: walkKey,
          frames: [
            { key: 'pollution_boss_walk_frame1' },
            { key: 'pollution_boss_walk_frame2' }
          ],
          frameRate: 4,
          repeat: -1
        })
      }
      
      // Death animation with boss sprites
      if (!anims.exists(dieKey)) {
        anims.create({
          key: dieKey,
          frames: [
            { key: 'pollution_boss_die_frame1' },
            { key: 'pollution_boss_die_frame2' }
          ],
          frameRate: 6,
          repeat: 0
        })
      }
    }
    
    // Store animation keys
    this.walkAnimKey = walkKey
    this.dieAnimKey = dieKey
  }
  
  update(delta, player) {
    if (this.isDying || !this.active) return
    
    // Update health bar and metal skin text position
    if (this.healthBarBg && this.healthBarFg && this.targetHeight) {
      this.updateHealthBar()
    }
    if (this.metalSkinText && this.targetHeight) {
      this.metalSkinText.setPosition(this.x, this.y - this.targetHeight - 20)
    }
    
    // Handle metal skin duration
    if (this.hasMetalSkin) {
      this.metalSkinDuration -= delta
      if (this.metalSkinDuration <= 0) {
        this.deactivateMetalSkin()
      }
    }
    
    // Check for metal skin activation (every 5 seconds, 15% chance)
    this.lastMetalSkinCheck += delta
    if (!this.hasMetalSkin && this.lastMetalSkinCheck >= this.metalSkinCheckInterval) {
      this.lastMetalSkinCheck = 0
      if (Math.random() < this.metalSkinChance) {
        this.activateMetalSkin()
      }
    }
    
    // If player exists and is active, chase the player
    if (player && player.active) {
      const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y)
      
      // Chase player if within detection range (400px)
      if (distanceToPlayer < 400) {
        this.facingRight = player.x > this.x
        this.setFlipX(!this.facingRight)
        this.body.setVelocityX(this.facingRight ? this.walkSpeed : -this.walkSpeed)
        return
      }
    }
    
    // Default patrol behavior when player is not nearby
    const distanceFromStart = Math.abs(this.x - this.startX)
    
    if (distanceFromStart >= this.patrolDistance) {
      // Turn around
      this.facingRight = !this.facingRight
      this.setFlipX(!this.facingRight)
      this.body.setVelocityX(this.facingRight ? this.walkSpeed : -this.walkSpeed)
    }
    
    // Keep moving - removed onFloor() check so enemies keep moving
    if (this.body.velocity.x === 0) {
      // Hit something, turn around
      this.facingRight = !this.facingRight
      this.setFlipX(!this.facingRight)
      this.body.setVelocityX(this.facingRight ? this.walkSpeed : -this.walkSpeed)
    }
    
    // Random jumping for more dynamic movement
    if (this.body.onFloor() && Math.random() < 0.02) { // 2% chance per frame to jump
      this.body.setVelocityY(-250) // Jump strength
    }
  }
  
  updateHealthBar() {
    if (!this.healthBarBg || !this.healthBarFg || !this.targetHeight) return
    
    const barX = this.x - this.healthBarWidth / 2
    const barY = this.y - this.targetHeight - 10
    
    // Clear and redraw background
    this.healthBarBg.clear()
    this.healthBarBg.fillStyle(0x000000, 0.7)
    this.healthBarBg.fillRect(barX, barY, this.healthBarWidth, this.healthBarHeight)
    
    // Clear and redraw foreground
    this.healthBarFg.clear()
    const healthPercent = this.health / this.maxHealth
    const fgWidth = (this.healthBarWidth - 2) * healthPercent
    const barColor = this.hasMetalSkin ? 0x404040 : 0x00ff00  // Dark gray stone color
    this.healthBarFg.fillStyle(barColor)
    this.healthBarFg.fillRect(barX + 1, barY + 1, fgWidth, this.healthBarHeight - 2)
  }
  
  activateMetalSkin() {
    this.hasMetalSkin = true
    this.metalSkinDuration = Phaser.Math.Between(5000, 10000)  // 5-10 seconds
    this.metalSkinText.setText('Metal Skin')
    this.metalSkinText.setVisible(true)
    this.setTint(0xcccccc)  // Gray/metallic tint
  }
  
  deactivateMetalSkin() {
    this.hasMetalSkin = false
    this.metalSkinText.setVisible(false)
    this.clearTint()
  }
  
  takeDamage(amount, isSwordDamage = false) {
    if (this.isDying) return
    
    // If metal skin is active, only sword damage can hurt
    if (this.hasMetalSkin && !isSwordDamage) {
      // Show damage blocked feedback
      if (this.metalSkinText) {
        this.metalSkinText.setText('Metal Skin - Blocked!')
        this.scene.time.delayedCall(500, () => {
          if (this.metalSkinText && this.hasMetalSkin) {
            this.metalSkinText.setText('Metal Skin')
          }
        })
      }
      return
    }
    
    this.health -= amount
    this.updateHealthBar()
    
    // Flash white when hit (unless metal skin active)
    const flashColor = this.hasMetalSkin ? 0xcccccc : 0xffffff
    this.setTint(flashColor)
    this.scene.time.delayedCall(100, () => {
      if (this.active) {
        if (this.hasMetalSkin) {
          this.setTint(0xcccccc)  // Back to metal tint
        } else {
          this.clearTint()
        }
      }
    })
    
    if (this.health <= 0) {
      this.die()
    }
  }
  
  die() {
    this.isDying = true
    this.body.setVelocity(0, 0)
    this.body.setAllowGravity(false)
    this.play(this.dieAnimKey)
    
    // Clean up health bar
    if (this.healthBarBg) this.healthBarBg.destroy()
    if (this.healthBarFg) this.healthBarFg.destroy()
    if (this.metalSkinText) this.metalSkinText.destroy()
    
    // Play death sound
    if (this.scene.sound) {
      this.scene.sound.play("boss_hit_sound", { volume: 0.3 })
    }
    
    // Remove after animation
    this.scene.time.delayedCall(500, () => {
      this.destroy()
    })
  }
}
