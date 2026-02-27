import { useAuth } from '../../context/AuthContext';
import StudentDashboard from './StudentDashboard';
import LibrarianDashboard from './LibrarianDashboard';
import AdminDashboard from './AdminDashboard';
import FacultyDashboard from './FacultyDashboard';

// Router component: renders the appropriate dashboard based on user role
export default function DashboardRouter() {
    const { user } = useAuth();
    const role = user?.role || 'student';

    switch (role) {
        case 'admin':
            return <AdminDashboard />;
        case 'librarian':
            return <LibrarianDashboard />;
        case 'faculty':
            return <FacultyDashboard />;
        case 'student':
        default:
            return <StudentDashboard />;
    }
}
