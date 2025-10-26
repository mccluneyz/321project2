// Phaser loaded globally

export class HolyRecyclingBin extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    // Check if holy_bin exists, use fallback
    let textureKey = 'holy_bin'
    
    console.log('🏺 HolyRecyclingBin: Checking for holy_bin texture...')
    
    if (!scene.textures.exists('holy_bin')) {
      console.warn('⚠️ holy_bin not found, using recyclable as fallback')
      textureKey = 'recyclable_plastic_bottle'
    } else {
      const texture = scene.textures.get('holy_bin')
      const width = texture.source[0].width
      const height = texture.source[0].height
      console.log('✅ holy_bin found! Dimensions:', width, 'x', height)
      
      // If it's very large, it might be showing as a spritesheet
      if (width > 2000 || height > 2000) {
        console.warn('⚠️ Holy bin image is VERY LARGE - will scale down significantly')
      }
    }
    
    super(scene, x, y, textureKey, 0)
    
    // Add to scene
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    // Create floating animation for holy bin
    if (textureKey === 'holy_bin' && !scene.anims.exists('holy_bin_float')) {
      scene.anims.create({
        key: 'holy_bin_float',
        frames: scene.anims.generateFrameNumbers('holy_bin', { start: 0, end: 24 }),
        frameRate: 10,
        repeat: -1
      })
    }
    
    // Play the floating animation
    if (textureKey === 'holy_bin') {
      this.play('holy_bin_float')
    }
    
    // Properties
    this.scene = scene
    this.isDescending = true
    this.isFloating = false
    this.canInteract = false
    
    // Set up physics
    this.body.setAllowGravity(false)
    this.body.setImmovable(true)
    
    // Scale based on which texture we're using
    let scale = 0.5
    if (textureKey === 'holy_bin') {
      // Scale to reasonable size (based on 1485x1800 source)
      // We want it about 3 tiles wide (192px)
      const targetWidth = 192  // 3 tiles * 64px
      const actualWidth = 1485  // Source image width
      scale = targetWidth / actualWidth
    } else {
      // Fallback to large recyclable
      scale = 2.0
    }
    this.setScale(scale)
    
    // Golden glow for holy item
    this.setTint(0xFFD700)
    
    // Set collision body
    this.body.setSize(100, 100)
    this.setOrigin(0.5, 1.0)
    
    // Set depth to render above everything
    this.setDepth(1000)
    
    // Start high above, will descend
    this.y = y - 500
    
    // Create floating effect
    this.createFloatingEffect()
    
    // Descend from heaven with light
    this.descendFromHeaven(x, y)
  }
  
  createFloatingEffect() {
    // Stop any animations (this was causing the crash)
    if (this.anims) {
      this.anims.stop()
    }
    
    // Since it's a static image, create a floating tween effect
    this.scene.tweens.add({
      targets: this,
      y: this.y - 20,  // Float up and down
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    })
    
    // Gentle rotation
    this.scene.tweens.add({
      targets: this,
      angle: -5,  // Rock back and forth
      duration: 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    })
  }
  
  descendFromHeaven(targetX, targetY) {
    // Create divine light beam
    const lightBeam = this.scene.add.rectangle(targetX, 0, 100, this.scene.cameras.main.height, 0xffffaa, 0.3)
    lightBeam.setOrigin(0.5, 0)
    lightBeam.setDepth(999)
    
    // Pulse the light
    this.scene.tweens.add({
      targets: lightBeam,
      alpha: 0.6,
      duration: 500,
      yoyo: true,
      repeat: 10
    })
    
    // Descend slowly with particles
    this.scene.tweens.add({
      targets: this,
      y: targetY,
      duration: 3000,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.isDescending = false
        this.isFloating = true
        this.canInteract = true
        
        // Remove light beam
        lightBeam.destroy()
        
        // Start gentle floating motion
        this.startFloatingMotion()
        
        // Play celestial sound if available
        if (this.scene.sound) {
          this.scene.sound.play('collect_item_sound', { volume: 0.8 })
        }
      }
    })
    
    // Add sparkle particles
    this.createSparkles()
  }
  
  createSparkles() {
    // Create particle emitter for sparkles
    const particles = this.scene.add.particles(this.x, this.y, 'recyclable_plastic_bottle', {
      speed: { min: 20, max: 50 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1000,
      blendMode: 'ADD',
      frequency: 100,
      tint: [0xffff00, 0xffffff, 0xffaa00]
    })
    
    // Make particles follow the bin
    this.scene.tweens.add({
      targets: particles,
      x: this.x,
      y: this.y,
      duration: 100,
      repeat: -1
    })
    
    this.sparkleParticles = particles
  }
  
  startFloatingMotion() {
    // Gentle up/down floating
    this.scene.tweens.add({
      targets: this,
      y: this.y - 20,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    // Subtle rotation
    this.scene.tweens.add({
      targets: this,
      angle: -5,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }
  
  interact(player) {
    if (!this.canInteract) return
    
    this.canInteract = false  // Prevent multiple interactions
    
    // Play victory sound
    if (this.scene.sound) {
      this.scene.sound.play('level_complete_sound', { volume: 0.3 })
    }
    
    // Show message
    const message = this.scene.add.text(this.x, this.y - 150, 'THE HOLY RECYCLING BIN!\nYou\'ve Saved the Planet!', {
      fontSize: '32px',
      fill: '#ffff00',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 8,
      align: 'center',
      backgroundColor: '#00000088',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5)
    message.setScrollFactor(1)
    message.setDepth(1001)
    
    // Fade in message
    message.setAlpha(0)
    this.scene.tweens.add({
      targets: message,
      alpha: 1,
      duration: 1000
    })
    
    // Flash the screen white
    const flash = this.scene.add.rectangle(
      this.scene.cameras.main.scrollX,
      this.scene.cameras.main.scrollY,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0xffffff
    )
    flash.setOrigin(0, 0)
    flash.setScrollFactor(0)
    flash.setDepth(2000)
    flash.setAlpha(0)
    
    this.scene.tweens.add({
      targets: flash,
      alpha: 1,
      duration: 500,
      yoyo: true,
      onComplete: () => flash.destroy()
    })
    
    // Stop boss music if playing
    this.scene.sound.stopAll()
    
    // Trigger game stats screen after 3 seconds
    this.scene.time.delayedCall(3000, () => {
      this.scene.scene.stop("UIScene")
      this.scene.scene.stop()
      this.scene.scene.start("GameCompleteStatsScene")
    })
  }
  
  update() {
    // Update sparkle particle position if floating
    if (this.sparkleParticles && this.isFloating) {
      this.sparkleParticles.setPosition(this.x, this.y - 50)
    }
  }
}

