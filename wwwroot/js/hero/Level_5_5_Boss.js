// Phaser loaded globally
import { screenSize, playerConfig } from './gameConfig.js'
import { RecyclingPlayer } from './RecyclingPlayer.js'
import { PollutionBoss } from './PollutionBoss.js'
import { HolyRecyclingBin } from './HolyRecyclingBin.js'
import { HeavenDoors } from './HeavenDoors.js'
import { LevelManager } from './LevelManager.js'
import { AirStrike } from './AirStrike.js'
import { autoGrantItems } from './ItemProgression.js'
import { openPauseMenu } from './PauseHelper.js'

export class Level_5_5_Boss extends Phaser.Scene {
  constructor() {
    super({ key: "Level_5_5_Boss" })
  }

  create() {
    console.log('🎮 Level_5_5_Boss: Starting boss level...')
    
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value

    this.mapWidth = 40 * 64
    this.createBackground(screenWidth, screenHeight)
    this.createTilemap()
    this.createPlayer()
    this.createBoss()
    this.setupCollisions()
    
    this.mapHeight = 15 * 64  // 960px
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
    this.cameras.main.setDeadzone(200, 150)
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight, true, true, true, false)

    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
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
    
    // Hide the top boss health bar - we only want health bars above enemies
    this.time.delayedCall(100, () => {
      const uiScene = this.scene.get("UIScene")
      if (uiScene && uiScene.hideBossHealthBar) {
        uiScene.hideBossHealthBar()
        console.log('✅ Top boss health bar hidden - only showing health bar above boss')
      }
    })

    this.bossMusic = this.sound.add("final_boss_theme", { volume: 0.5, loop: false })
    this.bossMusic.play()
    
    this.holyBin = null
    this.heavenDoors = null
    this.bossDefeatedFlag = false
    this.finalStandTriggered = false
    this.endingTriggered = false
    this.finalStandStartTime = 0
    this.survivalMode = false
    
    // Track music time for final stand at 2 minutes (120 seconds)
    this.finalStandMusicTime = 120000 // 2 minutes in milliseconds
    
    // Air strike tracking
    this.airStrikes = []
    this.lastAirStrikeTime = 0
    this.airStrikeCooldown = 8000 // Every 8 seconds (more frequent)
    this.airStrikeChance = 0.8 // 80% chance when cooldown is ready (much more likely)
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
    
    // Auto-grant all items for world 5 (wasteland)
    autoGrantItems(this, this.player)
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
  
