import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
} from 'chart.js';
import { Doughnut, Bar, Radar, Line } from 'react-chartjs-2';
import { Idea, SystemStats, Category } from '../../types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler
);

interface StatusChartProps {
  stats: SystemStats;
  language?: 'ar' | 'en';
}

/**
 * Doughnut Chart: Ideas by Status (المقبول، المرفوض، دراسة جدوى، قيد المراجعة)
 */
export const StatusDoughnutChart: React.FC<StatusChartProps> = ({ stats, language = 'ar' }) => {
  const isAr = language === 'ar';

  const labels = isAr
    ? ['معتمدة رسمياً', 'دراسة جدوى', 'قيد التحكيم والمراجعة', 'معتذر عنها']
    : ['Accepted', 'Feasibility Study', 'Under Review', 'Declined'];

  const dataValues = [
    stats.acceptedIdeas,
    stats.feasibilityIdeas,
    stats.underReviewIdeas,
    stats.rejectedIdeas,
  ];

  const chartData = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: [
          '#10B981', // Emerald for Accepted
          '#3B82F6', // Blue for Feasibility
          '#F59E0B', // Amber for Under Review
          '#F43F5E', // Rose for Rejected
        ],
        hoverBackgroundColor: [
          '#059669',
          '#2563EB',
          '#D97706',
          '#E11D48',
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        rtl: isAr,
        labels: {
          font: {
            family: 'Tajawal, sans-serif',
            size: 11,
            weight: 'bold' as const,
          },
          padding: 12,
          boxWidth: 12,
          usePointStyle: true,
        },
      },
      tooltip: {
        rtl: isAr,
        bodyFont: {
          family: 'Tajawal, sans-serif',
          size: 12,
        },
        callbacks: {
          label: function (context: any) {
            const val = context.raw || 0;
            const total = stats.totalIdeas || 1;
            const pct = Math.round((val / total) * 100);
            return ` ${context.label}: ${val} (${pct}%)`;
          },
        },
      },
    },
    cutout: '68%',
  };

  return (
    <div className="relative w-full h-64 sm:h-72 flex items-center justify-center">
      <Doughnut data={chartData} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
        <span className="text-3xl font-black text-slate-800">{stats.totalIdeas}</span>
        <span className="text-[11px] font-bold text-slate-400">
          {isAr ? 'إجمالي الأفكار' : 'Total Ideas'}
        </span>
      </div>
    </div>
  );
};

interface DepartmentChartProps {
  ideas: Idea[];
  language?: 'ar' | 'en';
}

/**
 * Bar Chart: Ideas count by Department & Court (إدارات ومحاكم المجلس الأعلى للقضاء)
 */
export const DepartmentBarChart: React.FC<DepartmentChartProps> = ({ ideas, language = 'ar' }) => {
  const isAr = language === 'ar';

  const deptCounts: { [deptName: string]: number } = {};
  ideas.forEach((i) => {
    const dept = i.departmentTarget || (isAr ? 'أخرى' : 'Other');
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });

  const sorted = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);
  const labels = sorted.map((s) => s[0]);
  const counts = sorted.map((s) => s[1]);

  const chartData = {
    labels,
    datasets: [
      {
        label: isAr ? 'عدد الأفكار المقدمة' : 'Proposals Count',
        data: counts,
        backgroundColor: '#8A1538', // SJC Maroon
        hoverBackgroundColor: '#670F2A',
        borderRadius: 8,
        barPercentage: 0.6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const, // horizontal bars for readable department names
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        rtl: isAr,
        bodyFont: {
          family: 'Tajawal, sans-serif',
          size: 12,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            family: 'Tajawal, sans-serif',
            size: 11,
          },
        },
        grid: {
          color: '#F1F5F9',
        },
      },
      y: {
        ticks: {
          font: {
            family: 'Tajawal, sans-serif',
            size: 11,
            weight: 'bold' as const,
          },
          color: '#334155',
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="w-full h-72 sm:h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
};

interface CategoryChartProps {
  ideas: Idea[];
  categories: Category[];
  language?: 'ar' | 'en';
}

/**
 * Doughnut / Bar Chart: Ideas distribution by Innovation Category (تصنيفات الابتكار القضائي)
 */
export const CategoryDistributionChart: React.FC<CategoryChartProps> = ({
  ideas,
  categories,
  language = 'ar',
}) => {
  const isAr = language === 'ar';

  const catCounts: { [name: string]: number } = {};
  ideas.forEach((i) => {
    catCounts[i.category] = (catCounts[i.category] || 0) + 1;
  });

  const labels = Object.keys(catCounts);
  const dataValues = Object.values(catCounts);

  const colors = [
    '#8A1538', // Maroon
    '#C5A059', // Gold
    '#0284C7', // Sky Blue
    '#7C3AED', // Purple
    '#059669', // Emerald
    '#D97706', // Amber
    '#EC4899', // Pink
  ];

  const chartData = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        rtl: isAr,
        labels: {
          font: {
            family: 'Tajawal, sans-serif',
            size: 11,
          },
          padding: 10,
          boxWidth: 10,
        },
      },
      tooltip: {
        rtl: isAr,
      },
    },
  };

  return (
    <div className="w-full h-64 sm:h-72 flex items-center justify-center">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

interface RadarChartProps {
  ideas: Idea[];
  language?: 'ar' | 'en';
}

/**
 * Radar Chart: Average Evaluation Criteria (الجدوى الفنية، الأثر، التكلفة، الابتكار)
 */
export const EvaluationRadarChart: React.FC<RadarChartProps> = ({ ideas, language = 'ar' }) => {
  const isAr = language === 'ar';

  const allEvals = ideas.flatMap((i) => i.evaluations || []);

  let avgFeas = 4.2;
  let avgImpact = 4.6;
  let avgCost = 3.9;
  let avgInno = 4.4;

  if (allEvals.length > 0) {
    avgFeas = Number((allEvals.reduce((a, b) => a + b.feasibilityScore, 0) / allEvals.length).toFixed(1));
    avgImpact = Number((allEvals.reduce((a, b) => a + b.impactScore, 0) / allEvals.length).toFixed(1));
    avgCost = Number((allEvals.reduce((a, b) => a + b.costScore, 0) / allEvals.length).toFixed(1));
    avgInno = Number((allEvals.reduce((a, b) => a + b.innovationScore, 0) / allEvals.length).toFixed(1));
  }

  const chartData = {
    labels: isAr
      ? ['الجدوى الفنية', 'الأثر القضائي', 'الجدوى المالية', 'مستوى الابتكار']
      : ['Feasibility', 'Judicial Impact', 'Cost Viability', 'Innovation'],
    datasets: [
      {
        label: isAr ? 'متوسط درجات التحكيم' : 'Average Review Score',
        data: [avgFeas, avgImpact, avgCost, avgInno],
        backgroundColor: 'rgba(138, 21, 56, 0.2)', // translucent SJC maroon
        borderColor: '#8A1538',
        borderWidth: 2,
        pointBackgroundColor: '#C5A059',
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#8A1538',
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
          font: {
            size: 10,
          },
        },
        pointLabels: {
          font: {
            family: 'Tajawal, sans-serif',
            size: 11,
            weight: 'bold' as const,
          },
          color: '#1E293B',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="w-full h-64 sm:h-72 flex items-center justify-center">
      <Radar data={chartData} options={options} />
    </div>
  );
};
