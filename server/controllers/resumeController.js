const Resume = require('../models/Resume');
const mongoose = require('mongoose');

// Create new resume
const createResume = async (req, res) => {
    try {
        console.log('Received resume data:', JSON.stringify(req.body, null, 2));
        
        const {
            fullName,
            email,
            phone,
            address,
            linkedin,
            github,
            portfolio,
            roleAppliedFor,
            skills,
            careerObjective,
            education,
            experience,
            certifications,
            projects
        } = req.body;

        // Process education data
        const educationData = [];
        if (education) {
            Object.keys(education).forEach(key => {
                if (education[key].degree && education[key].college && education[key].year) {
                    educationData.push({
                        degree: education[key].degree,
                        college: education[key].college,
                        year: parseInt(education[key].year)
                    });
                }
            });
        }

        // Process experience data
        const experienceData = [];
        if (experience) {
            Object.keys(experience).forEach(key => {
                if (experience[key].company && experience[key].role && experience[key].duration && experience[key].description) {
                    experienceData.push({
                        company: experience[key].company,
                        role: experience[key].role,
                        duration: experience[key].duration,
                        description: experience[key].description
                    });
                }
            });
        }

        // Process certifications data
        const certificationsData = [];
        if (certifications) {
            Object.keys(certifications).forEach(key => {
                if (certifications[key].name || certifications[key].issuer || certifications[key].date) {
                    certificationsData.push({
                        name: certifications[key].name || '',
                        issuer: certifications[key].issuer || '',
                        date: certifications[key].date || ''
                    });
                }
            });
        }

        // Process projects data
        const projectsData = [];
        if (projects) {
            Object.keys(projects).forEach(key => {
                if (projects[key].title || projects[key].techStack || projects[key].description || projects[key].githubLink) {
                    projectsData.push({
                        title: projects[key].title || '',
                        techStack: projects[key].techStack || '',
                        description: projects[key].description || '',
                        githubLink: projects[key].githubLink || ''
                    });
                }
            });
        }

        // Create resume object
        const resumeData = {
            name: fullName,
            email,
            phone,
            address: address || '',
            socialLinks: {
                linkedin: linkedin || '',
                github: github || '',
                portfolio: portfolio || ''
            },
            roleAppliedFor,
            skills: skills || [],
            objective: careerObjective,
            education: educationData,
            experience: experienceData,
            certifications: certificationsData,
            projects: projectsData
        };

        // Save to database
        const resume = new Resume(resumeData);
        await resume.save();

        res.status(201).json({
            success: true,
            message: 'Resume data saved successfully',
            data: {
                id: resume._id,
                name: resume.name,
                email: resume.email,
                createdAt: resume.createdAt
            }
        });

    } catch (error) {
        console.error('Error saving resume:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving resume data',
            error: error.message
        });
    }
};

// Get resume by ID
const getResume = async (req, res) => {
    try {
        const { id } = req.params;
        const resume = await Resume.findById(id);

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        res.status(200).json({
            success: true,
            data: resume
        });

    } catch (error) {
        console.error('Error fetching resume:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching resume data',
            error: error.message
        });
    }
};

// Get all resumes
const getAllResumes = async (req, res) => {
    try {
        const resumes = await Resume.find().select('name email roleAppliedFor createdAt').sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: resumes.length,
            data: resumes
        });

    } catch (error) {
        console.error('Error fetching resumes:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching resumes',
            error: error.message
        });
    }
};

// Get public resume view by ID (for sharing)
const getPublicResume = async (req, res) => {
    try {
        const { id } = req.params;
        const resume = await Resume.findById(id);

        if (!resume) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Resume Not Found - Smart Resume Builder AI</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                </head>
                <body>
                    <div class="container mt-5">
                        <div class="text-center">
                            <h1 class="text-danger">Resume Not Found</h1>
                            <p class="text-muted">The resume you're looking for doesn't exist or has been removed.</p>
                            <a href="/" class="btn btn-primary">Back to Home</a>
                        </div>
                    </div>
                </body>
                </html>
            `);
        }

        // Generate HTML for public resume view
        const publicResumeHTML = generatePublicResumeHTML(resume);
        res.send(publicResumeHTML);

    } catch (error) {
        console.error('Error fetching public resume:', error);
        res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Error - Smart Resume Builder AI</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <div class="container mt-5">
                    <div class="text-center">
                        <h1 class="text-danger">Error Loading Resume</h1>
                        <p class="text-muted">There was an error loading this resume. Please try again later.</p>
                        <a href="/" class="btn btn-primary">Back to Home</a>
                    </div>
                </div>
            </body>
            </html>
        `);
    }
};

