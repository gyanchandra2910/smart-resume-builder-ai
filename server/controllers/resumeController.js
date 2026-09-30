const Resume = require('../models/Resume');
const mongoose = require('mongoose');

// Create new resume
const createResume = async (req, res) => {
    try {
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
            projects,
            achievements,
            activities
        } = req.body;

        if (!fullName?.trim() || !email?.trim() || !phone?.trim() ||
            !roleAppliedFor?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Full name, email, phone and role are required'
            });
        }

        if (!Array.isArray(skills) || skills.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one skill is required'
            });
        }

        // Process education data
        const educationData = [];
        if (education) {
            Object.keys(education).forEach(key => {
                if (education[key].degree && education[key].college && education[key].year) {
                    educationData.push({
                        degree: education[key].degree,
                        college: education[key].college,
                        year: String(education[key].year).trim(),
                        score: education[key].score || ''
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
                        location: experience[key].location || '',
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
                if (projects[key].title || projects[key].techStack || projects[key].description || projects[key].githubLink || projects[key].duration) {
                    projectsData.push({
                        title: projects[key].title || '',
                        techStack: projects[key].techStack || '',
                        description: projects[key].description || '',
                        githubLink: projects[key].githubLink || '',
                        duration: projects[key].duration || ''
                    });
                }
            });
        }

        const achievementsData = achievements
            ? Object.values(achievements)
                .filter(item => item?.title || item?.description)
                .map(item => ({
                    title: item.title || '',
                    description: item.description || '',
                    date: item.date || ''
                }))
            : [];

        const activitiesData = activities
            ? Object.values(activities)
                .filter(item => item?.description)
                .map(item => ({ description: item.description }))
            : [];

        // Create resume object
        const resumeData = {
            userId: req.userId,
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
            objective: careerObjective || '',
            education: educationData,
            experience: experienceData,
            certifications: certificationsData,
            projects: projectsData,
            achievements: achievementsData,
            activities: activitiesData
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

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid resume ID format'
            });
        }

        const resume = await Resume.findOne({ _id: id, userId: req.userId });

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
        const resumes = await Resume.find({ userId: req.userId })
            .select('name email roleAppliedFor createdAt')
            .sort({ createdAt: -1 });

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

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).send(renderMessagePage(
                'Invalid Resume Link',
                'The resume link you opened is invalid.',
                'warning'
            ));
        }

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
        
        const resume = await Resume.findOneAndDelete({ _id: id, userId: req.userId });

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

        // 2. Format resume data for prompt
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
        let aiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';

        try {
            // 5. Call OpenAI API with error handling
            console.log('🤖 Calling OpenAI API for cover letter generation...');
            
            const { OpenAI } = require('openai');
            if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_NOT_CONFIGURED');

            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

const escapeHtml = (value = '') => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const safeExternalUrl = (value) => {
    if (!value) return '';

    try {
        const url = new URL(String(value));
        return ['http:', 'https:'].includes(url.protocol) ? escapeHtml(url.href) : '';
    } catch {
        return '';
    }
};

const sanitizeResumeForHtml = (resume) => ({
    name: escapeHtml(resume.name),
    email: escapeHtml(resume.email),
    phone: escapeHtml(resume.phone),
    address: escapeHtml(resume.address),
    roleAppliedFor: escapeHtml(resume.roleAppliedFor),
    objective: escapeHtml(resume.objective),
    socialLinks: {
        linkedin: safeExternalUrl(resume.socialLinks?.linkedin),
        github: safeExternalUrl(resume.socialLinks?.github),
        portfolio: safeExternalUrl(resume.socialLinks?.portfolio)
    },
    skills: (resume.skills || []).map(escapeHtml),
    experience: (resume.experience || []).map(exp => ({
        role: escapeHtml(exp.role),
        company: escapeHtml(exp.company),
        duration: escapeHtml(exp.duration),
        location: escapeHtml(exp.location),
        description: escapeHtml(exp.description)
    })),
    education: (resume.education || []).map(edu => ({
        degree: escapeHtml(edu.degree),
        college: escapeHtml(edu.college),
        year: escapeHtml(edu.year),
        score: escapeHtml(edu.score)
    })),
    projects: (resume.projects || []).map(project => ({
        title: escapeHtml(project.title),
        techStack: escapeHtml(project.techStack),
        description: escapeHtml(project.description),
        githubLink: safeExternalUrl(project.githubLink),
        duration: escapeHtml(project.duration)
    })),
    certifications: (resume.certifications || []).map(certification => ({
        name: escapeHtml(certification.name),
        issuer: escapeHtml(certification.issuer),
        date: escapeHtml(certification.date)
    })),
    achievements: (resume.achievements || []).map(achievement => ({
        title: escapeHtml(achievement.title),
        description: escapeHtml(achievement.description),
        date: escapeHtml(achievement.date)
    })),
    activities: (resume.activities || []).map(activity => ({
        description: escapeHtml(activity.description)
    }))
});

const renderMessagePage = (title, message, tone = 'danger') => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)} - Smart Resume Builder AI</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5 text-center">
        <h1 class="text-${escapeHtml(tone)}">${escapeHtml(title)}</h1>
        <p class="text-muted">${escapeHtml(message)}</p>
        <a href="/" class="btn btn-primary">Back to Home</a>
    </div>
