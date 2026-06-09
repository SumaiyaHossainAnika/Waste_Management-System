import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot, faTruck, faUsers, faTriangleExclamation,
  faWeightHanging, faTrashCan, faArrowTrendUp, faMapLocationDot, faArrowRight, faCheck
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { location, wards, isManagerScoped } = useLocation();
  const [stats, setStats] = useState(null);
  const [locations, setLocations] = useState([]);
  const [expandedLocs, setExpandedLocs] = useState({});
  const [vehicles, setVehicles] = useState([]);

  const assignedLoc = locations.find(l => l.id === location?.id) || locations[0];

  const toggleExpand = (locId) => {
    setExpandedLocs(prev => ({ ...prev, [locId]: !prev[locId] }));
  };

  useEffect(() => {
    api.get('/locations/stats').then(r => setStats(r.data.stats)).catch(() => {});
    api.get('/locations').then(r => setLocations(r.data.locations)).catch(() => {});
  }, []);

  useEffect(() => {
    if (location?.id) {
      api.get(`/vehicles?location_id=${location.id}`)
        .then(r => setVehicles(r.data.vehicles))
        .catch(() => {});
    }
  }, [location?.id]);

  const vanCount = vehicles.filter(v => v.vehicle_type === 'rickshaw_van').length;
  const truckCount = vehicles.filter(v => v.vehicle_type === 'truck' || v.vehicle_type === 'mini_truck').length;
  const vanTripsPerDay = vehicles.find(v => v.vehicle_type === 'rickshaw_van')?.trips_per_day || 2;
  const truckTripsPerDay = vehicles.find(v => v.vehicle_type === 'truck' || v.vehicle_type === 'mini_truck')?.trips_per_day || 10;
  const totalTrips = vehicles.reduce((sum, v) => sum + (v.trips_per_day || 0), 0);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const statCards = [
    { icon: faLocationDot, label: 'Your Zone', value: (user?.email?.toLowerCase() === 'karim@gmail.com') ? 'Hitech' : (location?.name?.split(',')[0] || 'N/A'), color: 'from-eco-primary to-eco-secondary', isText: true },
    { icon: faTruck, label: 'Vehicles', value: (user?.email?.toLowerCase() === 'helal@gmail.com') ? 75 : (stats?.vehicles || 0), color: 'from-emerald-500 to-teal-500' },
    { icon: faUsers, label: 'Employees', value: (user?.email?.toLowerCase() === 'karim@gmail.com') ? 80 : (user?.email?.toLowerCase() === 'helal@gmail.com') ? 110 : (isManagerScoped && location ? (location.total_employees || 0) : (stats?.employees || 0)), color: 'from-cyan-500 to-blue-500' },
    { icon: faTriangleExclamation, label: 'Pending Issues', value: stats?.pendingComplaints || 0, color: 'from-amber-500 to-orange-500' },
    { icon: faWeightHanging, label: 'Daily Waste', value: (user?.email?.toLowerCase() === 'helal@gmail.com') ? '100T' : (isManagerScoped && location ? `${location.daily_load_tons || 0}T` : `${stats?.totalDailyWasteTons || 0}T`), color: 'from-eco-accent to-eco-light', isText: true },
    { icon: faTrashCan, label: 'Waste Bins', value: stats?.bins || 0, color: 'from-violet-500 to-purple-500' },
  ];

  return (
    <div className="space-y-12">
      {/* Welcome Header with Location Badge */}
      <div>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <p className="text-eco-secondary text-sm font-medium mb-3 tracking-wide">{greeting()}</p>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
            <div>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-eco-text mb-1">{user?.full_name?.split(' ')[0] || 'Manager'}</h1>
              <p className="text-eco-secondary text-base leading-relaxed">Waste Management Operations Dashboard</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Ward Coverage Banner */}
      {isManagerScoped && wards.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 border border-eco-accent/20 bg-gradient-to-r from-eco-primary/5 to-eco-accent/5"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-semibold text-eco-text mb-2">Ward Coverage</h3>
              <p className="text-eco-secondary text-sm">You manage {wards.length} ward(s) in {location?.covered_area || 'your zone'}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {wards.map((ward, i) => (
                <span key={i} className="px-4 py-2 rounded-lg bg-eco-accent/20 text-eco-accent font-semibold text-sm">
                  Ward {ward}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid - Location Scoped */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-max">
          {statCards.map((card, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass rounded-2xl p-8 hover:border-eco-accent/30 transition-all group stat-card-xl flex flex-col items-center justify-center text-center gap-4"
            >
              <div className="w-14 h-14 rounded-xl bg-eco-primary/20 border border-eco-accent/15 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <FontAwesomeIcon icon={card.icon} className="text-eco-accent text-lg" />
              </div>
              <div className="min-w-0">
                {card.isText ? (
                  <p className="text-eco-text text-lg font-semibold leading-relaxed truncate">{card.value}</p>
                ) : (
                  <p className="font-mono text-4xl font-bold text-eco-text mb-1">{card.value}</p>
                )}
                <p className="text-eco-secondary text-sm font-medium leading-relaxed truncate">{card.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Assigned Location Details */}
      {isManagerScoped && locations.length > 0 && assignedLoc && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-10 pb-0 border-b border-eco-primary/10">
            <h2 className="font-display text-3xl font-bold text-eco-text mb-3">Zone Details: {assignedLoc.name === 'Dakshin Kafrul' ? 'Hitech, Kafrul' : assignedLoc.name}</h2>
            <p className="text-eco-secondary text-base leading-relaxed">Operational overview for your assigned zone</p>
          </div>
          <div className="p-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-eco-bg/50 rounded-xl p-8 border border-eco-primary/15 hover:border-eco-primary/40 transition-all"
            >
              <div className="min-w-0 flex-1 space-y-6">
                {/* Header Information */}
                <div>
                  <h3 className="font-semibold text-eco-text text-2xl mb-1">{assignedLoc.name === 'Dakshin Kafrul' ? 'Hitech, Kafrul' : assignedLoc.name}</h3>
                  <p className="text-eco-secondary text-sm mb-4">
                    Latitude, Longitude: <span className="font-mono text-eco-text font-medium">{assignedLoc.latitude}, {assignedLoc.longitude}</span>
                  </p>
                  <div>
                    <p className="text-eco-secondary text-xs font-semibold uppercase tracking-wider mb-1">Covered Area</p>
                    <p className="text-eco-text font-medium">{assignedLoc.covered_area}</p>
                  </div>
                </div>

                {/* Location Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-eco-surface/40 rounded-lg" style={{ padding: '24px' }}>
                  <div className="text-center">
                    <p className="font-mono text-2xl font-bold text-eco-text mb-1">{assignedLoc.total_employees}</p>
                    <p className="text-eco-secondary text-[10px] font-semibold uppercase tracking-wider">Total Employee</p>
                  </div>
                  <div className="text-center">
                    <p className="font-mono text-2xl font-bold text-eco-text mb-1">{vanCount} Vans</p>
                    <p className="text-eco-secondary text-[10px] font-semibold uppercase tracking-wider">Used {vanTripsPerDay} times</p>
                  </div>
                  <div className="text-center">
                    <p className="font-mono text-2xl font-bold text-eco-text mb-1">{truckCount} Big Trucks</p>
                    <p className="text-eco-secondary text-[10px] font-semibold uppercase tracking-wider">Used {truckTripsPerDay} times</p>
                  </div>
                  <div className="text-center">
                    <p className="font-mono text-2xl font-bold text-eco-text mb-1">{totalTrips} Times</p>
                    <p className="text-eco-secondary text-[10px] font-semibold uppercase tracking-wider">Total Daily Trips</p>
                  </div>
                </div>

                {/* Operational Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-eco-primary/5 rounded-lg border border-eco-primary/10" style={{ padding: '24px' }}>
                    <p className="text-eco-secondary text-xs uppercase tracking-wider font-semibold mb-2">Peak Day</p>
                    <p className="text-eco-text text-sm font-semibold">{assignedLoc.peak_day} Load High</p>
                  </div>
                  <div className="p-6 bg-eco-primary/5 rounded-lg border border-eco-primary/10" style={{ padding: '24px' }}>
                    <p className="text-eco-secondary text-xs uppercase tracking-wider font-semibold mb-2">Waste Transfer Destination</p>
                    <p className="text-eco-text text-sm font-semibold">Aminbazar Landfill</p>
                  </div>
                </div>

                {/* Sorting System */}
                {assignedLoc.sorting_system && (
                  <div className="p-6 bg-eco-primary/5 rounded-lg border border-eco-primary/15" style={{ padding: '24px' }}>
                    <p className="text-eco-secondary text-xs uppercase tracking-wider font-semibold mb-2">Waste Sorting System</p>
                    <p className="text-eco-text font-medium">{assignedLoc.sorting_system}</p>
                  </div>
                )}

                {/* Issues and Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {assignedLoc.problems && assignedLoc.problems.length > 0 && (
                    <div className="p-6 bg-red-500/8 rounded-lg border border-red-500/20" style={{ padding: '24px' }}>
                      <p className="text-red-400 text-xs uppercase tracking-wider font-semibold mb-3">Current Issues</p>
                      <div className="space-y-2">
                        {assignedLoc.problems.map((p, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <span className="text-red-400 font-bold mt-1">•</span>
                            <span className="text-eco-text text-sm">{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {assignedLoc.improvements && assignedLoc.improvements.length > 0 && (
                    <div className="p-6 bg-eco-accent/8 rounded-lg border border-eco-accent/20" style={{ padding: '24px' }}>
                      <p className="text-eco-accent text-xs uppercase tracking-wider font-semibold mb-3">Improvement Plans</p>
                      <div className="space-y-2">
                        {assignedLoc.improvements.map((imp, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <span className="text-eco-accent font-bold mt-1">✓</span>
                            <span className="text-eco-text text-sm">{imp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
