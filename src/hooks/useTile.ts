import { ref } from 'vue';
import { Assets, Texture, Rectangle, Sprite } from 'pixi.js';

// Тип для анімації одного стану
export interface AnimationState {
    texturePath: string;      // Шлях до окремого файлу для цього стану
    tileSize: number;         // Розмір одного тайла у файлі
    frameCount: number;       // Кількість кадрів у файлі
    frameDuration: number;    // Тривалість одного кадру в секундах
    direction?: 'horizontal' | 'vertical'; // Напрямок кадрів (за замовчуванням horizontal)
    startX?: number;          // Початкова позиція X (за замовчуванням 0)
    startY?: number;          // Початкова позиція Y (за замовчуванням 0)
}

// Тип для мапінгу типів тайлів
export interface TileSetMapping {
    [key: string]: {
        x?: number;               // Позиція X (для статичних тайлів)
        y?: number;               // Позиція Y (для статичних тайлів)
        texturePath?: string;     // Опціональний шлях до tileset (для статичних тайлів)
        tileSize?: number;        // Опціональний розмір тайла
        animations?: {            // Опціональні анімації (для анімованих тайлів)
            [state: string]: AnimationState;
        };
    };
}

// Конфігурація tileset
export interface TileSetConfig {
    defaultTexturePath: string;
    defaultTileSize: number;
    mapping: TileSetMapping;
}

const defaultTileSetConfig: TileSetConfig = {
    defaultTexturePath: '/assets/main_tile.png',
    defaultTileSize: 16,
    mapping: {
        grass: { x: 0, y: 3 },
        stone: { x: 1, y: 0 },
        water: { x: 4, y: 1 },
        tree: { x: 4, y: 2 },
        wall: { x: 44, y: 1 },
        'wall-top-left-angle': { x: 45, y: 2 },
        'wall-top-right-angle': { x: 47, y: 2 },
        'wall-bottom-left-angle': { x: 45, y: 4 },
        'wall-bottom-right-angle': { x: 47, y: 4 },
        'wall-sides': { x: 44, y: 2 },
        hero: {
            animations: {
                IDLE: {
                    texturePath: '/assets/hero/hero_idle.png',
                    tileSize: 96,
                    frameCount: 9,
                    frameDuration: 0.06,
                    direction: 'horizontal',
                    startX: 0,
                    startY: 0,
                },
                RUN: {
                    texturePath: '/assets/hero/hero_run.png',
                    tileSize: 96,
                    frameCount: 8,
                    frameDuration: 0.1,
                    direction: 'horizontal',
                    startX: 0,
                    startY: 0,
                },
                ATTACK: {
                    texturePath: '/assets/hero/hero_attack.png',
                    tileSize: 96,
                    frameCount: 9,
                    frameDuration: 0.15,
                    direction: 'horizontal',
                    startX: 0,
                    startY: 0,
                },
                JUMP: {
                    texturePath: '/assets/hero/hero_jump.png',
                    tileSize: 96,
                    frameCount: 9,
                    frameDuration: 0.3,
                    direction: 'horizontal',
                    startX: 0,
                    startY: 0,
                },
            },
        },
        enemy: {
            animations: {
                IDLE: {
                    texturePath: '/assets/enemy/enemy_idle.png',
                    tileSize: 96,
                    frameCount: 9,
                    frameDuration: 0.2,
                    direction: 'horizontal',
                    startX: 0,
                    startY: 0,
                },
            },
        },
    },
};

