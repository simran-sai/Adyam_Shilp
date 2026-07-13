# ✦ Adyam Shilp

**Adyam Shilp** is a modern, premium e-commerce web application dedicated to Indian handcrafted goods and artisan products. It features a bespoke dark-themed aesthetic with gold accents, a robust AWS-powered backend, personalized recommendations, and full user authentication.

🌐 **Live Demo:** [adyam-shilp.vercel.app](https://adyam-shilp.vercel.app)
⚙️ **Live API:** [adyam-shilp-env.eba-bd6rx7vy.ap-south-1.elasticbeanstalk.com](http://adyam-shilp-env.eba-bd6rx7vy.ap-south-1.elasticbeanstalk.com)

---

## 🌟 Key Features

- **Premium Artisan UI:** Glassmorphism, micro-animations, and a cohesive dark/gold design token system.
- **Personalized Recommendations Engine:** Multi-signal scoring system tracking view history, cart frequency, and likes/dislikes for real-time product suggestions.
- **Full E-commerce Flow:** Browse by categories (God Idols, Home Decor, Accessories & Rakhi), view product pages, and manage a shopping cart.
- **Authentication:** Secure user login and registration using JWT (JSON Web Tokens).
- **Admin Dashboard:** Add, remove, and manage products via a dedicated admin panel.
- **Responsive Design:** Fluid CSS Grid and Flexbox layouts for mobile, tablet, and desktop.

---

## 🛠️ Technology Stack

**Frontend:**
- React.js (Create React App)
- React Router DOM
- Vanilla CSS (Custom Design System)
- Deployed on **Vercel**

**Backend:**
- Node.js & Express.js
- MongoDB Atlas & Mongoose
- JSON Web Tokens (Authentication)
- Multer + **AWS S3** (Image uploads)
- Deployed on **AWS Elastic Beanstalk** (Node.js 22, Amazon Linux 2023)

**Cloud Infrastructure (AWS):**
| Service | Usage |
|---|---|
| **Elastic Beanstalk** | Backend hosting & auto-management (runs on EC2) |
| **S3** (`adyam-shilp-images`) | Product image storage & admin uploads |
| **IAM** | Role-based access control for EC2 & S3 |

---

## ☁️ AWS Architecture

```
User (Browser)
    │
    ├──► Vercel CDN ──► React Frontend
    │
    └──► AWS Elastic Beanstalk (ap-south-1)
              │
              ├──► EC2 Instance (Node.js 22)
              │         └── Express.js REST API
              │
              ├──► MongoDB Atlas (E-Commerce DB)
              │         ├── Products collection
              │         └── Users collection
              │
              └──► AWS S3 (adyam-shilp-images)
                        ├── products/ (59 images)
                        └── deployments/ (app bundles)
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js v18+
- AWS Account (for S3 image uploads)
- MongoDB Atlas account

### 1. Clone the repository
```bash
git clone https://github.com/Anwesha0425/Adyam_Shilp.git
cd Adyam_Shilp
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_string
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your_s3_bucket_name
```

Start the backend:
```bash
npm start
```

### 3. Frontend Setup
```bash
# From the root Adyam_Shilp/ folder
npm install
```

Create a `.env` file in the root folder:
```env
REACT_APP_API_URL=http://localhost:4000
```

Start the React dev server:
```bash
npm start
```

The app opens at `http://localhost:3000`.

---

## 🌍 Deployment

### Backend → AWS Elastic Beanstalk

1. Install & configure AWS CLI:
   ```bash
   aws configure
   ```
2. Create an S3 bucket for images
3. Zip the `backend/` folder (excluding `node_modules/`, `.env`, `upload/`)
4. Upload to S3 and deploy via EB CLI or AWS Console
5. Set all environment variables in EB → Configuration → Software

### Frontend → Vercel

1. Import the GitHub repository on [vercel.com](https://vercel.com)
2. Set environment variable:
   ```
   REACT_APP_API_URL = https://your-eb-url.elasticbeanstalk.com
   ```
3. Deploy

### Database Seeding (New Atlas Cluster)
If you need to seed products into a fresh MongoDB cluster, use:
```bash
cd backend
node seed_via_api.js   # Seeds 33 products via the live API
```

---

## 📁 Project Structure

```
Adyam_Shilp/
├── src/                        # React frontend
│   ├── Components/             # Reusable UI components
│   │   ├── Assets/             # Local images & product data
│   │   ├── Navbar/
│   │   ├── Hero/
│   │   ├── Item/
│   │   └── ...
│   ├── Pages/                  # Route pages
│   ├── Context/                # React Context (ShopContext)
│   └── App.js
│
├── backend/                    # Node.js/Express API
│   ├── index.js                # Main server (S3 + MongoDB)
│   ├── package.json
│   ├── .ebignore               # Elastic Beanstalk ignore rules
│   ├── seed_via_api.js         # Product seeder script
│   └── update_images_s3.js     # Migrate image URLs to S3
│
├── admin/                      # Admin dashboard
├── .gitignore
└── README.md
```

---

## 🔐 Environment Variables

> **Never commit `.env` files.** All secrets are managed via AWS EB environment variables and local `.env` files (git-ignored).

| Variable | Where | Description |
|---|---|---|
| `MONGO_URI` | backend/.env + EB | MongoDB Atlas connection string |
| `JWT_SECRET` | backend/.env + EB | JWT signing secret |
| `AWS_ACCESS_KEY_ID` | backend/.env + EB | AWS credentials |
| `AWS_SECRET_ACCESS_KEY` | backend/.env + EB | AWS credentials |
| `AWS_REGION` | backend/.env + EB | e.g. `ap-south-1` |
| `S3_BUCKET_NAME` | backend/.env + EB | S3 bucket for images |
| `REACT_APP_API_URL` | .env + Vercel | Backend API base URL |

---

*Handcrafted with love by Indian artisans. Every piece tells a story.* 🪔
