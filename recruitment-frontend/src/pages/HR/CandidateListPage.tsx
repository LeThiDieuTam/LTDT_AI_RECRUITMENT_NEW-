import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Tooltip,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  PersonSearch as PersonSearchIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  SmartToy as SmartToyIcon,
  AutoAwesome as AutoAwesomeIcon,
  Refresh as RefreshIcon,
  WorkspacePremium as WorkspacePremiumIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import type { ApplicationStatus, CandidateListResponse } from '../../types';
import { getStatusChipColor } from '../HrDashboardPage';

const CandidateListPage: React.FC = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<CandidateListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [aiKeywords, setAiKeywords] = useState('');
  const [minimumScore, setMinimumScore] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'ALL' | ApplicationStatus>('ALL');
  const [rankByAi, setRankByAi] = useState(true);

  const fetchCandidates = async (query: string = '') => {
    try {
      setLoading(true);
      setError(null);
      const url = query ? `/api/hr/candidates?searchTerm=${encodeURIComponent(query)}` : '/api/hr/candidates';
      const response = await api.get<CandidateListResponse[]>(url);
      setCandidates(response.data);
    } catch (err: any) {
      console.error('Failed to fetch candidates:', err);
      setError(err?.response?.data?.message || 'Không thể tải danh sách ứng viên.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates(activeSearch);
  }, [activeSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchTerm.trim());
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setActiveSearch('');
  };

  const getAiScore = (candidate: CandidateListResponse) => {
    const keywords = aiKeywords.toLowerCase().split(',').map((item) => item.trim()).filter(Boolean);
    if (keywords.length === 0) return null;
    const candidateSkills = (candidate.skills || '').toLowerCase();
    const matched = keywords.filter((keyword) => candidateSkills.includes(keyword)).length;
    return Math.min(100, Math.round((matched / keywords.length) * 80 + (candidate.latestApplicationStatus === 'INTERVIEWED' ? 15 : candidate.latestApplicationStatus === 'REVIEWING' ? 8 : 0)));
  };

  const visibleCandidates = candidates
    .map((candidate) => ({ candidate, aiScore: getAiScore(candidate) }))
    .filter(({ candidate, aiScore }) => (statusFilter === 'ALL' || candidate.latestApplicationStatus === statusFilter) && (aiScore === null || aiScore >= minimumScore))
    .sort((a, b) => rankByAi ? (b.aiScore ?? -1) - (a.aiScore ?? -1) : 0);

  const resetAiFilters = () => {
    setAiKeywords('');
    setMinimumScore(0);
    setStatusFilter('ALL');
    setRankByAi(true);
  };

  return (
    <Box sx={{ width: '100%', pb: 5 }}>
      {/* Header */}
      <Box sx={{ mb: 3.5, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.dark', letterSpacing: '-0.02em' }}>
            Quản lý Hồ sơ Ứng viên
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            Danh sách tất cả các ứng viên đã nộp đơn vào các vị trí tuyển dụng của công ty bạn.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 600 }}
        >
          Về Dashboard
        </Button>
      </Box>

      {/* Search Bar */}
      <Paper
        component="form"
        onSubmit={handleSearchSubmit}
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: '1px solid #e2e8f0',
          display: 'flex',
          gap: 1.5,
          alignItems: 'center',
          bgcolor: '#ffffff',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm ứng viên theo tên, email, kỹ năng (Java, React, SQL...)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
          sx={{ '& fieldset': { borderRadius: 2 } }}
        />
        <Button
          type="submit"
          variant="contained"
          sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 600, minWidth: 110 }}
        >
          Tìm kiếm
        </Button>
      </Paper>

      <Paper elevation={0} sx={{ mb: 3, border: '1px solid #d9e4f2', borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#f7fbff', gap: 2, flexWrap: 'wrap' }}>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: '#e7f1ff', color: '#1664d9' }}><SmartToyIcon fontSize="small" /></Avatar>
            <Box><Typography sx={{ fontWeight: 800, color: '#182b49' }}>Sàng lọc ứng viên bằng AI</Typography><Typography variant="caption" color="text.secondary">Đánh giá mức độ phù hợp dựa trên kỹ năng và tiến trình tuyển dụng</Typography></Box>
          </Stack>
          <Button size="small" startIcon={<RefreshIcon />} onClick={resetAiFilters} sx={{ textTransform: 'none', fontWeight: 700 }}>Đặt lại</Button>
        </Box>
        <Divider />
        <Box sx={{ p: 2.5, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(230px, 1.5fr) minmax(170px, 1fr) minmax(160px, .9fr)' }, gap: 2.25, alignItems: 'start' }}>
          <TextField size="small" label="Tiêu chí kỹ năng" placeholder="Ví dụ: React, Java, SQL" value={aiKeywords} onChange={(e) => setAiKeywords(e.target.value)} helperText="Ngăn cách từng kỹ năng bằng dấu phẩy" slotProps={{ input: { startAdornment: <InputAdornment position="start"><AutoAwesomeIcon color="primary" fontSize="small" /></InputAdornment> } }} />
          <Box sx={{ px: 1 }}><Typography variant="body2" sx={{ fontWeight: 700, mb: .75 }}>Điểm AI tối thiểu: <Box component="span" sx={{ color: 'primary.main' }}>{minimumScore}%</Box></Typography><Slider value={minimumScore} onChange={(_, value) => setMinimumScore(value as number)} size="small" valueLabelDisplay="auto" /></Box>
          <FormControl size="small" fullWidth><InputLabel>Trạng thái</InputLabel><Select value={statusFilter} label="Trạng thái" onChange={(e) => setStatusFilter(e.target.value as 'ALL' | ApplicationStatus)}><MenuItem value="ALL">Tất cả trạng thái</MenuItem><MenuItem value="APPLIED">Mới ứng tuyển</MenuItem><MenuItem value="REVIEWING">Đang xem xét</MenuItem><MenuItem value="INTERVIEWED">Đã phỏng vấn</MenuItem><MenuItem value="OFFERED">Đã đề nghị</MenuItem><MenuItem value="HIRED">Đã tuyển</MenuItem><MenuItem value="REJECTED">Đã từ chối</MenuItem></Select></FormControl>
        </Box>
        <Box sx={{ px: 2.5, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary"><Box component="span" sx={{ fontWeight: 800, color: 'text.primary' }}>{visibleCandidates.length}</Box> / {candidates.length} ứng viên phù hợp</Typography>
          <Button size="small" variant={rankByAi ? 'contained' : 'outlined'} startIcon={<WorkspacePremiumIcon />} onClick={() => setRankByAi(!rankByAi)} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5 }}>Xếp hạng theo AI</Button>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 3, borderRadius: 2 }}>{error}</Alert>
      ) : visibleCandidates.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
          <PersonSearchIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 1.5 }} />
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
            {activeSearch ? `Không tìm thấy ứng viên nào phù hợp với "${activeSearch}"` : 'Chưa có ứng viên nào nộp hồ sơ.'}
          </Typography>
          {activeSearch && (
            <Button variant="text" onClick={handleClearSearch} sx={{ mt: 1, textTransform: 'none' }}>
              Xóa bộ lọc tìm kiếm
            </Button>
          )}
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
          <Table sx={{ minWidth: 750 }} aria-label="candidate table">
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Họ và tên</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Liên hệ</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Điểm AI</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Kỹ năng</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Vị trí ứng tuyển gần nhất</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Ngày nộp</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: 'text.primary' }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleCandidates.map(({ candidate, aiScore }) => {
                const chipInfo = candidate.latestApplicationStatus
                  ? getStatusChipColor(candidate.latestApplicationStatus)
                  : { label: 'Chưa có', color: 'default' as const };

                const appliedDate = candidate.latestAppliedAt
                  ? new Date(candidate.latestAppliedAt).toLocaleDateString('vi-VN')
                  : 'N/A';

                return (
                  <TableRow
                    key={candidate.id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: 'primary.dark' }}>
                      {candidate.fullName}
                    </TableCell>

                    <TableCell>
                      <Stack spacing={0.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <EmailIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                          <Typography variant="body2">{candidate.email}</Typography>
                        </Box>
                        {candidate.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PhoneIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">{candidate.phone}</Typography>
                          </Box>
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell>
                      {aiScore === null ? <Typography variant="caption" color="text.disabled">Chưa phân tích</Typography> : <Chip label={`${aiScore}% phù hợp`} size="small" color={aiScore >= 70 ? 'success' : aiScore >= 45 ? 'warning' : 'error'} sx={{ fontWeight: 800, minWidth: 92 }} />}
                    </TableCell>

                    <TableCell sx={{ maxWidth: 220 }}>
                      {candidate.skills ? (
                        <Typography variant="body2" noWrap title={candidate.skills} color="text.secondary">
                          {candidate.skills}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.disabled">Chưa cập nhật</Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {candidate.latestJobTitle || 'N/A'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {candidate.latestApplicationStatus ? (
                        <Chip
                          label={chipInfo.label}
                          size="small"
                          color={chipInfo.color}
                          sx={{ fontWeight: 600, borderRadius: 1.5 }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.disabled">N/A</Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {appliedDate}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip title="Xem chi tiết hồ sơ & đánh giá">
                        <IconButton
                          color="primary"
                          onClick={() => navigate(`/candidates/${candidate.id}`)}
                          size="small"
                          sx={{ bgcolor: 'rgba(11, 108, 255, 0.08)', '&:hover': { bgcolor: 'rgba(11, 108, 255, 0.16)' } }}
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
    </Box>
  );
};

export default CandidateListPage;