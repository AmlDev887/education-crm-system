import { X, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react'
import clsx from 'clsx'

// ─── AVATAR ───────────────────────────────────────────────────────
export function Avatar({ name = '', color = '#7c3aed', size = 'md' }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const s = size === 'sm'
    ? 'w-7 h-7 text-[10px] rounded-md'
    : size === 'lg'
    ? 'w-11 h-11 text-sm rounded-xl'
    : 'w-8 h-8 text-[11px] rounded-lg'
  return (
    <div
      className={`${s} flex items-center justify-center font-mono font-semibold flex-shrink-0 relative overflow-hidden`}
      style={{
        background: `linear-gradient(135deg, ${color}22, ${color}10)`,
        border: `1px solid ${color}35`,
        color,
        boxShadow: `0 0 10px ${color}15`,
      }}
    >
      {/* Subtle shine */}
      <div className="absolute inset-0 opacity-30"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)' }} />
      <span className="relative">{initials}</span>
    </div>
  )
}

// ─── BADGE ────────────────────────────────────────────────────────
const BADGE_STYLES = {
  paid:     { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)',  color: '#34d399', dot: '#10b981' },
  unpaid:   { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',   color: '#f87171', dot: '#ef4444' },
  active:   { bg: 'rgba(124,58,237,0.1)',  border: 'rgba(124,58,237,0.25)',  color: '#c4b5fd', dot: '#7c3aed' },
  upcoming: { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  color: '#fbbf24', dot: '#f59e0b' },
  present:  { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)',  color: '#34d399', dot: '#10b981' },
  absent:   { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',   color: '#f87171', dot: '#ef4444' },
  pending:  { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  color: '#fbbf24', dot: '#f59e0b' },
}

export function Badge({ type = 'default', children }) {
  const style = BADGE_STYLES[type]
  if (!style) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff50' }}>
        {children}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-md"
      style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.color }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: style.dot, boxShadow: `0 0 4px ${style.dot}` }} />
      {children}
    </span>
  )
}

// ─── STAT CARD ────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon: Icon, accent = '#7c3aed', delta }) {
  const isUp = delta >= 0
  return (
    <div className="card flex-1 min-w-[160px] p-5 relative overflow-hidden group transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>

      {/* Corner glow */}
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accent}08 0%, transparent 70%)`, transform: 'translate(30%, -30%)' }} />

      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] font-mono tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {label}
        </span>
        {Icon && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${accent}12`, border: `1px solid ${accent}25` }}>
            <Icon size={13} style={{ color: accent }} />
          </div>
        )}
      </div>

      <div className="text-[28px] font-bold leading-none tracking-tight mb-2" style={{ color: accent }}>
        {value}
      </div>

      {sub && <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{sub}</div>}

      {delta !== undefined && (
        <div className={`flex items-center gap-1 text-[11px] mt-2 font-mono`}
          style={{ color: isUp ? '#34d399' : '#f87171' }}>
          {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {Math.abs(delta)}% vs last month
        </div>
      )}
    </div>
  )
}

// ─── BUTTON ───────────────────────────────────────────────────────
export function Button({ children, onClick, variant = 'primary', size, disabled, type = 'button', className = '' }) {
  const styles = {
    primary: {
      base: 'text-white font-medium text-sm px-4 py-2 rounded-lg transition-all duration-150 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed',
      style: {
        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
        border: '1px solid rgba(167,139,250,0.3)',
        boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
      }
    },
    ghost: {
      base: 'font-medium text-sm px-4 py-2 rounded-lg transition-all duration-150 flex items-center gap-2',
      style: {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'rgba(255,255,255,0.5)',
      }
    },
    danger: {
      base: 'font-medium text-sm px-3 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1.5',
      style: {
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.2)',
        color: '#f87171',
      }
    },
  }

  const s = styles[variant] || styles.ghost
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(s.base, size === 'sm' && 'text-xs px-3 py-1.5', className)}
      style={s.style}
    >
      {children}
    </button>
  )
}

