// Phaser loaded globally
import { screenSize, playerConfig } from './gameConfig.js'
import { RecyclingPlayer } from './RecyclingPlayer.js'
import { PollutionBoss } from './PollutionBoss.js'
import { LevelManager } from './LevelManager.js'

export class Level_2_5_Boss extends Phaser.Scene {
  constructor() {
    super({ key: "Level_2_5_Boss" })
  }

  create() {
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value

    this.mapWidth = 60 * 64
    this.createBackground(screenWidth, screenHeight)
    this.createTilemap()
    this.createDecorations()
    this.createPlayer()
    this.createBoss()
    this.setupCollisions()
    
    this.mapHeight = 15 * 64  // 960px - same as map
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
    
    // Initialize flag to prevent multiple sword pickups
    this.swordPickedUp = false

    this.scene.launch("UIScene", {
      currentLevelKey: this.scene.key,
      playerHealth: this.player.health,
      maxHealth: this.player.maxHealth,
      recyclablesCollected: 999,
      maxRecyclables: 999
    })

    this.bossMusic = this.sound.add("desert_boss_theme", { volume: 0.4, loop: true })
    this.bossMusic.play()
  }

  createBackground(screenWidth, screenHeight) {
    const bgWidth = 1536
    const bgHeight = 1024
    this.mapHeight = 15 * 64  // Set early for background scale
    const bgScale = this.mapHeight / bgHeight  // Scale to map height
    const scaledBgWidth = bgWidth * bgScale
    const numBackgrounds = Math.ceil(this.mapWidth / scaledBgWidth) + 1
    
    for (let i = 0; i < numBackgrounds; i++) {
      const bg = this.add.image(i * scaledBgWidth, 0, "desert_background").setOrigin(0, 0)
      bg.setScale(bgScale)
      bg.setScrollFactor(0.3)
    }
  }

  createTilemap() {
    this.map = this.make.tilemap({ key: "level_2_5_boss" })
    const desertTileset = this.map.addTilesetImage("desert_ground", "desert_ground")
    this.groundLayer = this.map.createLayer("ground", desertTileset, 0, 0)
    this.groundLayer.setCollisionByExclusion([-1])
    this.mapWidth = this.map.widthInPixels
  }

  createDecorations() {
    const cactiVariants = [
      'desert_cacti_variant_1', 'desert_cacti_variant_2', 'desert_cacti_variant_3',
      'desert_cacti_variant_4', 'desert_cacti_variant_5'
    ]
    
    const decorPositions = [
      { x: 3 * 64, y: 13 * 64 },
      { x: 7 * 64, y: 13 * 64 },
      { x: 53 * 64, y: 13 * 64 },
      { x: 57 * 64, y: 13 * 64 }
    ]
    
    decorPositions.forEach((pos, i) => {
      const variant = cactiVariants[i % cactiVariants.length]
      const cactus = this.add.image(pos.x, pos.y, variant).setOrigin(0.5, 1)
      const targetHeight = 1.5 * 64
      const actualHeight = cactus.height
      const targetScale = targetHeight / actualHeight
      cactus.setScale(targetScale)
    })
  }

  createPlayer() {
    const spawnX = 5 * 64
    const spawnY = 11 * 64  // Fixed spawn position
    this.player = new RecyclingPlayer(this, spawnX, spawnY)
    this.projectiles = this.add.group()
    this.bossProjectiles = this.add.group()
    this.physics.add.collider(this.player, this.groundLayer)
    this.player.setCollideWorldBounds(true)
  }

  createBoss() {
    const bossX = 45 * 64
    const bossY = 11 * 64  // Spawn lower on ground to prevent floating
    this.boss = new PollutionBoss(this, bossX, bossY, 'desert')
    this.physics.add.collider(this.boss, this.groundLayer)
  }
  
  setupCollisions() {
    this.physics.add.overlap(this.projectiles, this.boss, this.projectileHitBoss, null, this)
    
    // Boss projectiles hit player
    this.physics.add.overlap(this.bossProjectiles, this.player, this.bossProjectileHitPlayer, null, this)
    
    // Shield blocks boss projectiles
    this.physics.add.overlap(this.bossProjectiles, this.player.shield, this.shieldBlockProjectile, null, this)
    
    // Shield pushes boss away
    this.physics.add.overlap(this.player.shield, this.boss, this.shieldPushBoss, null, this)
    
    // Player-Boss collision - handles both stomp and damage
    this.physics.add.overlap(this.player, this.boss, (player, boss) => {
      if (boss.isDying || player.isInvulnerable) return
      
      // Check if shield is active - blocks damage
      if (player.isShieldActive()) {
        return  // Shield blocks boss contact damage
      }
      
      // Check if player is bouncing on boss (player's feet above boss's center)
      const playerBottom = player.y
      const bossCenter = boss.y - boss.body.height / 2
      
      if (player.body.velocity.y > 0 && playerBottom < bossCenter) {
        // Stomp mechanic - damage boss and bounce player
        boss.takeDamage(30)
        player.body.setVelocityY(-500)
        if (this.sound) this.sound.play("boss_hit_sound", { volume: 0.4 })
      } else {
        // Normal collision - damage player
        this.playerHitBoss(player, boss)
      }
    }, null, this)
  }
  
