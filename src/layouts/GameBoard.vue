<template>
  <section class="game-board-container">
    <div class="title">
      <div style="width: 40px"></div>
      <div class="score-container">
        <div class="mine-amount-container">{{ minesAmount }}</div>
        <div class="face-container" @click="resetHandler">
          <div v-if="!gameOver && !victory">🙂</div>
          <div v-else-if="victory">😎</div>
          <div v-else>💀</div>
        </div>
        <div class="time-container">{{ timeWithFormat }}</div>
      </div>
      <div class="mode-container" @click="changeMode">
        <div v-if="mode === 'shovel'"><Shovel /></div>
        <div v-else><Flag2 /></div>
      </div>
    </div>
    <div class="chunk-pannel" @contextmenu.prevent="() => undefined">
      <div v-if="gameOver" class="mask">
        <h3>Game Over</h3>
        <h5>Click 💀 At The Top To Restart The Game</h5>
      </div>
      <div v-if="victory" class="mask">
        <h3>You Win</h3>
        <h4>Spend Time: {{ formatTimeToMMSS(time) }}</h4>
        <h5>Click 😎 At The Top To Restart The Game</h5>
      </div>
      <Chunk
        v-for="(cell, index) in role.cells"
        :key="index"
        :mode="mode"
        :bomb="cell.bomb"
        :revealed="cell.revealed"
        :flagged="cell.flagged"
        :adjacentBombs="cell.adjacentBombs"
        @clickEvent="revealChunkHandler('click', index)"
        @contentmenuEvent="revealChunkHandler('contentmenu', index)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import Chunk from "../components/Chunk.vue";
import Shovel from "../icons/Shovel.vue";
import Flag2 from "../icons/Flag2.vue";
import type { Cell, Mode } from "../types";
import { formatTimeToMMSS } from "../utils";

// 模式
const mode = ref<Mode>("shovel");

// 規則
const role = reactive({
  rows: 16,
  cols: 16,
  bombs: 40,
  cells: [] as Cell[],
});

// 是否結束
const gameOver = ref(false);
// 遊戲勝利
const victory = ref(false);

// 是否第一次點擊
const isFirstClick = ref(true);

// 剩餘地雷數
const minesAmount = computed(() => {
  let currFlags = 0;

  role.cells.forEach((item) => {
    if (item.flagged) currFlags++;
  });

  return String(role.bombs - currFlags).padStart(3, "0");
});

// 秒數
const time = ref(0);

// 格式化的時間
const timeWithFormat = computed(() => {
  return String(time.value).padStart(3, "0");
});

// 計時器
let timer: number | null = null;

/** 開始計時 */
function startTiming() {
  timer = setInterval(() => time.value++, 1000);
}

/** 結束計時 */
function endTimer() {
  timer && clearInterval(timer);
}

/** 切換模式 */
function changeMode() {
  mode.value = mode.value === "flag" ? "shovel" : "flag";
}

/** 處理點擊事件的邏輯 */
function revealChunkHandler(type: "click" | "contentmenu", index: number) {
  const cell = role.cells[index];
  const isShovel = mode.value === "shovel";
  const isClick = type === "click";

  if (isFirstClick.value) {
    startTiming();
    setAllBomb([index, ...getAdjacentCells(index)]);
    revealChunk(index);
    isFirstClick.value = false;
    return;
  }

  if (isClick && cell.revealed && !cell.bomb) {
    revealAdjacentCells(index);
    return;
  }

  if ((isShovel && isClick) || (!isShovel && !isClick)) {
    revealChunk(index);
    if (checkWin()) handleWin();
    return;
  }

  if ((isShovel && !isClick) || (!isShovel && isClick)) {
    toggleFlag(index);
    if (checkWin()) handleWin();
    return;
  }
}

/** 點擊已開啟的塊 (若周圍旗幟數已滿足該塊地雷數則自動開啟該周圍塊) */
function revealAdjacentCells(index: number) {
  const cell = role.cells[index];
  if (!cell.revealed || cell.adjacentBombs === 0) return;

  const adjacentIndices = getAdjacentCells(index);
  const flaggedCount = adjacentIndices.filter(
    (i) => role.cells[i].flagged
  ).length;

  if (flaggedCount === cell.adjacentBombs) {
    adjacentIndices.forEach((i) => {
      if (!role.cells[i].revealed && !role.cells[i].flagged) {
        revealChunk(i);
      }
    });
  }
}