  setupCollisions() {
    this.physics.add.overlap(this.projectiles, this.boss, this.projectileHitBoss, null, this)
    
    // Shield blocks boss projectiles - CHECK THIS FIRST before player damage
    this.physics.add.overlap(this.bossProjectiles, this.player.shield, this.shieldBlockProjectile, null, this)
    
    // Boss projectiles hit player - checked AFTER shield (shield has priority)
    this.physics.add.overlap(this.bossProjectiles, this.player, this.bossProjectileHitPlayer, null, this)
    
    // Shield pushes boss away
    this.physics.add.overlap(this.player.shield, this.boss, this.shieldPushBoss, null, this)
    
    // Player-Boss collision
    this.physics.add.overlap(this.player, this.boss, (player, boss) => {
      if (!player || !boss || !player.active || !boss.active) return
      if (boss.isDying || player.isInvulnerable) return
      
      // Check shield - with safety check for method existence
      if (player.isShieldActive && typeof player.isShieldActive === 'function' && player.isShieldActive()) {
        return
      }
      
      // Check if player is actually touching boss (wider for damage, but still need to be close)
      const distance = Phaser.Math.Distance.Between(player.x, player.y, boss.x, boss.y)
      const touchDistance = 120  // Wider damage range but still requires proximity
      
      if (distance > touchDistance) return
      
      // NO DAMAGE during final stand - only dodge!
      if (this.survivalMode) {
        this.playerHitBoss(player, boss)
        return
      }
      
      const playerBottom = player.y
      const bossCenter = boss.y - boss.body.height / 2
      
      if (player.body.velocity.y > 0 && playerBottom < bossCenter) {
        boss.takeDamage(10)  // Reduced stomp damage
        player.body.setVelocityY(-400)
        if (this.sound) this.sound.play("boss_hit_sound", { volume: 0.4 })
      } else {
        this.playerHitBoss(player, boss)
      }
    }, null, this)
    
    // Sword can damage boss ONLY before final stand
    if (this.player && this.player.sword) {
      this.physics.add.overlap(this.player.sword, this.boss, (sword, boss) => {
        if (boss.isDying || !this.player.swordActive) return
        if (this.survivalMode) return  // NO DAMAGE during final stand
        if (!this.player.canSwordHit(boss)) return  // Prevent multi-hit
        boss.takeDamage(10, true)  // Reduced sword damage (still effective vs metal skin)
        if (this.sound) this.sound.play("boss_hit_sound", { volume: 0.3 })
      }, null, this)
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
    
    // NO DAMAGE during final stand - just destroy projectile
    if (this.survivalMode) {
      return
    }
    
    boss.takeDamage(10)  // Reduced projectile damage
    if (this.sound) {
      this.sound.play("boss_hit_sound", { volume: 0.4 })
    }
  }
  
  bossProjectileHitPlayer(projectile, player) {
    if (!player || !player.active || player.isInvulnerable) return
    
    // Check shield - with safety check for method existence
    if (player.isShieldActive && typeof player.isShieldActive === 'function' && player.isShieldActive()) return
    
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
    if (!this.player || !this.player.isShieldActive || typeof this.player.isShieldActive !== 'function') return
    if (!this.player.isShieldActive()) return
    
    // Shield successfully blocks projectile
    projectile.destroy()
    
    // Play block sound (quieter)
    if (this.sound) {
      this.sound.play("collect_item_sound", { volume: 0.2 })
    }
    
    // Visual feedback - flash shield
    this.tweens.add({
      targets: shield,
      alpha: 1,
      scale: shield.scale * 1.2,
      duration: 100,
      yoyo: true,
      onComplete: () => {
        shield.setAlpha(0.9)
        shield.setScale(0.15)
      }
    })
  }
  
  shieldPushBoss(shield, boss) {
    // No pushback on shield block - shield just blocks damage
    return
  }
  
  triggerFinalStandFromBin(holyBin) {
    if (this.finalStandTriggered) return
    
    this.finalStandTriggered = true
    this.survivalMode = true
    this.finalStandStartTime = this.time.now
    
    // No holy music to stop (using sound effect instead)
    
    // Restart boss music at 2-minute mark
    if (this.sound.get("final_boss_theme")) {
      this.bossMusic = this.sound.get("final_boss_theme")
    } else {
      this.bossMusic = this.sound.add("final_boss_theme", { volume: 0.5, loop: false })
    }
    
    // Destroy the fake holy bin
    if (holyBin && holyBin.active) {
      holyBin.destroy()
    }
    
    // Destroy sparkle particles if they exist
    if (holyBin.sparkleParticles) {
      holyBin.sparkleParticles.destroy()
    }
    
    // WHITE FLASH SCREEN
    const whiteFlash = this.add.rectangle(
      this.cameras.main.scrollX + this.cameras.main.width / 2,
      this.cameras.main.scrollY + this.cameras.main.height / 2,
      this.cameras.main.width * 2,
      this.cameras.main.height * 2,
      0xffffff
    )
    whiteFlash.setScrollFactor(0)
    whiteFlash.setDepth(10000)
    whiteFlash.setAlpha(1)
    
    // Flash effect
    this.tweens.add({
      targets: whiteFlash,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => whiteFlash.destroy()
    })
    
    // Revive the boss at same position
    const bossX = 30 * 64
    const bossY = 11 * 64
    this.boss.setPosition(bossX, bossY)
    this.boss.setActive(true)
    this.boss.setVisible(true)
    this.boss.isDying = false
    this.boss.isDead = false
    
    // Start boss music at 2-minute mark for final stand
    const twoMinutesMark = 120 // 2 minutes in seconds
    this.bossMusic.play()
    this.bossMusic.seek = twoMinutesMark
    console.log(`🎵 Boss music restarted at ${twoMinutesMark}s for FINAL STAND!`)
    
    // Boss becomes INVINCIBLE
    this.boss.health = 9999
    this.boss.maxHealth = 9999
    
    // Make boss INSANELY aggressive - SURVIVAL MODE
    this.boss.projectileShootCooldown = 600 // Shoot every 0.6 seconds (was 2500ms)
    this.boss.walkSpeed = 100 // Move faster (was 30)
    this.boss.baseWalkSpeed = 100
    this.boss.damage = 50 // Double damage if touched
    this.boss.canShoot = true // Ensure shooting is enabled
    
    // Enable burst fire mode - shoot multiple projectiles
    this.boss.burstFireMode = true
    this.boss.burstCount = 2 // Shoot 2 projectiles at once
    
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
    
    // Spawn poison blobs more frequently during final stand
    this.poisonSpawnCooldown = 12000 // Every 12 seconds (was 15)
    
    console.log('🔥 FINAL STAND TRIGGERED! SURVIVE FOR YOUR LIFE! 🔥')
  }

  triggerFinalStand() {
    if (this.finalStandTriggered) return
    
    this.finalStandTriggered = true
    this.survivalMode = true
    this.finalStandStartTime = this.time.now
    
    console.log('🔥 FINAL STAND TRIGGERED!')
    console.log('🔥 survivalMode =', this.survivalMode)
    
    // HEAL BOSS TO FULL HEALTH
    this.boss.health = this.boss.maxHealth
    console.log('💚 Boss healed to full health:', this.boss.health)
    
    // WHITE FLASH SCREEN
    const whiteFlash = this.add.rectangle(
      this.cameras.main.scrollX + this.cameras.main.width / 2,
      this.cameras.main.scrollY + this.cameras.main.height / 2,
      this.cameras.main.width * 2,
      this.cameras.main.height * 2,
      0xffffff
    )
    whiteFlash.setScrollFactor(0)
    whiteFlash.setDepth(10000)
    whiteFlash.setAlpha(1)
    
    // Flash effect
    this.tweens.add({
      targets: whiteFlash,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => whiteFlash.destroy()
    })
    
    // Restart boss music at BEST PART (1:30 mark = 90 seconds) for intensity
    if (this.bossMusic) {
      this.bossMusic.stop()
    }
    this.bossMusic = this.sound.add("final_boss_theme", { volume: 0.6, loop: false })
    this.bossMusic.play()
    // Seek to 1:30 (90 seconds) - the most intense part of the boss theme
    this.bossMusic.once('play', () => {
      this.bossMusic.seek(90)
      console.log('🎵 Boss music jumped to 1:30 mark (best part) for FINAL STAND!')
    })
    
    // Make boss INVINCIBLE
    this.boss.health = 9999
    this.boss.maxHealth = 9999
    
    // Make boss INSANELY aggressive - SURVIVAL MODE
    this.boss.projectileShootCooldown = 400 // Shoot every 0.4 seconds (VERY FAST)
    this.boss.walkSpeed = 200  // MUCH faster so player can't run away
    this.boss.baseWalkSpeed = 200
    this.boss.jumpPower = -500  // Higher jumps to chase player
    this.boss.damage = 50
    this.boss.canShoot = true
    
    // Enable burst fire mode - shoot TRIPLE projectiles
    this.boss.burstFireMode = true
    this.boss.burstCount = 3  // 3 projectiles per burst
    
    // Visual effect - boss glows red
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
    
    // Hide top UI boss health bar during final stand (only show above-head bar)
    const uiScene = this.scene.get("UIScene")
    if (uiScene) {
      uiScene.hideBossHealthBar()
    }
    
    console.log('🔥 FINAL STAND - SURVIVE 60 SECONDS! DODGE EVERYTHING! 🔥')
  }
  
  spawnHolyBin(x, y) {
    // Ensure we only spawn once
    if (this.holyBin && this.holyBin.active) {
      console.warn('⚠️ Holy bin already spawned!')
      return
    }
    
    console.log('🏺 Spawning holy bin at:', x, y)
    
    // Create the holy recycling bin
    this.holyBin = new HolyRecyclingBin(this, x, y)
    
    // Add physics collider with ground
    this.physics.add.collider(this.holyBin, this.groundLayer)
    
    // Add overlap with player for interaction
    this.physics.add.overlap(this.player, this.holyBin, this.playerTouchHolyBin, null, this)
    
    console.log('✅ Holy bin spawned successfully')
  }
  
  showHeavenDoorsAndTransition() {
    console.log('🚪 Showing Heaven Doors animation!')
    
    // Show doors in center of camera view
    const centerX = this.cameras.main.scrollX + this.cameras.main.width / 2
    const centerY = this.cameras.main.scrollY + this.cameras.main.height / 2
    
    // Create heaven doors sprite in center
    let doorsSprite
    if (this.textures.exists('heaven_doors')) {
      doorsSprite = this.add.sprite(centerX, centerY, 'heaven_doors', 0)
      
      // Play opening animation
      if (!this.anims.exists('heaven_doors_open')) {
        this.anims.create({
          key: 'heaven_doors_open',
          frames: this.anims.generateFrameNumbers('heaven_doors', { start: 0, end: 35 }),
          frameRate: 20,
          repeat: 0
        })
      }
      doorsSprite.play('heaven_doors_open')
    } else {
      // Fallback text
      doorsSprite = this.add.text(centerX, centerY, '🚪 HEAVEN DOORS 🚪', {
        fontSize: '64px',
        fill: '#FFD700',
        stroke: '#FFF',
        strokeThickness: 8
      }).setOrigin(0.5)
    }
    
    doorsSprite.setScrollFactor(0)
    doorsSprite.setDepth(5000)
    doorsSprite.setScale(0.5)
    
    // Scale up doors
    this.tweens.add({
      targets: doorsSprite,
      scale: 1.0,
      duration: 1500,
      ease: 'Back.easeOut'
    })
    
    // Golden light behind doors
    const glow = this.add.circle(centerX, centerY, 150, 0xFFD700, 0.4)
    glow.setScrollFactor(0)
    glow.setDepth(4999)
    
    this.tweens.add({
      targets: glow,
      scale: 3,
      alpha: 0,
      duration: 2000,
      ease: 'Power2'
    })
    
    // Show "ENTERING HEAVEN" text
    const heavenText = this.add.text(centerX, centerY - 200, 'ENTERING HEAVEN', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '48px',
      fill: '#FFD700',
      stroke: '#FFF',
      strokeThickness: 6,
      align: 'center'
    }).setOrigin(0.5)
    heavenText.setScrollFactor(0)
    heavenText.setDepth(5001)
    heavenText.setAlpha(0)
    
    this.tweens.add({
      targets: heavenText,
      alpha: 1,
      duration: 1000,
      ease: 'Power2'
    })
    
    // Auto-transition to HeavenEndingScene after 4 seconds (give player time to see doors & move around)
    this.time.delayedCall(4000, () => {
      console.log('🚪 Transitioning to Heaven...')
      
      // Stop all music first
      this.sound.stopAll()
      
      // WHITE FLASH to cover transition
      const transitionFlash = this.add.rectangle(
        this.cameras.main.scrollX + this.cameras.main.width / 2,
        this.cameras.main.scrollY + this.cameras.main.height / 2,
        this.cameras.main.width * 2,
        this.cameras.main.height * 2,
        0xffffff
      )
      transitionFlash.setScrollFactor(0)
      transitionFlash.setDepth(20000)
      transitionFlash.setAlpha(0)
      
      // Fade to white, then transition
      this.tweens.add({
        targets: transitionFlash,
        alpha: 1,
        duration: 800,
        ease: 'Power2',
        onComplete: () => {
          console.log('✅ White flash complete, starting heaven scene...')
          
          try {
            this.scene.stop("UIScene")
            console.log('  - UIScene stopped')
            
            this.scene.stop()
            console.log('  - Boss scene stopped')
            
            console.log('  - About to start HeavenEndingScene...')
            this.scene.start("HeavenEndingScene")
            console.log('  - HeavenEndingScene start() called!')
          } catch (error) {
            console.error('❌ ERROR during scene transition:', error)
            console.error('Error stack:', error.stack)
          }
        }
      })
    })
  }
  
