// Phaser loaded globally
import { screenSize } from './gameConfig.js'
import { setupLoadingProgressUI } from './utils.js'

export class InitialLoadingScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'InitialLoadingScene'
    })
  }

  preload() {
    // Setup loading progress bar UI
    setupLoadingProgressUI(this)
    
    // Add file complete listener to log what loaded
    this.load.on('filecomplete', (key, type, data) => {
      if (type === 'audio' || type === 'audioSprite') {
        console.log('✅ Audio loaded:', key);
      }
    });
    
    // Add file failed listener
    this.load.on('loaderror', (file) => {
      console.warn('⚠️ Failed to load:', file.key, file.type, file.url);
    });
    
    // Load audio files manually first
    console.log('Loading audio files...');
    this.load.audio('city_theme', '/assets/hero/audio/music/city_theme.wav');
    this.load.audio('desert_theme', '/assets/hero/audio/music/desert_theme.wav');
    this.load.audio('desert_boss_theme', '/assets/hero/audio/music/desert_boss_theme.wav');
    this.load.audio('factory_boss_theme', '/assets/hero/audio/music/factory_boss_theme.wav');
    this.load.audio('ocean_theme', '/assets/hero/audio/music/ocean_theme.wav');
    this.load.audio('ocean_boss_theme', '/assets/hero/audio/music/ocean_boss_theme.wav');
    this.load.audio('wasteland_theme', '/assets/hero/audio/music/wasteland_theme.wav');
    this.load.audio('boss_battle_theme', '/assets/hero/audio/music/boss_battle_theme.wav');
    this.load.audio('final_boss_theme', '/assets/hero/audio/music/final_boss_theme.wav');
    this.load.audio('heaven_choir_theme', '/assets/hero/audio/music/heaven_choir_theme.wav');
    this.load.audio('collect_item_sound', '/assets/hero/audio/sfx/collect_item_sound.mp3');
    this.load.audio('throw_item_sound', '/assets/hero/audio/sfx/throw_item_sound.mp3');
    this.load.audio('boss_hit_sound', '/assets/hero/audio/sfx/boss_hit_sound.mp3');
    this.load.audio('level_complete_sound', '/assets/hero/audio/sfx/level_complete_sound.mp3');
    
    // Load trash tumbleweed sprites manually (local files)
    console.log('Loading trash tumbleweed sprites...');
    this.load.image('trash_tumbleweed_walk_frame1', '/assets/hero/images/enemies/trash_tumbleweed_walk_frame1.png');
    this.load.image('trash_tumbleweed_walk_frame2', '/assets/hero/images/enemies/trash_tumbleweed_walk_frame2.png');
    this.load.image('trash_tumbleweed_die_frame1', '/assets/hero/images/enemies/trash_tumbleweed_die_frame1.png');
    this.load.image('trash_tumbleweed_die_frame2', '/assets/hero/images/enemies/trash_tumbleweed_die_frame2.png');
    
    // Load desert boss sprites manually (local files)
    console.log('Loading desert boss sprites...');
    this.load.image('desert_boss_idle_frame1', '/assets/hero/images/boss/desert_boss_idle_frame1.png');
    this.load.image('desert_boss_idle_frame2', '/assets/hero/images/boss/desert_boss_idle_frame2.png');
    this.load.image('desert_boss_walk_frame1', '/assets/hero/images/boss/desert_boss_walk_frame1.png');
    this.load.image('desert_boss_walk_frame2', '/assets/hero/images/boss/desert_boss_walk_frame2.png');
    this.load.image('desert_boss_attack_frame1', '/assets/hero/images/boss/desert_boss_attack_frame1.png');
    this.load.image('desert_boss_attack_frame2', '/assets/hero/images/boss/desert_boss_attack_frame2.png');
    this.load.image('desert_boss_die_frame1', '/assets/hero/images/boss/desert_boss_die_frame1.png');
    this.load.image('desert_boss_die_frame2', '/assets/hero/images/boss/desert_boss_die_frame2.png');
    
    // Load factory (oil) boss sprite sheet (3x3 grid = 9 frames total, 1260x1206px)
    console.log('Loading factory boss sprite sheet...');
    this.load.spritesheet('factory_boss_sheet', '/assets/hero/images/boss/factory_boss_spritesheet.png', {
      frameWidth: 420,
      frameHeight: 402
    });
    
    // Load ocean (jellyfish) boss sprite sheet (5x5 grid = 25 frames, 1390x1785px)
    console.log('Loading ocean boss sprite sheet...');
    this.load.spritesheet('ocean_boss_sheet', '/assets/hero/images/boss/ocean_boss_spritesheet.png', {
      frameWidth: 278,  // 1390 / 5
      frameHeight: 357  // 1785 / 5
    });
    
    // Load wasteland boss sprite sheet (5x5 grid = 25 frames, 1510x1395px)
    console.log('Loading wasteland boss sprite sheet...');
    this.load.spritesheet('wasteland_boss_sheet', '/assets/hero/images/boss/wasteland_boss_spritesheet.png', {
      frameWidth: 302,  // 1510 / 5
      frameHeight: 279  // 1395 / 5
    });
    
    // Load poison puddle sprite for final boss
    console.log('Loading poison puddle sprite...');
    this.load.image('wasteland_boss_puddle', '/assets/hero/images/boss/wasteland_boss_puddle.png');
    
    // Load boss projectile sprite sheet (5x5 grid = 25 frames, 1235x1655px)
    console.log('Loading boss projectile sprite sheet...');
    this.load.spritesheet('boss_projectile_sheet', '/assets/hero/images/boss/boss_projectile_spritesheet.png', {
      frameWidth: 247,  // 1235 / 5
      frameHeight: 331  // 1655 / 5
    });
    
    // Load player items (optional - will fallback to recyclable if not found)
    console.log('Loading player shield...');
    this.load.image('player_shield', '/assets/hero/images/player/shield.png');
    
    console.log('Loading player sword spritesheet...');
    this.load.spritesheet('player_sword', '/assets/hero/images/player/sword.png', {
      frameWidth: 307,  // 1535 / 5 frames
      frameHeight: 307  // 1535 / 5 frames
    });
    
    console.log('Loading player glider spritesheet...');
    this.load.spritesheet('player_glider', '/assets/hero/images/player/glider.png', {
      frameWidth: 326,  // 1630 / 5 frames
      frameHeight: 225  // 1125 / 5 frames
    });
    
    console.log('Loading double jump cloud spritesheet...');
    this.load.spritesheet('double_jump_cloud', '/assets/hero/images/player/cloud.png', {
      frameWidth: 307,  // Assuming 5x5 grid like sword
      frameHeight: 307  // Assuming 5x5 grid
    });
    
    // Load holy recycling bin sprite sheet (5x5 grid = 25 frames)
    console.log('Loading holy recycling bin...');
    this.load.spritesheet('holy_bin_sheet', '/assets/hero/images/collectibles/holy_recycling_bin.png', {
      frameWidth: 200,  // Adjust based on actual frame size
      frameHeight: 200
    });
    
    // Load asset pack by type (but audio and local sprites will already be loaded above)
    this.load.pack('assetPack', '/assets/hero/asset-pack.json')
  }

  create() {
    // Create simple loading background
    this.cameras.main.setBackgroundColor('#000000')
    
    // Add loading complete prompt
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value
    
    const loadingCompleteText = this.add.text(screenWidth / 2, screenHeight / 2 + 50, 'Loading Complete!', {
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 0.5)

    // Switch to title screen after brief delay
    this.time.delayedCall(1000, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0)
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('TitleScreen')
      })
    })
  }
}
