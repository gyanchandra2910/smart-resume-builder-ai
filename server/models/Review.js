const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    // Reviewer information
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // User being reviewed
    reviewedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Resume being reviewed
    resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        required: true
    },
    
    // Rating score (1-5 stars)
    score: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: function(v) {
                return Number.isInteger(v) && v >= 1 && v <= 5;
            },
            message: 'Score must be an integer between 1 and 5'
        }
    },
    
    // Written feedback
    feedback: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000,
        minlength: 10
    },
    
    // Review flags/categories
    flags: [{
        type: String,
        enum: [
            'weak verbs',
            'missing metrics',
            'unclear objectives',
            'formatting issues',
            'grammatical errors',
            'irrelevant information',
            'missing key skills',
            'insufficient experience detail',
            'poor structure',
            'typos',
            'outdated information',
            'missing contact info'
        ]
    }],
    
    // Review metadata
    isHelpful: {
        type: Boolean,
        default: false
    },
    
    helpfulVotes: {
        type: Number,
        default: 0
    },
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for performance
reviewSchema.index({ resumeId: 1, createdAt: -1 });
reviewSchema.index({ reviewerId: 1 });
reviewSchema.index({ reviewedUserId: 1 });
reviewSchema.index({ score: 1 });

// Validation to prevent self-review
reviewSchema.pre('save', function(next) {
    if (this.reviewerId.equals(this.reviewedUserId)) {
        next(new Error('Cannot review your own resume'));
    } else {
        next();
    }
});

// Virtual for review summary
reviewSchema.virtual('summary').get(function() {
    return {
        score: this.score,
        flagCount: this.flags.length,
        feedbackLength: this.feedback.length,
        isRecent: (Date.now() - this.createdAt) < (7 * 24 * 60 * 60 * 1000) // Within 7 days
    };
});

module.exports = mongoose.model('Review', reviewSchema);
