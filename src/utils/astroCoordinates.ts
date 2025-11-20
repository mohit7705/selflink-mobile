export function degreesToXY(
  degree: number,
  radius: number,
  centerX: number,
  centerY: number,
): { x: number; y: number } {
  const rad = ((degree - 90) * Math.PI) / 180; // subtract 90 to start at top
  const x = centerX + radius * Math.cos(rad);
  const y = centerY + radius * Math.sin(rad);
  return { x, y };
}
