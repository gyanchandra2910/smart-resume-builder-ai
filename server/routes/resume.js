const express = require('express');
const { createResume, getResume, getAllResumes, getPublicResume, generateCoverLetter, deleteResume } = require('../controllers/resumeController');

const router = express.Router();

// POST /api/resume/input - Create new resume
router.post('/input', createResume);

// POST /api/resume/generateCoverLetter - Generate cover letter
router.post('/generateCoverLetter', generateCoverLetter);

// GET /api/resume/public/:id - Get public resume view (for sharing)
router.get('/public/:id', getPublicResume);

// GET /api/resume/:id - Get resume by ID (API response)
router.get('/:id', getResume);

// DELETE /api/resume/:id - Delete resume by ID
router.delete('/:id', deleteResume);

// GET /api/resume - Get all resumes
router.get('/', getAllResumes);

module.exports = router;
