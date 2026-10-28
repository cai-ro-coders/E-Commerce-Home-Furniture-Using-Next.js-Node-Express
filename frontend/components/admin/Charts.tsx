'use client';

/**
 * Chart.js wrappers.
 *
 * Chart.js is registered once, here, so no page has to remember the element
 * registrations. Every chart is theme-aware: axis and legend colours come from
 * the resolved theme rather than a hard-coded palette, so dark mode is not
 * an afterthought.
 */
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartOptions,
} from 'chart.js';
import type { ReactNode } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useTheme } from '@/components/providers/ThemeProvider';
import { formatMoney, num } from '@/lib/format';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
);

export const CHART_COLORS = {
  clay: '#c2542b',
  claySoft: 'rgba(194, 84, 43, 0.16)',
  amber: '#d97706',
  emerald: '#059669',
  sky: '#0284c7',
  violet: '#7c3aed',
  rose: '#e11d48',
  sand: '#b3a894',
} as const;

/** Chart.js needs concrete colours, so pick them per resolved theme. */
function palette(dark: boolean) {
  return {
    text: dark ? '#d3ccbd' : '#665a4b',
    muted: dark ? '#968873' : '#968873',
    grid: dark ? 'rgba(211, 204, 189, 0.12)' : 'rgba(102, 90, 75, 0.14)',
    tooltipBg: dark ? '#211d19' : '#2a241e',
  };
}

function useChartTheme() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === 'dark';
  return { dark, colors: palette(dark) };
}

interface BaseProps {
  labels: string[];
  height?: number;
  className?: string;
}

/* ------------------------------------------------------------- line chart */

export interface LineChartSeries {
  label: string;
  values: Array<string | number>;
  color?: string;
  fill?: boolean;
}

export function SalesLineChart({
  labels,
  series,
  currency = 'PHP',
  height = 280,
  className,
}: BaseProps & { series: LineChartSeries[]; currency?: string }): ReactNode {
  const { colors } = useChartTheme();

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: series.length > 1, labels: { color: colors.text, boxWidth: 12, usePointStyle: true } },
      tooltip: {
        backgroundColor: colors.tooltipBg,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${formatMoney(num(context.parsed.y), currency, { decimals: 0 })}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: colors.muted, maxRotation: 0, autoSkipPadding: 16, font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: colors.grid },
        border: { display: false },
        ticks: {
          color: colors.muted,
          font: { size: 11 },
          callback: (value) => formatMoney(num(value as number), currency, { compact: true, decimals: 0 }),
        },
      },
    },
  };

  return (
    <div className={className} style={{ height }}>
      <Line
        options={options}
        data={{
          labels,
          datasets: series.map((item, index) => {
            const color = item.color ?? (index === 0 ? CHART_COLORS.clay : CHART_COLORS.sky);
            return {
              label: item.label,
              data: item.values.map((value) => num(value)),
              borderColor: color,
              backgroundColor: item.fill === false ? color : `${color}26`,
              pointBackgroundColor: color,
              pointBorderColor: color,
              pointRadius: 3,
              pointHoverRadius: 5,
              borderWidth: 2,
              tension: 0.35,
              fill: item.fill ?? true,
            };
          }),
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------- bar chart */

export function SalesBarChart({
  labels,
  values,
  label = 'Revenue',
  currency = 'PHP',
  color = CHART_COLORS.clay,
  height = 280,
  className,
}: BaseProps & {
  values: Array<string | number>;
  label?: string;
  currency?: string;
  color?: string;
}): ReactNode {
  const { colors } = useChartTheme();

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: colors.tooltipBg,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) =>
            `${label}: ${formatMoney(num(context.parsed.y), currency, { decimals: 0 })}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: colors.muted, font: { size: 11 }, maxRotation: 45, minRotation: 0 },
      },
      y: {
        beginAtZero: true,
        grid: { color: colors.grid },
        border: { display: false },
        ticks: {
          color: colors.muted,
          font: { size: 11 },
          callback: (value) => formatMoney(num(value as number), currency, { compact: true, decimals: 0 }),
        },
      },
    },
  };

  return (
    <div className={className} style={{ height }}>
      <Bar
        options={options}
        data={{
          labels,
          datasets: [
            {
              label,
              data: values.map((value) => num(value)),
              backgroundColor: color,
              hoverBackgroundColor: color,
              borderRadius: 6,
              maxBarThickness: 42,
            },
          ],
        }}
      />
    </div>
  );
}

/* --------------------------------------------------------- status doughnut */

export function StatusDoughnut({
  labels,
  values,
  colors = [CHART_COLORS.emerald, CHART_COLORS.amber, CHART_COLORS.sky, CHART_COLORS.violet, CHART_COLORS.rose, CHART_COLORS.sand],
  height = 260,
  className,
}: BaseProps & { values: number[]; colors?: string[] }): ReactNode {
  const { colors: themeColors } = useChartTheme();

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: themeColors.text,
          boxWidth: 10,
          usePointStyle: true,
          padding: 14,
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: themeColors.tooltipBg,
        padding: 12,
        cornerRadius: 8,
      },
    },
  };

  return (
    <div className={className} style={{ height }}>
      <Doughnut
        options={options}
        data={{
          labels,
          datasets: [
            {
              data: values.map((value) => num(value)),
              backgroundColor: colors,
              borderWidth: 0,
              hoverOffset: 6,
            },
          ],
        }}
      />
    </div>
  );
}

/* --------------------------------------------------- horizontal category bar */

export function CategoryBarChart({
  labels,
  values,
  currency = 'PHP',
  height = 300,
  className,
}: BaseProps & { values: Array<string | number>; currency?: string }): ReactNode {
  const { colors } = useChartTheme();

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: colors.tooltipBg,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) =>
            formatMoney(num(context.parsed.x), currency, { compact: true, decimals: 0 }),
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: colors.grid },
        border: { display: false },
        ticks: {
          color: colors.muted,
          font: { size: 11 },
          callback: (value) => formatMoney(num(value as number), currency, { compact: true, decimals: 0 }),
        },
      },
      y: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: colors.text, font: { size: 11 } },
      },
    },
  };

  return (
    <div className={className} style={{ height }}>
      <Bar
        options={options}
        data={{
          labels,
          datasets: [
            {
              data: values.map((value) => num(value)),
              backgroundColor: [
                CHART_COLORS.clay,
                CHART_COLORS.amber,
                CHART_COLORS.emerald,
                CHART_COLORS.sky,
                CHART_COLORS.violet,
                CHART_COLORS.rose,
                CHART_COLORS.sand,
              ],
              borderRadius: 6,
              maxBarThickness: 22,
            },
          ],
        }}
      />
    </div>
  );
}
