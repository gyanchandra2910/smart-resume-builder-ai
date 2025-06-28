// Resume Form JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAuthentication();
    
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
                    alert('Resume saved successfully! Resume ID: ' + data.data.id);
                    console.log('Resume saved:', data);
                    // Optionally redirect or reset form
                    // form.reset();
                    // skillsArray = [];
                    // renderSkills();
                } else {
                    alert('Error saving resume: ' + data.message);
                    console.error('Error:', data);
                }
            })
            .catch(error => {
                console.error('Network error:', error);
                alert('Network error occurred. Please try again.');
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

    // Alert function for user feedback
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
});
