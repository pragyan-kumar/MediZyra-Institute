<div align="center">

# 🏥 MediZyra Healthcare Solutions

**A full-stack care coordination platform for hospitals and clinics — streamlining patient onboarding, appointment triage, doctor consultations, and medical record management through a secure, role-based digital workspace.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)](https://vite.dev)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Embedded-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com)
[![Node](https://img.shields.io/badge/Node.js-20%2B-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Demo Credentials](#-demo-credentials)
- [Role Capabilities](#-role-capabilities)
- [API Reference](#-api-reference)
- [Doctor Catalog](#-doctor-catalog)
- [Environment Variables](#-environment-variables)
- [Scripts](#-scripts)

---

## 🌟 Overview

MediZyra is a modern healthcare management system that replaces fragmented clinic workflows with a single, structured digital platform. It supports three roles — **Admin**, **Doctor**, and **Patient** — each with a dedicated workspace tailored to their responsibilities.

The platform works **out of the box** with no MongoDB installation required — it automatically spins up an embedded in-memory database using `mongodb-memory-server`. For production deployments, simply point `MONGO_URI` to your MongoDB instance.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Role-based authentication** | Separate login flows for Admin, Doctor, and Patient accounts |
| 📅 **Appointment request & triage** | Patients request slots → Admin triages → Doctor confirms & completes |
| 🩺 **Doctor consultation workspace** | Focused queue of assigned patients with symptom context, notes & prescriptions |
| 📊 **Admin command desk** | Full visibility into all appointments, status management, and intake notes |
| 👤 **Patient care wallet** | Personal portal showing upcoming visits, history, prescriptions, and follow-ups |
| 🏥 **Doctor directory** | Browse 13 specialists across 10+ specialties with schedules and fees |
| 📝 **Doctor profile management** | Admins can add and update doctor profiles from the portal |
| 📬 **Contact & feedback desk** | Patients and guests can submit queries visible to administrators |
| 🗄️ **Zero-config database** | Embedded MongoDB auto-starts; no installation needed for local development |
| 🌱 **Seed data pre-loaded** | 13 doctors, 21 users, and sample appointments ready on first boot |

---

## 🛠 Tech Stack

### Frontend
- **React 19** — UI components and routing
- **React Router DOM 7** — Client-side navigation
- **Vite 8** — Lightning-fast dev server and build tool
- **Vanilla CSS** — Custom design system with glassmorphism and micro-animations

### Backend
- **Express 5** — REST API server (port `4000`)
- **MongoDB + Mongoose** — Persistent data layer
- **mongodb-memory-server** — Zero-config embedded MongoDB for local dev
- **bcryptjs** — Secure password hashing

---

## 📁 Project Structure

```
medizyra/
├── server/
│   ├── index.js          # Express API server with all route handlers
│   ├── db.js             # MongoDB connection (auto-starts embedded DB)
│   └── seedData.js       # Seed users, doctors & appointments
├── src/
│   ├── assets/           # Images, videos, doctor portraits
│   ├── components/       # Shared UI components (Navbar, SiteChrome, etc.)
│   ├── context/          # App-wide state (AppContext)
│   ├── data/             # Static site data and doctor catalog
│   ├── lib/              # API client, appointments helper, utilities
│   └── pages/
│       ├── HomePage.jsx          # Landing page
│       ├── AuthPage.jsx          # Login & registration
│       ├── DoctorsPage.jsx       # Doctor directory
│       ├── DoctorDetailPage.jsx  # Individual doctor profile & booking
│       ├── PortalPage.jsx        # Role-based dashboard (Admin/Doctor/Patient)
│       ├── AdminControlsPage.jsx # Admin doctor management
│       ├── ContactPage.jsx       # Contact & feedback form
│       └── NotFoundPage.jsx      # 404 page
├── scripts/
│   ├── mongo-start.mjs          # Optional: start system MongoDB
│   └── generate-presentation.mjs
├── .env.example          # Environment variable template
├── vite.config.js        # Vite config with /api proxy to port 4000
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20 or higher
- **npm** v9 or higher

### 1. Clone the repository

```bash
git clone https://github.com/pragyan-kumar/MediZyra-Institute.git
cd MediZyra-Institute
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the backend server

```bash
node server/index.js
```

> The server starts on **http://localhost:4000** and automatically spins up an embedded MongoDB. Seed data (doctors, users, appointments) is inserted on first boot.

### 4. Start the frontend dev server

Open a **new terminal** and run:

```bash
npm run dev
```

> The frontend starts on **http://localhost:5173** and proxies all `/api` requests to the backend.

### 5. Open in browser

Visit **http://localhost:5173** and sign in with one of the [demo credentials](#-demo-credentials) below.

---

## 🔑 Demo Credentials

These accounts are pre-seeded and ready to use immediately.

| Role | Email | Password |
|------|-------|----------|
| 🛡️ **Admin** | `admin@medizyra.demo` | `Admin@123` |
| 🩺 **Doctor** | `aisha@medizyra.demo` | `Doctor@123` |
| 👤 **Patient** | `patient@medizyra.demo` | `Patient@123` |

> All doctor accounts share the password `Doctor@123`. See [Doctor Catalog](#-doctor-catalog) for the full list of available doctor emails.

---

## 👥 Role Capabilities

### 🛡️ Admin — Command Desk
- Review all incoming appointment requests
- Confirm or cancel appointments with intake notes
- Adjust consultation dates, slots, and modes
- Add and update doctor profiles
- View all contact messages from patients

### 🩺 Doctor — Consultation Studio
- View assigned appointments and patient symptoms
- Confirm and complete consultations
- Write visit summaries and doctor notes
- Issue prescription items and follow-up dates

### 👤 Patient — Care Wallet
- Register with email and create a profile
- Browse the doctor directory and view specialist profiles
- Request appointments with preferred dates and slots
- Track appointment status (Requested → Confirmed → Completed)
- View care summaries, prescriptions, and follow-up dates

---

## 📡 API Reference

All endpoints are prefixed with `/api` and served from `http://localhost:4000`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check |
| `GET` | `/api/app-state` | Full data snapshot (users, doctors, appointments) |
| `POST` | `/api/auth/login` | Authenticate a user |
| `POST` | `/api/patients/register` | Register a new patient account |
| `POST` | `/api/appointments` | Book a new appointment (patient only) |
| `PATCH` | `/api/appointments/:id/admin` | Update appointment status (admin only) |
| `PATCH` | `/api/appointments/:id/doctor` | Complete a consultation (doctor only) |
| `POST` | `/api/doctors/upsert` | Create or update a doctor profile (admin only) |
| `POST` | `/api/contact-messages` | Submit a contact/feedback message |
| `POST` | `/api/reset` | Reset database to seed state |

---

## 🩺 Doctor Catalog

13 specialists across 10 fields available in the demo:

| Doctor | Specialty | Fee |
|--------|-----------|-----|
| Dr. Aisha Rahman | Cardiology | ₹1,400 |
| Dr. Karan Sood | Neurology | ₹1,600 |
| Dr. Meera Joseph | Pediatrics | ₹1,150 |
| Dr. Rohan Iyer | Orthopedics | ₹1,700 |
| Dr. Sana Qureshi | Dermatology | ₹1,350 |
| Dr. Dev Malhotra | General Medicine | ₹950 |
| Dr. Priya Nair | Gynecology | ₹1,500 |
| Dr. Harsh Bedi | Gastroenterology | ₹1,650 |
| Dr. Farah Siddiqui | Pulmonology | ₹1,550 |
| Dr. Nandini Rao | Psychiatry | ₹1,450 |
| Dr. Vikram Khanna | ENT | ₹1,250 |
| Dr. Isha Kapoor | Endocrinology | ₹1,750 |
| Dr. Kabir Ali | Nephrology | ₹1,800 |

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` to configure for production:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URI` | *(auto embedded)* | MongoDB connection string. If unset, embedded DB is used |
| `MONGO_DB_NAME` | `medizyra` | Database name |
| `PORT` | `4000` | Express server port |
| `VITE_API_BASE_URL` | `/api` | API base URL used by the frontend |

> **Note:** If `MONGO_URI` is not set, the server automatically starts an embedded MongoDB instance. Data will reset on each server restart unless an external MongoDB is configured.

---

## 📜 Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Start frontend dev server | `npm run dev` | Vite dev server on port 5173 |
| Start backend server | `node server/index.js` | Express API on port 4000 |
| Build for production | `npm run build` | Outputs to `/dist` |
| Preview production build | `npm run preview` | Serve the built dist |
| Lint code | `npm run lint` | ESLint check |
| Start system MongoDB | `npm run mongo:start` | Requires MongoDB Community installed |

---

## 📄 License

This project is for educational and demonstration purposes.

---

<div align="center">
  Made with ❤️ for MediZyra Healthcare Solutions
</div>
