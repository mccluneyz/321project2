// Level Manager for 25-level structure (1-1 to 5-5)
export class LevelManager {
  // Define all 25 levels in order
  static LEVEL_ORDER = [
    // World 1: City (Levels 1-1 to 1-5)
    'Level_1_1',
    'Level_1_2',
    'Level_1_3',
    'Level_1_4',
    'Level_1_5_Boss', // Boss level

    // World 2: Desert (Levels 2-1 to 2-5)
    'Level_2_1',
    'Level_2_2',
    'Level_2_3',
    'Level_2_4',
    'Level_2_5_Boss', // Boss level

    // World 3: Factory (Levels 3-1 to 3-5)
    'Level_3_1',
    'Level_3_2',
    'Level_3_3',
    'Level_3_4',
    'Level_3_5_Boss', // Boss level

    // World 4: Ocean (Levels 4-1 to 4-5)
    'Level_4_1',
    'Level_4_2',
    'Level_4_3',
    'Level_4_4',
    'Level_4_5_Boss', // Boss level

    // World 5: Wasteland (Levels 5-1 to 5-5)
    'Level_5_1',
    'Level_5_2',
    'Level_5_3',
    'Level_5_4',
    'Level_5_5_Boss', // Final Boss
  ];

  // Get the next level after current level
  static getNextLevel(currentLevelKey) {
    const currentIndex = this.LEVEL_ORDER.indexOf(currentLevelKey);
    if (currentIndex === -1 || currentIndex === this.LEVEL_ORDER.length - 1) {
      return null; // No next level
    }
    return this.LEVEL_ORDER[currentIndex + 1];
  }

  // Check if current level is the last level
  static isLastLevel(currentLevelKey) {
    return currentLevelKey === this.LEVEL_ORDER[this.LEVEL_ORDER.length - 1];
  }

  // Check if current level is a boss level
  static isBossLevel(currentLevelKey) {
    return currentLevelKey.includes('Boss');
  }

  // Get world number from level key
  static getWorld(currentLevelKey) {
    const match = currentLevelKey.match(/Level_(\d+)_/);
    return match ? parseInt(match[1]) : 1;
  }

  // Get level number within world from level key
  static getLevelInWorld(currentLevelKey) {
    const match = currentLevelKey.match(/Level_\d+_(\d+)/);
    return match ? parseInt(match[1]) : 1;
  }

  // Get display name for level (e.g., "1-1", "1-5 Boss")
  static getDisplayName(currentLevelKey) {
    const world = this.getWorld(currentLevelKey);
    const level = this.getLevelInWorld(currentLevelKey);
    const isBoss = this.isBossLevel(currentLevelKey);
    return `${world}-${level}${isBoss ? ' (Boss)' : ''}`;
  }

  // Get world theme based on world number
  static getWorldTheme(worldNumber) {
    const themes = {
      1: { name: 'City', background: 'city_background', music: 'city_theme', tileset: 'city_ground' },
      2: { name: 'Desert', background: 'desert_background', music: 'desert_theme', tileset: 'desert_ground' },
      3: { name: 'Factory', background: 'city_background', music: 'city_theme', tileset: 'city_ground' }, // Will create later
      4: { name: 'Ocean', background: 'city_background', music: 'city_theme', tileset: 'city_ground' }, // Will create later
      5: { name: 'Wasteland', background: 'desert_background', music: 'desert_theme', tileset: 'desert_ground' }, // Will create later
    };
    return themes[worldNumber] || themes[1];
  }
}
