const express = require('express');
const cors = require('cors');
const { sequelize } = require('./config/database');
const projectRoutes = require('./routes/project.routes');
const { logger } = require('./utils/logger');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/projects', projectRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Database connection
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Connected to PostgreSQL database');
    
    // Sync database models
    await sequelize.sync();
    logger.info('Database models synchronized');
  } catch (error) {
    logger.error('Database connection error:', error);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 3002;

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    logger.info(`Project service running on port ${PORT}`);
  });
});
