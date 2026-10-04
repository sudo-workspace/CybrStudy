import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useHackathons } from '../../hooks/useHackathons';
import HackathonCard from './HackathonCard';

const FILTER_TABS = [
  { id: 'all',          label: 'All Opportunities' },
  { id: 'cyber',        label: '🛡️ Cybersecurity & CTFs' },
  { id: 'maharashtra',  label: '📍 Nagpur & Maharashtra' },
  { id: 'virtual',      label: '🌐 Virtual & Online' },
];

export default function HackathonSection() {
  const { hackathons, loading, stats } = useHackathons();
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredHackathons = useMemo(() => {
    if (!hackathons || hackathons.length === 0) return [];

    let list = hackathons;

    if (activeFilter === 'cyber') {
      list = list.filter((h) => {
        const text = `${h.title} ${h.description} ${(h.categories || []).join(' ')}`.toLowerCase();
        return text.includes('cyber') || text.includes('security') || text.includes('ctf') || text.includes('flag') || text.includes('exploit') || text.includes('forensic');
      });
    } else if (activeFilter === 'maharashtra') {
      list = list.filter((h) => h.mode === 'physical' || h.mode === 'hybrid');
    } else if (activeFilter === 'virtual') {
      list = list.filter((h) => h.mode === 'virtual');
    }

    return list.slice(0, 5); // Spotlight top 5 hackathons on homepage
  }, [hackathons, activeFilter]);

  return (
    <section
      className="hackathons-homepage-section animate-fade-in"
      id="homepage-hackathons-section"
    >
      {/* Top Banner Row */}
      <div className="hackathons-section-header">
        <div className="hackathons-header-text">
          <div className="hackathons-badge-row">
            <span className="hackathons-engine-pill">
              <span className="hackathons-engine-dot" aria-hidden="true" />
              24/7 Discovery Engine Active
            </span>
            <span className="hackathons-engine-desc">
              Auto-scanned Maharashtra & Virtual Opportunities
            </span>
          </div>

          <h2 className="hackathons-section-title">
            Live Hackathons & Competitions
          </h2>
          <p className="hackathons-section-subtitle">
            Real-time discovered engineering, cybersecurity, and open-innovation hackathons across Maharashtra & Virtual worldwide.
          </p>
        </div>

        <Link
          to="/hackathons"
          className="btn btn-secondary btn-sm hackathons-view-all-btn"
          id="home-view-all-hackathons-btn"
        >
          View All {stats.total > 0 && `(${stats.total})`}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>

      {/* Filter Tabs Chips */}
      <div
        className="chip-row hackathons-filter-chips"
      >
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFilter(tab.id)}
            className={`hackathon-chip-tab${activeFilter === tab.id ? ' hackathon-chip-tab--active' : ''}`}
            id={`filter-tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Hackathons */}
      {loading ? (
        <div className="hackathons-cards-grid">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 220, borderRadius: 'var(--radius-xl)' }} />
          ))}
        </div>
      ) : filteredHackathons.length === 0 ? (
        <div className="empty-state" style={{ padding: 'var(--space-8) var(--space-4)' }}>
          <div className="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <h3>No events currently in this filter</h3>
          <p style={{ fontSize: 'var(--text-sm)' }}>
            The 24/7 discovery engine continuously monitors for new hackathons. Check back soon or switch filters.
          </p>
        </div>
      ) : (
        <div className="hackathons-cards-grid">
          {filteredHackathons.map((h) => (
            <HackathonCard key={h.fingerprint || h.id} hackathon={h} />
          ))}
        </div>
      )}
    </section>
  );
}
