import { BoardState, BOARD_HEIGHT, BOARD_WIDTH, Piece } from "./constants";
import { getPieceColor, getPieceType } from "./util";

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

export function generateMoves(position: number, piece: number, board: number[], boardState: BoardState): number[] {
  return [
    generateSlidingMoves(position, piece, board, boardState),
    generatePawnMoves(position, piece, board, boardState)
  ].flat();
}

function generatePawnMoves(position: number, piece: number, board: number[], boardState: BoardState): number[] {
  const validMoves: number[] = [];
  if (getPieceType(piece) === Piece.Pawn) {
    const direction = getPieceColor(piece) === Piece.White ? Direction.U : Direction.D
    const captureDirections = getPieceColor(piece) === Piece.White ? [Direction.UL, Direction.UR] : [Direction.DL, Direction.DR]
    const haventMoved = getPieceColor(piece) === Piece.White ? boardState.whitePawnsThatHaventMoved : boardState.blackPawnsThatHaventMoved

    // Test standard pawn move
    const testPosition = position + direction;
    if (board[testPosition] === Piece.None && moveContainedInBoard(position, testPosition)) validMoves.push(testPosition);

    // Test capture ability
    for (const dir of captureDirections) {
      const testPosition = position + dir;
      if (
        getPieceColor(board[testPosition]!) === (boardState.colorToMove === Piece.White ? Piece.Black : Piece.White) && // we're actually capturing something
        moveContainedInBoard(position, testPosition) // the move doesnt go across a board edge
      ) validMoves.push(testPosition);
    }

    // Test double pawn move
    if (haventMoved.includes(position)) {
      const testPosition = position + (direction * 2);
      if (board[testPosition] === Piece.None && moveContainedInBoard(position, testPosition)) validMoves.push(testPosition);
    }
  }
  return validMoves;
}

function generateSlidingMoves(position: number, piece: number, chessBoardState: number[], boardState: BoardState): number[] {
  let directions: Direction[] = [];

  const positions: number[] = [];

  if (getPieceType(piece) === Piece.Queen || getPieceType(piece) === Piece.Rook) {
    directions.push(
      Direction.U,
      Direction.R,
      Direction.D,
      Direction.L
    )
  }
  if (getPieceType(piece) === Piece.Queen || getPieceType(piece) === Piece.Bishop) {
    directions.push(
      Direction.UR,
      Direction.DR,
      Direction.DL,
      Direction.UL
    )
  }

  for (const direction of directions) {
    for (let i = 0; i < Infinity; i++) {
      const testPosition = position + direction * i;
      const nextPosition = position + direction * (i + 1);

      if (testPosition === position) {
        if (!moveContainedInBoard(testPosition, nextPosition)) break;
        continue
      };

      if (getPieceColor(chessBoardState[testPosition]!) === boardState.colorToMove) break;

      positions.push(testPosition);

      if (getPieceColor(chessBoardState[testPosition]!) === (boardState.colorToMove === Piece.White ? Piece.Black : Piece.White)) break;
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
  return true;
}