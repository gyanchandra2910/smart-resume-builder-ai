// ats.js - ATS Score Checking Functionality

// Function to collect resume form data
function collectResumeData() {
    const form = document.getElementById('resumeForm');
    if (!form) {
        console.error('Resume form not found');
        return null;
    }

    const formData = new FormData(form);
    const resumeData = {};

    // Process basic form data
    for (let [key, value] of formData.entries()) {
        if (!key.includes('[')) {
            resumeData[key] = value;
        }
    }

    // Process nested form data (education, experience, etc.)
    const education = {};
    const experience = {};
    const certifications = {};
    const projects = {};

    for (let [key, value] of formData.entries()) {
        if (key.includes('education[')) {
            const match = key.match(/education\[(\d+)\]\[(\w+)\]/);
            if (match) {
                const index = match[1];
                const field = match[2];
                if (!education[index]) education[index] = {};
                education[index][field] = value;
            }
        } else if (key.includes('experience[')) {
            const match = key.match(/experience\[(\d+)\]\[(\w+)\]/);
            if (match) {
                const index = match[1];
                const field = match[2];
                if (!experience[index]) experience[index] = {};
                experience[index][field] = value;
            }
        } else if (key.includes('certifications[')) {
            const match = key.match(/certifications\[(\d+)\]\[(\w+)\]/);
            if (match) {
                const index = match[1];
                const field = match[2];
                if (!certifications[index]) certifications[index] = {};
                certifications[index][field] = value;
            }
        } else if (key.includes('projects[')) {
            const match = key.match(/projects\[(\d+)\]\[(\w+)\]/);
            if (match) {
                const index = match[1];
                const field = match[2];
                if (!projects[index]) projects[index] = {};
                projects[index][field] = value;
            }
        }
    }

    // Add processed data
    resumeData.education = education;
    resumeData.experience = experience;
    resumeData.certifications = certifications;
    resumeData.projects = projects;
    
    // Add skills array if available
    if (window.skillsArray && window.skillsArray.length > 0) {
        resumeData.skills = window.skillsArray;
    }

    return resumeData;
}

// Function to collect ATS-specific resume data (for ats-check.html page)
function collectATSResumeData() {
    // First try to get data from the loaded resume builder data
    let resumeData = {};
    
    // Check if we have stored resume data from the builder
    const storedData = localStorage.getItem('currentResumeData');
    if (storedData) {
        try {
            resumeData = JSON.parse(storedData);
        } catch (e) {
            console.error('Error parsing stored resume data:', e);
        }
    }
    
    // Get the target job role from the input field
    const targetJobRole = document.getElementById('targetJobRole');
    if (targetJobRole && targetJobRole.value.trim()) {
        resumeData.roleAppliedFor = targetJobRole.value.trim();
    }
    
    // Check if user pasted resume content instead
    const resumeContentTextarea = document.getElementById('resumeContent');
    if (resumeContentTextarea && resumeContentTextarea.value.trim()) {
        // Parse pasted resume content (basic parsing)
        const content = resumeContentTextarea.value.trim();
        resumeData = parseResumeContent(content);
        
        // Add target role
        if (targetJobRole && targetJobRole.value.trim()) {
            resumeData.roleAppliedFor = targetJobRole.value.trim();
        }
    }
    
    return resumeData;
}

// Function to parse pasted resume content (basic text parsing)
function parseResumeContent(content) {
    const resumeData = {
        fullName: '',
        email: '',
        phone: '',
        careerObjective: '',
        skills: [],
        experience: {},
        education: {},
        projects: {},
        certifications: {}
    };
    
    // Extract email
    const emailMatch = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
        resumeData.email = emailMatch[0];
    }
    
    // Extract phone
    const phoneMatch = content.match(/(\+?1[-.\s]?)?(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/);
    if (phoneMatch) {
        resumeData.phone = phoneMatch[0];
    }
    
    // Extract name (first non-empty line usually)
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
        resumeData.fullName = lines[0].trim();
    }
    
    // Store the raw content for analysis
    resumeData.rawContent = content;
    
    return resumeData;
}

