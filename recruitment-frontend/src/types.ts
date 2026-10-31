// src/types.ts
import type { SvgIconProps } from '@mui/material/SvgIcon';

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: string;
  message: string;
}

export interface UserInfo {
  fullName: string;
  email: string;
  role: 'ADMIN' | 'CANDIDATE' | 'HR';
  skills?: string;
  experience?: string;
  education?: string;
  resumeUrl?: string;
  avatarUrl?: string;
  phone?: string;
  address?: string;
  companyName?: string;
}

// ===== Trạng thái ứng tuyển =====
export type ApplicationStatus =
  | 'APPLIED'
  | 'REVIEWING'
  | 'INTERVIEWED'
  | 'OFFERED'
  | 'HIRED'
  | 'REJECTED';

export interface HrDashboardStats {
  companyName: string;
  activeJobs: number;
  pendingJobs: number;
  expiredJobs: number;
  newApplicants: number;
  reviewedApplicants: number;
  interviewedApplicants: number;
  todayNewApplicants: number;
  totalApplicants: number;
  recentApplicants: RecentApplicantItem[];
}

export interface RecentApplicantItem {
  applicationId: number;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  status: ApplicationStatus;
  appliedAt: string; // ISO string
}

export interface CandidateMetric {
  label: string;
  value: string;
  description: string;
  progress: number;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  icon?: React.ReactElement<SvgIconProps>;
}

export interface CandidateActivity {
  id: number;
  type: string;
  description: string;
  time: string;
}

export interface UserResponse extends UserInfo {
  id: number;
  enabled: boolean;
}

export type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "TEMPORARY" | "INTERNSHIP";
export const JobTypeValues = {
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  CONTRACT: "CONTRACT",
  TEMPORARY: "TEMPORARY",
  INTERNSHIP: "INTERNSHIP",
} as const;

export type JobLevel = "ENTRY_LEVEL" | "JUNIOR" | "MID_LEVEL" | "SENIOR" | "MANAGER" | "DIRECTOR" | "EXECUTIVE";
export const JobLevelValues = {
  ENTRY_LEVEL: "ENTRY_LEVEL",
  JUNIOR: "JUNIOR",
  MID_LEVEL: "MID_LEVEL",
  SENIOR: "SENIOR",
  MANAGER: "MANAGER",
  DIRECTOR: "DIRECTOR",
  EXECUTIVE: "EXECUTIVE",
} as const;

export interface JobResponse {
  id: number;
  title: string;
  description: string;
  companyId: number;
  companyName: string;
  companyLogo?: string;
  location: string;
  salary?: string;
  experience?: string;
  employmentType?: string;
  jobType?: string;
  jobLevel?: string;
  status?: 'OPEN' | 'CLOSED' | 'DRAFT' | 'PAUSED';
  createdAt?: string;
}

