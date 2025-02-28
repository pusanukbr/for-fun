<template>
    <div ref="gameContainer" class="game-container"></div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Application, Graphics } from 'pixi.js';

// Реактивна змінна для контейнера
const gameContainer = ref<HTMLElement | null>(null);

// Змінна для додатку Pixi.js
let app: Application | null = null;

// Розміри клітинки
const tileWidth = 64; // Ширина ромба
const tileHeight = 32; // Висота ромба

// Розмір сітки
const gridWidth = 4;
const gridHeight = 4;

// Перетворення ізометричних координат у екранні
const toScreenCoords = (x: number, y: number) => {
    const screenX = (x - y) * (tileWidth / 2);
    const screenY = (x + y) * (tileHeight / 2);
    return { screenX, screenY };
};

// Ініціалізація гри
const initGame = async () => {
    app = new Application();

    await app.init({
        width: 800,
        height: 600,
        backgroundColor: 0x1099bb,
    });

    if (gameContainer.value) {
        gameContainer.value.appendChild(app.canvas);
    }

    // Зміщення для центрування сітки
    const offsetX = app.screen.width / 2 - (gridWidth * tileWidth) / 4;
    const offsetY = app.screen.height / 2 - (gridHeight * tileHeight) / 2;

    // Малюємо ізометричну сітку
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const tile = new Graphics();

            // Визначаємо координати ромба
            const { screenX, screenY } = toScreenCoords(x, y);

            // Малюємо ромб із заливкою та обводкою
            tile
                .moveTo(screenX, screenY - tileHeight / 2) // Верх
                .lineTo(screenX + tileWidth / 2, screenY) // Право
                .lineTo(screenX, screenY + tileHeight / 2) // Низ
                .lineTo(screenX - tileWidth / 2, screenY) // Ліво
                .closePath()
                .fill({ color: 0xaaaaaa }) // Сіра заливка
                .stroke({ width: 1, color: 0xffffff }); // Біла обводка

            // Зміщуємо клітинку
            tile.x += offsetX;
            tile.y += offsetY;

            app.stage.addChild(tile);
        }
    }
};

// Очищення при розмонтуванні
const cleanupGame = () => {
    if (app) {
        app.destroy(true);
        app = null;
    }
};

onMounted(async () => {
    await initGame();
});

onUnmounted(() => {
    cleanupGame();
});
</script>

<style scoped>
.game-container {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>