# MusicApp 🎵

A modern, full-stack music streaming platform designed for a premium user experience. Built with the MERN stack (MongoDB, Express, React, Node.js) and Firebase.

## ✨ Features

### 👤 User Features

- **Authentication**: Secure Google Sign-in via Firebase
- **Dynamic Discovery**:
  - **Featured Track**: Automatically rotates every 6 minutes
  - **Filtering**: By Artist, Album, Language, and Category
  - **Search**: Real-time search for songs, artists, and albums
- **Music Player**:
  - Full playback control (Play, Pause, Next, Prev, Seek)
  - Shuffle and Repeat modes
  - Mini player mode
- **Library Management**:
  - "Like" songs to add to Favorites
  - Create and manage custom Playlists

### 🛡️ Admin Features

- **Dashboard**: Content management interface
- **Upload Songs**: Add tracks with audio and album art
- **Manage Metadata**: Create/edit Artists and Albums
- **User Management**: Manage user roles (Admin/Member)

## 🔒 Security

- Server-side authentication via Firebase Admin SDK
- Role-based access control (RBAC) with middleware
- Data isolation - users can only access their own data
- Standardized API responses for consistent error handling

## 🛠️ Tech Stack

| Layer             | Technologies                                                         |
| ----------------- | -------------------------------------------------------------------- |
| **Frontend**      | React 19, Vite, Tailwind CSS v4, Zustand, React Query, Framer Motion |
| **Backend**       | Node.js, Express 5, MongoDB, Mongoose                                |
| **Auth/Storage**  | Firebase (Auth + Storage)                                            |
| **Design System** | UI UX Pro Max (Righteous + Poppins fonts, vibrant palette)           |

## 📁 Project Structure

```
client/src/
├── components/         # Page components
├── features/           # Feature modules (auth, library, player)
├── services/api/       # API layer with auth interceptors
├── shared/components/  # Reusable UI (ErrorBoundary, Loading, Skeleton)
└── styles/             # Design tokens

server/
├── models/             # Mongoose schemas
├── routes/             # API routes
└── src/middleware/     # Auth, admin, error handling
```

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB URI
- Firebase Project (Auth & Storage enabled)

### Local Setup

```bash
# Clone
git clone https://github.com/matin676/music-app.git
cd music-app

# Server
cd server
npm install
npm run dev

# Client (new terminal)
cd client
npm install
npm run dev
```

### Environment Variables

**Server (.env)**

```
PORT=4000
DB_STRING=mongodb+srv://...
FIREBASE_* credentials
```

**Client (.env)**

```
VITE_API_BASE_URL=http://localhost:4000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
```

## 🧪 Testing

```bash
cd client
npm test
```

## 📄 License

MIT License
