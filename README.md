# 🚀 Real-Time Bulk SMS & Campaign Dashboard

A high-performance, full-stack application for managing SMS campaigns with real-time tracking. This project features a robust **Node.js/Express** backend and a sleek **React/Tailwind** frontend, integrated with **Socket.io** for live status updates

### Backend
- **Runtime:** Node.js & Express.js
- **Database:** MongoDB (Mongoose)
- **Real-time Engine:** Socket.io
- **Auth:** JWT with `httpOnly` Cookies
- **Security:** Bcrypt, CORS, Helmet

---

## ✨ Key Features

### 📡 Real-Time Status Tracking
- Integrated **Socket.io** to provide instant feedback. When a message status changes (Pending → Sent/Failed), the UI updates automatically without page refreshes.

### 📊 Dynamic History Grid
- **Sorted View:** Automatically displays the latest transmissions (`sentAt`) at the top.
- **Card-based UI:** Fully responsive grid layout optimized for mobile (No horizontal scrolling).
- **Workable CSV Export:** Export filtered history logs directly to CSV for reporting.

### 🔐 Secure Authentication
- JWT-based auth where tokens are securely stored in cross-site `httpOnly` cookies (`sameSite: 'none'`, `secure: true`).

---

## 🚀 Installation & Setup

### 1. Clone the Repositories
```bash
# Frontend
git clone [https://github.com/your-username/frontend-repo.git](https://github.com/your-username/frontend-repo.git)

# Backend
git clone [https://github.com/your-username/backend-repo.git](https://github.com/your-username/backend-repo.git)

### Code snippet
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
FRONTEND_URL=[https://your-app.netlify.app](https://your-app.netlify.app)
NODE_ENV=production

## Start Development
npm install
npm run dev

## Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});
