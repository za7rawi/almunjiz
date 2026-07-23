'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  Download,
  Calendar,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguageStore } from '@/store/language-store';
import { cn } from '@/lib/utils';

const revenueValues = [4200, 5800, 4900, 7200, 6100, 8500, 7800];
const dayLabels = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
const maxRevenue = Math.max(...revenueValues);

const servicesData = [
  { label: 'تأشيرات', value: 45, color: '#2580eb', gradientFrom: '#2580eb', gradientTo: '#14b8a6' },
  { label: 'عقود', value: 32, color: '#7c3aed', gradientFrom: '#7c3aed', gradientTo: '#a78bfa' },
  { label: 'مركبات', value: 28, color: '#14b8a6', gradientFrom: '#14b8a6', gradientTo: '#5eead4' },
  { label: 'تأمين', value: 18, color: '#f59e0b', gradientFrom: '#f59e0b', gradientTo: '#fbbf24' },
  { label: 'ترجمة', value: 12, color: '#ef4444', gradientFrom: '#ef4444', gradientTo: '#f87171' },
];
const maxService = Math.max(...servicesData.map((s) => s.value));

const ratingsData = [
  { stars: 5, percentage: 55, color: '#2580eb' },
  { stars: 4, percentage: 25, color: '#14b8a6' },
  { stars: 3, percentage: 12, color: '#7c3aed' },
  { stars: 2, percentage: 5, color: '#f59e0b' },
  { stars: 1, percentage: 3, color: '#ef4444' },
];

const monthlyValues = [3200, 4100, 3800, 5200, 6100, 7500];
const monthLabels = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
const maxMonthly = Math.max(...monthlyValues);

const statsCards = [
  {
    label: 'إجمالي الإيرادات',
    value: '125,000 ر.س',
    icon: DollarSign,
    color: '#16a34a',
    bgColor: '#16a34a15',
    trend: 'up',
    trendValue: '+12.5%',
  },
  {
    label: 'إجمالي الطلبات',
    value: '1,234',
    icon: Package,
    color: '#2580eb',
    bgColor: '#2580eb15',
    trend: 'up',
    trendValue: '+8.2%',
  },
  {
    label: 'عملاء جدد',
    value: '856',
    icon: Users,
    color: '#7c3aed',
    bgColor: '#7c3aed15',
    trend: 'up',
    trendValue: '+15.3%',
  },
  {
    label: 'معدل التحويل',
    value: '3.2%',
    icon: TrendingUp,
    color: '#14b8a6',
    bgColor: '#14b8a615',
    trend: 'up',
    trendValue: '+0.8%',
  },
];

