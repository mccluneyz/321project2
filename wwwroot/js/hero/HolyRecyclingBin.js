// Phaser loaded globally

export class HolyRecyclingBin extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'holy_bin_sheet', 0)
    
    // Add to scene
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    // Properties
    this.scene = scene
    this.isDescending = true
    this.isFloating = false
    this.canInteract = false
    
    // Set up physics
    this.body.setAllowGravity(false)
    this.body.setImmovable(true)
    
    // Scale to be large and impressive (about 4 tiles tall)
    const targetHeight = 256  // 4 tiles * 64px
    const actualHeight = 200  // Frame height from spritesheet
    this.setScale(targetHeight / actualHeight)
    
    // Set collision body
    this.body.setSize(150, 150)
    this.setOrigin(0.5, 1.0)
    
    // Set depth to render above everything
    this.setDepth(1000)
    
    // Create animations
    this.createAnimations()
    
    // Start floating animation
    this.play('holy_bin_float')
    
    // Start high above, will descend
    this.y = y - 500
    
    // Descend from heaven with light
    this.descendFromHeaven(x, y)
  }
  
  createAnimations() {
    // Only create if doesn't exist
    if (!this.scene.anims.exists('holy_bin_float')) {
      // Floating animation using all 25 frames
      this.scene.anims.create({
        key: 'holy_bin_float',
        frames: this.scene.anims.generateFrameNumbers('holy_bin_sheet', { start: 0, end: 24 }),
        frameRate: 12,
        repeat: -1
      })
    }
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
    
    // Trigger game complete after 3 seconds
    this.scene.time.delayedCall(3000, () => {
      this.scene.scene.stop("UIScene")
      this.scene.scene.stop()
      this.scene.scene.start("GameCompleteUIScene")
    })
  }
  
  update() {
    // Update sparkle particle position if floating
    if (this.sparkleParticles && this.isFloating) {
      this.sparkleParticles.setPosition(this.x, this.y - 50)
    }
  }
}

