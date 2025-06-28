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

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/resume', aiRoutes);
app.use('/api/resume', atsRoutes);
app.use('/api/review', reviewRoutes);

// Serve specific HTML files
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/login.html'));
});

app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/register.html'));
});

app.get('/resume-builder.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/resume-builder.html'));
});

app.get('/preview.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/preview.html'));
});

app.get('/ats-check.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/ats-check.html'));
});

app.get('/review.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/review.html'));
});

app.get('/test-review-ui.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../test-review-ui.html'));
});

// Serve frontend for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
