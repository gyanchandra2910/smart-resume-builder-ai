/**
 * Interview Questions Generator Controller
 * Generates tailored interview questions based on resume data using OpenAI API
 */

// Helper function to validate resume data for interview questions
const validateResumeData = (resumeData) => {
    const errors = [];
    const warnings = [];
    
    console.log('🔍 Validating resume data:', {
        hasResumeData: !!resumeData,
        dataType: typeof resumeData,
        keys: resumeData ? Object.keys(resumeData) : []
    });
    
    // Check if resumeData exists
    if (!resumeData || typeof resumeData !== 'object') {
        errors.push('Resume data is missing or invalid');
        return { isValid: false, errors, warnings };
    }
    
    // Check for basic information - handle both fullName and name for backward compatibility
    const userName = resumeData.fullName || resumeData.name;
    if (!userName || userName.trim() === '') {
        errors.push('Full name is required (missing both fullName and name fields)');
    }
    
    // Check for experience
    const hasExperience = resumeData.experience && 
        (Array.isArray(resumeData.experience) ? resumeData.experience.length > 0 : Object.keys(resumeData.experience).length > 0);
    
    // Check for education
    const hasEducation = resumeData.education && 
        (Array.isArray(resumeData.education) ? resumeData.education.length > 0 : Object.keys(resumeData.education).length > 0);
    
    // Check for career objective
    const hasObjective = resumeData.careerObjective && resumeData.careerObjective.trim() !== '';
    
    // Check for skills
    const hasSkills = resumeData.skills && 
        (Array.isArray(resumeData.skills) ? resumeData.skills.length > 0 : Object.keys(resumeData.skills).length > 0);
    
    // At least one major section should be present
    if (!hasExperience && !hasEducation && !hasObjective) {
        errors.push('Resume must include at least experience, education, or career objective');
    }
    
    // Add warnings for missing optional sections
    if (!hasExperience) {
        warnings.push('No work experience found - questions will be more general');
    }
    if (!hasSkills) {
        warnings.push('No skills listed - questions may not be technically specific');
    }
    if (!hasObjective) {
        warnings.push('No career objective - questions may not align with career goals');
    }
    
    console.log('📊 Validation results:', {
        isValid: errors.length === 0,
        errorCount: errors.length,
        warningCount: warnings.length,
        hasExperience,
        hasEducation,
        hasObjective,
        hasSkills
    });
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};

// Helper function to format resume data for prompt
const formatResumeForInterviewPrompt = (resumeData, jobTitle) => {
    // Format experience entries
    let experienceText = '';
    if (resumeData.experience) {
        const experiences = Array.isArray(resumeData.experience) 
            ? resumeData.experience 
            : Object.values(resumeData.experience).filter(exp => exp.role && exp.company);
        
        experienceText = experiences.map(exp => 
            `${exp.role} at ${exp.company}${exp.duration ? ` (${exp.duration})` : ''}: ${exp.description || 'Various responsibilities'}`
        ).join('\n');
    }
    
    // Format education entries
    let educationText = '';
    if (resumeData.education) {
        const educations = Array.isArray(resumeData.education) 
            ? resumeData.education 
            : Object.values(resumeData.education).filter(edu => edu.degree && edu.college);
        
        educationText = educations.map(edu => 
            `${edu.degree} from ${edu.college}${edu.year ? ` (${edu.year})` : ''}`
        ).join('\n');
    }
    
    // Format skills
    let skillsText = '';
    if (resumeData.skills) {
        const skills = Array.isArray(resumeData.skills) 
            ? resumeData.skills 
            : resumeData.skills.split(',').map(s => s.trim());
        
        skillsText = skills.filter(skill => skill.trim() !== '').join(', ');
    }
    
    // Format projects
    let projectsText = '';
    if (resumeData.projects) {
        const projects = Array.isArray(resumeData.projects) 
            ? resumeData.projects 
            : Object.values(resumeData.projects).filter(proj => proj.title);
        
        projectsText = projects.map(proj => 
            `${proj.title}: ${proj.description || 'Project details'}${proj.techStack ? ` (Technologies: ${proj.techStack})` : ''}`
        ).join('\n');
    }
    
    return {
        name: resumeData.fullName || resumeData.name || 'Candidate',
        objective: resumeData.careerObjective || '',
        experience: experienceText || 'No work experience listed',
        education: educationText || 'Education background not specified',
        skills: skillsText || 'Various skills',
        projects: projectsText || 'No projects listed',
        certifications: resumeData.certifications || 'No certifications listed'
    };
};

