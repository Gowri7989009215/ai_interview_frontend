import { Link } from 'react-router-dom';

const features = [
    { icon: '🧠', title: 'AI-Powered Questions', desc: 'Claude generates adaptive questions tailored to your role and experience' },
    { icon: '🎤', title: 'Voice & Text Input', desc: 'Answer using voice recognition or type your responses naturally' },
    { icon: '📊', title: 'Instant Evaluation', desc: 'Get scored across 4 dimensions with detailed feedback after each answer' },
    { icon: '🔄', title: 'Adaptive Flow', desc: 'Questions adjust in difficulty based on your performance in real-time' },
    { icon: '💻', title: 'Coding Rounds', desc: 'Practice coding with Monaco editor and AI-powered code review' },
    { icon: '📋', title: 'Detailed Reports', desc: 'Receive comprehensive skill gap analysis and learning recommendations' },
];

const steps = [
    { num: '01', title: 'Upload Resume', desc: 'Parse your resume with AI to personalize interview questions' },
    { num: '02', title: 'Choose Mode', desc: 'Select Technical, HR, Coding or Mixed interview mode' },
    { num: '03', title: 'Start Interview', desc: 'Answer questions using voice or text in a realistic environment' },
    { num: '04', title: 'Get Report', desc: 'Receive detailed feedback, scores and improvement roadmap' },
];

export default function Landing() {
    return (
        <div className="min-h-screen bg-dark-900 overflow-hidden">
            {/* NAV */}
            <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-black text-sm">PI</div>
                        <span className="text-xl font-bold text-white">ProInterview <span className="text-gradient">AI</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-gray-400 hover:text-white transition-colors font-medium">Sign In</Link>
                        <Link to="/signup" className="btn-primary text-sm py-2 px-5">Get Started Free</Link>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section className="pt-32 pb-24 px-6 relative">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl"></div>
                </div>
                <div className="max-w-4xl mx-auto text-center relative">
                    <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8 text-sm">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                        <span className="text-gray-300">Powered by Claude AI</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                        Ace Your Next<br />
                        <span className="text-gradient">Tech Interview</span>
                    </h1>
                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        Practice with AI-generated adaptive questions, get instant feedback on every answer,
                        and receive personalized learning roadmaps to bridge your skill gaps.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/signup" className="btn-primary text-lg py-4 px-8 inline-flex items-center gap-2">
                            Start Free Interview <span>→</span>
                        </Link>
                        <Link to="/login" className="btn-secondary text-lg py-4 px-8">
                            Sign In
                        </Link>
                    </div>
                    <p className="text-gray-500 text-sm mt-6">No credit card required • Free to get started</p>
                </div>
            </section>

            {/* STATS */}
            <section className="py-12 px-6 border-y border-white/5">
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[['10K+', 'Interviews Done'], ['94%', 'Satisfaction Rate'], ['4', 'Interview Modes'], ['AI', 'Claude Powered']].map(([val, label]) => (
                        <div key={label} className="text-center">
                            <div className="text-4xl font-black text-gradient mb-1">{val}</div>
                            <div className="text-gray-500 text-sm">{label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* FEATURES */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">Everything You Need to Succeed</h2>
                        <p className="text-gray-400 max-w-xl mx-auto">Practice in a realistic environment with powerful AI tools that adapt to your skill level</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f) => (
                            <div key={f.title} className="glass-card hover:border-primary-500/30 transition-all duration-300 group">
                                <div className="text-4xl mb-4">{f.icon}</div>
                                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-24 px-6 bg-dark-800/50">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
                        <p className="text-gray-400">Get interview-ready in 4 simple steps</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((s) => (
                            <div key={s.num} className="text-center">
                                <div className="text-6xl font-black text-primary-500/20 mb-4">{s.num}</div>
                                <h3 className="text-white font-bold mb-2">{s.title}</h3>
                                <p className="text-gray-400 text-sm">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6">
                <div className="max-w-3xl mx-auto text-center glass-card border-primary-500/20">
                    <h2 className="text-4xl font-bold text-white mb-4">Ready to Land Your Dream Job?</h2>
                    <p className="text-gray-400 mb-8">Join thousands of candidates who improved their interview skills with ProInterview AI</p>
                    <Link to="/signup" className="btn-primary text-lg py-4 px-10 inline-block">
                        Start Practicing Now →
                    </Link>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-white/5 py-8 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-black text-xs">PI</div>
                        <span className="text-gray-400 text-sm">ProInterview AI</span>
                    </div>
                    <p className="text-gray-600 text-sm">© 2026 ProInterview AI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
