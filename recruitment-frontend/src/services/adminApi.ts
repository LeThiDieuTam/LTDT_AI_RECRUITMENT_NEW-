import api from './api';
import type {
  AdminCandidate,
  AdminCompanyDetail,
  AdminCompanyStat,
  AdminOverview,
  AdminUserAccount,
  CompanyResponse,
} from '../types';

const adminApi = {
  // ── Tổng quan & biểu đồ ──
  getOverview: () => api.get<AdminOverview>('/api/admin/dashboard'),

  // ── Công ty ──
  getCompanies: (params?: { keyword?: string; industry?: string }) =>
    api.get<AdminCompanyStat[]>('/api/admin/companies', { params }),
  getCompanyDetail: (id: number) => api.get<AdminCompanyDetail>(`/api/admin/companies/${id}`),
  createCompany: (payload: Record<string, unknown>) => api.post<CompanyResponse>('/api/admin/companies', payload),
  updateCompany: (id: number, payload: Record<string, unknown>) =>
    api.put<CompanyResponse>(`/api/admin/companies/${id}`, payload),
  deleteCompany: (id: number) => api.delete(`/api/admin/companies/${id}`),

  // ── Ứng viên ──
  getCandidates: (keyword?: string) => api.get<AdminCandidate[]>('/api/admin/candidates', { params: { keyword } }),
  getCandidate: (id: number) => api.get<AdminCandidate>(`/api/admin/candidates/${id}`),

  // ── Tài khoản người dùng (HR / CANDIDATE) ──
  getUsers: (params?: { role?: 'HR' | 'CANDIDATE' | 'ADMIN'; keyword?: string }) =>
    api.get<AdminUserAccount[]>('/api/admin/users', { params }),
  updateUser: (id: number, payload: Record<string, unknown>) =>
    api.put<AdminUserAccount>(`/api/admin/users/${id}`, payload),
  deleteUser: (id: number) => api.delete(`/api/admin/users/${id}`),
};

export default adminApi;
