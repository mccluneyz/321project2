// Phaser loaded globally

export class PollutionBoss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, enemyType = 'city') {
    // Determine sprite source based on enemy type
    const useSpriteSheet = enemyType === 'factory' || enemyType === 'ice' || enemyType === 'ocean' || enemyType === 'wasteland'
    let initialTexture
    let spriteSheetKey
    
    if (useSpriteSheet) {
      // Map enemy types to their sprite sheet keys
      const spriteSheetMap = {
        factory: 'factory_boss_sheet',
        ice: 'factory_boss_sheet',  // Reuse factory for ice if not separate
        ocean: 'ocean_boss_sheet',
        wasteland: 'wasteland_boss_sheet'
      }
      spriteSheetKey = spriteSheetMap[enemyType] || 'factory_boss_sheet'
      initialTexture = spriteSheetKey
    } else {
      const spritePrefix = enemyType === 'desert' ? 'desert_boss' : 'pollution_boss'
      initialTexture = `${spritePrefix}_idle_frame1`
    }
    
    super(scene, x, y, initialTexture, useSpriteSheet ? 0 : undefined)
    
    // Add to scene
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    // Store enemy type for sprite selection
    this.enemyType = enemyType
    this.useSpriteSheet = useSpriteSheet
    this.spriteSheetKey = spriteSheetKey
    this.spritePrefix = enemyType === 'desert' ? 'desert_boss' : 'pollution_boss'
    
    // Boss properties - much tankier
    this.maxHealth = 250
    this.health = this.maxHealth
    this.damage = 25
    this.walkSpeed = 30  // Slower walk speed for menacing approach
    this.attackRange = 200
    this.attackCooldown = 3000
    this.lastAttackTime = 0
    this.projectileShootCooldown = 2500
    this.lastProjectileTime = 0
    this.canShoot = true  // Can be disabled for first boss
    this.isDying = false
    this.isAttacking = false
    this.facingRight = true
    
    // Metal Skin mechanic (35% chance for bosses, more dangerous)
    this.hasMetalSkin = false
    this.metalSkinDuration = 0
    this.metalSkinCooldown = 0
    this.metalSkinChance = 0.35  // 35% chance every 5 seconds
    this.metalSkinCheckInterval = 5000  // Check every 5 seconds
    this.lastMetalSkinCheck = 0
    
    // Power Surge mechanic (20% chance, less common than metal skin)
    this.hasPowerSurge = false
    this.powerSurgeDuration = 0
    this.powerSurgeChance = 0.20  // 20% chance every 8 seconds (rarer)
    this.powerSurgeCheckInterval = 8000  // Check every 8 seconds
    this.lastPowerSurgeCheck = 0
    this.baseWalkSpeed = this.walkSpeed
    this.baseShootCooldown = this.projectileShootCooldown
    this.baseDamage = this.damage
    
    // Set up physics - enable gravity for side-scrolling game
    // Oil blob (sprite sheet) should sit on ground, tall bosses float with rockets
    this.body.setGravityY(this.useSpriteSheet ? 1200 : 1200)
    
    // Calculate scale: boss should be large but not too large
    // Sprite sheet frames are 420x402 (square oil blob), other bosses are tall
    const actualWidth = this.useSpriteSheet ? 420 : 286
    const actualHeight = this.useSpriteSheet ? 402 : 560
    const targetHeight = this.useSpriteSheet ? 8 * 64 : 10 * 64  // Oil blob 8 tiles, others 10 tiles (reduced from 15)
    const calculatedScale = targetHeight / actualHeight
    this.setScale(calculatedScale)
    
    // Set collision body (unscaled dimensions)
    this.unscaledBodyWidth = actualWidth * 0.7
    this.unscaledBodyHeight = actualHeight * 0.7
    this.body.setSize(this.unscaledBodyWidth, this.unscaledBodyHeight)
    
    // Set origin - oil blob needs higher origin since bottom has drips/shadow
    const originY = this.useSpriteSheet ? 0.65 : 1.0
    this.setOrigin(0.5, originY)
    
