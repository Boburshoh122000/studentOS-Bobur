// API Configuration and HTTP Client

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    _retryCount = 0
  ): Promise<ApiResponse<T>> {
    const MAX_RETRIES = 3;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
      });

      // Safely parse JSON — non-JSON bodies (e.g. 504 HTML gateway pages) throw
      // a SyntaxError which is NOT a TypeError, causing misleading "Network error"
      let data: any;
      try {
        data = await response.json();
      } catch {
        if (response.status === 504 || response.status === 502) {
          return { error: 'The request timed out. Please try again in a moment.' };
        }
        if (!response.ok) {
          return { error: `Server error (${response.status}). Please try again.` };
        }
        return { error: 'Unexpected response from server. Please try again.' };
      }

      if (!response.ok) {
        // Handle token expiration
        if (
          response.status === 401 &&
          (data.error === 'Token expired' || data.error === 'No token provided')
        ) {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry the request with new token
            return this.request<T>(endpoint, options);
          }
        }
        return { data, error: data.error || 'An error occurred' };
      }

      return { data };
    } catch (error) {
      // Auto-retry on network errors (server unreachable = cold start)
      if (error instanceof TypeError && _retryCount < MAX_RETRIES) {
        const delay = (_retryCount + 1) * 3000; // 3s, 6s, 9s
        console.warn(
          `[API] Server unreachable, retrying in ${delay / 1000}s... (attempt ${_retryCount + 1}/${MAX_RETRIES})`
        );
        await new Promise((r) => setTimeout(r, delay));
        return this.request<T>(endpoint, options, _retryCount + 1);
      }

      console.error(`[API] Request failed: ${this.baseUrl}${endpoint}`, error);
      return {
        error:
          error instanceof TypeError
            ? `Server is waking up. Please try again in a moment.`
            : 'Request failed. Please check your connection and try again.',
      };
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      // refreshToken cookie is sent automatically via credentials: 'include'
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      return response.ok;
    } catch {
      return false;
    }
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

  // Upload files as multipart/form-data (no JSON Content-Type)
  async postFormData<T>(
    endpoint: string,
    formData: FormData,
    _retryCount = 0
  ): Promise<ApiResponse<T>> {
    const MAX_RETRIES = 3;
    // Do NOT set Content-Type — browser sets multipart/form-data + boundary
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      let data: any;
      try {
        data = await response.json();
      } catch {
        if (response.status === 504 || response.status === 502) {
          return { error: 'The request timed out. Please try again in a moment.' };
        }
        if (!response.ok) {
          return { error: `Server error (${response.status}). Please try again.` };
        }
        return { error: 'Unexpected response from server. Please try again.' };
      }

      if (!response.ok) {
        return { error: data.error || 'An error occurred' };
      }
      return { data };
    } catch (error) {
      // Retry on network errors (cold start / flaky mobile connection)
      if (error instanceof TypeError && _retryCount < MAX_RETRIES) {
        const delay = (_retryCount + 1) * 3000;
        console.warn(
          `[API] FormData upload unreachable, retrying in ${delay / 1000}s... (attempt ${_retryCount + 1}/${MAX_RETRIES})`
        );
        await new Promise((r) => setTimeout(r, delay));
        return this.postFormData<T>(endpoint, formData, _retryCount + 1);
      }
      console.error(`[API] FormData request failed: ${this.baseUrl}${endpoint}`, error);
      return {
        error:
          error instanceof TypeError
            ? 'Server is waking up. Please try again in a moment.'
            : 'Upload failed. Please check your connection and try again.',
      };
    }
  }

  async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient(API_URL);

