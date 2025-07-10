import Phaser from 'phaser';
import EasyStar from 'easystarjs';
import NPC from '../entities/NPC';
import Dialogue from '../entities/Dialogue';
import Hero from '../entities/Hero';
import GridManager from '../managers/GridManager';
import VisualFeedbackManager from '../managers/VisualFeedbackManager';
import Utils from '../Utils';
import DialogSystem from '../managers/DialogSystem';
import DialogUIManager from '../managers/DialogUIManager';

export default class BaseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BaseScene' });
        this.initializeProperties();
        this.dialogSystem = new DialogSystem();
    }

    /**
     * Initializes the dialog system and UI manager
     * Can be overridden by child classes to customize dialog behavior
     */
    initializeDialogSystem() {
        // Create dialog UI manager
        this.dialogUI = new DialogUIManager(this);

        // Set up callbacks
        this.dialogUI.setChoiceCallback(this.makeChoice.bind(this));
        this.dialogUI.setContinueCallback(this.continueDialog.bind(this));
        this.dialogUI.setEndCallback(() => {
            this.isDialogActive = false;
            this.hasStartedDialogue = false;
            this.dialogSystem.currentDialog = null;
        });
    }

    initializeProperties() {
        // Grid configuration
        this.gridSize = 10;
        this.tileSize = 64;

        // Managers
        this.gridManager = null;
        this.visualFeedback = null;

        // Pathfinding
        this.easystar = new EasyStar.js();

        // Game objects
        this.hero = null;
        this.npc = null;
        this.dialogue = null;

        this.hasStartedDialogue = false;
        this.dialogueDelay = 1000; // 1 second delay before starting dialogue
        this.dialogueTimer = null;

        this.utils = new Utils();
    }

    preload() {
        this.load.spritesheet('hero', 'https://labs.phaser.io/assets/sprites/dude.png', {
            frameWidth: 32,
            frameHeight: 48
        });
        this.load.json('dialogs', 'dialogs/example-dialog.json');

    }

    create() {

        this.scene.get('ParentScene').resize();

        this.setupManagers();
        this.setupPathfinding();
        this.createGameObjects();
        this.setupGameSystems();

        // Initialize dialog system and UI
        this.initializeDialogSystem();
        const dialogData = this.cache.json.get('dialogs');
        this.dialogSystem.loadDialogData(dialogData);
    }

    // #region Setup Methods
    setupManagers() {
        this.gridManager = new GridManager(this, this.gridSize, this.tileSize);
        this.visualFeedback = new VisualFeedbackManager(this, this.tileSize);
    }

    setupPathfinding() {
        this.easystar.setGrid(this.gridManager.grid);
        this.easystar.setAcceptableTiles([0]);
        this.easystar.enableCornerCutting();
        this.easystar.setIterationsPerCalculation(1000);
    }

    createGameObjects() {
        this.createAnimations();
        this.hero = new Hero(this, 0, 0, 'hero');
        this.npc = new NPC(this, 8 * this.tileSize + this.tileSize/2, 2 * this.tileSize + this.tileSize/2, 'dummy');
        this.dialogue = new Dialogue(this);
    }

    setupGameSystems() {
        this.setupCamera();
        this.setupInput();
        this.gridManager.drawGrid();
    }
    // #endregion

    // #region Input Handling
    // Упрощаем обработку клавиатуры - оставляем только ESC для закрытия
    setupInput() {
        this.input.on('pointerdown', this.handleClick.bind(this));
        this.input.keyboard.on('keydown-ESC', this.handleEscKey.bind(this));
        this.input.on('pointermove', this.handlePointerMove.bind(this));
    }

    handleClick(pointer) {
        if (!this.hero.canStartNewMovement()) return;

        const gridPos = this.gridManager.screenToGrid(pointer.x, pointer.y);

        if (!this.gridManager.isValidPosition(gridPos)) {
            console.log('Target position is outside the grid!');
            return;
        }

        if (this.gridManager.grid[gridPos.y][gridPos.x] === 1) {
            console.log('Cannot move to obstacle position!');
            return;
        }

        this.findPath(gridPos);
    }

    handleEscKey(event) {
        if (this.isDialogActive) {
            this.endDialog();
        }
    }

    handlePointerMove(pointer) {
        const gridPos = this.gridManager.screenToGrid(pointer.x, pointer.y);
        if (this.gridManager.isValidPosition(gridPos)) {
            this.visualFeedback.updateMouseHighlight(gridPos.x, gridPos.y);
        }
    }
    // #endregion

    // Убираем старые обработчики клавиш
    handleSpaceKey(event) {
        // Убираем обработку Space для диалогов
        if (this.npc && this.npc.canInteract && !this.isDialogActive) {
            this.npc.interact();
        }
    }

    // #region Game Logic
    findPath(targetPos) {
        const npcGridX = Math.floor(this.npc.x / this.tileSize);
        const npcGridY = Math.floor(this.npc.y / this.tileSize);

        if (targetPos.x === npcGridX && targetPos.y === npcGridY) {
            console.log('Cannot move through NPC!');
            return;
        }

        const heroPos = this.hero.getGridPosition();
        this.easystar.findPath(
            heroPos.x,
            heroPos.y,
            targetPos.x,
            targetPos.y,
            this.handlePathFound.bind(this)
        );
        this.easystar.calculate();
    }

    handlePathFound(path) {
        if (!path) {
            console.log('No path found!');
            return;
        }

        const hasObstacle = path.some(point => 
            this.gridManager.grid[point.y][point.x] === 1
        );

        if (hasObstacle) {
            console.log('Path goes through obstacle!');
            return;
        }

        this.hero.moveTo(path);
    }
    // #endregion


    update() {
        this.visualFeedback.updateHighlightTile(this.hero.getGridPosition());
        if (this.npc) {
            this.npc.update();
        }

        const dummyGridX = this.hero.getGridPosition().x;
        const dummyGridY = this.hero.getGridPosition().y;

        const npcGridX = Math.floor(this.npc.x / this.tileSize);
        const npcGridY = Math.floor(this.npc.y / this.tileSize);

        const isNeighbor = this.utils.isNeighborCell(npcGridX, npcGridY, dummyGridX, dummyGridY);

        if (isNeighbor && !this.hasStartedDialogue) {
            // Start dialogue timer when dummy is in neighboring cell
            if (!this.dialogueTimer) {
                this.dialogueTimer = this.time.delayedCall(this.dialogueDelay, () => {
                    this.npc.interact();
                    this.hasStartedDialogue = true;
                });
            }
            this.npc.setAlpha(1); // Full opacity when neighbor
        } else if (!isNeighbor) {
            this.cancelDialogueTimer();
            this.hasStartedDialogue = false; // Reset dialogue state when not neighbors
            this.npc.setAlpha(0.7); // Set to less opaque when not neighbor
        }

    }

    cancelDialogueTimer() {
        if (this.dialogueTimer) {
            this.dialogueTimer.destroy();
            this.dialogueTimer = null;
        }
    }

    setupCamera() {
        this.cameras.main.setBackgroundColor('rgba(160,152,152,0.93)');
        this.cameras.main.startFollow(this.hero, true, 0.1, 0.1);
    }

    createAnimations() {
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('hero', { start: 4, end: 4 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'walk_left',
            frames: this.anims.generateFrameNumbers('hero', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'walk_right',
            frames: this.anims.generateFrameNumbers('hero', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
    }

    // Dialog methods are now handled by DialogUIManager

    /**
     * Starts a dialog with the given ID
     * @param {string} dialogId - The ID of the dialog to start
     */
    startDialog(dialogId) {
        const dialogData = this.dialogSystem.startDialog(dialogId);
        if (dialogData) {
            this.isDialogActive = true; // Block movement
            this.dialogUI.showDialog(dialogData);
        }
    }

    /**
     * Handles a choice selection in the dialog
     * @param {number} choiceIndex - The index of the selected choice
     */
    makeChoice(choiceIndex) {
        console.log(`Making choice: ${choiceIndex}`);
        const nextDialog = this.dialogSystem.makeChoice(choiceIndex);
        if (nextDialog) {
            this.dialogUI.showDialog(nextDialog);
        } else {
            this.endDialog();
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
            this.endDialog();
        }
    }

    /**
     * Ends the current dialog
     */
    endDialog() {
        this.dialogUI.endDialog();
    }
}
