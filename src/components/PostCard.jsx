import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';
import './PostCard.css';

const HeartIcon = ({ filled }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);
const TagIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const PlayIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1">
    <circle cx="12" cy="12" r="10" fill="rgba(0,0,0,0.5)" stroke="none"/>
    <polygon points="10 8 16 12 10 16 10 8" fill="white"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const ShopIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.56l1.65-9.44H6"/>
  </svg>
);

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function PostCard({ post }) {
  const { user } = useAuth();
  const { toggleLike, deletePost } = usePosts();
  const navigate = useNavigate();
  const [activeTag, setActiveTag] = useState(null);
  const [showTags, setShowTags] = useState(true); // tags visible by default
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const liked = user && post.likes.includes(user.id);
  const isOwner = user && post.userId === user.id;

  const handleLike = () => {
    if (!user) { navigate('/login'); return; }
    toggleLike(post._id || post.id);
  };

  // Navigate to shop page
  const goToShop = (tag, e) => {
    e?.stopPropagation();
    navigate('/shop', { state: { post, tag } });
  };

  const handleTagClick = (tag, e) => {
    e.stopPropagation();
    setActiveTag(activeTag?.id === tag.id ? null : tag);
  };

  const handleVideoToggle = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <article className="post-card fade-in">
      {/* Header */}
      <div className="post-header">
        <div className="post-user" onClick={() => navigate(`/profile/${post.username}`)}>
          <img src={post.userAvatar} alt={post.username} className="post-avatar" />
          <div>
            <span className="post-username">{post.username}</span>
            <span className="post-time">{timeAgo(post.createdAt)}</span>
          </div>
        </div>
        <div className="post-header-actions">
          {post.tags?.length > 0 && (
            <button
              className={`tag-toggle-btn ${showTags ? 'active' : ''}`}
              onClick={() => setShowTags(!showTags)}
              title="Toggle product tags"
            >
              <TagIcon />
              <span>{post.tags.length}</span>
            </button>
          )}
          {isOwner && (
            <button className="delete-btn" onClick={() => deletePost(post._id || post.id)}>
              <TrashIcon />
            </button>
          )}
        </div>
      </div>

      {/* Media */}
      <div className="post-media-wrap" onClick={() => setActiveTag(null)}>
        {post.mediaType === 'video' ? (
          <div className="video-container" onClick={handleVideoToggle}>
            <video ref={videoRef} src={post.mediaUrl} className="post-media" loop playsInline
              onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
            {!isPlaying && <div className="play-overlay"><PlayIcon /></div>}
            <div className="reel-badge">REEL</div>
          </div>
        ) : (
          <img src={post.mediaUrl} alt={post.caption} className="post-media" loading="lazy" />
        )}

        {/* Product Tag Dots */}
        {showTags && post.tags?.map(tag => (
          <React.Fragment key={tag.id}>
            <button
              className="tag-dot"
              style={{ left: `${tag.x}%`, top: `${tag.y}%` }}
              onClick={(e) => handleTagClick(tag, e)}
            >
              <span className="tag-dot-inner" />
            </button>

            {/* Tag popup with Shop Now */}
            {activeTag?.id === tag.id && (
              <div
                className="tag-popup"
                style={{
                  left: `${Math.min(tag.x, 65)}%`,
                  top: `${Math.min(tag.y + 6, 78)}%`
                }}
                onClick={e => e.stopPropagation()}
              >
                <span className="tag-popup-name">{tag.productName}</span>
                {tag.price && <span className="tag-popup-price">{tag.price}</span>}
                <button className="tag-popup-shop-btn" onClick={(e) => goToShop(tag, e)}>
                  <ShopIcon /> Shop Now
                </button>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Actions */}
      <div className="post-actions">
        <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
          <HeartIcon filled={liked} />
          <span>{post.likes.length}</span>
        </button>

        {/* Clickable product chips — go to shop */}
        {post.tags?.length > 0 && (
          <div className="post-tags-list">
            {post.tags.slice(0, 3).map(tag => (
              <button key={tag.id} className="post-tag-chip clickable" onClick={(e) => goToShop(tag, e)}>
                <ShopIcon />
                {tag.productName}
                {tag.price && <span className="chip-price">{tag.price}</span>}
              </button>
            ))}
            {post.tags.length > 3 && (
              <span className="post-tag-chip more">+{post.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="post-caption">
          <span className="caption-user" onClick={() => navigate(`/profile/${post.username}`)}>
            {post.username}
          </span>
          {' '}{post.caption}
        </div>
      )}
    </article>
  );
}
