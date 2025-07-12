import { Game, AUTO, Scale} from "phaser";

import {Preloader} from "@/game/scenes/Preloader.js";

import {GameOver} from "@/game/scenes/GameOver.js";
import BaseScene from "@/game/scenes/BaseScene.js";
import DialogUIScene from "@/game/scenes/DialogUiScene.js";

export function launch() {
    return new Game({
            type: AUTO,
            scale: {
                mode: Scale.RESIZE,
                width: window.innerWidth * window.devicePixelRatio,
                autoCenter: Scale.CENTER_BOTH,
                height: window.innerHeight * window.devicePixelRatio,
            },
            parent: "game",
            backgroundColor: "#201726",
            physics: {
                default: "arcade",
            },
            scene: [
                Preloader,
                GameOver,
                BaseScene,
                DialogUIScene
            ]
        }
    )
}