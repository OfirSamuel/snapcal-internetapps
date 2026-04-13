# **Product Requirements Document (PRD)**

**Product Name:** SnapCal

**Team:** Mishelle & Ofir

**Target Platforms:** Web (React), Mobile (Android), Backend (Node.js)

## **1\. Product Vision & Goals**

**Vision:** To make calorie tracking a frictionless, visually engaging, and socially motivating experience.

**Goal:** Deliver a full-stack MVP that proves the concept of AI-assisted meal logging and social accountability, fulfilling all academic requirements for the Internet Apps and Cellular Apps courses at Colman.

## **2\. Target Audience**

* **Health & Fitness Enthusiasts:** People who track their macros/calories but suffer from "logging fatigue" caused by tedious manual entry.  
* **Social Eaters:** Users who enjoy sharing pictures of their food and want to combine that habit with healthy lifestyle tracking.

## **3\. Core Features & Functional Requirements**

### **3.1 Authentication & Identity**

* **Email/Password Auth:** Users must be able to securely register, log in, and log out.  
* **Google OAuth:** Users can bypass manual registration and log in using their Google account.  
* **Session Management:** The system must remember users across sessions without requiring repeated logins (using JWT Access and Refresh tokens).  
* **Profile Management:** Users must have a profile page displaying their avatar, username, and a gallery of their own meal posts. Users can update their username and profile picture.

### **3.2 Post Creation & AI Integration**

* **Image Upload:** Users must be able to upload a photo of their meal. Images must be stored on the server's local file system (not in the database).  
* **Meal Description:** Users must be able to enter a free-text description of their meal.  
* **AI Calorie Estimation:** An "Analyze with AI" button will send the text description to a generative AI API (e.g., Gemini/ChatGPT) to automatically estimate and return the calorie count.  
* **Post Editing/Deletion:** Users can edit the text/image of their own posts or delete them entirely.

### **3.3 The Global Feed & External Data**

* **Discovery Feed:** A primary chronological feed displaying posts from all users.  
* **Gradual Loading (Pagination):** The feed must load progressively (infinite scrolling) rather than fetching all database records at once.  
* **Recipe of the Day Widget:** The top of the feed must display a daily health tip or healthy recipe fetched from an external public REST API (e.g., Edamam).

### **3.4 Social Interaction**

* **Likes:** Users can toggle a "Like" (heart) on any post. The feed displays the total like count.  
* **Comments:** Users can write text-based comments on posts. The main feed displays the *count* of comments, and clicking it opens a dedicated comment view/modal to read and add new ones.

## **4\. Non-Functional & Technical Requirements**

### **4.1 Backend (Node.js)**

* **Architecture:** RESTful API using Express.js and strictly written in **TypeScript**.  
* **Database:** Local MongoDB instance protected by username and password. No cloud databases (Atlas) permitted.  
* **File Storage:** multer must be used to save images locally. Images are served statically via public URLs.  
* **Testing:** Comprehensive unit tests using **Jest**. API documentation generated via **Swagger**.

### **4.2 Web Frontend (React)**

* **Framework:** React.js (TypeScript) using react-router-dom for navigation.  
* **Testing:** Unit and asynchronous testing using **React Testing Library** and Jest.  
* **Styling:** Responsive, dark-mode focused UI using Material UI (MUI) or Tailwind CSS. Form validation is required.

### **4.3 Mobile Frontend (Android Kotlin)**

* **Architecture:** MVVM utilizing Fragments and the Navigation Component (NavGraph).  
* **Networking:** **Retrofit2** equipped with OkHttp Interceptors to handle JWT Bearer tokens.  
* **Offline Support (Mandatory):** Must use **Room (SQLite)** to cache feed data locally so the app can display posts even without an internet connection.  
* **Image Caching:** Must use **Picasso** to load and cache images from the Node.js backend.  
* **Firebase Limitation:** Firebase is strictly forbidden for database or storage. Firebase Authentication is permitted *only* if the custom Node backend is bypassed for auth, but custom JWT is strongly preferred for full-stack consistency.

### **4.4 Deployment & DevOps**

* **Server:** Colman College Server.  
* **Process Management:** The Node.js application must run in the background using **PM2** in NODE\_ENV=production.  
* **Networking:** Nginx must be configured as a reverse proxy. The application must be accessible via HTTPS and a custom domain name without requiring a port number in the URL (e.g., https://snapcal-colman.com).  
* **Version Control:** Strict Git workflow utilizing Branches and Pull Requests.

## **5\. Out of Scope (For Post-MVP)**

* AI Image Recognition (analyzing the photo directly without text input).  
* User Follower System (creating private, curated feeds instead of a global feed).  
* Real-time Chat (Waived for 2-person groups).

## **6\. Success Metrics for Final Defense**

1. **Zero Unhandled Crashes:** Both React and Android apps handle network errors gracefully using UI spinners and error toasts.  
2. **Offline Resilience:** The Android app successfully loads the feed from Room SQLite when the backend is inaccessible.  
3. **Deployment Integrity:** The app runs flawlessly via the assigned domain name on the Colman server without requiring an IDE or terminal to be open.