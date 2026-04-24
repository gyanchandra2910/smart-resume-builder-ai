import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Printer, Loader2, Sparkles, Loader, FileText, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import Toast from '../components/Toast';

// ── Templates: accent color only, layout stays LaTeX-identical ───────────────
const TEMPLATES = [
  { id: 'classic', name: 'Classic', accent: '#000000' },
  { id: 'navy',    name: 'Navy',    accent: '#1a2e4a' },
  { id: 'maroon',  name: 'Maroon',  accent: '#6b1f2a' },
  { id: 'forest',  name: 'Forest',  accent: '#1a3d2b' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return '';
  try { return new Date(d + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); }
  catch { return d; }
};

export default function Preview() {
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('id') || localStorage.getItem('lastResumeId');

  const [resume, setResume]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [toast, setToast]     = useState(null);

  // Cover letter
  const [clRole, setClRole]       = useState('');
  const [clCompany, setClCompany] = useState('');
  const [clLoading, setClLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [clCopied, setClCopied]   = useState(false);

  const showToast = (m, t = 'info') => setToast({ message: m, type: t });

  useEffect(() => {
    if (!resumeId) { setLoading(false); return; }
    fetch(`/api/resume/${resumeId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setResume(d.data); })
      .catch(() => showToast('Failed to load resume', 'error'))
      .finally(() => setLoading(false));
  }, [resumeId]);

  const generateCoverLetter = async () => {
    if (!resume) return;
    if (!clRole.trim()) { showToast('Enter target role first', 'warning'); return; }
    setClLoading(true);
    try {
      const res = await fetch('/api/resume/generateCoverLetter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: clRole, companyName: clCompany,
          resumeData: {
            fullName: resume.name, email: resume.email, phone: resume.phone,
            careerObjective: resume.objective, experience: resume.experience, skills: resume.skills,
          },
        }),
      });
      const data = await res.json();
      if (data.success) { setCoverLetter(data.data.coverLetter); showToast('Cover letter generated!', 'success'); }
      else showToast(data.message || 'Generation failed', 'error');
    } catch { showToast('Network error', 'error'); }
    finally { setClLoading(false); }
  };

  const copyCL = () => navigator.clipboard.writeText(coverLetter).then(() => { setClCopied(true); setTimeout(() => setClCopied(false), 2000); });

  // ── Empty/Loading states ────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <Loader2 size={40} className="text-violet-400 animate-spin" />
    </div>
  );
  if (!resume) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
      <FileText size={60} className="text-gray-600" />
      <h2 className="text-2xl font-bold text-white">No Resume Found</h2>
      <p className="text-gray-400">Build and save a resume first.</p>
      <a href="/resume-builder" className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition">Build My Resume</a>
    </div>
  );

  const ac = template.accent;

  // ── Arrays from DB doc ──────────────────────────────────────────────────────
  const expArr  = Array.isArray(resume.experience)     ? resume.experience     : resume.experience     ? Object.values(resume.experience)     : [];
  const eduArr  = Array.isArray(resume.education)      ? resume.education      : resume.education      ? Object.values(resume.education)      : [];
  const projArr = Array.isArray(resume.projects)       ? resume.projects.filter(p => p.title)  : resume.projects  ? Object.values(resume.projects).filter(p => p.title)  : [];
  const certArr = Array.isArray(resume.certifications) ? resume.certifications.filter(c => c.name) : resume.certifications ? Object.values(resume.certifications).filter(c => c.name) : [];
  const skills  = Array.isArray(resume.skills)         ? resume.skills         : [];

  return (
    <div className="min-h-screen bg-gray-900 py-10 print:bg-white print:py-0">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      <div className="print:hidden max-w-[900px] mx-auto px-4 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold text-white mr-auto">Resume Preview</h1>

        {/* Template palette */}
        <div className="flex items-center gap-1.5 bg-gray-800/70 border border-white/10 rounded-xl p-1.5">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setTemplate(t)} title={t.name}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${template.id === t.id ? 'bg-white text-gray-900 shadow' : 'text-gray-400 hover:text-white'}`}>
              <span className="w-3 h-3 rounded-full shrink-0 border border-white/20" style={{ backgroundColor: t.accent }} />
              {t.name}
            </button>
          ))}
        </div>

        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 border border-white/10 text-white text-sm hover:bg-gray-700 transition">
          <Printer size={15} /> Print
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-900 text-sm font-semibold transition shadow">
          <Download size={15} /> Save PDF
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          RESUME DOCUMENT — LaTeX-faithful layout
          ══════════════════════════════════════════════════════════════════════ */}
      <div id="resume-doc" className="max-w-[900px] mx-auto bg-white shadow-2xl print:shadow-none print:max-w-none"
        style={{ fontFamily: '"Times New Roman", Times, Georgia, serif', color: '#111', fontSize: '11pt', lineHeight: '1.35', padding: '0.6in 0.7in 0.6in 0.7in', minHeight: '11in' }}>

        {/* ── NAME ──────────────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: '4px' }}>
          <h1 style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '22pt', fontWeight: 'bold', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0, color: ac }}>
            {resume.name}
          </h1>
        </div>

        {/* ── CONTACT BAR ────────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', fontSize: '9.5pt', color: '#333', marginBottom: '10px' }}>
          {[
            resume.phone,
            resume.email,
            resume.address,
            resume.socialLinks?.linkedin ? <a key="li" href={resume.socialLinks.linkedin} style={{ color: ac, textDecoration: 'none' }} target="_blank" rel="noreferrer">LinkedIn</a> : null,
            resume.socialLinks?.github   ? <a key="gh" href={resume.socialLinks.github}   style={{ color: ac, textDecoration: 'none' }} target="_blank" rel="noreferrer">GitHub</a>   : null,
            resume.socialLinks?.portfolio ? <a key="pf" href={resume.socialLinks.portfolio} style={{ color: ac, textDecoration: 'none' }} target="_blank" rel="noreferrer">Portfolio</a> : null,
          ].filter(Boolean).reduce((acc, el, i) => i === 0 ? [el] : [...acc, <span key={`sep${i}`} style={{ margin: '0 6px', color: '#999' }}>|</span>, el], [])}
        </div>

        {/* ─────────────────────────────────── SECTIONS ─────────────────────── */}

        {/* PROFESSIONAL SUMMARY */}
        {resume.objective && (
          <Sec title="Professional Summary" ac={ac}>
            <p style={{ margin: '4px 0 0', fontSize: '10.5pt', textAlign: 'justify' }}>{resume.objective}</p>
          </Sec>
        )}

        {/* EDUCATION */}
        {eduArr.length > 0 && (
          <Sec title="Education" ac={ac}>
            {eduArr.map((e, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: i > 0 ? '6px' : '4px' }}>
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: '10.5pt' }}>{e.college || e.institution}</span>
                  {e.degree && <div style={{ fontStyle: 'italic', fontSize: '10pt', color: '#222' }}>{e.degree}</div>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px', fontSize: '10pt', fontStyle: 'italic', color: '#444' }}>
                  {e.year && <div>{e.year}</div>}
                </div>
              </div>
            ))}
          </Sec>
        )}

        {/* TECHNICAL SKILLS */}
        {skills.length > 0 && (
          <Sec title="Technical Skills" ac={ac}>
            <p style={{ margin: '4px 0 0', fontSize: '10.5pt' }}>
              {skills.join(' · ')}
            </p>
          </Sec>
        )}

        {/* PROFESSIONAL EXPERIENCE */}
        {expArr.length > 0 && (
          <Sec title="Professional Experience" ac={ac}>
            {expArr.map((e, i) => (
              <div key={i} style={{ marginTop: i > 0 ? '8px' : '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', fontSize: '10.5pt' }}>{e.role}</span>
                    {e.company && <span style={{ fontSize: '10.5pt' }}> — <span style={{ fontStyle: 'italic' }}>{e.company}</span></span>}
                  </div>
                  {e.duration && <span style={{ fontSize: '10pt', fontStyle: 'italic', color: '#555', flexShrink: 0, marginLeft: '12px' }}>{e.duration}</span>}
                </div>
                {e.description && (
                  <div style={{ marginTop: '3px' }}>
                    {e.description.split('\n').map((line, li) => (
                      <div key={li} style={{ display: 'flex', gap: '6px', fontSize: '10.5pt', marginTop: '2px' }}>
                        <span style={{ flexShrink: 0, marginTop: '1px' }}>—</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </Sec>
        )}

        {/* PROJECTS */}
        {projArr.length > 0 && (
          <Sec title="Projects" ac={ac}>
            {projArr.map((p, i) => (
              <div key={i} style={{ marginTop: i > 0 ? '8px' : '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                  <div style={{ fontSize: '10.5pt' }}>
                    <span style={{ fontWeight: 'bold' }}>{p.title}</span>
                    {p.techStack && <span style={{ color: '#444' }}> | <span style={{ fontStyle: 'italic' }}>{p.techStack}</span></span>}
                    {p.githubLink && (
                      <a href={p.githubLink} target="_blank" rel="noreferrer"
                        style={{ color: ac, fontSize: '9.5pt', textDecoration: 'none', marginLeft: '6px' }}>
                        <ExternalLink size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> Code Link
                      </a>
                    )}
                  </div>
                </div>
                {p.description && (
                  <div style={{ marginTop: '3px' }}>
                    {p.description.split('\n').map((line, li) => (
                      <div key={li} style={{ display: 'flex', gap: '6px', fontSize: '10.5pt', marginTop: '2px' }}>
                        <span style={{ flexShrink: 0, marginTop: '1px' }}>—</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </Sec>
        )}

        {/* CERTIFICATIONS */}
        {certArr.length > 0 && (
          <Sec title="Certifications" ac={ac}>
            {certArr.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginTop: i > 0 ? '4px' : '4px', fontSize: '10.5pt' }}>
                <div>
                  <span style={{ fontWeight: 'bold' }}>{c.name}</span>
                  {c.issuer && <span style={{ color: '#444' }}> — {c.issuer}</span>}
                </div>
                {c.date && <span style={{ fontStyle: 'italic', color: '#555', flexShrink: 0, marginLeft: '12px' }}>{fmtDate(c.date)}</span>}
              </div>
            ))}
          </Sec>
        )}
      </div>
      {/* ── end resume doc ───────────────────────────────────────────────────── */}

      {/* ── Cover Letter Generator ─────────────────────────────────────────── */}
      <div className="print:hidden max-w-[900px] mx-auto px-4 mt-10">
        <div className="rounded-2xl bg-gray-800/40 border border-white/5 p-6">
          <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
            <Sparkles size={20} className="text-violet-400" /> AI Cover Letter Generator
          </h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Target Role *</label>
              <input value={clRole} onChange={e => setClRole(e.target.value)} placeholder="e.g. Software Engineer"
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/60 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Company Name</label>
              <input value={clCompany} onChange={e => setClCompany(e.target.value)} placeholder="e.g. Google"
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/60 text-sm" />
            </div>
          </div>
          <button onClick={generateCoverLetter} disabled={clLoading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 text-white text-sm font-medium transition shadow-lg shadow-violet-600/25">
            {clLoading ? <Loader size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {clLoading ? 'Generating...' : 'Generate Cover Letter'}
          </button>
          {coverLetter && (
            <div className="mt-5 p-5 rounded-xl bg-gray-900/50 border border-white/10">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-medium text-gray-300">Generated Cover Letter</p>
                <button onClick={copyCL} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 transition">
                  {clCopied ? <CheckCircle size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  {clCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{coverLetter}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Section component: SMALL CAPS title + full-width rule ─────────────────────
function Sec({ title, ac, children }) {
  return (
    <div style={{ marginTop: '10px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        borderBottom: `1.5px solid ${ac}`, paddingBottom: '2px', marginBottom: '2px',
      }}>
        <h2 style={{
          fontSize: '10.5pt', fontWeight: 'bold', fontVariant: 'small-caps',
          letterSpacing: '0.08em', color: ac, margin: 0, whiteSpace: 'nowrap',
        }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
