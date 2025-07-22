//Fungsi untuk mendapatkan leaderboard dari server
export async function fetchLeaderboard() {
  try {
    const response = await fetch('https://shiemir.my.id/boat_adventure/leaderboard.php');
    const leaderboard = await response.json();
    return leaderboard; // Kembalikan leaderboard dalam bentuk JSON
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return [];
  }
}

// Fungsi untuk menambahkan skor ke leaderboard
export async function sendScoreToServer(name, score) {
  try {
    const response = await fetch('https://shiemir.my.id/boat_adventure/leaderboard.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, score }),
    });

    const text = await response.text();
    console.log("Server response (raw):", text);

    // Coba parse JSON jika mungkin
    try {
      const data = JSON.parse(text);
      console.log("Parsed response:", data);
      return true;
    } catch (parseError) {
      console.warn("Gagal parsing JSON:", parseError);
      return false;
    }

  } catch (error) {
    console.error('Failed to send score:', error);
    return false;
  }
}

// Fungsi untuk menampilkan leaderboard di console (opsional, untuk debugging)
export async function logLeaderboard() {
  const leaderboard = await fetchLeaderboard();
  console.table(leaderboard);
}

//Fungsi untuk menangani Game Over
export async function handleGameOver(score) {
  if (confirm('Do you want to record your score in the leaderboard?')) {
    const playerName = prompt('Enter your name (max 7 characters):');
    if (playerName) {
      const success = await sendScoreToServer(playerName.slice(0, 7), score);
      if (success) {
        window.location.href = 'leaderboard.html';
      } else {
        alert('Failed to submit score. Check console for details.');
        window.location.href = 'leaderboard.html'; // tetap lanjut
      }
    }
  } else {
    window.location.href = 'leaderboard.html';
  }
}
