import { defineStore } from 'pinia';
import {TILE_SIZE} from "../config/constants.ts";

interface Position {
  x: number;
  y: number;
}

export const useGameStore = defineStore('game', {
  state: () => ({
    playerPosition: { x: 0, y: 0 } as Position,
  }),

  actions: {
    movePlayer(direction: 'up' | 'down' | 'left' | 'right') {
      const step = TILE_SIZE;
      this.$patch((state) => {
        state.playerPosition = {
          ...state.playerPosition,
          ...(function () {
            switch (direction) {
              case 'up': return { y: state.playerPosition.y - step };
              case 'down': return { y: state.playerPosition.y + step };
              case 'left': return { x: state.playerPosition.x - step };
              case 'right': return { x: state.playerPosition.x + step };
              default: return {};
            }
          })(),
        };
      });
    },

    initWorld() {
      this.playerPosition = { x: 10 * TILE_SIZE, y: 10 * TILE_SIZE };
    },
  },
});