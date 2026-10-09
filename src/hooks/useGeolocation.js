/**
 * useGeolocation — React hook for browser Geolocation API
 * Returns { coords, error, loading, requestLocation }
 */
import { useState, useCallback } from 'react';

export function useGeolocation() {
  const [coords, setCoords] = useState(null);   // { lat, lng, accuracy }
  const [error, setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Unable to retrieve your location.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return { coords, error, loading, requestLocation };
}