/** 處理點擊塊 */
function revealChunk(index: number) {
  const cell = role.cells[index];
  // 若已經翻開或是插旗
  if (cell.revealed || cell.flagged) {
    if (mode.value === "flag") revealAdjacentCells(index);
    return;
  }
  cell.revealed = true;

  if (cell.bomb) {
    // 處理地雷
    revealChunk(index);
    endTimer();
    gameOver.value = true;
  } else if (cell.adjacentBombs === 0) {
    // 自動揭示相鄰空白單元格
    getAdjacentCells(index).forEach((adjIndex) => {
      revealChunk(adjIndex);
    });
  }
}

/** 設置旗幟 */
function toggleFlag(index: number) {
  const cell = role.cells[index];
  if (cell.revealed) return;
  cell.flagged = !cell.flagged;
}

/** 放置地雷 */
function setAllBomb(excludedIndex: number[]) {
  for (let i = 0; i < role.bombs; i++) {
    let index: number;
    do {
      index = Math.floor(Math.random() * role.cells.length);
    } while (role.cells[index].bomb || excludedIndex.includes(index));
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

/** 取到鄰近的格子 index */
function getAdjacentCells(index: number) {
  const adjacent = [] as number[];
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

/** 檢查是否獲勝 */
function checkWin() {
  let correctFlags = 0;
  let revealedNonMines = 0;

  for (const cell of role.cells) {
    if (cell.bomb && cell.flagged) {
      correctFlags++;
    } else if (!cell.bomb && cell.revealed) {
      revealedNonMines++;
    }
  }

  return (
    correctFlags === role.bombs ||
    revealedNonMines === role.cells.length - role.bombs
  );
}

/** 處理獲勝 */
async function handleWin() {
  // 自動打開所有未打開的格子
  role.cells.forEach((cell) => {
    if (!cell.revealed && !cell.bomb) {
      cell.revealed = true;
    }
  });

  endTimer();
  if (!gameOver.value) victory.value = true;
}

/** 重新開始 */
function resetHandler() {
  endTimer();
  time.value = 0;
  timer = null;
  gameOver.value = false;
  victory.value = false;
  isFirstClick.value = true;
  initGameBoard();
}

/** 初始化 */
function initGameBoard() {
  role.cells = Array(role.rows * role.cols)
    .fill(0)
    .map(() => ({
      bomb: false,
      revealed: false,
      flagged: false,
      adjacentBombs: 0,
    }));
}

onMounted(() => {
  initGameBoard();
});
</script>

<style scoped>
.game-board-container {
  width: min-content;
  padding: 0.75rem;
  background-color: #333;
  border-radius: 0.5rem;
}

.chunk-pannel {
  width: min-content;
  height: min-content;
  display: grid;
  grid-template-columns: repeat(16, min-content);
  grid-template-rows: repeat(16, min-content);
  gap: 3px;
  position: relative;
}

.mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  background-color: #ffffff90;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.6rem;
  font-family: "Jersey 15", serif;
}

.mask h3 {
  font-size: 7.6rem;
}

.mask h4 {
  color: #ff6d00;
  font-size: 1.7rem;
}

.mask h5 {
  color: #555;
  font-size: 1.5rem;
}

.title {
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  background-color: #d8d8d8;
}

.score-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.mine-amount-container,
.time-container {
  width: 100px;
  height: 44px;
  padding: 0 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #333;
  font-size: 2rem;
  font-family: "Wallpoet", serif;
  color: red;
}

.face-container {
  width: 44px;
  height: 44px;
  font-size: 1.6rem;
  background-color: #d8d8d8;
  border: 3px solid;
  border-color: #f0f0f0 #999 #999 #f0f0f0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
}

.mode-container {
  width: 40px;
  height: 40px;
  font-size: 1.6rem;
  background-color: #d8d8d8;
  border: 3px solid;
  border-color: #f0f0f0 #999 #999 #f0f0f0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  margin-right: 4px;
}
</style>
