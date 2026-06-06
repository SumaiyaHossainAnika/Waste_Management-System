import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup, faFire, faTrashCan, faLocationDot, faExpand } from '@fortawesome/free-solid-svg-icons';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import api from '../../services/api';

// Fix leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const locationIcon = new L.DivIcon({
  html: '<div style="background:linear-gradient(135deg,#2D7868,#7CCE97);width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #0C2521;box-shadow:0 2px 10px rgba(45,120,104,0.5)"><svg width="14" height="14" viewBox="0 0 384 512" fill="white"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 256c-35.3 0-64-28.7-64-64s28.7-64 64-64s64 28.7 64 64s-64 64-64 64z"/></svg></div>',
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const hotspotIcon = new L.DivIcon({
  html: '<div style="background:linear-gradient(135deg,#ef4444,#f97316);width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #0C2521;box-shadow:0 2px 10px rgba(239,68,68,0.5);animation:pulse 2s infinite"><svg width="12" height="12" viewBox="0 0 384 512" fill="white"><path d="M153.6 29.9l16-21.3C173.6 3.2 180 0 186.7 0C198.4 0 208 9.6 208 21.3V43.5c0 13.1 5.4 25.7 14.9 34.7l24.7 23.3c4.2 4 6.4 9.5 6.4 15.2c0 11.1-9 20.1-20.1 20.1H216c-7.9 0-15.4-3.2-20.9-8.8L186.5 119c-3.4-3.5-5.2-8.2-5.2-13.1c0-.5 0-1.1 .1-1.6L168 80l-17.7 17.7c-4 4-9.4 6.3-15 6.3H134c-13.3 0-24-10.7-24-24c0-6 2.2-11.7 6.2-16.2l37.4-33.9zM176 272c-44.2 0-80-35.8-80-80s35.8-80 80-80s80 35.8 80 80c0 23.3-10 44.3-25.9 58.9L304 352H48l73.9-121.1C105.4 217.6 96 198.2 96 176.7V192c0 44.2 35.8 80 80 80z"/></svg></div>',
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const heatmapIcon = new L.DivIcon({
  html: '<div style="background:linear-gradient(135deg,#fde047,#eab308);width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #0C2521;box-shadow:0 2px 10px rgba(234,179,8,0.5);animation:pulse 2s infinite"><svg width="12" height="12" viewBox="0 0 384 512" fill="#0C2521"><path d="M153.6 29.9l16-21.3C173.6 3.2 180 0 186.7 0C198.4 0 208 9.6 208 21.3V43.5c0 13.1 5.4 25.7 14.9 34.7l24.7 23.3c4.2 4 6.4 9.5 6.4 15.2c0 11.1-9 20.1-20.1 20.1H216c-7.9 0-15.4-3.2-20.9-8.8L186.5 119c-3.4-3.5-5.2-8.2-5.2-13.1c0-.5 0-1.1 .1-1.6L168 80l-17.7 17.7c-4 4-9.4 6.3-15 6.3H134c-13.3 0-24-10.7-24-24c0-6 2.2-11.7 6.2-16.2l37.4-33.9zM176 272c-44.2 0-80-35.8-80-80s35.8-80 80-80s80 35.8 80 80c0 23.3-10 44.3-25.9 58.9L304 352H48l73.9-121.1C105.4 217.6 96 198.2 96 176.7V192c0 44.2 35.8 80 80 80z"/></svg></div>',
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

export default function MapExplorer() {
  const [locations, setLocations] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);
  const [activeLayer, setActiveLayer] = useState('waste_concentration');

  useEffect(() => {
    api.get('/locations').then(r => setLocations(r.data.locations)).catch(() => {});
    api.get('/heatmap/hotspots').then(r => setHotspots(r.data.hotspots)).catch(() => {});
  }, []);

  
  useEffect(() => {
  if (showHeatmap) {
    console.log("Loading heatmap:", activeLayer);

    api.get(`/heatmap/${activeLayer}`)
      .then((r) => {
        console.log("HEATMAP RESPONSE:", r.data);

        if (r.data.heatmap) {
          console.log("POINT COUNT:", r.data.heatmap.length);
          setHeatmapData(r.data.heatmap);
        } else {
          console.log("No heatmap field found");
          setHeatmapData([]);
        }
      })
      .catch((err) => {
        console.error("HEATMAP ERROR:", err);
      });
  }
}, [showHeatmap, activeLayer]);

  const center = [23.791, 90.385];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-eco-text mb-1">Map Explorer</h1>
        <p className="text-eco-secondary text-sm">Interactive GIS visualization of waste management zones</p>
      </div>

      {/* Layer Controls */}
      <div className="map-controls-container">
        <button onClick={() => setShowHeatmap(!showHeatmap)}
          className={`map-control-btn transition-all ${showHeatmap ? 'bg-eco-primary text-white' : 'glass text-eco-secondary hover:text-eco-accent'}`}>
          <FontAwesomeIcon icon={faFire} className="text-xs" />
          Heatmap
        </button>
        <button onClick={() => setShowHotspots(!showHotspots)}
          className={`map-control-btn transition-all ${showHotspots ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'glass text-eco-secondary hover:text-eco-accent'}`}>
          <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
          Hotspots
        </button>
        {showHeatmap && (
          <select value={activeLayer} onChange={(e) => setActiveLayer(e.target.value)}
            className="bg-eco-surface border border-eco-primary/20 text-eco-text focus:border-eco-accent/50">
            <option value="waste_concentration">Waste Concentration</option>
            <option value="complaint_density">Complaint Density</option>
            <option value="collection_frequency">Collection Frequency</option>
          </select>
        )}
      </div>

      {/* Map */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl overflow-hidden responsive-map-container explorer">
        <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Location Markers */}
          {locations.map(loc => (
            <Marker key={loc.id} position={[parseFloat(loc.latitude), parseFloat(loc.longitude)]} icon={locationIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-bold text-base mb-1">{loc.name}</p>
                  <p className="text-gray-400 text-xs mb-2">{loc.covered_area}</p>
                  <div className="space-y-1 text-xs">
                    <p><strong>Employees:</strong> {loc.total_employees}</p>
                    <p><strong>Daily Load:</strong> {loc.daily_load_tons || 'N/A'} tons</p>
                    <p><strong>Peak Day:</strong> {loc.peak_day || 'N/A'}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Hotspot Markers */}
          {showHotspots && hotspots.map(hs => (
            <Marker key={hs.id} position={[parseFloat(hs.latitude), parseFloat(hs.longitude)]} icon={hotspotIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-bold text-red-400 mb-1">Dumping Hotspot</p>
                  <p className="text-xs text-gray-400 mb-1">{hs.description}</p>
                  <p className="text-xs"><strong>Severity:</strong> <span className="text-red-400 uppercase">{hs.severity}</span></p>
                  <p className="text-xs"><strong>Reports:</strong> {hs.reported_count}</p>
                </div>
              </Popup>
            </Marker>
          ))}
          {/* Heatmap Markers */}
          {showHeatmap && heatmapData.map((pt, idx) => (
            <Marker key={idx} position={[pt[0], pt[1]]} icon={heatmapIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-bold text-yellow-500 mb-1 capitalize">{activeLayer.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-400 mb-2">Heatmap Area Info</p>
                  <div className="space-y-1 text-xs">
                    <p><strong>Intensity:</strong> {parseFloat(pt[2] * 100).toFixed(0)}%</p>
                    <p><strong>Latitude:</strong> {parseFloat(pt[0]).toFixed(6)}</p>
                    <p><strong>Longitude:</strong> {parseFloat(pt[1]).toFixed(6)}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </motion.div>
    </div>
  );
}
