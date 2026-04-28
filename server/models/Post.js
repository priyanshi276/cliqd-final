const mongoose = require('mongoose');

// A tag is a shoppable product pinned to an X/Y position on the image
const TagSchema = new mongoose.Schema({
  id:          { type: String, required: true },        // uuid from client
  productName: { type: String, required: true },
  price:       { type: String, default: '' },
  link:        { type: String, default: '#' },
  x:           { type: Number, required: true },        // percentage 0-100
  y:           { type: Number, required: true }
}, { _id: false });

const PostSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username:    { type: String, required: true },
  userAvatar:  { type: String, default: '' },
  caption:     { type: String, default: '', maxlength: 2200 },
  mediaUrl:    { type: String, required: true },        // base64 or URL
  mediaType:   { type: String, enum: ['image', 'video'], default: 'image' },
  tags:        [TagSchema],
  likes:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt:   { type: Date, default: Date.now }
});

// Text index for search
PostSchema.index({ caption: 'text', 'tags.productName': 'text' });

module.exports = mongoose.model('Post', PostSchema);
