import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  Chip,
  Avatar,
} from '@mui/material';
import { keyframes } from '@mui/material/styles';
import {
  AttachMoney as AttachMoneyIcon,
  Work as WorkIcon,
  LocationOn as LocationOnIcon,
  Business as BusinessIcon,
  ArrowBack as ArrowBackIcon,
  PlaylistAddCheckCircleOutlined as CheckCircleOutlineIcon,
  CalendarMonth as CalendarMonthIcon,
  Description as DescriptionIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Stars as StarsIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import { toImageUrl } from '../../utils/image';
import type { JobResponse, UserInfo, CvResponse } from '../../types';
import CvRenderer, { CV_TEMPLATES } from '../../components/CvRenderer';

// ─── Keyframes ─────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50%       { transform: translateY(-12px) rotate(3deg); }
`;

// ─── Component ──────────────────────────────────────────────────────────────
const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // CV Selection modal states
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [myCvs, setMyCvs] = useState<CvResponse[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<number | null>(null);
  const [loadingCvs, setLoadingCvs] = useState(false);

  // Preview CV modal
  const [previewCv, setPreviewCv] = useState<CvResponse | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user_info');
      if (stored) {
        const parsed: UserInfo = JSON.parse(stored);
        const role = parsed.role ? parsed.role.replace(/^ROLE_/, '').toUpperCase() : null;
        setUserRole(role);
      }
    } catch (e) { console.error(e); }
  }, []);

  const loadCandidateCvs = async () => {
    setLoadingCvs(true);
    try {
      const res = await api.get<CvResponse[]>('/api/cvs');
      const cvList = Array.isArray(res.data) ? res.data : [];
      setMyCvs(cvList);
      if (cvList.length > 0) {
        const defaultCv = cvList.find((c) => c.isDefault) || cvList[0];
        setSelectedCvId(defaultCv.id);
      }
    } catch (e) {
      console.warn('Could not load CVs:', e);
    } finally {
      setLoadingCvs(false);
    }
  };

  const handleOpenApplyDialog = () => {
    loadCandidateCvs();
    setApplyDialogOpen(true);
  };

  const handleConfirmApply = async () => {
    if (!id) return;
    try {
      setApplying(true);
      await api.post(`/api/jobs/${id}/apply`, { cvId: selectedCvId });
      setApplied(true);
      setApplyDialogOpen(false);
      setSnackbarMsg('Ứng tuyển thành công! Nhà tuyển dụng đã nhận được CV của bạn.');
    } catch (err: any) {
      console.error('Apply failed:', err);
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra khi nộp hồ sơ ứng tuyển.';
      alert(msg);
    } finally {
      setApplying(false);
    }
  };

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const response = await api.get<JobResponse>(`/api/jobs/${id}`);
        setJob(response.data);

        const stored = localStorage.getItem('user_info');
        if (stored) {
          const parsed: UserInfo = JSON.parse(stored);
          if (parsed.role?.includes('CANDIDATE')) {
            try {
              const checkRes = await api.get<{ applied: boolean }>(`/api/jobs/${id}/applied`);
              if (checkRes.data && checkRes.data.applied) setApplied(true);
            } catch (_) { /* ignore */ }
          }
        }
      } catch (err: any) {
        console.error('Failed to load job details:', err);
        setError(err?.response?.data?.message || 'Không thể tải thông tin công việc.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: '#1a237e' }} />
      </Box>
    );
  }

  if (error || !job) {
    return (
      <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/jobs')} sx={{ mb: 2 }}>
          Quay lại danh sách việc làm
        </Button>
        <Alert severity="error">{error || 'Không tìm thấy công việc.'}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', pb: 6 }}>

      {/* ── 3D Modern Hero Banner (DesignerVN theme) ── */}
      <Box
        sx={{
          borderRadius: { xs: 4, md: 6 },
          overflow: 'hidden',
          mb: 4,
          boxShadow: '0 20px 50px -10px rgba(26, 35, 126, 0.45)',
          position: 'relative',
          background: 'linear-gradient(135deg, #1a237e 0%, #0d1442 40%, #0d1442 100%)',
          p: { xs: 3, sm: 4, md: 5 },
          color: '#ffffff',
        }}
      >
        {/* Floating 3D Geometric Orbs */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -30,
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #3949ab 0%, #3949ab 50%, #1a237e 100%)',
            opacity: 0.75,
            filter: 'blur(2px)',
            animation: `${float} 7s ease-in-out infinite`,
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -40,
            right: 180,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #1a237e 0%, #0d1442 50%, #3949ab 100%)',
            opacity: 0.65,
            animation: `${float} 9s ease-in-out 1s infinite`,
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/jobs')}
            sx={{
              mb: 2.5,
              textTransform: 'none',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.9)',
              bgcolor: 'rgba(255,255,255,0.15)',
              borderRadius: '999px',
              px: 2.5,
              '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.25)' },
            }}
          >
            Quay lại danh sách việc làm
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <StarsIcon sx={{ color: '#fef08a', fontSize: 18 }} />
            <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: '0.12em', color: '#ffffff', fontSize: '0.72rem' }}>
              CHI TIẾT VỊ TRÍ TUYỂN DỤNG
            </Typography>
          </Box>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              animation: `${fadeIn} 0.5s ease both`,
              mb: 2,
              fontSize: { xs: '1.8rem', sm: '2.4rem', md: '2.8rem' },
            }}
          >
            {job.title}
          </Typography>

          <Stack direction="row" spacing={2.5} sx={{ flexWrap: 'wrap', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Avatar
                src={toImageUrl(job.companyLogo)}
                sx={{
                  width: 40,
                  height: 40,
                  fontWeight: 800,
                  bgcolor: 'rgba(255,255,255,0.18)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.35)',
                }}
              >
                {!job.companyLogo && (job.companyName?.charAt(0)?.toUpperCase() || <BusinessIcon sx={{ fontSize: 20 }} />)}
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff' }}>
                {job.companyName || 'Công ty tuyển dụng'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <LocationOnIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.8)' }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                {job.location}
              </Typography>
            </Box>
            {job.createdAt && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <CalendarMonthIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.8)' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Đăng ngày: {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                </Typography>
              </Box>
            )}
          </Stack>

          {/* Apply Button in hero */}
          {userRole === 'CANDIDATE' && (
            <Button
              variant="contained"
              size="large"
              startIcon={<CheckCircleOutlineIcon />}
              disabled={applied || applying}
              onClick={handleOpenApplyDialog}
              sx={{
                textTransform: 'none',
                fontWeight: 800,
                borderRadius: '999px',
                px: 4,
                py: 1.3,
                bgcolor: applied ? undefined : '#ffffff',
                color: applied ? undefined : '#1a237e',
                boxShadow: applied ? undefined : '0 8px 24px rgba(0,0,0,0.2)',
                '&:hover': {
                  bgcolor: '#f8fafc',
                  color: '#0d1442',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {applied ? ' Đã nộp hồ sơ ứng tuyển' : applying ? 'Đang gửi hồ sơ...' : 'Ứng tuyển ngay'}
            </Button>
          )}
        </Box>
      </Box>

      {/* ── 2-column Layout ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' },
          gap: 3.5,
          animation: `${fadeIn} 0.5s ease 0.15s both`,
        }}
      >
        {/* Main Content */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 5,
            border: '1px solid rgba(226, 232, 240, 0.9)',
            overflow: 'hidden',
            boxShadow: '0 4px 20px -2px rgba(26, 35, 126, 0.06)',
            bgcolor: '#ffffff',
          }}
        >
          {/* Quick specs */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, borderBottom: '1px solid #f1f5f9' }}>
            {[
              { icon: <AttachMoneyIcon fontSize="small" sx={{ color: '#1a237e' }} />, label: 'Mức lương', value: job.salary || 'Thỏa thuận' },
              { icon: <WorkIcon fontSize="small" sx={{ color: '#1a237e' }} />, label: 'Kinh nghiệm', value: job.experience || 'Không yêu cầu' },
              { icon: <LocationOnIcon fontSize="small" sx={{ color: '#1a237e' }} />, label: 'Loại hình', value: `${job.employmentType || 'Toàn thời gian'}${job.jobLevel ? ` • ${job.jobLevel}` : ''}` },
            ].map((spec, i) => (
              <Box
                key={spec.label}
                sx={{
                  p: 3,
                  borderRight: i < 2 ? { xs: 'none', sm: '1px solid #f1f5f9' } : 'none',
                  borderBottom: { xs: i < 2 ? '1px solid #f1f5f9' : 'none', sm: 'none' },
                  bgcolor: '#f8fafc',
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.6, fontWeight: 700 }}>
                  {spec.icon} {spec.label}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 800, mt: 0.8, color: '#0f172a' }}>
                  {spec.value}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Job description */}
          <Box sx={{ p: { xs: 3, md: 4.5 } }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: '#0f172a' }}>
              Mô tả công việc & Yêu cầu
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="body1" sx={{ lineHeight: 1.85, whiteSpace: 'pre-line', color: '#334155', fontSize: '0.95rem' }}>
              {job.description}
            </Typography>
          </Box>
        </Paper>

        {/* Sidebar */}
        <Stack spacing={3}>
          {/* Apply Card */}
          {userRole === 'CANDIDATE' && (
            <Paper
              elevation={0}
              sx={{
                borderRadius: 5,
                border: '1px solid rgba(26, 35, 126, 0.25)',
                overflow: 'hidden',
                boxShadow: '0 8px 28px rgba(26, 35, 126, 0.15)',
                background: 'linear-gradient(135deg, #0d1442 0%, #1a237e 100%)',
                color: '#ffffff',
              }}
            >
              <Box sx={{ p: 3.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff', mb: 1 }}>
                  Ứng tuyển vị trí này
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mb: 3, lineHeight: 1.6 }}>
                  Gửi hồ sơ CV trực tiếp đến nhà tuyển dụng {job.companyName || 'doanh nghiệp'}.
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<CheckCircleOutlineIcon />}
                  disabled={applied || applying}
                  onClick={handleOpenApplyDialog}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 800,
                    borderRadius: '999px',
                    py: 1.3,
                    bgcolor: applied ? undefined : '#ffffff',
                    color: applied ? undefined : '#1a237e',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                    '&:hover': {
                      bgcolor: '#f8fafc',
                      color: '#0d1442',
                    },
                  }}
                >
                  {applied ? ' Đã nộp hồ sơ' : applying ? 'Đang gửi...' : 'Nộp CV ngay'}
                </Button>
              </Box>
            </Paper>
          )}

          {/* Job Info Card */}
          <Paper elevation={0} sx={{ borderRadius: 5, border: '1px solid rgba(226, 232, 240, 0.9)', p: 3.5, bgcolor: '#ffffff' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2.5, color: '#0f172a' }}>
              Thông Tin Tuyển Dụng
            </Typography>
            <Stack spacing={2}>
              {[
                { icon: <BusinessIcon fontSize="small" />, label: 'Doanh nghiệp', value: job.companyName || 'N/A' },
                { icon: <LocationOnIcon fontSize="small" />, label: 'Khu vực làm việc', value: job.location },
                { icon: <WorkIcon fontSize="small" />, label: 'Hình thức', value: job.employmentType || 'Toàn thời gian' },
                { icon: <AttachMoneyIcon fontSize="small" />, label: 'Thu nhập', value: job.salary || 'Thỏa thuận' },
              ].map((info) => (
                <Box key={info.label} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <Box sx={{ color: '#1a237e', mt: 0.3, flexShrink: 0 }}>{info.icon}</Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                      {info.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      {info.value}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>

          {/* Back Button */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/jobs')}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '999px',
              py: 1.2,
              borderColor: 'rgba(226, 232, 240, 0.9)',
              color: '#475569',
              bgcolor: '#ffffff',
              '&:hover': { bgcolor: '#f8fafc', color: '#1a237e' },
            }}
            variant="outlined"
          >
            Xem các việc làm khác
          </Button>
        </Stack>
      </Box>

      {/* ── Apply with CV Modal ── */}
      <Dialog
        open={applyDialogOpen}
        onClose={() => !applying && setApplyDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Ứng tuyển vị trí: {job.title}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Chọn bản CV bạn muốn gửi đến nhà tuyển dụng <strong>{job.companyName || 'Công ty'}</strong>:
          </Typography>

          {loadingCvs ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#1a237e' }} size={32} />
            </Box>
          ) : myCvs.length === 0 ? (
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
              <DescriptionIcon sx={{ fontSize: 44, color: '#94a3b8', mb: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Bạn chưa tạo bản CV nào
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Tạo một bản CV ngay để nhà tuyển dụng có thể đánh giá năng lực của bạn tốt nhất!
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => { setApplyDialogOpen(false); navigate('/candidate/cvs/new'); }}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '999px', bgcolor: '#1a237e' }}
              >
                Tạo CV Mới Ngay
              </Button>
            </Paper>
          ) : (
            <Stack spacing={1.5}>
              {myCvs.map((cv) => {
                const isSelected = selectedCvId === cv.id;
                const tplInfo = CV_TEMPLATES.find((t) => t.id === cv.resumeUrl) || CV_TEMPLATES[0];
                return (
                  <Paper
                    key={cv.id}
                    elevation={0}
                    onClick={() => setSelectedCvId(cv.id)}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      border: isSelected ? '2px solid #1a237e' : '1px solid #e2e8f0',
                      bgcolor: isSelected ? 'rgba(26, 35, 126, 0.05)' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s',
                      '&:hover': { borderColor: '#1a237e' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Radio checked={isSelected} value={cv.id} sx={{ color: '#1a237e', '&.Mui-checked': { color: '#1a237e' } }} />
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            {cv.title}
                          </Typography>
                          {cv.isDefault && (
                            <Chip label="Mặc định" size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#fff7ed', color: '#ea580c', fontWeight: 700 }} />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {cv.targetTitle || 'Ứng viên'} • Mẫu: {tplInfo.name.split('(')[0]}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon fontSize="small" />}
                      onClick={(e) => { e.stopPropagation(); setPreviewCv(cv); setPreviewDialogOpen(true); }}
                      sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, color: '#1a237e' }}
                    >
                      Xem
                    </Button>
                  </Paper>
                );
              })}
              <Button
                variant="text"
                startIcon={<AddIcon />}
                onClick={() => { setApplyDialogOpen(false); navigate('/candidate/cvs/new'); }}
                sx={{ textTransform: 'none', fontWeight: 700, mt: 1, alignSelf: 'flex-start', color: '#1a237e' }}
              >
                + Tạo thêm CV mới
              </Button>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setApplyDialogOpen(false)} disabled={applying} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmApply}
            disabled={applying || (myCvs.length > 0 && !selectedCvId)}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '999px', px: 3, bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1442' } }}
          >
            {applying ? 'Đang gửi...' : 'Xác nhận Nộp Hồ Sơ'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Preview CV Dialog ── */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, bgcolor: '#f1f5f9' } } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Xem trước: {previewCv?.title}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1, sm: 3 } }}>
          {previewCv && <CvRenderer cv={previewCv} />}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: 'white' }}>
          <Button onClick={() => setPreviewDialogOpen(false)} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snackbarMsg)}
        autoHideDuration={5000}
        onClose={() => setSnackbarMsg(null)}
        message={snackbarMsg}
      />
    </Box>
  );
};

export default JobDetailPage;
