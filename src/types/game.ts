export interface Tile {
    type: string;
    x: number;
    y: number;
}

export interface GameMap {
    width: number;
    height: number;
    tiles: Tile[];
}

export interface Player {
    x: number;
    y: number;
}