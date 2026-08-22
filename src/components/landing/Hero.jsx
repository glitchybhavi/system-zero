import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './Hero.css';

// --- PIXEL BITMAP FONT ENGINE (module scope — pure data/functions, no React state) ---
const PIXEL_FONT = {
  S: ['01110', '10000', '01110', '00001', '01110'],
  Y: ['10001', '10001', '01110', '00100', '00100'],
  T: ['11111', '00100', '00100', '00100', '00100'],
  E: ['11111', '10000', '11110', '10000', '11111'],
  M: ['10001', '11011', '10101', '10001', '10001'],
  Z: ['11111', '00010', '00100', '01000', '11111'],
  R: ['11110', '10001', '11110', '10010', '10001'],
  O: ['01110', '10001', '10001', '10001', '01110'],
};

function createPixelWord(word, material, pixelSize = 0.11, depth = 0.06) {
  const wordGroup = new THREE.Group();
  const pixelGeo = new THREE.BoxGeometry(pixelSize, pixelSize, depth);
  let currentXOffset = 0;

  for (let i = 0; i < word.length; i++) {
    const charGrid = PIXEL_FONT[word[i]];
    if (!charGrid) continue;

    const charGroup = new THREE.Group();
    const rows = charGrid.length;
    const cols = charGrid[0].length;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (charGrid[r][c] === '1') {
          const pixelMesh = new THREE.Mesh(pixelGeo, material);
          pixelMesh.position.set(c * pixelSize, -(r * pixelSize), 0);
          pixelMesh.castShadow = true;
          pixelMesh.receiveShadow = true;
          charGroup.add(pixelMesh);
        }
      }
    }

    charGroup.position.x = currentXOffset;
    wordGroup.add(charGroup);
    currentXOffset += (cols + 1.2) * pixelSize;
  }

  wordGroup.position.x = -currentXOffset / 2;
  return wordGroup;
}

function createScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#eaedf2';
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = '#d0d7de';
  ctx.fillRect(0, 0, 512, 48);

  ctx.fillStyle = '#ff5f56';
  ctx.beginPath();
  ctx.arc(24, 24, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffbd2e';
  ctx.beginPath();
  ctx.arc(48, 24, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#27c93f';
  ctx.beginPath();
  ctx.arc(72, 24, 8, 0, Math.PI * 2);
  ctx.fill();

  const colors = ['#4c2889', '#9c27b0', '#78909c', '#4c2889', '#5c6bc0'];
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = colors[i % colors.length];
    const y = 90 + i * 38;
    const width = 180 + Math.sin(i) * 120;
    ctx.fillRect(40, y, width, 14);
    ctx.fillStyle = '#b0bec5';
    ctx.fillRect(40, y + 18, width * 0.5, 8);
  }
  return new THREE.CanvasTexture(canvas);
}

function easeOutExpo(x) {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}


