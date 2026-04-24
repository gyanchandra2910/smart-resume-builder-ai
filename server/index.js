const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resume');
const aiRoutes = require('./routes/ai');
const atsRoutes = require('./routes/ats');
const reviewRoutes = require('./routes/review');
const interviewRoutes = require('./routes/interview');

// Import Resume model for public view
const Resume = require('./models/Resume');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public Resume View Route (clean URL for sharing) - Must be before static middleware
app.get('/resume/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Invalid Resume Link - Smart Resume Builder AI</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                </head>
                <body>
                    <div class="container mt-5">
                        <div class="text-center">
                            <h1 class="text-warning">Invalid Resume Link</h1>
                            <p class="text-muted">The resume link you're trying to access is invalid.</p>
                            <a href="/" class="btn btn-primary">Back to Home</a>
                        </div>
                    </div>
                </body>
                </html>
            `);
        }
        
        // Use the getPublicResume controller function
        const { getPublicResume } = require('./controllers/resumeController');
        await getPublicResume(req, res);
        
    } catch (error) {
        console.error('Error in public resume route:', error);
        res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Error - Smart Resume Builder AI</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <div class="container mt-5">
                    <div class="text-center">
                        <h1 class="text-danger">Error Loading Resume</h1>
                        <p class="text-muted">There was an error loading this resume. Please try again later.</p>
                        <a href="/" class="btn btn-primary">Back to Home</a>
                    </div>
                </div>
            </body>
            </html>
        `);
    }
});

// API Routes (must be before static serving)
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/resume', aiRoutes);
app.use('/api/resume', atsRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/interview', interviewRoutes);

// Serve React production build (client/dist) — only in production
// In development, the Vite dev server on port 5173 handles the frontend
const clientDistPath = path.join(__dirname, '../client/dist');
const fs = require('fs');
if (process.env.NODE_ENV === 'production' && fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    // Express 5 compatible SPA fallback
    app.use((req, res, next) => {
        if (!req.path.startsWith('/api') && !req.path.startsWith('/resume')) {
            res.sendFile(path.join(clientDistPath, 'index.html'));
        } else {
            next();
        }
    });
} else {
    app.get('/', (req, res) => {
        res.json({
            message: 'Smart Resume Builder AI — API Server is running on port 5000.',
            frontend: 'Start the Vite dev server: cd client && npm run dev',
            endpoints: {
                auth: '/api/auth/signup | /api/auth/login',
                resume: '/api/resume/input | /api/resume/:id',
                ai: '/api/resume/generateSummary | /api/resume/generateCoverLetter',
                ats: '/api/resume/ats-check',
                interview: '/api/interview/questions'
            }
        });
    });
}


// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
