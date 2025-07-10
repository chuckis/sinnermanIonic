export default class ParentScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ParentScene' });
    }

    create() {
        this.scale.on('resize', this.resize, this);
        this.resize(); // Initial resize
    }

    resize() {
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;

        // Example: Adjust camera bounds based on new size
        this.cameras.main.setBounds(0, 0, gameWidth, gameHeight);

        // Example: Scale background image
        // this.background.setScale(gameWidth / this.background.width, gameHeight / this.background.height);
    }
}