export interface CompanyResponse {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  description: string;
  logo?: string;
  coverImage?: string;
  city?: string;
  country?: string;
  industry?: string;
  companySize: string;
  foundedYear?: number;
  createdAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface CandidateResponse {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  status?: 'Active' | 'Interviewing' | 'Hired' | 'Rejected';
}

export interface CandidateListResponse {
  id: number;
  fullName: string;
  email: string;
  skills?: string;
  phone?: string;
  latestJobTitle?: string;
  latestApplicationStatus?: ApplicationStatus;
  latestAppliedAt?: string; // ISO string
}

export interface CvResponse {
  id: number;
  candidateId: number;
  candidateName: string;
  title: string;
  fullName: string;
  email?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  targetTitle?: string;
  summary?: string;
  skills?: string;
  experience?: string;
  education?: string;
  certificates?: string;
  resumeUrl?: string; // Stores template ID: "modern" | "classic" | "creative" | "tech" | "minimalist" or URL
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CvRequest {
  title: string;
  fullName: string;
  email?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  targetTitle?: string;
  summary?: string;
  skills?: string;
  experience?: string;
  education?: string;
  certificates?: string;
  resumeUrl?: string;
  isDefault?: boolean;
}

export interface CvTemplateResponse {
  templateId: string;
  templateName: string;
  category: string;
  description: string;
  previewColor: string;
  sampleTitle: string;
  sampleFullName: string;
  sampleEmail?: string;
  samplePhone?: string;
  sampleAddress?: string;
  sampleAvatarUrl?: string;
  sampleTargetTitle?: string;
  sampleSummary?: string;
  sampleSkills?: string;
  sampleExperience?: string;
  sampleEducation?: string;
  sampleCertificates?: string;
}

export interface InterviewResponse {
  id: number;
  scheduledAt: string;
  durationMinutes?: number;
  meetingUrl?: string;
  interviewer?: string;
  result: 'SCHEDULED' | 'PASSED' | 'FAILED' | 'NEEDS_REVIEW' | 'CANCELLED';
  notes?: string;
}

export interface CandidateDetailResponse {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  skills?: string;
  experience?: string;
  education?: string;
  resumeUrl?: string;
  defaultCv?: CvResponse;
  cvs?: CvResponse[];
  applicationHistory: {
    applicationId: number;
    jobTitle: string;
    status: ApplicationStatus;
    appliedAt: string;
    cvId?: number;
    cvTitle?: string;
    cv?: CvResponse;
    interviews?: InterviewResponse[];
  }[];
}

// ===== Application Response cho Candidate =====
export interface ApplicationResponse {
  id: number;
  jobId: number;
  jobTitle: string;
  companyName?: string;
  companyLogo?: string;
  location?: string;
  status: ApplicationStatus;
  feedback?: string;
  appliedAt: string; // ISO string
  cvId?: number;
  cvTitle?: string;
  resumeUrl?: string;
  cv?: CvResponse;
}

// ===== ADMIN =====
export interface AdminTimeSeriesPoint {
  label: string;
  value: number;
}

export interface AdminStatusCount {
  status: ApplicationStatus;
  count: number;
}

export interface AdminCompanyStat {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  industry?: string;
  companySize?: string;
  logo?: string;
  coverImage?: string;
  description?: string;
  foundedYear?: number;
  createdAt?: string;
  employeeCount: number;
  activeEmployeeCount: number;
  jobCount: number;
  openJobCount: number;
  applicationCount: number;
  applicationsLast30Days: number;
  hiredCount: number;
}

export interface AdminRecentApplication {
  applicationId: number;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  companyName: string;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface AdminOverview {
  totalCompanies: number;
  totalHrAccounts: number;
  totalCandidates: number;
  totalJobs: number;
  openJobs: number;
  totalApplications: number;
  todayApplications: number;
  newApplications: number;
  hiredApplications: number;
  newCompaniesThisMonth: number;
  newCandidatesThisMonth: number;
  applicationsTimeline: AdminTimeSeriesPoint[];
  companyGrowthTimeline: AdminTimeSeriesPoint[];
  candidateGrowthTimeline: AdminTimeSeriesPoint[];
  applicationStatusBreakdown: AdminStatusCount[];
  topCompanies: AdminCompanyStat[];
  recentApplications: AdminRecentApplication[];
}

export interface AdminCompanyDetail {
  company: AdminCompanyStat;
  employees: {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    enabled: boolean;
    createdAt?: string;
    jobCount: number;
  }[];
  jobs: {
    id: number;
    title: string;
    location?: string;
    salary?: string;
    status?: string;
    createdAt?: string;
  }[];
  applications: {
    applicationId: number;
    candidateId: number;
    candidateName: string;
    candidateEmail: string;
    jobTitle: string;
    status: ApplicationStatus;
    appliedAt: string;
  }[];
  applicationsTimeline: AdminTimeSeriesPoint[];
  statusBreakdown: AdminStatusCount[];
}

export interface AdminCandidate {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  skills?: string;
  experience?: string;
  education?: string;
  avatarUrl?: string;
  resumeUrl?: string;
  enabled: boolean;
  createdAt?: string;
  applicationCount: number;
  cvCount: number;
  companyCount: number;
  lastAppliedAt?: string;
  lastJobTitle?: string;
  lastCompanyName?: string;
  lastStatus?: ApplicationStatus;
}

export interface AdminUserAccount {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  role: 'ADMIN' | 'CANDIDATE' | 'HR';
  companyId?: number;
  companyName?: string;
  enabled: boolean;
}
