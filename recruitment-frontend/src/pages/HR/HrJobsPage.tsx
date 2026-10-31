import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  LocationOn as LocationOnIcon,
  AttachMoney as AttachMoneyIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import type { JobResponse } from '../../types';

const getJobStatusChip = (status?: string) => {
  switch (status) {
    case 'OPEN':
      return { label: 'Đang mở', color: 'success' as const };
    case 'DRAFT':
      return { label: 'Bản nháp', color: 'warning' as const };
    case 'PAUSED':
      return { label: 'Tạm dừng', color: 'info' as const };
    case 'CLOSED':
      return { label: 'Đã đóng', color: 'error' as const };
    default:
      return { label: status || 'Chưa rõ', color: 'default' as const };
  }
};

const HrJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<JobResponse[]>('/api/hr/jobs');
      setJobs(response.data);
    } catch (err: any) {
      console.error('Failed to fetch HR jobs:', err);
      setError(err?.response?.data?.message || 'Không thể tải danh sách tin tuyển dụng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDeleteJob = async () => {
    if (!deleteTargetId) return;
    try {
      setDeleting(true);
      await api.delete(`/api/hr/jobs/${deleteTargetId}`);
      setDeleteTargetId(null);
      fetchJobs();
    } catch (err: any) {
      console.error('Failed to delete job:', err);
      alert(err?.response?.data?.message || 'Lỗi khi xóa tin tuyển dụng.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ width: '100%', pb: 5 }}>
      {/* Header */}
      <Box sx={{ mb: 3.5, p: { xs: 3, md: 4 }, borderRadius: 5, position: 'relative', overflow: 'hidden', color: '#fff', background: 'linear-gradient(120deg, #0f172a 0%, #1e293b 55%, #334155 100%)', boxShadow: '0 20px 44px -18px rgba(15,23,42,0.45)', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
        <Box sx={{ position: 'absolute', top: -70, right: -50, width: 240, height: 240, borderRadius: '50%', bgcolor: 'rgba(26,35,126,0.12)' }} />
        <Box sx={{ position: 'relative' }}>
          <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '0.14em', color: '#7986cb' }}>
            Employer Center · Job Board
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            Quản lý Tin Tuyển Dụng
          </Typography>
          <Typography variant="body1" sx={{ mt: 0.5, color: 'rgba(255,255,255,0.78)' }}>
            Đăng tin để tiếp cận ứng viên phù hợp và quản lý toàn bộ chiến dịch tuyển dụng.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 600 }}
          >
            Về Dashboard
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/hr/job-postings/new')}
            sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, px: 2.5, background: 'linear-gradient(90deg, #1a237e, #7986cb)', color: '#0d1442', position: 'relative', '&:hover': { filter: 'brightness(1.05)' } }}
          >
            Đăng tin mới
          </Button>
        </Stack>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 3, borderRadius: 2 }}>{error}</Alert>
      ) : jobs.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
            Công ty chưa có tin tuyển dụng nào.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/hr/job-postings/new')}
            sx={{ mt: 1.5, textTransform: 'none', fontWeight: 600 }}
          >
            Tạo tin tuyển dụng đầu tiên
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(15,23,42,0.08)', borderRadius: 3, overflow: 'hidden', boxShadow: '0 12px 32px -20px rgba(15,23,42,0.35)' }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: '#0f172a' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#fff' }}>Tiêu đề công việc</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#fff' }}>Địa điểm & Mức lương</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#fff' }}>Loại hình & Cấp bậc</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#fff' }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#fff' }}>Ngày đăng</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#fff' }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => {
                const statusChip = getJobStatusChip(job.status);
                const createdDate = job.createdAt
                  ? new Date(job.createdAt).toLocaleDateString('vi-VN')
                  : 'N/A';

                return (
                  <TableRow key={job.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.dark' }}>
                      {job.title}
                    </TableCell>

                    <TableCell>
                      <Stack spacing={0.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOnIcon fontSize="small" color="action" />
                          <Typography variant="body2">{job.location}</Typography>
                        </Box>
                        {job.salary && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AttachMoneyIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">{job.salary}</Typography>
                          </Box>
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {job.employmentType && <Chip label={job.employmentType} size="small" variant="outlined" />}
                        {job.jobLevel && <Chip label={job.jobLevel} size="small" variant="outlined" />}
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={statusChip.label}
                        color={statusChip.color}
                        size="small"
                        sx={{ fontWeight: 600, borderRadius: 1.5 }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{createdDate}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title="Xem chi tiết">
                          <IconButton size="small" color="primary" onClick={() => navigate(`/jobs/${job.id}`)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton size="small" color="info" onClick={() => navigate(`/hr/job-postings/${job.id}/edit`)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa tin">
                          <IconButton size="small" color="error" onClick={() => setDeleteTargetId(job.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteTargetId)} onClose={() => setDeleteTargetId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận xóa tin tuyển dụng</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Bạn có chắc chắn muốn xóa tin tuyển dụng này? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteTargetId(null)} sx={{ textTransform: 'none' }}>
            Hủy
          </Button>
          <Button
            onClick={handleDeleteJob}
            variant="contained"
            color="error"
            disabled={deleting}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Xác nhận xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HrJobsPage;
