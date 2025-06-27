const OpenAI = require('openai');

// Initialize OpenAI with API key from environment
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Generate AI-powered resume summary
const generateSummary = async (req, res) => {
    try {
        console.log('AI Summary request received:', req.body); // Debug log
        
        const { role, skills, objective } = req.body;

        // Validate required fields
        if (!role || !skills || !objective) {
            console.log('Validation failed:', { role, skills, objective }); // Debug log
            return res.status(400).json({
                success: false,
                message: 'Role, skills, and objective are required'
            });
        }

        // Convert skills array to string if it's an array
        const skillsText = Array.isArray(skills) ? skills.join(', ') : skills;

        // Create the prompt for GPT
        const prompt = `
You are a professional resume writer. Based on the following information, generate:

1. A professional summary (2-3 sentences)
2. Three powerful bullet points highlighting key strengths
3. An improved version of the career objective

Input Information:
- Role: ${role}
- Key Skills: ${skillsText}
- Current Objective: ${objective}

Please format your response as JSON with the following structure:
{
  "professionalSummary": "...",
  "bulletPoints": ["...", "...", "..."],
  "improvedObjective": "..."
}

Make sure the content is:
- Professional and compelling
- Tailored to the specific role
- Incorporates the key skills naturally
- Uses action words and quantifiable achievements where appropriate
- ATS-friendly (Applicant Tracking System optimized)
`;

        // Call OpenAI API
        console.log('Calling OpenAI with prompt...'); // Debug log
        
        let parsedResponse;
        
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a professional resume writer with expertise in creating compelling, ATS-optimized resume content. Always respond with valid JSON format."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 800,
                temperature: 0.7
            });

            console.log('OpenAI response received:', completion.choices[0].message.content); // Debug log

            // Parse the response
            const aiResponse = completion.choices[0].message.content;
            parsedResponse = JSON.parse(aiResponse);
            
        } catch (openaiError) {
            console.log('OpenAI API Error, using fallback response:', openaiError.message);
            
            // Fallback response when OpenAI is not available
            parsedResponse = {
                professionalSummary: `Experienced ${role} with expertise in ${skillsText}. Proven track record of delivering high-quality solutions and collaborating effectively with cross-functional teams. Passionate about leveraging technology to drive innovation and business growth.`,
                bulletPoints: [
                    `Proficient in ${Array.isArray(skills) ? skills.slice(0, 3).join(', ') : skillsText} with hands-on experience in modern development practices`,
                    `Strong problem-solving abilities with a focus on creating efficient, scalable, and maintainable solutions`,
                    `Excellent communication skills and experience working in collaborative team environments`
                ],
                improvedObjective: `Seeking a challenging ${role} position to leverage expertise in ${skillsText} and contribute to innovative projects. Committed to continuous learning and delivering exceptional results while driving technological advancement and business success.`
            };
        }

        // Validate response structure
        if (!parsedResponse.professionalSummary || !parsedResponse.bulletPoints || !parsedResponse.improvedObjective) {
            throw new Error('Invalid response structure from AI');
        }

        res.status(200).json({
            success: true,
            message: 'AI summary generated successfully',
            data: {
                professionalSummary: parsedResponse.professionalSummary,
                bulletPoints: parsedResponse.bulletPoints,
                improvedObjective: parsedResponse.improvedObjective,
                originalData: {
                    role,
                    skills: skillsText,
                    objective
                }
            }
        });

    } catch (error) {
        console.error('Error generating AI summary:', error);
        
        // Handle specific OpenAI errors
        if (error.code === 'insufficient_quota') {
            return res.status(429).json({
                success: false,
                message: 'OpenAI API quota exceeded. Please try again later.'
            });
        }
        
        if (error.code === 'invalid_api_key') {
            return res.status(401).json({
                success: false,
                message: 'Invalid OpenAI API key configuration.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error generating AI summary',
            error: error.message
        });
    }
};

module.exports = {
    generateSummary
};
