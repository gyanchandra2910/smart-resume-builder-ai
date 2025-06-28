// Test file to verify the review system functionality
// Using curl commands for testing since fetch is not available in older Node versions

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const BASE_URL = 'http://localhost:5000';

async function runCurlCommand(command) {
    try {
        const { stdout, stderr } = await execPromise(command);
        if (stderr) {
            console.error('Error:', stderr);
            return null;
        }
        return JSON.parse(stdout);
    } catch (error) {
        console.error('Command failed:', error.message);
        return null;
    }
}

async function testReviewSystem() {
    console.log('🧪 Testing Review System...');
    
    try {
        // 1. Test loading all resumes
        console.log('1. Testing resume loading...');
        const resumesResult = await runCurlCommand(`curl -s "${BASE_URL}/api/resume"`);
        if (resumesResult) {
            console.log('✅ Resumes loaded:', resumesResult.success ? `${resumesResult.data.length} resumes found` : 'No resumes');
        }
        
        // 2. Test demo review submission
        console.log('2. Testing review submission...');
        const reviewData = {
            reviewerId: '67759a1b2c3d4e5f6789abcd',
            reviewedUserId: '67759a1b2c3d4e5f6789abce',
            resumeId: '67759a1b2c3d4e5f6789abc0', // Demo resume
            score: 4,
            feedback: 'This is a test review for the demo resume. The candidate shows good technical skills and experience.',
            flags: ['missing metrics', 'weak verbs']
        };
        
        const curlCommand = `curl -s -X POST "${BASE_URL}/api/review/submit" -H "Content-Type: application/json" -d '${JSON.stringify(reviewData)}'`;
        const reviewResult = await runCurlCommand(curlCommand);
        
        if (reviewResult) {
            console.log('✅ Review submission:', reviewResult.success ? 'SUCCESS' : `FAILED: ${reviewResult.message}`);
            
            if (reviewResult.success) {
                console.log('   XP gained:', reviewResult.data.xpGained);
                console.log('   Level up:', reviewResult.data.levelUp);
                console.log('   New level:', reviewResult.data.newLevel);
            }
        }
        
        // 3. Test reviewer stats
        console.log('3. Testing reviewer stats...');
        const statsResult = await runCurlCommand(`curl -s "${BASE_URL}/api/review/reviewer/67759a1b2c3d4e5f6789abcd/stats"`);
        if (statsResult) {
            console.log('✅ Reviewer stats:', statsResult.success ? `XP: ${statsResult.data.totalXP}, Level: ${statsResult.data.level}` : 'FAILED');
        }
        
        // 4. Test leaderboard
        console.log('4. Testing leaderboard...');
        const leaderboardResult = await runCurlCommand(`curl -s "${BASE_URL}/api/review/leaderboard"`);
        if (leaderboardResult) {
            console.log('✅ Leaderboard:', leaderboardResult.success ? `${leaderboardResult.data.length} entries` : 'FAILED');
        }
        
        console.log('🎉 Review system test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testReviewSystem();
