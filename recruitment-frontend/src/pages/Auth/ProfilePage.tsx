// src/pages/Auth/ProfilePage.tsx

import React, { useState, useEffect } from 'react';

import {
  Typography,
  Paper,
  Stack,
  Button,
  Avatar,
  TextField,
  CircularProgress,
  Alert,
  Box,
  Divider,
  Chip,
  InputAdornment,
  Card,
} from '@mui/material';

import { styled, alpha } from '@mui/material/styles';

import {
  Person as PersonIcon,
  Save as SaveIcon,
  PhotoCamera as PhotoCameraIcon,
  BusinessCenter as BusinessCenterIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  AutoAwesome as AutoAwesomeIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';

import api from '../../services/api';
import { toImageUrl } from '../../utils/image';
import type { UserInfo, UserResponse } from '../../types';
import { AxiosError } from 'axios';

// =====================================================
// STYLED COMPONENTS
// =====================================================

const StyledPaper = styled(Paper)(() => ({
  maxWidth: 860,
  margin: 'auto',
  padding: 0,
  borderRadius: 28,
  overflow: 'hidden',
  border: '1px solid rgba(15,23,42,0.08)',
  boxShadow:
    '0 1px 2px rgba(15,23,42,0.04), 0 24px 56px -20px rgba(15,23,42,0.35)',
  background: 'linear-gradient(180deg, #ffffff 0%, #fdfcf9 100%)',
}));

const ProfileBody = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4, 5),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3, 2.5),
  },
}));

const SectionCard = styled(Card)(({ theme }) => ({
  borderRadius: 18,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
  boxShadow: 'none',
  background: 'linear-gradient(180deg, #ffffff, #fbfaf7)',
  transition: 'box-shadow .25s ease, transform .25s ease',
  '&:hover': {
    boxShadow: `0 14px 34px -14px ${alpha(theme.palette.primary.main, 0.25)}`,
    transform: 'translateY(-2px)',
  },
}));

const SectionHeader = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 1.5,
  padding: theme.spacing(2, 2.5, 1.5),
}));

const SectionIconBadge = styled(Box)(() => ({
  width: 40,
  height: 40,
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${alpha('#c9a227', 0.18)}, ${alpha('#c9a227', 0.35)})`,
  color: '#8a6d1a',
  flexShrink: 0,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    backgroundColor: '#fff',
    transition: 'box-shadow .2s ease',
    '&:hover': {
      boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.06)}`,
    },
    '&.Mui-focused': {
      boxShadow: `0 0 0 4px ${alpha('#c9a227', 0.15)}`,
    },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#c9a227' },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#c9a227',
  },
}));

const GradientButton = styled(Button)(() => ({
  textTransform: 'none',
  fontWeight: 700,
  py: 1.5,
  borderRadius: 12,
  background: 'linear-gradient(90deg, #c9a227, #e2c15a)',
  color: '#1a1505',
  boxShadow: '0 8px 20px -6px rgba(201,162,39,0.45)',
  '&:hover': { filter: 'brightness(1.05)' },
}));

// =====================================================
// PROFILE PAGE
// =====================================================

