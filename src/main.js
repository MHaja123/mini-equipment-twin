import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import './style.css';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1120);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(5, 3, 6);

const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

document.body.appendChild(renderer.domElement);

// Camera
const controls = new OrbitControls(
  camera,
  renderer.domElement
);

controls.enableDamping = true;
controls.enablePan = true;
controls.enableZoom = true;

// Lights
scene.add(
  new THREE.AmbientLight(0xffffff, 2)
);

const light = new THREE.DirectionalLight(
  0xffffff,
  3
);

light.position.set(5, 10, 5);
scene.add(light);

// --------------------
// PART DATA
// --------------------

const partData = [
  {
    name: 'Gearbox Housing',
    temperature: 65,
    rpm: 1200
  },
  {
    name: 'Bearing Assembly',
    temperature: 74,
    rpm: 1450
  },
  {
    name: 'Drive Shaft',
    temperature: 86,
    rpm: 1600
  }
];

let model = null;
let clickableParts = [];
let selectedPart = null;

// --------------------
// HEADER
// --------------------

const header = document.createElement('div');

header.className = 'header';

header.innerHTML = `
  <div>
    <h1>Mini Equipment Twin</h1>
    <p>3D Gearbox Digital Twin</p>
  </div>

  <div class="legend">
    <span>🟢 OK</span>
    <span>🟠 WARNING</span>
    <span>🔴 CRITICAL</span>
  </div>
`;

document.body.appendChild(header);


// --------------------
// RESET VIEW BUTTON
// --------------------

const resetButton = document.createElement('button');

resetButton.textContent = '↻ Reset View';

resetButton.className = 'resetButton';

resetButton.addEventListener('click', () => {

  camera.position.set(5, 3, 6);

  controls.target.set(0, 0, 0);

  controls.update();

});

document.body.appendChild(resetButton);
//------------------- 
// SIDE PANEL
//-------------------

const panel = document.createElement('div');

panel.className = 'panel';

panel.innerHTML = `
  <h2>Equipment Status</h2>

  <div id="emptyMessage">
    Click a gearbox part
  </div>

  <div id="partInfo" style="display:none">

    <h3 id="partName"></h3>

    <div class="reading">
      <span>Temperature</span>
      <strong id="temperature">-- °C</strong>
    </div>

    <div class="reading">
      <span>RPM</span>
      <strong id="rpm">-- RPM</strong>
    </div>

    <div class="statusBox">
      <span>Status</span>
      <strong id="status">--</strong>
    </div>

  </div>
`;

document.body.appendChild(panel);

// --------------------
// STATUS FUNCTION
// --------------------

function getStatus(temperature) {

  if (temperature > 80) {

    return {
      text: 'CRITICAL',
      icon: '🔴',
      className: 'critical'
    };

  }

  if (temperature >= 70) {

    return {
      text: 'WARNING',
      icon: '🟠',
      className: 'warning'
    };

  }

  return {
    text: 'OK',
    icon: '🟢',
    className: 'ok'
  };
}

// --------------------
// UPDATE PANEL
// --------------------

function updatePanel(data) {

  document.getElementById('partName').textContent =
    data.name;

  document.getElementById('temperature').textContent =
    `${data.temperature} °C`;

  document.getElementById('rpm').textContent =
    `${data.rpm} RPM`;

  const status = getStatus(data.temperature);

  const statusElement =
    document.getElementById('status');

  statusElement.textContent =
    `${status.icon} ${status.text}`;

  statusElement.className =
    status.className;
}

// --------------------
// HIGHLIGHT PART
// --------------------

function highlightPart(part) {

  clickableParts.forEach((mesh) => {

    if (mesh.userData.originalMaterial) {
      mesh.material =
        mesh.userData.originalMaterial;
    }

  });

  if (!part) return;

  const material =
    part.material.clone();

  const index =
    part.userData.partIndex;

  const temperature =
    partData[index].temperature;

  const status =
    getStatus(temperature);

  if (status.className === 'ok') {

    material.emissive =
      new THREE.Color(0x22c55e);

  }

  if (status.className === 'warning') {

    material.emissive =
      new THREE.Color(0xf59e0b);

  }

  if (status.className === 'critical') {

    material.emissive =
      new THREE.Color(0xef4444);

  }

  material.emissiveIntensity = 0.8;

  part.material = material;
}
// --------------------
// LOADING SCREEN
// --------------------

const loading = document.createElement('div');

