document.addEventListener("DOMContentLoaded", async () => {
  const questionText = document.getElementById("question-text");
  const btnYa = document.getElementById("btn-ya");
  const btnTidak = document.getElementById("btn-tidak");
  const progressBar = document.getElementById("progress-bar");
  const resultContainer = document.getElementById("result-container");
  const questionContainer = document.getElementById("question-container");
  const resultText = document.getElementById("result-text");
  const btnRestart = document.getElementById("btn-restart");

  try {
    const res = await fetch("data_pakar.json");
    const data = await res.json();

    let current = "m1";
    let step = 0;
    const total = Object.keys(data.pertanyaan).length;

    function tampilPertanyaan(kode) {
      const q = data.pertanyaan[kode];
      if (!q) {
        tampilHasil(kode);
        return;
      }

      step++;
      const progress = (step / total) * 100;
      progressBar.style.width = `${progress}%`;
      questionText.textContent = q.teks;

      btnYa.onclick = () => tampilPertanyaan(q.ya);
      btnTidak.onclick = () => tampilPertanyaan(q.tidak);
    }

    function tampilHasil(kode) {
      const hasil = data.solusi[kode];
      questionContainer.style.display = "none";
      resultContainer.style.display = "block";
      resultText.textContent = hasil
        ? hasil
        : "Maaf, tidak ditemukan hasil yang sesuai.";
      progressBar.style.width = "100%";
    }

    btnRestart.onclick = () => window.location.reload();

    tampilPertanyaan(current);
  } catch (err) {
    questionText.textContent = "Gagal memuat data pakar.";
    console.error(err);
  }
});
