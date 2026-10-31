import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Chip,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  PostAdd as PostAddIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  AccountCircle as AccountCircleIcon,
  ManageAccounts as ManageAccountsIcon,
  Description as DescriptionIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  Stars as StarsIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import type { UserInfo } from '../types';

const navItems = [
  { label: 'Dashboard', path: '/', roles: ['ADMIN', 'HR', 'CANDIDATE'], icon: <DashboardIcon fontSize="small" /> },
  { label: 'Việc làm', path: '/jobs', roles: ['ADMIN', 'CANDIDATE'], icon: <WorkIcon fontSize="small" /> },
  { label: 'Mẫu & Quản lý CV', path: '/candidate/cvs', roles: ['CANDIDATE'], icon: <DescriptionIcon fontSize="small" /> },
  { label: 'Quản lý tin đăng', path: '/hr/job-postings', roles: ['HR'], icon: <AssignmentIcon fontSize="small" /> },
  { label: 'Đăng tin mới', path: '/hr/job-postings/new', roles: ['HR'], icon: <PostAddIcon fontSize="small" /> },
  { label: 'Ứng viên', path: '/hr/candidates', roles: ['HR'], icon: <PeopleIcon fontSize="small" /> },
  { label: 'Công ty của tôi', path: '/hr/company', roles: ['HR'], icon: <BusinessIcon fontSize="small" /> },
  { label: 'Công ty', path: '/companies', roles: ['ADMIN', 'HR', 'CANDIDATE'], icon: <BusinessIcon fontSize="small" /> },
  { label: 'Quản lý công ty', path: '/admin/companies', roles: ['ADMIN'], icon: <BusinessIcon fontSize="small" /> },
  { label: 'Quản lý ứng viên', path: '/admin/candidates', roles: ['ADMIN'], icon: <PeopleIcon fontSize="small" /> },
  { label: 'Hồ sơ', path: '/profile', roles: ['ADMIN', 'HR', 'CANDIDATE'], icon: <AccountCircleIcon fontSize="small" /> },
  { label: 'Quản lý người dùng', path: '/admin/users', roles: ['ADMIN'], icon: <ManageAccountsIcon fontSize="small" /> },
];

const guestNavItems = [
  { label: 'Trang chủ', path: '/', icon: <DashboardIcon fontSize="small" /> },
  { label: 'Việc làm', path: '/jobs', icon: <WorkIcon fontSize="small" /> },
  { label: 'Mẫu CV', path: '/candidate/cvs', icon: <DescriptionIcon fontSize="small" /> },
  { label: 'Công ty', path: '/companies', icon: <BusinessIcon fontSize="small" /> },
];

const candidateAnnouncements = [
  ' Hơn 500+ vị trí tuyển dụng mới cập nhật hôm nay trên HireHub',
  ' Kết nối trực tiếp với 1.000+ doanh nghiệp hàng đầu toàn quốc',
  ' Tạo CV chuyên nghiệp & tối ưu hóa hồ sơ miễn phí',
  ' Tăng 3x cơ hội trúng tuyển khi bật chế độ tìm việc',
  ' Mức lương cạnh tranh và cơ hội thăng tiến rộng mở',
];

const hrAnnouncements = [
  ' Tiếp cận kho dữ liệu 10.000+ ứng viên chất lượng cao',
  ' Quản trị chiến dịch tuyển dụng thông minh và hiệu quả',
  ' Sàng lọc hồ sơ ứng viên nhanh chóng, tối ưu hóa quy trình phỏng vấn',
  ' Đăng tin tuyển dụng đa kênh tiếp cận nhân tài tiềm năng',
];

