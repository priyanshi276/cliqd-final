const express = require('express');
const User    = require('../models/User');
const auth    = require('../middleware/auth');

const router = express.Router();

// Helper: strip password and attach id
const safe = (u) => {
  const obj = u.toObject ? u.toObject() : { ...u };
  delete obj.password;
  obj.id = (obj._id || obj.id).toString();
  return obj;
};

// ── GET /api/social/search?q= ───────────────────────────────────────────────
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.json([]);

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { name:     { $regex: q, $options: 'i' } }
      ]
    })
      .select('-password')
      .limit(20)
      .lean();

    res.json(users.map(u => ({ ...u, id: u._id.toString() })));
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ── GET /api/social/user/:username ──────────────────────────────────────────
router.get('/user/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(safe(user));
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ── GET /api/social/user/id/:id ─────────────────────────────────────────────
router.get('/user/id/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(safe(user));
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ── GET /api/social/followers/:userId ───────────────────────────────────────
router.get('/followers/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('followers', '-password')
      .lean();
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user.followers.map(u => ({ ...u, id: u._id.toString() })));
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ── GET /api/social/following/:userId ───────────────────────────────────────
router.get('/following/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('following', '-password')
      .lean();
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user.following.map(u => ({ ...u, id: u._id.toString() })));
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ── POST /api/social/follow/:targetId ───────────────────────────────────────
router.post('/follow/:targetId', auth, async (req, res) => {
  try {
    const currentId = req.user.id;
    const targetId  = req.params.targetId;

    if (currentId === targetId)
      return res.status(400).json({ msg: 'You cannot follow yourself' });

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentId),
      User.findById(targetId)
    ]);

    if (!targetUser) return res.status(404).json({ msg: 'User not found' });

    // Already following?
    if (currentUser.following.some(id => id.toString() === targetId)) {
      return res.status(400).json({ msg: 'Already following this user' });
    }

    // Atomic update on both sides
    await Promise.all([
      User.findByIdAndUpdate(currentId, { $addToSet: { following: targetId } }),
      User.findByIdAndUpdate(targetId,  { $addToSet: { followers: currentId } })
    ]);

    res.json({ msg: 'Followed', targetId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ── POST /api/social/unfollow/:targetId ─────────────────────────────────────
router.post('/unfollow/:targetId', auth, async (req, res) => {
  try {
    const currentId = req.user.id;
    const targetId  = req.params.targetId;

    await Promise.all([
      User.findByIdAndUpdate(currentId, { $pull: { following: targetId } }),
      User.findByIdAndUpdate(targetId,  { $pull: { followers: currentId } })
    ]);

    res.json({ msg: 'Unfollowed', targetId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