// ─── INPUT ────────────────────────────────────────────────────────
export function Input({ label, name, value, onChange, placeholder, type = 'text', required, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[10px] font-mono tracking-[0.15em] uppercase"
          style={{ color: 'rgba(255,255,255,0.35)' }}>
          {label}{required && <span style={{ color: '#f87171' }}> *</span>}
        </label>
      )}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-field"
        required={required}
      />
      {error && <span className="text-[11px]" style={{ color: '#f87171' }}>{error}</span>}
    </div>
  )
}

// ─── SELECT ───────────────────────────────────────────────────────
export function Select({ label, name, value, onChange, options = [], required, error, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[10px] font-mono tracking-[0.15em] uppercase"
          style={{ color: 'rgba(255,255,255,0.35)' }}>
          {label}{required && <span style={{ color: '#f87171' }}> *</span>}
        </label>
      )}
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="input-field appearance-none pr-8 cursor-pointer"
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o =>
            typeof o === 'string'
              ? <option key={o} value={o}>{o}</option>
              : <option key={o.value} value={o.value}>{o.label}</option>
          )}
        </select>
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'rgba(255,255,255,0.3)' }} />
      </div>
      {error && <span className="text-[11px]" style={{ color: '#f87171' }}>{error}</span>}
    </div>
  )
}

// ─── MODAL ────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, width = 'max-w-lg' }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`w-full ${width} max-h-[90vh] overflow-y-auto rounded-xl animate-slide-up`}
        style={{
          background: 'linear-gradient(160deg, #131318, #0f0f14)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.08)',
        }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            {/* Accent dot */}
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#7c3aed', boxShadow: '0 0 6px #7c3aed' }} />
            <span className="font-semibold text-sm" style={{ color: '#f0eef9' }}>{title}</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}
          >
            <X size={13} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ─── EMPTY STATE ─────────────────────────────────────────────────
export function Empty({ message = 'Данных нет', icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      {Icon && (
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}>
          <Icon size={20} style={{ color: 'rgba(255,255,255,0.2)' }} />
        </div>
      )}
      <span className="text-sm text-center max-w-[240px] leading-relaxed"
        style={{ color: 'rgba(255,255,255,0.25)' }}>
        {message}
      </span>
    </div>
  )
}

// ─── SPINNER ─────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-full"
          style={{ border: '2px solid rgba(124,58,237,0.1)' }} />
        <div className="absolute inset-0 rounded-full animate-spin"
          style={{ border: '2px solid transparent', borderTopColor: '#7c3aed', boxShadow: '0 0 8px rgba(124,58,237,0.4)' }} />
      </div>
      <span className="text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
        загрузка...
      </span>
    </div>
  )
}

// ─── PAGE HEADER ─────────────────────────────────────────────────
export function PageHeader({ tag, title, children }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        {/* Tag with accent line */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-px" style={{ background: '#7c3aed' }} />
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase" style={{ color: '#7c3aed99' }}>
            {tag}
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#f0eef9' }}>{title}</h1>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}

// ─── FILTER TABS ─────────────────────────────────────────────────
export function FilterTabs({ options, value, onChange }) {
  return (
    <div className="flex gap-1 p-1 rounded-lg"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}>
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
          style={value === o.value ? {
            background: 'rgba(124,58,237,0.2)',
            border: '1px solid rgba(124,58,237,0.3)',
            color: '#c4b5fd',
          } : {
            background: 'transparent',
            border: '1px solid transparent',
            color: 'rgba(255,255,255,0.35)',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ─── DIVIDER ─────────────────────────────────────────────────────
export function Divider({ label }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
      {label && <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>{label}</span>}
      <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
    </div>
  )
}

// ─── COURSE COLOR MAP ────────────────────────────────────────────
const COURSE_COLORS = {
  'UI/UX Design':    '#7c3aed',
  'Python Backend':  '#38bdf8',
  'Data Science':    '#10b981',
  'React Frontend':  '#f59e0b',
  'Mobile Dev':      '#f43f5e',
  'Cybersecurity':   '#6366f1',
}
export const getCourseColor = (course) => COURSE_COLORS[course] || '#7c3aed'

// ─── FORMAT HELPERS ──────────────────────────────────────────────
export const fmtUZS = (n) => new Intl.NumberFormat('uz-UZ').format(n ?? 0) + ' UZS'
export const fmtM   = (n) => (n / 1_000_000).toFixed(1) + 'M'
