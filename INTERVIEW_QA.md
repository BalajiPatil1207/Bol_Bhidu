# Interview Questions & Answers - MERN Chat Application

This document covers potential interview questions based on the architecture and features of this Chat Application.

---

### 1. General & Architecture
**Q: Can you explain the high-level architecture of your application?**
**A:** This is a full-stack MERN (MongoDB, Express, React, Node.js) application. It uses a **Client-Server architecture**. The frontend is built with React and Tailwind CSS, while the backend is an Express REST API. For real-time features, I integrated **Socket.io** to enable bi-directional communication, and **WebRTC** for peer-to-peer video/audio calling.

**Q: Why did you choose MongoDB for this project?**
**A:** MongoDB's document-oriented structure is ideal for chat applications because message objects can vary (text, images, system messages). Its horizontal scalability and fast write speeds are perfect for high-frequency data like chat messages.

---

### 2. Real-Time & Networking
**Q: How did you implement real-time messaging?**
**A:** I used **Socket.io**. When a user connects, the server maps their User ID to their Socket ID. When a message is sent via the REST API, the server uses that mapping to emit a `newMessage` event only to the recipient's specific Socket ID, ensuring real-time delivery without page refreshes.

**Q: How does the Video/Audio calling work?**
**A:** It uses **WebRTC (Web Real-Time Communication)**. Socket.io acts as the **Signaling Server**. User A sends an "offer" to User B via the server. User B responds with an "answer". They exchange ICE candidates to establish a direct peer-to-peer connection, which allows media to flow directly between browsers without taxing the server.

---

### 3. Authentication & Security
**Q: How do you handle user authentication and session management?**
**A:** I use **JWT (JSON Web Tokens)** stored in **HTTP-Only cookies**. This approach is more secure than LocalStorage because it protects against XSS (Cross-Site Scripting) attacks. For the cross-domain deployment (Vercel to Render), I configured `SameSite: "none"` and `Secure: true` policies.

**Q: What is Arcjet and why did you use it?**
**A:** Arcjet is a security layer for Node.js. I used it to implement **Rate Limiting** and **Bot Protection**. It prevents attackers from spamming the signup/login routes or performing brute-force attacks, keeping the application stable.

---

### 4. Deployment & Challenges
**Q: What was the biggest challenge you faced during deployment?**
**A:** The biggest challenge was **Cross-Site Cookie Authentication**. Since the frontend is on Vercel and the backend is on Render, browsers block cookies by default for security. I solved this by:
1. Setting `app.set("trust proxy", 1)` in Express.
2. Configuring CORS to explicitly allow the frontend origin with `credentials: true`.
3. Setting the JWT cookie with `SameSite: "none"`.

**Q: How do you handle image uploads?**
**A:** I use **Cloudinary**. When a user uploads a profile picture or sends an image in a chat, the frontend sends a Base64 string to the backend. The backend then uploads it to Cloudinary and stores only the resulting URL in MongoDB. This keeps the database lightweight.

---

### 5. Frontend & State Management
**Q: Why did you use Zustand instead of Redux?**
**A:** Zustand is much more lightweight and has less boilerplate than Redux. For a chat app where we need multiple stores (Auth, Chat, Call), Zustand’s simple hook-based API makes the code cleaner and more maintainable while still providing excellent performance.

**Q: How did you make the app responsive?**
**A:** I used **Tailwind CSS** with a mobile-first approach. I implemented dynamic layouts where the sidebar and chat area toggle visibility on small screens. I also used `dvh` (Dynamic Viewport Height) units to ensure the app fits perfectly on mobile screens even when browser navigation bars appear.
