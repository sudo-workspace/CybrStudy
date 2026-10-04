import { useEffect } from 'react';

export default function HackathonDetailModal({ hackathon, isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !hackathon) return null;

  const formatDate = (isoStr) => {
    if (!isoStr) return 'TBA';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  const getModeBadgeClass = (mode) => {
    switch (mode) {
      case 'virtual': return 'badge-info';
      case 'physical': return 'badge-accent';
      case 'hybrid': return 'badge-img';
      default: return 'badge-new';
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-box hackathon-detail-modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className={`badge ${getModeBadgeClass(hackathon.mode)}`}>
              {hackathon.mode?.toUpperCase()}
            </span>
            {hackathon.featured && (
              <span className="badge badge-warn">★ FEATURED</span>
            )}
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Title & Host */}
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.15rem, 3.5vw, 1.35rem)', color: 'var(--color-text)', marginBottom: 'var(--space-1)', lineHeight: 1.3 }}>
          {hackathon.title}
        </h2>
        <p style={{ color: 'var(--color-text-2)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-4)' }}>
          Organized by <strong>{hackathon.organizer?.name || 'Academic Institution'}</strong>
        </p>

        {/* Highlight Grid */}
        <div className="hackathon-modal-grid">
          <div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', display: 'block' }}>Registration Closes</span>
            <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
              {formatDate(hackathon.dates?.registrationDeadline)}
            </strong>
          </div>
          <div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', display: 'block' }}>Event Dates</span>
            <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
              {formatDate(hackathon.dates?.start)} {hackathon.dates?.end && `– ${formatDate(hackathon.dates.end)}`}
            </strong>
          </div>
          <div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', display: 'block' }}>Prize Pool</span>
            <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-success)' }}>
              {hackathon.prize?.description || 'Certificates & Swags'}
            </strong>
          </div>
          <div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', display: 'block' }}>Team Size</span>
            <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
              {hackathon.teamSize?.minimum === hackathon.teamSize?.maximum
                ? `${hackathon.teamSize?.minimum} Members`
                : `${hackathon.teamSize?.minimum || 1} – ${hackathon.teamSize?.maximum || 4} Members`}
            </strong>
          </div>
        </div>

        {/* Location & Venue */}
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <h4 style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-3)', marginBottom: 'var(--space-1)' }}>
            Location & Venue
          </h4>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', margin: 0 }}>
            {hackathon.location?.venue || (hackathon.mode === 'virtual' ? 'Online / Remote Participation' : `${hackathon.location?.city || ''}, ${hackathon.location?.state || 'India'}`)}
          </p>
        </div>

        {/* Description */}
        {hackathon.description && (
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <h4 style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-3)', marginBottom: 'var(--space-1)' }}>
              About Hackathon
            </h4>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)', lineHeight: 1.6, maxHeight: 140, overflowY: 'auto', margin: 0 }}>
              {hackathon.description}
            </p>
          </div>
        )}

        {/* Categories / Tags */}
        {hackathon.categories?.length > 0 && (
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <h4 style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-3)', marginBottom: 'var(--space-2)' }}>
              Themes & Categories
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
              {hackathon.categories.map((cat, i) => (
                <span key={i} className="badge badge-accent" style={{ fontSize: '11px' }}>
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sources Attribution */}
        {hackathon.sources?.length > 0 && (
          <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-text-3)' }}>
              Discovered via <strong>{hackathon.sources.map((s) => s.name).join(' & ')}</strong> • Auto-updated 24/7
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="hackathon-modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
            Close
          </button>
          <a
            href={hackathon.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ flex: 2 }}
            id={`modal-register-btn-${hackathon.fingerprint || hackathon.id}`}
          >
            Register on Site
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
