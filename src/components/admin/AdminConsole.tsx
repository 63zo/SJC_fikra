import React, { useState } from 'react';
import {
  KeyRound,
  Building,
  Briefcase,
  Layers,
  Bot,
  Plus,
  Trash2,
  CheckCircle,
  Save,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useIdeas } from '../../context/IdeaContext';

export const AdminConsole: React.FC = () => {
  const { t, language } = useLanguage();
  const {
    departments,
    jobTitles,
    categories,
    geminiApiKey,
    setGeminiApiKey,
    addDepartment,
    deleteDepartment,
    addJobTitle,
    deleteJobTitle,
    addCategory,
    deleteCategory,
  } = useIdeas();

  const [activeTab, setActiveTab] = useState<'departments' | 'jobs' | 'categories' | 'ai'>('departments');

  // New Department Form State
  const [newDeptNameAr, setNewDeptNameAr] = useState('');
  const [newDeptNameEn, setNewDeptNameEn] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');

  // New Job Title Form State
  const [newJobNameAr, setNewJobNameAr] = useState('');
  const [newJobNameEn, setNewJobNameEn] = useState('');

  // New Category Form State
  const [newCatNameAr, setNewCatNameAr] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatColor, setNewCatColor] = useState('#8A1538');

  // AI Key state
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
  const [aiSavedSuccess, setAiSavedSuccess] = useState(false);

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptNameAr.trim() || !newDeptNameEn.trim()) return;

    addDepartment({
      nameAr: newDeptNameAr.trim(),
      nameEn: newDeptNameEn.trim(),
      code: newDeptCode.trim().toUpperCase() || 'NEW',
    });

    setNewDeptNameAr('');
    setNewDeptNameEn('');
    setNewDeptCode('');
  };

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobNameAr.trim() || !newJobNameEn.trim()) return;

    addJobTitle({
      nameAr: newJobNameAr.trim(),
      nameEn: newJobNameEn.trim(),
    });

    setNewJobNameAr('');
    setNewJobNameEn('');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameAr.trim() || !newCatNameEn.trim()) return;

    addCategory({
      nameAr: newCatNameAr.trim(),
      nameEn: newCatNameEn.trim(),
      color: newCatColor,
      icon: 'Lightbulb',
    });

    setNewCatNameAr('');
    setNewCatNameEn('');
  };

  const handleSaveAISettings = (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiApiKey(apiKeyInput.trim());
    setAiSavedSuccess(true);
    setTimeout(() => setAiSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Admin Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-sjc-maroon-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sjc-gold border border-sjc-gold/30 text-xs font-bold">
            <KeyRound className="w-4 h-4" />
            <span>{language === 'ar' ? 'لوحة تحكم المشرف العام' : 'System Administrator Console'}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            {t.adminTitle}
          </h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-xl leading-relaxed">
            {t.adminSubtitle}
          </p>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'departments'
              ? 'bg-sjc-maroon text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>{t.tabDepartments} ({departments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'jobs'
              ? 'bg-sjc-maroon text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>{t.tabJobTitles} ({jobTitles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'categories'
              ? 'bg-sjc-maroon text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t.tabCategories} ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ai'
              ? 'bg-sjc-maroon text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>{t.tabAISettings}</span>
        </button>
      </div>

      {/* TAB 1: DEPARTMENTS & COURTS */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Add Department Form */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-sjc-maroon" />
              <span>{t.addDeptBtn}</span>
            </h3>

            <form onSubmit={handleAddDepartment} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.deptNameAr}</label>
                <input
                  type="text"
                  required
                  value={newDeptNameAr}
                  onChange={(e) => setNewDeptNameAr(e.target.value)}
                  placeholder="مثال: إدارة الخدمات المشتركة"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sjc-maroon/30 focus:border-sjc-maroon"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.deptNameEn}</label>
                <input
                  type="text"
                  required
                  value={newDeptNameEn}
                  onChange={(e) => setNewDeptNameEn(e.target.value)}
                  placeholder="e.g. Shared Services Department"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sjc-maroon/30 focus:border-sjc-maroon"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.deptCode}</label>
                <input
                  type="text"
                  value={newDeptCode}
                  onChange={(e) => setNewDeptCode(e.target.value)}
                  placeholder="e.g. SSD"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sjc-maroon/30 focus:border-sjc-maroon"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-sjc-maroon hover:bg-sjc-maroon-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-sjc-gold" />
                <span>{t.saveBtn}</span>
              </button>
            </form>
          </div>

          {/* Department List */}
          <div className="lg:col-span-2 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'ar' ? 'الإدارات والمحاكم المعتمدة في النظام' : 'Registered Departments & Courts'}
            </h3>

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4 transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">
                      {dept.nameAr}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {dept.nameEn} <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[10px] ms-1">{dept.code}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => deleteDepartment(dept.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title={t.deleteBtn}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: JOB TITLES */}
      {activeTab === 'jobs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-sjc-maroon" />
              <span>{t.addJobBtn}</span>
            </h3>

            <form onSubmit={handleAddJob} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.jobNameAr}</label>
                <input
                  type="text"
                  required
                  value={newJobNameAr}
                  onChange={(e) => setNewJobNameAr(e.target.value)}
                  placeholder="مثال: خبير أمن سيبراني"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.jobNameEn}</label>
                <input
                  type="text"
                  required
                  value={newJobNameEn}
                  onChange={(e) => setNewJobNameEn(e.target.value)}
                  placeholder="e.g. Cybersecurity Expert"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-sjc-maroon hover:bg-sjc-maroon-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-sjc-gold" />
                <span>{t.saveBtn}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'ar' ? 'المسميات الوظيفية المسجلة' : 'Registered Job Titles'}
            </h3>

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {jobTitles.map((job) => (
                <div
                  key={job.id}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4 transition-colors"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{job.nameAr}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{job.nameEn}</p>
                  </div>

                  <button
                    onClick={() => deleteJobTitle(job.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title={t.deleteBtn}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-sjc-maroon" />
              <span>{language === 'ar' ? 'إضافة مجال ابتكاري جديد' : 'Add Innovation Category'}</span>
            </h3>

            <form onSubmit={handleAddCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{language === 'ar' ? 'اسم المجال (بالعربية)' : 'Category Name (AR)'}</label>
                <input
                  type="text"
                  required
                  value={newCatNameAr}
                  onChange={(e) => setNewCatNameAr(e.target.value)}
                  placeholder="مثال: الأمن السيبراني القضائي"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{language === 'ar' ? 'اسم المجال (بالإنجليزية)' : 'Category Name (EN)'}</label>
                <input
                  type="text"
                  required
                  value={newCatNameEn}
                  onChange={(e) => setNewCatNameEn(e.target.value)}
                  placeholder="e.g. Judicial Cybersecurity"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-sjc-maroon hover:bg-sjc-maroon-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-sjc-gold" />
                <span>{t.saveBtn}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'ar' ? 'مجالات الابتكار المعتمدة' : 'Active Innovation Categories'}
            </h3>

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    ></div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{cat.nameAr}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{cat.nameEn}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: AI SETTINGS */}
      {activeTab === 'ai' && (
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sjc-maroon-50 text-sjc-maroon rounded-2xl">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {t.tabAISettings}
              </h3>
              <p className="text-xs text-slate-500">
                {t.aiEngineActive}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{t.aiEngineActive}</span>
          </div>

          <form onSubmit={handleSaveAISettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.geminiApiKeyLabel}
              </label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={t.geminiApiKeyPlaceholder}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-sjc-maroon/30 focus:border-sjc-maroon"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {language === 'ar'
                  ? 'يمكنك تشغيل المنظومة مباشرة بدون أي مفتاح، حيث يعمل محرك المعالجة المدمج ذاتياً.'
                  : 'The system runs out of the box with built-in client NLP algorithms.'}
              </p>
            </div>

            {aiSavedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{language === 'ar' ? 'تم حفظ الإعدادات بنجاح!' : 'AI settings saved successfully!'}</span>
              </div>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-sjc-maroon hover:bg-sjc-maroon-800 text-white font-bold text-xs shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-sjc-gold" />
              <span>{t.saveAISettings}</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
