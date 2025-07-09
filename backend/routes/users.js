const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { userValidation } = require('../utils/validation');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, isAdmin, userValidation, async (req, res) => {
  try {
    const { name, email, password, address, role = 'user' } = req.body;

    const userExists = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role',
      [name, email, hashedPassword, address, role]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: newUser.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    let query = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
             COALESCE(AVG(r.rating), 0) as average_rating
      FROM users u
      LEFT JOIN stores s ON u.id = s.owner_id
      LEFT JOIN ratings r ON s.id = r.store_id
    `;
    
    const conditions = [];
    const params = [];
    let paramCount = 0;

    if (name) {
      paramCount++;
      conditions.push(`u.name ILIKE $${paramCount}`);
      params.push(`%${name}%`);
    }

    if (email) {
      paramCount++;
      conditions.push(`u.email ILIKE $${paramCount}`);
      params.push(`%${email}%`);
    }

    if (address) {
      paramCount++;
      conditions.push(`u.address ILIKE $${paramCount}`);
      params.push(`%${address}%`);
    }

    if (role) {
      paramCount++;
      conditions.push(`u.role = $${paramCount}`);
      params.push(role);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` GROUP BY u.id, u.name, u.email, u.address, u.role, u.created_at`;
    
    // Validate sortBy to prevent SQL injection and ensure valid column
    const validSortColumns = ['name', 'email', 'address', 'role', 'created_at'];
    const validSortOrders = ['asc', 'desc'];
    
    if (!validSortColumns.includes(sortBy)) {
      sortBy = 'name';
    }
    if (!validSortOrders.includes(sortOrder.toLowerCase())) {
      sortOrder = 'asc';
    }
    
    query += ` ORDER BY u.${sortBy} ${sortOrder.toUpperCase()}`;

    const result = await pool.query(query, params);

    res.json({
      users: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await pool.query(
      `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
              COALESCE(AVG(r.rating), 0) as average_rating
       FROM users u
       LEFT JOIN stores s ON u.id = s.owner_id
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE u.id = $1
       GROUP BY u.id, u.name, u.email, u.address, u.role, u.created_at`,
      [id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: user.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 