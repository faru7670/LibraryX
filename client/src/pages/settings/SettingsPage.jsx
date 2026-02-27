import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getGravatarUrl } from '../../utils/gravatar';
import { getAppSettings, saveAppSettings } from '../../services/settingsService';
import { sendTestEmail } from '../../services/emailService';
import { User, Mail, Shield, Moon, Sun, Save, CheckCircle, Loader2, Calendar, DollarSign, Send, Sparkles, Zap } from 'lucide-react';

export default function SettingsPage() {
    const { user, updateUserProfile } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const [name, setName] = useState(user?.name || '');
    const [department, setDepartment] = useState(user?.department || '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [savingLib, setSavingLib] = useState(false);
    const [savedLib, setSavedLib] = useState(false);
    const [testingEmail, setTestingEmail] = useState(false);
    const [emailTestResult, setEmailTestResult] = useState(null);

    // Admin/Librarian settings
    const isAdmin = user?.role === 'admin' || user?.role === 'librarian';
    const [appSettings, setAppSettings] = useState({
        defaultDueDays: 14,
        finePerDay: 5,
        lostBookFine: 500,
        emailjsServiceId: '',
        emailjsTemplateId: '',
        emailjsPublicKey: '',
    });

    useEffect(() => {
        if (isAdmin) {
            getAppSettings().then(setAppSettings).catch(console.error);
        }
    }, [isAdmin]);

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

    const handleSaveLibSettings = async () => {
        setSavingLib(true);
        try {
            await saveAppSettings(appSettings);
            setSavedLib(true);
            setTimeout(() => setSavedLib(false), 2000);
        } catch (err) {
            console.error('Failed to save library settings:', err);
        }
        setSavingLib(false);
    };

    return (
        <div className="page-enter space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold font-display text-gray-900 dark:text-white">Settings ⚙️</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your profile and preferences</p>
            </div>

            {saved && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Profile saved!
                </div>
            )}

            {/* Profile with Gravatar */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-500" /> Profile
                </h3>
                <div className="flex items-center gap-4 mb-6">
                    <img
                        src={getGravatarUrl(user?.email, 128)}
                        alt={user?.name}
                        className="w-16 h-16 rounded-2xl ring-4 ring-white/10 shadow-lg object-cover"
                    />
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
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Profile
            </button>

            {/* Admin/Librarian Library Settings */}
            {isAdmin && (
                <>
                    <div className="pt-4 border-t border-gray-200/30 dark:border-gray-700/30">
                        <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-500" /> Library Settings
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Configure system-wide library settings</p>
                    </div>

                    {savedLib && (
                        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> Library settings saved!
                        </div>
                    )}

                    {/* Due Date & Fine Settings */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-violet-500" /> Issue & Fine Configuration
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Default Due Period (days)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={appSettings.defaultDueDays}
                                    onChange={e => setAppSettings(p => ({ ...p, defaultDueDays: parseInt(e.target.value) || 14 }))}
                                    className="input-glass w-full"
                                />
                                <p className="text-[11px] text-gray-400 mt-1">Books issued for this many days</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Fine Per Day (₹)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={appSettings.finePerDay}
                                    onChange={e => setAppSettings(p => ({ ...p, finePerDay: parseInt(e.target.value) || 5 }))}
                                    className="input-glass w-full"
                                />
                                <p className="text-[11px] text-gray-400 mt-1">Charged per day for overdue</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Lost Book Fine (₹)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={appSettings.lostBookFine || 500}
                                    onChange={e => setAppSettings(p => ({ ...p, lostBookFine: parseInt(e.target.value) || 500 }))}
                                    className="input-glass w-full"
                                />
                                <p className="text-[11px] text-gray-400 mt-1">Penalty when book is reported lost</p>
                            </div>
                        </div>
                    </div>

                    {/* Email Notification Settings */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                            <Send className="w-5 h-5 text-cyan-500" /> Email Notifications (EmailJS)
                        </h3>
                        <p className="text-xs text-gray-400 mb-4">
                            Free email notifications via <a href="https://www.emailjs.com" target="_blank" rel="noopener" className="text-violet-400 hover:underline">emailjs.com</a>.
                            Create a free account, set up a service + template, and paste your keys below.
                        </p>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Service ID</label>
                                <input
                                    type="text"
                                    value={appSettings.emailjsServiceId}
                                    onChange={e => setAppSettings(p => ({ ...p, emailjsServiceId: e.target.value }))}
                                    className="input-glass w-full"
                                    placeholder="e.g. service_abc123"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Template ID</label>
                                <input
                                    type="text"
                                    value={appSettings.emailjsTemplateId}
                                    onChange={e => setAppSettings(p => ({ ...p, emailjsTemplateId: e.target.value }))}
                                    className="input-glass w-full"
                                    placeholder="e.g. template_xyz789"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Public Key</label>
                                <input
                                    type="text"
                                    value={appSettings.emailjsPublicKey}
                                    onChange={e => setAppSettings(p => ({ ...p, emailjsPublicKey: e.target.value }))}
                                    className="input-glass w-full"
                                    placeholder="e.g. user_def456"
                                />
                            </div>
                        </div>

                        {/* Template Setup Instructions */}
                        <div className="mt-4 p-3 rounded-xl bg-violet-500/5 border border-violet-500/10">
                            <p className="text-xs font-medium text-violet-400 mb-1">⚡ EmailJS Template Setup</p>
                            <p className="text-[11px] text-gray-400">Your EmailJS template must use these variables: <code className="text-violet-300">{'{{to_email}}'}</code>, <code className="text-violet-300">{'{{to_name}}'}</code>, <code className="text-violet-300">{'{{subject}}'}</code>, <code className="text-violet-300">{'{{message}}'}</code>, <code className="text-violet-300">{'{{from_name}}'}</code></p>
                        </div>

                        {/* Test Email Button */}
                        <div className="mt-4 flex items-center gap-3">
                            <button
                                onClick={async () => {
                                    setTestingEmail(true);
                                    setEmailTestResult(null);
                                    try {
                                        await sendTestEmail(user?.email, user?.name);
                                        setEmailTestResult({ type: 'success', text: `✅ Test email sent to ${user?.email}! Check your inbox.` });
                                    } catch (err) {
                                        setEmailTestResult({ type: 'error', text: `❌ Failed: ${err?.text || err?.message || 'Unknown error'}` });
                                    }
                                    setTestingEmail(false);
                                }}
                                disabled={testingEmail}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {testingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                Send Test Email
                            </button>
                            {emailTestResult && (
                                <p className={`text-sm ${emailTestResult.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {emailTestResult.text}
                                </p>
                            )}
                        </div>
                    </div>

                    <button onClick={handleSaveLibSettings} disabled={savingLib} className="btn-primary flex items-center gap-2">
                        {savingLib ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Library Settings
                    </button>
                </>
            )}
        </div>
    );
}
