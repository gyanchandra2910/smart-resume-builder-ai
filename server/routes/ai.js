const express = require('express');
const { generateSummary } = require('../controllers/aiController');

const router = express.Router();

// POST /api/resume/generateSummary - Generate AI-powered resume summary
router.post('/generateSummary', generateSummary);

module.exports = router;