</body>
</html>`;

// Helper function to generate public resume HTML
const generatePublicResumeHTML = (resume) => {
    const safeResume = sanitizeResumeForHtml(resume);
    const pdfFilename = `${String(resume.name || 'resume').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_resume.pdf`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeResume.name} - Resume | Smart Resume Builder AI</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <style>
        body {
            background-color: #eceff3;
            color: #111;
            font-family: Georgia, 'Times New Roman', serif;
        }
        
        .resume-container {
            max-width: 8.5in;
            margin: 0 auto;
            background: white;
            font-family: Georgia, 'Times New Roman', serif;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .resume-document {
            min-height: 11in;
        }
        
        .public-header {
            color: #111;
            padding: 0.42in 0.5in 0.08in;
            text-align: center;
        }
        
        .public-header h1 {
            margin: 0;
            font-size: 1.75rem;
            font-weight: bold;
            line-height: 1.1;
        }
        
        .public-header .subtitle {
            font-size: 0.72rem;
            margin-top: 0.35rem;
        }
        
        .contact-info {
            margin-top: 0.35rem;
            font-size: 0.7rem;
        }
        
        .contact-info span {
            margin: 0 0.2rem;
        }

        .contact-info span + span::before {
            content: '|';
            color: #666;
            margin-right: 0.4rem;
        }

        .contact-info a {
            color: inherit;
            text-decoration: none;
        }

        .resume-body {
            padding: 0 0.5in 0.5in;
            font-size: 0.72rem;
            line-height: 1.28;
        }
        
        .section-title {
            color: #111;
            border-bottom: 1.2px solid #111;
            padding-bottom: 0.08rem;
            margin: 0.48rem 0 0.18rem;
            font-size: 0.76rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.035em;
        }
        
        .skills-container .badge {
            background: none;
            color: #111;
            margin: 0;
            padding: 0;
            font-size: inherit;
        }

        .skills-container .badge + .badge::before {
            content: ' • ';
            margin: 0 0.3rem;
        }
        
        .experience-item, .education-item, .project-item, .certification-item {
            margin-bottom: 0.32rem;
            padding: 0;
            break-inside: avoid;
        }
        
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.05rem;
        }
        
        .item-title {
            font-weight: bold;
            color: #111;
            margin: 0;
            font-size: 0.73rem;
        }
        
        .item-subtitle {
            color: #111;
            font-weight: 400;
            margin: 0;
            font-style: italic;
        }
        
        .item-duration {
            color: #6c757d;
            font-style: italic;
            font-size: 0.68rem;
            white-space: nowrap;
        }

        .item-description {
            margin: 0.08rem 0 0;
            white-space: pre-line;
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
            @page {
                size: A4;
                margin: 0;
            }

            .public-actions {
                display: none !important;
            }
            
            body {
                background: white;
            }
            
            .resume-container {
                box-shadow: none;
                width: 210mm;
                min-height: 297mm;
            }
        }
        
        @media (max-width: 768px) {
            .resume-container {
                margin: 1rem;
                max-width: none;
            }
            
            .public-header h1 {
                font-size: 1.55rem;
            }
        }
    </style>
</head>
<body>
    <div class="container-fluid py-4">
        <div class="resume-container">
            <div class="resume-document">
                ${generatePublicResumeContent(safeResume)}
            </div>
            
            <div class="public-actions">
                <button onclick="downloadPDF(event)" class="btn btn-primary me-3">
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
        function downloadPDF(event) {
            const element = document.querySelector('.resume-document');
            const downloadBtn = event.currentTarget;
            const originalText = downloadBtn.innerHTML;
            
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating PDF...';
            downloadBtn.disabled = true;
            
            const opt = {
                margin: 0,
                filename: ${JSON.stringify(pdfFilename)},
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    letterRendering: true
                },
                jsPDF: { 
                    unit: 'in', 
                    format: 'a4',
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
    const renderBullets = (value) => {
        const lines = String(value || '')
            .split(/\r?\n/)
            .map(line => line.replace(/^\s*[-–—•*]+\s*/, '').trim())
            .filter(Boolean);

        return lines.length
            ? `<ul class="mb-0 ps-3">${lines.map(line => `<li>${line}</li>`).join('')}</ul>`
            : '';
    };

    return `
        <div class="public-header">
            <h1>${resume.name}</h1>
            <div class="contact-info">
                <span>${resume.email}</span>
                ${resume.phone ? `<span>${resume.phone}</span>` : ''}
                ${resume.address ? `<span>${resume.address}</span>` : ''}
                ${resume.socialLinks.linkedin ? `<span><a href="${resume.socialLinks.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a></span>` : ''}
                ${resume.socialLinks.github ? `<span><a href="${resume.socialLinks.github}" target="_blank" rel="noopener noreferrer">GitHub</a></span>` : ''}
                ${resume.socialLinks.portfolio ? `<span><a href="${resume.socialLinks.portfolio}" target="_blank" rel="noopener noreferrer">Portfolio</a></span>` : ''}
            </div>
        </div>
        
        <div class="resume-body">
            ${resume.objective ? `
            <div>
                <h3 class="section-title">Professional Summary</h3>
                <p class="mb-0">${resume.objective}</p>
            </div>
            ` : ''}

            ${resume.education && resume.education.length > 0 ? `
            <div>
                <h3 class="section-title">Education</h3>
                ${resume.education.map(edu => `
                    <div class="education-item">
                        <div class="item-header">
                            <div>
                                <h4 class="item-title">${edu.degree}</h4>
                                <p class="item-subtitle">${edu.college}</p>
                            </div>
                            <div class="item-duration">${edu.year}${edu.score ? `<br>${edu.score}` : ''}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            ${resume.experience && resume.experience.length > 0 ? `
            <div>
                <h3 class="section-title">Experience</h3>
                ${resume.experience.map(exp => `
                    <div class="experience-item">
                        <div class="item-header">
                            <div>
                                <h4 class="item-title">${exp.role}${exp.company ? ` | ${exp.company}` : ''}</h4>
                                ${exp.location ? `<p class="item-subtitle">${exp.location}</p>` : ''}
                            </div>
                            <div class="item-duration">${exp.duration}</div>
                        </div>
                        ${renderBullets(exp.description)}
                    </div>
                `).join('')}
            </div>
            ` : ''}

            ${resume.projects && resume.projects.length > 0 ? `
            <div>
                <h3 class="section-title">Projects</h3>
                ${resume.projects.map(proj => `
                    <div class="project-item">
                        <div class="item-header">
                            <div>
                                <h4 class="item-title">${proj.title}${proj.githubLink ? ` | <a href="${proj.githubLink}" target="_blank" rel="noopener noreferrer">Project Link</a>` : ''}</h4>
                                ${proj.techStack ? `<p class="item-subtitle">Technologies: ${proj.techStack}</p>` : ''}
                            </div>
                            ${proj.duration ? `<div class="item-duration">${proj.duration}</div>` : ''}
                        </div>
                        ${renderBullets(proj.description)}
                    </div>
                `).join('')}
            </div>
            ` : ''}

            ${resume.skills && resume.skills.length > 0 ? `
            <div>
                <h3 class="section-title">Technical Skills</h3>
                <div class="skills-container">
                    ${resume.skills.map(skill => `<span class="badge">${skill}</span>`).join('')}
                </div>
            </div>
            ` : ''}

            ${resume.achievements && resume.achievements.length > 0 ? `
            <div>
                <h3 class="section-title">Achievements</h3>
                <ul class="mb-0 ps-3">
                    ${resume.achievements.map(item => `<li><strong>${item.title}</strong>${item.title && item.description ? ': ' : ''}${item.description}${item.date ? ` <span class="item-duration float-end">${item.date}</span>` : ''}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            ${resume.certifications && resume.certifications.length > 0 ? `
            <div>
                <h3 class="section-title">Certifications</h3>
                ${resume.certifications.map(cert => `
                    <div class="certification-item">
                        <div class="item-header">
                            <div>
                                <h4 class="item-title">${cert.name}${cert.issuer ? ` | ${cert.issuer}` : ''}</h4>
                            </div>
                            ${cert.date ? `<div class="item-duration">${cert.date}</div>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            ${resume.activities && resume.activities.length > 0 ? `
            <div>
                <h3 class="section-title">Extracurricular Activities</h3>
                <ul class="mb-0 ps-3">
                    ${resume.activities.map(item => `<li>${item.description}</li>`).join('')}
                </ul>
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
