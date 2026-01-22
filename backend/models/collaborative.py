from sklearn.decomposition import TruncatedSVD
from scipy.sparse import csr_matrix
import numpy as np
import pickle

class CollaborativeRecommender:
    def __init__(self, n_components=50):
        self.n_components = n_components
        self.model = TruncatedSVD(n_components=n_components, random_state=42)
        # Maps movieId to index (column index in matrix)
        self.movie_mapper = {} 
        self.movie_inv_mapper = {} 
        # We don't necessarily need to store all user factors for session-based, 
        # but we need item_factors (V^T)
        self.item_factors = None 
        
    def fit(self, ratings_df):
        print("Creating User-Item Matrix...")
        # Create sparse matrix
        # Map IDs
        user_ids = ratings_df['userId'].unique()
        movie_ids = ratings_df['movieId'].unique()
        
        user_mapper = {uid: i for i, uid in enumerate(user_ids)}
        self.movie_mapper = {mid: i for i, mid in enumerate(movie_ids)}
        self.movie_inv_mapper = {i: mid for mid, i in self.movie_mapper.items()}
        
        row_ind = ratings_df['userId'].map(user_mapper)
        col_ind = ratings_df['movieId'].map(self.movie_mapper)
        
        X = csr_matrix((ratings_df['rating'], (row_ind, col_ind)), shape=(len(user_ids), len(movie_ids)))
        
        print("Training SVD...")
        self.model.fit(X)
        self.item_factors = self.model.components_ # (n_components, n_movies)
        print("Training Complete.")

    def get_scores_for_session(self, watched_movie_ids):
        """
        Generates scores for all movies based on a list of watched movie IDs.
        watched_movie_ids: list of movieIds the user has watched/liked.
        """
        if self.item_factors is None:
            return None
            
        # Create a user vector (1, n_movies)
        # We interpret 'watched' as rating 5 or 1? Let's say 1 (implicit) or explicit if we had ratings.
        # For simplicity, 1.
        
        n_movies = len(self.movie_mapper)
        indices = [self.movie_mapper[mid] for mid in watched_movie_ids if mid in self.movie_mapper]
        
        if not indices:
            return np.zeros(n_movies)
            
        data = np.ones(len(indices))
        user_vec_sparse = csr_matrix((data, ([0]*len(indices), indices)), shape=(1, n_movies))
        
        # Transform to latent space (project user)
        # user_latent = user_vec * V * Sigma^-1 ??? 
        # sklearn transform does X * V. 
        user_latent = self.model.transform(user_vec_sparse) # (1, n_components)
        
        # Calculate scores: User_Latent * Item_Factors (V^T) ?? 
        # Wait. X ~ U * Sigma * V^T. 
        # transform(X) = X * V = U * Sigma.
        # So user_latent is (1, 50).
        # item_factors is V^T (50, M).
        # Scores = user_latent * item_factors = (1, 50) * (50, M) = (1, M)
        scores = np.dot(user_latent, self.item_factors)
        
        return scores.flatten()

    def get_all_movie_ids(self):
        # Return list of movieIds in order of columns
        return [self.movie_inv_mapper[i] for i in range(len(self.movie_mapper))]

    def save(self, filepath):
        with open(filepath, 'wb') as f:
            pickle.dump(self, f)

    @staticmethod
    def load(filepath):
        with open(filepath, 'rb') as f:
            return pickle.load(f)
