// Phaser is loaded globally from CDN
import { screenSize, debugConfig, renderConfig } from "./gameConfig.js"

// Import scenes
import { InitialLoadingScene } from './InitialLoadingScene.js'
import { TitleScreen } from './TitleScreen.js'
import { Level1Scene } from './Level1Scene.js'
import { Level_1_2 } from './Level_1_2.js'
import { Level_1_3 } from './Level_1_3.js'
import { Level_1_4 } from './Level_1_4.js'
import { Level_1_5_Boss } from './Level_1_5_Boss.js'
import { Level_2_1 } from './Level_2_1.js'
import { Level_2_2 } from './Level_2_2.js'
import { Level_2_3 } from './Level_2_3.js'
import { Level_2_4 } from './Level_2_4.js'
import { Level_2_5_Boss } from './Level_2_5_Boss.js'
import { Level_3_1 } from './Level_3_1.js'
import { Level_3_2 } from './Level_3_2.js'
import { Level_3_3 } from './Level_3_3.js'
import { Level_3_4 } from './Level_3_4.js'
import { Level_3_5_Boss } from './Level_3_5_Boss.js'
import { Level_4_1 } from './Level_4_1.js'
import { Level_4_2 } from './Level_4_2.js'
import { Level_4_3 } from './Level_4_3.js'
import { Level_4_4 } from './Level_4_4.js'
import { Level_4_5_Boss } from './Level_4_5_Boss.js'
import { Level_5_1 } from './Level_5_1.js'
import { Level_5_2 } from './Level_5_2.js'
import { Level_5_3 } from './Level_5_3.js'
import { Level_5_4 } from './Level_5_4.js'
import { Level_5_5_Boss } from './Level_5_5_Boss.js'
import { Level_6_1 } from './Level_6_1.js'
import { HeavenEndingScene } from './HeavenEndingScene.js'
import { UIScene } from './UIScene.js'
import { GameOverUIScene } from './GameOverUIScene.js'
import { VictoryUIScene } from './VictoryUIScene.js'
import { GameCompleteUIScene } from './GameCompleteUIScene.js'
import { GameCompleteStatsScene } from './GameCompleteStatsScene.js'
import { PauseMenuScene } from './PauseMenuScene.js'

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: screenSize.width.value,
  height: screenSize.height.value,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  loader: {
    baseURL: window.location.origin,
    path: '',
    crossOrigin: 'anonymous'
  },
  physics: {
    default: "arcade",
    arcade: {
      fps: 120,
      gravity: { y: 0 }, // Default no gravity
      debug: debugConfig.debug.value,
      debugShowBody: debugConfig.debugShowBody.value,
      debugShowStaticBody: debugConfig.debugShowStaticBody.value,
      debugShowVelocity: debugConfig.debugShowVelocity.value,
    },
  },
  pixelArt: renderConfig.pixelArt.value,
  scene: [InitialLoadingScene, TitleScreen, Level1Scene, Level_1_2, Level_1_3, Level_1_4, Level_1_5_Boss, Level_2_1, Level_2_2, Level_2_3, Level_2_4, Level_2_5_Boss, Level_3_1, Level_3_2, Level_3_3, Level_3_4, Level_3_5_Boss, Level_4_1, Level_4_2, Level_4_3, Level_4_4, Level_4_5_Boss, Level_5_1, Level_5_2, Level_5_3, Level_5_4, Level_5_5_Boss, Level_6_1, HeavenEndingScene, UIScene, VictoryUIScene, GameCompleteUIScene, GameCompleteStatsScene, GameOverUIScene, PauseMenuScene],
}

const game = new Phaser.Game(config)

// Make game instance available globally
window.phaserGame = game

export default game
