export default class VisualFeedbackManager {
    constructor(scene, tileSize) {
        this.scene = scene;
        this.tileSize = tileSize;
        this.highlightTile = null;
        this.mouseHighlightTile = null;
        this.mouseGridX = 0;
        this.mouseGridY = 0;
        
        this.setupHighlights();
    }

    setupHighlights() {
        this.highlightTile = this.scene.add.graphics();
        this.mouseHighlightTile = this.scene.add.graphics();
        
        this.highlightTile.setDepth(1);
        this.mouseHighlightTile.setDepth(1);
    }

    updateHighlightTile(heroPos) {
        this.highlightTile.clear();
        this.highlightTile.lineStyle(2, 0x00ff00);
        this.highlightTile.strokeRect(
            heroPos.x * this.tileSize,
            heroPos.y * this.tileSize,
            this.tileSize,
            this.tileSize
        );
    }

    updateMouseHighlight(x, y) {
        this.mouseGridX = x;
        this.mouseGridY = y;
        
        this.mouseHighlightTile.clear();
        this.mouseHighlightTile.lineStyle(2, 0x00ffff);
        this.mouseHighlightTile.strokeRect(
            this.mouseGridX * this.tileSize,
            this.mouseGridY * this.tileSize,
            this.tileSize,
            this.tileSize
        );
    }
} 