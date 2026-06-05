import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import Landing from './pages/Landing';
import ManagerDashboard from './pages/manager/Dashboard';
import MapExplorer from './pages/manager/MapExplorer';
import RouteManager from './pages/manager/RouteManager';
import RoadAnalyzer from './pages/manager/RoadAnalyzer';
import Locations from './pages/manager/Locations';
import Vehicles from './pages/manager/Vehicles';
import WasteCollection from './pages/manager/WasteCollection';
import ManagerComplaints from './pages/manager/Complaints';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import ReportIssue from './pages/citizen/ReportIssue';
import MyComplaints from './pages/citizen/MyComplaints';
import ManagerLayout from './components/common/ManagerLayout';
import CitizenLayout from './components/common/CitizenLayout';
import LoadingScreen from './components/common/LoadingScreen';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { loading } = useAuth();
  if (loading) return <LoadingScreen />;

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Manager Routes */}
        <Route path="/manager" element={<ProtectedRoute role="manager"><ManagerLayout /></ProtectedRoute>}>
          <Route index element={<ManagerDashboard />} />
          <Route path="map" element={<MapExplorer />} />
          <Route path="routes" element={<RouteManager />} />
          <Route path="roads" element={<RoadAnalyzer />} />
          <Route path="locations" element={<Locations />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="collection" element={<WasteCollection />} />
          <Route path="complaints" element={<ManagerComplaints />} />
        </Route>

        {/* Citizen Routes */}
        <Route path="/citizen" element={<ProtectedRoute role="citizen"><CitizenLayout /></ProtectedRoute>}>
          <Route index element={<CitizenDashboard />} />
          <Route path="report" element={<ReportIssue />} />
          <Route path="complaints" element={<MyComplaints />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
