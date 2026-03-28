import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Send, Loader2, ArrowLeft, AlertTriangle, Minus, CheckCircle, Tag, FileText, AlignLeft, ChevronDown } from 'lucide-react';
import API_BASE from '../api';
import { useToast } from '../components/Toast';

const CATEGORIES = [
  { value: 'IT Support',           label: 'IT Support',                icon: '🖥️',  desc: 'General IT help & troubleshooting' },
  { value: 'Network',              label: 'Network & Connectivity',    icon: '🌐',  desc: 'Internet, VPN, Wi-Fi, LAN issues' },
  { value: 'Software',             label: 'Software & Applications',   icon: '💿',  desc: 'App crashes, bugs, licensing' },
  { value: 'Hardware',             label: 'Hardware & Equipment',      icon: '🖨️',  desc: 'Laptops, printers, peripherals' },
  { value: 'Cybersecurity',        label: 'Cybersecurity',             icon: '🔒',  desc: 'Security alerts, breaches, access' },
  { value: 'HR',                   label: 'HR & Employee Relations',   icon: '👥',  desc: 'Workplace, conduct, onboarding' },
  { value: 'Payroll',              label: 'Payroll & Benefits',        icon: '💰',  desc: 'Salary, reimbursements, deductions' },
  { value: 'Facilities',           label: 'Facilities & Maintenance',  icon: '🏢',  desc: 'Office, HVAC, repairs, cleaning' },
  { value: 'Finance',              label: 'Finance & Accounting',      icon: '📊',  desc: 'Invoices, expenses, budgets' },
  { value: 'Legal',                label: 'Legal & Compliance',        icon: '⚖️',  desc: 'Contracts, policies, regulations' },
  { value: 'Operations',           label: 'Operations & Logistics',    icon: '🔧',  desc: 'Processes, workflows, supply chain' },
  { value: 'Customer Service',     label: 'Customer Service',          icon: '🎧',  desc: 'Client complaints, support tickets' },
  { value: 'Procurement',          label: 'Procurement & Vendors',     icon: '📦',  desc: 'Orders, suppliers, contracts' },
  { value: 'Training',             label: 'Training & Development',    icon: '📚',  desc: 'Learning, certifications, LMS' },
  { value: 'Other',                label: 'Other',                     icon: '📋',  desc: 'Anything not covered above' },
];

const HIGH_PRIORITY_CATEGORIES = ['Cybersecurity'];

const HIGH_KEYWORDS = [
  "urgent", "critical", "down", "breach", "outage", "emergency", "blocked", "severe",
  "crash", "not working", "failure", "immediate", "broken", "hacked", "compromised",
  "unauthorized", "data loss", "system down", "network down", "no access", "locked out",
  "virus", "malware", "ransomware", "corrupted", "offline", "not responding",
  "cannot login", "can't login", "cannot access", "can't access", "stop working",
  "stopped working", "not loading", "won't load", "unable to", "production down",
  "deadline", "revenue loss", "customer impact", "service unavailable", "server down",
  "database down", "complete failure", "total outage", "fire", "flood", "injury",
  "discrimination", "harassment", "fraud", "data breach", "exposed", "leaked",
];

const MEDIUM_KEYWORDS = [
  "slow", "delay", "issue", "error", "problem", "intermittent", "degraded", "partial",
  "unstable", "warning", "failed", "buggy", "glitch", "wrong", "incorrect", "unexpected",
  "occasionally", "sometimes", "difficult", "not connecting", "loading slowly",
  "performance", "timeout", "freeze", "freezing", "hanging", "lag", "lagging",
  "unresponsive", "missing", "not showing", "not displaying", "broken link",
  "page not found", "404", "500", "authentication", "permission", "access denied",
  "incorrect salary", "missing payment", "overcharge", "billing error", "dispute",
  "not received", "damaged", "late delivery", "complaint", "dissatisfied",
];

const detectPriority = (title, description, category) => {
  if (HIGH_PRIORITY_CATEGORIES.includes(category)) return 'High';
  const text = (title + ' ' + description).toLowerCase();
  if (HIGH_KEYWORDS.some(kw => text.includes(kw))) return 'High';
  if (MEDIUM_KEYWORDS.some(kw => text.includes(kw))) return 'Medium';
  return 'Low';
};

