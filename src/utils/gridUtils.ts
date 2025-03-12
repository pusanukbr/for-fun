// Розміри клітинки в 2D
export const tileSize = 32; // Квадратні тайли 32x32

// Перетворення координат сітки в екранні (просто множимо на розмір тайла)
export const toScreenCoords = (x: number, y: number) => {
    const screenX = x * tileSize;
    const screenY = y * tileSize;
    return { screenX, screenY };
};