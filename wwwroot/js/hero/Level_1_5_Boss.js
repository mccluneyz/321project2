// Phaser loaded globally
import { screenSize } from './gameConfig.js'
import { RecyclingPlayer } from './RecyclingPlayer.js'
import { PollutionEnemy } from './PollutionEnemy.js'
import { PollutionBoss } from './PollutionBoss.js'
import { LevelManager } from './LevelManager.js'

export class Level_1_5_Boss extends Phaser.Scene {
  constructor() {
    super({ key: "Level_1_5_Boss" })
  }

  create() {
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value
    this.mapWidth = 40 * 64
    this.mapHeight = 15 * 64  // 960px - same as map
    this.createBackground(screenWidth, screenHeight)
    this.createTilemap()
    this.createPlayer()
    this.createEnemies()
    this.setupCollisions()
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
    
    // Initialize flag to prevent multiple shield pickups
    this.shieldPickedUp = false
    
    this.scene.launch("UIScene", {
      currentLevelKey: this.scene.key,
      playerHealth: this.player.health,
      maxHealth: this.player.maxHealth,
      recyclablesCollected: 999,
      maxRecyclables: 999
    })
    this.bossMusic = this.sound.add("boss_battle_theme", { volume: 0.4, loop: true })
    this.bossMusic.play()
  }

  createBackground(screenWidth, screenHeight) {
    const bgWidth = 1536
    const bgHeight = 1024
    const bgScale = this.mapHeight / bgHeight  // Scale to map height
    const scaledBgWidth = bgWidth * bgScale
    const numBackgrounds = Math.ceil(this.mapWidth / scaledBgWidth) + 1
    for (let i = 0; i < numBackgrounds; i++) {
      const bg = this.add.image(i * scaledBgWidth, 0, "city_background").setOrigin(0, 0)
      bg.setScale(bgScale)
      bg.setScrollFactor(0.3)
    }
  }

  createTilemap() {
    this.map = this.make.tilemap({ key: "level_1_5_boss" })
    const tileset = this.map.addTilesetImage("city_ground", "city_ground")
    this.groundLayer = this.map.createLayer("ground", tileset, 0, 0)
    this.groundLayer.setCollisionByExclusion([-1])
    this.mapWidth = this.map.widthInPixels
  }

  createPlayer() {
    const spawnX = 2 * 64
    const spawnY = 11 * 64
    this.player = new RecyclingPlayer(this, spawnX, spawnY)
    this.projectiles = this.add.group()
    // No boss projectiles for first boss
    this.physics.add.collider(this.player, this.groundLayer)
    this.player.setCollideWorldBounds(true)
  }

  createEnemies() {
    this.enemies = this.add.group()
    // Boss spawns higher and falls to ground
    const boss = new PollutionBoss(this, 30 * 64, 5 * 64, 'city')  // Spawn higher, will fall to ground
    boss.canShoot = false  // First boss doesn't shoot projectiles
    boss.setScale(0.7)  // Scale down - city boss is too big
    this.enemies.add(boss)
    this.boss = boss
  }
  
  setupCollisions() {
    this.physics.add.collider(this.enemies, this.groundLayer)
    this.physics.add.overlap(this.projectiles, this.enemies, this.projectileHitEnemy, null, this)
    
    // No boss projectiles in first boss fight
    
    // Player-Enemy collision - handles both stomp and damage
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      if (enemy.isDying || player.isInvulnerable) return
      
      // Check if player is bouncing on enemy (player's feet above enemy's center)
      const playerBottom = player.y
      const enemyCenter = enemy.y - enemy.body.height / 2
      
      if (player.body.velocity.y > 0 && playerBottom < enemyCenter) {
        // Stomp mechanic - damage enemy and bounce player
        enemy.takeDamage(20)
        player.body.setVelocityY(-400)
        if (this.sound) this.sound.play("collect_item_sound", { volume: 0.4 })
      } else {
        // Normal collision - damage player
        this.playerHitEnemy(player, enemy)
      }
    }, null, this)
  }
  
  playerHitEnemy(player, enemy) {
    if (enemy.isDying) return
    const newHealth = player.takeDamage(enemy.damage)
    const uiScene = this.scene.get("UIScene")
    if (uiScene) uiScene.updateHealth(newHealth)
    const knockbackX = player.x < enemy.x ? -200 : 200
    player.body.setVelocityX(knockbackX)
    player.body.setVelocityY(-300)
  }
  
  projectileHitEnemy(projectile, enemy) {
    if (enemy.isDying) return
    projectile.destroy()
    enemy.takeDamage(15)
  }
  
  bossProjectileHitPlayer(projectile, player) {
    if (!player || !player.active || player.isInvulnerable) return
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

  levelComplete() {
    // Stop boss music
    if (this.bossMusic) {
      this.bossMusic.stop()
    }
    
    // Spawn shield pickup where boss died
    const shieldX = this.boss.x
    const shieldY = this.boss.y
    this.spawnShieldPickup(shieldX, shieldY)
  }
  
  spawnShieldPickup(x, y) {
    // Create shield sprite on ground
    const shieldTexture = this.textures.exists('player_shield') ? 'player_shield' : 'recyclable_plastic_bottle'
    this.shieldPickup = this.physics.add.sprite(x, y, shieldTexture)
    this.shieldPickup.setScale(0.2)
    this.shieldPickup.body.setAllowGravity(true)
    this.shieldPickup.setDepth(10)
    
    // Add collision with ground
    this.physics.add.collider(this.shieldPickup, this.groundLayer)
    
    // Add overlap with player to pick it up
    this.physics.add.overlap(this.player, this.shieldPickup, this.pickupShield, null, this)
    
    // Add floating animation
    this.tweens.add({
      targets: this.shieldPickup,
      y: this.shieldPickup.y - 10,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }
  
  pickupShield(player, shield) {
    if (!shield || !shield.active || this.shieldPickedUp) return
    
    // Set flag to prevent multiple pickups
    this.shieldPickedUp = true
    
    // Give player the shield ability
    player.hasShield = true
    
    // Store in game registry so it persists across ALL scenes
    this.game.registry.set('playerHasShield', true)
    
    // Update UI immediately
    const uiScene = this.scene.get("UIScene")
    if (uiScene && uiScene.updateInventoryDisplay) {
      uiScene.updateInventoryDisplay()
    }
    
    // Play pickup sound ONCE and destroy shield
    this.sound.play("collect_item_sound", { volume: 0.3 })
    shield.destroy()
    
    // Show message briefly with background
    const message = this.add.text(player.x, player.y - 100, 'Shield Acquired!\nPress Q to Block', {
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
    
    // Update boss health bar in UI
    if (this.boss && this.boss.active) {
      const uiScene = this.scene.get("UIScene")
      if (uiScene) {
        uiScene.updateBossHealth(this.boss.health, this.boss.maxHealth)
      }
      this.boss.update(delta, this.player)
    }
    
    // Handle shield, sword, and glider
    if (this.player && this.player.active) {
      // Handle shield toggle with Q key
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
    // Boss update is handled above with health bar update - no need to update again
    if (this.player && this.player.y > this.mapHeight + 100) {
      this.sound.stopAll()
      this.scene.stop("UIScene")
      this.scene.restart()
    }
    if (this.boss && this.boss.isDead) {
      this.levelComplete()
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
