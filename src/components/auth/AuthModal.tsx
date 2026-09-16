import React, { useState } from 'react';
import {
  X,
  Lock,
  User,
  Mail,
  Briefcase,
  Building,
  CheckCircle,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useIdeas } from '../../context/IdeaContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { t, language, dir } = useLanguage();
  const { login, signup, recoverPassword, validatePasswordStrength } = useAuth();
  const { departments, jobTitles } = useIdeas();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');

  // Status feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const passwordChecks = validatePasswordStrength(password);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      setIsLoading(false);
      if (res.success) {
        setSuccessMsg(t.loginSuccess);
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setErrorMsg(t.invalidCredentials);
      }
    }, 400);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    if (!jobTitle || !department) {
      setErrorMsg(language === 'ar' ? 'يرجى اختيار المسمى الوظيفي والإدارة' : 'Please select Job Title and Department');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = signup({
        username: username.trim(),
        password,
        fullName: fullName.trim(),
        email: email.trim(),
        jobTitle,
        department,
      });
      setIsLoading(false);

      if (res.success) {
        setSuccessMsg(t.signupSuccess);
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setErrorMsg(res.error === 'User already exists' ? t.userAlreadyExists : res.error || 'Error');
      }
    }, 500);
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const res = recoverPassword(email);
      setIsLoading(false);
      setSuccessMsg(res.message);
    }, 600);
  };

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header with Maroon Accent */}
        <div className="bg-gradient-to-r from-sjc-maroon to-sjc-maroon-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 end-5 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-sjc-gold border border-sjc-gold/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">
                {mode === 'login' ? t.login : mode === 'signup' ? t.signup : t.recoverPassword}
              </h3>
              <p className="text-xs text-sjc-gold/90 font-medium">
                {t.appName} - {t.portalTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* Messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN MODE */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.username} / {t.email}
                </label>
                <div className="relative">
                  <User className="absolute top-3.5 start-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t.usernamePlaceholder}
                    className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sjc-maroon/30 focus:border-sjc-maroon text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {t.password}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setSuccessMsg('');
                      setMode('forgot');
                    }}
                    className="text-xs text-sjc-maroon hover:underline font-semibold"
                  >
                    {t.forgotPassword}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute top-3.5 start-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className="w-full ps-10 pe-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sjc-maroon/30 focus:border-sjc-maroon text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-3 end-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-sjc-maroon hover:bg-sjc-maroon-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-sjc-gold" />
                <span>{isLoading ? (language === 'ar' ? 'جاري التحقق...' : 'Verifying...') : t.login}</span>
              </button>

              <div className="pt-2 text-center text-xs text-slate-600">
                <span>{t.noAccount} </span>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setMode('signup');
                  }}
                  className="font-bold text-sjc-maroon hover:underline"
                >
                  {t.signup}
                </button>
              </div>
            </form>
          )}

          {/* SIGNUP MODE */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.username} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute top-3 start-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t.usernamePlaceholder}
                    className="w-full ps-10 pe-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sjc-maroon/30 focus:border-sjc-maroon text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.fullName} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.fullNamePlaceholder}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sjc-maroon/30 focus:border-sjc-maroon text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.jobTitle} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute top-3 start-3.5 w-4 h-4 text-slate-400" />
                    <select
                      required
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full ps-10 pe-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sjc-maroon/30 focus:border-sjc-maroon text-xs bg-white"
                    >
                      <option value="">{t.selectJobTitle}</option>
                      {jobTitles.map((job) => (
                        <option key={job.id} value={language === 'ar' ? job.nameAr : job.nameEn}>
                          {language === 'ar' ? job.nameAr : job.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.department} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute top-3 start-3.5 w-4 h-4 text-slate-400" />
                    <select
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full ps-10 pe-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sjc-maroon/30 focus:border-sjc-maroon text-xs bg-white"
                    >
                      <option value="">{t.selectDepartment}</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={language === 'ar' ? dept.nameAr : dept.nameEn}>
                          {language === 'ar' ? dept.nameAr : dept.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.email} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute top-3 start-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="w-full ps-10 pe-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sjc-maroon/30 focus:border-sjc-maroon text-sm"
                  />
                </div>
              </div>

              {/* Password with Strength Criteria */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.password} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute top-3 start-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className="w-full ps-10 pe-10 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sjc-maroon/30 focus:border-sjc-maroon text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-2.5 end-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Checklist */}
                <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px]">
                  <p className="font-bold text-slate-700 mb-1">{t.passwordCriteriaTitle}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-slate-600">
                    <span className={`flex items-center gap-1.5 ${passwordChecks.hasLength ? 'text-emerald-600 font-bold' : ''}`}>
                      <CheckCircle className={`w-3.5 h-3.5 ${passwordChecks.hasLength ? 'text-emerald-600' : 'text-slate-300'}`} />
                      {t.reqLength}
                    </span>
                    <span className={`flex items-center gap-1.5 ${passwordChecks.hasUpper ? 'text-emerald-600 font-bold' : ''}`}>
                      <CheckCircle className={`w-3.5 h-3.5 ${passwordChecks.hasUpper ? 'text-emerald-600' : 'text-slate-300'}`} />
                      {t.reqUpper}
                    </span>
                    <span className={`flex items-center gap-1.5 ${passwordChecks.hasLower ? 'text-emerald-600 font-bold' : ''}`}>
                      <CheckCircle className={`w-3.5 h-3.5 ${passwordChecks.hasLower ? 'text-emerald-600' : 'text-slate-300'}`} />
                      {t.reqLower}
                    </span>
                    <span className={`flex items-center gap-1.5 ${passwordChecks.hasNumber ? 'text-emerald-600 font-bold' : ''}`}>
                      <CheckCircle className={`w-3.5 h-3.5 ${passwordChecks.hasNumber ? 'text-emerald-600' : 'text-slate-300'}`} />
                      {t.reqNumber}
                    </span>
                    <span className={`flex items-center gap-1.5 ${passwordChecks.hasSpecial ? 'text-emerald-600 font-bold' : ''}`}>
                      <CheckCircle className={`w-3.5 h-3.5 ${passwordChecks.hasSpecial ? 'text-emerald-600' : 'text-slate-300'}`} />
                      {t.reqSpecial}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.confirmPassword} <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sjc-maroon/30 focus:border-sjc-maroon text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-sjc-maroon hover:bg-sjc-maroon-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                <ShieldCheck className="w-4 h-4 text-sjc-gold" />
                <span>{isLoading ? (language === 'ar' ? 'جاري الإنشاء...' : 'Creating...') : t.signup}</span>
              </button>

              <div className="pt-2 text-center text-xs text-slate-600">
                <span>{t.haveAccount} </span>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setMode('login');
                  }}
                  className="font-bold text-sjc-maroon hover:underline"
                >
                  {t.login}
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD MODE */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'ar'
                  ? 'أدخل بريدك الإلكتروني المؤسسي المسجل بالمجلس، وسنرسل لك تعليمات ورمز استعادة كلمة المرور فوراً.'
                  : 'Enter your registered SJC work email and we will send you instant recovery instructions.'}
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.email}
                </label>
                <div className="relative">
                  <Mail className="absolute top-3.5 start-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sjc-maroon/30 focus:border-sjc-maroon text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-sjc-maroon hover:bg-sjc-maroon-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4 text-sjc-gold" />
                <span>{isLoading ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...') : t.sendResetLink}</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setMode('login');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-sjc-maroon hover:underline"
                >
                  <BackIcon className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
