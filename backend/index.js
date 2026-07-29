require('dotenv').config();
const port = process.env.PORT || 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require("multer");
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const path = require("path");
const cors = require('cors');

// ML Service URL (Python FastAPI on port 8000 locally, Railway URL in prod)
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// AWS S3 Client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

app.use(express.json());
app.use(cors());

// Database connection with MongoDB
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
}).then(() => {
    console.log("MongoDB Connected Successfully");
}).catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    console.warn("App will run without database. Please check your MongoDB credentials/network.");
});

// Schema for creating products
const ProductSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    img: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    },
    available: {
        type: Boolean,
        default: true,
    },
});

const Product = mongoose.model('Product', ProductSchema);

// Image Storage Engine — AWS S3
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            const filename = `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`;
            cb(null, filename);
        }
    })
});

// Upload endpoint — returns public S3 URL
app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: req.file.location  // S3 public URL
    });
});

// API creation
app.get("/", (req, res) => {
    res.send("Express App is running");
});

app.post('/addproduct', async (req, res) => {
    try {
        let products = await Product.find({});//saving all products in one array
        let id;
        if(products.length>0){
            let last_product_array=products.slice(-1);
            let last_product=last_product_array[0];
            id=last_product.id+1;
        }
        else{
            id=1;
        }

        const product = new Product({
            id:id,
            name: req.body.name,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
            img: req.body.img,
            available: req.body.available
        });
        console.log(product);
        await product.save();
        console.log("Product Added");
        res.json({
            success: true,
            name: req.body.name,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while adding the product.');
    }
});
//Creating API for deleting Products
app.post('/removeproduct',async(req,res) =>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success:true,
        name:req.body.name
    })
})
//Creating API for getting all products
app.get('/allproducts',async(req,res)=>{
    let products=await Product.find({});//Saving all products in one array
    console.log("All Products Fetched");
    res.send(products);

})

//schema creating for user model

const Users = mongoose.model('Users', {
    name:{
        type: String,
    },
    email:{
        type: String,
        unique: true,
    },
    password:{
        type: String,
    },
    cartData:{
        type: Object,
    },
    date:{
        type: Date,
        default: Date.now,
    }

})

// ── UserInteraction schema — stores behavioural events for ML collaborative filtering
const InteractionSchema = new mongoose.Schema({
    userId:    { type: String, required: true, index: true },
    productId: { type: Number, required: true },
    event:     { type: String, enum: ['view', 'like', 'dislike', 'cart'], required: true },
    weight:    { type: Number, default: 1.0 },
    ts:        { type: Number, default: () => Date.now() },
});
const Interaction = mongoose.model('Interaction', InteractionSchema);

// ── JWT middleware for ML routes ──────────────────────────────────────────────
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) { req.userId = 'anonymous'; return next(); }
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET || 'secret_ecom');
        req.userId = data.user.id;
        next();
    } catch {
        req.userId = 'anonymous';
        next();
    }
};

// ── ML proxy helper ───────────────────────────────────────────────────────────
const mlProxy = async (path, body) => {
    const res = await fetch(`${ML_SERVICE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`ML service ${path} returned ${res.status}`);
    return res.json();
};

// ── POST /api/interactions — record a behaviour event ─────────────────────────
app.post('/api/interactions', fetchUser, async (req, res) => {
    try {
        const { productId, event, weight } = req.body;
        if (!productId || !event) {
            return res.status(400).json({ success: false, error: 'productId and event required' });
        }
        await Interaction.create({
            userId:    req.userId,
            productId: Number(productId),
            event,
            weight:    weight || 1.0,
            ts:        Date.now(),
        });
        res.json({ success: true });
    } catch (err) {
        console.error('interaction error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── POST /api/recommend — hybrid ML recommendations ───────────────────────────
app.post('/api/recommend', fetchUser, async (req, res) => {
    try {
        const result = await mlProxy('/recommend', req.body);
        res.json(result);
    } catch (err) {
        console.error('ML recommend error:', err.message);
        // Graceful fallback: return empty so frontend uses heuristic
        res.status(503).json({ success: false, error: 'ML service unavailable', fallback: true });
    }
});

// ── POST /api/similar — KNN item-item similarity ──────────────────────────────
app.post('/api/similar', async (req, res) => {
    try {
        const result = await mlProxy('/similar', req.body);
        res.json(result);
    } catch (err) {
        console.error('ML similar error:', err.message);
        res.status(503).json({ success: false, error: 'ML service unavailable', fallback: true });
    }
});

// ── POST /api/trending — trending products ────────────────────────────────────
app.post('/api/trending', async (req, res) => {
    try {
        // Fetch recent global interactions from MongoDB and send to ML service
        const since = Date.now() - 24 * 60 * 60 * 1000; // last 24h
        const interactions = await Interaction.find({ ts: { $gte: since } })
            .select('userId productId event weight ts -_id')
            .limit(500)
            .lean();
        const result = await mlProxy('/trending', {
            interactions,
            limit: req.body?.limit || 6,
        });
        res.json(result);
    } catch (err) {
        console.error('ML trending error:', err.message);
        res.status(503).json({ success: false, error: 'ML service unavailable', fallback: true });
    }
});

// ── GET /api/ml/health — ML service health check ──────────────────────────────
app.get('/api/ml/health', async (req, res) => {
    try {
        const r = await fetch(`${ML_SERVICE_URL}/health`, { signal: AbortSignal.timeout(3000) });
        const data = await r.json();
        res.json({ node: 'ok', ml: data });
    } catch {
        res.status(503).json({ node: 'ok', ml: 'unavailable' });
    }
});

//creating endpoint for registering users
app.post('/signup',async(req,res)=>{
    let check = await Users.findOne({email:req.body.email});
    if(check){
        return res.status(400).json({success:false,errors:"Email already exists"});
    }
    let cart = {};
    for(let i=0;i < 300;i++){
        cart[i]=0;
    }
    const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    })

    await user.save();

    const data = {
        user:{
            id: user.id
        }
    }

    const token = jwt.sign(data, process.env.JWT_SECRET || 'secret_ecom');
    res.json({success:true,token});
})

//creating endpoint for login

app.post('/login',async(req,res)=>{
    let user = await Users.findOne({email:req.body.email});
    if(user){
        const passCompare = req.body.password === user.password;
        if(passCompare){
            const data ={
                user: {
                    id:user.id
                }
            }
            const token = jwt.sign(data, process.env.JWT_SECRET || 'secret_ecom');
            res.json({success:true,token});
        }else{
            res.json({success:false,errors:"Incorrect Password"});
        }
    } else{
        res.json({success:false,errors:"Incorrect Email Id"});
    }  
})

app.listen(port, (error) => {
    if (error) {
        console.log("Error: " + error);
    } else {
        console.log(`Server is running on port ${port}`);
    }
});

// Keep server alive even on unhandled async errors
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason?.message || reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
});
