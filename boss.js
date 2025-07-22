const bosses = [
  { type: 'Boss 1', health: 5, speed: 0, size: 100, image: 'bos1.gif', projectile: 'projectile1.gif', sound: 'sounds/boss3.mp3' },
  { type: 'Boss 2', health: 10, speed: 0, size: 120, image: 'bos2.gif', projectile: 'projectile2.gif', sound: 'sounds/boss3.mp3' },
  { type: 'Boss 3', health: 15, speed: 0, size: 125, image: 'bos3.gif', projectile: 'projectile3.gif', sound: 'sounds/boss3.mp3' },
  { type: 'Boss 4', health: 15, speed: 0, size: 127, image: 'bos4.gif', projectile: 'projectile3.gif', sound: 'sounds/boss3.mp3' },
  { type: 'Boss 5', health: 15, speed: 0, size: 129, image: 'bos5.gif', projectile: 'projectile5.gif', sound: 'sounds/boss3.mp3' },
  { type: 'Boss 6', health: 15, speed: 0, size: 130, image: 'bos6.gif', projectile: 'projectile6.gif', sound: 'sounds/boss6.mp3' },
  { type: 'Boss 7', health: 15, speed: 0, size: 133, image: 'bos7.gif', projectile: 'projectile7.gif', sound: 'sounds/boss7.mp3' },

];

const bossHitSound = new Audio('sounds/boss_hit.mp3');

export const bossProjectiles = [];

// Fungsi untuk spawn bos
export function spawnBoss(level, canvasWidth, canvasHeight) {
  const bossIndex = (level / 5 - 1) % bosses.length;
  const bossData = bosses[bossIndex];
  const boss = {
    x: canvasWidth / 2,
    y: 100,
    size: bossData.size,
    health: bossData.health + Math.floor(level / 5),
    maxHealth: bossData.health + Math.floor(level / 5), // Simpan nilai maksimal health
    type: bossData.type,
    angle: 0,
    image: new Image(),
    projectile: bossData.projectile,
    soundEffect: new Audio(bossData.sound), // Tambahkan efek suara bos
    lastShotTime: null,
    element: null,
    healthBar: null, // Tambahkan properti health bar
  };

  boss.image.src = bossData.image;

  // Inisialisasi audio
  boss.soundEffect.volume = 0.5;
  boss.soundEffect.loop = false;

  // Tambahkan elemen DOM untuk bos
  boss.element = document.createElement('img');
  boss.element.src = boss.image.src;
  boss.element.style.position = 'absolute';
  boss.element.style.width = `${boss.size}px`;
  boss.element.style.height = `${boss.size}px`;
  boss.element.style.left = `${boss.x - boss.size / 2}px`;
  boss.element.style.top = `${boss.y - boss.size / 2}px`;
  boss.element.style.pointerEvents = 'none';
  document.body.appendChild(boss.element);

  // Tambahkan health bar
  const healthBarContainer = document.createElement('div');
  healthBarContainer.style.position = 'absolute';
  healthBarContainer.style.width = '100px';
  healthBarContainer.style.height = '10px';
  healthBarContainer.style.backgroundColor = '#444';
  healthBarContainer.style.borderRadius = '5px';
  healthBarContainer.style.overflow = 'hidden';
  healthBarContainer.style.top = `${boss.y - boss.size / 2 - 20}px`;
  healthBarContainer.style.left = `${boss.x - 50}px`;

  const healthBar = document.createElement('div');
  healthBar.style.width = '100%';
  healthBar.style.height = '100%';
  healthBar.style.backgroundColor = '#4caf50';
  healthBar.style.borderRadius = '5px';

  healthBarContainer.appendChild(healthBar);
  document.body.appendChild(healthBarContainer);

  boss.healthBar = healthBar; // Simpan referensi ke health bar
  boss.healthBarContainer = healthBarContainer;

  return boss;
}

export function drawBoss(ctx, boss) {
  if (!boss || boss.health <= 0) return;

}

// Fungsi untuk memperbarui posisi bos (statis dalam kasus ini)
export function updateBoss(boss) {
  if (!boss || boss.health <= 0) return;

  // Pastikan posisi bos tetap di tengah atas
  boss.element.style.left = `${boss.x - boss.size / 2}px`;
  boss.element.style.top = `${boss.y - boss.size / 2}px`;
}

