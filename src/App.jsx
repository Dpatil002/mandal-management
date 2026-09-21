import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { PublicBottomNav } from './components/PublicBottomNav';
import { OrganiserBottomNav } from './components/OrganiserBottomNav';
import { ReportModal } from './components/ReportModal';
import { ProofModal } from './components/ProofModal';
import { AddVarganiDrawer } from './components/AddVarganiDrawer';
import { AddExpenseDrawer } from './components/AddExpenseDrawer';
import { EditPublicViewDrawer } from './components/EditPublicViewDrawer';
import { OrganisersDrawer } from './components/OrganisersDrawer';

// Public Pages
import { PublicHome } from './pages/PublicHome';
import { PublicPayVargani } from './pages/PublicPayVargani';
import { PublicTodaySchedule } from './pages/PublicTodaySchedule';
import { PublicMandalCommittee } from './pages/PublicMandalCommittee';

// Organiser Pages
import { OrganiserLogin } from './pages/OrganiserLogin';
import { OrganiserDashboard } from './pages/OrganiserDashboard';
import { OrganiserVargani } from './pages/OrganiserVargani';
import { OrganiserExpenses } from './pages/OrganiserExpenses';
import { OrganiserTasks } from './pages/OrganiserTasks';
import { OrganiserDholTasha } from './pages/OrganiserDholTasha';
import { OrganiserWinners } from './pages/OrganiserWinners';

