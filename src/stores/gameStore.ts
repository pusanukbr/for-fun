import { defineStore } from 'pinia';

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
      const step = 32;
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

    initWorld(width: number, height: number) {
      this.playerPosition = { x: width * 16, y: height * 16 };
    },
  },
});