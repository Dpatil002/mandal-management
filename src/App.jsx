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

export function App() {
  const { isAuthenticated } = useAuth();

  // Navigation states
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [publicTab, setPublicTab] = useState('home'); // 'home', 'schedule', 'vargani', 'committee'
  const [organiserTab, setOrganiserTab] = useState('home'); // 'home', 'vargani', 'expenses', 'tasks', 'dhol-tasha'

  // Modals & Drawers
  const [isAddVarganiOpen, setIsAddVarganiOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isEditPublicOpen, setIsEditPublicOpen] = useState(false);
  const [editPublicTab, setEditPublicTab] = useState('cultural');
  const [isOrganisersOpen, setIsOrganisersOpen] = useState(false);
  const [proofModalData, setProofModalData] = useState({ isOpen: false, imageUrl: '', title: '' });

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
                onOpenAddVargani={() => setIsAddVarganiOpen(true)}
                onOpenAddExpense={() => setIsAddExpenseOpen(true)}
                onOpenReport={() => setIsReportOpen(true)}
                onOpenEditPublic={handleOpenEditPublic}
                onOpenOrganisers={() => setIsOrganisersOpen(true)}
                onOpenProof={handleOpenProof}
                onNavigateToVargani={() => setOrganiserTab('vargani')}
                onNavigateToExpenses={() => setOrganiserTab('expenses')}
                onNavigateToTasks={() => setOrganiserTab('tasks')}
                onNavigateToDhol={() => setOrganiserTab('dhol-tasha')}
              />
            )}
            {organiserTab === 'vargani' && (
              <OrganiserVargani
                onOpenAddVargani={() => setIsAddVarganiOpen(true)}
                onOpenProof={handleOpenProof}
              />
            )}
            {organiserTab === 'expenses' && (
              <OrganiserExpenses
                onOpenAddExpense={() => setIsAddExpenseOpen(true)}
                onOpenProof={handleOpenProof}
              />
            )}
            {organiserTab === 'tasks' && <OrganiserTasks />}
            {organiserTab === 'dhol-tasha' && <OrganiserDholTasha />}
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
        onClose={() => setIsAddVarganiOpen(false)}
        onOpenReceipt={() => {}}
      />

      <AddExpenseDrawer
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
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
