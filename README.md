# Smart Resume Builder AI

A full-stack web application for building professional resumes with AI assistance. Built with Node.js, React, MongoDB, and the OpenAI API.

---

## What it does

- Guided multi-section resume builder with dynamic form entries
- AI-generated professional summaries, bullet points, and career objectives
- ATS compatibility scoring against a job description
- Cover letter generation for a specific role and company
- Tailored interview question generation from your resume
- JWT-based authentication with user-scoped resume access
- Print-ready LaTeX-inspired resume layout with four color themes

---

## Demo

[Watch the project demo on YouTube](https://youtu.be/i-GdJRHaLZQ?si=tqE67Dqg79f9HQy3)

---

## Tech Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS v4, React Router v7
- **Backend:** Node.js, Express 5, Mongoose, JSON Web Token, bcryptjs
- **Database:** MongoDB
- **AI:** OpenAI GPT-4o mini (configurable with `OPENAI_MODEL`)

---

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- MongoDB running locally (`mongod`)
- An OpenAI API key (optional — fallback responses work without it)

### Installation

```bash
# Clone
git clone https://github.com/gyanchandra2910/smart-resume-builder-ai.git
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
OPENAI_MODEL=gpt-4o-mini
NODE_ENV=development
```

### Running locally

```bash
# Terminal 1 — backend (from project root)
npm start

# Terminal 2 — frontend (from client/)
cd client && npm run dev
```

Open `http://localhost:5173` in your browser.

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | No | Register and receive a JWT |
| POST | `/api/auth/login` | No | Login and receive a JWT |
| POST | `/api/resume/input` | Yes | Save a resume for the current user |
| GET | `/api/resume` | Yes | List the current user's resumes |
| GET | `/api/resume/:id` | Yes | Get an owned resume by ID |
| DELETE | `/api/resume/:id` | Yes | Delete an owned resume |
| GET | `/api/resume/public/:id` | No | Get a public resume page |
| GET | `/resume/:id` | No | Open the shareable resume page |
| POST | `/api/resume/generateSummary` | Yes | Generate an AI summary |
| POST | `/api/resume/generateCoverLetter` | Yes | Generate a cover letter |
| POST | `/api/resume/ats-check` | Yes | Calculate an ATS score |
| POST | `/api/interview/questions` | Yes | Generate interview questions |
| POST | `/api/review/submit` | Yes | Submit a peer review |
| GET | `/api/review/resume/:resumeId` | Yes | Get reviews for a resume |
| GET | `/api/review/reviewer/:reviewerId/stats` | Yes | Get reviewer statistics |
| GET | `/api/review/reviewer/:reviewerId/reviews` | Yes | Get reviewer history |
| GET | `/api/review/leaderboard` | Yes | Get the reviewer leaderboard |

Authenticated requests require an `Authorization: Bearer <token>` header.

---

## Project Structure

```
smart-resume-builder-ai/
├── server/
│   ├── index.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
├── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── utils/
├── Report.pdf
├── README.md
├── package.json
└── .env              # create locally; not committed
```

---

## Team

**The Silicon Savants**  
Gyan Chandra · Dristi Singh

---

## License

ISC
