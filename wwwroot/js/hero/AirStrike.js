// Air Strike attack for bosses
export class AirStrike extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss_air_strike', 0)
    
    scene.add.existing(this)
    
    // Debug sprite info
    const texture = scene.textures.get('boss_air_strike')
    console.log('💣 Air Strike Sprite Info:')
    console.log('   Total frames:', texture.frameTotal)
    console.log('   Frame 0 dimensions:', texture.get(0).width, 'x', texture.get(0).height)
    console.log('   Current frame:', this.frame.name)
    
    // Properties
    this.scene = scene
    this.warningDuration = 3000  // 3 seconds warning
    this.damageRadius = 150  // AOE radius in pixels
    this.damage = 30
    this.hasExploded = false
    this.startTime = Date.now()
    
    // Set scale and depth (sprite is 435x435, scale down a bit)
    this.setScale(0.6)  // Scale down since frames are large
    this.setDepth(100)
    this.setAlpha(0.8)  // Slightly transparent during warning
    
    // Create warning circle
    this.createWarningCircle()
    
    // Play warning animation (first half of frames - 0 to 17)
    this.createAnimations()
    this.play('air_strike_warning')
    
    console.log('💣 Air strike initiated at:', x, y, '- playing animation:', this.anims.currentAnim?.key)
    
    // Schedule explosion after 3 seconds
    scene.time.delayedCall(this.warningDuration, () => {
      this.explode()
    })
  }
  
  createAnimations() {
    const scene = this.scene
    
    // Warning animation (ALL frames, slow loop)
    if (!scene.anims.exists('air_strike_warning')) {
      const anim = scene.anims.create({
        key: 'air_strike_warning',
        frames: scene.anims.generateFrameNumbers('boss_air_strike', { start: 0, end: 35 }),
        frameRate: 10,  // Medium speed for warning
        repeat: -1
      })
      console.log('✅ Created air_strike_warning animation:', anim.frames.length, 'frames')
    }
    
    // Explosion animation (ALL frames, fast)
    if (!scene.anims.exists('air_strike_explosion')) {
      const anim = scene.anims.create({
        key: 'air_strike_explosion',
        frames: scene.anims.generateFrameNumbers('boss_air_strike', { start: 0, end: 35 }),
        frameRate: 30,  // Very fast explosion
        repeat: 0
      })
      console.log('✅ Created air_strike_explosion animation:', anim.frames.length, 'frames')
    }
  }
  
  createWarningCircle() {
    // Create red warning circle on ground
    this.warningCircle = this.scene.add.graphics()
    this.warningCircle.setDepth(99)
    
    // Pulsing warning circle
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.8,
      scaleY: 1.8,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    this.updateWarningCircle()
  }
  
  updateWarningCircle() {
    if (!this.warningCircle || this.hasExploded) return
    
    this.warningCircle.clear()
    
    // Draw red circle at strike location
    this.warningCircle.lineStyle(4, 0xff0000, 0.8)
    this.warningCircle.strokeCircle(this.x, this.y, this.damageRadius)
    
    // Fill with transparent red
    this.warningCircle.fillStyle(0xff0000, 0.2)
    this.warningCircle.fillCircle(this.x, this.y, this.damageRadius)
  }
  
  explode() {
    if (this.hasExploded) return
    
    this.hasExploded = true
    
    console.log('💥 Air strike EXPLODING at:', this.x, this.y)
    
    // Remove warning circle
    if (this.warningCircle) {
      this.warningCircle.destroy()
    }
    
    // Set to full opacity
    this.setAlpha(1)
    
    // Play explosion animation
    this.play('air_strike_explosion')
    
    // Check for player in AOE
    this.checkPlayerDamage()
    
    // Screen shake
    this.scene.cameras.main.shake(300, 0.01)
    
    // Play explosion sound
    if (this.scene.sound) {
      this.scene.sound.play('boss_hit_sound', { volume: 0.6 })
    }
    
    // Destroy after animation completes
    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.destroy()
    })
  }
  
  checkPlayerDamage() {
    const player = this.scene.player
    
    if (!player || !player.active || player.isInvulnerable) return
    
    // Check if player is in the damage radius
    const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y)
    
    if (distance <= this.damageRadius) {
      // Player is in AOE - deal damage
      console.log('💥 Player hit by air strike! Distance:', distance)
      
      const newHealth = player.takeDamage(this.damage)
      
      // Update UI
      const uiScene = this.scene.scene.get('UIScene')
      if (uiScene) {
        uiScene.updateHealth(newHealth)
      }
      
      // Knockback away from center
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y)
      const knockbackForce = 300
      player.body.setVelocity(
        Math.cos(angle) * knockbackForce,
        Math.sin(angle) * knockbackForce - 200  // Add upward force
      )
    } else {
      console.log('✅ Player avoided air strike! Distance:', distance)
    }
  }
  
  update() {
    // Update warning circle position
    if (!this.hasExploded) {
      this.updateWarningCircle()
    }
  }
  
  destroy() {
    if (this.warningCircle) {
      this.warningCircle.destroy()
    }
    super.destroy()
  }
}

