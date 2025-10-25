// Phaser loaded globally
import { screenSize } from './gameConfig.js'

export class TitleScreen extends Phaser.Scene {
  constructor() {
    super({
      key: "TitleScreen",
    })
    this.isStarting = false
    this.showingLevelSelect = false
  }

  init() {
    this.isStarting = false
    this.showingLevelSelect = false
  }

  preload() {
    // Resources are loaded in InitialLoadingScene, no need to load again here
  }

  create() {
    // Create background
    this.createBackground()
    this.createUI()
    this.setupInputs()
    this.playBackgroundMusic()
  }

  // Create background (use level 1 background)
  createBackground() {
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value
    
    // Calculate background scale
    const bgImage = this.add.image(0, 0, "city_background").setOrigin(0, 0)
    const bgScaleX = screenWidth / bgImage.width
    const bgScaleY = screenHeight / bgImage.height
    const bgScale = Math.max(bgScaleX, bgScaleY) // Use larger scale ratio to ensure complete coverage
    
    bgImage.setScale(bgScale)
    
    // Center background
    bgImage.x = (screenWidth - bgImage.width * bgScale) / 2
    bgImage.y = (screenHeight - bgImage.height * bgScale) / 2
  }

  createUI() {
    this.createGameTitle()
    this.createPressEnterText()
  }

  createGameTitle() {
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value
    
    this.gameTitle = this.add.image(screenWidth / 2, screenHeight * 0.35, "game_title")
    
    const maxTitleWidth = screenWidth * 0.7
    const maxTitleHeight = screenHeight * 0.6

    if (this.gameTitle.width / this.gameTitle.height > maxTitleWidth / maxTitleHeight) {
        this.gameTitle.setScale(maxTitleWidth / this.gameTitle.width)
    } else {
        this.gameTitle.setScale(maxTitleHeight / this.gameTitle.height)
    }
    // Ensure top distance is 50px
    this.gameTitle.y = 50 + this.gameTitle.displayHeight / 2
  }

  createPressEnterText() {
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value
    
    // Create PRESS ENTER text (centered at bottom)
    this.pressEnterText = this.add.text(screenWidth / 2, screenHeight * 0.75, 'PRESS ENTER TO START', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: Math.min(screenWidth / 20, 48) + 'px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 10,
      align: 'center'
    }).setOrigin(0.5, 0.5)

    // Ensure bottom distance is 80px
    this.pressEnterText.y = screenHeight - 80 - this.pressEnterText.displayHeight / 2

    // Add blinking animation
    this.tweens.add({
      targets: this.pressEnterText,
      alpha: 0.3,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    })
    
    // Add control instructions
    this.controlsText = this.add.text(screenWidth / 2, this.pressEnterText.y + 60, 
      'WASD/Arrows: Move  |  SPACE: Jump  |  SHIFT: Throw  |  Q: Shield', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: Math.min(screenWidth / 40, 20) + 'px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 5,
      align: 'center'
    }).setOrigin(0.5, 0.5)
  }

  // Setup input listeners
  setupInputs() {
    // Enter key
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    
    // Mouse click
    this.input.on('pointerdown', () => {
      this.startGame()
    })
    
    // Keyboard listener
    this.input.keyboard.on('keydown', (event) => {
      if (event.code === 'Enter' || event.code === 'Space') {
        this.startGame()
      }
    })
  }

  // Play background music
  playBackgroundMusic() {
    this.backgroundMusic = this.sound.add("city_theme", {
      volume: 0.6,
      loop: true
    })
    this.backgroundMusic.play()
  }

  // Show level select screen
  startGame() {
    if (this.isStarting || this.showingLevelSelect) return
    
    this.showingLevelSelect = true
    
    // Hide press enter text
    this.pressEnterText.setVisible(false)
    this.controlsText.setVisible(false)
    
    // Show level selection
    this.createLevelSelect()
  }
  
  createLevelSelect() {
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value
    
    // Create container for level buttons
    this.levelSelectContainer = this.add.container(0, 0)
    
    // Title
    const title = this.add.text(screenWidth / 2, screenHeight * 0.3, 'SELECT WORLD', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '48px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5)
    this.levelSelectContainer.add(title)
    
    // World data
    const worlds = [
      { name: 'World 1: City', level: 'Level_1_1', color: '#4a9eff' },
      { name: 'World 2: Desert', level: 'Level_2_1', color: '#ffaa44' },
      { name: 'World 3: Factory', level: 'Level_3_1', color: '#888888' },
      { name: 'World 4: Ocean', level: 'Level_4_1', color: '#44aaff' },
      { name: 'World 5: Wasteland', level: 'Level_5_1', color: '#aa44aa' }
    ]
    
    const startY = screenHeight * 0.45
    const buttonSpacing = 60
    
    worlds.forEach((world, index) => {
      const y = startY + (index * buttonSpacing)
      
      // Button background
      const buttonBg = this.add.rectangle(screenWidth / 2, y, 400, 50, 0x000000, 0.7)
      buttonBg.setStrokeStyle(3, parseInt(world.color.replace('#', '0x')))
      buttonBg.setInteractive({ useHandCursor: true })
      
      // Button text
      const buttonText = this.add.text(screenWidth / 2, y, world.name, {
        fontFamily: 'RetroPixel, monospace',
        fontSize: '24px',
        fill: world.color,
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5)
      
      // Hover effects
      buttonBg.on('pointerover', () => {
        buttonBg.setFillStyle(parseInt(world.color.replace('#', '0x')), 0.3)
        buttonText.setScale(1.1)
      })
      
      buttonBg.on('pointerout', () => {
        buttonBg.setFillStyle(0x000000, 0.7)
        buttonText.setScale(1.0)
      })
      
      // Click to start level
      buttonBg.on('pointerdown', () => {
        this.startLevel(world.level)
      })
      
      this.levelSelectContainer.add([buttonBg, buttonText])
    })
    
    // Back button
    const backButton = this.add.text(screenWidth / 2, screenHeight - 100, '< BACK', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '20px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5)
    backButton.setInteractive({ useHandCursor: true })
    backButton.on('pointerover', () => backButton.setScale(1.1))
    backButton.on('pointerout', () => backButton.setScale(1.0))
    backButton.on('pointerdown', () => this.hideLevelSelect())
    this.levelSelectContainer.add(backButton)
  }
  
  hideLevelSelect() {
    if (this.levelSelectContainer) {
      this.levelSelectContainer.destroy()
      this.levelSelectContainer = null
    }
    this.showingLevelSelect = false
    this.pressEnterText.setVisible(true)
    this.controlsText.setVisible(true)
  }
  
  startLevel(levelKey) {
    if (this.isStarting) return
    
    this.isStarting = true
    
    // Stop background music
    if (this.backgroundMusic) {
      this.backgroundMusic.stop()
    }
    
    // Fade out then switch to game
    this.cameras.main.fadeOut(500, 0, 0, 0)
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(levelKey)
    })
  }

  update() {
    // Check Enter key or Space key
    if (Phaser.Input.Keyboard.JustDown(this.enterKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.startGame()
    }
  }
}
