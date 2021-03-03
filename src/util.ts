import { Vector } from "p5";
import { BOARD_TILES, BOARD_WIDTH, FenPiece, BOARD_HEIGHT } from "./constants";

export function parseFenString(fenString: string) {
  const pieces: number[] = Array(BOARD_TILES).fill(0);
  let position = 0;
  for (const char of fenString) {
    if (char === '/') {
      position = Math.floor(position / BOARD_WIDTH) * BOARD_WIDTH
      continue;
    };

    if (!Number.isNaN(+char) && +char <= 8) {
      position += +char;
    } else {
      if (char in FenPiece) {
        pieces[position++] = FenPiece[<keyof typeof FenPiece>char];
        continue
      }
      throw new Error("Invalid FEN string")
    }
  }
  return pieces;
}

export const getPositionFromVector = (vector: Vector) => vector.y * BOARD_WIDTH + vector.x;
export const getVectorFromPosition = (position: number) => {
  const v = new Vector();
  v.x = position % BOARD_WIDTH;
  v.y = Math.floor(position / BOARD_HEIGHT)
  return v;
}