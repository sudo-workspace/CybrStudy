import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useHackathons } from '../hooks/useHackathons';
import HackathonCard from '../components/hackathons/HackathonCard';

export default function HackathonsPage() {
  const { hackathons, loading, stats, uniqueLocations } = useHackathons();
  const [searchParams] = useSearchParams();

  const queryParam = searchParams.get('q') || '';
  const modeParam = searchParams.get('mode') || 'all';
  const locationParam = searchParams.get('loc') || 'all';
  const categoryParam = searchParams.get('cat') || 'all';
  const sortParam = searchParams.get('sort') || 'deadline';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedMode, setSelectedMode] = useState(modeParam);
  const [selectedLocation, setSelectedLocation] = useState(locationParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState(sortParam);
  const [displayCount, setDisplayCount] = useState(18);

  const filteredHackathons = useMemo(() => {
    let list = [...hackathons];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((h) => {
        const text = `${h.title} ${h.description} ${h.organizer?.name || ''} ${(h.categories || []).join(' ')} ${h.location?.city || ''} ${h.location?.state || ''}`.toLowerCase();
        return text.includes(q);
      });
    }

    // Mode filter
    if (selectedMode !== 'all') {
      list = list.filter((h) => h.mode === selectedMode);
    }

    // Location filter
    if (selectedLocation !== 'all') {
      if (selectedLocation === 'nagpur') {
        list = list.filter((h) => (h.location?.city || '').toLowerCase().includes('nagpur'));
      } else if (selectedLocation === 'maharashtra') {
        list = list.filter((h) => {
          const t = `${h.location?.state || ''} ${h.location?.city || ''}`.toLowerCase();
          return t.includes('maharashtra') || t.includes('nagpur') || t.includes('pune') || t.includes('mumbai');
        });
      } else if (selectedLocation === 'virtual') {
        list = list.filter((h) => h.mode === 'virtual');
      } else {
        list = list.filter((h) => h.location?.city === selectedLocation || h.location?.state === selectedLocation);
      }
    }

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter((h) => {
        const text = `${h.title} ${h.description} ${(h.categories || []).join(' ')}`.toLowerCase();
        if (selectedCategory === 'cyber') {
          return (
            text.includes('cyber') ||
            text.includes('ctf') ||
            text.includes('security') ||
            text.includes('flag') ||
            text.includes('exploit') ||
            text.includes('forensic')
          );
        }
        return text.includes(selectedCategory.toLowerCase());
      });
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'deadline') {
        const da = a.dates?.registrationDeadline || a.dates?.start || '9999';
        const db = b.dates?.registrationDeadline || b.dates?.start || '9999';
        return da.localeCompare(db);
      }
      if (sortBy === 'start') {
        const da = a.dates?.start || '9999';
        const db = b.dates?.start || '9999';
        return da.localeCompare(db);
      }
      if (sortBy === 'prize') {
        return (b.prize?.amount || 0) - (a.prize?.amount || 0);
      }
      return 0;
    });

    return list;
  }, [hackathons, searchQuery, selectedMode, selectedLocation, selectedCategory, sortBy]);

  const displayedList = filteredHackathons.slice(0, displayCount);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 'var(--space-12)' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <Link to="/" style={{ color: 'var(--color-text-3)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
            Home
          </Link>
          <span style={{ color: 'var(--color-text-3)' }}>/</span>
          <span style={{ color: 'var(--color-text)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
            Hackathons
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', color: 'var(--color-text)', margin: 0 }}>
              Hackathon Discovery Portal
            </h1>
            <p style={{ color: 'var(--color-text-2)', fontSize: 'var(--text-base)', marginTop: 'var(--space-1)', marginBottom: 0 }}>
              Automated 24/7 aggregator of student hackathons across Maharashtra & Virtual worldwide.
            </p>
          </div>

          {/* Quick Metrics Tag */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <span className="badge badge-accent">
              {stats.total} Total Events
            </span>
            <span className="badge badge-info">
              {stats.virtual} Virtual
            </span>
            <span className="badge badge-img">
              {stats.physical} Maharashtra In-Person
            </span>
            {stats.closingSoon > 0 && (
              <span className="badge badge-pdf">
                ⚡ {stats.closingSoon} Closing Soon
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filter / Search Bar Controls */}
      <div
        className="card hackathons-portal-filter-card"
      >
        {/* Row 1: Search input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-3)" strokeWidth="2" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="input-field"
            placeholder="Search by hackathon name, tech stack, host college, or keyword…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 42 }}
            id="hackathons-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-3)' }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Row 2: Dropdown filters */}
        <div className="hackathons-portal-filter-grid">
          {/* Mode */}
          <div>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', display: 'block', marginBottom: 4 }}>
              Participation Mode
            </label>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="input-field"
              style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)', width: '100%' }}
              id="filter-mode-select"
            >
              <option value="all">All Modes</option>
              <option value="virtual">🌐 Virtual / Online</option>
              <option value="physical">📍 In-Person (Maharashtra)</option>
              <option value="hybrid">⚡ Hybrid</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', display: 'block', marginBottom: 4 }}>
              Location & Region
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="input-field"
              style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)', width: '100%' }}
              id="filter-location-select"
            >
              <option value="all">All Locations (Maharashtra & Virtual)</option>
              <option value="nagpur">Nagpur (Local)</option>
              <option value="maharashtra">All Maharashtra</option>
              <option value="virtual">Worldwide Virtual</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', display: 'block', marginBottom: 4 }}>
              Theme / Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
              style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)', width: '100%' }}
              id="filter-category-select"
            >
              <option value="all">All Themes</option>
              <option value="cyber">Cybersecurity & CTF</option>
              <option value="ai">AI / Machine Learning</option>
              <option value="web">Web & Full-Stack</option>
              <option value="web3">Web3 & Blockchain</option>
              <option value="iot">IoT & Robotics</option>
              <option value="open source">Open Source</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', display: 'block', marginBottom: 4 }}>
              Sort Events
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
              style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)', width: '100%' }}
              id="sort-select"
            >
              <option value="deadline">Soonest Deadline</option>
              <option value="start">Event Date</option>
              <option value="prize">Highest Prize</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)' }}>
          Showing <strong>{displayedList.length}</strong> of <strong>{filteredHackathons.length}</strong> matching events
        </span>
        {(searchQuery || selectedMode !== 'all' || selectedLocation !== 'all' || selectedCategory !== 'all') && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedMode('all');
              setSelectedLocation('all');
              setSelectedCategory('all');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="hackathons-portal-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 240, borderRadius: 'var(--radius-xl)' }} />
          ))}
        </div>
      ) : displayedList.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h3>No hackathons match your search</h3>
          <p style={{ fontSize: 'var(--text-sm)' }}>
            Try clearing filters or searching with broader keywords like "cyber", "ai", or "web".
          </p>
        </div>
      ) : (
        <>
          <div className="hackathons-portal-grid">
            {displayedList.map((h) => (
              <HackathonCard key={h.fingerprint || h.id} hackathon={h} />
            ))}
          </div>

          {/* Show more button if there are more */}
          {displayCount < filteredHackathons.length && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-8)' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDisplayCount((c) => c + 18)}
                id="load-more-hackathons-btn"
              >
                Load More Events ({filteredHackathons.length - displayCount} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
