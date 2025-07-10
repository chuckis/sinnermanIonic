import {Scene} from "phaser";

export class Example extends Scene {
    constructor ()
    {
        super('Example');
    }
    preload ()
    {
        this.load.image('fireball', 'assets/fireball.png');
        this.load.image('square', 'assets/square.png');
    }

    create ()
    {
        const fireball = this.physics.add.image(100, 300, 'fireball')
            .setBounce(1, 1)
            .setCollideWorldBounds(true);

        const square = this.add.image(0, 0, 'square').setVisible(false);

        this.add.text(10, 10, 'Click to set target', { fill: '#00ff00' });

        this.input.on('pointerdown', (pointer) =>
        {
            square.copyPosition(pointer).setVisible(true);

            // Move toward target at 200 px/s:
            this.physics.moveToObject(fireball, square, 200);

            // See  for stopping.
        });
    }
}

