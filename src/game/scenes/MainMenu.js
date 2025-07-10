import { Scene } from 'phaser';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.add.image(512, 384, 'background');

        this.add.image(512, 300, 'logo');

        this.add.text(512, 460, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Add buttons for different scenes
        const buttonStyle = {
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff',
            backgroundColor: '#000000', padding: { x: 20, y: 10 }
        };

        // Game button
        // const gameButton = this.add.text(512, 520, 'Start Game', buttonStyle)
        //     .setOrigin(0.5)
        //     .setInteractive({ useHandCursor: true });

        // Base Scene button
        const baseSceneButton = this.add.text(512, 570, 'Test Base Scene', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        const dialogButton = this.add.text(512, 520, 'DialogExample', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        // Add hover effects
        [baseSceneButton, dialogButton].forEach(button => {
            button.on('pointerover', () => {
                button.setStyle({ backgroundColor: '#333333' });
            });
            button.on('pointerout', () => {
                button.setStyle({ backgroundColor: '#000000' });
            });
        });

        // Add click handlers
        dialogButton.on('pointerdown', () => {
            this.scene.start('DialogExample');
        });

        baseSceneButton.on('pointerdown', () => {
            this.scene.start('BaseScene');
        });
    }
}
