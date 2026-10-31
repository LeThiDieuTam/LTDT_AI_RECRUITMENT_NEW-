import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Stars as StarsIcon,
  WorkspacePremium as CertificateIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import type { CvResponse, CvRequest } from '../types';
import { toImageUrl } from '../utils/image';

export interface CvRendererProps {
  cv: CvResponse | CvRequest;
  templateOverride?: string;
  isPrintMode?: boolean;
}

export const CV_TEMPLATES = [
  { id: 'modern', name: 'Mẫu Hiện Đại (Modern Navy)', color: '#283593', bgHeader: '#e8eaf6', font: 'inherit' },
  { id: 'classic', name: 'Mẫu Cổ Điển (Classic Emerald)', color: '#047857', bgHeader: '#ecfdf5', font: 'inherit' },
  { id: 'creative', name: 'Mẫu Sáng Tạo (Creative Violet)', color: '#7c3aed', bgHeader: '#f5f3ff', font: 'inherit' },
  { id: 'tech', name: 'Mẫu Công Nghệ (Tech Dark)', color: '#0f172a', bgHeader: '#f8fafc', font: 'inherit' },
  { id: 'minimalist', name: 'Mẫu Tối Giản (Minimalist Indigo)', color: '#1a237e', bgHeader: '#e8eaf6', font: 'inherit' },
];

export const CvRenderer: React.FC<CvRendererProps> = ({ cv, templateOverride, isPrintMode = false }) => {
  const templateId = templateOverride || cv.resumeUrl || 'modern';
  const currentTemplate = CV_TEMPLATES.find((t) => t.id === templateId) || CV_TEMPLATES[0];

  const primaryColor = currentTemplate.color;
  const headerBg = currentTemplate.bgHeader;

  // Split skills into array
  const skillList = (cv.skills || '')
    .split(/[,;\n•]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <Box
      id="cv-printable-area"
      sx={{
        width: '100%',
        maxWidth: 820,
        mx: 'auto',
        bgcolor: '#ffffff',
        borderRadius: isPrintMode ? 0 : 3,
        overflow: 'hidden',
        boxShadow: isPrintMode ? 'none' : '0 10px 30px rgba(0,0,0,0.08)',
        border: isPrintMode ? 'none' : '1px solid #e2e8f0',
        fontFamily: currentTemplate.font,
        '@media print': {
          boxShadow: 'none',
          border: 'none',
          maxWidth: '100%',
          width: '100%',
          p: 0,
          m: 0,
        },
      }}
    >
      {/* Header section */}
      <Box
        sx={{
          bgcolor: headerBg,
          p: { xs: 2.5, sm: 4 },
          borderBottom: `3px solid ${primaryColor}`,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'center', sm: 'flex-start' },
          gap: 3,
          textAlign: { xs: 'center', sm: 'left' },
        }}
      >
        <Avatar
          src={toImageUrl(cv.avatarUrl)}
          alt={cv.fullName || 'Avatar'}
          sx={{
            width: { xs: 90, sm: 110 },
            height: { xs: 90, sm: 110 },
            border: `3px solid ${primaryColor}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            bgcolor: primaryColor,
            fontSize: '2.5rem',
            fontWeight: 700,
          }}
        >
          {cv.fullName ? cv.fullName.charAt(0).toUpperCase() : <PersonIcon fontSize="large" />}
        </Avatar>

        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              fontSize: { xs: '1.5rem', sm: '1.9rem' },
            }}
          >
            {cv.fullName || 'Họ và tên ứng viên'}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: primaryColor,
              fontWeight: 700,
              mt: 0.5,
              fontSize: { xs: '1rem', sm: '1.15rem' },
            }}
          >
            {cv.targetTitle || 'Vị trí chuyên môn mong muốn'}
          </Typography>

          {/* Contact quick badges */}
          <Stack
            direction="row"
            spacing={2}
            sx={{
              mt: 2,
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', sm: 'flex-start' },
              gap: 1,
            }}
          >
            {cv.email && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.85rem', color: '#475569' }}>
                <EmailIcon sx={{ fontSize: 16, color: primaryColor }} />
                <span>{cv.email}</span>
              </Box>
            )}
            {cv.phone && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.85rem', color: '#475569' }}>
                <PhoneIcon sx={{ fontSize: 16, color: primaryColor }} />
                <span>{cv.phone}</span>
              </Box>
            )}
            {cv.address && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.85rem', color: '#475569' }}>
                <LocationOnIcon sx={{ fontSize: 16, color: primaryColor }} />
                <span>{cv.address}</span>
              </Box>
            )}
          </Stack>
        </Box>
      </Box>

      {/* Main Body */}
      <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Stack spacing={3.5}>
          {/* Summary / Objective */}
          {cv.summary && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <StarsIcon sx={{ color: primaryColor, fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Giới thiệu & Mục tiêu nghề nghiệp
                </Typography>
              </Box>
              <Divider sx={{ mb: 1.5, borderColor: primaryColor, opacity: 0.3 }} />
              <Typography variant="body2" sx={{ lineHeight: 1.8, color: '#334155', whiteSpace: 'pre-line' }}>
                {cv.summary}
              </Typography>
            </Box>
          )}

          {/* Skills */}
          {skillList.length > 0 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <StarsIcon sx={{ color: primaryColor, fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Kỹ năng chuyên môn
                </Typography>
              </Box>
              <Divider sx={{ mb: 1.5, borderColor: primaryColor, opacity: 0.3 }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {skillList.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    size="small"
                    sx={{
                      bgcolor: headerBg,
                      color: primaryColor,
                      fontWeight: 600,
                      border: `1px solid ${primaryColor}40`,
                      borderRadius: 1.5,
                      py: 0.5,
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Work Experience */}
          {cv.experience && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <WorkIcon sx={{ color: primaryColor, fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Kinh nghiệm làm việc
                </Typography>
              </Box>
              <Divider sx={{ mb: 1.5, borderColor: primaryColor, opacity: 0.3 }} />
              <Box
                sx={{
                  pl: 2,
                  borderLeft: `2px solid ${primaryColor}40`,
                  '& p': { mb: 1 },
                }}
              >
                <Typography variant="body2" sx={{ lineHeight: 1.8, color: '#334155', whiteSpace: 'pre-line' }}>
                  {cv.experience}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Education */}
          {cv.education && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <SchoolIcon sx={{ color: primaryColor, fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Học vấn & Bằng cấp
                </Typography>
              </Box>
              <Divider sx={{ mb: 1.5, borderColor: primaryColor, opacity: 0.3 }} />
              <Box
                sx={{
                  pl: 2,
                  borderLeft: `2px solid ${primaryColor}40`,
                }}
              >
                <Typography variant="body2" sx={{ lineHeight: 1.8, color: '#334155', whiteSpace: 'pre-line' }}>
                  {cv.education}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Certificates & Achievements */}
          {cv.certificates && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CertificateIcon sx={{ color: primaryColor, fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Chứng chỉ & Thành tích
                </Typography>
              </Box>
              <Divider sx={{ mb: 1.5, borderColor: primaryColor, opacity: 0.3 }} />
              <Box
                sx={{
                  pl: 2,
                  borderLeft: `2px solid ${primaryColor}40`,
                }}
              >
                <Typography variant="body2" sx={{ lineHeight: 1.8, color: '#334155', whiteSpace: 'pre-line' }}>
                  {cv.certificates}
                </Typography>
              </Box>
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default CvRenderer;
