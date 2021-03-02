export declare const BOARD_FILL_RATIO: number;
export declare const BOARD_WIDTH = 8;
export declare const BOARD_HEIGHT = 8;
export declare const WINDOW_FILL_RATIO = 1;
export declare enum Piece {
    None = 0,
    White = 1,
    Black = 2,
    Pawn = 4,
    Rook = 8,
    Knight = 12,
    Bishop = 16,
    Queen = 20,
    King = 24
}
export declare const FenPiece: {
    P: number;
    p: number;
    R: number;
    r: number;
    N: number;
    n: number;
    B: number;
    b: number;
    Q: number;
    q: number;
    K: number;
    k: number;
};
export declare const SPRITE_SIZE = 180;
export declare const PIECE_ARRANGEMENTS: number[][];
export declare const STARTING_POSITION = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
