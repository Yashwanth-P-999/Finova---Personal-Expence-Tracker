import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import {
  ArrowRight,
  Lock,
  Mail,
  User as UserIcon,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { BrandLogo } from '../components/common/BrandLogo.tsx';

type AuthMode = 'login' | 'register' | 'recover';

export const AuthPage: React.FC = () => {
  const { login, register, refreshUser } = useAuth();
  const { error, success } = useToast();

  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [currency, setCurrency] = useState('₹');
  const [isLoading, setIsLoading] = useState(false);

  // Recovery state
  const [recoveryStep, setRecoveryStep] = useState<1 | 2>(1);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [receivedCode, setReceivedCode] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (authMode === 'register') {
        if (!fullName.trim()) {
          error('Please enter your full name');
          setIsLoading(false);
          return;
        }
        await register({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          currency: '₹',
        });
        success('Account created successfully');
      } else if (authMode === 'login') {
        await login(email.trim(), password);
        success('Signed in successfully');
      }
    } catch (err: any) {
      error(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Request recovery code
  const handleRequestRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      error('Please enter your registered email address');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.requestPasswordRecovery(email.trim());
      setReceivedCode(res.code);
      setRecoveryCode(res.code);
      setRecoveryStep(2);
      success('Verification recovery code generated!');
    } catch (err: any) {
      error(err.message || 'No account found with this email');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit new password with code
  const handleResetPassword = async (e: React.FormEvent) => {
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

    setIsLoading(true);
    try {
      await api.resetPasswordWithCode({
        email: email.trim(),
        code: recoveryCode.trim(),
        newPassword,
      });
      success('Password reset successfully! Logging you in...');
      await refreshUser();
    } catch (err: any) {
      error(err.message || 'Invalid or expired recovery code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await login('yashwanth@smartfin.dev', 'smartfin123');
      success('Signed in as Demo User');
    } catch (err: any) {
      error(err.message || 'Demo sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#13110F] text-[#181512] dark:text-[#FAF7F2] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#EFE8DD] dark:selection:bg-[#3D332A]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Aesthetic Kicker Tag (Matching User Reference Image) */}
        <div className="inline-block bg-[#EFE8DD] dark:bg-[#28211B] text-[#7A6B58] dark:text-[#D6C2B0] text-[10px] font-mono uppercase tracking-[0.25em] px-3.5 py-1.2 rounded-full font-bold mb-4">
          SEASON '26 · WEALTH ATELIER
        </div>

        {/* Bespoke Logo */}
        <div className="flex justify-center mb-4">
          <BrandLogo size="lg" showTagline={false} />
        </div>

        {/* Editorial Headline from Reference: "Raw elegance. Minimal stride." */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.035em] text-[#181512] dark:text-[#FAF7F2] font-heading leading-tight">
          Raw elegance.<br />
          Minimal stride.
        </h1>

        <p className="mt-2.5 text-xs text-[#665E54] dark:text-[#A89F94] max-w-sm mx-auto leading-relaxed">
          Intelligent personal finance & 25% SIP wealth balancing. Designed for quiet financial clarity in Indian Rupees (₹).
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#1C1816] py-8 px-6 sm:px-10 rounded-2xl border border-[#E8E1D5] dark:border-[#2D2622] shadow-sm">
          {/* Header Title */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-[#181512] dark:text-[#FAF7F2] font-heading">
              {authMode === 'register' && 'Create your atelier account'}
              {authMode === 'login' && 'Welcome back'}
              {authMode === 'recover' && 'Recover your credentials'}
            </h3>
            <p className="text-xs text-[#8C8478] dark:text-[#A89F94] mt-0.5">
              {authMode === 'register' && 'Track your expenses, accounts, and 25% SIP allocations'}
              {authMode === 'login' && 'Sign in to access your ledger and wealth balancing'}
              {authMode === 'recover' && 'Reset your password securely if you forgot your credentials'}
            </p>
          </div>

          {/* MODE 1 & 2: LOGIN OR REGISTER */}
          {authMode !== 'recover' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-[#5C554D] dark:text-[#C5BCB2] mb-1">
                    Username / Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#9E9589] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Yashwanth Rao"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm text-[#181512] dark:text-[#FAF7F2] bg-[#FAF7F2] dark:bg-[#25201C] border border-[#E8E1D5] dark:border-[#382F28] rounded-xl focus:outline-hidden focus:border-[#AF6E4D] focus:ring-1 focus:ring-[#AF6E4D]/30 placeholder:text-[#9E9589]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#5C554D] dark:text-[#C5BCB2] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9E9589] absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm text-[#181512] dark:text-[#FAF7F2] bg-[#FAF7F2] dark:bg-[#25201C] border border-[#E8E1D5] dark:border-[#382F28] rounded-xl focus:outline-hidden focus:border-[#AF6E4D] focus:ring-1 focus:ring-[#AF6E4D]/30 placeholder:text-[#9E9589]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#5C554D] dark:text-[#C5BCB2]">
                    Password
                  </label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('recover');
                        setRecoveryStep(1);
                        setReceivedCode(null);
                      }}
                      className="text-xs font-semibold text-[#AF6E4D] dark:text-[#C87D55] hover:underline transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9E9589] absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 text-sm text-[#181512] dark:text-[#FAF7F2] bg-[#FAF7F2] dark:bg-[#25201C] border border-[#E8E1D5] dark:border-[#382F28] rounded-xl focus:outline-hidden focus:border-[#AF6E4D] focus:ring-1 focus:ring-[#AF6E4D]/30 placeholder:text-[#9E9589]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#9E9589] hover:text-[#5C554D] dark:hover:text-[#FAF7F2]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-[#5C554D] dark:text-[#C5BCB2] mb-1">
                    Currency
                  </label>
                  <div className="px-3 py-2 bg-[#FAF7F2] dark:bg-[#25201C] border border-[#E8E1D5] dark:border-[#382F28] rounded-xl text-xs font-bold text-[#181512] dark:text-[#FAF7F2] flex items-center justify-between">
                    <span>🇮🇳 Indian Rupee (₹)</span>
                    <span className="text-[10px] bg-[#EFE8DD] dark:bg-[#362C24] text-[#7A6B58] dark:text-[#D6C2B0] px-2 py-0.5 rounded-full font-semibold">
                      Standard
                    </span>
                  </div>
                </div>
              )}

              {/* Primary Warm Caramel Button (Matching "Shop Men's" in Image) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#AF6E4D] hover:bg-[#965A39] active:bg-[#864828] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>{isLoading ? 'Processing...' : authMode === 'register' ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* MODE 3: PASSWORD RECOVERY */}
          {authMode === 'recover' && (
            <div className="space-y-4">
              {recoveryStep === 1 ? (
                <form onSubmit={handleRequestRecoveryCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#5C554D] dark:text-[#C5BCB2] mb-1">
                      Enter Account Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#9E9589] absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        placeholder="your-email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm text-[#181512] dark:text-[#FAF7F2] bg-[#FAF7F2] dark:bg-[#25201C] border border-[#E8E1D5] dark:border-[#382F28] rounded-xl focus:outline-hidden focus:border-[#AF6E4D] focus:ring-1 focus:ring-[#AF6E4D]/30 placeholder:text-[#9E9589]"
                      />
                    </div>
                    <p className="text-[11px] text-[#8C8478] dark:text-[#A89F94] mt-1">
                      We will issue a secure 6-digit verification code to reset your password.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#AF6E4D] hover:bg-[#965A39] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isLoading ? 'Sending Code...' : 'Get Recovery Code'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {receivedCode && (
                    <div className="p-3 bg-[#EFE8DD] dark:bg-[#2B231D] border border-[#E0D7C9] dark:border-[#3D332A] rounded-xl flex items-start gap-2.5 text-xs text-[#7A6B58] dark:text-[#D6C2B0]">
                      <ShieldCheck className="w-4 h-4 text-[#AF6E4D] dark:text-[#C87D55] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">Verification Recovery Code:</div>
                        <div className="font-mono text-base font-extrabold tracking-widest text-[#AF6E4D] dark:text-[#C87D55] my-0.5">
                          {receivedCode}
                        </div>
                        <span className="text-[10px]">
                          Enter this 6-digit code below to set your new password.
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-[#5C554D] dark:text-[#C5BCB2] mb-1">
                      6-Digit Recovery Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 742918"
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value)}
                      className="w-full px-3 py-2 text-sm text-center tracking-widest font-mono font-bold text-[#181512] dark:text-[#FAF7F2] bg-[#FAF7F2] dark:bg-[#25201C] border border-[#E8E1D5] dark:border-[#382F28] rounded-xl focus:outline-hidden focus:border-[#AF6E4D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5C554D] dark:text-[#C5BCB2] mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#9E9589] absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2 text-sm text-[#181512] dark:text-[#FAF7F2] bg-[#FAF7F2] dark:bg-[#25201C] border border-[#E8E1D5] dark:border-[#382F28] rounded-xl focus:outline-hidden focus:border-[#AF6E4D] placeholder:text-[#9E9589]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-[#9E9589] hover:text-[#5C554D]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5C554D] dark:text-[#C5BCB2] mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#9E9589] absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Repeat new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2 text-sm text-[#181512] dark:text-[#FAF7F2] bg-[#FAF7F2] dark:bg-[#25201C] border border-[#E8E1D5] dark:border-[#382F28] rounded-xl focus:outline-hidden focus:border-[#AF6E4D] placeholder:text-[#9E9589]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#181512] dark:bg-[#FAF7F2] hover:bg-[#2D2622] dark:hover:bg-[#EAE4DA] text-white dark:text-[#181512] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isLoading ? 'Resetting Password...' : 'Reset & Save New Password'}</span>
                  </button>
                </form>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setRecoveryStep(1);
                    setReceivedCode(null);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-[#8C8478] hover:text-[#181512] dark:hover:text-[#FAF7F2] font-medium"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Demo Login Option */}
          {authMode !== 'recover' && (
            <div className="mt-6 pt-5 border-t border-[#E8E1D5] dark:border-[#2D2622]">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full py-2 px-3 rounded-xl border border-[#DDD5C7] dark:border-[#382F28] text-xs font-semibold text-[#5C554D] dark:text-[#D6C2B0] hover:bg-[#FAF7F2] dark:hover:bg-[#25201C] transition-colors shadow-2xs"
              >
                Sign in with Demo Account (Yashwanth)
              </button>
            </div>
          )}

          {/* Mode Switcher */}
          {authMode !== 'recover' && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-xs text-[#AF6E4D] dark:text-[#C87D55] hover:underline font-semibold"
              >
                {authMode === 'register'
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Create one"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
