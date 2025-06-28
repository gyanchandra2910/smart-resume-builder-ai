/**
 * Interview Routes
 * Handles interview-related API endpoints
 */

const express = require('express');
const router = express.Router();
const { generateInterviewQuestions } = require('../controllers/interviewController');

// POST /api/interview/generate-questions - Generate tailored interview questions
router.post('/generate-questions', generateInterviewQuestions);

module.exports = router;
