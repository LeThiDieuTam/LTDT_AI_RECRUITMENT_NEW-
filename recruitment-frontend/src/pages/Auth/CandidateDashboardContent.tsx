import React, { useEffect, useState } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  Box,
  CircularProgress,
  Alert,
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
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  Work as WorkIcon,
  Business as BusinessIcon,
  CheckCircleOutlined as CheckCircleOutlineIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  ArrowForward as ArrowForwardIcon,
  Description as DescriptionIcon,
  Insights as InsightsIcon,
  LightbulbOutlined as LightbulbIcon,
  LaptopMac as LaptopIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import type { UserInfo, CandidateMetric, ApplicationResponse, JobResponse, CompanyResponse } from '../../types';
import api from '../../services/api';
import { toImageUrl } from '../../utils/image';
import { getStatusChipColor } from '../HrDashboardPage';

// ─── Keyframes ─────────────────────────────────────────────────────────────
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50%       { transform: translateY(-14px) rotate(4deg); }
`;

const pulseGlow = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%       { opacity: 0.9; transform: scale(1.06); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
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
    boxShadow: '0 16px 32px -8px rgba(26, 35, 126, 0.18)',
    borderColor: 'rgba(26, 35, 126, 0.3)',
  },
}));

const ICON_THEMES: Record<string, { bg: string; fg: string }> = {
  primary: { bg: 'rgba(26, 35, 126, 0.1)', fg: '#1a237e' },
  warning: { bg: 'rgba(234, 179, 8, 0.14)', fg: '#ca8a04' },
  info:    { bg: 'rgba(6, 182, 212, 0.12)', fg: '#3949ab' },
  success: { bg: 'rgba(34, 197, 94, 0.12)', fg: '#16a34a' },
};

const VALUE_COLORS: Record<string, string> = {
  primary: '#1a237e',
  warning: '#ca8a04',
  info:    '#3949ab',
  success: '#16a34a',
};

// ─── Main Component ────────────────────────────────────────────────────────
const CandidateDashboardContent: React.FC<{ userInfo: UserInfo; navigate: ReturnType<typeof useNavigate> }> = ({
  userInfo,
  navigate,
}) => {
  const [metrics, setMetrics] = useState<CandidateMetric[]>([]);
  const [myApplications, setMyApplications] = useState<ApplicationResponse[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<JobResponse[]>([]);
  const [topCompanies, setTopCompanies] = useState<CompanyResponse[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [errorData, setErrorData] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoadingData(true);
      setErrorData(null);
      try {
        try {
          const metricsResponse = await api.get<CandidateMetric[]>('/api/candidates/dashboard/metrics');
          if (Array.isArray(metricsResponse.data)) {
            const processedMetrics = metricsResponse.data.map((metric) => {
              let icon;
              let color: CandidateMetric['color'] = 'primary';
              if (metric.label.includes('Tổng số ứng tuyển'))  { icon = <WorkIcon />;               color = 'primary'; }
              else if (metric.label.includes('Đang chờ duyệt')){ icon = <HourglassEmptyIcon />;     color = 'warning'; }
              else if (metric.label.includes('Đã xem hồ sơ'))  { icon = <VisibilityIcon />;         color = 'info'; }
              else if (metric.label.includes('Đã được nhận'))  { icon = <CheckCircleOutlineIcon />; color = 'success'; }
              return { ...metric, icon, color };
            });
            setMetrics(processedMetrics);
          }
        } catch (e) {
          console.warn('Metrics endpoint error:', e);
        }

        try {
          const appsResponse = await api.get<ApplicationResponse[]>('/api/candidates/my-applications');
          if (Array.isArray(appsResponse.data)) setMyApplications(appsResponse.data);
        } catch (e) {
          console.warn('My applications endpoint error:', e);
        }

        try {
          const [jobsResponse, companiesResponse] = await Promise.all([
            api.get<{ content: JobResponse[] }>('/api/jobs?size=6&sort=createdAt,desc'),
            api.get<{ content: CompanyResponse[] }>('/api/companies?size=8&sort=name,asc'),
          ]);
          if (Array.isArray(jobsResponse.data?.content)) setRecommendedJobs(jobsResponse.data.content);
          if (Array.isArray(companiesResponse.data?.content)) setTopCompanies(companiesResponse.data.content);
        } catch (e) {
          console.warn('Recommendations endpoint error:', e);
        }
      } catch (err: any) {
        console.error('Lỗi khi tải dữ liệu:', err);
        setErrorData('Không thể tải dữ liệu dashboard.');
      } finally {
        setLoadingData(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress sx={{ color: '#1a237e' }} />
      </Box>
    );
  }

  const displayName = userInfo?.fullName || 'Ứng viên';

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3.5, pb: 6 }}>
      {errorData && <Alert severity="error" sx={{ borderRadius: 3 }}>{errorData}</Alert>}

      {/* ── 3D Modern Hero Banner (Inspired by DesignerVN design) ── */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: { xs: 4, md: 6 },
          overflow: 'hidden',
          background: 'linear-gradient(120deg, #0d1442 0%, #0d1442 68%, #283593 100%)',
          boxShadow: '0 20px 50px -10px rgba(26, 35, 126, 0.38)',
          p: { xs: 3, sm: 4, md: 5 },
          color: '#ffffff',
        }}
      >
        {/* Floating 3D Geometric Spheres & Orbs */}
        <Box
          sx={{
            position: 'absolute',
            top: -60,
            right: -30,
            width: 260,
            height: 260,
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
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #c5cae9 0%, #7986cb 50%, #3949ab 100%)',
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
            opacity: 0.4,
            animation: `${pulseGlow} 5s ease-in-out infinite`,
            pointerEvents: 'none',
          }}
        />

        {/* Inner Content Card with Glassmorphism */}
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
          {/* Left Text Column */}
          <Box sx={{ maxWidth: { xs: '100%', lg: '58%' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
              <Chip
                label="CAREER DASHBOARD"
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
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.85)', fontWeight: 600 }}>
                Tuyển dụng & Tìm việc thông minh
              </Typography>
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
              Xin chào, {displayName}!
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
              Khám phá hàng trăm cơ hội việc làm mới, hoàn thiện hồ sơ CV chuyên nghiệp và theo dõi tiến trình tuyển dụng dễ dàng.
            </Typography>

            {/* Quick action buttons */}
            <Stack direction="row" spacing={1.5} sx={{ mt: 3.5, flexWrap: 'wrap', gap: 1.2 }}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={() => navigate('/jobs')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 800,
                  borderRadius: '999px',
                  px: 3.5,
                  py: 1.2,
                  bgcolor: '#ffffff',
                  color: '#1a237e',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                  '&:hover': {
                    bgcolor: '#f8fafc',
                    color: '#0d1442',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.25)',
                  },
                  transition: 'all 0.22s ease',
                }}
              >
                Tìm việc làm ngay
              </Button>
              <Button
                variant="contained"
                startIcon={<DescriptionIcon />}
                onClick={() => navigate('/candidate/cvs')}
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
                Mẫu & Quản lý CV
              </Button>
              <Button
                variant="outlined"
                startIcon={<BusinessIcon />}
                onClick={() => navigate('/companies')}
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
                Khám phá công ty
              </Button>
            </Stack>
          </Box>

          {/* Right Showcase Box (Laptop / Stats Graphic Mockup) */}
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
              <LaptopIcon sx={{ fontSize: 36, color: '#ffffff' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
              Hồ Sơ Trực Tuyến
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.85)', mt: 0.5, display: 'block' }}>
              Cập nhật CV định kỳ để tiếp cận nhà tuyển dụng sớm nhất
            </Typography>
            <Chip
              label="Tối ưu tỷ lệ nhận việc"
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

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2, gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>Việc làm dành riêng cho bạn</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Cơ hội mới nhất từ các nhà tuyển dụng đang tìm kiếm nhân tài.</Typography>
          </Box>
          <Button endIcon={<ArrowForwardIcon />} onClick={() => navigate('/jobs')} sx={{ textTransform: 'none', fontWeight: 800, color: '#1a237e', flexShrink: 0 }}>Xem tất cả</Button>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2.5 }}>
          {recommendedJobs.map((job) => (
            <ModernCard key={job.id} onClick={() => navigate(`/jobs/${job.id}`)} sx={{ cursor: 'pointer' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Chip label="Đang tuyển" size="small" sx={{ mb: 1.5, color: '#15803d', bgcolor: '#dcfce7', fontWeight: 800 }} />
                <Typography variant="h6" sx={{ fontWeight: 850, fontSize: '1rem', lineHeight: 1.35, minHeight: 43 }}>{job.title}</Typography>
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 700, color: '#475569' }}>{job.companyName || 'Nhà tuyển dụng hàng đầu'}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 0.7 }}>
                  <Chip size="small" icon={<BusinessIcon />} label={job.location || 'Toàn quốc'} variant="outlined" />
                  {job.salary && <Chip size="small" label={job.salary} sx={{ color: '#0d1442', bgcolor: '#e8eaf6', fontWeight: 700 }} />}
                </Stack>
              </CardContent>
            </ModernCard>
          ))}
        </Box>
      </Box>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2, gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>Nhà tuyển dụng hàng đầu</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Khám phá môi trường làm việc và cơ hội phát triển nổi bật.</Typography>
          </Box>
          <Button endIcon={<ArrowForwardIcon />} onClick={() => navigate('/companies')} sx={{ textTransform: 'none', fontWeight: 800, color: '#1a237e', flexShrink: 0 }}>Khám phá công ty</Button>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
          {topCompanies.map((company) => (
            <ModernCard key={company.id} onClick={() => navigate(`/companies/${company.id}`)} sx={{ cursor: 'pointer' }}>
              <CardContent sx={{ p: 2.2, textAlign: 'center' }}>
                <Box sx={{ width: 52, height: 52, mx: 'auto', mb: 1.2, borderRadius: 2.5, bgcolor: '#e8eaf6', color: '#1a237e', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {company.logo ? <Box component="img" src={toImageUrl(company.logo)} alt={company.name} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <BusinessIcon />}
                </Box>
                <Typography sx={{ fontWeight: 850, fontSize: '0.9rem', color: '#1e293b' }} noWrap>{company.name}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap>{company.industry || 'Đa ngành'}</Typography>
              </CardContent>
            </ModernCard>
          ))}
        </Box>
      </Box>

      {/* ── Metric Cards ── */}
      {metrics.length > 0 && (
        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } }}>
          {metrics.map((metric, i) => (
            <MetricStatCard key={metric.label} sx={{ animation: `${fadeInUp} 0.5s ease ${i * 0.08}s both` }}>
              <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 900,
                      letterSpacing: '-0.03em',
                      color: VALUE_COLORS[(metric.color as string) ?? 'primary'],
                      lineHeight: 1,
                      fontSize: '2.2rem',
                    }}
                  >
                    {metric.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, mt: 0.8, fontSize: '0.85rem' }}>
                    {metric.label}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '16px',
                    bgcolor: ICON_THEMES[(metric.color ?? 'primary') as string].bg,
                    color: ICON_THEMES[(metric.color ?? 'primary') as string].fg,
                    display: 'flex',
                  }}
                >
                  {metric.icon && React.cloneElement(metric.icon as React.ReactElement<SvgIconProps>, { sx: { fontSize: 28 } })}
                </Box>
              </CardContent>
            </MetricStatCard>
          ))}
        </Box>
      )}

      {/* ── Main Layout: Table History (8 cols) + Side Cards (4 cols) ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(12, 1fr)' }, gap: 3.5 }}>

        {/* Left: Applications History Table */}
        <Box sx={{ gridColumn: { xs: 'span 1', lg: 'span 8' } }}>
          <ModernCard>
            <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  mb: 3,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    Lịch sử Ứng tuyển của Bạn
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Theo dõi tiến trình & trạng thái các vị trí công việc bạn đã gửi hồ sơ
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/jobs')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: '999px',
                    borderColor: 'rgba(26, 35, 126, 0.4)',
                    color: '#0d1442',
                    '&:hover': { borderColor: '#1a237e', bgcolor: 'rgba(26, 35, 126, 0.06)' },
                  }}
                >
                  Tìm thêm việc làm
                </Button>
              </Box>

              {myApplications.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 4, border: '1px dashed #cbd5e1' }}>
                  <Box sx={{ display: 'inline-flex', p: 2.5, borderRadius: '50%', bgcolor: 'rgba(26, 35, 126, 0.08)', mb: 1.5 }}>
                    <WorkIcon sx={{ fontSize: 40, color: '#1a237e' }} />
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    Bạn chưa nộp hồ sơ vào công việc nào.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Bắt đầu hành trình phát triển sự nghiệp bằng việc ứng tuyển các vị trí phù hợp ngay hôm nay.
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate('/jobs')}
                    sx={{
                      mt: 2.5,
                      textTransform: 'none',
                      fontWeight: 800,
                      borderRadius: '999px',
                      px: 3,
                      bgcolor: '#1a237e',
                      '&:hover': { bgcolor: '#0d1442' },
                    }}
                  >
                    Xem danh sách việc làm
                  </Button>
                </Box>
              ) : (
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    borderRadius: 3,
                    overflowX: 'auto',
                  }}
                >
                  <Table size="small" sx={{ minWidth: 620 }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.84rem' }}>Vị trí công việc</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.84rem' }}>Công ty</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.84rem' }}>Ngày nộp</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.84rem' }}>Trạng thái</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.84rem' }}>Chi tiết</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {myApplications.map((app) => {
                        const chipInfo = getStatusChipColor(app.status);
                        const appliedDate = app.appliedAt
                          ? new Date(app.appliedAt).toLocaleDateString('vi-VN')
                          : 'Vừa xong';
                        return (
                          <TableRow
                            key={app.id}
                            hover
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>{app.jobTitle}</TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.primary">{app.companyName || 'Công ty tuyển dụng'}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">{appliedDate}</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={chipInfo.label}
                                size="small"
                                color={chipInfo.color}
                                variant="outlined"
                                sx={{ fontWeight: 700, borderRadius: '999px', px: 0.5 }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Xem tin tuyển dụng">
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/jobs/${app.jobId}`)}
                                  sx={{
                                    bgcolor: 'rgba(26, 35, 126, 0.08)',
                                    color: '#1a237e',
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
        </Box>

        {/* Right: Career Highlights & Tips */}
        <Box sx={{ gridColumn: { xs: 'span 1', lg: 'span 4' } }}>
          <Stack spacing={3}>

            {/* Smart Matching Insights Card (Clean - No AI Icons) */}
            <ModernCard>
              <Box
                sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, #0d1442 0%, #1a237e 100%)',
                  color: '#ffffff',
                  borderRadius: '24px 24px 0 0',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1 }}>
                  <InsightsIcon sx={{ color: '#fef08a' }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem' }}>
                    Phân Tích & Gợi Ý Nghề Nghiệp
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6 }}>
                  Hệ thống tự động phân tích hồ sơ và kỹ năng của bạn để gợi ý các công việc có tỷ lệ trúng tuyển cao nhất.
                </Typography>
              </Box>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label="Độ tương thích cao" size="small" sx={{ bgcolor: 'rgba(26, 35, 126, 0.1)', color: '#0d1442', fontWeight: 700 }} />
                  <Chip label="Gợi ý kỹ năng" variant="outlined" size="small" />
                  <Chip label="Tối ưu CV" variant="outlined" size="small" />
                </Box>
              </CardContent>
            </ModernCard>

            {/* Career Tips */}
            <ModernCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2 }}>
                  <LightbulbIcon sx={{ color: '#eab308' }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem' }}>
                    Bí Quyết Nâng Cao Hồ Sơ
                  </Typography>
                </Box>
                <Stack spacing={1.6}>
                  {[
                    { title: 'Thông tin liên hệ', desc: 'Cập nhật chính xác số điện thoại và email' },
                    { title: 'Kinh nghiệm chi tiết', desc: 'Mô tả cụ thể dự án, công nghệ và kết quả đạt được' },
                    { title: 'Kỹ năng chuyên môn', desc: 'Liệt kê các kỹ năng cốt lõi đúng với vị trí ứng tuyển' },
                    { title: 'Chứng chỉ & Đào tạo', desc: 'Bổ sung các khóa học hoặc liên kết portfolio/GitHub' },
                  ].map((tip) => (
                    <Box key={tip.title} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#0d1442', mt: 0.9, flexShrink: 0 }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#1e293b' }}>
                          {tip.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>
                          {tip.desc}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/profile')}
                  sx={{
                    mt: 3,
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: '999px',
                    borderColor: 'rgba(26, 35, 126, 0.4)',
                    color: '#0d1442',
                    '&:hover': { borderColor: '#1a237e', bgcolor: 'rgba(26, 35, 126, 0.05)' },
                  }}
                >
                  Cập nhật hồ sơ cá nhân
                </Button>
              </CardContent>
            </ModernCard>

          </Stack>
        </Box>

      </Box>
    </Box>
  );
};

export default CandidateDashboardContent;