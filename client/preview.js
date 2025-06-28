// preview.js - Resume Preview and PDF Generation with Template Support

// Get current selected template from localStorage or default to 'classic'
function getCurrentTemplate() {
    return localStorage.getItem('selectedTemplate') || 'classic';
}

// Save selected template to localStorage
function saveSelectedTemplate(template) {
    localStorage.setItem('selectedTemplate', template);
}

// Function to render resume preview from data with template support
function renderResumePreview(data) {
    const previewContainer = document.getElementById('resumePreview');
    
    if (!previewContainer) {
        console.error('Resume preview container not found!');
        return;
    }

    const currentTemplate = getCurrentTemplate();
    
    // Clear previous content
    previewContainer.innerHTML = '';

    // Create resume HTML structure with template class
    const resumeHTML = generateResumeHTML(data, currentTemplate);

    previewContainer.innerHTML = resumeHTML;
    
    // Add template preview animation
    const resumeElement = previewContainer.querySelector('.resume-container');
    if (resumeElement) {
        resumeElement.classList.add('template-preview');
    }
}

// Generate resume HTML based on template
function generateResumeHTML(data, template) {
    const templateClass = `template-${template}`;
    
    return `
        <div class="resume-container bg-white p-4 shadow-sm border ${templateClass}">
            ${generateHeaderSection(data, template)}
            ${generateObjectiveSection(data, template)}
            ${generateSkillsSection(data, template)}
            ${generateExperienceSection(data, template)}
            ${generateEducationSection(data, template)}
            ${generateProjectsSection(data, template)}
            ${generateCertificationsSection(data, template)}
        </div>
    `;
}

