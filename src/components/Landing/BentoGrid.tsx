import { motion } from 'framer-motion';

export default function BentoGrid() {
  const cards = [
    {
      title: "Multi-select",
      size: "col-span-1",
      gradient: "from-emerald-500/20 to-transparent",
      glowColor: "rgba(16, 185, 129, 0.15)",
    },
    {
      title: "AI Research",
      size: "col-span-2",
      gradient: "from-teal-500/20 to-transparent",
      glowColor: "rgba(20, 184, 166, 0.15)",
    },
    {
      title: "Fast Sync",
      size: "col-span-2",
      gradient: "from-cyan-500/20 to-transparent",
      glowColor: "rgba(6, 182, 212, 0.15)",
    },
    {
      title: "Visual Search",
      size: "col-span-1",
      gradient: "from-emerald-500/20 to-transparent",
      glowColor: "rgba(16, 185, 129, 0.15)",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            className={`${card.size} bg-[#12241d] border border-white/5 rounded-3xl p-8 min-h-[300px] flex flex-col justify-end relative overflow-hidden group cursor-pointer`}
            style={{
              boxShadow: `0 0 0 rgba(0,0,0,0)`,
            }}
          >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            {/* Corner glow on hover */}
            <motion.div
              className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ backgroundColor: card.glowColor }}
            />

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <h4 className="text-2xl font-serif relative z-10">{card.title}</h4>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
