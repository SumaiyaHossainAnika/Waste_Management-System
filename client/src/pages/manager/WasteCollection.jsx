// client/src/pages/manager/WasteCollection.jsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRecycle, faBottleWater, faWineBottle,
  faLeaf, faLayerGroup, faPlus, faCalendarDays,
  faWeightHanging, faTimes, faCheck,
  faUser, faTruck, faLocationDot, faBoxesStacked,
} from '@fortawesome/free-solid-svg-icons';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';

// ── Config ──────────────────────────────────────────────────
const WASTE_TYPES = [
  { key: 'plastic',  label: 'Plastic',  icon: faBottleWater, color: '#3B9EDE', bg: 'rgba(59,158,222,0.12)' },
  { key: 'glass',    label: 'Glass',    icon: faWineBottle,  color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
  { key: 'organic',  label: 'Organic',  icon: faLeaf,        color: '#7CCE97', bg: 'rgba(124,206,151,0.12)' },
  { key: 'mixed',    label: 'Mixed',    icon: faLayerGroup,  color: '#F5A623', bg: 'rgba(245,166,35,0.12)'  },
];

const typeMap = Object.fromEntries(WASTE_TYPES.map(t => [t.key, t]));

function fmtTons(tons) {
  const n = parseFloat(tons) || 0;
  return `${n.toFixed(3)} t`;
}

// ── Stat Card ────────────────────────────────────────────────
function StatCard({ type, total_tons, entries, animate, activeFilter }) {
  const cfg = typeMap[type] || typeMap.mixed;
  const isSelected = activeFilter === type;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animate * 0.08 }}
      className={`glass rounded-2xl p-6 flex items-center gap-5 transition-all duration-300 ${
        isSelected
          ? 'scale-[1.03] shadow-[0_0_15px_rgba(124,206,151,0.2)]'
          : activeFilter !== 'all'
          ? 'opacity-40 grayscale-[20%]'
          : ''
      }`}
      style={{
        borderColor: isSelected ? cfg.color : undefined
      }}
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}
      >
        <FontAwesomeIcon icon={cfg.icon} style={{ color: cfg.color }} className="text-2xl" />
      </div>
      <div className="min-w-0">
        <p className="text-eco-secondary text-xs uppercase tracking-widest mb-1">{cfg.label}</p>
        <p className="text-eco-text font-display font-bold text-2xl leading-none">{fmtTons(total_tons)}</p>
        <p className="text-eco-secondary text-xs mt-1">{entries} {parseInt(entries) === 1 ? 'entry' : 'entries'}</p>
      </div>
    </motion.div>
  );
}

// ── Log Row ──────────────────────────────────────────────────
function LogRow({ log, idx, activeFilter }) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.03 }}
      className="border-b border-eco-primary/8 hover:bg-eco-primary/5 text-xs text-eco-text/90"
    >
      <td className="py-3 px-2 whitespace-nowrap">
        {log.collection_date
          ? new Date(log.collection_date).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '-'}
      </td>

      <td className="py-3 px-2 max-w-[90px] truncate text-center" title={log.collector_name}>
        {log.collector_name}
      </td>

      <td className="py-3 px-2 max-w-[120px] truncate" title={log.location_name}>
        {log.location_name || '-'}
      </td>

      <td className="py-3 px-2 whitespace-nowrap">
        {log.plate_number || '-'}
      </td>

      <td className="py-3 px-2 font-bold text-eco-accent whitespace-nowrap">
        {log.total.toFixed(3)} t
      </td>

      <td className={`py-3 px-2 whitespace-nowrap transition-all duration-300 ${activeFilter === 'plastic' ? 'text-eco-accent font-bold bg-eco-primary/5' : 'text-eco-text/75'}`}>
        {log.plastic.toFixed(3)} t
      </td>

      <td className={`py-3 px-2 whitespace-nowrap transition-all duration-300 ${activeFilter === 'glass' ? 'text-eco-accent font-bold bg-eco-primary/5' : 'text-eco-text/75'}`}>
        {log.glass.toFixed(3)} t
      </td>

      <td className={`py-3 px-2 whitespace-nowrap transition-all duration-300 ${activeFilter === 'organic' ? 'text-eco-accent font-bold bg-eco-primary/5' : 'text-eco-text/75'}`}>
        {log.organic.toFixed(3)} t
      </td>

      <td className={`py-3 px-2 whitespace-nowrap transition-all duration-300 ${activeFilter === 'mixed' ? 'text-eco-accent font-bold bg-eco-primary/5' : 'text-eco-text/75'}`}>
        {log.mixed.toFixed(3)} t
      </td>

      <td className="py-3 px-2 max-w-[140px] truncate text-eco-secondary text-center" title={log.notes}>
        {log.notes || '-'}
      </td>
    </motion.tr>
  );
}

