/**
 * Comprehensive Error Testing for Interview Questions Feature
 * Tests various error scenarios and validates error handling
 */

const testCases = [
    {
        name: 'Missing Resume Data',
        description: 'Test with completely missing resume data',
        data: {
            jobTitle: 'Software Developer'
        },
        expectedError: 'INVALID_RESUME_DATA'
    },
    {
        name: 'Empty Resume Data',
        description: 'Test with empty resume object',
        data: {
            resumeData: {},
            jobTitle: 'Software Developer'
        },
        expectedError: 'INVALID_RESUME_DATA'
    },
    {
        name: 'Missing Full Name',
        description: 'Test with resume missing full name',
        data: {
            resumeData: {
                email: 'test@example.com',
                skills: ['JavaScript']
            },
            jobTitle: 'Software Developer'
        },
        expectedError: 'INVALID_RESUME_DATA'
    },
    {
        name: 'Missing Job Title',
        description: 'Test with missing job title',
        data: {
            resumeData: {
                fullName: 'John Smith',
                skills: ['JavaScript'],
                experience: [{
                    role: 'Developer',
                    company: 'Tech Corp'
                }]
            }
        },
        expectedError: 'MISSING_JOB_TITLE'
    },
    {
        name: 'Minimal Valid Data',
        description: 'Test with minimal but valid data',
        data: {
            resumeData: {
                fullName: 'John Smith',
                careerObjective: 'Seeking development opportunities'
            },
            jobTitle: 'Software Developer'
        },
        expectedError: null
    },
    {
        name: 'Complete Valid Data',
        description: 'Test with complete resume data',
        data: {
            resumeData: {
                fullName: 'John Smith',
                email: 'john@example.com',
                phone: '(555) 123-4567',
                careerObjective: 'Seeking challenging opportunities in software development',
                skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
                experience: [
                    {
                        role: 'Software Developer',
                        company: 'Tech Solutions Inc',
                        duration: '2022-2024',
                        description: 'Developed web applications using modern technologies'
                    }
                ],
                education: [
                    {
                        degree: 'Bachelor of Computer Science',
                        institution: 'University of Technology',
                        year: '2022'
                    }
                ]
            },
            jobTitle: 'Senior Software Developer',
            companyContext: 'Tech Startup',
            experienceLevel: 'mid'
        },
        expectedError: null
    }
];

async function testErrorHandling() {
    console.log('🧪 Starting Comprehensive Error Testing for Interview Questions\n');
    console.log('=' + '='.repeat(80) + '\n');
    
    let passedTests = 0;
    let totalTests = testCases.length;
    
    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`📋 Test ${i + 1}/${totalTests}: ${testCase.name}`);
        console.log(`📝 Description: ${testCase.description}`);
        console.log(`🎯 Expected: ${testCase.expectedError || 'SUCCESS'}`);
        
        try {
            const response = await fetch('/api/interview/questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testCase.data)
            });
            
            const result = await response.json();
            
            console.log(`📊 Status: ${response.status}`);
            console.log(`✅ Success: ${result.success}`);
            
            if (testCase.expectedError) {
                // Expecting an error
                if (!result.success && result.error === testCase.expectedError) {
                    console.log('✅ PASS: Expected error received');
                    console.log(`💬 Message: ${result.message}`);
                    if (result.details) {
                        console.log(`📋 Details: ${result.details.join(', ')}`);
                    }
                    if (result.suggestions) {
                        console.log(`💡 Suggestions: ${result.suggestions.join(', ')}`);
                    }
                    passedTests++;
                } else {
                    console.log(`❌ FAIL: Expected error '${testCase.expectedError}' but got '${result.error || 'SUCCESS'}'`);
                }
            } else {
                // Expecting success
                if (result.success && result.data && result.data.questions) {
                    console.log('✅ PASS: Successfully generated questions');
                    console.log(`📊 Generated ${result.data.questions.length} questions`);
                    console.log(`🤖 Model: ${result.data.aiModel}`);
                    console.log(`📝 Template: ${result.data.isTemplate ? 'Yes' : 'No'}`);
                    if (result.data.highlightedSkills) {
                        console.log(`🏷️  Skills: ${result.data.highlightedSkills.join(', ')}`);
                    }
                    passedTests++;
                } else {
                    console.log(`❌ FAIL: Expected success but got error: ${result.message}`);
                }
            }
            
        } catch (error) {
            console.log(`❌ NETWORK ERROR: ${error.message}`);
        }
        
        console.log('\n' + '-'.repeat(80) + '\n');
    }
    
    console.log(`🎯 Test Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 ALL TESTS PASSED! Error handling is working correctly.');
    } else {
        console.log(`⚠️  ${totalTests - passedTests} tests failed. Please review the error handling logic.`);
    }
    
    return passedTests === totalTests;
}

// Test individual error scenarios
async function testSpecificErrors() {
    console.log('\n🚨 Testing Specific Error Scenarios\n');
    
    // Test rate limiting simulation
    console.log('📊 Testing rate limiting simulation...');
    const promises = [];
    for (let i = 0; i < 3; i++) {
        promises.push(
            fetch('/api/interview/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeData: {
                        fullName: 'Test User',
                        careerObjective: 'Test objective'
                    },
                    jobTitle: 'Test Position'
                })
            })
        );
    }
    
    try {
        const responses = await Promise.all(promises);
        const results = await Promise.all(responses.map(r => r.json()));
        
        console.log('📊 Concurrent request results:');
        results.forEach((result, index) => {
            console.log(`  Request ${index + 1}: ${result.success ? 'SUCCESS' : result.error}`);
        });
    } catch (error) {
        console.log('❌ Concurrent request error:', error.message);
    }
}

// Main test execution
async function runAllTests() {
    try {
        // Check if server is running
        const healthCheck = await fetch('/');
        if (!healthCheck.ok) {
            console.log('❌ Server is not running. Please start the server first.');
            return;
        }
        
        console.log('✅ Server is running. Starting tests...\n');
        
        // Run error handling tests
        const testsPassed = await testErrorHandling();
        
        // Run specific error scenarios
        await testSpecificErrors();
        
        console.log('\n🏁 Testing Complete!');
        
        if (testsPassed) {
            console.log('✅ All error handling tests passed!');
            console.log('🎯 The interview questions feature now has robust error handling.');
        } else {
            console.log('❌ Some tests failed. Please review the implementation.');
        }
        
    } catch (error) {
        console.error('❌ Test suite failed:', error);
    }
}

// Auto-run tests when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Interview Questions Error Testing Suite');
    console.log('Click the "Run Tests" button to start comprehensive testing.');
    
    // Add test runner button to the page
    const button = document.createElement('button');
    button.textContent = '🧪 Run Error Tests';
    button.className = 'btn btn-warning mt-3';
    button.onclick = runAllTests;
    
    const container = document.querySelector('.container') || document.body;
    container.appendChild(button);
});

// Export for manual testing
window.testInterviewErrors = {
    runAllTests,
    testErrorHandling,
    testSpecificErrors
};
