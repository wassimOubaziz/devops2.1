const express = require('express');
const { register, login, validateToken } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/validate', authenticate, validateToken);

module.exports = router;
