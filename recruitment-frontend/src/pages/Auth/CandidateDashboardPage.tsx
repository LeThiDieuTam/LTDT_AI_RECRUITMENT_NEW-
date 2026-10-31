import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material'; 
import CandidateDashboardContent from './CandidateDashboardContent'; // Import the content component
import type { UserInfo } from '../../types'; 

const CandidateDashboardPage: React.FC<{ userInfo: UserInfo | null }> = ({ userInfo }) => {
  const navigate = useNavigate();

  if (!userInfo) {
   
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Thông tin người dùng không khả dụng. Vui lòng đăng nhập lại.</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/login')}>Đăng nhập</Button>
      </Box>
    );
  }

  return (
    <CandidateDashboardContent userInfo={userInfo} navigate={navigate} />
  );
};

export default CandidateDashboardPage;