import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePosts } from '../context/PostsContext';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import PostCard from '../components/PostCard';
import './Home.css';

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const TagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

// Search users from localStorage
function searchUsers(query) {
  try {
    const users = JSON.parse(localStorage.getItem('cliqd_users') || '{}');
    const q = query.toLowerCase();
    return Object.values(users).filter(u =>
      u.username?.toLowerCase().includes(q) ||
      u.name?.toLowerCase().includes(q)
    );
  } catch { return []; }
}

export default function Home() {
  const { posts, searchPosts } = usePosts();
  const { user } = useAuth();
  const { follow, unfollow, isFollowing, getFollowerCount, tick } = useSocial();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [postResults, setPostResults] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'users'
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  const suggestedTags = ['earrings', 'sneakers', 'dress', 'jacket', 'bags', 'watches'];

  useEffect(() => {
    setPostResults(posts);
  }, [posts]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = async (val) => {
    setQuery(val);
    if (val.trim()) {
      setIsSearching(true);
      const [foundPosts, foundUsersRes] = await Promise.all([
        searchPosts(val),
        fetch(`/api/social/search?q=${encodeURIComponent(val)}`)
      ]);
      setPostResults(foundPosts || []);
      if (foundUsersRes.ok) {
        setUserResults(await foundUsersRes.json());
      }
      setShowDropdown(true);
    } else {
      setIsSearching(false);
      setPostResults(posts);
      setUserResults([]);
      setShowDropdown(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setIsSearching(false);
    setPostResults(posts);
    setUserResults([]);
    setShowDropdown(false);
    setActiveTab('posts');
  };

  const handleFollowToggle = (e, targetUser) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    if (isFollowing(user.id, targetUser.id)) {
      unfollow(user.id, targetUser.id);
    } else {
      follow(user.id, targetUser.id);
    }
  };

  const goToProfile = (username) => {
    navigate(`/profile/${username}`);
    setShowDropdown(false);
  };

  return (
    <div className="home-page">
      {/* Header */}
      <div className="home-header">
        <div className="home-title-row">
          <div>
            <h1 className="home-title">Feed</h1>
            <p className="home-subtitle">{posts.length} posts</p>
          </div>
        </div>

        {/* Search bar */}
        <div className="search-wrap" ref={searchRef}>
          <div className="search-bar">
            <span className="search-icon"><SearchIcon /></span>
            <input
              type="text"
              className="search-input"
              placeholder="Search users, products, posts..."
              value={query}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => query.trim() && setShowDropdown(true)}
            />
            {query && (
              <button className="search-clear" onClick={clearSearch}><XIcon /></button>
            )}
          </div>

          {/* Live dropdown */}
          {showDropdown && query.trim() && (
            <div className="search-dropdown fade-in">
              {/* Users section */}
              {userResults.length > 0 && (
                <div className="dropdown-section">
                  <div className="dropdown-section-label"><UserIcon /> People</div>
                  {userResults.slice(0, 4).map(u => {
                    const amFollowing = user && user.following ? user.following.includes(u._id || u.id) : false;
                    const isMe = user?.id === (u._id || u.id);
                    return (
                      <div key={u._id || u.id} className="dropdown-user" onClick={() => goToProfile(u.username)}>
                        <img src={u.avatar} alt={u.username} className="dropdown-avatar" />
                        <div className="dropdown-user-info">
                          <span className="dropdown-name">{u.name}</span>
                          <span className="dropdown-handle">@{u.username}</span>
                        </div>
                        <div className="dropdown-user-right">
                          <span className="dropdown-followers">{u.followers ? u.followers.length : 0} followers</span>
                          {!isMe && (
                            <button
                              className={`dropdown-follow-btn ${amFollowing ? 'following' : ''}`}
                              onClick={(e) => handleFollowToggle(e, u)}
                            >
                              {amFollowing ? 'Following' : 'Follow'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Posts/Products section */}
              {postResults.length > 0 && (
                <div className="dropdown-section">
                  <div className="dropdown-section-label"><TagIcon /> Posts & Products</div>
                  {postResults.slice(0, 3).map(p => (
                    <div key={p._id || p.id} className="dropdown-post" onClick={() => { setShowDropdown(false); setActiveTab('posts'); }}>
                      {p.mediaType === 'video'
                        ? <video src={p.mediaUrl} className="dropdown-thumb" />
                        : <img src={p.mediaUrl} alt="" className="dropdown-thumb" />
                      }
                      <div className="dropdown-post-info">
                        <span className="dropdown-post-caption">{p.caption?.slice(0, 50)}{p.caption?.length > 50 ? '...' : ''}</span>
                        <span className="dropdown-post-tags">
                          {p.tags?.slice(0,2).map(t => t.productName).join(', ')}
                          {p.tags?.length > 2 ? ` +${p.tags.length - 2} more` : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {userResults.length === 0 && postResults.length === 0 && (
                <div className="dropdown-empty">No results for "{query}"</div>
              )}
            </div>
          )}

          {/* Suggestion chips */}
          {!isSearching && (
            <div className="search-suggestions">
              {suggestedTags.map(tag => (
                <button key={tag} className="suggestion-chip" onClick={() => handleSearch(tag)}>
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search results tabs */}
      {isSearching && (
        <div className="search-tabs fade-in">
          <div className="search-tabs-row">
            <button
              className={`search-tab ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              Posts & Products
              <span className="tab-count">{postResults.length}</span>
            </button>
            <button
              className={`search-tab ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              People
              <span className="tab-count">{userResults.length}</span>
            </button>
            <button onClick={clearSearch} className="clear-search-btn">
              <XIcon /> Clear
            </button>
          </div>
        </div>
      )}

      {/* USER RESULTS TAB */}
      {isSearching && activeTab === 'users' && (
        <div className="user-results fade-in">
          {userResults.length === 0 ? (
            <div className="empty-feed">
              <div className="empty-icon">👤</div>
              <h3>No users found</h3>
              <p>Try a different name or username</p>
            </div>
          ) : (
            userResults.map(u => {
              const amFollowing = user && user.following ? user.following.includes(u._id || u.id) : false;
              const isMe = user?.id === (u._id || u.id);
              return (
                <div key={u._id || u.id} className="user-card" onClick={() => navigate(`/profile/${u.username}`)}>
                  <img src={u.avatar} alt={u.username} className="user-card-avatar" />
                  <div className="user-card-info">
                    <span className="user-card-name">{u.name}</span>
                    <span className="user-card-handle">@{u.username}</span>
                    {u.bio && <span className="user-card-bio">{u.bio}</span>}
                    <span className="user-card-followers">{u.followers ? u.followers.length : 0} followers</span>
                  </div>
                  {!isMe && (
                    <button
                      className={amFollowing ? 'btn-ghost user-follow-btn' : 'btn-primary user-follow-btn'}
                      onClick={(e) => handleFollowToggle(e, u)}
                    >
                      {amFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* POST RESULTS / MAIN FEED */}
      {(!isSearching || activeTab === 'posts') && (
        <>
          {postResults.length > 0 ? (
            <div className="posts-feed">
              {postResults.map((post, i) => (
                <div key={post.id} style={{ animationDelay: `${i * 0.05}s` }}>
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          ) : isSearching ? (
            <div className="empty-feed">
              <div className="empty-icon">🔍</div>
              <h3>No posts found</h3>
              <p>Try searching for a product name or caption</p>
            </div>
          ) : (
            <div className="empty-feed">
              <div className="empty-icon">✨</div>
              <h3>Nothing here yet</h3>
              <p>Follow some people or create your first post</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
