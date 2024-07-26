<template>
  <div
    :class="['cell', { revealed, bomb, flagged }]"
    @click="revealCell"
    @contextmenu.prevent="toggleFlag"
  >
    <span v-if="revealed && !bomb" class="text-cell">{{ chunkText }}</span>
    <span v-if="flagged" class="flag-cell">🚩</span>
    <span v-if="revealed && bomb" class="bomb-cell">💣</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface ChunkProps {
  bomb: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacentBombs: number;
}

interface ChunkEmits {
  (e: "reveal"): void;
  (e: "toggle-flag"): void;
}

const props = defineProps<ChunkProps>();

const emit = defineEmits<ChunkEmits>();

const chunkText = computed(() => {
  if (props.adjacentBombs === 0) {
    return "";
  } else {
    return props.adjacentBombs;
  }
});

function revealCell() {
  emit("reveal");
}

function toggleFlag() {
  emit("toggle-flag");
}
</script>

<style scoped>
.cell {
  width: 30px;
  height: 30px;
  border: 5px solid;
  border-color: #f0f0f0 #999 #999 #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  background-color: #d8d8d8;
}
.revealed {
  background-color: #c9c9c9;
  width: 38px;
  height: 38px;
  border: 1px solid #444;
}
.revealed.bomb {
  background-color: #ff2222;
  width: 38px;
  height: 38px;
  border: 1px solid #444;
}
.flagged {
  background-color: #ffc558;
  width: 38px;
  height: 38px;
  border: 1px solid #444;
}
.text-cell {
  font-size: 1.25rem;
  font-weight: 900;
  font-family: "Black Ops One", system-ui;
  color: #222dff;
}
.flag-cell {
  font-size: 1.25rem;
}
.bomb-cell {
  font-size: 1.25rem;
}
</style>
