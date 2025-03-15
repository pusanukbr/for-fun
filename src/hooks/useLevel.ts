import { ref } from 'vue';
import type { Level, LevelData } from '../types/level';
import { TILE_MAPPING } from '../types/level';
import { useTileSet } from './useTile';
import { Container } from 'pixi.js';

export const useLevel = () => {
    const currentLevel = ref<Level | null>(null);
    const { loadTileSet, createTileSprite } = useTileSet();

    const loadLevel = async (levelId: string) => {
        try {
            // Завантажуємо дані рівня
            const response = await fetch('/src/data/levels.json');
            const data: LevelData = await response.json();
            
            // Знаходимо потрібний рівень
            const level = data.levels.find(l => l.id === levelId);
            if (!level) {
                throw new Error(`Рівень з ID ${levelId} не знайдено`);
            }
            
            // Завантажуємо тайлсет
            await loadTileSet();

            currentLevel.value = level;
            return level;
        } catch (error) {
            console.error('Помилка завантаження рівня:', error);
            throw error;
        }
    };

    const createLevelSprites = (container: Container) => {
        if (!currentLevel.value) return;

        // Очищаємо контейнер
        container.removeChildren();

        const { map, width, height } = currentLevel.value;

        // Перевіряємо, чи відповідають розміри карти
        if (map.length !== height) {
            console.error('Неправильна висота карти рівня');
            return;
        }

        // Перевіряємо ширину кожного рядка
        for (let y = 0; y < height; y++) {
            if (map[y].length !== width) {
                console.error(`Неправильна ширина карти рівня в рядку ${y}`);
                return;
            }
        }

        // Створюємо спрайти для кожного тайла
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const tileSymbol = map[y][x];
                const tileType = TILE_MAPPING[tileSymbol];
                
                if (tileType) {
                    const sprite = createTileSprite(tileType, x, y, 0, 0);
                    container.addChild(sprite);
                } else {
                    console.warn(`Невідомий символ тайла: ${tileSymbol} на позиції (${x}, ${y})`);
                }
            }
        }
    };

    return {
        currentLevel,
        loadLevel,
        createLevelSprites
    };
}; 