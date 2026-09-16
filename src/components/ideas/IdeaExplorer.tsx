import React, { useState } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  PlusCircle,
  Sparkles,
  Building,
  CheckCircle,
  Clock,
  ThumbsUp,
  Lightbulb,
  Compass,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { Idea, IdeaStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useIdeas } from '../../context/IdeaContext';
import { IdeaCard } from './IdeaCard';

interface IdeaExplorerProps {
  onOpenSubmitModal: () => void;
  onOpenDetails: (idea: Idea) => void;
  onOpenEvaluate?: (idea: Idea) => void;
}

export const IdeaExplorer: React.FC<IdeaExplorerProps> = ({
  onOpenSubmitModal,
  onOpenDetails,
  onOpenEvaluate,
}) => {
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();
  const { ideas, departments, categories } = useIdeas();

  // Filter and Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'recent' | 'votes' | 'comments'>('recent');

  // Filter ideas logic
  const filteredIdeas = ideas.filter((idea) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = idea.title.toLowerCase().includes(q);
      const matchDesc = idea.description.toLowerCase().includes(q);
      const matchAuthor = idea.authorName.toLowerCase().includes(q);
      const matchTags = idea.tags.some(tag => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchAuthor && !matchTags) return false;
    }

    // Department filter
    if (selectedDept !== 'ALL' && idea.departmentTarget !== selectedDept) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'ALL' && idea.category !== selectedCategory) {
      return false;
    }

    // Status filter
    if (selectedStatus === 'MY_IDEAS') {
      if (!currentUser || (idea.authorId !== currentUser.id && idea.authorName !== currentUser.fullName)) {
        return false;
      }
    } else if (selectedStatus !== 'ALL' && idea.status !== selectedStatus) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'votes') return b.upvotes - a.upvotes;
    if (sortBy === 'comments') return b.commentsCount - a.commentsCount;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* SJC Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-r from-sjc-maroon via-sjc-maroon-800 to-sjc-maroon-900 text-white shadow-xl overflow-hidden p-8 sm:p-10 border border-sjc-gold/30">
        <div className="absolute top-0 end-0 -mt-8 -me-8 w-96 h-96 bg-sjc-gold/15 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-sjc-gold border border-sjc-gold/30 text-xs font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-sjc-gold animate-spin-slow" />
            <span>{language === 'ar' ? 'منصة الأفكار والمبادرات الابتكارية المعتمدة' : 'Official SJC Innovation & Initiatives Platform'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
            {language === 'ar' ? 'شارك بفكرتك 💡 واصنع الفارق في منظومة العدالة' : 'Share Your Idea 💡 & Shape the Future of Justice'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl font-normal">
            {t.tagline}. {language === 'ar'
              ? 'تتيح منصة فكرة لجميع موظفي المحاكم والإدارات تقديم مبادراتهم بالصوت أو الكتابة مع تحليل لحظي فوري بالذكاء الاصطناعي.'
              : 'Fikra empowers all court and administrative employees to propose ideas via voice or text with real-time AI assistance.'}
          </p>

          {/* Quick CTA Actions in Hero */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenSubmitModal}
              className="flex items-center gap-2 bg-sjc-gold hover:bg-sjc-gold-600 text-sjc-slate-dark px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-black/20 hover:scale-105 transition-all"
            >
              <PlusCircle className="w-5 h-5" />
              <span>{t.navSubmit}</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-200 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{ideas.length} {language === 'ar' ? 'فكرة مسجلة بالمنظومة' : 'Active ideas in bank'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute top-3.5 start-4 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full ps-12 pe-4 py-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-sjc-maroon/30 focus:border-sjc-maroon text-sm font-medium transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute top-3.5 end-4 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Badges & Dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          
          {/* Quick Status Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedStatus('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStatus === 'ALL'
                  ? 'bg-sjc-maroon text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.filterAll}
            </button>

            {currentUser && (
              <button
                onClick={() => setSelectedStatus('MY_IDEAS')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedStatus === 'MY_IDEAS'
                    ? 'bg-sjc-maroon text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.filterMyIdeas}
              </button>
            )}

            <button
              onClick={() => setSelectedStatus('accepted')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStatus === 'accepted'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              {t.filterAccepted}
            </button>

            <button
              onClick={() => setSelectedStatus('under_review')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStatus === 'under_review'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              {t.filterUnderReview}
            </button>
          </div>

          {/* Department & Sort Dropdowns */}
          <div className="flex items-center gap-2 text-xs">
            {/* Department Filter Dropdown */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-sjc-maroon/30"
            >
              <option value="ALL">{language === 'ar' ? '-- جميع الإدارات والمحاكم --' : '-- All Departments --'}</option>
              {departments.map((dept) => (
                <option key={dept.id} value={language === 'ar' ? dept.nameAr : dept.nameEn}>
                  {language === 'ar' ? dept.nameAr : dept.nameEn}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setSortBy('recent')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  sortBy === 'recent' ? 'bg-white text-sjc-maroon shadow-xs' : 'text-slate-600'
                }`}
              >
                {t.sortRecent}
              </button>
              <button
                onClick={() => setSortBy('votes')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  sortBy === 'votes' ? 'bg-white text-sjc-maroon shadow-xs' : 'text-slate-600'
                }`}
              >
                {t.sortVotes}
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Ideas Grid */}
      {filteredIdeas.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Lightbulb className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {t.noIdeasFound}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'ar'
              ? 'جرب البحث بكلمات أخرى أو تصفير المرشحات، أو كن أول من يقدم فكرة في هذا المجال.'
              : 'Try different search keywords or be the first to submit a proposal in this field.'}
          </p>
          <button
            onClick={onOpenSubmitModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sjc-maroon text-white text-xs font-bold shadow-md hover:bg-sjc-maroon-800"
          >
            <PlusCircle className="w-4 h-4 text-sjc-gold" />
            <span>{t.navSubmit}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdeas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onOpenDetails={onOpenDetails}
              onOpenEvaluate={onOpenEvaluate}
            />
          ))}
        </div>
      )}

    </div>
  );
};
