// Migration script: Copy products from old Atlas → new Atlas
const mongoose = require('mongoose');

const OLD_URI = 'mongodb+srv://simranpatrosai1:aJToA6k1phzZhrWJ@cluster0.dbwn4xb.mongodb.net/E-Commerce';
const NEW_URI = 'mongodb+srv://anwesharanigouda_db_user:h0Av03iI7bwkvmR3@cluster0.v2nan8e.mongodb.net/E-Commerce';

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
        // Remove _id so MongoDB generates new ones
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
