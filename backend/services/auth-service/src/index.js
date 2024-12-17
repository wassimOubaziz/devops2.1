const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const { sequelize } = require('./config/database');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow common HTTP methods
  allowedHeaders: 'Content-Type,Authorization', // Allow common headers
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Database connection
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL database');
    
    // Sync database models
    await sequelize.sync();
    console.log('Database models synchronized');
  } catch (error) {
    console.log('Database connection error:', error);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 3001;

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`);
  });
});
