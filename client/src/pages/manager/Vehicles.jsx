import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faPlus, faPen, faTrash, faXmark, faVanShuttle } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { useLocation } from '../../context/LocationContext';

export default function Vehicles() {
  const { location, isManagerScoped } = useLocation();
  const [vehicles, setVehicles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    location_id: '',
    vehicle_type: 'rickshaw_van',
    plate_number: '',
    capacity_tons: '',
    trips_per_day: 2
  });

  useEffect(() => {
    load();
    api.get('/locations').then(r => setLocations(r.data.locations));
  }, []);

  useEffect(() => {
    if (isManagerScoped && location) {
      setForm(prev => ({ ...prev, location_id: location.id }));
    }
  }, [location, isManagerScoped]);

  const load = () => api.get('/vehicles').then(r => setVehicles(r.data.vehicles));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/vehicles/${editing}`, form);
      else await api.post('/vehicles', form);
      load();
      setShowForm(false);
      setEditing(null);
      setForm({
        location_id: isManagerScoped && location ? location.id : '',
        vehicle_type: 'rickshaw_van',
        plate_number: '',
        capacity_tons: '',
        trips_per_day: 2
      });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredVehicles = isManagerScoped && location
    ? vehicles.filter(v => v.location_id === location.id)
    : vehicles;

  const typeColors = {
    rickshaw_van: 'bg-amber-500/15 text-amber-400',
    truck: 'bg-emerald-500/15 text-emerald-400'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-eco-text">Vehicles</h1>
          <p className="text-eco-secondary text-sm leading-relaxed mt-1">Manage collection fleet</p>
        </div>
        {!showForm && (
          <button onClick={() => { setShowForm(true); setEditing(null); }}
            className="btn-primary mr-6 shrink-0">
            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Vehicle
          </button>
        )}
      </div>

      {showForm && (
        <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="glass rounded-2xl p-10 mb-6">
          <h3 className="text-eco-text font-bold text-2xl mb-6">{editing ? 'Edit Vehicle' : 'New Vehicle'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-eco-secondary text-xs font-semibold mb-3 block uppercase tracking-wider">Location</label>
              <select value={form.location_id} onChange={e => setForm({ ...form, location_id: e.target.value })} required
                className="w-full px-5 py-4 rounded-lg bg-eco-bg/60 border border-eco-primary/20 text-eco-text text-base focus:outline-none focus:border-eco-accent/50 transition-colors leading-relaxed">
                <option value="">Select</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-eco-secondary text-xs font-semibold mb-3 block uppercase tracking-wider">Type</label>
              <select value={form.vehicle_type} onChange={e => setForm({ ...form, vehicle_type: e.target.value })}
                className="w-full px-5 py-4 rounded-lg bg-eco-bg/60 border border-eco-primary/20 text-eco-text text-base focus:outline-none focus:border-eco-accent/50 transition-colors leading-relaxed">
                <option value="rickshaw_van">Rickshaw Van</option>
                <option value="truck">Truck</option>
              </select>
            </div>
            <div>
              <label className="text-eco-secondary text-xs font-semibold mb-3 block uppercase tracking-wider">Plate Number</label>
              <input type="text" value={form.plate_number} onChange={e => setForm({ ...form, plate_number: e.target.value })}
                className="w-full px-5 py-4 rounded-lg bg-eco-bg/60 border border-eco-primary/20 text-eco-text text-base focus:outline-none focus:border-eco-accent/50 transition-colors leading-relaxed" />
            </div>
            <div>
              <label className="text-eco-secondary text-xs font-semibold mb-3 block uppercase tracking-wider">Capacity (tons)</label>
              <input type="number" step="0.01" value={form.capacity_tons} onChange={e => setForm({ ...form, capacity_tons: e.target.value })}
                className="w-full px-5 py-4 rounded-lg bg-eco-bg/60 border border-eco-primary/20 text-eco-text text-base focus:outline-none focus:border-eco-accent/50 transition-colors leading-relaxed" />
            </div>
            <div>
              <label className="text-eco-secondary text-xs font-semibold mb-3 block uppercase tracking-wider">Trips/Day</label>
              <input type="number" value={form.trips_per_day} onChange={e => setForm({ ...form, trips_per_day: e.target.value })}
                className="w-full px-5 py-4 rounded-lg bg-eco-bg/60 border border-eco-primary/20 text-eco-text text-base focus:outline-none focus:border-eco-accent/50 transition-colors leading-relaxed" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
              className="px-6 h-[46px] rounded-xl bg-eco-surface/40 hover:bg-eco-surface/60 text-eco-text font-semibold text-sm transition-all flex items-center justify-center">
              Cancel
            </button>
            <button type="submit" className="px-8 h-[46px] rounded-xl bg-gradient-to-r from-eco-primary to-eco-secondary text-white font-semibold text-sm hover:shadow-lg hover:shadow-eco-primary/30 transition-all flex items-center justify-center gap-2">
              {editing ? 'Update Vehicle' : 'Add Vehicle'}
            </button>
          </div>
        </motion.form>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {['rickshaw_van', 'truck'].map((type, i) => (
          <motion.div key={type} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-eco-accent/15 border border-eco-accent/15 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={type === 'truck' ? faTruck : faVanShuttle} className="text-eco-accent text-sm" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-xl font-bold text-eco-text">
                {filteredVehicles.filter(v => v.vehicle_type === type).length}
              </p>
              <p className="text-eco-secondary text-[10px] capitalize truncate">{type.replace('_', ' ')}s</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-eco-primary/15">
                <th className="text-center px-6 py-10 text-eco-secondary text-xs font-semibold uppercase tracking-wider">Plate</th>
                <th className="text-center px-6 py-10 text-eco-secondary text-xs font-semibold uppercase tracking-wider">Type</th>
                <th className="text-center px-6 py-10 text-eco-secondary text-xs font-semibold uppercase tracking-wider">Capacity</th>
                <th className="text-center px-6 py-10 text-eco-secondary text-xs font-semibold uppercase tracking-wider">Trips / Day</th>
                <th className="text-center px-6 py-10 text-eco-secondary text-xs font-semibold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((v, i) => (
                <motion.tr key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-eco-primary/8 hover:bg-eco-primary/5 transition-colors">
                  <td className="text-center px-6 py-8 text-eco-text font-mono text-sm font-medium">{v.plate_number || '--'}</td>
                  <td className="text-center px-6 py-8">
                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${typeColors[v.vehicle_type] || ''}`}>
                      {v.vehicle_type?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="text-center px-6 py-8 text-eco-secondary text-sm">{v.capacity_tons}T</td>
                  <td className="text-center px-6 py-8 text-eco-secondary text-sm">{v.trips_per_day}</td>
                  <td className="text-center px-6 py-8">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-eco-accent/20 text-eco-accent text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                      {v.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredVehicles.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-eco-primary/10 flex items-center justify-center mx-auto mb-3">
                <FontAwesomeIcon icon={faTruck} className="text-eco-primary/30 text-2xl" />
              </div>
              <p className="text-eco-secondary text-sm">No vehicles registered yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
