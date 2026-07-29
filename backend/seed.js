// Seed script: Insert all products from all_products.js into new Atlas cluster
// Usage: Copy backend/.env to this folder or set MONGO_URI in your environment
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

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

const ProductSchema = new mongoose.Schema({
    id: Number, name: String, category: String,
    new_price: Number, old_price: Number, img: String,
    date: { type: Date, default: Date.now },
    available: { type: Boolean, default: true },
});

async function seed() {
    console.log('🔌 Connecting to Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected!');

    const Product = mongoose.model('Product', ProductSchema);

    const existing = await Product.countDocuments();
    if (existing > 0) {
        console.log(`⚠️  ${existing} products already exist. Clearing first...`);
        await Product.deleteMany({});
    }

    console.log(`📦 Inserting ${products.length} products...`);
    await Product.insertMany(products);
    console.log(`🎉 Successfully seeded ${products.length} products!`);

    await mongoose.disconnect();
    console.log('✅ Done. Connection closed.');
}

seed().catch(err => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});
