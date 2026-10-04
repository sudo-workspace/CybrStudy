import { useState, useEffect, useMemo } from 'react';
import { subscribeToHackathons } from '../services/hackathonService';
import fallbackHackathons from '../data/discoveredHackathons.json';

export function useHackathons() {
  const [hackathons, setHackathons] = useState(fallbackHackathons);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeToHackathons((data) => {
      setHackathons(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const stats = useMemo(() => {
    let virtual = 0;
    let physical = 0;
    let hybrid = 0;
    let closingSoon = 0;
    const now = Date.now();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

    hackathons.forEach((h) => {
      if (h.mode === 'virtual') virtual++;
      else if (h.mode === 'physical') physical++;
      else if (h.mode === 'hybrid') hybrid++;

      const dl = h.dates?.registrationDeadline ? new Date(h.dates.registrationDeadline).getTime() : null;
      if (dl && dl > now && dl - now <= threeDaysMs) {
        closingSoon++;
      }
    });

    return {
      total: hackathons.length,
      virtual,
      physical,
      hybrid,
      closingSoon,
    };
  }, [hackathons]);

  const uniqueLocations = useMemo(() => {
    const locs = new Set();
    hackathons.forEach((h) => {
      if (h.location?.city) locs.add(h.location.city);
      if (h.location?.state) locs.add(h.location.state);
    });
    return Array.from(locs).sort();
  }, [hackathons]);

  return {
    hackathons,
    loading,
    stats,
    uniqueLocations,
  };
}
