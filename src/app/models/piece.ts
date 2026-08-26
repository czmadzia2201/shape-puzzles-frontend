import { Point } from './point';

export interface Piece {
  id: string;
  startPoint: Point;
  vertices: Point[];
}
