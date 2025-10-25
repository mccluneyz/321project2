// Poison Blob enemy - small enemies spawned by final boss
export class PoisonBlob extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'wasteland_boss_puddle')
    
    // Add to scene
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    // Small and deadly
    this.setScale(0.4)  // Really small
    this.setOrigin(0.5, 1)
    
    // Properties
    this.health = 30  // Can be killed with 2 projectiles or 1 sword hit
    this.maxHealth = 30
    this.damage = 0  // Doesn't do direct damage, just applies poison
    this.moveSpeed = 80  // Slow but persistent
    this.jumpPower = -350  // Can jump at player
    this.isDying = false
    
    // AI behavior
    this.aggroRange = 600  // Detects player from far away
    this.jumpRange = 150  // Jumps when player is this close
    this.lastJumpTime = 0
    this.jumpCooldown = 2000  // Jump every 2 seconds
    
    // Physics
    this.body.setGravityY(1200)
    this.body.setSize(this.width * 0.6, this.height * 0.6)
    this.body.setBounce(0.2)
    
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
  
  update(delta, player) {
    if (this.isDying || !this.active || !player || !player.active) return
    
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

