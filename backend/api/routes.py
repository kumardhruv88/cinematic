from flask import Blueprint, jsonify, request
from .utils import APIService
import os
import requests as req_lib

api_bp = Blueprint('api', __name__)

@api_bp.route('/recommendations', methods=['POST']) # Changed to POST to send session data easily
def get_recommendations():
    data = request.json or {}
    watched_ids = data.get('watched', []) # List of movieIds
    limit = data.get('limit', 20)
    genre = data.get('genre')
    
    service = APIService.get_instance()
    try:
        recs = service.get_recommendations(watched_ids, top_n=limit, genre=genre)
        return jsonify({'status': 'success', 'data': recs})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@api_bp.route('/movies', methods=['GET'])
def get_movies():
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))
    genre = request.args.get('genre')
    year = request.args.get('year')
    rating = float(request.args.get('rating', 0))
    sort_by = request.args.get('sortBy', 'popularity')
    duration = request.args.get('duration')
    
    service = APIService.get_instance()
    result = service.get_movies(
        page=page, 
        limit=limit, 
        genre=genre, 
        year=year, 
        min_rating=rating, 
        sort_by=sort_by,
        max_duration=duration
    )
    
    return jsonify({'status': 'success', **result})

@api_bp.route('/genres', methods=['GET'])
def get_genres():
    service = APIService.get_instance()
    genres = service.get_genres()
    return jsonify({'status': 'success', 'data': genres})

@api_bp.route('/search', methods=['GET'])
def search_movies():
    query = request.args.get('q', '')
    if not query:
        return jsonify({'data': []})
        
    service = APIService.get_instance()
    limit = int(request.args.get('limit', 10))
    results = service.search_movies(query, limit=limit)
    return jsonify({'status': 'success', 'data': results})

@api_bp.route('/movie/<int:movie_id>', methods=['GET'])
def get_movie_detail(movie_id):
    service = APIService.get_instance()
    movie = service.get_movie_details(movie_id)
    if movie:
        return jsonify({'status': 'success', 'data': movie})
    return jsonify({'status': 'error', 'message': 'Movie not found'}), 404

@api_bp.route('/trending', methods=['GET'])
def get_trending():
    service = APIService.get_instance()
    movies = service.get_trending()
    return jsonify({'status': 'success', 'data': movies})

@api_bp.route('/track', methods=['POST'])
def track_activity():
    # Stateless tracking - we just acknowledge receipt
    # In a real deployed version, we might log this to a file or DB for analytics
    # For this project, we rely on the client sending us their full history for recommendations
    return jsonify({'status': 'success'})

@api_bp.route('/series', methods=['GET'])
def get_popular_series():
    page = int(request.args.get('page', 1))
    service = APIService.get_instance()
    series = service.get_popular_series(page)
    return jsonify({'status': 'success', 'data': series})

@api_bp.route('/series/search', methods=['GET'])
def search_series():
    query = request.args.get('q', '')
    if not query:
        return jsonify({'data': []})
        
    service = APIService.get_instance()
    results = service.search_series(query)
    return jsonify({'status': 'success', 'data': results})

@api_bp.route('/series/<int:tv_id>', methods=['GET'])
def get_series_detail(tv_id):
    service = APIService.get_instance()
    data = service.get_series_details(tv_id)
    if data:
        return jsonify({'status': 'success', 'data': data})
    return jsonify({'status': 'error', 'message': 'Series not found'}), 404

@api_bp.route('/series/<int:tv_id>/season/<int:season_num>', methods=['GET'])
def get_season_details(tv_id, season_num):
    service = APIService.get_instance()
    episodes = service.get_series_season(tv_id, season_num)
    return jsonify({'status': 'success', 'data': episodes})

