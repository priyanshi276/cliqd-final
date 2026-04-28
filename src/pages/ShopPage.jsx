import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { usePosts } from '../context/PostsContext';
import './ShopPage.css';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.56l1.65-9.44H6"/>
  </svg>
);
const ShareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);
const HeartIcon = ({ filled }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);
const TagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

export default function ShopPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { posts } = usePosts();

  // Data passed from PostCard via navigate state
  const { post, tag } = location.state || {};
  const [wishlisted, setWishlisted] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [copied, setCopied] = useState(false);

  // Find other posts that have the same product tagged
  const relatedPosts = posts.filter(p =>
    p.id !== post?.id &&
    p.tags?.some(t => t.productName?.toLowerCase() === tag?.productName?.toLowerCase())
  );

  if (!post || !tag) {
    return (
      <div className="shop-page">
        <div className="shop-not-found">
          <h2>Product not found</h2>
          <button className="btn-ghost" onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  const handleBuyNow = () => {
    if (tag.link && tag.link !== '#') {
      window.open(tag.link, '_blank');
    } else {
      alert('No purchase link added for this product yet.');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Multiple images: post image + any extras
  const images = [post.mediaUrl];

  return (
    <div className="shop-page">
      {/* Top nav */}
      <div className="shop-topbar">
        <button className="shop-back-btn" onClick={() => navigate(-1)}>
          <BackIcon /> Back
        </button>
        <div className="shop-topbar-actions">
          <button className={`wishlist-btn ${wishlisted ? 'active' : ''}`} onClick={() => setWishlisted(!wishlisted)}>
            <HeartIcon filled={wishlisted} />
          </button>
          <button className="share-btn" onClick={handleShare}>
            <ShareIcon />
            {copied && <span className="copied-toast">Copied!</span>}
          </button>
        </div>
      </div>

      <div className="shop-layout">
        {/* Left: media */}
        <div className="shop-media-col">
          <div className="shop-main-img">
            {post.mediaType === 'video' ? (
              <video src={images[activeImg]} className="shop-media" controls />
            ) : (
              <img src={images[activeImg]} alt={tag.productName} className="shop-media" />
            )}
            {/* Tag overlay on image */}
            <div className="shop-tag-overlay">
              <TagIcon />
              <span>Tagged in this post</span>
            </div>
          </div>

          {/* Posted by */}
          <div className="posted-by" onClick={() => navigate(`/profile/${post.username}`)}>
            <img src={post.userAvatar} alt={post.username} />
            <div>
              <span className="pb-label">Posted by</span>
              <span className="pb-name">@{post.username}</span>
            </div>
            <span className="pb-caption">{post.caption?.slice(0, 80)}{post.caption?.length > 80 ? '...' : ''}</span>
          </div>
        </div>

        {/* Right: product info */}
        <div className="shop-info-col">
          <div className="shop-badge">
            <TagIcon /> Shoppable Product
          </div>

          <h1 className="shop-product-name">{tag.productName}</h1>

          {tag.price && (
            <div className="shop-price-row">
              <span className="shop-price">{tag.price}</span>
              <span className="shop-price-note">Inclusive of all taxes</span>
            </div>
          )}

          <div className="shop-divider" />

          {/* Product details */}
          <div className="shop-details">
            <h3>Product Details</h3>
            <div className="shop-detail-row">
              <span>Product</span>
              <span>{tag.productName}</span>
            </div>
            {tag.price && (
              <div className="shop-detail-row">
                <span>Price</span>
                <span>{tag.price}</span>
              </div>
            )}
            <div className="shop-detail-row">
              <span>Tagged by</span>
              <span>@{post.username}</span>
            </div>
            <div className="shop-detail-row">
              <span>In posts</span>
              <span>{relatedPosts.length + 1} post{relatedPosts.length !== 0 ? 's' : ''}</span>
            </div>
          </div>

          <div className="shop-divider" />

          {/* CTA buttons */}
          <div className="shop-cta">
            <button className="shop-buy-btn" onClick={handleBuyNow}>
              <CartIcon />
              {tag.link && tag.link !== '#' ? 'Buy Now' : 'View Product'}
            </button>
            <button
              className={`shop-wishlist-cta ${wishlisted ? 'active' : ''}`}
              onClick={() => setWishlisted(!wishlisted)}
            >
              <HeartIcon filled={wishlisted} />
              {wishlisted ? 'Wishlisted' : 'Add to Wishlist'}
            </button>
          </div>

          {tag.link && tag.link !== '#' && (
            <a href={tag.link} target="_blank" rel="noreferrer" className="shop-external-link">
              🔗 View on seller's website →
            </a>
          )}
        </div>
      </div>

      {/* Related posts section */}
      {relatedPosts.length > 0 && (
        <div className="shop-related">
          <h2 className="related-title">More posts with "{tag.productName}"</h2>
          <div className="related-grid">
            {relatedPosts.map(p => (
              <div
                key={p.id}
                className="related-card"
                onClick={() => navigate('/shop', { state: { post: p, tag: p.tags.find(t => t.productName?.toLowerCase() === tag.productName?.toLowerCase()) } })}
              >
                {p.mediaType === 'video'
                  ? <video src={p.mediaUrl} className="related-media" />
                  : <img src={p.mediaUrl} alt="" className="related-media" />
                }
                <div className="related-info">
                  <span className="related-user">@{p.username}</span>
                  <span className="related-likes">❤️ {p.likes.length}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
