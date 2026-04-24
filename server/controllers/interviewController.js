/**
 * Interview Questions Generator Controller
 * Accepts: { resumeId, jobTitle } — fetches resume from DB, generates tailored questions via OpenAI
 */

const Resume = require('../models/Resume');
const mongoose = require('mongoose');

// ── Format resume DB doc for the prompt ──────────────────────────────────────
const formatResumeForPrompt = (doc, jobTitle) => {
    const expArray = Array.isArray(doc.experience)
        ? doc.experience
        : doc.experience ? Object.values(doc.experience).filter(e => e.role && e.company) : [];

    const eduArray = Array.isArray(doc.education)
        ? doc.education
        : doc.education ? Object.values(doc.education).filter(e => e.degree && e.college) : [];

    const projArray = Array.isArray(doc.projects)
        ? doc.projects.filter(p => p.title)
        : doc.projects ? Object.values(doc.projects).filter(p => p.title) : [];

    const skillsText = Array.isArray(doc.skills)
        ? doc.skills.join(', ')
        : doc.skills || 'Not specified';

    const expText = expArray.length
        ? expArray.map(e => `${e.role} at ${e.company}${e.duration ? ` (${e.duration})` : ''}: ${e.description || ''}`).join('\n')
        : 'No work experience listed';

    const eduText = eduArray.length
        ? eduArray.map(e => `${e.degree} from ${e.college}${e.year ? ` (${e.year})` : ''}`).join('\n')
        : 'Not specified';

    const projText = projArray.length
        ? projArray.map(p => `${p.title}${p.techStack ? ` [${p.techStack}]` : ''}: ${p.description || ''}`).join('\n')
        : 'No projects listed';

    return {
        name: doc.name || 'Candidate',
        objective: doc.objective || '',
        skills: skillsText,
        experience: expText,
        education: eduText,
        projects: projText
    };
};

// ── Build OpenAI prompt ───────────────────────────────────────────────────────
const buildPrompt = (data, jobTitle) => {
    const role = jobTitle || 'General position';
    return `Generate exactly 10 tailored interview questions for a "${role}" candidate.

CANDIDATE PROFILE:
Name: ${data.name}
Target Role: ${role}
${data.objective ? `Career Objective: ${data.objective}` : ''}

WORK EXPERIENCE:
${data.experience}

EDUCATION:
${data.education}

SKILLS:
${data.skills}

PROJECTS:
${data.projects}

REQUIREMENTS:
- Mix of: 3 behavioral, 3 technical (based on their skills/projects), 2 situational, 2 role-specific
- Each question must be specific to this candidate's background, NOT generic
- Vary difficulty: Easy, Medium, Hard

Return ONLY valid JSON:
{
  "questions": [
    { "question": "...", "type": "behavioral|technical|situational", "difficulty": "Easy|Medium|Hard" },
    ...
  ]
}`;
};

// ── Fallback template questions ───────────────────────────────────────────────
const generateFallback = (data, jobTitle) => {
    const role = jobTitle || 'this position';
    const skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
    const primarySkill = skills[0] || 'your primary skill';

    return [
        { question: `Tell me about yourself and why you're interested in the ${role} position.`, type: 'behavioral', difficulty: 'Easy' },
        { question: `Walk me through a challenging project you worked on. What was your role and what was the outcome?`, type: 'behavioral', difficulty: 'Medium' },
        { question: `How have you used ${primarySkill} in a real project? Give a specific example.`, type: 'technical', difficulty: 'Medium' },
        { question: `Describe a time you had to learn a new technology quickly. How did you approach it?`, type: 'behavioral', difficulty: 'Medium' },
        { question: `If you discovered a critical bug in production just before a release, what would you do?`, type: 'situational', difficulty: 'Hard' },
        { question: `What's the most complex problem you've solved? Walk me through your thought process.`, type: 'technical', difficulty: 'Hard' },
        { question: `How do you handle disagreements with teammates about technical decisions?`, type: 'behavioral', difficulty: 'Medium' },
        { question: `Where do you see yourself in 3 years as a ${role}?`, type: 'situational', difficulty: 'Easy' },
        { question: `What excites you most about working in ${role} and what do you hope to contribute in the first 90 days?`, type: 'situational', difficulty: 'Easy' },
        { question: `How do you stay up to date with industry trends relevant to ${role}?`, type: 'behavioral', difficulty: 'Easy' }
    ];
};

// ── Main controller ───────────────────────────────────────────────────────────
const generateInterviewQuestions = async (req, res) => {
    try {
        const { resumeId, jobTitle } = req.body;

        // Validate
        if (!resumeId) {
            return res.status(400).json({ success: false, message: 'resumeId is required' });
        }
        if (!mongoose.Types.ObjectId.isValid(resumeId)) {
            return res.status(400).json({ success: false, message: 'Invalid Resume ID format' });
        }
        if (!jobTitle || !jobTitle.trim()) {
            return res.status(400).json({ success: false, message: 'jobTitle is required' });
        }

        // Fetch resume from DB
        const doc = await Resume.findById(resumeId);
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Resume not found. Build and save a resume first.' });
        }

        const formattedData = formatResumeForPrompt(doc, jobTitle);

        let questions = [];
        let isTemplate = false;

        // Try OpenAI
        if (process.env.OPENAI_API_KEY) {
            try {
                const { OpenAI } = require('openai');
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

                const completion = await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert HR professional. Generate personalized interview questions based on the candidate\'s actual resume. Always respond with valid JSON only.'
                        },
                        { role: 'user', content: buildPrompt(formattedData, jobTitle) }
                    ],
                    max_tokens: 1500,
                    temperature: 0.7
                });

                const raw = completion.choices[0].message.content.trim();
                const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
                const parsed = JSON.parse(jsonStr);

                if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
                    questions = parsed.questions;
                } else {
                    throw new Error('Invalid AI response format');
                }
            } catch (aiErr) {
                console.error('OpenAI interview error, using fallback:', aiErr.message);
                questions = generateFallback(formattedData, jobTitle);
                isTemplate = true;
            }
        } else {
            questions = generateFallback(formattedData, jobTitle);
            isTemplate = true;
        }

        res.json({
            success: true,
            message: isTemplate
                ? 'Interview questions generated using templates (AI not configured)'
                : 'Interview questions generated successfully using AI',
            data: {
                questions,
                jobTitle,
                candidateName: formattedData.name,
                questionCount: questions.length,
                isTemplate,
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Interview questions generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating interview questions',
            error: error.message
        });
    }
};

module.exports = { generateInterviewQuestions };