// Fungsi untuk menangani serangan bos
export function bossAttack(boss, player, projectiles) {
  if (!boss || boss.health <= 0) return;

  const now = Date.now();

  // Bos menembakkan proyektil setiap 3 detik
  if (!boss.lastShotTime || now - boss.lastShotTime >= 3000) {
    const angleToPlayer = Math.atan2(player.y - boss.y, player.x - boss.x); // Arah ke pemain
    const projectileElement = document.createElement('img');
    projectileElement.src = boss.projectile; // Gunakan proyektil khusus
    projectileElement.style.position = 'absolute';
    projectileElement.style.width = '35px';
    projectileElement.style.height = '35px';
    projectileElement.style.pointerEvents = 'none';
    document.body.appendChild(projectileElement);

    projectiles.push({
      x: boss.x,
      y: boss.y + boss.size / 2,
      angle: angleToPlayer,
      speed: 2, // Kecepatan proyektil
      size: 35,
      element: projectileElement,
    });

    // Mainkan efek suara
    boss.soundEffect.currentTime = 0;
    boss.soundEffect.play().catch((error) => {
      console.error('Audio playback error:', error);
    });

    boss.lastShotTime = now;
    console.log(`${boss.type} fired a projectile!`);
  }
}

// Fungsi untuk memperbarui proyektil bos
export function updateBossProjectiles(canvasWidth, canvasHeight) {
  bossProjectiles.forEach((projectile, index) => {
    projectile.x += Math.cos(projectile.angle) * projectile.speed;
    projectile.y += Math.sin(projectile.angle) * projectile.speed;

    if (projectile.element) {
      projectile.element.style.left = `${projectile.x - projectile.size / 2}px`;
      projectile.element.style.top = `${projectile.y - projectile.size / 2}px`;
    }

    // Hapus proyektil jika keluar dari layar
    if (
      projectile.x < 0 ||
      projectile.x > canvasWidth ||
      projectile.y < 0 ||
      projectile.y > canvasHeight
    ) {
      if (projectile.element) projectile.element.remove();
      bossProjectiles.splice(index, 1);
    }
  });
}

export function updateBossHealthBar(boss) {
  if (!boss || !boss.healthBar) return;

  // Hitung persentase health yang tersisa
  const healthPercentage = Math.max((boss.health / boss.maxHealth) * 100, 0);
  
  // Perbarui lebar health bar
  boss.healthBar.style.width = `${healthPercentage}%`;
}

// Fungsi untuk memeriksa tabrakan proyektil pemain dengan bos
export function checkBossCollisions(playerProjectiles, boss, updateScore) {
  if (!boss || boss.health <= 0) return false;

  playerProjectiles.forEach((projectile, index) => {
    const distToBoss = Math.hypot(boss.x - projectile.x, boss.y - projectile.y);
    if (distToBoss < boss.size / 2) {
      boss.health -= 1;
      console.log(`${boss.type} hit! Remaining health: ${boss.health}`);
      
      bossHitSound.currentTime = 0; // Reset audio agar bisa diputar ulang
      bossHitSound.play();
      
      // Perbarui health bar
      updateBossHealthBar(boss);

      if (projectile.element) {
        projectile.element.remove(); // Hapus elemen proyektil
      }
      playerProjectiles.splice(index, 1);

      if (boss.health <= 0) {
        console.log(`${boss.type} defeated!`);
        updateScore(50); // Tambahkan skor
        handleBossDefeated(boss);
        return true; // Bos dikalahkan
      }
    }
  });

  return false; // Bos masih hidup
}

// Fungsi untuk menangani bos yang dikalahkan
export function handleBossDefeated(boss) {
  if (!boss) return;

  const destroyedElement = document.createElement('img');
  destroyedElement.src = 'enemy-boat_destroyed.gif'; // Efek bos hancur
  destroyedElement.style.position = 'absolute';
  destroyedElement.style.width = `${boss.size}px`;
  destroyedElement.style.height = `${boss.size}px`;
  destroyedElement.style.left = `${boss.x - boss.size / 2}px`;
  destroyedElement.style.top = `${boss.y - boss.size / 2}px`;
  destroyedElement.style.pointerEvents = 'none';
  document.body.appendChild(destroyedElement);

  // Mainkan efek suara
  boss.soundEffect.src = 'sounds/boss_defeated.mp3'; // Gunakan suara kematian
  boss.soundEffect.currentTime = 0;
  boss.soundEffect.play().catch((error) => {
    console.error('Audio playback error:', error);
  });

  // Hapus elemen bos dan health bar setelah animasi selesai
  setTimeout(() => {
    if (destroyedElement) destroyedElement.remove();
    if (boss.element) boss.element.remove();
    if (boss.healthBarContainer) boss.healthBarContainer.remove();
    currentBoss = null; // Hapus bos dari permainan
  }, 500); // Durasi animasi efek hancur
}