import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ResumeBuilder from './pages/ResumeBuilder';
import Preview from './pages/Preview';
import AtsCheck from './pages/AtsCheck';
import InterviewQuestions from './pages/InterviewQuestions';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resume-builder" element={<ResumeBuilder />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/ats-check" element={<AtsCheck />} />
          <Route path="/interview-questions" element={<InterviewQuestions />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
