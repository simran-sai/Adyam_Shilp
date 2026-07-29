"""
test_recommender.py
Unit tests for the Adyam Shilp ML recommendation engines.
Run: pytest ml-service/test_recommender.py -v
"""

import pytest
import sys
import os

# Allow running from project root
sys.path.insert(0, os.path.dirname(__file__))

from recommender import (
    ContentEngine,
    CollaborativeEngine,
    KNNEngine,
    HybridRecommender,
    CATALOGUE,
    _normalize,
    _confidence,
    _build_reasons,
)

# ─────────────────────────────────────────────────────────────────────────────
# Fixtures
# ─────────────────────────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def catalogue():
    return CATALOGUE

@pytest.fixture(scope="module")
def content_engine(catalogue):
    return ContentEngine(catalogue)

@pytest.fixture(scope="module")
def collab_engine(catalogue):
    return CollaborativeEngine(catalogue)

@pytest.fixture(scope="module")
def knn_engine(catalogue):
    return KNNEngine(catalogue)

@pytest.fixture(scope="module")
def hybrid(catalogue):
    return HybridRecommender(catalogue)


# ─────────────────────────────────────────────────────────────────────────────
# ContentEngine Tests
# ─────────────────────────────────────────────────────────────────────────────

class TestContentEngine:
    def test_init(self, content_engine):
        assert content_engine.sim_matrix is not None
        n = len(CATALOGUE)
        assert content_engine.sim_matrix.shape == (n, n)

    def test_similar_to_known_product(self, content_engine):
        # Product 1 (God Idols) should return God Idol neighbors
        results = content_engine.similar_to(1, n=5)
        assert len(results) > 0
        assert all(len(r) == 2 for r in results)  # (id, score)
        ids = [r[0] for r in results]
        assert 1 not in ids  # self not returned

    def test_similar_to_unknown_product(self, content_engine):
        results = content_engine.similar_to(9999)
        assert results == []

    def test_score_for_user_liked(self, content_engine):
        scores = content_engine.score_for_user(liked_ids=[1], viewed_ids=[])
        assert isinstance(scores, dict)
        assert len(scores) > 0

    def test_score_for_user_no_signals(self, content_engine):
        scores = content_engine.score_for_user(liked_ids=[], viewed_ids=[])
        assert scores == {}

    def test_similar_category_bias(self, content_engine):
        """God Idols (id=1) should have high similarity with other God Idols."""
        god_idol_ids = {p["id"] for p in CATALOGUE if p["category"] == "God Idols"}
        results = content_engine.similar_to(1, n=10)
        top3_ids = {r[0] for r in results[:3]}
        # At least 1 of top 3 should be a God Idol
        assert len(top3_ids & god_idol_ids) >= 1


# ─────────────────────────────────────────────────────────────────────────────
# CollaborativeEngine Tests
# ─────────────────────────────────────────────────────────────────────────────

class TestCollaborativeEngine:
    def test_init(self, collab_engine):
        assert collab_engine.item_factors is not None
        assert collab_engine.item_factors.shape[0] == len(CATALOGUE)

    def test_score_for_vector_zeros(self, collab_engine):
        import numpy as np
        vec = np.zeros(len(CATALOGUE))
        scores = collab_engine.score_for_vector(vec)
        assert isinstance(scores, dict)

    def test_score_for_vector_signal(self, collab_engine):
        import numpy as np
        vec = np.zeros(len(CATALOGUE))
        vec[0] = 1.0   # boost first product
        scores = collab_engine.score_for_vector(vec)
        assert isinstance(scores, dict)
        assert len(scores) > 0

    def test_refit_with_interactions(self, collab_engine):
        interactions = [
            {"userId": "u1", "productId": 1, "event": "like", "weight": 3.0},
            {"userId": "u1", "productId": 24, "event": "view", "weight": 1.0},
            {"userId": "u2", "productId": 4, "event": "cart", "weight": 2.5},
        ]
        collab_engine.fit_user_interactions(interactions)
        assert collab_engine.item_factors is not None

    def test_refit_empty(self, collab_engine):
        """Empty interactions should not crash."""
        collab_engine.fit_user_interactions([])


# ─────────────────────────────────────────────────────────────────────────────
# KNNEngine Tests
# ─────────────────────────────────────────────────────────────────────────────

class TestKNNEngine:
    def test_init(self, knn_engine):
        assert knn_engine.knn is not None

    def test_neighbors_known(self, knn_engine):
        neighbors = knn_engine.get_neighbors(1, n=5)
        assert len(neighbors) > 0
        for nb in neighbors:
            assert "id" in nb
            assert "similarity" in nb
            assert 0.0 <= nb["similarity"] <= 1.0
            assert nb["id"] != 1

    def test_neighbors_unknown(self, knn_engine):
        neighbors = knn_engine.get_neighbors(9999)
        assert neighbors == []

    def test_no_self_in_neighbors(self, knn_engine):
        for product in CATALOGUE[:5]:
            neighbors = knn_engine.get_neighbors(product["id"], n=10)
            ids = [nb["id"] for nb in neighbors]
            assert product["id"] not in ids


