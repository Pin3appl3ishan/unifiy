import { motion } from 'framer-motion';

interface FeatureProps {
  title: string;
  description: string;
  reverse?: boolean;
  image: string;
}

export default function FeatureSection({ title, description, reverse }: FeatureProps) {
  return (
    <section className="px-6 py-24 max-w-7xl mx-auto relative">
      <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16`}>
        <motion.div
          initial={{ opacity: 0, x: reverse ? 50 : -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 space-y-6"
        >
          <h2 className="text-4xl md:text-5xl font-serif leading-tight">{title}</h2>
          <p className="text-lg text-emerald-200/50 leading-relaxed max-w-md">
            {description}
          </p>
          <a href="#" className="inline-block border-b border-emerald-500/50 pb-1 text-sm font-medium hover:text-emerald-400 transition-colors">
            Learn more
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex-1 w-full relative"
        >
          {/* Ambient glow behind the visual */}
          <motion.div
            className={`absolute ${reverse ? '-left-20' : '-right-20'} top-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none`}
            style={{
              background: reverse
                ? 'radial-gradient(circle, rgba(20, 184, 166, 0.3) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 overflow-hidden shadow-2xl relative group">
             {/* Inner glow effect */}
             <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
             <div className="absolute inset-0 bg-emerald-900/20 group-hover:bg-emerald-900/10 transition-colors" />
             <div className="p-8 h-full flex items-center justify-center relative z-10">
                <div className="w-full h-full bg-[#0a1a14] rounded-lg shadow-inner border border-white/5" />
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
