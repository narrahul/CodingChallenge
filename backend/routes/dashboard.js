const express = require('express');
const pool = require('../config/database');
const { authenticateToken, isAdmin, isStoreOwner } = require('../middleware/auth');

const router = express.Router();

router.get('/admin', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [usersCount, storesCount, ratingsCount] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM stores'),
      pool.query('SELECT COUNT(*) as count FROM ratings')
    ]);

    res.json({
      totalUsers: parseInt(usersCount.rows[0].count),
      totalStores: parseInt(storesCount.rows[0].count),
      totalRatings: parseInt(ratingsCount.rows[0].count)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/store-owner', authenticateToken, isStoreOwner, async (req, res) => {
  try {
    const userId = req.user.id;

    const store = await pool.query(
      'SELECT id, name FROM stores WHERE owner_id = $1',
      [userId]
    );

    if (store.rows.length === 0) {
      return res.status(404).json({ message: 'No store found for this user' });
    }

    const storeId = store.rows[0].id;

    const [averageRating, ratingsCount, usersWithRatings] = await Promise.all([
      pool.query(
        'SELECT COALESCE(AVG(rating), 0) as average_rating FROM ratings WHERE store_id = $1',
        [storeId]
      ),
      pool.query(
        'SELECT COUNT(*) as count FROM ratings WHERE store_id = $1',
        [storeId]
      ),
      pool.query(
        `SELECT u.id, u.name, u.email, r.rating, r.created_at
         FROM users u
         JOIN ratings r ON u.id = r.user_id
         WHERE r.store_id = $1
         ORDER BY r.created_at DESC`,
        [storeId]
      )
    ]);

    res.json({
      store: store.rows[0],
      averageRating: parseFloat(averageRating.rows[0].average_rating),
      totalRatings: parseInt(ratingsCount.rows[0].count),
      usersWithRatings: usersWithRatings.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 