import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const GOLD = "#c5a059";

function faceTexture(number) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 128, 128);
  g.addColorStop(0, "#4a4540"); g.addColorStop(0.5, "#2a2520"); g.addColorStop(1, "#15110d");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = "rgba(255,240,200,0.05)";
  for (let i = 0; i < 44; i++) { ctx.beginPath(); ctx.arc(Math.random() * 128, Math.random() * 128, Math.random() * 3 + 0.5, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = "rgba(0,0,0,0.4)"; ctx.lineWidth = 4; ctx.strokeRect(2, 2, 124, 124);
  ctx.fillStyle = GOLD;
  ctx.font = "bold 66px Georgia, 'Times New Roman', serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.9)"; ctx.shadowBlur = 5; ctx.shadowOffsetY = 2;
  ctx.fillText(String(number), 64, 64);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,240,200,0.16)"; ctx.fillText(String(number), 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4; tex.needsUpdate = true;
  return tex;
}

function buildTrapezohedron(R) {
  const geo = new THREE.BufferGeometry();
  const r = R * 0.92, h = R * 0.46;
  const N = new THREE.Vector3(0, R, 0), S = new THREE.Vector3(0, -R, 0);
  const U = [], L = [];
  for (let k = 0; k < 5; k++) {
    const a = (2 * Math.PI * k) / 5;
    U.push(new THREE.Vector3(r * Math.cos(a), h, r * Math.sin(a)));
    const b = a + Math.PI / 5;
    L.push(new THREE.Vector3(r * Math.cos(b), -h, r * Math.sin(b)));
  }
  const positions = [], uvs = [];
  const quadUV = [[0.5, 1], [0, 0.5], [0.5, 0], [1, 0.5]];
  const tri = (p1, p2, p3, u1, u2, u3) => { positions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, p3.x, p3.y, p3.z); uvs.push(u1[0], u1[1], u2[0], u2[1], u3[0], u3[1]); };
  const kite = (a, b, c, d) => { tri(a, b, c, quadUV[0], quadUV[1], quadUV[2]); tri(a, c, d, quadUV[0], quadUV[2], quadUV[3]); };
  for (let k = 0; k < 5; k++) kite(N, U[k], L[k], U[(k + 1) % 5]);
  for (let k = 0; k < 5; k++) kite(S, L[k], U[(k + 1) % 5], L[(k + 1) % 5]);
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  return geo;
}