// Helper function to create structured prompt for OpenAI
const createInterviewQuestionsPrompt = (formattedData, jobTitle) => {
    const targetRole = jobTitle || 'General position';
    
    return `Generate 5 tailored interview questions for a ${targetRole} candidate based on their resume. Create a mix of behavioral, technical, and situational questions that are relevant to their background and the target role.

CANDIDATE PROFILE:
Name: ${formattedData.name}
Target Role: ${targetRole}

${formattedData.objective ? `Career Objective: ${formattedData.objective}` : ''}

WORK EXPERIENCE:
${formattedData.experience}

EDUCATION:
${formattedData.education}

TECHNICAL SKILLS:
${formattedData.skills}

PROJECTS:
${formattedData.projects}

QUESTION GENERATION GUIDELINES:
1. Create questions that directly relate to their listed experience, skills, and projects
2. Include 1-2 behavioral questions (STAR method applicable)
3. Include 1-2 technical questions related to their skills/projects
4. Include 1 situational/problem-solving question
5. Make questions specific to their background, not generic
6. Ensure questions are appropriate for the ${targetRole} role level
7. Questions should help assess both technical competency and cultural fit

QUESTION TYPES TO INCLUDE:
- Experience-based: Reference specific roles, companies, or projects from their resume
- Skill-based: Focus on technologies, tools, or methodologies they've listed
- Project-based: Ask about challenges, decisions, or learnings from their projects
- Behavioral: Leadership, teamwork, problem-solving scenarios
- Role-specific: Questions tailored to ${targetRole} responsibilities

OUTPUT FORMAT:
Return exactly 5 interview questions as a JSON array. Each question should be:
- Specific to the candidate's background
- Professional and clear
- Appropriate for the target role level
- Designed to elicit detailed responses

Example format:
{
  "questions": [
    "Question 1 based on their specific experience...",
    "Question 2 about their technical skills...",
    "Question 3 behavioral question...",
    "Question 4 about their projects...",
    "Question 5 situational for the target role..."
  ]
}

Generate thoughtful, personalized questions that would help an interviewer assess this candidate's fit for the ${targetRole} position.`;
};

