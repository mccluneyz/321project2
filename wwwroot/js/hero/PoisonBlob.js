// Poison Blob enemy - small enemies spawned by final boss
export class PoisonBlob extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    // Debug: Check if the texture exists
    console.log('🟢 PoisonBlob: Creating with texture "poison_blob_sheet"')
    console.log('🟢 Texture exists?', scene.textures.exists('poison_blob_sheet'))
    
    // Use new poison blob spritesheet (4x4 grid, 64x64 frames)
    super(scene, x, y, 'poison_blob_sheet', 0)
    
    // Add to scene
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    console.log('🟢 PoisonBlob created with texture:', this.texture.key)
    console.log('🟢 Current frame:', this.frame ? this.frame.name : 'N/A')
    console.log('🟢 Total frames available:', this.texture.frameTotal)
    
    // CRITICAL: Stop any animations and lock to frame 0
    if (this.anims) {
      try {
        if (this.anims.stop) this.anims.stop()
        if (this.anims.pause) this.anims.pause()
      } catch (e) {
        console.warn('⚠️ Could not stop animations:', e.message)
      }
    }
    
    // Force display only first frame (frame 0)
    try {
      this.setFrame(0)
      
      // CRITICAL: Disable frame updates completely
      if (this.anims && this.anims.currentAnim) {
        this.anims.currentAnim = null
      }
      
      // Lock the texture to only show frame 0
      this.frame = this.texture.get(0)
      
      console.log('✅ Poison blob locked to frame 0 (64x64)')
    } catch (e) {
      console.error('❌ Could not set frame 0:', e.message)
    }
    
    // Size and positioning (make BIGGER for easier to hit)
    this.setScale(1.5)  // Bigger so player can hit them
    this.setOrigin(0.5, 0.5)
    
    // Green toxic tint
    this.setTint(0x00ff44)
    
    console.log('🟢 Final blob state - Frame:', this.frame.name, 'Scale:', this.scale, 'Size:', this.displayWidth, 'x', this.displayHeight)
    
    // Properties
    this.health = 30  // Can be killed with 2 projectiles or 1 sword hit
    this.maxHealth = 30
    this.damage = 0  // Doesn't do direct damage, just applies poison
    
    // Create health bar
    this.createHealthBar()
    this.moveSpeed = 80  // Slow but persistent
    this.jumpPower = -350  // Can jump at player
    this.isDying = false
    
    // AI behavior
    this.aggroRange = 600  // Detects player from far away
    this.jumpRange = 150  // Jumps when player is this close
    this.lastJumpTime = 0
    this.jumpCooldown = 2000  // Jump every 2 seconds
    
    // Physics - BIGGER collision box for easier hitting
    this.body.setGravityY(1200)
    this.body.setSize(80, 80)  // Even larger collision box for better hit detection
    this.body.setOffset(-8, -8)  // Adjust offset to center the collision box
    this.body.setBounce(0.2)
    this.body.setCollideWorldBounds(true)  // Keep blobs on screen
    
    // Pulsing green glow effect
    this.setTint(0x00ff88)
    scene.tweens.add({
      targets: this,
      alpha: 0.7,
      duration: 800,
      yoyo: true,
      repeat: -1
    })
  }
  
  createHealthBar() {
    // Create health bar graphics
    this.healthBarWidth = 40
    this.healthBarHeight = 4
    this.healthBarBg = this.scene.add.graphics().setDepth(999)
    this.healthBarFg = this.scene.add.graphics().setDepth(1000)
    
    this.updateHealthBar()
  }
  
  updateHealthBar() {
    if (!this.healthBarBg || !this.healthBarFg) return
    
    const barX = this.x - this.healthBarWidth / 2
    const barY = this.y - 40  // Above blob
    
    // Clear and redraw background
    this.healthBarBg.clear()
    this.healthBarBg.fillStyle(0x000000, 0.7)
    this.healthBarBg.fillRect(barX, barY, this.healthBarWidth, this.healthBarHeight)
    
    // Clear and redraw foreground
    this.healthBarFg.clear()
    const healthPercent = this.health / this.maxHealth
    const fgWidth = (this.healthBarWidth - 2) * healthPercent
    this.healthBarFg.fillStyle(0x00ff00)  // Green health bar
    this.healthBarFg.fillRect(barX + 1, barY + 1, fgWidth, this.healthBarHeight - 2)
  }
  
  update(delta, player) {
    if (this.isDying || !this.active || !player || !player.active) return
    
    // Update health bar position
    this.updateHealthBar()
    
    const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y)
    
    // Only act if player is in aggro range
    if (distance > this.aggroRange) return
    
    // Move toward player
    if (player.x < this.x) {
      this.body.setVelocityX(-this.moveSpeed)
      this.setFlipX(true)
    } else {
      this.body.setVelocityX(this.moveSpeed)
      this.setFlipX(false)
    }
    
    // Jump at player if close and on ground
    if (distance < this.jumpRange && this.body.onFloor()) {
      const now = Date.now()
      if (now - this.lastJumpTime > this.jumpCooldown) {
        this.lastJumpTime = now
        this.body.setVelocityY(this.jumpPower)
        
        // Jump slightly toward player
        const jumpX = player.x > this.x ? 100 : -100
        this.body.setVelocityX(jumpX)
      }
    }
  }
  
  takeDamage(amount, isSwordDamage = false) {
    if (this.isDying) return
    
    this.health -= amount
    
    // Flash white when hit
    this.setTint(0xffffff)
    this.scene.time.delayedCall(100, () => {
      if (this.active && !this.isDying) {
        this.setTint(0x00ff88)  // Back to green
      }
    })
    
    if (this.health <= 0) {
      this.die()
    }
  }
  
  die() {
    this.isDying = true
    this.body.setVelocity(0, 0)
    
    // Destroy health bar
    if (this.healthBarBg) this.healthBarBg.destroy()
    if (this.healthBarFg) this.healthBarFg.destroy()
    
    // Death animation - fade out and shrink
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 0.1,
      duration: 300,
      onComplete: () => {
        this.destroy()
      }
    })
  }
  
  appliesPoison() {
    return true  // This enemy applies poison on contact
  }
}

