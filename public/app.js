const API_URL = '/api'; // Relative path untuk Vercel

// Elemen DOM
const homeView = document.getElementById('homeView');
const playerView = document.getElementById('playerView');
const trendingGrid = document.getElementById('trendingGrid');

// 1. Load Data Awal
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch(`${API_URL}/home`);
        const data = await res.json();
        renderGrid(data.anime);
    } catch (err) {
        trendingGrid.innerHTML = '<p style="color:red">Gagal memuat data. Coba refresh.</p>';
    }
});

// 2. Render Grid Anime
function renderGrid(animeList) {
    trendingGrid.innerHTML = '';
    animeList.forEach(anime => {
        const div = document.createElement('div');
        div.className = 'card';
        div.onclick = () => loadDetail(anime.id);
        div.innerHTML = `
            <img src="${anime.image}" loading="lazy" alt="${anime.title}">
            <div class="card-content">
                <div class="card-title">${anime.title}</div>
            </div>
        `;
        trendingGrid.appendChild(div);
    });
}

// 3. Search Function
async function doSearch() {
    const query = document.getElementById('searchInput').value;
    if(!query) return;
    
    trendingGrid.innerHTML = '<div class="loading">Mencari...</div>';
    const res = await fetch(`${API_URL}/search?q=${query}`);
    const data = await res.json();
    renderGrid(data.anime);
    goHome(); // Pastikan ada di view home
}

// 4. Load Detail & Episodes
async function loadDetail(id) {
    // Switch View
    homeView.classList.add('hidden');
    playerView.classList.remove('hidden');
    window.scrollTo(0,0);

    const infoDiv = document.getElementById('animeInfo');
    const epDiv = document.getElementById('episodeList');
    
    infoDiv.innerHTML = '<div class="loading">Memuat detail...</div>';
    epDiv.innerHTML = '';

    const res = await fetch(`${API_URL}/detail/${id}`);
    const data = await res.json();

    if(!data) {
        infoDiv.innerHTML = 'Error memuat detail.';
        return;
    }

    infoDiv.innerHTML = `
        <h1>${data.title}</h1>
        <p>${data.synopsis}</p>
    `;

    data.episodes.forEach(ep => {
        const btn = document.createElement('a');
        btn.className = 'ep-btn';
        btn.innerText = ep.number;
        // Karena tidak ada link video asli, kita buat dummy alert
        btn.href = "#"; 
        btn.onclick = (e) => {
            e.preventDefault();
            playVideo(ep.url); 
        };
        epDiv.appendChild(btn);
    });
}

function playVideo(url) {
    // DISINI LOGIKA PEMUTARAN VIDEO
    // Karena scraper asli belum ambil link .mp4, kita hanya notifikasi
    alert("Scraper ini belum memiliki logika ekstraktor video. Link halaman episode: " + url);
    // Jika sudah ada link mp4, ubah src iframe/video tag
}

function goHome() {
    playerView.classList.add('hidden');
    homeView.classList.remove('hidden');
}
