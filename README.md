<div align="center">

<img src="https://img.shields.io/badge/CINEMATIQ-AI%20Movie%20Intelligence-0F0F0F?style=for-the-badge&logo=film&logoColor=22d3ee" alt="Cinematiq" height="40"/>

# CINEMATIQ

### Next-Generation AI-Powered Movie & Series Platform

*Discover what to watch next — with absolute intelligence.*

[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![Hugging Face](https://img.shields.io/badge/Hugging%20Face-FFD21E?style=flat-square&logo=huggingface&logoColor=000)](https://huggingface.co/)
[![TMDB](https://img.shields.io/badge/TMDB-01B4E4?style=flat-square&logo=themoviedatabase&logoColor=white)](https://themoviedb.org)

</div>

---

## 🎬 What is Cinematiq?

**Cinematiq** is a production-ready, full-stack cinematic intelligence platform. It moves beyond standard catalogs by integrating a **Hybrid Recommendation Engine** and a built-in **Conversational AI Expert (CineBot)**. The platform is designed with a premium, pixel-perfect dark-mode aesthetic aimed at delivering a highly immersive user experience.

---

## 🏗️ System Architecture & Workflow

Cinematiq utilizes a decoupled client-server architecture, allowing seamless asynchronous data fetching and real-time AI inference.

```mermaid
graph TD
    %% Styling
    classDef frontend fill:#0f1535,stroke:#22d3ee,stroke-width:2px,color:#fff;
    classDef backend fill:#111827,stroke:#7c3aed,stroke-width:2px,color:#fff;
    classDef external fill:#1a1f3a,stroke:#4ade80,stroke-width:2px,color:#fff;

    %% Nodes
    User([User Interface]) --> |HTTP Requests / JSON| API(Flask API Gateway)
    
    subgraph Client [Frontend App]
        User
        UI[React + Vite UI]
        Chat[CineBot Widget]
        Grid[Movie Data Grid]
    end

    subgraph Server [Backend Architecture]
        API
        RecEngine[Hybrid Recommender]
        LLMController[AI Inference Controller]
        Thread[ThreadPoolExecutor]
    end

    subgraph External [External APIs & Models]
        TMDB[(TMDB Database)]
        HF[Hugging Face API]
        Qwen((Qwen 2.5 72B Instruct))
    end

    %% Connections
    UI --> User
    Chat --> LLMController
    Grid --> RecEngine
    
    API --> RecEngine
    API --> LLMController
    
    RecEngine --> |Parallel I/O| Thread
    Thread --> |Metadata & Images| TMDB
    
    LLMController --> |REST API| HF
    HF --> Qwen

    class Client frontend;
    class Server backend;
    class External external;
```

### 🔄 Data Workflow
1. **User Request**: The user interacts with the UI (searches for a movie or talks to CineBot).
2. **Parallel Fetching**: The Python backend receives the request and utilizes `ThreadPoolExecutor` to fetch massive amounts of metadata concurrently from the TMDB dataset, reducing page load times to under ~1.5s.
3. **AI Inference**: Chat requests are routed via the Hugging Face `InferenceClient`, applying strict system prompts to maintain character, and streamed back to the frontend.

---

## 🧠 AI Models & Datasets

### 1. Conversational AI Model (CineBot)
Cinematiq features a dedicated AI assistant powered by state-of-the-art open-source Large Language Models.

* **Model Used**: `Qwen/Qwen2.5-72B-Instruct`
* **Architecture**: 72 Billion Parameter Transformer
* **Provider**: Hugging Face Serverless Inference API
* **Configuration Parameters**:
  * `temperature`: **0.7** (Balances creativity with factual movie accuracy)
  * `max_tokens`: **250** (Ensures concise, readable, and snappy responses)
  * `system_prompt`: Enforces strict cinematic-only topic adherence and explicit year formatting `e.g. Inception (2010)`.

### 2. Dataset Engine
* **Primary Database**: The Movie Database (TMDB) API
* **Data Scale**: Real-time access to 1,000,000+ movies, cast members, and high-resolution posters.
* **Accuracy/Filtering**: Strict backend algorithms strip out movies without valid posters/metadata to ensure a 100% clean visual grid.

---

## 🛠️ Technology Stack

| Category | Technologies Used |
|---|---|
| **Frontend UI** | ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white) |
| **Backend API** | ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) ![Flask](https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white) |
| **AI Integration**| ![Hugging Face](https://img.shields.io/badge/Hugging%20Face-FFD21E?style=flat-square&logo=huggingface&logoColor=000) `huggingface_hub` |
| **Deployment** | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white) ![Render](https://img.shields.io/badge/Render-%2346E3B7.svg?style=flat-square&logo=render&logoColor=white) |

---

## 💻 Local Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/kumardhruv88/cinematic.git
cd cinematic
```

### 2. Configure Environment Variables
Create a `.env` file inside the `backend/` directory:
```env
TMDB_API_KEY=your_tmdb_api_key
TMDB_ACCESS_TOKEN=your_tmdb_read_access_token
HF_TOKEN=your_hugging_face_token
```

### 3. Start the Backend (Python/Flask)
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### 4. Start the Frontend (React/Vite)
```bash
cd frontend
npm install
npm run dev
```

The application will now be running live at `http://localhost:5173`.

---

## 🔒 License
This project is proprietary or licensed under the [MIT License](LICENSE).

<div align="center">
  <br>
  <i>Designed for cinephiles. Powered by AI.</i>
</div>
