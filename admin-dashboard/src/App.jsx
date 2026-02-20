import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Departments from './pages/Departments';
import AuthorityDashboard from './pages/AuthorityDashboard';

// Admin specific pages
import AdminIssueList from './pages/AdminIssueList';
import AdminIssueDetails from './pages/AdminIssueDetails';
import AdminMapView from './pages/AdminMapView';
import AdminSettings from './pages/AdminSettings';

// Authority specific pages
import AuthorityIssueList from './pages/AuthorityIssueList';
import AuthorityIssueDetails from './pages/AuthorityIssueDetails';
import AuthorityMapView from './pages/AuthorityMapView';
import AuthoritySettings from './pages/AuthoritySettings';

import DashboardLayout from './layouts/DashboardLayout';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="Admin">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="issues" element={<AdminIssueList />} />
            <Route path="issues/:id" element={<AdminIssueDetails />} />
            <Route path="map" element={<AdminMapView />} />
            <Route path="departments" element={<Departments />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Authority Routes */}
          <Route
            path="/authority"
            element={
              <ProtectedRoute allowedRole="Authority">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AuthorityDashboard />} />
            <Route path="issues" element={<AuthorityIssueList />} />
            <Route path="issues/:id" element={<AuthorityIssueDetails />} />
            <Route path="map" element={<AuthorityMapView />} />
            <Route path="settings" element={<AuthoritySettings />} />
          </Route>

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
