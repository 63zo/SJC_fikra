import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Mic,
  MicOff,
  Building,
  AlertTriangle,
  Lightbulb,
  Tag,
  CheckCircle2,
  Paperclip,
  Flame,
  Bot,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useIdeas } from '../../context/IdeaContext';
import { searchSimilarIdeas } from '../../services/aiService';
import { speechService } from '../../services/speechService';
import { SimilarityMatch } from '../../types';

interface SubmitIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExistingIdea?: (ideaId: string) => void;
}

export const SubmitIdeaModal: React.FC<SubmitIdeaModalProps> = ({
  isOpen,
  onClose,
  onSelectExistingIdea,
}) => {
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();
  const { ideas, departments, submitIdea } = useIdeas();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDepartment, setTargetDepartment] = useState('');
  const [attachmentName, setAttachmentName] = useState<string | undefined>(undefined);

  // Real-time AI similarity
  const [similarIdeas, setSimilarIdeas] = useState<SimilarityMatch[]>([]);
  const [isSearchingSimilar, setIsSearchingSimilar] = useState(false);

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [activeVoiceField, setActiveVoiceField] = useState<'title' | 'description'>('description');
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  // Real-time AI similarity search debounce
  useEffect(() => {
    const combined = `${title} ${description}`.trim();
    const words = combined.split(/\s+/).filter(w => w.length > 0);

    if (words.length >= 3) {
      setIsSearchingSimilar(true);
      const timer = setTimeout(() => {
        const matches = searchSimilarIdeas(title, description, ideas, 25);
        setSimilarIdeas(matches);
        setIsSearchingSimilar(false);
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setSimilarIdeas([]);
      setIsSearchingSimilar(false);
    }
  }, [title, description, ideas]);

  if (!isOpen) return null;

  const toggleVoiceRecording = (field: 'title' | 'description') => {
    setActiveVoiceField(field);
    setSpeechError(null);

    if (isRecording) {
      speechService.stop();
      setIsRecording(false);
    } else {
      const started = speechService.start(
        language === 'ar' ? 'ar' : 'en',
        (transcript, isFinal) => {
          if (field === 'title') {
            setTitle(prev => (prev ? `${prev} ${transcript}` : transcript));
          } else {
            setDescription(prev => (prev ? `${prev} ${transcript}` : transcript));
          }
        },
        (error) => {
          setSpeechError(error === 'not-allowed' 
            ? (language === 'ar' ? 'يرجى السماح بالوصول للميكروفون' : 'Microphone permission denied')
            : t.voiceNotSupported);
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
        }
      );

      if (started) {
        setIsRecording(true);
      } else {
        setSpeechError(t.voiceNotSupported);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await submitIdea({
        title: title.trim(),
        description: description.trim(),
        departmentTarget: targetDepartment || departments[0]?.nameAr || 'إدارة نظم المعلومات',
        audioRecorded: isRecording || undefined,
        attachmentName: attachmentName,
      });

      setIsSubmittedSuccess(true);
      setTimeout(() => {
        setIsSubmittedSuccess(false);
        setTitle('');
        setDescription('');
        setTargetDepartment('');
        setSimilarIdeas([]);
        onClose();
      }, 1400);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachmentName(e.target.files[0].name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sjc-maroon via-sjc-maroon-800 to-sjc-maroon-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 end-5 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-sjc-gold border border-sjc-gold/40 shadow-inner">
              <Lightbulb className="w-7 h-7 animate-pulse-subtle" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                <span>{t.submitIdeaTitle}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sjc-gold text-sjc-slate-dark">
                  AI Powered
                </span>
              </h3>
              <p className="text-xs text-slate-200 font-normal mt-0.5 max-w-md">
                {t.submitIdeaDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {isSubmittedSuccess ? (
            <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">
                {t.ideaSubmittedSuccess}
              </h4>
              <p className="text-xs text-slate-500">
                {language === 'ar'
                  ? 'تم فحص الفكرة بالذكاء الاصطناعي وإرسالها للجنة التقييم وإتاحتها لتصويت الزملاء.'
                  : 'Idea analyzed by AI, forwarded to Committee, and opened for colleague votes.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Target Department Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-sjc-maroon" />
                  <span>{t.targetDeptLabel}</span>
                  <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={targetDepartment}
                  onChange={(e) => setTargetDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sjc-maroon/30 focus:border-sjc-maroon text-xs bg-white font-medium"
                >
                  <option value="">{t.selectDepartment}</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={language === 'ar' ? dept.nameAr : dept.nameEn}>
                      {language === 'ar' ? dept.nameAr : dept.nameEn} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Idea Title with Voice Option */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-sjc-maroon" />
                    <span>{t.ideaTitleLabel}</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleVoiceRecording('title')}
                    className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                      isRecording && activeVoiceField === 'title'
                        ? 'bg-red-600 text-white recording-pulse shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isRecording && activeVoiceField === 'title' ? (
                      <>
                        <MicOff className="w-3.5 h-3.5" />
                        <span>{t.voiceInputStop}</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-sjc-maroon" />
                        <span>{language === 'ar' ? 'إملاء العنوان صوتياً' : 'Voice Input'}</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.ideaTitlePlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sjc-maroon/30 focus:border-sjc-maroon text-sm font-medium transition-all"
                />
              </div>

              {/* Idea Description with Voice Dictation */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-sjc-maroon" />
                    <span>{t.ideaDescLabel}</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleVoiceRecording('description')}
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg font-bold transition-all ${
                      isRecording && activeVoiceField === 'description'
                        ? 'bg-red-600 text-white recording-pulse shadow-md'
                        : 'bg-sjc-maroon-50 text-sjc-maroon hover:bg-sjc-maroon-100 border border-sjc-maroon/20'
                    }`}
                  >
                    {isRecording && activeVoiceField === 'description' ? (
                      <>
                        <MicOff className="w-4 h-4" />
                        <span>{t.voiceInputStop}</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span>{t.voiceInputStart}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t.ideaDescPlaceholder}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-sjc-maroon/30 focus:border-sjc-maroon text-sm leading-relaxed transition-all"
                  />
                  {isRecording && (
                    <div className="absolute bottom-3 end-3 flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                      <span>{t.voiceInputListening}</span>
                    </div>
                  )}
                </div>
              </div>

              {speechError && (
                <p className="text-xs text-red-600 font-medium">{speechError}</p>
              )}

              {/* REAL-TIME AI SIMILARITY ALERT BOX (>3 words) */}
              {similarIdeas.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-300 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-900 font-black text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{t.similarityAlertTitle}</span>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                      {similarIdeas.length} {language === 'ar' ? 'مقترحات متطابقة' : 'matches'}
                    </span>
                  </div>
                  <p className="text-xs text-amber-800">
                    {t.similarityAlertDesc}
                  </p>

                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {similarIdeas.map((match) => (
                      <div
                        key={match.ideaId}
                        className="p-3 bg-white rounded-xl border border-amber-200 shadow-sm flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800 line-clamp-1">
                            {match.title}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {match.snippet}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2 py-1 rounded-lg font-black text-[11px] ${
                            match.similarityScore > 60
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {match.similarityScore}%
                          </span>

                          {onSelectExistingIdea && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onSelectExistingIdea(match.ideaId);
                              }}
                              className="p-1.5 text-sjc-maroon hover:bg-sjc-maroon-50 rounded-lg"
                              title={t.viewExistingIdea}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Attachment */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all">
                  <Paperclip className="w-4 h-4 text-slate-500" />
                  <span>
                    {attachmentName || (language === 'ar' ? 'إرفاق دراسة / مستند (اختياري)' : 'Attach Document (Optional)')}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleSimulatedFileUpload}
                  />
                </label>

                {currentUser && (
                  <span className="text-[11px] text-slate-500">
                    {language === 'ar' ? 'المرسل:' : 'Author:'} <strong>{currentUser.fullName}</strong>
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold"
                >
                  {t.cancelBtn}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !description.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sjc-maroon to-sjc-maroon-800 hover:from-sjc-maroon-800 hover:to-sjc-maroon-900 text-white font-bold text-xs shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-sjc-gold" />
                  <span>{isSubmitting ? t.submitting : t.submitBtn}</span>
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};
