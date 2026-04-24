const OpenAI = require('openai');
const Resume = require('../models/Resume');
const mongoose = require('mongoose');

// Initialize OpenAI lazily (only when API key exists)
const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Format resume doc/object into plain text ──────────────────────────────────
const formatResumeToPlainText = (r) => {
    let text = '';
    const name = r.fullName || r.name || '';
    if (name) text += `${name}\n`;
    if (r.email) text += `Email: ${r.email}\n`;
    if (r.phone) text += `Phone: ${r.phone}\n`;
    if (r.address) text += `Address: ${r.address}\n`;
    if (r.roleAppliedFor) text += `Target Role: ${r.roleAppliedFor}\n`;
    text += '\n';

    const obj = r.careerObjective || r.objective;
    if (obj) text += `PROFESSIONAL OBJECTIVE\n${obj}\n\n`;

    const skills = r.skills;
    if (skills && skills.length > 0) {
        text += `TECHNICAL SKILLS\n${Array.isArray(skills) ? skills.join(', ') : skills}\n\n`;
    }

    const expArray = Array.isArray(r.experience)
        ? r.experience
        : r.experience ? Object.values(r.experience).filter(e => e.company && e.role) : [];
    if (expArray.length > 0) {
        text += 'PROFESSIONAL EXPERIENCE\n';
        expArray.forEach(e => {
            text += `${e.role} | ${e.company}\n`;
            if (e.duration) text += `${e.duration}\n`;
            if (e.description) text += `${e.description}\n`;
            text += '\n';
        });
    }

    const eduArray = Array.isArray(r.education)
        ? r.education
        : r.education ? Object.values(r.education).filter(e => e.degree && e.college) : [];
    if (eduArray.length > 0) {
        text += 'EDUCATION\n';
        eduArray.forEach(e => {
            text += `${e.degree} | ${e.college}`;
            if (e.year) text += ` | ${e.year}`;
            text += '\n';
        });
        text += '\n';
    }

    const projArray = Array.isArray(r.projects)
        ? r.projects
        : r.projects ? Object.values(r.projects).filter(p => p.title) : [];
    if (projArray.length > 0) {
        text += 'PROJECTS\n';
        projArray.forEach(p => {
            text += `${p.title}\n`;
            if (p.techStack) text += `Technologies: ${p.techStack}\n`;
            if (p.description) text += `${p.description}\n`;
            text += '\n';
        });
    }

    const certArray = Array.isArray(r.certifications)
        ? r.certifications
        : r.certifications ? Object.values(r.certifications).filter(c => c.name) : [];
    if (certArray.length > 0) {
        text += 'CERTIFICATIONS\n';
        certArray.forEach(c => {
            text += c.name;
            if (c.issuer) text += ` | ${c.issuer}`;
            if (c.date) text += ` | ${c.date}`;
            text += '\n';
        });
    }

    return text.trim();
};

