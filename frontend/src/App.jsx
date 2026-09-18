import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import DashboardLayout from './components/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardMainPage from './pages/DashboardMainPage';
import MapPage from './pages/MapPage';
import ReportWastePage from './pages/ReportWastePage';
import AIClassificationPage from './pages/AIClassificationPage';
import BinDetailsPage from './pages/BinDetailsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Dashboard Routes with Layout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardMainPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="report" element={<ReportWastePage />} />
          <Route path="ai" element={<AIClassificationPage />} />
          <Route path="bin/:id" element={<BinDetailsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          
          {/* Fallbacks for menu items that don't have designs yet */}
          <Route path="notifications" element={<div className="p-8">Notifications - Coming Soon</div>} />
          <Route path="settings" element={<div className="p-8">Settings - Coming Soon</div>} />
        </Route>
        
        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
