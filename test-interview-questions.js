/**
 * Test script for Interview Questions Generation API
 * Run with: node test-interview-questions.js
 */

const axios = require('axios');

// Test data - Sample resume
const testResumeData = {
    fullName: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "555-987-6543",
    careerObjective: "Passionate full-stack developer with 3 years of experience building scalable web applications. Seeking opportunities to contribute to innovative projects and grow technical leadership skills.",
    experience: [
        {
            role: "Full Stack Developer",
            company: "TechCorp Solutions",
            duration: "2021-2024",
            description: "Developed and maintained React-based web applications serving 10,000+ users. Led migration from monolithic to microservices architecture, reducing load times by 40%. Collaborated with cross-functional teams to deliver features on time."
        },
        {
            role: "Junior Developer",
            company: "StartupXYZ",
            duration: "2020-2021",
            description: "Built REST APIs using Node.js and Express. Implemented automated testing suites, increasing code coverage from 60% to 95%. Mentored 2 intern developers."
        }
    ],
    skills: ["JavaScript", "React", "Node.js", "Python", "MongoDB", "AWS", "Docker", "Git", "Jest", "TypeScript"],
    education: [
        {
            degree: "Bachelor of Science in Computer Science",
            college: "State University",
            year: "2020"
        }
    ],
    projects: [
        {
            title: "E-commerce Platform",
            description: "Built a full-stack e-commerce platform with React frontend and Node.js backend. Integrated payment processing and inventory management.",
            techStack: "React, Node.js, MongoDB, Stripe API"
        },
        {
            title: "Real-time Chat Application", 
            description: "Developed a real-time messaging app using Socket.io and React. Supports group chats, file sharing, and message encryption.",
            techStack: "React, Socket.io, Express, PostgreSQL"
        }
    ],
    certifications: ["AWS Cloud Practitioner", "MongoDB Developer Associate"]
};

async function testInterviewQuestionsGeneration() {
    console.log('🎤 Testing Interview Questions Generation API...\n');

    try {
        // Test 1: Valid request with job title
        console.log('Test 1: Generate questions for Software Engineer role');
        const response1 = await axios.post('http://localhost:5000/api/interview/generate-questions', {
            resumeData: testResumeData,
            jobTitle: "Senior Software Engineer"
        });
        
        console.log('✅ Test 1 Success:', {
            success: response1.data.success,
            isTemplate: response1.data.data?.isTemplate,
            questionCount: response1.data.data?.questionCount,
            jobTitle: response1.data.data?.jobTitle,
            message: response1.data.message
        });
        
        console.log('\n📋 Generated Questions:');
        response1.data.data.questions.forEach((question, index) => {
            console.log(`${index + 1}. ${question}`);
        });
        console.log('\n');

    } catch (error) {
        console.log('❌ Test 1 Failed:', error.response?.data?.message || error.message);
    }

    try {
        // Test 2: No job title (general questions)
        console.log('Test 2: Generate general interview questions (no job title)');
        const response2 = await axios.post('http://localhost:5000/api/interview/generate-questions', {
            resumeData: testResumeData
        });
        
        console.log('✅ Test 2 Success:', {
            success: response2.data.success,
            isTemplate: response2.data.data?.isTemplate,
            questionCount: response2.data.data?.questionCount,
            jobTitle: response2.data.data?.jobTitle
        });

    } catch (error) {
        console.log('❌ Test 2 Failed:', error.response?.data?.message || error.message);
    }

    try {
        // Test 3: Missing resume data (should fail)
        console.log('\nTest 3: Missing resume data (should fail)');
        const response3 = await axios.post('http://localhost:5000/api/interview/generate-questions', {
            jobTitle: "Data Analyst"
        });
        
        console.log('❌ Test 3 Should have failed but succeeded');

    } catch (error) {
        console.log('✅ Test 3 Expected failure:', error.response?.data?.message);
        console.log('   Error code:', error.response?.data?.error);
    }

    try {
        // Test 4: Minimal resume data
        console.log('\nTest 4: Minimal resume data (entry-level candidate)');
        const minimalResume = {
            fullName: "Alex Smith",
            careerObjective: "Recent computer science graduate seeking entry-level software development position",
            skills: ["Python", "Java", "SQL"],
            education: [
                {
                    degree: "Bachelor of Science in Computer Science",
                    college: "University College",
                    year: "2024"
                }
            ]
        };

        const response4 = await axios.post('http://localhost:5000/api/interview/generate-questions', {
            resumeData: minimalResume,
            jobTitle: "Junior Software Developer"
        });
        
        console.log('✅ Test 4 Success:', {
            success: response4.data.success,
            isTemplate: response4.data.data?.isTemplate,
            questionCount: response4.data.data?.questionCount,
            candidateName: response4.data.data?.candidateName
        });

        console.log('\n📋 Entry-level Questions:');
        response4.data.data.questions.forEach((question, index) => {
            console.log(`${index + 1}. ${question}`);
        });

    } catch (error) {
        console.log('❌ Test 4 Failed:', error.response?.data?.message || error.message);
    }

    try {
        // Test 5: Different job roles
        console.log('\nTest 5: Generate questions for Data Scientist role');
        const response5 = await axios.post('http://localhost:5000/api/interview/generate-questions', {
            resumeData: testResumeData,
            jobTitle: "Data Scientist"
        });
        
        console.log('✅ Test 5 Success:', {
            success: response5.data.success,
            questionCount: response5.data.data?.questionCount,
            jobTitle: response5.data.data?.jobTitle
        });

    } catch (error) {
        console.log('❌ Test 5 Failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🏁 Interview questions testing completed!');
}

// Run tests if server is running
testInterviewQuestionsGeneration().catch(error => {
    console.error('❌ Test runner error:', error.message);
    console.log('\n💡 Make sure the server is running on http://localhost:5000');
    console.log('💡 Also ensure you have OpenAI API key configured in .env file');
});
