import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-cinematiq'
    DEBUG = True
    DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
    RAW_DATA_DIR = os.path.join(DATA_DIR, 'raw')
    PROCESSED_DATA_DIR = os.path.join(DATA_DIR, 'processed')
    MODEL_DIR = os.path.join(DATA_DIR, 'models')
    
    # TMDB Configuration
    TMDB_API_KEY = "2d540f4bf5e146223d7d092a462e26d2"
    TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZDU0MGY0YmY1ZTE0NjIyM2Q3ZDA5MmE0NjJlMjZkMiIsIm5iZiI6MTc0OTE4MjUzNy45OTYsInN1YiI6IjY4NDI2ODQ5NmQ1ODA5YjFmYjI4YTZiNyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5upF_5BPJAiKlPWTT5wcLMW5ZCxQg-Ue50QYreCw33o"

