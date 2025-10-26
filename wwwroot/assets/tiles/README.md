# Tile Assets Guide

Put your tile images here, organized by biome.

## 📁 File Naming Convention

Use consistent names so the game can load them automatically:

### **Ground/Platform Tiles:**
- `ground_grass.png` - Basic grass ground
- `ground_dirt.png` - Dirt platform
- `ground_stone.png` - Stone platform
- `ground_left.png` - Left edge of platform
- `ground_right.png` - Right edge of platform
- `ground_middle.png` - Middle section (repeating)
- `ground_single.png` - Single tile platform

### **Decoration Tiles:**
- `tree_large.png` - Large tree
- `tree_small.png` - Small tree
- `bush_01.png` - Bush variant 1
- `rock_01.png` - Rock variant 1
- `flower_01.png` - Flower sprite

### **Hazard Tiles:**
- `spike.png` - Spike hazard
- `saw.png` - Saw blade
- `fire.png` - Fire hazard

### **Interactive Tiles:**
- `coin.png` - Collectible coin/token
- `checkpoint_flag.png` - Level end flag
- `spring.png` - Jump pad

### **Background Tiles:**
- `cloud_01.png` - Cloud sprite
- `mountain_far.png` - Distant mountain
- `hill_mid.png` - Mid-ground hill

---

## 📏 **Recommended Tile Size**

**16x16 pixels** - Standard retro style  
OR  
**32x32 pixels** - Larger, more detailed  

**Current game uses:** 16px tiles scaled 3x = 48px on screen

---

## 🎨 **Example Forest Tileset Layout:**

```
wwwroot/assets/tiles/forest/
├── ground_left.png       (16x16)
├── ground_middle.png     (16x16)
├── ground_right.png      (16x16)
├── ground_single.png     (16x16)
├── grass_top.png         (16x16)
├── dirt_fill.png         (16x16)
├── tree_oak.png          (32x48 - taller)
├── tree_pine.png         (32x48)
├── bush_green.png        (16x16)
├── rock_small.png        (16x16)
├── mushroom_red.png      (16x16)
├── flower_white.png      (8x8 - small)
└── spike_ground.png      (16x16)
```

---

## 🔧 **How to Use in Game:**

The game will automatically load tiles based on the current biome.

### **In JavaScript:**
```javascript
// Load tileset for current biome
const tileManager = new TileManager('forest');
await tileManager.loadTiles();

// Draw a tile at world position
tileManager.drawTile(ctx, 'ground_grass', x, y);
```

### **Tilemap Example:**
```javascript
// Define level as a 2D array of tile names
const level = [
  ['', '', '', '', 'tree_oak', '', ''],
  ['', '', '', '', '', '', ''],
  ['ground_left', 'ground_middle', 'ground_middle', 'ground_right', '', '', ''],
];

// Render the tilemap
level.forEach((row, y) => {
  row.forEach((tileName, x) => {
    if (tileName) {
      tileManager.drawTile(ctx, tileName, x * 16, y * 16);
    }
  });
});
```

---

## 🌲 **Biome-Specific Tiles:**

### **Forest:**
- Green grass, brown dirt
- Oak/pine trees, bushes
- Wooden platforms
- Mushrooms, flowers

### **Desert:**
- Sand, sandstone
- Cacti, dead trees
- Rocky platforms
- Tumbleweeds

### **Cave:**
- Stone, crystal formations
- Stalactites, stalagmites
- Dark rock platforms
- Glowing mushrooms

### **City:**
- Concrete, metal
- Buildings, pipes
- Industrial platforms
- Neon signs

### **Wasteland:**
- Toxic sludge, rust
- Dead vegetation
- Broken machinery
- Hazardous barrels

---

## 🎨 **Creating Tiles:**

### **Tools:**
- **Aseprite** ($20) - Best for pixel art
- **Piskel** (Free, web) - Simple pixel editor
- **GIMP** (Free) - General image editing

### **Tips:**
1. Keep consistent pixel size (16x16 or 32x32)
2. Use limited color palette (8-16 colors per biome)
3. Add slight texture variation to avoid repetition
4. Use transparency for non-square objects
5. Test in-game at 3x scale (48px or 96px)

### **Example Palette (Forest):**
- Grass: `#4CAF50`, `#66BB6A`
- Dirt: `#795548`, `#8D6E63`
- Tree trunk: `#5D4037`, `#6D4C41`
- Leaves: `#2E7D32`, `#388E3C`

---

## 📦 **Free Tileset Resources:**

- [OpenGameArt.org](https://opengameart.org)
- [Itch.io Free Assets](https://itch.io/game-assets/free)
- [Kenney.nl](https://kenney.nl/assets) - CC0 (public domain)

---

## 📥 **How to Add Your Tiles:**

1. Put your `.png` files in the appropriate biome folder:
   ```
   wwwroot/assets/tiles/forest/ground_grass.png
   ```

2. Name them according to the convention above

3. Refresh the game - tiles will load automatically!

4. If tiles don't appear, check browser console (F12) for errors