const _assets = {};
function getDieAssets(sides) {
  if (_assets[sides]) return _assets[sides];
  let geo;
  if (sides === 20) geo = new THREE.IcosahedronGeometry(1.18, 0);
  else if (sides === 12) geo = new THREE.DodecahedronGeometry(1.18, 0);
  else if (sides === 8) geo = new THREE.OctahedronGeometry(1.18, 0);
  else if (sides === 4) geo = new THREE.TetrahedronGeometry(1.18, 0);
  else geo = buildTrapezohedron(1.18);
  const g = geo.index ? geo.toNonIndexed() : geo;
  const pos = g.attributes.position;
  const triCount = pos.count / 3;
  const trisPerFace = Math.max(1, Math.round(triCount / sides));
  g.clearGroups();
  const faceCentroids = [];
  const uvArr = new Float32Array(pos.count * 2);
  const pad = 0.028;
  for (let f = 0; f < sides; f++) {
    const start = f * trisPerFace * 3;
    const cnt = trisPerFace * 3;
    let cx = 0, cy = 0, cz = 0;
    for (let i = start; i < start + cnt; i++) { cx += pos.getX(i); cy += pos.getY(i); cz += pos.getZ(i); }
    g.addGroup(start, cnt, f);
    faceCentroids.push(new THREE.Vector3(cx / cnt, cy / cnt, cz / cnt).normalize());
    const ax = pos.getX(start), ay = pos.getY(start), az = pos.getZ(start);
    const e1x = pos.getX(start + 1) - ax, e1y = pos.getY(start + 1) - ay, e1z = pos.getZ(start + 1) - az;
    const e2x = pos.getX(start + 2) - ax, e2y = pos.getY(start + 2) - ay, e2z = pos.getZ(start + 2) - az;
    const nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x;
    const nl = Math.hypot(nx, ny, nz) || 1;
    const Nx = nx / nl, Ny = ny / nl, Nz = nz / nl;
    const ul = Math.hypot(e1x, e1y, e1z) || 1;
    const Ux = e1x / ul, Uy = e1y / ul, Uz = e1z / ul;
    const Vx = Ny * Uz - Nz * Uy, Vy = Nz * Ux - Nx * Uz, Vz = Nx * Uy - Ny * Ux;
    let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity;
    const proj = new Array(cnt);
    for (let i = start; i < start + cnt; i++) {
      const dx = pos.getX(i) - ax, dy = pos.getY(i) - ay, dz = pos.getZ(i) - az;
      const u = dx * Ux + dy * Uy + dz * Uz;
      const v = dx * Vx + dy * Vy + dz * Vz;
      proj[i - start] = { u, v };
      if (u < minU) minU = u; if (u > maxU) maxU = u;
      if (v < minV) minV = v; if (v > maxV) maxV = v;
    }
    const du = maxU - minU || 1, dv = maxV - minV || 1;
    let cuv = 0, cvv = 0;
    for (let i = start; i < start + cnt; i++) { cuv += proj[i - start].u; cvv += proj[i - start].v; }
    cuv /= cnt; cvv /= cnt;
    for (let i = start; i < start + cnt; i++) {
      const p = proj[i - start];
      uvArr[i * 2] = 0.5 + (p.u - cuv) * (1 - 2 * pad) / du;
      uvArr[i * 2 + 1] = 0.5 + (p.v - cvv) * (1 - 2 * pad) / dv;
    }
  }
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvArr, 2));
  g.computeVertexNormals();
  const mats = [];
  for (let f = 0; f < sides; f++) { mats.push(new THREE.MeshStandardMaterial({ map: faceTexture(f + 1), metalness: 0.4, roughness: 0.55, flatShading: true, side: THREE.DoubleSide })); }
  _assets[sides] = { g, mats, faceCentroids };
  return _assets[sides];
}

export default function MetalDie({ value, rolling, sides, size = 64 }) {
  const mountRef = useRef(null);
  const valueRef = useRef(value); valueRef.current = value;
  const rollingRef = useRef(rolling); rollingRef.current = rolling;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const { g, mats, faceCentroids } = getDieAssets(sides);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(1);
    renderer.setSize(size, size);
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 4.4);
    camera.lookAt(0, 0, 0);
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const key = new THREE.DirectionalLight(0xfff0d0, 1.15); key.position.set(2.5, 3, 4); scene.add(key);
    const rim = new THREE.DirectionalLight(0x88aaff, 0.4); rim.position.set(-3, -2, -2); scene.add(rim);
    const mesh = new THREE.Mesh(g, mats);
    mesh.quaternion.setFromEuler(new THREE.Euler(-0.3, 0.5, 0.1));
    scene.add(mesh);
    const alignQuats = faceCentroids.map(n => { const q = new THREE.Quaternion(); q.setFromUnitVectors(n.clone(), new THREE.Vector3(0, 0, 1)); return q; });
    const spinAxis = new THREE.Vector3(1, 0.6, 0.3).normalize();
    const spin = new THREE.Quaternion().setFromAxisAngle(spinAxis, 0.13);
    let raf, settleT = 0;
    const tick = () => {
      if (rollingRef.current) { settleT = 0; mesh.quaternion.premultiply(spin); }
      else {
        if (settleT === 0) settleT = performance.now();
        const idx = Math.min(sides - 1, Math.max(0, valueRef.current - 1));
        mesh.quaternion.slerp(alignQuats[idx], 0.16);
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [sides, size]);

  return <div ref={mountRef} style={{ width: size, height: size }} />;
}