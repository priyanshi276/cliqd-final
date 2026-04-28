/**
 * seed.js — run once to populate MongoDB with demo users
 * Usage:  node seed.js
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cliqd';

const demoUsers = [
  {
    name: 'Demo User', email: 'demo@cliqd.com', password: 'demo1234',
    username: 'demo',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo&backgroundColor=b6e3f4',
    bio: 'Just here to shop and discover 🛍️'
  },
  {
    name: 'Style Haus', email: 'stylehaus@cliqd.com', password: 'pass123',
    username: 'stylehaus',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=stylehaus&backgroundColor=b6e3f4',
    bio: 'Fashion forward. Always tagged. ✨'
  },
  {
    name: 'Urban Fits', email: 'urbanfits@cliqd.com', password: 'pass123',
    username: 'urban.fits',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=urbanfits&backgroundColor=c0aede',
    bio: 'Street style curator 🔥'
  },
  {
    name: 'Accessory Lab', email: 'accesslab@cliqd.com', password: 'pass123',
    username: 'accessory.lab',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=accesslab&backgroundColor=ffd5dc',
    bio: 'Jewellery & accessories obsessed 💎'
  },
  {
    name: 'Sneaker Vault', email: 'sneakervault@cliqd.com', password: 'pass123',
    username: 'sneaker.vault',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sneakervault&backgroundColor=d1d4f9',
    bio: 'Sneakerhead. Every drop documented. 👟'
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    for (const data of demoUsers) {
      const exists = await User.findOne({ email: data.email });
      if (!exists) {
        const user = new User(data);
        await user.save();
        console.log(`✅  Created: @${data.username}`);
      } else {
        console.log(`⚠️   Skipped (exists): @${data.username}`);
      }
    }

    console.log('\n🎉  Seeding complete!');
    console.log('Demo login → demo@cliqd.com / demo1234');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
