// Sets up demo accounts and clears stale post data on first load
export function setupDemo() {
  // Always refresh posts so new demo data loads
  const existingPosts = localStorage.getItem('cliqd_posts');
  if (existingPosts) {
    try {
      const parsed = JSON.parse(existingPosts);
      // If all posts are demo posts (old session), clear so PostsContext loads fresh
      const hasDemoPosts = parsed.some(p => p.id.startsWith('demo'));
      const hasUserPosts = parsed.some(p => !p.id.startsWith('demo'));
      if (hasDemoPosts && !hasUserPosts) {
        localStorage.removeItem('cliqd_posts');
      }
    } catch {
      localStorage.removeItem('cliqd_posts');
    }
  }

  // Setup demo users if not already there
  const existing = localStorage.getItem('cliqd_users');
  if (existing) {
    try {
      const users = JSON.parse(existing);
      if (users['demo_main']) return; // already set up
    } catch {}
  }

  const demoUsers = {
    'demo_main': {
      id: 'demo_main',
      name: 'Demo User',
      email: 'demo@cliqd.com',
      password: 'demo1234',
      username: 'demo',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo&backgroundColor=b6e3f4',
      bio: 'Just here to shop and discover 🛍️',
      coverPhoto: '',
      followers: ['demo_user1','demo_user2'],
      following: ['demo_user1','demo_user3','demo_user4'],
      createdAt: Date.now() - 86400000 * 10
    },
    'demo_user1': {
      id: 'demo_user1', name: 'Style Haus', email: 'stylehaus@cliqd.com', password: 'pass123',
      username: 'stylehaus',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=stylehaus&backgroundColor=b6e3f4',
      bio: 'Fashion forward. Always tagged. ✨',
      coverPhoto: '', followers: ['demo_main','demo_user3'], following: ['demo_user2'],
      createdAt: Date.now() - 86400000 * 30
    },
    'demo_user2': {
      id: 'demo_user2', name: 'Urban Fits', email: 'urbanfits@cliqd.com', password: 'pass123',
      username: 'urban.fits',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=urbanfits&backgroundColor=c0aede',
      bio: 'Street style curator 🔥',
      coverPhoto: '', followers: ['demo_user4'], following: ['demo_main','demo_user1'],
      createdAt: Date.now() - 86400000 * 25
    },
    'demo_user3': {
      id: 'demo_user3', name: 'Accessory Lab', email: 'accesslab@cliqd.com', password: 'pass123',
      username: 'accessory.lab',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=accesslab&backgroundColor=ffd5dc',
      bio: 'Jewellery & accessories obsessed 💎',
      coverPhoto: '', followers: ['demo_main'], following: ['demo_user2'],
      createdAt: Date.now() - 86400000 * 20
    },
    'demo_user4': {
      id: 'demo_user4', name: 'Sneaker Vault', email: 'sneakervault@cliqd.com', password: 'pass123',
      username: 'sneaker.vault',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sneakervault&backgroundColor=d1d4f9',
      bio: 'Sneakerhead. Every drop documented. 👟',
      coverPhoto: '', followers: ['demo_main'], following: [],
      createdAt: Date.now() - 86400000 * 15
    },
    'demo_user5': {
      id: 'demo_user5', name: 'Minimal Drip', email: 'minimaldrip@cliqd.com', password: 'pass123',
      username: 'minimal.drip',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=minimaldrip&backgroundColor=b6e3f4',
      bio: 'Clean. Simple. Intentional. 🤍',
      coverPhoto: '', followers: [], following: [],
      createdAt: Date.now() - 86400000 * 12
    },
    'demo_user6': {
      id: 'demo_user6', name: 'Luxe Looks', email: 'luxelooks@cliqd.com', password: 'pass123',
      username: 'luxe.looks',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luxelooks&backgroundColor=ffdfbf',
      bio: 'Luxury on a budget 👜',
      coverPhoto: '', followers: [], following: [],
      createdAt: Date.now() - 86400000 * 8
    },
    'demo_user7': {
      id: 'demo_user7', name: 'Watch Culture', email: 'watchculture@cliqd.com', password: 'pass123',
      username: 'watch.culture',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=watchculture&backgroundColor=c0aede',
      bio: 'Time is luxury ⌚',
      coverPhoto: '', followers: [], following: [],
      createdAt: Date.now() - 86400000 * 6
    },
    'demo_user8': {
      id: 'demo_user8', name: 'Denim Diaries', email: 'denimdiaries@cliqd.com', password: 'pass123',
      username: 'denim.diaries',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=denimdiaries&backgroundColor=d1d4f9',
      bio: 'Denim forever 💙',
      coverPhoto: '', followers: [], following: [],
      createdAt: Date.now() - 86400000 * 4
    }
  };

  localStorage.setItem('cliqd_users', JSON.stringify(demoUsers));
  localStorage.setItem('cliqd_session', JSON.stringify({
    id: 'demo_main', name: 'Demo User', email: 'demo@cliqd.com',
    username: 'demo', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo&backgroundColor=b6e3f4',
    bio: 'Just here to shop and discover 🛍️', coverPhoto: ''
  }));
}
