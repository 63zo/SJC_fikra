import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { IdeaProvider, useIdeas } from './context/IdeaContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { IdeaExplorer } from './components/ideas/IdeaExplorer';
import { SubmitIdeaModal } from './components/ideas/SubmitIdeaModal';
import { IdeaDetailModal } from './components/ideas/IdeaDetailModal';
import { CommitteePortal } from './components/committee/CommitteePortal';
import { AnalyticsDashboard } from './components/dashboard/AnalyticsDashboard';
import { AdminConsole } from './components/admin/AdminConsole';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { Idea } from './types';

const AppContent: React.FC = () => {
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();
  const { ideas } = useIdeas();

  // Active View Tab: 'explore' | 'dashboard' | 'committee' | 'admin' | 'leaderboard'
  const [activeTab, setActiveTab] = useState<string>('explore');

  // Modals state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleOpenAuth = (mode: 'login' | 'signup' | 'forgot') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenIdeaDetails = (idea: Idea) => {
    setSelectedIdea(idea);
    setDetailModalOpen(true);
  };

  const handleOpenIdeaDetailsById = (ideaId: string) => {
    const found = ideas.find(i => i.id === ideaId);
    if (found) {
      setSelectedIdea(found);
      setDetailModalOpen(true);
    }
  };

  const handleOpenEvaluate = (idea: Idea) => {
    setSelectedIdea(idea);
    setActiveTab('committee');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-sjc-maroon selection:text-white">
      
      {/* Sticky Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSubmitModal={() => setSubmitModalOpen(true)}
        onOpenAuthModal={handleOpenAuth}
        onOpenProfileModal={() => setProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'explore' && (
          <IdeaExplorer
            onOpenSubmitModal={() => setSubmitModalOpen(true)}
            onOpenDetails={handleOpenIdeaDetails}
            onOpenEvaluate={handleOpenEvaluate}
          />
        )}

        {activeTab === 'dashboard' && (
          <AnalyticsDashboard
            onOpenDetails={handleOpenIdeaDetails}
          />
        )}

        {activeTab === 'committee' && (
          <CommitteePortal
            onOpenDetails={handleOpenIdeaDetails}
          />
        )}

        {activeTab === 'admin' && (
          <AdminConsole />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Modals */}
      <SubmitIdeaModal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onSelectExistingIdea={handleOpenIdeaDetailsById}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      <IdeaDetailModal
        idea={selectedIdea}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedIdea(null);
        }}
        onOpenEvaluate={handleOpenEvaluate}
      />

      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

    </div>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <IdeaProvider>
          <AppContent />
        </IdeaProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
