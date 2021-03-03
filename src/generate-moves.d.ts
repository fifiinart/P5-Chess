export declare enum Direction {
    U = -8,
    UR = -7,
    R = 1,
    DR = 9,
    D = 8,
    DL = 7,
    L = -1,
    UL = -9
}
export declare function generateMoves(position: number, piece: number, chessBoardState: number[], whiteToMove: boolean): number[];
export declare function generateSlidingMoves(position: number, piece: number, chessBoardState: number[], whiteToMove: boolean): number[];
