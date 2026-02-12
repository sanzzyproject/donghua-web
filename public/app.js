const API_URL = '/api';

window.addEventListener('DOMContentLoaded', async () => {
    const trendingGrid = document.getElementById('trendingGrid');
    
    try {
        // Tambahkan timeout di fetch frontend juga
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 detik max

        const res = await fetch(`${API_URL}/home`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`Server Error: ${res.status}`);
        
        const data = await res.json();
        
        // Cek jika data kosong atau ada error dari backend
        if (data.error) {
            throw new Error(data.error);
        }
        
        if (!data.anime || data.anime.length === 0) {
            trendingGrid.innerHTML = '<p style="text-align:center; padding:20px;">Data kosong. Mungkin IP Server Vercel diblokir oleh Kuramanime.</p>';
            return;
        }

        renderGrid(data.anime);

    } catch (err) {
        console.error(err);
        trendingGrid.innerHTML = `
            <div style="text-align:center; color:#ff6b6b; padding:20px;">
                <h3>Gagal Memuat</h3>
                <p>${err.message}</p>
                <small>Jika errornya "403" atau "Network Error", berarti Vercel diblokir oleh target.</small>
                <br><br>
                <button onclick="location.reload()" style="padding:10px 20px; background:#3b82f6; border:none; color:white; border-radius:5px;">Coba Lagi</button>
            </div>
        `;
    }
});

// ... Sisa fungsi renderGrid, doSearch, dll biarkan sama ...
