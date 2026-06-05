import React, { createContext, useState, useCallback } from 'react';
import all_products from '../Components/Assets/all_products';

export const ShopContext = createContext(null);

// ─── Helpers ────────────────────────────────────────────────────────────────
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

// ─── Provider ────────────────────────────────────────────────────────────────
const ShopContextProvider = (props) => {
    const [CartItems, setCartItems] = useState(getDefaultCart());

    // { id, timestamp } — most recent first, max 30
    const [viewHistory, setViewHistory] = useState(() => safeJSON('as_viewHistory', []));

    // { [productId]: count } — how many times added to cart
    const [cartFrequency, setCartFrequency] = useState(() => safeJSON('as_cartFreq', {}));

    // Set of product ids the user explicitly liked / disliked
    const [liked, setLiked]     = useState(() => new Set(safeJSON('as_liked', [])));
    const [disliked, setDisliked] = useState(() => new Set(safeJSON('as_disliked', [])));

    // ── Cart ──────────────────────────────────────────────────────────────────
    const addToCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
        // Boost cart frequency for recommendations
        setCartFrequency((prev) => {
            const updated = { ...prev, [itemId]: (prev[itemId] || 0) + 1 };
            persist('as_cartFreq', updated);
            return updated;
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: Math.max(0, (prev[itemId] || 0) - 1),
        }));
    };

    const getTotalCartAmount = () => {
        let total = 0;
        for (const id in CartItems) {
            if (CartItems[id] > 0) {
                const p = all_products.find((p) => p.id === Number(id));
                if (p) total += CartItems[id] * p.new_price;
            }
        }
        return total;
    };

    const getTotalCartItems = () =>
        Object.values(CartItems).reduce((sum, qty) => sum + (qty > 0 ? qty : 0), 0);

    // ── View tracking ─────────────────────────────────────────────────────────
    const recordView = useCallback((productId) => {
        setViewHistory((prev) => {
            const filtered = prev.filter((e) => e.id !== productId);
            const updated = [{ id: productId, ts: Date.now() }, ...filtered].slice(0, 30);
            persist('as_viewHistory', updated);
            return updated;
        });
    }, []);

    // ── Like / Dislike ────────────────────────────────────────────────────────
    const toggleLike = (productId) => {
        setLiked((prev) => {
            const next = new Set(prev);
            if (next.has(productId)) { next.delete(productId); }
            else {
                next.add(productId);
                // Remove from disliked if present
                setDisliked((d) => { const nd = new Set(d); nd.delete(productId); persist('as_disliked', [...nd]); return nd; });
            }
            persist('as_liked', [...next]);
            return next;
        });
    };

    const toggleDislike = (productId) => {
        setDisliked((prev) => {
            const next = new Set(prev);
            if (next.has(productId)) { next.delete(productId); }
            else {
                next.add(productId);
                setLiked((l) => { const nl = new Set(l); nl.delete(productId); persist('as_liked', [...nl]); return nl; });
            }
            persist('as_disliked', [...next]);
            return next;
        });
    };

    // ── Core Scoring Engine ───────────────────────────────────────────────────
    /**
     * Multi-signal scoring per product:
     *   +3.0  per explicit Like
     *   -5.0  per explicit Dislike  (strong suppression)
     *   +2.5  per cart-add (scaled by cartFrequency count)
     *   +1.5  for most-recently viewed (decays by recency)
     *   +1.0  per category match with liked/carted/viewed items
     *   +0.3  price affinity: products close to average spend get boosted
     *   Disliked items are fully excluded
     */
    const getRecommendations = useCallback((limit = 8) => {
        const cartIds = Object.keys(CartItems).filter((id) => CartItems[id] > 0).map(Number);
        const dislikedIds = [...disliked];
        const likedIds    = [...liked];
        const viewedIds   = viewHistory.map((e) => e.id);
        const now = Date.now();

        // --- Category weight map ---
        const catScore = {};
        const bump = (cat, val) => { if (cat) catScore[cat] = (catScore[cat] || 0) + val; };

        likedIds.forEach((id) => { const p = all_products.find((x) => x.id === id); if (p) bump(p.category, 2.0); });
        cartIds.forEach((id) => { const p = all_products.find((x) => x.id === id); if (p) bump(p.category, 1.5 * (cartFrequency[id] || 1)); });
        viewHistory.forEach(({ id, ts }, i) => {
            const p = all_products.find((x) => x.id === id);
            if (!p) return;
            // Decay: most recent = 1.0, older = less
            const decayFactor = Math.max(0.1, 1 - i * 0.04);
            bump(p.category, 1.0 * decayFactor);
        });

        // --- Average spend for price affinity ---
        const prices = [...likedIds, ...cartIds]
            .map((id) => all_products.find((p) => p.id === id)?.new_price)
            .filter(Boolean);
        const avgSpend = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : null;

        // --- Score every product ---
        const scored = all_products
            .filter((p) => !dislikedIds.includes(p.id))  // exclude disliked
            .map((p) => {
                let score = catScore[p.category] || 0;

                // Explicit signals
                if (liked.has(p.id))    score += 3.0;
                if (cartFrequency[p.id]) score += 2.5 * cartFrequency[p.id];

                // Recency bonus for viewed items
                const viewEntry = viewHistory.find((e) => e.id === p.id);
                if (viewEntry) {
                    const minsAgo = (now - viewEntry.ts) / 60000;
                    score += Math.max(0, 1.5 - minsAgo * 0.01); // fades over ~150 mins
                }

                // Price affinity bonus
                if (avgSpend) {
                    const ratio = Math.abs(p.new_price - avgSpend) / avgSpend;
                    score += Math.max(0, 0.5 - ratio);
                }

                // Slight penalty for items already in cart (show variety instead)
                if (CartItems[p.id] > 0) score -= 1.0;

                return { ...p, _score: score };
            })
            .sort((a, b) => b._score - a._score);

        // If no user history at all, return products sorted by discount %
        if (viewHistory.length === 0 && likedIds.length === 0 && cartIds.length === 0) {
            return all_products
                .slice()
                .sort((a, b) => (b.old_price - b.new_price) / b.old_price - (a.old_price - a.new_price) / a.old_price)
                .slice(0, limit);
        }

        return scored.slice(0, limit);
    }, [CartItems, viewHistory, liked, disliked, cartFrequency]);

    // ── "Because You Viewed X" ────────────────────────────────────────────────
    const getBecauseYouViewed = useCallback(() => {
        if (viewHistory.length === 0) return [];
        const triggerEntry = viewHistory[0]; // most recent view
        const trigger = all_products.find((p) => p.id === triggerEntry.id);
        if (!trigger) return [];
        const related = all_products
            .filter((p) => p.category === trigger.category && p.id !== trigger.id)
            .slice(0, 6);
        return { trigger, related };
    }, [viewHistory]);

    // ── Trending Now (simulated from cart+like frequency) ────────────────────
    const getTrending = useCallback(() => {
        const freq = { ...cartFrequency };
        [...liked].forEach((id) => { freq[id] = (freq[id] || 0) + 2; });
        viewHistory.forEach(({ id }, i) => { freq[id] = (freq[id] || 0) + Math.max(0, 5 - i); });
        return all_products
            .map((p) => ({ ...p, _trend: freq[p.id] || 0 }))
            .sort((a, b) => b._trend - a._trend)
            .slice(0, 6);
    }, [cartFrequency, liked, viewHistory]);

    // ── Preference Profile ────────────────────────────────────────────────────
    const getPreferenceProfile = useCallback(() => {
        const cats = {};
        viewHistory.forEach(({ id }, i) => {
            const p = all_products.find((x) => x.id === id);
            if (p?.category) cats[p.category] = (cats[p.category] || 0) + Math.max(1, 10 - i);
        });
        [...liked].forEach((id) => {
            const p = all_products.find((x) => x.id === id);
            if (p?.category) cats[p.category] = (cats[p.category] || 0) + 15;
        });
        Object.keys(CartItems).filter((id) => CartItems[id] > 0).forEach((id) => {
            const p = all_products.find((x) => x.id === Number(id));
            if (p?.category) cats[p.category] = (cats[p.category] || 0) + 20;
        });

        const total = Object.values(cats).reduce((a, b) => a + b, 0) || 1;
        return Object.entries(cats)
            .map(([cat, score]) => ({ category: cat, score, percent: Math.round((score / total) * 100) }))
            .sort((a, b) => b.score - a.score);
    }, [viewHistory, liked, CartItems]);

    // ── Personalization maturity score (0-100) ────────────────────────────────
    const getPersonalizationScore = useCallback(() => {
        const signals =
            Math.min(viewHistory.length, 15) * 3 +   // max 45
            Math.min([...liked].length, 5) * 5 +      // max 25
            Math.min(Object.keys(cartFrequency).length, 6) * 5; // max 30
        return Math.min(100, signals);
    }, [viewHistory, liked, cartFrequency]);

    // ── Clear profile ─────────────────────────────────────────────────────────
    const clearProfile = () => {
        setViewHistory([]);    persist('as_viewHistory', []);
        setCartFrequency({});  persist('as_cartFreq', {});
        setLiked(new Set());   persist('as_liked', []);
        setDisliked(new Set()); persist('as_disliked', []);
    };

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
        // Recommendation API
        getRecommendations,
        getBecauseYouViewed,
        getTrending,
        getPreferenceProfile,
        getPersonalizationScore,
        clearProfile,
        cartFrequency,
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;