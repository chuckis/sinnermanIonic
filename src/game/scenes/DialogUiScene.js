import BaseUIScene from "@/game/scenes/BaseUiScene.js";
/**
 * DialogUIScene - Specialized scene for handling dialog UI
 */
export class DialogUIScene extends BaseUIScene {
    constructor() {
        super('DialogUIScene');
    }

    getDefaultConfig() {
        return {
            ...super.getDefaultConfig(),
            relativeWidth: 0.66,
            relativeHeight: 0.25,
            anchorX: 0.5,
            anchorY: 1,
            speakerColor: '#ffff00',
            // Add responsive choice button configuration
            choiceButtonSpacing: 0.05, // 5% of container height
            choiceButtonHeight: 0.12,  // 12% of container height
            choiceButtonMinHeight: 30,
            choiceButtonMaxHeight: 50,
            choiceButtonPadding: 0.02  // 2% of container width
        };
    }

    initializeSceneData(data) {
        // Callbacks
        this.onChoiceSelected = null;
        this.onContinue = null;
        this.onDialogEnd = null;
    }

    getUIDepth() {
        return 1000;
    }

    updateResponsiveProperties(sceneWidth, sceneHeight) {
        super.updateResponsiveProperties(sceneWidth, sceneHeight);
        this.speakerFontSize = Math.max(12, Math.floor(sceneWidth / 60));

        // Calculate responsive choice button properties
        this.choiceButtonSpacing = Math.max(10, this.uiHeight * this.config.choiceButtonSpacing);
        this.choiceButtonHeight = Math.max(
            this.config.choiceButtonMinHeight,
            Math.min(
                this.config.choiceButtonMaxHeight,
                this.uiHeight * this.config.choiceButtonHeight
            )
        );
        this.choiceButtonPadding = this.uiWidth * this.config.choiceButtonPadding;
        this.choiceButtonWidth = this.uiWidth - (this.choiceButtonPadding * 2);
        this.choiceButtonFontSize = Math.max(12, Math.floor(this.uiWidth / 60));
    }

    createUI() {
        super.createUI();
        this.createDialogElements();
        this.uiContainer.setVisible(false);
    }

    createDialogElements() {
        // Close button
        this.closeButton = this.add.text(
            this.uiX + this.uiWidth - 40,
            this.uiY + 10,
            '✕',
            {
                fontSize: '24px',
                fill: '#ffffff',
                backgroundColor: '#ff0000',
                padding: { x: 8, y: 4 }
            }
        );
        this.closeButton.setInteractive();
        this.closeButton.on('pointerdown', () => this.endDialog());
        this.closeButton.on('pointerover', () => this.closeButton.setStyle({ fill: '#ffff00' }));
        this.closeButton.on('pointerout', () => this.closeButton.setStyle({ fill: '#ffffff' }));

        // Speaker name
        this.speakerName = this.add.text(
            this.uiX + this.padding,
            this.uiY + 30,
            '',
            {
                fontSize: this.speakerFontSize + 'px',
                fill: this.config.speakerColor,
                fontStyle: 'bold'
            }
        );

        // Dialog text
        this.dialogText = this.add.text(
            this.uiX + this.padding,
            this.uiY + this.uiHeight / 2,
            '',
            {
                fontSize: this.fontSize + 'px',
                fill: this.config.textColor,
                wordWrap: { width: this.uiWidth - (this.padding * 2) }
            }
        );
        this.dialogText.setOrigin(0, 0.5);

        // Container for choices
        this.choicesContainer = this.add.container(0, 0);

        // Add elements to container
        this.uiContainer.add([
            this.closeButton,
            this.speakerName,
            this.dialogText,
            this.choicesContainer
        ]);
    }

    setupEventListeners() {
        super.setupEventListeners();
        this.addEventListener('show-dialog', this.showDialog);
        this.addEventListener('hide-dialog', this.endDialog);

        // ESC key to close dialog
        this.input.keyboard.on('keydown-ESC', () => {
            if (this.isActive) {
                this.endDialog();
            }
        });
    }

    updateLayout() {
        super.updateLayout();
        if (!this.closeButton) return;

        // Update close button position
        this.closeButton.setPosition(
            this.uiX + this.uiWidth - 40,
            this.uiY + 10
        );

        // Update speaker name position
        this.speakerName.setPosition(
            this.uiX + this.padding,
            this.uiY + 30
        );
        this.speakerName.setStyle({ fontSize: this.speakerFontSize + 'px' });

        // Update dialog text position and wrapping
        this.dialogText.setPosition(
            this.uiX + this.padding,
            this.uiY + this.uiHeight / 2
        );
        this.dialogText.setWordWrapWidth(this.uiWidth - (this.padding * 2));
        this.dialogText.setStyle({
            fontSize: this.fontSize + 'px',
            wordWrap: { width: this.uiWidth - (this.padding * 2) }
        });

        // Update choice buttons if they exist
        this.updateChoiceButtonsLayout();
    }

