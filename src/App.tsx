import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import LandingPage from './components/LandingPage';
import RiskAssessment from './components/RiskAssessment';
import PortfolioImport from './components/PortfolioImport';
import PortfolioAllocation from './components/PortfolioAllocation';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/risk-assessment" element={<RiskAssessment />} />
            <Route path="/portfolio-import" element={<PortfolioImport />} />
            <Route path="/portfolio-allocation" element={<PortfolioAllocation />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Layout>
      </Router>
    </Provider>
  );
}

export default App;