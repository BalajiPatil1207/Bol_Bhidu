# Development Guide - MERN Chat Application

This guide explains the step-by-step development process of this real-time chat application.

---

## 1. Project Initialization
- **Backend**: Initialized with Node.js and Express. Set up environment variables using `dotenv`.
- **Frontend**: Scaffolding created using Vite + React.
- **Styling**: Integrated Tailwind CSS for a modern, utility-first design.

## 2. Authentication System
- **JWT & Cookies**: Implemented secure authentication using JSON Web Tokens stored in HTTP-Only cookies.
- **Password Hashing**: Used `bcryptjs` for secure password storage.
- **Cross-Domain Setup**: Configured `SameSite: "none"` and `Secure: true` to allow Vercel (frontend) to communicate with Render (backend).

## 3. Real-Time Communication
- **Socket.io**: Integrated Socket.io on both server and client. 
- **Event Mapping**: Created a system to map User IDs to Socket IDs to enable private, one-on-one messaging.
- **Signaling**: Used Socket.io to handle WebRTC signaling for the calling feature.

## 4. Database Schema Design (MongoDB)
- **User Model**: Stores profiles, encrypted passwords, and profile picture URLs.
- **Message Model**: Stores text, image URLs, sender/receiver IDs, and `isSeen` status.
- **Aggregation**: Used MongoDB aggregation pipelines to calculate unread counts and sort users by the latest message timestamp.

## 5. Media & File Handling
- **Cloudinary**: Integrated Cloudinary API for high-speed image hosting.
- **Base64 Processing**: Handled client-side image compression and Base64 conversion before uploading to the server.

## 6. Advanced Features
- **WebRTC Calling**: Implemented peer-to-peer audio and video calls.
- **Typing Indicators**: Real-time "Typing..." status using Socket.io events.
- **Sound Notifications**: Integrated audio feedback for incoming messages.
- **Theme Engine**: Built a custom theme system supporting Light (Orange/White) and Dark modes.

## 7. Deployment Strategy
- **Frontend**: Deployed to Vercel with environment variable configuration for API endpoints.
- **Backend**: Deployed to Render with "Trust Proxy" enabled for secure cookie handling.
- **Database**: Hosted on MongoDB Atlas.

---

## Technical Stack Summary
- **Frontend**: React, Tailwind CSS, Zustand, Lucide Icons, Axios, Socket.io-client.
- **Backend**: Node.js, Express, Socket.io, Mongoose, Arcjet, Resend (Email).
- **Storage**: MongoDB (Data), Cloudinary (Images).
