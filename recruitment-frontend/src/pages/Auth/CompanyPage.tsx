
// src/pages/Auth/CompanyPage.tsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api'; // Import API service
import { toImageUrl } from '../../utils/image';
import { useNavigate } from 'react-router-dom';

import {
  Typography,
  Box,
  Paper,
  Chip,
  Stack,
  Button,
  Avatar,
  Alert, // Đã có Alert
  CircularProgress, // Thêm CircularProgress
} from '@mui/material';

import { styled } from '@mui/material/styles';

import {
  People as PeopleIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

import type { CompanyResponse } from '../../types';



const StyledPaper = styled(Paper)(({ theme }) => ({
  width: '100%',
  height: '100%',
  padding: theme.spacing(4),
  borderRadius: 24,
  boxSizing: 'border-box',

  boxShadow: theme.shadows[3],

  transition:
    'transform 0.28s ease, box-shadow 0.28s ease',

  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
  },
}));



const CompanyPage: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
          throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }

        // Giả định endpoint API để lấy danh sách công ty
        const response = await api.get<{ content: CompanyResponse[] }>('/api/companies'); // Thay đổi kiểu trả về để linh hoạt hơn

        // Kiểm tra xem dữ liệu trả về có phải là một mảng không
        if (response.data && Array.isArray(response.data.content)) {
          setCompanies(response.data.content);
        } else {
          console.error('API response for companies is not an array:', response.data);
          setError('Dữ liệu công ty không hợp lệ từ máy chủ.');
          setCompanies([]); // Đảm bảo companies luôn là một mảng
        }
      } catch (err: any) {
        console.error("Lỗi khi tải danh sách công ty:", err);
        setError(err.message || 'Không thể tải danh sách công ty. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}><CircularProgress /></Box>;
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  // ===================================================
  // COMPANY DETAIL
  // ===================================================

  const handleViewDetail = (companyId: number) => {
    navigate(`/companies/${companyId}`);
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      {/* =================================================
          HEADER
          ================================================= */}

      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: 'primary.dark',
            mb: 1,
          }}
        >
          Các công ty hàng đầu
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            lineHeight: 1.7,
          }}
        >
          Tìm nhà tuyển dụng phù hợp với phong cách
          làm việc của bạn.
        </Typography>
      </Box>

      {/* =================================================
          COMPANY LIST
          ================================================= */}

      <Box sx={{
        display: 'grid',
        gap: 4,
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
      }}>
        {companies.length === 0 && (
          <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Không có công ty nào để hiển thị.
            </Typography>
          </Box>
        )}

        {companies.map((company) => (
          <Box
            key={company.id}
          >
            <StyledPaper>
              <Stack
                spacing={2}
                sx={{
                  height: '100%',
                }}
              >
              {/* =========================================
                  COMPANY LOGO + NAME
                  ========================================= */}

              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  alignItems: 'center',
                }}
              >
                <Avatar
                  src={toImageUrl(company.logo)}
                  sx={{
                    width: 48,
                    height: 48,
                    fontWeight: 800,
                    bgcolor: '#e8eaf6',
                    color: '#1a237e',
                  }}
                >
                  {company.name?.charAt(0)?.toUpperCase()}
                </Avatar>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: 'primary.dark',
                  }}
                >
                  {company.name}
                </Typography>
              </Stack>

              {/* =========================================
                  DESCRIPTION
                  ========================================= */}

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  lineHeight: 1.7,
                  minHeight: 48,
                }}
              >
                {company.description}
              </Typography>

              {/* =========================================
                  COMPANY SIZE
                  ========================================= */}

              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <PeopleIcon
                  fontSize="small"
                  color="action"
                />

                <Chip
                  label={company.companySize}
                  size="small"
                  variant="outlined"
                />
              </Stack>

              {/* =========================================
                  DETAIL BUTTON
                  ========================================= */}

              <Button
                variant="text"
                color="primary"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  alignSelf: 'flex-start',
                  mt: 'auto',
                  pt: 2,

                  textTransform: 'none',
                  fontWeight: 700,

                  '&:hover': {
                    backgroundColor:
                      'rgba(25, 118, 210, 0.08)',
                  },
                }}
                onClick={() =>
                  handleViewDetail(company.id)
                }
              >
                Xem chi tiết
              </Button>
            </Stack>
          </StyledPaper>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CompanyPage;
