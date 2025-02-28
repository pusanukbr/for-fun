<template>
    <!-- Логічний компонент без шаблону -->
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { Application, Graphics, Sprite } from 'pixi.js';
import { useGameStore } from '../stores/game';
import { toScreenCoords, tileWidth, tileHeight } from '../utils/isoUtils';

const props = defineProps<{ app: Application }>();

const gameStore = useGameStore();
const { app } = props;

let playerSprite: Sprite | Graphics | null = null;

const renderMap = () => {
    const { width, height } = gameStore.getMapSize;
    const tiles = gameStore.getTiles;

    const offsetX = app.screen.width / 2 - (width * tileWidth) / 4;
    const offsetY = app.screen.height / 2 - (height * tileHeight) / 2;

    // Рендеримо тайли
    tiles.forEach((tile) => {
        const tileGraphic = new Graphics();
        const { screenX, screenY } = toScreenCoords(tile.x, tile.y);

        let fillColor: number;
        switch (tile.type) {
            case 'grass':
                fillColor = 0x00ff00;
                break;
            case 'stone':
                fillColor = 0x666666;
                break;
            case 'water':
                fillColor = 0x0000ff;
                break;
            default:
                fillColor = 0xaaaaaa;
        }

        tileGraphic
            .moveTo(screenX, screenY - tileHeight / 2)
            .lineTo(screenX + tileWidth / 2, screenY)
            .lineTo(screenX, screenY + tileHeight / 2)
            .lineTo(screenX - tileWidth / 2, screenY)
            .closePath()
            .fill({ color: fillColor })
            .stroke({ width: 1, color: 0xffffff });

        tileGraphic.x += offsetX;
        tileGraphic.y += offsetY;

        // Додаємо інтерактивність
        tileGraphic.eventMode = 'static'; // Замість interactive у v8
        tileGraphic.cursor = 'pointer';
        tileGraphic.on('pointerdown', () => {
            gameStore.movePlayer(tile.x, tile.y);
        });

        app.stage.addChild(tileGraphic);
    });

    // Рендеримо героя (для тесту — червоний круг)
    playerSprite = new Graphics();
    playerSprite.circle(0, 0, 10).fill({ color: 0xff0000 });
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
    renderMap();
});

// Слідкуємо за зміною позиції героя
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