    // Calculate offset to align body properly
    const unscaledOffsetX = (actualWidth - this.unscaledBodyWidth) / 2
    const unscaledOffsetY = (actualHeight * originY) - this.unscaledBodyHeight
    this.body.setOffset(unscaledOffsetX, unscaledOffsetY)
    
    // Determine boss name based on type
    const bossNames = {
      city: 'POLLUTION TITAN',
      desert: 'TRASH GOLIATH',
      factory: 'OIL BLOB',
      ice: 'TOXIC GLACIER',
      ocean: 'TOXIC JELLYFISH',
      industrial: 'FACTORY COLOSSUS',
      wasteland: 'WASTE EMPEROR'
    }
    const bossDisplayName = bossNames[this.enemyType] || 'POLLUTION TITAN'
    
    // Create boss name text above boss
    this.bossName = scene.add.text(this.x, this.y - targetHeight - 30, bossDisplayName, {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '28px',
      fill: '#ff0000',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center'
    }).setOrigin(0.5, 0.5).setDepth(1000)  // High depth to render on top
    
    // Create metal skin status text (hidden by default)
    this.metalSkinText = scene.add.text(this.x, this.y - targetHeight - 55, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      fill: '#cccccc',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5, 0.5).setDepth(1001).setVisible(false)
    
