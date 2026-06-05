# ✦ Adyam Shilp

**Adyam Shilp** is a modern, premium e-commerce web application dedicated to Indian handcrafted goods and artisan products. It features a bespoke dark-themed aesthetic with gold accents, and a robust backend to handle user authentication, product management, and personalized recommendations.

## 🌟 Key Features

- **Premium Artisan UI:** A meticulously designed interface featuring glassmorphism, subtle micro-animations, and a cohesive dark/gold design token system.
- **Personalized Recommendations Engine:** A multi-signal scoring system that tracks user view history, cart frequency, and likes/dislikes to generate real-time product suggestions.
- **Full E-commerce Flow:** Browse by categories (God Idols, Home Decor, Rakhi), view detailed product pages, and manage shopping carts.
- **Authentication:** Secure user login and registration using JWT (JSON Web Tokens).
- **Responsive Design:** Fully fluid CSS Grid and Flexbox layouts optimized for mobile, tablet, and desktop viewing.

---

## 🛠️ Technology Stack

**Frontend:**
- React.js (Create React App)
- React Router DOM (Navigation)
- Vanilla CSS (Custom Design System via `index.css`)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose (Database & ORM)
- JSON Web Tokens (Authentication)
- Multer (Image uploads)

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Database (Local or MongoDB Atlas)

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder and add your configuration:
   ```env
   PORT=4000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_random_string
   BASE_URL=http://localhost:4000
   ```
4. Start the server:
   ```bash
   node index.js
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the root folder (`Adyam_Shilp`).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root folder to point to your backend API:
   ```env
   REACT_APP_API_URL=http://localhost:4000
   ```
4. Start the React development server:
   ```bash
   npm start
   ```

The application will open in your browser at `http://localhost:3000`.

---

## 🌍 Deployment

The application is configured to be deployed easily on modern cloud hosting providers.

**Backend (Render, Railway, Heroku):**
- Set the Root Directory to `backend`.
- Build Command: `npm install`
- Start Command: `node index.js`
- Remember to configure your Environment Variables (`MONGO_URI`, `JWT_SECRET`, etc.) in the provider's dashboard.

**Frontend (Vercel, Netlify):**
- Import the repository and select Create React App.
- Set the `REACT_APP_API_URL` environment variable to your deployed backend URL.
- Deploy.

---

*Handcrafted with love by Indian artisans. Every piece tells a story.*
