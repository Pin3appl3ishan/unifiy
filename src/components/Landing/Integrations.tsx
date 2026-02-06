import { motion } from 'framer-motion';

const icons = ['Slack', 'Drive', 'Notion', 'Figma', 'Linear', 'Github'];

export default function Integrations() {
  return (
    <section className="py-40 flex flex-col items-center">
      <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border border-white/5 rounded-full"
        />

        <div className="text-center z-10 px-4">
          <p className="text-sm uppercase tracking-widest text-emerald-500 mb-2">Integrations</p>
          <h3 className="text-2xl font-serif">You Don't Need <br/> 1,000 Tools And Tabs</h3>
        </div>

        {icons.map((icon, i) => {
          const angle = (i * (2 * Math.PI / icons.length)) - (Math.PI / 2); // Start from top
          return (
            <motion.div
              key={icon}
              className="absolute p-4 bg-emerald-950 border border-white/10 rounded-2xl shadow-xl"
              animate={{
                rotate: -360 // Counter-rotate to keep icons upright
              }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              style={{
                top: `${50 + 40 * Math.sin(angle)}%`,
                left: `${50 + 40 * Math.cos(angle)}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
               <div className="w-8 h-8 bg-emerald-800 rounded-md" />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