export function App() {
  const { isAuthenticated } = useAuth();

  // Navigation states
  const [isLoginOpen, setIsLoginOpen] = useState(() => {
    return window.location.hash === '#/login';
  });
  const [publicTab, setPublicTab] = useState(() => {
    if (window.location.hash === '#/pay' || window.location.hash === '#/vargani') return 'vargani';
    if (window.location.hash === '#/schedule') return 'schedule';
    if (window.location.hash === '#/committee') return 'committee';
    return 'home';
  });
  const [organiserTab, setOrganiserTab] = useState('home'); // 'home', 'vargani', 'expenses', 'tasks', 'dhol-tasha', 'winners'

  // Sync hash routing on hash change
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/login') {
        setIsLoginOpen(true);
      } else {
        setIsLoginOpen(false);
        if (hash === '#/pay' || hash === '#/vargani') setPublicTab('vargani');
        else if (hash === '#/schedule') setPublicTab('schedule');
        else if (hash === '#/committee') setPublicTab('committee');
        else if (hash === '#/' || hash === '') setPublicTab('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Modals & Drawers
  const [isAddVarganiOpen, setIsAddVarganiOpen] = useState(false);
  const [editingVargani, setEditingVargani] = useState(null);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isEditPublicOpen, setIsEditPublicOpen] = useState(false);
  const [editPublicTab, setEditPublicTab] = useState('cultural');
  const [isOrganisersOpen, setIsOrganisersOpen] = useState(false);
  const [proofModalData, setProofModalData] = useState({ isOpen: false, imageUrl: '', title: '' });

  const handleOpenAddVargani = (item = null) => {
    setEditingVargani(item);
    setIsAddVarganiOpen(true);
  };

  const handleCloseAddVargani = () => {
    setIsAddVarganiOpen(false);
    setEditingVargani(null);
  };

  const handleOpenAddExpense = (item = null) => {
    setEditingExpense(item);
    setIsAddExpenseOpen(true);
  };

  const handleCloseAddExpense = () => {
    setIsAddExpenseOpen(false);
    setEditingExpense(null);
  };

  const handleOpenEditPublic = (tab = 'cultural') => {
    setEditPublicTab(tab);
    setIsEditPublicOpen(true);
  };

  const handleOpenProof = (imageUrl, title) => {
    setProofModalData({ isOpen: true, imageUrl, title });
  };

  const handleCloseProof = () => {
    setProofModalData({ isOpen: false, imageUrl: '', title: '' });
  };

  // If user requested Login Screen specifically
  if (!isAuthenticated && isLoginOpen) {
    return <OrganiserLogin onBackToPublic={() => setIsLoginOpen(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF4ED] text-[#241913] flex flex-col selection:bg-[#8B2616] selection:text-white font-sans">
      {/* Top Mandal Header */}
      <Header
        isOrganiserMode={isAuthenticated}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-4 sm:py-6">
        {isAuthenticated ? (
          /* Organiser Views */
          <>
            {organiserTab === 'home' && (
              <OrganiserDashboard
                onOpenAddVargani={() => handleOpenAddVargani(null)}
                onOpenAddExpense={() => handleOpenAddExpense(null)}
                onOpenReport={() => setIsReportOpen(true)}
                onOpenEditPublic={handleOpenEditPublic}
                onOpenOrganisers={() => setIsOrganisersOpen(true)}
                onOpenProof={handleOpenProof}
                onNavigateToVargani={() => setOrganiserTab('vargani')}
                onNavigateToExpenses={() => setOrganiserTab('expenses')}
                onNavigateToTasks={() => setOrganiserTab('tasks')}
                onNavigateToDhol={() => setOrganiserTab('dhol-tasha')}
                onNavigateToWinners={() => setOrganiserTab('winners')}
              />
            )}
            {organiserTab === 'vargani' && (
              <OrganiserVargani
                onOpenAddVargani={handleOpenAddVargani}
                onOpenProof={handleOpenProof}
              />
            )}
            {organiserTab === 'expenses' && (
              <OrganiserExpenses
                onOpenAddExpense={handleOpenAddExpense}
                onOpenProof={handleOpenProof}
                onOpenReport={() => setIsReportOpen(true)}
              />
            )}
            {organiserTab === 'tasks' && <OrganiserTasks />}
            {organiserTab === 'dhol-tasha' && <OrganiserDholTasha />}
            {organiserTab === 'winners' && (
              <OrganiserWinners onBack={() => setOrganiserTab('home')} />
            )}
          </>
        ) : (
          /* Public Views */
          <>
            {publicTab === 'home' && (
              <PublicHome
                onNavigateToPay={() => setPublicTab('vargani')}
                onNavigateToSchedule={() => setPublicTab('schedule')}
                onNavigateToCommittee={() => setPublicTab('mandal')}
              />
            )}
            {publicTab === 'vargani' && (
              <PublicPayVargani onNavigateHome={() => setPublicTab('home')} />
            )}
            {publicTab === 'schedule' && <PublicTodaySchedule />}
            {(publicTab === 'mandal' || publicTab === 'committee') && (
              <PublicMandalCommittee onOpenLogin={() => setIsLoginOpen(true)} />
            )}
          </>
        )}
      </main>

      {/* Floating Bottom Navigations */}
      {isAuthenticated ? (
        <OrganiserBottomNav activeTab={organiserTab} setActiveTab={setOrganiserTab} />
      ) : (
        <PublicBottomNav
          activeTab={publicTab}
          setActiveTab={setPublicTab}
          onOpenLogin={() => setIsLoginOpen(true)}
        />
      )}

      {/* Modals and Drawers */}
      <AddVarganiDrawer
        isOpen={isAddVarganiOpen}
        editItem={editingVargani}
        onClose={handleCloseAddVargani}
        onOpenReceipt={() => {}}
      />

      <AddExpenseDrawer
        isOpen={isAddExpenseOpen}
        editItem={editingExpense}
        onClose={handleCloseAddExpense}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      <EditPublicViewDrawer
        isOpen={isEditPublicOpen}
        initialTab={editPublicTab}
        onClose={() => setIsEditPublicOpen(false)}
      />

      <OrganisersDrawer
        isOpen={isOrganisersOpen}
        onClose={() => setIsOrganisersOpen(false)}
      />

      <ProofModal
        isOpen={proofModalData.isOpen}
        imageUrl={proofModalData.imageUrl}
        title={proofModalData.title}
        onClose={handleCloseProof}
      />
    </div>
  );
}

export default App;
