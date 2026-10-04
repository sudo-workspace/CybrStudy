import { useState } from 'react';
import HackathonDetailModal from './HackathonDetailModal';

export default function HackathonCard({ hackathon }) {
  const [modalOpen, setModalOpen] = useState(false);

  const getModeBadge = (mode) => {
    switch (mode) {
      case 'virtual':
        return { label: 'Virtual', cls: 'badge-info' };
      case 'physical':
        return { label: 'In-Person', cls: 'badge-accent' };
      case 'hybrid':
        return { label: 'Hybrid', cls: 'badge-img' };
      default:
        return { label: 'Virtual', cls: 'badge-info' };
    }
  };

  const modeBadge = getModeBadge(hackathon.mode);

  // Compute deadline urgency tag
  const getDeadlineTag = () => {
    if (!hackathon.dates?.registrationDeadline) return null;
    const now = Date.now();
    const deadlineMs = new Date(hackathon.dates.registrationDeadline).getTime();
    if (isNaN(deadlineMs)) return null;

    const diffDays = Math.ceil((deadlineMs - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Registration Closed', cls: 'badge-warn' };
    }
    if (diffDays === 0) {
      return { text: 'Closing Today! ⚡', cls: 'badge-pdf' };
    }
    if (diffDays <= 3) {
      return { text: `${diffDays}d left to register`, cls: 'badge-pdf' };
    }
    return { text: 'Registration Open', cls: 'badge-img' };
  };

  const deadlineTag = getDeadlineTag();

  const formatDate = (isoStr) => {
    if (!isoStr) return null;
    try {
      return new Date(isoStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return null;
    }
  };

  const startDateFormatted = formatDate(hackathon.dates?.start);
  const endDateFormatted = formatDate(hackathon.dates?.end);

  return (
    <>
      <div
        className="card hackathon-card"
        id={`hackathon-card-${hackathon.fingerprint || hackathon.id}`}
      >
        {/* Top Badges Row */}
        <div className="hackathon-card-badges-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
            <span className={`badge ${modeBadge.cls}`} style={{ fontSize: '11px', fontWeight: 600 }}>
              {modeBadge.label}
            </span>
            {hackathon.featured && (
              <span className="badge badge-warn" style={{ fontSize: '11px' }}>
                ★ Featured
              </span>
            )}
          </div>
          {deadlineTag && (
            <span className={`badge ${deadlineTag.cls}`} style={{ fontSize: '11px' }}>
              {deadlineTag.text}
            </span>
          )}
        </div>

        {/* Title & Host */}
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'var(--text-md)',
              fontWeight: 600,
              color: 'var(--color-text)',
              lineHeight: 1.35,
              marginBottom: 4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
            title={hackathon.title}
          >
            {hackathon.title}
          </h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', margin: 0 }}>
            by {hackathon.organizer?.name || 'Academic Host'}
          </p>
        </div>

        {/* Date & Location Specs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--color-text-2)' }}>
          {/* Dates */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, opacity: 0.7 }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>
              {startDateFormatted ? `${startDateFormatted} ${endDateFormatted && endDateFormatted !== startDateFormatted ? `– ${endDateFormatted}` : ''}` : 'Dates TBA'}
            </span>
          </div>

          {/* Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, opacity: 0.7 }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {hackathon.mode === 'virtual'
                ? 'Online / Worldwide'
                : (hackathon.location?.city ? `${hackathon.location.city}, ${hackathon.location.state || 'India'}` : 'India')}
            </span>
          </div>

          {/* Prize */}
          {hackathon.prize?.description && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-success)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
              </svg>
              <strong>{hackathon.prize.description}</strong>
            </div>
          )}
        </div>

        {/* Categories Pills */}
        {hackathon.categories?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 'auto' }}>
            {hackathon.categories.slice(0, 3).map((cat, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '10px',
                  background: 'var(--color-bg-alt)',
                  color: 'var(--color-text-2)',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-light)',
                }}
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="hackathon-card-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setModalOpen(true)}
            id={`details-btn-${hackathon.fingerprint || hackathon.id}`}
          >
            Overview
          </button>
          <a
            href={hackathon.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            id={`register-btn-${hackathon.fingerprint || hackathon.id}`}
          >
            Register
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      </div>

      {modalOpen && (
        <HackathonDetailModal
          hackathon={hackathon}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
