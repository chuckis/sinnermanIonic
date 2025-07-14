import { Scene } from 'phaser';

/**
 * BaseUIScene - Base class for UI scenes that can be nested within other scenes
 * Provides common functionality for responsive UI, event handling, and lifecycle management
 */
export class BaseUIScene extends Scene {
    constructor(sceneKey) {
        super({ key: sceneKey });
        this.sceneKey = sceneKey;
        this.parentScene = null;
        this.isActive = false;
        this.uiContainer = null;
        this.config = {};
        this.eventListeners = new Map();
    }

    /**
     * Initialize the scene with configuration data
     * @param {Object} data - Configuration and parent scene reference
     */
    init(data) {
        this.parentScene = data.parentScene;
        this.isActive = false;

        // Merge default config with provided config
        this.config = {
            ...this.getDefaultConfig(),
            ...data.config
        };

        // Initialize scene-specific data
        this.initializeSceneData(data);
    }

    /**
     * Get default configuration - override in child classes
     */
    getDefaultConfig() {
        return {
            relativeWidth: 0.5,
            relativeHeight: 0.3,
            anchorX: 0.5,
            anchorY: 0.5,
            backgroundColor: 0x000000,
            backgroundAlpha: 0.8,
            borderColor: 0xffffff,
            textColor: '#ffffff',
            padding: 20
        };
    }

    /**
     * Initialize scene-specific data - override in child classes
     */
    initializeSceneData(data) {
        // Override in child classes
    }

    /**
     * Create the UI scene
     */
    create() {
        this.updateDimensions();
        this.createUI();
        this.setupEventListeners();
        this.onSceneCreated();

        // Set up resize handling
        this.scale.on('resize', this.handleResize, this);
    }

    /**
     * Update UI dimensions based on current camera/screen size
     */
    updateDimensions() {
        const camera = this.cameras.main;
        const sceneWidth = camera.width;
        const sceneHeight = camera.height;

        // Calculate responsive dimensions
        this.uiWidth = sceneWidth * this.config.relativeWidth;
        this.uiHeight = sceneHeight * this.config.relativeHeight;

        // Calculate position based on anchors
        this.uiX = (sceneWidth * this.config.anchorX) - (this.uiWidth * this.config.anchorX);
        this.uiY = (sceneHeight * this.config.anchorY) - (this.uiHeight * this.config.anchorY);

        // Update responsive properties
        this.updateResponsiveProperties(sceneWidth, sceneHeight);
    }

    /**
     * Update responsive properties like font sizes - override in child classes
     */
    updateResponsiveProperties(sceneWidth, sceneHeight) {
        this.fontSize = Math.max(14, Math.floor(sceneWidth / 50));
        this.padding = Math.max(20, Math.floor(sceneWidth / 40));
    }

    /**
     * Create UI elements - override in child classes
     */
    createUI() {
        // Create main container
        this.uiContainer = this.add.container(0, 0);
        this.uiContainer.setDepth(this.getUIDepth());

        // Create background
        this.createBackground();
    }

    /**
     * Get UI depth - override in child classes
     */
    getUIDepth() {
        return 1000;
    }

    /**
     * Create background rectangle
     */
    createBackground() {
        this.background = this.add.rectangle(
            this.uiX + this.uiWidth / 2,
            this.uiY + this.uiHeight / 2,
            this.uiWidth,
            this.uiHeight,
            this.config.backgroundColor,
            this.config.backgroundAlpha
        );
        this.background.setStrokeStyle(2, this.config.borderColor);
        this.uiContainer.add(this.background);
    }

    /**
     * Set up event listeners - override in child classes to add specific listeners
     */
    setupEventListeners() {
        // Common event listeners can be added here
        // Child classes should call super.setupEventListeners() and add their own
    }

    /**
     * Called after scene is created - override in child classes
     */
    onSceneCreated() {
        // Override in child classes
    }

    /**
     * Handle resize events
     */
    handleResize() {
        this.updateDimensions();
        this.updateLayout();
    }

    /**
     * Update layout based on current dimensions - override in child classes
     */
    updateLayout() {
        if (!this.uiContainer || !this.background) return;

        // Update background
        this.background.setPosition(
            this.uiX + this.uiWidth / 2,
            this.uiY + this.uiHeight / 2
        );
        this.background.setSize(this.uiWidth, this.uiHeight);
    }

    /**
     * Add event listener with automatic cleanup
     */
    addEventListener(eventName, handler, context = this) {
        this.game.events.on(eventName, handler, context);
        this.eventListeners.set(eventName, { handler, context });
    }

    /**
     * Remove specific event listener
     */
    removeEventListener(eventName) {
        const listener = this.eventListeners.get(eventName);
        if (listener) {
            this.game.events.off(eventName, listener.handler, listener.context);
            this.eventListeners.delete(eventName);
        }
    }

    /**
     * Show the UI
     */
    show() {
        this.isActive = true;
        if (this.uiContainer) {
            this.uiContainer.setVisible(true);
        }
        this.onShow();
    }

    /**
     * Hide the UI
     */
    hide() {
        this.isActive = false;
        if (this.uiContainer) {
            this.uiContainer.setVisible(false);
        }
        this.onHide();
    }

    /**
     * Toggle UI visibility
     */
    toggle() {
        if (this.isActive) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Called when UI is shown - override in child classes
     */
    onShow() {
        this.game.events.emit(`${this.sceneKey}-shown`);
    }

    /**
     * Called when UI is hidden - override in child classes
     */
    onHide() {
        this.game.events.emit(`${this.sceneKey}-hidden`);
    }

    /**
     * Check if UI is active
     */
    isUIActive() {
        return this.isActive;
    }

    /**
     * Bring scene to top
     */
    bringToTop() {
        this.scene.bringToTop(this.sceneKey);
    }

    /**
     * Clean up when scene is destroyed
     */
    destroy() {
        // Remove all event listeners
        this.eventListeners.forEach((listener, eventName) => {
            this.game.events.off(eventName, listener.handler, listener.context);
        });
        this.eventListeners.clear();

        // Remove resize listener
        this.scale.off('resize', this.handleResize, this);

        super.destroy();
    }
}

// Export theatre event emitter
const theatre = new Phaser.Events.EventEmitter();
export { theatre };

// Export individual classes
export default BaseUIScene;