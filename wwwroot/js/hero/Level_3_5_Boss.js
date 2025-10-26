// Phaser loaded globally
import { screenSize, playerConfig } from './gameConfig.js'
import { RecyclingPlayer } from './RecyclingPlayer.js'
import { PollutionBoss } from './PollutionBoss.js'
import { LevelManager } from './LevelManager.js'

export class Level_3_5_Boss extends Phaser.Scene {
  constructor() {
    super({ key: "Level_3_5_Boss" })
  }

  create() {
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value

    this.mapWidth = 30 * 64
    this.createBackground(screenWidth, screenHeight)
    this.createTilemap()
    this.createDecorations()
    this.createPlayer()
    this.createBoss()
    // this.createFloatingPlatforms() // REMOVED - platforms not needed for boss fight
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
    
    // Initialize flag to prevent multiple glider pickups
    this.gliderPickedUp = false

    this.scene.launch("UIScene", {
      currentLevelKey: this.scene.key,
      playerHealth: this.player.health,
      maxHealth: this.player.maxHealth,
      recyclablesCollected: 999,
      maxRecyclables: 999
    })

    this.bossMusic = this.sound.add("factory_boss_theme", { volume: 0.4, loop: true })
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
      const bg = this.add.image(i * scaledBgWidth, 0, "factory_background").setOrigin(0, 0)
      bg.setScale(bgScale)
      bg.setScrollFactor(0.3)
    }
  }

  createTilemap() {
    this.map = this.make.tilemap({ key: "level_3_5_boss" })
    const factoryTileset = this.map.addTilesetImage("factory_ground", "factory_ground")
    this.groundLayer = this.map.createLayer("ground", factoryTileset, 0, 0)
    this.groundLayer.setCollisionByExclusion([-1])
    this.mapWidth = this.map.widthInPixels
  }

  createDecorations() {
    const pipeVariants = [
      'factory_pipes_variant_1', 'factory_pipes_variant_2', 'factory_pipes_variant_3',
      'factory_pipes_variant_4', 'factory_pipes_variant_5'
    ]
    
    const decorPositions = [
      { x: 3 * 64, y: 13 * 64, variant: 0 },
      { x: 8 * 64, y: 13 * 64, variant: 1 },
      { x: 20 * 64, y: 13 * 64, variant: 2 },
      { x: 25 * 64, y: 13 * 64, variant: 3 },
      { x: 28 * 64, y: 13 * 64, variant: 4 }
    ]
    
    decorPositions.forEach((pos) => {
      const variant = pipeVariants[pos.variant % pipeVariants.length]
      const pipe = this.add.image(pos.x, pos.y, variant).setOrigin(0.5, 1)
      const targetHeight = 1.5 * 64
      const actualHeight = pipe.height
      const targetScale = targetHeight / actualHeight
      pipe.setScale(targetScale)
    })
  }

  createPlayer() {
    const spawnX = 2 * 64
    const spawnY = 11 * 64  // Fixed spawn position
    this.player = new RecyclingPlayer(this, spawnX, spawnY)
    this.projectiles = this.add.group()
    this.bossProjectiles = this.add.group()
    this.physics.add.collider(this.player, this.groundLayer)
    this.player.setCollideWorldBounds(true)
  }

  createBoss() {
    const bossX = 22 * 64
    const bossY = 13 * 64  // Oil blob spawn - sits on ground at row 13
    this.boss = new PollutionBoss(this, bossX, bossY, 'factory')  // Use factory (oil) boss
    this.physics.add.collider(this.boss, this.groundLayer)
    this.boss.setCollideWorldBounds(true)
  }
  
  createFloatingPlatforms() {
    // Create small 3-tile floating platforms for vertical movement
    this.platforms = this.add.group()
    
    const platformPositions = [
      { x: 8, y: 9 },   // Left side, mid height
      { x: 18, y: 7 },  // Center-left, higher
      { x: 28, y: 9 },  // Right side, mid height
      { x: 13, y: 5 }   // Center, high
    ]
    
    platformPositions.forEach(pos => {
      for (let i = 0; i < 3; i++) {
        const tile = this.add.rectangle((pos.x + i) * 64 + 32, pos.y * 64 + 32, 64, 64, 0x666666)
        tile.setStrokeStyle(2, 0x444444)
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
    
    // SWORD hits boss
    if (this.player.sword) {
      this.physics.add.overlap(this.player.sword, this.boss, (sword, boss) => {
        if (boss.isDying || !this.player.swordActive) return
        if (!this.player.canSwordHit(boss)) return  // Prevent multi-hit
        boss.takeDamage(15, true)  // Sword damage (works on metal skin)
        if (this.sound) this.sound.play("boss_hit_sound", { volume: 0.3 })
      }, null, this)
    }
    
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
        boss.takeDamage(20)
        player.body.setVelocityY(-400)
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
    
    // Spawn glider pickup where boss died
    const gliderX = this.boss.x
    const gliderY = this.boss.y
    this.spawnGliderPickup(gliderX, gliderY)
  }
  
  spawnGliderPickup(x, y) {
    // Create glider sprite on ground
    const gliderTexture = this.textures.exists('player_glider') ? 'player_glider' : 'recyclable_plastic_bottle'
    const isSheet = this.textures.exists('player_glider')
    
    this.gliderPickup = this.physics.add.sprite(x, y, gliderTexture, isSheet ? 0 : undefined)
    this.gliderPickup.setScale(0.3)
    this.gliderPickup.body.setAllowGravity(true)
    this.gliderPickup.setDepth(10)
    
    // Add collision with ground
    this.physics.add.collider(this.gliderPickup, this.groundLayer)
    
    // Add overlap with player to pick it up
    this.physics.add.overlap(this.player, this.gliderPickup, this.pickupGlider, null, this)
    
    // Create simple animation for glider if spritesheet
    if (isSheet && !this.anims.exists('glider_pickup_float')) {
      this.anims.create({
        key: 'glider_pickup_float',
        frames: this.anims.generateFrameNumbers('player_glider', { start: 0, end: 4 }),
        frameRate: 8,
        repeat: -1
      })
    }
    
    // Play animation if available
    if (isSheet) {
      this.gliderPickup.play('glider_pickup_float')
    }
    
    // Add floating tween
    this.tweens.add({
      targets: this.gliderPickup,
      y: this.gliderPickup.y - 10,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }
  
  pickupGlider(player, glider) {
    if (!glider || !glider.active || this.gliderPickedUp) return
    
    // Set flag to prevent multiple pickups
    this.gliderPickedUp = true
    
    // Give player the glider ability
    player.hasGlider = true
    
    // Store in game registry so it persists across ALL scenes
    this.game.registry.set('playerHasGlider', true)
    
    // Update UI immediately
    const uiScene = this.scene.get("UIScene")
    if (uiScene && uiScene.updateInventoryDisplay) {
      uiScene.updateInventoryDisplay()
    }
    
    // Play pickup sound ONCE and destroy glider
    this.sound.play("collect_item_sound", { volume: 0.3 })
    glider.destroy()
    
    // Show message briefly with background
    const message = this.add.text(player.x, player.y - 100, 'Glider Acquired!\nHold Space to Glide', {
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
