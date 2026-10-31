import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  Button,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Snackbar,
  Card,
  CardContent,
} from '@mui/material';
import {
  GetApp as GetAppIcon,
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  EditNote as EditNoteIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  Event as EventIcon,
  SmartToy as SmartToyIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import type { CandidateDetailResponse, ApplicationStatus, CvResponse, InterviewResponse } from '../../types';
import { getStatusChipColor } from '../HrDashboardPage';
import CvRenderer from '../../components/CvRenderer';

const CandidateDetailPage: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<CandidateDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status update dialog states
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('REVIEWING');
  const [feedbackText, setFeedbackText] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [interviewAppId, setInterviewAppId] = useState<number | null>(null);
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [interviews, setInterviews] = useState<InterviewResponse[]>([]);
  const [interviewSaving, setInterviewSaving] = useState(false);
  const [interviewForm, setInterviewForm] = useState({ scheduledAt: '', durationMinutes: '60', interviewer: '', meetingUrl: '', result: 'SCHEDULED', notes: '' });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    score: number;
    level: string;
    summary: string;
    strengths?: string[];
    improvements?: string[];
    skills?: string[];
    recommendedKeywords?: string[];
    matchedSkills?: string[];
    missingSkills?: string[];
    mode?: string;
    notice?: string;
  } | null>(null);
  const [aiAppId, setAiAppId] = useState<number | null>(null);

  // CV Preview modal
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [viewingCv, setViewingCv] = useState<CvResponse | null>(null);

  const fetchCandidateDetails = async () => {
    if (!candidateId) {
      setError('Không tìm thấy ID ứng viên.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<CandidateDetailResponse>(`/api/hr/candidates/${candidateId}`);
      setCandidate(response.data);
    } catch (err: any) {
      console.error('Failed to fetch candidate details:', err);
      setError(err?.response?.data?.message || 'Không thể tải chi tiết hồ sơ ứng viên.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidateDetails();
  }, [candidateId]);

  const handleDownloadResume = (resumeUrl: string | undefined) => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
    } else {
      alert('Ứng viên chưa đính kèm file CV hoặc liên kết CV.');
    }
  };

  const handleOpenStatusDialog = (appId: number, currentStatus: ApplicationStatus) => {
    setSelectedAppId(appId);
    setNewStatus(currentStatus);
    setFeedbackText('');
    setStatusDialogOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedAppId) return;
    try {
      setUpdatingStatus(true);
      await api.put(`/api/hr/applications/${selectedAppId}/status`, {
        newStatus,
        feedback: feedbackText.trim() || undefined,
      });
      setSnackbarMessage('Đã cập nhật trạng thái ứng tuyển thành công!');
      setStatusDialogOpen(false);
      fetchCandidateDetails();
    } catch (err: any) {
      console.error('Failed to update status:', err);
      alert(err?.response?.data?.message || 'Lỗi khi cập nhật trạng thái hồ sơ.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const analyzeCandidateMatch = async (applicationId: number, jobTitle: string) => {
    setAiLoading(true);
    setAiAppId(applicationId);
    try {
      const response = await api.post<{
        score: number; level: string; summary: string; strengths?: string[]; improvements?: string[];
        skills?: string[]; recommendedKeywords?: string[]; matchedSkills?: string[]; missingSkills?: string[];
        mode?: string; notice?: string;
      }>(
        `/api/hr/candidates/${candidateId}/ai/analyze-cv?jobTitle=${encodeURIComponent(jobTitle)}`,
      );
      setAiResult(response.data);
      if (response.data.mode === 'local-fallback') {
        setSnackbarMessage(response.data.notice || 'AI service chưa khả dụng, đang dùng phân tích cục bộ.');
      } else {
        setSnackbarMessage('AI đã phân tích CV thành công!');
      }
    } catch (err: any) {
      console.error('AI analysis failed:', err);
      setSnackbarMessage(err?.response?.data?.message || 'Không thể phân tích CV. Vui lòng thử lại.');
    } finally {
      setAiLoading(false);
    }
  };

  const openInterviewDialog = async (applicationId: number) => {
    setInterviewAppId(applicationId);
    setInterviewForm({ scheduledAt: '', durationMinutes: '60', interviewer: '', meetingUrl: '', result: 'SCHEDULED', notes: '' });
    try {
      const response = await api.get<InterviewResponse[]>(`/api/hr/applications/${applicationId}/interviews`);
      setInterviews(response.data);
    } catch {
      setInterviews([]);
    }
    setInterviewDialogOpen(true);
  };

  const saveInterview = async () => {
    if (!interviewAppId || !interviewForm.scheduledAt) return;
    try {
      setInterviewSaving(true);
      const response = await api.post<InterviewResponse>(`/api/hr/applications/${interviewAppId}/interviews`, {
        ...interviewForm,
        durationMinutes: Number(interviewForm.durationMinutes) || 60,
      });
      setInterviews((current) => [response.data, ...current]);
      setInterviewForm({ scheduledAt: '', durationMinutes: '60', interviewer: '', meetingUrl: '', result: 'SCHEDULED', notes: '' });
      setSnackbarMessage('Đã lưu lịch phỏng vấn và gửi email thông báo tới ứng viên!');
    } catch (err: any) {
      setSnackbarMessage(err?.response?.data?.message || 'Không thể lưu thông tin phỏng vấn.');
    } finally {
      setInterviewSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/hr/candidates')} sx={{ mb: 2 }}>
          Quay lại danh sách
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!candidate) {
    return (
      <Box sx={{ p: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/hr/candidates')} sx={{ mb: 2 }}>
          Quay lại danh sách
        </Button>
        <Alert severity="warning">Không tìm thấy thông tin ứng viên này.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', pb: 5 }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/hr/candidates')}
        sx={{ mb: 3, textTransform: 'none', fontWeight: 600 }}
      >
        Quay lại danh sách ứng viên
      </Button>

      {/* Main Profile Layout */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3 }}>
        {/* Left Side: Summary Card */}
        <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid #e2e8f0', height: 'fit-content' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.dark', mb: 0.5 }}>
            {candidate.fullName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            ID Ứng viên: #{candidate.id}
          </Typography>

          <Divider sx={{ mb: 2.5 }} />

          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <EmailIcon color="action" fontSize="small" />
              <Box>
                <Typography variant="caption" color="text.secondary">Email</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{candidate.email}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PhoneIcon color="action" fontSize="small" />
              <Box>
                <Typography variant="caption" color="text.secondary">Số điện thoại</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{candidate.phone || 'Chưa cập nhật'}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <LocationOnIcon color="action" fontSize="small" />
              <Box>
                <Typography variant="caption" color="text.secondary">Địa chỉ</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{candidate.address || 'Chưa cập nhật'}</Typography>
              </Box>
            </Box>
          </Stack>

          <Divider sx={{ my: 2.5 }} />

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
            Hồ sơ & CV đính kèm
          </Typography>

          <Stack spacing={1.5}>
            {/* If candidate has default CV or registered CVs */}
            {(candidate.defaultCv || (candidate.cvs && candidate.cvs.length > 0)) && (
              <Button
                fullWidth
                variant="contained"
                startIcon={<VisibilityIcon />}
                onClick={() => {
                  const cvToView = candidate.defaultCv || (candidate.cvs && candidate.cvs[0]) || null;
                  setViewingCv(cvToView);
                  setCvModalOpen(true);
                }}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
              >
                Xem Mẫu CV Ứng Viên ({candidate.defaultCv ? candidate.defaultCv.title : candidate.cvs ? candidate.cvs[0].title : 'CV'})
              </Button>
            )}

            {candidate.resumeUrl && (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GetAppIcon />}
                onClick={() => handleDownloadResume(candidate.resumeUrl)}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
              >
                Tải xuống File CV gốc
              </Button>
            )}

            {!candidate.defaultCv && (!candidate.cvs || candidate.cvs.length === 0) && !candidate.resumeUrl && (
              <Typography variant="caption" color="text.secondary">
                Ứng viên chưa tạo bản CV chi tiết.
              </Typography>
            )}
          </Stack>
        </Paper>

        {/* Right Side: Professional details & Applications history */}
        <Stack spacing={3}>
          {/* Details Paper */}
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.dark', mb: 2 }}>
              Thông tin Chuyên môn
            </Typography>

            <Stack spacing={2.5}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                  Kỹ năng chuyên môn
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.7, bgcolor: '#f8fafc', p: 1.5, borderRadius: 2 }}>
                  {candidate.skills || 'Ứng viên chưa cung cấp thông tin kỹ năng.'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                  Kinh nghiệm làm việc
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.7, bgcolor: '#f8fafc', p: 1.5, borderRadius: 2, whiteSpace: 'pre-line' }}>
                  {candidate.experience || 'Ứng viên chưa cung cấp thông tin kinh nghiệm.'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                  Trình độ học vấn
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.7, bgcolor: '#f8fafc', p: 1.5, borderRadius: 2 }}>
                  {candidate.education || 'Ứng viên chưa cung cấp thông tin học vấn.'}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Application History & Decision Making */}
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.dark', mb: 1 }}>
              Lịch sử Ứng tuyển vào Công ty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Quản lý và cập nhật tiến trình tuyển dụng cho từng vị trí ứng viên đã nộp.
            </Typography>

            {(!candidate.applicationHistory || candidate.applicationHistory.length === 0) ? (
              <Alert severity="info">Ứng viên này chưa nộp đơn vào bất kỳ công việc nào của công ty bạn.</Alert>
            ) : (
              <Stack spacing={2}>
                {candidate.applicationHistory.map((app) => {
                  const chipInfo = getStatusChipColor(app.status);
                  const appliedDate = app.appliedAt
                    ? new Date(app.appliedAt).toLocaleString('vi-VN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : 'N/A';

                  return (
                    <Card key={app.applicationId} variant="outlined" sx={{ borderRadius: 2.5, borderColor: '#e2e8f0' }}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1.5, mb: 1.5 }}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                              {app.jobTitle}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Ngày nộp: {appliedDate}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                            {app.cv && (
                              <Button
                                variant="outlined"
                                size="small"
                                color="primary"
                                startIcon={<VisibilityIcon />}
                                onClick={() => {
                                  setViewingCv(app.cv || null);
                                  setCvModalOpen(true);
                                }}
                                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                              >
                                Xem CV: {app.cv.title}
                              </Button>
                            )}

                            <Chip
                              label={chipInfo.label}
                              color={chipInfo.color}
                              size="medium"
                              sx={{ fontWeight: 700, px: 1 }}
                            />
                            <Button
                              variant="outlined"
                              size="small"
                              color="secondary"
                              startIcon={aiLoading && aiAppId === app.applicationId ? <CircularProgress size={16} /> : <SmartToyIcon />}
                              onClick={() => analyzeCandidateMatch(app.applicationId, app.jobTitle)}
                              disabled={aiLoading && aiAppId === app.applicationId}
                              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                            >
                              Phân tích AI
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<EventIcon />}
                              onClick={() => openInterviewDialog(app.applicationId)}
                              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                            >
                              Phỏng vấn
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<EditNoteIcon />}
                              onClick={() => handleOpenStatusDialog(app.applicationId, app.status)}
                              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                            >
                              Cập nhật trạng thái
                            </Button>
                          </Box>
                          {aiResult && aiAppId === app.applicationId && (
                            <Box sx={{ mt: 2, p: 2.5, borderRadius: 2.5, bgcolor: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.18)' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <SmartToyIcon color="secondary" fontSize="small" />
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                    AI đánh giá: {aiResult.score}/100 · Trình độ: {aiResult.level}
                                  </Typography>
                                </Box>
                                {aiResult.mode === 'local-fallback' && (
                                  <Chip label="Fallback cục bộ" size="small" variant="outlined" />
                                )}
                              </Box>
                              {aiResult.summary && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.7 }}>
                                  {aiResult.summary}
                                </Typography>
                              )}

                              {aiResult.strengths && aiResult.strengths.length > 0 && (
                                <Box sx={{ mb: 1.5 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#166534' }}>✓ Điểm mạnh</Typography>
                                  <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
                                    {aiResult.strengths.map((s, i) => (
                                      <li key={`s-${i}`}><Typography variant="caption" color="text.secondary">{s}</Typography></li>
                                    ))}
                                  </ul>
                                </Box>
                              )}

                              {aiResult.improvements && aiResult.improvements.length > 0 && (
                                <Box sx={{ mb: 1.5 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#92400e' }}>▲ Cần cải thiện</Typography>
                                  <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
                                    {aiResult.improvements.map((s, i) => (
                                      <li key={`imp-${i}`}><Typography variant="caption" color="text.secondary">{s}</Typography></li>
                                    ))}
                                  </ul>
                                </Box>
                              )}

                              {aiResult.skills && aiResult.skills.length > 0 && (
                                <Box sx={{ display: 'flex', gap: 0.7, flexWrap: 'wrap', mt: 1.5 }}>
                                  {aiResult.skills.map((skill) => (
                                    <Chip key={`sk-${skill}`} label={skill} size="small" variant="outlined" />
                                  ))}
                                </Box>
                              )}

                              {aiResult.matchedSkills && aiResult.matchedSkills.length > 0 && (
                                <Box sx={{ display: 'flex', gap: 0.7, flexWrap: 'wrap', mt: 1 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 800, width: '100%' }}>Khớp với vị trí:</Typography>
                                  {aiResult.matchedSkills.map((skill) => (
                                    <Chip key={`match-${skill}`} label={`✓ ${skill}`} size="small" color="success" variant="outlined" />
                                  ))}
                                  {aiResult.missingSkills && aiResult.missingSkills.slice(0, 6).map((skill) => (
                                    <Chip key={`missing-${skill}`} label={`○ ${skill}`} size="small" variant="outlined" />
                                  ))}
                                </Box>
                              )}
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Stack>
      </Box>

      {/* Dialog Interview Scheduling & Result */}
      <Dialog open={interviewDialogOpen} onClose={() => setInterviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: 'primary.dark' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><EventIcon color="primary" /> Lịch phỏng vấn & kết quả</Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {interviews.length > 0 && <Alert severity="info">Đã có {interviews.length} lịch phỏng vấn cho hồ sơ này.</Alert>}
            <TextField label="Thời gian phỏng vấn" type="datetime-local" fullWidth value={interviewForm.scheduledAt} onChange={(e) => setInterviewForm({ ...interviewForm, scheduledAt: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField label="Thời lượng (phút)" type="number" value={interviewForm.durationMinutes} onChange={(e) => setInterviewForm({ ...interviewForm, durationMinutes: e.target.value })} />
              <TextField label="Người phỏng vấn" value={interviewForm.interviewer} onChange={(e) => setInterviewForm({ ...interviewForm, interviewer: e.target.value })} />
            </Box>
            <TextField label="Link phòng họp" placeholder="https://meet.google.com/..." fullWidth value={interviewForm.meetingUrl} onChange={(e) => setInterviewForm({ ...interviewForm, meetingUrl: e.target.value })} />
            <FormControl fullWidth>
              <InputLabel>Kết quả</InputLabel>
              <Select value={interviewForm.result} label="Kết quả" onChange={(e) => setInterviewForm({ ...interviewForm, result: e.target.value })}>
                <MenuItem value="SCHEDULED">Đã lên lịch</MenuItem><MenuItem value="PASSED">Đạt</MenuItem><MenuItem value="FAILED">Không đạt</MenuItem><MenuItem value="NEEDS_REVIEW">Cần đánh giá thêm</MenuItem><MenuItem value="CANCELLED">Đã hủy</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Nhận xét / kết quả chi tiết" multiline rows={4} fullWidth value={interviewForm.notes} onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })} />
            <Alert severity="info" sx={{ mb: 0 }}>
              Khi lưu, hệ thống sẽ tự động gửi email thông báo lịch phỏng vấn đến địa chỉ <b>{candidate.email}</b>.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setInterviewDialogOpen(false)} sx={{ textTransform: 'none' }}>Đóng</Button>
          <Button onClick={saveInterview} variant="contained" disabled={interviewSaving || !interviewForm.scheduledAt} startIcon={interviewSaving ? <CircularProgress size={18} color="inherit" /> : <EventIcon />} sx={{ textTransform: 'none', fontWeight: 700 }}>Lưu thông tin</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Update Status */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.dark' }}>
          Cập nhật Trạng thái Ứng tuyển
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-select-label">Trạng thái mới</InputLabel>
              <Select
                labelId="status-select-label"
                value={newStatus}
                label="Trạng thái mới"
                onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
              >
                <MenuItem value="APPLIED">Mới nộp (APPLIED)</MenuItem>
                <MenuItem value="REVIEWING">Đang xem xét (REVIEWING)</MenuItem>
                <MenuItem value="INTERVIEWED">Đã phỏng vấn (INTERVIEWED)</MenuItem>
                <MenuItem value="OFFERED">Mời nhận việc (OFFERED)</MenuItem>
                <MenuItem value="HIRED">Đã tuyển dụng (HIRED)</MenuItem>
                <MenuItem value="REJECTED">Từ chối ứng viên (REJECTED)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Ghi chú / Nhận xét phản hồi cho ứng viên (Tùy chọn)"
              multiline
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Nhập nhận xét phỏng vấn, lịch hẹn, hoặc lý do từ chối..."
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setStatusDialogOpen(false)} disabled={updatingStatus} sx={{ textTransform: 'none' }}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSaveStatus}
            variant="contained"
            disabled={updatingStatus}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {updatingStatus ? <CircularProgress size={22} color="inherit" /> : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog View Candidate CV */}
      <Dialog
        open={cvModalOpen}
        onClose={() => setCvModalOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3.5, bgcolor: '#f1f5f9' } } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Hồ sơ CV: {viewingCv?.title || candidate.fullName}
          </Typography>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            In / Xuất PDF
          </Button>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1, sm: 3 } }}>
          {viewingCv ? (
            <CvRenderer cv={viewingCv} />
          ) : (
            <CvRenderer
              cv={{
                title: `CV của ${candidate.fullName}`,
                fullName: candidate.fullName,
                email: candidate.email,
                phone: candidate.phone,
                address: candidate.address,
                skills: candidate.skills,
                experience: candidate.experience,
                education: candidate.education,
                resumeUrl: 'modern',
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: 'white' }}>
          <Button onClick={() => setCvModalOpen(false)} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={4000}
        onClose={() => setSnackbarMessage(null)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default CandidateDetailPage;