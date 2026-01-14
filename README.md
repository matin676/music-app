# MusicApp 🎵

A modern, full-stack music streaming platform designed for a premium user experience. Built with the MERN stack (MongoDB, Express, React, Node.js) and Firebase.

## ✨ Features

### 👤 User Features

- **Authentication**: Secure Google Sign-in via Firebase.
- **Dynamic Discovery**:
  - **Featured Track**: Automatically rotates every 6 minutes to showcase random songs from the library. Pauses on hover for a natural user experience.
  - **Filtering**: Robust filtering by **Artist**, **Album**, **Language**, and **Category**.
  - **Search**: Real-time search for songs, artists, and albums.
- **Music Player**:
  - Full playback control (Play, Pause, Next, Prev, Seek).
  - Gapless playback across the application.
- **Library Management**:
  - "Like" songs to add them to your **Favorites**.
  - Create and manage custom **Playlists**.
- **Responsive Design**: Mobile-first approach. The interface adapts perfectly to all screen sizes (Desktop, Tablet, Mobile).

### 🛡️ Admin Features

- **Dashboard Access**: Exclusive access to the administrative dashboard (`/dashboard/*`).
- **Content Management**:
  - **Upload Songs**: Add new tracks with audio files and album art (stored in Firebase Storage).
  - **Manage Metadata**: Create and edit Artists and Albums.
  - **Delete Content**: Remove songs, artists, or albums directly from the database and storage.
- **User Management**: View all registered users and manage their roles (promote to Admin / demote to Member).

## 👥 Roles Strategy

The application enforces role-based access control (RBAC):

1. **Member**: The default role for all new users.

   - _Capabilities_: Listen to music, search, filter, manage favorites/playlists.
   - _Restrictions_: Cannot access the Dashboard or modify global content.

2. **Admin**: High-level privilege role.
   - _Capabilities_: All Member capabilities + Full Dashboard access.
   - _Responsibilities_: Content moderation, uploading new music, managing user roles.

## 🛠️ Tech Stack

### Frontend (Client)

- **React 19** + **Vite**: Ultra-fast development and performant builds.
- **Tailwind CSS (v4)**: Advanced styling with a mobile-first approach.
- **Framer Motion**: Smooth, natural animations (e.g., Hero section transitions).
- **Firebase SDK**: Auth and Storage interactions.
- **Axios**: Efficient HTTP requests.

### Backend (Server)

- **Node.js** + **Express**: Robust REST API.
- **MongoDB** + **Mongoose**: Flexible data modeling for Songs, Artists, Albums, and Users.
- **Firebase Admin SDK**: Secure server-side token verification.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB URI
- Firebase Project (Auth & Storage enabled)

### Local Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/matin676/music-app.git
   cd music-app
   ```

2. **Server Setup**

   ```bash
   cd server
   npm install
   # Create .env with PORT, DB_STRING, and Firebase service account credentials
   npm run dev
   ```

3. **Client Setup**

   ```bash
   cd client
   npm install
   # Create .env with VITE_FIREBASE_* keys and VITE_API_BASE_URL
   npm run dev
   ```

## ☁️ Deployment

- **Client**: Deployed on [Netlify](https://www.netlify.com/).
- **Server**: Deployed on [Render](https://render.com/).

_Refer to `deployment_guide.md` in the project root for detailed deployment steps._

## 📄 License

This project is licensed under the ISC License.