function BarChartSection() {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">إيرادات المبيعات</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">إيرادات آخر 7 أيام</p>
          </div>
          <Badge variant="success" size="sm">+18.2%</Badge>
        </div>
        <div className="relative h-64">
          <svg viewBox="0 0 350 220" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2580eb" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
            </defs>
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
              <g key={i}>
                <line
                  x1="40"
                  y1={200 - pct * 180}
                  x2="340"
                  y2={200 - pct * 180}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-white/5"
                  strokeWidth="0.5"
                />
                <text
                  x="35"
                  y={204 - pct * 180}
                  textAnchor="end"
                  fill="currentColor"
                  className="text-slate-400 dark:text-slate-500"
                  fontSize="8"
                >
                  {Math.round(pct * maxRevenue).toLocaleString()}
                </text>
              </g>
            ))}
            {revenueValues.map((val, i) => {
              const barHeight = (val / maxRevenue) * 170;
              const barWidth = 32;
              const x = 55 + i * 41;
              const y = 200 - barHeight;
              return (
                <g key={i}>
                  <motion.rect
                    x={x}
                    y={200}
                    width={barWidth}
                    height={0}
                    rx="4"
                    fill="url(#barGradient)"
                    initial={{ height: 0, y: 200 }}
                    animate={{ height: barHeight, y }}
                    transition={{ delay: i * 0.1, type: 'spring', stiffness: 120, damping: 14 }}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <title>{`${dayLabels[i]}: ${val.toLocaleString()} ر.س`}</title>
                  </motion.rect>
                  <motion.text
                    x={x + barWidth / 2}
                    y={y - 6}
                    textAnchor="middle"
                    fill="#2580eb"
                    fontSize="8"
                    fontWeight="600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    {val.toLocaleString()}
                  </motion.text>
                  <text
                    x={x + barWidth / 2}
                    y="216"
                    textAnchor="middle"
                    fill="currentColor"
                    className="text-slate-500 dark:text-slate-400"
                    fontSize="8"
                  >
                    {dayLabels[i]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}

function HorizontalBarChartSection() {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">الطلبات حسب الخدمة</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">توزيع الطلبات على الخدمات</p>
          </div>
          <Badge variant="primary" size="sm">5 خدمات</Badge>
        </div>
        <div className="space-y-5">
          {servicesData.map((service, i) => (
            <div key={service.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{service.label}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{service.value}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(to left, ${service.gradientFrom}, ${service.gradientTo})`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(service.value / maxService) * 100}%` }}
                  transition={{ delay: 0.2 + i * 0.15, duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DonutChartSection() {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  const segments = ratingsData.reduce<{ r: typeof ratingsData[number]; offset: number; idx: number }[]>((acc, r, idx) => {
    const dashLength = (r.percentage / 100) * circumference;
    const prevOffset = acc.length > 0 ? acc[acc.length - 1].offset + (acc[acc.length - 1].r.percentage / 100) * circumference : 0;
    acc.push({ r, offset: prevOffset, idx });
    return acc;
  }, []);

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">التقييمات</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">توزيع تقييمات العملاء</p>
          </div>
          <Badge variant="warning" size="sm">متوسط 4.3</Badge>
        </div>
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <defs>
                {ratingsData.map((r, idx) => (
                  <linearGradient key={idx} id={`donutGrad${r.stars}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={r.color} />
                    <stop offset="100%" stopColor={r.color} stopOpacity="0.7" />
                  </linearGradient>
                ))}
              </defs>
              {segments.map(({ r, offset, idx }) => {
                const dashLength = (r.percentage / 100) * circumference;
                const gapLength = circumference - dashLength;
                return (
                  <motion.circle
                    key={idx}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={`url(#donutGrad${r.stars})`}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${dashLength} ${gapLength}`}
                    strokeDashoffset={-offset}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + idx * 0.15, duration: 0.6 }}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="text-3xl font-bold text-slate-900 dark:text-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
              >
                4.3
              </motion.span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">من 5</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {ratingsData.map((r) => (
              <div key={r.stars} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  {r.stars} نجوم ({r.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LineChartSection() {
  const svgWidth = 350;
  const svgHeight = 220;
  const paddingX = 45;
  const paddingY = 25;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const points = monthlyValues.map((val, i) => ({
    x: paddingX + (i / (monthlyValues.length - 1)) * chartWidth,
    y: paddingY + chartHeight - (val / maxMonthly) * chartHeight,
  }));

  const areaPath = [
    `M ${points[0].x} ${paddingY + chartHeight}`,
    `L ${points[0].x} ${points[0].y}`,
    ...points.slice(1).map((p) => `L ${p.x} ${p.y}`),
    `L ${points[points.length - 1].x} ${paddingY + chartHeight}`,
    'Z',
  ].join(' ');

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">النمو الشهري</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">نمو الإيرادات خلال آخر 6 أشهر</p>
          </div>
          <Badge variant="success" size="sm">+42.3%</Badge>
        </div>
        <div className="relative h-64">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="lineAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="lineStrokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2580eb" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = paddingY + chartHeight - pct * chartHeight;
              return (
                <g key={i}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-100 dark:text-white/5"
                    strokeWidth="0.5"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 3}
                    textAnchor="end"
                    fill="currentColor"
                    className="text-slate-400 dark:text-slate-500"
                    fontSize="8"
                  >
                    {Math.round(pct * maxMonthly).toLocaleString()}
                  </text>
                </g>
              );
            })}
            <motion.path
              d={areaPath}
              fill="url(#lineAreaGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
            <motion.path
              d={points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
              fill="none"
              stroke="url(#lineStrokeGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.3, duration: 1.2, ease: 'easeInOut' }}
            />
            {points.map((p, i) => (
              <g key={i}>
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="#7c3aed"
                  stroke="white"
                  strokeWidth="2"
                  className="dark:stroke-slate-900"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8 + i * 0.1, type: 'spring', stiffness: 300 }}
                />
                <text
                  x={p.x}
                  y={svgHeight - 5}
                  textAnchor="middle"
                  fill="currentColor"
                  className="text-slate-500 dark:text-slate-400"
                  fontSize="8"
                >
                  {monthLabels[i]}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminReportsPage() {
  const { language } = useLanguageStore();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      alert('جاري التصدير...');
      setExporting(false);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="التقارير"
        gradient
        breadcrumbs={[
          { label: 'لوحة التحكم', href: '/admin' },
          { label: 'التقارير' },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2">
            <Calendar size={16} className="text-slate-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:outline-none"
              dir="ltr"
            />
          </div>
          <span className="text-slate-400 text-sm">إلى</span>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2">
            <Calendar size={16} className="text-slate-400" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:outline-none"
              dir="ltr"
            />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
          >
            <Card glass>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {stat.trend === 'up' ? (
                        <TrendingUp size={14} className="text-emerald-500" />
                      ) : (
                        <TrendingDown size={14} className="text-red-500" />
                      )}
                      <span
                        className={cn(
                          'text-xs font-medium',
                          stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500',
                        )}
                      >
                        {stat.trendValue}
                      </span>
                      <span className="text-xs text-slate-400">هذا الشهر</span>
                    </div>
                  </div>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: stat.bgColor }}
                  >
                    <stat.icon size={20} style={{ color: stat.color }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <BarChartSection />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <HorizontalBarChartSection />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <DonutChartSection />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <LineChartSection />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex justify-end"
      >
        <Button onClick={handleExport} disabled={exporting} className="gap-2">
          <Download size={16} />
          {exporting ? 'جاري التصدير...' : 'تصدير التقرير'}
        </Button>
      </motion.div>
    </div>
  );
}
