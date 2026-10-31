import React from 'react';
import { Box, Typography } from '@mui/material';
import type { AdminStatusCount, AdminTimeSeriesPoint } from '../../types';

/**
 * Bộ biểu đồ SVG dùng cho trang quản trị (không cần thư viện ngoài).
 */

const PALETTE = ['#1a237e', '#3949ab', '#5c6bc0', '#7986cb', '#9fa8da', '#c5cae9'];

export const STATUS_LABELS: Record<string, string> = {
  APPLIED: 'Mới nộp',
  REVIEWING: 'Đang xem xét',
  INTERVIEWED: 'Đã phỏng vấn',
  OFFERED: 'Đã mời việc',
  HIRED: 'Đã tuyển',
  REJECTED: 'Từ chối',
};

export const STATUS_COLORS: Record<string, string> = {
  APPLIED: '#0284c7',
  REVIEWING: '#ca8a04',
  INTERVIEWED: '#7c3aed',
  OFFERED: '#0891b2',
  HIRED: '#16a34a',
  REJECTED: '#dc2626',
};

const num = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

// ─────────────────────────────
// Biểu đồ cột (bar chart)
// ─────────────────────────────
interface BarChartProps {
  data: AdminTimeSeriesPoint[];
  color?: string;
  height?: number;
  valueSuffix?: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, color = '#1a237e', height = 220, valueSuffix = '' }) => {
  if (!data || data.length === 0) {
    return <EmptyChart height={height} />;
  }
  const max = Math.max(...data.map((d) => d.value), 1);
  const barGap = 4;
  const labelStep = data.length > 20 ? Math.ceil(data.length / 8) : data.length > 12 ? 3 : 1;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: `${barGap}px`, height, px: 0.5 }}>
        {data.map((d, i) => {
          const ratio = d.value / max;
          return (
            <Box
              key={`${d.label}-${i}`}
              sx={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                height: '100%',
                position: 'relative',
                '&:hover .bar-tip': { opacity: 1, transform: 'translateY(0)' },
              }}
            >
              <Box
                className="bar-tip"
                sx={{
                  position: 'absolute',
                  bottom: `calc(${Math.max(ratio * 100, 2)}% + 6px)`,
                  bgcolor: '#0f172a',
                  color: '#fff',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  px: 0.8,
                  py: 0.3,
                  borderRadius: 1,
                  whiteSpace: 'nowrap',
                  opacity: 0,
                  transform: 'translateY(4px)',
                  transition: 'all .18s ease',
                  pointerEvents: 'none',
                  zIndex: 3,
                }}
              >
                {d.label}: {num(d.value)}
                {valueSuffix}
              </Box>
              <Box
                sx={{
                  width: '100%',
                  height: `${Math.max(ratio * 100, d.value > 0 ? 3 : 1)}%`,
                  minHeight: d.value > 0 ? 4 : 2,
                  borderRadius: '4px 4px 2px 2px',
                  background:
                    d.value > 0
                      ? `linear-gradient(180deg, ${color} 0%, ${color}b3 100%)`
                      : '#e2e8f0',
                  transition: 'all .2s ease',
                  '&:hover': { filter: 'brightness(1.15)' },
                }}
              />
            </Box>
          );
        })}
      </Box>
      <Box sx={{ display: 'flex', gap: `${barGap}px`, mt: 0.8, px: 0.5 }}>
        {data.map((d, i) => (
          <Box key={`label-${d.label}-${i}`} sx={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
            {i % labelStep === 0 && (
              <Typography
                variant="caption"
                sx={{ fontSize: '0.62rem', color: '#94a3b8', whiteSpace: 'nowrap', display: 'block' }}
              >
                {d.label}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// ─────────────────────────────
// Biểu đồ đường (line/area chart)
// ─────────────────────────────
interface LineChartProps {
  series: { name: string; color: string; data: AdminTimeSeriesPoint[] }[];
  height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({ series, height = 240 }) => {
  const labels = series[0]?.data.map((d) => d.label) ?? [];
  const allValues = series.flatMap((s) => s.data.map((d) => d.value));
  if (labels.length === 0) return <EmptyChart height={height} />;

  const max = Math.max(...allValues, 1);
  const w = 600;
  const h = height;
  const padX = 26;
  const padY = 18;
  const stepX = labels.length > 1 ? (w - padX * 2) / (labels.length - 1) : 0;

  const pointsFor = (data: AdminTimeSeriesPoint[]) =>
    data.map((d, i) => {
      const x = padX + stepX * i;
      const y = h - padY - (d.value / max) * (h - padY * 2);
      return { x, y, value: d.value, label: d.label };
    });

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2.5, mb: 1, flexWrap: 'wrap' }}>
        {series.map((s) => (
          <Box key={s.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: s.color }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>
              {s.name}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ width: '100%' }}>
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ display: 'block', overflow: 'visible' }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((r) => (
            <g key={r}>
              <line
                x1={padX}
                x2={w - padX}
                y1={h - padY - r * (h - padY * 2)}
                y2={h - padY - r * (h - padY * 2)}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <text
                x={padX - 6}
                y={h - padY - r * (h - padY * 2) + 3}
                textAnchor="end"
                fontSize={9}
                fill="#94a3b8"
              >
                {Math.round(max * r)}
              </text>
            </g>
          ))}

          {series.map((s) => {
            const pts = pointsFor(s.data);
            const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
            const area = `${line} L${pts[pts.length - 1].x},${h - padY} L${pts[0].x},${h - padY} Z`;
            return (
              <g key={s.name}>
                <defs>
                  <linearGradient id={`grad-${s.name.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <path d={area} fill={`url(#grad-${s.name.replace(/\s/g, '')})`} />
                <path d={line} fill="none" stroke={s.color} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" />
                {pts.map((p, i) => (
                  <g key={`${s.name}-${i}`}>
                    <circle cx={p.x} cy={p.y} r={3.2} fill="#fff" stroke={s.color} strokeWidth={2}>
                      <title>{`${p.label}: ${num(p.value)}`}</title>
                    </circle>
                  </g>
                ))}
              </g>
            );
          })}

          {labels.map((l, i) => (
            <text
              key={`${l}-${i}`}
              x={padX + stepX * i}
              y={h - 2}
              textAnchor="middle"
              fontSize={9}
              fill="#94a3b8"
            >
              {l}
            </text>
          ))}
        </svg>
      </Box>
    </Box>
  );
};

// ─────────────────────────────
// Biểu đồ tròn (donut chart)
// ─────────────────────────────
interface DonutChartProps {
  data: AdminStatusCount[];
  size?: number;
  thickness?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, size = 190, thickness = 26 }) => {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const radius = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
      <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
          {total === 0 ? null : (
            data.map((d) => {
              if (d.count === 0) return null;
              const len = (d.count / total) * circumference;
              const dash = `${len} ${circumference - len}`;
              const el = (
                <circle
                  key={d.status}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="none"
                  stroke={STATUS_COLORS[d.status] ?? '#94a3b8'}
                  strokeWidth={thickness}
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                >
                  <title>{`${STATUS_LABELS[d.status] ?? d.status}: ${num(d.count)}`}</title>
                </circle>
              );
              offset += len;
              return el;
            })
          )}
        </svg>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', color: '#0f172a', lineHeight: 1 }}>
            {num(total)}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
            Tổng hồ sơ
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 160 }}>
        {data.map((d, i) => (
          <Box key={d.status} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '3px',
                bgcolor: STATUS_COLORS[d.status] ?? PALETTE[i % PALETTE.length],
                flexShrink: 0,
              }}
            />
            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, flexGrow: 1 }}>
              {STATUS_LABELS[d.status] ?? d.status}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f172a' }}>
              {num(d.count)}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', minWidth: 34, textAlign: 'right' }}>
              {total ? `${Math.round((d.count / total) * 100)}%` : '0%'}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// ─────────────────────────────
// Thanh tiến trình ngang (progress list) — dùng cho "Top công ty"
// ─────────────────────────────
interface ProgressListProps {
  items: { label: string; sublabel?: string; value: number }[];
  color?: string;
  valueSuffix?: string;
  emptyText?: string;
}

export const ProgressList: React.FC<ProgressListProps> = ({
  items,
  color = '#1a237e',
  valueSuffix = '',
  emptyText = 'Chưa có dữ liệu',
}) => {
  if (!items || items.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
          {emptyText}
        </Typography>
      </Box>
    );
  }
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {items.map((item, idx) => (
        <Box key={`${item.label}-${idx}`}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.6, gap: 1 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body2"
                noWrap
                sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem' }}
              >
                {idx + 1}. {item.label}
              </Typography>
              {item.sublabel && (
                <Typography variant="caption" noWrap sx={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>
                  {item.sublabel}
                </Typography>
              )}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 800, color, flexShrink: 0 }}>
              {num(item.value)}
              {valueSuffix}
            </Typography>
          </Box>
          <Box sx={{ height: 8, borderRadius: 4, bgcolor: '#f1f5f9', overflow: 'hidden' }}>
            <Box
              sx={{
                height: '100%',
                width: `${Math.max((item.value / max) * 100, 2)}%`,
                borderRadius: 4,
                background: `linear-gradient(90deg, ${color} 0%, ${color}aa 100%)`,
                transition: 'width .4s ease',
              }}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
};

const EmptyChart: React.FC<{ height: number }> = ({ height }) => (
  <Box
    sx={{
      height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#f8fafc',
      borderRadius: 3,
      border: '1px dashed #cbd5e1',
    }}
  >
    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
      Chưa có dữ liệu để hiển thị
    </Typography>
  </Box>
);

export const formatNumber = num;
