import { Piece } from './piece';
import { Task } from './task';
import { Point } from './point';

export interface GameTypeSummary {
  name: string;
  displayName: string;
}

export interface GameType extends GameTypeSummary {
  pieces: Piece[];
  tasks: Task[];
  baseShape: Point[];
  unitSize: number;
}
