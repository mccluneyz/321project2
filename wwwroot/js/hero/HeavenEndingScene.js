// Phaser loaded globally
import { screenSize } from './gameConfig.js'
import { RecyclingPlayer } from './RecyclingPlayer.js'

export class HeavenEndingScene extends Phaser.Scene {
  constructor() {
    super({ key: "HeavenEndingScene" })
  }

  create() {
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value
    
    this.mapWidth = 30 * 64
    this.mapHeight = 15 * 64
    
    // Heavenly white/gold gradient background
    const bg = this.add.rectangle(0, 0, this.mapWidth, this.mapHeight, 0xffffff)
    bg.setOrigin(0, 0)
    bg.setAlpha(0.95)
    
    // Add golden particles/rays
    this.createHeavenlyParticles()
    
    // Beautiful saved city background - peaceful streets
    const cityBg = this.add.image(this.mapWidth / 2, this.mapHeight / 2, 'city_background')
    cityBg.setScale(1.5)
    cityBg.setAlpha(0.6)
    cityBg.setTint(0xffffee) // Warm golden glow
    
    // Create flat ground with city tiles
    this.createFlatGround()
    
    // Create player
    this.createPlayer()
    
    // Create holy recycle bin at the end
    this.createHolyBin()
    
    // Setup camera and physics
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight, true, true, true, false)
    
    // Setup keyboard
    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    }
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    
    // HEAVEN title (show immediately)
    const heavenTitle = this.add.text(screenWidth / 2, 100, 'HEAVEN', {
      fontFamily: 'Arial Black',
      fontSize: '72px',
      color: '#FFD700',
      stroke: '#FFF',
      strokeThickness: 6,
      align: 'center',
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: '#fff',
        blur: 20,
        fill: true
      }
    })
    heavenTitle.setOrigin(0.5)
    heavenTitle.setScrollFactor(0)
    heavenTitle.setDepth(500)
    
    // Pulsing glow on title
    this.tweens.add({
      targets: heavenTitle,
      scale: 1.05,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    // "Walk to the Holy Bin" instruction
    const instructionText = this.add.text(screenWidth / 2, screenHeight - 50, 
      'Walk to the Holy Recycling Bin →', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#FFD700',
      stroke: '#000',
      strokeThickness: 3
    })
    instructionText.setOrigin(0.5)
    instructionText.setScrollFactor(0)
    instructionText.setDepth(500)
    
    this.tweens.add({
      targets: instructionText,
      alpha: 0.5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    // Play choir processional music
    this.heavenMusic = this.sound.add('heaven_choir_theme', { volume: 0.6, loop: true })
    this.heavenMusic.play()
    
    this.reachedBin = false
  }
  
  createFlatGround() {
    // Create a flat platform using city tiles
    this.groundTiles = this.add.group()
    const groundY = 13 * 64 // Ground level
    
    for (let x = 0; x < 30; x++) {
      const tile = this.add.rectangle(x * 64 + 32, groundY + 32, 64, 64, 0x888888)
      tile.setStrokeStyle(2, 0x666666)
      this.groundTiles.add(tile)
      this.physics.add.existing(tile, true) // Static body
    }
  }
  
  createPlayer() {
    const spawnX = 3 * 64
    const spawnY = 11 * 64
    this.player = new RecyclingPlayer(this, spawnX, spawnY)
    
    // Collide with ground
    this.physics.add.collider(this.player, this.groundTiles.getChildren())
    this.player.setCollideWorldBounds(true)
  }
  
  createHolyBin() {
    // Holy recycle bin at the end
    const binX = 27 * 64
    const binY = 12 * 64
    
    this.holyBin = this.add.sprite(binX, binY, 'holy_bin_sheet', 0)
    this.holyBin.setScale(1.5)
    
    // Golden glow effect
    const glow = this.add.circle(binX, binY, 80, 0xFFD700, 0.3)
    this.tweens.add({
      targets: glow,
      alpha: 0.6,
      scale: 1.2,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    // Overlap detection
    this.physics.add.existing(this.holyBin, true)
  }
  
  createHeavenlyParticles() {
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value
    
    // Create golden light particles
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, screenWidth)
      const y = Phaser.Math.Between(0, screenHeight)
      const size = Phaser.Math.Between(20, 80)
      
      const particle = this.add.circle(x, y, size, 0xFFD700, 0.3)
      
      this.tweens.add({
        targets: particle,
        alpha: 0.6,
        scale: 1.2,
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
      
      this.tweens.add({
        targets: particle,
        y: y - Phaser.Math.Between(50, 150),
        duration: Phaser.Math.Between(8000, 12000),
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut'
      })
    }
  }
  
  update(time, delta) {
    // Player movement
    if (this.player && this.player.active) {
      const mergedControls = {
        left: { isDown: this.cursors.left.isDown || this.wasd.left.isDown },
        right: { isDown: this.cursors.right.isDown || this.wasd.right.isDown },
        up: { isDown: this.cursors.up.isDown || this.wasd.up.isDown }
      }
      this.player.update(mergedControls, this.spaceKey, this.shiftKey, 999, delta)
      
      // Check if reached holy bin
      if (!this.reachedBin && this.holyBin) {
        const distance = Phaser.Math.Distance.Between(
          this.player.x, this.player.y,
          this.holyBin.x, this.holyBin.y
        )
        
        if (distance < 100) {
          this.reachedBin = true
          this.showVictoryMessage()
        }
      }
    }
    
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.sound.stopAll()
      this.scene.start("TitleScreen")
    }
  }
  
  showVictoryMessage() {
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value
    
    // "You Made It!" message
    const victoryText = this.add.text(screenWidth / 2, screenHeight / 2, 'YOU MADE IT HOME!', {
      fontFamily: 'Arial Black',
      fontSize: '72px',
      color: '#FFD700',
      stroke: '#FFF',
      strokeThickness: 6,
      align: 'center'
    })
    victoryText.setOrigin(0.5)
    victoryText.setScrollFactor(0)
    victoryText.setAlpha(0)
    victoryText.setDepth(1000)
    
    this.tweens.add({
      targets: victoryText,
      alpha: 1,
      duration: 1500,
      ease: 'Power2'
    })
    
    // Add press SPACE to continue after delay
    this.time.delayedCall(3000, () => {
      const continueText = this.add.text(screenWidth / 2, screenHeight / 2 + 100, 
        'Press SPACE to Return to Menu', {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#ffffff',
        stroke: '#000',
        strokeThickness: 3
      })
      continueText.setOrigin(0.5)
      continueText.setScrollFactor(0)
      continueText.setDepth(1000)
      
      // Enable SPACE to continue
      this.input.keyboard.on('keydown-SPACE', () => {
        this.sound.stopAll()
        this.scene.start("TitleScreen")
      })
    })
  }
}

