"""
main.py
FastAPI ML Microservice for Adyam Shilp Recommendation System

Endpoints:
  GET  /health                     — Health + model info
  POST /recommend                  — Hybrid ML recommendations
  POST /similar                    — KNN item-item similarity
  POST /trending                   — Trending products
  POST /refit                      — Re-train collaborative engine with real events
"""

import os
import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from recommender import HybridRecommender

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s — %(message)s")
logger = logging.getLogger("adyam-ml")

# ── Global recommender instance (initialised at startup) ──────────────────────
recommender: Optional[HybridRecommender] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Build ML models at startup."""
    global recommender
    logger.info("⚙️  Building ML recommendation engines …")
    recommender = HybridRecommender()
    logger.info("✅  ML engines ready")
    yield
    logger.info("🛑  ML service shutting down")


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Adyam Shilp ML Recommendation Service",
    description=(
        "Hybrid recommendation engine using TF-IDF (content-based), "
        "SVD matrix factorization (collaborative), and KNN (item-item similarity)."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # tightened via env in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# Request / Response Models
# ─────────────────────────────────────────────────────────────────────────────

class ViewEntry(BaseModel):
    id: int
    ts: Optional[int] = None   # Unix ms timestamp


class RecommendRequest(BaseModel):
    liked_ids:    list[int]         = Field(default_factory=list)
    disliked_ids: list[int]         = Field(default_factory=list)
    cart_ids:     list[int]         = Field(default_factory=list)
    cart_freq:    dict[str, int]    = Field(default_factory=dict)  # {str(id): count}
    view_history: list[ViewEntry]   = Field(default_factory=list)
    limit:        int               = Field(default=16, ge=1, le=50)


class SimilarRequest(BaseModel):
    product_id: int
    n:          int = Field(default=6, ge=1, le=20)


class TrendingRequest(BaseModel):
    interactions: list[dict] = Field(default_factory=list)
    limit:        int        = Field(default=6, ge=1, le=20)


class RefitRequest(BaseModel):
    interactions: list[dict]   # [{userId, productId, event, weight, ts}]


# ─────────────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "Adyam Shilp ML Recommender",
        "engines": {
            "content": "TF-IDF + Cosine Similarity",
            "collaborative": "TruncatedSVD Matrix Factorization",
            "knn": "K-Nearest Neighbors (item-item)",
            "hybrid_weights": HybridRecommender.WEIGHTS,
        },
        "catalogue_size": len(recommender.products) if recommender else 0,
    }


@app.post("/recommend")
async def recommend(req: RecommendRequest):
    if not recommender:
        raise HTTPException(503, "ML engines not ready")
    try:
        # Convert string keys in cart_freq to int
        cart_freq = {int(k): v for k, v in req.cart_freq.items()}
        view_history = [{"id": e.id, "ts": e.ts} for e in req.view_history]

        results = recommender.recommend(
            liked_ids    = req.liked_ids,
            disliked_ids = req.disliked_ids,
            cart_ids     = req.cart_ids,
            cart_freq    = cart_freq,
            view_history = view_history,
            limit        = req.limit,
        )
        return {
            "success": True,
            "count": len(results),
            "recommendations": results,
            "model": "hybrid-tfidf-svd-knn",
        }
    except Exception as e:
        logger.error("recommend error: %s", e, exc_info=True)
        raise HTTPException(500, str(e))


@app.post("/similar")
async def similar(req: SimilarRequest):
    if not recommender:
        raise HTTPException(503, "ML engines not ready")
    try:
        result = recommender.similar_to(req.product_id, n=req.n)
        return {"success": True, **result, "model": "knn-cosine"}
    except Exception as e:
        logger.error("similar error: %s", e, exc_info=True)
        raise HTTPException(500, str(e))


@app.post("/trending")
async def trending(req: TrendingRequest):
    if not recommender:
        raise HTTPException(503, "ML engines not ready")
    try:
        results = recommender.trending(
            global_interactions=req.interactions,
            limit=req.limit,
        )
        return {
            "success": True,
            "count": len(results),
            "trending": results,
            "model": "decay-weighted-frequency",
        }
    except Exception as e:
        logger.error("trending error: %s", e, exc_info=True)
        raise HTTPException(500, str(e))


@app.post("/refit")
async def refit(req: RefitRequest):
    """Re-train collaborative engine with real user interaction events."""
    if not recommender:
        raise HTTPException(503, "ML engines not ready")
    try:
        recommender.refit_collaborative(req.interactions)
        return {"success": True, "message": "Collaborative engine refitted"}
    except Exception as e:
        logger.error("refit error: %s", e, exc_info=True)
        raise HTTPException(500, str(e))


# ─────────────────────────────────────────────────────────────────────────────
# Entrypoint
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("ML_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
