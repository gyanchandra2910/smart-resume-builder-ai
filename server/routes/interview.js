/**
 * Interview Routes
 * Handles interview-related API endpoints
 */

const express = require('express');
const router = express.Router();
const { generateInterviewQuestions } = require('../controllers/interviewController');
const requireAuth = require('../middleware/auth');

// POST /api/interview/questions - Generate tailored interview questions
router.post('/questions', requireAuth, generateInterviewQuestions);

module.exports = router;
