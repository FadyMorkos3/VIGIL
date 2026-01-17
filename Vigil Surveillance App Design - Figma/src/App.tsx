import { useState, useEffect } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { ModernSecurityLayout } from "./components/ModernSecurityLayout";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./components/ThemeProvider";

type UserRole = "admin" | "officer" | "security" | null;

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('live');
  const [userName, setUserName] = useState('');
  const [offlineMode, setOfflineMode] = useState(false);

  const handleLogin = (role: UserRole) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
    setCurrentView('live');
    // Set user name based on role
    if (role === 'admin') setUserName('Admin User');
    else if (role === 'officer') setUserName('Officer Smith');
    else setUserName('Chief Martinez');
    // Check for offline mode
    setOfflineMode(localStorage.getItem('offlineMode') === 'true');
  };

  const handleLogout = () => {
    setCurrentRole(null);
    setIsAuthenticated(false);
    setCurrentView('live');
    setUserName('');
    setOfflineMode(false);
    localStorage.removeItem('offlineMode');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
  };

  return (
    <ThemeProvider>
      {!isAuthenticated || !currentRole ? (
        <>
          <LoginScreen onLogin={handleLogin} />
          <Toaster position="top-right" />
        </>
      ) : (
        <>
          <ModernSecurityLayout
            role={currentRole as 'admin' | 'officer' | 'security'}
            onLogout={handleLogout}
            onNavigate={setCurrentView}
            currentView={currentView}
            userName={userName}
            offlineMode={offlineMode}
          />
          <Toaster position="top-right" className="mt-16" />
        </>
      )}
    </ThemeProvider>
  );
}