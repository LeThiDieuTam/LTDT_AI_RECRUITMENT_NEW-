import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PostJobPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.dark' }} gutterBottom>
        Đăng tin tuyển dụng mới
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Đây là trang để nhà tuyển dụng đăng tin tuyển dụng mới.
      </Typography>
      <Button variant="outlined" sx={{ mt: 3 }} onClick={() => navigate(-1)}>← Quay lại</Button>
    </Box>
  );
};
export default PostJobPage;