export interface Tile {
    type: string; // Тип клітинки (наприклад, "grass", "stone")
    x: number;    // Ізометрична координата X
    y: number;    // Ізометрична координата Y
}

export interface GameMap {
    width: number;
    height: number;
    tiles: Tile[];
}