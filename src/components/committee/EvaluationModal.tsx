import React, { useState, useEffect } from 'react';
import {
  Shield,
  Star,
  CheckCircle,
  FileSearch,
  XCircle,
  Building,
  User,
  Clock,
  Sparkles,
  X,
  Bot,
  Layers,
  Award,
} from 'lucide-react';
import { Idea, IdeaStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useIdeas } from '../../context/IdeaContext';

interface EvaluationModalProps {
  isOpen: boolean;
  idea: Idea | null;
  onClose: () => void;
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({
  isOpen,
  idea,
  onClose,
}) => {
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();
  const { evaluateIdea } = useIdeas();

  const [feasibilityScore, setFeasibilityScore] = useState(4);
  const [impactScore, setImpactScore] = useState(5);
  const [costScore, setCostScore] = useState(4);
  const [innovationScore, setInnovationScore] = useState(4);
  const [decision, setDecision] = useState<IdeaStatus>('accepted');
  const [feedback, setFeedback] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [successSaved, setSuccessSaved] = useState(false);

  // Initialize or reset when idea changes
  useEffect(() => {
    if (idea) {
      // If idea already has evaluations, preload last evaluation
      if (idea.evaluations && idea.evaluations.length > 0) {
        const last = idea.evaluations[0];
        setFeasibilityScore(last.feasibilityScore);
        setImpactScore(last.impactScore);
        setCostScore(last.costScore);
        setInnovationScore(last.innovationScore);
        setDecision(last.decision || 'accepted');
        setFeedback(last.feedback || '');
        setInternalNotes(last.internalNotes || '');
      } else {
        setFeasibilityScore(4);
        setImpactScore(4);
        setCostScore(4);
        setInnovationScore(4);
        setDecision(idea.status === 'rejected' ? 'rejected' : idea.status === 'feasibility' ? 'feasibility' : 'accepted');
        setFeedback('');
        setInternalNotes('');
      }
      setSuccessSaved(false);
    }
  }, [idea, isOpen]);

  if (!isOpen || !idea) return null;

  const overallScore = Number(
    ((feasibilityScore + impactScore + costScore + innovationScore) / 4).toFixed(2)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    evaluateIdea(idea.id, {
      ideaId: idea.id,
      reviewerId: currentUser.id,
      reviewerName: currentUser.fullName,
      reviewerRole: currentUser.role === 'admin' ? t.roleAdmin : t.roleCommittee,
      feasibilityScore,
      impactScore,
      costScore,
      innovationScore,
      overallScore,
      decision,
      feedback:
        feedback.trim() ||
        (language === 'ar'
          ? 'تم تقييم المقترح والمصادقة عليه رسمياً وفق معايير لجنة التحكيم القضائي.'
          : 'Proposal evaluated and officially recorded according to judicial review standards.'),
      internalNotes: internalNotes.trim(),
    });

    setSuccessSaved(true);
    setTimeout(() => {
      setSuccessSaved(false);
      onClose();
    }, 1200);
  };

  const StarRating = ({
    value,
    onChange,
    label,
    desc,
  }: {
    value: number;
    onChange: (val: number) => void;
    label: string;
    desc?: string;
  }) => (
    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 hover:border-sjc-maroon/30 transition-colors">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-slate-800">{label}</span>
        <span className="text-xs font-black text-sjc-maroon bg-white px-2 py-0.5 rounded-lg border border-slate-200">
          {value} / 5
        </span>
      </div>
      {desc && <p className="text-[10px] text-slate-400 mb-2">{desc}</p>}
      <div className="flex items-center gap-1.5 justify-center pt-1">
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
                  ? 'text-sjc-gold fill-sjc-gold drop-shadow-xs'
                  : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-sjc-maroon via-sjc-maroon-800 to-sjc-maroon-950 p-5 sm:p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 end-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2 text-xs text-sjc-gold font-bold">
            <Shield className="w-4 h-4" />
            <span>
              {language === 'ar'
                ? 'شاشة تقييم وتحكيم المقترح القضائي'
                : 'Judicial Proposal Review & Evaluation Sheet'}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white leading-snug line-clamp-2 pe-8">
            {idea.title}
          </h3>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-200">
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-sjc-gold" />
              <span>{idea.authorName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-sjc-gold" />
              <span>{idea.departmentTarget}</span>
            </div>
            <div className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-sjc-gold" />
              <span className="text-[11px]">{idea.category}</span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {successSaved ? (
            <div className="py-14 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-black text-slate-900">
                {t.evaluationSuccess}
              </h4>
              <p className="text-xs text-slate-500">
                {language === 'ar'
                  ? 'تم تحديث حالة الفكرة وحساب النتيجة والمزامنة الفورية.'
                  : 'Idea status, evaluation scores and synchronization updated successfully.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Calculated Score Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-sjc-maroon-50 via-amber-50 to-emerald-50 border border-sjc-maroon/20 flex items-center justify-between shadow-xs">
                <div>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    {language === 'ar' ? 'متوسط تقييم المعايير الأربعة:' : 'Overall Calculated Score:'}
                  </p>
                  <p className="text-2xl font-black text-sjc-maroon flex items-center gap-1">
                    <Star className="w-5 h-5 text-sjc-gold fill-sjc-gold inline" />
                    <span>{overallScore}</span>
                    <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
                  </p>
                </div>
                <div className="text-end">
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-full inline-block ${
                      overallScore >= 4.0
                        ? 'bg-sjc-maroon text-white shadow-xs'
                        : overallScore >= 3.0
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-600 text-white'
                    }`}
                  >
                    {overallScore >= 4.0
                      ? language === 'ar' ? 'مقترح ذو أولوية عليا' : 'High Priority'
                      : overallScore >= 3.0
                      ? language === 'ar' ? 'مقترح متوسط الجدوى' : 'Medium Priority'
                      : language === 'ar' ? 'بحاجة لتطوير' : 'Needs Work'}
                  </span>
                </div>
              </div>

              {/* 4 Multi-criteria Star Ratings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <StarRating
                  value={feasibilityScore}
                  onChange={setFeasibilityScore}
                  label={t.feasibilityScoreLabel}
                  desc={language === 'ar' ? 'إمكانية التطبيق الواقعي والتوافق الفني' : 'Technical feasibility'}
                />
                <StarRating
                  value={impactScore}
                  onChange={setImpactScore}
                  label={t.impactScoreLabel}
                  desc={language === 'ar' ? 'الأثر المباشر على سرعة وجودة التقاضي' : 'Strategic judicial impact'}
                />
                <StarRating
                  value={costScore}
                  onChange={setCostScore}
                  label={t.costScoreLabel}
                  desc={language === 'ar' ? 'العائد المالي وملاءمة الميزانية' : 'Financial efficiency & ROI'}
                />
                <StarRating
                  value={innovationScore}
                  onChange={setInnovationScore}
                  label={t.innovationScoreLabel}
                  desc={language === 'ar' ? 'حداثة الفكرة واستخدام التقنيات الذكية' : 'Uniqueness & AI innovation'}
                />
              </div>

              {/* Official Decision Buttons */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  {t.decisionLabel}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setDecision('accepted')}
                    className={`p-3 rounded-2xl font-bold flex items-center justify-center gap-2 border transition-all ${
                      decision === 'accepted'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{language === 'ar' ? 'اعتماد الفكرة' : 'Accept Idea'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision('feasibility')}
                    className={`p-3 rounded-2xl font-bold flex items-center justify-center gap-2 border transition-all ${
                      decision === 'feasibility'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                        : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    <FileSearch className="w-4 h-4" />
                    <span>{language === 'ar' ? 'دراسة جدوى' : 'Feasibility'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision('rejected')}
                    className={`p-3 rounded-2xl font-bold flex items-center justify-center gap-2 border transition-all ${
                      decision === 'rejected'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                        : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{language === 'ar' ? 'الاعتذار' : 'Decline'}</span>
                  </button>
                </div>
              </div>

              {/* Official Feedback to Author */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  {t.committeeFeedbackLabel}
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={t.committeeFeedbackPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-sjc-maroon/30 focus:border-sjc-maroon text-xs leading-relaxed"
                />
              </div>

              {/* Internal Confidential Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-sjc-gold" />
                  <span>{t.internalNotesLabel}</span>
                </label>
                <input
                  type="text"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'ملاحظات وتوصيات خاصة بأعضاء اللجنة ومدير النظام...'
                      : 'Confidential notes for committee & admin...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sjc-maroon to-sjc-maroon-800 hover:from-sjc-maroon-800 hover:to-sjc-maroon-900 text-white font-bold text-xs shadow-md shadow-sjc-maroon/20 hover:scale-[1.02] flex items-center gap-2 transition-all border border-sjc-gold/30"
                >
                  <Award className="w-4 h-4 text-sjc-gold" />
                  <span>{t.submitEvaluation}</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
