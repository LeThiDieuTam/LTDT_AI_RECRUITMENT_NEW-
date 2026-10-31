// src/types/index.ts

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
  role: 'ADMIN' | 'COMPANY' | 'USER'; // Định nghĩa các vai trò cụ thể
  phone?: string; // Thêm trường phone
  address?: string; // Thêm trường address
}

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  enabled: boolean;
}

// Thay thế enum JobType bằng type alias và const object
export type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "TEMPORARY" | "INTERNSHIP";
export const JobTypeValues = {
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  CONTRACT: "CONTRACT",
  TEMPORARY: "TEMPORARY",
  INTERNSHIP: "INTERNSHIP",
} as const;

// Thay thế enum JobLevel bằng type alias và const object
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
  company: string; // Tên công ty
  location: string;
  salary: number;
  experience: string;
  employmentType: string;
  createdAt: string; // Hoặc Date nếu bạn muốn parse
  jobType: JobType; // Sử dụng type alias
  jobLevel: JobLevel; // Sử dụng type alias
}

export interface CompanyResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  description: string;
  logo: string;
  city: string;
  country: string;
  industry: string;
  companySize: string;
  foundedYear: number;
  createdAt: string; // Hoặc Date nếu bạn muốn parse
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // current page number (0-indexed)
  size: number; // page size
  first: boolean;
  last: boolean;
  empty: boolean;
}