import React, { useState } from 'react';
import {
  Lightbulb,
  Globe,
  LogOut,
  LogIn,
  Shield,
  Award,
  BarChart3,
  Compass,
  PlusCircle,
  Menu,
  X,
  KeyRound,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSubmitModal: () => void;
  onOpenAuthModal: (mode: 'login' | 'signup' | 'forgot') => void;
  onOpenProfileModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSubmitModal,
  onOpenAuthModal,
  onOpenProfileModal,
}) => {
  const { t, language, toggleLanguage } = useLanguage();
  const { currentUser, logout, switchDemoRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'explore', label: t.navExplore, icon: Compass },
    { id: 'dashboard', label: t.navDashboard, icon: BarChart3 },
    { id: 'leaderboard', label: t.navLeaderboard, icon: Award },
    ...(currentUser?.role === 'committee' || currentUser?.role === 'admin'
      ? [{ id: 'committee', label: t.navCommittee, icon: Shield }]
      : []),
    ...(currentUser?.role === 'admin'
      ? [{ id: 'admin', label: t.navAdmin, icon: KeyRound }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-200">
      {/* Top Gold & Maroon National Emblem Bar */}
      <div className="bg-gradient-to-r from-sjc-maroon via-sjc-maroon-800 to-sjc-maroon text-white text-[11px] py-1.5 px-3 sm:px-8 flex items-center justify-between border-b border-sjc-gold/30">
        <div className="flex items-center gap-1.5 truncate max-w-[55%] sm:max-w-none">
          <span className="inline-block w-2 h-2 rounded-full bg-sjc-gold shrink-0 animate-pulse"></span>
          <span className="font-bold tracking-wide truncate">
            {t.portalTitle}
          </span>
        </div>

        {/* Quick Demo Role Switcher */}
        <div className="flex items-center gap-1 shrink-0 text-[10px] sm:text-xs">
          <span className="hidden md:inline text-sjc-gold/90 font-medium">
            {t.switchRole}
          </span>
          <div className="flex items-center bg-black/25 rounded-lg p-0.5 border border-sjc-gold/30">
            {(['employee', 'committee', 'admin'] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => switchDemoRole(role)}
                className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold transition-all ${
                  currentUser?.role === role
                    ? 'bg-sjc-gold text-sjc-slate-dark shadow-xs'
                    : 'text-slate-200 hover:text-white'
                }`}
                title={`Switch demo role to ${role}`}
              >
                {role === 'employee'
                  ? language === 'ar' ? 'موظف' : 'Emp'
                  : role === 'committee'
                  ? language === 'ar' ? 'لجنة' : 'Comm'
                  : language === 'ar' ? 'مشرف' : 'Admin'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo and Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab('explore')}
              className="flex items-center gap-2.5 text-start group focus:outline-none"
            >
              {/* SJC Maroon Emblem Shield */}
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-sjc-maroon to-sjc-maroon-900 flex items-center justify-center shadow-md border-2 border-sjc-gold/60 shrink-0 group-hover:scale-105 transition-transform">
                <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-sjc-gold animate-pulse-subtle" />
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-sjc-gold rounded-full flex items-center justify-center text-[8px] font-black text-sjc-maroon-950">
                  ★
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-sjc-maroon">
                    {t.appName}
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase rounded bg-sjc-maroon-50 text-sjc-maroon border border-sjc-maroon/20">
                    SJC
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium line-clamp-1 max-w-[140px] sm:max-w-xs">
                  {t.tagline}
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-sjc-maroon text-white shadow-md shadow-sjc-maroon/20'
                      : 'text-slate-600 hover:text-sjc-maroon hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sjc-gold' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Buttons & Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Submit Idea CTA Button */}
            <button
              onClick={onOpenSubmitModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-sjc-maroon to-sjc-maroon-800 hover:from-sjc-maroon-800 hover:to-sjc-maroon-900 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-sjc-maroon/25 hover:shadow-lg transition-all hover:scale-[1.02] border border-sjc-gold/40"
            >
              <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 text-sjc-gold shrink-0" />
              <span className="hidden sm:inline">{t.navSubmit}</span>
              <span className="sm:hidden">{language === 'ar' ? 'فكرة +' : '+ Idea'}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-sjc-maroon bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sjc-gold" />
              <span className="text-[11px] sm:text-xs">{t.switchLang}</span>
            </button>

            {/* User Profile or Login */}
            {currentUser ? (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  onClick={onOpenProfileModal}
                  className="flex items-center gap-1.5 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 border border-slate-200 transition-all"
                  title="Profile"
                >
                  <img
                    src={currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`}
                    alt={currentUser.fullName}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-cover border border-sjc-gold/50 shadow-xs"
                  />
                  <div className="hidden md:block text-start">
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">
                      {currentUser.fullName}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-sjc-maroon font-semibold">
                      <span>★ {currentUser.points} {language === 'ar' ? 'نقطة' : 'pts'}</span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={logout}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  title={t.logout}
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenAuthModal('login')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-sjc-maroon bg-sjc-maroon-50 hover:bg-sjc-maroon-100 border border-sjc-maroon/20 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.login}</span>
              </button>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-sjc-maroon hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top duration-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-sjc-maroon text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-sjc-gold' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
