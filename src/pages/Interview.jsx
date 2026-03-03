import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewService } from '../services/interviewService';
import Navbar from '../components/Navbar';
import Timer from '../components/Timer';
import VoiceInput from '../components/VoiceInput';
import AntiCheat from '../components/AntiCheat';
import toast from 'react-hot-toast';

const TOTAL_QUESTIONS = 8;

export default function Interview() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [interview, setInterview] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [questionNum, setQuestionNum] = useState(1);
    const [answer, setAnswer] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingNext, setIsLoadingNext] = useState(false);
    const [lastScore, setLastScore] = useState(null);
    const [lastFeedback, setLastFeedback] = useState(null);
    const [phase, setPhase] = useState('answering'); // answering | reviewed
    const [answerStartTime, setAnswerStartTime] = useState(Date.now());
    const [antiCheatData, setAntiCheatData] = useState({ copyPasteDetected: false, tabSwitches: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInterview = async () => {
            try {
                const { data } = await interviewService.getInterview(id);
                setInterview(data.interview);
                // Get current question
                const { data: qData } = await interviewService.getInterviewQuestions(id);
                if (qData.questions && qData.questions.length > 0) {
                    const unanswered = qData.questions.find(q => !q.isAnswered);
                    if (unanswered) {
                        setCurrentQuestion(unanswered);
                        setQuestionNum(unanswered.questionNumber);
                    } else if (qData.questions.length >= TOTAL_QUESTIONS) {
                        handleFinish();
                        return;
                    } else {
                        await fetchNextQuestion(data.interview, qData.questions.length);
                    }
                }
            } catch {
                toast.error('Failed to load interview');
                navigate('/dashboard');
            } finally {
                setLoading(false);
                setAnswerStartTime(Date.now());
            }
        };
        fetchInterview();
    }, [id]);

    const fetchNextQuestion = async (interviewData, currentCount, score) => {
        setIsLoadingNext(true);
        try {
            const { data } = await interviewService.getNextQuestion({
                interviewId: id,
                currentScore: score
            });
            setCurrentQuestion(data.question);
            setQuestionNum(data.question.questionNumber);
            setAnswer('');
            setLastScore(null);
            setLastFeedback(null);
            setPhase('answering');
            setAnswerStartTime(Date.now());
        } catch {
            toast.error('Failed to generate next question');
        } finally {
            setIsLoadingNext(false);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!answer.trim()) return toast.error('Please provide an answer');
        if (answer.trim().length < 10) return toast.error('Answer is too short');

        setIsSubmitting(true);
        const timeTaken = Math.floor((Date.now() - answerStartTime) / 1000);

        try {
            const { data } = await interviewService.submitAnswer({
                interviewId: id,
                questionId: currentQuestion._id,
                text: answer.trim(),
                inputMethod: 'text',
                timeTaken,
                antiCheatData
            });

            setLastScore(data.answer.scores);
            setLastFeedback(data.answer.feedback);
            setPhase('reviewed');

            const total = data.answer.scores.total;
            if (total >= 75) toast.success(`Great answer! Score: ${total}/100 🎉`);
            else if (total >= 50) toast(`Good answer! Score: ${total}/100`);
            else toast.error(`Score: ${total}/100 - Check the feedback to improve`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to evaluate answer');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = async () => {
        if (questionNum >= TOTAL_QUESTIONS) {
            await handleFinish();
        } else {
            await fetchNextQuestion(interview, questionNum, lastScore?.total);
        }
    };

    const handleFinish = async () => {
        try {
            await interviewService.completeInterview(id);
            toast.success('Interview completed! Generating your report...');
            await interviewService.generateReport(id);
            navigate(`/report/${id}`);
        } catch {
            toast.error('Failed to complete interview');
            navigate('/dashboard');
        }
    };

    const handleVoiceText = (text) => {
        setAnswer(prev => prev ? prev + ' ' + text : text);
    };

    const handleAntiCheat = (event) => {
        setAntiCheatData(prev => ({
            copyPasteDetected: event.type === 'copy-paste' || prev.copyPasteDetected,
            tabSwitches: event.type === 'tab-switch' ? prev.tabSwitches + 1 : prev.tabSwitches
        }));
        interviewService.flagAntiCheat(id, { type: event.type, details: event.details });
    };

    const getDifficultyColor = (d) =>
        ({ easy: 'badge-success', medium: 'badge-warning', hard: 'badge-danger' }[d] || 'badge-gray');

    const getTypeColor = (t) =>
        ({ technical: 'badge-primary', behavioral: 'badge-success', coding: 'badge-warning', situational: 'badge-gray' }[t] || 'badge-gray');

    const getScoreLabel = (s) =>
        s >= 75 ? { label: 'Excellent', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' }
            : s >= 50 ? { label: 'Good', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' }
                : { label: 'Needs Work', color: 'text-red-400 border-red-500/30 bg-red-500/10' };

    if (loading) return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading your interview...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-dark-900 flex flex-col">
            <AntiCheat onEvent={handleAntiCheat} />
            <Navbar minimal />

            {/* Interview Header */}
            <div className="glass border-b border-white/5 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <div className="text-white font-semibold">{interview?.role}</div>
                            <div className="text-gray-500 text-xs capitalize">{interview?.experienceLevel} • {interview?.mode}</div>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-400">
                            Question <span className="text-white font-bold">{questionNum}</span> / {TOTAL_QUESTIONS}
                        </div>
                        <div className="w-32 h-2 bg-dark-600 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary-600 to-violet-600 rounded-full transition-all duration-500"
                                style={{ width: `${(questionNum / TOTAL_QUESTIONS) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <Timer onTimeUp={() => {
                        if (phase === 'answering' && answer.trim()) handleSubmitAnswer();
                        else if (phase === 'answering') toast.error('Time is up!');
                    }} duration={180} running={phase === 'answering' && !isSubmitting} />
                </div>
            </div>

            <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 space-y-6">
                {/* Question Card */}
                <div className="glass-card border-l-4 border-primary-500">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl font-black text-primary-500/30">Q{questionNum}</span>
                        <div className="flex items-center gap-2 flex-wrap">
                            {currentQuestion?.difficulty && (
                                <span className={getDifficultyColor(currentQuestion.difficulty)}>
                                    {currentQuestion.difficulty}
                                </span>
                            )}
                            {currentQuestion?.type && (
                                <span className={getTypeColor(currentQuestion.type)}>
                                    {currentQuestion.type}
                                </span>
                            )}
                            {currentQuestion?.topic && (
                                <span className="badge badge-gray">{currentQuestion.topic}</span>
                            )}
                        </div>
                    </div>
                    {isLoadingNext ? (
                        <div className="flex items-center gap-3 text-gray-400">
                            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                            Generating next question...
                        </div>
                    ) : (
                        <p className="text-white text-lg leading-relaxed font-medium">
                            {currentQuestion?.text}
                        </p>
                    )}
                </div>

                {/* Answer Phase */}
                {phase === 'answering' && !isLoadingNext && (
                    <div className="space-y-4 animate-in">
                        <div className="glass-card">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-medium text-gray-300">Your Answer</label>
                                <span className="text-xs text-gray-500">{answer.length} chars</span>
                            </div>
                            <textarea
                                value={answer}
                                onChange={e => setAnswer(e.target.value)}
                                onPaste={() => {
                                    setAntiCheatData(prev => ({ ...prev, copyPasteDetected: true }));
                                    interviewService.flagAntiCheat(id, { type: 'copy-paste', details: 'Paste detected in answer' });
                                    toast('Copy-paste detected and logged', { icon: '⚠️' });
                                }}
                                placeholder="Type your answer here or use voice input below..."
                                rows={6}
                                className="input-field resize-none font-sans text-base leading-relaxed"
                            />
                        </div>

                        <VoiceInput onTranscript={handleVoiceText} />

                        <div className="flex gap-3">
                            <button
                                onClick={handleSubmitAnswer}
                                disabled={isSubmitting || !answer.trim()}
                                className="btn-primary flex-1 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Evaluating...</>
                                ) : 'Submit Answer →'}
                            </button>
                            <button
                                onClick={handleFinish}
                                className="btn-secondary px-4"
                                title="End interview early"
                            >
                                End
                            </button>
                        </div>
                    </div>
                )}

                {/* Review Phase */}
                {phase === 'reviewed' && lastScore && lastFeedback && (
                    <div className="space-y-4 animate-in">
                        {/* Score Overview */}
                        <div className="glass-card">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">Answer Evaluation</h3>
                                <div className={`px-4 py-2 rounded-xl border font-bold text-2xl ${getScoreLabel(lastScore.total).color}`}>
                                    {lastScore.total}<span className="text-sm font-normal">/100</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                {[
                                    { label: 'Relevance', score: lastScore.relevance, max: 25 },
                                    { label: 'Tech Depth', score: lastScore.technicalDepth, max: 25 },
                                    { label: 'Clarity', score: lastScore.clarity, max: 25 },
                                    { label: 'Communication', score: lastScore.communication, max: 25 },
                                ].map(({ label, score, max }) => (
                                    <div key={label} className="text-center">
                                        <div className="text-2xl font-black text-primary-400">{score}<span className="text-sm text-gray-500">/{max}</span></div>
                                        <div className="text-gray-500 text-xs mt-1">{label}</div>
                                        <div className="mt-2 h-1 bg-dark-600 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(score / max) * 100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <div className="bg-dark-700 rounded-xl p-4">
                                    <div className="text-sm font-medium text-gray-300 mb-2">📝 Overall Feedback</div>
                                    <p className="text-gray-300 text-sm leading-relaxed">{lastFeedback.overall}</p>
                                </div>
                                {lastFeedback.strengths?.length > 0 && (
                                    <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-4">
                                        <div className="text-sm font-medium text-emerald-400 mb-2">✅ Strengths</div>
                                        <ul className="space-y-1">
                                            {lastFeedback.strengths.map((s, i) => <li key={i} className="text-gray-300 text-sm">• {s}</li>)}
                                        </ul>
                                    </div>
                                )}
                                {lastFeedback.improvements?.length > 0 && (
                                    <div className="bg-amber-900/20 border border-amber-500/20 rounded-xl p-4">
                                        <div className="text-sm font-medium text-amber-400 mb-2">💡 Improvements</div>
                                        <ul className="space-y-1">
                                            {lastFeedback.improvements.map((imp, i) => <li key={i} className="text-gray-300 text-sm">• {imp}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={isLoadingNext}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {isLoadingNext ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Loading next question...</>
                            ) : questionNum >= TOTAL_QUESTIONS ? '🏁 Finish & Get Report' : `Next Question (${questionNum + 1}/${TOTAL_QUESTIONS}) →`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
