import pandas as pd
import os

class DataLoader:
    def __init__(self, data_dir):
        self.data_dir = data_dir
        
    def load_movies(self):
        """Loads movies.csv"""
        movies_path = os.path.join(self.data_dir, 'movies.csv')
        if not os.path.exists(movies_path):
            raise FileNotFoundError(f"movies.csv not found in {self.data_dir}")
        
        # Load movies
        return pd.read_csv(movies_path)
        
    def load_ratings(self):
        """Loads ratings.csv with optimized data types"""
        ratings_path = os.path.join(self.data_dir, 'ratings.csv')
        if not os.path.exists(ratings_path):
            raise FileNotFoundError(f"ratings.csv not found in {self.data_dir}")
            
        # Use efficient types to save memory
        dtype = {
            'userId': 'int32',
            'movieId': 'int32',
            'rating': 'float32',
            'timestamp': 'int32'
        }
        return pd.read_csv(ratings_path, dtype=dtype)

    def load_tags(self):
        """Loads tags.csv"""
        tags_path = os.path.join(self.data_dir, 'tags.csv')
        if not os.path.exists(tags_path):
             return pd.DataFrame() # Return empty if not found, as tags might be optional for basic models
        
        return pd.read_csv(tags_path)

    def load_links(self):
        """Loads links.csv"""
        links_path = os.path.join(self.data_dir, 'links.csv')
        if not os.path.exists(links_path):
             raise FileNotFoundError(f"links.csv not found in {self.data_dir}")
        return pd.read_csv(links_path)
