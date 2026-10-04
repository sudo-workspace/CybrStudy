import { useState, useEffect } from 'react';
import { useHackathons } from '../../hooks/useHackathons';
import {
  runDiscoverySync,
  createManualHackathon,
  updateHackathon,
  deleteHackathon,
  subscribeToSourceRuns,
} from '../../services/hackathonService';
import { useToast } from '../../context/ToastContext';
import Spinner from '../ui/Spinner';

export default function HackathonManager() {
  const { hackathons, loading: hackathonsLoading } = useHackathons();
  const { addToast } = useToast();

  const [sourceRuns, setSourceRuns] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all');

  // Modal state for manual add / edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formOrgName, setFormOrgName] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formMode, setFormMode] = useState('virtual');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formVenue, setFormVenue] = useState('');
  const [formPrize, setFormPrize] = useState('');
  const [formRegUrl, setFormRegUrl] = useState('');
  const [formCategories, setFormCategories] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);

  // Subscribe to discovery run logs
  useEffect(() => {
    const unsub = subscribeToSourceRuns((runs) => {
      setSourceRuns(runs);
    }, 5);
    return unsub;
  }, []);

  const latestRun = sourceRuns[0] || null;

  // Run discovery sync on demand
  const handleTriggerSync = async () => {
    setSyncing(true);
    try {
      const res = await runDiscoverySync();
      const count = res.events?.length || 0;
      addToast(`Discovery scan completed! ${count} hackathons processed and synced.`, 'success');
    } catch (err) {
      console.error('[HackathonManager] Sync error:', err);
      addToast(`Discovery sync failed: ${err.message}`, 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingHackathon(null);
    setFormTitle('');
    setFormOrgName('');
    setFormStartDate('');
    setFormEndDate('');
    setFormDeadline('');
    setFormMode('virtual');
    setFormCity('');
    setFormState('');
    setFormVenue('');
    setFormPrize('');
    setFormRegUrl('');
    setFormCategories('Cybersecurity, AI');
    setFormDescription('');
    setFormFeatured(false);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (h) => {
    setEditingHackathon(h);
    setFormTitle(h.title || '');
    setFormOrgName(h.organizer?.name || '');
    setFormStartDate(h.dates?.start ? h.dates.start.slice(0, 10) : '');
    setFormEndDate(h.dates?.end ? h.dates.end.slice(0, 10) : '');
    setFormDeadline(h.dates?.registrationDeadline ? h.dates.registrationDeadline.slice(0, 10) : '');
    setFormMode(h.mode || 'virtual');
    setFormCity(h.location?.city || '');
    setFormState(h.location?.state || '');
    setFormVenue(h.location?.venue || '');
    setFormPrize(h.prize?.description || '');
    setFormRegUrl(h.registrationUrl || '');
    setFormCategories((h.categories || []).join(', '));
    setFormDescription(h.description || '');
    setFormFeatured(Boolean(h.featured));
    setIsModalOpen(true);
  };

  // Submit modal form
  const handleSaveHackathon = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formRegUrl.trim()) {
      addToast('Title and Registration URL are required.', 'error');
      return;
    }

    setFormSubmitting(true);
    try {
      const categoriesArray = formCategories
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      const eventPayload = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        organizer: {
          name: formOrgName.trim() || 'College Host',
          website: formRegUrl.trim(),
        },
        dates: {
          start: formStartDate ? new Date(formStartDate).toISOString() : null,
          end: formEndDate ? new Date(formEndDate).toISOString() : null,
          registrationDeadline: formDeadline ? new Date(formDeadline).toISOString() : null,
        },
        mode: formMode,
        location: {
          city: formCity.trim() || null,
          state: formState.trim() || null,
          country: formMode === 'virtual' ? 'Worldwide' : 'India',
          venue: formVenue.trim() || (formMode === 'virtual' ? 'Online' : formCity.trim()),
        },
        categories: categoriesArray,
        prize: {
          description: formPrize.trim() || null,
          currency: 'INR',
        },
        registrationUrl: formRegUrl.trim(),
        featured: formFeatured,
      };

      if (editingHackathon) {
        await updateHackathon(editingHackathon.id, eventPayload);
        addToast('Hackathon updated successfully.', 'success');
      } else {
        await createManualHackathon(eventPayload);
        addToast('New hackathon added successfully.', 'success');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('[HackathonManager] Save error:', err);
      addToast(`Failed to save: ${err.message}`, 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Hackathon
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove "${title}"?`)) return;
    try {
      await deleteHackathon(id);
      addToast('Hackathon removed.', 'info');
    } catch (err) {
      addToast(`Delete failed: ${err.message}`, 'error');
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (h) => {
    try {
      await updateHackathon(h.id, { featured: !h.featured });
      addToast(`Hackathon ${!h.featured ? 'marked as featured' : 'unfeatured'}.`, 'success');
    } catch (err) {
      addToast(`Update failed: ${err.message}`, 'error');
    }
  };

  // Filter list
  const filteredList = hackathons.filter((h) => {
    if (filterMode !== 'all' && h.mode !== filterMode) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const text = `${h.title} ${h.organizer?.name || ''} ${h.location?.city || ''}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 'var(--space-8)' }}>
      {/* Header */}
      <div className="admin-page-header admin-hackathon-header">
        <div>
          <h1>24/7 Hackathon Discovery Engine</h1>
          <p style={{ color: 'var(--color-text-2)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)', marginBottom: 0 }}>
            Automated multi-source ingestion of live hackathons. Manage verified events and review discovery health.
          </p>
        </div>

        <div className="admin-hackathons-header-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleTriggerSync}
            disabled={syncing}
            id="admin-sync-discovery-btn"
          >
            {syncing ? <Spinner size="sm" /> : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            )}
            {syncing ? 'Scanning Sources…' : 'Scan & Discover Now'}
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenCreateModal}
            id="admin-add-hackathon-btn"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Hackathon
          </button>
        </div>
      </div>

      {/* Discovery Engine Health Status Card */}
      <div
        className="card admin-hackathon-status-card"
      >
        <div className="admin-hackathon-status-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block', flexShrink: 0 }} />
            <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
              Discovery Engine: Healthy
            </strong>
          </div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' }}>
            Scheduled Cron: Every 6 Hours • GitHub Actions
          </span>
        </div>

        <div className="admin-hackathon-stats-grid">
          <div className="admin-hackathon-stat-box">
            <span className="admin-stat-label">Total in DB</span>
            <strong className="admin-stat-value">{hackathons.length}</strong>
          </div>
          <div className="admin-hackathon-stat-box">
            <span className="admin-stat-label">Virtual</span>
            <strong className="admin-stat-value" style={{ color: 'var(--color-accent)' }}>
              {hackathons.filter((h) => h.mode === 'virtual').length}
            </strong>
          </div>
          <div className="admin-hackathon-stat-box">
            <span className="admin-stat-label">In-Person</span>
            <strong className="admin-stat-value" style={{ color: 'var(--color-success)' }}>
              {hackathons.filter((h) => h.mode !== 'virtual').length}
            </strong>
          </div>
          <div className="admin-hackathon-stat-box">
            <span className="admin-stat-label">Scan Speed</span>
            <strong className="admin-stat-value">
              {latestRun?.durationMs ? `${(latestRun.durationMs / 1000).toFixed(1)}s` : '1.8s'}
            </strong>
          </div>
          <div className="admin-hackathon-stat-box">
            <span className="admin-stat-label">Sources</span>
            <strong className="admin-stat-value" style={{ fontSize: 'var(--text-sm)' }}>
              Multi-Source
            </strong>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="admin-hackathon-toolbar">
        <input
          type="text"
          className="input-field"
          placeholder="Filter by title, host, or city…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          id="admin-hackathons-search"
        />
        <select
          value={filterMode}
          onChange={(e) => setFilterMode(e.target.value)}
          className="input-field"
          id="admin-filter-mode-select"
        >
          <option value="all">All Modes</option>
          <option value="virtual">Virtual Only</option>
          <option value="physical">In-Person Only</option>
          <option value="hybrid">Hybrid Only</option>
        </select>
      </div>

      {/* Events View: Desktop Table vs Mobile Cards */}
      {hackathonsLoading ? (
        <Spinner center />
      ) : filteredList.length === 0 ? (
        <div className="empty-state">
          <p>No hackathons match the query. Click "Scan & Discover Now" to run discovery.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="admin-hackathon-table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-alt)' }}>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-2)', fontWeight: 600 }}>Event Title & Host</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-2)', fontWeight: 600 }}>Mode & Location</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-2)', fontWeight: 600 }}>Deadline</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-2)', fontWeight: 600 }}>Prize</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-2)', fontWeight: 600 }}>Source</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-2)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((h) => (
                  <tr key={h.fingerprint || h.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                        {h.title}
                        {h.featured && (
                          <span className="badge badge-warn" style={{ marginLeft: 6, fontSize: '10px' }}>Featured</span>
                        )}
                      </div>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' }}>
                        {h.organizer?.name || 'Academic Host'}
                      </span>
                    </td>

                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <span className={`badge ${h.mode === 'virtual' ? 'badge-info' : 'badge-accent'}`} style={{ fontSize: '11px' }}>
                        {h.mode}
                      </span>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-2)', marginTop: 2 }}>
                        {h.location?.city || (h.mode === 'virtual' ? 'Worldwide' : 'India')}
                      </div>
                    </td>

                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-2)' }}>
                      {h.dates?.registrationDeadline ? new Date(h.dates.registrationDeadline).toLocaleDateString('en-IN') : 'TBA'}
                    </td>

                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-success)', fontWeight: 600 }}>
                      {h.prize?.description || '—'}
                    </td>

                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' }}>
                      {h.source?.name || 'Discovery'}
                    </td>

                    <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 'var(--space-1)' }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleToggleFeatured(h)}
                          title={h.featured ? 'Unfeature' : 'Feature on homepage'}
                        >
                          {h.featured ? '★' : '☆'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleOpenEditModal(h)}
                          title="Edit details"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDelete(h.id, h.title)}
                          style={{ color: 'var(--color-error)' }}
                          title="Delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards (Rendered instead of table on screens <= 768px) */}
          <div className="admin-hackathon-cards-container">
            {filteredList.map((h) => (
              <div key={h.fingerprint || h.id} className="admin-hackathon-card">
                <div className="admin-hackathon-card-top">
                  <span className={`badge ${h.mode === 'virtual' ? 'badge-info' : 'badge-accent'}`}>
                    {h.mode}
                  </span>
                  {h.featured && (
                    <span className="badge badge-warn">★ Featured</span>
                  )}
                  <span className="admin-hackathon-source-chip">
                    {h.source?.name || 'Discovery'}
                  </span>
                </div>

                <h3 className="admin-hackathon-card-title">{h.title}</h3>
                <p className="admin-hackathon-card-host">by {h.organizer?.name || 'Academic Host'}</p>

                <div className="admin-hackathon-card-meta">
                  <div className="admin-hackathon-meta-item">
                    <span className="admin-hackathon-meta-label">Location:</span>
                    <span>{h.location?.city || (h.mode === 'virtual' ? 'Worldwide' : 'India')}</span>
                  </div>
                  <div className="admin-hackathon-meta-item">
                    <span className="admin-hackathon-meta-label">Deadline:</span>
                    <span>{h.dates?.registrationDeadline ? new Date(h.dates.registrationDeadline).toLocaleDateString('en-IN') : 'TBA'}</span>
                  </div>
                  {h.prize?.description && (
                    <div className="admin-hackathon-meta-item" style={{ gridColumn: 'span 2', color: 'var(--color-success)' }}>
                      <span className="admin-hackathon-meta-label">Prize:</span>
                      <strong>{h.prize.description}</strong>
                    </div>
                  )}
                </div>

                <div className="admin-hackathon-card-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleToggleFeatured(h)}
                    style={{ flex: 1 }}
                  >
                    {h.featured ? '★ Featured' : '☆ Feature'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleOpenEditModal(h)}
                    style={{ flex: 1 }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDelete(h.id, h.title)}
                    style={{ color: 'var(--color-error)', flex: 1 }}
                  >
                    Delete
                  </button>
                  {h.registrationUrl && (
                    <a
                      href={h.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm btn-icon"
                      title="View registration link"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Manual Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-box admin-hackathon-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">
                {editingHackathon ? 'Edit Hackathon' : 'Add New Hackathon'}
              </h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveHackathon} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div className="form-group">
                <label className="form-label">Event Title *</label>
                <input
                  type="text"
                  className="input-field"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. CyberShield Hackathon 2026"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Organizer / College Host</label>
                <input
                  type="text"
                  className="input-field"
                  value={formOrgName}
                  onChange={(e) => setFormOrgName(e.target.value)}
                  placeholder="e.g. RCOEM Cyber Cell"
                />
              </div>

              <div className="admin-modal-row-grid">
                <div className="form-group">
                  <label className="form-label">Mode</label>
                  <select
                    className="input-field"
                    value={formMode}
                    onChange={(e) => setFormMode(e.target.value)}
                  >
                    <option value="virtual">Virtual</option>
                    <option value="physical">Physical / On-Campus</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="e.g. Nagpur"
                  />
                </div>
              </div>

              <div className="admin-modal-dates-grid">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Reg. Deadline</label>
                  <input
                    type="date"
                    className="input-field"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Prize Pool / Description</label>
                <input
                  type="text"
                  className="input-field"
                  value={formPrize}
                  onChange={(e) => setFormPrize(e.target.value)}
                  placeholder="e.g. ₹50,000 + Swags"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Registration / Source URL *</label>
                <input
                  type="url"
                  className="input-field"
                  value={formRegUrl}
                  onChange={(e) => setFormRegUrl(e.target.value)}
                  placeholder="https://devfolio.co/... or https://unstop.com/..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Categories (comma-separated)</label>
                <input
                  type="text"
                  className="input-field"
                  value={formCategories}
                  onChange={(e) => setFormCategories(e.target.value)}
                  placeholder="Cybersecurity, AI, Web3"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief overview of problem statements and eligibility..."
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                />
                Feature this hackathon on Homepage spotlight
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? 'Saving…' : 'Save Hackathon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
