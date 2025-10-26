// This file generates all 25 level classes programmatically
// World 1: City (1-1 to 1-5)
// World 2: Desert (2-1 to 2-5)
// World 3: Factory (3-1 to 3-5)
// World 4: Ocean (4-1 to 4-5)
// World 5: Wasteland (5-1 to 5-5)

const fs = require('fs')
const path = require('path')

const levelTemplate = (levelKey, world, levelNum, isBoss) => {
  const themes = {
    1: { name: 'city', bg: 'city_background', music: 'city_theme', tileset: 'city_ground', enemy: 'city' },
    2: { name: 'desert', bg: 'desert_background', music: 'desert_theme', tileset: 'desert_ground', enemy: 'desert' },
    3: { name: 'factory', bg: 'factory_background', music: 'city_theme', tileset: 'factory_ground', enemy: 'factory' },
    4: { name: 'ocean', bg: 'ocean_background', music: 'city_theme', tileset: 'ocean_ground', enemy: 'ocean' },
    5: { name: 'wasteland', bg: 'wasteland_background', music: 'desert_theme', tileset: 'wasteland_ground', enemy: 'wasteland' }
  }
  
  const theme = themes[world]
  const className = `Level_${world}_${levelNum}${isBoss ? '_Boss' : ''}`
  const mapKey = `level_${world}_${levelNum}${isBoss ? '_boss' : ''}`
  
  return `import Phaser from 'phaser'
import { screenSize } from './gameConfig.js'
import { RecyclingPlayer } from './RecyclingPlayer.js'
import { PollutionEnemy } from './PollutionEnemy.js'
${isBoss ? "import { PollutionBoss } from './PollutionBoss.js'\n" : ''}import { LevelManager } from './LevelManager.js'

export class ${className} extends Phaser.Scene {
  constructor() {
    super({ key: "${levelKey}" })
  }

  create() {
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value

    this.mapWidth = 40 * 64
    this.createBackground(screenWidth, screenHeight)
    this.createTilemap()
    this.createPlayer()
    this.createEnemies()
    this.setupCollisions()
    
    this.cameras.main.setBounds(0, 0, this.mapWidth, screenHeight)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
    this.physics.world.setBounds(0, 0, this.mapWidth, screenHeight)

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

    this.sound.play("${theme.music}", { volume: 0.4, loop: true })
  }

  createBackground(screenWidth, screenHeight) {
    const bgWidth = 1536
    const bgHeight = 1024
    const bgScale = screenHeight / bgHeight
    const scaledBgWidth = bgWidth * bgScale
    const numBackgrounds = Math.ceil(this.mapWidth / scaledBgWidth) + 1
    
    for (let i = 0; i < numBackgrounds; i++) {
      const bg = this.add.image(i * scaledBgWidth, 0, "${theme.bg}").setOrigin(0, 0)
      bg.setScale(bgScale)
      bg.setScrollFactor(0.3)
    }
  }

  createTilemap() {
    this.map = this.make.tilemap({ key: "${mapKey}" })
    const tileset = this.map.addTilesetImage("${theme.tileset}", "${theme.tileset}")
    this.groundLayer = this.map.createLayer("ground", tileset, 0, 0)
    this.groundLayer.setCollisionByExclusion([-1])
    this.mapWidth = this.map.widthInPixels
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
    ${isBoss ? `
    // Boss level - single boss enemy
    const boss = new PollutionBoss(this, 30 * 64, 11 * 64, '${theme.enemy}')
    this.enemies.add(boss)
    this.boss = boss
    ` : `
    // Regular enemies
    const enemyPositions = [
      { x: 9 * 64, y: 10 * 64, patrol: 160 },
      { x: 15 * 64, y: 8 * 64, patrol: 128 },
      { x: 21 * 64, y: 6 * 64, patrol: 192 },
      { x: 27 * 64, y: 9 * 64, patrol: 160 },
      { x: 33 * 64, y: 7 * 64, patrol: 128 }
    ]
    
    enemyPositions.forEach(pos => {
      const enemy = new PollutionEnemy(this, pos.x, pos.y, pos.patrol, '${theme.enemy}')
      this.enemies.add(enemy)
    })
    `}
  }
  
  setupCollisions() {
    this.physics.add.collider(this.enemies, this.groundLayer)
    this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, null, this)
    this.physics.add.overlap(this.projectiles, this.enemies, this.projectileHitEnemy, null, this)
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
    this.sound.play("level_complete_sound", { volume: 0.15 })
    this.time.delayedCall(500, () => {
      ${isBoss && world === 5 && levelNum === 5 ? `
      this.scene.launch("GameCompleteUIScene", { currentLevelKey: this.scene.key })
      ` : `
      this.scene.launch("VictoryUIScene", { currentLevelKey: this.scene.key })
      `}
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
        if (enemy.update) enemy.update(delta)
      })
    }

    if (this.player.y > screenSize.height.value + 100) {
      this.player.health = 0
      this.player.die()
    }

    ${isBoss ? `
    // Boss level - check if boss is defeated
    if (this.boss && this.boss.isDead) {
      this.levelComplete()
    }
    ` : `
    // Regular level - check if reached end
    if (this.player.x > 38 * 64) {
      this.levelComplete()
    }
    `}
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
`
}

// Generate all 25 levels
const levels = []
for (let world = 1; world <= 5; world++) {
  for (let level = 1; level <= 5; level++) {
    const isBoss = level === 5
    const levelKey = `Level_${world}_${level}${isBoss ? '_Boss' : ''}`
    levels.push({ world, level, isBoss, levelKey })
  }
}

// Skip Level_1_1 since it already exists as Level1Scene.js
const filteredLevels = levels.filter(l => !(l.world === 1 && l.level === 1))

// Generate files
filteredLevels.forEach(({ world, level, isBoss, levelKey }) => {
  const content = levelTemplate(levelKey, world, level, isBoss)
  const filename = `${levelKey}.js`
  const filepath = path.join(__dirname, filename)
  fs.writeFileSync(filepath, content)
  console.log(`Generated: ${filename}`)
})

console.log(`\nGenerated ${filteredLevels.length} level files!`)
