import axios, { AxiosError } from 'axios';
import { Submission, FormData, SubmissionStatus } from '../types';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3003/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  console.log('Request config:', {
    url: config.url,
    method: config.method,
    hasToken: !!token
  });
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const auth = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token } = response.data;
      localStorage.setItem('auth_token', token);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },
};

// Submissions endpoints
export const submissions = {
  getAll: async () => {
    try {
      console.log('Fetching all submissions...');
      const response = await api.get<any>('/submissions');
      console.log('API: Raw submissions response:', response.data);
      // Map _id to id for each submission
      const submissions = response.data.map((sub: any) => ({
        ...sub,
        id: sub._id
      }));
      console.log('API: Mapped submissions:', submissions);
      return submissions;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      handleApiError(error as AxiosError);
      return [];
    }
  },

  getById: async (id: string) => {
    try {
      const response = await api.get<any>(`/submissions/${id}`);
      const raw = response.data?.submission ?? response.data;
      if (!raw) return undefined as unknown as Submission;
      const submission: Submission = { ...raw, id: raw._id ?? raw.id };
      return submission;
    } catch (error) {
      handleApiError(error as AxiosError);
    }
  },

  create: async (formData: FormData) => {
    try {
      // Filter data to match backend schema
      const submissionData = {
        companyName: formData.companyName,
        website: formData.website,
        name: formData.name,
        email: formData.email,
        aiStage: formData.aiStage,
        businessDomains: formData.businessDomains,
        otherBusinessDomain: formData.otherBusinessDomain,
        challenges: formData.challenges,
        solutions: formData.solutions,
        budget: formData.budget,
        timeline: formData.timeline,
        status: SubmissionStatus.New,
        generatedQuote: formData.generatedQuote,
        isQuoteLoading: formData.isQuoteLoading,
        notes: formData.internalNotes // Map internalNotes to notes
      };
      
      console.log('API: Creating submission with filtered data:', submissionData);
      const response = await api.post<any>('/submissions', submissionData);
      console.log('API: Raw response:', response.data);
      // Map _id to id
      const submission = {
        ...response.data,
        id: response.data._id
      };
      console.log('API: Mapped submission:', submission);
      return submission;
    } catch (error) {
      console.error('API: Error creating submission:', error);
      handleApiError(error as AxiosError);
    }
  },

  update: async (id: string, data: Partial<Submission>) => {
    try {
      // Filter update data to match backend schema
      const updateData = {
        ...(data.companyName && { companyName: data.companyName }),
        ...(data.website && { website: data.website }),
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.aiStage && { aiStage: data.aiStage }),
        ...(data.businessDomains && { businessDomains: data.businessDomains }),
        ...(data.otherBusinessDomain && { otherBusinessDomain: data.otherBusinessDomain }),
        ...(data.challenges && { challenges: data.challenges }),
        ...(data.solutions && { solutions: data.solutions }),
        ...(data.budget && { budget: data.budget }),
        ...(data.timeline && { timeline: data.timeline }),
        ...(data.status && { status: data.status }),
        ...(data.generatedQuote && { generatedQuote: data.generatedQuote }),
        ...(typeof data.isQuoteLoading !== 'undefined' && { isQuoteLoading: data.isQuoteLoading }),
        ...(data.internalNotes && { notes: data.internalNotes }) // Map internalNotes to notes
      };
      
      console.log('API: Updating submission with filtered data:', updateData);
      const response = await api.patch<any>(`/submissions/${id}`, updateData);
      return response.data.submission;
    } catch (error) {
      handleApiError(error as AxiosError);
    }
  },

  delete: async (id: string) => {
    try {
      await api.delete(`/submissions/${id}`);
      return true;
    } catch (error) {
      handleApiError(error as AxiosError);
      return false;
    }
  },

  getStats: async (params?: Record<string, any>) => {
    try {
      const response = await api.get('/submissions/stats', { params });
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      return null;
    }
  },
};

// Error handling
function handleApiError(error: AxiosError | any) {
  if (error.response?.status === 401) {
    // Unauthorized - clear token and redirect to login
    auth.logout();
    window.location.href = '/';
  }
  
  const message = error.response?.data?.message || error.message || 'An error occurred';
  console.error('API Error:', message);
  throw new Error(message);
}

// PDF endpoints
export const pdf = {
  download: async (id: string): Promise<Blob> => {
    try {
      console.log('Downloading PDF for submission:', id);
      const response = await api.get(`/pdf/${id}`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading PDF:', error);
      handleApiError(error as AxiosError);
      throw error;
    }
  }
};

// AI endpoints
export const ai = {
  generateQuote: async (payload: any): Promise<any> => {
    try {
      const response = await api.post('/ai/quote', payload);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
    }
  }
};

export default {
  auth,
  submissions,
  pdf,
  ai,
  email: {
    sendQuote: async (payload: { companyName: string; contactName: string; contactEmail: string; quoteContent: string; submissionId?: string; subjectOverride?: string }) => {
      try {
        const response = await api.post('/email/quote', payload);
        return response.data;
      } catch (error) {
        handleApiError(error as AxiosError);
      }
    },
    sendConfirmation: async (payload: { email: string; name?: string; companyName?: string }) => {
      try {
        const response = await api.post('/email/confirmation', payload);
        return response.data;
      } catch (error) {
        handleApiError(error as AxiosError);
      }
    },
  }
};