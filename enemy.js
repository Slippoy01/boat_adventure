import
    { handleGameOver,
      fetchLeaderboard, 
      sendScoreToServer, 
      logLeaderboard, 
    } from './gameOver.js';

export let enemies = [];
export let projectiles = [];


const enemyImageSrc = 'enemy-boat.gif'; // Path untuk musuh
const projectileImageSrc = 'projectile.gif'; // Path untuk proyektil (GIF)
const enemyDestroyedSrc = 'enemy-boat_destroyed.gif'; // Path untuk efek musuh hancur
const boatDestroyedSrc = 'boat_destroyed.gif'; // Path untuk efek perahu pemain hancur
const fireSound = new Audio('sounds/naga.mp3');
const destroySound = new Audio('sounds/hancur.mp3');
let isGameOver = false; // Flag untuk memastikan game over hanya terjadi sekali

// Fungsi untuk membuat elemen HTML <img> untuk musuh
function createEnemyElement() {
  const img = document.createElement('img');
  img.src = enemyImageSrc;
  img.style.position = 'absolute';
  img.style.width = '60px';
  img.style.height = '60px';
  img.style.pointerEvents = 'none';
  document.body.appendChild(img);
  return img;
}

// Fungsi untuk membuat elemen HTML <img> untuk proyektil
function createProjectileElement() {
  const img = document.createElement('img');
  img.src = projectileImageSrc; // Gunakan GIF proyektil
  img.style.position = 'absolute';
  img.style.width = '35px'; // Ukuran proyektil (3.5)
  img.style.height = '35px';
  img.style.pointerEvents = 'none'; // Tidak mengganggu interaksi
  document.body.appendChild(img);
  return img;
}

// Fungsi untuk membuat musuh
export function generateEnemies(canvasWidth, canvasHeight) {
  // Hapus elemen musuh yang ada sebelumnya
  enemies.forEach((enemy) => {
    if (enemy.element) {
      enemy.element.remove();
    }
  });
  enemies = []; // Reset array musuh

  // Buat musuh baru
  for (let i = 0; i < Math.min(4, 2 + Math.floor(Math.random() * 3)); i++) {
    let x = Math.random() * canvasWidth;
    let y = Math.random() * canvasHeight;

    enemies.push({
      x,
      y,
      size: 60,
      speed: 0.5,
      angle: Math.random() * Math.PI * 2,
      targetAngle: Math.random() * Math.PI * 2,
      lastDirectionChange: Date.now(),
      lastShotTime: Date.now(),
      destroyed: false, // Tambahkan flag destroyed
      element: createEnemyElement(),
    });
  }
}

// Fungsi untuk menggambar musuh
export function drawEnemies(ctx) {
  // Tidak ada rendering di canvas, sudah dihandle oleh HTML
}

// Update posisi musuh
export function updateEnemies(canvasWidth, canvasHeight, boat) {
  const now = Date.now();

  enemies.forEach((enemy) => {
    // Abaikan musuh yang sudah dihancurkan
    if (enemy.destroyed) return;

    if (now - enemy.lastDirectionChange >= 2000) {
      enemy.targetAngle = Math.random() * Math.PI * 2;
      enemy.lastDirectionChange = now;
    }

    const angleDiff = ((enemy.targetAngle - enemy.angle + Math.PI) % (2 * Math.PI)) - Math.PI;
    enemy.angle += angleDiff * 0.1;

    enemy.x += Math.cos(enemy.angle) * enemy.speed;
    enemy.y += Math.sin(enemy.angle) * enemy.speed;

    if (enemy.x < 0) enemy.x = canvasWidth;
    if (enemy.x > canvasWidth) enemy.x = 0;
    if (enemy.y < 0) enemy.y = canvasHeight;
    if (enemy.y > canvasHeight) enemy.y = 0;

    enemy.element.style.left = `${enemy.x - enemy.size / 2}px`;
    enemy.element.style.top = `${enemy.y - enemy.size / 2}px`;
    enemy.element.style.transform = `rotate(${enemy.angle}rad)`;

    if (now - enemy.lastShotTime >= 5000) {
      const frontX = enemy.x + Math.cos(enemy.angle) * (enemy.size / 2);
      const frontY = enemy.y + Math.sin(enemy.angle) * (enemy.size / 2);
      const angleToBoat = Math.atan2(boat.y - frontY, boat.x - frontX);

      const projectileElement = createProjectileElement();

      projectiles.push({
        x: frontX,
        y: frontY,
        angle: angleToBoat,
        speed: 1,
        size: 35, // Ukuran proyektil (3.5)
        element: projectileElement,
      });
      fireSound.currentTime = 0; // Restart audio
      fireSound.play();
      enemy.lastShotTime = now;
    }
  });
}

