import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { interviewService } from '../services/interviewService';
import Navbar from '../components/Navbar';
import Timer from '../components/Timer';
import toast from 'react-hot-toast';

const STARTER_CODE = `// Write your solution here
function solution(input) {
  // Your code here
  
}

// Test your solution
console.log(solution("example input"));
`;

export default function CodingRound() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState(STARTER_CODE);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [interview, setInterview] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: iData } = await interviewService.getInterview(id);
                setInterview(iData.interview);

                const levelMap = { fresher: 'easy', junior: 'easy', mid: 'medium', senior: 'hard', lead: 'hard' };
                const level = levelMap[iData.interview.experienceLevel] || 'medium';

                const { data } = await interviewService.getCodingProblem(level);
                setProblem(data.problem);
            } catch {
                toast.error('Failed to load coding problem');
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSubmit = async () => {
        if (!code.trim() || code === STARTER_CODE) return toast.error('Please write your solution');
        setLoading(true);
        setResult(null);
        try {
            const { data } = await interviewService.evaluateCodingSolution({
                problem: problem?.description,
                solution: code,
                testCases: problem?.testCases,
                interviewId: id
            });
            setResult(data.result);
            if (data.result.passed) {
                toast.success(`All tests passed! Score: ${data.result.score}/100 🎉`);
            } else {
                toast.error(`Some tests failed. Score: ${data.result.score}/100`);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Evaluation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleFinish = async () => {
        try {
            await interviewService.completeInterview(id);
            const { data } = await interviewService.generateReport(id);
            toast.success('Coding round complete! Generating report...');
            navigate(`/report/${id}`);
        } catch {
            navigate(`/report/${id}`);
        }
    };

    if (fetching) return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-dark-900 flex flex-col">
            <Navbar minimal />

            {/* Top bar */}
            <div className="glass border-b border-white/5 px-6 py-3">
                <div className="max-w-full flex items-center justify-between">
                    <div>
                        <span className="text-white font-semibold">{interview?.role}</span>
                        <span className="text-gray-500 text-sm ml-2">• Coding Round</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Timer duration={1800} running={!result} />
                        <button onClick={handleSubmit} disabled={loading} className="btn-primary text-sm py-2 px-5 flex items-center gap-2">
                            {loading ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Running...</> : '▶ Run & Submit'}
                        </button>
                        {result && (
                            <button onClick={handleFinish} className="btn-secondary text-sm py-2 px-5">
                                Finish →
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Problem Panel */}
                <div className="w-80 xl:w-96 flex-shrink-0 border-r border-white/5 overflow-y-auto">
                    <div className="p-6 space-y-5">
                        {problem ? (
                            <>
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <h2 className="text-xl font-bold text-white">{problem.title}</h2>
                                    </div>
                                    <p className="text-gray-400 text-sm leading-relaxed">{problem.description}</p>
                                </div>

                                {problem.examples?.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-300 mb-2">Examples</h3>
                                        {problem.examples.map((ex, i) => (
                                            <div key={i} className="bg-dark-700 rounded-xl p-4 mb-2 text-sm font-mono">
                                                <div className="text-gray-400 mb-1">Input: <span className="text-white">{ex.input}</span></div>
                                                <div className="text-gray-400">Output: <span className="text-emerald-400">{ex.output}</span></div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {problem.testCases?.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-300 mb-2">Test Cases</h3>
                                        {problem.testCases.map((tc, i) => (
                                            <div key={i} className="bg-dark-700 rounded-xl p-3 mb-2 text-xs font-mono">
                                                <span className="text-gray-500">Input:</span> <span className="text-white">{tc.input}</span>
                                                <br />
                                                <span className="text-gray-500">Expected:</span> <span className="text-emerald-400">{tc.expectedOutput}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Results */}
                                {result && (
                                    <div className="animate-in">
                                        <h3 className="text-sm font-semibold text-gray-300 mb-3">Results</h3>
                                        <div className={`rounded-xl p-4 border mb-3 ${result.passed ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                                            <div className={`font-bold text-lg mb-1 ${result.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {result.passed ? '✅ All Tests Passed' : '❌ Some Tests Failed'}
                                            </div>
                                            <div className="text-2xl font-black text-white">{result.score}<span className="text-sm text-gray-500">/100</span></div>
                                        </div>

                                        {result.testResults?.map((tr, i) => (
                                            <div key={i} className={`text-xs p-2 rounded-lg mb-1 ${tr.passed ? 'bg-emerald-900/10 text-emerald-400' : 'bg-red-900/10 text-red-400'}`}>
                                                {tr.passed ? '✓' : '✗'} Test {i + 1}: {tr.passed ? 'Passed' : 'Failed'}
                                            </div>
                                        ))}

                                        {result.feedback && (
                                            <div className="bg-dark-700 rounded-xl p-4 mt-3">
                                                <div className="text-xs text-gray-500 mb-2 font-medium">Feedback</div>
                                                <p className="text-gray-300 text-xs leading-relaxed">{result.feedback.overall}</p>
                                                {result.feedback.timeComplexity && (
                                                    <div className="mt-2 flex gap-4 text-xs">
                                                        <span className="text-gray-500">Time: <span className="text-primary-400 font-mono">{result.feedback.timeComplexity}</span></span>
                                                        <span className="text-gray-500">Space: <span className="text-primary-400 font-mono">{result.feedback.spaceComplexity}</span></span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-gray-500 text-sm">Loading problem...</div>
                        )}
                    </div>
                </div>

                {/* Editor */}
                <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-3 px-4 py-2 border-b border-white/5 bg-dark-800">
                        <span className="text-xs text-gray-500 font-mono">solution.js</span>
                        <span className="badge-primary badge text-xs">JavaScript</span>
                    </div>
                    <div className="flex-1">
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            value={code}
                            onChange={(val) => setCode(val || '')}
                            theme="vs-dark"
                            options={{
                                fontSize: 14,
                                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                                fontLigatures: true,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                padding: { top: 16, bottom: 16 },
                                lineNumbers: 'on',
                                renderLineHighlight: 'all',
                                contextmenu: false,
                                wordWrap: 'on',
                                smoothScrolling: true,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
