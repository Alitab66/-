
import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { View } from './types';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import EmployeesView from './views/EmployeesView';
import ExpensesView from './views/ExpensesView';
import DetailsView from './views/DetailsView';
import SettingsView from './views/SettingsView';

const AppContent: React.FC = () => {
  const { state } = useAppContext();
  const [activeView, setActiveView] = useState<View>(View.Expenses);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  const renderView = () => {
    switch (activeView) {
      case View.Expenses:
        return <ExpensesView />;
      case View.Details:
        return <DetailsView />;
      case View.Employees:
        return <EmployeesView />;
      case View.Settings:
        return <SettingsView />;
      default:
        return <ExpensesView />;
    }
  };

  return (
    <div className="min-h-screen text-white">
      <Header />
      <main className="pt-20 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-in">
          {renderView()}
        </div>
      </main>
      <BottomNav activeView={activeView} setActiveView={setActiveView} />
      <style>{`
          @keyframes fade-in {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
