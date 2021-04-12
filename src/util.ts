import { Vector } from "p5";
import { BOARD_TILES, BOARD_WIDTH, FenPiece, BOARD_HEIGHT, BoardState, Piece } from "./constants";

export function parseFenString(fenString: string, state: BoardState) {
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
        if (char === 'P') state.whitePawnsThatHaventMoved.push(position);
        if (char === 'p') state.blackPawnsThatHaventMoved.push(position);
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

export const getPieceColor = (piece: number) => piece & 0b00011;
export const getPieceType = (piece: number) => piece & 0b11100;

export const getOppositeColor = (color: number) => {
  if (color === Piece.White) return Piece.Black;
  if (color === Piece.Black) return Piece.White;
  return Piece.None;
}

export const changePieceColor = (piece: number, color: number = getOppositeColor(getPieceColor(piece))) => color | getPieceType(piece)
export const changePieceType = (piece: number, type: number) => getPieceColor(piece) | type