import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Save as SaveIcon,
  EditNote as EditNoteIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import type { JobResponse } from '../../types';

const normalizeJobLevel = (level?: string): string => {
  const normalized = level?.trim().toUpperCase().replace(/[\s-]+/g, '_');
  const legacyValues: Record<string, string> = {
    ENTRY: 'ENTRY_LEVEL',
    ENTRY_LEVEL: 'ENTRY_LEVEL',
    MID: 'MID_LEVEL',
    MID_LEVEL: 'MID_LEVEL',
  };
  const validLevels = ['ENTRY_LEVEL', 'JUNIOR', 'MID_LEVEL', 'SENIOR', 'MANAGER', 'DIRECTOR'];
  const value = legacyValues[normalized || ''] || normalized;
  return validLevels.includes(value || '') ? value || 'MID_LEVEL' : 'MID_LEVEL';
};

const EditJobPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) return;
      try {
        setLoading(true);
        setError(null);
        const response = await api.get<JobResponse>(`/api/hr/jobs/${jobId}`);
        const job = response.data;
        setFormData({
          title: job.title || '',
          description: job.description || '',
          location: job.location || '',
          salary: job.salary || '',
          experience: job.experience || '',
          employmentType: job.employmentType || 'FULL_TIME',
          jobType: job.jobType || 'IT',
          jobLevel: normalizeJobLevel(job.jobLevel),
          status: job.status || 'OPEN',
        });
      } catch (err: any) {
        console.error('Failed to fetch job to edit:', err);
        setError(err?.response?.data?.message || 'Không thể tải thông tin tin tuyển dụng.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

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
      setSaving(true);
      setError(null);
      await api.put(`/api/hr/jobs/${jobId}`, formData);
      navigate('/hr/job-postings');
    } catch (err: any) {
      console.error('Failed to update job:', err);
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật tin tuyển dụng.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', pb: 5 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/hr/job-postings')}
        sx={{ mb: 3, textTransform: 'none', fontWeight: 600 }}
      >
        Quay lại danh sách tin
      </Button>

      <Paper elevation={0} sx={{ p: { xs: 3, md: 4.5 }, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.main', display: 'flex' }}>
            <EditNoteIcon />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.dark' }}>
            Chỉnh Sửa Tin Tuyển Dụng
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>
          Cập nhật thông tin chi tiết cho vị trí tuyển dụng #{jobId}.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Tiêu đề công việc *"
              fullWidth
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
              <TextField
                label="Địa điểm làm việc *"
                fullWidth
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                required
              />

              <TextField
                label="Mức lương"
                fullWidth
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
                  <MenuItem value="CLOSED">Đã đóng tuyển dụng</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              label="Yêu cầu kinh nghiệm"
              fullWidth
              value={formData.experience}
              onChange={(e) => handleChange('experience', e.target.value)}
            />

            <TextField
              label="Mô tả công việc & Yêu cầu chi tiết *"
              multiline
              rows={8}
              fullWidth
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
                disabled={saving}
                startIcon={<SaveIcon />}
                sx={{ textTransform: 'none', px: 4, fontWeight: 700, borderRadius: 2 }}
              >
                {saving ? <CircularProgress size={24} color="inherit" /> : 'Lưu cập nhật'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditJobPage;
