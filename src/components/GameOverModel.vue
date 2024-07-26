<template>
  <div class="game-over">
    <div class="container">
      <img src="" alt="" />
      <h3>Game Over</h3>
      <button>Restart</button>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.game-over {
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999;
  background-color: #00000090;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  width: 400px;
  height: 300px;
  background-color: #fff;
}
</style>
