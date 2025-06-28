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

// Export functions for use in other scripts
if (typeof window !== 'undefined') {
    window.atsChecker = {
        checkATSScore,
        collectResumeData,
        displayATSResults,
        clearATSResults
    };
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeATSCheck);
