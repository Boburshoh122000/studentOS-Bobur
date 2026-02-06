// API Configuration and HTTP Client

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401 && data.error === 'Token expired') {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry the request with new token
            return this.request<T>(endpoint, options);
          }
        }
        return { error: data.error || 'An error occurred' };
      }

      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return { error: 'Network error. Please check your connection.' };
    }
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        return true;
      }
    } catch { }

    // Clear tokens on failure
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return false;
  }

  // HTTP Methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async postFormData<T>(endpoint: string, data: FormData): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: data,
      });
      const responseData = await response.json();
      if (!response.ok) {
        return { error: responseData.error || 'An error occurred' };
      }
      return { data: responseData };
    } catch (error) {
      console.error('API Error:', error);
      return { error: 'Network error. Please check your connection.' };
    }
  }
}

export const api = new ApiClient(API_URL);

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; fullName: string }) =>
    api.post<{ user: any; accessToken: string; refreshToken: string }>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<{ user: any; accessToken: string; refreshToken: string }>('/auth/login', data),

  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),

  me: () =>
    api.get<{ id: string; email: string; role: string; profile: any }>('/auth/me'),

  onboarding: (data: any) =>
    api.post('/auth/onboarding', data),
};

// User API
export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.patch('/users/profile', data),
  getDashboard: () => api.get('/users/dashboard'),
};

// Scholarships API
export const scholarshipApi = {
  list: (params?: { country?: string; studyLevel?: string; search?: string; page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, String(value));
      });
    }
    return api.get(`/scholarships?${searchParams}`);
  },
  get: (id: string) => api.get(`/scholarships/${id}`),
  save: (id: string) => api.post(`/scholarships/${id}/save`),
  unsave: (id: string) => api.delete(`/scholarships/${id}/save`),
  getSaved: () => api.get('/scholarships/saved/list'),
  // Admin methods
  adminList: (params?: { search?: string; status?: string; page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, String(value));
      });
    }
    return api.get(`/scholarships/admin/list?${searchParams}`);
  },
  adminStats: () => api.get('/scholarships/admin/stats'),
  create: (data: any) => api.post('/scholarships', data),
  update: (id: string, data: any) => api.patch(`/scholarships/${id}`, data),
  delete: (id: string) => api.delete(`/scholarships/${id}`),
};

// Jobs API
export const jobApi = {
  list: (params?: { search?: string; locationType?: string; page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, String(value));
      });
    }
    return api.get(`/jobs?${searchParams}`);
  },
  get: (id: string) => api.get(`/jobs/${id}`),
  apply: (id: string, data: { coverLetter?: string; cvUrl?: string }) =>
    api.post(`/jobs/${id}/apply`, data),
  save: (id: string) => api.post(`/jobs/${id}/save`),
  unsave: (id: string) => api.delete(`/jobs/${id}/save`),
  getSaved: () => api.get('/jobs/saved/list'),
  getApplications: () => api.get('/jobs/applications/list'),
  // Employer methods
  getEmployerJobs: () => api.get<any[]>('/jobs/employer/list'),
  updateJob: (id: string, data: any) => api.patch(`/jobs/${id}`, data),
  deleteJob: (id: string) => api.delete(`/jobs/${id}`),
  createJob: (data: any) => api.post('/jobs', data),
};

// Habits API
export const habitApi = {
  list: () => api.get('/habits'),
  create: (data: { title: string; icon?: string; color?: string }) =>
    api.post('/habits', data),
  update: (id: string, data: any) => api.patch(`/habits/${id}`, data),
  delete: (id: string) => api.delete(`/habits/${id}`),
  log: (id: string) => api.post(`/habits/${id}/log`),
  unlog: (id: string) => api.delete(`/habits/${id}/log`),
  getStats: () => api.get('/habits/stats'),
};