  playerTouchHolyBin(player, holyBin) {
    if (!holyBin.canInteract) return
    
    // FAKE OUT! Trigger final stand instead of victory
    this.triggerFinalStandFromBin(holyBin)
  }
  
  spawnAirStrike() {
    if (!this.player || !this.player.active) return
    
    // Target near the player (with some randomness for dodgeability)
    const offsetX = Phaser.Math.Between(-200, 200)
    const offsetY = Phaser.Math.Between(-100, 100)
    const strikeX = this.player.x + offsetX
    const strikeY = this.player.y + offsetY
    
    // Clamp to map bounds
    const clampedX = Phaser.Math.Clamp(strikeX, 100, this.mapWidth - 100)
    const clampedY = Phaser.Math.Clamp(strikeY, 100, this.mapHeight - 100)
    
    console.log('🎯 Boss calling air strike at:', clampedX, clampedY)
    
    const airStrike = new AirStrike(this, clampedX, clampedY)
    this.airStrikes.push(airStrike)
    
    // Play warning sound
    if (this.sound) {
      this.sound.play('throw_item_sound', { volume: 0.5 })
    }
  }

  update(time, delta) {
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      openPauseMenu(this)
      return
    }
    
    // Don't update boss if it's dead/inactive
    if (this.boss && !this.boss.active) {
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
      // Player should ALWAYS be able to move (even during survival mode)
      this.player.update(mergedControls, this.spaceKey, this.shiftKey, 999, delta)
    }