// Delete resume by ID
const deleteResume = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid resume ID format'
            });
        }
        
        const resume = await Resume.findByIdAndDelete(id);

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Resume deleted successfully',
            data: {
                id: resume._id,
                name: resume.name,
                deletedAt: new Date()
            }
        });

    } catch (error) {
        console.error('Error deleting resume:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting resume',
            error: error.message
        });
    }
};

// Generate cover letter using OpenAI API
const generateCoverLetter = async (req, res) => {
    try {
        console.log('📝 Cover letter generation request received:', {
            hasRole: !!req.body.role,
            hasCompanyName: !!req.body.companyName,
            hasResumeData: !!req.body.resumeData,
            dataKeys: Object.keys(req.body)
        });

        const { 
            role, 
            companyName, 
            resumeSummary, 
            experience, 
            skills, 
            resumeData 
        } = req.body;

        // 1. Validate required fields
        if (!role || role.trim() === '') {
            console.log('❌ Missing required field: role');
            return res.status(400).json({
                success: false,
                message: 'Target role/position is required for cover letter generation',
                error: 'MISSING_ROLE'
            });
        }

        // Use resumeData if provided (full resume object) or individual fields
        const fullResumeData = resumeData || {
            fullName: req.body.fullName,
            email: req.body.email,
            phone: req.body.phone,
            careerObjective: resumeSummary,
            experience: experience,
            skills: skills
        };

        // Validate essential resume data
        const validation = validateResumeData(fullResumeData);
        if (!validation.isValid) {
            console.log('❌ Resume validation failed:', validation.errors);
            return res.status(400).json({
                success: false,
                message: 'Resume data validation failed: ' + validation.errors.join(', '),
                error: 'INVALID_RESUME_DATA',
                details: validation.errors
            });
        }

        // 2. Check OpenAI configuration
        if (!process.env.OPENAI_API_KEY) {
            console.log('❌ OpenAI API key not configured');
            return res.status(500).json({
                success: false,
                message: 'AI service is not configured. Please contact support.',
                error: 'OPENAI_NOT_CONFIGURED'
            });
        }

        // 3. Format resume data for prompt
        const formattedData = formatResumeDataForPrompt(fullResumeData, role, companyName);
        console.log('✅ Resume data formatted for prompt:', {
            nameLength: formattedData.name.length,
            experienceCount: formattedData.experienceEntries.length,
            skillsCount: formattedData.skillsList.length,
            hasObjective: !!formattedData.objective
        });

        // 4. Create structured prompt for OpenAI
        const prompt = createCoverLetterPrompt(formattedData, role, companyName);
        
        let coverLetter;
        let isTemplate = false;
        let aiModel = 'gpt-3.5-turbo';

        try {
            // 5. Call OpenAI API with error handling
            console.log('🤖 Calling OpenAI API for cover letter generation...');
            
            const { OpenAI } = require('openai');
            const openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });

            const completion = await openai.chat.completions.create({
                model: aiModel,
                messages: [
                    {
                        role: "system",
                        content: "You are an expert career counselor and professional writer specializing in creating compelling, personalized cover letters. Write engaging cover letters that showcase the candidate's unique value proposition and alignment with the target role. Avoid generic templates and clichés."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7,
                presence_penalty: 0.1,
                frequency_penalty: 0.1
            });

            coverLetter = completion.choices[0].message.content.trim();
            console.log('✅ OpenAI API response received successfully');
            console.log('📊 Cover letter stats:', {
                length: coverLetter.length,
                wordCount: coverLetter.split(' ').length,
                paragraphs: coverLetter.split('\n\n').length
            });

        } catch (openaiError) {
            // 6. Handle OpenAI-specific errors with detailed logging
            console.error('❌ OpenAI API Error:', {
                error: openaiError.message,
                code: openaiError.code,
                type: openaiError.type,
                status: openaiError.status
            });
            
            let errorMessage = 'AI service temporarily unavailable';
            
            if (openaiError.code === 'insufficient_quota') {
                errorMessage = 'AI service quota exceeded';
            } else if (openaiError.code === 'invalid_api_key') {
                errorMessage = 'AI service configuration error';
            } else if (openaiError.code === 'rate_limit_exceeded') {
                errorMessage = 'AI service rate limit exceeded, please try again in a moment';
            }
            
            // Generate template-based cover letter as fallback
            console.log('🔄 Generating template-based cover letter as fallback...');
            coverLetter = generateTemplateCoverLetter(formattedData, role, companyName);
            isTemplate = true;
        }

        // 7. Return generated cover letter with metadata
        const response = {
            success: true,
            data: {
                coverLetter,
                role,
                companyName: companyName || null,
                isTemplate,
                aiModel: isTemplate ? 'template' : aiModel,
                wordCount: coverLetter.split(' ').length,
                generatedAt: new Date().toISOString()
            },
            message: isTemplate 
                ? 'Cover letter generated using professional template (AI service temporarily unavailable)'
                : 'Cover letter generated successfully using AI'
        };

        console.log('✅ Cover letter generation completed:', {
            isTemplate,
            wordCount: response.data.wordCount,
            role,
            companyName: companyName || 'not specified'
        });

        res.json(response);

    } catch (error) {
        // 8. Comprehensive error logging and handling
        console.error('❌ Critical error in cover letter generation:', {
            message: error.message,
            stack: error.stack,
            requestBody: req.body
        });
        
        res.status(500).json({
            success: false,
            message: 'An unexpected error occurred while generating the cover letter. Please try again.',
            error: 'INTERNAL_SERVER_ERROR',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Helper function to generate public resume HTML
const generatePublicResumeHTML = (resume) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${resume.name} - Resume | Smart Resume Builder AI</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <style>
        body {
            background-color: #f8f9fa;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .resume-container {
            max-width: 8.5in;
            margin: 0 auto;
            min-height: 11in;
            background: white;
            font-family: 'Times New Roman', serif;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
        }
        
        .public-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 8px 8px 0 0;
            text-align: center;
        }
        
        .public-header h1 {
            margin: 0;
            font-size: 2.5rem;
            font-weight: bold;
        }
        
        .public-header .subtitle {
            font-size: 1.2rem;
            margin-top: 0.5rem;
            opacity: 0.9;
        }
        
        .contact-info {
            margin-top: 1rem;
        }
        
        .contact-info span {
            margin: 0 1rem;
            font-size: 0.9rem;
        }
        
        .section-title {
            color: #2c3e50;
            border-bottom: 2px solid #667eea;
            padding-bottom: 0.5rem;
            margin-bottom: 1.5rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .skills-container .badge {
            background: #667eea;
            color: white;
            margin: 0.2rem;
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
        }
        
        .experience-item, .education-item, .project-item, .certification-item {
            margin-bottom: 2rem;
            padding-left: 1rem;
            border-left: 3px solid #667eea;
        }
        
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.5rem;
        }
        
        .item-title {
            font-weight: bold;
            color: #2c3e50;
            margin: 0;
        }
        
        .item-subtitle {
            color: #667eea;
            font-weight: 500;
            margin: 0;
        }
        
        .item-duration {
            color: #6c757d;
            font-style: italic;
            font-size: 0.9rem;
        }
        
        .public-actions {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 0 0 8px 8px;
            text-align: center;
            border-top: 1px solid #dee2e6;
        }
        
        .powered-by {
            color: #6c757d;
            font-size: 0.8rem;
            margin-top: 1rem;
        }
        
        @media print {
            .public-actions {
                display: none !important;
            }
            
            body {
                background: white;
            }
            
            .resume-container {
                box-shadow: none;
                border-radius: 0;
            }
        }
        
        @media (max-width: 768px) {
            .resume-container {
                margin: 1rem;
                max-width: none;
            }
            
            .public-header h1 {
                font-size: 2rem;
            }
            
            .item-header {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="container-fluid py-4">
        <div class="resume-container">
            ${generatePublicResumeContent(resume)}
            
            <div class="public-actions">
                <button onclick="downloadPDF()" class="btn btn-primary me-3">
                    <i class="fas fa-download me-2"></i>Download PDF
                </button>
                <button onclick="window.print()" class="btn btn-outline-primary me-3">
                    <i class="fas fa-print me-2"></i>Print Resume
                </button>
                <a href="/" class="btn btn-outline-secondary">
                    <i class="fas fa-home me-2"></i>Create Your Own Resume
                </a>
                
                <div class="powered-by">
                    <i class="fas fa-bolt me-1"></i>
                    Powered by <strong>Smart Resume Builder AI</strong>
                </div>
            </div>
        </div>
    </div>

    <script>
        function downloadPDF() {
            const element = document.querySelector('.resume-container');
            const downloadBtn = event.target;
            const originalText = downloadBtn.innerHTML;
            
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating PDF...';
            downloadBtn.disabled = true;
            
            const opt = {
                margin: [0.5, 0.5, 0.5, 0.5],
                filename: '${resume.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_resume.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    letterRendering: true
                },
                jsPDF: { 
                    unit: 'in', 
                    format: 'letter', 
                    orientation: 'portrait' 
                }
            };
            
            html2pdf().set(opt).from(element).save().then(() => {
                downloadBtn.innerHTML = originalText;
                downloadBtn.disabled = false;
            }).catch((error) => {
                console.error('Error generating PDF:', error);
                downloadBtn.innerHTML = originalText;
                downloadBtn.disabled = false;
                alert('Error generating PDF. Please try again.');
            });
        }
    </script>
</body>
</html>
    `;
};

// Helper function to generate resume content for public view
const generatePublicResumeContent = (resume) => {
    return `
        <!-- Header Section -->
        <div class="public-header">
            <h1>${resume.name}</h1>
            <div class="subtitle">${resume.roleAppliedFor}</div>
            <div class="contact-info">
                <span><i class="fas fa-envelope me-1"></i>${resume.email}</span>
                ${resume.phone ? `<span><i class="fas fa-phone me-1"></i>${resume.phone}</span>` : ''}
                ${resume.address ? `<span><i class="fas fa-map-marker-alt me-1"></i>${resume.address}</span>` : ''}
            </div>
            ${(resume.socialLinks.linkedin || resume.socialLinks.github || resume.socialLinks.portfolio) ? `
            <div class="contact-info mt-2">
                ${resume.socialLinks.linkedin ? `<span><a href="${resume.socialLinks.linkedin}" target="_blank" class="text-white"><i class="fab fa-linkedin me-1"></i>LinkedIn</a></span>` : ''}
                ${resume.socialLinks.github ? `<span><a href="${resume.socialLinks.github}" target="_blank" class="text-white"><i class="fab fa-github me-1"></i>GitHub</a></span>` : ''}
                ${resume.socialLinks.portfolio ? `<span><a href="${resume.socialLinks.portfolio}" target="_blank" class="text-white"><i class="fas fa-globe me-1"></i>Portfolio</a></span>` : ''}
            </div>
            ` : ''}
        </div>
        
        <div class="p-4">
            ${resume.objective ? `
            <!-- Objective Section -->
            <div class="mb-4">
                <h3 class="section-title"><i class="fas fa-bullseye me-2"></i>Professional Objective</h3>
                <p class="text-muted">${resume.objective}</p>
            </div>
            ` : ''}
            
            ${resume.skills && resume.skills.length > 0 ? `
            <!-- Skills Section -->
            <div class="mb-4">
                <h3 class="section-title"><i class="fas fa-code me-2"></i>Technical Skills</h3>
                <div class="skills-container">
                    ${resume.skills.map(skill => `<span class="badge">${skill}</span>`).join('')}
                </div>
            </div>
            ` : ''}
            
            ${resume.experience && resume.experience.length > 0 ? `
            <!-- Experience Section -->
            <div class="mb-4">
                <h3 class="section-title"><i class="fas fa-briefcase me-2"></i>Professional Experience</h3>
                ${resume.experience.map(exp => `
                    <div class="experience-item">
                        <div class="item-header">
                            <div>
                                <h4 class="item-title">${exp.role}</h4>
                                <p class="item-subtitle">${exp.company}</p>
                            </div>
                            <div class="item-duration">${exp.duration}</div>
                        </div>
                        <p class="text-muted">${exp.description}</p>
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${resume.education && resume.education.length > 0 ? `
            <!-- Education Section -->
            <div class="mb-4">
                <h3 class="section-title"><i class="fas fa-graduation-cap me-2"></i>Education</h3>
                ${resume.education.map(edu => `
                    <div class="education-item">
                        <div class="item-header">
                            <div>
                                <h4 class="item-title">${edu.degree}</h4>
                                <p class="item-subtitle">${edu.college}</p>
                            </div>
                            <div class="item-duration">${edu.year}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${resume.projects && resume.projects.length > 0 ? `
            <!-- Projects Section -->
            <div class="mb-4">
                <h3 class="section-title"><i class="fas fa-project-diagram me-2"></i>Projects</h3>
                ${resume.projects.map(proj => `
                    <div class="project-item">
                        <div class="item-header">
                            <div>
                                <h4 class="item-title">${proj.title}</h4>
                                ${proj.techStack ? `<p class="item-subtitle">Technologies: ${proj.techStack}</p>` : ''}
                            </div>
                            ${proj.githubLink ? `<div><a href="${proj.githubLink}" target="_blank" class="text-decoration-none"><i class="fab fa-github me-1"></i>GitHub</a></div>` : ''}
                        </div>
                        ${proj.description ? `<p class="text-muted">${proj.description}</p>` : ''}
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${resume.certifications && resume.certifications.length > 0 ? `
            <!-- Certifications Section -->
            <div class="mb-4">
                <h3 class="section-title"><i class="fas fa-certificate me-2"></i>Certifications</h3>
                ${resume.certifications.map(cert => `
                    <div class="certification-item">
                        <div class="item-header">
                            <div>
                                <h4 class="item-title">${cert.name}</h4>
                                ${cert.issuer ? `<p class="item-subtitle">${cert.issuer}</p>` : ''}
                            </div>
                            ${cert.date ? `<div class="item-duration">${cert.date}</div>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
            ` : ''}
        </div>
    `;
};

// Helper function to validate resume data for cover letter generation
const validateResumeData = (resumeData) => {
    const errors = [];
    
    // Check for basic contact information
    if (!resumeData.fullName || resumeData.fullName.trim() === '') {
        errors.push('Full name is required');
    }
    
    // Check for experience (either experience array or career objective)
    const hasExperience = resumeData.experience && 
        (Array.isArray(resumeData.experience) ? resumeData.experience.length > 0 : Object.keys(resumeData.experience).length > 0);
    
    const hasObjective = resumeData.careerObjective && resumeData.careerObjective.trim() !== '';
    
    if (!hasExperience && !hasObjective) {
        errors.push('Either work experience or career objective is required');
    }
    
    // Check for skills
    const hasSkills = resumeData.skills && 
        (Array.isArray(resumeData.skills) ? resumeData.skills.length > 0 : resumeData.skills.trim() !== '');
    
    if (!hasSkills) {
        errors.push('Skills section is required');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

// Helper function to format resume data for prompt
const formatResumeDataForPrompt = (resumeData, role, companyName) => {
    // Format experience entries
    let experienceEntries = [];
    if (resumeData.experience) {
        if (Array.isArray(resumeData.experience)) {
            experienceEntries = resumeData.experience.filter(exp => exp.role && exp.company);
        } else {
            // Handle object format
            experienceEntries = Object.values(resumeData.experience).filter(exp => exp.role && exp.company);
        }
    }
    
    // Format skills list
    let skillsList = [];
    if (resumeData.skills) {
        if (Array.isArray(resumeData.skills)) {
            skillsList = resumeData.skills.filter(skill => skill && skill.trim() !== '');
        } else if (typeof resumeData.skills === 'string') {
            skillsList = resumeData.skills.split(',').map(s => s.trim()).filter(s => s !== '');
        }
    }
    
    return {
        name: resumeData.fullName || 'Professional',
        email: resumeData.email || '',
        phone: resumeData.phone || '',
        objective: resumeData.careerObjective || '',
        experienceEntries,
        skillsList,
        education: resumeData.education || null,
        projects: resumeData.projects || null,
        certifications: resumeData.certifications || null
    };
};

// Helper function to create structured prompt for OpenAI
const createCoverLetterPrompt = (formattedData, role, companyName) => {
    const experienceText = formattedData.experienceEntries.length > 0
        ? formattedData.experienceEntries.map(exp => 
            `${exp.role} at ${exp.company}${exp.duration ? ` (${exp.duration})` : ''}: ${exp.description || 'Key responsibilities and achievements'}`
          ).join('\n')
        : 'Recent graduate or career changer with transferable skills';
    
    const skillsText = formattedData.skillsList.length > 0
        ? formattedData.skillsList.join(', ')
        : 'Various professional and technical skills';
    
    return `Create a compelling, personalized cover letter for this job application:

CANDIDATE PROFILE:
Name: ${formattedData.name}
Target Position: ${role}
${companyName ? `Target Company: ${companyName}` : 'Target Company: [Company applying to]'}

PROFESSIONAL BACKGROUND:
${formattedData.objective ? `Career Objective: ${formattedData.objective}` : ''}

Work Experience:
${experienceText}

Core Skills & Competencies:
${skillsText}

COVER LETTER REQUIREMENTS:
1. Professional, engaging tone that showcases personality
2. 3-4 well-structured paragraphs (300-400 words total)
3. Strong opening that captures attention
4. Middle paragraphs highlighting relevant experience and achievements
5. Closing with clear call-to-action
6. Personalized to the role and company (if specified)
7. Avoid generic templates, clichés, and placeholder text
8. Include specific examples from experience when possible
9. Show enthusiasm and cultural fit
10. Professional salutation and closing

AVOID:
- Generic phrases like "I am writing to express my interest"
- Repetition of resume content without adding value
- Overly formal or outdated language
- Spelling/grammar errors
- Placeholder text like [Your Name] or [Company Name]

OUTPUT FORMAT:
Return only the complete cover letter text, properly formatted with appropriate spacing between paragraphs. Do not include any additional commentary or explanations.`;
};

// Helper function to generate template-based cover letter (enhanced)
const generateTemplateCoverLetter = (formattedData, role, companyName) => {
    const company = companyName || 'your organization';
    const position = role || 'this position';
    const name = formattedData.name;
    
    // Create experience summary
    const experienceText = formattedData.experienceEntries.length > 0
        ? formattedData.experienceEntries.map(exp => 
            `${exp.role} at ${exp.company}`
          ).join(', ')
        : 'professional experience in various roles';
    
    // Create skills summary
    const skillsText = formattedData.skillsList.length > 0
        ? formattedData.skillsList.slice(0, 5).join(', ') // Top 5 skills
        : 'technical and professional skills';
    
    // Use career objective if available
    const objectiveText = formattedData.objective 
        ? formattedData.objective
        : `seeking opportunities to contribute to ${company}'s success while advancing my career in ${role}`;
    
    return `Dear Hiring Manager,

I am excited to submit my application for the ${position} position${companyName ? ` at ${companyName}` : ''}. ${objectiveText} With my background in ${experienceText} and expertise in ${skillsText}, I am confident I would be a valuable addition to your team.

My professional experience has equipped me with both the technical capabilities and collaborative mindset necessary to excel in this role. I have consistently delivered high-quality results while working effectively in team environments. ${formattedData.experienceEntries.length > 0 ? `In my previous roles, including ${formattedData.experienceEntries[0].role}${formattedData.experienceEntries[0].company ? ` at ${formattedData.experienceEntries[0].company}` : ''}, I have developed strong problem-solving skills and the ability to adapt to new challenges quickly.` : 'I bring fresh perspectives and a strong commitment to professional excellence.'}

I am particularly drawn to ${company} because of your commitment to innovation and excellence. The ${position} role aligns perfectly with my career goals and would allow me to contribute meaningfully while continuing to develop my expertise in ${skillsText}. I am eager to bring my passion for quality work and continuous improvement to your team.

Thank you for considering my application. I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to your organization's continued success. I look forward to hearing from you soon.

Sincerely,
${name}`;
};

module.exports = {
    createResume,
    getResume,
    getAllResumes,
    getPublicResume,
    deleteResume,
    generateCoverLetter
};
