<template>
    <div id="app">
        <h1>Моя ізометрична гра</h1>
        <GameCanvas />
    </div>
</template>

<script lang="ts" setup>
import GameCanvas from './components/GameCanvas.vue';
</script>

<style>
#app {
    text-align: center;
    font-family: Arial, sans-serif;
}
</style>