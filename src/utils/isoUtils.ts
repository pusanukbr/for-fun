export const tileWidth = 64;
export const tileHeight = 32;

export const toScreenCoords = (x: number, y: number) => {
    const screenX = (x - y) * (tileWidth / 2);
    const screenY = (x + y) * (tileHeight / 2);
    return { screenX, screenY };
};