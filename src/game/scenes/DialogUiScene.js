import { Scene } from 'phaser';
/**
 * DialogUIScene - A dedicated scene for handling dialog UI
 * This scene can be launched as a nested scene within BaseScene
 */
export default class DialogUIScene extends Scene {
    constructor() {
        super({ key: 'DialogUIScene' });
    }

    /**
     * Initialize the scene with configuration data
     * @param {Object} data - Configuration and parent scene reference
     */
    init(data) {
        this.parentScene = data.parentScene;
        this.isDialogActive = false;

        // Configuration with defaults
        this.config = {
            relativeWidth: 0.66,
            relativeHeight: 0.25,
            anchorX: 0.5, // Center horizontally
            anchorY: 1,   // Bottom anchor
            backgroundColor: 0x000000,
            backgroundAlpha: 0.8,
            borderColor: 0xffffff,
            textColor: '#ffffff',
            speakerColor: '#ffff00',
            padding: 20,
            ...data.config
        };

        // Callbacks
        this.onChoiceSelected = null;
        this.onContinue = null;
        this.onDialogEnd = null;
    }

    /**
     * Create the dialog UI elements
     */
    create() {
        // Calculate initial dimensions and position
        this.updateDimensions();

        // Create UI elements
        this.createDialogUI();

        // Set up event listeners
        this.setupEventListeners();

        // Initially hide the dialog
        this.dialogContainer.setVisible(false);

        // Set up resize handling
        this.scale.on('resize', this.handleResize, this);
    }

    /**
     * Update dialog dimensions based on current camera/screen size
     */
    updateDimensions() {
        const camera = this.cameras.main;
        const sceneWidth = camera.width;
        const sceneHeight = camera.height;

        // Calculate responsive dimensions
        this.dialogWidth = sceneWidth * this.config.relativeWidth;
        this.dialogHeight = sceneHeight * this.config.relativeHeight;

        // Calculate position based on anchors
        this.dialogX = (sceneWidth * this.config.anchorX);
        this.dialogY = (sceneHeight * this.config.anchorY) - (this.dialogHeight * this.config.anchorY);

        // Update responsive properties
        this.fontSize = Math.max(14, Math.floor(sceneWidth / 50));
        this.speakerFontSize = Math.max(12, Math.floor(sceneWidth / 60));
        this.padding = Math.max(20, Math.floor(sceneWidth / 40));
    }

    /**
     * Create all dialog UI elements
     */
    createDialogUI() {
        // Create container for all dialog UI elements
        this.dialogContainer = this.add.container(0, 0);
        this.dialogContainer.setDepth(1000);

        // Dialog background
        this.dialogBg = this.add.rectangle(
            this.dialogX + this.dialogWidth / 2,
            this.dialogY + this.dialogHeight / 2,
            this.dialogWidth,
            this.dialogHeight,
            this.config.backgroundColor,
            this.config.backgroundAlpha
        );
        this.dialogBg.setStrokeStyle(2, this.config.borderColor);

        // Close button
        this.closeButton = this.add.text(
            this.dialogX + this.dialogWidth - 40,
            this.dialogY + 10,
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
            this.dialogX + this.padding,
            this.dialogY + 30,
            '',
            {
                fontSize: this.speakerFontSize + 'px',
                fill: this.config.speakerColor,
                fontStyle: 'bold'
            }
        );

        // Dialog text
        this.dialogText = this.add.text(
            this.dialogX + this.padding,
            this.dialogY + this.dialogHeight / 2,
            '',
            {
                fontSize: this.fontSize + 'px',
                fill: this.config.textColor,
                wordWrap: { width: this.dialogWidth - (this.padding * 2) }
            }
        );
        this.dialogText.setOrigin(0, 0.5);

        // Container for choices
        this.choicesContainer = this.add.container(0, 0);

        // Add all elements to the main container
        this.dialogContainer.add([
            this.dialogBg,
            this.closeButton,
            this.dialogText,
            this.speakerName,
            this.choicesContainer
        ]);
    }

    /**
     * Set up event listeners for scene communication
     */
    setupEventListeners() {
        // Listen for dialog events from parent scene
        this.game.events.on('show-dialog', this.showDialog, this);
        this.game.events.on('hide-dialog', this.endDialog, this);

        // ESC key to close dialog
        this.input.keyboard.on('keydown-ESC', () => {
            if (this.isDialogActive) {
                this.endDialog();
            }
        });
    }

    /**
     * Handle resize events
     */
    handleResize() {
        this.updateDimensions();
        this.updateDialogLayout();
    }

