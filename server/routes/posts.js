const express = require('express');
const Post    = require('../models/Post');
const User    = require('../models/User');
const auth    = require('../middleware/auth');

const router = express.Router();

// ── GET /api/posts  (feed + optional search) ────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    let query = {};

    if (q && q.trim()) {
      query = {
        $or: [
          { caption:             { $regex: q, $options: 'i' } },
          { 'tags.productName':  { $regex: q, $options: 'i' } },
          { username:            { $regex: q, $options: 'i' } }
        ]
      };
    }

    const posts = await Post.find(query).sort({ createdAt: -1 }).lean();
    // Attach virtual id for frontend compatibility
    const result = posts.map(p => ({ ...p, id: p._id.toString() }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ── GET /api/posts/user/:userId ─────────────────────────────────────────────
router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(posts.map(p => ({ ...p, id: p._id.toString() })));
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ── POST /api/posts ─────────────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { caption, mediaUrl, mediaType, tags } = req.body;

    if (!mediaUrl) return res.status(400).json({ msg: 'Media is required' });
    if (!caption || !caption.trim()) return res.status(400).json({ msg: 'Caption is required' });

    // Fetch fresh user data for avatar sync
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const post = new Post({
      userId:     req.user.id,
      username:   user.username,
      userAvatar: user.avatar,
      caption:    caption.trim(),
      mediaUrl,
      mediaType:  mediaType || 'image',
      tags:       tags || []
    });

    await post.save();
    const saved = post.toObject();
    res.status(201).json({ ...saved, id: saved._id.toString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ── PUT /api/posts/like/:id ─────────────────────────────────────────────────
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    const userId = req.user.id;
    const alreadyLiked = post.likes.some(id => id.toString() === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    // Return likes array as strings (frontend expects array of user ids)
    res.json(post.likes.map(id => id.toString()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ── DELETE /api/posts/:id ───────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    if (post.userId.toString() !== req.user.id)
      return res.status(403).json({ msg: 'Not authorized to delete this post' });

    await post.deleteOne();
    res.json({ msg: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
