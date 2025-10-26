// Item progression system - auto-grants items based on level
export function autoGrantItems(scene, player) {
  if (!scene || !player) return
  
  // Get current level from scene key (e.g., "Level_3_2" or "Level_2_5_Boss")
  const levelKey = scene.scene.key
  
  // Extract world number (1-5)
  const worldMatch = levelKey.match(/Level_(\d+)/)
  if (!worldMatch) return
  
  const currentWorld = parseInt(worldMatch[1])
  
  // Auto-grant items based on progression:
  // World 1+: Shield unlocked (from 1-5 boss)
  // World 2+: Sword unlocked (from 2-5 boss)
  // World 3+: Glider unlocked (from 3-5 boss)
  // World 4+: Double Jump unlocked (from 4-5 boss)
  
  if (currentWorld >= 2) {
    // In world 2 or later, player should have shield
    player.hasShield = true
    console.log('✅ Auto-granted: Shield')
  }
  
  if (currentWorld >= 3) {
    // In world 3 or later, player should have sword
    player.hasSword = true
    console.log('✅ Auto-granted: Sword')
  }
  
  if (currentWorld >= 4) {
    // In world 4 or later, player should have glider
    player.hasGlider = true
    console.log('✅ Auto-granted: Glider')
  }
  
  if (currentWorld >= 5) {
    // In world 5, player should have double jump
    player.hasDoubleJump = true
    player.maxJumps = 2
    console.log('✅ Auto-granted: Double Jump')
  }
}

