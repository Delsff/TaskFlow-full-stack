const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes')

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes)

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log('Successfully connected to MongoDB!'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

app.get('/api/test', (req, res) => {
  res.json({ message: 'The server and database are running perfectly!' });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send('API is running...');
});