export default class GridManager {
    constructor(scene, gridSize, tileSize) {
        this.scene = scene;
        this.gridSize = gridSize;
        this.tileSize = tileSize;
        this.grid = [];
        this.initializeGrid();
    }

    initializeGrid() {
        for (let y = 0; y < this.gridSize; y++) {
            this.grid[y] = Array(this.gridSize).fill(0);
        }

        // Add default obstacles!! For early testing purposes only!
        const obstacles = [
            { x: 2, y: 2 },
            { x: 3, y: 3 },
            { x: 3, y: 4 },
            { x: 3, y: 5 }
        ];
        
        obstacles.forEach(({ x, y }) => {
            this.grid[y][x] = 1;
        });
    }

    isValidPosition({ x, y }) {
        return x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize;
    }

    screenToGrid(screenX, screenY) {
        const camera = this.scene.cameras.main;
        const worldX = (screenX + camera.scrollX) / camera.zoom;
        const worldY = (screenY + camera.scrollY) / camera.zoom;
        
        return {
            x: Math.floor(worldX / this.tileSize),
            y: Math.floor(worldY / this.tileSize)
        };
    }

    drawGrid() {
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(1, 0x666666);

        // Draw grid lines
        for (let x = 0; x <= this.gridSize; x++) {
            graphics.moveTo(x * this.tileSize, 0);
            graphics.lineTo(x * this.tileSize, this.gridSize * this.tileSize);
        }

        for (let y = 0; y <= this.gridSize; y++) {
            graphics.moveTo(0, y * this.tileSize);
            graphics.lineTo(this.gridSize * this.tileSize, y * this.tileSize);
        }

        // Draw obstacles
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (this.grid[y][x] === 1) {
                    graphics.fillStyle(0xff0000, 0.3);
                    graphics.fillRect(
                        x * this.tileSize,
                        y * this.tileSize,
                        this.tileSize,
                        this.tileSize
                    );
                }
            }
        }

        graphics.strokePath();
        graphics.setDepth(0);
    }
} 