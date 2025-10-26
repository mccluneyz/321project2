// Phaser loaded globally
import { screenSize, playerConfig } from './gameConfig.js'
import { RecyclingPlayer } from './RecyclingPlayer.js'
import { MusicManager } from './MusicManager.js'
import { autoGrantItems } from './ItemProgression.js'

export class Level_6_1 extends Phaser.Scene {
  constructor() {
    super({ key: "Level_6_1" })
  }

  init() {
    // Victory lap - unlimited ammo
  }

  create() {
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value

    // Setup map dimensions
    this.mapWidth = 40 * 64  // 2560px
    this.mapHeight = 15 * 64  // 960px

    // Create background
    this.createBackground(screenWidth, screenHeight)

    // Create tilemap
    this.createTilemap()

    // Create player at start position
    this.createPlayer()
    
    // Setup collisions
    this.setupCollisions()
    
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
    this.cameras.main.setDeadzone(200, 150)

    // Setup world bounds
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight, true, true, true, false)

    // Setup controls
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

    // Launch UI
    this.scene.launch("UIScene", {
      currentLevelKey: this.scene.key,
      playerHealth: this.player.health,
      maxHealth: this.player.maxHealth,
      recyclablesCollected: 999,
      maxRecyclables: 999
    })

    // Play heaven music
    // Use city theme as peaceful victory music (heaven_choir_theme doesn't exist)
    MusicManager.playLevelMusic(this, "city_theme", 0.4)
    
    // Create end portal at the end of the level
    this.createEndPortal()
    
    // Show victory message
    this.showVictoryMessage()
  }

  createBackground(screenWidth, screenHeight) {
    // Check if heaven background exists
    if (this.textures.exists('heaven_background')) {
      // Use the provided heaven background PNG
      const bg = this.add.image(0, 0, 'heaven_background')
      bg.setOrigin(0, 0)
      bg.setScrollFactor(0)
      
      // Scale to fit screen if needed
      const scaleX = this.cameras.main.width / bg.width
      const scaleY = this.cameras.main.height / bg.height
      const scale = Math.max(scaleX, scaleY)
      bg.setScale(scale)
      
      // Center the background
      bg.setPosition(
        (this.cameras.main.width - bg.displayWidth) / 2,
        (this.cameras.main.height - bg.displayHeight) / 2
      )
      
      console.log('✅ Heaven background loaded!')
    } else {
      // Fallback: bright sky blue gradient with clouds
      console.warn('⚠️ Heaven background not found, using fallback')
      const gradient = this.add.graphics()
      gradient.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xFFFFFF, 0xFFFFFF, 1)
      gradient.fillRect(0, 0, this.mapWidth, this.mapHeight)
      gradient.setScrollFactor(0)
      
      // Add some simple cloud shapes as placeholders
      for (let i = 0; i < 8; i++) {
        const cloudX = Phaser.Math.Between(0, this.mapWidth)
        const cloudY = Phaser.Math.Between(50, 300)
        const cloud = this.add.ellipse(cloudX, cloudY, 150, 80, 0xFFFFFF, 0.7)
        cloud.setScrollFactor(0.2 + Math.random() * 0.2)
      }
    }
  }

  createTilemap() {
    // Use a simple city map
    this.map = this.make.tilemap({ key: "level_1_1" })
    const cityTileset = this.map.addTilesetImage("city_ground", "city_ground")
    this.groundLayer = this.map.createLayer("ground", cityTileset, 0, 0)
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
    
    // Grant all abilities for victory lap
    autoGrantItems(this, this.player)
    this.player.hasShield = true
    this.player.hasSword = true
    this.player.hasGlider = true
    this.player.hasDoubleJump = true
    this.player.maxJumps = 2
  }
  
  setupCollisions() {
    // No enemies, just enjoy the victory
  }
  
  createEndPortal() {
    // Create a glowing portal at the end of the map
    const portalX = 38 * 64
    const portalY = 11 * 64
    
    // Create portal sprite (using recycling bin as placeholder)
    this.portal = this.add.rectangle(portalX, portalY, 64, 96, 0xffffff)
    this.portal.setStrokeStyle(4, 0xffff00)
    this.physics.add.existing(this.portal)
    this.portal.body.setAllowGravity(false)
    
    // Add glowing animation
    this.tweens.add({
      targets: this.portal,
      alpha: { from: 0.5, to: 1 },
      scale: { from: 1, to: 1.2 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    // Add text above portal
    const portalText = this.add.text(portalX, portalY - 80, 'HEAVEN', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '24px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5)
    
    // Floating text animation
    this.tweens.add({
      targets: portalText,
      y: portalY - 90,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    // Add overlap with player
    this.physics.add.overlap(this.player, this.portal, this.enterPortal, null, this)
  }
  
  enterPortal(player, portal) {
    if (this.portalEntered) return
    this.portalEntered = true
    
    // White flash to heaven
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
    
    this.tweens.add({
      targets: whiteFlash,
      alpha: 1,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => {
        this.sound.stopAll()
        this.scene.stop("UIScene")
        this.scene.start("HeavenEndingScene")
      }
    })
  }
  
  showVictoryMessage() {
    // Show a celebratory message
    const victoryText = this.add.text(
      this.cameras.main.width / 2, 
      100, 
      'YOU DEFEATED THE POLLUTION!\nTHE WORLD IS SAVED!', 
      {
        fontFamily: 'RetroPixel, monospace',
        fontSize: '32px',
        fill: '#ffff00',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(1000)
    
    // Fade out after 5 seconds
    this.tweens.add({
      targets: victoryText,
      alpha: 0,
      duration: 2000,
      delay: 3000,
      ease: 'Power2',
      onComplete: () => victoryText.destroy()
    })
  }

  update(time, delta) {
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.returnToMenu()
      return
    }

    // Handle all player abilities
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

    // Death = restart
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
}

