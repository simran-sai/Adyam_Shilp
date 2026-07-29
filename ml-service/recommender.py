"""
recommender.py
Core ML Engines for Adyam Shilp Recommendation System

Engines:
  1. ContentEngine      — TF-IDF + Cosine Similarity (content-based)
  2. CollaborativeEngine — TruncatedSVD Matrix Factorization (collaborative)
  3. KNNEngine          — K-Nearest Neighbors (item-item similarity)
  4. HybridRecommender  — Blends all three with behavioral signals
"""

import math
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import MinMaxScaler
import logging

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# Product Catalogue (mirrors all_products.js; in production could be fetched
# from MongoDB via the Node backend)
# ─────────────────────────────────────────────────────────────────────────────
CATALOGUE = [
    {"id": 1,  "name": "Lippan Art of Jagannatha",    "category": "God Idols",              "new_price": 1500, "old_price": 2000},
    {"id": 2,  "name": "Couple Idol Frame",            "category": "Home Decor",             "new_price": 900,  "old_price": 1000},
    {"id": 3,  "name": "Theme based photoframe",       "category": "Home Decor",             "new_price": 190,  "old_price": 200},
    {"id": 4,  "name": "Rakhi bands",                  "category": "Accessories and Rakhi",  "new_price": 45,   "old_price": 50},
    {"id": 5,  "name": "Theme based photoframe",       "category": "Home Decor",             "new_price": 200,  "old_price": 300},
    {"id": 6,  "name": "Hand made clay portrait",      "category": "Home Decor",             "new_price": 1500, "old_price": 2000},
    {"id": 7,  "name": "NamePlate",                    "category": "Home Decor",             "new_price": 90,   "old_price": 100},
    {"id": 8,  "name": "Beautiful Clay Dolls",         "category": "Home Decor",             "new_price": 1900, "old_price": 2000},
    {"id": 9,  "name": "Clay Dolls",                   "category": "Home Decor",             "new_price": 25,   "old_price": 30},
    {"id": 10, "name": "Clay Mickey Mouse",            "category": "Home Decor",             "new_price": 90,   "old_price": 100},
    {"id": 11, "name": "wall clock",                   "category": "Accessories and Rakhi",  "new_price": 1900, "old_price": 2000},
    {"id": 12, "name": "wall clock",                   "category": "Accessories and Rakhi",  "new_price": 1900, "old_price": 2000},
    {"id": 13, "name": "wall clock",                   "category": "Accessories and Rakhi",  "new_price": 1500, "old_price": 1745},
    {"id": 14, "name": "wall clock",                   "category": "Accessories and Rakhi",  "new_price": 1500, "old_price": 1800},
    {"id": 15, "name": "wall clock",                   "category": "Accessories and Rakhi",  "new_price": 1290, "old_price": 1400},
    {"id": 16, "name": "Rakhi Bands",                  "category": "Accessories and Rakhi",  "new_price": 1290, "old_price": 1400},
    {"id": 17, "name": "Birth Details Photoframe",     "category": "Home Decor",             "new_price": 1290, "old_price": 1400},
    {"id": 18, "name": "Clay Dinosaur",                "category": "Home Decor",             "new_price": 1290, "old_price": 1400},
    {"id": 19, "name": "Key Rings",                    "category": "Accessories and Rakhi",  "new_price": 1290, "old_price": 1400},
    {"id": 20, "name": "Customised Hangings",          "category": "Accessories and Rakhi",  "new_price": 1290, "old_price": 1400},
    {"id": 21, "name": "Birth Details Photoframe",     "category": "Home Decor",             "new_price": 1290, "old_price": 1400},
    {"id": 22, "name": "Customised Key Ring",          "category": "Accessories and Rakhi",  "new_price": 1290, "old_price": 1400},
    {"id": 23, "name": "Earrings",                     "category": "Accessories and Rakhi",  "new_price": 1290, "old_price": 1400},
    {"id": 24, "name": "Ganesh Ji",                    "category": "God Idols",              "new_price": 1290, "old_price": 1400},
    {"id": 25, "name": "Clay Bike",                    "category": "Home Decor",             "new_price": 1290, "old_price": 1400},
    {"id": 26, "name": "Jaganatha Ji",                 "category": "God Idols",              "new_price": 1290, "old_price": 1400},
    {"id": 27, "name": "Glass Covers",                 "category": "Home Decor",             "new_price": 1290, "old_price": 1400},
    {"id": 28, "name": "Masks",                        "category": "Accessories and Rakhi",  "new_price": 1290, "old_price": 1400},
    {"id": 29, "name": "Shiv Ji",                      "category": "God Idols",              "new_price": 1290, "old_price": 1400},
    {"id": 30, "name": "Clay Santa",                   "category": "Home Decor",             "new_price": 1290, "old_price": 1400},
    {"id": 38, "name": "Hand made clay portrait",      "category": "Home Decor",             "new_price": 1500, "old_price": 2000},
    {"id": 46, "name": "Hand made clay portrait",      "category": "Home Decor",             "new_price": 1500, "old_price": 2000},
    {"id": 53, "name": "Hand made clay portrait",      "category": "Home Decor",             "new_price": 1500, "old_price": 2000},
]

