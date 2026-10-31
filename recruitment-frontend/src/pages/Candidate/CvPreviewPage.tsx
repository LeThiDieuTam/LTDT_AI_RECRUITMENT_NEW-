import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import type { CvResponse, UserInfo } from '../../types';
import CvRenderer from '../../components/CvRenderer';

const CvPreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [cv, setCv] = useState<CvResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user_info');
      if (stored) {
        const parsed: UserInfo = JSON.parse(stored);
        const role = parsed.role ? parsed.role.replace(/^ROLE_/, '').toUpperCase() : null;
        setUserRole(role);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    const fetchCv = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<CvResponse>(`/api/cvs/${id}`);
        setCv(res.data);
      } catch (err: any) {
        console.error('Failed to load CV preview:', err);
        setError(err?.response?.data?.message || 'Không thể tải thông tin CV.');
      } finally {
        setLoading(false);
      }
    };

    fetchCv();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !cv) {
    return (
      <Box sx={{ p: 4, maxWidth: 700, mx: 'auto' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Quay lại
        </Button>
        <Alert severity="error">{error || 'Không tìm thấy CV.'}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 8 }}>
      {/* Top action bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
          '@media print': { display: 'none' },
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Quay lại
        </Button>

        <Stack direction="row" spacing={1.5}>
          {userRole === 'CANDIDATE' && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/candidate/cvs/${cv.id}/edit`)}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
            >
              Chỉnh sửa CV
            </Button>
          )}

          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3 }}
          >
            In / Lưu file PDF
          </Button>
        </Stack>
      </Box>

      {/* CV Renderer container */}
      <Paper elevation={0} sx={{ p: { xs: 1, sm: 3 }, bgcolor: '#f8fafc', borderRadius: 4, border: '1px solid #e2e8f0' }}>
        <CvRenderer cv={cv} />
      </Paper>
    </Box>
  );
};

export default CvPreviewPage;
