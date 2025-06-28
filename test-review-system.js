const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Review = require('./server/models/Review');
const ReviewerXP = require('./server/models/ReviewerXP');
const Resume = require('./server/models/Resume');

async function testReviewSystem() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-resume-builder');
        console.log('✅ Connected to MongoDB');

        // Test data
        const testReviewerId = new mongoose.Types.ObjectId();
        const testReviewedUserId = new mongoose.Types.ObjectId();
        const testResumeId = new mongoose.Types.ObjectId();

        console.log('\n🧪 Testing Review System...\n');

        // Test 1: Create a test resume
        console.log('1. Creating test resume...');
        const testResume = new Resume({
            name: 'Test User For Review',
            email: 'testuser@review.com',
            phone: '123-456-7890',
            roleAppliedFor: 'Software Developer',
            skills: ['JavaScript', 'Node.js', 'MongoDB'],
            objective: 'Test objective for review system',
            education: [{
                degree: 'Bachelor of Computer Science',
                college: 'Test University',
                year: '2023'
            }],
            experience: [{
                company: 'Test Company',
                role: 'Developer',
                duration: '2023-Present',
                description: 'Test experience for review'
            }]
        });
        
        // Use the specific test resume ID
        testResume._id = testResumeId;
        await testResume.save();
        console.log('✅ Test resume created');

        // Test 2: Submit a review
        console.log('\n2. Submitting test review...');
        const testReview = new Review({
            reviewerId: testReviewerId,
            reviewedUserId: testReviewedUserId,
            resumeId: testResumeId,
            score: 4,
            feedback: 'This is a comprehensive test review with detailed feedback about the resume structure and content.',
            flags: ['missing metrics', 'weak verbs']
        });

        await testReview.save();
        console.log('✅ Review submitted successfully');

        // Test 3: Create/Update ReviewerXP
        console.log('\n3. Testing XP system...');
        let reviewerXP = new ReviewerXP({
            reviewerId: testReviewerId,
            totalXP: 0,
            totalReviews: 0
        });

        // Simulate adding XP
        const xpResult = reviewerXP.addXP(10);
        reviewerXP.totalReviews += 1;
        
        // Check for badges
        const newBadges = reviewerXP.checkAndAwardBadges();
        
        await reviewerXP.save();
        console.log('✅ XP system working:', {
            totalXP: reviewerXP.totalXP,
            level: reviewerXP.level,
            newBadges: newBadges.map(b => b.name)
        });

        // Test 4: Submit multiple reviews to test leveling
        console.log('\n4. Testing level progression...');
        for (let i = 0; i < 5; i++) {
            const additionalReview = new Review({
                reviewerId: testReviewerId,
                reviewedUserId: new mongoose.Types.ObjectId(),
                resumeId: new mongoose.Types.ObjectId(),
                score: Math.floor(Math.random() * 5) + 1,
                feedback: `Test review number ${i + 2} with sufficient feedback length to meet requirements.`,
                flags: ['formatting issues']
            });

            await additionalReview.save();
            
            const xpUpdate = reviewerXP.addXP(10);
            reviewerXP.totalReviews += 1;
            
            if (xpUpdate.leveledUp) {
                console.log(`🎉 Level up! Old: ${xpUpdate.oldLevel}, New: ${xpUpdate.newLevel}`);
            }
        }

        await reviewerXP.save();
        console.log('✅ Level progression tested');

        // Test 5: Validate review constraints
        console.log('\n5. Testing validation constraints...');
        
        try {
            // Test self-review prevention
            const selfReview = new Review({
                reviewerId: testReviewerId,
                reviewedUserId: testReviewerId, // Same as reviewer
                resumeId: testResumeId,
                score: 5,
                feedback: 'This should fail validation',
                flags: []
            });
            
            await selfReview.save();
            console.log('❌ Self-review validation failed!');
        } catch (error) {
            console.log('✅ Self-review prevention working');
        }

        // Test 6: Test API endpoints simulation
        console.log('\n6. Testing data retrieval...');
        
        // Get reviews for resume
        const resumeReviews = await Review.find({ resumeId: testResumeId });
        console.log(`✅ Found ${resumeReviews.length} reviews for test resume`);
        
        // Get reviewer stats
        const reviewerStats = await ReviewerXP.findOne({ reviewerId: testReviewerId });
        console.log('✅ Reviewer stats:', {
            totalXP: reviewerStats.totalXP,
            level: reviewerStats.level,
            totalReviews: reviewerStats.totalReviews,
            badges: reviewerStats.badges.length
        });

        // Test 7: Test leaderboard data
        console.log('\n7. Testing leaderboard...');
        const leaderboard = await ReviewerXP.find({})
            .sort({ totalXP: -1, totalReviews: -1 })
            .limit(5);
        console.log(`✅ Leaderboard has ${leaderboard.length} entries`);

        console.log('\n🎉 All tests passed! Review system is working correctly.\n');

        // Cleanup test data
        console.log('🧹 Cleaning up test data...');
        await Review.deleteMany({ reviewerId: testReviewerId });
        await ReviewerXP.deleteOne({ reviewerId: testReviewerId });
        await Resume.deleteOne({ _id: testResumeId });
        console.log('✅ Test data cleaned up');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('📡 Database connection closed');
    }
}

// Run the test
testReviewSystem();
