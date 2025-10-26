import { screenSize } from './gameConfig.js'
import { gameStats } from './GameStats.js'

export class PauseMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseMenuScene' })
  }

  init(data) {
    this.callingScene = data.callingScene
  }

  create() {
    console.log('🎮 Pause Menu Opened')
    
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value
    
    // Semi-transparent black overlay
    this.overlay = this.add.rectangle(
      screenWidth / 2,
      screenHeight / 2,
      screenWidth,
      screenHeight,
      0x000000,
      0.85
    )
    this.overlay.setScrollFactor(0)
    this.overlay.setDepth(1000)
    
    // Pause Menu Container
    const menuWidth = 600
    const menuHeight = 700
    const menuX = screenWidth / 2
    const menuY = screenHeight / 2
    
    // Menu background with gradient effect (using multiple rectangles)
    const menuBg = this.add.rectangle(menuX, menuY, menuWidth, menuHeight, 0x0f0f1e)
    menuBg.setStrokeStyle(6, 0xffd700)
    menuBg.setScrollFactor(0)
    menuBg.setDepth(1001)
    
    // Inner border for depth
    const innerBorder = this.add.rectangle(menuX, menuY, menuWidth - 20, menuHeight - 20, 0x1a1a2e, 0)
    innerBorder.setStrokeStyle(2, 0x444466)
    innerBorder.setScrollFactor(0)
    innerBorder.setDepth(1001)
    
    // Title with shadow
    const titleShadow = this.add.text(menuX + 3, menuY - 200 + 3, '⏸️ PAUSED', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '64px',
      fill: '#000',
      stroke: '#000',
      strokeThickness: 8
    }).setOrigin(0.5)
    titleShadow.setScrollFactor(0)
    titleShadow.setDepth(1001)
    titleShadow.setAlpha(0.5)
    
    const title = this.add.text(menuX, menuY - 200, '⏸️ PAUSED', {
      fontFamily: 'RetroPixel, monospace',
      fontSize: '64px',
      fill: '#ffd700',
      stroke: '#fff',
      strokeThickness: 6
    }).setOrigin(0.5)
    title.setScrollFactor(0)
    title.setDepth(1002)
    
    // Buttons - centered and spaced nicely
    this.createButton(menuX, menuY - 50, '▶️ RESUME', () => this.resumeGame(), 0x4CAF50)
    this.createButton(menuX, menuY + 20, '🔄 RESET STAGE', () => this.resetStage(), 0xFF9800)
    this.createButton(menuX, menuY + 90, '🏠 RESET RUN', () => this.resetFullRun(), 0xF44336)
    
    // Fullscreen toggle button
    const isFullscreen = document.fullscreenElement
    const fullscreenText = isFullscreen ? '⤓ EXIT FULLSCREEN' : '⛶ FULLSCREEN'
    this.createButton(menuX, menuY + 160, fullscreenText, () => this.toggleFullscreen(), 0x9C27B0)
    
    // ESC hint with subtle styling
    const escHint = this.add.text(menuX, menuY + 230, 'Press ESC or click RESUME to continue', {
      fontFamily: 'Arial',
      fontSize: '14px',
      fill: '#aaa',
      align: 'center',
      fontStyle: 'italic'
    }).setOrigin(0.5)
    escHint.setScrollFactor(0)
    escHint.setDepth(1002)
    
    // Subtle glow animation on title
    this.tweens.add({
      targets: title,
      alpha: 0.8,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    // ESC key listener
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    
    // Prevent input passthrough to game
    this.input.keyboard.enabled = true
  }
  
  
  createButton(x, y, text, callback, color) {
    // Button shadow
    const shadow = this.add.rectangle(x + 4, y + 4, 420, 55, 0x000000, 0.4)
    shadow.setScrollFactor(0)
    shadow.setDepth(1001)
    
    // Button background
    const button = this.add.rectangle(x, y, 420, 55, color)
    button.setStrokeStyle(3, 0xffffff, 0.8)
    button.setScrollFactor(0)
    button.setDepth(1002)
    button.setInteractive({ useHandCursor: true })
    
    // Button text
    const buttonText = this.add.text(x, y, text, {
      fontFamily: 'Arial',
      fontSize: '22px',
      fill: '#fff',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5)
    buttonText.setScrollFactor(0)
    buttonText.setDepth(1003)
    
    // Hover effects
    button.on('pointerover', () => {
      button.setFillStyle(Phaser.Display.Color.GetColor(
        Math.min(255, Phaser.Display.Color.IntegerToColor(color).red + 40),
        Math.min(255, Phaser.Display.Color.IntegerToColor(color).green + 40),
        Math.min(255, Phaser.Display.Color.IntegerToColor(color).blue + 40)
      ))
      buttonText.setScale(1.08)
      shadow.setScale(1.05)
      
      // Glow effect
      this.tweens.add({
        targets: button,
        alpha: 0.9,
        duration: 200,
        yoyo: true
      })
    })
    
    button.on('pointerout', () => {
      button.setFillStyle(color)
      button.setAlpha(1)
      buttonText.setScale(1.0)
      shadow.setScale(1.0)
    })
    
    button.on('pointerdown', () => {
      // Play click sound if available
      if (this.sound && this.sound.get('ui_click')) {
        this.sound.play('ui_click', { volume: 0.3 })
      }
      
      // Button press animation
      this.tweens.add({
        targets: [button, buttonText],
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 100,
        yoyo: true,
        onComplete: () => callback()
      })
    })
  }
  
  resumeGame() {
    console.log('▶️ Resuming game...')
    this.scene.stop()
    this.scene.resume(this.callingScene)
  }
  
  resetStage() {
    console.log('🔄 Resetting stage...')
    
    // Stop pause menu
    this.scene.stop()
    
    // Stop UI scene
    const uiScene = this.scene.get('UIScene')
    if (uiScene) {
      this.scene.stop('UIScene')
    }
    
    // Restart the calling scene
    this.scene.stop(this.callingScene)
    
    // Small delay to ensure cleanup
    setTimeout(() => {
      this.scene.start(this.callingScene)
    }, 100)
  }
  
  resetFullRun() {
    console.log('🏠 Resetting full run - returning to title screen...')
    
    // Reset game stats
    gameStats.reset()
    
    // Stop all scenes
    this.scene.stop()
    
    const uiScene = this.scene.get('UIScene')
    if (uiScene) {
      this.scene.stop('UIScene')
    }
    
    this.scene.stop(this.callingScene)
    
    // Stop all music
    this.sound.stopAll()
    
    // Return to title screen
    this.scene.start('TitleScreen')
  }
  
  toggleFullscreen() {
    console.log('⛶ Toggling fullscreen...')
    
    if (!document.fullscreenElement) {
      // Enter fullscreen
      document.documentElement.requestFullscreen().then(() => {
        console.log('✅ Entered fullscreen mode')
        // Recreate the menu to update button text
        this.scene.restart({ callingScene: this.callingScene })
      }).catch(err => {
        console.error('❌ Fullscreen request failed:', err)
      })
    } else {
      // Exit fullscreen
      document.exitFullscreen().then(() => {
        console.log('✅ Exited fullscreen mode')
        // Recreate the menu to update button text
        this.scene.restart({ callingScene: this.callingScene })
      })
    }
  }
  
  update() {
    // ESC to resume (but ignore if in fullscreen, let browser handle it first)
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      if (document.fullscreenElement) {
        // In fullscreen - ESC will exit fullscreen, don't close menu yet
        console.log('ESC pressed in fullscreen - letting browser handle it')
      } else {
        // Not in fullscreen - close pause menu
        this.resumeGame()
      }
    }
  }
}

