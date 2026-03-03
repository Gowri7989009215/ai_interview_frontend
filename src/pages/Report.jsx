import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { interviewService } from '../services/interviewService';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
    Chart as ChartJS, RadialLinearScale, PointElement, LineElement,
    Filler, Tooltip, Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const HIRE_COLORS = {
    'Strong Hire': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    'Hire': 'text-green-400 bg-green-500/10 border-green-500/30',
    'Maybe': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    'No Hire': 'text-red-400 bg-red-500/10 border-red-500/30',
};

const SEVERITY_BADGE = {
    low: 'badge-success',
    medium: 'badge-warning',
    high: 'badge-danger',
};

export default function Report() {
    const { id } = useParams();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const { data } = await interviewService.getReport(id);
                setReport(data.report);
            } catch {
                // Try to generate
                setGenerating(true);
                try {
                    const { data } = await interviewService.generateReport(id);
                    setReport(data.report);
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Failed to load report');
                } finally {
                    setGenerating(false);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [id]);

    const handleDownloadPDF = () => {
        if (!report) return;
        const doc = new jsPDF();
        const primaryColor = [99, 102, 241];

        // Header
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('ProInterview AI', 20, 20);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Interview Performance Report', 20, 30);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 130, 30);

        // Score
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Overall Score', 20, 55);
        doc.setFontSize(28);
        doc.setTextColor(...primaryColor);
        doc.text(`${report.overallScore}/100`, 20, 70);

        // Hiring Recommendation
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(`Recommendation: ${report.hiringRecommendation}`, 90, 60);

        // Category Scores
        doc.setFontSize(12);
        doc.text('Category Scores', 20, 90);
        doc.autoTable({
            startY: 95,
            head: [['Category', 'Score', 'Max']],
            body: [
                ['Relevance', report.categoryScores?.relevance || 0, 25],
                ['Technical Depth', report.categoryScores?.technicalDepth || 0, 25],
                ['Clarity', report.categoryScores?.clarity || 0, 25],
                ['Communication', report.categoryScores?.communication || 0, 25],
            ],
            headStyles: { fillColor: primaryColor },
            theme: 'striped',
        });

        const y1 = doc.lastAutoTable.finalY + 10;

        // Performance Summary
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Performance Summary', 20, y1);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const summaryLines = doc.splitTextToSize(report.performanceSummary || '', 170);
        doc.text(summaryLines, 20, y1 + 8);

        const y2 = y1 + 8 + summaryLines.length * 5 + 10;

        // Strengths & Weaknesses
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Strengths', 20, y2);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        (report.strengths || []).forEach((s, i) => {
            doc.text(`• ${s}`, 22, y2 + 8 + i * 6);
        });

        const y3 = y2 + 8 + (report.strengths?.length || 0) * 6 + 8;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Areas for Improvement', 20, y3);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        (report.weaknesses || []).forEach((w, i) => {
            doc.text(`• ${w}`, 22, y3 + 8 + i * 6);
        });

        // New page for Learning Recommendations
        if ((report.learningRecommendations || []).length > 0) {
            doc.addPage();
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text('Learning Recommendations', 20, 20);
            doc.autoTable({
                startY: 25,
                head: [['Topic', 'Priority', 'Resources']],
                body: (report.learningRecommendations || []).map(r => [
                    r.topic, r.priority, (r.resources || []).join(', ')
                ]),
                headStyles: { fillColor: primaryColor },
                theme: 'striped',
                columnStyles: { 2: { cellWidth: 80 } }
            });
        }

        doc.save(`ProInterview-Report-${report.overallScore}.pdf`);
        toast.success('Report downloaded!');
    };

    const radarData = report ? {
        labels: ['Relevance', 'Tech Depth', 'Clarity', 'Communication'],
        datasets: [{
            label: 'Your Score',
            data: [
                (report.categoryScores?.relevance || 0),
                (report.categoryScores?.technicalDepth || 0),
                (report.categoryScores?.clarity || 0),
                (report.categoryScores?.communication || 0),
            ],
            backgroundColor: 'rgba(99,102,241,0.2)',
            borderColor: '#6366f1',
            pointBackgroundColor: '#818cf8',
            borderWidth: 2,
        }]
    } : null;

    const radarOptions = {
        plugins: { legend: { display: false } },
        scales: {
            r: {
                min: 0, max: 25,
                ticks: { color: '#6b7280', backdropColor: 'transparent', stepSize: 5 },
                grid: { color: 'rgba(255,255,255,0.05)' },
                pointLabels: { color: '#9ca3af', font: { size: 12 } }
            }
        }
    };

    if (loading || generating) return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white font-semibold">
                    {generating ? 'Generating your report with AI...' : 'Loading report...'}
                </p>
                <p className="text-gray-400 text-sm mt-2">{generating ? 'This may take a moment' : ''}</p>
            </div>
        </div>
    );

    if (!report) return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center">
            <div className="text-center glass-card max-w-md">
                <div className="text-5xl mb-4">📋</div>
                <h2 className="text-xl font-bold text-white mb-2">Report Not Found</h2>
                <p className="text-gray-400 mb-6">Complete the interview first to generate your report.</p>
                <Link to="/dashboard" className="btn-primary inline-block">Back to Dashboard</Link>
            </div>
        </div>
    );

    const scoreColor = report.overallScore >= 75 ? 'text-emerald-400' : report.overallScore >= 50 ? 'text-amber-400' : 'text-red-400';
    const interview = report.interview;

    return (
        <div className="min-h-screen bg-dark-900">
            <Navbar />
            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link to="/dashboard" className="text-gray-500 hover:text-gray-300 transition-colors text-sm">← Dashboard</Link>
                        </div>
                        <h1 className="text-3xl font-bold text-white">Interview Report</h1>
                        <p className="text-gray-400 mt-1">
                            {interview?.role} • {interview?.mode} mode •{' '}
                            {interview?.completedAt ? new Date(interview.completedAt).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                    <button onClick={handleDownloadPDF} className="btn-secondary flex items-center gap-2">
                        📥 Download PDF
                    </button>
                </div>

                {/* Score + Recommendation */}
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="glass-card text-center md:col-span-1">
                        <div className="text-gray-400 text-sm mb-2">Overall Score</div>
                        <div className={`text-6xl font-black ${scoreColor} mb-2`}>{report.overallScore}</div>
                        <div className="text-gray-500 text-sm">/100</div>
                    </div>

                    <div className="glass-card md:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-white">Hiring Recommendation</h2>
                            <span className={`px-4 py-2 rounded-xl border font-bold text-lg ${HIRE_COLORS[report.hiringRecommendation] || 'text-gray-400'}`}>
                                {report.hiringRecommendation}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Relevance', val: report.categoryScores?.relevance || 0, max: 25 },
                                { label: 'Tech Depth', val: report.categoryScores?.technicalDepth || 0, max: 25 },
                                { label: 'Clarity', val: report.categoryScores?.clarity || 0, max: 25 },
                                { label: 'Communication', val: report.categoryScores?.communication || 0, max: 25 },
                            ].map(({ label, val, max }) => (
                                <div key={label}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-400">{label}</span>
                                        <span className="text-white font-semibold">{val}/{max}</span>
                                    </div>
                                    <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-primary-600 to-violet-500 rounded-full transition-all" style={{ width: `${(val / max) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Radar + Summary */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {radarData && (
                        <div className="glass-card">
                            <h2 className="font-bold text-white mb-4">Skill Radar</h2>
                            <Radar data={radarData} options={radarOptions} />
                        </div>
                    )}
                    <div className="glass-card">
                        <h2 className="font-bold text-white mb-4">Performance Summary</h2>
                        <p className="text-gray-300 text-sm leading-relaxed mb-6">{report.performanceSummary}</p>
                        {report.antiCheatSummary?.isSuspicious && (
                            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-3 text-xs">
                                <div className="text-red-400 font-semibold mb-1">⚠️ Anti-Cheat Alert</div>
                                <p className="text-red-300">{report.antiCheatSummary.flagsCount} suspicious events detected</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="glass-card">
                        <h2 className="font-bold text-white mb-4">✅ Strengths</h2>
                        <ul className="space-y-2">
                            {report.strengths?.map((s, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                    <span className="text-emerald-400 mt-0.5 flex-shrink-0">●</span> {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="glass-card">
                        <h2 className="font-bold text-white mb-4">⚠️ Areas to Improve</h2>
                        <ul className="space-y-2">
                            {report.weaknesses?.map((w, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                    <span className="text-amber-400 mt-0.5 flex-shrink-0">●</span> {w}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Skill Gaps */}
                {report.skillGaps?.length > 0 && (
                    <div className="glass-card mb-6">
                        <h2 className="font-bold text-white mb-4">🔍 Skill Gap Analysis</h2>
                        <div className="space-y-3">
                            {report.skillGaps.map((gap, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 bg-dark-700 rounded-xl">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-white font-medium">{gap.skill}</span>
                                            <span className={SEVERITY_BADGE[gap.severity]}>{gap.severity}</span>
                                        </div>
                                        <p className="text-gray-400 text-sm">{gap.recommendation}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Learning Recommendations */}
                {report.learningRecommendations?.length > 0 && (
                    <div className="glass-card mb-6">
                        <h2 className="font-bold text-white mb-4">📚 Learning Roadmap</h2>
                        <div className="space-y-4">
                            {report.learningRecommendations.map((rec, i) => (
                                <div key={i} className="p-4 bg-dark-700 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-white font-semibold">{rec.topic}</span>
                                        <span className={SEVERITY_BADGE[rec.priority]}>{rec.priority} priority</span>
                                    </div>
                                    {rec.resources?.length > 0 && (
                                        <ul className="text-gray-400 text-sm space-y-1">
                                            {rec.resources.map((r, j) => <li key={j}>📖 {r}</li>)}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/interview/setup" className="btn-primary flex-1 text-center">🚀 Start New Interview</Link>
                    <Link to="/dashboard" className="btn-secondary flex-1 text-center">← Dashboard</Link>
                    <button onClick={handleDownloadPDF} className="btn-secondary flex-1">📥 Download PDF Report</button>
                </div>
            </div>
        </div>
    );
}
