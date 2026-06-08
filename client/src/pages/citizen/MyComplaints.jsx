import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList, faClock, faSpinner, faCheck, faXmark, faFilter, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

const statusConfig = {
  pending: { icon: faClock, color: 'bg-amber-500/15 text-amber-400 border-amber-500/20', label: 'Pending Review', barColor: 'bg-amber-400' },
  in_progress: { icon: faSpinner, color: 'bg-sky-500/15 text-sky-400 border-sky-500/20', label: 'In Progress', barColor: 'bg-sky-400' },
  resolved: { icon: faCheck, color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', label: 'Resolved', barColor: 'bg-emerald-400' },
  rejected: { icon: faXmark, color: 'bg-red-500/15 text-red-400 border-red-500/20', label: 'Rejected', barColor: 'bg-red-400' },
};

const getPhotoUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  let apiBase = '';
  const baseURL = import.meta.env.VITE_API_URL;
  
  if (baseURL) {
    apiBase = baseURL.endsWith('/api') ? baseURL.slice(0, -4) : baseURL;
  } else {
    const currentHostname = window.location.hostname;
    const protocol = window.location.protocol;
    apiBase = `${protocol}//${currentHostname}:5000`;
  }

  const currentHostname = window.location.hostname;
  if (currentHostname !== 'localhost' && currentHostname !== '127.0.0.1') {
    apiBase = apiBase
      .replace('://localhost:', `://${currentHostname}:`)
      .replace('://127.0.0.1:', `://${currentHostname}:`);
  }

  if (window.location.protocol === 'https:') {
    apiBase = apiBase.replace(/^http:\/\//i, 'https://');
  }

  return `${apiBase}${url}`;
};

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.get(`/complaints${filter ? `?status=${filter}` : ''}`).then(r => setComplaints(r.data.complaints)).catch(() => {});
  }, [filter]);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-display text-5xl md:text-6xl font-bold text-eco-text mb-4">My Complaints</h1>
        <p className="text-eco-secondary text-base leading-relaxed">Track the status of your submitted reports</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4">
        <FontAwesomeIcon icon={faFilter} className="text-eco-secondary text-base shrink-0" />
        <div className="flex gap-3">
          {['', 'pending', 'in_progress', 'resolved'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`filter-btn ${filter === s ? 'active' : ''}`}>
              {s ? s.replace('_', ' ').replace(/^\w/, c => c.toUpperCase()) : 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {complaints.map((c, i) => {
          const sc = statusConfig[c.status] || statusConfig.pending;
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-8 hover:border-eco-primary/30 transition-all group">
              <div className="flex items-start justify-between gap-6 mb-6 flex-wrap">
                <div className="min-w-0 flex-1">
                  <h3 className="text-eco-text font-bold text-2xl mb-2 line-clamp-2">{c.title}</h3>
                  <p className="text-eco-secondary text-sm font-medium capitalize leading-relaxed">{c.category?.replace('_', ' ')}</p>
                </div>
                <span className={`px-5 py-3 rounded-lg text-xs font-semibold flex items-center gap-2 border border-current border-opacity-20 shrink-0 whitespace-nowrap ${sc.color}`}>
                  <FontAwesomeIcon icon={sc.icon} />{sc.label}
                </span>
              </div>
              <p className="text-eco-secondary text-base mb-6 leading-relaxed">{c.description}</p>
              {c.photo_url && (
                <>
                  <div className="rounded-xl overflow-hidden w-full max-w-sm border border-eco-primary/15 shadow-lg shadow-black/20">
                    <img src={getPhotoUrl(c.photo_url)} alt="Reported issue" className="w-full h-auto object-cover max-h-64" />
                  </div>
                  <div className="h-6" />
                </>
              )}

              {/* Progress bar */}
              <div className="flex items-center gap-3 mb-7">
                {['pending', 'in_progress', 'resolved'].map((step, idx) => {
                  const steps = ['pending', 'in_progress', 'resolved'];
                  const currentIdx = steps.indexOf(c.status);
                  const isActive = idx <= currentIdx;
                  return (
                    <div key={step} className="flex-1">
                      <div className={`h-3 rounded-full transition-colors ${isActive ? sc.barColor : 'bg-eco-surface'}`} />
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-eco-secondary leading-relaxed">
                <span className="font-medium text-eco-text">Submitted: {new Date(c.created_at).toLocaleDateString()}</span>
                <span className="hidden sm:inline">Location: <span className="text-eco-text font-mono">{parseFloat(c.latitude).toFixed(4)}, {parseFloat(c.longitude).toFixed(4)}</span></span>
                {c.severity && <span>Severity: <span className="text-eco-accent uppercase font-semibold">{c.severity}</span></span>}
                {c.resolved_at && <span>Resolved: {new Date(c.resolved_at).toLocaleDateString()}</span>}
              </div>
            </motion.div>
          );
        })}

        {complaints.length === 0 && (
          <div className="glass rounded-2xl text-center empty-state-box">
            <div 
              className="w-28 h-28 rounded-2xl bg-eco-primary/10 flex items-center justify-center mb-8"
              style={{ marginLeft: 'auto', marginRight: 'auto' }}
            >
              <FontAwesomeIcon icon={faClipboardList} className="text-eco-primary/40 text-5xl" />
            </div>
            <p className="text-eco-text font-display font-bold text-2xl mb-3">No complaints found</p>
            <p className="text-eco-secondary text-base mb-8 leading-relaxed">Try changing the filter or submit a new report</p>
            <a href="/citizen/report" className="btn-primary">
              <FontAwesomeIcon icon={faTriangleExclamation} className="mr-2" /> Report an issue
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