const PRIORITY_META = {
  High:   { bg: '#fef2f2', border: '#fecaca', color: '#b91c1c', dot: '#ef4444', label: 'High Priority',   sub: 'Critical — requires immediate attention',  Icon: AlertTriangle },
  Medium: { bg: '#fffbeb', border: '#fde68a', color: '#b45309', dot: '#f59e0b', label: 'Medium Priority', sub: 'Moderate — will be addressed soon',          Icon: Minus },
  Low:    { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d', dot: '#22c55e', label: 'Low Priority',    sub: 'Standard SLA — scheduled for next cycle',   Icon: CheckCircle },
};

const CreateComplaint = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'IT Support',
    priority: 'Low',
  });

  React.useEffect(() => {
    const detected = detectPriority(formData.title, formData.description, formData.category);
    if (detected !== formData.priority) {
      setFormData(prev => ({ ...prev, priority: detected }));
    }
  }, [formData.title, formData.description, formData.category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'description') setCharCount(value.length);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.title.trim().length < 5) {
      showToast('Title must be at least 5 characters', 'error');
      return;
    }
    if (formData.description.trim().length < 10) {
      showToast('Description must be at least 10 characters', 'error');
      return;
    }
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await axios.post(`${API_BASE}/api/complaints`, { ...formData, userId: user?.id });
      showToast('Issue submitted successfully!', 'success');
      navigate('/complaints');
    } catch (err) {
      console.error(err);
      showToast('Failed to submit. Please ensure the backend is running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const pm = PRIORITY_META[formData.priority];
  const PriorityIcon = pm.Icon;
  const selectedCat = CATEGORIES.find(c => c.value === formData.category);

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <Link
          to="/complaints"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.01em', transition: 'color 0.2s' }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={14} /> Back to Issues
        </Link>
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={22} color="var(--primary)" />
          </div>
          <div>
            <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem' }}>Report a New Issue</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Fill in the details below. Priority is automatically detected as you type.
            </p>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="page-container" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit} noValidate>

          {/* ── Section: Details ─────────────────────── */}
          <div style={{ marginBottom: '0.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlignLeft size={15} color="var(--primary)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>Issue Details</span>
          </div>

          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label htmlFor="title" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Issue Summary <span style={{ color: '#ef4444' }}>*</span></span>
              <span style={{ fontWeight: 400, color: formData.title.length < 5 && formData.title.length > 0 ? '#ef4444' : '#94a3b8', fontSize: '0.78rem' }}>
                {formData.title.length} chars
              </span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-control"
              required
              placeholder="e.g. Unable to access company VPN since this morning"
              value={formData.title}
              onChange={handleChange}
              maxLength={150}
            />
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
              A clear, one-line summary helps the team triage faster.
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="description" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Detailed Description <span style={{ color: '#ef4444' }}>*</span></span>
              <span style={{ fontWeight: 400, color: charCount < 10 && charCount > 0 ? '#ef4444' : '#94a3b8', fontSize: '0.78rem' }}>
                {charCount} / 2000
              </span>
            </label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              rows="6"
              required
              placeholder="Describe the issue in detail — when it started, what you tried, affected systems or users, error messages, screenshots if any..."
              value={formData.description}
              onChange={handleChange}
              maxLength={2000}
              style={{ resize: 'vertical', minHeight: '130px' }}
            />
          </div>

          {/* ── Section: Classification ───────────────── */}
          <div style={{ marginBottom: '0.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Tag size={15} color="var(--primary)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>Classification</span>
          </div>

          {/* Category + Priority row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="category">Department / Category <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <select
                  id="category"
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.5rem', appearance: 'none', cursor: 'pointer' }}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.icon}  {cat.label}</option>
                  ))}
                </select>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', pointerEvents: 'none' }}>
                  {selectedCat?.icon}
                </span>
                <ChevronDown size={15} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              </div>
              {selectedCat && (
                <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>{selectedCat.desc}</p>
              )}
            </div>

            {/* Auto-detected priority card */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#374151' }}>
                Auto-detected Priority
              </label>
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: `1.5px solid ${pm.border}`,
                background: pm.bg,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.3s ease',
              }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: `${pm.dot}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <PriorityIcon size={16} color={pm.color} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: pm.color }}>{pm.label}</div>
                  <div style={{ fontSize: '0.72rem', color: pm.color, opacity: 0.8, marginTop: '1px' }}>{pm.sub}</div>
                </div>
              </div>
              <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                Updates automatically as you type.
              </p>
            </div>
          </div>

          {/* Tip box */}
          <div style={{ marginTop: '1.75rem', padding: '0.875rem 1.125rem', borderRadius: '10px', background: '#f0f9ff', border: '1px solid #bae6fd', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '1px' }}>💡</span>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#0369a1', lineHeight: 1.6 }}>
              <strong>Tip:</strong> Include keywords like <em>"urgent"</em>, <em>"not working"</em>, or <em>"system down"</em> in your description to automatically escalate priority. Cybersecurity issues are always marked High.
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem' }}>
            <Link
              to="/complaints"
              className="btn"
              style={{ flex: '0 0 auto', minWidth: '110px', height: '46px', background: '#f8fafc', color: '#475569', border: '1px solid var(--border)', fontWeight: 500 }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="btn"
              disabled={loading}
              style={{ flex: 1, height: '46px', fontSize: '0.9rem', letterSpacing: '0.01em' }}
            >
              {loading
                ? <><Loader2 className="animate-spin" size={17} /> Submitting…</>
                : <><Send size={17} /> Submit Issue</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateComplaint;
