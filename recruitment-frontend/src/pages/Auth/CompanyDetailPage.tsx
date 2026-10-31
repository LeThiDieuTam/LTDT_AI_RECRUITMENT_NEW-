
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import {
  Typography,
  Box,
  Paper,
  Chip,
  Stack,
  Button,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';

import { styled } from '@mui/material/styles';

import {
  Business as BusinessIcon,
  People as PeopleIcon,
  Link as LinkIcon,
  Public as PublicIcon,
  CalendarMonth as CalendarMonthIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import { toImageUrl } from '../../utils/image';
import type { CompanyResponse } from '../../types';

// =====================================================
// STYLED PAPER
// =====================================================

const StyledPaper = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 900,
  padding: 0,
  borderRadius: 24,
  overflow: 'hidden',
  boxShadow: theme.shadows[3],
}));

// =====================================================
// COMPANY DETAIL PAGE
// =====================================================

const CompanyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<CompanyResponse>(`/api/companies/${id}`);
        setCompany(res.data);
      } catch (err) {
        console.error('Lỗi khi tải chi tiết công ty:', err);
        setError('Không thể tải thông tin công ty. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

  // ===================================================
  // OPEN COMPANY WEBSITE
  // ===================================================

  const handleVisitWebsite = () => {
    if (company?.website) {
      const url = company.website.startsWith('http') ? company.website : `https://${company.website}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !company) {
    return (
      <Box sx={{ width: '100%', display: 'grid', placeItems: 'center', py: 8 }}>
        <Alert severity="error">{error || 'Không tìm thấy công ty.'}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate(-1)} variant="text">← Quay lại</Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        display: 'grid',
        placeItems: 'center',
        py: 4,
      }}
    >
      <StyledPaper>
        {/* Ảnh bìa + logo */}
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              height: 200,
              background: company.coverImage
                ? `url(${toImageUrl(company.coverImage)}) center/cover no-repeat`
                : 'linear-gradient(120deg, #0f172a 0%, #1e293b 55%, #334155 100%)',
            }}
          />
          <Box sx={{ position: 'absolute', left: 40, bottom: -40 }}>
            <Avatar
              src={toImageUrl(company.logo)}
              sx={{
                width: 96,
                height: 96,
                fontSize: 40,
                fontWeight: 800,
                bgcolor: 'rgba(255,255,255,0.92)',
                color: '#1e293b',
                border: '4px solid #fff',
                boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
              }}
            >
              {company.name?.charAt(0)?.toUpperCase() || <BusinessIcon fontSize="large" />}
            </Avatar>
          </Box>
        </Box>

        <Stack spacing={4} sx={{ px: { xs: 3, md: 5 }, pt: 7, pb: 4 }}>
          {/* =================================================
              HEADER
              ================================================= */}

          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: 'primary.dark',
              }}
            >
              {company.name}
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mt: 1,
                lineHeight: 1.7,
              }}
            >
              {company.address || [company.city, company.country].filter(Boolean).join(', ') || 'Việt Nam'}
            </Typography>

            {company.website && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<LinkIcon />}
                onClick={handleVisitWebsite}
                sx={{
                  mt: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 2,
                }}
              >
                Truy cập Website
              </Button>
            )}
          </Box>

          {/* =================================================
              COMPANY INTRODUCTION
              ================================================= */}

          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
              }}
              gutterBottom
            >
              Giới thiệu công ty
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                lineHeight: 1.8,
                whiteSpace: 'pre-line',
              }}
            >
              {company.description || 'Công ty chưa cập nhật mô tả.'}
            </Typography>

            {/* =================================================
                COMPANY INFORMATION
                ================================================= */}

            <Stack spacing={1.5}>
              {company.country && (
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <PublicIcon fontSize="small" color="action" />
                  <Typography variant="body2">Quốc gia: {company.country}</Typography>
                </Stack>
              )}

              {company.industry && (
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <BusinessIcon fontSize="small" color="action" />
                  <Typography variant="body2">Ngành nghề: {company.industry}</Typography>
                </Stack>
              )}

              {company.companySize && (
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <PeopleIcon fontSize="small" color="action" />
                  <Typography variant="body2">Số lượng nhân sự: {company.companySize}</Typography>
                </Stack>
              )}

              {company.foundedYear && (
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <CalendarMonthIcon fontSize="small" color="action" />
                  <Typography variant="body2">Thành lập năm: {company.foundedYear}</Typography>
                </Stack>
              )}
            </Stack>
          </Box>

          {/* =================================================
              COMPANY TAGS
              ================================================= */}

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
            }}
          >
            {company.city && <Chip label={company.city} variant="outlined" />}
            {company.phone && <Chip label={`☎ ${company.phone}`} variant="outlined" />}
            {company.email && <Chip label={`✉ ${company.email}`} variant="outlined" />}
          </Box>

          {/* =================================================
              BACK BUTTON
              ================================================= */}

          <Box>
            <Button
              variant="text"
              onClick={() => navigate(-1)}
              sx={{
                textTransform: 'none',
              }}
            >
              ← Quay lại
            </Button>
          </Box>

        </Stack>
      </StyledPaper>
    </Box>
  );
};

export default CompanyDetailPage;
