# Assets Folder Structure

This folder contains all game assets for Recycle Run.

## 📁 Folder Structure

### `/models` - 3D Models
Put your 3D model files here (.glb, .fbx, .obj, .gltf)

**Examples:**
- `player.glb` - Player character model
- `enemy_bug.glb` - Bug enemy model
- `enemy_slug.glb` - Slug enemy model
- `boss_vine.glb` - Boss models
- `platform.glb` - Platform pieces
- `tree.glb` - Environment objects
- `recycling_bin.glb` - Collectibles/props

**Recommended format:** `.glb` (compressed GLTF, works best with Three.js/web)

---

### `/textures` - Images & Materials
Put texture images here (.png, .jpg, .webp)

**Examples:**
- `grass.jpg` - Grass texture
- `dirt.png` - Ground texture
- `metal.png` - Metal surfaces
- `wood.jpg` - Wooden platforms
- `player_skin.png` - Character textures
- `skybox.png` - Sky/background images

**Recommended format:** `.png` (for transparency), `.jpg` (for photos/backgrounds)

---

### `/audio` - Sound Effects & Music
Put audio files here (.mp3, .ogg, .wav)

**Examples:**
- `jump.mp3` - Jump sound
- `collect.mp3` - Pickup sound
- `hit.mp3` - Damage sound
- `music_forest.mp3` - Background music
- `boss_roar.ogg` - Boss sounds

**Recommended format:** `.mp3` (best browser support)

---

### `/sprites` - 2D Images & UI
Put 2D sprite images here (.png, .svg)

**Examples:**
- `heart_icon.png` - Health UI
- `coin.png` - Collectible sprites
- `button_play.png` - UI buttons
- `particle_dust.png` - Particle effects
- `logo.svg` - Game logo

**Recommended format:** `.png` (with transparency)

---

## 🔗 How to Use in Code

### Three.js (3D Models):
```javascript
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('/assets/models/player.glb', (gltf) => {
    scene.add(gltf.scene);
});
```

### Textures:
```javascript
const textureLoader = new THREE.TextureLoader();
const grassTexture = textureLoader.load('/assets/textures/grass.jpg');
```

### Audio:
```javascript
const audio = new Audio('/assets/audio/jump.mp3');
audio.play();
```

### Sprites/Images:
```html
<img src="~/assets/sprites/heart_icon.png" alt="Health" />
```

Or in JavaScript:
```javascript
const img = new Image();
img.src = '/assets/sprites/coin.png';
```

---

## 📦 File Size Recommendations

- **Models:** Keep under 1MB each (optimize in Blender)
- **Textures:** Max 2048x2048 pixels, compress to ~200KB
- **Audio:** Compress to 128kbps MP3, under 500KB per file
- **Sprites:** Max 512x512 pixels, compress PNGs

---

## 🔧 Tools for Creating Assets

### 3D Models:
- **Blender** (free) - Create/edit 3D models
- **Sketchfab** - Download free models
- **Mixamo** - Free character animations

### Textures:
- **Photopea** (free, web-based) - Edit images
- **Poly Haven** - Free high-quality textures

### Audio:
- **Audacity** (free) - Edit audio
- **Freesound.org** - Free sound effects
- **Incompetech** - Free music

### Sprites:
- **Piskel** (free, web-based) - Pixel art
- **Aseprite** (paid) - Professional pixel art

---

## ⚠️ Important Notes

1. **File Names:** Use lowercase, no spaces (use underscores or hyphens)
   - ✅ `player_model.glb`
   - ❌ `Player Model.glb`

2. **Copyright:** Only use assets you have rights to use
   - Create your own
   - Use assets with permissive licenses (CC0, MIT)
   - Purchase from asset stores

3. **Git:** Large files (>5MB) should use Git LFS or be excluded from version control

4. **Performance:** Test on low-end devices, optimize if FPS drops

---

## 📚 Learning Resources

- [Three.js Docs](https://threejs.org/docs/)
- [Blender Tutorials](https://www.blender.org/support/tutorials/)
- [Web Game Dev Guide](https://developer.mozilla.org/en-US/docs/Games)

