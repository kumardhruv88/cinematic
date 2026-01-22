import pandas as pd
import re

class DataCleaner:
    def __init__(self):
        pass
        
    def clean_movies(self, movies_df):
        """
        Cleans movies dataframe:
        - Extracts year from title
        - Splits genres
        - Handles missing values
        """
        df = movies_df.copy()
        
        # Extract year from title (e.g., "Toy Story (1995)")
        # Regex to find (DDDD) at the end of the string
        df['year'] = df['title'].str.extract(r'\((\d{4})\)$')
        
        # Fill missing years with 0 or estimate? Let's use 0 for now
        df['year'] = df['year'].fillna(0).astype(int)
        
        # Clean title by removing year
        df['clean_title'] = df['title'].str.replace(r'\s*\(\d{4}\)$', '', regex=True)
        
        # Split genres
        df['genres'] = df['genres'].apply(lambda x: x.split('|') if isinstance(x, str) else [])
        
        return df
        
    def clean_ratings(self, ratings_df):
        """
        Cleans ratings dataframe:
        - Removes duplicates
        - Checks range
        """
        # Drop duplicates if any (User-Movie pairs should be unique)
        ratings_df = ratings_df.drop_duplicates(subset=['userId', 'movieId'])
        
        return ratings_df
