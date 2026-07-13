// Migration script: Copy products from old Atlas → new Atlas
// Usage: Set OLD_MONGO_URI and NEW_MONGO_URI in your .env or environment
require('dotenv').config();
const mongoose = require('mongoose');

const OLD_URI = process.env.OLD_MONGO_URI || process.env.MONGO_URI;
const NEW_URI = process.env.NEW_MONGO_URI || process.env.MONGO_URI;

if (!OLD_URI || !NEW_URI) {
    console.error('❌ Please set OLD_MONGO_URI and NEW_MONGO_URI in your environment.');
    process.exit(1);
}

const ProductSchema = new mongoose.Schema({
    id: Number,
    name: String,
    category: String,
    new_price: Number,
    old_price: Number,
    img: String,
    date: Date,
    available: Boolean,
});

async function migrate() {
    console.log('🔌 Connecting to OLD Atlas cluster...');
    const oldConn = await mongoose.createConnection(OLD_URI).asPromise();
    const OldProduct = oldConn.model('Product', ProductSchema);

    console.log('🔌 Connecting to NEW Atlas cluster...');
    const newConn = await mongoose.createConnection(NEW_URI).asPromise();
    const NewProduct = newConn.model('Product', ProductSchema);

    console.log('📦 Fetching all products from old cluster...');
    const products = await OldProduct.find({}).lean();
    console.log(`✅ Found ${products.length} products`);

    if (products.length === 0) {
        console.log('⚠️  No products found in old database. Nothing to migrate.');
    } else {
        console.log('💾 Inserting into new cluster...');
        const clean = products.map(({ _id, __v, ...rest }) => rest);
        await NewProduct.insertMany(clean, { ordered: false });
        console.log(`🎉 Successfully migrated ${products.length} products!`);
    }

    await oldConn.close();
    await newConn.close();
    console.log('✅ Migration complete. Connections closed.');
}

migrate().catch(err => {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
});
