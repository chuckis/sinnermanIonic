import BaseUIScene from "@/game/scenes/BaseUiScene.js";

/**
 * HudScene - Specialized scene for handling HUD UI
 */
export class HudScene extends BaseUIScene {
    constructor() {
        super('Hud');
        this.healthLabel = "Health: ";
        this.goldLabel = "Gold: ";
        this.powerLabel = "Power: ";
    }

    getDefaultConfig() {
        return {
            // ...super.getDefaultConfig(),
            relativeWidth: 1.0,    // Full width (100% of camera width)
            relativeHeight: 0.4,
            anchorX: 0,            // Align to left edge
            anchorY: 0,            // Align to top edge
            backgroundColor: 0x000000,
            backgroundAlpha: 0.3,  // More subtle background
            borderColor: 0x444444,
            labelColor: '#ffff00',
            valueColor: '#00ff00'
        };
    }

    initializeSceneData(data) {
        // Initialize HUD data
        this.hudData = {
            health: 100,
            maxHealth: 100,
            gold: 33,
            power: 50,
            maxPower: 100,
            level: 1,
            experience: 0,
            maxExperience: 100
        };

        this.onHudUpdate = null;
    }

    getUIDepth() {
        return 3000;
    }

    updateResponsiveProperties(sceneWidth, sceneHeight) {
        super.updateResponsiveProperties(sceneWidth, sceneHeight);
        this.fontSize = Math.max(12, Math.floor(sceneWidth / 60));
        this.labelFontSize = Math.max(10, Math.floor(sceneWidth / 70));
        this.padding = Math.max(15, Math.floor(sceneWidth / 80));
        // Calculate responsive line height based on font size and screen size
        this.lineHeight = Math.max(this.fontSize + 2, Math.floor(sceneHeight / 40));
        // Calculate responsive vertical spacing
        this.verticalSpacing = Math.max(this.fontSize * 0.2, Math.floor(sceneHeight / 100));
    }
    createUI() {
        super.createUI();
        this.createHudElements();
    }

    onSceneCreated() {
        this.show(); // HUD is visible by default
    }

    createHudElements() {
        this.createTextElements();
        this.createProgressBars();

        // Add elements to container
        this.uiContainer.add([
            this.healthText,
            this.goldText,
            this.powerText,
            this.levelText,
            this.experienceText,
            this.healthBar,
            this.healthBarBg,
            this.powerBar,
            this.powerBarBg,
            this.experienceBar,
            this.experienceBarBg
        ]);
    }

    createTextElements() {
        const startY = this.uiY + this.padding;
        const lineHeight = this.lineHeight;

        this.healthText = this.add.text(
            this.uiX + this.padding,
            startY,
            this.healthLabel + this.hudData.health + '/' + this.hudData.maxHealth,
            {
                fontSize: this.fontSize + 'px',
                fill: this.config.textColor,
                fontStyle: 'bold'
            }
        );

        this.goldText = this.add.text(
            this.uiX + this.padding,
            startY + lineHeight,
            this.goldLabel + this.hudData.gold,
            {
                fontSize: this.fontSize + 'px',
                fill: this.config.labelColor,
                fontStyle: 'bold'
            }
        );

        this.powerText = this.add.text(
            this.uiX + this.padding,
            startY + lineHeight * 2,
            this.powerLabel + this.hudData.power + '/' + this.hudData.maxPower,
            {
                fontSize: this.fontSize + 'px',
                fill: this.config.textColor,
                fontStyle: 'bold'
            }
        );

        this.levelText = this.add.text(
            this.uiX + this.padding,
            startY + lineHeight * 3,
            'Level: ' + this.hudData.level,
            {
                fontSize: this.fontSize + 'px',
                fill: this.config.valueColor,
                fontStyle: 'bold'
            }
        );

        this.experienceText = this.add.text(
            this.uiX + this.padding,
            startY + lineHeight * 4,
            'XP: ' + this.hudData.experience + '/' + this.hudData.maxExperience,
            {
                fontSize: this.labelFontSize + 'px',
                fill: this.config.textColor
            }
        );
    }

