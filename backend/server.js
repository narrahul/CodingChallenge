const express = require('express');
const cors = require('cors');
require('dotenv').config();

const auth = require('./routes/auth');
const users = require('./routes/users');
const stores = require('./routes/stores');
const ratings = require('./routes/ratings');
const dashboard = require('./routes/dashboard');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/stores', stores);
app.use('/api/ratings', ratings);
app.use('/api/dashboard', dashboard);

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

app.listen(port, () => {
  // Server started successfully
}); 