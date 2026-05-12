import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Landing from './pages/Landing';
import MainApp from './pages/MainApp';
import AddApplication from './pages/AddApplication';
import ApplicationDetail from './pages/ApplicationDetail';


// Redirects /applications/:id → /app/:id
function LegacyDetailRedirect() {
  const { id } = useParams();
  return <Navigate to={`/app/${id}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/app" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
          <Route path="/app/new" element={<ProtectedRoute><AddApplication /></ProtectedRoute>} />
          <Route path="/app/:id" element={<ProtectedRoute><ApplicationDetail /></ProtectedRoute>} />

          {/* Legacy redirects */}
          <Route path="/dashboard" element={<Navigate to="/app" replace />} />
          <Route path="/applications" element={<Navigate to="/app" replace />} />
          <Route path="/applications/new" element={<Navigate to="/app/new" replace />} />
          <Route path="/applications/:id" element={<LegacyDetailRedirect />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