    if (this.boss && this.boss.active) {
      this.boss.update(delta, this.player)
      
       // DON'T update top UI boss health bar - we only show health bar above boss's head
       
       // Spawn air strikes occasionally (MUCH more frequent during final stand)
       this.lastAirStrikeTime += delta
       const airStrikeCooldown = this.survivalMode ? 5000 : this.airStrikeCooldown
       const airStrikeChance = this.survivalMode ? 1.0 : this.airStrikeChance // 100% during final stand!
       
       if (this.lastAirStrikeTime >= airStrikeCooldown) {
         if (Math.random() < airStrikeChance) {
           this.spawnAirStrike()
         }
         this.lastAirStrikeTime = 0
       }
     }
     
     // Update all active air strikes
     this.airStrikes = this.airStrikes.filter(strike => {
       if (strike && strike.active) {
         strike.update()
         return true
       }
       return false
     })
    
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
    
    // Update heaven doors if it exists
    if (this.heavenDoors && this.heavenDoors.active) {
      this.heavenDoors.update()
    }

    if (this.player && this.player.y > this.mapHeight + 100) {
      this.sound.stopAll()
      this.scene.stop("UIScene")
      this.scene.restart()
    }

    // Note: Final stand is now triggered by touching the holy bin (fake out!)
    
