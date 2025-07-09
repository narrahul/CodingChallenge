const express = require('express');
const pool = require('../config/database');
const { ratingValidation } = require('../utils/validation');
const { authenticateToken, isUser } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, isUser, ratingValidation, async (req, res) => {
  try {
    const { store_id, rating } = req.body;
    const user_id = req.user.id;

    const storeExists = await pool.query(
      'SELECT id FROM stores WHERE id = $1',
      [store_id]
    );

    if (storeExists.rows.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Use UPSERT to handle both insert and update
    const result = await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (user_id, store_id) 
       DO UPDATE SET rating = $3
       RETURNING id, user_id, store_id, rating`,
      [user_id, store_id, rating]
    );

    const message = 'Rating submitted successfully';

    res.status(201).json({
      message,
      rating: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authenticateToken, isUser, ratingValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const user_id = req.user.id;

    const existingRating = await pool.query(
      'SELECT id FROM ratings WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );

    if (existingRating.rows.length === 0) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    const updatedRating = await pool.query(
      'UPDATE ratings SET rating = $1 WHERE id = $2 RETURNING id, user_id, store_id, rating',
      [rating, id]
    );

    res.json({
      message: 'Rating updated successfully',
      rating: updatedRating.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/store/:storeId', authenticateToken, isUser, async (req, res) => {
  try {
    const { storeId } = req.params;
    const user_id = req.user.id;

    const ratings = await pool.query(
      `SELECT r.id, r.rating, r.created_at, u.name as user_name
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = $1
       ORDER BY r.created_at DESC`,
      [storeId]
    );

    const userRating = await pool.query(
      'SELECT rating FROM ratings WHERE user_id = $1 AND store_id = $2',
      [user_id, storeId]
    );

    res.json({
      ratings: ratings.rows,
      userRating: userRating.rows[0]?.rating || null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 