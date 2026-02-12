import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Code2, PenTool, Layers, Sparkles, Zap, Brain, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { Spinner } from '../components/ui/Spinner';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { signUp, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    const { error } = await signUp(email, password);

    if (!error) {
      navigate('/onboarding');
    }
  };

  const displayError = localError || error;

  // Floating icons data for the animated background
  const floatingIcons = [
    { Icon: Code2, x: '10%', y: '15%', delay: 0 },
    { Icon: PenTool, x: '80%', y: '20%', delay: 0.5 },
    { Icon: Sparkles, x: '20%', y: '70%', delay: 1 },
    { Icon: Zap, x: '75%', y: '75%', delay: 1.5 },
    { Icon: Brain, x: '50%', y: '85%', delay: 2 },
    { Icon: Layers, x: '85%', y: '50%', delay: 0.8 },
  ];

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* LEFT SIDE: Brand & Aesthetic Visuals */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
        {/* Animated Abstract Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <motion.div
            className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[100px]"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-teal-500 rounded-full blur-[100px]"
            animate={{
              x: [0, -40, 0],
              y: [0, -40, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-cyan-500 rounded-full blur-[120px]"
            animate={{
              x: [0, 60, 0],
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Floating Icons */}
        {floatingIcons.map(({ Icon, x, y, delay }, index) => (
          <motion.div
            key={index}
            className="absolute opacity-10"
            style={{ left: x, top: y }}
            initial={{ y: 0, opacity: 0.05 }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.05, 0.15, 0.05],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4 + index,
              repeat: Infinity,
              delay: delay,
              ease: "easeInOut",
            }}
          >
            <Icon className="w-12 h-12 text-white" />
          </motion.div>
        ))}

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Content */}
        <motion.div
          className="relative z-10 max-w-lg"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Animated Icon Badges */}
          <motion.div
            className="flex gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <motion.div
              className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl backdrop-blur-sm"
              whileHover={{ scale: 1.1, rotate: 5 }}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(16, 185, 129, 0)',
                  '0 0 20px rgba(16, 185, 129, 0.3)',
                  '0 0 20px rgba(16, 185, 129, 0)',
                ]
              }}
              transition={{
                boxShadow: { duration: 2, repeat: Infinity },
                scale: { duration: 0.2 }
              }}
            >
              <Code2 className="w-8 h-8 text-emerald-300" />
            </motion.div>
            <motion.div
              className="p-3 bg-teal-500/20 border border-teal-500/30 rounded-xl backdrop-blur-sm"
              whileHover={{ scale: 1.1, rotate: -5 }}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(20, 184, 166, 0)',
                  '0 0 20px rgba(20, 184, 166, 0.3)',
                  '0 0 20px rgba(20, 184, 166, 0)',
                ]
              }}
              transition={{
                boxShadow: { duration: 2, repeat: Infinity, delay: 1 },
                scale: { duration: 0.2 }
              }}
            >
              <PenTool className="w-8 h-8 text-teal-300" />
            </motion.div>
          </motion.div>

          {/* Animated Heading */}
          <motion.h2
            className="text-4xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Start your <br />
            <motion.span
              className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-[length:200%_auto]"
              animate={{
                backgroundPosition: ['0% center', '100% center', '0% center'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              creative journey.
            </motion.span>
          </motion.h2>

          <motion.p
            className="text-slate-400 text-lg leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Join thousands of developers and designers collaborating
            on code and sketches in real-time.
          </motion.p>

          {/* Features List */}
          <motion.div
            className="mt-12 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            {[
              'Unlimited whiteboards',
              'Real-time collaboration',
              'Integrated code editing',
            ].map((feature, i) => (
              <motion.div
                key={feature}
                className="flex items-center gap-3 text-slate-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1, duration: 0.4 }}
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{feature}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Animated Canvas Preview */}
          <motion.div
            className="mt-10 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <div className="flex gap-1.5 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            </div>
            <div className="h-24 bg-slate-900/50 rounded-lg border border-slate-700/30 flex items-center justify-center gap-4">
              <motion.div
                className="w-16 h-16 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30"
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div
                className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="w-20 h-10 rounded bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/30"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">

          {/* Mobile Logo (Visible only on small screens) */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">U&I</span>
          </div>

          <div className="text-left">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create your account</h1>
            <p className="text-slate-500 mt-2">Start collaborating on your first whiteboard in seconds.</p>
          </div>

          {/* Error Message */}
          {displayError && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-md flex items-start gap-3">
               <div className="text-red-500 mt-0.5">!</div>
               <p className="text-sm text-red-700">{displayError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Email Input */}
              <div className="relative group">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="relative group">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  {password && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="relative group">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Confirm password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  {confirmPassword && (
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
            >
              {loading ? (
                <Spinner size="sm" className="[&_div]:border-white/30 [&_div]:border-t-white" />
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
