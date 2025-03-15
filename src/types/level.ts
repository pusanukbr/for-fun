// ground - базовий шар з травою
// objects - шар зі стінами та іншими об'єктами
// decorations - шар з героєм, виходом та іншими декоративними елементами

export type TileType = 
    | 'wall'
    | 'wall-top-left-angle'
    | 'wall-top-right-angle'
    | 'wall-bottom-left-angle'
    | 'wall-bottom-right-angle'
    | 'wall-sides'
    | 'floor'
    | 'water'
    | 'grass'
    | 'tree'
    | 'stone'
    | 'hero'
    | 'enemy'
    | 'exit';

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
    spawnPoint: {
        x: number;
        y: number;
    };
    layers: {
        name: string;        // Назва шару (наприклад, "ground", "objects", "decorations")
        map: string[][];     // Карта шару
    }[];
}

export interface LevelData {
    levels: Level[];
}

// Маппінг символів на типи тайлів
export const TILE_MAPPING: Record<string, TileType> = {
    '#': 'wall',
    'W': 'wall-top-left-angle',
    'w': 'wall-top-right-angle',
    'Q': 'wall-bottom-left-angle',
    'q': 'wall-bottom-right-angle',
    'H': 'wall-sides',
    '.': 'floor',
    '~': 'water',
    'G': 'grass',
    'T': 'tree',
    'S': 'stone',
    '@': 'hero',
    'E': 'enemy',
    'X': 'exit'
}; 