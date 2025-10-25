# Recycling Hero - Game Documentation

## 🎮 Game Overview
**Recycling Hero** is a 2D side-scrolling platformer where players control a recycling worker who collects recyclable items and throws them at pollution bosses to clean up the environment.

Built with **Phaser 3** and integrated into the RecycleRank ASP.NET Core application.

---

## 🗺️ Game Structure

### 25-Level System (Mario-Style Progression)
The game features **5 Worlds** with **5 Levels** each (format: World-Level)

#### 🏙️ World 1: City (Levels 1-1 to 1-5)
- **Theme**: Urban environment with buildings and concrete platforms
- **Background**: City skyline
- **Music**: City theme (upbeat 8-bit)
- **Tileset**: `city_ground.png` (concrete/pavement)
- **Decorations**: City buildings
- **Boss (1-5)**: Pollution Monster

#### 🏜️ World 2: Desert (Levels 2-1 to 2-5)
- **Theme**: Sandy wasteland with cacti
- **Background**: Desert dunes
- **Music**: Desert theme (mysterious 8-bit)
- **Tileset**: `desert_ground.png` (sand)
- **Decorations**: Cacti and rocks
- **Boss (2-5)**: Pollution Monster

#### 🏭 World 3: Factory (Levels 3-1 to 3-5)
- **Theme**: Industrial factory environment
- **Background**: Factory interior
- **Music**: City theme (will be customized)
- **Tileset**: `city_ground.png` (temporary)
- **Boss (3-5)**: Pollution Monster

#### 🌊 World 4: Ocean (Levels 4-1 to 4-5)
- **Theme**: Coastal/underwater areas
- **Background**: Ocean scenery
- **Music**: City theme (will be customized)
- **Tileset**: `city_ground.png` (temporary)
- **Boss (4-5)**: Pollution Monster

#### ☠️ World 5: Wasteland (Levels 5-1 to 5-5)
- **Theme**: Post-apocalyptic waste dump
- **Background**: Wasteland
- **Music**: Desert theme (will be customized)
- **Tileset**: `desert_ground.png` (temporary)
- **Final Boss (5-5)**: Ultimate Pollution Monster

---

### Level Types

#### Regular Levels (1-1, 1-2, 1-3, 1-4, 2-1, etc.)
- Platform-based challenges
- Collectible recyclables scattered throughout
- Progressive difficulty
- Reach the end to complete

#### Boss Levels (1-5, 2-5, 3-5, 4-5, 5-5)
- Boss battle arena
- Use collected recyclables as ammunition
- Defeat boss to advance to next world
- Level 5-5 is the final boss

---

## 🎯 Gameplay Mechanics

### Player Abilities
1. **Walk** (Left/Right Arrow Keys)
2. **Jump** (Up Arrow Key)
3. **Throw Recyclables** (D Key)
   - Can carry up to 5 recyclables at once
   - Thrown items damage bosses and enemies

### Collectible Items
Players collect recyclable items that serve as ammunition:
- **Plastic Bottles** (Blue) 🍼
- **Aluminum Cans** (Silver) 🥫
- **Paper Items** (White/Beige) 📄
- **Glass Bottles** (Green) 🍾

### Health System
- Player starts with **100 HP**
- Invulnerability period after taking damage (**2 seconds**)
- Hurt stun duration: **100ms**
- Death triggers **Game Over** screen

### Boss Mechanics
- Bosses have **200 HP**
- Patrol behavior with detection range
- Attack cooldown: **3 seconds**
- Defeated bosses unlock next world

---

## 📊 Level Progression System

### LevelManager.js
Manages all 25 levels in order with utility functions:

```javascript
// Get next level
LevelManager.getNextLevel('Level_1_1') // Returns 'Level_1_2'

// Check if boss level
LevelManager.isBossLevel('Level_1_5_Boss') // Returns true

// Get display name
LevelManager.getDisplayName('Level_1_1') // Returns "1-1"

// Get world theme
LevelManager.getWorldTheme(1) // Returns city theme config
```

---

## ⚙️ Game Configuration

### Player Config (`playerConfig` in gameConfig.js)
```javascript
{
  walkSpeed: 260,
  jumpPower: 800,
  gravityY: 1200,
  maxHealth: 100,
  hurtingDuration: 100,      // ms
  invulnerableTime: 2000,    // ms
  maxRecyclables: 5
}
```

### Boss Config (`bossConfig` in gameConfig.js)
```javascript
{
  walkSpeed: 100,
  maxHealth: 200,
  attackCooldown: 3000,      // ms
  patrolDistance: 300,       // pixels
  detectionRange: 400        // pixels
}
```

---

## 📁 Assets Structure

