// Resume Form JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAuthentication();
    
    // Load saved resumes
    loadSavedResumes();
    
    // Add refresh button event listener
    const refreshBtn = document.getElementById('refreshResumesBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadSavedResumes);
    }
    
    const form = document.getElementById('resumeForm');
    const skillsInput = document.getElementById('keySkills');
    const skillsContainer = document.getElementById('skillsContainer');
    let skillsArray = [];
    let educationCount = 1;
    let experienceCount = 1;
    let certificationCount = 1;
    let projectCount = 1;

    // Skills management
    skillsInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    });

    skillsInput.addEventListener('blur', function() {
        if (this.value.trim()) {
            addSkill();
        }
    });

    function addSkill() {
        const skill = skillsInput.value.trim();
        if (skill && !skillsArray.includes(skill)) {
            skillsArray.push(skill);
            renderSkills();
            skillsInput.value = '';
            validateSkills();
        }
    }

    function removeSkill(index) {
        skillsArray.splice(index, 1);
        renderSkills();
        validateSkills();
    }

    function renderSkills() {
        skillsContainer.innerHTML = '';
        skillsArray.forEach((skill, index) => {
            const skillTag = document.createElement('div');
            skillTag.className = 'skill-tag';
            skillTag.innerHTML = `
                ${skill}
                <button type="button" class="remove-skill" onclick="removeSkillByIndex(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            skillsContainer.appendChild(skillTag);
        });
    }

    function validateSkills() {
        const skillsInput = document.getElementById('keySkills');
        if (skillsArray.length === 0) {
            skillsInput.classList.add('is-invalid');
            return false;
        } else {
            skillsInput.classList.remove('is-invalid');
            return true;
        }
    }

    // Make removeSkillByIndex globally accessible
    window.removeSkillByIndex = function(index) {
        removeSkill(index);
    };

    // Add education entry
    window.addEducationEntry = function() {
        const container = document.getElementById('educationContainer');
        const newEntry = document.createElement('div');
        newEntry.className = 'education-entry border p-3 mb-3 rounded';
        newEntry.innerHTML = `
            <button type="button" class="remove-entry" onclick="removeEntry(this)">
                <i class="fas fa-times"></i>
            </button>
            <div class="row">
                <div class="col-md-4">
                    <label class="form-label">Degree <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" name="education[${educationCount}][degree]" required>
                    <div class="invalid-feedback">Please provide your degree.</div>
                </div>
                <div class="col-md-4">
                    <label class="form-label">College/University <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" name="education[${educationCount}][college]" required>
                    <div class="invalid-feedback">Please provide your college/university.</div>
                </div>
                <div class="col-md-4">
                    <label class="form-label">Year <span class="text-danger">*</span></label>
                    <input type="number" class="form-control" name="education[${educationCount}][year]" min="1950" max="2030" required>
                    <div class="invalid-feedback">Please provide a valid year.</div>
                </div>
            </div>
        `;
        container.appendChild(newEntry);
        educationCount++;
    };

    // Add experience entry
    window.addExperienceEntry = function() {
        const container = document.getElementById('experienceContainer');
        const newEntry = document.createElement('div');
        newEntry.className = 'experience-entry border p-3 mb-3 rounded';
        newEntry.innerHTML = `
            <button type="button" class="remove-entry" onclick="removeEntry(this)">
                <i class="fas fa-times"></i>
            </button>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label">Company <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" name="experience[${experienceCount}][company]" required>
                    <div class="invalid-feedback">Please provide the company name.</div>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Role <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" name="experience[${experienceCount}][role]" required>
                    <div class="invalid-feedback">Please provide your role.</div>
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label">Duration <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" name="experience[${experienceCount}][duration]" placeholder="e.g., Jan 2020 - Dec 2022" required>
                    <div class="invalid-feedback">Please provide the duration.</div>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <label class="form-label">Description <span class="text-danger">*</span></label>
                    <textarea class="form-control" name="experience[${experienceCount}][description]" rows="3" required></textarea>
                    <div class="invalid-feedback">Please provide a description of your role.</div>
                </div>
            </div>
        `;
        container.appendChild(newEntry);
        experienceCount++;
    };

    // Add certification entry
    window.addCertificationEntry = function() {
        const container = document.getElementById('certificationsContainer');
        const newEntry = document.createElement('div');
        newEntry.className = 'certification-entry border p-3 mb-3 rounded';
        newEntry.innerHTML = `
            <button type="button" class="remove-entry" onclick="removeEntry(this)">
                <i class="fas fa-times"></i>
            </button>
            <div class="row">
                <div class="col-md-4">
                    <label class="form-label">Certification Name</label>
                    <input type="text" class="form-control" name="certifications[${certificationCount}][name]">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Issuer</label>
                    <input type="text" class="form-control" name="certifications[${certificationCount}][issuer]">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Date</label>
                    <input type="month" class="form-control" name="certifications[${certificationCount}][date]">
                </div>
            </div>
        `;
        container.appendChild(newEntry);
        certificationCount++;
    };

    // Add project entry
    window.addProjectEntry = function() {
        const container = document.getElementById('projectsContainer');
        const newEntry = document.createElement('div');
        newEntry.className = 'project-entry border p-3 mb-3 rounded';
        newEntry.innerHTML = `
            <button type="button" class="remove-entry" onclick="removeEntry(this)">
                <i class="fas fa-times"></i>
            </button>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label">Project Title</label>
                    <input type="text" class="form-control" name="projects[${projectCount}][title]">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Tech Stack</label>
                    <input type="text" class="form-control" name="projects[${projectCount}][techStack]" placeholder="e.g., React, Node.js, MongoDB">
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label">GitHub Link</label>
                    <input type="url" class="form-control" name="projects[${projectCount}][githubLink]" placeholder="https://github.com/yourusername/project">
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" name="projects[${projectCount}][description]" rows="3"></textarea>
                </div>
            </div>
        `;
        container.appendChild(newEntry);
        projectCount++;
    };

    // Remove entry function
    window.removeEntry = function(button) {
        const entry = button.closest('.education-entry, .experience-entry, .certification-entry, .project-entry');
        entry.remove();
    };

    // Form validation
    function validateForm() {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        // Clear previous validation
        form.classList.remove('was-validated');
        
        // Check required fields
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });

        // Validate email
        const email = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email.value && !emailRegex.test(email.value)) {
            email.classList.add('is-invalid');
            isValid = false;
        }

        // Validate phone
        const phone = document.getElementById('phone');
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (phone.value && !phoneRegex.test(phone.value.replace(/[\s\-\(\)]/g, ''))) {
            phone.classList.add('is-invalid');
            isValid = false;
        }

        // Validate URLs
        const urlFields = ['linkedin', 'github', 'portfolio'];
        urlFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field.value) {
                try {
                    new URL(field.value);
                    field.classList.remove('is-invalid');
                } catch {
                    field.classList.add('is-invalid');
                    isValid = false;
                }
            }
        });

        // Validate project GitHub links
        const githubLinks = form.querySelectorAll('input[name*="githubLink"]');
        githubLinks.forEach(link => {
            if (link.value) {
                try {
                    new URL(link.value);
                    link.classList.remove('is-invalid');
                } catch {
                    link.classList.add('is-invalid');
                    isValid = false;
                }
            }
        });

        // Validate skills
        if (!validateSkills()) {
            isValid = false;
        }

        // Validate year fields
        const yearFields = form.querySelectorAll('input[type="number"][min="1950"]');
        yearFields.forEach(field => {
            const year = parseInt(field.value);
            if (field.value && (year < 1950 || year > 2030)) {
                field.classList.add('is-invalid');
                isValid = false;
            }
        });

        return isValid;
    }

    // Real-time validation
    form.addEventListener('input', function(e) {
        const field = e.target;
        
        if (field.hasAttribute('required') && field.value.trim()) {
            field.classList.remove('is-invalid');
        }

        // Email validation
        if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(field.value)) {
                field.classList.remove('is-invalid');
            }
        }

        // URL validation
        if (field.type === 'url' && field.value) {
            try {
                new URL(field.value);
                field.classList.remove('is-invalid');
            } catch {
                // Keep invalid state for real-time feedback
            }
        }
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.classList.add('loading');
            submitBtn.innerHTML = '<span>Generating Resume...</span>';
            submitBtn.disabled = true;

            // Collect form data
            const formData = new FormData(form);
            const resumeData = {};

            // Process basic form data
            for (let [key, value] of formData.entries()) {
                if (!key.includes('[')) {
                    resumeData[key] = value;
                }
            }

            // Process nested form data
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

            // Add processed data to resumeData
            resumeData.education = education;
            resumeData.experience = experience;
            resumeData.certifications = certifications;
            resumeData.projects = projects;
            resumeData.skills = skillsArray;

            // Send data to API
            console.log('Sending resume data:', resumeData);
            
            fetch('/api/resume/input', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(resumeData)
            })
            .then(response => {
                console.log('Response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Response data:', data);
                if (data.success) {
                    // Show success message
                    showAlert('Resume saved successfully! Resume ID: ' + data.data.id, 'success');
                    console.log('Resume saved:', data);
                    
                    // Save to localStorage for preview
                    localStorage.setItem('resumeData', JSON.stringify(resumeData));
                    localStorage.setItem('lastResumeId', data.data.id);
                    
                    // Refresh saved resumes list
                    loadSavedResumes();
                    
                    // Show success modal with options
                    showSuccessModal(data.data.id, data.data.name);
                    
                } else {
                    showAlert('Error saving resume: ' + data.message, 'danger');
                    console.error('Error:', data);
                }
            })
            .catch(error => {
                console.error('Network error:', error);
                showAlert('Network error occurred. Please check your connection and try again.', 'danger');
                
                // Save data to localStorage as backup
                localStorage.setItem('resumeDataBackup', JSON.stringify(resumeData));
                showAlert('Your data has been saved locally as backup.', 'info');
            })
            .finally(() => {
                // Reset loading state
                submitBtn.classList.remove('loading');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });

        } else {
            // Scroll to first error
            const firstError = form.querySelector('.is-invalid');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
        }
    });

    // Initialize with first entries having remove buttons (except the first one)
    document.querySelectorAll('.education-entry:first-child .remove-entry').forEach(btn => {
        btn.style.display = 'none';
    });
    document.querySelectorAll('.experience-entry:first-child .remove-entry').forEach(btn => {
        btn.style.display = 'none';
    });

    // AI Summary Generation
    const generateAIBtn = document.getElementById('generateAISummary');
    if (generateAIBtn) {
        generateAIBtn.addEventListener('click', generateAISummary);
    }

    async function generateAISummary() {
        const generateBtn = document.getElementById('generateAISummary');
        const aiSection = document.getElementById('aiSummarySection');
        
        // Get required form data
        const role = document.getElementById('roleAppliedFor').value.trim();
        const objective = document.getElementById('careerObjective').value.trim();
        
        // Validation
        if (!role) {
            showAlert('Please enter your desired position first.', 'warning');
            document.getElementById('roleAppliedFor').focus();
            return;
        }
        
        if (!objective) {
            showAlert('Please enter your career objective first.', 'warning');
            document.getElementById('careerObjective').focus();
            return;
        }
        
        if (skillsArray.length === 0) {
            showAlert('Please add at least one skill before generating AI summary.', 'warning');
            document.getElementById('keySkills').focus();
            return;
        }

        // Show loading state
        const originalText = generateBtn.innerHTML;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating AI Summary...';
        generateBtn.disabled = true;

        try {
            const response = await fetch('/api/resume/generateSummary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    role: role,
                    skills: skillsArray,
                    objective: objective
                })
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('AI response:', data);

            if (data.success) {
                // Display the AI-generated content
                document.getElementById('aiProfessionalSummary').textContent = data.data.professionalSummary;
                
                // Display bullet points
                const bulletPointsDiv = document.getElementById('aiBulletPoints');
                bulletPointsDiv.innerHTML = '<ul class="mb-0">' + 
                    data.data.bulletPoints.map(point => `<li>${point}</li>`).join('') + 
                    '</ul>';
                
                document.getElementById('aiImprovedObjective').textContent = data.data.improvedObjective;
                
                // Show the AI section
                aiSection.style.display = 'block';
                aiSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                showAlert('AI summary generated successfully!', 'success');
            } else {
                console.error('AI generation failed:', data);
                showAlert(data.message || 'Failed to generate AI summary. Please try again.', 'danger');
            }
        } catch (error) {
            console.error('Error generating AI summary:', error);
            showAlert('Error connecting to AI service. Please check your connection and try again.', 'danger');
        } finally {
            // Reset button state
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
        }
    }

    // Copy to clipboard functionality
    window.copyToClipboard = function(elementId) {
        const element = document.getElementById(elementId);
        const text = element.textContent || element.innerText;
        
        navigator.clipboard.writeText(text).then(() => {
            showAlert('Content copied to clipboard!', 'info');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            showAlert('Failed to copy content. Please try again.', 'warning');
        });
    };

    // Use improved objective functionality
    window.useImprovedObjective = function() {
        const improvedObjective = document.getElementById('aiImprovedObjective').textContent;
        const objectiveField = document.getElementById('careerObjective');
        
        if (improvedObjective && objectiveField) {
            objectiveField.value = improvedObjective;
            showAlert('Objective updated with AI-improved version!', 'success');
            
            // Scroll to the objective field to show the change
            objectiveField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            objectiveField.focus();
            
            // Trigger validation
            objectiveField.classList.remove('is-invalid');
            objectiveField.classList.add('is-valid');
        }
    };

    // Show success modal after resume creation
    function showSuccessModal(resumeId, resumeName) {
        const modalHTML = `
            <div class="modal fade" id="successModal" tabindex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title" id="successModalLabel">
                                <i class="fas fa-check-circle me-2"></i>Resume Created Successfully!
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center mb-4">
                                <i class="fas fa-file-alt fa-4x text-success mb-3"></i>
                                <h4>${resumeName}</h4>
                                <p class="text-muted">Your resume has been saved successfully!</p>
                            </div>
                            
                            <div class="row text-center">
                                <div class="col-md-4 mb-3">
                                    <div class="card h-100 border-success">
                                        <div class="card-body">
                                            <i class="fas fa-eye fa-2x text-primary mb-2"></i>
                                            <h6 class="card-title">Preview Resume</h6>
                                            <p class="card-text small">See how your resume looks with different templates</p>
                                            <a href="/preview.html?id=${resumeId}" target="_blank" class="btn btn-primary btn-sm">
                                                <i class="fas fa-eye me-1"></i>Preview
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="card h-100 border-success">
                                        <div class="card-body">
                                            <i class="fas fa-share-alt fa-2x text-info mb-2"></i>
                                            <h6 class="card-title">Share Resume</h6>
                                            <p class="card-text small">Get a public link to share with employers</p>
                                            <a href="/resume/${resumeId}" target="_blank" class="btn btn-info btn-sm">
                                                <i class="fas fa-share-alt me-1"></i>Share
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="card h-100 border-success">
                                        <div class="card-body">
                                            <i class="fas fa-chart-line fa-2x text-warning mb-2"></i>
                                            <h6 class="card-title">ATS Check</h6>
                                            <p class="card-text small">Analyze your resume for ATS compatibility</p>
                                            <a href="/ats-check.html" target="_blank" class="btn btn-warning btn-sm">
                                                <i class="fas fa-chart-line me-1"></i>Check ATS
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-success" onclick="createNewResume()">
                                <i class="fas fa-plus me-2"></i>Create Another Resume
                            </button>
                            <button type="button" class="btn btn-success" data-bs-dismiss="modal">
                                <i class="fas fa-check me-2"></i>Done
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('successModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to document
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        modal.show();

        // Clean up modal when hidden
        document.getElementById('successModal').addEventListener('hidden.bs.modal', function () {
            this.remove();
        });
    }

    // Create new resume function
    function createNewResume() {
        if (confirm('Are you sure you want to create a new resume? This will clear the current form.')) {
            form.reset();
            skillsArray = [];
            renderSkills();
            educationCount = 1;
            experienceCount = 1;
            certificationCount = 1;
            projectCount = 1;
            
            // Reset dynamic sections to initial state
            document.getElementById('educationContainer').innerHTML = document.querySelector('.education-entry').outerHTML;
            document.getElementById('experienceContainer').innerHTML = document.querySelector('.experience-entry').outerHTML;
            document.getElementById('certificationsContainer').innerHTML = document.querySelector('.certification-entry').outerHTML;
            document.getElementById('projectsContainer').innerHTML = document.querySelector('.project-entry').outerHTML;
            
            // Hide success modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('successModal'));
            if (modal) {
                modal.hide();
            }
            
            // Scroll to top of form
            document.getElementById('resumeForm').scrollIntoView({ behavior: 'smooth' });
            
            showAlert('Form cleared. You can now create a new resume!', 'info');
        }
    }

    // Make createNewResume globally accessible
    window.createNewResume = createNewResume;

    // Improved alert function
    function showAlert(message, type = 'info') {
        // Remove any existing alerts
        const existingAlert = document.querySelector('.custom-alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show custom-alert`;
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = '9999';
        alertDiv.style.minWidth = '300px';
        alertDiv.style.maxWidth = '500px';
        alertDiv.innerHTML = `
            ${getAlertIcon(type)} ${message}
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

    function getAlertIcon(type) {
        const icons = {
            'success': '<i class="fas fa-check-circle me-2"></i>',
            'danger': '<i class="fas fa-exclamation-circle me-2"></i>',
            'warning': '<i class="fas fa-exclamation-triangle me-2"></i>',
            'info': '<i class="fas fa-info-circle me-2"></i>'
        };
        return icons[type] || icons['info'];
    }

    // Enhanced scroll to form function
    function scrollToForm() {
        document.getElementById('resumeForm').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
        // Focus on first input
        setTimeout(() => {
            document.getElementById('fullName').focus();
        }, 500);
    }

    // Make scrollToForm globally accessible
    window.scrollToForm = scrollToForm;

    // Authentication functions
    function checkAuthentication() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
            // User is logged in
            const userData = JSON.parse(user);
            const loginNav = document.getElementById('loginNav');
            const registerNav = document.getElementById('registerNav');
            const userNav = document.getElementById('userNav');
            const userName = document.getElementById('userName');
            
            if (loginNav) loginNav.style.display = 'none';
            if (registerNav) registerNav.style.display = 'none';
            if (userNav) userNav.style.display = 'block';
            if (userName) userName.textContent = userData.name;
            
            // Add logout functionality
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/';
                });
            }
        } else {
            // For testing, allow access without login but show warning
            console.warn('User not logged in - demo mode');
            // Uncomment next line to require login:
            // window.location.href = '/login.html';
        }
    }

    // Preview Resume functionality
    const previewBtn = document.getElementById('previewResumeBtn');
    if (previewBtn) {
        previewBtn.addEventListener('click', previewResume);
    }

    function previewResume() {
        // Collect current form data
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
        resumeData.skills = skillsArray;

        // Save to localStorage
        localStorage.setItem('resumeData', JSON.stringify(resumeData));

        // Open preview page
        window.open('/preview.html', '_blank');
    }

    // Saved Resumes functionality
    function loadSavedResumes() {
        const container = document.getElementById('savedResumesContainer');
        
        // Show loading state
        container.innerHTML = `
            <div class="text-center py-3">
                <div class="spinner-border text-info" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Loading your saved resumes...</p>
            </div>
        `;

        // Fetch resumes from API
        fetch('/api/resume')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.data.length > 0) {
                    displaySavedResumes(data.data);
                } else {
                    container.innerHTML = `
                        <div class="text-center py-4">
                            <i class="fas fa-file-alt fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted">No Saved Resumes</h5>
                            <p class="text-muted">You haven't created any resumes yet. Fill out the form below to create your first resume!</p>
                            <button class="btn btn-primary" onclick="scrollToForm()">
                                <i class="fas fa-plus me-2"></i>Create New Resume
                            </button>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('Error loading saved resumes:', error);
                container.innerHTML = `
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <strong>Unable to load saved resumes.</strong> Please check your connection and try again.
                        <button class="btn btn-sm btn-outline-warning ms-2" onclick="loadSavedResumes()">
                            <i class="fas fa-retry me-1"></i>Retry
                        </button>
                    </div>
                `;
            });
    }

    function displaySavedResumes(resumes) {
        const container = document.getElementById('savedResumesContainer');
        
        container.innerHTML = `
            <div class="row g-3">
                ${resumes.map(resume => `
                    <div class="col-md-6 col-lg-4">
                        <div class="card h-100 border-0 shadow-sm resume-card">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h6 class="card-title mb-1 fw-bold">${resume.name}</h6>
                                        <small class="text-muted">${resume.roleAppliedFor}</small>
                                    </div>
                                    <div class="dropdown">
                                        <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                            <i class="fas fa-ellipsis-v"></i>
                                        </button>
                                        <ul class="dropdown-menu dropdown-menu-end">
                                            <li><a class="dropdown-item" href="#" onclick="editResume('${resume._id}')">
                                                <i class="fas fa-edit me-2"></i>Edit
                                            </a></li>
                                            <li><a class="dropdown-item" href="/preview.html?id=${resume._id}" target="_blank">
                                                <i class="fas fa-eye me-2"></i>Preview
                                            </a></li>
                                            <li><a class="dropdown-item" href="/resume/${resume._id}" target="_blank">
                                                <i class="fas fa-share-alt me-2"></i>Public View
                                            </a></li>
                                            <li><hr class="dropdown-divider"></li>
                                            <li><a class="dropdown-item text-danger" href="#" onclick="deleteResume('${resume._id}', '${resume.name}')">
                                                <i class="fas fa-trash me-2"></i>Delete
                                            </a></li>
                                        </ul>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <small class="text-muted d-block">
                                        <i class="fas fa-envelope me-1"></i>${resume.email}
                                    </small>
                                    <small class="text-muted d-block">
                                        <i class="fas fa-calendar me-1"></i>Created: ${new Date(resume.createdAt).toLocaleDateString()}
                                    </small>
                                </div>
                                
                                <div class="d-grid gap-2">
                                    <button class="btn btn-primary btn-sm" onclick="editResume('${resume._id}')">
                                        <i class="fas fa-edit me-2"></i>Edit Resume
                                    </button>
                                    <div class="btn-group" role="group">
                                        <a href="/preview.html?id=${resume._id}" target="_blank" class="btn btn-outline-primary btn-sm">
                                            <i class="fas fa-eye me-1"></i>Preview
                                        </a>
                                        <a href="/resume/${resume._id}" target="_blank" class="btn btn-outline-info btn-sm">
                                            <i class="fas fa-share-alt me-1"></i>Share
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            ${resumes.length >= 3 ? `
                <div class="text-center mt-4">
                    <p class="text-muted">You have ${resumes.length} saved resumes. Create variations for different job applications!</p>
                </div>
            ` : `
                <div class="text-center mt-4">
                    <button class="btn btn-success" onclick="scrollToForm()">
                        <i class="fas fa-plus me-2"></i>Create Another Resume
                    </button>
                </div>
            `}
        `;
    }

    // Edit resume function
    window.editResume = function(resumeId) {
        showAlert('Loading resume for editing...', 'info');
        
        fetch(`/api/resume/${resumeId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    populateFormWithResumeData(data.data);
                    scrollToForm();
                    showAlert('Resume loaded successfully. You can now edit and save changes.', 'success');
                } else {
                    showAlert('Error loading resume: ' + data.message, 'danger');
                }
            })
            .catch(error => {
                console.error('Error loading resume:', error);
                showAlert('Error loading resume. Please try again.', 'danger');
            });
    };

    // Delete resume function
    window.deleteResume = function(resumeId, resumeName) {
        if (confirm(`Are you sure you want to delete the resume "${resumeName}"? This action cannot be undone.`)) {
            // Call the DELETE endpoint
            fetch(`/api/resume/${resumeId}`, { 
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('Resume deleted successfully!', 'success');
                    loadSavedResumes(); // Refresh the list
                } else {
                    showAlert('Error deleting resume: ' + data.message, 'danger');
                }
            })
            .catch(error => {
                console.error('Error deleting resume:', error);
                showAlert('Error deleting resume. Please try again.', 'danger');
            });
        }
    };

    // Populate form with existing resume data
    function populateFormWithResumeData(resumeData) {
        // Clear current form
        form.reset();
        skillsArray = [];
        
        // Populate basic fields
        if (resumeData.name) document.getElementById('fullName').value = resumeData.name;
        if (resumeData.email) document.getElementById('email').value = resumeData.email;
        if (resumeData.phone) document.getElementById('phone').value = resumeData.phone;
        if (resumeData.address) document.getElementById('address').value = resumeData.address;
        if (resumeData.roleAppliedFor) document.getElementById('roleAppliedFor').value = resumeData.roleAppliedFor;
        if (resumeData.objective) document.getElementById('careerObjective').value = resumeData.objective;
        
        // Populate social links
        if (resumeData.socialLinks) {
            if (resumeData.socialLinks.linkedin) document.getElementById('linkedin').value = resumeData.socialLinks.linkedin;
            if (resumeData.socialLinks.github) document.getElementById('github').value = resumeData.socialLinks.github;
            if (resumeData.socialLinks.portfolio) document.getElementById('portfolio').value = resumeData.socialLinks.portfolio;
        }
        
        // Populate skills
        if (resumeData.skills && Array.isArray(resumeData.skills)) {
            skillsArray = [...resumeData.skills];
            renderSkills();
        }
        
        // Populate education
        if (resumeData.education && Array.isArray(resumeData.education)) {
            populateEducationSection(resumeData.education);
        }
        
        // Populate experience
        if (resumeData.experience && Array.isArray(resumeData.experience)) {
            populateExperienceSection(resumeData.experience);
        }
        
        // Populate projects
        if (resumeData.projects && Array.isArray(resumeData.projects)) {
            populateProjectsSection(resumeData.projects);
        }
        
        // Populate certifications
        if (resumeData.certifications && Array.isArray(resumeData.certifications)) {
            populateCertificationsSection(resumeData.certifications);
        }
        
        // Save current resume ID for updates
        form.dataset.editingId = resumeData._id;
    }

    function populateEducationSection(educationData) {
        const container = document.getElementById('educationContainer');
        container.innerHTML = '';
        
        educationData.forEach((edu, index) => {
            const entryHTML = `
                <div class="education-entry border p-3 mb-3 rounded">
                    ${index > 0 ? '<button type="button" class="remove-entry" onclick="removeEntry(this)"><i class="fas fa-times"></i></button>' : ''}
                    <div class="row">
                        <div class="col-md-4">
                            <label class="form-label">Degree <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" name="education[${index}][degree]" value="${edu.degree || ''}" required>
                            <div class="invalid-feedback">Please provide your degree.</div>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">College/University <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" name="education[${index}][college]" value="${edu.college || ''}" required>
                            <div class="invalid-feedback">Please provide your college/university.</div>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Year <span class="text-danger">*</span></label>
                            <input type="number" class="form-control" name="education[${index}][year]" value="${edu.year || ''}" min="1950" max="2030" required>
                            <div class="invalid-feedback">Please provide a valid year.</div>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', entryHTML);
        });
        
        educationCount = educationData.length;
    }

    function populateExperienceSection(experienceData) {
        const container = document.getElementById('experienceContainer');
        container.innerHTML = '';
        
        experienceData.forEach((exp, index) => {
            const entryHTML = `
                <div class="experience-entry border p-3 mb-3 rounded">
                    ${index > 0 ? '<button type="button" class="remove-entry" onclick="removeEntry(this)"><i class="fas fa-times"></i></button>' : ''}
                    <div class="row">
                        <div class="col-md-6">
                            <label class="form-label">Company <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" name="experience[${index}][company]" value="${exp.company || ''}" required>
                            <div class="invalid-feedback">Please provide the company name.</div>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Role <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" name="experience[${index}][role]" value="${exp.role || ''}" required>
                            <div class="invalid-feedback">Please provide your role.</div>
                        </div>
                    </div>
                    <div class="row mt-3">
                        <div class="col-md-6">
                            <label class="form-label">Duration <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" name="experience[${index}][duration]" value="${exp.duration || ''}" placeholder="e.g., Jan 2020 - Present" required>
                            <div class="invalid-feedback">Please provide the duration.</div>
                        </div>
                    </div>
                    <div class="row mt-3">
                        <div class="col-12">
                            <label class="form-label">Description <span class="text-danger">*</span></label>
                            <textarea class="form-control" name="experience[${index}][description]" rows="3" required>${exp.description || ''}</textarea>
                            <div class="invalid-feedback">Please provide a description.</div>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', entryHTML);
        });
        
        experienceCount = experienceData.length;
    }

    function populateProjectsSection(projectsData) {
        const container = document.getElementById('projectsContainer');
        container.innerHTML = '';
        
        projectsData.forEach((proj, index) => {
            const entryHTML = `
                <div class="project-entry border p-3 mb-3 rounded">
                    ${index > 0 ? '<button type="button" class="remove-entry" onclick="removeEntry(this)"><i class="fas fa-times"></i></button>' : ''}
                    <div class="row">
                        <div class="col-md-6">
                            <label class="form-label">Project Title</label>
                            <input type="text" class="form-control" name="projects[${index}][title]" value="${proj.title || ''}">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Tech Stack</label>
                            <input type="text" class="form-control" name="projects[${index}][techStack]" value="${proj.techStack || ''}" placeholder="e.g., React, Node.js, MongoDB">
                        </div>
                    </div>
                    <div class="row mt-3">
                        <div class="col-md-8">
                            <label class="form-label">Description</label>
                            <textarea class="form-control" name="projects[${index}][description]" rows="3">${proj.description || ''}</textarea>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">GitHub Link</label>
                            <input type="url" class="form-control" name="projects[${index}][githubLink]" value="${proj.githubLink || ''}" placeholder="https://github.com/...">
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', entryHTML);
        });
        
        projectCount = projectsData.length;
    }

    function populateCertificationsSection(certificationsData) {
        const container = document.getElementById('certificationsContainer');
        container.innerHTML = '';
        
        certificationsData.forEach((cert, index) => {
            const entryHTML = `
                <div class="certification-entry border p-3 mb-3 rounded">
                    ${index > 0 ? '<button type="button" class="remove-entry" onclick="removeEntry(this)"><i class="fas fa-times"></i></button>' : ''}
                    <div class="row">
                        <div class="col-md-4">
                            <label class="form-label">Certification Name</label>
                            <input type="text" class="form-control" name="certifications[${index}][name]" value="${cert.name || ''}">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Issuing Organization</label>
                            <input type="text" class="form-control" name="certifications[${index}][issuer]" value="${cert.issuer || ''}">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Date</label>
                            <input type="text" class="form-control" name="certifications[${index}][date]" value="${cert.date || ''}" placeholder="e.g., 2023-06">
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', entryHTML);
        });
        
        certificationCount = certificationsData.length;
    }

    // Scroll to form function
    function scrollToForm() {
        document.getElementById('resumeForm').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    // Load saved resumes on page load
    loadSavedResumes();
});
