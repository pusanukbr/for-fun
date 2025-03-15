<template>
  <div ref="gameContainer" class="game-container"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { Application, Container, Graphics, Sprite } from 'pixi.js';
import { useGameStore } from '../stores/gameStore';
import { useKeyboard } from '../hooks/useKeyboard';
import { TILE_SIZE, WORLD_WIDTH, WORLD_HEIGHT } from '../config/constants';
import '@pixi/devtools';

import { useTileSet } from "../hooks/useTile.ts";
import { useLevel } from '../hooks/useLevel';

interface KeyboardControls {
    setupListeners: () => void;
    cleanupListeners: () => void;
}

const { loadTileSet, createTileSprite } = useTileSet();
const { loadLevel, createLevelSprites } = useLevel();
const gameContainer = ref<HTMLDivElement | null>(null);
const gameStore = useGameStore();

const app = ref<Application | null>(null);
const worldContainer = ref<Container | null>(null);
const playerSprite = ref<Sprite | null>(null);
const keyboardControls = ref<KeyboardControls | null>(null);

// 🎮 Основна ініціалізація
async function initGame() {
    if (!gameContainer.value) return;

    app.value = new Application();
    await app.value.init({
        background: '#1099bb',
        resizeTo: window,
        antialias: false
    });

    gameContainer.value.appendChild(app.value.canvas);

    // Створюємо контейнер світу
    worldContainer.value = new Container();
    worldContainer.value.label = "World";
    app.value.stage.addChild(worldContainer.value as Container);

    // Ініціалізація світу
    gameStore.initWorld(WORLD_WIDTH, WORLD_HEIGHT);
    await createWorld();
    await createPlayer();

    // Стартуємо гру
    app.value.ticker.add(gameLoop);

    // Клавіатура
    const controls = useKeyboard();
    controls.setupListeners();
    keyboardControls.value = controls;
}

// 💡 Створення світу
async function createWorld() {
    if (!worldContainer.value) return;

    await loadLevel('level1');

    createLevelSprites(worldContainer.value as Container);
}

// 💡 Створення гравця (додаємо на stage окремо)
async function createPlayer() {
    if (!app.value) return;

    await loadTileSet();

    const tileSprite = createTileSprite('hero', 0, 0, 0, 0);
    tileSprite.anchor.set(1); // Центрований спрайт
    tileSprite.label = "Hero";

    playerSprite.value = tileSprite;
    playerSprite.value.zIndex = 10;

    // Ставимо героя в центр екрана
    tileSprite.x = app.value.screen.width / 2;
    tileSprite.y = app.value.screen.height / 2;

    app.value.stage.addChild(tileSprite);
}

// 🎮 Оновлення позиції (рухаємо світ навколо героя)
function updatePlayerPosition() {
    if (!worldContainer.value || !app.value) return;

    const { x, y } = gameStore.playerPosition;

    // Зміщуємо світ у зворотному напрямку, щоб герой залишався в центрі
    worldContainer.value.x = app.value.screen.width / 2 - x;
    worldContainer.value.y = app.value.screen.height / 2 - y;
}

// 🔁 Ігровий цикл
function gameLoop() {
    updatePlayerPosition();
}

// 🧹 Очищення гри
function destroyGame() {
    console.log('🔥 Destroying game...');

    if (keyboardControls.value) {
        keyboardControls.value.cleanupListeners();
        keyboardControls.value = null;
    }

    if (app.value?.ticker) {
        app.value.ticker.remove(gameLoop);
    }

    if (app.value) {
        app.value.destroy(true, { children: true });
        app.value = null;
    }

    worldContainer.value = null;
    playerSprite.value = null;
}

// ⛰️ Mount / Unmount
onMounted(() => {
    initGame().catch(err => {
        console.error('Error initializing game:', err);
    });
});

onUnmounted(() => {
    destroyGame();
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