// Auth API
export const authApi = {
  sendOtp: (data: { email: string }) => api.post<{ message: string }>('/auth/send-otp', data),

  verifyOtp: (data: { email: string; code: string }) =>
    api.post<{ verified: boolean }>('/auth/verify-otp', data),

  verifyEmail: (data: { email: string; otpCode: string }) =>
    api.post<{ accessToken: string; refreshToken: string }>('/auth/verify-email', data),

  register: (data: {
    email: string;
    password: string;
    fullName: string;
    otpCode?: string;
    referralCode?: string;
  }) => api.post<{ user: any; accessToken: string; refreshToken: string }>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<{ user: any; accessToken: string; refreshToken: string }>('/auth/login', data),

  logout: () => api.post('/auth/logout', {}),

  me: () => api.get<{ id: string; email: string; role: string; profile: any }>('/auth/me'),

  onboarding: (data: {
    role: 'student' | 'educator' | 'organization';
    university?: string;
    major?: string;
    institution?: string;
    department?: string;
    companyName?: string;
    industry?: string;
    website?: string;
  }) =>
    api.post<{
      user: any;
      accessToken: string;
      refreshToken: string;
      redirectTo: string;
    }>('/auth/onboarding', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post<{ message: string }>('/auth/change-password', data),

  updateEmail: (data: { newEmail: string; password: string }) =>
    api.post<{ message: string }>('/auth/update-email', data),

  deleteAccount: () => api.delete<{ message: string }>('/auth/account'),

  forgotPassword: (data: { email: string }) =>
    api.post<{ message: string }>('/auth/forgot-password', data),
  resetPassword: (data: { token: string; password: string }) =>
    api.post<{ message: string }>('/auth/reset-password', data),

  googleCallback: (data: {
    supabaseAccessToken: string;
    email: string;
    fullName: string;
    avatarUrl: string;
    providerId: string;
  }) =>
    api.post<{
      user: {
        id: string;
        email: string;
        role: string;
        profile: { fullName?: string; avatarUrl?: string } | null;
      };
      accessToken: string;
      refreshToken: string;
      isNewUser: boolean;
    }>('/auth/google-callback', data),
};

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.patch('/users/profile', data),
  getDashboard: () => api.get('/users/dashboard'),
  claimTelegramCredits: () => api.post('/users/claim-telegram-credits'),
  getTelegramStatus: () => api.get('/users/telegram/status'),
  generateTelegramCode: () => api.post('/users/telegram/generate-code'),
  disconnectTelegram: () => api.delete('/users/telegram/disconnect'),
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
  bulkDelete: (ids: string[]) =>
    api.post<{ success: boolean; deleted_count: number }>('/scholarships/bulk-delete', { ids }),
};

// Jobs API
export const jobApi = {
  list: (params?: Record<string, string | number | undefined>) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
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
  create: (data: { title: string; icon?: string; color?: string }) => api.post('/habits', data),
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
  incrementView: (id: string) => api.patch(`/blog/${id}/view`, {}),

  // Admin endpoints
  adminList: () => api.get('/blog/admin/list'),
  create: (data: {
    title: string;
    content: string;
    excerpt?: string;
    coverImageUrl?: string;
    tags?: string[];
    status?: 'DRAFT' | 'PUBLISHED';
    authorName?: string;
  }) => api.post('/blog', data),
  update: (
    id: string,
    data: {
      title?: string;
      content?: string;
      excerpt?: string;
      coverImageUrl?: string;
      tags?: string[];
      status?: 'DRAFT' | 'PUBLISHED';
      authorName?: string;
    }
  ) => api.patch(`/blog/${id}`, data),
  delete: (id: string) => api.delete(`/blog/${id}`),
};

// Community API
export const communityApi = {
  list: (page?: number) => api.get(`/community?page=${page || 1}`),
  get: (id: string) => api.get(`/community/${id}`),
  create: (data: { content: string; imageUrl?: string }) => api.post('/community', data),
  delete: (id: string) => api.delete(`/community/${id}`),
  like: (id: string) => api.post(`/community/${id}/like`),
  unlike: (id: string) => api.delete(`/community/${id}/like`),
  comment: (id: string, content: string) => api.post(`/community/${id}/comments`, { content }),
};

