import React, { useEffect, useState } from 'react';

import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Chip,
  Divider,
} from '@mui/material';

import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';

import type { CandidateResponse } from '../../types';

const CandidatesPage: React.FC = () => {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState<CandidateResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // =========================================================
  // LOAD CANDIDATES
  // =========================================================

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        setError(null);

        // =====================================================
        // MOCK DATA
        // =====================================================
        // Tạm thời dùng dữ liệu giả.
        // Sau khi backend có API thật thì thay phần này bằng API.

        const mockCandidates: CandidateResponse[] = [
          {
            id: 1,
            fullName: 'Nguyễn Văn A',
            email: 'nguyenvana@example.com',
            phone: '0901234567',
            address: 'Hà Nội',
            skills: ['React', 'Node.js'],
            experience: '3 năm',
            education: 'Đại học Bách Khoa',
            status: 'Active',
          },
          {
            id: 2,
            fullName: 'Trần Thị B',
            email: 'tranthib@example.com',
            phone: '0912345678',
            address: 'TP.HCM',
            skills: ['Angular', 'Java'],
            experience: '5 năm',
            education: 'Đại học Khoa học Tự nhiên',
            status: 'Interviewing',
          },
          {
            id: 3,
            fullName: 'Lê Văn C',
            email: 'levanc@example.com',
            phone: '0987654321',
            address: 'Đà Nẵng',
            skills: ['Vue.js', 'Python'],
            experience: '2 năm',
            education: 'Cao đẳng FPT',
            status: 'Active',
          },
        ];

        await new Promise((resolve) => setTimeout(resolve, 500));

        setCandidates(mockCandidates);
      } catch (err: unknown) {
        console.error('Lỗi khi tải danh sách ứng viên:', err);

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(
            'Không thể tải danh sách ứng viên. Vui lòng thử lại.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  // =========================================================
  // VIEW DETAIL
  // =========================================================

  const handleViewDetail = (candidateId: number) => {
    navigate(`/candidates/${candidateId}`);
  };

  // =========================================================
  // STATUS COLOR
  // =========================================================

  const getStatusColor = (
    status?: string
  ): 'success' | 'info' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'Active':
        return 'success';

      case 'Interviewing':
        return 'info';

      case 'Rejected':
        return 'error';

      case 'Pending':
        return 'warning';

      default:
        return 'default';
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 300,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <Box>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <Box
        sx={{
          mb: 4,
          p: { xs: 3, md: 4 },
          borderRadius: 5,
          position: 'relative',
          overflow: 'hidden',
          color: '#fff',
          background: 'linear-gradient(120deg, #0f172a 0%, #1e293b 55%, #334155 100%)',
          boxShadow: '0 20px 44px -18px rgba(15,23,42,0.45)',
        }}
      >
        <Box sx={{ position: 'absolute', top: -70, right: -50, width: 240, height: 240, borderRadius: '50%', bgcolor: 'rgba(201,162,39,0.12)' }} />
        <Box sx={{ position: 'relative' }}>
          <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(201,162,39,0.95)', textTransform: 'uppercase' }}>
            Talent Pool
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', mb: 0.5, letterSpacing: '-0.02em' }}>
            Quản lý ứng viên
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.78)' }}>
            Danh sách tất cả các ứng viên đã đăng ký và trạng thái hồ sơ của họ.
          </Typography>
        </Box>
      </Box>

      {/* =====================================================
          EMPTY
      ===================================================== */}

      {candidates.length === 0 ? (
        <Alert severity="info">
          Chưa có ứng viên nào để hiển thị.
        </Alert>
      ) : (
        <List sx={{ p: 0 }}>
          {candidates.map((candidate) => (
            <React.Fragment key={candidate.id}>
              {/* =================================================
                  CANDIDATE CARD
              ================================================= */}

              <ListItem
                alignItems="flex-start"
                sx={{
                  mb: 2,
                  p: 3,
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  border: '1px solid rgba(15,23,42,0.08)',
                  boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 14px 30px -16px rgba(15,23,42,0.22)',

                  transition: 'all 0.24s ease',

                  '&:hover': {
                    borderColor: 'rgba(201,162,39,0.5)',
                    boxShadow: '0 6px 12px rgba(15,23,42,0.06), 0 26px 48px -18px rgba(15,23,42,0.3)',
                    transform: 'translateY(-2px)',
                  },

                  display: 'flex',
                  gap: 2,

                  flexDirection: {
                    xs: 'column',
                    md: 'row',
                  },
                }}
              >
                {/* =================================================
                    AVATAR
                ================================================= */}

                <ListItemAvatar
                  sx={{
                    minWidth: 60,
                    mr: 1,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 52,
                      height: 52,
                      fontWeight: 700,
                      color: '#1a1505',
                      background: 'linear-gradient(135deg, #c9a227, #e2c15a)',
                      boxShadow: '0 6px 16px -4px rgba(201,162,39,0.5)',
                    }}
                  >
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>

                {/* =================================================
                    INFORMATION
                ================================================= */}

                <ListItemText
                  sx={{
                    flex: 1,
                    minWidth: 0,
                  }}
                  primary={
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 1.5,
                      }}
                    >
                      {candidate.fullName}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      {/* EMAIL */}

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <EmailIcon
                          fontSize="small"
                          color="action"
                        />

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {candidate.email}
                        </Typography>
                      </Box>

                      {/* PHONE */}

                      {candidate.phone && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <PhoneIcon
                            fontSize="small"
                            color="action"
                          />

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {candidate.phone}
                          </Typography>
                        </Box>
                      )}

                      {/* ADDRESS */}

                      {candidate.address && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <LocationOnIcon
                            fontSize="small"
                            color="action"
                          />

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {candidate.address}
                          </Typography>
                        </Box>
                      )}

                      {/* EDUCATION */}

                      {candidate.education && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <SchoolIcon
                            fontSize="small"
                            color="action"
                          />

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {candidate.education}
                          </Typography>
                        </Box>
                      )}

                      {/* EXPERIENCE */}

                      {candidate.experience && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <WorkIcon
                            fontSize="small"
                            color="action"
                          />

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            Kinh nghiệm: {candidate.experience}
                          </Typography>
                        </Box>
                      )}

                      {/* =================================================
                          SKILLS
                      ================================================= */}

                      {candidate.skills &&
                        candidate.skills.length > 0 && (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: 1,
                              mb: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                mr: 0.5,
                              }}
                            >
                              Kỹ năng:
                            </Typography>

                            {candidate.skills.map((skill) => (
                              <Chip
                                key={skill}
                                label={skill}
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                            ))}
                          </Box>
                        )}

                      {/* =================================================
                          STATUS
                      ================================================= */}

                      {candidate.status && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mt: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                            }}
                          >
                            Trạng thái:
                          </Typography>

                          <Chip
                            label={candidate.status}
                            size="small"
                            color={getStatusColor(
                              candidate.status
                            )}
                          />
                        </Box>
                      )}
                    </Box>
                  }
                />

                {/* =================================================
                    DETAIL BUTTON
                ================================================= */}

                <Button
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() =>
                    handleViewDetail(candidate.id)
                  }
                  sx={{
                    flexShrink: 0,
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2,
                    borderColor: 'rgba(201,162,39,0.55)',
                    color: '#8f7816',
                    '&:hover': { borderColor: '#c9a227', bgcolor: 'rgba(201,162,39,0.08)' },

                    alignSelf: {
                      xs: 'stretch',
                      md: 'center',
                    },
                  }}
                >
                  Xem chi tiết
                </Button>
              </ListItem>

              <Divider sx={{ display: 'none' }} />
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default CandidatesPage;