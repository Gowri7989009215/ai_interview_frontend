import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewService } from '../services/interviewService';
import Navbar from '../components/Navbar';
import ResumeUpload from '../components/ResumeUpload';
import toast from 'react-hot-toast';

const roles = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'Data Scientist', 'DevOps Engineer', 'Mobile Developer',
    'System Design Engineer', 'Machine Learning Engineer', 'QA Engineer', 'Product Manager'
];

const levels = [
    { value: 'fresher', label: 'Fresher', desc: '0-1 year experience', icon: '🌱' },
    { value: 'junior', label: 'Junior', desc: '1-3 years experience', icon: '⚡' },
    { value: 'mid', label: 'Mid-level', desc: '3-5 years experience', icon: '🎯' },
    { value: 'senior', label: 'Senior', desc: '5-8 years experience', icon: '🚀' },
    { value: 'lead', label: 'Lead/Principal', desc: '8+ years experience', icon: '👑' },
];

const modes = [
    { value: 'Technical', label: 'Technical', desc: 'Deep technical concepts, algorithms, system design', icon: '💻', color: 'border-primary-500/40 hover:border-primary-400' },
    { value: 'HR', label: 'HR / Behavioral', desc: 'Culture fit, soft skills, situational questions', icon: '🤝', color: 'border-emerald-500/40 hover:border-emerald-400' },
    { value: 'Coding', label: 'Coding Round', desc: 'Algorithm problems with Monaco editor', icon: '⌨️', color: 'border-amber-500/40 hover:border-amber-400' },
    { value: 'Mixed', label: 'Mixed Interview', desc: 'Combination of all types - most realistic', icon: '🎯', color: 'border-violet-500/40 hover:border-violet-400' },
];

export default function InterviewSetup() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ role: '', customRole: '', experienceLevel: '', mode: '', resumeId: null });
    const [loading, setLoading] = useState(false);

    const selectedRole = form.role === 'custom' ? form.customRole : form.role;

    const handleStart = async () => {
        if (!selectedRole || !form.experienceLevel || !form.mode) {
            return toast.error('Please complete all selections');
        }
        setLoading(true);
        try {
            const { data } = await interviewService.startInterview({
                role: selectedRole,
                experienceLevel: form.experienceLevel,
                mode: form.mode,
                resumeId: form.resumeId
            });
            toast.success('Interview started! Good luck! 🎯');
            if (form.mode === 'Coding') {
                navigate(`/interview/${data.interview.id}/coding`);
            } else {
                navigate(`/interview/${data.interview.id}`);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to start interview');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-900">
            <Navbar />
            <div className="max-w-3xl mx-auto px-6 py-10">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-white mb-2">Setup Interview</h1>
                    <p className="text-gray-400">Configure your AI interview session</p>
                </div>

                {/* Progress */}
                <div className="flex items-center justify-center gap-4 mb-10">
                    {[1, 2, 3].map(s => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                ${step >= s ? 'bg-primary-600 border-primary-500 text-white' : 'border-dark-400 text-gray-500'}`}>
                                {step > s ? '✓' : s}
                            </div>
                            {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-primary-500' : 'bg-dark-400'}`}></div>}
                        </div>
                    ))}
                </div>

                {/* Step 1: Role & Level */}
                {step === 1 && (
                    <div className="space-y-6 animate-in">
                        <div className="glass-card">
                            <h2 className="text-xl font-bold text-white mb-4">Target Role</h2>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {roles.map(r => (
                                    <button key={r} onClick={() => setForm(p => ({ ...p, role: r }))}
                                        className={`text-left px-4 py-3 rounded-xl border text-sm transition-all
                      ${form.role === r ? 'border-primary-500 bg-primary-500/10 text-white' : 'border-dark-400 text-gray-400 hover:border-dark-300'}`}>
                                        {r}
                                    </button>
                                ))}
                                <button onClick={() => setForm(p => ({ ...p, role: 'custom' }))}
                                    className={`text-left px-4 py-3 rounded-xl border text-sm transition-all
                    ${form.role === 'custom' ? 'border-primary-500 bg-primary-500/10 text-white' : 'border-dark-400 text-gray-400 hover:border-dark-300'}`}>
                                    + Custom Role
                                </button>
                            </div>
                            {form.role === 'custom' && (
                                <input
                                    type="text"
                                    value={form.customRole}
                                    onChange={e => setForm(p => ({ ...p, customRole: e.target.value }))}
                                    placeholder="e.g. Site Reliability Engineer"
                                    className="input-field"
                                    autoFocus
                                />
                            )}
                        </div>

                        <div className="glass-card">
                            <h2 className="text-xl font-bold text-white mb-4">Experience Level</h2>
                            <div className="space-y-3">
                                {levels.map(l => (
                                    <button key={l.value} onClick={() => setForm(p => ({ ...p, experienceLevel: l.value }))}
                                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border transition-all
                      ${form.experienceLevel === l.value ? 'border-primary-500 bg-primary-500/10' : 'border-dark-400 hover:border-dark-300'}`}>
                                        <span className="text-2xl">{l.icon}</span>
                                        <div className="text-left">
                                            <div className={`font-semibold ${form.experienceLevel === l.value ? 'text-white' : 'text-gray-300'}`}>{l.label}</div>
                                            <div className="text-gray-500 text-xs">{l.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={() => { if (!selectedRole) return toast.error('Select a role'); if (!form.experienceLevel) return toast.error('Select experience level'); setStep(2); }}
                            className="btn-primary w-full">Continue →</button>
                    </div>
                )}

                {/* Step 2: Mode */}
                {step === 2 && (
                    <div className="space-y-6 animate-in">
                        <div className="glass-card">
                            <h2 className="text-xl font-bold text-white mb-4">Interview Mode</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {modes.map(m => (
                                    <button key={m.value} onClick={() => setForm(p => ({ ...p, mode: m.value }))}
                                        className={`text-left p-5 rounded-xl border-2 transition-all ${form.mode === m.value ? 'border-primary-500 bg-primary-500/10' : `border-dark-500 ${m.color}`}`}>
                                        <div className="text-3xl mb-3">{m.icon}</div>
                                        <div className={`font-bold mb-1 ${form.mode === m.value ? 'text-white' : 'text-gray-200'}`}>{m.label}</div>
                                        <div className="text-sm text-gray-500">{m.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                            <button onClick={() => { if (!form.mode) return toast.error('Select an interview mode'); setStep(3); }} className="btn-primary flex-1">Continue →</button>
                        </div>
                    </div>
                )}

                {/* Step 3: Resume */}
                {step === 3 && (
                    <div className="space-y-6 animate-in">
                        <div className="glass-card">
                            <ResumeUpload onResumeSelected={(id) => setForm(p => ({ ...p, resumeId: id }))} selectedResumeId={form.resumeId} />
                        </div>

                        {/* Summary */}
                        <div className="glass-card">
                            <h3 className="font-semibold text-white mb-4">Interview Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-gray-400 text-sm">Role</span>
                                    <span className="text-white font-medium">{selectedRole}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-gray-400 text-sm">Experience</span>
                                    <span className="text-white font-medium capitalize">{form.experienceLevel}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-gray-400 text-sm">Mode</span>
                                    <span className="text-white font-medium">{form.mode}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-400 text-sm">Resume</span>
                                    <span className={form.resumeId ? 'text-emerald-400 font-medium' : 'text-gray-500'}>
                                        {form.resumeId ? '✓ Uploaded' : 'Not provided'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
                            <button onClick={handleStart} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Starting...</> : '🚀 Start Interview'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