### File Organization
```
wwwroot/assets/hero/
├── images/
│   ├── player/
│   │   ├── recycling_hero_idle_R.png
│   │   ├── recycling_hero_walk_R.png
│   │   ├── recycling_hero_jump_R.png
│   │   ├── recycling_hero_throw_R.png
│   │   └── recycling_hero_die_R.png
│   │
│   ├── enemies/
│   │   ├── pollution_boss_idle_R.png
│   │   ├── pollution_boss_walk_R.png
│   │   ├── pollution_boss_attack_R.png
│   │   └── pollution_boss_die_R.png
│   │
│   ├── items/
│   │   ├── plastic_bottle.png
│   │   ├── aluminum_can.png
│   │   ├── paper_item.png
│   │   └── glass_bottle.png
│   │
│   ├── tilesets/
│   │   ├── city_ground.png
│   │   ├── desert_ground.png
│   │   ├── factory_ground.png
│   │   ├── ocean_ground.png
│   │   └── wasteland_ground.png
│   │
│   └── backgrounds/
│       ├── city_skyline.png
│       ├── desert_dunes.png
│       ├── factory_interior.png
│       ├── ocean_scenery.png
│       └── wasteland_ruins.png
│
├── audio/
│   ├── sfx/
│   │   ├── collect_item_sound.mp3
│   │   ├── throw_item_sound.mp3
│   │   ├── boss_hit_sound.mp3
│   │   ├── player_jump.mp3
│   │   ├── player_hurt.mp3
│   │   └── level_complete_sound.mp3
│   │
│   └── music/
│       ├── city_theme.mp3
│       ├── desert_theme.mp3
│       ├── boss_battle_theme.mp3
│       └── title_screen.mp3
│
└── tilemaps/
    ├── level_1_1.json
    ├── level_1_2.json
    ├── level_1_3.json
    ├── level_1_4.json
    ├── level_1_5_boss.json
    └── ... (up to level_5_5_boss.json)
```

---

## 🎬 Character Animations

### Player Animations (RecyclingPlayer.js)
| Animation | Frames | Frame Durations | Description |
|-----------|--------|----------------|-------------|
| `recycling_hero_idle_R` | 2 | 800ms each | Standing still |
| `recycling_hero_walk_R` | 2 | 300ms each | Walking |
| `recycling_hero_jump_R` | 2 | 300ms + 400ms | Jumping |
| `recycling_hero_throw_R` | 2 | 150ms + 100ms | Throwing item |
| `recycling_hero_die_R` | 2 | 400ms + 600ms | Death animation |

### Boss Animations (PollutionBoss.js)
| Animation | Frames | Frame Durations | Description |
|-----------|--------|----------------|-------------|
| `pollution_boss_idle_R` | 2 | 800ms each | Idle stance |
| `pollution_boss_walk_R` | 2 | 300ms each | Patrolling |
| `pollution_boss_attack_R` | 2 | 200ms + 300ms | Attacking |
| `pollution_boss_die_R` | 2 | 600ms + 800ms | Defeated |

---

## 🔊 Sound Effects & Music

### Sound Effects
- `collect_item_sound` - Picking up recyclables (🎵 chime)
- `throw_item_sound` - Throwing items (🎵 whoosh)
- `boss_hit_sound` - Boss taking damage (🎵 impact)
- `player_jump` - Jump action (🎵 boing)
- `player_hurt` - Taking damage (🎵 oof)
- `level_complete_sound` - Victory jingle (🎵 fanfare)

### Music
- `city_theme` - World 1 background music (upbeat 8-bit)
- `desert_theme` - World 2 background music (mysterious 8-bit)
- `boss_battle_theme` - Boss fight music (intense 8-bit)
- `title_screen` - Main menu music (catchy 8-bit loop)

---

## 🖥️ UI Scenes

### TitleScreen
- Game logo with animated recyclables
- **Start Game** button
- Background music playing
- Clean, eco-friendly design

### UIScene (HUD Overlay)
- **Health Bar** (top-left, red/green gradient)
- **Recyclables Counter** (top-right, shows current/max: "3/5")
- **Level Display** (top-center, e.g., "World 1-1")
- Always visible during gameplay

### VictoryUIScene
Appears when completing regular levels:
- ✨ "Level Complete!" message
- Stars rating (optional)
- **Next Level** button
- **Restart** button
- Level completion stats

### GameOverUIScene
Appears when player dies:
- 💀 "Game Over" message
- Death cause (optional)
- **Restart Level** button
- **Return to Title** button
- Try again encouragement text

### GameCompleteUIScene
Appears after defeating final boss (5-5):
- 🎉 "Congratulations!" message
- "You saved the environment!" text
- Final score/stats
- **Play Again** button (restart from 1-1)
- **Return to Title** button

---

## 🚀 Development Roadmap

### ✅ Phase 1: Core Worlds (Complete)
- [x] World 1: City (Levels 1-1, 1-2)
- [x] World 2: Desert (Assets created)
- [x] Player mechanics (walk, jump, throw)
- [x] Boss mechanics (patrol, attack, health)
- [x] Level progression system

### 🔄 Phase 2: Expand Worlds (In Progress)
- [ ] Complete World 1 (1-3, 1-4, 1-5 Boss)
- [ ] Complete World 2 (2-1 through 2-5 Boss)
- [ ] Create Factory theme assets (World 3)
- [ ] Create Ocean theme assets (World 4)
- [ ] Create Wasteland theme assets (World 5)

