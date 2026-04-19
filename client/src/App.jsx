import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import ListingDetail from './pages/ListingDetail';
import MyListings from './pages/MyListings';
import SecurityDashboard from './pages/SecurityDashboard';
import TwoFactorSetup from './pages/TwoFactorSetup';
import PenTestReport from './pages/PenTestReport';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/create" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
          <Route path="/edit/:id" element={<ProtectedRoute><EditListing /></ProtectedRoute>} />
          <Route path="/my-listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
          <Route path="/security" element={<AdminRoute><SecurityDashboard /></AdminRoute>} />
          <Route path="/setup-2fa" element={<ProtectedRoute><TwoFactorSetup /></ProtectedRoute>} />
          <Route path="/pentest-report" element={<AdminRoute><PenTestReport /></AdminRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