  playerHitBoss(player, boss) {
    if (boss.isDying) return
    const newHealth = player.takeDamage(boss.damage)
    const uiScene = this.scene.get("UIScene")
    if (uiScene) uiScene.updateHealth(newHealth)
    const knockbackX = player.x < boss.x ? -300 : 300
    player.body.setVelocityX(knockbackX)
    player.body.setVelocityY(-400)
  }
  
  projectileHitBoss(projectile, boss) {
    if (boss.isDying) return
    projectile.destroy()
    boss.takeDamage(20)
    if (this.sound) {
      this.sound.play("boss_hit_sound", { volume: 0.3 })
    }
  }
  
  bossProjectileHitPlayer(projectile, player) {
    if (!player || !player.active || player.isInvulnerable) return
    
    // Check if shield is blocking
    if (player.isShieldActive()) return
    
    if (projectile && projectile.active) {
      projectile.destroy()
    }
    const newHealth = player.takeDamage(15)
    const uiScene = this.scene.get("UIScene")
    if (uiScene && uiScene.updateHealth) {
      uiScene.updateHealth(newHealth)
    }
    // Use existing sound that we know works
    if (this.sound) {
      this.sound.play("collect_item_sound", { volume: 0.3 })
    }
  }
  
  shieldBlockProjectile(projectile, shield) {
    if (!projectile || !projectile.active) return
    
    // Destroy projectile with visual feedback
    projectile.destroy()
    
    // Play block sound (quieter)
    if (this.sound) {
      this.sound.play("collect_item_sound", { volume: 0.2 })
    }
    
    // Shield flash effect
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

  levelComplete() {
    // Stop boss music
    if (this.bossMusic) {
      this.bossMusic.stop()
    }
    
    // Spawn sword pickup where boss died
    const swordX = this.boss.x
    const swordY = this.boss.y
    this.spawnSwordPickup(swordX, swordY)
  }
  
  spawnSwordPickup(x, y) {
    // Create sword sprite on ground
    const swordTexture = this.textures.exists('player_sword') ? 'player_sword' : 'recyclable_plastic_bottle'
    const isSheet = this.textures.exists('player_sword')
    
    this.swordPickup = this.physics.add.sprite(x, y, swordTexture, isSheet ? 0 : undefined)
    this.swordPickup.setScale(0.25)
    this.swordPickup.body.setAllowGravity(true)
    this.swordPickup.setDepth(10)
    
    // Add collision with ground
    this.physics.add.collider(this.swordPickup, this.groundLayer)
    
    // Add overlap with player to pick it up
    this.physics.add.overlap(this.player, this.swordPickup, this.pickupSword, null, this)
    
    // Create simple animation for sword if spritesheet
    if (isSheet && !this.anims.exists('sword_pickup_float')) {
      this.anims.create({
        key: 'sword_pickup_float',
        frames: this.anims.generateFrameNumbers('player_sword', { start: 0, end: 4 }),
        frameRate: 8,
        repeat: -1
      })
    }
    
    // Play animation if available
    if (isSheet) {
      this.swordPickup.play('sword_pickup_float')
    }
    
    // Add floating tween
    this.tweens.add({
      targets: this.swordPickup,
      y: this.swordPickup.y - 10,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }
  
  pickupSword(player, sword) {
    if (!sword || !sword.active || this.swordPickedUp) return
    
    // Set flag to prevent multiple pickups
    this.swordPickedUp = true
    
    // Give player the sword ability
    player.hasSword = true
    
    // Store in game registry so it persists across ALL scenes
    this.game.registry.set('playerHasSword', true)
    
    // Update UI immediately
    const uiScene = this.scene.get("UIScene")
    if (uiScene && uiScene.updateInventoryDisplay) {
      uiScene.updateInventoryDisplay()
    }
    
    // Play pickup sound ONCE and destroy sword
    this.sound.play("collect_item_sound", { volume: 0.3 })
    sword.destroy()
    
    // Show message briefly with background
    const message = this.add.text(player.x, player.y - 100, 'Sword Acquired!\nPress R to Swing', {
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
      
      // Update boss health bar in UI
      const uiScene = this.scene.get("UIScene")
      if (uiScene) {
        uiScene.updateBossHealth(this.boss.health, this.boss.maxHealth)
      }
    }
    
    // Update homing projectiles
    if (this.bossProjectiles && this.player && this.player.active) {
      this.bossProjectiles.children.entries.forEach(projectile => {
        if (projectile.active && projectile.isHoming) {
          // Calculate angle to player
          const angle = Phaser.Math.Angle.Between(projectile.x, projectile.y, this.player.x, this.player.y)
          
          // Smoothly adjust velocity toward player
          const targetVelX = Math.cos(angle) * projectile.homingSpeed
          const targetVelY = Math.sin(angle) * projectile.homingSpeed
          
          projectile.body.velocity.x += (targetVelX - projectile.body.velocity.x) * projectile.homingStrength
          projectile.body.velocity.y += (targetVelY - projectile.body.velocity.y) * projectile.homingStrength
        }
      })
    }

    // Check if boss is defeated
    if (this.boss && this.boss.isDead && !this.levelCompleted) {
      this.levelCompleted = true
      this.levelComplete()
    }

    if (this.player && this.player.y > this.mapHeight + 100) {
      this.sound.stopAll()
      this.scene.stop("UIScene")
      this.scene.restart()
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
