import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, BookOpen, CreditCard, CalendarCheck, BarChart3, Settings, Wifi, WifiOff } from 'lucide-react'

const NAV = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/students',   icon: Users,           label: 'Students'   },
  { to: '/courses',    icon: BookOpen,        label: 'Courses'    },
  { to: '/payments',   icon: CreditCard,      label: 'Payments'   },
  { to: '/attendance', icon: CalendarCheck,   label: 'Attendance' },
  { to: '/reports',    icon: BarChart3,       label: 'Reports'    },
]

export default function Sidebar() {
  return (
    <aside className="w-[220px] bg-bg-1 border-r border-border flex flex-col h-screen sticky top-0 flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="text-accent font-mono text-[11px] tracking-widest uppercase mb-0.5">Educational</div>
        <div className="font-bold text-lg leading-tight">CRM Studio</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="text-[10px] font-mono text-txt-dim tracking-widest uppercase px-2 mb-2 mt-1">Menu</div>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-accent-dim text-violet-300 border border-accent-border'
                  : 'text-txt-muted hover:text-txt hover:bg-bg-3 border border-transparent'
              }`
            }>
            {({ isActive }) => (
              <>
                <Icon size={15} className={isActive ? 'text-violet-400' : 'text-txt-dim group-hover:text-txt-muted'} />
                <span>{label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />}
              </>
            )}
          </NavLink>
        ))}

        <div className="text-[10px] font-mono text-txt-dim tracking-widest uppercase px-2 mb-2 mt-4">System</div>
        <NavLink to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all duration-150 group ${
              isActive ? 'bg-accent-dim text-violet-300 border border-accent-border' : 'text-txt-muted hover:text-txt hover:bg-bg-3 border border-transparent'
            }`
          }>
          <Settings size={15} className="text-txt-dim group-hover:text-txt-muted" />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-[10px] font-mono text-txt-dim mb-1.5">API Endpoint</div>
        <div className="text-[11px] font-mono text-txt-muted bg-bg-2 border border-border rounded px-2 py-1.5 truncate">
          localhost:8000
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <WifiOff size={11} className="text-txt-dim" />
          <span className="text-[11px] text-txt-dim">Backend offline (mock)</span>
        </div>
      </div>
    </aside>
  )
}
