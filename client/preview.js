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

// Function to load resume data from localStorage or API
function loadResumeData() {
    // Try to get data from localStorage first
    const savedData = localStorage.getItem('resumeData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            renderResumePreview(data);
            return;
        } catch (error) {
            console.error('Error parsing saved resume data:', error);
        }
    }

    // If no saved data, show placeholder or fetch from API
    const placeholderData = {
        fullName: 'Your Name',
        email: 'your.email@example.com',
        phone: '+1-555-0123',
        roleAppliedFor: 'Your Desired Role',
        careerObjective: 'Your career objective will appear here...',
        skills: ['Skill 1', 'Skill 2', 'Skill 3'],
        education: [{
            degree: 'Your Degree',
            college: 'Your College/University',
            year: '2024'
        }],
        experience: [{
            company: 'Company Name',
            role: 'Your Role',
            duration: 'Start Date - End Date',
            description: 'Description of your role and achievements...'
        }]
    };
    
    renderResumePreview(placeholderData);
}

// Function to save current form data and refresh preview
function saveAndPreview() {
    // Get form data (if form exists)
    const form = document.getElementById('resumeForm');
    if (form) {
        // Collect form data similar to the main script.js
        const formData = new FormData(form);
        const resumeData = {};

        // Process basic form data
        for (let [key, value] of formData.entries()) {
            if (!key.includes('[')) {
                resumeData[key] = value;
            }
        }

        // Add skills array if available
        if (window.skillsArray) {
            resumeData.skills = window.skillsArray;
        }

        // Save to localStorage
        localStorage.setItem('resumeData', JSON.stringify(resumeData));
        
        // Render preview
        renderResumePreview(resumeData);
    }
}

// Alert function for user feedback (if not already defined)
function showAlert(message, type = 'info') {
    // Remove any existing alerts
    const existingAlert = document.querySelector('.preview-alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show preview-alert`;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // Add to document
    document.body.appendChild(alertDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv && alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
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
        saveSelectedTemplate
    };
}
