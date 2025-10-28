document.addEventListener('DOMContentLoaded', async () => {
  const pertanyaanText = document.getElementById('pertanyaan-text');
  const btnYa = document.getElementById('btn-ya');
  const btnTidak = document.getElementById('btn-tidak');
  const hasilBox = document.getElementById('hasil-box');
  const hasilText = document.getElementById('hasil-text');
  const pertanyaanBox = document.getElementById('pertanyaan-box');

  try {
    const res = await fetch('data_pakar.json');
    const data = await res.json();

    let currentCode = 'm1'; // mulai dari pertanyaan pertama

    function tampilkanPertanyaan(kode) {
      const p = data.pertanyaan[kode];

      // Jika kode adalah solusi (misalnya "s1", "s2", dll)
      if (!p) {
        tampilkanSolusi(kode);
        return;
      }

      pertanyaanText.textContent = p.teks;

      btnYa.onclick = () => {
        tampilkanPertanyaan(p.ya);
      };

      btnTidak.onclick = () => {
        tampilkanPertanyaan(p.tidak);
      };
    }

    function tampilkanSolusi(kodeSolusi) {
      const hasil = data.solusi[kodeSolusi];
      pertanyaanBox.style.display = 'none';
      hasilBox.style.display = 'block';
      hasilText.textContent = hasil ? hasil : 'Tidak ada hasil yang sesuai.';
    }

    // tampilkan pertanyaan pertama
    tampilkanPertanyaan(currentCode);
  } catch (error) {
    pertanyaanText.textContent = 'Gagal memuat data pakar.';
    console.error(error);
  }
});
