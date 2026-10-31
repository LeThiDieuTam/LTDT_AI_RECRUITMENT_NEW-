import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Group as GroupIcon,
  Work as WorkIcon,
  Description as DescriptionIcon,
  TrendingUp as TrendingUpIcon,
  PersonAdd as PersonAddIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import adminApi from '../../services/adminApi';
import type { AdminOverview, UserInfo } from '../../types';
import { BarChart, DonutChart, LineChart, ProgressList, STATUS_LABELS, STATUS_COLORS, formatNumber } from '../../components/admin/AdminCharts';
import { getStatusChipColor } from '../HrDashboardPage';

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  sub?: string;
  onClick?: () => void;
}> = ({ label, value, icon, color, sub, onClick }) => (
  <Card
    onClick={onClick}
    sx={{
      borderRadius: 4,
      border: '1px solid rgba(226,232,240,.9)',
      boxShadow: '0 4px 16px rgba(15,23,42,.05)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all .22s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 16px 32px -12px ${color}55`,
        borderColor: `${color}55`,
      },
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.82rem' }}>
            {label}
          </Typography>
          <Typography sx={{ fontWeight: 900, fontSize: '1.9rem', color: '#0f172a', mt: 0.6, lineHeight: 1.1 }}>
            {formatNumber(value)}
          </Typography>
          {sub && (
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.6, fontWeight: 600 }}>
              {sub}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: '14px',
            bgcolor: `${color}18`,
            color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const ChartCard: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, subtitle, action, children }) => (
  <Card
    sx={{
      borderRadius: 4,
      border: '1px solid rgba(226,232,240,.9)',
      boxShadow: '0 4px 16px rgba(15,23,42,.05)',
      height: '100%',
    }}
  >
    <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 1 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{title}</Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Box>
      {children}
    </CardContent>
  </Card>
);

