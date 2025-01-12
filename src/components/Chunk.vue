<template>
  <div
    class="chunk-container"
    :class="[{ revealed, bomb, flagged }]"
    :style="chunkStyle"
    @click="emit('clickEvent')"
    @contextmenu.prevent="emit('contentmenuEvent')"
  >
    <span v-if="revealed && !bomb" class="text-cell">{{ chunkText }}</span>
    <span v-if="flagged"><Flag /></span>
    <span v-if="revealed && bomb"><Minesweeper /></span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Mode } from "../types";
import Flag from "../icons/Flag.vue";
import Minesweeper from "../icons/Minesweeper.vue";

interface Props {
  mode: Mode;
  bomb: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacentBombs: number;
}

interface Emits {
  (e: "clickEvent"): void;
  (e: "contentmenuEvent"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const chunkText = computed(() => {
  if (!props.adjacentBombs) return "";

  return props.adjacentBombs;
});

const chunkStyle = computed(() => {
  if (!props.revealed || props.bomb) return {};

  const colorMap: Record<number, string> = {
    1: "blue",
    2: "green",
    3: "red",
    4: "purple",
    5: "maroon",
    6: "turquoise",
    7: "black",
    8: "gray",
  };

  return {
    color: colorMap[props.adjacentBombs] || "black", // 預設顏色為黑色
  };
});
</script>

<style scoped>
.chunk-container {
  width: 35px;
  height: 35px;
  border-radius: 3px;
  cursor: pointer;
  border: 5px solid;
  border-color: #f0f0f0 #999 #999 #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  background-color: #d8d8d8;
  font-size: 1.8rem;
  font-family: "Jersey 15", serif;
}

.revealed {
  background-color: #b9b3b3;
  width: 35px;
  height: 35px;
  border: 3px solid #969b9a;
}

.revealed.bomb {
  background-color: #ff2222;
  width: 35px;
  height: 35px;
  border: 1px solid #444;
}

.flagged {
  width: 35px;
  height: 35px;
  border-radius: 3px;
  cursor: pointer;
  border: 5px solid;
  border-color: #f0f0f0 #999 #999 #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}
</style>