// ── Chart: daily by type ─────────────────────────────────────
function DailyChart({ daily, activeFilter, setActiveFilter }) {
  if (!daily || daily.length === 0) return null;

  const data = daily.map(row => {
    const d = new Date(row.collection_date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    });
    return {
      day: d,
      plastic: Number(row.plastic) || 0,
      glass: Number(row.glass) || 0,
      organic: Number(row.food_waste) || 0,
      mixed: (
        (Number(row.paper) || 0) +
        (Number(row.metal) || 0) +
        (Number(row.medical_waste) || 0) +
        (Number(row.construction_waste) || 0)
      )
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="glass rounded-2xl overflow-hidden"
    >
      <div className="p-6 border-b border-eco-primary/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-eco-text font-display font-bold text-lg flex items-center gap-3 !mb-0">
          <div className="w-7 h-7 rounded-lg bg-eco-accent/15 flex items-center justify-center">
            <FontAwesomeIcon icon={faCalendarDays} className="text-eco-accent text-sm" />
          </div>
          Daily Collection by Type — last 14 days
        </h3>

        <div className="flex flex-wrap gap-2">
          {[{ key: 'all', label: 'All' }, ...WASTE_TYPES].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveFilter(t.key)}
              className={`filter-btn ${activeFilter === t.key ? 'active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} barCategoryGap="30%">
            <XAxis dataKey="day" tick={{ fill: '#64B39A', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64B39A', fontSize: 11 }} axisLine={false} tickLine={false} unit=" t" />
            <Tooltip
              contentStyle={{ background: '#112E28', border: '1px solid rgba(100,179,154,0.2)', borderRadius: 12, color: '#E8F5E9', fontSize: 13 }}
              cursor={{ fill: 'rgba(45,120,104,0.08)' }}
            />
            <Legend wrapperStyle={{ paddingTop: 12, fontSize: 12 }} />
            {WASTE_TYPES.filter(t => activeFilter === 'all' || t.key === activeFilter).map(t => (
              <Bar key={t.key} dataKey={t.key} name={t.label} fill={t.color} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function WasteCollection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { location, isManagerScoped } = useLocation();
  const isHelal = user?.email?.toLowerCase() === 'helal@gmail.com';

  const [summary, setSummary]     = useState(null);
  const [logs, setLogs]           = useState([]);
  const [filter, setFilter]       = useState('all');
  const [showForm, setShowForm]   = useState(false);
  const [locations, setLocations] = useState([]);
  const [vehicles, setVehicles]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const [form, setForm] = useState({
    collector_name: '',
    vehicle_id: '',
    location_id: '',
    collection_date: new Date().toISOString().slice(0, 10),
    plastic_kg: '',
    glass_kg: '',
    organic_kg: '',
    mixed_kg: '',
    notes: ''
  });

  const setFormField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, logsRes, locRes, vehRes] = await Promise.all([
        api.get('/collections/analytics'),
        api.get('/collections'),
        api.get('/locations').catch(() => ({ data: { locations: [] } })),
        api.get('/vehicles').catch(() => ({ data: { vehicles: [] } })),
      ]);

      const allRecords = logsRes.data.records || [];
      const fetchedLocations = locRes.data.locations || [];
      const fetchedVehicles = vehRes.data.vehicles || [];

      // Filter records/logs based on logged-in manager scope
      const records = allRecords.filter(row => {
        if (isHelal) {
          return row.location_id >= 100 || row.location_id === 1;
        } else if (isManagerScoped && location) {
          return row.location_id === location.id;
        }
        return true;
      });

      // Group records by collection_date for daily chart
      const dailyMap = {};
      records.forEach(r => {
        const dateStr = r.collection_date ? r.collection_date.slice(0, 10) : '';
        if (!dateStr) return;
        if (!dailyMap[dateStr]) {
          dailyMap[dateStr] = {
            collection_date: dateStr,
            plastic: 0,
            glass: 0,
            food_waste: 0,
            paper: 0,
            metal: 0,
            medical_waste: 0,
            construction_waste: 0
          };
        }
        dailyMap[dateStr].plastic += Number(r.plastic_tons) || 0;
        dailyMap[dateStr].glass += Number(r.glass_tons) || 0;
        dailyMap[dateStr].food_waste += Number(r.food_waste_tons) || 0;
        dailyMap[dateStr].paper += Number(r.paper_tons) || 0;
        dailyMap[dateStr].metal += Number(r.metal_tons) || 0;
        dailyMap[dateStr].medical_waste += Number(r.medical_waste_tons) || 0;
        dailyMap[dateStr].construction_waste += Number(r.construction_waste_tons) || 0;
      });

      const daily = Object.values(dailyMap).sort((a, b) => new Date(a.collection_date) - new Date(b.collection_date));

      // Compute statistics based on filtered records
      const totalPlastic = records.reduce((acc, r) => acc + (Number(r.plastic_tons) || 0), 0);
      const totalGlass = records.reduce((acc, r) => acc + (Number(r.glass_tons) || 0), 0);
      const totalOrganic = records.reduce((acc, r) => acc + (Number(r.food_waste_tons) || 0), 0);
      const totalMixed = records.reduce((acc, r) => acc + (
        (Number(r.paper_tons) || 0) +
        (Number(r.metal_tons) || 0) +
        (Number(r.medical_waste_tons) || 0) +
        (Number(r.construction_waste_tons) || 0)
      ), 0);
      const totalWaste = totalPlastic + totalGlass + totalOrganic + totalMixed;

      const totals = [
        { waste_type: 'plastic', total_tons: totalPlastic, total_entries: records.length },
        { waste_type: 'glass',   total_tons: totalGlass,   total_entries: records.length },
        { waste_type: 'organic', total_tons: totalOrganic, total_entries: records.length },
        { waste_type: 'mixed',   total_tons: totalMixed,   total_entries: records.length }
      ];

      setSummary({
        grand: {
          total_tons: totalWaste,
          total_entries: records.length
        },
        totals,
        daily
      });

      setLogs(records);
      setLocations(fetchedLocations);
      setVehicles(fetchedVehicles);
    } catch (err) {
      console.error('[loadData] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [isHelal, isManagerScoped, location]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (e) => {
    e.preventDefault();
    const plastic_tons = (Number(form.plastic_kg) || 0) / 1000;
    const glass_tons = (Number(form.glass_kg) || 0) / 1000;
    const food_waste_tons = (Number(form.organic_kg) || 0) / 1000;
    const paper_tons = (Number(form.mixed_kg) || 0) / 1000;

    const total = plastic_tons + glass_tons + food_waste_tons + paper_tons;
    if (total <= 0) {
      setError('Enter at least one waste amount.');
      return;
    }

    setSaving(true);
    setError('');

    // Format collector name into notes if provided to keep schema compatibility
    const finalNotes = form.collector_name 
      ? `Collector: ${form.collector_name}. ${form.notes || ''}`.trim()
      : form.notes;

    try {
      await api.post('/collections', {
        location_id: form.location_id || null,
        vehicle_id: form.vehicle_id || null,
        collection_date: form.collection_date,
        plastic_tons,
        glass_tons,
        food_waste_tons,
        paper_tons,
        notes: finalNotes
      });

      setForm({
        collector_name: '',
        vehicle_id: '',
        location_id: '',
        collection_date: new Date().toISOString().slice(0, 10),
        plastic_kg: '',
        glass_kg: '',
        organic_kg: '',
        mixed_kg: '',
        notes: ''
      });
      setShowForm(false);
      loadData();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to save.'
      );
    } finally {
      setSaving(false);
    }
  };

  const grandTotal = summary?.grand?.total_tons;
  const grandEntries = summary?.grand?.total_entries;

  const groupedLogs = logs.map(row => {
    let collector = '-';
    let displayNotes = row.notes || '';
    
    if (row.notes && row.notes.startsWith('Collector: ')) {
      const match = row.notes.match(/^Collector:\s*([^.]+)\.\s*(.*)$/);
      if (match) {
        collector = match[1].trim();
        displayNotes = match[2].trim();
      } else {
        const firstDotIdx = row.notes.indexOf('.');
        if (firstDotIdx !== -1) {
          collector = row.notes.substring(11, firstDotIdx).trim();
          displayNotes = row.notes.substring(firstDotIdx + 1).trim();
        } else {
          collector = row.notes.substring(11).trim();
          displayNotes = '';
        }
      }
    }

    return {
      id: row.id,
      collection_date: row.collection_date,
      location_name: row.location_name === 'Dakshin Kafrul' ? 'Hitech, Kafrul' : row.location_name,
      plate_number: row.vehicle_no,
      collector_name: collector,
      total: Number(row.waste_tons) || 0,
      plastic: Number(row.plastic_tons) || 0,
      glass: Number(row.glass_tons) || 0,
      organic: Number(row.food_waste_tons) || 0,
      mixed: (
        (Number(row.paper_tons) || 0) +
        (Number(row.metal_tons) || 0) +
        (Number(row.medical_waste_tons) || 0) +
        (Number(row.construction_waste_tons) || 0)
      ),
      notes: displayNotes
    };
  });

  const filteredLogs = groupedLogs.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'plastic') return log.plastic > 0;
    if (filter === 'glass') return log.glass > 0;
    if (filter === 'organic') return log.organic > 0;
    if (filter === 'mixed') return log.mixed > 0;
    return true;
  });

  const displayLocations = isHelal
    ? locations.filter(l => l.id >= 100)
    : (isManagerScoped && location
        ? locations.filter(l => l.id === location.id)
        : locations);

  const displayVehicles = isManagerScoped && location
    ? vehicles.filter(v => v.location_id === location.id)
    : vehicles;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-eco-text">
            Waste Collection
          </h1>
          <p className="text-eco-secondary text-sm mt-1 leading-relaxed">
            Track waste collection by location and vehicle, view summaries and trends,
            and log new collection entries. Use the filters to analyze specific waste types.
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary shrink-0"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Log Entry
          </button>
        )}
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSave}
          className="glass rounded-2xl p-10 space-y-8"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-eco-text font-bold text-2xl !mb-0">Log Collection</h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-eco-text/60 hover:text-eco-accent transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-eco-secondary text-xs font-semibold mb-3 block uppercase tracking-wider">
                <FontAwesomeIcon icon={faCalendarDays} className="mr-2 text-[10px]" />
                Collection Date
              </label>
              <input
                type="date"
                required
                value={form.collection_date}
                onChange={e => setFormField('collection_date', e.target.value)}
                className="w-full h-[58px] px-5 rounded-lg bg-eco-bg/60 border border-eco-primary/20 text-eco-text text-base focus:outline-none focus:border-eco-accent/50 transition-colors"
              />
            </div>

            <div>
              <label className="text-eco-secondary text-xs font-semibold mb-3 block uppercase tracking-wider">
                <FontAwesomeIcon icon={faUser} className="mr-2 text-[10px]" />
                Collector Name
              </label>
              <input
                type="text"
                required
                value={form.collector_name}
                onChange={e => setFormField('collector_name', e.target.value)}
                placeholder="e.g. Rahim Uddin"
                className="w-full h-[58px] px-5 rounded-lg bg-eco-bg/60 border border-eco-primary/20 text-eco-text text-base focus:outline-none focus:border-eco-accent/50 transition-colors"
              />
            </div>

            {displayLocations.length > 0 && (
              <div>
                <label className="text-eco-secondary text-xs font-semibold mb-3 block uppercase tracking-wider">
                  <FontAwesomeIcon icon={faLocationDot} className="mr-2 text-[10px]" />
                  Location
                </label>
                <select
                  required
                  value={form.location_id}
                  onChange={e => setFormField('location_id', e.target.value)}
                  className="w-full h-[58px] px-5 rounded-lg bg-eco-bg/60 border border-eco-primary/20 text-eco-text text-base focus:outline-none focus:border-eco-accent/50 transition-colors"
                >
                  <option value="">Select location</option>
                  {displayLocations.map(l => (
                    <option key={l.id} value={l.id}>{l.name === 'Dakshin Kafrul' ? 'Hitech, Kafrul' : l.name}</option>
                  ))}
                </select>
              </div>
            )}

            {displayVehicles.length > 0 && (
              <div>
                <label className="text-eco-secondary text-xs font-semibold mb-3 block uppercase tracking-wider">
                  <FontAwesomeIcon icon={faTruck} className="mr-2 text-[10px]" />
                  Vehicle
                </label>
                <select
                  required
                  value={form.vehicle_id}
                  onChange={e => setFormField('vehicle_id', e.target.value)}
                  className="w-full h-[58px] px-5 rounded-lg bg-eco-bg/60 border border-eco-primary/20 text-eco-text text-base focus:outline-none focus:border-eco-accent/50 transition-colors"
                >
                  <option value="">Select vehicle</option>
                  {displayVehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.plate_number} ({v.vehicle_type?.replace('_', ' ')})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="text-eco-text font-bold text-lg font-display">Waste Breakdown (kg)</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="text-eco-secondary text-xs font-semibold mb-3 block uppercase tracking-wider">Plastic</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.plastic_kg}
                  onChange={e => setFormField('plastic_kg', e.target.value)}
                  placeholder="0.00"
                  className="w-full h-[58px] px-5 rounded-lg bg-eco-bg/60 border border-eco-primary/20 text-eco-text text-base focus:outline-none focus:border-eco-accent/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-eco-secondary text-xs font-semibold mb-3 block uppercase tracking-wider">Glass</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.glass_kg}
                  onChange={e => setFormField('glass_kg', e.target.value)}
                  placeholder="0.00"
                  className="w-full h-[58px] px-5 rounded-lg bg-eco-bg/60 border border-eco-primary/20 text-eco-text text-base focus:outline-none focus:border-eco-accent/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-eco-secondary text-xs font-semibold mb-3 block uppercase tracking-wider">Organic</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.organic_kg}
                  onChange={e => setFormField('organic_kg', e.target.value)}
                  placeholder="0.00"
                  className="w-full h-[58px] px-5 rounded-lg bg-eco-bg/60 border border-eco-primary/20 text-eco-text text-base focus:outline-none focus:border-eco-accent/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-eco-secondary text-xs font-semibold mb-3 block uppercase tracking-wider">Mixed</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.mixed_kg}
                  onChange={e => setFormField('mixed_kg', e.target.value)}
                  placeholder="0.00"
                  className="w-full h-[58px] px-5 rounded-lg bg-eco-bg/60 border border-eco-primary/20 text-eco-text text-base focus:outline-none focus:border-eco-accent/50 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-eco-secondary text-xs font-semibold mb-3 block uppercase tracking-wider">Notes</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={e => setFormField('notes', e.target.value)}
              placeholder="Any additional details..."
              className="w-full px-5 py-4 rounded-lg bg-eco-bg/60 border border-eco-primary/20 text-eco-text text-base focus:outline-none focus:border-eco-accent/50 resize-none transition-colors leading-relaxed"
            />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 h-[46px] rounded-xl bg-eco-surface/40 hover:bg-eco-surface/60 text-eco-text font-semibold text-sm transition-all flex items-center justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-8 h-[46px] flex items-center justify-center gap-2"
            >
              {saving ? (
                <span className="animate-pulse">Saving…</span>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} /> Save Entry
                </>
              )}
            </button>
          </div>
        </motion.form>
      )}

      {loading ? (
        <div className="text-center py-24">
          <FontAwesomeIcon icon={faRecycle} className="text-eco-primary/30 text-5xl animate-spin mb-4" />
          <p className="text-eco-secondary text-sm">Loading data…</p>
        </div>
      ) : (
        <>
          {/* Grand total banner */}
          {grandTotal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4"
              style={{ borderColor: 'rgba(124,206,151,0.25)' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-eco-accent/15 flex items-center justify-center">
                  <FontAwesomeIcon icon={faBoxesStacked} className="text-eco-accent text-xl" />
                </div>
                <div>
                  <p className="text-eco-secondary text-xs uppercase tracking-widest">Grand Total Collected</p>
                  <p className="text-eco-text font-display font-bold text-3xl">{fmtTons(grandTotal)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-eco-secondary text-xs uppercase tracking-widest">Total Entries</p>
                <p className="text-eco-text font-display font-bold text-3xl">{grandEntries}</p>
              </div>
            </motion.div>
          )}

          {/* Per-type stat cards */}
          {summary?.totals?.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {summary.totals.map((row, i) => (
                <StatCard
                  key={row.waste_type}
                  type={row.waste_type}
                  total_tons={row.total_tons || row.sum}
                  entries={row.total_entries || row.count}
                  animate={i}
                  activeFilter={filter}
                />
              ))}
            </div>
          )}

          {/* Daily chart */}
          {summary?.daily?.length > 0 && (
            <DailyChart
              daily={summary.daily}
              activeFilter={filter}
              setActiveFilter={setFilter}
            />
          )}

          {/* Log table */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glass rounded-2xl overflow-hidden"
          >
            {/* Table header */}
            <div className="p-6 border-b border-eco-primary/15">
              <h3 className="text-eco-text font-display font-bold text-lg flex items-center gap-3 !mb-0">
                <div className="w-7 h-7 rounded-lg bg-eco-accent/15 flex items-center justify-center">
                  <FontAwesomeIcon icon={faWeightHanging} className="text-eco-accent text-sm" />
                </div>
                Collection Log
                <span className="text-eco-secondary text-sm font-normal font-body">
                  ({filteredLogs.length} records)
                </span>
              </h3>
            </div>

            {filteredLogs.length === 0 ? (
              <div className="py-20 text-center">
                <FontAwesomeIcon icon={faRecycle} className="text-eco-primary/20 text-5xl mb-4" />
                <p className="text-eco-text font-display font-bold text-xl mb-2">No entries yet</p>
                <p className="text-eco-secondary text-sm">Click "Log Entry" to record your first collection.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-eco-primary/15">
                      {[
                        'Date',
                        'Collector',
                        'Location',
                        'Vehicle',
                        'Total',
                        'Plastic',
                        'Glass',
                        'Organic',
                        'Mixed',
                        'Notes'
                      ].map(h => (
                        <th key={h}
                          className={`py-3 px-2 text-eco-secondary text-[11px] uppercase tracking-wider font-semibold whitespace-nowrap transition-all duration-300
                            ${(h === 'Collector' || h === 'Notes') ? 'text-center' : 'text-left'}
                            ${(h.toLowerCase() === filter) ? 'text-eco-accent font-bold bg-eco-primary/10 rounded-t-lg' : ''}`}
                        >{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log, i) => (
                      <LogRow
                        key={log.id || `${log.collection_date}-${i}`}
                        log={log}
                        idx={i}
                        activeFilter={filter}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}