export type Mode = "shovel" | "flag";

export interface Cell {
  bomb: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacentBombs: number;
}

export type revealChunkType = "click" | "contentmenu";
