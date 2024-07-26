<template>
  <div class="game-board">
    <Chunk
      v-for="(cell, index) in role.cells"
      :key="index"
      :bomb="cell.bomb"
      :revealed="cell.revealed"
      :flagged="cell.flagged"
      :adjacentBombs="cell.adjacentBombs"
      @reveal="revealCell(index)"
      @toggle-flag="toggleFlag(index)"
    />
    <GameOverModel v-if="gameOver" />
  </div>
</template>

<script setup lang="ts">
import Chunk from "./Chunk.vue";
import GameOverModel from "./GameOverModel.vue";
import { ref, reactive, onMounted } from "vue";

const gameOver = ref(false);

const role = reactive({
  rows: 20,
  cols: 20,
  bombs: 80,
  cells: [] as any[],
});

onMounted(() => {
  initBoard();
});

function initBoard() {
  role.cells = Array(role.rows * role.cols)
    .fill(0)
    .map(() => ({
      bomb: false,
      revealed: false,
      flagged: false,
      adjacentBombs: 0,
    }));

  // 放置地雷
  for (let i = 0; i < role.bombs; i++) {
    let index;
    do {
      index = Math.floor(Math.random() * role.cells.length);
    } while (role.cells[index].bomb);
    role.cells[index].bomb = true;
  }

  role.cells.forEach((cell, index) => {
    if (!cell.bomb) {
      let adjacentBombs = 0;
      getAdjacentCells(index).forEach((adjIndex) => {
        if (role.cells[adjIndex].bomb) {
          adjacentBombs++;
        }
      });
      cell.adjacentBombs = adjacentBombs;
    }
  });
}

function getAdjacentCells(index: number) {
  const adjacent = [] as any[];
  const { rows, cols } = role;
  const row = Math.floor(index / cols);
  const col = index % cols;
  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      if (r === 0 && c === 0) continue;
      const adjRow = row + r;
      const adjCol = col + c;
      if (adjRow >= 0 && adjRow < rows && adjCol >= 0 && adjCol < cols) {
        adjacent.push(adjRow * cols + adjCol);
      }
    }
  }
  return adjacent;
}

function revealCell(index: number) {
  const cell = role.cells[index];
  if (cell.revealed || cell.flagged) return;
  cell.revealed = true;
  if (cell.bomb) {
    // 處理地雷
    revealCell(index);
    gameOver.value = true;
    // initBoard();
  } else if (cell.adjacentBombs === 0) {
    // 自動揭示相鄰空白單元格
    getAdjacentCells(index).forEach((adjIndex) => {
      revealCell(adjIndex);
    });
  }
}

function toggleFlag(index: number) {
  const cell = role.cells[index];
  if (cell.revealed) return;
  cell.flagged = !cell.flagged;
}
</script>

<style scoped>
.game-board {
  margin: 0 auto;
  width: fit-content;
  display: grid;
  grid-template-columns: repeat(20, 40px);
  justify-content: center;
  align-items: center;
}
</style>
