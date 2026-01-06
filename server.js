const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

app.use(cors());
app.use(express.json());

// Create table if not exists
pool.query(`
  CREATE TABLE IF NOT EXISTS settlements (
    id SERIAL PRIMARY KEY,
    deposit_scheduled_amount DECIMAL(10,2),
    store_id VARCHAR(255),
    settlement_date DATE,
    settlement_deposit_date DATE,
    settlement_limit DECIMAL(10,2),
    remaining_settlement_limit DECIMAL(10,2),
    daily_settlement_amount DECIMAL(10,2),
    unpaid_settlement_amount DECIMAL(10,2),
    scheduled_deposit_amount DECIMAL(10,2)
  );
`, (err) => {
  if (err) {
    console.error('Error creating table:', err);
  } else {
    console.log('Table settlements created or already exists');
  }
});

// CRUD APIs

// Create
app.post('/api/settlements', async (req, res) => {
  const {
    deposit_scheduled_amount,
    store_id,
    settlement_date,
    settlement_deposit_date,
    settlement_limit,
    remaining_settlement_limit,
    daily_settlement_amount,
    unpaid_settlement_amount,
    scheduled_deposit_amount
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO settlements (
        deposit_scheduled_amount,
        store_id,
        settlement_date,
        settlement_deposit_date,
        settlement_limit,
        remaining_settlement_limit,
        daily_settlement_amount,
        unpaid_settlement_amount,
        scheduled_deposit_amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        deposit_scheduled_amount,
        store_id,
        settlement_date,
        settlement_deposit_date,
        settlement_limit,
        remaining_settlement_limit,
        daily_settlement_amount,
        unpaid_settlement_amount,
        scheduled_deposit_amount
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read all
app.get('/api/settlements', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settlements');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
app.put('/api/settlements/:id', async (req, res) => {
  const { id } = req.params;
  const {
    deposit_scheduled_amount,
    store_id,
    settlement_date,
    settlement_deposit_date,
    settlement_limit,
    remaining_settlement_limit,
    daily_settlement_amount,
    unpaid_settlement_amount,
    scheduled_deposit_amount
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE settlements SET
        deposit_scheduled_amount = $1,
        store_id = $2,
        settlement_date = $3,
        settlement_deposit_date = $4,
        settlement_limit = $5,
        remaining_settlement_limit = $6,
        daily_settlement_amount = $7,
        unpaid_settlement_amount = $8,
        scheduled_deposit_amount = $9
      WHERE id = $10 RETURNING *`,
      [
        deposit_scheduled_amount,
        store_id,
        settlement_date,
        settlement_deposit_date,
        settlement_limit,
        remaining_settlement_limit,
        daily_settlement_amount,
        unpaid_settlement_amount,
        scheduled_deposit_amount,
        id
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Settlement not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
app.delete('/api/settlements/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM settlements WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Settlement not found' });
    }
    res.json({ message: 'Settlement deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
