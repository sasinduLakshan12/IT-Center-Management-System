<div align="center">

<img src="https://img.shields.io/badge/IT%20Center-Management%20System-6366f1?style=for-the-badge&logo=monitor&logoColor=white" alt="IT Center Management System" />

# 🖥️ IT Center Management System

**A full-stack web application for managing university IT center resources — PC bookings, check-ins, issue reporting, and administrative control.**

[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-Build%20Tool-646cff?style=flat-square&logo=vite)](https://vite.dev/)
[![License](https://img.shields.io/badge/License-ISC-green?style=flat-square)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [User Roles](#-user-roles)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

The **IT Center Management System** is a role-based web application designed for university IT labs. It streamlines the process of PC resource allocation, real-time usage monitoring, and administrative control — replacing manual booking sheets with a modern, digital workflow.

Students and lecturers can book PCs, check in/out, and report hardware issues — all in real time. Administrators get a powerful dashboard to monitor usage, manage registrations, control PC statuses, and view analytics.

---

## ✨ Features

### 👨‍🎓 Student & Lecturer Portal
- **PC Booking** — Browse available PCs and book a session with a chosen duration
- **Real-Time Check-In / Check-Out** — Arrive and leave sessions with one click
- **Issue Reporting** — Flag broken or malfunctioning PCs directly from the dashboard
- **Active Booking Tracker** — See your current session status and time remaining
- **Daily Usage Limit** — Students are limited to 3 hours (180 minutes) of PC usage per day; lecturers are unrestricted

### 🛡️ Admin Dashboard
- **User Management** — View all registered users (Students & Lecturers); approve or reject new registrations
- **PC Management** — Add new PCs, update statuses (Available / In-Use / Out-of-Order / Maintenance)
- **Booking Oversight** — View all active, completed, and pending bookings across the entire lab
- **Issue Tracker** — Monitor reported PC issues and resolve them
- **Analytics & Reports** — Usage statistics, peak hours, and resource utilization insights
- **Countdown Timers** — Live countdown display for all active bookings

### 🎨 Design & UX
- **Glassmorphism UI** — Premium frosted-glass card aesthetics with vibrant gradients
- **Fully Responsive** — Works across desktops, tablets, and mobile devices
- **Smooth Animations** — Powered by Framer Motion for fluid page transitions and micro-interactions
- **Real-Time Updates** — Dashboard auto-refreshes every 30 seconds via polling
- **Toast Notifications** — Instant feedback on all user actions

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | v19 | UI Component Framework |
| Vite | v8 | Build Tool & Dev Server |
| Tailwind CSS | v4 | Utility-First Styling |
| Framer Motion | v12 | Animations & Transitions |
| Zustand | v5 | Global State Management |
| Axios | v1 | HTTP Client |
| React Router DOM | v7 | Client-Side Routing |
| React Toastify | v11 | Toast Notifications |
| Lucide React | v1 | Icon Library |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js + Express | v5 | REST API Server |
| MongoDB + Mongoose | v9 | Database & ODM |
| JSON Web Token | v9 | Authentication |
| bcryptjs | v3 | Password Hashing |
| Nodemailer | v8 | Email Notifications |
| node-cron | v4 | Scheduled Tasks (daily reset) |
| dotenv | v17 | Environment Variables |

---

## 📁 Project Structure

```
IT Center Management System/
│
├── backend/
│   ├── config/          # Database connection (MongoDB)
│   ├── controllers/     # Route logic (auth, bookings, PCs, issues)
│   ├── middleware/      # JWT auth & role-based access control
│   ├── models/          # Mongoose schemas (User, PC, Booking, Issue)
│   ├── routes/          # Express route definitions
│   ├── utils/           # Helper utilities (email sender, etc.)
│   ├── seed.js          # Database seeder (initial PCs & admin)
│   ├── server.js        # App entry point
│   └── .env             # Environment variables (see below)
│
├── frontend/
│   └── src/
│       ├── components/  # Reusable UI components (Navbar, Footer, etc.)
│       ├── pages/       # Page components (Login, Register, Dashboards)
│       ├── store/       # Zustand auth store
│       ├── App.jsx      # Root component with routing
│       └── main.jsx     # React entry point
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- [Git](https://git-scm.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/it-center-management-system.git
cd it-center-management-system
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory (see [Environment Variables](#-environment-variables)).

```bash
# Seed the database with initial PCs and an admin account
node seed.js

# Start the backend development server
npm run dev
```

The backend will run at: **`http://localhost:5000`**

---

### 3. Frontend Setup

```bash
cd frontend
npm install

# Start the frontend development server
npm run dev
```

The frontend will run at: **`http://localhost:5173`**

---

### 4. Default Admin Credentials

After running `node seed.js`, use these credentials to log in as admin:

```
Email:    admin@itcenter.com
Password: admin123
```

> ⚠️ **Important:** Change the default admin password immediately after first login in a production environment.

---

## 🔑 Environment Variables

Create a file at `backend/.env` with the following:

```env
# MongoDB Connection String
MONGO_URI=mongodb://localhost:27017/it-center

# JWT Secret Key (use a strong, random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Server Port
PORT=5000

# Email Configuration (optional — for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

## 👥 User Roles

The system supports **three roles**:

| Role | Description | Daily PC Limit | Approval Required |
|---|---|---|---|
| **Student** | Can book PCs, check in/out, report issues | 3 hours (180 min) | Yes (Admin must approve) |
| **Lecturer** | Can book PCs, check in/out, report issues | No limit | Yes (Admin must approve) |
| **Admin** | Full system control, user & PC management | N/A | Pre-seeded |

> New Student and Lecturer registrations require **Admin approval** before the account becomes active.

---

## 📡 API Endpoints

### Auth Routes — `/api/auth`
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/register` | Register new user (Student/Lecturer) | Public |
| `POST` | `/login` | Login and get JWT token | Public |
| `GET` | `/me` | Get current user profile | Private |

### PC Routes — `/api/pcs`
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/` | Get all PCs | Private |
| `POST` | `/` | Add a new PC | Admin |
| `PUT` | `/:id` | Update PC status | Admin |
| `DELETE` | `/:id` | Remove a PC | Admin |

### Booking Routes — `/api/bookings`
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/` | Create a new booking | Student/Lecturer |
| `GET` | `/my-active` | Get current user's active booking | Private |
| `PUT` | `/:id/checkin` | Check into a booking | Private |
| `PUT` | `/:id/checkout` | Check out of a booking | Private |
| `GET` | `/all` | Get all bookings | Admin |

### User Management — `/api/users`
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/` | Get all users | Admin |
| `PUT` | `/:id/approve` | Approve user registration | Admin |
| `DELETE` | `/:id` | Delete a user | Admin |

### Issue Routes — `/api/issues`
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/` | Report a PC issue | Student/Lecturer |
| `GET` | `/` | Get all reported issues | Admin |
| `PUT` | `/:id/resolve` | Mark issue as resolved | Admin |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a **Pull Request**

---

## 📄 License

This project is licensed under the **ISC License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ for university IT resource management

**[⬆ Back to Top](#%EF%B8%8F-it-center-management-system)**

</div>