    createProgressBars() {
        const barWidth = this.uiWidth - (this.padding * 2);
        const barHeight = 8;
        const barX = this.uiX + this.padding;
        const startY = this.uiY + this.padding;
        const lineHeight = this.lineHeight;

        // Health bar
        this.healthBarBg = this.add.rectangle(
            barX + barWidth / 2,
            startY + lineHeight,
            barWidth,
            barHeight,
            0x330000
        );
        this.healthBarBg.setStrokeStyle(1, 0x666666);

        this.healthBar = this.add.rectangle(
            barX + (barWidth * (this.hudData.health / this.hudData.maxHealth)) / 2,
            startY + lineHeight,
            barWidth * (this.hudData.health / this.hudData.maxHealth),
            barHeight,
            0x00ff00
        );

        this.powerBarBg = this.add.rectangle(
            barX + barWidth / 2,
            startY + lineHeight * 2.5,
            barWidth,
            barHeight,
            0x000033
        );
        this.powerBarBg.setStrokeStyle(1, 0x666666);

        this.powerBar = this.add.rectangle(
            barX + (barWidth * (this.hudData.power / this.hudData.maxPower)) / 2,
            startY + lineHeight * 2.5,
            barWidth * (this.hudData.power / this.hudData.maxPower),
            barHeight,
            0x0099ff
        );

        // Experience bar
        this.experienceBarBg = this.add.rectangle(
            barX + barWidth / 2,
            startY + lineHeight * 4.5,
            barWidth,
            barHeight,
            0x333300
        );
        this.experienceBarBg.setStrokeStyle(1, 0x666666);

        this.experienceBar = this.add.rectangle(
            barX + (barWidth * (this.hudData.experience / this.hudData.maxExperience)) / 2,
            startY + lineHeight * 4.5,
            barWidth * (this.hudData.experience / this.hudData.maxExperience),
            barHeight,
            0xffff00
        );
    }

    // Method to update HUD data
    updateHudData(newData) {
        this.hudData = { ...this.hudData, ...newData };
        this.refreshHUD();
    }

    // Method to refresh HUD display
    refreshHUD() {
        // Update text elements
        this.healthText.setText(this.healthLabel + this.hudData.health + '/' + this.hudData.maxHealth);
        this.goldText.setText(this.goldLabel + this.hudData.gold);
        this.powerText.setText(this.powerLabel + this.hudData.power + '/' + this.hudData.maxPower);
        this.levelText.setText('Level: ' + this.hudData.level);
        this.experienceText.setText('XP: ' + this.hudData.experience + '/' + this.hudData.maxExperience);

        // Update progress bars
        this.updateProgressBar(this.healthBar, this.hudData.health, this.hudData.maxHealth);
        this.updateProgressBar(this.powerBar, this.hudData.power, this.hudData.maxPower);
        this.updateProgressBar(this.experienceBar, this.hudData.experience, this.hudData.maxExperience);
    }

    // Helper method to update progress bars
    updateProgressBar(bar, currentValue, maxValue) {
        const percentage = currentValue / maxValue;
        const barWidth = this.uiWidth - (this.padding * 2);
        const barX = this.uiX + this.padding;

        bar.setSize(barWidth * percentage, 8);
        bar.setPosition(barX + (barWidth * percentage) / 2, bar.y);
    }

    // Override updateLayout to handle full-width HUD positioning
    updateLayout() {
        super.updateLayout();

        // Refresh HUD elements after layout update
        if (this.healthText) {
            this.refreshHUD();
        }
    }

    setupEventListeners() {
        super.setupEventListeners();
        this.addEventListener('update-hud', this.updateHudData);
        this.addEventListener('show-hud', this.show);
        this.addEventListener('hide-hud', this.hide);
        this.addEventListener('update-health', this.updateHealth);
        this.addEventListener('update-gold', this.updateGold);
        this.addEventListener('update-power', this.updatePower);
        this.addEventListener('update-level', this.updateLevel);
        this.addEventListener('update-experience', this.updateExperience);
    }

    updateTextLayout() {
        const startY = this.uiY + this.padding;
        const lineHeight = this.fontSize + 2;

        this.healthText.setPosition(this.uiX + this.padding, startY);
        this.healthText.setStyle({fontSize: this.fontSize + 'px'});

        this.goldText.setPosition(this.uiX + this.padding, startY + lineHeight);
        this.goldText.setStyle({fontSize: this.fontSize + 'px'});

        this.powerText.setPosition(this.uiX + this.padding, startY + lineHeight * 2);
        this.powerText.setStyle({fontSize: this.fontSize + 'px'});

        this.levelText.setPosition(this.uiX + this.padding, startY + lineHeight * 3);
        this.levelText.setStyle({fontSize: this.fontSize + 'px'});

        this.experienceText.setPosition(this.uiX + this.padding, startY + lineHeight * 4);
        this.experienceText.setStyle({fontSize: this.labelFontSize + 'px'});
    }

    updateProgressBarsLayout() {
        const barWidth = this.uiWidth - (this.padding * 2);
        const barX = this.uiX + this.padding;
        const startY = this.uiY + this.padding;
        const lineHeight = this.fontSize + 4;

        // Health bar
        this.healthBarBg.setPosition(barX + barWidth / 2, startY + lineHeight * 0.5);
        this.healthBarBg.setSize(barWidth, 8);

        // Power bar
        this.powerBarBg.setPosition(barX + barWidth / 2, startY + lineHeight * 2.5);
        this.powerBarBg.setSize(barWidth, 8);

        // Experience bar
        this.experienceBarBg.setPosition(barX + barWidth / 2, startY + lineHeight * 4.5);
        this.experienceBarBg.setSize(barWidth, 8);

        this.updateProgressBarSizes();
    }

