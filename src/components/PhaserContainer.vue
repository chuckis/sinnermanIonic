
<script setup lang="ts">
import { ref } from 'vue'
import { IonButton } from '@ionic/vue';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-expect-error
import { launch } from '@/game/game.js';
import {Game} from "phaser";

// binds to the v-if on our button to toggle visibility
const showButton = ref(true);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let gameInstance: Game;

function handleClickStart() {
  // hides launch button
  showButton.value = false;

  // Runs the launch function
  gameInstance = launch();
}
</script>

<template>
  <div id="game">
    <ion-button v-if="showButton" @click="handleClickStart">Start
    </ion-button>
  </div>
</template>

<style scoped>
#game {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
}
</style>