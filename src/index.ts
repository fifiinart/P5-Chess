import "./style.css"
import sprites from '../chess-sprites.png'
import P5, { Vector, Image } from "p5"
import { WINDOW_FILL_RATIO, BOARD_WIDTH, BOARD_HEIGHT, PIECE_ARRANGEMENTS, SPRITE_SIZE, STARTING_POSITION, Piece, FenPiece } from "./constants";

new P5((p5: P5) => {
  let turn = Piece.White;
  turn;

  let CANVAS_SIZE = Math.min(p5.windowWidth * WINDOW_FILL_RATIO, p5.windowHeight * WINDOW_FILL_RATIO);

  let TILE_WIDTH = CANVAS_SIZE / BOARD_WIDTH;
  let TILE_HEIGHT = CANVAS_SIZE / BOARD_HEIGHT;

  const PieceImgs: Map<number, Image> = new Map();

  const LIGHT_TILE_COLOR = [235, 236, 208];
  const DARK_TILE_COLOR = [120, 148, 86];

  const positions = [...Array(BOARD_HEIGHT * BOARD_WIDTH).keys()]

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
    const canvas = p5.createCanvas(CANVAS_SIZE, CANVAS_SIZE).id("sketch")
    container.child(canvas)

    p5.noStroke();
    parseFenString(STARTING_POSITION);
  }
  p5.windowResized = () => {
    CANVAS_SIZE = Math.min(p5.windowWidth * WINDOW_FILL_RATIO, p5.windowHeight * WINDOW_FILL_RATIO);
    TILE_WIDTH = CANVAS_SIZE / BOARD_WIDTH;
    TILE_HEIGHT = CANVAS_SIZE / BOARD_HEIGHT;
    p5.resizeCanvas(CANVAS_SIZE, CANVAS_SIZE)
  }
  p5.draw = () => {
    drawBoard();
    for (const [position, piece] of parseFenString("rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R")) drawPiece(position, piece)
  }

  function parseFenString(fenString: string) {
    const pieces: [number, number][] = [];
    let position = 0;
    for (const char of fenString) {
      if (char === '/') continue;

      if (!Number.isNaN(+char) && +char <= 8) {
        pieces.push(...Array(+char).fill(null).map<[number, number]>(() => [position++, Piece.None]))
      } else {
        if (char in FenPiece) {
          pieces.push([position++, FenPiece[<keyof typeof FenPiece>char]]);
          continue
        }
        throw new Error("Invalid FEN string")
      }
    }
    return pieces;
  }

  // const getPositionFromVector = (vector: Vector) => vector.x * BOARD_WIDTH + vector.y;
  const getVectorFromPosition = (position: number) => p5.createVector(position % BOARD_WIDTH, Math.floor(position / BOARD_HEIGHT))

  function drawPiece(position: number, piece: number): void
  function drawPiece(position: Vector, piece: number): void
  function drawPiece(position: number | Vector, piece: number) {
    let _position: Vector;
    if (typeof position === 'number') _position = getVectorFromPosition(position)
    else _position = position;
    if (piece === 0) {
      return;
    }
    if (!PieceImgs.has(piece)) {
      throw new Error(`Invalid Piece: ${piece}`);
    }
    p5.image(PieceImgs.get(piece)!, _position.x * TILE_WIDTH, _position.y * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT)
  }

  const drawBoard = () => {
    for (const pos of positions) {
      const { x, y } = getVectorFromPosition(pos)
      p5.fill(
        (x + y) % 2 === 1 ?
          DARK_TILE_COLOR :
          LIGHT_TILE_COLOR
      )
      p5.rect(x * TILE_WIDTH, y * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT)
    }
  }
})