# ──────────────────────────────────────────────
# TRAILER  — fetch YouTube videos from TMDB
# ──────────────────────────────────────────────
@api_bp.route('/movie/<int:movie_id>/videos', methods=['GET'])
def get_movie_videos(movie_id):
    service = APIService.get_instance()
    try:
        url = f"{service.tmdb_base_url}/movie/{movie_id}/videos"
        response = req_lib.get(url, headers=service.tmdb_headers, timeout=3)
        if response.status_code == 200:
            results = response.json().get('results', [])
            # Prefer official trailers on YouTube
            trailers = [v for v in results if v.get('site') == 'YouTube' and v.get('type') == 'Trailer']
            teasers  = [v for v in results if v.get('site') == 'YouTube' and v.get('type') == 'Teaser']
            videos   = trailers or teasers or [v for v in results if v.get('site') == 'YouTube']
            return jsonify({'status': 'success', 'data': videos[:3]})
    except Exception as e:
        print(f"Error fetching videos: {e}")
    return jsonify({'status': 'success', 'data': []})

# ──────────────────────────────────────────────
# WHERE TO WATCH  — streaming providers from TMDB
# ──────────────────────────────────────────────
@api_bp.route('/movie/<int:movie_id>/providers', methods=['GET'])
def get_watch_providers(movie_id):
    service = APIService.get_instance()
    try:
        url = f"{service.tmdb_base_url}/movie/{movie_id}/watch/providers"
        response = req_lib.get(url, headers=service.tmdb_headers, timeout=3)
        if response.status_code == 200:
            results = response.json().get('results', {})
            # Try IN (India) first, then US
            region_data = results.get('IN') or results.get('US') or {}
            providers = {
                'flatrate': region_data.get('flatrate', []),   # Subscription (Netflix, Prime)
                'rent':     region_data.get('rent', []),
                'buy':      region_data.get('buy', []),
                'link':     region_data.get('link', '')        # TMDB JustWatch deep link
            }
            return jsonify({'status': 'success', 'data': providers})
    except Exception as e:
        print(f"Error fetching providers: {e}")
    return jsonify({'status': 'success', 'data': {}})

# ──────────────────────────────────────────────
# AI CHATBOT  — powered by Hugging Face
# ──────────────────────────────────────────────
@api_bp.route('/chat', methods=['POST'])
def chat():
    data = request.json or {}
    user_message = data.get('message', '').strip()
    if not user_message:
        return jsonify({'status': 'success', 'reply': 'Please type a movie question! 🎬'})

    from dotenv import load_dotenv
    load_dotenv(override=True)
    hf_token = os.environ.get('HF_TOKEN', '')

    # Check for missing or placeholder key
    if not hf_token or 'your_' in hf_token or len(hf_token) < 10:
        return jsonify({
            'status': 'success',
            'reply': "🎬 I'm CineBot! To enable AI responses, add a free Hugging Face token to backend/.env:\n\nHF_TOKEN=hf_your_token_here\n\nGet one instantly at: huggingface.co/settings/tokens"
        })

    try:
        from huggingface_hub import InferenceClient
        client = InferenceClient(api_key=hf_token)
        
        system_prompt = (
            "You are CineBot, an expert AI movie and TV assistant for CINEMATIQ. "
            "Answer ONLY questions about movies, TV shows, directors, actors, genres, and recommendations. "
            "Be concise (max 3-4 sentences), friendly, and enthusiastic about cinema. "
            "If asked about anything unrelated to movies/TV, politely redirect to cinema topics. "
            "When recommending movies, always include the year in brackets e.g. The Godfather (1972)."
        )

        # Qwen 2.5 72B is incredibly smart, natively supports chat_completion, and doesn't hallucinate
        response = client.chat_completion(
            model="Qwen/Qwen2.5-72B-Instruct",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=250,
            temperature=0.7
        )
        
        reply = response.choices[0].message.content.strip()
        return jsonify({'status': 'success', 'reply': reply})

    except Exception as e:
        err_msg = str(e).lower()
        print(f"[CineBot] HF Error: {e}")
        
        if "unauthorized" in err_msg or "invalid token" in err_msg:
            return jsonify({'status': 'success', 'reply': "⚠️ Your Hugging Face token seems invalid. Please check backend/.env 🎬"})
        elif "loading" in err_msg or "starting" in err_msg:
            return jsonify({'status': 'success', 'reply': "⏳ The AI model is waking up! Please try asking again in 20 seconds. 🍿"})
        else:
            return jsonify({'status': 'success', 'reply': "Connection error — make sure you are connected to the internet! 🎬"})

