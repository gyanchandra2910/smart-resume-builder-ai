const express = require('express');
const { generateSummary } = require('../controllers/aiController');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// POST /api/resume/generateSummary - Generate AI-powered resume summary
router.post('/generateSummary', requireAuth, generateSummary);

module.exports = router;
