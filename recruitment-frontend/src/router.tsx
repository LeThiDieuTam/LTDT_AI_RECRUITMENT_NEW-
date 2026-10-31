import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ProfilePage from './pages/Auth/ProfilePage';
import CandidateListPage from './pages/HR/CandidateListPage';
import CandidateDetailPage from './pages/HR/CandidateDetailPage';
import NewJobPostingPage from './pages/HR/NewJobPostingPage';
import HrJobsPage from './pages/HR/HrJobsPage';
import EditJobPage from './pages/HR/EditJobPage';
import JobsPage from './pages/Auth/JobsPage';
import JobDetailPage from './pages/Auth/JobDetailPage';
import CompaniesPage from './pages/Auth/CompanyPage';
import AdminUsersPage from './pages/Auth/AdminUsersPage';
import AdminCompaniesPage from './pages/Admin/AdminCompaniesPage';
import AdminCandidatesPage from './pages/Admin/AdminCandidatesPage';
import NotFoundPage from './pages/NotFoundPage';
import PrivateRoute from './components/PrivateRoute';
import DashboardPage from './pages/Auth/DashboardPage';
import CandidateCvListPage from './pages/Candidate/CandidateCvListPage';
import CvEditorPage from './pages/Candidate/CvEditorPage';
import CvPreviewPage from './pages/Candidate/CvPreviewPage';
import CompanyProfilePage from './pages/HR/CompanyProfilePage';
import CompanyDetailPage from './pages/Auth/CompanyDetailPage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },

      // HR Specific Routes
      {
        element: <PrivateRoute allowedRoles={['HR']} />,
        children: [
          { path: 'hr/candidates', element: <CandidateListPage /> },
          { path: 'candidates/:candidateId', element: <CandidateDetailPage /> },
          { path: 'hr/job-postings', element: <HrJobsPage /> },
          { path: 'hr/job-postings/new', element: <NewJobPostingPage /> },
          { path: 'hr/job-postings/:jobId/edit', element: <EditJobPage /> },
          { path: 'company/post-job', element: <NewJobPostingPage /> },
          { path: 'hr/company', element: <CompanyProfilePage /> },
        ],
      },

      // Admin Specific Routes
      {
        element: <PrivateRoute allowedRoles={['ADMIN']} />,
        children: [
          { path: 'admin/users', element: <AdminUsersPage /> },
          { path: 'admin/companies', element: <AdminCompaniesPage /> },
          { path: 'admin/candidates', element: <AdminCandidatesPage /> },
        ],
      },

      // Candidate Specific Routes
      {
        element: <PrivateRoute allowedRoles={['CANDIDATE']} />,
        children: [
          { path: 'candidate/cvs', element: <CandidateCvListPage /> },
          { path: 'candidate/cvs/new', element: <CvEditorPage /> },
          { path: 'candidate/cvs/:id/edit', element: <CvEditorPage /> },
          { path: 'candidate/cvs/:id', element: <CvPreviewPage /> },
        ],
      },

      // Profile (Requires Login)
      {
        element: <PrivateRoute />,
        children: [
          { path: 'profile', element: <ProfilePage /> },
        ],
      },

      // Public Routes
      { path: 'jobs', element: <JobsPage /> },
      { path: 'jobs/:id', element: <JobDetailPage /> },
      { path: 'companies', element: <CompaniesPage /> },
      { path: 'companies/:id', element: <CompanyDetailPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default router;