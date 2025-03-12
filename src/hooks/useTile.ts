import { Assets, Texture, Rectangle, Sprite } from 'pixi.js';
import { tileSize, toScreenCoords } from '../utils/gridUtils';

// Тип для мапінгу типів тайлів на позиції в tileset
export interface TileSetMapping {
    [key: string]: {
        x: number; // Позиція X у tileset (у тайлах)
        y: number; // Позиція Y у tileset (у тайлах)
    };
}

// Конфігурація tileset
export interface TileSetConfig {
    texturePath: string;
    tileSize: number;
    mapping: TileSetMapping;
}

const defaultTileSetConfig: TileSetConfig = {
    texturePath: '/assets/main_tile_16.png',
    tileSize: 16,
    mapping: {
        grass: { x: 0, y: 3 },
        stone: { x: 1, y: 0 },
        water: { x: 4, y: 1 },
        tree: { x: 4, y: 2 },
        hero: { x: 54, y: 10 },
    },
};

// Функція для роботи з tileset
export const useTileSet = (config: Partial<TileSetConfig> = {}) => {
    const finalConfig = { ...defaultTileSetConfig, ...config };
    const { texturePath, tileSize: tileSetTileSize, mapping } = finalConfig;
    let baseTexture: Texture | null = null;

    // Завантаження tileset
    const loadTileSet = async () => {
        baseTexture = await Assets.load(texturePath);
    };

    // Отримання текстури для типу тайла
    const getTileTexture = (type: string): Texture => {
        if (!baseTexture) {
            throw new Error('Tileset не завантажено. Спочатку виклич loadTileSet.');
        }

        const tilePos = mapping[type] || mapping.grass;
        const frame = new Rectangle(
            tilePos.x * tileSetTileSize,
            tilePos.y * tileSetTileSize,
            tileSetTileSize,
            tileSetTileSize
        );

        return new Texture({source: baseTexture, frame});
    };

    // Створення спрайта для тайла
    const createTileSprite = (type: string, x: number, y: number, offsetX: number, offsetY: number): Sprite => {
        const texture = getTileTexture(type);
        const sprite = new Sprite(texture);

        sprite.width = tileSize;
        sprite.height = tileSize;

        const { screenX, screenY } = toScreenCoords(x, y);
        sprite.x = screenX + offsetX;
        sprite.y = screenY + offsetY;

        return sprite;
    };

    return { loadTileSet, getTileTexture, createTileSprite };
};