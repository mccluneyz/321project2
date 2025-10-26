export const screenSize = {
  width: { value: 1152, type: "number", description: "Screen width" },
  height: { value: 768, type: "number", description: "Screen height" }
};

export const debugConfig = {
  debug: { value: false, type: "boolean", description: "Enable debug mode" },
  debugShowBody: { value: false, type: "boolean", description: "Show collision bodies" },
  debugShowStaticBody: { value: false, type: "boolean", description: "Show static collision bodies" },
  debugShowVelocity: { value: false, type: "boolean", description: "Show velocity vectors" }
};

export const renderConfig = {
  pixelArt: { value: true, type: "boolean", description: "Enable pixel art rendering" }
};

export const playerConfig = {
  walkSpeed: { value: 350, type: "number", description: "Player walk speed" },
  jumpPower: { value: 800, type: "number", description: "Player jump power" },
  gravityY: { value: 1500, type: "number", description: "Player gravity" },
  maxHealth: { value: 100, type: "number", description: "Player maximum health" },
  hurtingDuration: { value: 100, type: "number", description: "Hurt stun duration (milliseconds)" },
  invulnerableTime: { value: 2000, type: "number", description: "Invulnerability time (milliseconds)" },
  maxRecyclables: { value: 5, type: "number", description: "Maximum recyclables player can carry" }
};

export const bossConfig = {
  walkSpeed: { value: 100, type: "number", description: "Boss walk speed" },
  maxHealth: { value: 200, type: "number", description: "Boss maximum health" },
  attackCooldown: { value: 3000, type: "number", description: "Boss attack cooldown (milliseconds)" },
  patrolDistance: { value: 300, type: "number", description: "Boss patrol distance" },
  detectionRange: { value: 400, type: "number", description: "Boss detection range" }
};

