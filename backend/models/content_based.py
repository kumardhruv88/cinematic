from sklearn.neighbors import NearestNeighbors
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import pickle

class ContentBasedRecommender:
    def __init__(self):
        # We might not need NearestNeighbors if we do full cosine scan for hybrid
        # But keeping it for simple similar-items queries
        self.model = NearestNeighbors(n_neighbors=20, metric='cosine')
        self.tfidf_matrix = None
        self.movie_ids = []
        self.movie_mapper = {} # mid -> idx
        
    def fit(self, tfidf_matrix, movie_ids):
        self.tfidf_matrix = tfidf_matrix
        self.movie_ids = list(movie_ids)
        self.movie_mapper = {mid: i for i, mid in enumerate(movie_ids)}
        self.model.fit(tfidf_matrix)
        
    def get_scores_for_session(self, watched_movie_ids):
        """
        Generates content-based scores for all movies based on watched history.
        """
        if self.tfidf_matrix is None:
            return None
            
        # Get indices of watched movies
        indices = [self.movie_mapper[mid] for mid in watched_movie_ids if mid in self.movie_mapper]
        
        if not indices:
            return np.zeros(self.tfidf_matrix.shape[0])
            
        # Create User Profile: Mean of watched movie vectors
        # Slicing sparse matrix returns sparse matrix
        watched_vectors = self.tfidf_matrix[indices]
        user_profile = np.mean(watched_vectors, axis=0) # This converts to dense matrix (matrix object)
        
        # Convert back to array (1, n_features)
        user_profile = np.asarray(user_profile)
        
        # Compute Cosine Similarity between Profile and All Movies
        # cosine_similarity accepts sparse matrices
        # Shape: (1, n_movies)
        scores = cosine_similarity(user_profile, self.tfidf_matrix)
        
        return scores.flatten()

    def save(self, filepath):
        state = {
            'tfidf_matrix': self.tfidf_matrix,
            'movie_ids': self.movie_ids,
            'movie_mapper': self.movie_mapper
        }
        with open(filepath, 'wb') as f:
            pickle.dump(state, f)

    @staticmethod
    def load(filepath):
        recommender = ContentBasedRecommender()
        with open(filepath, 'rb') as f:
            state = pickle.load(f)
            recommender.tfidf_matrix = state['tfidf_matrix']
            recommender.movie_ids = state['movie_ids']
            recommender.movie_mapper = state['movie_mapper']
            # Re-init NN if needed, or just skip if we only use scores
            recommender.model.fit(recommender.tfidf_matrix)
        return recommender