// ── Main ATS check controller ─────────────────────────────────────────────────
const checkATSScore = async (req, res) => {
    try {
        const { resumeId, resumeText, jobDescription } = req.body;

        if (!jobDescription || !jobDescription.trim()) {
            return res.status(400).json({ success: false, message: 'Job description is required' });
        }

        // ── Resolve resume data ─────────────────────────────────────────────
        let resumeData = null;
        let plainText = '';

        if (resumeId) {
            // Validate ObjectId
            if (!mongoose.Types.ObjectId.isValid(resumeId)) {
                return res.status(400).json({ success: false, message: 'Invalid Resume ID format' });
            }
            const doc = await Resume.findById(resumeId);
            if (!doc) {
                return res.status(404).json({ success: false, message: 'Resume not found with this ID' });
            }
            resumeData = doc.toObject();
            plainText = formatResumeToPlainText(resumeData);
        } else if (resumeText && resumeText.trim().length > 30) {
            // Raw text mode
            plainText = resumeText.trim();
            resumeData = { roleAppliedFor: 'General Professional' };
        } else {
            return res.status(400).json({
                success: false,
                message: 'Provide either a resumeId or paste resume text (min 30 chars)'
            });
        }

        const targetRole = resumeData.roleAppliedFor || 'General Professional';

        // ── Build OpenAI prompt ─────────────────────────────────────────────
        const prompt = `You are an expert ATS (Applicant Tracking System) analyzer.

JOB DESCRIPTION:
${jobDescription}

RESUME:
${plainText}

Analyze how well this resume matches the job description. Return ONLY valid JSON with this exact structure:
{
  "score": <integer 0-100>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "missingKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "summary": "2-3 sentence overall assessment"
}`;

        // ── Call OpenAI ─────────────────────────────────────────────────────
        let atsResult;
        let usedAI = false;

        if (process.env.OPENAI_API_KEY) {
            try {
                const openai = getOpenAI();
                const completion = await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert ATS resume analyzer. Always respond with valid JSON only.'
                        },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 1200,
                    temperature: 0.3
                });

                const raw = completion.choices[0].message.content.trim();
                // Strip markdown code fences if present
                const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
                atsResult = JSON.parse(jsonStr);
                usedAI = true;
            } catch (aiErr) {
                console.error('OpenAI ATS error, using fallback:', aiErr.message);
            }
        }

        // ── Fallback: keyword-based scoring ────────────────────────────────
        if (!atsResult) {
            const jobWords = new Set(
                jobDescription.toLowerCase().match(/\b[a-z]{3,}\b/g) || []
            );
            const resumeWords = new Set(
                plainText.toLowerCase().match(/\b[a-z]{3,}\b/g) || []
            );
            const stopWords = new Set(['the', 'and', 'for', 'with', 'this', 'that', 'are', 'will', 'have', 'you', 'our', 'their', 'from', 'your', 'any']);

            const jobKeywords = [...jobWords].filter(w => !stopWords.has(w));
            const matched = jobKeywords.filter(w => resumeWords.has(w));
            const missing = jobKeywords.filter(w => !resumeWords.has(w)).slice(0, 8);

            const baseScore = Math.round((matched.length / Math.max(jobKeywords.length, 1)) * 100);
            const score = Math.max(25, Math.min(88, baseScore));

            atsResult = {
                score,
                strengths: [
                    resumeData.skills?.length > 0 ? `Lists ${resumeData.skills.length} technical skills` : 'Has skills section',
                    resumeData.experience?.length > 0 ? 'Has professional experience entries' : 'Has educational background',
                    resumeData.objective ? 'Includes professional objective' : 'Has contact information'
                ],
                improvements: [
                    'Add more job-specific keywords from the job description',
                    'Quantify achievements with numbers and metrics',
                    'Tailor your objective/summary to match the role'
                ],
                missingKeywords: missing.slice(0, 6),
                recommendations: [
                    `Mirror the job title "${targetRole}" in your resume header`,
                    'Use action verbs that match the job posting language',
                    'Ensure each experience bullet aligns with a required skill'
                ],
                summary: `Your resume matches approximately ${score}% of the job description keywords. ${score >= 60 ? 'You have a solid foundation — focus on adding missing keywords.' : 'Significant tailoring is needed to improve ATS compatibility.'}`
            };
        }

        // Sanitize score range
        atsResult.score = Math.max(0, Math.min(100, Math.round(atsResult.score)));

        return res.status(200).json({
            success: true,
            message: usedAI ? 'ATS analysis completed using AI' : 'ATS analysis completed (keyword-based)',
            data: {
                score: atsResult.score,
                strengths: atsResult.strengths || [],
                improvements: atsResult.improvements || [],
                missingKeywords: atsResult.missingKeywords || [],
                recommendations: atsResult.recommendations || [],
                summary: atsResult.summary || '',
                usedAI
            }
        });

    } catch (error) {
        console.error('ATS check error:', error);
        res.status(500).json({ success: false, message: 'Error performing ATS analysis', error: error.message });
    }
};

module.exports = { checkATSScore };
