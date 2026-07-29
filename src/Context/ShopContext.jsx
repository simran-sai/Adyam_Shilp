import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import all_products from '../Components/Assets/all_products';

export const ShopContext = createContext(null);

// ─── Config ──────────────────────────────────────────────────────────────────
const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const safeJSON = (key, fallback) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
};
const persist = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};
const getDefaultCart = () => {
    let cart = {};
    for (let idx = 0; idx < all_products.length + 1; idx++) cart[idx] = 0;
    return cart;
};

// ─── ML API helpers ──────────────────────────────────────────────────────────
const postML = async (endpoint, body, token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['auth-token'] = token;
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`${endpoint} → ${res.status}`);
    return res.json();
};

// ─── Heuristic fallback (original engine) ────────────────────────────────────
const heuristicRecommend = ({ all_products, CartItems, viewHistory, liked, disliked, cartFrequency }, limit = 16) => {
    const cartIds = Object.keys(CartItems).filter(id => CartItems[id] > 0).map(Number);
    const dislikedIds = [...disliked];
    const likedIds = [...liked];
    const now = Date.now();
    const catScore = {};
    const bump = (cat, val) => { if (cat) catScore[cat] = (catScore[cat] || 0) + val; };

    likedIds.forEach(id => { const p = all_products.find(x => x.id === id); if (p) bump(p.category, 2.0); });
    cartIds.forEach(id => { const p = all_products.find(x => x.id === id); if (p) bump(p.category, 1.5 * (cartFrequency[id] || 1)); });
    viewHistory.forEach(({ id, ts }, i) => {
        const p = all_products.find(x => x.id === id);
        if (!p) return;
        bump(p.category, 1.0 * Math.max(0.1, 1 - i * 0.04));
    });

    const prices = [...likedIds, ...cartIds].map(id => all_products.find(p => p.id === id)?.new_price).filter(Boolean);
    const avgSpend = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : null;

    if (viewHistory.length === 0 && likedIds.length === 0 && cartIds.length === 0) {
        return all_products.slice().sort((a, b) =>
            (b.old_price - b.new_price) / b.old_price - (a.old_price - a.new_price) / a.old_price
        ).slice(0, limit).map(p => ({ ...p, _score: 0, _reasons: ['Curated top picks'], _confidence: 'Popular', _source: 'heuristic' }));
    }

    return all_products
        .filter(p => !dislikedIds.includes(p.id))
        .map(p => {
            let score = catScore[p.category] || 0;
            if (liked.has(p.id)) score += 3.0;
            if (cartFrequency[p.id]) score += 2.5 * cartFrequency[p.id];
            const viewEntry = viewHistory.find(e => e.id === p.id);
            if (viewEntry) {
                const minsAgo = (now - viewEntry.ts) / 60000;
                score += Math.max(0, 1.5 - minsAgo * 0.01);
            }
            if (avgSpend) {
                const ratio = Math.abs(p.new_price - avgSpend) / avgSpend;
                score += Math.max(0, 0.5 - ratio);
            }
            if (CartItems[p.id] > 0) score -= 1.0;
            return { ...p, _score: score, _reasons: ['Based on your activity'], _confidence: 'Medium', _source: 'heuristic' };
        })
        .sort((a, b) => b._score - a._score)
        .slice(0, limit);
};

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────
const ShopContextProvider = (props) => {
    const [CartItems, setCartItems]         = useState(getDefaultCart);
    const [viewHistory, setViewHistory]     = useState(() => safeJSON('as_viewHistory', []));
    const [cartFrequency, setCartFrequency] = useState(() => safeJSON('as_cartFreq', {}));
    const [liked, setLiked]                 = useState(() => new Set(safeJSON('as_liked', [])));
    const [disliked, setDisliked]           = useState(() => new Set(safeJSON('as_disliked', [])));

    // ── ML state ─────────────────────────────────────────────────────────────
    const [mlRecommendations, setMlRecommendations] = useState([]);
    const [mlSimilar, setMlSimilar]                 = useState({ trigger: null, related: [] });
    const [mlTrending, setMlTrending]               = useState([]);
    const [mlLoading, setMlLoading]                 = useState(false);
    const [mlError, setMlError]                     = useState(null);
    const [mlOnline, setMlOnline]                   = useState(true);  // optimistic
    const [mlModel, setMlModel]                     = useState('heuristic');

    // debounce timer for ML calls
    const mlTimer = useRef(null);

    // ── Cart ──────────────────────────────────────────────────────────────────
    const addToCart = (itemId) => {
        setCartItems(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
        setCartFrequency(prev => {
            const updated = { ...prev, [itemId]: (prev[itemId] || 0) + 1 };
            persist('as_cartFreq', updated);
            return updated;
        });
        // Fire-and-forget interaction event to backend
        recordInteraction(itemId, 'cart', 2.5);
    };

    const removeFromCart = (itemId) => {
        setCartItems(prev => ({ ...prev, [itemId]: Math.max(0, (prev[itemId] || 0) - 1) }));
    };

    const getTotalCartAmount = () => {
        let total = 0;
        for (const id in CartItems) {
            if (CartItems[id] > 0) {
                const p = all_products.find(p => p.id === Number(id));
                if (p) total += CartItems[id] * p.new_price;
            }
        }
        return total;
    };

    const getTotalCartItems = () =>
        Object.values(CartItems).reduce((sum, qty) => sum + (qty > 0 ? qty : 0), 0);

    // ── View tracking ─────────────────────────────────────────────────────────
    const recordView = useCallback((productId) => {
        setViewHistory(prev => {
            const filtered = prev.filter(e => e.id !== productId);
            const updated = [{ id: productId, ts: Date.now() }, ...filtered].slice(0, 30);
            persist('as_viewHistory', updated);
            return updated;
        });
        recordInteraction(productId, 'view', 1.0);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Like / Dislike ────────────────────────────────────────────────────────
    const toggleLike = (productId) => {
        setLiked(prev => {
            const next = new Set(prev);
            if (next.has(productId)) {
                next.delete(productId);
            } else {
                next.add(productId);
                setDisliked(d => { const nd = new Set(d); nd.delete(productId); persist('as_disliked', [...nd]); return nd; });
                recordInteraction(productId, 'like', 3.0);
            }
            persist('as_liked', [...next]);
            return next;
        });
    };

    const toggleDislike = (productId) => {
        setDisliked(prev => {
            const next = new Set(prev);
            if (next.has(productId)) {
                next.delete(productId);
            } else {
                next.add(productId);
                setLiked(l => { const nl = new Set(l); nl.delete(productId); persist('as_liked', [...nl]); return nl; });
                recordInteraction(productId, 'dislike', -1.0);
            }
            persist('as_disliked', [...next]);
            return next;
        });
    };

    // ── Record interaction to backend (fire-and-forget) ───────────────────────
    const recordInteraction = useCallback(async (productId, event, weight) => {
        try {
            const token = localStorage.getItem('auth-token');
            await postML('/api/interactions', { productId, event, weight }, token);
        } catch {
            // Silently ignore — non-critical
        }
    }, []);

    // ── ML API calls ──────────────────────────────────────────────────────────
    const fetchMLRecommendations = useCallback(async (
        _liked, _disliked, _cart, _cartFreq, _viewHistory, limit = 16
    ) => {
        setMlLoading(true);
        setMlError(null);
        const token = localStorage.getItem('auth-token');
        try {
            const body = {
                liked_ids:    [..._liked],
                disliked_ids: [..._disliked],
                cart_ids:     Object.keys(_cart).filter(id => _cart[id] > 0).map(Number),
                cart_freq:    Object.fromEntries(Object.entries(_cartFreq).map(([k, v]) => [k, v])),
                view_history: _viewHistory.slice(0, 30),
                limit,
            };
            const data = await postML('/api/recommend', body, token);
            if (data.success && data.recommendations) {
                // Merge images from local catalogue (ML service doesn't have S3 URLs)
                const merged = data.recommendations.map(r => {
                    const local = all_products.find(p => p.id === r.id);
                    return { ...r, img: local?.img || r.img, _source: 'ml' };
                });
                setMlRecommendations(merged);
                setMlModel(data.model || 'hybrid');
                setMlOnline(true);
            } else {
                throw new Error(data.error || 'Empty ML response');
            }
        } catch (err) {
            // Fallback to heuristic engine
            setMlOnline(false);
            setMlError('ML service offline — showing curated picks');
            const fallback = heuristicRecommend({
                all_products, CartItems: _cart, viewHistory: _viewHistory,
                liked: _liked, disliked: _disliked, cartFrequency: _cartFreq
            }, limit);
            setMlRecommendations(fallback);
            setMlModel('heuristic');
        } finally {
            setMlLoading(false);
        }
    }, []);

    const fetchMLSimilar = useCallback(async (productId) => {
        if (!productId) return;
        try {
            const data = await postML('/api/similar', { product_id: productId, n: 6 });
            if (data.success) {
                const merged = {
                    trigger: data.trigger,
                    related: (data.related || []).map(r => {
                        const local = all_products.find(p => p.id === r.id);
                        return { ...r, img: local?.img || r.img };
                    }),
                };
                setMlSimilar(merged);
            }
        } catch {
            // Heuristic fallback for "Because You Viewed"
            if (viewHistory.length === 0) return;
            const trigger = all_products.find(p => p.id === viewHistory[0]?.id);
            if (!trigger) return;
            const related = all_products.filter(p => p.category === trigger.category && p.id !== trigger.id).slice(0, 6);
            setMlSimilar({ trigger, related });
        }
    }, [viewHistory]);

    const fetchMLTrending = useCallback(async () => {
        try {
            const data = await postML('/api/trending', { limit: 6 });
            if (data.success && data.trending) {
                const merged = data.trending.map(r => {
                    const local = all_products.find(p => p.id === r.id);
                    return { ...r, img: local?.img || r.img };
                });
                setMlTrending(merged);
            }
        } catch {
            // Heuristic trending fallback
            const freq = { ...cartFrequency };
            [...liked].forEach(id => { freq[id] = (freq[id] || 0) + 2; });
            viewHistory.forEach(({ id }, i) => { freq[id] = (freq[id] || 0) + Math.max(0, 5 - i); });
            const trending = all_products
                .map(p => ({ ...p, _trend_score: freq[p.id] || 0 }))
                .sort((a, b) => b._trend_score - a._trend_score)
                .slice(0, 6);
            setMlTrending(trending);
        }
    }, [cartFrequency, liked, viewHistory]);

    // ── Debounced ML refresh (triggers 800ms after any state change) ──────────
    const triggerMLRefresh = useCallback(() => {
        clearTimeout(mlTimer.current);
        mlTimer.current = setTimeout(() => {
            fetchMLRecommendations(liked, disliked, CartItems, cartFrequency, viewHistory);
            fetchMLTrending();
        }, 800);
    }, [liked, disliked, CartItems, cartFrequency, viewHistory, fetchMLRecommendations, fetchMLTrending]);

    useEffect(() => {
        triggerMLRefresh();
        return () => clearTimeout(mlTimer.current);
    }, [triggerMLRefresh]);

    // Fetch "Because You Viewed" when viewHistory changes
    useEffect(() => {
        if (viewHistory.length > 0) {
            fetchMLSimilar(viewHistory[0]?.id);
        }
    }, [viewHistory, fetchMLSimilar]);

    // ── Legacy sync wrappers (for backward-compat with other components) ──────
    const getRecommendations = useCallback((limit = 8) => {
        if (mlRecommendations.length > 0) return mlRecommendations.slice(0, limit);
        return heuristicRecommend({ all_products, CartItems, viewHistory, liked, disliked, cartFrequency }, limit);
    }, [mlRecommendations, CartItems, viewHistory, liked, disliked, cartFrequency]);

    const getBecauseYouViewed = useCallback(() => {
        if (mlSimilar?.related?.length > 0) return mlSimilar;
        if (viewHistory.length === 0) return { trigger: null, related: [] };
        const trigger = all_products.find(p => p.id === viewHistory[0]?.id);
        if (!trigger) return { trigger: null, related: [] };
        const related = all_products.filter(p => p.category === trigger.category && p.id !== trigger.id).slice(0, 6);
        return { trigger, related };
    }, [mlSimilar, viewHistory]);

    const getTrending = useCallback(() => {
        if (mlTrending.length > 0) return mlTrending;
        const freq = { ...cartFrequency };
        [...liked].forEach(id => { freq[id] = (freq[id] || 0) + 2; });
        viewHistory.forEach(({ id }, i) => { freq[id] = (freq[id] || 0) + Math.max(0, 5 - i); });
        return all_products.map(p => ({ ...p, _trend: freq[p.id] || 0 })).sort((a, b) => b._trend - a._trend).slice(0, 6);
    }, [mlTrending, cartFrequency, liked, viewHistory]);

    // ── Preference Profile (unchanged) ────────────────────────────────────────
    const getPreferenceProfile = useCallback(() => {
        const cats = {};
        viewHistory.forEach(({ id }, i) => {
            const p = all_products.find(x => x.id === id);
            if (p?.category) cats[p.category] = (cats[p.category] || 0) + Math.max(1, 10 - i);
        });
        [...liked].forEach(id => {
            const p = all_products.find(x => x.id === id);
            if (p?.category) cats[p.category] = (cats[p.category] || 0) + 15;
        });
        Object.keys(CartItems).filter(id => CartItems[id] > 0).forEach(id => {
            const p = all_products.find(x => x.id === Number(id));
            if (p?.category) cats[p.category] = (cats[p.category] || 0) + 20;
        });
        const total = Object.values(cats).reduce((a, b) => a + b, 0) || 1;
        return Object.entries(cats)
            .map(([cat, score]) => ({ category: cat, score, percent: Math.round((score / total) * 100) }))
            .sort((a, b) => b.score - a.score);
    }, [viewHistory, liked, CartItems]);

    const getPersonalizationScore = useCallback(() => {
        const signals =
            Math.min(viewHistory.length, 15) * 3 +
            Math.min([...liked].length, 5) * 5 +
            Math.min(Object.keys(cartFrequency).length, 6) * 5;
        return Math.min(100, signals);
    }, [viewHistory, liked, cartFrequency]);

    // ── Clear profile ─────────────────────────────────────────────────────────
    const clearProfile = () => {
        setViewHistory([]);    persist('as_viewHistory', []);
        setCartFrequency({});  persist('as_cartFreq', {});
        setLiked(new Set());   persist('as_liked', []);
        setDisliked(new Set()); persist('as_disliked', []);
        setMlRecommendations([]);
        setMlSimilar({ trigger: null, related: [] });
        setMlTrending([]);
    };

    // ── Manual ML refresh (for "Refresh" button) ──────────────────────────────
    const refreshML = useCallback(() => {
        fetchMLRecommendations(liked, disliked, CartItems, cartFrequency, viewHistory);
        fetchMLTrending();
        if (viewHistory.length > 0) fetchMLSimilar(viewHistory[0]?.id);
    }, [liked, disliked, CartItems, cartFrequency, viewHistory, fetchMLRecommendations, fetchMLTrending, fetchMLSimilar]);

    // ── Context value ─────────────────────────────────────────────────────────
    const contextValue = {
        // Cart
        CartItems, addToCart, removeFromCart, getTotalCartAmount, getTotalCartItems,
        // Products
        all_products,
        // Tracking
        recordView, viewHistory,
        // Feedback
        liked, disliked, toggleLike, toggleDislike,
        // Legacy sync API (used by RelatedProducts, ProductDisplay, etc.)
        getRecommendations, getBecauseYouViewed, getTrending,
        getPreferenceProfile, getPersonalizationScore,
        clearProfile, cartFrequency,
        // ML state (used by Recommendations page)
        mlRecommendations, mlSimilar, mlTrending,
        mlLoading, mlError, mlOnline, mlModel,
        refreshML,
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;