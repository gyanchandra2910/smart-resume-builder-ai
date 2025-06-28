const express = require('express');
const { checkATSScore } = require('../controllers/atsController');

const router = express.Router();

// POST /api/resume/ats-check - Check ATS score and get suggestions
router.post('/ats-check', checkATSScore);

module.exports = router;
