# ⚡ Titan Fitness Center — Gym Management System

A full-stack **MERN** (MongoDB · Express · React · Node.js) Gym Membership Management System with role-based dashboards for Members, Trainers, and Admins.

![Titan Gym Banner](https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1200)

---

## 🚀 Features

### 👥 Three Role Portals
| Role | Capabilities |
|:---|:---|
| **Member** | Dashboard, Workout Plan, Trainer Bookings, QR Check-in, Payments, BMI Progress |
| **Trainer** | Assigned Members, Session Bookings, Workout Assignment |
| **Admin** | Manage Members, Trainers, Plans, Bookings & Payments |

### ✉️ Automated Email Notifications (Nodemailer)
- 📧 **Welcome Email** — Sent on new registration
- 🔑 **Password Reset PIN** — Sent directly to member inbox
- 💳 **Payment Receipt** — Auto-sent after membership activation

### 💾 Dual Database Mode
- **Live Mode** — Uses MongoDB (local or Atlas)
- **Mock Mode** — In-memory fallback if MongoDB isn't running

---

## 🛠️ Tech Stack

| Layer | Technology |
|:---|:---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| Payments | Razorpay Integration |
| Email | Nodemailer (Gmail / Ethereal) |
| PDF | PDFKit (Invoice Generation) |
| Image Upload | Cloudinary |

---

## ⚙️ Getting Started

### Prerequisites
- Node.js ≥ 18.0.0
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/titan-gym-management.git
cd titan-gym-management
```

### 2. Install Dependencies

```bash
# Install server dependencies
npm install --prefix server

# Install client dependencies
npm install --prefix client
```

### 3. Configure Environment Variables

Create `server/.env` based on `server/.env.example`:

```bash
cp server/.env.example server/.env
```

Fill in your values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/gym-management
JWT_SECRET=your_secret_key_here

# Email (leave blank for Ethereal test inbox in dev)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password

# Optional: Cloudinary (profile picture uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional: Razorpay (payment gateway)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

### 4. Seed the Database

```bash
node server/utils/seed.js
```

### 5. Run the App

```bash
# Terminal 1 — Start backend (port 5000)
node server/server.js

# Terminal 2 — Start frontend (port 3000)
npm run dev --prefix client
```

Open **http://localhost:3000** in your browser.

---

## 🔐 Demo Login Credentials

| Role | Email | Password |
|:---|:---|:---|
| **Member** | `member@titangym.com` | `member123` |
| **Trainer** | `trainer@titangym.com` | `trainer123` |
| **Admin** | `admin@titangym.com` | `admin123` |

> Use the **Quick Demo Login** buttons on the login page for 1-click access.

---

## 📁 Project Structure

```
titan-gym-management/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Navbar, Sidebar, Footer, etc.
│   │   ├── context/         # AuthContext (JWT state)
│   │   ├── pages/
│   │   │   ├── public/      # Home, Login, Register, Plans
│   │   │   └── dashboard/   # Member, Trainer & Admin pages
│   │   └── services/        # Axios API service
│   └── index.html
│
└── server/                  # Express.js backend
    ├── config/              # MongoDB connection + auto-seed
    ├── controllers/         # Auth, Member, Trainer, Admin, Payment
    ├── middleware/          # JWT protect, errorHandler
    ├── models/              # Mongoose schemas
    ├── routes/              # API route definitions
    └── utils/               # mockDb, seed, sendEmail, generateToken
```

---

## 📧 Email Setup (Gmail)

1. Go to **Google Account → Security → 2-Step Verification → App Passwords**
2. Generate an App Password for "Mail"
3. Set `EMAIL_USER` and `EMAIL_PASS` in `server/.env`

> Without credentials, the app automatically uses **Ethereal Mail** (free dev test inbox). Preview links print to the server console after each email.

---

## 📄 License

MIT © Titan Fitness Center
