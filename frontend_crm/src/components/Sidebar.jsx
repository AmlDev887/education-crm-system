import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, BookOpen, CreditCard,
  CalendarCheck, BarChart3, Settings,
  WifiOff, Wifi, Zap
} from 'lucide-react'

const NAV = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard',  tag: '01' },
  { to: '/students',   icon: Users,           label: 'Студенты',   tag: '02' },
  { to: '/courses',    icon: BookOpen,        label: 'Курсы',      tag: '03' },
  { to: '/payments',   icon: CreditCard,      label: 'Платежи',    tag: '04' },
  { to: '/attendance', icon: CalendarCheck,   label: 'Посещаемость', tag: '05' },
  { to: '/reports',    icon: BarChart3,       label: 'Отчёты',     tag: '06' },
]

export default function Sidebar() {
  return (
    <aside className="w-[220px] flex flex-col h-screen sticky top-0 flex-shrink-0 relative"
      style={{
        background: 'linear-gradient(180deg, #0d0d12 0%, #0a0a0f 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}>

      {/* Subtle grid texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 24px), repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 24px)',
        }} />

      {/* Accent glow top */}
      <div className="absolute top-0 left-0 right-0 h-[1px]"
        style={{ background: 'linear-gradient(90deg, transparent, #7c3aed60, transparent)' }} />

      {/* ── Logo ── */}
      <div className="relative px-5 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Logo icon */}
        <div className="flex items-center gap-3 mb-0.5">
          <div className="relative w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #7c3aed22, #6d28d910)',
              border: '1px solid #7c3aed40',
              boxShadow: '0 0 12px #7c3aed18',
            }}>
            <Zap size={14} style={{ color: '#a78bfa' }} />
            {/* Corner accent */}
            <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-bl-sm rounded-tr-sm"
              style={{ background: '#7c3aed' }} />
          </div>
          <div>
            <div className="font-bold text-[15px] leading-none tracking-tight" style={{ color: '#f0eef9' }}>
              CRM Studio
            </div>
            <div className="text-[9px] font-mono tracking-[0.2em] uppercase mt-0.5" style={{ color: '#7c3aed99' }}>
              Educational
            </div>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-0.5">

        <div className="flex items-center gap-2 px-2 mb-3 mt-1">
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.04)' }} />
          <span className="text-[9px] font-mono tracking-[0.25em] uppercase" style={{ color: '#ffffff25' }}>
            меню
          </span>
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.04)' }} />
        </div>

        {NAV.map(({ to, icon: Icon, label, tag }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'text-violet-200'
                  : 'text-txt-muted hover:text-txt'
              }`
            }
            style={({ isActive }) => isActive ? {
              background: 'linear-gradient(90deg, rgba(124,58,237,0.15), rgba(124,58,237,0.05))',
              border: '1px solid rgba(124,58,237,0.25)',
              boxShadow: 'inset 0 0 12px rgba(124,58,237,0.05)',
            } : {
              background: 'transparent',
              border: '1px solid transparent',
            }}
          >
            {({ isActive }) => (
              <>
                {/* Active left bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4/5 rounded-r-full"
                    style={{ background: 'linear-gradient(180deg, #a78bfa, #7c3aed)' }} />
                )}

                {/* Icon wrapper */}
                <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  isActive ? '' : 'group-hover:bg-white/[0.04]'
                }`}
                  style={isActive ? {
                    background: 'rgba(124,58,237,0.2)',
                    boxShadow: '0 0 8px rgba(124,58,237,0.3)',
                  } : {}}>
                  <Icon size={13} style={{ color: isActive ? '#c4b5fd' : '#ffffff40' }}
                    className="transition-all duration-200 group-hover:!text-[#ffffff70]" />
                </div>

                <span className="flex-1 text-[13px]">{label}</span>

                {/* Tag + active dot */}
                {isActive ? (
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#7c3aed', boxShadow: '0 0 6px #7c3aed' }} />
                ) : (
                  <span className="text-[9px] font-mono opacity-0 group-hover:opacity-30 transition-opacity"
                    style={{ color: '#fff' }}>
                    {tag}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* ── System section ── */}
        <div className="flex items-center gap-2 px-2 mb-3 mt-5">
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.04)' }} />
          <span className="text-[9px] font-mono tracking-[0.25em] uppercase" style={{ color: '#ffffff25' }}>
            система
          </span>
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.04)' }} />
        </div>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
              isActive ? 'text-violet-200' : 'text-txt-muted hover:text-txt'
            }`
          }
          style={({ isActive }) => isActive ? {
            background: 'linear-gradient(90deg, rgba(124,58,237,0.15), rgba(124,58,237,0.05))',
            border: '1px solid rgba(124,58,237,0.25)',
          } : {
            background: 'transparent',
            border: '1px solid transparent',
          }}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4/5 rounded-r-full"
                  style={{ background: 'linear-gradient(180deg, #a78bfa, #7c3aed)' }} />
              )}
              <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                style={isActive ? { background: 'rgba(124,58,237,0.2)', boxShadow: '0 0 8px rgba(124,58,237,0.3)' } : {}}>
                <Settings size={13} style={{ color: isActive ? '#c4b5fd' : '#ffffff40' }} />
              </div>
              <span className="flex-1 text-[13px]">Настройки</span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#7c3aed', boxShadow: '0 0 6px #7c3aed' }} />
              )}
            </>
          )}
        </NavLink>
      </nav>

      {/* ── Footer ── */}
      <div className="relative p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {/* API endpoint */}
        <div className="text-[9px] font-mono tracking-[0.15em] uppercase mb-1.5"
          style={{ color: '#ffffff25' }}>
          API Endpoint
        </div>
        <div className="flex items-center gap-2 rounded-lg px-2.5 py-2 mb-2.5"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: '#ef4444', boxShadow: '0 0 4px #ef4444' }} />
          <span className="text-[11px] font-mono truncate" style={{ color: '#ffffff40' }}>
            localhost:8000
          </span>
        </div>

        {/* Status row */}
        <div className="flex items-center gap-1.5">
          <WifiOff size={10} style={{ color: '#ffffff20' }} />
          <span className="text-[10px] font-mono" style={{ color: '#ffffff20' }}>
            offline · mock mode
          </span>
        </div>
      </div>
    </aside>
  )
}