// Function to check ATS score
async function checkATSScore() {
    try {
        // Show loading state
        const atsButton = document.getElementById('checkATSBtn');
        const originalText = atsButton ? atsButton.innerHTML : '';
        if (atsButton) {
            atsButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Checking ATS Score...';
            atsButton.disabled = true;
        }

        // Clear previous results
        clearATSResults();

        // Collect resume data
        const resumeData = collectResumeData();
        
        if (!resumeData) {
            throw new Error('Unable to collect resume data');
        }

        // Validate that we have some basic data
        if (!resumeData.fullName && !resumeData.name) {
            throw new Error('Please fill in your name before checking ATS score');
        }

        if (!resumeData.email) {
            throw new Error('Please fill in your email before checking ATS score');
        }

        console.log('Sending ATS check request with data:', resumeData);

        // Send request to backend
        const response = await fetch('/api/resume/ats-check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(resumeData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'ATS check failed');
        }

        if (!result.success) {
            throw new Error(result.message || 'ATS check was not successful');
        }

        // Display results
        displayATSResults(result.data);

    } catch (error) {
        console.error('Error checking ATS score:', error);
        showATSError(error.message);
    } finally {
        // Reset button state
        const atsButton = document.getElementById('checkATSBtn');
        if (atsButton) {
            atsButton.innerHTML = originalText || '<i class="fas fa-search me-2"></i>Check ATS Score';
            atsButton.disabled = false;
        }
    }
}

// Function to display ATS results
function displayATSResults(data) {
    const resultsContainer = document.getElementById('atsResults');
    if (!resultsContainer) {
        console.error('ATS results container not found');
        return;
    }

    // Determine score color and rating
    let scoreColor = 'danger';
    let scoreRating = 'Needs Improvement';
    
    if (data.score >= 80) {
        scoreColor = 'success';
        scoreRating = 'Excellent';
    } else if (data.score >= 60) {
        scoreColor = 'warning';
        scoreRating = 'Good';
    } else if (data.score >= 40) {
        scoreColor = 'info';
        scoreRating = 'Fair';
    }

    // Build suggestions HTML
    const suggestionsHTML = data.suggestions.map((suggestion, index) => `
        <div class="alert alert-light border-start border-primary border-3 mb-3">
            <div class="d-flex align-items-start">
                <div class="flex-shrink-0">
                    <span class="badge bg-primary rounded-circle">${index + 1}</span>
                </div>
                <div class="flex-grow-1 ms-3">
                    <p class="mb-0">${suggestion}</p>
                </div>
            </div>
        </div>
    `).join('');

    // Build sections analysis HTML
    let sectionsHTML = '';
    if (data.sectionsAnalyzed) {
        const sections = [
            { key: 'hasObjective', label: 'Professional Objective', icon: 'fas fa-bullseye' },
            { key: 'hasSkills', label: 'Technical Skills', icon: 'fas fa-code' },
            { key: 'hasExperience', label: 'Work Experience', icon: 'fas fa-briefcase' },
            { key: 'hasEducation', label: 'Education', icon: 'fas fa-graduation-cap' },
            { key: 'hasProjects', label: 'Projects', icon: 'fas fa-project-diagram' },
            { key: 'hasCertifications', label: 'Certifications', icon: 'fas fa-certificate' }
        ];

        sectionsHTML = sections.map(section => {
            const hasSection = data.sectionsAnalyzed[section.key];
            const statusClass = hasSection ? 'text-success' : 'text-muted';
            const statusIcon = hasSection ? 'fas fa-check-circle' : 'fas fa-circle';
            
            return `
                <div class="col-md-6 mb-2">
                    <div class="d-flex align-items-center">
                        <i class="${section.icon} me-2 text-primary"></i>
                        <span class="flex-grow-1">${section.label}</span>
                        <i class="${statusIcon} ${statusClass}"></i>
                    </div>
                </div>
            `;
        }).join('');
    }

    resultsContainer.innerHTML = `
        <div class="alert alert-info border-0 shadow-sm mb-4">
            <div class="row align-items-center">
                <div class="col-md-8">
                    <h4 class="alert-heading mb-0">
                        <i class="fas fa-chart-line me-2"></i>ATS Compatibility Analysis Complete
                    </h4>
                    <p class="mb-0 mt-2">Your resume has been analyzed for ATS compatibility and overall quality.</p>
                </div>
                <div class="col-md-4 text-md-end">
                    <div class="position-relative d-inline-block">
                        <svg width="80" height="80" class="position-relative">
                            <circle cx="40" cy="40" r="35" fill="none" stroke="#e9ecef" stroke-width="6"/>
                            <circle cx="40" cy="40" r="35" fill="none" stroke="#" 
                                stroke-width="6" 
                                stroke-dasharray="${2 * Math.PI * 35}" 
                                stroke-dashoffset="${2 * Math.PI * 35 * (1 - data.score / 100)}"
                                stroke-linecap="round"
                                transform="rotate(-90 40 40)"
                                class="text-${scoreColor}"/>
                        </svg>
                        <div class="position-absolute top-50 start-50 translate-middle text-center">
                            <div class="h4 mb-0 fw-bold text-${scoreColor}">${data.score}</div>
                            <small class="text-muted">/ 100</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-lg-8">
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-primary text-white">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-lightbulb me-2"></i>Improvement Suggestions
                        </h5>
                    </div>
                    <div class="card-body">
                        <p class="text-muted mb-4">Here are three specific recommendations to improve your resume's ATS compatibility:</p>
                        ${suggestionsHTML}
                    </div>
                </div>
            </div>
            
            <div class="col-lg-4">
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-light">
                        <h6 class="card-title mb-0">
                            <i class="fas fa-star me-2"></i>Score Rating
                        </h6>
                    </div>
                    <div class="card-body text-center">
                        <div class="display-4 fw-bold text-${scoreColor} mb-2">${data.score}</div>
                        <div class="h5 text-${scoreColor} mb-3">${scoreRating}</div>
                        <div class="progress mb-3" style="height: 8px;">
                            <div class="progress-bar bg-${scoreColor}" role="progressbar" 
                                 style="width: ${data.score}%" aria-valuenow="${data.score}" 
                                 aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <small class="text-muted">
                            ${data.resumeWordCount ? `Word Count: ${data.resumeWordCount}` : ''}
                        </small>
                    </div>
                </div>

                ${sectionsHTML ? `
                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-light">
                        <h6 class="card-title mb-0">
                            <i class="fas fa-list-check me-2"></i>Section Completeness
                        </h6>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            ${sectionsHTML}
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;

    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Show success message
    showATSAlert('ATS analysis completed successfully!', 'success');
}

