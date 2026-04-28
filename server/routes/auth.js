const express = require('express');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const auth    = require('../middleware/auth');

const router = express.Router();

// Helper: generate JWT
const makeToken = (userId) =>
  jwt.sign({ user: { id: userId } }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });

// ── POST /api/auth/register ─────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    if (!name || !email || !password || !username)
      return res.status(400).json({ msg: 'All fields are required' });

    if (password.length < 6)
      return res.status(400).json({ msg: 'Password must be at least 6 characters' });

    if (!/^[a-zA-Z0-9_.]+$/.test(username))
      return res.status(400).json({ msg: 'Username: only letters, numbers, _ and .' });

    // Check duplicates
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      const field = exists.email === email.toLowerCase() ? 'Email' : 'Username';
      return res.status(400).json({ msg: `${field} already in use` });
    }

    // Default avatar using DiceBear
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}&backgroundColor=b6e3f4`;

    const user = new User({ name, email, password, username, avatar });
    await user.save();

    const token = makeToken(user._id);
    res.status(201).json({ token, user: user.toPublic() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// ── POST /api/auth/login ────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ msg: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const match = await user.matchPassword(password);
    if (!match) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = makeToken(user._id);
    res.json({ token, user: user.toPublic() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ── GET /api/auth/me ────────────────────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user.toPublic());
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ── PUT /api/auth/profile ───────────────────────────────────────────────────
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, bio, avatar, coverPhoto, username } = req.body;
    const updates = {};

    if (name)       updates.name       = name;
    if (bio !== undefined) updates.bio = bio;
    if (avatar)     updates.avatar     = avatar;
    if (coverPhoto !== undefined) updates.coverPhoto = coverPhoto;

    // Username change — ensure uniqueness
    if (username) {
      const taken = await User.findOne({ username, _id: { $ne: req.user.id } });
      if (taken) return res.status(400).json({ msg: 'Username already taken' });
      updates.username = username;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user.toPublic());
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;

