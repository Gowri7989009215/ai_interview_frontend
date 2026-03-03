import api from './api';

export const interviewService = {
    // Interviews
    startInterview: (data) => api.post('/interview/start', data),
    getInterview: (id) => api.get(`/interview/${id}`),
    getUserInterviews: () => api.get('/interview'),
    getInterviewQuestions: (id) => api.get(`/interview/${id}/questions`),
    completeInterview: (id) => api.put(`/interview/${id}/complete`),
    flagAntiCheat: (id, data) => api.post(`/interview/${id}/flag`, data),

    // Questions
    getNextQuestion: (data) => api.post('/questions/next', data),

    // Answers
    submitAnswer: (data) => api.post('/answers/submit', data),
    getInterviewAnswers: (id) => api.get(`/answers/${id}`),

    // Reports
    generateReport: (interviewId) => api.post(`/reports/generate/${interviewId}`),
    getReport: (interviewId) => api.get(`/reports/${interviewId}`),
    getUserReports: () => api.get('/reports/my'),

    // Resume
    uploadResume: (formData) => api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getResumes: () => api.get('/resume'),
    getResume: (id) => api.get(`/resume/${id}`),
    deleteResume: (id) => api.delete(`/resume/${id}`),

    // Coding
    getCodingProblem: (level) => api.get(`/coding/problem/${level}`),
    evaluateCodingSolution: (data) => api.post('/coding/evaluate', data),
};

export const adminService = {
    getStats: () => api.get('/admin/stats'),
    getAllUsers: () => api.get('/admin/users'),
    getAllInterviews: () => api.get('/admin/interviews'),
    toggleUserStatus: (id) => api.patch(`/admin/users/${id}/toggle`),
};
