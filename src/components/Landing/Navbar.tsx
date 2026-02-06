import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { scrollY } = useScroll();

  // Spring config for smooth animations
  const springConfig = { stiffness: 100, damping: 20, mass: 0.5 };

  // Raw transforms
  const containerBgRaw = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)']
  );

  const borderRadiusRaw = useTransform(
    scrollY,
    [0, 100],
    [0, 12]
  );
  const borderRadius = useSpring(borderRadiusRaw, springConfig);

  const boxShadowOpacity = useTransform(
    scrollY,
    [0, 100],
    [0, 0.1]
  );

  const containerPaddingX = useTransform(
    scrollY,
    [0, 100],
    [0, 48]
  );
  const containerPaddingXSpring = useSpring(containerPaddingX, springConfig);

  const containerPaddingY = useTransform(
    scrollY,
    [0, 100],
    [16, 12]
  );

  // Margin top for scroll phase - dock floats below top
  const marginTopRaw = useTransform(
    scrollY,
    [0, 100],
    [0, 12]
  );
  const marginTop = useSpring(marginTopRaw, springConfig);

  // Logo position - starts far left, stays left in dock
  const logoXRaw = useTransform(
    scrollY,
    [0, 100],
    [-24, -30]
  );
  const logoX = useSpring(logoXRaw, springConfig);

  const logoColor = useTransform(
    scrollY,
    [0, 100],
    ['#ffffff', '#0a1a14']
  );

  // Buttons position - starts far right, moves closer but with more space in dock
  const buttonsXRaw = useTransform(
    scrollY,
    [0, 100],
    [24, 36]
  );
  const buttonsX = useSpring(buttonsXRaw, springConfig);

  // Nav links color
  const navLinkColor = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 255, 255, 0.6)', '#0a1a14']
  );

  // Login button visibility
  const loginOpacity = useTransform(
    scrollY,
    [0, 50],
    [1, 0]
  );

  const loginWidthRaw = useTransform(
    scrollY,
    [0, 100],
    [70, 0]
  );
  const loginWidth = useSpring(loginWidthRaw, springConfig);

  const loginPaddingRaw = useTransform(
    scrollY,
    [0, 100],
    [16, 0]
  );
  const loginPadding = useSpring(loginPaddingRaw, springConfig);

  // Join button style changes
  const joinBtnBg = useTransform(
    scrollY,
    [0, 100],
    ['#ffffff', '#0a1a14']
  );

  const joinBtnColor = useTransform(
    scrollY,
    [0, 100],
    ['#000000', '#ffffff']
  );

  // Gap between logo/nav and nav/buttons
  const gapSizeRaw = useTransform(
    scrollY,
    [0, 100],
    [280, 64]
  );
  const gapSize = useSpring(gapSizeRaw, springConfig);

  return (
    <motion.div
      style={{ paddingTop: marginTop }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
    >
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          backgroundColor: containerBgRaw,
          paddingTop: containerPaddingY,
          paddingBottom: containerPaddingY,
          paddingLeft: containerPaddingXSpring,
          paddingRight: containerPaddingXSpring,
          borderRadius: borderRadius,
        }}
        className="flex items-center justify-center pointer-events-auto transition-shadow duration-300"
      >
        {/* Shadow overlay for smooth transition */}
        <motion.div
          style={{
            opacity: boxShadowOpacity,
            borderRadius: borderRadius,
          }}
          className="absolute inset-0 shadow-[0_4px_30px_rgba(0,0,0,0.15)] pointer-events-none"
        />

        {/* Logo */}
        <motion.div
          style={{
            color: logoColor,
            x: logoX,
            marginRight: gapSize,
          }}
          className="text-2xl font-serif font-bold tracking-tighter relative z-10"
        >
          U&I
        </motion.div>

        {/* Nav Items */}
        <motion.div
          style={{ marginRight: gapSize }}
          className="hidden md:flex gap-6 text-sm font-medium relative z-10"
        >
          <motion.a
            href="#"
            style={{ color: navLinkColor }}
            className="hover:opacity-70 transition-opacity"
          >
            Products
          </motion.a>
          <motion.a
            href="#"
            style={{ color: navLinkColor }}
            className="hover:opacity-70 transition-opacity"
          >
            Journal
          </motion.a>
          <motion.a
            href="#"
            style={{ color: navLinkColor }}
            className="hover:opacity-70 transition-opacity"
          >
            About
          </motion.a>
        </motion.div>

        {/* Buttons */}
        <motion.div
          style={{ x: buttonsX }}
          className="flex items-center gap-3 relative z-10"
        >
          <Link to="/login">
            <motion.button
              style={{
                opacity: loginOpacity,
                width: loginWidth,
                paddingLeft: loginPadding,
                paddingRight: loginPadding,
              }}
              className="py-2 rounded-lg text-sm font-medium text-white bg-white/16 hover:bg-white/12 transition-colors overflow-hidden whitespace-nowrap"
            >
              Log In
            </motion.button>
          </Link>
          <Link to="/">
            <motion.button
              style={{
                backgroundColor: joinBtnBg,
                color: joinBtnColor,
              }}
              className="px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity whitespace-nowrap"
            >
              Free Whiteboard
            </motion.button>
          </Link>
        </motion.div>
      </motion.nav>
    </motion.div>
  );
}
