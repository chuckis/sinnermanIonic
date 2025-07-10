import Phaser from 'phaser';

export default class Dialogue {
    constructor(scene) {
        this.scene = scene;
        this.isVisible = false;
        this.currentDialogue = null;
        this.currentIndex = 0;
        this.createDialogueSidebar();
    }

    createDialogueSidebar() {
        // Create sidebar background
        this.sidebar = this.scene.add.graphics();
        this.sidebar.fillStyle(0x000000, 0.9);
        this.sidebar.fillRect(this.scene.cameras.main.width - 300, 0, 300, this.scene.cameras.main.height);
        this.sidebar.setDepth(10);
        this.sidebar.setVisible(false);
        this.sidebar.setAlpha(0);

        // Create text for dialogue
        this.text = this.scene.add.text(
            this.scene.cameras.main.width - 290,
            30,
            '',
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffffff',
                wordWrap: { width: 280 }
            }
        );
        this.text.setDepth(11);
        this.text.setVisible(false);
        this.text.setAlpha(0);

        // Create speaker name text
        this.speakerText = this.scene.add.text(
            this.scene.cameras.main.width - 290,
            10,
            '',
            {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#ffff00',
                fontStyle: 'bold'
            }
        );
        this.speakerText.setDepth(11);
        this.speakerText.setVisible(false);
        this.speakerText.setAlpha(0);

        // Create continue prompt
        this.continueText = this.scene.add.text(
            this.scene.cameras.main.width - 290,
            this.scene.cameras.main.height - 40,
            'Press SPACE to continue',
            {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#888888',
                fontStyle: 'italic'
            }
        );
        this.continueText.setDepth(11);
        this.continueText.setVisible(false);
        this.continueText.setAlpha(0);

        // Create dialogue history container
        this.historyContainer = this.scene.add.container(0, 0);
        this.historyContainer.setDepth(11);
        this.historyContainer.setVisible(false);
        this.historyContainer.setAlpha(0);
    }

    startDialogue(dialogue) {
        this.currentDialogue = dialogue;
        this.currentIndex = 0;
        this.isVisible = true;
        
        // Show elements with fade-in effect
        this.sidebar.setVisible(true);
        this.text.setVisible(true);
        this.speakerText.setVisible(true);
        this.continueText.setVisible(true);
        // this.historyContainer.setVisible(true);

        // Fade in effect
        this.scene.tweens.add({
            targets: [this.sidebar, this.text, this.speakerText, this.continueText, this.historyContainer],
            alpha: 1,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.showCurrentLine();
            }
        });
    }

    showCurrentLine() {
        if (!this.currentDialogue || this.currentIndex >= this.currentDialogue.length) {
            this.endDialogue();
            return;
        }

        const line = this.currentDialogue[this.currentIndex];
        this.speakerText.setText(line.speaker);
        this.text.setText(line.text);

        // Add to history with fade-in effect
        const historyText = this.scene.add.text(
            0,
            this.historyContainer.length * 40,
            `${line.speaker}: ${line.text}`,
            {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#cccccc',
                wordWrap: { width: 280 }
            }
        );
        historyText.setAlpha(0);
        this.historyContainer.add(historyText);

        // Fade in the new line
        this.scene.tweens.add({
            targets: historyText,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });

        // Scroll history if needed
        if (this.historyContainer.length * 40 > this.scene.cameras.main.height - 100) {
            this.historyContainer.y = this.scene.cameras.main.height - 100 - (this.historyContainer.length * 40);
        }
    }

    nextLine() {
        this.currentIndex++;
        this.showCurrentLine();
    }

    endDialogue() {
        // Fade out effect
        this.scene.tweens.add({
            targets: [this.sidebar, this.text, this.speakerText, this.continueText, this.historyContainer],
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.isVisible = false;
                this.sidebar.setVisible(false);
                this.text.setVisible(false);
                this.speakerText.setVisible(false);
                this.continueText.setVisible(false);
                this.historyContainer.setVisible(false);
                this.historyContainer.removeAll(true);
                this.historyContainer.y = 0;
                this.currentDialogue = null;
                this.currentIndex = 0;
            }
        });
    }

    isActive() {
        return this.isVisible;
    }
} 