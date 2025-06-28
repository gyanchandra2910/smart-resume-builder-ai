const Review = require('../models/Review');
const ReviewerXP = require('../models/ReviewerXP');
const Resume = require('../models/Resume');
const mongoose = require('mongoose');

// Submit a new review
const submitReview = async (req, res) => {
    try {
        const { reviewerId, reviewedUserId, resumeId, score, feedback, flags } = req.body;

        // Validation
        if (!reviewerId || !reviewedUserId || !resumeId || !score || !feedback) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided: reviewerId, reviewedUserId, resumeId, score, feedback'
            });
        }

        // Validate ObjectId formats
        if (!mongoose.Types.ObjectId.isValid(reviewerId) || 
            !mongoose.Types.ObjectId.isValid(reviewedUserId) || 
            !mongoose.Types.ObjectId.isValid(resumeId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID format provided'
            });
        }

        // Prevent self-review
        if (reviewerId === reviewedUserId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot review your own resume'
            });
        }

        // Validate score
        if (score < 1 || score > 5 || !Number.isInteger(score)) {
            return res.status(400).json({
                success: false,
                message: 'Score must be an integer between 1 and 5'
            });
        }

        // Check if resume exists
        const resume = await Resume.findById(resumeId);
        if (!resume) {
            // For demo purposes, allow reviews of non-existent resumes
            if (resumeId === '67759a1b2c3d4e5f6789abc0') {
                console.log('Demo resume review detected, proceeding...');
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'Resume not found'
                });
            }
        }

        // Check for duplicate review
        const existingReview = await Review.findOne({
            reviewerId: reviewerId,
            resumeId: resumeId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this resume'
            });
        }

        // Create new review
        const review = new Review({
            reviewerId,
            reviewedUserId,
            resumeId,
            score,
            feedback: feedback.trim(),
            flags: flags || []
        });

        // Save review
        await review.save();

        // Update or create reviewer XP
        let reviewerXP = await ReviewerXP.findOne({ reviewerId });
        
        if (!reviewerXP) {
            reviewerXP = new ReviewerXP({ reviewerId });
        }

        // Add XP and update stats
        const xpResult = reviewerXP.addXP(10); // +10 XP per review
        reviewerXP.totalReviews += 1;
        reviewerXP.lastReviewAt = new Date();

        // Update average rating given
        const allReviews = await Review.find({ reviewerId });
        const avgRating = allReviews.reduce((sum, r) => sum + r.score, 0) / allReviews.length;
        reviewerXP.averageRatingGiven = avgRating;

        // Check for new badges
        const newBadges = reviewerXP.checkAndAwardBadges();

        // Save reviewer XP
        await reviewerXP.save();

        // Populate review for response
        await review.populate('reviewerId', 'name email');
        await review.populate('reviewedUserId', 'name email');
        await review.populate('resumeId', 'name email roleAppliedFor');

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            data: {
                review,
                xpGained: 10,
                levelUp: xpResult.leveledUp,
                newLevel: xpResult.newLevel,
                totalXP: xpResult.totalXP,
                newBadges
            }
        });

    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting review',
            error: error.message
        });
    }
};

// Get reviews for a specific resume
const getResumeReviews = async (req, res) => {
    try {
        const { resumeId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(resumeId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid resume ID format'
            });
        }

        const reviews = await Review.find({ resumeId })
            .populate('reviewerId', 'name email')
            .sort({ createdAt: -1 });

        // Calculate average score
        const averageScore = reviews.length > 0 
            ? reviews.reduce((sum, review) => sum + review.score, 0) / reviews.length 
            : 0;

        // Get flag frequency
        const flagFrequency = {};
        reviews.forEach(review => {
            review.flags.forEach(flag => {
                flagFrequency[flag] = (flagFrequency[flag] || 0) + 1;
            });
        });

        res.json({
            success: true,
            data: {
                reviews,
                stats: {
                    totalReviews: reviews.length,
                    averageScore: Math.round(averageScore * 10) / 10,
                    flagFrequency
                }
            }
        });

    } catch (error) {
        console.error('Error fetching resume reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews',
            error: error.message
        });
    }
};

// Get reviewer's XP and stats
const getReviewerStats = async (req, res) => {
    try {
        const { reviewerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(reviewerId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reviewer ID format'
            });
        }

        const reviewerXP = await ReviewerXP.findOne({ reviewerId })
            .populate('reviewerId', 'name email');

        if (!reviewerXP) {
            // Create new reviewer profile
            const newReviewerXP = new ReviewerXP({ reviewerId });
            await newReviewerXP.save();
            
            return res.json({
                success: true,
                data: newReviewerXP
            });
        }

        res.json({
            success: true,
            data: reviewerXP
        });

    } catch (error) {
        console.error('Error fetching reviewer stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviewer stats',
            error: error.message
        });
    }
};

// Get leaderboard of top reviewers
const getReviewerLeaderboard = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        const leaderboard = await ReviewerXP.find({})
            .populate('reviewerId', 'name email')
            .sort({ totalXP: -1, totalReviews: -1 })
            .limit(limit);

        res.json({
            success: true,
            data: leaderboard
        });

    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leaderboard',
            error: error.message
        });
    }
};

// Get all reviews by a specific reviewer
const getReviewerReviews = async (req, res) => {
    try {
        const { reviewerId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if (!mongoose.Types.ObjectId.isValid(reviewerId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reviewer ID format'
            });
        }

        const reviews = await Review.find({ reviewerId })
            .populate('resumeId', 'name email roleAppliedFor')
            .populate('reviewedUserId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalReviews = await Review.countDocuments({ reviewerId });

        res.json({
            success: true,
            data: {
                reviews,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalReviews / limit),
                    totalReviews,
                    hasNext: page * limit < totalReviews,
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error fetching reviewer reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviewer reviews',
            error: error.message
        });
    }
};

module.exports = {
    submitReview,
    getResumeReviews,
    getReviewerStats,
    getReviewerLeaderboard,
    getReviewerReviews
};
