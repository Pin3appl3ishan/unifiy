import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Code2, PenTool, Layers, Sparkles, Zap, Brain, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const { error } = await signIn(email, password);

    if (!error) {
      navigate('/');
    }
  };

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
            className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[100px]"
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
            className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-violet-500 rounded-full blur-[100px]"
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
            className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-pink-500 rounded-full blur-[120px]"
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
              className="p-3 bg-indigo-500/20 border border-indigo-500/30 rounded-xl backdrop-blur-sm"
              whileHover={{ scale: 1.1, rotate: 5 }}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(99, 102, 241, 0)',
                  '0 0 20px rgba(99, 102, 241, 0.3)',
                  '0 0 20px rgba(99, 102, 241, 0)',
                ]
              }}
              transition={{
                boxShadow: { duration: 2, repeat: Infinity },
                scale: { duration: 0.2 }
              }}
            >
              <Code2 className="w-8 h-8 text-indigo-300" />
            </motion.div>
            <motion.div
              className="p-3 bg-violet-500/20 border border-violet-500/30 rounded-xl backdrop-blur-sm"
              whileHover={{ scale: 1.1, rotate: -5 }}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(139, 92, 246, 0)',
                  '0 0 20px rgba(139, 92, 246, 0.3)',
                  '0 0 20px rgba(139, 92, 246, 0)',
                ]
              }}
              transition={{
                boxShadow: { duration: 2, repeat: Infinity, delay: 1 },
                scale: { duration: 0.2 }
              }}
            >
              <PenTool className="w-8 h-8 text-violet-300" />
            </motion.div>
          </motion.div>

          {/* Animated Heading */}
          <motion.h2
            className="text-4xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Where logic meets <br />
            <motion.span
              className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-[length:200%_auto]"
              animate={{
                backgroundPosition: ['0% center', '100% center', '0% center'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              creativity.
            </motion.span>
          </motion.h2>

          <motion.p
            className="text-slate-400 text-lg leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Collaborate on code and sketch out architectures in real-time.
            The unified workspace for developers and designers.
          </motion.p>

          {/* Animated Stats/Users Section */}
          <motion.div
            className="mt-12 flex items-center gap-4 text-sm text-slate-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="flex -space-x-2">
              {[1,2,3,4].map((i) => (
                <motion.div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-slate-900 bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xs text-white font-medium"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7 + i * 0.1, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.2, zIndex: 10 }}
                >
                  U{i}
                </motion.div>
              ))}
            </div>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, duration: 0.4 }}
            >
              Built for <span className="text-indigo-400 font-medium">students & developers</span> collaborating in real time
            </motion.span>
          </motion.div>

          {/* Animated Code Snippet Preview */}
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
            <motion.div
              className="font-mono text-sm text-slate-300 space-y-1"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.15 } }
              }}
            >
              {[
                { text: 'const', color: 'text-purple-400' },
                { text: ' workspace = ', color: 'text-slate-300' },
                { text: 'createUnified', color: 'text-indigo-400' },
                { text: '();', color: 'text-slate-300' },
              ].map((part, i) => (
                <motion.span
                  key={i}
                  className={part.color}
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1 }
                  }}
                >
                  {part.text}
                </motion.span>
              ))}
              <motion.span
                className="inline-block w-2 h-4 bg-indigo-400 ml-0.5"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">

          {/* Mobile Logo (Visible only on small screens) */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">U&I</span>
          </div>

          <div className="text-left">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-slate-500 mt-2">Enter your credentials to access your workspace.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-md flex items-start gap-3">
               <div className="text-red-500 mt-0.5">!</div>
               <p className="text-sm text-red-700">{error}</p>
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
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="relative group">
                <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                    Password
                    </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                  {password && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
