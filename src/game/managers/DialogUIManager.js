import Phaser from 'phaser';

/**
 * DialogUIManager - Manages the UI components for the dialog system
 * This class handles the creation, display, and interaction with dialog UI elements
 * It can be reused across different scenes
 */
export default class DialogUIManager {
  /**
   * @param {Phaser.Scene} scene - The scene this dialog UI belongs to
   * @param {Object} config - Configuration options for the dialog UI
   */
  constructor(scene, config = {}) {
    this.scene = scene;
    this.isDialogActive = false;

    // Default configuration
    this.config = {
      width: 750,
      height: 200,
      x: 400,
      y: 500,
      backgroundColor: 0x000000,
      backgroundAlpha: 0.8,
      borderColor: 0xffffff,
      textColor: '#ffffff',
      speakerColor: '#ffff00',
      fontSize: '18px',
      speakerFontSize: '16px',
      padding: 50,
      ...config
    };

    // Create UI elements
    this.createDialogUI();

    // Listen for resize events
    this.scene.scale.on('resize', this.resize, this);
    this.resize(); // Initial positioning
  }

  /**
   * Creates all dialog UI elements and adds them to a container
   * @private
   */
  createDialogUI() {
    // Create container for all dialog UI elements
    this.dialogContainer = this.scene.add.container(0, 0);
    this.dialogContainer.setVisible(false);
    // this.dialogContainer.setScrollFactor(0); // UI fixed on screen

    // Dialog background
    this.dialogBg = this.scene.add.rectangle(
      this.config.x, 
      this.config.y, 
      this.config.width, 
      this.config.height, 
      this.config.backgroundColor, 
      this.config.backgroundAlpha
    );
    this.dialogBg.setStrokeStyle(2, this.config.borderColor);

    // Close button
    this.closeButton = this.scene.add.text(
      this.config.x + (this.config.width / 2) - 40, 
      this.config.y - (this.config.height / 2) + 10, 
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

    // Dialog text
    this.dialogText = this.scene.add.text(
      this.config.x - (this.config.width / 2) + this.config.padding, 
      this.config.y, 
      '', 
      {
        fontSize: this.config.fontSize,
        fill: this.config.textColor,
        wordWrap: { width: this.config.width - (this.config.padding * 2) }
      }
    );
    this.dialogText.setOrigin(0, 0.5);

    // Speaker name
    this.speakerName = this.scene.add.text(
      this.config.x - (this.config.width / 2) + this.config.padding, 
      this.config.y - (this.config.height / 2) + 30, 
      '', 
      {
        fontSize: this.config.speakerFontSize,
        fill: this.config.speakerColor,
        fontStyle: 'bold'
      }
    );

    // Container for choices
    this.choicesContainer = this.scene.add.container(0, 0);

    // Add all elements to the main container
    this.dialogContainer.add([
      this.dialogBg,
      this.closeButton,
      this.dialogText,
      this.speakerName,
      this.choicesContainer
    ]);

    // Set depth to ensure dialog appears above game elements
    this.dialogContainer.setDepth(1000);
  }

  /**
   * Shows the dialog UI with the provided dialog data
   * @param {Object} dialogData - The dialog data to display
   */
  showDialog(dialogData) {
    this.isDialogActive = true;
    this.dialogContainer.setVisible(true);
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

    // Add keyboard event for ESC to close dialog
    if (!this.escKeyHandler) {
      this.escKeyHandler = this.scene.input.keyboard.on('keydown-ESC', () => {
        if (this.isDialogActive) {
          this.endDialog();
        }
      });
    }
  }

  /**
   * Shows choice buttons for the dialog
   * @param {Array} choices - Array of choice objects
   * @private
   */
  showChoices(choices) {
    choices.forEach((choice, index) => {
      const buttonWidth = Math.min(this.currentDialogWidth - 50, 700);
      const button = this.scene.add.rectangle(
        this.currentDialogX, 
        this.currentDialogY + (this.currentDialogHeight / 2) + 50 + (index * 40), 
        buttonWidth, 
        35, 
        0x333333, 
        0.8
      );
      button.setStrokeStyle(2, 0x666666);
      button.setScrollFactor(0);
      button.setInteractive();

      const buttonText = this.scene.add.text(
        this.currentDialogX - (buttonWidth / 2) + 20, 
        this.currentDialogY + (this.currentDialogHeight / 2) + 50 + (index * 40), 
        choice.text, 
        {
          fontSize: '16px',
          fill: '#ffffff',
          wordWrap: { width: buttonWidth - 40 }
        }
      );
      buttonText.setScrollFactor(0);
      buttonText.setOrigin(0, 0.5);

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
        if (this.onChoiceSelected) {
          this.onChoiceSelected(index);
        }
      });

      this.choicesContainer.add([button, buttonText]);
    });
  }

  /**
   * Shows a continue button for the dialog
   * @param {boolean} autoNext - Whether the dialog should auto-advance
   * @private
   */
  showContinueButton(autoNext) {
    const button = this.scene.add.rectangle(
      this.currentDialogX, 
      this.currentDialogY + (this.currentDialogHeight / 2) + 50, 
      300, 
      35, 
      0x004400, 
      0.8
    );
    button.setStrokeStyle(2, 0x008800);
    button.setScrollFactor(0);
    button.setInteractive();

    const buttonText = this.scene.add.text(
      this.currentDialogX, 
      this.currentDialogY + (this.currentDialogHeight / 2) + 50, 
      'Продолжить', 
      {
        fontSize: '16px',
        fill: '#ffffff',
        fontStyle: 'bold'
      }
    );
    buttonText.setScrollFactor(0);
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
      if (this.onContinue) {
        this.onContinue();
      }
    });

    this.choicesContainer.add([button, buttonText]);
  }

  /**
   * Sets the callback for when a choice is selected
   * @param {Function} callback - Function to call when a choice is selected
   */
  setChoiceCallback(callback) {
    this.onChoiceSelected = callback;
  }

  /**
   * Sets the callback for when the continue button is clicked
   * @param {Function} callback - Function to call when continue is clicked
   */
  setContinueCallback(callback) {
    this.onContinue = callback;
  }

  /**
   * Sets the callback for when the dialog is ended
   * @param {Function} callback - Function to call when dialog ends
   */
  setEndCallback(callback) {
    this.onDialogEnd = callback;
  }

  /**
   * Ends the current dialog and hides the UI
   */
  endDialog() {
    this.isDialogActive = false;
    this.dialogContainer.setVisible(false);
    this.choicesContainer.removeAll(true);

    if (this.onDialogEnd) {
      this.onDialogEnd();
    }
  }

  /**
   * Checks if a dialog is currently active
   * @returns {boolean} True if dialog is active
   */
  isActive() {
    return this.isDialogActive;
  }

  /**
   * Resizes and repositions dialog UI elements based on the game window size
   */
  resize() {
    const gameWidth = this.scene.scale.width;
    const gameHeight = this.scene.scale.height;

    // Calculate new position and size based on game dimensions
    const dialogWidth = Math.min(gameWidth * 0.8, this.config.width);
    const dialogHeight = Math.min(gameHeight * 0.3, this.config.height);
    const dialogX = gameWidth / 2;
    const dialogY = gameHeight - dialogHeight / 2 - 20; // Position at bottom with some padding

    // Update dialog background
    this.dialogBg.setPosition(dialogX, dialogY);
    this.dialogBg.setSize(dialogWidth, dialogHeight);

    // Update close button position
    this.closeButton.setPosition(
      dialogX + (dialogWidth / 2) - 40,
      dialogY - (dialogHeight / 2) + 10
    );

    // Update dialog text position and wrapping
    this.dialogText.setPosition(
      dialogX - (dialogWidth / 2) + this.config.padding,
      dialogY
    );
    this.dialogText.setWordWrapWidth(dialogWidth - (this.config.padding * 2));

    // Update speaker name position
    this.speakerName.setPosition(
      dialogX - (dialogWidth / 2) + this.config.padding,
      dialogY - (dialogHeight / 2) + 30
    );

    // Store updated values for other methods to use
    this.currentDialogX = dialogX;
    this.currentDialogY = dialogY;
    this.currentDialogWidth = dialogWidth;
    this.currentDialogHeight = dialogHeight;
  }

  /**
   * Cleans up resources when the dialog UI is no longer needed
   */
  destroy() {
    if (this.escKeyHandler) {
      this.escKeyHandler.removeAllListeners();
    }
    this.scene.scale.off('resize', this.resize, this);
    this.dialogContainer.destroy();
  }
}
