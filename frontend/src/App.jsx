import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import ScanPage from './pages/ScanPage';
import DashboardPage from './pages/DashboardPage';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

const pageTransition = {
  duration: 0.28,
  ease: [0.25, 0.1, 0.25, 1],
};

function AnimatedRoute({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Navbar />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <AnimatedRoute>
                <LandingPage />
              </AnimatedRoute>
            }
          />
          <Route
            path="/scan"
            element={
              <AnimatedRoute>
                <ScanPage />
              </AnimatedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AnimatedRoute>
                <DashboardPage />
              </AnimatedRoute>
            }
          />
          <Route
            path="/dashboard/:tab"
            element={
              <AnimatedRoute>
                <DashboardPage />
              </AnimatedRoute>
            }
          />
        </Routes>
      </AnimatePresence>

      {!isDashboard && <Footer />}
    </>
  );
}
