import os
import pandas as pd
import pickle
from preprocessing.loader import DataLoader
from preprocessing.cleaner import DataCleaner
from preprocessing.feature_engineering import FeatureEngineer
from models.collaborative import CollaborativeRecommender
from models.content_based import ContentBasedRecommender
from config import Config

def train_pipeline():
    print("Starting Training Pipeline...")
    
    # Paths
    data_dir = Config.RAW_DATA_DIR
    model_dir = Config.MODEL_DIR
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)

    # 1. Load Data
    print("Loading Data...")
    loader = DataLoader(data_dir)
    movies_df = loader.load_movies()
    ratings_df = loader.load_ratings()
    
    # 2. Clean Data
    print("Cleaning Data...")
    cleaner = DataCleaner()
    movies_df = cleaner.clean_movies(movies_df)
    ratings_df = cleaner.clean_ratings(ratings_df)
    
    # 3. Consistency Check
    # Ensure ratings only include movies present in movies_df
    valid_movie_ids = set(movies_df['movieId'])
    ratings_df = ratings_df[ratings_df['movieId'].isin(valid_movie_ids)]
    
    # Also ensure movies_df is sorted by movieId? Or just indices match?
    # Let's sort movies_df by ID to be deterministic
    movies_df = movies_df.sort_values('movieId').reset_index(drop=True)
    
    # IMPORTANT: Filter ratings to only these movies
    # (Already did above)
    
    # 4. Train Collaborative Model
    print("Training Collaborative Model...")
    collab_model = CollaborativeRecommender(n_components=50)
    collab_model.fit(ratings_df)
    
    print(f"Saving Collaborative Model to {model_dir}...")
    collab_model.save(os.path.join(model_dir, 'svd_model.pkl'))
    
    # 5. Train Content-Based Model
    print("Feature Engineering...")
    fe = FeatureEngineer()
    # We must ensure we pass movies in the *exact same order* as SVD expects if we want strict index matching.
    # But wait, SVD `create_matrix` maps movieId -> index based on unique IDs in ratings_df.
    # Those might differ from movies_df if some movies have no ratings.
    
    # Logic:
    # 1. Determine common set of movies (or union).
    # 2. SVD usually handles subset. 
    # 3. Hybrid logic assumed we can map via IDs.
    #    Hybrid loads Collab. It has `movie_mapper`.
    #    Hybrid loads Content. It has `movie_mapper`.
    #    If we work with IDs, we are safe.
    #    My Hybrid implementation gets scores from each and then normailizes.
    
    tfidf_matrix = fe.create_content_features(movies_df)
    
    print("Training Content-Based Model...")
    content_model = ContentBasedRecommender()
    content_model.fit(tfidf_matrix, movies_df['movieId'])
    
    print(f"Saving Content-Based Model to {model_dir}...")
    content_model.save(os.path.join(model_dir, 'content_model.pkl'))
    
    # Merge ratings statistics into movies_df for API use
    print("Calculating Movie Statistics...")
    movie_stats = ratings_df.groupby('movieId').agg({'rating': ['mean', 'count']}).reset_index()
    movie_stats.columns = ['movieId', 'vote_average', 'vote_count']
    
    # Merge with movies_df
    movies_df = pd.merge(movies_df, movie_stats, on='movieId', how='left')
    movies_df['vote_average'] = movies_df['vote_average'].fillna(0).round(1)
    movies_df['vote_count'] = movies_df['vote_count'].fillna(0).astype(int)

    # Also save the Movie Metadata for API (Title, Year, Poster path placeholders)
    # We can save movies_df as pickle for fast lookup or CSV
    movies_df.to_pickle(os.path.join(Config.PROCESSED_DATA_DIR, 'movies_metadata.pkl'))
    
    # Check alignment for Hybrid Use (Verification)
    # Collab mapper size:
    print(f"Collaborative Movies: {len(collab_model.movie_mapper)}")
    print(f"Content Movies: {len(movies_df)}")
    
    print("Pipeline Complete!")

if __name__ == '__main__':
    train_pipeline()
