import React from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Sparkles,
  Building,
  User,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  FileSearch,
  XCircle,
  Star,
  ChevronRight,
  ChevronLeft,
  Bot,
} from 'lucide-react';
import { Idea, IdeaStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useIdeas } from '../../context/IdeaContext';

interface IdeaCardProps {
  idea: Idea;
  onOpenDetails: (idea: Idea) => void;
  onOpenEvaluate?: (idea: Idea) => void;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  onOpenDetails,
  onOpenEvaluate,
}) => {
  const { t, language, dir } = useLanguage();
  const { currentUser } = useAuth();
  const { voteIdea } = useIdeas();

  const userVote = currentUser ? idea.votedUsers[currentUser.id] : undefined;

  const getStatusBadge = (status: IdeaStatus) => {
    switch (status) {
      case 'accepted':
        return {
          label: t.status_accepted,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-300',
          icon: CheckCircle,
        };
      case 'feasibility':
        return {
          label: t.status_feasibility,
          bg: 'bg-blue-50 text-blue-700 border-blue-300',
          icon: FileSearch,
        };
      case 'under_review':
        return {
          label: t.status_under_review,
          bg: 'bg-amber-50 text-amber-700 border-amber-300',
          icon: Clock,
        };
      case 'rejected':
        return {
          label: t.status_rejected,
          bg: 'bg-rose-50 text-rose-700 border-rose-300',
          icon: XCircle,
        };
      default:
        return {
          label: t.status_submitted,
          bg: 'bg-purple-50 text-purple-700 border-purple-300',
          icon: Clock,
        };
    }
  };

  const statusInfo = getStatusBadge(idea.status);
  const StatusIcon = statusInfo.icon;
  const ArrowIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  const formattedDate = new Date(idea.createdAt).toLocaleDateString(
    language === 'ar' ? 'ar-QA' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-sjc-maroon/30 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between">
      
      {/* Top Banner & Status */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Status Badge */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${statusInfo.bg}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusInfo.label}</span>
          </span>

          {/* Target Department */}
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
            <Building className="w-3 h-3 text-sjc-maroon" />
            <span className="line-clamp-1">{idea.departmentTarget}</span>
          </span>
        </div>

        {/* Title */}
        <h3
          onClick={() => onOpenDetails(idea)}
          className="text-base font-bold text-slate-900 group-hover:text-sjc-maroon transition-colors cursor-pointer line-clamp-2 mb-2 leading-snug"
        >
          {idea.title}
        </h3>

        {/* Description Snippet */}
        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3">
          {idea.description}
        </p>

        {/* AI Summary Highlight Box */}
        {idea.aiSummary && (
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-sjc-maroon-50/70 to-amber-50/70 border border-sjc-maroon/15 mb-3 flex items-start gap-2 text-xs">
            <Bot className="w-4 h-4 text-sjc-maroon shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-700 font-medium line-clamp-2">
              <strong className="text-sjc-maroon">{language === 'ar' ? 'ملخص الذكاء الاصطناعي: ' : 'AI Summary: '}</strong>
              {idea.aiSummary}
            </p>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {idea.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md"
            >
              #{tag}
            </span>
          ))}
          {idea.tags.length > 3 && (
            <span className="text-[10px] text-slate-400 font-medium self-center">
              +{idea.tags.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer Info & Engagement */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-col gap-3">
        
        {/* Author Row */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-sjc-maroon-100 text-sjc-maroon font-bold text-[10px] flex items-center justify-center">
              {idea.authorName.charAt(0)}
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-800 line-clamp-1">
                {idea.authorName}
              </p>
              <p className="text-[10px] text-slate-400">
                {idea.authorDepartment}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <Calendar className="w-3 h-3" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Engagement Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
          
          {/* Voting Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => voteIdea(idea.id, 'up')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                userVote === 'up'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200'
              }`}
              title={t.voteUp}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{idea.upvotes}</span>
            </button>

            <button
              onClick={() => voteIdea(idea.id, 'down')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                userVote === 'down'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-700 border border-slate-200'
              }`}
              title={t.voteDown}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              {idea.downvotes > 0 && <span>{idea.downvotes}</span>}
            </button>
          </div>

          {/* Comments Count & View Details CTA */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenDetails(idea)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-sjc-maroon px-2 py-1 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="font-bold">{idea.commentsCount}</span>
            </button>

            {/* If user is committee member, show evaluate button */}
            {(currentUser?.role === 'committee' || currentUser?.role === 'admin') && onOpenEvaluate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEvaluate(idea);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-sjc-gold/25 text-amber-950 border border-sjc-gold/50 text-[11px] font-bold flex items-center gap-1.5 shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title={language === 'ar' ? 'فتح شاشة التحكيم والتقييم' : 'Open Evaluation Screen'}
              >
                <Star className="w-3.5 h-3.5 text-sjc-gold fill-sjc-gold shrink-0" />
                <span>{language === 'ar' ? 'تقييم' : 'Evaluate'}</span>
              </button>
            )}

            <button
              onClick={() => onOpenDetails(idea)}
              className="p-1 text-slate-400 hover:text-sjc-maroon hover:bg-sjc-maroon-50 rounded-lg transition-colors"
              title="View full idea"
            >
              <ArrowIcon className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
