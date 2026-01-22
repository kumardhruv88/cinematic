from sklearn.feature_extraction.text import TfidfVectorizer
import pandas as pd
import numpy as np

class FeatureEngineer:
    def __init__(self):
        self.tfidf = TfidfVectorizer(stop_words='english', max_features=5000)
        
    def create_content_features(self, movies_df):
        """
        Creates content features for movies (Genres + Title).
        Returns a TF-IDF matrix.
        """
        # Combine genres and title for simple content representation
        # Genres are list, join them back for text processing
        genres_str = movies_df['genres'].apply(lambda x: ' '.join(x))
        
        # Combine title and genres
        content_text = movies_df['clean_title'] + " " + genres_str
        
        # Fit and transform
        tfidf_matrix = self.tfidf.fit_transform(content_text)
        
        return tfidf_matrix
    
    def get_tfidf_model(self):
        return self.tfidf
