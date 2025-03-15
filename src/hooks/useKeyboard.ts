import { ref } from 'vue';
import { useGameStore } from '../stores/gameStore';

export function useKeyboard() {
  const gameStore = useGameStore();
  let mounted = false;
  const heroState = ref<string>('IDLE'); // Явно вказуємо тип і початкове значення
  const isMoving = ref(false);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!mounted) return;

    if (!isMoving.value && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      heroState.value = 'RUN';
      console.log('RUN', heroState.value)
      isMoving.value = true;
    }

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

  const handleKeyUp = (event: KeyboardEvent) => {
    if (!mounted) return;

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      isMoving.value = false;
      heroState.value = 'IDLE';
    }
  };

  function setupListeners() {
    mounted = true;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  }

  function cleanupListeners() {
    mounted = false;
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  }

  return {
    setupListeners,
    cleanupListeners,
    heroState, // Переконуємося, що heroState повертається
  };
}