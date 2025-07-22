const canonSound = new Audio('sounds/canon.mp3');
export default class AnalogController {
  constructor(canvas, boat) {
    this.canvas = canvas;
    this.boat = boat;

    // Kontrol arah (analog kiri)
    this.leftAnalog = { x: 90, y: canvas.height - 120, radius: 80 };
    this.innerAnalog = { x: 90, y: canvas.height - 120, radius: 40 };
    this.activeTouchId = null;

    // Kontrol kecepatan (tombol kanan)
    this.speedButtons = {
      up: { x: canvas.width - 60, y: canvas.height - 150, width: 40, height: 40 },
      down: { x: canvas.width - 60, y: canvas.height - 90, width: 40, height: 40 },
    };

    // Tombol tembak (sebelah kanan)
    this.shootButton = { x: canvas.width - 120, y: canvas.height - 120, radius: 50 };
    this.canShoot = true;
    this.cooldownTime = 0;

    // Menyimpan proyektil
    this.projectiles = [];

    // Status tombol keyboard
this.keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  ' ': false, // Tambahkan deteksi untuk tombol Spasi
};

    // Event listeners
    canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
    canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
    canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  handleTouchStart(e) {
    for (const touch of e.touches) {
      const distLeft = Math.hypot(touch.clientX - this.leftAnalog.x, touch.clientY - this.leftAnalog.y);

      if (distLeft < this.leftAnalog.radius && this.activeTouchId === null) {
        this.activeTouchId = touch.identifier;
        return;
      }

      const { up, down } = this.speedButtons;
      if (
        touch.clientX > up.x &&
        touch.clientX < up.x + up.width &&
        touch.clientY > up.y &&
        touch.clientY < up.y + up.height
      ) {
        this.boat.speed = Math.min(this.boat.speed + 0.3, 5);
      } else if (
        touch.clientX > down.x &&
        touch.clientX < down.x + down.width &&
        touch.clientY > down.y &&
        touch.clientY < down.y + down.height
      ) {
        this.boat.speed = Math.max(this.boat.speed - 0.3, 0.1);
      }

      const distShoot = Math.hypot(touch.clientX - this.shootButton.x, touch.clientY - this.shootButton.y);
      if (distShoot < this.shootButton.radius && this.canShoot) {
        this.shootProjectile();
        this.startCooldown();
      }
    }
  }

  handleTouchMove(e) {
    for (const touch of e.touches) {
      if (this.activeTouchId === touch.identifier) {
        const dx = touch.clientX - this.leftAnalog.x;
        const dy = touch.clientY - this.leftAnalog.y;
        this.boat.angle = Math.atan2(dy, dx);

        const distance = Math.min(Math.hypot(dx, dy), this.leftAnalog.radius - this.innerAnalog.radius);
        const angle = Math.atan2(dy, dx);
        this.innerAnalog.x = this.leftAnalog.x + Math.cos(angle) * distance;
        this.innerAnalog.y = this.leftAnalog.y + Math.sin(angle) * distance;
        return;
      }
    }
  }

  handleTouchEnd(e) {
    for (const touch of e.changedTouches) {
      if (this.activeTouchId === touch.identifier) {
        this.activeTouchId = null;
        this.innerAnalog.x = this.leftAnalog.x;
        this.innerAnalog.y = this.leftAnalog.y;
        return;
      }
    }
  }

handleKeyDown(e) {
  if (e.key in this.keys) {
    this.keys[e.key] = true;
  }

  // Trigger tembakan jika tombol Spasi ditekan
  if (e.key === ' ' && this.canShoot) { // Tombol Spasi
    this.shootProjectile();
    this.startCooldown(); // Mulai cooldown tembakan
  }
}

  handleKeyUp(e) {
    if (e.key in this.keys) {
      this.keys[e.key] = false;
    }
  }

  updateKeyboardControl() {
    // Rotasi perahu
    if (this.keys.ArrowLeft) {
      this.boat.angle -= 0.05; // Putar ke kiri
    }
    if (this.keys.ArrowRight) {
      this.boat.angle += 0.05; // Putar ke kanan
    }

    // Kecepatan perahu
    if (this.keys.ArrowUp) {
      this.boat.speed = Math.min(this.boat.speed + 0.05, 5); // Tambah kecepatan
    }
    if (this.keys.ArrowDown) {
      this.boat.speed = Math.max(this.boat.speed - 0.05, 0.1); // Kurangi kecepatan
    }
  }

