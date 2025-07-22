class SoundEffect {
  constructor() {
    // Inisialisasi audio untuk background sound
    this.backgroundSound = new Audio('sounds/background.mp3');
    this.backgroundSound.loop = true; // Loop agar terus diputar
    this.backgroundSound.volume = 0.5; // Volume awal (0.0 hingga 1.0)
    this.isPlaying = false; // Status apakah audio sedang diputar
  }

  // Fungsi untuk memulai background sound
  playBackgroundSound() {
    if (!this.isPlaying) {
      this.backgroundSound
        .play()
        .then(() => {
          this.isPlaying = true; // Tandai sebagai sedang diputar
        })
        .catch((error) => {
          console.error('Audio playback error:', error);
        });
    }
  }

  // Fungsi untuk menghentikan background sound
  stopBackgroundSound() {
    if (this.isPlaying) {
      this.backgroundSound.pause();
      this.backgroundSound.currentTime = 0; // Reset ke awal
      this.isPlaying = false;
    }
  }

  // Fungsi untuk mengatur volume
  setVolume(volume) {
    if (volume >= 0 && volume <= 1) {
      this.backgroundSound.volume = volume;
    } else {
      console.warn('Volume harus antara 0.0 dan 1.0');
    }
  }

  // Fungsi toggle untuk background sound
  toggleBackgroundSound() {
    if (this.isPlaying) {
      this.stopBackgroundSound();
    } else {
      this.playBackgroundSound();
    }
  }
}

export default SoundEffect;