// Function to clear previous ATS results
function clearATSResults() {
    const resultsContainer = document.getElementById('atsResults');
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
    }
}

// Function to show ATS error
function showATSError(message) {
    const resultsContainer = document.getElementById('atsResults');
    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div class="alert alert-danger border-0 shadow-sm">
                <div class="d-flex align-items-center">
                    <i class="fas fa-exclamation-triangle me-3"></i>
                    <div>
                        <h6 class="alert-heading mb-1">ATS Check Failed</h6>
                        <p class="mb-0">${message}</p>
                    </div>
                </div>
            </div>
        `;
        
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    showATSAlert(`ATS check failed: ${message}`, 'danger');
}

// Function to show ATS alerts
function showATSAlert(message, type = 'info') {
    // Remove any existing ATS alerts
    const existingAlert = document.querySelector('.ats-alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show ats-alert`;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
    `;
    alertDiv.innerHTML = `
        <i class="fas fa-chart-line me-2"></i>${message}
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

// Function to initialize ATS checking functionality
function initializeATSCheck() {
    const atsButton = document.getElementById('checkATSBtn');
    if (atsButton) {
        atsButton.addEventListener('click', checkATSScore);
        console.log('ATS check functionality initialized');
    }
}

// =============================================
// ATS Check Page Specific Functions (ats-check.html)
// =============================================

// Function to check ATS score for standalone ATS check page
async function checkATSScoreStandalone() {
    try {
        // Show loading state
        const analyzeButton = document.getElementById('analyzeResumeBtn');
        const originalText = analyzeButton ? analyzeButton.innerHTML : '';
        if (analyzeButton) {
            analyzeButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Analyzing Resume...';
            analyzeButton.disabled = true;
        }

        // Clear previous results
        clearATSResults();

        // Collect resume data (ATS-specific)
        const resumeData = collectATSResumeData();
        
        if (!resumeData || Object.keys(resumeData).length === 0) {
            throw new Error('Please load resume data or paste resume content before analyzing');
        }

        // Validate target role
        const targetRole = document.getElementById('targetJobRole');
        if (!targetRole || !targetRole.value.trim()) {
            throw new Error('Please enter the target job role/position for tailored analysis');
        }

        console.log('Sending ATS check request with data:', resumeData);

        // Send request to backend
        const response = await fetch('/api/resume/ats-check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(resumeData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'ATS check failed');
        }

        if (!result.success) {
            throw new Error(result.message || 'ATS check was not successful');
        }

        // Display results
        displayATSResults(result.data);

    } catch (error) {
        console.error('Error checking ATS score:', error);
        showATSError(error.message);
    } finally {
        // Reset button state
        const analyzeButton = document.getElementById('analyzeResumeBtn');
        if (analyzeButton) {
            analyzeButton.innerHTML = originalText || '<i class="fas fa-chart-line me-2"></i>Analyze Resume';
            analyzeButton.disabled = false;
        }
    }
}

// Function to load data from resume builder
function loadFromResumeBuilder() {
    try {
        // Check if we have stored resume data
        const storedData = localStorage.getItem('currentResumeData');
        if (!storedData) {
            throw new Error('No resume data found. Please build your resume first.');
        }

        const resumeData = JSON.parse(storedData);
        
        // Display loaded data summary
        const dataDisplay = document.getElementById('currentResumeData');
        if (dataDisplay) {
            const sections = [];
            if (resumeData.fullName || resumeData.name) sections.push('Personal Info');
            if (resumeData.experience && Object.keys(resumeData.experience).length > 0) sections.push('Experience');
            if (resumeData.education && Object.keys(resumeData.education).length > 0) sections.push('Education');
            if (resumeData.skills && resumeData.skills.length > 0) sections.push('Skills');
            if (resumeData.projects && Object.keys(resumeData.projects).length > 0) sections.push('Projects');
            if (resumeData.certifications && Object.keys(resumeData.certifications).length > 0) sections.push('Certifications');

            dataDisplay.innerHTML = `
                <div class="alert alert-success border-0 shadow-sm">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-check-circle me-3"></i>
                        <div>
                            <h6 class="alert-heading mb-1">Resume Data Loaded Successfully</h6>
                            <p class="mb-0">
                                <strong>Sections loaded:</strong> ${sections.join(', ')}
                                ${resumeData.roleAppliedFor ? `<br><strong>Current target role:</strong> ${resumeData.roleAppliedFor}` : ''}
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }

        // Pre-fill target role if available
        const targetRoleInput = document.getElementById('targetJobRole');
        if (targetRoleInput && resumeData.roleAppliedFor) {
            targetRoleInput.value = resumeData.roleAppliedFor;
        }

        // Enable analyze button
        const analyzeButton = document.getElementById('analyzeResumeBtn');
        if (analyzeButton) {
            analyzeButton.disabled = false;
        }

        showATSAlert('Resume data loaded successfully!', 'success');

    } catch (error) {
        console.error('Error loading resume data:', error);
        showATSError(error.message);
    }
}

// Function to enable resume content pasting
function enableResumeContentPasting() {
    const textArea = document.getElementById('resumeTextArea');
    const analyzeButton = document.getElementById('analyzeResumeBtn');
    const dataDisplay = document.getElementById('currentResumeData');
    
    if (textArea) {
        textArea.style.display = 'block';
        
        // Update instructions
        if (dataDisplay) {
            dataDisplay.innerHTML = `
                <div class="alert alert-info border-0 shadow-sm">
                    <i class="fas fa-info-circle me-2"></i>
                    <strong>Paste Mode:</strong> Please paste your resume content in the text area above and enter your target job role.
                </div>
            `;
        }
        
        // Enable analyze button when content is added
        const resumeContent = document.getElementById('resumeContent');
        if (resumeContent) {
            resumeContent.addEventListener('input', function() {
                const targetRole = document.getElementById('targetJobRole');
                if (analyzeButton) {
                    analyzeButton.disabled = !(this.value.trim() && targetRole && targetRole.value.trim());
                }
            });
        }
    }
}

// Function to validate inputs before analysis
function validateATSInputs() {
    const targetRole = document.getElementById('targetJobRole');
    const resumeContent = document.getElementById('resumeContent');
    const storedData = localStorage.getItem('currentResumeData');
    
    if (!targetRole || !targetRole.value.trim()) {
        return { valid: false, message: 'Please enter the target job role/position' };
    }
    
    const hasResumeContent = resumeContent && resumeContent.value.trim();
    const hasStoredData = storedData && storedData.length > 0;
    
    if (!hasResumeContent && !hasStoredData) {
        return { valid: false, message: 'Please load resume data or paste resume content' };
    }
    
    return { valid: true };
}

// Function to initialize ATS check page
function initializeATSCheckPage() {
    console.log('Initializing ATS Check Page...');
    
    // Load from builder button
    const loadFromBuilderBtn = document.getElementById('loadFromBuilderBtn');
    if (loadFromBuilderBtn) {
        loadFromBuilderBtn.addEventListener('click', loadFromResumeBuilder);
    }
    
    // Paste resume button
    const pasteResumeBtn = document.getElementById('pasteResumeBtn');
    if (pasteResumeBtn) {
        pasteResumeBtn.addEventListener('click', enableResumeContentPasting);
    }
    
    // Analyze resume button
    const analyzeResumeBtn = document.getElementById('analyzeResumeBtn');
    if (analyzeResumeBtn) {
        analyzeResumeBtn.addEventListener('click', checkATSScoreStandalone);
    }
    
    // Target role input validation
    const targetJobRole = document.getElementById('targetJobRole');
    if (targetJobRole) {
        targetJobRole.addEventListener('input', function() {
            const analyzeButton = document.getElementById('analyzeResumeBtn');
            if (analyzeButton) {
                const validation = validateATSInputs();
                analyzeButton.disabled = !validation.valid;
            }
        });
    }
    
    console.log('ATS Check Page initialized successfully');
}

// Auto-initialize ATS check page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the ATS check page
    if (window.location.pathname.includes('ats-check.html') || document.getElementById('analyzeResumeBtn')) {
        initializeATSCheckPage();
    } else {
        // Initialize regular ATS check for resume builder page
        initializeATSCheck();
    }
});
