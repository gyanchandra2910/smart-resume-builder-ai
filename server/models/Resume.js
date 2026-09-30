const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Personal Information
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    
    // Social Links
    socialLinks: {
        linkedin: {
            type: String,
            trim: true
        },
        github: {
            type: String,
            trim: true
        },
        portfolio: {
            type: String,
            trim: true
        }
    },
    
    // Role and Skills
    roleAppliedFor: {
        type: String,
        required: true,
        trim: true
    },
    skills: [{
        type: String,
        trim: true
    }],
    objective: {
        type: String,
        trim: true
    },
    
    // Education
    education: [{
        degree: {
            type: String,
            required: true,
            trim: true
        },
        college: {
            type: String,
            required: true,
            trim: true
        },
        year: {
            type: String,
            required: true,
            trim: true
        },
        score: {
            type: String,
            trim: true
        }
    }],
    
    // Experience
    experience: [{
        company: {
            type: String,
            required: true,
            trim: true
        },
        role: {
            type: String,
            required: true,
            trim: true
        },
        duration: {
            type: String,
            required: true,
            trim: true
        },
        location: {
            type: String,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        }
    }],
    
    // Certifications
    certifications: [{
        name: {
            type: String,
            trim: true
        },
        issuer: {
            type: String,
            trim: true
        },
        date: {
            type: String,
            trim: true
        }
    }],
    
    // Projects
    projects: [{
        title: {
            type: String,
            trim: true
        },
        techStack: {
            type: String,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        githubLink: {
            type: String,
            trim: true
        },
        duration: {
            type: String,
            trim: true
        }
    }],

    // Accomplishments and activities
    achievements: [{
        title: {
            type: String,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        date: {
            type: String,
            trim: true
        }
    }],
    activities: [{
        description: {
            type: String,
            trim: true
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Resume', resumeSchema);
