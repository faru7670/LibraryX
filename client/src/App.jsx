import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './components/layout/DashboardLayout';
import { Loader2 } from 'lucide-react';

// Lazy load all pages — each page loads only when navigated to
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const DashboardRouter = lazy(() => import('./pages/dashboard/DashboardRouter'));
const BooksPage = lazy(() => import('./pages/books/BooksPage'));
const IssuesPage = lazy(() => import('./pages/issues/IssuesPage'));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'));
const ReservationsPage = lazy(() => import('./pages/reservations/ReservationsPage'));
const ActivityPage = lazy(() => import('./pages/activity/ActivityPage'));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));
const UsersPage = lazy(() => import('./pages/users/UsersPage'));

// Loading fallback
function PageLoader() {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-7 h-7 animate-spin text-violet-500" />
                <p className="text-xs text-gray-400 font-medium">Loading...</p>
            </div>
        </div>
    );
}

// Protected route wrapper
function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) return <PageLoader />;
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
    return children;
}

// App routes
function AppRoutes() {
    const { user } = useAuth();

    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
                <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

                <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><DashboardRouter /></Suspense>} />
                    <Route path="/books" element={<Suspense fallback={<PageLoader />}><BooksPage /></Suspense>} />
                    <Route path="/my-books" element={<Suspense fallback={<PageLoader />}><BooksPage /></Suspense>} />
                    <Route path="/issues" element={<ProtectedRoute allowedRoles={['librarian', 'admin']}><Suspense fallback={<PageLoader />}><IssuesPage /></Suspense></ProtectedRoute>} />
                    <Route path="/faculty-issues" element={<ProtectedRoute allowedRoles={['faculty']}><Suspense fallback={<PageLoader />}><IssuesPage /></Suspense></ProtectedRoute>} />
                    <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<PageLoader />}><UsersPage /></Suspense></ProtectedRoute>} />
                    <Route path="/analytics" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<PageLoader />}><DashboardRouter /></Suspense></ProtectedRoute>} />
                    <Route path="/audit-log" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<PageLoader />}><ActivityPage /></Suspense></ProtectedRoute>} />
                    <Route path="/reservations" element={<Suspense fallback={<PageLoader />}><ReservationsPage /></Suspense>} />
                    <Route path="/notifications" element={<Suspense fallback={<PageLoader />}><NotificationsPage /></Suspense>} />
                    <Route path="/history" element={<Suspense fallback={<PageLoader />}><ActivityPage /></Suspense>} />
                    <Route path="/activity" element={<Suspense fallback={<PageLoader />}><ActivityPage /></Suspense>} />
                    <Route path="/settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
                </Route>

                <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
            </Routes>
        </Suspense>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}
