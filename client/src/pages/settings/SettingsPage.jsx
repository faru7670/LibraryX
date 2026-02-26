import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { User, Mail, Shield, Moon, Sun, Save, CheckCircle, Loader2 } from 'lucide-react';

export default function SettingsPage() {
    const { user, updateUserProfile } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const [name, setName] = useState(user?.name || '');
    const [department, setDepartment] = useState(user?.department || '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateUserProfile({ name, department });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error('Failed to save:', err);
        }
        setSaving(false);
    };

    return (
        <div className="page-enter space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold font-display text-gray-900 dark:text-white">Settings ⚙️</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your profile and preferences</p>
            </div>

            {saved && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Settings saved!
                </div>
            )}

            {/* Profile */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-500" /> Profile
                </h3>
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-white">{user?.name}</h4>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        <span className="badge badge-info mt-1 capitalize">{user?.role}</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-glass w-full" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Department</label>
                        <input type="text" value={department} onChange={e => setDepartment(e.target.value)} className="input-glass w-full" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                        <input type="email" value={user?.email || ''} className="input-glass w-full" readOnly />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
                        <input type="text" value={user?.role || ''} className="input-glass w-full capitalize" readOnly />
                    </div>
                </div>
            </div>

            {/* Theme */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {darkMode ? <Moon className="w-5 h-5 text-primary-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
                        <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Dark Mode</p>
                            <p className="text-xs text-gray-500">Toggle light/dark theme</p>
                        </div>
                    </div>
                    <button onClick={toggleTheme} className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-primary-500' : 'bg-gray-300'}`}>
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-6' : ''}`} />
                    </button>
                </div>
            </div>

            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
            </button>
        </div>
    );
}
