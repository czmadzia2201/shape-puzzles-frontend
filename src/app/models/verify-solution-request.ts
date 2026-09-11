import { GeometryPoint } from './geometry-point';

export interface VerifySolutionRequest {
  taskId: string;
  taskPolygons: GeometryPoint[][];
  pieces: PiecePlacement[];
}

export interface PiecePlacement {
  id: string;
  vertices: GeometryPoint[];
}