export default function Hero() {
  const canvasContainerRef = useRef(null);

  // --- Effect 1: Three.js retro-computer hero scene ---
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Pure black

    const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.4, 9.8);
    camera.lookAt(0, -0.2, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      precision: 'mediump',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // --- Materials ---
    const primaryPurple = new THREE.MeshPhysicalMaterial({
      color: 0x512da8,
      roughness: 0.48,
      metalness: 0.08,
      clearcoat: 0.15,
      clearcoatRoughness: 0.4,
    });

    const darkPurple = new THREE.MeshPhysicalMaterial({
      color: 0x28145a,
      roughness: 0.6,
      metalness: 0.1,
    });

    const accentPurple = new THREE.MeshPhysicalMaterial({
      color: 0x8054e8,
      roughness: 0.45,
      metalness: 0.05,
      clearcoat: 0.1,
    });

    const whiteKeyMat = new THREE.MeshPhysicalMaterial({
      color: 0xeaeaf2,
      roughness: 0.48,
      metalness: 0.05,
      clearcoat: 0.1,
    });

    const pixelTextMat = new THREE.MeshStandardMaterial({
      color: 0xf2f2f7,
      roughness: 0.35,
      metalness: 0.05,
    });

    // --- Pixel word text ---
    const systemWord = createPixelWord('SYSTEM', pixelTextMat, 0.11, 0.06);
    const systemContainer = new THREE.Group();
    systemContainer.add(systemWord);
    systemContainer.position.set(-4.5, -0.4, 1.5);
    systemContainer.rotation.set(-0.04, 0.0, 0.0);
    scene.add(systemContainer);

    const zeroWord = createPixelWord('ZERO', pixelTextMat, 0.11, 0.06);
    const zeroContainer = new THREE.Group();
    zeroContainer.add(zeroWord);
    zeroContainer.position.set(4.5, -0.9, 1.5);
    zeroContainer.rotation.set(-0.04, 0.0, 0.0);
    scene.add(zeroContainer);

    // --- Retro computer chassis ---
    const computerGroup = new THREE.Group();
    computerGroup.rotation.set(0.15, -0.52, -0.03);
    computerGroup.position.set(0, 3.2, 0);
    scene.add(computerGroup);

    const monitorGeo = new THREE.BoxGeometry(2.7, 2.2, 1.6);
    const monitor = new THREE.Mesh(monitorGeo, primaryPurple);
    monitor.position.set(0, 0.9, 0);
    monitor.castShadow = true;
    monitor.receiveShadow = true;
    computerGroup.add(monitor);

    const bezelGeo = new THREE.BoxGeometry(2.2, 1.6, 0.15);
    const bezel = new THREE.Mesh(bezelGeo, darkPurple);
    bezel.position.set(0, 0.05, 0.78);
    monitor.add(bezel);

    const screenGeo = new THREE.PlaneGeometry(1.9, 1.3);
    const screen = new THREE.Mesh(screenGeo, new THREE.MeshBasicMaterial({ map: createScreenTexture() }));
    screen.position.set(0, 0, 0.08);
    bezel.add(screen);

    const sideDriveGeo = new THREE.BoxGeometry(0.45, 1.3, 1.1);
    const sideDrive = new THREE.Mesh(sideDriveGeo, primaryPurple);
    sideDrive.position.set(1.48, 0.0, 0.1);
    monitor.add(sideDrive);

    const slotGeo = new THREE.BoxGeometry(0.08, 0.7, 0.12);
    const slot = new THREE.Mesh(slotGeo, darkPurple);
    slot.position.set(0.2, 0.1, 0.1);
    sideDrive.add(slot);

    const camGroup = new THREE.Group();
    camGroup.position.set(0, 1.3, 0);
    monitor.add(camGroup);

    const camBox = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.55), primaryPurple);
    camGroup.add(camBox);

    const lensRing = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.18, 24), primaryPurple);
    lensRing.rotation.x = Math.PI / 2;
    lensRing.position.set(-0.08, 0, 0.28);
    camBox.add(lensRing);

    const glass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.2, 24),
      new THREE.MeshStandardMaterial({ color: 0x110826, roughness: 0.2 })
    );
    glass.rotation.x = Math.PI / 2;
    glass.position.set(-0.08, 0, 0.29);
    camBox.add(glass);

    const baseGroup = new THREE.Group();
    baseGroup.position.set(0, -0.4, 1.0);
    baseGroup.rotation.x = 0.46;
    computerGroup.add(baseGroup);

    const base = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.38, 2.3), primaryPurple);
    base.castShadow = true;
    base.receiveShadow = true;
    baseGroup.add(base);

    const well = new THREE.Mesh(new THREE.BoxGeometry(2.38, 0.05, 1.3), darkPurple);
    well.position.set(0, 0.19, -0.12);
    baseGroup.add(well);

    const keysGroup = new THREE.Group();
    keysGroup.position.set(0, 0.22, -0.12);
    baseGroup.add(keysGroup);

    const rows = 6;
    const cols = 16;
    const keyW = 0.108;
    const keyD = 0.148;
    const spacingX = 0.138;
    const spacingZ = 0.185;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (r === rows - 1 && c >= 4 && c <= 11) continue;

        const isModifier = r === 0 || r === rows - 1 || c <= 1 || c >= cols - 2;
        const mat = isModifier ? accentPurple : whiteKeyMat;

        const key = new THREE.Mesh(new THREE.BoxGeometry(keyW, 0.09, keyD), mat);
        const xPos = (c - (cols - 1) / 2) * spacingX;
        const zPos = (r - (rows - 1) / 2) * spacingZ;

        key.position.set(xPos, 0, zPos);
        key.castShadow = true;
        key.receiveShadow = true;
        keysGroup.add(key);
      }
    }

    const spacebar = new THREE.Mesh(new THREE.BoxGeometry(keyW * 9.5, 0.09, keyD), accentPurple);
    spacebar.position.set(0, 0, ((rows - 1) / 2) * spacingZ);
    spacebar.castShadow = true;
    keysGroup.add(spacebar);

    // --- Lighting ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
    keyLight.position.set(5, 10, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xa882ff, 1.8, 25);
    rimLight.position.set(-6, 2, 4);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xffe8d6, 0.4);
    fillLight.position.set(0, -4, 5);
    scene.add(fillLight);

    // --- Animation loop ---
    const startTime = performance.now();
    let animationFrameId;

    function animate() {
      animationFrameId = requestAnimationFrame(animate);

      const currentTime = performance.now();
      const elapsed = Math.max(0, (currentTime - startTime - 500) / 1000);

      const compProgress = Math.min(Math.max((elapsed - 0.05) / 1.2, 0), 1.0);
      const systemProgress = Math.min(Math.max((elapsed - 0.2) / 1.2, 0), 1.0);
      const zeroProgress = Math.min(Math.max((elapsed - 0.3) / 1.2, 0), 1.0);

      const compEased = easeOutExpo(compProgress);
      const systemEased = easeOutExpo(systemProgress);
      const zeroEased = easeOutExpo(zeroProgress);

      const floatWeight = Math.min(Math.max((elapsed - 1.0) / 0.8, 0), 1.0);
      const compFloatY = Math.sin(elapsed * 1.4) * 0.1 * floatWeight;
      const textFloatY = Math.sin(elapsed * 1.4 + 0.2) * 0.07 * floatWeight;

      computerGroup.position.y = THREE.MathUtils.lerp(3.2, 0.0, compEased) + compFloatY;
      computerGroup.rotation.z = THREE.MathUtils.lerp(-0.1, -0.03, compEased);

      systemContainer.position.x = THREE.MathUtils.lerp(-4.5, -1.8, systemEased);
      systemContainer.position.y = THREE.MathUtils.lerp(-0.4, -0.8, systemEased) + textFloatY;
      systemContainer.position.z = THREE.MathUtils.lerp(1.5, 3.2, systemEased);

      zeroContainer.position.x = THREE.MathUtils.lerp(4.5, 1.8, zeroEased);
      zeroContainer.position.y = THREE.MathUtils.lerp(-0.9, -1.3, zeroEased) + textFloatY;
      zeroContainer.position.z = THREE.MathUtils.lerp(1.5, 3.2, zeroEased);

      renderer.render(scene, camera);
    }

    animationFrameId = requestAnimationFrame(animate);

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', handleResize);

    // --- Cleanup on unmount ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);



  return (
    <section className="hero-section" id="home">
      <div className="canvas-container" ref={canvasContainerRef} />
    </section>
  );
}
