import DialogSystem from '../managers/DialogSystem';

export default class DialogExampleScene extends Phaser.Scene {
  constructor() {
    super('DialogExample');
    this.dialogSystem = new DialogSystem();
    this.currentDialogUI = null;
  }

  preload() {
    // Загружаем JSON с диалогами
    this.load.json('dialogs', 'dialogs/example-dialog.json');
  }

  create() {
    // Инициализируем систему диалогов
    const dialogData = this.cache.json.get('dialogs');
    this.dialogSystem.loadDialogData(dialogData);

    // Создаем UI для диалогов
    this.createDialogUI();

    // Пример: запуск диалога при нажатии
    this.input.keyboard.on('keydown-SPACE', () => {
      this.startDialog('guard_encounter');
    });
  }

  createDialogUI() {
    // Создаем контейнер для UI диалогов
    this.dialogContainer = this.add.container(0, 0);
    this.dialogContainer.setVisible(false);

    // Фон диалога
    this.dialogBg = this.add.rectangle(400, 500, 750, 200, 0x000000, 0.8);
    this.dialogBg.setStrokeStyle(2, 0xffffff);

    // Текст диалога
    this.dialogText = this.add.text(50, 420, '', {
      fontSize: '18px',
      fill: '#ffffff',
      wordWrap: { width: 700 }
    });

    // Имя говорящего
    this.speakerName = this.add.text(50, 390, '', {
      fontSize: '16px',
      fill: '#ffff00',
      fontStyle: 'bold'
    });

    // Контейнер для выборов
    this.choicesContainer = this.add.container(0, 0);

    // Добавляем все в основной контейнер
    this.dialogContainer.add([
      this.dialogBg,
      this.dialogText,
      this.speakerName,
      this.choicesContainer
    ]);
  }

  startDialog(dialogId) {
    const dialogData = this.dialogSystem.startDialog(dialogId);
    if (dialogData) {
      this.showDialog(dialogData);
    }
  }

  showDialog(dialogData) {
    // Показываем UI диалога
    this.dialogContainer.setVisible(true);

    // Устанавливаем текст
    this.dialogText.setText(dialogData.text);
    this.speakerName.setText(dialogData.speaker || '');

    // Очищаем предыдущие выборы
    this.choicesContainer.removeAll(true);

    // Если есть выборы, показываем их
    if (dialogData.choices && dialogData.choices.length > 0) {
      this.showChoices(dialogData.choices);
    } else {
      // Если нет выборов, показываем кнопку продолжения
      this.showContinueButton(dialogData.autoNext);
    }

    // Обновляем UI игры (показываем переменные)
    this.updateGameUI();
  }

  showChoices(choices) {
    choices.forEach((choice, index) => {
      const button = this.add.text(70, 550 + index * 30, `${index + 1}. ${choice.text}`, {
        fontSize: '16px',
        fill: '#ffffff',
        backgroundColor: '#333333',
        padding: { x: 10, y: 5 }
      });

      button.setInteractive();
      button.on('pointerdown', () => this.makeChoice(index));
      button.on('pointerover', () => {
        button.setStyle({ fill: '#ffff00' });
        if (choice.tooltip) {
          this.showTooltip(choice.tooltip);
        }
      });
      button.on('pointerout', () => {
        button.setStyle({ fill: '#ffffff' });
        this.hideTooltip();
      });

      this.choicesContainer.add(button);

      // Добавляем клавиатурное управление
      this.input.keyboard.on(`keydown-${index + 1}`, () => this.makeChoice(index));
    });
  }

  showContinueButton(autoNext) {
    const button = this.add.text(70, 550, 'Нажмите ENTER для продолжения', {
      fontSize: '16px',
      fill: '#cccccc',
      fontStyle: 'italic'
    });

    button.setInteractive();
    button.on('pointerdown', () => this.continueDialog());
    
    this.choicesContainer.add(button);

    // Клавиатурное управление
    this.input.keyboard.once('keydown-ENTER', () => this.continueDialog());
  }

  makeChoice(choiceIndex) {
    const nextDialog = this.dialogSystem.makeChoice(choiceIndex);
    if (nextDialog) {
      this.showDialog(nextDialog);
    } else {
      this.endDialog();
    }
  }

  continueDialog() {
    const nextDialog = this.dialogSystem.continueDialog();
    if (nextDialog) {
      this.showDialog(nextDialog);
    } else {
      this.endDialog();
    }
  }

  endDialog() {
    this.dialogContainer.setVisible(false);
    this.updateGameUI();
  }

  updateGameUI() {
    // Обновляем отображение переменных игры
    const gameState = this.dialogSystem.getGameState();
    
    // Пример: показываем здоровье и золото
    if (!this.gameUI) {
      this.gameUI = this.add.container(10, 10);
      
      this.healthText = this.add.text(0, 0, '', {
        fontSize: '16px',
        fill: '#ff0000'
      });
      
      this.goldText = this.add.text(0, 25, '', {
        fontSize: '16px',
        fill: '#ffff00'
      });
      
      this.reputationText = this.add.text(0, 50, '', {
        fontSize: '16px',
        fill: '#00ff00'
      });
      
      this.gameUI.add([this.healthText, this.goldText, this.reputationText]);
    }
    
    this.healthText.setText(`Здоровье: ${gameState.variables.health || 0}`);
    this.goldText.setText(`Золото: ${gameState.variables.gold || 0}`);
    this.reputationText.setText(`Репутация: ${gameState.variables.reputation || 0}`);
  }

  showTooltip(text) {
    if (this.tooltip) {
      this.tooltip.destroy();
    }
    
    this.tooltip = this.add.text(400, 100, text, {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
  }

  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.destroy();
      this.tooltip = null;
    }
  }
}

// Конфигурация Phaser
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: DialogExampleScene
};

const game = new Phaser.Game(config);