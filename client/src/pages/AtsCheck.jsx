import { useState } from 'react';
import { BarChart2, Upload, Loader2, AlertCircle, CheckCircle, Info, TrendingUp } from 'lucide-react';
import Toast from '../components/Toast';

const ScoreRing = ({ score }) => {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const progress = ((100 - score) / 100) * circ;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#1f2937" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={progress}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold text-white">{score}</span>
        <span className="text-xs text-gray-400">/ 100</span>
      </div>
    </div>
  );
};

export default function AtsCheck() {
  const [mode, setMode] = useState('id'); // 'id' | 'text'
  const [resumeId, setResumeId] = useState(localStorage.getItem('lastResumeId') || '');
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => setToast({ message, type });

  const handleCheck = async () => {
    if (mode === 'id' && !resumeId.trim()) { showToast('Enter a Resume ID', 'warning'); return; }
    if (mode === 'text' && !resumeText.trim()) { showToast('Paste your resume text', 'warning'); return; }
    if (!jobDesc.trim()) { showToast('Enter a job description', 'warning'); return; }

    setLoading(true);
    setResult(null);
    try {
      const body = mode === 'id'
        ? { resumeId, jobDescription: jobDesc }
        : { resumeText, jobDescription: jobDesc };

      const res = await fetch('/api/resume/ats-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        showToast('ATS analysis complete!', 'success');
      } else {
        showToast(data.message || 'Analysis failed', 'error');
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
            <BarChart2 className="text-cyan-400" size={36} /> ATS Score Checker
          </h1>
          <p className="text-gray-400">Analyze how well your resume matches a job description</p>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-xl bg-gray-800/50 border border-white/5 p-1 mb-6 w-fit mx-auto">
          {[{ val: 'id', label: 'By Resume ID' }, { val: 'text', label: 'Paste Resume' }].map(m => (
            <button key={m.val} onClick={() => setMode(m.val)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${mode === m.val ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25' : 'text-gray-400 hover:text-white'}`}>
              {m.label}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="rounded-2xl bg-gray-800/40 border border-white/5 p-6">
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              {mode === 'id' ? 'Resume ID' : 'Resume Text'}
            </label>
            {mode === 'id' ? (
              <input
                id="atsResumeId"
                value={resumeId}
                onChange={e => setResumeId(e.target.value)}
                placeholder="MongoDB ObjectId..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 text-sm"
              />
            ) : (
              <textarea
                id="atsResumeText"
                rows={8}
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                placeholder="Paste your resume content here..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 text-sm resize-none"
              />
            )}
          </div>

          <div className="rounded-2xl bg-gray-800/40 border border-white/5 p-6">
            <label className="text-sm font-medium text-gray-300 mb-2 block">Job Description *</label>
            <textarea
              id="jobDescription"
              rows={8}
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 text-sm resize-none"
            />
          </div>
        </div>

        <button
          id="runAtsCheck"
          onClick={handleCheck}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-60 text-white font-bold text-base shadow-xl shadow-cyan-600/25 transition-all flex items-center justify-center gap-3"
        >
          {loading ? <Loader2 size={22} className="animate-spin" /> : <TrendingUp size={22} />}
          {loading ? 'Analyzing...' : 'Run ATS Analysis'}
        </button>

        {/* Results */}
        {result && (
          <div className="mt-10 space-y-6">
            {/* Score */}
            <div className="rounded-2xl bg-gray-800/50 border border-white/10 p-8 text-center">
              <h2 className="text-xl font-bold text-white mb-6">Your ATS Score</h2>
              <ScoreRing score={result.score ?? result.atsScore ?? 0} />
              <p className="text-gray-400 mt-4 text-sm max-w-sm mx-auto">{result.summary || result.overallAssessment || 'Analysis complete.'}</p>
            </div>

            {/* Breakdown */}
            <div className="grid md:grid-cols-2 gap-6">
              {result.strengths?.length > 0 && (
                <div className="rounded-2xl bg-gray-800/40 border border-emerald-500/20 p-5">
                  <h3 className="font-semibold text-emerald-400 mb-3 flex items-center gap-2"><CheckCircle size={16} /> Strengths</h3>
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2"><CheckCircle size={13} className="text-emerald-500 mt-0.5 shrink-0" />{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.improvements?.length > 0 && (
                <div className="rounded-2xl bg-gray-800/40 border border-amber-500/20 p-5">
                  <h3 className="font-semibold text-amber-400 mb-3 flex items-center gap-2"><AlertCircle size={16} /> Improvements</h3>
                  <ul className="space-y-2">
                    {result.improvements.map((s, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2"><AlertCircle size={13} className="text-amber-500 mt-0.5 shrink-0" />{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Missing Keywords */}
            {result.missingKeywords?.length > 0 && (
              <div className="rounded-2xl bg-gray-800/40 border border-red-500/20 p-5">
                <h3 className="font-semibold text-red-400 mb-3 flex items-center gap-2"><Info size={16} /> Missing Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs bg-red-900/30 border border-red-500/30 text-red-300">{kw}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations?.length > 0 && (
              <div className="rounded-2xl bg-gray-800/40 border border-blue-500/20 p-5">
                <h3 className="font-semibold text-blue-400 mb-3 flex items-center gap-2"><Info size={16} /> Recommendations</h3>
                <ul className="space-y-2">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-blue-500 shrink-0 mt-0.5">→</span>{r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
