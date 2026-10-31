import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PostAdd as PostAddIcon,
  WorkOutlined as WorkOutlineIcon,
} from '@mui/icons-material';
import api from '../../services/api';

const NewJobPostingPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    salary: '',
    experience: '',
    employmentType: 'FULL_TIME',
    jobType: 'IT',
    jobLevel: 'MID_LEVEL',
    status: 'OPEN',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim()) {
      setError('Vui lòng điền đầy đủ tiêu đề, mô tả và địa điểm làm việc.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.post('/api/hr/jobs', formData);
      navigate('/hr/job-postings');
    } catch (err: any) {
      console.error('Failed to post job:', err);
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi đăng tin tuyển dụng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', pb: 5 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3, textTransform: 'none', fontWeight: 600 }}
      >
        Quay lại
      </Button>

      <Paper elevation={0} sx={{ p: 0, overflow: 'hidden', borderRadius: 4, border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 18px 42px -20px rgba(15,23,42,0.3)' }}>
        <Box sx={{ px: { xs: 3, md: 4.5 }, py: 3.5, color: '#fff', background: 'linear-gradient(120deg, #0f172a 0%, #1e293b 55%, #334155 100%)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(26,35,126,0.18)', color: '#7986cb', display: 'flex' }}>
              <WorkOutlineIcon />
            </Box>
            <Box>
              <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '0.14em', color: '#7986cb' }}>
                Employer Center · Create Job
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff' }}>
                Đăng Tin Tuyển Dụng Mới
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ p: { xs: 3, md: 4.5 } }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>
          Điền các thông tin chi tiết dưới đây để ứng viên có thể tìm thấy và ứng tuyển vào vị trí công việc này.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Tin ở trạng thái <strong>Đang mở</strong> sẽ được hiển thị công khai trên trang Việc làm để ứng viên tìm kiếm và ứng tuyển.
            </Alert>
            <TextField
              label="Tiêu đề công việc *"
              fullWidth
              placeholder="VD: Senior React/Node.js Developer, Chuyên viên Tuyển dụng..."
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
              <TextField
                label="Địa điểm làm việc *"
                fullWidth
                placeholder="VD: Hà Nội, TP. Hồ Chí Minh, Remote..."
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                required
              />

              <TextField
                label="Mức lương"
                fullWidth
                placeholder="VD: 15 - 25 triệu VNĐ, Thỏa thuận, Up to $2000..."
                value={formData.salary}
                onChange={(e) => handleChange('salary', e.target.value)}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="emp-type-label">Hình thức làm việc</InputLabel>
                <Select
                  labelId="emp-type-label"
                  value={formData.employmentType}
                  label="Hình thức làm việc"
                  onChange={(e) => handleChange('employmentType', e.target.value)}
                >
                  <MenuItem value="FULL_TIME">Toàn thời gian (Full-time)</MenuItem>
                  <MenuItem value="PART_TIME">Bán thời gian (Part-time)</MenuItem>
                  <MenuItem value="CONTRACT">Hợp đồng (Contract)</MenuItem>
                  <MenuItem value="INTERNSHIP">Thực tập (Internship)</MenuItem>
                  <MenuItem value="TEMPORARY">Tạm thời (Temporary)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel id="job-type-label">Lĩnh vực / Ngành nghề</InputLabel>
                <Select
                  labelId="job-type-label"
                  value={formData.jobType}
                  label="Lĩnh vực / Ngành nghề"
                  onChange={(e) => handleChange('jobType', e.target.value)}
                >
                  <MenuItem value="IT">Công nghệ thông tin (IT)</MenuItem>
                  <MenuItem value="MARKETING">Marketing & Truyền thông</MenuItem>
                  <MenuItem value="FINANCE">Tài chính / Kế toán</MenuItem>
                  <MenuItem value="HR">Nhân sự / Tuyển dụng</MenuItem>
                  <MenuItem value="DESIGN">Thiết kế đồ họa / UI-UX</MenuItem>
                  <MenuItem value="OTHER">Ngành nghề khác</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel id="job-level-label">Cấp bậc</InputLabel>
                <Select
                  labelId="job-level-label"
                  value={formData.jobLevel}
                  label="Cấp bậc"
                  onChange={(e) => handleChange('jobLevel', e.target.value)}
                >
                  <MenuItem value="ENTRY_LEVEL">Mới tốt nghiệp (Entry Level)</MenuItem>
                  <MenuItem value="JUNIOR">Junior (1 - 2 năm)</MenuItem>
                  <MenuItem value="MID_LEVEL">Middle (2 - 4 năm)</MenuItem>
                  <MenuItem value="SENIOR">Senior (5+ năm)</MenuItem>
                  <MenuItem value="MANAGER">Quản lý / Trưởng nhóm (Manager)</MenuItem>
                  <MenuItem value="DIRECTOR">Giám đốc (Director)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel id="status-label">Trạng thái tin</InputLabel>
                <Select
                  labelId="status-label"
                  value={formData.status}
                  label="Trạng thái tin"
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <MenuItem value="OPEN">Đang mở (Công khai)</MenuItem>
                  <MenuItem value="DRAFT">Bản nháp (Chờ duyệt)</MenuItem>
                  <MenuItem value="PAUSED">Tạm dừng nhận hồ sơ</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              label="Yêu cầu kinh nghiệm"
              fullWidth
              placeholder="VD: Tối thiểu 2 năm kinh nghiệm trong lĩnh vực liên quan..."
              value={formData.experience}
              onChange={(e) => handleChange('experience', e.target.value)}
            />

            <TextField
              label="Mô tả công việc & Yêu cầu chi tiết *"
              multiline
              rows={8}
              fullWidth
              placeholder="Nhập chi tiết trách nhiệm công việc, yêu cầu chuyên môn, kỹ năng cần thiết và các quyền lợi đãi ngộ..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              required
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/hr/job-postings')}
                sx={{ textTransform: 'none', px: 3, fontWeight: 600 }}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={<PostAddIcon />}
                sx={{ textTransform: 'none', px: 4, fontWeight: 700, borderRadius: 2 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng tin tuyển dụng'}
              </Button>
            </Box>
          </Stack>
        </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default NewJobPostingPage;