# ─────────────────────────────────────────────────────────────────────────────
# 1. CONTENT-BASED ENGINE — TF-IDF + Cosine Similarity
# ─────────────────────────────────────────────────────────────────────────────
class ContentEngine:
    """
    Builds a TF-IDF matrix over product text features and computes
    cosine similarity to surface the most semantically similar items.
    """
    def __init__(self, products: list[dict]):
        self.products = products
        self.id_to_idx = {p["id"]: i for i, p in enumerate(products)}
        self._build()

    def _build(self):
        # Rich feature string: name × 3 (amplify name signal) + category × 2 + price tier
        def feature_text(p):
            price_tier = (
                "budget" if p["new_price"] < 200
                else "mid" if p["new_price"] < 1000
                else "premium"
            )
            return (
                f"{p['name']} {p['name']} {p['name']} "
                f"{p['category']} {p['category']} "
                f"{price_tier}"
            )

        corpus = [feature_text(p) for p in self.products]
        self.vectorizer = TfidfVectorizer(
            analyzer="word",
            ngram_range=(1, 2),
            min_df=1,
            stop_words="english",
        )
        tfidf_matrix = self.vectorizer.fit_transform(corpus)
        self.sim_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)
        logger.info("ContentEngine: TF-IDF matrix built (%dx%d)", *self.sim_matrix.shape)

    def similar_to(self, product_id: int, n: int = 10) -> list[tuple[int, float]]:
        """Return top-n (product_id, similarity_score) pairs for a given product."""
        if product_id not in self.id_to_idx:
            return []
        idx = self.id_to_idx[product_id]
        row = self.sim_matrix[idx]
        top_indices = np.argsort(-row)  # descending
        results = []
        for i in top_indices:
            if self.products[i]["id"] != product_id:
                results.append((self.products[i]["id"], float(row[i])))
            if len(results) >= n:
                break
        return results

    def score_for_user(self, liked_ids: list[int], viewed_ids: list[int]) -> dict[int, float]:
        """
        Aggregate content similarity scores across all liked/viewed items.
        Liked items get 3× weight, viewed 1×.
        """
        scores: dict[int, float] = {}
        seed_ids = [(pid, 3.0) for pid in liked_ids] + [(pid, 1.0) for pid in viewed_ids]

        for seed_id, weight in seed_ids:
            if seed_id not in self.id_to_idx:
                continue
            for pid, sim in self.similar_to(seed_id, n=len(self.products)):
                scores[pid] = scores.get(pid, 0.0) + sim * weight

        return scores


