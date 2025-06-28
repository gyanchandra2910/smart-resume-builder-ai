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

        // Create the prompt for ATS analysis with ULTRA-STRICT evaluation criteria
        const prompt = `
You are an ELITE ATS (Applicant Tracking System) evaluator used by top-tier Fortune 100 companies and prestigious recruiting firms. Your standards are EXCEPTIONALLY HIGH and you REJECT 85% of resumes.

**BRUTAL REALITY - MOST RESUMES FAIL:**
- Average resume scores: 25-45 points
- Only 15% of resumes deserve 60+ points
- Only 3% of resumes earn 80+ points
- 90% of entry-level resumes: MAX 35 points

**AUTOMATIC DISQUALIFIERS (MAX 30 points):**
- Missing work experience section
- Missing education section  
- No contact information
- Completely generic objectives ("seeking opportunities to grow")
- Zero quantified achievements or metrics
- Template/AI-generated content detected

**HARSH PENALTIES:**
- Vague objectives ("dynamic professional"): -20 points
- No numbers/metrics in experience: MAX 40 points
- Missing technical skills: -15 points
- Poor grammar/typos: -15 points
- Inconsistent formatting: -10 points
- Weak verbs ("responsible for", "worked on"): -10 points
- No keywords for target role: MAX 35 points
- Generic job descriptions: -15 points
- Missing achievements/impact: MAX 45 points

**STRICT SCORING CRITERIA:**
1. **Content Quality (30 pts)**: Quantified achievements, specific metrics, measurable impact
2. **Professional Relevance (25 pts)**: Industry keywords, role-specific skills, career alignment  
3. **Structure & Completeness (20 pts)**: All sections present, consistent format, professional layout
4. **Language Excellence (15 pts)**: Strong action verbs, clear descriptions, error-free
5. **Experience Depth (10 pts)**: Detailed responsibilities, career progression, leadership

**SCORING CAPS:**
- No quantified achievements: CANNOT exceed 40 points
- Missing major section: CANNOT exceed 45 points
- Entry-level (0-2 years): CANNOT exceed 50 points
- Generic template language: CANNOT exceed 35 points
- No industry keywords: CANNOT exceed 40 points

**80+ POINT REQUIREMENTS (ALL must be present):**
✓ 5+ specific metrics/achievements with numbers
✓ Strong industry keywords and technical skills
✓ Clear career progression and leadership examples
✓ Powerful action verbs throughout
✓ Error-free professional language
✓ Complete sections with substantial content
✓ Tailored to specific role/industry

---

RESUME TO ANALYZE:
${plainTextResume}

---

**BE RUTHLESS.** Most resumes are mediocre and deserve 25-50 points. Only exceptional resumes with quantified achievements, strong keywords, and professional excellence earn 70+.

OUTPUT ONLY THIS JSON:

{
  "score": [brutal realistic score 0-100],
  "suggestions": [
    "Most critical weakness to address immediately",
    "Second major improvement needed for competitiveness", 
    "Third essential change to meet professional standards"
  ]
}
`;


        console.log('Calling OpenAI for ATS analysis...'); // Debug log
        
        let atsAnalysis;
        
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are an ELITE ATS analyzer for Fortune 100 companies with EXCEPTIONALLY HIGH standards. Be BRUTAL in scoring - most resumes deserve 25-50 points. Only perfect resumes with quantified achievements, strong keywords, and professional excellence earn 70+. Always respond with valid JSON containing a realistic harsh score (0-100) and exactly 3 specific, actionable suggestions."
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
            console.log('OpenAI API Error, using harsh fallback ATS analysis:', openaiError.message);
            
            // STRICT Fallback ATS analysis when OpenAI is not available
            let fallbackScore = 25; // Start with very low base score
            
            // Basic section presence (small points)
            if (resumeData.skills && resumeData.skills.length > 0) fallbackScore += 8;
            if (resumeData.experience) fallbackScore += 12;
            if (resumeData.education) fallbackScore += 8;
            if (resumeData.careerObjective || resumeData.objective) fallbackScore += 5;
            if (resumeData.projects) fallbackScore += 7;
            if (resumeData.certifications) fallbackScore += 5;
            
            // Check for quantified achievements (look for numbers in experience)
            let hasMetrics = false;
            if (resumeData.experience) {
                const expText = JSON.stringify(resumeData.experience).toLowerCase();
                if (expText.match(/\d+%|\d+\+|\$\d+|\d+,\d+|\d+ (years|months|clients|projects|users|sales|revenue|improvement|increase|decrease)/)) {
                    hasMetrics = true;
                    fallbackScore += 10;
                }
            }
            
            // Penalize for common issues
            if (resumeData.careerObjective) {
                const objective = resumeData.careerObjective.toLowerCase();
                if (objective.includes('seeking opportunities') || objective.includes('dynamic') || objective.includes('hardworking')) {
                    fallbackScore -= 10; // Generic objective penalty
                }
            }
            
            // Cap scores based on quality indicators
            if (!hasMetrics) fallbackScore = Math.min(fallbackScore, 40);
            if (!resumeData.experience) fallbackScore = Math.min(fallbackScore, 30);
            if (!resumeData.education) fallbackScore = Math.min(fallbackScore, 35);
            
            // Ensure realistic scoring range
            fallbackScore = Math.max(15, Math.min(fallbackScore, 65)); // Cap at 65 for fallback
            
            // Generate specific, harsh suggestions based on analysis
            let suggestions = [];
            
            if (!hasMetrics) {
                suggestions.push("Add specific metrics and quantified achievements (e.g., 'Increased sales by 25%', 'Managed team of 8', 'Reduced costs by $50K')");
            }
            
            if (!resumeData.experience || Object.keys(resumeData.experience).length === 0) {
                suggestions.push("Include detailed work experience with specific job responsibilities and accomplishments - resumes without experience rarely pass ATS screening");
            } else {
                suggestions.push("Strengthen experience descriptions with industry keywords and powerful action verbs (avoid 'responsible for', 'worked on')");
            }
            
            if (!resumeData.skills || resumeData.skills.length < 3) {
                suggestions.push("Add 6-10 relevant technical skills and industry keywords that match your target job requirements");
            }
            
            if (resumeData.careerObjective && resumeData.careerObjective.toLowerCase().includes('seeking')) {
                suggestions.push("Rewrite generic objective with specific career goals and value proposition relevant to target role");
            }
            
            if (!resumeData.education) {
                suggestions.push("Include education section with degree, institution, and graduation year - missing education severely impacts ATS scoring");
            }
            
            if (suggestions.length < 3) {
                suggestions.push("Improve overall professionalism by ensuring consistent formatting, error-free language, and complete contact information");
            }
            
            // Take top 3 most critical suggestions
            atsAnalysis = {
                score: fallbackScore,
                suggestions: suggestions.slice(0, 3)
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
