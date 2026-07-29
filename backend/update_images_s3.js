// Update product image URLs in MongoDB to point to S3
const http = require('http');

const API = 'adyam-shilp-env.eba-bd6rx7vy.ap-south-1.elasticbeanstalk.com';
const S3_BASE = 'https://adyam-shilp-images.s3.ap-south-1.amazonaws.com/products';

// Map product IDs to their image filenames
const imageMap = {
    1: 'product_1.jpg', 2: 'product_2.jpg', 3: 'product_3.jpg',
    4: 'product_4.jpg', 5: 'product_5.jpg', 6: 'product_6.jpg',
    7: 'product_7.jpg', 8: 'product_8.jpg', 9: 'product_9.jpg',
    10: 'product_10.jpg', 11: 'product_11.jpg', 12: 'product_12.jpg',
    13: 'product_13.jpg', 14: 'product_14.jpg', 15: 'product_15.jpg',
    16: 'product_16.jpg', 17: 'product_17.jpg', 18: 'product_18.jpg',
    19: 'product_19.jpg', 20: 'product_20.jpg', 21: 'product_21.jpg',
    22: 'product_22.jpg', 23: 'product_23.jpg', 24: 'product_24.jpg',
    25: 'product_25.jpg', 26: 'product_26.jpg', 27: 'product_27.jpg',
    28: 'product_28.jpg', 29: 'product_29.jpg', 30: 'product_30.jpg',
    38: 'product_38.jpg', 46: 'product_46.jpg', 53: 'product_53.jpg',
};

function getProducts() {
    return new Promise((resolve, reject) => {
        http.get({ hostname: API, path: '/allproducts' }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

function removeProduct(id) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ id });
        const req = http.request({
            hostname: API, path: '/removeproduct', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
        }, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve(JSON.parse(d))); });
        req.on('error', reject); req.write(body); req.end();
    });
}

function addProduct(p) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(p);
        const req = http.request({
            hostname: API, path: '/addproduct', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
        }, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve(JSON.parse(d))); });
        req.on('error', reject); req.write(body); req.end();
    });
}

async function updateImages() {
    console.log('📦 Fetching products from MongoDB...');
    const products = await getProducts();
    console.log(`Found ${products.length} products. Updating image URLs to S3...\n`);

    for (const p of products) {
        const imgFile = imageMap[p.id];
        if (!imgFile) { console.log(`  ⚠️  [${p.id}] No image mapping — skipping`); continue; }
        const newImg = `${S3_BASE}/${imgFile}`;
        if (p.img === newImg) { console.log(`  ✅ [${p.id}] Already S3`); continue; }

        await removeProduct(p.id);
        await addProduct({ name: p.name, category: p.category, new_price: p.new_price, old_price: p.old_price, img: newImg, available: p.available });
        console.log(`  ✅ [${p.id}] ${p.name} → ${newImg}`);
    }
    console.log('\n🎉 All image URLs updated to S3!');
}

updateImages().catch(e => console.error('❌', e.message));
