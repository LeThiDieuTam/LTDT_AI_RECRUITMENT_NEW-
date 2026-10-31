import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Chip,
  Stack,
  Button,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Snackbar,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  LocationOn as LocationOnIcon,
  AttachMoney as AttachMoneyIcon,
  ArrowForward as ArrowForwardIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  Stars as StarsIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import { toImageUrl } from '../../utils/image';
import type { JobResponse, PageResponse, UserInfo, CompanyResponse } from '../../types';
import type { AxiosResponse } from 'axios';

// ─── Keyframes ─────────────────────────────────────────────────────────────
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50%       { transform: translateY(-12px) rotate(3deg); }
`;

// ─── Styled Components ─────────────────────────────────────────────────────
const JobCard = styled(Paper)(({ theme }) => ({
  width: '100%',
  height: '100%',
  padding: theme.spacing(3.5),
  borderRadius: 24,
  position: 'relative',
  overflow: 'hidden',
  boxSizing: 'border-box',
  border: '1px solid rgba(226, 232, 240, 0.9)',
  boxShadow: '0 4px 20px -2px rgba(26, 35, 126, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
  transition: 'transform 0.28s cubic-bezier(.34,1.56,.64,1), box-shadow 0.28s ease, border-color 0.28s ease',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  backgroundColor: '#ffffff',
  '&::before': {
    content: "''",
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 4,
    borderRadius: '24px 24px 0 0',
    background: 'linear-gradient(90deg, #1a237e, #0d1442)',
    opacity: 0,
    transition: 'opacity 0.28s ease',
  },
  '&:hover': {
    transform: 'translateY(-6px)',
    borderColor: 'rgba(26, 35, 126, 0.4)',
    boxShadow: '0 16px 36px -8px rgba(26, 35, 126, 0.18)',
    '&::before': { opacity: 1 },
  },
}));

// ─── Helpers ───────────────────────────────────────────────────────────────
const getJobBadge = (job: JobResponse): { label: string; color: string; bg: string } | null => {
  if (!job.createdAt) return null;
  const daysDiff = (Date.now() - new Date(job.createdAt).getTime()) / (1000 * 3600 * 24);
  if (daysDiff <= 2) return { label: 'MỚI NỔI BẬT', color: '#ffffff', bg: 'linear-gradient(135deg, #3949ab, #3949ab)' };
  if (daysDiff <= 5) return { label: 'TUYỂN GẤP', color: '#ffffff', bg: 'linear-gradient(135deg, #ef4444, #1a237e)' };
  return null;
};

// ─── Main Component ────────────────────────────────────────────────────────
const JobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [topCompanies, setTopCompanies] = useState<CompanyResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [keyword, setKeyword] = useState('');
  const [appliedJobIds, setAppliedJobIds] = useState<Set<number>>(new Set());
  const [applyingJobId, setApplyingJobId] = useState<number | null>(null);
  const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

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

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: AxiosResponse<PageResponse<JobResponse>> = await api.get('/api/jobs');
      if (response.data && Array.isArray(response.data.content)) {
        setJobs(response.data.content);
      } else {
        setJobs([]);
      }

      const stored = localStorage.getItem('user_info');
      if (stored) {
        const parsed: UserInfo = JSON.parse(stored);
        if (parsed.role?.includes('CANDIDATE')) {
          try {
            const myApps = await api.get<any[]>('/api/candidates/my-applications');
            if (Array.isArray(myApps.data)) {
              setAppliedJobIds(new Set(myApps.data.map((app) => app.jobId)));
            }
          } catch (e) { /* ignore */ }
        }
      }
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách công việc:', err);
      setError(err.message || 'Không thể tải danh sách công việc.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    api.get<{ content: CompanyResponse[] }>('/api/companies?size=100&sort=name,asc')
      .then((response) => {
        if (Array.isArray(response.data?.content)) setTopCompanies(response.data.content);
      })
      .catch((e) => console.warn('Không thể tải danh sách công ty nổi bật:', e));
  }, []);

  const handleApply = async (jobId: number) => {
    try {
      setApplyingJobId(jobId);
      await api.post(`/api/jobs/${jobId}/apply`);
      setAppliedJobIds((prev) => new Set(prev).add(jobId));
      setSnackbarMsg('Ứng tuyển thành công! Nhà tuyển dụng sẽ sớm liên hệ với bạn.');
    } catch (err: any) {
      console.error('Apply failed:', err);
      alert(err?.response?.data?.message || 'Có lỗi xảy ra khi nộp hồ sơ ứng tuyển.');
    } finally {
      setApplyingJobId(null);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (!keyword.trim()) return true;
    const term = keyword.toLowerCase();
    return (
      job.title.toLowerCase().includes(term) ||
      (job.companyName && job.companyName.toLowerCase().includes(term)) ||
      (job.location && job.location.toLowerCase().includes(term)) ||
      (job.description && job.description.toLowerCase().includes(term))
    );
  });

  return (
    <Box sx={{ width: '100%', pb: 6 }}>

      {/* ── 3D Modern Hero Banner (DesignerVN theme) ── */}
      <Box
        sx={{
          mb: 4,
          borderRadius: { xs: 4, md: 6 },
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1a237e 0%, #0d1442 40%, #0d1442 100%)',
          boxShadow: '0 20px 50px -10px rgba(26, 35, 126, 0.45)',
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
            width: 260,
            height: 260,
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
            bottom: -50,
            right: 180,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #1a237e 0%, #0d1442 50%, #3949ab 100%)',
            opacity: 0.7,
            animation: `${float} 9s ease-in-out 1s infinite`,
            pointerEvents: 'none',
          }}
        />

        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 3,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
              <Chip
                label="CAREER OPPORTUNITIES"
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
                Hơn {jobs.length > 0 ? `${jobs.length}+` : 'hàng trăm'} cơ hội việc làm hấp dẫn
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
              Cơ Hội Việc Làm Mới Nhất
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mt: 1.5,
                color: 'rgba(255, 255, 255, 0.9)',
                maxWidth: 600,
                lineHeight: 1.7,
                fontSize: { xs: '0.95rem', md: '1.05rem' },
              }}
            >
              Tìm kiếm vị trí tuyển dụng phù hợp với năng lực và mục tiêu phát triển nghề nghiệp của bạn.
            </Typography>

            {/* Stats row */}
            <Box sx={{ display: 'flex', gap: 3, mt: 2.5, flexWrap: 'wrap' }}>
              {[
                { label: `${jobs.length}+ Vị trí tuyển dụng` },
                { label: '85+ Doanh nghiệp uy tín' },
                { label: 'Ứng tuyển trực tiếp' },
              ].map((s) => (
                <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <StarsIcon sx={{ fontSize: 16, color: '#fef08a' }} />
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 700, fontSize: '0.8rem' }}>
                    {s.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {userRole === 'HR' && (
            <Button
              variant="contained"
              onClick={() => navigate('/hr/job-postings/new')}
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
                },
                flexShrink: 0,
              }}
            >
              Đăng tin tuyển dụng
            </Button>
          )}
        </Box>
      </Box>

      {/* ── Search Bar (Centered Modern Glassmorphic) ── */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mb: 4,
          borderRadius: '999px',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          boxShadow: '0 4px 20px -2px rgba(26, 35, 126, 0.08)',
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          backdropFilter: 'blur(10px)',
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          maxWidth: 900,
          mx: 'auto',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm công việc theo chức danh, công ty, địa điểm, kỹ năng..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#1a237e', ml: 1 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& fieldset': { border: 'none' },
            '& input': { fontSize: '0.95rem', fontWeight: 500 },
          }}
        />
        {keyword && (
          <Button
            size="small"
            variant="text"
            onClick={() => setKeyword('')}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '999px', flexShrink: 0, color: '#64748b' }}
          >
            Xóa
          </Button>
        )}
      </Paper>

      {/* Results count */}
      {!loading && !error && jobs.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontWeight: 600 }}>
          {keyword
            ? `Tìm thấy ${filteredJobs.length} kết quả phù hợp cho từ khóa "${keyword}"`
            : `Đang hiển thị ${filteredJobs.length} việc làm`}
        </Typography>
      )}

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2, gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>Công ty hàng đầu đang tuyển dụng</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Tìm hiểu thêm về những nơi làm việc uy tín trước khi ứng tuyển.</Typography>
          </Box>
          <Chip label={`${topCompanies.length} công ty`} sx={{ bgcolor: '#e8eaf6', color: '#1a237e', fontWeight: 800 }} />
        </Box>
        {topCompanies.length > 0 ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(5, 1fr)' }, gap: 2 }}>
            {topCompanies.map((company) => (
              <Paper key={company.id} elevation={0} onClick={() => navigate(`/companies/${company.id}`)} sx={{ p: 2, borderRadius: 3, border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all .2s ease', '&:hover': { transform: 'translateY(-4px)', borderColor: '#a78bfa', boxShadow: '0 12px 24px rgba(124,58,237,.12)' } }}>
                <Box sx={{ width: 50, height: 50, mx: 'auto', mb: 1, borderRadius: 2, bgcolor: '#e8eaf6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a237e', overflow: 'hidden' }}>
                  {company.logo ? <Box component="img" src={toImageUrl(company.logo)} alt={company.name} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <BusinessIcon />}
                </Box>
                <Typography sx={{ textAlign: 'center', fontWeight: 800, fontSize: '.84rem', color: '#1e293b' }} noWrap>{company.name}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }} noWrap>{company.industry || 'Nhà tuyển dụng uy tín'}</Typography>
              </Paper>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">Chưa có dữ liệu công ty nổi bật.</Typography>
        )}
      </Box>

      {/* ── Job List ── */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: '#1a237e' }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 3, borderRadius: 3 }}>{error}</Alert>
      ) : filteredJobs.length === 0 ? (
        <Paper elevation={0} sx={{ p: 7, textAlign: 'center', borderRadius: 4, border: '1px dashed #cbd5e1', bgcolor: '#f8fafc' }}>
          <SearchIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1.5 }} />
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700 }}>
            Không tìm thấy công việc phù hợp
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
            Hãy thử tìm kiếm với các từ khóa khác hoặc xem tất cả danh sách việc làm.
          </Typography>
          {keyword && (
            <Button
              onClick={() => setKeyword('')}
              sx={{ mt: 2, textTransform: 'none', fontWeight: 700, borderRadius: '999px', color: '#1a237e' }}
            >
              Xem tất cả việc làm
            </Button>
          )}
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          }}
        >
          {filteredJobs.map((job, i) => {
            const hasApplied = appliedJobIds.has(job.id);
            const isApplying = applyingJobId === job.id;
            const badge = getJobBadge(job);

            return (
              <Box
                key={job.id}
                sx={{
                  animation: `${fadeInUp} 0.4s ease ${Math.min(i * 0.05, 0.4)}s both`,
                }}
              >
                <JobCard elevation={0}>
                  {/* Badge */}
                  {badge && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        px: 1.4,
                        py: 0.4,
                        borderRadius: '999px',
                        background: badge.bg,
                        color: badge.color,
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        zIndex: 1,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      }}
                    >
                      {badge.label}
                    </Box>
                  )}

                  <Stack spacing={2.5}>
                    {/* Header */}
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 800,
                          color: '#0f172a',
                          mb: 0.5,
                          lineHeight: 1.3,
                          pr: badge ? 10 : 0,
                          fontSize: '1.1rem',
                        }}
                      >
                        {job.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        <BusinessIcon sx={{ fontSize: 16, color: '#1a237e' }} />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569' }}>
                          {job.companyName || 'Công ty tuyển dụng'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Chips */}
                    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.8 }}>
                      <Chip
                        icon={<LocationOnIcon fontSize="small" />}
                        label={job.location}
                        size="small"
                        variant="outlined"
                        sx={{ borderColor: 'rgba(226, 232, 240, 0.9)', fontSize: '0.74rem', fontWeight: 600, color: '#475569' }}
                      />
                      {job.salary && (
                        <Chip
                          icon={<AttachMoneyIcon fontSize="small" />}
                          label={job.salary}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(26, 35, 126, 0.08)',
                            color: '#1a237e',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            '& .MuiChip-icon': { color: '#1a237e' },
                          }}
                        />
                      )}
                      {job.employmentType && (
                        <Chip label={job.employmentType} size="small" variant="outlined" sx={{ fontSize: '0.74rem', fontWeight: 600 }} />
                      )}
                    </Stack>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.65,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        minHeight: 66,
                        fontSize: '0.84rem',
                      }}
                    >
                      {job.description || 'Không có mô tả chi tiết.'}
                    </Typography>

                    {/* Actions */}
                    <Stack
                      direction="row"
                      spacing={1.5}
                      sx={{ pt: 1.5, borderTop: '1px solid #f1f5f9', alignItems: 'center' }}
                    >
                      <Button
                        variant="text"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.84rem', color: '#1a237e' }}
                      >
                        Chi tiết
                      </Button>

                      {userRole === 'CANDIDATE' && (
                        <Button
                          variant={hasApplied ? 'outlined' : 'contained'}
                          color={hasApplied ? 'success' : 'primary'}
                          size="small"
                          disabled={hasApplied || isApplying}
                          onClick={() => handleApply(job.id)}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 800,
                            borderRadius: '999px',
                            ml: 'auto',
                            fontSize: '0.82rem',
                            px: 2.2,
                            ...((!hasApplied && !isApplying) && {
                              bgcolor: '#1a237e',
                              '&:hover': { bgcolor: '#0d1442' },
                            }),
                          }}
                        >
                          {hasApplied ? ' Đã nộp đơn' : isApplying ? 'Đang gửi...' : 'Ứng tuyển ngay'}
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </JobCard>
              </Box>
            );
          })}
        </Box>
      )}

      <Snackbar
        open={Boolean(snackbarMsg)}
        autoHideDuration={5000}
        onClose={() => setSnackbarMsg(null)}
        message={snackbarMsg}
      />
    </Box>
  );
};

export default JobsPage;