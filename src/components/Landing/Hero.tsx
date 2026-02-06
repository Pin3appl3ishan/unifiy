import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-40 px-6 overflow-hidden min-h-screen flex flex-col items-center">
      {/* Animated Gradient Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500 rounded-full blur-[120px] opacity-20"
          animate={{
            x: [0, 60, 0],
            y: [0, 40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-teal-500 rounded-full blur-[100px] opacity-20"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-cyan-500 rounded-full blur-[100px]"
          animate={{
            opacity: [0.1, 0.25, 0.1],
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10"
      >
        <h1 className="text-5xl md:text-8xl font-serif mb-8 tracking-tight">
          The Workspace That <br/> Remembers Your Flow
        </h1>
        <p className="text-emerald-200/60 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          U&I is your collaborative whiteboard with integrated code editing.
          Capture, organize, and create at the speed of thought.
        </p>
        <button className="bg-white text-black px-8 py-4 rounded-full font-medium hover:scale-105 transition-transform">
          Start drawing
        </button>
      </motion.div>

      {/* Product Screenshot */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative w-full max-w-7xl mt-20 mb-32 z-10 px-4"
      >
        <div className="relative aspect-[16/9] rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 overflow-hidden shadow-2xl">
          {/* Glow effect behind the screenshot */}
          <div className="absolute -inset-8 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 blur-3xl opacity-50" />

          {/* Screenshot container */}
          <div className="relative w-full h-full bg-[#0a1a14] flex items-center justify-center">
            {/* Placeholder - replace with actual screenshot */}
            <img src="/public/images/landing_hero.png" alt="U&I Whiteboard" className="w-full  object-cover" />
          </div>

          {/* Shine effect on top */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        </div>

        {/* Reflection/shadow beneath */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-4/5 h-12 bg-gradient-to-b from-emerald-500/10 to-transparent blur-2xl" />
      </motion.div>
    </section>
  );
}
