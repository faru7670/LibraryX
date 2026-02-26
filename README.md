# 📚 LibraryX - Advanced Library Management System

A modern, production-ready Library Management System built for colleges. Features role-based dashboards, 3D animated backgrounds, glassmorphism UI, and comprehensive analytics.

## ✨ Features

- **3 User Roles**: Student, Librarian, Admin — each with dedicated dashboards
- **Smart Book Search**: Filter by category, author, availability
- **Issue & Return**: Full workflow with automatic fine calculation (₹5/day)
- **Reservation Queue**: Queue system for unavailable books
- **Analytics Dashboards**: Charts for usage, revenue, user growth, dead stock
- **Notifications**: Real-time alerts for due dates, overdue, reservations
- **Activity Timeline**: Complete audit trail
- **3D Background**: Three.js floating book animation
- **Dark/Light Mode**: Toggle with localStorage persistence
- **Fully Responsive**: Mobile-first design

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS 3.4 |
| 3D | Three.js + React Three Fiber |
| Charts | Recharts |
| Icons | Lucide React |
| Animation | Framer Motion |
| Backend | Node.js + Express |
| Auth | JWT + bcryptjs |
| Database | In-memory (plug into Firebase/SQLite) |

## 🚀 Quick Start

### Frontend
```bash
cd client
npm install
npm run dev
```

### Backend
```bash
cd server
npm install
npm start
```

Frontend runs on `http://localhost:5173`  
Backend runs on `http://localhost:5000`

## 🎮 Demo Login

Use the **Quick Demo Access** buttons on the login page:
- **Student** → arjun@college.edu
- **Librarian** → kavita@college.edu
- **Admin** → suresh@college.edu

Password for all demo accounts: `password123`

## 📁 Project Structure

```
lib/
├── client/              # React + Vite frontend
│   ├── src/
│   │   ├── components/  # UI components (layout, three.js, etc)
│   │   ├── context/     # Auth & Theme context providers
│   │   ├── data/        # Mock/demo data
│   │   ├── pages/       # All page components by feature
│   │   ├── App.jsx      # Router & app shell
│   │   └── index.css    # Tailwind + glassmorphism styles
│   └── ...config files
├── server/              # Express API backend
│   └── server.js        # All routes + in-memory DB
└── README.md
```

## 🔮 Future Scope

- Barcode / QR code scanning for book checkouts
- Mobile app version (React Native)
- RFID integration for automated tracking
- AI-based book recommendations
- Firebase Firestore or PostgreSQL integration
- EmailJS / Twilio notification integration
- PDF book preview (digital library)

## 📄 License

MIT — Free to use for academic projects.
