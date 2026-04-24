import { Link } from 'react-router-dom';
import { Sparkles, BarChart2, Smartphone, Download, ArrowRight, Zap, Brain, Shield } from 'lucide-react';

const features = [
  {
    icon: <Brain size={24} />,
    title: 'AI-Powered Content',
    desc: 'GPT-powered professional summaries, bullet points, and cover letters tailored to your role.',
    color: 'from-violet-500 to-purple-600',
    glow: 'shadow-violet-500/30',
  },
  {
    icon: <BarChart2 size={24} />,
    title: 'ATS Score Check',
    desc: 'Real-time analysis of your resume against Applicant Tracking System requirements.',
    color: 'from-cyan-500 to-blue-600',
    glow: 'shadow-cyan-500/30',
  },
  {
    icon: <Zap size={24} />,
    title: 'Interview Prep',
    desc: 'AI-generated interview questions based on your resume and target role.',
    color: 'from-amber-500 to-orange-600',
    glow: 'shadow-amber-500/30',
  },
  {
    icon: <Download size={24} />,
    title: 'PDF Export',
    desc: 'Export pixel-perfect PDF resumes ready to send to recruiters instantly.',
    color: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-500/30',
  },
];

const stats = [
  { value: '10K+', label: 'Resumes Created' },
  { value: '95%', label: 'ATS Pass Rate' },
  { value: 'GPT-3.5', label: 'AI Engine' },
  { value: '100%', label: 'Free to Start' },
];

export default function Home() {
  return (
    <div className="bg-gray-950 text-white">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-900/10 rounded-full blur-3xl" />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-8">
                <Sparkles size={14} className="animate-pulse" />
                Powered by OpenAI GPT
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
                Build Resumes
                <br />
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                  That Get Hired
                </span>
              </h1>
              <p className="text-lg text-gray-400 mb-10 leading-relaxed max-w-lg">
                Create ATS-optimized, AI-enhanced professional resumes in minutes. 
                Let our GPT engine craft compelling summaries and beat the bots.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/resume-builder"
                  id="cta-build-resume"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-base shadow-xl shadow-violet-600/30 hover:shadow-violet-500/50 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Create Resume <ArrowRight size={18} />
                </Link>
                <Link
                  to="/ats-check"
                  id="cta-ats-check"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-base transition-all duration-300 hover:-translate-y-0.5"
                >
                  <BarChart2 size={18} /> ATS Score Check
                </Link>
              </div>
            </div>

            {/* Hero visual */}
            <div className="hidden lg:flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Floating resume card mockup */}
                <div className="relative bg-gray-800/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/50">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-lg">JD</div>
                    <div>
                      <div className="font-semibold text-white">John Doe</div>
                      <div className="text-sm text-violet-400">Senior Software Engineer</div>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                      <Shield size={10} /> ATS: 94%
                    </div>
                  </div>
                  {/* Fake sections */}
                  {['Skills', 'Experience', 'Education', 'Projects'].map((section, i) => (
                    <div key={section} className="mb-4">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{section}</div>
                      <div className="space-y-1.5">
                        {[...Array(i === 0 ? 1 : 2)].map((_, j) => (
                          <div key={j} className={`h-2 rounded-full bg-gray-700/80 ${j === 1 ? 'w-3/4' : 'w-full'}`} />
                        ))}
                        {i === 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'].map(s => (
                              <span key={s} className="px-2 py-0.5 rounded-full bg-violet-600/20 border border-violet-500/20 text-violet-300 text-xs">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {/* AI badge */}
                  <div className="absolute -top-3 -right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-600 shadow-lg shadow-violet-600/40 text-white text-xs font-semibold">
                    <Sparkles size={12} className="animate-pulse" /> AI Enhanced
                  </div>
                </div>
                {/* Decorative orb */}
                <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-violet-600/10 rounded-full blur-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/5 bg-gray-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map(s => (
              <div key={s.label}>
                <div className="text-3xl font-extrabold text-white mb-1">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Land the Job
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Our AI-powered suite of tools handles every step from resume creation to interview preparation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => (
              <div
                key={f.title}
                className="group relative p-6 rounded-2xl bg-gray-800/50 border border-white/5 hover:border-white/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-5 shadow-lg ${f.glow} group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-white mb-2 text-lg">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-violet-900/60 to-indigo-900/60 border border-violet-500/20 p-12 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />
            <div className="relative">
              <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Hired?</h2>
              <p className="text-gray-300 text-lg mb-8">Start building your AI-powered resume today. No credit card required.</p>
              <Link
                to="/resume-builder"
                id="cta-bottom-build"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-gray-900 font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl hover:-translate-y-0.5"
              >
                <Sparkles size={20} className="text-violet-600" /> Build My Resume
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-gray-900/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© 2025 Smart Resume Builder AI. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition">GitHub</a>
            <a href="#" className="hover:text-white transition">LinkedIn</a>
            <a href="#" className="hover:text-white transition">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
