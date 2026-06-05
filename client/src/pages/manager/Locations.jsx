import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faPlus, faPen, faTrash, faXmark, faMapLocationDot } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', latitude: '', longitude: '', covered_area: '', total_employees: '', daily_load_tons: '', peak_day: '', sorting_system: '' });

  useEffect(() => { load(); }, []);
  const load = () => api.get('/locations').then(r => setLocations(r.data.locations));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/locations/${editing}`, form); }
      else { await api.post('/locations', form); }
      load(); setShowForm(false); setEditing(null);
      setForm({ name: '', latitude: '', longitude: '', covered_area: '', total_employees: '', daily_load_tons: '', peak_day: '', sorting_system: '' });
    } catch (err) { console.error(err); }
  };

  const handleEdit = (loc) => {
    setEditing(loc.id);
    setForm({ name: loc.name, latitude: loc.latitude, longitude: loc.longitude, covered_area: loc.covered_area || '', total_employees: loc.total_employees || '', daily_load_tons: loc.daily_load_tons || '', peak_day: loc.peak_day || '', sorting_system: loc.sorting_system || '', status: loc.status });
    setShowForm(true);
  };

  const handleDelete = async (id) => { await api.delete(`/locations/${id}`); load(); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-eco-text">Locations</h1>
          <p className="text-eco-secondary text-sm leading-relaxed mt-1">Manage waste collection survey locations</p>
        </div>
        {!showForm && (
          <button onClick={() => { setShowForm(true); setEditing(null); }}
            className="btn-primary mr-6 shrink-0">
            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Location
          </button>
        )}
      </div>

      {showForm && (
        <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="glass rounded-2xl p-10 space-y-7">
          <h3 className="text-eco-text font-bold text-2xl">{editing ? 'Edit Location' : 'New Location'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[{ key: 'name', label: 'Name', type: 'text', required: true }, { key: 'latitude', label: 'Latitude', type: 'number', required: true }, { key: 'longitude', label: 'Longitude', type: 'number', required: true }, { key: 'covered_area', label: 'Covered Area', type: 'text' }, { key: 'total_employees', label: 'Total Employees', type: 'number' }, { key: 'daily_load_tons', label: 'Daily Load (tons)', type: 'number' }, { key: 'peak_day', label: 'Peak Day', type: 'text' }].map(f => (
              <div key={f.key}>
                <label className="text-eco-secondary text-xs font-semibold mb-3 block uppercase tracking-wider">{f.label}</label>
                <input type={f.type} step="any" required={f.required} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full px-5 py-4 rounded-lg bg-eco-bg/60 border border-eco-primary/20 text-eco-text text-base focus:outline-none focus:border-eco-accent/50 transition-colors leading-relaxed" />
              </div>
            ))}
          </div>
          <div>
            <label className="text-eco-secondary text-xs font-semibold mb-3 block uppercase tracking-wider">Sorting System</label>
            <textarea value={form.sorting_system} onChange={e => setForm({ ...form, sorting_system: e.target.value })} rows={3}
              style={{ padding: '16px 20px' }}
              className="w-full rounded-lg bg-eco-bg/60 border border-eco-primary/20 text-eco-text text-base focus:outline-none focus:border-eco-accent/50 resize-none transition-colors leading-relaxed" />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
              className="px-6 h-[46px] rounded-xl bg-eco-surface/40 hover:bg-eco-surface/60 text-eco-text font-semibold text-sm transition-all flex items-center justify-center">
              Cancel
            </button>
            <button type="submit" className="px-8 h-[46px] rounded-xl bg-gradient-to-r from-eco-primary to-eco-secondary text-white font-semibold text-sm hover:shadow-lg hover:shadow-eco-primary/30 transition-all flex items-center justify-center gap-2">
              {editing ? 'Update Location' : 'Add Location'}
            </button>
          </div>
        </motion.form>
      )}

      {/* Location Summary */}
      <div className="glass rounded-2xl p-8 flex items-center gap-6 border border-eco-primary/20 stat-card-xl">
        <div className="w-16 h-16 rounded-lg bg-eco-primary/20 border border-eco-accent/15 flex items-center justify-center shrink-0">
          <FontAwesomeIcon icon={faMapLocationDot} className="text-eco-accent text-xl" />
        </div>
        <div className="min-w-0">
          <p className="font-mono text-4xl font-bold text-eco-text mb-1">{locations.length}</p>
          <p className="text-eco-secondary text-sm font-medium leading-relaxed">Total Locations</p>
        </div>
      </div>

      <div className="space-y-6">
        {locations.map((loc, i) => (
          <motion.div key={loc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="glass rounded-2xl p-8 hover:border-eco-primary/30 transition-all group">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="flex items-start gap-6 min-w-0 flex-1">
                <div className="w-14 h-14 rounded-lg bg-eco-primary/15 flex items-center justify-center shrink-0 mt-1">
                  <FontAwesomeIcon icon={faLocationDot} className="text-eco-accent text-2xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-eco-text font-bold text-2xl line-clamp-1 mb-2">{loc.name}</h3>
                  <p className="text-eco-secondary text-base mt-2 line-clamp-1 leading-relaxed mb-4">{loc.covered_area}</p>
                  <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-eco-secondary leading-relaxed">
                    <span>Lat: <span className="text-eco-text font-mono font-semibold">{parseFloat(loc.latitude).toFixed(4)}</span></span>
                    <span>Lng: <span className="text-eco-text font-mono font-semibold">{parseFloat(loc.longitude).toFixed(4)}</span></span>
                    <span>Employees: <span className="text-eco-text font-semibold">{loc.total_employees}</span></span>
                    <span>Load: <span className="text-eco-text font-semibold">{loc.daily_load_tons || '--'}</span> tons/day</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                <button onClick={() => handleEdit(loc)} className="p-3 rounded-lg hover:bg-eco-primary/20 text-eco-secondary hover:text-eco-accent transition-all">
                  <FontAwesomeIcon icon={faPen} className="text-base" />
                </button>
                <button onClick={() => handleDelete(loc.id)} className="p-3 rounded-lg hover:bg-red-500/15 text-eco-secondary hover:text-red-400 transition-all">
                  <FontAwesomeIcon icon={faTrash} className="text-base" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {locations.length === 0 && (
          <div className="glass rounded-3xl p-8 sm:p-16 md:p-24 text-center">
            <div className="w-28 h-28 rounded-2xl bg-eco-primary/10 flex items-center justify-center mx-auto mb-8">
              <FontAwesomeIcon icon={faLocationDot} className="text-eco-primary/30 text-5xl" />
            </div>
            <p className="text-eco-text font-display font-bold text-2xl mb-3">No locations yet</p>
            <p className="text-eco-secondary text-base leading-relaxed">Add your first survey location to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