// Main controller function to generate interview questions
const generateInterviewQuestions = async (req, res) => {
    try {
        console.log('🎤 Interview questions generation request received:', {
            hasResumeData: !!req.body.resumeData,
            hasJobTitle: !!req.body.jobTitle,
            dataKeys: Object.keys(req.body),
            resumeDataKeys: req.body.resumeData ? Object.keys(req.body.resumeData) : [],
            resumeDataSample: req.body.resumeData ? {
                hasFullName: !!req.body.resumeData.fullName,
                hasName: !!req.body.resumeData.name,
                fullNameValue: req.body.resumeData.fullName,
                nameValue: req.body.resumeData.name,
                hasExperience: !!req.body.resumeData.experience,
                hasSkills: !!req.body.resumeData.skills
            } : null
        });

        const { resumeData, jobTitle } = req.body;

        // 1. Validate required resume data
        if (!resumeData || Object.keys(resumeData).length === 0) {
            console.log('❌ Missing resume data');
            return res.status(400).json({
                success: false,
                message: 'Resume data is required for generating interview questions',
                error: 'MISSING_RESUME_DATA'
            });
        }

        // 2. Validate resume data quality
        const validation = validateResumeData(resumeData);
        if (!validation.isValid) {
            console.log('❌ Resume validation failed:', validation.errors);
            return res.status(400).json({
                success: false,
                message: 'Resume data validation failed: ' + validation.errors.join(', '),
                error: 'INVALID_RESUME_DATA',
                details: validation.errors,
                suggestions: [
                    'Ensure your resume includes a full name',
                    'Add work experience, education, or career objective',
                    'Include relevant skills for better question targeting'
                ]
            });
        }
        
        // Log validation warnings if any
        if (validation.warnings && validation.warnings.length > 0) {
            console.log('⚠️ Resume validation warnings:', validation.warnings);
        }

        // 3. Check OpenAI configuration
        if (!process.env.OPENAI_API_KEY) {
            console.log('❌ OpenAI API key not configured');
            return res.status(500).json({
                success: false,
                message: 'AI service is not configured. Please contact support.',
                error: 'OPENAI_NOT_CONFIGURED'
            });
        }

        // 4. Format resume data for prompt
        const formattedData = formatResumeForInterviewPrompt(resumeData, jobTitle);
        console.log('✅ Resume data formatted for interview questions:', {
            nameLength: formattedData.name.length,
            hasExperience: formattedData.experience !== 'No work experience listed',
            hasEducation: formattedData.education !== 'Education background not specified',
            skillsCount: formattedData.skills.split(',').length,
            targetRole: jobTitle || 'General position'
        });

        // 5. Create structured prompt for OpenAI
        const prompt = createInterviewQuestionsPrompt(formattedData, jobTitle);
        
        let questions = [];
        let isTemplate = false;
        let aiModel = 'gpt-3.5-turbo';

        try {
            // 6. Call OpenAI API with error handling
            console.log('🤖 Calling OpenAI API for interview questions generation...');
            console.log('📝 Request body debug:', {
                hasResumeData: !!resumeData,
                jobTitle: jobTitle || 'None provided',
                formattedDataKeys: Object.keys(formattedData),
                promptLength: prompt.length,
                apiKeyExists: !!process.env.OPENAI_API_KEY,
                apiKeyPrefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'NOT SET'
            });
            
            const { OpenAI } = require('openai');
            const openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });

            const completion = await openai.chat.completions.create({
                model: aiModel,
                messages: [
                    {
                        role: "system",
                        content: "You are an expert HR professional and interview coach specializing in creating personalized, insightful interview questions. Generate questions that help assess both technical competency and cultural fit based on the candidate's specific background."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 1200,
                temperature: 0.7,
                presence_penalty: 0.1,
                frequency_penalty: 0.1
            });

            const aiResponse = completion.choices[0].message.content.trim();
            console.log('✅ OpenAI API response received successfully');
            console.log('📊 Response preview:', aiResponse.substring(0, 200) + '...');
            
            // Parse the JSON response
            try {
                const parsed = JSON.parse(aiResponse);
                if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length === 5) {
                    questions = parsed.questions;
                } else {
                    throw new Error('Invalid response format from AI - expected 5 questions array');
                }
            } catch (parseError) {
                console.log('⚠️ Failed to parse AI response as JSON, extracting questions manually');
                console.log('🔍 Raw AI response:', aiResponse);
                
                // Fallback: try to extract questions from response
                const questionMatches = aiResponse.match(/"([^"]+\?[^"]*)"/g);
                if (questionMatches && questionMatches.length >= 5) {
                    questions = questionMatches.slice(0, 5).map(q => q.slice(1, -1));
                    console.log('✅ Extracted questions manually:', questions.length);
                } else {
                    console.error('❌ Could not extract valid questions from AI response');
                    throw new Error('Could not extract valid questions from AI response');
                }
            }

            console.log('📊 Interview questions stats:', {
                count: questions.length,
                avgLength: Math.round(questions.reduce((acc, q) => acc + q.length, 0) / questions.length)
            });

        } catch (openaiError) {
            // 7. Handle OpenAI-specific errors with detailed logging
            console.error('❌ OpenAI API Error Details:', {
                message: openaiError.message,
                code: openaiError.code,
                type: openaiError.type,
                status: openaiError.status,
                response: openaiError.response?.data,
                stack: openaiError.stack
            });
            
            let errorMessage = 'AI service temporarily unavailable';
            let errorCode = 'OPENAI_GENERAL_ERROR';
            
            if (openaiError.code === 'insufficient_quota') {
                errorMessage = 'AI service quota exceeded - please contact support';
                errorCode = 'OPENAI_QUOTA_EXCEEDED';
            } else if (openaiError.code === 'invalid_api_key') {
                errorMessage = 'AI service configuration error - invalid API key';
                errorCode = 'OPENAI_INVALID_KEY';
            } else if (openaiError.code === 'rate_limit_exceeded') {
                errorMessage = 'AI service rate limit exceeded - please try again in a moment';
                errorCode = 'OPENAI_RATE_LIMIT';
            } else if (openaiError.status === 401) {
                errorMessage = 'AI service authentication failed - check API key';
                errorCode = 'OPENAI_AUTH_FAILED';
            } else if (openaiError.status === 429) {
                errorMessage = 'Too many requests to AI service - please wait and try again';
                errorCode = 'OPENAI_TOO_MANY_REQUESTS';
            } else if (openaiError.status === 500) {
                errorMessage = 'AI service internal error - please try again later';
                errorCode = 'OPENAI_SERVER_ERROR';
            } else if (openaiError.message.includes('network')) {
                errorMessage = 'Network error connecting to AI service - check internet connection';
                errorCode = 'OPENAI_NETWORK_ERROR';
            }
            
            // Store error details for frontend
            this.lastOpenAIError = {
                message: errorMessage,
                code: errorCode,
                originalError: openaiError.message,
                timestamp: new Date().toISOString()
            };
            
            // Generate template-based questions as fallback
            console.log('🔄 Generating template-based interview questions as fallback...');
            try {
                questions = generateTemplateInterviewQuestions(formattedData, jobTitle);
                isTemplate = true;
                console.log('✅ Template questions generated successfully:', questions.length);
            } catch (templateError) {
                console.error('❌ Template generation also failed:', templateError);
                // Return basic questions as last resort
                questions = getBasicInterviewQuestions(jobTitle);
                isTemplate = true;
            }
        }

        // 8. Extract skills from resume for highlighting
        const highlightedSkills = [];
        if (resumeData.skills && Array.isArray(resumeData.skills)) {
            highlightedSkills.push(...resumeData.skills.slice(0, 5)); // Top 5 skills
        }
        
        // 9. Return generated interview questions with metadata
        const response = {
            success: true,
            data: {
                questions,
                jobTitle: jobTitle || 'General position',
                candidateName: formattedData.name,
                highlightedSkills,
                isTemplate,
                aiModel: isTemplate ? 'template' : aiModel,
                generatedAt: new Date().toISOString(),
                questionCount: questions.length
            },
            message: isTemplate 
                ? 'Interview questions generated using professional templates (AI service temporarily unavailable)'
                : 'Interview questions generated successfully using AI'
        };

        console.log('✅ Interview questions generation completed:', {
            isTemplate,
            questionCount: questions.length,
            jobTitle: jobTitle || 'General position',
            candidateName: formattedData.name
        });

        res.json(response);

    } catch (error) {
        // 10. Comprehensive error logging and handling
        console.error('❌ Critical error in interview questions generation:', {
            message: error.message,
            stack: error.stack,
            requestBody: req.body
        });
        
        res.status(500).json({
            success: false,
            message: 'An unexpected error occurred while generating interview questions. Please try again.',
            error: 'INTERNAL_SERVER_ERROR',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Helper function to generate template-based interview questions
const generateTemplateInterviewQuestions = (formattedData, jobTitle) => {
    const role = jobTitle || 'this position';
    const name = formattedData.name;
    
    // Extract key information for personalized template questions
    const hasExperience = formattedData.experience !== 'No work experience listed';
    const hasProjects = formattedData.projects !== 'No projects listed';
    const skills = formattedData.skills.split(',').map(s => s.trim()).filter(s => s);
    const primarySkill = skills.length > 0 ? skills[0] : 'technology';
    
    // Get first company/role for experience-based questions
    const experienceMatch = formattedData.experience.match(/(.+?) at (.+?)(?:\s|:)/);
    const firstRole = experienceMatch ? experienceMatch[1] : 'your previous role';
    const firstCompany = experienceMatch ? experienceMatch[2] : 'your previous company';
    
    const templateQuestions = [
        // Experience-based question
        hasExperience 
            ? `Tell me about a challenging project or situation you encountered during your time as ${firstRole}${firstCompany !== 'your previous company' ? ` at ${firstCompany}` : ''}. How did you approach it and what was the outcome?`
            : `Although you may be early in your career, tell me about a challenging academic project or personal initiative you've worked on. How did you approach it and what did you learn?`,
        
        // Technical/Skills-based question
        skills.length > 0 
            ? `I see you have experience with ${primarySkill}${skills.length > 1 ? ` and ${skills[1]}` : ''}. Can you walk me through a specific example of how you've used ${primarySkill} to solve a problem or complete a project?`
            : `What technical skills or tools are you most confident in, and can you give me an example of how you've applied them in a project or learning experience?`,
        
        // Behavioral question
        hasExperience 
            ? `Describe a time when you had to collaborate with a team to achieve a goal. What was your role, and how did you handle any challenges that arose during the collaboration?`
            : `Tell me about a time when you had to work as part of a team, whether in school, volunteering, or any other context. What was your contribution and how did you ensure the team was successful?`,
        
        // Project/Problem-solving question
        hasProjects 
            ? `Looking at your project experience, which project are you most proud of and why? What technical decisions did you make, and what would you do differently if you were to start it again?`
            : `Describe a problem you've solved recently, whether technical or otherwise. Walk me through your thought process and the steps you took to reach a solution.`,
        
        // Role-specific/Situational question
        `If you were to join our team as a ${role}, what would you hope to learn in your first 90 days, and how would you approach getting up to speed with our technology stack and processes?`
    ];
    
    return templateQuestions;
};

// Helper function to provide basic interview questions as last resort
const getBasicInterviewQuestions = (jobTitle) => {
    const basicQuestions = [
        "Tell me about yourself and your professional background.",
        `What interests you most about this ${jobTitle || 'position'}?`,
        "Describe a challenging project you've worked on and how you overcame obstacles.",
        "Where do you see yourself in your career in the next 3-5 years?",
        "Why do you think you'd be a good fit for our team?"
    ];
    
    console.log('📋 Using basic interview questions as final fallback');
    return basicQuestions;
};

module.exports = {
    generateInterviewQuestions
};
