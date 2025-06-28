const express = require('express');
const { createResume, getResume, getAllResumes, getPublicResume } = require('../controllers/resumeController');

const router = express.Router();

// POST /api/resume/input - Create new resume
router.post('/input', createResume);

// GET /api/resume/public/:id - Get public resume view (for sharing)
router.get('/public/:id', getPublicResume);

// GET /api/resume/:id - Get resume by ID (API response)
router.get('/:id', getResume);

// GET /api/resume - Get all resumes
router.get('/', getAllResumes);

module.exports = router;
