const express = require('express');
const { createResume, getResume, getAllResumes, getPublicResume, generateCoverLetter, deleteResume } = require('../controllers/resumeController');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// GET /api/resume/public/:id - Get public resume view (for sharing)
router.get('/public/:id', getPublicResume);

// POST /api/resume/input - Create new resume
router.post('/input', requireAuth, createResume);

// POST /api/resume/generateCoverLetter - Generate cover letter
router.post('/generateCoverLetter', requireAuth, generateCoverLetter);

// GET /api/resume/:id - Get resume by ID (API response)
router.get('/:id', requireAuth, getResume);

// DELETE /api/resume/:id - Delete resume by ID
router.delete('/:id', requireAuth, deleteResume);

// GET /api/resume - Get all resumes
router.get('/', requireAuth, getAllResumes);

module.exports = router;
