import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
  VerifiedUser as VerifiedUserIcon,
  LockOpen as LockOpenIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  WorkOutlined as WorkOutlineIcon,
} from '@mui/icons-material';
import adminApi from '../../services/adminApi';
import type { AdminCandidate, ApplicationStatus } from '../../types';
import { getStatusChipColor } from '../HrDashboardPage';
import { formatNumber } from '../../components/admin/AdminCharts';

type SortKey = 'newest' | 'applications' | 'cvs' | 'name';

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '-';

const AdminCandidatesPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [candidates, setCandidates] = useState<AdminCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ApplicationStatus | 'NO_APPLICATION'>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('newest');

  const [detail, setDetail] = useState<AdminCandidate | null>(null);
  const [updating, setUpdating] = useState(false);
  const [snack, setSnack] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null);

  const fetchCandidates = async (kw = '') => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getCandidates(kw || undefined);
      setCandidates(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Không thể tải danh sách ứng viên.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates(appliedKeyword);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedKeyword]);

  const filtered = useMemo(() => {
    const list = candidates.filter((c) => {
      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'NO_APPLICATION') return c.applicationCount === 0;
      return c.lastStatus === statusFilter;
    });
    return [...list].sort((a, b) => {
      switch (sortKey) {
        case 'applications':
          return b.applicationCount - a.applicationCount;
        case 'cvs':
          return b.cvCount - a.cvCount;
        case 'name':
          return a.fullName.localeCompare(b.fullName, 'vi');
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });
  }, [candidates, statusFilter, sortKey]);

  const totals = useMemo(
    () => ({
      total: candidates.length,
      active: candidates.filter((c) => c.enabled).length,
      withApplications: candidates.filter((c) => c.applicationCount > 0).length,
      totalApplications: candidates.reduce((s, c) => s + c.applicationCount, 0),
    }),
    [candidates]
  );

  const toggleEnabled = async (c: AdminCandidate) => {
    try {
      setUpdating(true);
      const res = await adminApi.updateUser(c.id, { enabled: !c.enabled });
      const nextEnabled = res.data.enabled;
      setCandidates((prev) => prev.map((x) => (x.id === c.id ? { ...x, enabled: nextEnabled } : x)));
      setDetail((prev) => (prev && prev.id === c.id ? { ...prev, enabled: nextEnabled } : prev));
      setSnack({
        msg: nextEnabled ? 'Đã mở khóa tài khoản ứng viên.' : 'Đã khóa tài khoản ứng viên.',
        severity: 'success',
      });
    } catch (err: any) {
      setSnack({ msg: err?.response?.data?.message || 'Cập nhật trạng thái thất bại.', severity: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Box sx={{ width: '100%', pb: 6 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.4rem', md: '1.8rem' }, color: '#0d1442', letterSpacing: '-0.02em' }}>
            Quản lý ứng viên
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Danh sách toàn bộ ứng viên trên hệ thống kèm hoạt động ứng tuyển của họ.
          </Typography>
        </Box>
        <IconButton onClick={() => fetchCandidates(appliedKeyword)} sx={{ bgcolor: '#e8eaf6', color: '#1a237e' }}>
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Summary */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }, gap: 2, mb: 3 }}>
        {[
          { label: 'Tổng ứng viên', value: totals.total, icon: <PeopleIcon />, color: '#1a237e' },
          { label: 'Đang hoạt động', value: totals.active, icon: <VerifiedUserIcon />, color: '#16a34a' },
          { label: 'Đã ứng tuyển', value: totals.withApplications, icon: <WorkOutlineIcon />, color: '#7c3aed' },
          { label: 'Tổng đơn ứng tuyển', value: totals.totalApplications, icon: <DescriptionIcon />, color: '#0284c7' },
        ].map((s) => (
          <Card key={s.label} sx={{ borderRadius: 3, border: '1px solid rgba(226,232,240,.9)', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  bgcolor: `${s.color}15`,
                  color: s.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {s.icon}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: '#0f172a', lineHeight: 1 }}>
                  {formatNumber(s.value)}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  {s.label}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Filters */}
      <Card sx={{ borderRadius: 3, border: '1px solid rgba(226,232,240,.9)', boxShadow: 'none', mb: 2.5 }}>
        <CardContent sx={{ p: 2 }}>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              setAppliedKeyword(keyword.trim());
            }}
            sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1.5 }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder="Tìm theo tên, email, kỹ năng, công ty..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: keyword ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setKeyword('')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : undefined,
                },
              }}
            />
            <TextField
              select
              size="small"
              label="Trạng thái đơn gần nhất"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              sx={{ minWidth: { md: 220 } }}
            >
              <MenuItem value="ALL">Tất cả</MenuItem>
              <MenuItem value="NO_APPLICATION">Chưa ứng tuyển</MenuItem>
              <MenuItem value="APPLIED">Mới nộp</MenuItem>
              <MenuItem value="REVIEWING">Đang xem xét</MenuItem>
              <MenuItem value="INTERVIEWED">Đã phỏng vấn</MenuItem>
              <MenuItem value="OFFERED">Đã mời việc</MenuItem>
              <MenuItem value="HIRED">Đã tuyển</MenuItem>
              <MenuItem value="REJECTED">Từ chối</MenuItem>
            </TextField>
            <TextField
              select
              size="small"
              label="Sắp xếp"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              sx={{ minWidth: { md: 180 } }}
            >
              <MenuItem value="newest">Mới nhất</MenuItem>
              <MenuItem value="applications">Nhiều đơn nhất</MenuItem>
              <MenuItem value="cvs">Nhiều CV nhất</MenuItem>
              <MenuItem value="name">Tên A → Z</MenuItem>
            </TextField>
            <Button
              type="submit"
              variant="contained"
              sx={{ textTransform: 'none', fontWeight: 800, bgcolor: '#1a237e', px: 3, '&:hover': { bgcolor: '#0d1442' } }}
            >
              Tìm kiếm
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: '#1a237e' }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
      ) : (
        <Card sx={{ borderRadius: 3, border: '1px solid rgba(226,232,240,.9)', boxShadow: 'none' }}>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Ứng viên</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Kỹ năng</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569' }}>CV</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569' }}>Đơn ứng tuyển</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Đơn gần nhất</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569' }}>Trạng thái TK</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569' }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                      Không tìm thấy ứng viên nào phù hợp.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => {
                    const chip = c.lastStatus ? getStatusChipColor(c.lastStatus) : null;
                    return (
                      <TableRow key={c.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Avatar
                              src={c.avatarUrl || undefined}
                              sx={{ width: 36, height: 36, bgcolor: '#ede9fe', color: '#6d28d9', fontWeight: 800 }}
                            >
                              {c.fullName?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.86rem', color: '#1e293b' }}>
                                {c.fullName}
                              </Typography>
                              <Typography noWrap variant="caption" sx={{ color: '#94a3b8' }}>
                                {c.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>
                          <Typography noWrap variant="body2" sx={{ fontSize: '0.8rem', color: '#475569' }}>
                            {c.skills || <span style={{ color: '#cbd5e1' }}>Chưa cập nhật</span>}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={formatNumber(c.cvCount)}
                            sx={{ fontWeight: 800, bgcolor: '#f1f5f9', color: '#334155', minWidth: 34 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography sx={{ fontWeight: 800, color: '#1a237e' }}>{formatNumber(c.applicationCount)}</Typography>
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            {c.companyCount} công ty
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 240 }}>
                          {c.lastJobTitle ? (
                            <>
                              <Typography noWrap variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#0d1442' }}>
                                {c.lastJobTitle}
                              </Typography>
                              <Typography noWrap variant="caption" sx={{ color: '#94a3b8' }}>
                                {c.lastCompanyName} · {c.lastAppliedAt ? new Date(c.lastAppliedAt).toLocaleDateString('vi-VN') : ''}
                              </Typography>
                              {chip && (
                                <Box sx={{ mt: 0.4 }}>
                                  <Chip
                                    label={chip.label}
                                    size="small"
                                    color={chip.color}
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '.68rem', fontWeight: 700, borderRadius: '999px' }}
                                  />
                                </Box>
                              )}
                            </>
                          ) : (
                            <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
                              Chưa ứng tuyển
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            icon={c.enabled ? <LockOpenIcon sx={{ fontSize: 14 }} /> : <LockIcon sx={{ fontSize: 14 }} />}
                            label={c.enabled ? 'Hoạt động' : 'Đã khóa'}
                            color={c.enabled ? 'success' : 'default'}
                            variant="outlined"
                            sx={{ fontWeight: 700, borderRadius: '999px' }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                            <Tooltip title="Xem hồ sơ">
                              <IconButton size="small" onClick={() => setDetail(c)} sx={{ color: '#1a237e' }}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={c.enabled ? 'Khóa tài khoản' : 'Mở khóa'}>
                              <IconButton
                                size="small"
                                disabled={updating}
                                onClick={() => toggleEnabled(c)}
                                sx={{ color: c.enabled ? '#dc2626' : '#16a34a' }}
                              >
                                {c.enabled ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* ── Dialog hồ sơ ứng viên ── */}
      <Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{ fontWeight: 800, color: '#0d1442' }}>Hồ sơ ứng viên</DialogTitle>
        <DialogContent dividers>
          {detail && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  src={detail.avatarUrl || undefined}
                  sx={{ width: 64, height: 64, bgcolor: '#ede9fe', color: '#6d28d9', fontWeight: 800, fontSize: '1.4rem' }}
                >
                  {detail.fullName?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>{detail.fullName}</Typography>
                  <Chip
                    size="small"
                    label={detail.enabled ? 'Đang hoạt động' : 'Tài khoản đã khóa'}
                    color={detail.enabled ? 'success' : 'default'}
                    variant="outlined"
                    sx={{ mt: 0.5, fontWeight: 700, borderRadius: '999px' }}
                  />
                </Box>
              </Box>

              <Stack spacing={1} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#475569' }}>
                  <EmailIcon fontSize="small" />
                  <Typography variant="body2">{detail.email}</Typography>
                </Box>
                {detail.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#475569' }}>
                    <PhoneIcon fontSize="small" />
                    <Typography variant="body2">{detail.phone}</Typography>
                  </Box>
                )}
                {detail.address && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#475569' }}>
                    <LocationOnIcon fontSize="small" />
                    <Typography variant="body2">{detail.address}</Typography>
                  </Box>
                )}
              </Stack>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1.2, mb: 2 }}>
                {[
                  { label: 'Đơn ứng tuyển', value: detail.applicationCount, color: '#1a237e' },
                  { label: 'CV đã tạo', value: detail.cvCount, color: '#7c3aed' },
                  { label: 'Công ty đã nộp', value: detail.companyCount, color: '#0284c7' },
                ].map((s) => (
                  <Box key={s.label} sx={{ p: 1.5, borderRadius: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: s.color }}>{formatNumber(s.value)}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>{s.label}</Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ mb: 2 }} />

              {detail.skills && (
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    Kỹ năng
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#334155', mt: 0.4 }}>{detail.skills}</Typography>
                </Box>
              )}
              {detail.education && (
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    Học vấn
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#334155', mt: 0.4, whiteSpace: 'pre-line' }}>{detail.education}</Typography>
                </Box>
              )}
              {detail.experience && (
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    Kinh nghiệm
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#334155', mt: 0.4, whiteSpace: 'pre-line' }}>{detail.experience}</Typography>
                </Box>
              )}

              <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  Hoạt động gần nhất
                </Typography>
                {detail.lastJobTitle ? (
                  <Box sx={{ mt: 0.6 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0d1442' }}>
                      {detail.lastJobTitle}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.4, flexWrap: 'wrap' }}>
                      <BusinessIcon sx={{ fontSize: 15, color: '#94a3b8' }} />
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {detail.lastCompanyName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        · {formatDate(detail.lastAppliedAt)}
                      </Typography>
                      {detail.lastStatus && (
                        <Chip
                          label={getStatusChipColor(detail.lastStatus).label}
                          size="small"
                          color={getStatusChipColor(detail.lastStatus).color}
                          variant="outlined"
                          sx={{ height: 20, fontSize: '.68rem', fontWeight: 700, borderRadius: '999px' }}
                        />
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.6 }}>
                    Ứng viên chưa nộp hồ sơ nào.
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {detail && (
            <Button
              color={detail.enabled ? 'error' : 'success'}
              startIcon={detail.enabled ? <LockIcon /> : <LockOpenIcon />}
              disabled={updating}
              onClick={() => toggleEnabled(detail)}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              {detail.enabled ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
            </Button>
          )}
          <Button onClick={() => setDetail(null)} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snack}
        autoHideDuration={4000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack?.severity || 'success'} onClose={() => setSnack(null)} sx={{ borderRadius: 2 }}>
          {snack?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminCandidatesPage;
