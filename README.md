# Smart Resume Builder AI

A full-stack web application for building professional resumes with AI assistance. Built with Node.js, React, MongoDB, and the OpenAI API.

---

## What it does

- Guided multi-section resume builder with dynamic form entries
- AI-generated professional summaries, bullet points, and career objectives
- ATS compatibility scoring against a job description
- Cover letter generation for a specific role and company
- Tailored interview question generation from your resume
- JWT-based user authentication
- Print-ready LaTeX-inspired resume layout with four color themes

---

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS v4, React Router v6  
**Backend:** Node.js, Express 5, Mongoose, jsonwebtoken, bcryptjs  
**Database:** MongoDB  
**AI:** OpenAI GPT-3.5-Turbo  

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally (`mongod`)
- An OpenAI API key (optional — fallback responses work without it)

### Installation

```bash
# Clone
git clone <repo-url>
cd smart-resume-builder-ai

# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..
```

### Configuration

Create a `.env` file at the project root:

```
MONGODB_URI=mongodb://localhost:27017/smart-resume-builder
PORT=5000
JWT_SECRET=your_jwt_secret_here
OPENAI_API_KEY=sk-...your-key...
NODE_ENV=development
```

### Running locally

```bash
# Terminal 1 — backend (from project root)
node server/index.js

# Terminal 2 — frontend (from client/)
cd client && npm run dev
```

Open `http://localhost:5173` in your browser.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/resume/input` | Save resume |
| GET | `/api/resume/:id` | Get resume by ID |
| DELETE | `/api/resume/:id` | Delete resume |
| POST | `/api/resume/generateSummary` | AI summary |
| POST | `/api/resume/generateCoverLetter` | AI cover letter |
| POST | `/api/resume/ats-check` | ATS score |
| POST | `/api/interview/questions` | Interview questions |

---

## Project Structure

```
smart-resume-builder-ai/
├── server/
│   ├── index.js
│   ├── routes/
│   ├── controllers/
│   └── models/
├── client/
│   └── src/
│       ├── pages/
│       └── components/
├── report.tex       ← project report (LaTeX)
├── package.json
└── .env
```

---

## Team

**The Silicon Savants**  
Gyan Chandra · Dristi Singh

---

## License

ISC