// Функція для роботи з tileset
export const useTileSet = (config: Partial<TileSetConfig> = {}) => {
    const finalConfig = { ...defaultTileSetConfig, ...config };
    const { defaultTexturePath, defaultTileSize, mapping } = finalConfig;

    const progress = ref(0);
    const textures: Map<string, Texture> = new Map();

    const loadTileSet = async () => {
        const texturePaths = new Set<string>();

        // Додаємо defaultTexturePath, якщо він існує
        if (defaultTexturePath) {
            texturePaths.add(defaultTexturePath);
        }

        // Додаємо texturePath із mapping
        Object.values(mapping).forEach((tile) => {
            if (tile.texturePath) {
                texturePaths.add(tile.texturePath);
            }
            if (tile.animations) {
                Object.values(tile.animations).forEach((anim) => {
                    if (anim.texturePath) {
                        texturePaths.add(anim.texturePath);
                    }
                });
            }
        });

        // Фільтруємо undefined і порожні рядки
        const pathsArray = [...texturePaths].filter((path) => path && typeof path === 'string');
        if (pathsArray.length === 0) {
            console.warn('Немає текстур для завантаження');
            return;
        }

        try {
            const loadedTextures = await Assets.load(pathsArray, (progressValue: number) => {
                progress.value = progressValue * 100;
                console.log(`Прогрес завантаження: ${progressValue * 100}%`);
            });

            pathsArray.forEach((path) => {
                textures.set(path, loadedTextures[path]);
            });

            progress.value = 100;
        } catch (error: any) {
            console.error('Помилка завантаження текстур:', error);
            console.error('Деталі помилки:', {
                    message: error.message,
                    name: error.name,
                    stack: error.stack,
            });
            throw error;
        }
    };

    const calculateFramePosition = (anim: { direction?: string, startX?: number, startY?: number, frameCount: number }, frameIndex: number): { frameX: number, frameY: number } => {
        const direction = anim.direction || 'horizontal';
        const startX = anim.startX || 0;
        const startY = anim.startY || 0;
        const frameIndexAdjusted = frameIndex % anim.frameCount;

        let frameX = startX;
        let frameY = startY;

        if (direction === 'horizontal') {
            frameX = startX + frameIndexAdjusted;
        } else {
            frameY = startY + frameIndexAdjusted;
        }

        return { frameX, frameY };
    }

    const getTileTexture = (type: string, frameIndex: number = 0): Texture => {
        const tileConfig = mapping[type] || mapping.grass;
        const texturePath = tileConfig.texturePath || defaultTexturePath;
        const tileSetTileSize = tileConfig.tileSize || defaultTileSize;

        const baseTexture = textures.get(texturePath);
        if (!baseTexture) {
            throw new Error(`Tileset для ${texturePath} не завантажено. Спочатку виклич loadTileSet.`);
        }

        let frame: Rectangle;

        if (tileConfig.animations) {
            const currentState = Object.keys(tileConfig.animations)[0];
            const anim = tileConfig.animations[currentState];
            const { frameX, frameY } = calculateFramePosition(anim, frameIndex);

            frame = new Rectangle(
                frameX * anim.tileSize,
                frameY * anim.tileSize,
                anim.tileSize,
                anim.tileSize
            );
        } else {
            frame = new Rectangle(
                (tileConfig.x || 0) * tileSetTileSize,
                (tileConfig.y || 0) * tileSetTileSize,
                tileSetTileSize,
                tileSetTileSize
            );
        }

        return new Texture({source: baseTexture, frame});
    };

    const getAnimatedTexture = (type: string, state: string, frameIndex: number): Texture => {
        const tileConfig = mapping[type];
        if (!tileConfig || !tileConfig.animations || !tileConfig.animations[state]) {
            throw new Error(`Анімація для типу ${type} і стану ${state} не знайдена.`);
        }

        const anim = tileConfig.animations[state];
        const baseTexture = textures.get(anim.texturePath);
        if (!baseTexture) {
            throw new Error(`Tileset для ${anim.texturePath} не завантажено. Спочатку виклич loadTileSet.`);
        }

        const { frameX, frameY } = calculateFramePosition(anim, frameIndex);

        const frame = new Rectangle(
            frameX * anim.tileSize,
            frameY * baseTexture.height,
            anim.tileSize,
            baseTexture.height
        );

        return new Texture({source: baseTexture, frame});
    };

    const createTileSprite = (type: string, x: number, y: number, offsetX: number, offsetY: number): Sprite => {
        const texture = getTileTexture(type);
        const sprite = new Sprite(texture);

        sprite.width = 32; // Масштабуємо до 32x32, як у useLevel.ts
        sprite.height = 32;
        sprite.label = `tile-${type}-${x}-${y}`;

        sprite.x = x * 32 + offsetX; // Масштабуємо координати
        sprite.y = y * 32 + offsetY;

        return sprite;
    };

    return { loadTileSet, getTileTexture, getAnimatedTexture, createTileSprite, progress, mapping };
};