import api from './api';

export const interviewService = {
    startInterview: (data) => api.post('/interview/start', data),
    getInterview: (id) => api.get(`/interview/${id}`),
    getUserInterviews: () => api.get('/interview'),
    completeInterview: (id) => api.put(`/interview/${id}/complete`),
    flagAntiCheat: (id, data) => api.post(`/interview/${id}/flag`, data),

    getNextQuestion: (data) => api.post('/questions/next', data),
    getInterviewQuestions: (id) => api.get(`/questions/interview/${id}`),

    submitAnswer: (data) => api.post('/answers/submit', data),
    getInterviewAnswers: (id) => api.get(`/answers/interview/${id}`),

    generateReport: (interviewId) => api.post(`/reports/generate/${interviewId}`),
    getReport: (interviewId) => api.get(`/reports/${interviewId}`),
    getUserReports: () => api.get('/reports'),

    uploadResume: (formData) => api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getResumes: () => api.get('/resume'),
    getResume: (id) => api.get(`/resume/${id}`),
    deleteResume: (id) => api.delete(`/resume/${id}`),

    getCodingProblem: (level) => api.get(`/coding/problems?level=${level}`),
    evaluateCodingSolution: (data) => api.post('/coding/evaluate', data),
};

export const adminService = {
    getStats: () => api.get('/admin/stats'),
    getAllUsers: (page = 1) => api.get(`/admin/users?page=${page}`),
    getUserDetails: (id) => api.get(`/admin/users/${id}`),
    toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle`),
    getAllInterviews: () => api.get('/admin/interviews'),
};