# ─────────────────────────────────────────────────────────────────────────────
# 2. COLLABORATIVE ENGINE — Truncated SVD (Matrix Factorization)
# ─────────────────────────────────────────────────────────────────────────────
class CollaborativeEngine:
    """
    Builds a user-item interaction matrix from event logs, applies
    Truncated SVD to learn latent factors, then scores items for a
    given implicit user vector.

    With few users (cold-start) this degrades gracefully to popularity scoring.
    """
    def __init__(self, products: list[dict]):
        self.products = products
        self.product_ids = [p["id"] for p in products]
        self.id_to_col = {pid: i for i, pid in enumerate(self.product_ids)}
        self.n_components = min(10, len(products) - 1)
        self.svd = TruncatedSVD(n_components=self.n_components, random_state=42)
        self.item_factors: np.ndarray | None = None  # shape (n_items, n_components)
        self._synthetic_bootstrap()

    def _synthetic_bootstrap(self):
        """
        In cold-start (no real user data), synthesise a small interaction matrix
        from product metadata:
          - Same category products → implicit co-interaction
          - Same price tier → implicit co-interaction
        The matrix is (n_synthetic_users, n_items) so that SVD.transform()
        always expects a vector of length n_items (matching user_vec at inference).
        """
        n = len(self.products)
        n_synthetic = 6  # synthetic user profiles
        matrix = np.zeros((n_synthetic, n))

        for i, p in enumerate(self.products):
            for j, q in enumerate(self.products):
                if i == j:
                    continue
                # Category overlap
                if p["category"] == q["category"]:
                    matrix[0, i] += 0.5
                    matrix[1, j] += 0.5
                # Price tier overlap
                def tier(x): return 0 if x < 200 else 1 if x < 1000 else 2
                if tier(p["new_price"]) == tier(q["new_price"]):
                    matrix[2, i] += 0.3
                    matrix[3, j] += 0.3
                # Discount affinity
                disc_p = (p["old_price"] - p["new_price"]) / max(p["old_price"], 1)
                disc_q = (q["old_price"] - q["new_price"]) / max(q["old_price"], 1)
                if abs(disc_p - disc_q) < 0.1:
                    matrix[4, i] += 0.2
                    matrix[5, j] += 0.2

        # Fit SVD: input is (n_synthetic_users, n_items)
        # item_factors shape: (n_items, n_components)
        self.n_features_in_ = n  # items dimension
        self.svd.fit(matrix)     # SVD now expects n_items features
        self.item_factors = self.svd.components_.T  # (n_items, n_components)
        logger.info("CollaborativeEngine: SVD bootstrap complete (n_components=%d, n_items=%d)", self.n_components, n)

    def fit_user_interactions(self, interactions: list[dict]):
        """
        Re-fit SVD with real interaction events.
        interactions = [{"userId": "u1", "productId": 5, "event": "like", "weight": 3.0}, ...]
        The matrix is (n_users, n_items) so transform() expects n_items features.
        """
        if not interactions:
            return

        users = list({ev["userId"] for ev in interactions})
        user_to_row = {u: i for i, u in enumerate(users)}
        n_users = len(users)
        n_items = len(self.products)

        matrix = np.zeros((n_users, n_items))
        for ev in interactions:
            row = user_to_row[ev["userId"]]
            col = self.id_to_col.get(ev["productId"], -1)
            if col >= 0:
                matrix[row, col] += ev.get("weight", 1.0)

        self.n_components = min(self.n_components, min(n_users, n_items) - 1)
        if self.n_components < 1:
            return
        self.svd = TruncatedSVD(n_components=self.n_components, random_state=42)
        self.svd.fit(matrix)                         # expects n_items features
        self.item_factors = self.svd.components_.T   # (n_items, n_components)
        self.n_features_in_ = n_items
        logger.info("CollaborativeEngine: Re-fitted on %d users, %d items", n_users, n_items)

    def score_for_vector(self, user_vector: np.ndarray) -> dict[int, float]:
        """
        Project user_vector through SVD factors to get per-item collaborative scores.
        user_vector: shape (n_items,) — the user's implicit interaction weights.
        The SVD was fitted on (n_users, n_items) so transform() expects n_items features.
        """
        if self.item_factors is None:
            return {}
        try:
            # user_vector shape: (n_items,) → reshape to (1, n_items)
            user_latent = self.svd.transform(user_vector.reshape(1, -1))[0]  # (n_components,)
            # Dot product with each item's latent factor
            scores_vec = self.item_factors @ user_latent  # (n_items,)
            return {self.product_ids[i]: float(scores_vec[i]) for i in range(len(self.products))}
        except ValueError:
            # Dimension mismatch safety net — return empty
            return {}


# ─────────────────────────────────────────────────────────────────────────────
# 3. KNN ENGINE — Item-Item Similarity
# ─────────────────────────────────────────────────────────────────────────────
class KNNEngine:
    """
    Scikit-learn BallTree KNN over TF-IDF item vectors.
    Used for "Because You Viewed" — finds true nearest neighbors.
    """
    def __init__(self, products: list[dict]):
        self.products = products
        self.id_to_idx = {p["id"]: i for i, p in enumerate(products)}
        self._build()

    def _build(self):
        def feature_text(p):
            return f"{p['name']} {p['name']} {p['category']}"

        corpus = [feature_text(p) for p in self.products]
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
        tfidf = vectorizer.fit_transform(corpus).toarray()

        k = min(7, len(self.products) - 1)
        self.knn = NearestNeighbors(n_neighbors=k + 1, metric="cosine", algorithm="brute")
        self.knn.fit(tfidf)
        self.tfidf = tfidf
        logger.info("KNNEngine: Fitted on %d products (k=%d)", len(self.products), k)

    def get_neighbors(self, product_id: int, n: int = 6) -> list[dict]:
        if product_id not in self.id_to_idx:
            return []
        idx = self.id_to_idx[product_id]
        vec = self.tfidf[idx].reshape(1, -1)
        distances, indices = self.knn.kneighbors(vec)
        neighbors = []
        for dist, i in zip(distances[0], indices[0]):
            pid = self.products[i]["id"]
            if pid != product_id:
                neighbors.append({
                    "id": pid,
                    "similarity": round(float(1 - dist), 4),
                })
            if len(neighbors) >= n:
                break
        return neighbors


