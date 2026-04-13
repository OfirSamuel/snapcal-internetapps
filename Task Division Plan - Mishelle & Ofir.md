# **Detailed Task Division Plan: SnapCal**

**Team Members:** Mishelle & Ofir

**Strategy:** Vertical Feature Slicing with Strict Decoupling (API-First Approach).

**Repositories:**

1. **Internet Repo:** Node.js Backend (/server) \+ React Web App (/client)  
2. **Cellular Repo:** Android Kotlin App (/app)

## **🛠️ Phase 1: Shared Foundation & The API Contract (Pair Programming \- Week 1\)**

*To completely eliminate dependencies, both developers must agree on the "Contracts" before writing isolated code.*

* **Repo Setup:** Initialize both GitHub repos with main and develop branches.  
* **Backend Init:** Scaffold Node.js \+ Express. Connect to MongoDB.  
* **Frontend Init:** Scaffold React and Android bases.  
* **THE CONTRACT (Crucial Step):** Sit together and write dummy JSON files for what the APIs will return.  
  * Example mock\_post.json: { "id": "1", "text": "Salad", "calories": 400, "user": "Ofir" }  
  * *Why?* So Ofir can build the frontend using this dummy JSON without waiting for Mishelle's database to be ready.

## **🛡️ Anti-Conflict Strategy (File Ownership)**

To avoid Git merge conflicts, you will strictly separate your files. You will never edit the same file on the same day.

* **Backend:** Mishelle owns routes/auth.ts and routes/comments.ts. Ofir owns routes/posts.ts and routes/ai.ts.  
* **React:** Mishelle owns components/Auth/ and components/Profile/. Ofir owns components/Feed/ and components/CreatePost/.  
* **Android:** Mishelle owns auth/ and profile/ packages. Ofir owns feed/ and post/ packages.

## **👩‍💻 Developer 1: Mishelle**

**Domain:** Identity, Profiles, Social Interactions, and DevOps Deployment

### **1\. Backend Tasks (Internet Repo)**

* **Auth APIs:** Build POST /register, POST /login, POST /google, and POST /refresh.  
* **JWT Logic:** Implement the middleware for Access and Refresh tokens.  
* **User & Comment APIs:** Build endpoints for profile and comments.  
* **Independence Tactic:** Test everything using **Postman**. Do not wait for Ofir's frontend screens to verify your backend logic works.

### **2\. React Web App Tasks (Internet Repo)**

* **Auth Screens:** Build the Login and Registration forms with validation and Google Auth button.  
* **Session Management:** Set up Axios interceptors to automatically attach the JWT.  
* **Profile Screen:** Build the user profile page and "Edit Profile" logic.  
* **Independence Tactic:** If you need to show posts on the Profile screen but Ofir hasn't finished the Post API, use the mock\_post.json data to render your UI.

### **3\. Android App Tasks (Cellular Repo)**

* **Auth Fragments:** Build LoginRegisterFragment with standard and Google Sign-in.  
* **Retrofit Interceptor:** Write the OkHttp Interceptor to inject the JWT Bearer token into Android network calls.  
* **Profile Fragment:** Build the screen showing user details.

### **4\. DevOps (Internet Repo)**

* **Deployment:** Set up PM2 and the Nginx reverse proxy on the Colman server for the Node.js backend and React build.

## **👨‍💻 Developer 2: Ofir**

**Domain:** Core Content (Posts/Images), AI Integration, Pagination, and External APIs

### **1\. Backend Tasks (Internet Repo)**

* **Post APIs:** Build POST /api/posts (Create) and GET /api/posts (Read) with pagination.  
* **File Uploads:** Implement multer to safely store uploaded image files.  
* **AI Smart Integration:** Build POST /api/ai/analyze using the Gemini/ChatGPT SDK.  
* **Independence Tactic:** Test your Post creation logic directly via Postman. Since Mishelle is building Auth, temporarily bypass the JWT middleware on your local machine so you can test uploading files without needing a real login token.

### **2\. React Web App Tasks (Internet Repo)**

* **Feed UI & Infinite Scroll:** Build Feed.tsx and gradual loading logic.  
* **External API:** Build the RecipeOfTheDay.tsx widget.  
* **Create Post UI:** Build CreatePostModal.tsx and the "Analyze with AI" button.  
* **Independence Tactic:** Hardcode a fake user token in your browser's local storage to bypass Mishelle's login screen while you build and test the Feed UI.

### **3\. Android App Tasks (Cellular Repo)**

* **Feed Fragment & Room:** Build the main RecyclerView, PostAdapter.kt, and SQLite Room caching.  
* **Image Caching:** Implement Picasso to load and cache the images.  
* **Create Post Fragment:** Implement Android Intents to open the Camera or Photo Gallery.  
* **Independence Tactic:** Build the Feed UI using a dummy list of Kotlin Post objects. Do not wait for the real Node.js server or Mishelle's Android Login fragment to be ready.

## **⚖️ Quality Assurance & Testing Rules**

* **Unit Tests (Jest):** Mishelle writes tests for Auth/User APIs; Ofir writes tests for Post/AI APIs.  
* **Integration Point:** Once a week, you will sit together and replace the "Mock Data" with the real API calls. If the contracts were followed, everything will connect instantly.