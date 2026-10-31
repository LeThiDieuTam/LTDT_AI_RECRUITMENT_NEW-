import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  CircularProgress,
  Alert,
  Tooltip,
  Paper,
  Divider,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  Description as DescriptionIcon,
  AutoAwesome as AutoAwesomeIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import type { CvResponse, CvTemplateResponse } from '../../types';
import CvRenderer, { CV_TEMPLATES } from '../../components/CvRenderer';

const CandidateCvListPage: React.FC = () => {
  const navigate = useNavigate();
  const [cvs, setCvs] = useState<CvResponse[]>([]);
  const [templates, setTemplates] = useState<CvTemplateResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Preview dialog
  const [previewCv, setPreviewCv] = useState<CvResponse | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  // Template browser dialog
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  // Delete dialog
  const [deleteCvId, setDeleteCvId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null);
  const [analyzingCvId, setAnalyzingCvId] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<{ score: number; summary: string; strengths: string[]; improvements: string[]; skills: string[]; recommendedKeywords: string[] } | null>(null);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cvsRes, templatesRes] = await Promise.all([
        api.get<CvResponse[]>('/api/cvs'),
        api.get<CvTemplateResponse[]>('/api/cvs/templates'),
      ]);
      setCvs(Array.isArray(cvsRes.data) ? cvsRes.data : []);
      setTemplates(Array.isArray(templatesRes.data) ? templatesRes.data : []);
    } catch (err: any) {
      console.error('Failed to load CVs:', err);
      setError(err?.response?.data?.message || 'Không thể tải danh sách CV. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSetDefault = async (cvId: number) => {
    try {
      await api.put(`/api/cvs/${cvId}/default`);
      setSnackbarMsg('Đã đặt CV làm mặc định thành công!');
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi khi đặt CV mặc định.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCvId) return;
    try {
      setDeleting(true);
      await api.delete(`/api/cvs/${deleteCvId}`);
      setSnackbarMsg('Đã xóa CV thành công!');
      setDeleteCvId(null);
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi khi xóa CV.');
    } finally {
      setDeleting(false);
    }
  };

  const analyzeCv = async (cv: CvResponse) => {
    setAnalyzingCvId(cv.id);
    try {
      const response = await fetch('http://localhost:5001/analyze-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv }),
      });
      if (!response.ok) throw new Error('AI service unavailable');
      setAnalysis(await response.json());
      setAnalysisDialogOpen(true);
    } catch {
      setSnackbarMsg('Chưa kết nối được AI service. Hãy chạy: python ai-service/matching_service.py');
    } finally {
      setAnalyzingCvId(null);
    }
  };

  const handleUseTemplate = (tpl: CvTemplateResponse) => {
    setTemplateDialogOpen(false);
    navigate('/candidate/cvs/new', { state: { templateData: tpl } });
  };

  const getTemplateInfo = (templateId?: string) => {
    return CV_TEMPLATES.find((t) => t.id === templateId) || CV_TEMPLATES[0];
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #0d1442 0%, #3949ab 100%)',
          color: 'white',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Quản lý & Thiết kế CV Ứng viên
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 650 }}>
            Tạo nhiều mẫu CV chuyên nghiệp, đặt CV mặc định và gửi trực tiếp đến các nhà tuyển dụng hàng đầu.
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<AutoAwesomeIcon />}
            onClick={() => setTemplateDialogOpen(true)}
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.6)',
              '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2.5,
              px: 2.5,
              py: 1,
            }}
          >
            Mẫu CV Gợi ý
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/candidate/cvs/new')}
            sx={{
              bgcolor: 'white',
              color: '#0d1442',
              '&:hover': { bgcolor: '#f1f5f9' },
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2.5,
              px: 3,
              py: 1,
            }}
          >
            Tạo CV Mới
          </Button>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* CVs Grid */}
      {cvs.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 4,
            border: '2px dashed #cbd5e1',
            bgcolor: '#ffffff',
          }}
        >
          <DescriptionIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
            Bạn chưa có bản CV nào
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
            Hãy tạo một bản CV đầu tiên hoặc chọn từ các mẫu CV chuyên nghiệp có sẵn để sẵn sàng ứng tuyển các công việc hấp dẫn!
          </Typography>
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<AutoAwesomeIcon />}
              onClick={() => setTemplateDialogOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
            >
              Xem mẫu CV có sẵn
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/candidate/cvs/new')}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
            >
              Tạo CV ngay
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {cvs.map((cv) => {
            const tplInfo = getTemplateInfo(cv.resumeUrl);
            const isDefault = cv.isDefault;

            return (
              <Box key={cv.id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3.5,
                    border: isDefault ? '2px solid #1a237e' : '1px solid #e2e8f0',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    bgcolor: '#ffffff',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
                    },
                  }}
                >
                  {/* Top Bar with Template Color indicator */}
                  <Box sx={{ height: 6, bgcolor: tplInfo.color }} />

                  <CardContent sx={{ p: 3, flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Chip
                        label={tplInfo.name.split('(')[0].trim()}
                        size="small"
                        sx={{
                          bgcolor: `${tplInfo.color}15`,
                          color: tplInfo.color,
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      />
                      {isDefault && (
                        <Chip
                          icon={<StarIcon sx={{ fontSize: '14px !important', color: '#ea580c !important' }} />}
                          label="Mặc định"
                          size="small"
                          sx={{
                            bgcolor: '#fff7ed',
                            color: '#ea580c',
                            fontWeight: 800,
                            border: '1px solid #ffedd5',
                          }}
                        />
                      )}
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                      {cv.title}
                    </Typography>

                    <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 600, mb: 1.5 }}>
                      {cv.targetTitle || 'Vị trí chưa cập nhật'}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Họ tên: <strong>{cv.fullName}</strong>
                    </Typography>

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Cập nhật: {cv.updatedAt ? new Date(cv.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </Typography>
                  </CardContent>

                  <Divider />

                  <CardActions sx={{ p: 1.5, justifyContent: 'space-between', bgcolor: '#f8fafc' }}>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Xem trước CV">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => {
                            setPreviewCv(cv);
                            setPreviewDialogOpen(true);
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Chỉnh sửa CV">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => navigate(`/candidate/cvs/${cv.id}/edit`)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Phân tích CV bằng AI">
                        <Button
                          size="small"
                          color="secondary"
                          startIcon={analyzingCvId === cv.id ? <CircularProgress size={15} color="inherit" /> : <AutoAwesomeIcon />}
                          onClick={() => analyzeCv(cv)}
                          disabled={analyzingCvId !== null}
                          sx={{ minWidth: 0, textTransform: 'none', fontWeight: 700, fontSize: '0.72rem' }}
                        >
                          AI
                        </Button>
                      </Tooltip>

                      <Tooltip title="In / Tải PDF">
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => {
                            setPreviewCv(cv);
                            setPreviewDialogOpen(true);
                            setTimeout(() => {
                              window.print();
                            }, 500);
                          }}
                        >
                          <PrintIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>

                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      {!isDefault && (
                        <Tooltip title="Đặt làm CV mặc định khi ứng tuyển">
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<StarBorderIcon />}
                            onClick={() => handleSetDefault(cv.id)}
                            sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}
                          >
                            Mặc định
                          </Button>
                        </Tooltip>
                      )}

                      <Tooltip title="Xóa CV">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteCvId(cv.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </CardActions>
                </Card>
              </Box>
            );
          })}
        </Box>
      )}

      {/* AI CV Analysis Dialog */}
      <Dialog open={analysisDialogOpen} onClose={() => setAnalysisDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: 'primary.dark' }}>Phân tích CV bằng AI</DialogTitle>
        <DialogContent dividers>
          {analysis && (
            <Stack spacing={2.25} sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2.5, bgcolor: '#e8eaf6' }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: analysis.score >= 70 ? 'success.main' : analysis.score >= 45 ? 'warning.main' : 'error.main' }}>{analysis.score}</Typography>
                <Box><Typography sx={{ fontWeight: 800 }}>CV Score / 100</Typography><Typography variant="body2" color="text.secondary">Đánh giá dựa trên nội dung, tính cụ thể và mức độ chuyên nghiệp.</Typography></Box>
              </Box>
              <Typography variant="body2" sx={{ lineHeight: 1.7 }}>{analysis.summary}</Typography>
              <Box><Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.75 }}>Điểm mạnh</Typography><Stack spacing={0.5}>{analysis.strengths.map((item) => <Typography key={item} variant="body2"> {item}</Typography>)}</Stack></Box>
              <Box><Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.75 }}>Nên cải thiện</Typography><Stack spacing={0.5}>{analysis.improvements.map((item) => <Typography key={item} variant="body2"> {item}</Typography>)}</Stack></Box>
              <Box><Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.75 }}>Từ khóa đề xuất</Typography><Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>{analysis.recommendedKeywords.map((item) => <Chip key={item} label={item} size="small" color="primary" variant="outlined" />)}</Box></Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setAnalysisDialogOpen(false)} sx={{ textTransform: 'none', fontWeight: 700 }}>Đóng</Button></DialogActions>
      </Dialog>

      {/* Template Browser Dialog */}
      <Dialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3.5, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Kho Mẫu CV Chuyên Nghiệp (Curated Templates)
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Chọn mẫu CV phù hợp với ngành nghề và kinh nghiệm của bạn để bắt đầu tạo hồ sơ nhanh chóng:
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {templates.map((tpl) => (
              <Box key={tpl.templateId}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: '1px solid #e2e8f0',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: tpl.previewColor,
                      boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        bgcolor: tpl.previewColor,
                      }}
                    />
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                      {tpl.templateName}
                    </Typography>
                  </Box>

                  <Chip
                    label={tpl.category}
                    size="small"
                    sx={{ width: 'fit-content', mb: 1.5, fontWeight: 600, fontSize: '0.75rem' }}
                  />

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                    {tpl.description}
                  </Typography>

                  <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: 2, mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block' }}>
                      Vị trí mẫu: {tpl.sampleTargetTitle}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                      Kỹ năng: {tpl.sampleSkills}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => handleUseTemplate(tpl)}
                    sx={{
                      bgcolor: tpl.previewColor,
                      '&:hover': { opacity: 0.9 },
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: 2,
                    }}
                  >
                    Dùng Mẫu Này
                  </Button>
                </Paper>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setTemplateDialogOpen(false)} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* CV Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3.5, bgcolor: '#f1f5f9' } } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Xem trước: {previewCv?.title}
          </Typography>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            In / Lưu PDF
          </Button>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1, sm: 3 } }}>
          {previewCv && <CvRenderer cv={previewCv} />}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: 'white' }}>
          {previewCv && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => {
                setPreviewDialogOpen(false);
                navigate(`/candidate/cvs/${previewCv.id}/edit`);
              }}
              sx={{ textTransform: 'none', fontWeight: 600, mr: 'auto' }}
            >
              Chỉnh sửa CV
            </Button>
          )}
          <Button onClick={() => setPreviewDialogOpen(false)} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteCvId)}
        onClose={() => setDeleteCvId(null)}
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Xác nhận xóa CV</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Bạn có chắc chắn muốn xóa bản CV này không? Thao tác này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteCvId(null)} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={deleting}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            {deleting ? 'Đang xóa...' : 'Xóa CV'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={Boolean(snackbarMsg)}
        autoHideDuration={4000}
        onClose={() => setSnackbarMsg(null)}
        message={snackbarMsg}
      />
    </Box>
  );
};

export default CandidateCvListPage;