# ─────────────────────────────────────────────────────────────────────────────
# 4. HYBRID RECOMMENDER — Blends all engines
# ─────────────────────────────────────────────────────────────────────────────
class HybridRecommender:
    """
    Combines:
      - Content-based (TF-IDF cosine similarity)
      - Collaborative (SVD matrix factorization)
      - Behavioral signals (view, like, cart, dislike with recency decay)

    Scoring formula (configurable weights):
      final_score = w_content * content_score
                  + w_collab  * collab_score
                  + w_behav   * behavioral_score
                  + price_affinity_bonus
    """

    WEIGHTS = {
        "content":  0.40,
        "collab":   0.25,
        "behav":    0.35,
    }

    # Behavioral signal weights
    SIG = {
        "like":      3.0,
        "cart":      2.5,
        "view":      1.0,
        "dislike":  -5.0,   # strong suppression
    }

    def __init__(self, products: list[dict] | None = None):
        self.products = products or CATALOGUE
        self.content  = ContentEngine(self.products)
        self.collab   = CollaborativeEngine(self.products)
        self.knn      = KNNEngine(self.products)
        self.id_to_product = {p["id"]: p for p in self.products}
        logger.info("HybridRecommender: All engines initialised")

    # ── public API ──────────────────────────────────────────────────────────

    def recommend(
        self,
        liked_ids:      list[int],
        disliked_ids:   list[int],
        cart_ids:       list[int],
        cart_freq:      dict[int, int],  # {product_id: add_count}
        view_history:   list[dict],      # [{id, ts}] newest first
        limit:          int = 16,
    ) -> list[dict]:
        """Main recommendation endpoint."""
        now_ms = _now_ms()
        disliked_set = set(disliked_ids)

        # ── Behavioral scoring ─────────────────────────────────────────────
        behav: dict[int, float] = {}

        def bump(pid, val):
            behav[pid] = behav.get(pid, 0.0) + val

        for pid in liked_ids:
            bump(pid, self.SIG["like"])

        for pid in cart_ids:
            freq_bonus = cart_freq.get(pid, 1)
            bump(pid, self.SIG["cart"] * freq_bonus)

        for i, entry in enumerate(view_history[:30]):
            pid = entry["id"]
            ts  = entry.get("ts", now_ms)
            decay = math.exp(-i * 0.08)               # exponential decay by recency rank
            time_decay = math.exp(-(now_ms - ts) / (1000 * 3600 * 6))  # 6-hour half-life
            bump(pid, self.SIG["view"] * decay * time_decay)

        for pid in disliked_ids:
            bump(pid, self.SIG["dislike"])

        # ── Content scoring ────────────────────────────────────────────────
        viewed_ids = [e["id"] for e in view_history[:15]]
        content_scores = self.content.score_for_user(liked_ids, viewed_ids)

        # ── Collaborative scoring ──────────────────────────────────────────
        user_vec = np.zeros(len(self.products))
        for pid, weight in behav.items():
            col = self.collab.id_to_col.get(pid, -1)
            if col >= 0:
                user_vec[col] = max(0.0, weight)
        collab_scores = self.collab.score_for_vector(user_vec)

        # ── Normalize each score dict to [0, 1] ───────────────────────────
        content_scores = _normalize(content_scores)
        collab_scores  = _normalize(collab_scores)
        behav_norm     = _normalize({k: max(0, v) for k, v in behav.items()})

        # ── Price affinity ─────────────────────────────────────────────────
        ref_prices = [
            self.id_to_product[pid]["new_price"]
            for pid in liked_ids + cart_ids
            if pid in self.id_to_product
        ]
        avg_price = sum(ref_prices) / len(ref_prices) if ref_prices else None

        # ── Blend ──────────────────────────────────────────────────────────
        W = self.WEIGHTS
        all_ids = [p["id"] for p in self.products]
        scored = []

        for pid in all_ids:
            if pid in disliked_set:
                continue
            product = self.id_to_product[pid]

            score = (
                W["content"] * content_scores.get(pid, 0.0)
                + W["collab"]  * collab_scores.get(pid, 0.0)
                + W["behav"]   * behav_norm.get(pid, 0.0)
            )

            # Price affinity bonus (up to +0.15)
            if avg_price:
                ratio = abs(product["new_price"] - avg_price) / (avg_price + 1)
                score += max(0.0, 0.15 * (1 - ratio))

            # Penalty for items already in cart (show variety)
            if cart_freq.get(pid, 0) > 0:
                score -= 0.10

            # Compute explainability
            reasons = _build_reasons(
                pid, liked_ids, cart_ids, viewed_ids,
                content_scores, collab_scores, behav_norm
            )

            # Confidence level
            confidence = _confidence(score)

            scored.append({
                **product,
                "_score":      round(score, 4),
                "_reasons":    reasons,
                "_confidence": confidence,
            })

        scored.sort(key=lambda x: x["_score"], reverse=True)

        # Cold-start: no signals → sort by discount %
        has_signals = liked_ids or cart_ids or view_history
        if not has_signals:
            scored = sorted(
                [{"id": p["id"], **p, "_score": (p["old_price"] - p["new_price"]) / p["old_price"],
                  "_reasons": ["Curated top picks"], "_confidence": "Popular"}
                 for p in self.products if p["id"] not in disliked_set],
                key=lambda x: x["_score"], reverse=True
            )

        return scored[:limit]

    def similar_to(self, product_id: int, n: int = 6) -> dict:
        """KNN-based 'Because You Viewed' endpoint."""
        trigger = self.id_to_product.get(product_id)
        if not trigger:
            return {"trigger": None, "related": []}

        neighbors = self.knn.get_neighbors(product_id, n=n)
        related_products = [
            {**self.id_to_product[nb["id"]], "_similarity": nb["similarity"]}
            for nb in neighbors
            if nb["id"] in self.id_to_product
        ]
        return {"trigger": trigger, "related": related_products}

    def trending(
        self,
        global_interactions: list[dict],
        limit: int = 6,
    ) -> list[dict]:
        """
        Compute trending score from global interaction events.
        Falls back to discount-based popularity if no events.
        """
        freq: dict[int, float] = {}

        weights = {"like": 2.5, "cart": 2.0, "view": 0.5, "dislike": -1.0}
        now_ms = _now_ms()

        for ev in global_interactions:
            pid = ev.get("productId")
            if not pid:
                continue
            w = weights.get(ev.get("event", "view"), 0.5)
            ts = ev.get("ts", now_ms)
            hours_ago = (now_ms - ts) / (1000 * 3600)
            time_decay = math.exp(-hours_ago / 24)  # 24-hour half-life
            freq[pid] = freq.get(pid, 0.0) + w * time_decay

        if not freq:
            # Cold-start: discount-based popularity
            return sorted(
                self.products,
                key=lambda p: (p["old_price"] - p["new_price"]) / p["old_price"],
                reverse=True,
            )[:limit]

        result = []
        for p in self.products:
            result.append({**p, "_trend_score": round(freq.get(p["id"], 0.0), 4)})
        result.sort(key=lambda x: x["_trend_score"], reverse=True)
        return result[:limit]

    def refit_collaborative(self, interactions: list[dict]):
        """Re-train collaborative engine with real user data."""
        self.collab.fit_user_interactions(interactions)