    updateProgressBarSizes() {
        const barWidth = this.uiWidth - (this.padding * 2);
        const barX = this.uiX + this.padding;
        const startY = this.uiY + this.padding;
        const lineHeight = this.fontSize + 4;

        // Health bar
        const healthPercent = this.hudData.health / this.hudData.maxHealth;
        this.healthBar.setSize(barWidth * healthPercent, 8);
        this.healthBar.setPosition(barX + (barWidth * healthPercent) / 2, startY + lineHeight * 0.5);

        // Power bar
        const powerPercent = this.hudData.power / this.hudData.maxPower;
        this.powerBar.setSize(barWidth * powerPercent, 8);
        this.powerBar.setPosition(barX + (barWidth * powerPercent) / 2, startY + lineHeight * 2.5);

        // Experience bar
        const expPercent = this.hudData.experience / this.hudData.maxExperience;
        this.experienceBar.setSize(barWidth * expPercent, 8);
        this.experienceBar.setPosition(barX + (barWidth * expPercent) / 2, startY + lineHeight * 4.5);
    }

    updateHealth(health, maxHealth = null) {
        this.hudData.health = health;
        if (maxHealth !== null) this.hudData.maxHealth = maxHealth;
        this.refreshHealthDisplay();
    }

    // In your HudScene, update the updateGold method to add gold instead of setting it:
    updateGold(goldAmount) {
        // Add to current gold instead of setting it
        this.hudData.gold += goldAmount;
        this.refreshGoldDisplay();

        console.log(`Gold updated: +${goldAmount}, Total: ${this.hudData.gold}`);
    }

    updatePower(power, maxPower = null) {
        this.hudData.power = power;
        if (maxPower !== null) this.hudData.maxPower = maxPower;
        this.refreshPowerDisplay();
    }

    updateLevel(level) {
        this.hudData.level = level;
        this.refreshLevelDisplay();
    }

    updateExperience(experience, maxExperience = null) {
        this.hudData.experience = experience;
        if (maxExperience !== null) this.hudData.maxExperience = maxExperience;
        this.refreshExperienceDisplay();
    }

    // Refresh display methods
    refreshHealthDisplay() {
        this.healthText.setText(this.healthLabel + this.hudData.health + '/' + this.hudData.maxHealth);
        this.updateProgressBarSizes();
    }

    refreshGoldDisplay() {
        this.goldText.setText(this.goldLabel + this.hudData.gold);
    }

    refreshPowerDisplay() {
        this.powerText.setText(this.powerLabel + this.hudData.power + '/' + this.hudData.maxPower);
        this.updateProgressBarSizes();
    }

    refreshLevelDisplay() {
        this.levelText.setText('Level: ' + this.hudData.level);
    }

    refreshExperienceDisplay() {
        this.experienceText.setText('XP: ' + this.hudData.experience + '/' + this.hudData.maxExperience);
        this.updateProgressBarSizes();
    }

    refreshHudDisplay() {
        this.refreshHealthDisplay();
        this.refreshGoldDisplay();
        this.refreshPowerDisplay();
        this.refreshLevelDisplay();
        this.refreshExperienceDisplay();
    }

    // Additional HUD methods
    getHudData() {
        return {...this.hudData};
    }

    setUpdateCallback(callback) {
        this.onHudUpdate = callback;
    }

    handleResize() {
        this.updateDimensions();
        this.updateHudLayout();
    }

    /**
     * Update HUD layout based on current dimensions
     */
    updateHudLayout() {
        if (!this.hudContainer) return;

        // Update HUD background
        this.hudBg.setPosition(
            this.hudX + this.hudWidth / 2,
            this.hudY + this.hudHeight / 2
        );
        this.hudBg.setSize(this.hudWidth, this.hudHeight);

        // Update text positions and styles
        this.updateTextLayout();
        this.updateProgressBarsLayout();
    }

    /**
     * Show HUD
     */
    showHud() {
        this.isHudActive = true;
        this.hudContainer.setVisible(true);
        this.game.events.emit('hud-shown');
    }

    /**
     * Hide HUD
     */
    hideHud() {
        this.isHudActive = false;
        this.hudContainer.setVisible(false);
        this.game.events.emit('hud-hidden');
    }

    /**
     * Focus HUD (bring to top)
     */
    hudFocus() {
        this.scene.run('hud');
        this.scene.bringToTop('hud');
    }

    /**
     * Toggle HUD visibility
     */
    toggleHud() {
        if (this.isHudActive) {
            this.hideHud();
        } else {
            this.showHud();
        }
    }


    /**
     * Clean up when scene is destroyed
     */
    destroy() {
        // Remove event listeners
        this.game.events.off('update-hud', this.updateHudData, this);
        this.game.events.off('show-hud', this.showHud, this);
        this.game.events.off('hide-hud', this.hideHud, this);
        this.game.events.off('update-health', this.updateHealth, this);
        this.game.events.off('update-gold', this.updateGold, this);
        this.game.events.off('update-power', this.updatePower, this);
        this.game.events.off('update-level', this.updateLevel, this);
        this.game.events.off('update-experience', this.updateExperience, this);
        this.scale.off('resize', this.handleResize, this);

        super.destroy();
    }
}