// AI API
export const aiApi = {
  analyzeCV: (cvText: string, jobDescription?: string, fileName?: string) =>
    api.post('/ai/analyze-cv', { cvText, jobDescription, fileName }),
  extractText: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.postFormData<{
      extractedText: string;
      fileName: string;
      fileSize: number;
      truncated: boolean;
    }>('/ai/extract-text', formData);
  },
  uploadCV: (file: File, jobDescription?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (jobDescription) {
      formData.append('jobDescription', jobDescription);
    }
    return api.postFormData('/ai/upload-cv', formData);
  },
  generateLearningPlan: (data: { goal: string; timeframe?: string }) =>
    api.post('/ai/learning-plan', data),
  checkPlagiarism: (text: string, modules?: string[], documentName?: string) =>
    api.post('/ai/plagiarism-check', { text, modules, documentName }),
  getPlagiarismHistory: () => api.get('/ai/plagiarism-history'),
  getPlagiarismReport: (id: string) => api.get(`/ai/plagiarism-report/${id}`),
  deletePlagiarismDocument: (id: string) => api.delete(`/ai/plagiarism-document/${id}`),
  getPlagiarismCost: (wordCount: number) => api.post('/ai/plagiarism-cost', { wordCount }),
  generatePresentation: (data: { topic: string; slideCount?: number; style?: string }) =>
    api.post('/ai/generate-presentation', data),
  getAtsHistory: () =>
    api.get<{
      success: boolean;
      data: Array<{
        id: string;
        score: number;
        jobRole: string | null;
        fileName: string | null;
        createdAt: string;
      }>;
    }>('/ai/ats-history'),
  getAtsScan: (id: string) =>
    api.get<{
      success: boolean;
      data: {
        id: string;
        score: number;
        jobRole: string | null;
        fileName: string | null;
        result: any;
        createdAt: string;
      };
    }>(`/ai/ats-history/${id}`),
  deleteAtsScan: (id: string) => api.delete<{ success: boolean }>(`/ai/ats-history/${id}`),
  getCareerActivity: () =>
    api.get<{
      success: boolean;
      activities: Array<{
        id: string;
        type: string;
        title: string;
        description: string;
        score: number | null;
        status: string | null;
        timestamp: string;
        scanId: string;
      }>;
    }>('/ai/career-activity'),
  getAcademicActivity: () =>
    api.get<{
      success: boolean;
      activities: Array<{
        id: string;
        type: 'plagiarism_check' | 'learning_plan';
        title: string;
        score?: number | null;
        isOriginal?: boolean | null;
        durationWeeks?: number;
        progress?: number;
        timestamp: string;
      }>;
      stats: {
        totalChecks: number;
        totalPlans: number;
        avgOriginalityScore: number | null;
      };
    }>('/ai/academic-activity'),
};

