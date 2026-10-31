import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { keyframes } from '@mui/material/styles';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Stars as StarsIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import type { AuthResponse, UserInfo } from '../../types';

// ─── Keyframes ─────────────────────────────────────────────────────────────
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const gradientShift = keyframes`
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33%       { transform: translateY(-16px) rotate(3deg); }
  66%       { transform: translateY(-8px) rotate(-3deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%       { opacity: 1;   transform: scale(1.05); }
`;

// ─── Floating Orb component ─────────────────────────────────────────────────
const Orb: React.FC<{ size: number; top: string; left?: string; right?: string; color: string; delay?: number }> = ({
  size, top, left, right, color, delay = 0,
}) => (
  <Box
    sx={{
      position: 'absolute',
      top, left, right,
      width: size, height: size,
      borderRadius: '50%',
      bgcolor: color,
      filter: `blur(${size * 0.3}px)`,
      animation: `${float} ${6 + delay}s ease-in-out ${delay}s infinite`,
      pointerEvents: 'none',
    }}
  />
);

// ─── Component ──────────────────────────────────────────────────────────────
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const storedUser = localStorage.getItem('user_info');
    if (token && storedUser) navigate('/');
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<AuthResponse>('/api/auth/login', { email, password });
      const { token, fullName = '', email: userEmail, role } = response.data;

      localStorage.setItem('jwt_token', token);

      let normalizedRole: UserInfo['role'];
      if (role && typeof role === 'string') {
        normalizedRole = role.replace(/^ROLE_/, '') as UserInfo['role'];
      } else {
        normalizedRole = 'CANDIDATE';
      }
      localStorage.setItem('user_info', JSON.stringify({ fullName, email: userEmail, role: normalizedRole }));
      navigate('/');
    } catch (err: any) {
      console.error('Login failed:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: <WorkIcon sx={{ fontSize: 22 }} />, value: '500+', label: 'Vị trí tuyển dụng mới mỗi ngày' },
    { icon: <PeopleIcon sx={{ fontSize: 22 }} />, value: '10K+', label: 'Ứng viên & Nhà tuyển dụng kết nối' },
    { icon: <TrendingUpIcon sx={{ fontSize: 22 }} />, value: '95%', label: 'Tỷ lệ ứng tuyển thành công' },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 40%, #1a237e 70%, #0d1442 100%)',
        backgroundSize: '200% 200%',
        animation: `${gradientShift} 12s ease infinite`,
      }}
    >
      {/* Background orbs (DesignerVN style) */}
      <Orb size={400} top="-100px" left="-100px" color="rgba(6, 182, 212, 0.2)" delay={0} />
      <Orb size={300} top="60%" left="5%"  color="rgba(236, 72, 153, 0.25)" delay={2} />
      <Orb size={250} top="-50px" right="-80px" color="rgba(26, 35, 126, 0.3)" delay={1.5} />
      <Orb size={220} top="70%" right="10%" color="rgba(57, 73, 171, 0.2)" delay={3} />

      {/* Grid overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }}
      />

      {/* ── Left Panel (Desktop only) ── */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          width: '50%',
          p: 8,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Box sx={{ animation: `${fadeInUp} 0.7s ease both` }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 5 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #3949ab 0%, #3949ab 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(6, 182, 212, 0.4)',
              }}
            >
              <WorkIcon sx={{ color: '#ffffff', fontSize: 26 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff', letterSpacing: '-0.04em' }}>
              RECRUIT<Box component="span" sx={{ color: '#fef08a' }}>PORTAL</Box>
            </Typography>
          </Box>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              mb: 2,
              fontSize: '3rem',
            }}
          >
            Khám phá cơ hội
            <Box component="span" sx={{ display: 'block', color: '#fef08a' }}>
              phát triển sự nghiệp
            </Box>
            dành riêng cho bạn
          </Typography>

          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, mb: 5, maxWidth: 440 }}>
            Nền tảng kết nối ứng viên tài năng với các cơ hội việc làm tốt nhất từ hàng nghìn doanh nghiệp hàng đầu.
          </Typography>

          {/* Stats */}
          <Stack spacing={2.5}>
            {stats.map((stat, i) => (
              <Box
                key={stat.label}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  animation: `${fadeInUp} 0.6s ease ${0.2 + i * 0.1}s both`,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '14px',
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    animation: `${pulse} ${3 + i}s ease-in-out ${i * 0.5}s infinite`,
                  }}
                >
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* ── Right Panel: Login Form ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          p: { xs: 2, sm: 4 },
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 440,
            animation: `${fadeInUp} 0.6s ease 0.1s both`,
          }}
        >
          {/* Glassmorphism Card */}
          <Box
            sx={{
              borderRadius: 6,
              p: { xs: 3.5, sm: 5 },
              bgcolor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(25px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
            }}
          >
            {/* Mobile Logo */}
            <Box sx={{ display: { xs: 'flex', lg: 'none' }, alignItems: 'center', gap: 1.2, mb: 3.5 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #3949ab 0%, #3949ab 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <WorkIcon sx={{ color: '#ffffff', fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>
                RECRUIT PORTAL
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <StarsIcon sx={{ color: '#fef08a', fontSize: 18 }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#ffffff', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                ĐĂNG NHẬP TÀI KHOẢN
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff', mb: 0.5, letterSpacing: '-0.02em' }}>
              Chào mừng trở lại!
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3.5 }}>
              Đăng nhập để quản lý hồ sơ và theo dõi cơ hội việc làm
            </Typography>

            <form onSubmit={handleLogin}>
              <Stack spacing={2.5}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.7)' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                      borderRadius: '999px',
                      color: '#fff',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.6)' },
                      '&.Mui-focused fieldset': { borderColor: '#fef08a' },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.75)' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#fef08a' },
                    '& input': { color: '#fff', px: 2 },
                  }}
                />

                <TextField
                  label="Mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.7)' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}
                          >
                            {showPassword ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                      borderRadius: '999px',
                      color: '#fff',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.6)' },
                      '&.Mui-focused fieldset': { borderColor: '#fef08a' },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.75)' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#fef08a' },
                    '& input': { color: '#fff', px: 2 },
                  }}
                />

                {error && (
                  <Alert severity="error" sx={{ borderRadius: 3 }}>
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 800,
                    py: 1.5,
                    borderRadius: '999px',
                    bgcolor: '#ffffff',
                    color: '#1a237e',
                    fontSize: '0.98rem',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                    '&:hover': {
                      bgcolor: '#f8fafc',
                      color: '#0d1442',
                      transform: 'translateY(-2px)',
                    },
                    '&:disabled': { opacity: 0.7 },
                    transition: 'all 0.22s ease',
                  }}
                >
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>

                <Typography variant="body2" sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.85)' }}>
                  Chưa có tài khoản?{' '}
                  <Link to="/register" style={{ textDecoration: 'none' }}>
                    <Box
                      component="span"
                      sx={{
                        color: '#fef08a',
                        fontWeight: 800,
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      Đăng ký ngay
                    </Box>
                  </Link>
                </Typography>
              </Stack>
            </form>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;