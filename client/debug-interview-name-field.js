/**
 * Debug Test for Interview Questions Name Field Issue
 * Tests different data structures to identify the exact issue
 */

async function debugNameFieldIssue() {
    console.log('🔍 Debug Test: Interview Questions Name Field Issue\n');
    
    const testCases = [
        {
            name: 'Test with fullName field',
            data: {
                resumeData: {
                    fullName: 'John Smith',
                    email: 'john@example.com',
                    careerObjective: 'Seeking development opportunities',
                    skills: ['JavaScript', 'React']
                },
                jobTitle: 'Software Developer'
            }
        },
        {
            name: 'Test with name field (legacy format)',
            data: {
                resumeData: {
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                    careerObjective: 'Seeking development opportunities',
                    skills: ['Python', 'Django']
                },
                jobTitle: 'Backend Developer'
            }
        },
        {
            name: 'Test with both fullName and name fields',
            data: {
                resumeData: {
                    fullName: 'Bob Johnson',
                    name: 'Robert Johnson',
                    email: 'bob@example.com',
                    careerObjective: 'Seeking senior development opportunities',
                    skills: ['Java', 'Spring']
                },
                jobTitle: 'Senior Developer'
            }
        },
        {
            name: 'Test with missing name fields (should fail)',
            data: {
                resumeData: {
                    email: 'test@example.com',
                    careerObjective: 'Seeking opportunities',
                    skills: ['CSS', 'HTML']
                },
                jobTitle: 'Frontend Developer'
            }
        },
        {
            name: 'Test with localStorage format (simulating real data)',
            data: {
                resumeData: {
                    name: 'localStorage User',
                    email: 'user@example.com',
                    experience: [{
                        role: 'Developer',
                        company: 'Tech Corp',
                        description: 'Built web applications'
                    }],
                    skills: ['Node.js', 'Express']
                },
                jobTitle: 'Full Stack Developer'
            }
        }
    ];
    
    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`\n📋 Test ${i + 1}: ${testCase.name}`);
        console.log('📤 Sending data:', JSON.stringify(testCase.data, null, 2));
        
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
            
            if (result.success) {
                console.log(`🎯 Generated ${result.data.questions.length} questions`);
                console.log(`👤 Candidate: ${result.data.candidateName}`);
                console.log(`🤖 AI Model: ${result.data.aiModel}`);
                console.log(`📝 Template: ${result.data.isTemplate ? 'Yes' : 'No'}`);
            } else {
                console.log(`❌ Error: ${result.error}`);
                console.log(`💬 Message: ${result.message}`);
                if (result.details) {
                    console.log(`📋 Details: ${result.details.join(', ')}`);
                }
            }
            
        } catch (error) {
            console.log(`❌ Network Error: ${error.message}`);
        }
        
        console.log('\n' + '-'.repeat(60));
    }
}

// Test what's actually in localStorage
async function debugLocalStorageData() {
    console.log('\n📦 Checking localStorage data...\n');
    
    const savedData = localStorage.getItem('resumeData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            console.log('✅ Found localStorage data:');
            console.log('📋 Data structure:', Object.keys(data));
            console.log('👤 Name fields:', {
                hasFullName: !!data.fullName,
                hasName: !!data.name,
                fullNameValue: data.fullName,
                nameValue: data.name
            });
            console.log('📄 Full data:', JSON.stringify(data, null, 2));
            
            // Test this actual data
            console.log('\n🧪 Testing actual localStorage data...');
            await testWithActualData(data);
            
        } catch (error) {
            console.log('❌ Error parsing localStorage data:', error);
        }
    } else {
        console.log('❌ No data found in localStorage');
        console.log('💡 Please create a resume first using the resume builder');
    }
}

async function testWithActualData(data) {
    const testData = {
        resumeData: data,
        jobTitle: 'Software Developer'
    };
    
    try {
        const response = await fetch('/api/interview/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        const result = await response.json();
        
        console.log(`📊 Real Data Test - Status: ${response.status}`);
        console.log(`✅ Success: ${result.success}`);
        
        if (result.success) {
            console.log(`✅ SUCCESS: Generated ${result.data.questions.length} questions with real data!`);
        } else {
            console.log(`❌ FAILED: ${result.message}`);
            if (result.details) {
                console.log(`📋 Details: ${result.details.join(', ')}`);
            }
        }
        
    } catch (error) {
        console.log(`❌ Network Error: ${error.message}`);
    }
}

// Auto-run when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Interview Questions Debug Tool Loaded');
    
    // Add buttons to run tests
    const container = document.querySelector('.container') || document.body;
    
    const debugBtn = document.createElement('button');
    debugBtn.textContent = '🔍 Debug Name Field Issue';
    debugBtn.className = 'btn btn-warning me-2';
    debugBtn.onclick = debugNameFieldIssue;
    
    const localStorageBtn = document.createElement('button');
    localStorageBtn.textContent = '📦 Check localStorage Data';
    localStorageBtn.className = 'btn btn-info';
    localStorageBtn.onclick = debugLocalStorageData;
    
    const div = document.createElement('div');
    div.className = 'mt-3 mb-3';
    div.appendChild(debugBtn);
    div.appendChild(localStorageBtn);
    
    container.appendChild(div);
});

// Export for manual use
window.debugInterviewQuestions = {
    debugNameFieldIssue,
    debugLocalStorageData,
    testWithActualData
};
