const express = require('express');
const cors = require('cors');
const flowglad = require('@flowglad/server');
const bip39 = require('bip39');
const {
  JsonRpcProvider,
  Wallet,
  Contract,
  parseUnits,
  isAddress,
} = require('ethers');
const crypto = require('crypto');
const { Pool } = require('pg');
const db = new Pool({
  user: 'yapuser',
  host: process.env.DB_HOST || 'postgres',
  database: 'yapdb',
  password: '1234', // use your actual password
  port: 5432,
});

const bcrypt = require('bcryptjs'); // Add at the top if you want to hash passwords
const { assessPronunciation } = require('./azurePronunciation');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const upload = multer({ dest: 'uploads/' });

require('dotenv').config();

const SEI_RPC = 'https://evm-rpc-testnet.sei-apis.com';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;

const provider = new JsonRpcProvider(SEI_RPC);
const wallet = new Wallet(PRIVATE_KEY, provider);

const app = express();
app.use(cors());
app.use(express.json());

const tokenAbi = [
  'function transfer(address to, uint256 amount) public returns (bool)',
];

// Endpoint to redeem YAP token
app.post('/api/redeem-yap', async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress || !isAddress(walletAddress)) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid wallet address' });
    }

    const token = new Contract(TOKEN_ADDRESS, tokenAbi, wallet);
    const tx = await token.transfer(walletAddress, parseUnits('1', 18));
    await tx.wait();

    console.log(`Sent 1 YAP to ${walletAddress}: ${tx.hash}`);
    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    console.error('YAP transfer failed:', err);
    res.status(500).json({ success: false, error: 'Transfer failed' });
  }
});

// Function to send YAP token to a user's wallet
// This is called when a user completes a lesson
// It checks if the wallet address is valid, sends 1 YAP token, and returns
async function sendYAPToWallet(toAddress) {
  if (!isAddress(toAddress)) {
    throw new Error(`Invalid wallet address: ${toAddress}`);
  }
  const token = new Contract(TOKEN_ADDRESS, tokenAbi, wallet);
  const tx = await token.transfer(toAddress, parseUnits('1', 18));
  await tx.wait();
  console.log(`Sent 1 YAP to ${toAddress}, txHash=${tx.hash}`);
  return tx.hash;
}
// Endpoint to complete a lesson
// This will:
// 1) Check if the user has already completed this lesson
// 2) Send the YAP token to their wallet address
// 3) Record the completion in the user_lessons table
// 4) Respond with the transaction hash

// index.js (Express)

app.post('/api/complete-lesson', async (req, res) => {
  const { userId, walletAddress, lessonId } = req.body;

  try {
    // 1) Prevent double‑completions
    const { rows: already } = await db.query(
      `SELECT 1
         FROM user_lessons
        WHERE user_id   = $1
          AND lesson_id = $2`,
      [userId, lessonId]
    );
    if (already.length) {
      return res.status(400).json({ error: 'Lesson already completed.' });
    }

    // 2) Send 1 YAP on‑chain
    const txHash = await sendYAPToWallet(walletAddress);

    // 3) Record in user_lessons
    await db.query(
      `INSERT INTO user_lessons
           (user_id, lesson_id, completed_at, tx_hash)
         VALUES ($1, $2, NOW(), $3)`,
      [userId, lessonId, txHash]
    );

    // 4) Upsert into user_stats
    await db.query(
      `INSERT INTO user_stats
           (user_id, token_balance, current_streak, highest_streak, total_yap_earned)
         VALUES ($1, 1, 0, 0, 1)
         ON CONFLICT (user_id) DO UPDATE
           SET token_balance    = user_stats.token_balance   + 1,
               total_yap_earned = user_stats.total_yap_earned + 1,
               updated_at       = NOW()`,
      [userId]
    );

    // 5) Return success
    res.json({ success: true, txHash });

  } catch (err) {
    console.error('Lesson completion error:', err);
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/user-lessons/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await db.query(
      'SELECT lesson_id FROM user_lessons WHERE user_id = $1',
      [userId]
    );
    const completedLessons = result.rows.map((row) => row.lesson_id);
    res.json({ completedLessons });
  } catch (err) {
    console.error('Error fetching user lessons:', err);
    res.status(500).json({ error: 'Failed to fetch completed lessons' });
  }
});

