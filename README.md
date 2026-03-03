<div align="center">

<img src="https://img.shields.io/badge/CINEMATIQ-AI%20Movie%20Intelligence-0F0F0F?style=for-the-badge&logo=film&logoColor=E50914" alt="Cinematiq" height="36"/>

# CINEMATIQ

### AI-Powered Movie & Series Recommendation Engine

*Discover what to watch next — with intelligence.*

[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![TMDB](https://img.shields.io/badge/TMDB-01B4E4?style=flat-square&logo=themoviedatabase&logoColor=white)](https://themoviedb.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## What is Cinematiq?

**Cinematiq** is a full-stack recommendation engine that combines **collaborative filtering** and **content-based filtering** into a hybrid AI model — delivering personalized movie and TV series suggestions based on your unique taste profile.

---

## Features

| | Feature | Description |
|---|---|---|
| 🎥 | **Explore** | Browse thousands of movies and series with rich metadata |
| 🧠 | **AI Recommendations** | Hybrid recommendation engine tailored to your preferences |
| 📺 | **Series Support** | Detailed season and episode breakdowns |
| 🔍 | **Smart Search** | Instant search with voice command support |
| ⚡ | **Modern UI** | Smooth, dark-themed responsive interface |

---

## Tech Stack

**Frontend**

![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white)

**Backend**

![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=flat-square&logo=pandas&logoColor=white)
![Scikit-learn](https://img.shields.io/badge/Scikit--learn-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)

**Data**

![TMDB](https://img.shields.io/badge/TMDB-01B4E4?style=flat-square&logo=themoviedatabase&logoColor=white)
![MovieLens](https://img.shields.io/badge/MovieLens-Dataset-E50914?style=flat-square)

---

## Local Setup

### Backend

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # macOS / Linux
venv\Scripts\activate           # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the server
python app.py
```

> The backend will be available at `http://localhost:5000`

---

### Frontend

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install packages
npm install

# 3. Start the development server
npm run dev
```

> The frontend will be available at `http://localhost:5173`

---

## Deployment

### Backend — ![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white)

1. Connect your repository to [Railway](https://railway.app)
2. Set the **Root Directory** to `/backend`
3. Add the environment variable: `TMDB_ACCESS_TOKEN`
4. Deploy

### Frontend — ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

1. Connect your repository to [Vercel](https://vercel.com)
2. Set the **Root Directory** to `frontend`
3. Deploy

---

## Environment Variables

```env
# backend/.env
TMDB_ACCESS_TOKEN=your_tmdb_access_token
```

---

## Contributing

Contributions are welcome. To get started:

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/your-feature`
3. Commit your changes — `git commit -m 'feat: describe your change'`
4. Push to your branch — `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

*Built for film lovers, powered by data.*

</div>
