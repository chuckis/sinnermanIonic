export const gameState = {
    score: 0,
    gameOver: false,
    moveLeft: false,
    moveRight: false,
    moveUp: false,
    canPause: true,
    immune: false,
    screen: {
        width: null,
        height: null,
    },
    gameArea: {
        width: null,
        height: null,
        leftEdge: null,
        rightEdge: null,
    },
    dialogArea: {
        width: null,
        height: null,
    },
    pauseArea: {
        x: null,
        y: null,
        width: null,
        height: null,
    },
    scaleValues: {
        background: null,
        platform: null,
        player: 0.25,
    },
    scaledPlatformHeight: null,
    scaledPlayerHeight: null,
    halfScaledPlayerHeight: null,
};