    // Create power surge status text (hidden by default)
    this.powerSurgeText = scene.add.text(this.x, this.y - targetHeight - 80, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      fill: '#ff0000',
      stroke: '#ffff00',
      strokeThickness: 4
    }).setOrigin(0.5, 0.5).setDepth(1001).setVisible(false)
    
    // Store target height for health bar positioning
    this.targetHeight = targetHeight
    
    // Create health bar graphics above boss
    this.healthBarBg = scene.add.graphics().setDepth(999)  // Just below boss name
    this.healthBarBg.setScrollFactor(1, 1)  // Follow camera
    this.healthBarFg = scene.add.graphics().setDepth(1000)  // Same as name, on top
    this.healthBarFg.setScrollFactor(1, 1)  // Follow camera
    this.healthBarWidth = 300
    this.healthBarHeight = 20
    this.updateHealthBar()
    
    // Create animations
    this.createAnimations()
    
    // Start idle
    this.play(this.getAnimKey('idle'))
    this.resetOriginAndOffset()
    
    // Create pixelated rocket flames under the boss (only for tall bosses, not oil blob)
    if (!this.useSpriteSheet) {
      this.createRocketFlames()
    }
  }
  
  createRocketFlames() {
    // Check if recyclable_can texture exists before creating particles
    if (!this.scene.textures.exists('recyclable_can')) {
      console.warn('recyclable_can texture not found, skipping rocket flames')
      return
    }
    
    try {
      // Create two flame emitters (left and right rocket)
      const flameConfig = {
        speed: { min: 80, max: 150 },
        angle: { min: 80, max: 100 }, // Pointing downward
        scale: { start: 0.5, end: 0.2 },
        alpha: { start: 1, end: 0 },
        lifespan: 400,
        frequency: 50,
        tint: [0xff6600, 0xff9900, 0xffcc00, 0xff3300], // Orange/yellow flame colors
        blendMode: 'ADD',
        gravityY: 100
      }
      
      // Left flame
      this.leftFlame = this.scene.add.particles(this.x - 60, this.y, 'recyclable_can')
      this.leftFlameEmitter = this.leftFlame.createEmitter(flameConfig)
      this.leftFlame.setDepth(this.depth - 1)
      
      // Right flame
      this.rightFlame = this.scene.add.particles(this.x + 60, this.y, 'recyclable_can')
      this.rightFlameEmitter = this.rightFlame.createEmitter(flameConfig)
      this.rightFlame.setDepth(this.depth - 1)
    } catch (error) {
      console.error('Failed to create rocket flames:', error)
    }
  }
  
  getAnimKey(animName) {
    return `boss_${this.enemyType}_${animName}`
  }
  
  createAnimations() {
    const anims = this.scene.anims
    const animKey = `boss_${this.enemyType}`
    
    if (this.useSpriteSheet) {
      // Use sprite sheet frames
      // Factory/Ice: 3x3 grid (idle 0-2, walk 3-5, attack 6-8)
      // Ocean/Wasteland: 5x5 grid = 25 frames (idle 0-4, walk 5-9, attack 10-14, die 15-19)
      const sheetKey = this.spriteSheetKey || 'factory_boss_sheet'
      const is5x5 = this.enemyType === 'ocean' || this.enemyType === 'wasteland'
      
      // Idle animation
      if (!anims.exists(`${animKey}_idle`)) {
        anims.create({
          key: `${animKey}_idle`,
          frames: anims.generateFrameNumbers(sheetKey, { start: 0, end: is5x5 ? 4 : 2 }),
          frameRate: 6,
          repeat: -1
        })
      }
      
      // Walk animation
      if (!anims.exists(`${animKey}_walk`)) {
        anims.create({
          key: `${animKey}_walk`,
          frames: anims.generateFrameNumbers(sheetKey, { start: is5x5 ? 5 : 3, end: is5x5 ? 9 : 5 }),
          frameRate: 6,
          repeat: -1
        })
      }
      
      // Attack animation
      if (!anims.exists(`${animKey}_attack`)) {
        anims.create({
          key: `${animKey}_attack`,
          frames: anims.generateFrameNumbers(sheetKey, { start: is5x5 ? 10 : 6, end: is5x5 ? 14 : 8 }),
          frameRate: 8,
          repeat: 0
        })
      }
      
      // Death animation
      if (!anims.exists(`${animKey}_die`)) {
        anims.create({
          key: `${animKey}_die`,
          frames: anims.generateFrameNumbers(sheetKey, { start: is5x5 ? 15 : 7, end: is5x5 ? 19 : 8 }),
          frameRate: 4,
          repeat: 0
        })
      }
    } else {
      // Use individual image frames
      const prefix = this.spritePrefix
      
      // Idle animation
      if (!anims.exists(`${animKey}_idle`)) {
        anims.create({
          key: `${animKey}_idle`,
          frames: [
            { key: `${prefix}_idle_frame1` },
            { key: `${prefix}_idle_frame2` }
          ],
          frameRate: 4,
          repeat: -1
        })
      }
      
      // Walk animation
      if (!anims.exists(`${animKey}_walk`)) {
        anims.create({
          key: `${animKey}_walk`,
          frames: [
            { key: `${prefix}_walk_frame1` },
            { key: `${prefix}_walk_frame2` }
          ],
          frameRate: 4,
          repeat: -1
        })
      }
      
      // Attack animation
      if (!anims.exists(`${animKey}_attack`)) {
        anims.create({
          key: `${animKey}_attack`,
          frames: [
            { key: `${prefix}_attack_frame1` },
            { key: `${prefix}_attack_frame2` }
          ],
          frameRate: 6,
          repeat: 0
        })
      }
      
      // Death animation
      if (!anims.exists(`${animKey}_die`)) {
        anims.create({
          key: `${animKey}_die`,
          frames: [
            { key: `${prefix}_die_frame1` },
            { key: `${prefix}_die_frame2` }
          ],
          frameRate: 6,
          repeat: 0
        })
      }
    }
  }
  
  resetOriginAndOffset() {
    // Use appropriate origin based on boss type
    // Oil blob has drips at bottom, so use 0.65 to sit on ground properly
    const originX = 0.5
    const originY = this.useSpriteSheet ? 0.65 : 1.0
    
    // Set origin
    this.setOrigin(originX, originY)
    
    // Calculate offset to keep body centered and grounded
    const unscaledOffsetX = (this.width - this.unscaledBodyWidth) / 2
    const unscaledOffsetY = (this.height * originY) - this.unscaledBodyHeight
    
    this.body.setOffset(unscaledOffsetX, unscaledOffsetY)
  }
  
  update(delta, player) {
    // Update boss name position even when attacking/dying
    if (this.bossName && this.bossName.active && this.targetHeight) {
      this.bossName.setPosition(this.x, this.y - this.targetHeight - 30)
    }
    
    // Update metal skin text position
    if (this.metalSkinText && this.metalSkinText.active && this.targetHeight) {
      this.metalSkinText.setPosition(this.x, this.y - this.targetHeight - 55)
    }
    
    if (this.powerSurgeText && this.powerSurgeText.active && this.targetHeight) {
      this.powerSurgeText.setPosition(this.x, this.y - this.targetHeight - 80)
    }
    
    // Update health bar position to follow boss
    if (this.healthBarBg && this.healthBarBg.active) {
      this.updateHealthBar()
    }
    
    // Update rocket flame particles position to stay under boss
    if (this.leftFlame && this.leftFlame.active) {
      this.leftFlame.setPosition(this.x - 80, this.y - 30)
    }
    if (this.rightFlame && this.rightFlame.active) {
      this.rightFlame.setPosition(this.x + 80, this.y - 30)
    }
    
    // Handle metal skin duration
    if (this.hasMetalSkin) {
      this.metalSkinDuration -= delta
      if (this.metalSkinDuration <= 0) {
        this.deactivateMetalSkin()
      }
    }
    
    // Handle power surge duration
    if (this.hasPowerSurge) {
      this.powerSurgeDuration -= delta
      if (this.powerSurgeDuration <= 0) {
        this.deactivatePowerSurge()
      }
    }
    
    // Check for metal skin activation (ONLY if player has sword, every 5 seconds, 35% chance)
    this.lastMetalSkinCheck += delta
    const playerHasSword = player && player.hasSword
    if (!this.hasMetalSkin && !this.isDying && this.lastMetalSkinCheck >= this.metalSkinCheckInterval && playerHasSword) {
      this.lastMetalSkinCheck = 0
      if (Math.random() < this.metalSkinChance) {
        this.activateMetalSkin()
      }
    }
    
    // Check for power surge activation (every 8 seconds, 20% chance - rarer than metal skin)
    this.lastPowerSurgeCheck += delta
    if (!this.hasPowerSurge && !this.isDying && this.lastPowerSurgeCheck >= this.powerSurgeCheckInterval) {
      this.lastPowerSurgeCheck = 0
      if (Math.random() < this.powerSurgeChance) {
        this.activatePowerSurge()
      }
    }
    
    if (this.isDying || !this.active) return
    
    // If attacking, keep boss stable on ground
    if (this.isAttacking) {
      if (this.body.onFloor()) {
        this.body.setVelocityY(0)
      }
      return
    }
    
    if (!player || !player.active) {
      this.play(this.getAnimKey('idle'), true)
      this.resetOriginAndOffset()
      this.body.setVelocityX(0)
      return
    }
    
    // Calculate distance to player
    const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y)
    
    // Determine facing direction
    this.facingRight = player.x > this.x
    this.setFlipX(!this.facingRight)
    
    // AI behavior
    const now = Date.now()
    
    if (distance < this.attackRange && !this.isAttacking) {
      // Close enough to melee attack
      if (now - this.lastAttackTime > this.attackCooldown) {
        this.attack()
      } else {
        // Wait for cooldown
        this.play(this.getAnimKey('idle'), true)
        this.resetOriginAndOffset()
        this.body.setVelocityX(0)
      }
    } else if (distance < 600) {
      // Medium/long range - shoot projectiles while walking
      this.play(this.getAnimKey('walk'), true)
      this.resetOriginAndOffset()
      this.body.setVelocityX(this.facingRight ? this.walkSpeed : -this.walkSpeed)
      
      // Shoot projectiles occasionally (if enabled)
      if (this.canShoot && now - this.lastProjectileTime > this.projectileShootCooldown) {
        this.shootProjectile()
        this.lastProjectileTime = now
      }
    } else {
      // Too far, idle
      this.play(this.getAnimKey('idle'), true)
      this.resetOriginAndOffset()
      this.body.setVelocityX(0)
    }
  }
  
  attack() {
    this.isAttacking = true
    this.lastAttackTime = Date.now()
    
    // Stop horizontal movement but keep on ground
    this.body.setVelocityX(0)
    
    // Make sure boss stays on ground during attack
    if (this.body.onFloor()) {
      this.body.setVelocityY(0)
    }
    
    this.play(this.getAnimKey('attack'))
    this.resetOriginAndOffset()
    
    // Play attack sound
    if (this.scene.sound) {
      this.scene.sound.play("boss_hit_sound", { volume: 0.4 })
    }
    
    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.isAttacking = false
    })
  }
  
  shootProjectile() {
    if (!this.scene || !this.scene.bossProjectiles) return
    
    // Create a trash projectile from boss's position
    const projectileX = this.x + (this.facingRight ? 40 : -40)
    const projectileY = this.y - this.displayHeight / 2
    
    // Use animated projectile spritesheet if available, fallback to recyclable
    const useSheet = this.scene.textures.exists('boss_projectile_sheet')
    const projectile = this.scene.physics.add.sprite(
      projectileX, 
      projectileY, 
      useSheet ? 'boss_projectile_sheet' : 'recyclable_plastic_bottle',
      useSheet ? 0 : undefined
    )
    
    // Create and play projectile animation if spritesheet exists
    if (useSheet) {
      const animKey = 'boss_projectile_spin'
      if (!this.scene.anims.exists(animKey)) {
        this.scene.anims.create({
          key: animKey,
          frames: this.scene.anims.generateFrameNumbers('boss_projectile_sheet', { start: 0, end: 24 }),
          frameRate: 20,
          repeat: -1
        })
      }
      projectile.play(animKey)
      projectile.setScale(0.15)  // Smaller scale for the larger spritesheet frames
    } else {
      projectile.setScale(0.8)
      projectile.setAngularVelocity(200)  // Only rotate if using fallback sprite
    }
    
    projectile.body.setAllowGravity(false)
    
    // Mark as homing projectile
    projectile.isHoming = true
    projectile.homingSpeed = 200  // Tracking speed
    projectile.homingStrength = 0.03  // How aggressively it tracks
    
    // Initial velocity toward player
    const player = this.scene.player
    if (player) {
      const angle = Phaser.Math.Angle.Between(projectileX, projectileY, player.x, player.y)
      projectile.setVelocity(
        Math.cos(angle) * 150,
        Math.sin(angle) * 150
      )
    }
    
    // Add to boss projectiles group
    this.scene.bossProjectiles.add(projectile)
    
    // Play throw sound
    if (this.scene.sound) {
      this.scene.sound.play("throw_item_sound", { volume: 0.3 })
    }
    
    // Destroy projectile after 5 seconds
    this.scene.time.delayedCall(5000, () => {
      if (projectile && projectile.active) {
        projectile.destroy()
      }
    })
  }
  
  updateHealthBar() {
    if (!this.healthBarBg || !this.healthBarFg || !this.targetHeight) return
    
    const barX = this.x - this.healthBarWidth / 2
    const barY = this.y - this.targetHeight - 60  // Use stored target height
    
    // Clear and redraw background
    this.healthBarBg.clear()
    this.healthBarBg.fillStyle(0x000000, 0.7)
    this.healthBarBg.fillRect(barX, barY, this.healthBarWidth, this.healthBarHeight)
    
    // Clear and redraw foreground
    this.healthBarFg.clear()
    const healthPercent = this.health / this.maxHealth
    const fgWidth = (this.healthBarWidth - 4) * healthPercent
    
    // Color based on buffs: Metal Skin = gray, Power Surge = orange/red, Both = purple, Normal = red
    let barColor = 0xff0000  // Default red
    if (this.hasMetalSkin && this.hasPowerSurge) {
      barColor = 0xaa00ff  // Purple when both active
    } else if (this.hasMetalSkin) {
      barColor = 0x404040  // Dark gray for metal skin
    } else if (this.hasPowerSurge) {
      barColor = 0xff8800  // Orange/red for power surge
    }
    
    this.healthBarFg.fillStyle(barColor)
    this.healthBarFg.fillRect(barX + 2, barY + 2, fgWidth, this.healthBarHeight - 4)
  }
  
  activateMetalSkin() {
    this.hasMetalSkin = true
    this.metalSkinDuration = Phaser.Math.Between(7000, 12000)  // 7-12 seconds for bosses
    this.metalSkinText.setText('Metal Skin')
    this.metalSkinText.setVisible(true)
    this.setTint(0xcccccc)  // Gray/metallic tint
  }
  
  deactivateMetalSkin() {
    this.hasMetalSkin = false
    if (this.metalSkinText) this.metalSkinText.setVisible(false)
    if (!this.hasPowerSurge) {
      this.clearTint()  // Only clear tint if no power surge active
    }
  }
  
  activatePowerSurge() {
    this.hasPowerSurge = true
    this.powerSurgeDuration = Phaser.Math.Between(6000, 10000)  // 6-10 seconds
    this.powerSurgeText.setText('⚡ POWER SURGE ⚡')
    this.powerSurgeText.setVisible(true)
    
    // Boost stats
    this.walkSpeed = this.baseWalkSpeed * 1.6  // 60% faster movement
    this.projectileShootCooldown = this.baseShootCooldown * 0.6  // 40% faster shooting (more projectiles)
    this.damage = this.baseDamage * 1.5  // 50% more damage
    
    // Red aggressive tint (unless metal skin is active)
    if (!this.hasMetalSkin) {
      this.setTint(0xff4444)  // Red aggressive tint
    }
  }
  
  deactivatePowerSurge() {
    this.hasPowerSurge = false
    if (this.powerSurgeText) this.powerSurgeText.setVisible(false)
    
    // Reset stats to base
    this.walkSpeed = this.baseWalkSpeed
    this.projectileShootCooldown = this.baseShootCooldown
    this.damage = this.baseDamage
    
    // Clear tint (unless metal skin is active)
    if (!this.hasMetalSkin) {
      this.clearTint()
    } else {
      this.setTint(0xcccccc)  // Back to metal skin tint
    }
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
    
    // Play hit sound
    if (this.scene.sound) {
      this.scene.sound.play("boss_hit_sound", { volume: 0.3 })
    }
    
    // Update health bar above boss
    this.updateHealthBar()
    
    if (this.health <= 0) {
      this.die()
    }
  }
  
  getHealthPercentage() {
    return (this.health / this.maxHealth) * 100
  }
  
  die() {
    this.isDying = true
    this.isDead = true
    this.body.setVelocity(0, 0)
    this.body.setAllowGravity(false)
    this.play(this.getAnimKey('die'))
    this.resetOriginAndOffset()
    
    // Hide boss name
    if (this.bossName) {
      this.bossName.destroy()
    }
    
    // Destroy health bar graphics
    if (this.healthBarBg) {
      this.healthBarBg.destroy()
    }
    if (this.healthBarFg) {
      this.healthBarFg.destroy()
    }
    
    // Destroy flame particles
    if (this.leftFlame) {
      this.leftFlame.destroy()
    }
    if (this.rightFlame) {
      this.rightFlame.destroy()
    }
    
    // Play death sound
    if (this.scene.sound) {
      this.scene.sound.play("boss_hit_sound", { volume: 0.5 })
    }
    
    // Hide boss health bar
    const uiScene = this.scene.scene.get("UIScene")
    if (uiScene && uiScene.hideBossHealthBar) {
      uiScene.hideBossHealthBar()
    }
    
    // Fade out effect
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 800,
      ease: 'Power2'
    })
    
    // Trigger level complete after animation
    this.scene.time.delayedCall(1000, () => {
      this.destroy()
    })
  }
}
