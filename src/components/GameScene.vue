<template>
    <!-- Логічний компонент без шаблону -->
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { Application, Sprite, Assets, Graphics } from 'pixi.js';
import { useGameStore } from '../stores/game';
import { toScreenCoords, tileWidth, tileHeight } from '../utils/isoUtils';

const props = defineProps<{ app: Application }>();

const gameStore = useGameStore();
const { app } = props;

let playerSprite: Graphics | null = null;

// Мапа текстур для типів тайлів
const tileTextures: Record<string, string> = {
    grass: '/textures/grass.png',
    stone: '/textures/stone.png',
    water: '/textures/water.png',
};

// Завантаження текстур і рендеринг карти
const renderMap = async () => {
    const { width, height } = gameStore.getMapSize;
    const tiles = gameStore.getTiles;

    // Завантажуємо всі текстури
    await Assets.load(Object.values(tileTextures));

    const offsetX = app.screen.width / 2 - (width * tileWidth) / 4;
    const offsetY = app.screen.height / 2 - (height * tileHeight) / 2;

    // Рендеримо тайли як спрайти
    tiles.forEach((tile) => {
        const texturePath = tileTextures[tile.type] || tileTextures.grass; // Запасний варіант
        const tileSprite = Sprite.from(texturePath);
        const { screenX, screenY } = toScreenCoords(tile.x, tile.y);

        // Розтягуємо спрайт до розміру клітинки
        tileSprite.width = tileWidth;
        tileSprite.height = tileHeight;

        tileSprite.x = screenX + offsetX;
        tileSprite.y = screenY + offsetY;
        tileSprite.anchor.set(0.5); // Центруємо спрайт

        // Додаємо інтерактивність
        tileSprite.eventMode = 'static';
        tileSprite.cursor = 'pointer';
        tileSprite.on('pointerdown', () => {
            gameStore.movePlayer(tile.x, tile.y);
        });

        app.stage.addChild(tileSprite);
    });

    // Рендеримо героя (тимчасово круг, але можна замінити на спрайт)
    playerSprite = new Graphics();
    playerSprite.circle(0, 0, 5).fill({ color: 0xff0000 }); // Помилка: Sprite не має circle, виправимо нижче
    updatePlayerPosition();
    app.stage.addChild(playerSprite);
};

const updatePlayerPosition = () => {
    if (!playerSprite) return;
    const { screenX, screenY } = toScreenCoords(
        gameStore.getPlayerPosition.x,
        gameStore.getPlayerPosition.y
    );
    const offsetX = app.screen.width / 2 - (gameStore.getMapSize.width * tileWidth) / 4;
    const offsetY = app.screen.height / 2 - (gameStore.getMapSize.height * tileHeight) / 2;
    playerSprite.x = screenX + offsetX;
    playerSprite.y = screenY + offsetY;
};

onMounted(async () => {
    await gameStore.loadMap();
    await renderMap();
});

watch(
    () => gameStore.getPlayerPosition,
    () => {
        updatePlayerPosition();
    },
    { deep: true }
);

onUnmounted(() => {
    app.stage.removeChildren();
});
</script>