// Generate header section based on template
function generateHeaderSection(data, template) {
    const isModern = template === 'modern';
    const isElegant = template === 'elegant';
    const textAlign = isElegant ? '' : 'text-center';
    
    return `
        <!-- Header Section -->
        <div class="resume-header ${textAlign} mb-4 pb-3 ${template !== 'modern' && template !== 'elegant' ? 'border-bottom' : ''}">
            <h1 class="display-6 mb-2 text-primary fw-bold">${data.fullName || data.name || 'Name Not Provided'}</h1>
            <h2 class="h4 text-muted mb-3">${data.roleAppliedFor || 'Role Not Specified'}</h2>
            
            <!-- Contact Information -->
            <div class="contact-info">
                <div class="row ${isElegant ? '' : 'justify-content-center'}">
                    <div class="col-auto">
                        <span class="text-muted">
                            <i class="fas fa-envelope me-1"></i>${data.email || 'Email not provided'}
                        </span>
                    </div>
                    ${data.phone ? `
                    <div class="col-auto">
                        <span class="text-muted">
                            <i class="fas fa-phone me-1"></i>${data.phone}
                        </span>
                    </div>
                    ` : ''}
                    ${data.address ? `
                    <div class="col-auto">
                        <span class="text-muted">
                            <i class="fas fa-map-marker-alt me-1"></i>${data.address}
                        </span>
                    </div>
                    ` : ''}
                </div>
                
                <!-- Social Links -->
                ${(data.linkedin || data.github || data.portfolio || (data.socialLinks && (data.socialLinks.linkedin || data.socialLinks.github || data.socialLinks.portfolio))) ? `
                <div class="row ${isElegant ? '' : 'justify-content-center'} mt-2">
                    ${data.linkedin || (data.socialLinks && data.socialLinks.linkedin) ? `
                    <div class="col-auto">
                        <a href="${data.linkedin || data.socialLinks.linkedin}" target="_blank" class="text-decoration-none">
                            <i class="fab fa-linkedin me-1"></i>LinkedIn
                        </a>
                    </div>
                    ` : ''}
                    ${data.github || (data.socialLinks && data.socialLinks.github) ? `
                    <div class="col-auto">
                        <a href="${data.github || data.socialLinks.github}" target="_blank" class="text-decoration-none">
                            <i class="fab fa-github me-1"></i>GitHub
                        </a>
                    </div>
                    ` : ''}
                    ${data.portfolio || (data.socialLinks && data.socialLinks.portfolio) ? `
                    <div class="col-auto">
                        <a href="${data.portfolio || data.socialLinks.portfolio}" target="_blank" class="text-decoration-none">
                            <i class="fas fa-globe me-1"></i>Portfolio
                        </a>
                    </div>
                    ` : ''}
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Generate objective section
function generateObjectiveSection(data, template) {
    if (!data.careerObjective && !data.objective) return '';
    
    return `
        <div class="resume-section mb-4">
            <h3 class="section-title h5 text-primary fw-bold mb-3 border-bottom pb-1">
                <i class="fas fa-bullseye me-2"></i>Professional Objective
            </h3>
            <p class="objective-text">${data.careerObjective || data.objective}</p>
        </div>
    `;
}

// Generate skills section
function generateSkillsSection(data, template) {
    if (!data.skills || data.skills.length === 0) return '';
    
    return `
        <div class="resume-section mb-4">
            <h3 class="section-title h5 text-primary fw-bold mb-3 border-bottom pb-1">
                <i class="fas fa-code me-2"></i>Technical Skills
            </h3>
            <div class="skills-container">
                ${data.skills.map(skill => `<span class="badge bg-light text-dark border me-2 mb-2 p-2">${skill}</span>`).join('')}
            </div>
        </div>
    `;
}

// Generate experience section
function generateExperienceSection(data, template) {
    if (!data.experience || (Array.isArray(data.experience) ? data.experience.length === 0 : Object.keys(data.experience).length === 0)) return '';
    
    return `
        <div class="resume-section mb-4">
            <h3 class="section-title h5 text-primary fw-bold mb-3 border-bottom pb-1">
                <i class="fas fa-briefcase me-2"></i>Professional Experience
            </h3>
            ${renderExperienceSection(data.experience, template)}
        </div>
    `;
}

// Generate education section
function generateEducationSection(data, template) {
    if (!data.education || (Array.isArray(data.education) ? data.education.length === 0 : Object.keys(data.education).length === 0)) return '';
    
    return `
        <div class="resume-section mb-4">
            <h3 class="section-title h5 text-primary fw-bold mb-3 border-bottom pb-1">
                <i class="fas fa-graduation-cap me-2"></i>Education
            </h3>
            ${renderEducationSection(data.education, template)}
        </div>
    `;
}

// Generate projects section
function generateProjectsSection(data, template) {
    if (!data.projects || (Array.isArray(data.projects) ? data.projects.length === 0 : Object.keys(data.projects).length === 0)) return '';
    
    return `
        <div class="resume-section mb-4">
            <h3 class="section-title h5 text-primary fw-bold mb-3 border-bottom pb-1">
                <i class="fas fa-project-diagram me-2"></i>Projects
            </h3>
            ${renderProjectsSection(data.projects, template)}
        </div>
    `;
}

// Generate certifications section
function generateCertificationsSection(data, template) {
    if (!data.certifications || (Array.isArray(data.certifications) ? data.certifications.length === 0 : Object.keys(data.certifications).length === 0)) return '';
    
    return `
        <div class="resume-section mb-4">
            <h3 class="section-title h5 text-primary fw-bold mb-3 border-bottom pb-1">
                <i class="fas fa-certificate me-2"></i>Certifications
            </h3>
            ${renderCertificationsSection(data.certifications, template)}
        </div>
    `;
}

// Helper function to render experience section
function renderExperienceSection(experience, template = 'classic') {
    let experienceArray = [];
    
    if (Array.isArray(experience)) {
        experienceArray = experience;
    } else {
        // Convert object to array
        experienceArray = Object.values(experience).filter(exp => exp.company && exp.role);
    }

    return experienceArray.map(exp => `
        <div class="experience-item mb-3">
            <div class="row">
                <div class="col-md-8">
                    <h4 class="h6 fw-bold mb-1">${exp.role}</h4>
                    <p class="company-name text-primary mb-1">${exp.company}</p>
                </div>
                <div class="col-md-4 text-md-end">
                    <span class="duration text-muted"><i class="fas fa-calendar me-1"></i>${exp.duration}</span>
                </div>
            </div>
            <p class="description text-muted mb-0">${exp.description}</p>
        </div>
    `).join('');
}

// Helper function to render education section
function renderEducationSection(education, template = 'classic') {
    let educationArray = [];
    
    if (Array.isArray(education)) {
        educationArray = education;
    } else {
        // Convert object to array
        educationArray = Object.values(education).filter(edu => edu.degree && edu.college);
    }

    return educationArray.map(edu => `
        <div class="education-item mb-3">
            <div class="row">
                <div class="col-md-8">
                    <h4 class="h6 fw-bold mb-1">${edu.degree}</h4>
                    <p class="college-name text-primary mb-0">${edu.college}</p>
                </div>
                <div class="col-md-4 text-md-end">
                    <span class="year text-muted"><i class="fas fa-calendar me-1"></i>${edu.year}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Helper function to render projects section
function renderProjectsSection(projects, template = 'classic') {
    let projectsArray = [];
    
    if (Array.isArray(projects)) {
        projectsArray = projects;
    } else {
        // Convert object to array
        projectsArray = Object.values(projects).filter(proj => proj.title);
    }

    return projectsArray.map(proj => `
        <div class="project-item mb-3">
            <div class="row">
                <div class="col-md-8">
                    <h4 class="h6 fw-bold mb-1">${proj.title}</h4>
                    ${proj.techStack ? `<p class="tech-stack text-primary mb-1"><i class="fas fa-tools me-1"></i>${proj.techStack}</p>` : ''}
                </div>
                <div class="col-md-4 text-md-end">
                    ${proj.githubLink ? `<a href="${proj.githubLink}" target="_blank" class="text-decoration-none"><i class="fab fa-github me-1"></i>GitHub</a>` : ''}
                </div>
            </div>
            <p class="description text-muted mb-0">${proj.description}</p>
        </div>
    `).join('');
}

// Helper function to render certifications section
function renderCertificationsSection(certifications, template = 'classic') {
    let certificationsArray = [];
    
    if (Array.isArray(certifications)) {
        certificationsArray = certifications;
    } else {
        // Convert object to array
        certificationsArray = Object.values(certifications).filter(cert => cert.name);
    }

    return certificationsArray.map(cert => `
        <div class="certification-item mb-3">
            <div class="row">
                <div class="col-md-8">
                    <h4 class="h6 fw-bold mb-1">${cert.name}</h4>
                    ${cert.issuer ? `<p class="issuer text-primary mb-0">${cert.issuer}</p>` : ''}
                </div>
                <div class="col-md-4 text-md-end">
                    ${cert.date ? `<span class="date text-muted"><i class="fas fa-calendar me-1"></i>${cert.date}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Function to load resume data from localStorage or provide demo data
function loadResumeData() {
    console.log('Loading resume data...');
    
    // Check for URL parameters first (for preview links from saved resumes)
    const urlParams = new URLSearchParams(window.location.search);
    const resumeId = urlParams.get('id');
    
    if (resumeId) {
        console.log('Loading resume from server with ID:', resumeId);
        // Load specific resume from server
        loadResumeFromServer(resumeId);
        return;
    }
    
    // Try to load from localStorage
    const savedData = localStorage.getItem('resumeData');
    console.log('Checking localStorage for resume data...');
    
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            console.log('Found saved data, rendering preview');
            renderResumePreview(data);
            return;
        } catch (error) {
            console.error('Error parsing saved resume data:', error);
        }
    }
    
    // If no data found, show demo data immediately
    console.log('No saved data found, loading demo data');
    loadDemoData();
    
    // Show helpful message
    setTimeout(() => {
        showAlert('Demo resume loaded! Create your own at Resume Builder or load your saved resumes.', 'info');
    }, 1000);
}

// Function to load resume from server by ID
function loadResumeFromServer(resumeId) {
    const previewContainer = document.getElementById('resumePreview');
    
    // Show loading state
    previewContainer.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Loading resume...</p>
        </div>
    `;
    
    fetch(`/api/resume/${resumeId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderResumePreview(data.data);
                showAlert('Resume loaded successfully!', 'success');
            } else {
                showAlert('Error loading resume: ' + data.message, 'danger');
                loadDemoData();
            }
        })
        .catch(error => {
            console.error('Error loading resume from server:', error);
            showAlert('Error loading resume. Showing demo data instead.', 'warning');
            loadDemoData();
        });
}

// Function to load demo data
function loadDemoData() {
    const demoData = {
        fullName: "John Doe",
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1-555-0123",
        address: "123 Main Street, City, State 12345",
        linkedin: "https://linkedin.com/in/johndoe",
        github: "https://github.com/johndoe",
        portfolio: "https://johndoe.com",
        roleAppliedFor: "Software Developer",
        skills: [
            "JavaScript",
            "React",
            "Node.js",
            "MongoDB",
            "Python",
            "HTML/CSS"
        ],
        careerObjective: "Seeking a challenging Software Developer position to leverage my expertise in full-stack development and contribute to innovative projects while growing professionally.",
        socialLinks: {
            linkedin: "https://linkedin.com/in/johndoe",
            github: "https://github.com/johndoe",
            portfolio: "https://johndoe.com"
        },
        education: [
            {
                degree: "Bachelor of Science in Computer Science",
                college: "University of Technology",
                year: "2023"
            }
        ],
        experience: [
            {
                company: "Tech Innovations Inc.",
                role: "Junior Software Developer",
                duration: "2023 - Present",
                description: "Developed and maintained web applications using React and Node.js. Collaborated with cross-functional teams to deliver high-quality software solutions."
            }
        ],
        projects: [
            {
                title: "E-commerce Platform",
                techStack: "React, Node.js, MongoDB, Stripe",
                description: "Built a full-stack e-commerce platform with user authentication, payment processing, and admin dashboard.",
                githubLink: "https://github.com/johndoe/ecommerce-platform"
            }
        ],
        certifications: [
            {
                name: "AWS Certified Developer",
                issuer: "Amazon Web Services",
                date: "2024"
            }
        ]
    };
    
    renderResumePreview(demoData);
}

// Function to show alert messages
function showAlert(message, type = 'info') {
    // Remove any existing alerts
    const existingAlert = document.querySelector('.preview-alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show preview-alert`;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        min-width: 300px;
        text-align: center;
    `;
    
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to document
    document.body.appendChild(alertDiv);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (alertDiv && alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 4000);
}

// Template switching functionality
function switchTemplate(templateName) {
    saveSelectedTemplate(templateName);
    
    // Get current resume data
    const savedData = localStorage.getItem('resumeData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            renderResumePreview(data);
            showAlert(`Switched to ${templateName.charAt(0).toUpperCase() + templateName.slice(1)} template`, 'success');
        } catch (error) {
            console.error('Error loading resume data for template switch:', error);
        }
    } else {
        // Load placeholder data with new template
        loadResumeData();
    }
}

// PDF download function with template preservation
function downloadPDF() {
    const resumeContainer = document.querySelector('.resume-container');
    
    if (!resumeContainer) {
        showAlert('No resume content to download', 'warning');
        return;
    }

    const downloadBtn = document.getElementById('downloadPdfBtn');
    const originalText = downloadBtn ? downloadBtn.innerHTML : '';
    
    if (downloadBtn) {
        // Show loading state
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating PDF...';
        downloadBtn.disabled = true;
    }

    // Get current template for filename
    const currentTemplate = getCurrentTemplate();
    const filename = `resume_${currentTemplate}_${new Date().toISOString().split('T')[0]}.pdf`;

    // PDF generation options
    const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            letterRendering: true,
            removeContainer: true
        },
        jsPDF: { 
            unit: 'in', 
            format: 'letter', 
            orientation: 'portrait',
            compress: true
        }
    };

    // Generate PDF
    html2pdf().set(opt).from(resumeContainer).save().then(() => {
        showAlert('PDF downloaded successfully!', 'success');
    }).catch(error => {
        console.error('PDF generation failed:', error);
        showAlert('Error generating PDF. Please try again.', 'danger');
    }).finally(() => {
        // Reset button state
        if (downloadBtn) {
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        }
    });
}

// Share resume functionality
function shareResume() {
    const savedData = localStorage.getItem('resumeData');
    if (!savedData) {
        showAlert('No resume data found. Please create or load a resume first.', 'warning');
        return;
    }

    const shareBtn = document.getElementById('shareBtn');
    const originalText = shareBtn ? shareBtn.innerHTML : '';
    
    if (shareBtn) {
        shareBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating Link...';
        shareBtn.disabled = true;
    }

    try {
        const data = JSON.parse(savedData);
        
        // Create resume via API
        fetch('/api/resume/input', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                const shareableUrl = `${window.location.origin}/resume/${result.data.id}`;
                
                // Copy to clipboard and show modal
                navigator.clipboard.writeText(shareableUrl).then(() => {
                    showShareModal(shareableUrl);
                }).catch(() => {
                    // Fallback if clipboard API is not available
                    showShareModal(shareableUrl);
                });
                
            } else {
                showAlert('Error creating shareable link: ' + result.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error creating shareable link:', error);
            showAlert('Error creating shareable link. Please try again.', 'danger');
        })
        .finally(() => {
            if (shareBtn) {
                shareBtn.innerHTML = originalText;
                shareBtn.disabled = false;
            }
        });
        
    } catch (error) {
        console.error('Error parsing resume data:', error);
        showAlert('Error processing resume data.', 'danger');
        
        if (shareBtn) {
            shareBtn.innerHTML = originalText;
            shareBtn.disabled = false;
        }
    }
}

// Show share modal with the shareable URL
function showShareModal(url) {
    // Remove existing modal if any
    const existingModal = document.getElementById('shareModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal HTML
    const modalHTML = `
        <div class="modal fade" id="shareModal" tabindex="-1" aria-labelledby="shareModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="shareModalLabel">
                            <i class="fas fa-share-alt me-2"></i>Share Your Resume
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-success">
                            <i class="fas fa-check-circle me-2"></i>
                            <strong>Success!</strong> Your resume is now publicly accessible.
                        </div>
                        
                        <div class="mb-3">
                            <label for="shareUrl" class="form-label fw-bold">Shareable Link:</label>
                            <div class="input-group">
                                <input type="text" class="form-control" id="shareUrl" value="${url}" readonly>
                                <button class="btn btn-outline-primary" type="button" onclick="copyToClipboard()">
                                    <i class="fas fa-copy me-1"></i>Copy
                                </button>
                            </div>
                            <small class="text-muted">This link can be shared with employers, colleagues, or anyone you want to view your resume.</small>
                        </div>
                        
                        <div class="row text-center mt-4">
                            <div class="col-md-4 mb-3">
                                <div class="card h-100">
                                    <div class="card-body">
                                        <i class="fas fa-eye fa-2x text-primary mb-2"></i>
                                        <h6 class="card-title">Public View</h6>
                                        <p class="card-text small">Anyone with this link can view your resume in a clean, professional format.</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <div class="card h-100">
                                    <div class="card-body">
                                        <i class="fas fa-download fa-2x text-success mb-2"></i>
                                        <h6 class="card-title">PDF Download</h6>
                                        <p class="card-text small">Viewers can download your resume as a PDF directly from the shared page.</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <div class="card h-100">
                                    <div class="card-body">
                                        <i class="fas fa-mobile-alt fa-2x text-info mb-2"></i>
                                        <h6 class="card-title">Mobile Friendly</h6>
                                        <p class="card-text small">Your resume looks great on all devices - desktop, tablet, and mobile.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="alert alert-info mt-3">
                            <i class="fas fa-info-circle me-2"></i>
                            <strong>Note:</strong> This link will remain active permanently. You can share it on your LinkedIn profile, in job applications, or anywhere else you need to showcase your resume.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <a href="${url}" target="_blank" class="btn btn-primary">
                            <i class="fas fa-external-link-alt me-2"></i>Preview Shared Resume
                        </a>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal to document
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('shareModal'));
    modal.show();

    // Clean up modal when hidden
    document.getElementById('shareModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

// Copy URL to clipboard
function copyToClipboard() {
    const urlInput = document.getElementById('shareUrl');
    urlInput.select();
    urlInput.setSelectionRange(0, 99999); // For mobile devices

    try {
        navigator.clipboard.writeText(urlInput.value).then(() => {
            const copyBtn = event.target.closest('button');
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check me-1"></i>Copied!';
            copyBtn.classList.remove('btn-outline-primary');
            copyBtn.classList.add('btn-success');
            
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.classList.remove('btn-success');
                copyBtn.classList.add('btn-outline-primary');
            }, 2000);
            
            showAlert('Link copied to clipboard!', 'success');
        });
    } catch (err) {
        // Fallback for older browsers
        document.execCommand('copy');
        showAlert('Link copied to clipboard!', 'success');
    }
}

// Generate cover letter functionality
function generateCoverLetter() {
    const savedData = localStorage.getItem('resumeData');
    if (!savedData) {
        showAlert('No resume data found. Please create or load a resume first.', 'warning');
        return;
    }

    const generateBtn = document.getElementById('generateCoverLetterBtn');
    const originalText = generateBtn ? generateBtn.innerHTML : '';
    
    if (generateBtn) {
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating...';
        generateBtn.disabled = true;
    }

    try {
        const data = JSON.parse(savedData);
        
        // Show input modal first
        showCoverLetterInputModal(data, originalText, generateBtn);
        
    } catch (error) {
        console.error('Error parsing resume data:', error);
        showAlert('Error processing resume data.', 'danger');
        
        if (generateBtn) {
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
        }
    }
}

// Show cover letter input modal
function showCoverLetterInputModal(resumeData, originalText, generateBtn) {
    // Remove existing modal if any
    const existingModal = document.getElementById('coverLetterInputModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create input modal HTML
    const modalHTML = `
        <div class="modal fade" id="coverLetterInputModal" tabindex="-1" aria-labelledby="coverLetterInputLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="coverLetterInputLabel">
                            <i class="fas fa-file-alt me-2"></i>Generate Cover Letter
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="coverLetterForm">
                            <div class="mb-3">
                                <label for="targetRole" class="form-label fw-bold">Position/Role *</label>
                                <input type="text" class="form-control" id="targetRole" value="${resumeData.roleAppliedFor || ''}" 
                                       placeholder="e.g., Senior Software Developer" required>
                                <small class="text-muted">The specific role you're applying for</small>
                            </div>
                            
                            <div class="mb-3">
                                <label for="companyName" class="form-label fw-bold">Company Name (Optional)</label>
                                <input type="text" class="form-control" id="companyName" 
                                       placeholder="e.g., Google, Microsoft, Startup Inc.">
                                <small class="text-muted">Company name to personalize the cover letter</small>
                            </div>
                            
                            <div class="mb-3">
                                <label for="resumeSummary" class="form-label fw-bold">Professional Summary (Optional)</label>
                                <textarea class="form-control" id="resumeSummary" rows="3" 
                                          placeholder="Brief professional summary or career objective">${resumeData.careerObjective || ''}</textarea>
                                <small class="text-muted">Your professional background and career goals</small>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <h6 class="fw-bold text-muted">Key Skills (Auto-filled)</h6>
                                    <div class="border rounded p-2 mb-3" style="max-height: 120px; overflow-y: auto;">
                                        ${resumeData.skills && resumeData.skills.length > 0 
                                            ? resumeData.skills.map(skill => `<span class="badge bg-light text-dark me-1 mb-1">${skill}</span>`).join('')
                                            : '<span class="text-muted">No skills found</span>'
                                        }
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="fw-bold text-muted">Experience (Auto-filled)</h6>
                                    <div class="border rounded p-2 mb-3" style="max-height: 120px; overflow-y: auto;">
                                        ${resumeData.experience && resumeData.experience.length > 0 
                                            ? resumeData.experience.map(exp => `<small class="d-block mb-1"><strong>${exp.role}</strong> at ${exp.company}</small>`).join('')
                                            : '<span class="text-muted">No experience found</span>'
                                        }
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="generateCoverLetterSubmit">
                            <i class="fas fa-magic me-2"></i>Generate Cover Letter
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal to document
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('coverLetterInputModal'));
    modal.show();

    // Handle form submission
    document.getElementById('generateCoverLetterSubmit').addEventListener('click', function() {
        const targetRole = document.getElementById('targetRole').value.trim();
        const companyName = document.getElementById('companyName').value.trim();
        const resumeSummary = document.getElementById('resumeSummary').value.trim();
        
        if (!targetRole) {
            showAlert('Please enter the position/role you are applying for.', 'warning');
            return;
        }
        
        // Close input modal
        modal.hide();
        
        // Generate cover letter
        generateCoverLetterAPI(resumeData, targetRole, companyName, resumeSummary, originalText, generateBtn);
    });

    // Clean up modal when hidden
    document.getElementById('coverLetterInputModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
        // Reset button if modal was closed without generating
        if (generateBtn) {
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
        }
    });
}

// Call API to generate cover letter with comprehensive data
function generateCoverLetterAPI(resumeData, targetRole, companyName, resumeSummary, originalText, generateBtn) {
    console.log('📝 Preparing cover letter request with data:', {
        hasResumeData: !!resumeData,
        targetRole,
        companyName,
        resumeDataKeys: Object.keys(resumeData || {})
    });

    // Prepare comprehensive request data
    const requestData = {
        role: targetRole,
        companyName: companyName || null,
        resumeData: resumeData, // Send full resume data
        // Also send individual fields for backward compatibility
        resumeSummary: resumeSummary || resumeData?.careerObjective || null,
        experience: resumeData?.experience || [],
        skills: resumeData?.skills || [],
        fullName: resumeData?.fullName || '',
        email: resumeData?.email || '',
        phone: resumeData?.phone || ''
    };

    console.log('🚀 Sending cover letter generation request:', {
        role: requestData.role,
        hasCompanyName: !!requestData.companyName,
        experienceCount: Array.isArray(requestData.experience) ? requestData.experience.length : 0,
        skillsCount: Array.isArray(requestData.skills) ? requestData.skills.length : 0,
        hasFullName: !!requestData.fullName
    });

    fetch('/api/resume/generateCoverLetter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        console.log('📨 Cover letter API response status:', response.status);
        return response.json();
    })
    .then(result => {
        console.log('✅ Cover letter API result:', {
            success: result.success,
            isTemplate: result.data?.isTemplate,
            wordCount: result.data?.wordCount,
            error: result.error
        });

        if (result.success) {
            showCoverLetterModal(
                result.data.coverLetter, 
                targetRole, 
                companyName, 
                result.data.isTemplate,
                result.data
            );
            
            if (result.data.isTemplate) {
                showAlert('Cover letter generated using professional template (AI service temporarily unavailable)', 'warning');
            } else {
                showAlert(`Cover letter generated successfully using AI! (${result.data.wordCount} words)`, 'success');
            }
        } else {
            console.error('❌ Cover letter generation failed:', result);
            
            // Handle specific error types
            let errorMessage = result.message || 'Unknown error occurred';
            if (result.error === 'MISSING_ROLE') {
                errorMessage = 'Please specify the target job role';
            } else if (result.error === 'INVALID_RESUME_DATA') {
                errorMessage = 'Resume data is incomplete. Please fill in: ' + (result.details || []).join(', ');
            } else if (result.error === 'OPENAI_NOT_CONFIGURED') {
                errorMessage = 'AI service is not available. Please contact support.';
            }
            
            showAlert('Error: ' + errorMessage, 'danger');
        }
    })
    .catch(error => {
        console.error('❌ Network error generating cover letter:', error);
        showAlert('Network error: Unable to generate cover letter. Please check your connection and try again.', 'danger');
    })
    .finally(() => {
        if (generateBtn) {
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
        }
    });
}

// Show cover letter result modal with enhanced metadata
function showCoverLetterModal(coverLetter, role, companyName, isTemplate = false, metadata = {}) {
    console.log('📋 Showing cover letter modal:', {
        isTemplate,
        role,
        companyName,
        wordCount: metadata.wordCount,
        aiModel: metadata.aiModel
    });

    // Remove existing modal if any
    const existingModal = document.getElementById('coverLetterModal');
    if (existingModal) {
        existingModal.remove();
    }

    const headerClass = isTemplate ? 'bg-warning text-dark' : 'bg-success text-white';
    const iconClass = isTemplate ? 'fas fa-file-contract' : 'fas fa-robot';
    const titleSuffix = isTemplate ? ' (Template)' : ' (AI Generated)';
    const wordCount = metadata.wordCount || coverLetter.split(' ').length;

    // Create modal HTML
    const modalHTML = `
        <div class="modal fade" id="coverLetterModal" tabindex="-1" aria-labelledby="coverLetterModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header ${headerClass}">
                        <h5 class="modal-title" id="coverLetterModalLabel">
                            <i class="${iconClass} me-2"></i>Generated Cover Letter${titleSuffix}
                            ${companyName ? `- ${companyName}` : ''} (${role})
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${isTemplate ? `
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            <strong>Template Generated:</strong> AI service is temporarily unavailable due to quota limits. This cover letter was generated using a professional template and can be customized as needed.
                        </div>
                        ` : `
                        <div class="alert alert-success">
                            <i class="fas fa-robot me-2"></i>
                            <strong>AI Generated:</strong> This cover letter was created using artificial intelligence and tailored to your resume and target role.
                        </div>
                        `}
                        
                        <div class="mb-3">
                            <label for="coverLetterText" class="form-label fw-bold">Cover Letter:</label>
                            <textarea class="form-control" id="coverLetterText" rows="15" style="font-family: 'Times New Roman', serif;">${coverLetter}</textarea>
                            <div class="d-flex justify-content-between align-items-center mt-2">
                                <small class="text-muted">You can edit the text above before copying or downloading.</small>
                                <small class="text-muted">
                                    <i class="fas fa-chart-bar me-1"></i>
                                    ${wordCount} words
                                    ${metadata.aiModel ? ` • Generated with ${metadata.aiModel}` : ''}
                                    ${metadata.generatedAt ? ` • ${new Date(metadata.generatedAt).toLocaleTimeString()}` : ''}
                                </small>
                            </div>
                        </div>
                        
                        <div class="row text-center mt-3">
                            <div class="col-md-4 mb-2">
                                <button class="btn btn-primary w-100" onclick="copyCoverLetterText()">
                                    <i class="fas fa-copy me-2"></i>Copy to Clipboard
                                </button>
                            </div>
                            <div class="col-md-4 mb-2">
                                <button class="btn btn-success w-100" onclick="downloadCoverLetterText()">
                                    <i class="fas fa-download me-2"></i>Download as Text
                                </button>
                            </div>
                            <div class="col-md-4 mb-2">
                                <button class="btn btn-info w-100" onclick="regenerateCoverLetter()">
                                    <i class="fas fa-sync-alt me-2"></i>${isTemplate ? 'Try AI Again' : 'Generate New Version'}
                                </button>
                            </div>
                        </div>
                        
                        <div class="alert alert-info mt-3">
                            <i class="fas fa-lightbulb me-2"></i>
                            <strong>Tip:</strong> Review and customize the cover letter to match the specific job posting and company culture before submitting.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal to document
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('coverLetterModal'));
    modal.show();

    // Clean up modal when hidden
    document.getElementById('coverLetterModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

// Copy cover letter to clipboard
function copyCoverLetterText() {
    const textArea = document.getElementById('coverLetterText');
    textArea.select();
    textArea.setSelectionRange(0, 99999);

    try {
        navigator.clipboard.writeText(textArea.value).then(() => {
            showAlert('Cover letter copied to clipboard!', 'success');
        });
    } catch (err) {
        document.execCommand('copy');
        showAlert('Cover letter copied to clipboard!', 'success');
    }
}

// Download cover letter as text file
function downloadCoverLetterText() {
    const textArea = document.getElementById('coverLetterText');
    const text = textArea.value;
    const filename = `cover_letter_${new Date().toISOString().split('T')[0]}.txt`;
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showAlert('Cover letter downloaded successfully!', 'success');
}

// Regenerate cover letter (close modal and reopen input)
function regenerateCoverLetter() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('coverLetterModal'));
    modal.hide();
    
    // Wait for modal to close then trigger regeneration
    setTimeout(() => {
        generateCoverLetter();
    }, 300);
}

// ============== INTERVIEW QUESTIONS FUNCTIONALITY ==============

// Generate interview questions functionality
function generateInterviewQuestions() {
    const savedData = localStorage.getItem('resumeData');
    if (!savedData) {
        showAlert('No resume data found. Please create or load a resume first.', 'warning');
        return;
    }

    const generateBtn = document.getElementById('generateInterviewQuestionsBtn');
    const originalText = generateBtn ? generateBtn.innerHTML : '';
    
    if (generateBtn) {
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating...';
        generateBtn.disabled = true;
    }

    try {
        const data = JSON.parse(savedData);
        
        // Show input modal first
        showInterviewQuestionsInputModal(data, originalText, generateBtn);
        
    } catch (error) {
        console.error('Error parsing resume data:', error);
        showAlert('Error reading resume data. Please try again.', 'danger');
        
        if (generateBtn) {
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
        }
    }
}

// Show interview questions input modal
function showInterviewQuestionsInputModal(resumeData, originalText, generateBtn) {
    // Remove existing modal if any
    const existingModal = document.getElementById('interviewQuestionsInputModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create input modal HTML
    const modalHTML = `
        <div class="modal fade" id="interviewQuestionsInputModal" tabindex="-1" aria-labelledby="interviewQuestionsInputLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="interviewQuestionsInputLabel">
                            <i class="fas fa-brain me-2"></i>Generate Interview Questions
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-info">
                            <i class="fas fa-lightbulb me-2"></i>
                            <strong>AI-Powered Interview Preparation</strong><br>
                            Get personalized interview questions based on your resume and target position. 
                            Our AI analyzes your experience, skills, and role requirements to generate relevant questions.
                        </div>
                        
                        <form id="interviewQuestionsForm">
                            <div class="mb-3">
                                <label for="targetJobTitle" class="form-label">
                                    <i class="fas fa-briefcase me-2"></i>Target Job Title/Position
                                </label>
                                <input type="text" class="form-control" id="targetJobTitle" 
                                       placeholder="e.g., Senior Software Developer, Marketing Manager, Data Scientist"
                                       value="${resumeData.careerObjective || ''}" required>
                                <div class="form-text">Specify the role you're interviewing for to get more targeted questions.</div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="companyContext" class="form-label">
                                    <i class="fas fa-building me-2"></i>Company/Industry Context (Optional)
                                </label>
                                <input type="text" class="form-control" id="companyContext" 
                                       placeholder="e.g., Tech startup, Fortune 500, Healthcare, Finance">
                                <div class="form-text">Help us tailor questions to your target industry or company type.</div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="experienceLevel" class="form-label">
                                    <i class="fas fa-chart-line me-2"></i>Experience Level
                                </label>
                                <select class="form-select" id="experienceLevel">
                                    <option value="entry">Entry Level (0-2 years)</option>
                                    <option value="mid" selected>Mid Level (2-5 years)</option>
                                    <option value="senior">Senior Level (5-10 years)</option>
                                    <option value="executive">Executive Level (10+ years)</option>
                                </select>
                            </div>

                            <div class="alert alert-warning">
                                <i class="fas fa-info-circle me-2"></i>
                                <strong>Resume Summary:</strong><br>
                                <small>
                                    <strong>Name:</strong> ${resumeData.fullName || 'Not specified'}<br>
                                    <strong>Skills:</strong> ${Array.isArray(resumeData.skills) ? resumeData.skills.slice(0, 3).join(', ') + (resumeData.skills.length > 3 ? '...' : '') : 'Not specified'}<br>
                                    <strong>Experience:</strong> ${Array.isArray(resumeData.experience) ? resumeData.experience.length : 0} entries
                                </small>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="generateInterviewQuestionsSubmit">
                            <i class="fas fa-brain me-2"></i>Generate Questions
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal to DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('interviewQuestionsInputModal'));
    modal.show();
    
    // Handle submit button
    document.getElementById('generateInterviewQuestionsSubmit').addEventListener('click', function() {
        const targetJobTitle = document.getElementById('targetJobTitle').value.trim();
        
        if (!targetJobTitle) {
            showAlert('Please enter a target job title/position.', 'warning');
            return;
        }
        
        const companyContext = document.getElementById('companyContext').value.trim();
        const experienceLevel = document.getElementById('experienceLevel').value;
        
        // Close input modal
        modal.hide();
        
        // Generate questions
        generateInterviewQuestionsAPI(resumeData, targetJobTitle, companyContext, experienceLevel, originalText, generateBtn);
    });
    
    // Reset button state when modal is closed
    document.getElementById('interviewQuestionsInputModal').addEventListener('hidden.bs.modal', function () {
        if (generateBtn) {
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
        }
        // Remove modal from DOM
        this.remove();
    });
}

// Generate interview questions via API
function generateInterviewQuestionsAPI(resumeData, targetJobTitle, companyContext, experienceLevel, originalText, generateBtn) {
    // Prepare request data
    const requestData = {
        resumeData: resumeData,
        jobTitle: targetJobTitle,
        companyContext: companyContext,
        experienceLevel: experienceLevel
    };

    console.log('📤 Sending interview questions request:', requestData);

    fetch('/api/interview/questions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        console.log('📥 Interview questions response status:', response.status);
        
        // Handle non-200 status codes
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            });
        }
        
        return response.json();
    })
    .then(data => {
        console.log('📋 Interview questions response:', data);
        
        if (generateBtn) {
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
        }
        
        if (data.success && data.data && data.data.questions) {
            // Store in localStorage for future reference
            const questionsData = {
                questions: data.data.questions,
                jobTitle: targetJobTitle,
                companyContext: companyContext,
                experienceLevel: experienceLevel,
                generatedAt: new Date().toISOString(),
                isTemplate: data.data.isTemplate || false,
                aiModel: data.data.aiModel || 'unknown',
                highlightedSkills: data.data.highlightedSkills || []
            };
            
            localStorage.setItem('lastInterviewQuestions', JSON.stringify(questionsData));
            
            // Show questions in modal
            showInterviewQuestionsModal(questionsData);
            
            showAlert(data.message || '✨ Interview questions generated successfully!', 'success');
        } else {
            // Handle server errors with detailed messages
            let errorMessage = 'Failed to generate interview questions. ';
            
            if (data.error === 'INVALID_RESUME_DATA') {
                errorMessage += 'Please ensure your resume includes:';
                if (data.details && Array.isArray(data.details)) {
                    errorMessage += '\n• ' + data.details.join('\n• ');
                }
                if (data.suggestions && Array.isArray(data.suggestions)) {
                    errorMessage += '\n\nSuggestions:\n• ' + data.suggestions.join('\n• ');
                }
            } else if (data.error === 'OPENAI_NOT_CONFIGURED') {
                errorMessage += 'AI service is temporarily unavailable. Please contact support.';
            } else if (data.error === 'OPENAI_QUOTA_EXCEEDED') {
                errorMessage += 'AI service quota exceeded. Please try again later or contact support.';
            } else if (data.error === 'OPENAI_RATE_LIMIT') {
                errorMessage += 'Too many requests. Please wait a moment and try again.';
            } else {
                errorMessage += data.message || 'Please try again.';
            }
            
            showAlert(errorMessage, 'danger');
        }
    })
    .catch(error => {
        console.error('❌ Error generating interview questions:', error);
        
        if (generateBtn) {
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
        }
        
        let errorMessage = 'Error generating interview questions: ';
        
        if (error.message.includes('Failed to fetch')) {
            errorMessage += 'Network connection error. Please check your internet connection.';
        } else if (error.message.includes('HTTP 500')) {
            errorMessage += 'Server error. Please try again in a moment.';
        } else if (error.message.includes('HTTP 429')) {
            errorMessage += 'Too many requests. Please wait and try again.';
        } else if (error.message.includes('HTTP 401')) {
            errorMessage += 'Authentication error. Please refresh the page and try again.';
        } else {
            errorMessage += error.message || 'Unknown error occurred.';
        }
        
        showAlert(errorMessage, 'danger');
    });
}

// Show interview questions in modal
function showInterviewQuestionsModal(questionsData) {
    const questions = questionsData.questions;
    const highlightedSkills = questionsData.highlightedSkills || [];
    
    // Create questions HTML
    let questionsHTML = '';
    questions.forEach((question, index) => {
        // Highlight skills in questions
        let highlightedQuestion = question;
        highlightedSkills.forEach(skill => {
            const regex = new RegExp(`\\b${skill}\\b`, 'gi');
            highlightedQuestion = highlightedQuestion.replace(regex, `<mark class="bg-warning bg-opacity-50">${skill}</mark>`);
        });
        
        questionsHTML += `
            <div class="question-item card mb-3">
                <div class="card-body">
                    <div class="d-flex align-items-start">
                        <span class="badge bg-primary me-3 mt-1" style="min-width: 30px;">${index + 1}</span>
                        <div class="flex-grow-1">
                            <p class="mb-2 question-text">${highlightedQuestion}</p>
                            <div class="d-flex gap-2">
                                <button class="btn btn-sm btn-outline-primary copy-question-btn" data-question="${question}">
                                    <i class="fas fa-copy me-1"></i>Copy
                                </button>
                                <button class="btn btn-sm btn-outline-success practice-btn" data-question="${question}">
                                    <i class="fas fa-microphone me-1"></i>Practice
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    // Skills summary
    let skillsHTML = '';
    if (highlightedSkills.length > 0) {
        skillsHTML = `
            <div class="alert alert-info mb-3">
                <i class="fas fa-tags me-2"></i>
                <strong>Key Skills Referenced:</strong>
                ${highlightedSkills.map(skill => `<span class="badge bg-info text-dark me-1">${skill}</span>`).join('')}
            </div>
        `;
    }
    
    // Update modal content
    const modalContent = `
        <div class="text-center mb-4">
            <h6 class="text-primary">
                <i class="fas fa-briefcase me-2"></i>${questionsData.jobTitle}
                ${questionsData.companyContext ? ` at ${questionsData.companyContext}` : ''}
            </h6>
            <small class="text-muted">
                Generated ${new Date(questionsData.generatedAt).toLocaleString()} 
                ${questionsData.isTemplate ? '(Template-based)' : '(AI-powered)'}
            </small>
        </div>
        
        ${skillsHTML}
        
        <div class="questions-container">
            ${questionsHTML}
        </div>
        
        <div class="text-center mt-4">
            <div class="alert alert-light border">
                <i class="fas fa-lightbulb me-2 text-warning"></i>
                <strong>Tip:</strong> Practice your answers out loud and time yourself. 
                Most interview answers should be 1-3 minutes long.
            </div>
        </div>
    `;
    
    document.getElementById('interviewQuestionsContent').innerHTML = modalContent;
    
    // Show action buttons
    document.getElementById('copyAllQuestionsBtn').style.display = 'inline-block';
    document.getElementById('exportQuestionsBtn').style.display = 'inline-block';
    document.getElementById('generateNewQuestionsBtn').style.display = 'inline-block';
    
    // Setup event handlers for action buttons
    setupInterviewQuestionsEventHandlers(questionsData);
    
    // Save questions to localStorage for "Show Last Questions" feature
    localStorage.setItem('lastInterviewQuestions', JSON.stringify(questionsData));
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('interviewQuestionsModal'));
    modal.show();
}

// Setup event handlers for interview questions modal
function setupInterviewQuestionsEventHandlers(questionsData) {
    // Copy individual question buttons
    document.querySelectorAll('.copy-question-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const question = this.getAttribute('data-question');
            navigator.clipboard.writeText(question).then(() => {
                showAlert('Question copied to clipboard!', 'success');
            });
        });
    });
    
    // Practice buttons (could integrate with speech recognition)
    document.querySelectorAll('.practice-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const question = this.getAttribute('data-question');
            showAlert('💡 Practice tip: Record yourself answering this question and review it!', 'info');
        });
    });
    
    // Copy all questions button
    document.getElementById('copyAllQuestionsBtn').addEventListener('click', function() {
        copyAllInterviewQuestions(questionsData);
    });
    
    // Export as PDF button
    document.getElementById('exportQuestionsBtn').addEventListener('click', function() {
        exportInterviewQuestionsPDF(questionsData);
    });
    
    // Generate new questions button
    document.getElementById('generateNewQuestionsBtn').addEventListener('click', function() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('interviewQuestionsModal'));
        modal.hide();
        setTimeout(() => {
            generateInterviewQuestions();
        }, 300);
    });
}