// Blog API
export const blogApi = {
  // Public endpoints
  list: (params?: { tag?: string; page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, String(value));
      });
    }
    return api.get(`/blog?${searchParams}`);
  },
  get: (slug: string) => api.get(`/blog/${slug}`),

  // Admin endpoints
  adminList: () => api.get('/blog/admin/list'),
  create: (data: {
    title: string;
    content: string;
    excerpt?: string;
    coverImageUrl?: string;
    tags?: string[];
    status?: 'DRAFT' | 'PUBLISHED';
  }) => api.post('/blog', data),
  update: (id: string, data: {
    title?: string;
    content?: string;
    excerpt?: string;
    coverImageUrl?: string;
    tags?: string[];
    status?: 'DRAFT' | 'PUBLISHED';
  }) => api.patch(`/blog/${id}`, data),
  delete: (id: string) => api.delete(`/blog/${id}`),
};

// Community API
export const communityApi = {
  list: (page?: number) => api.get(`/community?page=${page || 1}`),
  get: (id: string) => api.get(`/community/${id}`),
  create: (data: { content: string; imageUrl?: string }) =>
    api.post('/community', data),
  delete: (id: string) => api.delete(`/community/${id}`),
  like: (id: string) => api.post(`/community/${id}/like`),
  unlike: (id: string) => api.delete(`/community/${id}/like`),
  comment: (id: string, content: string) =>
    api.post(`/community/${id}/comments`, { content }),
};

// AI API
export const aiApi = {
  analyzeCV: (cvText: string, jobDescription?: string) =>
    api.post('/ai/analyze-cv', { cvText, jobDescription }),
  uploadCV: (file: File, jobDescription?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (jobDescription) {
      formData.append('jobDescription', jobDescription);
    }
    return api.postFormData('/ai/upload-cv', formData);
  },
  generateCoverLetter: (data: { jobTitle: string; company: string; jobDescription: string }) =>
    api.post('/ai/cover-letter', data),
  generateLearningPlan: (data: { goal: string; timeframe?: string }) =>
    api.post('/ai/learning-plan', data),
  checkPlagiarism: (text: string) =>
    api.post('/ai/plagiarism-check', { text }),
  generatePresentation: (data: { topic: string; slideCount?: number; style?: string }) =>
    api.post('/ai/generate-presentation', data),
};

// Admin API
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: (params?: { role?: string; search?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, String(value));
      });
    }
    return api.get(`/admin/users?${searchParams}`);
  },
  updateUser: (id: string, data: any) => api.patch(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getEmployers: () => api.get('/admin/employers'),
  getPricing: () => api.get('/admin/pricing'),
  createPricing: (data: any) => api.post('/admin/pricing', data),
  updatePricing: (id: string, data: any) => api.patch(`/admin/pricing/${id}`, data),
  deletePricing: (id: string) => api.delete(`/admin/pricing/${id}`),
  getMessages: () => api.get('/admin/messages'),
  markMessageRead: (id: string) => api.patch(`/admin/messages/${id}`, {}),
};

// Finance API
export const financeApi = {
  getSummary: () => api.get<{ income: number; expense: number; balance: number; recentTransactions: any[] }>('/finance/summary'),
  getTransactions: () => api.get<any[]>('/finance/transactions'),
  createTransaction: (data: { amount: number; type: 'INCOME' | 'EXPENSE'; description?: string; categoryId?: string; date?: string }) =>
    api.post<any>('/finance/transactions', data),
  deleteTransaction: (id: string) => api.delete(`/finance/transactions/${id}`),
  getBudgets: () => api.get<any[]>('/finance/budgets'),
};

// Notification API
export const notificationApi = {
  list: () => api.get<{ notifications: any[]; unreadCount: number }>('/notifications'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`, {}),
  markAllRead: () => api.patch('/notifications/read-all', {}),
  create: (data: any) => api.post('/notifications', data), // For testing
};

// Employer API
export const employerApi = {
  getProfile: () => api.get('/employer/me'),
  updateProfile: (data: any) => api.patch('/employer/me', data),
  getStats: () => api.get<{ activeJobs: number; totalApplicants: number; newApplications: number; shortlisted: number }>('/employer/stats'),
  getApplications: (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, String(value));
      });
    }
    return api.get(`/employer/applications?${searchParams}`);
  },
};