const AdminDashboardPage: React.FC<{ userInfo: UserInfo; navigate: ReturnType<typeof useNavigate> }> = ({
  userInfo,
  navigate,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getOverview();
      setOverview(res.data);
    } catch (err: any) {
      console.error('Failed to fetch admin overview:', err);
      setError(err?.response?.data?.message || 'Không thể tải dữ liệu tổng quan hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress sx={{ color: '#1a237e' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert
          severity="error"
          sx={{ borderRadius: 3 }}
          action={
            <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={load}>
              Thử lại
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!overview) return null;

  const statusData = overview.applicationStatusBreakdown.filter((s) => s.count > 0);

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3, pb: 6 }}>
      {/* ── Hero ── */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: { xs: 4, md: 5 },
          overflow: 'hidden',
          background: 'linear-gradient(120deg, #0d1442 0%, #16205e 55%, #283593 100%)',
          boxShadow: '0 16px 38px -16px rgba(13,20,66,.45)',
          p: { xs: 3, sm: 4 },
          color: '#fff',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -70,
            right: -40,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #c5cae9, #3949ab 70%)',
            opacity: 0.45,
            filter: 'blur(2px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -60,
            right: 140,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #9fa8da, #1a237e 75%)',
            opacity: 0.35,
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Chip
            label="ADMIN CONSOLE"
            size="small"
            icon={<SupervisorAccountIcon sx={{ color: '#fff !important', fontSize: 15 }} />}
            sx={{
              bgcolor: 'rgba(255,255,255,.2)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.7rem',
              letterSpacing: '0.08em',
              backdropFilter: 'blur(8px)',
            }}
          />
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: { xs: '1.5rem', sm: '2rem' },
              letterSpacing: '-0.02em',
              mt: 1.5,
              lineHeight: 1.2,
            }}
          >
            Xin chào, {userInfo.fullName || 'Quản trị viên'}!
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,.85)', mt: 1, maxWidth: 720, lineHeight: 1.6 }}>
            Bảng điều khiển toàn hệ thống: theo dõi tăng trưởng công ty, ứng viên và lượng hồ sơ nộp về từng doanh nghiệp.
          </Typography>
          <Stack direction="row" spacing={1.2} sx={{ mt: 2.5, flexWrap: 'wrap', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<BusinessIcon />}
              onClick={() => navigate('/admin/companies')}
              sx={{
                textTransform: 'none',
                fontWeight: 800,
                borderRadius: '999px',
                bgcolor: '#fff',
                color: '#0d1442',
                px: 2.5,
                '&:hover': { bgcolor: '#e8eaf6' },
              }}
            >
              Quản lý công ty
            </Button>
            <Button
              variant="contained"
              startIcon={<GroupIcon />}
              onClick={() => navigate('/admin/candidates')}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '999px',
                bgcolor: 'rgba(255,255,255,.18)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,.3)',
                px: 2.5,
                '&:hover': { bgcolor: 'rgba(255,255,255,.28)' },
              }}
            >
              Quản lý ứng viên
            </Button>
            <IconButton
              onClick={load}
              sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,.15)', '&:hover': { bgcolor: 'rgba(255,255,255,.28)' } }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </Box>

      {/* ── KPI Cards ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(4,1fr)' },
          gap: 2,
        }}
      >
        <StatCard
          label="Tổng công ty"
          value={overview.totalCompanies}
          icon={<BusinessIcon />}
          color="#1a237e"
          sub={`+${overview.newCompaniesThisMonth} công ty trong tháng này`}
          onClick={() => navigate('/admin/companies')}
        />
        <StatCard
          label="Tài khoản HR"
          value={overview.totalHrAccounts}
          icon={<SupervisorAccountIcon />}
          color="#3949ab"
          sub="Nhân sự quản lý tin tuyển dụng"
          onClick={() => navigate('/admin/companies')}
        />
        <StatCard
          label="Tổng ứng viên"
          value={overview.totalCandidates}
          icon={<GroupIcon />}
          color="#7c3aed"
          sub={`+${overview.newCandidatesThisMonth} ứng viên trong tháng này`}
          onClick={() => navigate('/admin/candidates')}
        />
        <StatCard
          label="Tin tuyển dụng"
          value={overview.totalJobs}
          icon={<WorkIcon />}
          color="#0891b2"
          sub={`${formatNumber(overview.openJobs)} tin đang mở`}
        />
        <StatCard
          label="Tổng lượt nộp CV"
          value={overview.totalApplications}
          icon={<DescriptionIcon />}
          color="#0284c7"
          sub={`+${formatNumber(overview.todayApplications)} hồ sơ hôm nay`}
        />
        <StatCard
          label="Hồ sơ mới chờ xử lý"
          value={overview.newApplications}
          icon={<PersonAddIcon />}
          color="#ca8a04"
          sub="Trạng thái: Mới nộp"
        />
        <StatCard
          label="Ứng viên đã được tuyển"
          value={overview.hiredApplications}
          icon={<CheckCircleIcon />}
          color="#16a34a"
          sub={
            overview.totalApplications
              ? `Tỷ lệ tuyển thành công ${Math.round((overview.hiredApplications / overview.totalApplications) * 100)}%`
              : 'Chưa có dữ liệu'
          }
        />
        <StatCard
          label="CV nhận trong 30 ngày"
          value={overview.applicationsTimeline.reduce((s, d) => s + d.value, 0)}
          icon={<TrendingUpIcon />}
          color="#e11d48"
          sub="Tính trên toàn hệ thống"
        />
      </Box>

      {/* ── Charts row 1 ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 2 }}>
        <ChartCard title="Lượt nộp CV theo ngày" subtitle="30 ngày gần nhất - toàn hệ thống">
          <BarChart data={overview.applicationsTimeline} height={isMobile ? 170 : 220} />
        </ChartCard>
        <ChartCard title="Phân bố trạng thái hồ sơ" subtitle="Tất cả CV trong hệ thống">
          <DonutChart data={statusData} size={isMobile ? 160 : 180} />
        </ChartCard>
      </Box>

      {/* ── Charts row 2 ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
        <ChartCard title="Tăng trưởng công ty & ứng viên" subtitle="6 tháng gần nhất">
          <LineChart
            height={isMobile ? 200 : 240}
            series={[
              { name: 'Công ty mới', color: '#1a237e', data: overview.companyGrowthTimeline },
              { name: 'Ứng viên mới', color: '#7c3aed', data: overview.candidateGrowthTimeline },
            ]}
          />
        </ChartCard>
        <ChartCard
          title="Top công ty nhận nhiều CV nhất"
          subtitle="Xếp theo tổng số hồ sơ nhận được"
          action={
            <Button
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/admin/companies')}
              sx={{ textTransform: 'none', fontWeight: 700, color: '#1a237e', whiteSpace: 'nowrap' }}
            >
              Xem tất cả
            </Button>
          }
        >
          <ProgressList
            items={overview.topCompanies.map((c) => ({
              label: c.name,
              sublabel: `${formatNumber(c.employeeCount)} nhân viên · ${formatNumber(c.jobCount)} tin tuyển dụng`,
              value: c.applicationCount,
            }))}
            color="#1a237e"
            valueSuffix=" CV"
          />
        </ChartCard>
      </Box>

      {/* ── Bảng công ty tổng quan ── */}
      <ChartCard
        title="Hiệu suất công ty"
        subtitle="Số nhân viên, tin tuyển dụng và lượng CV nhận được"
        action={
          <Button
            size="small"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/admin/companies')}
            sx={{ textTransform: 'none', fontWeight: 700, color: '#1a237e', whiteSpace: 'nowrap' }}
          >
            Quản lý
          </Button>
        }
      >
        <TableContainer sx={{ border: '1px solid rgba(226,232,240,.9)', borderRadius: 3 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Công ty</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, color: '#475569' }}>Nhân viên</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, color: '#475569' }}>Tin tuyển dụng</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, color: '#475569' }}>CV nhận được</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, color: '#475569' }}>CV/30 ngày</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, color: '#475569' }}>Đã tuyển</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {overview.topCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                    Chưa có công ty nào trong hệ thống.
                  </TableCell>
                </TableRow>
              ) : (
                overview.topCompanies.map((c) => (
                  <TableRow
                    key={c.id}
                    hover
                    onClick={() => navigate(`/admin/companies?company=${c.id}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Avatar
                          src={c.logo || undefined}
                          sx={{ width: 32, height: 32, bgcolor: '#e8eaf6', color: '#1a237e', fontWeight: 800, fontSize: '.8rem' }}
                        >
                          {c.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.86rem', color: '#1e293b' }}>
                            {c.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            {c.industry || c.city || 'Chưa cập nhật'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>{formatNumber(c.employeeCount)}</TableCell>
                    <TableCell align="center">{formatNumber(c.jobCount)}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: '#1a237e' }}>
                      {formatNumber(c.applicationCount)}
                    </TableCell>
                    <TableCell align="center">{formatNumber(c.applicationsLast30Days)}</TableCell>
                    <TableCell align="center" sx={{ color: '#16a34a', fontWeight: 700 }}>
                      {formatNumber(c.hiredCount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </ChartCard>

      {/* ── Đơn ứng tuyển mới nhất ── */}
      <ChartCard title="Hồ sơ ứng tuyển mới nhất" subtitle="Toàn hệ thống">
        <TableContainer sx={{ border: '1px solid rgba(226,232,240,.9)', borderRadius: 3 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Ứng viên</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Vị trí</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Công ty</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Thời gian</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {overview.recentApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                    Chưa có hồ sơ nào.
                  </TableCell>
                </TableRow>
              ) : (
                overview.recentApplications.map((a) => {
                  const chip = getStatusChipColor(a.status);
                  return (
                    <TableRow key={a.applicationId} hover>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>
                          {a.candidateName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          {a.candidateEmail}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: '#0d1442', fontWeight: 600 }}>{a.jobTitle}</TableCell>
                      <TableCell sx={{ color: '#475569' }}>{a.companyName}</TableCell>
                      <TableCell sx={{ color: '#64748b', fontSize: '0.78rem' }}>
                        {a.appliedAt
                          ? new Date(a.appliedAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={chip.label ?? STATUS_LABELS[a.status] ?? a.status}
                          size="small"
                          color={chip.color}
                          variant="outlined"
                          sx={{
                            fontWeight: 700,
                            borderRadius: '999px',
                            borderColor: STATUS_COLORS[a.status],
                            color: STATUS_COLORS[a.status],
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </ChartCard>
    </Box>
  );
};

export default AdminDashboardPage;
