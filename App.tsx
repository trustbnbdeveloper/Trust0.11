import React, { useState } from 'react';
import { UserRole } from './types';
import { Landing } from './views/Landing';
import { OwnerDashboard } from './views/OwnerDashboard';
import { AdminDashboard } from './views/AdminDashboard';
import { GuestApp } from './views/GuestApp';
import { GuestLanding } from './views/GuestLanding';
import { SecurityGateway } from './components/SecurityGateway';

function App() {
  const [currentView, setCurrentView] = useState<UserRole>(UserRole.PUBLIC);
  const [pendingRole, setPendingRole] = useState<'OWNER' | 'ADMIN' | null>(null);
  const [activeTripId, setActiveTripId] = useState<string | null>(null); // Track if guest is in "Active Trip" mode

  const handleLoginInitiate = (role: 'OWNER' | 'ADMIN' | 'GUEST') => {
    if (role === 'GUEST') {
      // Guests bypass the heavy "Swiss Bank" security visual for "Frictionless Hospitality"
      // In a real app, they would enter a booking code here.
      setCurrentView(UserRole.GUEST);
    } else {
      // Owners and Admins go through the rigorous security check
      setPendingRole(role);
    }
  };

  const handleSecurityComplete = () => {
    if (pendingRole) {
      setCurrentView(pendingRole === 'OWNER' ? UserRole.OWNER : UserRole.ADMIN);
      setPendingRole(null);
    }
  };

  const handleLogout = () => {
    setCurrentView(UserRole.PUBLIC);
  };

  return (
    <div className="antialiased text-gray-900 dark:text-white">

      {/* Security Gateway Overlay */}
      {pendingRole && (
        <SecurityGateway
          onComplete={handleSecurityComplete}
          targetRole={pendingRole}
        />
      )}

      {currentView === UserRole.PUBLIC && !pendingRole && (
        <Landing onLogin={handleLoginInitiate} />
      )}

      {currentView === UserRole.GUEST && (
        activeTripId ? (
          <GuestApp
            onLogout={handleLogout}
            onBack={() => setActiveTripId(null)}
          />
        ) : (
          <GuestLanding
            onLogout={handleLogout}
            onSelectTrip={(id) => setActiveTripId(id)}
          />
        )
      )}

      {currentView === UserRole.OWNER && !pendingRole && (
        <>
          <OwnerDashboard />
          <div className="fixed bottom-4 left-4 z-50">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-800 text-white text-xs rounded shadow-lg hover:bg-gray-700 font-mono"
            >
              Secure Logoff
            </button>
          </div>
        </>
      )}

      {currentView === UserRole.ADMIN && !pendingRole && (
        <AdminDashboard onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;