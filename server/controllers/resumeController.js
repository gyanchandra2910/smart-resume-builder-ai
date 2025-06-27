const Resume = require('../models/Resume');

// Create new resume
const createResume = async (req, res) => {
    try {
        console.log('Received resume data:', JSON.stringify(req.body, null, 2));
        
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
            projects
        } = req.body;

        // Process education data
        const educationData = [];
        if (education) {
            Object.keys(education).forEach(key => {
                if (education[key].degree && education[key].college && education[key].year) {
                    educationData.push({
                        degree: education[key].degree,
                        college: education[key].college,
                        year: parseInt(education[key].year)
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
                if (projects[key].title || projects[key].techStack || projects[key].description || projects[key].githubLink) {
                    projectsData.push({
                        title: projects[key].title || '',
                        techStack: projects[key].techStack || '',
                        description: projects[key].description || '',
                        githubLink: projects[key].githubLink || ''
                    });
                }
            });
        }

        // Create resume object
        const resumeData = {
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
            objective: careerObjective,
            education: educationData,
            experience: experienceData,
            certifications: certificationsData,
            projects: projectsData
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
        const resume = await Resume.findById(id);

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
        const resumes = await Resume.find().select('name email roleAppliedFor createdAt').sort({ createdAt: -1 });

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

module.exports = {
    createResume,
    getResume,
    getAllResumes
};
