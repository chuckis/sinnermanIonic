import Phaser from 'phaser';

export default class Thing extends Phaser.GameObjects.Sprite{
    constructor(scene, gridX, gridY, texture, name) {
        super(scene,
            gridX * scene.tileSize + scene.tileSize / 2,
            gridY * scene.tileSize + scene.tileSize / 2,
            texture,
            name
        );
        this.scene = scene;
        // Visual setup
        this.setScale(2);
        this.setDepth(1);

        // Add physics body
        scene.physics.add.existing(this);
        this.body.setSize(32, 32);
        scene.add.existing(this);
        // Here some logic for inventory management
    }

}