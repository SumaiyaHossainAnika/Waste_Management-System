import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse, faTriangleExclamation, faClipboardList,
  faRecycle, faRightFromBracket, faBars, faXmark, faLeaf
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/citizen', icon: faHouse, label: 'Dashboard', end: true },
  { to: '/citizen/report', icon: faTriangleExclamation, label: 'Report Issue' },
  { to: '/citizen/complaints', icon: faClipboardList, label: 'My Complaints' },
];

export default function CitizenLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="manager-layout">
      {/* Desktop Sidebar */}
      <motion.aside
        className="manager-sidebar"
        animate={{ width: sidebarOpen ? 256 : 72 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Logo */}
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">
            <FontAwesomeIcon icon={faRecycle} className="text-white text-lg" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="overflow-hidden">
                <h1 className="font-display text-lg font-bold text-eco-text whitespace-nowrap">EcoRoute</h1>
                <p className="text-[10px] text-eco-secondary tracking-wider uppercase">Citizen Portal</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav Links */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <FontAwesomeIcon icon={item.icon} className="sidebar-link-icon" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="sidebar-link-label">
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* Toggle + User */}
        <div className="sidebar-footer">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="sidebar-footer-btn">
            <FontAwesomeIcon icon={faBars} className="sidebar-link-icon" />
            {sidebarOpen && <span>Collapse</span>}
          </button>
          <button onClick={handleLogout} className="sidebar-footer-btn sidebar-logout-btn">
            <FontAwesomeIcon icon={faRightFromBracket} className="sidebar-link-icon" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mobile-overlay" onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="mobile-sidebar"
            >
              <div className="sidebar-header" style={{ justifyContent: 'space-between' }}>
                <div className="flex items-center gap-3">
                  <div className="sidebar-logo-icon">
                    <FontAwesomeIcon icon={faRecycle} className="text-white text-lg" />
                  </div>
                  <div>
                    <h1 className="font-display text-lg font-bold text-eco-text">EcoRoute</h1>
                    <p className="text-[10px] text-eco-secondary tracking-wider uppercase">Citizen Portal</p>
                  </div>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-eco-text/60 hover:text-eco-accent transition-colors">
                  <FontAwesomeIcon icon={faXmark} className="text-xl" />
                </button>
              </div>
              <nav className="sidebar-nav">
                {navItems.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <FontAwesomeIcon icon={item.icon} className="sidebar-link-icon" />
                    <span className="sidebar-link-label">{item.label}</span>
                  </NavLink>
                ))}
              </nav>
              <div className="sidebar-footer">
                <button onClick={handleLogout} className="sidebar-footer-btn sidebar-logout-btn">
                  <FontAwesomeIcon icon={faRightFromBracket} className="sidebar-link-icon" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="manager-main">
        {/* Top Bar */}
        <header className="manager-topbar">
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-eco-text/70 hover:text-eco-accent shrink-0">
              <FontAwesomeIcon icon={faBars} className="text-xl" />
            </button>
            <div className="flex items-center gap-2 text-eco-secondary text-sm min-w-0">
              <FontAwesomeIcon icon={faLeaf} className="text-eco-accent text-xs shrink-0" />
              <span className="truncate">Citizen Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-eco-text truncate max-w-[160px]">{user?.full_name}</p>
              <p className="text-xs text-eco-secondary truncate max-w-[160px]">{user?.email}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-eco-primary to-eco-accent flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="manager-content">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
