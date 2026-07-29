import React, { useContext, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import './CSS/Recommendations.css';

// ─── Confidence Badge ─────────────────────────────────────────────────────────
const ConfidenceBadge = ({ level }) => {
  const map = {
    High:      { label: 'High Match',   cls: 'badge--high'   },
    Medium:    { label: 'Good Match',   cls: 'badge--medium' },
    Exploring: { label: 'Discovering',  cls: 'badge--explore'},
    Popular:   { label: 'Top Pick',     cls: 'badge--pop'    },
  };
  const cfg = map[level] || map['Exploring'];
  return <span className={`rc-confidence-badge ${cfg.cls}`}>{cfg.label}</span>;
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="rc-card rc-card--skeleton">
    <div className="skel skel-img" />
    <div className="rc-body">
      <div className="skel skel-line skel-short" />
      <div className="skel skel-line" />
      <div className="skel skel-line skel-medium" />
      <div className="skel skel-btn" />
    </div>
  </div>
);

// ─── Why Panel (Explainability) ────────────────────────────────────────────────
const WhyPanel = ({ reasons, onClose }) => (
  <div className="why-panel" onClick={onClose}>
    <div className="why-panel-inner" onClick={e => e.stopPropagation()}>
      <div className="why-header">
        <span>🤖 Why this recommendation?</span>
        <button className="why-close" onClick={onClose}>✕</button>
      </div>
      <ul className="why-reasons">
        {reasons.map((r, i) => (
          <li key={i}><span className="why-dot" />{r}</li>
        ))}
      </ul>
      <p className="why-footer">Powered by TF-IDF · SVD · KNN Hybrid Engine</p>
    </div>
  </div>
);

// ─── Mini Product Card ────────────────────────────────────────────────────────
const RecCard = ({ item, rank, showRank = false }) => {
  const { addToCart, toggleLike, toggleDislike, liked, disliked, CartItems } = useContext(ShopContext);
  const [showWhy, setShowWhy] = useState(false);

  const isLiked    = liked.has(item.id);
  const isDisliked = disliked.has(item.id);
  const inCart     = (CartItems[item.id] || 0) > 0;
  const discount   = Math.round(((item.old_price - item.new_price) / item.old_price) * 100);
  const reasons    = item._reasons || ['Recommended for you'];
  const confidence = item._confidence || 'Medium';
  const isML       = item._source === 'ml';

  return (
    <>
      {showWhy && <WhyPanel reasons={reasons} onClose={() => setShowWhy(false)} />}
      <div className={`rc-card ${isLiked ? 'rc-card--liked' : ''} ${isDisliked ? 'rc-card--disliked' : ''}`}>
        {showRank && <div className="rc-rank">#{rank}</div>}
        {discount > 0 && <div className="rc-discount-badge">−{discount}%</div>}
        {isML && <div className="rc-ml-badge">🤖 AI</div>}

        <Link to={`/product/${item.id}`} className="rc-img-wrap">
          <img src={item.img} alt={item.name} className="rc-img" />
          <div className="rc-img-overlay"><span>View Product →</span></div>
        </Link>

        <div className="rc-body">
          <div className="rc-meta-row">
            <p className="rc-category">{item.category || 'Handcraft'}</p>
            <ConfidenceBadge level={confidence} />
          </div>
          <h3 className="rc-name">{item.name}</h3>
          <div className="rc-prices">
            <span className="rc-price-new">₹{item.new_price.toLocaleString()}</span>
            {item.old_price > item.new_price && (
              <span className="rc-price-old">₹{item.old_price.toLocaleString()}</span>
            )}
          </div>
          <div className="rc-actions">
            <button
              className={`rc-btn rc-btn-cart ${inCart ? 'rc-btn-cart--added' : ''}`}
              onClick={() => addToCart(item.id)}
            >
              {inCart ? `✓ In Cart (${CartItems[item.id]})` : '🛒 Add to Cart'}
            </button>
            <div className="rc-feedback">
              <button
                className={`rc-feedback-btn ${isLiked ? 'rc-feedback-btn--liked' : ''}`}
                onClick={() => toggleLike(item.id)}
                title="I love this"
              >👍</button>
              <button
                className={`rc-feedback-btn ${isDisliked ? 'rc-feedback-btn--disliked' : ''}`}
                onClick={() => toggleDislike(item.id)}
                title="Not for me"
              >👎</button>
              {isML && (
                <button
                  className="rc-feedback-btn rc-why-btn"
                  onClick={() => setShowWhy(true)}
                  title="Why this recommendation?"
                >💡</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Preference Bar ───────────────────────────────────────────────────────────
const PreferenceBar = ({ profile }) => {
  const colors = {
    'God Idols':             '#c084fc',
    'Home Decor':            '#34d399',
    'Accessories and Rakhi': '#fbbf24',
  };
  return (
    <div className="pref-bars">
      {profile.map(({ category, percent }) => (
        <div key={category} className="pref-bar-row">
          <span className="pref-bar-label">{category}</span>
          <div className="pref-bar-track">
            <div className="pref-bar-fill" style={{ width: `${percent}%`, background: colors[category] || '#a855f7' }} />
          </div>
          <span className="pref-bar-pct">{percent}%</span>
        </div>
      ))}
    </div>
  );
};

// ─── Score Ring ───────────────────────────────────────────────────────────────
const ScoreRing = ({ score }) => {
  const r = 28, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const label = score < 30 ? 'Warming Up' : score < 60 ? 'Getting Good' : score < 85 ? 'Well Tuned' : 'Expert Mode';
  return (
    <div className="score-ring-wrap">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle cx="40" cy="40" r={r} fill="none" stroke="url(#ringGrad)" strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 40 40)" style={{ transition: 'stroke-dasharray 1s ease' }} />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
        <text x="40" y="44" textAnchor="middle" fill="white" fontSize="14" fontWeight="700">{score}</text>
      </svg>
      <span className="score-label">{label}</span>
    </div>
  );
};

// ─── ML Status Banner ─────────────────────────────────────────────────────────
const MLStatusBanner = ({ online, model, loading, onRefresh }) => (
  <div className={`ml-status-bar ${online ? 'ml-status-bar--online' : 'ml-status-bar--offline'}`}>
    <div className="ml-status-left">
      <span className={`ml-pulse ${online ? 'ml-pulse--green' : 'ml-pulse--amber'}`} />
      <span className="ml-status-text">
        {online
          ? <>🤖 AI Engine <strong>{model}</strong> · live recommendations</>
          : <>⚡ Curated picks · <em>AI engine starting up</em></>}
      </span>
    </div>
    <button
      className={`ml-refresh-btn ${loading ? 'ml-refresh-btn--spinning' : ''}`}
      onClick={onRefresh}
      disabled={loading}
      title="Re-run ML model"
    >
      {loading ? '⟳ Computing…' : '↺ Refresh AI'}
    </button>
  </div>
);

// ─── MOOD FILTERS ─────────────────────────────────────────────────────────────
const MOODS = [
  { id: 'all',       label: '✨ All For You',   cats: null },
  { id: 'spiritual', label: '🙏 Spiritual',     cats: ['God Idols'] },
  { id: 'home',      label: '🏡 Home & Decor',  cats: ['Home Decor'] },
  { id: 'gifting',   label: '🎁 Gifting',       cats: ['Accessories and Rakhi', 'God Idols'] },
  { id: 'festive',   label: '🎉 Festive',       cats: ['Accessories and Rakhi'] },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
const Recommendations = () => {
  const {
    mlRecommendations, mlSimilar, mlTrending,
    mlLoading, mlError, mlOnline, mlModel,
    refreshML,
    getPreferenceProfile, getPersonalizationScore,
    viewHistory, liked, disliked, cartFrequency,
    clearProfile, CartItems,
  } = useContext(ShopContext);

  const [activeMood, setActiveMood]       = useState('all');
  const [showProfile, setShowProfile]     = useState(false);

  const profile = useMemo(() => getPreferenceProfile(), [getPreferenceProfile]);
  const score   = useMemo(() => getPersonalizationScore(), [getPersonalizationScore]);

  // Apply mood filter to ML recommendations
  const recommendations = useMemo(() => {
    const mood = MOODS.find(m => m.id === activeMood);
    if (!mood?.cats) return mlRecommendations;
    return mlRecommendations.filter(p => mood.cats.includes(p.category));
  }, [mlRecommendations, activeMood]);

  const cartIds      = Object.keys(CartItems).filter(id => CartItems[id] > 0).map(Number);
  const hasActivity  = viewHistory.length > 0 || [...liked].length > 0 || cartIds.length > 0;
  const topCat       = profile[0]?.category;

  // Determine correct "similar" data — prefer ML, fallback computed above
  const becauseViewed = mlSimilar?.related?.length > 0 ? mlSimilar : null;
  const trending      = mlTrending.length > 0 ? mlTrending : [];

  return (
    <div className="rp-page">

      {/* ── HERO ── */}
      <div className="rp-hero">
        <div className="rp-hero-orb rp-hero-orb-1" />
        <div className="rp-hero-orb rp-hero-orb-2" />
        <div className="rp-hero-orb rp-hero-orb-3" />
        <div className="rp-hero-content">
          <div className="rp-hero-eyebrow">
            <span className="rp-eyebrow-dot" />
            AI-Powered Personalization
          </div>
          <h1 className="rp-hero-title">
            {hasActivity
              ? <>Curated Just for <span className="rp-gradient-text">You</span></>
              : <>Discover Your <span className="rp-gradient-text">Perfect Find</span></>}
          </h1>
          <p className="rp-hero-sub">
            {hasActivity
              ? `Your taste in ${topCat || 'handcraft'} is shaping these picks using TF-IDF · SVD · KNN.`
              : 'Browse, like, and add to cart — our ML engine gets smarter with every action.'}
          </p>
          <div className="rp-hero-stats">
            <div className="rp-stat"><strong>{viewHistory.length}</strong><span>Viewed</span></div>
            <div className="rp-stat-divider" />
            <div className="rp-stat"><strong>{[...liked].length}</strong><span>Liked</span></div>
            <div className="rp-stat-divider" />
            <div className="rp-stat"><strong>{Object.keys(cartFrequency).length}</strong><span>Carted</span></div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="rp-profile-card" onClick={() => setShowProfile(!showProfile)}>
          <ScoreRing score={score} />
          <div className="rp-profile-card-body">
            <h4>Your Taste Profile</h4>
            <p>{score < 20 ? 'Explore more to train your AI' : `Tuned to ${profile[0]?.category || 'your interests'}`}</p>
            <span className="rp-profile-card-toggle">{showProfile ? 'Hide ↑' : 'View ↓'}</span>
          </div>
        </div>
      </div>

      {/* ── ML STATUS BAR ── */}
      <MLStatusBanner
        online={mlOnline}
        model={mlModel}
        loading={mlLoading}
        onRefresh={refreshML}
      />

      {/* ── ERROR NOTICE ── */}
      {mlError && (
        <div className="ml-error-notice">⚠️ {mlError}</div>
      )}

      {/* ── PROFILE PANEL ── */}
      {showProfile && (
        <div className="rp-profile-panel">
          <div className="rp-profile-panel-inner">
            <div className="rp-profile-panel-header">
              <h3>🎨 Your Taste Profile</h3>
              <button className="rp-clear-btn" onClick={clearProfile}>Reset Profile</button>
            </div>
            {profile.length > 0 ? (
              <PreferenceBar profile={profile} />
            ) : (
              <p className="rp-profile-empty">No preferences recorded yet — start browsing!</p>
            )}
            <div className="rp-profile-signals">
              <div className="rp-signal"><span className="rp-signal-icon">👁️</span><div><strong>{viewHistory.length}</strong> products viewed</div></div>
              <div className="rp-signal"><span className="rp-signal-icon">👍</span><div><strong>{[...liked].length}</strong> liked · <strong>{[...disliked].length}</strong> disliked</div></div>
              <div className="rp-signal"><span className="rp-signal-icon">🛒</span><div><strong>{Object.keys(cartFrequency).length}</strong> unique items added to cart</div></div>
            </div>
            {/* ML Engine Info */}
            <div className="rp-engine-info">
              <h4>🤖 Active ML Engines</h4>
              <div className="rp-engine-chips">
                <span className={`engine-chip ${mlOnline ? 'engine-chip--active' : 'engine-chip--off'}`}>TF-IDF Content</span>
                <span className={`engine-chip ${mlOnline ? 'engine-chip--active' : 'engine-chip--off'}`}>SVD Collaborative</span>
                <span className={`engine-chip ${mlOnline ? 'engine-chip--active' : 'engine-chip--off'}`}>KNN Item-Item</span>
                <span className="engine-chip engine-chip--always">Heuristic Fallback</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MOOD FILTERS ── */}
      <div className="rp-moods">
        <div className="rp-moods-inner">
          {MOODS.map(mood => (
            <button
              key={mood.id}
              className={`rp-mood-btn ${activeMood === mood.id ? 'rp-mood-btn--active' : ''}`}
              onClick={() => setActiveMood(mood.id)}
            >
              {mood.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN RECOMMENDATIONS ── */}
      <div className="rp-section">
        <div className="rp-section-hd">
          <div className="rp-section-icon">🎯</div>
          <div>
            <h2>Recommended For You</h2>
            <p className="rp-section-sub">
              {mlLoading
                ? 'AI engine is computing your picks…'
                : mlOnline
                  ? `${recommendations.length} AI-powered picks · model: ${mlModel}`
                  : `${recommendations.length} curated picks (AI starting up)`}
            </p>
          </div>
        </div>

        {mlLoading ? (
          <div className="rp-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rp-grid-item" style={{ animationDelay: `${i * 0.06}s` }}>
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="rp-grid">
            {recommendations.map((item, i) => (
              <div key={item.id} className="rp-grid-item" style={{ animationDelay: `${i * 0.06}s` }}>
                <RecCard item={item} rank={i + 1} showRank={hasActivity} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rp-empty">
            <div className="rp-empty-icon">🛍️</div>
            <h3>No picks in this mood yet</h3>
            <p>Try a different mood filter or browse more products.</p>
          </div>
        )}
      </div>

      {/* ── BECAUSE YOU VIEWED (KNN) ── */}
      {becauseViewed?.related?.length > 0 && (
        <div className="rp-section rp-section--alt">
          <div className="rp-section-hd">
            <div className="rp-section-icon">🔗</div>
            <div>
              <h2>Because You Viewed</h2>
              <p className="rp-section-sub">
                KNN similarity to <strong>{becauseViewed.trigger?.name}</strong>
                {mlOnline && <span className="rp-ml-tag"> · AI-powered</span>}
              </p>
            </div>
          </div>
          <div className="rp-because-trigger">
            <img src={becauseViewed.trigger?.img} alt={becauseViewed.trigger?.name} />
            <div>
              <span className="rp-trigger-badge">You viewed</span>
              <p>{becauseViewed.trigger?.name}</p>
              <Link to={`/product/${becauseViewed.trigger?.id}`}>View again →</Link>
            </div>
          </div>
          <div className="rp-grid rp-grid--sm">
            {becauseViewed.related.map((item, i) => (
              <div key={item.id} className="rp-grid-item" style={{ animationDelay: `${i * 0.08}s` }}>
                <RecCard item={item} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TRENDING NOW ── */}
      <div className="rp-section">
        <div className="rp-section-hd">
          <div className="rp-section-icon">🔥</div>
          <div>
            <h2>Trending Now</h2>
            <p className="rp-section-sub">
              {mlOnline ? 'Decay-weighted global interaction frequency' : 'Most interacted products in your session'}
            </p>
          </div>
        </div>
        {trending.length > 0 ? (
          <div className="rp-grid rp-grid--sm">
            {trending.map((item, i) => (
              <div key={item.id} className="rp-grid-item" style={{ animationDelay: `${i * 0.07}s` }}>
                <RecCard item={item} rank={i + 1} showRank />
              </div>
            ))}
          </div>
        ) : (
          <div className="rp-grid">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="rp-grid-item"><SkeletonCard /></div>)}
          </div>
        )}
      </div>

      {/* ── CATEGORY NAV ── */}
      <div className="rp-catbar">
        <h2>Shop by Category</h2>
        <div className="rp-catbar-grid">
          <Link to="/god-idols" className="rp-cat rp-cat--god">
            <span className="rp-cat-emoji">🙏</span>
            <div><h3>God Idols</h3><p>Sacred handcrafted pieces</p></div>
            <span className="rp-cat-arrow">→</span>
          </Link>
          <Link to="/home-decor" className="rp-cat rp-cat--decor">
            <span className="rp-cat-emoji">🏡</span>
            <div><h3>Home Decor</h3><p>Beautify every corner</p></div>
            <span className="rp-cat-arrow">→</span>
          </Link>
          <Link to="/accessories-and-rakhi" className="rp-cat rp-cat--rakhi">
            <span className="rp-cat-emoji">🎀</span>
            <div><h3>Accessories & Rakhi</h3><p>Jewellery, clocks & more</p></div>
            <span className="rp-cat-arrow">→</span>
          </Link>
        </div>
      </div>

      {/* ── HOW THE AI LEARNS ── */}
      <div className="rp-how">
        <h2>How the AI Learns You</h2>
        <div className="rp-how-grid">
          {[
            { icon: '🧠', title: 'TF-IDF Content',     body: 'Vectorises product names & categories to find semantically similar items',  weight: '40%' },
            { icon: '🔗', title: 'SVD Collaborative',  body: 'Matrix factorisation learns latent taste patterns across all shoppers',       weight: '25%' },
            { icon: '📍', title: 'KNN Similarity',     body: 'K-Nearest Neighbors finds the most geometrically similar products',          weight: 'BYV' },
            { icon: '👍', title: 'Like Signal',        body: 'Explicit likes are the strongest behavioural signal — 3× weight',            weight: '×3.0' },
            { icon: '🛒', title: 'Cart Intent',        body: 'Adding to cart is a high-intent signal that boosts similar products',        weight: '×2.5' },
            { icon: '⏱️', title: 'Recency Decay',      body: 'Exponential time-decay ensures recent actions outweigh older ones',          weight: 'e^-t' },
          ].map(({ icon, title, body, weight }) => (
            <div key={title} className="rp-how-card">
              <div className="rp-how-top">
                <span className="rp-how-icon">{icon}</span>
                <span className="rp-how-weight">{weight}</span>
              </div>
              <h4>{title}</h4>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Recommendations;
