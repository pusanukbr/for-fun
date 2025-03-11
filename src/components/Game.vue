<template>
  <div ref="gameContainer" class="game-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue';
import { 
  Application, 
  Container, 
  Graphics
} from 'pixi.js';
import { useGameStore } from '../stores/gameStore';
import { useKeyboard } from '../hooks/useKeyboard';
import { TILE_SIZE, WORLD_WIDTH, WORLD_HEIGHT } from '../config/constants';

interface KeyboardControls {
  setupListeners: () => void;
  cleanupListeners: () => void;
}

const gameContainer = ref<HTMLDivElement | null>(null);
const gameStore = useGameStore();
const app = ref<Application | null>(null);
const worldContainer = ref<Container | null>(null);
const playerSprite = ref<Graphics | null>(null);
const keyboardControls = ref<KeyboardControls | null>(null);

// Ініціалізація гри
onMounted(async () => {
  try {
    if (!gameContainer.value) return;

    // Створюємо додаток
    app.value = new Application();

    // Ініціалізуємо додаток з параметрами
    await app.value.init({
      background: '#1099bb',
      resizeTo: window,
      antialias: false
    });

    // Додаємо canvas до DOM
    gameContainer.value.appendChild(app.value.canvas);
    
    // Створюємо контейнер для світу
    worldContainer.value = new Container();
    app.value.stage.addChild(worldContainer.value as Container);
    
    // Ініціалізуємо світ
    gameStore.initWorld(WORLD_WIDTH, WORLD_HEIGHT);
    
    // Створюємо базовий світ
    createWorld();
    
    // Створюємо гравця
    createPlayer();
    
    // Запускаємо ігровий цикл
    app.value.ticker.add(gameLoop);

    // Ініціалізуємо керування
    const controls = useKeyboard();
    controls.setupListeners();
    keyboardControls.value = controls;
    
  } catch (error) {
    console.error('Error initializing game:', error);
  }
});

// Створення світу
function createWorld() {
  if (!worldContainer.value) return;

  const grid = new Graphics()
    .setStrokeStyle({
      width: 1,
      color: 0x333333,
      alpha: 0.3
    });
  
  for (let y = 0; y < WORLD_HEIGHT; y++) {
    for (let x = 0; x < WORLD_WIDTH; x++) {
      // Малюємо клітинку
      grid.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      
      // Створюємо тайл підлоги
      const tile = new Graphics()
        .setFillStyle({ color: 0x808080 })
        .rect(0, 0, TILE_SIZE, TILE_SIZE)
        .fill();
      
      tile.x = x * TILE_SIZE;
      tile.y = y * TILE_SIZE;
      worldContainer.value.addChild(tile);
    }
  }
  
  grid.stroke();
  worldContainer.value.addChild(grid);
}

// Створення гравця
function createPlayer() {
  if (!worldContainer.value) return;

  const player = new Graphics()
    .setFillStyle({ color: 0x00FF00 })
    .rect(-TILE_SIZE/2, -TILE_SIZE/2, TILE_SIZE, TILE_SIZE)
    .fill();
  
  playerSprite.value = player;
  worldContainer.value.addChild(player);
  
  updatePlayerPosition();
}

// Оновлення позиції гравця
function updatePlayerPosition() {
  if (!playerSprite.value || !worldContainer.value || !app.value) return;
  
  const { x, y } = gameStore.playerPosition;
  playerSprite.value.x = x;
  playerSprite.value.y = y;
  
  // Центруємо камеру на гравці
  worldContainer.value.x = app.value.screen.width / 2 - x;
  worldContainer.value.y = app.value.screen.height / 2 - y;
}

// Ігровий цикл
function gameLoop() {
  updatePlayerPosition();
}

// Очищення при знищенні компонента
onUnmounted(() => {
  if (keyboardControls.value) {
    keyboardControls.value.cleanupListeners();
  }
  
  if (app.value) {
    app.value.ticker.destroy();
    app.value.destroy(true, { children: true });
  }
});
</script>

<style>
/* Видаляємо всі відступи та смуги прокрутки */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Забезпечуємо, щоб canvas займав весь екран */
.game-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Забезпечуємо, щоб canvas правильно масштабувався */
canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style> 