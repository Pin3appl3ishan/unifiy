import { motion } from 'framer-motion';
import { Navbar, Hero, Integrations, FeatureSection, BentoGrid, Footer } from '../components/Landing';

export default function Landing() {
  return (
    <div className="bg-[#0a1a14] text-[#e0e7e1] selection:bg-emerald-500/30 font-sans antialiased min-h-screen">
      <Navbar />

      <main>
        <Hero />

        <Integrations />

        <div className="py-20">
          <FeatureSection
            title="A Place Where Things Don't Get Lost"
            description="U&I captures everything you draw, code, and think. It's your second brain, but faster and more intuitive than ever before."
            image="ui-capture.png"
          />

          <FeatureSection
            title="Code Meets Canvas"
            description="Write code directly on your whiteboard with CodePad. Perfect for architecture diagrams, algorithm sketches, and collaborative debugging."
            image="ui-search.png"
            reverse
          />

          <FeatureSection
            title="See All Your Content & Research"
            description="Centralize your knowledge. Whether it's a diagram, a code snippet, or a brainstorm—U&I keeps it all in one cohesive workspace."
            image="ui-research.png"
          />
        </div>

        <section className="bg-white/5 py-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif">What If You Never Forgot?</h2>
          </div>
          <BentoGrid />
        </section>

        {/* Final CTA Section */}
        <section className="py-40 text-center px-6 bg-gradient-to-b from-transparent to-[#06110d] relative overflow-hidden">
          {/* Dramatic gradient blobs */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500 rounded-full blur-[120px] opacity-20"
              animate={{
                x: [0, 30, 0],
                y: [0, -20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-teal-500 rounded-full blur-[100px] opacity-20"
              animate={{
                x: [0, -30, 0],
                y: [0, 20, 0],
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-cyan-500 rounded-full blur-[100px]"
              animate={{
                opacity: [0.1, 0.2, 0.1],
                scale: [0.9, 1.1, 0.9],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
             <h2 className="text-4xl md:text-7xl font-serif mb-8 leading-tight">
               For Those Who Value <br/>
               <span className="italic opacity-70">Artisan Level Work.</span>
             </h2>
             <button className="bg-white text-black px-10 py-5 rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-xl">
               Join The Waitlist
             </button>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
