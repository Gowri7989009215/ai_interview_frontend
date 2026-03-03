import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { interviewService } from '../services/interviewService';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import {
    Chart as ChartJS, RadialLinearScale, PointElement, LineElement,
    Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement
} from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [interviews, setInterviews] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [{ data: iData }, { data: rData }] = await Promise.all([
                    interviewService.getUserInterviews(),
                    interviewService.getUserReports()
                ]);
                setInterviews(iData.interviews || []);
                setReports(rData.reports || []);
            } catch {
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const completedInterviews = interviews.filter(i => i.status === 'completed');
    const avgScore = completedInterviews.length > 0
        ? Math.round(completedInterviews.reduce((sum, i) => sum + i.overallScore, 0) / completedInterviews.length) : 0;

    // Radar chart data
    const radarData = reports.length > 0 ? {
        labels: ['Relevance', 'Technical Depth', 'Clarity', 'Communication'],
        datasets: [{
            label: 'Your Skills',
            data: [
                Math.round(reports.reduce((s, r) => s + r.categoryScores.relevance, 0) / reports.length),
                Math.round(reports.reduce((s, r) => s + r.categoryScores.technicalDepth, 0) / reports.length),
                Math.round(reports.reduce((s, r) => s + r.categoryScores.clarity, 0) / reports.length),
                Math.round(reports.reduce((s, r) => s + r.categoryScores.communication, 0) / reports.length),
            ],
            backgroundColor: 'rgba(99,102,241,0.15)',
            borderColor: '#6366f1',
            pointBackgroundColor: '#818cf8',
            borderWidth: 2
        }]
    } : null;

    // Bar chart - score over last 5 interviews
    const last5 = completedInterviews.slice(-5);
    const barData = {
        labels: last5.map((_, i) => `Interview ${i + 1}`),
        datasets: [{
            label: 'Score',
            data: last5.map(i => i.overallScore),
            backgroundColor: 'rgba(99,102,241,0.6)',
            borderColor: '#6366f1',
            borderWidth: 1,
            borderRadius: 6
        }]
    };

    const chartOptions = {
        plugins: { legend: { labels: { color: '#9ca3af', font: { size: 11 } } } },
        scales: { r: { ticks: { color: '#6b7280', backdropColor: 'transparent' }, grid: { color: 'rgba(255,255,255,0.05)' }, pointLabels: { color: '#9ca3af', font: { size: 12 } } } }
    };

    const barOptions = {
        plugins: { legend: { display: false } },
        scales: {
            x: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { min: 0, max: 100, ticks: { color: '#6b7280' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
    };

    const getScoreColor = (s) => s >= 75 ? 'text-emerald-400' : s >= 50 ? 'text-amber-400' : 'text-red-400';
    const getModeBadge = (mode) => {
        const map = { Technical: 'badge-primary', HR: 'badge-success', Coding: 'badge-warning', Mixed: 'badge-gray' };
        return map[mode] || 'badge-gray';
    };
    const getStatusBadge = (s) => ({ completed: 'badge-success', 'in-progress': 'badge-warning', pending: 'badge-gray', abandoned: 'badge-danger' }[s] || 'badge-gray');

    if (loading) return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-dark-900">
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋</h1>
                        <p className="text-gray-400 mt-1">Track your progress and start a new interview</p>
                    </div>
                    <Link to="/interview/setup" className="btn-primary flex items-center gap-2">
                        <span>+</span> New Interview
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Interviews', value: interviews.length, icon: '🎯', color: 'text-primary-400' },
                        { label: 'Completed', value: completedInterviews.length, icon: '✅', color: 'text-emerald-400' },
                        { label: 'Average Score', value: `${avgScore}/100`, icon: '⭐', color: 'text-amber-400' },
                        { label: 'Reports Generated', value: reports.length, icon: '📋', color: 'text-violet-400' },
                    ].map((stat) => (
                        <div key={stat.label} className="glass-card">
                            <div className="text-2xl mb-2">{stat.icon}</div>
                            <div className={`text-3xl font-black ${stat.color} mb-1`}>{stat.value}</div>
                            <div className="text-gray-500 text-sm">{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    {/* Radar chart */}
                    {radarData && (
                        <div className="glass-card">
                            <h2 className="section-title text-lg">Skill Radar</h2>
                            <p className="section-sub mb-4">Based on {reports.length} interview(s)</p>
                            <Radar data={radarData} options={chartOptions} />
                        </div>
                    )}

                    {/* Score Progress */}
                    <div className={`glass-card ${radarData ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                        <h2 className="section-title text-lg">Score Progress</h2>
                        <p className="section-sub mb-4">Last {last5.length} completed interviews</p>
                        {last5.length > 0 ? (
                            <Bar data={barData} options={barOptions} />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                                <p>Complete interviews to see your progress</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Interviews */}
                <div className="glass-card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="section-title text-xl">Recent Interviews</h2>
                        {interviews.length > 0 && (
                            <Link to="/interview/setup" className="btn-secondary text-sm py-2">New Interview</Link>
                        )}
                    </div>
                    {interviews.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-5xl mb-4">🎯</div>
                            <h3 className="text-white font-semibold text-lg mb-2">No interviews yet</h3>
                            <p className="text-gray-500 mb-6">Start your first AI-powered interview practice session</p>
                            <Link to="/interview/setup" className="btn-primary inline-block">Start Interview →</Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 pr-4">Role</th>
                                        <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 pr-4">Mode</th>
                                        <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 pr-4">Level</th>
                                        <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 pr-4">Score</th>
                                        <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 pr-4">Status</th>
                                        <th className="text-left text-xs font-medium text-gray-500 uppercase py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {interviews.map(interview => (
                                        <tr key={interview._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                                            <td className="py-4 pr-4 text-white font-medium">{interview.role}</td>
                                            <td className="py-4 pr-4"><span className={getModeBadge(interview.mode)}>{interview.mode}</span></td>
                                            <td className="py-4 pr-4 text-gray-400 capitalize">{interview.experienceLevel}</td>
                                            <td className={`py-4 pr-4 font-bold ${getScoreColor(interview.overallScore)}`}>
                                                {interview.overallScore > 0 ? `${interview.overallScore}/100` : '-'}
                                            </td>
                                            <td className="py-4 pr-4"><span className={getStatusBadge(interview.status)}>{interview.status}</span></td>
                                            <td className="py-4">
                                                {interview.status === 'completed' ? (
                                                    <Link to={`/report/${interview._id}`} className="text-primary-400 hover:text-primary-300 text-sm transition-colors">View Report →</Link>
                                                ) : interview.status === 'in-progress' ? (
                                                    <Link to={`/interview/${interview._id}`} className="text-amber-400 hover:text-amber-300 text-sm transition-colors">Continue →</Link>
                                                ) : <span className="text-gray-600 text-sm">-</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
