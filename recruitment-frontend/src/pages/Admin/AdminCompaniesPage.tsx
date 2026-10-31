import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
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
  Business as BusinessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import adminApi from '../../services/adminApi';
import type { AdminCompanyDetail, AdminCompanyStat } from '../../types';
import { BarChart, DonutChart, formatNumber } from '../../components/admin/AdminCharts';
import { getStatusChipColor } from '../HrDashboardPage';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  city: '',
  industry: '',
  companySize: '',
  description: '',
  logo: '',
  foundedYear: '',
};

const AdminCompaniesPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams, setSearchParams] = useSearchParams();

  const [companies, setCompanies] = useState<AdminCompanyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [industry, setIndustry] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [appliedIndustry, setAppliedIndustry] = useState('');

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<AdminCompanyDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AdminCompanyStat | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [snack, setSnack] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null);

  const fetchCompanies = async (kw = '', ind = '') => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getCompanies({ keyword: kw || undefined, industry: ind || undefined });
      setCompanies(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Không thể tải danh sách công ty.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(appliedKeyword, appliedIndustry);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedKeyword, appliedIndustry]);

  // Mở chi tiết nếu URL có ?company=id
  useEffect(() => {
    const id = searchParams.get('company');
    if (id) {
      openDetail(Number(id));
      const next = new URLSearchParams(searchParams);
      next.delete('company');
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDetail = async (id: number) => {
    setDetailOpen(true);
    setDetailTab(0);
    setDetail(null);
    try {
      setDetailLoading(true);
      const res = await adminApi.getCompanyDetail(id);
      setDetail(res.data);
    } catch (err: any) {
      setSnack({ msg: err?.response?.data?.message || 'Không thể tải chi tiết công ty.', severity: 'error' });
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const industryOptions = useMemo(
    () => Array.from(new Set(companies.map((c) => c.industry).filter(Boolean))) as string[],
    [companies]
  );

  const totals = useMemo(
    () => ({
      companies: companies.length,
      employees: companies.reduce((s, c) => s + c.employeeCount, 0),
      jobs: companies.reduce((s, c) => s + c.jobCount, 0),
      applications: companies.reduce((s, c) => s + c.applicationCount, 0),
    }),
    [companies]
  );

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormOpen(true);
  };

  const openEdit = (c: AdminCompanyStat) => {
    setEditingId(c.id);
    setForm({
      name: c.name || '',
      email: c.email || '',
      phone: c.phone || '',
      website: c.website || '',
      address: c.address || '',
      city: c.city || '',
      industry: c.industry || '',
      companySize: c.companySize || '',
      description: c.description || '',
      logo: c.logo || '',
      foundedYear: c.foundedYear ? String(c.foundedYear) : '',
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setSnack({ msg: 'Tên công ty và email là bắt buộc.', severity: 'error' });
      return;
    }
    try {
      setSaving(true);
      const payload: Record<string, unknown> = {
        ...form,
        foundedYear: form.foundedYear ? Number(form.foundedYear) : null,
      };
      if (editingId) {
        await adminApi.updateCompany(editingId, payload);
        setSnack({ msg: 'Đã cập nhật công ty.', severity: 'success' });
      } else {
        await adminApi.createCompany(payload);
        setSnack({ msg: 'Đã tạo công ty mới.', severity: 'success' });
      }
      setFormOpen(false);
      fetchCompanies(appliedKeyword, appliedIndustry);
    } catch (err: any) {
      setSnack({ msg: err?.response?.data?.message || 'Lưu công ty thất bại.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await adminApi.deleteCompany(deleteTarget.id);
      setSnack({ msg: 'Đã xóa công ty.', severity: 'success' });
      setDeleteTarget(null);
      fetchCompanies(appliedKeyword, appliedIndustry);
    } catch (err: any) {
      setSnack({ msg: err?.response?.data?.message || 'Xóa công ty thất bại.', severity: 'error' });
    } finally {
      setDeleting(false);
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
            Quản lý công ty
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Theo dõi số lượng nhân viên, tin tuyển dụng và lượng CV nộp về từng doanh nghiệp.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '999px', bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1442' } }}
          >
            Thêm công ty
          </Button>
          <IconButton onClick={() => fetchCompanies(appliedKeyword, appliedIndustry)} sx={{ bgcolor: '#e8eaf6', color: '#1a237e' }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* Summary */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }, gap: 2, mb: 3 }}>
        {[
          { label: 'Công ty', value: totals.companies, icon: <BusinessIcon />, color: '#1a237e' },
          { label: 'Nhân viên HR', value: totals.employees, icon: <PeopleIcon />, color: '#3949ab' },
          { label: 'Tin tuyển dụng', value: totals.jobs, icon: <WorkIcon />, color: '#0891b2' },
          { label: 'CV nhận được', value: totals.applications, icon: <DescriptionIcon />, color: '#0284c7' },
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
              setAppliedIndustry(industry);
            }}
            sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1.5 }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder="Tìm theo tên, email, ngành, thành phố..."
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
              label="Ngành"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              sx={{ minWidth: { md: 200 } }}
            >
              <MenuItem value="">Tất cả ngành</MenuItem>
              {industryOptions.map((i) => (
                <MenuItem key={i} value={i}>
                  {i}
                </MenuItem>
              ))}
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
                  <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Công ty</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Ngành / Địa điểm</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569' }}>Nhân viên</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569' }}>Tin tuyển dụng</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569' }}>CV nhận được</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569' }}>CV/30 ngày</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569' }}>Đã tuyển</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569' }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {companies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                      Không tìm thấy công ty nào phù hợp.
                    </TableCell>
                  </TableRow>
                ) : (
                  companies.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Avatar
                            src={c.logo || undefined}
                            sx={{ width: 36, height: 36, bgcolor: '#e8eaf6', color: '#1a237e', fontWeight: 800 }}
                          >
                            {c.name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.86rem', color: '#1e293b' }}>
                              {c.name}
                            </Typography>
                            <Typography noWrap variant="caption" sx={{ color: '#94a3b8' }}>
                              {c.email || 'Chưa có email'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.82rem' }}>
                          {c.industry || '-'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          {c.city || c.address || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{formatNumber(c.employeeCount)}</Typography>
                        <Typography variant="caption" sx={{ color: '#16a34a' }}>
                          {c.activeEmployeeCount} hoạt động
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{formatNumber(c.jobCount)}</Typography>
                        <Typography variant="caption" sx={{ color: '#0891b2' }}>
                          {c.openJobCount} đang mở
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography sx={{ fontWeight: 800, color: '#1a237e', fontSize: '0.9rem' }}>
                          {formatNumber(c.applicationCount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: '#475569' }}>
                        {formatNumber(c.applicationsLast30Days)}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: '#16a34a' }}>
                        {formatNumber(c.hiredCount)}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                          <Tooltip title="Xem chi tiết">
                            <IconButton size="small" onClick={() => openDetail(c.id)} sx={{ color: '#1a237e' }}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Chỉnh sửa">
                            <IconButton size="small" onClick={() => openEdit(c)} sx={{ color: '#3949ab' }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <IconButton size="small" onClick={() => setDeleteTarget(c)} sx={{ color: '#dc2626' }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* ── Dialog chi tiết công ty ── */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{ fontWeight: 800, color: '#0d1442', pb: 1 }}>
          {detail?.company?.name || 'Chi tiết công ty'}
        </DialogTitle>
        <DialogContent dividers>
          {detailLoading || !detail ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#1a237e' }} />
            </Box>
          ) : (
            <Box>
              {/* Stats */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(4,1fr)' }, gap: 1.5, mb: 2.5 }}>
                {[
                  { label: 'Nhân viên', value: detail.company.employeeCount, icon: <PeopleIcon fontSize="small" />, color: '#3949ab' },
                  { label: 'Tin tuyển dụng', value: detail.company.jobCount, icon: <WorkIcon fontSize="small" />, color: '#0891b2' },
                  { label: 'CV nhận được', value: detail.company.applicationCount, icon: <DescriptionIcon fontSize="small" />, color: '#0284c7' },
                  { label: 'Đã tuyển', value: detail.company.hiredCount, icon: <CheckCircleIcon fontSize="small" />, color: '#16a34a' },
                ].map((s) => (
                  <Box key={s.label} sx={{ p: 1.5, borderRadius: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: s.color }}>
                      {s.icon}
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>{s.label}</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.3rem', color: '#0f172a', mt: 0.3 }}>
                      {formatNumber(s.value)}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2.5 }}>
                <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                  <CardContent>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', mb: 1.5 }}>CV nhận được theo tháng</Typography>
                    <BarChart data={detail.applicationsTimeline} height={170} color="#3949ab" />
                  </CardContent>
                </Card>
                <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                  <CardContent>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', mb: 1.5 }}>Trạng thái hồ sơ</Typography>
                    <DonutChart data={detail.statusBreakdown.filter((s) => s.count > 0)} size={150} thickness={22} />
                  </CardContent>
                </Card>
              </Box>

              <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)} sx={{ mb: 1.5 }}>
                <Tab label={`Nhân viên (${detail.employees.length})`} sx={{ textTransform: 'none', fontWeight: 700 }} />
                <Tab label={`Tin tuyển dụng (${detail.jobs.length})`} sx={{ textTransform: 'none', fontWeight: 700 }} />
                <Tab label={`Hồ sơ ứng tuyển (${detail.applications.length})`} sx={{ textTransform: 'none', fontWeight: 700 }} />
              </Tabs>
              <Divider />

              {detailTab === 0 && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800 }}>Nhân viên</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Điện thoại</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800 }}>Trạng thái</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detail.employees.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                            Công ty chưa có nhân viên HR nào.

                          </TableCell>
                        </TableRow>
                      ) : (
                        detail.employees.map((e) => (
                          <TableRow key={e.id} hover>
                            <TableCell sx={{ fontWeight: 700 }}>{e.fullName}</TableCell>
                            <TableCell>{e.email}</TableCell>
                            <TableCell>{e.phone || '-'}</TableCell>
                            <TableCell align="center">
                              <Chip
                                size="small"
                                label={e.enabled ? 'Hoạt động' : 'Đã khóa'}
                                color={e.enabled ? 'success' : 'default'}
                                variant="outlined"
                                sx={{ fontWeight: 700, borderRadius: '999px' }}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {detailTab === 1 && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800 }}>Vị trí</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Địa điểm</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Lương</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800 }}>Trạng thái</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Ngày tạo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detail.jobs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                            Chưa có tin tuyển dụng.
                          </TableCell>
                        </TableRow>
                      ) : (
                        detail.jobs.map((j) => (
                          <TableRow key={j.id} hover>
                            <TableCell sx={{ fontWeight: 700 }}>{j.title}</TableCell>
                            <TableCell>{j.location || '-'}</TableCell>
                            <TableCell>{j.salary || '-'}</TableCell>
                            <TableCell align="center">
                              <Chip
                                size="small"
                                label={j.status === 'OPEN' ? 'Đang mở' : j.status === 'DRAFT' ? 'Nháp' : j.status === 'PAUSED' ? 'Tạm dừng' : 'Đã đóng'}
                                color={j.status === 'OPEN' ? 'success' : j.status === 'DRAFT' ? 'warning' : 'default'}
                                variant="outlined"
                                sx={{ fontWeight: 700, borderRadius: '999px' }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: '#64748b', fontSize: '.8rem' }}>
                              {j.createdAt ? new Date(j.createdAt).toLocaleDateString('vi-VN') : '-'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {detailTab === 2 && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800 }}>Ứng viên</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Vị trí</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Ngày nộp</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800 }}>Trạng thái</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detail.applications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                            Chưa có hồ sơ ứng tuyển.
                          </TableCell>
                        </TableRow>
                      ) : (
                        detail.applications.map((a) => {
                          const chip = getStatusChipColor(a.status);
                          return (
                            <TableRow key={a.applicationId} hover>
                              <TableCell>
                                <Typography sx={{ fontWeight: 700, fontSize: '.85rem' }}>{a.candidateName}</Typography>
                                <Typography variant="caption" sx={{ color: '#94a3b8' }}>{a.candidateEmail}</Typography>
                              </TableCell>
                              <TableCell>{a.jobTitle}</TableCell>
                              <TableCell sx={{ color: '#64748b', fontSize: '.8rem' }}>
                                {a.appliedAt ? new Date(a.appliedAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  size="small"
                                  label={chip.label}
                                  color={chip.color}
                                  variant="outlined"
                                  sx={{ fontWeight: 700, borderRadius: '999px' }}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Dialog thêm/sửa công ty ── */}
      <Dialog open={formOpen} onClose={() => !saving && setFormOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{ fontWeight: 800, color: '#0d1442' }}>
          {editingId ? 'Chỉnh sửa công ty' : 'Thêm công ty mới'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, pt: 0.5 }}>
            <TextField label="Tên công ty *" size="small" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} sx={{ gridColumn: { sm: 'span 2' } }} />
            <TextField label="Email *" size="small" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField label="Điện thoại" size="small" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <TextField label="Website" size="small" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            <TextField label="Ngành" size="small" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
            <TextField label="Thành phố" size="small" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <TextField label="Quy mô" size="small" value={form.companySize} onChange={(e) => setForm({ ...form, companySize: e.target.value })} placeholder="VD: 50-200" />
            <TextField label="Địa chỉ" size="small" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} sx={{ gridColumn: { sm: 'span 2' } }} />
            <TextField label="Năm thành lập" size="small" type="number" value={form.foundedYear} onChange={(e) => setForm({ ...form, foundedYear: e.target.value })} />
            <TextField label="Logo (URL)" size="small" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} />
            <TextField
              label="Mô tả"
              size="small"
              multiline
              minRows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              sx={{ gridColumn: { sm: 'span 2' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)} disabled={saving} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{ textTransform: 'none', fontWeight: 800, bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1442' } }}
          >
            {editingId ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Dialog xóa ── */}
      <Dialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#b91c1c' }}>Xóa công ty?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#475569' }}>
            Bạn có chắc muốn xóa <strong>{deleteTarget?.name}</strong>? Hành động này có thể ảnh hưởng tới các
            tin tuyển dụng và hồ sơ ứng tuyển liên quan và không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Hủy
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <BlockIcon />}
            sx={{ textTransform: 'none', fontWeight: 800 }}
          >
            Xóa
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

export default AdminCompaniesPage;
