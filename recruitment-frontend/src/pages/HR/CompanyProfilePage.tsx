// src/pages/HR/CompanyProfilePage.tsx
// Trang HR quản lý hồ sơ công ty: mô tả công ty + upload logo & ảnh bìa

import React, { useEffect, useState } from 'react';

import {
  Typography,
  Box,
  Paper,
  Stack,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Avatar,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Save as SaveIcon,
  Business as BusinessIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import { toImageUrl } from '../../utils/image';
import type { CompanyResponse } from '../../types';

const StyledPaper = styled(Paper)(() => ({
  width: '100%',
  maxWidth: 900,
  margin: 'auto',
  padding: 0,
  borderRadius: 24,
  overflow: 'hidden',
  border: '1px solid rgba(15,23,42,0.08)',
  boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 22px 48px -18px rgba(15,23,42,0.3)',
}));

const CompanyProfilePage: React.FC = () => {
  const [company, setCompany] = useState<CompanyResponse | null>(null);
  const [form, setForm] = useState<Partial<CompanyResponse>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      setFetching(true);
      setError(null);
      try {
        const res = await api.get<CompanyResponse>('/api/companies/my-company');
        setCompany(res.data);
        setForm(res.data);
      } catch (err: any) {
        // Chưa có công ty -> cho phép tạo mới
        if (err?.response?.status === 404 || err?.response?.status === 400) {
          setCompany(null);
          setForm({});
        } else {
          console.error('Lỗi khi tải thông tin công ty:', err);
          setError('Không thể tải thông tin công ty. Vui lòng thử lại.');
        }
      } finally {
        setFetching(false);
      }
    };
    fetchCompany();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    kind: 'logo' | 'cover'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    kind === 'logo' ? setUploadingLogo(true) : setUploadingCover(true);
    setSuccess(null);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post<{ url: string; filename: string }>('/api/files/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data.url;
      setForm((prev) => ({ ...prev, [kind === 'logo' ? 'logo' : 'coverImage']: url }));
      setSuccess(`Tải ảnh ${kind === 'logo' ? 'logo' : 'bìa'} thành công! Nhấn "Lưu thay đổi" để hoàn tất.`);
    } catch (err: any) {
      console.error('Lỗi khi upload ảnh:', err);
      setError(err?.response?.data?.message || 'Tải ảnh thất bại. Vui lòng thử lại.');
    } finally {
      kind === 'logo' ? setUploadingLogo(false) : setUploadingCover(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const payload = {
        name: form.name || '',
        email: form.email || '',
        phone: form.phone || '',
        website: form.website || '',
        address: form.address || '',
        description: form.description || '',
        logo: form.logo || '',
        coverImage: form.coverImage || '',
        city: form.city || '',
        country: form.country || '',
        industry: form.industry || '',
        companySize: form.companySize || '',
        foundedYear: form.foundedYear ? Number(form.foundedYear) : undefined,
      };
      let res;
      if (company) {
        res = await api.put<CompanyResponse>('/api/companies/my-company', payload);
      } else {
        res = await api.post<CompanyResponse>('/api/companies/my-company', payload);
      }
      setCompany(res.data);
      setForm(res.data);
      setSuccess('Lưu thông tin công ty thành công!');
    } catch (err: any) {
      console.error('Lỗi khi lưu thông tin công ty:', err);
      setError(err?.response?.data?.message || 'Lưu thông tin thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const logoUrl = form.logo || '';
  const coverUrl = form.coverImage || '';

  return (
    <StyledPaper>
      {/* Banner ảnh bìa */}
      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            height: 180,
            background: coverUrl
              ? `url(${toImageUrl(coverUrl)}) center/cover no-repeat`
              : 'linear-gradient(120deg, #0f172a 0%, #1e293b 55%, #334155 100%)',
          }}
        />
        {/* Nút upload ảnh bìa */}
        <Button
          component="label"
          variant="contained"
          size="small"
          startIcon={uploadingCover ? <CircularProgress size={16} color="inherit" /> : <PhotoCameraIcon />}
          sx={{
            position: 'absolute',
            right: 16,
            bottom: 12,
            textTransform: 'none',
            fontWeight: 700,
            bgcolor: 'rgba(15,23,42,0.75)',
            '&:hover': { bgcolor: 'rgba(15,23,42,0.9)' },
          }}
          disabled={uploadingCover}
        >
          {uploadingCover ? 'Đang tải...' : coverUrl ? 'Đổi ảnh bìa' : 'Thêm ảnh bìa'}
          <input type="file" accept="image/*" hidden onChange={(e) => handleUploadImage(e, 'cover')} />
        </Button>

        {/* Logo công ty */}
        <Box sx={{ position: 'absolute', left: 32, bottom: -36 }}>
          <label htmlFor="upload-logo" style={{ cursor: 'pointer' }}>
            <Avatar
              src={toImageUrl(logoUrl)}
              sx={{
                width: 88,
                height: 88,
                fontSize: 36,
                fontWeight: 800,
                bgcolor: 'rgba(255,255,255,0.9)',
                color: '#1e293b',
                border: '3px solid #fff',
                boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
              }}
            >
              {!logoUrl && (form.name?.charAt(0)?.toUpperCase() || <BusinessIcon fontSize="large" />)}
            </Avatar>
            <input id="upload-logo" type="file" accept="image/*" hidden onChange={(e) => handleUploadImage(e, 'logo')} />
          </label>
          <IconButton
            component="label"
            size="small"
            sx={{
              position: 'absolute',
              right: -8,
              bottom: -4,
              bgcolor: '#1e293b',
              color: '#fff',
              '&:hover': { bgcolor: '#0f172a' },
            }}
          >
            {uploadingLogo ? <CircularProgress size={14} color="inherit" /> : <PhotoCameraIcon sx={{ fontSize: 16 }} />}
            <input type="file" accept="image/*" hidden onChange={(e) => handleUploadImage(e, 'logo')} />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ px: { xs: 3, md: 5 }, pt: 7, pb: 5 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
          {company ? 'Hồ sơ công ty' : 'Tạo hồ sơ công ty'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Cập nhật mô tả, logo và ảnh bìa công ty để ứng viên dễ dàng nhận diện thương hiệu của bạn.
        </Typography>

        {fetching ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2.5,
            }}
          >
            <TextField
              label="Tên công ty"
              name="name"
              value={form.name || ''}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Email công ty"
              name="email"
              value={form.email || ''}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField label="Số điện thoại" name="phone" value={form.phone || ''} onChange={handleChange} fullWidth />
            <TextField label="Website" name="website" value={form.website || ''} onChange={handleChange} fullWidth />
            <TextField label="Thành phố" name="city" value={form.city || ''} onChange={handleChange} fullWidth />
            <TextField label="Quốc gia" name="country" value={form.country || ''} onChange={handleChange} fullWidth />
            <TextField label="Ngành nghề" name="industry" value={form.industry || ''} onChange={handleChange} fullWidth />
            <TextField label="Quy mô (VD: 50-200)" name="companySize" value={form.companySize || ''} onChange={handleChange} fullWidth />
            <TextField
              label="Năm thành lập"
              name="foundedYear"
              type="number"
              value={form.foundedYear ?? ''}
              onChange={handleChange}
              fullWidth
            />
            <Box sx={{ gridColumn: '1 / -1' }}>
              <TextField label="Địa chỉ" name="address" value={form.address || ''} onChange={handleChange} fullWidth />
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <TextField
                label="Mô tả công ty"
                name="description"
                value={form.description || ''}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={5}
                placeholder="Giới thiệu về văn hóa, sứ mệnh, sản phẩm/dịch vụ và môi trường làm việc của công ty..."
              />
            </Box>

            <Box sx={{ gridColumn: '1 / -1' }}>
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  onClick={handleSave}
                  disabled={loading || uploadingLogo || uploadingCover}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    py: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, #c9a227, #e2c15a)',
                    color: '#1a1505',
                    boxShadow: '0 8px 20px -6px rgba(201,162,39,0.45)',
                    '&:hover': { filter: 'brightness(1.05)' },
                  }}
                >
                  {loading ? 'Đang lưu...' : company ? 'Lưu thay đổi' : 'Tạo hồ sơ công ty'}
                </Button>
                {(form.logo || form.coverImage) && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setForm((prev) => ({ ...prev, logo: '', coverImage: '' }))}
                    sx={{ textTransform: 'none', fontWeight: 700, py: 1.5, borderRadius: 2 }}
                  >
                    Xóa ảnh đã chọn
                  </Button>
                )}
              </Stack>
            </Box>
          </Box>
        )}
      </Box>
    </StyledPaper>
  );
};

export default CompanyProfilePage;
