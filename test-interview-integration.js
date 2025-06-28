/**
 * Test Interview Questions Integration
 * Tests the full integration between frontend and backend
 */

const fetch = require('node-fetch');

// Test data matching the frontend format
const testResumeData = {
    fullName: 'John Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    careerObjective: 'Seeking a challenging Software Developer position to utilize my skills in web development',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
    experience: [
        {
            role: 'Junior Developer',
            company: 'Tech Solutions Inc',
            duration: '2022-2024',
            description: 'Developed web applications using React and Node.js'
        }
    ],
    education: [
        {
            degree: 'Bachelor of Computer Science',
            institution: 'University of Technology',
            year: '2022'
        }
    ]
};

const testCases = [
    {
        name: 'Software Developer Position',
        data: {
            resumeData: testResumeData,
            jobTitle: 'Senior Software Developer',
            companyContext: 'Tech Startup',
            experienceLevel: 'mid'
        }
    },
    {
        name: 'Frontend Developer Position',
        data: {
            resumeData: testResumeData,
            jobTitle: 'Frontend Developer',
            companyContext: 'E-commerce Company',
            experienceLevel: 'mid'
        }
    },
    {
        name: 'Full Stack Developer Position',
        data: {
            resumeData: testResumeData,
            jobTitle: 'Full Stack Developer',
            companyContext: '',
            experienceLevel: 'senior'
        }
    }
];

async function testInterviewQuestionsAPI() {
    console.log('🧪 Testing Interview Questions API Integration...\n');
    
    for (const testCase of testCases) {
        console.log(`📋 Testing: ${testCase.name}`);
        console.log('📤 Request Data:', {
            jobTitle: testCase.data.jobTitle,
            companyContext: testCase.data.companyContext,
            experienceLevel: testCase.data.experienceLevel,
            hasResumeData: !!testCase.data.resumeData
        });
        
        try {
            const response = await fetch('http://localhost:5000/api/interview/questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testCase.data)
            });
            
            const result = await response.json();
            
            console.log('📥 Response Status:', response.status);
            console.log('✅ Response Data:', {
                success: result.success,
                questionCount: result.data?.questions?.length || 0,
                isTemplate: result.data?.isTemplate || false,
                aiModel: result.data?.aiModel || 'unknown',
                highlightedSkills: result.data?.highlightedSkills || [],
                message: result.message
            });
            
            if (result.success && result.data?.questions) {
                console.log('\n📝 Generated Questions:');
                result.data.questions.forEach((question, index) => {
                    console.log(`   ${index + 1}. ${question}`);
                });
                
                if (result.data.highlightedSkills?.length > 0) {
                    console.log('\n🏷️  Highlighted Skills:', result.data.highlightedSkills.join(', '));
                }
            } else {
                console.log('❌ Failed:', result.message || 'Unknown error');
            }
            
        } catch (error) {
            console.error('❌ Network Error:', error.message);
        }
        
        console.log('\n' + '─'.repeat(80) + '\n');
    }
}

// Error handling test
async function testErrorHandling() {
    console.log('🚨 Testing Error Handling...\n');
    
    const errorTestCases = [
        {
            name: 'Missing Resume Data',
            data: {
                jobTitle: 'Software Developer'
            }
        },
        {
            name: 'Missing Job Title',
            data: {
                resumeData: testResumeData
            }
        },
        {
            name: 'Empty Job Title',
            data: {
                resumeData: testResumeData,
                jobTitle: ''
            }
        }
    ];
    
    for (const testCase of errorTestCases) {
        console.log(`🧪 Testing: ${testCase.name}`);
        
        try {
            const response = await fetch('http://localhost:5000/api/interview/questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testCase.data)
            });
            
            const result = await response.json();
            
            console.log('📥 Status:', response.status);
            console.log('📝 Response:', {
                success: result.success,
                message: result.message,
                error: result.error
            });
            
        } catch (error) {
            console.error('❌ Network Error:', error.message);
        }
        
        console.log('\n' + '─'.repeat(50) + '\n');
    }
}

// Run tests
async function runTests() {
    try {
        await testInterviewQuestionsAPI();
        await testErrorHandling();
        console.log('✅ All tests completed!');
    } catch (error) {
        console.error('❌ Test suite failed:', error);
    }
}

// Check if server is running
async function checkServer() {
    try {
        const response = await fetch('http://localhost:5000');
        if (response.ok) {
            console.log('✅ Server is running on port 5000');
            return true;
        }
    } catch (error) {
        console.log('❌ Server not running on port 5000');
        console.log('Please start the server with: node server/index.js');
        return false;
    }
}

// Main execution
checkServer().then(isRunning => {
    if (isRunning) {
        runTests();
    }
});