# ─────────────────────────────────────────────────────────────────────────────
# Utilities
# ─────────────────────────────────────────────────────────────────────────────

def _now_ms() -> int:
    import time
    return int(time.time() * 1000)


def _normalize(scores: dict[int, float]) -> dict[int, float]:
    """Min-max normalize to [0, 1]."""
    if not scores:
        return {}
    vals = list(scores.values())
    mn, mx = min(vals), max(vals)
    if mx == mn:
        return {k: 0.5 for k in scores}
    return {k: (v - mn) / (mx - mn) for k, v in scores.items()}


def _confidence(score: float) -> str:
    if score >= 0.70:
        return "High"
    if score >= 0.40:
        return "Medium"
    return "Exploring"


def _build_reasons(
    pid: int,
    liked_ids: list[int],
    cart_ids: list[int],
    viewed_ids: list[int],
    content_scores: dict[int, float],
    collab_scores: dict[int, float],
    behav_scores: dict[int, float],
) -> list[str]:
    reasons = []
    if pid in liked_ids:
        reasons.append("You liked this")
    elif pid in cart_ids:
        reasons.append("You added this to cart")
    elif pid in viewed_ids:
        reasons.append("You recently viewed this")
    if content_scores.get(pid, 0) > 0.5:
        reasons.append("Similar to items you love")
    if collab_scores.get(pid, 0) > 0.5:
        reasons.append("Shoppers like you chose this")
    if behav_scores.get(pid, 0) > 0.5:
        reasons.append("Matches your browsing pattern")
    return reasons or ["Handpicked for you"]