    updateChoiceButtonsLayout() {
        if (!this.choicesContainer || this.choicesContainer.list.length === 0) return;

        // Recalculate button positions and sizes
        const buttons = this.choicesContainer.list;
        const buttonPairs = [];

        // Group buttons and texts in pairs
        for (let i = 0; i < buttons.length; i += 2) {
            buttonPairs.push({
                button: buttons[i],
                text: buttons[i + 1]
            });
        }

        buttonPairs.forEach((pair, index) => {
            const buttonY = this.uiY + this.uiHeight + this.choiceButtonSpacing + (index * (this.choiceButtonHeight + this.choiceButtonSpacing));

            // Update button
            pair.button.setPosition(this.uiX + this.uiWidth / 2, buttonY);
            pair.button.setSize(this.choiceButtonWidth, this.choiceButtonHeight);

            // Update text
            pair.text.setPosition(this.uiX + this.uiWidth / 2, buttonY);
            pair.text.setStyle({
                fontSize: this.choiceButtonFontSize + 'px',
                wordWrap: { width: this.choiceButtonWidth - 40 }
            });
        });
    }

    showDialog(dialogData) {
        this.show();

        // Set text content
        this.dialogText.setText(dialogData.text);
        this.speakerName.setText(dialogData.speaker || '');

        // Clear previous choices
        this.choicesContainer.removeAll(true);

        // Show choices or continue button
        if (dialogData.choices && dialogData.choices.length > 0) {
            this.showChoices(dialogData.choices);
        } else {
            this.showContinueButton(dialogData.autoNext);
        }

        this.game.events.emit('dialog-shown', dialogData);
    }

    showChoices(choices) {
        choices.forEach((choice, index) => {
            const buttonY = this.uiY + this.uiHeight + this.choiceButtonSpacing + (index * (this.choiceButtonHeight + this.choiceButtonSpacing));

            const button = this.add.rectangle(
                this.uiX + this.uiWidth / 2,
                buttonY,
                this.choiceButtonWidth,
                this.choiceButtonHeight,
                0x333333,
                0.8
            );
            button.setStrokeStyle(2, 0x666666);
            button.setInteractive();

            const buttonText = this.add.text(
                this.uiX + this.uiWidth / 2,
                buttonY,
                choice.text,
                {
                    fontSize: this.choiceButtonFontSize + 'px',
                    fill: '#ffffff',
                    wordWrap: { width: this.choiceButtonWidth - 40 }
                }
            );
            buttonText.setOrigin(0.5, 0.5);

            // Hover effects
            button.on('pointerover', () => {
                button.setFillStyle(0x555555, 0.9);
                button.setStrokeStyle(2, 0xffffff);
                buttonText.setStyle({ fill: '#ffff00' });
            });

            button.on('pointerout', () => {
                button.setFillStyle(0x333333, 0.8);
                button.setStrokeStyle(2, 0x666666);
                buttonText.setStyle({ fill: '#ffffff' });
            });

            button.on('pointerdown', () => {
                this.handleChoiceSelected(index);
            });

            this.choicesContainer.add([button, buttonText]);
        });
    }

    showContinueButton(autoNext) {
        const buttonY = this.uiY + this.uiHeight + this.choiceButtonSpacing;

        const button = this.add.rectangle(
            this.uiX + this.uiWidth / 2,
            buttonY,
            Math.min(this.choiceButtonWidth, 300), // Cap continue button width
            this.choiceButtonHeight,
            0x004400,
            0.8
        );
        button.setStrokeStyle(2, 0x008800);
        button.setInteractive();

        const buttonText = this.add.text(
            this.uiX + this.uiWidth / 2,
            buttonY,
            'Продолжить',
            {
                fontSize: this.choiceButtonFontSize + 'px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }
        );
        buttonText.setOrigin(0.5, 0.5);

        // Hover effects
        button.on('pointerover', () => {
            button.setFillStyle(0x006600, 0.9);
            button.setStrokeStyle(2, 0x00ff00);
            buttonText.setStyle({ fill: '#ffff00' });
        });

        button.on('pointerout', () => {
            button.setFillStyle(0x004400, 0.8);
            button.setStrokeStyle(2, 0x008800);
            buttonText.setStyle({ fill: '#ffffff' });
        });

        button.on('pointerdown', () => {
            this.handleContinue();
        });

        this.choicesContainer.add([button, buttonText]);
    }

    handleChoiceSelected(choiceIndex) {
        this.game.events.emit('dialog-choice-selected', choiceIndex);
        if (this.onChoiceSelected) {
            this.onChoiceSelected(choiceIndex);
        }
    }

    handleContinue() {
        this.game.events.emit('dialog-continue');
        if (this.onContinue) {
            this.onContinue();
        }
    }

    endDialog() {
        this.hide();
        this.choicesContainer.removeAll(true);
        this.game.events.emit('dialog-ended');
        if (this.onDialogEnd) {
            this.onDialogEnd();
        }
    }

    onHide() {
        super.onHide();
        this.choicesContainer.removeAll(true);
    }

    // Callback setters
    setChoiceCallback(callback) { this.onChoiceSelected = callback; }
    setContinueCallback(callback) { this.onContinue = callback; }
    setEndCallback(callback) { this.onDialogEnd = callback; }
}