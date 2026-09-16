import React, { useState } from 'react';
import {
  X,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Sparkles,
  Building,
  User,
  Calendar,
  Send,
  Heart,
  Star,
  ShieldCheck,
  Bot,
  Compass,
  FileCheck,
  CheckCircle,
  Clock,
  FileSearch,
  XCircle,
} from 'lucide-react';
import { Idea, IdeaStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useIdeas } from '../../context/IdeaContext';

interface IdeaDetailModalProps {
  idea: Idea | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEvaluate?: (idea: Idea) => void;
}

export const IdeaDetailModal: React.FC<IdeaDetailModalProps> = ({
  idea,
  isOpen,
  onClose,
  onOpenEvaluate,
}) => {
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();
  const { comments, addComment, likeComment, voteIdea } = useIdeas();

  const [commentText, setCommentText] = useState('');

  if (!isOpen || !idea) return null;

  const ideaComments = comments.filter((c) => c.ideaId === idea.id);
  const userVote = currentUser ? idea.votedUsers[currentUser.id] : undefined;

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(idea.id, commentText);
    setCommentText('');
  };

  const getStatusBadge = (status: IdeaStatus) => {
    switch (status) {
      case 'accepted':
        return {
          label: t.status_accepted,
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: CheckCircle,
        };
      case 'feasibility':
        return {
          label: t.status_feasibility,
          bg: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: FileSearch,
        };
      case 'under_review':
        return {
          label: t.status_under_review,
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: Clock,
        };
      case 'rejected':
        return {
          label: t.status_rejected,
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: XCircle,
        };
      default:
        return {
          label: t.status_submitted,
          bg: 'bg-purple-100 text-purple-800 border-purple-300',
          icon: Clock,
        };
    }
  };

  const statusBadge = getStatusBadge(idea.status);
  const StatusIcon = statusBadge.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sjc-maroon via-sjc-maroon-800 to-sjc-maroon-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 end-5 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.bg}`}>
              <StatusIcon className="w-4 h-4" />
              <span>{statusBadge.label}</span>
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-sjc-gold border border-sjc-gold/30">
              {idea.category}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-black leading-tight text-white">
            {idea.title}
          </h2>

          {/* Author Info Bar */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-white/15 text-xs text-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-sjc-gold text-sjc-slate-dark font-bold flex items-center justify-center text-xs">
                {idea.authorName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-white">{idea.authorName}</p>
                <p className="text-[11px] text-slate-300">{idea.authorJobTitle} - {idea.authorDepartment}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 ms-auto text-sjc-gold font-medium">
              <Building className="w-4 h-4" />
              <span>{language === 'ar' ? 'الجهة المستهدفة:' : 'Target:'} {idea.departmentTarget}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Main Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {language === 'ar' ? 'تفاصيل المبادرة والمقترح' : 'Proposal Details'}
            </h4>
            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {idea.description}
            </p>
          </div>

          {/* AI Automated Enrichment Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-sjc-maroon-50 to-amber-50 border border-sjc-maroon/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-sjc-maroon">
                <Bot className="w-4 h-4" />
                <span>{t.aiSummaryTitle}</span>
              </div>
              {idea.aiStrategicPillar && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-sjc-maroon text-white">
                  {idea.aiStrategicPillar}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {idea.aiSummary || idea.description}
            </p>

            {/* AI Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {idea.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-sjc-maroon border border-sjc-maroon/20 shadow-2xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Committee Evaluation Decision (if available) */}
          {idea.evaluations && idea.evaluations.length > 0 && (
            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>{language === 'ar' ? 'قرار وتقييم لجنة التحكيم' : 'Committee Evaluation Decision'}</span>
                </h4>
                <div className="flex items-center gap-1 text-xs font-black text-blue-900 bg-blue-200/80 px-2.5 py-1 rounded-lg">
                  <Star className="w-3.5 h-3.5 fill-blue-700 text-blue-700" />
                  <span>{idea.evaluations[0].overallScore.toFixed(1)} / 5</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 bg-white rounded-xl border border-blue-100 text-center">
                  <span className="text-slate-500 block">{language === 'ar' ? 'الجدوى الفنية' : 'Feasibility'}</span>
                  <span className="font-bold text-blue-900">★ {idea.evaluations[0].feasibilityScore}/5</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-blue-100 text-center">
                  <span className="text-slate-500 block">{language === 'ar' ? 'الأثر الاستراتيجي' : 'Impact'}</span>
                  <span className="font-bold text-blue-900">★ {idea.evaluations[0].impactScore}/5</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-blue-100 text-center">
                  <span className="text-slate-500 block">{language === 'ar' ? 'الجدوى المالية' : 'Cost Viability'}</span>
                  <span className="font-bold text-blue-900">★ {idea.evaluations[0].costScore}/5</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-blue-100 text-center">
                  <span className="text-slate-500 block">{language === 'ar' ? 'مستوى الابتكار' : 'Innovation'}</span>
                  <span className="font-bold text-blue-900">★ {idea.evaluations[0].innovationScore}/5</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-blue-100">
                <strong className="text-blue-900">{language === 'ar' ? 'الملاحظات الرسمية: ' : 'Official Feedback: '}</strong>
                {idea.evaluations[0].feedback}
              </p>
            </div>
          )}

          {/* Voting Bar */}
          <div className="p-4 bg-slate-100 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => voteIdea(idea.id, 'up')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  userVote === 'up'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{t.voteUp} ({idea.upvotes})</span>
              </button>

              <button
                onClick={() => voteIdea(idea.id, 'down')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  userVote === 'down'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-white hover:bg-rose-50 text-slate-700 border border-slate-200'
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
                <span>{t.voteDown} ({idea.downvotes})</span>
              </button>
            </div>

            {(currentUser?.role === 'committee' || currentUser?.role === 'admin') && onOpenEvaluate && (
              <button
                onClick={() => {
                  onClose();
                  onOpenEvaluate(idea);
                }}
                className="px-4 py-2 rounded-xl bg-sjc-maroon text-white text-xs font-bold hover:bg-sjc-maroon-800 flex items-center gap-1.5 shadow-sm"
              >
                <Star className="w-4 h-4 text-sjc-gold" />
                <span>{t.evaluateAction}</span>
              </button>
            )}
          </div>

          {/* Discussion & Comments Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sjc-maroon" />
                <span>{t.comments} ({ideaComments.length})</span>
              </h4>
            </div>

            {/* Comment Form */}
            {currentUser ? (
              <form onSubmit={handlePostComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={t.addComment}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sjc-maroon/30 focus:border-sjc-maroon text-xs"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-sjc-maroon hover:bg-sjc-maroon-800 text-white font-bold text-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-sjc-gold" />
                  <span>{t.postComment}</span>
                </button>
              </form>
            ) : (
              <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl text-center">
                {language === 'ar' ? 'يرجى تسجيل الدخول لإضافة تعليق أو مقترح.' : 'Please sign in to post a comment.'}
              </p>
            )}

            {/* Comments List */}
            <div className="space-y-3 pt-2">
              {ideaComments.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  {t.noCommentsYet}
                </p>
              ) : (
                ideaComments.map((comm) => {
                  const isLiked = currentUser && comm.likedBy.includes(currentUser.id);
                  return (
                    <div
                      key={comm.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-sjc-maroon-100 text-sjc-maroon font-bold text-[10px] flex items-center justify-center">
                            {comm.userName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900">{comm.userName}</span>
                            <span className="text-[10px] text-slate-400 ms-2">
                              {comm.userDepartment}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => likeComment(comm.id)}
                          className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg transition-colors ${
                            isLiked
                              ? 'text-rose-600 bg-rose-50'
                              : 'text-slate-400 hover:text-rose-600 hover:bg-slate-200'
                          }`}
                        >
                          <Heart className={`w-3 h-3 ${isLiked ? 'fill-rose-600' : ''}`} />
                          <span>{comm.likes}</span>
                        </button>
                      </div>

                      <p className="text-slate-700 leading-relaxed ps-8">
                        {comm.text}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
