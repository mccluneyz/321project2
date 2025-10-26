// Phaser loaded globally

export class HeavenDoors extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    // Check if heaven_doors exists, use fallback
    let textureKey = 'heaven_doors'
    
    console.log('🚪 HeavenDoors: Checking for heaven_doors texture...')
    
    if (!scene.textures.exists('heaven_doors')) {
      console.warn('⚠️ heaven_doors not found, using recyclable as fallback')
      textureKey = 'recyclable_plastic_bottle'
    } else {
      const texture = scene.textures.get('heaven_doors')
      const totalFrames = texture.frameTotal
      console.log('✅ heaven_doors found!', totalFrames, 'frames (should be 36)')
    }
    
    super(scene, x, y, textureKey, 0)
    
    // Add to scene
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    // Create opening animation for heaven doors
    if (textureKey === 'heaven_doors' && !scene.anims.exists('heaven_doors_open')) {
      scene.anims.create({
        key: 'heaven_doors_open',
        frames: scene.anims.generateFrameNumbers('heaven_doors', { start: 0, end: 35 }),
        frameRate: 12,
        repeat: -1  // Loop animation
      })
    }
    
    // Play the opening animation
    if (textureKey === 'heaven_doors') {
      this.play('heaven_doors_open')
    }
    
    // Properties
    this.scene = scene
    this.canInteract = false
    
    // Set up physics
    this.body.setAllowGravity(false)
    this.body.setImmovable(true)
    
    // Scale to reasonable size (based on 616x632 source frame)
    // We want it about 5 tiles wide (320px)
    const targetWidth = 320  // 5 tiles * 64px
    const actualWidth = 616  // Frame width
    const scale = targetWidth / actualWidth
    this.setScale(scale)
    
    // Set collision body
    this.body.setSize(300, 400)
    this.setOrigin(0.5, 1.0)
    
    // Set depth to render above everything
    this.setDepth(1000)
    
    // Start high above, will descend
    this.y = y - 500
    
    // Descend from heaven with light
    this.descendFromHeaven(x, y)
  }
  
  descendFromHeaven(targetX, targetY) {
    // Create divine light beam
    const lightBeam = this.scene.add.rectangle(targetX, 0, 150, this.scene.cameras.main.height, 0xffffaa, 0.3)
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
        this.canInteract = true
        
        // Remove light beam
        lightBeam.destroy()
        
        // Play celestial sound if available
        if (this.scene.sound) {
          this.scene.sound.play('level_complete_sound', { volume: 0.8 })
        }
        
        // Add golden glow
        const glow = this.scene.add.circle(this.x, this.y - 200, 150, 0xFFD700, 0.2)
        glow.setDepth(999)
        
        this.scene.tweens.add({
          targets: glow,
          alpha: { from: 0.2, to: 0.4 },
          duration: 2000,
          yoyo: true,
          repeat: -1
        })
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
    
    // Make particles follow the doors
    this.scene.tweens.add({
      targets: particles,
      x: this.x,
      y: this.y - 200,
      duration: 100,
      repeat: -1
    })
    
    this.sparkleParticles = particles
  }
  
  interact() {
    if (!this.canInteract) return
    
    this.canInteract = false  // Prevent multiple interactions
    
    // Play victory sound
    if (this.scene.sound) {
      this.scene.sound.play('level_complete_sound', { volume: 0.3 })
    }
    
    // Show message
    const message = this.scene.add.text(this.x, this.y - 350, 'ENTERING HEAVEN!\nYou Saved the Planet!', {
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
    
    // Trigger transition to HeavenEndingScene after 2 seconds
    this.scene.time.delayedCall(2000, () => {
      this.scene.scene.stop("UIScene")
      this.scene.scene.stop()
      this.scene.scene.start("HeavenEndingScene")
    })
  }
  
  update() {
    // Update sparkle particle position if exists
    if (this.sparkleParticles) {
      this.sparkleParticles.setPosition(this.x, this.y - 200)
    }
  }
}

