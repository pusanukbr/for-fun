import { ref } from 'vue';
import type { Level, LevelData, Tile } from '../types/level';
import { TILE_MAPPING } from '../types/level';
import { useTileSet } from './useTile';
import { Container, Sprite } from 'pixi.js';
import {TILE_SIZE} from "../config/constants.ts";

export const useLevel = () => {
    const currentLevel = ref<Level | null>(null);
    const { loadTileSet, createTileSprite, getAnimatedTexture, mapping } = useTileSet();

    // Список анімованих спрайтів для подальшого використання
    const animatedSprites = ref<
        { sprite: Sprite; type: string; state: string; x: number; y: number; offsetX: number; offsetY: number }[]
    >([]);

    const loadLevel = async (levelId: string) => {
        try {
            // Завантажуємо дані рівня
            const response = await fetch('/src/data/levels.json');
            const data: LevelData = await response.json();

            // Знаходимо потрібний рівень
            const level = data.levels.find((l) => l.id === levelId);
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

        // Очищаємо контейнер і список анімованих спрайтів
        container.removeChildren();
        animatedSprites.value = [];

        const { layers, width, height } = currentLevel.value;

        // Перевіряємо кожен шар
        for (const layer of layers) {
            // Перевіряємо, чи відповідають розміри карти
            if (layer.map.length !== height) {
                console.error(`Неправильна висота карти рівня в шарі ${layer.name}`);
                continue;
            }

            // Перевіряємо ширину кожного рядка
            for (let y = 0; y < height; y++) {
                if (layer.map[y].length !== width) {
                    console.error(`Неправильна ширина карти рівня в рядку ${y} шару ${layer.name}`);
                    continue;
                }
            }

            // Створюємо спрайти для кожного тайла в шарі
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const tileSymbol = layer.map[y][x];
                    if (tileSymbol === '.') continue; // Ігноруємо порожні клітинки

                    const tileType = TILE_MAPPING[tileSymbol];

                    if (tileType) {
                        // Перевіряємо, чи тайл анімований
                        const tileConfig = mapping[tileType];
                        if (tileConfig?.animations) {
                            const state = Object.keys(tileConfig.animations)[0]; // Перший стан (наприклад, IDLE для ворога)
                            const sprite = new Sprite(getAnimatedTexture(tileType, state, 0));
                            sprite.width = TILE_SIZE;
                            sprite.height = TILE_SIZE;
                            sprite.label = `tile-${tileType}-${x}-${y}`;
                            sprite.x = x * TILE_SIZE;
                            sprite.y = y * TILE_SIZE;
                            sprite.zIndex = 1;

                            container.addChild(sprite);

                            // Додаємо до списку анімованих спрайтів
                            animatedSprites.value.push({
                                sprite,
                                type: tileType,
                                state,
                                x,
                                y,
                                offsetX: 0,
                                offsetY: 0,
                            });
                        } else {
                            // Для статичних тайлів
                            const tile: Tile = {
                                type: tileType,
                                x,
                                y,
                                width: TILE_SIZE,
                                height: TILE_SIZE,
                                frameX: 0,
                                frameY: 0,
                            };
                            const sprite = createTileSprite(tile.type, tile.x, tile.y, 0, 0);
                            container.addChild(sprite);
                        }
                    } else {
                        console.warn(`Невідомий символ тайла: ${tileSymbol} на позиції (${x}, ${y}) в шарі ${layer.name}`);
                    }
                }
            }
        }

        return animatedSprites.value;
    };

    return {
        currentLevel,
        loadLevel,
        createLevelSprites,
        animatedSprites,
    };
};