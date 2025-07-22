export function handleBoatDestroyed(boat, container) {
  const destroyedImage = document.createElement('img');
  destroyedImage.src = 'boat_destroyed.gif'; // Path ke boat_destroyed.gif
  destroyedImage.style.position = 'absolute';
  destroyedImage.style.width = `${boat.size}px`;
  destroyedImage.style.height = `${boat.size}px`;
  destroyedImage.style.left = `${boat.x - boat.size / 2}px`;
  destroyedImage.style.top = `${boat.y - boat.size / 2}px`;
  destroyedImage.style.pointerEvents = 'none';

  container.appendChild(destroyedImage);

  // Hapus gambar setelah selesai animasi (contoh 2 detik)
  setTimeout(() => {
    destroyedImage.remove();
  }, 500);
}

export function handleEnemyDestroyed(enemy, container) {
  const destroyedImage = document.createElement('img');
  destroyedImage.src = 'enemy-boat_destroyed.gif'; // Path ke enemy-boat_destroyed.gif
  destroyedImage.style.position = 'absolute';
  destroyedImage.style.width = `${enemy.size}px`;
  destroyedImage.style.height = `${enemy.size}px`;
  destroyedImage.style.left = `${enemy.x - enemy.size / 2}px`;
  destroyedImage.style.top = `${enemy.y - enemy.size / 2}px`;
  destroyedImage.style.pointerEvents = 'none';

  container.appendChild(destroyedImage);

  // Hapus gambar setelah selesai animasi (contoh 2 detik)
  setTimeout(() => {
    destroyedImage.remove();
  }, 500);
}
