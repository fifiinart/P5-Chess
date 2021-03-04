export const BOARD_FILL_RATIO = 7 / 8;
export const BOARD_WIDTH = 8;
export const BOARD_HEIGHT = 8;
export const BOARD_TILES = 64;

export const WINDOW_FILL_RATIO = 1;

export enum Piece {
  None,
  White,
  Black,

  Pawn = 1 << 2,
  Rook = 2 << 2,
  Knight = 3 << 2,
  Bishop = 4 << 2,
  Queen = 5 << 2,
  King = 6 << 2
}

export const FenPiece = {
  P: Piece.White | Piece.Pawn,
  p: Piece.Black | Piece.Pawn,
  R: Piece.White | Piece.Rook,
  r: Piece.Black | Piece.Rook,
  N: Piece.White | Piece.Knight,
  n: Piece.Black | Piece.Knight,
  B: Piece.White | Piece.Bishop,
  b: Piece.Black | Piece.Bishop,
  Q: Piece.White | Piece.Queen,
  q: Piece.Black | Piece.Queen,
  K: Piece.White | Piece.King,
  k: Piece.Black | Piece.King,
}
export const SPRITE_SIZE = 180;
export const PIECE_ARRANGEMENTS = Array(2).fill(null).map((_, i) => [Piece.King, Piece.Queen, Piece.Bishop, Piece.Knight, Piece.Rook, Piece.Pawn].map(x => x | (i + 1)))
export const STARTING_POSITION = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"

export interface BoardState {
  whitePawnsThatHaventMoved: number[]
  blackPawnsThatHaventMoved: number[]
  colorToMove: number
}