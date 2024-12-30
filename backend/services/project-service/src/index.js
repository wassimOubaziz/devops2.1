const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const projectRoutes = require('./routes/project.routes');
const { logger } = require('./utils/logger');
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
app.use('/api/projects', projectRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 3002;

// Initialize database and start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Connected to PostgreSQL database');
    
    await sequelize.sync({ alter: true });
    logger.info('Database models synchronized');

    app.listen(PORT, () => {
      logger.info(`Project service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