    /**
     * Update dialog layout based on current dimensions
     */
    updateDialogLayout() {
        if (!this.dialogContainer) return;

        // Update dialog background
        this.dialogBg.setPosition(
            this.dialogX + this.dialogWidth / 2,
            this.dialogY + this.dialogHeight / 2
        );
        this.dialogBg.setSize(this.dialogWidth, this.dialogHeight);

        // Update close button position
        this.closeButton.setPosition(
            this.dialogX + this.dialogWidth - 40,
            this.dialogY + 10
        );

        // Update speaker name position
        this.speakerName.setPosition(
            this.dialogX + this.padding,
            this.dialogY + 30
        );
        this.speakerName.setStyle({ fontSize: this.speakerFontSize + 'px' });

        // Update dialog text position and wrapping
        this.dialogText.setPosition(
            this.dialogX + this.padding,
            this.dialogY + this.dialogHeight / 2
        );
        this.dialogText.setWordWrapWidth(this.dialogWidth - (this.padding * 2));
        this.dialogText.setStyle({
            fontSize: this.fontSize + 'px',
            wordWrap: { width: this.dialogWidth - (this.padding * 2) }
        });
    }

    /**
     * Show dialog with provided data
     * @param {Object} dialogData - Dialog data to display
     */
    showDialog(dialogData) {
        this.isDialogActive = true;
        this.dialogContainer.setVisible(true);

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

        // Emit event to parent scene
        this.game.events.emit('dialog-shown', dialogData);
    }

    /**
     * Show choice buttons
     * @param {Array} choices - Array of choice objects
     */
    showChoices(choices) {
        choices.forEach((choice, index) => {
            const buttonWidth = Math.min(this.dialogWidth - 50, 700);
            const buttonY = this.dialogY + this.dialogHeight + 20 + (index * 40);

            const button = this.add.rectangle(
                this.dialogX + this.dialogWidth / 2,
                buttonY,
                buttonWidth,
                35,
                0x333333,
                0.8
            );
            button.setStrokeStyle(2, 0x666666);
            button.setInteractive();

            const buttonText = this.add.text(
                this.dialogX + this.dialogWidth / 2,
                buttonY,
                choice.text,
                {
                    fontSize: Math.max(12, Math.floor(this.dialogWidth / 60)) + 'px',
                    fill: '#ffffff',
                    wordWrap: { width: buttonWidth - 40 }
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

            // Click handler
            button.on('pointerdown', () => {
                this.handleChoiceSelected(index);
            });

            this.choicesContainer.add([button, buttonText]);
        });
    }

    /**
     * Show continue button
     * @param {boolean} autoNext - Whether dialog should auto-advance
     */
    showContinueButton(autoNext) {
        const buttonY = this.dialogY + this.dialogHeight + 20;

        const button = this.add.rectangle(
            this.dialogX + this.dialogWidth / 2,
            buttonY,
            300,
            35,
            0x004400,
            0.8
        );
        button.setStrokeStyle(2, 0x008800);
        button.setInteractive();

        const buttonText = this.add.text(
            this.dialogX + this.dialogWidth / 2,
            buttonY,
            'Продолжить',
            {
                fontSize: Math.max(12, Math.floor(this.dialogWidth / 60)) + 'px',
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

        // Click handler
        button.on('pointerdown', () => {
            this.handleContinue();
        });

        this.choicesContainer.add([button, buttonText]);
    }

    /**
     * Handle choice selection
     * @param {number} choiceIndex - Index of selected choice
     */
    handleChoiceSelected(choiceIndex) {
        // Emit event to parent scene
        this.game.events.emit('dialog-choice-selected', choiceIndex);

        // Call callback if set
        if (this.onChoiceSelected) {
            this.onChoiceSelected(choiceIndex);
        }
    }

    /**
     * Handle continue button click
     */
    handleContinue() {
        // Emit event to parent scene
        this.game.events.emit('dialog-continue');

        // Call callback if set
        if (this.onContinue) {
            this.onContinue();
        }
    }

    /**
     * End the dialog
     */
    endDialog() {
        this.isDialogActive = false;
        this.dialogContainer.setVisible(false);
        this.choicesContainer.removeAll(true);

        // Emit event to parent scene
        this.game.events.emit('dialog-ended');

        // Call callback if set
        if (this.onDialogEnd) {
            this.onDialogEnd();
        }
    }

    /**
     * Set callback functions
     */
    setChoiceCallback(callback) {
        this.onChoiceSelected = callback;
    }

    setContinueCallback(callback) {
        this.onContinue = callback;
    }

    setEndCallback(callback) {
        this.onDialogEnd = callback;
    }

    /**
     * Check if dialog is active
     */
    isActive() {
        return this.isDialogActive;
    }

    /**
     * Clean up when scene is destroyed
     */
    destroy() {
        // Remove event listeners
        this.game.events.off('show-dialog', this.showDialog, this);
        this.game.events.off('hide-dialog', this.endDialog, this);
        this.scale.off('resize', this.handleResize, this);

        super.destroy();
    }
}