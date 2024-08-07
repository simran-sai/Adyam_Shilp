const port = 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require("multer");
const path = require("path");
const cors = require('cors');

app.use(express.json());
app.use(cors());

// Database connection with MongoDB
mongoose.connect("mongodb+srv://simranpatrosai1:aJToA6k1phzZhrWJ@cluster0.dbwn4xb.mongodb.net/E-Commerce");

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

// Image Storage Engine
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage
});

// Creating upload endpoints for images
app.use('/images', express.static(path.join('upload/images')));
app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
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
    await Product.findOneAndDeleter({id:req.body.id});
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

    const token = jwt.sign(data, 'secret_ecom');
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
            const token = jwt.sign(data,'secret_ecom');
            res.json({success:true,token});
        }else{
            rmSync.json({success:false,errors:"Incorrect Password"});
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
