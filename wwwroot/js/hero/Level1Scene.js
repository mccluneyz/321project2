// Phaser loaded globally
import { screenSize, playerConfig } from './gameConfig.js'
import { RecyclingPlayer } from './RecyclingPlayer.js'
import { PollutionEnemy } from './PollutionEnemy.js'
import { LevelManager } from './LevelManager.js'
import { autoGrantItems } from './ItemProgression.js'
import { MusicManager } from './MusicManager.js'

export class Level1Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level_1_1" })
  }

  init() {
    // Unlimited ammo - no need to track recyclables
  }

  create() {
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value

    // Setup map dimensions - 40 tiles wide, 15 tiles high
    this.mapWidth = 40 * 64  // 2560px
    this.mapHeight = 15 * 64  // 960px

    // Create background with parallax
    this.createBackground(screenWidth, screenHeight)

    // Create tilemap
    this.createTilemap()

    // Create player at start position
    this.createPlayer()

    // No collectibles needed - unlimited ammo
    
    // Create enemies
    this.createEnemies()
    
    // Setup collisions
    this.setupCollisions()
    
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
    this.cameras.main.setDeadzone(200, 150)  // Add deadzone for smoother camera

    // Setup world bounds
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight, true, true, true, false)

    // Setup controls - Arrow keys and WASD
    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    }
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)

    // Launch UI
    this.scene.launch("UIScene", {
      currentLevelKey: this.scene.key,
      playerHealth: this.player.health,
      maxHealth: this.player.maxHealth,
      recyclablesCollected: 999,  // Show unlimited
      maxRecyclables: 999
    })

    // Play background music
    MusicManager.playLevelMusic(this, "city_theme", 0.4)
  }

  createBackground(screenWidth, screenHeight) {
    // Tile the background to cover the entire map width and height
    const bgWidth = 1536  // city_background width
    const bgHeight = 1024  // city_background height
    const bgScale = this.mapHeight / bgHeight  // Scale to map height instead of screen
    
    // Calculate how many background images we need
    const scaledBgWidth = bgWidth * bgScale
    const numBackgrounds = Math.ceil(this.mapWidth / scaledBgWidth) + 1
    
    for (let i = 0; i < numBackgrounds; i++) {
      const bg = this.add.image(i * scaledBgWidth, 0, "city_background").setOrigin(0, 0)
      bg.setScale(bgScale)
      bg.setScrollFactor(0.3)  // Parallax effect
    }
  }

  createTilemap() {
    // Load tilemap
    this.map = this.make.tilemap({ key: "level_1_1" })
    const cityTileset = this.map.addTilesetImage("city_ground", "city_ground")

    // Create ground layer
    this.groundLayer = this.map.createLayer("ground", cityTileset, 0, 0)

    // Set collision - exclude empty tiles (-1)
    this.groundLayer.setCollisionByExclusion([-1])
    
    // Update mapWidth based on actual tilemap size
    this.mapWidth = this.map.widthInPixels
  }

  createPlayer() {
    // Spawn player on starting ground section (top surface at row 11)
    const spawnX = 3 * 64  // x position on starting ground
    const spawnY = 11 * 64  // Row 11 is the top of starting ground section

    this.player = new RecyclingPlayer(this, spawnX, spawnY)
    
    // Auto-grant items based on level progression
    autoGrantItems(this, this.player)

    // Initialize projectiles group
    this.projectiles = this.add.group()

    // Collision with ground
    this.physics.add.collider(this.player, this.groundLayer)

    // World bounds collision - only left, right, and top (player can fall if they go too far down)
    this.player.setCollideWorldBounds(true)
    this.player.body.onWorldBounds = true
  }

  createEnemies() {
    this.enemies = this.add.group()
    
    // Place enemies on platform surfaces
    // Tilemap structure: Starting ground (top=11), Platforms (tops=10,8,9,7,10), End (top=11), Base floor (top=14)
    const enemyPositions = [
      // Removed first enemy - too close to spawn
      { x: 11 * 64, y: 10 * 64, patrol: 128 },  // Platform 1 (row 10-13)
      { x: 17 * 64, y: 8 * 64, patrol: 128 },   // Platform 2 (row 8-13)
      { x: 23 * 64, y: 9 * 64, patrol: 128 },   // Platform 3 (row 9-13)
      { x: 29 * 64, y: 7 * 64, patrol: 128 },   // Platform 4 (row 7-13)
      { x: 35 * 64, y: 10 * 64, patrol: 128 },  // Platform 5 (row 10-13)
      { x: 8 * 64, y: 14 * 64, patrol: 192 },   // Base floor
      { x: 20 * 64, y: 14 * 64, patrol: 192 },  // Base floor
      { x: 32 * 64, y: 14 * 64, patrol: 192 }   // Base floor
    ]
    
    enemyPositions.forEach(pos => {
      const enemy = new PollutionEnemy(this, pos.x, pos.y, pos.patrol, 'city')
      this.enemies.add(enemy)
    })
  }
  
  setupCollisions() {
    // Enemy collisions with ground
    this.physics.add.collider(this.enemies, this.groundLayer)
    
    // Projectile-Enemy collision (damage enemy)
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
    
    // Damage player
    const newHealth = player.takeDamage(enemy.damage)
    
    // Update UI
    const uiScene = this.scene.get("UIScene")
    if (uiScene) {
      uiScene.updateHealth(newHealth)
    }
    
    // Knockback player
    const knockbackX = player.x < enemy.x ? -200 : 200
    player.body.setVelocityX(knockbackX)
    player.body.setVelocityY(-300)
  }
  
  projectileHitEnemy(projectile, enemy) {
    if (enemy.isDying) return
    
    // Destroy projectile
    projectile.destroy()
    
    // Damage enemy
    enemy.takeDamage(15)
  }

  levelComplete() {
    this.sound.play("level_complete_sound", { volume: 0.05 })
    this.time.delayedCall(500, () => {
      this.scene.launch("VictoryUIScene", {
        currentLevelKey: this.scene.key
      })
    })
  }

  update(time, delta) {
    // ESC to menu
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.returnToMenu()
      return
    }

    // Merge WASD and arrow keys
    const mergedControls = {
      left: { isDown: this.cursors.left.isDown || this.wasd.left.isDown },
      right: { isDown: this.cursors.right.isDown || this.wasd.right.isDown },
      up: { isDown: this.cursors.up.isDown || this.wasd.up.isDown },
      down: { isDown: this.cursors.down.isDown || this.wasd.down.isDown }
    }

    // Update player - unlimited ammo, pass delta for cooldown
    if (this.player && this.player.active) {
      this.player.update(
        mergedControls,
        this.spaceKey,
        this.shiftKey,
        999,  // Unlimited ammo
        delta
      )
    }

    // Update enemies
    if (this.enemies) {
      this.enemies.getChildren().forEach(enemy => {
        if (enemy.update) {
          enemy.update(delta, this.player)
        }
      })
    }

    // Check if player fell off map (below the visible base floor)
    if (this.player && this.player.y > this.mapHeight + 100) {
      handlePlayerDeath(this)
    }

    // Check if player reached end of level (x > 38 tiles)
    if (this.player.x > 38 * 64) {
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
