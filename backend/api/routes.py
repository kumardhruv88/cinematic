from flask import Blueprint, jsonify, request
from .utils import APIService

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
