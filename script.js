let currentProduct = {};
let basePrice = 0;

// 1. Fungsi Mengambil Produk dari API
async function muatProduk() {
    const loadingEl = document.getElementById('loading');
    const container = document.getElementById('produk-container');

    try {
        const response = await fetch('/netlify/functions/get-produk');
        if (!response.ok) throw new Error('Response API bermasalah');
        
        const data = await response.json();
        
        if (data.length === 0) {
            loadingEl.innerText = "Belum ada menu yang tersedia.";
            return;
        }

        loadingEl.style.display = 'none';
        renderProduk(data);
    } catch (err) {
        console.error(err);
        loadingEl.innerHTML = `<p style="color:red">Gagal memuat menu. Pastikan database sudah terhubung.</p>`;
    }
}

// 2. Menampilkan Kartu Produk ke HTML
function renderProduk(produk) {
    const container = document.getElementById('produk-container');
    container.innerHTML = ''; // Bersihkan container
    
    produk.forEach(p => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => openModal(p);
        card.innerHTML = `
            <img src="${p.gambar_url || 'https://via.placeholder.com/300'}" alt="${p.nama}" loading="lazy">
            <div class="card-info">
                <p class="category-tag">${p.kategori}</p>
                <h3>${p.nama}</h3>
                <span class="price">Rp ${p.harga.toLocaleString('id-ID')}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

// 3. Logika Modal (Pop-up)
function openModal(produk) {
    currentProduct = produk;
    basePrice = produk.harga;
    
    document.getElementById('modal-info').innerHTML = `
        <img src="${produk.gambar_url}" style="width:100%; border-radius:15px; height:160px; object-fit:cover; margin-bottom:15px;">
        <h2 style="font-size:1.3rem; margin-bottom:5px;">${produk.nama}</h2>
        <p style="color:#777; font-size:0.85rem; margin-bottom:15px;">${produk.deskripsi || 'Jajanan lezat kualitas premium.'}</p>
    `;

    renderDynamicOptions(produk.kategori);
    hitungTotal();
    
    const modal = document.getElementById('product-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Kunci scroll layar belakang
}

function renderDynamicOptions(kategori) {
    const container = document.getElementById('dynamic-options-container');
    let html = '';

    if (kategori === 'Si Manis') {
        html = `
            <p style="font-weight:700; font-size:0.9rem;">Pilih Varian Rasa:</p>
            <div class="option-grid">
                <label><input type="radio" name="rasa" value="Coklat" checked> Coklat</label>
                <label><input type="radio" name="rasa" value="Taro"> Taro</label>
                <label><input type="radio" name="rasa" value="Matcha"> Matcha</label>
                <label><input type="radio" name="rasa" value="Tiramisu"> Tiramisu</label>
            </div>
            <p style="font-weight:700; font-size:0.9rem;">Double Topping (+2K):</p>
            <div class="option-grid">
                <label><input type="checkbox" name="topping" value="Keju" onchange="hitungTotal()"> Keju</label>
                <label><input type="checkbox" name="topping" value="Oreo" onchange="hitungTotal()"> Oreo</label>
            </div>
        `;
    } else if (kategori === 'Si Pedas Gurih') {
        html = `
            <p style="font-weight:700; font-size:0.9rem;">Pilih Bumbu:</p>
            <div class="option-grid">
                <label><input type="radio" name="rasa" value="Balado" checked> Balado</label>
                <label><input type="radio" name="rasa" value="Jagung Manis"> Jagung Manis</label>
                <label><input type="radio" name="rasa" value="Asin"> Asin</label>
            </div>
            <p style="font-weight:700; font-size:0.9rem;">Tambahan:</p>
            <div class="option-grid">
                <label><input type="checkbox" name="topping" value="Chili Oil" onchange="hitungTotal()"> Chili Oil</label>
            </div>
        `;
    } else {
        // Untuk kategori Minuman
        html = `<input type="hidden" name="rasa" value="Original">`;
    }
    container.innerHTML = html;
}

function closeModal() {
    document.getElementById('product-modal').classList.add('hidden');
    document.body.style.overflow = 'auto'; // Aktifkan kembali scroll
}

function hitungTotal() {
    const toppings = document.querySelectorAll('input[name="topping"]:checked');
    let total = basePrice + (toppings.length * 2000);
    document.getElementById('modal-total-price').innerText = total.toLocaleString('id-ID');
}

// 4. Kirim Pesan ke WhatsApp
function kirimWA() {
    const rasaEl = document.querySelector('input[name="rasa"]:checked') || document.querySelector('input[name="rasa"]');
    const rasa = rasaEl ? rasaEl.value : '-';
    const toppings = Array.from(document.querySelectorAll('input[name="topping"]:checked')).map(t => t.value);
    
    let total = basePrice + (toppings.length * 2000);
    
    let pesan = `Halo Cee.milincius! 👋%0A%0A*PESANAN BARU*%0A--------------------------%0A`;
    pesan += `*Produk:* ${currentProduct.nama}%0A`;
    
    if (currentProduct.kategori !== 'Minuman') {
        pesan += `*Varian:* ${rasa}%0A`;
        if (toppings.length > 0) pesan += `*Ekstra:* ${toppings.join(', ')}%0A`;
    }
    
    pesan += `--------------------------%0A*Total: Rp ${total.toLocaleString('id-ID')}*%0A%0A`;
    pesan += `Mohon segera dikonfirmasi pesanan saya ya kak! Terima kasih.`;

    window.open(`https://wa.me/6285814211259?text=${pesan}`, '_blank');
}

// Jalankan fungsi saat web dibuka
window.onload = muatProduk;
