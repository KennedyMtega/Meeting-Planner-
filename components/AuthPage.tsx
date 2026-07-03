import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth 
} from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { 
  Mail, Lock, User, Eye, EyeOff, Sparkles, 
  ChevronRight, AlertCircle, ArrowRight, ShieldCheck, Info
} from 'lucide-react';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelpNote, setShowHelpNote] = useState(false);

  // Input states for focused visual rings
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setError(null);
    setShowHelpNote(false);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
          await updateProfile(userCredential.user, {
            displayName: name.trim()
          });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onAuthSuccess();
    } catch (err: any) {
      console.error("Auth error details:", err);
      let friendlyMessage = err.message || "An error occurred during authentication.";
      
      // Map Firebase codes to friendly messages
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        friendlyMessage = "Incorrect email address or password. Please verify your details.";
      } else if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = "This email is already registered. Please login instead.";
      } else if (err.code === 'auth/weak-password') {
        friendlyMessage = "Password is too weak. It must be at least 6 characters long.";
      } else if (err.code === 'auth/invalid-email') {
        friendlyMessage = "Please enter a valid email address.";
      } else if (err.code === 'auth/operation-not-allowed') {
        friendlyMessage = "Email/Password sign-in is not enabled on this Firebase project yet.";
        setShowHelpNote(true);
      }
      
      setError(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    setShowHelpNote(false);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onAuthSuccess();
    } catch (err: any) {
      console.error("Google login error:", err);
      if (err.code === 'auth/popup-blocked' || err.message?.includes('popup-blocked') || err.message?.includes('closed by the user')) {
        setError("Your browser blocked the Google authentication popup. To sign in with Google, please open this app in a new tab using the 'Open App' button in the top-right of your screen, or use the standard Email & Password registration.");
      } else {
        setError(err.message || "Google sign-in was cancelled or failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden bg-slate-950 font-sans px-4 select-none">
      
      {/* Dynamic Animated Atmospheric Background Blur Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/30 blur-[120px] pointer-events-none animate-pulse duration-5000"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/20 blur-[120px] pointer-events-none animate-pulse duration-[8000ms]"></div>
      <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full bg-rose-900/10 blur-[100px] pointer-events-none"></div>

      {/* Main Glassmorphic Container Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="w-full max-w-md relative z-20"
      >
        <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-[0_32px_64px_rgba(0,0,0,0.6)] rounded-3xl p-8 md:p-10 text-center flex flex-col gap-6">
          
          {/* Accent Line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent rounded-full"></div>

          {/* Logo & Header */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-[0_8px_20px_rgba(99,102,241,0.3)] border border-white/20 mb-1">
              <Sparkles className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Agenda Workspace
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Create, analyze and review high-impact meeting flows
            </p>
          </div>

          {/* Error Banner with Glass Look */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl p-4 text-xs text-left flex items-start gap-2.5 overflow-hidden"
              >
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{error}</p>
                  
                  {/* Detailed guidance if provider is not enabled */}
                  {showHelpNote && (
                    <div className="mt-2 text-slate-300 space-y-1.5 border-t border-rose-500/20 pt-2 font-normal leading-relaxed">
                      <p className="font-semibold flex items-center gap-1 text-amber-300">
                        <Info size={11} /> 
                        Action Required:
                      </p>
                      <ol className="list-decimal pl-4 space-y-1">
                        <li>Go to your <span className="font-bold text-white">Firebase Console</span></li>
                        <li>Select your project & go to <span className="font-bold text-white">Authentication &gt; Sign-in method</span></li>
                        <li>Enable the <span className="font-bold text-white">Email/Password</span> provider</li>
                      </ol>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Form */}
          <form onSubmit={handleAuth} className="flex flex-col gap-4 text-left">
            <AnimatePresence initial={false} mode="popLayout">
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, y: -15, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -15, height: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="flex flex-col gap-1.5 overflow-hidden"
                >
                  <label htmlFor="name" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full pl-11 pr-4 py-3 bg-white/[0.02] border rounded-xl text-sm font-medium text-white placeholder-slate-500 transition-all duration-300 outline-none ${
                        focusedField === 'name' 
                          ? 'border-indigo-500 ring-4 ring-indigo-500/15 shadow-[0_0_15px_rgba(99,102,241,0.2)] bg-white/[0.04]' 
                          : 'border-white/[0.06] hover:border-white/15'
                      }`}
                      required={isSignUp}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full pl-11 pr-4 py-3 bg-white/[0.02] border rounded-xl text-sm font-medium text-white placeholder-slate-500 transition-all duration-300 outline-none ${
                    focusedField === 'email' 
                      ? 'border-indigo-500 ring-4 ring-indigo-500/15 shadow-[0_0_15px_rgba(99,102,241,0.2)] bg-white/[0.04]' 
                      : 'border-white/[0.06] hover:border-white/15'
                  }`}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center pl-1">
                <label htmlFor="password" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full pl-11 pr-11 py-3 bg-white/[0.02] border rounded-xl text-sm font-medium text-white placeholder-slate-500 transition-all duration-300 outline-none ${
                    focusedField === 'password' 
                      ? 'border-indigo-500 ring-4 ring-indigo-500/15 shadow-[0_0_15px_rgba(99,102,241,0.2)] bg-white/[0.04]' 
                      : 'border-white/[0.06] hover:border-white/15'
                  }`}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-[0_8px_20px_rgba(99,102,241,0.2)] hover:shadow-[0_12px_24px_rgba(99,102,241,0.35)] flex items-center justify-center gap-2 select-none cursor-pointer active:scale-98"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isSignUp ? "Create Workspace Account" : "Access Workspace"}
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Separator */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-[1px] bg-white/[0.06]"></div>
            <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Or continue with</span>
            <div className="flex-1 h-[1px] bg-white/[0.06]"></div>
          </div>

          {/* Social Sign-In (Google Login) */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 border border-white/[0.06] hover:border-white/15 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-3 select-none cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Google Identity
            </button>
            {isInIframe && (
              <p className="text-[10px] text-indigo-300/70 font-semibold px-2 text-center leading-normal">
                💡 Inside preview iframe? Click <span className="font-bold text-indigo-300">Open App</span> at the top-right of your screen before using Google Identity to avoid blocked popups.
              </p>
            )}
          </div>

          {/* Toggle Flow Footer */}
          <div className="pt-2 border-t border-white/[0.05] mt-2">
            <p className="text-xs text-slate-400 font-medium">
              {isSignUp ? "Already have an account?" : "New to Agenda Workspace?"}{' '}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setShowHelpNote(false);
                }}
                className="text-indigo-400 hover:text-indigo-300 font-extrabold cursor-pointer transition-colors outline-none"
              >
                {isSignUp ? "Access Workspace" : "Register Now"}
              </button>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
