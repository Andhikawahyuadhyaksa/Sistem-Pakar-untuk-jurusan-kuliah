document.addEventListener("DOMContentLoaded", async () => {
    const formQuiz = document.getElementById('quiz-form');
    const resultContainer = document.getElementById("result-container");
    const questionContainer = document.getElementById("quiz-form");
    const resultText = document.getElementById("result-text");
    const cfDisplay = document.getElementById("cf-final");
    const btnRestart = document.getElementById("btn-restart");

    let allRules = [];

    // 1. Memuat Aturan dari rules.json
    try {
        const res = await fetch("data_pakar.json");
        const data = await res.json();
        allRules = data.rules; // Ambil array di dalam kunci "rules"
    } catch (err) {
        // Tampilkan pesan kesalahan jika file rules.json tidak ditemukan
        resultText.textContent = "Gagal memuat aturan pakar (rules.json).";
        questionContainer.style.display = "none";
        resultContainer.style.display = "block";
        return;
    }
    
    // Fungsi untuk menggabungkan CF dari aturan PARALEL (Rumus Wajib Tugas)
    function combineCF(cfs) {
        if (cfs.length === 0) return 0;
        let cfResult = cfs[0];
        
        for (let i = 1; i < cfs.length; i++) {
            const cf1 = cfResult;
            const cf2 = cfs[i];
            
            // Rumus Penggabungan CF: CF(A) + CF(B) * (1 - CF(A))
            cfResult = cf1 + cf2 * (1 - cf1); 
        }
        return parseFloat(cfResult.toFixed(4));
    }
    
    // Fungsi Utama: Menjalankan Forward Chaining
    function runForwardChaining(facts) {
        let confirmedFacts = {};
        // Gejala user memiliki CF awal 1.0 (keyakinan penuh)
        facts.forEach(fact => confirmedFacts[fact] = { cf: 1.0 }); 
        
        let ruleFired = true;
        let finalConclusions = {};

        // Loop inferensi utama: terus berjalan selama ada fakta baru yang diciptakan
        while (ruleFired) {
            ruleFired = false;
            
            for (const rule of allRules) {
                if (rule.fired) continue; 

                const premiseCFs = [];
                // Cek apakah SEMUA premis (rule.if) ada di confirmedFacts
                const isPremiseMet = rule.if.every(premise => {
                    if (confirmedFacts[premise]) {
                        premiseCFs.push(confirmedFacts[premise].cf);
                        return true;
                    }
                    return false;
                });
                
                if (isPremiseMet) {
                    ruleFired = true; 
                    rule.fired = true; // Tandai aturan ini sudah dihitung

                    const ruleCF = rule.cf;
                    
                    // *********** FIX DI SINI: LOGIKA PREMIS MAJEMUK ***********
                    let premiseBelief; 
                    if (premiseCFs.length > 1) {
                         // CF Premis Majemuk (Sekuensial): Gunakan nilai MINIMUM dari CF semua premis
                         premiseBelief = Math.min(...premiseCFs); 
                    } else {
                         premiseBelief = premiseCFs[0];
                    }

                    // 2. CF Kesimpulan Aturan (CF[H,E] = CF[E] * CF[H|E])
                    // Ini adalah hitungan Sequential: CF dari Premis dikalikan CF dari Aturan
                    const resultingCF = premiseBelief * ruleCF; 

                    const conclusion = rule.then;
                    
                    // 3. Menyimpan/Menggabungkan Fakta (LOGIKA PARALEL)
                    if (confirmedFacts[conclusion]) {
                        // Aturan Paralel: Gabungkan CF dengan rumus combineCF
                        confirmedFacts[conclusion].cf = combineCF([confirmedFacts[conclusion].cf, resultingCF]);
                    } else {
                        // Fakta Baru (Input sekuensial berikutnya)
                        confirmedFacts[conclusion] = { cf: resultingCF };
                    }

                    // 4. Menyimpan Hasil Final (Jurusan)
                    // Jika kesimpulan ini tidak menjadi premis di aturan lain, simpan sebagai hasil final
                    if (!allRules.some(r => r.if.includes(conclusion))) {
                        if (finalConclusions[conclusion]) {
                             finalConclusions[conclusion] = combineCF([finalConclusions[conclusion], resultingCF]);
                        } else {
                            finalConclusions[conclusion] = resultingCF;
                        }
                    }
                }
            }
        }
        return finalConclusions;
    }

    // Event handler saat formulir disubmit
    formQuiz.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const selectedCheckboxes = Array.from(formQuiz.querySelectorAll('input[name="gejala"]:checked'));
        const userFacts = selectedCheckboxes.map(cb => cb.value);

        if (userFacts.length === 0) {
            alert("Anda harus memilih setidaknya satu minat/gejala.");
            return;
        }

        const finalResults = runForwardChaining(userFacts);
        
        displayFinalResult(finalResults);
        
        // Reset status 'fired' pada aturan untuk pengujian berikutnya
        allRules.forEach(rule => rule.fired = false);
    });
    
    // ... (Kode JS sebelumnya)

    function displayFinalResult(results) {
        // Tambahkan ini untuk visual progress bar
        const progressBar = document.getElementById("progress-bar");
        progressBar.style.width = "100%"; 

        questionContainer.style.display = "none";
        resultContainer.style.display = "block";

        const sortedResults = Object.entries(results)
// ... (sisa kode fungsi displayFinalResult) ...

        if (sortedResults.length > 0) {
            const [topJurusan, topCF] = sortedResults[0];
            
            resultText.innerHTML = `**${topJurusan}**`;
            cfDisplay.innerHTML = `Tingkat Keyakinan (CF) Final: **${(topCF * 100).toFixed(2)}%**`;
            
            if (sortedResults.length > 1) {
                let listHtml = '<p style="margin-top: 20px; font-weight: 600; color: #3a5eff;">Rekomendasi Lainnya:</p><ul>';
                sortedResults.slice(1, 5).forEach(([jurusan, cf]) => {
                    if (cf > 0.01) {
                        listHtml += `<li>${jurusan} (CF: ${(cf * 100).toFixed(2)}%)</li>`;
                    }
                });
                cfDisplay.innerHTML += listHtml + '</ul>';
            }
            
        } else {
            resultText.textContent = "Maaf, tidak ditemukan rekomendasi jurusan yang kuat berdasarkan jawaban Anda.";
            cfDisplay.innerHTML = "";
        }
    }

    btnRestart.onclick = () => window.location.reload();
});