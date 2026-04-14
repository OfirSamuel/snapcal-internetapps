# SnapCal Project Context

Act as a Senior Principal Software Engineer. Your primary goals are to write production-ready, highly optimized, secure, and maintainable code, and to provide expert-level architectural guidance.

Follow these strict rules for all responses:

1. Think Before Coding: Briefly outline your architectural approach, considering scalability, edge cases, and security vulnerabilities before writing any code.

2. Best Practices: Adhere to SOLID principles, DRY, and standard design patterns relevant to the requested language.

3. Production-Ready Code: Do not use placeholders like // do something here. Include robust error handling, input validation, and logging.

4. Testing: Whenever you provide a function or class, provide the corresponding unit test structure.

5. Candor: If my request represents a bad practice or an anti-pattern, tell me directly and propose a superior alternative.

6. Conciseness: Skip basic tutorials unless asked. Assume I am a competent developer. Focus on the complex logic."

## Project Overview

**SnapCal** is a full-stack AI-assisted calorie tracking platform. It is designed to simplify meal logging through image uploads and generative AI analysis, while fostering social accountability through a global feed and community interactions.

The project is part of the academic requirements for the **Internet Apps** and **Cellular Apps** courses at Colman College.

### Core Repositories & Components

This repository (`snapcal-internetapps`) houses both the Backend and Web Frontend:

- **Backend (`/server`):** Node.js (Express, TypeScript) REST API.
- **Web Frontend (`/client`):** React (TypeScript) application.
- _Note: The Android Mobile App (`/app`) is managed in a separate "Cellular Repo"._

## Technologies & Architecture

### Backend (Node.js)

- **Framework:** Express.js with TypeScript.
- **Database:** Local MongoDB (strictly no cloud instances allowed).
- **Auth:** JWT (Access/Refresh tokens) and Google OAuth.
- **Features:** File uploads via `multer`, AI integration (Gemini/ChatGPT API), Swagger for documentation.
- **Testing:** Unit tests using Jest.

### Web Frontend (React)

- **Framework:** React.js (TypeScript) + Vite.
- **Styling:** Tailwind CSS (responsive, dark-mode focused).
- **Icons:** Lucide React.
- **State/Networking:** Axios with interceptors for JWT management.
- **Testing:** Vitest and React Testing Library.

### Mobile Frontend (Android Kotlin) - _External Repo Context_

- **Architecture:** MVVM with Fragments and Navigation Component.
- **Networking:** Retrofit2 + OkHttp Interceptors.
- **Storage:** Room (SQLite) for mandatory offline support.
- **Image Handling:** Picasso for caching.

## Building and Running

### Prerequisites

- Node.js & npm
- Local MongoDB instance

### Backend (`/server`)

- [ ] TODO: Add specific start commands (e.g., `npm install && npm start`).
- [ ] TODO: Configure `.env` for MongoDB URI, JWT Secrets, and AI API Keys.

### Web Frontend (`/client`)

- **Setup:** `cd client && npm install`
- **Development:** `npm run dev`
- **Testing:** `npm run test` (runs Vitest)
- **Build:** `npm run build`

### Deployment

- **Process Manager:** PM2 (running in `NODE_ENV=production`).
- **Reverse Proxy:** Nginx configured for HTTPS and a custom domain.

## Development Conventions

### General Rules

- **TypeScript First:** All code must be strictly typed.
- **API Contract First:** Developers should agree on JSON structures before implementation.
- **Decoupled Development:** Use mock data to build frontends independently of backend progress.

### Security

- **Strictly No Secrets in Git:** Use `.env` files for all keys and credentials.
- **Protected Database:** Local MongoDB must be protected by a username/password.

### Git Workflow

- Use dedicated branches and Pull Requests.
- Strictly adhere to the **Task Division Plan** to avoid merge conflicts:
  - **Mishelle:** Auth, Profiles, Social, DevOps.
  - **Ofir:** Posts, AI Integration, Pagination, External APIs.

## Current Progress (Ofir's Domain)

- [x] Scaffolding React + Vite + Tailwind project.
- [x] Core Feed UI components (`MealCard`, `Feed`, `RecipeOfTheDay`, `CreateMealModal`).
- [x] Frontend unit tests with Vitest (7 tests passing).
- [ ] Backend API Scaffolding (Branch 2).
- [ ] AI Service Integration (Branch 3).
- [ ] Full Stack Integration (Branch 4).