// Copy all interview questions to clipboard
function copyAllInterviewQuestions(questionsData) {
    const questions = questionsData.questions;
    const jobTitle = questionsData.jobTitle;
    const companyContext = questionsData.companyContext;
    
    let text = `Interview Questions for ${jobTitle}`;
    if (companyContext) {
        text += ` at ${companyContext}`;
    }
    text += `\nGenerated on ${new Date(questionsData.generatedAt).toLocaleDateString()}\n\n`;
    
    questions.forEach((question, index) => {
        text += `${index + 1}. ${question}\n\n`;
    });
    
    text += `Generated by Smart Resume Builder AI`;
    
    navigator.clipboard.writeText(text).then(() => {
        showAlert('All questions copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy to clipboard:', err);
        showAlert('Failed to copy to clipboard', 'danger');
    });
}

// Export interview questions as PDF
function exportInterviewQuestionsPDF(questionsData) {
    const questions = questionsData.questions;
    const jobTitle = questionsData.jobTitle;
    const companyContext = questionsData.companyContext;
    
    // Create HTML content for PDF
    const pdfContent = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #007bff; padding-bottom: 20px;">
                <h1 style="color: #007bff; margin-bottom: 10px;">Interview Questions</h1>
                <h2 style="color: #666; font-size: 1.2em; margin-bottom: 5px;">${jobTitle}</h2>
                ${companyContext ? `<h3 style="color: #888; font-size: 1em; margin-bottom: 5px;">${companyContext}</h3>` : ''}
                <p style="color: #999; font-size: 0.9em;">Generated on ${new Date(questionsData.generatedAt).toLocaleDateString()}</p>
            </div>
            
            <div style="margin-bottom: 30px;">
                ${questions.map((question, index) => `
                    <div style="margin-bottom: 25px; padding: 15px; border-left: 4px solid #007bff; background: #f8f9fa;">
                        <div style="display: flex; align-items: flex-start;">
                            <span style="background: #007bff; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold; flex-shrink: 0;">${index + 1}</span>
                            <p style="margin: 0; font-size: 1.1em; line-height: 1.5; color: #333;">${question}</p>
                        </div>
                        <div style="margin-top: 15px; border-top: 1px solid #ddd; padding-top: 15px;">
                            <p style="color: #666; font-size: 0.9em; margin: 0;"><strong>Tips:</strong></p>
                            <ul style="color: #666; font-size: 0.9em; margin: 5px 0 0 0; padding-left: 20px;">
                                <li>Structure your answer using the STAR method (Situation, Task, Action, Result)</li>
                                <li>Keep your response between 1-3 minutes</li>
                                <li>Practice out loud and time yourself</li>
                            </ul>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em;">
                <p>Generated by Smart Resume Builder AI</p>
                <p>Good luck with your interview! 🍀</p>
            </div>
        </div>
    `;
    
    // Create temporary element for PDF generation
    const element = document.createElement('div');
    element.innerHTML = pdfContent;
    element.style.cssText = 'position: absolute; top: -9999px; left: -9999px;';
    document.body.appendChild(element);
    
    // PDF options
    const opt = {
        margin: 0.5,
        filename: `interview-questions-${jobTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    // Generate PDF
    html2pdf().set(opt).from(element).save().then(() => {
        document.body.removeChild(element);
        showAlert('Interview questions exported as PDF!', 'success');
    }).catch(err => {
        console.error('PDF generation error:', err);
        document.body.removeChild(element);
        showAlert('Failed to export PDF. Please try again.', 'danger');
    });
}

// Load and show last generated questions
function showLastInterviewQuestions() {
    const lastQuestions = localStorage.getItem('lastInterviewQuestions');
    if (lastQuestions) {
        try {
            const questionsData = JSON.parse(lastQuestions);
            showInterviewQuestionsModal(questionsData);
        } catch (error) {
            console.error('Error loading last questions:', error);
            showAlert('Error loading previous questions.', 'danger');
        }
    } else {
        showAlert('No previous questions found. Generate new questions first.', 'info');
    }
}

// Save current resume to database
function saveResume() {
    const savedData = localStorage.getItem('resumeData');
    if (!savedData) {
        showAlert('No resume data found. Please create a resume first.', 'warning');
        return;
    }

    const saveBtn = document.getElementById('saveResumeBtn');
    const originalText = saveBtn ? saveBtn.innerHTML : '';
    
    if (saveBtn) {
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Saving...';
        saveBtn.disabled = true;
    }

    try {
        const data = JSON.parse(savedData);
        
        // Save resume via API
        fetch('/api/resume/input', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                showAlert('Resume saved successfully!', 'success');
                // Store the saved resume ID
                localStorage.setItem('currentResumeId', result.data.id);
            } else {
                showAlert('Error saving resume: ' + result.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error saving resume:', error);
            showAlert('Error saving resume. Please try again.', 'danger');
        })
        .finally(() => {
            if (saveBtn) {
                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;
            }
        });
        
    } catch (error) {
        console.error('Error parsing resume data:', error);
        showAlert('Error processing resume data.', 'danger');
        
        if (saveBtn) {
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }
    }
}

// Load saved resumes list
function loadSavedResumes() {
    fetch('/api/resume')
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                showSavedResumesModal(result.data);
            } else {
                showAlert('Error loading saved resumes: ' + result.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error loading saved resumes:', error);
            showAlert('Error loading saved resumes. Please try again.', 'danger');
        });
}

// Show saved resumes modal
function showSavedResumesModal(resumes) {
    // Remove existing modal if any
    const existingModal = document.getElementById('savedResumesModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal HTML
    const modalHTML = `
        <div class="modal fade" id="savedResumesModal" tabindex="-1" aria-labelledby="savedResumesModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header bg-info text-white">
                        <h5 class="modal-title" id="savedResumesModalLabel">
                            <i class="fas fa-folder-open me-2"></i>Saved Resumes (${resumes.length})
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${resumes.length === 0 ? `
                        <div class="text-center py-5">
                            <i class="fas fa-file-alt fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted">No saved resumes found</h5>
                            <p class="text-muted">Create and save your first resume to see it here.</p>
                            <a href="/resume-builder.html" class="btn btn-primary">
                                <i class="fas fa-plus me-2"></i>Create New Resume
                            </a>
                        </div>
                        ` : `
                        <div class="row">
                            ${resumes.map(resume => `
                            <div class="col-md-6 col-lg-4 mb-3">
                                <div class="card h-100 shadow-sm">
                                    <div class="card-body">
                                        <h6 class="card-title text-primary fw-bold">${resume.fullName || 'Unnamed Resume'}</h6>
                                        <p class="card-text">
                                            <small class="text-muted">
                                                <i class="fas fa-briefcase me-1"></i>${resume.roleAppliedFor || 'No role specified'}
                                            </small>
                                        </p>
                                        <p class="card-text">
                                            <small class="text-muted">
                                                <i class="fas fa-calendar me-1"></i>Saved: ${new Date(resume.createdAt).toLocaleDateString()}
                                            </small>
                                        </p>
                                        <div class="d-flex gap-1">
                                            <button class="btn btn-sm btn-primary flex-fill" onclick="loadResumeById('${resume._id}')">
                                                <i class="fas fa-eye me-1"></i>Load
                                            </button>
                                            <button class="btn btn-sm btn-outline-success" onclick="shareResumeById('${resume._id}')">
                                                <i class="fas fa-share me-1"></i>Share
                                            </button>
                                            <button class="btn btn-sm btn-outline-danger" onclick="deleteResumeById('${resume._id}')">
                                                <i class="fas fa-trash me-1"></i>Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            `).join('')}
                        </div>
                        `}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" onclick="window.location.href='/resume-builder.html'">
                            <i class="fas fa-plus me-2"></i>Create New Resume
                        </button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal to document
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('savedResumesModal'));
    modal.show();

    // Clean up modal when hidden
    document.getElementById('savedResumesModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

// Load specific resume by ID
function loadResumeById(resumeId) {
    fetch(`/api/resume/${resumeId}`)
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                // Store in localStorage
                localStorage.setItem('resumeData', JSON.stringify(result.data));
                localStorage.setItem('currentResumeId', resumeId);
                
                // Close modal and render preview
                const modal = bootstrap.Modal.getInstance(document.getElementById('savedResumesModal'));
                modal.hide();
                
                // Render the loaded resume
                renderResumePreview(result.data);
                showAlert('Resume loaded successfully!', 'success');
            } else {
                showAlert('Error loading resume: ' + result.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error loading resume:', error);
            showAlert('Error loading resume. Please try again.', 'danger');
        });
}

// Share resume by ID
function shareResumeById(resumeId) {
    const shareableUrl = `${window.location.origin}/resume/${resumeId}`;
    
    navigator.clipboard.writeText(shareableUrl).then(() => {
        showAlert('Resume share link copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback
        prompt('Copy this link to share your resume:', shareableUrl);
    });
}

// Delete resume by ID
function deleteResumeById(resumeId) {
    console.log('Delete function called with ID:', resumeId);
    
    if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
        console.log('Delete cancelled by user');
        return;
    }

    console.log('Sending delete request to:', `/api/resume/${resumeId}`);
    
    fetch(`/api/resume/${resumeId}`, {
        method: 'DELETE'
    })
    .then(response => {
        console.log('Delete response status:', response.status);
        return response.json();
    })
    .then(result => {
        console.log('Delete result:', result);
        if (result.success) {
            showAlert('Resume deleted successfully!', 'success');
            // Reload the saved resumes list
            setTimeout(() => {
                loadSavedResumes();
            }, 1000);
        } else {
            showAlert('Error deleting resume: ' + result.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Error deleting resume:', error);
        showAlert('Error deleting resume. Please try again.', 'danger');
    });
}

// Force load demo data
function forceLoadDemoData() {
    loadDemoData();
    showAlert('Demo data loaded successfully!', 'success');
}

// Initialize preview when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set initial template selection from localStorage
    const savedTemplate = getCurrentTemplate();
    
    const templateRadio = document.getElementById(`template-${savedTemplate}`);
    if (templateRadio) {
        templateRadio.checked = true;
    }
    
    // Load initial data
    loadResumeData();
    
    // Add event listeners for template switching
    const templateRadios = document.querySelectorAll('input[name="template"]');
    templateRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                switchTemplate(this.value);
            }
        });
    });
    
    // Add event listeners for other buttons
    const downloadBtn = document.getElementById('downloadPdfBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadPDF);
    }
    
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareResume);
    }
    
    const generateCoverLetterBtn = document.getElementById('generateCoverLetterBtn');
    if (generateCoverLetterBtn) {
        generateCoverLetterBtn.addEventListener('click', generateCoverLetter);
    }
    
    const generateInterviewQuestionsBtn = document.getElementById('generateInterviewQuestionsBtn');
    if (generateInterviewQuestionsBtn) {
        generateInterviewQuestionsBtn.addEventListener('click', generateInterviewQuestions);
    }
    
    const showLastQuestionsBtn = document.getElementById('showLastQuestionsBtn');
    if (showLastQuestionsBtn) {
        showLastQuestionsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showLastInterviewQuestions();
        });
    }
    
    const saveResumeBtn = document.getElementById('saveResumeBtn');
    if (saveResumeBtn) {
        saveResumeBtn.addEventListener('click', saveResume);
    }
    
    const loadSavedBtn = document.getElementById('loadSavedBtn');
    if (loadSavedBtn) {
        loadSavedBtn.addEventListener('click', loadSavedResumes);
    }
    
    const loadDemoBtn = document.getElementById('loadDemoBtn');
    if (loadDemoBtn) {
        loadDemoBtn.addEventListener('click', forceLoadDemoData);
    }
    
    const previewBtn = document.getElementById('previewBtn');
    if (previewBtn) {
        previewBtn.addEventListener('click', function() {
           
            // Reload current data with current template
            const savedData = localStorage.getItem('resumeData');
            if (savedData) {
                try {
                    const data = JSON.parse(savedData);
                    renderResumePreview(data);
                    showAlert('Preview refreshed!', 'success');
                } catch (error) {
                    console.error('Error refreshing preview:', error);
                    loadResumeData();
                }
            } else {
                loadResumeData();
            }
        });
    }
});

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        renderResumePreview,
        downloadPDF,
        loadResumeData,
        saveAndPreview,
        switchTemplate,
        getCurrentTemplate,
        saveSelectedTemplate,
        shareResume,
        showShareModal,
        copyToClipboard,
        generateCoverLetter,
        copyCoverLetterText,
        downloadCoverLetterText,
        regenerateCoverLetter,
        saveResume,
        loadSavedResumes,
        loadResumeById,
        shareResumeById,
        deleteResumeById,
        forceLoadDemoData
    };
}

// Open review mode function
function openReviewMode() {
    const currentResumeId = getCurrentResumeId();
    const url = currentResumeId 
        ? `/review.html?resumeId=${currentResumeId}`
        : '/review.html';
    
    window.open(url, '_blank');
}

// Helper function to get current resume ID
function getCurrentResumeId() {
    // Try to get from URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const urlResumeId = urlParams.get('id');
    if (urlResumeId) return urlResumeId;
    
    // Try to get from localStorage
    const savedResumeId = localStorage.getItem('currentResumeId');
    if (savedResumeId) return savedResumeId;
    
    // Return null if no resume ID found
    return null;
}

// Make openReviewMode globally available
window.openReviewMode = openReviewMode;