# ─────────────────────────────────────────────────────────────────────────────
# HybridRecommender Tests
# ─────────────────────────────────────────────────────────────────────────────

class TestHybridRecommender:
    def test_init(self, hybrid):
        assert hybrid.content is not None
        assert hybrid.collab is not None
        assert hybrid.knn is not None

    def test_recommend_cold_start(self, hybrid):
        """Cold-start: no signals → returns popularity-based list."""
        results = hybrid.recommend(
            liked_ids=[], disliked_ids=[], cart_ids=[],
            cart_freq={}, view_history=[], limit=8
        )
        assert len(results) <= 8
        assert all("id" in r for r in results)

    def test_recommend_with_likes(self, hybrid):
        results = hybrid.recommend(
            liked_ids=[1, 24],   # God Idols
            disliked_ids=[], cart_ids=[], cart_freq={},
            view_history=[], limit=10
        )
        assert len(results) > 0
        for r in results:
            assert "_score" in r
            assert "_reasons" in r
            assert "_confidence" in r

    def test_disliked_excluded(self, hybrid):
        results = hybrid.recommend(
            liked_ids=[], disliked_ids=[1, 2, 3, 4, 5],
            cart_ids=[], cart_freq={}, view_history=[], limit=50
        )
        result_ids = {r["id"] for r in results}
        assert 1 not in result_ids
        assert 2 not in result_ids

    def test_recommend_limit(self, hybrid):
        for limit in [1, 5, 16, 33]:
            results = hybrid.recommend(
                liked_ids=[1], disliked_ids=[], cart_ids=[],
                cart_freq={}, view_history=[], limit=limit
            )
            assert len(results) <= limit

    def test_recommend_with_view_history(self, hybrid):
        import time
        view_history = [
            {"id": 11, "ts": int(time.time() * 1000) - 60000},
            {"id": 12, "ts": int(time.time() * 1000) - 120000},
        ]
        results = hybrid.recommend(
            liked_ids=[], disliked_ids=[], cart_ids=[],
            cart_freq={}, view_history=view_history, limit=8
        )
        assert len(results) > 0

    def test_similar_to_known(self, hybrid):
        result = hybrid.similar_to(1, n=5)
        assert result["trigger"]["id"] == 1
        assert len(result["related"]) > 0
        for r in result["related"]:
            assert "_similarity" in r

    def test_similar_to_unknown(self, hybrid):
        result = hybrid.similar_to(9999)
        assert result["trigger"] is None
        assert result["related"] == []

    def test_trending_cold_start(self, hybrid):
        results = hybrid.trending(global_interactions=[], limit=5)
        assert len(results) <= 5

    def test_trending_with_interactions(self, hybrid):
        import time
        now = int(time.time() * 1000)
        interactions = [
            {"productId": 1,  "event": "like", "ts": now - 1000},
            {"productId": 1,  "event": "view", "ts": now - 2000},
            {"productId": 24, "event": "cart", "ts": now - 3000},
        ]
        results = hybrid.trending(global_interactions=interactions, limit=5)
        assert len(results) > 0
        # Product 1 (most interacted) should rank near top
        top_ids = [r["id"] for r in results[:3]]
        assert 1 in top_ids

    def test_reasons_populated(self, hybrid):
        results = hybrid.recommend(
            liked_ids=[1], disliked_ids=[], cart_ids=[4],
            cart_freq={4: 2}, view_history=[], limit=10
        )
        for r in results:
            assert isinstance(r["_reasons"], list)
            assert len(r["_reasons"]) > 0

    def test_confidence_levels(self, hybrid):
        results = hybrid.recommend(
            liked_ids=[1, 24, 26, 29], disliked_ids=[], cart_ids=[4],
            cart_freq={4: 2}, view_history=[], limit=10
        )
        confidence_values = {r["_confidence"] for r in results}
        assert confidence_values.issubset({"High", "Medium", "Exploring"})


# ─────────────────────────────────────────────────────────────────────────────
# Utility Tests
# ─────────────────────────────────────────────────────────────────────────────

class TestUtilities:
    def test_normalize_empty(self):
        assert _normalize({}) == {}

    def test_normalize_all_same(self):
        result = _normalize({1: 5.0, 2: 5.0, 3: 5.0})
        for v in result.values():
            assert v == 0.5

    def test_normalize_range(self):
        result = _normalize({1: 0.0, 2: 5.0, 3: 10.0})
        assert result[1] == pytest.approx(0.0)
        assert result[3] == pytest.approx(1.0)

    def test_confidence_thresholds(self):
        assert _confidence(0.80) == "High"
        assert _confidence(0.50) == "Medium"
        assert _confidence(0.20) == "Exploring"
        assert _confidence(0.0)  == "Exploring"

    def test_build_reasons_liked(self):
        reasons = _build_reasons(1, [1], [], [], {}, {}, {})
        assert "You liked this" in reasons

    def test_build_reasons_cart(self):
        reasons = _build_reasons(4, [], [4], [], {}, {}, {})
        assert "You added this to cart" in reasons

    def test_build_reasons_default(self):
        reasons = _build_reasons(99, [], [], [], {}, {}, {})
        assert "Handpicked for you" in reasons
