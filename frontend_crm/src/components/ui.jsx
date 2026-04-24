import { X, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

// ─── AVATAR ───────────────────────────────────────────────────────
export function Avatar({ name = '', color = '#7c3aed', size = 'md' }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const s = size === 'sm' ? 'w-7 h-7 text-[10px] rounded' : size === 'lg' ? 'w-11 h-11 text-sm rounded-lg' : 'w-8 h-8 text-[11px] rounded-lg'
  return (
    <div className={`${s} flex items-center justify-center font-mono font-medium flex-shrink-0`}
      style={{ background: `${color}20`, border: `1px solid ${color}40`, color }}>
      {initials}
    </div>
  )
}

// ─── BADGE ────────────────────────────────────────────────────────
export function Badge({ type = 'default', children }) {
  const cls = {
    paid: 'badge-paid', unpaid: 'badge-unpaid', active: 'badge-active',
    upcoming: 'badge-upcoming', present: 'badge-present', absent: 'badge-absent',
    default: 'text-[11px] font-mono px-2 py-0.5 rounded bg-bg-3 text-txt-muted border border-border',
  }
  return <span className={cls[type] || cls.default}>{children}</span>
}

// ─── STAT CARD ────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon: Icon, accent, delta }) {
  return (
    <div className="card flex-1 min-w-[160px] p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="label mb-0">{label}</span>
        {Icon && <Icon size={14} className="text-txt-dim mt-0.5" />}
      </div>
      <div className="text-[28px] font-bold leading-none" style={{ color: accent }}>{value}</div>
      {sub && <div className="text-xs text-txt-muted mt-2">{sub}</div>}
      {delta !== undefined && (
        <div className={`text-[11px] mt-2 font-mono ${delta >= 0 ? 'text-success' : 'text-danger'}`}>
          {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}% vs last month
        </div>
      )}
    </div>
  )
}

// ─── BUTTON ───────────────────────────────────────────────────────
export function Button({ children, onClick, variant = 'primary', size, disabled, type = 'button', className = '' }) {
  const base = {
    primary: 'btn-primary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={clsx(base[variant], size === 'sm' && 'text-xs px-3 py-1.5', className)}>
      {children}
    </button>
  )
}

// ─── INPUT ────────────────────────────────────────────────────────
export function Input({ label, name, value, onChange, placeholder, type = 'text', required, error }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="label">{label}{required && <span className="text-danger"> *</span>}</label>}
      <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="input-field" required={required} />
      {error && <span className="text-[11px] text-danger">{error}</span>}
    </div>
  )
}

// ─── SELECT ───────────────────────────────────────────────────────
export function Select({ label, name, value, onChange, options = [], required, error, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="label">{label}{required && <span className="text-danger"> *</span>}</label>}
      <div className="relative">
        <select name={name} value={value} onChange={onChange} required={required}
          className="input-field appearance-none pr-8 cursor-pointer">
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => (
            typeof o === 'string'
              ? <option key={o} value={o}>{o}</option>
              : <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted pointer-events-none" />
      </div>
      {error && <span className="text-[11px] text-danger">{error}</span>}
    </div>
  )
}

// ─── MODAL ────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, width = 'max-w-lg' }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`bg-bg-2 border border-border-2 rounded-xl w-full ${width} max-h-[90vh] overflow-y-auto animate-slide-up`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <span className="font-semibold text-sm">{title}</span>
          <button onClick={onClose} className="text-txt-muted hover:text-txt transition-colors p-1 rounded-lg hover:bg-bg-3">
            <X size={16} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ─── EMPTY STATE ─────────────────────────────────────────────────
export function Empty({ message = 'No data found', icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-txt-muted gap-3">
      {Icon && <Icon size={28} className="text-txt-dim" />}
      <span className="text-sm">{message}</span>
    </div>
  )
}

// ─── LOADING ─────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-5 h-5 border-2 border-border-2 border-t-accent rounded-full animate-spin" />
    </div>
  )
}

// ─── PAGE HEADER ─────────────────────────────────────────────────
export function PageHeader({ tag, title, children }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <div className="page-tag">{tag}</div>
        <h1 className="page-title">{title}</h1>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}

// ─── FILTER TABS ─────────────────────────────────────────────────
export function FilterTabs({ options, value, onChange }) {
  return (
    <div className="flex gap-1.5 bg-bg-2 border border-border rounded-lg p-1">
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={clsx('px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150',
            value === o.value ? 'bg-bg-4 text-txt' : 'text-txt-muted hover:text-txt')}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ─── COURSE COLOR MAP ────────────────────────────────────────────
const COURSE_COLORS = {
  'UI/UX Design': '#7c3aed', 'Python Backend': '#38bdf8',
  'Data Science': '#10b981', 'React Frontend': '#f59e0b',
  'Mobile Dev': '#f43f5e', 'Cybersecurity': '#6366f1',
}
export const getCourseColor = (course) => COURSE_COLORS[course] || '#7c3aed'

// ─── FORMAT HELPERS ──────────────────────────────────────────────
export const fmtUZS = (n) => new Intl.NumberFormat('uz-UZ').format(n) + ' UZS'
export const fmtM   = (n) => (n / 1_000_000).toFixed(1) + 'M'
