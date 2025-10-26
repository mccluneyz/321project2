/**
 * Helper function to open the pause menu from any level scene
 * @param {Phaser.Scene} scene - The scene that is calling the pause menu
 */
export function openPauseMenu(scene) {
  console.log('⏸️ Opening pause menu from:', scene.scene.key)
  
  // Pause the current scene
  scene.scene.pause()
  
  // Launch the pause menu scene
  scene.scene.launch('PauseMenuScene', { callingScene: scene.scene.key })
}

