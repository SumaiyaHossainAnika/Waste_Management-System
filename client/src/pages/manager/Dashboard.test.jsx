import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/locations/stats').then(r => setStats(r.data.stats)).catch(() => {});
  }, []);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-5xl font-bold">Test Dashboard</h1>
        <p>Hello, {user?.full_name || 'Guest'}</p>
        <p>Role: {user?.role || 'none'}</p>
      </div>
      <div>
        <h2 className="text-2xl font-bold">Stats</h2>
        <pre>{JSON.stringify(stats, null, 2)}</pre>
      </div>
    </div>
  );
}
