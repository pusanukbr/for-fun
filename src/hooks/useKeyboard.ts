import { ref } from 'vue';
import { useGameStore } from '../stores/gameStore';

export function useKeyboard() {
  const gameStore = useGameStore();
  let mounted = false;
  const heroState = ref<string>('IDLE_BOTTOM'); // Явно вказуємо тип і початкове значення

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!mounted) return;

    switch (event.key) {
      case 'ArrowUp':
        gameStore.movePlayer('up');
        heroState.value = 'IDLE_TOP';
        break;
      case 'ArrowDown':
        gameStore.movePlayer('down');
        heroState.value = 'IDLE_BOTTOM';
        break;
      case 'ArrowLeft':
        gameStore.movePlayer('left');
        heroState.value = 'IDLE_LEFT';
        break;
      case 'ArrowRight':
        gameStore.movePlayer('right');
        heroState.value = 'IDLE_RIGHT';
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
    cleanupListeners,
    heroState, // Переконуємося, що heroState повертається
  };
}