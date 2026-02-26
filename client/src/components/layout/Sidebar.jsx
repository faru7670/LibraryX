import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
    LayoutDashboard, BookOpen, BookCopy, Clock, Bell, Settings, LogOut,
    Users, BarChart3, ClipboardList, ChevronLeft, ChevronRight,
    Moon, Sun, Library, BookMarked, CalendarClock, ShieldCheck, Menu, X
} from 'lucide-react';

const navItems = {
    student: [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/books', icon: BookOpen, label: 'Browse Books' },
        { to: '/my-books', icon: BookCopy, label: 'My Books' },
        { to: '/reservations', icon: CalendarClock, label: 'Reservations' },
        { to: '/history', icon: Clock, label: 'Activity History' },
        { to: '/notifications', icon: Bell, label: 'Notifications' },
        { to: '/settings', icon: Settings, label: 'Settings' },
    ],
    librarian: [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/books', icon: BookOpen, label: 'All Books' },
        { to: '/issues', icon: BookCopy, label: 'Issue / Return' },
        { to: '/reservations', icon: CalendarClock, label: 'Reservations' },
        { to: '/notifications', icon: Bell, label: 'Notifications' },
        { to: '/activity', icon: ClipboardList, label: 'Activity Logs' },
        { to: '/settings', icon: Settings, label: 'Settings' },
    ],
    admin: [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/books', icon: BookOpen, label: 'Manage Books' },
        { to: '/issues', icon: BookCopy, label: 'Issue / Return' },
        { to: '/users', icon: Users, label: 'Users' },
        { to: '/reservations', icon: CalendarClock, label: 'Reservations' },
        { to: '/analytics', icon: BarChart3, label: 'Analytics' },
        { to: '/audit-log', icon: ShieldCheck, label: 'Audit Log' },
        { to: '/notifications', icon: Bell, label: 'Notifications' },
        { to: '/settings', icon: Settings, label: 'Settings' },
    ],
};

export default function Sidebar() {
    const { user, logout } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const role = user?.role || 'student';
    const items = navItems[role] || navItems.student;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-6 border-b border-gray-200/20 dark:border-gray-700/30">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/30">
                    <Library className="w-5 h-5 text-white" />
                </div>
                {!collapsed && (
                    <div className="overflow-hidden">
                        <h1 className="text-lg font-bold font-display gradient-text tracking-tight">LibraryX</h1>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest">Management System</p>
                    </div>
                )}
            </div>

            {/* User Info */}
            {!collapsed && user && (
                <div className="px-4 py-4 border-b border-gray-200/20 dark:border-gray-700/30">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-fuchsia-400 to-cyan-400 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {user.name?.charAt(0) || '?'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{user.name}</p>
                            <p className="text-[11px] text-gray-400 capitalize">{user.role}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.to;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive
                                    ? 'bg-violet-500/10 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/60 dark:hover:bg-surface-700/40 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            title={collapsed ? item.label : undefined}
                        >
                            <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? 'text-violet-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                                }`} />
                            {!collapsed && <span>{item.label}</span>}
                            {isActive && !collapsed && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500" />
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="px-3 py-4 space-y-1 border-t border-gray-200/20 dark:border-gray-700/30">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-gray-600 dark:text-gray-400 hover:bg-gray-100/60 dark:hover:bg-surface-700/40 transition-all duration-200"
                    title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {darkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
                    {!collapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
                </button>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-red-500 dark:text-red-400 hover:bg-red-50/60 dark:hover:bg-red-900/10 transition-all duration-200"
                    title="Logout"
                >
                    <LogOut className="w-[18px] h-[18px]" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>

            {/* Collapse Toggle (Desktop only) */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex items-center justify-center py-3 border-t border-gray-200/20 dark:border-gray-700/30 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
        </div>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl glass-card"
            >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full z-40 glass-sidebar transition-all duration-300 
          ${collapsed ? 'w-[68px]' : 'w-64'} 
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                {sidebarContent}
            </aside>
        </>
    );
}
