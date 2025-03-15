export type TileType = 'grass' | 'stone' | 'water' | 'tree' | 'hero' | 'wall' | 'wall-top-left-angle' | 'wall-top-right-angle' | 'wall-bottom-left-angle' | 'wall-bottom-right-angle' | 'wall-sides' | 'floor' | 'enemy' | 'exit';

export interface Tile {
    type: TileType;
    x: number;
    y: number;
}

export interface Level {
    id: string;
    name: string;
    width: number;
    height: number;
    // Матриця рівня, де кожен символ відповідає певному типу тайла
    map: string[];
    spawnPoint: {
        x: number;
        y: number;
    };
    background?: string;
}

export interface LevelData {
    levels: Level[];
}

// Маппінг символів на типи тайлів
export const TILE_MAPPING: Record<string, TileType> = {
    '.': 'grass',    // Трава
    '#': 'wall',     // Стіна
    'E': 'enemy',    // Ворог
    'X': 'exit',     // Вихід
    'W': 'wall-top-left-angle',    // Стіна з верхнім лівим кутом
    'w': 'wall-top-right-angle',   // Стіна з верхнім правим кутом
    'Q': 'wall-bottom-left-angle', // Стіна з нижнім лівим кутом
    'q': 'wall-bottom-right-angle',// Стіна з нижнім правим кутом
    'H': 'wall-sides',         // Стіна зі сторонами
    '~': 'water',    // Вода
    'T': 'tree',     // Дерево
    'S': 'stone',    // Камінь
    'F': 'floor',    // Підлога
    '@': 'hero'      // Герой
}; 