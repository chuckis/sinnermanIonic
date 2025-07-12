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

    // Get game, camera and scene dimensions
    const game = this.scene.game;
    const camera = this.scene.cameras.main;

    // Get actual game dimensions (considering scale and device pixel ratio)
    const gameWidth = game.config.width || game.scale.width;
    const gameHeight = game.config.height || game.scale.height;

    // Use camera dimensions (which reflect the actual viewport)
    const sceneWidth = camera.width;
    const sceneHeight = camera.height;

    // Calculate relative dimensions
    const defaultWidth = gameWidth * 0.66; // 2/3 width of scene
    const defaultHeight = gameHeight * 0.25; // 25% of scene height

    // Position at bottom of visible area (considering camera scroll)
    const defaultX = camera.scrollX; // Left edge of camera view
    const defaultY = camera.scrollY + sceneHeight - defaultHeight; // Bottom of camera view

    // Default configuration with adaptive values
    this.config = {
      width: defaultWidth,
      height: defaultHeight,
      x: defaultX,
      y: defaultY,
      backgroundColor: 0x000000,
      backgroundAlpha: 0.8,
      borderColor: 0xffffff,
      textColor: '#ffffff',
      speakerColor: '#ffff00',
      fontSize: Math.max(14, Math.floor(sceneWidth / 50)) + 'px', // Responsive font size
      speakerFontSize: Math.max(12, Math.floor(sceneWidth / 60)) + 'px',
      padding: Math.max(20, Math.floor(sceneWidth / 40)), // Responsive padding
      // Add responsive properties
      relativeWidth: 1.0, // 100% of scene width
      relativeHeight: 0.25, // 25% of scene height
      anchorX: 0, // Left anchor
      anchorY: 1, // Bottom anchor
      ...config
    };

    // Override with calculated values if relative properties are used
    if (config.relativeWidth !== undefined) {
      this.config.width = sceneWidth * config.relativeWidth;
    }
    if (config.relativeHeight !== undefined) {
      this.config.height = sceneHeight * config.relativeHeight;
    }

    // Calculate position based on anchors
    const anchorX = config.anchorX !== undefined ? config.anchorX : 0;
    const anchorY = config.anchorY !== undefined ? config.anchorY : 1;

    this.config.x = camera.scrollX + (sceneWidth * anchorX) - (this.config.width * anchorX);
    this.config.y = camera.scrollY + (sceneHeight * anchorY) - (this.config.height * anchorY);

    // Store current dialog dimensions for use in other methods
    this.currentDialogX = this.config.x + this.config.width / 2;
    this.currentDialogY = this.config.y + this.config.height / 2;
    this.currentDialogWidth = this.config.width;
    this.currentDialogHeight = this.config.height;

    // Create UI elements
    this.createDialogUI();

    // Listen for resize events
    this.handleResize = this.handleResize.bind(this);
    game.scale.on('resize', this.handleResize);

    // Initial positioning
    this.updateDialogLayout();
  }

  /**
   * Handle game resize events
   * @param {Object} gameSize - The new game size
   */
  handleResize(gameSize) {
    const camera = this.scene.cameras.main;
    const sceneWidth = camera.width;
    const sceneHeight = camera.height;

    // Recalculate dimensions
    this.config.width = sceneWidth * (this.config.relativeWidth || 1.0);
    this.config.height = sceneHeight * (this.config.relativeHeight || 0.25);

    // Update responsive properties
    this.config.fontSize = Math.max(14, Math.floor(sceneWidth / 50)) + 'px';
    this.config.speakerFontSize = Math.max(12, Math.floor(sceneWidth / 60)) + 'px';
    this.config.padding = Math.max(20, Math.floor(sceneWidth / 40));

    // Update position
    this.updatePosition();

    // Update dialog layout
    this.updateDialogLayout();
  }

  /**
   * Update position based on camera and anchors
   */
  updatePosition() {
    const camera = this.scene.cameras.main;
    const sceneWidth = camera.width;
    const sceneHeight = camera.height;

    const anchorX = this.config.anchorX || 0;
    const anchorY = this.config.anchorY || 1;

    this.config.x = camera.scrollX + (sceneWidth * anchorX) - (this.config.width * anchorX);
    this.config.y = camera.scrollY + (sceneHeight * anchorY) - (this.config.height * anchorY);

    // Update current dialog position for centered positioning
    this.currentDialogX = this.config.x + this.config.width / 2;
    this.currentDialogY = this.config.y + this.config.height / 2;
    this.currentDialogWidth = this.config.width;
    this.currentDialogHeight = this.config.height;
  }

  /**
   * Updates the dialog layout based on current config
   */
  updateDialogLayout() {
    if (!this.dialogContainer) return;

    // Update dialog background
    this.dialogBg.setPosition(this.currentDialogX, this.currentDialogY);
    this.dialogBg.setSize(this.currentDialogWidth, this.currentDialogHeight);

    // Update close button position
    this.closeButton.setPosition(
        this.currentDialogX + (this.currentDialogWidth / 2) - 40,
        this.currentDialogY - (this.currentDialogHeight / 2) + 10
    );

    // Update dialog text position and wrapping
    this.dialogText.setPosition(
        this.currentDialogX - (this.currentDialogWidth / 2) + this.config.padding,
        this.currentDialogY
    );
    this.dialogText.setWordWrapWidth(this.currentDialogWidth - (this.config.padding * 2));
    this.dialogText.setStyle({
      fontSize: this.config.fontSize,
      wordWrap: { width: this.currentDialogWidth - (this.config.padding * 2) }
    });

    // Update speaker name position
    this.speakerName.setPosition(
        this.currentDialogX - (this.currentDialogWidth / 2) + this.config.padding,
        this.currentDialogY - (this.currentDialogHeight / 2) + 30
    );
    this.speakerName.setStyle({ fontSize: this.config.speakerFontSize });

    // Update container position to follow camera
    this.dialogContainer.setPosition(0, 0);
    this.dialogContainer.setScrollFactor(0); // UI fixed on screen
  }

  /**
   * Creates all dialog UI elements and adds them to a container
   * @private
   */
  createDialogUI() {
    // Create container for all dialog UI elements
    this.dialogContainer = this.scene.add.container(0, 0);
    this.dialogContainer.setVisible(false);
    this.dialogContainer.setScrollFactor(0); // UI fixed on screen

    // Dialog background
    this.dialogBg = this.scene.add.rectangle(
        this.currentDialogX,
        this.currentDialogY,
        this.currentDialogWidth,
        this.currentDialogHeight,
        this.config.backgroundColor,
        this.config.backgroundAlpha
    );
    this.dialogBg.setStrokeStyle(2, this.config.borderColor);

    // Close button
    this.closeButton = this.scene.add.text(
        this.currentDialogX + (this.currentDialogWidth / 2) - 40,
        this.currentDialogY - (this.currentDialogHeight / 2) + 10,
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
        this.currentDialogX - (this.currentDialogWidth / 2) + this.config.padding,
        this.currentDialogY,
        '',
        {
          fontSize: this.config.fontSize,
          fill: this.config.textColor,
          wordWrap: { width: this.currentDialogWidth - (this.config.padding * 2) }
        }
    );
    this.dialogText.setOrigin(0, 0.5);

    // Speaker name
    this.speakerName = this.scene.add.text(
        this.currentDialogX - (this.currentDialogWidth / 2) + this.config.padding,
        this.currentDialogY - (this.currentDialogHeight / 2) + 30,
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
      button.setInteractive();

      const buttonText = this.scene.add.text(
          this.currentDialogX - (buttonWidth / 2) + 20,
          this.currentDialogY + (this.currentDialogHeight / 2) + 50 + (index * 40),
          choice.text,
          {
            fontSize: Math.max(12, Math.floor(this.currentDialogWidth / 60)) + 'px',
            fill: '#ffffff',
            wordWrap: { width: buttonWidth - 40 }
          }
      );
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
    button.setInteractive();

    const buttonText = this.scene.add.text(
        this.currentDialogX,
        this.currentDialogY + (this.currentDialogHeight / 2) + 50,
        'Продолжить',
        {
          fontSize: Math.max(12, Math.floor(this.currentDialogWidth / 60)) + 'px',
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
   * @deprecated Use handleResize instead
   */
  // handleResize() {
  //   this.handleResize();
  // }

  /**
   * Cleans up resources when the dialog UI is no longer needed
   */
  destroy() {
    if (this.escKeyHandler) {
      this.escKeyHandler.removeAllListeners();
    }

    // Clean up resize handler
    if (this.scene.game.scale) {
      this.scene.game.scale.off('resize', this.handleResize);
    }

    this.dialogContainer.destroy();
  }
}