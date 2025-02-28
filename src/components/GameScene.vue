<template>
    <!-- Логічний компонент без шаблону -->
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue';
import { Application, Graphics } from 'pixi.js';
import { useGameStore } from '../stores/game';
import { toScreenCoords, tileWidth, tileHeight } from '../utils/isoUtils';

const props = defineProps<{
    app: Application;
}>();

const gameStore = useGameStore();
const { app } = props;


const renderMap = () => {
    const { width, height } = gameStore.getMapSize;
    const tiles = gameStore.getTiles;

    const offsetX = app.screen.width / 2 - (width * tileWidth) / 4;
    const offsetY = app.screen.height / 2 - (height * tileHeight) / 2;

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

        app.stage.addChild(tileGraphic);
    });
};

onMounted(async () => {
    await gameStore.loadMap(); // Завантажуємо карту
    renderMap(); // Рендеримо після завантаження
});

onUnmounted(() => {
    app.stage.removeChildren();
});
</script>