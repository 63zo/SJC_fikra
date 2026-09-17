import React, { useState } from 'react';
import {
  Shield,
  Star,
  CheckCircle,
  FileSearch,
  XCircle,
  AlertTriangle,
  Send,
  Building,
  User,
  Clock,
  Filter,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Bot,
} from 'lucide-react';
import { Idea, IdeaStatus, Evaluation } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useIdeas } from '../../context/IdeaContext';
import { IdeaCard } from '../ideas/IdeaCard';
import {
  StatusDoughnutChart,
  DepartmentBarChart,
  CategoryDistributionChart,
  EvaluationRadarChart,
} from '../dashboard/Charts';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface CommitteePortalProps {
  onOpenDetails: (idea: Idea) => void;
  onOpenEvaluate?: (idea: Idea) => void;
}

export const CommitteePortal: React.FC<CommitteePortalProps> = ({ onOpenDetails, onOpenEvaluate }) => {
  const { t, language, dir } = useLanguage();
  const { currentUser } = useAuth();
  const { ideas, categories, stats, evaluateIdea } = useIdeas();
  const [activeView, setActiveView] = useState<'ideas' | 'charts'>('ideas');

  const [selectedIdeaForEval, setSelectedIdeaForEval] = useState<Idea | null>(null);
  const [filterStatus, setFilterStatus] = useState<'pending' | 'all' | 'accepted' | 'feasibility' | 'rejected'>('pending');

  // Evaluation Form State
  const [feasibilityScore, setFeasibilityScore] = useState(4);
  const [impactScore, setImpactScore] = useState(5);
  const [costScore, setCostScore] = useState(4);
  const [innovationScore, setInnovationScore] = useState(4);
  const [decision, setDecision] = useState<IdeaStatus>('accepted');
  const [feedback, setFeedback] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [evalSuccessMsg, setEvalSuccessMsg] = useState(false);

  const pendingIdeas = ideas.filter(
    (i) => i.status === 'submitted' || i.status === 'under_review' || i.status === 'feasibility'
  );

  const filteredIdeas = ideas.filter((idea) => {
    if (filterStatus === 'pending') return idea.status === 'submitted' || idea.status === 'under_review';
    if (filterStatus === 'accepted') return idea.status === 'accepted';
    if (filterStatus === 'feasibility') return idea.status === 'feasibility';
    if (filterStatus === 'rejected') return idea.status === 'rejected';
    return true;
  });

  const overallScore = Number(
    ((feasibilityScore + impactScore + costScore + innovationScore) / 4).toFixed(2)
  );

  const handleOpenEvalModal = (idea: Idea) => {
    setSelectedIdeaForEval(idea);
    setDecision('accepted');
    setFeedback('');
    setInternalNotes('');
    setFeasibilityScore(4);
    setImpactScore(4);
    setCostScore(4);
    setInnovationScore(4);
    setEvalSuccessMsg(false);
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIdeaForEval || !currentUser) return;

    evaluateIdea(selectedIdeaForEval.id, {
      ideaId: selectedIdeaForEval.id,
      reviewerId: currentUser.id,
      reviewerName: currentUser.fullName,
      reviewerRole: t.roleCommittee,
      feasibilityScore,
      impactScore,
      costScore,
      innovationScore,
      overallScore,
      decision,
      feedback: feedback.trim() || (language === 'ar' ? 'تمت مراجعة المقترح واعتماده وفق المعايير المعتمدة.' : 'Proposal reviewed and approved according to standards.'),
      internalNotes: internalNotes.trim(),
    });

    setEvalSuccessMsg(true);
    setTimeout(() => {
      setSelectedIdeaForEval(null);
      setEvalSuccessMsg(false);
    }, 1200);
  };

  const StarRating = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (val: number) => void;
    label: string;
  }) => (
    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-700">{label}</span>
        <span className="text-xs font-black text-sjc-maroon">{value} / 5</span>
      </div>
      <div className="flex items-center gap-1.5 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-125 transition-transform"
          >
            <Star
              className={`w-6 h-6 ${
                star <= value
                  ? 'text-sjc-gold fill-sjc-gold drop-shadow-sm'
                  : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Committee Hero Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-sjc-maroon via-sjc-maroon-800 to-sjc-maroon-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 end-0 w-80 h-80 bg-sjc-gold/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sjc-gold border border-sjc-gold/30 text-xs font-bold">
              <Shield className="w-4 h-4" />
              <span>{language === 'ar' ? 'البوابة الرسمية للجنة التحكيم القضائي' : 'Official Judicial Review Portal'}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              {t.committeeTitle}
            </h2>
            <p className="text-xs md:text-sm text-slate-200 max-w-xl leading-relaxed">
              {t.committeeSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <div className="w-12 h-12 rounded-xl bg-sjc-gold text-sjc-slate-dark flex items-center justify-center font-black text-xl shadow-md">
              {pendingIdeas.length}
            </div>
            <div>
              <p className="text-xs text-slate-300 font-semibold">{t.pendingReviewCount}</p>
              <p className="text-sm font-black text-white">
                {language === 'ar' ? 'تتطلب اتخاذ قرار' : 'Awaiting Decision'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Switcher: Ideas List vs Graphical Charts */}
      <div className="flex items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveView('ideas')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'ideas'
                ? 'bg-sjc-maroon text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-4 h-4 text-sjc-gold" />
            <span>{language === 'ar' ? 'قائمة المقترحات للتحكيم' : 'Proposals Review List'}</span>
          </button>

          <button
            onClick={() => setActiveView('charts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'charts'
                ? 'bg-sjc-maroon text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-sjc-gold" />
            <span>{language === 'ar' ? 'الرسوم البيانية والإحصائيات' : 'Graphical Charts & Analytics'}</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-semibold px-2 hidden sm:inline">
          {language === 'ar' ? 'منظومة تقييم الأفكار والمبادرات' : 'Evaluation & Scoring Engine'}
        </span>
      </div>

      {/* GRAPHICAL CHARTS VIEW */}
      {activeView === 'charts' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-emerald-200/80 shadow-xs bg-emerald-50/20">
              <span className="text-xs font-bold text-emerald-700 block">{t.statAcceptedIdeas}</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{stats.acceptedIdeas}</p>
              <span className="text-[10px] text-slate-400">{language === 'ar' ? 'مقترحات معتمدة' : 'Approved proposals'}</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-blue-200/80 shadow-xs bg-blue-50/20">
              <span className="text-xs font-bold text-blue-700 block">{t.statFeasibility}</span>
              <p className="text-2xl font-black text-blue-700 mt-1">{stats.feasibilityIdeas}</p>
              <span className="text-[10px] text-slate-400">{language === 'ar' ? 'قيد دراسة الجدوى' : 'In feasibility study'}</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-amber-200/80 shadow-xs bg-amber-50/20">
              <span className="text-xs font-bold text-amber-700 block">{t.statUnderReview}</span>
              <p className="text-2xl font-black text-amber-700 mt-1">{stats.underReviewIdeas}</p>
              <span className="text-[10px] text-slate-400">{language === 'ar' ? 'بانتظار قرار اللجنة' : 'Pending review'}</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-rose-200/80 shadow-xs bg-rose-50/20">
              <span className="text-xs font-bold text-rose-700 block">{t.status_rejected}</span>
              <p className="text-2xl font-black text-rose-700 mt-1">{stats.rejectedIdeas}</p>
              <span className="text-[10px] text-slate-400">{language === 'ar' ? 'مقترحات معتذر عنها' : 'Declined proposals'}</span>
            </div>
          </div>

          {/* Row 1 Charts: Status Doughnut + Department Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-sjc-maroon" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {language === 'ar' ? 'توزيع حالات الأفكار (المعتمد والمرفوض وقيد الدراسة)' : 'Status Breakdown Chart'}
                  </h3>
                </div>
              </div>
              <StatusDoughnutChart stats={stats} language={language} />
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-sjc-maroon" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {language === 'ar' ? 'توزيع المقترحات حسب المحاكم والإدارات' : 'Ideas by Courts & Departments'}
                  </h3>
                </div>
              </div>
              <DepartmentBarChart ideas={ideas} language={language} />
            </div>
          </div>

          {/* Row 2 Charts: Categories Doughnut + Radar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sjc-gold" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {language === 'ar' ? 'تصنيفات ومجالات الابتكار القضائي' : 'Innovation Categories Distribution'}
                  </h3>
                </div>
              </div>
              <CategoryDistributionChart ideas={ideas} categories={categories} language={language} />
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-sjc-gold fill-sjc-gold" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {language === 'ar' ? 'متوسط معايير التقييم والتحكيم القضائي' : 'Average Evaluation Criteria Radar'}
                  </h3>
                </div>
              </div>
              <EvaluationRadarChart ideas={ideas} language={language} />
            </div>
          </div>

        </div>
      )}

      {/* IDEAS LIST VIEW */}
      {activeView === 'ideas' && (
        <div className="space-y-6">
          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterStatus === 'pending'
                    ? 'bg-sjc-maroon text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {language === 'ar' ? 'بانتظار التقييم' : 'Pending Review'} ({pendingIdeas.length})
              </button>

              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterStatus === 'all'
                    ? 'bg-sjc-maroon text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {t.filterAll} ({ideas.length})
              </button>

              <button
                onClick={() => setFilterStatus('accepted')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterStatus === 'accepted'
                    ? 'bg-sjc-maroon text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {t.filterAccepted}
              </button>

              <button
                onClick={() => setFilterStatus('feasibility')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterStatus === 'feasibility'
                    ? 'bg-sjc-maroon text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {t.status_feasibility}
              </button>
            </div>
          </div>

          {/* Ideas Grid */}
          {filteredIdeas.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                {language === 'ar' ? 'لا توجد أفكار معلقة في هذا القسم حالياً' : 'No ideas in this category'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'ar' ? 'تمت مراجعة جميع الأفكار بنجاح.' : 'All proposals have been processed.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIdeas.map((idea) => (
                <div key={idea.id} className="relative flex flex-col">
                  <IdeaCard
                    idea={idea}
                    onOpenDetails={onOpenDetails}
                    onOpenEvaluate={onOpenEvaluate || handleOpenEvalModal}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EVALUATION MODAL */}
      {selectedIdeaForEval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-sjc-maroon to-sjc-maroon-900 p-6 text-white relative">
              <button
                onClick={() => setSelectedIdeaForEval(null)}
                className="absolute top-5 end-5 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
              >
                ✕
              </button>

              <div className="flex items-center gap-2 mb-2 text-xs text-sjc-gold font-bold">
                <Shield className="w-4 h-4" />
                <span>{language === 'ar' ? 'استمارة تقييم وتحكيم مقترح' : 'Evaluation & Scoring Sheet'}</span>
              </div>
              <h3 className="text-lg font-bold text-white line-clamp-1">
                {selectedIdeaForEval.title}
              </h3>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {evalSuccessMsg ? (
                <div className="py-12 text-center space-y-3">
                  <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto" />
                  <h4 className="text-lg font-bold text-slate-900">{t.evaluationSuccess}</h4>
                </div>
              ) : (
                <form onSubmit={handleSaveEvaluation} className="space-y-5">
                  
                  {/* Overall Calculated Score Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-sjc-maroon-50 to-amber-50 border border-sjc-maroon/20 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 font-semibold">{language === 'ar' ? 'متوسط تقييم المعايير:' : 'Overall Calculated Score:'}</p>
                      <p className="text-xl font-black text-sjc-maroon">★ {overallScore} / 5.0</p>
                    </div>
                    <div className="text-end">
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-sjc-maroon text-white">
                        {overallScore >= 4.0 ? (language === 'ar' ? 'مقترح متميز' : 'High Priority') : (language === 'ar' ? 'مقترح متوسط' : 'Moderate')}
                      </span>
                    </div>
                  </div>

                  {/* 4 Multi-criteria Rating Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <StarRating
                      value={feasibilityScore}
                      onChange={setFeasibilityScore}
                      label={t.feasibilityScoreLabel}
                    />
                    <StarRating
                      value={impactScore}
                      onChange={setImpactScore}
                      label={t.impactScoreLabel}
                    />
                    <StarRating
                      value={costScore}
                      onChange={setCostScore}
                      label={t.costScoreLabel}
                    />
                    <StarRating
                      value={innovationScore}
                      onChange={setInnovationScore}
                      label={t.innovationScoreLabel}
                    />
                  </div>

                  {/* Decision Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      {t.decisionLabel}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setDecision('accepted')}
                        className={`p-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                          decision === 'accepted'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{language === 'ar' ? 'اعتماد الفكرة' : 'Accept Idea'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDecision('feasibility')}
                        className={`p-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                          decision === 'feasibility'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                            : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                        }`}
                      >
                        <FileSearch className="w-4 h-4" />
                        <span>{language === 'ar' ? 'دراسة جدوى' : 'Feasibility'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDecision('rejected')}
                        className={`p-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                          decision === 'rejected'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                            : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        <XCircle className="w-4 h-4" />
                        <span>{language === 'ar' ? 'الاعتذار' : 'Decline'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Feedback to Author */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t.committeeFeedbackLabel}
                    </label>
                    <textarea
                      rows={3}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder={t.committeeFeedbackPlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sjc-maroon/30 focus:border-sjc-maroon text-xs leading-relaxed"
                    />
                  </div>

                  {/* Internal Confidential Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">
                      {t.internalNotesLabel}
                    </label>
                    <input
                      type="text"
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder={language === 'ar' ? 'توصيات لمدير الإدارة أو أولوية التنفيذ...' : 'Internal notes for committee...'}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedIdeaForEval(null)}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold"
                    >
                      {t.cancelBtn}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-sjc-maroon hover:bg-sjc-maroon-800 text-white font-bold text-xs shadow-md flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4 text-sjc-gold" />
                      <span>{t.submitEvaluation}</span>
                    </button>
                  </div>

                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
