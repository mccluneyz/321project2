// Phaser loaded globally
import { screenSize, playerConfig } from './gameConfig.js'
import { RecyclingPlayer } from './RecyclingPlayer.js'
import { PollutionBoss } from './PollutionBoss.js'
import { LevelManager } from './LevelManager.js'

export class Level_4_5_Boss extends Phaser.Scene {
  constructor() {
    super({ key: "Level_4_5_Boss" })
  }

  create() {
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value

    this.mapWidth = 30 * 64
    this.createBackground(screenWidth, screenHeight)
    this.createTilemap()
    // this.createDecorations() // Disabled - ocean_debris assets not loaded
    this.createPlayer()
    this.createBoss()
    this.createFloatingPlatforms()
    this.setupCollisions()
    
    this.mapHeight = 15 * 64
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
    
    // Initialize flag to prevent multiple double jump pickups
    this.doubleJumpPickedUp = false

    this.scene.launch("UIScene", {
      currentLevelKey: this.scene.key,
      playerHealth: this.player.health,
      maxHealth: this.player.maxHealth,
      recyclablesCollected: 999,
      maxRecyclables: 999
    })

    this.bossMusic = this.sound.add("ocean_boss_theme", { volume: 0.4, loop: true })
    this.bossMusic.play()
  }

  createBackground(screenWidth, screenHeight) {
    const bgWidth = 1536
    const bgHeight = 1024
    this.mapHeight = 15 * 64
    const bgScale = this.mapHeight / bgHeight
    const scaledBgWidth = bgWidth * bgScale
    const numBackgrounds = Math.ceil(this.mapWidth / scaledBgWidth) + 1

    for (let i = 0; i < numBackgrounds; i++) {
      const bg = this.add.image(i * scaledBgWidth, 0, "ocean_background").setOrigin(0, 0)
      bg.setScale(bgScale)
      bg.setScrollFactor(0.3)
    }
  }

  createTilemap() {
    // Use level_1_5_boss flat arena with ocean tiles
    this.map = this.make.tilemap({ key: "level_1_5_boss" })
    const oceanTileset = this.map.addTilesetImage("city_ground", "ocean_ground")
    this.groundLayer = this.map.createLayer("ground", oceanTileset, 0, 0)
    this.groundLayer.setCollisionByExclusion([-1])
    this.mapWidth = this.map.widthInPixels
  }

  createDecorations() {
    const debrisVariants = ['ocean_debris_1', 'ocean_debris_2', 'ocean_debris_3']
    for (let i = 0; i < 6; i++) {
      const variant = debrisVariants[i % debrisVariants.length]
      const x = (4 + i * 4) * 64
      const y = 14 * 64
      const debris = this.add.image(x, y, variant).setOrigin(0.5, 1)
      debris.setScale(0.4)
    }
  }

  createPlayer() {
    const spawnX = 3 * 64
    const spawnY = 12 * 64
    this.player = new RecyclingPlayer(this, spawnX, spawnY)
    this.projectiles = this.add.group()
    this.bossProjectiles = this.add.group()
    this.physics.add.collider(this.player, this.groundLayer)
    this.player.setCollideWorldBounds(true)
  }

  createBoss() {
    const bossX = 22 * 64
    const bossY = 13 * 64
    this.boss = new PollutionBoss(this, bossX, bossY, 'ocean')
    this.physics.add.collider(this.boss, this.groundLayer)
    this.boss.setCollideWorldBounds(true)
  }
  
  createFloatingPlatforms() {
    // Create small 3-tile floating platforms for vertical movement
    this.platforms = this.add.group()
    
    const platformPositions = [
      { x: 6, y: 9 },   // Left side, mid height
      { x: 16, y: 7 },  // Center-left, higher
      { x: 26, y: 9 },  // Right side, mid height
      { x: 11, y: 5 }   // Center, high
    ]
    
    platformPositions.forEach(pos => {
      for (let i = 0; i < 3; i++) {
        const tile = this.add.rectangle((pos.x + i) * 64 + 32, pos.y * 64 + 32, 64, 64, 0x4488cc)
        tile.setStrokeStyle(2, 0x3366aa)
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
    
    // Sword hits boss
    if (this.player && this.player.sword) {
      this.physics.add.overlap(this.player.sword, this.boss, (sword, boss) => {
        if (boss.isDying || !this.player.swordActive) return
        boss.takeDamage(30, true)  // true = isSwordDamage
        if (this.sound) this.sound.play("boss_hit_sound", { volume: 0.3 })
      }, null, this)
    }
    
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
        player.body.setVelocityY(-500)
        if (this.sound) this.sound.play("collect_item_sound", { volume: 0.4 })
      } else {
        this.playerHitBoss(player, boss)
      }
    }, null, this)
  }
  
  projectileHitBoss(projectile, boss) {
    if (boss.isDying) return
    projectile.destroy()
    boss.takeDamage(20)
  }
  
