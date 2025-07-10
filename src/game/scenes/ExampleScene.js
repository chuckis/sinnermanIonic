import Phaser from 'phaser';
import DialogSystem from '../managers/DialogSystem';
import DialogUIManager from '../managers/DialogUIManager';

/**
 * Example scene showing how to use the refactored dialog system
 * This demonstrates how the dialog components can be reused in different scenes
 */
export default class ExampleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ExampleScene' });
    
    // Initialize dialog system
    this.dialogSystem = new DialogSystem();
    this.isDialogActive = false;
  }
  
  preload() {
    // Load dialog data
    this.load.json('example_dialogs', 'dialogs/example-dialog.json');
    
    // Load any other assets needed for this scene
    this.load.image('background', 'assets/background.png');
    this.load.image('npc', 'assets/npc.png');
    this.load.image('player', 'assets/player.png');
  }
  
  create() {
    // Set up scene
    this.add.image(400, 300, 'background');
    
    // Add NPCs or other interactive elements
    const npc = this.add.image(300, 300, 'npc');
    npc.setInteractive();
    npc.on('pointerdown', () => {
      this.startDialog('guard_encounter');
    });
    
    // Add player character
    this.player = this.add.image(500, 300, 'player');
    
    // Initialize dialog system
    this.initializeDialogSystem();
    
    // Load dialog data
    const dialogData = this.cache.json.get('example_dialogs');
    this.dialogSystem.loadDialogData(dialogData);
    
    // Add instructions
    this.add.text(20, 20, 'Click on the NPC to start a dialog', {
      fontSize: '18px',
      fill: '#ffffff'
    });
  }
  
  /**
   * Initializes the dialog system and UI manager
   */
  initializeDialogSystem() {
    // Create dialog UI with custom configuration
    this.dialogUI = new DialogUIManager(this, {
      width: 700,
      height: 180,
      x: 400,
      y: 500,
      backgroundColor: 0x222222,
      textColor: '#eeeeee',
      speakerColor: '#ffcc00'
    });
    
    // Set up callbacks
    this.dialogUI.setChoiceCallback(this.makeChoice.bind(this));
    this.dialogUI.setContinueCallback(this.continueDialog.bind(this));
    this.dialogUI.setEndCallback(() => {
      this.isDialogActive = false;
      console.log('Dialog ended');
    });
  }
  
  /**
   * Starts a dialog with the given ID
   * @param {string} dialogId - The ID of the dialog to start
   */
  startDialog(dialogId) {
    const dialogData = this.dialogSystem.startDialog(dialogId);
    if (dialogData) {
      this.isDialogActive = true;
      this.dialogUI.showDialog(dialogData);
    }
  }
  
  /**
   * Handles a choice selection in the dialog
   * @param {number} choiceIndex - The index of the selected choice
   */
  makeChoice(choiceIndex) {
    const nextDialog = this.dialogSystem.makeChoice(choiceIndex);
    if (nextDialog) {
      this.dialogUI.showDialog(nextDialog);
    } else {
      this.dialogUI.endDialog();
    }
  }
  
  /**
   * Continues to the next dialog
   */
  continueDialog() {
    const nextDialog = this.dialogSystem.continueDialog();
    if (nextDialog) {
      this.dialogUI.showDialog(nextDialog);
    } else {
      this.dialogUI.endDialog();
    }
  }
  
  update() {
    // Example of how to handle player input based on dialog state
    if (!this.isDialogActive) {
      // Handle player movement or other gameplay when not in dialog
      if (this.input.keyboard.checkDown(this.input.keyboard.addKey('LEFT'), 100)) {
        this.player.x -= 2;
      } else if (this.input.keyboard.checkDown(this.input.keyboard.addKey('RIGHT'), 100)) {
        this.player.x += 2;
      }
    }
  }
}