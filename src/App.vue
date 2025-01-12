<template>
  <main>
    <GameBoard />
  </main>
</template>

<script setup lang="ts">
import GameBoard from "./layouts/GameBoard.vue";
</script>

<style scoped>
main {
  width: min-content;
  background-color: #333;
  position: relative;
  border-radius: 0.5rem;
}

main::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: scale(1.03);
  background-color: #555;
  z-index: -1;
  border-radius: 0.9rem;
}
</style>
