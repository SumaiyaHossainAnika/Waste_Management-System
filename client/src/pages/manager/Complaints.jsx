import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faCheck, faClock, faSpinner, faXmark, faFilter, faChartSimple } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

const statusColors = { pending: 'bg-amber-500/15 text-amber-400', in_progress: 'bg-sky-500/15 text-sky-400', resolved: 'bg-emerald-500/15 text-emerald-400', rejected: 'bg-red-500/15 text-red-400' };
const statusIcons = { pending: faClock, in_progress: faSpinner, resolved: faCheck, rejected: faXmark };
const sevColors = { low: 'text-emerald-400', medium: 'text-amber-400', high: 'text-orange-400', critical: 'text-red-400' };

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => { load(); }, [filter]);
  const load = () => api.get(`/complaints${filter ? `?status=${filter}` : ''}`).then(r => setComplaints(r.data.complaints)).catch(() => {});

  const updateStatus = async (id, status) => { await api.put(`/complaints/${id}/status`, { status }); load(); };

  const counts = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-eco-text">Complaints</h1>
        <p className="text-eco-secondary text-sm leading-relaxed mt-1">Citizen-reported issues and complaints</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {[
          { label: 'Total', value: counts.total, icon: faChartSimple },
          { label: 'Pending', value: counts.pending, icon: faClock },
          { label: 'Resolved', value: counts.resolved, icon: faCheck },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-8 flex flex-col items-center gap-6 stat-card-xl">
            <div className="w-14 h-14 rounded-xl bg-eco-primary/20 border border-eco-accent/15 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={s.icon} className="text-eco-accent text-lg" />
            </div>
            <div className="text-center">
              <p className="font-mono text-4xl font-bold text-eco-text mb-2">{s.value}</p>
              <p className="text-eco-secondary text-sm font-medium leading-relaxed">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4">
        <FontAwesomeIcon icon={faFilter} className="text-eco-secondary text-base shrink-0" />
        <div className="flex gap-3">
          {['', 'pending', 'in_progress', 'resolved', 'rejected'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`filter-btn ${filter === s ? 'active' : ''}`}>
              {s ? s.replace('_', ' ').replace(/^\w/, c => c.toUpperCase()) : 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {complaints.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="glass rounded-2xl p-8 hover:border-eco-primary/30 transition-all group">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-4 mb-5 flex-wrap">
                  <h3 className="text-eco-text font-bold text-2xl line-clamp-1">{c.title}</h3>
                  <span className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase shrink-0 flex items-center gap-2 ${statusColors[c.status]} border border-current border-opacity-20`}>
                    <FontAwesomeIcon icon={statusIcons[c.status]} />{c.status?.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-eco-secondary text-base mb-6 leading-relaxed">{c.description}</p>
                {c.photo_url && (
                  <div className="mb-6 rounded-xl overflow-hidden max-w-sm border border-eco-primary/15 shadow-lg shadow-black/20">
                    <img src={c.photo_url} alt="Reported issue" className="w-full h-auto object-cover max-h-64" />
                  </div>
                )}
                <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-eco-secondary leading-relaxed">
                  <span className="font-medium text-eco-text">By: {c.reporter_name || 'Unknown'}</span>
                  <span>Category: <span className="text-eco-text capitalize font-medium">{c.category?.replace('_', ' ')}</span></span>
                  <span>Severity: <span className={`font-bold uppercase ${sevColors[c.severity]}`}>{c.severity}</span></span>
                  <span className="hidden sm:inline">Loc: <span className="text-eco-text font-mono">{parseFloat(c.latitude).toFixed(3)}, {parseFloat(c.longitude).toFixed(3)}</span></span>
                  <span>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-3 shrink-0 lg:flex-col items-stretch lg:items-end">
                {c.status === 'pending' && (
                  <button onClick={() => updateStatus(c.id, 'in_progress')}
                    className="w-32 h-11 rounded-xl bg-sky-500/15 text-sky-400 text-sm font-semibold hover:bg-sky-500/25 transition-all whitespace-nowrap border border-sky-500/30 flex items-center justify-center">
                    Accept
                  </button>
                )}
                {(c.status === 'pending' || c.status === 'in_progress') && (
                  <button onClick={() => updateStatus(c.id, 'resolved')}
                    className="w-32 h-11 rounded-xl bg-emerald-500/15 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/25 transition-all whitespace-nowrap border border-emerald-500/30 flex items-center justify-center">
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {complaints.length === 0 && (
          <div className="glass rounded-3xl p-8 sm:p-16 md:p-24 text-center">
            <div 
              className="w-28 h-28 rounded-2xl bg-eco-primary/10 flex items-center justify-center mb-8"
              style={{ marginLeft: 'auto', marginRight: 'auto' }}
            >
              <FontAwesomeIcon icon={faTriangleExclamation} className="text-eco-primary/40 text-5xl" />
            </div>
            <p className="text-eco-text font-display font-bold text-2xl mb-3">No complaints found</p>
            <p className="text-eco-secondary text-base leading-relaxed">Citizen reports will appear here when submitted</p>
          </div>
        )}
      </div>
    </div>
  );
}
