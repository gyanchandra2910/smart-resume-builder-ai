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

        // Extract target role for tailored analysis
        const targetRole = resumeData.roleAppliedFor || 'General Professional';
        
        // Create the prompt for ATS analysis with dynamic, role-specific evaluation
        const prompt = `
You are an advanced ATS (Applicant Tracking System) evaluator that provides realistic, tailored scoring based on the specific target role and resume content quality.

TARGET ROLE: ${targetRole}

**DYNAMIC SCORING APPROACH:**
- Scores vary based on content quality, completeness, and role alignment
- Consider the target role when evaluating keywords and relevance
- Provide realistic scores ranging from 20-95 based on actual resume quality
- Focus on constructive, role-specific feedback

**EVALUATION CRITERIA:**
1. **Role Alignment (25 pts)**: Keywords, skills, and experience relevant to "${targetRole}"
2. **Content Quality (25 pts)**: Quantified achievements, specific examples, measurable impact
3. **Professional Presentation (20 pts)**: Complete sections, consistent formatting, clear structure
4. **Experience Relevance (15 pts)**: Job descriptions that match target role requirements
5. **Skills & Keywords (15 pts)**: Technical and soft skills appropriate for "${targetRole}"

**ROLE-SPECIFIC CONSIDERATIONS:**
${targetRole.toLowerCase().includes('software') || targetRole.toLowerCase().includes('developer') || targetRole.toLowerCase().includes('engineer') ? 
`- Technical skills and programming languages are crucial
- Project portfolio and GitHub links add value
- System design and architecture experience matters
- Code quality and development methodologies important` :
targetRole.toLowerCase().includes('marketing') || targetRole.toLowerCase().includes('sales') ? 
`- Marketing campaign results and sales metrics essential
- Lead generation and conversion rates important
- Social media and digital marketing skills valued
- Customer relationship management experience crucial` :
targetRole.toLowerCase().includes('data') || targetRole.toLowerCase().includes('analyst') ?
`- Statistical analysis and data visualization skills key
- Experience with data tools (SQL, Python, R, Tableau)
- Business intelligence and reporting experience valued
- Problem-solving and analytical thinking important` :
`- Industry-specific skills and terminology important
- Leadership and team management experience valued
- Communication and collaboration skills essential
- Professional certifications and training relevant`}

**SCORING GUIDELINES:**
- 80-95: Exceptional resume with strong role alignment, quantified achievements, and professional excellence
- 65-79: Good resume with solid experience and skills matching the role
- 50-64: Average resume with basic qualifications but room for improvement
- 35-49: Below average resume lacking key elements for the role
- 20-34: Poor resume with significant gaps and minimal relevant content

RESUME TO ANALYZE:
${plainTextResume}

Analyze this resume specifically for the "${targetRole}" position. Consider how well the candidate's background aligns with typical requirements for this role.

OUTPUT ONLY THIS JSON:

{
  "score": [realistic score 20-95 based on actual content quality and role fit],
  "suggestions": [
    "Most important role-specific improvement for ${targetRole}",
    "Second critical enhancement to strengthen candidacy",
    "Third key change to improve ATS compatibility and role alignment"
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
                        content: `You are an advanced ATS analyzer that provides realistic, tailored scoring based on job role and resume quality. Provide scores between 25-90 based on actual content. Consider the target role "${resumeData.roleAppliedFor || 'General Professional'}" when evaluating keywords, skills, and experience relevance. Always respond with valid JSON containing a realistic score and exactly 3 specific, actionable, role-tailored suggestions.`
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
            console.log('OpenAI API Error, using dynamic fallback ATS analysis:', openaiError.message);
            
            // Dynamic Fallback ATS analysis when OpenAI is not available
            const targetRole = resumeData.roleAppliedFor || 'General Professional';
            let fallbackScore = 30; // Start with base score
            
            // Section completeness scoring (40 points max)
            if (resumeData.skills && resumeData.skills.length > 0) fallbackScore += 8;
            if (resumeData.experience && Object.keys(resumeData.experience).length > 0) fallbackScore += 15;
            if (resumeData.education && Object.keys(resumeData.education).length > 0) fallbackScore += 8;
            if (resumeData.careerObjective || resumeData.objective) fallbackScore += 5;
            if (resumeData.projects && Object.keys(resumeData.projects).length > 0) fallbackScore += 8;
            if (resumeData.certifications && Object.keys(resumeData.certifications).length > 0) fallbackScore += 6;
            
            // Role-specific keyword analysis (20 points max)
            const roleKeywords = getRoleSpecificKeywords(targetRole);
            const resumeText = JSON.stringify(resumeData).toLowerCase();
            let keywordMatches = 0;
            
            roleKeywords.forEach(keyword => {
                if (resumeText.includes(keyword.toLowerCase())) {
                    keywordMatches++;
                }
            });
            
            const keywordScore = Math.min(20, (keywordMatches / roleKeywords.length) * 20);
            fallbackScore += keywordScore;
            
            // Check for quantified achievements (15 points max)
            let hasMetrics = false;
            let metricScore = 0;
            if (resumeData.experience) {
                const expText = JSON.stringify(resumeData.experience).toLowerCase();
                const metricPatterns = [
                    /\d+%/, /\d+\+/, /\$\d+/, /\d+,\d+/, 
                    /\d+ (years|months|clients|projects|users|sales|revenue|improvement|increase|decrease|team|people)/,
                    /(increased|decreased|improved|reduced|managed|led|developed|created) .* \d+/
                ];
                
                metricPatterns.forEach(pattern => {
                    if (pattern.test(expText)) {
                        hasMetrics = true;
                        metricScore += 3;
                    }
                });
                metricScore = Math.min(15, metricScore);
                fallbackScore += metricScore;
            }
            
            // Professional presentation (10 points max)
            let presentationScore = 0;
            if (resumeData.fullName || resumeData.name) presentationScore += 2;
            if (resumeData.email && resumeData.email.includes('@')) presentationScore += 2;
            if (resumeData.phone) presentationScore += 2;
            if ((resumeData.careerObjective || resumeData.objective) && 
                (resumeData.careerObjective || resumeData.objective).length > 50) presentationScore += 2;
            if (resumeData.skills && resumeData.skills.length >= 5) presentationScore += 2;
            
            fallbackScore += presentationScore;
            
            // Add randomization to avoid same score every time (±5 points)
            const randomAdjustment = Math.floor(Math.random() * 11) - 5; // -5 to +5
            fallbackScore += randomAdjustment;
            
            // Ensure realistic scoring range based on content quality
            if (!hasMetrics && (!resumeData.experience || Object.keys(resumeData.experience).length === 0)) {
                fallbackScore = Math.min(fallbackScore, 45);
            }
            if (!resumeData.education || Object.keys(resumeData.education).length === 0) {
                fallbackScore = Math.min(fallbackScore, 55);
            }
            if (keywordScore < 5) {
                fallbackScore = Math.min(fallbackScore, 50);
            }
            
            // Final range validation
            fallbackScore = Math.max(25, Math.min(fallbackScore, 88));
            
            // Generate role-specific suggestions
            const suggestions = generateRoleSpecificSuggestions(resumeData, targetRole, hasMetrics, keywordMatches, roleKeywords.length);
            
            atsAnalysis = {
                score: fallbackScore,
                suggestions: suggestions
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

// Helper function to get role-specific keywords
const getRoleSpecificKeywords = (targetRole) => {
    const role = targetRole.toLowerCase();
    
    if (role.includes('software') || role.includes('developer') || role.includes('engineer') || role.includes('programmer')) {
        return [
            'programming', 'coding', 'software development', 'algorithms', 'data structures',
            'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'git', 'api',
            'frontend', 'backend', 'full-stack', 'agile', 'scrum', 'debugging',
            'testing', 'deployment', 'version control', 'database', 'frameworks'
        ];
    } else if (role.includes('data') || role.includes('analyst') || role.includes('scientist')) {
        return [
            'data analysis', 'statistical analysis', 'machine learning', 'python', 'r',
            'sql', 'tableau', 'power bi', 'excel', 'statistics', 'visualization',
            'predictive modeling', 'data mining', 'business intelligence', 'pandas',
            'numpy', 'matplotlib', 'regression', 'classification', 'clustering'
        ];
    } else if (role.includes('marketing') || role.includes('digital marketing')) {
        return [
            'digital marketing', 'social media', 'seo', 'sem', 'content marketing',
            'email marketing', 'google analytics', 'facebook ads', 'lead generation',
            'conversion optimization', 'brand management', 'campaign management',
            'market research', 'customer acquisition', 'roi', 'kpi', 'crm'
        ];
    } else if (role.includes('sales') || role.includes('business development')) {
        return [
            'sales', 'lead generation', 'customer relationship', 'crm', 'quota',
            'revenue', 'pipeline', 'prospecting', 'closing', 'negotiation',
            'account management', 'client retention', 'business development',
            'territory management', 'sales targets', 'forecasting'
        ];
    } else if (role.includes('project') || role.includes('management') || role.includes('manager')) {
        return [
            'project management', 'team leadership', 'agile', 'scrum', 'kanban',
            'budget management', 'stakeholder management', 'risk management',
            'timeline', 'deliverables', 'cross-functional', 'coordination',
            'planning', 'execution', 'monitoring', 'reporting', 'pmp'
        ];
    } else if (role.includes('design') || role.includes('ui') || role.includes('ux')) {
        return [
            'user experience', 'user interface', 'design thinking', 'wireframing',
            'prototyping', 'figma', 'sketch', 'adobe', 'user research', 'usability',
            'visual design', 'interaction design', 'responsive design', 'accessibility',
            'design systems', 'user testing', 'information architecture'
        ];
    } else if (role.includes('finance') || role.includes('accounting')) {
        return [
            'financial analysis', 'budgeting', 'forecasting', 'accounting', 'gaap',
            'financial reporting', 'excel', 'financial modeling', 'variance analysis',
            'cost accounting', 'tax preparation', 'audit', 'compliance', 'quickbooks'
        ];
    } else if (role.includes('hr') || role.includes('human resources')) {
        return [
            'human resources', 'recruitment', 'talent acquisition', 'employee relations',
            'performance management', 'compensation', 'benefits', 'hris', 'compliance',
            'training', 'development', 'onboarding', 'policy development', 'workforce planning'
        ];
    }
    
    // Generic professional keywords
    return [
        'professional', 'communication', 'collaboration', 'problem solving',
        'analytical', 'leadership', 'teamwork', 'organization', 'time management',
        'customer service', 'attention to detail', 'adaptability', 'innovation'
    ];
};

// Helper function to generate role-specific suggestions
const generateRoleSpecificSuggestions = (resumeData, targetRole, hasMetrics, keywordMatches, totalKeywords) => {
    const suggestions = [];
    const role = targetRole.toLowerCase();
    
    // Priority 1: Metrics and achievements
    if (!hasMetrics) {
        if (role.includes('sales') || role.includes('marketing')) {
            suggestions.push(`Add quantified sales/marketing achievements for ${targetRole} (e.g., "Increased sales by 35%", "Generated 500+ leads", "Improved conversion rate by 15%")`);
        } else if (role.includes('software') || role.includes('developer')) {
            suggestions.push(`Include specific technical achievements for ${targetRole} (e.g., "Optimized code performance by 40%", "Built system serving 10K+ users", "Reduced load time by 60%")`);
        } else if (role.includes('project') || role.includes('management')) {
            suggestions.push(`Add project management metrics for ${targetRole} (e.g., "Managed $2M budget", "Led team of 12", "Delivered projects 20% under timeline")`);
        } else {
            suggestions.push(`Include quantified achievements relevant to ${targetRole} with specific numbers, percentages, and measurable impact`);
        }
    }
    
    // Priority 2: Role-specific keywords and skills
    const keywordScore = (keywordMatches / totalKeywords) * 100;
    if (keywordScore < 30) {
        if (role.includes('software') || role.includes('developer')) {
            suggestions.push(`Add technical skills essential for ${targetRole} (programming languages, frameworks, tools, methodologies like Agile/Scrum)`);
        } else if (role.includes('data') || role.includes('analyst')) {
            suggestions.push(`Include data analysis tools and techniques for ${targetRole} (SQL, Python/R, Tableau, statistical methods, machine learning)`);
        } else if (role.includes('marketing')) {
            suggestions.push(`Add digital marketing skills for ${targetRole} (SEO/SEM, social media platforms, analytics tools, campaign management)`);
        } else if (role.includes('design')) {
            suggestions.push(`Include design tools and methodologies for ${targetRole} (Figma, Adobe Creative Suite, user research, prototyping)`);
        } else {
            suggestions.push(`Incorporate industry-specific keywords and skills relevant to ${targetRole} throughout your resume`);
        }
    }
    
    // Priority 3: Experience and content quality
    if (!resumeData.experience || Object.keys(resumeData.experience).length === 0) {
        suggestions.push(`Add relevant work experience for ${targetRole}, including internships, freelance work, or significant projects that demonstrate applicable skills`);
    } else {
        // Check for weak descriptions
        const expText = JSON.stringify(resumeData.experience);
        if (expText.includes('responsible for') || expText.includes('worked on') || expText.length < 200) {
            suggestions.push(`Strengthen experience descriptions for ${targetRole} with action verbs, specific responsibilities, and achievements that demonstrate your impact`);
        }
    }
    
    // Additional role-specific suggestions
    if (suggestions.length < 3) {
        if (role.includes('software') || role.includes('developer')) {
            suggestions.push(`Consider adding a portfolio section with GitHub links and technical projects that showcase your ${targetRole} skills`);
        } else if (role.includes('marketing') || role.includes('sales')) {
            suggestions.push(`Include campaign results, client testimonials, or case studies that demonstrate your ${targetRole} success`);
        } else if (role.includes('management') || role.includes('leadership')) {
            suggestions.push(`Highlight leadership experiences, team management, and strategic initiatives relevant to ${targetRole}`);
        } else {
            suggestions.push(`Tailor your professional objective and experience descriptions specifically to ${targetRole} requirements`);
        }
    }
    
    // Generic improvement suggestions if still needed
    const genericSuggestions = [
        `Optimize resume formatting and structure for better ATS compatibility in ${targetRole} applications`,
        `Add relevant certifications or training that enhance your qualification for ${targetRole}`,
        `Include volunteer work or side projects that demonstrate skills applicable to ${targetRole}`,
        `Ensure all resume sections are complete and professionally formatted for ${targetRole} screening`
    ];
    
    while (suggestions.length < 3) {
        suggestions.push(genericSuggestions[suggestions.length] || genericSuggestions[0]);
    }
    
    return suggestions.slice(0, 3);
};

module.exports = {
    checkATSScore
};
