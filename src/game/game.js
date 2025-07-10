import { Game, AUTO, Scale} from "phaser";
import {Boot} from "@/game/scenes/Boot.js";
import {Preloader} from "@/game/scenes/Preloader.js";
import {MainMenu} from "@/game/scenes/MainMenu.js";
import {GameOver} from "@/game/scenes/GameOver.js";
import {Example} from "@/game/scenes/Example.js";
import BaseScene from "@/game/scenes/BaseScene.js";
import ParentScene from "@/game/scenes/ParentScene.js";

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
                Boot,
                Preloader,
                MainMenu,
                Game,
                GameOver,
                Example,
                BaseScene,
                ParentScene
            ]
        }
    )
}