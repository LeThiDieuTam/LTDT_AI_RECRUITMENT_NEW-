import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Chip,
  Stack,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  MenuItem,
  Select,
  Tabs,
  Tab,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Search as SearchIcon,
  LocationOn as LocationOnIcon,
  AttachMoney as AttachMoneyIcon,
  Business as BusinessIcon,
  ArrowForward as ArrowForwardIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Code as CodeIcon,
  TrendingUp as TrendingUpIcon,
  Campaign as CampaignIcon,
  AccountBalance as BankIcon,
  PeopleAlt as PeopleAltIcon,
  Palette as PaletteIcon,
  Description as DescriptionIcon,
  WorkOutlined as WorkOutlineIcon,
  Domain as DomainIcon,
  WorkspacePremium as PremiumIcon,
  ElectricBolt as ElectricBoltIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import type { JobResponse, PageResponse, CompanyResponse } from '../../types';

// ─── Styled Components ─────────────────────────────────────────────────────
const JobCard = styled(Paper)(() => ({
  width: '100%',
  height: '100%',
  padding: '20px',
  borderRadius: 16,
  position: 'relative',
  overflow: 'hidden',
  boxSizing: 'border-box',
  border: '1px solid #e2e8f0',
  backgroundColor: '#ffffff',
  transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  '&:hover': {
    transform: 'translateY(-4px)',
    borderColor: '#1a237e',
    boxShadow: '0 12px 28px rgba(0, 177, 79, 0.12)',
    '& .job-title': {
      color: '#1a237e',
    },
  },
}));

const CategoryCard = styled(Paper)(() => ({
  padding: '20px 16px',
  borderRadius: 16,
  textAlign: 'center',
  border: '1px solid #e2e8f0',
  backgroundColor: '#ffffff',
  cursor: 'pointer',
  transition: 'all 0.22s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    borderColor: '#1a237e',
    boxShadow: '0 10px 24px rgba(0, 177, 79, 0.12)',
  },
}));

const categories = [
  { icon: <CodeIcon sx={{ fontSize: 30, color: '#1a237e' }} />, name: 'IT / Phần Mềm', count: '120+ Việc làm', bg: '#e8eaf6' },
  { icon: <TrendingUpIcon sx={{ fontSize: 30, color: '#3949ab' }} />, name: 'Kinh Doanh / Bán Hàng', count: '95+ Việc làm', bg: '#e0f2fe' },
  { icon: <CampaignIcon sx={{ fontSize: 30, color: '#ec4899' }} />, name: 'Marketing / Truyền Thông', count: '80+ Việc làm', bg: '#fce7f3' },
  { icon: <BankIcon sx={{ fontSize: 30, color: '#ca8a04' }} />, name: 'Tài Chính / Ngân Hàng', count: '65+ Việc làm', bg: '#fef3c7' },
  { icon: <PeopleAltIcon sx={{ fontSize: 30, color: '#16a34a' }} />, name: 'Nhân Sự / Hành Chính', count: '45+ Việc làm', bg: '#dcfce7' },
  { icon: <PaletteIcon sx={{ fontSize: 30, color: '#8b5cf6' }} />, name: 'Thiết Kế Đồ Họa', count: '40+ Việc làm', bg: '#ede9fe' },
];

const hotKeywords = ['Java', 'ReactJS', 'NodeJS', 'Tester', 'Kế toán', 'Nhân viên kinh doanh', 'Marketing', 'Thực tập sinh', 'Remote'];

const PublicGuestDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search filters
  const [keyword, setKeyword] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [jobsRes, companiesRes] = await Promise.all([
          api.get<PageResponse<JobResponse>>('/api/jobs').catch(() => ({ data: { content: [] } })),
          api.get<{ content: CompanyResponse[] }>('/api/companies').catch(() => ({ data: { content: [] } })),
        ]);

        if (jobsRes.data && Array.isArray(jobsRes.data.content)) {
          setJobs(jobsRes.data.content);
        }
        if (companiesRes.data && Array.isArray(companiesRes.data.content)) {
          setCompanies(companiesRes.data.content.slice(0, 4));
        }
      } catch (e) {
        console.error('Error fetching public landing data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.append('keyword', keyword.trim());
    if (locationFilter && locationFilter !== 'all') params.append('location', locationFilter);
    navigate(`/jobs?${params.toString()}`);
  };

  const filteredJobs = jobs.filter((job) => {
    if (locationFilter && locationFilter !== 'all') {
      return job.location.toLowerCase().includes(locationFilter.toLowerCase());
    }
    return true;
  });

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4.5, pb: 8 }}>

      {/* ── 1. HireHub Mega Hero Search Section ── */}
      <Box
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #171923 0%, #1a365d 45%, #0d1442 100%)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.15)',
          p: { xs: 3, sm: 4, md: 5 },
          color: '#ffffff',
          position: 'relative',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2, maxWidth: 960, mx: 'auto', textAlign: 'center' }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Chip
              icon={<ElectricBoltIcon sx={{ color: '#fef08a !important', fontSize: 16 }} />}
              label="HIREHUB - NỀN TẢNG TUYỂN DỤNG HÀNG ĐẦU VIỆT NAM"
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.74rem',
                letterSpacing: '0.06em',
                px: 1,
              }}
            />
          </Box>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}
          >
            Tìm Việc Làm Phù Hợp - <Box component="span" sx={{ color: '#4ade80' }}>Nâng Tầm Sự Nghiệp</Box> 
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mt: 1.5,
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: 1.6,
              fontSize: { xs: '0.95rem', md: '1.08rem' },
              maxWidth: 700,
              mx: 'auto',
            }}
          >
            Hơn 500+ vị trí tuyển dụng mới mỗi ngày từ 1.000+ doanh nghiệp uy tín. Tạo CV chuẩn mẫu và ứng tuyển nhanh chóng.
          </Typography>

          {/* HireHub Consolidated Search Box */}
          <Paper
            component="form"
            onSubmit={handleSearch}
            elevation={0}
            sx={{
              p: { xs: 1.5, md: 1 },
              mt: 3.5,
              borderRadius: { xs: 3, md: '999px' },
              bgcolor: '#ffffff',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              gap: 1.5,
              maxWidth: 880,
              mx: 'auto',
            }}
          >
            {/* Input Keyword */}
            <TextField
              fullWidth
              size="small"
              placeholder="Vị trí tuyển dụng, tên công ty, kỹ năng..."
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
                '& input': { fontSize: '0.95rem', fontWeight: 500, color: '#0f172a' },
              }}
            />

            {/* Location Filter Select */}
            <Box sx={{ width: { xs: '100%', md: 220 }, display: 'flex', alignItems: 'center', borderLeft: { md: '1px solid #e2e8f0' }, pl: { md: 1 } }}>
              <LocationOnIcon sx={{ color: '#1a237e', ml: 1, mr: 0.5, fontSize: 20 }} />
              <Select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                size="small"
                variant="standard"
                disableUnderline
                fullWidth
                sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}
              >
                <MenuItem value="all">Tất cả địa điểm</MenuItem>
                <MenuItem value="Hà Nội">Hà Nội</MenuItem>
                <MenuItem value="Hồ Chí Minh">TP. Hồ Chí Minh</MenuItem>
                <MenuItem value="Đà Nẵng">Đà Nẵng</MenuItem>
                <MenuItem value="Toàn quốc">Toàn quốc / Remote</MenuItem>
              </Select>
            </Box>

            {/* Search Submit Button */}
            <Button
              type="submit"
              variant="contained"
              startIcon={<SearchIcon />}
              sx={{
                borderRadius: '999px',
                px: 3.5,
                py: 1.2,
                bgcolor: '#1a237e',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.95rem',
                textTransform: 'none',
                whiteSpace: 'nowrap',
                width: { xs: '100%', md: 'auto' },
                boxShadow: '0 4px 16px rgba(0, 177, 79, 0.4)',
                '&:hover': { bgcolor: '#0d1442' },
              }}
            >
              Tìm kiếm
            </Button>
          </Paper>

          {/* Quick Search Tags */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2.5, flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.75)', fontWeight: 700 }}>
              Từ khóa phổ biến:
            </Typography>
            {hotKeywords.map((kw) => (
              <Chip
                key={kw}
                label={kw}
                size="small"
                onClick={() => { setKeyword(kw); navigate(`/jobs?keyword=${encodeURIComponent(kw)}`); }}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#1a237e' },
                  transition: 'all 0.15s',
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── 2. HireHub Market Today Pulse (Thị trường việc làm hôm nay) ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2.5,
        }}
      >
        {[
          { icon: <WorkOutlineIcon sx={{ color: '#1a237e', fontSize: 28 }} />, count: '1.250+', label: 'Việc làm mới hôm nay', sub: 'Tăng 15% so với tuần trước' },
          { icon: <DomainIcon sx={{ color: '#3949ab', fontSize: 28 }} />, count: '10.000+', label: 'Doanh nghiệp uy tín', sub: 'Hàng nghìn tập đoàn hàng đầu' },
          { icon: <PremiumIcon sx={{ color: '#ca8a04', fontSize: 28 }} />, count: '45.000+', label: 'Cơ hội nghề nghiệp', sub: 'Đa dạng ngành nghề & cấp bậc' },
        ].map((item) => (
          <Paper
            key={item.label}
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#f4fbf7', display: 'flex' }}>
              {item.icon}
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#171923', lineHeight: 1 }}>
                {item.count}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mt: 0.3 }}>
                {item.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.sub}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* ── 3. HireHub Login & Experience Required Banner (Yêu cầu đăng nhập) ── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3.5,
          p: { xs: 3, sm: 3.5 },
          background: 'linear-gradient(135deg, #e8eaf6 0%, #ffffff 100%)',
          border: '2px solid #1a237e',
          boxShadow: '0 8px 24px rgba(0, 177, 79, 0.1)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 3,
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              bgcolor: '#1a237e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
              boxShadow: '0 6px 16px rgba(0, 177, 79, 0.35)',
            }}
          >
            <DescriptionIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#171923', letterSpacing: '-0.02em', fontSize: '1.15rem' }}>
              Trải Nghiệm Đầy Đủ Tính Năng Cùng HireHub
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', mt: 0.5, lineHeight: 1.5, fontSize: '0.9rem' }}>
              <strong>Đăng nhập</strong> hoặc <strong>Đăng ký tài khoản</strong> để tạo CV chuyên nghiệp, nộp đơn ứng tuyển trực tiếp vào các vị trí yêu thích và nhận thông báo phỏng vấn sớm nhất!
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={() => navigate('/login')}
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              borderRadius: '8px',
              px: 3,
              py: 1,
              bgcolor: '#1a237e',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(0, 177, 79, 0.3)',
              '&:hover': { bgcolor: '#0d1442' },
              flex: { xs: 1, sm: 'none' },
            }}
          >
            Đăng nhập ngay
          </Button>
          <Button
            variant="outlined"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate('/register')}
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              borderRadius: '8px',
              px: 3,
              py: 1,
              borderColor: '#1a237e',
              color: '#1a237e',
              '&:hover': { borderColor: '#0d1442', bgcolor: '#e8eaf6' },
              flex: { xs: 1, sm: 'none' },
            }}
          >
            Đăng ký tài khoản
          </Button>
        </Stack>
      </Paper>

      {/* ── 4. HireHub Featured Jobs Section with Tabs ── */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#171923', letterSpacing: '-0.02em', fontSize: { xs: '1.4rem', md: '1.75rem' } }}>
              Việc Làm Tốt Nhất Dành Cho Bạn
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Hàng trăm công việc hấp dẫn được cập nhật liên tục từ các doanh nghiệp hàng đầu
            </Typography>
          </Box>
          <Button
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/jobs')}
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              borderRadius: '8px',
              borderColor: '#1a237e',
              color: '#1a237e',
              '&:hover': { borderColor: '#0d1442', bgcolor: '#e8eaf6' },
            }}
          >
            Xem tất cả việc làm ({jobs.length})
          </Button>
        </Box>

        {/* Filter Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: '0.92rem', color: '#64748b' },
              '& .Mui-selected': { color: '#1a237e !important' },
              '& .MuiTabs-indicator': { bgcolor: '#1a237e' },
            }}
          >
            <Tab label="Việc làm hấp dẫn" />
            <Tab label="Việc làm mới nhất" />
            <Tab label="Việc làm lương cao" />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#1a237e' }} />
          </Box>
        ) : filteredJobs.length === 0 ? (
          <Paper elevation={0} sx={{ p: 6, textAlign: 'center', bgcolor: '#ffffff', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
            <Typography variant="h6" color="text.secondary">
              Đang cập nhật danh sách việc làm...
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
            {filteredJobs.slice(0, 9).map((job) => (
              <JobCard key={job.id} elevation={0}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        bgcolor: '#e8eaf6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1a237e',
                        flexShrink: 0,
                        fontWeight: 900,
                        fontSize: '1.1rem',
                        border: '1px solid rgba(0, 177, 79, 0.2)',
                      }}
                    >
                      {job.companyName ? job.companyName.charAt(0).toUpperCase() : 'C'}
                    </Box>
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography
                        className="job-title"
                        variant="h6"
                        noWrap
                        sx={{
                          fontWeight: 800,
                          color: '#171923',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          transition: 'color 0.2s',
                        }}
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        {job.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                        {job.companyName || 'Công ty tuyển dụng'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Badges */}
                  <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.8 }}>
                    <Chip
                      icon={<AttachMoneyIcon fontSize="small" />}
                      label={job.salary || 'Thỏa thuận'}
                      size="small"
                      sx={{
                        bgcolor: '#e8eaf6',
                        color: '#1a237e',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        '& .MuiChip-icon': { color: '#1a237e' },
                      }}
                    />
                    <Chip
                      icon={<LocationOnIcon fontSize="small" />}
                      label={job.location}
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: '#e2e8f0', fontSize: '0.74rem', fontWeight: 600, color: '#475569' }}
                    />
                  </Stack>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      minHeight: 40,
                      fontSize: '0.82rem',
                    }}
                  >
                    {job.description || 'Không có mô tả chi tiết.'}
                  </Typography>

                  {/* Action row */}
                  <Stack direction="row" spacing={1.5} sx={{ pt: 1.5, borderTop: '1px solid #f1f5f9', alignItems: 'center' }}>
                    <Button
                      variant="text"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.82rem', color: '#475569' }}
                    >
                      Chi tiết
                    </Button>

                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => navigate('/login')}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 800,
                        borderRadius: '6px',
                        ml: 'auto',
                        fontSize: '0.8rem',
                        px: 2.2,
                        bgcolor: '#1a237e',
                        '&:hover': { bgcolor: '#0d1442' },
                      }}
                    >
                      Ứng tuyển ngay
                    </Button>
                  </Stack>
                </Stack>
              </JobCard>
            ))}
          </Box>
        )}
      </Box>

      {/* ── 5. Kho Mẫu CV Chuyên Nghiệp HireHub (CV Templates Section) ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3.5, sm: 4.5 },
          borderRadius: 4,
          bgcolor: '#ffffff',
          border: '1px solid #e2e8f0',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5, flexWrap: 'wrap', gap: 1.5 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#171923', letterSpacing: '-0.02em', fontSize: { xs: '1.4rem', md: '1.75rem' } }}>
              Mẫu CV Chuyên Nghiệp Chuẩn Quốc Tế
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Tăng 80% tỷ lệ được gọi phỏng vấn với các mẫu CV được thiết kế chuẩn mực bởi HireHub
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => navigate('/candidate/cvs')}
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              borderRadius: '8px',
              bgcolor: '#1a237e',
              '&:hover': { bgcolor: '#0d1442' },
            }}
          >
            Khám phá kho CV
          </Button>
        </Box>

        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } }}>
          {[
            { name: 'Mẫu CV Tiêu Chuẩn', desc: 'Phù hợp mọi ngành nghề & cấp bậc', tag: 'Phổ biến nhất' },
            { name: 'Mẫu CV IT Developer', desc: 'Tối ưu cho Lập trình viên & Kỹ sư', tag: 'Công nghệ' },
            { name: 'Mẫu CV Kinh Doanh & Sales', desc: 'Nổi bật thành tích & doanh số', tag: 'Kinh doanh' },
            { name: 'Mẫu CV Marketing Sáng Tạo', desc: 'Trình bày portfolio & chiến dịch', tag: 'Sáng tạo' },
          ].map((tpl) => (
            <Paper
              key={tpl.name}
              elevation={0}
              onClick={() => navigate('/candidate/cvs/new')}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                bgcolor: '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.22s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderColor: '#1a237e',
                  boxShadow: '0 8px 20px rgba(0, 177, 79, 0.15)',
                },
              }}
            >
              <Box sx={{ height: 140, bgcolor: '#ffffff', borderRadius: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #cbd5e1' }}>
                <DescriptionIcon sx={{ fontSize: 48, color: '#1a237e' }} />
              </Box>
              <Chip label={tpl.tag} size="small" sx={{ bgcolor: '#e8eaf6', color: '#1a237e', fontWeight: 700, fontSize: '0.7rem', mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#171923', lineHeight: 1.3 }}>
                {tpl.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {tpl.desc}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Paper>

      {/* ── 6. Top Ngành Nghề Nổi Bật ── */}
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#171923', letterSpacing: '-0.02em', mb: 0.5, fontSize: { xs: '1.4rem', md: '1.75rem' } }}>
          Top Ngành Nghề Nổi Bật
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Khám phá cơ hội việc làm phong phú theo từng lĩnh vực chuyên môn
        </Typography>

        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' } }}>
          {categories.map((cat) => (
            <CategoryCard key={cat.name} onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(cat.name.split('/')[0].trim())}`)}>
              <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: '12px', bgcolor: cat.bg, mb: 1.5 }}>
                {cat.icon}
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#171923', fontSize: '0.85rem', lineHeight: 1.3 }}>
                {cat.name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#1a237e', fontWeight: 700, display: 'block', mt: 0.5 }}>
                {cat.count}
              </Typography>
            </CategoryCard>
          ))}
        </Box>
      </Box>

      {/* ── 7. Top Doanh Nghiệp Tuyển Dụng Hàng Đầu ── */}
      {companies.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#171923', letterSpacing: '-0.02em', fontSize: { xs: '1.4rem', md: '1.75rem' } }}>
                Top Doanh Nghiệp Tuyển Dụng Hàng Đầu
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Các nhà tuyển dụng nổi bật đang tích cực tìm kiếm nhân tài
              </Typography>
            </Box>
            <Button
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/companies')}
              sx={{
                textTransform: 'none',
                fontWeight: 800,
                borderRadius: '8px',
                borderColor: '#1a237e',
                color: '#1a237e',
                '&:hover': { borderColor: '#0d1442', bgcolor: '#e8eaf6' },
              }}
            >
              Xem tất cả
            </Button>
          </Box>

          <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } }}>
            {companies.map((c) => (
              <Paper
                key={c.id}
                elevation={0}
                onClick={() => navigate('/companies')}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid #e2e8f0',
                  bgcolor: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.22s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: '#1a237e',
                    boxShadow: '0 8px 20px rgba(0, 177, 79, 0.12)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    bgcolor: '#e8eaf6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1a237e',
                    mb: 2,
                  }}
                >
                  <BusinessIcon />
                </Box>
                <Typography variant="h6" noWrap sx={{ fontWeight: 800, color: '#171923', mb: 0.5, fontSize: '1rem' }}>
                  {c.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  {c.city || 'Việt Nam'} • {c.industry || 'Đa ngành nghề'}
                </Typography>
                <Chip label="Đang tuyển dụng" size="small" sx={{ bgcolor: '#e8eaf6', color: '#1a237e', fontWeight: 700, fontSize: '0.72rem' }} />
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      {/* ── 8. Quy Trình 3 Bước HireHub ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3.5, sm: 5 },
          borderRadius: 4,
          bgcolor: '#ffffff',
          border: '1px solid #e2e8f0',
        }}
      >
        <Box sx={{ textAlign: 'center', maxWidth: 640, mx: 'auto', mb: 4.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#171923', letterSpacing: '-0.02em', fontSize: { xs: '1.4rem', md: '1.75rem' } }}>
            Dễ Dàng Tìm Việc Trong 3 Bước
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Quy trình tuyển dụng tinh gọn kết nối ứng viên nhanh nhất với nhà tuyển dụng
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {[
            { step: '01', title: 'Tạo CV Chuyên Nghiệp', desc: 'Chọn mẫu CV chuẩn quốc tế và hoàn thiện thông tin hồ sơ chỉ trong 3 phút.', icon: <DescriptionIcon sx={{ fontSize: 28, color: '#1a237e' }} /> },
            { step: '02', title: 'Khám Phá Việc Làm', desc: 'Tìm kiếm vị trí phù hợp theo mức lương, địa điểm và kỹ năng chuyên môn.', icon: <SearchIcon sx={{ fontSize: 28, color: '#3949ab' }} /> },
            { step: '03', title: 'Ứng Tuyển & Phỏng Vấn', desc: 'Nộp hồ sơ trực tiếp chỉ với 1 chạm và nhận phản hồi nhanh chóng từ nhà tuyển dụng.', icon: <CheckCircleIcon sx={{ fontSize: 28, color: '#16a34a' }} /> },
          ].map((item) => (
            <Paper
              key={item.step}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ p: 1.2, borderRadius: '10px', bgcolor: '#ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                  {item.icon}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#cbd5e1' }}>
                  {item.step}
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#171923', mb: 0.8, fontSize: '1rem' }}>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, fontSize: '0.85rem' }}>
                {item.desc}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Paper>

      {/* ── 9. Bottom Call To Action ── */}
      <Box
        sx={{
          borderRadius: 4,
          p: { xs: 4, md: 5 },
          textAlign: 'center',
          background: 'linear-gradient(135deg, #171923 0%, #1a365d 60%, #0d1442 100%)',
          color: '#ffffff',
          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1.5, fontSize: { xs: '1.5rem', md: '2rem' } }}>
          Sẵn Sàng Nâng Tầm Sự Nghiệp Cùng HireHub?
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.85)', maxWidth: 540, mx: 'auto', mb: 3.5, lineHeight: 1.6 }}>
          Hơn 500+ vị trí tuyển dụng mơ ước đang chờ bạn. Tạo tài khoản ngay hôm nay để bắt đầu!
        </Typography>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{
              borderRadius: '8px',
              px: 4,
              py: 1.2,
              bgcolor: '#1a237e',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.95rem',
              textTransform: 'none',
              boxShadow: '0 6px 18px rgba(0, 177, 79, 0.4)',
              '&:hover': { bgcolor: '#0d1442' },
            }}
          >
            Đăng ký tài khoản ngay
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/login')}
            sx={{
              borderRadius: '8px',
              px: 4,
              py: 1.2,
              borderColor: 'rgba(255, 255, 255, 0.6)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.95rem',
              textTransform: 'none',
              '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.1)' },
            }}
          >
            Đăng nhập
          </Button>
        </Stack>
      </Box>

    </Box>
  );
};

export default PublicGuestDashboard;
