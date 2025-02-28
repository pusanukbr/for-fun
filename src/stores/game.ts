import { defineStore } from 'pinia';
import type { GameMap } from '../types/game';

export const useGameStore = defineStore('game', {
    state: () => ({
        gameMap: { width: 0, height: 0, tiles: [] } as GameMap,
    }),
    actions: {
        async loadMap() {
            const response = await fetch('/map.json');
            const mapData: GameMap = await response.json();
            this.gameMap = mapData;
        },
        setMap(newMap: GameMap) {
            this.gameMap = newMap;
        },
    },
    getters: {
        getTiles: (state) => state.gameMap.tiles,
        getMapSize: (state) => ({
            width: state.gameMap.width,
            height: state.gameMap.height,
        }),
    },
});