import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Paper,
  Stack,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardActionArea,
  Snackbar,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import type { CvRequest, CvResponse, CvTemplateResponse, UserResponse } from '../../types';
import CvRenderer, { CV_TEMPLATES } from '../../components/CvRenderer';

const CvEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState<CvRequest>({
    title: '',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    avatarUrl: '',
    targetTitle: '',
    summary: '',
    skills: '',
    experience: '',
    education: '',
    certificates: '',
    resumeUrl: 'modern',
    isDefault: false,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null);

  // Tab for mobile view (Edit vs Preview)
  const [activeTab, setActiveTab] = useState<number>(0);

  useEffect(() => {
    // 1. If in Edit Mode, fetch existing CV
    if (isEditMode && id) {
      const fetchCv = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await api.get<CvResponse>(`/api/cvs/${id}`);
          const cv = res.data;
          setFormData({
            title: cv.title || '',
            fullName: cv.fullName || '',
            email: cv.email || '',
            phone: cv.phone || '',
            address: cv.address || '',
            avatarUrl: cv.avatarUrl || '',
            targetTitle: cv.targetTitle || '',
            summary: cv.summary || '',
            skills: cv.skills || '',
            experience: cv.experience || '',
            education: cv.education || '',
            certificates: cv.certificates || '',
            resumeUrl: cv.resumeUrl || 'modern',
            isDefault: cv.isDefault || false,
          });
        } catch (err: any) {
          console.error('Failed to load CV for edit:', err);
          setError(err?.response?.data?.message || 'Không thể tải thông tin CV.');
        } finally {
          setLoading(false);
        }
      };
      fetchCv();
    } else {
      // 2. Check if templateData passed from router state
      const state = location.state as { templateData?: CvTemplateResponse } | undefined;
      if (state && state.templateData) {
        const tpl = state.templateData;
        setFormData({
          title: tpl.sampleTitle,
          fullName: tpl.sampleFullName,
          email: tpl.sampleEmail || '',
          phone: tpl.samplePhone || '',
          address: tpl.sampleAddress || '',
          avatarUrl: tpl.sampleAvatarUrl || '',
          targetTitle: tpl.sampleTargetTitle || '',
          summary: tpl.sampleSummary || '',
          skills: tpl.sampleSkills || '',
          experience: tpl.sampleExperience || '',
          education: tpl.sampleEducation || '',
          certificates: tpl.sampleCertificates || '',
          resumeUrl: tpl.templateId || 'modern',
          isDefault: false,
        });
      } else {
        // Auto-populate with logged in user profile info if available
        try {
          const stored = localStorage.getItem('user_info');
          if (stored) {
            const user = JSON.parse(stored);
            setFormData((prev) => ({
              ...prev,
              title: prev.title || `CV ${user.fullName || 'Ứng viên'}`,
              fullName: prev.fullName || user.fullName || '',
              email: prev.email || user.email || '',
              phone: prev.phone || user.phone || '',
              address: prev.address || user.address || '',
              skills: prev.skills || user.skills || '',
              experience: prev.experience || user.experience || '',
              education: prev.education || user.education || '',
            }));
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }, [id, isEditMode, location.state]);

  const handleFieldChange = (field: keyof CvRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAutoFillFromProfile = async () => {
    try {
      const res = await api.get<UserResponse>('/api/users/profile');
      const user = res.data;
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
        skills: user.skills || prev.skills,
        experience: user.experience || prev.experience,
        education: user.education || prev.education,
      }));
      setSnackbarMsg('Đã cập nhật thông tin từ hồ sơ cá nhân của bạn!');
    } catch (err) {
      alert('Không thể tải dữ liệu hồ sơ cá nhân.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Vui lòng nhập Tiêu đề CV');
      return;
    }
    if (!formData.fullName.trim()) {
      alert('Vui lòng nhập Họ và tên');
      return;
    }

    setSaving(true);
    try {
      if (isEditMode && id) {
        await api.put(`/api/cvs/${id}`, formData);
        setSnackbarMsg('Đã cập nhật CV thành công!');
      } else {
        await api.post('/api/cvs', formData);
        setSnackbarMsg('Đã tạo CV mới thành công!');
      }
      setTimeout(() => {
        navigate('/candidate/cvs');
      }, 800);
    } catch (err: any) {
      console.error('Failed to save CV:', err);
      alert(err?.response?.data?.message || 'Có lỗi xảy ra khi lưu CV.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 8 }}>
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/candidate/cvs')}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Danh sách CV
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
            {isEditMode ? 'Chỉnh sửa CV' : 'Tạo CV Ứng viên Mới'}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<PersonIcon />}
            onClick={handleAutoFillFromProfile}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            Lấy dữ liệu từ Hồ sơ
          </Button>

          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3 }}
          >
            {saving ? 'Đang lưu...' : 'Lưu CV'}
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs for mobile view */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} centered>
          <Tab label="Soạn thảo thông tin" />
          <Tab label="Xem trước CV" />
        </Tabs>
      </Box>

      {/* Main Grid: Left Form - Right Live Preview */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Left Form */}
        <Box sx={{ display: { xs: activeTab === 0 ? 'block' : 'none', md: 'block' } }}>
          <Stack spacing={3}>
            {/* Template Selector Card */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, color: 'primary.dark' }}>
                1. Chọn Mẫu Thiết Kế CV (Template Style)
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
                {CV_TEMPLATES.map((tpl) => {
                  const isSelected = formData.resumeUrl === tpl.id;
                  return (
                    <Box key={tpl.id}>
                      <Card
                        elevation={0}
                        sx={{
                          border: isSelected ? `2px solid ${tpl.color}` : '1px solid #e2e8f0',
                          borderRadius: 2.5,
                          bgcolor: isSelected ? `${tpl.color}10` : 'white',
                          transition: 'all 0.2s',
                        }}
                      >
                        <CardActionArea
                          onClick={() => handleFieldChange('resumeUrl', tpl.id)}
                          sx={{ p: 1.5, textAlign: 'center' }}
                        >
                          <Box
                            sx={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              bgcolor: tpl.color,
                              mx: 'auto',
                              mb: 0.5,
                            }}
                          />
                          <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: '#1e293b' }}>
                            {tpl.name.split('(')[0]}
                          </Typography>
                        </CardActionArea>
                      </Card>
                    </Box>
                  );
                })}
              </Box>
            </Paper>

            {/* General Info */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: 'primary.dark' }}>
                2. Thông tin Chung & Liên hệ
              </Typography>

              <Stack spacing={2}>
                <TextField
                  label="Tiêu đề bản CV *"
                  placeholder="VD: CV Lập trình viên Fullstack React & Spring Boot"
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  fullWidth
                  size="small"
                  required
                />

                <TextField
                  label="Vị trí ứng tuyển mục tiêu"
                  placeholder="VD: Senior React Developer / Marketing Lead"
                  value={formData.targetTitle}
                  onChange={(e) => handleFieldChange('targetTitle', e.target.value)}
                  fullWidth
                  size="small"
                />

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="Họ và tên *"
                    value={formData.fullName}
                    onChange={(e) => handleFieldChange('fullName', e.target.value)}
                    fullWidth
                    size="small"
                    required
                  />
                  <TextField
                    label="Email liên hệ"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="Số điện thoại"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    fullWidth
                    size="small"
                  />
                  <TextField
                    label="Địa chỉ (Tỉnh / Thành phố)"
                    value={formData.address}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Box>

                <TextField
                  label="Link ảnh đại diện (Avatar URL)"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.avatarUrl}
                  onChange={(e) => handleFieldChange('avatarUrl', e.target.value)}
                  fullWidth
                  size="small"
                  helperText="Dán link ảnh trực tuyến (Unsplash, Imgur, Cloudinary...)"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(formData.isDefault)}
                      onChange={(e) => handleFieldChange('isDefault', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Đặt bản CV này làm mặc định khi ứng tuyển công việc"
                />
              </Stack>
            </Paper>

            {/* Content & Details */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: 'primary.dark' }}>
                3. Nội dung Chi tiết CV
              </Typography>

              <Stack spacing={2.5}>
                <TextField
                  label="Giới thiệu bản thân & Mục tiêu nghề nghiệp"
                  placeholder="Tóm tắt ngắn gọn kinh nghiệm, thế mạnh và định hướng nghề nghiệp..."
                  value={formData.summary}
                  onChange={(e) => handleFieldChange('summary', e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                />

                <TextField
                  label="Kỹ năng chuyên môn (Cách nhau bởi dấu phẩy hoặc xuống dòng)"
                  placeholder="Java, Spring Boot, React, TypeScript, MySQL, Docker, Git..."
                  value={formData.skills}
                  onChange={(e) => handleFieldChange('skills', e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                />

                <TextField
                  label="Kinh nghiệm làm việc"
                  placeholder="• 2022 - Nay: Senior Developer tại TechNova&#10;- Xây dựng hệ thống...&#10;- Tối ưu hiệu năng..."
                  value={formData.experience}
                  onChange={(e) => handleFieldChange('experience', e.target.value)}
                  fullWidth
                  multiline
                  rows={5}
                />

                <TextField
                  label="Trình độ học vấn & Bằng cấp"
                  placeholder="• 2018 - 2022: Cử nhân Công nghệ Thông tin - ĐH Bách Khoa..."
                  value={formData.education}
                  onChange={(e) => handleFieldChange('education', e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                />

                <TextField
                  label="Chứng chỉ & Thành tích nổi bật"
                  placeholder="• AWS Certified Solutions Architect&#10;• IELTS 7.5..."
                  value={formData.certificates}
                  onChange={(e) => handleFieldChange('certificates', e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Stack>
            </Paper>
          </Stack>
        </Box>

        {/* Right Live Preview */}
        <Box sx={{ display: { xs: activeTab === 1 ? 'block' : 'none', md: 'block' } }}>
          <Box sx={{ position: { md: 'sticky' }, top: 90 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.dark', display: 'flex', alignItems: 'center', gap: 1 }}>
                <VisibilityIcon fontSize="small" /> Xem Trước Trực Tiếp (Live Preview)
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={() => window.print()}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
              >
                In / Lưu PDF
              </Button>
            </Box>

            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0', maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}>
              <CvRenderer cv={formData} />
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={Boolean(snackbarMsg)}
        autoHideDuration={4000}
        onClose={() => setSnackbarMsg(null)}
        message={snackbarMsg}
      />
    </Box>
  );
};

export default CvEditorPage;
