# CINEMATIQ 🎬

Cinematiq is a modern, AI-powered movie and TV series recommendation engine. It combines collaborative filtering and content-based filtering to provide personalized suggestions.

## Features
*   **🎥 Explore**: Browse thousands of movies and TV series with rich metadata.
*   **🧠 AI Recommendations**: Personalized hybrid recommendations based on your unique taste.
*   **📺 Series Support**: View seasons and episodes details.
*   **🔍 Smart Search**: Instant search with voice command support 🎤.
*   **⚡ Modern UI**: Smooth, dark-themed responsive interface built with React & Tailwind.

## Tech Stack
*   **Frontend**: React, Vite, TailwindCSS, Framer Motion
*   **Backend**: Python, Flask, Pandas, Scikit-learn
*   **Data Source**: TMDB API + MovieLens Dataset

## Local Setup

### Backend
1.  Navigate to `backend/`:
    ```bash
    cd backend
    ```
2.  Create a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # Windows: venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the server:
    ```bash
    python app.py
    ```

### Frontend
1.  Navigate to `frontend/`:
    ```bash
    cd frontend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Start development server:
    ```bash
    npm run dev
    ```

## Deployment

### Backend (Railway)
1.  Connect your repo to Railway.
2.  Set Root Directory to `/backend`.
3.  Add environment variables (`TMDB_ACCESS_TOKEN`).
4.  Deploy.

### Frontend (Vercel)
1.  Connect your repo to Vercel.
2.  Set Root Directory to `frontend`.
3.  Deploy.
