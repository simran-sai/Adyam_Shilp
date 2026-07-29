# ✦ Adyam Shilp

**Adyam Shilp** is a modern, premium e-commerce web application dedicated to Indian handcrafted goods and artisan products. It features a bespoke dark-themed aesthetic with gold accents, a robust AWS-powered backend, personalized recommendations, and full user authentication.

🌐 **Live Demo:** [adyam-shilp.vercel.app](https://adyam-shilp.vercel.app)
⚙️ **Live API:** [adyam-shilp-env.eba-bd6rx7vy.ap-south-1.elasticbeanstalk.com](http://adyam-shilp-env.eba-bd6rx7vy.ap-south-1.elasticbeanstalk.com)

---

## 🌟 Key Features

- **Premium Artisan UI:** Glassmorphism, micro-animations, and a cohesive dark/gold design token system.
- **AI-Powered Recommendation Engine:** Hybrid ML system built with Python and FastAPI, utilizing TF-IDF for content-based similarity, TruncatedSVD for collaborative filtering, and KNN for geometric item similarity.
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

**ML Microservice:**
- Python 3.11+ & FastAPI
- scikit-learn, numpy, pandas, scipy
- Uvicorn server
- Deployed on **Railway** / via Docker

**Cloud Infrastructure (AWS):**
| Service | Usage |
|---|---|
| **Elastic Beanstalk** | Backend hosting & auto-management (runs on EC2) |
| **S3** (`adyam-shilp-images`) | Product image storage & admin uploads |
| **IAM** | Role-based access control for EC2 & S3 |

---

## ☁️ Architecture

```
User (Browser)
    │
    ├──► Vercel CDN ──► React Frontend
    │
    └──► AWS Elastic Beanstalk (Node.js Backend)
              │
              ├──► MongoDB Atlas (E-Commerce DB & Events)
              │
              ├──► AWS S3 (adyam-shilp-images)
              │
              └──► Railway / Docker (Python FastAPI ML Service)
                        └── scikit-learn TF-IDF / SVD / KNN Engines
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js v18+
- Python 3.11+
- AWS Account (for S3 image uploads)
- MongoDB Atlas account

### 1. Clone the repository
```bash
git clone https://github.com/Anwesha0425/Adyam_Shilp.git
cd Adyam_Shilp
```

### 2. ML Service Setup
```bash
# Easy start (Windows):
powershell -File start-ml.ps1
```
Or manually:
```bash
cd ml-service
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
API Docs available at: `http://localhost:8000/docs`

### 3. Backend Setup
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
ML_SERVICE_URL=http://localhost:8000
```

Start the backend:
```bash
npm start
```

### 4. Frontend Setup
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

### ML Service → Railway.app
1. Push to GitHub
2. Connect Railway to the repository and select the `ml-service` folder.
3. Railway will auto-detect the Dockerfile and deploy the FastAPI service.

### Backend → AWS Elastic Beanstalk
1. Zip the `backend/` folder (excluding `node_modules/`, `.env`, `upload/`)
2. Upload to S3 and deploy via EB CLI or AWS Console
3. Set all environment variables in EB (including `ML_SERVICE_URL` pointing to the Railway ML URL)

### Frontend → Vercel
1. Import the GitHub repository on [vercel.com](https://vercel.com)
2. Set environment variable: `REACT_APP_API_URL` to your EB URL
3. Deploy

---

## 📁 Project Structure

```
Adyam_Shilp/
├── src/                        # React frontend
│   ├── Components/             # Reusable UI components
│   ├── Pages/                  # Route pages
│   ├── Context/                # React Context (ShopContext)
│   └── App.js
│
├── backend/                    # Node.js/Express API
│   ├── index.js                # Main server (S3 + MongoDB)
│   └── Dockerfile
│
├── ml-service/                 # Python FastAPI Microservice
│   ├── main.py                 # API endpoints
│   ├── recommender.py          # TF-IDF, SVD, KNN algorithms
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml          # Local docker-compose configuration
├── start-ml.ps1                # Script to start ML service
├── admin/                      # Admin dashboard
└── README.md
```

---

## 🔐 Environment Variables

> **Never commit `.env` files.**

| Variable | Where | Description |
|---|---|---|
| `MONGO_URI` | backend/.env + EB | MongoDB Atlas connection string |
| `JWT_SECRET` | backend/.env + EB | JWT signing secret |
| `AWS_ACCESS_KEY_ID` | backend/.env + EB | AWS credentials |
| `AWS_SECRET_ACCESS_KEY` | backend/.env + EB | AWS credentials |
| `AWS_REGION` | backend/.env + EB | e.g. `ap-south-1` |
| `S3_BUCKET_NAME` | backend/.env + EB | S3 bucket for images |
| `ML_SERVICE_URL` | backend/.env + EB | URL for the ML Microservice |
| `REACT_APP_API_URL` | .env + Vercel | Backend API base URL |

---

*Handcrafted with love by Indian artisans. Every piece tells a story.* 🪔
