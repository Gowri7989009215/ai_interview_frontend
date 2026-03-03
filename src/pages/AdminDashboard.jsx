import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/interviewService';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import {
    Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [toggling, setToggling] = useState(null);

    useEffect(() => {
        if (user?.role !== 'admin') { navigate('/dashboard'); return; }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [{ data: sData }, { data: uData }, { data: iData }] = await Promise.all([
                adminService.getStats(),
                adminService.getAllUsers(),
                adminService.getAllInterviews(),
            ]);
            setStats(sData.stats);
            setUsers(uData.users || []);
            setInterviews(iData.interviews || []);
        } catch {
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleUser = async (userId) => {
        setToggling(userId);
        try {
            const { data } = await adminService.toggleUserStatus(userId);
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: data.user.isActive } : u));
            toast.success(`User ${data.user.isActive ? 'activated' : 'deactivated'}`);
        } catch {
            toast.error('Failed to update user');
        } finally {
            setToggling(null);
        }
    };

    const modeData = stats?.interviewsByMode ? {
        labels: stats.interviewsByMode.map(m => m._id),
        datasets: [{
            data: stats.interviewsByMode.map(m => m.count),
            backgroundColor: ['rgba(99,102,241,0.7)', 'rgba(16,185,129,0.7)', 'rgba(245,158,11,0.7)', 'rgba(139,92,246,0.7)'],
            borderColor: ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6'],
            borderWidth: 1,
        }]
    } : null;

    const doughnutOptions = {
        plugins: { legend: { labels: { color: '#9ca3af', font: { size: 11 } } } }
    };

    const topUsersData = stats?.topUsers?.length > 0 ? {
        labels: stats.topUsers.map(u => u.name.split(' ')[0]),
        datasets: [{
            label: 'Avg Score',
            data: stats.topUsers.map(u => u.averageScore),
            backgroundColor: 'rgba(99,102,241,0.6)',
            borderColor: '#6366f1',
            borderWidth: 1,
            borderRadius: 6
        }]
    } : null;

    const barOptions = {
        plugins: { legend: { display: false } },
        scales: {
            x: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(255,255,255,0.04)' } },
            y: { min: 0, max: 100, ticks: { color: '#6b7280' }, grid: { color: 'rgba(255,255,255,0.04)' } }
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const tabs = ['overview', 'users', 'interviews'];

    return (
        <div className="min-h-screen bg-dark-900">
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                        <p className="text-gray-400 mt-1">System overview and user management</p>
                    </div>
                    <span className="badge-danger">Admin</span>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 glass p-1 rounded-xl mb-8 w-fit">
                    {tabs.map(t => (
                        <button key={t} onClick={() => setActiveTab(t)}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize
                ${activeTab === t ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                            {t}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-in">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'text-primary-400' },
                                { label: 'Total Interviews', value: stats?.totalInterviews || 0, icon: '🎯', color: 'text-emerald-400' },
                                { label: 'Completed', value: stats?.completedInterviews || 0, icon: '✅', color: 'text-green-400' },
                                { label: 'Avg Score', value: `${stats?.avgScore || 0}/100`, icon: '⭐', color: 'text-amber-400' },
                                { label: 'Reports', value: stats?.totalReports || 0, icon: '📋', color: 'text-violet-400' },
                                { label: 'Completion Rate', value: `${stats?.completionRate || 0}%`, icon: '📈', color: 'text-cyan-400' },
                            ].map(s => (
                                <div key={s.label} className="glass-card">
                                    <div className="text-2xl mb-2">{s.icon}</div>
                                    <div className={`text-3xl font-black ${s.color} mb-1`}>{s.value}</div>
                                    <div className="text-gray-500 text-sm">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Mode distribution */}
                            {modeData && (
                                <div className="glass-card">
                                    <h2 className="font-bold text-white mb-4">Interviews by Mode</h2>
                                    <Doughnut data={modeData} options={doughnutOptions} />
                                </div>
                            )}

                            {/* Top users */}
                            {topUsersData && (
                                <div className="glass-card">
                                    <h2 className="font-bold text-white mb-4">Top Performers</h2>
                                    <Bar data={topUsersData} options={barOptions} />
                                </div>
                            )}
                        </div>

                        {/* Recent Activity */}
                        {stats?.recentInterviews?.length > 0 && (
                            <div className="glass-card">
                                <h2 className="font-bold text-white mb-4">Recent Activity</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/5">
                                                {['User', 'Role', 'Mode', 'Status', 'Date'].map(h => (
                                                    <th key={h} className="text-left text-xs font-medium text-gray-500 uppercase py-3 pr-4">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.recentInterviews.map(i => (
                                                <tr key={i._id} className="border-b border-white/5">
                                                    <td className="py-3 pr-4 text-white text-sm">{i.user?.name || 'Unknown'}</td>
                                                    <td className="py-3 pr-4 text-gray-400 text-sm">{i.role}</td>
                                                    <td className="py-3 pr-4">
                                                        <span className="badge-primary badge text-xs">{i.mode}</span>
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        <span className={`badge text-xs ${i.status === 'completed' ? 'badge-success' : i.status === 'in-progress' ? 'badge-warning' : 'badge-gray'}`}>
                                                            {i.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-gray-500 text-xs">{new Date(i.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="glass-card animate-in">
                        <h2 className="font-bold text-white mb-6">All Users ({users.length})</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        {['Name', 'Email', 'Role', 'Interviews', 'Avg Score', 'Status', 'Joined', 'Action'].map(h => (
                                            <th key={h} className="text-left text-xs font-medium text-gray-500 uppercase py-3 pr-4">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u._id} className="border-b border-white/5 hover:bg-white/2">
                                            <td className="py-3 pr-4 text-white font-medium text-sm">{u.name}</td>
                                            <td className="py-3 pr-4 text-gray-400 text-sm">{u.email}</td>
                                            <td className="py-3 pr-4">
                                                <span className={u.role === 'admin' ? 'badge-danger' : 'badge-gray'}>{u.role}</span>
                                            </td>
                                            <td className="py-3 pr-4 text-gray-400 text-sm">{u.totalInterviews}</td>
                                            <td className="py-3 pr-4 text-amber-400 font-bold text-sm">{u.averageScore}/100</td>
                                            <td className="py-3 pr-4">
                                                <span className={u.isActive ? 'badge-success' : 'badge-danger'}>
                                                    {u.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td className="py-3">
                                                {u._id !== user?.id && (
                                                    <button
                                                        onClick={() => handleToggleUser(u._id)}
                                                        disabled={toggling === u._id}
                                                        className={`text-xs px-3 py-1 rounded-lg transition-colors ${u.isActive ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}
                                                    >
                                                        {toggling === u._id ? '...' : u.isActive ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Interviews Tab */}
                {activeTab === 'interviews' && (
                    <div className="glass-card animate-in">
                        <h2 className="font-bold text-white mb-6">All Interviews ({interviews.length})</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        {['User', 'Role', 'Level', 'Mode', 'Score', 'Status', 'Flags', 'Date'].map(h => (
                                            <th key={h} className="text-left text-xs font-medium text-gray-500 uppercase py-3 pr-4">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {interviews.map(i => (
                                        <tr key={i._id} className="border-b border-white/5 hover:bg-white/2">
                                            <td className="py-3 pr-4 text-white text-sm">{i.user?.name || 'Unknown'}</td>
                                            <td className="py-3 pr-4 text-gray-400 text-sm">{i.role}</td>
                                            <td className="py-3 pr-4 text-gray-500 text-xs capitalize">{i.experienceLevel}</td>
                                            <td className="py-3 pr-4"><span className="badge-primary badge text-xs">{i.mode}</span></td>
                                            <td className="py-3 pr-4 font-bold text-sm"
                                                style={{ color: i.overallScore >= 75 ? '#34d399' : i.overallScore >= 50 ? '#fbbf24' : '#f87171' }}>
                                                {i.overallScore > 0 ? `${i.overallScore}/100` : '-'}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <span className={`badge text-xs ${i.status === 'completed' ? 'badge-success' : i.status === 'in-progress' ? 'badge-warning' : 'badge-gray'}`}>{i.status}</span>
                                            </td>
                                            <td className="py-3 pr-4">
                                                {i.antiCheatFlags?.length > 0 ? (
                                                    <span className="badge-danger badge text-xs">{i.antiCheatFlags.length} flags</span>
                                                ) : <span className="text-gray-600 text-xs">None</span>}
                                            </td>
                                            <td className="py-3 text-gray-500 text-xs">{new Date(i.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