// Learning Plan API
export const learningPlanApi = {
  getActive: () => api.get('/learning-plans'),
  generate: (data: { topic: string; goal?: string; duration: string; difficulty?: string }) =>
    api.post('/learning-plans/generate', data),
  toggleResource: (id: string) => api.patch(`/learning-plans/resources/${id}/toggle`, {}),
  deletePlan: (id: string) => api.delete(`/learning-plans/${id}`),
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
  getEmployerStats: () => api.get('/admin/employers/stats'),
  getEmployers: (params?: Record<string, string | number | undefined>) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    return api.get(`/admin/employers?${searchParams}`);
  },
  createEmployer: (data: {
    email: string;
    companyName: string;
    industry?: string;
    website?: string;
    repName?: string;
  }) => api.post('/admin/employers', data),
  updateEmployer: (id: string, data: Record<string, unknown>) =>
    api.patch(`/admin/employers/${id}`, data),
  deleteEmployer: (id: string) => api.delete(`/admin/employers/${id}`),
  getPricing: () => api.get('/admin/pricing'),
  createPricing: (data: any) => api.post('/admin/pricing', data),
  updatePricing: (id: string, data: any) => api.patch(`/admin/pricing/${id}`, data),
  deletePricing: (id: string) => api.delete(`/admin/pricing/${id}`),
  getMessages: () => api.get('/admin/messages'),
  markMessageRead: (id: string) => api.patch(`/admin/messages/${id}`, {}),

  // Roles & Permissions
  getRoles: () => api.get<any[]>('/admin/roles'),
  getRole: (id: string) => api.get<any>(`/admin/roles/${id}`),
  createRole: (data: { name: string; description?: string; permissionIds?: string[] }) =>
    api.post<any>('/admin/roles', data),
  updateRole: (id: string, data: { name?: string; description?: string }) =>
    api.patch<any>(`/admin/roles/${id}`, data),
  deleteRole: (id: string) => api.delete(`/admin/roles/${id}`),
  updateRolePermissions: (id: string, permissionIds: string[]) =>
    api.put<any>(`/admin/roles/${id}/permissions`, { permissionIds }),

  getPermissions: () =>
    api.get<{ permissions: any[]; grouped: Record<string, any[]> }>('/admin/permissions'),

  getAdminUsers: (params?: { search?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, String(value));
      });
    }
    return api.get<{ users: any[]; pagination: any }>(`/admin/roles/users?${searchParams}`);
  },
  assignUserRole: (userId: string, roleId: string) =>
    api.patch<any>(`/admin/users/${userId}/role`, { roleId }),
  searchNonAdminUsers: (q: string) =>
    api.get<{ users: any[] }>(`/admin/users/search?q=${encodeURIComponent(q)}`),
  assignAdmin: (userId: string, permissionIds: string[] = []) =>
    api.post<any>(`/admin/users/${userId}/assign-admin`, { permissionIds }),
  removeAdmin: (userId: string) => api.post<any>(`/admin/users/${userId}/remove-admin`, {}),
  updateAdminPermissions: (userId: string, permissionIds: string[]) =>
    api.put<any>(`/admin/users/${userId}/permissions`, { permissionIds }),

  getAuditLogs: (params?: { page?: number; limit?: number; action?: string; adminId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, String(value));
      });
    }
    return api.get<{ logs: any[]; pagination: any }>(`/admin/audit-logs?${searchParams}`);
  },

  // Tools API (Credit System)
  getTools: () => api.get<{ success: boolean; data: any[] }>('/admin/tools'),
  createTool: (data: {
    name: string;
    slug: string;
    description?: string;
    category: string;
    icon?: string;
    creditCost?: number;
    isActive?: boolean;
  }) => api.post<{ success: boolean; data: any }>('/admin/tools', data),
  updateTool: (
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      description: string;
      category: string;
      icon: string;
      creditCost: number;
      isActive: boolean;
    }>
  ) => api.patch<{ success: boolean; data: any }>(`/admin/tools/${id}`, data),
  toggleTool: (id: string) =>
    api.patch<{ success: boolean; data: any }>(`/admin/tools/${id}/toggle`, {}),
  deleteTool: (id: string) => api.delete<{ success: boolean }>(`/admin/tools/${id}`),
  getToolUsageStats: (period: string = '30d') =>
    api.get<{
      success: boolean;
      period: string;
      total_usages: number;
      total_active_users: number;
      total_trend: string;
      total_trend_direction: 'up' | 'down';
      users_trend: string;
      users_trend_direction: 'up' | 'down';
      stats: Array<{
        tool_id: string;
        tool_name: string;
        category: string;
        total_uses: number;
        unique_users: number;
        percentage: number;
        trend: string;
        trend_direction: 'up' | 'down';
      }>;
    }>(`/admin/tools/usage-stats?period=${period}`),

  // Plagiarism Pricing Config API
  getPlagiarismPricing: () =>
    api.get<{
      success: boolean;
      data: {
        tiers: Array<{ minWords: number; maxWords: number; credits: number }>;
        extraThreshold: number;
        extraBase: number;
        extraPer10k: number;
      };
    }>('/admin/tools/plagiarism-pricing'),
  updatePlagiarismPricing: (data: {
    tiers: Array<{ minWords: number; maxWords: number; credits: number }>;
    extraThreshold: number;
    extraBase: number;
    extraPer10k: number;
  }) => api.put('/admin/tools/plagiarism-pricing', data),

  // App Settings API
  getSettings: () => api.get<{ success: boolean; data: Record<string, string> }>('/admin/settings'),
  updateSettings: (data: Record<string, string | number | boolean>) =>
    api.patch<{ success: boolean; data: Record<string, string> }>('/admin/settings', data),

  // Manual Credit Granting
  grantCredits: (data: { email: string; amount: number; reason?: string }) =>
    api.post<{
      success: boolean;
      email: string;
      creditsGranted: number;
      newBalance: number;
      message: string;
    }>('/admin/grant-credits', data),

  // Admin Notifications
  sendNotification: (data: {
    email?: string;
    broadcast?: boolean;
    title: string;
    message?: string;
    type?: string;
  }) => api.post<any>('/notifications/admin/send', data),
  getNotificationHistory: (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, String(value));
      });
    }
    return api.get<any>(`/notifications/admin/history?${searchParams}`);
  },

  // Team Members
  getTeamMembers: () => api.get<any>('/admin/team'),
  createTeamMember: (data: {
    fullName: string;
    role: string;
    avatarUrl?: string;
    socialLinkedin?: string;
    socialTwitter?: string;
    socialWebsite?: string;
    socialInstagram?: string;
    socialTelegram?: string;
    socialGithub?: string;
    displayOrder?: number;
  }) => api.post<any>('/admin/team', data),
  updateTeamMember: (id: string, data: Record<string, unknown>) =>
    api.patch<any>(`/admin/team/${id}`, data),
  deleteTeamMember: (id: string) => api.delete<any>(`/admin/team/${id}`),
  uploadTeamAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.postFormData<{ url: string }>('/admin/team/upload-avatar', formData);
  },
};

