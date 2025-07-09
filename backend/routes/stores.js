const express = require('express');
const pool = require('../config/database');
const { storeValidation } = require('../utils/validation');
const { authenticateToken, isAdmin, isUser } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, isAdmin, storeValidation, async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    const storeExists = await pool.query(
      'SELECT id FROM stores WHERE email = $1',
      [email]
    );

    if (storeExists.rows.length > 0) {
      return res.status(400).json({ message: 'Store already exists' });
    }

    const ownerExists = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND role = $2',
      [owner_id, 'store_owner']
    );

    if (ownerExists.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid store owner' });
    }

    const newStore = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING id, name, email, address, owner_id',
      [name, email, address, owner_id]
    );

    res.status(201).json({
      message: 'Store created successfully',
      store: newStore.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', authenticateToken, isUser, async (req, res) => {
  try {
    const { name, address, sortBy = 'name', sortOrder = 'asc' } = req.query;
    const userId = req.user.id;
    
    let query = `
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_ratings,
             ur.rating as user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = $1
    `;
    
    const conditions = [];
    const params = [userId];
    let paramCount = 1;

    if (name) {
      paramCount++;
      conditions.push(`s.name ILIKE $${paramCount}`);
      params.push(`%${name}%`);
    }

    if (address) {
      paramCount++;
      conditions.push(`s.address ILIKE $${paramCount}`);
      params.push(`%${address}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` GROUP BY s.id, s.name, s.email, s.address, s.created_at, ur.rating`;
    query += ` ORDER BY s.${sortBy} ${sortOrder.toUpperCase()}`;

    const result = await pool.query(query, params);

    res.json({
      stores: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/admin', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, email, address, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    let query = `
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_ratings,
             u.name as owner_name
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN users u ON s.owner_id = u.id
    `;
    
    const conditions = [];
    const params = [];
    let paramCount = 0;

    if (name) {
      paramCount++;
      conditions.push(`s.name ILIKE $${paramCount}`);
      params.push(`%${name}%`);
    }

    if (email) {
      paramCount++;
      conditions.push(`s.email ILIKE $${paramCount}`);
      params.push(`%${email}%`);
    }

    if (address) {
      paramCount++;
      conditions.push(`s.address ILIKE $${paramCount}`);
      params.push(`%${address}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` GROUP BY s.id, s.name, s.email, s.address, s.created_at, u.name`;
    query += ` ORDER BY s.${sortBy} ${sortOrder.toUpperCase()}`;

    const result = await pool.query(query, params);

    res.json({
      stores: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 