// Fungsi menggambar proyektil
export function drawProjectiles(ctx) {
  // Tidak ada rendering di canvas, sudah dihandle oleh HTML
}

// Update posisi proyektil
export function updateProjectiles(canvasWidth, canvasHeight) {
  projectiles.forEach((projectile, index) => {
    projectile.x += Math.cos(projectile.angle) * projectile.speed;
    projectile.y += Math.sin(projectile.angle) * projectile.speed;

    projectile.element.style.left = `${projectile.x - projectile.size / 2}px`;
    projectile.element.style.top = `${projectile.y - projectile.size / 2}px`;

    if (
      projectile.x < 0 ||
      projectile.x > canvasWidth ||
      projectile.y < 0 ||
      projectile.y > canvasHeight
    ) {
      projectile.element.remove();
      projectiles.splice(index, 1);
    }
  });
}

// Periksa tabrakan
export function checkEnemyCollisions(boat, updateScore, playerProjectiles) {
  // Periksa tabrakan musuh dengan perahu
  enemies.forEach((enemy, enemyIndex) => {
    const distToBoat = Math.hypot(enemy.x - boat.x, enemy.y - boat.y);
    if (distToBoat < (boat.size + enemy.size) / 2 && !enemy.destroyed) {
      console.log(`Enemy destroyed by boat at (${enemy.x}, ${enemy.y}).`);
      updateScore(5); // Tambahkan skor
      enemy.destroyed = true; // Tandai sebagai dihancurkan

      destroySound.play();

      handleEnemyDestroyed(enemy); // Efek animasi penghancuran
      enemies.splice(enemyIndex, 1); // Hapus musuh dari array
    }
  });

  // Periksa tabrakan musuh dengan proyektil pemain
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    for (let j = playerProjectiles.length - 1; j >= 0; j--) {
      const projectile = playerProjectiles[j];
      const distToProjectile = Math.hypot(enemy.x - projectile.x, enemy.y - projectile.y);

      if (distToProjectile < (enemy.size + projectile.size) / 2 && !enemy.destroyed) {
        console.log(`Enemy destroyed by projectile at (${enemy.x}, ${enemy.y}).`);
        updateScore(10); // Tambahkan skor
        enemy.destroyed = true; // Tandai sebagai dihancurkan
        
        destroySound.play();

        handleEnemyDestroyed(enemy); // Efek animasi penghancuran
        
        // Hapus proyektil yang mengenai musuh
        if (projectile.element) projectile.element.remove();
        playerProjectiles.splice(j, 1);

        enemies.splice(i, 1); // Hapus musuh dari array
        break; // Keluar dari loop proyektil untuk musuh ini
      }
    }
  }
}

// Fungsi untuk menangani musuh yang dihancurkan
function handleEnemyDestroyed(enemy) {
  const destroyedElement = document.createElement('img');
  destroyedElement.src = enemyDestroyedSrc; // Gunakan GIF efek hancur
  destroyedElement.style.position = 'absolute';
  destroyedElement.style.width = `${enemy.size}px`;
  destroyedElement.style.height = `${enemy.size}px`;
  destroyedElement.style.left = `${enemy.x - enemy.size / 2}px`;
  destroyedElement.style.top = `${enemy.y - enemy.size / 2}px`;
  destroyedElement.style.pointerEvents = 'none';

  document.body.appendChild(destroyedElement);

  // Hapus elemen efek hancur setelah animasi selesai
  setTimeout(() => {
    destroyedElement.remove();
    enemy.element.remove(); // Pastikan elemen musuh juga dihapus
  }, 500); // Durasi animasi (2 detik)
}

function handleBoatDestroyed(boat) {
  const destroyedElement = document.createElement('img');
  destroyedElement.src = boatDestroyedSrc;
  destroyedElement.style.position = 'absolute';
  destroyedElement.style.width = `${boat.size}px`;
  destroyedElement.style.height = `${boat.size}px`;
  destroyedElement.style.left = `${boat.x - boat.size / 2}px`;
  destroyedElement.style.top = `${boat.y - boat.size / 2}px`;
  destroyedElement.style.pointerEvents = 'none';

  document.body.appendChild(destroyedElement);

  // Hapus efek setelah animasi selesai
  setTimeout(() => {
    destroyedElement.remove();
  }, 500);
}