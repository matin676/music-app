# Music-app

Welcome to MusicApp, a web application built with the MERN stack, Firebase authentication, and Google Cloud Bucket storage.

## Overview

MusicApp allows users to stream music, manage playlists, upload songs, and enjoy a personalized listening experience. It integrates Firebase for user authentication and Google Cloud Bucket for storage, ensuring a seamless and secure music streaming platform.

## Features

- User Authentication with Firebase
- Playlist Management
- Song Uploading and Storage on Google Cloud Bucket
- Seamless Music Playback

## Admin Only Features

- Only admin have access to the dashboard from home page, other users don't have Dashboard option in the dropdown
  
  ![Screenshot (1)](https://github.com/user-attachments/assets/55a02bf4-3f39-4026-8ac1-b9f8c0578305)

- Below are the dashboard features in screenshots
  
  ![Screenshot (2)](https://github.com/user-attachments/assets/b1ea8fc2-2c77-4fc6-867f-8b1458dddc5d)
  
- Managing users and their permission
  
  ![Screenshot (3)](https://github.com/user-attachments/assets/20913326-7822-4e73-9aba-89ad5c5c9a9f)

- From Songs, Artists, Albums admin can manage all the sites uploaded assets
  
  ![Screenshot (4)](https://github.com/user-attachments/assets/3596abb0-168a-43af-9571-f834d1df0a4c)

- From Songs page there is another page from where admin can add songs, artist and album information
  
  ![Screenshot (5)](https://github.com/user-attachments/assets/9b0d2345-a2b6-4faa-9935-95b9ae3941fc)

## Technologies Used

- MongoDB: Database for storing user data, playlists, and songs.
- Express.js: Backend framework for routing and API development.
- React: Frontend library for building the user interface.
- Node.js: Server-side JavaScript runtime for backend logic.
- Firebase Authentication: Secure authentication service for users.
- Google Cloud Bucket: Storage solution for admin(for now only admin can upload songs)-uploaded songs.
- HTML/CSS: Markup and styling for the frontend.
- JavaScript (ES6+): Programming language for frontend and backend logic.

## Installation

1. Clone the repository: `git clone https://github.com/matin676/music-app`
2. Navigate to the project directory: `cd music-app`
3. Install dependencies: `npm install`
4. Set up Firebase and Google Cloud Bucket credentials (refer to respective documentation).
5. Start the development server: `npm start`
- Once you setup the project, you can change the admin functionality for yourself by changing the details of MongoDB details

## Deployment

Deploy the application to your preferred hosting platform. Ensure Firebase and Google Cloud Bucket configurations are correctly set for production deployment.

## Contributing

Contributions are welcome! Fork the repository, create a new branch for your feature or bug fix, make your changes, and submit a pull request.

## License

This project is licensed under the [Apache 2.0 license](LICENSE).
