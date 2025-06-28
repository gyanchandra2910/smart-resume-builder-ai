const mongoose = require('mongoose');

const reviewerXPSchema = new mongoose.Schema({
    // Reviewer reference
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    
    // XP tracking
    totalXP: {
        type: Number,
        default: 0,
        min: 0
    },
    
    // Review statistics
    totalReviews: {
        type: Number,
        default: 0,
        min: 0
    },
    
    // Average rating given by this reviewer
    averageRatingGiven: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    
    // Reviewer level based on XP
    level: {
        type: Number,
        default: 1,
        min: 1
    },
    
    // Badges earned
    badges: [{
        name: {
            type: String,
            enum: [
                'First Review',
                'Helpful Reviewer', 
                'Detailed Critic',
                'Consistent Reviewer',
                'Expert Reviewer',
                'Master Reviewer',
                'Resume Guru'
            ]
        },
        earnedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Reputation score
    reputation: {
        type: Number,
        default: 100,
        min: 0
    },
    
    // Last review date
    lastReviewAt: {
        type: Date
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

// Indexes
reviewerXPSchema.index({ totalXP: -1 });
reviewerXPSchema.index({ level: -1 });
reviewerXPSchema.index({ reputation: -1 });

// Virtual for level calculation
reviewerXPSchema.virtual('calculatedLevel').get(function() {
    if (this.totalXP >= 1000) return 10; // Master
    if (this.totalXP >= 500) return 9;   // Expert
    if (this.totalXP >= 250) return 8;   // Advanced
    if (this.totalXP >= 150) return 7;   // Experienced
    if (this.totalXP >= 100) return 6;   // Skilled
    if (this.totalXP >= 70) return 5;    // Competent
    if (this.totalXP >= 50) return 4;    // Intermediate
    if (this.totalXP >= 30) return 3;    // Developing
    if (this.totalXP >= 20) return 2;    // Beginner
    return 1;                            // Novice
});

// Virtual for next level XP requirement
reviewerXPSchema.virtual('nextLevelXP').get(function() {
    const currentLevel = this.calculatedLevel;
    const xpThresholds = [0, 20, 30, 50, 70, 100, 150, 250, 500, 1000];
    return currentLevel < 10 ? xpThresholds[currentLevel] : null;
});

// Method to add XP and check for level up
reviewerXPSchema.methods.addXP = function(xpAmount) {
    const oldLevel = this.calculatedLevel;
    this.totalXP += xpAmount;
    this.level = this.calculatedLevel;
    
    const newLevel = this.calculatedLevel;
    const leveledUp = newLevel > oldLevel;
    
    return {
        leveledUp,
        oldLevel,
        newLevel,
        totalXP: this.totalXP
    };
};

// Method to award badges
reviewerXPSchema.methods.checkAndAwardBadges = function() {
    const newBadges = [];
    const existingBadgeNames = this.badges.map(b => b.name);
    
    // First Review badge
    if (this.totalReviews >= 1 && !existingBadgeNames.includes('First Review')) {
        newBadges.push({ name: 'First Review' });
    }
    
    // Detailed Critic badge (high average feedback length)
    if (this.totalReviews >= 5 && !existingBadgeNames.includes('Detailed Critic')) {
        newBadges.push({ name: 'Detailed Critic' });
    }
    
    // Consistent Reviewer badge
    if (this.totalReviews >= 10 && !existingBadgeNames.includes('Consistent Reviewer')) {
        newBadges.push({ name: 'Consistent Reviewer' });
    }
    
    // Expert Reviewer badge
    if (this.totalReviews >= 25 && !existingBadgeNames.includes('Expert Reviewer')) {
        newBadges.push({ name: 'Expert Reviewer' });
    }
    
    // Master Reviewer badge
    if (this.totalReviews >= 50 && !existingBadgeNames.includes('Master Reviewer')) {
        newBadges.push({ name: 'Master Reviewer' });
    }
    
    // Resume Guru badge
    if (this.totalReviews >= 100 && !existingBadgeNames.includes('Resume Guru')) {
        newBadges.push({ name: 'Resume Guru' });
    }
    
    // Add new badges
    this.badges.push(...newBadges);
    
    return newBadges;
};

module.exports = mongoose.model('ReviewerXP', reviewerXPSchema);
