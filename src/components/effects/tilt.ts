export function calculateTilt(
  pointerX: number,
  pointerY: number,
  width: number,
  height: number,
  intensity: number,
) {
  return {
    rotateX: ((height / 2 - pointerY) / (height / 2)) * intensity,
    rotateY: ((pointerX - width / 2) / (width / 2)) * intensity,
  }
}
