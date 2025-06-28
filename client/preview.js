// preview.js - Resume Preview and PDF Generation

// Function to render resume preview from data
function renderResumePreview(data) {
    const previewContainer = document.getElementById('resumePreview');
    
    if (!previewContainer) {
        console.error('Resume preview container not found!');
        return;
    }

    // Clear previous content
    previewContainer.innerHTML = '';

    // Create resume HTML structure
    const resumeHTML = `
        <div class="resume-container bg-white p-4 shadow-sm border">
            <!-- Header Section -->
            <div class="resume-header text-center mb-4 pb-3 border-bottom">
                <h1 class="display-6 mb-2 text-primary fw-bold">${data.fullName || data.name || 'Name Not Provided'}</h1>
                <h2 class="h4 text-muted mb-3">${data.roleAppliedFor || 'Role Not Specified'}</h2>
                
                <!-- Contact Information -->
                <div class="contact-info">
                    <div class="row justify-content-center">
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
                    <div class="row justify-content-center mt-2">
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

            <!-- Professional Objective -->
            ${data.careerObjective || data.objective ? `
            <div class="resume-section mb-4">
                <h3 class="section-title h5 text-primary fw-bold mb-3 border-bottom pb-1">
                    <i class="fas fa-bullseye me-2"></i>Professional Objective
                </h3>
                <p class="objective-text">${data.careerObjective || data.objective}</p>
            </div>
            ` : ''}

            <!-- Skills Section -->
            ${data.skills && data.skills.length > 0 ? `
            <div class="resume-section mb-4">
                <h3 class="section-title h5 text-primary fw-bold mb-3 border-bottom pb-1">
                    <i class="fas fa-code me-2"></i>Technical Skills
                </h3>
                <div class="skills-container">
                    ${data.skills.map(skill => `<span class="badge bg-light text-dark border me-2 mb-2 p-2">${skill}</span>`).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Experience Section -->
            ${data.experience && (Array.isArray(data.experience) ? data.experience.length > 0 : Object.keys(data.experience).length > 0) ? `
            <div class="resume-section mb-4">
                <h3 class="section-title h5 text-primary fw-bold mb-3 border-bottom pb-1">
                    <i class="fas fa-briefcase me-2"></i>Professional Experience
                </h3>
                ${renderExperienceSection(data.experience)}
            </div>
            ` : ''}

            <!-- Education Section -->
            ${data.education && (Array.isArray(data.education) ? data.education.length > 0 : Object.keys(data.education).length > 0) ? `
            <div class="resume-section mb-4">
                <h3 class="section-title h5 text-primary fw-bold mb-3 border-bottom pb-1">
                    <i class="fas fa-graduation-cap me-2"></i>Education
                </h3>
                ${renderEducationSection(data.education)}
            </div>
            ` : ''}

            <!-- Projects Section -->
            ${data.projects && (Array.isArray(data.projects) ? data.projects.length > 0 : Object.keys(data.projects).length > 0) ? `
            <div class="resume-section mb-4">
                <h3 class="section-title h5 text-primary fw-bold mb-3 border-bottom pb-1">
                    <i class="fas fa-project-diagram me-2"></i>Projects
                </h3>
                ${renderProjectsSection(data.projects)}
            </div>
            ` : ''}

            <!-- Certifications Section -->
            ${data.certifications && (Array.isArray(data.certifications) ? data.certifications.length > 0 : Object.keys(data.certifications).length > 0) ? `
            <div class="resume-section mb-4">
                <h3 class="section-title h5 text-primary fw-bold mb-3 border-bottom pb-1">
                    <i class="fas fa-certificate me-2"></i>Certifications
                </h3>
                ${renderCertificationsSection(data.certifications)}
            </div>
            ` : ''}
        </div>
    `;

    previewContainer.innerHTML = resumeHTML;
}

// Helper function to render experience section
function renderExperienceSection(experience) {
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
function renderEducationSection(education) {
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
function renderProjectsSection(projects) {
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
                    ${proj.techStack ? `<p class="tech-stack text-success mb-1"><i class="fas fa-code me-1"></i>${proj.techStack}</p>` : ''}
                </div>
                <div class="col-md-4 text-md-end">
                    ${proj.githubLink ? `<a href="${proj.githubLink}" target="_blank" class="btn btn-sm btn-outline-dark"><i class="fab fa-github me-1"></i>View Code</a>` : ''}
                </div>
            </div>
            ${proj.description ? `<p class="description text-muted mb-0">${proj.description}</p>` : ''}
        </div>
    `).join('');
}

// Helper function to render certifications section
function renderCertificationsSection(certifications) {
    let certificationsArray = [];
    
    if (Array.isArray(certifications)) {
        certificationsArray = certifications;
    } else {
        // Convert object to array
        certificationsArray = Object.values(certifications).filter(cert => cert.name);
    }

    return certificationsArray.map(cert => `
        <div class="certification-item mb-2">
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

// Function to download resume as PDF
function downloadPDF() {
    const element = document.getElementById('resumePreview');
    const downloadBtn = document.getElementById('downloadPdfBtn');
    
    if (!element) {
        alert('Resume preview not found. Please generate a preview first.');
        return;
    }

    // Show loading state
    const originalText = downloadBtn ? downloadBtn.innerHTML : '';
    if (downloadBtn) {
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating PDF...';
        downloadBtn.disabled = true;
    }

    // Configure PDF options
    const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: 'resume.pdf',
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

    // Generate PDF
    html2pdf().set(opt).from(element).save().then(() => {
        // Reset button state
        if (downloadBtn) {
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        }
        
        // Show success message
        showAlert('PDF downloaded successfully!', 'success');
    }).catch((error) => {
        console.error('Error generating PDF:', error);
        
        // Reset button state
        if (downloadBtn) {
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        }
        
        // Show error message
        showAlert('Error generating PDF. Please try again.', 'danger');
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
    // Load initial data
    loadResumeData();
    
    // Add event listeners
    const downloadBtn = document.getElementById('downloadPdfBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadPDF);
    }
    
    const previewBtn = document.getElementById('previewBtn');
    if (previewBtn) {
        previewBtn.addEventListener('click', saveAndPreview);
    }
});

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        renderResumePreview,
        downloadPDF,
        loadResumeData,
        saveAndPreview
    };
}