  playerHitBoss(player, boss) {
    if (boss.isDying) return
    const newHealth = player.takeDamage(20)
    const uiScene = this.scene.get("UIScene")
    if (uiScene) uiScene.updateHealth(newHealth)
    const knockbackX = player.x < boss.x ? -300 : 300
    player.body.setVelocityX(knockbackX)
    player.body.setVelocityY(-400)
  }
  
  bossProjectileHitPlayer(projectile, player) {
    if (!projectile || !projectile.active) return
    if (player.isInvulnerable) return
    
    projectile.destroy()
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
    
    if (this.sound) {
      this.sound.play("collect_item_sound", { volume: 0.2 })
    }
    
    this.tweens.add({
      targets: shield,
      alpha: 1,
      duration: 100,
      yoyo: true,
      onComplete: () => {
        shield.setAlpha(0.8)
      }
    })
  }
  
  shieldPushBoss(shield, boss) {
    // No pushback on shield block - shield just blocks damage
    return
  }

  bossDefeated() {
    // Stop boss music
    if (this.bossMusic) {
      this.bossMusic.stop()
    }
    
    // Spawn double jump cloud pickup where boss died
    const cloudX = this.boss.x
    const cloudY = this.boss.y
    this.spawnDoubleJumpPickup(cloudX, cloudY)
  }
  
  spawnDoubleJumpPickup(x, y) {
    // Create cloud sprite on ground
    const cloudTexture = this.textures.exists('double_jump_cloud') ? 'double_jump_cloud' : 'recyclable_plastic_bottle'
    const isSheet = this.textures.exists('double_jump_cloud')
    
    this.cloudPickup = this.physics.add.sprite(x, y, cloudTexture, isSheet ? 0 : undefined)
    this.cloudPickup.setScale(0.3)
    this.cloudPickup.body.setAllowGravity(true)
    this.cloudPickup.setDepth(10)
    
    // Add collision with ground
    this.physics.add.collider(this.cloudPickup, this.groundLayer)
    
    // Add overlap with player to pick it up
    this.physics.add.overlap(this.player, this.cloudPickup, this.pickupDoubleJump, null, this)
    
    // Create simple animation for cloud if spritesheet
    if (isSheet && !this.anims.exists('cloud_pickup_float')) {
      this.anims.create({
        key: 'cloud_pickup_float',
        frames: this.anims.generateFrameNumbers('double_jump_cloud', { start: 0, end: 4 }),
        frameRate: 8,
        repeat: -1
      })
    }
    
    // Play animation if available
    if (isSheet) {
      this.cloudPickup.play('cloud_pickup_float')
    }
    
    // Add floating tween
    this.tweens.add({
      targets: this.cloudPickup,
      y: this.cloudPickup.y - 10,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }
  
  pickupDoubleJump(player, cloud) {
    if (!cloud || !cloud.active || this.doubleJumpPickedUp) return
    
    // Set flag to prevent multiple pickups
    this.doubleJumpPickedUp = true
    
    // Give player the double jump ability
    player.hasDoubleJump = true
    
    // Store in game registry so it persists across ALL scenes
    this.game.registry.set('playerHasDoubleJump', true)
    
    // Update UI immediately
    const uiScene = this.scene.get("UIScene")
    if (uiScene && uiScene.updateInventoryDisplay) {
      uiScene.updateInventoryDisplay()
    }
    
    // Play pickup sound ONCE and destroy cloud
    this.sound.play("collect_item_sound", { volume: 0.3 })
    cloud.destroy()
    
    // Show message briefly with background
    const message = this.add.text(player.x, player.y - 100, 'Double Jump Acquired!\nPress Space Twice', {
      fontSize: '28px',
      fill: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center',
      backgroundColor: '#000000aa',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5)
    message.setScrollFactor(1)
    message.setDepth(1000)
    
    this.tweens.add({
      targets: message,
      alpha: 0,
      y: message.y - 50,
      duration: 1500,
      onComplete: () => message.destroy()
    })
    
    // After 1.5 seconds, trigger level complete
    this.time.delayedCall(1500, () => {
      this.sound.play("level_complete_sound", { volume: 0.05 })
      this.time.delayedCall(500, () => {
        this.scene.launch("VictoryUIScene", { currentLevelKey: this.scene.key })
      })
    })
  }

  update(time, delta) {
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.returnToMenu()
      return
    }

    // Handle shield toggle with Q key
    if (this.player && this.player.active) {
      if (this.qKey.isDown) {
        this.player.activateShield()
      } else {
        this.player.deactivateShield()
      }
      
      if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
        this.player.swingSword()
      }
      
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

    if (this.player && this.player.y > this.mapHeight + 100) {
      this.sound.stopAll()
      this.scene.stop("UIScene")
      this.scene.restart()
    }

    // Check if boss is defeated
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
    return LevelManager.getNextLevel(this.scene.key)
  }
}

