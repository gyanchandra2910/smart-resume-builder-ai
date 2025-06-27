// Resume Form JavaScript
document.addEventListener('DOMContentLoaded', function() {
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

            // Process form data
            for (let [key, value] of formData.entries()) {
                resumeData[key] = value;
            }

            // Add skills array
            resumeData.skills = skillsArray;

            // Simulate API call (replace with actual API endpoint)
            setTimeout(() => {
                console.log('Resume Data:', resumeData);
                alert('Resume data collected successfully! Check console for details.');
                
                // Reset loading state
                submitBtn.classList.remove('loading');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 2000);

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
});
