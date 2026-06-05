import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faCamera, faLocationCrosshairs, faPaperPlane, faCheckCircle, faCloudArrowUp, faImage } from '@fortawesome/free-solid-svg-icons';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function LocationPicker({ position, setPosition }) {
  useMapEvents({ click(e) { setPosition(e.latlng); } });
  return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

export default function ReportIssue() {
  const [form, setForm] = useState({ title: '', description: '', category: 'illegal_dumping', severity: 'medium', address: '' });
  const [position, setPosition] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) { setPhoto(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) { setError('Please select a location on the map'); return; }
    setError('');
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      data.append('latitude', position.lat);
      data.append('longitude', position.lng);
      if (photo) data.append('photo', photo);
      await api.post('/complaints', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(true);
      setTimeout(() => navigate('/citizen/complaints'), 2000);
    } catch (err) { setError(err.response?.data?.error || 'Failed to submit report'); } finally { setLoading(false); }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center py-20">
        <div className="w-20 h-20 rounded-2xl bg-eco-accent/15 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-eco-accent/10">
          <FontAwesomeIcon icon={faCheckCircle} className="text-eco-accent text-4xl" />
        </div>
        <h2 className="font-display text-2xl font-bold text-eco-text mb-2">Report Submitted!</h2>
        <p className="text-eco-secondary text-sm">Your complaint has been received and will be reviewed by the collection team.</p>
      </motion.div>
    );
  }

  const severityColors = { low: 'text-emerald-400', medium: 'text-amber-400', high: 'text-orange-400', critical: 'text-red-400' };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-eco-text mb-2">Report an Issue</h1>
        <p className="text-eco-secondary text-sm">Help keep your city clean by reporting waste management problems</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Map Location */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-8 pb-4 border-b border-eco-primary/10">
            <h3 className="text-eco-text font-bold text-lg flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-eco-accent/15 flex items-center justify-center">
                <FontAwesomeIcon icon={faLocationCrosshairs} className="text-eco-accent text-sm" />
              </div>
              Select Location
            </h3>
            <p className="text-eco-secondary text-xs ml-9">Click on the map to pin the issue location</p>
          </div>
          <div className="h-80 mx-8 my-8 rounded-xl overflow-hidden border border-eco-primary/20">
            <MapContainer center={[23.81, 90.377]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
              <LocationPicker position={position} setPosition={setPosition} />
            </MapContainer>
          </div>
          {position && (
            <div className="px-8 pb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-eco-accent/15 text-eco-accent text-xs font-semibold font-mono border border-eco-accent/20">
                <FontAwesomeIcon icon={faLocationCrosshairs} />
                {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </span>
            </div>
          )}
          {!position && (
            <div className="px-10 pb-10 text-eco-secondary text-base flex items-center gap-2 leading-relaxed">
              <FontAwesomeIcon icon={faLocationCrosshairs} className="text-lg" />
              Click on the map above to select a location
            </div>
          )}
        </div>

        {/* Details */}
        <div className="glass rounded-2xl p-8 space-y-6">
          <h3 className="text-eco-text font-bold text-lg flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-eco-accent/15 flex items-center justify-center">
              <FontAwesomeIcon icon={faTriangleExclamation} className="text-eco-accent text-sm" />
            </div>
            Issue Details
          </h3>
          <div>
            <label className="text-eco-secondary text-xs font-semibold mb-2.5 block uppercase tracking-wider">Title *</label>
            <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Brief description of the issue"
              className="w-full px-4 py-3 rounded-lg bg-eco-bg/60 border border-eco-primary/20 text-eco-text text-sm placeholder-eco-secondary/40 focus:outline-none focus:border-eco-accent/50 transition-colors" />
          </div>
          <div>
            <label className="text-eco-secondary text-xs font-semibold mb-2.5 block uppercase tracking-wider">Description *</label>
            <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Provide more details about the problem..."
              className="w-full px-4 py-3 rounded-lg bg-eco-bg/60 border border-eco-primary/20 text-eco-text text-sm placeholder-eco-secondary/40 focus:outline-none focus:border-eco-accent/50 resize-none transition-colors" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-eco-secondary text-xs font-semibold mb-2.5 block uppercase tracking-wider">Category *</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-eco-bg/60 border border-eco-primary/20 text-eco-text text-sm focus:outline-none focus:border-eco-accent/50 transition-colors">
                <option value="illegal_dumping">Illegal Dumping</option>
                <option value="overflowing_bin">Overflowing Bin</option>
                <option value="missed_collection">Missed Collection</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-eco-secondary text-xs font-semibold mb-2.5 block uppercase tracking-wider">Severity *</label>
              <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-eco-bg/60 border border-eco-primary/20 text-eco-text text-sm focus:outline-none focus:border-eco-accent/50 transition-colors">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-eco-secondary text-xs font-semibold mb-2.5 block uppercase tracking-wider">Address (optional)</label>
            <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Nearby address or landmark"
              className="w-full px-4 py-3 rounded-lg bg-eco-bg/60 border border-eco-primary/20 text-eco-text text-sm placeholder-eco-secondary/40 focus:outline-none focus:border-eco-accent/50 transition-colors" />
          </div>
        </div>

        {/* Photo Upload */}
        <div className="glass rounded-2xl p-10">
          <h3 className="text-eco-text font-bold text-lg flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-eco-accent/15 flex items-center justify-center">
              <FontAwesomeIcon icon={faCamera} className="text-eco-accent text-sm" />
            </div>
            Attach Photo (optional)
          </h3>
          <label className="block cursor-pointer">
            <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            <div className="border-2 border-dashed border-eco-primary/30 rounded-lg text-center hover:border-eco-accent/40 transition-all group photo-upload-box">
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-lg shadow-eco-accent/20" />
                  <div className="mt-4 text-eco-secondary text-xs font-medium">Click to change photo</div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-lg bg-eco-primary/10 group-hover:bg-eco-primary/15 transition-colors centered-icon-box mb-4">
                    <FontAwesomeIcon icon={faCloudArrowUp} className="text-eco-primary/50 text-2xl group-hover:text-eco-accent/70 transition-colors" />
                  </div>
                  <p className="text-eco-text font-semibold mb-1 text-sm">Upload a photo</p>
                  <p className="text-eco-secondary text-xs">Click to browse or drag and drop</p>
                </>
              )}
            </div>
          </label>
        </div>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-sm text-center font-medium">
            {error}
          </motion.div>
        )}

        {/* Submit */}
        <button type="submit" disabled={loading || !position}
          className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
          <FontAwesomeIcon icon={faPaperPlane} />
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}