### 📋 Phase 3: Full 25 Levels
- [ ] Build all 25 level maps in Tiled
- [ ] Tune difficulty progression
- [ ] Add unique boss patterns per world
- [ ] Polish animations and effects
- [ ] Test all level transitions

### 🎨 Phase 4: Enhancement
- [ ] Power-ups and special items
- [ ] Score system (points for time, items, kills)
- [ ] High score tracking (save to database)
- [ ] Multiple characters/skins
- [ ] Achievement system
- [ ] Particle effects and polish
- [ ] Controller support

---

## 🛠️ Technical Implementation

### Key Classes

#### RecyclingPlayer.js
```javascript
class RecyclingPlayer extends Phaser.Physics.Arcade.Sprite {
  // Player movement, jumping, throwing
  // Health management
  // Damage and invulnerability
  // Animation state management
}
```

#### PollutionBoss.js
```javascript
class PollutionBoss extends Phaser.Physics.Arcade.Sprite {
  // AI behavior (patrol, chase, attack)
  // Boss health system
  // Attack patterns
  // Death sequence
}
```

#### BaseLevelScene.js
```javascript
class BaseLevelScene extends Phaser.Scene {
  // Base class for all level scenes
  // Common collision setup
  // Camera and physics configuration
  // Player and enemy spawning
}
```

#### Level_X_Y.js
```javascript
class Level_1_1 extends BaseLevelScene {
  // Individual level scenes
  // Load specific tilemap
  // Place enemies and items
  // Set decorations
}
```

---

### File Structure
```
wwwroot/js/hero/
├── main.js                    # Phaser game initialization
├── gameConfig.js              # All game parameters
├── LevelManager.js            # 25-level progression system
│
├── RecyclingPlayer.js         # Player class
├── PollutionBoss.js           # Boss class
├── RecyclableItem.js          # Collectible items
├── ThrownRecyclable.js        # Projectile physics
│
├── BaseLevelScene.js          # Base level template
│
├── TitleScreen.js             # Main menu
├── UIScene.js                 # HUD overlay
├── VictoryUIScene.js          # Level complete
├── GameOverUIScene.js         # Death screen
├── GameCompleteUIScene.js     # Final victory
│
├── Level_1_1.js               # City Level 1
├── Level_1_2.js               # City Level 2
├── Level_1_3.js               # City Level 3
├── Level_1_4.js               # City Level 4
├── Level_1_5_Boss.js          # City Boss
│
├── Level_2_1.js               # Desert Level 1
└── ... (up to Level_5_5_Boss.js)
```

---

## 🎮 Controls

### Keyboard
| Key | Action |
|-----|--------|
| **←** | Move left |
| **→** | Move right |
| **↑** | Jump |
| **D** | Throw recyclable item |
| **Enter** | UI navigation/selection |
| **ESC** | Pause menu (future) |

### Mouse
- Click UI buttons in menus

---

## 🏆 Scoring System (Future Implementation)

- **Recyclables Collected**: +10 points each
- **Boss Defeated**: +500 points
- **Time Bonus**: Up to +200 points (faster = more points)
- **Combo Multipliers**: Consecutive throws without missing
- **Perfect Clear**: No damage taken = +300 points

---

## 💡 Tips for Players

1. 💚 **Collect recyclables** to have ammunition against bosses
2. 📦 Maximum **5 recyclables** can be carried at once
3. 🏃 Use platforms wisely to avoid enemies
4. 👁️ **Boss patterns** can be learned and dodged
5. 🌍 Each world introduces new challenges
6. ⏱️ Take your time - there's no time limit on regular levels
7. 💪 Boss levels require all your collected recyclables

---

## 🔧 Integration with RecycleRank

### Backend Connection
- **Controller**: `Controllers/GameController.cs`
- **Route**: `/Game/Hero`
- **Session Management**: Uses existing cooldown system
- **Score Tracking**: Saves to `RecyclingEvent` model
- **Leaderboard**: Integrates with existing leaderboard

### Database Models Used
- `RecyclingEvent` - Track gameplay sessions
- `User` - Player account
- `BattlePass` - Potential integration

---

## 📝 Credits

- **Game Engine**: Phaser 3.90.0
- **Framework**: ASP.NET Core 8.0
- **Assets**: AI-generated pixel art
- **Music**: AI-generated 8-bit themes
- **Development**: RecycleRank Team
- **Tilemap Editor**: Tiled Map Editor

---

## 📊 Version History

**Version 1.0** - Initial Release
- 5 Worlds × 5 Levels = 25 Total Levels
- Core gameplay mechanics
- Boss battles
- UI/UX complete

---

## 🐛 Known Issues & Future Fixes

- [ ] Add pause menu
- [ ] Mobile/touch controls
- [ ] Save game progress
- [ ] Volume controls
- [ ] Fullscreen toggle

---

## 📞 Support

For issues or questions:
- Check browser console (F12) for errors
- Ensure all assets are loaded
- Verify Phaser 3 CDN is accessible
- Clear browser cache if problems persist

---

**Last Updated**: 2024  
**Total Levels**: 25 (5 Worlds × 5 Levels)  
**Status**: Ready for Implementation 🚀