const ProfilePage: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    fullName: '',
    email: '',
    role: 'CANDIDATE',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setFetching(true);
      setError(null);
      try {
        const response = await api.get<UserResponse>('/api/users/profile');
        const fetchedUserInfo: UserInfo = {
          fullName: response.data.fullName,
          email: response.data.email,
          role: response.data.role as UserInfo['role'],
          phone: response.data.phone,
          address: response.data.address,
          skills: response.data.skills,
          experience: response.data.experience,
          education: response.data.education,
          resumeUrl: response.data.resumeUrl,
          avatarUrl: response.data.avatarUrl,
        };
        setUserInfo(fetchedUserInfo);
        localStorage.setItem('user_info', JSON.stringify(fetchedUserInfo));
      } catch (err) {
        console.error('Lỗi khi tải hồ sơ người dùng:', err);
        setError('Không thể tải thông tin hồ sơ.');
        localStorage.removeItem('user_info');
      } finally {
        setFetching(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const response = await api.put<UserResponse>('/api/users/profile', userInfo);
      const updatedUserInfo: UserInfo = {
        fullName: response.data.fullName,
        email: response.data.email,
        role: response.data.role as UserInfo['role'],
        phone: response.data.phone,
        address: response.data.address,
        skills: response.data.skills,
        experience: response.data.experience,
        education: response.data.education,
        resumeUrl: response.data.resumeUrl,
        avatarUrl: response.data.avatarUrl,
      };
      setUserInfo(updatedUserInfo);
      localStorage.setItem('user_info', JSON.stringify(updatedUserInfo));
      setSuccess('Cập nhật thông tin thành công!');
    } catch (err) {
      console.error('Lỗi khi lưu thông tin hồ sơ:', err);
      if (
        err instanceof AxiosError &&
        err.response &&
        err.response.data &&
        err.response.data.message
      ) {
        setError(err.response.data.message);
      } else {
        setError('Lưu thông tin thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setSuccess(null);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post<{ url: string; filename: string }>(
        '/api/files/upload',
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      setUserInfo((prev) => ({ ...prev, avatarUrl: res.data.url }));
      setSuccess('Tải ảnh đại diện thành công! Nhấn "Lưu thay đổi" để hoàn tất.');
    } catch (err) {
      console.error('Lỗi khi upload ảnh đại diện:', err);
      setError('Tải ảnh đại diện thất bại. Vui lòng thử lại.');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const avatarLetter = userInfo.fullName.charAt(0)?.toUpperCase() || 'U';

  const skillsCount = (userInfo.skills || '')
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const completion = React.useMemo(() => {
    const fields: (string | undefined)[] = [
      userInfo.fullName,
      userInfo.phone,
      userInfo.address,
      userInfo.skills,
      userInfo.experience,
      userInfo.education,
      userInfo.resumeUrl,
      userInfo.avatarUrl,
    ];
    const filled = fields.filter((v) => v && String(v).trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  }, [userInfo]);

  const isCandidate = userInfo.role === 'CANDIDATE';

  return (
    <StyledPaper>
      {/* ================= PREMIUM BANNER ================= */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          px: { xs: 3, md: 5 },
          py: 4,
          background:
            'linear-gradient(120deg, #0f172a 0%, #1e293b 55%, #334155 100%)',
          color: '#fff',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2.5,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -60,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: 'rgba(201,162,39,0.12)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -80,
            left: '30%',
            width: 160,
            height: 160,
            borderRadius: '50%',
            bgcolor: 'rgba(201,162,39,0.07)',
          }}
        />

        <label htmlFor="upload-avatar" style={{ cursor: 'pointer', position: 'relative' }}>
          <Avatar
            src={toImageUrl(userInfo.avatarUrl)}
            sx={{
              width: 84,
              height: 84,
              fontSize: 34,
              fontWeight: 700,
              bgcolor: 'rgba(255,255,255,0.14)',
              border: '2px solid rgba(201,162,39,0.6)',
              color: '#e2c15a',
              boxShadow: '0 10px 28px -8px rgba(0,0,0,0.55)',
              transition: 'transform .25s ease',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          >
            {!userInfo.avatarUrl && (
              userInfo ? avatarLetter : <PersonIcon fontSize="large" />
            )}
          </Avatar>
          <Box
            sx={{
              position: 'absolute',
              right: -4,
              bottom: -2,
              width: 28,
              height: 28,
              borderRadius: '50%',
              bgcolor: '#c9a227',
              color: '#1a1505',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
            }}
          >
            {uploadingAvatar ? (
              <CircularProgress size={14} sx={{ color: '#1a1505' }} />
            ) : (
              <PhotoCameraIcon sx={{ fontSize: 16 }} />
            )}
          </Box>
          <input
            id="upload-avatar"
            type="file"
            accept="image/*"
            hidden
            onChange={handleAvatarUpload}
          />
        </label>

        <Box sx={{ position: 'relative', minWidth: 200, flexGrow: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(201,162,39,0.95)',
            }}
          >
            Candidate Profile
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>
            Hồ sơ của bạn
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.5 }}>
            Giữ hồ sơ luôn cập nhật để cơ hội việc làm tốt hơn tìm thấy bạn.
          </Typography>
        </Box>

        {/* Hoàn thiện hồ sơ */}
        <Box sx={{ position: 'relative', minWidth: 180, textAlign: { xs: 'left', md: 'right' } }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <AutoAwesomeIcon sx={{ color: '#e2c15a', fontSize: 18 }} />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
              Độ hoàn thiện hồ sơ
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5, alignItems: 'center', mt: 0.5, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Box
              sx={{
                width: 140,
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(255,255,255,0.15)',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  width: `${completion}%`,
                  height: '100%',
                  borderRadius: 4,
                  background: 'linear-gradient(90deg, #c9a227, #e2c15a)',
                  transition: 'width .6s cubic-bezier(.22,1,.36,1)',
                }}
              />
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#e2c15a' }}>
              {completion}%
            </Typography>
          </Box>
        </Box>
      </Box>

      <ProfileBody>
        {fetching && userInfo.fullName === '' ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error && !userInfo.fullName ? (
          <Alert severity="error">{error}</Alert>
        ) : userInfo ? (
          <Stack spacing={3}>
            {success && <Alert severity="success">{success}</Alert>}
            {error && userInfo.fullName && <Alert severity="error">{error}</Alert>}

            {/* ================= THÔNG TIN CÁ NHÂN ================= */}
            <SectionCard>
              <SectionHeader>
                <SectionIconBadge>
                  <PersonIcon />
                </SectionIconBadge>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: 16 }}>
                    Thông tin cá nhân
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Thông tin cơ bản để nhà tuyển dụng liên hệ với bạn
                  </Typography>
                </Box>
              </SectionHeader>
              <Divider />
              <Box sx={{ p: 2.5, display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                <StyledTextField
                  label="Họ và tên"
                  name="fullName"
                  value={userInfo.fullName}
                  onChange={handleFieldChange}
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <StyledTextField
                  label="Số điện thoại"
                  name="phone"
                  value={userInfo.phone || ''}
                  onChange={handleFieldChange}
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <StyledTextField
                  label="Email"
                  name="email"
                  value={userInfo.email}
                  fullWidth
                  disabled
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <StyledTextField
                  label="Địa chỉ"
                  name="address"
                  value={userInfo.address || ''}
                  onChange={handleFieldChange}
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <StyledTextField
                  label="Vai trò"
                  name="role"
                  value={userInfo.role}
                  fullWidth
                  disabled
                />
              </Box>
            </SectionCard>

            {/* ================= HỒ SƠ CHUYÊN MÔN (CANDIDATE) ================= */}
            {isCandidate && (
              <SectionCard>
                <SectionHeader>
                  <SectionIconBadge>
                    <BusinessCenterIcon />
                  </SectionIconBadge>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 16 }}>
                      Hồ sơ chuyên môn
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Kỹ năng, kinh nghiệm và học vấn — phần quan trọng nhất với nhà tuyển dụng
                    </Typography>
                  </Box>
                  {skillsCount.length > 0 && (
                    <Chip
                      size="small"
                      icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
                      label={`${skillsCount.length} kỹ năng`}
                      sx={{
                        bgcolor: alpha('#c9a227', 0.12),
                        color: '#8a6d1a',
                        fontWeight: 700,
                      }}
                    />
                  )}
                </SectionHeader>
                <Divider />
                <Box sx={{ p: 2.5, display: 'grid', gap: 2.5 }}>
                  <Box>
                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {skillsCount.slice(0, 10).map((s, i) => (
                        <Chip key={i} label={s} size="small" variant="outlined" />
                      ))}
                    </Stack>
                    <StyledTextField
                      label="Kỹ năng (phân tách bằng dấu phẩy)"
                      name="skills"
                      value={userInfo.skills || ''}
                      onChange={handleFieldChange}
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="VD: Java, Spring Boot, React, MySQL"
                    />
                  </Box>
                  <StyledTextField
                    label="Kinh nghiệm làm việc"
                    name="experience"
                    value={userInfo.experience || ''}
                    onChange={handleFieldChange}
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="VD: 2 năm phát triển backend Java tại công ty X, tham gia dự án Y..."
                    helperText="Nêu rõ thời gian, vai trò và kết quả cụ thể của từng vị trí."
                  />
                  <StyledTextField
                    label="Học vấn"
                    name="education"
                    value={userInfo.education || ''}
                    onChange={handleFieldChange}
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="VD: Đại học Bách Khoa Hà Nội — Kỹ thuật máy tính (2019–2023)"
                  />
                  <StyledTextField
                    label="Link CV (URL)"
                    name="resumeUrl"
                    value={userInfo.resumeUrl || ''}
                    onChange={handleFieldChange}
                    fullWidth
                    placeholder="https://..."
                    helperText="Dán link đến CV/Resume online của bạn (Drive, LinkedIn, portfolio...)."
                  />
                </Box>
              </SectionCard>
            )}

            {/* ================= LƯU ================= */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ pt: 0.5, justifyContent: 'flex-end' }}
            >
              <GradientButton
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </GradientButton>
            </Stack>
          </Stack>
        ) : (
          <Typography color="text.secondary">
            Không có thông tin người dùng để hiển thị.
          </Typography>
        )}
      </ProfileBody>
    </StyledPaper>
  );
};

export default ProfilePage;
