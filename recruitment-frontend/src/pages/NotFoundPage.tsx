import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        p: 4,
      }}
    >
      <Typography variant="h1" color="primary" sx={{ fontWeight: 800 }}>404</Typography>
      <Typography variant="h5" sx={{ mt: 2, mb: 3 }}>Không tìm thấy trang</Typography>
      <Typography variant="body1" color="text.secondary">
        Rất tiếc, trang bạn đang tìm kiếm không tồn tại.
      </Typography>
      <Button variant="contained" sx={{ mt: 4 }} onClick={() => navigate('/')}>
        Quay về trang chủ
      </Button>
    </Box>
  );
};

export default NotFoundPage;