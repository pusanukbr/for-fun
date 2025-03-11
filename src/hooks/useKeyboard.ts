import { useGameStore } from '../stores/gameStore';

export function useKeyboard() {
  const gameStore = useGameStore();
  let mounted = false;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!mounted) return;
    
    switch (event.key) {
      case 'ArrowUp':
        gameStore.movePlayer('up');
        break;
      case 'ArrowDown':
        gameStore.movePlayer('down');
        break;
      case 'ArrowLeft':
        gameStore.movePlayer('left');
        break;
      case 'ArrowRight':
        gameStore.movePlayer('right');
        break;
    }
  };

  function setupListeners() {
    mounted = true;
    window.addEventListener('keydown', handleKeyDown);
  }

  function cleanupListeners() {
    mounted = false;
    window.removeEventListener('keydown', handleKeyDown);
  }

  return {
    setupListeners,
    cleanupListeners
  };
} 