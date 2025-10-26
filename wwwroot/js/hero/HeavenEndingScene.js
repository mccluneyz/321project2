// Phaser loaded globally
import { screenSize } from './gameConfig.js'
import { RecyclingPlayer } from './RecyclingPlayer.js'
import { HolyRecyclingBin } from './HolyRecyclingBin.js'

export class HeavenEndingScene extends Phaser.Scene {
  constructor() {
    super({ key: "HeavenEndingScene" })
  }

  create() {
    console.log('🌟🌟🌟 HEAVEN SCENE CREATE CALLED! 🌟🌟🌟')
    console.log('Scene key:', this.scene.key)
    console.log('Scene is active:', this.scene.isActive())
    
    try {
    
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value
    
    this.mapWidth = 30 * 64
    this.mapHeight = 15 * 64
    
    // White overlay for fade-in transition
    const whiteOverlay = this.add.rectangle(
      screenWidth / 2,
      screenHeight / 2,
      screenWidth * 2,
      screenHeight * 2,
      0xffffff
    )
    whiteOverlay.setScrollFactor(0)
    whiteOverlay.setDepth(10000)
    whiteOverlay.setAlpha(1)  // Start fully white
    
    // Fade from white
    this.tweens.add({
      targets: whiteOverlay,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => whiteOverlay.destroy()
    })
    
    // Use heaven background if it exists, otherwise fallback
    if (this.textures.exists('heaven_background')) {
      const bg = this.add.image(this.mapWidth / 2, this.mapHeight / 2, 'heaven_background')
      
      // Scale to cover the map area
      const scaleX = this.mapWidth / bg.width
      const scaleY = this.mapHeight / bg.height
      const scale = Math.max(scaleX, scaleY)
      bg.setScale(scale)
      
      console.log('✅ Heaven background loaded for ending scene!')
    } else {
      // Fallback: Heavenly white/gold gradient background
      console.warn('⚠️ Heaven background not found, using fallback')
      const bg = this.add.rectangle(0, 0, this.mapWidth, this.mapHeight, 0xffffff)
      bg.setOrigin(0, 0)
      bg.setAlpha(0.95)
      
      // Add golden particles/rays
      this.createHeavenlyParticles()
    }
    
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
    
    // Play heaven music
    console.log('🎵 Starting heaven music...')
    
    this.sound.stopAll()
    
    this.heavenMusic = this.sound.add('heaven_music_theme', { volume: 0.5, loop: true })
    this.heavenMusic.play()
    
    // Verify music is playing
    this.heavenMusic.once('play', () => {
      console.log('✅ Heaven music (heaven_music_theme) is now playing!')
    })
    
    this.heavenMusic.once('looped', () => {
      console.log('🔄 Heaven music looped')
    })
    
    this.reachedBin = false
    
    console.log('✅ Heaven scene setup complete!')
    
    } catch (error) {
      console.error('❌ ERROR in Heaven scene create:', error)
      console.error('Error stack:', error.stack)
    }
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
    // Holy recycle bin at the end (using proper animated sprite)
    const binX = 27 * 64
    const binY = 12 * 64
    
    this.holyBin = new HolyRecyclingBin(this, binX, binY)
    this.holyBin.setScale(0.8)  // Reasonable size
    
    // Collide with ground
    this.physics.add.collider(this.holyBin, this.groundTiles.getChildren())
    
    // Player can interact with bin
    this.physics.add.overlap(this.player, this.holyBin, this.playerTouchHolyBin, null, this)
  }
  
  playerTouchHolyBin(player, holyBin) {
    if (this.reachedBin) return  // Already triggered
    
    this.reachedBin = true
    console.log('🏆 Player touched holy bin - showing stats!')
    
    // Play victory sound
    if (this.sound) {
      this.sound.play('level_complete_sound', { volume: 0.8 })
    }
    
    // WHITE FLASH
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
    
    // Flash white
    this.tweens.add({
      targets: whiteFlash,
      alpha: 1,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        // Stop all music
        this.sound.stopAll()
        
        // Launch GameCompleteStatsScene
        this.scene.stop()
        this.scene.start('GameCompleteStatsScene')
      }
    })
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
      
      // Holy bin interaction handled by physics overlap callback
    }
    
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.sound.stopAll()
      this.scene.start("TitleScreen")
    }
  }
  
}

