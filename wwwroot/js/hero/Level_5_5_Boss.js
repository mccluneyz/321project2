// Phaser loaded globally
import { screenSize, playerConfig } from './gameConfig.js'
import { RecyclingPlayer } from './RecyclingPlayer.js'
import { PollutionBoss } from './PollutionBoss.js'
import { HolyRecyclingBin } from './HolyRecyclingBin.js'
import { LevelManager } from './LevelManager.js'
import { PoisonBlob } from './PoisonBlob.js'

export class Level_5_5_Boss extends Phaser.Scene {
  constructor() {
    super({ key: "Level_5_5_Boss" })
  }

  create() {
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value

    this.mapWidth = 40 * 64
    this.createBackground(screenWidth, screenHeight)
    this.createTilemap()
    this.createPlayer()
    this.createBoss()
    this.createFloatingPlatforms()
    this.setupCollisions()
    
    this.mapHeight = 15 * 64  // 960px
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
    this.cameras.main.setDeadzone(200, 150)
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight, true, true, true, false)

    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    }
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
    this.qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q)
    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)

    this.scene.launch("UIScene", {
      currentLevelKey: this.scene.key,
      playerHealth: this.player.health,
      maxHealth: this.player.maxHealth,
      recyclablesCollected: 999,
      maxRecyclables: 999
    })

    this.bossMusic = this.sound.add("final_boss_theme", { volume: 0.5, loop: false })
    this.bossMusic.play()
    
    this.holyBin = null
    this.bossDefeatedFlag = false
    this.finalStandTriggered = false
    this.endingTriggered = false
    this.finalStandStartTime = 0
    this.survivalMode = false
    
    // Track music time for final stand at 2 minutes (120 seconds)
    this.finalStandMusicTime = 120000 // 2 minutes in milliseconds
    
    // Poison blob enemies system
    this.poisonBlobs = this.add.group()
    this.lastPoisonSpawnTime = 0
    this.poisonSpawnCooldown = 15000 // Spawn poison blob rarely - every 15 seconds
    
    // Player poison status
    this.playerPoisoned = false
    this.poisonDamageTimer = 0
    this.poisonDamageInterval = 1000 // Damage every 1 second while poisoned
    this.poisonDuration = 5000 // Poison lasts 5 seconds
    this.poisonEndTime = 0
  }

  createBackground(screenWidth, screenHeight) {
    // Wasteland apocalyptic background
    const bgWidth = 1536
    const bgHeight = 1024
    this.mapHeight = 15 * 64
    const bgScale = this.mapHeight / bgHeight
    const scaledBgWidth = bgWidth * bgScale
    const numBackgrounds = Math.ceil(this.mapWidth / scaledBgWidth) + 1
    
    for (let i = 0; i < numBackgrounds; i++) {
      const bg = this.add.image(i * scaledBgWidth, 0, "wasteland_background").setOrigin(0, 0)
      bg.setScale(bgScale)
      bg.setScrollFactor(0.3)
      bg.setTint(0x888888)  // Darker, more ominous
    }
  }

  createTilemap() {
    // Use level_1_5_boss flat arena with wasteland tiles
    this.map = this.make.tilemap({ key: "level_1_5_boss" })
    const tileset = this.map.addTilesetImage("city_ground", "wasteland_ground")
    this.groundLayer = this.map.createLayer("ground", tileset, 0, 0)
    this.groundLayer.setCollisionByExclusion([-1])
    this.mapWidth = this.map.widthInPixels
  }

  createPlayer() {
    const spawnX = 2 * 64
    const spawnY = 11 * 64
    this.player = new RecyclingPlayer(this, spawnX, spawnY)
    this.projectiles = this.add.group()
    this.bossProjectiles = this.add.group()
    this.physics.add.collider(this.player, this.groundLayer)
    this.player.setCollideWorldBounds(true)
  }

  createBoss() {
    // Final boss - most powerful pollution entity
    const bossX = 30 * 64
    const bossY = 11 * 64
    this.boss = new PollutionBoss(this, bossX, bossY, 'wasteland')
    this.physics.add.collider(this.boss, this.groundLayer)
    this.boss.setCollideWorldBounds(true)
    
    // Make final boss extra tough
    this.boss.maxHealth = 400
    this.boss.health = 400
    this.boss.updateHealthBar()  // Force health bar update
  }
  
  createFloatingPlatforms() {
    // Create small 3-tile floating platforms for vertical movement
    this.platforms = this.add.group()
    
    const platformPositions = [
      { x: 8, y: 9 },   // Left side, mid height
      { x: 20, y: 7 },  // Center-left, higher
      { x: 32, y: 9 },  // Right side, mid height
      { x: 14, y: 5 },  // Center-left, high
      { x: 26, y: 5 }   // Center-right, high
    ]
    
    platformPositions.forEach(pos => {
      for (let i = 0; i < 3; i++) {
        const tile = this.add.rectangle((pos.x + i) * 64 + 32, pos.y * 64 + 32, 64, 64, 0x444444)
        tile.setStrokeStyle(2, 0x222222)
        this.physics.add.existing(tile, true)  // Static body
        this.platforms.add(tile)
      }
    })
    
    // Add collision with player
    this.physics.add.collider(this.player, this.platforms.getChildren())
  }
  
  setupCollisions() {
    this.physics.add.overlap(this.projectiles, this.boss, this.projectileHitBoss, null, this)
    
    // Boss projectiles hit player
    this.physics.add.overlap(this.bossProjectiles, this.player, this.bossProjectileHitPlayer, null, this)
    
    // Shield blocks boss projectiles
    this.physics.add.overlap(this.bossProjectiles, this.player.shield, this.shieldBlockProjectile, null, this)
    
    // Shield pushes boss away
    this.physics.add.overlap(this.player.shield, this.boss, this.shieldPushBoss, null, this)
    
    // Player-Boss collision
    this.physics.add.overlap(this.player, this.boss, (player, boss) => {
      if (boss.isDying || player.isInvulnerable) return
      
      if (player.isShieldActive()) {
        return
      }
      
      const playerBottom = player.y
      const bossCenter = boss.y - boss.body.height / 2
      
      if (player.body.velocity.y > 0 && playerBottom < bossCenter) {
        boss.takeDamage(20)
        player.body.setVelocityY(-400)
        if (this.sound) this.sound.play("boss_hit_sound", { volume: 0.4 })
      } else {
        this.playerHitBoss(player, boss)
      }
    }, null, this)
    
    // Poison blobs hit player (apply poison)
    this.physics.add.overlap(this.player, this.poisonBlobs, this.playerTouchPoisonBlob, null, this)
    
    // Player projectiles can kill poison blobs
    this.physics.add.overlap(this.player.recyclables, this.poisonBlobs, this.projectileHitPoisonBlob, null, this)
    
    // Sword can kill poison blobs
    if (this.player.sword) {
      this.physics.add.overlap(this.player.sword, this.poisonBlobs, this.swordHitPoisonBlob, null, this)
    }
  }
  
  playerHitBoss(player, boss) {
    if (boss.isDying) return
    const newHealth = player.takeDamage(boss.damage)
    const uiScene = this.scene.get("UIScene")
    if (uiScene) uiScene.updateHealth(newHealth)
    const knockbackX = player.x < boss.x ? -200 : 200
    player.body.setVelocityX(knockbackX)
    player.body.setVelocityY(-300)
  }
  
  projectileHitBoss(projectile, boss) {
    if (boss.isDying) return
    projectile.destroy()
    boss.takeDamage(15)
    if (this.sound) {
      this.sound.play("boss_hit_sound", { volume: 0.4 })
    }
  }
  
  bossProjectileHitPlayer(projectile, player) {
    if (!player || !player.active || player.isInvulnerable) return
    
    if (player.isShieldActive()) return
    
    if (projectile && projectile.active) {
      projectile.destroy()
    }
    const newHealth = player.takeDamage(15)
    const uiScene = this.scene.get("UIScene")
    if (uiScene && uiScene.updateHealth) {
      uiScene.updateHealth(newHealth)
    }
    if (this.sound) {
      this.sound.play("collect_item_sound", { volume: 0.3 })
    }
  }
  
  shieldBlockProjectile(projectile, shield) {
    if (!projectile || !projectile.active) return
    
    projectile.destroy()
    
    // Play block sound (quieter)
    if (this.sound) {
      this.sound.play("collect_item_sound", { volume: 0.2 })
    }
    
    this.tweens.add({
      targets: shield,
      alpha: 1,
      duration: 100,
      yoyo: true,
      onComplete: () => {
        shield.setAlpha(0.9)
      }
    })
  }
  
  shieldPushBoss(shield, boss) {
    // No pushback on shield block - shield just blocks damage
    return
  }
  
  spawnPoisonBlob() {
    if (!this.boss || !this.boss.active || this.boss.isDying) return
    
    // Spawn poison blob near boss
    const offsetX = Phaser.Math.Between(-2, 2) * 64  // Near boss
    const blobX = this.boss.x + offsetX
    const blobY = 8 * 64  // Spawn above ground so it falls down
    
    console.log('☠️ Spawning poison blob at:', blobX, blobY)
    
    const blob = new PoisonBlob(this, blobX, blobY)
    this.poisonBlobs.add(blob)
    
    // Play spawn sound
    if (this.sound) {
      this.sound.play("throw_item_sound", { volume: 0.3 })
    }
  }
  
  playerTouchPoisonBlob(player, blob) {
    if (!blob || !blob.active) return
    if (this.playerPoisoned) return  // Already poisoned
    if (player.isShieldActive()) {
      // Shield destroys the blob without applying poison
      blob.die()
      return
    }
    
    // Apply poison status
    this.playerPoisoned = true
    this.poisonEndTime = this.time.now + this.poisonDuration
    this.poisonDamageTimer = 0
    
    // Visual feedback - player turns green
    player.setTint(0x00ff88)
    
    // Destroy the blob
    blob.die()
    
    console.log('☠️ Player poisoned by blob! Taking damage for 5 seconds')
  }
  
  projectileHitPoisonBlob(projectile, blob) {
    if (!blob || !blob.active || !projectile || !projectile.active) return
    
    blob.takeDamage(15)  // Projectiles do 15 damage
    projectile.destroy()
  }
  
  swordHitPoisonBlob(sword, blob) {
    if (!blob || !blob.active || blob.isDying) return
    if (!this.player || !this.player.isSwordActive()) return
    
    blob.takeDamage(30)  // Sword does 30 damage (kills in one hit)
  }

  triggerFinalStand() {
    this.finalStandTriggered = true
    this.survivalMode = true
    this.finalStandStartTime = this.time.now
    
    // Skip music to 2-minute mark if boss defeated early
    const currentMusicTime = this.bossMusic.seek
    const twoMinutesMark = 120 // 2 minutes in seconds
    
    if (currentMusicTime < twoMinutesMark) {
      console.log(`⏩ Boss defeated early! Skipping from ${currentMusicTime.toFixed(1)}s to ${twoMinutesMark}s`)
      this.bossMusic.seek = twoMinutesMark
    }
    
    // Boss regains health and becomes MORE dangerous
    this.boss.health = 9999 // Effectively invincible during final stand
    this.boss.maxHealth = 9999
    
    // Make boss MUCH more aggressive
    if (this.boss.shootCooldown) {
      this.boss.shootCooldown = 500 // Faster shooting (was probably 2000+)
    }
    
    // Visual effect - boss glows red indicating final stand
    this.boss.setTint(0xff0000)
    this.tweens.add({
      targets: this.boss,
      alpha: { from: 1, to: 0.7 },
      duration: 300,
      yoyo: true,
      repeat: -1
    })
    
    // Show dramatic text
    const finalStandText = this.add.text(this.cameras.main.width / 2, 200, 'FINAL STAND!\nSURVIVE!', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '64px',
      fill: '#ff0000',
      stroke: '#000000',
      strokeThickness: 8,
      align: 'center'
    }).setOrigin(0.5).setDepth(2000).setScrollFactor(0)
    
    // Flash and fade out text
    this.tweens.add({
      targets: finalStandText,
      alpha: 0,
      scale: 2,
      duration: 3000,
      ease: 'Power2',
      onComplete: () => finalStandText.destroy()
    })
    
    // Create survival timer UI
    this.survivalTimerText = this.add.text(this.cameras.main.width / 2, 50, '', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '32px',
      fill: '#ffff00',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center'
    }).setOrigin(0.5).setDepth(2000).setScrollFactor(0)
    
    // Screen shake
    this.cameras.main.shake(1000, 0.01)
    
    console.log('🔥 FINAL STAND TRIGGERED! SURVIVE UNTIL THE MUSIC ENDS! 🔥')
  }

  bossDefeated() {
    // Stop boss music
    if (this.bossMusic) {
      this.bossMusic.stop()
    }
    
    // Spawn Holy Recycling Bin where boss died
    const holyBinX = this.boss.x
    const holyBinY = this.boss.y
    this.spawnHolyBin(holyBinX, holyBinY)
  }
  
  spawnHolyBin(x, y) {
    // Create the holy recycling bin
    this.holyBin = new HolyRecyclingBin(this, x, y)
    
    // Add physics collider with ground
    this.physics.add.collider(this.holyBin, this.groundLayer)
    
    // Add overlap with player for interaction
    this.physics.add.overlap(this.player, this.holyBin, this.playerTouchHolyBin, null, this)
  }
  
  playerTouchHolyBin(player, holyBin) {
    if (holyBin.canInteract) {
      holyBin.interact(player)
    }
  }

  update(time, delta) {
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.returnToMenu()
      return
    }

    // Handle shield toggle
    if (this.player && this.player.active) {
      if (this.qKey.isDown) {
        this.player.activateShield()
      } else {
        this.player.deactivateShield()
      }
      
      // Handle sword swing with R key
      if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
        this.player.swingSword()
      }
      
      // Handle glider with space key (hold to glide when in air)
      if (this.spaceKey.isDown && !this.player.body.onFloor() && this.player.hasGlider) {
        this.player.activateGlider()
      } else if (this.player.isGliding) {
        this.player.deactivateGlider()
      }
    }

    const mergedControls = {
      left: { isDown: this.cursors.left.isDown || this.wasd.left.isDown },
      right: { isDown: this.cursors.right.isDown || this.wasd.right.isDown },
      up: { isDown: this.cursors.up.isDown || this.wasd.up.isDown }
    }

    if (this.player && this.player.active) {
      this.player.update(mergedControls, this.spaceKey, this.shiftKey, 999, delta)
    }

    if (this.boss && this.boss.active) {
      this.boss.update(delta, this.player)
      
      // Update all poison blobs
      this.poisonBlobs.getChildren().forEach(blob => {
        if (blob && blob.active && blob.update) {
          blob.update(delta, this.player)
        }
      })
      
      // Boss spawns poison blobs rarely - every 15 seconds
      this.lastPoisonSpawnTime += delta
      if (this.lastPoisonSpawnTime >= this.poisonSpawnCooldown) {
        this.lastPoisonSpawnTime = 0
        this.spawnPoisonBlob()
      }
    }
    
    // Handle poison damage over time
    if (this.playerPoisoned && this.player && this.player.active) {
      this.poisonDamageTimer += delta
      
      if (this.poisonDamageTimer >= this.poisonDamageInterval) {
        this.poisonDamageTimer = 0
        const newHealth = this.player.takeDamage(10)  // 10 poison damage per second
        const uiScene = this.scene.get("UIScene")
        if (uiScene) uiScene.updateHealth(newHealth)
      }
    }
    
    // Update homing projectiles
    if (this.bossProjectiles && this.player && this.player.active) {
      this.bossProjectiles.children.entries.forEach(projectile => {
        if (projectile.active && projectile.isHoming) {
          const angle = Phaser.Math.Angle.Between(projectile.x, projectile.y, this.player.x, this.player.y)
          
          const targetVelX = Math.cos(angle) * projectile.homingSpeed
          const targetVelY = Math.sin(angle) * projectile.homingSpeed
          
          projectile.body.velocity.x += (targetVelX - projectile.body.velocity.x) * projectile.homingStrength
          projectile.body.velocity.y += (targetVelY - projectile.body.velocity.y) * projectile.homingStrength
        }
      })
    }
    
    // Update holy bin if it exists
    if (this.holyBin && this.holyBin.active) {
      this.holyBin.update()
    }

    if (this.player && this.player.y > this.mapHeight + 100) {
      this.sound.stopAll()
      this.scene.stop("UIScene")
      this.scene.restart()
    }

    // Check if music reached 2-minute mark OR boss health reaches 0 - trigger Final Stand!
    const currentMusicTime = this.bossMusic ? this.bossMusic.seek : 0
    const twoMinutesMark = 120 // 2 minutes in seconds
    
    if (!this.finalStandTriggered && this.boss && this.boss.active) {
      // Trigger at 2 minutes OR when boss health reaches 0
      if (currentMusicTime >= twoMinutesMark || this.boss.health <= 0) {
        this.triggerFinalStand()
      }
    }
    
    // During final stand, check if music has played long enough or ended
    if (this.survivalMode) {
      const musicTime = this.bossMusic.seek * 1000 // Convert to milliseconds
      const totalDuration = this.bossMusic.duration * 1000
      const timeRemaining = Math.max(0, totalDuration - musicTime)
      
      // Update survival timer
      if (this.survivalTimerText) {
        const seconds = Math.ceil(timeRemaining / 1000)
        this.survivalTimerText.setText(`SURVIVE: ${seconds}s`)
      }
      
      // Boss dies at end of song or if player survives long enough
      if (!this.bossMusic.isPlaying || musicTime >= totalDuration) {
        if (this.boss && this.boss.active && !this.endingTriggered) {
          this.endingTriggered = true
          
          // Clear timer text
          if (this.survivalTimerText) {
            this.survivalTimerText.destroy()
            this.survivalTimerText = null
          }
          
          this.boss.health = 0
          this.boss.die()
          
          // WHITE FLASH EFFECT → HEAVEN ENDING
          this.time.delayedCall(1500, () => {
            const whiteFlash = this.add.rectangle(
              this.cameras.main.scrollX + this.cameras.main.width / 2,
              this.cameras.main.scrollY + this.cameras.main.height / 2,
              this.cameras.main.width * 2,
              this.cameras.main.height * 2,
              0xffffff
            )
            whiteFlash.setScrollFactor(0)
            whiteFlash.setDepth(10000)
            whiteFlash.setAlpha(0)
            
            // Flash white, then transition to heaven scene
            this.tweens.add({
              targets: whiteFlash,
              alpha: 1,
              duration: 1000,
              ease: 'Power2',
              onComplete: () => {
                this.time.delayedCall(500, () => {
                  this.sound.stopAll()
                  this.scene.stop("UIScene")
                  this.scene.start("HeavenEndingScene")
                })
              }
            })
          })
        }
      }
    }
    
    // Check if boss is defeated (after final stand)
    if (this.boss && !this.boss.active && !this.bossDefeatedFlag) {
      this.bossDefeatedFlag = true
      this.bossDefeated()
    }
  }

  returnToMenu() {
    this.sound.stopAll()
    this.scene.stop("UIScene")
    this.scene.stop()
    this.scene.start("TitleScreen")
  }

  getNextLevelScene() {
    return null  // This is the final level
  }
}

