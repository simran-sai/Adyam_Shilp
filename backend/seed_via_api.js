// Seed via live EB API (already connected to Atlas)
const http = require('http');

const API = 'adyam-shilp-env.eba-bd6rx7vy.ap-south-1.elasticbeanstalk.com';
const BASE_IMG = 'https://adyam-shilp.vercel.app/static/media';

const products = [
    { id: 1,  name: "Lippan Art of Jagannatha",    new_price: 1500, old_price: 2000, category: "God Idols",              img: `${BASE_IMG}/product_1.jpg` },
    { id: 2,  name: "Couple Idol Frame",            new_price: 900,  old_price: 1000, category: "Home Decor",             img: `${BASE_IMG}/product_2.jpg` },
    { id: 3,  name: "Theme based photoframe",       new_price: 190,  old_price: 200,  category: "Home Decor",             img: `${BASE_IMG}/product_3.jpg` },
    { id: 4,  name: "Rakhi bands",                  new_price: 45,   old_price: 50,   category: "Accessories and Rakhi",  img: `${BASE_IMG}/product_4.jpg` },
    { id: 5,  name: "Theme based photoframe",       new_price: 200,  old_price: 300,  category: "Home Decor",             img: `${BASE_IMG}/product_5.jpg` },
    { id: 6,  name: "Hand made clay portrait",      new_price: 1500, old_price: 2000, category: "Home Decor",             img: `${BASE_IMG}/product_6.jpg` },
    { id: 7,  name: "NamePlate",                    new_price: 90,   old_price: 100,  category: "Home Decor",             img: `${BASE_IMG}/product_7.jpg` },
    { id: 8,  name: "Beautiful Clay Dolls",         new_price: 1900, old_price: 2000, category: "Home Decor",             img: `${BASE_IMG}/product_8.jpg` },
    { id: 9,  name: "Clay Dolls",                   new_price: 25,   old_price: 30,   category: "Home Decor",             img: `${BASE_IMG}/product_9.jpg` },
    { id: 10, name: "Clay Mickey Mouse",             new_price: 90,   old_price: 100,  category: "Home Decor",             img: `${BASE_IMG}/product_10.jpg` },
    { id: 11, name: "wall clock",                   new_price: 1900, old_price: 2000, category: "Accessories and Rakhi",  img: `${BASE_IMG}/product_11.jpg` },
    { id: 12, name: "wall clock",                   new_price: 1900, old_price: 2000, category: "Accessories and Rakhi",  img: `${BASE_IMG}/product_12.jpg` },
    { id: 13, name: "wall clock",                   new_price: 1500, old_price: 1745, category: "Accessories and Rakhi",  img: `${BASE_IMG}/product_13.jpg` },
    { id: 14, name: "wall clock",                   new_price: 1500, old_price: 1800, category: "Accessories and Rakhi",  img: `${BASE_IMG}/product_14.jpg` },
    { id: 15, name: "wall clock",                   new_price: 1290, old_price: 1400, category: "Accessories and Rakhi",  img: `${BASE_IMG}/product_15.jpg` },
    { id: 16, name: "Rakhi Bands",                  new_price: 1290, old_price: 1400, category: "Accessories and Rakhi",  img: `${BASE_IMG}/product_16.jpg` },
    { id: 17, name: "Birth Details Photoframe",     new_price: 1290, old_price: 1400, category: "Home Decor",             img: `${BASE_IMG}/product_17.jpg` },
    { id: 18, name: "Clay Dinosaur",                new_price: 1290, old_price: 1400, category: "Home Decor",             img: `${BASE_IMG}/product_18.jpg` },
    { id: 19, name: "Key Rings",                    new_price: 1290, old_price: 1400, category: "Accessories and Rakhi",  img: `${BASE_IMG}/product_19.jpg` },
    { id: 20, name: "Customised Hangings",          new_price: 1290, old_price: 1400, category: "Accessories and Rakhi",  img: `${BASE_IMG}/product_20.jpg` },
    { id: 21, name: "Birth Details Photoframe",     new_price: 1290, old_price: 1400, category: "Home Decor",             img: `${BASE_IMG}/product_21.jpg` },
    { id: 22, name: "Customised Key Ring",          new_price: 1290, old_price: 1400, category: "Accessories and Rakhi",  img: `${BASE_IMG}/product_22.jpg` },
    { id: 23, name: "Earrings",                     new_price: 1290, old_price: 1400, category: "Accessories and Rakhi",  img: `${BASE_IMG}/product_23.jpg` },
    { id: 24, name: "Ganesh Ji",                    new_price: 1290, old_price: 1400, category: "God Idols",              img: `${BASE_IMG}/product_24.jpg` },
    { id: 25, name: "Clay Bike",                    new_price: 1290, old_price: 1400, category: "Home Decor",             img: `${BASE_IMG}/product_25.jpg` },
    { id: 26, name: "Jaganatha Ji",                 new_price: 1290, old_price: 1400, category: "God Idols",              img: `${BASE_IMG}/product_26.jpg` },
    { id: 27, name: "Glass Covers",                 new_price: 1290, old_price: 1400, category: "Home Decor",             img: `${BASE_IMG}/product_27.jpg` },
    { id: 28, name: "Masks",                        new_price: 1290, old_price: 1400, category: "Accessories and Rakhi",  img: `${BASE_IMG}/product_28.jpg` },
    { id: 29, name: "Shiv Ji",                      new_price: 1290, old_price: 1400, category: "God Idols",              img: `${BASE_IMG}/product_29.jpg` },
    { id: 30, name: "Clay Santa",                   new_price: 1290, old_price: 1400, category: "Home Decor",             img: `${BASE_IMG}/product_30.jpg` },
    { id: 38, name: "Hand made clay portrait",      new_price: 1500, old_price: 2000, category: "Home Decor",             img: `${BASE_IMG}/product_38.jpg` },
    { id: 46, name: "Hand made clay portrait",      new_price: 1500, old_price: 2000, category: "Home Decor",             img: `${BASE_IMG}/product_46.jpg` },
    { id: 53, name: "Hand made clay portrait",      new_price: 1500, old_price: 2000, category: "Home Decor",             img: `${BASE_IMG}/product_53.jpg` },
];

function postProduct(product) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(product);
        const options = {
            hostname: API,
            path: '/addproduct',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
        };
        const req = http.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function seed() {
    console.log(`🚀 Seeding ${products.length} products via live EB API...`);
    let success = 0;
    for (const p of products) {
        try {
            const res = await postProduct(p);
            if (res.success) { console.log(`  ✅ [${p.id}] ${p.name}`); success++; }
            else console.log(`  ⚠️  [${p.id}] ${p.name} — ${JSON.stringify(res)}`);
        } catch (e) {
            console.log(`  ❌ [${p.id}] ${p.name} — ${e.message}`);
        }
    }
    console.log(`\n🎉 Done! ${success}/${products.length} products seeded.`);
}

seed();
