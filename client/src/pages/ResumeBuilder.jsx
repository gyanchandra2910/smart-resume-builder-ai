import { useState } from 'react';
import { Plus, X, Sparkles, CheckCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';

// ── Input helpers ────────────────────────────────────────────────────────────
const Field = ({ label, required, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-300">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

const Input = ({ className = '', ...props }) => (
  <input
    {...props}
    className={`w-full px-3.5 py-2.5 rounded-xl bg-gray-800/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all text-sm ${className}`}
  />
);

const Textarea = ({ className = '', ...props }) => (
  <textarea
    {...props}
    className={`w-full px-3.5 py-2.5 rounded-xl bg-gray-800/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all text-sm resize-none ${className}`}
  />
);

// ── Section accordion ────────────────────────────────────────────────────────
const Section = ({ title, icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl bg-gray-800/40 border border-white/5 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2 text-white font-semibold">
          <span className="text-violet-400">{icon}</span> {title}
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && <div className="px-6 pb-6 space-y-4">{children}</div>}
    </div>
  );
};

// ── Initial state factories ───────────────────────────────────────────────────
const emptyEdu = () => ({ degree: '', college: '', year: '' });
const emptyExp = () => ({ company: '', role: '', duration: '', description: '' });
const emptyCert = () => ({ name: '', issuer: '', date: '' });
const emptyProject = () => ({ title: '', techStack: '', githubLink: '', description: '' });

export default function ResumeBuilder() {
  const navigate = useNavigate();

  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', address: '',
    linkedin: '', github: '', portfolio: '',
    roleAppliedFor: '', careerObjective: '',
  });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [education, setEducation] = useState([emptyEdu()]);
  const [experience, setExperience] = useState([emptyExp()]);
  const [certifications, setCertifications] = useState([emptyCert()]);
  const [projects, setProjects] = useState([emptyProject()]);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [errors, setErrors] = useState({});

  const showToast = (message, type = 'info') => setToast({ message, type });

  // ── Field updaters ──────────────────────────────────────────────────────────
  const updateForm = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills(arr => [...arr, s]);
      setSkillInput('');
    }
  };

  const updateList = (setter, idx, key, val) =>
    setter(arr => arr.map((item, i) => i === idx ? { ...item, [key]: val } : item));

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    if (!form.roleAppliedFor.trim()) errs.roleAppliedFor = 'Role is required';
    if (!form.careerObjective.trim()) errs.careerObjective = 'Career objective is required';
    if (skills.length === 0) errs.skills = 'Add at least one skill';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── AI Summary ──────────────────────────────────────────────────────────────
  const generateAISummary = async () => {
    if (!form.roleAppliedFor.trim()) { showToast('Enter your desired role first', 'warning'); return; }
    if (!form.careerObjective.trim()) { showToast('Enter your career objective first', 'warning'); return; }
    if (skills.length === 0) { showToast('Add at least one skill first', 'warning'); return; }

    setAiLoading(true);
    try {
      const res = await fetch('/api/resume/generateSummary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: form.roleAppliedFor, skills, objective: form.careerObjective }),
      });
      const data = await res.json();
      if (data.success) {
        setAiResult(data.data);
        showToast('AI summary generated!', 'success');
      } else {
        showToast(data.message || 'AI generation failed', 'error');
      }
    } catch {
      showToast('Could not reach AI service', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const applyAIObjective = () => {
    if (aiResult?.improvedObjective) {
      updateForm('careerObjective', aiResult.improvedObjective);
      showToast('Objective updated!', 'success');
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const payload = {
      ...form,
      skills,
      education: education.reduce((acc, e, i) => { acc[i] = e; return acc; }, {}),
      experience: experience.reduce((acc, e, i) => { acc[i] = e; return acc; }, {}),
      certifications: certifications.reduce((acc, e, i) => { acc[i] = e; return acc; }, {}),
      projects: projects.reduce((acc, e, i) => { acc[i] = e; return acc; }, {}),
    };

    try {
      const res = await fetch('/api/resume/input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('resumeData', JSON.stringify(payload));
        localStorage.setItem('lastResumeId', data.data.id);
        showToast('Resume saved! Redirecting to preview...', 'success');
        setTimeout(() => navigate(`/preview?id=${data.data.id}`), 1500);
      } else {
        showToast(data.message || 'Error saving resume', 'error');
      }
    } catch {
      showToast('Network error. Data saved locally.', 'warning');
      localStorage.setItem('resumeDataBackup', JSON.stringify(payload));
    } finally {
      setLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 py-10">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Resume Builder</h1>
          <p className="text-gray-400">Fill in your details and let AI enhance your resume</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* ── Personal Info ─────────────────────────────────────── */}
          <Section title="Personal Information" icon="👤">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Full Name" required error={errors.fullName}>
                <Input id="fullName" placeholder="John Doe" value={form.fullName} onChange={e => updateForm('fullName', e.target.value)} />
              </Field>
              <Field label="Email" required error={errors.email}>
                <Input id="email" type="email" placeholder="john@example.com" value={form.email} onChange={e => updateForm('email', e.target.value)} />
              </Field>
              <Field label="Phone" required error={errors.phone}>
                <Input id="phone" placeholder="+1 555 000 0000" value={form.phone} onChange={e => updateForm('phone', e.target.value)} />
              </Field>
              <Field label="Address">
                <Input id="address" placeholder="City, State, Country" value={form.address} onChange={e => updateForm('address', e.target.value)} />
              </Field>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mt-2">
              <Field label="LinkedIn">
                <Input id="linkedin" placeholder="https://linkedin.com/in/..." value={form.linkedin} onChange={e => updateForm('linkedin', e.target.value)} />
              </Field>
              <Field label="GitHub">
                <Input id="github" placeholder="https://github.com/..." value={form.github} onChange={e => updateForm('github', e.target.value)} />
              </Field>
              <Field label="Portfolio">
                <Input id="portfolio" placeholder="https://yoursite.com" value={form.portfolio} onChange={e => updateForm('portfolio', e.target.value)} />
              </Field>
            </div>
          </Section>

          {/* ── Role & Objective ──────────────────────────────────── */}
          <Section title="Role & Objective" icon="🎯">
            <Field label="Desired Role / Position" required error={errors.roleAppliedFor}>
              <Input id="roleAppliedFor" placeholder="Senior Frontend Developer" value={form.roleAppliedFor} onChange={e => updateForm('roleAppliedFor', e.target.value)} />
            </Field>
            <Field label="Career Objective" required error={errors.careerObjective}>
              <Textarea id="careerObjective" rows={4} placeholder="Briefly describe your professional goals..." value={form.careerObjective} onChange={e => updateForm('careerObjective', e.target.value)} />
            </Field>
            {/* AI Enhance Button */}
            <button
              type="button"
              id="generateAISummary"
              onClick={generateAISummary}
              disabled={aiLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 text-white text-sm font-medium transition-all shadow-lg shadow-violet-600/25"
            >
              {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {aiLoading ? 'Generating...' : 'Enhance with AI'}
            </button>

            {/* AI Result Panel */}
            {aiResult && (
              <div className="mt-4 p-5 rounded-2xl bg-violet-900/20 border border-violet-500/25 space-y-4">
                <div className="flex items-center gap-2 text-violet-300 font-semibold">
                  <Sparkles size={16} /> AI Generated Content
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1 font-medium">PROFESSIONAL SUMMARY</p>
                  <p className="text-gray-200 text-sm">{aiResult.professionalSummary}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1 font-medium">KEY STRENGTHS</p>
                  <ul className="space-y-1">
                    {aiResult.bulletPoints.map((bp, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" /> {bp}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={applyAIObjective}
                  className="px-4 py-2 rounded-lg text-sm bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 transition"
                >
                  ✓ Use AI Objective
                </button>
              </div>
            )}
          </Section>

          {/* ── Skills ───────────────────────────────────────────── */}
          <Section title="Skills" icon="⚡">
            <Field label="Add Skills" error={errors.skills}>
              <div className="flex gap-2">
                <Input
                  id="keySkills"
                  placeholder="e.g. React, Python, AWS…"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition text-sm font-medium flex items-center gap-1 shrink-0"
                >
                  <Plus size={16} /> Add
                </button>
              </div>
            </Field>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-600/20 border border-violet-500/25 text-violet-300 text-sm">
                    {s}
                    <button type="button" onClick={() => setSkills(arr => arr.filter((_, j) => j !== i))} className="hover:text-red-400 transition">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Section>

          {/* ── Education ─────────────────────────────────────────── */}
          <Section title="Education" icon="🎓">
            {education.map((edu, i) => (
              <div key={i} className="relative p-5 rounded-xl bg-gray-900/50 border border-white/5">
                {i > 0 && (
                  <button type="button" onClick={() => setEducation(arr => arr.filter((_, j) => j !== i))}
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-400 transition">
                    <X size={16} />
                  </button>
                )}
                <div className="grid md:grid-cols-3 gap-4">
                  <Field label="Degree" required>
                    <Input placeholder="B.Sc. Computer Science" value={edu.degree} onChange={e => updateList(setEducation, i, 'degree', e.target.value)} />
                  </Field>
                  <Field label="College / University" required>
                    <Input placeholder="MIT" value={edu.college} onChange={e => updateList(setEducation, i, 'college', e.target.value)} />
                  </Field>
                  <Field label="Year" required>
                    <Input type="number" min="1950" max="2030" placeholder="2024" value={edu.year} onChange={e => updateList(setEducation, i, 'year', e.target.value)} />
                  </Field>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setEducation(arr => [...arr, emptyEdu()])}
              className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition font-medium">
              <Plus size={15} /> Add Education
            </button>
          </Section>

          {/* ── Experience ─────────────────────────────────────────── */}
          <Section title="Work Experience" icon="💼">
            {experience.map((exp, i) => (
              <div key={i} className="relative p-5 rounded-xl bg-gray-900/50 border border-white/5">
                {i > 0 && (
                  <button type="button" onClick={() => setExperience(arr => arr.filter((_, j) => j !== i))}
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-400 transition">
                    <X size={16} />
                  </button>
                )}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <Field label="Company" required>
                    <Input placeholder="Google LLC" value={exp.company} onChange={e => updateList(setExperience, i, 'company', e.target.value)} />
                  </Field>
                  <Field label="Role" required>
                    <Input placeholder="Software Engineer" value={exp.role} onChange={e => updateList(setExperience, i, 'role', e.target.value)} />
                  </Field>
                  <Field label="Duration" required>
                    <Input placeholder="Jan 2022 – Dec 2023" value={exp.duration} onChange={e => updateList(setExperience, i, 'duration', e.target.value)} />
                  </Field>
                </div>
                <Field label="Description" required>
                  <Textarea rows={3} placeholder="Describe your key responsibilities and achievements..." value={exp.description} onChange={e => updateList(setExperience, i, 'description', e.target.value)} />
                </Field>
              </div>
            ))}
            <button type="button" onClick={() => setExperience(arr => [...arr, emptyExp()])}
              className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition font-medium">
              <Plus size={15} /> Add Experience
            </button>
          </Section>

          {/* ── Projects ─────────────────────────────────────────── */}
          <Section title="Projects" icon="🚀" defaultOpen={false}>
            {projects.map((proj, i) => (
              <div key={i} className="relative p-5 rounded-xl bg-gray-900/50 border border-white/5">
                {i > 0 && (
                  <button type="button" onClick={() => setProjects(arr => arr.filter((_, j) => j !== i))}
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-400 transition">
                    <X size={16} />
                  </button>
                )}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <Field label="Project Title">
                    <Input placeholder="AI Resume Builder" value={proj.title} onChange={e => updateList(setProjects, i, 'title', e.target.value)} />
                  </Field>
                  <Field label="Tech Stack">
                    <Input placeholder="React, Node.js, MongoDB" value={proj.techStack} onChange={e => updateList(setProjects, i, 'techStack', e.target.value)} />
                  </Field>
                  <Field label="GitHub Link">
                    <Input placeholder="https://github.com/..." value={proj.githubLink} onChange={e => updateList(setProjects, i, 'githubLink', e.target.value)} />
                  </Field>
                </div>
                <Field label="Description">
                  <Textarea rows={3} placeholder="Describe the project, its impact, and your contributions..." value={proj.description} onChange={e => updateList(setProjects, i, 'description', e.target.value)} />
                </Field>
              </div>
            ))}
            <button type="button" onClick={() => setProjects(arr => [...arr, emptyProject()])}
              className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition font-medium">
              <Plus size={15} /> Add Project
            </button>
          </Section>

          {/* ── Certifications ─────────────────────────────────────── */}
          <Section title="Certifications" icon="🏆" defaultOpen={false}>
            {certifications.map((cert, i) => (
              <div key={i} className="relative p-5 rounded-xl bg-gray-900/50 border border-white/5">
                {i > 0 && (
                  <button type="button" onClick={() => setCertifications(arr => arr.filter((_, j) => j !== i))}
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-400 transition">
                    <X size={16} />
                  </button>
                )}
                <div className="grid md:grid-cols-3 gap-4">
                  <Field label="Certification Name">
                    <Input placeholder="AWS Solutions Architect" value={cert.name} onChange={e => updateList(setCertifications, i, 'name', e.target.value)} />
                  </Field>
                  <Field label="Issuer">
                    <Input placeholder="Amazon Web Services" value={cert.issuer} onChange={e => updateList(setCertifications, i, 'issuer', e.target.value)} />
                  </Field>
                  <Field label="Date">
                    <Input type="month" value={cert.date} onChange={e => updateList(setCertifications, i, 'date', e.target.value)} />
                  </Field>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setCertifications(arr => [...arr, emptyCert()])}
              className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition font-medium">
              <Plus size={15} /> Add Certification
            </button>
          </Section>

          {/* ── Submit ───────────────────────────────────────────── */}
          <button
            type="submit"
            id="submitResume"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 text-white font-bold text-lg shadow-xl shadow-violet-600/30 transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 size={22} className="animate-spin" /> : <CheckCircle size={22} />}
            {loading ? 'Saving Resume...' : 'Save & Preview Resume'}
          </button>
        </form>
      </div>
    </div>
  );
}
