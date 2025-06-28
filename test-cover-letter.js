/**
 * Test script for cover letter generation API
 * Run with: node test-cover-letter.js
 */

const axios = require('axios');

// Test data
const testResumeData = {
    fullName: "John Smith",
    email: "john.smith@email.com",
    phone: "555-123-4567",
    careerObjective: "Experienced software developer seeking challenging opportunities in full-stack development",
    experience: [
        {
            role: "Senior Software Developer",
            company: "Tech Solutions Inc",
            duration: "2020-2023",
            description: "Led development of scalable web applications using React and Node.js. Improved system performance by 40% and mentored junior developers."
        },
        {
            role: "Software Developer",
            company: "StartupCorp",
            duration: "2018-2020",
            description: "Developed REST APIs and integrated third-party services. Collaborated with cross-functional teams to deliver high-quality software solutions."
        }
    ],
    skills: ["JavaScript", "React", "Node.js", "Python", "SQL", "Git", "Docker", "AWS"]
};

async function testCoverLetterGeneration() {
    console.log('🧪 Testing Cover Letter Generation API...\n');

    try {
        // Test 1: Valid request
        console.log('Test 1: Valid cover letter request');
        const response1 = await axios.post('http://localhost:5000/api/resume/generateCoverLetter', {
            role: "Full Stack Developer",
            companyName: "Google",
            resumeData: testResumeData
        });
        
        console.log('✅ Test 1 Success:', {
            success: response1.data.success,
            isTemplate: response1.data.data?.isTemplate,
            wordCount: response1.data.data?.wordCount,
            message: response1.data.message
        });
        console.log('Cover Letter Preview:', response1.data.data.coverLetter.substring(0, 200) + '...\n');

    } catch (error) {
        console.log('❌ Test 1 Failed:', error.response?.data?.message || error.message);
    }

    try {
        // Test 2: Missing role
        console.log('Test 2: Missing role (should fail)');
        const response2 = await axios.post('http://localhost:5000/api/resume/generateCoverLetter', {
            resumeData: testResumeData
        });
        
        console.log('❌ Test 2 Should have failed but succeeded');

    } catch (error) {
        console.log('✅ Test 2 Expected failure:', error.response?.data?.message);
    }

    try {
        // Test 3: Minimal data
        console.log('\nTest 3: Minimal resume data');
        const response3 = await axios.post('http://localhost:5000/api/resume/generateCoverLetter', {
            role: "Software Engineer",
            resumeData: {
                fullName: "Jane Doe",
                careerObjective: "Recent computer science graduate",
                skills: ["Python", "Java"]
            }
        });
        
        console.log('✅ Test 3 Success:', {
            success: response3.data.success,
            isTemplate: response3.data.data?.isTemplate,
            wordCount: response3.data.data?.wordCount
        });

    } catch (error) {
        console.log('❌ Test 3 Failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🏁 Cover letter testing completed!');
}

// Run tests if server is running
testCoverLetterGeneration().catch(error => {
    console.error('❌ Test runner error:', error.message);
    console.log('\n💡 Make sure the server is running on http://localhost:5000');
});
