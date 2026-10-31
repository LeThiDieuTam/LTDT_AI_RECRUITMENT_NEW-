import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Snackbar,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  LockOpen as LockOpenIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import adminApi from '../../services/adminApi';
import type { AdminUserAccount } from '../../types';

type RoleTab = 'HR' | 'CANDIDATE' | 'ADMIN';

const AdminUsersPage: React.FC = () => {
  const [role, setRole] = useState<RoleTab>('HR');
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [users, setUsers] = useState<AdminUserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<AdminUserAccount | null>(null);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserAccount | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [snack, setSnack] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getUsers({ role, keyword: appliedKeyword || undefined });
      setUsers(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Không thể tải danh sách tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, appliedKeyword]);

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.enabled).length,
      locked: users.filter((u) => !u.enabled).length,
    }),
    [users]
  );

  const openEdit = (u: AdminUserAccount) => {
    setEditing(u);
    setForm({ fullName: u.fullName, email: u.email, phone: u.phone || '', address: u.address || '' });
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      setSaving(true);
      await adminApi.updateUser(editing.id, { ...form });
      setSnack({ msg: 'Đã cập nhật tài khoản.', severity: 'success' });
      setEditing(null);
      fetchUsers();
    } catch (err: any) {
      setSnack({ msg: err?.response?.data?.message || 'Cập nhật thất bại.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (u: AdminUserAccount) => {
    try {
      setBusyId(u.id);
      const res = await adminApi.updateUser(u.id, { enabled: !u.enabled });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, enabled: res.data.enabled } : x)));
      setSnack({ msg: res.data.enabled ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.', severity: 'success' });
    } catch (err: any) {
      setSnack({ msg: err?.response?.data?.message || 'Cập nhật trạng thái thất bại.', severity: 'error' });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await adminApi.deleteUser(deleteTarget.id);
      setSnack({ msg: 'Đã xóa tài khoản.', severity: 'success' });
      setDeleteTarget(null);
      fetchUsers();
    } catch (err: any) {
      setSnack({ msg: err?.response?.data?.message || 'Xóa tài khoản thất bại.', severity: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ width: '100%', pb: 6 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.4rem', md: '1.8rem' }, color: '#0d1442', letterSpacing: '-0.02em' }}>
            Quản lý tài khoản
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Xem, chỉnh sửa, khóa hoặc xóa tài khoản nhà tuyển dụng / ứng viên trong hệ thống.
          </Typography>
        </Box>
        <IconButton onClick={fetchUsers} sx={{ bgcolor: '#e8eaf6', color: '#1a237e' }}>
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(3,1fr)' }, gap: 2, mb: 3 }}>
        {[
          { label: 'Tổng tài khoản', value: stats.total, color: '#1a237e' },
          { label: 'Đang hoạt động', value: stats.active, color: '#16a34a' },
          { label: 'Đã khóa', value: stats.locked, color: '#dc2626' },
        ].map((s) => (
          <Card key={s.label} sx={{ borderRadius: 3, border: '1px solid rgba(226,232,240,.9)', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 900, fontSize: '1.4rem', color: s.color, lineHeight: 1 }}>{s.value}</Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>{s.label}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card sx={{ borderRadius: 3, border: '1px solid rgba(226,232,240,.9)', boxShadow: 'none' }}>
        <Tabs
          value={role}
          onChange={(_, v) => {
            setRole(v);
            setAppliedKeyword('');
            setKeyword('');
          }}
          sx={{ px: 2, borderBottom: '1px solid #e2e8f0' }}
        >
          <Tab value="HR" label="Nhà tuyển dụng (HR)" sx={{ textTransform: 'none', fontWeight: 700 }} />
          <Tab value="CANDIDATE" label="Ứng viên" sx={{ textTransform: 'none', fontWeight: 700 }} />
          <Tab value="ADMIN" label="Quản trị viên" sx={{ textTransform: 'none', fontWeight: 700 }} />
        </Tabs>

        <CardContent sx={{ p: 2 }}>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              setAppliedKeyword(keyword.trim());
            }}
            sx={{ display: 'flex', gap: 1.5, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder="Tìm theo tên, email, kỹ năng..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: keyword ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setKeyword('')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : undefined,
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ textTransform: 'none', fontWeight: 800, bgcolor: '#1a237e', px: 3, '&:hover': { bgcolor: '#0d1442' } }}
            >
              Tìm kiếm
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#1a237e' }} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
          ) : (
            <TableContainer sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Tài khoản</TableCell>
                    {role === 'HR' && <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Công ty</TableCell>}
                    <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Liên hệ</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: '#475569' }}>Trạng thái</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: '#475569' }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={role === 'HR' ? 5 : 4} align="center" sx={{ py: 5, color: '#94a3b8' }}>
                        Không có tài khoản nào.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((u) => (
                      <TableRow key={u.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Avatar src={u.avatarUrl || undefined} sx={{ width: 34, height: 34, bgcolor: '#e8eaf6', color: '#1a237e', fontWeight: 800 }}>
                              {u.fullName?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography noWrap sx={{ fontWeight: 700, fontSize: '.86rem', color: '#1e293b' }}>{u.fullName}</Typography>
                              <Typography noWrap variant="caption" sx={{ color: '#94a3b8' }}>{u.email}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        {role === 'HR' && (
                          <TableCell>
                            <Typography variant="body2" sx={{ color: '#0d1442', fontWeight: 600, fontSize: '.82rem' }}>
                              {u.companyName || <span style={{ color: '#cbd5e1' }}>Chưa liên kết</span>}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#475569', fontSize: '.8rem' }}>{u.phone || '-'}</Typography>
                          <Typography noWrap variant="caption" sx={{ color: '#94a3b8' }}>{u.address || ''}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            icon={u.enabled ? <LockOpenIcon sx={{ fontSize: 14 }} /> : <LockIcon sx={{ fontSize: 14 }} />}
                            label={u.enabled ? 'Hoạt động' : 'Đã khóa'}
                            color={u.enabled ? 'success' : 'default'}
                            variant="outlined"
                            sx={{ fontWeight: 700, borderRadius: '999px' }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                            <Tooltip title="Chỉnh sửa">
                              <IconButton size="small" onClick={() => openEdit(u)} sx={{ color: '#3949ab' }}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {u.role !== 'ADMIN' && (
                              <>
                                <Tooltip title={u.enabled ? 'Khóa tài khoản' : 'Mở khóa'}>
                                  <span>
                                    <IconButton
                                      size="small"
                                      disabled={busyId === u.id}
                                      onClick={() => toggleEnabled(u)}
                                      sx={{ color: u.enabled ? '#dc2626' : '#16a34a' }}
                                    >
                                      {u.enabled ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                <Tooltip title="Xóa tài khoản">
                                  <IconButton size="small" onClick={() => setDeleteTarget(u)} sx={{ color: '#dc2626' }}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={!!editing} onClose={() => !saving && setEditing(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#0d1442' }}>Chỉnh sửa tài khoản</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, pt: 0.5 }}>
            <TextField label="Họ tên" size="small" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <TextField label="Email" size="small" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField label="Số điện thoại" size="small" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <TextField label="Địa chỉ" size="small" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Box>
          {editing?.role === 'HR' && (
            <Box sx={{ mt: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Công ty: <strong>{editing.companyName || 'Chưa liên kết'}</strong>
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)} disabled={saving} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{ textTransform: 'none', fontWeight: 800, bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1442' } }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#b91c1c' }}>Xóa tài khoản?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#475569' }}>
            Tài khoản <strong>{deleteTarget?.fullName}</strong> ({deleteTarget?.email}) sẽ bị xóa vĩnh viễn.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Hủy
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <BlockIcon />}
            sx={{ textTransform: 'none', fontWeight: 800 }}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snack}
        autoHideDuration={4000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack?.severity || 'success'} onClose={() => setSnack(null)} sx={{ borderRadius: 2 }}>
          {snack?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminUsersPage;
