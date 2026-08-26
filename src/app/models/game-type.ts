import { Piece } from './piece';
import { Task } from './task';

export interface GameTypeSummary {
  name: string;
  displayName: string;
}

export interface GameType extends GameTypeSummary {
  pieces: Piece[];
  tasks: Task[];
}
