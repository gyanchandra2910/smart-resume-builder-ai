import { useState } from 'react';
import { MessageSquare, Loader2, ChevronDown, ChevronUp, Star, Tag } from 'lucide-react';
import Toast from '../components/Toast';

const difficultyColor = {
  Easy: 'text-emerald-400 bg-emerald-900/30 border-emerald-500/30',
  Medium: 'text-amber-400 bg-amber-900/30 border-amber-500/30',
  Hard: 'text-red-400 bg-red-900/30 border-red-500/30',
};

const typeColor = {
  behavioral: 'text-blue-400 bg-blue-900/20 border-blue-500/25',
  technical: 'text-violet-400 bg-violet-900/20 border-violet-500/25',
  situational: 'text-cyan-400 bg-cyan-900/20 border-cyan-500/25',
};

const QuestionCard = ({ q, i }) => {
  const [open, setOpen] = useState(false);
  const qText = typeof q === 'string' ? q : q.question;
  const difficulty = typeof q === 'string' ? null : q.difficulty;
  const type = typeof q === 'string' ? null : q.type;

  return (
    <div className="rounded-xl bg-gray-800/50 border border-white/5 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors gap-3"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-7 h-7 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-bold flex items-center justify-center shrink-0">
            {i + 1}
          </span>
          <span className="text-gray-200 text-sm font-medium leading-snug">{qText}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {type && (
            <span className={`hidden sm:inline px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${typeColor[type.toLowerCase()] || typeColor.behavioral}`}>
              <Tag size={10} className="inline mr-1" />{type}
            </span>
          )}
          {difficulty && (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${difficultyColor[difficulty] || difficultyColor.Medium}`}>
              {difficulty}
            </span>
          )}
          {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-white/5 pt-4">
          <p className="text-xs text-gray-500 italic">Think through your answer using the STAR method (Situation → Task → Action → Result) before responding.</p>
        </div>
      )}
    </div>
  );
};

export default function InterviewQuestions() {
  const [resumeId, setResumeId] = useState(localStorage.getItem('lastResumeId') || '');
  const [jobTitle, setJobTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (m, t = 'info') => setToast({ message: m, type: t });

  const generate = async () => {
    if (!resumeId.trim()) { showToast('Enter a Resume ID', 'warning'); return; }
    if (!jobTitle.trim()) { showToast('Enter a job title', 'warning'); return; }
    setLoading(true);
    setQuestions([]);
    try {
      const res = await fetch('/api/interview/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId, jobTitle }),
      });
      const data = await res.json();
      if (data.success) {
        const qs = data.data?.questions || data.data || [];
        setQuestions(Array.isArray(qs) ? qs : []);
        showToast(`${Array.isArray(qs) ? qs.length : 0} questions generated!`, 'success');
      } else {
        showToast(data.message || 'Generation failed', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 py-12">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
            <MessageSquare className="text-amber-400" size={36} /> Interview Prep
          </h1>
          <p className="text-gray-400">AI-generated interview questions tailored to your resume</p>
        </div>

        {/* Form */}
        <div className="rounded-2xl bg-gray-800/40 border border-white/5 p-6 mb-8 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Resume ID *</label>
              <input
                id="interviewResumeId"
                value={resumeId}
                onChange={e => setResumeId(e.target.value)}
                placeholder="Your resume MongoDB ID..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Target Job Title *</label>
              <input
                id="interviewJobTitle"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder="e.g. Software Engineer"
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 text-sm"
              />
            </div>
          </div>
          <button
            id="generateInterviewQuestions"
            onClick={generate}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-60 text-white font-semibold shadow-xl shadow-amber-600/25 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Star size={18} />}
            {loading ? 'Generating Questions...' : 'Generate Interview Questions'}
          </button>
        </div>

        {/* Questions */}
        {questions.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
              <MessageSquare size={20} className="text-amber-400" /> {questions.length} Questions Generated
            </h2>
            <div className="space-y-3">
              {questions.map((q, i) => (
                <QuestionCard key={i} q={typeof q === 'string' ? { question: q } : q} i={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
