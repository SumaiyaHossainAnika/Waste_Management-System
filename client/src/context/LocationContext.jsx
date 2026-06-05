import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const { user } = useAuth();
  const [location, setLocation] = useState(null);
  const [wards, setWards] = useState([]);
  const [isManagerScoped, setIsManagerScoped] = useState(false);

  useEffect(() => {
    if (user?.role === 'manager' && user?.assignedLocation) {
      setLocation(user.assignedLocation);
      setWards(user.assignedLocation.wards || []);
      setIsManagerScoped(true);
    } else {
      setLocation(null);
      setWards([]);
      setIsManagerScoped(false);
    }
  }, [user]);

  return (
    <LocationContext.Provider value={{ location, wards, isManagerScoped }}>
      {children}
    </LocationContext.Provider>
  );
}

/**
 * Hook: Use manager's location scope
 * Returns: { location, wards, isManagerScoped }
 * - location: The assigned location object { id, name, covered_area, wards }
 * - wards: Array of ward IDs covered by this location
 * - isManagerScoped: Whether the current user is a location-scoped manager
 */
export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
};
