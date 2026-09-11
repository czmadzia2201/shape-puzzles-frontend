import Konva from 'konva';
import { GeometryPoint } from '../../models/geometry-point'

export interface SnapOffset {
  dx: number;
  dy: number;
}

export function getTransformedVertices(node: Konva.Line): GeometryPoint[] {
  const points = node.points();
  const transform = node.getTransform();

  const vertices: GeometryPoint[] = [];

  for (let i = 0; i < points.length; i += 2) {
    vertices.push(
      transform.point({
        x: points[i],
        y: points[i + 1]
      })
    );
  }

  return vertices;
}

export function flatPointsToSnapPoints(points: number[]): GeometryPoint[] {
  const result: GeometryPoint[] = [];

  for (let i = 0; i < points.length; i += 2) {
    result.push({
      x: points[i],
      y: points[i + 1]
    });
  }

  return result;
}

export function findSnapOffset(
  draggedPoints: GeometryPoint[],
  targetPoints: GeometryPoint[],
  snapDistance: number
): SnapOffset | null {

  let closestDistance = snapDistance;
  let closestOffset: SnapOffset | null = null;

  for (const draggedPoint of draggedPoints) {
    for (const targetPoint of targetPoints) {
      const dx = targetPoint.x - draggedPoint.x;
      const dy = targetPoint.y - draggedPoint.y;

      const distance = Math.hypot(dx, dy);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestOffset = { dx, dy };
      }
    }
  }

  return closestOffset;
}
