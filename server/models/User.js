const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  username:   { type: String, required: true, unique: true, lowercase: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:   { type: String, required: true, minlength: 6 },
  avatar:     { type: String, default: '' },
  coverPhoto: { type: String, default: '' },
  bio:        { type: String, default: '', maxlength: 200 },
  followers:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt:  { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password helper
UserSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

// Return safe public object (no password)
UserSchema.methods.toPublic = function () {
  const obj = this.toObject();
  delete obj.password;
  obj.id = obj._id.toString();
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
