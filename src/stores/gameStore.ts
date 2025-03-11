import { defineStore } from 'pinia'

interface Position {
  x: number
  y: number
}

export const useGameStore = defineStore('game', {
  state: () => ({
    playerPosition: { x: 0, y: 0 } as Position
  }),
  
  actions: {
    movePlayer(direction: 'up' | 'down' | 'left' | 'right') {
      const step = 32
      switch (direction) {
        case 'up': this.playerPosition.y -= step; break
        case 'down': this.playerPosition.y += step; break
        case 'left': this.playerPosition.x -= step; break
        case 'right': this.playerPosition.x += step; break
      }
    },
    
    initWorld(width: number, height: number) {
      this.playerPosition = { x: width * 16, y: height * 16 }
    }
  }
}) 