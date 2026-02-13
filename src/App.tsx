import React, { useState, useEffect } from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from './graphql/client';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';

function AppContent() {
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    if (showDashboard) {
      window.scrollTo(0, 0);
    }
  }, [showDashboard]);

  if (showDashboard) {
    return <Dashboard onBack={() => setShowDashboard(false)} />;
  }
  return <LandingPage onViewDemo={() => setShowDashboard(true)} />;
}

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AppContent />
    </ApolloProvider>
  );
}

export default App;
