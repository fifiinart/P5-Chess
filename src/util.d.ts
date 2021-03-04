import { Vector } from "p5";
import { BoardState } from "./constants";
export declare function parseFenString(fenString: string, state: BoardState): number[];
export declare const getPositionFromVector: (vector: Vector) => number;
export declare const getVectorFromPosition: (position: number) => Vector;
export declare const getPieceColor: (piece: number) => number;
export declare const getPieceType: (piece: number) => number;
