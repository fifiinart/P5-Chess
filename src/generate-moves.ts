import { BoardState, BOARD_HEIGHT, BOARD_WIDTH, Piece } from "./constants";
import { getOppositeColor, getPieceColor, getPieceType } from "./util";

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

export enum KnightDirection {
  UL = -17,
  UR = -15,
  RU = -6,
  RD = 10,
  DR = 17,
  DL = 15,
  LD = 6,
  LU = -10
}

export function generateMoves(position: number, piece: number, board: number[], boardState: BoardState): number[] {
  let baseMoves: number[] = [];
  switch (getPieceType(piece)) {
    case Piece.Knight:
      baseMoves.push(...generateKnightMoves(position, piece, board, boardState))
      break;
    case Piece.Pawn:
      baseMoves.push(...generatePawnMoves(position, piece, board, boardState))
      break;
    case Piece.King:
      baseMoves.push(...generateKingMoves(position, piece, board, boardState))
      break;
    case Piece.Bishop:
    case Piece.Rook:
    case Piece.Queen:
      baseMoves.push(...generateSlidingMoves(position, piece, board, boardState))
  }
  baseMoves = [...new Set(baseMoves)] // filter out duplicates
  return baseMoves
}

function generateKnightMoves(position: number, _piece: number, board: number[], boardState: BoardState): number[] {

  const positions: number[] = [];

  for (const direction of [...Object.values(KnightDirection)].filter(x => typeof x === 'number') as KnightDirection[]) {
    const testPosition = position + direction;
    if (!knightMoveContainedInBoard(position, testPosition)) continue;
    if (getPieceColor(board[testPosition]!) === boardState.colorToMove) continue;
    if (getPieceType(board[testPosition]!) === Piece.King) continue;
    positions.push(testPosition);
  }

  return positions
}

function generatePawnMoves(position: number, piece: number, board: number[], boardState: BoardState): number[] {
  const validMoves: number[] = [];
  const direction = getPieceColor(piece) === Piece.White ? Direction.U : Direction.D
  const captureDirections = getPieceColor(piece) === Piece.White ? [Direction.UL, Direction.UR] : [Direction.DL, Direction.DR]
  const haventMoved = getPieceColor(piece) === Piece.White ? boardState.whitePawnsThatHaventMoved : boardState.blackPawnsThatHaventMoved

  // Test standard pawn move
  const testPosition = position + direction;
  if (board[testPosition] === Piece.None && slidingMoveContainedInBoard(position, testPosition)) validMoves.push(testPosition);

  // Test capture ability
  for (const dir of captureDirections) {
    const testPosition = position + dir;
    if (
      pieceIsCapturable(testPosition, board, boardState) &&
      slidingMoveContainedInBoard(position, testPosition) // the move doesnt go across a board edge
    ) validMoves.push(testPosition);
  }

  // Test double pawn move
  doublePawnMove: if (haventMoved.includes(position)) {
    const testPosition = position + (direction * 2);
    const inBetweenPosition = position + direction
    if (board[inBetweenPosition] !== Piece.None) break doublePawnMove; // a pawn can't jump over a piece
    if (board[testPosition] === Piece.None && slidingMoveContainedInBoard(position, testPosition)) validMoves.push(testPosition);
  }
  return validMoves;
}

function generateKingMoves(position: number, _piece: number, board: number[], boardState: BoardState): number[] {
  const positions: number[] = [];

  for (const direction of [...Object.values(Direction)].filter(x => typeof x === 'number') as Direction[]) {
    const testPosition = position + direction;
    if (!slidingMoveContainedInBoard(position, testPosition)) continue;
    if (getPieceColor(board[testPosition]!) === boardState.colorToMove) continue;
    if (getPieceType(board[testPosition]!) === Piece.King) continue;
    positions.push(testPosition);
  }

  return positions;
}

function generateSlidingMoves(position: number, piece: number, board: number[], boardState: BoardState): number[] {
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
    for (let i = 1; true; i++) { // run until we break out
      const prevPosition = position + direction * (i - 1);
      const testPosition = position + direction * i;

      if (!slidingMoveContainedInBoard(prevPosition, testPosition)) break;
      if (getPieceColor(board[testPosition]!) === boardState.colorToMove) break;
      if (getPieceType(board[testPosition]!) === Piece.King) break;

      positions.push(testPosition);

      if (getPieceColor(board[testPosition]!) === getOppositeColor(boardState.colorToMove)) break;
    }
  }
  return positions
}

function slidingMoveContainedInBoard(testPosition: number, nextPosition: number): boolean {
  if (nextPosition < 0) return false; // next position is above board
  if (nextPosition >= BOARD_WIDTH * BOARD_HEIGHT) return false; // next position is below board
  if (testPosition % BOARD_WIDTH === BOARD_WIDTH - 1 && nextPosition % BOARD_WIDTH === 0) return false; // crossed right edge
  if (nextPosition % BOARD_WIDTH === BOARD_WIDTH - 1 && testPosition % BOARD_WIDTH === 0) return false; // crossed left edge
  return true;
}

function knightMoveContainedInBoard(testPosition: number, nextPosition: number): boolean {
  if (nextPosition < 0) return false; // next position is above board
  if (nextPosition >= BOARD_WIDTH * BOARD_HEIGHT) return false; // next position is below board
  if (Math.abs(testPosition % BOARD_WIDTH - nextPosition % BOARD_WIDTH) > 2) return false; // crossed horizontal edge
  return true
}

function pieceIsCapturable(testPosition: number, board: number[], boardState: BoardState) {
  return getPieceColor(board[testPosition]!) === getOppositeColor(boardState.colorToMove) && // we're actually capturing one of the opponent's pieces
    getPieceType(board[testPosition]!) !== Piece.King // it's not a king
}