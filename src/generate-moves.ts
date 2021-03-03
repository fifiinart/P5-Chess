import { BOARD_HEIGHT, BOARD_WIDTH } from "./constants";

export enum Direction {
  U = -8,
  UR = -7,
  R = 1,
  DR = 9,
  D = 8,
  DL = 7,
  L = -1,
  UL = -9
}

export function generateMoves(position: number, piece: number, chessBoardState: number[], whiteToMove: boolean): number[] {
  return generateSlidingMoves(position, piece, chessBoardState, whiteToMove)
}
export function generateSlidingMoves(position: number, piece: number, chessBoardState: number[], whiteToMove: boolean): number[] {
  piece;
  chessBoardState;
  const positions: number[] = [];
  const directions = [
    Direction.U,
    Direction.UR,
    Direction.R,
    Direction.DR,
    Direction.D,
    Direction.DL,
    Direction.L,
    Direction.UL
  ]
  for (const direction of directions) {
    console.log(Direction[direction])
    for (let i = 0; i < Infinity; i++) {
      const testPosition = position + direction * i;
      const nextPosition = position + direction * (i + 1);

      if (testPosition === position) {
        if (!moveContainedInBoard(testPosition, nextPosition)) break;
        continue
      };

      whiteToMove

      positions.push(testPosition);
      console.log(testPosition)

      if (!moveContainedInBoard(testPosition, nextPosition)) break;
    }
  }
  return positions
}

function moveContainedInBoard(testPosition: number, nextPosition: number): boolean {
  if (nextPosition < 0) return false; // next position is above board
  if (nextPosition >= BOARD_WIDTH * BOARD_HEIGHT) return false; // next position is below board
  if (testPosition % BOARD_WIDTH === BOARD_WIDTH - 1 && nextPosition % BOARD_WIDTH === 0) return false; // next position is off right edge
  if (testPosition % BOARD_WIDTH === 0 && nextPosition % BOARD_WIDTH === BOARD_WIDTH - 1) return false; // next position is off left edge
  //if (((chessBoardState[nextPosition]! & 3) === Piece.White) === whiteToMove) break;
  return true;
}