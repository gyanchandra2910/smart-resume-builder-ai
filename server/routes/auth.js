const express = require('express');
const { signup, login } = require('../controllers/authController');

const router = express.Router();

// POST /signup
router.post('/signup', signup);

// POST /login
router.post('/login', login);

module.exports = router;