    // During final stand, check if 60 seconds have passed
    if (this.survivalMode) {
      const elapsedTime = this.time.now - this.finalStandStartTime
      const survivalDuration = 60000 // 60 seconds
      const timeRemaining = Math.max(0, survivalDuration - elapsedTime)
      
      // Update survival timer
      if (this.survivalTimerText) {
        const seconds = Math.ceil(timeRemaining / 1000)
        this.survivalTimerText.setText(`SURVIVE: ${seconds}s`)
      }
      
      // Boss dies after 60 seconds
      if (elapsedTime >= survivalDuration) {
        if (this.boss && this.boss.active && !this.endingTriggered) {
          this.endingTriggered = true
          
           // Clear timer text
           if (this.survivalTimerText) {
             this.survivalTimerText.destroy()
             this.survivalTimerText = null
           }
           
           // END SURVIVAL MODE IMMEDIATELY - BEFORE killing boss
           this.survivalMode = false
           console.log('✅✅✅ Survival mode ENDED - player can move!')
           console.log('   🎮 YOU CAN WALK AROUND NOW! Controls restored!')
           
           // Kill the boss
           this.boss.health = 0
           this.boss.die()
           
           // Explicitly reset player state RIGHT NOW
           if (this.player && this.player.body) {
             this.player.body.setVelocity(0, 0)
             this.player.isInvulnerable = false
             this.player.isThrowingWaste = false
             
             // Deactivate sword and shield if active
             if (this.player.shield && this.player.shield.visible) {
               this.player.deactivateShield()
             }
             if (this.player.sword && this.player.sword.visible) {
               this.player.sword.setVisible(false)
               if (this.player.sword.body) {
                 this.player.sword.body.enable = false
               }
             }
             
             console.log('✅ Player velocity reset and all states cleared')
             console.log('   - survivalMode:', this.survivalMode)
             console.log('   - player.active:', this.player.active)
             console.log('   - player.isInvulnerable:', this.player.isInvulnerable)
           }
          
          // Stop boss music
          if (this.bossMusic) {
            this.bossMusic.stop()
          }
          
          // Play victory sound
          if (this.sound) {
            this.sound.play("level_complete_sound", { volume: 0.5 })
          }
          
          // WHITE FLASH and show heaven doors briefly, then auto-transition
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
            
            // Flash white
            this.tweens.add({
              targets: whiteFlash,
              alpha: 1,
              duration: 1000,
              ease: 'Power2',
              yoyo: true,
              onComplete: () => {
                // Show heaven doors briefly in center of screen
                this.showHeavenDoorsAndTransition()
                whiteFlash.destroy()
              }
            })
          })
        }
      }
    }
    
    // NEW MECHANIC: Check if boss health is LOW (trigger final stand BEFORE death)
    if (this.boss && this.boss.active && !this.survivalMode && !this.finalStandTriggered) {
      const healthPercent = (this.boss.health / this.boss.maxHealth) * 100
      
      if (healthPercent <= 25) {  // When boss reaches 25% health
        console.log('⚠️ Boss health critical! Triggering FINAL STAND! Health:', this.boss.health)
        this.triggerFinalStand()
      }
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

