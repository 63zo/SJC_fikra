import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Lock,
  Building,
  Briefcase,
  Mail,
  Award,
  KeyRound,
  CheckCircle,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useIdeas } from '../../context/IdeaContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const { currentUser, changePassword, validatePasswordStrength } = useAuth();
  const { ideas } = useIdeas();

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');

  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  if (!isOpen || !currentUser) return null;

  const myIdeas = ideas.filter(
    (i) => i.authorId === currentUser.id || i.authorName === currentUser.fullName
  );

  const passwordChecks = validatePasswordStrength(newPass);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPass !== confirmNewPass) {
      setPassError(language === 'ar' ? 'كلمات المرور الجديدة غير متطابقة' : 'New passwords do not match');
      return;
    }

    const res = changePassword(currentPass, newPass);
    if (res.success) {
      setPassSuccess(language === 'ar' ? 'تم تحديث كلمة المرور بنجاح!' : 'Password updated successfully!');
      setCurrentPass('');
      setNewPass('');
      setConfirmNewPass('');
    } else {
      setPassError(res.error === 'Current password incorrect'
        ? (language === 'ar' ? 'كلمة المرور الحالية غير صحيحة' : 'Current password incorrect')
        : res.error || 'Error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sjc-maroon via-sjc-maroon-800 to-sjc-maroon-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 end-5 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`}
              alt={currentUser.fullName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-sjc-gold shadow-md"
            />
            <div>
              <h3 className="text-xl font-black text-white">{currentUser.fullName}</h3>
              <p className="text-xs text-sjc-gold/90 font-medium">{currentUser.jobTitle}</p>
              <p className="text-[11px] text-slate-300">{currentUser.department}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 pt-3 gap-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'profile'
                ? 'border-sjc-maroon text-sjc-maroon'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.navProfile}
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'password'
                ? 'border-sjc-maroon text-sjc-maroon'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.changePassword}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {activeTab === 'profile' && (
            <div className="space-y-4">
              
              {/* Stats Card */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-400 block">{t.points}</span>
                  <span className="text-lg font-black text-sjc-maroon">★ {currentUser.points}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-400 block">{language === 'ar' ? 'أفكاري' : 'My Ideas'}</span>
                  <span className="text-lg font-black text-slate-900">{myIdeas.length}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-400 block">{language === 'ar' ? 'الدور' : 'Role'}</span>
                  <span className="text-xs font-bold text-emerald-700 block mt-1">{currentUser.role}</span>
                </div>
              </div>

              {/* User Badges */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2">{t.badges}</h4>
                <div className="flex flex-wrap gap-2">
                  {currentUser.badges.map((b, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl text-xs font-bold bg-sjc-maroon-50 text-sjc-maroon border border-sjc-maroon/20 flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5 text-sjc-gold" />
                      <span>{b}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold">{t.username}:</span>
                  <span className="font-mono">{currentUser.username}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold">{t.email}:</span>
                  <span>{currentUser.email}</span>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-3.5">
              {passError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{passSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.currentPassword}</label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sjc-maroon/30 focus:border-sjc-maroon"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.newPassword}</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sjc-maroon/30 focus:border-sjc-maroon"
                />
                {/* Live validation */}
                <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[10px]">
                  <span className={`block ${passwordChecks.hasLength ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    ✓ {t.reqLength}
                  </span>
                  <span className={`block ${passwordChecks.hasUpper && passwordChecks.hasLower ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    ✓ {t.reqUpper} & {t.reqLower}
                  </span>
                  <span className={`block ${passwordChecks.hasNumber ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    ✓ {t.reqNumber}
                  </span>
                  <span className={`block ${passwordChecks.hasSpecial ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    ✓ {t.reqSpecial}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.confirmPassword}</label>
                <input
                  type="password"
                  required
                  value={confirmNewPass}
                  onChange={(e) => setConfirmNewPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sjc-maroon/30 focus:border-sjc-maroon"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-sjc-maroon hover:bg-sjc-maroon-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4 text-sjc-gold" />
                <span>{t.saveNewPassword}</span>
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
