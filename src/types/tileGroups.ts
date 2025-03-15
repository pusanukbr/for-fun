import type { TileType } from './level';

// Групи тайлів
export enum TileGroup {
    WALL = 'wall',           // Всі види стін
    FLOOR = 'floor',         // Всі види підлоги
    WATER = 'water',         // Всі види води
    GRASS = 'grass',         // Всі види трави
    OBSTACLE = 'obstacle',   // Всі перешкоди
    DECORATION = 'decoration' // Декоративні елементи
}

// Маппінг типів тайлів на їх групи
export const TILE_GROUPS: Record<TileType, TileGroup> = {
    // Стіни
    'wall': TileGroup.WALL,
    'wall-top-left-angle': TileGroup.WALL,
    'wall-top-right-angle': TileGroup.WALL,
    'wall-bottom-left-angle': TileGroup.WALL,
    'wall-bottom-right-angle': TileGroup.WALL,
    'wall-sides': TileGroup.WALL,

    // Підлога
    'floor': TileGroup.FLOOR,

    // Вода
    'water': TileGroup.WATER,

    // Трава
    'grass': TileGroup.GRASS,

    // Перешкоди
    'tree': TileGroup.OBSTACLE,
    'stone': TileGroup.OBSTACLE,

    // Декорації
    'hero': TileGroup.DECORATION,
    'enemy': TileGroup.OBSTACLE,
    'exit': TileGroup.DECORATION
}; 