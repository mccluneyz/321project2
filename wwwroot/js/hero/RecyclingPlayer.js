// Phaser loaded globally
import { playerConfig } from './gameConfig.js'

export class RecyclingPlayer extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "recycling_hero_idle_frame1")
    
    // Add to scene
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    // Player properties
    this.health = playerConfig.maxHealth.value
    this.maxHealth = playerConfig.maxHealth.value
    this.facingRight = true
    this.isThrowingWaste = false
    this.throwCooldown = 0  // Cooldown timer in ms
    this.throwCooldownDuration = 500  // 0.5 second cooldown
    this.isInvulnerable = false  // Invulnerability frames
    this.invulnerabilityDuration = 1500  // 1.5 seconds
    
    // Shield properties
    this.shieldActive = false
    this.shield = null
    this.createShield()
    
    // Sword properties
    this.swordActive = false
    this.sword = null
    this.swordCooldown = 500  // 500ms cooldown between swings
    this.lastSwordTime = 0
    this.createSword()
    
    // Glider properties
    this.isGliding = false
    this.glider = null
    this.createGlider()
    
    // Double jump properties
    this.jumpCount = 0
    this.maxJumps = 1  // Will become 2 with double jump
    
    // Set up physics
    this.body.setGravityY(playerConfig.gravityY.value)
    
    // Calculate proper scale - hero should be about 2 tiles tall (128px)
    const targetHeight = 128  // 2 tiles * 64px
    const actualHeight = 560  // From animation frames
    this.scale = targetHeight / actualHeight
    this.setScale(this.scale)
    
    // Set collision body (90% of sprite size) - use unscaled dimensions
    this.unscaledBodyWidth = 313 * 0.9
    this.unscaledBodyHeight = 560 * 0.9
    this.body.setSize(this.unscaledBodyWidth, this.unscaledBodyHeight)
    
    // Set origin to bottom center
    this.setOrigin(0.5, 1.0)
    
    // Calculate offset to center the body horizontally and align bottom with sprite bottom
    const unscaledOffsetX = (313 - this.unscaledBodyWidth) / 2
    const unscaledOffsetY = 560 - this.unscaledBodyHeight
    this.body.setOffset(unscaledOffsetX, unscaledOffsetY)
    
    // Create animations
    this.createAnimations()
    
    // Play idle
    this.play('player_idle')
    this.resetOriginAndOffset()
  }
  
  // Getters that always check the registry (so items persist across levels)
  get hasShield() {
    return this.scene.game.registry.get('playerHasShield') || false
  }
  
  get hasSword() {
    return this.scene.game.registry.get('playerHasSword') || false
  }
  
  get hasGlider() {
    return this.scene.game.registry.get('playerHasGlider') || false
  }
  
  get hasDoubleJump() {
    return this.scene.game.registry.get('playerHasDoubleJump') || false
  }
  
  // Setters to update registry
  set hasShield(value) {
    this.scene.game.registry.set('playerHasShield', value)
  }
  
  set hasSword(value) {
    this.scene.game.registry.set('playerHasSword', value)
  }
  
  set hasGlider(value) {
    this.scene.game.registry.set('playerHasGlider', value)
  }
  
  set hasDoubleJump(value) {
    this.scene.game.registry.set('playerHasDoubleJump', value)
  }
  
  createShield() {
    // Create shield sprite with physics (will be invisible by default)
    // Check if shield texture exists, fallback to recyclable if not
    const shieldTexture = this.scene.textures.exists('player_shield') ? 'player_shield' : 'recyclable_plastic_bottle'
    
    this.shield = this.scene.physics.add.sprite(this.x, this.y, shieldTexture)
    this.shield.setScale(0.15)  // Much smaller - just in front of character
    this.shield.setDepth(this.depth + 1)  // Render in front of player
    this.shield.setVisible(false)  // Hidden by default
    this.shield.setAlpha(0.9)  // Slightly transparent
    this.shield.body.setAllowGravity(false)  // Shield doesn't fall
    this.shield.body.setImmovable(true)  // Shield is solid
    this.shield.body.setSize(60, 80)  // Collision box
    this.shield.body.enable = false  // Disabled by default
  }
  
  createSword() {
    // Create sword sprite with physics (will be invisible by default)
    const swordTexture = this.scene.textures.exists('player_sword') ? 'player_sword' : 'recyclable_plastic_bottle'
    
    this.sword = this.scene.physics.add.sprite(this.x, this.y, swordTexture, 0)
    this.sword.setScale(0.35)  // Slightly bigger sword
    this.sword.setDepth(this.depth + 1)  // Render in front of player
    this.sword.setVisible(false)  // Hidden by default
    this.sword.setAlpha(1.0)
    this.sword.body.setAllowGravity(false)  // Sword doesn't fall
    this.sword.body.setSize(160, 200)  // Much bigger hitbox (2x width, 1.7x height)
    this.sword.body.enable = false  // Disabled by default
    
    // Create sword jab animation if sprite sheet exists
    if (this.scene.textures.exists('player_sword') && !this.scene.anims.exists('sword_jab')) {
      this.scene.anims.create({
        key: 'sword_jab',
        frames: this.scene.anims.generateFrameNumbers('player_sword', { start: 0, end: 24 }),
        frameRate: 50,  // Fast jab animation (25 frames in ~0.5 seconds)
        repeat: 0
      })
    }
  }
  
  createGlider() {
    // Create glider sprite (will be invisible by default)
    const gliderTexture = this.scene.textures.exists('player_glider') ? 'player_glider' : 'recyclable_plastic_bottle'
    
    console.log('🪂 Creating glider with texture:', gliderTexture)
    
    this.glider = this.scene.add.sprite(this.x, this.y, gliderTexture, 0)
    this.glider.setScale(0.5)  // Glider size - larger and more visible
    this.glider.setDepth(100)  // High depth to render above most things
    this.glider.setVisible(false)  // Hidden by default
    this.glider.setAlpha(1.0)  // Fully visible when active
    
    // Create glider animation if sprite sheet exists (5 frames: 0-4)
    if (this.scene.textures.exists('player_glider') && !this.scene.anims.exists('glider_float')) {
      console.log('✅ Creating glider_float animation with player_glider spritesheet')
      this.scene.anims.create({
        key: 'glider_float',
        frames: this.scene.anims.generateFrameNumbers('player_glider', { start: 0, end: 4 }),
        frameRate: 10,  // Smooth floating animation
        repeat: -1  // Loop forever
      })
    } else if (!this.scene.textures.exists('player_glider')) {
      console.warn('⚠️ player_glider texture not found, using fallback')
    }
  }
  
  resetOriginAndOffset() {
    // Get origin data based on current animation
    let baseOriginX = 0.5
    let baseOriginY = 1.0
    
    const currentAnim = this.anims.currentAnim
    if (currentAnim) {
      switch(currentAnim.key) {
        case 'player_idle':
          baseOriginX = 0.5
          baseOriginY = 1.0
          break
        case 'player_walk':
          baseOriginX = 0.45
          baseOriginY = 1.0
          break
        case 'player_jump':
          baseOriginX = 0.328
          baseOriginY = 1.0
          break
        case 'player_throw':
          baseOriginX = 0.216
          baseOriginY = 1.0
          break
        default:
          baseOriginX = 0.5
          baseOriginY = 1.0
          break
      }
    }
    
    // Flip origin if facing left
    let animOriginX = this.facingRight ? baseOriginX : (1 - baseOriginX)
    let animOriginY = baseOriginY
    
    // Set origin
    this.setOrigin(animOriginX, animOriginY)
    
    // Calculate offset to align body's bottom center with animation frame's origin
    const unscaledOffsetX = this.width * animOriginX - this.unscaledBodyWidth / 2
    const unscaledOffsetY = this.height * animOriginY - this.unscaledBodyHeight
    
    this.body.setOffset(unscaledOffsetX, unscaledOffsetY)
  }
  
  createAnimations() {
    const anims = this.scene.anims
    
    // Idle animation
    if (!anims.exists('player_idle')) {
      anims.create({
        key: 'player_idle',
        frames: [
          { key: 'recycling_hero_idle_frame1' },
          { key: 'recycling_hero_idle_frame2' }
        ],
        frameRate: 2,
        repeat: -1
      })
    }
    
    // Walk animation  
    if (!anims.exists('player_walk')) {
      anims.create({
        key: 'player_walk',
        frames: [
          { key: 'recycling_hero_walk_frame1' },
          { key: 'recycling_hero_walk_frame2' }
        ],
        frameRate: 6,
        repeat: -1
      })
    }
    
    // Jump animation
    if (!anims.exists('player_jump')) {
      anims.create({
        key: 'player_jump',
        frames: [
          { key: 'recycling_hero_jump_frame1' },
          { key: 'recycling_hero_jump_frame2' }
        ],
        frameRate: 4,
        repeat: -1
      })
    }
    
    // Throw animation
    if (!anims.exists('player_throw')) {
      anims.create({
        key: 'player_throw',
        frames: [
          { key: 'recycling_hero_throw_frame1' },
          { key: 'recycling_hero_throw_frame2' }
        ],
        frameRate: 8,
        repeat: 0
      })
    }
  }
  
  update(cursors, spaceKey, shiftKey, recyclablesCount, delta) {
    // Update cooldown timer
    if (this.throwCooldown > 0) {
      this.throwCooldown -= delta
    }

    // Horizontal movement - can still move while throwing
    if (cursors.left.isDown) {
      this.body.setVelocityX(-playerConfig.walkSpeed.value)
      this.facingRight = false
      this.setFlipX(true)
      
      if (this.body.onFloor() && !this.isThrowingWaste) {
        this.play('player_walk', true)
        this.resetOriginAndOffset()
      }
    } else if (cursors.right.isDown) {
      this.body.setVelocityX(playerConfig.walkSpeed.value)
      this.facingRight = true
      this.setFlipX(false)
      
      if (this.body.onFloor() && !this.isThrowingWaste) {
        this.play('player_walk', true)
        this.resetOriginAndOffset()
      }
    } else {
      // Only stop horizontal movement if not throwing, otherwise maintain current velocity
      if (!this.isThrowingWaste) {
        this.body.setVelocityX(0)
      }
      
      if (this.body.onFloor() && !this.isThrowingWaste) {
        this.play('player_idle', true)
        this.resetOriginAndOffset()
      }
    }
    
    // Reset jump count when on ground
    if (this.body.onFloor()) {
      this.jumpCount = 0
    }
    
    // Update max jumps based on double jump ability
    this.maxJumps = this.hasDoubleJump ? 2 : 1
    
    // Jump - can jump while throwing, supports double jump
    if (Phaser.Input.Keyboard.JustDown(spaceKey) && !this.isThrowingWaste) {
      if (this.jumpCount < this.maxJumps) {
        this.body.setVelocityY(-playerConfig.jumpPower.value)
        this.jumpCount++
        
        console.log('🦘 Jump! Count:', this.jumpCount, 'MaxJumps:', this.maxJumps, 'HasDoubleJump:', this.hasDoubleJump)
        
        // Spawn cloud effect on second jump
        if (this.jumpCount === 2 && this.hasDoubleJump) {
          console.log('☁️ Triggering double jump cloud!')
          this.spawnDoubleJumpCloud()
        }
      }
    }
    
    // Update animation when in air
    if (!this.body.onFloor() && !this.isThrowingWaste) {
      this.play('player_jump', true)
      this.resetOriginAndOffset()
    }
    
    // Throw waste - check cooldown
    if (Phaser.Input.Keyboard.JustDown(shiftKey) && recyclablesCount > 0 && !this.isThrowingWaste && this.throwCooldown <= 0) {
      this.throwWaste()
    }
    
    // Update shield position to stay in front of player
    this.updateShieldPosition()
    
    // Update sword position if active
    this.updateSwordPosition()
    
    // Update glider position if active
    this.updateGliderPosition()
  }
  
  updateShieldPosition() {
    if (!this.shield) return
    
    // Position shield in front of player (closer)
    const offsetX = this.facingRight ? 35 : -35  // 35 pixels in front
    const offsetY = -40  // Slightly above center
    
    this.shield.setPosition(this.x + offsetX, this.y + offsetY)
    this.shield.setFlipX(!this.facingRight)  // Flip shield with player
  }
  
  updateSwordPosition() {
    if (!this.sword) return
    
    // Position sword closer to player with bigger reach
    const offsetX = this.facingRight ? 35 : -35  // Much closer to player
    const offsetY = -50  // Sword height
    
    this.sword.setPosition(this.x + offsetX, this.y + offsetY)
    this.sword.setFlipX(!this.facingRight)  // Flip sword with player
  }
  
  updateGliderPosition() {
    if (!this.glider) return
    
    // Position glider above player
    const offsetX = 0  // Centered
    const offsetY = -80  // Higher above player so it's more visible
    
    this.glider.setPosition(this.x + offsetX, this.y + offsetY)
    this.glider.setFlipX(!this.facingRight)  // Flip glider with player
  }
  
  activateShield() {
    // Can only activate if player has picked up the shield
    if (!this.hasShield) return
    
    this.shieldActive = true
    if (this.shield) {
      this.shield.setVisible(true)
      this.shield.body.enable = true  // Enable collision
    }
  }
  
  deactivateShield() {
    this.shieldActive = false
    if (this.shield) {
      this.shield.setVisible(false)
      this.shield.body.enable = false  // Disable collision
    }
  }
  
  isShieldActive() {
    return this.shieldActive && this.shield && this.shield.visible
  }
  
  swingSword() {
    // Can only swing if player has picked up the sword
    if (!this.hasSword) return
    
    // Check cooldown
    const now = Date.now()
    if (now - this.lastSwordTime < this.swordCooldown) return
    
    this.lastSwordTime = now
    this.swordActive = true
    
    if (this.sword) {
      this.sword.setVisible(true)
      this.sword.body.enable = true  // Enable collision
      this.updateSwordPosition()
      
      // Play sword swing sound
      if (this.scene.sound) {
        this.scene.sound.play("collect_item_sound", { volume: 0.4 })
      }
      
      // Play sword jab animation
      if (this.scene.anims.exists('sword_jab')) {
        this.sword.play('sword_jab')
        
        // Deactivate after animation completes
        this.sword.once('animationcomplete', () => {
          this.deactivateSword()
        })
      } else {
        // Fallback if no animation
        this.scene.time.delayedCall(500, () => {
          this.deactivateSword()
        })
      }
    }
  }
  
  deactivateSword() {
    this.swordActive = false
    if (this.sword) {
      this.sword.setVisible(false)
      this.sword.body.enable = false  // Disable collision
      this.sword.stop()  // Stop animation
      this.sword.setFrame(0)  // Reset to first frame
    }
  }
  
  activateGlider() {
    // Can only glide if player has picked up the glider
    if (!this.hasGlider) {
      console.log('❌ Cannot activate glider - hasGlider:', this.hasGlider)
      return
    }
    
    this.isGliding = true
    if (this.glider) {
      console.log('✅ Activating glider - visible:', this.glider.visible, 'depth:', this.glider.depth)
      this.glider.setVisible(true)
      this.updateGliderPosition()
      
      // Play glider float animation
      if (this.scene.anims.exists('glider_float')) {
        this.glider.play('glider_float', true)
      }
    } else {
      console.log('❌ Glider sprite not found!')
    }
    
    // Slow fall speed while gliding
    this.body.setGravityY(playerConfig.gravityY.value * 0.2)  // 20% gravity
    
    // Limit fall speed
    if (this.body.velocity.y > 100) {
      this.body.setVelocityY(100)
    }
  }
  
  deactivateGlider() {
    this.isGliding = false
    if (this.glider) {
      this.glider.setVisible(false)
      this.glider.stop()  // Stop animation
      this.glider.setFrame(0)  // Reset to first frame
    }
    
    // Restore normal gravity
    this.body.setGravityY(playerConfig.gravityY.value)
  }
  
  spawnDoubleJumpCloud() {
    console.log('☁️ Attempting to spawn cloud - hasDoubleJump:', this.hasDoubleJump)
    
    // Check if texture exists
    if (!this.scene.textures.exists('double_jump_cloud')) {
      console.error('❌ double_jump_cloud texture not found!')
      return
    }
    
    // Create cloud animation if it doesn't exist
    if (!this.scene.anims.exists('cloud_puff')) {
      console.log('☁️ Creating cloud_puff animation (5x5 grid = 25 frames)')
      try {
        this.scene.anims.create({
          key: 'cloud_puff',
          frames: this.scene.anims.generateFrameNumbers('double_jump_cloud', { start: 0, end: 24 }),
          frameRate: 40,  // Fast puff animation
          repeat: 0
        })
        console.log('✅ cloud_puff animation created successfully')
      } catch (error) {
        console.error('❌ Failed to create cloud animation:', error)
        return
      }
    }
    
    // Create cloud sprite at player's feet
    const cloudY = this.y + 40  // Position at player's feet
    
    console.log('☁️ Creating cloud sprite at:', this.x, cloudY)
    
    const cloud = this.scene.add.sprite(this.x, cloudY, 'double_jump_cloud', 0)
    cloud.setScale(0.4)  // Smaller, more appropriate size
    cloud.setDepth(this.depth - 1)  // Just behind player
    cloud.setAlpha(1.0)  // Fully visible
    cloud.setOrigin(0.5, 0.5)  // Center origin
    
    // Play cloud animation
    cloud.play('cloud_puff')
    
    // Destroy cloud after animation completes
    cloud.once('animationcomplete', () => {
      console.log('☁️ Cloud animation complete, destroying')
      cloud.destroy()
    })
    
    // Fallback destroy in case animation doesn't complete
    this.scene.time.delayedCall(1000, () => {
      if (cloud && cloud.active) {
        console.log('☁️ Cloud cleanup (fallback)')
        cloud.destroy()
      }
    })
    
    // Play jump sound
    if (this.scene.sound) {
      this.scene.sound.play("collect_item_sound", { volume: 0.3 })
    }
  }
  
  throwWaste() {
    this.isThrowingWaste = true
    this.throwCooldown = this.throwCooldownDuration  // Start cooldown
    
    // Stop horizontal movement during throw
    this.body.setVelocityX(0)
    
    this.play('player_throw', true)
    this.resetOriginAndOffset()
    
    // Play sound
    if (this.scene.sound) {
      this.scene.sound.play("throw_item_sound", { volume: 0.5 })
    }
    
    // Create projectile sprite first - randomly choose from all recycling items
    const projectileX = this.x + (this.facingRight ? 40 : -40)
    const projectileY = this.y - 60  // Shoulder height
    
    // Array of all recycling sprite options with their sizes
    const recyclingItems = [
      { key: "plastic_bottle", width: 398, height: 888 },
      { key: "glass_bottle", width: 395, height: 896 },
      { key: "paper_item", width: 642, height: 777 },
      { key: "aluminum_can", width: 513, height: 844 }
    ]
    
    // Randomly select a recycling item
    const randomItem = Phaser.Math.RND.pick(recyclingItems)
    
    const projectile = this.scene.add.sprite(projectileX, projectileY, randomItem.key)
    this.scene.physics.add.existing(projectile)
    
    // Calculate appropriate scale based on item size (target height ~40-50px)
    const targetHeight = 45
    const itemScale = targetHeight / randomItem.height
    projectile.setScale(itemScale)
    
    // Straight horizontal throw with minimal arc
    projectile.body.setVelocityX(this.facingRight ? 600 : -600)  // Faster horizontal speed
    projectile.body.setVelocityY(-50)  // Very slight upward velocity for minimal arc
    projectile.body.setGravityY(400)  // Less gravity for flatter trajectory
    projectile.body.setAllowGravity(true)
    
    // Store reference for collision detection
    if (this.scene.projectiles) {
      this.scene.projectiles.add(projectile)
    }
    
    // Destroy after 3 seconds
    this.scene.time.delayedCall(3000, () => {
      if (projectile && projectile.active) {
        projectile.destroy()
      }
    })
    
    // Return to normal animation after throw
    this.scene.time.delayedCall(250, () => {
      this.isThrowingWaste = false
    })
    
    // Return decreased count
    return true
  }
  
  takeDamage(amount) {
    if (this.isInvulnerable) return this.health
    
    this.health -= amount
    this.isInvulnerable = true
    
    // Flash effect
    let flashCount = 0
    const flashInterval = this.scene.time.addEvent({
      delay: 100,
      callback: () => {
        this.setAlpha(this.alpha === 1 ? 0.3 : 1)
        flashCount++
        if (flashCount >= 10) {
          flashInterval.remove()
          this.setAlpha(1)
          this.isInvulnerable = false
        }
      },
      loop: true
    })
    
    if (this.health <= 0) {
      this.health = 0
      flashInterval.remove()
      this.setAlpha(1)
      this.die()
    }
    return this.health
  }
  
  die() {
    // Handle death
    this.body.setVelocity(0, 0)
    
    // Destroy shield
    if (this.shield) {
      this.shield.destroy()
    }
    
    this.scene.scene.launch("GameOverUIScene", {
      currentLevelKey: this.scene.scene.key
    })
  }
}
