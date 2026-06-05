import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrashCan, faMapLocationDot, faRoute, faChartArea,
  faShieldHalved, faBolt, faEnvelope, faLock, faUser, faPhone,
  faLocationCrosshairs, faArrowRight, faEye, faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [heroExiting, setHeroExiting] = useState(false);
  const [heroGone, setHeroGone] = useState(false);
  const featuresRef = useRef(null);
  const authRef = useRef(null);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'manager' ? '/manager' : '/citizen', { replace: true });
    }
  }, [user, navigate]);

  const handleGetStarted = () => {
    if (heroGone) {
      featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setHeroExiting(true);
    setTimeout(() => {
      setHeroGone(true);
      setTimeout(() => {
        featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 1800);
  };

  const handleSignIn = () => {
    if (heroGone) {
      authRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setHeroExiting(true);
    setTimeout(() => {
      setHeroGone(true);
      setTimeout(() => {
        authRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 1800);
  };

  return (
    <div className="landing-root">
      {/* HERO - Page 1 */}
      {!heroGone && (
        <HeroSection
          heroExiting={heroExiting}
          onGetStarted={handleGetStarted}
          onSignIn={handleSignIn}
        />
      )}

      {/* FEATURES - Page 2 */}
      <div ref={featuresRef}>
        <FeaturesSection />
      </div>

      {/* AUTH - Page 3 with morph-in */}
      <div ref={authRef}>
        <AuthMorphWrapper />
      </div>

      <Footer />
    </div>
  );
}

/* ─── HERO SECTION ─── */
function HeroSection({ heroExiting, onGetStarted, onSignIn }) {
  const [textPhase, setTextPhase] = useState('idle'); // idle | folding | moving | gone
  const [binPhase, setBinPhase] = useState('idle');   // idle | lidOpen | lidClose | exit

  useEffect(() => {
    if (!heroExiting) return;
    // Step 1: fold text
    setTextPhase('folding');
    setTimeout(() => {
      setTextPhase('moving');
      setBinPhase('lidOpen');
    }, 600);
    // Step 2: text enters bin
    setTimeout(() => {
      setBinPhase('lidClose');
      setTextPhase('gone');
    }, 1100);
    // Step 3: bin exits left
    setTimeout(() => {
      setBinPhase('exit');
    }, 1400);
  }, [heroExiting]);

  return (
    <section className="hero-section">
      {/* Background particles */}
      <div className="hero-particles">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`particle particle-${i}`} />
        ))}
      </div>

      {/* Dustbin - bottom right, big & tilted */}
      <div className={`dustbin-wrapper ${binPhase}`}>
        <div className="dustbin-container">
          <div className="dustbin-lid" />
          <div className="dustbin-body">
            <FontAwesomeIcon icon={faTrashCan} className="dustbin-icon" />
          </div>
        </div>
      </div>

      {/* Center content */}
      <div className={`hero-center ${textPhase}`}>
        <div className="hero-text-wrapper">
          <h1 className="hero-title">
            <span className="hero-title-line1">To manage</span>
            <span className="hero-title-line2">the Waste</span>
          </h1>
          <p className="hero-subtitle">Smart GIS-based waste collection &amp; route optimization</p>
        </div>

        <div className="hero-buttons">
          <button className="btn-get-started" onClick={onGetStarted}>
            <span>Get Started</span>
            <FontAwesomeIcon icon={faArrowRight} className="btn-arrow" />
          </button>
          <button className="btn-sign-in" onClick={onSignIn}>
            Sign In
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── FEATURES SECTION with scatter-on-exit ─── */
function FeaturesSection() {
  const ref = useRef(null);
  const isVisible = useInView(ref, { once: true, margin: '-60px' });

  // Track when the BOTTOM of the section scrolls UP through the viewport
  // "end end" = section bottom at viewport bottom (progress=0)
  // "end start" = section bottom at viewport top (progress=1)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['end end', 'end start']
  });

  const features = [
    { icon: faMapLocationDot, title: 'GIS Mapping', desc: 'Real-time spatial visualization of survey zones, bin distributions, and collection points on interactive maps.' },
    { icon: faRoute, title: 'Route Optimization', desc: 'Advanced Dijkstra, A*, TSP algorithms to build fuel-efficient, high-coverage collection routes.' },
    { icon: faLocationCrosshairs, title: 'Road Analysis', desc: 'Measures road widths to determine vehicle suitability — trucks for highways, rickshaws for alleys.' },
    { icon: faChartArea, title: 'Complaint Heatmaps', desc: 'Density overlays from geo-tagged complaints to identify waste dumping hotspots in real-time.' },
    { icon: faShieldHalved, title: 'Dual Portal', desc: 'Managers get scheduling tools. Citizens get direct complaint submission with location tagging.' },
    { icon: faBolt, title: 'Analytics Engine', desc: 'Collection frequency logs, waste load averages, and fleet distribution metrics for data-driven decisions.' },
  ];

  // Cards scatter outward in all directions
  const scatterDirections = [
    { x: -200, y: -80 },
    { x: 0, y: -100 },
    { x: 200, y: -80 },
    { x: -200, y: 80 },
    { x: 0, y: 100 },
    { x: 200, y: 80 },
  ];

  return (
    <section id="features" ref={ref} className="features-section">
      <div className="features-inner">
        <div className="features-header">
          <span className="section-tag">Platform Capabilities</span>
          <h2 className="section-title">Intelligent Waste Infrastructure</h2>
          <div className="section-divider" />
        </div>

        <div className="features-grid">
          {features.map((f, i) => {
            const dir = scatterDirections[i];
            // 0 = section bottom at viewport bottom, 1 = section bottom at viewport top
            // scatter starts at 0.15 (user scrolls a bit past) and ends at 0.7
            const cardX = useTransform(scrollYProgress, [0.15, 0.7], [0, dir.x]);
            const cardY = useTransform(scrollYProgress, [0.15, 0.7], [0, dir.y]);
            const cardOpacity = useTransform(scrollYProgress, [0.15, 0.65], [1, 0]);
            const cardScale = useTransform(scrollYProgress, [0.15, 0.7], [1, 0.6]);

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ x: cardX, y: cardY, opacity: cardOpacity, scale: cardScale }}
                className="feature-card"
              >
                <div className="feature-icon-wrap">
                  <FontAwesomeIcon icon={f.icon} className="feature-icon" />
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
                <div className="feature-glow" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── AUTH MORPH WRAPPER ─── */
function AuthMorphWrapper() {
  const ref = useRef(null);
  // "start end" = wrapper top hits viewport bottom (progress=0)
  // "start 0.5" = wrapper top hits viewport center (progress=1)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start 0.4']
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.7, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  const borderRadius = useTransform(scrollYProgress, [0, 1], [60, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [80, 0]);

  return (
    <motion.div ref={ref} style={{ scale, opacity, borderRadius, y, overflow: 'hidden', transformOrigin: 'center top' }}>
      <AuthSection />
    </motion.div>
  );
}

/* ─── AUTH SECTION ─── */
function AuthSection() {
  const [mode, setMode] = useState('login'); // login | signup | forgot
  const [role, setRole] = useState('citizen');
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const ref = useRef(null);
  const isVisible = useInView(ref, { once: true, margin: '-50px' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let user;
      if (mode === 'login') {
        user = await login(form.email, form.password);
      } else if (mode === 'signup') {
        user = await signup({ ...form, role });
      } else {
        // forgot password placeholder
        setError('Password reset link sent to your email (demo).');
        setLoading(false);
        return;
      }
      navigate(user.role === 'manager' ? '/manager' : '/citizen');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="auth-section" ref={ref} className="auth-section">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="auth-container"
      >
        {/* Auth header */}
        <div className="auth-header">
          <div className="auth-logo">
            <FontAwesomeIcon icon={faTrashCan} />
          </div>
          <h2 className="auth-title">
            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Sign in to access your waste management dashboard'
              : mode === 'signup'
              ? 'Join the smart waste management platform'
              : 'Enter your email to receive a reset link'}
          </p>
        </div>

        {/* Tab controls for login/signup */}
        {mode !== 'forgot' && (
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => { setMode('signup'); setError(''); }}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Role selection for signup */}
        <AnimatePresence>
          {mode === 'signup' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="role-select"
            >
              <p className="role-label">Select Your Role</p>
              <div className="role-btns">
                <button
                  className={`role-btn ${role === 'citizen' ? 'active' : ''}`}
                  onClick={() => setRole('citizen')}
                >
                  <FontAwesomeIcon icon={faUser} /> Citizen
                </button>
                <button
                  className={`role-btn ${role === 'manager' ? 'active' : ''}`}
                  onClick={() => setRole('manager')}
                >
                  <FontAwesomeIcon icon={faShieldHalved} /> Manager
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <>
              <div className="input-group">
                <FontAwesomeIcon icon={faUser} className="input-icon" />
                <input
                  type="text" placeholder="Full Name" required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
              </div>
              <div className="input-group">
                <FontAwesomeIcon icon={faPhone} className="input-icon" />
                <input
                  type="tel" placeholder="Phone (optional)"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="input-group">
            <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
            <input
              type="email" placeholder="Email Address" required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          {mode !== 'forgot' && (
            <div className="input-group">
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Password" required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
              </button>
            </div>
          )}

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="auth-error">
              {error}
            </motion.p>
          )}

          <button type="submit" disabled={loading} className="auth-submit">
            {loading ? 'Processing...'
              : mode === 'login' ? 'Sign In'
              : mode === 'signup' ? 'Create Account'
              : 'Send Reset Link'}
          </button>
        </form>

        {/* Bottom links */}
        <div className="auth-links">
          {mode === 'login' && (
            <>
              <button onClick={() => { setMode('forgot'); setError(''); }}>
                Forgot Password?
              </button>
              <span className="auth-links-divider">•</span>
              <button onClick={() => { setMode('signup'); setError(''); }}>
                Don't have an account? <strong>Sign Up</strong>
              </button>
            </>
          )}
          {mode === 'signup' && (
            <button onClick={() => { setMode('login'); setError(''); }}>
              Already have an account? <strong>Sign In</strong>
            </button>
          )}
          {mode === 'forgot' && (
            <button onClick={() => { setMode('login'); setError(''); }}>
              ← Back to Sign In
            </button>
          )}
        </div>
      </motion.div>
    </section>
  );
}

/* ─── FOOTER ─── */
function Footer() {
  return (
    <footer className="landing-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <FontAwesomeIcon icon={faTrashCan} className="footer-icon" />
          <span>EcoRoute</span>
        </div>
        <p>&copy; {new Date().getFullYear()} EcoRoute Waste Management. All rights reserved.</p>
      </div>
    </footer>
  );
}
