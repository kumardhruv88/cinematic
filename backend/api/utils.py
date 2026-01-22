import pandas as pd
import os
import requests
from functools import lru_cache
from concurrent.futures import ThreadPoolExecutor, as_completed
from config import Config
from models.hybrid import HybridRecommender

class APIService:
    _instance = None
    
    def __init__(self):
        self.movies_df = None
        self.hybrid_recommender = None
        self.tmdb_base_url = "https://api.themoviedb.org/3"
        self.tmdb_headers = {
            "accept": "application/json",
            "Authorization": f"Bearer {Config.TMDB_ACCESS_TOKEN}"
        }
        # Thread pool for parallel API requests
        self.executor = ThreadPoolExecutor(max_workers=20)
        
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = APIService()
            cls._instance.initialize()
        return cls._instance
        
    def initialize(self):
        print("Initializing API Service...")
        # Load Metadata
        meta_path = os.path.join(Config.PROCESSED_DATA_DIR, 'movies_metadata.pkl')
        if os.path.exists(meta_path):
            self.movies_df = pd.read_pickle(meta_path)
            # Pre-compute lowercase title for faster search
            if 'title' in self.movies_df.columns:
                self.movies_df['title_search'] = self.movies_df['title'].str.lower()
        else:
            print("Metadata not found. Service might be degraded.")
            self.movies_df = pd.DataFrame()

        # Load Links for TMDB IDs (Images)
        try:
            links_path = os.path.join(Config.RAW_DATA_DIR, 'links.csv')
            if os.path.exists(links_path) and not self.movies_df.empty:
                links_df = pd.read_csv(links_path)
                # Merge on movieId
                self.movies_df = self.movies_df.merge(links_df, on='movieId', how='left')
                # Fill NaNs
                self.movies_df['tmdbId'] = self.movies_df['tmdbId'].fillna(0).astype(int)
        except Exception as e:
            print(f"Error loading links: {e}")

        # Initialize Recommender
        self.hybrid_recommender = HybridRecommender(Config.MODEL_DIR)
        try:
            self.hybrid_recommender.load_models()
        except:
            print("Could not load ML models. Recommendations will be fallback.")

    @lru_cache(maxsize=2000)
    def fetch_tmdb_data(self, tmdb_id):
        """Fetches poster and metadata from TMDB API"""
        if not tmdb_id: return {}
        
        try:
            url = f"{self.tmdb_base_url}/movie/{tmdb_id}"
            # Shorter timeout to prevent blocking, but enough for API
            response = requests.get(url, headers=self.tmdb_headers, timeout=0.8) 
            if response.status_code == 200:
                data = response.json()
                return {
                    'poster_path': data.get('poster_path'),
                    'overview': data.get('overview'),
                    'vote_average': data.get('vote_average'),
                    'release_date': data.get('release_date'),
                    'runtime': data.get('runtime')
                }
        except Exception as e:
            # Silent fail for individual image fetch to keep list loading
            pass
        return {}

    def enrich_movie(self, movie_record):
        """Adds TMDB data to a movie record (Single)"""
        if not movie_record: return movie_record
        
        tmdb_id = movie_record.get('tmdbId')
        if tmdb_id:
            tmdb_data = self.fetch_tmdb_data(tmdb_id)
            if tmdb_data.get('poster_path'):
                movie_record['posterPath'] = "https://image.tmdb.org/t/p/w500" + tmdb_data['poster_path']
            if tmdb_data.get('overview'):
                movie_record['description'] = tmdb_data['overview']
            # Optionally update rating if missing in dataset
            if not movie_record.get('vote_average') and tmdb_data.get('vote_average'):
                 movie_record['rating'] = tmdb_data['vote_average']
            if tmdb_data.get('runtime'):
                 movie_record['runtime'] = tmdb_data['runtime']
            
        return movie_record

    def enrich_movies_parallel(self, movies_list):
        """Enriches a list of movies via parallel API calls"""
        if not movies_list: return []
        
        # We can submit all tasks to the executor
        # Since enrich_movie modifies the dict in place or returns it, 
        # using map match order is easiest.
        return list(self.executor.map(self.enrich_movie, movies_list))
            
    def get_movie_details(self, movie_id):
        if self.movies_df is None or self.movies_df.empty:
            return None
        
        row = self.movies_df[self.movies_df['movieId'] == movie_id]
        if row.empty:
            return None
        
        movie_data = row.iloc[0].to_dict()
        return self.enrich_movie(movie_data)

    def get_recommendations(self, watched_ids, top_n=20, genre=None):
        if not self.hybrid_recommender.collaborative: 
             return self.get_trending(limit=top_n)
        
        fetch_n = top_n * 5 if genre else top_n
        recs = self.hybrid_recommender.recommend(watched_movie_ids=watched_ids, top_n=fetch_n)
        
        results = []
        # Pre-filter IDs to minimal set before enrichment if possible?
        # But we need details to check genre.
        # So we fetch details (local DB) first, filter, then enrich only valid ones.
        
        candidates = []
        for rec in recs:
            row = self.movies_df[self.movies_df['movieId'] == rec['movieId']]
            if not row.empty:
                data = row.iloc[0].to_dict()
                
                # Genre Filter
                if genre:
                     movie_genres = data.get('genres', [])
                     if isinstance(movie_genres, list):
                         if genre not in movie_genres:
                             continue
                
                data['score'] = rec['score']
                candidates.append(data)
                if len(candidates) >= top_n:
                    break
        
        # Enrich only the final list
        results = self.enrich_movies_parallel(candidates)
        
        # Fallback
        if len(results) < top_n and genre:
            needed = top_n - len(results)
            fallback_result = self.get_movies(page=1, limit=needed, genre=genre, sort_by='votes') 
            existing_ids = set(r['movieId'] for r in results)
            
            for movie in fallback_result['data']:
                if movie['movieId'] not in existing_ids:
                    movie['score'] = 0.5 
                    results.append(movie)
                    
        return results

    def get_movies(self, page=1, limit=20, genre=None, year=None, min_rating=0, sort_by='popularity', max_duration=None):
        if self.movies_df is None or self.movies_df.empty:
            return {'data': [], 'total': 0, 'page': page, 'pages': 0}
            
        filtered_df = self.movies_df.copy()
        
        # Apply Filters (Pre-Enrichment)
        if genre:
            mask = filtered_df['genres'].apply(lambda x: genre in x if isinstance(x, list) else False)
            filtered_df = filtered_df[mask]
            
        if year:
            try:
                target_year = int(year)
                filtered_df = filtered_df[filtered_df['year'].fillna(-1).astype(int) == target_year]
            except ValueError:
                pass
            
        if min_rating > 0:
            filtered_df = filtered_df[filtered_df['vote_average'].fillna(0) >= float(min_rating)]
            
        # Sorting
        if sort_by == 'latest':
            filtered_df = filtered_df.sort_values('year', ascending=False)
        elif sort_by == 'rating':
            filtered_df = filtered_df.sort_values('vote_average', ascending=False)
        elif sort_by == 'votes':
            filtered_df = filtered_df.sort_values('vote_count', ascending=False)
        else: 
            sort_col = 'popularity' if 'popularity' in filtered_df.columns else 'vote_count'
            filtered_df = filtered_df.sort_values(sort_col, ascending=False)

        # Pagination for FETCHING candidates
        # Note: If we filter by duration post-fetch, we might end up with fewer items than 'limit'.
        # To mitigate, we fetch a buffer logic or just return what we have (MVP approach).
        # Better: Fetch 'limit' items, enrich, filter. If count < limit, fetch next batch.
        # COMPLEXITY SIMPLIFICATION: We will apply duration filter on the returned page ONLY.
        
        total_items = len(filtered_df)
        total_pages = max(1, (total_items + limit - 1) // limit)
        
        start = (page - 1) * limit
        end = start + limit
        
        raw_results = filtered_df.iloc[start:end].to_dict('records')
        
        # Parallel Enrichment
        data = self.enrich_movies_parallel(raw_results)
        
        # Apply Duration Filter (Post-Enrichment)
        if max_duration:
            try:
                max_d = int(max_duration)
                # Keep items where runtime is unknown (None) or <= max_d
                # Flexible: If unknown, keep it.
                data = [m for m in data if not m.get('runtime') or m.get('runtime') <= max_d]
            except ValueError:
                pass
        
        return {
            'data': data,
            'total': total_items,
            'page': page,
            'pages': total_pages
        }

    def search_movies(self, query, limit=10):
        if self.movies_df is None: return []
        
        # Optimized Search using pre-computed lowercase column if available
        # OR just use title.str.contains with case=False which is reasonably fast
        # but let's be robust
        
        q_lower = query.lower()
        if 'title_search' in self.movies_df.columns:
             mask = self.movies_df['title_search'].str.contains(q_lower, na=False)
        else:
             mask = self.movies_df['title'].str.contains(query, case=False, na=False)
             
        raw_results = self.movies_df[mask].head(limit).to_dict('records')
        
        return self.enrich_movies_parallel(raw_results)
    
    def get_trending(self, limit=20):
        if self.movies_df is None or self.movies_df.empty: return []
        
        if 'vote_count' in self.movies_df.columns:
            min_votes = self.movies_df['vote_count'].quantile(0.90)
            trending_candidates = self.movies_df[self.movies_df['vote_count'] >= min_votes]
            raw_results = trending_candidates.sort_values('vote_average', ascending=False).head(limit).to_dict('records')
        else:
             raw_results = self.movies_df.sample(n=min(limit, len(self.movies_df))).to_dict('records')
             
        return self.enrich_movies_parallel(raw_results)

    def get_genres(self):
        if self.movies_df is None or self.movies_df.empty: return []
        
        all_genres = set()
        for genres in self.movies_df['genres']:
            if isinstance(genres, list):
                all_genres.update(genres)
        
        return sorted(list(all_genres))

    def _normalize_tv_data(self, tv_data):
        """Normalizes TMDB TV data to match our Movie structure"""
        if not tv_data: return None
        
        return {
            'movieId': tv_data.get('id'), # Use TMDB ID as ID for series
            'tmdbId': tv_data.get('id'),
            'title': tv_data.get('name'),
            'year': tv_data.get('first_air_date', '')[:4] if tv_data.get('first_air_date') else '',
            'posterPath': f"https://image.tmdb.org/t/p/w500{tv_data.get('poster_path')}" if tv_data.get('poster_path') else None,
            'rating': tv_data.get('vote_average'),
            'description': tv_data.get('overview'),
            'genres': [g['name'] for g in tv_data.get('genres', [])] if 'genres' in tv_data else [],
            'type': 'tv' # Marker to distinguish
        }

    def get_popular_series(self, page=1):
        """Fetches popular TV series from TMDB"""
        try:
            url = f"{self.tmdb_base_url}/tv/popular?page={page}"
            response = requests.get(url, headers=self.tmdb_headers, timeout=2)
            if response.status_code == 200:
                results = response.json().get('results', [])
                return [self._normalize_tv_data(item) for item in results]
        except Exception as e:
            print(f"Error fetching popular series: {e}")
        return []

    def search_series(self, query):
        """Searches for TV series on TMDB"""
        if not query: return []
        try:
            url = f"{self.tmdb_base_url}/search/tv?query={query}"
            response = requests.get(url, headers=self.tmdb_headers, timeout=2)
            if response.status_code == 200:
                results = response.json().get('results', [])
                return [self._normalize_tv_data(item) for item in results]
        except Exception as e:
            print(f"Error searching series: {e}")
        return []

    def get_series_details(self, tv_id):
        """Fetches TV show details and recommendations"""
        try:
            # Details
            url = f"{self.tmdb_base_url}/tv/{tv_id}"
            response = requests.get(url, headers=self.tmdb_headers, timeout=2)
            if response.status_code != 200: return None
            
            details = self._normalize_tv_data(response.json())
            
            # Recommendations
            rec_url = f"{self.tmdb_base_url}/tv/{tv_id}/recommendations"
            rec_res = requests.get(rec_url, headers=self.tmdb_headers, timeout=2)
            recs = []
            if rec_res.status_code == 200:
                 recs = [self._normalize_tv_data(item) for item in rec_res.json().get('results', [])[:10]]
            
            return {'details': details, 'recommendations': recs}
            
        except Exception as e:
            print(f"Error fetching series details: {e}")
            return None

    def get_series_season(self, tv_id, season_number):
        """Fetches episodes for a specific season"""
        try:
            url = f"{self.tmdb_base_url}/tv/{tv_id}/season/{season_number}"
            response = requests.get(url, headers=self.tmdb_headers, timeout=2)
            if response.status_code == 200:
                data = response.json()
                episodes = []
                for ep in data.get('episodes', []):
                    img_path = ep.get('still_path')
                    episodes.append({
                        'episode_number': ep.get('episode_number'),
                        'name': ep.get('name'),
                        'overview': ep.get('overview'),
                        'still_path': f"https://image.tmdb.org/t/p/w500{img_path}" if img_path else None,
                        'air_date': ep.get('air_date')
                    })
                return episodes
        except Exception as e:
            print(f"Error fetching season details: {e}")
        return []
