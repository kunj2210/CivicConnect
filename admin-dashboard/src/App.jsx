import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import IssueList from './pages/IssueList';
import IssueDetails from './pages/IssueDetails';
import MapView from './pages/MapView';
import Departments from './pages/Departments';
import Settings from './pages/Settings';
import DashboardLayout from './layouts/DashboardLayout';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="issues" element={<IssueList />} />
            <Route path="issues/:id" element={<IssueDetails />} />
            <Route path="map" element={<MapView />} />
            <Route path="departments" element={<Departments />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Redirect root to dashboard or login */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
