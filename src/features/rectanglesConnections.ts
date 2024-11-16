import { ConnectionPoint, Point, Rect } from "../shared/types/connectionTypes";

const EPSILON = 0.0001;
const PADDING = 10;

const isPointOnRect = (rect: Rect, point: Point): boolean => {
  const halfWidth = rect.size.width / 2;
  const halfHeight = rect.size.height / 2;
  const left = rect.position.x - halfWidth;
  const right = rect.position.x + halfWidth;
  const top = rect.position.y - halfHeight;
  const bottom = rect.position.y + halfHeight;

  const onVerticalEdge =
    (Math.abs(point.x - left) < EPSILON || Math.abs(point.x - right) < EPSILON) &&
    point.y >= top &&
    point.y <= bottom;

  const onHorizontalEdge =
    (Math.abs(point.y - top) < EPSILON || Math.abs(point.y - bottom) < EPSILON) &&
    point.x >= left &&
    point.x <= right;

  return onVerticalEdge || onHorizontalEdge;
};

const validateConnectionPoint = (rect: Rect, connection: ConnectionPoint): boolean => {
  if (!isPointOnRect(rect, connection.point)) {
    return false;
  }

  const halfWidth = rect.size.width / 2;
  const halfHeight = rect.size.height / 2;
  const angleRad = (connection.angle * Math.PI) / 180;
  const direction = { x: Math.cos(angleRad), y: Math.sin(angleRad) };

  const isLeftEdge = Math.abs(connection.point.x - (rect.position.x - halfWidth)) < EPSILON;
  const isRightEdge = Math.abs(connection.point.x - (rect.position.x + halfWidth)) < EPSILON;
  const isTopEdge = Math.abs(connection.point.y - (rect.position.y - halfHeight)) < EPSILON;
  const isBottomEdge = Math.abs(connection.point.y - (rect.position.y + halfHeight)) < EPSILON;

  return (
    (isLeftEdge && Math.abs(direction.x + 1) < EPSILON) ||
    (isRightEdge && Math.abs(direction.x - 1) < EPSILON) ||
    (isTopEdge && Math.abs(direction.y + 1) < EPSILON) ||
    (isBottomEdge && Math.abs(direction.y - 1) < EPSILON)
  );
};

const dataConverter = (
  rect1: Rect,
  rect2: Rect,
  cPoint1: ConnectionPoint,
  cPoint2: ConnectionPoint
): Point[] => {
  if (!validateConnectionPoint(rect1, cPoint1) || !validateConnectionPoint(rect2, cPoint2)) {
    throw new Error("Invalid connection points or angles");
  }

  const points: Point[] = [cPoint1.point];

  const angle1Rad = (cPoint1.angle * Math.PI) / 180;
  const angle2Rad = (cPoint2.angle * Math.PI) / 180;

  const startExtension: Point = {
    x: cPoint1.point.x + Math.cos(angle1Rad) * PADDING,
    y: cPoint1.point.y + Math.sin(angle1Rad) * PADDING
  };
  const endExtension: Point = {
    x: cPoint2.point.x + Math.cos(angle2Rad) * PADDING,
    y: cPoint2.point.y + Math.sin(angle2Rad) * PADDING
  };

  points.push(startExtension);

  const dx = endExtension.x - startExtension.x;
  const dy = endExtension.y - startExtension.y;

  if (Math.abs(cPoint1.angle - cPoint2.angle) === 180) {
    const midPoint: Point = {
      x: startExtension.x + dx / 2,
      y: startExtension.y + (Math.abs(dy) < EPSILON ? PADDING : 0)
    };
    points.push(midPoint);
  } else if (Math.abs(dx) > EPSILON && Math.abs(dy) > EPSILON) {
    if (Math.abs(cPoint1.angle) === 0 || Math.abs(cPoint1.angle) === 180) {
      points.push({ x: endExtension.x, y: startExtension.y });
    } else {
      points.push({ x: startExtension.x, y: endExtension.y });
    }
  }

  points.push(endExtension);
  points.push(cPoint2.point);

  return points;
};

export default dataConverter;
