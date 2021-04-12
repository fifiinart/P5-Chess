import "./style.css"
import sprites from '../chess-sprites.png'
import P5, { Vector, Image } from "p5"
import { WINDOW_FILL_RATIO, BOARD_WIDTH, BOARD_HEIGHT, PIECE_ARRANGEMENTS, SPRITE_SIZE, STARTING_POSITION, Piece, BOARD_FILL_RATIO, BoardState } from "./constants";
import { generateMoves } from "./generate-moves";
import { parseFenString, getVectorFromPosition, getPositionFromVector, getPieceColor } from "./util";

new P5((p5: P5) => {
  let SCREEN_SIZE: number

  let CANVAS_MARGIN_X: number 
  let CANVAS_MARGIN_Y: number 

  let BOARD_PADDING: number

  let TILE_WIDTH: number 
  let TILE_HEIGHT: number

  resetCanvasConstants()

  const PieceImgs: Map<number, Image> = new Map();

  const LIGHT_TILE_COLOR = [232, 235, 239];
  const DARK_TILE_COLOR = [125, 135, 150];

  const positions = [...Array(BOARD_HEIGHT * BOARD_WIDTH).keys()]

  let boardState: BoardState = {
    colorToMove: Piece.White,
    whitePawnsThatHaventMoved: [],
    blackPawnsThatHaventMoved: []
  }

  let board = parseFenString(STARTING_POSITION, boardState);

  let hand: number = Piece.None;
  let position: null | number = null;
  let handState: "none" | "drag" = "none";
  let validMoves: null | number[] = null;
  
  function resetCanvasConstants() {
    CANVAS_MARGIN_X = (p5.windowWidth - SCREEN_SIZE) / 2;
    CANVAS_MARGIN_Y = (p5.windowHeight - SCREEN_SIZE) / 2;
    SCREEN_SIZE = Math.min(p5.windowWidth * WINDOW_FILL_RATIO, p5.windowHeight * WINDOW_FILL_RATIO);
    TILE_WIDTH = SCREEN_SIZE * BOARD_FILL_RATIO / BOARD_WIDTH;
    TILE_HEIGHT = SCREEN_SIZE * BOARD_FILL_RATIO / BOARD_HEIGHT;
    BOARD_PADDING = (SCREEN_SIZE - SCREEN_SIZE * BOARD_FILL_RATIO) / 2
  }

  p5.preload = () => {
    p5.loadImage(sprites, p5Sprites => {
      PIECE_ARRANGEMENTS.forEach((p, y) => {
        p.forEach((piece, x) => {
          const sprite = p5Sprites.get(x * SPRITE_SIZE, y * SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE);
          PieceImgs.set(piece, sprite)
        })
      })
    })
  }

  p5.setup = () => {
    // Set up the canvas
    const container = p5.createDiv().id("container")
    const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight).id("sketch")
    container.child(canvas)
    resetCanvasConstants()

    p5.textAlign(p5.CENTER, p5.CENTER)
    p5.textSize(SCREEN_SIZE / 25);
    p5.noStroke();
  }
  p5.windowResized = () => {
    resetCanvasConstants()
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
  }

  p5.draw = () => {
    drawBoard();
    highlightTile([255, 255, 0], getHoveredSquare())
    highlightTile([0, 255 / 3, 255 / 6], position)
    drawCircleOverTiles([150, 10, 10], validMoves)
    showItemInHand(hand)
  }

  p5.mouseDragged = grabPiece;
  p5.mouseReleased = dropPiece;
  p5.keyPressed = () => {
    switch (p5.keyCode) {
      case p5.ESCAPE:
      case p5.ENTER:
        trashPiece();
        break;
    }
  }

  function highlightTile([r, g, b]: [number, number, number], position: number | null) {
    if (position === null) return;
    p5.fill(r, g, b, 255 / 2);
    const { x, y } = getVectorFromPosition(position);
    p5.rect(x * TILE_WIDTH + BOARD_PADDING + CANVAS_MARGIN_X, y * TILE_HEIGHT + BOARD_PADDING + CANVAS_MARGIN_Y, TILE_WIDTH, TILE_HEIGHT)
  }

  /** Draws a circle over a given position. */
  function drawCircleOverTiles([r, g, b]: [number, number, number], position: number | null | number[]) {
    if (position == null) return;
    const positions = typeof position === 'number' ? [position] : position
    p5.fill(r, g, b, 255)
    for (const p of positions) {
      const { x, y } = getVectorFromPosition(p);
      p5.ellipse(
        x * TILE_WIDTH + TILE_WIDTH / 2 + BOARD_PADDING + CANVAS_MARGIN_X,
        y * TILE_HEIGHT + TILE_HEIGHT / 2 + BOARD_PADDING + CANVAS_MARGIN_Y,
        TILE_WIDTH / 4,
        TILE_HEIGHT / 4
      )
    }
  }

  /** Drops the held piece onto the board. */
  function dropPiece() {
    const hoveredSquare = getHoveredSquare();
    if (hoveredSquare !== null) {
      if (handState === "drag" && hand !== Piece.None) {
        if (validMoves && validMoves.includes(hoveredSquare)) {
          updateBoardState(hoveredSquare, hand, position!);
          board[hoveredSquare] = hand;
          hand = Piece.None;
          position = null;
          validMoves = null;
        } else {
          trashPiece();
        }
      }
    } else trashPiece();
    handState = "none"
  }

  function updateBoardState(position: number, piece: number, startPosition: number) {
    if (piece === (Piece.White | Piece.Pawn) && position !== startPosition) boardState.whitePawnsThatHaventMoved = boardState.whitePawnsThatHaventMoved.filter(((p) => p !== startPosition))
    if (piece === (Piece.Black | Piece.Pawn) && position !== startPosition) boardState.blackPawnsThatHaventMoved = boardState.blackPawnsThatHaventMoved.filter(((p) => p !== startPosition))
    boardState.colorToMove = boardState.colorToMove === Piece.White ? Piece.Black : Piece.White;
  }

  function trashPiece() {
    if (position !== null && handState === "drag") {
      board[position] = hand;
      handState = "none";
      hand = Piece.None;
      position = null;
      validMoves = null;
    }
  }
  function grabPiece() {
    const hoveredSquare = getHoveredSquare();
    if (hoveredSquare !== null && hand === Piece.None) {
      if (handState === "none") {
        const tile = board[hoveredSquare]
        if (tile !== Piece.None && tile !== undefined && getPieceColor(tile) === boardState.colorToMove) {
          position = hoveredSquare;
          hand = tile;
          board[hoveredSquare] = Piece.None;
          validMoves = generateMoves(position, hand, board, boardState);
        }
      }
    }
    handState = "drag";
  }
  function showItemInHand(piece: number) {
    p5.image(getSprite(piece), p5.mouseX - TILE_WIDTH / 2, p5.mouseY - TILE_HEIGHT / 2, TILE_WIDTH, TILE_HEIGHT)
  }



  const getHoveredSquare = (): number | null => {
    const mappedX = p5.map(p5.mouseX, BOARD_PADDING + CANVAS_MARGIN_X, SCREEN_SIZE - BOARD_PADDING + CANVAS_MARGIN_X, 0, BOARD_WIDTH);
    const mappedY = p5.map(p5.mouseY, BOARD_PADDING + CANVAS_MARGIN_Y, SCREEN_SIZE - BOARD_PADDING + CANVAS_MARGIN_Y, 0, BOARD_HEIGHT);
    if (mappedX < 0 || mappedX > BOARD_WIDTH || mappedY < 0 || mappedY > BOARD_HEIGHT) return null;
    return getPositionFromVector(p5.createVector(Math.floor(mappedX), Math.floor(mappedY)));
  }


  function getSprite(piece: number) {
    if (piece === Piece.None) {
      return p5.createImage(SPRITE_SIZE, SPRITE_SIZE)
    }
    if (!PieceImgs.has(piece)) {
      throw new Error(`Invalid Piece: ${piece}`);
    }
    return PieceImgs.get(piece)!
  }

  function drawPiece(position: number, piece: number): void
  function drawPiece(position: Vector, piece: number): void
  function drawPiece(position: number | Vector, piece: number) {
    let _position: Vector;
    if (typeof position === 'number') _position = getVectorFromPosition(position)
    else _position = position;
    p5.image(getSprite(piece), _position.x * TILE_WIDTH + BOARD_PADDING + CANVAS_MARGIN_X, _position.y * TILE_HEIGHT + BOARD_PADDING + CANVAS_MARGIN_Y, TILE_WIDTH, TILE_HEIGHT)
  }

  const drawBoard = () => {
    p5.background(57, 66, 75)
    for (const pos of positions) {
      const { x, y } = getVectorFromPosition(pos)
      p5.fill(
        (x + y) % 2 === 1 ?
          DARK_TILE_COLOR :
          LIGHT_TILE_COLOR
      )
      p5.rect(x * TILE_WIDTH + BOARD_PADDING + CANVAS_MARGIN_X, y * TILE_HEIGHT + BOARD_PADDING + CANVAS_MARGIN_Y, TILE_WIDTH, TILE_HEIGHT)
    }

    p5.fill(p5.lerpColor(p5.color(LIGHT_TILE_COLOR), p5.color(DARK_TILE_COLOR), 0.5))
    for (const tile of Array(BOARD_HEIGHT).keys()) {
      p5.text(BOARD_HEIGHT - tile, BOARD_PADDING / 2 + CANVAS_MARGIN_X, tile * TILE_HEIGHT + BOARD_PADDING + TILE_HEIGHT / 2 + CANVAS_MARGIN_Y)
      p5.text(BOARD_HEIGHT - tile, SCREEN_SIZE - BOARD_PADDING / 2 + CANVAS_MARGIN_X, tile * TILE_HEIGHT + BOARD_PADDING + TILE_HEIGHT / 2 + CANVAS_MARGIN_Y)
      p5.text(String.fromCharCode(tile + 97), tile * TILE_WIDTH + BOARD_PADDING + TILE_WIDTH / 2 + CANVAS_MARGIN_X, BOARD_PADDING / 2 + CANVAS_MARGIN_Y)
      p5.text(String.fromCharCode(tile + 97), tile * TILE_WIDTH + BOARD_PADDING + TILE_WIDTH / 2 + CANVAS_MARGIN_X, SCREEN_SIZE - BOARD_PADDING / 2 + CANVAS_MARGIN_Y)
    }

    for (const [position, piece] of [...board.entries()]) {
      drawPiece(position, piece)
    }
  }
})
