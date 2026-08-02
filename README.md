# ⚡ Titan Fitness Center — Gym Management System

A professional full-stack **MERN (MongoDB · Express.js · React · Node.js)** Gym Management System with secure authentication and role-based dashboards for **Members, Trainers, and Admins**.

The application provides complete gym operations management including memberships, attendance tracking, payments, trainers, workout plans, and analytics.

![Titan Gym Banner](https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1200)

---

## 🌐 Live Demo

🚀 Frontend: https://gym-management-system-eqqcukg8l-shivani-a142.vercel.app

⚙️ Backend API: https://titan-gym-management.onrender.com

Database: MongoDB Atlas Cloud


---

# 🚀 Features

## 👥 Role-Based Dashboard System

| Role | Features |
|---|---|
| **Member** | Personal dashboard, profile management, workout plans, attendance, payments, membership details |
| **Trainer** | Manage assigned members, workout assignments, training sessions |
| **Admin** | Complete gym management, members, trainers, plans, payments, analytics |

---

## 🔐 Authentication & Security

- JWT-based authentication
- Protected routes
- Role-based authorization
- Secure password hashing using bcrypt
- Persistent login sessions

---

## 🏋️ Gym Management Features

### Members
- Add, update, delete members
- Track membership details
- View attendance records
- Manage payments

### Trainers
- Trainer management
- Assign members
- Manage training sessions

### Admin Panel
- Dashboard analytics
- Member statistics
- Payment tracking
- Membership plan management

---

## ☁️ Cloud Deployment

The project is fully deployed using:

| Service | Purpose |
|---|---|
| Vercel | React Frontend Hosting |
| Render | Node.js Backend Hosting |
| MongoDB Atlas | Cloud Database |

---

# 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Vite |
| Styling | Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT + bcrypt |
| API Communication | Axios |
| Deployment | Vercel + Render |
| Database Hosting | MongoDB Atlas |

---

# ⚙️ Installation & Setup

## Prerequisites

- Node.js >= 18
- MongoDB Atlas account or local MongoDB

---



## 🔐 Demo Login Credentials

| Role | Email | Password |
|:---|:---|:---|
| **Member** | `member@titangym.com` | `member123` |
| **Trainer** | `trainer@titangym.com` | `trainer123` |
| **Admin** | `admin@titangym.com` | `admin123` |

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

## 👩‍💻 Shivani Dhakate

GitHub: https://github.com/shivanidhakate
---

## 📄 License

MIT © Titan Fitness Center
