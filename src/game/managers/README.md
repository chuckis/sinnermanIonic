# Dialog System Refactoring

This document explains the refactoring changes made to the dialog system to improve reusability across different scenes.

## Overview of Changes

The dialog system has been refactored to separate concerns and improve modularity:

1. **DialogSystem.js**: Handles dialog data, logic, and state management
2. **DialogUIManager.js**: Manages dialog UI components and interactions
3. **BaseScene.js**: Simplified to use the new components

## Benefits of the Refactoring

- **Improved Reusability**: Dialog components can be easily used in any scene
- **Separation of Concerns**: UI and logic are now separate
- **Customization**: Dialog UI appearance can be customized through configuration
- **Reduced Code Duplication**: Common dialog functionality is now in shared components
- **Better Maintainability**: Changes to dialog UI or logic only need to be made in one place

## How to Use the Dialog System

### Basic Usage

```javascript
// In your scene's constructor
constructor() {
  super({ key: 'YourScene' });
  this.dialogSystem = new DialogSystem();
  this.isDialogActive = false;
}

// In your scene's create method
create() {
  // Initialize dialog system
  this.initializeDialogSystem();
  
  // Load dialog data
  const dialogData = this.cache.json.get('dialogs');
  this.dialogSystem.loadDialogData(dialogData);
}

// Initialize dialog system
initializeDialogSystem() {
  // Create dialog UI
  this.dialogUI = new DialogUIManager(this);
  
  // Set up callbacks
  this.dialogUI.setChoiceCallback(this.makeChoice.bind(this));
  this.dialogUI.setContinueCallback(this.continueDialog.bind(this));
  this.dialogUI.setEndCallback(() => {
    this.isDialogActive = false;
  });
}

// Start a dialog
startDialog(dialogId) {
  const dialogData = this.dialogSystem.startDialog(dialogId);
  if (dialogData) {
    this.isDialogActive = true;
    this.dialogUI.showDialog(dialogData);
  }
}

// Handle choice selection
makeChoice(choiceIndex) {
  const nextDialog = this.dialogSystem.makeChoice(choiceIndex);
  if (nextDialog) {
    this.dialogUI.showDialog(nextDialog);
  } else {
    this.dialogUI.endDialog();
  }
}

// Continue dialog
continueDialog() {
  const nextDialog = this.dialogSystem.continueDialog();
  if (nextDialog) {
    this.dialogUI.showDialog(nextDialog);
  } else {
    this.dialogUI.endDialog();
  }
}
```

### Customizing Dialog UI

You can customize the appearance of the dialog UI by passing a configuration object to the DialogUIManager constructor:

```javascript
this.dialogUI = new DialogUIManager(this, {
  width: 700,
  height: 180,
  x: 400,
  y: 500,
  backgroundColor: 0x222222,
  backgroundAlpha: 0.9,
  borderColor: 0xffffff,
  textColor: '#eeeeee',
  speakerColor: '#ffcc00',
  fontSize: '18px',
  speakerFontSize: '16px',
  padding: 50
});
```

## Example Scene

See `src/scenes/ExampleScene.js` for a complete example of how to use the refactored dialog system in a new scene.

## Dialog Data Format

The dialog system expects dialog data in the following format:

```json
{
  "characters": {
    "guard": {
      "name": "Guard",
      "portrait": "guard_portrait"
    },
    "player": {
      "name": "Player",
      "portrait": "player_portrait"
    }
  },
  "globalVariables": {
    "reputation": 0,
    "gold": 10
  },
  "dialogs": [
    {
      "id": "guard_encounter",
      "speaker": "guard",
      "text": "Halt! Who goes there?",
      "choices": [
        {
          "text": "I'm just a traveler.",
          "next": "guard_friendly"
        },
        {
          "text": "None of your business.",
          "next": "guard_hostile"
        }
      ]
    },
    {
      "id": "guard_friendly",
      "speaker": "guard",
      "text": "Very well, you may pass.",
      "autoNext": "guard_goodbye"
    },
    {
      "id": "guard_hostile",
      "speaker": "guard",
      "text": "Watch your tone!",
      "effects": {
        "variables": {
          "reputation": { "op": "-=", "value": 1 }
        }
      },
      "autoNext": "guard_goodbye"
    },
    {
      "id": "guard_goodbye",
      "speaker": "guard",
      "text": "Safe travels."
    }
  ]
}
```