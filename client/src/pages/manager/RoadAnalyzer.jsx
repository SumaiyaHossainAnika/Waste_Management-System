import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRoad, faTruck, faVanShuttle, faPersonWalking, faLocationCrosshairs, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const vehicleColors = { 
  mini_truck: '#22c55e',   // Green
  van: '#eab308',     // Yellow
  manual: '#ef4444'   // Red
};

const vehicleIcons = { 
  mini_truck: faTruck, 
  van: faVanShuttle, 
  manual: faPersonWalking 
};

const vehicleLabels = { 
  mini_truck: 'Mini Truck (Wide Road > 7m)', 
  van: 'Rickshaw Van (Medium Road 3-7m)', 
  manual: 'Manual Collection (Narrow Alley < 3m)' 
};

const places = [
  { name: 'Hitech Dumping Site', lat: 23.788807, lng: 90.388232 },
  { name: 'Kafrul Police Station', lat: 23.791500, lng: 90.388000 },
  { name: 'Kafrul Central Mosque', lat: 23.789200, lng: 90.390000 },
  { name: 'Kafrul High School', lat: 23.789000, lng: 90.392000 },
  { name: 'Kafrul Play Ground', lat: 23.790500, lng: 90.393000 },
  { name: 'Kafrul Post Office', lat: 23.790000, lng: 90.387000 },
  { name: 'Kafrul Bazar', lat: 23.787500, lng: 90.389000 },
  { name: 'Ibrahimpur Pulpar Junction', lat: 23.786500, lng: 90.377500 },
  { name: 'West Shewrapara Boundary', lat: 23.785000, lng: 90.379000 },
  { name: 'Ibrahimpur Bazar', lat: 23.797500, lng: 90.384000 },
  { name: 'Ibrahimpur Central Mosque', lat: 23.793000, lng: 90.383000 },
  { name: 'Ibrahimpur Girls High School', lat: 23.795000, lng: 90.382000 },
  { name: 'Cantonment Bypass Road Link', lat: 23.798000, lng: 90.381000 }
];

const roadSegments = [
  {
    start: 'Hitech Dumping Site',
    end: 'Kafrul Police Station',
    roadName: 'Kafrul Main Road',
    width_meters: 8.5,
    recommended_vehicle: 'mini_truck',
    coordinates: [
      [23.788807, 90.388232],
      [23.7895, 90.3881],
      [23.7905, 90.3879],
      [23.7915, 90.3880]
    ]
  },
  {
    start: 'Hitech Dumping Site',
    end: 'Kafrul Post Office',
    roadName: 'Kafrul Post Office Road',
    width_meters: 4.8,
    recommended_vehicle: 'van',
    coordinates: [
      [23.788807, 90.388232],
      [23.7892, 90.3875],
      [23.7900, 90.3870]
    ]
  },
  {
    start: 'Kafrul Police Station',
    end: 'Kafrul Central Mosque',
    roadName: 'Central Mosque Road',
    width_meters: 5.5,
    recommended_vehicle: 'van',
    coordinates: [
      [23.7915, 90.3880],
      [23.7905, 90.3890],
      [23.7892, 90.3900]
    ]
  },
  {
    start: 'Kafrul Central Mosque',
    end: 'Kafrul High School',
    roadName: 'Kafrul School Road',
    width_meters: 3.5,
    recommended_vehicle: 'van',
    coordinates: [
      [23.7892, 90.3900],
      [23.7891, 90.3910],
      [23.7890, 90.3920]
    ]
  },
  {
    start: 'Kafrul High School',
    end: 'Kafrul Play Ground',
    roadName: 'Kafrul Playground Lane',
    width_meters: 2.5,
    recommended_vehicle: 'manual',
    coordinates: [
      [23.7890, 90.3920],
      [23.7900, 90.3925],
      [23.7905, 90.3930]
    ]
  },
  {
    start: 'Hitech Dumping Site',
    end: 'Kafrul Bazar',
    roadName: 'Kafrul Bazar Road',
    width_meters: 7.2,
    recommended_vehicle: 'mini_truck',
    coordinates: [
      [23.788807, 90.388232],
      [23.7880, 90.3885],
      [23.7875, 90.3890]
    ]
  },
  {
    start: 'Kafrul Bazar',
    end: 'Ibrahimpur Pulpar Junction',
    roadName: 'East Shewrapara Road',
    width_meters: 5.0,
    recommended_vehicle: 'van',
    coordinates: [
      [23.7875, 90.3890],
      [23.7895, 90.3850],
      [23.7900, 90.3820],
      [23.7895, 90.3780],
      [23.7865, 90.3775]
    ]
  },
  {
    start: 'Ibrahimpur Pulpar Junction',
    end: 'West Shewrapara Boundary',
    roadName: 'Shewrapara Link Lane',
    width_meters: 2.9,
    recommended_vehicle: 'manual',
    coordinates: [
      [23.7865, 90.3775],
      [23.7858, 90.3780],
      [23.7850, 90.3790]
    ]
  },
  {
    start: 'Kafrul Post Office',
    end: 'Ibrahimpur Central Mosque',
    roadName: 'Pulpar Road',
    width_meters: 4.5,
    recommended_vehicle: 'van',
    coordinates: [
      [23.7900, 90.3870],
      [23.7915, 90.3850],
      [23.7930, 90.3830]
    ]
  },
  {
    start: 'Ibrahimpur Central Mosque',
    end: 'Ibrahimpur Bazar',
    roadName: 'Ibrahimpur Main Road',
    width_meters: 5.2,
    recommended_vehicle: 'van',
    coordinates: [
      [23.7930, 90.3830],
      [23.7945, 90.3835],
      [23.7960, 90.3838],
      [23.7975, 90.3840]
    ]
  },
  {
    start: 'Ibrahimpur Bazar',
    end: 'Ibrahimpur Girls High School',
    roadName: 'Haji Ashraf Ali Road',
    width_meters: 2.2,
    recommended_vehicle: 'manual',
    coordinates: [
      [23.7975, 90.3840],
      [23.7960, 90.3830],
      [23.7950, 90.3820]
    ]
  },
  {
    start: 'Ibrahimpur Bazar',
    end: 'Cantonment Bypass Road Link',
    roadName: 'Kamal Khan Road',
    width_meters: 7.5,
    recommended_vehicle: 'mini_truck',
    coordinates: [
      [23.7975, 90.3840],
      [23.7978, 90.3825],
      [23.7980, 90.3810]
    ]
  },
  {
    start: 'Ibrahimpur Central Mosque',
    end: 'Ibrahimpur Girls High School',
    roadName: 'Ibrahimpur Girls School Lane',
    width_meters: 3.1,
    recommended_vehicle: 'van',
    coordinates: [
      [23.7930, 90.3830],
      [23.7940, 90.3825],
      [23.7950, 90.3820]
    ]
  }
];

