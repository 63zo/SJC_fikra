import React from 'react';
import { Shield, Sparkles, Award, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      {/* Top Footer Banner */}
      <div className="bg-sjc-maroon/20 border-b border-sjc-maroon/30 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center md:text-start">
            <div className="w-10 h-10 rounded-xl bg-sjc-maroon flex items-center justify-center text-sjc-gold border border-sjc-gold/40 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                {language === 'ar' ? 'منظومة الابتكار القضائي التشاركي' : 'Participatory Judicial Innovation System'}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'معاً نحو قضاء ريادي ذكي وسريع يحقق العدالة الناجزة' : 'Together towards a pioneering, smart, and swift judiciary'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-sjc-maroon/40 text-sjc-gold border border-sjc-gold/30 font-medium">
              ★ {language === 'ar' ? 'رؤية قطر الوطنية 2030' : 'Qatar National Vision 2030'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: About */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sjc-maroon flex items-center justify-center text-sjc-gold font-bold">
                ف
              </div>
              <span className="text-lg font-bold text-white">
                {t.appName} - {t.portalTitle}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              {t.tagline}. {language === 'ar' 
                ? 'تهدف المنظومة إلى استثمار الطاقات الإبداعية لكافة منسوبي المجلس وتطبيق نماذج الذكاء الاصطناعي لتطوير وتحسين بيئة التقاضي والعمل القضائي.'
                : 'The system aims to harness the creative potential of all SJC employees and deploy AI models to advance litigation and court operations.'}
            </p>
          </div>

          {/* Col 2: Official Portals */}
          <div>
            <h5 className="text-xs font-bold text-sjc-gold uppercase tracking-wider mb-3">
              {language === 'ar' ? 'روابط المنظومة القضائية' : 'Judicial System Links'}
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a
                  href="https://www.sjc.gov.qa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sjc-gold transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>{language === 'ar' ? 'البوابة الرسمية للمجلس الأعلى للقضاء' : 'SJC Official Portal'}</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.sjc.gov.qa/ar/Pages/OrganizationStructure.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sjc-gold transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>{language === 'ar' ? 'الهيكل التنظيمي للمجلس' : 'Organizational Structure'}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div>
            <h5 className="text-xs font-bold text-sjc-gold uppercase tracking-wider mb-3">
              {language === 'ar' ? 'الدعم والإشراف' : 'Support & Supervision'}
            </h5>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              {t.footerSupport}
            </p>
            <p className="text-xs text-slate-500">
              Email: it.support@sjc.gov.qa
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>{t.footerRights}</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{language === 'ar' ? 'منظومة فكرة نشطة وآمنة' : 'Fikra Platform Active & Secure'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