  shootProjectile() {
    const projectileImage = new Image();
    projectileImage.src = 'canon.png';
    const speed = 3;
    this.projectiles.push({
      x: this.boat.x,
      y: this.boat.y,
      angle: this.boat.angle,
      image: projectileImage,
      speed: speed,
      size: 15,
    });
    canonSound.currentTime = 0; // Restart audio
    canonSound.play();
    console.log('Projectile created:', this.projectiles[this.projectiles.length - 1]);
  }

  getPlayerProjectiles() {
    return this.projectiles;
  }

  startCooldown() {
    this.canShoot = false;
    this.cooldownTime = 1;
    const cooldownInterval = setInterval(() => {
      this.cooldownTime -= 1;
      if (this.cooldownTime <= 0) {
        clearInterval(cooldownInterval);
        this.canShoot = true;

      }
    }, 1000);
  }

  drawProjectiles(ctx) {
    this.projectiles.forEach((projectile, index) => {
      projectile.x += Math.cos(projectile.angle) * projectile.speed;
      projectile.y += Math.sin(projectile.angle) * projectile.speed;

      if (projectile.image.complete) {
        ctx.drawImage(projectile.image, projectile.x - 10, projectile.y - 10, 30, 15);
      }

      const tolerance = 10;
      if (
        projectile.x < -tolerance ||
        projectile.x > this.canvas.width + tolerance ||
        projectile.y < -tolerance ||
        projectile.y > this.canvas.height + tolerance
      ) {
        console.log(`Projectile removed: (${projectile.x}, ${projectile.y})`);
        this.projectiles.splice(index, 1);
      }
    });
  }

  draw(ctx) {
    // Analog kiri (kontrol arah)
    ctx.beginPath();
    ctx.arc(this.leftAnalog.x, this.leftAnalog.y, this.leftAnalog.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(this.innerAnalog.x, this.innerAnalog.y, this.innerAnalog.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();
    ctx.closePath();

    // Tombol kecepatan (naik/turun)
    const { up, down } = this.speedButtons;
    ctx.fillStyle = 'rgba(144, 238, 144, 0.4)';
    ctx.fillRect(up.x, up.y, up.width, up.height);

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(up.x + up.width / 2, up.y + 10);
    ctx.lineTo(up.x + 10, up.y + up.height - 10);
    ctx.lineTo(up.x + up.width - 10, up.y + up.height - 10);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 99, 71, 0.4)';
    ctx.fillRect(down.x, down.y, down.width, down.height);

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(down.x + 10, down.y + 10);
    ctx.lineTo(down.x + down.width - 10, down.y + 10);
    ctx.lineTo(down.x + down.width / 2, down.y + down.height - 10);
    ctx.closePath();
    ctx.fill();

    // Tombol tembak
    ctx.beginPath();
    ctx.arc(this.shootButton.x, this.shootButton.y, this.shootButton.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.canShoot ? 'rgba(255, 0, 0, 0.4)' : 'rgba(128, 128, 128, 0.4)';
    ctx.fill();
    ctx.closePath();

    // Atur ukuran dan opacity emoji 💥
    const emojiOpacity = 0.2; // Opacity untuk emoji (0.0 hingga 1.0)
    const emojiSize = 50; // Ukuran font emoji
    ctx.globalAlpha = emojiOpacity; // Atur opacity
    ctx.fillStyle = 'white';
    ctx.font = `${emojiSize}px Arial`; // Atur ukuran emoji
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💥', this.shootButton.x, this.shootButton.y);
    ctx.globalAlpha = 1.0; // Reset opacity ke default

    // Cooldown indikator pada tombol tembak
    if (!this.canShoot) {
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(this.cooldownTime, this.shootButton.x, this.shootButton.y + 7);
    }

    // Gambar proyektil
    this.drawProjectiles(ctx);
}
}
