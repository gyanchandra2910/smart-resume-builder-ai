const OpenAI = require('openai');

// Initialize OpenAI with API key from environment
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Helper function to format resume data into plain text
const formatResumeToPlainText = (resumeData) => {
    let formattedResume = '';
    
    // Header Section
    if (resumeData.fullName || resumeData.name) {
        formattedResume += `${resumeData.fullName || resumeData.name}\n`;
    }
    if (resumeData.email) {
        formattedResume += `Email: ${resumeData.email}\n`;
    }
    if (resumeData.phone) {
        formattedResume += `Phone: ${resumeData.phone}\n`;
    }
    if (resumeData.address) {
        formattedResume += `Address: ${resumeData.address}\n`;
    }
    if (resumeData.roleAppliedFor) {
        formattedResume += `\nTarget Role: ${resumeData.roleAppliedFor}\n`;
    }
    
    formattedResume += '\n';
    
    // Professional Objective
    if (resumeData.careerObjective || resumeData.objective) {
        formattedResume += `PROFESSIONAL OBJECTIVE\n`;
        formattedResume += `${resumeData.careerObjective || resumeData.objective}\n\n`;
    }
    
    // Skills Section
    if (resumeData.skills && resumeData.skills.length > 0) {
        formattedResume += `TECHNICAL SKILLS\n`;
        if (Array.isArray(resumeData.skills)) {
            formattedResume += `${resumeData.skills.join(', ')}\n\n`;
        } else {
            formattedResume += `${resumeData.skills}\n\n`;
        }
    }
    
    // Experience Section
    if (resumeData.experience) {
        formattedResume += `PROFESSIONAL EXPERIENCE\n`;
        
        let experienceArray = [];
        if (Array.isArray(resumeData.experience)) {
            experienceArray = resumeData.experience;
        } else {
            experienceArray = Object.values(resumeData.experience).filter(exp => exp.company && exp.role);
        }
        
        experienceArray.forEach(exp => {
            formattedResume += `${exp.role} | ${exp.company}\n`;
            if (exp.duration) {
                formattedResume += `${exp.duration}\n`;
            }
            if (exp.description) {
                formattedResume += `${exp.description}\n`;
            }
            formattedResume += '\n';
        });
    }
    
    // Education Section
    if (resumeData.education) {
        formattedResume += `EDUCATION\n`;
        
        let educationArray = [];
        if (Array.isArray(resumeData.education)) {
            educationArray = resumeData.education;
        } else {
            educationArray = Object.values(resumeData.education).filter(edu => edu.degree && edu.college);
        }
        
        educationArray.forEach(edu => {
            formattedResume += `${edu.degree} | ${edu.college}\n`;
            if (edu.year) {
                formattedResume += `${edu.year}\n`;
            }
            formattedResume += '\n';
        });
    }
    
    // Projects Section
    if (resumeData.projects) {
        formattedResume += `PROJECTS\n`;
        
        let projectsArray = [];
        if (Array.isArray(resumeData.projects)) {
            projectsArray = resumeData.projects;
        } else {
            projectsArray = Object.values(resumeData.projects).filter(proj => proj.title);
        }
        
        projectsArray.forEach(proj => {
            formattedResume += `${proj.title}\n`;
            if (proj.techStack) {
                formattedResume += `Technologies: ${proj.techStack}\n`;
            }
            if (proj.description) {
                formattedResume += `${proj.description}\n`;
            }
            formattedResume += '\n';
        });
    }
    
    // Certifications Section
    if (resumeData.certifications) {
        formattedResume += `CERTIFICATIONS\n`;
        
        let certificationsArray = [];
        if (Array.isArray(resumeData.certifications)) {
            certificationsArray = resumeData.certifications;
        } else {
            certificationsArray = Object.values(resumeData.certifications).filter(cert => cert.name);
        }
        
        certificationsArray.forEach(cert => {
            formattedResume += `${cert.name}`;
            if (cert.issuer) {
                formattedResume += ` | ${cert.issuer}`;
            }
            if (cert.date) {
                formattedResume += ` | ${cert.date}`;
            }
            formattedResume += '\n';
        });
    }
    
    return formattedResume.trim();
};

