import numpy as np
import os
from .collaborative import CollaborativeRecommender
from .content_based import ContentBasedRecommender

class HybridRecommender:
    def __init__(self, model_dir):
        self.model_dir = model_dir
        self.collaborative = None
        self.content_based = None
        self.master_ids = []
        self.cf_indices = None
        self.master_indices_with_cf = None
        
    def load_models(self):
        collab_path = os.path.join(self.model_dir, 'svd_model.pkl')
        content_path = os.path.join(self.model_dir, 'content_model.pkl')
        
        if os.path.exists(collab_path):
            self.collaborative = CollaborativeRecommender.load(collab_path)
            
        if os.path.exists(content_path):
            self.content_based = ContentBasedRecommender.load(content_path)

        # Precompute Alignment
        if self.collaborative and self.content_based:
            self.master_ids = self.content_based.movie_ids
            cf_indices_list = []
            master_indices_list = []
            
            for i, mid in enumerate(self.master_ids):
                if mid in self.collaborative.movie_mapper:
                    master_indices_list.append(i)
                    cf_indices_list.append(self.collaborative.movie_mapper[mid])
            
            self.master_indices_with_cf = np.array(master_indices_list)
            self.cf_indices = np.array(cf_indices_list)
            
    def recommend(self, watched_movie_ids, top_n=20):
        """
        Hybrid Recommendation Logic.
        """
        if not self.collaborative or not self.content_based:
            self.load_models()
            
        if not self.collaborative or not self.content_based:
             raise Exception("Models not found or failed to load.")

        # Get Scores
        cb_scores = self.content_based.get_scores_for_session(watched_movie_ids)
        cf_raw_scores = self.collaborative.get_scores_for_session(watched_movie_ids)
        
        # Align CF Scores to Master List (Content Based List)
        cf_scores = np.zeros(len(self.master_ids))
        
        if cf_raw_scores is not None and self.master_indices_with_cf is not None and len(self.master_indices_with_cf) > 0:
            cf_scores[self.master_indices_with_cf] = cf_raw_scores[self.cf_indices]

        # Normalize Scores (Min-Max)
        def normalize(scores):
            if np.all(scores == 0): return scores
            min_s = np.min(scores)
            max_s = np.max(scores)
            if max_s - min_s == 0: return np.zeros_like(scores)
            return (scores - min_s) / (max_s - min_s)

        cf_norm = normalize(cf_scores)
        cb_norm = normalize(cb_scores)
        
        # Weighted Hybrid
        # 0.6 CF + 0.4 CB
        final_scores = 0.6 * cf_norm + 0.4 * cb_norm
        
        # Filter watched items
        watched_set = set(watched_movie_ids)
        
        # Sort indices
        sorted_indices = final_scores.argsort()[::-1]
        
        recommendations = []
        count = 0
        for idx in sorted_indices:
            mid = self.master_ids[idx]
            if mid not in watched_set:
                recommendations.append({'movieId': mid, 'score': float(final_scores[idx])})
                count += 1
                if count >= top_n:
                    break
                    
        return recommendations
