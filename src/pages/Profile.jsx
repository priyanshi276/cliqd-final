import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';
import { useSocial } from '../context/SocialContext';
import PostCard from '../components/PostCard';
import './Profile.css';

const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const ListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const CameraIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
function EditProfileModal({ profileUser, onClose, onSave }) {
  const avatarRef = useRef(null);
  const coverRef = useRef(null);
  const [form, setForm] = useState({
    name: profileUser.name || '',
    bio: profileUser.bio || '',
    avatar: profileUser.avatar || '',
    coverPhoto: profileUser.coverPhoto || '',
  });
  const [avatarPreview, setAvatarPreview] = useState(profileUser.avatar || '');
  const [coverPreview, setCoverPreview] = useState(profileUser.coverPhoto || '');
  const [saving, setSaving] = useState(false);

  const handleImageFile = (file, type) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      if (type === 'avatar') {
        setAvatarPreview(dataUrl);
        setForm(f => ({ ...f, avatar: dataUrl }));
      } else {
        setCoverPreview(dataUrl);
        setForm(f => ({ ...f, coverPhoto: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 300));
    onSave(form);
    setSaving(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="edit-modal-header">
          <h2>Edit Profile</h2>
          <button className="close-btn" onClick={onClose}><XIcon /></button>
        </div>

        <div className="edit-modal-body">
          {/* Cover Photo */}
          <div className="cover-edit-section">
            <p className="edit-section-label">Cover Photo</p>
            <div
              className="cover-edit-preview"
              style={{ backgroundImage: coverPreview ? `url(${coverPreview})` : 'none' }}
            >
              {!coverPreview && <span className="cover-placeholder">No cover photo</span>}
              <button
                className="cover-edit-btn"
                onClick={() => coverRef.current?.click()}
                title="Change cover photo"
              >
                <CameraIcon />
                <span>Change Cover</span>
              </button>
            </div>
            <input
              ref={coverRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => handleImageFile(e.target.files[0], 'cover')}
            />
            <p className="edit-hint">Recommended: 1500 × 500px</p>
          </div>

          {/* Avatar */}
          <div className="avatar-edit-section">
            <p className="edit-section-label">Profile Photo</p>
            <div className="avatar-edit-row">
              <div className="avatar-edit-wrap">
                <img src={avatarPreview} alt="avatar" className="avatar-edit-img" />
                <button
                  className="avatar-edit-btn"
                  onClick={() => avatarRef.current?.click()}
                  title="Change profile photo"
                >
                  <CameraIcon />
                </button>
              </div>
              <div className="avatar-edit-info">
                <p>Upload a new profile photo</p>
                <p className="edit-hint">JPG, PNG or GIF · Max 5MB<br/>Recommended: 400 × 400px</p>
                <button className="btn-ghost" style={{marginTop:'8px',padding:'6px 14px',fontSize:'0.82rem'}} onClick={() => avatarRef.current?.click()}>
                  Choose Photo
                </button>
              </div>
            </div>
            <input
              ref={avatarRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => handleImageFile(e.target.files[0], 'avatar')}
            />
          </div>

          {/* Name */}
          <div className="edit-field">
            <label className="edit-label">Display Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="Your name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              maxLength={50}
            />
            <span className="char-count">{form.name.length}/50</span>
          </div>

          {/* Bio */}
          <div className="edit-field">
            <label className="edit-label">Bio</label>
            <textarea
              className="input-field bio-textarea"
              placeholder="Tell people about yourself..."
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              rows={4}
              maxLength={160}
            />
            <span className="char-count">{form.bio.length}/160</span>
          </div>
        </div>

        {/* Footer */}
        <div className="edit-modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
          >
            {saving ? <span className="btn-spinner" /> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── User List Modal (Followers / Following) ─────────────────────────────────
function UserListModal({ title, users, onClose, onNavigate }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}><XIcon /></button>
        </div>
        <div className="modal-body">
          {users.length === 0 ? (
            <p className="modal-empty">No {title.toLowerCase()} yet</p>
          ) : (
            users.map(u => (
              <div
                key={u.id}
                className="modal-user"
                onClick={() => { onNavigate(u.username); onClose(); }}
              >
                <img src={u.avatar} alt={u.username} />
                <div>
                  <span className="mu-name">{u.name}</span>
                  <span className="mu-handle">@{u.username}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Profile Page ────────────────────────────────────────────────────────
export default function Profile() {
  const { username } = useParams();
  const { user, updateProfile } = useAuth();
  const { getPostsByUser } = usePosts();
  const {
    tick, follow, unfollow, isFollowing,
    getFollowerCount, getFollowingCount,
    getFollowers, getFollowing,
    getUserByUsername
  } = useSocial();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const [stats, setStats] = useState({ followers: 0, following: 0, userPosts: [], isFollowing: false });
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);

  const isOwn = user?.username === username;

  useEffect(() => {
    const loadProfile = async () => {
      const found = await getUserByUsername(username);
      setProfileUser(found || null);
      if (found) {
        const posts = await getPostsByUser(found._id || found.id);
        const flwers = await getFollowerCount(found._id || found.id);
        const flwing = await getFollowingCount(found._id || found.id);
        const amFollow = user ? await isFollowing(user._id || user.id, found._id || found.id) : false;
        
        setStats({ followers: flwers, following: flwing, userPosts: posts, isFollowing: amFollow });
      }
    };
    loadProfile();
  }, [username, tick, user]);

  useEffect(() => {
    if (showFollowersModal && profileUser) {
      getFollowers(profileUser._id || profileUser.id).then(setFollowersList);
    }
  }, [showFollowersModal, profileUser]);

  useEffect(() => {
    if (showFollowingModal && profileUser) {
      getFollowing(profileUser._id || profileUser.id).then(setFollowingList);
    }
  }, [showFollowingModal, profileUser]);

  if (!profileUser) {
    return (
      <div className="profile-page">
        <div className="not-found">
          <h2>User not found</h2>
          <button className="btn-ghost" onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  const { userPosts, followers, following, isFollowing: amFollowing } = stats;
  const totalLikes = userPosts.reduce((sum, p) => sum + (p.likes ? p.likes.length : 0), 0);

  const handleFollowToggle = async () => {
    if (!user) { navigate('/login'); return; }
    if (followLoading) return;
    setFollowLoading(true);
    if (amFollowing) {
      await unfollow(user._id || user.id, profileUser._id || profileUser.id);
    } else {
      await follow(user._id || user.id, profileUser._id || profileUser.id);
    }
    setFollowLoading(false);
  };

  const handleSaveProfile = (updates) => {
    updateProfile(updates);
    setProfileUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="profile-page">
      {/* ── Cover Photo ── */}
      <div
        className="profile-cover"
        style={profileUser.coverPhoto ? { backgroundImage: `url(${profileUser.coverPhoto})` } : {}}
      >
        {!profileUser.coverPhoto && <div className="cover-gradient" />}
      </div>

      {/* ── Profile Info ── */}
      <div className="profile-info-wrap">
        <div className="profile-avatar-wrap">
          <img
            src={profileUser.avatar}
            alt={profileUser.username}
            className="profile-avatar"
          />
        </div>

        <div className="profile-actions-row">
          {isOwn ? (
            <button className="btn-ghost edit-profile-btn" onClick={() => setShowEditModal(true)}>
              <EditIcon /> Edit Profile
            </button>
          ) : (
            <button
              className={amFollowing ? 'btn-ghost follow-btn' : 'btn-primary follow-btn'}
              onClick={handleFollowToggle}
              disabled={followLoading}
            >
              {followLoading ? <span className="btn-spinner-sm" /> : amFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>

        <div className="profile-details">
          <h1 className="profile-name">{profileUser.name}</h1>
          <span className="profile-handle">@{profileUser.username}</span>
          {profileUser.bio && <p className="profile-bio">{profileUser.bio}</p>}
          {!profileUser.bio && isOwn && (
            <p className="profile-bio empty-bio" onClick={() => setShowEditModal(true)}>
              + Add a bio
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="stat">
            <span className="stat-val">{userPosts.length}</span>
            <span className="stat-label">Posts</span>
          </div>
          <button className="stat stat-btn" onClick={() => setShowFollowersModal(true)}>
            <span className="stat-val">{followers}</span>
            <span className="stat-label">Followers</span>
          </button>
          <button className="stat stat-btn" onClick={() => setShowFollowingModal(true)}>
            <span className="stat-val">{following}</span>
            <span className="stat-label">Following</span>
          </button>
          <div className="stat">
            <span className="stat-val">{totalLikes}</span>
            <span className="stat-label">Likes</span>
          </div>
        </div>
      </div>

      {/* ── View Toggle ── */}
      <div className="view-toggle">
        <button className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
          <GridIcon /> Grid
        </button>
        <button className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
          <ListIcon /> Feed
        </button>
      </div>

      {/* ── Posts ── */}
      {userPosts.length === 0 ? (
        <div className="no-posts">
          <div className="no-posts-icon">📷</div>
          <h3>No posts yet</h3>
          {isOwn && (
            <button className="btn-primary" onClick={() => navigate('/create')} style={{ marginTop: '16px' }}>
              Create First Post
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="posts-grid">
          {userPosts.map(post => (
            <div key={post.id} className="grid-item">
              {post.mediaType === 'video' ? (
                <video src={post.mediaUrl} className="grid-media" />
              ) : (
                <img src={post.mediaUrl} alt={post.caption} className="grid-media" loading="lazy" />
              )}
              <div className="grid-overlay">
                <span>❤️ {post.likes.length}</span>
                <span>🏷️ {post.tags?.length || 0}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="posts-list-view">
          {userPosts.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      )}

      {/* ── Modals ── */}
      {showEditModal && (
        <EditProfileModal
          profileUser={profileUser}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveProfile}
        />
      )}
      {showFollowersModal && (
        <UserListModal
          title="Followers"
          users={followersList}
          onClose={() => setShowFollowersModal(false)}
          onNavigate={navigate}
        />
      )}
      {showFollowingModal && (
        <UserListModal
          title="Following"
          users={followingList}
          onClose={() => setShowFollowingModal(false)}
          onNavigate={navigate}
        />
      )}
    </div>
  );
}