// Check ATS score and provide suggestions
const checkATSScore = async (req, res) => {
    try {
        console.log('ATS Check request received:', req.body); // Debug log
        
        const resumeData = req.body;

        // Validate that we have resume data
        if (!resumeData || Object.keys(resumeData).length === 0) {
            console.log('No resume data provided');
            return res.status(400).json({
                success: false,
                message: 'Resume data is required'
            });
        }

        // Format resume to plain text
        const plainTextResume = formatResumeToPlainText(resumeData);
        console.log('Formatted resume text (length: ' + plainTextResume.length + '):', plainTextResume.substring(0, 200) + '...');
        
        if (!plainTextResume || plainTextResume.length < 50) { // Reduced from 100 to 50
            console.log('Resume data too short or empty');
            return res.status(400).json({
                success: false,
                message: 'Resume data appears to be incomplete. Please fill in more information.'
            });
        }

        // Create the prompt for ATS analysis
        const prompt = `
You are an expert ATS (Applicant Tracking System) evaluator used by top hiring platforms.

Analyze the resume below and provide:
1. An honest **ATS score out of 100**
2. **3 specific, actionable suggestions** to improve it

Be **strict** — penalize resumes that:
- Lack relevant keywords or achievements
- Miss important sections (experience, education, skills)
- Have poor structure or weak objectives

Use the following **scoring breakdown**:
- 🔑 Keywords & Skills relevance: 25 points
- 📐 Structure & formatting: 20 points
- 📊 Quantified achievements: 20 points
- 🎯 Role alignment: 15 points
- ✍️ Professional language: 10 points
- 🧩 Completeness (has all major sections): 10 points

**Resume missing 1 or more categories should not get above 70.**

---

## Resume Content:
${plainTextResume}

---

Respond **only** in the following JSON format:

{
  "score": [strict number between 0-100],
  "suggestions": [
    "First actionable suggestion",
    "Second actionable suggestion",
    "Third actionable suggestion"
  ]
}

Only output the JSON object. Do not explain your reasoning outside it.
`;


        console.log('Calling OpenAI for ATS analysis...'); // Debug log
        
        let atsAnalysis;
        
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert ATS analyzer and resume reviewer. Always respond with valid JSON format containing a score (0-100) and exactly 3 suggestions."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 1000,
                temperature: 0.3
            });

            console.log('OpenAI ATS response received:', completion.choices[0].message.content); // Debug log

            // Parse the response
            const aiResponse = completion.choices[0].message.content;
            atsAnalysis = JSON.parse(aiResponse);
            
        } catch (openaiError) {
            console.log('OpenAI API Error, using fallback ATS analysis:', openaiError.message);
            
            // Fallback ATS analysis when OpenAI is not available
            let fallbackScore = 65; // Base score
            
            // Adjust score based on resume content
            if (resumeData.skills && resumeData.skills.length > 0) fallbackScore += 5;
            if (resumeData.experience) fallbackScore += 10;
            if (resumeData.education) fallbackScore += 5;
            if (resumeData.careerObjective || resumeData.objective) fallbackScore += 5;
            if (resumeData.projects) fallbackScore += 5;
            if (resumeData.certifications) fallbackScore += 5;
            
            atsAnalysis = {
                score: Math.min(fallbackScore, 100),
                suggestions: [
                    "Add more industry-specific keywords relevant to your target role to improve ATS keyword matching",
                    "Include quantifiable achievements and metrics (e.g., percentages, dollar amounts, numbers) to demonstrate impact",
                    "Ensure all sections are complete and use action verbs to start bullet points in your experience section"
                ]
            };
        }

        // Validate response structure
        if (typeof atsAnalysis.score !== 'number' || !Array.isArray(atsAnalysis.suggestions) || atsAnalysis.suggestions.length !== 3) {
            throw new Error('Invalid ATS analysis response structure');
        }

        // Ensure score is within valid range
        atsAnalysis.score = Math.max(0, Math.min(100, atsAnalysis.score));

        res.status(200).json({
            success: true,
            message: 'ATS analysis completed successfully',
            data: {
                score: atsAnalysis.score,
                suggestions: atsAnalysis.suggestions,
                resumeWordCount: plainTextResume.split(' ').length,
                sectionsAnalyzed: {
                    hasObjective: !!(resumeData.careerObjective || resumeData.objective),
                    hasSkills: !!(resumeData.skills && resumeData.skills.length > 0),
                    hasExperience: !!(resumeData.experience),
                    hasEducation: !!(resumeData.education),
                    hasProjects: !!(resumeData.projects),
                    hasCertifications: !!(resumeData.certifications)
                }
            }
        });

    } catch (error) {
        console.error('Error performing ATS check:', error);
        
        // Handle specific OpenAI errors
        if (error.code === 'insufficient_quota') {
            return res.status(429).json({
                success: false,
                message: 'OpenAI API quota exceeded. Please try again later.'
            });
        }
        
        if (error.code === 'invalid_api_key') {
            return res.status(401).json({
                success: false,
                message: 'Invalid OpenAI API key configuration.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error performing ATS analysis',
            error: error.message
        });
    }
};

module.exports = {
    checkATSScore
};
