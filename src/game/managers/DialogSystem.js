export default class DialogSystem {
  constructor() {
    this.dialogs = new Map();
    this.characters = new Map();
    this.variables = {};
    this.flags = new Set();
    this.inventory = new Map();
    this.currentDialog = null;
  }

  // Загрузка диалогов из JSON
  loadDialogData(data) {
    // Загружаем персонажей
    if (data.characters) {
      Object.entries(data.characters).forEach(([id, character]) => {
        this.characters.set(id, character);
      });
    }

    // Загружаем глобальные переменные
    if (data.globalVariables) {
      this.variables = { ...data.globalVariables };
    }

    // Загружаем диалоги
    data.dialogs.forEach(dialog => {
      this.dialogs.set(dialog.id, dialog);
    });
  }

  // Начать диалог
  startDialog(dialogId) {
    const dialog = this.dialogs.get(dialogId);
    if (!dialog) {
      console.error(`Dialog ${dialogId} not found`);
      return null;
    }

    if (!this.checkConditions(dialog.conditions)) {
      console.warn(`Conditions not met for dialog ${dialogId}`);
      return null;
    }

    this.currentDialog = dialog;
    this.applyEffects(dialog.effects);
    return this.getCurrentDialogData();
  }

  // Получить данные текущего диалога
  getCurrentDialogData() {
    if (!this.currentDialog) return null;

    const speaker = this.characters.get(this.currentDialog.speaker);
    const availableChoices = this.currentDialog.choices ? 
      this.currentDialog.choices.filter(choice => this.checkConditions(choice.conditions)) : [];

    return {
      id: this.currentDialog.id,
      text: this.currentDialog.text,
      speaker: speaker ? speaker.name : this.currentDialog.speaker,
      speakerData: speaker,
      choices: availableChoices.map(choice => ({
        text: choice.text,
        tooltip: choice.tooltip,
        index: this.currentDialog.choices.indexOf(choice)
      })),
      autoNext: this.currentDialog.autoNext
    };
  }

  // Выбрать вариант
  makeChoice(choiceIndex) {
    if (!this.currentDialog || !this.currentDialog.choices) return null;

    const choice = this.currentDialog.choices[choiceIndex];
    if (!choice) return null;

    // Применяем эффекты выбора
    this.applyEffects(choice.effects);

    // Переходим к следующему диалогу
    if (choice.next) {
      return this.startDialog(choice.next);
    }

    this.currentDialog = null;
    return null;
  }

  // Автоматический переход к следующему диалогу
  continueDialog() {
    if (!this.currentDialog || !this.currentDialog.autoNext) return null;
    return this.startDialog(this.currentDialog.autoNext);
  }

  // Проверить условия
  checkConditions(conditions) {
    if (!conditions) return true;

    // Проверяем переменные
    if (conditions.variables) {
      for (const [varName, condition] of Object.entries(conditions.variables)) {
        if (!this.checkVariableCondition(varName, condition)) {
          return false;
        }
      }
    }

    // Проверяем флаги
    if (conditions.flags) {
      for (const flag of conditions.flags) {
        if (!this.flags.has(flag)) return false;
      }
    }

    if (conditions.not_flags) {
      for (const flag of conditions.not_flags) {
        if (this.flags.has(flag)) return false;
      }
    }

    // Проверяем предметы
    if (conditions.items) {
      for (const item of conditions.items) {
        if (!this.inventory.has(item) || this.inventory.get(item) <= 0) {
          return false;
        }
      }
    }

    return true;
  }

  // Проверить условие на переменную
  checkVariableCondition(varName, condition) {
    const currentValue = this.variables[varName] || 0;
    
    if (typeof condition === 'number') {
      return currentValue === condition;
    }
    
    if (typeof condition === 'object' && condition.op) {
      const targetValue = condition.value;
      switch (condition.op) {
        case '>=': return currentValue >= targetValue;
        case '<=': return currentValue <= targetValue;
        case '>': return currentValue > targetValue;
        case '<': return currentValue < targetValue;
        case '==': return currentValue === targetValue;
        case '!=': return currentValue !== targetValue;
        default: return false;
      }
    }
    
    return false;
  }

  // Применить эффекты
  applyEffects(effects) {
    if (!effects) return;

    // Применяем изменения переменных
    if (effects.variables) {
      for (const [varName, effect] of Object.entries(effects.variables)) {
        this.applyVariableEffect(varName, effect);
      }
    }

    // Устанавливаем флаги
    if (effects.flags) {
      effects.flags.forEach(flag => this.flags.add(flag));
    }

    // Удаляем флаги
    if (effects.remove_flags) {
      effects.remove_flags.forEach(flag => this.flags.delete(flag));
    }

    // Изменяем инвентарь
    if (effects.items) {
      for (const [itemName, amount] of Object.entries(effects.items)) {
        const current = this.inventory.get(itemName) || 0;
        this.inventory.set(itemName, Math.max(0, current + amount));
      }
    }
  }

  // Применить эффект к переменной
  applyVariableEffect(varName, effect) {
    const currentValue = this.variables[varName] || 0;
    
    if (typeof effect === 'number') {
      this.variables[varName] = effect;
      return;
    }
    
    if (typeof effect === 'object' && effect.op) {
      const value = effect.value;
      switch (effect.op) {
        case '+=':
          this.variables[varName] = currentValue + value;
          break;
        case '-=':
          this.variables[varName] = currentValue - value;
          break;
        case '*=':
          this.variables[varName] = currentValue * value;
          break;
        case '/=':
          this.variables[varName] = currentValue / value;
          break;
        case '=':
          this.variables[varName] = value;
          break;
      }
    }
  }

  // Получить состояние игры
  getGameState() {
    return {
      variables: { ...this.variables },
      flags: Array.from(this.flags),
      inventory: Object.fromEntries(this.inventory)
    };
  }

  // Восстановить состояние игры
  restoreGameState(state) {
    this.variables = { ...state.variables };
    this.flags = new Set(state.flags);
    this.inventory = new Map(Object.entries(state.inventory));
  }
}