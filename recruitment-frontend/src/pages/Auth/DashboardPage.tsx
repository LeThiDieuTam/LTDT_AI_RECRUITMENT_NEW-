import React, { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { UserInfo } from '../../types';
import CandidateDashboardContent from './CandidateDashboardContent';
import HrDashboardPage from '../HrDashboardPage';
import AdminDashboardPage from './AdminDashboardPage';

import PublicGuestDashboard from './PublicGuestDashboard';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUserInfo = () => {
      try {
        const storedUserInfo = localStorage.getItem('user_info');
        if (storedUserInfo) {
          const parsedUserInfo: UserInfo = JSON.parse(storedUserInfo);
          if (parsedUserInfo.role && typeof parsedUserInfo.role === 'string') {
            parsedUserInfo.role = parsedUserInfo.role.replace(/^ROLE_/, '').toUpperCase() as UserInfo['role'];
          }
          setUserInfo(parsedUserInfo);
        } else {
          setUserInfo(null);
        }
      } catch (error) {
        console.error('Không thể đọc user_info:', error);
        setUserInfo(null);
      } finally {
        setLoading(false);
      }
    };
    loadUserInfo();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress sx={{ color: '#1a237e' }} />
      </Box>
    );
  }

  if (!userInfo) {
    return <PublicGuestDashboard />;
  }

  switch (userInfo.role) {
    case 'ADMIN':
      return <AdminDashboardPage userInfo={userInfo} navigate={navigate} />;
    case 'HR':
      return <HrDashboardPage userInfo={userInfo} navigate={navigate} />;
    case 'CANDIDATE':
      return <CandidateDashboardContent userInfo={userInfo} navigate={navigate} />;
    default:
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            Vai trò người dùng không xác định: {userInfo.role}
          </Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/login')}>
            Đăng nhập lại
          </Button>
        </Box>
      );
  }
};

export default DashboardPage;
