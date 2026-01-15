import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

// Components
import { Navigation } from './components/Navigation';

// Pages
import { Dashboard } from './pages/Dashboard';
import { PatientManagement } from './pages/PatientManagement';
import { PatientDetails } from './pages/PatientDetails'; // ✅ NEW: Patient Details Page
import { ImageManagement } from './pages/ImageManagement';
import { StaffManagement } from './pages/StaffManagement';
import { Reports } from './pages/Reports';
import { Login } from './pages/Login';

// Props type for ProtectedRoute
interface ProtectedRouteProps {
  children: React.ReactElement;
}

// Protected Route Wrapper
function ProtectedRoute({ children }: ProtectedRouteProps) {
  const staffId = localStorage.getItem('staffId');
  if (!staffId) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Layout with Navigation
interface LayoutProps {
  children: React.ReactNode;
}

function ProtectedLayout({ children }: LayoutProps) {
  return (
    <>
      <Navigation />
      {children}
    </>
  );
}

// QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* ✅ PUBLIC: Login Page */}
          <Route path="/login" element={<Login />} />

          {/* ✅ PROTECTED: Dashboard */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          {/* ✅ PROTECTED: Patient Management */}
          <Route
            path="/patients"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <PatientManagement />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          {/* ✅ PROTECTED: Patient Details (NEW) */}
          <Route
            path="/patients/:patientId"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <PatientDetails />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          {/* ✅ PROTECTED: Image Management */}
          <Route
            path="/images"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <ImageManagement />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          {/* ✅ PROTECTED: Staff Management */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <StaffManagement />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          {/* ✅ PROTECTED: Reports */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Reports />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          {/* ✅ Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