const AnnouncementBar: React.FC<{ role?: string }> = ({ role }) => {
  const announcements = role === 'HR' ? hrAnnouncements : candidateAnnouncements;
  const text = announcements.join('   •   ');

  return (
    <Box
      sx={{
        background: 'linear-gradient(90deg, #0d1442 0%, #0d1442 55%, #1a237e 100%)',
        color: '#fff',
        py: 0.6,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 2px 8px rgba(26, 35, 126, 0.2)',
      }}
    >
      <Box sx={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 50,
        background: 'linear-gradient(90deg, #0d1442, transparent)',
        zIndex: 2,
      }} />
      <Box sx={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 50,
        background: 'linear-gradient(-90deg, #1a237e, transparent)',
        zIndex: 2,
      }} />

      <Box
        sx={{
          display: 'flex',
          whiteSpace: 'nowrap',
          animation: 'marquee 32s linear infinite',
          '@keyframes marquee': {
            '0%': { transform: 'translateX(100vw)' },
            '100%': { transform: 'translateX(-100%)' },
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            fontSize: '0.76rem',
            letterSpacing: '0.03em',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <StarsIcon sx={{ fontSize: 14, color: '#c5cae9' }} />
          {text}
          &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
          {text}
        </Typography>
      </Box>
    </Box>
  );
};

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  let userInfo: UserInfo | null = null;

  try {
    const storedUser = localStorage.getItem('user_info');
    if (storedUser && storedUser !== '{}') {
      userInfo = JSON.parse(storedUser);
      if (userInfo && userInfo.role && typeof userInfo.role === 'string') {
        userInfo.role = userInfo.role.replace(/^ROLE_/, '') as UserInfo['role'];
      }
    }
  } catch (error) {
    console.error('Lỗi khi phân tích user_info:', error);
    localStorage.removeItem('user_info');
  }

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
    navigate('/login');
  };

  const displayedNavItems = userInfo
    ? navItems.filter((item) => item.roles.includes(userInfo.role))
    : guestNavItems;
  const isHr = userInfo?.role === 'HR';

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const drawer = (
    <Box sx={{ width: 290, display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#ffffff' }}>
      {/* Header */}
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #0d1442 0%, #1a237e 78%, #3949ab 100%)',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <Box component="span" sx={{ bgcolor: '#ffffff', color: '#0d1442', px: 1, py: 0.3, borderRadius: '8px', fontWeight: 900, fontSize: '1rem' }}>
            Hire
          </Box>
          <Box component="span" sx={{ color: '#c5cae9', fontWeight: 900 }}>Hub</Box>
        </Typography>

        {userInfo ? (
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5, alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: '#ffffff',
                color: '#1a237e',
                width: 44,
                height: 44,
                fontWeight: 800,
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              {getInitials(userInfo.fullName)}
            </Avatar>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 800, color: '#ffffff' }}>
                {userInfo.fullName}
              </Typography>
              <Typography variant="caption" noWrap sx={{ color: 'rgba(255,255,255,0.85)', display: 'block', fontSize: '0.72rem' }}>
                {userInfo.email}
              </Typography>
              <Chip
                label={userInfo.role}
                size="small"
                sx={{
                  mt: 0.5,
                  fontWeight: 800,
                  height: 18,
                  fontSize: 9,
                  bgcolor: 'rgba(255,255,255,0.25)',
                  color: '#ffffff',
                }}
              />
            </Box>
          </Box>
        ) : (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 700 }}>Chào mừng bạn đến với HireHub</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>Tiếp lợi thế - Nối thành công</Typography>
          </Box>
        )}
      </Box>

      <Divider />

      {/* Navigation List */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {displayedNavItems.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.8 }}>
              <ListItemButton
                onClick={() => {
                  setMobileOpen(false);
                  navigate(item.path);
                }}
                sx={{
                  borderRadius: 2.5,
                  py: 1.1,
                  px: 2,
                  bgcolor: isActive ? 'rgba(26, 35, 126, 0.1)' : 'transparent',
                  color: isActive ? '#0d1442' : '#334155',
                  borderLeft: isActive ? '4px solid #1a237e' : '4px solid transparent',
                  '& .MuiListItemIcon-root': {
                    color: isActive ? '#1a237e' : '#64748b',
                  },
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(26, 35, 126, 0.15)' : 'rgba(15,23,42,0.04)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon sx={{ minWidth: 38 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ fontWeight: isActive ? 800 : 600, fontSize: '0.88rem' }}>
                      {item.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Drawer Bottom Actions */}
      <Box sx={{ p: 2 }}>
        {userInfo ? (
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2.5,
              py: 1,
              '&:hover': { bgcolor: 'rgba(239,68,68,0.06)' },
            }}
          >
            Đăng xuất
          </Button>
        ) : (
          <Stack spacing={1.2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<LoginIcon />}
              onClick={() => { setMobileOpen(false); navigate('/login'); }}
              sx={{
                textTransform: 'none',
                fontWeight: 800,
                borderRadius: '999px',
                py: 1.1,
                bgcolor: '#1a237e',
                '&:hover': { bgcolor: '#0d1442' },
              }}
            >
              Đăng nhập
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<PersonAddIcon />}
              onClick={() => { setMobileOpen(false); navigate('/register'); }}
              sx={{
                textTransform: 'none',
                fontWeight: 800,
                borderRadius: '999px',
                py: 1.1,
                borderColor: '#1a237e',
                color: '#0d1442',
                '&:hover': { borderColor: '#0d1442', bgcolor: 'rgba(26, 35, 126, 0.06)' },
              }}
            >
              Đăng ký tài khoản
            </Button>
          </Stack>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f4f5f7', pl: isHr ? { md: '290px' } : 0 }}>

      {/* ── Top Announcement Bar ── */}
      {!isHr && <AnnouncementBar role={userInfo?.role} />}

      {/* ── HireHub Sticky Header ── */}
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          display: isHr ? { xs: 'block', md: 'none' } : 'block',
          backdropFilter: 'blur(20px)',
          backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.98)' : '#ffffff',
          borderBottom: '1px solid rgba(226, 232, 240, 0.9)',
          boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.06)' : '0 1px 4px rgba(0, 0, 0, 0.03)',
          transition: 'all 0.25s ease',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              py: 0.8,
              px: { xs: 1, md: 2 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >

            {/* Left: HireHub Brand Logo */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                cursor: 'pointer',
                flexShrink: 0,
              }}
              onClick={() => navigate('/')}
            >
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileOpen(true);
                }}
                sx={{ mr: 0.5, display: { md: 'none' }, color: '#334155' }}
              >
                <MenuIcon />
              </IconButton>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    color: '#171923',
                    fontSize: '1.45rem',
                    lineHeight: 1,
                  }}
                >
                  <Box component="span" sx={{ color: '#0d1442' }}>Hire</Box>                  <Box component="span" sx={{ color: '#1a237e' }}>Hub</Box>
                </Typography>
              </Box>

              <Typography
                variant="caption"
                sx={{
                  color: '#64748b',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  display: { xs: 'none', lg: 'block' },
                  borderLeft: '1px solid #cbd5e1',
                  pl: 1.2,
                  lineHeight: 1.2,
                }}
              >
                Tiếp lợi thế <br />
                <Box component="span" sx={{ color: '#1a237e' }}>Nối thành công</Box>
              </Typography>

              {userInfo && (
                <Chip
                  label={userInfo.role}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    height: 20,
                    fontSize: 9,
                    px: 0.5,
                    bgcolor: '#e8eaf6',
                    color: '#0d1442',
                    border: '1px solid rgba(26, 35, 126, 0.3)',
                    display: { xs: 'none', sm: 'inline-flex' },
                  }}
                />
              )}
            </Box>

            {/* Center: HireHub Navigation Links */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.25,
                flexGrow: 1,
                flexShrink: 1,
                minWidth: 0,
                mx: 'auto',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
              }}
            >
              {displayedNavItems.map((item) => {
                const isActive =
                  item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path);

                return (
                  <Button
                    key={item.path}
                    variant="text"
                    startIcon={item.icon}
                    onClick={() => navigate(item.path)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: isActive ? 800 : 600,
                      borderRadius: '8px',
                      px: { md: 1, lg: 1.5 },
                      py: 0.8,
                      fontSize: '0.88rem',
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                      '& .MuiButton-startIcon': {
                        display: { md: 'none', lg: 'inline-flex' },
                        mr: { lg: 0.75 },
                      },
                      color: isActive ? '#0d1442' : '#334155',
                      bgcolor: isActive ? '#e8eaf6' : 'transparent',
                      '&:hover': {
                        bgcolor: isActive ? '#dbeafe' : '#f8fafc',
                        color: '#0d1442',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>

            {/* Right: Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexShrink: 0 }}>
              <Tooltip title="Tìm kiếm việc làm">
                <IconButton
                  onClick={() => navigate('/jobs')}
                  sx={{
                    bgcolor: '#f8fafc',
                    color: '#475569',
                    border: '1px solid #e2e8f0',
                    '&:hover': { bgcolor: '#e8eaf6', color: '#0d1442', borderColor: '#1a237e' },
                    display: { xs: 'none', sm: 'inline-flex' },
                  }}
                  size="small"
                >
                  <SearchIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {userInfo ? (
                <>
                  <Box
                    sx={{
                      display: { xs: 'none', sm: 'flex' },
                      flexDirection: 'row',
                      gap: 1.2,
                      alignItems: 'center',
                      bgcolor: '#f8fafc',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '999px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #0d1442 0%, #1a237e 100%)',
                        color: '#ffffff',
                        width: 32,
                        height: 32,
                        fontSize: '0.8rem',
                        fontWeight: 800,
                      }}
                    >
                      {getInitials(userInfo.fullName)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.1, fontSize: '0.82rem', color: '#0f172a' }}>
                        {userInfo.fullName}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', fontSize: '0.68rem', color: '#0d1442', fontWeight: 700 }}>
                        {userInfo.role}
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: '8px',
                      display: { xs: 'none', md: 'inline-flex' },
                      borderColor: 'rgba(239, 68, 68, 0.35)',
                      color: '#ef4444',
                      '&:hover': {
                        borderColor: '#ef4444',
                        bgcolor: 'rgba(239, 68, 68, 0.08)',
                      },
                      fontSize: '0.8rem',
                      px: 1.8,
                    }}
                  >
                    Đăng xuất
                  </Button>

                  <Avatar
                    sx={{
                      background: 'linear-gradient(135deg, #0d1442 0%, #1a237e 100%)',
                      color: '#ffffff',
                      width: 34,
                      height: 34,
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      display: { xs: 'flex', sm: 'none' },
                    }}
                  >
                    {getInitials(userInfo.fullName)}
                  </Avatar>
                </>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate('/login')}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      color: '#0d1442',
                      borderColor: '#1a237e',
                      '&:hover': { bgcolor: '#e8eaf6', borderColor: '#0d1442' },
                      borderRadius: '8px',
                      px: 2,
                      display: { xs: 'none', sm: 'inline-flex' },
                      fontSize: '0.84rem',
                    }}
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate('/register')}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 800,
                      borderRadius: '8px',
                      bgcolor: '#1a237e',
                      color: '#ffffff',
                      '&:hover': { bgcolor: '#0d1442' },
                      px: 2.5,
                      py: 0.8,
                      fontSize: '0.84rem',
                      boxShadow: '0 4px 12px rgba(26, 35, 126, 0.3)',
                    }}
                  >
                    Đăng ký
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate('/login')}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 800,
                      borderRadius: '8px',
                      bgcolor: '#171923',
                      color: '#ffffff',
                      '&:hover': { bgcolor: '#2d3748' },
                      display: { xs: 'none', lg: 'inline-flex' },
                      px: 2,
                      py: 0.8,
                      fontSize: '0.84rem',
                    }}
                  >
                    Đăng tuyển & Tìm ứng viên
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* ── Mobile Drawer ── */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 290,
            borderRight: 'none',
            boxShadow: '8px 0 36px rgba(26, 35, 126, 0.15)',
          },
        }}
      >
        {drawer}
      </Drawer>

      {isHr && (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: 290,
            flexShrink: 0,
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 1200,
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 290,
              height: '100vh',
              borderRight: '1px solid #e2e8f0',
              boxShadow: '4px 0 18px rgba(15, 23, 42, 0.04)',
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* ── Main Content Viewport ── */}
      <Box
        component="main"
        sx={{
          py: { xs: 2.5, md: 4 },
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          minWidth: 0,
        }}
      >
        {isHr && (
          <Box
            component="header"
            sx={{
              width: '100%',
              maxWidth: 'xl',
              px: { xs: 2, sm: 3, md: 4 },
              mb: { xs: 2, md: 3 },
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="overline" sx={{ color: '#0d1442', fontWeight: 700, letterSpacing: '0.08em' }}>
                HR WORKSPACE
              </Typography>
              <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 700, lineHeight: 1.2 }}>
                Bảng điều khiển nhân sự
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<PostAddIcon />}
              onClick={() => navigate('/hr/job-postings/new')}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                bgcolor: '#1a237e',
                textTransform: 'none',
                fontWeight: 700,
                '&:hover': { bgcolor: '#0d1442' },
              }}
            >
              Đăng tin tuyển dụng
            </Button>
          </Box>
        )}
        <Container maxWidth="xl" sx={{ width: '100%', minWidth: 0, px: { xs: 2, sm: 3, md: 4 } }}>
          <Outlet />
        </Container>
      </Box>

      <Box component="footer" sx={{ bgcolor: '#171923', color: '#fff', py: 3, px: 2 }}>
        <Container maxWidth="xl">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
          >
            <Typography sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>HireHub</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Nền tảng kết nối ứng viên và nhà tuyển dụng hiệu quả.
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)' }}>
              © {new Date().getFullYear()} HireHub
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default AppLayout;
