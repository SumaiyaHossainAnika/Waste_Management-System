import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faClipboardList, faClock, faCheck, faSpinner, faArrowRight, faChartSimple } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });

  useEffect(() => {
    api.get('/complaints').then(r => {
      const c = r.data.complaints;
      setComplaints(c.slice(0, 5));
      setStats({ total: c.length, pending: c.filter(x => x.status === 'pending').length, resolved: c.filter(x => x.status === 'resolved').length });
    }).catch(() => {});
  }, []);

  const statusColors = { pending: 'bg-amber-500/15 text-amber-400', in_progress: 'bg-sky-500/15 text-sky-400', resolved: 'bg-emerald-500/15 text-emerald-400', rejected: 'bg-red-500/15 text-red-400' };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-12">
      {/* Welcome Header */}
      <div>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <p className="text-eco-secondary text-sm font-medium mb-3 tracking-wide">{greeting()}</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-eco-text mb-4">{user?.full_name?.split(' ')[0] || 'Citizen'}</h1>
          <p className="text-eco-secondary text-base leading-relaxed">Report and track waste management issues in your area</p>
        </motion.div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {[
          { label: 'Total Reports', value: stats.total, icon: faChartSimple, delay: 0 },
          { label: 'Pending', value: stats.pending, icon: faClock, delay: 0.05 },
          { label: 'Resolved', value: stats.resolved, icon: faCheck, delay: 0.1 },
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: card.delay }}
            className="glass rounded-2xl p-8 group hover:border-eco-accent/30 transition-all stat-card-xl">
            <div className="flex flex-col items-center gap-6">
              <div className="w-14 h-14 rounded-xl bg-eco-primary/20 border border-eco-accent/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FontAwesomeIcon icon={card.icon} className="text-eco-accent text-lg" />
              </div>
              <div className="text-center">
                <p className="font-mono text-4xl font-bold text-eco-text mb-2">{card.value}</p>
                <p className="text-eco-secondary text-sm font-medium leading-relaxed">{card.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
 
      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <Link to="/citizen/report">
          <motion.div whileHover={{ y: -6 }} className="glass rounded-2xl p-10 hover:border-eco-accent/40 transition-all cursor-pointer group relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-eco-primary/10 to-transparent rounded-bl-full" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-xl bg-eco-primary/20 border border-eco-accent/15 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FontAwesomeIcon icon={faTriangleExclamation} className="text-eco-accent text-xl" />
              </div>
              <h3 className="text-eco-text font-display font-bold text-2xl mb-3">Report an Issue</h3>
              <p className="text-eco-secondary text-base mb-6 line-clamp-2 leading-relaxed">Report illegal dumping, overflowing bins, or missed collections</p>
              <div className="flex items-center gap-2 text-eco-accent text-base font-semibold group-hover:gap-3 transition-all">
                <span>Report Now</span>
                <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        </Link>
        <Link to="/citizen/complaints">
          <motion.div whileHover={{ y: -6 }} className="glass rounded-2xl p-10 hover:border-eco-accent/40 transition-all cursor-pointer group relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-eco-primary/10 to-transparent rounded-bl-full" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-xl bg-eco-primary/20 border border-eco-accent/15 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FontAwesomeIcon icon={faClipboardList} className="text-eco-accent text-xl" />
              </div>
              <h3 className="text-eco-text font-display font-bold text-2xl mb-3">My Complaints</h3>
              <p className="text-eco-secondary text-base mb-6 line-clamp-2 leading-relaxed">Track status of your submitted complaints</p>
              <div className="flex items-center gap-2 text-eco-accent text-base font-semibold group-hover:gap-3 transition-all">
                <span>View All</span>
                <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Recent Complaints */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-10 pb-6 border-b border-eco-primary/10">
          <h2 className="text-eco-text font-display font-bold text-2xl">Recent Reports</h2>
          <Link to="/citizen/complaints" className="text-eco-accent text-sm font-semibold hover:underline flex items-center gap-2">
            View All <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
          </Link>
        </div>
        <div className="p-10">
          {complaints.length > 0 ? (
            <div className="space-y-5">
              {complaints.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-eco-bg/40 rounded-xl p-6 border border-eco-primary/15 flex items-center justify-between gap-6 hover:border-eco-primary/40 transition-all group">
                  <div className="min-w-0 flex-1">
                    <p className="text-eco-text font-semibold text-lg mb-2 line-clamp-1">{c.title}</p>
                    <p className="text-eco-secondary text-sm">{new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase shrink-0 whitespace-nowrap border border-current border-opacity-20 ${statusColors[c.status]}`}>{c.status?.replace('_', ' ')}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center empty-state-box">
              <div className="w-24 h-24 rounded-2xl bg-eco-primary/10 centered-icon-box mb-8">
                <FontAwesomeIcon icon={faClipboardList} className="text-eco-primary/40 text-5xl" />
              </div>
              <p className="text-eco-secondary text-base mb-4 leading-relaxed">No complaints yet</p>
              <Link to="/citizen/report" className="text-eco-accent text-base font-semibold inline-flex items-center gap-2 hover:underline">
                Report your first issue <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