// GET /api/user-stats/:userId
app.get('/api/user-stats/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const { rows } = await db.query(
      `SELECT token_balance,
              current_streak,
              highest_streak,
              total_yap_earned,
              updated_at
       FROM user_stats
       WHERE user_id = $1`,
      [userId]
    );
    if (rows.length === 0) {
      // Can auto create stats if not found if we need to
      return res.status(404).json({ error: 'Stats not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching user stats:', err);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

app.post('/api/user-stats/:userId/streak', async (req, res) => {
  const { userId } = req.params;
  const { currentStreak, highestStreak } = req.body;

  try {
    await db.query(
      `UPDATE user_stats
         SET current_streak = $2,
             highest_streak = GREATEST(highest_streak, $3),
             updated_at     = NOW()
       WHERE user_id = $1`,
      [userId, currentStreak, highestStreak]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating streak:', err);
    res.status(500).json({ error: 'Failed to update streak' });
  }
});


// Set your Flowglad secret key (from your dashboard)
flowglad.secretKey = process.env.FLOWGLAD_SECRET_KEY;

// Example endpoint to create a payment session
app.post('/api/create-payment-session', async (req, res) => {
  try {
    // You may want to get amount, user info, etc. from req.body
    const session = await flowglad.createSession({
      amount: 1000, // e.g., $10.00
      currency: 'usd',
      // ...other required fields
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Demo signup endpoint for mobile app
app.post('/api/auth/secure-signup', async (req, res) => {
  try {
    const { user_id, name, language_to_learn } = req.body;
    if (!user_id || !name || !language_to_learn) {
      return res
        .status(400)
        .json({ success: false, error: 'Missing required fields' });
    }

    // 1) Upsert into users
    await db.query(
      `INSERT INTO users (user_id, name, language_to_learn)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id)
         DO UPDATE SET name = EXCLUDED.name,
                       language_to_learn = EXCLUDED.language_to_learn`,
      [user_id, name, language_to_learn]
    );

    // 2) Initialize stats row with sensible defaults
    await db.query(
      `INSERT INTO user_stats 
         (user_id, token_balance, current_streak, highest_streak, total_yap_earned)
       VALUES ($1, 0, 1, 1, 0)
       ON CONFLICT (user_id) DO NOTHING`,
      [user_id]
    );

    return res.json({
      success: true,
      user_id,
      message: 'User (and stats) saved to DB successfully',
    });
  } catch (err) {
    console.error('Secure signup error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: 'Email and password are required.' });
    }

    // Find user by email
    const result = await db.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);
    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, error: 'Invalid email or password.' });
    }
    const user = result.rows[0];

    // Use bcrypt to compare password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, error: 'Invalid email or password.' });
    }

    // Generate a token (for demo, random string)
    const token = crypto.randomBytes(32).toString('hex');

    res.json({
      success: true,
      userId: user.user_id,
      token,
      name: user.name,
      email: user.email,
      sei_address: user.sei_address,
      eth_address: user.eth_address,
      message: 'Login successful!',
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// /api/profile/:userId
app.get('/api/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await db.query(
      'SELECT name, language_to_learn FROM users WHERE user_id = $1',
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Pronunciation Assessment Endpoint
app.post('/api/pronunciation-assessment', async (req, res) => {
  try {
    const { audioPath, referenceText } = req.body;
    if (!audioPath || !referenceText) {
      return res
        .status(400)
        .json({ error: 'audioPath and referenceText are required.' });
    }
    const result = await assessPronunciation(audioPath, referenceText);
    res.json(result);
  } catch (err) {
    console.error('Pronunciation assessment error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post(
  '/api/pronunciation-assessment-upload',
  upload.single('audio'),
  async (req, res) => {
    try {
      const { referenceText } = req.body;
      if (!req.file || !referenceText) {
        return res
          .status(400)
          .json({ error: 'audio and referenceText are required.' });
      }
      const webmPath = req.file.path;
      const wavPath = webmPath + '.wav';

      // Convert webm to wav (16kHz mono)
      await new Promise((resolve, reject) => {
        ffmpeg(webmPath)
          .audioChannels(1)
          .audioFrequency(16000)
          .toFormat('wav')
          .on('end', resolve)
          .on('error', reject)
          .save(wavPath);
      });

      // Log the size of the wav file
      const wavStats = fs.statSync(wavPath);
      console.log('Converted WAV file size:', wavStats.size, 'bytes');
      if (wavStats.size < 1000) {
        console.warn('WAV file is very small. Likely silent or invalid audio.');
      }

      // Call your existing assessment function
      const result = await assessPronunciation(wavPath, referenceText);

      // Don't delete the wav file yet
      // fs.unlinkSync(wavPath);

      res.json({
        ...result,
        wavUrl: `/uploads/${path.basename(wavPath)}`,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'yap-backend'
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
