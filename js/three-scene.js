import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const canvas = document.getElementById('three-canvas');
if (!canvas || !canvas.parentElement) throw new Error('Canvas not found');

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
camera.position.set(0, 0, 6);

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true
});
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.8;
controls.enableZoom = false;
controls.enablePan = false;
controls.maxPolarAngle = Math.PI / 2.2;
controls.minPolarAngle = Math.PI / 4;
controls.target.set(0, 0.2, 0);

function createGlassTorus() {
  const geometry = new THREE.TorusKnotGeometry(1.2, 0.4, 180, 24);
  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xc084fc),
    metalness: 0.0,
    roughness: 0.15,
    transparent: true,
    opacity: 0.3,
    envMapIntensity: 2.0,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
    transmission: 0.85,
    thickness: 0.5,
    ior: 1.5,
    specularIntensity: 0.5,
    specularColor: new THREE.Color(0x818cf8),
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = 0.2;
  mesh.scale.set(0.7, 0.7, 0.7);
  return mesh;
}

function createGlassIcosahedron() {
  const geometry = new THREE.IcosahedronGeometry(0.8, 0);
  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xf472b6),
    metalness: 0.0,
    roughness: 0.1,
    transparent: true,
    opacity: 0.25,
    envMapIntensity: 2.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    transmission: 0.9,
    thickness: 0.8,
    ior: 1.6,
    specularIntensity: 0.8,
    specularColor: new THREE.Color(0xc084fc),
    wireframe: false,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(-1.8, -0.3, -0.5);
  mesh.scale.set(0.5, 0.5, 0.5);
  return mesh;
}

function createGlassOctahedron() {
  const geometry = new THREE.OctahedronGeometry(0.9, 0);
  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x818cf8),
    metalness: 0.0,
    roughness: 0.08,
    transparent: true,
    opacity: 0.2,
    envMapIntensity: 3.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    transmission: 0.92,
    thickness: 0.6,
    ior: 1.7,
    specularIntensity: 1.0,
    specularColor: new THREE.Color(0xf472b6),
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(1.8, -0.1, -0.3);
  mesh.scale.set(0.45, 0.45, 0.45);
  return mesh;
}

function createParticles() {
  const count = 200;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    sizes[i] = Math.random() * 0.03 + 0.01;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    color: 0xc084fc,
    size: 0.02,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  return points;
}

function createEnvMap() {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x0a0a0f);

  const light1 = new THREE.HemisphereLight(0x818cf8, 0x0a0a0f, 2);
  envScene.add(light1);

  const light2 = new THREE.DirectionalLight(0xc084fc, 3);
  light2.position.set(2, 3, 4);
  envScene.add(light2);

  const light3 = new THREE.DirectionalLight(0xf472b6, 2);
  light3.position.set(-2, -1, 3);
  envScene.add(light3);

  const envMap = pmremGenerator.fromScene(envScene).texture;
  pmremGenerator.dispose();
  return envMap;
}

const torus = createGlassTorus();
const icosahedron = createGlassIcosahedron();
const octahedron = createGlassOctahedron();
const particles = createParticles();

scene.add(torus);
scene.add(icosahedron);
scene.add(octahedron);
scene.add(particles);

const envMap = createEnvMap();
scene.environment = envMap;

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  torus.rotation.x += 0.002;
  torus.rotation.y += 0.004;

  icosahedron.rotation.x += 0.003;
  icosahedron.rotation.y -= 0.005;

  octahedron.rotation.x -= 0.002;
  octahedron.rotation.y += 0.006;

  particles.rotation.y += 0.0003;

  renderer.render(scene, camera);
}

animate();

function resize() {
  const w = canvas.parentElement.clientWidth;
  const h = canvas.parentElement.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}

window.addEventListener('resize', resize);

resize();

const controlsCleanup = controls;
export function cleanup() {
  window.removeEventListener('resize', resize);
  controlsCleanup.dispose();
  renderer.dispose();
}
