import { useState, useEffect } from 'react';
import { interviewService } from '../services/interviewService';
import toast from 'react-hot-toast';

export default function ResumeUpload({ onResumeSelected, selectedResumeId }) {
    const [resumes, setResumes] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            const { data } = await interviewService.getResumes();
            setResumes(data.resumes || []);
        } catch {
            // Non-critical
        }
    };

    const handleFile = async (file) => {
        if (!file) return;
        if (file.type !== 'application/pdf') return toast.error('Only PDF files are allowed');
        if (file.size > 5 * 1024 * 1024) return toast.error('File size must be under 5MB');

        setUploading(true);
        const formData = new FormData();
        formData.append('resume', file);

        try {
            const { data } = await interviewService.uploadResume(formData);
            setResumes(prev => [data.resume, ...prev]);
            onResumeSelected(data.resume.id);
            toast.success('Resume uploaded and parsed successfully! 🎉');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-white mb-1">Resume (Optional)</h2>
            <p className="text-gray-500 text-sm mb-4">Upload your resume to get personalized interview questions</p>

            {/* Upload Zone */}
            <label
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-8 px-6 cursor-pointer transition-all duration-200 mb-4
          ${dragOver ? 'border-primary-400 bg-primary-500/10' : 'border-dark-400 hover:border-primary-500/50 hover:bg-dark-700'}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
            >
                <input type="file" accept=".pdf" className="hidden" onChange={e => handleFile(e.target.files[0])} disabled={uploading} />
                {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-primary-400 font-medium">Uploading & parsing with AI...</p>
                        <p className="text-gray-500 text-xs">This may take a moment</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="text-4xl mb-2">📄</div>
                        <p className="text-white font-medium">Drag & drop your PDF or click to browse</p>
                        <p className="text-gray-500 text-xs">PDF only, max 5MB</p>
                    </div>
                )}
            </label>

            {/* Existing Resumes */}
            {resumes.length > 0 && (
                <div>
                    <p className="text-sm font-medium text-gray-400 mb-3">Or select a previous resume:</p>
                    <div className="space-y-2">
                        {resumes.map(r => (
                            <button
                                key={r._id || r.id}
                                onClick={() => onResumeSelected(r._id || r.id)}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all
                  ${selectedResumeId === (r._id || r.id)
                                        ? 'border-primary-500 bg-primary-500/10'
                                        : 'border-dark-400 hover:border-dark-300 bg-dark-700'
                                    }`}
                            >
                                <span className="text-2xl">📄</span>
                                <div className="text-left flex-1">
                                    <div className="text-white text-sm font-medium truncate">{r.originalFileName}</div>
                                    <div className="text-gray-500 text-xs">
                                        {r.parsedData?.skills?.slice(0, 3).join(', ')}{r.parsedData?.skills?.length > 3 ? '...' : ''}
                                    </div>
                                </div>
                                {selectedResumeId === (r._id || r.id) && (
                                    <span className="text-emerald-400 font-bold text-sm">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Skip option */}
            <button
                onClick={() => onResumeSelected(null)}
                className={`w-full mt-3 py-2 rounded-xl text-sm transition-colors
          ${!selectedResumeId ? 'text-primary-400 border border-primary-500/30' : 'text-gray-600 hover:text-gray-400'}`}
            >
                {!selectedResumeId ? '✓ No resume selected (generic questions)' : 'Skip resume'}
            </button>
        </div>
    );
}
