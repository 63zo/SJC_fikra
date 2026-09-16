import React from 'react';
import { Award, Trophy, Medal, Sparkles, Building, Star } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useIdeas } from '../../context/IdeaContext';

export const LeaderboardView: React.FC = () => {
  const { t, language } = useLanguage();
  const { users } = useAuth();
  const { ideas } = useIdeas();

  // Compute dynamic points based on ideas and votes
  const userRankings = users.map((user) => {
    const userIdeas = ideas.filter((i) => i.authorId === user.id || i.authorName === user.fullName);
    const acceptedCount = userIdeas.filter((i) => i.status === 'accepted').length;
    const totalVotes = userIdeas.reduce((sum, i) => sum + i.upvotes, 0);
    const dynamicPoints = user.points + (acceptedCount * 100) + (totalVotes * 5);

    return {
      ...user,
      ideasCount: userIdeas.length,
      acceptedCount,
      totalPoints: dynamicPoints,
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-sjc-maroon via-sjc-maroon-800 to-sjc-maroon-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sjc-gold border border-sjc-gold/30 text-xs font-bold">
            <Trophy className="w-4 h-4" />
            <span>{language === 'ar' ? 'منصة التميز والابتكار المؤسسي' : 'Institutional Excellence Platform'}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            {t.leaderboardTitle}
          </h2>
          <p className="text-xs md:text-sm text-slate-200 max-w-xl leading-relaxed">
            {t.leaderboardSubtitle}
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-sjc-gold/20 border-2 border-sjc-gold flex items-center justify-center text-sjc-gold shadow-lg">
            <Trophy className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Podium for Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {userRankings.slice(0, 3).map((user, idx) => {
          const rank = idx + 1;
          const medals = [
            { border: 'border-sjc-gold', badge: 'bg-sjc-gold text-sjc-slate-dark', title: 'المركز الأول (1st)' },
            { border: 'border-slate-300', badge: 'bg-slate-200 text-slate-800', title: 'المركز الثاني (2nd)' },
            { border: 'border-amber-600', badge: 'bg-amber-600/20 text-amber-800', title: 'المركز الثالث (3rd)' },
          ];

          return (
            <div
              key={user.id}
              className={`p-6 bg-white rounded-3xl border-2 ${medals[idx].border} shadow-md flex flex-col items-center text-center relative space-y-3 hover:scale-[1.02] transition-transform`}
            >
              <span className={`px-3 py-1 rounded-full text-xs font-black ${medals[idx].badge}`}>
                {rank === 1 ? '🥇 #1' : rank === 2 ? '🥈 #2' : '🥉 #3'}
              </span>

              <img
                src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                alt={user.fullName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-sjc-gold shadow-sm"
              />

              <div>
                <h4 className="text-base font-bold text-slate-900 line-clamp-1">{user.fullName}</h4>
                <p className="text-xs text-slate-500">{user.jobTitle}</p>
                <p className="text-[11px] text-slate-400 font-medium">{user.department}</p>
              </div>

              <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-around text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">{language === 'ar' ? 'الأفكار' : 'Ideas'}</span>
                  <span className="font-bold text-slate-800">{user.ideasCount}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">{language === 'ar' ? 'المعتمدة' : 'Accepted'}</span>
                  <span className="font-bold text-emerald-600">{user.acceptedCount}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">{t.points}</span>
                  <span className="font-black text-sjc-maroon">{user.totalPoints}</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap justify-center gap-1">
                {user.badges.map((b, i) => (
                  <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sjc-maroon-50 text-sjc-maroon">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard Table */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          {language === 'ar' ? 'جدول الترتيب العام للمبتكرين' : 'Overall Innovator Rankings'}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[11px]">
                <th className="py-3 px-4 text-start">{t.rank}</th>
                <th className="py-3 px-4 text-start">{t.innovator}</th>
                <th className="py-3 px-4 text-start">{t.department}</th>
                <th className="py-3 px-4 text-center">{language === 'ar' ? 'الأفكار المطروحة' : 'Submitted Ideas'}</th>
                <th className="py-3 px-4 text-center">{language === 'ar' ? 'الأفكار المعتمدة' : 'Accepted'}</th>
                <th className="py-3 px-4 text-center">{t.points}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {userRankings.map((user, index) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-black text-sjc-maroon">
                    {index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : index + 1}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                        alt={user.fullName}
                        className="w-7 h-7 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{user.fullName}</p>
                        <p className="text-[10px] text-slate-400">{user.jobTitle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{user.department}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-800">{user.ideasCount}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-600">{user.acceptedCount}</td>
                  <td className="py-3.5 px-4 text-center font-black text-sjc-maroon text-sm">
                    ★ {user.totalPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
