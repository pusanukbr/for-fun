import { defineStore } from 'pinia';
import type { GameMap } from '../types/game';

export interface Player {
    x: number; // Ізометрична координата X
    y: number; // Ізометрична координата Y
}

export const useGameStore = defineStore('game', {
    state: () => ({
        gameMap: { width: 0, height: 0, tiles: [] } as GameMap,
        player: { x: 0, y: 0 } as Player, // Початкова позиція героя
    }),
    actions: {
        async loadMap() {
            try {
                const response = await fetch('/map.json');
                if (!response.ok) {
                    throw new Error(`Не вдалося завантажити map.json: ${response.status}`);
                }
                const mapData: GameMap = await response.json();
                this.gameMap = mapData;
            } catch (error) {
                console.error('Помилка завантаження карти:', error);
            }
        },
        setMap(newMap: GameMap) {
            this.gameMap = newMap;
        },
        movePlayer(x: number, y: number) {
            // Перевіряємо, чи клітинка в межах карти
            if (x >= 0 && x < this.gameMap.width && y >= 0 && y < this.gameMap.height) {
                this.player.x = x;
                this.player.y = y;
            }
        },
    },
    getters: {
        getTiles: (state) => state.gameMap.tiles,
        getMapSize: (state) => ({
            width: state.gameMap.width,
            height: state.gameMap.height,
        }),
        getPlayerPosition: (state) => state.player,
    },
});