loading.className = 'loading';

loading.textContent = 'Loading Gearbox...';

document.body.appendChild(loading);
// --------------------
// LOAD MODEL
// --------------------

const loader = new GLTFLoader();

loader.load(
  '/GearboxAssy.glb',

  (gltf) => {

    model = gltf.scene;

    scene.add(model);

    // Center model
    const box =
      new THREE.Box3().setFromObject(model);

    const center =
      box.getCenter(new THREE.Vector3());

    model.position.sub(center);

    // Find all meshes
    const meshes = [];

    model.traverse((object) => {

      if (object.isMesh) {

        meshes.push(object);

        object.userData.originalMaterial =
          object.material;

      }

    });

    // All model parts can be clicked
    clickableParts = meshes;

    clickableParts.forEach((part, index) => {

      part.userData.partIndex =
        index % partData.length;

    });

    console.log(
      'Gearbox loaded. Parts:',
      clickableParts.length
    );
    
    loading.style.display = 'none';

  },

  undefined,

  (error) => {

    console.error(
      'Gearbox loading error:',
      error
    );

  }
);

// --------------------
// CLICK DETECTION
// --------------------

const raycaster =
  new THREE.Raycaster();

const mouse =
  new THREE.Vector2();

renderer.domElement.addEventListener(
  'click',
  (event) => {

    mouse.x =
      (event.clientX /
        window.innerWidth) * 2 - 1;

    mouse.y =
      -(event.clientY /
        window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(
      mouse,
      camera
    );

    const hits =
      raycaster.intersectObjects(
        clickableParts,
        true
      );

    if (hits.length === 0) {
      return;
    }

    const object =
      hits[0].object;

    const index =
      object.userData.partIndex;

    if (index === undefined) {
      return;
    }

    selectedPart = object;

    document.getElementById(
      'emptyMessage'
    ).style.display = 'none';

    document.getElementById(
      'partInfo'
    ).style.display = 'block';

    updatePanel(
      partData[index]
    );

    highlightPart(
      selectedPart
    );

    console.log(
      'Selected:',
      partData[index].name
    );

  }
);

// --------------------
// LIVE DATA
// --------------------

setInterval(() => {

  if (!selectedPart) {
    return;
  }

  const index =
    selectedPart.userData.partIndex;

  const data =
    partData[index];

  // Temperature changes
  const temperatureChange =
    Math.floor(Math.random() * 11) - 5;

  data.temperature =
    Math.max(
      50,
      Math.min(
        95,
        data.temperature + temperatureChange
      )
    );

  // RPM changes
  const rpmChange =
    Math.floor(Math.random() * 101) - 50;

  data.rpm =
    Math.max(
      800,
      Math.min(
        2000,
        data.rpm + rpmChange
      )
    );

  updatePanel(data);

  highlightPart(selectedPart);

}, 3000);

// --------------------
// RESIZE
// --------------------

window.addEventListener(
  'resize',
  () => {

    camera.aspect =
      window.innerWidth /
      window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

  }
);

// --------------------
// ANIMATION
// --------------------

function animate() {

  requestAnimationFrame(animate);

  controls.update();

  renderer.render(
    scene,
    camera
  );

}

animate();
function updateModelStatus(status) {
  let color;

  if (status === "CRITICAL") {
    color = 0xff0000; // Red
  } else if (status === "WARNING") {
    color = 0xffa500; // Orange
  } else {
    color = 0x00ff00; // Green
  }

  model.traverse((child) => {
    if (child.isMesh && child.material) {
      child.material.color.setHex(color);
    }
  });
}
async function updateLiveData() {
  try {
    const response = await fetch("http://localhost:3001/api/status");

    if (!response.ok) {
      throw new Error("Failed to fetch live data");
    }

    const data = await response.json();

    console.log("LIVE DATA:", data);

    // Update the selected equipment panel
    const temperatureElement = document.querySelector("#temperature");
    const rpmElement = document.querySelector("#rpm");
    const statusElement = document.querySelector("#status");

    if (temperatureElement) {
      temperatureElement.textContent = `${data.temperature} °C`;
    }

    if (rpmElement) {
      rpmElement.textContent = `${data.rpm} RPM`;
    }

    if (statusElement) {
      statusElement.textContent = data.status;
    }

    updateModelStatus(data.status);
  } catch (error) {
    console.error("Live data error:", error);
  }
}

updateLiveData();

setInterval(updateLiveData, 3000);