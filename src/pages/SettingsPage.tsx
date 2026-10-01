import React, { useState, useRef } from 'react';
import {
  User as UserIcon,
  Lock,
  Camera,
  Upload,
  Trash2,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Save,
  KeyRound,
  CheckCircle2,
  Sun,
  Moon,
  Monitor,
  Palette,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { useTheme, Theme } from '../contexts/ThemeContext.tsx';
import { api } from '../services/api.ts';

// Pre-made quick avatar options
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
];

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, changePassword, refreshUser } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { success, error } = useToast();

  // Profile Information State
  const [fullName, setFullName] = useState<string>(user?.fullName || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl || '');
  const [currency, setCurrency] = useState<string>(user?.currency || '₹');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  // Standard Password Change State
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);

  // In-Settings Recovery State (If user doesn't know current password)
  const [isRecovering, setIsRecovering] = useState<boolean>(false);
  const [recoveryCode, setRecoveryCode] = useState<string>('');
  const [receivedCode, setReceivedCode] = useState<string | null>(null);
  const [isRequestingCode, setIsRequestingCode] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Local File Photo Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error('Please upload a valid image file (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      error('Image size should be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      if (base64) {
        setAvatarUrl(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      error('Username / Full name cannot be empty');
      return;
    }

    try {
      setIsSavingProfile(true);
      await updateProfile({
        fullName: fullName.trim(),
        avatarUrl,
        currency,
      });
      success('Profile updated successfully in Indian Rupees (₹)!');
    } catch (err: any) {
      error(err.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Standard Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      error('Please enter your current password');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      error('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      error('New passwords do not match');
      return;
    }

    try {
      setIsChangingPassword(true);
      await changePassword({
        currentPassword,
        newPassword,
      });
      success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      error(err.message || 'Failed to change password. Verify your current password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle In-Settings Recovery Code Generation
  const handleRequestInSettingsCode = async () => {
    if (!user?.email) return;
    try {
      setIsRequestingCode(true);
      const res = await api.requestPasswordRecovery(user.email);
      setReceivedCode(res.code);
      setRecoveryCode(res.code);
      success('Verification recovery code generated!');
    } catch (err: any) {
      error(err.message || 'Failed to generate recovery code');
    } finally {
      setIsRequestingCode(false);
    }
  };

  // Handle In-Settings Recovery Submit
  const handleRecoverPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recoveryCode.trim()) {
      error('Please enter the 6-digit recovery code');
      return;
    }

    if (newPassword.length < 6) {
      error('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      error('Passwords do not match');
      return;
    }

    try {
      setIsChangingPassword(true);
      await api.resetPasswordWithCode({
        email: user?.email || '',
        code: recoveryCode.trim(),
        newPassword,
      });
      success('Password successfully recovered and updated!');
      setIsRecovering(false);
      setReceivedCode(null);
      setRecoveryCode('');
      setNewPassword('');
      setConfirmPassword('');
      await refreshUser();
    } catch (err: any) {
      error(err.message || 'Invalid or expired recovery code');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 font-sans text-[#181512] dark:text-[#FAF7F2]">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-[#181512] dark:text-[#FAF7F2]">
          Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#665E54] dark:text-[#ACA397] mt-1">
          Customize your theme appearance, manage your personal profile, and update your security preferences.
        </p>
      </div>

      {/* Section 1: Appearance & Theme Toggle (Light / Dark / System) */}
      <div className="bg-white dark:bg-[#1C1816] rounded-2xl border border-[#E8E1D5] dark:border-[#2D2622] shadow-xs overflow-hidden">
        <div className="p-6 sm:p-7 border-b border-[#E8E1D5] dark:border-[#2D2622]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EFE8DD] dark:bg-[#2B231D] text-[#AF6E4D] dark:text-[#C87D55] flex items-center justify-center font-bold">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#181512] dark:text-[#FAF7F2] font-heading">
                Appearance & Theme
              </h2>
              <p className="text-xs text-[#665E54] dark:text-[#ACA397]">
                Choose between warm ecru linen or quiet luxury espresso noir.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-7">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Light Theme Card (Raw Elegance Warm Linen) */}
            <button
              type="button"
              onClick={() => {
                setTheme('light');
                success('Warm Linen light theme activated');
              }}
              className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                theme === 'light'
                  ? 'border-[#AF6E4D] ring-2 ring-[#AF6E4D]/20 bg-[#FAF4ED]'
                  : 'border-[#E8E1D5] dark:border-[#2D2622] hover:border-[#AF6E4D]/60 bg-white dark:bg-[#221D1A]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#EFE8DD] text-[#AF6E4D] flex items-center justify-center">
                  <Sun className="w-4 h-4" />
                </div>
                {theme === 'light' && (
                  <span className="w-5 h-5 rounded-full bg-[#AF6E4D] text-white flex items-center justify-center text-[10px]">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-[#181512] dark:text-[#FAF7F2]">Warm Linen (Light)</div>
              <div className="text-[11px] text-[#665E54] dark:text-[#ACA397] mt-0.5">
                Ecru canvas with caramel sienna accents
              </div>
            </button>

            {/* Dark Theme Card (Espresso Noir) */}
            <button
              type="button"
              onClick={() => {
                setTheme('dark');
                success('Espresso Noir dark theme activated');
              }}
              className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                theme === 'dark'
                  ? 'border-[#AF6E4D] ring-2 ring-[#AF6E4D]/20 bg-[#FAF4ED] dark:bg-[#2A211B]'
                  : 'border-[#E8E1D5] dark:border-[#2D2622] hover:border-[#AF6E4D]/60 bg-white dark:bg-[#221D1A]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#2B231D] text-[#C87D55] flex items-center justify-center">
                  <Moon className="w-4 h-4" />
                </div>
                {theme === 'dark' && (
                  <span className="w-5 h-5 rounded-full bg-[#AF6E4D] text-white flex items-center justify-center text-[10px]">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-[#181512] dark:text-[#FAF7F2]">Espresso Noir (Dark)</div>
              <div className="text-[11px] text-[#665E54] dark:text-[#ACA397] mt-0.5">
                Quiet luxury obsidian with warm copper glow
              </div>
            </button>

            {/* System Default Card */}
            <button
              type="button"
              onClick={() => {
                setTheme('system');
                success('System theme preference synchronized');
              }}
              className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                theme === 'system'
                  ? 'border-[#AF6E4D] ring-2 ring-[#AF6E4D]/20 bg-[#FAF4ED] dark:bg-[#2A211B]'
                  : 'border-[#E8E1D5] dark:border-[#2D2622] hover:border-[#AF6E4D]/60 bg-white dark:bg-[#221D1A]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#EFE8DD] dark:bg-[#2B231D] text-[#7A6B58] dark:text-[#D6C2B0] flex items-center justify-center">
                  <Monitor className="w-4 h-4" />
                </div>
                {theme === 'system' && (
                  <span className="w-5 h-5 rounded-full bg-[#AF6E4D] text-white flex items-center justify-center text-[10px]">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-[#181512] dark:text-[#FAF7F2]">System Sync</div>
              <div className="text-[11px] text-[#665E54] dark:text-[#ACA397] mt-0.5">
                Automatically adjusts to daylight & dusk
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Profile & Avatar Management */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-xs overflow-hidden">
        <div className="p-6 sm:p-7 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
                Public Profile
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update your display username, profile photo, and default currency.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="p-6 sm:p-7 space-y-6">
          {/* Avatar Section */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
              Profile Photo
            </label>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              {/* Photo Preview */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs flex items-center justify-center">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-3xl font-bold text-slate-400 dark:text-slate-500 font-heading">
                      {fullName?.charAt(0) || user?.fullName?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors"
                  title="Change avatar photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Upload Controls & Actions */}
              <div className="space-y-3 flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl transition-colors shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span>Upload New Photo</span>
                  </button>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 px-3 py-2 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Recommended: Square JPG, PNG or WEBP, max 2MB.
                </p>

                {/* Preset Avatars Choice */}
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                    Or select a curated avatar:
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {PRESET_AVATARS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatarUrl(preset)}
                        className={`w-9 h-9 rounded-xl border-2 overflow-hidden transition-all shrink-0 ${
                          avatarUrl === preset
                            ? 'border-blue-600 ring-2 ring-blue-600/30'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <img
                          src={preset}
                          alt={`Avatar option ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Username / Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Username / Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Yashwanth Rao"
                  required
                  className="w-full pl-3.5 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                This name is displayed across your Finova statements, invoices, and ledger.
              </p>
            </div>

            {/* Email Address (Read-only) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 cursor-not-allowed select-none"
                />
                <div className="absolute right-3 top-3 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[10px] font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Primary identifier used for account login and recovery.
              </p>
            </div>

            {/* Preferred Currency */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Preferred Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition-all cursor-pointer"
              >
                <option value="₹">₹ INR - Indian Rupee (Default)</option>
                <option value="$">$ USD - US Dollar</option>
                <option value="€">€ EUR - Euro</option>
                <option value="£">£ GBP - British Pound</option>
              </select>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Formats balances, cashflow charts, and statements in Indian Rupees (₹).
              </p>
            </div>
          </div>

          {/* Save Profile Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Section 3: Password Management & Recovery */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-xs overflow-hidden">
        <div className="p-6 sm:p-7 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
                Security & Password
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isRecovering
                  ? 'Recover your password without knowing your old password'
                  : 'Update your account password or recover credentials'}
              </p>
            </div>
          </div>

          {/* Toggle between standard change vs recovery flow */}
          <button
            type="button"
            onClick={() => {
              setIsRecovering(!isRecovering);
              setReceivedCode(null);
            }}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors self-start sm:self-auto"
          >
            {isRecovering ? 'Back to standard password change' : "Don't know current password? Recover"}
          </button>
        </div>

        {/* SUB-FLOW A: STANDARD CHANGE (Requires Current Password) */}
        {!isRecovering && (
          <form onSubmit={handleChangePassword} className="p-6 sm:p-7 space-y-5">
            {/* Current Password */}
            <div>
              <div className="flex items-center justify-between mb-2 max-w-md">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Current Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsRecovering(true);
                    handleRequestInSettingsCode();
                  }}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative max-w-md">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Must be at least 6 characters long.
                </p>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword && confirmPassword && (
                  <div className="mt-1 flex items-center gap-1 text-[11px]">
                    {newPassword === confirmPassword ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Passwords match
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Passwords do not match
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Update Password CTA */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="flex items-center gap-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 active:bg-slate-950 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span>{isChangingPassword ? 'Updating Password...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        )}

        {/* SUB-FLOW B: RECOVERY FLOW (When user doesn't know current password) */}
        {isRecovering && (
          <form onSubmit={handleRecoverPasswordSubmit} className="p-6 sm:p-7 space-y-5">
            {/* Step 1 notification */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Account Recovery Verification
                </span>
                <button
                  type="button"
                  onClick={handleRequestInSettingsCode}
                  disabled={isRequestingCode}
                  className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-lg hover:bg-blue-100 dark:hover:bg-slate-800 transition-colors shadow-2xs"
                >
                  {isRequestingCode ? 'Generating...' : 'Get New Code'}
                </button>
              </div>

              <p className="text-xs text-blue-800 dark:text-blue-300">
                A verification code was requested for your email: <span className="font-bold">{user?.email}</span>.
              </p>

              {receivedCode && (
                <div className="mt-2 pt-2 border-t border-blue-200/80 dark:border-blue-900/60 flex items-center gap-2">
                  <span className="text-xs text-blue-900 dark:text-blue-200 font-semibold">Your 6-Digit Code:</span>
                  <span className="font-mono text-base font-extrabold text-blue-700 dark:text-blue-300 tracking-widest bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-blue-300 dark:border-blue-700">
                    {receivedCode}
                  </span>
                </div>
              )}
            </div>

            {/* Code Input */}
            <div className="max-w-md">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Enter 6-Digit Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value)}
                placeholder="e.g. 742918"
                className="w-full px-3 py-2.5 text-center font-mono font-bold tracking-widest text-sm bg-slate-50/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-blue-600"
              />
            </div>

            {/* New Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsRecovering(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isChangingPassword ? 'Resetting Password...' : 'Recover & Save New Password'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Section 4: Security & Session Status */}
      <div className="bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">
            Account Security Status
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Your ledger session is authenticated using salted SHA-512 cryptographic hashing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Protected
          </span>
        </div>
      </div>
    </div>
  );
};
