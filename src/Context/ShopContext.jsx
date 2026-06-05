import React, { createContext, useState } from 'react';
import all_products from '../Components/Assets/all_products';

export const ShopContext = createContext(null);

const getDefaultCart = () => {
    let cart = {};
    for (let idx = 0; idx < all_products.length + 1; idx++) {
        cart[idx] = 0;
    }
    return cart;
};

const ShopContextProvider = (props) => {
    const [CartItems, setcartItems] = useState(getDefaultCart());
    const [viewHistory, setViewHistory] = useState(() => {
        try {
            const stored = localStorage.getItem('viewHistory');
            return stored ? JSON.parse(stored) : [];
        } catch { return []; }
    });

    const addToCart = (itemId) => {
        setcartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    };

    const removeFromCart = (itemId) => {
        setcartItems((prev) => ({
            ...prev,
            [itemId]: Math.max(0, prev[itemId] - 1)
        }));
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in CartItems) {
            if (CartItems[item] > 0) {
                let itemInfo = all_products.find((product) => product.id === Number(item));
                if (itemInfo) totalAmount += CartItems[item] * itemInfo.new_price;
            }
        }
        return totalAmount;
    };

    const getTotalCartItems = () => {
        let totalItems = 0;
        for (const item in CartItems) {
            if (CartItems[item] > 0) {
                totalItems += CartItems[item];
            }
        }
        return totalItems;
    };

    // Record product view for recommendations
    const recordView = (productId) => {
        setViewHistory((prev) => {
            const updated = [productId, ...prev.filter(id => id !== productId)].slice(0, 20);
            localStorage.setItem('viewHistory', JSON.stringify(updated));
            return updated;
        });
    };

    // Get recommended products based on view/cart history
    const getRecommendations = () => {
        const cartProductIds = Object.keys(CartItems)
            .filter(id => CartItems[id] > 0)
            .map(Number);

        // Get categories from viewed and carted products
        const interactedIds = [...new Set([...viewHistory.slice(0, 10), ...cartProductIds])];
        const interactedProducts = interactedIds
            .map(id => all_products.find(p => p.id === id))
            .filter(Boolean);

        // Score each product based on category overlap with history
        const categoryScores = {};
        interactedProducts.forEach(p => {
            if (p.category) {
                categoryScores[p.category] = (categoryScores[p.category] || 0) + 1;
            }
        });

        // Sort all products by score, exclude already-in-cart items
        const scored = all_products
            .filter(p => !cartProductIds.includes(p.id))
            .map(p => ({
                ...p,
                score: (categoryScores[p.category] || 0) +
                    (viewHistory.includes(p.id) ? 0.5 : 0) // boost recently viewed
            }))
            .sort((a, b) => b.score - a.score);

        // If no history at all, return popular items (by price — proxy for popularity)
        if (interactedIds.length === 0) {
            return all_products
                .slice()
                .sort((a, b) => b.new_price - a.new_price)
                .slice(0, 8);
        }

        return scored.slice(0, 8);
    };

    const contextValue = {
        getTotalCartItems,
        getTotalCartAmount,
        all_products,
        CartItems,
        addToCart,
        removeFromCart,
        recordView,
        getRecommendations,
        viewHistory,
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;