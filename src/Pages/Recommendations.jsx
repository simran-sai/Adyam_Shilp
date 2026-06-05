import React, { useContext } from 'react';
import { ShopContext } from '../Context/ShopContext';
import Item from '../Components/Item/Item';
import './CSS/Recommendations.css';

const Recommendations = () => {
  const { getRecommendations, viewHistory, all_products, CartItems } = useContext(ShopContext);
  const recommendations = getRecommendations();

  const cartProductIds = Object.keys(CartItems)
    .filter(id => CartItems[id] > 0)
    .map(Number);

  const recentlyViewed = viewHistory
    .slice(0, 4)
    .map(id => all_products.find(p => p.id === id))
    .filter(Boolean);

  const hasActivity = viewHistory.length > 0 || cartProductIds.length > 0;

  return (
    <div className="recommendations-page">
      {/* Hero Banner */}
      <div className="rec-hero">
        <div className="rec-hero-content">
          <div className="rec-hero-badge">✨ Personalized For You</div>
          <h1>Your Personal Showcase</h1>
          <p>
            {hasActivity
              ? "Based on your browsing and cart — handpicked items you'll love."
              : "Explore our most beloved handcrafted pieces."}
          </p>
        </div>
        <div className="rec-hero-decoration">
          <div className="rec-orb rec-orb-1"></div>
          <div className="rec-orb rec-orb-2"></div>
          <div className="rec-orb rec-orb-3"></div>
        </div>
      </div>

      {/* How It Works */}
      <div className="rec-how-it-works">
        <div className="rec-how-card">
          <span className="rec-how-icon">👁️</span>
          <h3>Browse Products</h3>
          <p>Every product you view is tracked to understand your taste</p>
        </div>
        <div className="rec-how-arrow">→</div>
        <div className="rec-how-card">
          <span className="rec-how-icon">🛒</span>
          <h3>Add to Cart</h3>
          <p>Items you add to cart strengthen your preference profile</p>
        </div>
        <div className="rec-how-arrow">→</div>
        <div className="rec-how-card rec-how-card-active">
          <span className="rec-how-icon">✨</span>
          <h3>Get Recommendations</h3>
          <p>We suggest items from your favourite categories right here</p>
        </div>
      </div>

      {/* Main Recommendations */}
      <div className="rec-section">
        <div className="rec-section-header">
          <div className="rec-section-icon">🎯</div>
          <div>
            <h2>Recommended For You</h2>
            <p className="rec-section-sub">
              {hasActivity
                ? `Curated from ${[...new Set(viewHistory.slice(0,10).map(id => all_products.find(p=>p.id===id)?.category).filter(Boolean))].join(', ') || 'your history'}`
                : 'Our top handcrafted picks'}
            </p>
          </div>
        </div>
        {recommendations.length > 0 ? (
          <div className="rec-grid">
            {recommendations.map((item, i) => (
              <div key={item.id} className="rec-item-wrapper" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="rec-rank-badge">{i + 1}</div>
                <Item
                  id={item.id}
                  name={item.name}
                  image={item.img}
                  new_price={item.new_price}
                  old_price={item.old_price}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="rec-empty">
            <div className="rec-empty-icon">🛍️</div>
            <h3>Start exploring to get personalized picks!</h3>
            <p>Browse some products and come back here.</p>
          </div>
        )}
      </div>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="rec-section rec-recently-viewed">
          <div className="rec-section-header">
            <div className="rec-section-icon">🕐</div>
            <div>
              <h2>Recently Viewed</h2>
              <p className="rec-section-sub">Your browsing history</p>
            </div>
          </div>
          <div className="rec-grid rec-grid-sm">
            {recentlyViewed.map((item, i) => (
              <div key={item.id} className="rec-item-wrapper" style={{ animationDelay: `${i * 0.1}s` }}>
                <Item
                  id={item.id}
                  name={item.name}
                  image={item.img}
                  new_price={item.new_price}
                  old_price={item.old_price}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories Quick Nav */}
      <div className="rec-categories">
        <h2>Explore by Category</h2>
        <div className="rec-cat-grid">
          <a href="/god-idols" className="rec-cat-card rec-cat-god">
            <span className="rec-cat-emoji">🙏</span>
            <h3>God Idols</h3>
            <p>Sacred handcrafted idols</p>
          </a>
          <a href="/home-decor" className="rec-cat-card rec-cat-decor">
            <span className="rec-cat-emoji">🏡</span>
            <h3>Home Decor</h3>
            <p>Beautiful home accessories</p>
          </a>
          <a href="/accessories-and-rakhi" className="rec-cat-card rec-cat-rakhi">
            <span className="rec-cat-emoji">🎀</span>
            <h3>Accessories & Rakhi</h3>
            <p>Jewellery, rakhi & more</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
