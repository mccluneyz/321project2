// Phaser loaded globally
import { screenSize } from './gameConfig.js'
import { RecyclingPlayer } from './RecyclingPlayer.js'
import { PollutionEnemy } from './PollutionEnemy.js'
import { LevelManager } from './LevelManager.js'

export class Level_5_1 extends Phaser.Scene {
  constructor() {
    super({ key: "Level_5_1" })
  }

  create() {
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value
    this.mapWidth = 40 * 64
    this.mapHeight = 15 * 64
    this.createBackground(screenWidth, screenHeight)
    this.createTilemap()
    this.createPlayer()
    this.createDecorations()
    this.createEnemies()
    this.setupCollisions()
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
    this.sound.play("wasteland_theme", { volume: 0.3, loop: true })
  }

  createBackground(screenWidth, screenHeight) {
    const bgWidth = 1536
    const bgHeight = 1024
    const bgScale = this.mapHeight / bgHeight
    const scaledBgWidth = bgWidth * bgScale
    const numBackgrounds = Math.ceil(this.mapWidth / scaledBgWidth) + 1
    for (let i = 0; i < numBackgrounds; i++) {
      const bg = this.add.image(i * scaledBgWidth, 0, "wasteland_background").setOrigin(0, 0)
      bg.setScale(bgScale)
      bg.setScrollFactor(0.3)
      bg.setTint(0x999999)  // Darker apocalyptic feel
    }
  }

  createTilemap() {
    // Use level_1_1 layout for level_5_1 with wasteland tiles
    this.map = this.make.tilemap({ key: "level_1_1" })
    const wastelandTileset = this.map.addTilesetImage("city_ground", "wasteland_ground")
    this.groundLayer = this.map.createLayer("ground", wastelandTileset, 0, 0)
    this.groundLayer.setCollisionByExclusion([-1])
    this.mapWidth = this.map.widthInPixels
  }

  createPlayer() {
    const spawnX = 3 * 64
    const spawnY = 11 * 64
    this.player = new RecyclingPlayer(this, spawnX, spawnY)
    this.projectiles = this.add.group()
    this.physics.add.collider(this.player, this.groundLayer)
    this.player.setCollideWorldBounds(true)
    this.player.body.onWorldBounds = true
  }

  createDecorations() {
    const barrelVariants = ['wasteland_barrel_1', 'wasteland_barrel_2', 'wasteland_barrel_3']
    const decorPositions = [
      { x: 5 * 64, y: 14 * 64 },
      { x: 12 * 64, y: 14 * 64 },
      { x: 20 * 64, y: 14 * 64 },
      { x: 28 * 64, y: 14 * 64 },
      { x: 35 * 64, y: 14 * 64 }
    ]
    decorPositions.forEach((pos, i) => {
      const variant = barrelVariants[i % barrelVariants.length]
      const barrel = this.add.image(pos.x, pos.y, variant).setOrigin(0.5, 1)
      barrel.setScale(0.5)
    })
  }

  createEnemies() {
    this.enemies = this.add.group()
    const enemyPositions = [
      { x: 11 * 64, y: 10 * 64, patrol: 128 },
      { x: 17 * 64, y: 8 * 64, patrol: 128 },
      { x: 23 * 64, y: 9 * 64, patrol: 128 },
      { x: 29 * 64, y: 7 * 64, patrol: 128 },
      { x: 8 * 64, y: 14 * 64, patrol: 192 },
      { x: 20 * 64, y: 14 * 64, patrol: 192 }
    ]
    enemyPositions.forEach(pos => {
      const enemy = new PollutionEnemy(this, pos.x, pos.y, pos.patrol, 'wasteland')
      this.enemies.add(enemy)
    })
  }
  
  setupCollisions() {
    this.physics.add.collider(this.enemies, this.groundLayer)
    this.physics.add.overlap(this.projectiles, this.enemies, this.projectileHitEnemy, null, this)
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      if (enemy.isDying || player.isInvulnerable) return
      if (player.isShieldActive()) return
      const playerBottom = player.y
      const enemyCenter = enemy.y - enemy.body.height / 2
      if (player.body.velocity.y > 0 && playerBottom < enemyCenter) {
        enemy.takeDamage(20)
        player.body.setVelocityY(-400)
        if (this.sound) this.sound.play("collect_item_sound", { volume: 0.4 })
      } else {
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

    if (this.player && this.player.x > 38 * 64) {
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

