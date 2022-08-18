import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
// scene.background = new THREE.Color(1, 0, 0);
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 3.5;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

// buffer scene stuff
const size = 512;
const bufferScene = new THREE.Scene();
const bufferCamera = new THREE.PerspectiveCamera(75, size / size, 0.1, 1000);
bufferCamera.position.z = 5;
const bufferRenderTarget = new THREE.WebGLRenderTarget(size, size);

const ballGeo = new THREE.IcosahedronGeometry(3, 0);
const ballMat = new THREE.MeshNormalMaterial({
  // wireframe: true
});

const ball = new THREE.Mesh(ballGeo, ballMat);
bufferScene.add(ball);
function updateBall(t) {
  ball.rotation.x += 0.01;
  ball.rotation.y += 0.02;
  ball.position.x = Math.cos(t * 0.001) * 4;
}

function getTri (index) {
  const triHolder = new THREE.Object3D();
  const triGeo = new THREE.CircleGeometry(1, 3);
  const hue = index % 2 === 0 ? 0.33 : 0.66;
  const triMat = new THREE.MeshBasicMaterial({
    map: bufferRenderTarget.texture,
    // color: new THREE.Color().setHSL(hue, 1, 0.5),
    side: THREE.DoubleSide
  });
  const tri = new THREE.Mesh(triGeo, triMat);
  tri.rotation.x = Math.PI * (index % 2);
  tri.position.x = -1;
  triHolder.add(tri);
  triHolder.rotation.z = Math.PI / 3 * index;
  return triHolder;
}

function getHex (index) {
  const triHolder = new THREE.Object3D();
  for (let i = 0; i < 6; i += 1) {
    triHolder.add(getTri(i));
  }
  const angle = Math.PI / 3 * index;
  const radius = 3;
  if (index !== -1) {
    triHolder.position.x = Math.cos(angle) * radius;
    triHolder.position.y = Math.sin(angle) * radius;
  }
  return triHolder;
}

for (let i = -1; i < 6; i += 1) {
  scene.add(getHex(i));
}

// debug view
const debugGeo = new THREE.PlaneGeometry(3, 3, 3);
const debugMat = new THREE.MeshBasicMaterial({
  map: bufferRenderTarget.texture,
});
const debugPlane = new THREE.Mesh(debugGeo, debugMat);
debugPlane.visible = false;
scene.add(debugPlane);

function animate(t) {
  requestAnimationFrame(animate);
  updateBall(t);
  renderer.setRenderTarget(bufferRenderTarget);
  renderer.render(bufferScene, bufferCamera);
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);
}

animate();

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", handleWindowResize, false);

function handleKeyUp (evt) {
  if (evt.key === " ") {
    debugPlane.visible = !debugPlane.visible;
  }
}

window.addEventListener("keyup", handleKeyUp);