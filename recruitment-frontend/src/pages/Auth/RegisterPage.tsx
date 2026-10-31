import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import api from '../../services/api'; // Import API service
import type { AuthResponse } from '../../types';

const StyledPaper = styled(Paper)(({ theme }) => ({
  maxWidth: 400,
  margin: 'auto',
  padding: theme.spacing(4),
  borderRadius: 24,
  boxShadow: theme.shadows[3],
}));

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post<AuthResponse>('/api/auth/register', { fullName, email, password });
      setSuccess(response.data.message || 'Đăng ký thành công! Vui lòng đăng nhập.');
      // Chuyển hướng đến trang đăng nhập sau một thời gian
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Register failed:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <StyledPaper>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
          Đăng ký
        </Typography>
        <form onSubmit={handleRegister}>
          <Stack spacing={2.5}>
            <TextField
              label="Họ và tên"
              fullWidth
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Mật khẩu"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{ textTransform: 'none', fontWeight: 700, py: 1.5 }}
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>
            <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
              Đã có tài khoản?{' '}
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography component="span" color="primary" sx={{ fontWeight: 600 }}>
                  Đăng nhập
                </Typography>
              </Link>
            </Typography>
          </Stack>
        </form>
      </StyledPaper>
    </Box>
  );
};

export default RegisterPage;