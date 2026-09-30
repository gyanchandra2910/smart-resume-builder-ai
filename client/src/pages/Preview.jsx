import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Printer, Loader2, Sparkles, Loader, FileText, Copy, CheckCircle } from 'lucide-react';
import Toast from '../components/Toast';
import { authFetch } from '../utils/api';

const TEMPLATES = [
  { id: 'classic', name: 'Classic', accent: '#111111' },
  { id: 'navy', name: 'Navy', accent: '#183153' },
  { id: 'maroon', name: 'Maroon', accent: '#6b1f2a' },
  { id: 'forest', name: 'Forest', accent: '#1f4d3a' },
];

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  return value && typeof value === 'object' ? Object.values(value) : [];
};

const cleanLines = (value = '') => String(value)
  .split(/\r?\n/)
  .map(line => line.replace(/^\s*[-–—•*]+\s*/, '').trim())
  .filter(Boolean);

const safeExternalUrl = (value) => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
};

const fmtDate = (date) => {
  if (!date) return '';
  const match = String(date).match(/^(\d{4})-(\d{2})$/);
  if (!match) return date;
  return new Date(Number(match[1]), Number(match[2]) - 1)
    .toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

export default function Preview() {
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('id') || localStorage.getItem('lastResumeId');
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(Boolean(resumeId));
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [toast, setToast] = useState(null);
  const [clRole, setClRole] = useState('');
  const [clCompany, setClCompany] = useState('');
  const [clLoading, setClLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [clCopied, setClCopied] = useState(false);

  const showToast = (message, type = 'info') => setToast({ message, type });

  useEffect(() => {
    if (!resumeId) return;
    authFetch(`/api/resume/${resumeId}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) setResume(data.data);
        else showToast(data.message || 'Failed to load resume', 'error');
      })
      .catch(() => showToast('Failed to load resume', 'error'))
      .finally(() => setLoading(false));
  }, [resumeId]);

  const generateCoverLetter = async () => {
    if (!resume) return;
    if (!clRole.trim()) {
      showToast('Enter target role first', 'warning');
      return;
    }

    setClLoading(true);
    try {
      const response = await authFetch('/api/resume/generateCoverLetter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: clRole,
          companyName: clCompany,
          resumeData: {
            fullName: resume.name,
            email: resume.email,
            phone: resume.phone,
            careerObjective: resume.objective,
            experience: resume.experience,
            skills: resume.skills,
          },
        }),
      });
      const data = await response.json();
      if (data.success) {
        setCoverLetter(data.data.coverLetter);
        showToast('Cover letter generated!', 'success');
      } else {
        showToast(data.message || 'Generation failed', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setClLoading(false);
    }
  };

  const copyCoverLetter = () => navigator.clipboard.writeText(coverLetter).then(() => {
    setClCopied(true);
    setTimeout(() => setClCopied(false), 2000);
  });

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

  const accent = template.accent;
  const education = toArray(resume.education).filter(item => item.degree || item.college);
  const experience = toArray(resume.experience).filter(item => item.role || item.company);
  const projects = toArray(resume.projects).filter(item => item.title);
  const certifications = toArray(resume.certifications).filter(item => item.name);
  const achievements = toArray(resume.achievements).filter(item => item.title || item.description);
  const activities = toArray(resume.activities).filter(item => item.description);
  const skills = Array.isArray(resume.skills) ? resume.skills.filter(Boolean) : [];

  const contactItems = [
    resume.email ? <a key="email" href={`mailto:${resume.email}`}>{resume.email}</a> : null,
    resume.phone ? <span key="phone">{resume.phone}</span> : null,
    resume.address ? <span key="address">{resume.address}</span> : null,
    safeExternalUrl(resume.socialLinks?.linkedin) ? <a key="linkedin" href={safeExternalUrl(resume.socialLinks.linkedin)} target="_blank" rel="noreferrer">LinkedIn</a> : null,
    safeExternalUrl(resume.socialLinks?.github) ? <a key="github" href={safeExternalUrl(resume.socialLinks.github)} target="_blank" rel="noreferrer">GitHub</a> : null,
    safeExternalUrl(resume.socialLinks?.portfolio) ? <a key="portfolio" href={safeExternalUrl(resume.socialLinks.portfolio)} target="_blank" rel="noreferrer">Portfolio</a> : null,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-900 py-10 print:bg-white print:py-0">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="print:hidden max-w-[794px] mx-auto px-4 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold text-white mr-auto">Resume Preview</h1>
        <div className="flex items-center gap-1.5 bg-gray-800/70 border border-white/10 rounded-xl p-1.5">
          {TEMPLATES.map(option => (
            <button key={option.id} onClick={() => setTemplate(option)} title={option.name}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${template.id === option.id ? 'bg-white text-gray-900 shadow' : 'text-gray-400 hover:text-white'}`}>
              <span className="w-3 h-3 rounded-full shrink-0 border border-white/20" style={{ backgroundColor: option.accent }} />
              {option.name}
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

      <main id="resume-doc" className="mx-auto bg-white shadow-2xl print:shadow-none"
        style={{
          width: 'min(100%, 794px)',
          minHeight: '1123px',
          padding: '11mm 13mm 12mm',
          fontFamily: 'Georgia, "Times New Roman", Times, serif',
          color: '#111',
          fontSize: '10pt',
          lineHeight: 1.26,
        }}>
        <header style={{ textAlign: 'center', paddingBottom: '3px' }}>
          <h1 style={{ margin: 0, fontSize: '20pt', lineHeight: 1.1, fontWeight: 700, color: '#111' }}>
            {resume.name}
          </h1>
          <div className="resume-contact" style={{ marginTop: '5px', fontSize: '8.8pt', lineHeight: 1.35 }}>
            {contactItems.map((item, index) => (
              <span key={index}>
                {index > 0 && <span aria-hidden="true" style={{ margin: '0 5px', color: '#555' }}>|</span>}
                {item}
              </span>
            ))}
          </div>
        </header>

        {resume.objective && (
          <ResumeSection title="Professional Summary" accent={accent}>
            <p style={{ margin: 0, textAlign: 'justify' }}>{resume.objective}</p>
          </ResumeSection>
        )}

        {education.length > 0 && (
          <ResumeSection title="Education" accent={accent}>
            {education.map((item, index) => (
              <Entry key={index} spaced={index > 0}>
                <EntryRow left={<strong>{item.degree}</strong>} right={item.year} />
                <EntryRow left={item.college} right={item.score} secondary />
              </Entry>
            ))}
          </ResumeSection>
        )}

        {experience.length > 0 && (
          <ResumeSection title="Experience" accent={accent}>
            {experience.map((item, index) => (
              <Entry key={index} spaced={index > 0}>
                <EntryRow
                  left={<><strong>{item.role}</strong>{item.company && <> | {item.company}</>}</>}
                  right={item.duration}
                />
                {item.location && <div style={{ fontStyle: 'italic', fontSize: '9.2pt', marginTop: '1px' }}>{item.location}</div>}
                <BulletList text={item.description} />
              </Entry>
            ))}
          </ResumeSection>
        )}

        {projects.length > 0 && (
          <ResumeSection title="Projects" accent={accent}>
            {projects.map((item, index) => {
              const projectUrl = safeExternalUrl(item.githubLink);
              return (
                <Entry key={index} spaced={index > 0}>
                  <EntryRow
                    left={(
                      <>
                        <strong>{item.title}</strong>
                        {projectUrl && <> | <a href={projectUrl} target="_blank" rel="noreferrer" style={{ color: accent }}>Project Link</a></>}
                      </>
                    )}
                    right={item.duration}
                  />
                  {item.techStack && <div style={{ fontStyle: 'italic', fontSize: '9.2pt', marginTop: '1px' }}>Technologies: {item.techStack}</div>}
                  <BulletList text={item.description} />
                </Entry>
              );
            })}
          </ResumeSection>
        )}

        {skills.length > 0 && (
          <ResumeSection title="Technical Skills" accent={accent}>
            <p style={{ margin: 0 }}>{skills.join('  •  ')}</p>
          </ResumeSection>
        )}

        {achievements.length > 0 && (
          <ResumeSection title="Achievements" accent={accent}>
            <ul className="resume-bullets" style={{ margin: 0, paddingLeft: '16px' }}>
              {achievements.map((item, index) => (
                <li key={index} style={{ paddingLeft: '1px', marginTop: index ? '2px' : 0 }}>
                  <EntryRow
                    left={<><strong>{item.title}</strong>{item.title && item.description ? ': ' : ''}{item.description}</>}
                    right={item.date}
                  />
                </li>
              ))}
            </ul>
          </ResumeSection>
        )}

        {certifications.length > 0 && (
          <ResumeSection title="Certifications" accent={accent}>
            {certifications.map((item, index) => (
              <Entry key={index} spaced={index > 0}>
                <EntryRow
                  left={<><strong>{item.name}</strong>{item.issuer && <> | {item.issuer}</>}</>}
                  right={fmtDate(item.date)}
                />
              </Entry>
            ))}
          </ResumeSection>
        )}

        {activities.length > 0 && (
          <ResumeSection title="Extracurricular Activities" accent={accent}>
            <ul className="resume-bullets" style={{ margin: 0, paddingLeft: '16px' }}>
              {activities.map((item, index) => <li key={index} style={{ paddingLeft: '1px', marginTop: index ? '2px' : 0 }}>{item.description}</li>)}
            </ul>
          </ResumeSection>
        )}
      </main>

      <div className="print:hidden max-w-[794px] mx-auto px-4 mt-10">
        <div className="rounded-2xl bg-gray-800/40 border border-white/5 p-6">
          <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
            <Sparkles size={20} className="text-violet-400" /> AI Cover Letter Generator
          </h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Target Role *</label>
              <input value={clRole} onChange={event => setClRole(event.target.value)} placeholder="e.g. Software Engineer"
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/60 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Company Name</label>
              <input value={clCompany} onChange={event => setClCompany(event.target.value)} placeholder="e.g. Google"
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
                <button onClick={copyCoverLetter} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 transition">
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

function ResumeSection({ title, accent, children }) {
  return (
    <section className="resume-section" style={{ marginTop: '7px' }}>
      <h2 style={{
        margin: '0 0 3px',
        paddingBottom: '1px',
        borderBottom: `1.2px solid ${accent}`,
        color: accent,
        fontSize: '10.2pt',
        lineHeight: 1.2,
        fontWeight: 700,
        letterSpacing: '0.035em',
        textTransform: 'uppercase',
      }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Entry({ spaced, children }) {
  return <div className="resume-entry" style={{ marginTop: spaced ? '5px' : 0 }}>{children}</div>;
}

function EntryRow({ left, right, secondary = false }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'baseline', gap: '12px', fontSize: secondary ? '9.4pt' : '10pt' }}>
      <div style={{ minWidth: 0 }}>{left}</div>
      {right && <div style={{ flexShrink: 0, textAlign: 'right', whiteSpace: 'nowrap', fontStyle: secondary ? 'normal' : 'italic', fontSize: '9.2pt' }}>{right}</div>}
    </div>
  );
}

function BulletList({ text }) {
  const lines = cleanLines(text);
  if (!lines.length) return null;
  return (
    <ul className="resume-bullets" style={{ margin: '2px 0 0', paddingLeft: '16px' }}>
      {lines.map((line, index) => <li key={index} style={{ paddingLeft: '1px', marginTop: index ? '1px' : 0 }}>{line}</li>)}
    </ul>
  );
}
