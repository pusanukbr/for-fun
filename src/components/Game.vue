<template>
    <div ref="gameContainer" class="game-container"></div>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue';
import {Application, Container, Sprite, Ticker} from 'pixi.js';
import { useGameStore } from '../stores/gameStore';
import { useKeyboard } from '../hooks/useKeyboard';
import {TILE_SIZE} from '../config/constants';
import '@pixi/devtools';

import { useTileSet } from '../hooks/useTile'; // Оновлений шлях до useTile
import { useLevel } from '../hooks/useLevel';

interface KeyboardControls {
    setupListeners: () => void;
    cleanupListeners: () => void;
}

const { loadTileSet, getAnimatedTexture } = useTileSet();
const { loadLevel, createLevelSprites } = useLevel();
const gameContainer = ref<HTMLDivElement | null>(null);
const gameStore = useGameStore();

const app = ref<Application | null>(null);
const worldContainer = ref<Container | null>(null);
const playerSprite = ref<Sprite | null>(null);
const keyboardControls = ref<KeyboardControls | null>(null);

// Стан анімації героя
// const heroState = ref('IDLE_BOTTOM'); // Поточний стан героя
const currentFrame = ref(0);   // Поточний кадр анімації
let frameTime = 0;             // Час, що минув для поточного кадру
let frameDuration = 0.2;       // Тривалість кадру за замовчуванням (буде оновлено)
const { heroState } = useKeyboard();
let animationHeroTickHandler: ((ticker: Ticker) => void) | null = null;

// 🎮 Основна ініціалізація
async function initGame() {
    if (!gameContainer.value) return;

    app.value = new Application();
    await app.value.init({
        background: '#1099bb',
        resizeTo: window,
        antialias: false,
    });

    gameContainer.value.appendChild(app.value.canvas);

    // Створюємо контейнер світу
    worldContainer.value = new Container();
    worldContainer.value.label = 'World';
    app.value.stage.addChild(worldContainer.value as Container);

    // Ініціалізація світу
    gameStore.initWorld();
    await createWorld();

    // Клавіатура
    const controls = useKeyboard();

    controls.setupListeners();
    keyboardControls.value = controls;

    await createPlayer();

    // Стартуємо гру
    app.value.ticker.add(gameLoop);
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

    const heroTexture = getAnimatedTexture('hero', heroState.value, currentFrame.value);

    const tileSprite = new Sprite(heroTexture);
    tileSprite.anchor.set(1);
    tileSprite.label = 'Hero';
    tileSprite.width = TILE_SIZE;
    tileSprite.height = TILE_SIZE;
    tileSprite.zIndex = 10;

    playerSprite.value = tileSprite;

    // Ставимо героя в центр екрана
    tileSprite.x = app.value.screen.width / 2;
    tileSprite.y = app.value.screen.height / 2;

    app.value.stage.addChild(tileSprite);

    // Запускаємо анімацію
    startAnimation();
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

// 🔄 Анімація героя
function startAnimation() {
    if (!app.value) return;

    animationHeroTickHandler = (ticker: Ticker) => {
        if (!playerSprite.value || !keyboardControls.value) return;

        const heroConfig = useTileSet().mapping.hero;
        const currentState = heroState.value;
        if (heroConfig.animations && heroConfig.animations[currentState]) {
            frameDuration = heroConfig.animations[currentState].frameDuration;
        } else {
            console.warn(`Анімація для стану ${currentState} не знайдена. Використовується IDLE.`);
            frameDuration = heroConfig.animations?.IDLE?.frameDuration || 0.2;
        }

        frameTime += ticker.deltaTime / 60;
        if (frameTime >= frameDuration) {
            frameTime = 0;
            currentFrame.value++;
            const frameCount = heroConfig.animations![currentState].frameCount;
            if (currentFrame.value >= frameCount) {
                currentFrame.value = 0;
            }

            playerSprite.value.texture = getAnimatedTexture('hero', currentState, currentFrame.value);
        }
    };

    app.value.ticker.add(animationHeroTickHandler);
}

// 🧹 Очищення гри
function destroyGame() {
    console.log('🔥 Destroying game...');

    if (keyboardControls.value) {
        keyboardControls.value.cleanupListeners();
        keyboardControls.value = null;
    }

    if (animationHeroTickHandler && app.value?.ticker) {
        app.value.ticker.remove(gameLoop);
        app.value.ticker.remove(animationHeroTickHandler); // Прибираємо анімацію
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
    initGame().catch((err) => {
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