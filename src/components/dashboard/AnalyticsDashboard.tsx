import React from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  ThumbsUp,
  MessageSquare,
  CheckCircle,
  Clock,
  FileSearch,
  Building,
  Download,
  Award,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useIdeas } from '../../context/IdeaContext';
import { Idea } from '../../types';

interface AnalyticsDashboardProps {
  onOpenDetails: (idea: Idea) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onOpenDetails }) => {
  const { t, language } = useLanguage();
  const { ideas, departments, categories, stats } = useIdeas();

  // Calculate department distributions
  const deptCounts: { [deptName: string]: number } = {};
  ideas.forEach((idea) => {
    deptCounts[idea.departmentTarget] = (deptCounts[idea.departmentTarget] || 0) + 1;
  });

  const sortedDepts = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);
  const maxDeptCount = Math.max(...Object.values(deptCounts), 1);

  // Status breakdown calculations
  const statusStats = [
    { label: t.status_accepted, count: stats.acceptedIdeas, color: 'bg-emerald-500', text: 'text-emerald-700', bgLight: 'bg-emerald-50' },
    { label: t.status_feasibility, count: stats.feasibilityIdeas, color: 'bg-blue-500', text: 'text-blue-700', bgLight: 'bg-blue-50' },
    { label: t.status_under_review, count: stats.underReviewIdeas, color: 'bg-amber-500', text: 'text-amber-700', bgLight: 'bg-amber-50' },
    { label: t.status_rejected, count: stats.rejectedIdeas, color: 'bg-rose-500', text: 'text-rose-700', bgLight: 'bg-rose-50' },
  ];

  // Top voted ideas
  const topVotedIdeas = [...ideas].sort((a, b) => b.upvotes - a.upvotes).slice(0, 5);

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Author', 'Department', 'Target Department', 'Category', 'Status', 'Upvotes', 'Date'];
    const rows = ideas.map(i => [
      i.id,
      `"${i.title.replace(/"/g, '""')}"`,
      `"${i.authorName}"`,
      `"${i.authorDepartment}"`,
      `"${i.departmentTarget}"`,
      `"${i.category}"`,
      i.status,
      i.upvotes,
      i.createdAt.substring(0, 10),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SJC_Fikra_Innovation_Report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-sjc-maroon-50 text-sjc-maroon">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              {t.dashboardTitle}
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            {t.dashboardSubtitle}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all"
        >
          <Download className="w-4 h-4 text-sjc-gold" />
          <span>{t.exportReport}</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">{t.statTotalIdeas}</span>
            <Layers className="w-4 h-4 text-sjc-maroon" />
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.totalIdeas}</p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
            <TrendingUp className="w-3 h-3" />
            <span>+100% {language === 'ar' ? 'نمو الأفكار' : 'Growth'}</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-emerald-200/80 shadow-xs space-y-2 bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold">{t.statAcceptedIdeas}</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-700">{stats.acceptedIdeas}</p>
          <p className="text-[10px] text-slate-500">
            {stats.totalIdeas > 0 ? Math.round((stats.acceptedIdeas / stats.totalIdeas) * 100) : 0}% {language === 'ar' ? 'نسبة الاعتماد' : 'Approval rate'}
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-blue-200/80 shadow-xs space-y-2 bg-blue-50/20">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-xs font-bold">{t.statFeasibility}</span>
            <FileSearch className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-blue-700">{stats.feasibilityIdeas}</p>
          <p className="text-[10px] text-slate-500">{language === 'ar' ? 'مشاريع قيد الدراسة' : 'In Study Phase'}</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-amber-200/80 shadow-xs space-y-2 bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-bold">{t.statUnderReview}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-700">{stats.underReviewIdeas}</p>
          <p className="text-[10px] text-slate-500">{language === 'ar' ? 'بانتظار التحكيم' : 'Awaiting Review'}</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">{t.statTotalVotes}</span>
            <ThumbsUp className="w-4 h-4 text-sjc-gold" />
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.totalVotes}</p>
          <p className="text-[10px] text-slate-500">{stats.totalComments} {t.comments}</p>
        </div>

      </div>

      {/* Main Charts & Analytics Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Idea Distribution (Bar Graph) */}
        <div className="lg:col-span-2 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-sjc-maroon" />
              <h3 className="text-sm font-bold text-slate-900">
                {t.chartDeptDistribution}
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-semibold">
              {sortedDepts.length} {language === 'ar' ? 'إدارات ومحاكم مشاركة' : 'Target entities'}
            </span>
          </div>

          <div className="space-y-3.5 pt-2">
            {sortedDepts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">{t.noIdeasFound}</p>
            ) : (
              sortedDepts.map(([deptName, count]) => {
                const percent = Math.round((count / maxDeptCount) * 100);
                return (
                  <div key={deptName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800 line-clamp-1">{deptName}</span>
                      <span className="text-sjc-maroon shrink-0">{count} {language === 'ar' ? 'أفكار' : 'ideas'}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-gradient-to-r from-sjc-maroon to-sjc-gold rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Status Distribution Breakdown */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-sjc-maroon" />
            <h3 className="text-sm font-bold text-slate-900">
              {t.chartStatusBreakdown}
            </h3>
          </div>

          <div className="space-y-3 pt-2">
            {statusStats.map((item, idx) => {
              const ratio = stats.totalIdeas > 0 ? Math.round((item.count / stats.totalIdeas) * 100) : 0;
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl ${item.bgLight} border border-slate-200/60 flex items-center justify-between text-xs`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                    <span className="font-bold text-slate-800">{item.label}</span>
                  </div>
                  <div className="text-end">
                    <span className={`font-black text-sm ${item.text}`}>{item.count}</span>
                    <span className="text-[10px] text-slate-400 block font-semibold">{ratio}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SJC Innovation Quality Badge */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-sjc-maroon-50 to-amber-50 border border-sjc-maroon/20 text-center space-y-1">
            <Sparkles className="w-5 h-5 text-sjc-gold mx-auto" />
            <h4 className="text-xs font-bold text-sjc-maroon">
              {language === 'ar' ? 'مؤشر الكفاءة القضائية والابتكار' : 'Judicial Innovation Index'}
            </h4>
            <p className="text-[11px] text-slate-600">
              {language === 'ar' ? '94.2% مؤشر التفاعل والمشاركة المؤسسية' : '94.2% Institutional Participation Index'}
            </p>
          </div>

        </div>

      </div>

      {/* Top 5 Most Voted Ideas Table */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-sjc-gold" />
            <h3 className="text-sm font-bold text-slate-900">
              {t.topIdeas}
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[11px]">
                <th className="py-3 px-4 text-start">#</th>
                <th className="py-3 px-4 text-start">{language === 'ar' ? 'عنوان الفكرة' : 'Idea Title'}</th>
                <th className="py-3 px-4 text-start">{t.author}</th>
                <th className="py-3 px-4 text-start">{language === 'ar' ? 'الإدارة المستهدفة' : 'Target Dept'}</th>
                <th className="py-3 px-4 text-center">{t.votes}</th>
                <th className="py-3 px-4 text-center">{language === 'ar' ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topVotedIdeas.map((idea, index) => (
                <tr
                  key={idea.id}
                  onClick={() => onOpenDetails(idea)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-black text-sjc-maroon">{index + 1}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                    {idea.title}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{idea.authorName}</td>
                  <td className="py-3.5 px-4 text-slate-500">{idea.departmentTarget}</td>
                  <td className="py-3.5 px-4 text-center font-black text-emerald-600">
                    ★ {idea.upvotes}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sjc-maroon-50 text-sjc-maroon border border-sjc-maroon/20">
                      {idea.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