// Team API (public)
export const teamApi = {
  list: () => api.get<any>('/team'),
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
  getStats: () =>
    api.get<{
      activeJobs: number;
      totalApplicants: number;
      newApplications: number;
      shortlisted: number;
      newThisWeek: number;
      closedJobs: number;
      interviewsScheduled: number;
    }>('/employer/stats'),
  getApplications: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    jobId?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, String(value));
      });
    }
    return api.get(`/employer/applications?${searchParams}`);
  },
  updateApplicationStatus: (id: string, data: { status?: string; notes?: string }) =>
    api.patch(`/employer/applications/${id}`, data),
  getApplicantPortfolio: (userId: string) => api.get(`/employer/applicants/${userId}/portfolio`),
  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.postFormData<{ logoUrl: string }>('/employer/logo', formData);
  },
  deleteLogo: () => api.delete('/employer/logo'),
};

// Universities API
export const universityApi = {
  search: (query: string, limit = 250) =>
    api.get<{
      universities: {
        id: number;
        nameUz: string;
        nameRu: string | null;
        nameEn: string | null;
        region: string | null;
        type: string | null;
      }[];
    }>(`/universities?search=${encodeURIComponent(query)}&limit=${limit}`),
  syncAdmin: () => api.post('/universities/sync'),
};

// Demographics API (admin only)
export const demographicsApi = {
  universities: (params?: { role?: string; from?: string; to?: string }) => {
    const q = new URLSearchParams();
    if (params?.role) q.set('role', params.role);
    if (params?.from) q.set('from', params.from);
    if (params?.to) q.set('to', params.to);
    return api.get(`/admin/demographics/universities?${q}`);
  },
  fields: (params?: { role?: string; from?: string; to?: string }) => {
    const q = new URLSearchParams();
    if (params?.role) q.set('role', params.role);
    if (params?.from) q.set('from', params.from);
    if (params?.to) q.set('to', params.to);
    return api.get(`/admin/demographics/fields?${q}`);
  },
  summary: () => api.get('/admin/demographics/summary'),
};

// Credits API (Credit System)
export const creditsApi = {
  // Get user's credit balance
  getBalance: () =>
    api.get<{ success: boolean; data: { balance: number; referralCode: string | null } }>(
      '/credits/balance'
    ),

  // Use credits for a tool (atomic deduction)
  useCredits: (toolSlug: string) =>
    api.post<{
      success: boolean;
      error?: string;
      data?: {
        toolName: string;
        creditCost: number;
        remainingBalance: number | null;
        usageId?: string;
        message: string;
        required?: number;
        available?: number;
        shortfall?: number;
      };
    }>('/credits/use', { toolSlug }),

  // Get usage history
  getHistory: (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, String(value));
      });
    }
    return api.get<{
      success: boolean;
      data: {
        history: Array<{
          id: string;
          tool: { name: string; slug: string; icon: string; category: string };
          credits: number;
          usedAt: string;
        }>;
        pagination: { page: number; limit: number; total: number; totalPages: number };
      };
    }>(`/credits/history?${searchParams}`);
  },

  // Get tool info (credit cost preview)
  getTool: (slug: string) =>
    api.get<{
      success: boolean;
      data: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        creditCost: number;
        isActive: boolean;
        icon: string | null;
        category: string;
      };
    }>(`/credits/tool/${slug}`),
};
