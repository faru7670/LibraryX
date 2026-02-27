import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getGravatarUrl } from '../../utils/gravatar';
import { getAppSettings, saveAppSettings } from '../../services/settingsService';
import { sendTestEmail } from '../../services/emailService';
import { User, Moon, Sun, Save, CheckCircle, Loader2, Calendar, Send, Sparkles, Zap, Palette, Camera, ImagePlus, X } from 'lucide-react';

// Compress profile image
function compressImage(file, maxWidth = 200, quality = 0.8) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

export default function SettingsPage() {
    const { user, updateUserProfile } = useAuth();
    const { darkMode, toggleTheme, accent, setAccent, ACCENT_COLORS } = useTheme();
    const [name, setName] = useState(user?.name || '');
    const [department, setDepartment] = useState(user?.department || '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [savingLib, setSavingLib] = useState(false);
    const [savedLib, setSavedLib] = useState(false);
    const [testingEmail, setTestingEmail] = useState(false);
    const [emailTestResult, setEmailTestResult] = useState(null);
    const [profileImage, setProfileImage] = useState(user?.profileImage || null);
    const fileInputRef = useRef(null);

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

    const handleImageSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const compressed = await compressImage(file);
        setProfileImage(compressed);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateUserProfile({ name, department, profileImage });
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

    const displayImage = profileImage || getGravatarUrl(user?.email, 128);

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

            {/* Profile with Photo Upload */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-500" /> Profile
                </h3>
                <div className="flex items-center gap-5 mb-6">
                    <div className="relative group">
                        <img
                            src={displayImage}
                            alt={user?.name}
                            className="w-20 h-20 rounded-2xl ring-4 ring-white/10 shadow-xl object-cover"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                            <Camera className="w-6 h-6 text-white" />
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                        {profileImage && (
                            <button
                                onClick={() => setProfileImage(null)}
                                className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-white text-lg">{user?.name}</h4>
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

            {/* Appearance — Theme + Color */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-violet-500" /> Appearance
                </h3>

                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        {darkMode ? <Moon className="w-5 h-5 text-violet-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                        <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Dark Mode</p>
                            <p className="text-xs text-gray-500">Toggle light/dark theme</p>
                        </div>
                    </div>
                    <button onClick={toggleTheme} className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-violet-500' : 'bg-gray-300'}`}>
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${darkMode ? 'translate-x-6' : ''}`} />
                    </button>
                </div>

                {/* Color Theme Picker */}
                <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Accent Color</p>
                    <div className="flex gap-3">
                        {ACCENT_COLORS.map(c => (
                            <button
                                key={c.key}
                                onClick={() => setAccent(c.key)}
                                className={`w-10 h-10 rounded-xl transition-all duration-300 flex items-center justify-center ${accent === c.key ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 scale-110' : 'hover:scale-105'}`}
                                style={{ backgroundColor: c.color, boxShadow: accent === c.key ? `0 4px 15px ${c.color}50` : `0 2px 8px ${c.color}30` }}
                                title={c.name}
                            >
                                {accent === c.key && <CheckCircle className="w-5 h-5 text-white drop-shadow-lg" />}
                            </button>
                        ))}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2">Changes the accent color across the app</p>
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
                                <input type="number" min="1" max="365" value={appSettings.defaultDueDays} onChange={e => setAppSettings(p => ({ ...p, defaultDueDays: parseInt(e.target.value) || 14 }))} className="input-glass w-full" />
                                <p className="text-[11px] text-gray-400 mt-1">Books issued for this many days</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Fine Per Day (₹)</label>
                                <input type="number" min="0" value={appSettings.finePerDay} onChange={e => setAppSettings(p => ({ ...p, finePerDay: parseInt(e.target.value) || 5 }))} className="input-glass w-full" />
                                <p className="text-[11px] text-gray-400 mt-1">Charged per day for overdue</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Lost Book Fine (₹)</label>
                                <input type="number" min="0" value={appSettings.lostBookFine || 500} onChange={e => setAppSettings(p => ({ ...p, lostBookFine: parseInt(e.target.value) || 500 }))} className="input-glass w-full" />
                                <p className="text-[11px] text-gray-400 mt-1">Penalty when book is reported lost</p>
                            </div>
                        </div>
                    </div>

                    {/* Email Notification Settings */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                            <Send className="w-5 h-5 text-cyan-500" /> Email Notifications
                        </h3>
                        <p className="text-xs text-gray-400 mb-4">Emails are automatically sent when books are issued, returned, or reported lost.</p>

                        {/* Test Email */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={async () => {
                                    setTestingEmail(true);
                                    setEmailTestResult(null);
                                    try {
                                        await sendTestEmail(user?.email, user?.name);
                                        setEmailTestResult({ type: 'success', text: `✅ Test email sent to ${user?.email}!` });
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
