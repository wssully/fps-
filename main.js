let scene, camera, renderer, controls;
let bullets = [];
let objects = [];
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

const clock = new THREE.Clock();

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x202020);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 1000);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new THREE.PointerLockControls(camera, document.body);

  document.getElementById('startBtn').onclick = () => {
    controls.lock();
    document.getElementById('startBtn').style.display = 'none';
  };

  // floor
  let floorGeo = new THREE.PlaneGeometry(200, 200);
  let floorMat = new THREE.MeshBasicMaterial({color: 0x555555});
  let floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // spawn cubes
  for (let i=0; i<20; i++) {
    let cube = new THREE.Mesh(
      new THREE.BoxGeometry(2,2,2),
      new THREE.MeshBasicMaterial({color: Math.random()*0xffffff})
    );
    cube.position.set(Math.random()*100-50, 1, Math.random()*100-50);
    scene.add(cube);
    objects.push(cube);
  }

  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  scene.add(light);

  window.addEventListener('resize', onWindowResize, false);
  document.addEventListener('click', shoot, false);
  document.addEventListener('keydown', onKeyDown, false);
  document.addEventListener('keyup', onKeyUp, false);
}

function onKeyDown(e) {
  switch (e.code) {
    case 'ArrowUp':
    case 'KeyW': moveForward = true; break;
    case 'ArrowLeft':
    case 'KeyA': moveLeft = true; break;
    case 'ArrowDown':
    case 'KeyS': moveBackward = true; break;
    case 'ArrowRight':
    case 'KeyD': moveRight = true; break;
    case 'Space':
      if (canJump) {
        velocity.y += 10;
        canJump = false;
      }
      break;
  }
}

function onKeyUp(e) {
  switch (e.code) {
    case 'ArrowUp':
    case 'KeyW': moveForward = false; break;
    case 'ArrowLeft':
    case 'KeyA': moveLeft = false; break;
    case 'ArrowDown':
    case 'KeyS': moveBackward = false; break;
    case 'ArrowRight':
    case 'KeyD': moveRight = false; break;
  }
}

function shoot() {
  if (!controls.isLocked) return;
  let bullet = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 8, 8),
    new THREE.MeshBasicMaterial({color: 0xffff00})
  );
  bullet.position.copy(camera.position);
  let dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  bullet.userData.velocity = dir.clone().multiplyScalar(2);
  scene.add(bullet);
  bullets.push(bullet);
}

function onWindowResize() {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const speed = 10.0;

  velocity.x -= velocity.x * 10.0 * delta;
  velocity.z -= velocity.z * 10.0 * delta;
  velocity.y -= 30.0 * delta; // gravity

  direction.z = Number(moveForward) - Number(moveBackward);
  direction.x = Number(moveRight) - Number(moveLeft);
  direction.normalize();

  if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
  if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;

  controls.moveRight(-velocity.x * delta);
  controls.moveForward(-velocity.z * delta);
  controls.getObject().position.y += velocity.y * delta;

  if (controls.getObject().position.y < 2) {
    velocity.y = 0;
    controls.getObject().position.y = 2;
    canJump = true;
  }

  // update bullets
  bullets.forEach((b, i) => {
    b.position.add(b.userData.velocity);
    objects.forEach((obj, j) => {
      if (b.position.distanceTo(obj.position) < 1.5) {
        scene.remove(obj);
        objects.splice(j, 1);
      }
    });
  });

  renderer.render(scene, camera);
}