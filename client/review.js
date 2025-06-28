// Review system JavaScript
class ReviewSystem {
    constructor() {
        this.currentResumeId = null;
        this.currentRating = 0;
        this.reviewerStats = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadReviewerStats();
        this.checkForResumeInURL();
    }

    setupEventListeners() {
        // Recruiter mode toggle
        const recruiterToggle = document.getElementById('recruiterModeToggle');
        recruiterToggle.addEventListener('change', (e) => {
            this.toggleRecruiterMode(e.target.checked);
        });

        // Star rating system
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => {
            star.addEventListener('click', (e) => {
                this.setRating(parseInt(e.target.dataset.rating));
            });
            
            star.addEventListener('mouseenter', (e) => {
                this.highlightStars(parseInt(e.target.dataset.rating));
            });
        });

        // Reset star highlighting on mouse leave
        document.getElementById('starRating').addEventListener('mouseleave', () => {
            this.highlightStars(this.currentRating);
        });

        // Review form submission
        document.getElementById('reviewForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitReview();
        });

        // Feedback character counter
        const feedbackTextarea = document.getElementById('feedback');
        feedbackTextarea.addEventListener('input', () => {
            this.updateCharacterCount();
        });
    }

    toggleRecruiterMode(enabled) {
        const reviewPanel = document.getElementById('reviewPanel');
        const reviewsSection = document.getElementById('reviewsSection');
        const resumeListSection = document.getElementById('resumeListSection');
        
        if (enabled) {
            reviewPanel.style.display = 'block';
            reviewsSection.style.display = 'block';
            resumeListSection.style.display = 'block';
            this.loadReviewerStats();
            this.loadAllResumes(); // Load all available resumes
            if (this.currentResumeId) {
                this.loadResumeReviews(this.currentResumeId);
            }
            this.showAlert('Recruiter mode activated! Select a resume from the list to review.', 'info');
        } else {
            reviewPanel.style.display = 'none';
            reviewsSection.style.display = 'none';
            resumeListSection.style.display = 'none';
            this.showAlert('Recruiter mode deactivated.', 'secondary');
        }
    }

    async loadReviewerStats() {
        try {
            // Using temporary reviewer ID for demo
            const reviewerId = document.getElementById('reviewerId').value;
            
            const response = await fetch(`/api/review/reviewer/${reviewerId}/stats`);
            const result = await response.json();
            
            if (result.success) {
                this.reviewerStats = result.data;
                this.updateReviewerDisplay();
            }
        } catch (error) {
            console.error('Error loading reviewer stats:', error);
        }
    }

    updateReviewerDisplay() {
        if (!this.reviewerStats) return;

        document.getElementById('userXP').textContent = this.reviewerStats.totalXP;
        document.getElementById('userLevel').textContent = this.reviewerStats.level;
        document.getElementById('userReviews').textContent = this.reviewerStats.totalReviews;

        // Display badges
        const badgesContainer = document.getElementById('userBadges');
        badgesContainer.innerHTML = this.reviewerStats.badges
            .map(badge => `<span class="badge-achievement">${badge.name}</span>`)
            .join('');
    }

    checkForResumeInURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const resumeId = urlParams.get('resumeId');
        
        if (resumeId) {
            this.currentResumeId = resumeId;
            document.getElementById('resumeId').value = resumeId;
            this.loadResumeForReview(resumeId);
        } else {
            this.loadDemoResume();
        }
    }

    async loadResumeForReview(resumeId) {
        try {
            const response = await fetch(`/api/resume/${resumeId}`);
            const result = await response.json();
            
            if (result.success) {
                this.displayResume(result.data);
                
                // Check if recruiter mode is enabled
                if (document.getElementById('recruiterModeToggle').checked) {
                    this.loadResumeReviews(resumeId);
                }
            } else {
                this.showAlert('Resume not found. Loading demo resume instead.', 'warning');
                this.loadDemoResume();
            }
        } catch (error) {
            console.error('Error loading resume:', error);
            this.showAlert('Error loading resume. Loading demo resume instead.', 'warning');
            this.loadDemoResume();
        }
    }

    loadDemoResume() {
        const demoData = {
            _id: '67759a1b2c3d4e5f6789abc0',
            name: "Sarah Johnson",
            email: "sarah.johnson@email.com",
            phone: "+1-555-0199",
            address: "456 Career Ave, Success City, SC 12345",
            socialLinks: {
                linkedin: "https://linkedin.com/in/sarahjohnson",
                github: "https://github.com/sarahjohnson",
                portfolio: "https://sarahjohnson.dev"
            },
            roleAppliedFor: "Senior Frontend Developer",
            skills: [
                "React", "Vue.js", "TypeScript", "JavaScript", 
                "HTML5", "CSS3", "SASS", "Node.js", "MongoDB", 
                "GraphQL", "REST APIs", "Git", "Docker"
            ],
            objective: "Experienced frontend developer with 5+ years of expertise in building scalable web applications using modern JavaScript frameworks. Passionate about creating intuitive user experiences and leading development teams.",
            education: [
                {
                    degree: "Bachelor of Science in Computer Science",
                    college: "Tech University",
                    year: "2019"
                }
            ],
            experience: [
                {
                    company: "Innovation Labs Inc.",
                    role: "Senior Frontend Developer",
                    duration: "2022 - Present",
                    description: "Lead a team of 4 developers in building responsive web applications. Implemented modern React patterns resulting in 40% performance improvement. Mentored junior developers and established coding standards."
                },
                {
                    company: "Digital Solutions Co.",
                    role: "Frontend Developer",
                    duration: "2020 - 2022",
                    description: "Developed and maintained 10+ client websites using React and Vue.js. Collaborated with UX/UI team to implement pixel-perfect designs. Reduced page load times by 50% through optimization techniques."
                }
            ],
            projects: [
                {
                    title: "E-commerce Dashboard",
                    techStack: "React, TypeScript, Chart.js, Material-UI",
                    description: "Built a comprehensive admin dashboard for e-commerce platform with real-time analytics, inventory management, and sales tracking.",
                    githubLink: "https://github.com/sarahjohnson/ecommerce-dashboard"
                }
            ],
            certifications: [
                {
                    name: "AWS Certified Solutions Architect",
                    issuer: "Amazon Web Services",
                    date: "2023"
                }
            ]
        };

        this.currentResumeId = '67759a1b2c3d4e5f6789abc0';
        document.getElementById('resumeId').value = 'demo-resume-id';
        this.displayResume(demoData);
    }

    displayResume(resumeData) {
        const previewContainer = document.getElementById('resumePreview');
        
        previewContainer.innerHTML = `
            <div class="resume-content">
                <!-- Header -->
                <div class="text-center mb-4 pb-3 border-bottom">
                    <h1 class="h2 text-primary fw-bold">${resumeData.name}</h1>
                    <h2 class="h5 text-muted mb-3">${resumeData.roleAppliedFor}</h2>
                    <div class="contact-info">
                        <span class="me-3"><i class="fas fa-envelope text-primary"></i> ${resumeData.email}</span>
                        <span class="me-3"><i class="fas fa-phone text-primary"></i> ${resumeData.phone}</span>
                        <span><i class="fas fa-map-marker-alt text-primary"></i> ${resumeData.address}</span>
                    </div>
                    ${resumeData.socialLinks ? `
                    <div class="social-links mt-2">
                        ${resumeData.socialLinks.linkedin ? `<a href="${resumeData.socialLinks.linkedin}" class="me-3"><i class="fab fa-linkedin text-primary"></i> LinkedIn</a>` : ''}
                        ${resumeData.socialLinks.github ? `<a href="${resumeData.socialLinks.github}" class="me-3"><i class="fab fa-github text-primary"></i> GitHub</a>` : ''}
                        ${resumeData.socialLinks.portfolio ? `<a href="${resumeData.socialLinks.portfolio}"><i class="fas fa-globe text-primary"></i> Portfolio</a>` : ''}
                    </div>
                    ` : ''}
                </div>

                <!-- Professional Summary -->
                ${resumeData.objective ? `
                <div class="mb-4">
                    <h3 class="h5 text-primary fw-bold mb-3 border-bottom pb-1">Professional Summary</h3>
                    <p class="text-muted">${resumeData.objective}</p>
                </div>
                ` : ''}

                <!-- Skills -->
                ${resumeData.skills && resumeData.skills.length > 0 ? `
                <div class="mb-4">
                    <h3 class="h5 text-primary fw-bold mb-3 border-bottom pb-1">Technical Skills</h3>
                    <div class="skills-container">
                        ${resumeData.skills.map(skill => `<span class="badge bg-primary me-1 mb-1">${skill}</span>`).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- Experience -->
                ${resumeData.experience && resumeData.experience.length > 0 ? `
                <div class="mb-4">
                    <h3 class="h5 text-primary fw-bold mb-3 border-bottom pb-1">Professional Experience</h3>
                    ${resumeData.experience.map(exp => `
                        <div class="mb-3">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 class="h6 fw-bold mb-1">${exp.role}</h4>
                                    <p class="text-primary mb-1">${exp.company}</p>
                                </div>
                                <span class="text-muted">${exp.duration}</span>
                            </div>
                            <p class="text-muted mb-0">${exp.description}</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                <!-- Education -->
                ${resumeData.education && resumeData.education.length > 0 ? `
                <div class="mb-4">
                    <h3 class="h5 text-primary fw-bold mb-3 border-bottom pb-1">Education</h3>
                    ${resumeData.education.map(edu => `
                        <div class="d-flex justify-content-between mb-2">
                            <div>
                                <h4 class="h6 fw-bold mb-1">${edu.degree}</h4>
                                <p class="text-primary mb-0">${edu.college}</p>
                            </div>
                            <span class="text-muted">${edu.year}</span>
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                <!-- Projects -->
                ${resumeData.projects && resumeData.projects.length > 0 ? `
                <div class="mb-4">
                    <h3 class="h5 text-primary fw-bold mb-3 border-bottom pb-1">Projects</h3>
                    ${resumeData.projects.map(proj => `
                        <div class="mb-3">
                            <div class="d-flex justify-content-between">
                                <h4 class="h6 fw-bold mb-1">${proj.title}</h4>
                                ${proj.githubLink ? `<a href="${proj.githubLink}" class="text-primary"><i class="fab fa-github"></i> View</a>` : ''}
                            </div>
                            ${proj.techStack ? `<p class="text-primary mb-1"><small><strong>Tech:</strong> ${proj.techStack}</small></p>` : ''}
                            <p class="text-muted mb-0">${proj.description}</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                <!-- Certifications -->
                ${resumeData.certifications && resumeData.certifications.length > 0 ? `
                <div class="mb-4">
                    <h3 class="h5 text-primary fw-bold mb-3 border-bottom pb-1">Certifications</h3>
                    ${resumeData.certifications.map(cert => `
                        <div class="d-flex justify-content-between mb-2">
                            <div>
                                <h4 class="h6 fw-bold mb-1">${cert.name}</h4>
                                <p class="text-primary mb-0">${cert.issuer}</p>
                            </div>
                            <span class="text-muted">${cert.date}</span>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>
        `;
    }

    setRating(rating) {
        this.currentRating = rating;
        document.getElementById('selectedRating').value = rating;
        this.highlightStars(rating);
    }

    highlightStars(rating) {
        const stars = document.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    updateCharacterCount() {
        const textarea = document.getElementById('feedback');
        const current = textarea.value.length;
        const max = 2000;
        const min = 10;
        
        // You can add a character counter display here if needed
        if (current < min) {
            textarea.setCustomValidity(`Please enter at least ${min} characters.`);
        } else if (current > max) {
            textarea.setCustomValidity(`Please enter no more than ${max} characters.`);
        } else {
            textarea.setCustomValidity('');
        }
    }

    async submitReview() {
        const rating = parseInt(document.getElementById('selectedRating').value);
        const feedback = document.getElementById('feedback').value.trim();
        const resumeId = document.getElementById('resumeId').value;
        const reviewerId = document.getElementById('reviewerId').value;

        // Validation
        if (rating === 0) {
            this.showAlert('Please select a rating (1-5 stars).', 'warning');
            return;
        }

        if (feedback.length < 10) {
            this.showAlert('Please provide feedback with at least 10 characters.', 'warning');
            return;
        }

        if (!resumeId) {
            this.showAlert('No resume selected for review.', 'warning');
            return;
        }

        // Collect selected flags
        const flags = [];
        document.querySelectorAll('.flag-checkbox input:checked').forEach(checkbox => {
            flags.push(checkbox.value);
        });

        // For demo purposes, we'll use a different user ID for the resume owner
        // In a real app, this would come from the resume data
        const reviewedUserId = resumeId === '67759a1b2c3d4e5f6789abc0' ? '67759a1b2c3d4e5f6789abce' : '67759a1b2c3d4e5f6789abcf';

        // Prepare review data
        const reviewData = {
            reviewerId,
            reviewedUserId,
            resumeId,
            score: rating,
            feedback,
            flags
        };

        console.log('Submitting review data:', reviewData);

        // Show loading state
        const submitBtn = document.getElementById('submitReviewBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Submitting...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/review/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reviewData)
            });

            const result = await response.json();
            console.log('Review submission result:', result);

            if (result.success) {
                this.showSuccessModal(result.data);
                this.resetReviewForm();
                this.loadReviewerStats(); // Refresh stats
                this.loadResumeReviews(resumeId); // Refresh reviews
            } else {
                this.showAlert(`Error submitting review: ${result.message}`, 'danger');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            this.showAlert('Error submitting review. Please try again.', 'danger');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    showSuccessModal(data) {
        const modalBody = document.getElementById('successModalBody');
        
        let content = `
            <div class="text-center">
                <h5>Review submitted successfully!</h5>
                <p class="text-success">+${data.xpGained} XP earned</p>
        `;

        if (data.levelUp) {
            content += `
                <div class="alert alert-warning">
                    <i class="fas fa-trophy me-2"></i>
                    <strong>Level Up!</strong> You reached Level ${data.newLevel}
                </div>
            `;
        }

        if (data.newBadges && data.newBadges.length > 0) {
            content += `
                <div class="alert alert-info">
                    <i class="fas fa-medal me-2"></i>
                    <strong>New Badge${data.newBadges.length > 1 ? 's' : ''}!</strong><br>
                    ${data.newBadges.map(badge => badge.name).join(', ')}
                </div>
            `;
        }

        content += `
            </div>
        `;

        modalBody.innerHTML = content;
        
        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        modal.show();
    }

    resetReviewForm() {
        document.getElementById('reviewForm').reset();
        this.setRating(0);
        document.querySelectorAll('.flag-checkbox input').forEach(checkbox => {
            checkbox.checked = false;
        });
    }

    async loadResumeReviews(resumeId) {
        try {
            const response = await fetch(`/api/review/resume/${resumeId}`);
            const result = await response.json();

            if (result.success) {
                this.displayReviews(result.data);
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
        }
    }

    displayReviews(data) {
        const reviewsList = document.getElementById('reviewsList');
        const { reviews, stats } = data;

        if (reviews.length === 0) {
            reviewsList.innerHTML = '<p class="text-muted">No reviews yet. Be the first to review this resume!</p>';
            return;
        }

        let content = `
            <div class="row mb-4">
                <div class="col-md-4 text-center">
                    <h4 class="text-primary">${stats.averageScore}/5</h4>
                    <small class="text-muted">Average Rating</small>
                </div>
                <div class="col-md-4 text-center">
                    <h4 class="text-info">${stats.totalReviews}</h4>
                    <small class="text-muted">Total Reviews</small>
                </div>
                <div class="col-md-4 text-center">
                    <h4 class="text-warning">${Object.keys(stats.flagFrequency).length}</h4>
                    <small class="text-muted">Issues Identified</small>
                </div>
            </div>
        `;

        content += reviews.map(review => `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <strong>${review.reviewerId ? review.reviewerId.name : 'Anonymous Reviewer'}</strong>
                            <div class="star-display">
                                ${Array.from({length: 5}, (_, i) => 
                                    `<i class="fas fa-star ${i < review.score ? 'text-warning' : 'text-muted'}"></i>`
                                ).join('')}
                            </div>
                        </div>
                        <small class="text-muted">${new Date(review.createdAt).toLocaleDateString()}</small>
                    </div>
                    <p class="mb-2">${review.feedback}</p>
                    ${review.flags.length > 0 ? `
                        <div class="mb-0">
                            <small class="text-muted">Issues flagged: </small>
                            ${review.flags.map(flag => `<span class="badge bg-light text-dark me-1">${flag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');

        reviewsList.innerHTML = content;
    }

    showAlert(message, type = 'info') {
        // Remove existing alerts
        const existingAlert = document.querySelector('.temp-alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show temp-alert`;
        alertDiv.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
        `;
        
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);

        setTimeout(() => {
            if (alertDiv && alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    async showLeaderboard() {
        try {
            const response = await fetch('/api/review/leaderboard?limit=10');
            const result = await response.json();

            if (result.success) {
                this.displayLeaderboard(result.data);
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            this.showAlert('Error loading leaderboard.', 'danger');
        }
    }

    displayLeaderboard(leaderboard) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-warning text-dark">
                        <h5 class="modal-title">
                            <i class="fas fa-trophy me-2"></i>Top Reviewers Leaderboard
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${leaderboard.length === 0 ? '<p class="text-muted">No reviewers yet.</p>' : `
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Rank</th>
                                            <th>Reviewer</th>
                                            <th>Level</th>
                                            <th>XP</th>
                                            <th>Reviews</th>
                                            <th>Badges</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${leaderboard.map((reviewer, index) => `
                                            <tr>
                                                <td>
                                                    <span class="badge bg-${index === 0 ? 'warning' : index === 1 ? 'secondary' : index === 2 ? 'dark' : 'light text-dark'}">#${index + 1}</span>
                                                </td>
                                                <td>${reviewer.reviewerId ? reviewer.reviewerId.name : 'Anonymous'}</td>
                                                <td><span class="level-badge">${reviewer.level}</span></td>
                                                <td><span class="xp-badge">${reviewer.totalXP}</span></td>
                                                <td>${reviewer.totalReviews}</td>
                                                <td>${reviewer.badges.length}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();

        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    async showMyReviews() {
        const reviewerId = document.getElementById('reviewerId').value;
        
        try {
            const response = await fetch(`/api/review/reviewer/${reviewerId}/reviews`);
            const result = await response.json();

            if (result.success) {
                this.displayMyReviews(result.data);
            }
        } catch (error) {
            console.error('Error loading my reviews:', error);
            this.showAlert('Error loading your reviews.', 'danger');
        }
    }

    displayMyReviews(data) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header bg-info text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-history me-2"></i>My Reviews (${data.pagination.totalReviews})
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${data.reviews.length === 0 ? '<p class="text-muted">You haven\'t submitted any reviews yet.</p>' : `
                            ${data.reviews.map(review => `
                                <div class="card mb-3">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between mb-2">
                                            <div>
                                                <h6>${review.resumeId ? review.resumeId.name : 'Unknown'} - ${review.resumeId ? review.resumeId.roleAppliedFor : 'Unknown Role'}</h6>
                                                <div class="star-display">
                                                    ${Array.from({length: 5}, (_, i) => 
                                                        `<i class="fas fa-star ${i < review.score ? 'text-warning' : 'text-muted'}"></i>`
                                                    ).join('')}
                                                </div>
                                            </div>
                                            <small class="text-muted">${new Date(review.createdAt).toLocaleDateString()}</small>
                                        </div>
                                        <p class="mb-2">${review.feedback}</p>
                                        ${review.flags.length > 0 ? `
                                            <div>
                                                <small class="text-muted">Flags: </small>
                                                ${review.flags.map(flag => `<span class="badge bg-light text-dark me-1">${flag}</span>`).join('')}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        `}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();

        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    async loadAllResumes() {
        try {
            const response = await fetch('/api/resume');
            const result = await response.json();
            
            if (result.success && result.data) {
                this.displayResumesList(result.data);
            } else {
                console.error('Failed to load resumes:', result.message);
                this.showAlert('Failed to load resumes. Please try again.', 'warning');
            }
        } catch (error) {
            console.error('Error loading resumes:', error);
            this.showAlert('Error loading resumes. Please check your connection.', 'warning');
        }
    }

    displayResumesList(resumes) {
        const container = document.getElementById('resumesList');
        
        if (!resumes || resumes.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-file-alt fa-3x text-muted mb-3"></i>
                    <p class="text-muted">No resumes available for review.</p>
                    <button class="btn btn-primary" onclick="reviewSystem.loadDemoResume()">
                        <i class="fas fa-eye me-1"></i>Load Demo Resume
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = resumes.map(resume => `
            <div class="card mb-3 resume-card" data-resume-id="${resume._id}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h6 class="card-title mb-1">
                                <i class="fas fa-user me-2"></i>${resume.name || resume.fullName || 'Unnamed Resume'}
                            </h6>
                            <p class="card-text text-muted small mb-2">
                                <i class="fas fa-envelope me-1"></i>${resume.email || 'No email'}<br>
                                <i class="fas fa-briefcase me-1"></i>${resume.roleAppliedFor || 'No role specified'}
                            </p>
                            <p class="card-text small">
                                <i class="fas fa-calendar me-1"></i>Created: ${new Date(resume.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div class="ms-3">
                            <button class="btn btn-primary btn-sm" onclick="reviewSystem.selectResumeForReview('${resume._id}', '${(resume.name || resume.fullName || 'Unnamed Resume').replace(/'/g, '\\\'')}')" 
                                    data-resume-id="${resume._id}">
                                <i class="fas fa-eye me-1"></i>Review
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    selectResumeForReview(resumeId, resumeName) {
        this.currentResumeId = resumeId;
        document.getElementById('resumeId').value = resumeId;
        document.getElementById('selectedResumeName').textContent = resumeName;
        document.getElementById('selectedResumeInfo').style.display = 'block';
        
        // Load the resume for preview
        this.loadResumeForReview(resumeId);
        
        // Load existing reviews for this resume
        this.loadResumeReviews(resumeId);
        
        // Scroll to the review form
        document.getElementById('reviewPanel').scrollIntoView({ behavior: 'smooth' });
        
        this.showAlert(`Selected "${resumeName}" for review. Fill out the form below.`, 'success');
    }
}

// Global functions for button clicks
function loadDemoResume() {
    reviewSystem.loadDemoResume();
    reviewSystem.showAlert('Demo resume loaded for review!', 'success');
}

function showLeaderboard() {
    reviewSystem.showLeaderboard();
}

function showMyReviews() {
    reviewSystem.showMyReviews();
}

// Initialize the review system when page loads
let reviewSystem;
document.addEventListener('DOMContentLoaded', function() {
    reviewSystem = new ReviewSystem();
});