function MapController({ selectedCoords }) {
  const map = useMap();
  useEffect(() => {
    if (selectedCoords && selectedCoords.length > 0) {
      const bounds = L.latLngBounds(selectedCoords);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [selectedCoords, map]);
  return null;
}

const findPath = (startName, endName) => {
  if (!startName || !endName) return null;
  if (startName === endName) return null;

  const adj = {};
  places.forEach(p => {
    adj[p.name] = [];
  });

  roadSegments.forEach((seg) => {
    adj[seg.start].push({ neighbor: seg.end, segment: seg });
    adj[seg.end].push({ neighbor: seg.start, segment: seg });
  });

  const queue = [[startName, []]];
  const visited = new Set([startName]);

  while (queue.length > 0) {
    const [curr, path] = queue.shift();

    if (curr === endName) {
      return path;
    }

    const connections = adj[curr] || [];
    for (const conn of connections) {
      if (!visited.has(conn.neighbor)) {
        visited.add(conn.neighbor);
        queue.push([conn.neighbor, [...path, conn.segment]]);
      }
    }
  }

  return null;
};

export default function RoadAnalyzer() {
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [selectedRoad, setSelectedRoad] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    if (startPoint && endPoint) {
      const path = findPath(startPoint, endPoint);
      if (path && path.length > 0) {
        const minWidth = Math.min(...path.map(s => s.width_meters));
        let recVehicle = 'mini_truck';
        if (minWidth < 3) recVehicle = 'manual';
        else if (minWidth <= 7) recVehicle = 'van';

        const routeNodeNames = [startPoint];
        let current = startPoint;
        path.forEach(seg => {
          current = (seg.start === current) ? seg.end : seg.start;
          routeNodeNames.push(current);
        });

        setSelectedRoute({
          segments: path,
          routeNodes: routeNodeNames,
          roadName: path.map(s => s.roadName).join(' -> '),
          width_meters: minWidth,
          recommended_vehicle: recVehicle,
          coordinates: path.flatMap(s => s.coordinates)
        });

        // Set matching road dropdown value if it is a single road segment
        if (path.length === 1) {
          setSelectedRoad(path[0].roadName);
        } else {
          setSelectedRoad('');
        }
      } else {
        setSelectedRoute(null);
        setSelectedRoad('');
      }
    } else {
      setSelectedRoute(null);
      setSelectedRoad('');
    }
  }, [startPoint, endPoint]);

  const handleRoadSelect = (roadName) => {
    setSelectedRoad(roadName);
    if (roadName) {
      const seg = roadSegments.find(s => s.roadName === roadName);
      if (seg) {
        setStartPoint(seg.start);
        setEndPoint(seg.end);
      }
    } else {
      setStartPoint('');
      setEndPoint('');
    }
  };

  const isSegmentInRoute = (road) => {
    if (!selectedRoute) return false;
    return selectedRoute.segments.some(s => 
      (s.start === road.start && s.end === road.end) || 
      (s.start === road.end && s.end === road.start)
    );
  };

  const reset = () => {
    setStartPoint('');
    setEndPoint('');
    setSelectedRoad('');
    setSelectedRoute(null);
  };

  const center = [23.791, 90.385];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-eco-text mb-1">Ward 16 Road Width Map</h1>
        <p className="text-eco-secondary text-sm">Interactive routing and optimal vehicle analyzer for waste collection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Panel */}
        <div className="space-y-6 min-w-0">
          <div className="glass rounded-2xl p-6 border border-eco-primary/10">
            <h3 className="text-eco-text font-semibold text-base mb-4 flex items-center gap-2 border-b border-eco-primary/10 pb-2">
              <FontAwesomeIcon icon={faLocationCrosshairs} className="text-eco-accent" />
              Select Road Segment
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-eco-secondary text-xs font-semibold mb-2 uppercase tracking-wide">Or Select Road Segment</label>
                <select 
                  value={selectedRoad} 
                  onChange={(e) => handleRoadSelect(e.target.value)}
                  className="w-full bg-eco-surface border border-eco-primary/20 rounded-xl px-4 py-3 text-eco-text text-sm focus:border-eco-accent/50 outline-none transition-all"
                >
                  <option value="">-- Choose Road Segment --</option>
                  {roadSegments.map(road => (
                    <option key={road.roadName} value={road.roadName}>{road.roadName}</option>
                  ))}
                </select>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-eco-primary/10"></div>
                <span className="flex-shrink mx-4 text-eco-secondary text-[10px] font-bold uppercase tracking-wider">OR CHOOSE LANDMARKS</span>
                <div className="flex-grow border-t border-eco-primary/10"></div>
              </div>

              <div>
                <label className="block text-eco-secondary text-xs font-semibold mb-2 uppercase tracking-wide">Start Point</label>
                <select 
                  value={startPoint} 
                  onChange={(e) => setStartPoint(e.target.value)}
                  className="w-full bg-eco-surface border border-eco-primary/20 rounded-xl px-4 py-3 text-eco-text text-sm focus:border-eco-accent/50 outline-none transition-all"
                >
                  <option value="">-- Select Landmark --</option>
                  {places.map(p => (
                    <option key={p.name} value={p.name} disabled={p.name === endPoint}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-eco-secondary text-xs font-semibold mb-2 uppercase tracking-wide">End Point</label>
                <select 
                  value={endPoint} 
                  onChange={(e) => setEndPoint(e.target.value)}
                  className="w-full bg-eco-surface border border-eco-primary/20 rounded-xl px-4 py-3 text-eco-text text-sm focus:border-eco-accent/50 outline-none transition-all"
                >
                  <option value="">-- Select Landmark --</option>
                  {places.map(p => (
                    <option key={p.name} value={p.name} disabled={p.name === startPoint}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={reset} 
                className="flex-1 px-4 py-3 rounded-xl bg-eco-surface/40 hover:bg-eco-surface/60 text-eco-text text-sm font-semibold transition-all"
              >
                Clear Selection
              </button>
            </div>
          </div>

          {/* Analysis Info Card */}
          <AnimatePresence mode="wait">
            {selectedRoute ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                className="glass rounded-2xl p-6 border border-eco-accent/30 bg-gradient-to-br from-eco-primary/5 to-eco-accent/5"
              >
                <h3 className="text-eco-text font-bold text-lg mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faRoad} className="text-eco-accent" />
                  Road Specifications
                </h3>

                <div className="space-y-4">
                  <div>
                    <span className="text-eco-secondary text-[10px] uppercase font-bold tracking-wider">Route Path</span>
                    <p className="text-eco-text text-sm font-semibold leading-relaxed mt-1">{selectedRoute.roadName}</p>
                  </div>

                  <div>
                    <span className="text-eco-secondary text-[10px] uppercase font-bold tracking-wider">Narrowest Width</span>
                    <p className="text-eco-accent text-3xl font-mono font-bold mt-1">{selectedRoute.width_meters}m</p>
                  </div>

                  <div 
                    className="p-4 rounded-xl flex items-center gap-3 border"
                    style={{ 
                      background: `${vehicleColors[selectedRoute.recommended_vehicle]}10`, 
                      borderColor: `${vehicleColors[selectedRoute.recommended_vehicle]}30` 
                    }}
                  >
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${vehicleColors[selectedRoute.recommended_vehicle]}20` }}
                    >
                      <FontAwesomeIcon 
                        icon={vehicleIcons[selectedRoute.recommended_vehicle]} 
                        style={{ color: vehicleColors[selectedRoute.recommended_vehicle] }} 
                        className="text-lg"
                      />
                    </div>
                    <div>
                      <span className="text-eco-secondary text-[10px] uppercase font-bold tracking-wider block">Recommended Mode</span>
                      <span className="text-eco-text font-bold text-sm capitalize">{selectedRoute.recommended_vehicle}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="glass rounded-2xl p-6 text-center border border-eco-primary/10"
              >
                <div 
                  className="w-12 h-12 rounded-xl bg-eco-primary/10 flex items-center justify-center mb-4"
                  style={{ marginLeft: 'auto', marginRight: 'auto' }}
                >
                  <FontAwesomeIcon icon={faCircleInfo} className="text-eco-primary/50 text-xl" />
                </div>
                <p className="text-eco-text font-semibold text-sm mb-1">No Route Selected</p>
                <p className="text-eco-secondary text-xs leading-relaxed">Choose a Start and End landmark to analyze the connecting road segment.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Map Legend */}
          <div className="glass rounded-2xl p-6 border border-eco-primary/10 space-y-4">
            <h4 className="text-eco-text font-semibold text-sm flex items-center gap-2 border-b border-eco-primary/10 pb-2">
              <FontAwesomeIcon icon={faRoad} className="text-eco-accent text-xs" />
              Collection Classification
            </h4>
            <div className="space-y-3">
              {Object.entries(vehicleLabels).map(([key, label]) => {
                const parts = label.split(' (');
                const title = parts[0];
                const desc = parts[1] ? parts[1].replace(')', '') : '';
                return (
                  <div 
                    key={key} 
                    className="p-3 rounded-xl border flex items-center gap-3 transition-all hover:translate-x-1"
                    style={{ 
                      background: `${vehicleColors[key]}08`, 
                      borderColor: `${vehicleColors[key]}25` 
                    }}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                      style={{ 
                        background: `${vehicleColors[key]}15`,
                        borderColor: `${vehicleColors[key]}30`,
                        color: vehicleColors[key]
                      }}
                    >
                      <FontAwesomeIcon icon={vehicleIcons[key]} className="text-sm" />
                    </div>
                    <div>
                      <p className="text-eco-text font-semibold text-xs capitalize">{title}</p>
                      {desc && <p className="text-[10px] text-eco-secondary font-medium">{desc}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Map Panel */}
        <div className="lg:col-span-2 glass rounded-2xl overflow-hidden border border-eco-primary/10" style={{ height: 'calc(100vh - 220px)', minHeight: '550px' }}>
          <MapContainer center={center} zoom={14.5} style={{ height: '100%', width: '100%' }}>
            <TileLayer 
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
            />

            {/* Auto-focus Controller */}
            {selectedRoute && <MapController selectedCoords={selectedRoute.coordinates} />}

            {/* All Ward 16 Roads */}
            {roadSegments.map((road, idx) => {
              const isSelected = isSegmentInRoute(road);
              return (
                <Polyline 
                  key={idx}
                  positions={road.coordinates}
                  pathOptions={{ 
                    color: isSelected ? vehicleColors[selectedRoute.recommended_vehicle] : vehicleColors[road.recommended_vehicle], 
                    weight: isSelected ? 9 : 4, 
                    opacity: isSelected ? 1.0 : 0.25,
                    dashArray: isSelected ? '5, 8' : undefined
                  }}
                >
                  <Popup>
                    <div className="text-xs">
                      <p className="font-bold text-sm text-eco-text mb-1">{road.roadName}</p>
                      <p className="text-eco-secondary">Width: <strong className="text-eco-accent">{road.width_meters}m</strong></p>
                      <p className="text-eco-secondary">Vehicle: <span className="capitalize font-semibold" style={{ color: vehicleColors[road.recommended_vehicle] }}>{road.recommended_vehicle}</span></p>
                    </div>
                  </Popup>
                </Polyline>
              );
            })}

            {/* Landmark Markers */}
            {places.map(p => (
              <Marker key={p.name} position={[p.lat, p.lng]}>
                <Popup>
                  <div className="text-xs font-semibold text-eco-text">
                    {p.name}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
