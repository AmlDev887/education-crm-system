import { useState, useEffect } from 'react'
import { Users, BookOpen, DollarSign, AlertCircle, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts'
import { api } from '@/api/client'
import { MONTHLY_STATS, COURSES, store } from '@/store/data'
import { StatCard, Badge, Avatar, getCourseColor, fmtUZS, fmtM, Spinner } from '@/components/ui'
import { PageHeader } from '@/components/ui'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-3 border border-border-2 rounded-lg px-3 py-2 text-xs">
      <div className="font-mono text-txt-muted mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.dataKey === 'revenue' ? fmtM(p.value) : p.value}</div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getStats(), api.getStudents()]).then(([s, st]) => {
      setStats(s); setStudents(st.slice(0, 5)); setLoading(false)
    })
  }, [])

  if (loading) return <div className="p-8"><Spinner /></div>

  return (
    <div className="p-8 max-w-[1200px] animate-fade-in">
      <PageHeader tag="Overview" title="Dashboard" />

      {/* Stat Cards */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <StatCard label="Total Students"  value={stats.totalStudents} icon={Users}      accent="#eae8e3" delta={12} sub={`${stats.paid} paid · ${stats.unpaid} unpaid`} />
        <StatCard label="Active Courses"  value={stats.activeCourses} icon={BookOpen}   accent="#a78bfa" delta={0}  sub="Currently running" />
        <StatCard label="Total Revenue"   value={fmtM(stats.totalRevenue)} icon={DollarSign} accent="#10b981" delta={18} sub="Sum (UZS)" />
        <StatCard label="Unpaid Students" value={stats.unpaid}        icon={AlertCircle} accent="#f43f5e" delta={-5} sub="Pending payment" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* Bar chart — students */}
        <div className="card col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-sm font-semibold">Monthly Registrations</div>
              <div className="text-xs text-txt-muted mt-0.5">New students per month</div>
            </div>
            <Badge>2024–2025</Badge>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={MONTHLY_STATS} barSize={22}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1e1e28" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#696874', fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#696874', fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.06)' }} />
              <Bar dataKey="students" name="Students" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Area */}
        <div className="card p-5">
          <div className="text-sm font-semibold mb-1">Revenue Trend</div>
          <div className="text-xs text-txt-muted mb-5">Monthly UZS</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={MONTHLY_STATS}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#696874', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#282835' }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Recent Students */}
        <div className="card">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold">Recent Students</span>
            <a href="/students" className="text-[11px] text-accent hover:text-violet-300 font-mono">View all →</a>
          </div>
          <div>
            {students.map((s, i) => (
              <div key={s.id} className={`flex items-center gap-3 px-5 py-3 hover:bg-bg-3 transition-colors ${i < students.length - 1 ? 'border-b border-border/60' : ''}`}>
                <Avatar name={s.name} color={getCourseColor(s.course)} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{s.name}</div>
                  <div className="text-xs text-txt-muted truncate">{s.course}</div>
                </div>
                <Badge type={s.status}>{s.status}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Courses Overview */}
        <div className="card">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold">Active Courses</span>
            <a href="/courses" className="text-[11px] text-accent hover:text-violet-300 font-mono">View all →</a>
          </div>
          <div>
            {COURSES.filter(c => c.status === 'active').map((c, i, arr) => (
              <div key={c.id} className={`flex items-center gap-3 px-5 py-3 hover:bg-bg-3 transition-colors ${i < arr.length - 1 ? 'border-b border-border/60' : ''}`}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{c.title}</div>
                  <div className="text-xs text-txt-muted">{c.instructor}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-medium">{c.students}</div>
                  <div className="text-[10px] text-txt-muted">students</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
