const express = require('express');
const { createResume, getResume, getAllResumes } = require('../controllers/resumeController');

const router = express.Router();

// POST /api/resume/input - Create new resume
router.post('/input', createResume);

// GET /api/resume/:id - Get resume by ID
router.get('/:id', getResume);

// GET /api/resume - Get all resumes
router.get('/', getAllResumes);

module.exports = router;
