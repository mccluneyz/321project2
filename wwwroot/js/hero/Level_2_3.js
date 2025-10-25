// Phaser loaded globally
import { screenSize, playerConfig } from './gameConfig.js'
import { RecyclingPlayer } from './RecyclingPlayer.js'
import { PollutionEnemy } from './PollutionEnemy.js'
import { LevelManager } from './LevelManager.js'

export class Level_2_3 extends Phaser.Scene {
  constructor() {
    super({ key: "Level_2_3" })
  }

  create() {
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value

    this.mapWidth = 50 * 64
    this.createBackground(screenWidth, screenHeight)
    this.createTilemap()
    this.createDecorations()
    this.createPlayer()
    this.createEnemies()
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
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)

    this.scene.launch("UIScene", {
      currentLevelKey: this.scene.key,
      playerHealth: this.player.health,
      maxHealth: this.player.maxHealth,
      recyclablesCollected: 999,
      maxRecyclables: 999
    })

    this.sound.play("desert_theme", { volume: 0.4, loop: true })
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
    this.map = this.make.tilemap({ key: "level_2_3" })
    const desertTileset = this.map.addTilesetImage("desert_ground", "desert_ground")
    this.groundLayer = this.map.createLayer("ground", desertTileset, 0, 0)
    this.groundLayer.setCollisionByExclusion([-1])
    this.mapWidth = this.map.widthInPixels
  }

  createDecorations() {
    const cactiVariants = [
      'desert_cacti_variant_1', 'desert_cacti_variant_2', 'desert_cacti_variant_3',
      'desert_cacti_variant_4', 'desert_cacti_variant_5', 'desert_cacti_variant_6',
      'desert_cacti_variant_7', 'desert_cacti_variant_8', 'desert_cacti_variant_9',
      'desert_cacti_variant_10'
    ]
    
    const decorPositions = [
      { x: 3 * 64, y: 11 * 64 },
      { x: 12 * 64, y: 9 * 64 },
      { x: 19 * 64, y: 7 * 64 },
      { x: 26 * 64, y: 9 * 64 },
      { x: 33 * 64, y: 11 * 64 },
      { x: 42 * 64, y: 13 * 64 },
      { x: 47 * 64, y: 13 * 64 }
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
    const spawnX = 2 * 64
    const spawnY = 11 * 64
    this.player = new RecyclingPlayer(this, spawnX, spawnY)
    this.projectiles = this.add.group()
    this.physics.add.collider(this.player, this.groundLayer)
    this.player.setCollideWorldBounds(true)
  }

  createEnemies() {
    this.enemies = this.add.group()
    // Based on tilemap: Start (row 11), Platform 1 (row 9), Platform 2 (row 7), Platform 3 (row 9), Platform 4 (row 11), End (row 13)
    const enemyPositions = [
      { x: 4 * 64, y: 11 * 64, patrol: 160 },   // Start platform
      { x: 12 * 64, y: 9 * 64, patrol: 96 },    // Platform 1
      { x: 19 * 64, y: 7 * 64, patrol: 96 },    // Platform 2
      { x: 26 * 64, y: 9 * 64, patrol: 96 },    // Platform 3
      { x: 34 * 64, y: 11 * 64, patrol: 128 },  // Platform 4
      { x: 44 * 64, y: 13 * 64, patrol: 192 }   // End platform
    ]
    
    enemyPositions.forEach(pos => {
      const enemy = new PollutionEnemy(this, pos.x, pos.y, pos.patrol, 'desert')
      this.enemies.add(enemy)
    })
  }
  
  setupCollisions() {
    this.physics.add.collider(this.enemies, this.groundLayer)
    this.physics.add.overlap(this.projectiles, this.enemies, this.projectileHitEnemy, null, this)
    
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

  levelComplete() {
    this.sound.play("level_complete_sound", { volume: 0.05 })
    this.time.delayedCall(500, () => {
      this.scene.launch("VictoryUIScene", { currentLevelKey: this.scene.key })
    })
  }

  update(time, delta) {
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.returnToMenu()
      return
    }

    const mergedControls = {
      left: { isDown: this.cursors.left.isDown || this.wasd.left.isDown },
      right: { isDown: this.cursors.right.isDown || this.wasd.right.isDown },
      up: { isDown: this.cursors.up.isDown || this.wasd.up.isDown }
    }

    if (this.player && this.player.active) {
      this.player.update(mergedControls, this.spaceKey, this.shiftKey, 999, delta)
    }

    if (this.enemies) {
      this.enemies.getChildren().forEach(enemy => {
        if (enemy.update) enemy.update(delta, this.player)
      })
    }

    if (this.player && this.player.y > this.mapHeight + 100) {
      this.sound.stopAll()
      this.scene.stop("UIScene")
      this.scene.restart()
    }

    if (this.player.x > 48 * 64) {
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
