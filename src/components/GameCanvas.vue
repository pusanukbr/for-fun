<template>
    <div ref="gameContainer" class="game-container">
        <GameScene v-if="isAppReady" :app="app" />
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Application } from 'pixi.js';
import GameScene from './GameScene.vue';

// Реактивна змінна для контейнера
const gameContainer = ref<HTMLElement | null>(null);

// Змінна для додатку Pixi.js
const app = new Application();
const isAppReady = ref(false);

const initGame = async () => {
    await app.init({
        width: 800,
        height: 600,
        backgroundColor: 0x1099bb,
    });

    if (gameContainer.value) {
        gameContainer.value.appendChild(app.canvas);
    }

    isAppReady.value = true; // Позначаємо, що app готовий
};

const cleanupGame = () => {
    app.destroy(true);
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