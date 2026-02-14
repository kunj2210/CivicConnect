import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import IssueList from './pages/IssueList';
import MapView from './pages/MapView';
import DashboardLayout from './layouts/DashboardLayout';

const Departments = () => <div className="text-xl p-8">Departments Management (Mock) - List of municipal depts.</div>;
const Settings = () => <div className="text-xl p-8">System Settings (Mock) - User roles, Configuration.</div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="issues" element={<IssueList />} />
          <Route path="map" element={<MapView />} />
          <Route path="departments" element={<Departments />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Redirect root to dashboard or login */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
