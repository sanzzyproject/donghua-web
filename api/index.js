const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

// --- MASUKKAN KODE CLASS SCRAPER ANDA DI SINI (Saya rapikan sedikit) ---
class KuramanimeScraper {
    constructor() { this.baseURL = 'https://v14.kuramanime.tel'; }
    
    // ... (Fungsi generateSessionId, generateXSRFToken, generateSessionToken sama seperti kode Anda) ...
    // Agar singkat, asumsikan fungsi helper generate token ada di sini
    generateXSRFToken() {
        // ... paste logika token Anda disini jika diperlukan, atau gunakan random string jika server tidak terlalu ketat
        return crypto.randomBytes(32).toString('base64'); 
    }
    
    getHeaders() {
        return {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            'Referer': this.baseURL
        };
    }

    async searchAnime(query, orderBy = 'oldest') {
        try {
            const params = new URLSearchParams({ search: query, order_by: orderBy });
            const response = await axios.get(`${this.baseURL}/anime`, { headers: this.getHeaders(), params });
            return this.parseSearchHTML(response.data);
        } catch (e) { console.error(e); return { anime: [] }; }
    }

    parseSearchHTML(html) {
        const $ = cheerio.load(html);
        const results = { anime: [] };
        $('.filter__gallery').each((i, el) => {
            const linkEl = $(el).find('a');
            const title = linkEl.find('.sidebar-title-h5').text().trim();
            const link = linkEl.attr('href');
            const img = linkEl.find('.product__sidebar__view__item').data('setbg');
            if (link && title) {
                results.anime.push({
                    title, url: link, image: img,
                    id: link.match(/\/anime\/(\d+)/)?.[1]
                });
            }
        });
        return results;
    }

    async getAnimeDetail(id) {
        try {
            const response = await axios.get(`${this.baseURL}/anime/${id}`, { headers: this.getHeaders() });
            const $ = cheerio.load(response.data);
            const episodes = [];
            $('#episodeLists a').each((i, el) => {
                episodes.push({
                    number: $(el).text().trim(),
                    url: $(el).attr('href')
                });
            });
            return {
                title: $('.anime__details__title h3').text().trim(),
                synopsis: $('.anime__details__text p').text().trim(),
                image: $('.anime__details__pic').data('setbg'),
                episodes: episodes
            };
        } catch (e) { return null; }
    }
}

// --- ENDPOINT API ---

const scraper = new KuramanimeScraper();

// Route: Cari / Home (Default search 'isekai' buat konten dummy)
app.get('/api/home', async (req, res) => {
    const data = await scraper.searchAnime('isekai', 'updated'); // Cari yang baru update
    res.json(data);
});

// Route: Search
app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    const data = await scraper.searchAnime(q || 'action');
    res.json(data);
});

// Route: Detail
app.get('/api/detail/:id', async (req, res) => {
    const data = await scraper.getAnimeDetail(req.params.id);
    res.json(data);
});

// Export untuk Vercel
module.exports = app;
