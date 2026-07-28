export const IDENTITY_2D = Object.freeze([1, 0, 0, 1, 0, 0]);
export function multiply2D(a, b) {
  return [
    a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}
export function localMatrix({ x = 0, y = 0, rotation = 0, scaleX = 1, scaleY = 1 }) {
  const r = rotation * Math.PI / 180;
  const c = Math.cos(r); const s = Math.sin(r);
  return [c * scaleX, s * scaleX, -s * scaleY, c * scaleY, x, y];
}
