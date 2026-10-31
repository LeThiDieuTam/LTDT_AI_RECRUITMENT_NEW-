import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  Work as WorkIcon,
  People as PeopleIcon,
  AddCircleOutlined as AddCircleOutlineIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  HourglassEmpty as HourglassEmptyIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  AccessTime as AccessTimeIcon,
  SupervisorAccount as SupervisorAccountIcon,
} from '@mui/icons-material';
import api from '../services/api';
import type { HrDashboardStats, UserInfo, ApplicationStatus } from '../types';

// ─── Keyframes ─────────────────────────────────────────────────────────────
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50%       { transform: translateY(-12px) rotate(3deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%       { opacity: 0.9; transform: scale(1.05); }
`;

// ─── Styled Components ─────────────────────────────────────────────────────
const ModernCard = styled(Card)(() => ({
  width: '100%',
  borderRadius: 24,
  backgroundColor: '#ffffff',
  boxShadow: '0 4px 20px -2px rgba(26, 35, 126, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
  border: '1px solid rgba(226, 232, 240, 0.9)',
  transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    borderColor: 'rgba(26, 35, 126, 0.35)',
    boxShadow: '0 16px 36px -8px rgba(26, 35, 126, 0.16)',
  },
}));

const MetricStatCard = styled(Card)(() => ({
  width: '100%',
  borderRadius: 20,
  backgroundColor: '#ffffff',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
  transition: 'all 0.25s cubic-bezier(.34,1.56,.64,1)',
  cursor: 'default',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 16px 32px -8px rgba(26, 35, 126, 0.14)',
    borderColor: 'rgba(26, 35, 126, 0.3)',
  },
}));

export const getStatusChipColor = (status: ApplicationStatus) => {
  switch (status) {
    case 'APPLIED':
      return { label: 'Mới nộp', color: 'info' as const };
    case 'REVIEWING':
      return { label: 'Đang xem xét', color: 'warning' as const };
    case 'INTERVIEWED':
      return { label: 'Đã phỏng vấn', color: 'primary' as const };
    case 'OFFERED':
      return { label: 'Đã mời việc', color: 'secondary' as const };
    case 'HIRED':
      return { label: 'Đã tuyển dụng', color: 'success' as const };
    case 'REJECTED':
      return { label: 'Đã từ chối', color: 'error' as const };
    default:
      return { label: status, color: 'default' as const };
  }
};

const HrDashboardPage: React.FC<{ userInfo: UserInfo; navigate: ReturnType<typeof useNavigate> }> = ({ userInfo, navigate }) => {
  const displayName = userInfo.fullName || 'HR';
  const [dashboardStats, setDashboardStats] = useState<HrDashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoadingStats(true);
        setErrorStats(null);
        const response = await api.get<HrDashboardStats>('/api/users/hr/dashboard-summary');
        setDashboardStats(response.data);
      } catch (err: any) {
        console.error('Failed to fetch dashboard stats:', err);
        setErrorStats(err?.response?.data?.message || 'Không thể tải dữ liệu dashboard.');
      } finally {
        setLoadingStats(false);
      }
    };
    fetchDashboardStats();
  }, []);

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3.5, pb: 6 }}>
      {/* ── 3D Modern Hero Banner for HR (Matching DesignerVN theme) ── */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: { xs: 4, md: 6 },
          overflow: 'hidden',
          background: 'linear-gradient(120deg, #0d1442 0%, #0d1442 65%, #283593 100%)',
          boxShadow: '0 16px 38px -12px rgba(13, 20, 66, 0.32)',
          p: { xs: 3, sm: 4, md: 5 },
          color: '#ffffff',
        }}
      >
        {/* Floating 3D Geometric Orbs */}
        <Box
          sx={{
            position: 'absolute',
            top: -60,
            right: -30,
            width: 250,
            height: 250,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #c5cae9 0%, #7986cb 50%, #1a237e 100%)',
            opacity: 0.75,
            filter: 'blur(2px)',
            animation: `${float} 7s ease-in-out infinite`,
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -50,
            right: 180,
            width: 170,
            height: 170,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #c5cae9 0%, #7986cb 55%, #3949ab 100%)',
            opacity: 0.7,
            animation: `${float} 9s ease-in-out 1s infinite`,
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            left: -40,
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #c5cae9 0%, #3949ab 100%)',
            opacity: 0.35,
            animation: `${pulse} 5s ease-in-out infinite`,
            pointerEvents: 'none',
          }}
        />

        {/* Hero Content */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', lg: 'center' },
            gap: 4,
          }}
        >
          <Box sx={{ maxWidth: { xs: '100%', lg: '65%' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
              <Chip
                label="HR RECRUITMENT PORTAL"
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  letterSpacing: '0.08em',
                  px: 0.5,
                }}
              />
              {dashboardStats?.companyName && (
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 700 }}>
                  {dashboardStats.companyName}
                </Typography>
              )}
            </Box>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                fontSize: { xs: '1.8rem', sm: '2.4rem', md: '2.8rem' },
                textShadow: '0 2px 10px rgba(0,0,0,0.15)',
              }}
            >
              Quản Trị Tuyển Dụng Nhân Sự
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mt: 1.5,
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: 1.7,
                fontSize: { xs: '0.95rem', md: '1.05rem' },
              }}
            >
              Chào mừng, <strong>{displayName}</strong>! Theo dõi chiến dịch tuyển dụng, tiếp nhận hồ sơ ứng viên và tối ưu hóa quy trình sàng lọc hiệu quả.
            </Typography>

            {/* Quick Action Buttons */}
            <Stack direction="row" spacing={1.5} sx={{ mt: 3.5, flexWrap: 'wrap', gap: 1.2 }}>
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => navigate('/hr/job-postings/new')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 800,
                  borderRadius: '999px',
                  px: 3.5,
                  py: 1.2,
                  bgcolor: '#ffffff',
                  color: '#0d1442',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                  '&:hover': {
                    bgcolor: '#f8fafc',
                    color: '#283593',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.25)',
                  },
                  transition: 'all 0.22s ease',
                }}
              >
                Đăng tin tuyển dụng mới
              </Button>
              <Button
                variant="contained"
                startIcon={<WorkIcon />}
                onClick={() => navigate('/hr/job-postings')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: '999px',
                  px: 3,
                  py: 1.2,
                  bgcolor: 'rgba(255, 255, 255, 0.18)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                  color: '#ffffff',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.28)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.22s ease',
                }}
              >
                Quản lý tin đăng
              </Button>
              <Button
                variant="outlined"
                startIcon={<PeopleIcon />}
                onClick={() => navigate('/hr/candidates')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: '999px',
                  px: 2.5,
                  py: 1.2,
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  color: '#ffffff',
                  '&:hover': {
                    borderColor: '#ffffff',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                  transition: 'all 0.22s ease',
                }}
              >
                Quản lý ứng viên
              </Button>
            </Stack>
          </Box>

          {/* Right Showcase Box */}
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: 5,
              p: 3.5,
              minWidth: { sm: 260, md: 300 },
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.15)',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '18px',
                bgcolor: 'rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
              }}
            >
              <SupervisorAccountIcon sx={{ fontSize: 36, color: '#ffffff' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
              Hệ Thống Tuyển Dụng
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.85)', mt: 0.5, display: 'block' }}>
              Theo dõi và quản lý hồ sơ ứng viên thông minh
            </Typography>
            <Chip
              label="Tối ưu năng suất HR"
              size="small"
              sx={{
                mt: 2,
                fontWeight: 700,
                bgcolor: '#ffffff',
                color: '#1a237e',
              }}
            />
          </Box>
        </Box>
      </Box>

      {loadingStats ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#1a237e' }} />
        </Box>
      ) : errorStats ? (
        <Alert severity="error" sx={{ my: 3, borderRadius: 3 }}>{errorStats}</Alert>
      ) : dashboardStats ? (
        <Stack spacing={4}>
          {/* Key Metrics Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
            <MetricStatCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Tin tuyển dụng hoạt động
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#1a237e', mt: 1, fontSize: '2.2rem' }}>
                      {dashboardStats.activeJobs}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {dashboardStats.pendingJobs} tin đang là bản nháp
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: '16px', bgcolor: 'rgba(26, 35, 126, 0.1)', color: '#1a237e', display: 'flex' }}>
                    <WorkIcon sx={{ fontSize: 32 }} />
                  </Box>
                </Box>
              </CardContent>
            </MetricStatCard>

            <MetricStatCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Tổng số lượt ứng tuyển
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#3949ab', mt: 1, fontSize: '2.2rem' }}>
                      {dashboardStats.totalApplicants}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 700, color: '#16a34a', mt: 0.5 }}>
                      <TrendingUpIcon fontSize="small" /> +{dashboardStats.todayNewApplicants} lượt hôm nay
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: '16px', bgcolor: 'rgba(6, 182, 212, 0.12)', color: '#3949ab', display: 'flex' }}>
                    <PeopleIcon sx={{ fontSize: 32 }} />
                  </Box>
                </Box>
              </CardContent>
            </MetricStatCard>

            <MetricStatCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Ứng viên mới chờ duyệt
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#ca8a04', mt: 1, fontSize: '2.2rem' }}>
                      {dashboardStats.newApplicants}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Cần HR phản hồi sớm
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: '16px', bgcolor: 'rgba(234, 179, 8, 0.14)', color: '#ca8a04', display: 'flex' }}>
                    <HourglassEmptyIcon sx={{ fontSize: 32 }} />
                  </Box>
                </Box>
              </CardContent>
            </MetricStatCard>

            <MetricStatCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Đã phỏng vấn / Đánh giá
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#16a34a', mt: 1, fontSize: '2.2rem' }}>
                      {dashboardStats.interviewedApplicants}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {dashboardStats.reviewedApplicants} hồ sơ đã qua sơ tuyển
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: '16px', bgcolor: 'rgba(34, 197, 94, 0.12)', color: '#16a34a', display: 'flex' }}>
                    <AssignmentTurnedInIcon sx={{ fontSize: 32 }} />
                  </Box>
                </Box>
              </CardContent>
            </MetricStatCard>
          </Box>

          {/* Hiring Pipeline Progress Bar breakdown */}
          <ModernCard>
            <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#0f172a' }}>
                Tiến Trình Quy Trình Tuyển Dụng
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Tỷ lệ phân bố ứng viên qua từng giai đoạn sàng lọc của {dashboardStats.companyName || 'công ty'}
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                <Box sx={{ bgcolor: '#f8fafc', p: 2.5, borderRadius: 3, border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#ca8a04' }}>
                      Mới nộp (APPLIED)
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {dashboardStats.newApplicants} / {dashboardStats.totalApplicants || 1}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={dashboardStats.totalApplicants ? Math.min(100, Math.round((dashboardStats.newApplicants / dashboardStats.totalApplicants) * 100)) : 0}
                    color="warning"
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>

                <Box sx={{ bgcolor: '#f8fafc', p: 2.5, borderRadius: 3, border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a237e' }}>
                      Đang xem xét (REVIEWING)
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {dashboardStats.reviewedApplicants} / {dashboardStats.totalApplicants || 1}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={dashboardStats.totalApplicants ? Math.min(100, Math.round((dashboardStats.reviewedApplicants / dashboardStats.totalApplicants) * 100)) : 0}
                    color="primary"
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>

                <Box sx={{ bgcolor: '#f8fafc', p: 2.5, borderRadius: 3, border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#16a34a' }}>
                      Đã phỏng vấn (INTERVIEWED)
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {dashboardStats.interviewedApplicants} / {dashboardStats.totalApplicants || 1}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={dashboardStats.totalApplicants ? Math.min(100, Math.round((dashboardStats.interviewedApplicants / dashboardStats.totalApplicants) * 100)) : 0}
                    color="success"
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
              </Box>
            </CardContent>
          </ModernCard>

          {/* Recent Applicants Table */}
          <ModernCard>
            <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    Ứng Viên Nộp Đơn Gần Đây
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Danh sách các ứng viên mới nộp hồ sơ vào các vị trí tuyển dụng
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/hr/candidates')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: '999px',
                    borderColor: 'rgba(26, 35, 126, 0.4)',
                    color: '#0d1442',
                    '&:hover': { borderColor: '#1a237e', bgcolor: 'rgba(26, 35, 126, 0.05)' },
                  }}
                >
                  Xem tất cả ({dashboardStats.totalApplicants})
                </Button>
              </Box>

              {(!dashboardStats.recentApplicants || dashboardStats.recentApplicants.length === 0) ? (
                <Box sx={{ py: 6, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 4, border: '1px dashed #cbd5e1' }}>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Chưa có ứng viên nào nộp hồ sơ vào các vị trí tuyển dụng của bạn.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: 3, overflow: 'hidden' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.84rem' }}>Họ và tên</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.84rem' }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.84rem' }}>Vị trí ứng tuyển</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.84rem' }}>Thời gian nộp</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.84rem' }}>Trạng thái</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.84rem' }}>Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardStats.recentApplicants.map((applicant) => {
                        const chipInfo = getStatusChipColor(applicant.status);
                        const appliedDate = applicant.appliedAt
                          ? new Date(applicant.appliedAt).toLocaleString('vi-VN', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })
                          : 'Vừa xong';

                        return (
                          <TableRow key={applicant.applicationId} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>
                              {applicant.candidateName}
                            </TableCell>
                            <TableCell sx={{ color: '#475569' }}>{applicant.candidateEmail}</TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#0d1442' }}>
                                {applicant.jobTitle}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AccessTimeIcon sx={{ fontSize: 16, color: '#64748b' }} />
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                  {appliedDate}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={chipInfo.label}
                                size="small"
                                color={chipInfo.color}
                                variant="outlined"
                                sx={{ fontWeight: 700, borderRadius: '999px' }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Xem chi tiết ứng viên">
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/candidates/${applicant.candidateId}`)}
                                  sx={{
                                    bgcolor: 'rgba(26, 35, 126, 0.08)',
                                    color: '#0d1442',
                                    '&:hover': { bgcolor: 'rgba(26, 35, 126, 0.18)' },
                                  }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </ModernCard>
        </Stack>
      ) : null}
    </Box>
  );
};

export default HrDashboardPage;