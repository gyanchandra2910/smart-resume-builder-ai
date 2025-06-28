const express = require('express');
const { 
    submitReview, 
    getResumeReviews, 
    getReviewerStats, 
    getReviewerLeaderboard,
    getReviewerReviews 
} = require('../controllers/reviewController');

const router = express.Router();

// POST /api/review/submit - Submit a new review
router.post('/submit', submitReview);

// GET /api/review/resume/:resumeId - Get all reviews for a specific resume
router.get('/resume/:resumeId', getResumeReviews);

// GET /api/review/reviewer/:reviewerId/stats - Get reviewer's XP and stats
router.get('/reviewer/:reviewerId/stats', getReviewerStats);

// GET /api/review/reviewer/:reviewerId/reviews - Get all reviews by a reviewer
router.get('/reviewer/:reviewerId/reviews', getReviewerReviews);

// GET /api/review/leaderboard - Get top reviewers leaderboard
router.get('/leaderboard', getReviewerLeaderboard);

module.exports = router;
